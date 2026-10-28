import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FREQUENCIES, SERVICES, leadSchema } from "@/lib/leads";
import { LEAD_COUNTRIES, LOCALITIES, OTHER_LOCALITY, PHONE_PREFIXES, type LeadCountry } from "@/lib/lead-fields";
import { submitLead } from "@/lib/leads.functions";
import { captureReady, PRIVACY_URL, TURNSTILE_SITE_KEY } from "@/lib/contact-config";

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

// Native selects for prefix, country and locality: long lists use the phone's own picker on mobile.
const nativeSelect = "mt-2 flex h-12 w-full rounded-md border border-input bg-background px-3 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring aria-[invalid=true]:border-destructive";

export function ContactForm({ initialService = "" }: { initialService?: string }) {
  const send = useServerFn(submitLead);
  const [service, setService] = useState(initialService);
  const [phonePrefix, setPhonePrefix] = useState("PE");
  const [country, setCountry] = useState<LeadCountry | "">("");
  const [district, setDistrict] = useState("");
  const [frequency, setFrequency] = useState("");
  const [preferred, setPreferred] = useState("WhatsApp");
  const [processing, setProcessing] = useState(false);
  const [commercial, setCommercial] = useState(false);
  const [captcha, setCaptcha] = useState("");
  const [captchaKey, setCaptchaKey] = useState(0);
  // Kept across retries so a resubmission after an error never creates a second lead.
  const submissionId = useRef<string | null>(null);
  // Synchronous guard: a double click fires twice before React re-renders the disabled button.
  const inFlight = useRef(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const fieldError = (name: string) => errors[name] ? <p id={`${name}-error`} className="mt-1 text-sm text-destructive">{errors[name]}</p> : null;
  const invalid = (name: string) => ({ "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? `${name}-error` : undefined });
  const localityLabel = LEAD_COUNTRIES.find(c => c.value === country)?.localityLabel ?? "Distrito o localidad";
  if (success) return <div aria-live="polite" className="py-8"><h2 className="text-2xl">¡Gracias por contactar a Norita!</h2><p className="mt-4 leading-relaxed text-muted-foreground">Hemos recibido tu solicitud. Pronto nos pondremos en contacto contigo para conocer mejor lo que necesitas.</p></div>;
  return <form noValidate onSubmit={async event => {
    event.preventDefault();
    if (inFlight.current) return;
    const form = new FormData(event.currentTarget);
    submissionId.current ??= crypto.randomUUID();
    const input = { name: form.get("name") ?? "", email: form.get("email") ?? "", phone_prefix: phonePrefix, phone: form.get("phone") ?? "", service_interest: service, country, district, frequency, preferred_contact: preferred, message: form.get("message") ?? "", consent_contact: commercial, consent_processing: processing, website: form.get("website") ?? "", captcha, submission_id: submissionId.current };
    const parsed = leadSchema.safeParse(input);
    if (!parsed.success) {
      // First issue per field: "required" reads better than "invalid format" for an empty field.
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
      setErrors(fieldErrors);
      return;
    }
    inFlight.current = true; setErrors({}); setBusy(true);
    try {
      // The raw input is sent; the server validates and normalizes it again.
      const result = await send({ data: input });
      if (result?.success !== true) throw new Error("No pudimos confirmar que tu solicitud se guardó. Inténtalo nuevamente.");
      setSuccess(true);
    } catch (error) { setErrors({ submit: error instanceof Error ? error.message : "No pudimos guardar tu solicitud. Inténtalo nuevamente." }); setCaptcha(""); setCaptchaKey(v => v + 1); }
    finally { inFlight.current = false; setBusy(false); }
  }} className="space-y-6" aria-busy={busy}>
    {!captureReady && <p role="status" className="border-l-2 border-accent bg-secondary px-4 py-3 text-sm leading-relaxed">Estamos preparando este canal de contacto. Vuelve pronto para enviar tu solicitud.</p>}
    <fieldset disabled={busy} className="space-y-6">
    <label className="block text-sm font-medium">Nombre completo <span aria-hidden="true">*</span><Input name="name" autoComplete="name" required maxLength={100} {...invalid("name")} className="mt-2 h-12 text-base" />{fieldError("name")}</label>
    <label className="block text-sm font-medium">Correo electrónico <span aria-hidden="true">*</span><Input name="email" type="email" autoComplete="email" inputMode="email" required maxLength={254} {...invalid("email")} className="mt-2 h-12 text-base" />{fieldError("email")}</label>
    <div>
      <span id="phone-label" className="text-sm font-medium">Número de WhatsApp <span aria-hidden="true">*</span></span>
      <div className="grid grid-cols-[minmax(0,8.5rem)_minmax(0,1fr)] gap-2">
        <select aria-label="Prefijo internacional" value={phonePrefix} onChange={e => setPhonePrefix(e.target.value)} {...invalid("phone_prefix")} className={nativeSelect}>{PHONE_PREFIXES.map(p => <option key={p.key} value={p.key}>{p.label} +{p.code}</option>)}</select>
        <Input name="phone" type="tel" autoComplete="tel-national" inputMode="tel" required maxLength={24} aria-labelledby="phone-label" placeholder={phonePrefix === "PE" ? "987 654 321" : phonePrefix === "CO" ? "300 123 4567" : ""} {...invalid("phone")} className="mt-2 h-12 text-base" />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Prefijo seleccionado: +{PHONE_PREFIXES.find(p => p.key === phonePrefix)?.code}. Si escribes el número con código de país, no se duplica.</p>
      {fieldError("phone_prefix")}{fieldError("phone")}
    </div>
    <div><label htmlFor="service-interest" className="text-sm font-medium">Servicio de interés *</label><Select value={service} onValueChange={setService}><SelectTrigger id="service-interest" aria-invalid={Boolean(errors["service_interest"])} className="mt-2 h-12"><SelectValue placeholder="Selecciona un servicio" /></SelectTrigger><SelectContent>{SERVICES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>{fieldError("service_interest")}</div>
    <fieldset className="space-y-5">
      <legend className="text-sm font-medium">¿Dónde vive tu familiar?</legend>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium">País <span aria-hidden="true">*</span><select name="country" value={country} onChange={e => { setCountry(e.target.value as LeadCountry | ""); setDistrict(""); }} required {...invalid("country")} className={nativeSelect}><option value="">Selecciona un país</option>{LEAD_COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select>{fieldError("country")}</label>
        <label className="block text-sm font-medium">{localityLabel} <span aria-hidden="true">*</span><select name="district" value={district} onChange={e => setDistrict(e.target.value)} required disabled={!country} {...invalid("district")} className={`${nativeSelect} disabled:cursor-not-allowed disabled:opacity-50`}><option value="">{country ? "Selecciona una opción" : "Primero elige el país"}</option>{country && LOCALITIES[country].map(g => <optgroup key={g.group} label={g.group}>{g.items.map(i => <option key={i} value={i}>{i}</option>)}</optgroup>)}{country && <option value={OTHER_LOCALITY}>{OTHER_LOCALITY}</option>}</select>{fieldError("district")}</label>
      </div>
      <p className="text-xs text-muted-foreground">Cobertura actual: Lima Metropolitana y Callao (Perú) y Bogotá D.C. (Colombia). Si tu familiar vive en otro lugar, elige «Otra ubicación» y te contactaremos igualmente.</p>
    </fieldset>
    <details className="border-y border-border py-4"><summary className="cursor-pointer text-sm font-medium text-primary">Más detalles (opcional)</summary><div className="mt-5 space-y-5">
      <div><label htmlFor="frequency" className="text-sm font-medium">Frecuencia deseada</label><Select value={frequency} onValueChange={setFrequency}><SelectTrigger id="frequency" className="mt-2 h-12"><SelectValue placeholder="Selecciona una opción" /></SelectTrigger><SelectContent>{FREQUENCIES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent></Select></div>
      <div><label htmlFor="preferred" className="text-sm font-medium">Preferencia de contacto</label><Select value={preferred} onValueChange={setPreferred}><SelectTrigger id="preferred" className="mt-2 h-12"><SelectValue /></SelectTrigger><SelectContent>{["WhatsApp", "Llamada telefónica"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
      <label className="block text-sm font-medium">Comentario o consulta<Textarea name="message" maxLength={1000} className="mt-2 min-h-28 text-base" placeholder="No incluyas diagnósticos, medicamentos ni información médica." /></label>
    </div></details>
    <div className="hidden" aria-hidden="true"><label>Sitio web<Input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <div className="space-y-4 text-sm leading-relaxed">
      <label className="flex items-start gap-3"><Checkbox checked={processing} onCheckedChange={v => setProcessing(v === true)} aria-label="Autorizo el tratamiento de mis datos para atender esta solicitud" className="mt-1 shrink-0" /><span>Autorizo el tratamiento de mis datos para atender esta solicitud, según la {PRIVACY_URL ? <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="text-primary underline">política de privacidad</a> : <a href="/privacidad" className="text-primary underline">política de privacidad</a>}.</span></label>{fieldError("consent_processing")}
      <label className="flex items-start gap-3"><Checkbox checked={commercial} onCheckedChange={v => setCommercial(v === true)} aria-label="También autorizo recibir comunicaciones comerciales de Norita" className="mt-1 shrink-0" /><span>También autorizo recibir comunicaciones comerciales de Norita. (Opcional)</span></label>
    </div>
    </fieldset>
    {captureReady && <Captcha key={captchaKey} onToken={setCaptcha} />}
    {captureReady && !captcha && !busy && <p className="text-xs text-muted-foreground">Completa la verificación de seguridad para poder enviar.</p>}
    {errors["submit"] && <p role="alert" className="text-sm text-destructive">{errors["submit"]}</p>}
    <Button type="submit" disabled={!captureReady || busy || !captcha} className="h-12 w-full">{busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" />}{busy ? "Enviando…" : "Enviar solicitud"}</Button>
  </form>;
}
