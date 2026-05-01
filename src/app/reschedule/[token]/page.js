"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ReschedulePage() {
  const params = useParams();
  const token = params?.token;
  
  const [loading, setLoading] = useState(true);
  const [rescheduling, setRescheduling] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [success, setSuccess] = useState(false);

  // Mock available slots for MVP
  const slots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", 
    "11:00 AM", "11:30 AM", "04:00 PM", "04:30 PM", "05:00 PM"
  ];

  useEffect(() => {
    // For MVP, we'll fetch via API
    const fetchApt = async () => {
      try {
        const res = await fetch(`/api/public/reschedule?token=${token}`);
        const data = await res.json();
        if (res.ok) {
          setAppointment(data.appointment);
        } else {
          toast.error(data.error || "Invalid link");
        }
      } catch (err) {
        toast.error("Failed to load appointment");
      } finally {
        setLoading(false);
      }
    };
    
    if (token) fetchApt();
  }, [token]);

  const handleReschedule = async () => {
    if (!selectedSlot) return;
    setRescheduling(true);
    
    try {
      const res = await fetch('/api/public/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newSlot: selectedSlot })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setSuccess(true);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setRescheduling(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!appointment && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-t-4 border-t-red-600">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold">Invalid Link</CardTitle>
            <CardDescription>This reschedule link is invalid or has expired.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-t-4 border-t-green-600">
          <CardContent className="pt-8 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h3 className="text-2xl font-bold">Rescheduled Successfully!</h3>
            <p className="text-gray-500">Your appointment has been moved to {selectedSlot}. See you then!</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-blue-600">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold">Reschedule Appointment</CardTitle>
          <CardDescription>
            Hi {appointment.patients?.name}, pick a new time for your visit to {appointment.clinics?.name}.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="font-medium text-center mb-4">Select a New Time for Tomorrow</h3>
            <div className="grid grid-cols-3 gap-2">
              {slots.map((slot) => (
                <Button 
                  key={slot} 
                  variant={selectedSlot === slot ? "default" : "outline"}
                  className={selectedSlot === slot ? "bg-blue-600" : ""}
                  onClick={() => setSelectedSlot(slot)}
                >
                  {slot}
                </Button>
              ))}
            </div>
            <Button 
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700" 
              disabled={!selectedSlot || rescheduling}
              onClick={handleReschedule}
            >
              {rescheduling ? "Updating..." : "Confirm New Time"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
