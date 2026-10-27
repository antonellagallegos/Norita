REVOKE EXECUTE ON FUNCTION public.is_lead_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.lead_metrics() FROM anon;
REVOKE EXECUTE ON FUNCTION public.record_first_lead_contact() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.leads FROM anon;
REVOKE ALL ON public.user_roles FROM anon;