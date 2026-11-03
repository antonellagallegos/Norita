import { createServerFn } from "@tanstack/react-start";
import { caregiverApplicationSchema } from "@/lib/caregiver-fields";
import { applicationsReady, CAREGIVER_PRIVACY_VERSION } from "@/lib/caregiver-config";
import { parseWithoutValues } from "@/lib/leads";

// Public endpoint of the caregiver application form. Same protections as the family form (gate, honeypot,
// rate limit, Turnstile, idempotent submission ID) but its own table: applications never touch `leads`,
// the CRM outbox or team lead notifications. Never returns an application or personal data.
export const submitCaregiverApplication = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => parseWithoutValues(caregiverApplicationSchema, input))
  .handler(async ({ data }) => {
    if (!applicationsReady)
      throw new Error("Las postulaciones aún no están habilitadas. Inténtalo más tarde.");
    if (data.website) throw new Error("No pudimos validar tu postulación.");
    const secret = process.env["TURNSTILE_SECRET_KEY"];
    if (!secret || !data.captcha) throw new Error("Completa la verificación de seguridad.");
    const { getRequest } = await import("@tanstack/react-start/server");
    const { CAREGIVER_TURNSTILE_ACTION, clientAddress, rateLimitKey, verifyTurnstile } =
      await import("@/lib/lead-capture.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const request = getRequest();
    // Shares the attempts table with the family form, under its own key, so each form has its own limit.
    const allowed = await supabaseAdmin.rpc("register_lead_attempt", {
      p_client_hash: await rateLimitKey(`caregiver:${clientAddress(request)}`, secret),
    });
    if (allowed.error) throw new Error("No pudimos guardar tu postulación. Inténtalo de nuevo.");
    if (allowed.data !== true)
      throw new Error(
        "Hemos recibido varias postulaciones desde tu conexión. Inténtalo más tarde.",
      );
    if (
      !(await verifyTurnstile({
        secret,
        token: data.captcha,
        submissionId: data.submission_id,
        hostname: new URL(request.url).hostname,
        action: CAREGIVER_TURNSTILE_ACTION,
      }))
    )
      throw new Error("La verificación ha caducado. Inténtalo de nuevo.");
    const existing = await supabaseAdmin
      .from("caregiver_applications")
      .select("id")
      .eq("submission_id", data.submission_id)
      .maybeSingle();
    if (existing.error) throw new Error("No pudimos guardar tu postulación. Inténtalo de nuevo.");
    if (existing.data) return { success: true };
    const duplicate = await supabaseAdmin
      .from("caregiver_applications")
      .select("id")
      .eq("phone", data.phone)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (duplicate.error) throw new Error("No pudimos guardar tu postulación. Inténtalo de nuevo.");
    const now = new Date().toISOString();
    const { error } = await supabaseAdmin.from("caregiver_applications").insert({
      name: data.name,
      phone: data.phone,
      country: data.country,
      city: data.city,
      district: data.district,
      experience_years: data.experience_years,
      experience_types: data.experience_types,
      training: data.training,
      availability_days: data.availability_days,
      availability_slots: data.availability_slots,
      services: data.services,
      adult_confirmed: true,
      consent_processing: true,
      consent_talent_pool: data.consent_talent_pool,
      talent_pool_timestamp: data.consent_talent_pool ? now : null,
      privacy_version: CAREGIVER_PRIVACY_VERSION,
      duplicate_of: duplicate.data?.id ?? null,
      submission_id: data.submission_id,
    });
    if (error && error.code !== "23505")
      throw new Error("No pudimos guardar tu postulación. Inténtalo de nuevo en unos minutos.");
    return { success: true };
  });
