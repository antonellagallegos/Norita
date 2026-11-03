import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArcShape, delay, DiagonalShape, Dot, Eyebrow, HalfDisc, ModuleGrid, Pill, useScrollReveal } from "@/components/brand";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { NoritaAppSection } from "@/components/norita-app-section";
import { InformationButton, ScheduleCall } from "@/components/contact-options";
import { SERVICES } from "@/lib/leads";
// Provisional lifestyle photography (Pexels license, see src/assets/PHOTO_CREDITS.md) until Norita's own shoot.
import heroPortrait from "@/assets/life-red-hat.jpg";
import laugh from "@/assets/life-laugh.jpg";
import couple from "@/assets/life-couple.jpg";
import style from "@/assets/life-style.jpg";
import drive from "@/assets/life-drive.jpg";
import bike from "@/assets/life-bike.jpg";
import walk from "@/assets/life-walk.jpg";
import companion from "@/assets/care-companion.jpg";
import mind from "@/assets/care-mind.jpg";
import strength from "@/assets/care-strength.jpg";
import weekend from "@/assets/care-weekend.jpg";

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

// Every information CTA leads to the contact form; WhatsApp contact will be configured later.
function RequestInfoButton({ variant = "default" }: { variant?: "default" | "outline" | "highlight" }) {
  return (
    <Button asChild size="lg" variant={variant}><Link to="/contacto">
      Solicitar información <ArrowRight />
    </Link></Button>
  );
}

const services = [
  {
    img: companion, alt: "Adulta mayor conversando con una acompañante en un jardín", title: "Acompañamiento a citas médicas", service: SERVICES[0],
    desc: "Que tus padres no tengan que ir solos. Les acompañamos a sus consultas médicas con atención, paciencia y responsabilidad, manteniéndote informado sobre el acompañamiento realizado.",
    items: ["Acompañamiento durante la cita.", "Apoyo y orientación logística durante la visita.", "Comunicación con la familia según lo acordado."],
  },
  {
    img: mind, alt: "Dos amigas mayores resolviendo un crucigrama con un café", title: "Neuroestimulación — Gimnasio Mental", service: SERVICES[1],
    desc: "Un espacio para mantener la mente activa, aprender y disfrutar. Sesiones de estimulación cognitiva con actividades adaptadas a los intereses y capacidades de cada adulto mayor.",
    items: ["Ejercicios de memoria y atención.", "Actividades de lenguaje y razonamiento.", "Juegos, retos y actividades significativas."],
  },
  {
    img: strength, alt: "Mujer mayor en una clase de movimiento", title: "Entrenamiento de fuerza", service: SERVICES[2],
    desc: "Seguir moviéndose también es una forma de cuidarse. Sesiones adaptadas para trabajar fuerza, equilibrio, movilidad y autonomía en la vida cotidiana, con evaluación previa.",
    items: ["Ejercicios adaptados a la capacidad individual.", "Trabajo de fuerza y movilidad funcional.", "Atención a la seguridad y progresión del entrenamiento."],
  },
  {
    img: walk, alt: "Mujer mayor sonriendo durante un paseo al aire libre", title: "Recogida de medicamentos", service: SERVICES[3],
    desc: "Para que tus padres no tengan que hacer filas ni desplazamientos. Recogemos sus medicamentos en la farmacia o el centro de salud y se los llevamos a casa. No administramos medicamentos ni modificamos tratamientos.",
    items: ["Recogida en la farmacia o el centro de salud.", "Entrega en casa en el horario acordado.", "Aviso a la familia cuando se completa la entrega."],
  },
  {
    img: weekend, alt: "Adulta mayor y una acompañante mirando juntas un teléfono en el parque", title: "Acompañamiento fines de semana", service: SERVICES[4],
    desc: "Cuando la rutina cambia y la familia necesita apoyo, acompañamos a tus padres durante el fin de semana con compañía, conversación y actividades a su ritmo.",
    items: ["Compañía en casa o en paseos cercanos.", "Actividades y conversación según sus intereses.", "Comunicación con la familia según lo acordado."],
  },
];

const pillars = [
  { shape: <Dot className="h-12 w-12 bg-highlight" />, t: "Trato humano", d: "Escuchamos, respetamos los ritmos y cuidamos la dignidad de cada persona." },
  { shape: <ArcShape className="h-12 w-12 text-highlight" />, t: "Atención personalizada", d: "Cada adulto mayor tiene necesidades, preferencias y capacidades diferentes." },
  { shape: <HalfDisc className="h-12 w-14 self-end text-highlight" />, t: "Confianza para la familia", d: "Comunicación clara sobre el servicio realizado y lo que se haya acordado compartir." },
  { shape: <DiagonalShape className="h-12 w-12 text-highlight" />, t: "Bienestar con propósito", d: "Promovemos el movimiento, la participación y actividades que aporten valor a la vida cotidiana." },
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

const trust = ["Cuidado humano y respetuoso", "Atención personalizada", "Comunicación con la familia"];

function Index() {
  useScrollReveal();
  return (
    <div className="bg-background text-foreground">
      <SiteHeader />

      <main className="overflow-x-clip">
        {/* Hero: an oversized editorial poster. LIFE, ON YOUR TERMS. */}
        <section className="relative">
          <div className="frame grid items-center gap-12 pb-16 pt-8 md:pt-12 lg:min-h-[min(calc(100svh-4.5rem),54rem)] lg:grid-cols-12 lg:gap-8 lg:pb-12 lg:pt-6">
            <div className="min-w-0 animate-rise lg:col-span-6">
              <Eyebrow>Bienestar para adultos mayores · Lima</Eyebrow>
              <h1 className="mt-6 text-[3rem] leading-[0.98] tracking-[-0.045em] sm:text-7xl lg:text-[5.4rem]">
                Cuidado cercano.{" "}
                <span className="relative isolate inline-block whitespace-nowrap">
                  <span aria-hidden="true" className="absolute inset-x-[-0.12em] bottom-[0.06em] top-[0.18em] -z-10 -rotate-1 rounded-full bg-highlight" />
                  Tranquilidad
                </span>{" "}
                para tu familia.
              </h1>
              <p className="mt-8 max-w-md text-lg leading-relaxed text-muted-foreground">Acompañamos a tus padres, cuidamos su mente y fortalecemos su autonomía. Con respeto, atención y calidez.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <RequestInfoButton />
                <Button asChild size="lg" variant="outline"><a href="#servicios">Ver servicios <ArrowRight /></a></Button>
              </div>
              <ul className="mt-12 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-foreground/80">
                {trust.map((label) => (
                  <li key={label} className="flex items-center gap-2"><Dot className="h-2 w-2 bg-primary" />{label}</li>
                ))}
              </ul>
            </div>
            <div className="relative mx-auto w-full max-w-[28rem] sm:max-w-[34rem] lg:col-span-6 lg:max-w-none">
              <div className="relative ml-auto h-[30rem] w-[88%] sm:h-[38rem] lg:h-[min(76svh,42rem)]">
                <img src={heroPortrait} alt="Mujer mayor con sombrero rojo y gafas de sol, sonriendo con los brazos abiertos" width={1200} height={1398} fetchPriority="high" className="h-full w-full rounded-[2rem] rounded-tl-[11rem] object-cover object-[50%_30%] sm:rounded-tl-[16rem]" />
                <ArcShape className="absolute -bottom-6 -left-10 w-32 -rotate-90 text-highlight sm:w-44" />
                <Dot className="absolute -right-3 top-10 h-14 w-14 bg-primary sm:-right-6 sm:h-20 sm:w-20" />
              </div>
              <div className="absolute left-0 top-16 flex max-w-[16rem] items-center gap-3 rounded-full bg-card py-2 pl-2 pr-5 shadow-soft">
                <img src={style} alt="" aria-hidden="true" className="h-12 w-12 shrink-0 rounded-full object-cover object-top" />
                <p className="font-display text-[0.95rem] font-bold leading-tight text-primary">La vida sigue siendo tuya.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Tilted service ribbon. Decorative: the services are listed in full below. */}
        <div aria-hidden="true" className="relative z-10 -my-2 -rotate-[1.5deg] scale-x-105 bg-primary py-4 text-primary-foreground sm:py-5">
          <div className="flex w-max animate-marquee">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0 items-center">
                {[...SERVICES.slice(0, 5), ...SERVICES.slice(0, 5)].map((service, i) => (
                  <span key={i} className="flex items-center gap-6 pr-6 font-display text-lg font-bold sm:text-2xl">
                    {service}<Dot className="h-3 w-3 bg-highlight" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* The coordination load, as one big editorial sentence. */}
        <section className="py-24 md:py-32">
          <div className="frame">
            <h2 data-reveal className="max-w-6xl text-[2.3rem] leading-[1.04] tracking-[-0.04em] sm:text-6xl lg:text-[4.4rem]">
              Quieres estar ahí <Pill src={drive} /> para tus padres. Pero no siempre puedes <span className="underline decoration-highlight decoration-[0.14em] underline-offset-[0.14em]">estar en todo</span> <Pill src={bike} />
            </h2>
            <div data-reveal className="mt-14 grid gap-8 border-t border-border pt-10 md:grid-cols-12">
              <p className="font-display text-xl font-bold leading-snug text-primary md:col-span-5 lg:col-span-4">
                Norita te ayuda a acompañarlos mejor, incluso cuando no puedes estar físicamente a su lado.
              </p>
              <p className="text-lg leading-relaxed text-muted-foreground md:col-span-6 md:col-start-7">
                Coordinar una cita médica, encontrar actividades que mantengan su mente activa o ayudarles a conservar su fuerza y movilidad requiere tiempo, atención y constancia.
              </p>
            </div>
          </div>
        </section>

        {/* Services: an interactive index. Pick one and the photo and details follow. */}
        <section id="servicios" className="scroll-mt-20 bg-secondary py-20 md:py-28">
          <Tabs defaultValue="0" orientation="vertical" className="frame grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="min-w-0 lg:col-span-5">
              <Eyebrow>Servicios</Eyebrow>
              <h2 className="mt-5 text-[2.2rem] leading-[1.04] sm:text-5xl lg:text-6xl">Cinco formas de cuidar mejor.</h2>
              <TabsList className="-mx-4 mt-10 flex h-auto justify-start gap-2 overflow-x-auto bg-transparent p-0 px-4 pb-2 text-foreground sm:mx-0 sm:px-0 lg:mt-12 lg:flex-col lg:items-stretch lg:gap-0 lg:overflow-visible lg:pb-0">
                {services.map((s, i) => (
                  <TabsTrigger key={s.title} value={String(i)} className="group shrink-0 justify-start gap-4 rounded-full border border-primary/20 bg-card px-4 py-2.5 text-left text-[0.95rem] font-semibold text-primary data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none lg:whitespace-normal lg:rounded-none lg:border-0 lg:border-t lg:border-primary/15 lg:bg-transparent lg:px-0 lg:py-5 lg:font-display lg:text-[1.55rem] lg:font-bold lg:leading-tight lg:text-primary/75 lg:hover:text-primary lg:data-[state=active]:bg-transparent lg:data-[state=active]:text-primary">
                    <span className="hidden w-10 font-sans text-sm font-semibold text-primary lg:inline">{String(i + 1).padStart(2, "0")}</span>
                    <span className="min-w-0 flex-1">{s.title}</span>
                    <ArrowRight className="hidden h-6 w-6 shrink-0 -translate-x-2 opacity-0 transition-all group-data-[state=active]:translate-x-0 group-data-[state=active]:opacity-100 lg:block" />
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            {services.map((s, i) => (
              <TabsContent key={s.title} value={String(i)} className="mt-0 min-w-0 animate-rise lg:col-span-7">
                <article className="overflow-hidden rounded-[2rem] bg-card">
                  <div className="relative">
                    <img src={s.img} alt={s.alt} loading="lazy" width={1400} height={933} className="aspect-[16/11] w-full object-cover" />
                    <span className="absolute left-5 top-5 grid h-14 w-14 place-items-center rounded-full bg-highlight font-display text-lg font-extrabold text-highlight-foreground">{String(i + 1).padStart(2, "0")}</span>
                    <HalfDisc className="absolute -bottom-px right-8 w-28 text-card sm:w-40" />
                  </div>
                  <div className="grid gap-8 p-6 sm:p-10 md:grid-cols-[1.1fr_0.9fr]">
                    <div>
                      <h3 className="text-[1.7rem] leading-tight sm:text-3xl">{s.title}</h3>
                      <p className="mt-4 leading-relaxed text-muted-foreground">{s.desc}</p>
                    </div>
                    <div className="flex flex-col">
                      <ul className="space-y-3">
                        {s.items.map((item) => (
                          <li key={item} className="flex gap-3 text-[0.97rem]"><Dot className="mt-[0.55rem] h-1.5 w-1.5 bg-primary" />{item}</li>
                        ))}
                      </ul>
                      <div className="mt-auto pt-8"><InformationButton service={s.service} /></div>
                    </div>
                  </div>
                </article>
              </TabsContent>
            ))}
          </Tabs>
        </section>

        {/* About, LIFE ON YOUR TERMS: a mosaic of photos and brand modules. */}
        <section id="sobre" className="scroll-mt-20 py-20 md:py-28">
          <div className="frame">
            <div data-reveal className="grid gap-8 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-7">
                <Eyebrow>Sobre Norita</Eyebrow>
                <h2 className="mt-5 text-[2.2rem] leading-[1.04] sm:text-5xl lg:text-[3.6rem]">Cuidarlos también es darles espacio para seguir disfrutando de la vida.</h2>
              </div>
              <p className="text-lg leading-relaxed text-muted-foreground lg:col-span-4 lg:col-start-9">
                Creemos que el cuidado de los adultos mayores debe ir más allá de resolver necesidades. También debe promover sus intereses, su autonomía, sus relaciones y esos pequeños momentos que hacen bien.
              </p>
            </div>
            <div className="mt-14 grid auto-rows-[10.5rem] grid-cols-2 gap-3 sm:auto-rows-[14rem] sm:gap-4 lg:auto-rows-[15.5rem] lg:grid-cols-4">
              <img data-reveal src={couple} alt="Pareja de adultos mayores caminando por la ciudad y riendo" loading="lazy" className="col-span-2 row-span-2 h-full w-full rounded-[1.75rem] object-cover" />
              <div data-reveal style={delay(100)} className="relative overflow-hidden rounded-[1.75rem] bg-highlight">
                <ArcShape className="absolute -bottom-2 -right-2 w-[70%] text-primary" />
                <Dot className="absolute left-5 top-5 h-8 w-8 bg-background sm:h-10 sm:w-10" />
              </div>
              <img data-reveal style={delay(200)} src={style} alt="Hombre mayor con estilo, de brazos cruzados frente a una pared de azulejos" loading="lazy" className="row-span-2 h-full w-full rounded-[1.75rem] object-cover object-top" />
              <div data-reveal style={delay(150)} className="on-dark col-span-1 flex flex-col justify-end rounded-[1.75rem] bg-primary p-5 text-primary-foreground sm:p-7">
                <p className="font-display text-lg font-bold leading-tight sm:text-2xl">Cuidar con respeto. Acompañar con cariño. <span className="text-highlight">Promover una vida activa.</span></p>
              </div>
              <img data-reveal src={drive} alt="Mujer mayor con gafas de sol conduciendo un descapotable" loading="lazy" className="col-span-2 h-full w-full rounded-[1.75rem] object-cover lg:col-span-2" />
              <img data-reveal style={delay(100)} src={bike} alt="Mujer mayor paseando con su bicicleta por un parque" loading="lazy" className="col-span-1 h-full w-full rounded-[1.75rem] object-cover" />
              <div data-reveal style={delay(200)} aria-hidden="true" className="flex items-center justify-center rounded-[1.75rem] bg-background ring-1 ring-inset ring-border">
                <ModuleGrid tiles={[["blue", "warm"], ["soft", "none"], ["yellow", "none"], ["blue", "none"]]} columns={2} className="w-24 sm:w-32" />
              </div>
            </div>
          </div>
        </section>

        {/* Care model, part 1: CARE, REIMAGINED. Rows instead of cards. */}
        <section className="on-dark relative overflow-hidden bg-primary py-20 text-primary-foreground md:py-28">
          <Dot className="absolute -right-40 -top-40 h-[26rem] w-[26rem] bg-primary-foreground/[0.06] md:h-[40rem] md:w-[40rem]" />
          <div className="frame relative">
            <div data-reveal>
              <Eyebrow dark>Nuestra forma de acompañar</Eyebrow>
              <h2 className="mt-6 max-w-4xl text-[2.2rem] leading-[1.04] sm:text-5xl lg:text-6xl">No se trata solo de acompañar. <span className="text-highlight">Se trata de hacerlo bien.</span></h2>
            </div>
            <ul className="mt-14 border-b border-primary-foreground/20">
              {pillars.map(({ shape, t, d }, i) => (
                <li key={t} data-reveal style={delay(i * 80)} className="group grid grid-cols-[3rem_1fr] items-center gap-x-5 gap-y-2 border-t border-primary-foreground/20 py-7 transition-colors sm:grid-cols-[4rem_1fr_auto] md:grid-cols-[5rem_1fr_1.2fr_auto] md:gap-x-10 md:py-9">
                  <span className="font-display text-sm font-bold text-primary-foreground/60 md:text-base">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="text-2xl transition-colors group-hover:text-highlight md:text-[2rem]">{t}</h3>
                  <p className="col-start-2 leading-relaxed text-primary-foreground/80 md:col-start-3 md:row-start-1">{d}</p>
                  <span className="hidden h-12 items-end transition-transform duration-500 group-hover:rotate-12 sm:col-start-3 sm:row-span-2 sm:row-start-1 sm:flex md:col-start-4 md:row-span-1">{shape}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Care model, part 2: three steps on a connected path. */}
        <section id="como-funciona" className="scroll-mt-20 py-20 md:py-28">
          <div className="frame grid gap-12 lg:grid-cols-12">
            <div className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
              <Eyebrow>Cómo funciona</Eyebrow>
              <h2 className="mt-5 text-[2.2rem] leading-[1.04] sm:text-5xl lg:text-6xl">Empezar a cuidar mejor es sencillo.</h2>
              <div className="mt-10 hidden lg:block"><RequestInfoButton /></div>
            </div>
            <ol className="relative lg:col-span-6 lg:col-start-7">
              <span aria-hidden="true" className="absolute bottom-24 left-7 top-10 w-px bg-primary/20" />
              {steps.map(([n, t, d], i) => (
                <li key={n} data-reveal style={delay(i * 120)} className="relative grid grid-cols-[3.5rem_1fr] gap-6 pb-12 last:pb-0">
                  <span className={`relative grid h-14 w-14 place-items-center rounded-full font-display text-lg font-extrabold ${i === 0 ? "bg-highlight text-highlight-foreground" : i === 1 ? "bg-secondary text-primary ring-8 ring-background" : "bg-primary text-primary-foreground"}`}>{n}</span>
                  <div className="pt-2">
                    <h3 className="text-[1.6rem] leading-tight sm:text-[1.9rem]">{t}</h3>
                    <p className="mt-3 max-w-md text-lg leading-relaxed text-muted-foreground">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="lg:hidden"><RequestInfoButton /></div>
          </div>
        </section>

        <NoritaAppSection />

        {/* FAQ */}
        <section id="preguntas" className="scroll-mt-20 py-20 md:py-28">
          <div className="frame grid gap-10 lg:grid-cols-12">
            <div className="lg:sticky lg:top-28 lg:col-span-4 lg:self-start">
              <Eyebrow>Preguntas frecuentes</Eyebrow>
              <h2 className="mt-5 text-[2.2rem] leading-[1.04] sm:text-5xl">Lo que suelen preguntarnos.</h2>
              <div className="mt-8 hidden lg:block"><RequestInfoButton variant="outline" /></div>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <Accordion type="single" collapsible className="border-t border-primary/15">
                {faqs.map(([q, a], i) => (
                  <AccordionItem key={q} value={`f${i}`} className="border-b border-primary/15">
                    <AccordionTrigger className="min-h-16 gap-4 py-6 text-left font-display text-lg font-bold text-primary hover:no-underline sm:text-xl">{q}</AccordionTrigger>
                    <AccordionContent className="pb-7 pr-8 text-base leading-relaxed text-muted-foreground">{a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <div className="mt-8 lg:hidden"><RequestInfoButton variant="outline" /></div>
            </div>
          </div>
        </section>

        {/* Final CTA: full-bleed yellow, photo in an arch. */}
        <section id="contacto" className="scroll-mt-20 overflow-hidden bg-highlight text-highlight-foreground">
          <div className="frame grid items-end gap-10 pt-16 sm:pt-20 lg:grid-cols-12 lg:gap-8 lg:pt-24">
            <div className="min-w-0 pb-4 lg:col-span-7 lg:pb-24">
              <Eyebrow dot="bg-primary">Conversemos</Eyebrow>
              <h2 data-reveal className="mt-5 text-[2.3rem] leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-[4.2rem]">Tus padres merecen sentirse acompañados. Tú mereces estar tranquilo.</h2>
              <p className="mt-6 max-w-xl text-lg leading-relaxed">Cuéntanos qué necesita tu familia y encontremos juntos la mejor forma de acompañarlos.</p>
              <div className="mt-9 flex flex-col items-start gap-4">
                <RequestInfoButton />
                <ScheduleCall />
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-sm lg:col-span-5 lg:max-w-none">
              <img src={laugh} alt="Mujer mayor con gafas riendo con las manos en las mejillas" loading="lazy" width={1400} height={932} className="relative aspect-[4/5] w-full rounded-t-full object-cover object-[40%_50%]" />
              <Dot className="absolute right-2 top-6 h-20 w-20 bg-primary sm:h-24 sm:w-24" />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
