CREATE TABLE public.user_roles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, role text NOT NULL CHECK (role = 'admin'), UNIQUE(user_id, role));
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_role_read ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE FUNCTION public.is_lead_admin() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') $$;
REVOKE ALL ON FUNCTION public.is_lead_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_lead_admin() TO authenticated;
CREATE TABLE public.leads (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), created_at timestamptz NOT NULL DEFAULT now(), name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100), phone text NOT NULL CHECK (phone ~ '^[0-9]{7,15}$'), email text, service_interest text NOT NULL CHECK (service_interest IN ('Acompañamiento a citas médicas','Neuroestimulación / Gimnasio Mental','Entrenamiento de fuerza','Quiero conocer varios servicios')), district text CHECK(char_length(district) <= 100), frequency text, preferred_contact text NOT NULL DEFAULT 'WhatsApp' CHECK(preferred_contact IN ('WhatsApp','Llamada telefónica')), message text CHECK(char_length(message) <= 1000), source text NOT NULL DEFAULT 'website' CHECK(source IN ('website','WhatsApp','Calendly')), status text NOT NULL DEFAULT 'new' CHECK(status IN ('new','contacted','conversation_started','call_scheduled','proposal_sent','converted','not_converted')), consent_contact boolean NOT NULL DEFAULT false, consent_timestamp timestamptz, consent_processing boolean NOT NULL, processing_timestamp timestamptz NOT NULL DEFAULT now(), privacy_version text NOT NULL, last_contact_at timestamptz, next_follow_up_at timestamptz, internal_notes text NOT NULL DEFAULT '' CHECK(char_length(internal_notes) <= 5000), duplicate_of uuid REFERENCES public.leads(id), submission_id uuid UNIQUE, external_booking_id text UNIQUE, notification_status text NOT NULL DEFAULT 'not_configured', CONSTRAINT commercial_consent_timestamp CHECK ((consent_contact AND consent_timestamp IS NOT NULL) OR (NOT consent_contact AND consent_timestamp IS NULL))
);
GRANT SELECT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY admin_read ON public.leads FOR SELECT TO authenticated USING(public.is_lead_admin());
CREATE POLICY admin_update ON public.leads FOR UPDATE TO authenticated USING(public.is_lead_admin()) WITH CHECK(public.is_lead_admin());
CREATE POLICY admin_delete ON public.leads FOR DELETE TO authenticated USING(public.is_lead_admin());
CREATE INDEX leads_created_idx ON public.leads(created_at DESC);
CREATE INDEX leads_phone_idx ON public.leads(phone);
CREATE INDEX leads_status_idx ON public.leads(status);
CREATE INDEX leads_follow_up_idx ON public.leads(next_follow_up_at);
CREATE FUNCTION public.lead_metrics() RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$ SELECT jsonb_build_object('total',count(*),'new',count(*) FILTER(WHERE status='new'),'call_scheduled',count(*) FILTER(WHERE status='call_scheduled'),'proposal_sent',count(*) FILTER(WHERE status='proposal_sent'),'converted',count(*) FILTER(WHERE status='converted'),'average_first_contact_hours',avg(extract(epoch FROM (last_contact_at-created_at))/3600) FILTER(WHERE last_contact_at IS NOT NULL),'by_source',(SELECT coalesce(jsonb_object_agg(source,n),'{}'::jsonb) FROM (SELECT source,count(*) n FROM public.leads GROUP BY source) s),'by_service',(SELECT coalesce(jsonb_object_agg(service_interest,n),'{}'::jsonb) FROM (SELECT service_interest,count(*) n FROM public.leads GROUP BY service_interest) s)) FROM public.leads $$;
REVOKE ALL ON FUNCTION public.lead_metrics() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lead_metrics() TO authenticated;