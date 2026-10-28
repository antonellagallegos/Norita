import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Heart, UserRound, ShieldCheck, Sprout, Check, Menu, X } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BRAND } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { NoritaAppSection } from "@/components/norita-app-section";
import { InformationButton, ScheduleCall } from "@/components/contact-options";
import { SERVICES } from "@/lib/leads";
import hero from "@/assets/norita-care.jpg";
import family from "@/assets/family.jpg";
import citas from "@/assets/citas.jpg";
import mente from "@/assets/mente.jpg";
import fuerza from "@/assets/fuerza.jpg";
import vida from "@/assets/vida.jpg";
import paseo from "@/assets/hero.jpg";

const TITLE = "Norita | Acompañamiento y bienestar para adultos mayores en Lima";
const DESC =
  "Acompañamiento a citas médicas, gimnasio mental y entrenamiento de fuerza para adultos mayores en Lima. Conoce Norita y encuentra el apoyo que tu familia necesita.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const btn =
  "inline-flex h-12 items-center justify-center gap-2 rounded-md px-6 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const btnPrimary = `${btn} bg-primary text-primary-foreground shadow-none hover:bg-primary/90`;
const btnGhost = `${btn} border border-primary/25 bg-background text-primary shadow-none hover:bg-secondary`;

// Every information CTA leads to the contact form; WhatsApp contact will be configured later.
function RequestInfoButton({ className = btnPrimary }: { className?: string }) {
  return (
    <Button asChild className={className}><Link to="/contacto">
      Solicitar información <ArrowRight className="h-4 w-4" />
    </Link></Button>
  );
}

function Logo() {
  return (
    <a href="#inicio" aria-label="Norita, inicio" className="flex min-w-0 items-center gap-2 font-display text-2xl font-semibold text-primary sm:gap-2.5 sm:text-[1.8rem]">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-secondary text-primary"><Heart className="h-5 w-5" strokeWidth={1.6} /></span>
      norita<span className="self-start text-lg text-accent">+</span>
    </a>
  );
}

const nav = [
  ["Servicios", "#servicios"],
  ["Nuestra app", "#app"],
  ["Cómo funciona", "#como-funciona"],
  ["Sobre Norita", "#sobre"],
  ["Contacto", "#contacto"],
];

const services = [
  {
    img: citas, title: "Acompañamiento a citas médicas", service: SERVICES[0],
    desc: "Que tus padres no tengan que ir solos. Les acompañamos a sus consultas médicas con atención, paciencia y responsabilidad, manteniéndote informado sobre el acompañamiento realizado.",
    items: ["Acompañamiento durante la cita.", "Apoyo y orientación logística durante la visita.", "Comunicación con la familia según lo acordado."],
  },
  {
    img: mente, title: "Neuroestimulación — Gimnasio Mental", service: SERVICES[1],
    desc: "Un espacio para mantener la mente activa, aprender y disfrutar. Sesiones de estimulación cognitiva con actividades adaptadas a los intereses y capacidades de cada adulto mayor.",
    items: ["Ejercicios de memoria y atención.", "Actividades de lenguaje y razonamiento.", "Juegos, retos y actividades significativas."],
  },
  {
    img: fuerza, title: "Entrenamiento de fuerza", service: SERVICES[2],
    desc: "Seguir moviéndose también es una forma de cuidarse. Sesiones adaptadas para trabajar fuerza, equilibrio, movilidad y autonomía en la vida cotidiana, con evaluación previa.",
    items: ["Ejercicios adaptados a la capacidad individual.", "Trabajo de fuerza y movilidad funcional.", "Atención a la seguridad y progresión del entrenamiento."],
  },
  {
    // Placeholder photo until a dedicated one is available.
    img: family, title: "Recogida de medicamentos", service: SERVICES[3],
    desc: "Para que tus padres no tengan que hacer filas ni desplazamientos. Recogemos sus medicamentos en la farmacia o el centro de salud y se los llevamos a casa. No administramos medicamentos ni modificamos tratamientos.",
    items: ["Recogida en la farmacia o el centro de salud.", "Entrega en casa en el horario acordado.", "Aviso a la familia cuando se completa la entrega."],
  },
  {
    img: paseo, imgPosition: "object-[50%_20%]", title: "Acompañamiento fines de semana", service: SERVICES[4],
    desc: "Cuando la rutina cambia y la familia necesita apoyo, acompañamos a tus padres durante el fin de semana con compañía, conversación y actividades a su ritmo.",
    items: ["Compañía en casa o en paseos cercanos.", "Actividades y conversación según sus intereses.", "Comunicación con la familia según lo acordado."],
  },
];

const pillars = [
  { icon: Heart, t: "Trato humano", d: "Escuchamos, respetamos los ritmos y cuidamos la dignidad de cada persona." },
  { icon: UserRound, t: "Atención personalizada", d: "Cada adulto mayor tiene necesidades, preferencias y capacidades diferentes." },
  { icon: ShieldCheck, t: "Confianza para la familia", d: "Comunicación clara sobre el servicio realizado y lo que se haya acordado compartir." },
  { icon: Sprout, t: "Bienestar con propósito", d: "Promovemos el movimiento, la participación y actividades que aporten valor a la vida cotidiana." },
];

const steps = [
  ["01", "Cuéntanos qué necesitas", "Conversamos contigo para conocer a tu padre o madre, sus preferencias y qué tipo de acompañamiento buscas."],
  ["02", "Encontramos el servicio adecuado", "Te orientamos sobre el servicio más apropiado, su modalidad, disponibilidad y los detalles de la atención."],
  ["03", "Coordinamos el acompañamiento", "Definimos fecha, horario y necesidades particulares para que sepas qué esperar del servicio."],
];

const faqs = [
  ["¿En qué distritos de Lima atiende Norita?", "Atendemos en Lima. La cobertura por distrito puede variar según el servicio; solicita información y te confirmamos si llegamos a tu zona."],
  ["¿Cómo puedo solicitar un acompañamiento a una cita médica?", "Solicita información indicando este servicio. Te contactamos para coordinar la fecha, hora y lugar de la cita, los detalles y las necesidades particulares de tu padre o madre."],
  ["¿Puedo contratar una sola sesión o necesito un paquete?", "Las modalidades disponibles y sus condiciones te las explicamos cuando te contactemos, según el servicio que te interese."],
  ["¿Las sesiones se realizan en casa?", "La modalidad de cada servicio se coordina contigo. Escríbenos y te contamos las opciones disponibles para tu caso."],
  ["¿Cómo se personalizan las sesiones de gimnasio mental?", "Antes de empezar conocemos los intereses, rutinas y capacidades de la persona, y adaptamos las actividades a ella."],
  ["¿Quién realiza el entrenamiento de fuerza?", "Las sesiones las realizan profesionales cualificados, con una evaluación previa. Puedes preguntarnos por su formación cuando te contactemos."],
  ["¿Cómo se mantiene informada a la familia?", "Acordamos contigo desde el inicio qué información quieres recibir y por qué medio, y la compartimos después de cada servicio."],
  ["¿Qué información necesitan para comenzar?", "Datos básicos de tu padre o madre, el servicio que te interesa y cualquier necesidad particular. Te guiamos paso a paso después de tu solicitud."],
];

function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div id="inicio" className="norita-page bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3 md:flex md:justify-between md:px-10 md:py-4">
          <Logo />
          <nav className="hidden gap-4 md:flex lg:gap-7" aria-label="Navegación principal">
            {nav.map(([l, h]) => (
              <a key={h} href={h} className="text-[0.95rem] font-medium text-foreground/80 transition-colors hover:text-primary">{l}</a>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <RequestInfoButton className={`${btnPrimary} hidden h-10 px-4 sm:inline-flex`} />
            <Button variant="ghost" size="icon" className="h-11 w-11 text-primary md:hidden" aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</Button>
          </div>
        </div>
        {menuOpen && <nav id="mobile-navigation" aria-label="Navegación móvil" className="border-t border-border bg-background px-5 pb-4 md:hidden">
          {nav.map(([label, href]) => <Button key={href} asChild variant="ghost" className="h-12 w-full justify-between rounded-none border-b border-border text-base font-medium text-primary"><a href={href} onClick={() => setMenuOpen(false)}>{label}<ArrowRight /></a></Button>)}
        </nav>}
      </header>

      <main>
        {/* Hero */}
        <section className="care-hero relative isolate overflow-hidden">
          <img src={hero} alt="Adulta mayor conversando con una acompañante de Norita" width={1920} height={1024} fetchPriority="high" className="care-hero-image" />
          <div className="relative mx-auto max-w-7xl px-5 py-14 md:px-10 md:py-20">
            <div className="care-hero-copy animate-rise">
              <p className="mb-5 flex min-w-0 items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-widest text-primary sm:text-xs"><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" /> Bienestar para adultos mayores · Lima</p>
              <h1 className="font-display text-5xl font-medium leading-none sm:text-6xl md:text-7xl">Norita</h1>
              <h2 className="mt-4 max-w-md text-[1.75rem] font-medium leading-tight sm:mt-5 sm:text-3xl md:text-4xl">Cuidado cercano.<br />Tranquilidad para tu familia.</h2>
              <p className="mt-6 max-w-sm text-base leading-relaxed text-muted-foreground">Acompañamos a tus padres, cuidamos su mente y fortalecemos su autonomía. Con respeto, atención y calidez.</p>
              <div className="hero-actions mt-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-1 sm:mt-8 sm:flex sm:gap-3">
                <RequestInfoButton />
                <Button variant="ghost" asChild className="h-12 px-3 text-primary"><a href="#servicios">Ver servicios <ArrowRight /></a></Button>
              </div>
            </div>
          </div>
        </section>
        <div className="border-y border-border bg-background">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-5 py-6 text-sm font-medium text-primary sm:grid-cols-3 md:px-10">
            <span className="flex min-w-0 items-center gap-3"><Heart className="h-4 w-4 shrink-0 text-accent" /> Cuidado humano y respetuoso</span>
            <span className="flex min-w-0 items-center gap-3"><UserRound className="h-4 w-4 shrink-0 text-accent" /> Atención personalizada</span>
            <span className="flex min-w-0 items-center gap-3"><ShieldCheck className="h-4 w-4 shrink-0 text-accent" /> Comunicación con la familia</span>
          </div>
        </div>

        {/* Preocupación */}
        <section className="bg-background py-16 md:py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 md:grid-cols-2 md:px-8">
            <img src={family} alt="Hija compartiendo un café con su padre" loading="lazy" width={1280} height={960} className="aspect-[4/3] w-full rounded-md object-cover" />
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-accent">A tu lado, incluso a la distancia</p>
              <h2 className="text-3xl font-medium leading-tight md:text-4xl">Quieres estar ahí para tus padres. Pero no siempre puedes estar en todo.</h2>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Coordinar una cita médica, encontrar actividades que mantengan su mente activa o ayudarles a conservar su fuerza y movilidad requiere tiempo, atención y constancia.
              </p>
              <p className="mt-4 text-lg font-medium leading-relaxed text-foreground">
                Norita te ayuda a acompañarlos mejor, incluso cuando no puedes estar físicamente a su lado.
              </p>
            </div>
          </div>
        </section>

        {/* Servicios */}
        <section id="servicios" className="scroll-mt-20 bg-secondary/60 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-widest text-accent">Servicios</p>
              <h2 className="mt-3 text-3xl font-medium leading-tight md:text-4xl">Cinco formas de cuidar mejor.</h2>
            </div>
            <div className="mt-14 grid gap-8 md:grid-cols-3">
              {services.map((s) => (
                <article key={s.title} className="service-item group flex min-w-0 flex-col">
                  <div className="overflow-hidden rounded-md">
                    <img src={s.img} alt={s.title} loading="lazy" width={1024} height={768} className={`aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105 ${s.imgPosition ?? ""}`} />
                  </div>
                  <div className="flex flex-1 flex-col pt-6">
                    <h3 className="text-xl font-semibold leading-snug">{s.title}</h3>
                    <p className="mt-3 text-base leading-relaxed text-muted-foreground">{s.desc}</p>
                    <ul className="mt-5 space-y-2.5">
                      {s.items.map((i) => (
                        <li key={i} className="flex gap-3 text-[0.98rem]">
                          <Check className="mt-1 h-4 w-4 shrink-0 text-accent" /> {i}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto pt-7">
                      <InformationButton service={s.service} variant="link" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <NoritaAppSection />

        {/* Experiencia */}
        <section className="bg-primary py-20 text-primary-foreground md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <h2 className="max-w-3xl text-3xl font-medium leading-tight text-primary-foreground md:text-4xl">No se trata solo de acompañar.<br />Se trata de hacerlo bien.</h2>
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {pillars.map(({ icon: Icon, t, d }) => (
                <div key={t} className="care-pillar border-t border-primary-foreground/25 pt-7">
                  <Icon className="h-7 w-7 text-sage" strokeWidth={1.5} />
                  <h3 className="mt-6 text-xl font-bold text-primary-foreground">{t}</h3>
                  <p className="mt-2 leading-relaxed text-primary-foreground/75">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section id="como-funciona" className="scroll-mt-20 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">Cómo funciona</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight md:text-5xl">Empezar a cuidar mejor es sencillo.</h2>
            <div className="mt-14 grid gap-10 md:grid-cols-3">
              {steps.map(([n, t, d]) => (
                <div key={n} className="care-step border-t-2 border-sage pt-6">
                  <span className="font-display text-5xl font-bold text-sage">{n}</span>
                  <div className="min-w-0"><h3 className="mt-4 text-2xl font-bold">{t}</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{d}</p></div>
                </div>
              ))}
            </div>
            <div className="mt-14"><RequestInfoButton /></div>
          </div>
        </section>

        {/* Sobre */}
        <section id="sobre" className="scroll-mt-20 bg-secondary/60 py-20 md:py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 md:grid-cols-2 md:px-8">
            <div className="md:order-2">
              <img src={vida} alt="Adulta mayor plantando flores junto a su nieta" loading="lazy" width={1280} height={960} className="aspect-[4/3] w-full rounded-md object-cover" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-accent">Sobre Norita</p>
              <h2 className="mt-3 text-3xl font-bold leading-tight md:text-5xl">Cuidarlos también es darles espacio para seguir disfrutando de la vida.</h2>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Creemos que el cuidado de los adultos mayores debe ir más allá de resolver necesidades. También debe promover sus intereses, su autonomía, sus relaciones y esos pequeños momentos que hacen bien.
              </p>
              <p className="mt-6 font-display text-xl font-semibold text-primary">Cuidar con respeto. Acompañar con cariño. Promover una vida activa.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-3xl px-5 md:px-8">
            <h2 className="text-3xl font-bold leading-tight md:text-5xl">Preguntas frecuentes</h2>
            <Accordion type="single" collapsible className="mt-10">
              {faqs.map(([q, a], i) => (
                <AccordionItem key={q} value={`f${i}`} className="border-border">
                  <AccordionTrigger className="min-h-14 gap-4 py-5 text-left text-base font-medium hover:no-underline sm:py-6 sm:text-lg sm:font-semibold">{q}</AccordionTrigger>
                  <AccordionContent className="pb-6 text-base leading-relaxed text-muted-foreground">{a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <div className="mt-8"><RequestInfoButton className={btnGhost} /></div>
          </div>
        </section>

        {/* CTA final */}
        <section id="contacto" className="scroll-mt-20 bg-secondary px-5 py-16 md:px-8 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-accent">Conversemos</p>
              <h2 className="text-3xl font-medium leading-tight md:text-4xl">Tus padres merecen sentirse acompañados. Tú mereces estar tranquilo.</h2>
              <p className="mt-6 text-lg leading-relaxed text-foreground/80">Cuéntanos qué necesita tu familia y encontremos juntos la mejor forma de acompañarlos.</p>
              <div className="mt-9"><RequestInfoButton /></div>
              <div className="mt-5"><ScheduleCall /></div>
              <p className="mt-4 text-sm text-foreground/70">Estamos aquí para escucharte.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-3 md:px-8">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-muted-foreground">Acompañamiento y bienestar para adultos mayores en {BRAND.coverage.split(",")[0]}.</p>
          </div>
          <div>
            <h3 className="text-base font-semibold">Servicios</h3>
            <ul className="mt-4 space-y-2 text-muted-foreground">
              {services.map((s) => <li key={s.title}><a href="#servicios" className="hover:text-primary">{s.title}</a></li>)}
            </ul>
          </div>
          <div>
            <h3 className="text-base font-semibold">Contacto</h3>
            <div className="mt-4 space-y-3 text-muted-foreground">
              <Link to="/contacto" className="flex items-center gap-2 font-medium text-primary hover:underline">Solicitar información <ArrowRight className="h-4 w-4" /></Link>
              {BRAND.email && <a href={`mailto:${BRAND.email}`} className="block hover:text-primary">{BRAND.email}</a>}
              <a href="/privacidad" className="block text-sm hover:text-primary">Política de privacidad</a>
            </div>
          </div>
        </div>
        <p className="border-t border-border py-6 text-center text-sm text-muted-foreground">© {new Date().getFullYear()} Norita · {BRAND.coverage}</p>
      </footer>

    </div>
  );
}
