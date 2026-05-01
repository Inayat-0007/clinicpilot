"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format, addDays, isSameDay } from "date-fns";
import { Calendar as CalendarIcon, Clock, CheckCircle2, ChevronRight, AlertCircle } from "lucide-react";

export default function ReschedulePage() {
  const params = useParams();
  const token = params?.token;
  
  const [loading, setLoading] = useState(true);
  const [rescheduling, setRescheduling] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const [selectedDate, setSelectedDate] = useState(addDays(new Date(), 1)); // Default to tomorrow
  const [selectedSlot, setSelectedSlot] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Generate next 14 days for rescheduling flexibility
  const nextDays = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i + 1));

  const fetchApt = useCallback(async () => {
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
  }, [token]);

  const fetchSlots = useCallback(async (date, slug) => {
    setSlotsLoading(true);
    setSelectedSlot("");
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const res = await fetch(`/api/public/slots?slug=${slug}&date=${formattedDate}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch slots');
      setAvailableSlots(data.slots || []);
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error("Could not load available slots.");
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) fetchApt();
  }, [token, fetchApt]);

  useEffect(() => {
    // Note: appointment object structure from API has clinics.slug or we might need to fetch it
    // Let's assume we need to add slug to the API response or use a placeholder if missing
    // Actually, I should check the appointment fetch API again.
    // In src/app/api/public/reschedule/route.js, the GET returns clinics(name). 
    // I need to add slug there!
    if (appointment?.clinics?.slug) {
      fetchSlots(selectedDate, appointment.clinics.slug);
    }
  }, [appointment, selectedDate, fetchSlots]);

  const handleReschedule = async () => {
    if (!selectedSlot) return;
    setRescheduling(true);
    
    try {
      const res = await fetch('/api/public/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token, 
          date: format(selectedDate, 'yyyy-MM-dd'),
          newSlot: selectedSlot 
        })
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Validating your link...</p>
        </div>
      </div>
    );
  }

  if (!appointment && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <Card className="w-full max-w-md shadow-xl border-none ring-1 ring-red-100">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Expired Link</CardTitle>
            <CardDescription className="text-slate-500">
              This reschedule link is no longer valid. Please contact your clinic directly to manage your appointment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-slate-900" onClick={() => window.location.href = '/'}>Back to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-none ring-1 ring-green-100">
          <CardContent className="pt-10 text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-bold text-slate-900">All Set!</h3>
              <p className="text-slate-500">
                Your appointment has been successfully moved to <br />
                <span className="font-bold text-slate-900">{format(selectedDate, 'do MMM')} at {selectedSlot}</span>
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-600 italic">
              We&apos;ve sent a new confirmation to your WhatsApp.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-xl shadow-xl border-none ring-1 ring-slate-200">
        <CardHeader className="text-center pb-4 border-b bg-slate-50/50">
          <CardTitle className="text-2xl font-bold text-slate-900">Reschedule Visit</CardTitle>
          <CardDescription className="px-6">
            Hi {appointment.patients?.name}, pick a better time for your visit to <span className="font-bold text-slate-700">{appointment.clinics?.name}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-8">
            {/* Date Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-700 font-semibold mb-2">
                <CalendarIcon className="w-4 h-4" />
                <span>Select New Date</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {nextDays.map((date) => {
                  const isActive = isSameDay(date, selectedDate);
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(date)}
                      className={`flex flex-col items-center justify-center min-w-[70px] py-3 rounded-xl border-2 transition-all ${
                        isActive 
                          ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200" 
                          : "bg-white border-slate-100 text-slate-600 hover:border-blue-200"
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold opacity-80">{format(date, 'EEE')}</span>
                      <span className="text-lg font-bold">{format(date, 'd')}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-700 font-semibold mb-2">
                <Clock className="w-4 h-4" />
                <span>Available Slots</span>
              </div>
              
              {slotsLoading ? (
                <div className="grid grid-cols-3 gap-2">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="h-10 bg-slate-100 animate-pulse rounded-md"></div>
                  ))}
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((slot) => (
                    <Button 
                      key={slot} 
                      variant={selectedSlot === slot ? "default" : "outline"}
                      className={`h-11 rounded-lg font-medium ${selectedSlot === slot ? "bg-blue-600 hover:bg-blue-700 shadow-md" : "border-slate-200"}`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-500 font-medium">No slots available for this day.</p>
                  <p className="text-xs text-slate-400 mt-1">Please try another date.</p>
                </div>
              )}
            </div>

            <Button 
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-lg font-semibold rounded-xl shadow-lg shadow-blue-100" 
              disabled={!selectedSlot || rescheduling || slotsLoading}
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
