/*
  # Medical Records and Notifications Schema

  1. New Tables
    - `medical_records`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, references patient_profiles)
      - `document_name` (text)
      - `document_type` (text) - lab_result, imaging, prescription, report, other
      - `document_url` (text)
      - `file_size` (bigint)
      - `mime_type` (text)
      - `uploaded_date` (timestamptz)
      - `notes` (text)
      - `created_at` (timestamptz)
    
    - `notification_settings`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, references patient_profiles, unique)
      - `push_enabled` (boolean)
      - `email_enabled` (boolean)
      - `sms_enabled` (boolean)
      - `daily_checkin_reminder` (boolean)
      - `exercise_reminders` (boolean)
      - `appointment_reminders` (boolean)
      - `medication_reminders` (boolean)
      - `educational_content` (boolean)
      - `reminder_time` (time)
      - `updated_at` (timestamptz)
    
    - `notifications`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, references patient_profiles)
      - `notification_type` (text)
      - `title` (text)
      - `message` (text)
      - `read` (boolean)
      - `action_url` (text, nullable)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to access their own data
*/

-- Create medical_records table
CREATE TABLE IF NOT EXISTS medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  document_name text NOT NULL,
  document_type text NOT NULL CHECK (document_type IN ('lab_result', 'imaging', 'prescription', 'report', 'discharge_summary', 'other')),
  document_url text NOT NULL,
  file_size bigint DEFAULT 0,
  mime_type text DEFAULT 'application/pdf',
  uploaded_date timestamptz DEFAULT now(),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own medical records"
  ON medical_records FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "Users can insert own medical records"
  ON medical_records FOR INSERT
  TO authenticated
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Users can update own medical records"
  ON medical_records FOR UPDATE
  TO authenticated
  USING (patient_id = auth.uid())
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Users can delete own medical records"
  ON medical_records FOR DELETE
  TO authenticated
  USING (patient_id = auth.uid());

-- Create notification_settings table
CREATE TABLE IF NOT EXISTS notification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE UNIQUE,
  push_enabled boolean DEFAULT true,
  email_enabled boolean DEFAULT true,
  sms_enabled boolean DEFAULT false,
  daily_checkin_reminder boolean DEFAULT true,
  exercise_reminders boolean DEFAULT true,
  appointment_reminders boolean DEFAULT true,
  medication_reminders boolean DEFAULT true,
  educational_content boolean DEFAULT true,
  reminder_time time DEFAULT '09:00:00',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notification settings"
  ON notification_settings FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "Users can insert own notification settings"
  ON notification_settings FOR INSERT
  TO authenticated
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Users can update own notification settings"
  ON notification_settings FOR UPDATE
  TO authenticated
  USING (patient_id = auth.uid())
  WITH CHECK (patient_id = auth.uid());

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  notification_type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  action_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (patient_id = auth.uid())
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (patient_id = auth.uid());

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON medical_records(patient_id, uploaded_date DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_patient ON notifications(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(patient_id, read) WHERE read = false;