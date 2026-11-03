// Facts of the published privacy policy (/privacidad). `null` marks information the founder or the legal
// adviser must still confirm: the page shows it as pending and the public form stays disabled until
// every field is filled and `legalReviewed` is true. Never fill a field with an assumed value; when
// something does not apply, write that conclusion explicitly (for example "No aplica: <motivo>").
//
// Norita is a project in formation managed from Peru, with no incorporated company yet: the controller
// is the natural person below. When the company is incorporated, the policy must be updated.
//
// When the approved text changes, update `version` and `updatedAt`, then set VITE_PRIVACY_VERSION in
// Vercel to the same version: leads record the version the person accepted.
export const PRIVACY_POLICY = {
  version: "2026-11-02",
  updatedAt: "2 de noviembre de 2026",
  legalReviewed: false,
  controller: { fullName: null, idDocument: null, address: null },
  contact: { channel: null, phone: null },
  peru: { databankRegistration: null, crossBorderMechanism: null },
  colombia: { applicability: null, rnbd: null, transferMechanism: null },
  retention: { inquiries: null, marketingConsent: null, optOut: null, auditLog: null },
} as const satisfies PrivacyPolicyFacts;

type Pending = string | null;
type PrivacyPolicyFacts = {
  version: string;
  updatedAt: string;
  legalReviewed: boolean;
  controller: { fullName: Pending; idDocument: Pending; address: Pending };
  contact: { channel: Pending; phone: Pending };
  peru: { databankRegistration: Pending; crossBorderMechanism: Pending };
  colombia: { applicability: Pending; rnbd: Pending; transferMechanism: Pending };
  retention: { inquiries: Pending; marketingConsent: Pending; optOut: Pending; auditLog: Pending };
};

export type PolicyOwner = "Fundador" | "Asesor legal";

export function pendingPolicyItems(
  policy: PrivacyPolicyFacts = PRIVACY_POLICY,
): { label: string; owner: PolicyOwner }[] {
  const items: [Pending, string, PolicyOwner][] = [
    [policy.controller.fullName, "Nombre completo de la persona natural responsable", "Fundador"],
    [
      policy.controller.idDocument,
      "Documento de identidad o RUC de la persona responsable (y si debe publicarse)",
      "Fundador",
    ],
    [
      policy.controller.address,
      "Domicilio en Perú para efectos de protección de datos (y si debe publicarse)",
      "Fundador",
    ],
    [policy.contact.channel, "Canal de contacto provisional dedicado a privacidad", "Fundador"],
    [
      policy.contact.phone,
      "Teléfono de contacto, o confirmación de que no se publicará",
      "Fundador",
    ],
    [
      policy.retention.inquiries,
      "Plazo de conservación de solicitudes que no terminan en contratación",
      "Fundador",
    ],
    [
      policy.retention.marketingConsent,
      "Plazo de conservación de la prueba del consentimiento comercial",
      "Fundador",
    ],
    [policy.retention.optOut, "Plazo de conservación de las bajas comerciales", "Fundador"],
    [policy.retention.auditLog, "Plazo de conservación del registro de auditoría", "Fundador"],
    [
      policy.peru.databankRegistration,
      "Perú: inscripción del banco de datos en el Registro Nacional de Protección de Datos Personales (número o estado del trámite)",
      "Asesor legal",
    ],
    [
      policy.peru.crossBorderMechanism,
      "Perú: mecanismo que legitima el flujo transfronterizo a Estados Unidos y comunicaciones a la autoridad, si proceden",
      "Asesor legal",
    ],
    [
      policy.colombia.applicability,
      "Colombia: aplicación de la Ley 1581 de 2012 a un responsable sin domicilio en Colombia y obligaciones resultantes",
      "Asesor legal",
    ],
    [
      policy.colombia.rnbd,
      "Colombia: si procede el Registro Nacional de Bases de Datos",
      "Asesor legal",
    ],
    [
      policy.colombia.transferMechanism,
      "Colombia: mecanismo para la transmisión o transferencia internacional a Estados Unidos",
      "Asesor legal",
    ],
  ];
  const pending = items.filter(([v]) => !v).map(([, label, owner]) => ({ label, owner }));
  if (!policy.legalReviewed)
    pending.push({
      label: "Validación legal del texto completo, incluidas las notas de revisión",
      owner: "Asesor legal",
    });
  return pending;
}

export const pendingPolicyFields = (policy: PrivacyPolicyFacts = PRIVACY_POLICY) =>
  pendingPolicyItems(policy).map((i) => i.label);
export const policyApproved = (policy: PrivacyPolicyFacts = PRIVACY_POLICY) =>
  pendingPolicyItems(policy).length === 0;

// Questions for the legal adviser, shown next to the related text until `legalReviewed` is true.
export const LEGAL_REVIEW = {
  controller:
    "confirmar que la persona natural que gestiona el proyecto actúa como responsable mientras no exista una sociedad, qué datos de identificación deben publicarse y cómo se trasladará la responsabilidad y la base de datos a la sociedad cuando se constituya.",
  peru: "confirmar las obligaciones aplicables a la persona responsable en Perú según la Ley N.º 29733 y su reglamento vigente, en particular la inscripción del banco de datos y las comunicaciones a la Autoridad Nacional de Protección de Datos Personales.",
  colombia:
    "determinar si la Ley 1581 de 2012 se aplica a un responsable sin domicilio en Colombia que dirige su oferta a personas en Colombia, y qué obligaciones concretas resultan (por ejemplo, registro de bases de datos o canal de atención).",
  family:
    "validar el tratamiento cuando quien escribe es un familiar, y el procedimiento para obtener la autorización del adulto mayor o de quien pueda otorgarla válidamente (por ejemplo, apoyos o representación según la normativa de cada país) si la solicitud avanza hacia un servicio.",
  sensitive:
    "confirmar si el servicio de interés (por ejemplo, acompañamiento a citas médicas o recogida de medicamentos) debe tratarse como dato sensible o relativo a la salud y, en ese caso, qué autorización expresa y qué información adicional exige cada país.",
  bases:
    "validar las bases legales indicadas para cada finalidad en Perú y en Colombia y si alguna requiere una autorización adicional o un texto distinto en las casillas del formulario.",
  transfers:
    "validar la descripción de la transferencia a Estados Unidos y si el texto de autorización del formulario debe mencionarla de forma expresa.",
  providers:
    "confirmar los acuerdos de encargo de tratamiento con cada proveedor y si WhatsApp debe presentarse como encargado o como responsable independiente bajo sus propias condiciones.",
  rights:
    "confirmar los plazos de respuesta que se publicarán: en Colombia, los de la Ley 1581 de 2012 (consultas y reclamos); en Perú, los del reglamento vigente de la Ley N.º 29733.",
} as const;
export type LegalReviewKey = keyof typeof LEGAL_REVIEW;
