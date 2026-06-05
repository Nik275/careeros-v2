/**
 * CareerOS Counterfactual Engine
 *
 * Compares career futures to show what would be different
 * if a student chose a different path.
 *
 * @module intelligence/counterfactual-engine
 * @version 1.0.0
 */

export {
  CounterfactualEngine,
  createCounterfactualEngine,
  comparePaths,
  DEFAULT_COUNTERFACTUAL_CONFIG,
} from './CounterfactualEngine.js';

// CareerV2 Adapter
export {
  adaptCareerToPathData,
  adaptCareersForComparison,
  createCareerComparisonPair,
  DEFAULT_ADAPTER_CONFIG,
  type CareerAdapterConfig,
} from './CareerAdapter.js';

// Comparison Factories
export {
  // Common comparisons
  compareMedicineVsSoftwareEngineering,
  compareAIEngineerVsDataScientist,
  compareEngineerVsProductManager,
  compareBankingVsEngineering,
  compareCivilServicesVsCorporate,
  compareCAVsEngineering,
  compareLawVsEngineering,
  compareDesignVsEngineering,
  compareResearchVsIndustry,
  compareConsultingVsEngineering,

  // Generic comparisons
  compareCareersBySlug,
  compareAnyCareers,
  compareAgainstAlternatives,

  // Scenario discovery
  getAllComparisonScenarios,
  getComparisonsByCategory,
} from './ComparisonFactories.js';

export type {
  CounterfactualComparison,
  PathComparisonData,
  ComparisonSummary,
  PathDifferences,
  DurationDifference,
  EducationDifference,
  CostDifference,
  PrestigeDifference,
  EntryRequirementsDifference,
  DifficultyComparison,
  ProgressionDifference,
  SpeedComparison,
  CeilingComparison,
  OpportunityComparison,
  SkillsDifference,
  TransferabilityComparison,
  GeographyDifference,
  LocationRequirementComparison,
  LifestyleDifference,
  ComparisonScore,
  OpportunitiesAnalysis,
  Opportunity,
  OpportunityCategory,
  OpportunityCostSummary,
  OptionalityComparison,
  OptionalityTimePoint,
  PivotPotentialComparison,
  PreservationComparison,
  RegretComparison,
  RegretCategory,
  RegretLevelComparison,
  RegretTimePointComparison,
  RegretMinimizationStrategy,
  IncomeComparison,
  IncomePointComparison,
  IncomeTrajectoryComparison,
  YearlyIncomeComparison,
  GrowthRateComparison,
  CrossoverPoint,
  CumulativeEarningsComparison,
  StabilityComparison,
  TimelineComparison,
  MilestoneComparison,
  EducationTimelineComparison,
  CareerTimelineComparison,
  TimeComparison,
  RiskComparison,
  RiskCategoryComparison,
  RiskTimePoint,
  RiskMitigationComparison,
  SatisfactionComparison,
  SatisfactionDimensionComparison,
  SatisfactionTrajectoryPoint,
  CoalitionImpactComparison,
  ComparisonExplanation,
  TradeOff,
  DecisionFramework,
  CounterfactualInput,
  CounterfactualConfig,
} from './CounterfactualEngine.js';
