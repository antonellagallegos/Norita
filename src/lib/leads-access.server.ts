import { createClient } from "@supabase/supabase-js";
import { getRequest } from "@tanstack/react-start/server";
import type { Database } from "@/integrations/supabase/types";

export type AdminUser = { userId: string; email: string | null; mfa: boolean };

// Admins sign in with Supabase Auth; the browser attaches the session as a bearer token
// (see auth-attacher). Queries run with that token, so RLS enforces the same rules again.
export async function resolveLeadAccess(): Promise<{ user: AdminUser | null; client: ReturnType<typeof createClient<Database>> | null }> {
  const token = /^Bearer (\S+)$/.exec(getRequest()?.headers.get("authorization") ?? "")?.[1];
  if (!token) return { user: null, client: null };
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("No se pudo comprobar el acceso. Inténtalo nuevamente.");
  const client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` }, fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    } },
  });
  const { data, error } = await client.auth.getClaims(token);
  if (error || !data?.claims?.sub) return { user: null, client: null };
  const user = { userId: data.claims.sub, email: typeof data.claims.email === "string" ? data.claims.email : null, mfa: data.claims.aal === "aal2" };
  // Without the second factor the database denies access anyway; skip the query.
  if (!user.mfa) return { user, client: null };
  const admin = await client.rpc("is_lead_admin");
  if (admin.error) throw new Error("No se pudo comprobar tu autorización.");
  return { user, client: admin.data === true ? client : null };
}

export async function requireLeadAdmin() {
  const access = await resolveLeadAccess();
  if (!access.user || !access.client) throw new Error("Acceso restringido a administradores autorizados de Norita.");
  return { user: access.user, client: access.client };
}
