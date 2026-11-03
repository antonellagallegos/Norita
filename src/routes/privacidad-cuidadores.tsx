import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dot } from "@/components/brand";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { pageHead } from "@/lib/page-head";
import { CAREGIVER_PRIVACY, pendingCaregiverPolicyItems } from "@/lib/caregiver-privacy";
import { PRIVACY_POLICY } from "@/lib/privacy-policy";

// Privacy notice for caregiver applicants. DRAFT until every fact in src/lib/caregiver-privacy.ts is
// filled and legally reviewed; the application form stays disabled until then.
export const Route = createFileRoute("/privacidad-cuidadores")({
  head: () =>
    pageHead(
      "Aviso de privacidad para postulantes | Norita",
      "Cómo trata Norita los datos de las personas que postulan como cuidadoras o acompañantes, y cómo ejercer sus derechos.",
    ),
  component: CaregiverPrivacyPage,
});

function Pending({ children }: { children: ReactNode }) {
  return (
    <mark className="rounded-md border border-dashed border-foreground/30 bg-highlight/40 px-1.5 text-foreground">
      [Pendiente: {children}]
    </mark>
  );
}
const value = (v: string | null, label: string) => v ?? <Pending>{label}</Pending>;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-border pt-10">
      <h2 className="text-[1.6rem] font-bold leading-tight sm:text-3xl">{title}</h2>
      <div className="mt-5 space-y-4 leading-relaxed text-foreground/85">{children}</div>
    </section>
  );
}

const List = ({ items }: { items: ReactNode[] }) => (
  <ul className="list-disc space-y-2 pl-5 marker:text-primary">
    {items.map((item, i) => (
      <li key={i}>{item}</li>
    ))}
  </ul>
);

function CaregiverPrivacyPage() {
  const pending = pendingCaregiverPolicyItems();
  const shared = PRIVACY_POLICY;
  return (
    <div className="bg-background text-foreground">
      <SiteHeader audience="caregivers" />
      <main className="frame py-10 md:py-16">
        <article className="mx-auto max-w-4xl space-y-10">
          <header>
            <p className="eyebrow text-primary">
              <Dot className="h-2 w-2 bg-highlight" />
              Postulantes · Versión {CAREGIVER_PRIVACY.version}
            </p>
            <h1 className="mt-5 text-[2.4rem] leading-[1.04] sm:text-6xl">
              Aviso de privacidad para postulantes
            </h1>
            <p className="mt-5 text-muted-foreground">
              Última actualización: {CAREGIVER_PRIVACY.updatedAt}
            </p>
            {pending.length > 0 && (
              <div className="mt-8 rounded-2xl border-l-4 border-highlight bg-secondary px-5 py-4 text-sm leading-relaxed">
                <p className="font-semibold">Borrador pendiente de validación legal.</p>
                <p className="mt-1">
                  Mientras este aviso no esté aprobado, el formulario de postulación permanece
                  desactivado y no recibimos postulaciones.
                </p>
              </div>
            )}
          </header>

          <Section title="Responsable del tratamiento">
            <p>
              El responsable es{" "}
              {value(shared.controller.fullName, "nombre de la persona responsable")}, con domicilio
              en {value(shared.controller.address, "domicilio en Perú")}, que gestiona el proyecto
              Norita. Puedes escribirnos sobre privacidad a{" "}
              {value(shared.contact.channel, "canal de contacto para privacidad")}. Este aviso
              complementa la{" "}
              <a href="/privacidad" className="text-primary underline">
                política de privacidad general
              </a>
              .
            </p>
          </Section>

          <Section title="Datos que recogemos al postular">
            <List
              items={[
                "Nombre completo y teléfono de contacto.",
                "País, ciudad y distrito o localidad donde vives o prefieres trabajar.",
                "Años y tipo de experiencia cuidando adultos mayores.",
                "Formación o certificaciones relacionadas, tal como las declaras.",
                "Días y franjas de disponibilidad, y los servicios que puedes realizar.",
                "Tu confirmación de ser mayor de 18 años y tus autorizaciones, con la fecha y la versión de este aviso.",
              ]}
            />
            <p>
              <strong>No pedimos</strong> documentos de identidad, certificados, fotografías, datos
              de salud, dirección exacta ni información sobre las personas a las que hayas cuidado.
              Los documentos necesarios se solicitan solo más adelante, en la etapa de verificación,
              y se te informará entonces de su tratamiento.
            </p>
          </Section>

          <Section title="Para qué usamos tus datos">
            <List
              items={[
                "Evaluar tu postulación y contactarte para una entrevista.",
                "Proponerte oportunidades según tu zona, disponibilidad y servicios.",
                "Solo si lo autorizas: conservar tu postulación para futuras oportunidades.",
              ]}
            />
            <p>
              Tus datos se guardan separados de los datos de las familias, no se envían al CRM
              comercial y no se usan para publicidad.
            </p>
          </Section>

          <Section title="Conservación">
            <p>
              Las postulaciones que no terminan en incorporación se conservan durante{" "}
              {value(
                CAREGIVER_PRIVACY.retention.applications,
                "plazo de conservación de postulaciones",
              )}
              . Si autorizas que te tengamos en cuenta para futuras oportunidades, durante{" "}
              {value(
                CAREGIVER_PRIVACY.retention.talentPool,
                "plazo de la base de futuras oportunidades",
              )}
              , o hasta que retires tu autorización.
            </p>
          </Section>

          <Section title="Proveedores y transferencia internacional">
            <p>
              Usamos los mismos proveedores técnicos que se describen en la política general:
              Supabase (base de datos, Estados Unidos), Vercel (alojamiento del sitio), Cloudflare
              Turnstile (verificación de seguridad) y Google Fonts (tipografías). Las postulaciones
              no se comparten con el CRM ni con el servicio de avisos por correo.
            </p>
          </Section>

          <Section title="Tus derechos">
            <p>
              Puedes acceder, rectificar, cancelar u oponerte al tratamiento de tus datos, y retirar
              tu autorización en cualquier momento, escribiendo a{" "}
              {value(shared.contact.channel, "canal de contacto para privacidad")}. El procedimiento
              y los plazos son los de la{" "}
              <a href="/privacidad" className="text-primary underline">
                política general
              </a>
              .
            </p>
          </Section>

          <Section title="Modalidad de colaboración">
            <p>
              {value(
                CAREGIVER_PRIVACY.hiring.modality,
                "modalidad de colaboración o contratación de cuidadores",
              )}
            </p>
          </Section>

          {pending.length > 0 && (
            <section className="rounded-2xl border border-dashed border-foreground/30 bg-card p-6">
              <h2 className="text-xl font-bold">Pendiente antes de publicar</h2>
              <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm">
                {pending.map((p) => (
                  <li key={p.label}>
                    {p.label} <span className="text-muted-foreground">({p.owner})</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="border-t border-border pt-8">
            <Button asChild variant="outline" size="lg">
              <a href="/cuidadores#postular">
                Volver a la postulación <ArrowRight />
              </a>
            </Button>
          </div>
        </article>
      </main>
      <SiteFooter audience="caregivers" />
    </div>
  );
}
