import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { format, startOfDay, endOfDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddBookingModal } from "@/components/AddBookingModal";
import { AppointmentActions } from "@/components/AppointmentActions";

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
      patients (name, phone),
      doctors (name),
      reminders (id, status, channel)
    `)
    .eq('clinic_id', clinicId)
    .gte('starts_at', todayStart)
    .lte('starts_at', todayEnd)
    .order('starts_at', { ascending: true });

  // FIX #18: Fetch real WhatsApp sent count for this month
  const startOfThisMonth = new Date();
  startOfThisMonth.setDate(1);
  startOfThisMonth.setHours(0, 0, 0, 0);

  const { count: whatsappSentCount } = await supabase
    .from('reminders')
    .select('id', { count: 'exact', head: true })
    .eq('channel', 'whatsapp')
    .in('status', ['sent', 'delivered', 'read'])
    .gte('sent_at', startOfThisMonth.toISOString());

  const totalAppointments = appointments?.length || 0;
  const noShows = appointments?.filter(a => a.status === 'no_show').length || 0;
  const noShowRate = totalAppointments > 0 ? Math.round((noShows / totalAppointments) * 100) : 0;
  const attendedAppointments = appointments?.filter(a => a.status === 'completed' || a.status === 'confirmed').length || 0;

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
            {/* FIX #18: Real count from reminders table, not hardcoded 0 */}
            <div className="text-2xl font-bold">{whatsappSentCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">This month</p>
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
            <CardTitle className="text-sm font-medium">Attended/Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendedAppointments}</div>
            <p className="text-xs text-muted-foreground">Appointments today</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Today&apos;s Schedule</CardTitle>
          <AddBookingModal />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reminders</TableHead>
                <TableHead className="w-[50px]"></TableHead>
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
                    <TableCell>Dr. {apt.doctors?.name || '—'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        apt.status === 'confirmed' ? "bg-green-100 text-green-800" :
                        apt.status === 'rescheduled' ? "bg-blue-100 text-blue-800" : "bg-gray-100"
                      }>
                        {apt.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {/* FIX #19: Show actual reminder status from the joined reminders data */}
                      {apt.reminders && apt.reminders.length > 0 ? (
                        <Badge variant="outline" className={
                          apt.reminders[0].status === 'sent' || apt.reminders[0].status === 'delivered' ? "bg-green-100 text-green-800" :
                          apt.reminders[0].status === 'failed' ? "bg-red-100 text-red-800" :
                          "bg-yellow-100 text-yellow-800"
                        }>
                          {apt.reminders[0].channel === 'whatsapp' ? '📱 ' : '💬 '}{apt.reminders[0].status}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-600">Not sent</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <AppointmentActions appointmentId={apt.id} currentStatus={apt.status} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-gray-500">
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
