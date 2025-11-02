import { useState } from 'react';
import { Check, AlertCircle, ChevronRight, Timer, Repeat } from 'lucide-react';

interface Exercise {
  name: string;
  description: string;
  sets: number;
  reps: string;
  duration?: string;
  instructions: string[];
  tips: string[];
  warnings?: string[];
}

interface ExerciseGuideProps {
  title: string;
  exercises: Exercise[];
  onComplete?: () => void;
}

export function ExerciseGuide({ title, exercises: propExercises, onComplete }: ExerciseGuideProps) {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<number[]>([]);
  const [showInstructions, setShowInstructions] = useState(true);

  const defaultExercises: Exercise[] = [
    {
      name: 'Ankle Pumps',
      description: 'Gentle movement to improve circulation and prevent blood clots',
      sets: 3,
      reps: '10-15',
      instructions: [
        'Lie on your back with legs extended',
        'Point your toes away from you as far as comfortable',
        'Pull your toes back toward you',
        'Repeat in a smooth, controlled motion',
      ],
      tips: [
        'Can be done while sitting or lying down',
        'Perform throughout the day, especially after periods of rest',
        'Should not cause pain',
      ],
      warnings: [
        'Stop if you experience sharp pain',
        'Avoid forcing the movement',
      ],
    },
    {
      name: 'Quadriceps Sets',
      description: 'Strengthens the front thigh muscles without moving the knee',
      sets: 3,
      reps: '10',
      duration: '5 seconds hold',
      instructions: [
        'Sit with your leg straight out in front of you',
        'Tighten the muscle on top of your thigh',
        'Push the back of your knee down toward the surface',
        'Hold for 5 seconds, then relax',
      ],
      tips: [
        'You should see your kneecap move up slightly',
        'Place a small towel under your knee if needed',
        'Breathe normally during the hold',
      ],
    },
    {
      name: 'Heel Slides',
      description: 'Improves knee bending range of motion',
      sets: 3,
      reps: '10',
      instructions: [
        'Lie on your back with legs extended',
        'Slowly slide your heel toward your buttocks',
        'Bend your knee as far as comfortable',
        'Hold for 2-3 seconds, then slide back to starting position',
      ],
      tips: [
        'Use a towel or strap around your ankle to assist if needed',
        'Progress gradually - don\'t force the bend',
        'Some discomfort is normal, but stop if you feel sharp pain',
      ],
      warnings: [
        'Do not bounce or jerk the leg',
        'Maintain control throughout the movement',
      ],
    },
    {
      name: 'Straight Leg Raises',
      description: 'Strengthens hip flexors and quadriceps',
      sets: 3,
      reps: '10',
      instructions: [
        'Lie on your back with one knee bent, foot flat',
        'Keep the other leg straight',
        'Tighten the thigh muscle of your straight leg',
        'Lift the straight leg 6-12 inches off the ground',
        'Hold for 2-3 seconds, then lower slowly',
      ],
      tips: [
        'Keep your back flat against the surface',
        'Lift only as high as the bent knee',
        'Control the lowering phase',
      ],
      warnings: [
        'Stop if you feel back pain',
        'Do not arch your lower back',
      ],
    },
    {
      name: 'Seated Knee Extension',
      description: 'Strengthens quadriceps in a seated position',
      sets: 3,
      reps: '10',
      duration: '3 seconds hold',
      instructions: [
        'Sit in a firm chair with feet flat on the floor',
        'Slowly straighten one knee, lifting your foot',
        'Hold your leg straight for 3 seconds',
        'Lower slowly back to starting position',
      ],
      tips: [
        'Keep your back against the chair',
        'Tighten your thigh muscle at the top',
        'Can add ankle weights as you progress',
      ],
    },
  ];

  const exercises = propExercises.length > 0 ? propExercises : defaultExercises;
  const exercise = exercises[currentExercise];
  const progress = (completedExercises.length / exercises.length) * 100;

  const handleComplete = () => {
    if (!completedExercises.includes(currentExercise)) {
      setCompletedExercises([...completedExercises, currentExercise]);
    }

    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
      setShowInstructions(true);
    } else if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-gradient-to-br from-qivr-blue to-qivr-blue-light px-6 py-6 text-white">
        <h1 className="text-2xl font-bold mb-4">{title}</h1>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{completedExercises.length} of {exercises.length} completed</span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[#1F2937]">{exercise.name}</h2>
            {completedExercises.includes(currentExercise) && (
              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                <Check className="w-4 h-4" />
                <span>Completed</span>
              </div>
            )}
          </div>
          <p className="text-gray-600 mb-4">{exercise.description}</p>

          <div className="flex space-x-4 mb-6">
            <div className="flex items-center space-x-2 bg-[#F8FAFB] px-4 py-2 rounded-lg">
              <Repeat className="w-5 h-5 text-qivr-blue" />
              <span className="text-sm">
                <span className="font-semibold">{exercise.sets}</span> sets × <span className="font-semibold">{exercise.reps}</span> reps
              </span>
            </div>
            {exercise.duration && (
              <div className="flex items-center space-x-2 bg-[#F8FAFB] px-4 py-2 rounded-lg">
                <Timer className="w-5 h-5 text-qivr-blue" />
                <span className="text-sm font-semibold">{exercise.duration}</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="flex items-center justify-between w-full text-left mb-3"
            >
              <h3 className="text-lg font-semibold text-[#1F2937]">Instructions</h3>
              <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${showInstructions ? 'rotate-90' : ''}`} />
            </button>
            {showInstructions && (
              <ol className="space-y-3">
                {exercise.instructions.map((instruction, index) => (
                  <li key={index} className="flex space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-qivr-blue text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 pt-0.5">{instruction}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center space-x-2">
              <span>💡</span>
              <span>Tips for Success</span>
            </h4>
            <ul className="space-y-2">
              {exercise.tips.map((tip, index) => (
                <li key={index} className="text-sm text-blue-800 flex space-x-2">
                  <span>•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {exercise.warnings && exercise.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-2 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5" />
                <span>Important Warnings</span>
              </h4>
              <ul className="space-y-2">
                {exercise.warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-yellow-800 flex space-x-2">
                    <span>⚠️</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-8 space-y-3">
          <button
            onClick={handleComplete}
            className="w-full bg-qivr-blue text-white py-4 px-6 rounded-lg font-semibold hover:bg-qivr-blue-dark transition-colors"
          >
            {completedExercises.includes(currentExercise)
              ? currentExercise < exercises.length - 1
                ? 'Next Exercise'
                : 'Finish Session'
              : 'Mark as Complete'}
          </button>

          <div className="flex justify-center space-x-2">
            {exercises.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentExercise(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentExercise
                    ? 'bg-qivr-blue w-6'
                    : completedExercises.includes(index)
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
