"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Calendar, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success("Welcome back!");
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* Left side - Branding & Value Prop */}
      <div className="hidden md:flex flex-col justify-between w-1/2 bg-gradient-to-br from-blue-900 to-indigo-900 text-white p-12 relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white opacity-5 blur-[80px]"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-500 opacity-20 blur-[60px]"></div>
        
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 w-fit hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20">
              <Calendar className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-2xl tracking-tight">ClinicPilot</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold leading-tight mb-6"
          >
            Stop losing revenue to patient no-shows.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-blue-200 text-lg md:text-xl font-medium leading-relaxed"
          >
            The smartest clinics in India use ClinicPilot to automate WhatsApp reminders and guarantee their calendars stay full.
          </motion.p>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-sm font-medium text-blue-300">
          <div className="flex -space-x-3">
            {[1,2,3,4].map(i => (
              <div key={i} className={`w-10 h-10 rounded-full border-2 border-indigo-900 bg-slate-200 flex items-center justify-center text-xs text-slate-800 font-bold bg-[url('https://i.pravatar.cc/100?img=${i}')] bg-cover`}></div>
            ))}
          </div>
          <p>Joined by 500+ top clinics across India.</p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 relative bg-white shadow-[-20px_0_40px_-10px_rgba(0,0,0,0.05)] z-10">
        
        <Link href="/" className="md:hidden flex items-center gap-2 mb-12">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Calendar className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl text-slate-900">ClinicPilot</span>
        </Link>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back</h1>
            <p className="text-slate-500 font-medium">Enter your credentials to access your dashboard.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 mt-8">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-semibold">Email address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="doctor@clinic.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors rounded-xl px-4"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-700 font-semibold">Password</Label>
                <Link href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700">Forgot password?</Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors rounded-xl px-4"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-md shadow-md hover:shadow-lg transition-all" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Signing in...
                </>
              ) : (
                <>
                  Sign in <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="pt-6 text-center text-sm font-medium text-slate-500">
            Don&apos;t have an account yet?{" "}
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-bold hover:underline">
              Start your 14-day free trial
            </Link>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
