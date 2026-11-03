import { ArrowRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  ArcShape,
  delay,
  DiagonalShape,
  Dot,
  Eyebrow,
  HalfDisc,
  ModuleGrid,
  Pill,
} from "@/components/brand";
import { CaregiverApplicationForm } from "@/components/caregivers/application-form";
// Provisional photography (Pexels license, see src/assets/PHOTO_CREDITS.md) until Norita's own shoot.
import heroPhoto from "@/assets/cg-hero.jpg";
import supportPhoto from "@/assets/cg-support.jpg";
import carePhoto from "@/assets/cg-care.jpg";
import movementPhoto from "@/assets/cg-movement.jpg";
import teamPhoto from "@/assets/cg-team.jpg";
import trainingPhoto from "@/assets/cg-training.jpg";
import bondPhoto from "@/assets/cg-bond.jpg";

// Copy for caregivers. Benefits confirmed by Norita; amounts, schedules and positions are never promised.
function ApplyButton({ variant = "highlight" }: { variant?: "highlight" | "default" }) {
  return (
    <Button asChild size="lg" variant={variant}>
      <a href="#postular">
        Postular <ArrowRight />
      </a>
    </Button>
  );
}

export function CaregiverHero() {
  return (
    <section className="on-dark relative overflow-hidden bg-primary text-primary-foreground">
      <Dot className="absolute -left-40 bottom-[-12rem] h-[26rem] w-[26rem] bg-primary-foreground/[0.05]" />
      <div className="frame relative grid items-center gap-12 pb-20 pt-10 md:pt-14 lg:min-h-[min(calc(100svh-4.5rem),52rem)] lg:grid-cols-12 lg:gap-8 lg:py-12">
        <div className="min-w-0 animate-rise lg:col-span-6">
          <Eyebrow dark>Trabaja con Norita · Lima y Bogotá</Eyebrow>
          <h1 className="mt-6 text-[3.1rem] leading-[0.98] tracking-[-0.045em] sm:text-7xl lg:text-[5.6rem]">
            Tu vocación merece{" "}
            <span className="relative isolate ml-[0.12em] inline-block text-highlight-foreground">
              <span
                aria-hidden="true"
                className="absolute inset-x-[-0.14em] bottom-[0.04em] top-[0.16em] -z-10 -rotate-2 rounded-full bg-highlight"
              />
              más.
            </span>
          </h1>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-primary-foreground/85">
            En Norita buscamos cuidadores y acompañantes que quieran crecer haciendo lo que mejor
            saben hacer: cuidar. Postula y conversemos sobre las oportunidades que encajan con tu
            tiempo.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ApplyButton />
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/40 text-primary-foreground hover:border-primary-foreground hover:bg-primary-foreground/10"
            >
              <a href="#proceso">
                Ver cómo funciona <ArrowRight />
              </a>
            </Button>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-[30rem] sm:max-w-[36rem] lg:col-span-6 lg:max-w-none">
          <div className="relative ml-auto aspect-[4/5] w-[90%] lg:aspect-auto lg:h-[min(72svh,40rem)]">
            <img
              src={heroPhoto}
              alt="Cuidadora con chaqueta amarilla acompañando a un hombre mayor durante ejercicios de movilidad"
              width={1400}
              height={933}
              fetchPriority="high"
              className="h-full w-full rounded-[2rem] rounded-tr-[11rem] object-cover object-[38%_50%] sm:rounded-tr-[16rem]"
            />
            <ArcShape className="absolute -bottom-6 -left-8 w-28 text-highlight sm:w-40" />
          </div>
          <div className="absolute bottom-12 left-0 max-w-[15rem] rounded-[1.5rem] bg-card p-4 text-foreground shadow-soft sm:bottom-20">
            <p className="font-display text-lg font-extrabold leading-tight text-primary">
              Formación y certificación
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              para crecer como profesional del cuidado.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CaregiverValue() {
  return (
    <section className="py-24 md:py-32">
      <div className="frame">
        <h2
          data-reveal
          className="max-w-6xl text-[2.3rem] leading-[1.04] tracking-[-0.04em] sm:text-6xl lg:text-[4.4rem]"
        >
          Cuidar es un trabajo <Pill src={bondPhoto} /> y merece{" "}
          <span className="underline decoration-highlight decoration-[0.14em] underline-offset-[0.14em]">
            tratarse como tal
          </span>{" "}
          <Pill src={carePhoto} />
        </h2>
        <div data-reveal className="mt-14 grid gap-8 border-t border-border pt-10 md:grid-cols-12">
          <p className="font-display text-xl font-bold leading-snug text-primary md:col-span-5 lg:col-span-4">
            Queremos ser el lugar donde los cuidadores encuentran mejores oportunidades,
            flexibilidad y reconocimiento.
          </p>
          <p className="text-lg leading-relaxed text-muted-foreground md:col-span-6 md:col-start-7">
            Acompañar a un adulto mayor exige paciencia, criterio y mucho corazón. En Norita
            valoramos ese trabajo: te conectamos con familias que necesitan acompañamiento, te
            formamos y te acompañamos para que puedas crecer profesionalmente.
          </p>
        </div>
      </div>
    </section>
  );
}

const benefitGroups = [
  {
    title: "Tu tiempo",
    tone: "bg-highlight text-highlight-foreground",
    items: [
      "Trabajo por horas y oportunidades compatibles con tu disponibilidad.",
      "Flexibilidad de horarios.",
      "Oportunidades cerca de tu zona, cuando sea posible.",
    ],
  },
  {
    title: "Tus ingresos",
    tone: "on-dark bg-primary text-primary-foreground",
    items: [
      "La posibilidad de generar ingresos adicionales.",
      "Pagos puntuales y condiciones transparentes.",
    ],
  },
  {
    title: "Tu crecimiento",
    tone: "bg-card text-foreground ring-1 ring-inset ring-border",
    items: [
      "Formación, capacitación y certificación.",
      "Reconocimiento profesional.",
      "Crecimiento y especialización.",
    ],
  },
  {
    title: "Tu entorno",
    tone: "bg-secondary text-foreground",
    items: [
      "Buen ambiente laboral y acompañamiento.",
      "Beneficios laborales conforme a la modalidad de contratación.",
    ],
  },
];

export function BenefitsMosaic() {
  return (
    <section id="beneficios" className="scroll-mt-20 bg-secondary/50 py-20 md:py-28">
      <div className="frame">
        <div data-reveal className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Eyebrow>Beneficios</Eyebrow>
            <h2 className="mt-5 text-[2.2rem] leading-[1.04] sm:text-5xl lg:text-6xl">
              Lo que encuentras en Norita.
            </h2>
          </div>
          <p className="text-lg leading-relaxed text-muted-foreground lg:col-span-4 lg:col-start-9">
            Las condiciones concretas de cada oportunidad te las explicamos con claridad antes de
            empezar.
          </p>
        </div>
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-[auto_auto]">
          {benefitGroups.map((g, i) => (
            <article
              key={g.title}
              data-reveal
              style={delay(i * 90)}
              className={`relative flex min-h-[17rem] flex-col overflow-hidden rounded-[1.75rem] p-7 ${g.tone} ${i === 0 ? "lg:row-span-2" : ""} ${i === 3 ? "lg:col-span-2" : ""}`}
            >
              <span className="font-display text-sm font-bold opacity-70">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-[1.9rem] leading-tight">{g.title}</h3>
              <ul className="mt-6 space-y-3">
                {g.items.map((item) => (
                  <li key={item} className="flex gap-3 leading-snug">
                    <Dot
                      className={`mt-[0.45rem] h-2 w-2 ${i === 0 ? "bg-primary" : i === 1 ? "bg-highlight" : "bg-primary"}`}
                    />
                    {item}
                  </li>
                ))}
              </ul>
              {i === 0 && (
                <ArcShape className="absolute -bottom-6 -right-6 mt-auto hidden w-40 text-primary lg:block" />
              )}
            </article>
          ))}
          <img
            data-reveal
            src={supportPhoto}
            alt="Cuidadora ayudando a un hombre mayor a caminar en casa"
            loading="lazy"
            className="h-full min-h-[17rem] w-full rounded-[1.75rem] object-cover md:col-span-2 lg:col-span-1 lg:col-start-4 lg:row-span-2 lg:row-start-1"
          />
        </div>
      </div>
    </section>
  );
}

const steps = [
  [
    "Postula en minutos",
    "Completa el formulario con tus datos de contacto, tu zona, tu experiencia y tu disponibilidad.",
  ],
  [
    "Conversamos contigo",
    "Te llamamos para conocerte, resolver tus dudas y explicarte cómo trabajamos.",
  ],
  [
    "Verificación y formación",
    "Revisamos tus referencias y documentos, y te formamos en el modelo de acompañamiento de Norita.",
  ],
  [
    "Tus primeros servicios",
    "Te proponemos oportunidades según tu zona, tu disponibilidad y los servicios que puedes realizar.",
  ],
] as const;

export function OnboardingSteps() {
  return (
    <section id="proceso" className="scroll-mt-20 py-20 md:py-28">
      <div className="frame">
        <div data-reveal className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <Eyebrow>Proceso de incorporación</Eyebrow>
            <h2 className="mt-5 text-[2.2rem] leading-[1.04] sm:text-5xl lg:text-6xl">
              De tu postulación a tu primer servicio.
            </h2>
          </div>
          <ApplyButton variant="default" />
        </div>
        <ol className="relative mt-16 grid gap-10 md:grid-cols-4 md:gap-6">
          <span
            aria-hidden="true"
            className="absolute left-7 right-[24%] top-7 hidden h-px bg-primary/20 md:block"
          />
          {steps.map(([t, d], i) => (
            <li
              key={t}
              data-reveal
              style={delay(i * 110)}
              className="relative grid grid-cols-[3.5rem_1fr] gap-5 md:block"
            >
              <span
                className={`relative grid h-14 w-14 place-items-center rounded-full font-display text-lg font-extrabold ring-8 ring-background ${["bg-highlight text-highlight-foreground", "bg-secondary text-primary", "bg-primary text-primary-foreground", "bg-ink text-ink-foreground"][i]}`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="md:mt-8">
                <h3 className="text-[1.45rem] leading-tight">{t}</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">{d}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-12 max-w-2xl rounded-2xl border-l-4 border-highlight bg-secondary px-5 py-4 text-sm leading-relaxed">
          Al postular no te pedimos documentos de identidad ni certificados. Los solicitamos más
          adelante, en la etapa de verificación.
        </p>
      </div>
    </section>
  );
}

export function TrainingSection() {
  return (
    <section
      id="formacion"
      className="scroll-mt-20 overflow-hidden bg-highlight text-highlight-foreground"
    >
      <div className="frame grid items-center gap-12 py-20 md:py-28 lg:grid-cols-12 lg:gap-10">
        <div className="relative mx-auto w-full max-w-sm lg:col-span-5 lg:max-w-none">
          <img
            src={trainingPhoto}
            alt="Grupo de personas participando en un taller de formación"
            loading="lazy"
            width={1000}
            height={1500}
            className="aspect-[4/5] w-full rounded-t-full rounded-b-[2rem] object-cover"
          />
          <HalfDisc className="absolute -bottom-6 -right-4 w-32 rotate-180 text-primary sm:w-40" />
        </div>
        <div className="min-w-0 lg:col-span-6 lg:col-start-7">
          <Eyebrow dot="bg-primary">Formación y certificación</Eyebrow>
          <h2 data-reveal className="mt-5 text-[2.2rem] leading-[1.04] sm:text-5xl lg:text-6xl">
            Aprende, certifícate y especialízate.
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed">
            Tengas o no experiencia previa, en Norita te formamos para acompañar con calidad y
            seguridad. Y si quieres seguir creciendo, puedes especializarte en los servicios que más
            te interesen.
          </p>
          <ul className="mt-10 grid gap-3 sm:grid-cols-3">
            {[
              ["Formación inicial", "en el modelo de acompañamiento de Norita."],
              ["Capacitación continua", "para especializarte por servicio."],
              ["Certificación", "que reconoce tu preparación."],
            ].map(([t, d], i) => (
              <li
                key={t}
                data-reveal
                style={delay(i * 90)}
                className="rounded-[1.5rem] bg-background/70 p-5"
              >
                <p className="font-display text-lg font-extrabold leading-tight text-primary">
                  {t}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed">{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function CommunitySection() {
  return (
    <section className="py-20 md:py-28">
      <div className="frame">
        <div className="on-dark relative overflow-hidden rounded-[2rem] bg-ink text-ink-foreground lg:rounded-[2.5rem]">
          <img
            src={teamPhoto}
            alt="Mujeres de distintas edades uniendo sus manos sobre una mesa de trabajo"
            loading="lazy"
            width={1400}
            height={933}
            className="absolute inset-0 h-full w-full object-cover opacity-45"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/20"
          />
          <div className="relative grid gap-10 px-6 py-14 sm:px-12 sm:py-20 lg:grid-cols-12 lg:px-16 lg:py-24">
            <div className="lg:col-span-7">
              <Eyebrow dark>Comunidad y acompañamiento</Eyebrow>
              <h2 data-reveal className="mt-5 text-[2.2rem] leading-[1.04] sm:text-5xl lg:text-6xl">
                Cuidar no debería ser un trabajo solitario.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-foreground/85">
                Detrás de cada servicio hay un equipo que te acompaña: para resolver dudas,
                coordinar con las familias y ayudarte a hacer tu trabajo con tranquilidad.
              </p>
            </div>
            <ul className="space-y-4 self-end lg:col-span-4 lg:col-start-9">
              {[
                "Un equipo de coordinación que te acompaña.",
                "Información clara antes de cada servicio.",
                "Un buen ambiente para aprender y crecer.",
              ].map((t, i) => (
                <li
                  key={t}
                  data-reveal
                  style={delay(i * 90)}
                  className="flex items-center gap-4 rounded-2xl bg-ink-foreground/10 px-5 py-4 font-medium backdrop-blur-sm"
                >
                  {
                    [
                      <Dot key="d" className="h-6 w-6 bg-highlight" />,
                      <ArcShape key="a" className="h-6 w-6 shrink-0 text-highlight" />,
                      <DiagonalShape key="g" className="h-6 w-6 shrink-0 text-highlight" />,
                    ][i]
                  }
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <img
            data-reveal
            src={movementPhoto}
            alt="Cuidador acompañando a un hombre mayor en ejercicios de estiramiento"
            loading="lazy"
            className="aspect-[4/3] w-full rounded-[1.75rem] object-cover sm:aspect-[16/9]"
          />
          <img
            data-reveal
            style={delay(100)}
            src={carePhoto}
            alt="Cuidadora apoyando a un hombre mayor sentado en casa"
            loading="lazy"
            className="aspect-[4/3] w-full rounded-[1.75rem] object-cover sm:aspect-[16/9]"
          />
        </div>
      </div>
    </section>
  );
}

const faqs = [
  [
    "¿Necesito experiencia para postular?",
    "No necesariamente. Valoramos la experiencia, pero también la vocación y las ganas de aprender. Si aún no tienes experiencia, te formamos.",
  ],
  [
    "¿Necesito estar certificado/a?",
    "No para postular. Cuéntanos tu formación en el formulario; en Norita ofrecemos formación, capacitación y certificación.",
  ],
  [
    "¿Cuánto se paga?",
    "Depende del servicio, la duración y la modalidad. Te explicamos las condiciones de cada oportunidad con claridad antes de empezar.",
  ],
  [
    "¿Qué tipo de contratación ofrecen?",
    "La modalidad de colaboración y los beneficios asociados te los explicamos en la entrevista, conforme a la modalidad de contratación que aplique.",
  ],
  [
    "¿En qué zonas buscan cuidadores?",
    "Por ahora, en Lima Metropolitana, Callao y Bogotá D.C. Siempre que es posible, te proponemos oportunidades cerca de tu zona.",
  ],
  [
    "¿Puedo elegir mis horarios?",
    "Sí. Nos indicas tu disponibilidad y te proponemos oportunidades compatibles con ella.",
  ],
  [
    "¿Qué documentos debo presentar?",
    "Ninguno al postular. Los documentos se solicitan más adelante, en la etapa de verificación.",
  ],
  [
    "¿Qué hacen con mis datos?",
    "Los usamos solo para evaluar tu postulación y contactarte, según el aviso de privacidad para postulantes. No los mezclamos con los datos de las familias.",
  ],
] as const;

export function CaregiverFaq() {
  return (
    <section id="preguntas" className="scroll-mt-20 border-t border-border py-20 md:py-28">
      <div className="frame grid gap-10 lg:grid-cols-12">
        <div className="lg:sticky lg:top-28 lg:col-span-4 lg:self-start">
          <Eyebrow>Preguntas frecuentes</Eyebrow>
          <h2 className="mt-5 text-[2.2rem] leading-[1.04] sm:text-5xl">
            Lo que quieres saber antes de postular.
          </h2>
        </div>
        <div className="lg:col-span-7 lg:col-start-6">
          <Accordion type="single" collapsible className="border-t border-primary/15">
            {faqs.map(([q, a], i) => (
              <AccordionItem key={q} value={`c${i}`} className="border-b border-primary/15">
                <AccordionTrigger className="min-h-16 gap-4 py-6 text-left font-display text-lg font-bold text-primary hover:no-underline sm:text-xl">
                  {q}
                </AccordionTrigger>
                <AccordionContent className="pb-7 pr-8 text-base leading-relaxed text-muted-foreground">
                  {a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

export function ApplicationSection() {
  return (
    <section
      id="postular"
      className="on-dark scroll-mt-20 bg-primary py-20 text-primary-foreground md:py-28"
    >
      <div className="frame grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="min-w-0 lg:sticky lg:top-28 lg:col-span-4 lg:self-start">
          <Eyebrow dark>Postulación</Eyebrow>
          <h2 className="mt-5 text-[2.2rem] leading-[1.04] sm:text-5xl">Da el primer paso.</h2>
          <p className="mt-6 text-lg leading-relaxed text-primary-foreground/85">
            Cuéntanos sobre ti. Solo te tomará unos minutos y no necesitas adjuntar documentos.
          </p>
          <ModuleGrid
            tiles={[
              ["yellow", "blue"],
              ["soft", "none"],
              ["warm", "blue"],
              ["yellow", "none"],
            ]}
            columns={2}
            className="mt-10 hidden w-36 lg:grid"
          />
        </div>
        <div className="min-w-0 rounded-[2rem] bg-card p-5 text-foreground shadow-soft sm:p-10 lg:col-span-8">
          <CaregiverApplicationForm />
        </div>
      </div>
    </section>
  );
}
