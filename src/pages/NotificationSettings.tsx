import { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Clock, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface NotificationSettingsProps {
  onBack: () => void;
}

interface Settings {
  push_enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  daily_checkin_reminder: boolean;
  exercise_reminders: boolean;
  appointment_reminders: boolean;
  medication_reminders: boolean;
  educational_content: boolean;
  reminder_time: string;
}

export function NotificationSettings({ onBack }: NotificationSettingsProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    push_enabled: true,
    email_enabled: true,
    sms_enabled: false,
    daily_checkin_reminder: true,
    exercise_reminders: true,
    appointment_reminders: true,
    medication_reminders: true,
    educational_content: true,
    reminder_time: '09:00',
  });

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('patient_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettings({
          push_enabled: data.push_enabled,
          email_enabled: data.email_enabled,
          sms_enabled: data.sms_enabled,
          daily_checkin_reminder: data.daily_checkin_reminder,
          exercise_reminders: data.exercise_reminders,
          appointment_reminders: data.appointment_reminders,
          medication_reminders: data.medication_reminders,
          educational_content: data.educational_content,
          reminder_time: data.reminder_time?.substring(0, 5) || '09:00',
        });
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          patient_id: user.id,
          ...settings,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'patient_id'
        });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving notification settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleSetting = (key: keyof Settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button
      type="button"
      onClick={onToggle}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        enabled ? 'bg-qivr-blue' : 'bg-gray-300'
      }`}
    >
      <span
        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
          enabled ? 'transform translate-x-6' : ''
        }`}
      />
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-qivr-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-24">
      <div className="bg-white px-6 py-4 border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center text-qivr-blue hover:text-qivr-blue-light transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-xl font-semibold text-[#1F2937]">Notifications</h1>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900">Settings Saved</h3>
              <p className="text-sm text-green-700">Your notification preferences have been updated</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-qivr-blue" />
              <h2 className="text-lg font-semibold text-[#1F2937]">Notification Channels</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">Choose how you want to receive notifications</p>
          </div>

          <div className="divide-y divide-gray-100">
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <div className="font-medium text-gray-900">Push Notifications</div>
                <div className="text-sm text-gray-600">Receive notifications in the app</div>
              </div>
              <ToggleSwitch
                enabled={settings.push_enabled}
                onToggle={() => toggleSetting('push_enabled')}
              />
            </div>

            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <div className="font-medium text-gray-900">Email Notifications</div>
                <div className="text-sm text-gray-600">Receive notifications via email</div>
              </div>
              <ToggleSwitch
                enabled={settings.email_enabled}
                onToggle={() => toggleSetting('email_enabled')}
              />
            </div>

            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <div className="font-medium text-gray-900">SMS Notifications</div>
                <div className="text-sm text-gray-600">Receive text message alerts</div>
              </div>
              <ToggleSwitch
                enabled={settings.sms_enabled}
                onToggle={() => toggleSetting('sms_enabled')}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-[#1F2937]">Reminder Types</h2>
            <p className="text-sm text-gray-600 mt-1">Select which reminders you want to receive</p>
          </div>

          <div className="divide-y divide-gray-100">
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <div className="font-medium text-gray-900">Daily Check-In</div>
                <div className="text-sm text-gray-600">Reminder to complete your daily health assessment</div>
              </div>
              <ToggleSwitch
                enabled={settings.daily_checkin_reminder}
                onToggle={() => toggleSetting('daily_checkin_reminder')}
              />
            </div>

            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <div className="font-medium text-gray-900">Exercise Reminders</div>
                <div className="text-sm text-gray-600">Reminders to complete prescribed exercises</div>
              </div>
              <ToggleSwitch
                enabled={settings.exercise_reminders}
                onToggle={() => toggleSetting('exercise_reminders')}
              />
            </div>

            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <div className="font-medium text-gray-900">Appointment Reminders</div>
                <div className="text-sm text-gray-600">Upcoming doctor visits and follow-ups</div>
              </div>
              <ToggleSwitch
                enabled={settings.appointment_reminders}
                onToggle={() => toggleSetting('appointment_reminders')}
              />
            </div>

            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <div className="font-medium text-gray-900">Medication Reminders</div>
                <div className="text-sm text-gray-600">Reminders to take your medications</div>
              </div>
              <ToggleSwitch
                enabled={settings.medication_reminders}
                onToggle={() => toggleSetting('medication_reminders')}
              />
            </div>

            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <div className="font-medium text-gray-900">Educational Content</div>
                <div className="text-sm text-gray-600">New articles, videos, and recovery tips</div>
              </div>
              <ToggleSwitch
                enabled={settings.educational_content}
                onToggle={() => toggleSetting('educational_content')}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="w-5 h-5 text-qivr-blue" />
            <h2 className="text-lg font-semibold text-[#1F2937]">Reminder Time</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Choose your preferred time for daily reminders
          </p>
          <input
            type="time"
            value={settings.reminder_time}
            onChange={(e) => setSettings({ ...settings, reminder_time: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qivr-blue focus:border-transparent"
          />
        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="w-full bg-qivr-blue text-white py-4 px-6 rounded-lg font-semibold hover:bg-qivr-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <Check className="w-5 h-5" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>
    </div>
  );
}
