import { defineConfig } from "drizzle-kit";

// DATABASE_MIGRATION_URL lives only in .env.local (ignored by Git, never in Vercel).
// `npm run db:migrate` loads it; use the Supabase Session pooler URI with ?sslmode=require.
const url = process.env.DATABASE_MIGRATION_URL;
if (!url) throw new Error("Falta DATABASE_MIGRATION_URL en .env.local. Consulta LEADS_SETUP.md.");

export default defineConfig({
  dialect: "postgresql",
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dbCredentials: { url },
});
