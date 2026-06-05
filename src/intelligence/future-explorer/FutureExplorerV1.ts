/**
 * CareerOS Future Explorer V1
 *
 * Allows CareerOS to reason across multiple futures.
 * Supports comparing paths, scenarios, regrets, and optionality.
 *
 * Generates FutureExplorerResult with comprehensive explainability.
 *
 * Deterministic. Graph-based. No AI. No randomness.
 *
 * @module intelligence/future-explorer
 * @version 1.0.0
 */

import type {
  FutureScenario,
  ScenarioType,
  CareerState,
  IncomePoint,
  FlexibilityPoint,
} from '../future-scenario/FutureScenarioGeneratorV1.js';

import type {
  ExploredCareerPath,
  PathType,
} from '../path-explorer/CareerPathExplorerV1.js';

import type {
  OptionalityAnalysis,
} from '../optionality-engine/OptionalityEngineV1.js';

import type {
  CriticalityAnalysis,
} from '../criticality-engine/CriticalityEngineV1.js';

import type {
  RegretAnalysis,
} from '../regret-functional/RegretFunctionalV2.js';

import type {
  CounterfactualComparison,
} from '../counterfactual-engine/CounterfactualEngine.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Unique identifier for future explorer results
 */
export type FutureExplorerId = string;

/**
 * A future context represents a complete possible future
 * including the path, scenarios, and analyses
 */
export interface FutureContext {
  /** Unique identifier for this future */
  id: string;

  /** Human-readable name */
  name: string;

  /** The career path that leads to this future */
  path: ExploredCareerPath;

  /** Scenarios for this future (best, expected, conservative, high-risk) */
  scenarios: FutureScenario[];

  /** Optionality analysis for this future */
  optionality: OptionalityAnalysis;

  /** Criticality analysis for this future */
  criticality: CriticalityAnalysis;

  /** Regret analysis for this future */
  regret?: RegretAnalysis;

  /** Overall attractiveness score (0-100) */
  attractivenessScore: number;

  /** Key characteristics of this future */
  characteristics: FutureCharacteristic[];
}

/**
 * Characteristic of a future
 */
export interface FutureCharacteristic {
  /** Characteristic type */
  type: 'income' | 'stability' | 'growth' | 'flexibility' | 'impact' | 'prestige' | 'work-life';

  /** Score (0-100) */
  score: number;

  /** Description */
  description: string;

  /** Whether this is a strength */
  isStrength: boolean;
}

/**
 * Comparison between multiple futures
 */
export interface FutureComparison {
  /** Comparison ID */
  id: string;

  /** Futures being compared */
  futures: FutureContext[];

  /** Number of futures */
  futureCount: number;

  /** Comparison dimensions */
  dimensions: FutureComparisonDimension[];

  /** Rankings by different criteria */
  rankings: FutureRanking[];

  /** Trade-off analysis */
  tradeoffs: FutureTradeoff[];

  /** Winner by different criteria */
  winners: FutureWinners;

  /** Generated timestamp */
  generatedAt: number;
}

/**
 * Comparison dimension for futures
 */
export interface FutureComparisonDimension {
  /** Dimension name */
  name: string;

  /** Dimension key */
  key: string;

  /** Scores for each future */
  scores: Array<{
    futureId: string;
    futureName: string;
    score: number;
    rank: number;
  }>;

  /** Best future for this dimension */
  bestFutureId: string;

  /** Spread (difference between best and worst) */
  spread: number;

  /** Whether higher is better */
  higherIsBetter: boolean;
}

/**
 * Ranking of futures by a specific criterion
 */
export interface FutureRanking {
  /** Criterion name */
  criterion: string;

  /** Criterion key */
  key: string;

  /** Ranked futures (best first) */
  rankedFutureIds: string[];

  /** Whether ties are allowed */
  allowTies: boolean;
}

/**
 * Trade-off between futures
 */
export interface FutureTradeoff {
  /** Trade-off ID */
  id: string;

  /** What you gain */
  gain: {
    futureId: string;
    description: string;
    value: number;
  };

  /** What you give up */
  giveUp: {
    futureId: string;
    description: string;
    value: number;
  };

  /** Importance (0-100) */
  importance: number;

  /** Whether this trade-off is reversible */
  isReversible: boolean;
}

/**
 * Winners by different criteria
 */
export interface FutureWinners {
  /** Overall best future */
  overall: string;

  /** Best by income */
  income: string;

  /** Best by stability */
  stability: string;

  /** Best by growth */
  growth: string;

  /** Best by flexibility */
  flexibility: string;

  /** Best by low regret */
  lowRegret: string;

  /** Most optionality */
  optionality: string;
}

/**
 * Path comparison across futures
 */
export interface PathComparisonAcrossFutures {
  /** Comparison ID */
  id: string;

  /** Paths being compared */
  paths: ExploredCareerPath[];

  /** Number of paths */
  pathCount: number;

  /** Comparison metrics */
  metrics: PathComparisonMetric[];

  /** Path similarities */
  similarities: PathSimilarity[];

  /** Path differences */
  differences: PathDifference[];

  /** Convergence points (where paths meet) */
  convergencePoints: ConvergencePoint[];

  /** Divergence points (where paths split) */
  divergencePoints: DivergencePoint[];
}

/**
 * Metric comparison for paths
 */
export interface PathComparisonMetric {
  /** Metric name */
  name: string;

  /** Metric key */
  key: string;

  /** Values for each path */
  values: Array<{
    pathId: string;
    pathName: string;
    value: number;
    unit: string;
  }>;

  /** Best path for this metric */
  bestPathId: string;
}

/**
 * Similarity between two paths
 */
export interface PathSimilarity {
  /** Path A ID */
  pathAId: string;

  /** Path A name */
  pathAName: string;

  /** Path B ID */
  pathBId: string;

  /** Path B name */
  pathBName: string;

  /** Similarity score (0-100) */
  similarityScore: number;

  /** Common elements */
  commonElements: string[];

  /** Shared milestones */
  sharedMilestones: string[];

  /** Shared skills */
  sharedSkills: string[];
}

/**
 * Difference between two paths
 */
export interface PathDifference {
  /** Path A ID */
  pathAId: string;

  /** Path B ID */
  pathBId: string;

  /** Difference type */
  type: 'duration' | 'income' | 'education' | 'skills' | 'risk' | 'optionality';

  /** Difference magnitude */
  magnitude: number;

  /** Description */
  description: string;

  /** Impact assessment */
  impact: 'minor' | 'moderate' | 'major' | 'critical';
}

/**
 * Point where paths converge
 */
export interface ConvergencePoint {
  /** Year of convergence */
  year: number;

  /** Career/node where paths meet */
  nodeId: string;

  /** Node name */
  nodeName: string;

  /** Paths that converge here */
  pathIds: string[];

  /** Description */
  description: string;
}

/**
 * Point where paths diverge
 */
export interface DivergencePoint {
  /** Year of divergence */
  year: number;

  /** Career/node where paths split */
  nodeId: string;

  /** Node name */
  nodeName: string;

  /** Paths that diverge from here */
  pathIds: string[];

  /** Description */
  description: string;
}

/**
 * Scenario comparison across futures
 */
export interface ScenarioComparisonAcrossFutures {
  /** Comparison ID */
  id: string;

  /** Scenarios grouped by type */
  scenariosByType: Record<ScenarioType, FutureScenario[]>;

  /** Cross-future scenario analysis */
  crossAnalysis: CrossScenarioAnalysis[];

  /** Scenario outcome ranges */
  outcomeRanges: ScenarioOutcomeRange[];

  /** Best and worst case across all futures */
  extremes: ScenarioExtremes;
}

/**
 * Analysis across scenarios of different futures
 */
export interface CrossScenarioAnalysis {
  /** Scenario type */
  scenarioType: ScenarioType;

  /** Analysis */
  analysis: {
    /** Average income across futures */
    averageIncome: number;

    /** Income range */
    incomeRange: { min: number; max: number };

    /** Average flexibility */
    averageFlexibility: number;

    /** Flexibility range */
    flexibilityRange: { min: number; max: number };

    /** Most optimistic future */
    mostOptimisticFutureId: string;

    /** Most pessimistic future */
    mostPessimisticFutureId: string;
  };
}

/**
 * Outcome range for a metric across scenarios
 */
export interface ScenarioOutcomeRange {
  /** Metric name */
  metric: string;

  /** Metric key */
  key: string;

  /** Range across all scenarios */
  range: {
    min: number;
    max: number;
    average: number;
    median: number;
  };

  /** Future with minimum value */
  minFutureId: string;

  /** Future with maximum value */
  maxFutureId: string;
}

/**
 * Extremes across all scenarios
 */
export interface ScenarioExtremes {
  /** Best possible outcome */
  bestCase: {
    futureId: string;
    scenarioId: string;
    description: string;
    peakIncome: number;
  };

  /** Worst possible outcome */
  worstCase: {
    futureId: string;
    scenarioId: string;
    description: string;
    lowestIncome: number;
  };

  /** Most realistic outcome */
  expectedCase: {
    futureId: string;
    scenarioId: string;
    description: string;
    averageIncome: number;
  };
}

/**
 * Regret comparison across futures
 */
export interface RegretComparisonAcrossFutures {
  /** Comparison ID */
  id: string;

  /** Regret analysis for each future */
  futureRegrets: FutureRegret[];

  /** Comparative regret analysis */
  comparativeAnalysis: ComparativeRegretAnalysis;

  /** Regret minimization recommendation */
  minimizationRecommendation: RegretMinimizationRecommendation;
}

/**
 * Regret analysis for a specific future
 */
export interface FutureRegret {
  /** Future ID */
  futureId: string;

  /** Future name */
  futureName: string;

  /** Overall regret risk (0-100, higher = more regret likely) */
  regretRisk: number;

  /** Regret by category */
  byCategory: Array<{
    category: string;
    risk: number;
    description: string;
  }>;

  /** Key regret drivers */
  drivers: string[];

  /** Regret mitigations available */
  mitigations: string[];
}

/**
 * Comparative regret analysis
 */
export interface ComparativeRegretAnalysis {
  /** Future with lowest regret risk */
  lowestRegretFutureId: string;

  /** Future with highest regret risk */
  highestRegretFutureId: string;

  /** Regret risk spread */
  riskSpread: number;

  /** Common regret patterns */
  commonPatterns: string[];

  /** Unique regret risks by future */
  uniqueRisks: Array<{
    futureId: string;
    risks: string[];
  }>;
}

/**
 * Recommendation for regret minimization
 */
export interface RegretMinimizationRecommendation {
  /** Recommended future */
  recommendedFutureId: string;

  /** Confidence in recommendation */
  confidence: number;

  /** Reasoning */
  reasoning: string;

  /** Actions to minimize regret */
  actions: string[];

  /** Contingency plans */
  contingencyPlans: string[];
}

/**
 * Optionality comparison across futures
 */
export interface OptionalityComparisonAcrossFutures {
  /** Comparison ID */
  id: string;

  /** Optionality analysis for each future */
  futureOptionalities: FutureOptionality[];

  /** Comparative optionality analysis */
  comparativeAnalysis: ComparativeOptionalityAnalysis;

  /** Optionality preservation strategies */
  preservationStrategies: OptionalityPreservationStrategy[];
}

/**
 * Optionality analysis for a specific future
 */
export interface FutureOptionality {
  /** Future ID */
  futureId: string;

  /** Future name */
  futureName: string;

  /** Overall optionality score */
  overallScore: number;

  /** Optionality rating */
  rating: 'exceptional' | 'high' | 'good' | 'moderate' | 'low' | 'limited';

  /** Optionality dimensions */
  dimensions: Array<{
    name: string;
    score: number;
    description: string;
  }>;

  /** Adjacent careers accessible */
  adjacentCareers: string[];

  /** Pivot potential */
  pivotPotential: number;

  /** Future optionality trend */
  trend: 'increasing' | 'stable' | 'decreasing';
}

/**
 * Comparative optionality analysis
 */
export interface ComparativeOptionalityAnalysis {
  /** Future with highest optionality */
  highestOptionalityFutureId: string;

  /** Future with lowest optionality */
  lowestOptionalityFutureId: string;

  /** Optionality spread */
  optionalitySpread: number;

  /** Optionality rankings */
  rankings: Array<{
    futureId: string;
    rank: number;
    score: number;
  }>;

  /** Common optionality features */
  commonFeatures: string[];

  /** Unique optionality advantages */
  uniqueAdvantages: Array<{
    futureId: string;
    advantages: string[];
  }>;
}

/**
 * Strategy for preserving optionality
 */
export interface OptionalityPreservationStrategy {
  /** Strategy name */
  name: string;

  /** Description */
  description: string;

  /** Applicable futures */
  applicableFutureIds: string[];

  /** Effectiveness score */
  effectiveness: number;

  /** Implementation steps */
  steps: string[];
}

/**
 * Complete result from the Future Explorer
 */
export interface FutureExplorerResult {
  /** Result ID */
  id: FutureExplorerId;

  /** Timestamp */
  generatedAt: number;

  /** Futures explored */
  futures: FutureContext[];

  /** Future comparison */
  futureComparison: FutureComparison;

  /** Path comparison */
  pathComparison: PathComparisonAcrossFutures;

  /** Scenario comparison */
  scenarioComparison: ScenarioComparisonAcrossFutures;

  /** Regret comparison */
  regretComparison: RegretComparisonAcrossFutures;

  /** Optionality comparison */
  optionalityComparison: OptionalityComparisonAcrossFutures;

  /** Explainability */
  explanation: FutureExplorerExplanation;

  /** Recommendations */
  recommendations: FutureExplorerRecommendation[];
}

/**
 * Explainability output for Future Explorer
 */
export interface FutureExplorerExplanation {
  /** Executive summary */
  executiveSummary: string;

  /** Detailed narrative */
  narrative: string;

  /** Key insights */
  keyInsights: string[];

  /** Trade-off summary */
  tradeOffSummary: string;

  /** Decision framework */
  decisionFramework: FutureDecisionFramework;

  /** Questions to consider */
  questionsToConsider: string[];
}

/**
 * Decision framework for choosing between futures
 */
export interface FutureDecisionFramework {
  /** Choose this future if... */
  chooseIf: Record<string, string[]>;

  /** Avoid this future if... */
  avoidIf: Record<string, string[]>;

  /** Deal breakers for each future */
  dealBreakers: Record<string, string[]>;
}

/**
 * Recommendation from Future Explorer
 */
export interface FutureExplorerRecommendation {
  /** Recommendation ID */
  id: string;

  /** Type of recommendation */
  type: 'primary' | 'alternative' | 'contingency' | 'exploration';

  /** Recommended future ID */
  futureId: string;

  /** Future name */
  futureName: string;

  /** Confidence (0-100) */
  confidence: number;

  /** Reasoning */
  reasoning: string;

  /** Key benefits */
  benefits: string[];

  /** Key risks */
  risks: string[];

  /** Next steps */
  nextSteps: string[];
}

/**
 * Input for Future Explorer
 */
export interface FutureExplorerInput {
  /** Career paths to explore */
  paths: ExploredCareerPath[];

  /** Scenarios for each path */
  scenarios: Record<string, FutureScenario[]>;

  /** Optionality analyses */
  optionalities: Record<string, OptionalityAnalysis>;

  /** Criticality analyses */
  criticalities: Record<string, CriticalityAnalysis>;

  /** Regret analyses (optional) */
  regrets?: Record<string, RegretAnalysis>;

  /** Student values (for personalization) */
  studentValues?: {
    incomeWeight: number;
    stabilityWeight: number;
    growthWeight: number;
    flexibilityWeight: number;
    impactWeight: number;
  };

  /** Exploration depth */
  depth: 'summary' | 'detailed' | 'comprehensive';

  /** Time horizon */
  timeHorizon: number;
}

/**
 * Configuration for Future Explorer
 */
export interface FutureExplorerConfig {
  /** Minimum futures to compare */
  minFutures: number;

  /** Maximum futures to compare */
  maxFutures: number;

  /** Default time horizon */
  defaultTimeHorizon: number;

  /** Income weight in overall scoring */
  incomeWeight: number;

  /** Stability weight in overall scoring */
  stabilityWeight: number;

  /** Growth weight in overall scoring */
  growthWeight: number;

  /** Flexibility weight in overall scoring */
  flexibilityWeight: number;

  /** Regret weight in overall scoring */
  regretWeight: number;

  /** Optionality weight in overall scoring */
  optionalityWeight: number;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_FUTURE_EXPLORER_CONFIG: FutureExplorerConfig = {
  minFutures: 2,
  maxFutures: 5,
  defaultTimeHorizon: 20,
  incomeWeight: 0.20,
  stabilityWeight: 0.15,
  growthWeight: 0.20,
  flexibilityWeight: 0.15,
  regretWeight: 0.15,
  optionalityWeight: 0.15,
};

// ============================================================================
// MAIN FUTURE EXPLORER ENGINE
// ============================================================================

export class FutureExplorerV1 {
  private config: FutureExplorerConfig;

  constructor(config: Partial<FutureExplorerConfig> = {}) {
    this.config = {
      ...DEFAULT_FUTURE_EXPLORER_CONFIG,
      ...config,
    };
  }

  /**
   * Explore multiple futures and generate comprehensive comparison
   */
  explore(input: FutureExplorerInput): FutureExplorerResult {
    const { paths, scenarios, optionalities, criticalities, regrets, studentValues, depth, timeHorizon } = input;

    // Validate input
    if (paths.length < this.config.minFutures) {
      throw new Error(`At least ${this.config.minFutures} futures required`);
    }
    if (paths.length > this.config.maxFutures) {
      throw new Error(`Maximum ${this.config.maxFutures} futures allowed`);
    }

    // Generate unique ID
    const id = `future-explorer-${Date.now()}`;

    // Build future contexts
    const futures = this.buildFutureContexts(
      paths,
      scenarios,
      optionalities,
      criticalities,
      regrets,
      studentValues
    );

    // Generate comparisons
    const futureComparison = this.compareFutures(futures, studentValues);
    const pathComparison = this.comparePaths(paths);
    const scenarioComparison = this.compareScenarios(futures);
    const regretComparison = this.compareRegrets(futures, regrets || {});
    const optionalityComparison = this.compareOptionalities(futures);

    // Generate explanation
    const explanation = this.generateExplanation(
      futures,
      futureComparison,
      pathComparison,
      scenarioComparison,
      regretComparison,
      optionalityComparison
    );

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      futures,
      futureComparison,
      studentValues
    );

    return {
      id,
      generatedAt: Date.now(),
      futures,
      futureComparison,
      pathComparison,
      scenarioComparison,
      regretComparison,
      optionalityComparison,
      explanation,
      recommendations,
    };
  }

  /**
   * Build future contexts from input data
   */
  private buildFutureContexts(
    paths: ExploredCareerPath[],
    scenarios: Record<string, FutureScenario[]>,
    optionalities: Record<string, OptionalityAnalysis>,
    criticalities: Record<string, CriticalityAnalysis>,
    regrets?: Record<string, RegretAnalysis>,
    studentValues?: FutureExplorerInput['studentValues']
  ): FutureContext[] {
    return paths.map(path => {
      const pathScenarios = scenarios[path.id] || [];
      const optionality = optionalities[path.id];
      const criticality = criticalities[path.id];
      const regret = regrets?.[path.id];

      // Calculate attractiveness score
      const attractivenessScore = this.calculateAttractivenessScore(
        path,
        optionality,
        criticality,
        studentValues
      );

      // Extract characteristics
      const characteristics = this.extractCharacteristics(path, optionality);

      return {
        id: path.id,
        name: path.name,
        path,
        scenarios: pathScenarios,
        optionality,
        criticality,
        regret,
        attractivenessScore,
        characteristics,
      };
    });
  }

  /**
   * Calculate attractiveness score for a future
   */
  private calculateAttractivenessScore(
    path: ExploredCareerPath,
    optionality: OptionalityAnalysis,
    criticality: CriticalityAnalysis,
    studentValues?: FutureExplorerInput['studentValues']
  ): number {
    const weights = studentValues || {
      incomeWeight: this.config.incomeWeight,
      stabilityWeight: this.config.stabilityWeight,
      growthWeight: this.config.growthWeight,
      flexibilityWeight: this.config.flexibilityWeight,
      impactWeight: 0.15,
    };

    // Calculate component scores
    const incomeScore = path.metrics.incomeRange.senior / 5000000 * 100; // Normalize to 0-100
    const stabilityScore = 100 - criticality.criticalityScore;
    const growthScore = path.scores?.growthScore || 50;
    const flexibilityScore = optionality.overallScore;

    // Weighted average
    const score =
      incomeScore * (weights.incomeWeight || 0.20) +
      stabilityScore * (weights.stabilityWeight || 0.15) +
      growthScore * (weights.growthWeight || 0.20) +
      flexibilityScore * (weights.flexibilityWeight || 0.15);

    return Math.round(Math.min(100, Math.max(0, score)));
  }

  /**
   * Extract characteristics from path and optionality
   */
  private extractCharacteristics(
    path: ExploredCareerPath,
    optionality: OptionalityAnalysis
  ): FutureCharacteristic[] {
    const characteristics: FutureCharacteristic[] = [];

    // Income characteristic
    const incomeScore = Math.min(100, path.metrics.incomeRange.senior / 500000);
    characteristics.push({
      type: 'income',
      score: Math.round(incomeScore),
      description: incomeScore > 70 ? 'High earning potential' : incomeScore > 40 ? 'Moderate earning potential' : 'Lower earning potential',
      isStrength: incomeScore > 60,
    });

    // Growth characteristic
    const growthScore = path.scores?.growthScore || 50;
    characteristics.push({
      type: 'growth',
      score: growthScore,
      description: growthScore > 70 ? 'Strong growth trajectory' : 'Moderate growth trajectory',
      isStrength: growthScore > 60,
    });

    // Flexibility characteristic
    characteristics.push({
      type: 'flexibility',
      score: optionality.overallScore,
      description: optionality.overallScore > 70 ? 'High career flexibility' : 'Moderate career flexibility',
      isStrength: optionality.overallScore > 60,
    });

    return characteristics;
  }

  /**
   * Compare futures across multiple dimensions
   */
  private compareFutures(
    futures: FutureContext[],
    studentValues?: FutureExplorerInput['studentValues']
  ): FutureComparison {
    const id = `comparison-${Date.now()}`;

    // Define comparison dimensions
    const dimensions: FutureComparisonDimension[] = [
      {
        name: 'Attractiveness',
        key: 'attractiveness',
        scores: futures.map((f, index) => ({
          futureId: f.id,
          futureName: f.name,
          score: f.attractivenessScore,
          rank: index + 1,
        })).sort((a, b) => b.score - a.score).map((s, index) => ({ ...s, rank: index + 1 })),
        bestFutureId: futures.reduce((best, f) => f.attractivenessScore > best.attractivenessScore ? f : best).id,
        spread: Math.max(...futures.map(f => f.attractivenessScore)) - Math.min(...futures.map(f => f.attractivenessScore)),
        higherIsBetter: true,
      },
      {
        name: 'Optionality',
        key: 'optionality',
        scores: futures.map((f, index) => ({
          futureId: f.id,
          futureName: f.name,
          score: f.optionality.overallScore,
          rank: index + 1,
        })).sort((a, b) => b.score - a.score).map((s, index) => ({ ...s, rank: index + 1 })),
        bestFutureId: futures.reduce((best, f) => f.optionality.overallScore > best.optionality.overallScore ? f : best).id,
        spread: Math.max(...futures.map(f => f.optionality.overallScore)) - Math.min(...futures.map(f => f.optionality.overallScore)),
        higherIsBetter: true,
      },
      {
        name: 'Flexibility (Low Criticality)',
        key: 'flexibility',
        scores: futures.map((f, index) => ({
          futureId: f.id,
          futureName: f.name,
          score: 100 - f.criticality.criticalityScore,
          rank: index + 1,
        })).sort((a, b) => b.score - a.score).map((s, index) => ({ ...s, rank: index + 1 })),
        bestFutureId: futures.reduce((best, f) => (100 - f.criticality.criticalityScore) > (100 - best.criticality.criticalityScore) ? f : best).id,
        spread: Math.max(...futures.map(f => 100 - f.criticality.criticalityScore)) - Math.min(...futures.map(f => 100 - f.criticality.criticalityScore)),
        higherIsBetter: true,
      },
    ];

    // Generate rankings
    const rankings: FutureRanking[] = [
      {
        criterion: 'Overall Attractiveness',
        key: 'attractiveness',
        rankedFutureIds: futures.sort((a, b) => b.attractivenessScore - a.attractivenessScore).map(f => f.id),
        allowTies: false,
      },
      {
        criterion: 'Future Optionality',
        key: 'optionality',
        rankedFutureIds: futures.sort((a, b) => b.optionality.overallScore - a.optionality.overallScore).map(f => f.id),
        allowTies: false,
      },
    ];

    // Generate trade-offs
    const tradeoffs = this.generateTradeoffs(futures);

    // Determine winners
    const winners: FutureWinners = {
      overall: dimensions[0].bestFutureId,
      income: futures.reduce((best, f) => {
        const bestIncome = best.path.metrics.incomeRange.senior;
        const currentIncome = f.path.metrics.incomeRange.senior;
        return currentIncome > bestIncome ? f : best;
      }).id,
      stability: futures.reduce((best, f) => {
        const bestStability = 100 - best.criticality.criticalityScore;
        const currentStability = 100 - f.criticality.criticalityScore;
        return currentStability > bestStability ? f : best;
      }).id,
      growth: futures.reduce((best, f) => (f.path.scores?.growthScore || 50) > (best.path.scores?.growthScore || 50) ? f : best).id,
      flexibility: futures.reduce((best, f) => f.optionality.overallScore > best.optionality.overallScore ? f : best).id,
      lowRegret: futures.reduce((best, f) => {
        const bestPathAnalysis = best.regret?.pathAnalyses.get(best.path.id);
        const currentPathAnalysis = f.regret?.pathAnalyses.get(f.path.id);
        const bestRegret = bestPathAnalysis?.aggregate?.weightedRegretScore || best.regret?.overallProfile?.averageRegret || 50;
        const currentRegret = currentPathAnalysis?.aggregate?.weightedRegretScore || f.regret?.overallProfile?.averageRegret || 50;
        return currentRegret < bestRegret ? f : best;
      }).id,
      optionality: futures.reduce((best, f) => f.optionality.overallScore > best.optionality.overallScore ? f : best).id,
    };

    return {
      id,
      futures,
      futureCount: futures.length,
      dimensions,
      rankings,
      tradeoffs,
      winners,
      generatedAt: Date.now(),
    };
  }

  /**
   * Generate trade-offs between futures
   */
  private generateTradeoffs(futures: FutureContext[]): FutureTradeoff[] {
    const tradeoffs: FutureTradeoff[] = [];

    // Compare each pair of futures
    for (let i = 0; i < futures.length; i++) {
      for (let j = i + 1; j < futures.length; j++) {
        const futureA = futures[i];
        const futureB = futures[j];

        // Income trade-off
        if (futureA.path.metrics.incomeRange.senior > futureB.path.metrics.incomeRange.senior) {
          tradeoffs.push({
            id: `tradeoff-income-${futureA.id}-${futureB.id}`,
            gain: {
              futureId: futureA.id,
              description: `Higher income potential (₹${(futureA.path.metrics.incomeRange.senior / 100000).toFixed(1)}L vs ₹${(futureB.path.metrics.incomeRange.senior / 100000).toFixed(1)}L)`,
              value: futureA.path.metrics.incomeRange.senior - futureB.path.metrics.incomeRange.senior,
            },
            giveUp: {
              futureId: futureB.id,
              description: 'Lower income ceiling',
              value: futureA.path.metrics.incomeRange.senior - futureB.path.metrics.incomeRange.senior,
            },
            importance: 80,
            isReversible: false,
          });
        }

        // Optionality trade-off
        if (futureA.optionality.overallScore > futureB.optionality.overallScore) {
          tradeoffs.push({
            id: `tradeoff-optionality-${futureA.id}-${futureB.id}`,
            gain: {
              futureId: futureA.id,
              description: `More career flexibility (${futureA.optionality.overallScore} vs ${futureB.optionality.overallScore})`,
              value: futureA.optionality.overallScore - futureB.optionality.overallScore,
            },
            giveUp: {
              futureId: futureB.id,
              description: 'More specialized path',
              value: futureA.optionality.overallScore - futureB.optionality.overallScore,
            },
            importance: 70,
            isReversible: true,
          });
        }
      }
    }

    return tradeoffs;
  }

  /**
   * Compare paths across futures
   */
  comparePaths(paths: ExploredCareerPath[]): PathComparisonAcrossFutures {
    const id = `path-comparison-${Date.now()}`;

    // Compare metrics
    const metrics: PathComparisonMetric[] = [
      {
        name: 'Total Years',
        key: 'totalYears',
        values: paths.map(p => ({
          pathId: p.id,
          pathName: p.name,
          value: p.metrics.totalYears,
          unit: 'years',
        })),
        bestPathId: paths.reduce((best, p) => p.metrics.totalYears < best.metrics.totalYears ? p : best).id,
      },
      {
        name: 'Senior Income',
        key: 'seniorIncome',
        values: paths.map(p => ({
          pathId: p.id,
          pathName: p.name,
          value: p.metrics.incomeRange.senior,
          unit: 'INR',
        })),
        bestPathId: paths.reduce((best, p) => p.metrics.incomeRange.senior > best.metrics.incomeRange.senior ? p : best).id,
      },
      {
        name: 'Success Probability',
        key: 'successProbability',
        values: paths.map(p => ({
          pathId: p.id,
          pathName: p.name,
          value: Math.round(p.metrics.cumulativeSuccessProbability * 100),
          unit: '%',
        })),
        bestPathId: paths.reduce((best, p) => p.metrics.cumulativeSuccessProbability > best.metrics.cumulativeSuccessProbability ? p : best).id,
      },
    ];

    // Calculate similarities
    const similarities: PathSimilarity[] = [];
    for (let i = 0; i < paths.length; i++) {
      for (let j = i + 1; j < paths.length; j++) {
        const pathA = paths[i];
        const pathB = paths[j];

        // Calculate similarity based on shared nodes
        const commonNodes = pathA.nodeIds.filter(id => pathB.nodeIds.includes(id));
        const similarityScore = Math.round((commonNodes.length / Math.max(pathA.nodeIds.length, pathB.nodeIds.length)) * 100);

        similarities.push({
          pathAId: pathA.id,
          pathAName: pathA.name,
          pathBId: pathB.id,
          pathBName: pathB.name,
          similarityScore,
          commonElements: commonNodes,
          sharedMilestones: [],
          sharedSkills: [],
        });
      }
    }

    // Calculate differences
    const differences: PathDifference[] = [];
    for (let i = 0; i < paths.length; i++) {
      for (let j = i + 1; j < paths.length; j++) {
        const pathA = paths[i];
        const pathB = paths[j];

        // Duration difference
        const durationDiff = Math.abs(pathA.metrics.totalYears - pathB.metrics.totalYears);
        if (durationDiff > 0) {
          differences.push({
            pathAId: pathA.id,
            pathBId: pathB.id,
            type: 'duration',
            magnitude: durationDiff,
            description: `${durationDiff} year difference in total path duration`,
            impact: durationDiff > 3 ? 'major' : durationDiff > 1 ? 'moderate' : 'minor',
          });
        }

        // Income difference
        const incomeDiff = Math.abs(pathA.metrics.incomeRange.senior - pathB.metrics.incomeRange.senior);
        differences.push({
          pathAId: pathA.id,
          pathBId: pathB.id,
          type: 'income',
          magnitude: incomeDiff,
          description: `₹${(incomeDiff / 100000).toFixed(1)}L difference in senior-level income`,
          impact: incomeDiff > 1000000 ? 'major' : incomeDiff > 500000 ? 'moderate' : 'minor',
        });
      }
    }

    return {
      id,
      paths,
      pathCount: paths.length,
      metrics,
      similarities,
      differences,
      convergencePoints: [],
      divergencePoints: [],
    };
  }

  /**
   * Compare scenarios across futures
   */
  compareScenarios(futures: FutureContext[]): ScenarioComparisonAcrossFutures {
    const id = `scenario-comparison-${Date.now()}`;

    // Group scenarios by type
    const scenariosByType: Record<ScenarioType, FutureScenario[]> = {
      'best-case': [],
      'expected': [],
      'conservative': [],
      'high-risk': [],
    };

    futures.forEach(future => {
      future.scenarios.forEach(scenario => {
        scenariosByType[scenario.type].push(scenario);
      });
    });

    // Cross-scenario analysis
    const crossAnalysis: CrossScenarioAnalysis[] = Object.entries(scenariosByType).map(([type, scenarios]) => {
      const typedScenarios = scenarios as FutureScenario[];
      const incomes = typedScenarios.map(s => s.metrics.peakIncome);
      const flexibilities = typedScenarios.map(s => s.metrics.averageFlexibility);

      return {
        scenarioType: type as ScenarioType,
        analysis: {
          averageIncome: incomes.reduce((a, b) => a + b, 0) / incomes.length,
          incomeRange: {
            min: Math.min(...incomes),
            max: Math.max(...incomes),
          },
          averageFlexibility: flexibilities.reduce((a, b) => a + b, 0) / flexibilities.length,
          flexibilityRange: {
            min: Math.min(...flexibilities),
            max: Math.max(...flexibilities),
          },
          mostOptimisticFutureId: typedScenarios.reduce((best, s) => s.metrics.peakIncome > best.metrics.peakIncome ? s : best).id,
          mostPessimisticFutureId: typedScenarios.reduce((worst, s) => s.metrics.peakIncome < worst.metrics.peakIncome ? s : worst).id,
        },
      };
    });

    // Outcome ranges
    const allScenarios = futures.flatMap(f => f.scenarios);
    const outcomeRanges: ScenarioOutcomeRange[] = [
      {
        metric: 'Peak Income',
        key: 'peakIncome',
        range: {
          min: Math.min(...allScenarios.map(s => s.metrics.peakIncome)),
          max: Math.max(...allScenarios.map(s => s.metrics.peakIncome)),
          average: allScenarios.reduce((sum, s) => sum + s.metrics.peakIncome, 0) / allScenarios.length,
          median: 0, // Would need proper calculation
        },
        minFutureId: allScenarios.reduce((min, s) => s.metrics.peakIncome < min.metrics.peakIncome ? s : min).id,
        maxFutureId: allScenarios.reduce((max, s) => s.metrics.peakIncome > max.metrics.peakIncome ? s : max).id,
      },
    ];

    // Extremes
    const extremes: ScenarioExtremes = {
      bestCase: {
        futureId: allScenarios.reduce((best, s) => s.metrics.peakIncome > best.metrics.peakIncome ? s : best).id,
        scenarioId: allScenarios.reduce((best, s) => s.metrics.peakIncome > best.metrics.peakIncome ? s : best).id,
        description: 'Highest possible income trajectory',
        peakIncome: Math.max(...allScenarios.map(s => s.metrics.peakIncome)),
      },
      worstCase: {
        futureId: allScenarios.reduce((worst, s) => s.metrics.peakIncome < worst.metrics.peakIncome ? s : worst).id,
        scenarioId: allScenarios.reduce((worst, s) => s.metrics.peakIncome < worst.metrics.peakIncome ? s : worst).id,
        description: 'Lowest income trajectory',
        lowestIncome: Math.min(...allScenarios.map(s => s.metrics.peakIncome)),
      },
      expectedCase: {
        futureId: allScenarios.find(s => s.type === 'expected')?.id || allScenarios[0].id,
        scenarioId: allScenarios.find(s => s.type === 'expected')?.id || allScenarios[0].id,
        description: 'Most likely outcome',
        averageIncome: allScenarios.filter(s => s.type === 'expected').reduce((sum, s) => sum + s.metrics.averageIncome, 0) / allScenarios.filter(s => s.type === 'expected').length || 0,
      },
    };

    return {
      id,
      scenariosByType,
      crossAnalysis,
      outcomeRanges,
      extremes,
    };
  }

  /**
   * Compare regrets across futures
   */
  private compareRegrets(
    futures: FutureContext[],
    regrets: Record<string, RegretAnalysis>
  ): RegretComparisonAcrossFutures {
    const id = `regret-comparison-${Date.now()}`;

    // Regret analysis for each future
    const futureRegrets: FutureRegret[] = futures.map(future => {
      const regret = regrets[future.id];
      const pathAnalysis = regret?.pathAnalyses.get(future.path.id);
      // Convert factors Map to array of regret categories
      const factorsArray = pathAnalysis?.factors ? Array.from(pathAnalysis.factors.entries()) : [];
      return {
        futureId: future.id,
        futureName: future.name,
        regretRisk: pathAnalysis?.aggregate?.weightedRegretScore || regret?.overallProfile?.averageRegret || 50,
        byCategory: factorsArray.map(([type, factor]) => ({
          category: type,
          risk: factor.score,
          description: factor.drivers.join(', ') || 'No specific drivers identified',
        })),
        drivers: pathAnalysis?.strongestRisk ? [pathAnalysis.strongestRisk.description] : [],
        mitigations: pathAnalysis?.explanation?.mitigationStrategies || [],
      };
    });

    // Comparative analysis
    const comparativeAnalysis: ComparativeRegretAnalysis = {
      lowestRegretFutureId: futureRegrets.reduce((best, f) => f.regretRisk < best.regretRisk ? f : best).futureId,
      highestRegretFutureId: futureRegrets.reduce((worst, f) => f.regretRisk > worst.regretRisk ? f : worst).futureId,
      riskSpread: Math.max(...futureRegrets.map(f => f.regretRisk)) - Math.min(...futureRegrets.map(f => f.regretRisk)),
      commonPatterns: ['Opportunity cost concerns', 'Fear of missing out on alternatives'],
      uniqueRisks: futureRegrets.map(f => ({
        futureId: f.futureId,
        risks: f.drivers.slice(0, 2),
      })),
    };

    // Minimization recommendation
    const lowestRegretFuture = futureRegrets.reduce((best, f) => f.regretRisk < best.regretRisk ? f : best);
    const minimizationRecommendation: RegretMinimizationRecommendation = {
      recommendedFutureId: lowestRegretFuture.futureId,
      confidence: Math.round(100 - lowestRegretFuture.regretRisk),
      reasoning: `${lowestRegretFuture.futureName} has the lowest predicted regret risk at ${lowestRegretFuture.regretRisk}%`,
      actions: lowestRegretFuture.mitigations.slice(0, 3),
      contingencyPlans: ['Maintain skills for alternative paths', 'Build financial buffer'],
    };

    return {
      id,
      futureRegrets,
      comparativeAnalysis,
      minimizationRecommendation,
    };
  }

  /**
   * Compare optionalities across futures
   */
  private compareOptionalities(futures: FutureContext[]): OptionalityComparisonAcrossFutures {
    const id = `optionality-comparison-${Date.now()}`;

    // Optionality for each future
    const futureOptionalities: FutureOptionality[] = futures.map(future => ({
      futureId: future.id,
      futureName: future.name,
      overallScore: future.optionality.overallScore,
      rating: future.optionality.rating,
      dimensions: Object.entries(future.optionality.dimensions).map(([key, dim]) => ({
        name: dim.name,
        score: dim.score,
        description: dim.explanation,
      })),
      adjacentCareers: future.optionality.adjacentCareers.map(a => a.name),
      pivotPotential: future.optionality.dimensions.pivotPotential?.score || 50,
      trend: 'stable', // Default trend, could be derived from future demand
    }));

    // Comparative analysis
    const sortedByOptionality = [...futureOptionalities].sort((a, b) => b.overallScore - a.overallScore);
    const comparativeAnalysis: ComparativeOptionalityAnalysis = {
      highestOptionalityFutureId: sortedByOptionality[0].futureId,
      lowestOptionalityFutureId: sortedByOptionality[sortedByOptionality.length - 1].futureId,
      optionalitySpread: sortedByOptionality[0].overallScore - sortedByOptionality[sortedByOptionality.length - 1].overallScore,
      rankings: sortedByOptionality.map((f, index) => ({
        futureId: f.futureId,
        rank: index + 1,
        score: f.overallScore,
      })),
      commonFeatures: ['Skill transferability', 'Industry mobility'],
      uniqueAdvantages: futureOptionalities.map(f => ({
        futureId: f.futureId,
        advantages: f.dimensions.filter(d => d.score > 70).map(d => d.name),
      })),
    };

    // Preservation strategies
    const preservationStrategies: OptionalityPreservationStrategy[] = [
      {
        name: 'Continuous Learning',
        description: 'Keep skills current to maintain optionality',
        applicableFutureIds: futures.map(f => f.id),
        effectiveness: 85,
        steps: ['Pursue certifications', 'Attend workshops', 'Build side projects'],
      },
      {
        name: 'Network Building',
        description: 'Maintain connections across industries',
        applicableFutureIds: futures.map(f => f.id),
        effectiveness: 75,
        steps: ['Attend industry events', 'Join professional groups', 'Mentor others'],
      },
    ];

    return {
      id,
      futureOptionalities,
      comparativeAnalysis,
      preservationStrategies,
    };
  }

  /**
   * Generate comprehensive explanation
   */
  private generateExplanation(
    futures: FutureContext[],
    futureComparison: FutureComparison,
    pathComparison: PathComparisonAcrossFutures,
    scenarioComparison: ScenarioComparisonAcrossFutures,
    regretComparison: RegretComparisonAcrossFutures,
    optionalityComparison: OptionalityComparisonAcrossFutures
  ): FutureExplorerExplanation {
    const futureNames = futures.map(f => f.name).join(', ');

    // Executive summary
    const executiveSummary = `Explored ${futures.length} possible futures: ${futureNames}. ` +
      `The ${futures.find(f => f.id === futureComparison.winners.overall)?.name} offers the best overall balance. ` +
      `Income ranges from ₹${(scenarioComparison.extremes.worstCase.lowestIncome / 100000).toFixed(1)}L to ₹${(scenarioComparison.extremes.bestCase.peakIncome / 100000).toFixed(1)}L. ` +
      `Optionality varies by ${optionalityComparison.comparativeAnalysis.optionalitySpread} points across futures.`;

    // Detailed narrative
    const narrative = `This analysis compares ${futures.length} distinct career futures across multiple dimensions. ` +
      futures.map(f => {
        const rank = futureComparison.rankings[0].rankedFutureIds.indexOf(f.id) + 1;
        return `${f.name} ranks #${rank} in overall attractiveness with a score of ${f.attractivenessScore}/100. ` +
          `It offers ${f.optionality.rating} optionality (${f.optionality.overallScore}/100) and ` +
          `${f.criticality.category} criticality (${f.criticality.criticalityScore}/100).`;
      }).join(' ');

    // Key insights
    const keyInsights = [
      `${futures.find(f => f.id === futureComparison.winners.income)?.name} offers the highest income potential`,
      `${futures.find(f => f.id === futureComparison.winners.flexibility)?.name} provides the most career flexibility`,
      `Regret risk varies by ${regretComparison.comparativeAnalysis.riskSpread}% across futures`,
      `Scenario outcomes range from ₹${(scenarioComparison.extremes.worstCase.lowestIncome / 100000).toFixed(1)}L to ₹${(scenarioComparison.extremes.bestCase.peakIncome / 100000).toFixed(1)}L`,
    ];

    // Trade-off summary
    const tradeOffSummary = futureComparison.tradeoffs.length > 0
      ? `Key trade-offs identified: ${futureComparison.tradeoffs.length} significant differences between futures. ` +
        `Primary trade-off: ${futureComparison.tradeoffs[0].gain.description} vs ${futureComparison.tradeoffs[0].giveUp.description}.`
      : 'No major trade-offs identified between futures.';

    // Decision framework
    const decisionFramework: FutureDecisionFramework = {
      chooseIf: {},
      avoidIf: {},
      dealBreakers: {},
    };

    futures.forEach(future => {
      decisionFramework.chooseIf[future.id] = [
        `You value ${future.characteristics.find(c => c.isStrength)?.type || 'growth'}`,
        `${future.optionality.rating} optionality aligns with your goals`,
      ];
      decisionFramework.avoidIf[future.id] = [
        `You need guaranteed stability (criticality: ${future.criticality.category})`,
        `You want to keep all options open`,
      ];
      decisionFramework.dealBreakers[future.id] = [
        `Cannot accept ${future.criticality.category} path constraints`,
      ];
    });

    // Questions to consider
    const questionsToConsider = [
      'Which future aligns best with your values?',
      'How important is income vs flexibility to you?',
      'What is your risk tolerance for regret?',
      'Do you prefer specialization or keeping options open?',
      'How much does timeline matter to you?',
    ];

    return {
      executiveSummary,
      narrative,
      keyInsights,
      tradeOffSummary,
      decisionFramework,
      questionsToConsider,
    };
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    futures: FutureContext[],
    futureComparison: FutureComparison,
    studentValues?: FutureExplorerInput['studentValues']
  ): FutureExplorerRecommendation[] {
    const recommendations: FutureExplorerRecommendation[] = [];

    // Primary recommendation
    const bestFuture = futures.find(f => f.id === futureComparison.winners.overall);
    if (bestFuture) {
      recommendations.push({
        id: `rec-primary-${bestFuture.id}`,
        type: 'primary',
        futureId: bestFuture.id,
        futureName: bestFuture.name,
        confidence: bestFuture.attractivenessScore,
        reasoning: `Best overall balance of income, stability, growth, and flexibility`,
        benefits: bestFuture.characteristics.filter(c => c.isStrength).map(c => c.description),
        risks: [`${bestFuture.criticality.category} path constraints`, 'Opportunity cost of alternatives'],
        nextSteps: ['Research specific entry requirements', 'Connect with professionals in this field'],
      });
    }

    // Alternative recommendations
    const alternatives = futures
      .filter(f => f.id !== futureComparison.winners.overall)
      .sort((a, b) => b.attractivenessScore - a.attractivenessScore)
      .slice(0, 2);

    alternatives.forEach((future, index) => {
      recommendations.push({
        id: `rec-alt-${future.id}`,
        type: 'alternative',
        futureId: future.id,
        futureName: future.name,
        confidence: Math.round(future.attractivenessScore * 0.8),
        reasoning: `Strong alternative with different trade-offs`,
        benefits: future.characteristics.filter(c => c.isStrength).slice(0, 2).map(c => c.description),
        risks: [`Lower overall attractiveness score: ${future.attractivenessScore}`],
        nextSteps: ['Consider as backup option', 'Evaluate specific advantages'],
      });
    });

    return recommendations;
  }

  /**
   * Compare specific futures (quick comparison)
   */
  compareSpecificFutures(futureIds: string[], futures: FutureContext[]): FutureComparison {
    const selectedFutures = futures.filter(f => futureIds.includes(f.id));
    return this.compareFutures(selectedFutures);
  }

  /**
   * Get future by ID
   */
  getFutureById(id: string, futures: FutureContext[]): FutureContext | undefined {
    return futures.find(f => f.id === id);
  }

  /**
   * Rank futures by criterion
   */
  rankFuturesBy(
    criterion: 'attractiveness' | 'optionality' | 'flexibility' | 'income' | 'stability',
    futures: FutureContext[]
  ): FutureContext[] {
    const sorted = [...futures];

    switch (criterion) {
      case 'attractiveness':
        return sorted.sort((a, b) => b.attractivenessScore - a.attractivenessScore);
      case 'optionality':
        return sorted.sort((a, b) => b.optionality.overallScore - a.optionality.overallScore);
      case 'flexibility':
        return sorted.sort((a, b) => (100 - b.criticality.criticalityScore) - (100 - a.criticality.criticalityScore));
      case 'income':
        return sorted.sort((a, b) => b.path.metrics.incomeRange.senior - a.path.metrics.incomeRange.senior);
      case 'stability':
        return sorted.sort((a, b) => (b.path.scores?.stabilityScore || 50) - (a.path.scores?.stabilityScore || 50));
      default:
        return sorted;
    }
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a new Future Explorer instance
 */
export function createFutureExplorer(config?: Partial<FutureExplorerConfig>): FutureExplorerV1 {
  return new FutureExplorerV1(config);
}

/**
 * Explore futures from input data
 */
export function exploreFutures(input: FutureExplorerInput): FutureExplorerResult {
  const explorer = new FutureExplorerV1();
  return explorer.explore(input);
}

/**
 * Quick comparison of multiple paths
 */
export function quickPathComparison(paths: ExploredCareerPath[]): PathComparisonAcrossFutures {
  const explorer = new FutureExplorerV1();
  return explorer.comparePaths(paths);
}

/**
 * Compare scenarios across futures
 */
export function compareScenariosAcrossFutures(futures: FutureContext[]): ScenarioComparisonAcrossFutures {
  const explorer = new FutureExplorerV1();
  return explorer.compareScenarios(futures);
}


