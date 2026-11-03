import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Captcha } from "@/components/turnstile";
import { LEAD_COUNTRIES, PHONE_PREFIXES, type LeadCountry } from "@/lib/lead-fields";
import {
  AVAILABILITY_DAYS,
  AVAILABILITY_SLOTS,
  CAREGIVER_AREAS,
  CAREGIVER_SERVICES,
  EXPERIENCE_TYPES,
  EXPERIENCE_YEARS,
  TRAINING,
  areaLabel,
  caregiverApplicationSchema,
} from "@/lib/caregiver-fields";
import { submitCaregiverApplication } from "@/lib/caregivers.functions";
import { applicationsReady, CAREGIVER_PRIVACY_PATH } from "@/lib/caregiver-config";

const field = "mt-2 h-12 rounded-xl bg-card text-base";
// Native selects: long district lists use the phone's own picker on mobile.
const nativeSelect =
  "mt-2 flex h-12 w-full rounded-xl border border-input bg-card px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-destructive disabled:cursor-not-allowed disabled:opacity-50";

type Option = { readonly value: string; readonly label: string };

// A group of checkbox chips. Selection is a list of option keys.
function ChipGroup({
  name,
  legend,
  options,
  selected,
  onChange,
  error,
  hint,
}: {
  name: string;
  legend: string;
  options: readonly Option[];
  selected: string[];
  onChange: (next: string[]) => void;
  error?: string | undefined;
  hint?: string;
}) {
  const toggle = (value: string) =>
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  return (
    <fieldset aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="text-sm font-medium">{legend}</legend>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((o) => {
          const checked = selected.includes(o.value);
          return (
            <label
              key={o.value}
              className={`flex min-h-11 cursor-pointer items-center gap-2.5 rounded-full border px-4 py-2 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring ${checked ? "border-primary bg-secondary font-semibold text-primary" : "border-input bg-card hover:border-primary/50"}`}
            >
              <Checkbox
                checked={checked}
                onCheckedChange={() => toggle(o.value)}
                className="shrink-0"
              />
              {o.label}
            </label>
          );
        })}
      </div>
      {error && (
        <p id={`${name}-error`} className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </fieldset>
  );
}

export function CaregiverApplicationForm() {
  const send = useServerFn(submitCaregiverApplication);
  const [phonePrefix, setPhonePrefix] = useState("PE");
  const [country, setCountry] = useState<LeadCountry | "">("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [experienceTypes, setExperienceTypes] = useState<string[]>([]);
  const [training, setTraining] = useState<string[]>([]);
  const [days, setDays] = useState<string[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [adult, setAdult] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [talentPool, setTalentPool] = useState(false);
  const [captcha, setCaptcha] = useState("");
  const [captchaKey, setCaptchaKey] = useState(0);
  // Kept across retries so a resubmission after an error never creates a second application.
  const submissionId = useRef<string | null>(null);
  // Synchronous guard: a double click fires twice before React re-renders the disabled button.
  const inFlight = useRef(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const fieldError = (name: string) =>
    errors[name] ? (
      <p id={`${name}-error`} className="mt-1 text-sm text-destructive">
        {errors[name]}
      </p>
    ) : null;
  const invalid = (name: string) => ({
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });
  const cities = country ? Object.keys(CAREGIVER_AREAS[country]) : [];
  const areas = country && city ? (CAREGIVER_AREAS[country][city] ?? []) : [];

  if (success)
    return (
      <div aria-live="polite" className="py-8">
        <h3 className="text-3xl">¡Gracias por postular a Norita!</h3>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Hemos recibido tu postulación. Nuestro equipo la revisará y te escribirá al número que nos
          dejaste para contarte los siguientes pasos.
        </p>
      </div>
    );

  return (
    <form
      noValidate
      aria-busy={busy}
      className="space-y-7"
      onSubmit={async (event) => {
        event.preventDefault();
        if (inFlight.current) return;
        const form = new FormData(event.currentTarget);
        submissionId.current ??= crypto.randomUUID();
        const input = {
          name: form.get("name") ?? "",
          phone_prefix: phonePrefix,
          phone: form.get("phone") ?? "",
          country,
          city,
          district,
          experience_years: experienceYears,
          experience_types: experienceTypes,
          training,
          availability_days: days,
          availability_slots: slots,
          services,
          adult_confirmed: adult,
          consent_processing: processing,
          consent_talent_pool: talentPool,
          website: form.get("website") ?? "",
          captcha,
          submission_id: submissionId.current,
        };
        const parsed = caregiverApplicationSchema.safeParse(input);
        if (!parsed.success) {
          const fieldErrors: Record<string, string> = {};
          for (const issue of parsed.error.issues)
            fieldErrors[String(issue.path[0])] ??= issue.message;
          setErrors(fieldErrors);
          return;
        }
        inFlight.current = true;
        setErrors({});
        setBusy(true);
        try {
          // The raw input is sent; the server validates and normalizes it again.
          const result = await send({ data: input });
          if (result?.success !== true)
            throw new Error(
              "No pudimos confirmar que tu postulación se guardó. Inténtalo nuevamente.",
            );
          setSuccess(true);
        } catch (error) {
          setErrors({
            submit:
              error instanceof Error
                ? error.message
                : "No pudimos guardar tu postulación. Inténtalo nuevamente.",
          });
          setCaptcha("");
          setCaptchaKey((v) => v + 1);
        } finally {
          inFlight.current = false;
          setBusy(false);
        }
      }}
    >
      {!applicationsReady && (
        <p
          role="status"
          className="rounded-2xl border-l-4 border-highlight bg-secondary px-5 py-4 text-sm leading-relaxed"
        >
          Estamos preparando las postulaciones. Muy pronto podrás enviarnos tus datos desde aquí.
        </p>
      )}
      <fieldset disabled={busy} className="space-y-7">
        <label className="block text-sm font-medium">
          Nombre completo <span aria-hidden="true">*</span>
          <Input
            name="name"
            autoComplete="name"
            required
            maxLength={100}
            {...invalid("name")}
            className={field}
          />
          {fieldError("name")}
        </label>
        <div>
          <span id="cg-phone-label" className="text-sm font-medium">
            Teléfono / WhatsApp <span aria-hidden="true">*</span>
          </span>
          <div className="grid grid-cols-[minmax(0,8.5rem)_minmax(0,1fr)] gap-2">
            <select
              aria-label="Prefijo internacional"
              value={phonePrefix}
              onChange={(e) => setPhonePrefix(e.target.value)}
              {...invalid("phone_prefix")}
              className={nativeSelect}
            >
              {PHONE_PREFIXES.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label} +{p.code}
                </option>
              ))}
            </select>
            <Input
              name="phone"
              type="tel"
              autoComplete="tel-national"
              inputMode="tel"
              required
              maxLength={24}
              aria-labelledby="cg-phone-label"
              placeholder={
                phonePrefix === "PE" ? "987 654 321" : phonePrefix === "CO" ? "300 123 4567" : ""
              }
              {...invalid("phone")}
              className={field}
            />
          </div>
          {fieldError("phone_prefix")}
          {fieldError("phone")}
        </div>

        <fieldset className="space-y-5">
          <legend className="text-sm font-medium">¿Dónde vives o prefieres trabajar?</legend>
          <div className="grid gap-5 sm:grid-cols-3">
            <label className="block text-sm font-medium">
              País <span aria-hidden="true">*</span>
              <select
                name="country"
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value as LeadCountry | "");
                  setCity("");
                  setDistrict("");
                }}
                {...invalid("country")}
                className={nativeSelect}
              >
                <option value="">Selecciona</option>
                {LEAD_COUNTRIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              {fieldError("country")}
            </label>
            <label className="block text-sm font-medium">
              Ciudad <span aria-hidden="true">*</span>
              <select
                name="city"
                value={city}
                disabled={!country}
                onChange={(e) => {
                  setCity(e.target.value);
                  setDistrict("");
                }}
                {...invalid("city")}
                className={nativeSelect}
              >
                <option value="">{country ? "Selecciona" : "Elige el país"}</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {fieldError("city")}
            </label>
            <label className="block text-sm font-medium">
              {country ? areaLabel(country) : "Distrito o localidad"}{" "}
              <span aria-hidden="true">*</span>
              <select
                name="district"
                value={district}
                disabled={!city}
                onChange={(e) => setDistrict(e.target.value)}
                {...invalid("district")}
                className={nativeSelect}
              >
                <option value="">{city ? "Selecciona" : "Elige la ciudad"}</option>
                {areas.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              {fieldError("district")}
            </label>
          </div>
          <p className="text-xs text-muted-foreground">
            Por ahora buscamos cuidadores en Lima Metropolitana, Callao y Bogotá D.C.
          </p>
        </fieldset>

        <label className="block text-sm font-medium">
          Experiencia cuidando adultos mayores <span aria-hidden="true">*</span>
          <select
            name="experience_years"
            value={experienceYears}
            onChange={(e) => {
              setExperienceYears(e.target.value);
              if (e.target.value === "none") setExperienceTypes([]);
            }}
            {...invalid("experience_years")}
            className={nativeSelect}
          >
            <option value="">Selecciona</option>
            {EXPERIENCE_YEARS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {fieldError("experience_years")}
        </label>
        {experienceYears && experienceYears !== "none" && (
          <ChipGroup
            name="experience_types"
            legend="¿Dónde has cuidado? (Opcional)"
            options={EXPERIENCE_TYPES}
            selected={experienceTypes}
            onChange={setExperienceTypes}
            error={errors["experience_types"]}
          />
        )}
        <ChipGroup
          name="training"
          legend="Formación o certificaciones *"
          hint="No necesitas enviarnos certificados ahora; los revisamos más adelante."
          options={TRAINING}
          selected={training}
          // "No formal training yet" excludes the rest.
          onChange={(next) =>
            setTraining(
              next.includes("none") && !training.includes("none")
                ? ["none"]
                : next.filter((v) => v !== "none"),
            )
          }
          error={errors["training"]}
        />
        <div className="grid gap-7 md:grid-cols-2">
          <ChipGroup
            name="availability_days"
            legend="Días disponibles *"
            options={AVAILABILITY_DAYS}
            selected={days}
            onChange={setDays}
            error={errors["availability_days"]}
          />
          <ChipGroup
            name="availability_slots"
            legend="Franjas disponibles *"
            options={AVAILABILITY_SLOTS}
            selected={slots}
            onChange={setSlots}
            error={errors["availability_slots"]}
          />
        </div>
        <ChipGroup
          name="services"
          legend="Servicios que puedes realizar *"
          options={CAREGIVER_SERVICES.map((s) => ({ value: s, label: s }))}
          selected={services}
          onChange={setServices}
          error={errors["services"]}
        />

        <div className="hidden" aria-hidden="true">
          <label>
            Sitio web
            <Input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <div className="space-y-4 border-t border-border pt-6 text-sm leading-relaxed">
          <label className="flex items-start gap-3">
            <Checkbox
              checked={adult}
              onCheckedChange={(v) => setAdult(v === true)}
              className="mt-1 shrink-0"
            />
            <span>Confirmo que soy mayor de 18 años. *</span>
          </label>
          {fieldError("adult_confirmed")}
          <label className="flex items-start gap-3">
            <Checkbox
              checked={processing}
              onCheckedChange={(v) => setProcessing(v === true)}
              className="mt-1 shrink-0"
            />
            <span>
              Autorizo el tratamiento de mis datos para evaluar mi postulación, según el{" "}
              <a href={CAREGIVER_PRIVACY_PATH} className="text-primary underline">
                aviso de privacidad para postulantes
              </a>
              . *
            </span>
          </label>
          {fieldError("consent_processing")}
          <label className="flex items-start gap-3">
            <Checkbox
              checked={talentPool}
              onCheckedChange={(v) => setTalentPool(v === true)}
              className="mt-1 shrink-0"
            />
            <span>Quiero que Norita me tenga en cuenta para futuras oportunidades. (Opcional)</span>
          </label>
        </div>
      </fieldset>
      {applicationsReady && (
        <Captcha key={captchaKey} action="norita_caregiver" onToken={setCaptcha} />
      )}
      {applicationsReady && !captcha && !busy && (
        <p className="text-xs text-muted-foreground">
          Completa la verificación de seguridad para poder enviar.
        </p>
      )}
      {errors["submit"] && (
        <p role="alert" className="text-sm text-destructive">
          {errors["submit"]}
        </p>
      )}
      <Button
        type="submit"
        size="lg"
        disabled={!applicationsReady || busy || !captcha}
        className="w-full"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {busy ? "Enviando…" : "Enviar postulación"}
      </Button>
    </form>
  );
}
