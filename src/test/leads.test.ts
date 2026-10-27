import { describe, expect, it } from "vitest";
import { leadSchema, SERVICES, statusKeys, updateLeadSchema, whatsappContactUrl } from "@/lib/leads";
import { SERVICE_MESSAGES, captureReady } from "@/lib/contact-config";

const valid = { name: "Persona de prueba", phone: "+51 947 833 628", service_interest: SERVICES[0], consent_processing: true, submission_id: "c3e34d50-47cf-41aa-86ba-410031983d61" };
describe("Lead capture rules", () => {
  it("requires name", () => { expect(leadSchema.safeParse({ ...valid, name: "" }).success).toBe(false); });
  it("requires phone", () => { expect(leadSchema.safeParse({ ...valid, phone: "" }).success).toBe(false); });
  it("requires one of the four services", () => { expect(leadSchema.safeParse({ ...valid, service_interest: "Otro" }).success).toBe(false); expect(SERVICES).toHaveLength(4); });
  it("accepts a request without commercial consent", () => { const result = leadSchema.parse(valid); expect(result.consent_contact).toBe(false); });
  it("requires consent to process the inquiry separately", () => { expect(leadSchema.safeParse({ ...valid, consent_processing: false, consent_contact: true }).success).toBe(false); });
  it("rejects injected medical fields", () => { expect(leadSchema.safeParse({ ...valid, diagnosis: "private" }).success).toBe(false); });
  it("limits the optional comment", () => { expect(leadSchema.safeParse({ ...valid, message: "a".repeat(1001) }).success).toBe(false); });
  it("does not let visitors set commercial status", () => { expect(leadSchema.safeParse({ ...valid, status: "converted" }).success).toBe(false); });
  it("supports exactly the seven requested pipeline states", () => { expect([...statusKeys]).toEqual(["new", "contacted", "conversation_started", "call_scheduled", "proposal_sent", "converted", "not_converted"]); expect(updateLeadSchema.safeParse({ id: valid.submission_id, status: "owner", internal_notes: "", last_contact_at: null, next_follow_up_at: null }).success).toBe(false); });
  it("uses the requested contextual WhatsApp messages", () => { expect(SERVICE_MESSAGES).toEqual(["Hola, quisiera información sobre el servicio de acompañamiento a citas médicas de Norita.", "Hola, quisiera información sobre las sesiones de neuroestimulación de Norita.", "Hola, quisiera información sobre el entrenamiento de fuerza para adultos mayores."]); });
  it("validates contact numbers before opening WhatsApp", () => { expect(whatsappContactUrl("javascript:alert(1)")).toBeUndefined(); expect(new URL(whatsappContactUrl("947833628") ?? "").pathname).toBe("/51947833628"); });
  it("keeps collection disabled before approved privacy and antispam configuration", () => { expect(captureReady).toBe(false); });
});