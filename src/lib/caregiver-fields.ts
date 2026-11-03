// Fields of the caregiver application form (/cuidadores), shared by browser and server validation.
// Applications are a separate funnel from family leads: own table, own privacy version, no CRM sync.
// Only options, no free text, and nothing beyond what selection needs: no identity documents, no health
// data, no exact address or age.
import { z } from "zod";
import {
  LEAD_COUNTRIES,
  PHONE_PREFIX_KEYS,
  normalizePhone,
  type LeadCountry,
} from "@/lib/lead-fields";
import { SERVICES } from "@/lib/leads";

// The five services of the family site. A caregiver says which ones they can provide.
export const CAREGIVER_SERVICES = SERVICES.slice(0, 5) as unknown as readonly [string, ...string[]];

// Coverage by district (Lima Metropolitana, Callao) or localidad (Bogotá D.C.), to offer nearby work.
export const CAREGIVER_AREAS: Record<LeadCountry, Record<string, readonly string[]>> = {
  PE: {
    "Lima Metropolitana": [
      "Ancón",
      "Ate",
      "Barranco",
      "Breña",
      "Carabayllo",
      "Cercado de Lima",
      "Chaclacayo",
      "Chorrillos",
      "Cieneguilla",
      "Comas",
      "El Agustino",
      "Independencia",
      "Jesús María",
      "La Molina",
      "La Victoria",
      "Lince",
      "Los Olivos",
      "Lurigancho-Chosica",
      "Lurín",
      "Magdalena del Mar",
      "Miraflores",
      "Pachacámac",
      "Pucusana",
      "Pueblo Libre",
      "Puente Piedra",
      "Punta Hermosa",
      "Punta Negra",
      "Rímac",
      "San Bartolo",
      "San Borja",
      "San Isidro",
      "San Juan de Lurigancho",
      "San Juan de Miraflores",
      "San Luis",
      "San Martín de Porres",
      "San Miguel",
      "Santa Anita",
      "Santa María del Mar",
      "Santa Rosa",
      "Santiago de Surco",
      "Surquillo",
      "Villa El Salvador",
      "Villa María del Triunfo",
    ],
    Callao: [
      "Bellavista",
      "Callao",
      "Carmen de la Legua Reynoso",
      "La Perla",
      "La Punta",
      "Mi Perú",
      "Ventanilla",
    ],
  },
  CO: {
    "Bogotá D.C.": [
      "Antonio Nariño",
      "Barrios Unidos",
      "Bosa",
      "Chapinero",
      "Ciudad Bolívar",
      "Engativá",
      "Fontibón",
      "Kennedy",
      "La Candelaria",
      "Los Mártires",
      "Puente Aranda",
      "Rafael Uribe Uribe",
      "San Cristóbal",
      "Santa Fe",
      "Suba",
      "Sumapaz",
      "Teusaquillo",
      "Tunjuelito",
      "Usaquén",
      "Usme",
    ],
  },
};
export const areaLabel = (country: string) => (country === "CO" ? "Localidad" : "Distrito");
export const isValidArea = (country: string, city: string, district: string) =>
  country in CAREGIVER_AREAS &&
  Boolean(CAREGIVER_AREAS[country as LeadCountry][city]?.includes(district));

// Keys are stored; labels are shown. The database checks the same keys (migration 0007).
export const EXPERIENCE_YEARS = [
  { value: "none", label: "Aún no tengo experiencia" },
  { value: "lt1", label: "Menos de 1 año" },
  { value: "1to3", label: "De 1 a 3 años" },
  { value: "3to5", label: "De 3 a 5 años" },
  { value: "gt5", label: "Más de 5 años" },
] as const;
export const EXPERIENCE_TYPES = [
  { value: "family", label: "Cuidando a un familiar" },
  { value: "private", label: "Con familias particulares" },
  { value: "institution", label: "En una residencia, clínica o institución" },
  { value: "volunteer", label: "Como voluntario/a" },
] as const;
export const TRAINING = [
  { value: "nursing_technician", label: "Técnico/a en enfermería" },
  { value: "certified_caregiver", label: "Curso o certificación de cuidador/a" },
  { value: "first_aid", label: "Primeros auxilios" },
  { value: "physical_therapy", label: "Terapia física o rehabilitación" },
  { value: "other", label: "Otra formación relacionada" },
  { value: "none", label: "Aún no tengo formación formal" },
] as const;
export const AVAILABILITY_DAYS = [
  { value: "weekdays", label: "Lunes a viernes" },
  { value: "saturday", label: "Sábados" },
  { value: "sunday", label: "Domingos" },
] as const;
export const AVAILABILITY_SLOTS = [
  { value: "morning", label: "Mañanas" },
  { value: "afternoon", label: "Tardes" },
  { value: "evening", label: "Noches" },
  { value: "night", label: "Turnos de noche" },
] as const;

type Option = { readonly value: string };
const values = <T extends readonly Option[]>(options: T) =>
  options.map((o) => o.value) as [T[number]["value"], ...T[number]["value"][]];
const pick = <T extends readonly Option[]>(options: T, message: string) =>
  z
    .array(z.enum(values(options)))
    .min(1, message)
    .max(options.length)
    .transform((list) => [...new Set(list)]);

export const caregiverApplicationSchema = z
  .object({
    name: z.string().trim().min(2, "Introduce tu nombre completo.").max(100),
    phone_prefix: z.enum(PHONE_PREFIX_KEYS, {
      errorMap: () => ({ message: "Selecciona el prefijo de tu país." }),
    }),
    phone: z.string().trim().min(1, "Introduce tu número de teléfono.").max(24),
    country: z.enum(LEAD_COUNTRIES.map((c) => c.value) as ["PE", "CO"], {
      errorMap: () => ({ message: "Selecciona Perú o Colombia." }),
    }),
    city: z.string().trim().min(1, "Selecciona la ciudad.").max(100),
    district: z.string().trim().min(1, "Selecciona tu zona.").max(100),
    experience_years: z.enum(values(EXPERIENCE_YEARS), {
      errorMap: () => ({ message: "Indica tu experiencia." }),
    }),
    experience_types: z
      .array(z.enum(values(EXPERIENCE_TYPES)))
      .max(EXPERIENCE_TYPES.length)
      .default([])
      .transform((list) => [...new Set(list)]),
    training: pick(TRAINING, "Selecciona al menos una opción."),
    availability_days: pick(AVAILABILITY_DAYS, "Selecciona al menos un día."),
    availability_slots: pick(AVAILABILITY_SLOTS, "Selecciona al menos una franja."),
    services: z
      .array(z.enum(CAREGIVER_SERVICES as unknown as [string, ...string[]]))
      .min(1, "Selecciona al menos un servicio.")
      .max(CAREGIVER_SERVICES.length)
      .transform((list) => [...new Set(list)]),
    adult_confirmed: z.literal(true, {
      errorMap: () => ({ message: "Debes ser mayor de 18 años para postular." }),
    }),
    consent_processing: z.literal(true, {
      errorMap: () => ({ message: "Autoriza el tratamiento de tus datos para postular." }),
    }),
    consent_talent_pool: z.boolean().default(false),
    website: z.string().max(200).default(""),
    captcha: z.string().max(4096).default(""),
    submission_id: z.string().uuid(),
  })
  .strict()
  .superRefine((data, ctx) => {
    const phone = normalizePhone(data.phone_prefix, data.phone);
    if (!phone.ok)
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["phone"], message: phone.message });
    if (!(data.city in (CAREGIVER_AREAS[data.country] ?? {})))
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["city"],
        message: "Selecciona una ciudad de la lista.",
      });
    else if (!isValidArea(data.country, data.city, data.district))
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["district"],
        message: "Selecciona una zona de la lista.",
      });
    if (data.training.includes("none") && data.training.length > 1)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["training"],
        message: "«Aún no tengo formación formal» no se combina con otras opciones.",
      });
    if (data.experience_years === "none" && data.experience_types.length > 0)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["experience_types"],
        message: "Si aún no tienes experiencia, deja el tipo de experiencia sin marcar.",
      });
  })
  .transform(({ phone_prefix, ...data }) => {
    const phone = normalizePhone(phone_prefix, data.phone);
    return { ...data, phone: phone.ok ? phone.digits : data.phone };
  });
export type CaregiverApplicationInput = z.input<typeof caregiverApplicationSchema>;
