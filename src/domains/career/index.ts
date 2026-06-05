/**
 * Career Domain
 *
 * CareerOS - Career Intelligence System
 *
 * This module exports the complete Career domain model including:
 *   - Core Career interface and types
 *   - Profile types (Psychological, Work Style, Reward, Risk, Optionality)
 *   - India-specific types (IndiaRealityProfile)
 *   - Education types (EducationRequirements, enums)
 *   - Career evolution and salary types
 *   - Filter, search, and collection types
 *   - Validation functions and type guards
 *   - Builder pattern for constructing careers
 *   - Helper functions and default values
 *   - Career Dimensions System for evaluation and matching
 */

// ============================================================================
// MAIN EXPORTS
// ============================================================================

export type {
  // Core types
  Career,
  CareerId,
  CareerSlug,
  CareerScore,
  SalaryINR,

  // Profile types
  PsychologicalProfile,
  WorkStyleProfile,
  RewardProfile,
  RiskProfile,
  OptionalityProfile,

  // Context types
  EducationRequirements,
  IndiaRealityProfile,
  CareerEvolution,
  SalaryProfile,

  // Collection types
  CareerCollection,
  CareerReference,

  // Filter/Search types
  CareerFilter,
  CareerSearchQuery,
} from './Career';

export {
  // Enums
  CareerCategory,
  EducationLevel,
  DegreeType,
  CertificationType,
  CareerSortOption,

  // Validation
  isValidCareerScore,
  validateCareer,

  // Builder
  CareerBuilder,

  // Helpers
  createNeutralPsychologicalProfile,
  createNeutralWorkStyleProfile,
  createNeutralRewardProfile,
  createNeutralRiskProfile,
  createNeutralOptionalityProfile,
  formatSalaryINR,
  formatSalaryRange,
} from './Career';

// ============================================================================
// DIMENSIONS SYSTEM
// ============================================================================

export * from './dimensions';

// ============================================================================
// CAREER PROFILES
// ============================================================================

export * from './profiles';

// ============================================================================
// CAREER REPOSITORY
// ============================================================================

export * from './repository';
