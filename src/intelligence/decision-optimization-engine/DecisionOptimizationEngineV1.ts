/**
 * CareerOS Decision Optimization Engine V1
 *
 * Selects the highest-utility future path by integrating all intelligence layers.
 * Calculates expected utility, generates optimal decisions, finds Pareto frontiers.
 *
 * Features:
 * - Expected utility calculation with confidence
 * - Multi-criteria path optimization
 * - Pareto frontier identification
 * - Comprehensive decision explanations
 * - Tradeoff analysis
 *
 * @module intelligence/decision-optimization-engine
 * @version 1.0.0
 */

import type {
  UtilityAttributeId,
  StudentUtilityProfile,
  UtilityScore,
} from '../maut-foundation/MAUTFoundationV1.js';
import {
  calculateUtilityScore,
  generateUtilityExplanation,
  CORE_UTILITY_ATTRIBUTES,
} from '../maut-foundation/MAUTFoundationV1.js';
// Note: DecisionIntelligence types are used via DecisionOption interface
import type { CareerPathExplorerResult } from '../path-explorer/CareerPathExplorerV1.js';
import type { DecisionCoalitionAnalysis } from '../decision-coalition-v3/DecisionCoalitionEngineV3.js';
import type { RegretAnalysis } from '../regret-functional/RegretFunctionalV2.js';
import type { OptionalityAnalysis } from '../optionality-engine/OptionalityEngineV1.js';
import type { CriticalityAnalysis } from '../criticality-engine/CriticalityEngineV1.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Path identifier
 */
export type PathId = string;

/**
 * Decision option being evaluated
 */
export interface DecisionOption {
  /** Option identifier */
  id: PathId;

  /** Career or path name */
  name: string;

  /** Career ID */
  careerId: string;

  /** Path segments */
  segments: Array<{
    stage: string;
    milestone: string;
    timeframe: string;
  }>;

  /** Utility scores by attribute */
  utilityAttributes: Record<UtilityAttributeId, number>;

  /** Coalition alignment score (0-100) */
  coalitionScore: number;

  /** Regret risk score (0-100, lower is better) */
  regretRisk: number;

  /** Optionality score (0-100) */
  optionalityScore: number;

  /** Criticality score (0-100) */
  criticalityScore: number;

  /** Overall decision intelligence score (0-100) */
  decisionScore: number;

  /** Confidence in this option (0-100) */
  confidence: number;
}

/**
 * Expected utility calculation for a path
 */
export interface ExpectedUtility {
  /** Path identifier */
  pathId: PathId;

  /** Expected utility score (0-100) */
  score: number;

  /** Confidence in calculation (0-100) */
  confidence: number;

  /** Utility breakdown by category */
  breakdown: {
    financial: number;
    lifestyle: number;
    psychological: number;
    social: number;
    future: number;
  };

  /** Attribute-level contributions */
  byAttribute: Array<{
    attribute: UtilityAttributeId;
    rawScore: number;
    weightedScore: number;
    weight: number;
    contribution: number; // percentage of total
  }>;

  /** Intelligence layer contributions */
  intelligenceContributions: {
    utility: number;
    coalition: number;
    regret: number;
    optionality: number;
    criticality: number;
    decision: number;
  };

  /** Risk-adjusted score */
  riskAdjustedScore: number;

  /** Best-case scenario */
  bestCase: number;

  /** Worst-case scenario */
  worstCase: number;
}

/**
 * Optimal decision with full analysis
 */
export interface OptimalDecision {
  /** Decision identifier */
  id: string;

  /** Selected path */
  path: DecisionOption;

  /** Expected utility */
  expectedUtility: ExpectedUtility;

  /** Ranking among all options */
  rank: number;

  /** Margin over next best option */
  margin: number;

  /** Whether this is a clear winner */
  isClearWinner: boolean;

  /** Key advantages */
  advantages: string[];

  /** Key risks */
  risks: string[];
}

/**
 * Set of optimal decisions across criteria
 */
export interface OptimalDecisionSet {
  /** Analysis identifier */
  id: string;

  /** Timestamp */
  timestamp: number;

  /** Student identifier */
  studentId: string;

  /** Best overall path */
  bestOverall: OptimalDecision;

  /** Best by specific criteria */
  byCriteria: {
    bestIncome: OptimalDecision | null;
    bestFreedom: OptimalDecision | null;
    bestStability: OptimalDecision | null;
    bestImpact: OptimalDecision | null;
    bestGrowth: OptimalDecision | null;
    bestWorkLife: OptimalDecision | null;
    bestOptionality: OptimalDecision | null;
    bestCoalition: OptimalDecision | null;
    bestRegret: OptimalDecision | null;
  };

  /** All ranked options */
  rankedOptions: OptimalDecision[];

  /** Pareto frontier */
  paretoFrontier: PathId[];

  /** Tradeoff analysis */
  tradeoffs: TradeoffAnalysis;

  /** Decision explanation */
  explanation: DecisionExplanation;

  /** Confidence assessment */
  confidence: {
    overall: number;
    utility: number;
    coalition: number;
    regret: number;
    optionality: number;
    criticality: number;
  };
}

/**
 * Tradeoff between two paths
 */
export interface PathTradeoff {
  /** Better path in this dimension */
  betterPath: PathId;

  /** Worse path in this dimension */
  worsePath: PathId;

  /** Dimension of tradeoff */
  dimension: UtilityAttributeId | 'coalition' | 'regret' | 'optionality' | 'criticality';

  /** Magnitude of difference */
  difference: number;

  /** Whether this is a significant tradeoff */
  significant: boolean;
}

/**
 * Complete tradeoff analysis
 */
export interface TradeoffAnalysis {
  /** All identified tradeoffs */
  tradeoffs: PathTradeoff[];

  /** Key tradeoffs between top options */
  keyTradeoffs: PathTradeoff[];

  /** Dominant dimensions (where paths differ most) */
  dominantDimensions: Array<{
    dimension: string;
    variance: number;
  }>;

  /** Tradeoff frontier description */
  frontierDescription: string;
}

/**
 * Decision explanation
 */
export interface DecisionExplanation {
  /** Primary recommendation */
  recommendation: string;

  /** Why this path was selected */
  reasoning: string[];

  /** Key strengths */
  strengths: Array<{
    factor: string;
    description: string;
    impact: 'critical' | 'significant' | 'moderate';
  }>;

  /** Key concerns */
  concerns: Array<{
    factor: string;
    description: string;
    mitigation: string;
  }>;

  /** Comparison to alternatives */
  comparison: string;

  /** Next steps */
  nextSteps: string[];
}

/**
 * Pareto frontier point
 */
export interface ParetoPoint {
  pathId: PathId;
  coordinates: Record<string, number>;
  dominatedBy: PathId[];
  dominates: PathId[];
}

/**
 * Optimization configuration
 */
export interface OptimizationConfig {
  /** Weight for utility component (0-1) */
  utilityWeight: number;

  /** Weight for coalition alignment (0-1) */
  coalitionWeight: number;

  /** Weight for regret avoidance (0-1) */
  regretWeight: number;

  /** Weight for optionality preservation (0-1) */
  optionalityWeight: number;

  /** Weight for criticality consideration (0-1) */
  criticalityWeight: number;

  /** Weight for decision intelligence (0-1) */
  decisionWeight: number;

  /** Minimum confidence threshold */
  minConfidence: number;

  /** Risk aversion factor (0-1, higher = more risk-averse) */
  riskAversion: number;

  /** Whether to include dominated options */
  includeDominated: boolean;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_OPTIMIZATION_CONFIG: OptimizationConfig = {
  utilityWeight: 0.35,
  coalitionWeight: 0.15,
  regretWeight: 0.15,
  optionalityWeight: 0.15,
  criticalityWeight: 0.10,
  decisionWeight: 0.10,
  minConfidence: 50,
  riskAversion: 0.3,
  includeDominated: false,
};

// ============================================================================
// EXPECTED UTILITY CALCULATION
// ============================================================================

/**
 * Calculate expected utility for a decision option
 */
export function calculateExpectedUtility(
  option: DecisionOption,
  utilityProfile: StudentUtilityProfile,
  config: OptimizationConfig = DEFAULT_OPTIMIZATION_CONFIG
): ExpectedUtility {
  // Calculate base utility using MAUT
  // Build confidence record for each attribute
  const attributeConfidence: Record<UtilityAttributeId, number> = {} as Record<UtilityAttributeId, number>;
  for (const attrId of Object.keys(option.utilityAttributes) as UtilityAttributeId[]) {
    attributeConfidence[attrId] = option.confidence;
  }

  const utilityScore = calculateUtilityScore(
    utilityProfile,
    {
      careerId: option.careerId,
      pathId: option.id,
      attributes: option.utilityAttributes,
      confidence: attributeConfidence,
      dataQuality: {
        completeness: option.confidence,
        reliability: option.confidence,
        freshness: 80,
      },
    }
  );

  // Calculate category scores
  const categories = {
    financial: ['income', 'wealthPotential'] as UtilityAttributeId[],
    lifestyle: ['freedom', 'workLifeBalance', 'geographicFlexibility'] as UtilityAttributeId[],
    psychological: ['meaning', 'mastery', 'growth', 'curiosity'] as UtilityAttributeId[],
    social: ['status', 'familyApproval', 'socialImpact'] as UtilityAttributeId[],
    future: ['optionality', 'stability', 'resilience'] as UtilityAttributeId[],
  };

  const breakdown = {
    financial: calculateCategoryScore(option.utilityAttributes, categories.financial, utilityProfile),
    lifestyle: calculateCategoryScore(option.utilityAttributes, categories.lifestyle, utilityProfile),
    psychological: calculateCategoryScore(option.utilityAttributes, categories.psychological, utilityProfile),
    social: calculateCategoryScore(option.utilityAttributes, categories.social, utilityProfile),
    future: calculateCategoryScore(option.utilityAttributes, categories.future, utilityProfile),
  };

  // Calculate attribute-level contributions
  const byAttribute = Object.entries(option.utilityAttributes).map(([attrId, score]) => {
    const weight = utilityProfile.utilityWeights[attrId as UtilityAttributeId] || 0;
    const weightedScore = score * weight;
    return {
      attribute: attrId as UtilityAttributeId,
      rawScore: score,
      weightedScore,
      weight,
      contribution: 0, // Will be calculated after total
    };
  });

  const totalWeighted = byAttribute.reduce((sum, a) => sum + a.weightedScore, 0);
  byAttribute.forEach(a => {
    a.contribution = totalWeighted > 0 ? (a.weightedScore / totalWeighted) * 100 : 0;
  });

  // Calculate intelligence layer contributions
  const normalizedRegret = 100 - option.regretRisk; // Invert so higher is better
  const intelligenceContributions = {
    utility: utilityScore.overall * config.utilityWeight,
    coalition: option.coalitionScore * config.coalitionWeight,
    regret: normalizedRegret * config.regretWeight,
    optionality: option.optionalityScore * config.optionalityWeight,
    criticality: option.criticalityScore * config.criticalityWeight,
    decision: option.decisionScore * config.decisionWeight,
  };

  // Calculate composite score
  const baseScore = Object.values(intelligenceContributions).reduce((sum, v) => sum + v, 0);

  // Risk adjustment
  const confidenceFactor = option.confidence / 100;
  const riskAdjustedScore = baseScore * (1 - config.riskAversion * (1 - confidenceFactor));

  // Best/worst case scenarios
  const bestCase = Math.min(100, baseScore * (1 + (1 - config.riskAversion) * 0.2));
  const worstCase = Math.max(0, baseScore * (1 - config.riskAversion * 0.3));

  return {
    pathId: option.id,
    score: Math.round(baseScore * 10) / 10,
    confidence: option.confidence,
    breakdown,
    byAttribute: byAttribute.sort((a, b) => b.contribution - a.contribution),
    intelligenceContributions,
    riskAdjustedScore: Math.round(riskAdjustedScore * 10) / 10,
    bestCase: Math.round(bestCase * 10) / 10,
    worstCase: Math.round(worstCase * 10) / 10,
  };
}

function calculateCategoryScore(
  attributes: Record<UtilityAttributeId, number>,
  categoryAttrs: UtilityAttributeId[],
  profile: StudentUtilityProfile
): number {
  let weightedSum = 0;
  let weightSum = 0;

  for (const attrId of categoryAttrs) {
    const score = attributes[attrId] || 50;
    const weight = profile.utilityWeights[attrId] || 0.1;
    weightedSum += score * weight;
    weightSum += weight;
  }

  return weightSum > 0 ? weightedSum / weightSum : 50;
}

// ============================================================================
// PARETO FRONTIER CALCULATION
// ============================================================================

/**
 * Identify Pareto frontier (non-dominated options)
 */
export function calculateParetoFrontier(
  options: DecisionOption[],
  dimensions: string[] = ['income', 'freedom', 'stability', 'growth', 'optionality']
): PathId[] {
  const dominated = new Set<PathId>();
  const frontier: PathId[] = [];

  for (let i = 0; i < options.length; i++) {
    if (dominated.has(options[i].id)) continue;

    let isDominated = false;

    for (let j = 0; j < options.length; j++) {
      if (i === j) continue;

      if (dominates(options[j], options[i], dimensions)) {
        dominated.add(options[i].id);
        isDominated = true;
        break;
      }
    }

    if (!isDominated) {
      frontier.push(options[i].id);
    }
  }

  return frontier;
}

function dominates(
  optionA: DecisionOption,
  optionB: DecisionOption,
  dimensions: string[]
): boolean {
  let strictlyBetter = false;

  for (const dim of dimensions) {
    const scoreA = getDimensionScore(optionA, dim);
    const scoreB = getDimensionScore(optionB, dim);

    if (scoreA < scoreB) return false; // A is worse in at least one dimension
    if (scoreA > scoreB) strictlyBetter = true;
  }

  return strictlyBetter;
}

function getDimensionScore(option: DecisionOption, dimension: string): number {
  const dimMap: Record<string, number> = {
    income: option.utilityAttributes.income || 0,
    freedom: option.utilityAttributes.freedom || 0,
    stability: option.utilityAttributes.stability || 0,
    growth: option.utilityAttributes.growth || 0,
    optionality: option.optionalityScore,
    coalition: option.coalitionScore,
    regret: 100 - option.regretRisk,
    criticality: option.criticalityScore,
  };

  return dimMap[dimension] || 50;
}

// ============================================================================
// TRADEOFF ANALYSIS
// ============================================================================

/**
 * Analyze tradeoffs between options
 */
export function analyzeTradeoffs(
  options: DecisionOption[],
  topN: number = 5
): TradeoffAnalysis {
  const sorted = [...options].sort((a, b) => b.decisionScore - a.decisionScore);
  const topOptions = sorted.slice(0, Math.min(topN, sorted.length));

  const tradeoffs: PathTradeoff[] = [];
  const dimensions: Array<UtilityAttributeId | string> = [
    'income', 'freedom', 'stability', 'growth', 'meaning',
    'coalition', 'regret', 'optionality', 'criticality',
  ];

  // Compare each pair of top options
  for (let i = 0; i < topOptions.length; i++) {
    for (let j = i + 1; j < topOptions.length; j++) {
      const optionA = topOptions[i];
      const optionB = topOptions[j];

      for (const dim of dimensions) {
        const scoreA = getDimensionScore(optionA, dim);
        const scoreB = getDimensionScore(optionB, dim);
        const diff = Math.abs(scoreA - scoreB);

        if (diff > 10) { // Only significant differences
          tradeoffs.push({
            betterPath: scoreA > scoreB ? optionA.id : optionB.id,
            worsePath: scoreA > scoreB ? optionB.id : optionA.id,
            dimension: dim as PathTradeoff['dimension'],
            difference: Math.round(diff),
            significant: diff > 20,
          });
        }
      }
    }
  }

  // Identify key tradeoffs (significant ones between top 2)
  const keyTradeoffs = tradeoffs.filter(t =>
    t.significant &&
    (t.betterPath === topOptions[0]?.id || t.worsePath === topOptions[0]?.id)
  );

  // Calculate dominant dimensions (highest variance)
  const dimensionVariances = dimensions.map(dim => {
    const scores = topOptions.map(o => getDimensionScore(o, dim));
    const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / scores.length;
    return { dimension: dim, variance: Math.round(variance) };
  }).sort((a, b) => b.variance - a.variance);

  // Generate frontier description
  const frontierDescription = generateFrontierDescription(topOptions, tradeoffs);

  return {
    tradeoffs: tradeoffs.sort((a, b) => b.difference - a.difference),
    keyTradeoffs,
    dominantDimensions: dimensionVariances.slice(0, 3),
    frontierDescription,
  };
}

function generateFrontierDescription(
  topOptions: DecisionOption[],
  tradeoffs: PathTradeoff[]
): string {
  if (topOptions.length < 2) {
    return 'Only one viable option identified.';
  }

  const best = topOptions[0];
  const runnerUp = topOptions[1];

  const bestTradeoffs = tradeoffs.filter(t =>
    (t.betterPath === best.id && t.worsePath === runnerUp.id) ||
    (t.betterPath === runnerUp.id && t.worsePath === best.id)
  );

  if (bestTradeoffs.length === 0) {
    return `${best.name} dominates ${runnerUp.name} across all key dimensions.`;
  }

  const bestDims = bestTradeoffs
    .filter(t => t.betterPath === best.id)
    .map(t => t.dimension);
  const worseDims = bestTradeoffs
    .filter(t => t.worsePath === best.id)
    .map(t => t.dimension);

  let description = `${best.name} offers superior ${bestDims.slice(0, 2).join(' and ')}`;
  if (worseDims.length > 0) {
    description += `, while ${runnerUp.name} provides better ${worseDims[0]}`;
  }
  description += '.';

  return description;
}

// ============================================================================
// DECISION EXPLANATION GENERATION
// ============================================================================

/**
 * Generate comprehensive decision explanation
 */
export function generateDecisionExplanation(
  optimal: OptimalDecision,
  runnerUp: OptimalDecision | null,
  utilityProfile: StudentUtilityProfile
): DecisionExplanation {
  const reasoning: string[] = [];
  const strengths: DecisionExplanation['strengths'] = [];
  const concerns: DecisionExplanation['concerns'] = [];

  // Primary recommendation
  const recommendation = `Choose ${optimal.path.name} as your optimal career path.`;

  // Utility-based reasoning
  reasoning.push(`Achieves highest expected utility score of ${optimal.expectedUtility.score}/100 based on your personalized preferences.`);

  // Add top contributing factors
  const topContributors = optimal.expectedUtility.byAttribute.slice(0, 3);
  for (const contributor of topContributors) {
    const attrName = contributor.attribute;
    reasoning.push(`Strong alignment with your ${attrName} preference (contributes ${contributor.contribution.toFixed(0)}% to overall score).`);
  }

  // Coalition alignment
  if (optimal.path.coalitionScore > 70) {
    reasoning.push(`Strong family/support system alignment (${optimal.path.coalitionScore}/100).`);
    strengths.push({
      factor: 'Coalition Alignment',
      description: `Well-aligned with stakeholder expectations and values`,
      impact: 'significant',
    });
  }

  // Regret analysis
  if (optimal.path.regretRisk < 30) {
    reasoning.push(`Low regret risk (${optimal.path.regretRisk}/100) - unlikely to second-guess this choice.`);
    strengths.push({
      factor: 'Regret Protection',
      description: `Minimal exposure to future regret based on comprehensive scenario analysis`,
      impact: 'significant',
    });
  } else if (optimal.path.regretRisk > 60) {
    concerns.push({
      factor: 'Regret Risk',
      description: `Higher than optimal regret risk (${optimal.path.regretRisk}/100)`,
      mitigation: 'Consider gathering more information before committing',
    });
  }

  // Optionality preservation
  if (optimal.path.optionalityScore > 75) {
    reasoning.push(`Preserves strong future optionality (${optimal.path.optionalityScore}/100) - keeps many paths open.`);
    strengths.push({
      factor: 'Future Optionality',
      description: `Maintains flexibility for future career pivots and opportunities`,
      impact: 'moderate',
    });
  }

  // Criticality
  if (optimal.path.criticalityScore > 70) {
    reasoning.push(`High criticality (${optimal.path.criticalityScore}/100) - this decision point significantly impacts future trajectory.`);
  }

  // Confidence assessment
  if (optimal.expectedUtility.confidence > 75) {
    reasoning.push(`High confidence in this recommendation (${optimal.expectedUtility.confidence}%).`);
  } else {
    reasoning.push(`Moderate confidence (${optimal.expectedUtility.confidence}%) - consider gathering more data.`);
    concerns.push({
      factor: 'Confidence Level',
      description: `Limited data reduces confidence in this recommendation`,
      mitigation: 'Complete additional assessments and career exploration',
    });
  }

  // Margin analysis
  if (runnerUp) {
    if (optimal.isClearWinner) {
      reasoning.push(`Clear winner by ${optimal.margin.toFixed(1)} points over ${runnerUp.path.name}.`);
    } else {
      reasoning.push(`Close decision - only ${optimal.margin.toFixed(1)} points ahead of ${runnerUp.path.name}.`);
      concerns.push({
        factor: 'Close Alternatives',
        description: `${runnerUp.path.name} is a viable alternative with different tradeoffs`,
        mitigation: 'Review tradeoff analysis to understand key differences',
      });
    }
  }

  // Comparison to alternatives
  let comparison = '';
  if (runnerUp) {
    comparison = `${optimal.path.name} outperforms ${runnerUp.path.name} in overall utility`;
    const betterDims = optimal.expectedUtility.byAttribute
      .filter(a => a.contribution > 15)
      .map(a => a.attribute);
    if (betterDims.length > 0) {
      comparison += ` particularly in ${betterDims.slice(0, 2).join(' and ')}`;
    }
    comparison += '.';
  } else {
    comparison = `${optimal.path.name} is the clear optimal choice among evaluated options.`;
  }

  // Next steps
  const nextSteps = [
    'Research specific companies and roles within this path',
    'Identify skill gaps and create development plan',
    'Connect with professionals currently in this career',
    'Evaluate educational requirements and timeline',
  ];

  if (optimal.expectedUtility.confidence < 70) {
    nextSteps.unshift('Complete additional career assessments to increase confidence');
  }

  if (optimal.path.regretRisk > 40) {
    nextSteps.push('Explore backup plans and alternative paths');
  }

  return {
    recommendation,
    reasoning,
    strengths,
    concerns,
    comparison,
    nextSteps,
  };
}

// ============================================================================
// FIND BEST BY CRITERIA
// ============================================================================

/**
 * Find best path by specific attribute
 */
export function findBestByAttribute(
  options: DecisionOption[],
  attribute: UtilityAttributeId
): OptimalDecision | null {
  if (options.length === 0) return null;

  const sorted = [...options].sort(
    (a, b) => (b.utilityAttributes[attribute] || 0) - (a.utilityAttributes[attribute] || 0)
  );

  const best = sorted[0];
  const runnerUp = sorted[1];

  return {
    id: `best-${attribute}-${Date.now()}`,
    path: best,
    expectedUtility: null as unknown as ExpectedUtility, // Would be calculated in full implementation
    rank: 1,
    margin: runnerUp
      ? (best.utilityAttributes[attribute] || 0) - (runnerUp.utilityAttributes[attribute] || 0)
      : 0,
    isClearWinner: !runnerUp ||
      (best.utilityAttributes[attribute] || 0) - (runnerUp.utilityAttributes[attribute] || 0) > 10,
    advantages: [`Highest ${attribute} score among all options`],
    risks: [],
  };
}

/**
 * Find best path by coalition alignment
 */
export function findBestByCoalition(options: DecisionOption[]): OptimalDecision | null {
  if (options.length === 0) return null;

  const sorted = [...options].sort((a, b) => b.coalitionScore - a.coalitionScore);
  const best = sorted[0];
  const runnerUp = sorted[1];

  return {
    id: `best-coalition-${Date.now()}`,
    path: best,
    expectedUtility: null as unknown as ExpectedUtility,
    rank: 1,
    margin: runnerUp ? best.coalitionScore - runnerUp.coalitionScore : 0,
    isClearWinner: !runnerUp || best.coalitionScore - runnerUp.coalitionScore > 10,
    advantages: ['Best alignment with family and stakeholder expectations'],
    risks: best.coalitionScore < 60 ? ['Moderate coalition alignment - may face resistance'] : [],
  };
}

/**
 * Find best path by regret minimization
 */
export function findBestByRegret(options: DecisionOption[]): OptimalDecision | null {
  if (options.length === 0) return null;

  const sorted = [...options].sort((a, b) => a.regretRisk - b.regretRisk);
  const best = sorted[0];
  const runnerUp = sorted[1];

  return {
    id: `best-regret-${Date.now()}`,
    path: best,
    expectedUtility: null as unknown as ExpectedUtility,
    rank: 1,
    margin: runnerUp ? runnerUp.regretRisk - best.regretRisk : 0,
    isClearWinner: !runnerUp || runnerUp.regretRisk - best.regretRisk > 15,
    advantages: ['Lowest risk of future regret'],
    risks: best.regretRisk > 40 ? ['Even best option carries moderate regret risk'] : [],
  };
}

/**
 * Find best path by optionality
 */
export function findBestByOptionality(options: DecisionOption[]): OptimalDecision | null {
  if (options.length === 0) return null;

  const sorted = [...options].sort((a, b) => b.optionalityScore - a.optionalityScore);
  const best = sorted[0];
  const runnerUp = sorted[1];

  return {
    id: `best-optionality-${Date.now()}`,
    path: best,
    expectedUtility: null as unknown as ExpectedUtility,
    rank: 1,
    margin: runnerUp ? best.optionalityScore - runnerUp.optionalityScore : 0,
    isClearWinner: !runnerUp || best.optionalityScore - runnerUp.optionalityScore > 10,
    advantages: ['Preserves maximum future flexibility and pivot options'],
    risks: [],
  };
}

// ============================================================================
// MAIN OPTIMIZATION FUNCTION
// ============================================================================

/**
 * Generate optimal decision set from all analyses
 */
export function generateOptimalDecisionSet(
  studentId: string,
  utilityProfile: StudentUtilityProfile,
  options: DecisionOption[],
  config: OptimizationConfig = DEFAULT_OPTIMIZATION_CONFIG
): OptimalDecisionSet {
  // Calculate expected utility for each option
  const decisions: OptimalDecision[] = options.map(option => {
    const expectedUtility = calculateExpectedUtility(option, utilityProfile, config);

    return {
      id: `decision-${option.id}-${Date.now()}`,
      path: option,
      expectedUtility,
      rank: 0, // Will be set after sorting
      margin: 0, // Will be calculated
      isClearWinner: false, // Will be determined
      advantages: [],
      risks: [],
    };
  });

  // Sort by expected utility score (descending)
  decisions.sort((a, b) => b.expectedUtility.score - a.expectedUtility.score);

  // Assign ranks and calculate margins
  decisions.forEach((decision, index) => {
    decision.rank = index + 1;
    if (index < decisions.length - 1) {
      decision.margin = decision.expectedUtility.score - decisions[index + 1].expectedUtility.score;
    }
    decision.isClearWinner = index === 0 && decision.margin > 10;
  });

  // Generate advantages and risks for top options
  decisions.slice(0, 5).forEach(decision => {
    decision.advantages = generateAdvantages(decision, utilityProfile);
    decision.risks = generateRisks(decision);
  });

  // Calculate Pareto frontier
  const paretoFrontier = calculateParetoFrontier(options);

  // Analyze tradeoffs
  const tradeoffs = analyzeTradeoffs(options);

  // Find best by criteria
  const byCriteria = {
    bestIncome: findBestByAttribute(options, 'income'),
    bestFreedom: findBestByAttribute(options, 'freedom'),
    bestStability: findBestByAttribute(options, 'stability'),
    bestImpact: findBestByAttribute(options, 'socialImpact'),
    bestGrowth: findBestByAttribute(options, 'growth'),
    bestWorkLife: findBestByAttribute(options, 'workLifeBalance'),
    bestOptionality: findBestByOptionality(options),
    bestCoalition: findBestByCoalition(options),
    bestRegret: findBestByRegret(options),
  };

  // Generate explanation
  const explanation = generateDecisionExplanation(
    decisions[0],
    decisions[1] || null,
    utilityProfile
  );

  // Calculate confidence
  const confidenceScores = decisions.map(d => d.expectedUtility.confidence);
  const avgConfidence = confidenceScores.reduce((sum, c) => sum + c, 0) / confidenceScores.length;

  return {
    id: `optimal-set-${studentId}-${Date.now()}`,
    timestamp: Date.now(),
    studentId,
    bestOverall: decisions[0],
    byCriteria,
    rankedOptions: decisions,
    paretoFrontier,
    tradeoffs,
    explanation,
    confidence: {
      overall: Math.round(avgConfidence),
      utility: Math.round(avgConfidence * 0.9),
      coalition: Math.round(options.reduce((sum, o) => sum + o.coalitionScore, 0) / options.length),
      regret: Math.round(100 - options.reduce((sum, o) => sum + o.regretRisk, 0) / options.length),
      optionality: Math.round(options.reduce((sum, o) => sum + o.optionalityScore, 0) / options.length),
      criticality: Math.round(options.reduce((sum, o) => sum + o.criticalityScore, 0) / options.length),
    },
  };
}

function generateAdvantages(
  decision: OptimalDecision,
  utilityProfile: StudentUtilityProfile
): string[] {
  const advantages: string[] = [];

  // Top utility contributors
  const topContributor = decision.expectedUtility.byAttribute[0];
  if (topContributor && topContributor.contribution > 20) {
    advantages.push(`Strong alignment with your ${topContributor.attribute} preference`);
  }

  if (decision.path.coalitionScore > 70) {
    advantages.push('Well-aligned with stakeholder expectations');
  }

  if (decision.path.regretRisk < 30) {
    advantages.push('Low risk of future regret');
  }

  if (decision.path.optionalityScore > 75) {
    advantages.push('Preserves future flexibility');
  }

  if (decision.expectedUtility.confidence > 75) {
    advantages.push('High confidence in recommendation');
  }

  return advantages;
}

function generateRisks(decision: OptimalDecision): string[] {
  const risks: string[] = [];

  if (decision.path.regretRisk > 50) {
    risks.push('Moderate to high regret risk');
  }

  if (decision.path.coalitionScore < 50) {
    risks.push('Potential stakeholder misalignment');
  }

  if (decision.expectedUtility.worstCase < 40) {
    risks.push('Significant downside scenario possible');
  }

  if (decision.expectedUtility.confidence < 60) {
    risks.push('Limited data confidence');
  }

  return risks;
}

// ============================================================================
// DECISION OPTIMIZATION ENGINE CLASS
// ============================================================================

export class DecisionOptimizationEngineV1 {
  private config: OptimizationConfig;

  constructor(config?: Partial<OptimizationConfig>) {
    this.config = { ...DEFAULT_OPTIMIZATION_CONFIG, ...config };
  }

  /**
   * Generate optimal decision set
   */
  optimize(
    studentId: string,
    utilityProfile: StudentUtilityProfile,
    options: DecisionOption[]
  ): OptimalDecisionSet {
    return generateOptimalDecisionSet(studentId, utilityProfile, options, this.config);
  }

  /**
   * Calculate expected utility for a single option
   */
  calculateUtility(
    option: DecisionOption,
    utilityProfile: StudentUtilityProfile
  ): ExpectedUtility {
    return calculateExpectedUtility(option, utilityProfile, this.config);
  }

  /**
   * Find Pareto frontier
   */
  findParetoFrontier(
    options: DecisionOption[],
    dimensions?: string[]
  ): PathId[] {
    return calculateParetoFrontier(options, dimensions);
  }

  /**
   * Analyze tradeoffs
   */
  analyzeTradeoffs(options: DecisionOption[], topN?: number): TradeoffAnalysis {
    return analyzeTradeoffs(options, topN);
  }

  /**
   * Find best by specific criteria
   */
  findBestByCriteria(
    options: DecisionOption[],
    criteria: 'income' | 'freedom' | 'stability' | 'impact' | 'growth' | 'workLife' | 'optionality' | 'coalition' | 'regret'
  ): OptimalDecision | null {
    switch (criteria) {
      case 'income':
        return findBestByAttribute(options, 'income');
      case 'freedom':
        return findBestByAttribute(options, 'freedom');
      case 'stability':
        return findBestByAttribute(options, 'stability');
      case 'impact':
        return findBestByAttribute(options, 'socialImpact');
      case 'growth':
        return findBestByAttribute(options, 'growth');
      case 'workLife':
        return findBestByAttribute(options, 'workLifeBalance');
      case 'optionality':
        return findBestByOptionality(options);
      case 'coalition':
        return findBestByCoalition(options);
      case 'regret':
        return findBestByRegret(options);
      default:
        return null;
    }
  }

  /**
   * Generate explanation
   */
  explainDecision(
    optimal: OptimalDecision,
    runnerUp: OptimalDecision | null,
    utilityProfile: StudentUtilityProfile
  ): DecisionExplanation {
    return generateDecisionExplanation(optimal, runnerUp, utilityProfile);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): OptimizationConfig {
    return { ...this.config };
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createDecisionOptimizationEngine(
  config?: Partial<OptimizationConfig>
): DecisionOptimizationEngineV1 {
  return new DecisionOptimizationEngineV1(config);
}


