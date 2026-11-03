// Public configuration of the caregiver application form. Independent from the family form gate
// (contact-config.ts): it stays disabled until the applicant privacy notice is approved, its version is
// set in the environment (VITE_CAREGIVER_PRIVACY_VERSION) and Turnstile is configured.
import { TURNSTILE_SITE_KEY } from "@/lib/contact-config";
import { CAREGIVER_PRIVACY, caregiverPolicyApproved } from "@/lib/caregiver-privacy";

export const CAREGIVER_PRIVACY_PATH = "/privacidad-cuidadores";
export const CAREGIVER_PRIVACY_VERSION: string =
  import.meta.env["VITE_CAREGIVER_PRIVACY_VERSION"] ?? "";
export const applicationsReady =
  Boolean(TURNSTILE_SITE_KEY) &&
  CAREGIVER_PRIVACY_VERSION === CAREGIVER_PRIVACY.version &&
  caregiverPolicyApproved();
