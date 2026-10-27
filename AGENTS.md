<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep presentation colors and typography in the global semantic CSS tokens, and use the shared Button component for calls to action so Norita's visual system remains consistent.
- Keep the app presentation in a dedicated section component with an explicitly illustrative preview, separate from operational medical-data features, so marketing changes do not imply a working health-record system on this website.
- Lead capture uses a public, schema-validated server function gated by approved privacy configuration and Turnstile; anonymous clients have no table privileges, and service-role access is limited to verified form insertion.
- The site is hosted on Vercel, where Lovable identity headers do not exist. Lead administration uses Supabase Auth with a TOTP second factor (aal2) and a request-scoped publishable database client carrying the user JWT; an explicit user_roles grant plus aal2 is required for both server access and RLS, never auto-assign admins or enable public sign-up.
- The database is the Norita-owned Supabase project in `supabase/config.toml`, not Lovable Cloud. Apply schema changes only as new files in `drizzle/migrations` via `npm run db:migrate` (DATABASE_MIGRATION_URL in the Git-ignored `.env.local`); never edit applied migrations. Supabase grants ALL on new public tables to anon/authenticated by default and RLS does not cover TRUNCATE, REFERENCES or TRIGGER: every migration that creates a table must REVOKE ALL from anon and authenticated, then GRANT only what the app needs.
- Integrations go through the integration_jobs outbox and stay in dry-run unless INTEGRATIONS_MODE=live; only CRM_FIELDS leave Supabase, never free-text comments, notes or health information, and marketing requires commercial consent without opt-out.
- Contact configuration stays centralized; preserve individual inquiries, link possible phone duplicates, use submission IDs for retry idempotency, and use server aggregates and pagination instead of loading all leads.
