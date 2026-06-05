/**
 * CareerOS Market Intelligence - Career Market Profile Model
 *
 * Single authoritative market profile for a career.
 *
 * This is THE output of the profile generation system.
 * All recommendation engines consume these profiles.
 */

/**
 * Unique identifier for career market profiles.
 */
export type CareerMarketProfileId = string & { readonly __brand: 'CareerMarketProfileId' };

/**
 * Market outlook categories.
 */
export type MarketOutlook = 'excellent' | 'good' | 'neutral' | 'caution' | 'poor';

/**
 * Geographic market presence.
 */
export interface GeographicPresence {
  /** State/UT code */
  region: string;

  /** Demand score for this region (0-100) */
  demandScore: number;

  /** Salary score for this region (0-100) */
  salaryScore: number;

  /** Number of job postings in this region */
  jobCount: number;

  /** Growth rate in this region (%) */
  growthRate: number;
}

/**
 * Evidence trail for a profile score.
 */
export interface ProfileEvidence {
  /** Source of the evidence */
  source: string;

  /** Signal type */
  signalType: string;

  /** Timestamp of evidence */
  timestamp: Date;

  /** Raw strength value */
  strength: number;

  /** Confidence in this evidence */
  confidence: number;

  /** Context */
  context?: Record<string, unknown>;
}

/**
 * Score breakdown showing contribution of each factor.
 */
export interface ScoreBreakdown {
  /** Base value before adjustments */
  baseValue: number;

  /** Adjustments applied */
  adjustments: Array<{
    factor: string;
    impact: number;
    reason: string;
  }>;

  /** Final calculated score */
  finalScore: number;

  /** Contributing evidence */
  evidence: ProfileEvidence[];
}

/**
 * Complete market profile for a career.
 *
 * This is the single source of truth for career market intelligence.
 * All CareerOS modules consume this data for decision-making.
 */
export interface CareerMarketProfile {
  /** Unique profile ID */
  readonly id: CareerMarketProfileId;

  /** Career identifier */
  readonly careerId: string;

  // ============================================================================
  // CORE SCORES (0-100 scale)
  // ============================================================================

  /** Labor market demand (0-100) */
  readonly demandScore: number;

  /** Economic attractiveness (0-100) */
  readonly salaryScore: number;

  /** Career expansion rate (0-100) */
  readonly growthScore: number;

  /** Talent shortage level (0-100) */
  readonly scarcityScore: number;

  /** Automation disruption risk (0-100, higher = more risk) */
  readonly automationRiskScore: number;

  /** Long-term survivability (0-100) */
  readonly futureResilienceScore: number;

  /** Overall opportunity assessment (0-100) */
  readonly opportunityScore: number;

  // ============================================================================
  // CONFIDENCE
  // ============================================================================

  /** Overall confidence in this profile (0-100) */
  readonly confidence: number;

  /** Confidence breakdown by component */
  readonly confidenceBreakdown: {
    demandConfidence: number;
    salaryConfidence: number;
    growthConfidence: number;
    scarcityConfidence: number;
    automationRiskConfidence: number;
    resilienceConfidence: number;
  };

  // ============================================================================
  // METADATA
  // ============================================================================

  /** Profile version (increments on update) */
  readonly version: number;

  /** Last update timestamp */
  readonly lastUpdated: Date;

  /** Data freshness (hours since last signal) */
  readonly dataFreshness: number;

  /** Total number of signals used */
  readonly signalCount: number;

  /** Number of unique sources */
  readonly sourceCount: number;

  // ============================================================================
  // ANALYSIS
  // ============================================================================

  /** Overall market outlook */
  readonly outlook: MarketOutlook;

  /** Market trend direction */
  readonly trendDirection: 'improving' | 'stable' | 'declining' | 'volatile';

  /** Regional breakdown */
  readonly geographicPresence: GeographicPresence[];

  /** Top hiring regions */
  readonly topRegions: string[];

  /** Score breakdowns (explainability) */
  readonly breakdowns: {
    demand: ScoreBreakdown;
    salary: ScoreBreakdown;
    growth: ScoreBreakdown;
    scarcity: ScoreBreakdown;
    automationRisk: ScoreBreakdown;
    resilience: ScoreBreakdown;
    opportunity: ScoreBreakdown;
  };

  /** Key insights */
  readonly insights: string[];

  /** Risk flags */
  readonly riskFlags: string[];
}

/**
 * Profile update operation.
 */
export interface CareerMarketProfileUpdate {
  /** Profile ID */
  profileId: CareerMarketProfileId;

  /** Scores to update */
  scores?: Partial<Pick<CareerMarketProfile, 
    'demandScore' | 
    'salaryScore' | 
    'growthScore' | 
    'scarcityScore' | 
    'automationRiskScore' | 
    'futureResilienceScore' | 
    'opportunityScore'
  >>;

  /** Confidence override */
  confidence?: number;

  /** Update reason */
  reason: string;

  /** Update timestamp */
  timestamp: Date;
}

/**
 * Profile snapshot for historical tracking.
 */
export interface CareerMarketProfileSnapshot {
  /** Snapshot ID */
  id: string;

  /** Profile version */
  version: number;

  /** Snapshot timestamp */
  timestamp: Date;

  /** Core scores at this point */
  scores: {
    demandScore: number;
    salaryScore: number;
    growthScore: number;
    scarcityScore: number;
    automationRiskScore: number;
    futureResilienceScore: number;
    opportunityScore: number;
  };

  /** Confidence at this point */
  confidence: number;

  /** Outlook at this point */
  outlook: MarketOutlook;
}

/**
 * Profile comparison result.
 */
export interface CareerMarketProfileComparison {
  /** Base career ID */
  baseCareerId: string;

  /** Comparison career ID */
  comparisonCareerId: string;

  /** Score differences (positive = comparison is better) */
  differences: {
    demandScore: number;
    salaryScore: number;
    growthScore: number;
    scarcityScore: number;
    automationRiskScore: number;
    futureResilienceScore: number;
    opportunityScore: number;
  };

  /** Comparative advantages */
  baseAdvantages: string[];
  comparisonAdvantages: string[];

  /** Overall comparison */
  winner: 'base' | 'comparison' | 'tie';
  confidence: number;
}

/**
 * Calculate overall market outlook from scores.
 */
export function calculateMarketOutlook(
  demandScore: number,
  salaryScore: number,
  growthScore: number,
  automationRiskScore: number,
  futureResilienceScore: number
): MarketOutlook {
  // Weighted average
  const weightedScore =
    demandScore * 0.25 +
    salaryScore * 0.2 +
    growthScore * 0.2 +
    futureResilienceScore * 0.2 +
    (100 - automationRiskScore) * 0.15;

  if (weightedScore >= 80) return 'excellent';
  if (weightedScore >= 65) return 'good';
  if (weightedScore >= 45) return 'neutral';
  if (weightedScore >= 30) return 'caution';
  return 'poor';
}

/**
 * Calculate trend direction from score history.
 */
export function calculateTrendDirection(
  currentScores: number[],
  previousScores: number[]
): CareerMarketProfile['trendDirection'] {
  if (currentScores.length < 2 || previousScores.length < 2) {
    return 'stable';
  }

  const currentAvg = currentScores.reduce((a, b) => a + b, 0) / currentScores.length;
  const previousAvg = previousScores.reduce((a, b) => a + b, 0) / previousScores.length;

  const change = currentAvg - previousAvg;
  const volatility = Math.abs(change);

  if (volatility > 20) return 'volatile';
  if (change > 5) return 'improving';
  if (change < -5) return 'declining';
  return 'stable';
}

/**
 * Validate a career market profile.
 */
export function validateCareerMarketProfile(profile: CareerMarketProfile): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check score ranges
  const scores = [
    { name: 'demandScore', value: profile.demandScore },
    { name: 'salaryScore', value: profile.salaryScore },
    { name: 'growthScore', value: profile.growthScore },
    { name: 'scarcityScore', value: profile.scarcityScore },
    { name: 'automationRiskScore', value: profile.automationRiskScore },
    { name: 'futureResilienceScore', value: profile.futureResilienceScore },
    { name: 'opportunityScore', value: profile.opportunityScore },
    { name: 'confidence', value: profile.confidence },
  ];

  for (const score of scores) {
    if (score.value < 0 || score.value > 100) {
      errors.push(`${score.name} must be between 0-100, got ${score.value}`);
    }
  }

  // Check confidence
  if (profile.confidence < 20) {
    errors.push(`Confidence too low: ${profile.confidence}`);
  }

  // Check version
  if (profile.version < 1) {
    errors.push(`Version must be >= 1, got ${profile.version}`);
  }

  // Check freshness
  if (profile.dataFreshness > 168) { // 1 week
    errors.push(`Data stale: ${profile.dataFreshness} hours old`);
  }

  // Check signal count
  if (profile.signalCount < 3) {
    errors.push(`Insufficient signals: ${profile.signalCount}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
