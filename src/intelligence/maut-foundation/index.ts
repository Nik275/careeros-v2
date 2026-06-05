/**
 * CareerOS Multi-Attribute Utility Theory (MAUT) Foundation V1
 *
 * Personalized decision optimization system based on Multi-Attribute Utility Theory.
 * Supports individual student utility functions for career evaluation.
 *
 * @module intelligence/maut-foundation
 * @version 1.0.0
 */

export {
  MAUTFoundationV1,
  createMAUTFoundation,
  validateUtilityProfile,
  normalizeUtilityWeights,
  checkUtilityConsistency,
  calculateUtilityScore,
  generateUtilityExplanation,
  compareUtilityScores,
  createDefaultUtilityProfile,
  createUtilityProfile,
  createCareerPathUtilityData,
  CORE_UTILITY_ATTRIBUTES,
  DEFAULT_MAUT_CONFIG,
} from './MAUTFoundationV1.js';

export type {
  UtilityAttributeId,
  UtilityAttributeCategory,
  UtilityAttribute,
  StudentUtilityProfile,
  CareerPathUtilityData,
  UtilityScore,
  UtilityExplanation,
  UtilityValidationResult,
  UtilityComparison,
  MAUTConfig,
} from './MAUTFoundationV1.js';
