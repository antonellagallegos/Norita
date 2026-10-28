import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { leadSchema, parseWithoutValues, updateLeadSchema, type Lead } from "@/lib/leads";
import { captureReady, PRIVACY_VERSION } from "@/lib/contact-config";

export const submitLead = createServerFn({ method: "POST" }).inputValidator((input: unknown) => parseWithoutValues(leadSchema, input)).handler(async ({ data }) => {
  if (!captureReady) throw new Error("El formulario aún no está habilitado. Inténtalo más tarde.");
  if (data.website) throw new Error("No pudimos validar tu solicitud.");
  const secret = process.env["TURNSTILE_SECRET_KEY"];
  if (!secret || !data.captcha) throw new Error("Completa la verificación de seguridad.");
  const { getRequest } = await import("@tanstack/react-start/server");
  const { clientAddress, rateLimitKey, verifyTurnstile } = await import("@/lib/lead-capture.server");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const request = getRequest();
  const allowed = await supabaseAdmin.rpc("register_lead_attempt", { p_client_hash: await rateLimitKey(clientAddress(request), secret) });
  if (allowed.error) throw new Error("No pudimos guardar tu solicitud. Inténtalo de nuevo.");
  if (allowed.data !== true) throw new Error("Hemos recibido varias solicitudes desde tu conexión. Inténtalo más tarde.");
  if (!await verifyTurnstile({ secret, token: data.captcha, submissionId: data.submission_id, hostname: new URL(request.url).hostname })) throw new Error("La verificación ha caducado. Inténtalo de nuevo.");
  // This public endpoint permits only a validated insert; never returns a lead or PII.
  const existing = await supabaseAdmin.from("leads").select("id").eq("submission_id", data.submission_id).maybeSingle();
  if (existing.error) throw new Error("No pudimos guardar tu solicitud. Inténtalo de nuevo.");
  if (existing.data) return { success: true };
  const duplicate = await supabaseAdmin.from("leads").select("id").eq("phone", data.phone).order("created_at", { ascending: true }).limit(1).maybeSingle();
  if (duplicate.error) throw new Error("No pudimos guardar tu solicitud. Inténtalo de nuevo.");
  const { data: inserted, error } = await supabaseAdmin.from("leads").insert({
    name: data.name, email: data.email, phone: data.phone, service_interest: data.service_interest,
    country: data.country, district: data.district, frequency: data.frequency || null,
    preferred_contact: data.preferred_contact, message: data.message || null,
    consent_contact: data.consent_contact, consent_timestamp: data.consent_contact ? new Date().toISOString() : null,
    consent_processing: true, privacy_version: PRIVACY_VERSION,
    duplicate_of: duplicate.data?.id ?? null, submission_id: data.submission_id,
    source: "website", status: "new",
  }).select("id").single();
  if (error && error.code !== "23505") throw new Error("No pudimos guardar tu solicitud. Inténtalo de nuevo en unos minutos.");
  // The lead is already saved; integrations are best effort here and retried by the scheduled job.
  if (inserted) {
    try {
      const { runIntegrationJobs } = await import("@/lib/integrations.server");
      await runIntegrationJobs({ leadId: inserted.id });
    } catch { /* retried later */ }
  }
  return { success: true };
});

export const getLeadAccess = createServerFn().handler(async () => {
  const { resolveLeadAccess } = await import("@/lib/leads-access.server");
  const access = await resolveLeadAccess();
  return { user: access.user, authorized: Boolean(access.client) };
});

const listSchema = z.object({ search: z.string().trim().max(100).default(""), service: z.string().max(100).default(""), status: z.string().max(40).default(""), page: z.number().int().min(0).max(100000).default(0), ascending: z.boolean().default(false) });
export const listLeads = createServerFn({ method: "POST" }).inputValidator((input: unknown) => parseWithoutValues(listSchema, input)).handler(async ({ data }) => {
  const { requireLeadAdmin } = await import("@/lib/leads-access.server");
  const { client } = await requireLeadAdmin();
  const audit = await client.rpc("log_lead_list");
  if (audit.error) throw new Error("No pudimos cargar los contactos.");
  let query = client.from("leads").select("*", { count: "exact" }).order("created_at", { ascending: data.ascending }).range(data.page * 25, data.page * 25 + 24);
  if (data.service) query = query.eq("service_interest", data.service);
  if (data.status) query = query.eq("status", data.status);
  if (data.search) {
    const safe = data.search.replace(/[^\p{L}\p{N}\s+]/gu, "").trim();
    if (safe) query = query.or(`name.ilike.%${safe}%,phone.ilike.%${safe}%`);
  }
  const { data: rows, count, error } = await query;
  if (error) throw new Error("No pudimos cargar los contactos.");
  const metrics = await client.rpc("lead_metrics");
  if (metrics.error) throw new Error("No pudimos cargar los indicadores.");
  return { rows: (rows ?? []) as Lead[], count: count ?? 0, metrics: metrics.data as { total: number; new: number; call_scheduled: number; proposal_sent: number; converted: number; average_first_contact_hours: number | null; by_source: Record<string, number>; by_service: Record<string, number> } };
});

export const updateLead = createServerFn({ method: "POST" }).inputValidator((input: unknown) => parseWithoutValues(updateLeadSchema, input)).handler(async ({ data }) => {
  const { requireLeadAdmin } = await import("@/lib/leads-access.server");
  const { client } = await requireLeadAdmin();
  const { id, ...fields } = data;
  const { data: row, error } = await client.from("leads").update(fields).eq("id", id).select("*").single();
  if (error || !row) throw new Error("No pudimos guardar los cambios. Inténtalo nuevamente.");
  return row as Lead;
});

// Opting out covers every inquiry with the same phone; it cannot be undone from the panel.
export const recordCommercialOptOut = createServerFn({ method: "POST" }).inputValidator((input: unknown) => parseWithoutValues(z.object({ id: z.string().uuid() }).strict(), input)).handler(async ({ data }) => {
  const { requireLeadAdmin } = await import("@/lib/leads-access.server");
  const { client } = await requireLeadAdmin();
  const { error } = await client.rpc("record_commercial_opt_out", { p_lead_id: data.id, p_source: "admin" });
  if (error) throw new Error("No pudimos registrar la baja. Inténtalo nuevamente.");
  return { success: true };
});
