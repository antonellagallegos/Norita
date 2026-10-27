import { afterEach, describe, expect, it, vi } from "vitest";
import { clientAddress, rateLimitKey, verifyTurnstile } from "@/lib/lead-capture.server";
import { leadSchema, parseWithoutValues } from "@/lib/leads";
import { withSecurityHeaders } from "@/server";

const answer = (body: object) => vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json(body));
const check = () => verifyTurnstile({ secret: "test-secret", token: "token", submissionId: "c3e34d50-47cf-41aa-86ba-410031983d61", hostname: "norita.example" });
describe("Public form protections", () => {
  afterEach(() => { vi.restoreAllMocks(); });
  it("accepts Turnstile only for this site and action", async () => { answer({ success: true, action: "norita_contact", hostname: "norita.example" }); expect(await check()).toBe(true); });
  it("rejects a Turnstile token solved on another site", async () => { answer({ success: true, action: "norita_contact", hostname: "other.example" }); expect(await check()).toBe(false); });
  it("rejects a Turnstile token for another action", async () => { answer({ success: true, action: "login", hostname: "norita.example" }); expect(await check()).toBe(false); });
  it("uses the first forwarded client address", () => { expect(clientAddress(new Request("https://x.invalid", { headers: { "x-forwarded-for": "203.0.113.7, 10.0.0.1" } }))).toBe("203.0.113.7"); expect(clientAddress(new Request("https://x.invalid"))).toBe("unknown"); });
  it("rate-limits by a keyed hash, never the raw address", async () => { const key = await rateLimitKey("203.0.113.7", "secret-a"); expect(key).toMatch(/^[0-9a-f]{64}$/); expect(key).toBe(await rateLimitKey("203.0.113.7", "secret-a")); expect(key).not.toBe(await rateLimitKey("203.0.113.7", "secret-b")); });
  it("reports invalid fields without echoing what the visitor typed", () => { expect(() => parseWithoutValues(leadSchema, { name: "x", phone: "Mi teléfono privado", service_interest: "Diagnóstico privado" })).toThrow(/phone/); try { parseWithoutValues(leadSchema, { phone: "Mi teléfono privado", service_interest: "Diagnóstico privado" }); } catch (error) { expect(String(error)).not.toContain("privado"); } });
  it("never frames, caches or indexes private pages", () => { const admin = withSecurityHeaders(new Request("https://x.invalid/admin/leads"), new Response("ok")); expect(admin.headers.get("x-frame-options")).toBe("DENY"); expect(admin.headers.get("cache-control")).toBe("no-store"); const home = withSecurityHeaders(new Request("https://x.invalid/"), new Response("ok")); expect(home.headers.get("x-frame-options")).toBeNull(); expect(home.headers.get("x-content-type-options")).toBe("nosniff"); });
});
