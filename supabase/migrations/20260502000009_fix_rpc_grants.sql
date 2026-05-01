-- Re-grant to authenticated so frontend components can use them
GRANT EXECUTE ON FUNCTION public.get_my_clinic_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;
