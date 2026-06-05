/**
 * CareerOS Utility Intelligence Engine - Type Definitions
 *
 * Phase D.2: Utility Intelligence Engine
 *
 * Evaluates expected life utility of career decisions.
 *
 * @module utility-types
 * @version 1.0.0
 */

import type { CareerId } from '@/career-intelligence/career-types';

/**
 * Unique identifier for a utility analysis.
 */
export type UtilityAnalysisId = string;

/**
 * Complete utility analysis for a career decision.
 */
export interface UtilityAnalysis {
  /** Unique analysis identifier */
  id: UtilityAnalysisId;

  /** Student profile identifier */
  profileId: string;

  /** Career being evaluated */
  careerId: CareerId;

  /** Overall utility score (0-100) */
  overallUtility: number;

  /** Confidence in this analysis (0-100) */
  confidence: number;

  /** Breakdown by utility dimension */
  utilityBreakdown: UtilityBreakdown;

  /** Advantages contributing to utility */
  advantages: UtilityAdvantage[];

  /** Risks affecting utility */
  risks: UtilityRisk[];

  /** Explanation of utility assessment */
  explanation: UtilityExplanation;

  /** Analysis timestamp */
  analyzedAt: Date;
}

/**
 * Breakdown of utility across all dimensions.
 */
export interface UtilityBreakdown {
  /** Fulfillment utility - alignment with self */
  fulfillment: FulfillmentUtility;

  /** Lifestyle utility - day-to-day living */
  lifestyle: LifestyleUtility;

  /** Financial utility - economic wellbeing */
  financial: FinancialUtility;

  /** Growth utility - development potential */
  growth: GrowthUtility;

  /** Freedom utility - autonomy and choice */
  freedom: FreedomUtility;

  /** Meaning utility - purpose and impact */
  meaning: MeaningUtility;
}

/**
 * Fulfillment utility - how well the career aligns with the person's core self.
 */
export interface FulfillmentUtility {
  /** Dimension score (0-100) */
  score: number;

  /** Confidence in score (0-100) */
  confidence: number;

  /** Weight in overall utility (0-1) */
  weight: number;

  /** Alignment with strengths */
  strengthAlignment: SubDimensionScore;

  /** Alignment with interests */
  interestAlignment: SubDimensionScore;

  /** Alignment with motivations */
  motivationAlignment: SubDimensionScore;

  /** Detailed findings */
  findings: FulfillmentFinding[];
}

/**
 * Score for a sub-dimension.
 */
export interface SubDimensionScore {
  /** Score value (0-100) */
  score: number;

  /** Confidence (0-100) */
  confidence: number;

  /** Contributing factors */
  factors: string[];
}

/**
 * Finding related to fulfillment.
 */
export interface FulfillmentFinding {
  /** Finding type */
  type: 'STRENGTH_MATCH' | 'INTEREST_MATCH' | 'MOTIVATION_MATCH' | 'MISALIGNMENT';

  /** Description */
  description: string;

  /** Impact on utility */
  impact: number;
}

/**
 * Lifestyle utility - quality of day-to-day life.
 */
export interface LifestyleUtility {
  /** Dimension score (0-100) */
  score: number;

  /** Confidence in score (0-100) */
  confidence: number;

  /** Weight in overall utility (0-1) */
  weight: number;

  /** Work-life balance */
  workLifeBalance: SubDimensionScore;

  /** Flexibility level */
  flexibility: SubDimensionScore;

  /** Location freedom */
  locationFreedom: SubDimensionScore;

  /** Lifestyle compatibility */
  lifestyleCompatibility: SubDimensionScore;

  /** Detailed findings */
  findings: LifestyleFinding[];
}

/**
 * Finding related to lifestyle.
 */
export interface LifestyleFinding {
  /** Finding type */
  type: 'BALANCE' | 'FLEXIBILITY' | 'LOCATION' | 'COMPATIBILITY' | 'CONFLICT';

  /** Description */
  description: string;

  /** Impact on utility */
  impact: number;
}

/**
 * Financial utility - economic wellbeing and security.
 */
export interface FinancialUtility {
  /** Dimension score (0-100) */
  score: number;

  /** Confidence in score (0-100) */
  confidence: number;

  /** Weight in overall utility (0-1) */
  weight: number;

  /** Income potential */
  incomePotential: SubDimensionScore;

  /** Financial stability */
  stability: SubDimensionScore;

  /** Economic resilience */
  resilience: SubDimensionScore;

  /** Detailed findings */
  findings: FinancialFinding[];
}

/**
 * Finding related to financial utility.
 */
export interface FinancialFinding {
  /** Finding type */
  type: 'INCOME' | 'STABILITY' | 'RESILIENCE' | 'RISK';

  /** Description */
  description: string;

  /** Impact on utility */
  impact: number;
}

/**
 * Growth utility - potential for development and advancement.
 */
export interface GrowthUtility {
  /** Dimension score (0-100) */
  score: number;

  /** Confidence in score (0-100) */
  confidence: number;

  /** Weight in overall utility (0-1) */
  weight: number;

  /** Learning opportunities */
  learning: SubDimensionScore;

  /** Mastery potential */
  mastery: SubDimensionScore;

  /** Career development path */
  careerDevelopment: SubDimensionScore;

  /** Skill growth potential */
  skillGrowth: SubDimensionScore;

  /** Detailed findings */
  findings: GrowthFinding[];
}

/**
 * Finding related to growth.
 */
export interface GrowthFinding {
  /** Finding type */
  type: 'LEARNING' | 'MASTERY' | 'DEVELOPMENT' | 'SKILLS' | 'STAGNATION';

  /** Description */
  description: string;

  /** Impact on utility */
  impact: number;
}

/**
 * Freedom utility - autonomy and choice preservation.
 */
export interface FreedomUtility {
  /** Dimension score (0-100) */
  score: number;

  /** Confidence in score (0-100) */
  confidence: number;

  /** Weight in overall utility (0-1) */
  weight: number;

  /** Autonomy level */
  autonomy: SubDimensionScore;

  /** Choice preservation */
  choicePreservation: SubDimensionScore;

  /** Optionality support */
  optionality: SubDimensionScore;

  /** Detailed findings */
  findings: FreedomFinding[];
}

/**
 * Finding related to freedom.
 */
export interface FreedomFinding {
  /** Finding type */
  type: 'AUTONOMY' | 'CHOICE' | 'OPTIONALITY' | 'CONSTRAINT';

  /** Description */
  description: string;

  /** Impact on utility */
  impact: number;
}

/**
 * Meaning utility - purpose, impact, and contribution.
 */
export interface MeaningUtility {
  /** Dimension score (0-100) */
  score: number;

  /** Confidence in score (0-100) */
  confidence: number;

  /** Weight in overall utility (0-1) */
  weight: number;

  /** Sense of purpose */
  purpose: SubDimensionScore;

  /** Impact potential */
  impact: SubDimensionScore;

  /** Contribution opportunity */
  contribution: SubDimensionScore;

  /** Values alignment */
  valuesAlignment: SubDimensionScore;

  /** Detailed findings */
  findings: MeaningFinding[];
}

/**
 * Finding related to meaning.
 */
export interface MeaningFinding {
  /** Finding type */
  type: 'PURPOSE' | 'IMPACT' | 'CONTRIBUTION' | 'VALUES' | 'EMPTINESS';

  /** Description */
  description: string;

  /** Impact on utility */
  impact: number;
}

/**
 * Advantage contributing to utility.
 */
export interface UtilityAdvantage {
  /** Advantage identifier */
  id: string;

  /** Description */
  description: string;

  /** Related utility dimension */
  dimension: UtilityDimension;

  /** Magnitude of contribution (0-100) */
  magnitude: number;

  /** Certainty of this advantage (0-100) */
  certainty: number;
}

/**
 * Risk affecting utility.
 */
export interface UtilityRisk {
  /** Risk identifier */
  id: string;

  /** Description */
  description: string;

  /** Affected utility dimension */
  dimension: UtilityDimension;

  /** Probability of occurrence (0-100) */
  probability: number;

  /** Severity of impact (0-100) */
  severity: number;

  /** Risk score (probability × severity / 100) */
  riskScore: number;

  /** Whether this is a deal-breaker */
  isDealBreaker: boolean;
}

/**
 * Utility dimensions.
 */
export type UtilityDimension =
  | 'FULFILLMENT'
  | 'LIFESTYLE'
  | 'FINANCIAL'
  | 'GROWTH'
  | 'FREEDOM'
  | 'MEANING';

/**
 * Explanation of utility assessment.
 */
export interface UtilityExplanation {
  /** Why utility is high */
  whyHigh: string;

  /** Why utility is low */
  whyLow: string;

  /** What contributes most to utility */
  topContributors: string[];

  /** What reduces utility most */
  topReductions: string[];

  /** Summary statement */
  summary: string;

  /** Key recommendations */
  recommendations: string[];
}

/**
 * Input for utility analysis.
 */
export interface UtilityAnalysisInput {
  /** Analysis identifier */
  analysisId: UtilityAnalysisId;

  /** Student profile identifier */
  profileId: string;

  /** Career identifier */
  careerId: CareerId;

  /** Analysis context */
  context?: UtilityContext;
}

/**
 * Context for utility analysis.
 */
export interface UtilityContext {
  /** Time horizon for evaluation (years) */
  timeHorizon: number;

  /** Priority weights for dimensions (overrides defaults) */
  dimensionWeights?: Partial<Record<UtilityDimension, number>>;

  /** Student's risk tolerance (0-100) */
  riskTolerance: number;

  /** Life stage considerations */
  lifeStage?: LifeStage;

  /** Specific concerns to evaluate */
  specificConcerns?: string[];
}

/**
 * Life stage for context.
 */
export type LifeStage =
  | 'STUDENT'
  | 'EARLY_CAREER'
  | 'MID_CAREER'
  | 'LATE_CAREER'
  | 'TRANSITION';

/**
 * Configuration for utility intelligence engine.
 */
export interface UtilityIntelligenceConfig {
  /** Minimum confidence threshold for analysis (0-100) */
  minConfidenceThreshold: number;

  /** Default time horizon (years) */
  defaultTimeHorizon: number;

  /** Whether to include detailed findings */
  enableDetailedFindings: boolean;

  /** Whether to generate recommendations */
  enableRecommendations: boolean;

  /** Default dimension weights */
  dimensionWeights: Record<UtilityDimension, number>;
}

/**
 * Default utility intelligence configuration.
 */
export const DEFAULT_UTILITY_INTELLIGENCE_CONFIG: UtilityIntelligenceConfig = {
  minConfidenceThreshold: 50,
  defaultTimeHorizon: 10,
  enableDetailedFindings: true,
  enableRecommendations: true,
  dimensionWeights: {
    FULFILLMENT: 0.2,
    LIFESTYLE: 0.15,
    FINANCIAL: 0.15,
    GROWTH: 0.2,
    FREEDOM: 0.15,
    MEANING: 0.15,
  },
};

/**
 * Weight configuration for different life stages.
 */
export const LIFE_STAGE_WEIGHTS: Record<LifeStage, Partial<Record<UtilityDimension, number>>> = {
  STUDENT: {
    GROWTH: 0.25,
    FULFILLMENT: 0.2,
    MEANING: 0.15,
  },
  EARLY_CAREER: {
    GROWTH: 0.25,
    FINANCIAL: 0.2,
    FULFILLMENT: 0.15,
  },
  MID_CAREER: {
    FULFILLMENT: 0.25,
    MEANING: 0.2,
    FINANCIAL: 0.15,
  },
  LATE_CAREER: {
    MEANING: 0.25,
    FREEDOM: 0.2,
    LIFESTYLE: 0.2,
  },
  TRANSITION: {
    FREEDOM: 0.25,
    GROWTH: 0.2,
    FULFILLMENT: 0.2,
  },
};

/**
 * Result of utility calculation.
 */
export interface UtilityCalculationResult {
  /** Fulfillment score */
  fulfillment: number;

  /** Lifestyle score */
  lifestyle: number;

  /** Financial score */
  financial: number;

  /** Growth score */
  growth: number;

  /** Freedom score */
  freedom: number;

  /** Meaning score */
  meaning: number;

  /** Overall weighted score */
  overall: number;

  /** Calculation confidence */
  confidence: number;

  /** Calculation timestamp */
  calculatedAt: Date;
}

/**
 * Component scores for utility calculation.
 */
export interface UtilityComponentScores {
  /** Profile-based scores */
  profile: ProfileUtilityScores;

  /** Career-based scores */
  career: CareerUtilityScores;

  /** Fit-based scores */
  fit: FitUtilityScores;
}

/**
 * Profile-related utility scores.
 */
export interface ProfileUtilityScores {
  /** Strength clarity (0-100) */
  strengthClarity: number;

  /** Interest clarity (0-100) */
  interestClarity: number;

  /** Motivation clarity (0-100) */
  motivationClarity: number;

  /** Values clarity (0-100) */
  valuesClarity: number;

  /** Lifestyle preference clarity (0-100) */
  lifestyleClarity: number;
}

/**
 * Career-related utility scores.
 */
export interface CareerUtilityScores {
  /** Career clarity (0-100) */
  careerClarity: number;

  /** Data quality (0-100) */
  dataQuality: number;

  /** Evidence strength (0-100) */
  evidenceStrength: number;
}

/**
 * Fit-related utility scores.
 */
export interface FitUtilityScores {
  /** Overall fit score (0-100) */
  overallFit: number;

  /** Cognitive fit (0-100) */
  cognitiveFit: number;

  /** Motivational fit (0-100) */
  motivationalFit: number;

  /** Lifestyle fit (0-100) */
  lifestyleFit: number;

  /** Values fit (0-100) */
  valuesFit: number;
}

/**
 * Error types for utility intelligence operations.
 */
export type UtilityIntelligenceError =
  | 'INVALID_INPUT'
  | 'PROFILE_NOT_FOUND'
  | 'CAREER_NOT_FOUND'
  | 'INSUFFICIENT_DATA'
  | 'CONFIDENCE_TOO_LOW';

/**
 * Result of utility intelligence operation.
 */
export interface UtilityIntelligenceResult<T> {
  /** Whether operation succeeded */
  success: boolean;

  /** Result data (if successful) */
  data?: T;

  /** Error type (if failed) */
  error?: UtilityIntelligenceError;

  /** Error message (if failed) */
  errorMessage?: string;

  /** Operation timestamp */
  timestamp: Date;
}
