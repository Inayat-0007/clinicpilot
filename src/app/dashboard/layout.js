"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Users, BarChart3, Settings, LogOut, Menu, X, Link2, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const navItems = [
  { href: "/dashboard", label: "Appointments", icon: Calendar },
  { href: "/dashboard/patients", label: "Patients", icon: Users },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const Sidebar = ({ mobile = false, pathname, setMobileOpen, handleLogout }) => (
  <aside
    className={
      mobile
        ? "fixed inset-y-0 left-0 z-50 flex flex-col w-72 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white shadow-2xl"
        : "w-64 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white hidden md:flex flex-col"
    }
  >
    {/* Logo */}
    <div className="h-16 flex items-center justify-between px-5 border-b border-white/10">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
          ClinicPilot
        </span>
      </div>
      {mobile && (
        <button
          onClick={() => setMobileOpen(false)}
          className="text-white/60 hover:text-white transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>

    {/* Navigation */}
    <nav className="flex-1 py-4 flex flex-col gap-0.5 px-3">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
              isActive
                ? "bg-white/10 text-white shadow-sm backdrop-blur-sm"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon className={`w-[18px] h-[18px] transition-colors ${isActive ? "text-blue-400" : "text-white/40 group-hover:text-white/70"}`} />
            {label}
          </Link>
        );
      })}
    </nav>

    {/* Logout */}
    <div className="p-3 border-t border-white/10">
      <button
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400/80 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
        onClick={handleLogout}
      >
        <LogOut className="w-[18px] h-[18px]" /> Logout
      </button>
    </div>
  </aside>
);

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [clinicSlug, setClinicSlug] = useState("");
  const [userInitials, setUserInitials] = useState("");
  const [userName, setUserName] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function fetchClinicData() {
      try {
        const { data: clinicId } = await supabase.rpc('get_my_clinic_id');
        if (clinicId) {
          const { data: clinic } = await supabase.from('clinics').select('slug').eq('id', clinicId).single();
          if (clinic) setClinicSlug(clinic.slug);
        }
        
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: staff } = await supabase.from('staff').select('name').eq('user_id', user.id).single();
          if (staff && staff.name) {
            const initials = staff.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            setUserInitials(initials);
            setUserName(staff.name);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchClinicData();
  }, [supabase]);

  // FIX #5: Proper logout handler that calls supabase.auth.signOut()
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // FIX #17: Copy the current clinic's public booking link to clipboard.
  const handleCopyBookingLink = async () => {
    try {
      if (!clinicSlug) throw new Error("Slug not loaded yet");
      const clipboardText = `${window.location.origin}/book/${clinicSlug}`;
      await navigator.clipboard.writeText(clipboardText);
      toast.success("Booking link copied!");
    } catch {
      toast.error("Could not copy link. Please copy it manually from Settings.");
    }
  };

  // Derive a nice page title from the current path
  const pageTitle = navItems.find(
    item => pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
  )?.label || "Dashboard";

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop sidebar */}
      <Sidebar pathname={pathname} setMobileOpen={setMobileOpen} handleLogout={handleLogout} />

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <Sidebar mobile pathname={pathname} setMobileOpen={setMobileOpen} handleLogout={handleLogout} />
        </>
      )}

      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 md:px-6 gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-slate-500 hover:text-slate-800 -ml-1 transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              id="mobile-menu-btn"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-semibold text-lg text-slate-900">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="hidden sm:flex items-center gap-2 text-xs h-8"
              onClick={handleCopyBookingLink}
              id="copy-booking-link-btn"
            >
              <Link2 className="w-3.5 h-3.5" />
              Copy Booking Link
            </Button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-violet-600 rounded-full flex items-center justify-center text-white font-semibold text-xs shadow-md shadow-blue-600/20 flex-shrink-0">
                {userInitials}
              </div>
              {userName && (
                <span className="hidden md:block text-sm font-medium text-slate-700">{userName}</span>
              )}
            </div>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
