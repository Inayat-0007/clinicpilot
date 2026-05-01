-- Issue 3: Complete Row Level Security Policies
-- ═══════════════════════════════════════════════════════════════

-- 1. SECURITY DEFINER FUNCTION: Get current user's clinic
CREATE OR REPLACE FUNCTION public.get_my_clinic_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT clinic_id 
  FROM public.staff 
  WHERE user_id = auth.uid() 
    AND is_active = true
  LIMIT 1;
$$;

-- 2. SECURITY DEFINER FUNCTION: Get current user's role
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role 
  FROM public.staff 
  WHERE user_id = auth.uid() 
    AND is_active = true
  LIMIT 1;
$$;

-- 2b. Hardening: Revoke direct execute from anonymous callers.
-- RLS policies can still invoke these via SECURITY DEFINER.
REVOKE EXECUTE ON FUNCTION public.get_my_clinic_id() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_my_role() FROM anon;

-- Re-grant to authenticated so frontend components can use them
GRANT EXECUTE ON FUNCTION public.get_my_clinic_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;

-- 3. CLINICS TABLE
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "clinics_select_own" ON public.clinics;
CREATE POLICY "clinics_select_own" ON public.clinics
  FOR SELECT USING (id = public.get_my_clinic_id());
DROP POLICY IF EXISTS "clinics_update_owner_only" ON public.clinics;
CREATE POLICY "clinics_update_owner_only" ON public.clinics
  FOR UPDATE
  USING (id = public.get_my_clinic_id() AND public.get_my_role() = 'owner')
  WITH CHECK (id = public.get_my_clinic_id());

-- 4. STAFF TABLE
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "staff_select_same_clinic" ON public.staff;
CREATE POLICY "staff_select_same_clinic" ON public.staff
  FOR SELECT USING (clinic_id = public.get_my_clinic_id());
DROP POLICY IF EXISTS "staff_insert_owner_only" ON public.staff;
CREATE POLICY "staff_insert_owner_only" ON public.staff
  FOR INSERT
  WITH CHECK (clinic_id = public.get_my_clinic_id() AND public.get_my_role() = 'owner');
DROP POLICY IF EXISTS "staff_update" ON public.staff;
CREATE POLICY "staff_update" ON public.staff
  FOR UPDATE
  USING (clinic_id = public.get_my_clinic_id() AND (public.get_my_role() = 'owner' OR user_id = auth.uid()));
DROP POLICY IF EXISTS "staff_delete_owner_only" ON public.staff;
CREATE POLICY "staff_delete_owner_only" ON public.staff
  FOR DELETE
  USING (clinic_id = public.get_my_clinic_id() AND public.get_my_role() = 'owner' AND user_id != auth.uid());

-- 5. DOCTORS TABLE
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "doctors_select" ON public.doctors;
CREATE POLICY "doctors_select" ON public.doctors
  FOR SELECT USING (clinic_id = public.get_my_clinic_id());
DROP POLICY IF EXISTS "doctors_insert" ON public.doctors;
CREATE POLICY "doctors_insert" ON public.doctors
  FOR INSERT WITH CHECK (clinic_id = public.get_my_clinic_id() AND public.get_my_role() IN ('owner', 'receptionist'));
DROP POLICY IF EXISTS "doctors_update" ON public.doctors;
CREATE POLICY "doctors_update" ON public.doctors
  FOR UPDATE USING (clinic_id = public.get_my_clinic_id()) WITH CHECK (clinic_id = public.get_my_clinic_id());
DROP POLICY IF EXISTS "doctors_delete_owner_only" ON public.doctors;
CREATE POLICY "doctors_delete_owner_only" ON public.doctors
  FOR DELETE USING (clinic_id = public.get_my_clinic_id() AND public.get_my_role() = 'owner');

-- 6. WORKING HOURS TABLE
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "working_hours_select" ON public.working_hours;
CREATE POLICY "working_hours_select" ON public.working_hours
  FOR SELECT USING (doctor_id IN (SELECT id FROM public.doctors WHERE clinic_id = public.get_my_clinic_id()));
DROP POLICY IF EXISTS "working_hours_insert" ON public.working_hours;
CREATE POLICY "working_hours_insert" ON public.working_hours
  FOR INSERT WITH CHECK (doctor_id IN (SELECT id FROM public.doctors WHERE clinic_id = public.get_my_clinic_id()));
DROP POLICY IF EXISTS "working_hours_update" ON public.working_hours;
CREATE POLICY "working_hours_update" ON public.working_hours
  FOR UPDATE USING (doctor_id IN (SELECT id FROM public.doctors WHERE clinic_id = public.get_my_clinic_id()));
DROP POLICY IF EXISTS "working_hours_delete" ON public.working_hours;
CREATE POLICY "working_hours_delete" ON public.working_hours
  FOR DELETE USING (doctor_id IN (SELECT id FROM public.doctors WHERE clinic_id = public.get_my_clinic_id()) AND public.get_my_role() IN ('owner', 'receptionist'));

-- 7. PATIENTS TABLE
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "patients_select" ON public.patients;
CREATE POLICY "patients_select" ON public.patients
  FOR SELECT USING (clinic_id = public.get_my_clinic_id());
DROP POLICY IF EXISTS "patients_insert" ON public.patients;
CREATE POLICY "patients_insert" ON public.patients
  FOR INSERT WITH CHECK (clinic_id = public.get_my_clinic_id() AND public.get_my_role() IN ('owner', 'receptionist', 'doctor'));
DROP POLICY IF EXISTS "patients_update" ON public.patients;
CREATE POLICY "patients_update" ON public.patients
  FOR UPDATE USING (clinic_id = public.get_my_clinic_id());

-- 8. APPOINTMENTS TABLE
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "appt_select" ON public.appointments;
CREATE POLICY "appt_select" ON public.appointments
  FOR SELECT USING (clinic_id = public.get_my_clinic_id());
DROP POLICY IF EXISTS "appt_insert" ON public.appointments;
CREATE POLICY "appt_insert" ON public.appointments
  FOR INSERT WITH CHECK (clinic_id = public.get_my_clinic_id());
DROP POLICY IF EXISTS "appt_update" ON public.appointments;
CREATE POLICY "appt_update" ON public.appointments
  FOR UPDATE USING (
    clinic_id = public.get_my_clinic_id() AND (
      public.get_my_role() IN ('owner', 'receptionist') OR
      doctor_id IN (SELECT d.id FROM public.doctors d JOIN public.staff s ON s.id = d.staff_id WHERE s.user_id = auth.uid())
    )
  );
DROP POLICY IF EXISTS "appt_delete_owner_only" ON public.appointments;
CREATE POLICY "appt_delete_owner_only" ON public.appointments
  FOR DELETE USING (clinic_id = public.get_my_clinic_id() AND public.get_my_role() = 'owner');

-- 9. REMINDERS TABLE
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reminders_select" ON public.reminders;
CREATE POLICY "reminders_select" ON public.reminders
  FOR SELECT USING (appointment_id IN (SELECT id FROM public.appointments WHERE clinic_id = public.get_my_clinic_id()));
DROP POLICY IF EXISTS "reminders_insert" ON public.reminders;
CREATE POLICY "reminders_insert" ON public.reminders
  FOR INSERT WITH CHECK (appointment_id IN (SELECT id FROM public.appointments WHERE clinic_id = public.get_my_clinic_id()));

-- 10. MESSAGE TEMPLATES TABLE
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "templates_select" ON public.message_templates;
CREATE POLICY "templates_select" ON public.message_templates
  FOR SELECT USING (clinic_id = public.get_my_clinic_id());
DROP POLICY IF EXISTS "templates_insert" ON public.message_templates;
CREATE POLICY "templates_insert" ON public.message_templates
  FOR INSERT WITH CHECK (clinic_id = public.get_my_clinic_id() AND public.get_my_role() IN ('owner', 'receptionist'));
DROP POLICY IF EXISTS "templates_update" ON public.message_templates;
CREATE POLICY "templates_update" ON public.message_templates
  FOR UPDATE USING (clinic_id = public.get_my_clinic_id() AND public.get_my_role() IN ('owner', 'receptionist'));
