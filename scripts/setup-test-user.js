import { createClient } from '@supabase/supabase-js';

// SECURITY: Use environment variables — never hardcode keys
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('ERROR: Missing environment variables.');
  console.error('  Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.error('  Example: SUPABASE_SERVICE_ROLE_KEY=... node scripts/setup-test-user.js');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

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
