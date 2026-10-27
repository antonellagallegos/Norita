-- Admin access on Vercel uses Supabase Auth: an explicit admin grant AND a session verified with MFA (aal2).
CREATE OR REPLACE FUNCTION public.is_lead_admin() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT coalesce(auth.jwt()->>'aal', '') = 'aal2' AND EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') $$;

-- Admins cannot delete leads or rewrite consent evidence; erasure requests are handled server-side with the service role.
DROP POLICY admin_delete ON public.leads;
REVOKE DELETE ON public.leads FROM authenticated;
REVOKE UPDATE ON public.leads FROM authenticated;
ALTER TABLE public.leads ADD COLUMN commercial_opt_out_at timestamptz, ADD COLUMN commercial_opt_out_source text CHECK (commercial_opt_out_source IN ('admin','hubspot','email_link','whatsapp')), ADD CONSTRAINT commercial_opt_out_pair CHECK ((commercial_opt_out_at IS NULL) = (commercial_opt_out_source IS NULL));
GRANT UPDATE (status, internal_notes, last_contact_at, next_follow_up_at, commercial_opt_out_at, commercial_opt_out_source) ON public.leads TO authenticated;

-- An opt-out applies to every inquiry with the same phone, including future ones.
CREATE FUNCTION public.record_commercial_opt_out(p_lead_id uuid, p_source text) RETURNS integer LANGUAGE sql VOLATILE SECURITY INVOKER SET search_path = public AS $$ WITH target AS (SELECT phone FROM public.leads WHERE id = p_lead_id), changed AS (UPDATE public.leads l SET commercial_opt_out_at = now(), commercial_opt_out_source = p_source FROM target WHERE l.phone = target.phone AND l.commercial_opt_out_at IS NULL RETURNING 1) SELECT count(*)::integer FROM changed $$;
REVOKE ALL ON FUNCTION public.record_commercial_opt_out(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_commercial_opt_out(uuid, text) TO authenticated, service_role;
CREATE FUNCTION public.inherit_commercial_opt_out() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ DECLARE previous public.leads%ROWTYPE; BEGIN SELECT * INTO previous FROM public.leads WHERE phone = NEW.phone AND commercial_opt_out_at IS NOT NULL ORDER BY commercial_opt_out_at LIMIT 1; IF FOUND THEN NEW.commercial_opt_out_at := previous.commercial_opt_out_at; NEW.commercial_opt_out_source := previous.commercial_opt_out_source; END IF; RETURN NEW; END $$;
REVOKE EXECUTE ON FUNCTION public.inherit_commercial_opt_out() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER inherit_commercial_opt_out BEFORE INSERT ON public.leads FOR EACH ROW EXECUTE FUNCTION public.inherit_commercial_opt_out();

-- Audit trail: who listed or changed leads. Stores field names only, never values.
CREATE TABLE public.lead_audit_log (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, created_at timestamptz NOT NULL DEFAULT now(), actor_id uuid, action text NOT NULL CHECK (action IN ('list','update')), lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL, changed_fields text[] NOT NULL DEFAULT '{}');
ALTER TABLE public.lead_audit_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.lead_audit_log FROM anon, authenticated;
GRANT SELECT ON public.lead_audit_log TO authenticated;
GRANT ALL ON public.lead_audit_log TO service_role;
CREATE POLICY admin_read ON public.lead_audit_log FOR SELECT TO authenticated USING (public.is_lead_admin());
CREATE INDEX lead_audit_log_created_idx ON public.lead_audit_log(created_at DESC);
CREATE FUNCTION public.audit_lead_update() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ DECLARE fields text[]; BEGIN SELECT coalesce(array_agg(n.key ORDER BY n.key), '{}') INTO fields FROM jsonb_each(to_jsonb(NEW)) n WHERE n.value IS DISTINCT FROM to_jsonb(OLD)->n.key; IF array_length(fields, 1) > 0 THEN INSERT INTO public.lead_audit_log(actor_id, action, lead_id, changed_fields) VALUES (auth.uid(), 'update', NEW.id, fields); END IF; RETURN NEW; END $$;
REVOKE EXECUTE ON FUNCTION public.audit_lead_update() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER audit_lead_update AFTER UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.audit_lead_update();
CREATE FUNCTION public.log_lead_list() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN IF NOT public.is_lead_admin() THEN RAISE EXCEPTION 'not authorized'; END IF; INSERT INTO public.lead_audit_log(actor_id, action) VALUES (auth.uid(), 'list'); END $$;
REVOKE ALL ON FUNCTION public.log_lead_list() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.log_lead_list() TO authenticated;

-- Rate limit for the public form: keyed by an HMAC of the client IP, never the raw IP. Service role only.
CREATE TABLE public.lead_submission_attempts (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, client_hash text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE public.lead_submission_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.lead_submission_attempts FROM anon, authenticated;
GRANT ALL ON public.lead_submission_attempts TO service_role;
CREATE INDEX lead_submission_attempts_client_idx ON public.lead_submission_attempts(client_hash, created_at);
CREATE INDEX lead_submission_attempts_created_idx ON public.lead_submission_attempts(created_at);
CREATE FUNCTION public.register_lead_attempt(p_client_hash text, p_max integer DEFAULT 5) RETURNS boolean LANGUAGE plpgsql VOLATILE SECURITY INVOKER SET search_path = public AS $$ DECLARE recent integer; BEGIN DELETE FROM public.lead_submission_attempts WHERE created_at < now() - interval '1 day'; SELECT count(*) INTO recent FROM public.lead_submission_attempts WHERE client_hash = p_client_hash AND created_at > now() - interval '1 hour'; IF recent >= p_max THEN RETURN false; END IF; INSERT INTO public.lead_submission_attempts(client_hash) VALUES (p_client_hash); RETURN true; END $$;
REVOKE ALL ON FUNCTION public.register_lead_attempt(text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.register_lead_attempt(text, integer) TO service_role;

-- Outbox: every new lead queues CRM and team-notification jobs; a failing integration never loses the lead.
CREATE TABLE public.integration_jobs (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), created_at timestamptz NOT NULL DEFAULT now(), lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE, kind text NOT NULL CHECK (kind IN ('crm_sync','team_notification')), status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','done','dry_run','failed')), attempts integer NOT NULL DEFAULT 0, next_attempt_at timestamptz NOT NULL DEFAULT now(), last_error text CHECK (char_length(last_error) <= 200), processed_at timestamptz);
ALTER TABLE public.integration_jobs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.integration_jobs FROM anon, authenticated;
GRANT SELECT ON public.integration_jobs TO authenticated;
GRANT ALL ON public.integration_jobs TO service_role;
CREATE POLICY admin_read ON public.integration_jobs FOR SELECT TO authenticated USING (public.is_lead_admin());
CREATE INDEX integration_jobs_due_idx ON public.integration_jobs(next_attempt_at) WHERE status IN ('pending','processing','failed');
CREATE FUNCTION public.enqueue_lead_jobs() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN INSERT INTO public.integration_jobs(lead_id, kind) VALUES (NEW.id, 'crm_sync'), (NEW.id, 'team_notification'); RETURN NEW; END $$;
REVOKE EXECUTE ON FUNCTION public.enqueue_lead_jobs() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER enqueue_lead_jobs AFTER INSERT ON public.leads FOR EACH ROW EXECUTE FUNCTION public.enqueue_lead_jobs();
-- Claimed jobs get a 10-minute lease, so a crashed worker's jobs are retried automatically.
CREATE FUNCTION public.claim_integration_jobs(p_limit integer DEFAULT 25, p_lead_id uuid DEFAULT NULL) RETURNS SETOF public.integration_jobs LANGUAGE sql VOLATILE SECURITY INVOKER SET search_path = public AS $$ UPDATE public.integration_jobs j SET status = 'processing', attempts = j.attempts + 1, next_attempt_at = now() + interval '10 minutes' WHERE j.id IN (SELECT id FROM public.integration_jobs WHERE status IN ('pending','processing','failed') AND next_attempt_at <= now() AND attempts < 8 AND (p_lead_id IS NULL OR lead_id = p_lead_id) ORDER BY created_at LIMIT p_limit FOR UPDATE SKIP LOCKED) RETURNING j.* $$;
REVOKE ALL ON FUNCTION public.claim_integration_jobs(integer, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_integration_jobs(integer, uuid) TO service_role;
