/**
 * CareerOS Regret Intelligence Engine - Types
 *
 * Phase D.4: Regret Intelligence Engine
 *
 * Type definitions for estimating future regret risk in career decisions.
 *
 * @module regret-types
 * @version 1.0.0
 */

import type { CareerId } from '@/career-intelligence/career-types';
import type { OptionalityAnalysis } from '@/optionality-intelligence/optionality-types';

/**
 * Unique identifier for a regret analysis.
 */
export type RegretAnalysisId = string;

/**
 * Regret dimension types.
 */
export type RegretDimensionType =
  | 'IDENTITY'
  | 'LIFESTYLE'
  | 'FINANCIAL'
  | 'OPPORTUNITY'
  | 'GROWTH'
  | 'VALUES';

/**
 * Regret severity levels.
 */
export type RegretSeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

/**
 * Configuration for the Regret Intelligence Engine.
 */
export interface RegretIntelligenceConfig {
  /** Minimum confidence threshold for analysis (0-100) */
  readonly minConfidenceThreshold: number;

  /** Weights for each regret dimension in overall calculation */
  readonly dimensionWeights: RegretDimensionWeights;

  /** Thresholds for severity classification */
  readonly severityThresholds: RegretSeverityThresholds;

  /** Enable scenario generation */
  readonly enableScenarios: boolean;

  /** Maximum number of mitigation strategies to generate */
  readonly maxMitigationStrategies: number;

  /** Maximum number of regret factors to identify */
  readonly maxRegretFactors: number;
}

/**
 * Weights for regret dimensions.
 */
export interface RegretDimensionWeights {
  /** Weight for identity regret (0-1) */
  readonly identityRegret: number;

  /** Weight for lifestyle regret (0-1) */
  readonly lifestyleRegret: number;

  /** Weight for financial regret (0-1) */
  readonly financialRegret: number;

  /** Weight for opportunity regret (0-1) */
  readonly opportunityRegret: number;

  /** Weight for growth regret (0-1) */
  readonly growthRegret: number;

  /** Weight for values regret (0-1) */
  readonly valuesRegret: number;
}

/**
 * Thresholds for regret severity classification.
 */
export interface RegretSeverityThresholds {
  /** Upper bound for LOW severity (0-100) */
  readonly lowThreshold: number;

  /** Upper bound for MODERATE severity (0-100) */
  readonly moderateThreshold: number;

  /** Upper bound for HIGH severity (0-100) */
  readonly highThreshold: number;
}

/**
 * Complete regret analysis output.
 */
export interface RegretAnalysis {
  /** Unique analysis identifier */
  readonly id: RegretAnalysisId;

  /** Profile identifier */
  readonly profileId: string;

  /** Career identifier */
  readonly careerId: CareerId;

  /** Overall regret risk score (0-100, higher = more risk) */
  readonly overallRegretRisk: number;

  /** Confidence in the analysis (0-100) */
  readonly confidence: number;

  /** Regret severity classification */
  readonly severity: RegretSeverity;

  /** Breakdown by dimension */
  readonly regretBreakdown: RegretBreakdown;

  /** Major regret factors identified */
  readonly majorRegretFactors: RegretFactor[];

  /** Scenarios for regret outcomes */
  readonly scenarios: RegretScenarios;

  /** Mitigation strategies */
  readonly mitigationStrategies: MitigationStrategy[];

  /** Human-readable explanation */
  readonly explanation: RegretExplanation;

  /** Analysis timestamp */
  readonly analyzedAt: Date;
}

/**
 * Breakdown of regret by dimension.
 */
export interface RegretBreakdown {
  /** Identity-based regret risk */
  readonly identity: IdentityRegret;

  /** Lifestyle-based regret risk */
  readonly lifestyle: LifestyleRegret;

  /** Financial regret risk */
  readonly financial: FinancialRegret;

  /** Opportunity regret risk */
  readonly opportunity: OpportunityRegret;

  /** Growth regret risk */
  readonly growth: GrowthRegret;

  /** Values regret risk */
  readonly values: ValuesRegret;
}

/**
 * Identity regret - risk of career conflicting with self-identity.
 */
export interface IdentityRegret {
  /** Dimension type */
  readonly type: 'IDENTITY';

  /** Regret risk score (0-100) */
  readonly score: number;

  /** Confidence in assessment (0-100) */
  readonly confidence: number;

  /** Contributing factors */
  readonly factors: IdentityFactor[];

  /** Specific mismatches identified */
  readonly mismatches: IdentityMismatch[];
}

/**
 * Factor contributing to identity regret.
 */
export interface IdentityFactor {
  /** Factor name */
  readonly name: string;

  /** Factor description */
  readonly description: string;

  /** Impact on regret (0-100) */
  readonly impact: number;

  /** Direction of impact */
  readonly direction: 'INCREASES' | 'DECREASES';
}

/**
 * Specific identity mismatch.
 */
export interface IdentityMismatch {
  /** Student trait */
  readonly studentTrait: string;

  /** Career characteristic */
  readonly careerCharacteristic: string;

  /** Severity of mismatch (0-100) */
  readonly severity: number;
}

/**
 * Lifestyle regret - risk of unmet lifestyle desires.
 */
export interface LifestyleRegret {
  /** Dimension type */
  readonly type: 'LIFESTYLE';

  /** Regret risk score (0-100) */
  readonly score: number;

  /** Confidence in assessment (0-100) */
  readonly confidence: number;

  /** Lifestyle factor assessments */
  readonly factors: LifestyleFactor[];
}

/**
 * Lifestyle factor assessment.
 */
export interface LifestyleFactor {
  /** Factor name */
  readonly name: LifestyleFactorName;

  /** Factor description */
  readonly description: string;

  /** Desired level (0-100) */
  readonly desiredLevel: number;

  /** Actual level provided by career (0-100) */
  readonly actualLevel: number;

  /** Gap between desired and actual */
  readonly gap: number;

  /** Regret risk from this factor (0-100) */
  readonly regretRisk: number;
}

/**
 * Names of lifestyle factors.
 */
export type LifestyleFactorName =
  | 'FAMILY_TIME'
  | 'LOCATION_FREEDOM'
  | 'TRAVEL_OPPORTUNITY'
  | 'WORK_LIFE_BALANCE'
  | 'SCHEDULE_FLEXIBILITY'
  | 'REMOTE_WORK'
  | 'AUTONOMY'
  | 'SOCIAL_INTERACTION'
  | 'STRESS_LEVEL'
  | 'PHYSICAL_DEMANDS';

/**
 * Financial regret - risk of earnings dissatisfaction.
 */
export interface FinancialRegret {
  /** Dimension type */
  readonly type: 'FINANCIAL';

  /** Regret risk score (0-100) */
  readonly score: number;

  /** Confidence in assessment (0-100) */
  readonly confidence: number;

  /** Income adequacy assessment */
  readonly incomeAdequacy: IncomeAdequacy;

  /** Financial growth potential */
  readonly growthPotential: FinancialGrowth;

  /** Contributing factors */
  readonly factors: FinancialFactor[];
}

/**
 * Income adequacy assessment.
 */
export interface IncomeAdequacy {
  /** Minimum acceptable income for lifestyle */
  readonly minimumAcceptable: number;

  /** Expected career income */
  readonly expectedIncome: number;

  /** Buffer above minimum (percentage) */
  readonly buffer: number;

  /** Risk if income falls short (0-100) */
  readonly shortfallRisk: number;
}

/**
 * Financial growth potential.
 */
export interface FinancialGrowth {
  /** Current earning potential (0-100) */
  readonly currentPotential: number;

  /** Growth trajectory (0-100) */
  readonly growthTrajectory: number;

  /** Ceiling risk - likelihood of hitting income ceiling (0-100) */
  readonly ceilingRisk: number;
}

/**
 * Financial regret factor.
 */
export interface FinancialFactor {
  /** Factor name */
  readonly name: string;

  /** Factor description */
  readonly description: string;

  /** Impact on regret (0-100) */
  readonly impact: number;
}

/**
 * Opportunity regret - risk of losing future options.
 */
export interface OpportunityRegret {
  /** Dimension type */
  readonly type: 'OPPORTUNITY';

  /** Regret risk score (0-100) */
  readonly score: number;

  /** Confidence in assessment (0-100) */
  readonly confidence: number;

  /** Lost optionality score (0-100, higher = more lost) */
  readonly lostOptionality: number;

  /** Reference to optionality analysis */
  readonly optionalityReference: OptionalityReference;

  /** Specific opportunities at risk */
  readonly opportunitiesAtRisk: OpportunityAtRisk[];
}

/**
 * Reference to optionality analysis.
 */
export interface OptionalityReference {
  /** Overall optionality score from optionality analysis */
  readonly overallOptionality: number;

  /** Paths that would be closed */
  readonly pathsClosed: number;

  /** Paths that would remain open */
  readonly pathsOpen: number;
}

/**
 * Opportunity at risk of being lost.
 */
export interface OpportunityAtRisk {
  /** Opportunity name */
  readonly name: string;

  /** Opportunity type */
  readonly type: string;

  /** Attractiveness of opportunity (0-100) */
  readonly attractiveness: number;

  /** Likelihood of wanting this opportunity (0-100) */
  readonly likelihoodOfInterest: number;

  /** Regret if lost (0-100) */
  readonly regretIfLost: number;
}

/**
 * Growth regret - risk of stagnation.
 */
export interface GrowthRegret {
  /** Dimension type */
  readonly type: 'GROWTH';

  /** Regret risk score (0-100) */
  readonly score: number;

  /** Confidence in assessment (0-100) */
  readonly confidence: number;

  /** Learning opportunity assessment */
  readonly learningOpportunity: LearningAssessment;

  /** Challenge level assessment */
  readonly challengeLevel: ChallengeAssessment;

  /** Mastery potential assessment */
  readonly masteryPotential: MasteryAssessment;

  /** Contributing factors */
  readonly factors: GrowthFactor[];
}

/**
 * Learning opportunity assessment.
 */
export interface LearningAssessment {
  /** Learning potential score (0-100) */
  readonly score: number;

  /** Rate of new skill acquisition */
  readonly skillAcquisitionRate: 'HIGH' | 'MODERATE' | 'LOW';

  /** Breadth of learning */
  readonly learningBreadth: number;
}

/**
 * Challenge level assessment.
 */
export interface ChallengeAssessment {
  /** Challenge level score (0-100) */
  readonly score: number;

  /** Risk of being under-challenged (0-100) */
  readonly underChallengeRisk: number;

  /** Risk of being over-challenged (0-100) */
  readonly overChallengeRisk: number;
}

/**
 * Mastery potential assessment.
 */
export interface MasteryAssessment {
  /** Mastery potential score (0-100) */
  readonly score: number;

  /** Ceiling for expertise development */
  readonly expertiseCeiling: 'HIGH' | 'MODERATE' | 'LOW';

  /** Recognition potential */
  readonly recognitionPotential: number;
}

/**
 * Growth regret factor.
 */
export interface GrowthFactor {
  /** Factor name */
  readonly name: string;

  /** Factor description */
  readonly description: string;

  /** Impact on regret (0-100) */
  readonly impact: number;
}

/**
 * Values regret - risk of values conflict.
 */
export interface ValuesRegret {
  /** Dimension type */
  readonly type: 'VALUES';

  /** Regret risk score (0-100) */
  readonly score: number;

  /** Confidence in assessment (0-100) */
  readonly confidence: number;

  /** Values alignment assessment */
  readonly valuesAlignment: ValuesAlignment;

  /** Specific values conflicts */
  readonly conflicts: ValuesConflict[];

  /** Contributing factors */
  readonly factors: ValuesFactor[];
}

/**
 * Overall values alignment.
 */
export interface ValuesAlignment {
  /** Overall alignment score (0-100) */
  readonly score: number;

  /** Number of aligned values */
  readonly alignedCount: number;

  /** Number of conflicting values */
  readonly conflictingCount: number;

  /** Number of neutral values */
  readonly neutralCount: number;
}

/**
 * Specific values conflict.
 */
export interface ValuesConflict {
  /** Student value */
  readonly studentValue: string;

  /** Career characteristic conflicting with value */
  readonly careerConflict: string;

  /** Severity of conflict (0-100) */
  readonly severity: number;
}

/**
 * Values regret factor.
 */
export interface ValuesFactor {
  /** Factor name */
  readonly name: string;

  /** Factor description */
  readonly description: string;

  /** Impact on regret (0-100) */
  readonly impact: number;
}

/**
 * Regret factor identified in analysis.
 */
export interface RegretFactor {
  /** Unique factor identifier */
  readonly id: string;

  /** Factor name */
  readonly name: string;

  /** Detailed description */
  readonly description: string;

  /** Category of factor */
  readonly category: RegretDimensionType;

  /** Importance/importance (0-100) */
  readonly importance: number;

  /** Whether this is a primary or secondary factor */
  readonly priority: 'PRIMARY' | 'SECONDARY';

  /** Evidence supporting this factor */
  readonly evidence: string[];
}

/**
 * Regret scenarios for best/expected/worst cases.
 */
export interface RegretScenarios {
  /** Best case scenario */
  readonly bestCase: RegretScenario;

  /** Expected case scenario */
  readonly expectedCase: RegretScenario;

  /** Worst case scenario */
  readonly worstCase: RegretScenario;
}

/**
 * Single regret scenario.
 */
export interface RegretScenario {
  /** Scenario type */
  readonly type: 'BEST' | 'EXPECTED' | 'WORST';

  /** Scenario description */
  readonly description: string;

  /** Estimated regret level (0-100) */
  readonly regretLevel: number;

  /** Key conditions for this scenario */
  readonly conditions: string[];

  /** Contributing factors */
  readonly factors: string[];
}

/**
 * Strategy to mitigate regret risk.
 */
export interface MitigationStrategy {
  /** Strategy identifier */
  readonly id: string;

  /** Strategy name */
  readonly name: string;

  /** Detailed description */
  readonly description: string;

  /** Regret dimension this addresses */
  readonly targetDimension: RegretDimensionType;

  /** Expected effectiveness (0-100) */
  readonly effectiveness: number;

  /** Difficulty of implementation (0-100) */
  readonly difficulty: number;

  /** Timeframe for implementation */
  readonly timeframe: 'IMMEDIATE' | 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM';

  /** Actions to take */
  readonly actions: string[];
}

/**
 * Human-readable regret explanation.
 */
export interface RegretExplanation {
  /** Overall summary */
  readonly summary: string;

  /** Why regret risk exists */
  readonly whyRiskExists: string[];

  /** Why regret risk is low (if applicable) */
  readonly whyRiskIsLow: string[];

  /** What factors matter most */
  readonly keyFactors: string[];

  /** What to watch for */
  readonly warningSigns: string[];
}

/**
 * Input for regret analysis.
 */
export interface RegretAnalysisInput {
  /** Unique analysis identifier */
  readonly analysisId: RegretAnalysisId;

  /** Profile identifier */
  readonly profileId: string;

  /** Career identifier */
  readonly careerId: CareerId;

  /** Optional optionality analysis for opportunity regret */
  readonly optionalityAnalysis?: OptionalityAnalysis;
}

/**
 * Result wrapper for regret intelligence operations.
 */
export interface RegretIntelligenceResult<T> {
  /** Whether the operation succeeded */
  readonly success: boolean;

  /** Result data (if successful) */
  readonly data?: T;

  /** Error code (if failed) */
  readonly error?: RegretErrorCode;

  /** Error message (if failed) */
  readonly errorMessage?: string;

  /** Operation timestamp */
  readonly timestamp: Date;
}

/**
 * Error codes for regret intelligence operations.
 */
export type RegretErrorCode =
  | 'INVALID_INPUT'
  | 'CAREER_NOT_FOUND'
  | 'PROFILE_NOT_FOUND'
  | 'INSUFFICIENT_DATA'
  | 'OPTIONALITY_NOT_AVAILABLE'
  | 'CONFIDENCE_TOO_LOW'
  | 'CALCULATION_ERROR';

/**
 * Default configuration for the Regret Intelligence Engine.
 */
export const DEFAULT_REGRET_INTELLIGENCE_CONFIG: RegretIntelligenceConfig = {
  minConfidenceThreshold: 50,
  dimensionWeights: {
    identityRegret: 0.2,
    lifestyleRegret: 0.15,
    financialRegret: 0.15,
    opportunityRegret: 0.15,
    growthRegret: 0.2,
    valuesRegret: 0.15,
  },
  severityThresholds: {
    lowThreshold: 30,
    moderateThreshold: 55,
    highThreshold: 75,
  },
  enableScenarios: true,
  maxMitigationStrategies: 5,
  maxRegretFactors: 6,
};

/**
 * Calculates regret severity from score.
 *
 * @param score - Regret risk score (0-100)
 * @param thresholds - Severity thresholds
 * @returns Severity classification
 */
export function calculateRegretSeverity(
  score: number,
  thresholds: RegretSeverityThresholds = DEFAULT_REGRET_INTELLIGENCE_CONFIG.severityThresholds
): RegretSeverity {
  if (score <= thresholds.lowThreshold) {
    return 'LOW';
  } else if (score <= thresholds.moderateThreshold) {
    return 'MODERATE';
  } else if (score <= thresholds.highThreshold) {
    return 'HIGH';
  }
  return 'CRITICAL';
}
