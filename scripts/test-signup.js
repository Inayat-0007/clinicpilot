import { createClient } from '@supabase/supabase-js';

// SECURITY: Use environment variables — never hardcode keys
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  console.error('ERROR: Missing environment variables.');
  console.error('  Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, anonKey);

async function testSignup() {
  console.log("Testing signup...");
  const { data, error } = await supabase.auth.signUp({
    email: 'test' + Date.now() + '@example.com',
    password: 'password123',
  });
  console.log("Data:", data);
  console.log("Error:", error);
}

testSignup();
