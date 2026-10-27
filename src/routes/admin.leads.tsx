import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminGate } from "@/components/admin-auth";
import { LeadsPanel } from "@/components/leads-panel";
import { getLeadAccess } from "@/lib/leads.functions";
import { pageHead } from "@/lib/page-head";
import { FloatingContact } from "@/components/floating-contact";

// The admin session lives in the browser, so this page renders on the client only.
export const Route = createFileRoute("/admin/leads")({ ssr: false, head: () => ({ ...pageHead("Gestión privada de contactos | Norita", "Panel privado del equipo autorizado de Norita para gestionar consultas y seguimiento comercial."), meta: [...pageHead("Gestión privada de contactos | Norita", "Panel privado del equipo autorizado de Norita para gestionar consultas y seguimiento comercial.").meta, { name: "robots", content: "noindex, nofollow" }] }), component: AdminLeads });
function AdminLeads() {
  return <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8"><div className="mb-8 flex items-center justify-between"><span className="font-display text-2xl font-semibold text-primary">norita<span className="text-accent">+</span></span><Button variant="link" asChild><Link to="/"><ArrowLeft />Volver a la web</Link></Button></div><AdminGate><AuthorizedArea /></AdminGate><FloatingContact /></main>;
}
function AuthorizedArea() {
  const fetchAccess = useServerFn(getLeadAccess);
  const query = useQuery({ queryKey: ["norita-admin-access"], queryFn: () => fetchAccess() });
  const access = query.data;
  if (query.isPending) return <p role="status" className="py-20 text-center text-muted-foreground">Comprobando autorización…</p>;
  if (query.isError) return <div role="alert" className="py-20 text-center"><p>No pudimos comprobar tu autorización.</p><Button className="mt-4" onClick={() => query.refetch()}>Reintentar</Button></div>;
  if (!access?.authorized) return <section className="mx-auto max-w-xl py-20"><ShieldCheck className="h-8 w-8 text-accent" /><h1 className="mt-6 text-3xl">Acceso restringido</h1><p className="mt-4 leading-relaxed text-muted-foreground">Tu cuenta aún no está autorizada para gestionar los contactos de Norita.</p>{access?.user && <p className="mt-6 break-all border-t border-border pt-4 text-sm text-muted-foreground">Identificador de tu cuenta para solicitar autorización: <span className="font-mono">{access.user.userId}</span></p>}</section>;
  return <><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="flex items-center gap-2 text-sm text-accent"><ShieldCheck className="h-4 w-4" />Equipo Norita</p><h1 className="mt-3 text-3xl font-medium">Contactos y seguimiento</h1></div><p className="text-sm text-muted-foreground">{access.user?.email}</p></div><LeadsPanel /></>;
}
