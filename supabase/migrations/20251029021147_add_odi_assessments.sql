/*
  # ODI (Oswestry Disability Index) Assessments Schema

  1. New Tables
    - `odi_assessments`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, references patient_profiles)
      - `assessment_date` (date)
      - `pain_intensity` (integer, 0-5) - Section 1
      - `personal_care` (integer, 0-5) - Section 2
      - `lifting` (integer, 0-5) - Section 3
      - `walking` (integer, 0-5) - Section 4
      - `sitting` (integer, 0-5) - Section 5
      - `standing` (integer, 0-5) - Section 6
      - `sleeping` (integer, 0-5) - Section 7
      - `sex_life` (integer, 0-5) - Section 8
      - `social_life` (integer, 0-5) - Section 9
      - `traveling` (integer, 0-5) - Section 10
      - `total_score` (integer) - Sum of all sections
      - `percentage_score` (numeric) - (total/50)*100
      - `disability_level` (text) - minimal, moderate, severe, crippled, bed-bound
      - `created_at` (timestamptz)
  
  2. Updates
    - Add `odi_score` to proms_data for backward compatibility
  
  3. Security
    - Enable RLS on odi_assessments
    - Add policies for authenticated users to access their own data

  4. Notes
    - ODI scoring: 0-20% = minimal disability, 21-40% = moderate, 41-60% = severe,
      61-80% = crippled, 81-100% = bed-bound or exaggerating
    - Each section scored 0-5 (0=no disability, 5=maximum disability)
    - Total possible score: 50 points
    - Percentage = (total score / 50) × 100
*/

-- Create odi_assessments table
CREATE TABLE IF NOT EXISTS odi_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  assessment_date date NOT NULL DEFAULT CURRENT_DATE,
  pain_intensity integer CHECK (pain_intensity >= 0 AND pain_intensity <= 5),
  personal_care integer CHECK (personal_care >= 0 AND personal_care <= 5),
  lifting integer CHECK (lifting >= 0 AND lifting <= 5),
  walking integer CHECK (walking >= 0 AND walking <= 5),
  sitting integer CHECK (sitting >= 0 AND sitting <= 5),
  standing integer CHECK (standing >= 0 AND standing <= 5),
  sleeping integer CHECK (sleeping >= 0 AND sleeping <= 5),
  sex_life integer CHECK (sex_life >= 0 AND sex_life <= 5),
  social_life integer CHECK (social_life >= 0 AND social_life <= 5),
  traveling integer CHECK (traveling >= 0 AND traveling <= 5),
  total_score integer GENERATED ALWAYS AS (
    COALESCE(pain_intensity, 0) + 
    COALESCE(personal_care, 0) + 
    COALESCE(lifting, 0) + 
    COALESCE(walking, 0) + 
    COALESCE(sitting, 0) + 
    COALESCE(standing, 0) + 
    COALESCE(sleeping, 0) + 
    COALESCE(sex_life, 0) + 
    COALESCE(social_life, 0) + 
    COALESCE(traveling, 0)
  ) STORED,
  percentage_score numeric GENERATED ALWAYS AS (
    (COALESCE(pain_intensity, 0) + 
     COALESCE(personal_care, 0) + 
     COALESCE(lifting, 0) + 
     COALESCE(walking, 0) + 
     COALESCE(sitting, 0) + 
     COALESCE(standing, 0) + 
     COALESCE(sleeping, 0) + 
     COALESCE(sex_life, 0) + 
     COALESCE(social_life, 0) + 
     COALESCE(traveling, 0))::numeric / 50.0 * 100.0
  ) STORED,
  disability_level text GENERATED ALWAYS AS (
    CASE
      WHEN ((COALESCE(pain_intensity, 0) + COALESCE(personal_care, 0) + COALESCE(lifting, 0) + 
             COALESCE(walking, 0) + COALESCE(sitting, 0) + COALESCE(standing, 0) + 
             COALESCE(sleeping, 0) + COALESCE(sex_life, 0) + COALESCE(social_life, 0) + 
             COALESCE(traveling, 0))::numeric / 50.0 * 100.0) <= 20 THEN 'minimal'
      WHEN ((COALESCE(pain_intensity, 0) + COALESCE(personal_care, 0) + COALESCE(lifting, 0) + 
             COALESCE(walking, 0) + COALESCE(sitting, 0) + COALESCE(standing, 0) + 
             COALESCE(sleeping, 0) + COALESCE(sex_life, 0) + COALESCE(social_life, 0) + 
             COALESCE(traveling, 0))::numeric / 50.0 * 100.0) <= 40 THEN 'moderate'
      WHEN ((COALESCE(pain_intensity, 0) + COALESCE(personal_care, 0) + COALESCE(lifting, 0) + 
             COALESCE(walking, 0) + COALESCE(sitting, 0) + COALESCE(standing, 0) + 
             COALESCE(sleeping, 0) + COALESCE(sex_life, 0) + COALESCE(social_life, 0) + 
             COALESCE(traveling, 0))::numeric / 50.0 * 100.0) <= 60 THEN 'severe'
      WHEN ((COALESCE(pain_intensity, 0) + COALESCE(personal_care, 0) + COALESCE(lifting, 0) + 
             COALESCE(walking, 0) + COALESCE(sitting, 0) + COALESCE(standing, 0) + 
             COALESCE(sleeping, 0) + COALESCE(sex_life, 0) + COALESCE(social_life, 0) + 
             COALESCE(traveling, 0))::numeric / 50.0 * 100.0) <= 80 THEN 'crippled'
      ELSE 'bed_bound'
    END
  ) STORED,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE odi_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ODI assessments"
  ON odi_assessments FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "Users can insert own ODI assessments"
  ON odi_assessments FOR INSERT
  TO authenticated
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Users can update own ODI assessments"
  ON odi_assessments FOR UPDATE
  TO authenticated
  USING (patient_id = auth.uid())
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Users can delete own ODI assessments"
  ON odi_assessments FOR DELETE
  TO authenticated
  USING (patient_id = auth.uid());

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_odi_assessments_patient_date ON odi_assessments(patient_id, assessment_date DESC);

-- Add odi_score to proms_data for compatibility
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'proms_data' AND column_name = 'odi_score'
  ) THEN
    ALTER TABLE proms_data ADD COLUMN odi_score numeric;
  END IF;
END $$;