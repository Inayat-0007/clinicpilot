-- FIX #2: Re-grant get_my_clinic_id() to authenticated users
-- The function was revoked in 20260502000001_rls_policies.sql which broke
-- AddBookingModal and AddPatientModal which call supabase.rpc('get_my_clinic_id')
-- from the browser. RLS policies using SECURITY DEFINER still work, but direct
-- RPC calls from authenticated users need explicit GRANT.

GRANT EXECUTE ON FUNCTION public.get_my_clinic_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;
