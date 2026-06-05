/**
 * CareerOS Value of Information Engine
 *
 * Identifies which additional information would most improve decision quality.
 *
 * @example
 * ```typescript
 * import { ValueOfInformationEngine } from '@/intelligence';
 *
 * const engine = new ValueOfInformationEngine();
 * const report = engine.analyze({
 *   studentBelief,
 *   utilityProfile,
 *   decisionResults,
 *   uncertaintyProfile,
 *   futureSimulation
 * });
 *
 * console.log(report.topRecommendation);
 * console.log(report.explanation.summary);
 * ```
 */

// Main engine
export {
  ValueOfInformationEngine,
  createValueOfInformationEngine,
  analyzeValueOfInformation,
} from './ValueOfInformationEngine';

// Components
export {
  InformationGapDetector,
  createInformationGapDetector,
} from './InformationGapDetector';

export {
  ValueOfInformationCalculator,
  createValueOfInformationCalculator,
} from './ValueOfInformationCalculator';

export {
  InformationPrioritizer,
  createInformationPrioritizer,
} from './InformationPrioritizer';

export {
  ExperimentRecommender,
  createExperimentRecommender,
} from './ExperimentRecommender';

export {
  VoIExplanationEngine,
  createVoIExplanationEngine,
} from './VoIExplanationEngine';

// Types
export type {
  // Core types
  VoIAnalysisId,
  InformationGapCategory,
  InformationMethod,
  ExperimentType,

  // Main interfaces
  InformationGap,
  InformationOpportunity,
  ExperimentRecommendation,
  ValueOfInformationCalculation,
  VoIExplanation,
  ValueOfInformationReport,

  // Input/Output
  ValueOfInformationInput,
  ValueOfInformationEngineConfig,

  // Results
  GapDetectionResult,
  PrioritizationResult,
  ExperimentRecommendationResult,

  // Constants
  INFORMATION_GAP_CATEGORY_LABELS,
  DEFAULT_VOI_CONFIG,
} from './types';
