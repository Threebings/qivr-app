import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Calendar, Phone, Mail, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface EditProfileProps {
  onBack: () => void;
}

export function EditProfile({ onBack }: EditProfileProps) {
  const { profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    date_of_birth: '',
    condition: '',
    treatment_type: '',
    surgery_date: '',
    activity_level_goal: '',
    preferred_content_format: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone_number: profile.phone_number || '',
        date_of_birth: profile.date_of_birth || '',
        condition: profile.condition || '',
        treatment_type: profile.treatment_type || '',
        surgery_date: profile.surgery_date || '',
        activity_level_goal: profile.activity_level_goal || 'moderate',
        preferred_content_format: profile.preferred_content_format || 'mixed',
      });
    }
  }, [profile]);

  const conditions = [
    'Knee',
    'Hip',
    'Shoulder',
    'Spine',
    'Ankle',
    'Elbow',
    'Wrist',
    'Other',
  ];

  const treatmentTypes = [
    { value: 'surgery_planned', label: 'Surgery Planned' },
    { value: 'post_surgery', label: 'Post-Surgery' },
    { value: 'injury_recovery', label: 'Injury Recovery' },
    { value: 'chronic', label: 'Chronic Condition' },
  ];

  const activityLevels = [
    { value: 'light', label: 'Light' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'active', label: 'Active' },
  ];

  const contentFormats = [
    { value: 'video', label: 'Video' },
    { value: 'text', label: 'Text' },
    { value: 'mixed', label: 'Mixed' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formData.full_name.trim()) {
      setError('Full name is required');
      return;
    }

    try {
      setLoading(true);
      await updateProfile({
        full_name: formData.full_name,
        phone_number: formData.phone_number || undefined,
        date_of_birth: formData.date_of_birth || undefined,
        condition: formData.condition || undefined,
        treatment_type: formData.treatment_type as any,
        surgery_date: formData.surgery_date || undefined,
        activity_level_goal: formData.activity_level_goal,
        preferred_content_format: formData.preferred_content_format,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-xl font-semibold text-[#1F2937]">Edit Profile</h1>
          <div className="w-20"></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Save className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900">Profile Updated</h3>
              <p className="text-sm text-green-700">Your changes have been saved successfully</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
          <h2 className="text-lg font-semibold text-[#1F2937] mb-4">Personal Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center space-x-2">
                <UserIcon className="w-4 h-4" />
                <span>Full Name</span>
              </div>
            </label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qivr-blue focus:border-transparent"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>Phone Number</span>
              </div>
            </label>
            <input
              type="tel"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qivr-blue focus:border-transparent"
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Date of Birth</span>
              </div>
            </label>
            <input
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qivr-blue focus:border-transparent"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
          <h2 className="text-lg font-semibold text-[#1F2937] mb-4">Medical Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Condition
            </label>
            <select
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qivr-blue focus:border-transparent"
            >
              <option value="">Select condition</option>
              {conditions.map(condition => (
                <option key={condition} value={condition}>{condition}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Treatment Type
            </label>
            <select
              value={formData.treatment_type}
              onChange={(e) => setFormData({ ...formData, treatment_type: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qivr-blue focus:border-transparent"
            >
              <option value="">Select treatment type</option>
              {treatmentTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {(formData.treatment_type === 'surgery_planned' || formData.treatment_type === 'post_surgery') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Surgery Date
              </label>
              <input
                type="date"
                value={formData.surgery_date}
                onChange={(e) => setFormData({ ...formData, surgery_date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qivr-blue focus:border-transparent"
              />
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
          <h2 className="text-lg font-semibold text-[#1F2937] mb-4">Preferences</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Activity Level Goal
            </label>
            <div className="grid grid-cols-3 gap-3">
              {activityLevels.map(level => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, activity_level_goal: level.value })}
                  className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                    formData.activity_level_goal === level.value
                      ? 'border-qivr-blue bg-qivr-blue text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-[#5AB9B5]'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Content Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              {contentFormats.map(format => (
                <button
                  key={format.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, preferred_content_format: format.value })}
                  className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                    formData.preferred_content_format === format.value
                      ? 'border-qivr-blue bg-qivr-blue text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-[#5AB9B5]'
                  }`}
                >
                  {format.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-qivr-blue text-white py-4 px-6 rounded-lg font-semibold hover:bg-qivr-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <Save className="w-5 h-5" />
          <span>{loading ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </form>
    </div>
  );
}
