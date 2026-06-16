/**
 * CareerOS Career Ontology V2
 *
 * Definitive knowledge model for every career in CareerOS.
 * Supports 1000+ careers with comprehensive domain coverage.
 */

export {
  CareerOntologyV2,
  createCareer,
  validateCareer,
  createCareerSlug,
  normalizeCareerData,
  generateCareerId,
  ONTOLOGY_SCHEMA_VERSION,
  DEFAULT_PSYCHOLOGY_PROFILE,
  DEFAULT_WORK_STYLE_PROFILE,
  DEFAULT_REWARD_PROFILE,
  DEFAULT_RISK_PROFILE,
  DEFAULT_OPTIONALITY_PROFILE,
  DEFAULT_EDUCATION_PROFILE,
  DEFAULT_INDIA_REALITY_PROFILE,
  DEFAULT_FUTURE_PROFILE,
  DEFAULT_LIFESTYLE_PROFILE,
} from './CareerOntologyV2';

export type {
  // Core Types
  CareerId,
  CareerSlug,
  Career,
  CareerCategory,

  // Domain Profiles
  CareerIdentity,
  PsychologyProfile,
  WorkStyleProfile,
  RewardProfile,
  RiskProfile,
  OptionalityProfile,
  EducationProfile,
  IndiaRealityProfile,
  FutureProfile,
  LifestyleProfile,

  // Enums & Constants
  RemoteWorkLevel,
  TravelRequirement,
  TeamOrientation,
  EducationLevel,
  ExamType,
  CoachingLevel,
  EnglishDependency,
  UrbanAdvantage,
  FamilyAcceptance,
  RiskLevel,
  DemandLevel,
  GrowthLevel,
  StressLevel,
  WorkLifeBalance,

  // Options & Configuration
  CareerCreationOptions,
  CareerValidationResult,
  CareerValidationError,
  CareerValidationWarning,
  CareerFilterCriteria,
  CareerComparisonResult,
} from './CareerOntologyV2';
