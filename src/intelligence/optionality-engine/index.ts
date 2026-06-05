/**
 * CareerOS Optionality Engine
 *
 * Measures how many future opportunities a career preserves.
 */

export {
  OptionalityEngineV1,
  calculateOptionality,
  calculateBatchOptionality,
  compareCareerOptionality,
} from './OptionalityEngineV1';

export type {
  OptionalityAnalysis,
  OptionalityDimensionScore,
  AdjacentCareer,
  SkillCategory,
  OptionalityWeights,
  OptionalityCalculationOptions,
} from './OptionalityEngineV1';
