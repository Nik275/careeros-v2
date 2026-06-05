/**
 * CareerOS Future Explorer V1
 *
 * Allows CareerOS to reason across multiple futures.
 * Supports comparing paths, scenarios, regrets, and optionality.
 *
 * @module intelligence/future-explorer
 * @version 1.0.0
 */

export {
  FutureExplorerV1,
  createFutureExplorer,
  exploreFutures,
  quickPathComparison,
  compareScenariosAcrossFutures,
  DEFAULT_FUTURE_EXPLORER_CONFIG,
} from './FutureExplorerV1.js';

export type {
  FutureExplorerId,
  FutureContext,
  FutureCharacteristic,
  FutureComparison,
  FutureComparisonDimension,
  FutureRanking,
  FutureTradeoff,
  FutureWinners,
  PathComparisonAcrossFutures,
  PathComparisonMetric,
  PathSimilarity,
  PathDifference,
  ConvergencePoint,
  DivergencePoint,
  ScenarioComparisonAcrossFutures,
  CrossScenarioAnalysis,
  ScenarioOutcomeRange,
  ScenarioExtremes,
  RegretComparisonAcrossFutures,
  FutureRegret,
  ComparativeRegretAnalysis,
  RegretMinimizationRecommendation,
  OptionalityComparisonAcrossFutures,
  FutureOptionality,
  ComparativeOptionalityAnalysis,
  OptionalityPreservationStrategy,
  FutureExplorerResult,
  FutureExplorerExplanation,
  FutureDecisionFramework,
  FutureExplorerRecommendation,
  FutureExplorerInput,
  FutureExplorerConfig,
} from './FutureExplorerV1.js';
