"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format, addDays, isSameDay } from "date-fns";
import { Calendar as CalendarIcon, Clock, CheckCircle2, ChevronRight, User } from "lucide-react";

export default function BookingPage() {
  const params = useParams();
  const slug = params?.slug;
  const [step, setStep] = useState(0); // 0: Doctor, 1: Date/Time, 2: Info, 3: Success
  const [clinic, setClinic] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [clinicLoading, setClinicLoading] = useState(true);

  // Generate next 7 days for the date picker
  const next7Days = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  const fetchClinic = useCallback(async () => {
    try {
      const res = await fetch(`/api/public/clinic?slug=${slug}`);
      const data = await res.json();
      if (res.ok) {
        setClinic(data.clinic);
        if (data.clinic.doctors?.length === 1) {
          setSelectedDoctor(data.clinic.doctors[0]);
          setStep(1);
        }
      } else {
        toast.error("Clinic not found");
      }
    } catch (err) {
      toast.error("Failed to load clinic info");
    } finally {
      setClinicLoading(false);
    }
  }, [slug]);

  const fetchSlots = useCallback(async (date, doctorId) => {
    if (!doctorId) return;
    setSlotsLoading(true);
    setSelectedSlot("");
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const res = await fetch(`/api/public/slots?slug=${slug}&date=${formattedDate}&doctorId=${doctorId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch slots');
      setAvailableSlots(data.slots || []);
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error("Could not load available slots.");
    } finally {
      setSlotsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug) fetchClinic();
  }, [slug, fetchClinic]);

  useEffect(() => {
    if (selectedDoctor && step === 1) {
      fetchSlots(selectedDate, selectedDoctor.id);
    }
  }, [selectedDoctor, selectedDate, step, fetchSlots]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!phone.startsWith('+91')) {
      toast.error("Please enter phone in +91XXXXXXXXXX format");
      return;
    }
    setLoading(true);
    
    try {
      const res = await fetch('/api/public/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          slug, 
          name, 
          phone, 
          date: format(selectedDate, 'yyyy-MM-dd'),
          slot: selectedSlot,
          doctorId: selectedDoctor.id
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to book');
      
      setStep(3);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (clinicLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading clinic details...</p>
        </div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Clinic not found.</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-xl shadow-xl border-none ring-1 ring-slate-200">
        <CardHeader className="text-center pb-4 border-b bg-slate-50/50">
          <CardTitle className="text-2xl font-bold text-slate-900">{clinic.name}</CardTitle>
          <CardDescription>Book your slot in less than 60 seconds</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {step === 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-slate-700 font-semibold mb-2">
                <User className="w-4 h-4" />
                <span>Choose a Doctor</span>
              </div>
              <div className="grid gap-3">
                {clinic.doctors?.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => {
                      setSelectedDoctor(doc);
                      setStep(1);
                    }}
                    className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all text-left"
                  >
                    <div>
                      <p className="font-bold text-slate-900 text-lg">Dr. {doc.name}</p>
                      <p className="text-sm text-slate-500 font-medium">{doc.specialization || "General Physician"}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              {clinic.doctors?.length > 1 && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-sm font-bold text-blue-700">Dr. {selectedDoctor?.name}</p>
                  <Button variant="ghost" size="sm" onClick={() => setStep(0)} className="text-xs h-7 text-blue-600 font-bold hover:bg-blue-100">Change Doctor</Button>
                </div>
              )}

              {/* Date Selection */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-700 font-semibold mb-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span>Select Date</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {next7Days.map((date) => {
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
                    <p className="text-xs text-slate-400 mt-1">Please try selecting another date.</p>
                  </div>
                )}
              </div>

              <Button 
                className="w-full h-12 mt-4 bg-blue-600 hover:bg-blue-700 text-lg font-semibold rounded-xl shadow-lg shadow-blue-100" 
                disabled={!selectedSlot || slotsLoading}
                onClick={() => setStep(2)}
              >
                Continue <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleBooking} className="space-y-6">
              <div className="bg-blue-50/80 p-4 rounded-xl border border-blue-100 space-y-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Your Selection</p>
                    <p className="font-bold text-slate-900">{format(selectedDate, 'PPP')} at {selectedSlot}</p>
                    <p className="text-xs text-slate-600 font-medium">with Dr. {selectedDoctor?.name}</p>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setStep(1)} className="text-blue-600 hover:text-blue-700 font-bold h-7">Change</Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700 font-semibold">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Rahul Sharma" 
                    required 
                    className="h-12 rounded-lg border-slate-200"
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-700 font-semibold">WhatsApp Number</Label>
                  <div className="relative">
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="+919876543210" 
                      required 
                      className="h-12 rounded-lg border-slate-200"
                      value={phone} 
                      onChange={e => setPhone(e.target.value)} 
                    />
                  </div>
                  <p className="text-xs text-slate-500 italic">Format: +91 followed by 10 digits.</p>
                </div>
              </div>

              <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-lg font-semibold rounded-xl mt-4 shadow-lg shadow-blue-100" disabled={loading}>
                {loading ? "Confirming..." : "Confirm My Booking"}
              </Button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center space-y-6 py-10">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-slate-900">Booked!</h3>
                <p className="text-slate-500 max-w-[280px] mx-auto">
                  Your appointment for <span className="font-bold text-slate-700">{format(selectedDate, 'do MMM')}</span> is confirmed.
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-600 italic">
                A confirmation message has been sent to your WhatsApp.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
