import { useState } from 'react';
import { LogOut, User, Bell, HelpCircle, FileText, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { EditProfile } from './EditProfile';
import { NotificationSettings } from './NotificationSettings';
import { MedicalRecords } from './MedicalRecords';

type ProfileSection = 'main' | 'edit-profile' | 'notifications' | 'medical-records';

export function Profile() {
  const { profile, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState<ProfileSection>('main');

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const menuItems = [
    { icon: User, label: 'Edit Profile', action: () => setActiveSection('edit-profile') },
    { icon: Bell, label: 'Notifications', action: () => setActiveSection('notifications') },
    { icon: FileText, label: 'Medical Records', action: () => setActiveSection('medical-records') },
    { icon: HelpCircle, label: 'Help & Support', action: () => {} },
    { icon: Shield, label: 'Privacy Policy', action: () => {} },
  ];

  if (activeSection === 'edit-profile') {
    return <EditProfile onBack={() => setActiveSection('main')} />;
  }

  if (activeSection === 'notifications') {
    return <NotificationSettings onBack={() => setActiveSection('main')} />;
  }

  if (activeSection === 'medical-records') {
    return <MedicalRecords onBack={() => setActiveSection('main')} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-24">
      <div className="bg-gradient-to-br from-qivr-blue to-qivr-blue-light px-6 py-12 text-white">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold backdrop-blur mb-4">
            {profile?.full_name?.charAt(0) || 'U'}
          </div>
          <h1 className="text-2xl font-bold">{profile?.full_name || 'User'}</h1>
          <p className="text-sm opacity-90 mt-1">
            {profile?.condition ? `${profile.condition} Recovery` : 'Patient'}
          </p>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={item.action}
                className="w-full flex items-center space-x-3 px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
              >
                <Icon className="w-5 h-5 text-gray-600" />
                <span className="flex-1 text-left text-gray-700 font-medium">{item.label}</span>
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="font-semibold text-[#1F2937] mb-4">Account Information</h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Condition</span>
              <p className="font-medium text-gray-900">{profile?.condition || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Treatment Type</span>
              <p className="font-medium text-gray-900">
                {profile?.treatment_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not specified'}
              </p>
            </div>
            {profile?.surgery_date && (
              <div>
                <span className="text-sm text-gray-600">Surgery Date</span>
                <p className="font-medium text-gray-900">
                  {new Date(profile.surgery_date).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center space-x-2 bg-red-50 text-red-600 py-4 px-6 rounded-lg font-semibold hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>

        <div className="text-center text-xs text-gray-500 mt-6">
          <p>Qivr v1.0</p>
          <p className="mt-1">Genspark Agent: 92dacb25-f2da-4a96-a4c5-a2b1be8aac66</p>
        </div>
      </div>
    </div>
  );
}
