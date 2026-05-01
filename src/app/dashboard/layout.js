import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, Users, BarChart3, Settings, LogOut } from "lucide-react";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <aside className="w-64 bg-white border-r hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <span className="font-bold text-xl text-blue-600">ClinicPilot</span>
        </div>
        <nav className="flex-1 py-4 flex flex-col gap-2 px-3">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 font-medium">
            <Calendar className="w-5 h-5" /> Appointments
          </Link>
          <Link href="/dashboard/patients" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 font-medium">
            <Users className="w-5 h-5" /> Patients
          </Link>
          <Link href="/dashboard/analytics" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 font-medium">
            <BarChart3 className="w-5 h-5" /> Analytics
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 font-medium">
            <Settings className="w-5 h-5" /> Settings
          </Link>
        </nav>
        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
            <LogOut className="w-5 h-5 mr-3" /> Logout
          </Button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
          <h1 className="font-semibold text-lg">Dashboard</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="hidden sm:flex">
              Copy Public Booking Link
            </Button>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              Dr
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
