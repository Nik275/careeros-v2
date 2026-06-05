/**
 * CareerOS Outcome Modeling Engine
 *
 * Estimates outcome ranges with confidence intervals for career scenarios.
 * Does NOT predict exact outcomes - only models plausible ranges.
 *
 * For every scenario estimates:
 * - Income range (with confidence intervals)
 * - Optionality range (with confidence intervals)
 * - Regret exposure range
 * - Coalition stability range
 * - Career satisfaction likelihood range
 *
 * Outputs confidence intervals at 95%, 80%, and 50% bands.
 * Deterministic. Graph-based. No AI. No randomness.
 *
 * @module intelligence/outcome-modeling
 * @version 1.0.0
 */

import type {
  FutureScenario,
  ScenarioType,
  IncomePoint,
  FlexibilityPoint,
} from '../future-scenario/FutureScenarioGeneratorV1.js';

import type {
  StudentBeliefV3,
  Value,
  Constraint,
} from '../types/index.js';

import type {
  DecisionCoalitionAnalysis,
  PathCoalitionAnalysis,
} from '../decision-coalition-v3/DecisionCoalitionEngineV3.js';

import type {
  CriticalityAnalysis,
} from '../criticality-engine/CriticalityEngineV1.js';

import type {
  OptionalityAnalysis,
} from '../optionality-engine/OptionalityEngineV1.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Statistical confidence levels for outcome ranges (NOT constitutional confidence)
 * These are standard statistical confidence intervals (95%, 80%, 50%)
 */
export type StatisticalConfidence = 0.95 | 0.80 | 0.50;

/**
 * A numeric range with lower and upper bounds
 */
export interface OutcomeRange {
  /** Lower bound of the range */
  lower: number;
  /** Upper bound of the range */
  upper: number;
  /** Midpoint of the range */
  midpoint: number;
  /** Range width (upper - lower) */
  width: number;
}

/**
 * Confidence interval for an outcome metric
 */
export interface ConfidenceInterval {
  /** Statistical confidence level (0.95, 0.80, 0.50) - NOT constitutional confidence */
  level: StatisticalConfidence;
  /** The range at this confidence level */
  range: OutcomeRange;
  /** Interpretation of this interval */
  interpretation: string;
}

/**
 * Income range modeling for a scenario
 */
export interface IncomeRangeModel {
  /** Year being modeled */
  year: number;
  /** Confidence intervals for annual income */
  annual: ConfidenceInterval[];
  /** Confidence intervals for monthly income */
  monthly: ConfidenceInterval[];
  /** Confidence intervals for cumulative income */
  cumulative: ConfidenceInterval[];
  /** Growth rate range */
  growthRate: ConfidenceInterval[];
  /** Key factors affecting income range */
  factors: IncomeFactor[];
}

/**
 * Factor affecting income range
 */
export interface IncomeFactor {
  /** Factor name */
  name: string;
  /** Impact on range (-1 to 1, negative = decreases income) */
  impact: number;
  /** Confidence in this factor (0-1) */
  confidence: number;
  /** How it affects the range width */
  rangeImpact: 'narrows' | 'widens' | 'shifts-up' | 'shifts-down';
}

/**
 * Optionality range modeling for a scenario
 */
export interface OptionalityRangeModel {
  /** Year being modeled */
  year: number;
  /** Confidence intervals for optionality score */
  score: ConfidenceInterval[];
  /** Confidence intervals for reachable career count */
  reachableCareers: ConfidenceInterval[];
  /** Confidence intervals for pivot potential */
  pivotPotential: ConfidenceInterval[];
  /** Confidence intervals for skill transferability */
  transferability: ConfidenceInterval[];
  /** Key factors affecting optionality range */
  factors: OptionalityFactor[];
}

/**
 * Factor affecting optionality range
 */
export interface OptionalityFactor {
  /** Factor name */
  name: string;
  /** Impact on optionality (-1 to 1) */
  impact: number;
  /** Confidence in this factor (0-1) */
  confidence: number;
  /** Time decay factor (how quickly effect diminishes) */
  timeDecay: number;
}

/**
 * Regret exposure range modeling
 */
export interface RegretExposureRangeModel {
  /** Overall regret exposure range */
  overall: ConfidenceInterval[];
  /** Regret by category */
  byCategory: Map<RegretCategory, ConfidenceInterval[]>;
  /** Time-based regret trajectory */
  overTime: RegretTimePoint[];
  /** Factors contributing to regret exposure */
  factors: RegretFactor[];
  /** Comparison to alternative paths */
  vsAlternatives: RegretComparison[];
}

/**
 * Category of potential regret
 */
export type RegretCategory =
  | 'financial'
  | 'opportunity-cost'
  | 'lifestyle-mismatch'
  | 'value-misalignment'
  | 'skill-obsolescence'
  | 'relationship-impact'
  | 'health-impact';

/**
 * Regret at a specific time point
 */
export interface RegretTimePoint {
  /** Year */
  year: number;
  /** Regret range at this point */
  range: ConfidenceInterval[];
  /** Primary drivers at this point */
  drivers: string[];
}

/**
 * Factor affecting regret exposure
 */
export interface RegretFactor {
  /** Factor name */
  name: string;
  /** Category */
  category: RegretCategory;
  /** Contribution to regret (0-1) */
  contribution: number;
  /** Whether this is mitigable */
  isMitigable: boolean;
  /** Mitigation strategies */
  mitigations: string[];
}

/**
 * Regret comparison to alternative path
 */
export interface RegretComparison {
  /** Alternative path ID */
  alternativePathId: string;
  /** Alternative path name */
  alternativeName: string;
  /** Regret differential (positive = this path has more regret) */
  differential: ConfidenceInterval[];
  /** Key differences */
  keyDifferences: string[];
}

/**
 * Coalition stability range modeling
 */
export interface CoalitionStabilityRangeModel {
  /** Overall stability range */
  overall: ConfidenceInterval[];
  /** Stability by coalition member */
  byMember: Map<string, ConfidenceInterval[]>;
  /** Stability over time */
  overTime: CoalitionStabilityTimePoint[];
  /** Conflict likelihood range */
  conflictLikelihood: ConfidenceInterval[];
  /** Resolution probability range */
  resolutionProbability: ConfidenceInterval[];
  /** Factors affecting stability */
  factors: CoalitionStabilityFactor[];
}

/**
 * Coalition stability at a time point
 */
export interface CoalitionStabilityTimePoint {
  /** Year */
  year: number;
  /** Stability range */
  stability: ConfidenceInterval[];
  /** Primary stressors */
  stressors: string[];
  /** Support factors */
  supports: string[];
}

/**
 * Factor affecting coalition stability
 */
export interface CoalitionStabilityFactor {
  /** Factor name */
  name: string;
  /** Impact on stability (-1 to 1) */
  impact: number;
  /** Confidence in factor (0-1) */
  confidence: number;
  /** Whether factor is dynamic (changes over time) */
  isDynamic: boolean;
  /** Time horizon of impact */
  timeHorizon: 'immediate' | 'short-term' | 'medium-term' | 'long-term';
}

/**
 * Career satisfaction likelihood range
 */
export interface SatisfactionLikelihoodRangeModel {
  /** Overall satisfaction likelihood */
  overall: ConfidenceInterval[];
  /** Satisfaction by dimension */
  byDimension: Map<SatisfactionDimension, ConfidenceInterval[]>;
  /** Satisfaction trajectory over time */
  overTime: SatisfactionTimePoint[];
  /** Alignment with student values */
  valueAlignment: ConfidenceInterval[];
  /** Alignment with student strengths */
  strengthAlignment: ConfidenceInterval[];
  /** Factors affecting satisfaction */
  factors: SatisfactionFactor[];
}

/**
 * Dimension of career satisfaction
 */
export type SatisfactionDimension =
  | 'compensation'
  | 'work-life-balance'
  | 'growth-opportunities'
  | 'purpose-alignment'
  | 'autonomy'
  | 'social-impact'
  | 'recognition'
  | 'job-security';

/**
 * Satisfaction at a time point
 */
export interface SatisfactionTimePoint {
  /** Year */
  year: number;
  /** Satisfaction range */
  range: ConfidenceInterval[];
  /** Primary contributors */
  contributors: string[];
  /** Primary detractors */
  detractors: string[];
}

/**
 * Factor affecting satisfaction
 */
export interface SatisfactionFactor {
  /** Factor name */
  name: string;
  /** Dimension affected */
  dimension: SatisfactionDimension;
  /** Impact on satisfaction (-1 to 1) */
  impact: number;
  /** Confidence in factor (0-1) */
  confidence: number;
  /** Whether factor is controllable */
  isControllable: boolean;
}

/**
 * Complete outcome range model for a scenario
 */
export interface ScenarioOutcomeModel {
  /** Scenario ID */
  scenarioId: string;
  /** Scenario type */
  scenarioType: ScenarioType;
  /** Modeled year range */
  yearRange: {
    start: number;
    end: number;
  };
  /** Income range models by year */
  incomeRanges: IncomeRangeModel[];
  /** Optionality range models by year */
  optionalityRanges: OptionalityRangeModel[];
  /** Regret exposure model */
  regretExposure: RegretExposureRangeModel;
  /** Coalition stability model */
  coalitionStability: CoalitionStabilityRangeModel;
  /** Satisfaction likelihood model */
  satisfactionLikelihood: SatisfactionLikelihoodRangeModel;
  /** Cross-metric correlations */
  correlations: MetricCorrelation[];
  /** Overall confidence assessment */
  overallConfidence: OverallConfidenceAssessment;
  /** Generated timestamp */
  generatedAt: number;
}

/**
 * Correlation between outcome metrics
 */
export interface MetricCorrelation {
  /** First metric */
  metricA: OutcomeMetric;
  /** Second metric */
  metricB: OutcomeMetric;
  /** Correlation range (not point estimate) */
  correlation: ConfidenceInterval[];
  /** Interpretation */
  interpretation: string;
  /** Causation vs correlation note */
  causationNote: string;
}

/**
 * Outcome metrics that can be correlated
 */
export type OutcomeMetric =
  | 'income'
  | 'optionality'
  | 'regret'
  | 'coalition-stability'
  | 'satisfaction';

/**
 * Overall confidence assessment
 */
export interface OverallConfidenceAssessment {
  /** Overall confidence score (0-100) */
  score: number;
  /** Confidence level */
  level: 'very-high' | 'high' | 'moderate' | 'low' | 'very-low';
  /** Primary confidence drivers */
  drivers: string[];
  /** Primary uncertainty sources */
  uncertainties: string[];
  /** Recommendations to improve confidence */
  recommendations: string[];
}

/**
 * Input parameters for outcome modeling
 */
export interface OutcomeModelingInput {
  /** Scenario to model */
  scenario: FutureScenario;
  /** Student belief snapshot */
  studentBelief: StudentBeliefV3;
  /** Coalition analysis (optional) */
  coalitionAnalysis?: DecisionCoalitionAnalysis;
  /** Criticality analysis */
  criticalityAnalysis: CriticalityAnalysis;
  /** Optionality analysis */
  optionalityAnalysis: OptionalityAnalysis;
  /** Alternative scenarios for comparison (optional) */
  alternativeScenarios?: FutureScenario[];
}

/**
 * Output from outcome modeling
 */
export interface OutcomeModelingResult {
  /** Modeled scenario outcome */
  outcomeModel: ScenarioOutcomeModel;
  /** Input parameters used */
  input: {
    scenarioId: string;
    studentId: string;
    yearRange: { start: number; end: number };
  };
  /** Modeling metadata */
  metadata: {
    /** Statistical confidence levels used (NOT constitutional confidence) */
    confidenceLevelsUsed: StatisticalConfidence[];
    modelingApproach: string;
    assumptions: string[];
    limitations: string[];
  };
  /** Generated timestamp */
  generatedAt: number;
}

/**
 * Configuration for outcome modeling
 */
export interface OutcomeModelingConfig {
  /** Statistical confidence levels to calculate (NOT constitutional confidence) */
  confidenceLevels: StatisticalConfidence[];
  /** Range expansion factor for uncertainty */
  uncertaintyExpansionFactor: number;
  /** Income volatility factor by scenario type */
  incomeVolatilityFactors: Record<ScenarioType, number>;
  /** Optionality decay rates by scenario type */
  optionalityDecayRates: Record<ScenarioType, number>;
  /** Regret sensitivity factors */
  regretSensitivityFactors: Record<ScenarioType, number>;
  /** Coalition stability base rates */
  coalitionStabilityBaseRates: Record<ScenarioType, number>;
  /** Satisfaction base rates by scenario type */
  satisfactionBaseRates: Record<ScenarioType, number>;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_OUTCOME_MODELING_CONFIG: OutcomeModelingConfig = {
  confidenceLevels: [0.95, 0.80, 0.50],
  uncertaintyExpansionFactor: 1.5,
  incomeVolatilityFactors: {
    'best-case': 0.15,
    'expected': 0.25,
    'conservative': 0.20,
    'high-risk': 0.40,
  },
  optionalityDecayRates: {
    'best-case': 0.02,
    'expected': 0.05,
    'conservative': 0.03,
    'high-risk': 0.08,
  },
  regretSensitivityFactors: {
    'best-case': 0.20,
    'expected': 0.35,
    'conservative': 0.25,
    'high-risk': 0.50,
  },
  coalitionStabilityBaseRates: {
    'best-case': 0.85,
    'expected': 0.70,
    'conservative': 0.80,
    'high-risk': 0.55,
  },
  satisfactionBaseRates: {
    'best-case': 0.80,
    'expected': 0.65,
    'conservative': 0.70,
    'high-risk': 0.55,
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate range from point estimate and volatility
 */
function calculateRange(
  pointEstimate: number,
  volatility: number,
  confidenceLevel: StatisticalConfidence,
  maxValue: number = Number.MAX_SAFE_INTEGER
): OutcomeRange {
  // Z-scores for statistical confidence levels
  const zScores: Record<StatisticalConfidence, number> = {
    0.95: 1.96,
    0.80: 1.28,
    0.50: 0.67,
  };

  const z = zScores[confidenceLevel];
  const halfWidth = pointEstimate * volatility * z;

  const lower = Math.max(0, pointEstimate - halfWidth);
  const upper = Math.min(maxValue, pointEstimate + halfWidth);

  return {
    lower: Math.round(lower),
    upper: Math.round(upper),
    midpoint: Math.round((lower + upper) / 2),
    width: Math.round(upper - lower),
  };
}

/**
 * Create confidence interval with interpretation
 */
function createConfidenceInterval(
  level: StatisticalConfidence,
  pointEstimate: number,
  volatility: number,
  metricName: string,
  unit: string,
  maxValue: number = Number.MAX_SAFE_INTEGER
): ConfidenceInterval {
  const range = calculateRange(pointEstimate, volatility, level, maxValue);

  const interpretations: Record<StatisticalConfidence, string> = {
    0.95: `We are 95% confident that ${metricName} will fall between ${range.lower}${unit} and ${range.upper}${unit}. This is the widest range representing high uncertainty.`,
    0.80: `We are 80% confident that ${metricName} will fall between ${range.lower}${unit} and ${range.upper}${unit}. This represents moderate uncertainty.`,
    0.50: `We are 50% confident that ${metricName} will fall between ${range.lower}${unit} and ${range.upper}${unit}. This is the narrowest range with highest precision but lower confidence.`,
  };

  return {
    level,
    range,
    interpretation: interpretations[level],
  };
}

/**
 * Calculate income volatility based on scenario type and year
 */
function calculateIncomeVolatility(
  scenarioType: ScenarioType,
  year: number,
  config: OutcomeModelingConfig
): number {
  const baseVolatility = config.incomeVolatilityFactors[scenarioType];
  // Volatility increases slightly over time
  const timeFactor = 1 + (year * 0.02);
  return baseVolatility * timeFactor;
}

/**
 * Calculate optionality volatility
 */
function calculateOptionalityVolatility(
  scenarioType: ScenarioType,
  year: number,
  config: OutcomeModelingConfig
): number {
  const baseDecay = config.optionalityDecayRates[scenarioType];
  // Uncertainty increases as optionality decays
  return 0.15 + (baseDecay * year * 2);
}

/**
 * Generate income factors based on scenario
 */
function generateIncomeFactors(scenarioType: ScenarioType): IncomeFactor[] {
  const factorsByType: Record<ScenarioType, IncomeFactor[]> = {
    'best-case': [
      { name: 'Market Performance', impact: 0.3, confidence: 0.7, rangeImpact: 'shifts-up' },
      { name: 'Individual Performance', impact: 0.25, confidence: 0.8, rangeImpact: 'shifts-up' },
      { name: 'Network Effects', impact: 0.15, confidence: 0.6, rangeImpact: 'narrows' },
    ],
    'expected': [
      { name: 'Market Stability', impact: 0.1, confidence: 0.75, rangeImpact: 'narrows' },
      { name: 'Career Progression', impact: 0.2, confidence: 0.8, rangeImpact: 'shifts-up' },
      { name: 'Skill Development', impact: 0.15, confidence: 0.7, rangeImpact: 'shifts-up' },
    ],
    'conservative': [
      { name: 'Stable Employment', impact: 0.1, confidence: 0.9, rangeImpact: 'narrows' },
      { name: 'Limited Growth', impact: 0.05, confidence: 0.85, rangeImpact: 'shifts-down' },
      { name: 'Predictable Income', impact: 0.2, confidence: 0.9, rangeImpact: 'narrows' },
    ],
    'high-risk': [
      { name: 'Market Volatility', impact: 0.3, confidence: 0.6, rangeImpact: 'widens' },
      { name: 'Performance Variance', impact: 0.35, confidence: 0.5, rangeImpact: 'widens' },
      { name: 'Opportunity Risk', impact: 0.2, confidence: 0.4, rangeImpact: 'widens' },
    ],
  };

  return factorsByType[scenarioType];
}

/**
 * Generate optionality factors
 */
function generateOptionalityFactors(scenarioType: ScenarioType): OptionalityFactor[] {
  const factorsByType: Record<ScenarioType, OptionalityFactor[]> = {
    'best-case': [
      { name: 'Skill Diversification', impact: 0.2, confidence: 0.75, timeDecay: 0.05 },
      { name: 'Network Expansion', impact: 0.15, confidence: 0.7, timeDecay: 0.03 },
      { name: 'Market Position', impact: 0.25, confidence: 0.8, timeDecay: 0.02 },
    ],
    'expected': [
      { name: 'Career Specialization', impact: -0.1, confidence: 0.8, timeDecay: 0.08 },
      { name: 'Skill Maintenance', impact: 0.1, confidence: 0.75, timeDecay: 0.05 },
      { name: 'Industry Changes', impact: 0.05, confidence: 0.6, timeDecay: 0.1 },
    ],
    'conservative': [
      { name: 'Stable Skill Set', impact: -0.05, confidence: 0.85, timeDecay: 0.03 },
      { name: 'Limited Pivot Options', impact: -0.15, confidence: 0.8, timeDecay: 0.04 },
      { name: 'Predictable Trajectory', impact: 0.1, confidence: 0.9, timeDecay: 0.02 },
    ],
    'high-risk': [
      { name: 'Deep Specialization', impact: -0.3, confidence: 0.7, timeDecay: 0.1 },
      { name: 'Niche Expertise', impact: -0.2, confidence: 0.6, timeDecay: 0.12 },
      { name: 'Limited Transferability', impact: -0.25, confidence: 0.65, timeDecay: 0.08 },
    ],
  };

  return factorsByType[scenarioType];
}

/**
 * Generate regret factors based on student values
 */
function generateRegretFactors(
  studentBelief: StudentBeliefV3,
  scenarioType: ScenarioType,
  config: OutcomeModelingConfig
): RegretFactor[] {
  const factors: RegretFactor[] = [];
  const sensitivity = config.regretSensitivityFactors[scenarioType];

  // Financial regret
  factors.push({
    name: 'Income vs Expectations',
    category: 'financial',
    contribution: 0.2 * sensitivity,
    isMitigable: true,
    mitigations: ['Negotiate salary', 'Develop side income', 'Pursue promotions'],
  });

  // Opportunity cost regret
  factors.push({
    name: 'Alternative Path Outcomes',
    category: 'opportunity-cost',
    contribution: 0.25 * sensitivity,
    isMitigable: false,
    mitigations: ['Revisit decision periodically', 'Keep options open'],
  });

  // Value misalignment
  const nonNegotiableValues = studentBelief.values.filter(v => v.isNonNegotiable);
  if (nonNegotiableValues.length > 0) {
    factors.push({
      name: 'Non-Negotiable Value Conflict',
      category: 'value-misalignment',
      contribution: 0.3 * sensitivity,
      isMitigable: true,
      mitigations: ['Advocate for value alignment', 'Seek value-aligned roles'],
    });
  }

  // Lifestyle mismatch
  factors.push({
    name: 'Work-Life Balance',
    category: 'lifestyle-mismatch',
    contribution: 0.15 * sensitivity,
    isMitigable: true,
    mitigations: ['Set boundaries', 'Negotiate flexibility', 'Prioritize self-care'],
  });

  // Skill obsolescence
  factors.push({
    name: 'Skill Relevance',
    category: 'skill-obsolescence',
    contribution: 0.1 * sensitivity,
    isMitigable: true,
    mitigations: ['Continuous learning', 'Skill diversification', 'Stay current with trends'],
  });

  return factors;
}

/**
 * Generate coalition stability factors
 */
function generateCoalitionStabilityFactors(
  scenarioType: ScenarioType,
  coalitionAnalysis?: DecisionCoalitionAnalysis
): CoalitionStabilityFactor[] {
  const factors: CoalitionStabilityFactor[] = [];

  // Base factors by scenario type
  const baseFactors: Record<ScenarioType, CoalitionStabilityFactor[]> = {
    'best-case': [
      { name: 'Success Validation', impact: 0.3, confidence: 0.8, isDynamic: true, timeHorizon: 'short-term' },
      { name: 'Family Pride', impact: 0.2, confidence: 0.75, isDynamic: false, timeHorizon: 'long-term' },
    ],
    'expected': [
      { name: 'Steady Progress', impact: 0.15, confidence: 0.8, isDynamic: true, timeHorizon: 'medium-term' },
      { name: 'Predictable Outcomes', impact: 0.1, confidence: 0.85, isDynamic: false, timeHorizon: 'long-term' },
    ],
    'conservative': [
      { name: 'Safety Preference', impact: 0.25, confidence: 0.9, isDynamic: false, timeHorizon: 'long-term' },
      { name: 'Low Risk Tolerance', impact: 0.15, confidence: 0.85, isDynamic: false, timeHorizon: 'long-term' },
    ],
    'high-risk': [
      { name: 'Uncertainty Stress', impact: -0.3, confidence: 0.7, isDynamic: true, timeHorizon: 'immediate' },
      { name: 'Potential Disappointment', impact: -0.25, confidence: 0.6, isDynamic: true, timeHorizon: 'short-term' },
      { name: 'Conflict Over Risk', impact: -0.2, confidence: 0.65, isDynamic: true, timeHorizon: 'immediate' },
    ],
  };

  factors.push(...baseFactors[scenarioType]);

  // Add coalition-specific factors if available
  if (coalitionAnalysis) {
    const health = coalitionAnalysis.coalitionHealth;

    if (health.cohesion < 60) {
      factors.push({
        name: 'Low Coalition Cohesion',
        impact: -0.2,
        confidence: 0.8,
        isDynamic: true,
        timeHorizon: 'immediate',
      });
    }

    if (health.conflictLevel > 50) {
      factors.push({
        name: 'High Conflict Level',
        impact: -0.25,
        confidence: 0.75,
        isDynamic: true,
        timeHorizon: 'immediate',
      });
    }
  }

  return factors;
}

/**
 * Generate satisfaction factors
 */
function generateSatisfactionFactors(
  studentBelief: StudentBeliefV3,
  scenarioType: ScenarioType,
  config: OutcomeModelingConfig
): SatisfactionFactor[] {
  const factors: SatisfactionFactor[] = [];
  const baseRate = config.satisfactionBaseRates[scenarioType];

  // Compensation satisfaction
  factors.push({
    name: 'Income Level',
    dimension: 'compensation',
    impact: baseRate * 0.2,
    confidence: 0.75,
    isControllable: true,
  });

  // Work-life balance
  const wlbValue = studentBelief.values.find(v => v.name.toLowerCase().includes('work-life') || v.name.toLowerCase().includes('balance'));
  if (wlbValue) {
    factors.push({
      name: 'Work-Life Alignment',
      dimension: 'work-life-balance',
      impact: wlbValue.importance * 0.25,
      confidence: 0.7,
      isControllable: true,
    });
  }

  // Growth opportunities
  const achievementMotivation = studentBelief.motivations.find(m => m.name.toLowerCase().includes('achievement'));
  if (achievementMotivation) {
    factors.push({
      name: 'Growth Opportunity Alignment',
      dimension: 'growth-opportunities',
      impact: achievementMotivation.strength * 0.2,
      confidence: 0.75,
      isControllable: false,
    });
  }

  // Purpose alignment
  const impactMotivation = studentBelief.motivations.find(m => m.name.toLowerCase().includes('impact'));
  if (impactMotivation) {
    factors.push({
      name: 'Purpose Alignment',
      dimension: 'purpose-alignment',
      impact: impactMotivation.strength * 0.3,
      confidence: 0.65,
      isControllable: false,
    });
  }

  // Autonomy
  const autonomyTrait = studentBelief.personalityTraits.find(t => t.dimension === 'AUTONOMY');
  if (autonomyTrait) {
    factors.push({
      name: 'Autonomy Match',
      dimension: 'autonomy',
      impact: autonomyTrait.position * 0.15,
      confidence: 0.7,
      isControllable: true,
    });
  }

  return factors;
}

// ============================================================================
// MAIN MODELING ENGINE
// ============================================================================

export class OutcomeModelingEngine {
  private config: OutcomeModelingConfig;

  constructor(config: Partial<OutcomeModelingConfig> = {}) {
    this.config = {
      ...DEFAULT_OUTCOME_MODELING_CONFIG,
      ...config,
    };
  }

  /**
   * Generate outcome range model for a scenario
   */
  modelOutcomes(input: OutcomeModelingInput): OutcomeModelingResult {
    const { scenario, studentBelief, coalitionAnalysis, criticalityAnalysis, optionalityAnalysis } = input;

    const startYear = scenario.careerStates[0]?.year || new Date().getFullYear();
    const endYear = startYear + scenario.timelineYears;

    // Model income ranges
    const incomeRanges = this.modelIncomeRanges(scenario);

    // Model optionality ranges
    const optionalityRanges = this.modelOptionalityRanges(scenario, optionalityAnalysis);

    // Model regret exposure
    const regretExposure = this.modelRegretExposure(scenario, studentBelief, input.alternativeScenarios);

    // Model coalition stability
    const coalitionStability = this.modelCoalitionStability(scenario, coalitionAnalysis);

    // Model satisfaction likelihood
    const satisfactionLikelihood = this.modelSatisfactionLikelihood(scenario, studentBelief);

    // Calculate correlations
    const correlations = this.calculateCorrelations(
      incomeRanges,
      optionalityRanges,
      regretExposure,
      coalitionStability,
      satisfactionLikelihood
    );

    // Assess overall confidence
    const overallConfidence = this.assessOverallConfidence(
      scenario,
      studentBelief,
      coalitionAnalysis,
      criticalityAnalysis
    );

    const outcomeModel: ScenarioOutcomeModel = {
      scenarioId: scenario.id,
      scenarioType: scenario.type,
      yearRange: { start: startYear, end: endYear },
      incomeRanges,
      optionalityRanges,
      regretExposure,
      coalitionStability,
      satisfactionLikelihood,
      correlations,
      overallConfidence,
      generatedAt: Date.now(),
    };

    return {
      outcomeModel,
      input: {
        scenarioId: scenario.id,
        studentId: studentBelief.studentId,
        yearRange: { start: startYear, end: endYear },
      },
      metadata: {
        confidenceLevelsUsed: this.config.confidenceLevels,
        modelingApproach: 'Deterministic range modeling with confidence intervals',
        assumptions: [
          'Ranges represent plausible outcomes, not predictions',
          'Confidence intervals based on historical variance patterns',
          'Correlations are directional, not causal',
          'Student belief stability assumed over modeling period',
        ],
        limitations: [
          'Does not account for black swan events',
          'Assumes linear progression patterns',
          'Limited by quality of input data',
          'Cannot model individual-specific outcomes',
        ],
      },
      generatedAt: Date.now(),
    };
  }

  /**
   * Model income ranges for each year
   */
  private modelIncomeRanges(scenario: FutureScenario): IncomeRangeModel[] {
    return scenario.incomeTrajectory.map((point, index) => {
      const year = point.year;
      const volatility = calculateIncomeVolatility(scenario.type, index, this.config);

      // Annual income intervals
      const annual = this.config.confidenceLevels.map(level =>
        createConfidenceInterval(level, point.annualIncome, volatility, 'annual income', ' INR')
      );

      // Monthly income intervals
      const monthly = this.config.confidenceLevels.map(level =>
        createConfidenceInterval(level, point.monthlyIncome, volatility, 'monthly income', ' INR')
      );

      // Cumulative income intervals
      const cumulativePoint = scenario.incomeTrajectory
        .slice(0, index + 1)
        .reduce((sum, p) => sum + p.annualIncome, 0);
      const cumulativeVolatility = volatility * Math.sqrt(index + 1); // Variance accumulates
      const cumulative = this.config.confidenceLevels.map(level =>
        createConfidenceInterval(level, cumulativePoint, cumulativeVolatility, 'cumulative income', ' INR')
      );

      // Growth rate intervals
      const growthRate = this.config.confidenceLevels.map(level => {
        const baseGrowth = point.growthRate;
        const range = calculateRange(baseGrowth, volatility * 0.5, level);
        return {
          level,
          range: {
            ...range,
            lower: Math.max(-0.5, range.lower / 1000000), // Normalize to percentage
            upper: Math.min(1.0, range.upper / 1000000),
            midpoint: (Math.max(-0.5, range.lower / 1000000) + Math.min(1.0, range.upper / 1000000)) / 2,
            width: Math.min(1.0, range.upper / 1000000) - Math.max(-0.5, range.lower / 1000000),
          },
          interpretation: `Growth rate between ${(Math.max(-0.5, range.lower / 1000000) * 100).toFixed(1)}% and ${(Math.min(1.0, range.upper / 1000000) * 100).toFixed(1)}%`,
        };
      });

      return {
        year,
        annual,
        monthly,
        cumulative,
        growthRate,
        factors: generateIncomeFactors(scenario.type),
      };
    });
  }

  /**
   * Model optionality ranges for each year
   */
  private modelOptionalityRanges(
    scenario: FutureScenario,
    optionalityAnalysis: OptionalityAnalysis
  ): OptionalityRangeModel[] {
    return scenario.flexibilityTrajectory.map((point, index) => {
      const year = point.year;
      const volatility = calculateOptionalityVolatility(scenario.type, index, this.config);

      // Optionality score intervals (capped at 100)
      const score = this.config.confidenceLevels.map(level =>
        createConfidenceInterval(level, point.optionalityScore, volatility, 'optionality score', '', 100)
      );

      // Reachable careers intervals
      const reachableCareers = this.config.confidenceLevels.map(level =>
        createConfidenceInterval(level, point.reachableOptions, volatility, 'reachable careers', ' careers')
      );

      // Pivot potential intervals (capped at 100)
      const pivotPotential = this.config.confidenceLevels.map(level =>
        createConfidenceInterval(level, point.pivotPotential, volatility, 'pivot potential', '%', 100)
      );

      // Transferability intervals (capped at 100)
      const transferability = this.config.confidenceLevels.map(level =>
        createConfidenceInterval(level, point.skillTransferability, volatility, 'skill transferability', '%', 100)
      );

      return {
        year,
        score,
        reachableCareers,
        pivotPotential,
        transferability,
        factors: generateOptionalityFactors(scenario.type),
      };
    });
  }

  /**
   * Model regret exposure ranges
   */
  private modelRegretExposure(
    scenario: FutureScenario,
    studentBelief: StudentBeliefV3,
    alternativeScenarios?: FutureScenario[]
  ): RegretExposureRangeModel {
    const factors = generateRegretFactors(studentBelief, scenario.type, this.config);
    const baseRegret = factors.reduce((sum, f) => sum + f.contribution, 0);

    // Overall regret intervals
    const overall = this.config.confidenceLevels.map(level => {
      const volatility = 0.3; // Regret is inherently uncertain
      return createConfidenceInterval(level, baseRegret * 100, volatility, 'regret exposure', '%');
    });

    // Regret by category
    const byCategory = new Map<RegretCategory, ConfidenceInterval[]>();
    const categories: RegretCategory[] = [
      'financial', 'opportunity-cost', 'lifestyle-mismatch', 'value-misalignment',
      'skill-obsolescence', 'relationship-impact', 'health-impact',
    ];

    categories.forEach(category => {
      const categoryFactors = factors.filter(f => f.category === category);
      const categoryRegret = categoryFactors.reduce((sum, f) => sum + f.contribution, 0);

      byCategory.set(
        category,
        this.config.confidenceLevels.map(level =>
          createConfidenceInterval(level, categoryRegret * 100, 0.35, `${category} regret`, '%')
        )
      );
    });

    // Regret over time
    const overTime: RegretTimePoint[] = [];
    for (let i = 0; i < scenario.timelineYears; i += 2) {
      const year = (scenario.careerStates[0]?.year || 2024) + i;
      // Regret typically increases mid-career then decreases
      const timeFactor = 1 + Math.sin((i / scenario.timelineYears) * Math.PI) * 0.3;
      const timeRegret = baseRegret * timeFactor;

      overTime.push({
        year,
        range: this.config.confidenceLevels.map(level =>
          createConfidenceInterval(level, timeRegret * 100, 0.4, 'regret exposure', '%')
        ),
        drivers: factors.filter(f => f.contribution > 0.15).map(f => f.name),
      });
    }

    // Comparison to alternatives
    const vsAlternatives: RegretComparison[] = [];
    if (alternativeScenarios) {
      alternativeScenarios.forEach(alt => {
        if (alt.id !== scenario.id) {
          // Simplified differential calculation
          const differential = alt.metrics.averageIncome - scenario.metrics.averageIncome;
          const normalizedDiff = (differential / 1000000) * 10; // Scale to regret units

          vsAlternatives.push({
            alternativePathId: alt.basePathId,
            alternativeName: alt.name,
            differential: this.config.confidenceLevels.map(level =>
              createConfidenceInterval(level, normalizedDiff, 0.5, 'regret differential', ' points')
            ),
            keyDifferences: [
              `Income difference: ${Math.abs(differential).toLocaleString()} INR`,
              `Optionality difference: ${alt.metrics.finalOptionality - scenario.metrics.finalOptionality} points`,
            ],
          });
        }
      });
    }

    return {
      overall,
      byCategory,
      overTime,
      factors,
      vsAlternatives,
    };
  }

  /**
   * Model coalition stability ranges
   */
  private modelCoalitionStability(
    scenario: FutureScenario,
    coalitionAnalysis?: DecisionCoalitionAnalysis
  ): CoalitionStabilityRangeModel {
    const factors = generateCoalitionStabilityFactors(scenario.type, coalitionAnalysis);
    const baseStability = this.config.coalitionStabilityBaseRates[scenario.type];

    // Adjust based on factors
    const factorAdjustment = factors.reduce((sum, f) => sum + f.impact, 0);
    const adjustedStability = Math.max(0, Math.min(1, baseStability + factorAdjustment));

    // Overall stability intervals (capped at 100)
    const overall = this.config.confidenceLevels.map(level => {
      const volatility = 0.15;
      return createConfidenceInterval(level, adjustedStability * 100, volatility, 'coalition stability', '%', 100);
    });

    // By member (simplified - would use actual coalition members)
    const byMember = new Map<string, ConfidenceInterval[]>();
    const members = ['student-interests', 'family-expectations', 'economic-reality'];
    members.forEach(member => {
      const memberStability = Math.min(1, adjustedStability * (0.8 + (members.indexOf(member) * 0.1))); // Variation by member
      byMember.set(
        member,
        this.config.confidenceLevels.map(level =>
          createConfidenceInterval(level, memberStability * 100, 0.2, `${member} stability`, '%', 100)
        )
      );
    });

    // Over time
    const overTime: CoalitionStabilityTimePoint[] = [];
    for (let i = 0; i < scenario.timelineYears; i += 2) {
      const year = (scenario.careerStates[0]?.year || 2024) + i;
      // Stability tends to increase as outcomes materialize
      const timeBonus = (i / scenario.timelineYears) * 0.1;
      const timeStability = Math.min(1, adjustedStability + timeBonus);

      overTime.push({
        year,
        stability: this.config.confidenceLevels.map(level =>
          createConfidenceInterval(level, timeStability * 100, 0.18, 'coalition stability', '%', 100)
        ),
        stressors: factors.filter(f => f.impact < 0).map(f => f.name),
        supports: factors.filter(f => f.impact > 0).map(f => f.name),
      });
    }

    // Conflict likelihood (capped at 100)
    const conflictLikelihood = this.config.confidenceLevels.map(level => {
      const baseConflict = 1 - adjustedStability;
      return createConfidenceInterval(level, baseConflict * 100, 0.25, 'conflict likelihood', '%', 100);
    });

    // Resolution probability (capped at 100)
    const resolutionProbability = this.config.confidenceLevels.map(level => {
      const baseResolution = adjustedStability * 0.8;
      return createConfidenceInterval(level, baseResolution * 100, 0.2, 'conflict resolution probability', '%', 100);
    });

    return {
      overall,
      byMember,
      overTime,
      conflictLikelihood,
      resolutionProbability,
      factors,
    };
  }

  /**
   * Model satisfaction likelihood ranges
   */
  private modelSatisfactionLikelihood(
    scenario: FutureScenario,
    studentBelief: StudentBeliefV3
  ): SatisfactionLikelihoodRangeModel {
    const factors = generateSatisfactionFactors(studentBelief, scenario.type, this.config);
    const baseSatisfaction = this.config.satisfactionBaseRates[scenario.type];

    // Adjust based on factors
    const factorAdjustment = factors.reduce((sum, f) => sum + f.impact, 0);
    const adjustedSatisfaction = Math.max(0, Math.min(1, baseSatisfaction + factorAdjustment));

    // Overall satisfaction intervals (capped at 100)
    const overall = this.config.confidenceLevels.map(level => {
      const volatility = 0.2;
      return createConfidenceInterval(level, adjustedSatisfaction * 100, volatility, 'satisfaction likelihood', '%', 100);
    });

    // By dimension (capped at 100)
    const byDimension = new Map<SatisfactionDimension, ConfidenceInterval[]>();
    const dimensions: SatisfactionDimension[] = [
      'compensation', 'work-life-balance', 'growth-opportunities', 'purpose-alignment',
      'autonomy', 'social-impact', 'recognition', 'job-security',
    ];

    dimensions.forEach(dimension => {
      const dimensionFactors = factors.filter(f => f.dimension === dimension);
      const dimensionSatisfaction = dimensionFactors.length > 0
        ? Math.min(1, baseSatisfaction + dimensionFactors.reduce((sum, f) => sum + f.impact, 0))
        : baseSatisfaction * 0.8; // Default if no specific factors

      byDimension.set(
        dimension,
        this.config.confidenceLevels.map(level =>
          createConfidenceInterval(level, Math.max(0, dimensionSatisfaction) * 100, 0.25, `${dimension} satisfaction`, '%', 100)
        )
      );
    });

    // Over time (capped at 100)
    const overTime: SatisfactionTimePoint[] = [];
    for (let i = 0; i < scenario.timelineYears; i += 2) {
      const year = (scenario.careerStates[0]?.year || 2024) + i;
      // Satisfaction tends to follow U-curve (honeymoon, dip, recovery)
      const timeFactor = 1 - Math.sin((i / scenario.timelineYears) * Math.PI) * 0.15;
      const timeSatisfaction = adjustedSatisfaction * timeFactor;

      overTime.push({
        year,
        range: this.config.confidenceLevels.map(level =>
          createConfidenceInterval(level, timeSatisfaction * 100, 0.22, 'satisfaction likelihood', '%', 100)
        ),
        contributors: factors.filter(f => f.impact > 0.1).map(f => f.name),
        detractors: factors.filter(f => f.impact < -0.05).map(f => f.name),
      });
    }

    // Value alignment (capped at 100)
    const valueAlignment = this.config.confidenceLevels.map(level => {
      const alignment = studentBelief.values.reduce((sum, v) => sum + v.importance, 0) / studentBelief.values.length;
      return createConfidenceInterval(level, alignment * 100, 0.15, 'value alignment', '%', 100);
    });

    // Strength alignment (capped at 100)
    const strengthAlignment = this.config.confidenceLevels.map(level => {
      const alignment = studentBelief.strengths.reduce((sum, s) => sum + s.level, 0) / studentBelief.strengths.length;
      return createConfidenceInterval(level, alignment * 100, 0.18, 'strength alignment', '%', 100);
    });

    return {
      overall,
      byDimension,
      overTime,
      valueAlignment,
      strengthAlignment,
      factors,
    };
  }

  /**
   * Calculate correlations between outcome metrics
   */
  private calculateCorrelations(
    incomeRanges: IncomeRangeModel[],
    optionalityRanges: OptionalityRangeModel[],
    regretExposure: RegretExposureRangeModel,
    coalitionStability: CoalitionStabilityRangeModel,
    satisfactionLikelihood: SatisfactionLikelihoodRangeModel
  ): MetricCorrelation[] {
    const correlations: MetricCorrelation[] = [];

    // Income-Optionality correlation (typically negative)
    correlations.push({
      metricA: 'income',
      metricB: 'optionality',
      correlation: this.config.confidenceLevels.map(level => {
        const pointEstimate = -0.4; // Higher income often means lower optionality
        const range = calculateRange(pointEstimate, 0.3, level);
        return {
          level,
          range: {
            lower: Math.max(-1, range.lower / 100),
            upper: Math.min(1, range.upper / 100),
            midpoint: (Math.max(-1, range.lower / 100) + Math.min(1, range.upper / 100)) / 2,
            width: Math.min(1, range.upper / 100) - Math.max(-1, range.lower / 100),
          },
          interpretation: `Income and optionality are ${pointEstimate < 0 ? 'negatively' : 'positively'} correlated`,
        };
      }),
      interpretation: 'Higher income typically comes with reduced career flexibility',
      causationNote: 'Correlation does not imply causation - both may be driven by career specialization',
    });

    // Income-Satisfaction correlation (moderate positive)
    correlations.push({
      metricA: 'income',
      metricB: 'satisfaction',
      correlation: this.config.confidenceLevels.map(level => {
        const pointEstimate = 0.35;
        const range = calculateRange(pointEstimate, 0.25, level);
        return {
          level,
          range: {
            lower: Math.max(-1, range.lower / 100),
            upper: Math.min(1, range.upper / 100),
            midpoint: (Math.max(-1, range.lower / 100) + Math.min(1, range.upper / 100)) / 2,
            width: Math.min(1, range.upper / 100) - Math.max(-1, range.lower / 100),
          },
          interpretation: `Income and satisfaction are moderately correlated`,
        };
      }),
      interpretation: 'Income contributes to but does not determine satisfaction',
      causationNote: 'Diminishing returns expected at higher income levels',
    });

    // Regret-Coalition Stability correlation (negative)
    correlations.push({
      metricA: 'regret',
      metricB: 'coalition-stability',
      correlation: this.config.confidenceLevels.map(level => {
        const pointEstimate = -0.5;
        const range = calculateRange(pointEstimate, 0.35, level);
        return {
          level,
          range: {
            lower: Math.max(-1, range.lower / 100),
            upper: Math.min(1, range.upper / 100),
            midpoint: (Math.max(-1, range.lower / 100) + Math.min(1, range.upper / 100)) / 2,
            width: Math.min(1, range.upper / 100) - Math.max(-1, range.lower / 100),
          },
          interpretation: `Regret and coalition stability are negatively correlated`,
        };
      }),
      interpretation: 'Higher regret often leads to reduced coalition stability',
      causationNote: 'Family conflict may increase as career outcomes disappoint',
    });

    // Optionality-Regret correlation (negative)
    correlations.push({
      metricA: 'optionality',
      metricB: 'regret',
      correlation: this.config.confidenceLevels.map(level => {
        const pointEstimate = -0.45;
        const range = calculateRange(pointEstimate, 0.3, level);
        return {
          level,
          range: {
            lower: Math.max(-1, range.lower / 100),
            upper: Math.min(1, range.upper / 100),
            midpoint: (Math.max(-1, range.lower / 100) + Math.min(1, range.upper / 100)) / 2,
            width: Math.min(1, range.upper / 100) - Math.max(-1, range.lower / 100),
          },
          interpretation: `Optionality and regret are negatively correlated`,
        };
      }),
      interpretation: 'Higher optionality reduces potential for regret',
      causationNote: 'Having options reduces opportunity cost regret',
    });

    return correlations;
  }

  /**
   * Assess overall confidence in the model
   */
  private assessOverallConfidence(
    scenario: FutureScenario,
    studentBelief: StudentBeliefV3,
    coalitionAnalysis?: DecisionCoalitionAnalysis,
    criticalityAnalysis?: CriticalityAnalysis
  ): OverallConfidenceAssessment {
    let score = 70; // Base confidence

    // Adjust based on student belief confidence
    score += (studentBelief.overallConfidence - 0.5) * 20;

    // Adjust based on coalition stability
    if (coalitionAnalysis) {
      score += (coalitionAnalysis.coalitionHealth.cohesion - 50) * 0.3;
      score -= (coalitionAnalysis.coalitionHealth.conflictLevel - 30) * 0.2;
    }

    // Adjust based on criticality (lower criticality = higher confidence)
    if (criticalityAnalysis) {
      score += (50 - criticalityAnalysis.criticalityScore) * 0.3;
    }

    // Adjust based on scenario type
    const scenarioAdjustments: Record<ScenarioType, number> = {
      'best-case': -10, // Less confident in best case
      'expected': 5,    // Most confident in expected
      'conservative': 10, // Very confident in conservative
      'high-risk': -20, // Low confidence in high-risk
    };
    score += scenarioAdjustments[scenario.type];

    // Clamp to valid range
    score = Math.max(20, Math.min(95, score));

    // Determine level
    let level: OverallConfidenceAssessment['level'];
    if (score >= 85) level = 'very-high';
    else if (score >= 70) level = 'high';
    else if (score >= 55) level = 'moderate';
    else if (score >= 40) level = 'low';
    else level = 'very-low';

    return {
      score: Math.round(score),
      level,
      drivers: [
        'Student belief confidence: ' + (studentBelief.overallConfidence > 0.7 ? 'High' : 'Moderate'),
        coalitionAnalysis ? `Coalition cohesion: ${coalitionAnalysis.coalitionHealth.cohesion}%` : 'No coalition data',
        `Scenario type: ${scenario.type}`,
      ],
      uncertainties: [
        'Market conditions beyond 3 years',
        'Individual performance variation',
        'Family dynamics changes',
        'Technology disruption impacts',
      ],
      recommendations: [
        'Reassess beliefs periodically',
        'Monitor coalition health',
        'Update model with actual outcomes',
        'Consider scenario diversification',
      ],
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a new Outcome Modeling Engine instance
 */
export function createOutcomeModelingEngine(
  config?: Partial<OutcomeModelingConfig>
): OutcomeModelingEngine {
  return new OutcomeModelingEngine(config);
}

/**
 * Model outcomes with default configuration
 */
export function modelOutcomes(
  input: OutcomeModelingInput
): OutcomeModelingResult {
  const engine = new OutcomeModelingEngine();
  return engine.modelOutcomes(input);
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  // ConfidenceLevel renamed to StatisticalConfidence to avoid confusion with constitutional Confidence
  StatisticalConfidence,
  OutcomeRange,
  ConfidenceInterval,
  IncomeRangeModel,
  IncomeFactor,
  OptionalityRangeModel,
  OptionalityFactor,
  RegretExposureRangeModel,
  RegretCategory,
  RegretTimePoint,
  RegretFactor,
  RegretComparison,
  CoalitionStabilityRangeModel,
  CoalitionStabilityTimePoint,
  CoalitionStabilityFactor,
  SatisfactionLikelihoodRangeModel,
  SatisfactionDimension,
  SatisfactionTimePoint,
  SatisfactionFactor,
  ScenarioOutcomeModel,
  MetricCorrelation,
  OutcomeMetric,
  OverallConfidenceAssessment,
  OutcomeModelingInput,
  OutcomeModelingResult,
  OutcomeModelingConfig,
};
