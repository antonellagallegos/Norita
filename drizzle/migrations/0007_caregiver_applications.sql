-- Caregiver applications from /cuidadores. A table of its own: applications are never mixed with family
-- leads, never reach the CRM outbox and have their own privacy version. The form collects no identity
-- documents, health data or free text; option keys are validated by the server (src/lib/caregiver-fields.ts)
-- and constrained here as defense in depth. Only the service role writes, through the validated server
-- function; anon and authenticated get no privileges until an applications panel is designed.
CREATE TABLE public.caregiver_applications (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), created_at timestamptz NOT NULL DEFAULT now(),
 name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100), phone text NOT NULL CHECK (phone ~ '^[0-9]{7,15}$'),
 country text NOT NULL CHECK (country IN ('PE','CO')), city text NOT NULL CHECK (char_length(city) BETWEEN 1 AND 100), district text NOT NULL CHECK (char_length(district) BETWEEN 1 AND 100),
 experience_years text NOT NULL CHECK (experience_years IN ('none','lt1','1to3','3to5','gt5')),
 experience_types text[] NOT NULL DEFAULT '{}' CHECK (experience_types <@ ARRAY['family','private','institution','volunteer']::text[]),
 training text[] NOT NULL CHECK (cardinality(training) >= 1 AND training <@ ARRAY['nursing_technician','certified_caregiver','first_aid','physical_therapy','other','none']::text[]),
 availability_days text[] NOT NULL CHECK (cardinality(availability_days) >= 1 AND availability_days <@ ARRAY['weekdays','saturday','sunday']::text[]),
 availability_slots text[] NOT NULL CHECK (cardinality(availability_slots) >= 1 AND availability_slots <@ ARRAY['morning','afternoon','evening','night']::text[]),
 services text[] NOT NULL CHECK (cardinality(services) >= 1 AND services <@ ARRAY['Acompañamiento a citas médicas','Neuroestimulación / Gimnasio Mental','Entrenamiento de fuerza','Recogida de medicamentos','Acompañamiento fines de semana']::text[]),
 adult_confirmed boolean NOT NULL CHECK (adult_confirmed), consent_processing boolean NOT NULL CHECK (consent_processing), processing_timestamp timestamptz NOT NULL DEFAULT now(),
 consent_talent_pool boolean NOT NULL DEFAULT false, talent_pool_timestamp timestamptz, privacy_version text NOT NULL CHECK (char_length(privacy_version) BETWEEN 1 AND 40),
 submission_id uuid NOT NULL UNIQUE, duplicate_of uuid REFERENCES public.caregiver_applications(id) ON DELETE SET NULL,
 status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','reviewing','interview','onboarding','active','not_selected','withdrawn')),
 source text NOT NULL DEFAULT 'website' CHECK (source IN ('website')),
 CONSTRAINT caregiver_talent_pool_timestamp CHECK (consent_talent_pool = (talent_pool_timestamp IS NOT NULL))
);
ALTER TABLE public.caregiver_applications ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.caregiver_applications FROM anon, authenticated;
GRANT ALL ON public.caregiver_applications TO service_role;
CREATE INDEX caregiver_applications_created_idx ON public.caregiver_applications(created_at DESC);
CREATE INDEX caregiver_applications_phone_idx ON public.caregiver_applications(phone);
