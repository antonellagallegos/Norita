// Public configuration only. Collection stays disabled until an approved privacy policy, its version and a
// Turnstile site key are set for the environment (Vercel: VITE_PRIVACY_URL, VITE_PRIVACY_VERSION,
// VITE_TURNSTILE_SITE_KEY), so a Preview branch can be enabled without touching Production.
export const CALENDLY_URL = "";
export const PRIVACY_URL: string = import.meta.env["VITE_PRIVACY_URL"] ?? "";
export const PRIVACY_VERSION: string = import.meta.env["VITE_PRIVACY_VERSION"] ?? "";
export const TURNSTILE_SITE_KEY: string = import.meta.env["VITE_TURNSTILE_SITE_KEY"] ?? "";
export const captureReady = Boolean(PRIVACY_URL && PRIVACY_VERSION && TURNSTILE_SITE_KEY);
export const SERVICE_MESSAGES = [
  "Hola, quisiera información sobre el servicio de acompañamiento a citas médicas de Norita.",
  "Hola, quisiera información sobre las sesiones de neuroestimulación de Norita.",
  "Hola, quisiera información sobre el entrenamiento de fuerza para adultos mayores.",
] as const;