-- The public form now asks where the older adult lives (Peru or Colombia only). Nullable because leads from
-- other sources (WhatsApp, Calendly) may not have it. A column, not a table: existing grants apply
-- (authenticated keeps SELECT on leads, no UPDATE on this column; service_role keeps ALL).
ALTER TABLE public.leads ADD COLUMN country text CHECK (country IN ('PE','CO'));
-- Defense in depth for the email the form now requires; the server validates it first.
ALTER TABLE public.leads ADD CONSTRAINT leads_email_format CHECK (email IS NULL OR (char_length(email) <= 254 AND email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'));
