import { Heart } from 'lucide-react';

interface WelcomeProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export function Welcome({ onGetStarted, onSignIn }: WelcomeProps) {
  return (
    <div className="min-h-screen bg-[#0D0D0F] flex flex-col items-center justify-center p-8 text-white">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex items-center justify-center mb-4">
          <Heart className="w-16 h-16 text-qivr-blue" fill="currentColor" />
        </div>

        <h1 className="text-5xl font-black tracking-tight">Qivr</h1>

        <p className="text-xl font-light text-gray-300">Your Recovery Co-Pilot</p>

        <div className="space-y-4 pt-8">
          <button
            onClick={onGetStarted}
            className="w-full bg-qivr-blue hover:bg-qivr-blue-light text-white py-4 px-6 rounded-lg font-semibold text-lg transition-all shadow-lg shadow-qivr-blue/30"
          >
            Get Started
          </button>

          <button
            onClick={onSignIn}
            className="w-full text-gray-400 hover:text-qivr-blue transition-colors font-medium"
          >
            Already have an account? Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
