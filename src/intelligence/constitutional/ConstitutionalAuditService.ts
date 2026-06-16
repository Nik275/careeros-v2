/**
 * @fileoverview Observe-mode constitutional audit service.
 *
 * Generates in-memory audit reports from registry and validator output. This
 * service does not persist data, redirect traffic, or enforce policy.
 */

import type {
  AuthorityType,
  AuditRecord,
  ConstitutionalAuditReport,
  ConstitutionalLogger,
  DependencyRelationship,
  ValidationResult,
} from './ConstitutionalTypes';
import { ConstitutionalOwnershipRegistry } from './ConstitutionalOwnershipRegistry';

const AUDIT_AUTHORITIES: readonly AuthorityType[] = [
  'StudentUnderstandingAuthority',
  'OptionGeneratorAuthority',
  'OutcomeTrackerAuthority',
  'IntelligenceOrchestrator',
  'DecisionAuthority',
  'ConfidenceAuthority',
  'UnknownAuthority',
] as const;

export interface ConstitutionalAuditRequest {
  validationResult?: ValidationResult;
  dependencyRelationships?: readonly DependencyRelationship[];
  notes?: readonly string[];
}

export interface ConstitutionalAuditServiceOptions {
  registry?: ConstitutionalOwnershipRegistry;
  logger?: ConstitutionalLogger;
  now?: () => string;
}

export class ConstitutionalAuditService {
  private readonly registry: ConstitutionalOwnershipRegistry;
  private readonly logger?: ConstitutionalLogger;
  private readonly now: () => string;
  private readonly history: AuditRecord[] = [];

  constructor(options: ConstitutionalAuditServiceOptions = {}) {
    this.registry = options.registry ?? ConstitutionalOwnershipRegistry.createDefault();
    this.logger = options.logger;
    this.now = options.now ?? (() => new Date().toISOString());
  }

  generateAuditReport(request: ConstitutionalAuditRequest = {}): ConstitutionalAuditReport {
    const validationResult = request.validationResult ?? emptyValidationResult(this.now());
    const registrySummary = this.registry.getSummary();
    const dependencyRelationships = request.dependencyRelationships ?? [];
    const audit: AuditRecord = {
      auditId: createAuditId(this.history.length + 1),
      createdAt: this.now(),
      mode: 'observe',
      registrySummary,
      validationSummary: validationResult.summary,
      ownershipRecordsReviewed: registrySummary.totalRecords,
      dependencyRelationshipsReviewed: dependencyRelationships.length,
      authorityUsageRecordsReviewed: validationResult.checkedAuthorityUsages,
      violations: validationResult.violations,
      notes: [
        'Phase 4.0 observe-only audit. No enforcement or traffic redirection occurred.',
        ...(request.notes ?? []),
      ],
    };

    this.history.push(audit);
    this.logger?.logAudit(audit);

    return {
      audit,
      authorityUsage: this.calculateAuthorityUsage(),
      dependencyRelationships,
      ownershipGaps: this.calculateOwnershipGaps(validationResult),
    };
  }

  getAuditHistory(): readonly AuditRecord[] {
    return [...this.history];
  }

  clearHistory(): void {
    this.history.length = 0;
  }

  private calculateAuthorityUsage(): Readonly<Record<AuthorityType, number>> {
    const usage = Object.fromEntries(
      AUDIT_AUTHORITIES.map((authority) => [authority, 0])
    ) as Record<AuthorityType, number>;

    for (const record of this.registry.listRecords()) {
      usage[record.owner] += 1;
    }

    return usage;
  }

  private calculateOwnershipGaps(validationResult: ValidationResult): readonly string[] {
    return validationResult.violations
      .filter((violation) => violation.type === 'OWNERSHIP_VIOLATION')
      .map((violation) => violation.modulePath ?? violation.sourceModule ?? 'unknown');
  }
}

function emptyValidationResult(observedAt: string): ValidationResult {
  return {
    mode: 'observe',
    observedAt,
    checkedModules: 0,
    checkedDependencies: 0,
    checkedAuthorityUsages: 0,
    checkedPublicSurfaces: 0,
    violations: [],
    summary: {
      totalViolations: 0,
      byType: {
        OWNERSHIP_VIOLATION: 0,
        AUTHORITY_VIOLATION: 0,
        DEPENDENCY_VIOLATION: 0,
        PUBLIC_SURFACE_VIOLATION: 0,
        REGISTRY_VIOLATION: 0,
      },
      bySeverity: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0,
      },
    },
  };
}

function createAuditId(sequence: number): string {
  return `constitutional-audit-${sequence.toString().padStart(6, '0')}`;
}
