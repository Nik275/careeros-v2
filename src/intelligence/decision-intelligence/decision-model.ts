/**
 * Decision Model
 *
 * Phase 8.5: Decision Intelligence Engine - Part 2
 *
 * Core data structures and calculations for decision analysis.
 * Provides the mathematical foundation for all decision intelligence operations.
 *
 * @module decision-model
 * @version 1.0.0
 */

import {
  DecisionId,
  DecisionOption,
  PathRecommendation,
  PathType,
  ScenarioProjections,
  RiskAssessment,
  RiskCategory,
  TradeoffDimension,
  RegretCategory,
  TimeHorizon,
  DecisionEngineConfig,
} from './decision-types';

// ============================================================================
// DECISION SCORING MODELS
// ============================================================================

/**
 * Multi-attribute utility model for decision scoring
 */
export interface MultiAttributeUtility {
  attributes: Map<string, AttributeWeight>;
  utilityFunction: (scores: Map<string, number>) => number;
  calculateUtility: (option: DecisionOption) => number;
}

/**
 * Weight for a decision attribute
 */
export interface AttributeWeight {
  name: string;
  weight: number; // 0-1, sum of all weights = 1
  importance: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  isNegotiable: boolean;
}

/**
 * Decision matrix for comparing options
 */
export interface DecisionMatrix {
  options: string[];
  criteria: string[];
  scores: number[][]; // [optionIndex][criteriaIndex]
  weights: number[]; // per criteria
  normalized: boolean;
}

// ============================================================================
// PROBABILITY MODELS
// ============================================================================

/**
 * Probability distribution for uncertain outcomes
 */
export interface OutcomeDistribution {
  outcomes: OutcomeProbability[];
  expectedValue: number;
  variance: number;
  confidenceInterval: [number, number];
}

/**
 * Single outcome with probability
 */
export interface OutcomeProbability {
  outcome: string;
  probability: number; // 0-1
  value: number;
  description: string;
}

/**
 * Bayesian belief network node
 */
export interface BeliefNode {
  id: string;
  name: string;
  states: string[];
  probabilities: number[]; // P(state)
  parents: string[];
  conditionalTable?: number[][]; // P(state | parent states)
}

// ============================================================================
// VALUE MODELS
// ============================================================================

/**
 * Value hierarchy for decision making
 */
export interface ValueHierarchy {
  coreValues: CoreValue[];
  derivedValues: DerivedValue[];
  conflicts: ValueConflict[];
  priorityOrder: string[];
}

/**
 * Core value (fundamental)
 */
export interface CoreValue {
  id: string;
  name: string;
  description: string;
  weight: number; // inherent importance
  nonNegotiable: boolean;
}

/**
 * Derived value (instrumental to core values)
 */
export interface DerivedValue {
  id: string;
  name: string;
  servesCoreValue: string;
  importance: number;
}

/**
 * Conflict between values
 */
export interface ValueConflict {
  valueA: string;
  valueB: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  resolution?: 'A' | 'B' | 'INTEGRATE' | 'BALANCE';
}

// ============================================================================
// TEMPORAL MODELS
// ============================================================================

/**
 * Time-discounted value calculation
 */
export interface TemporalValue {
  immediateValue: number;
  futureValues: Map<number, number>; // year -> value
  discountRate: number;
  netPresentValue: number;
}

/**
 * Path trajectory over time
 */
export interface PathTrajectory {
  pathId: string;
  milestones: TrajectoryMilestone[];
  inflectionPoints: InflectionPoint[];
  steadyState: SteadyState;
}

/**
 * Milestone in a trajectory
 */
export interface TrajectoryMilestone {
  time: number; // months from start
  description: string;
  probability: number;
  value: number;
  prerequisites: string[];
}

/**
 * Inflection point where path can change
 */
export interface InflectionPoint {
  time: number;
  description: string;
  options: string[];
  defaultPath: string;
}

/**
 * Steady state of a path
 */
export interface SteadyState {
  timeToReach: number; // months
  characteristics: Map<string, number>;
  stability: number; // 0-100
}

// ============================================================================
// UNCERTAINTY MODELS
// ============================================================================

/**
 * Uncertainty quantification
 */
export interface UncertaintyModel {
  knownKnowns: string[];
  knownUnknowns: KnownUnknown[];
  unknownUnknowns: number; // estimated count/probability
  reducibleUncertainty: number; // 0-100
  irreducibleUncertainty: number; // 0-100
}

/**
 * Known unknown with estimation
 */
export interface KnownUnknown {
  description: string;
  impactIfTrue: number; // -100 to 100
  probability: number; // 0-100
  reducible: boolean;
  reductionMethod: string;
}

// ============================================================================
// SCORING FUNCTIONS
// ============================================================================

/**
 * Calculate weighted score for a set of values
 */
export function calculateWeightedScore(
  values: Map<string, number>,
  weights: Map<string, number>
): number {
  let totalScore = 0;
  let totalWeight = 0;

  for (const [key, value] of values) {
    const weight = weights.get(key) ?? 0;
    totalScore += value * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? totalScore / totalWeight : 0;
}

/**
 * Calculate normalized score (0-100)
 */
export function normalizeScore(
  value: number,
  min: number,
  max: number
): number {
  if (max === min) return 50;
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

/**
 * Calculate composite score from multiple factors
 */
export function calculateCompositeScore(
  factors: Array<{ score: number; weight: number }>
): number {
  const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
  if (totalWeight === 0) return 0;

  const weightedSum = factors.reduce(
    (sum, f) => sum + f.score * f.weight,
    0
  );

  return weightedSum / totalWeight;
}

// ============================================================================
// DECISION MATRIX OPERATIONS
// ============================================================================

/**
 * Create a normalized decision matrix
 */
export function createDecisionMatrix(
  options: string[],
  criteria: string[],
  rawScores: number[][],
  weights: number[]
): DecisionMatrix {
  // Normalize scores to 0-100 scale
  const normalizedScores = rawScores.map((optionScores) =>
    optionScores.map((score, idx) => {
      const criterionScores = rawScores.map((os) => os[idx]);
      const min = Math.min(...criterionScores);
      const max = Math.max(...criterionScores);
      return normalizeScore(score, min, max);
    })
  );

  return {
    options,
    criteria,
    scores: normalizedScores,
    weights: weights.map((w) => w / weights.reduce((a, b) => a + b, 0)), // normalize weights
    normalized: true,
  };
}

/**
 * Calculate weighted sum model (WSM) scores
 */
export function calculateWSMScores(matrix: DecisionMatrix): Map<string, number> {
  const scores = new Map<string, number>();

  matrix.options.forEach((option, optionIdx) => {
    let weightedSum = 0;
    matrix.scores[optionIdx].forEach((score, criteriaIdx) => {
      weightedSum += score * matrix.weights[criteriaIdx];
    });
    scores.set(option, weightedSum);
  });

  return scores;
}

/**
 * Calculate ideal solution (TOPSIS-style)
 */
export function calculateIdealSolution(
  matrix: DecisionMatrix
): {
  positiveIdeal: number[];
  negativeIdeal: number[];
  distances: Map<string, { positive: number; negative: number; score: number }>;
} {
  // Find positive and negative ideals for each criterion
  const positiveIdeal: number[] = [];
  const negativeIdeal: number[] = [];

  for (let i = 0; i < matrix.criteria.length; i++) {
    const criterionScores = matrix.scores.map((s) => s[i]);
    positiveIdeal.push(Math.max(...criterionScores));
    negativeIdeal.push(Math.min(...criterionScores));
  }

  // Calculate distances for each option
  const distances = new Map<
    string,
    { positive: number; negative: number; score: number }
  >();

  matrix.options.forEach((option, optionIdx) => {
    let dPos = 0;
    let dNeg = 0;

    for (let i = 0; i < matrix.criteria.length; i++) {
      const score = matrix.scores[optionIdx][i];
      dPos += Math.pow(score - positiveIdeal[i], 2);
      dNeg += Math.pow(score - negativeIdeal[i], 2);
    }

    dPos = Math.sqrt(dPos);
    dNeg = Math.sqrt(dNeg);

    // Closeness coefficient
    const score = dNeg / (dPos + dNeg || 1);

    distances.set(option, { positive: dPos, negative: dNeg, score });
  });

  return { positiveIdeal, negativeIdeal, distances };
}

// ============================================================================
// UTILITY CALCULATIONS
// ============================================================================

/**
 * Calculate expected utility
 */
export function calculateExpectedUtility(
  outcomes: OutcomeProbability[]
): number {
  return outcomes.reduce((sum, o) => sum + o.probability * o.value, 0);
}

/**
 * Calculate risk-adjusted utility (using exponential utility)
 */
export function calculateRiskAdjustedUtility(
  outcomes: OutcomeProbability[],
  riskTolerance: number // higher = more risk tolerant
): number {
  if (riskTolerance <= 0) return calculateExpectedUtility(outcomes);

  const expectedUtility = outcomes.reduce(
    (sum, o) => sum + o.probability * (1 - Math.exp(-o.value / riskTolerance)),
    0
  );

  return -riskTolerance * Math.log(1 - expectedUtility);
}

// ============================================================================
// PATH TYPE RANKINGS
// ============================================================================

/**
 * Default ranking of path types by priority
 */
export const PATH_TYPE_PRIORITY: PathType[] = [
  'RECOMMENDED',
  'BEST_LONG_TERM',
  'BEST_IDENTITY_FIT',
  'LOWEST_REGRET',
  'HIGHEST_OPTIONALITY',
  'HIGHEST_GROWTH',
  'SAFEST',
  'HIGHEST_INCOME',
  'FASTEST_TO_IMPLEMENT',
  'MOST_ALIGNS_WITH_VALUES',
];

/**
 * Get priority weight for a path type
 */
export function getPathTypeWeight(pathType: PathType): number {
  const index = PATH_TYPE_PRIORITY.indexOf(pathType);
  return index >= 0 ? 1 - index * 0.1 : 0.5;
}

// ============================================================================
// SCORING PROJECTIONS
// ============================================================================

/**
 * Calculate aggregate score from scenario projections
 */
export function calculateAggregateProjectionScore(
  projections: ScenarioProjections
): number {
  const weights = {
    incomePotential: 0.15,
    fulfillmentPotential: 0.2,
    futureRelevance: 0.15,
    optionality: 0.1,
    lifestyleCompatibility: 0.1,
    growthPotential: 0.15,
    studentFit: 0.15,
  };

  // Lower regret and burnout risk is better, so invert them
  const adjustedRegretRisk = 100 - projections.regretRisk;
  const adjustedBurnoutRisk = 100 - projections.burnoutRisk;

  return (
    projections.incomePotential * weights.incomePotential +
    projections.fulfillmentPotential * weights.fulfillmentPotential +
    projections.futureRelevance * weights.futureRelevance +
    projections.optionality * weights.optionality +
    projections.lifestyleCompatibility * weights.lifestyleCompatibility +
    projections.growthPotential * weights.growthPotential +
    projections.studentFit * weights.studentFit +
    adjustedRegretRisk * 0.05 +
    adjustedBurnoutRisk * 0.05
  );
}

// ============================================================================
// RISK CALCULATIONS
// ============================================================================

/**
 * Calculate overall risk score from assessments
 */
export function calculateOverallRisk(assessments: RiskAssessment[]): number {
  if (assessments.length === 0) return 0;

  const weightedSum = assessments.reduce(
    (sum, a) => sum + a.score * (a.probability / 100),
    0
  );

  return Math.min(100, weightedSum / assessments.length);
}

/**
 * Identify highest risk category
 */
export function identifyHighestRisk(
  assessments: RiskAssessment[]
): RiskCategory | null {
  if (assessments.length === 0) return null;

  return assessments.reduce((max, a) => (a.score > max.score ? a : max)).category;
}

// ============================================================================
// TRADEOFF DETECTION MODELS
// ============================================================================

/**
 * Tradeoff detection pattern
 */
export interface TradeoffPattern {
  dimension: TradeoffDimension;
  indicators: string[];
  evidenceTypes: ('STATEMENT' | 'BEHAVIOR' | 'CONTRADICTION' | 'PATTERN')[];
  minEvidence: number;
}

/**
 * Predefined tradeoff patterns for detection
 */
export const TRADEOFF_PATTERNS: TradeoffPattern[] = [
  {
    dimension: 'MONEY_VS_MEANING',
    indicators: [
      'salary',
      'income',
      'money',
      'meaningful',
      'purpose',
      'impact',
      'helping',
    ],
    evidenceTypes: ['STATEMENT', 'CONTRADICTION', 'PATTERN'],
    minEvidence: 2,
  },
  {
    dimension: 'PRESTIGE_VS_FREEDOM',
    indicators: [
      'prestigious',
      'status',
      'recognition',
      'freedom',
      'independent',
      'autonomy',
      'flexible',
    ],
    evidenceTypes: ['STATEMENT', 'CONTRADICTION'],
    minEvidence: 2,
  },
  {
    dimension: 'SECURITY_VS_GROWTH',
    indicators: [
      'stable',
      'secure',
      'safe',
      'growth',
      'learning',
      'challenge',
      'develop',
    ],
    evidenceTypes: ['STATEMENT', 'PATTERN'],
    minEvidence: 2,
  },
  {
    dimension: 'PASSION_VS_PRACTICALITY',
    indicators: [
      'passion',
      'love',
      'dream',
      'practical',
      'realistic',
      'sensible',
      'job market',
    ],
    evidenceTypes: ['STATEMENT', 'CONTRADICTION', 'PATTERN'],
    minEvidence: 2,
  },
  {
    dimension: 'FAMILY_VS_IDENTITY',
    indicators: [
      'family',
      'parents',
      'expectations',
      'myself',
      'who I am',
      'authentic',
      'true to',
    ],
    evidenceTypes: ['STATEMENT', 'CONTRADICTION'],
    minEvidence: 2,
  },
  {
    dimension: 'SHORT_TERM_VS_LONG_TERM',
    indicators: [
      'now',
      'immediate',
      'quick',
      'future',
      'later',
      'eventually',
      'long run',
    ],
    evidenceTypes: ['STATEMENT', 'PATTERN'],
    minEvidence: 2,
  },
  {
    dimension: 'STATUS_VS_AUTONOMY',
    indicators: [
      'title',
      'position',
      'senior',
      'own boss',
      'decide',
      'control',
      'entrepreneur',
    ],
    evidenceTypes: ['STATEMENT', 'BEHAVIOR'],
    minEvidence: 2,
  },
];

// ============================================================================
// REGRET CALCULATION MODELS
// ============================================================================

/**
 * Regret predictor pattern
 */
export interface RegretPredictor {
  category: RegretCategory;
  indicators: string[];
  timeHorizons: TimeHorizon[];
  baseProbability: number;
  intensityFactors: string[];
}

/**
 * Predefined regret predictors
 */
export const REGRET_PREDICTORS: RegretPredictor[] = [
  {
    category: 'IDENTITY',
    indicators: [
      'external validation',
      'what others think',
      'parents want',
      'not myself',
      'pretending',
    ],
    timeHorizons: [10, 20, 40],
    baseProbability: 0.6,
    intensityFactors: ['strong contradiction', 'value violation'],
  },
  {
    category: 'EXPLORATION',
    indicators: [
      'never tried',
      'what if',
      'curious about',
      'always wondered',
      'missed opportunity',
    ],
    timeHorizons: [5, 10, 20],
    baseProbability: 0.5,
    intensityFactors: ['low optionality', 'no experimentation'],
  },
  {
    category: 'FINANCIAL',
    indicators: [
      'financial stress',
      'debt',
      'cant afford',
      'struggling',
      'insecurity',
    ],
    timeHorizons: [5, 10, 20],
    baseProbability: 0.4,
    intensityFactors: ['high cost', 'low roi'],
  },
  {
    category: 'PURPOSE',
    indicators: [
      'no meaning',
      'pointless',
      'empty',
      'just a job',
      'no impact',
    ],
    timeHorizons: [10, 20, 40],
    baseProbability: 0.55,
    intensityFactors: ['value mismatch', 'meaning deficit'],
  },
  {
    category: 'RELATIONSHIP',
    indicators: [
      'isolated',
      'alone',
      'no connection',
      'miss people',
      'sacrificed relationships',
    ],
    timeHorizons: [10, 20, 40],
    baseProbability: 0.45,
    intensityFactors: ['high mobility', 'demanding schedule'],
  },
];

// ============================================================================
// TRADEOFF FRAMEWORKS
// ============================================================================

import type { TradeoffFramework } from './decision-types';

/**
 * Predefined tradeoff frameworks for common decision conflicts
 */
export const TRADEOFF_FRAMEWORKS: TradeoffFramework[] = [
  {
    type: 'MONEY_VS_MEANING',
    name: 'Money vs Meaning',
    description: 'The tension between financial rewards and purposeful work.',
    dimensionA: { name: 'Financial Rewards', description: 'Salary, bonuses, stock options, wealth accumulation.', weight: 0.5 },
    dimensionB: { name: 'Purpose & Meaning', description: 'Sense of contribution, alignment with values, making a difference.', weight: 0.5 },
    resolutionStrategies: [
      'Find roles that pay well in meaningful sectors',
      'Build financial cushion to enable purpose-driven transitions',
      'Integrate purpose into any role through side projects',
    ],
    commonScenarios: ['High-paying corporate job vs lower-paying nonprofit', 'Finance career vs teaching', 'Consulting vs social work'],
    intensityIndicators: ['frequent comparison of salary vs satisfaction', 'envy of peers in different paths'],
  },
  {
    type: 'PRESTIGE_VS_FREEDOM',
    name: 'Prestige vs Freedom',
    description: 'The tradeoff between status/recognition and autonomy/flexibility.',
    dimensionA: { name: 'Prestige & Status', description: 'Recognition, title, brand name, social standing.', weight: 0.5 },
    dimensionB: { name: 'Freedom & Autonomy', description: 'Control over schedule, work style, decision-making independence.', weight: 0.5 },
    resolutionStrategies: [
      'Seek prestigious roles with autonomy (e.g., senior IC positions)',
      'Build personal brand that creates status independent of employer',
      'Define what prestige means personally vs socially',
    ],
    commonScenarios: ['Big brand company vs startup', 'Partnership track vs independent consulting', 'Management vs senior IC'],
    intensityIndicators: ['fear of judgment for leaving prestigious role', 'craving for schedule control'],
  },
  {
    type: 'SECURITY_VS_GROWTH',
    name: 'Security vs Growth',
    description: 'The tension between stability and opportunities for development.',
    dimensionA: { name: 'Security & Stability', description: 'Predictable income, job security, benefits, low risk.', weight: 0.5 },
    dimensionB: { name: 'Growth & Learning', description: 'Skill development, new challenges, career advancement potential.', weight: 0.5 },
    resolutionStrategies: [
      'Choose stable employers with strong learning cultures',
      'Create security through skills rather than specific jobs',
      'Phase risk: establish security then pursue growth',
    ],
    commonScenarios: ['Stable government job vs dynamic startup', 'Staying in current role vs taking stretch assignment', 'Big company vs growing company'],
    intensityIndicators: ['anxiety about financial uncertainty', 'boredom or stagnation feelings'],
  },
  {
    type: 'FAMILY_VS_IDENTITY',
    name: 'Family Expectations vs Personal Identity',
    description: 'The conflict between honoring family wishes and being true to oneself.',
    dimensionA: { name: 'Family Expectations', description: 'Meeting parent/family hopes, cultural obligations, honoring sacrifices.', weight: 0.5 },
    dimensionB: { name: 'Personal Identity', description: 'Authentic self-expression, pursuing personal dreams, individual values.', weight: 0.5 },
    resolutionStrategies: [
      'Have honest conversations about values and concerns',
      'Find paths that honor both (e.g., stable career in creative field)',
      'Build trust through demonstrated competence in chosen path',
    ],
    commonScenarios: ['Doctor/lawyer path vs creative career', 'Family business vs personal passion', 'Local job vs moving for dreams'],
    intensityIndicators: ['guilt about disappointing family', 'feeling inauthentic in current path'],
  },
  {
    type: 'SHORT_TERM_VS_LONG_TERM',
    name: 'Short-Term Comfort vs Long-Term Goals',
    description: 'The tension between immediate needs and future aspirations.',
    dimensionA: { name: 'Short-Term Comfort', description: 'Immediate income, location convenience, current lifestyle.', weight: 0.4 },
    dimensionB: { name: 'Long-Term Goals', description: 'Career trajectory, skill building, network development, future opportunities.', weight: 0.6 },
    resolutionStrategies: [
      'Calculate true cost of short-term comfort on long-term goals',
      'Find compromises that preserve some comfort while advancing',
      'Set clear timeline for when short-term sacrifices end',
    ],
    commonScenarios: ['Easy local job vs career-enhancing relocation', 'Immediate income vs skill-building opportunity', 'Comfortable routine vs challenging growth'],
    intensityIndicators: ['procrastination on important decisions', 'justifying inaction with temporary benefits'],
  },
];

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

/**
 * Default decision engine configuration
 */
export const DEFAULT_DECISION_ENGINE_CONFIG: DecisionEngineConfig = {
  tradeoff: {
    sensitivity: 0.7,
    minEvidenceCount: 2,
    dimensionWeights: new Map([
      ['MONEY_VS_MEANING', 1.0],
      ['PRESTIGE_VS_FREEDOM', 0.9],
      ['SECURITY_VS_GROWTH', 0.9],
      ['PASSION_VS_PRACTICALITY', 1.0],
      ['FAMILY_VS_IDENTITY', 1.0],
      ['SHORT_TERM_VS_LONG_TERM', 0.8],
      ['STATUS_VS_AUTONOMY', 0.85],
    ]),
    awarenessThresholds: {
      unaware: 0.3,
      partiallyAware: 0.6,
      fullyAware: 0.85,
    },
  },
  regret: {
    timeHorizons: [5, 10, 20, 40] as TimeHorizon[],
    categoryWeights: new Map([
      ['IDENTITY', 1.0],
      ['PURPOSE', 0.95],
      ['EXPLORATION', 0.85],
      ['RELATIONSHIP', 0.8],
      ['FINANCIAL', 0.75],
      ['MISSED_OPPORTUNITY', 0.7],
      ['TIMING', 0.6],
      ['COMPROMISE', 0.65],
    ]),
    patternSensitivity: 0.8,
    contradictionPenalty: 0.2,
  },
  optionality: {
    futureTimeframe: 10,
    minAccessibilityThreshold: 30,
    pivotBarrierWeight: 0.6,
    explorationMechanismBonus: 0.15,
  },
  risk: {
    riskAppetite: 'MODERATE' as const,
    categoryWeights: new Map([
      ['IDENTITY', 1.0],
      ['FINANCIAL', 0.9],
      ['CAREER', 0.85],
      ['LIFESTYLE', 0.75],
      ['BURNOUT', 0.8],
      ['OPPORTUNITY_COST', 0.7],
    ]),
    mitigationEffectiveness: 0.7,
    horizon: 10,
  },
  scenario: {
    numScenarios: 3,
    timeframe: 10,
    confidenceIntervals: true,
    includeOutliers: false,
    sensitivityAnalysis: true,
  },
  enableAllAnalyses: true,
  explanationStyle: 'MENTOR_STYLE' as const,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate unique decision ID
 */
export function generateDecisionId(): DecisionId {
  return `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` as DecisionId;
}

/**
 * Clamp value to range
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculate percentile rank
 */
export function calculatePercentileRank(value: number, distribution: number[]): number {
  const sorted = [...distribution].sort((a, b) => a - b);
  const index = sorted.findIndex((v) => v >= value);
  return index >= 0 ? (index / sorted.length) * 100 : 100;
}

/**
 * Format score as percentage with description
 */
export function formatScore(score: number, description: string): string {
  return `${Math.round(score)}% - ${description}`;
}
