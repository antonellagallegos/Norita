import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FREQUENCIES, SERVICES, leadSchema } from "@/lib/leads";
import { submitLead } from "@/lib/leads.functions";
import { captureReady, PRIVACY_URL, TURNSTILE_SITE_KEY } from "@/lib/contact-config";
import { whatsappUrl } from "@/lib/brand";

type Turnstile = { render: (el: HTMLElement, options: { sitekey: string; action: string; callback: (token: string) => void; "expired-callback": () => void; "error-callback": () => void }) => string; remove: (id: string) => void };

function Captcha({ onToken }: { onToken: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    let widget: string | undefined;
    let cancelled = false;
    const win = window as Window & { turnstile?: Turnstile };
    const render = () => { if (!cancelled && ref.current && win.turnstile) widget = win.turnstile.render(ref.current, { sitekey: TURNSTILE_SITE_KEY, action: "norita_contact", callback: onToken, "expired-callback": () => onToken(""), "error-callback": () => onToken("") }); };
    const existing = document.getElementById("norita-turnstile");
    if (win.turnstile) render();
    else if (existing) existing.addEventListener("load", render, { once: true });
    else { const script = document.createElement("script"); script.id = "norita-turnstile"; script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"; script.async = true; script.addEventListener("load", render, { once: true }); document.head.appendChild(script); }
    return () => { cancelled = true; existing?.removeEventListener("load", render); if (widget && win.turnstile) win.turnstile.remove(widget); };
  }, [onToken]);
  return <div ref={ref} />;
}

export function ContactForm({ initialService = "" }: { initialService?: string }) {
  const send = useServerFn(submitLead);
  const [service, setService] = useState(initialService);
  const [frequency, setFrequency] = useState("");
  const [preferred, setPreferred] = useState("WhatsApp");
  const [processing, setProcessing] = useState(false);
  const [commercial, setCommercial] = useState(false);
  const [captcha, setCaptcha] = useState("");
  const [captchaKey, setCaptchaKey] = useState(0);
  const submissionId = useRef<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const fieldError = (name: string) => errors[name] ? <p id={`${name}-error`} className="mt-1 text-sm text-destructive">{errors[name]}</p> : null;
  if (success) return <div aria-live="polite" className="py-8"><h2 className="text-2xl">¡Gracias por contactar a Norita!</h2><p className="mt-4 leading-relaxed text-muted-foreground">Hemos recibido tu solicitud. Pronto nos pondremos en contacto contigo para conocer mejor lo que necesitas.</p><Button asChild variant="outline" className="mt-6 h-auto min-h-12 whitespace-normal"><a href={whatsappUrl()} target="_blank" rel="noopener noreferrer"><MessageCircle /> Si prefieres, escríbenos directamente por WhatsApp.</a></Button></div>;
  return <form noValidate onSubmit={async event => {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    submissionId.current ??= crypto.randomUUID();
    const input = { name: form.get("name"), phone: form.get("phone"), service_interest: service, district: form.get("district") ?? "", frequency, preferred_contact: preferred, message: form.get("message") ?? "", consent_contact: commercial, consent_processing: processing, website: form.get("website") ?? "", captcha, submission_id: submissionId.current };
    const parsed = leadSchema.safeParse(input);
    if (!parsed.success) { setErrors(Object.fromEntries(parsed.error.issues.map(i => [String(i.path[0]), i.message]))); return; }
    setErrors({}); setBusy(true);
    try { await send({ data: parsed.data }); setSuccess(true); }
    catch (error) { setErrors({ submit: error instanceof Error ? error.message : "No pudimos guardar tu solicitud. Inténtalo nuevamente." }); setCaptcha(""); setCaptchaKey(v => v + 1); }
    finally { setBusy(false); }
  }} className="space-y-6">
    {!captureReady && <p role="status" className="border-l-2 border-accent bg-secondary px-4 py-3 text-sm leading-relaxed">Estamos preparando este canal de contacto. Por ahora, escríbenos por WhatsApp para recibir información.</p>}
    <div className="grid gap-5 sm:grid-cols-2">
      <label className="block text-sm font-medium">Nombre <span aria-hidden="true">*</span><Input name="name" autoComplete="name" required maxLength={100} aria-invalid={Boolean(errors["name"])} aria-describedby={errors["name"] ? "name-error" : undefined} className="mt-2 h-12 text-base" />{fieldError("name")}</label>
      <label className="block text-sm font-medium">WhatsApp o teléfono <span aria-hidden="true">*</span><Input name="phone" type="tel" autoComplete="tel" required maxLength={24} aria-invalid={Boolean(errors["phone"])} aria-describedby={errors["phone"] ? "phone-error" : undefined} className="mt-2 h-12 text-base" />{fieldError("phone")}</label>
    </div>
    <div><label htmlFor="service-interest" className="text-sm font-medium">Servicio de interés *</label><Select value={service} onValueChange={setService}><SelectTrigger id="service-interest" aria-invalid={Boolean(errors["service_interest"])} className="mt-2 h-12"><SelectValue placeholder="Selecciona un servicio" /></SelectTrigger><SelectContent>{SERVICES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>{fieldError("service_interest")}</div>
    <details className="border-y border-border py-4"><summary className="cursor-pointer text-sm font-medium text-primary">Más detalles (opcional)</summary><div className="mt-5 space-y-5">
      <label className="block text-sm font-medium">Distrito de Lima<Input name="district" maxLength={100} className="mt-2 h-12 text-base" /></label>
      <div><label htmlFor="frequency" className="text-sm font-medium">Frecuencia deseada</label><Select value={frequency} onValueChange={setFrequency}><SelectTrigger id="frequency" className="mt-2 h-12"><SelectValue placeholder="Selecciona una opción" /></SelectTrigger><SelectContent>{FREQUENCIES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent></Select></div>
      <div><label htmlFor="preferred" className="text-sm font-medium">Preferencia de contacto</label><Select value={preferred} onValueChange={setPreferred}><SelectTrigger id="preferred" className="mt-2 h-12"><SelectValue /></SelectTrigger><SelectContent>{["WhatsApp", "Llamada telefónica"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
      <label className="block text-sm font-medium">Comentario o consulta<Textarea name="message" maxLength={1000} className="mt-2 min-h-28 text-base" placeholder="No incluyas diagnósticos, medicamentos ni información médica." /></label>
    </div></details>
    <div className="hidden" aria-hidden="true"><label>Sitio web<Input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <div className="space-y-4 text-sm leading-relaxed">
      <label className="flex items-start gap-3"><Checkbox checked={processing} onCheckedChange={v => setProcessing(v === true)} className="mt-1 shrink-0" /><span>Autorizo el tratamiento de mis datos para atender esta solicitud, según la {PRIVACY_URL ? <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="text-primary underline">política de privacidad</a> : <a href="/privacidad" className="text-primary underline">política de privacidad</a>}.</span></label>{fieldError("consent_processing")}
      <label className="flex items-start gap-3"><Checkbox checked={commercial} onCheckedChange={v => setCommercial(v === true)} className="mt-1 shrink-0" /><span>También autorizo recibir comunicaciones comerciales de Norita. (Opcional)</span></label>
    </div>
    {captureReady && <Captcha key={captchaKey} onToken={setCaptcha} />}
    {errors["submit"] && <p role="alert" className="text-sm text-destructive">{errors["submit"]}</p>}
    <Button type="submit" disabled={!captureReady || busy || !captcha} className="h-12 w-full"><Send className="h-4 w-4" />{busy ? "Enviando…" : "Enviar solicitud"}</Button>
    <Button variant="outline" asChild className="h-12 w-full"><a href={whatsappUrl()} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-5 w-5" /> Contactar por WhatsApp</a></Button>
  </form>;
}