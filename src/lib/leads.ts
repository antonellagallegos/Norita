import { z } from "zod";

export const SERVICES = ["Acompañamiento a citas médicas", "Neuroestimulación / Gimnasio Mental", "Entrenamiento de fuerza", "Quiero conocer varios servicios"] as const;
export const STATUSES = { new: "Nuevo lead", contacted: "Contactado", conversation_started: "Conversación iniciada", call_scheduled: "Llamada agendada", proposal_sent: "Propuesta enviada", converted: "Cliente", not_converted: "No concretado" } as const;
export const statusKeys = ["new", "contacted", "conversation_started", "call_scheduled", "proposal_sent", "converted", "not_converted"] as const;
export const FREQUENCIES = ["Servicio puntual", "Servicio recurrente", "Todavía estoy evaluando"] as const;
export const phoneSchema = z.string().trim().max(24).regex(/^\+?[\d\s()-]{7,24}$/, "Introduce un teléfono válido.").transform(v => v.replace(/[^\d]/g, "")).refine(v => v.length >= 7 && v.length <= 15, "Introduce entre 7 y 15 dígitos.");
export const leadSchema = z.object({
  name: z.string().trim().min(2, "Introduce tu nombre.").max(100),
  phone: phoneSchema,
  service_interest: z.enum(SERVICES),
  district: z.string().trim().max(100).default(""),
  frequency: z.union([z.enum(FREQUENCIES), z.literal("")]).default(""),
  preferred_contact: z.enum(["WhatsApp", "Llamada telefónica"]).default("WhatsApp"),
  message: z.string().trim().max(1000).default(""),
  consent_contact: z.boolean().default(false),
  consent_processing: z.literal(true, { errorMap: () => ({ message: "Autoriza el tratamiento de tu solicitud para enviarla." }) }),
  website: z.string().max(200).default(""),
  captcha: z.string().max(4096).default(""),
  submission_id: z.string().uuid(),
}).strict();
export type LeadInput = z.input<typeof leadSchema>;
// Validation errors can end up in server logs; report field names only, never submitted values.
export function parseWithoutValues<T extends z.ZodTypeAny>(schema: T, input: unknown): z.output<T> {
  const parsed = schema.safeParse(input);
  if (parsed.success) return parsed.data;
  throw new Error(`Datos no válidos: ${[...new Set(parsed.error.issues.map(i => String(i.path[0] ?? "solicitud")))].join(", ")}`);
}
export const updateLeadSchema = z.object({ id: z.string().uuid(), status: z.enum(statusKeys), internal_notes: z.string().max(5000), last_contact_at: z.string().datetime().nullable(), next_follow_up_at: z.string().datetime().nullable() }).strict();
export type Lead = { id: string; created_at: string; name: string; phone: string; email: string | null; service_interest: string; district: string | null; frequency: string | null; preferred_contact: string; message: string | null; source: string; status: keyof typeof STATUSES; consent_contact: boolean; consent_timestamp: string | null; consent_processing: boolean; processing_timestamp: string | null; privacy_version: string | null; last_contact_at: string | null; next_follow_up_at: string | null; internal_notes: string; duplicate_of: string | null; commercial_opt_out_at: string | null; commercial_opt_out_source: string | null };
export const whatsappContactUrl = (phone: string) => {
  const parsed = phoneSchema.safeParse(phone);
  if (!parsed.success) return undefined;
  const digits = parsed.data.length === 9 ? `51${parsed.data}` : parsed.data;
  return `https://wa.me/${digits}?text=${encodeURIComponent("Hola, te contactamos de Norita en respuesta a tu consulta sobre nuestros servicios.")}`;
};