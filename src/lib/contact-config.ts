// Public configuration only. Keep privacy disabled until the approved document is supplied.
export const CALENDLY_URL = "";
export const PRIVACY_URL = "";
export const PRIVACY_VERSION = "";
export const TURNSTILE_SITE_KEY = "";
export const captureReady = Boolean(PRIVACY_URL && PRIVACY_VERSION && TURNSTILE_SITE_KEY);
export const SERVICE_MESSAGES = [
  "Hola, quisiera información sobre el servicio de acompañamiento a citas médicas de Norita.",
  "Hola, quisiera información sobre las sesiones de neuroestimulación de Norita.",
  "Hola, quisiera información sobre el entrenamiento de fuerza para adultos mayores.",
] as const;