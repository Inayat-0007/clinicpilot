import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Clock, TrendingUp, Users } from "lucide-react";

export const metadata = {
  title: "Analytics | ClinicPilot",
  description: "View clinic performance and no-show analytics",
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Analytics</h1>
        <p className="text-slate-500 mt-2">
          Track your clinic's performance, no-show rates, and revenue.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">+0% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">+0% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No-Show Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground">0% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Saved</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0h</div>
            <p className="text-xs text-muted-foreground">via automated reminders</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-dashed border-2">
        <CardHeader className="text-center pb-8 pt-12">
          <BarChart3 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <CardTitle className="text-xl">Detailed Analytics Coming Soon</CardTitle>
          <CardDescription className="max-w-md mx-auto mt-2">
            We are gathering data from your appointments. Advanced charts and demographic breakdowns will appear here once you have more activity.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
