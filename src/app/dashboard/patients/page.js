"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Search, MessageSquare, Phone } from "lucide-react";
import { AddPatientModal } from "@/components/AddPatientModal";

export default function PatientsPage() {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function fetchPatients() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('patients')
          .select(`
            *,
            appointments:appointments(count)
          `)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setPatients(data || []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load patients");
      } finally {
        setLoading(false);
      }
    }
    
    fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Directory</h1>
          <p className="text-muted-foreground">Manage your patients and view their history.</p>
        </div>
        <AddPatientModal onPatientAdded={(newPatient) => setPatients(prev => [newPatient, ...prev])} />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or phone..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center p-12 border border-dashed rounded-lg">
              <p className="text-muted-foreground">No patients found.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 font-medium">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Language</th>
                    <th className="px-4 py-3">WhatsApp</th>
                    <th className="px-4 py-3 text-right">Appointments</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-medium">{patient.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          {patient.phone}
                        </div>
                      </td>
                      <td className="px-4 py-3 uppercase text-xs font-semibold">{patient.preferred_language}</td>
                      <td className="px-4 py-3">
                        {patient.has_whatsapp ? (
                          <span className="flex items-center gap-1 text-green-600 text-xs font-medium bg-green-50 w-fit px-2 py-1 rounded-full">
                            <MessageSquare className="w-3 h-3" /> Yes
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {patient.appointments?.[0]?.count || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
