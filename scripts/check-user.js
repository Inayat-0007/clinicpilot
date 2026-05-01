require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) throw new Error("Missing env: " + supabaseUrl);

const supabase = createClient(supabaseUrl.trim(), supabaseKey.trim());

async function check() {
  const { data: user, error: userError } = await supabase.auth.admin.listUsers();
  if (userError) return console.error(userError);

  const target = user.users.find(u => u.email === 'mohammadinayathussain552000@gmail.com');
  if (!target) return console.log('User not found in auth.users');

  console.log('User found in auth.users:', target.id);

  const { data: staff, error: staffError } = await supabase.from('staff').select('*').eq('user_id', target.id);
  console.log('Staff records:', staff);
  
  if (staffError) console.error('Staff error:', staffError);

  if (staff && staff.length === 0) {
    console.log("Attempting to call setup_clinic_workspace...");
    const { data, error } = await supabase.rpc('setup_clinic_workspace', {
      p_clinic_name: "Test Clinic",
      p_slug: "test-clinic-" + Date.now(),
      p_user_id: target.id
    });
    console.log("RPC Result:", data, error);
  }
}

check();
