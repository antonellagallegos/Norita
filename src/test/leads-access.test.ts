import { beforeEach, describe, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({ claims: vi.fn(), rpc: vi.fn(), client: vi.fn(), request: vi.fn() }));
vi.mock("@tanstack/react-start/server", () => ({ getRequest: mock.request }));
vi.mock("@supabase/supabase-js", () => ({ createClient: mock.client }));
import { requireLeadAdmin, resolveLeadAccess } from "@/lib/leads-access.server";
const withToken = () => mock.request.mockReturnValue(new Request("https://example.invalid", { headers: { authorization: "Bearer test-fixture-not-a-session" } }));
describe("Explicit administrative authorization", () => {
  beforeEach(() => { vi.clearAllMocks(); vi.stubEnv("SUPABASE_URL", "https://example.invalid"); vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "public-test"); mock.client.mockReturnValue({ rpc: mock.rpc, auth: { getClaims: mock.claims } }); withToken(); });
  it("denies anonymous visitors without touching database", async () => { mock.request.mockReturnValue(new Request("https://example.invalid")); expect((await resolveLeadAccess()).client).toBeNull(); expect(mock.client).not.toHaveBeenCalled(); });
  it("ignores Lovable identity headers, which Vercel never verifies", async () => { mock.request.mockReturnValue(new Request("https://example.invalid", { headers: { "x-lovable-identity-token": "forged" } })); expect((await resolveLeadAccess()).user).toBeNull(); });
  it("denies an invalid session token", async () => { mock.claims.mockResolvedValue({ data: null, error: { message: "invalid" } }); expect(await resolveLeadAccess()).toEqual({ user: null, client: null }); });
  it("requires the second factor before checking the grant", async () => { mock.claims.mockResolvedValue({ data: { claims: { sub: "user-1", aal: "aal1" } }, error: null }); const access = await resolveLeadAccess(); expect(access.client).toBeNull(); expect(access.user?.mfa).toBe(false); expect(mock.rpc).not.toHaveBeenCalled(); });
  it("denies a verified user without an explicit admin grant", async () => { mock.claims.mockResolvedValue({ data: { claims: { sub: "verified-user", aal: "aal2" } }, error: null }); mock.rpc.mockResolvedValue({ data: false, error: null }); await expect(requireLeadAdmin()).rejects.toThrow("Acceso restringido"); expect(mock.rpc).toHaveBeenCalledWith("is_lead_admin"); });
  it("allows a verified user only when the server database confirms the grant", async () => { mock.claims.mockResolvedValue({ data: { claims: { sub: "verified-admin", aal: "aal2" } }, error: null }); mock.rpc.mockResolvedValue({ data: true, error: null }); expect((await requireLeadAdmin()).user.userId).toBe("verified-admin"); });
  it("fails closed when authorization cannot be checked", async () => { mock.claims.mockResolvedValue({ data: { claims: { sub: "verified-user", aal: "aal2" } }, error: null }); mock.rpc.mockResolvedValue({ data: null, error: { message: "unavailable" } }); await expect(requireLeadAdmin()).rejects.toThrow("autorización"); });
});
