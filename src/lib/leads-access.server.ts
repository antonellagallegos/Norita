import { createClient } from "@supabase/supabase-js";
import { getRequest } from "@tanstack/react-start/server";
import { getSessionUser } from "@/lib/auth.server";
import type { Database } from "@/integrations/supabase/types";

export async function resolveLeadAccess() {
  const user = await getSessionUser();
  if (!user) return { user: null, client: null };
  const token = getRequest().headers.get("x-lovable-identity-token");
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!token || !url || !key) throw new Error("No se pudo comprobar el acceso. Inténtalo nuevamente.");
  const client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` }, fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    } },
  });
  const { data, error } = await client.rpc("is_lead_admin");
  if (error) throw new Error("No se pudo comprobar tu autorización.");
  return { user, client: data === true ? client : null };
}

export async function requireLeadAdmin() {
  const access = await resolveLeadAccess();
  if (!access.user || !access.client) throw new Error("Acceso restringido a administradores autorizados de Norita.");
  return { user: access.user, client: access.client };
}