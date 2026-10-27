import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeadsPanel } from "@/components/leads-panel";
import { getLeadAccess } from "@/lib/leads.functions";
import { pageHead } from "@/lib/page-head";
import { FloatingContact } from "@/components/floating-contact";

export const Route = createFileRoute("/admin/leads")({ head: () => ({ ...pageHead("Gestión privada de contactos | Norita", "Panel privado del equipo autorizado de Norita para gestionar consultas y seguimiento comercial."), meta: [...pageHead("Gestión privada de contactos | Norita", "Panel privado del equipo autorizado de Norita para gestionar consultas y seguimiento comercial.").meta, { name: "robots", content: "noindex, nofollow" }] }), loader: () => getLeadAccess(), component: AdminLeads });
function AdminLeads() {
  const access = Route.useLoaderData();
  return <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8"><div className="mb-8 flex items-center justify-between"><span className="font-display text-2xl font-semibold text-primary">norita<span className="text-accent">+</span></span><Button variant="link" asChild><Link to="/"><ArrowLeft />Volver a la web</Link></Button></div>{access.authorized ? <><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="flex items-center gap-2 text-sm text-accent"><ShieldCheck className="h-4 w-4" />Equipo Norita</p><h1 className="mt-3 text-3xl font-medium">Contactos y seguimiento</h1></div><p className="text-sm text-muted-foreground">{access.user?.displayName}</p></div><LeadsPanel /></> : <section className="mx-auto max-w-xl py-20"><ShieldCheck className="h-8 w-8 text-accent" /><h1 className="mt-6 text-3xl">Acceso restringido</h1><p className="mt-4 leading-relaxed text-muted-foreground">{access.user ? "Tu cuenta de Lovable aún no está autorizada para gestionar los contactos de Norita." : "Este panel requiere una sesión de Lovable y autorización administrativa de Norita."}</p>{access.user && <p className="mt-6 break-all border-t border-border pt-4 text-sm text-muted-foreground">Identificador de tu cuenta para solicitar autorización: <span className="font-mono">{access.user.userId}</span></p>}</section>}<FloatingContact /></main>;
}