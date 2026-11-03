import type { ReactNode } from "react";
import {
  LEGAL_REVIEW,
  PRIVACY_POLICY,
  type LegalReviewKey,
  pendingPolicyFields,
} from "@/lib/privacy-policy";

// Text of the policy published at /privacidad. Facts the founder or the legal adviser must confirm come
// from src/lib/privacy-policy.ts; review notes show only until the text is legally reviewed.
const policy = PRIVACY_POLICY;
const draft = pendingPolicyFields().length > 0;

function Pending({ children }: { children: ReactNode }) {
  return (
    <mark className="rounded-md border border-dashed border-foreground/30 bg-highlight/40 px-1.5 text-foreground">
      [Pendiente: {children}]
    </mark>
  );
}
const value = (v: string | null, label: string) => v ?? <Pending>{label}</Pending>;

function LegalNote({ topic }: { topic: LegalReviewKey }) {
  if (policy.legalReviewed) return null;
  return (
    <p className="rounded-2xl border-l-4 border-highlight bg-secondary px-5 py-4 text-sm leading-relaxed text-foreground">
      <strong>Validación legal:</strong> {LEGAL_REVIEW[topic]}
    </p>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-28 border-t border-border pt-10"
    >
      <h2 id={`${id}-title`} className="text-[1.6rem] font-bold leading-tight sm:text-3xl">
        {title}
      </h2>
      <div className="mt-5 space-y-4 leading-relaxed text-foreground/85">{children}</div>
    </section>
  );
}

const Subheading = ({ children }: { children: ReactNode }) => (
  <h3 className="pt-2 text-lg font-semibold">{children}</h3>
);

const List = ({ items }: { items: ReactNode[] }) => (
  <ul className="list-disc space-y-2 pl-5 marker:text-primary">
    {items.map((item, i) => (
      <li key={i}>{item}</li>
    ))}
  </ul>
);

function Facts({ rows }: { rows: [ReactNode, ReactNode][] }) {
  return (
    <dl className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
      {rows.map(([term, detail], i) => (
        <div
          key={i}
          className="grid gap-1 px-5 py-4 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] sm:gap-4"
        >
          <dt className="font-medium text-primary">{term}</dt>
          <dd className="min-w-0 break-words">{detail}</dd>
        </div>
      ))}
    </dl>
  );
}

const providers: { name: string; role: string; data: string; location: string }[] = [
  {
    name: "Supabase, Inc.",
    role: "Base de datos donde se guardan las solicitudes y autenticación del panel interno del equipo.",
    data: "Todos los datos del formulario, del seguimiento y de las autorizaciones.",
    location: "Estados Unidos (región us-east-1, Virginia del Norte).",
  },
  {
    name: "Vercel Inc.",
    role: "Alojamiento y funcionamiento del sitio web.",
    data: "Datos del formulario mientras se procesan y registros técnicos de cada visita, como la dirección IP y el navegador.",
    location: "Estados Unidos y red global de distribución.",
  },
  {
    name: "Cloudflare, Inc. (Turnstile)",
    role: "Verificación de seguridad del formulario para distinguir personas de programas automáticos.",
    data: "Dirección IP y señales técnicas del navegador y de la conexión.",
    location: "Red global.",
  },
  {
    name: "Google LLC (Google Fonts)",
    role: "Tipografías del sitio, que tu navegador descarga al abrir la página.",
    data: "Dirección IP y datos técnicos del navegador.",
    location: "Red global.",
  },
  {
    name: "WhatsApp (Meta Platforms)",
    role: "Mensajería, cuando te contactamos o nos escribes por WhatsApp.",
    data: "Tu número de WhatsApp y el contenido de la conversación.",
    location: "Red global.",
  },
  {
    name: "Resend, Inc.",
    role: "Avisos internos por correo al equipo de Norita cuando llega una solicitud.",
    data: "No recibe tus datos personales: el aviso solo indica el tipo de servicio solicitado.",
    location: "Estados Unidos.",
  },
];

export const POLICY_SECTIONS = [
  ["responsable", "Responsable del tratamiento"],
  ["normativa", "Normativa aplicable en Perú y Colombia"],
  ["datos", "Datos que recogemos"],
  ["familiares", "Si nos escribes por un familiar"],
  ["datos-sensibles", "Información de salud y datos sensibles"],
  ["finalidades", "Finalidades y bases legales"],
  ["comerciales", "Comunicaciones comerciales"],
  ["conservacion", "Conservación de los datos"],
  ["proveedores", "Proveedores y terceros"],
  ["transferencias", "Transferencia internacional a Estados Unidos"],
  ["derechos", "Tus derechos y cómo ejercerlos"],
  ["seguridad", "Seguridad de la información"],
  ["menores", "Menores de edad"],
  ["cambios", "Cambios en esta política"],
] as const;

export function PrivacyPolicy() {
  const channel = value(policy.contact.channel, "canal de contacto para privacidad");
  return (
    <article className="space-y-10">
      <header>
        <p className="eyebrow text-primary">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-highlight" />
          Norita · Privacidad
        </p>
        <h1 className="mt-5 text-[2.4rem] leading-[1.05] sm:text-6xl">Política de privacidad</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Versión {policy.version} · Última actualización: {policy.updatedAt}
        </p>
        {draft && (
          <div
            role="status"
            className="mt-8 rounded-2xl border-l-4 border-highlight bg-secondary px-5 py-4 text-sm leading-relaxed"
          >
            <p className="font-semibold text-primary">Borrador pendiente de aprobación</p>
            <p className="mt-1">
              Este texto todavía no está aprobado: faltan los datos marcados como pendientes y su
              validación legal. Mientras tanto, el formulario de contacto no recoge solicitudes.
            </p>
          </div>
        )}
        <div className="mt-6 space-y-4 leading-relaxed text-foreground/85">
          <p>
            Norita es un proyecto en etapa de formación que acompaña a familias en el cuidado de sus
            padres y madres mayores. Esta política explica qué datos personales tratamos cuando
            visitas este sitio web y, en especial, cuando nos envías una solicitud de información
            mediante el formulario de contacto: para qué los usamos, con quién los compartimos,
            dónde se almacenan, cuánto tiempo los conservamos y cómo puedes ejercer tus derechos.
          </p>
          <p>
            El formulario solo recoge datos básicos de contacto y el servicio que te interesa. No
            recoge historiales médicos ni información clínica. La aplicación de Norita que
            presentamos en este sitio es una vista ilustrativa; si en el futuro la ofrecemos,
            contará con su propia información sobre el tratamiento de datos.
          </p>
        </div>
      </header>

      <nav aria-label="Contenido de la política" className="rounded-[1.5rem] bg-card p-6 sm:p-7">
        <p className="font-display text-lg font-bold text-primary">Contenido</p>
        <ol className="mt-3 grid list-decimal gap-x-8 gap-y-1.5 pl-5 text-sm sm:grid-cols-2">
          {POLICY_SECTIONS.map(([id, title]) => (
            <li key={id}>
              <a href={`#${id}`} className="text-primary underline-offset-4 hover:underline">
                {title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <Section id="responsable" title="1. Responsable del tratamiento">
        <p>
          Norita todavía no está constituida como sociedad y se gestiona desde Perú. Mientras tanto,
          actúa como responsable del tratamiento de tus datos personales la persona natural que
          dirige el proyecto:
        </p>
        <Facts
          rows={[
            [
              "Responsable",
              value(
                policy.controller.fullName,
                "nombre completo de la persona natural responsable",
              ),
            ],
            [
              "Documento de identificación",
              value(policy.controller.idDocument, "documento de identidad o RUC"),
            ],
            ["Domicilio", value(policy.controller.address, "domicilio en Perú")],
            ["Canal de contacto para privacidad", channel],
            [
              "Teléfono",
              value(
                policy.contact.phone,
                "teléfono de contacto o confirmación de que no se publica",
              ),
            ],
          ]}
        />
        <p>
          Mientras no tengamos un correo corporativo, atendemos los asuntos de privacidad mediante
          un canal de contacto provisional dedicado exclusivamente a ellos. Que Norita no esté
          constituida como sociedad no la exime de cumplir la normativa de protección de datos: la
          persona responsable asume esas obligaciones. Cuando se constituya la sociedad,
          actualizaremos esta política e informaremos de quién pasa a ser responsable.
        </p>
        <LegalNote topic="controller" />
      </Section>

      <Section id="normativa" title="2. Normativa aplicable en Perú y Colombia">
        <Subheading>Perú</Subheading>
        <p>
          El proyecto se gestiona desde Perú, por lo que el tratamiento se rige por la Ley N.º
          29733, Ley de Protección de Datos Personales, y su reglamento vigente. Entre otras
          obligaciones, la persona responsable debe informarte sobre el tratamiento, obtener tu
          consentimiento cuando corresponda, aplicar medidas de seguridad, atender tus derechos e
          inscribir el banco de datos ante la autoridad.
        </p>
        <Facts
          rows={[
            [
              "Inscripción del banco de datos",
              value(
                policy.peru.databankRegistration,
                "número de inscripción en el Registro Nacional de Protección de Datos Personales o estado del trámite",
              ),
            ],
            [
              "Autoridad de control",
              "Autoridad Nacional de Protección de Datos Personales, del Ministerio de Justicia y Derechos Humanos.",
            ],
          ]}
        />
        <LegalNote topic="peru" />
        <Subheading>Colombia</Subheading>
        <p>
          Dirigimos nuestros servicios también a familias en Colombia. La protección de datos en
          Colombia se rige por la Ley 1581 de 2012 y sus normas reglamentarias. Con independencia de
          cómo se aplique esa ley a un responsable que no tiene domicilio en Colombia, a las
          personas en Colombia les reconocemos los derechos descritos en la sección 11 y atendemos
          sus solicitudes por el mismo canal.
        </p>
        <Facts
          rows={[
            [
              "Aplicación de la Ley 1581 de 2012",
              value(
                policy.colombia.applicability,
                "conclusión del asesor legal y obligaciones resultantes",
              ),
            ],
            [
              "Registro Nacional de Bases de Datos",
              value(policy.colombia.rnbd, "confirmar si procede"),
            ],
            ["Autoridad de control", "Superintendencia de Industria y Comercio."],
          ]}
        />
        <LegalNote topic="colombia" />
      </Section>

      <Section id="datos" title="3. Datos que recogemos">
        <Subheading>Datos que nos facilitas en el formulario</Subheading>
        <List
          items={[
            "Nombre completo.",
            "Correo electrónico.",
            "Número de teléfono o WhatsApp, con su prefijo internacional.",
            "País y ciudad donde necesitas el servicio.",
            "Servicio que te interesa.",
            <>
              Tus autorizaciones: la necesaria para atender tu solicitud (obligatoria) y la de
              comunicaciones comerciales (opcional), con la fecha y hora de cada una y la versión de
              esta política que aceptaste.
            </>,
          ]}
        />
        <p>El formulario no tiene campos de texto libre ni pide otros datos.</p>
        <Subheading>Datos que generamos al gestionar tu solicitud</Subheading>
        <List
          items={[
            "Un identificador de la solicitud y su fecha de recepción.",
            "El estado del seguimiento, las notas internas del equipo y las fechas de último contacto y próximo seguimiento.",
            "La relación con otras solicitudes enviadas con el mismo número de teléfono, para no perder consultas repetidas.",
            "Si te das de baja de las comunicaciones comerciales, la fecha y el canal por el que lo pediste.",
            "Un registro de qué miembro autorizado del equipo consultó o modificó las solicitudes, con los nombres de los campos cambiados pero sin su contenido.",
          ]}
        />
        <Subheading>Datos técnicos y de seguridad</Subheading>
        <List
          items={[
            "Para limitar el número de envíos desde una misma conexión, calculamos un código a partir de tu dirección IP. No guardamos la dirección IP en claro. Los códigos con más de 24 horas se eliminan automáticamente cada vez que se recibe un nuevo envío.",
            "Cloudflare Turnstile analiza señales técnicas de tu navegador y de tu conexión para comprobar que el envío lo hace una persona.",
            "Nuestro proveedor de alojamiento registra datos técnicos de las visitas, como la dirección IP, el navegador y la fecha, para el funcionamiento y la seguridad del sitio.",
            "Al abrir el sitio, tu navegador descarga las tipografías desde Google Fonts, que recibe tu dirección IP.",
          ]}
        />
        <p>
          No usamos cookies de analítica ni de publicidad, ni elaboramos perfiles. La verificación
          de seguridad de Cloudflare puede usar mecanismos técnicos estrictamente necesarios para
          funcionar.
        </p>
      </Section>

      <Section id="familiares" title="4. Si nos escribes por un familiar">
        <p>
          Muchas solicitudes las envía un hijo, una hija u otro familiar interesado en un servicio
          para una persona adulta mayor. En ese caso, los datos que tratamos son los tuyos: tus
          datos de contacto, el servicio que te interesa y la ciudad donde se prestaría. No pedimos
          el nombre, la edad, el documento ni información de salud de la persona adulta mayor.
        </p>
        <p>
          Tu autorización cubre únicamente el tratamiento de tus propios datos. No sustituye la
          voluntad de la persona adulta mayor ni nos autoriza a tratar sus datos. Si tu solicitud
          avanza hacia la prestación de un servicio, pediremos la información necesaria sobre ella
          directamente a la propia persona o a quien pueda autorizarlo válidamente según la
          normativa aplicable, y le informaremos sobre su tratamiento.
        </p>
        <p>
          En esta etapa, te pedimos que no nos envíes por ningún canal, tampoco por WhatsApp o
          correo, información de salud ni otros datos personales de tu familiar.
        </p>
        <LegalNote topic="family" />
      </Section>

      <Section id="datos-sensibles" title="5. Información de salud y datos sensibles">
        <p>
          No pedimos ni queremos recibir datos sensibles en esta etapa: ni diagnósticos, ni
          medicamentos, ni historiales médicos, ni otra información de salud. El formulario no tiene
          campos de texto libre donde puedan escribirse. Si aun así recibimos esa información por
          otro canal, la trataremos con reserva, solo para atender tu solicitud, y no la
          conservaremos más allá de lo necesario.
        </p>
        <p>
          Algunos servicios, como el acompañamiento a citas médicas o la recogida de medicamentos,
          pueden indicar de forma indirecta que una persona necesita atención de salud. Usamos el
          servicio de interés únicamente para responderte y organizar la atención, lo consulta solo
          el equipo autorizado de Norita y no lo usamos con fines comerciales sin tu autorización.
        </p>
        <LegalNote topic="sensitive" />
      </Section>

      <Section id="finalidades" title="6. Finalidades y bases legales">
        <p>Tratamos tus datos para estas finalidades:</p>
        <Facts
          rows={[
            [
              "Atender tu solicitud",
              "Contactarte por WhatsApp, llamada o correo, orientarte sobre el servicio adecuado y coordinar la atención. Base: tu consentimiento o autorización en el formulario y las gestiones previas a una posible contratación que tú solicitas.",
            ],
            [
              "Hacer seguimiento interno",
              "Registrar el estado de tu solicitud, las notas del equipo y los recordatorios, y relacionar consultas repetidas. Base: la misma autorización.",
            ],
            [
              "Proteger el formulario y los datos",
              "Evitar envíos automáticos o abusivos y controlar el acceso del equipo a la información. Base: tu autorización y el deber de seguridad que impone la normativa de protección de datos.",
            ],
            [
              "Avisar al equipo",
              "Informar internamente de que llegó una solicitud nueva, sin incluir tus datos personales en el aviso. Base: la autorización para atender tu solicitud.",
            ],
            [
              "Enviarte comunicaciones comerciales",
              "Informarte sobre servicios, novedades o promociones de Norita, solo si marcaste la casilla opcional. Base: tu consentimiento específico, que puedes retirar en cualquier momento.",
            ],
            [
              "Cumplir obligaciones legales",
              "Atender requerimientos de autoridades competentes y conservar la prueba de tus autorizaciones. Base: el cumplimiento de obligaciones legales.",
            ],
          ]}
        />
        <p>No vendemos tus datos ni los usamos para tomar decisiones automatizadas sobre ti.</p>
        <LegalNote topic="bases" />
      </Section>

      <Section id="comerciales" title="7. Comunicaciones comerciales">
        <p>
          La autorización para recibir comunicaciones comerciales es independiente de la necesaria
          para atender tu solicitud. La casilla aparece sin marcar, es opcional y no marcarla no
          afecta a la atención de tu consulta.
        </p>
        <p>
          Puedes retirar esa autorización en cualquier momento escribiéndonos a {channel} o
          indicándolo cuando te contactemos. Registramos la fecha y el canal de la baja, y la
          aplicamos a todas las solicitudes asociadas a tu número de teléfono, incluidas las que
          envíes en el futuro. Retirarla no afecta a la atención de tu solicitud.
        </p>
      </Section>

      <Section id="conservacion" title="8. Conservación de los datos">
        <p>
          Conservamos tus datos solo durante el tiempo necesario para las finalidades descritas y
          para cumplir nuestras obligaciones legales:
        </p>
        <Facts
          rows={[
            [
              "Solicitudes de información",
              value(
                policy.retention.inquiries,
                "plazo para solicitudes que no terminan en contratación",
              ),
            ],
            [
              "Prueba de la autorización comercial",
              value(policy.retention.marketingConsent, "plazo de conservación"),
            ],
            [
              "Registro de bajas comerciales",
              value(policy.retention.optOut, "plazo durante el que se respeta y conserva la baja"),
            ],
            [
              "Registro de consultas y cambios del equipo",
              value(policy.retention.auditLog, "plazo de conservación"),
            ],
            [
              "Códigos para limitar envíos",
              "Se eliminan automáticamente una vez superadas las 24 horas, con el siguiente envío que recibe el formulario.",
            ],
          ]}
        />
        <p>
          Cuando termina el plazo, eliminamos los datos o los anonimizamos. La eliminación la
          realiza personal autorizado con acceso a la base de datos; el panel interno del equipo no
          permite borrar solicitudes ni modificar las autorizaciones registradas. Si llegas a
          contratar un servicio, los datos necesarios para prestarlo se rigen por las condiciones de
          ese servicio.
        </p>
      </Section>

      <Section id="proveedores" title="9. Proveedores y terceros">
        <p>
          Para que el sitio funcione usamos proveedores que tratan datos por cuenta de Norita, según
          nuestras instrucciones y sus condiciones de servicio:
        </p>
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {providers.map((p) => (
            <div key={p.name} className="space-y-1 px-5 py-4">
              <h3 className="font-semibold text-primary">{p.name}</h3>
              <p>{p.role}</p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Datos:</span> {p.data}{" "}
                <span className="font-medium text-foreground">Ubicación:</span> {p.location}
              </p>
            </div>
          ))}
        </div>
        <p>
          Hoy no compartimos tus datos con ningún sistema de gestión comercial (CRM) ni con terceros
          para sus propios fines comerciales. Si incorporamos un proveedor que vaya a recibir tus
          datos, actualizaremos esta política antes de hacerlo. También podemos comunicar datos a
          autoridades públicas cuando la ley lo exija.
        </p>
        <LegalNote topic="providers" />
      </Section>

      <Section id="transferencias" title="10. Transferencia internacional a Estados Unidos">
        <p>
          Al enviar el formulario, tus datos salen de Perú o de Colombia: se guardan en una base de
          datos de Supabase alojada en Estados Unidos (región us-east-1, Virginia del Norte) y se
          procesan en servidores de Vercel en Estados Unidos. Otros proveedores de la sección 9
          también pueden tratarlos fuera de tu país. Esto constituye un flujo transfronterizo de
          datos personales según la normativa peruana y una transmisión o transferencia
          internacional según la normativa colombiana.
        </p>
        <p>
          Elegimos proveedores que aplican medidas de seguridad reconocidas. La normativa de cada
          país exige requisitos específicos para estos envíos; el mecanismo que los legitima es el
          siguiente:
        </p>
        <Facts
          rows={[
            [
              "Perú",
              value(
                policy.peru.crossBorderMechanism,
                "mecanismo que legitima el flujo transfronterizo y comunicaciones a la autoridad, si proceden",
              ),
            ],
            [
              "Colombia",
              value(
                policy.colombia.transferMechanism,
                "mecanismo para la transmisión o transferencia internacional",
              ),
            ],
          ]}
        />
        <LegalNote topic="transfers" />
      </Section>

      <Section id="derechos" title="11. Tus derechos y cómo ejercerlos">
        <Subheading>Si la normativa peruana se aplica a tu caso</Subheading>
        <p>
          Tienes derecho de acceso, rectificación y actualización, inclusión, cancelación o
          supresión y oposición al tratamiento, y puedes revocar tu consentimiento. Si consideras
          que no atendimos adecuadamente tu solicitud, puedes acudir a la Autoridad Nacional de
          Protección de Datos Personales.
        </p>
        <Subheading>Si estás en Colombia</Subheading>
        <p>
          Tienes derecho a conocer, actualizar y rectificar tus datos; solicitar prueba de la
          autorización otorgada; ser informado del uso que hacemos de ellos; revocar la autorización
          o solicitar la supresión de los datos cuando proceda; acceder gratuitamente a ellos; y
          presentar quejas ante la Superintendencia de Industria y Comercio.
        </p>
        <Subheading>Cómo ejercerlos</Subheading>
        <p>
          Escríbenos a {channel} indicando tu nombre, el correo o el número de teléfono que usaste
          en la solicitud, el derecho que quieres ejercer y, si actúas en representación de otra
          persona, el documento que lo acredite. Antes de entregar o modificar datos verificaremos
          tu identidad; nunca hacemos búsquedas públicas por teléfono. No envíes documentación
          médica por este canal. El ejercicio de tus derechos es gratuito y responderemos dentro de
          los plazos que establece la normativa aplicable.
        </p>
        <LegalNote topic="rights" />
      </Section>

      <Section id="seguridad" title="12. Seguridad de la información">
        <p>Aplicamos medidas técnicas y organizativas para proteger tus datos, entre ellas:</p>
        <List
          items={[
            "Conexiones cifradas (HTTPS) entre tu navegador, el sitio y la base de datos.",
            "Verificación de seguridad y límite de envíos en el formulario. La dirección IP solo se guarda como código y durante un tiempo breve.",
            "Acceso a las solicitudes limitado a miembros del equipo autorizados expresamente, con contraseña y un segundo factor de verificación.",
            "Reglas de acceso en la base de datos que impiden que los visitantes del sitio lean o modifiquen solicitudes.",
            "Registro de las consultas y modificaciones que hace el equipo, y registros técnicos que no incluyen el contenido de tus datos.",
            "Las autorizaciones que otorgaste no se pueden modificar desde el panel interno.",
          ]}
        />
        <p>
          Ningún sistema es completamente invulnerable. Si se produjera un incidente que afecte a
          tus datos, actuaremos para contenerlo e informaremos a las autoridades y a las personas
          afectadas cuando la normativa lo exija.
        </p>
      </Section>

      <Section id="menores" title="13. Menores de edad">
        <p>
          Nuestros servicios están dirigidos a familias que buscan apoyo para personas adultas
          mayores. El formulario debe completarlo una persona mayor de edad. Si eres menor de edad,
          no nos envíes tus datos.
        </p>
      </Section>

      <Section id="cambios" title="14. Cambios en esta política">
        <p>
          Actualizaremos esta política cuando cambien nuestros servicios, nuestros proveedores, la
          normativa o la situación de Norita; en particular, cuando se constituya la sociedad.
          Siempre publicaremos aquí la versión vigente con su número y su fecha de actualización.
          Cada solicitud guarda la versión de la política que se aceptó al enviarla.
        </p>
        <p>
          Si un cambio afecta a finalidades que requieren tu autorización, te pediremos una nueva
          autorización antes de aplicarlo. Puedes pedirnos las versiones anteriores escribiéndonos a{" "}
          {channel}.
        </p>
      </Section>
    </article>
  );
}
