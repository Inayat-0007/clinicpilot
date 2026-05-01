import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qsngudfzugvswsxftqrp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzbmd1ZGZ6dWd2c3dzeGZ0cXJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MTgxMjMsImV4cCI6MjA5MzE5NDEyM30.ZkXPro040ro2bkBNSWLJ8zxFjVz73shT-GJfSu1EosY'
);

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
