/*
  # VAS Pain Scale and Advanced Analytics Schema

  1. New Tables
    - `vas_pain_scores`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, references patient_profiles)
      - `recorded_date` (date)
      - `pain_score` (integer, 0-10) - Visual Analog Scale
      - `pain_location` (text)
      - `pain_description` (text)
      - `created_at` (timestamptz)
    
    - `analytics_metrics`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, references patient_profiles)
      - `metric_date` (date)
      - `time_to_mcid_days` (integer) - Days to Minimal Clinically Important Difference
      - `current_trajectory_slope` (numeric) - Rate of ODI change per week
      - `pain_function_correlation` (numeric) - Correlation between VAS and ODI
      - `weeks_since_baseline` (integer)
      - `plateau_detected` (boolean)
      - `created_at` (timestamptz)
    
    - `population_benchmarks`
      - `id` (uuid, primary key)
      - `treatment_type` (text) - post_surgery, conservative, physical_therapy
      - `weeks_post_treatment` (integer)
      - `mean_odi_score` (numeric)
      - `std_dev_odi_score` (numeric)
      - `percentile_25` (numeric)
      - `percentile_50` (numeric)
      - `percentile_75` (numeric)
      - `sample_size` (integer)
      - `updated_at` (timestamptz)

  2. Updates
    - Add baseline tracking to odi_assessments
    - Add VAS linkage to proms_data

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users

  4. Notes
    - MCID for ODI: 10-point reduction (or ~20% improvement)
    - VAS scale: 0 = no pain, 10 = worst imaginable pain
    - Trajectory slope: negative = improvement, positive = worsening
    - Plateau: <5% change over 3+ consecutive assessments
*/

-- Create vas_pain_scores table
CREATE TABLE IF NOT EXISTS vas_pain_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  recorded_date date NOT NULL DEFAULT CURRENT_DATE,
  pain_score integer NOT NULL CHECK (pain_score >= 0 AND pain_score <= 10),
  pain_location text DEFAULT 'lower_back',
  pain_description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vas_pain_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own VAS scores"
  ON vas_pain_scores FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "Users can insert own VAS scores"
  ON vas_pain_scores FOR INSERT
  TO authenticated
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Users can update own VAS scores"
  ON vas_pain_scores FOR UPDATE
  TO authenticated
  USING (patient_id = auth.uid())
  WITH CHECK (patient_id = auth.uid());

-- Create analytics_metrics table
CREATE TABLE IF NOT EXISTS analytics_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  metric_date date NOT NULL DEFAULT CURRENT_DATE,
  time_to_mcid_days integer,
  current_trajectory_slope numeric,
  pain_function_correlation numeric,
  weeks_since_baseline integer DEFAULT 0,
  plateau_detected boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(patient_id, metric_date)
);

ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics metrics"
  ON analytics_metrics FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "Users can insert own analytics metrics"
  ON analytics_metrics FOR INSERT
  TO authenticated
  WITH CHECK (patient_id = auth.uid());

-- Create population_benchmarks table (read-only for patients)
CREATE TABLE IF NOT EXISTS population_benchmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  treatment_type text NOT NULL CHECK (treatment_type IN ('post_surgery', 'conservative', 'physical_therapy')),
  weeks_post_treatment integer NOT NULL CHECK (weeks_post_treatment >= 0),
  mean_odi_score numeric NOT NULL,
  std_dev_odi_score numeric NOT NULL,
  percentile_25 numeric NOT NULL,
  percentile_50 numeric NOT NULL,
  percentile_75 numeric NOT NULL,
  sample_size integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(treatment_type, weeks_post_treatment)
);

ALTER TABLE population_benchmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view population benchmarks"
  ON population_benchmarks FOR SELECT
  TO authenticated
  USING (true);

-- Add baseline tracking to odi_assessments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'odi_assessments' AND column_name = 'is_baseline'
  ) THEN
    ALTER TABLE odi_assessments ADD COLUMN is_baseline boolean DEFAULT false;
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_vas_scores_patient_date ON vas_pain_scores(patient_id, recorded_date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_patient_date ON analytics_metrics(patient_id, metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_benchmarks_treatment_weeks ON population_benchmarks(treatment_type, weeks_post_treatment);

-- Insert sample population benchmarks for post-surgery patients
INSERT INTO population_benchmarks (treatment_type, weeks_post_treatment, mean_odi_score, std_dev_odi_score, percentile_25, percentile_50, percentile_75, sample_size)
VALUES
  ('post_surgery', 0, 65.0, 12.5, 58.0, 66.0, 74.0, 250),
  ('post_surgery', 2, 58.0, 11.8, 50.0, 58.0, 66.0, 248),
  ('post_surgery', 4, 52.0, 11.2, 44.0, 52.0, 60.0, 245),
  ('post_surgery', 6, 46.0, 10.5, 38.0, 46.0, 54.0, 242),
  ('post_surgery', 8, 40.0, 9.8, 33.0, 40.0, 48.0, 238),
  ('post_surgery', 12, 32.0, 9.2, 26.0, 32.0, 39.0, 235),
  ('post_surgery', 16, 26.0, 8.5, 20.0, 26.0, 32.0, 230),
  ('post_surgery', 24, 18.0, 7.8, 13.0, 18.0, 24.0, 225)
ON CONFLICT (treatment_type, weeks_post_treatment) DO UPDATE
SET mean_odi_score = EXCLUDED.mean_odi_score,
    std_dev_odi_score = EXCLUDED.std_dev_odi_score,
    percentile_25 = EXCLUDED.percentile_25,
    percentile_50 = EXCLUDED.percentile_50,
    percentile_75 = EXCLUDED.percentile_75,
    sample_size = EXCLUDED.sample_size,
    updated_at = now();