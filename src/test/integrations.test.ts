import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";
const mock = vi.hoisted(() => ({ rpc: vi.fn(), single: vi.fn(), update: vi.fn() }));
vi.mock("@/integrations/supabase/client.server", () => ({ supabaseAdmin: { rpc: mock.rpc, from: (table: string) => table === "leads" ? { select: () => ({ eq: () => ({ single: mock.single }) }) } : { update: (fields: unknown) => { mock.update(fields); return { eq: () => Promise.resolve({ error: null }) }; } } } }));
import { adminPanelUrl, buildCrmPayload, buildTeamNotification, integrationsMode, isAuthorizedCron, runIntegrationJobs } from "@/lib/integrations.server";

const lead = { id: "c3e34d50-47cf-41aa-86ba-410031983d61", created_at: "2026-10-27T10:00:00Z", name: "Persona de prueba", phone: "51900000000", email: null, service_interest: "Entrenamiento de fuerza", source: "website", status: "new", consent_contact: true, commercial_opt_out_at: null };
const sensitive = { ...lead, message: "Mi madre toma medicación", district: "Miraflores", internal_notes: "nota", frequency: "Servicio puntual" };
describe("Integrations outbox", () => {
  // No test may reach the network: any unmocked fetch fails.
  beforeEach(() => { vi.clearAllMocks(); vi.unstubAllEnvs(); vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network disabled in tests")); });
  afterEach(() => { vi.restoreAllMocks(); });
  it("defaults to dry-run unless explicitly live", () => { expect(integrationsMode()).toBe("dry-run"); vi.stubEnv("INTEGRATIONS_MODE", "true"); expect(integrationsMode()).toBe("dry-run"); vi.stubEnv("INTEGRATIONS_MODE", "live"); expect(integrationsMode()).toBe("live"); });
  it("never sends comments, district, notes or health details to the CRM", () => { const payload = buildCrmPayload(sensitive); expect(Object.keys(payload).sort()).toEqual(["created_at", "email", "lead_id", "marketing_allowed", "name", "phone", "service_interest", "source", "status"]); expect(JSON.stringify(payload)).not.toContain("medicación"); });
  it("allows marketing only with consent and no opt-out", () => { expect(buildCrmPayload(lead).marketing_allowed).toBe(true); expect(buildCrmPayload({ ...lead, consent_contact: false }).marketing_allowed).toBe(false); expect(buildCrmPayload({ ...lead, commercial_opt_out_at: "2026-10-27T11:00:00Z" }).marketing_allowed).toBe(false); });
  it("keeps personal data out of team emails", () => { const text = JSON.stringify(buildTeamNotification(lead)); expect(text).not.toContain(lead.name); expect(text).not.toContain(lead.phone); });
  it("dry-run sends nothing and logs field names only", async () => { const info = vi.spyOn(console, "info").mockImplementation(() => {}); const fetchSpy = vi.spyOn(globalThis, "fetch"); mock.rpc.mockResolvedValue({ data: [{ id: "job-1", lead_id: lead.id, kind: "crm_sync", attempts: 1 }], error: null }); mock.single.mockResolvedValue({ data: lead, error: null }); expect(await runIntegrationJobs()).toEqual({ processed: 1, failed: 0 }); expect(fetchSpy).not.toHaveBeenCalled(); expect(mock.update).toHaveBeenCalledWith(expect.objectContaining({ status: "dry_run" })); const logged = info.mock.calls.flat().join(" "); expect(logged).not.toContain(lead.name); expect(logged).not.toContain(lead.phone); });
  it("live mode without a configured integration keeps the job for retry", async () => { vi.stubEnv("INTEGRATIONS_MODE", "live"); vi.spyOn(console, "warn").mockImplementation(() => {}); mock.rpc.mockResolvedValue({ data: [{ id: "job-2", lead_id: lead.id, kind: "team_notification", attempts: 1 }], error: null }); mock.single.mockResolvedValue({ data: lead, error: null }); expect(await runIntegrationJobs()).toEqual({ processed: 0, failed: 1 }); expect(mock.update).toHaveBeenCalledWith(expect.objectContaining({ status: "failed", last_error: "not_configured" })); });
  it("protects the scheduled endpoint with CRON_SECRET", () => { const req = (auth?: string) => new Request("https://example.invalid/api/integrations/run", { headers: auth ? { authorization: auth } : {} }); expect(isAuthorizedCron(req("Bearer anything"))).toBe(false); vi.stubEnv("CRON_SECRET", "test-cron-secret"); expect(isAuthorizedCron(req())).toBe(false); expect(isAuthorizedCron(req("Bearer wrong"))).toBe(false); expect(isAuthorizedCron(req("Bearer test-cron-secret"))).toBe(true); });
});

describe("Team notification through Resend (fetch simulated)", () => {
  const RECIPIENT = "equipo-ficticio@example.com";
  const job = (kind: string, id = "job-resend-1") => ({ data: [{ id, lead_id: lead.id, kind, attempts: 1 }], error: null });
  const contact = { ...lead, name: "Nombre Ficticio", phone: "51900000001", email: "persona-ficticia@example.com" };
  const reply = (status: number, body: object = {}) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  let fetchSpy: MockInstance<typeof fetch>;
  let logs: string[];
  beforeEach(() => {
    vi.clearAllMocks(); vi.unstubAllEnvs();
    fetchSpy = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network disabled in tests"));
    logs = [];
    for (const level of ["info", "warn", "error", "log"] as const) vi.spyOn(console, level).mockImplementation((...args: unknown[]) => { logs.push(args.join(" ")); });
    mock.single.mockResolvedValue({ data: contact, error: null });
    vi.stubEnv("RESEND_API_KEY", "re_test_not_a_real_key");
    vi.stubEnv("LEAD_NOTIFICATION_EMAIL", RECIPIENT);
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("VERCEL_BRANCH_URL", "norita-git-test-leads-security-norita2.vercel.app");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "norita-neon.vercel.app");
  });
  afterEach(() => { vi.restoreAllMocks(); });
  const lastUpdate = () => mock.update.mock.calls.at(-1)?.[0];

  it("stays in dry-run with Resend configured but INTEGRATIONS_MODE unset", async () => {
    mock.rpc.mockResolvedValue(job("team_notification"));
    await runIntegrationJobs();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(lastUpdate()).toMatchObject({ status: "dry_run" });
  });

  it.each([["RESEND_API_KEY"], ["LEAD_NOTIFICATION_EMAIL"]])("live without %s: not_configured and no request", async (missing) => {
    vi.stubEnv("INTEGRATIONS_MODE", "live"); vi.stubEnv(missing, "");
    mock.rpc.mockResolvedValue(job("team_notification"));
    expect(await runIntegrationJobs()).toEqual({ processed: 0, failed: 1 });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(lastUpdate()).toMatchObject({ status: "failed", last_error: "not_configured" });
  });

  it("live: sends one email with the service and the Preview panel link only, then marks the job done", async () => {
    vi.stubEnv("INTEGRATIONS_MODE", "live");
    fetchSpy.mockResolvedValue(reply(200, { id: "email-ficticio" }));
    mock.rpc.mockResolvedValue(job("team_notification"));
    expect(await runIntegrationJobs()).toEqual({ processed: 1, failed: 0 });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.method).toBe("POST");
    const headers = init.headers as Record<string, string>;
    expect(headers["Authorization"]).toBe("Bearer re_test_not_a_real_key");
    expect(headers["Idempotency-Key"]).toBe("team_notification/job-resend-1");
    const body = JSON.parse(String(init.body));
    expect(body).toMatchObject({ from: "Norita <onboarding@resend.dev>", to: [RECIPIENT], subject: "[Pruebas] Nuevo contacto en Norita" });
    expect(body.text).toContain("Entrenamiento de fuerza");
    expect(body.text).toContain("https://norita-git-test-leads-security-norita2.vercel.app/admin/leads");
    for (const personal of [contact.name, contact.phone, contact.email]) expect(JSON.stringify(body)).not.toContain(personal);
    expect(lastUpdate()).toMatchObject({ status: "done", last_error: null });
  });

  it("reuses the same idempotency key on every retry of a job, and a different one per job", async () => {
    vi.stubEnv("INTEGRATIONS_MODE", "live");
    fetchSpy.mockResolvedValueOnce(reply(500)).mockResolvedValueOnce(reply(200, { id: "e" })).mockResolvedValueOnce(reply(200, { id: "e2" }));
    mock.rpc.mockResolvedValueOnce(job("team_notification", "job-a")).mockResolvedValueOnce(job("team_notification", "job-a")).mockResolvedValueOnce(job("team_notification", "job-b"));
    await runIntegrationJobs(); await runIntegrationJobs(); await runIntegrationJobs();
    const keys = fetchSpy.mock.calls.map((c) => ((c[1] as RequestInit).headers as Record<string, string>)["Idempotency-Key"]);
    expect(keys).toEqual(["team_notification/job-a", "team_notification/job-a", "team_notification/job-b"]);
    const bodies = fetchSpy.mock.calls.slice(0, 2).map((c) => (c[1] as RequestInit).body);
    expect(bodies[0]).toBe(bodies[1]);
  });

  it.each([
    ["Resend rejects (403)", () => Promise.resolve(reply(403, { name: "validation_error", message: `You can only send testing emails to your own email address (${"x"}@example.com)` })), "rejected_403"],
    ["same key, different payload (409)", () => Promise.resolve(reply(409, { name: "invalid_idempotent_request" })), "rejected_409"],
    ["same key in progress (409)", () => Promise.resolve(reply(409, { name: "concurrent_idempotent_requests" })), "delivery_failed"],
    ["rate limited (429)", () => Promise.resolve(reply(429)), "delivery_failed"],
    ["server error (500)", () => Promise.resolve(reply(500)), "delivery_failed"],
    ["network error or timeout", () => Promise.reject(new TypeError("fetch failed")), "delivery_failed"],
  ])("%s: the job stays failed with its error code and the lead is untouched", async (_label, response, code) => {
    vi.stubEnv("INTEGRATIONS_MODE", "live");
    fetchSpy.mockImplementation(response);
    mock.rpc.mockResolvedValue(job("team_notification"));
    expect(await runIntegrationJobs()).toEqual({ processed: 0, failed: 1 });
    expect(lastUpdate()).toMatchObject({ status: "failed", last_error: code });
    expect(mock.update.mock.calls.every((c) => !("name" in (c[0] as object)) && !("phone" in (c[0] as object)))).toBe(true);
    expect(logs.join(" ")).not.toContain("@example.com");
  });

  it("crm_sync (HubSpot) is unchanged in live mode: no request, not_configured", async () => {
    vi.stubEnv("INTEGRATIONS_MODE", "live");
    mock.rpc.mockResolvedValue(job("crm_sync"));
    expect(await runIntegrationJobs()).toEqual({ processed: 0, failed: 1 });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(lastUpdate()).toMatchObject({ status: "failed", last_error: "not_configured" });
  });

  it("never links a Preview email to Production", () => {
    vi.stubEnv("VERCEL_BRANCH_URL", "");
    expect(adminPanelUrl()).toBeNull();
    const email = buildTeamNotification(contact);
    expect(email.text).not.toContain("norita-neon.vercel.app");
    expect(email.text).toContain("web de pruebas");
    expect(email.subject).toBe("[Pruebas] Nuevo contacto en Norita");
  });

  it("links Production emails to the Production panel only in Production", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    expect(adminPanelUrl()).toBe("https://norita-neon.vercel.app/admin/leads");
    expect(buildTeamNotification(contact).subject).toBe("Nuevo contacto en Norita");
  });

  it("ignores a malformed host instead of building a link from it", () => {
    vi.stubEnv("VERCEL_BRANCH_URL", "evil.example/phish?x=");
    expect(adminPanelUrl()).toBeNull();
  });

  it("without Vercel variables (local) the email gives an instruction, not a link", () => {
    vi.stubEnv("VERCEL_ENV", "");
    expect(adminPanelUrl()).toBeNull();
    expect(buildTeamNotification(contact).text).toContain("/admin/leads de la web de pruebas");
  });
});
