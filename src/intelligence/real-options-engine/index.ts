/**
 * CareerOS Real Options Theory Engine
 *
 * Evaluates career decisions based on the value of preserving future opportunities.
 * Measures not only current utility but future option value.
 *
 * @example
 * ```typescript
 * import { RealOptionsEngine, analyzeCareerOptions } from './real-options-engine';
 *
 * const engine = new RealOptionsEngine();
 * const analysis = engine.analyze({
 *   studentId: 'student-123',
 *   careerId: 'software-engineer',
 *   careerName: 'Software Engineer',
 *   optionalityAnalysis: {...},
 *   criticalityAnalysis: {...},
 *   transitionEdges: [...],
 *   futureContexts: [...]
 * });
 *
 * console.log(analysis.optionValue); // 85
 * console.log(analysis.commitmentCost); // 45
 * console.log(analysis.netOptionValue); // 72
 * console.log(analysis.narrative.summary);
 * ```
 */

// Main Engine
export {
  RealOptionsEngine,
  createRealOptionsEngine,
  analyzeCareerOptions,
  compareCareerOptions,
} from './RealOptionsEngine';

// Calculators
export {
  OptionValueCalculator,
  createOptionValueCalculator,
} from './OptionValueCalculator';

export {
  FlexibilityCalculator,
  createFlexibilityCalculator,
} from './FlexibilityCalculator';

export {
  ReversibilityCalculator,
  createReversibilityCalculator,
} from './ReversibilityCalculator';

export {
  FutureOpportunityCalculator,
  createFutureOpportunityCalculator,
} from './FutureOpportunityCalculator';

export {
  CommitmentCostEngine,
  createCommitmentCostEngine,
} from './CommitmentCostEngine';

export {
  OptionNarrativeEngine,
  createOptionNarrativeEngine,
} from './OptionNarrativeEngine';

// Constants
export {
  DEFAULT_REAL_OPTIONS_CONFIG,
} from './types';

// Types
export type {
  // Core
  RealOptionsId,
  CareerId,
  RealOptionsScore,
  CommitmentLevel,
  LockInType,
  OptionValueRating,

  // Career Option
  CareerOption,

  // Calculations
  OptionValueCalculation,
  FlexibilityCalculation,
  ReversibilityCalculation,
  FutureOpportunityCalculation,
  CommitmentCostCalculation,

  // Analysis
  RealOptionsAnalysis,
  RealOptionsInput,
  RealOptionsComparison,
  RealOptionsComparisonInput,

  // Configuration
  RealOptionsEngineConfig,
} from './types';
