/**
 * Decision Intelligence Engine - Type Definitions
 *
 * Phase 8.5: Decision Intelligence Engine
 *
 * Transforms CareerOS from a recommendation engine into a career decision-making
 * intelligence system. Helps students make difficult life decisions under uncertainty.
 *
 * @module decision-types
 * @version 1.0.0
 */

import type { DimensionScoreMap } from '../../assessment/assessment-types';
import type { PsychologyProfile } from '../../domains/student/StudentProfile';
import type { CareerRecommendation, RecommendationSet } from '../../recommendation/recommendation-types';
import type {
  ExtractedLesson as Lesson,
  LongitudinalPattern,
  MistakeAnalysis as Mistake,
} from '../../mentor-intelligence/mentor-intelligence-types';
import type { Contradiction } from '../recommendation-stability/recommendation-stability-types';

export type { Contradiction } from '../recommendation-stability/recommendation-stability-types';
export type {
  ExtractedLesson as Lesson,
  MistakeAnalysis as Mistake,
} from '../../mentor-intelligence/mentor-intelligence-types';

// ============================================================================
// CORE DECISION TYPES
// ============================================================================

/**
 * Unique identifier for a decision analysis
 */
export type DecisionId = string & { readonly __brand: 'DecisionId' };

/**
 * Types of decisions students face
 */
export type DecisionType =
  | 'CAREER_CHOICE'
  | 'EDUCATION'
  | 'COLLEGE'
  | 'DEGREE'
  | 'LOCATION'
  | 'RISK'
  | 'ENTREPRENEURSHIP'
  | 'LIFE_DIRECTION'
  | 'TIMING'
  | 'SPECIALIZATION';

/**
 * Decision status in the lifecycle
 */
export type DecisionStatus =
  | 'IDENTIFIED'
  | 'ANALYZING'
  | 'READY'
  | 'DECIDED'
  | 'IMPLEMENTED'
  | 'EVALUATING';

/**
 * Urgency level of the decision
 */
export type DecisionUrgency = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | 'DEFERRABLE';

// ============================================================================
// DECISION INPUTS
// ============================================================================

/**
 * Base decision input
 */
export interface DecisionInput {
  id: DecisionId;
  type: DecisionType;
  studentId: string;
  description: string;
  options: DecisionOption[];
  context: DecisionContext;
  constraints: DecisionConstraint[];
  timeline: DecisionTimeline;
  psychologyProfile: PsychologyProfile;
  dimensionScores: DimensionScoreMap;
  careerRecommendations: RecommendationSet;
  longitudinalMemory?: LongitudinalPattern[];
  contradictions?: Contradiction[];
  lessons?: Lesson[];
  mistakes?: Mistake[];
}

/**
 * A decision option/path
 */
export interface DecisionOption {
  id: string;
  label: string;
  description: string;
  careerId?: string;
  educationPath?: EducationPath;
  location?: LocationOption;
  riskLevel: RiskLevel;
  timeCommitment: TimeCommitment;
  financialImplications: FinancialImplications;
  reversibility: ReversibilityEstimate;
  tags: string[];
}

/**
 * Education path details
 */
export interface EducationPath {
  institution?: string;
  degree: string;
  duration: number; // months
  cost: number;
  location: string;
  reputation?: string;
  specialization?: string;
}

/**
 * Location option details
 */
export interface LocationOption {
  city: string;
  country: string;
  region: string;
  costOfLiving: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  opportunities: 'LIMITED' | 'MODERATE' | 'GOOD' | 'EXCELLENT';
  lifestyle: string[];
}

/**
 * Risk level classification
 */
export type RiskLevel = 'VERY_LOW' | 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';

/**
 * Time commitment for a path
 */
export interface TimeCommitment {
  duration: number; // months
  intensity: 'PART_TIME' | 'FULL_TIME' | 'INTENSIVE';
  flexibility: 'RIGID' | 'SOME_FLEXIBILITY' | 'HIGHLY_FLEXIBLE';
}

/**
 * Financial implications
 */
export interface FinancialImplications {
  initialCost: number;
  ongoingCost: number;
  opportunityCost: number;
  expectedIncome: number;
  breakEvenTime: number; // months
  roiEstimate: number; // percentage
}

/**
 * Reversibility estimate
 */
export interface ReversibilityEstimate {
  score: number; // 0-100, higher = more reversible
  type: 'TYPE_1' | 'TYPE_2' | 'TYPE_3'; // Hard, Moderate, Easy
  switchingCost: number;
  timeToReverse: number; // months
  explanation: string;
}

/**
 * Decision context
 */
export interface DecisionContext {
  decisionType?: string;
  options?: string[];
  constraints?: string[];
  familyExpectations: string[];
  peerInfluence: string[];
  culturalFactors: string[];
  economicClimate: string;
  personalCircumstances: string[];
  values: string[];
  nonNegotiables: string[];
  aspirationalGoals: string[];
}

/**
 * Decision constraints
 */
export interface DecisionConstraint {
  type: 'FINANCIAL' | 'FAMILY' | 'GEOGRAPHIC' | 'ACADEMIC' | 'HEALTH' | 'LEGAL' | 'PERSONAL';
  description: string;
  severity: 'HARD' | 'SOFT';
  flexibility: number; // 0-100
}

/**
 * Decision timeline
 */
export interface DecisionTimeline {
  decisionBy: Date;
  implementationStart: Date;
  keyMilestones: Milestone[];
  flexibility: number; // days buffer
}

/**
 * Milestone in decision timeline
 */
export interface Milestone {
  name: string;
  date: Date;
  requiredAction: string;
  consequencesOfMissing: string;
}

// ============================================================================
// TRADEOFF TYPES
// ============================================================================

/**
 * Tradeoff dimension pairs
 */
export type TradeoffDimension =
  | 'MONEY_VS_MEANING'
  | 'PRESTIGE_VS_FREEDOM'
  | 'SECURITY_VS_GROWTH'
  | 'PASSION_VS_PRACTICALITY'
  | 'FAMILY_VS_IDENTITY'
  | 'SHORT_TERM_VS_LONG_TERM'
  | 'STATUS_VS_AUTONOMY'
  | 'STABILITY_VS_ADVENTURE'
  | 'SOCIAL_APPROVAL_VS_AUTHENTICITY'
  | 'COMFORT_VS_CHALLENGE'
  | 'IMMEDIATE_VS_DELAYED'
  | 'BREADTH_VS_DEPTH'
  | 'INDEPENDENCE_VS_BELONGING'
  | 'CREATIVITY_VS_STRUCTURE'
  | 'IMPACT_VS_INCOME';

/**
 * Detected tradeoff
 */
export interface DetectedTradeoff {
  id: string;
  dimensionA: string;
  dimensionB: string;
  type: TradeoffDimension;
  intensity: TradeoffIntensity;
  intensityScore: number; // 0-100 numeric score
  evidence: TradeoffEvidence[];
  explanation: string;
  resolution: TradeoffResolution;
}

/**
 * Tradeoff intensity
 */
export type TradeoffIntensity = 'MILD' | 'MODERATE' | 'STRONG' | 'EXTREME';

/**
 * Evidence for tradeoff
 */
export interface TradeoffEvidence {
  source: 'STATEMENT' | 'BEHAVIOR' | 'CONTRADICTION' | 'PATTERN' | 'PREFERENCE';
  content: string;
  weight: number;
  timestamp?: Date;
}

/**
 * Tradeoff resolution approach
 */
export interface TradeoffResolution {
  recommended: 'BALANCE' | 'PRIORITIZE_A' | 'PRIORITIZE_B' | 'INTEGRATE' | 'DEFER';
  rationale: string;
  conditions: string[];
}

/**
 * Predefined framework metadata for resolving a common tradeoff dimension.
 */
export interface TradeoffFramework {
  type: TradeoffDimension;
  name: string;
  description: string;
  dimensionA: {
    name: string;
    description: string;
    weight: number;
  };
  dimensionB: {
    name: string;
    description: string;
    weight: number;
  };
  resolutionStrategies: string[];
  commonScenarios: string[];
  intensityIndicators: string[];
}

/**
 * Tradeoff analysis result
 */
export interface TradeoffAnalysis {
  detectedTradeoffs: DetectedTradeoff[];
  primaryConflict: DetectedTradeoff | null;
  studentAwareness: 'UNAWARE' | 'PARTIALLY_AWARE' | 'FULLY_AWARE';
  resolutionSuggestions: string[];
  explanation: string;
}

// ============================================================================
// REGRET TYPES
// ============================================================================

/**
 * Regret category
 */
export type RegretCategory =
  | 'EXPLORATION'
  | 'IDENTITY'
  | 'FINANCIAL'
  | 'RELATIONSHIP'
  | 'PURPOSE'
  | 'MISSED_OPPORTUNITY'
  | 'TIMING'
  | 'COMPROMISE';

/**
 * Time horizon for regret prediction
 */
export type TimeHorizon = 5 | 10 | 20 | 40;

/**
 * Regret risk at a specific time horizon
 */
export interface RegretRisk {
  horizon: TimeHorizon;
  overallRisk: number; // 0-100
  categoryRisks: Map<RegretCategory, number>;
  strongestCategory: RegretCategory;
  explanation: string;
}

/**
 * Regret profile across all time horizons
 */
export interface RegretProfile {
  risks: Map<TimeHorizon, RegretRisk>;
  overallRisk: number; // weighted average
  strongestCategory: RegretCategory;
  categoryExplanations: Map<RegretCategory, string>;
  mitigationStrategies: string[];
  explanation: string;
}

/**
 * Regret predictor configuration
 */
export interface RegretEngineConfig {
  timeHorizons: TimeHorizon[];
  categoryWeights: Map<RegretCategory, number>;
  patternSensitivity: number;
  contradictionPenalty: number;
}

// ============================================================================
// OPTIONALITY TYPES
// ============================================================================

/**
 * Optionality analysis
 */
export interface OptionalityAnalysis {
  score: number; // 0-100
  level: OptionalityLevel;
  explanation: string;
  futureOptions: FutureOption[];
  pivotDifficulty: PivotDifficulty;
  explorationCapacity: ExplorationCapacity;
  adaptabilityScore: number;
}

/**
 * Optionality level
 */
export type OptionalityLevel = 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'LOW' | 'VERY_LOW';

/**
 * Future option available from a path
 */
export interface FutureOption {
  id: string;
  description: string;
  accessibility: number; // 0-100, how easy to reach
  timeToAchieve: number; // months
  requirements: string[];
  value: number; // 0-100
}

/**
 * Pivot difficulty assessment
 */
export interface PivotDifficulty {
  score: number; // 0-100, higher = harder to pivot
  category: 'EASY' | 'MODERATE' | 'DIFFICULT' | 'VERY_DIFFICULT';
  barriers: string[];
  enablers: string[];
  typicalPivotPaths: string[];
}

/**
 * Exploration capacity
 */
export interface ExplorationCapacity {
  score: number; // 0-100
  canExploreWhilePursuing: boolean;
  explorationMechanisms: string[];
  constraints: string[];
}

// ============================================================================
// REVERSIBILITY TYPES
// ============================================================================

/**
 * Decision reversibility assessment
 */
export interface DecisionReversibility {
  score: number; // 0-100, higher = more reversible
  type: ReversibilityType;
  category: ReversibilityCategory;
  switchingCost: SwitchingCost;
  timeToReverse: number; // months
  explanation: string;
  comparableDecisions: string[];
}

/**
 * Reversibility type (Type 1, 2, 3)
 */
export type ReversibilityType = 'TYPE_1' | 'TYPE_2' | 'TYPE_3';

/**
 * Reversibility category
 */
export type ReversibilityCategory =
  | 'HIGHLY_REVERSIBLE'
  | 'MOSTLY_REVERSIBLE'
  | 'PARTIALLY_REVERSIBLE'
  | 'MOSTLY_IRREVERSIBLE'
  | 'IRREVERSIBLE';

/**
 * Cost of switching paths
 */
export interface SwitchingCost {
  financial: number;
  time: number; // months
  social: number;
  identity: number;
  opportunity: number;
  total: number;
}

// ============================================================================
// RISK TYPES
// ============================================================================

/**
 * Risk category
 */
export type RiskCategory =
  | 'FINANCIAL'
  | 'IDENTITY'
  | 'CAREER'
  | 'LIFESTYLE'
  | 'OPPORTUNITY_COST'
  | 'BURNOUT'
  | 'MARKET'
  | 'SKILL_OBSOLESCENCE'
  | 'RELATIONSHIP'
  | 'HEALTH';

/**
 * Risk assessment for a specific category
 */
export interface RiskAssessment {
  category: RiskCategory;
  severity: RiskSeverity;
  probability: number; // 0-100
  impact: number; // 0-100
  score: number; // 0-100
  rationale: string;
  mitigations: string[];
  earlyWarningSigns: string[];
}

/**
 * Risk severity
 */
export type RiskSeverity = 'MINIMAL' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

/**
 * Comprehensive risk profile
 */
export interface RiskProfile {
  assessments: RiskAssessment[];
  overallRisk: number; // 0-100
  highestRiskCategory: RiskCategory;
  riskAdjustedRecommendation: string;
  mitigationPriorities: string[];
  explanation: string;
}

// ============================================================================
// SCENARIO TYPES
// ============================================================================

/**
 * Scenario forecast
 */
export interface ScenarioForecast {
  id: string;
  name: string;
  optionId: string;
  description: string;
  timeframe: number; // years
  projections: ScenarioProjections;
  likelihood: number; // 0-100
  keyAssumptions: string[];
  criticalVariables: string[];
  warningSignals: string[];
}

/**
 * Projections for a scenario
 */
export interface ScenarioProjections {
  incomePotential: number; // 0-100
  fulfillmentPotential: number; // 0-100
  futureRelevance: number; // 0-100
  optionality: number; // 0-100
  lifestyleCompatibility: number; // 0-100
  growthPotential: number; // 0-100
  regretRisk: number; // 0-100
  burnoutRisk: number; // 0-100
  studentFit: number; // 0-100
}

/**
 * Scenario comparison
 */
export interface ScenarioComparison {
  scenarios: ScenarioForecast[];
  bestCase: ScenarioForecast;
  worstCase: ScenarioForecast;
  mostLikely: ScenarioForecast;
  comparisonTable: Map<string, number[]>; // metric -> scores for each scenario
}

// ============================================================================
// DECISION ANALYSIS RESULTS
// ============================================================================

/**
 * Path recommendation
 */
export interface PathRecommendation {
  pathType: PathType;
  optionId: string;
  optionLabel: string;
  confidence: number; // 0-100
  rationale: string;
  fitScore: number; // 0-100
}

/**
 * Type of recommended path
 */
export type PathType =
  | 'RECOMMENDED'
  | 'BEST_LONG_TERM'
  | 'HIGHEST_OPTIONALITY'
  | 'LOWEST_REGRET'
  | 'HIGHEST_INCOME'
  | 'BEST_IDENTITY_FIT'
  | 'SAFEST'
  | 'HIGHEST_GROWTH'
  | 'FASTEST_TO_IMPLEMENT'
  | 'MOST_ALIGNS_WITH_VALUES';

export const DECISION_READINESS_STATUSES = [
  'READY',
  'NEEDS_MORE_INFO',
  'NEEDS_TIME',
  'NOT_READY',
] as const;

export type DecisionReadinessStatus = (typeof DECISION_READINESS_STATUSES)[number];

/**
 * Complete decision analysis
 */
export interface DecisionAnalysis {
  id: DecisionId;
  input: DecisionInput;
  timestamp: Date;

  // Component analyses
  tradeoffs: TradeoffAnalysis;
  regret: RegretProfile;
  optionality: OptionalityAnalysis;
  reversibility: DecisionReversibility;
  risks: RiskProfile;
  scenarios: ScenarioComparison;

  // Path recommendations
  pathRecommendations: PathRecommendation[];
  primaryRecommendation: PathRecommendation;

  // Overall assessment
  decisionConfidence: number; // 0-100
  decisionReadiness: DecisionReadinessStatus;
  urgencyAssessment: DecisionUrgency;

  // Explanations
  summary: string;
  detailedExplanation: string;
  mentorGuidance: string;
  studentExplanation: string;

  // Next steps
  nextSteps: string[];
  informationGaps: string[];
  experiments: ExperimentSuggestion[];
}

/**
 * Suggested experiment to reduce uncertainty
 */
export interface ExperimentSuggestion {
  name: string;
  description: string;
  duration: number; // days
  effort: 'LOW' | 'MEDIUM' | 'HIGH';
  potentialInsight: string;
  howItReducesUncertainty: string;
}

// ============================================================================
// DECISION INTELLIGENCE REPORT
// ============================================================================

/**
 * Complete decision intelligence report
 */
export interface DecisionIntelligenceReport {
  id: string;
  studentId: string;
  generatedAt: Date;

  // Key decision
  keyDecision: DecisionSummary;

  // Analyses
  majorTradeoffs: TradeoffAnalysis;
  riskAnalysis: RiskProfile;
  optionalityAnalysis: OptionalityAnalysis;
  regretAnalysis: RegretProfile;
  futureScenarios: ScenarioComparison;

  // Recommendation
  decisionRecommendation: PathRecommendation;
  alternativePaths: PathRecommendation[];

  // Assessment
  confidence: number;
  readiness: DecisionReadiness;

  // Explanations
  executiveSummary: string;
  detailedAnalysis: string;
  mentorTalkingPoints: string[];
  studentFacingExplanation: string;

  // Action items
  immediateActions: string[];
  mediumTermActions: string[];
  longTermConsiderations: string[];
}

/**
 * Decision summary
 */
export interface DecisionSummary {
  id: DecisionId;
  type: DecisionType;
  description: string;
  options: string[];
  stakes: 'LIFE_CHANGING' | 'SIGNIFICANT' | 'MODERATE' | 'LOW';
  timeline: string;
}

/**
 * Decision readiness assessment
 */
export interface DecisionReadiness {
  status: DecisionReadinessStatus;
  missingInformation: string[];
  recommendedPreparation: string[];
  estimatedReadinessDate?: Date;
}

// ============================================================================
// ENGINE CONFIGURATIONS
// ============================================================================

/**
 * Tradeoff engine configuration
 */
export interface TradeoffEngineConfig {
  sensitivity: number;
  minEvidenceCount: number;
  dimensionWeights: Map<TradeoffDimension, number>;
  awarenessThresholds: {
    unaware: number;
    partiallyAware: number;
    fullyAware: number;
  };
}

/**
 * Optionality engine configuration
 */
export interface OptionalityEngineConfig {
  futureTimeframe: number; // years
  minAccessibilityThreshold: number;
  pivotBarrierWeight: number;
  explorationMechanismBonus: number;
}

/**
 * Risk engine configuration
 */
export interface RiskEngineConfig {
  riskAppetite: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
  categoryWeights: Map<RiskCategory, number>;
  mitigationEffectiveness: number;
  horizon: number; // years
}

/**
 * Scenario engine configuration
 */
export interface ScenarioEngineConfig {
  numScenarios: number;
  timeframe: number; // years
  confidenceIntervals: boolean;
  includeOutliers: boolean;
  sensitivityAnalysis: boolean;
}

/**
 * Master decision engine configuration
 */
export interface DecisionEngineConfig {
  tradeoff: TradeoffEngineConfig;
  regret: RegretEngineConfig;
  optionality: OptionalityEngineConfig;
  risk: RiskEngineConfig;
  scenario: ScenarioEngineConfig;
  enableAllAnalyses: boolean;
  explanationStyle: 'TECHNICAL' | 'STUDENT_FRIENDLY' | 'MENTOR_STYLE';
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Decision comparison
 */
export interface DecisionComparison {
  optionA: DecisionOption;
  optionB: DecisionOption;
  comparisonDimensions: Map<string, ComparisonResult>;
  winner: 'A' | 'B' | 'TIE' | 'DEPENDS';
  explanation: string;
}

/**
 * Comparison result for a dimension
 */
export interface ComparisonResult {
  dimension: string;
  optionAScore: number;
  optionBScore: number;
  winner: 'A' | 'B' | 'TIE';
  significance: 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * Decision quality metrics
 */
export interface DecisionQualityMetrics {
  clarity: number; // 0-100
  informationCompleteness: number; // 0-100
  alignmentWithValues: number; // 0-100
  stakeholderAlignment: number; // 0-100
  reversibility: number; // 0-100
  timingQuality: number; // 0-100
  overall: number; // 0-100
}

/**
 * Decision telemetry for tracking
 */
export interface DecisionTelemetry {
  decisionId: DecisionId;
  analysisDuration: number; // ms
  complexityScore: number;
  confidence: number;
  tradeoffsDetected: number;
  risksIdentified: number;
  scenariosGenerated: number;
  timestamp: Date;
}
