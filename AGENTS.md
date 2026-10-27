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
- Lead administration uses verified Lovable workspace identity and a request-scoped publishable database client carrying the identity JWT; an explicit user_roles grant is required for both server access and RLS, never auto-assign admins.
- Contact configuration stays centralized; preserve individual inquiries, link possible phone duplicates, use submission IDs for retry idempotency, and use server aggregates and pagination instead of loading all leads.
