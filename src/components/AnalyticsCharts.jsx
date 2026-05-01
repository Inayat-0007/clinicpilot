"use client";

import { useMemo } from "react";
import { format, parseISO, startOfDay, subDays, eachDayOfInterval } from "date-fns";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AnalyticsCharts({ appointments }) {
  // Aggregate appointments by day for the last 14 days
  const chartData = useMemo(() => {
    const end = startOfDay(new Date());
    const start = subDays(end, 13);
    
    // Create an array of the last 14 days
    const days = eachDayOfInterval({ start, end });
    
    // Initialize map
    const dataMap = days.reduce((acc, day) => {
      acc[format(day, 'yyyy-MM-dd')] = {
        date: format(day, 'MMM dd'),
        total: 0,
        completed: 0,
        no_show: 0,
        cancelled: 0,
      };
      return acc;
    }, {});

    // Fill data
    appointments.forEach(appt => {
      if (!appt.starts_at) return;
      
      const dayKey = format(parseISO(appt.starts_at), 'yyyy-MM-dd');
      if (dataMap[dayKey]) {
        dataMap[dayKey].total += 1;
        if (appt.status === 'completed' || appt.status === 'confirmed') {
          dataMap[dayKey].completed += 1;
        } else if (appt.status === 'no_show') {
          dataMap[dayKey].no_show += 1;
        } else if (appt.status === 'cancelled') {
          dataMap[dayKey].cancelled += 1;
        }
      }
    });

    return Object.values(dataMap);
  }, [appointments]);

  if (appointments.length === 0) {
    return (
      <Card className="mt-6 border-dashed border-2">
        <CardHeader className="text-center pb-8 pt-12">
          <CardTitle className="text-xl">Not Enough Data</CardTitle>
          <CardDescription className="max-w-md mx-auto mt-2">
            Charts will appear here once you have scheduled some appointments.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 mt-6">
      <Card>
        <CardHeader>
          <CardTitle>Appointment Volume (Last 14 Days)</CardTitle>
          <CardDescription>Daily count of scheduled appointments</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend />
              <Line type="monotone" dataKey="total" name="Total Appointments" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Breakdown</CardTitle>
          <CardDescription>Completed vs No-shows</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip 
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend />
              <Bar dataKey="completed" name="Completed/Confirmed" fill="#16a34a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="no_show" name="No Show" fill="#dc2626" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cancelled" name="Cancelled" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
