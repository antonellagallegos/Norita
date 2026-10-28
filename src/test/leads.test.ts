import { describe, expect, it } from "vitest";
import { leadSchema, SERVICES, statusKeys, updateLeadSchema, whatsappContactUrl } from "@/lib/leads";
import { SERVICE_MESSAGES, captureReady } from "@/lib/contact-config";
import { LOCALITIES, OTHER_LOCALITY, normalizePhone } from "@/lib/lead-fields";

const valid = { name: "Persona de prueba", email: "prueba@example.com", phone_prefix: "PE", phone: "+51 987 654 321", service_interest: SERVICES[0], country: "PE", district: "Miraflores", consent_processing: true, submission_id: "c3e34d50-47cf-41aa-86ba-410031983d61" };
describe("Lead capture rules", () => {
  it("requires name", () => { expect(leadSchema.safeParse({ ...valid, name: "" }).success).toBe(false); });
  it("requires phone", () => { expect(leadSchema.safeParse({ ...valid, phone: "" }).success).toBe(false); });
  it("requires one of the listed services", () => { expect(leadSchema.safeParse({ ...valid, service_interest: "Otro" }).success).toBe(false); expect(SERVICES).toHaveLength(6); for (const s of ["Recogida de medicamentos", "Acompañamiento fines de semana"]) expect(leadSchema.safeParse({ ...valid, service_interest: s }).success).toBe(true); });
  it("accepts a request without commercial consent", () => { const result = leadSchema.parse(valid); expect(result.consent_contact).toBe(false); });
  it("requires consent to process the inquiry separately", () => { expect(leadSchema.safeParse({ ...valid, consent_processing: false, consent_contact: true }).success).toBe(false); });
  it("rejects injected medical fields", () => { expect(leadSchema.safeParse({ ...valid, diagnosis: "private" }).success).toBe(false); });
  it("limits the optional comment", () => { expect(leadSchema.safeParse({ ...valid, message: "a".repeat(1001) }).success).toBe(false); });
  it("does not let visitors set commercial status", () => { expect(leadSchema.safeParse({ ...valid, status: "converted" }).success).toBe(false); });
  it("supports exactly the seven requested pipeline states", () => { expect([...statusKeys]).toEqual(["new", "contacted", "conversation_started", "call_scheduled", "proposal_sent", "converted", "not_converted"]); expect(updateLeadSchema.safeParse({ id: valid.submission_id, status: "owner", internal_notes: "", last_contact_at: null, next_follow_up_at: null }).success).toBe(false); });
  it("uses the requested contextual WhatsApp messages", () => { expect(SERVICE_MESSAGES).toEqual(["Hola, quisiera información sobre el servicio de acompañamiento a citas médicas de Norita.", "Hola, quisiera información sobre las sesiones de neuroestimulación de Norita.", "Hola, quisiera información sobre el entrenamiento de fuerza para adultos mayores."]); });
  it("validates contact numbers before opening WhatsApp", () => { expect(whatsappContactUrl("javascript:alert(1)")).toBeUndefined(); expect(new URL(whatsappContactUrl("947833628") ?? "").pathname).toBe("/51947833628"); });
  it("keeps collection disabled before approved privacy and antispam configuration", () => { expect(captureReady).toBe(false); });
  it.each(["name", "email", "phone", "country", "district"])("requires %s", (field) => { expect(leadSchema.safeParse({ ...valid, [field]: "" }).success).toBe(false); });
  it("validates the email format", () => { expect(leadSchema.safeParse({ ...valid, email: "no-es-un-correo" }).success).toBe(false); expect(leadSchema.parse({ ...valid, email: " Prueba@Example.COM " }).email).toBe("prueba@example.com"); });
  it("only accepts Peru or Colombia for the older adult's location", () => { expect(leadSchema.safeParse({ ...valid, country: "AR", district: OTHER_LOCALITY }).success).toBe(false); expect(leadSchema.safeParse({ ...valid, country: "CO", district: "Chapinero" }).success).toBe(true); });
  it("requires a locality that belongs to the selected country", () => { expect(leadSchema.safeParse({ ...valid, country: "CO", district: "Miraflores" }).success).toBe(false); expect(leadSchema.safeParse({ ...valid, district: "Inventado" }).success).toBe(false); expect(leadSchema.safeParse({ ...valid, district: OTHER_LOCALITY }).success).toBe(true); });
  it("covers Lima Metropolitana (43 + 7 districts) and the 20 localidades of Bogotá", () => { expect(LOCALITIES.PE[0]?.items).toHaveLength(43); expect(LOCALITIES.PE[1]?.items).toHaveLength(7); expect(LOCALITIES.CO[0]?.items).toHaveLength(20); });
  it("stores the WhatsApp number as E.164 digits without the separate prefix field", () => { const out = leadSchema.parse(valid); expect(out.phone).toBe("51987654321"); expect(out).not.toHaveProperty("phone_prefix"); });
});

describe("WhatsApp number normalization", () => {
  it.each([
    ["PE", "987 654 321", "51987654321"],
    ["PE", "+51 987-654-321", "51987654321"],
    ["PE", "51987654321", "51987654321"],
    ["PE", "0051 987654321", "51987654321"],
    ["CO", "300 123 4567", "573001234567"],
    ["CO", "+57 (300) 123 4567", "573001234567"],
    ["CO", "573001234567", "573001234567"],
    ["US", "(415) 555-2671", "14155552671"],
    ["ES", "+34 612 345 678", "34612345678"],
  ])("%s %s -> %s", (prefix, input, digits) => { expect(normalizePhone(prefix, input)).toEqual({ ok: true, digits }); });
  it.each([
    ["PE", "12345"],
    ["PE", "887 654 321"],
    ["CO", "200 123 4567"],
    ["PE", "+57 300 123 4567"],
    ["PE", "98765abcd"],
    ["XX", "987654321"],
  ])("rejects %s %s", (prefix, input) => { expect(normalizePhone(prefix, input).ok).toBe(false); });
});