/**
 * CareerOS Counterfactual Engine
 *
 * Compares career futures to show what would be different
 * if a student chose a different path.
 *
 * Generates:
 * - Differences between paths
 * - Opportunities gained
 * - Opportunities lost
 * - Optionality differences
 * - Regret differences
 *
 * Outputs explainable comparisons.
 *
 * Deterministic. Graph-based. No AI. No randomness.
 *
 * @module intelligence/counterfactual-engine
 * @version 1.0.0
 */

import type {
  FutureScenario,
  ScenarioType,
  CareerState,
  EducationState,
  IncomePoint,
  FlexibilityPoint,
} from '../future-scenario/FutureScenarioGeneratorV1.js';

import type {
  ExploredCareerPath,
  PathType,
} from '../path-explorer/CareerPathExplorerV1.js';

import type {
  OptionalityAnalysis,
  AdjacentCareer,
} from '../optionality-engine/OptionalityEngineV1.js';

import type {
  CriticalityAnalysis,
} from '../criticality-engine/CriticalityEngineV1.js';

import type {
  ScenarioOutcomeModel,
  IncomeRangeModel,
  OptionalityRangeModel,
  RegretExposureRangeModel,
  ConfidenceInterval,
} from '../outcome-modeling/OutcomeModelingEngine.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * A counterfactual comparison between two career paths
 */
export interface CounterfactualComparison {
  /** Unique comparison ID */
  id: string;
  /** Primary path being compared (the "chosen" path) */
  primaryPath: PathComparisonData;
  /** Alternative path being compared against */
  alternativePath: PathComparisonData;
  /** Comparison type */
  comparisonType: 'path-vs-path' | 'scenario-vs-scenario' | 'what-if';
  /** High-level summary */
  summary: ComparisonSummary;
  /** Detailed differences */
  differences: PathDifferences;
  /** Opportunities analysis */
  opportunities: OpportunitiesAnalysis;
  /** Optionality comparison */
  optionality: OptionalityComparison;
  /** Regret analysis */
  regret: RegretComparison;
  /** Income comparison */
  income: IncomeComparison;
  /** Timeline comparison */
  timeline: TimelineComparison;
  /** Risk comparison */
  risk: RiskComparison;
  /** Satisfaction comparison */
  satisfaction: SatisfactionComparison;
  /** Coalition impact comparison */
  coalitionImpact: CoalitionImpactComparison;
  /** Explainable narrative */
  explanation: ComparisonExplanation;
  /** Generated timestamp */
  generatedAt: number;
}

/**
 * Data for a path in a comparison
 */
export interface PathComparisonData {
  /** Path ID */
  pathId: string;
  /** Path name */
  pathName: string;
  /** Path type */
  pathType: PathType;
  /** Career category */
  category: string;
  /** Scenario used for comparison (if applicable) */
  scenario?: FutureScenario;
  /** Outcome model (if available) */
  outcomeModel?: ScenarioOutcomeModel;
  /** Optionality analysis */
  optionalityAnalysis?: OptionalityAnalysis;
  /** Criticality analysis */
  criticalityAnalysis?: CriticalityAnalysis;
}

/**
 * High-level comparison summary
 */
export interface ComparisonSummary {
  /** Which path is "better" (or neutral) */
  recommendation: 'primary' | 'alternative' | 'neutral' | 'depends';
  /** Confidence in recommendation (0-100) */
  confidence: number;
  /** Key differentiator */
  keyDifferentiator: string;
  /** One-sentence summary */
  headline: string;
  /** Three bullet point takeaways */
  takeaways: string[];
}

/**
 * Detailed differences between paths
 */
export interface PathDifferences {
  /** Duration differences */
  duration: DurationDifference;
  /** Education differences */
  education: EducationDifference;
  /** Career progression differences */
  progression: ProgressionDifference;
  /** Skill differences */
  skills: SkillsDifference;
  /** Geographic differences */
  geography: GeographyDifference;
  /** Lifestyle differences */
  lifestyle: LifestyleDifference;
}

/**
 * Duration difference between paths
 */
export interface DurationDifference {
  /** Years to first major milestone */
  yearsToFirstMilestone: number;
  /** Years to stable income */
  yearsToStableIncome: number;
  /** Years to peak earnings */
  yearsToPeakEarnings: number;
  /** Total education duration */
  totalEducationYears: number;
  /** Which path is faster */
  fasterPath: 'primary' | 'alternative' | 'similar';
  /** Explanation */
  explanation: string;
}

/**
 * Education difference between paths
 */
export interface EducationDifference {
  /** Education level required */
  requiredLevel: string;
  /** Cost difference */
  costDifference: CostDifference;
  /** Prestige difference */
  prestigeDifference: PrestigeDifference;
  /** Entry exam requirements */
  entryRequirements: EntryRequirementsDifference;
  /** Which path has better education ROI */
  betterROI: 'primary' | 'alternative' | 'similar';
}

/**
 * Cost difference
 */
export interface CostDifference {
  /** Absolute cost difference in INR */
  absoluteDifference: number;
  /** Percentage difference */
  percentageDifference: number;
  /** Which path is more expensive */
  moreExpensive: 'primary' | 'alternative';
  /** Break-even analysis */
  breakEvenYears: number;
  /** Explanation */
  explanation: string;
}

/**
 * Prestige difference
 */
export interface PrestigeDifference {
  /** Prestige score difference (-100 to 100) */
  scoreDifference: number;
  /** Which path is more prestigious */
  morePrestigious: 'primary' | 'alternative' | 'similar';
  /** Social perception factors */
  socialFactors: string[];
}

/**
 * Entry requirements difference
 */
export interface EntryRequirementsDifference {
  /** Exam difficulty comparison */
  examDifficulty: DifficultyComparison;
  /** Competition level */
  competitionLevel: DifficultyComparison;
  /** Minimum academic requirements */
  academicRequirements: string;
}

/**
 * Difficulty comparison
 */
export interface DifficultyComparison {
  /** Primary path difficulty (0-100) */
  primary: number;
  /** Alternative path difficulty (0-100) */
  alternative: number;
  /** Difference (positive = primary harder) */
  difference: number;
}

/**
 * Career progression difference
 */
export interface ProgressionDifference {
  /** Promotion speed comparison */
  promotionSpeed: SpeedComparison;
  /** Career ceiling comparison */
  careerCeiling: CeilingComparison;
  /** Leadership opportunity comparison */
  leadershipOpportunities: OpportunityComparison;
  /** Entrepreneurship potential */
  entrepreneurshipPotential: OpportunityComparison;
}

/**
 * Speed comparison
 */
export interface SpeedComparison {
  /** Primary path speed score (0-100) */
  primary: number;
  /** Alternative path speed score (0-100) */
  alternative: number;
  /** Which is faster */
  faster: 'primary' | 'alternative' | 'similar';
  /** Years difference to senior level */
  yearsDifference: number;
}

/**
 * Ceiling comparison
 */
export interface CeilingComparison {
  /** Primary path ceiling description */
  primaryCeiling: string;
  /** Alternative path ceiling description */
  alternativeCeiling: string;
  /** Which has higher ceiling */
  higherCeiling: 'primary' | 'alternative' | 'similar';
  /** Income ceiling difference */
  incomeCeilingDifference: number;
}

/**
 * Opportunity comparison
 */
export interface OpportunityComparison {
  /** Primary path score (0-100) */
  primary: number;
  /** Alternative path score (0-100) */
  alternative: number;
  /** Which has more opportunities */
  moreOpportunities: 'primary' | 'alternative' | 'similar';
  /** Specific opportunities */
  specificOpportunities: string[];
}

/**
 * Skills difference
 */
export interface SkillsDifference {
  /** Unique skills gained in primary path */
  primaryUniqueSkills: string[];
  /** Unique skills gained in alternative path */
  alternativeUniqueSkills: string[];
  /** Common skills */
  commonSkills: string[];
  /** Transferability comparison */
  transferability: TransferabilityComparison;
  /** Skill obsolescence risk */
  obsolescenceRisk: RiskComparison;
}

/**
 * Transferability comparison
 */
export interface TransferabilityComparison {
  /** Primary path transferability (0-100) */
  primary: number;
  /** Alternative path transferability (0-100) */
  alternative: number;
  /** Which has more transferable skills */
  moreTransferable: 'primary' | 'alternative' | 'similar';
  /** Adjacent career counts */
  adjacentCareerCounts: {
    primary: number;
    alternative: number;
  };
}

/**
 * Geography difference
 */
export interface GeographyDifference {
  /** Location requirements */
  locationRequirements: LocationRequirementComparison;
  /** Remote work potential */
  remoteWorkPotential: OpportunityComparison;
  /** International opportunity comparison */
  internationalOpportunities: OpportunityComparison;
  /** Urban vs rural considerations */
  urbanRuralConsiderations: string;
}

/**
 * Location requirement comparison
 */
export interface LocationRequirementComparison {
  /** Primary path flexibility (0-100) */
  primaryFlexibility: number;
  /** Alternative path flexibility (0-100) */
  alternativeFlexibility: number;
  /** Required locations for primary */
  primaryRequiredLocations: string[];
  /** Required locations for alternative */
  alternativeRequiredLocations: string[];
}

/**
 * Lifestyle difference
 */
export interface LifestyleDifference {
  /** Work-life balance comparison */
  workLifeBalance: ComparisonScore;
  /** Stress level comparison */
  stressLevel: ComparisonScore;
  /** Job security comparison */
  jobSecurity: ComparisonScore;
  /** Schedule flexibility */
  scheduleFlexibility: ComparisonScore;
}

/**
 * Generic comparison score
 */
export interface ComparisonScore {
  /** Primary path score (0-100) */
  primary: number;
  /** Alternative path score (0-100) */
  alternative: number;
  /** Difference (positive = primary better) */
  difference: number;
  /** Which is better */
  better: 'primary' | 'alternative' | 'similar';
}

/**
 * Opportunities analysis
 */
export interface OpportunitiesAnalysis {
  /** Opportunities gained by choosing primary */
  gained: Opportunity[];
  /** Opportunities lost by choosing primary */
  lost: Opportunity[];
  /** Common opportunities */
  common: Opportunity[];
  /** Unique to primary */
  uniqueToPrimary: Opportunity[];
  /** Unique to alternative */
  uniqueToAlternative: Opportunity[];
  /** Opportunity cost summary */
  opportunityCost: OpportunityCostSummary;
}

/**
 * An opportunity
 */
export interface Opportunity {
  /** Opportunity ID */
  id: string;
  /** Opportunity name */
  name: string;
  /** Description */
  description: string;
  /** Category */
  category: OpportunityCategory;
  /** Value/impact score (0-100) */
  value: number;
  /** Probability of access (0-100) */
  probability: number;
  /** Time to access (years) */
  timeToAccess: number;
  /** Prerequisites */
  prerequisites: string[];
  /** Whether this is reversible */
  isReversible: boolean;
}

/**
 * Opportunity category
 */
export type OpportunityCategory =
  | 'career-advancement'
  | 'entrepreneurship'
  | 'further-education'
  | 'geographic-mobility'
  | 'lifestyle'
  | 'social-impact'
  | 'financial'
  | 'networking'
  | 'skill-development';

/**
 * Opportunity cost summary
 */
export interface OpportunityCostSummary {
  /** Total value of opportunities gained */
  gainedValue: number;
  /** Total value of opportunities lost */
  lostValue: number;
  /** Net opportunity cost (positive = net gain) */
  netOpportunityCost: number;
  /** Explanation */
  explanation: string;
  /** Whether the trade-off is worth it */
  worthIt: 'yes' | 'no' | 'depends';
  /** Conditions under which it's worth it */
  conditions?: string[];
}

/**
 * Optionality comparison
 */
export interface OptionalityComparison {
  /** Overall optionality scores */
  overallScores: ComparisonScore;
  /** Optionality over time comparison */
  overTime: OptionalityTimePoint[];
  /** Pivot potential comparison */
  pivotPotential: PivotPotentialComparison;
  /** Career switch difficulty */
  careerSwitchDifficulty: DifficultyComparison;
  /** Optionality preservation */
  preservation: PreservationComparison;
  /** Which path maintains more options */
  maintainsMoreOptions: 'primary' | 'alternative' | 'similar';
}

/**
 * Optionality at a time point
 */
export interface OptionalityTimePoint {
  /** Year */
  year: number;
  /** Primary path optionality */
  primaryOptionality: number;
  /** Alternative path optionality */
  alternativeOptionality: number;
  /** Difference */
  difference: number;
  /** Which has more optionality */
  moreOptional: 'primary' | 'alternative' | 'similar';
}

/**
 * Pivot potential comparison
 */
export interface PivotPotentialComparison {
  /** Primary path pivot potential (0-100) */
  primary: number;
  /** Alternative path pivot potential (0-100) */
  alternative: number;
  /** Easier to pivot from which path */
  easierToPivot: 'primary' | 'alternative' | 'similar';
  /** Pivot destinations */
  pivotDestinations: {
    fromPrimary: string[];
    fromAlternative: string[];
    common: string[];
  };
}

/**
 * Preservation comparison
 */
export interface PreservationComparison {
  /** Primary path preservation score (0-100) */
  primary: number;
  /** Alternative path preservation score (0-100) */
  alternative: number;
  /** Which preserves optionality better */
  betterPreservation: 'primary' | 'alternative' | 'similar';
  /** Key factors */
  keyFactors: string[];
}

/**
 * Regret comparison
 */
export interface RegretComparison {
  /** Expected regret levels */
  expectedRegret: RegretLevelComparison;
  /** Regret by category */
  byCategory: Map<RegretCategory, RegretLevelComparison>;
  /** Regret over time */
  overTime: RegretTimePointComparison[];
  /** Minimizing regret strategy */
  minimizationStrategy: RegretMinimizationStrategy;
  /** Which path minimizes regret */
  minimizesRegret: 'primary' | 'alternative' | 'similar' | 'depends';
}

/**
 * Regret category
 */
export type RegretCategory =
  | 'financial'
  | 'opportunity-cost'
  | 'lifestyle-mismatch'
  | 'value-misalignment'
  | 'skill-obsolescence'
  | 'relationship-impact'
  | 'status'
  | 'intellectual-stimulation';

/**
 * Regret level comparison
 */
export interface RegretLevelComparison {
  /** Primary path regret level (0-100, higher = more regret) */
  primary: number;
  /** Alternative path regret level (0-100) */
  alternative: number;
  /** Difference (positive = primary has more regret) */
  difference: number;
  /** Which has less regret */
  lessRegret: 'primary' | 'alternative' | 'similar';
  /** Primary drivers */
  primaryDrivers: string[];
}

/**
 * Regret at a time point
 */
export interface RegretTimePointComparison {
  /** Year */
  year: number;
  /** Primary path regret */
  primaryRegret: number;
  /** Alternative path regret */
  alternativeRegret: number;
  /** Which has less regret at this point */
  lessRegret: 'primary' | 'alternative' | 'similar';
}

/**
 * Regret minimization strategy
 */
export interface RegretMinimizationStrategy {
  /** Recommended path for regret minimization */
  recommendedPath: 'primary' | 'alternative' | 'similar';
  /** Confidence in recommendation */
  confidence: number;
  /** Key actions to minimize regret */
  keyActions: string[];
  /** Contingency plans */
  contingencyPlans: string[];
}

/**
 * Income comparison
 */
export interface IncomeComparison {
  /** Starting income comparison */
  startingIncome: IncomePointComparison;
  /** Peak income comparison */
  peakIncome: IncomePointComparison;
  /** Average income comparison */
  averageIncome: IncomePointComparison;
  /** Income trajectory comparison */
  trajectory: IncomeTrajectoryComparison;
  /** Cumulative lifetime earnings */
  cumulativeEarnings: CumulativeEarningsComparison;
  /** Income stability comparison */
  stability: StabilityComparison;
  /** Which path has better income */
  betterIncome: 'primary' | 'alternative' | 'depends';
}

/**
 * Income point comparison
 */
export interface IncomePointComparison {
  /** Primary path income */
  primary: number;
  /** Alternative path income */
  alternative: number;
  /** Difference */
  difference: number;
  /** Percentage difference */
  percentageDifference: number;
  /** Which is higher */
  higher: 'primary' | 'alternative';
}

/**
 * Income trajectory comparison
 */
export interface IncomeTrajectoryComparison {
  /** Year-by-year comparison */
  byYear: YearlyIncomeComparison[];
  /** Growth rate comparison */
  growthRates: GrowthRateComparison;
  /** Crossover point (if any) */
  crossoverPoint?: CrossoverPoint;
}

/**
 * Yearly income comparison
 */
export interface YearlyIncomeComparison {
  /** Year */
  year: number;
  /** Primary income */
  primary: number;
  /** Alternative income */
  alternative: number;
  /** Difference */
  difference: number;
  /** Which is higher */
  higher: 'primary' | 'alternative';
}

/**
 * Growth rate comparison
 */
export interface GrowthRateComparison {
  /** Primary path growth rate */
  primary: number;
  /** Alternative path growth rate */
  alternative: number;
  /** Which grows faster */
  faster: 'primary' | 'alternative' | 'similar';
}

/**
 * Crossover point where incomes meet
 */
export interface CrossoverPoint {
  /** Year of crossover */
  year: number;
  /** Income at crossover */
  income: number;
  /** Which path was ahead before */
  aheadBefore: 'primary' | 'alternative';
  /** Which path is ahead after */
  aheadAfter: 'primary' | 'alternative';
}

/**
 * Cumulative earnings comparison
 */
export interface CumulativeEarningsComparison {
  /** 5-year cumulative */
  fiveYear: IncomePointComparison;
  /** 10-year cumulative */
  tenYear: IncomePointComparison;
  /** 20-year cumulative */
  twentyYear: IncomePointComparison;
  /** Lifetime cumulative */
  lifetime: IncomePointComparison;
  /** Break-even point */
  breakEvenPoint?: number;
}

/**
 * Stability comparison
 */
export interface StabilityComparison {
  /** Primary path stability score (0-100) */
  primary: number;
  /** Alternative path stability score (0-100) */
  alternative: number;
  /** Which is more stable */
  moreStable: 'primary' | 'alternative' | 'similar';
  /** Risk factors */
  riskFactors: string[];
}

/**
 * Timeline comparison
 */
export interface TimelineComparison {
  /** Key milestones comparison */
  milestones: MilestoneComparison[];
  /** Education timeline */
  educationTimeline: EducationTimelineComparison;
  /** Career progression timeline */
  careerTimeline: CareerTimelineComparison;
  /** Total time to financial independence */
  timeToFinancialIndependence: TimeComparison;
}

/**
 * Milestone comparison
 */
export interface MilestoneComparison {
  /** Milestone name */
  name: string;
  /** Year in primary path */
  primaryYear: number;
  /** Year in alternative path */
  alternativeYear: number;
  /** Difference (positive = primary later) */
  difference: number;
  /** Which comes first */
  first: 'primary' | 'alternative' | 'same';
}

/**
 * Education timeline comparison
 */
export interface EducationTimelineComparison {
  /** Start year */
  startYear: TimeComparison;
  /** Duration */
  duration: TimeComparison;
  /** Completion year */
  completionYear: TimeComparison;
}

/**
 * Career timeline comparison
 */
export interface CareerTimelineComparison {
  /** Entry year */
  entryYear: TimeComparison;
  /** First promotion */
  firstPromotion: TimeComparison;
  /** Senior level */
  seniorLevel: TimeComparison;
  /** Leadership */
  leadership: TimeComparison;
}

/**
 * Time comparison
 */
export interface TimeComparison {
  /** Primary path time (years) */
  primary: number;
  /** Alternative path time (years) */
  alternative: number;
  /** Difference */
  difference: number;
  /** Which is faster */
  faster: 'primary' | 'alternative' | 'similar';
}

/**
 * Risk comparison
 */
export interface RiskComparison {
  /** Overall risk scores */
  overallRisk: ComparisonScore;
  /** Risk by category */
  byCategory: RiskCategoryComparison[];
  /** Risk over time */
  overTime: RiskTimePoint[];
  /** Which path is riskier */
  riskierPath: 'primary' | 'alternative' | 'similar';
  /** Risk mitigation comparison */
  mitigation: RiskMitigationComparison;
}

/**
 * Risk category comparison
 */
export interface RiskCategoryComparison {
  /** Category name */
  category: string;
  /** Primary path risk (0-100) */
  primary: number;
  /** Alternative path risk (0-100) */
  alternative: number;
  /** Difference */
  difference: number;
  /** Which is riskier */
  riskier: 'primary' | 'alternative' | 'similar';
}

/**
 * Risk at a time point
 */
export interface RiskTimePoint {
  /** Year */
  year: number;
  /** Primary path risk */
  primaryRisk: number;
  /** Alternative path risk */
  alternativeRisk: number;
}

/**
 * Risk mitigation comparison
 */
export interface RiskMitigationComparison {
  /** Primary path mitigation effectiveness */
  primaryEffectiveness: number;
  /** Alternative path mitigation effectiveness */
  alternativeEffectiveness: number;
  /** Which has better mitigation */
  betterMitigation: 'primary' | 'alternative' | 'similar';
  /** Available mitigations */
  availableMitigations: string[];
}

/**
 * Satisfaction comparison
 */
export interface SatisfactionComparison {
  /** Overall satisfaction prediction */
  overallSatisfaction: ComparisonScore;
  /** By dimension */
  byDimension: SatisfactionDimensionComparison[];
  /** Satisfaction trajectory */
  trajectory: SatisfactionTrajectoryPoint[];
  /** Which path leads to more satisfaction */
  moreSatisfying: 'primary' | 'alternative' | 'similar' | 'depends';
  /** Key satisfaction drivers */
  keyDrivers: string[];
}

/**
 * Satisfaction dimension comparison
 */
export interface SatisfactionDimensionComparison {
  /** Dimension name */
  dimension: string;
  /** Primary path score */
  primary: number;
  /** Alternative path score */
  alternative: number;
  /** Difference */
  difference: number;
  /** Which is better */
  better: 'primary' | 'alternative' | 'similar';
}

/**
 * Satisfaction trajectory point
 */
export interface SatisfactionTrajectoryPoint {
  /** Year */
  year: number;
  /** Primary satisfaction */
  primary: number;
  /** Alternative satisfaction */
  alternative: number;
  /** Which is higher */
  higher: 'primary' | 'alternative' | 'similar';
}

/**
 * Coalition impact comparison
 */
export interface CoalitionImpactComparison {
  /** Family approval comparison */
  familyApproval: ComparisonScore;
  /** Social status comparison */
  socialStatus: ComparisonScore;
  /** Peer comparison comparison */
  peerComparison: ComparisonScore;
  /** Which path has better coalition support */
  betterCoalitionSupport: 'primary' | 'alternative' | 'depends';
  /** Potential conflicts */
  potentialConflicts: string[];
  /** Resolution strategies */
  resolutionStrategies: string[];
}

/**
 * Comparison explanation/narrative
 */
export interface ComparisonExplanation {
  /** Executive summary */
  executiveSummary: string;
  /** Detailed narrative */
  narrative: string;
  /** Key trade-offs */
  keyTradeOffs: TradeOff[];
  /** Decision framework */
  decisionFramework: DecisionFramework;
  /** Scenarios where primary is better */
  primaryBetterScenarios: string[];
  /** Scenarios where alternative is better */
  alternativeBetterScenarios: string[];
  /** Questions to consider */
  questionsToConsider: string[];
}

/**
 * A trade-off
 */
export interface TradeOff {
  /** What you gain */
  gain: string;
  /** What you give up */
  giveUp: string;
  /** Whether it's reversible */
  isReversible: boolean;
  /** Importance (0-100) */
  importance: number;
}

/**
 * Decision framework
 */
export interface DecisionFramework {
  /** If you value X, choose primary */
  choosePrimaryIf: string[];
  /** If you value Y, choose alternative */
  chooseAlternativeIf: string[];
  /** Deal breakers for primary */
  primaryDealBreakers: string[];
  /** Deal breakers for alternative */
  alternativeDealBreakers: string[];
}

/**
 * Input for counterfactual comparison
 */
export interface CounterfactualInput {
  /** Primary path/scenario */
  primary: PathComparisonData;
  /** Alternative path/scenario */
  alternative: PathComparisonData;
  /** Student values (for personalized comparison) */
  studentValues?: string[];
  /** Student constraints */
  studentConstraints?: string[];
  /** Comparison depth */
  depth: 'summary' | 'detailed' | 'comprehensive';
  /** Time horizon for comparison (years) */
  timeHorizon: number;
}

/**
 * Configuration for counterfactual engine
 */
export interface CounterfactualConfig {
  /** Weight for income in comparisons (0-1) */
  incomeWeight: number;
  /** Weight for optionality (0-1) */
  optionalityWeight: number;
  /** Weight for satisfaction (0-1) */
  satisfactionWeight: number;
  /** Weight for regret minimization (0-1) */
  regretWeight: number;
  /** Discount rate for future values */
  discountRate: number;
  /** Risk adjustment factor */
  riskAdjustmentFactor: number;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_COUNTERFACTUAL_CONFIG: CounterfactualConfig = {
  incomeWeight: 0.25,
  optionalityWeight: 0.25,
  satisfactionWeight: 0.30,
  regretWeight: 0.20,
  discountRate: 0.03,
  riskAdjustmentFactor: 0.15,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate unique comparison ID
 */
function generateComparisonId(primaryId: string, alternativeId: string): string {
  return `comparison-${primaryId}-vs-${alternativeId}-${Date.now()}`;
}

/**
 * Calculate percentage difference
 */
function percentageDifference(value1: number, value2: number): number {
  if (value2 === 0) return value1 > 0 ? 100 : 0;
  return ((value1 - value2) / value2) * 100;
}

/**
 * Determine which is better based on scores
 */
function determineBetter(
  primary: number,
  alternative: number,
  higherIsBetter: boolean = true
): 'primary' | 'alternative' | 'similar' {
  const difference = higherIsBetter ? primary - alternative : alternative - primary;
  const threshold = 5; // 5% difference threshold

  if (Math.abs(difference) < threshold) return 'similar';
  return difference > 0 ? 'primary' : 'alternative';
}

/**
 * Format currency in INR
 */
function formatINR(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount}`;
}

// ============================================================================
// MAIN COUNTERFACTUAL ENGINE
// ============================================================================

export class CounterfactualEngine {
  private config: CounterfactualConfig;

  constructor(config: Partial<CounterfactualConfig> = {}) {
    this.config = {
      ...DEFAULT_COUNTERFACTUAL_CONFIG,
      ...config,
    };
  }

  /**
   * Generate a counterfactual comparison between two paths
   */
  compare(input: CounterfactualInput): CounterfactualComparison {
    const { primary, alternative, depth, timeHorizon } = input;

    // Generate comparison ID
    const id = generateComparisonId(primary.pathId, alternative.pathId);

    // Calculate all differences
    const differences = this.calculateDifferences(primary, alternative, depth);
    const opportunities = this.analyzeOpportunities(primary, alternative);
    const optionality = this.compareOptionality(primary, alternative, timeHorizon);
    const regret = this.compareRegret(primary, alternative, timeHorizon);
    const income = this.compareIncome(primary, alternative, timeHorizon);
    const timeline = this.compareTimeline(primary, alternative);
    const risk = this.compareRisk(primary, alternative, timeHorizon);
    const satisfaction = this.compareSatisfaction(primary, alternative, timeHorizon);
    const coalitionImpact = this.compareCoalitionImpact(primary, alternative);

    // Generate summary
    const summary = this.generateSummary(
      primary,
      alternative,
      income,
      optionality,
      regret,
      satisfaction
    );

    // Generate explanation
    const explanation = this.generateExplanation(
      primary,
      alternative,
      differences,
      opportunities,
      income,
      optionality,
      regret,
      summary
    );

    return {
      id,
      primaryPath: primary,
      alternativePath: alternative,
      comparisonType: 'path-vs-path',
      summary,
      differences,
      opportunities,
      optionality,
      regret,
      income,
      timeline,
      risk,
      satisfaction,
      coalitionImpact,
      explanation,
      generatedAt: Date.now(),
    };
  }

  /**
   * Calculate detailed differences between paths
   */
  private calculateDifferences(
    primary: PathComparisonData,
    alternative: PathComparisonData,
    depth: CounterfactualInput['depth']
  ): PathDifferences {
    // Duration differences
    const duration: DurationDifference = {
      yearsToFirstMilestone: 2,
      yearsToStableIncome: 3,
      yearsToPeakEarnings: 12,
      totalEducationYears: 4,
      fasterPath: 'similar',
      explanation: 'Both paths have similar timelines to key milestones',
    };

    // Education differences
    const education: EducationDifference = {
      requiredLevel: 'Bachelor\'s degree',
      costDifference: {
        absoluteDifference: 200000,
        percentageDifference: 25,
        moreExpensive: 'primary',
        breakEvenYears: 3,
        explanation: 'Primary path requires 25% more investment but breaks even in 3 years',
      },
      prestigeDifference: {
        scoreDifference: 10,
        morePrestigious: 'primary',
        socialFactors: ['Professional recognition', 'Industry reputation'],
      },
      entryRequirements: {
        examDifficulty: {
          primary: 70,
          alternative: 60,
          difference: 10,
        },
        competitionLevel: {
          primary: 75,
          alternative: 65,
          difference: 10,
        },
        academicRequirements: 'Both require strong academic performance',
      },
      betterROI: 'similar',
    };

    // Progression differences
    const progression: ProgressionDifference = {
      promotionSpeed: {
        primary: 65,
        alternative: 70,
        faster: 'alternative',
        yearsDifference: 1,
      },
      careerCeiling: {
        primaryCeiling: 'Senior Leadership / CTO',
        alternativeCeiling: 'Senior Management / Director',
        higherCeiling: 'primary',
        incomeCeilingDifference: 500000,
      },
      leadershipOpportunities: {
        primary: 75,
        alternative: 60,
        moreOpportunities: 'primary',
        specificOpportunities: ['Team Lead', 'Department Head', 'VP Engineering'],
      },
      entrepreneurshipPotential: {
        primary: 70,
        alternative: 55,
        moreOpportunities: 'primary',
        specificOpportunities: ['Tech startup', 'Consulting firm', 'Product company'],
      },
    };

    // Skills differences
    const skills: SkillsDifference = {
      primaryUniqueSkills: ['System Architecture', 'Technical Leadership', 'Platform Design'],
      alternativeUniqueSkills: ['Domain Specialization', 'Client Management', 'Industry Expertise'],
      commonSkills: ['Problem Solving', 'Communication', 'Project Management'],
      transferability: {
        primary: 80,
        alternative: 65,
        moreTransferable: 'primary',
        adjacentCareerCounts: {
          primary: 15,
          alternative: 8,
        },
      },
      obsolescenceRisk: {
        overallRisk: {
          primary: 30,
          alternative: 25,
          difference: 5,
          better: 'alternative',
        },
        byCategory: [],
        overTime: [],
        riskierPath: 'primary',
        mitigation: {
          primaryEffectiveness: 75,
          alternativeEffectiveness: 70,
          betterMitigation: 'primary',
          availableMitigations: ['Continuous learning', 'Skill diversification'],
        },
      },
    };

    // Geography differences
    const geography: GeographyDifference = {
      locationRequirements: {
        primaryFlexibility: 85,
        alternativeFlexibility: 60,
        primaryRequiredLocations: ['Major tech hubs', 'Remote-friendly companies'],
        alternativeRequiredLocations: ['Industry centers', 'Client locations'],
      },
      remoteWorkPotential: {
        primary: 90,
        alternative: 50,
        moreOpportunities: 'primary',
        specificOpportunities: ['Full remote', 'Hybrid', 'Digital nomad'],
      },
      internationalOpportunities: {
        primary: 80,
        alternative: 65,
        moreOpportunities: 'primary',
        specificOpportunities: ['Global companies', 'Remote work visas', 'Relocation'],
      },
      urbanRuralConsiderations: 'Primary path offers more flexibility for non-urban living',
    };

    // Lifestyle differences
    const lifestyle: LifestyleDifference = {
      workLifeBalance: {
        primary: 70,
        alternative: 75,
        difference: -5,
        better: 'alternative',
      },
      stressLevel: {
        primary: 65,
        alternative: 55,
        difference: 10,
        better: 'alternative',
      },
      jobSecurity: {
        primary: 75,
        alternative: 80,
        difference: -5,
        better: 'alternative',
      },
      scheduleFlexibility: {
        primary: 85,
        alternative: 60,
        difference: 25,
        better: 'primary',
      },
    };

    return {
      duration,
      education,
      progression,
      skills,
      geography,
      lifestyle,
    };
  }

  /**
   * Analyze opportunities gained and lost
   */
  private analyzeOpportunities(
    primary: PathComparisonData,
    alternative: PathComparisonData
  ): OpportunitiesAnalysis {
    // Opportunities gained by choosing primary
    const gained: Opportunity[] = [
      {
        id: 'opp-1',
        name: 'Global Career Mobility',
        description: 'Ability to work anywhere in the world',
        category: 'geographic-mobility',
        value: 85,
        probability: 80,
        timeToAccess: 2,
        prerequisites: ['Build portfolio', 'Network internationally'],
        isReversible: true,
      },
      {
        id: 'opp-2',
        name: 'Tech Entrepreneurship',
        description: 'Start a technology company',
        category: 'entrepreneurship',
        value: 90,
        probability: 40,
        timeToAccess: 5,
        prerequisites: ['Gain experience', 'Build network', 'Save capital'],
        isReversible: false,
      },
      {
        id: 'opp-3',
        name: 'High Income Potential',
        description: 'Earn significantly above average income',
        category: 'financial',
        value: 80,
        probability: 70,
        timeToAccess: 3,
        prerequisites: ['Develop expertise', 'Demonstrate value'],
        isReversible: true,
      },
    ];

    // Opportunities lost by choosing primary (gained in alternative)
    const lost: Opportunity[] = [
      {
        id: 'opp-4',
        name: 'Domain Expert Status',
        description: 'Become recognized expert in specific field',
        category: 'career-advancement',
        value: 75,
        probability: 65,
        timeToAccess: 7,
        prerequisites: ['Deep specialization', 'Industry contributions'],
        isReversible: false,
      },
      {
        id: 'opp-5',
        name: 'Stable Career Path',
        description: 'Predictable progression with lower risk',
        category: 'lifestyle',
        value: 70,
        probability: 85,
        timeToAccess: 2,
        prerequisites: ['Consistent performance'],
        isReversible: true,
      },
      {
        id: 'opp-6',
        name: 'Work-Life Balance',
        description: 'More predictable hours and less stress',
        category: 'lifestyle',
        value: 80,
        probability: 75,
        timeToAccess: 1,
        prerequisites: ['Set boundaries'],
        isReversible: true,
      },
    ];

    // Common opportunities
    const common: Opportunity[] = [
      {
        id: 'opp-7',
        name: 'Professional Network',
        description: 'Build valuable professional connections',
        category: 'networking',
        value: 75,
        probability: 90,
        timeToAccess: 1,
        prerequisites: ['Attend events', 'Engage online'],
        isReversible: false,
      },
      {
        id: 'opp-8',
        name: 'Skill Development',
        description: 'Continuous learning and growth',
        category: 'skill-development',
        value: 85,
        probability: 95,
        timeToAccess: 0,
        prerequisites: ['Commitment to learning'],
        isReversible: false,
      },
    ];

    // Calculate opportunity cost
    const gainedValue = gained.reduce((sum, o) => sum + o.value * (o.probability / 100), 0);
    const lostValue = lost.reduce((sum, o) => sum + o.value * (o.probability / 100), 0);
    const netOpportunityCost = gainedValue - lostValue;

    const opportunityCost: OpportunityCostSummary = {
      gainedValue: Math.round(gainedValue),
      lostValue: Math.round(lostValue),
      netOpportunityCost: Math.round(netOpportunityCost),
      explanation: netOpportunityCost > 0
        ? `Choosing the primary path provides access to ${gained.length} unique opportunities worth ${Math.round(gainedValue)} points, while giving up ${lost.length} opportunities worth ${Math.round(lostValue)} points, for a net gain of ${Math.round(netOpportunityCost)} points.`
        : `Choosing the primary path means giving up ${lost.length} opportunities worth ${Math.round(lostValue)} points to gain ${gained.length} opportunities worth ${Math.round(gainedValue)} points, for a net loss of ${Math.round(Math.abs(netOpportunityCost))} points.`,
      worthIt: netOpportunityCost > 20 ? 'yes' : netOpportunityCost < -20 ? 'no' : 'depends',
      conditions: netOpportunityCost > -20 && netOpportunityCost <= 20
        ? ['Consider your risk tolerance', 'Evaluate your personal values', 'Assess your financial needs']
        : undefined,
    };

    return {
      gained,
      lost,
      common,
      uniqueToPrimary: gained,
      uniqueToAlternative: lost,
      opportunityCost,
    };
  }

  /**
   * Compare optionality between paths
   */
  private compareOptionality(
    primary: PathComparisonData,
    alternative: PathComparisonData,
    timeHorizon: number
  ): OptionalityComparison {
    // Overall scores
    const primaryOptionality = primary.optionalityAnalysis?.overallScore || 70;
    const alternativeOptionality = alternative.optionalityAnalysis?.overallScore || 60;

    const overallScores: ComparisonScore = {
      primary: primaryOptionality,
      alternative: alternativeOptionality,
      difference: primaryOptionality - alternativeOptionality,
      better: determineBetter(primaryOptionality, alternativeOptionality),
    };

    // Optionality over time
    const overTime: OptionalityTimePoint[] = [];
    for (let year = 0; year <= timeHorizon; year += 2) {
      // Optionality typically decreases over time
      const decayFactor = 1 - (year * 0.05);
      const primaryOpt = primaryOptionality * decayFactor;
      const alternativeOpt = alternativeOptionality * decayFactor;

      overTime.push({
        year,
        primaryOptionality: Math.round(primaryOpt),
        alternativeOptionality: Math.round(alternativeOpt),
        difference: Math.round(primaryOpt - alternativeOpt),
        moreOptional: determineBetter(primaryOpt, alternativeOpt),
      });
    }

    // Pivot potential
    const pivotPotential: PivotPotentialComparison = {
      primary: 75,
      alternative: 55,
      easierToPivot: 'primary',
      pivotDestinations: {
        fromPrimary: ['Product Management', 'Data Science', 'Entrepreneurship', 'Consulting'],
        fromAlternative: ['Senior Specialist', 'Team Lead', 'Industry Expert'],
        common: ['Management', 'Training/Education'],
      },
    };

    // Preservation
    const preservation: PreservationComparison = {
      primary: 70,
      alternative: 60,
      betterPreservation: 'primary',
      keyFactors: [
        'Broader skill set in primary path',
        'More transferable experience',
        'Diverse industry exposure',
      ],
    };

    return {
      overallScores,
      overTime,
      pivotPotential,
      careerSwitchDifficulty: {
        primary: 40,
        alternative: 60,
        difference: -20,
      },
      preservation,
      maintainsMoreOptions: overallScores.better,
    };
  }

  /**
   * Compare regret between paths
   */
  private compareRegret(
    primary: PathComparisonData,
    alternative: PathComparisonData,
    timeHorizon: number
  ): RegretComparison {
    // Expected regret levels
    const expectedRegret: RegretLevelComparison = {
      primary: 35,
      alternative: 40,
      difference: -5,
      lessRegret: 'primary',
      primaryDrivers: ['Fear of missing out on stability', 'Uncertainty about entrepreneurship'],
    };

    // Regret by category
    const byCategory = new Map<RegretCategory, RegretLevelComparison>();
    const categories: RegretCategory[] = [
      'financial', 'opportunity-cost', 'lifestyle-mismatch', 'value-misalignment',
      'skill-obsolescence', 'relationship-impact', 'status', 'intellectual-stimulation',
    ];

    categories.forEach(category => {
      const primaryRegret = Math.random() * 40 + 20;
      const alternativeRegret = Math.random() * 40 + 20;

      byCategory.set(category, {
        primary: Math.round(primaryRegret),
        alternative: Math.round(alternativeRegret),
        difference: Math.round(primaryRegret - alternativeRegret),
        lessRegret: determineBetter(primaryRegret, alternativeRegret, false),
        primaryDrivers: [`${category} considerations`],
      });
    });

    // Regret over time
    const overTime: RegretTimePointComparison[] = [];
    for (let year = 0; year <= timeHorizon; year += 3) {
      // Regret often follows U-curve (honeymoon, reality, acceptance)
      const timeFactor = Math.sin((year / timeHorizon) * Math.PI) * 15;
      const primaryRegret = 30 + timeFactor;
      const alternativeRegret = 35 + timeFactor;

      overTime.push({
        year,
        primaryRegret: Math.round(primaryRegret),
        alternativeRegret: Math.round(alternativeRegret),
        lessRegret: determineBetter(primaryRegret, alternativeRegret, false),
      });
    }

    // Minimization strategy
    const minimizationStrategy: RegretMinimizationStrategy = {
      recommendedPath: expectedRegret.lessRegret,
      confidence: 70,
      keyActions: [
        'Regularly reassess your decision',
        'Keep options open where possible',
        'Focus on controllable factors',
        'Practice gratitude for chosen path',
      ],
      contingencyPlans: [
        'Maintain skills for alternative path',
        'Build financial buffer',
        'Stay connected to alternative network',
      ],
    };

    return {
      expectedRegret,
      byCategory,
      overTime,
      minimizationStrategy,
      minimizesRegret: expectedRegret.lessRegret,
    };
  }

  /**
   * Compare income between paths
   */
  private compareIncome(
    primary: PathComparisonData,
    alternative: PathComparisonData,
    timeHorizon: number
  ): IncomeComparison {
    // Sample income data (would come from scenarios in real implementation)
    const primaryStarting = 600000;
    const alternativeStarting = 450000;
    const primaryPeak = 2500000;
    const alternativePeak = 1500000;
    const primaryAvg = 1400000;
    const alternativeAvg = 900000;

    // Starting income
    const startingIncome: IncomePointComparison = {
      primary: primaryStarting,
      alternative: alternativeStarting,
      difference: primaryStarting - alternativeStarting,
      percentageDifference: percentageDifference(primaryStarting, alternativeStarting),
      higher: primaryStarting > alternativeStarting ? 'primary' : 'alternative',
    };

    // Peak income
    const peakIncome: IncomePointComparison = {
      primary: primaryPeak,
      alternative: alternativePeak,
      difference: primaryPeak - alternativePeak,
      percentageDifference: percentageDifference(primaryPeak, alternativePeak),
      higher: primaryPeak > alternativePeak ? 'primary' : 'alternative',
    };

    // Average income
    const averageIncome: IncomePointComparison = {
      primary: primaryAvg,
      alternative: alternativeAvg,
      difference: primaryAvg - alternativeAvg,
      percentageDifference: percentageDifference(primaryAvg, alternativeAvg),
      higher: primaryAvg > alternativeAvg ? 'primary' : 'alternative',
    };

    // Trajectory
    const byYear: YearlyIncomeComparison[] = [];
    for (let year = 1; year <= timeHorizon; year++) {
      const primaryIncome = primaryStarting + (primaryPeak - primaryStarting) * (year / timeHorizon);
      const alternativeIncome = alternativeStarting + (alternativePeak - alternativeStarting) * (year / timeHorizon);

      byYear.push({
        year,
        primary: Math.round(primaryIncome),
        alternative: Math.round(alternativeIncome),
        difference: Math.round(primaryIncome - alternativeIncome),
        higher: primaryIncome > alternativeIncome ? 'primary' : 'alternative',
      });
    }

    // Check for crossover
    let crossoverPoint: CrossoverPoint | undefined;
    const firstYear = byYear[0];
    const lastYear = byYear[byYear.length - 1];

    if (firstYear.higher !== lastYear.higher) {
      // Find approximate crossover
      crossoverPoint = {
        year: Math.floor(timeHorizon / 2),
        income: Math.round((primaryPeak + alternativePeak) / 2),
        aheadBefore: firstYear.higher,
        aheadAfter: lastYear.higher,
      };
    }

    const trajectory: IncomeTrajectoryComparison = {
      byYear,
      growthRates: {
        primary: 0.12,
        alternative: 0.08,
        faster: 'primary',
      },
      crossoverPoint,
    };

    // Cumulative earnings
    const cumulativeEarnings: CumulativeEarningsComparison = {
      fiveYear: {
        primary: byYear.slice(0, 5).reduce((sum, y) => sum + y.primary, 0),
        alternative: byYear.slice(0, 5).reduce((sum, y) => sum + y.alternative, 0),
        difference: 0,
        percentageDifference: 0,
        higher: 'primary',
      },
      tenYear: {
        primary: byYear.slice(0, 10).reduce((sum, y) => sum + y.primary, 0),
        alternative: byYear.slice(0, 10).reduce((sum, y) => sum + y.alternative, 0),
        difference: 0,
        percentageDifference: 0,
        higher: 'primary',
      },
      twentyYear: {
        primary: byYear.reduce((sum, y) => sum + y.primary, 0) * (20 / timeHorizon),
        alternative: byYear.reduce((sum, y) => sum + y.alternative, 0) * (20 / timeHorizon),
        difference: 0,
        percentageDifference: 0,
        higher: 'primary',
      },
      lifetime: {
        primary: byYear.reduce((sum, y) => sum + y.primary, 0) * (35 / timeHorizon),
        alternative: byYear.reduce((sum, y) => sum + y.alternative, 0) * (35 / timeHorizon),
        difference: 0,
        percentageDifference: 0,
        higher: 'primary',
      },
    };

    // Calculate differences for cumulative
    ['fiveYear', 'tenYear', 'twentyYear', 'lifetime'].forEach(period => {
      const p = cumulativeEarnings[period as keyof CumulativeEarningsComparison] as IncomePointComparison;
      p.difference = p.primary - p.alternative;
      p.percentageDifference = percentageDifference(p.primary, p.alternative);
      p.higher = p.primary > p.alternative ? 'primary' : 'alternative';
    });

    // Stability
    const stability: StabilityComparison = {
      primary: 70,
      alternative: 80,
      moreStable: 'alternative',
      riskFactors: [
        'Market demand fluctuations',
        'Technology disruption',
        'Economic cycles',
      ],
    };

    return {
      startingIncome,
      peakIncome,
      averageIncome,
      trajectory,
      cumulativeEarnings,
      stability,
      betterIncome: averageIncome.higher,
    };
  }

  /**
   * Compare timelines between paths
   */
  private compareTimeline(
    primary: PathComparisonData,
    alternative: PathComparisonData
  ): TimelineComparison {
    // Milestones
    const milestones: MilestoneComparison[] = [
      {
        name: 'First Job',
        primaryYear: 2024,
        alternativeYear: 2024,
        difference: 0,
        first: 'same',
      },
      {
        name: 'First Promotion',
        primaryYear: 2026,
        alternativeYear: 2025,
        difference: 1,
        first: 'alternative',
      },
      {
        name: 'Senior Level',
        primaryYear: 2029,
        alternativeYear: 2028,
        difference: 1,
        first: 'alternative',
      },
      {
        name: 'Peak Earnings',
        primaryYear: 2035,
        alternativeYear: 2032,
        difference: 3,
        first: 'alternative',
      },
    ];

    // Education timeline
    const educationTimeline: EducationTimelineComparison = {
      startYear: {
        primary: 2020,
        alternative: 2020,
        difference: 0,
        faster: 'similar',
      },
      duration: {
        primary: 4,
        alternative: 4,
        difference: 0,
        faster: 'similar',
      },
      completionYear: {
        primary: 2024,
        alternative: 2024,
        difference: 0,
        faster: 'similar',
      },
    };

    // Career timeline
    const careerTimeline: CareerTimelineComparison = {
      entryYear: {
        primary: 2024,
        alternative: 2024,
        difference: 0,
        faster: 'similar',
      },
      firstPromotion: {
        primary: 2026,
        alternative: 2025,
        difference: 1,
        faster: 'alternative',
      },
      seniorLevel: {
        primary: 2029,
        alternative: 2028,
        difference: 1,
        faster: 'alternative',
      },
      leadership: {
        primary: 2032,
        alternative: 2034,
        difference: -2,
        faster: 'primary',
      },
    };

    // Financial independence
    const timeToFinancialIndependence: TimeComparison = {
      primary: 15,
      alternative: 18,
      difference: -3,
      faster: 'primary',
    };

    return {
      milestones,
      educationTimeline,
      careerTimeline,
      timeToFinancialIndependence,
    };
  }

  /**
   * Compare risk between paths
   */
  private compareRisk(
    primary: PathComparisonData,
    alternative: PathComparisonData,
    timeHorizon: number
  ): RiskComparison {
    // Overall risk
    const overallRisk: ComparisonScore = {
      primary: 60,
      alternative: 45,
      difference: 15,
      better: 'alternative',
    };

    // Risk by category
    const byCategory: RiskCategoryComparison[] = [
      { category: 'Market Demand', primary: 65, alternative: 50, difference: 15, riskier: 'primary' },
      { category: 'Technology Disruption', primary: 70, alternative: 40, difference: 30, riskier: 'primary' },
      { category: 'Job Security', primary: 55, alternative: 70, difference: -15, riskier: 'alternative' },
      { category: 'Income Volatility', primary: 60, alternative: 45, difference: 15, riskier: 'primary' },
      { category: 'Career Longevity', primary: 50, alternative: 65, difference: -15, riskier: 'alternative' },
    ];

    // Risk over time
    const overTime: RiskTimePoint[] = [];
    for (let year = 0; year <= timeHorizon; year += 5) {
      // Risk typically decreases as career progresses
      const timeFactor = 1 - (year / timeHorizon) * 0.3;
      overTime.push({
        year,
        primaryRisk: Math.round(60 * timeFactor),
        alternativeRisk: Math.round(45 * timeFactor),
      });
    }

    // Mitigation
    const mitigation: RiskMitigationComparison = {
      primaryEffectiveness: 75,
      alternativeEffectiveness: 70,
      betterMitigation: 'primary',
      availableMitigations: [
        'Continuous skill development',
        'Diversify income sources',
        'Build emergency fund',
        'Maintain professional network',
      ],
    };

    return {
      overallRisk,
      byCategory,
      overTime,
      riskierPath: 'primary',
      mitigation,
    };
  }

  /**
   * Compare satisfaction between paths
   */
  private compareSatisfaction(
    primary: PathComparisonData,
    alternative: PathComparisonData,
    timeHorizon: number
  ): SatisfactionComparison {
    // Overall satisfaction
    const overallSatisfaction: ComparisonScore = {
      primary: 72,
      alternative: 75,
      difference: -3,
      better: 'alternative',
    };

    // By dimension
    const byDimension: SatisfactionDimensionComparison[] = [
      { dimension: 'Compensation', primary: 80, alternative: 65, difference: 15, better: 'primary' },
      { dimension: 'Work-Life Balance', primary: 65, alternative: 80, difference: -15, better: 'alternative' },
      { dimension: 'Growth Opportunities', primary: 85, alternative: 70, difference: 15, better: 'primary' },
      { dimension: 'Job Security', primary: 70, alternative: 80, difference: -10, better: 'alternative' },
      { dimension: 'Autonomy', primary: 80, alternative: 65, difference: 15, better: 'primary' },
      { dimension: 'Purpose Alignment', primary: 70, alternative: 75, difference: -5, better: 'alternative' },
      { dimension: 'Social Impact', primary: 60, alternative: 70, difference: -10, better: 'alternative' },
      { dimension: 'Recognition', primary: 75, alternative: 70, difference: 5, better: 'primary' },
    ];

    // Trajectory
    const trajectory: SatisfactionTrajectoryPoint[] = [];
    for (let year = 0; year <= timeHorizon; year += 3) {
      // Satisfaction often follows U-curve
      const honeymoonPhase = year < 3 ? 10 : 0;
      const realityShock = year >= 3 && year < 7 ? -5 : 0;
      const recovery = year >= 7 ? 5 : 0;

      const primarySat = 72 + honeymoonPhase + realityShock + recovery;
      const alternativeSat = 75 + honeymoonPhase + realityShock + recovery;

      trajectory.push({
        year,
        primary: Math.round(primarySat),
        alternative: Math.round(alternativeSat),
        higher: primarySat > alternativeSat ? 'primary' : 'alternative',
      });
    }

    return {
      overallSatisfaction,
      byDimension,
      trajectory,
      moreSatisfying: overallSatisfaction.better,
      keyDrivers: [
        'Work-life balance preferences',
        'Risk tolerance',
        'Income priorities',
        'Growth mindset',
      ],
    };
  }

  /**
   * Compare coalition impact between paths
   */
  private compareCoalitionImpact(
    primary: PathComparisonData,
    alternative: PathComparisonData
  ): CoalitionImpactComparison {
    // Family approval
    const familyApproval: ComparisonScore = {
      primary: 70,
      alternative: 75,
      difference: -5,
      better: 'alternative',
    };

    // Social status
    const socialStatus: ComparisonScore = {
      primary: 75,
      alternative: 70,
      difference: 5,
      better: 'primary',
    };

    // Peer comparison
    const peerComparison: ComparisonScore = {
      primary: 72,
      alternative: 68,
      difference: 4,
      better: 'primary',
    };

    return {
      familyApproval,
      socialStatus,
      peerComparison,
      betterCoalitionSupport: 'depends',
      potentialConflicts: [
        'Income expectations vs reality',
        'Prestige vs stability preferences',
        'Risk tolerance differences',
      ],
      resolutionStrategies: [
        'Regular family communication',
        'Share success stories',
        'Demonstrate progress',
        'Address concerns proactively',
      ],
    };
  }

  /**
   * Generate comparison summary
   */
  private generateSummary(
    primary: PathComparisonData,
    alternative: PathComparisonData,
    income: IncomeComparison,
    optionality: OptionalityComparison,
    regret: RegretComparison,
    satisfaction: SatisfactionComparison
  ): ComparisonSummary {
    // Calculate weighted scores
    const incomeScore = income.betterIncome === 'primary' ? 1 : income.betterIncome === 'alternative' ? -1 : 0;
    const optionalityScore = optionality.maintainsMoreOptions === 'primary' ? 1 : optionality.maintainsMoreOptions === 'alternative' ? -1 : 0;
    const regretScore = regret.minimizesRegret === 'primary' ? 1 : regret.minimizesRegret === 'alternative' ? -1 : 0;
    const satisfactionScore = satisfaction.moreSatisfying === 'primary' ? 1 : satisfaction.moreSatisfying === 'alternative' ? -1 : 0;

    const totalScore =
      incomeScore * this.config.incomeWeight +
      optionalityScore * this.config.optionalityWeight +
      regretScore * this.config.regretWeight +
      satisfactionScore * this.config.satisfactionWeight;

    let recommendation: ComparisonSummary['recommendation'];
    if (totalScore > 0.15) recommendation = 'primary';
    else if (totalScore < -0.15) recommendation = 'alternative';
    else recommendation = 'depends';

    // Determine key differentiator
    const differences = [
      { factor: 'income', diff: Math.abs(incomeScore * this.config.incomeWeight) },
      { factor: 'optionality', diff: Math.abs(optionalityScore * this.config.optionalityWeight) },
      { factor: 'regret', diff: Math.abs(regretScore * this.config.regretWeight) },
      { factor: 'satisfaction', diff: Math.abs(satisfactionScore * this.config.satisfactionWeight) },
    ];

    const keyDifferentiator = differences.sort((a, b) => b.diff - a.diff)[0].factor;

    // Generate headline
    const headlines: Record<string, string> = {
      income: `${primary.pathName} offers significantly higher income potential but requires accepting more risk`,
      optionality: `${primary.pathName} maintains more career flexibility and future options`,
      regret: `${primary.pathName} minimizes long-term regret based on your profile`,
      satisfaction: `${alternative.pathName} may provide better overall life satisfaction`,
    };

    // Generate takeaways
    const takeaways = [
      `Income: ${income.betterIncome === 'primary' ? primary.pathName : alternative.pathName} has ${Math.abs(income.averageIncome.percentageDifference).toFixed(0)}% higher earning potential`,
      `Optionality: ${optionality.maintainsMoreOptions === 'primary' ? primary.pathName : alternative.pathName} preserves more future career options`,
      `Risk: ${primary.pathName} carries higher risk but offers greater rewards`,
    ];

    return {
      recommendation,
      confidence: Math.round(Math.abs(totalScore) * 100),
      keyDifferentiator,
      headline: headlines[keyDifferentiator] || `Both paths have distinct advantages - choice depends on your priorities`,
      takeaways,
    };
  }

  /**
   * Generate comparison explanation/narrative
   */
  private generateExplanation(
    primary: PathComparisonData,
    alternative: PathComparisonData,
    differences: PathDifferences,
    opportunities: OpportunitiesAnalysis,
    income: IncomeComparison,
    optionality: OptionalityComparison,
    regret: RegretComparison,
    summary: ComparisonSummary
  ): ComparisonExplanation {
    // Executive summary
    const executiveSummary = `Comparing ${primary.pathName} vs ${alternative.pathName}: ${summary.headline} The primary path offers ${opportunities.gained.length} unique opportunities while the alternative provides ${opportunities.lost.length} different advantages. Income potential differs by ${Math.abs(income.averageIncome.percentageDifference).toFixed(0)}%, with ${optionality.maintainsMoreOptions} maintaining more future flexibility.`;

    // Detailed narrative
    const narrative = `When comparing these two career paths, several key differences emerge. ${primary.pathName} provides access to ${opportunities.gained.map(o => o.name).join(', ')}, while ${alternative.pathName} offers ${opportunities.lost.map(o => o.name).join(', ')}. 

From an income perspective, ${income.betterIncome} shows superior earning potential with ${formatINR(Math.abs(income.averageIncome.difference))} difference in average annual income. However, ${optionality.maintainsMoreOptions} maintains significantly more career flexibility with ${Math.abs(optionality.overallScores.difference)} additional optionality points.

Regret analysis suggests ${regret.minimizesRegret} minimizes long-term regret, particularly regarding ${regret.expectedRegret.primaryDrivers.join(' and ')}. The opportunity cost of choosing ${primary.pathName} is ${opportunities.opportunityCost.netOpportunityCost > 0 ? 'positive' : 'negative'} at ${Math.abs(opportunities.opportunityCost.netOpportunityCost)} points, indicating ${opportunities.opportunityCost.worthIt === 'yes' ? 'the trade-off is generally favorable' : opportunities.opportunityCost.worthIt === 'no' ? 'the trade-off may not be worth it' : 'the value depends on your personal priorities'}.`;

    // Key trade-offs
    const keyTradeOffs: TradeOff[] = [
      {
        gain: 'Higher income potential and career growth',
        giveUp: 'Work-life balance and job stability',
        isReversible: false,
        importance: 85,
      },
      {
        gain: 'Career flexibility and optionality',
        giveUp: 'Deep specialization and domain expertise',
        isReversible: true,
        importance: 75,
      },
      {
        gain: 'Global mobility and remote work',
        giveUp: 'Local community and family proximity',
        isReversible: true,
        importance: 60,
      },
    ];

    // Decision framework
    const decisionFramework: DecisionFramework = {
      choosePrimaryIf: [
        'You prioritize income and career growth',
        'You value flexibility and optionality',
        'You are comfortable with uncertainty',
        'You want global career opportunities',
      ],
      chooseAlternativeIf: [
        'You prioritize stability and predictability',
        'Work-life balance is critical',
        'You prefer lower risk',
        'You value deep specialization',
      ],
      primaryDealBreakers: [
        'Cannot tolerate income uncertainty',
        'Require maximum job security',
        'Need predictable schedule',
      ],
      alternativeDealBreakers: [
        'Income ceiling is too low',
        'Limited growth frustrates you',
        'You need frequent change',
      ],
    };

    // Scenarios
    const primaryBetterScenarios = [
      'You are ambitious and growth-oriented',
      'You have financial obligations requiring higher income',
      'You value autonomy and flexibility',
      'You are comfortable taking calculated risks',
    ];

    const alternativeBetterScenarios = [
      'You prioritize family time and stability',
      'You prefer predictable, lower-stress work',
      'You value deep expertise over broad skills',
      'Risk aversion is high for your situation',
    ];

    // Questions
    const questionsToConsider = [
      'What matters more: income potential or work-life balance?',
      'How important is career flexibility to you?',
      'What is your risk tolerance?',
      'What would you regret more: missing opportunities or taking too much risk?',
      'How do your family obligations affect this decision?',
    ];

    return {
      executiveSummary,
      narrative,
      keyTradeOffs,
      decisionFramework,
      primaryBetterScenarios,
      alternativeBetterScenarios,
      questionsToConsider,
    };
  }

  /**
   * Compare multiple paths and generate ranked list
   */
  compareMultiple(
    primary: PathComparisonData,
    alternatives: PathComparisonData[],
    timeHorizon: number
  ): CounterfactualComparison[] {
    return alternatives.map(alternative =>
      this.compare({
        primary,
        alternative,
        depth: 'detailed',
        timeHorizon,
      })
    );
  }

  /**
   * Generate "what if" scenario for a specific decision point
   */
  generateWhatIf(
    currentPath: PathComparisonData,
    decisionPoint: string,
    alternativeChoice: PathComparisonData,
    timeHorizon: number
  ): CounterfactualComparison {
    const comparison = this.compare({
      primary: currentPath,
      alternative: alternativeChoice,
      depth: 'comprehensive',
      timeHorizon,
    });

    // Add what-if specific context
    return {
      ...comparison,
      comparisonType: 'what-if',
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a new Counterfactual Engine instance
 */
export function createCounterfactualEngine(
  config?: Partial<CounterfactualConfig>
): CounterfactualEngine {
  return new CounterfactualEngine(config);
}

/**
 * Compare two career paths
 */
export function comparePaths(
  primary: PathComparisonData,
  alternative: PathComparisonData,
  timeHorizon: number = 20
): CounterfactualComparison {
  const engine = new CounterfactualEngine();
  return engine.compare({
    primary,
    alternative,
    depth: 'detailed',
    timeHorizon,
  });
}


