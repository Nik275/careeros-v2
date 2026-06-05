/**
 * CareerOS Career Fit Engine
 *
 * Phase C.3: Career Fit Engine
 *
 * Evaluates fit between StudentLifeProfile and CareerIntelligence.
 * Provides comprehensive fit scores, strengths, concerns, and explanations.
 *
 * @module career-fit
 * @version 1.0.0
 */

// Main Engine
export {
  CareerFitEngine,
  createCareerFitEngine,
} from './career-fit-engine';

// Component Engines
export {
  FitCalculator,
  createFitCalculator,
} from './fit-calculator';

export {
  FitBreakdownEngine,
  createFitBreakdownEngine,
} from './fit-breakdown-engine';

export {
  FitConfidenceEngine,
  createFitConfidenceEngine,
} from './fit-confidence-engine';

export {
  FitExplanationEngine,
  createFitExplanationEngine,
} from './fit-explanation-engine';

// Types
export type {
  FitResultId,
  CareerFitResult,
  FitLevel,
  FitBreakdown,
  CognitiveFit,
  DimensionFit,
  CognitiveGap,
  MotivationFit,
  MotivationConflict,
  LifestyleFit,
  LifestyleDealbreaker,
  RiskFit,
  RiskConcern,
  WorkEnvironmentFit,
  ValuesFit,
  ValuesAlignment,
  FitStrength,
  FitConcern,
  FitExplanations,
  FitConfidence,
  FitMetadata,
  FitCalculationConfig,
  DimensionWeights,
  FitQuery,
  FitComparison,
  DimensionComparison,
} from './career-fit-types';

// Constants
export {
  DEFAULT_FIT_CONFIG,
} from './career-fit-types';
