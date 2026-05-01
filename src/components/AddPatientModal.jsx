"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export function AddPatientModal({ onPatientAdded }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    preferred_language: "en",
    has_whatsapp: true,
  });

  const supabase = createClient();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLanguageChange = (value) => {
    setFormData((prev) => ({ ...prev, preferred_language: value }));
  };

  const handleWhatsAppChange = (checked) => {
    setFormData((prev) => ({ ...prev, has_whatsapp: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get the clinic ID
      const { data: clinicId, error: rpcError } = await supabase.rpc('get_my_clinic_id');
      
      if (rpcError) throw rpcError;
      if (!clinicId) throw new Error("Could not determine your clinic workspace.");

      // Insert patient
      const { data, error } = await supabase
        .from("patients")
        .insert([{ ...formData, clinic_id: clinicId }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique violation
          throw new Error("A patient with this phone number already exists.");
        }
        throw error;
      }

      toast.success("Patient added successfully");
      setOpen(false);
      setFormData({ name: "", phone: "", email: "", preferred_language: "en", has_whatsapp: true });
      if (onPatientAdded) onPatientAdded(data);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to add patient");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shrink-0">
          <UserPlus className="w-4 h-4 mr-2" /> Add Patient
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
            <DialogDescription>
              Enter the patient's details below to add them to your directory.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Ramesh Kumar" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required placeholder="+919876543210" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="ramesh@example.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="language">Preferred Language</Label>
              <Select value={formData.preferred_language} onValueChange={handleLanguageChange}>
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="mr">Marathi</SelectItem>
                  <SelectItem value="gu">Gujarati</SelectItem>
                  <SelectItem value="ta">Tamil</SelectItem>
                  <SelectItem value="te">Telugu</SelectItem>
                  <SelectItem value="kn">Kannada</SelectItem>
                  <SelectItem value="bn">Bengali</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="space-y-0.5">
                <Label htmlFor="whatsapp">WhatsApp Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive reminders on WhatsApp</p>
              </div>
              <Switch id="whatsapp" checked={formData.has_whatsapp} onCheckedChange={handleWhatsAppChange} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Patient
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
