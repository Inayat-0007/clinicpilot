"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Edit2, Plus, RefreshCw, CreditCard, ExternalLink, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clinic, setClinic] = useState(null);
  
  // Working Hours State
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [workingHours, setWorkingHours] = useState([]);

  // Templates State
  const [templates, setTemplates] = useState([]);

  // Add Member State
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [newDoctorName, setNewDoctorName] = useState("");
  const [newDoctorSpec, setNewDoctorSpec] = useState("");
  const [addingDoctor, setAddingDoctor] = useState(false);

  // Edit Member State
  const [isEditDoctorOpen, setIsEditDoctorOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);

  const supabase = createClient();

  async function fetchSettings() {
    try {
      setLoading(true);
      const { data: clinicData, error: clinicErr } = await supabase.from('clinics').select('*').single();
      if (clinicErr) throw clinicErr;
      setClinic(clinicData);

      const { data: doctorsData, error: docErr } = await supabase.from('doctors').select('*');
      if (docErr) throw docErr;
      setDoctors(doctorsData);

      if (doctorsData.length > 0) {
        setSelectedDoctor(doctorsData[0].id);
        fetchWorkingHours(doctorsData[0].id);
      }

      const { data: templatesData, error: tplErr } = await supabase.from('message_templates').select('*');
      if (tplErr) throw tplErr;
      setTemplates(templatesData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  }

  const fetchWorkingHours = async (doctorId) => {
    const { data, error } = await supabase.from('working_hours').select('*').eq('doctor_id', doctorId).order('day_of_week');
    const existingData = (!error && data) ? data : [];
    
    const allDays = [0,1,2,3,4,5,6].map(day => {
      const existing = existingData.find(d => d.day_of_week === day);
      return existing || {
        doctor_id: doctorId,
        day_of_week: day,
        start_time: '09:00:00',
        end_time: '17:00:00',
        is_available: false,
        isNew: true
      };
    });
    setWorkingHours(allDays);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: clinic.name,
          phone: clinic.phone,
          address: clinic.address,
          logo_url: clinic.logo_url,
          brand_color: clinic.brand_color
        })
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success("Profile saved successfully!");
    } catch (error) {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleReminder = async (field, value) => {
    try {
      const res = await fetch('/api/settings/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });
      if (!res.ok) throw new Error('Failed to update');
      setClinic({ ...clinic, [field]: value });
      toast.success(`${field.replace(/_/g, ' ')} updated`);
    } catch (error) {
      toast.error(`Failed to update settings`);
    }
  };

  const handleSyncMeta = () => {
    toast.info("Meta Business API integration required to sync templates.");
  };

  const handleWorkingHoursSave = async () => {
    setSaving(true);
    try {
      const payload = workingHours.map(h => {
        const { isNew, ...rest } = h;
        return rest;
      });
      const res = await fetch('/api/settings/working-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success("Working hours saved!");
      fetchWorkingHours(selectedDoctor);
    } catch (error) {
      toast.error("Failed to save working hours");
    } finally {
      setSaving(false);
    }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    if (!newDoctorName.trim()) return;
    setAddingDoctor(true);
    try {
      const { data: clinicId } = await supabase.rpc('get_my_clinic_id');
      if (!clinicId) throw new Error("Could not find clinic ID");

      const { data, error } = await supabase.from('doctors').insert([{
        clinic_id: clinicId,
        name: newDoctorName.trim(),
        specialization: newDoctorSpec.trim() || 'General'
      }]).select().single();
        
      if (error) throw error;
      toast.success("Doctor added successfully");
      setDoctors([...doctors, data]);
      if (!selectedDoctor) {
        setSelectedDoctor(data.id);
        fetchWorkingHours(data.id);
      }
      setNewDoctorName("");
      setNewDoctorSpec("");
      setIsAddDoctorOpen(false);
    } catch (err) {
      toast.error(err.message || "Failed to add doctor");
    } finally {
      setAddingDoctor(false);
    }
  };

  const handleEditDoctorSubmit = async (e) => {
    e.preventDefault();
    if (!editingDoctor?.name.trim()) return;
    setAddingDoctor(true);
    try {
      const { data, error } = await supabase.from('doctors').update({
        name: editingDoctor.name.trim(),
        specialization: editingDoctor.specialization?.trim() || 'General'
      }).eq('id', editingDoctor.id).select().single();
        
      if (error) throw error;
      toast.success("Doctor updated successfully");
      setDoctors(doctors.map(d => d.id === data.id ? data : d));
      setIsEditDoctorOpen(false);
      setEditingDoctor(null);
    } catch (err) {
      toast.error(err.message || "Failed to update doctor");
    } finally {
      setAddingDoctor(false);
    }
  };

  const openEditModal = (doc) => {
    setEditingDoctor(doc);
    setIsEditDoctorOpen(true);
  };

  const handleUpgrade = async (planType) => {
    setSaving(true);
    try {
      const resLoad = await new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });

      if (!resLoad) throw new Error('Razorpay SDK failed to load. Are you online?');

      const res = await fetch('/api/payment/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initiate payment');

      const options = {
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: clinic.name,
        description: `${planType.toUpperCase()} Plan Subscription`,
        handler: function () {
          toast.success("Payment successful! Your plan is being activated.");
          fetchSettings();
        },
        prefill: { name: clinic.name, email: clinic.email || '', contact: clinic.phone || '' },
        theme: { color: clinic.brand_color || '#2563eb' }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        toast.error(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (error) {
      toast.error(error.message || "Failed to start upgrade process");
    } finally {
      setSaving(false);
    }
  };

  const handleManageBilling = () => {
    toast.info("Stripe/Razorpay customer portal integration required. Connecting shortly.");
  };

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 max-w-5xl mx-auto pb-12"
    >
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">Settings</h1>
        <p className="text-muted-foreground mt-2 text-lg">Manage your clinic preferences, billing, and automation.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-xl shadow-inner border border-slate-200">
          <TabsTrigger value="profile" className="rounded-lg">Clinic Profile</TabsTrigger>
          <TabsTrigger value="hours" className="rounded-lg">Working Hours</TabsTrigger>
          <TabsTrigger value="team" className="rounded-lg">Team & Doctors</TabsTrigger>
          <TabsTrigger value="templates" className="rounded-lg">Message Templates</TabsTrigger>
          <TabsTrigger value="billing" className="rounded-lg">Subscription</TabsTrigger>
        </TabsList>
        
        {/* PROFILE TAB */}
        <TabsContent value="profile" className="mt-8">
          <div className="grid gap-8 md:grid-cols-2">
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden backdrop-blur-xl bg-white/80">
                <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                  <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5 text-primary" /> Clinic Profile</CardTitle>
                  <CardDescription>Public information displayed to patients.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {clinic && (
                    <form onSubmit={handleProfileSave} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="clinicName" className="font-semibold text-slate-700">Clinic Name</Label>
                        <Input id="clinicName" className="rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-primary" value={clinic.name || ''} onChange={(e) => setClinic({...clinic, name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="font-semibold text-slate-700">Contact Phone</Label>
                        <Input id="phone" className="rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-primary" value={clinic.phone || ''} onChange={(e) => setClinic({...clinic, phone: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address" className="font-semibold text-slate-700">Address</Label>
                        <Input id="address" className="rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-primary" value={clinic.address || ''} onChange={(e) => setClinic({...clinic, address: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="logo_url" className="font-semibold text-slate-700">Logo URL (Optional)</Label>
                        <Input id="logo_url" className="rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-primary" placeholder="https://example.com/logo.png" value={clinic.logo_url || ''} onChange={(e) => setClinic({...clinic, logo_url: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="brand_color" className="font-semibold text-slate-700">Brand Color</Label>
                        <div className="flex gap-3 items-center">
                          <div className="relative overflow-hidden rounded-lg w-12 h-12 shadow-sm border border-slate-200 shrink-0">
                            <Input id="brand_color_picker" type="color" value={clinic.brand_color || '#2563eb'} onChange={(e) => setClinic({...clinic, brand_color: e.target.value})} className="absolute -inset-2 w-20 h-20 cursor-pointer" />
                          </div>
                          <Input id="brand_color" value={clinic.brand_color || '#2563eb'} onChange={(e) => setClinic({...clinic, brand_color: e.target.value})} className="flex-1 rounded-xl bg-slate-50 border-slate-200 font-mono" />
                        </div>
                      </div>
                      <Button type="submit" disabled={saving} className="w-full rounded-xl shadow-md mt-4 py-6 font-semibold">
                        {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                        Save Profile
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden backdrop-blur-xl bg-white/80">
                <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                  <CardTitle className="flex items-center gap-2"><RefreshCw className="w-5 h-5 text-primary" /> Automated Reminders</CardTitle>
                  <CardDescription>Configure how patients receive reminders.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="flex items-center justify-between space-x-4 p-4 rounded-xl border border-slate-100 bg-slate-50 shadow-sm transition-all hover:shadow-md">
                    <div className="flex flex-col space-y-1">
                      <Label className="text-base font-semibold text-slate-800">WhatsApp Reminders</Label>
                      <p className="text-sm text-slate-500">Send 24h & 2h reminders via Meta WhatsApp API.</p>
                    </div>
                    <Switch checked={clinic.whatsapp_reminders_enabled ?? true} onCheckedChange={(val) => handleToggleReminder('whatsapp_reminders_enabled', val)} className="data-[state=checked]:bg-green-500" />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-4 p-4 rounded-xl border border-slate-100 bg-slate-50 shadow-sm transition-all hover:shadow-md">
                    <div className="flex flex-col space-y-1">
                      <Label className="text-base font-semibold text-slate-800">SMS Fallback</Label>
                      <p className="text-sm text-slate-500">Send an SMS via Twilio if WhatsApp fails.</p>
                    </div>
                    <Switch checked={clinic.sms_reminders_enabled ?? true} onCheckedChange={(val) => handleToggleReminder('sms_reminders_enabled', val)} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* WORKING HOURS TAB */}
        <TabsContent value="hours" className="mt-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                <CardTitle>Working Hours</CardTitle>
                <CardDescription>Set available time slots for appointments.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {doctors.length > 1 && (
                  <div className="mb-6 space-y-2 max-w-sm">
                    <Label className="font-semibold text-slate-700">Select Doctor</Label>
                    <select 
                      className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                      value={selectedDoctor || ''}
                      onChange={(e) => { setSelectedDoctor(e.target.value); fetchWorkingHours(e.target.value); }}
                    >
                      {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.name}</option>)}
                    </select>
                  </div>
                )}
                
                <div className="grid gap-3">
                  {workingHours.map((wh, idx) => (
                    <motion.div 
                      key={idx} 
                      whileHover={{ scale: 1.01 }}
                      className={`flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 border p-4 rounded-xl transition-all ${wh.is_available ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-70'}`}
                    >
                      <div className="w-32 font-bold text-slate-700">{dayNames[wh.day_of_week]}</div>
                      <div className="flex items-center space-x-3 shrink-0">
                        <Switch checked={wh.is_available} onCheckedChange={(val) => {
                          const newWh = [...workingHours]; newWh[idx].is_available = val; setWorkingHours(newWh);
                        }} />
                        <span className={`text-sm font-semibold w-16 ${wh.is_available ? 'text-primary' : 'text-slate-400'}`}>
                          {wh.is_available ? "Open" : "Closed"}
                        </span>
                      </div>
                      <AnimatePresence>
                        {wh.is_available && (
                          <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} className="flex items-center space-x-3 overflow-hidden">
                            <Input type="time" className="rounded-lg bg-slate-50 w-32" value={wh.start_time.substring(0,5)} onChange={(e) => {
                              const newWh = [...workingHours]; newWh[idx].start_time = e.target.value + ':00'; setWorkingHours(newWh);
                            }} />
                            <span className="text-slate-400 font-medium">to</span>
                            <Input type="time" className="rounded-lg bg-slate-50 w-32" value={wh.end_time.substring(0,5)} onChange={(e) => {
                              const newWh = [...workingHours]; newWh[idx].end_time = e.target.value + ':00'; setWorkingHours(newWh);
                            }} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
                <Button onClick={handleWorkingHoursSave} disabled={saving} className="mt-6 rounded-xl shadow-md py-6 px-8 font-semibold">
                  {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  Save Working Hours
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* TEMPLATES TAB */}
        <TabsContent value="templates" className="mt-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                <CardTitle>WhatsApp Templates</CardTitle>
                <CardDescription>Manage your Meta-approved message templates.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {templates.length === 0 ? (
                  <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <p className="text-slate-500 mb-6 text-lg">No templates found. Create them in Meta Business Manager first, then sync here.</p>
                    <Button variant="default" className="rounded-xl shadow-md py-6 px-8 font-semibold" onClick={handleSyncMeta}>
                      <RefreshCw className="mr-2 h-5 w-5" /> Sync from Meta
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {templates.map(tpl => (
                      <div key={tpl.id} className="border border-slate-200 p-5 rounded-xl space-y-3 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-slate-800">{tpl.template_name}</h3>
                          <span className={`text-xs px-3 py-1 font-semibold rounded-full ${tpl.is_approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {tpl.is_approved ? 'Approved' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Type: {tpl.type} • Lang: {tpl.language}</p>
                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg text-sm whitespace-pre-wrap font-mono text-slate-600 leading-relaxed">
                          {tpl.body}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* TEAM TAB */}
        <TabsContent value="team" className="mt-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <CardTitle>Team & Doctors</CardTitle>
                    <CardDescription>Manage staff access and doctor profiles.</CardDescription>
                  </div>
                  <Dialog open={isAddDoctorOpen} onOpenChange={setIsAddDoctorOpen}>
                    <DialogTrigger render={<Button className="rounded-xl shadow-md"><Plus className="w-4 h-4 mr-2" /> Add Member</Button>} />
                    <DialogContent className="sm:max-w-[425px] rounded-2xl">
                      <form onSubmit={handleAddDoctor}>
                        <DialogHeader>
                          <DialogTitle className="text-xl">Add Doctor</DialogTitle>
                          <DialogDescription className="text-slate-500 text-sm">
                            Add a new doctor or staff member to your clinic.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-5 py-6">
                          <div className="grid gap-2">
                            <Label htmlFor="doc_name" className="font-semibold">Doctor Name *</Label>
                            <Input id="doc_name" className="rounded-xl bg-slate-50" value={newDoctorName} onChange={(e) => setNewDoctorName(e.target.value)} placeholder="Dr. John Doe" required />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="doc_spec" className="font-semibold">Specialization</Label>
                            <Input id="doc_spec" className="rounded-xl bg-slate-50" value={newDoctorSpec} onChange={(e) => setNewDoctorSpec(e.target.value)} placeholder="e.g. Dentist, General Physician" />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit" disabled={addingDoctor} className="w-full rounded-xl py-6 font-semibold">
                            {addingDoctor && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Doctor
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {doctors.map(d => (
                    <motion.div whileHover={{ y: -2 }} key={d.id} className="flex flex-col p-5 border border-slate-200 rounded-2xl bg-white shadow-sm hover:shadow-lg transition-all relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-bold text-lg text-slate-800">Dr. {d.name}</p>
                          <p className="text-sm font-medium text-slate-500">{d.specialization || 'General'}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(d)} className="rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Edit Doctor Dialog */}
          <Dialog open={isEditDoctorOpen} onOpenChange={setIsEditDoctorOpen}>
            <DialogContent className="sm:max-w-[425px] rounded-2xl">
              <form onSubmit={handleEditDoctorSubmit}>
                <DialogHeader>
                  <DialogTitle className="text-xl">Edit Doctor</DialogTitle>
                  <DialogDescription className="text-slate-500 text-sm">
                    Update the details of this doctor.
                  </DialogDescription>
                </DialogHeader>
                {editingDoctor && (
                  <div className="grid gap-5 py-6">
                    <div className="grid gap-2">
                      <Label htmlFor="edit_doc_name" className="font-semibold">Doctor Name *</Label>
                      <Input id="edit_doc_name" className="rounded-xl bg-slate-50" value={editingDoctor.name} onChange={(e) => setEditingDoctor({...editingDoctor, name: e.target.value})} required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit_doc_spec" className="font-semibold">Specialization</Label>
                      <Input id="edit_doc_spec" className="rounded-xl bg-slate-50" value={editingDoctor.specialization || ''} onChange={(e) => setEditingDoctor({...editingDoctor, specialization: e.target.value})} />
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button type="submit" disabled={addingDoctor} className="w-full rounded-xl py-6 font-semibold">
                    {addingDoctor && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* BILLING TAB */}
        <TabsContent value="billing" className="mt-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5" /> Subscription & Billing</CardTitle>
                <CardDescription className="text-slate-400">Manage your plan and payment methods.</CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                {clinic && (
                  <div className="space-y-8">
                    <div className="p-6 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md relative overflow-hidden">
                      <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
                      <h3 className="font-extrabold text-3xl capitalize tracking-tight">{clinic.subscription_plan || 'Trial'} Plan</h3>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <p className="text-slate-300 font-medium">Status: <span className="text-white font-bold capitalize">{clinic.subscription_status || 'active'}</span></p>
                      </div>
                      {clinic.subscription_status === 'active' && clinic.subscription_plan === 'trial' && clinic.trial_ends_at && (
                        <div className="mt-6 inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm font-semibold text-amber-400">
                          Your trial ends on {new Date(clinic.trial_ends_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-3">
                      <motion.div whileHover={{ y: -2 }} className="col-span-1">
                        <Button className="w-full h-auto py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/25 border-0 font-bold" onClick={() => handleUpgrade('starter')} disabled={saving}>
                          Upgrade to Starter
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ y: -2 }} className="col-span-1">
                        <Button className="w-full h-auto py-4 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white shadow-lg shadow-violet-500/25 border-0 font-bold" onClick={() => handleUpgrade('growth')} disabled={saving}>
                          Upgrade to Growth
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ y: -2 }} className="col-span-1">
                        <Button variant="outline" className="w-full h-auto py-4 rounded-xl border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold" onClick={handleManageBilling}>
                          Manage Portal <ExternalLink className="w-4 h-4 ml-2 opacity-70" />
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
