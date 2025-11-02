import { useState } from 'react';
import { ArrowLeft, Bell, Video, FileText, Image as ImageIcon, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface PersonalizationProps {
  onBack: () => void;
  onComplete: () => void;
}

export function Personalization({ onBack, onComplete }: PersonalizationProps) {
  const { updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    notificationPreferences: { push: true, email: true, sms: false },
    preferredContentFormat: 'mixed',
    activityLevelGoal: 'moderate',
    reminderTime: '09:00',
  });

  const contentFormats = [
    { value: 'video', label: 'Video', icon: Video },
    { value: 'text', label: 'Text', icon: FileText },
    { value: 'mixed', label: 'Mixed', icon: ImageIcon },
  ];

  const activityLevels = [
    { value: 'light', label: 'Light', description: 'Gentle activities' },
    { value: 'moderate', label: 'Moderate', description: 'Balanced approach' },
    { value: 'active', label: 'Active', description: 'Vigorous recovery' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      await updateProfile({
        notification_preferences: formData.notificationPreferences,
        preferred_content_format: formData.preferredContentFormat,
        activity_level_goal: formData.activityLevelGoal,
      });
      onComplete();
    } catch (err) {
      console.error('Failed to update preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFB] p-6">
      <div className="max-w-md mx-auto">
        <button
          onClick={onBack}
          className="flex items-center text-qivr-blue mb-6 hover:text-qivr-blue-light transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <div className="w-8 h-8 rounded-full bg-qivr-blue text-white flex items-center justify-center">3</div>
            <span>of 4</span>
          </div>
          <h1 className="text-3xl font-bold text-[#1F2937]">Personalize Your Experience</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How would you like to receive reminders?
            </label>
            <div className="space-y-3 bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">Push Notifications</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    notificationPreferences: {
                      ...formData.notificationPreferences,
                      push: !formData.notificationPreferences.push
                    }
                  })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    formData.notificationPreferences.push ? 'bg-qivr-blue' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      formData.notificationPreferences.push ? 'transform translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-gray-700">Email</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    notificationPreferences: {
                      ...formData.notificationPreferences,
                      email: !formData.notificationPreferences.email
                    }
                  })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    formData.notificationPreferences.email ? 'bg-qivr-blue' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      formData.notificationPreferences.email ? 'transform translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Preferred content format
            </label>
            <div className="grid grid-cols-3 gap-3">
              {contentFormats.map((format) => {
                const Icon = format.icon;
                return (
                  <button
                    key={format.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, preferredContentFormat: format.value })}
                    className={`py-4 px-3 rounded-lg border-2 transition-all flex flex-col items-center space-y-2 ${
                      formData.preferredContentFormat === format.value
                        ? 'border-qivr-blue bg-qivr-blue text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-[#5AB9B5]'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-sm">{format.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Activity level goal
            </label>
            <div className="space-y-3">
              {activityLevels.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, activityLevelGoal: level.value })}
                  className={`w-full py-4 px-4 rounded-lg border-2 text-left transition-all ${
                    formData.activityLevelGoal === level.value
                      ? 'border-qivr-blue bg-qivr-blue text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-[#5AB9B5]'
                  }`}
                >
                  <div className="font-semibold">{level.label}</div>
                  <div className={`text-sm ${formData.activityLevelGoal === level.value ? 'text-white' : 'text-gray-500'}`}>
                    {level.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Daily check-in reminder time
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="time"
                value={formData.reminderTime}
                onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qivr-blue focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-qivr-blue text-white py-4 px-6 rounded-lg font-semibold hover:bg-qivr-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Completing Setup...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );
}
