/**
 * CareerOS Ontology Module
 *
 * Knowledge models and schemas for CareerOS.
 */

// Career Evidence System
export {
  CareerEvidenceSystem,
  createEvidence,
  createEvidenceCollection,
  calculateAggregateConfidence,
  evidenceSourceToString,
  validateEvidence,
  generateEvidenceId,
  generateCollectionId,
  EVIDENCE_SCHEMA_VERSION,
} from './career-evidence';

export type {
  EvidenceId,
  EvidenceCollectionId,
  CareerEvidence,
  EvidenceCollection,
  EvidenceSource,
  EvidenceConfidence,
  EvidenceMethodology,
  EvidenceMetadata,
  EvidenceAttribution,
  EvidenceSourceType,
  // ConfidenceLevel BANNED - use Confidence from @/intelligence/confidence
  MethodologyType,
  DataQuality,
  CareerAttributeEvidence,
  PsychologyEvidence,
  WorkStyleEvidence,
  RewardEvidence,
  RiskEvidence,
  OptionalityEvidence,
  EducationEvidence,
  IndiaRealityEvidence,
  FutureEvidence,
  LifestyleEvidence,
  CompleteCareerEvidence,
  EvidenceCreationOptions,
  EvidenceValidationResult,
  EvidenceQuery,
  EvidenceComparison,
  EvidenceAudit,
} from './career-evidence';

// Career Ontology V2
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
} from './career-ontology';

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
  CareerValidationError,
  CareerValidationWarning,
} from './career-ontology';

// Career Relationship Taxonomy
export {
  // Functions
  strengthToScore,
  scoreToStrength,
  RelationshipBuilder,
  validateRelationship,
  filterRelationshipsByType,
  filterRelationshipsByStrength,
  getRelationshipsBySource,
  getRelationshipsByTarget,
  findRelationship,
  calculateRelationshipStats,
  getStrongestRelationships,

  // Type Guards
  isCareerToCareerRelationship,
  isCareerToSkillRelationship,
  isCareerToDegreeRelationship,
  isCareerToExamRelationship,
  isCareerToIndustryRelationship,
  isCareerToCertificationRelationship,
  isCareerToRoleRelationship,
} from './career-relationships';

export type {
  // Relationship Types
  CareerToCareerRelationship,
  CareerToSkillRelationship,
  CareerToDegreeRelationship,
  CareerToExamRelationship,
  CareerToIndustryRelationship,
  CareerToCertificationRelationship,
  CareerToRoleRelationship,
  RelationshipType,

  // Strength & Scoring
  RelationshipStrength,
  StrengthScore,

  // Metadata Types
  RelationshipMetadata,
  CareerToCareerMetadata,
  CareerToSkillMetadata,
  CareerToDegreeMetadata,
  CareerToExamMetadata,
  CareerToIndustryMetadata,
  CareerToCertificationMetadata,
  CareerToRoleMetadata,

  // Relationship Entities
  BaseRelationship,
  CareerToCareerRelationshipEntity,
  CareerToSkillRelationshipEntity,
  CareerToDegreeRelationshipEntity,
  CareerToExamRelationshipEntity,
  CareerToIndustryRelationshipEntity,
  CareerToCertificationRelationshipEntity,
  CareerToRoleRelationshipEntity,
  CareerRelationship,

  // Validation
  RelationshipValidationResult,
} from './career-relationships';

// Indian Market Intelligence Ontology
export {
  // Constants
  SIGNAL_TYPES,
  SIGNAL_TYPE_LABELS,
  SIGNAL_SOURCE_TYPES,
  MARKET_ENTITY_TYPES,
  SKILL_CATEGORIES,
  INDIAN_REGIONS,
  REGION_DISPLAY_NAMES,
  INDIAN_EXAMS,
  EXAM_DISPLAY_NAMES,
  DEFAULT_MARKET_INTELLIGENCE_CONFIG,

  // Repositories
  MarketSignalRepository,
  MarketProfileRepository,
  MarketIntelligenceRepository,
  createMarketIntelligenceRepository,
  createMarketSignal,

  // Calculators
  SOURCE_QUALITY_WEIGHTS,
  getSourceQualityWeight,
  calculateMarketConfidence,
  calculateSignalTypeConfidence,
  calculateDataQualityMetrics,
  calculateMarketFreshness,
  calculateSignalTypeFreshness,
  needsRefresh,
  getRefreshPriority,
  aggregateSignals,
  aggregateSignalsByType,
  detectSignalTrend,
  detectSignalAnomalies,
  calculateOpportunityScore,
  calculateRiskAdjustedScore,
} from './indian-market-intelligence';

export type {
  // Signals
  MarketSignal,
  SignalType,
  SignalSourceType,

  // Entities
  MarketEntity,
  MarketEntityType,
  DataQualityMetrics,

  // Profiles
  CareerMarketProfile,
  CareerStageInfo,
  SkillMarketProfile,
  IndustryMarketProfile,
  RegionMarketProfile,
  ExamMarketProfile,
  EducationPathMarketProfile,

  // Categories
  SkillCategory,
  IndianRegionId,
  IndianExamId,

  // Aggregates
  MarketSnapshot,
  MarketUpdateMetadata,

  // Config
  IndianMarketIntelligenceConfig,
} from './indian-market-intelligence';
