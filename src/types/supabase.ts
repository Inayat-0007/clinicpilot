export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          clinic_id: string | null
          created_at: string | null
          deleted_at: string | null
          doctor_id: string | null
          ends_at: string
          id: string
          notes: string | null
          patient_id: string | null
          reschedule_token: string | null
          reschedule_token_expires_at: string | null
          starts_at: string
          status: string | null
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          doctor_id?: string | null
          ends_at: string
          id?: string
          notes?: string | null
          patient_id?: string | null
          reschedule_token?: string | null
          reschedule_token_expires_at?: string | null
          starts_at: string
          status?: string | null
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          doctor_id?: string | null
          ends_at?: string
          id?: string
          notes?: string | null
          patient_id?: string | null
          reschedule_token?: string | null
          reschedule_token_expires_at?: string | null
          starts_at?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "active_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          address: string | null
          created_at: string | null
          default_language: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          razorpay_subscription_id: string | null
          slug: string
          subscription_plan: string | null
          subscription_status: string | null
          timezone: string | null
          trial_ends_at: string | null
          whatsapp_phone_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          default_language?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          razorpay_subscription_id?: string | null
          slug: string
          subscription_plan?: string | null
          subscription_status?: string | null
          timezone?: string | null
          trial_ends_at?: string | null
          whatsapp_phone_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          default_language?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          razorpay_subscription_id?: string | null
          slug?: string
          subscription_plan?: string | null
          subscription_status?: string | null
          timezone?: string | null
          trial_ends_at?: string | null
          whatsapp_phone_id?: string | null
        }
        Relationships: []
      }
      data_deletion_requests: {
        Row: {
          clinic_id: string | null
          completed_at: string | null
          id: string
          patient_phone_hash: string
          requested_at: string | null
          status: string | null
        }
        Insert: {
          clinic_id?: string | null
          completed_at?: string | null
          id?: string
          patient_phone_hash: string
          requested_at?: string | null
          status?: string | null
        }
        Update: {
          clinic_id?: string | null
          completed_at?: string | null
          id?: string
          patient_phone_hash?: string
          requested_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_deletion_requests_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          clinic_id: string | null
          consultation_duration_min: number | null
          created_at: string | null
          id: string
          name: string
          specialization: string | null
          staff_id: string | null
        }
        Insert: {
          clinic_id?: string | null
          consultation_duration_min?: number | null
          created_at?: string | null
          id?: string
          name: string
          specialization?: string | null
          staff_id?: string | null
        }
        Update: {
          clinic_id?: string | null
          consultation_duration_min?: number | null
          created_at?: string | null
          id?: string
          name?: string
          specialization?: string | null
          staff_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctors_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctors_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          body: string
          clinic_id: string | null
          created_at: string | null
          id: string
          is_approved: boolean | null
          language: string
          template_name: string
          type: string
        }
        Insert: {
          body: string
          clinic_id?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          language?: string
          template_name: string
          type: string
        }
        Update: {
          body?: string
          clinic_id?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          language?: string
          template_name?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          clinic_id: string | null
          consent_given_at: string | null
          consent_source: string | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          has_whatsapp: boolean | null
          id: string
          name: string
          phone: string
          preferred_language: string | null
        }
        Insert: {
          clinic_id?: string | null
          consent_given_at?: string | null
          consent_source?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          has_whatsapp?: boolean | null
          id?: string
          name: string
          phone: string
          preferred_language?: string | null
        }
        Update: {
          clinic_id?: string | null
          consent_given_at?: string | null
          consent_source?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          has_whatsapp?: boolean | null
          id?: string
          name?: string
          phone?: string
          preferred_language?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          appointment_id: string | null
          channel: string
          created_at: string | null
          error_message: string | null
          id: string
          meta_message_id: string | null
          sent_at: string | null
          status: string | null
          type: string
        }
        Insert: {
          appointment_id?: string | null
          channel: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          meta_message_id?: string | null
          sent_at?: string | null
          status?: string | null
          type: string
        }
        Update: {
          appointment_id?: string | null
          channel?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          meta_message_id?: string | null
          sent_at?: string | null
          status?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "active_appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          clinic_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          role: string
          user_id: string | null
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          role: string
          user_id?: string | null
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      working_hours: {
        Row: {
          day_of_week: number
          doctor_id: string | null
          end_time: string
          id: string
          is_available: boolean | null
          start_time: string
        }
        Insert: {
          day_of_week: number
          doctor_id?: string | null
          end_time: string
          id?: string
          is_available?: boolean | null
          start_time: string
        }
        Update: {
          day_of_week?: number
          doctor_id?: string | null
          end_time?: string
          id?: string
          is_available?: boolean | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "working_hours_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      active_appointments: {
        Row: {
          clinic_id: string | null
          created_at: string | null
          deleted_at: string | null
          doctor_id: string | null
          ends_at: string | null
          id: string | null
          notes: string | null
          patient_id: string | null
          reschedule_token: string | null
          reschedule_token_expires_at: string | null
          starts_at: string | null
          status: string | null
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          doctor_id?: string | null
          ends_at?: string | null
          id?: string | null
          notes?: string | null
          patient_id?: string | null
          reschedule_token?: string | null
          reschedule_token_expires_at?: string | null
          starts_at?: string | null
          status?: string | null
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          doctor_id?: string | null
          ends_at?: string | null
          id?: string | null
          notes?: string | null
          patient_id?: string | null
          reschedule_token?: string | null
          reschedule_token_expires_at?: string | null
          starts_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "active_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      active_patients: {
        Row: {
          clinic_id: string | null
          consent_given_at: string | null
          consent_source: string | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          has_whatsapp: boolean | null
          id: string | null
          name: string | null
          phone: string | null
          preferred_language: string | null
        }
        Insert: {
          clinic_id?: string | null
          consent_given_at?: string | null
          consent_source?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          has_whatsapp?: boolean | null
          id?: string | null
          name?: string | null
          phone?: string | null
          preferred_language?: string | null
        }
        Update: {
          clinic_id?: string | null
          consent_given_at?: string | null
          consent_source?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          has_whatsapp?: boolean | null
          id?: string | null
          name?: string | null
          phone?: string | null
          preferred_language?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_my_clinic_id: { Args: never; Returns: string }
      get_my_role: { Args: never; Returns: string }
      setup_clinic_workspace: {
        Args: { p_clinic_name: string; p_slug: string; p_user_id: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
