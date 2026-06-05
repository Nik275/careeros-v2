/**
 * CareerOS Future Scenario Generator V1
 *
 * Generates plausible future career scenarios based on student beliefs,
 * career paths, knowledge graphs, optionality, criticality, and coalition analysis.
 *
 * @module intelligence/future-scenario
 * @version 1.0.0
 */

export {
  FutureScenarioGeneratorV1,
  createFutureScenarioGenerator,
  generateFutureScenarios,
  DEFAULT_SCENARIO_CONFIG,
} from './FutureScenarioGeneratorV1.js';

export type {
  FutureScenario,
  ScenarioType,
  CareerState,
  EducationState,
  ScenarioMilestone,
  IncomePoint,
  FlexibilityPoint,
  ScenarioMetrics,
  ScenarioAssumptions,
  RiskFactor,
  ScenarioGenerationInput,
  ScenarioGenerationResult,
  ScenarioComparison,
  ScenarioGeneratorConfig,
} from './FutureScenarioGeneratorV1.js';
