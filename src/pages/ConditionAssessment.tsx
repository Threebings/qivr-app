import { useState } from 'react';
import { ArrowLeft, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ConditionAssessmentProps {
  onBack: () => void;
  onComplete: () => void;
}

export function ConditionAssessment({ onBack, onComplete }: ConditionAssessmentProps) {
  const { updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    condition: '',
    treatmentType: '',
    surgeryDate: '',
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.condition || !formData.treatmentType) {
      return;
    }

    try {
      setLoading(true);
      await updateProfile({
        condition: formData.condition,
        treatment_type: formData.treatmentType as any,
        surgery_date: formData.surgeryDate || undefined,
      });
      onComplete();
    } catch (err) {
      console.error('Failed to update profile:', err);
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
            <div className="w-8 h-8 rounded-full bg-qivr-blue text-white flex items-center justify-center">2</div>
            <span>of 4</span>
          </div>
          <h1 className="text-3xl font-bold text-[#1F2937]">Tell Us About Your Condition</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What area are you being treated for?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {conditions.map((condition) => (
                <button
                  key={condition}
                  type="button"
                  onClick={() => setFormData({ ...formData, condition })}
                  className={`py-3 px-4 rounded-lg border-2 transition-all ${
                    formData.condition === condition
                      ? 'border-qivr-blue bg-qivr-blue text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-[#5AB9B5]'
                  }`}
                >
                  {condition}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What type of treatment?
            </label>
            <div className="space-y-3">
              {treatmentTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, treatmentType: type.value })}
                  className={`w-full py-4 px-4 rounded-lg border-2 text-left transition-all ${
                    formData.treatmentType === type.value
                      ? 'border-qivr-blue bg-qivr-blue text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-[#5AB9B5]'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {(formData.treatmentType === 'surgery_planned' || formData.treatmentType === 'post_surgery') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formData.treatmentType === 'surgery_planned' ? 'When is your surgery?' : 'When was your surgery?'}
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  value={formData.surgeryDate}
                  onChange={(e) => setFormData({ ...formData, surgeryDate: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qivr-blue focus:border-transparent"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !formData.condition || !formData.treatmentType}
            className="w-full bg-qivr-blue text-white py-4 px-6 rounded-lg font-semibold hover:bg-qivr-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
