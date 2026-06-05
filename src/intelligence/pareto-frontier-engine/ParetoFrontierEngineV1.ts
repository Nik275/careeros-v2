/**
 * CareerOS Pareto Frontier Engine V1
 *
 * Identifies non-dominated career futures - all efficient tradeoff paths.
 * CareerOS does not assume a single best path; instead it identifies efficient alternatives.
 *
 * Features:
 * - Pareto frontier computation (non-dominated paths)
 * - Comprehensive tradeoff analysis
 * - Life strategy classification
 * - Explainable frontier reasoning
 *
 * @module intelligence/pareto-frontier-engine
 * @version 1.0.0
 */

import type { UtilityAttributeId } from '../maut-foundation/MAUTFoundationV1.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Pareto frontier identifier
 */
export type ParetoFrontierId = string;

/**
 * Life strategy archetype
 */
export type LifeStrategyType =
  | 'wealth-maximizer'
  | 'freedom-maximizer'
  | 'impact-maximizer'
  | 'stability-maximizer'
  | 'growth-maximizer'
  | 'optionality-maximizer'
  | 'balanced'
  | 'specialized';

/**
 * Candidate path for Pareto analysis
 */
export interface ParetoCandidate {
  /** Path identifier */
  pathId: string;

  /** Path name */
  pathName: string;

  /** Career identifier */
  careerId: string;

  /** Multi-dimensional scores (0-100, higher is better) */
  scores: {
    /** Overall utility score */
    utility: number;

    /** Future optionality */
    optionality: number;

    /** Regret risk (inverted - higher = less regret) */
    regret: number;

    /** Coalition alignment */
    coalition: number;

    /** Stability/predictability */
    stability: number;

    /** Income potential */
    income: number;

    /** Social impact */
    impact: number;

    /** Freedom/autonomy */
    freedom: number;

    /** Growth potential */
    growth: number;

    /** Work-life balance */
    workLife: number;
  };

  /** Individual attribute scores */
  attributes: Record<UtilityAttributeId, number>;

  /** Confidence in scores */
  confidence: number;

  /** Strategy classification */
  strategy?: LifeStrategyType;

  /** Domination status */
  dominationStatus: {
    /** True if this path is dominated by another */
    isDominated: boolean;

    /** Paths that dominate this one (if any) */
    dominatedBy: string[];

    /** Paths this one dominates (if any) */
    dominates: string[];
  };
}

/**
 * Complete Pareto frontier result
 */
export interface ParetoFrontierResult {
  /** Analysis identifier */
  id: ParetoFrontierId;

  /** Timestamp */
  timestamp: number;

  /** Student identifier */
  studentId: string;

  /** Paths on the Pareto frontier (non-dominated) */
  frontierPaths: ParetoCandidate[];

  /** Paths dominated by at least one frontier path */
  dominatedPaths: ParetoCandidate[];

  /** Number of objectives used in analysis */
  objectiveCount: number;

  /** Objectives/dimensions analyzed */
  objectives: string[];

  /** Frontier statistics */
  statistics: {
    /** Total paths evaluated */
    totalPaths: number;

    /** Paths on frontier */
    frontierSize: number;

    /** Percentage on frontier */
    frontierPercentage: number;

    /** Average frontier path quality */
    averageFrontierScore: number;

    /** Frontier coverage by strategy */
    strategyDistribution: Record<LifeStrategyType, number>;
  };

  /** Tradeoff analysis */
  tradeoffs: TradeoffAnalysis;

  /** Strategy classifications */
  strategies: Record<string, LifeStrategyClassification>;

  /** Explanations */
  explanations: FrontierExplanations;

  /** Decision guidance */
  guidance: FrontierGuidance;
}

/**
 * Life strategy classification for a path
 */
export interface LifeStrategyClassification {
  /** Primary strategy */
  primary: LifeStrategyType;

  /** Secondary strategy (if applicable) */
  secondary?: LifeStrategyType;

  /** Confidence in classification */
  confidence: number;

  /** Why this classification */
  reasoning: string[];

  /** Dominant attributes for this strategy */
  dominantAttributes: UtilityAttributeId[];

  /** Attribute profile signature */
  signature: Record<string, number>;
}

/**
 * Tradeoff between two frontier paths
 */
export interface PathTradeoff {
  /** Tradeoff identifier */
  id: string;

  /** First path */
  pathA: {
    id: string;
    name: string;
  };

  /** Second path */
  pathB: {
    id: string;
    name: string;
  };

  /** Dimensions where path A is better */
  advantagesA: TradeoffDimension[];

  /** Dimensions where path B is better */
  advantagesB: TradeoffDimension[];

  /** Magnitude of tradeoff (0-100) */
  magnitude: number;

  /** Whether this is a fundamental tradeoff */
  isFundamental: boolean;

  /** Human-readable summary */
  summary: string;

  /** Who might prefer path A */
  preferAIf: string[];

  /** Who might prefer path B */
  preferBIf: string[];
}

/**
 * Single dimension tradeoff
 */
export interface TradeoffDimension {
  /** Dimension/objective name */
  dimension: string;

  /** Score for path A */
  scoreA: number;

  /** Score for path B */
  scoreB: number;

  /** Difference (A - B) */
  difference: number;

  /** Significance level */
  significance: 'minor' | 'moderate' | 'significant' | 'critical';
}

/**
 * Complete tradeoff analysis
 */
export interface TradeoffAnalysis {
  /** All pairwise tradeoffs on frontier */
  tradeoffs: PathTradeoff[];

  /** Key/fundamental tradeoffs */
  fundamentalTradeoffs: PathTradeoff[];

  /** Most divergent dimensions */
  divergentDimensions: Array<{
    dimension: string;
    variance: number;
    range: { min: number; max: number };
  }>;

  /** Pareto frontier description */
  frontierDescription: string;

  /** Tradeoff matrix (path x path x dimension) */
  tradeoffMatrix: Record<string, Record<string, Record<string, number>>>;
}

/**
 * Frontier explanations
 */
export interface FrontierExplanations {
  /** Why each path is on the frontier */
  pathExplanations: Record<string, string>;

  /** Why dominated paths are dominated */
  dominationExplanations: Record<string, string>;

  /** Overall frontier explanation */
  frontierOverview: string;

  /** Key insights */
  insights: string[];
}

/**
 * Decision guidance from frontier
 */
export interface FrontierGuidance {
  /** Recommended consideration set */
  considerationSet: string[];

  /** Paths to eliminate (dominated) */
  eliminatedPaths: string[];

  /** Recommended strategy types */
  recommendedStrategies: LifeStrategyType[];

  /** Decision approach based on frontier shape */
  decisionApproach: 'clear-winner' | 'tradeoff-choice' | 'portfolio-approach' | 'explore-more';

  /** Next steps */
  nextSteps: string[];
}

/**
 * Pareto frontier configuration
 */
export interface ParetoFrontierConfig {
  /** Objectives to consider in Pareto analysis */
  objectives: string[];

  /** Minimum score threshold for inclusion */
  minimumScoreThreshold: number;

  /** Whether to use strict domination (>) or weak (>=) */
  strictDomination: boolean;

  /** Minimum difference to consider significant */
  significanceThreshold: number;

  /** Maximum frontier size (for performance) */
  maxFrontierSize: number;

  /** Whether to classify strategies */
  enableStrategyClassification: boolean;

  /** Whether to generate explanations */
  enableExplanations: boolean;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_PARETO_CONFIG: ParetoFrontierConfig = {
  objectives: [
    'utility',
    'optionality',
    'regret',
    'coalition',
    'stability',
    'income',
    'impact',
    'freedom',
    'growth',
    'workLife',
  ],
  minimumScoreThreshold: 30,
  strictDomination: true,
  significanceThreshold: 10,
  maxFrontierSize: 20,
  enableStrategyClassification: true,
  enableExplanations: true,
};

// ============================================================================
// DOMINATION FUNCTIONS
// ============================================================================

/**
 * Check if path A dominates path B
 *
 * Path A dominates Path B if:
 * - A >= B on every objective
 * - A > B on at least one objective
 */
export function isDominated(
  candidate: ParetoCandidate,
  other: ParetoCandidate,
  objectives: string[],
  strict: boolean = true
): boolean {
  let strictlyBetter = false;

  for (const obj of objectives) {
    const scoreA = candidate.scores[obj as keyof typeof candidate.scores] ?? 0;
    const scoreB = other.scores[obj as keyof typeof other.scores] ?? 0;

    if (scoreB > scoreA) {
      // Other is better on this objective - candidate not dominated
      return false;
    }

    if (scoreB < scoreA) {
      // Other is worse on this objective
      strictlyBetter = true;
    }
  }

  // If strict mode, other must be strictly better on at least one
  // If not strict mode, equal on all is acceptable
  return strict ? strictlyBetter : true;
}

/**
 * Compute Pareto frontier - all non-dominated paths
 */
export function computeParetoFrontier(
  candidates: ParetoCandidate[],
  config: ParetoFrontierConfig = DEFAULT_PARETO_CONFIG
): {
  frontier: ParetoCandidate[];
  dominated: ParetoCandidate[];
  dominationMap: Map<string, { dominatedBy: string[]; dominates: string[] }>;
} {
  // Filter by minimum threshold
  const filtered = candidates.filter(
    c => Object.values(c.scores).some(s => s >= config.minimumScoreThreshold)
  );

  const frontier: ParetoCandidate[] = [];
  const dominated: ParetoCandidate[] = [];
  const dominationMap = new Map<string, { dominatedBy: string[]; dominates: string[] }>();

  // Initialize domination map
  for (const candidate of filtered) {
    dominationMap.set(candidate.pathId, { dominatedBy: [], dominates: [] });
  }

  // Check each pair
  for (let i = 0; i < filtered.length; i++) {
    const candidate = filtered[i];
    let isDominatedByAny = false;

    for (let j = 0; j < filtered.length; j++) {
      if (i === j) continue;

      const other = filtered[j];

      // Check if other dominates candidate
      if (isDominated(candidate, other, config.objectives, config.strictDomination)) {
        isDominatedByAny = true;
        const map = dominationMap.get(candidate.pathId)!;
        map.dominatedBy.push(other.pathId);

        const otherMap = dominationMap.get(other.pathId)!;
        otherMap.dominates.push(candidate.pathId);
      }
    }

    if (isDominatedByAny) {
      dominated.push(candidate);
    } else {
      frontier.push(candidate);
    }
  }

  // Update domination status on candidates
  for (const candidate of [...frontier, ...dominated]) {
    const map = dominationMap.get(candidate.pathId)!;
    candidate.dominationStatus = {
      isDominated: map.dominatedBy.length > 0,
      dominatedBy: map.dominatedBy,
      dominates: map.dominates,
    };
  }

  // Sort frontier by overall utility (descending)
  frontier.sort((a, b) => b.scores.utility - a.scores.utility);

  // Limit frontier size if needed
  const finalFrontier = frontier.slice(0, config.maxFrontierSize);
  const additionalDominated = frontier.slice(config.maxFrontierSize);

  return {
    frontier: finalFrontier,
    dominated: [...dominated, ...additionalDominated],
    dominationMap,
  };
}

// ============================================================================
// TRADEOFF ANALYZER
// ============================================================================

/**
 * Analyze tradeoffs between frontier paths
 */
export function analyzeTradeoffs(
  frontier: ParetoCandidate[],
  config: ParetoFrontierConfig = DEFAULT_PARETO_CONFIG
): TradeoffAnalysis {
  const tradeoffs: PathTradeoff[] = [];
  const tradeoffMatrix: TradeoffAnalysis['tradeoffMatrix'] = {};

  // Build tradeoff matrix
  for (const pathA of frontier) {
    tradeoffMatrix[pathA.pathId] = {};

    for (const pathB of frontier) {
      if (pathA.pathId === pathB.pathId) continue;

      tradeoffMatrix[pathA.pathId][pathB.pathId] = {};

      for (const obj of config.objectives) {
        const scoreA = pathA.scores[obj as keyof typeof pathA.scores] ?? 0;
        const scoreB = pathB.scores[obj as keyof typeof pathB.scores] ?? 0;
        tradeoffMatrix[pathA.pathId][pathB.pathId][obj] = scoreA - scoreB;
      }
    }
  }

  // Generate pairwise tradeoffs
  for (let i = 0; i < frontier.length; i++) {
    for (let j = i + 1; j < frontier.length; j++) {
      const pathA = frontier[i];
      const pathB = frontier[j];

      const advantagesA: TradeoffDimension[] = [];
      const advantagesB: TradeoffDimension[] = [];

      for (const obj of config.objectives) {
        const scoreA = pathA.scores[obj as keyof typeof pathA.scores] ?? 0;
        const scoreB = pathB.scores[obj as keyof typeof pathB.scores] ?? 0;
        const diff = scoreA - scoreB;

        if (Math.abs(diff) >= config.significanceThreshold) {
          const dimension: TradeoffDimension = {
            dimension: obj,
            scoreA,
            scoreB,
            difference: diff,
            significance: Math.abs(diff) > 30 ? 'critical' :
              Math.abs(diff) > 20 ? 'significant' :
                Math.abs(diff) > 15 ? 'moderate' : 'minor',
          };

          if (diff > 0) {
            advantagesA.push(dimension);
          } else {
            advantagesB.push(dimension);
          }
        }
      }

      // Only add tradeoff if there are actual differences
      if (advantagesA.length > 0 || advantagesB.length > 0) {
        const magnitude = [...advantagesA, ...advantagesB].reduce(
          (sum, d) => sum + Math.abs(d.difference), 0
        );

        tradeoffs.push({
          id: `tradeoff-${pathA.pathId}-${pathB.pathId}`,
          pathA: { id: pathA.pathId, name: pathA.pathName },
          pathB: { id: pathB.pathId, name: pathB.pathName },
          advantagesA,
          advantagesB,
          magnitude: Math.round(magnitude),
          isFundamental: advantagesA.length > 0 && advantagesB.length > 0 && magnitude > 50,
          summary: generateTradeoffSummary(pathA, pathB, advantagesA, advantagesB),
          preferAIf: generatePreferenceReasons(advantagesA),
          preferBIf: generatePreferenceReasons(advantagesB),
        });
      }
    }
  }

  // Sort by magnitude
  tradeoffs.sort((a, b) => b.magnitude - a.magnitude);

  // Identify fundamental tradeoffs (bidirectional)
  const fundamentalTradeoffs = tradeoffs.filter(t => t.isFundamental);

  // Calculate divergent dimensions
  const dimensionStats: Record<string, { scores: number[]; variance: number }> = {};
  for (const obj of config.objectives) {
    const scores = frontier.map(p => p.scores[obj as keyof typeof p.scores] ?? 0);
    const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / scores.length;
    dimensionStats[obj] = { scores, variance };
  }

  const divergentDimensions = Object.entries(dimensionStats)
    .map(([dim, stats]) => ({
      dimension: dim,
      variance: Math.round(stats.variance),
      range: {
        min: Math.min(...stats.scores),
        max: Math.max(...stats.scores),
      },
    }))
    .sort((a, b) => b.variance - a.variance);

  // Generate frontier description
  const frontierDescription = generateFrontierDescription(frontier, tradeoffs);

  return {
    tradeoffs,
    fundamentalTradeoffs,
    divergentDimensions,
    frontierDescription,
    tradeoffMatrix,
  };
}

function generateTradeoffSummary(
  pathA: ParetoCandidate,
  pathB: ParetoCandidate,
  advantagesA: TradeoffDimension[],
  advantagesB: TradeoffDimension[]
): string {
  const aDims = advantagesA.slice(0, 2).map(d => d.dimension).join(', ');
  const bDims = advantagesB.slice(0, 2).map(d => d.dimension).join(', ');

  if (advantagesA.length > 0 && advantagesB.length > 0) {
    return `${pathA.pathName} offers better ${aDims}, while ${pathB.pathName} provides superior ${bDims}.`;
  } else if (advantagesA.length > 0) {
    return `${pathA.pathName} dominates ${pathB.pathName} in ${aDims}.`;
  } else {
    return `${pathB.pathName} dominates ${pathA.pathName} in ${bDims}.`;
  }
}

function generatePreferenceReasons(advantages: TradeoffDimension[]): string[] {
  const reasons: string[] = [];

  for (const adv of advantages.slice(0, 3)) {
    const reasonMap: Record<string, string> = {
      income: 'Earning potential is your top priority',
      freedom: 'You value autonomy and control',
      impact: 'Making a difference matters to you',
      stability: 'Security and predictability are important',
      growth: 'Continuous learning drives you',
      optionality: 'You want to keep options open',
      workLife: 'Balance between work and life is crucial',
      coalition: 'Family approval matters',
      regret: 'You want to minimize future regret',
      utility: 'Overall fit is most important',
    };

    const reason = reasonMap[adv.dimension];
    if (reason) reasons.push(reason);
  }

  return reasons;
}

function generateFrontierDescription(
  frontier: ParetoCandidate[],
  tradeoffs: PathTradeoff[]
): string {
  if (frontier.length === 0) {
    return 'No paths meet the minimum criteria.';
  }

  if (frontier.length === 1) {
    return `${frontier[0].pathName} is the only non-dominated path.`;
  }

  const topPaths = frontier.slice(0, 3).map(p => p.pathName);
  const description = `The Pareto frontier contains ${frontier.length} efficient paths: ${topPaths.join(', ')}${frontier.length > 3 ? ', and others' : ''}. `;

  const fundamentalCount = tradeoffs.filter(t => t.isFundamental).length;
  if (fundamentalCount > 0) {
    return description + `There are ${fundamentalCount} fundamental tradeoffs to consider.`;
  }

  return description + 'Most paths dominate in specific dimensions.';
}

// ============================================================================
// LIFE STRATEGY CLASSIFIER
// ============================================================================

/**
 * Classify paths into life strategy types
 */
export function classifyLifeStrategy(
  candidate: ParetoCandidate,
  config: ParetoFrontierConfig = DEFAULT_PARETO_CONFIG
): LifeStrategyClassification {
  const scores = candidate.scores;
  const attributes = candidate.attributes;

  // Define strategy signatures (what each strategy prioritizes)
  const strategySignatures: Record<LifeStrategyType, string[]> = {
    'wealth-maximizer': ['income', 'wealthPotential'],
    'freedom-maximizer': ['freedom', 'workLifeBalance', 'geographicFlexibility'],
    'impact-maximizer': ['socialImpact', 'meaning'],
    'stability-maximizer': ['stability', 'security'],
    'growth-maximizer': ['growth', 'mastery', 'curiosity'],
    'optionality-maximizer': ['optionality'],
    'balanced': [], // All relatively equal
    'specialized': [], // One dimension extremely high
  };

  // Calculate strategy fit scores
  const strategyScores: Record<LifeStrategyType, number> = {
    'wealth-maximizer': (scores.income + (attributes.wealthPotential ?? 50)) / 2,
    'freedom-maximizer': (scores.freedom + (attributes.workLifeBalance ?? 50) + (attributes.geographicFlexibility ?? 50)) / 3,
    'impact-maximizer': (scores.impact + (attributes.meaning ?? 50)) / 2,
    'stability-maximizer': (scores.stability + (attributes.resilience ?? 50)) / 2,
    'growth-maximizer': (scores.growth + (attributes.mastery ?? 50) + (attributes.curiosity ?? 50)) / 3,
    'optionality-maximizer': scores.optionality,
    'balanced': 0, // Calculated separately
    'specialized': 0, // Calculated separately
  };

  // Check for balanced (low variance across objectives)
  const objectiveScores = Object.values(scores);
  const avg = objectiveScores.reduce((sum, s) => sum + s, 0) / objectiveScores.length;
  const variance = objectiveScores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / objectiveScores.length;

  if (variance < 200) { // Low variance = balanced
    strategyScores['balanced'] = 100 - variance / 10;
  }

  // Check for specialized (one dimension extremely high)
  const maxScore = Math.max(...objectiveScores);
  if (maxScore > 90) {
    strategyScores['specialized'] = maxScore;
  }

  // Find primary strategy
  let primary: LifeStrategyType = 'balanced';
  let maxStrategyScore = 0;

  for (const [strategy, score] of Object.entries(strategyScores)) {
    if (score > maxStrategyScore) {
      maxStrategyScore = score;
      primary = strategy as LifeStrategyType;
    }
  }

  // Find secondary strategy (if close to primary)
  let secondary: LifeStrategyType | undefined;
  for (const [strategy, score] of Object.entries(strategyScores)) {
    if (strategy !== primary && score > maxStrategyScore * 0.85 && score > 60) {
      secondary = strategy as LifeStrategyType;
      break;
    }
  }

  // Generate reasoning
  const reasoning: string[] = [];
  const signatureAttrs = strategySignatures[primary];

  if (signatureAttrs.length > 0) {
    const topAttr = signatureAttrs[0];
    const score = attributes[topAttr as UtilityAttributeId] ?? scores[topAttr as keyof typeof scores] ?? 0;
    reasoning.push(`High ${topAttr} score of ${Math.round(score)} indicates ${primary.replace('-', ' ')} focus.`);
  }

  if (primary === 'balanced') {
    reasoning.push('Relatively even scores across all dimensions suggest balanced approach.');
  }

  if (primary === 'specialized') {
    reasoning.push(`Exceptional performance in one area (${Math.round(maxScore)}) indicates specialization.`);
  }

  // Get dominant attributes for this strategy
  const dominantAttributes = signatureAttrs
    .filter(a => (attributes[a as UtilityAttributeId] ?? 0) > 70)
    .map(a => a as UtilityAttributeId);

  return {
    primary,
    secondary,
    confidence: Math.round(maxStrategyScore),
    reasoning,
    dominantAttributes,
    signature: Object.fromEntries(
      Object.entries(strategyScores).map(([k, v]) => [k, Math.round(v)])
    ),
  };
}

// ============================================================================
// FRONTIER EXPLANATION ENGINE
// ============================================================================

/**
 * Generate comprehensive frontier explanations
 */
export function generateFrontierExplanations(
  frontier: ParetoCandidate[],
  dominated: ParetoCandidate[],
  tradeoffs: TradeoffAnalysis,
  config: ParetoFrontierConfig = DEFAULT_PARETO_CONFIG
): FrontierExplanations {
  const pathExplanations: Record<string, string> = {};
  const dominationExplanations: Record<string, string> = {};
  const insights: string[] = [];

  // Explain why each frontier path is on the frontier
  for (const path of frontier) {
    const topDimensions = Object.entries(path.scores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([dim]) => dim);

    pathExplanations[path.pathId] = `${path.pathName} remains on the frontier due to excellent ${topDimensions.join(', ')}. No alternative path exceeds it on all dimensions simultaneously.`;
  }

  // Explain why dominated paths are dominated
  for (const path of dominated) {
    if (path.dominationStatus.dominatedBy.length > 0) {
      const dominator = frontier.find(p => p.pathId === path.dominationStatus.dominatedBy[0]);
      if (dominator) {
        dominationExplanations[path.pathId] = `${path.pathName} is dominated by ${dominator.pathName}, which performs at least as well on all objectives and better on at least one.`;
      }
    }
  }

  // Generate insights
  if (frontier.length === 1) {
    insights.push('Only one path is non-dominated, suggesting a clear optimal choice.');
  } else if (frontier.length <= 3) {
    insights.push(`Small frontier (${frontier.length} paths) suggests manageable decision complexity.`);
  } else {
    insights.push(`Large frontier (${frontier.length} paths) indicates significant tradeoffs to consider.`);
  }

  const fundamentalCount = tradeoffs.fundamentalTradeoffs.length;
  if (fundamentalCount > 0) {
    insights.push(`${fundamentalCount} fundamental tradeoffs exist - you must choose what to prioritize.`);
  }

  const topVariance = tradeoffs.divergentDimensions[0];
  if (topVariance) {
    insights.push(`${topVariance.dimension} shows the widest variation (${topVariance.range.min}-${topVariance.range.max}) across frontier paths.`);
  }

  const strategies = frontier.map(p => p.strategy);
  const uniqueStrategies = new Set(strategies).size;
  if (uniqueStrategies > 1) {
    insights.push(`${uniqueStrategies} different life strategies are represented on the frontier.`);
  }

  // Generate overview
  const frontierOverview = generateFrontierDescription(frontier, tradeoffs.tradeoffs);

  return {
    pathExplanations,
    dominationExplanations,
    frontierOverview,
    insights,
  };
}

// ============================================================================
// GUIDANCE GENERATOR
// ============================================================================

/**
 * Generate decision guidance from frontier
 */
export function generateFrontierGuidance(
  frontier: ParetoCandidate[],
  dominated: ParetoCandidate[],
  tradeoffs: TradeoffAnalysis,
  strategies: Record<string, LifeStrategyClassification>
): FrontierGuidance {
  // Consideration set: all frontier paths
  const considerationSet = frontier.map(p => p.pathId);

  // Eliminated paths: all dominated
  const eliminatedPaths = dominated.map(p => p.pathId);

  // Recommended strategies: those present on frontier
  const strategyCounts: Record<string, number> = {};
  for (const path of frontier) {
    const strategy = path.strategy || 'balanced';
    strategyCounts[strategy] = (strategyCounts[strategy] || 0) + 1;
  }

  const recommendedStrategies = Object.entries(strategyCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([strategy]) => strategy as LifeStrategyType);

  // Determine decision approach
  let decisionApproach: FrontierGuidance['decisionApproach'];

  if (frontier.length === 1) {
    decisionApproach = 'clear-winner';
  } else if (tradeoffs.fundamentalTradeoffs.length >= 2) {
    decisionApproach = 'tradeoff-choice';
  } else if (frontier.length >= 5) {
    decisionApproach = 'portfolio-approach';
  } else {
    decisionApproach = 'explore-more';
  }

  // Generate next steps
  const nextSteps: string[] = [];

  if (decisionApproach === 'tradeoff-choice') {
    nextSteps.push('Reflect on which tradeoffs matter most to you personally');
    nextSteps.push('Discuss fundamental tradeoffs with trusted advisors');
  }

  if (decisionApproach === 'portfolio-approach') {
    nextSteps.push('Consider a portfolio approach - multiple viable paths');
    nextSteps.push('Identify common skills that transfer across frontier paths');
  }

  if (frontier.length > 1) {
    nextSteps.push('Deep-dive into top 2-3 frontier paths');
    nextSteps.push('Seek informational interviews in each path');
  }

  nextSteps.push('Revisit your utility profile - ensure it reflects true preferences');

  return {
    considerationSet,
    eliminatedPaths,
    recommendedStrategies,
    decisionApproach,
    nextSteps,
  };
}

// ============================================================================
// MAIN FRONTIER COMPUTATION
// ============================================================================

/**
 * Complete Pareto frontier analysis
 */
export function analyzeParetoFrontier(
  studentId: string,
  candidates: ParetoCandidate[],
  config: ParetoFrontierConfig = DEFAULT_PARETO_CONFIG
): ParetoFrontierResult {
  // Compute frontier
  const { frontier, dominated, dominationMap } = computeParetoFrontier(candidates, config);

  // Classify strategies
  const strategies: Record<string, LifeStrategyClassification> = {};
  if (config.enableStrategyClassification) {
    for (const path of frontier) {
      strategies[path.pathId] = classifyLifeStrategy(path, config);
      path.strategy = strategies[path.pathId].primary;
    }
  }

  // Analyze tradeoffs
  const tradeoffs = analyzeTradeoffs(frontier, config);

  // Generate explanations
  const explanations = config.enableExplanations
    ? generateFrontierExplanations(frontier, dominated, tradeoffs, config)
    : { pathExplanations: {}, dominationExplanations: {}, frontierOverview: '', insights: [] };

  // Generate guidance
  const guidance = generateFrontierGuidance(frontier, dominated, tradeoffs, strategies);

  // Calculate statistics
  const strategyDistribution: Record<LifeStrategyType, number> = {
    'wealth-maximizer': 0,
    'freedom-maximizer': 0,
    'impact-maximizer': 0,
    'stability-maximizer': 0,
    'growth-maximizer': 0,
    'optionality-maximizer': 0,
    'balanced': 0,
    'specialized': 0,
  };

  for (const path of frontier) {
    const strategy = path.strategy || 'balanced';
    strategyDistribution[strategy]++;
  }

  return {
    id: `pareto-${studentId}-${Date.now()}`,
    timestamp: Date.now(),
    studentId,
    frontierPaths: frontier,
    dominatedPaths: dominated,
    objectiveCount: config.objectives.length,
    objectives: config.objectives,
    statistics: {
      totalPaths: candidates.length,
      frontierSize: frontier.length,
      frontierPercentage: Math.round((frontier.length / candidates.length) * 100),
      averageFrontierScore: Math.round(
        frontier.reduce((sum, p) => sum + p.scores.utility, 0) / frontier.length
      ),
      strategyDistribution,
    },
    tradeoffs,
    strategies,
    explanations,
    guidance,
  };
}

// ============================================================================
// PARETO FRONTIER ENGINE CLASS
// ============================================================================

export class ParetoFrontierEngineV1 {
  private config: ParetoFrontierConfig;

  constructor(config?: Partial<ParetoFrontierConfig>) {
    this.config = { ...DEFAULT_PARETO_CONFIG, ...config };
  }

  /**
   * Analyze Pareto frontier
   */
  analyze(studentId: string, candidates: ParetoCandidate[]): ParetoFrontierResult {
    return analyzeParetoFrontier(studentId, candidates, this.config);
  }

  /**
   * Compute frontier only
   */
  computeFrontier(candidates: ParetoCandidate[]): {
    frontier: ParetoCandidate[];
    dominated: ParetoCandidate[];
  } {
    const result = computeParetoFrontier(candidates, this.config);
    return { frontier: result.frontier, dominated: result.dominated };
  }

  /**
   * Check if one path dominates another
   */
  isDominated(candidate: ParetoCandidate, other: ParetoCandidate): boolean {
    return isDominated(candidate, other, this.config.objectives, this.config.strictDomination);
  }

  /**
   * Analyze tradeoffs
   */
  analyzeTradeoffs(frontier: ParetoCandidate[]): TradeoffAnalysis {
    return analyzeTradeoffs(frontier, this.config);
  }

  /**
   * Classify life strategy
   */
  classifyStrategy(candidate: ParetoCandidate): LifeStrategyClassification {
    return classifyLifeStrategy(candidate, this.config);
  }

  /**
   * Generate explanations
   */
  explainFrontier(
    frontier: ParetoCandidate[],
    dominated: ParetoCandidate[],
    tradeoffs: TradeoffAnalysis
  ): FrontierExplanations {
    return generateFrontierExplanations(frontier, dominated, tradeoffs, this.config);
  }

  /**
   * Generate guidance
   */
  generateGuidance(
    frontier: ParetoCandidate[],
    dominated: ParetoCandidate[],
    tradeoffs: TradeoffAnalysis,
    strategies: Record<string, LifeStrategyClassification>
  ): FrontierGuidance {
    return generateFrontierGuidance(frontier, dominated, tradeoffs, strategies);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ParetoFrontierConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): ParetoFrontierConfig {
    return { ...this.config };
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createParetoFrontierEngine(
  config?: Partial<ParetoFrontierConfig>
): ParetoFrontierEngineV1 {
  return new ParetoFrontierEngineV1(config);
}


