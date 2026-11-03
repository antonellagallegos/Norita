import { createFileRoute } from "@tanstack/react-router";
import { ContactForm } from "@/components/contact-form";
import { ScheduleCall } from "@/components/contact-options";
import { Dot, ModuleGrid } from "@/components/brand";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { pageHead } from "@/lib/page-head";

export const Route = createFileRoute("/contacto")({ head: () => pageHead("Contacta con Norita | Acompañamiento para tu familia", "Consulta los servicios de Norita para adultos mayores en Lima. Deja tu solicitud de información y te contactamos."), component: ContactPage });

function ContactPage() {
  return (
    <div className="bg-background text-foreground">
      <SiteHeader />
      <main className="frame grid gap-10 py-10 md:py-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:py-20">
        <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow text-primary"><Dot className="h-2 w-2 bg-highlight" />Norita · Conversemos</p>
          <h1 className="mt-5 text-[2.2rem] leading-[1.06] sm:text-5xl">Conversemos sobre cómo acompañar a tus padres</h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">Cuéntanos qué necesitas y nuestro equipo se pondrá en contacto contigo para orientarte.</p>
          <ModuleGrid tiles={[["blue", "warm"], ["yellow", "none"], ["soft", "blue"], ["soft", "none"], ["blue", "none"], ["yellow", "blue"]]} className="mt-10 hidden w-48 lg:grid" />
          <div className="mt-8 hidden lg:block"><ScheduleCall /></div>
        </div>
        <div className="min-w-0 rounded-[2rem] bg-card p-5 shadow-soft sm:p-10">
          <ContactForm />
          <div className="mt-8 border-t border-border pt-6 lg:hidden"><ScheduleCall /></div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
