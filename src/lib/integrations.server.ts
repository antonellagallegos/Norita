// Outbox worker. Jobs are queued by a database trigger for every new lead and processed here,
// right after the form submission and again by the scheduled retry. Dry-run is the default:
// nothing leaves Supabase unless INTEGRATIONS_MODE=live and the integration is configured.
// team_notification sends through Resend (RESEND_API_KEY, LEAD_NOTIFICATION_EMAIL); crm_sync is not built yet.
import { createHash, timingSafeEqual } from "node:crypto";

type JobKind = "crm_sync" | "team_notification";
type Job = { id: string; lead_id: string; kind: string; attempts: number };
type LeadForIntegrations = { id: string; created_at: string; name: string; phone: string; email: string | null; service_interest: string; source: string; status: string; consent_contact: boolean; commercial_opt_out_at: string | null };

const MAX_ATTEMPTS = 8;

// The only lead fields allowed to reach the commercial CRM. Free-text comments, district,
// internal notes and anything about the older adult's health stay in Supabase.
export const CRM_FIELDS = ["id", "created_at", "name", "phone", "email", "service_interest", "source", "status", "consent_contact", "commercial_opt_out_at"] as const;

export function integrationsMode(): "live" | "dry-run" {
  return process.env["INTEGRATIONS_MODE"] === "live" ? "live" : "dry-run";
}

export function buildCrmPayload(lead: LeadForIntegrations) {
  return {
    lead_id: lead.id, created_at: lead.created_at, name: lead.name, phone: lead.phone, email: lead.email,
    service_interest: lead.service_interest, source: lead.source, status: lead.status,
    // Promotions only with explicit consent and no later opt-out.
    marketing_allowed: lead.consent_contact && !lead.commercial_opt_out_at,
  };
}

// Admin panel of the environment that produced the lead. A Preview email never falls back to the
// Production URL; without a usable Preview URL the email only describes where to look.
export function adminPanelUrl(): string | null {
  const env = process.env["VERCEL_ENV"];
  const host = env === "production" ? process.env["VERCEL_PROJECT_PRODUCTION_URL"] : env === "preview" ? process.env["VERCEL_BRANCH_URL"] : undefined;
  return host && /^[a-z0-9.-]+$/i.test(host) ? `https://${host}/admin/leads` : null;
}

// Email content goes through a third-party provider, so it carries no personal data. It must also be
// identical on every retry of a job: Resend rejects a reused idempotency key with a different payload.
export function buildTeamNotification(lead: LeadForIntegrations) {
  const production = process.env["VERCEL_ENV"] === "production";
  const url = adminPanelUrl();
  const where = url ? `Revísalo en el panel privado: ${url}` : production ? "Revísalo en el panel privado /admin/leads." : "Revísalo en /admin/leads de la web de pruebas (Preview).";
  return { subject: `${production ? "" : "[Pruebas] "}Nuevo contacto en Norita`, text: `Hay un nuevo contacto interesado en: ${lead.service_interest}.\n\n${where}` };
}

class NotConfigured extends Error {}
class DeliveryError extends Error {
  constructor(readonly code: string) { super(code); }
}

const RESEND_URL = "https://api.resend.com/emails";
const RESEND_TIMEOUT_MS = 10_000;
// Resend's test sender; it only delivers to the Resend account owner's address.
const DEFAULT_FROM = "Norita <onboarding@resend.dev>";

async function sendTeamNotification(lead: LeadForIntegrations, jobId: string) {
  const apiKey = process.env["RESEND_API_KEY"];
  const to = process.env["LEAD_NOTIFICATION_EMAIL"]?.trim();
  if (!apiKey || !to) throw new NotConfigured("team_notification not configured");
  const { subject, text } = buildTeamNotification(lead);
  let response: Response;
  try {
    response = await fetch(RESEND_URL, {
      method: "POST",
      // Stable per job, so every retry of this job reuses it. Resend keeps keys for 24 hours.
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": `team_notification/${jobId}` },
      body: JSON.stringify({ from: process.env["LEAD_NOTIFICATION_FROM"] || DEFAULT_FROM, to: [to], subject, text }),
      signal: AbortSignal.timeout(RESEND_TIMEOUT_MS),
    });
  } catch {
    throw new DeliveryError("delivery_failed");
  }
  if (response.ok) return "done" as const;
  // Only Resend's error name is read; its message may echo the recipient.
  const name = await response.json().then((body: { name?: unknown }) => (typeof body?.name === "string" ? body.name : ""), () => "");
  if (response.status === 429 || response.status >= 500 || name === "concurrent_idempotent_requests") throw new DeliveryError("delivery_failed");
  throw new DeliveryError(`rejected_${response.status}`);
}

async function deliver(kind: JobKind, lead: LeadForIntegrations, jobId: string) {
  const payload = kind === "crm_sync" ? buildCrmPayload(lead) : buildTeamNotification(lead);
  if (integrationsMode() === "dry-run") {
    // Field names only: logs never contain the values.
    console.info(`[integrations] dry-run ${kind} lead=${lead.id} fields=${Object.keys(payload).join(",")}`);
    return "dry_run" as const;
  }
  if (kind === "team_notification") return sendTeamNotification(lead, jobId);
  throw new NotConfigured(`${kind} not configured`);
}

export async function runIntegrationJobs({ leadId, limit = 25 }: { leadId?: string; limit?: number } = {}) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const claimed = await supabaseAdmin.rpc("claim_integration_jobs", { p_limit: limit, ...(leadId ? { p_lead_id: leadId } : {}) });
  if (claimed.error) throw new Error("Could not claim integration jobs");
  const result = { processed: 0, failed: 0 };
  for (const job of (claimed.data ?? []) as Job[]) {
    try {
      if (job.kind !== "crm_sync" && job.kind !== "team_notification") throw new NotConfigured("unknown job kind");
      const lead = await supabaseAdmin.from("leads").select(CRM_FIELDS.join(",")).eq("id", job.lead_id).single();
      if (lead.error || !lead.data) throw new Error("lead not found");
      const status = await deliver(job.kind, lead.data as unknown as LeadForIntegrations, job.id);
      await supabaseAdmin.from("integration_jobs").update({ status, processed_at: new Date().toISOString(), last_error: null }).eq("id", job.id);
      result.processed++;
    } catch (error) {
      // Error codes only; provider responses may echo personal data.
      const code = error instanceof NotConfigured ? "not_configured" : error instanceof DeliveryError ? error.code : "delivery_failed";
      const backoffMinutes = Math.min(2 ** job.attempts * 5, 24 * 60);
      await supabaseAdmin.from("integration_jobs").update({ status: "failed", last_error: code, next_attempt_at: new Date(Date.now() + backoffMinutes * 60_000).toISOString() }).eq("id", job.id);
      console.warn(`[integrations] ${job.kind} job=${job.id} attempt=${job.attempts}/${MAX_ATTEMPTS} error=${code}`);
      result.failed++;
    }
  }
  return result;
}

// Vercel Cron sends "Authorization: Bearer <CRON_SECRET>".
export function isAuthorizedCron(request: Request): boolean {
  const secret = process.env["CRON_SECRET"];
  const token = /^Bearer (\S+)$/.exec(request.headers.get("authorization") ?? "")?.[1];
  if (!secret || !token) return false;
  const digest = (value: string) => createHash("sha256").update(value, "utf8").digest();
  return timingSafeEqual(digest(token), digest(secret));
}
