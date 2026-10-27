import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/contact-form";
import { ScheduleCall } from "@/components/contact-options";
import { pageHead } from "@/lib/page-head";
import { FloatingContact } from "@/components/floating-contact";

export const Route = createFileRoute("/contacto")({ head: () => pageHead("Contacta con Norita | Acompañamiento para tu familia", "Consulta los servicios de Norita para adultos mayores en Lima. Contacta por WhatsApp o deja tu solicitud de información."), component: ContactPage });
function ContactPage() { return <main className="mx-auto min-h-screen max-w-2xl px-5 py-8 sm:px-8 sm:py-12"><Button asChild variant="link" className="mb-8 p-0"><Link to="/"><ArrowLeft /> Volver a Norita</Link></Button><p className="text-sm font-semibold uppercase text-accent">Norita · Conversemos</p><h1 className="mt-3 text-3xl font-medium leading-tight">Conversemos sobre cómo acompañar a tus padres</h1><p className="mb-8 mt-4 leading-relaxed text-muted-foreground">Cuéntanos qué necesitas y nuestro equipo se pondrá en contacto contigo para orientarte.</p><ContactForm /><div className="mt-8 border-t border-border pt-6"><ScheduleCall /></div><FloatingContact /></main>; }