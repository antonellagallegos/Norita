import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo, Dot } from "@/components/brand";
import { BRAND } from "@/lib/brand";
import { SERVICES } from "@/lib/leads";

// Two separate funnels share the chrome: families (/) and caregivers (/cuidadores). Each has its own
// menu and its own call to action, so neither page leads into the other's form.
// Absolute anchors so the same header works on the landing and on inner pages.
export type Audience = "families" | "caregivers";
const NAV: Record<Audience, readonly (readonly [string, string])[]> = {
  families: [
    ["Servicios", "/#servicios"],
    ["Cómo funciona", "/#como-funciona"],
    ["Nuestra app", "/#app"],
    ["Sobre Norita", "/#sobre"],
    ["Preguntas", "/#preguntas"],
  ],
  caregivers: [
    ["Beneficios", "/cuidadores#beneficios"],
    ["Proceso", "/cuidadores#proceso"],
    ["Formación", "/cuidadores#formacion"],
    ["Preguntas", "/cuidadores#preguntas"],
  ],
};
const CTA: Record<Audience, { label: string; to: string }> = {
  families: { label: "Solicitar información", to: "/contacto" },
  caregivers: { label: "Postular", to: "/cuidadores#postular" },
};

function AudienceSwitch({ audience, className = "" }: { audience: Audience; className?: string }) {
  const item = (active: boolean) =>
    `rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${active ? "bg-primary text-primary-foreground" : "text-primary hover:bg-secondary"}`;
  return (
    <nav
      aria-label="Elige tu perfil"
      className={`flex rounded-full border border-primary/20 bg-card p-1 ${className}`}
    >
      <Link
        to="/"
        aria-current={audience === "families" ? "page" : undefined}
        className={item(audience === "families")}
      >
        Familias
      </Link>
      <Link
        to="/cuidadores"
        aria-current={audience === "caregivers" ? "page" : undefined}
        className={item(audience === "caregivers")}
      >
        Cuidadores
      </Link>
    </nav>
  );
}

export function SiteHeader({ audience = "families" }: { audience?: Audience }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = NAV[audience];
  const cta = CTA[audience];
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="frame flex h-16 items-center justify-between gap-4 md:h-[4.5rem]">
        <Link
          to="/"
          aria-label="Norita, inicio"
          className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <BrandLogo />
        </Link>
        <AudienceSwitch audience={audience} className="hidden md:flex lg:mr-auto lg:ml-4" />
        <nav className="hidden items-center gap-1 xl:flex" aria-label="Navegación principal">
          {nav.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="rounded-full px-3.5 py-2 text-[0.92rem] font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-primary"
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <Button asChild className="hidden sm:inline-flex">
            <a href={cta.to}>
              {cta.label} <ArrowRight />
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 xl:hidden"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      {menuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Navegación móvil"
          className="border-t border-border bg-background xl:hidden"
        >
          <div className="frame pb-6 pt-4">
            <AudienceSwitch audience={audience} className="mb-2 w-fit md:hidden" />
            {nav.map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="flex min-h-14 items-center justify-between border-b border-border font-display text-xl font-bold text-primary"
              >
                {label}
                <ArrowRight className="h-5 w-5" />
              </a>
            ))}
            <Button asChild size="lg" className="mt-6 w-full sm:hidden">
              <a href={cta.to} onClick={() => setMenuOpen(false)}>
                {cta.label} <ArrowRight />
              </a>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter({ audience = "families" }: { audience?: Audience }) {
  const cta = CTA[audience];
  return (
    <footer className="on-dark bg-ink text-ink-foreground">
      <div className="frame grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr] md:py-20">
        <div>
          <BrandLogo tone="light" className="text-[2.25rem]" />
          <p className="mt-5 max-w-xs leading-relaxed text-ink-foreground/75">
            Acompañamiento y bienestar para adultos mayores en {BRAND.coverage.split(",")[0]}.
          </p>
        </div>
        <div>
          <h2 className="eyebrow text-ink-foreground/60">
            <Dot className="h-2 w-2 bg-highlight" />
            Servicios
          </h2>
          <ul className="mt-5 space-y-3 text-[0.95rem] text-ink-foreground/85">
            {SERVICES.slice(0, 5).map((s) => (
              <li key={s}>
                <a href="/#servicios" className="transition-colors hover:text-highlight">
                  {s}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="eyebrow text-ink-foreground/60">
            <Dot className="h-2 w-2 bg-highlight" />
            Contacto
          </h2>
          <div className="mt-5 space-y-3 text-[0.95rem] text-ink-foreground/85">
            <a
              href={cta.to}
              className="flex items-center gap-2 font-semibold text-highlight hover:underline"
            >
              {cta.label} <ArrowRight className="h-4 w-4" />
            </a>
            {BRAND.email && (
              <a href={`mailto:${BRAND.email}`} className="block hover:text-highlight">
                {BRAND.email}
              </a>
            )}
            <Link to="/cuidadores" className="block hover:text-highlight">
              Trabaja con Norita
            </Link>
            <Link to="/privacidad" className="block hover:text-highlight">
              Política de privacidad
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-ink-foreground/15">
        <p className="frame py-6 text-sm text-ink-foreground/60">
          © {new Date().getFullYear()} Norita · {BRAND.coverage}
        </p>
      </div>
    </footer>
  );
}
