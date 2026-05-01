import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Clock, TrendingUp, Users } from "lucide-react";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";

export const metadata = {
  title: "Analytics | ClinicPilot",
  description: "View clinic performance and no-show analytics",
};

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login");
  }

  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single();

  if (!staff) {
    return <div className="p-6">Error: No clinic assigned.</div>;
  }

  const clinicId = staff.clinic_id;

  // FIX #24: Limit queries to avoid loading 36,000+ rows on every page visit.
  // We only need the last 2 months of data for the KPIs shown here.
  const now = new Date();
  const twoMonthsAgo = startOfMonth(subMonths(now, 1)).toISOString();

  const { data: patients } = await supabase
    .from('patients')
    .select('created_at')
    .eq('clinic_id', clinicId)
    .gte('created_at', twoMonthsAgo)
    .limit(2000);

  const { data: appointments } = await supabase
    .from('appointments')
    .select('created_at, starts_at, status')
    .eq('clinic_id', clinicId)
    .gte('created_at', twoMonthsAgo)
    .limit(2000);

  // Math Setup (now is defined above, before queries)
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  const safePatients = patients || [];
  const safeAppointments = appointments || [];

  // Total Patients Math
  const totalPatients = safePatients.length;
  const currentMonthPatients = safePatients.filter(p => isWithinInterval(new Date(p.created_at), { start: currentMonthStart, end: currentMonthEnd })).length;
  const lastMonthPatients = safePatients.filter(p => isWithinInterval(new Date(p.created_at), { start: lastMonthStart, end: lastMonthEnd })).length;
  
  let patientGrowth = 0;
  if (lastMonthPatients === 0) {
    patientGrowth = currentMonthPatients > 0 ? 100 : 0;
  } else {
    patientGrowth = Math.round(((currentMonthPatients - lastMonthPatients) / lastMonthPatients) * 100);
  }

  // Appointments Math
  const totalAppointments = safeAppointments.length;
  const currentMonthAppts = safeAppointments.filter(a => isWithinInterval(new Date(a.created_at), { start: currentMonthStart, end: currentMonthEnd })).length;
  const lastMonthAppts = safeAppointments.filter(a => isWithinInterval(new Date(a.created_at), { start: lastMonthStart, end: lastMonthEnd })).length;
  
  let apptGrowth = 0;
  if (lastMonthAppts === 0) {
    apptGrowth = currentMonthAppts > 0 ? 100 : 0;
  } else {
    apptGrowth = Math.round(((currentMonthAppts - lastMonthAppts) / lastMonthAppts) * 100);
  }

  // No-Show Rate Math
  const noShows = safeAppointments.filter(a => a.status === 'no_show').length;
  const lifetimeNoShowRate = totalAppointments > 0 ? Math.round((noShows / totalAppointments) * 100) : 0;

  const currentMonthNoShows = safeAppointments.filter(a => a.status === 'no_show' && isWithinInterval(new Date(a.created_at), { start: currentMonthStart, end: currentMonthEnd })).length;
  const lastMonthNoShows = safeAppointments.filter(a => a.status === 'no_show' && isWithinInterval(new Date(a.created_at), { start: lastMonthStart, end: lastMonthEnd })).length;

  const currentMonthNoShowRate = currentMonthAppts > 0 ? Math.round((currentMonthNoShows / currentMonthAppts) * 100) : 0;
  const lastMonthNoShowRate = lastMonthAppts > 0 ? Math.round((lastMonthNoShows / lastMonthAppts) * 100) : 0;
  
  const noShowGrowth = currentMonthNoShowRate - lastMonthNoShowRate; // absolute percentage points difference

  // Completion Rate Math
  const completedAppts = safeAppointments.filter(a => a.status === 'completed').length;
  const completionRate = totalAppointments > 0 ? Math.round((completedAppts / totalAppointments) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Analytics</h1>
        <p className="text-slate-500 mt-2">
          Track your clinic&apos;s performance, no-show rates, and revenue.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              {patientGrowth >= 0 ? "+" : ""}{patientGrowth}% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAppointments}</div>
            <p className="text-xs text-muted-foreground">
              {apptGrowth >= 0 ? "+" : ""}{apptGrowth}% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No-Show Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lifetimeNoShowRate}%</div>
            <p className="text-xs text-muted-foreground">
              {noShowGrowth > 0 ? "+" : ""}{noShowGrowth}% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">Lifetime completion</p>
          </CardContent>
        </Card>
      </div>

      <AnalyticsCharts appointments={safeAppointments} />
    </div>
  );
}
