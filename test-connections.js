import { createClient } from '@supabase/supabase-js';
import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testConnections() {
  console.log("Testing Supabase Connection...");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Supabase URL or Key is missing.");
  } else {
    try {
      // Remove surrounding quotes if present
      const cleanUrl = supabaseUrl.replace(/^"/, '').replace(/"$/, '');
      const cleanKey = supabaseKey.replace(/^"/, '').replace(/"$/, '');
      const supabase = createClient(cleanUrl, cleanKey);
      const { data, error } = await supabase.from('clinics').select('count', { count: 'exact', head: true });
      if (error) {
         console.error("❌ Supabase connection failed:", error.message);
      } else {
         console.log("✅ Supabase connection successful! (Total Clinics:", data !== null ? data : 0, ")");
      }
    } catch (err) {
      console.error("❌ Supabase connection failed:", err.message);
    }
  }

  console.log("\nTesting Upstash Redis Connection...");
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (!redisUrl || !redisToken) {
    console.error("❌ Redis URL or Token is missing.");
  } else {
    try {
      const cleanUrl = redisUrl.replace(/^"/, '').replace(/"$/, '');
      const cleanToken = redisToken.replace(/^"/, '').replace(/"$/, '');
      const redis = new Redis({
        url: cleanUrl,
        token: cleanToken,
      });
      const ping = await redis.ping();
      if (ping === "PONG") {
        console.log("✅ Redis connection successful! (PONG)");
      } else {
        console.error("❌ Redis returned an unexpected response:", ping);
      }
    } catch (err) {
      console.error("❌ Redis connection failed:", err.message);
    }
  }
}

testConnections();
