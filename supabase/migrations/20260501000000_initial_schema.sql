CREATE TABLE IF NOT EXISTS clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    phone TEXT, email TEXT, address TEXT,
    timezone TEXT DEFAULT 'Asia/Kolkata',
    default_language TEXT DEFAULT 'en',
    whatsapp_phone_id TEXT,
    subscription_plan TEXT DEFAULT 'trial',
    subscription_status TEXT DEFAULT 'active',
    razorpay_subscription_id TEXT,
    trial_ends_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '14 days',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner','doctor','receptionist')),
    phone TEXT, is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES staff(id),
    name TEXT NOT NULL, specialization TEXT,
    consultation_duration_min INT DEFAULT 15,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS working_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL, end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    name TEXT NOT NULL, phone TEXT NOT NULL, email TEXT,
    preferred_language TEXT DEFAULT 'en',
    has_whatsapp BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(clinic_id, phone)
);

CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id),
    patient_id UUID REFERENCES patients(id),
    starts_at TIMESTAMPTZ NOT NULL, ends_at TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'confirmed'
        CHECK (status IN ('confirmed','cancelled','completed','no_show','rescheduled')),
    reschedule_token TEXT UNIQUE,
    notes TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    channel TEXT NOT NULL CHECK (channel IN ('whatsapp','sms','email')),
    type TEXT NOT NULL CHECK (type IN ('24h_before','2h_before','confirmation','reschedule')),
    status TEXT DEFAULT 'pending'
        CHECK (status IN ('pending','sent','delivered','read','failed')),
    sent_at TIMESTAMPTZ, meta_message_id TEXT, error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    type TEXT NOT NULL, language TEXT NOT NULL DEFAULT 'en',
    template_name TEXT NOT NULL, body TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(clinic_id, type, language)
);

CREATE INDEX IF NOT EXISTS idx_appointments_starts_at ON appointments(starts_at);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_status ON appointments(clinic_id, status);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status, type);
CREATE INDEX IF NOT EXISTS idx_patients_clinic_phone ON patients(clinic_id, phone);
