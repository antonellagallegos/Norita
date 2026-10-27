import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { KeyRound, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

type Stage = "loading" | "signed-out" | "enroll" | "challenge" | "ready";

// Admin access needs a Supabase account (created by the team, no public sign-up) plus a
// TOTP authenticator app. The server and the database check the second factor again.
async function currentStage(): Promise<Stage> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return "signed-out";
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error) return "signed-out";
  if (data.currentLevel === "aal2") return "ready";
  return data.nextLevel === "aal2" ? "challenge" : "enroll";
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return <section className="mx-auto max-w-md py-16"><ShieldCheck className="h-8 w-8 text-accent" /><h1 className="mt-6 text-3xl">{title}</h1>{children}</section>;
}

function CodeForm({ label, busy, error, onSubmit }: { label: string; busy: boolean; error: string; onSubmit: (code: string) => void }) {
  const [code, setCode] = useState("");
  return <form className="mt-6 space-y-4" onSubmit={e => { e.preventDefault(); onSubmit(code); }}>
    <label className="block text-sm font-medium">{label}<Input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" required className="mt-2 h-12 text-base tracking-widest" /></label>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <Button type="submit" disabled={busy || code.length !== 6} className="h-12 w-full"><KeyRound className="h-4 w-4" />{busy ? "Verificando…" : "Verificar código"}</Button>
  </form>;
}

function SignIn({ onDone }: { onDone: () => void }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  return <Panel title="Acceso del equipo"><p className="mt-4 leading-relaxed text-muted-foreground">Inicia sesión con la cuenta que te asignó Norita.</p>
    <form className="mt-6 space-y-4" onSubmit={async e => {
      e.preventDefault(); setBusy(true); setError("");
      const form = new FormData(e.currentTarget);
      const { error } = await supabase.auth.signInWithPassword({ email: String(form.get("email")), password: String(form.get("password")) });
      setBusy(false);
      if (error) setError("No pudimos iniciar sesión. Revisa tu correo y contraseña."); else onDone();
    }}>
      <label className="block text-sm font-medium">Correo<Input name="email" type="email" autoComplete="username" required className="mt-2 h-12 text-base" /></label>
      <label className="block text-sm font-medium">Contraseña<Input name="password" type="password" autoComplete="current-password" required className="mt-2 h-12 text-base" /></label>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={busy} className="h-12 w-full">{busy ? "Entrando…" : "Iniciar sesión"}</Button>
    </form>
  </Panel>;
}

function Enroll({ onDone }: { onDone: () => void }) {
  const [factor, setFactor] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      // Drop half-finished enrollments so the user can always start again.
      const { data: factors } = await supabase.auth.mfa.listFactors();
      for (const f of factors?.all ?? []) if (f.status === "unverified") await supabase.auth.mfa.unenroll({ factorId: f.id });
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "Norita admin" });
      if (error || !data) setError("No pudimos preparar la verificación en dos pasos. Recarga la página.");
      else setFactor({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
    })();
  }, []);
  return <Panel title="Activa la verificación en dos pasos"><p className="mt-4 leading-relaxed text-muted-foreground">Escanea el código con una app de autenticación (Google Authenticator, Microsoft Authenticator o 1Password) e introduce el código de 6 dígitos.</p>
    {factor && <><img src={factor.qr} alt="Código QR para la app de autenticación" className="mt-6 h-48 w-48 bg-white p-2" /><p className="mt-3 break-all text-xs text-muted-foreground">Clave manual: <span className="font-mono">{factor.secret}</span></p></>}
    <CodeForm label="Código de la app" busy={busy || !factor} error={error} onSubmit={async code => {
      if (!factor) return;
      setBusy(true); setError("");
      const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
      setBusy(false);
      if (error) setError("El código no es válido o ha caducado."); else onDone();
    }} />
  </Panel>;
}

function Challenge({ onDone }: { onDone: () => void }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  return <Panel title="Verificación en dos pasos"><p className="mt-4 leading-relaxed text-muted-foreground">Introduce el código de 6 dígitos de tu app de autenticación.</p>
    <CodeForm label="Código de la app" busy={busy} error={error} onSubmit={async code => {
      setBusy(true); setError("");
      const { data } = await supabase.auth.mfa.listFactors();
      const factor = data?.totp[0];
      const result = factor ? await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code }) : { error: new Error("no factor") };
      setBusy(false);
      if (result.error) setError("El código no es válido o ha caducado."); else onDone();
    }} />
  </Panel>;
}

export function AdminGate({ children }: { children: ReactNode }) {
  const [stage, setStage] = useState<Stage>("loading");
  const queryClient = useQueryClient();
  const refresh = useCallback(() => { currentStage().then(setStage, () => setStage("signed-out")); }, []);
  useEffect(() => {
    refresh();
    // Supabase warns against awaiting its own calls inside this callback; defer instead.
    const { data } = supabase.auth.onAuthStateChange(() => { setTimeout(refresh, 0); });
    return () => data.subscription.unsubscribe();
  }, [refresh]);
  const signOut = async () => { await supabase.auth.signOut(); queryClient.clear(); refresh(); };
  if (stage === "loading") return <p role="status" className="py-20 text-center text-muted-foreground">Comprobando acceso…</p>;
  if (stage === "signed-out") return <SignIn onDone={refresh} />;
  const content = stage === "enroll" ? <Enroll onDone={refresh} /> : stage === "challenge" ? <Challenge onDone={refresh} /> : children;
  return <>{content}<div className="mt-10 border-t border-border pt-4 text-right"><Button variant="link" onClick={signOut}><LogOut className="h-4 w-4" />Cerrar sesión</Button></div></>;
}
