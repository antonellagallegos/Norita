import { ArrowRight, BrainCircuit, ClipboardList, Heart, History, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { whatsappUrl } from "@/lib/brand";

const features = [
  { icon: History, title: "Historial médico en un solo lugar", description: "Guardamos el historial médico del adulto mayor en nuestra plataforma para mantener la información de su cuidado organizada." },
  { icon: ClipboardList, title: "Avances que se pueden seguir", description: "Registramos sus avances para dar continuidad al acompañamiento y tener una visión de su evolución." },
  { icon: UsersRound, title: "Visibilidad para la familia", description: "A través de nuestra app, la familia puede conocer el historial y los avances, incluso cuando no puede estar cerca." },
];

export function NoritaAppSection() {
  return (
    <section id="app" aria-labelledby="norita-app-title" className="scroll-mt-24 border-b border-border bg-background py-16 md:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 md:px-8 lg:grid-cols-2 lg:gap-16">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold uppercase text-accent"><BrainCircuit className="h-5 w-5 shrink-0" /> Inteligencia artificial · App Norita</p>
          <h2 id="norita-app-title" className="mt-4 text-3xl font-medium leading-tight md:text-4xl">Cuidado humano.<br />Tecnología que nos conecta.</h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">Nuestra app con inteligencia artificial reúne el historial médico y los avances de tu padre o madre, para que tu familia tenga visibilidad de su cuidado.</p>
          <div className="mt-8 space-y-6">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex items-start gap-4">
                <Icon className="mt-1 h-5 w-5 shrink-0 text-accent" strokeWidth={1.5} />
                <div className="min-w-0"><h3 className="text-lg font-semibold leading-snug">{title}</h3><p className="mt-2 text-base leading-relaxed text-muted-foreground">{description}</p></div>
              </div>
            ))}
          </div>
          <Button asChild variant="link" className="mt-8 h-auto max-w-full justify-start whitespace-normal p-0 text-base text-primary"><a href={whatsappUrl("Hola, quisiera conocer la app de Norita y cómo puedo seguir el historial médico y los avances de mi familiar.")} target="_blank" rel="noopener noreferrer">Conocer la app de Norita <ArrowRight className="h-4 w-4 shrink-0" /></a></Button>
        </div>
        <div className="min-w-0 bg-secondary/60 px-5 py-8 sm:px-10 sm:py-12">
          <div role="img" aria-label="Vista ilustrativa de la app Norita con historial médico, registro de avances y seguimiento familiar" className="mx-auto max-w-sm overflow-hidden rounded-md border border-border bg-background shadow-soft">
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <span className="flex items-center gap-2 font-display text-2xl font-semibold text-primary"><Heart className="h-5 w-5" strokeWidth={1.5} /> norita<span className="text-accent">+</span></span>
              <BrainCircuit className="h-6 w-6 text-accent" strokeWidth={1.5} />
            </div>
            <div className="px-6 py-7">
              <p className="text-xs font-semibold uppercase text-accent">Mi familia</p>
              <p className="mt-2 font-display text-2xl font-medium text-primary">Su cuidado, conectado.</p>
              <div className="mt-7 divide-y divide-border">
                {features.map(({ icon: Icon, title }, i) => (
                  <div key={title} className="flex items-center gap-4 py-5">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-secondary text-accent"><Icon className="h-5 w-5" strokeWidth={1.5} /></span>
                    <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-primary">{["Historial médico", "Registro de avances", "Seguimiento familiar"][i]}</p><div aria-hidden="true" className="mt-2 h-1.5 w-3/4 rounded-full bg-muted" /></div>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-2 border-t border-border pt-5 text-sm text-muted-foreground"><BrainCircuit className="h-4 w-4 shrink-0 text-accent" /> Tecnología al servicio del cuidado</div>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">Vista ilustrativa de la plataforma</p>
        </div>
      </div>
    </section>
  );
}