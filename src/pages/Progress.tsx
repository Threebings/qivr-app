import { useState, useEffect } from 'react';
import { TrendingDown, TrendingUp, Award, Calendar, Plus, Activity, Target, BarChart3, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ODIAssessment } from '../components/ODIAssessment';
import { calculateAnalytics, getBenchmarkComparison } from '../lib/analytics';

interface ODIAssessmentData {
  id: string;
  assessment_date: string;
  pain_intensity: number;
  personal_care: number;
  lifting: number;
  walking: number;
  sitting: number;
  standing: number;
  sleeping: number;
  sex_life: number;
  social_life: number;
  traveling: number;
  total_score: number;
  percentage_score: number;
  disability_level: string;
  is_baseline?: boolean;
  created_at: string;
}

interface AnalyticsData {
  timeToMCID: number | null;
  trajectorySlope: number | null;
  painFunctionCorrelation: number | null;
  weeksSinceBaseline: number;
  plateauDetected: boolean;
}

interface BenchmarkData {
  mean: number;
  percentile: number;
  interpretation: string;
}

export function Progress() {
  const { user, profile } = useAuth();
  const [odiAssessments, setOdiAssessments] = useState<ODIAssessmentData[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [benchmark, setBenchmark] = useState<BenchmarkData | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | '3months' | 'all'>('3months');
  const [loading, setLoading] = useState(true);
  const [showODIAssessment, setShowODIAssessment] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    await loadODIAssessments();
    await loadAnalytics();
    await loadBenchmark();
  };

  const generateDemoData = () => {
    const today = new Date();
    const demoData: ODIAssessmentData[] = [];

    const baselineDate = new Date(today);
    baselineDate.setDate(today.getDate() - 90);

    const scores = [
      { days: 0, score: 68, level: 'crippled' },
      { days: 7, score: 64, level: 'crippled' },
      { days: 14, score: 58, level: 'severe' },
      { days: 21, score: 54, level: 'severe' },
      { days: 28, score: 48, level: 'severe' },
      { days: 35, score: 44, level: 'severe' },
      { days: 42, score: 38, level: 'moderate' },
      { days: 49, score: 36, level: 'moderate' },
      { days: 56, score: 32, level: 'moderate' },
      { days: 63, score: 28, level: 'moderate' },
      { days: 70, score: 26, level: 'moderate' },
      { days: 77, score: 22, level: 'moderate' },
      { days: 84, score: 20, level: 'minimal' },
      { days: 90, score: 18, level: 'minimal' },
    ];

    scores.forEach((point, index) => {
      const assessmentDate = new Date(baselineDate);
      assessmentDate.setDate(baselineDate.getDate() + point.days);

      const scorePerSection = Math.round(point.score / 10 / 2);

      demoData.push({
        id: `demo-${index}`,
        assessment_date: assessmentDate.toISOString().split('T')[0],
        pain_intensity: scorePerSection,
        personal_care: scorePerSection,
        lifting: scorePerSection,
        walking: scorePerSection,
        sitting: scorePerSection,
        standing: scorePerSection,
        sleeping: scorePerSection,
        sex_life: scorePerSection,
        social_life: scorePerSection,
        traveling: scorePerSection,
        total_score: point.score / 2,
        percentage_score: point.score,
        disability_level: point.level,
        is_baseline: index === 0,
        created_at: assessmentDate.toISOString(),
      });
    });

    return demoData;
  };

  const loadODIAssessments = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('odi_assessments')
        .select('*')
        .eq('patient_id', user.id)
        .order('assessment_date', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setOdiAssessments(data);
      } else {
        setOdiAssessments(generateDemoData());
      }
    } catch (error) {
      console.error('Error loading ODI assessments:', error);
      setOdiAssessments(generateDemoData());
    } finally {
      setLoading(false);
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

  const loadBenchmark = async () => {
    if (!user || !profile) return;

    const latestAssessment = odiAssessments[odiAssessments.length - 1];
    if (!latestAssessment) return;

    const treatmentType = profile.treatment_type === 'post_surgery' ? 'post_surgery' : 'conservative';
    const weeksSince = analytics?.weeksSinceBaseline || 0;

    try {
      const benchmarkData = await getBenchmarkComparison(
        latestAssessment.percentage_score,
        treatmentType,
        weeksSince
      );
      if (benchmarkData) setBenchmark(benchmarkData);
    } catch (error) {
      console.error('Error loading benchmark:', error);
    }
  };

  const getFilteredData = () => {
    const now = new Date();
    const ranges = {
      week: 7,
      month: 30,
      '3months': 90,
      all: 999999,
    };

    const days = ranges[timeRange];
    return odiAssessments.filter(d => {
      const date = new Date(d.assessment_date);
      const diffTime = now.getTime() - date.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= days;
    });
  };

  const filteredData = getFilteredData();

  const latestAssessment = odiAssessments[odiAssessments.length - 1];
  const previousAssessment = odiAssessments[odiAssessments.length - 2];

  const scoreTrend = latestAssessment && previousAssessment
    ? latestAssessment.percentage_score - previousAssessment.percentage_score
    : 0;

  const getDisabilityLabel = (level: string) => {
    const labels: Record<string, { label: string; color: string }> = {
      minimal: { label: 'Minimal Disability', color: 'text-green-700 bg-green-100' },
      moderate: { label: 'Moderate Disability', color: 'text-yellow-700 bg-yellow-100' },
      severe: { label: 'Severe Disability', color: 'text-orange-700 bg-orange-100' },
      crippled: { label: 'Crippled', color: 'text-red-700 bg-red-100' },
      bed_bound: { label: 'Bed-Bound', color: 'text-red-900 bg-red-200' },
    };
    return labels[level] || labels.minimal;
  };

  const getDisabilityColor = (percentage: number) => {
    if (percentage <= 20) return 'bg-green-500';
    if (percentage <= 40) return 'bg-yellow-500';
    if (percentage <= 60) return 'bg-orange-500';
    if (percentage <= 80) return 'bg-red-500';
    return 'bg-red-700';
  };

  if (showODIAssessment) {
    return (
      <ODIAssessment
        onComplete={(score) => {
          setShowODIAssessment(false);
          loadODIAssessments();
        }}
        onCancel={() => setShowODIAssessment(false)}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] flex items-center justify-center pb-24">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-qivr-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading progress data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-24">
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-[#1F2937]">Progress & Outcomes</h1>
      </div>

      <div className="p-6 space-y-6">
        {odiAssessments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-qivr-blue to-qivr-blue-light rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Your Recovery Progress</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start measuring your recovery with the Oswestry Disability Index (ODI), a validated tool for tracking spinal condition outcomes.
            </p>
            <button
              onClick={() => setShowODIAssessment(true)}
              className="bg-qivr-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-qivr-blue-dark transition-colors inline-flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Take Your First ODI Assessment</span>
            </button>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-br from-qivr-blue to-qivr-blue-light rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold mb-1">Current ODI Score</h2>
                  <p className="text-sm opacity-90">
                    {latestAssessment && new Date(latestAssessment.assessment_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                {scoreTrend !== 0 && (
                  <div className="flex items-center space-x-1">
                    {scoreTrend < 0 ? (
                      <TrendingDown className="w-5 h-5" />
                    ) : (
                      <TrendingUp className="w-5 h-5" />
                    )}
                    <span className="font-semibold">
                      {Math.abs(scoreTrend).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center mb-6">
                <div className="relative w-40 h-40">
                  <svg className="transform -rotate-90 w-40 h-40">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="white"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 70}`}
                      strokeDashoffset={`${2 * Math.PI * 70 * (1 - (latestAssessment?.percentage_score || 0) / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <div className="text-4xl font-bold">
                      {latestAssessment?.percentage_score.toFixed(0)}%
                    </div>
                    <div className="text-sm opacity-90">Disability</div>
                  </div>
                </div>
              </div>

              {latestAssessment && (
                <div className="text-center">
                  <div className="inline-block px-4 py-2 bg-white/20 rounded-lg backdrop-blur">
                    <span className="font-semibold">
                      {getDisabilityLabel(latestAssessment.disability_level).label}
                    </span>
                  </div>
                  {scoreTrend < 0 && (
                    <p className="text-sm opacity-90 mt-3">
                      Great progress! Your disability score decreased by {Math.abs(scoreTrend).toFixed(1)}%
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex space-x-2 overflow-x-auto">
              {(['week', 'month', '3months', 'all'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    timeRange === range
                      ? 'bg-qivr-blue text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-qivr-blue'
                  }`}
                >
                  {range === '3months' ? '3 Months' : range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-[#1F2937] mb-4">ODI Score Trend</h2>

              {filteredData.length > 0 ? (
                <>
                  <div className="h-64 flex items-end justify-between space-x-2 mb-4">
                    {filteredData.map((assessment, index) => {
                      const height = Math.max(assessment.percentage_score, 5);
                      const color = getDisabilityColor(assessment.percentage_score);

                      return (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div
                            className={`w-full ${color} rounded-t transition-all hover:opacity-75 cursor-pointer`}
                            style={{ height: `${height * 2.5}px` }}
                            title={`${assessment.percentage_score.toFixed(0)}% - ${new Date(assessment.assessment_date).toLocaleDateString()}`}
                          />
                          <span className="text-xs text-gray-500 mt-2">
                            {new Date(assessment.assessment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span>Minimal (0-20%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                      <span>Moderate (21-40%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded"></div>
                      <span>Severe (41-60%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span>Crippled (61-80%)</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No assessments in selected time range
                </div>
              )}
            </div>

            {analytics && showAnalytics && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <Target className="w-5 h-5 text-qivr-blue" />
                      <h3 className="font-semibold text-[#1F2937]">Time to MCID</h3>
                    </div>
                    {analytics.timeToMCID ? (
                      <>
                        <div className="text-3xl font-bold text-qivr-blue mb-2">
                          {analytics.timeToMCID} days
                        </div>
                        <p className="text-sm text-gray-600">
                          You achieved meaningful improvement (10-point ODI reduction) in {Math.floor(analytics.timeToMCID / 7)} weeks
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-600">
                        MCID not yet achieved. Keep tracking your progress - meaningful improvement typically occurs within 8-12 weeks.
                      </p>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <BarChart3 className="w-5 h-5 text-qivr-blue" />
                      <h3 className="font-semibold text-[#1F2937]">Recovery Trajectory</h3>
                    </div>
                    {analytics.trajectorySlope !== null ? (
                      <>
                        <div className={`text-3xl font-bold mb-2 ${
                          analytics.trajectorySlope < 0 ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {analytics.trajectorySlope < 0 ? '↓' : '↑'} {Math.abs(analytics.trajectorySlope).toFixed(1)}%
                        </div>
                        <p className="text-sm text-gray-600">
                          {analytics.trajectorySlope < 0
                            ? 'Your disability score is improving by this amount per week'
                            : 'Your scores show this level of change per week'}
                        </p>
                        {analytics.plateauDetected && (
                          <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p className="text-sm text-yellow-800">
                              <strong>Plateau detected:</strong> Your progress has slowed. Consider discussing with your physical therapist about adjusting your exercise program.
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-600">
                        Complete more assessments to see your recovery trajectory
                      </p>
                    )}
                  </div>
                </div>

                {benchmark && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <Users className="w-5 h-5 text-qivr-blue" />
                      <h3 className="font-semibold text-[#1F2937]">Population Comparison</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Your Score</span>
                          <span>Average Score</span>
                        </div>
                        <div className="relative h-12 bg-gray-200 rounded-lg overflow-hidden">
                          <div
                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-qivr-blue to-qivr-blue-light"
                            style={{ width: `${(benchmark.mean / 100) * 100}%` }}
                          />
                          <div className="absolute inset-0 flex items-center justify-between px-3">
                            <span className="text-white font-bold">
                              {latestAssessment.percentage_score.toFixed(0)}%
                            </span>
                            <span className="text-gray-700 font-bold">
                              {benchmark.mean.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-900">
                          {benchmark.interpretation === 'excellent' && (
                            <>
                              <strong className="text-blue-700">Outstanding progress!</strong> Your recovery is in the top 25% compared to similar patients at this stage.
                            </>
                          )}
                          {benchmark.interpretation === 'above_average' && (
                            <>
                              <strong className="text-blue-700">Great progress!</strong> You're performing better than average for patients with similar treatment at {analytics.weeksSinceBaseline} weeks.
                            </>
                          )}
                          {benchmark.interpretation === 'average' && (
                            <>
                              <strong className="text-blue-700">On track:</strong> Your recovery is progressing similarly to other patients with your treatment type.
                            </>
                          )}
                          {benchmark.interpretation === 'below_average' && (
                            <>
                              <strong className="text-blue-700">Opportunity for improvement:</strong> Your scores are higher than average. Discuss your exercise adherence and pain management with your care team.
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {latestAssessment && showDetails && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h2 className="text-lg font-semibold text-[#1F2937] mb-4">Latest Assessment Breakdown</h2>
                <div className="space-y-3">
                  {[
                    { label: 'Pain Intensity', value: latestAssessment.pain_intensity },
                    { label: 'Personal Care', value: latestAssessment.personal_care },
                    { label: 'Lifting', value: latestAssessment.lifting },
                    { label: 'Walking', value: latestAssessment.walking },
                    { label: 'Sitting', value: latestAssessment.sitting },
                    { label: 'Standing', value: latestAssessment.standing },
                    { label: 'Sleeping', value: latestAssessment.sleeping },
                    { label: 'Sex Life', value: latestAssessment.sex_life },
                    { label: 'Social Life', value: latestAssessment.social_life },
                    { label: 'Traveling', value: latestAssessment.traveling },
                  ].map((section, index) => (
                    <div key={index} className="flex items-center">
                      <span className="text-sm text-gray-700 w-32">{section.label}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mx-3">
                        <div
                          className={`h-2 rounded-full ${getDisabilityColor((section.value / 5) * 100)}`}
                          style={{ width: `${(section.value / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                        {section.value}/5
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                {showDetails ? 'Hide' : 'Show'} Details
              </button>

              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                {showAnalytics ? 'Hide' : 'Show'} Analytics
              </button>
            </div>

            <button
              onClick={() => setShowODIAssessment(true)}
              className="w-full bg-qivr-blue text-white py-4 px-6 rounded-lg font-semibold hover:bg-qivr-blue-dark transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Take New ODI Assessment</span>
            </button>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Why Track Your Progress with ODI?</h3>
              <p className="text-sm text-blue-800 mb-2">
                The Oswestry Disability Index is a validated tool that measures how your spinal condition affects your daily activities. Regular tracking helps you and your healthcare team:
              </p>
              <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
                <li>Make informed decisions about your treatment</li>
                <li>Detect early signs of plateau or setback</li>
                <li>Compare your progress to typical recovery patterns</li>
                <li>Celebrate meaningful improvements in function</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
