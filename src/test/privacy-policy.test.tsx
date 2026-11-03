import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PRIVACY_POLICY, pendingPolicyItems, policyApproved } from "@/lib/privacy-policy";
import { POLICY_SECTIONS, PrivacyPolicy } from "@/components/privacy-policy";

const complete = {
  ...PRIVACY_POLICY,
  legalReviewed: true,
  controller: { fullName: "Nombre", idDocument: "Documento", address: "Domicilio" },
  contact: { channel: "privacidad@norita.test", phone: "No se publica" },
  peru: { databankRegistration: "Registro", crossBorderMechanism: "Mecanismo" },
  colombia: { applicability: "Conclusión", rnbd: "No aplica", transferMechanism: "Mecanismo" },
  retention: { inquiries: "Plazo", marketingConsent: "Plazo", optOut: "Plazo", auditLog: "Plazo" },
};

async function loadCaptureReady(env: Record<string, string>, approved?: boolean) {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
  if (approved !== undefined)
    vi.doMock("@/lib/privacy-policy", async (importOriginal) => ({
      ...(await importOriginal<object>()),
      policyApproved: () => approved,
    }));
  return (await import("@/lib/contact-config")).captureReady;
}
const ready = {
  VITE_PRIVACY_URL: "/privacidad",
  VITE_PRIVACY_VERSION: PRIVACY_POLICY.version,
  VITE_TURNSTILE_SITE_KEY: "site-key",
};

describe("Privacy policy", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.doUnmock("@/lib/privacy-policy");
  });

  it("is a draft: every legal fact is pending and the text is not legally reviewed", () => {
    expect(PRIVACY_POLICY.legalReviewed).toBe(false);
    const items = pendingPolicyItems();
    expect(items.map((i) => i.label)).toEqual(
      expect.arrayContaining([
        "Nombre completo de la persona natural responsable",
        "Canal de contacto provisional dedicado a privacidad",
        "Validación legal del texto completo, incluidas las notas de revisión",
      ]),
    );
    expect(items.filter((i) => i.owner === "Fundador").length).toBeGreaterThan(0);
    expect(items.filter((i) => i.owner === "Asesor legal").length).toBeGreaterThan(0);
    expect(policyApproved()).toBe(false);
  });

  it("is approved only when every fact is filled and the text is legally reviewed", () => {
    expect(policyApproved(complete)).toBe(true);
    expect(policyApproved({ ...complete, legalReviewed: false })).toBe(false);
    expect(policyApproved({ ...complete, contact: { ...complete.contact, channel: null } })).toBe(
      false,
    );
    expect(
      policyApproved({ ...complete, colombia: { ...complete.colombia, transferMechanism: null } }),
    ).toBe(false);
  });

  it("keeps the form disabled while the published policy is a draft, even with every variable set", async () => {
    expect(await loadCaptureReady(ready)).toBe(false);
  });

  it("enables the form only when the configured version matches the approved policy", async () => {
    expect(await loadCaptureReady(ready, true)).toBe(true);
    expect(await loadCaptureReady({ ...ready, VITE_PRIVACY_VERSION: "otra-version" }, true)).toBe(
      false,
    );
    expect(await loadCaptureReady({ ...ready, VITE_TURNSTILE_SITE_KEY: "" }, true)).toBe(false);
  });

  it("renders every section, its version and the pending data as a draft", () => {
    render(<PrivacyPolicy />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Política de privacidad" }),
    ).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`Versión ${PRIVACY_POLICY.version}`))).toBeInTheDocument();
    for (const [id] of POLICY_SECTIONS) expect(document.getElementById(id)).toBeInTheDocument();
    expect(screen.getByText("Borrador pendiente de aprobación")).toBeInTheDocument();
    expect(screen.getAllByText(/\[Pendiente:/).length).toBeGreaterThan(0);
  });

  it("never claims an exemption for not being an incorporated company", () => {
    const { container } = render(<PrivacyPolicy />);
    expect(container.textContent).toMatch(
      /no la exime de cumplir la normativa de protección de datos/,
    );
  });
});
