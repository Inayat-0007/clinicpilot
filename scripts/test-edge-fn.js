const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function testEdgeFunction() {
  console.log("=== Testing Edge Function ===");
  console.log("URL:", `${SUPABASE_URL}/functions/v1/send-reminders`);
  console.log("");

  // Test 1: With Service Role Key
  console.log("--- Test 1: Service Role Key ---");
  try {
    const res1 = await fetch(`${SUPABASE_URL}/functions/v1/send-reminders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    console.log("Status:", res1.status, res1.statusText);
    const text1 = await res1.text();
    console.log("Response:", text1);
  } catch (err) {
    console.error("Error:", err.message);
  }

  console.log("");

  // Test 2: With Anon Key  
  console.log("--- Test 2: Anon Key ---");
  try {
    const res2 = await fetch(`${SUPABASE_URL}/functions/v1/send-reminders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    console.log("Status:", res2.status, res2.statusText);
    const text2 = await res2.text();
    console.log("Response:", text2);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testEdgeFunction();
