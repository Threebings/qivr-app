import { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface CheckInProps {
  onComplete: () => void;
}

export function CheckIn({ onComplete }: CheckInProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    painLevel: 5,
    painLocation: { knee: false, hip: false, back: false },
    painCharacter: [] as string[],
    mobilityScore: 50,
    functionalActivities: {
      bedIndependent: false,
      walked: false,
      exercises: false,
      painManaged: false,
      bathed: false,
    },
    moodRating: 3,
    sleepQuality: 3,
    sleepDuration: 7,
    notes: '',
  });

  const painEmojis = [
    { range: [0, 2], emoji: '😊', label: 'Minimal' },
    { range: [3, 5], emoji: '😐', label: 'Moderate' },
    { range: [6, 8], emoji: '😟', label: 'Significant' },
    { range: [9, 10], emoji: '😢', label: 'Severe' },
  ];

  const getCurrentEmoji = () => {
    const found = painEmojis.find(e => formData.painLevel >= e.range[0] && formData.painLevel <= e.range[1]);
    return found || painEmojis[0];
  };

  const painCharacterOptions = ['Sharp', 'Dull', 'Throbbing', 'Burning', 'Stiff'];

  const moodEmojis = ['😢', '😟', '😐', '😊', '😄'];

  const handleSubmit = async () => {
    if (!user) return;

    try {
      setLoading(true);
      await supabase.from('proms_data').insert({
        patient_id: user.id,
        check_in_date: new Date().toISOString().split('T')[0],
        pain_level: formData.painLevel,
        pain_location: formData.painLocation,
        pain_character: formData.painCharacter,
        mobility_score: formData.mobilityScore,
        functional_activities: formData.functionalActivities,
        mood_rating: formData.moodRating,
        sleep_quality: formData.sleepQuality,
        sleep_duration: formData.sleepDuration,
        notes: formData.notes,
      });

      onComplete();
    } catch (error) {
      console.error('Error saving check-in:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePainCharacter = (character: string) => {
    setFormData(prev => ({
      ...prev,
      painCharacter: prev.painCharacter.includes(character)
        ? prev.painCharacter.filter(c => c !== character)
        : [...prev.painCharacter, character]
    }));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-24">
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-[#1F2937]">Daily Check-In</h1>
          <span className="text-sm text-gray-500">{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-[#1F2937] mb-4">Pain Assessment</h2>

          <div className="text-center mb-6">
            <div className="text-6xl mb-2">{getCurrentEmoji().emoji}</div>
            <div className="text-2xl font-bold text-qivr-blue mb-1">{formData.painLevel}/10</div>
            <div className="text-sm text-gray-600">{getCurrentEmoji().label}</div>
          </div>

          <input
            type="range"
            min="0"
            max="10"
            value={formData.painLevel}
            onChange={(e) => setFormData({ ...formData, painLevel: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2E7D88]"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>No Pain</span>
            <span>Worst Pain</span>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Pain Character
            </label>
            <div className="flex flex-wrap gap-2">
              {painCharacterOptions.map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => togglePainCharacter(option)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    formData.painCharacter.includes(option)
                      ? 'bg-qivr-blue text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-[#1F2937] mb-4">Mobility Assessment</h2>

          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Mobility</span>
              <span className="text-sm font-bold text-qivr-blue">{formData.mobilityScore}/100</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.mobilityScore}
              onChange={(e) => setFormData({ ...formData, mobilityScore: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2E7D88]"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-[#1F2937] mb-4">Daily Activities Completed</h2>
          <div className="space-y-3">
            {Object.entries({
              bedIndependent: 'Got out of bed independently',
              walked: 'Walked for 15 minutes',
              exercises: 'Completed prescribed exercises',
              painManaged: 'Managed pain without extra medication',
              bathed: 'Showered/bathed independently',
            }).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFormData({
                  ...formData,
                  functionalActivities: {
                    ...formData.functionalActivities,
                    [key]: !formData.functionalActivities[key as keyof typeof formData.functionalActivities]
                  }
                })}
                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                  formData.functionalActivities[key as keyof typeof formData.functionalActivities]
                    ? 'bg-[#10B981] border-[#10B981]'
                    : 'border-gray-300'
                }`}>
                  {formData.functionalActivities[key as keyof typeof formData.functionalActivities] && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className="text-gray-700">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-[#1F2937] mb-4">Mood & Sleep</h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">How are you feeling today?</label>
            <div className="flex justify-between">
              {moodEmojis.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setFormData({ ...formData, moodRating: index + 1 })}
                  className={`text-4xl transition-all ${
                    formData.moodRating === index + 1 ? 'scale-125' : 'opacity-50 hover:opacity-75'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sleep Quality
            </label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, sleepQuality: star })}
                  className={`text-2xl ${star <= formData.sleepQuality ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hours Slept
            </label>
            <input
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={formData.sleepDuration}
              onChange={(e) => setFormData({ ...formData, sleepDuration: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qivr-blue focus:border-transparent"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Anything else you'd like to share about today?"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qivr-blue focus:border-transparent resize-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-qivr-blue text-white py-4 px-6 rounded-lg font-semibold hover:bg-qivr-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Today\'s Check-In'}
        </button>
      </div>
    </div>
  );
}
