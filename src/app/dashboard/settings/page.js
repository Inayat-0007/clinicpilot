"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

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

  const supabase = createClient();

  async function fetchSettings() {
    try {
      setLoading(true);
      // Get clinic
      const { data: clinicData, error: clinicErr } = await supabase
        .from('clinics')
        .select('*')
        .single();
      
      if (clinicErr) throw clinicErr;
      setClinic(clinicData);

      // Get doctors
      const { data: doctorsData, error: docErr } = await supabase
        .from('doctors')
        .select('*');
      
      if (docErr) throw docErr;
      setDoctors(doctorsData);

      if (doctorsData.length > 0) {
        setSelectedDoctor(doctorsData[0].id);
        fetchWorkingHours(doctorsData[0].id);
      }

      // Get templates
      const { data: templatesData, error: tplErr } = await supabase
        .from('message_templates')
        .select('*');
      
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
    const { data, error } = await supabase
      .from('working_hours')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('day_of_week');
    
    if (!error && data) {
      // Pad missing days
      const allDays = [0,1,2,3,4,5,6].map(day => {
        const existing = data.find(d => d.day_of_week === day);
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
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('clinics')
        .update({
          name: clinic.name,
          phone: clinic.phone,
          address: clinic.address,
          logo_url: clinic.logo_url,
          brand_color: clinic.brand_color
        })
        .eq('id', clinic.id);
      
      if (error) throw error;
      toast.success("Profile saved successfully!");
    } catch (error) {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleReminder = async (field, value) => {
    try {
      const { error } = await supabase
        .from('clinics')
        .update({ [field]: value })
        .eq('id', clinic.id);
      
      if (error) throw error;
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
      // Split into insert and update
      const toInsert = workingHours.filter(h => h.isNew).map(h => {
        const { isNew, ...rest } = h;
        return rest;
      });
      const toUpdate = workingHours.filter(h => !h.isNew);

      if (toInsert.length > 0) {
        const { error } = await supabase.from('working_hours').insert(toInsert);
        if (error) throw error;
      }
      
      for (const hw of toUpdate) {
        const { error } = await supabase
          .from('working_hours')
          .update({
            start_time: hw.start_time,
            end_time: hw.end_time,
            is_available: hw.is_available
          })
          .eq('id', hw.id);
        if (error) throw error;
      }

      toast.success("Working hours saved!");
      fetchWorkingHours(selectedDoctor);
    } catch (error) {
      toast.error("Failed to save working hours");
    } finally {
      setSaving(false);
    }
  };

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your clinic preferences and automation.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Clinic Profile</TabsTrigger>
          <TabsTrigger value="hours">Working Hours</TabsTrigger>
          <TabsTrigger value="team">Team & Doctors</TabsTrigger>
          <TabsTrigger value="templates">Message Templates</TabsTrigger>
          <TabsTrigger value="billing">Subscription</TabsTrigger>
        </TabsList>
        
        {/* PROFILE TAB */}
        <TabsContent value="profile" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Clinic Profile</CardTitle>
                <CardDescription>Public information displayed to patients.</CardDescription>
              </CardHeader>
              <CardContent>
                {clinic && (
                  <form onSubmit={handleProfileSave} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="clinicName">Clinic Name</Label>
                      <Input 
                        id="clinicName" 
                        value={clinic.name || ''} 
                        onChange={(e) => setClinic({...clinic, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Contact Phone</Label>
                      <Input 
                        id="phone" 
                        value={clinic.phone || ''} 
                        onChange={(e) => setClinic({...clinic, phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input 
                        id="address" 
                        value={clinic.address || ''} 
                        onChange={(e) => setClinic({...clinic, address: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="logo_url">Logo URL (Optional)</Label>
                      <Input 
                        id="logo_url" 
                        placeholder="https://example.com/logo.png"
                        value={clinic.logo_url || ''} 
                        onChange={(e) => setClinic({...clinic, logo_url: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brand_color">Brand Color</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="brand_color_picker" 
                          type="color"
                          value={clinic.brand_color || '#2563eb'} 
                          onChange={(e) => setClinic({...clinic, brand_color: e.target.value})}
                          className="w-12 h-10 p-1"
                        />
                        <Input 
                          id="brand_color" 
                          value={clinic.brand_color || '#2563eb'} 
                          onChange={(e) => setClinic({...clinic, brand_color: e.target.value})}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <Button type="submit" disabled={saving}>
                      {saving ? "Saving..." : "Save Profile"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Automated Reminders</CardTitle>
                <CardDescription>Configure how patients receive reminders.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex flex-col space-y-1">
                    <Label>WhatsApp Reminders</Label>
                    <p className="text-sm text-muted-foreground">Send 24h & 2h reminders via Meta WhatsApp API.</p>
                  </div>
                  <Switch 
                    checked={clinic.whatsapp_reminders_enabled ?? true} 
                    onCheckedChange={(val) => handleToggleReminder('whatsapp_reminders_enabled', val)} 
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex flex-col space-y-1">
                    <Label>SMS Fallback</Label>
                    <p className="text-sm text-muted-foreground">Send an SMS via Twilio if WhatsApp delivery fails.</p>
                  </div>
                  <Switch 
                    checked={clinic.sms_reminders_enabled ?? true} 
                    onCheckedChange={(val) => handleToggleReminder('sms_reminders_enabled', val)} 
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* WORKING HOURS TAB */}
        <TabsContent value="hours" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Working Hours</CardTitle>
              <CardDescription>Set available time slots for appointments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {doctors.length > 1 && (
                <div className="mb-4 space-y-2 max-w-sm">
                  <Label>Select Doctor</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={selectedDoctor || ''}
                    onChange={(e) => {
                      setSelectedDoctor(e.target.value);
                      fetchWorkingHours(e.target.value);
                    }}
                  >
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              )}
              
              <div className="space-y-4">
                {workingHours.map((wh, idx) => (
                  <div key={idx} className="flex items-center space-x-4 border p-4 rounded-md">
                    <div className="w-32 font-medium">{dayNames[wh.day_of_week]}</div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={wh.is_available} 
                        onCheckedChange={(val) => {
                          const newWh = [...workingHours];
                          newWh[idx].is_available = val;
                          setWorkingHours(newWh);
                        }} 
                      />
                      <span className="text-sm text-muted-foreground w-16">
                        {wh.is_available ? "Open" : "Closed"}
                      </span>
                    </div>
                    {wh.is_available && (
                      <div className="flex items-center space-x-2">
                        <Input 
                          type="time" 
                          value={wh.start_time.substring(0,5)} 
                          onChange={(e) => {
                            const newWh = [...workingHours];
                            newWh[idx].start_time = e.target.value + ':00';
                            setWorkingHours(newWh);
                          }}
                        />
                        <span>to</span>
                        <Input 
                          type="time" 
                          value={wh.end_time.substring(0,5)} 
                          onChange={(e) => {
                            const newWh = [...workingHours];
                            newWh[idx].end_time = e.target.value + ':00';
                            setWorkingHours(newWh);
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <Button onClick={handleWorkingHoursSave} disabled={saving} className="mt-4">
                {saving ? "Saving..." : "Save Working Hours"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TEMPLATES TAB */}
        <TabsContent value="templates" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Templates</CardTitle>
              <CardDescription>Manage your Meta-approved message templates.</CardDescription>
            </CardHeader>
            <CardContent>
              {templates.length === 0 ? (
                <div className="text-center p-8 border rounded-md bg-muted/50">
                  <p className="text-muted-foreground mb-4">No templates found. They must be created in Meta Business Manager first, then synced here.</p>
                  <Button variant="outline" onClick={handleSyncMeta}>Sync from Meta</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {templates.map(tpl => (
                    <div key={tpl.id} className="border p-4 rounded-md space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{tpl.template_name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${tpl.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {tpl.is_approved ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">Type: {tpl.type} | Language: {tpl.language}</p>
                      <div className="bg-muted p-3 rounded-md text-sm whitespace-pre-wrap font-mono">
                        {tpl.body}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TEAM TAB */}
        <TabsContent value="team" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Team & Doctors</CardTitle>
                  <CardDescription>Manage staff access and doctor profiles.</CardDescription>
                </div>
                <Button size="sm">Add Member</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {doctors.map(d => (
                  <div key={d.id} className="flex items-center justify-between p-4 border rounded-md">
                    <div>
                      <p className="font-medium">Dr. {d.name}</p>
                      <p className="text-sm text-muted-foreground">{d.specialization || 'General'}</p>
                    </div>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BILLING TAB */}
        <TabsContent value="billing" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription & Billing</CardTitle>
              <CardDescription>Manage your plan and payment methods.</CardDescription>
            </CardHeader>
            <CardContent>
              {clinic && (
                <div className="space-y-4">
                  <div className="p-4 border rounded-md bg-muted/20">
                    <h3 className="font-semibold text-lg capitalize">{clinic.subscription_plan} Plan</h3>
                    <p className="text-sm text-muted-foreground">Status: <span className="font-medium capitalize">{clinic.subscription_status}</span></p>
                    {clinic.subscription_status === 'active' && clinic.subscription_plan === 'trial' && (
                      <p className="text-sm text-amber-600 mt-2 font-medium">Your trial ends on {new Date(clinic.trial_ends_at).toLocaleDateString()}</p>
                    )}
                  </div>
                  <div>
                    <Button variant="default">Upgrade Plan</Button>
                    <Button variant="outline" className="ml-2">Manage Billing Portal</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
