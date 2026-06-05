/**
 * Personal Growth Engine - Types
 *
 * Type definitions for tracking development potential.
 *
 * Design Principles:
 * - Production-ready architecture
 * - Strong typing
 * - Explainable outputs
 * - Compatible with existing StudentBelief types
 */

import type { EntityId, ConfidenceScore, Evidence } from '../types/index.js';

// ============================================================================
// GROWTH DIMENSIONS
// ============================================================================

/**
 * The five core growth dimensions tracked by the engine.
 */
export const GROWTH_DIMENSIONS = [
  'skill',
  'confidence',
  'leadership',
  'communication',
  'decisionQuality',
] as const;

/** Type for growth dimension identifiers */
export type GrowthDimension = (typeof GROWTH_DIMENSIONS)[number];

/**
 * Human-readable names for growth dimensions.
 */
export const DIMENSION_DISPLAY_NAMES: Record<GrowthDimension, string> = {
  skill: 'Skill Growth',
  confidence: 'Confidence Growth',
  leadership: 'Leadership Growth',
  communication: 'Communication Growth',
  decisionQuality: 'Decision Quality Growth',
};

/**
 * Detailed descriptions for each dimension.
 */
export const DIMENSION_DESCRIPTIONS: Record<GrowthDimension, string> = {
  skill: 'Technical and professional skill acquisition and mastery',
  confidence: 'Self-efficacy, self-assurance, and comfort with challenges',
  leadership: 'Ability to influence, guide, and take responsibility for others',
  communication: 'Effectiveness in expressing ideas and understanding others',
  decisionQuality: 'Ability to make sound judgments under uncertainty',
};

// ============================================================================
// GROWTH STATE
// ============================================================================

/**
 * Current state of a growth dimension.
 */
export interface GrowthState {
  /** Dimension identifier */
  dimension: GrowthDimension;

  /** Current level (0.0 - 1.0) */
  currentLevel: number;

  /** Previous level for tracking change */
  previousLevel?: number;

  /** Rate of recent growth (per month) */
  growthRate: number;

  /** Confidence in assessment */
  confidence: ConfidenceScore;

  /** Evidence supporting this assessment */
  evidence: Evidence[];

  /** Key indicators for this dimension */
  indicators: GrowthIndicator[];

  /** Last updated timestamp */
  updatedAt: number;
}

/**
 * Indicator of growth in a specific area.
 */
export interface GrowthIndicator {
  /** Indicator identifier */
  id: string;

  /** Indicator name */
  name: string;

  /** Current value */
  value: number;

  /** Trend direction */
  trend: 'improving' | 'stable' | 'declining' | 'volatile';

  /** Evidence for this indicator */
  evidence: string[];
}

/**
 * Complete current state across all dimensions.
 */
export interface CurrentGrowthState {
  /** Student identifier */
  studentId: EntityId;

  /** When state was assessed */
  assessedAt: number;

  /** State for each dimension */
  dimensions: Record<GrowthDimension, GrowthState>;

  /** Overall growth level (average) */
  overallLevel: number;

  /** Strongest dimension */
  strongestDimension: GrowthDimension;

  /** Dimension needing most attention */
  priorityDimension: GrowthDimension;
}

// ============================================================================
// POTENTIAL STATE
// ============================================================================

/**
 * Potential state for a growth dimension.
 */
export interface PotentialState {
  /** Dimension identifier */
  dimension: GrowthDimension;

  /** Achievable level with effort (0.0 - 1.0) */
  achievableLevel: number;

  /** Maximum theoretical level (0.0 - 1.0) */
  maximumLevel: number;

  /** Confidence in potential assessment */
  confidence: ConfidenceScore;

  /** Factors enabling growth */
  enablingFactors: string[];

  /** Factors limiting growth */
  limitingFactors: string[];

  /** Time to reach achievable level (months) */
  timeToAchievable: number;

  /** Required investments */
  requiredInvestment: {
    /** Time required (hours/week) */
    timePerWeek: number;

    /** Effort intensity (0-1) */
    effortIntensity: number;

    /** Resources needed */
    resources: string[];
  };
}

/**
 * Complete potential state across all dimensions.
 */
export interface GrowthPotential {
  /** Student identifier */
  studentId: EntityId;

  /** When potential was assessed */
  assessedAt: number;

  /** Potential for each dimension */
  dimensions: Record<GrowthDimension, PotentialState>;

  /** Overall achievable level */
  overallAchievable: number;

  /** Dimension with highest potential */
  highestPotentialDimension: GrowthDimension;

  /** Easiest dimension to improve */
  easiestImprovement: GrowthDimension;
}

// ============================================================================
// GROWTH GAP
// ============================================================================

/**
 * Gap analysis for a growth dimension.
 */
export interface GrowthGap {
  /** Dimension identifier */
  dimension: GrowthDimension;

  /** Current level */
  currentLevel: number;

  /** Target level */
  targetLevel: number;

  /** Absolute gap */
  absoluteGap: number;

  /** Relative gap (as percentage of target) */
  relativeGap: number;

  /** Gap significance */
  significance: 'critical' | 'significant' | 'moderate' | 'minor' | 'negligible';

  /** Whether gap is closing */
  isClosing: boolean;

  /** Rate of gap closure (per month) */
  closureRate: number;

  /** Time to close gap at current rate (months) */
  timeToClose: number | null;

  /** Barriers to closing gap */
  barriers: string[];

  /** Opportunities to accelerate closure */
  opportunities: string[];
}

/**
 * Complete growth gap analysis.
 */
export interface GrowthGapAnalysis {
  /** Student identifier */
  studentId: EntityId;

  /** When analysis was performed */
  analyzedAt: number;

  /** Gap for each dimension */
  dimensions: Record<GrowthDimension, GrowthGap>;

  /** Largest gap */
  largestGap: GrowthDimension;

  /** Smallest gap */
  smallestGap: GrowthDimension;

  /** Most urgent gap to address */
  mostUrgent: GrowthDimension;

  /** Overall gap score (0-1, higher = bigger gap) */
  overallGap: number;
}

// ============================================================================
// GROWTH TRAJECTORY
// ============================================================================

/**
 * Trajectory point for a growth dimension.
 */
export interface TrajectoryPoint {
  /** Time offset from now (months) */
  monthsFromNow: number;

  /** Projected level */
  projectedLevel: number;

  /** Confidence interval */
  confidenceInterval: {
    lower: number;
    upper: number;
  };

  /** Milestones expected at this point */
  milestones: string[];
}

/**
 * Growth trajectory for a dimension.
 */
export interface DimensionTrajectory {
  /** Dimension identifier */
  dimension: GrowthDimension;

  /** Trajectory points */
  points: TrajectoryPoint[];

  /** Trajectory shape */
  shape: 'linear' | 'exponential' | 'logarithmic' | 's-curve' | 'plateau';

  /** Inflection points */
  inflectionPoints: Array<{
    monthsFromNow: number;
    description: string;
  }>;

  /** Key milestones */
  keyMilestones: Array<{
    monthsFromNow: number;
    level: number;
    description: string;
  }>;
}

/**
 * Complete growth trajectory.
 */
export interface GrowthTrajectory {
  /** Trajectory identifier */
  id: string;

  /** Student identifier */
  studentId: EntityId;

  /** When trajectory was generated */
  generatedAt: number;

  /** Forecast horizon (months) */
  horizonMonths: number;

  /** Trajectory for each dimension */
  dimensions: Record<GrowthDimension, DimensionTrajectory>;

  /** Overall trajectory shape */
  overallShape: 'accelerating' | 'steady' | 'decelerating' | 'plateauing';

  /** Confidence in trajectory */
  confidence: ConfidenceScore;

  /** Assumptions underlying trajectory */
  assumptions: string[];
}

// ============================================================================
// GROWTH ANALYSIS OUTPUT
// ============================================================================

/**
 * Complete personal growth analysis output.
 */
export interface PersonalGrowthAnalysis {
  /** Analysis identifier */
  id: string;

  /** Student identifier */
  studentId: EntityId;

  /** When analysis was performed */
  generatedAt: number;

  /** Current state */
  currentState: CurrentGrowthState;

  /** Potential state */
  potential: GrowthPotential;

  /** Gap analysis */
  gapAnalysis: GrowthGapAnalysis;

  /** Growth trajectory */
  trajectory: GrowthTrajectory;

  /** Key insights */
  insights: GrowthInsight[];

  /** Recommendations */
  recommendations: GrowthRecommendation[];
}

/**
 * Insight from growth analysis.
 */
export interface GrowthInsight {
  /** Insight identifier */
  id: string;

  /** Type of insight */
  type: GrowthInsightType;

  /** Related dimension(s) */
  dimensions: GrowthDimension[];

  /** Insight description */
  description: string;

  /** Supporting evidence */
  evidence: string[];

  /** Confidence in insight */
  confidence: ConfidenceScore;

  /** Urgency */
  urgency: 'immediate' | 'near-term' | 'long-term';
}

/** Types of growth insights */
export type GrowthInsightType =
  | 'rapid-growth-detected'
  | 'growth-stagnation'
  | 'high-potential-identified'
  | 'critical-gap'
  | 'balanced-growth'
  | 'lopsided-growth'
  | 'acceleration-opportunity'
  | 'intervention-needed';

/**
 * Recommendation for growth improvement.
 */
export interface GrowthRecommendation {
  /** Recommendation identifier */
  id: string;

  /** Target dimension(s) */
  dimensions: GrowthDimension[];

  /** Recommendation text */
  recommendation: string;

  /** Rationale */
  rationale: string;

  /** Expected impact (0-1) */
  expectedImpact: number;

  /** Time to see results (weeks) */
  timeToResults: number;

  /** Difficulty (0-1) */
  difficulty: number;

  /** Priority */
  priority: 'critical' | 'high' | 'medium' | 'low';

  /** Actionable steps */
  actionSteps: string[];

  /** Success metrics */
  successMetrics: string[];
}

// ============================================================================
// INPUT/OUTPUT TYPES
// ============================================================================

/**
 * Input for personal growth analysis.
 */
export interface PersonalGrowthInput {
  /** Student identifier */
  studentId: EntityId;

  /** Current belief snapshot */
  belief: import('../types/index.js').StudentBeliefV3;

  /** Historical beliefs for trajectory */
  beliefHistory?: import('../types/index.js').StudentBeliefV3[];

  /** Additional context */
  context?: {
    /** Life stage */
    lifeStage?: string;

    /** Available time for growth (hours/week) */
    availableTime?: number;

    /** Resources available */
    resources?: string[];

    /** Constraints */
    constraints?: string[];
  };

  /** Analysis options */
  options?: PersonalGrowthOptions;
}

/**
 * Options for personal growth analysis.
 */
export interface PersonalGrowthOptions {
  /** Forecast horizon (months) */
  horizonMonths?: number;

  /** Whether to generate trajectory */
  generateTrajectory?: boolean;

  /** Whether to generate recommendations */
  generateRecommendations?: boolean;

  /** Minimum confidence threshold */
  minConfidence?: number;

  /** Focus dimensions (if not all) */
  focusDimensions?: GrowthDimension[];
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Configuration for PersonalGrowthEngine.
 */
export interface PersonalGrowthConfig {
  /** Default forecast horizon (months) */
  defaultHorizonMonths: number;

  /** Minimum data points for trajectory */
  minDataPointsForTrajectory: number;

  /** Growth rate smoothing factor */
  growthSmoothingFactor: number;

  /** Confidence threshold for high confidence */
  highConfidenceThreshold: number;

  /** Gap threshold for critical gaps */
  criticalGapThreshold: number;

  /** Gap threshold for significant gaps */
  significantGapThreshold: number;
}

/** Default configuration */
export const DEFAULT_PERSONAL_GROWTH_CONFIG: PersonalGrowthConfig = {
  defaultHorizonMonths: 24,
  minDataPointsForTrajectory: 3,
  growthSmoothingFactor: 0.3,
  highConfidenceThreshold: 0.8,
  criticalGapThreshold: 0.5,
  significantGapThreshold: 0.3,
};
