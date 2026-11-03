import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  caregiverApplicationSchema,
  CAREGIVER_AREAS,
  CAREGIVER_SERVICES,
} from "@/lib/caregiver-fields";
import { caregiverPolicyApproved } from "@/lib/caregiver-privacy";
import { applicationsReady } from "@/lib/caregiver-config";
import { SERVICES } from "@/lib/leads";

const mock = vi.hoisted(() => ({ submit: vi.fn() }));
vi.mock("@/lib/caregivers.functions", () => ({ submitCaregiverApplication: mock.submit }));
vi.mock("@tanstack/react-start", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useServerFn: (fn: unknown) => fn,
}));
import { CaregiverApplicationForm } from "@/components/caregivers/application-form";
import { routeTree } from "@/routeTree.gen";

const valid = {
  name: "Persona de prueba",
  phone_prefix: "PE",
  phone: "987 654 321",
  country: "PE",
  city: "Lima Metropolitana",
  district: "Miraflores",
  experience_years: "1to3",
  experience_types: ["private"],
  training: ["first_aid"],
  availability_days: ["weekdays"],
  availability_slots: ["morning"],
  services: [SERVICES[0]],
  adult_confirmed: true,
  consent_processing: true,
  consent_talent_pool: false,
  submission_id: "7b0c8f8e-8f3a-4f3e-9d63-1c2b3a4d5e6f",
};

describe("Caregiver application schema", () => {
  it("accepts a complete application and normalizes the phone to E.164 digits", () => {
    const parsed = caregiverApplicationSchema.parse(valid);
    expect(parsed.phone).toBe("51987654321");
  });

  it("validates the district against the chosen city, in Lima and in Bogotá", () => {
    expect(caregiverApplicationSchema.safeParse({ ...valid, district: "Suba" }).success).toBe(
      false,
    );
    expect(
      caregiverApplicationSchema.safeParse({
        ...valid,
        phone_prefix: "CO",
        phone: "300 123 4567",
        country: "CO",
        city: "Bogotá D.C.",
        district: "Suba",
      }).success,
    ).toBe(true);
    expect(Object.values(CAREGIVER_AREAS.PE["Lima Metropolitana"] ?? [])).toHaveLength(43);
    expect(CAREGIVER_AREAS.CO["Bogotá D.C."]).toHaveLength(20);
  });

  it("requires adulthood and consent, and rejects unknown fields such as documents or free text", () => {
    expect(caregiverApplicationSchema.safeParse({ ...valid, adult_confirmed: false }).success).toBe(
      false,
    );
    expect(
      caregiverApplicationSchema.safeParse({ ...valid, consent_processing: false }).success,
    ).toBe(false);
    for (const extra of ["dni", "id_document", "health_notes", "message", "email"])
      expect(caregiverApplicationSchema.safeParse({ ...valid, [extra]: "x" }).success).toBe(false);
  });

  it("offers exactly the five family services and keeps 'no formal training' exclusive", () => {
    expect(CAREGIVER_SERVICES).toEqual(SERVICES.slice(0, 5));
    expect(
      caregiverApplicationSchema.safeParse({
        ...valid,
        services: ["Quiero conocer varios servicios"],
      }).success,
    ).toBe(false);
    expect(
      caregiverApplicationSchema.safeParse({ ...valid, training: ["none", "first_aid"] }).success,
    ).toBe(false);
  });
});

describe("Caregiver application gate", () => {
  it("stays closed while the applicant privacy notice is a draft", () => {
    expect(caregiverPolicyApproved()).toBe(false);
    expect(applicationsReady).toBe(false);
  });

  beforeEach(() => {
    mock.submit.mockReset();
    globalThis.ResizeObserver ??= class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  });

  it("renders the form disabled, with a notice, and never submits", () => {
    render(<CaregiverApplicationForm />);
    expect(screen.getByRole("status")).toHaveTextContent(/Estamos preparando las postulaciones/);
    const button = screen.getByRole("button", { name: /Enviar postulación/ });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(mock.submit).not.toHaveBeenCalled();
    expect(screen.queryByLabelText(/DNI|documento|salud/i)).toBeNull();
  });
});

describe("Caregiver routes", () => {
  it("matches /cuidadores and /privacidad-cuidadores", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    for (const path of ["/cuidadores", "/privacidad-cuidadores"])
      expect(router.matchRoutes(path).at(-1)?.routeId).not.toBe(rootRouteId);
  });
});
