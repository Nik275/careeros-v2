/**
 * @fileoverview CareerOS constitutional foundation types.
 *
 * These types are intentionally behavior-neutral. They support the Phase 4.0
 * observe-only foundation and do not redirect traffic or enforce policy.
 */

export type AuthorityType =
  | 'StudentUnderstandingAuthority'
  | 'OptionGeneratorAuthority'
  | 'OutcomeTrackerAuthority'
  | 'IntelligenceOrchestrator'
  | 'DecisionAuthority'
  | 'ConfidenceAuthority'
  | 'UnknownAuthority';

export type ConstitutionalCapability =
  | 'UNDERSTAND'
  | 'GENERATE'
  | 'LEARN'
  | 'ORCHESTRATE'
  | 'DECIDE'
  | 'CONFIDENCE'
  | 'SHARED'
  | 'UNKNOWN';

export type OwnershipStatus =
  | 'active'
  | 'legacy-shadow'
  | 'deprecated'
  | 'test-only'
  | 'shared-neutral'
  | 'review-required';

export type ConstitutionalLayer =
  | 'authority-internal'
  | 'authority-facade'
  | 'orchestrator'
  | 'shared-neutral'
  | 'public-surface'
  | 'test-only'
  | 'unknown';

export type ViolationType =
  | 'OWNERSHIP_VIOLATION'
  | 'AUTHORITY_VIOLATION'
  | 'DEPENDENCY_VIOLATION'
  | 'PUBLIC_SURFACE_VIOLATION'
  | 'REGISTRY_VIOLATION';

export type ViolationSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type EnforcementMode = 'observe';

export interface OwnershipMetadata {
  sourceDocument: string;
  sourceWave: string;
  status: OwnershipStatus;
  notes?: string;
}

export interface OwnershipRecord {
  modulePath: string;
  owner: AuthorityType;
  capability: ConstitutionalCapability;
  domain: string;
  purpose: string;
  classNames: readonly string[];
  functionNames: readonly string[];
  dependencies: readonly string[];
  consumers: readonly string[];
  layer?: ConstitutionalLayer;
  metadata: OwnershipMetadata;
}

export interface OwnershipSummary {
  totalRecords: number;
  authorityCounts: Readonly<Record<AuthorityType, number>>;
  capabilityCounts: Readonly<Record<ConstitutionalCapability, number>>;
  domainCounts: Readonly<Record<string, number>>;
  sourceDocuments: readonly string[];
}

export interface DependencyRelationship {
  sourceModule: string;
  targetModule: string;
  relationshipType: 'import' | 'export' | 'dynamic-import' | 'runtime-call' | 'event' | 'unknown';
  evidence?: string;
}

export interface AuthorityUsageRecord {
  sourceModule: string;
  targetAuthority: AuthorityType;
  operation: string;
  evidence?: string;
}

export interface ValidationInput {
  modulePaths?: readonly string[];
  dependencies?: readonly DependencyRelationship[];
  authorityUsages?: readonly AuthorityUsageRecord[];
  publicSurfaces?: readonly PublicSurfaceRecord[];
}

export interface PublicSurfaceRecord {
  surfaceModule: string;
  exposedModules: readonly string[];
  evidence?: string;
}

export interface ViolationRecord {
  violationId: string;
  type: ViolationType;
  severity: ViolationSeverity;
  observedAt: string;
  enforcementMode: EnforcementMode;
  status: 'observed';
  description: string;
  impact: string;
  resolutionStrategy: string;
  modulePath?: string;
  sourceModule?: string;
  targetModule?: string;
  sourceAuthority?: AuthorityType;
  targetAuthority?: AuthorityType;
  evidence: readonly string[];
}

export interface ValidationResult {
  mode: EnforcementMode;
  observedAt: string;
  checkedModules: number;
  checkedDependencies: number;
  checkedAuthorityUsages: number;
  checkedPublicSurfaces: number;
  violations: readonly ViolationRecord[];
  summary: {
    totalViolations: number;
    byType: Readonly<Record<ViolationType, number>>;
    bySeverity: Readonly<Record<ViolationSeverity, number>>;
  };
}

export interface AuditRecord {
  auditId: string;
  createdAt: string;
  mode: EnforcementMode;
  registrySummary: OwnershipSummary;
  validationSummary: ValidationResult['summary'];
  ownershipRecordsReviewed: number;
  dependencyRelationshipsReviewed: number;
  authorityUsageRecordsReviewed: number;
  violations: readonly ViolationRecord[];
  notes: readonly string[];
}

export interface ConstitutionalAuditReport {
  audit: AuditRecord;
  authorityUsage: Readonly<Record<AuthorityType, number>>;
  dependencyRelationships: readonly DependencyRelationship[];
  ownershipGaps: readonly string[];
}

export interface ConstitutionalLogger {
  logViolation(record: ViolationRecord): void;
  logAudit(record: AuditRecord): void;
}

export interface ConstitutionalRegistryQuery {
  owner?: AuthorityType;
  capability?: ConstitutionalCapability;
  domain?: string;
  status?: OwnershipStatus;
  modulePathIncludes?: string;
}

export interface ConstitutionalRegistryHealth {
  healthy: boolean;
  totalRecords: number;
  duplicateModules: readonly string[];
  missingOwners: readonly string[];
  notes: readonly string[];
}
