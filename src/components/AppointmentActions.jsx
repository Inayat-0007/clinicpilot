"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export function AppointmentActions({ appointmentId, currentStatus }) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const updateStatus = async (status) => {
    setLoading(true);
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', appointmentId);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(`Appointment marked as ${status}`);
      router.refresh(); // Refresh the server component to show updated data
    }
    setLoading(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={loading}>
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => updateStatus('completed')}
          disabled={currentStatus === 'completed'}
        >
          <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
          <span>Mark Completed</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => updateStatus('no_show')}
          disabled={currentStatus === 'no_show'}
        >
          <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
          <span>Mark No-Show</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => updateStatus('cancelled')}
          disabled={currentStatus === 'cancelled'}
        >
          <XCircle className="mr-2 h-4 w-4 text-slate-500" />
          <span>Cancel Appointment</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
