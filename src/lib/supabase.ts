import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type PatientProfile = {
  id: string;
  full_name: string;
  phone_number?: string;
  date_of_birth?: string;
  condition?: string;
  treatment_type?: 'surgery_planned' | 'post_surgery' | 'injury_recovery' | 'chronic';
  surgery_date?: string;
  days_post_op?: number;
  activity_level_goal?: string;
  preferred_content_format?: string;
  notification_preferences?: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  created_at?: string;
  updated_at?: string;
};

export type PromsData = {
  id?: string;
  patient_id: string;
  check_in_date: string;
  pain_level: number;
  pain_location?: Record<string, boolean>;
  pain_character?: string[];
  mobility_score: number;
  functional_activities?: Record<string, boolean>;
  mood_rating: number;
  sleep_quality: number;
  sleep_duration?: number;
  notes?: string;
  created_at?: string;
};

export type ChatMessage = {
  id?: string;
  session_id: string;
  sender: 'patient' | 'ai';
  message: string;
  metadata?: Record<string, any>;
  created_at?: string;
};

export type EducationalContent = {
  id: string;
  title: string;
  description: string;
  content_type: 'video' | 'article' | 'exercise';
  category: string;
  duration_minutes: number;
  thumbnail_url: string;
  content_url: string;
  difficulty_level: string;
  created_at: string;
};

export type Milestone = {
  id?: string;
  patient_id: string;
  milestone_type: string;
  milestone_name: string;
  achieved_date?: string;
  created_at?: string;
};
