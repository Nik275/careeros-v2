/**
 * CareerOS Career Evidence System
 *
 * Traceability and explainability for every career attribute.
 * Every score is backed by evidence with source, confidence, and methodology.
 */

export {
  CareerEvidenceSystem,
  createEvidence,
  createEvidenceCollection,
  calculateAggregateConfidence,
  evidenceSourceToString,
  // confidenceLevelToString BANNED - Confidence Authority owns formatting
  validateEvidence,
  generateEvidenceId,
  generateCollectionId,
  EVIDENCE_SCHEMA_VERSION,
} from './CareerEvidenceSystem';

export type {
  CareerId,
} from '../career-ontology';

export type {
  // Core Types
  EvidenceId,
  EvidenceCollectionId,
  CareerEvidence,
  EvidenceCollection,
  
  // Evidence Components
  EvidenceSource,
  EvidenceConfidence,
  EvidenceMethodology,
  EvidenceMetadata,
  EvidenceAttribution,
  
  // Enums
  EvidenceSourceType,
  // ConfidenceLevel BANNED - use Confidence from @/intelligence/confidence
  MethodologyType,
  DataQuality,
  
  // Career Attribute Evidence
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
  
  // Complete Career Evidence
  CompleteCareerEvidence,
  
  // Options & Results
  EvidenceCreationOptions,
  EvidenceValidationResult,
  EvidenceQuery,
  EvidenceComparison,
  EvidenceAudit,
} from './CareerEvidenceSystem';
