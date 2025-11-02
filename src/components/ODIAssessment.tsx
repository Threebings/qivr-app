import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface ODIAssessmentProps {
  onComplete: (score: number) => void;
  onCancel: () => void;
}

interface ODISection {
  name: string;
  title: string;
  options: string[];
}

const ODI_SECTIONS: ODISection[] = [
  {
    name: 'pain_intensity',
    title: 'Pain Intensity',
    options: [
      'I have no pain at the moment',
      'The pain is very mild at the moment',
      'The pain is moderate at the moment',
      'The pain is fairly severe at the moment',
      'The pain is very severe at the moment',
      'The pain is the worst imaginable at the moment',
    ],
  },
  {
    name: 'personal_care',
    title: 'Personal Care (Washing, Dressing, etc.)',
    options: [
      'I can look after myself normally without causing extra pain',
      'I can look after myself normally but it causes extra pain',
      'It is painful to look after myself and I am slow and careful',
      'I need some help but manage most of my personal care',
      'I need help every day in most aspects of self care',
      'I do not get dressed, wash with difficulty, and stay in bed',
    ],
  },
  {
    name: 'lifting',
    title: 'Lifting',
    options: [
      'I can lift heavy weights without extra pain',
      'I can lift heavy weights but it gives extra pain',
      'Pain prevents me from lifting heavy weights off the floor, but I can manage if they are conveniently placed (e.g., on a table)',
      'Pain prevents me from lifting heavy weights, but I can manage light to medium weights if they are conveniently positioned',
      'I can lift very light weights',
      'I cannot lift or carry anything',
    ],
  },
  {
    name: 'walking',
    title: 'Walking',
    options: [
      'Pain does not prevent me walking any distance',
      'Pain prevents me from walking more than 1 mile',
      'Pain prevents me from walking more than 1/2 mile',
      'Pain prevents me from walking more than 100 yards',
      'I can only walk using a stick or crutches',
      'I am in bed most of the time',
    ],
  },
  {
    name: 'sitting',
    title: 'Sitting',
    options: [
      'I can sit in any chair as long as I like',
      'I can only sit in my favorite chair as long as I like',
      'Pain prevents me sitting more than one hour',
      'Pain prevents me from sitting more than 30 minutes',
      'Pain prevents me from sitting more than 10 minutes',
      'Pain prevents me from sitting at all',
    ],
  },
  {
    name: 'standing',
    title: 'Standing',
    options: [
      'I can stand as long as I want without extra pain',
      'I can stand as long as I want but it gives me extra pain',
      'Pain prevents me from standing for more than 1 hour',
      'Pain prevents me from standing for more than 30 minutes',
      'Pain prevents me from standing for more than 10 minutes',
      'Pain prevents me from standing at all',
    ],
  },
  {
    name: 'sleeping',
    title: 'Sleeping',
    options: [
      'My sleep is never disturbed by pain',
      'My sleep is occasionally disturbed by pain',
      'Because of pain I have less than 6 hours sleep',
      'Because of pain I have less than 4 hours sleep',
      'Because of pain I have less than 2 hours sleep',
      'Pain prevents me from sleeping at all',
    ],
  },
  {
    name: 'sex_life',
    title: 'Sex Life (if applicable)',
    options: [
      'My sex life is normal and causes no extra pain',
      'My sex life is normal but causes some extra pain',
      'My sex life is nearly normal but is very painful',
      'My sex life is severely restricted by pain',
      'My sex life is nearly absent because of pain',
      'Pain prevents any sex life at all',
    ],
  },
  {
    name: 'social_life',
    title: 'Social Life',
    options: [
      'My social life is normal and gives me no extra pain',
      'My social life is normal but increases the degree of pain',
      'Pain has no significant effect on my social life apart from limiting my more energetic interests (e.g., sport)',
      'Pain has restricted my social life and I do not go out as often',
      'Pain has restricted my social life to my home',
      'I have no social life because of pain',
    ],
  },
  {
    name: 'traveling',
    title: 'Traveling',
    options: [
      'I can travel anywhere without pain',
      'I can travel anywhere but it gives me extra pain',
      'Pain is bad but I manage journeys over two hours',
      'Pain restricts me to journeys of less than one hour',
      'Pain restricts me to short necessary journeys under 30 minutes',
      'Pain prevents me from traveling except to receive treatment',
    ],
  },
];

export function ODIAssessment({ onComplete, onCancel }: ODIAssessmentProps) {
  const { user } = useAuth();
  const [currentSection, setCurrentSection] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  const totalSections = ODI_SECTIONS.length;
  const progress = ((currentSection + (responses[ODI_SECTIONS[currentSection]?.name] !== undefined ? 1 : 0)) / totalSections) * 100;

  const handleResponse = (score: number) => {
    const sectionName = ODI_SECTIONS[currentSection].name;
    setResponses({ ...responses, [sectionName]: score });
  };

  const handleNext = () => {
    if (currentSection < totalSections - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    const allAnswered = ODI_SECTIONS.every(section => responses[section.name] !== undefined);
    if (!allAnswered) {
      alert('Please answer all sections before submitting');
      return;
    }

    try {
      setSaving(true);

      const assessmentData = {
        patient_id: user.id,
        assessment_date: new Date().toISOString().split('T')[0],
        pain_intensity: responses.pain_intensity,
        personal_care: responses.personal_care,
        lifting: responses.lifting,
        walking: responses.walking,
        sitting: responses.sitting,
        standing: responses.standing,
        sleeping: responses.sleeping,
        sex_life: responses.sex_life,
        social_life: responses.social_life,
        traveling: responses.traveling,
      };

      const { data, error } = await supabase
        .from('odi_assessments')
        .insert(assessmentData)
        .select()
        .single();

      if (error) throw error;

      onComplete(data.percentage_score);
    } catch (error) {
      console.error('Error saving ODI assessment:', error);
      alert('Failed to save assessment. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const currentSectionData = ODI_SECTIONS[currentSection];
  const currentResponse = responses[currentSectionData?.name];
  const canProceed = currentResponse !== undefined;

  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-24">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onCancel}
              className="flex items-center text-qivr-blue hover:text-qivr-blue-light transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Cancel
            </button>
            <div className="text-sm text-gray-600">
              Section {currentSection + 1} of {totalSections}
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-qivr-blue rounded-full h-2 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Oswestry Disability Index (ODI)</p>
            <p>Please select the ONE statement in each section that best describes your current situation. Answer every section.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
          <h2 className="text-xl font-bold text-[#1F2937] mb-2">
            {currentSectionData.title}
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Choose the statement that best describes your condition today
          </p>

          <div className="space-y-3">
            {currentSectionData.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleResponse(index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  currentResponse === index
                    ? 'border-qivr-blue bg-qivr-blue/5'
                    : 'border-gray-200 hover:border-qivr-blue/50 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    currentResponse === index
                      ? 'border-qivr-blue bg-qivr-blue'
                      : 'border-gray-300'
                  }`}>
                    {currentResponse === index && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className="text-gray-700">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex space-x-3">
          {currentSection > 0 && (
            <button
              onClick={handleBack}
              className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          )}

          <button
            onClick={handleNext}
            disabled={!canProceed || saving}
            className="flex-1 bg-qivr-blue text-white py-4 px-6 rounded-lg font-semibold hover:bg-qivr-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <span>
              {saving
                ? 'Saving...'
                : currentSection === totalSections - 1
                ? 'Complete Assessment'
                : 'Next'}
            </span>
            {currentSection < totalSections - 1 && <ArrowRight className="w-5 h-5" />}
            {currentSection === totalSections - 1 && <Check className="w-5 h-5" />}
          </button>
        </div>

        <div className="mt-6 flex justify-center space-x-2">
          {ODI_SECTIONS.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index < currentSection
                  ? 'w-8 bg-green-500'
                  : index === currentSection
                  ? 'w-8 bg-qivr-blue'
                  : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
