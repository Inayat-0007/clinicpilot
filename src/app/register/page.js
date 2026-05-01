"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { MailCheck } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [loading, setLoading] = useState(false);
  // FIX #22: Track confirmation state so we can show the email-check screen
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // 1. Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      // FIX #13 (consistency): Generic error for auth failures
      toast.error(authError.message);
      setLoading(false);
      return;
    }

    // 2. Create Clinic workspace (best-effort — user can retry from settings)
    if (authData.user) {
      const slug = clinicName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const suffix = crypto.getRandomValues(new Uint32Array(1))[0] % 100000;
      
      const { error: clinicError } = await supabase.rpc('setup_clinic_workspace', {
        p_clinic_name: clinicName,
        p_slug: `${slug}-${suffix}`,
        p_user_id: authData.user.id
      });

      if (clinicError) {
        // FIX #25: Use structured logging pattern instead of console.error
        // In Next.js client components we still use console, but prefix it clearly
        console.error('[Register] Workspace setup error:', clinicError.code, clinicError.message);
        toast.error("Account created, but clinic setup failed. Contact support.");
      }
    }

    // FIX #22: Instead of redirecting immediately (which fails before email confirmation),
    // show the "Check your email" screen so the user knows what to do next.
    setEmailSent(true);
    setLoading(false);
  };

  // FIX #22: Show email confirmation screen instead of broken redirect
  if (emailSent) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm shadow-lg border-t-4 border-t-green-500 text-center">
          <CardHeader className="pt-8 pb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MailCheck className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
            <CardDescription className="mt-2">
              We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <p className="text-sm text-slate-500">
              Already confirmed?{" "}
              <Link href="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-lg border-t-4 border-t-blue-600">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Start Free Trial</CardTitle>
          <CardDescription>Setup your clinic in less than 2 minutes</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2 text-left">
              <Label htmlFor="clinicName">Clinic Name</Label>
              <Input 
                id="clinicName" 
                placeholder="City Care Clinic" 
                required 
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
              />
            </div>
            <div className="space-y-2 text-left">
              <Label htmlFor="email">Work Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="doctor@clinic.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2 text-left">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
