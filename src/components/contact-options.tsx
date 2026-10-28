import { useState } from "react";
import { CalendarDays, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ContactForm } from "@/components/contact-form";
import { CALENDLY_URL } from "@/lib/contact-config";

export function InformationButton({ label = "Solicitar información", service = "", variant = "outline" }: { label?: string; service?: string; variant?: "outline" | "link" }) {
  const [open, setOpen] = useState(false);
  return <Dialog open={open} onOpenChange={setOpen}><Button variant={variant} className={variant === "link" ? "h-auto justify-start whitespace-normal p-0 text-sm" : "h-12 whitespace-normal"} onClick={() => setOpen(true)}>{label}<ArrowRight className="h-4 w-4 shrink-0" /></Button><DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-md"><DialogHeader className="pr-5"><DialogTitle className="text-2xl leading-snug">Conversemos sobre cómo acompañar a tus padres</DialogTitle><DialogDescription className="mt-2 leading-relaxed">Cuéntanos qué necesitas y nuestro equipo se pondrá en contacto contigo para orientarte.</DialogDescription></DialogHeader><ContactForm initialService={service} /></DialogContent></Dialog>;
}

export function ScheduleCall() {
  const [open, setOpen] = useState(false);
  if (CALENDLY_URL) return <Button asChild variant="link" className="h-auto whitespace-normal text-sm"><a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer"><CalendarDays className="h-4 w-4 shrink-0" />Agenda una llamada gratuita de 15 minutos.</a></Button>;
  return <Dialog open={open} onOpenChange={setOpen}><Button variant="link" className="h-auto max-w-full whitespace-normal text-sm" onClick={() => setOpen(true)}><CalendarDays className="h-4 w-4 shrink-0" />¿Prefieres conversar con nosotros? Agenda una llamada gratuita de 15 minutos.</Button><DialogContent className="w-[calc(100%-2rem)] rounded-md"><DialogHeader><DialogTitle className="text-xl">Conversemos sobre tu familia</DialogTitle><DialogDescription className="pt-3 leading-relaxed">La agenda de llamadas aún no está disponible. Déjanos tu solicitud y te contactamos.</DialogDescription></DialogHeader><Button asChild className="h-12"><a href="/contacto">Solicitar información</a></Button></DialogContent></Dialog>;
}