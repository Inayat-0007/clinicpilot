"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function BookingPage() {
  const params = useParams();
  const slug = params?.slug;
  const [step, setStep] = useState(1);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const slots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", 
    "11:00 AM", "11:30 AM", "04:00 PM", "04:30 PM", "05:00 PM"
  ];

  const handleBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/public/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, name, phone, slot: selectedSlot })
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

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-blue-600">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold">Clinic Appointment</CardTitle>
          <CardDescription>Book an appointment</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-medium text-center mb-4">Select a Time for Today</h3>
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
                disabled={!selectedSlot}
                onClick={() => setStep(2)}
              >
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleBooking} className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800 mb-4 font-medium flex items-center">
                <span>Selected: Today at {selectedSlot}</span>
                <Button type="button" variant="link" size="sm" onClick={() => setStep(1)} className="ml-auto p-0 h-auto">Change</Button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Rahul Sharma" required value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (WhatsApp)</Label>
                <Input id="phone" type="tel" placeholder="+91 98765 43210" required value={phone} onChange={e => setPhone(e.target.value)} />
                <p className="text-xs text-muted-foreground">We&apos;ll send reminders and reschedule links here.</p>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 mt-4" disabled={loading}>
                {loading ? "Confirming..." : "Confirm Booking"}
              </Button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center space-y-4 py-6">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <h3 className="text-2xl font-bold">Booking Confirmed!</h3>
              <p className="text-gray-500">We&apos;ve saved your appointment. You will receive a WhatsApp confirmation shortly.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
