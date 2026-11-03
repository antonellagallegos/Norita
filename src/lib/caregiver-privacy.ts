// Facts of the privacy notice for caregiver applicants (/privacidad-cuidadores). Applying for work is a
// different purpose from a family inquiry, so it has its own version, retention periods and legal review.
// The controller, contact and country registrations are shared with the family policy (PRIVACY_POLICY):
// fill them there. `null` marks a fact still to confirm; the application form stays disabled until every
// fact is filled and `legalReviewed` is true. Never fill a field with an assumed value.
//
// When the approved text changes, update `version` and `updatedAt`, then set VITE_CAREGIVER_PRIVACY_VERSION
// in Vercel to the same version: applications record the version the person accepted.
import { PRIVACY_POLICY, type PolicyOwner } from "@/lib/privacy-policy";

export const CAREGIVER_PRIVACY = {
  version: "2026-11-03",
  updatedAt: "3 de noviembre de 2026",
  legalReviewed: false,
  retention: { applications: null, talentPool: null },
  hiring: { modality: null },
} as const satisfies CaregiverPrivacyFacts;

type Pending = string | null;
type CaregiverPrivacyFacts = {
  version: string;
  updatedAt: string;
  legalReviewed: boolean;
  retention: { applications: Pending; talentPool: Pending };
  hiring: { modality: Pending };
};

export function pendingCaregiverPolicyItems(
  policy: CaregiverPrivacyFacts = CAREGIVER_PRIVACY,
  shared = PRIVACY_POLICY,
): { label: string; owner: PolicyOwner }[] {
  const items: [Pending, string, PolicyOwner][] = [
    [
      shared.controller.fullName,
      "Nombre completo de la persona natural responsable (política general)",
      "Fundador",
    ],
    [
      shared.controller.address,
      "Domicilio en Perú para efectos de protección de datos (política general)",
      "Fundador",
    ],
    [
      shared.contact.channel,
      "Canal de contacto dedicado a privacidad (política general)",
      "Fundador",
    ],
    [
      policy.retention.applications,
      "Plazo de conservación de postulaciones que no terminan en incorporación",
      "Fundador",
    ],
    [
      policy.retention.talentPool,
      "Plazo de conservación en la base de futuras oportunidades",
      "Fundador",
    ],
    [
      policy.hiring.modality,
      "Modalidad de colaboración o contratación de cuidadores",
      "Asesor legal",
    ],
    [
      shared.peru.databankRegistration,
      "Perú: inscripción del banco de datos de postulantes",
      "Asesor legal",
    ],
    [
      shared.colombia.applicability,
      "Colombia: aplicación de la Ley 1581 de 2012 a postulantes en Colombia",
      "Asesor legal",
    ],
  ];
  const pending = items.filter(([v]) => !v).map(([, label, owner]) => ({ label, owner }));
  if (!policy.legalReviewed)
    pending.push({
      label: "Validación legal del aviso de privacidad para postulantes",
      owner: "Asesor legal",
    });
  return pending;
}

export const caregiverPolicyApproved = (policy: CaregiverPrivacyFacts = CAREGIVER_PRIVACY) =>
  pendingCaregiverPolicyItems(policy).length === 0;
