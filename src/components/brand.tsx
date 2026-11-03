import { useEffect, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// Provisional wordmark: the name set in Manrope ExtraBold. It deliberately does not redraw the
// reference logo (the "o" symbol and the descriptor): the brand book only provides a raster crop
// and asks for an approved vector master. Replace this component with that SVG when available.
export function BrandLogo({
  tone = "blue",
  className,
}: {
  tone?: "blue" | "light";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-display text-[1.65rem] font-extrabold leading-none tracking-[-0.04em]",
        tone === "blue" ? "text-primary" : "text-primary-foreground",
        className,
      )}
    >
      norita
    </span>
  );
}

// Auxiliary shapes from the brand book (05 · Geometría): arc, diagonal, circle and modules.
// Decorative only: always hidden from assistive technology.
type ShapeProps = { className?: string };

/** Quarter-circle arc module (rounded block cut by a circle), as frame or background. */
export function ArcShape({ className }: ShapeProps) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" className={className}>
      <path d="M0 100V0a100 100 0 0 1 100 100Z" fill="currentColor" />
    </svg>
  );
}

/** Half disc: the arc as a window that opens upwards. */
export function HalfDisc({ className }: ShapeProps) {
  return (
    <svg viewBox="0 0 100 50" aria-hidden="true" focusable="false" className={className}>
      <path d="M0 50a50 50 0 0 1 100 0Z" fill="currentColor" />
    </svg>
  );
}

/** Forward diagonal band: progress and evolution. Use sparingly. */
export function DiagonalShape({ className }: ShapeProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M58 0h42L42 100H0Z" fill="currentColor" />
    </svg>
  );
}

export function Dot({ className }: ShapeProps) {
  return (
    <span aria-hidden="true" className={cn("inline-block shrink-0 rounded-full", className)} />
  );
}

// Module grid (08 · Composición): rounded tiles in the palette, some with a focal circle.
const TILE = {
  blue: "bg-primary",
  yellow: "bg-highlight",
  soft: "bg-secondary",
  warm: "bg-background",
} as const;
const DOT = { blue: "bg-primary", warm: "bg-background", none: "" } as const;
export type Tile = [keyof typeof TILE, keyof typeof DOT];

export function ModuleGrid({
  tiles,
  columns = 3,
  className,
}: {
  tiles: Tile[];
  columns?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("grid gap-2 sm:gap-3", className)}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {tiles.map(([tile, dot], i) => (
        <span
          key={i}
          className={cn("grid aspect-square place-items-center rounded-[22%]", TILE[tile])}
        >
          {dot !== "none" && <span className={cn("h-1/2 w-1/2 rounded-full", DOT[dot])} />}
        </span>
      ))}
    </div>
  );
}

/** Arms the [data-reveal] scroll animation for the page; elements fade up as they enter the viewport. */
export function useScrollReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    root.classList.add("reveal-on");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      root.classList.remove("reveal-on");
    };
  }, []);
}

/** Section label: uppercase Inter with the brand's focal circle. */
export function Eyebrow({
  children,
  dark = false,
  dot = "bg-highlight",
}: {
  children: ReactNode;
  dark?: boolean;
  dot?: string;
}) {
  return (
    <p className={`eyebrow ${dark ? "text-primary-foreground/80" : "text-primary"}`}>
      <Dot className={`h-2 w-2 ${dot}`} />
      {children}
    </p>
  );
}

/** Small photo set inline in a headline, as in editorial layouts. Decorative. */
export function Pill({ src, className = "" }: { src: string; className?: string }) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      loading="lazy"
      className={`mx-[0.08em] inline-block h-[0.82em] w-[1.7em] -translate-y-[0.06em] rounded-full object-cover align-middle ${className}`}
    />
  );
}

/** Staggers the scroll reveal of sibling elements. */
export const delay = (ms: number) => ({ "--reveal-delay": `${ms}ms` }) as CSSProperties;
