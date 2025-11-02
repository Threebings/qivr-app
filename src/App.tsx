import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Welcome } from './pages/Welcome';
import { SignIn } from './pages/SignIn';
import { Registration } from './pages/Registration';
import { ConditionAssessment } from './pages/ConditionAssessment';
import { Personalization } from './pages/Personalization';
import { Home } from './pages/Home';
import { Chat } from './pages/Chat';
import { Learn } from './pages/Learn';
import { Progress } from './pages/Progress';
import { Profile } from './pages/Profile';
import { Providers } from './pages/Providers';
import { CheckIn } from './pages/CheckIn';
import { BottomNav } from './components/BottomNav';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [onboardingStep, setOnboardingStep] = useState<'welcome' | 'signin' | 'register' | 'assessment' | 'personalization' | 'complete'>('welcome');
  const [activeTab, setActiveTab] = useState('home');
  const [showCheckIn, setShowCheckIn] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (profile?.condition) {
        setOnboardingStep('complete');
      } else {
        setOnboardingStep('assessment');
      }
    }
  }, [user, profile, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-qivr-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    switch (onboardingStep) {
      case 'signin':
        return (
          <SignIn
            onBack={() => setOnboardingStep('welcome')}
            onSuccess={() => setOnboardingStep('complete')}
          />
        );
      case 'register':
        return (
          <Registration
            onBack={() => setOnboardingStep('welcome')}
            onComplete={() => setOnboardingStep('assessment')}
          />
        );
      default:
        return (
          <Welcome
            onGetStarted={() => setOnboardingStep('register')}
            onSignIn={() => setOnboardingStep('signin')}
          />
        );
    }
  }

  if (onboardingStep === 'assessment') {
    return (
      <ConditionAssessment
        onBack={() => setOnboardingStep('welcome')}
        onComplete={() => setOnboardingStep('personalization')}
      />
    );
  }

  if (onboardingStep === 'personalization') {
    return (
      <Personalization
        onBack={() => setOnboardingStep('assessment')}
        onComplete={() => setOnboardingStep('complete')}
      />
    );
  }

  if (showCheckIn) {
    return (
      <CheckIn
        onComplete={() => {
          setShowCheckIn(false);
          setActiveTab('progress');
        }}
      />
    );
  }

  return (
    <div className="relative">
      {activeTab === 'home' && <Home onOpenChat={() => setActiveTab('chat')} />}
      {activeTab === 'learn' && <Learn />}
      {activeTab === 'chat' && <Chat />}
      {activeTab === 'progress' && <Progress />}
      {activeTab === 'providers' && <Providers />}
      {activeTab === 'profile' && <Profile />}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
