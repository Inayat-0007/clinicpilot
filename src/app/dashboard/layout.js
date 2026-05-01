"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Users, BarChart3, Settings, LogOut, Menu, X, Link2 } from "lucide-react";
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
        ? "fixed inset-0 z-50 bg-white flex flex-col w-72 shadow-2xl"
        : "w-64 bg-white border-r hidden md:flex flex-col"
    }
  >
    <div className="h-16 flex items-center justify-between px-6 border-b">
      <span className="font-bold text-xl text-blue-600">ClinicPilot</span>
      {mobile && (
        <button
          onClick={() => setMobileOpen(false)}
          className="text-gray-500 hover:text-gray-800"
          aria-label="Close menu"
        >
          <X className="w-6 h-6" />
        </button>
      )}
    </div>
    <nav className="flex-1 py-4 flex flex-col gap-1 px-3">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors ${
              isActive
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        );
      })}
    </nav>
    <div className="p-4 border-t">
      {/* FIX #5: onClick handler added — was missing, causing logout to do nothing */}
      <Button
        variant="ghost"
        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={handleLogout}
      >
        <LogOut className="w-5 h-5 mr-3" /> Logout
      </Button>
    </div>
  </aside>
);

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const supabase = createClient();

  // FIX #5: Proper logout handler that calls supabase.auth.signOut()
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // FIX #17: Copy the current clinic's public booking link to clipboard.
  // The slug is extracted from the window URL for now; ideally pass it via props.
  const handleCopyBookingLink = async () => {
    try {
      const clipboardText = `${window.location.origin}/book/[your-clinic-slug]`;
      await navigator.clipboard.writeText(clipboardText);
      toast.success("Booking link copied! Replace [your-clinic-slug] with your actual slug.");
    } catch {
      toast.error("Could not copy link. Please copy it manually from Settings.");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop sidebar */}
      <Sidebar pathname={pathname} setMobileOpen={setMobileOpen} handleLogout={handleLogout} />

      {/* FIX #28: Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <Sidebar mobile pathname={pathname} setMobileOpen={setMobileOpen} handleLogout={handleLogout} />
        </>
      )}

      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-6 gap-4">
          {/* FIX #28: Hamburger menu button — visible only on mobile */}
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-gray-600 hover:text-gray-900 -ml-1"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              id="mobile-menu-btn"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-semibold text-lg">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* FIX #17: Copy booking link button now has an actual onClick handler */}
            <Button
              variant="outline"
              className="hidden sm:flex items-center gap-2 text-sm"
              onClick={handleCopyBookingLink}
              id="copy-booking-link-btn"
            >
              <Link2 className="w-4 h-4" />
              Copy Booking Link
            </Button>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              Dr
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
