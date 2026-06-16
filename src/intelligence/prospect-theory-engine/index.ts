/**
 * CareerOS Prospect Theory & Cognitive Bias Engine
 *
 * Models predictable human decision biases.
 * Understands where student choices diverge from rational decision optimization.
 *
 * @example
 * ```typescript
 * import { ProspectTheoryEngine } from './prospect-theory-engine';
 *
 * const engine = new ProspectTheoryEngine();
 * const analysis = engine.analyze({
 *   studentId: 'student-123',
 *   careerChoices: [...],
 *   assessmentResponses: [...],
 *   familyInteractions: {...}
 * });
 *
 * console.log(analysis.narrative.overview);
 * // "Analysis detected authorityInfluence as the primary cognitive 
 * //  bias influence (68% overall bias level)."
 * ```
 */

// Main Engine
export {
  ProspectTheoryEngine,
  createProspectTheoryEngine,
  analyzeBiases,
  generateDistortionReport,
} from './ProspectTheoryEngine';

// Detectors
export {
  LossAversionDetector,
  SocialConformityDetector,
  StatusBiasDetector,
  AuthorityInfluenceDetector,
  RiskPerceptionEngine,
  OptimismBiasDetector,
  SunkCostDetector,
  createLossAversionDetector,
  createSocialConformityDetector,
  createStatusBiasDetector,
  createAuthorityInfluenceDetector,
  createRiskPerceptionEngine,
  createOptimismBiasDetector,
  createSunkCostDetector,
} from './BiasDetectors';

// Analysis
export {
  BiasImpactAnalysis,
  createBiasImpactAnalysis,
} from './BiasImpactAnalysis';

// Explanation
export {
  BiasExplanationEngine,
  createBiasExplanationEngine,
} from './BiasExplanationEngine';

// Constants
export {
  DEFAULT_PROSPECT_THEORY_CONFIG,
} from './types';

// Types
export type {
  // Core types
  BiasAnalysisId,
  BiasType,
  BiasSignalSource,
  BiasSeverity,
  DistortionScore,

  // Main interfaces
  BiasProfile,
  BiasSignal,
  BiasImpact,
  RiskPerception,
  DecisionDistortion,
  BiasAnalysis,
  BiasExplanation,
  DecisionDistortionReport,

  // Input/Output
  BiasDetectionInput,

  // Configuration
  ProspectTheoryConfig,
} from './types';
