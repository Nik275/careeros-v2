/**
 * CareerOS Career Expansion Engine V1
 *
 * Automates scaling from 25 to 150+ careers without manual relationship definition.
 * Generates career relationships, skill relationships, transition candidates,
 * similarity scores, and optionality estimates automatically.
 *
 * @module intelligence/career-expansion-engine
 * @version 1.0.0
 */

export {
  CareerExpansionEngineV1,
  createCareerExpansionEngine,
  findSimilarCareers,
  suggestAdjacentCareers,
  generateTransitionCandidates,
  calculateExpansionConfidence,
  careerCoverageAnalysis,
  graphDensityAnalysis,
  suggestCareerExpansions,
  executeCareerExpansion,
  DEFAULT_CAREER_EXPANSION_CONFIG,
} from './CareerExpansionEngineV1.js';

export type {
  ExpansionAnalysisId,
  CareerSimilarity,
  AdjacentCareer,
  TransitionCandidate,
  ExpansionConfidence,
  CareerCoverageAnalysis,
  GraphDensityAnalysis,
  CareerExpansionCandidate,
  CareerExpansionEngineConfig,
  ExpansionResult,
} from './CareerExpansionEngineV1.js';
