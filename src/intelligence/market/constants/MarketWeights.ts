/**
 * CareerOS Market Intelligence - Market Weights
 *
 * Centralized weighting configuration for all market intelligence calculations.
 * No hardcoded weights inside engines - all weights defined here.
 */

// ============================================================================
// SIGNAL PROCESSING WEIGHTS
// ============================================================================

/**
 * Weights for normalizing different signal types.
 */
export const SIGNAL_TYPE_WEIGHTS: Record<string, number> = {
  job_postings: 1.0,
  salary_growth: 1.0,
  skill_growth: 0.9,
  layoffs: 1.2, // Higher weight for negative signals
  government_push: 0.85,
  startup_activity: 0.9,
  investment_flow: 0.95,
} as const;

/**
 * Source reliability weights.
 * These multiply signal confidence based on source trustworthiness.
 */
export const SOURCE_RELIABILITY_WEIGHTS: Record<string, number> = {
  ncs_india: 0.95, // Government - highest reliability
  nsdc: 0.95,
  nasscom: 0.9, // Industry association
  government_report: 0.95,
  industry_association: 0.88,
  research_report: 0.85,
  linkedin: 0.82, // Large professional network
  naukri: 0.8, // Major job board
  foundit: 0.78,
  indeed: 0.78,
  wef: 0.85, // World Economic Forum
  ilo: 0.88, // International Labour Organization
  news_media: 0.65, // Lower reliability
  company_announcement: 0.75,
} as const;

/**
 * Signal freshness decay weights.
 * Older signals receive lower weights.
 */
export const SIGNAL_FRESHNESS_WEIGHTS = {
  // Days to weight mapping
  recent: { days: 7, weight: 1.0 },
  moderate: { days: 30, weight: 0.85 },
  aged: { days: 90, weight: 0.65 },
  old: { days: 180, weight: 0.4 },
  stale: { days: 365, weight: 0.2 },
} as const;

// ============================================================================
// TREND CALCULATION WEIGHTS
// ============================================================================

/**
 * Weights for trend calculation methods.
 */
export const TREND_CALCULATION_WEIGHTS = {
  linearRegression: 0.4,
  movingAverage: 0.35,
  momentum: 0.25,
} as const;

/**
 * Time window weights for trend analysis.
 */
export const TREND_TIME_WINDOW_WEIGHTS = {
  shortTerm: { days: 30, weight: 0.25 },
  mediumTerm: { days: 90, weight: 0.45 },
  longTerm: { days: 180, weight: 0.3 },
} as const;

/**
 * Trend momentum weights.
 */
export const TREND_MOMENTUM_WEIGHTS = {
  acceleration: 0.4,
  rateOfChange: 0.35,
  volatility: 0.25,
} as const;

// ============================================================================
// CAREER MARKET PROFILE WEIGHTS
// ============================================================================

/**
 * Weights for calculating overall market profile score.
 */
export const PROFILE_COMPONENT_WEIGHTS = {
  demandScore: 0.25,
  salaryScore: 0.2,
  growthScore: 0.2,
  scarcityScore: 0.15,
  futureResilienceScore: 0.2,
  // automationRiskScore is inverted in overall calculation
} as const;

/**
 * Sub-component weights for demand score.
 */
export const DEMAND_SUBCOMPONENT_WEIGHTS = {
  jobPostingsTrend: 0.4,
  hiringRate: 0.35,
  competitionRatio: 0.25,
} as const;

/**
 * Sub-component weights for salary score.
 */
export const SALARY_SUBCOMPONENT_WEIGHTS = {
  entryLevelTrend: 0.3,
  midLevelTrend: 0.4,
  seniorLevelTrend: 0.3,
} as const;

/**
 * Sub-component weights for growth score.
 */
export const GROWTH_SUBCOMPONENT_WEIGHTS = {
  sectorGrowth: 0.45,
  investmentFlow: 0.3,
  startupActivity: 0.25,
} as const;

/**
 * Sub-component weights for scarcity score.
 */
export const SCARCITY_SUBCOMPONENT_WEIGHTS = {
  qualifiedCandidatesRatio: 0.4,
  skillGapSeverity: 0.35,
  educationPipelineStrength: 0.25,
} as const;

/**
 * Sub-component weights for automation risk score.
 */
export const AUTOMATION_RISK_SUBCOMPONENT_WEIGHTS = {
  taskAutomationPotential: 0.5,
  aiDisruptionRisk: 0.3,
  technologicalObsolescenceRisk: 0.2,
} as const;

/**
 * Sub-component weights for future resilience score.
 */
export const RESILIENCE_SUBCOMPONENT_WEIGHTS = {
  crossIndustryTransferability: 0.35,
  skillLongevity: 0.4,
  adaptabilityRequirements: 0.25,
} as const;

// ============================================================================
// CONFIDENCE CALCULATION WEIGHTS
// ============================================================================

/**
 * Weights for confidence calculation factors.
 */
export const CONFIDENCE_FACTOR_WEIGHTS = {
  signalQuality: 0.3,
  signalQuantity: 0.25,
  sourceReliability: 0.2,
  dataFreshness: 0.15,
  consistency: 0.1,
} as const;

/**
 * Minimum thresholds for confidence levels.
 */
export const CONFIDENCE_THRESHOLDS = {
  veryHigh: 90,
  high: 75,
  moderate: 60,
  low: 40,
  veryLow: 20,
} as const;

// ============================================================================
// EMERGING CAREER DETECTION WEIGHTS
// ============================================================================

/**
 * Weights for emerging career confidence calculation.
 */
export const EMERGING_CAREER_CONFIDENCE_WEIGHTS = {
  signalStrength: 0.35,
  signalConsistency: 0.25,
  sourceDiversity: 0.2,
  growthTrajectory: 0.2,
} as const;

/**
 * Growth rate thresholds for trajectory classification.
 */
export const GROWTH_RATE_THRESHOLDS = {
  explosive: 50, // >50% annual
  rapid: 30, // >30% annual
  strong: 15, // >15% annual
  moderate: 5, // >5% annual
} as const;

/**
 * Evidence source weights for emerging careers.
 */
export const EMERGING_CAREER_EVIDENCE_WEIGHTS = {
  job_postings: 1.0,
  skills_mention: 0.85,
  startup_titles: 0.9,
  industry_reports: 0.88,
  news_mentions: 0.65,
  social_media: 0.5,
  academic_research: 0.75,
} as const;

// ============================================================================
// AGGREGATION WEIGHTS
// ============================================================================

/**
 * Weights for signal aggregation.
 */
export const SIGNAL_AGGREGATION_WEIGHTS = {
  recency: 0.35,
  confidence: 0.3,
  sourceReliability: 0.25,
  signalStrength: 0.1,
} as const;

/**
 * Multi-source aggregation method weights.
 */
export const MULTI_SOURCE_AGGREGATION_WEIGHTS = {
  weightedAverage: 0.6,
  median: 0.25,
  trimMean: 0.15,
} as const;

// ============================================================================
// MARKET SNAPSHOT WEIGHTS
// ============================================================================

/**
 * Weights for market snapshot trend calculation.
 */
export const SNAPSHOT_TREND_WEIGHTS = {
  demandTrend: 0.3,
  salaryTrend: 0.25,
  hiringTrend: 0.25,
  futureOutlook: 0.2,
  // automationRisk is inverted
} as const;

/**
 * Weights for signal summary in snapshots.
 */
export const SNAPSHOT_SIGNAL_SUMMARY_WEIGHTS = {
  totalSignals: 0.4,
  averageSignalQuality: 0.35,
  sourceDiversity: 0.25,
} as const;

// ============================================================================
// OUTLOOK CALCULATION WEIGHTS
// ============================================================================

/**
 * Weights for overall market outlook calculation.
 */
export const OUTLOOK_CALCULATION_WEIGHTS = {
  demand: 0.25,
  salary: 0.2,
  growth: 0.2,
  resilience: 0.2,
  automationRisk: 0.15, // Inverted
} as const;

/**
 * Outlook score thresholds.
 */
export const OUTLOOK_SCORE_THRESHOLDS = {
  excellent: 80,
  good: 65,
  neutral: 45,
  caution: 30,
  poor: 0,
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate weighted score from components.
 */
export function calculateWeightedScore(
  components: Record<string, number>,
  weights: Record<string, number>
): number {
  let totalWeight = 0;
  let weightedSum = 0;

  for (const [key, weight] of Object.entries(weights)) {
    if (components[key] !== undefined) {
      weightedSum += components[key] * weight;
      totalWeight += weight;
    }
  }

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

/**
 * Get signal freshness weight based on age.
 */
export function getSignalFreshnessWeight(ageDays: number): number {
  if (ageDays <= SIGNAL_FRESHNESS_WEIGHTS.recent.days) {
    return SIGNAL_FRESHNESS_WEIGHTS.recent.weight;
  } else if (ageDays <= SIGNAL_FRESHNESS_WEIGHTS.moderate.days) {
    const factor =
      (ageDays - SIGNAL_FRESHNESS_WEIGHTS.recent.days) /
      (SIGNAL_FRESHNESS_WEIGHTS.moderate.days - SIGNAL_FRESHNESS_WEIGHTS.recent.days);
    return (
      SIGNAL_FRESHNESS_WEIGHTS.recent.weight -
      factor *
        (SIGNAL_FRESHNESS_WEIGHTS.recent.weight - SIGNAL_FRESHNESS_WEIGHTS.moderate.weight)
    );
  } else if (ageDays <= SIGNAL_FRESHNESS_WEIGHTS.aged.days) {
    const factor =
      (ageDays - SIGNAL_FRESHNESS_WEIGHTS.moderate.days) /
      (SIGNAL_FRESHNESS_WEIGHTS.aged.days - SIGNAL_FRESHNESS_WEIGHTS.moderate.days);
    return (
      SIGNAL_FRESHNESS_WEIGHTS.moderate.weight -
      factor *
        (SIGNAL_FRESHNESS_WEIGHTS.moderate.weight - SIGNAL_FRESHNESS_WEIGHTS.aged.weight)
    );
  } else if (ageDays <= SIGNAL_FRESHNESS_WEIGHTS.old.days) {
    const factor =
      (ageDays - SIGNAL_FRESHNESS_WEIGHTS.aged.days) /
      (SIGNAL_FRESHNESS_WEIGHTS.old.days - SIGNAL_FRESHNESS_WEIGHTS.aged.days);
    return (
      SIGNAL_FRESHNESS_WEIGHTS.aged.weight -
      factor *
        (SIGNAL_FRESHNESS_WEIGHTS.aged.weight - SIGNAL_FRESHNESS_WEIGHTS.old.weight)
    );
  } else {
    return SIGNAL_FRESHNESS_WEIGHTS.stale.weight;
  }
}

/**
 * Get source reliability weight.
 */
export function getSourceReliabilityWeight(source: string): number {
  return SOURCE_RELIABILITY_WEIGHTS[source] ?? 0.7; // Default to 0.7 for unknown sources
}

/**
 * Get confidence level label.
 */
export function getConfidenceLevelLabel(confidence: number): string {
  if (confidence >= CONFIDENCE_THRESHOLDS.veryHigh) return 'very_high';
  if (confidence >= CONFIDENCE_THRESHOLDS.high) return 'high';
  if (confidence >= CONFIDENCE_THRESHOLDS.moderate) return 'moderate';
  if (confidence >= CONFIDENCE_THRESHOLDS.low) return 'low';
  return 'very_low';
}

/**
 * Normalize score to 0-100 range.
 */
export function normalizeScore(score: number, min: number = 0, max: number = 100): number {
  if (max === min) return 50;
  const normalized = ((score - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, normalized));
}
