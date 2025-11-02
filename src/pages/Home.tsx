import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, AlertCircle, CheckCircle, Target, Calendar, Sparkles, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { calculateAnalytics } from '../lib/analytics';

interface HomeProps {
  onOpenChat: () => void;
}

interface LatestODI {
  percentage_score: number;
  assessment_date: string;
  disability_level: string;
}

interface PreviousODI {
  percentage_score: number;
}

interface Insight {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
  action?: string;
}

interface Appointment {
  id: string;
  appointment_date: string;
  referral_reason: string;
  status: string;
  provider: {
    provider_name: string;
    practice_name: string;
    specialty: string;
  };
}

export function Home({ onOpenChat }: HomeProps) {
  const { user, profile } = useAuth();
  const [latestODI, setLatestODI] = useState<LatestODI | null>(null);
  const [previousODI, setPreviousODI] = useState<PreviousODI | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [daysPostTreatment, setDaysPostTreatment] = useState(0);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    if (profile?.surgery_date) {
      const treatmentDate = new Date(profile.surgery_date);
      const today = new Date();
      const diffTime = today.getTime() - treatmentDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      setDaysPostTreatment(diffDays > 0 ? diffDays : 0);
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      await Promise.all([
        loadODIData(),
        loadAnalytics(),
        loadAppointments(),
      ]);
      generateInsights();
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadODIData = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('odi_assessments')
      .select('percentage_score, assessment_date, disability_level')
      .eq('patient_id', user.id)
      .order('assessment_date', { ascending: false })
      .limit(2);

    if (error) {
      console.error('Error loading ODI:', error);
      return;
    }

    if (data && data.length > 0) {
      setLatestODI(data[0]);
      if (data.length > 1) {
        setPreviousODI(data[1]);
      }
    }
  };

  const loadAnalytics = async () => {
    if (!user) return;

    try {
      const analyticsData = await calculateAnalytics(user.id);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const loadAppointments = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('patient_referrals')
        .select(`
          id,
          appointment_date,
          referral_reason,
          status,
          provider:healthcare_providers(
            provider_name,
            practice_name,
            specialty
          )
        `)
        .eq('patient_id', user.id)
        .gte('appointment_date', today)
        .in('status', ['scheduled', 'pending'])
        .order('appointment_date', { ascending: true })
        .limit(3);

      if (error) throw error;
      if (data) setAppointments(data as any);
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  const generateInsights = async () => {
    const newInsights: Insight[] = [];

    if (latestODI && previousODI) {
      const improvement = previousODI.percentage_score - latestODI.percentage_score;

      if (improvement >= 10) {
        newInsights.push({
          id: 'mcid',
          type: 'success',
          title: 'Meaningful Improvement Achieved',
          message: `Your ODI score improved by ${improvement.toFixed(0)} points - that's a clinically meaningful change! This suggests your treatment is working well.`,
          action: 'View Progress',
        });
      } else if (improvement < 0) {
        newInsights.push({
          id: 'setback',
          type: 'warning',
          title: 'Score Increased',
          message: `Your latest ODI score is ${Math.abs(improvement).toFixed(0)} points higher. This might indicate increased symptoms. Consider discussing with your care team.`,
          action: 'Track Symptoms',
        });
      }
    }

    if (analytics?.plateauDetected) {
      newInsights.push({
        id: 'plateau',
        type: 'warning',
        title: 'Progress Plateau Detected',
        message: 'Your recovery has slowed over recent assessments. This is normal, but discussing exercise modifications with your physiotherapist might help.',
        action: 'Find Providers',
      });
    }

    if (analytics?.timeToMCID && analytics.timeToMCID < 60) {
      newInsights.push({
        id: 'fast_recovery',
        type: 'success',
        title: 'Excellent Recovery Pace',
        message: `You achieved meaningful improvement in just ${analytics.timeToMCID} days - faster than average! Keep following your treatment plan.`,
      });
    }

    if (!latestODI && daysPostTreatment > 7) {
      newInsights.push({
        id: 'first_assessment',
        type: 'info',
        title: 'Time for Your First Assessment',
        message: 'Complete your baseline ODI assessment to start tracking your recovery progress and get personalized insights.',
        action: 'Take Assessment',
      });
    }

    if (latestODI && daysPostTreatment - new Date(latestODI.assessment_date).getDate() > 14) {
      newInsights.push({
        id: 'overdue_assessment',
        type: 'info',
        title: 'Assessment Due',
        message: 'It has been over 2 weeks since your last assessment. Regular tracking helps optimize your recovery.',
        action: 'Take Assessment',
      });
    }

    setInsights(newInsights.slice(0, 3));
  };

  const getScoreChange = () => {
    if (!latestODI || !previousODI) return null;
    const change = previousODI.percentage_score - latestODI.percentage_score;
    return {
      value: Math.abs(change),
      isImprovement: change > 0,
    };
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'info':
        return <Activity className="w-5 h-5 text-blue-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getInsightBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-orange-50 border-orange-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] flex items-center justify-center pb-24">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-qivr-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your co-pilot...</p>
        </div>
      </div>
    );
  }

  const scoreChange = getScoreChange();

  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-24">
      <div className="bg-gradient-to-br from-qivr-blue to-qivr-blue-light px-6 py-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">
              {greeting}, {profile?.full_name?.split(' ')[0] || 'there'}
            </h1>
            <p className="text-sm opacity-90 mt-1">Your Recovery Co-Pilot</p>
          </div>
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-lg">
            {profile?.full_name?.charAt(0) || 'U'}
          </div>
        </div>

        {daysPostTreatment > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Days Since {profile?.treatment_type === 'post_surgery' ? 'Surgery' : 'Treatment'}</p>
                <p className="text-3xl font-bold">{daysPostTreatment}</p>
              </div>
              <Calendar className="w-10 h-10 opacity-60" />
            </div>
          </div>
        )}
      </div>

      <div className="p-6 space-y-6">
        {latestODI ? (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#1F2937]">Current Functional Status</h2>
              <Target className="w-5 h-5 text-qivr-blue" />
            </div>

            <div className="flex items-center space-x-6 mb-4">
              <div className="flex-1">
                <div className="flex items-baseline space-x-2 mb-2">
                  <span className="text-4xl font-bold text-[#1F2937]">
                    {latestODI.percentage_score.toFixed(0)}%
                  </span>
                  {scoreChange && (
                    <div className={`flex items-center space-x-1 text-sm font-medium ${
                      scoreChange.isImprovement ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {scoreChange.isImprovement ? (
                        <TrendingDown className="w-4 h-4" />
                      ) : (
                        <TrendingUp className="w-4 h-4" />
                      )}
                      <span>{scoreChange.value.toFixed(0)}%</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  ODI Score • {latestODI.disability_level}
                </p>
                <p className="text-xs text-gray-500">
                  Last assessed: {new Date(latestODI.assessment_date).toLocaleDateString('en-AU', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div className="relative w-24 h-24">
                <svg className="transform -rotate-90 w-24 h-24">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#E5E7EB"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#1E9BFF"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (latestODI.percentage_score / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Activity className="w-8 h-8 text-qivr-blue" />
                </div>
              </div>
            </div>

            {scoreChange && scoreChange.isImprovement && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  <strong>Great progress!</strong> Your function is improving. Lower ODI scores indicate better daily function.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Start Tracking Your Progress</h3>
                <p className="text-sm text-blue-800 mb-4">
                  Complete your first ODI assessment to establish your baseline. Your co-pilot will use this to provide personalized guidance and track your recovery.
                </p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors">
                  Take Baseline Assessment
                </button>
              </div>
            </div>
          </div>
        )}

        {appointments.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-[#1F2937] mb-3">Upcoming Appointments</h2>
            <div className="space-y-3">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-white rounded-2xl p-4 border border-gray-200"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-qivr-blue/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-qivr-blue" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">{appointment.provider.provider_name}</h3>
                        <span className={`text-xs px-2 py-1 rounded font-medium ${
                          appointment.status === 'scheduled'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{appointment.provider.practice_name}</p>
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-qivr-blue font-medium">
                          {new Date(appointment.appointment_date).toLocaleDateString('en-AU', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">{appointment.referral_reason}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {insights.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-[#1F2937] mb-3">Personalized Insights</h2>
            <div className="space-y-3">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className={`rounded-2xl p-4 border ${getInsightBgColor(insight.type)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">{insight.title}</h3>
                      <p className="text-sm text-gray-700">{insight.message}</p>
                      {insight.action && (
                        <button className="mt-3 text-sm font-medium text-qivr-blue flex items-center space-x-1 hover:text-qivr-blue-light transition-colors">
                          <span>{insight.action}</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {analytics && (
          <div className="grid grid-cols-2 gap-4">
            {analytics.timeToMCID && (
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Time to Improvement</p>
                <p className="text-2xl font-bold text-qivr-blue">{analytics.timeToMCID}</p>
                <p className="text-xs text-gray-600">days</p>
              </div>
            )}

            {analytics.trajectorySlope !== null && (
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Weekly Change</p>
                <p className={`text-2xl font-bold ${
                  analytics.trajectorySlope < 0 ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {analytics.trajectorySlope < 0 ? '↓' : '↑'} {Math.abs(analytics.trajectorySlope).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-600">per week</p>
              </div>
            )}

            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Weeks Tracking</p>
              <p className="text-2xl font-bold text-qivr-blue">{analytics.weeksSinceBaseline}</p>
              <p className="text-xs text-gray-600">since baseline</p>
            </div>

            {analytics.painFunctionCorrelation !== null && (
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Pain-Function Link</p>
                <p className="text-2xl font-bold text-qivr-blue">
                  {(analytics.painFunctionCorrelation * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-gray-600">correlation</p>
              </div>
            )}
          </div>
        )}

        <div className="bg-gradient-to-br from-qivr-blue to-qivr-blue-light rounded-2xl p-6 text-white">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Need Guidance?</h3>
              <p className="text-sm opacity-90 mb-4">
                Ask your AI co-pilot about your recovery, exercises, symptoms, or any questions about your treatment plan.
              </p>
              <button
                onClick={onOpenChat}
                className="bg-white text-qivr-blue px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                Ask Co-Pilot
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
