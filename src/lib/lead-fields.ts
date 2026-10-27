// Shared field data for the public lead form, used by browser and server validation alike.

// WhatsApp prefixes. Peru and Colombia first; others cover family members living abroad.
// `national` validates the number without the country code: strict for countries with a well-known mobile
// format, a length range otherwise.
export const PHONE_PREFIXES = [
  { key: "PE", label: "Perú", code: "51", national: /^9\d{8}$/, hint: "un celular peruano de 9 dígitos que empiece por 9" },
  { key: "CO", label: "Colombia", code: "57", national: /^3\d{9}$/, hint: "un celular colombiano de 10 dígitos que empiece por 3" },
  { key: "AR", label: "Argentina", code: "54", national: /^\d{10,11}$/ },
  { key: "BO", label: "Bolivia", code: "591", national: /^[67]\d{7}$/ },
  { key: "BR", label: "Brasil", code: "55", national: /^\d{10,11}$/ },
  { key: "CL", label: "Chile", code: "56", national: /^9\d{8}$/ },
  { key: "EC", label: "Ecuador", code: "593", national: /^9\d{8}$/ },
  { key: "MX", label: "México", code: "52", national: /^\d{10}$/ },
  { key: "VE", label: "Venezuela", code: "58", national: /^4\d{9}$/ },
  { key: "PY", label: "Paraguay", code: "595", national: /^9\d{8}$/ },
  { key: "UY", label: "Uruguay", code: "598", national: /^9\d{7}$/ },
  { key: "PA", label: "Panamá", code: "507", national: /^6\d{7}$/ },
  { key: "CR", label: "Costa Rica", code: "506", national: /^\d{8}$/ },
  { key: "US", label: "Estados Unidos / Canadá", code: "1", national: /^[2-9]\d{9}$/ },
  { key: "ES", label: "España", code: "34", national: /^[67]\d{8}$/ },
  { key: "IT", label: "Italia", code: "39", national: /^3\d{8,9}$/ },
  { key: "FR", label: "Francia", code: "33", national: /^[67]\d{8}$/ },
  { key: "DE", label: "Alemania", code: "49", national: /^1\d{9,10}$/ },
  { key: "GB", label: "Reino Unido", code: "44", national: /^7\d{9}$/ },
  { key: "NL", label: "Países Bajos", code: "31", national: /^6\d{8}$/ },
  { key: "CH", label: "Suiza", code: "41", national: /^7\d{8}$/ },
  { key: "PT", label: "Portugal", code: "351", national: /^9\d{8}$/ },
  { key: "AU", label: "Australia", code: "61", national: /^4\d{8}$/ },
  { key: "JP", label: "Japón", code: "81", national: /^[789]0\d{8}$/ },
] as const;
export type PhonePrefixKey = (typeof PHONE_PREFIXES)[number]["key"];
export const PHONE_PREFIX_KEYS = PHONE_PREFIXES.map(p => p.key) as [PhonePrefixKey, ...PhonePrefixKey[]];

/**
 * Normalizes a WhatsApp number to E.164 digits (country code + national number, without "+"),
 * which is what `leads.phone` stores. A country code typed by the visitor is never duplicated.
 */
export function normalizePhone(prefixKey: string, input: string): { ok: true; digits: string } | { ok: false; message: string } {
  const prefix = PHONE_PREFIXES.find(p => p.key === prefixKey);
  if (!prefix) return { ok: false, message: "Selecciona el prefijo de tu país." };
  if (!/^[\d\s()+.-]+$/.test(input.trim())) return { ok: false, message: "Usa solo números, espacios o guiones." };
  const international = /^\s*(\+|00)/.test(input);
  let digits = input.replace(/\D/g, "");
  if (input.trim().startsWith("00")) digits = digits.slice(2);
  let national = digits;
  if (international) {
    if (!digits.startsWith(prefix.code)) return { ok: false, message: `El número incluye otro código de país. Selecciona su prefijo o escribe el número sin +${prefix.code}.` };
    national = digits.slice(prefix.code.length);
  } else if (digits.startsWith(prefix.code) && !prefix.national.test(digits) && prefix.national.test(digits.slice(prefix.code.length))) {
    // Typed with the country code but without "+", e.g. 51987654321.
    national = digits.slice(prefix.code.length);
  }
  if (!prefix.national.test(national) || (prefix.code + national).length > 15) {
    return { ok: false, message: "hint" in prefix ? `Introduce ${prefix.hint}.` : `Revisa el número: no tiene un formato válido para +${prefix.code}.` };
  }
  return { ok: true, digits: prefix.code + national };
}

export const formatPhone = (digits: string) => (digits ? `+${digits}` : "");

// Location of the older adult. Only the countries Norita serves.
export const LEAD_COUNTRIES = [
  { value: "PE", label: "Perú", localityLabel: "Distrito" },
  { value: "CO", label: "Colombia", localityLabel: "Localidad de Bogotá" },
] as const;
export type LeadCountry = (typeof LEAD_COUNTRIES)[number]["value"];
export const countryLabel = (value: string | null | undefined) => LEAD_COUNTRIES.find(c => c.value === value)?.label ?? "—";

// Current coverage, not every district or municipality of each country:
// Peru: the 43 districts of the province of Lima and the 7 of Callao (Lima Metropolitana).
// Colombia: the 20 localidades of Bogotá D.C. (pilot city).
// Anything else is captured as OTHER_LOCALITY so the request is never lost.
export const OTHER_LOCALITY = "Otra ubicación (fuera de la cobertura actual)";
export const LOCALITIES: Record<LeadCountry, { group: string; items: readonly string[] }[]> = {
  PE: [
    { group: "Lima", items: ["Ancón", "Ate", "Barranco", "Breña", "Carabayllo", "Cercado de Lima", "Chaclacayo", "Chorrillos", "Cieneguilla", "Comas", "El Agustino", "Independencia", "Jesús María", "La Molina", "La Victoria", "Lince", "Los Olivos", "Lurigancho-Chosica", "Lurín", "Magdalena del Mar", "Miraflores", "Pachacámac", "Pucusana", "Pueblo Libre", "Puente Piedra", "Punta Hermosa", "Punta Negra", "Rímac", "San Bartolo", "San Borja", "San Isidro", "San Juan de Lurigancho", "San Juan de Miraflores", "San Luis", "San Martín de Porres", "San Miguel", "Santa Anita", "Santa María del Mar", "Santa Rosa", "Santiago de Surco", "Surquillo", "Villa El Salvador", "Villa María del Triunfo"] },
    { group: "Callao", items: ["Bellavista", "Callao", "Carmen de la Legua-Reynoso", "La Perla", "La Punta", "Mi Perú", "Ventanilla"] },
  ],
  CO: [
    { group: "Bogotá D.C.", items: ["Antonio Nariño", "Barrios Unidos", "Bosa", "Chapinero", "Ciudad Bolívar", "Engativá", "Fontibón", "Kennedy", "La Candelaria", "Los Mártires", "Puente Aranda", "Rafael Uribe Uribe", "San Cristóbal", "Santa Fe", "Suba", "Sumapaz", "Teusaquillo", "Tunjuelito", "Usaquén", "Usme"] },
  ],
};
export const isValidLocality = (country: string, locality: string) =>
  locality === OTHER_LOCALITY || (country in LOCALITIES && LOCALITIES[country as LeadCountry].some(g => g.items.includes(locality)));
