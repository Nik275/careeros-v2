/**
 * CareerOS Bayesian Belief Updating Engine
 *
 * Continuously updates student beliefs as new evidence is collected.
 * Moves from static assessments to evidence-driven student modeling.
 *
 * @example
 * ```typescript
 * import { BayesianBeliefEngine } from './bayesian-belief-engine';
 *
 * const engine = new BayesianBeliefEngine();
 * const result = engine.updateBeliefs({
 *   studentId: 'student-123',
 *   currentBeliefs: [...],
 *   newEvidence: [{
 *     type: 'internship',
 *     targetBeliefId: 'entrepreneurship-interest',
 *     supportsBelief: true,
 *     strength: 0.8,
 *     ...
 *   }]
 * });
 *
 * console.log(result.narrative.summary);
 * // "Updated 2 beliefs. CareerOS confidence in your entrepreneurship
 * //  interest increased from 61% to 82% after startup project."
 * ```
 */

// Main Engine
export {
  BayesianBeliefEngine,
  createBayesianBeliefEngine,
  updateStudentBeliefs,
  processEvidenceEvent,
} from './BayesianBeliefEngine';

// Components
export {
  EvidenceWeightEngine,
  createEvidenceWeightEngine,
} from './EvidenceWeightEngine';

export {
  PosteriorCalculator,
  createPosteriorCalculator,
} from './PosteriorCalculator';

export {
  BeliefConfidenceEngine,
  createBeliefConfidenceEngine,
} from './BeliefConfidenceEngine';

export {
  ContradictionDetector,
  createContradictionDetector,
} from './ContradictionDetector';

export {
  BeliefNarrativeEngine,
  createBeliefNarrativeEngine,
} from './BeliefNarrativeEngine';

// Types
export type {
  // Core types
  BeliefUpdateId,
  EvidenceId,
  BeliefType,
  EvidenceType,
  // ConfidenceLevel BANNED - use Confidence from @/intelligence/confidence
  StabilityLevel,

  // Main interfaces
  BeliefNode,
  EvidenceEvent,
  BeliefUpdate,
  EvidenceWeight,
  BeliefConfidence,
  Contradiction,
  BeliefHistory,
  UpdatedStudentBelief,

  // Input/Output
  BeliefUpdateInput,
  ProcessEvidenceInput,

  // Narrative
  BeliefNarrative,

  // Configuration
  BayesianBeliefConfig,
  DEFAULT_BAYESIAN_CONFIG,
} from './types';
