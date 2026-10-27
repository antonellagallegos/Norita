-- Supabase grants ALL on new public tables to the API roles by default, and RLS does not govern
-- TRUNCATE, REFERENCES or TRIGGER. Reset `authenticated` on the two tables created before 0003 to
-- exactly what the app needs. REVOKE ALL also drops any column-level grants, so the column UPDATE
-- grant below is the only UPDATE privilege left. RLS, policies and service_role are untouched.
REVOKE ALL ON public.leads FROM authenticated;
GRANT SELECT ON public.leads TO authenticated;
GRANT UPDATE (status, internal_notes, last_contact_at, next_follow_up_at, commercial_opt_out_at, commercial_opt_out_source) ON public.leads TO authenticated;
REVOKE ALL ON public.user_roles FROM authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
