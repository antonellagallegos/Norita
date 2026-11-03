import { ArrowRight, BrainCircuit, ClipboardList, History, UsersRound } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArcShape, BrandLogo, Dot } from "@/components/brand";
import familyPhoto from "@/assets/family-together.jpg";

const features = [
  { icon: History, title: "Historial médico en un solo lugar", description: "Guardamos el historial médico del adulto mayor en nuestra plataforma para mantener la información de su cuidado organizada." },
  { icon: ClipboardList, title: "Avances que se pueden seguir", description: "Registramos sus avances para dar continuidad al acompañamiento y tener una visión de su evolución." },
  { icon: UsersRound, title: "Visibilidad para la familia", description: "A través de nuestra app, la familia puede conocer el historial y los avances, incluso cuando no puede estar cerca." },
];

export function NoritaAppSection() {
  return (
    <section id="app" aria-labelledby="norita-app-title" className="scroll-mt-20 bg-secondary py-20 md:py-28">
      <div className="frame grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div className="min-w-0">
          <p className="eyebrow text-primary"><Dot className="h-2 w-2 bg-highlight" />Inteligencia artificial · App Norita</p>
          <h2 id="norita-app-title" className="mt-5 text-[2rem] leading-[1.08] sm:text-5xl">Cuidado humano.<br />Tecnología que nos conecta.</h2>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">Nuestra app con inteligencia artificial reúne el historial médico y los avances de tu padre o madre, para que tu familia tenga visibilidad de su cuidado.</p>
          <div className="mt-10 space-y-7">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"><Icon className="h-5 w-5" strokeWidth={1.75} /></span>
                <div className="min-w-0"><h3 className="text-lg leading-snug">{title}</h3><p className="mt-1.5 text-base leading-relaxed text-muted-foreground">{description}</p></div>
              </div>
            ))}
          </div>
          <Button asChild variant="link" className="mt-9 h-auto max-w-full justify-start whitespace-normal p-0 text-base"><Link to="/contacto">Solicitar información <ArrowRight className="h-4 w-4 shrink-0" /></Link></Button>
        </div>
        <div className="relative min-w-0 pb-24 sm:pb-16 lg:pb-0">
          <div className="relative overflow-hidden rounded-[2rem] rounded-br-[9rem] sm:rounded-br-[14rem]">
            <img src={familyPhoto} alt="Madre mayor e hija abrazadas y sonriendo al aire libre" loading="lazy" width={1400} height={934} className="aspect-[4/5] w-full object-cover object-[35%_50%] sm:aspect-[5/6] lg:aspect-[4/5]" />
            <ArcShape className="absolute -left-10 -top-10 w-32 text-highlight sm:w-44" />
          </div>
          <div className="absolute -bottom-2 left-3 right-3 sm:left-auto sm:right-[-0.5rem] sm:w-[22rem] lg:-bottom-10 lg:-left-16 lg:right-auto">
            <div role="img" aria-label="Vista ilustrativa de la app Norita con historial médico, registro de avances y seguimiento familiar" className="overflow-hidden rounded-[1.75rem] bg-card shadow-soft ring-1 ring-border">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <BrandLogo className="text-xl" />
                <BrainCircuit className="h-5 w-5 text-primary" strokeWidth={1.5} />
              </div>
              <div className="px-5 py-5">
                <p className="eyebrow text-muted-foreground">Mi familia</p>
                <p className="mt-1.5 font-display text-xl font-extrabold tracking-tight text-primary">Su cuidado, conectado.</p>
                <div className="mt-4 space-y-2">
                  {features.map(({ icon: Icon, title }, i) => (
                    <div key={title} className="flex items-center gap-3 rounded-xl bg-background p-3">
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${i === 1 ? "bg-highlight text-highlight-foreground" : "bg-secondary text-primary"}`}><Icon className="h-4 w-4" strokeWidth={1.75} /></span>
                      <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-primary">{["Historial médico", "Registro de avances", "Seguimiento familiar"][i]}</p><div aria-hidden="true" className="mt-1.5 h-1.5 w-3/4 rounded-full bg-secondary" /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-3 text-center text-xs font-medium text-muted-foreground">Vista ilustrativa de la plataforma</p>
          </div>
        </div>
      </div>
    </section>
  );
}
