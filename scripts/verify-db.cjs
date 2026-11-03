// Verifies the Norita database after migrations.
//
//   node --env-file=.env.local scripts/verify-db.cjs --precheck   read-only: target project and pending migrations
//   node --env-file=.env.local scripts/verify-db.cjs              full verification (sections A, A2, B, C)
//
// Safety: refuses to run against any project other than supabase/config.toml, and the full run stops if any
// migration is pending or differs from its file. Sections 0, A, A2 and C are READ ONLY transactions. Section B
// runs only if A and A2 pass, writes fictitious rows inside ONE transaction that is always rolled back, and only
// targets rows it created. C compares row counts and content fingerprints before and after.
// Output is labels, counts and object names only: never the connection string, password, emails or lead data.
const fs = require("node:fs");
const path = require("node:path");
const { createHash, randomUUID } = require("node:crypto");
const postgres = require("postgres");

const ROOT = path.resolve(__dirname, "..");
const MIGRATIONS = path.join(ROOT, "drizzle/migrations");
const PRECHECK = process.argv.includes("--precheck");

const raw = process.env.DATABASE_MIGRATION_URL;
if (!raw) { console.log("Falta DATABASE_MIGRATION_URL en .env.local."); process.exit(1); }
const url = new URL(raw);
const redact = (text) => String(text).split(raw).join("<conexión>").split(url.password).join("<contraseña>");
const expectedRef = /project_id\s*=\s*"([a-z0-9]+)"/.exec(fs.readFileSync(path.join(ROOT, "supabase/config.toml"), "utf8"))?.[1];
const targetRef = url.username.split(".")[1];
if (!expectedRef || targetRef !== expectedRef) {
  console.log(`Proyecto de destino (${targetRef ?? "desconocido"}) distinto del de supabase/config.toml (${expectedRef ?? "sin definir"}). No se ejecuta nada.`);
  process.exit(1);
}

const sql = postgres(raw, { max: 1, connect_timeout: 20, onnotice: () => {}, prepare: false });
const ROLLBACK = Symbol("rollback");
let failures = 0;
// `detail` is only ever counts, booleans, error codes or object names.
const check = (label, ok, detail) => {
  console.log(`${ok ? "OK   " : "FALLA"} ${label}${ok || detail === undefined ? "" : `  -> ${redact(JSON.stringify(detail))}`}`);
  if (!ok) failures++;
};
const same = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());

const journal = JSON.parse(fs.readFileSync(path.join(MIGRATIONS, "meta/_journal.json"), "utf8")).entries.map((e) => ({
  tag: e.tag,
  when: String(e.when),
  hash: createHash("sha256").update(fs.readFileSync(path.join(MIGRATIONS, `${e.tag}.sql`), "utf8")).digest("hex"),
}));
const EXPECTED = {
  tables: ["integration_jobs", "lead_audit_log", "lead_submission_attempts", "leads", "user_roles"],
  functions: ["audit_lead_update", "claim_integration_jobs", "enqueue_lead_jobs", "inherit_commercial_opt_out", "is_lead_admin", "lead_metrics", "log_lead_list", "record_commercial_opt_out", "record_first_lead_contact", "register_lead_attempt"],
  policies: ["integration_jobs.admin_read.SELECT", "lead_audit_log.admin_read.SELECT", "leads.admin_read.SELECT", "leads.admin_update.UPDATE", "user_roles.own_role_read.SELECT"],
  triggers: ["audit_lead_update", "enqueue_lead_jobs", "inherit_commercial_opt_out", "preserve_first_contact"],
  indexes: ["integration_jobs_due_idx", "lead_audit_log_created_idx", "lead_submission_attempts_client_idx", "lead_submission_attempts_created_idx", "leads_created_idx", "leads_follow_up_idx", "leads_phone_idx", "leads_status_idx"],
  leadUpdateColumns: ["commercial_opt_out_at", "commercial_opt_out_source", "internal_notes", "last_contact_at", "next_follow_up_at", "status"],
};
const PRIVS = ["SELECT", "INSERT", "UPDATE", "DELETE", "TRUNCATE", "REFERENCES", "TRIGGER"];

async function history(tx) {
  const exists = (await tx`select to_regclass('drizzle.__drizzle_migrations') is not null ok`)[0].ok;
  return exists ? await tx`select hash, created_at::text from drizzle.__drizzle_migrations order by id` : [];
}

async function precheck() {
  console.log("== 0. Destino y migraciones pendientes (solo lectura)");
  return sql.begin("read only", async (tx) => {
    const [ctx] = await tx`select current_user, current_setting('transaction_read_only') ro, (select count(*)::int from auth.users) users`;
    console.log(`     proyecto: ${targetRef} (coincide con supabase/config.toml)  solo lectura: ${ctx.ro}`);
    console.log(`     conexión administrativa: ${ctx.current_user}. Sus permisos no cuentan: A2 consulta los de anon/authenticated/service_role y B actúa con esos roles.`);
    const applied = await history(tx);
    const last = applied.length ? BigInt(applied[applied.length - 1].created_at) : -1n;
    applied.forEach((h, i) => check(`aplicada ${journal[i]?.tag ?? "(no está en el índice)"} con la misma huella`, h.hash === journal[i]?.hash, { position: i }));
    // drizzle-kit applies every journal entry newer than the last recorded one.
    const pending = journal.filter((e) => BigInt(e.when) > last).map((e) => e.tag);
    console.log(`     aplicadas: ${applied.length}  pendientes: ${pending.length ? pending.join(", ") : "ninguna"}`);
    console.log(`     cuentas en auth.users (solo el número): ${ctx.users}`);
    return pending;
  });
}

const TABLES = ["public.leads", "public.user_roles", "public.lead_audit_log", "public.lead_submission_attempts", "public.integration_jobs"];
// Row count plus a fingerprint of every row's content, so any change to existing data is detected.
// Only equal/different is ever printed, never the fingerprint or the rows. auth.users is fingerprinted by id.
async function tableStates(tx) {
  const out = {};
  for (const t of TABLES) {
    const [r] = await tx.unsafe(`select count(*)::int n, coalesce(md5(string_agg(x::text, '|' order by x::text)), '') h from ${t} x`);
    out[t] = r;
  }
  const [u] = await tx`select count(*)::int n, coalesce(md5(string_agg(id::text, '|' order by id)), '') h from auth.users`;
  out["auth.users"] = u;
  return out;
}

async function structure() {
  console.log("\n== A. Estructura (solo lectura)");
  return sql.begin("read only", async (tx) => {
    const applied = await history(tx);
    check(`historial de Drizzle con ${journal.length} migraciones (todas las del índice)`, applied.length === journal.length, { applied: applied.length });
    journal.forEach((e, i) => check(`  ${e.tag.slice(0, 4)}: huella ${e.hash.slice(0, 8)}… y fecha coinciden con el archivo`, applied[i]?.hash === e.hash && applied[i]?.created_at === e.when));
    const tables = await tx`select tablename, rowsecurity from pg_tables where schemaname = 'public'`;
    check(`5 tablas: ${EXPECTED.tables.join(", ")}`, same(tables.map((t) => t.tablename), EXPECTED.tables), tables.map((t) => t.tablename));
    check("RLS activado en todas las tablas", tables.every((t) => t.rowsecurity));
    const fns = await tx`select p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public'`;
    check("10 funciones esperadas", same(fns.map((f) => f.proname), EXPECTED.functions), fns.map((f) => f.proname));
    const pols = await tx`select tablename || '.' || policyname || '.' || cmd p from pg_policies where schemaname = 'public'`;
    check("5 políticas RLS esperadas (sin política de borrado)", same(pols.map((p) => p.p), EXPECTED.policies), pols.map((p) => p.p));
    const trg = await tx`select tgname from pg_trigger where tgrelid = 'public.leads'::regclass and not tgisinternal`;
    check("4 triggers en leads", same(trg.map((t) => t.tgname), EXPECTED.triggers), trg.map((t) => t.tgname));
    const idx = await tx`select indexname from pg_indexes where schemaname = 'public' and indexname not like '%pkey' and indexname not like '%\\_key' escape '\\'`;
    check("8 índices esperados", same(idx.map((i) => i.indexname), EXPECTED.indexes), idx.map((i) => i.indexname));
    const [aal] = await tx`select pg_get_functiondef('public.is_lead_admin'::regproc) like '%aal2%' ok`;
    check("is_lead_admin exige segundo factor (aal2)", aal.ok);
    const anonFns = await tx`select p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and has_function_privilege('anon', p.oid, 'EXECUTE')`;
    check("anon no puede ejecutar ninguna función", anonFns.length === 0, anonFns.map((f) => f.proname));
    return tableStates(tx);
  });
}

async function effectivePrivileges() {
  console.log("\n== A2. Permisos efectivos según el catálogo (solo lectura, no se intenta ninguna operación)");
  await sql.begin("read only", async (tx) => {
    const has = async (role, table) => {
      const out = [];
      for (const p of PRIVS) if ((await tx`select has_table_privilege(${role}, ${`public.${table}`}, ${p}) ok`)[0].ok) out.push(p);
      return out.join(",") || "ninguno";
    };
    const leads = await has("authenticated", "leads");
    check("leads: authenticated solo SELECT a nivel de tabla (sin UPDATE amplio, INSERT, DELETE, TRUNCATE, REFERENCES ni TRIGGER)", leads === "SELECT", leads);
    const cols = (await tx`select attname from pg_attribute where attrelid = 'public.leads'::regclass and attnum > 0 and not attisdropped and has_column_privilege('authenticated', 'public.leads', attname, 'UPDATE') order by attname`).map((r) => r.attname);
    check("leads: UPDATE solo en las 6 columnas autorizadas", JSON.stringify(cols) === JSON.stringify(EXPECTED.leadUpdateColumns), cols);
    const [c] = await tx`select has_any_column_privilege('authenticated', 'public.leads', 'INSERT') li, has_any_column_privilege('authenticated', 'public.leads', 'REFERENCES') lr,
      has_any_column_privilege('authenticated', 'public.user_roles', 'UPDATE') ru, has_any_column_privilege('authenticated', 'public.user_roles', 'INSERT') ri`;
    check("sin INSERT/REFERENCES por columna en leads ni INSERT/UPDATE por columna en user_roles", !c.li && !c.lr && !c.ru && !c.ri, c);
    const roles = await has("authenticated", "user_roles");
    check("user_roles: authenticated solo SELECT", roles === "SELECT", roles);
    for (const t of EXPECTED.tables) { const p = await has("anon", t); check(`anon sin ningún permiso en ${t}`, p === "ninguno", p); }
    for (const t of EXPECTED.tables) { const p = await has("service_role", t); check(`service_role conserva todos los permisos en ${t}`, p === PRIVS.join(","), p); }
  });
}

async function behaviour() {
  console.log("\n== B. Comportamiento real: operaciones intentadas como cada rol (datos ficticios, transacción revertida al final)");
  // Fictitious identities and phones; nothing here matches a real person.
  const ADMIN = randomUUID(), OTHER = randomUUID();
  const PHONE = "999000000000001", PHONE_2 = "999000000000002";
  const RATE_KEY = `verify-db-${randomUUID()}`;
  // Preconditions (read only): the fictitious phones must be unused, and old rate-limit rows decide whether the
  // rate-limit test runs, because register_lead_attempt also purges attempts older than one day.
  const [pre] = await sql.begin("read only", (tx) => tx`select (select count(*)::int from public.leads where phone in (${PHONE}, ${PHONE_2})) phones,
    (select count(*)::int from public.lead_submission_attempts where created_at < now() - interval '1 day') old_attempts`);
  if (pre.phones > 0) { check("los teléfonos ficticios no existen en la base (si no, B no se ejecuta)", false, { coincidencias: pre.phones }); return; }
  try {
    await sql.begin(async (tx) => {
      // If the connection drops (e.g. the pooler resets it), the server ends and rolls back this transaction
      // instead of keeping it open with its locks; no single step may hang either.
      await tx`set local idle_in_transaction_session_timeout = '30s'`;
      await tx`set local statement_timeout = '30s'`;
      await tx`set local lock_timeout = '10s'`;
      // One statement as an API role inside a savepoint; a denied operation rolls back only that savepoint.
      // current_user is asserted so a verdict never comes from the administrative connection's privileges.
      const as = async (role, claims, query, params = []) => {
        try {
          return { rows: await tx.savepoint(async (sp) => {
            await sp`select set_config('request.jwt.claims', ${JSON.stringify(claims)}, true)`;
            await sp.unsafe(`set local role ${role}`);
            const [who] = await sp`select current_user::text u`;
            if (who.u !== role) throw Object.assign(new Error("role switch failed"), { code: "ROLE_MISMATCH" });
            const rows = await sp.unsafe(query, params);
            await sp`reset role`;
            return rows;
          }) };
        } catch (e) {
          if (e.code === "ROLE_MISMATCH") throw e;
          return { error: e.code ?? "error" };
        }
      };
      // TRUNCATE is table-wide, so it is only attempted once the catalog confirms the role lacks the privilege:
      // Postgres checks that privilege before touching the table, so the attempt cannot affect any row.
      const truncateDenied = async (role, claims, table) => {
        const [p] = await tx`select has_table_privilege(${role}, ${table}, 'TRUNCATE') ok`;
        if (p.ok) return { error: "privilegio TRUNCATE presente: no se intenta" };
        return as(role, claims, `truncate ${table}`);
      };
      const svc = (q, p) => as("service_role", {}, q, p);
      const admin = (aal, q, p) => as("authenticated", aal ? { sub: ADMIN, aal } : { sub: ADMIN }, q, p);
      const other = (q, p) => as("authenticated", { sub: OTHER, aal: "aal2" }, q, p);
      const denied = (r) => r.error === "42501";
      const ins = "insert into public.leads(name, phone, service_interest, consent_processing, privacy_version, consent_contact, consent_timestamp) values ($1, $2, 'Entrenamiento de fuerza', true, 'verificacion', true, now()) returning id";
      const baseline = (await svc("select count(*)::int n from public.leads")).rows[0].n;

      const a = await svc(ins, ["Prueba ficticia verify-db", PHONE]);
      check("service_role puede guardar un lead", a.rows?.length === 1, a.error);
      const lead = a.rows[0].id;
      let r = await svc("select kind from public.integration_jobs where lead_id = $1", [lead]);
      check("un lead nuevo crea las tareas crm_sync y team_notification", same((r.rows ?? []).map((x) => x.kind), ["crm_sync", "team_notification"]));
      for (const t of EXPECTED.tables) { r = await as("anon", {}, `select 1 from public.${t} limit 1`); check(`anon: leer ${t} denegado`, denied(r), r.error ?? "permitido"); }
      r = await as("anon", {}, ins, ["Intruso ficticio", PHONE_2]); check("anon: insertar leads denegado", denied(r), r.error ?? "permitido");
      r = await other(ins, ["Intruso ficticio", PHONE_2]); check("usuario sin rol: insertar leads denegado", denied(r), r.error ?? "permitido");
      r = await other("insert into public.user_roles(user_id, role) values ($1, 'admin')", [OTHER]); check("usuario sin rol: asignarse admin denegado", denied(r), r.error ?? "permitido");
      r = await other("select count(*)::int n from public.leads"); check("usuario sin rol: ve 0 leads", r.rows?.[0].n === 0, r.error ?? r.rows?.[0].n);
      r = await truncateDenied("authenticated", { sub: OTHER, aal: "aal2" }, "public.leads"); check("usuario sin rol: TRUNCATE leads denegado", denied(r), r.error ?? "permitido");
      r = await truncateDenied("authenticated", { sub: OTHER, aal: "aal2" }, "public.user_roles"); check("usuario sin rol: TRUNCATE user_roles denegado", denied(r), r.error ?? "permitido");

      // Setup through the administrative connection: a role row for the fictitious admin only.
      await tx`insert into public.user_roles(user_id, role) values (${ADMIN}, 'admin')`;
      r = await admin("aal1", "select public.is_lead_admin() ok, (select count(*)::int from public.leads) n");
      check("administrador SIN segundo factor: acceso denegado", r.rows?.[0].ok === false && r.rows[0].n === 0, r.error ?? r.rows?.[0]);
      r = await admin(null, "select count(*)::int n from public.leads");
      check("token sin nivel de seguridad (tipo Lovable): ve 0 leads", r.rows?.[0].n === 0, r.error ?? r.rows?.[0].n);
      r = await admin("aal2", "select public.is_lead_admin() ok, (select count(*)::int from public.leads) n");
      check("administrador CON segundo factor: ve todos los leads", r.rows?.[0].ok === true && r.rows[0].n === baseline + 1, r.error ?? r.rows?.[0]);
      r = await admin("aal2", "select role from public.user_roles where user_id = $1", [ADMIN]);
      check("administrador: puede leer su propio rol", r.rows?.[0]?.role === "admin", r.error);
      r = await admin("aal2", "select (public.lead_metrics()->>'total')::int total");
      check("lead_metrics funciona", r.rows?.[0].total === baseline + 1, r.error ?? r.rows?.[0].total);
      r = await admin("aal2", "update public.leads set status = 'contacted', internal_notes = 'nota ficticia', last_contact_at = now(), next_follow_up_at = now() where id = $1 returning (first_contact_at is not null) first", [lead]);
      check("administrador: actualiza el seguimiento y recibe la fila (como el panel)", r.rows?.[0]?.first === true, r.error);
      r = await svc("select actor_id::text = $1 actor, changed_fields from public.lead_audit_log where action = 'update' and lead_id = $2", [ADMIN, lead]);
      check("el cambio queda auditado (quién y qué campos, sin valores)", r.rows?.[0]?.actor === true && same(r.rows[0].changed_fields, ["first_contact_at", "internal_notes", "last_contact_at", "next_follow_up_at", "status"]), r.error);
      r = await admin("aal2", "update public.leads set consent_contact = false, consent_timestamp = null where id = $1", [lead]); check("administrador: alterar el consentimiento denegado", denied(r), r.error ?? "permitido");
      r = await admin("aal2", "update public.leads set phone = $2 where id = $1", [lead, PHONE_2]); check("administrador: editar el teléfono denegado", denied(r), r.error ?? "permitido");
      r = await admin("aal2", "delete from public.leads where id = $1", [lead]); check("administrador: borrar leads denegado", denied(r), r.error ?? "permitido");
      r = await truncateDenied("authenticated", { sub: ADMIN, aal: "aal2" }, "public.leads"); check("administrador: TRUNCATE leads denegado", denied(r), r.error ?? "permitido");
      r = await admin("aal2", "delete from public.user_roles where user_id = $1", [ADMIN]); check("administrador: borrar roles denegado", denied(r), r.error ?? "permitido");
      r = await admin("aal2", "select public.log_lead_list()"); check("log_lead_list funciona para el administrador", !r.error, r.error);
      r = await other("select public.log_lead_list()"); check("usuario sin rol: escribir en la auditoría denegado", Boolean(r.error), r.error ?? "permitido");

      await svc(ins, ["Prueba ficticia verify-db bis", PHONE]);
      r = await admin("aal2", "select public.record_commercial_opt_out($1, 'admin') n", [lead]);
      check("la baja comercial cubre todas las consultas del mismo teléfono", r.rows?.[0].n === 2, r.error ?? r.rows?.[0].n);
      const later = await svc(ins, ["Prueba ficticia verify-db nueva", PHONE]);
      r = await svc("select commercial_opt_out_at is not null as out from public.leads where id = $1", [later.rows?.[0].id]);
      check("las consultas posteriores heredan la baja", r.rows?.[0].out === true, r.error);
      if (pre.old_attempts > 0) {
        console.log(`     OMITIDA límite de envíos: hay ${pre.old_attempts} intentos de más de un día que la función limpiaría`);
      } else {
        const limits = [];
        for (let i = 0; i < 6; i++) limits.push((await svc("select public.register_lead_attempt($1) ok", [RATE_KEY])).rows?.[0].ok);
        check("límite de envíos: 5 por hora y el 6º se bloquea", limits.join(",") === "true,true,true,true,true,false", limits);
      }
      r = await admin("aal2", "select public.register_lead_attempt('verify-db')"); check("administrador: usar el límite de envíos denegado", denied(r), r.error ?? "permitido");
      r = await svc("select count(*)::int n from public.claim_integration_jobs(25, $1)", [lead]); check("el procesador toma las tareas del lead ficticio", r.rows?.[0].n === 2, r.error ?? r.rows?.[0].n);
      r = await svc("select count(*)::int n from public.claim_integration_jobs(25, $1)", [lead]); check("una tarea tomada no se procesa dos veces", r.rows?.[0].n === 0, r.error ?? r.rows?.[0].n);
      r = await admin("aal2", "select count(*) from public.claim_integration_jobs(25, $1)", [lead]); check("administrador: ejecutar el procesador denegado", denied(r), r.error ?? "permitido");
      r = await admin("aal2", "update public.integration_jobs set status = 'done' where lead_id = $1", [lead]); check("administrador: alterar la cola denegado", denied(r), r.error ?? "permitido");
      throw ROLLBACK;
    });
  } catch (e) {
    if (e !== ROLLBACK) throw e;
    console.log("     (transacción revertida: no se guardó nada)");
  }
}

async function leftovers(before) {
  console.log("\n== C. Sin restos: filas y contenido iguales que antes (solo lectura)");
  await sql.begin("read only", async (tx) => {
    const after = await tableStates(tx);
    for (const k of Object.keys(before)) {
      check(`${k}: mismas ${before[k].n} filas y mismo contenido`, after[k].n === before[k].n && after[k].h === before[k].h, { filas_antes: before[k].n, filas_despues: after[k].n, contenido_igual: after[k].h === before[k].h });
    }
  });
}

(async () => {
  const pending = await precheck();
  if (!PRECHECK) {
    // Never verify a half-migrated database: stop if anything is pending or a recorded migration differs.
    if (pending.length > 0 || failures > 0) {
      console.log(`\nDETENIDO: ${pending.length ? `migraciones pendientes (${pending.join(", ")})` : "el historial no coincide con los archivos"}. No se ejecutan A, A2, B ni C.`);
      await sql.end();
      process.exit(1);
    }
    const before = await structure();
    await effectivePrivileges();
    // Behaviour tests only run on a database whose structure and privileges are already as expected.
    if (failures > 0) console.log("\nDETENIDO: A o A2 tienen fallos; B no se ejecuta.");
    else await behaviour();
    await leftovers(before);
  }
  console.log(`\n${failures ? `${failures} COMPROBACIONES FALLARON` : "TODAS LAS COMPROBACIONES CORRECTAS"}`);
  await sql.end();
  process.exit(failures ? 1 : 0);
})().catch(async (e) => {
  console.log(`ERROR ${e.code ?? ""}: ${redact(e.message)}`);
  await sql.end({ timeout: 1 }).catch(() => {});
  process.exit(1);
});
