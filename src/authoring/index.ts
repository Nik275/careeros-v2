/**
 * CareerOS Career Authoring Framework
 *
 * Standardized system for creating, validating, updating, and maintaining
 * career profiles at scale.
 */

export {
  // Framework Constants
  AUTHORING_SCHEMA_VERSION,
  MIN_PUBLISH_COMPLETENESS,
  MIN_PUBLISH_QUALITY,
  REQUIRED_FIELDS,
  VALID_SCORE_RANGES,

  // Utility Functions
  generateValidationId,
  generateAuditId,
  generateBuilderSessionId,
  generateCareerId,
  generateCareerSlug,

  // Core Classes
  CareerProfileBuilder,
  CareerValidationEngine,
  CareerCompletenessScorer,
  CareerQualityAudit,
} from './career-authoring-framework';

export type {
  // Branded Types
  ValidationId,
  AuditId,
  BuilderSessionId,

  // Validation Types
  ValidationSeverity,
  ValidationIssue,
  ValidationResult,
  ValidationRule,

  // Completeness Types
  DomainCompleteness,
  EvidenceCompletenessMetrics,
  RelationshipCompletenessMetrics,
  CompletenessResult,

  // Quality Audit Types
  QualityDimension,
  MissingIntelligence,
  QualityAuditReport,

  // Builder Types
  CareerV2,
  CareerCategory,
  PsychologyProfile,
  WorkStyleProfile,
  RewardProfile,
  RiskProfile,
  OptionalityProfile,
  EducationProfile,
  IndiaRealityProfile,
  FutureOutlook,
  LifestyleProfile,
  CareerCreationOptions,
  CareerUpdateOptions,
  CareerEnrichmentOptions,
  CareerTemplate,
  BuilderSession,
} from './career-authoring-framework';
