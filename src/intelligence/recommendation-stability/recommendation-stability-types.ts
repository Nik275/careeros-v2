/**
 * Recommendation Stability Engine - Core Types
 *
 * Phase 8.4: Recommendation Stability Engine
 *
 * Comprehensive type system for measuring recommendation stability,
 * confidence, volatility, uncertainty, and consensus across profile
 * perturbations.
 *
 * @module recommendation-stability-types
 * @version 1.0.0
 */

import type { DimensionScoreMap, DimensionScore } from '../../assessment/assessment-types';
import type { CareerRecommendation, RecommendationSet } from '../../recommendation/recommendation-types';

// ============================================================================
// CORE IDENTIFIERS
// ============================================================================

/** Unique identifier for a stability analysis */
export type StabilityAnalysisId = string & { readonly __brand: 'StabilityAnalysisId' };

/** Unique identifier for a perturbation simulation */
export type PerturbationId = string & { readonly __brand: 'PerturbationId' };

/** Unique identifier for a consensus calculation */
export type ConsensusId = string & { readonly __brand: 'ConsensusId' };

/** Severity vocabulary for profile or recommendation-stability contradictions */
export type ContradictionSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

/**
 * A profile or value-dimension contradiction used by recommendation stability
 * and downstream decision-intelligence tradeoff/regret analysis.
 */
export interface Contradiction {
  /** First conflicting dimension or value */
  dimensionA: string;

  /** Second conflicting dimension or value */
  dimensionB: string;

  /** Severity level used by stability confidence and uncertainty scoring */
  severity: ContradictionSeverity;

  /** Human-readable explanation of the contradiction */
  description: string;

  /** Optional observation timestamp */
  timestamp?: Date;
}

// ============================================================================
// PERTURBATION ENGINE TYPES
// ============================================================================

/** Perturbation intensity levels */
export type PerturbationIntensity = 'LIGHT' | 'MEDIUM' | 'HEAVY' | 'EXTREME';

/** Simulation count options */
export type SimulationCount = 50 | 100 | 250 | 500 | 1000;

/** Perturbation strategy for specific dimensions */
export type PerturbationStrategy =
  | 'UNIFORM'           // Same perturbation across all dimensions
  | 'WEIGHTED'          // More perturbation in uncertain dimensions
  | 'COGNITIVE_FOCUS'   // Focus on cognitive dimensions
  | 'MOTIVATION_FOCUS'  // Focus on motivation dimensions
  | 'RANDOM_WALK'       // Random walk through profile space
  | 'GAUSSIAN';         // Gaussian distribution around base profile

/** Configuration for perturbation engine */
export interface PerturbationConfig {
  /** Perturbation intensity level */
  intensity: PerturbationIntensity;
  
  /** Number of simulations to run */
  simulationCount: SimulationCount;
  
  /** Perturbation strategy */
  strategy: PerturbationStrategy;
  
  /** Whether to preserve relative dimension relationships */
  preserveRankOrder: boolean;
  
  /** Minimum score bound */
  minScore: number;
  
  /** Maximum score bound */
  maxScore: number;
  
  /** Random seed for reproducibility */
  randomSeed?: number;
  
  /** Dimension-specific perturbation multipliers */
  dimensionMultipliers?: Map<string, number>;
}

/** Default perturbation configuration */
export const DEFAULT_PERTURBATION_CONFIG: PerturbationConfig = {
  intensity: 'MEDIUM',
  simulationCount: 250,
  strategy: 'WEIGHTED',
  preserveRankOrder: true,
  minScore: 0,
  maxScore: 100,
};

/** Intensity-specific perturbation parameters */
export const PERTURBATION_PARAMS: Record<PerturbationIntensity, {
  stdDev: number;
  maxDelta: number;
}> = {
  LIGHT: { stdDev: 3, maxDelta: 8 },
  MEDIUM: { stdDev: 6, maxDelta: 15 },
  HEAVY: { stdDev: 12, maxDelta: 25 },
  EXTREME: { stdDev: 20, maxDelta: 40 },
};

/** A single perturbed profile variant */
export interface PerturbedProfile {
  /** Unique identifier for this perturbation */
  id: PerturbationId;
  
  /** Perturbed dimension scores */
  dimensionScores: DimensionScoreMap;
  
  /** Perturbation deltas from base profile */
  deltas: Map<string, number>;
  
  /** Magnitude of perturbation */
  perturbationMagnitude: number;
  
  /** Which dimensions were most perturbed */
  mostPerturbedDimensions: string[];
  
  /** Whether rank order was preserved */
  rankOrderPreserved: boolean;
}

/** Result of perturbation engine execution */
export interface PerturbationResult {
  /** Base profile that was perturbed */
  baseProfile: DimensionScoreMap;
  
  /** Generated perturbed profiles */
  perturbedProfiles: PerturbedProfile[];
  
  /** Configuration used */
  config: PerturbationConfig;
  
  /** Summary statistics */
  statistics: PerturbationStatistics;
  
  /** Generation timestamp */
  generatedAt: Date;
}

/** Statistics for perturbation results */
export interface PerturbationStatistics {
  /** Total profiles generated */
  totalGenerated: number;
  
  /** Average perturbation magnitude */
  averageMagnitude: number;
  
  /** Maximum perturbation magnitude */
  maxMagnitude: number;
  
  /** Percentage where rank order was preserved */
  rankOrderPreservationRate: number;
  
  /** Most variable dimensions */
  mostVariableDimensions: Array<{
    dimension: string;
    averageDelta: number;
    variance: number;
  }>;
  
  /** Generation time in milliseconds */
  generationTimeMs: number;
}

// ============================================================================
// CONSENSUS ENGINE TYPES
// ============================================================================

/** Consensus calculation method */
export type ConsensusMethod = 'MAJORITY' | 'PLURALITY' | 'BORDA_COUNT' | 'SCORE_WEIGHTED';

/** Configuration for consensus engine */
export interface ConsensusConfig {
  /** Method for calculating consensus */
  method: ConsensusMethod;
  
  /** Minimum percentage to consider strong consensus (0-1) */
  strongConsensusThreshold: number;
  
  /** Minimum percentage to consider moderate consensus (0-1) */
  moderateConsensusThreshold: number;
  
  /** Number of top recommendations to track */
  topRecommendationsCount: number;
  
  /** Whether to weight by recommendation score */
  weightByScore: boolean;
}

/** Default consensus configuration */
export const DEFAULT_CONSENSUS_CONFIG: ConsensusConfig = {
  method: 'SCORE_WEIGHTED',
  strongConsensusThreshold: 0.75,
  moderateConsensusThreshold: 0.50,
  topRecommendationsCount: 5,
  weightByScore: true,
};

/** Recommendation frequency in consensus */
export interface RecommendationFrequency {
  /** Career identifier */
  careerId: string;
  
  /** Career title */
  careerTitle: string;
  
  /** Number of times this career was recommended */
  count: number;
  
  /** Percentage of simulations (0-1) */
  percentage: number;
  
  /** Average rank across simulations (1 = best) */
  averageRank: number;
  
  /** Average score across simulations */
  averageScore: number;
  
  /** Score variance across simulations */
  scoreVariance: number;
  
  /** Best rank achieved */
  bestRank: number;
  
  /** Worst rank achieved */
  worstRank: number;
}

/** Rank distribution for a career */
export interface RankDistribution {
  /** Career identifier */
  careerId: string;
  
  /** Distribution across ranks */
  distribution: Map<number, number>; // rank -> percentage
  
  /** Most common rank */
  modeRank: number;
  
  /** Entropy of rank distribution */
  rankEntropy: number;
}

/** Complete consensus analysis result */
export interface ConsensusResult {
  /** Unique identifier */
  id: ConsensusId;
  
  /** Primary recommendation (most frequent) */
  primaryRecommendation: {
    careerId: string;
    careerTitle: string;
    consensusPercentage: number;
    averageRank: number;
    averageScore: number;
  };
  
  /** Runner-up recommendation */
  runnerUpRecommendation?: {
    careerId: string;
    careerTitle: string;
    consensusPercentage: number;
    gapToPrimary: number;
  };
  
  /** Complete recommendation distribution */
  recommendationDistribution: RecommendationFrequency[];
  
  /** Top recommendations by rank */
  topRecommendationsByRank: Map<number, RecommendationFrequency>;
  
  /** Rank distributions for each career */
  rankDistributions: RankDistribution[];
  
  /** Entropy of recommendation distribution */
  recommendationEntropy: number;
  
  /** Normalized entropy (0-1) */
  normalizedEntropy: number;
  
  /** Gini coefficient of distribution */
  giniCoefficient: number;
  
  /** Consensus strength classification */
  consensusStrength: ConsensusStrength;
  
  /** Number of simulations analyzed */
  simulationsAnalyzed: number;
  
  /** Configuration used */
  config: ConsensusConfig;
  
  /** Generation timestamp */
  generatedAt: Date;
}

/** Consensus strength classification */
export type ConsensusStrength =
  | 'UNANIMOUS'      // >95% consensus
  | 'STRONG'         // 75-95% consensus
  | 'MODERATE'       // 50-75% consensus
  | 'WEAK'           // 30-50% consensus
  | 'FRAGMENTED';    // <30% consensus

// ============================================================================
// CONFIDENCE ENGINE TYPES
// ============================================================================

/** Confidence band classification */
export type ConfidenceBand =
  | 'VERY_HIGH'      // 90-100
  | 'HIGH'           // 75-89
  | 'MODERATE'       // 50-74
  | 'LOW'            // 25-49
  | 'VERY_LOW';      // 0-24

/** Components of confidence calculation */
export interface ConfidenceComponents {
  /** Recommendation consistency (0-100) */
  recommendationConsistency: number;
  
  /** Profile coherence (0-100) */
  profileCoherence: number;
  
  /** Contradiction severity (0-100, lower is better) */
  contradictionSeverity: number;
  
  /** Assessment completeness (0-100) */
  assessmentCompleteness: number;
  
  /** Uncertainty level (0-100, lower is better) */
  uncertaintyLevel: number;
  
  /** Consensus strength (0-100) */
  consensusStrength: number;
}

/** Weights for confidence components */
export interface ConfidenceWeights {
  recommendationConsistency: number;
  profileCoherence: number;
  contradictionSeverity: number;
  assessmentCompleteness: number;
  uncertaintyLevel: number;
  consensusStrength: number;
}

/** Default confidence weights */
export const DEFAULT_CONFIDENCE_WEIGHTS: ConfidenceWeights = {
  recommendationConsistency: 0.25,
  profileCoherence: 0.20,
  contradictionSeverity: 0.15,
  assessmentCompleteness: 0.15,
  uncertaintyLevel: 0.10,
  consensusStrength: 0.15,
};

/** Confidence calculation result */
export interface ConfidenceResult {
  /** Overall confidence score (0-100) */
  confidenceScore: number;
  
  /** Confidence band classification */
  confidenceBand: ConfidenceBand;
  
  /** Component scores */
  components: ConfidenceComponents;
  
  /** Human-readable explanation */
  explanation: string;
  
  /** Key factors supporting confidence */
  supportingFactors: string[];
  
  /** Key factors reducing confidence */
  reducingFactors: string[];
  
  /** Improvement suggestions */
  improvementSuggestions: string[];
  
  /** Generation timestamp */
  generatedAt: Date;
}

// ============================================================================
// STABILITY ENGINE TYPES
// ============================================================================

/** Stability band classification */
export type StabilityBand =
  | 'ROCK_SOLID'        // >95% stability
  | 'HIGHLY_STABLE'     // 85-95% stability
  | 'STABLE'            // 70-84% stability
  | 'MODERATELY_STABLE' // 50-69% stability
  | 'UNSTABLE'          // 30-49% stability
  | 'HIGHLY_UNSTABLE';  // <30% stability

/** Stability metrics */
export interface StabilityMetrics {
  /** Overall stability score (0-100) */
  stabilityScore: number;
  
  /** Primary recommendation retention rate (0-1) */
  primaryRetentionRate: number;
  
  /** Top 3 recommendation retention rate (0-1) */
  top3RetentionRate: number;
  
  /** Average rank change for primary recommendation */
  averageRankChange: number;
  
  /** Maximum rank change for primary recommendation */
  maxRankChange: number;
  
  /** Percentage of simulations with rank changes */
  rankChangeFrequency: number;
}

/** Stability analysis result */
export interface StabilityResult {
  /** Overall stability score (0-100) */
  stabilityScore: number;
  
  /** Stability band classification */
  stabilityBand: StabilityBand;
  
  /** Detailed metrics */
  metrics: StabilityMetrics;
  
  /** Human-readable explanation */
  explanation: string;
  
  /** Stability forecast */
  forecast: StabilityForecast;
  
  /** Comparison to typical profiles */
  percentileRank: number;
  
  /** Generation timestamp */
  generatedAt: Date;
}

/** Stability forecast */
export interface StabilityForecast {
  /** Likelihood recommendation remains stable (0-1) */
  likelihoodOfStability: number;
  
  /** Likely triggers for change */
  potentialTriggers: string[];
  
  /** Time horizon for stability */
  stableFor: string;
  
  /** Conditions that would increase stability */
  stabilityBoosters: string[];
  
  /** Conditions that would decrease stability */
  stabilityRisks: string[];
}

// ============================================================================
// VOLATILITY ENGINE TYPES
// ============================================================================

/** Volatility types */
export type VolatilityType =
  | 'RANK'           // Rank volatility
  | 'SCORE'          // Score volatility
  | 'CAREER'         // Career competition volatility
  | 'COMPOSITION'    // Recommendation composition volatility
  | 'DRIFT';         // Long-term drift

/** Volatility metrics */
export interface VolatilityMetrics {
  /** Overall volatility score (0-100, higher = more volatile) */
  volatilityScore: number;
  
  /** Rank volatility (0-100) */
  rankVolatility: number;
  
  /** Score volatility (0-100) */
  scoreVolatility: number;
  
  /** Career volatility - how much careers compete (0-100) */
  careerVolatility: number;
  
  /** Recommendation drift - tendency to change over perturbations (0-100) */
  recommendationDrift: number;
}

/** Volatility analysis result */
export interface VolatilityResult {
  /** Overall volatility score (0-100) */
  volatilityScore: number;
  
  /** Volatility band (inverse of stability) */
  volatilityBand: StabilityBand;
  
  /** Detailed metrics */
  metrics: VolatilityMetrics;
  
  /** Human-readable explanation */
  explanation: string;
  
  /** Unstable recommendation clusters */
  unstableClusters: UnstableCluster[];
  
  /** Most volatile careers */
  mostVolatileCareers: Array<{
    careerId: string;
    careerTitle: string;
    volatilityScore: number;
    rankRange: { min: number; max: number };
  }>;
  
  /** Generation timestamp */
  generatedAt: Date;
}

/** Cluster of unstable recommendations */
export interface UnstableCluster {
  /** Careers in this cluster */
  careers: string[];
  
  /** Cluster volatility score */
  clusterVolatility: number;
  
  /** How often these careers swap positions */
  swapFrequency: number;
  
  /** Reason for cluster instability */
  reason: string;
  
  /** Distinguishing factors */
  distinguishingFactors: string[];
}

// ============================================================================
// SENSITIVITY ANALYSIS TYPES
// ============================================================================

/** Feature importance for a dimension */
export interface FeatureImportance {
  /** Dimension name */
  dimension: string;
  
  /** Importance score (0-100) */
  importanceScore: number;
  
  /** Rank among all dimensions */
  rank: number;
  
  /** How much this dimension influences recommendations */
  influenceMagnitude: number;
  
  /** Direction of influence (positive/negative per career) */
  directionByCareer: Map<string, 'POSITIVE' | 'NEGATIVE' | 'MIXED'>;
  
  /** Stability of influence (how consistent across perturbations) */
  influenceStability: number;
}

/** Sensitivity weight for dimension-career pair */
export interface SensitivityWeight {
  /** Dimension name */
  dimension: string;
  
  /** Career identifier */
  careerId: string;
  
  /** Weight of this dimension for this career (-1 to 1) */
  weight: number;
  
  /** How much score changes affect recommendation */
  recommendationImpact: number;
  
  /** Confidence in this weight */
  confidence: number;
}

/** Impact of dimension changes */
export interface DimensionImpact {
  /** Dimension name */
  dimension: string;
  
  /** Impact score (0-100) */
  impactScore: number;
  
  /** Which careers are most affected */
  affectedCareers: Array<{
    careerId: string;
    impactDirection: 'INCREASES' | 'DECREASES' | 'MIXED';
    magnitude: number;
  }>;
  
  /** Threshold for significant change */
  changeThreshold: number;
  
  /** Explanation of impact */
  explanation: string;
}

/** Sensitivity analysis result */
export interface SensitivityResult {
  /** Feature importance ranking */
  featureImportance: FeatureImportance[];
  
  /** Top influential dimensions */
  mostInfluentialDimensions: string[];
  
  /** Sensitivity weights for dimension-career pairs */
  sensitivityWeights: SensitivityWeight[];
  
  /** Dimension impact analysis */
  dimensionImpacts: DimensionImpact[];
  
  /** Thresholds for significant recommendation changes */
  changeThresholds: Map<string, number>;
  
  /** Human-readable explanation */
  explanation: string;
  
  /** Insights about profile sensitivity */
  insights: string[];
  
  /** Generation timestamp */
  generatedAt: Date;
}

// ============================================================================
// UNCERTAINTY ENGINE TYPES
// ============================================================================

/** Sources of uncertainty */
export type UncertaintySource =
  | 'SPARSE_DATA'
  | 'CONTRADICTIONS'
  | 'WEAK_SIGNALS'
  | 'HIGH_COMPETITION'
  | 'PROFILE_AMBIGUITY'
  | 'LOW_CONSENSUS'
  | 'MEASUREMENT_ERROR'
  | 'MODEL_UNCERTAINTY';

/** Uncertainty band classification */
export type UncertaintyBand =
  | 'MINIMAL'       // 0-10
  | 'LOW'           // 10-25
  | 'MODERATE'      // 25-50
  | 'HIGH'          // 50-75
  | 'VERY_HIGH';    // 75-100

/** Uncertainty type classification */
export type UncertaintyType =
  | 'ALEMBIC'        // Fundamental uncertainty about the world
  | 'EPISTEMIC'      // Uncertainty due to lack of knowledge/data
  | 'MEASUREMENT'    // Uncertainty in measurements/assessments
  | 'MODEL';         // Uncertainty in model predictions

/** Contribution from a specific uncertainty source */
export interface UncertaintyContribution {
  /** Source of uncertainty */
  source: UncertaintySource;
  
  /** Contribution to overall uncertainty (0-100) */
  contribution: number;
  
  /** Severity of this uncertainty */
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  
  /** Whether this can be reduced with more data */
  reducible: boolean;
  
  /** Explanation */
  explanation: string;
}

/** Uncertainty analysis result */
export interface UncertaintyResult {
  /** Overall uncertainty score (0-100) */
  uncertaintyScore: number;
  
  /** Uncertainty band classification */
  uncertaintyBand: UncertaintyBand;
  
  /** Type of uncertainty */
  uncertaintyType: UncertaintyType;
  
  /** Contributions from different sources */
  sourceContributions: UncertaintyContribution[];
  
  /** Primary source of uncertainty */
  primarySource: UncertaintySource;
  
  /** Human-readable explanation */
  explanation: string;
  
  /** Whether uncertainty can be reduced */
  reducible: boolean;
  
  /** Suggestions for reducing uncertainty */
  reductionStrategies: string[];
  
  /** Confidence interval for recommendations */
  confidenceInterval: {
    lowerBound: number;
    upperBound: number;
    confidenceLevel: number;
  };
  
  /** Generation timestamp */
  generatedAt: Date;
}

// ============================================================================
// STUDENT EXPLANATION TYPES
// ============================================================================

/** Student-facing explanation */
export interface StudentExplanation {
  /** Stability explanation */
  stability: {
    summary: string;
    detail: string;
    practicalImplications: string[];
  };
  
  /** Confidence explanation */
  confidence: {
    summary: string;
    detail: string;
    supportingEvidence: string[];
    caveats: string[];
  };
  
  /** Uncertainty explanation */
  uncertainty: {
    summary: string;
    detail: string;
    whatThisMeans: string;
    whatToDo: string[];
  };
  
  /** Volatility explanation */
  volatility: {
    summary: string;
    detail: string;
    alternativeScenarios: string[];
  };
  
  /** Consensus explanation */
  consensus: {
    summary: string;
    detail: string;
    runnerUpInfo: string;
  };
  
  /** Integrated narrative */
  integratedNarrative: string;
  
  /** Key takeaways */
  keyTakeaways: string[];
  
  /** Tone and warmth level */
  tone: 'REASSURING' | 'CAUTIOUS' | 'ENCOURAGING' | 'NEUTRAL';
  
  /** Generation timestamp */
  generatedAt: Date;
}

/** Configuration for explanation generation */
export interface ExplanationConfig {
  /** Tone of explanations */
  tone: 'MENTOR' | 'ANALYST' | 'FRIEND' | 'COACH';
  
  /** Detail level */
  detailLevel: 'BRIEF' | 'MODERATE' | 'DETAILED';
  
  /** Whether to include technical details */
  includeTechnicalDetails: boolean;
  
  /** Whether to include actionable advice */
  includeActionableAdvice: boolean;
  
  /** Maximum length of explanations */
  maxLength: number;
}

/** Default explanation configuration */
export const DEFAULT_EXPLANATION_CONFIG: ExplanationConfig = {
  tone: 'MENTOR',
  detailLevel: 'MODERATE',
  includeTechnicalDetails: false,
  includeActionableAdvice: true,
  maxLength: 500,
};

// ============================================================================
// MAIN STABILITY ANALYSIS TYPES
// ============================================================================

/** Input for stability analysis */
export interface StabilityAnalysisInput {
  /** Student profile (base profile to analyze) */
  baseProfile: DimensionScoreMap;
  
  /** Original recommendations from base profile */
  baseRecommendations: RecommendationSet;
  
  /** Profile completeness information */
  profileCompleteness?: {
    completedDimensions: string[];
    missingDimensions: string[];
    completenessScore: number;
  };
  
  /** Known contradictions in profile */
  contradictions?: Array<
    Pick<Contradiction, 'severity'> & Partial<Omit<Contradiction, 'severity'>>
  >;
  
  /** Historical stability data (if available) */
  historicalData?: {
    previousAnalysisId?: StabilityAnalysisId;
    stabilityTrend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  };
  
  /** Analysis configuration */
  config?: Partial<StabilityAnalysisConfig>;
}

/** Configuration for stability analysis */
export interface StabilityAnalysisConfig {
  /** Perturbation configuration */
  perturbation: PerturbationConfig;
  
  /** Consensus configuration */
  consensus: ConsensusConfig;
  
  /** Confidence weights */
  confidenceWeights: ConfidenceWeights;
  
  /** Explanation configuration */
  explanation: ExplanationConfig;
  
  /** Whether to include sensitivity analysis */
  includeSensitivityAnalysis: boolean;
  
  /** Whether to include volatility analysis */
  includeVolatilityAnalysis: boolean;
  
  /** Whether to generate student explanation */
  generateStudentExplanation: boolean;
}

/** Default stability analysis configuration */
export const DEFAULT_STABILITY_ANALYSIS_CONFIG: StabilityAnalysisConfig = {
  perturbation: DEFAULT_PERTURBATION_CONFIG,
  consensus: DEFAULT_CONSENSUS_CONFIG,
  confidenceWeights: DEFAULT_CONFIDENCE_WEIGHTS,
  explanation: DEFAULT_EXPLANATION_CONFIG,
  includeSensitivityAnalysis: true,
  includeVolatilityAnalysis: true,
  generateStudentExplanation: true,
};

/** Complete stability analysis result */
export interface StabilityAnalysis {
  /** Unique identifier */
  id: StabilityAnalysisId;
  
  /** Input data */
  input: StabilityAnalysisInput;
  
  /** Perturbation results */
  perturbation: PerturbationResult;
  
  /** Recommendations from all perturbations */
  perturbedRecommendations: Map<PerturbationId, RecommendationSet>;
  
  /** Consensus analysis */
  consensus: ConsensusResult;
  
  /** Confidence analysis */
  confidence: ConfidenceResult;
  
  /** Stability analysis */
  stability: StabilityResult;
  
  /** Volatility analysis (if enabled) */
  volatility?: VolatilityResult;
  
  /** Sensitivity analysis (if enabled) */
  sensitivity?: SensitivityResult;
  
  /** Uncertainty analysis */
  uncertainty: UncertaintyResult;
  
  /** Student explanation (if enabled) */
  studentExplanation?: StudentExplanation;
  
  /** Telemetry data */
  telemetry: StabilityTelemetry;
  
  /** Analysis timestamp */
  analyzedAt: Date;
  
  /** Configuration used */
  config: StabilityAnalysisConfig;
}

/** Telemetry data for stability analysis */
export interface StabilityTelemetry {
  /** Confidence score */
  confidenceScore: number;
  
  /** Stability score */
  stabilityScore: number;
  
  /** Volatility score */
  volatilityScore: number;
  
  /** Uncertainty score */
  uncertaintyScore: number;
  
  /** Consensus score (primary recommendation percentage) */
  consensusScore: number;
  
  /** Number of simulations run */
  simulationCount: number;
  
  /** Primary recommendation */
  primaryRecommendation: string;
  
  /** Primary consensus percentage */
  primaryConsensusPercentage: number;
  
  /** Analysis duration in milliseconds */
  analysisDurationMs: number;
  
  /** Perturbation intensity used */
  perturbationIntensity: PerturbationIntensity;
}

// ============================================================================
// INTEGRATION TYPES
// ============================================================================

/** Integration with mentor intelligence */
export interface MentorStabilityContext {
  /** Stability context for mentor responses */
  stabilityContext: {
    shouldMentionStability: boolean;
    stabilityMention: string;
    confidenceMention: string;
    uncertaintyMention?: string;
  };
  
  /** Suggested mentor response adaptations */
  suggestedAdaptations: string[];
  
  /** Topics to emphasize */
  emphasizeTopics: string[];
  
  /** Topics to downplay */
  downplayTopics: string[];
}

/** Integration with recommendation engine */
export interface RecommendationStabilityContext {
  /** Whether to boost stable recommendations */
  boostStableRecommendations: boolean;
  
  /** Stability-adjusted scores */
  stabilityAdjustedScores: Map<string, number>;
  
  /** Recommendations to highlight as stable */
  stableRecommendations: string[];
  
  /** Recommendations to flag as uncertain */
  uncertainRecommendations: string[];
}

// ============================================================================
// ENGINE INTERFACES
// ============================================================================

/** Interface for perturbation engine */
export interface IPerturbationEngine {
  /** Generate perturbed profile variants */
  generatePerturbations(
    baseProfile: DimensionScoreMap,
    config: PerturbationConfig
  ): PerturbationResult;
}

/** Interface for consensus engine */
export interface IConsensusEngine {
  /** Calculate consensus across recommendations */
  calculateConsensus(
    recommendations: Map<PerturbationId, RecommendationSet>,
    config: ConsensusConfig
  ): ConsensusResult;
}

/** Interface for confidence engine */
export interface IConfidenceEngine {
  /** Calculate confidence in recommendations */
  calculateConfidence(
    consensus: ConsensusResult,
    profile: DimensionScoreMap,
    weights: ConfidenceWeights,
    contradictions?: Array<{ severity: ContradictionSeverity }>
  ): ConfidenceResult;
}

/** Interface for stability engine */
export interface IStabilityEngine {
  /** Measure recommendation stability */
  measureStability(
    consensus: ConsensusResult,
    perturbedRecommendations: Map<PerturbationId, RecommendationSet>
  ): StabilityResult;
}

/** Interface for volatility engine */
export interface IVolatilityEngine {
  /** Measure recommendation volatility */
  measureVolatility(
    perturbedRecommendations: Map<PerturbationId, RecommendationSet>,
    consensus: ConsensusResult
  ): VolatilityResult;
}

/** Interface for sensitivity analysis engine */
export interface ISensitivityAnalysisEngine {
  /** Analyze sensitivity to dimension changes */
  analyzeSensitivity(
    baseProfile: DimensionScoreMap,
    perturbedProfiles: PerturbedProfile[],
    perturbedRecommendations: Map<PerturbationId, RecommendationSet>
  ): SensitivityResult;
}

/** Interface for uncertainty engine */
export interface IUncertaintyEngine {
  /** Calculate uncertainty */
  calculateUncertainty(
    consensus: ConsensusResult,
    confidence: ConfidenceResult,
    profileCompleteness: number,
    contradictions: Array<{ severity: ContradictionSeverity }>
  ): UncertaintyResult;
}

/** Interface for student explanation engine */
export interface IStudentExplanationEngine {
  /** Generate student-facing explanation */
  generateExplanation(
    stability: StabilityResult,
    confidence: ConfidenceResult,
    consensus: ConsensusResult,
    uncertainty: UncertaintyResult,
    config: ExplanationConfig
  ): StudentExplanation;
}
