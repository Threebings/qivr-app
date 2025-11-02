/*
  # OrthoCompanion Database Schema

  1. New Tables
    - `patient_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `phone_number` (text)
      - `date_of_birth` (date)
      - `condition` (text) - orthopaedic condition
      - `treatment_type` (text) - surgery_planned, post_surgery, injury_recovery, chronic
      - `surgery_date` (date, nullable)
      - `days_post_op` (integer, nullable)
      - `activity_level_goal` (text)
      - `preferred_content_format` (text)
      - `notification_preferences` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `proms_data`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, references patient_profiles)
      - `check_in_date` (date)
      - `pain_level` (integer, 0-10)
      - `pain_location` (jsonb)
      - `pain_character` (text[])
      - `mobility_score` (integer, 0-100)
      - `functional_activities` (jsonb)
      - `mood_rating` (integer, 1-5)
      - `sleep_quality` (integer, 1-5)
      - `sleep_duration` (numeric)
      - `notes` (text)
      - `created_at` (timestamptz)
    
    - `chat_sessions`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, references patient_profiles)
      - `session_id` (text, unique)
      - `started_at` (timestamptz)
      - `last_activity` (timestamptz)
    
    - `chat_messages`
      - `id` (uuid, primary key)
      - `session_id` (uuid, references chat_sessions)
      - `sender` (text) - 'patient' or 'ai'
      - `message` (text)
      - `metadata` (jsonb)
      - `created_at` (timestamptz)
    
    - `educational_content`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `content_type` (text) - video, article, exercise
      - `category` (text)
      - `duration_minutes` (integer)
      - `thumbnail_url` (text)
      - `content_url` (text)
      - `difficulty_level` (text)
      - `created_at` (timestamptz)
    
    - `content_progress`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, references patient_profiles)
      - `content_id` (uuid, references educational_content)
      - `progress_percentage` (integer)
      - `completed` (boolean)
      - `rating` (integer, 1-5, nullable)
      - `bookmarked` (boolean)
      - `last_accessed` (timestamptz)
    
    - `milestones`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, references patient_profiles)
      - `milestone_type` (text)
      - `milestone_name` (text)
      - `achieved_date` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data only
*/

-- Create patient_profiles table
CREATE TABLE IF NOT EXISTS patient_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text NOT NULL,
  phone_number text,
  date_of_birth date,
  condition text,
  treatment_type text CHECK (treatment_type IN ('surgery_planned', 'post_surgery', 'injury_recovery', 'chronic')),
  surgery_date date,
  days_post_op integer,
  activity_level_goal text DEFAULT 'moderate',
  preferred_content_format text DEFAULT 'mixed',
  notification_preferences jsonb DEFAULT '{"push": true, "email": true, "sms": false}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON patient_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON patient_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON patient_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create proms_data table
CREATE TABLE IF NOT EXISTS proms_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  check_in_date date NOT NULL DEFAULT CURRENT_DATE,
  pain_level integer CHECK (pain_level >= 0 AND pain_level <= 10),
  pain_location jsonb DEFAULT '{}'::jsonb,
  pain_character text[] DEFAULT ARRAY[]::text[],
  mobility_score integer CHECK (mobility_score >= 0 AND mobility_score <= 100),
  functional_activities jsonb DEFAULT '{}'::jsonb,
  mood_rating integer CHECK (mood_rating >= 1 AND mood_rating <= 5),
  sleep_quality integer CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  sleep_duration numeric,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE proms_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own PROMs data"
  ON proms_data FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "Users can insert own PROMs data"
  ON proms_data FOR INSERT
  TO authenticated
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Users can update own PROMs data"
  ON proms_data FOR UPDATE
  TO authenticated
  USING (patient_id = auth.uid())
  WITH CHECK (patient_id = auth.uid());

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  session_id text UNIQUE NOT NULL,
  started_at timestamptz DEFAULT now(),
  last_activity timestamptz DEFAULT now()
);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat sessions"
  ON chat_sessions FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "Users can insert own chat sessions"
  ON chat_sessions FOR INSERT
  TO authenticated
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Users can update own chat sessions"
  ON chat_sessions FOR UPDATE
  TO authenticated
  USING (patient_id = auth.uid())
  WITH CHECK (patient_id = auth.uid());

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  sender text NOT NULL CHECK (sender IN ('patient', 'ai')),
  message text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in own sessions"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.patient_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in own sessions"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.patient_id = auth.uid()
    )
  );

-- Create educational_content table
CREATE TABLE IF NOT EXISTS educational_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  content_type text NOT NULL CHECK (content_type IN ('video', 'article', 'exercise')),
  category text NOT NULL,
  duration_minutes integer DEFAULT 0,
  thumbnail_url text DEFAULT '',
  content_url text DEFAULT '',
  difficulty_level text DEFAULT 'beginner',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE educational_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view educational content"
  ON educational_content FOR SELECT
  TO authenticated
  USING (true);

-- Create content_progress table
CREATE TABLE IF NOT EXISTS content_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  content_id uuid NOT NULL REFERENCES educational_content(id) ON DELETE CASCADE,
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completed boolean DEFAULT false,
  rating integer CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  bookmarked boolean DEFAULT false,
  last_accessed timestamptz DEFAULT now(),
  UNIQUE(patient_id, content_id)
);

ALTER TABLE content_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own content progress"
  ON content_progress FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "Users can insert own content progress"
  ON content_progress FOR INSERT
  TO authenticated
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Users can update own content progress"
  ON content_progress FOR UPDATE
  TO authenticated
  USING (patient_id = auth.uid())
  WITH CHECK (patient_id = auth.uid());

-- Create milestones table
CREATE TABLE IF NOT EXISTS milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  milestone_type text NOT NULL,
  milestone_name text NOT NULL,
  achieved_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own milestones"
  ON milestones FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "Users can insert own milestones"
  ON milestones FOR INSERT
  TO authenticated
  WITH CHECK (patient_id = auth.uid());

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_proms_data_patient_date ON proms_data(patient_id, check_in_date DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_patient ON chat_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_progress_patient ON content_progress(patient_id);
CREATE INDEX IF NOT EXISTS idx_milestones_patient ON milestones(patient_id, achieved_date DESC);