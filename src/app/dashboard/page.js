import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { format, startOfDay, endOfDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Auth Check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login");
  }

  // 2. Fetch User's Clinic
  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id, clinics(name, slug)')
    .eq('user_id', user.id)
    .single();

  if (!staff) {
    return <div className="p-6">Error: No clinic assigned.</div>;
  }

  const clinicId = staff.clinic_id;

  // 3. Fetch Today's Appointments
  const todayStart = startOfDay(new Date()).toISOString();
  const todayEnd = endOfDay(new Date()).toISOString();

  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      id, starts_at, status, notes,
      patients (name, phone)
    `)
    .eq('clinic_id', clinicId)
    .gte('starts_at', todayStart)
    .lte('starts_at', todayEnd)
    .order('starts_at', { ascending: true });

  const totalAppointments = appointments?.length || 0;
  const noShows = appointments?.filter(a => a.status === 'no_show').length || 0;
  const noShowRate = totalAppointments > 0 ? Math.round((noShows / totalAppointments) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Welcome to {staff.clinics?.name}</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAppointments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">WhatsApp Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Pending Meta Approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No-Show Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{noShowRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Saved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹0</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Today&apos;s Schedule</CardTitle>
          <Button size="sm">New Booking</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reminders</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments && appointments.length > 0 ? (
                appointments.map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell className="font-medium">
                      {format(new Date(apt.starts_at), "hh:mm a")}
                    </TableCell>
                    <TableCell>{apt.patients?.name}</TableCell>
                    <TableCell>{apt.patients?.phone ? `•••••${apt.patients.phone.slice(-4)}` : '—'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        apt.status === 'confirmed' ? "bg-green-100 text-green-800" :
                        apt.status === 'rescheduled' ? "bg-blue-100 text-blue-800" : "bg-gray-100"
                      }>
                        {apt.status}
                      </Badge>
                    </TableCell>
                    <TableCell><Badge variant="outline">Pending</Badge></TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                    No appointments scheduled for today.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
