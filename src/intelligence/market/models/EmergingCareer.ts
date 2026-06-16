/**
 * CareerOS Market Intelligence - Emerging Career Model
 *
 * Represents careers detected in the market that are not yet modeled in CareerOS.
 */

/**
 * Unique identifier for emerging careers.
 */
export type EmergingCareerId = string;

/**
 * Growth trajectory classification.
 */
export enum GrowthTrajectory {
  EXPLOSIVE = 'EXPLOSIVE',    // >50% annual growth
  RAPID = 'RAPID',            // 30-50% annual growth
  STRONG = 'STRONG',          // 15-30% annual growth
  MODERATE = 'MODERATE',      // 5-15% annual growth
  EARLY = 'EARLY',            // <5% but accelerating
}

export type EmergingCareerStage = 'embryonic' | 'emerging' | 'growing' | 'approaching_mainstream';

/**
 * Evidence source for emerging career detection.
 */
export interface EmergingCareerEvidence {
  /** Source type */
  sourceType:
    | 'job_postings'
    | 'skills_mention'
    | 'startup_titles'
    | 'industry_reports'
    | 'news_mentions'
    | 'social_media'
    | 'academic_research';

  /** Source name */
  source: string;

  /** Evidence strength (0-100) */
  strength: number;

  /** When this evidence was captured */
  timestamp: Date;

  /** Raw evidence data */
  rawData: {
    /** Number of mentions/occurrences */
    count: number;

    /** Time period */
    timePeriod: string;

    /** Geographic scope */
    geography: string;

    /** Additional context */
    context?: string;
  };
}

/**
 * Skill associated with emerging career.
 */
export interface EmergingCareerSkill {
  /** Skill name */
  name: string;

  /** Skill frequency in job postings */
  frequency: number;

  /** Growth in mentions */
  growthRate: number;

  /** Related to existing skills */
  relatedToExisting?: string[];
}

/**
 * Emerging career detected in market data.
 * 
 * Output from EmergingCareerEngine.
 */
export interface EmergingCareer {
  /** Unique identifier */
  readonly id: EmergingCareerId;

  /** Career title */
  readonly title: string;

  /** Alternative titles/names */
  readonly alternativeTitles: string[];

  /** Confidence in emergence (0-100) */
  readonly confidence: number;

  /** Growth trajectory classification */
  readonly growthTrajectory: GrowthTrajectory;

  /** Growth signal strength (0-100) */
  readonly growthSignal: number;

  /** Annual growth rate (%) */
  readonly annualGrowthRate: number;

  /** Evidence sources supporting emergence */
  readonly evidenceSources: EmergingCareerEvidence[];

  /** When first detected */
  readonly discoveredAt: Date;

  /** Last updated */
  readonly lastUpdated: Date;

  /** Related existing careers */
  readonly relatedCareers: string[];

  /** Key skills associated */
  readonly keySkills: EmergingCareerSkill[];

  /** Industry sectors */
  readonly industrySectors: string[];

  /** Geographic concentration */
  readonly geography: {
    primary: string;
    secondary: string[];
  };

  /** Salary indicators (if available) */
  readonly salaryIndicators?: {
    entryLevelRange?: { min: number; max: number; currency: string };
    growthTrend: 'rising' | 'stable' | 'unknown';
  };

  /** Maturity stage */
  readonly maturityStage: EmergingCareerStage;

  /** Adoption timeline estimate */
  readonly adoptionTimeline: {
    estimatedMainstreamYears: number;
    confidence: number;
  };

  /** Similarity to existing modeled careers */
  readonly similarityToModeled: Array<{
    careerId: string;
    similarityScore: number;
  }>;
}

/**
 * Emerging career detection result.
 */
export interface EmergingCareerDetectionResult {
  /** Detection timestamp */
  readonly timestamp: Date;

  /** Newly detected emerging careers */
  readonly newlyDetected: EmergingCareer[];

  /** Updated existing emerging careers */
  readonly updated: EmergingCareer[];

  /** Total emerging careers tracked */
  readonly totalTracked: number;

  /** Detection period */
  readonly detectionPeriod: {
    start: Date;
    end: Date;
  };

  /** Market summary */
  readonly summary: {
    explosiveGrowthCount: number;
    rapidGrowthCount: number;
    strongGrowthCount: number;
    topSector: string;
  };
}

/**
 * Emerging career promotion candidate.
 * 
 * Careers ready to be promoted to full CareerOS modeling.
 */
export interface EmergingCareerPromotionCandidate {
  /** Emerging career */
  readonly emergingCareer: EmergingCareer;

  /** Readiness score (0-100) */
  readonly readinessScore: number;

  /** Promotion priority */
  readonly priority: 'critical' | 'high' | 'medium' | 'low';

  /** Rationale for promotion */
  readonly rationale: string[];

  /** Missing data for full modeling */
  readonly missingData: string[];

  /** Recommended modeling approach */
  readonly modelingApproach: 'from_scratch' | 'adapt_similar' | 'merge_existing';

  /** Similar careers to use as template */
  readonly suggestedTemplates?: string[];
}

/**
 * Emerging career filtering criteria.
 */
export interface EmergingCareerFilter {
  /** Minimum confidence threshold */
  minConfidence?: number;

  /** Minimum growth rate */
  minGrowthRate?: number;

  /** Growth trajectories to include */
  trajectories?: GrowthTrajectory[];

  /** Industry sectors */
  sectors?: string[];

  /** Geographic focus */
  geography?: string;

  /** Maturity stages */
  maturityStages?: EmergingCareer['maturityStage'][];

  /** Maximum age (days since discovery) */
  maxAgeDays?: number;
}

/**
 * Emerging career trend analysis.
 */
export interface EmergingCareerTrendAnalysis {
  /** Analysis timestamp */
  readonly timestamp: Date;

  /** Total emerging careers by trajectory */
  readonly byTrajectory: Record<GrowthTrajectory, number>;

  /** Total emerging careers by sector */
  readonly bySector: Record<string, number>;

  /** Emerging career velocity (new per month) */
  readonly velocity: number;

  /** Trending skill clusters */
  readonly trendingSkillClusters: Array<{
    skills: string[];
    frequency: number;
    growthRate: number;
  }>;

  /** Prediction for next quarter */
  readonly nextQuarterPrediction: {
    expectedNewEmerging: number;
    expectedPromotions: number;
    topEmergingSectors: string[];
  };
}

/**
 * Factory function to create an emerging career.
 */
export function createEmergingCareer(
  title: string,
  confidence: number,
  growthSignal: number,
  annualGrowthRate: number,
  evidenceSources: EmergingCareerEvidence[],
  keySkills: EmergingCareerSkill[],
  industrySectors: string[]
): EmergingCareer {
  const now = new Date();

  // Determine growth trajectory
  let growthTrajectory: GrowthTrajectory;
  if (annualGrowthRate > 50) growthTrajectory = GrowthTrajectory.EXPLOSIVE;
  else if (annualGrowthRate > 30) growthTrajectory = GrowthTrajectory.RAPID;
  else if (annualGrowthRate > 15) growthTrajectory = GrowthTrajectory.STRONG;
  else if (annualGrowthRate > 5) growthTrajectory = GrowthTrajectory.MODERATE;
  else growthTrajectory = GrowthTrajectory.EARLY;

  // Determine maturity stage
  let maturityStage: EmergingCareer['maturityStage'];
  if (confidence < 40) maturityStage = 'embryonic';
  else if (confidence < 60) maturityStage = 'emerging';
  else if (confidence < 80) maturityStage = 'growing';
  else maturityStage = 'approaching_mainstream';

  return {
    id: `emerging-${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
    title,
    alternativeTitles: [],
    confidence: Math.max(0, Math.min(100, confidence)),
    growthTrajectory,
    growthSignal: Math.max(0, Math.min(100, growthSignal)),
    annualGrowthRate,
    evidenceSources,
    discoveredAt: now,
    lastUpdated: now,
    relatedCareers: [],
    keySkills,
    industrySectors,
    geography: {
      primary: 'India',
      secondary: [],
    },
    maturityStage,
    adoptionTimeline: {
      estimatedMainstreamYears: confidence > 70 ? 2 : confidence > 50 ? 3 : 5,
      confidence: Math.max(0, Math.min(100, confidence - 20)),
    },
    similarityToModeled: [],
  };
}

/**
 * Check if emerging career is ready for promotion.
 */
export function isReadyForPromotion(
  career: EmergingCareer,
  minConfidence: number = 70,
  minGrowthSignal: number = 60
): boolean {
  return (
    career.confidence >= minConfidence &&
    career.growthSignal >= minGrowthSignal &&
    career.evidenceSources.length >= 3 &&
    career.maturityStage !== 'embryonic'
  );
}

/**
 * Get promotion candidate assessment.
 */
export function assessPromotionCandidate(
  career: EmergingCareer
): EmergingCareerPromotionCandidate {
  const readinessScore = Math.round(
    career.confidence * 0.4 +
    career.growthSignal * 0.3 +
    Math.min(career.evidenceSources.length * 10, 30)
  );

  let priority: EmergingCareerPromotionCandidate['priority'];
  if (readinessScore >= 85) priority = 'critical';
  else if (readinessScore >= 70) priority = 'high';
  else if (readinessScore >= 50) priority = 'medium';
  else priority = 'low';

  const rationale: string[] = [];
  if (career.confidence >= 70) rationale.push('High confidence in emergence');
  if (career.growthSignal >= 60) rationale.push('Strong growth signal');
  if (career.evidenceSources.length >= 5) rationale.push('Multiple evidence sources');
  if (career.maturityStage === 'approaching_mainstream') rationale.push('Approaching mainstream adoption');

  const missingData: string[] = [];
  if (career.keySkills.length < 5) missingData.push('More skill data needed');
  if (!career.salaryIndicators) missingData.push('Salary data needed');
  if (career.relatedCareers.length === 0) missingData.push('Related career mapping needed');

  return {
    emergingCareer: career,
    readinessScore,
    priority,
    rationale,
    missingData,
    modelingApproach: career.similarityToModeled.length > 0 ? 'adapt_similar' : 'from_scratch',
    suggestedTemplates: career.similarityToModeled
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, 3)
      .map((s) => s.careerId),
  };
}
