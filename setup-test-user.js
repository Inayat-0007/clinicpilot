import { createClient } from '@supabase/supabase-js';

// Use the Service Role Key to bypass rate limits and auto-confirm email
const supabaseAdmin = createClient(
  'https://qsngudfzugvswsxftqrp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzbmd1ZGZ6dWd2c3dzeGZ0cXJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYxODEyMywiZXhwIjoyMDkzMTk0MTIzfQ.r1PbvFbTUW4aR_UojPz6A4ODmNfjSySlItlSDgXhgEA'
);

async function setupTestUser() {
  const email = 'doctor@testclinic.com';
  const password = 'SecurePassword123!';
  const clinicName = 'Test Clinic';

  console.log("1. Creating user via Admin API...");
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true // Auto-confirm to bypass email requirement
  });

  if (authError) {
    console.error("Auth Error:", authError);
    return;
  }
  console.log("User created:", authData.user.id);

  console.log("2. Creating Clinic...");
  const { data: clinicData, error: clinicError } = await supabaseAdmin.from('clinics').insert([
    { name: clinicName, slug: 'test-clinic-123' }
  ]).select().single();

  if (clinicError) {
    console.error("Clinic Error:", clinicError);
    return;
  }
  console.log("Clinic created:", clinicData.id);

  console.log("3. Creating Staff (Owner)...");
  const { error: staffError } = await supabaseAdmin.from('staff').insert([
    { 
      clinic_id: clinicData.id, 
      user_id: authData.user.id,
      name: "Dr. Test",
      role: "owner"
    }
  ]);

  if (staffError) {
    console.error("Staff Error:", staffError);
    return;
  }
  
  console.log("Success! You can now log in with:");
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

setupTestUser();
