/*
  # Provider Referral System Schema

  1. New Tables
    - `healthcare_providers`
      - `id` (uuid, primary key)
      - `provider_name` (text)
      - `specialty` (text) - orthopedic_surgeon, physical_therapist, pain_specialist, etc.
      - `practice_name` (text)
      - `phone_number` (text)
      - `email` (text)
      - `address` (text)
      - `city` (text)
      - `state` (text)
      - `zip_code` (text)
      - `website_url` (text)
      - `accepts_new_patients` (boolean)
      - `insurance_accepted` (text[]) - array of insurance providers
      - `languages_spoken` (text[])
      - `subspecialty` (text) - spine, hip, knee, shoulder, etc.
      - `notes` (text)
      - `created_at` (timestamptz)
    
    - `patient_referrals`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, references patient_profiles)
      - `provider_id` (uuid, references healthcare_providers)
      - `referral_date` (date)
      - `referral_reason` (text)
      - `status` (text) - pending, scheduled, completed, cancelled
      - `appointment_date` (date, nullable)
      - `notes` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Providers table: public read access for authenticated users
    - Referrals table: patients can only access their own referrals

  3. Sample Data
    - Prepopulate with common orthopedic specialists
*/

-- Create healthcare_providers table
CREATE TABLE IF NOT EXISTS healthcare_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name text NOT NULL,
  specialty text NOT NULL CHECK (specialty IN (
    'orthopedic_surgeon',
    'physical_therapist',
    'pain_specialist',
    'sports_medicine',
    'neurosurgeon',
    'rheumatologist',
    'chiropractor',
    'acupuncturist',
    'massage_therapist',
    'occupational_therapist'
  )),
  practice_name text NOT NULL,
  phone_number text NOT NULL,
  email text,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,
  website_url text,
  accepts_new_patients boolean DEFAULT true,
  insurance_accepted text[] DEFAULT '{}',
  languages_spoken text[] DEFAULT ARRAY['English'],
  subspecialty text,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE healthcare_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all providers"
  ON healthcare_providers FOR SELECT
  TO authenticated
  USING (true);

-- Create patient_referrals table
CREATE TABLE IF NOT EXISTS patient_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES healthcare_providers(id) ON DELETE CASCADE,
  referral_date date NOT NULL DEFAULT CURRENT_DATE,
  referral_reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled')),
  appointment_date date,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE patient_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals"
  ON patient_referrals FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "Users can insert own referrals"
  ON patient_referrals FOR INSERT
  TO authenticated
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Users can update own referrals"
  ON patient_referrals FOR UPDATE
  TO authenticated
  USING (patient_id = auth.uid())
  WITH CHECK (patient_id = auth.uid());

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_providers_specialty ON healthcare_providers(specialty);
CREATE INDEX IF NOT EXISTS idx_providers_city ON healthcare_providers(city, state);
CREATE INDEX IF NOT EXISTS idx_referrals_patient ON patient_referrals(patient_id, referral_date DESC);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON patient_referrals(patient_id, status);

-- Insert sample provider data
INSERT INTO healthcare_providers (provider_name, specialty, practice_name, phone_number, email, address, city, state, zip_code, subspecialty, insurance_accepted, website_url) VALUES
  ('Dr. Sarah Mitchell', 'orthopedic_surgeon', 'Advanced Spine Institute', '(555) 123-4567', 'info@advancedspine.com', '123 Medical Plaza', 'San Francisco', 'CA', '94102', 'spine', ARRAY['Blue Cross', 'Aetna', 'UnitedHealthcare', 'Medicare'], 'https://advancedspine.com'),
  ('Dr. James Chen', 'orthopedic_surgeon', 'Bay Area Orthopedics', '(555) 234-5678', 'contact@bayortho.com', '456 Healthcare Blvd', 'Oakland', 'CA', '94612', 'knee', ARRAY['Blue Cross', 'Cigna', 'Medicare'], 'https://bayortho.com'),
  ('Dr. Maria Rodriguez', 'physical_therapist', 'Peak Performance PT', '(555) 345-6789', 'appointments@peakpt.com', '789 Wellness Way', 'Berkeley', 'CA', '94704', 'spine', ARRAY['Most major insurance'], 'https://peakpt.com'),
  ('Dr. Robert Anderson', 'pain_specialist', 'Comprehensive Pain Management', '(555) 456-7890', 'info@painmgmt.com', '321 Care Center Dr', 'San Francisco', 'CA', '94103', NULL, ARRAY['Blue Cross', 'Aetna', 'UnitedHealthcare'], 'https://painmgmt.com'),
  ('Dr. Lisa Thompson', 'physical_therapist', 'Thompson Physical Therapy', '(555) 567-8901', 'lisa@thompsonpt.com', '654 Recovery Rd', 'San Jose', 'CA', '95110', 'sports_rehab', ARRAY['Most major insurance'], 'https://thompsonpt.com'),
  ('Dr. Michael Wu', 'neurosurgeon', 'Pacific Neurosurgery Group', '(555) 678-9012', 'contact@pacificneuro.com', '987 Medical Center', 'Palo Alto', 'CA', '94301', 'spine', ARRAY['Blue Cross', 'Aetna', 'Cigna', 'Medicare'], 'https://pacificneuro.com'),
  ('Dr. Jennifer Lee', 'sports_medicine', 'Elite Sports Medicine', '(555) 789-0123', 'info@elitesports.com', '147 Athlete Ave', 'San Francisco', 'CA', '94105', 'spine', ARRAY['Blue Cross', 'UnitedHealthcare'], 'https://elitesports.com'),
  ('Dr. David Martinez', 'chiropractor', 'Optimal Spine Chiropractic', '(555) 890-1234', 'care@optimalspine.com', '258 Wellness St', 'Fremont', 'CA', '94538', 'spine', ARRAY['Most major insurance', 'Cash pay'], 'https://optimalspine.com'),
  ('Dr. Emily Park', 'physical_therapist', 'Restore Physical Therapy', '(555) 901-2345', 'hello@restorept.com', '369 Healing Lane', 'San Mateo', 'CA', '94402', 'post_surgical', ARRAY['Most major insurance'], 'https://restorept.com'),
  ('Dr. Thomas Brown', 'pain_specialist', 'Interventional Pain Solutions', '(555) 012-3456', 'info@painsolutions.com', '741 Medical Park', 'San Francisco', 'CA', '94107', 'spine', ARRAY['Blue Cross', 'Aetna', 'UnitedHealthcare', 'Medicare'], 'https://painsolutions.com')
ON CONFLICT DO NOTHING;