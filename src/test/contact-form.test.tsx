import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SERVICES } from "@/lib/leads";
import { OTHER_LOCALITY } from "@/lib/lead-fields";

const mock = vi.hoisted(() => ({ submit: vi.fn() }));
vi.mock("@/lib/contact-config", async (importOriginal) => ({ ...(await importOriginal<object>()), captureReady: true, PRIVACY_URL: "/privacidad", TURNSTILE_SITE_KEY: "test-site-key" }));
vi.mock("@/lib/leads.functions", () => ({ submitLead: mock.submit }));
vi.mock("@tanstack/react-start", () => ({ useServerFn: (fn: unknown) => fn }));
import { ContactForm } from "@/components/contact-form";

const submitButton = () => screen.getByRole("button", { name: /Enviar solicitud|Enviando/ });
const select = (label: RegExp) => screen.getByLabelText(label) as HTMLSelectElement;
function fillValid() {
  fireEvent.change(screen.getByLabelText(/Nombre completo/), { target: { value: "Persona de prueba" } });
  fireEvent.change(screen.getByLabelText(/Correo electrónico/), { target: { value: "prueba@example.com" } });
  fireEvent.change(screen.getByRole("textbox", { name: /Número de WhatsApp/ }), { target: { value: "987 654 321" } });
  fireEvent.change(select(/^País/), { target: { value: "PE" } });
  fireEvent.change(select(/^Distrito/), { target: { value: "Miraflores" } });
  fireEvent.click(screen.getByRole("checkbox", { name: /Autorizo el tratamiento/ }));
}
function deferred<T>() { let resolve!: (v: T) => void, reject!: (e: unknown) => void; const promise = new Promise<T>((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; }

describe("Public contact form", () => {
  beforeEach(() => {
    mock.submit.mockReset();
    // jsdom has no ResizeObserver; Radix's checkbox measures itself with it.
    globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} } as unknown as typeof ResizeObserver;
    // Turnstile stub: solves immediately so the button can be enabled.
    (window as unknown as { turnstile: unknown }).turnstile = { render: (_el: HTMLElement, o: { callback: (t: string) => void }) => { o.callback("test-token"); return "widget"; }, remove: () => {} };
    render(<ContactForm initialService={SERVICES[0]} />);
  });

  it("does not submit when any of the five required fields is missing and shows each error by its field", () => {
    fireEvent.click(submitButton());
    expect(mock.submit).not.toHaveBeenCalled();
    for (const message of [/Introduce tu nombre completo/, /Introduce tu correo/, /Introduce tu número de WhatsApp/, /Selecciona Perú o Colombia/, /Selecciona el distrito o la localidad/]) expect(screen.getByText(message)).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo electrónico/)).toHaveAttribute("aria-invalid", "true");
  });

  it("offers only Peru and Colombia for the older adult's location", () => {
    expect([...select(/^País/).options].map(o => o.value).filter(Boolean)).toEqual(["PE", "CO"]);
  });

  it("clears the selected locality when the country changes and shows that country's list", () => {
    fireEvent.change(select(/^País/), { target: { value: "PE" } });
    fireEvent.change(select(/^Distrito/), { target: { value: "Miraflores" } });
    fireEvent.change(select(/^País/), { target: { value: "CO" } });
    const locality = select(/^Localidad de Bogotá/);
    expect(locality.value).toBe("");
    const values = [...locality.options].map(o => o.value);
    expect(values).toContain("Chapinero");
    expect(values).not.toContain("Miraflores");
    expect(values).toContain(OTHER_LOCALITY);
  });

  it("offers Peru, Colombia and other international prefixes", () => {
    const prefixes = [...select(/Prefijo internacional/).options].map(o => o.textContent);
    expect(prefixes.slice(0, 2)).toEqual(["Perú +51", "Colombia +57"]);
    expect(prefixes.length).toBeGreaterThan(10);
  });

  it("shows loading, ignores a double click and confirms only after the server confirms", async () => {
    const pending = deferred<{ success: boolean }>();
    mock.submit.mockReturnValue(pending.promise);
    fillValid();
    fireEvent.click(submitButton());
    fireEvent.click(submitButton());
    expect(mock.submit).toHaveBeenCalledTimes(1);
    expect(submitButton()).toBeDisabled();
    expect(submitButton()).toHaveTextContent("Enviando…");
    expect(screen.queryByText(/Gracias por contactar/)).not.toBeInTheDocument();
    const sent = mock.submit.mock.calls[0]?.[0].data;
    expect(sent).toMatchObject({ name: "Persona de prueba", email: "prueba@example.com", phone_prefix: "PE", phone: "987 654 321", country: "PE", district: "Miraflores", consent_processing: true, consent_contact: false });
    await act(async () => { pending.resolve({ success: true }); });
    expect(screen.getByText(/Gracias por contactar/)).toBeInTheDocument();
  });

  it("never shows a false confirmation on a server error and retries with the same submission id", async () => {
    mock.submit.mockRejectedValueOnce(new Error("No pudimos guardar tu solicitud. Inténtalo de nuevo."));
    fillValid();
    await act(async () => { fireEvent.click(submitButton()); });
    expect(screen.queryByText(/Gracias por contactar/)).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("No pudimos guardar tu solicitud");
    mock.submit.mockResolvedValueOnce({ success: true });
    await act(async () => { fireEvent.click(submitButton()); });
    expect(mock.submit).toHaveBeenCalledTimes(2);
    expect(mock.submit.mock.calls[1]?.[0].data.submission_id).toBe(mock.submit.mock.calls[0]?.[0].data.submission_id);
    expect(screen.getByText(/Gracias por contactar/)).toBeInTheDocument();
  });

  it("does not confirm when the server answers without an explicit success", async () => {
    mock.submit.mockResolvedValueOnce(undefined);
    fillValid();
    await act(async () => { fireEvent.click(submitButton()); });
    expect(screen.queryByText(/Gracias por contactar/)).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
