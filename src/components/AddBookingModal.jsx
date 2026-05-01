"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export function AddBookingModal({ onBookingAdded }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  
  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_id: "",
    date: new Date().toISOString().split('T')[0],
    time: "09:00",
    duration: "15",
    notes: ""
  });

  const supabase = createClient();

  const fetchData = async () => {
    setFetching(true);
    try {
      const { data: clinicId } = await supabase.rpc('get_my_clinic_id');
      if (!clinicId) throw new Error("Could not determine your clinic workspace.");

      const [patientsRes, doctorsRes] = await Promise.all([
        supabase.from('patients').select('id, name, phone').eq('clinic_id', clinicId).order('name'),
        supabase.from('doctors').select('id, name').eq('clinic_id', clinicId).order('name')
      ]);

      if (patientsRes.error) throw patientsRes.error;
      if (doctorsRes.error) throw doctorsRes.error;

      setPatients(patientsRes.data || []);
      setDoctors(doctorsRes.data || []);
      
      if (doctorsRes.data && doctorsRes.data.length > 0 && !formData.doctor_id) {
        setFormData(prev => ({ ...prev, doctor_id: doctorsRes.data[0].id }));
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load patients and doctors");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient_id) {
      toast.error("Please select a patient");
      return;
    }
    
    setLoading(true);

    try {
      // Calculate start and end times
      const starts_at = new Date(`${formData.date}T${formData.time}`).toISOString();
      const ends_at = new Date(new Date(starts_at).getTime() + parseInt(formData.duration) * 60000).toISOString();

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: formData.patient_id,
          doctorId: formData.doctor_id || undefined,
          startsAt: starts_at,
          endsAt: ends_at,
          notes: formData.notes
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to add appointment");
      }

      toast.success("Appointment booked successfully");
      setOpen(false);
      
      // Reset form (keep date/doctor to make multiple bookings easier)
      setFormData(prev => ({ ...prev, patient_id: "", time: "09:00", notes: "" }));
      
      if (onBookingAdded) {
        // We use router.refresh() in parent usually or just reload page
        onBookingAdded(result.appointment);
      } else {
        window.location.reload(); // Simple refresh for server components parent
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to add appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        New Booking
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Book Appointment</DialogTitle>
            <DialogDescription>
              Schedule a new appointment for an existing patient.
            </DialogDescription>
          </DialogHeader>
          
          {fetching ? (
            <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="patient_id">Patient *</Label>
                <Select value={formData.patient_id} onValueChange={(val) => handleSelectChange('patient_id', val)}>
                  <SelectTrigger id="patient_id">
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.length === 0 ? (
                      <SelectItem value="none" disabled>No patients found. Add one first.</SelectItem>
                    ) : (
                      patients.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name} ({p.phone})</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {doctors.length > 0 && (
                <div className="grid gap-2">
                  <Label htmlFor="doctor_id">Doctor</Label>
                  <Select value={formData.doctor_id} onValueChange={(val) => handleSelectChange('doctor_id', val)}>
                    <SelectTrigger id="doctor_id">
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map(d => (
                        <SelectItem key={d.id} value={d.id}>Dr. {d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Time *</Label>
                  <Input id="time" name="time" type="time" value={formData.time} onChange={handleChange} required />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Select value={formData.duration} onValueChange={(val) => handleSelectChange('duration', val)}>
                  <SelectTrigger id="duration">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">60 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Input id="notes" name="notes" value={formData.notes} onChange={handleChange} placeholder="Follow-up, etc." />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button type="submit" disabled={loading || fetching || patients.length === 0} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Booking
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
