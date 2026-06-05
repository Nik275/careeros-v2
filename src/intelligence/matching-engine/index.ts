/**
 * CareerOS Matching Engine V1
 *
 * CareerOS - Career Intelligence System
 *
 * Matches StudentProfile to Careers using deterministic, explainable algorithms.
 */

// Core types
export type {
  WorkStylePreference,
  MatchingInput,
  MatchingWeights,
  TraitMatch,
  MotivationMatch,
  ConstraintResult,
  MatchExplanation,
  CareerMatch,
  MatchingResult,
} from './MatchingEngineV1';

// Main functions
export {
  calculatePsychologicalFit,
  calculateWorkStyleFit,
  calculateMotivationFit,
  calculateConstraintFit,
  matchCareer,
  matchAllCareers,
  matchStudentToCareers,
  createNeutralWorkStylePreference,
  inferWorkStylePreference,
} from './MatchingEngineV1';
