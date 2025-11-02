import { supabase } from './supabase';

interface ODIAssessment {
  id: string;
  assessment_date: string;
  percentage_score: number;
  is_baseline?: boolean;
}

interface VASScore {
  recorded_date: string;
  pain_score: number;
}

interface AnalyticsResult {
  timeToMCID: number | null;
  trajectorySlope: number | null;
  painFunctionCorrelation: number | null;
  weeksSinceBaseline: number;
  plateauDetected: boolean;
}

const ODI_MCID_THRESHOLD = 10;

export async function calculateAnalytics(patientId: string): Promise<AnalyticsResult> {
  const [odiData, vasData] = await Promise.all([
    fetchODIAssessments(patientId),
    fetchVASScores(patientId),
  ]);

  const timeToMCID = calculateTimeToMCID(odiData);
  const trajectorySlope = calculateTrajectorySlope(odiData);
  const painFunctionCorrelation = calculatePainFunctionCorrelation(odiData, vasData);
  const weeksSinceBaseline = calculateWeeksSinceBaseline(odiData);
  const plateauDetected = detectPlateau(odiData);

  const result: AnalyticsResult = {
    timeToMCID,
    trajectorySlope,
    painFunctionCorrelation,
    weeksSinceBaseline,
    plateauDetected,
  };

  await saveAnalytics(patientId, result);

  return result;
}

async function fetchODIAssessments(patientId: string): Promise<ODIAssessment[]> {
  const { data, error } = await supabase
    .from('odi_assessments')
    .select('id, assessment_date, percentage_score, is_baseline')
    .eq('patient_id', patientId)
    .order('assessment_date', { ascending: true });

  if (error) throw error;
  return data || [];
}

async function fetchVASScores(patientId: string): Promise<VASScore[]> {
  const { data, error } = await supabase
    .from('vas_pain_scores')
    .select('recorded_date, pain_score')
    .eq('patient_id', patientId)
    .order('recorded_date', { ascending: true });

  if (error) {
    console.error('Error fetching VAS scores:', error);
    return [];
  }
  return data || [];
}

function calculateTimeToMCID(assessments: ODIAssessment[]): number | null {
  if (assessments.length < 2) return null;

  const baseline = assessments.find(a => a.is_baseline) || assessments[0];
  const baselineScore = baseline.percentage_score;

  for (const assessment of assessments) {
    const improvement = baselineScore - assessment.percentage_score;

    if (improvement >= ODI_MCID_THRESHOLD) {
      const baselineDate = new Date(baseline.assessment_date);
      const achievementDate = new Date(assessment.assessment_date);
      const diffTime = achievementDate.getTime() - baselineDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
  }

  return null;
}

function calculateTrajectorySlope(assessments: ODIAssessment[]): number | null {
  if (assessments.length < 2) return null;

  const recentAssessments = assessments.slice(-4);
  if (recentAssessments.length < 2) return null;

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  const n = recentAssessments.length;

  recentAssessments.forEach((assessment, index) => {
    const x = index;
    const y = assessment.percentage_score;

    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

  const firstDate = new Date(recentAssessments[0].assessment_date);
  const lastDate = new Date(recentAssessments[n - 1].assessment_date);
  const daysDiff = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);
  const weeksDiff = daysDiff / 7;

  const slopePerWeek = slope * (n - 1) / weeksDiff;

  return slopePerWeek;
}

function calculatePainFunctionCorrelation(
  odiAssessments: ODIAssessment[],
  vasScores: VASScore[]
): number | null {
  if (odiAssessments.length < 3 || vasScores.length < 3) return null;

  const matchedPairs: Array<{ odi: number; vas: number }> = [];

  for (const odi of odiAssessments) {
    const odiDate = new Date(odi.assessment_date);

    const closestVAS = vasScores.reduce((closest, vas) => {
      const vasDate = new Date(vas.recorded_date);
      const currentDiff = Math.abs(vasDate.getTime() - odiDate.getTime());
      const closestDiff = Math.abs(new Date(closest.recorded_date).getTime() - odiDate.getTime());
      return currentDiff < closestDiff ? vas : closest;
    });

    const vasDate = new Date(closestVAS.recorded_date);
    const daysDiff = Math.abs((vasDate.getTime() - odiDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff <= 3) {
      matchedPairs.push({
        odi: odi.percentage_score,
        vas: closestVAS.pain_score * 10,
      });
    }
  }

  if (matchedPairs.length < 3) return null;

  const n = matchedPairs.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0, sumYY = 0;

  matchedPairs.forEach(pair => {
    sumX += pair.odi;
    sumY += pair.vas;
    sumXY += pair.odi * pair.vas;
    sumXX += pair.odi * pair.odi;
    sumYY += pair.vas * pair.vas;
  });

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

  if (denominator === 0) return null;

  const correlation = numerator / denominator;
  return correlation;
}

function calculateWeeksSinceBaseline(assessments: ODIAssessment[]): number {
  if (assessments.length === 0) return 0;

  const baseline = assessments.find(a => a.is_baseline) || assessments[0];
  const baselineDate = new Date(baseline.assessment_date);
  const now = new Date();
  const diffTime = now.getTime() - baselineDate.getTime();
  const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));

  return diffWeeks;
}

function detectPlateau(assessments: ODIAssessment[]): boolean {
  if (assessments.length < 4) return false;

  const recentAssessments = assessments.slice(-4);

  const changes: number[] = [];
  for (let i = 1; i < recentAssessments.length; i++) {
    const change = Math.abs(
      recentAssessments[i].percentage_score - recentAssessments[i - 1].percentage_score
    );
    changes.push(change);
  }

  const allSmallChanges = changes.every(change => change < 5);

  return allSmallChanges;
}

async function saveAnalytics(patientId: string, analytics: AnalyticsResult): Promise<void> {
  try {
    await supabase.from('analytics_metrics').upsert({
      patient_id: patientId,
      metric_date: new Date().toISOString().split('T')[0],
      time_to_mcid_days: analytics.timeToMCID,
      current_trajectory_slope: analytics.trajectorySlope,
      pain_function_correlation: analytics.painFunctionCorrelation,
      weeks_since_baseline: analytics.weeksSinceBaseline,
      plateau_detected: analytics.plateauDetected,
    }, {
      onConflict: 'patient_id,metric_date'
    });
  } catch (error) {
    console.error('Error saving analytics:', error);
  }
}

export async function getBenchmarkComparison(
  patientScore: number,
  treatmentType: 'post_surgery' | 'conservative' | 'physical_therapy',
  weeksSinceTreatment: number
): Promise<{
  mean: number;
  percentile: number;
  interpretation: string;
} | null> {
  const { data, error } = await supabase
    .from('population_benchmarks')
    .select('*')
    .eq('treatment_type', treatmentType)
    .lte('weeks_post_treatment', weeksSinceTreatment)
    .order('weeks_post_treatment', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    console.error('Error fetching benchmarks:', error);
    return null;
  }

  let percentile: number;
  if (patientScore <= data.percentile_25) {
    percentile = 25;
  } else if (patientScore <= data.percentile_50) {
    percentile = 50;
  } else if (patientScore <= data.percentile_75) {
    percentile = 75;
  } else {
    percentile = 90;
  }

  let interpretation: string;
  if (percentile <= 25) {
    interpretation = 'excellent';
  } else if (percentile <= 50) {
    interpretation = 'above_average';
  } else if (percentile <= 75) {
    interpretation = 'average';
  } else {
    interpretation = 'below_average';
  }

  return {
    mean: data.mean_odi_score,
    percentile,
    interpretation,
  };
}
