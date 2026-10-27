import { beforeEach, describe, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({ identity: vi.fn(), rpc: vi.fn(), client: vi.fn(), request: vi.fn() }));
vi.mock("@/lib/auth.server", () => ({ getSessionUser: mock.identity }));
vi.mock("@tanstack/react-start/server", () => ({ getRequest: mock.request }));
vi.mock("@supabase/supabase-js", () => ({ createClient: mock.client }));
import { requireLeadAdmin, resolveLeadAccess } from "@/lib/leads-access.server";
describe("Explicit administrative authorization", () => {
  beforeEach(() => { vi.clearAllMocks(); vi.stubEnv("SUPABASE_URL", "https://example.invalid"); vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "public-test"); mock.client.mockReturnValue({ rpc: mock.rpc }); mock.request.mockReturnValue(new Request("https://example.invalid", { headers: { "x-lovable-identity-token": "test-fixture-not-a-session" } })); });
  it("denies anonymous visitors without touching database", async () => { mock.identity.mockResolvedValue(null); expect((await resolveLeadAccess()).client).toBeNull(); expect(mock.client).not.toHaveBeenCalled(); });
  it("denies a verified Lovable user without an explicit admin grant", async () => { mock.identity.mockResolvedValue({ userId: "verified-user" }); mock.rpc.mockResolvedValue({ data: false, error: null }); await expect(requireLeadAdmin()).rejects.toThrow("Acceso restringido"); expect(mock.rpc).toHaveBeenCalledWith("is_lead_admin"); });
  it("allows a verified user only when the server database confirms the grant", async () => { mock.identity.mockResolvedValue({ userId: "verified-admin" }); mock.rpc.mockResolvedValue({ data: true, error: null }); expect((await requireLeadAdmin()).user.userId).toBe("verified-admin"); });
  it("fails closed when authorization cannot be checked", async () => { mock.identity.mockResolvedValue({ userId: "verified-user" }); mock.rpc.mockResolvedValue({ data: null, error: { message: "unavailable" } }); await expect(requireLeadAdmin()).rejects.toThrow("autorización"); });
});