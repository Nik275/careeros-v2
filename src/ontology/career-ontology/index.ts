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
  CareerFilterCriteria,
  CareerComparisonResult,
} from './CareerOntologyV2';
