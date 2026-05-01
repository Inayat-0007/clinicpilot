-- Create a SECURITY DEFINER function to securely set up a new clinic workspace
-- This bypasses RLS to allow a newly registered user to create their clinic and staff record atomically.

CREATE OR REPLACE FUNCTION public.setup_clinic_workspace(
  p_clinic_name TEXT,
  p_slug TEXT,
  p_user_id UUID
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clinic_id UUID;
BEGIN
  -- Validate inputs
  IF p_clinic_name IS NULL OR p_slug IS NULL OR p_user_id IS NULL THEN
    RAISE EXCEPTION 'All parameters are required';
  END IF;

  -- Insert the clinic and get the ID
  INSERT INTO public.clinics (name, slug)
  VALUES (p_clinic_name, p_slug)
  RETURNING id INTO v_clinic_id;

  -- Insert the staff record for the owner
  INSERT INTO public.staff (clinic_id, user_id, name, role)
  VALUES (v_clinic_id, p_user_id, 'Dr. Owner', 'owner');

  RETURN v_clinic_id;
END;
$$;

-- Grant execution to authenticated and anon users (in case JWT is delayed)
GRANT EXECUTE ON FUNCTION public.setup_clinic_workspace(TEXT, TEXT, UUID) TO authenticated, anon;
