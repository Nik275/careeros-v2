/**
 * CareerOS Decision Intelligence Engine - Type Definitions
 *
 * Phase D.1: Decision Intelligence Engine
 *
 * Evaluates decisions, tradeoffs, uncertainty, and consequences.
 *
 * @module decision-types
 * @version 1.0.0
 */

import type { CareerId } from '@/career-intelligence/career-types';

/**
 * Unique identifier for a decision.
 */
export type DecisionId = string;

/**
 * Unique identifier for a decision option.
 */
export type DecisionOptionId = string;

/**
 * A single option in a decision.
 */
export interface DecisionOption {
  /** Unique option identifier */
  id: DecisionOptionId;

  /** Option title */
  title: string;

  /** Detailed description */
  description: string;

  /** Associated career identifier */
  careerId: CareerId;
}

/**
 * Complete analysis of a decision option.
 */
export interface DecisionAnalysis {
  /** Decision identifier */
  decisionId: DecisionId;

  /** Option being analyzed */
  option: DecisionOption;

  /** Overall decision quality assessment */
  decisionQuality: DecisionQuality;

  /** Confidence in this analysis */
  confidence: DecisionConfidence;

  /** Advantages of this option */
  advantages: Advantage[];

  /** Disadvantages of this option */
  disadvantages: Disadvantage[];

  /** Risks associated with this option */
  risks: Risk[];

  /** Opportunities presented by this option */
  opportunities: Opportunity[];

  /** Tradeoff analysis */
  tradeoffs: TradeoffAnalysis;

  /** Explanation of this analysis */
  explanation: DecisionExplanation;

  /** Analysis timestamp */
  analyzedAt: Date;
}

/**
 * Multi-dimensional decision quality assessment.
 */
export interface DecisionQuality {
  /** How well this option fits the profile (0-100) */
  fitQuality: ScoredDimension;

  /** Lifestyle compatibility score (0-100) */
  lifestyleQuality: ScoredDimension;

  /** Value alignment score (0-100) */
  valueAlignment: ScoredDimension;

  /** Future potential score (0-100) */
  futurePotential: ScoredDimension;

  /** Flexibility and adaptability score (0-100) */
  flexibility: ScoredDimension;

  /** Overall quality score (0-100) */
  overall: number;
}

/**
 * A scored dimension with confidence.
 */
export interface ScoredDimension {
  /** Score value (0-100) */
  score: number;

  /** Confidence in this score (0-100) */
  confidence: number;
}

/**
 * Comprehensive confidence assessment for a decision.
 */
export interface DecisionConfidence {
  /** Profile certainty - how well we know the student (0-100) */
  profileCertainty: number;

  /** Career certainty - how well we know the career (0-100) */
  careerCertainty: number;

  /** Evidence certainty - quality of supporting evidence (0-100) */
  evidenceCertainty: number;

  /** Recommendation certainty - confidence in the recommendation (0-100) */
  recommendationCertainty: number;

  /** Overall confidence score (0-100) */
  overall: number;
}

/**
 * An advantage of a decision option.
 */
export interface Advantage {
  /** Advantage identifier */
  id: string;

  /** Advantage description */
  description: string;

  /** Category of advantage */
  category: AdvantageCategory;

  /** Importance weight (0-100) */
  importance: number;

  /** Evidence supporting this advantage */
  evidence: string[];
}

/**
 * Categories of advantages.
 */
export type AdvantageCategory =
  | 'FIT'
  | 'LIFESTYLE'
  | 'GROWTH'
  | 'STABILITY'
  | 'INCOME'
  | 'IMPACT'
  | 'AUTONOMY'
  | 'FLEXIBILITY'
  | 'RECOGNITION';

/**
 * A disadvantage of a decision option.
 */
export interface Disadvantage {
  /** Disadvantage identifier */
  id: string;

  /** Disadvantage description */
  description: string;

  /** Category of disadvantage */
  category: DisadvantageCategory;

  /** Severity level (0-100) */
  severity: number;

  /** Whether this is a deal-breaker */
  isDealBreaker: boolean;

  /** Evidence supporting this disadvantage */
  evidence: string[];
}

/**
 * Categories of disadvantages.
 */
export type DisadvantageCategory =
  | 'MISFIT'
  | 'LIFESTYLE_CONFLICT'
  | 'LIMITED_GROWTH'
  | 'INSTABILITY'
  | 'LOW_INCOME'
  | 'LIMITED_IMPACT'
  | 'LOW_AUTONOMY'
  | 'RIGIDITY'
  | 'BARRIER_TO_ENTRY';

/**
 * A risk associated with a decision option.
 */
export interface Risk {
  /** Risk identifier */
  id: string;

  /** Risk description */
  description: string;

  /** Risk category */
  category: RiskCategory;

  /** Probability of occurrence (0-100) */
  probability: number;

  /** Impact severity if occurs (0-100) */
  impact: number;

  /** Risk score (probability * impact / 100) */
  riskScore: number;

  /** Mitigation strategies */
  mitigations: string[];
}

/**
 * Categories of risks.
 */
export type RiskCategory =
  | 'MARKET'
  | 'TECHNOLOGY'
  | 'AUTOMATION'
  | 'ECONOMIC'
  | 'PERSONAL'
  | 'HEALTH'
  | 'RELATIONSHIP'
  | 'FINANCIAL'
  | 'REGULATORY';

/**
 * An opportunity presented by a decision option.
 */
export interface Opportunity {
  /** Opportunity identifier */
  id: string;

  /** Opportunity description */
  description: string;

  /** Opportunity category */
  category: OpportunityCategory;

  /** Probability of realization (0-100) */
  probability: number;

  /** Potential value if realized (0-100) */
  potentialValue: number;

  /** Opportunity score (probability * value / 100) */
  opportunityScore: number;

  /** Requirements to capture this opportunity */
  requirements: string[];
}

/**
 * Categories of opportunities.
 */
export type OpportunityCategory =
  | 'ADVANCEMENT'
  | 'SKILL_DEVELOPMENT'
  | 'NETWORKING'
  | 'ENTREPRENEURSHIP'
  | 'SPECIALIZATION'
  | 'LEADERSHIP'
  | 'GEOGRAPHIC'
  | 'INDUSTRY_SHIFT'
  | 'LIFESTYLE';

/**
 * Tradeoff analysis for a decision option.
 */
export interface TradeoffAnalysis {
  /** What is gained by choosing this option */
  gains: Gain[];

  /** What is lost by choosing this option */
  losses: Loss[];

  /** What becomes easier with this option */
  becomesEasier: string[];

  /** What becomes harder with this option */
  becomesHarder: string[];

  /** Primary tradeoff summary */
  primaryTradeoff: TradeoffSummary;
}

/**
 * Something gained by a decision.
 */
export interface Gain {
  /** Gain identifier */
  id: string;

  /** What is gained */
  description: string;

  /** Category of gain */
  category: GainCategory;

  /** Magnitude of gain (0-100) */
  magnitude: number;
}

/**
 * Categories of gains.
 */
export type GainCategory =
  | 'SKILL'
  | 'KNOWLEDGE'
  | 'EXPERIENCE'
  | 'NETWORK'
  | 'INCOME'
  | 'STATUS'
  | 'FREEDOM'
  | 'SECURITY'
  | 'FULFILLMENT';

/**
 * Something lost by a decision.
 */
export interface Loss {
  /** Loss identifier */
  id: string;

  /** What is lost */
  description: string;

  /** Category of loss */
  category: LossCategory;

  /** Magnitude of loss (0-100) */
  magnitude: number;

  /** Whether this loss is permanent */
  isPermanent: boolean;
}

/**
 * Categories of losses.
 */
export type LossCategory =
  | 'ALTERNATIVE_PATH'
  | 'TIME'
  | 'INCOME_OPPORTUNITY'
  | 'LOCATION'
  | 'RELATIONSHIP'
  | 'EXPERIENCE_TYPE'
  | 'FLEXIBILITY'
  | 'SECURITY';

/**
 * Summary of the primary tradeoff.
 */
export interface TradeoffSummary {
  /** Tradeoff name */
  name: string;

  /** Brief description */
  description: string;

  /** What you gain */
  gain: string;

  /** What you sacrifice */
  sacrifice: string;

  /** Who should accept this tradeoff */
  forWhom: string;

  /** Who should avoid this tradeoff */
  avoidIf: string;
}

/**
 * Explanation of a decision analysis.
 */
export interface DecisionExplanation {
  /** Why this decision is attractive */
  whyAttractive: string;

  /** Why this decision is risky */
  whyRisky: string;

  /** Why another decision may outperform this one */
  whyAlternativeMayOutperform: string;

  /** Key factors to consider */
  keyFactors: string[];

  /** Summary statement */
  summary: string;
}

/**
 * Comparison of multiple decision options.
 */
export interface DecisionComparison {
  /** Comparison identifier */
  comparisonId: string;

  /** Options being compared */
  options: DecisionOption[];

  /** Analysis for each option */
  analyses: Record<DecisionOptionId, DecisionAnalysis>;

  /** Comparison dimensions */
  dimensions: DimensionComparison[];

  /** Ranked options (best to worst) */
  rankings: DecisionRanking[];

  /** Head-to-head comparisons */
  headToHead: HeadToHeadComparison[];

  /** Overall winner (if clear) */
  winner: DecisionOptionId | null;

  /** When winner is not clear, key differentiators */
  keyDifferentiators: string[];

  /** Comparison timestamp */
  comparedAt: Date;
}

/**
 * Comparison of a single dimension across options.
 */
export interface DimensionComparison {
  /** Dimension name */
  dimension: DecisionDimension;

  /** Scores by option */
  scores: Record<DecisionOptionId, ScoredDimension>;

  /** Best option for this dimension */
  bestOption: DecisionOptionId;

  /** Variance across options (0-100) */
  variance: number;

  /** Significance of this dimension (0-100) */
  significance: number;
}

/**
 * Decision dimensions for comparison.
 */
export type DecisionDimension =
  | 'FIT_QUALITY'
  | 'LIFESTYLE_QUALITY'
  | 'VALUE_ALIGNMENT'
  | 'FUTURE_POTENTIAL'
  | 'FLEXIBILITY'
  | 'CONFIDENCE'
  | 'RISK_LEVEL'
  | 'OPPORTUNITY_LEVEL'
  | 'OVERALL_QUALITY';

/**
 * Ranking of a decision option.
 */
export interface DecisionRanking {
  /** Rank position (1 = best) */
  rank: number;

  /** Option identifier */
  optionId: DecisionOptionId;

  /** Overall score */
  score: number;

  /** Strengths relative to other options */
  relativeStrengths: string[];

  /** Weaknesses relative to other options */
  relativeWeaknesses: string[];
}

/**
 * Head-to-head comparison between two options.
 */
export interface HeadToHeadComparison {
  /** First option */
  optionA: DecisionOptionId;

  /** Second option */
  optionB: DecisionOptionId;

  /** Where option A wins */
  optionAWins: DecisionDimension[];

  /** Where option B wins */
  optionBWins: DecisionDimension[];

  /** Where they are equivalent */
  equivalent: DecisionDimension[];

  /** Winner (null if tie) */
  winner: DecisionOptionId | null;

  /** Rationale for winner */
  winnerRationale: string;
}

/**
 * Input for analyzing a single decision.
 */
export interface DecisionAnalysisInput {
  /** Unique decision identifier */
  decisionId: DecisionId;

  /** Student profile identifier */
  profileId: string;

  /** Option to analyze */
  option: DecisionOption;

  /** Analysis context */
  context?: DecisionContext;
}

/**
 * Input for comparing multiple decisions.
 */
export interface DecisionComparisonInput {
  /** Unique comparison identifier */
  comparisonId: string;

  /** Student profile identifier */
  profileId: string;

  /** Options to compare */
  options: DecisionOption[];

  /** Minimum comparison criteria */
  criteria?: ComparisonCriteria;

  /** Analysis context */
  context?: DecisionContext;
}

/**
 * Context for decision analysis.
 */
export interface DecisionContext {
  /** Time horizon for decision (years) */
  timeHorizon: number;

  /** Risk tolerance level (0-100) */
  riskTolerance: number;

  /** Priority weights for different dimensions */
  priorityWeights?: Partial<Record<DecisionDimension, number>>;

  /** Constraints to consider */
  constraints?: DecisionConstraint[];

  /** Previous decisions made */
  previousDecisions?: PreviousDecision[];
}

/**
 * A constraint on decision-making.
 */
export interface DecisionConstraint {
  /** Constraint type */
  type: ConstraintType;

  /** Constraint description */
  description: string;

  /** Whether this is a hard constraint */
  isHard: boolean;
}

/**
 * Types of constraints.
 */
export type ConstraintType =
  | 'FINANCIAL'
  | 'GEOGRAPHIC'
  | 'TEMPORAL'
  | 'EDUCATIONAL'
  | 'FAMILY'
  | 'HEALTH'
  | 'LEGAL';

/**
 * A previously made decision.
 */
export interface PreviousDecision {
  /** Decision identifier */
  decisionId: string;

  /** Option chosen */
  optionChosen: DecisionOptionId;

  /** Outcome (if known) */
  outcome?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
}

/**
 * Criteria for comparison.
 */
export interface ComparisonCriteria {
  /** Minimum confidence threshold (0-100) */
  minConfidence: number;

  /** Dimensions to compare */
  dimensions: DecisionDimension[];

  /** Require all dimensions or allow partial */
  requireAllDimensions: boolean;
}

/**
 * Default comparison criteria.
 */
export const DEFAULT_COMPARISON_CRITERIA: ComparisonCriteria = {
  minConfidence: 50,
  dimensions: [
    'FIT_QUALITY',
    'LIFESTYLE_QUALITY',
    'VALUE_ALIGNMENT',
    'FUTURE_POTENTIAL',
    'FLEXIBILITY',
  ],
  requireAllDimensions: false,
};

/**
 * Configuration for the decision intelligence engine.
 */
export interface DecisionIntelligenceConfig {
  /** Minimum confidence threshold for recommendations */
  minConfidenceThreshold: number;

  /** Default time horizon for decisions (years) */
  defaultTimeHorizon: number;

  /** Enable detailed tradeoff analysis */
  enableTradeoffAnalysis: boolean;

  /** Enable risk analysis */
  enableRiskAnalysis: boolean;

  /** Enable opportunity analysis */
  enableOpportunityAnalysis: boolean;

  /** Weight given to fit quality in overall score */
  fitQualityWeight: number;

  /** Weight given to lifestyle quality in overall score */
  lifestyleQualityWeight: number;

  /** Weight given to value alignment in overall score */
  valueAlignmentWeight: number;

  /** Weight given to future potential in overall score */
  futurePotentialWeight: number;

  /** Weight given to flexibility in overall score */
  flexibilityWeight: number;
}

/**
 * Default decision intelligence configuration.
 */
export const DEFAULT_DECISION_INTELLIGENCE_CONFIG: DecisionIntelligenceConfig = {
  minConfidenceThreshold: 50,
  defaultTimeHorizon: 5,
  enableTradeoffAnalysis: true,
  enableRiskAnalysis: true,
  enableOpportunityAnalysis: true,
  fitQualityWeight: 0.25,
  lifestyleQualityWeight: 0.2,
  valueAlignmentWeight: 0.2,
  futurePotentialWeight: 0.2,
  flexibilityWeight: 0.15,
};

/**
 * Result of a confidence calculation.
 */
export interface ConfidenceCalculationResult {
  /** Profile certainty component */
  profileCertainty: CertaintyComponent;

  /** Career certainty component */
  careerCertainty: CertaintyComponent;

  /** Evidence certainty component */
  evidenceCertainty: CertaintyComponent;

  /** Recommendation certainty component */
  recommendationCertainty: CertaintyComponent;

  /** Overall confidence score */
  overall: number;

  /** Calculation timestamp */
  calculatedAt: Date;
}

/**
 * A component of certainty calculation.
 */
export interface CertaintyComponent {
  /** Component score (0-100) */
  score: number;

  /** Factors contributing to this score */
  factors: CertaintyFactor[];

  /** Confidence in this component (0-100) */
  confidence: number;
}

/**
 * A factor contributing to certainty.
 */
export interface CertaintyFactor {
  /** Factor name */
  name: string;

  /** Factor weight (0-1) */
  weight: number;

  /** Factor score (0-100) */
  score: number;

  /** Impact on overall certainty */
  impact: number;
}

/**
 * Error types for decision intelligence operations.
 */
export type DecisionIntelligenceError =
  | 'INVALID_INPUT'
  | 'CAREER_NOT_FOUND'
  | 'PROFILE_NOT_FOUND'
  | 'INSUFFICIENT_DATA'
  | 'COMPARISON_FAILED'
  | 'CONFIDENCE_TOO_LOW';

/**
 * Result of a decision intelligence operation.
 */
export interface DecisionIntelligenceResult<T> {
  /** Whether the operation succeeded */
  success: boolean;

  /** Result data (if successful) */
  data?: T;

  /** Error type (if failed) */
  error?: DecisionIntelligenceError;

  /** Error message (if failed) */
  errorMessage?: string;

  /** Operation timestamp */
  timestamp: Date;
}
