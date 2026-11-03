// Server-only checks for the public forms (family contact and caregiver applications). Nothing here logs or returns personal data.

export const TURNSTILE_ACTION = "norita_contact";
export const CAREGIVER_TURNSTILE_ACTION = "norita_caregiver";

export async function verifyTurnstile({ secret, token, submissionId, hostname, action = TURNSTILE_ACTION }: { secret: string; token: string; submissionId: string; hostname: string; action?: string }): Promise<boolean> {
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: new URLSearchParams({ secret, response: token, idempotency_key: submissionId }) });
  if (!response.ok) return false;
  const verification = await response.json() as { success?: boolean; action?: string; hostname?: string };
  // A token solved on another site must not be accepted here.
  return verification.success === true && verification.action === action && verification.hostname === hostname;
}

export function clientAddress(request: Request): string {
  // Vercel overwrites x-forwarded-for with the real client address.
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip")?.trim() || "unknown";
}

// HMAC instead of a plain hash: the IPv4 space is small enough to reverse an unsalted hash.
export async function rateLimitKey(address: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(address));
  return Array.from(new Uint8Array(signature), b => b.toString(16).padStart(2, "0")).join("");
}
