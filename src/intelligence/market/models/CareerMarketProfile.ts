/**
 * CareerOS Market Intelligence - Career Market Profile Model
 *
 * Standardized market profile for every career.
 * This is the authoritative output of the market intelligence system.
 */

/**
 * Unique identifier for career market profiles.
 */
export type CareerMarketProfileId = string;

/**
 * Market outlook classification.
 */
export enum MarketOutlook {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  NEUTRAL = 'NEUTRAL',
  CAUTION = 'CAUTION',
  POOR = 'POOR',
}

/**
 * Career market profile.
 * 
 * The single source of truth for market intelligence about a career.
 * All scores range from 0-100 and are normalized.
 */
export interface CareerMarketProfile {
  /** Unique identifier */
  readonly id: CareerMarketProfileId;

  /** Career identifier */
  readonly careerId: string;

  /** Market demand score (0-100) */
  readonly demandScore: number;

  /** Salary attractiveness score (0-100) */
  readonly salaryScore: number;

  /** Growth trajectory score (0-100) */
  readonly growthScore: number;

  /** Talent scarcity score (0-100, higher = more scarce) */
  readonly scarcityScore: number;

  /** Automation/disruption risk (0-100, higher = more risk) */
  readonly automationRiskScore: number;

  /** Future resilience score (0-100) */
  readonly futureResilienceScore: number;

  /** Overall market outlook */
  readonly outlook: MarketOutlook;

  /** Confidence in all scores (0-100) */
  readonly confidence: number;

  /** Last updated timestamp */
  readonly lastUpdated: Date;

  /** Version of profile */
  readonly version: number;

  /** Historical snapshots */
  readonly history: CareerMarketProfileSnapshot[];

  /** Component breakdown */
  readonly components: {
    /** Demand component details */
    demand: {
      jobPostingsTrend: number;
      hiringRate: number;
      competitionRatio: number;
    };

    /** Salary component details */
    salary: {
      entryLevelTrend: number;
      midLevelTrend: number;
      seniorLevelTrend: number;
    };

    /** Growth component details */
    growth: {
      sectorGrowth: number;
      investmentFlow: number;
      startupActivity: number;
    };

    /** Scarcity component details */
    scarcity: {
      qualifiedCandidatesRatio: number;
      skillGapSeverity: number;
      educationPipelineStrength: number;
    };

    /** Automation risk component details */
    automationRisk: {
      taskAutomationPotential: number;
      aiDisruptionRisk: number;
      technologicalObsolescenceRisk: number;
    };

    /** Resilience component details */
    resilience: {
      crossIndustryTransferability: number;
      skillLongevity: number;
      adaptabilityRequirements: number;
    };
  };

  /** Supporting evidence */
  readonly evidence: {
    /** Number of signals analyzed */
    signalCount: number;

    /** Primary data sources */
    sources: string[];

    /** Analysis period */
    analysisPeriod: {
      start: Date;
      end: Date;
    };

    /** Key market events */
    keyEvents: Array<{
      date: Date;
      description: string;
      impact: 'positive' | 'negative' | 'neutral';
    }>;
  };
}

/**
 * Historical snapshot of a career market profile.
 */
export interface CareerMarketProfileSnapshot {
  /** Snapshot identifier */
  readonly id: string;

  /** Version number */
  readonly version: number;

  /** Snapshot timestamp */
  readonly timestamp: Date;

  /** Scores at this point in time */
  readonly scores: {
    demandScore: number;
    salaryScore: number;
    growthScore: number;
    scarcityScore: number;
    automationRiskScore: number;
    futureResilienceScore: number;
  };

  /** Confidence at this point in time */
  readonly confidence: number;

  /** Outlook at this point in time */
  readonly outlook: MarketOutlook;
}

/**
 * Market profile comparison result.
 */
export interface CareerMarketProfileComparison {
  /** Base career */
  readonly baseCareerId: string;

  /** Comparison career */
  readonly comparisonCareerId: string;

  /** Score differences (positive = base career is better) */
  readonly differences: {
    demandScore: number;
    salaryScore: number;
    growthScore: number;
    scarcityScore: number;
    automationRiskScore: number;
    futureResilienceScore: number;
  };

  /** Overall comparison */
  readonly overall: {
    winner: string | 'tie';
    margin: number;
    confidence: number;
  };

  /** Comparative advantages */
  readonly advantages: {
    base: string[];
    comparison: string[];
  };
}

/**
 * Market profile update input.
 */
export interface CareerMarketProfileUpdate {
  /** Career identifier */
  readonly careerId: string;

  /** Updated scores (partial) */
  readonly scores?: Partial<{
    demandScore: number;
    salaryScore: number;
    growthScore: number;
    scarcityScore: number;
    automationRiskScore: number;
    futureResilienceScore: number;
  }>;

  /** Updated component details (partial) */
  readonly components?: Partial<CareerMarketProfile['components']>;

  /** New evidence to add */
  readonly newEvidence?: CareerMarketProfile['evidence'];

  /** Update timestamp */
  readonly timestamp: Date;
}

/**
 * Market profile validation result.
 */
export interface CareerMarketProfileValidation {
  /** Is the profile valid */
  readonly isValid: boolean;

  /** Validation issues */
  readonly issues: string[];

  /** Warnings */
  readonly warnings: string[];

  /** Score quality assessment */
  readonly scoreQuality: {
    demandScore: 'good' | 'adequate' | 'poor';
    salaryScore: 'good' | 'adequate' | 'poor';
    growthScore: 'good' | 'adequate' | 'poor';
    scarcityScore: 'good' | 'adequate' | 'poor';
    automationRiskScore: 'good' | 'adequate' | 'poor';
    futureResilienceScore: 'good' | 'adequate' | 'poor';
  };
}

/**
 * Factory function to create a career market profile.
 */
export function createCareerMarketProfile(
  careerId: string,
  scores: {
    demandScore: number;
    salaryScore: number;
    growthScore: number;
    scarcityScore: number;
    automationRiskScore: number;
    futureResilienceScore: number;
  },
  confidence: number,
  components: CareerMarketProfile['components'],
  evidence: CareerMarketProfile['evidence']
): CareerMarketProfile {
  const now = new Date();

  // Calculate overall outlook
  const averageScore =
    (scores.demandScore +
      scores.salaryScore +
      scores.growthScore +
      scores.futureResilienceScore -
      scores.automationRiskScore) /
    5;

  let outlook: MarketOutlook;
  if (averageScore >= 80) outlook = MarketOutlook.EXCELLENT;
  else if (averageScore >= 65) outlook = MarketOutlook.GOOD;
  else if (averageScore >= 45) outlook = MarketOutlook.NEUTRAL;
  else if (averageScore >= 30) outlook = MarketOutlook.CAUTION;
  else outlook = MarketOutlook.POOR;

  return {
    id: `profile-${careerId}-${Date.now()}`,
    careerId,
    ...scores,
    outlook,
    confidence: Math.max(0, Math.min(100, confidence)),
    lastUpdated: now,
    version: 1,
    history: [],
    components,
    evidence,
  };
}

/**
 * Validate a career market profile.
 */
export function validateCareerMarketProfile(
  profile: CareerMarketProfile
): CareerMarketProfileValidation {
  const issues: string[] = [];
  const warnings: string[] = [];
  const scoreQuality: CareerMarketProfileValidation['scoreQuality'] = {
    demandScore: 'good',
    salaryScore: 'good',
    growthScore: 'good',
    scarcityScore: 'good',
    automationRiskScore: 'good',
    futureResilienceScore: 'good',
  };

  // Validate all scores are in range
  const scores = [
    { name: 'demandScore', value: profile.demandScore },
    { name: 'salaryScore', value: profile.salaryScore },
    { name: 'growthScore', value: profile.growthScore },
    { name: 'scarcityScore', value: profile.scarcityScore },
    { name: 'automationRiskScore', value: profile.automationRiskScore },
    { name: 'futureResilienceScore', value: profile.futureResilienceScore },
  ];

  for (const score of scores) {
    if (score.value < 0 || score.value > 100) {
      issues.push(`${score.name} must be between 0 and 100`);
      scoreQuality[score.name as keyof typeof scoreQuality] = 'poor';
    } else if (score.value < 20 || score.value > 80) {
      // Extreme values warrant a warning
      warnings.push(`${score.name} has extreme value (${score.value})`);
    }
  }

  // Validate confidence
  if (profile.confidence < 0 || profile.confidence > 100) {
    issues.push('Confidence must be between 0 and 100');
  } else if (profile.confidence < 30) {
    warnings.push('Confidence is very low');
  }

  // Validate career ID
  if (!profile.careerId || profile.careerId.trim() === '') {
    issues.push('Career ID is required');
  }

  // Validate evidence
  if (!profile.evidence || profile.evidence.signalCount === 0) {
    warnings.push('Profile has no supporting evidence');
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
    scoreQuality,
  };
}

/**
 * Compare two career market profiles.
 */
export function compareCareerMarketProfiles(
  base: CareerMarketProfile,
  comparison: CareerMarketProfile
): CareerMarketProfileComparison {
  const differences = {
    demandScore: base.demandScore - comparison.demandScore,
    salaryScore: base.salaryScore - comparison.salaryScore,
    growthScore: base.growthScore - comparison.growthScore,
    scarcityScore: base.scarcityScore - comparison.scarcityScore,
    automationRiskScore: comparison.automationRiskScore - base.automationRiskScore, // Inverted
    futureResilienceScore: base.futureResilienceScore - comparison.futureResilienceScore,
  };

  // Calculate overall margin
  const margin =
    (differences.demandScore +
      differences.salaryScore +
      differences.growthScore +
      differences.scarcityScore +
      differences.automationRiskScore +
      differences.futureResilienceScore) /
    6;

  // Determine winner
  let winner: string | 'tie';
  if (Math.abs(margin) < 5) {
    winner = 'tie';
  } else if (margin > 0) {
    winner = base.careerId;
  } else {
    winner = comparison.careerId;
  }

  // Identify advantages
  const baseAdvantages: string[] = [];
  const comparisonAdvantages: string[] = [];

  if (differences.demandScore > 10) baseAdvantages.push('Higher demand');
  if (differences.demandScore < -10) comparisonAdvantages.push('Higher demand');

  if (differences.salaryScore > 10) baseAdvantages.push('Better salary prospects');
  if (differences.salaryScore < -10) comparisonAdvantages.push('Better salary prospects');

  if (differences.growthScore > 10) baseAdvantages.push('Stronger growth');
  if (differences.growthScore < -10) comparisonAdvantages.push('Stronger growth');

  if (differences.automationRiskScore > 10) baseAdvantages.push('Lower automation risk');
  if (differences.automationRiskScore < -10) comparisonAdvantages.push('Lower automation risk');

  return {
    baseCareerId: base.careerId,
    comparisonCareerId: comparison.careerId,
    differences,
    overall: {
      winner,
      margin: Math.abs(margin),
      confidence: Math.min(base.confidence, comparison.confidence),
    },
    advantages: {
      base: baseAdvantages,
      comparison: comparisonAdvantages,
    },
  };
}
