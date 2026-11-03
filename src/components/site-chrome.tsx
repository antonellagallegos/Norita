import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo, Dot } from "@/components/brand";
import { BRAND } from "@/lib/brand";
import { SERVICES } from "@/lib/leads";

// Absolute anchors so the same header works on the home page and on inner pages.
const NAV = [
  ["Servicios", "/#servicios"],
  ["Cómo funciona", "/#como-funciona"],
  ["Nuestra app", "/#app"],
  ["Sobre Norita", "/#sobre"],
  ["Preguntas", "/#preguntas"],
] as const;

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
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
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegación principal">
          {NAV.map(([label, href]) => (
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
            <Link to="/contacto">
              Solicitar información <ArrowRight />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 lg:hidden"
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
          className="border-t border-border bg-background lg:hidden"
        >
          <div className="frame pb-6 pt-2">
            {NAV.map(([label, href]) => (
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
              <Link to="/contacto" onClick={() => setMenuOpen(false)}>
                Solicitar información <ArrowRight />
              </Link>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
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
            <Link
              to="/contacto"
              className="flex items-center gap-2 font-semibold text-highlight hover:underline"
            >
              Solicitar información <ArrowRight className="h-4 w-4" />
            </Link>
            {BRAND.email && (
              <a href={`mailto:${BRAND.email}`} className="block hover:text-highlight">
                {BRAND.email}
              </a>
            )}
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
