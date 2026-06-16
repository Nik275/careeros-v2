import { describe, expect, it } from 'vitest';
import {
  CONSTITUTIONAL_EVENT_DEFINITIONS,
  ConstitutionalAuditService,
  ConstitutionalOwnershipRegistry,
  ConstitutionalValidator,
  GENERATED_OWNERSHIP_SOURCE,
  createConstitutionalEvent,
  type ViolationRecord,
} from '../index';

const FIXED_TIME = '2026-06-05T00:00:00.000Z';

describe('constitutional foundation layer', () => {
  it('loads the read-only ownership registry from Wave 3.3 inventory data', () => {
    const registry = ConstitutionalOwnershipRegistry.createDefault();
    const summary = registry.getSummary();

    expect(GENERATED_OWNERSHIP_SOURCE.totalRecords).toBe(444);
    expect(summary.totalRecords).toBe(444);
    expect(summary.authorityCounts.StudentUnderstandingAuthority).toBe(50);
    expect(summary.authorityCounts.OptionGeneratorAuthority).toBe(339);
    expect(summary.authorityCounts.OutcomeTrackerAuthority).toBe(55);
    expect(
      registry.getOwner('src/intelligence/recommendation-engine/RecommendationEngine.ts')
    ).toBe('OptionGeneratorAuthority');
    expect(registry.getOwner('.\\src\\intelligence\\student-model\\StudentBelief.ts')).toBe(
      'StudentUnderstandingAuthority'
    );
    expect(registry.getHealth().healthy).toBe(true);
  });

  it('observes ownership, authority, and dependency violations without enforcing them', () => {
    const loggedViolations: ViolationRecord[] = [];
    const validator = new ConstitutionalValidator({
      observedAt: () => FIXED_TIME,
      logger: {
        logViolation: (record) => loggedViolations.push(record),
        logAudit: () => undefined,
      },
    });

    const result = validator.validate({
      modulePaths: ['src/intelligence/not-mapped/MissingIntelligence.ts'],
      dependencies: [
        {
          sourceModule: 'src/intelligence/recommendation-engine/RecommendationEngine.ts',
          targetModule: 'src/intelligence/student-model/StudentBelief.ts',
          relationshipType: 'import',
          evidence: 'unit-test cross-authority import',
        },
      ],
      authorityUsages: [
        {
          sourceModule: 'src/intelligence/recommendation-engine/RecommendationEngine.ts',
          targetAuthority: 'OutcomeTrackerAuthority',
          operation: 'recordLearningSignal',
          evidence: 'unit-test direct authority call',
        },
      ],
    });

    expect(result.mode).toBe('observe');
    expect(result.observedAt).toBe(FIXED_TIME);
    expect(result.summary.totalViolations).toBe(3);
    expect(result.summary.byType.OWNERSHIP_VIOLATION).toBe(1);
    expect(result.summary.byType.DEPENDENCY_VIOLATION).toBe(1);
    expect(result.summary.byType.AUTHORITY_VIOLATION).toBe(1);
    expect(result.violations.every((violation) => violation.enforcementMode === 'observe')).toBe(
      true
    );
    expect(loggedViolations).toHaveLength(3);
  });

  it('allows orchestrator-owned dependencies to reach authority-owned modules', () => {
    const registry = new ConstitutionalOwnershipRegistry([
      {
        modulePath: 'src/intelligence/orchestrator/IntelligenceOrchestrator.ts',
        owner: 'IntelligenceOrchestrator',
        capability: 'ORCHESTRATE',
        domain: 'orchestration',
        purpose: 'Routes constitutional authority calls.',
        classNames: ['IntelligenceOrchestrator'],
        functionNames: [],
        dependencies: [],
        consumers: [],
        metadata: {
          sourceDocument: 'unit-test',
          sourceWave: 'Phase 4.0',
          status: 'active',
        },
      },
      {
        modulePath: 'src/intelligence/student/StudentUnderstandingAuthority.ts',
        owner: 'StudentUnderstandingAuthority',
        capability: 'UNDERSTAND',
        domain: 'student',
        purpose: 'Owns student understanding.',
        classNames: ['StudentUnderstandingAuthority'],
        functionNames: [],
        dependencies: [],
        consumers: [],
        metadata: {
          sourceDocument: 'unit-test',
          sourceWave: 'Phase 4.0',
          status: 'active',
        },
      },
    ]);
    const validator = new ConstitutionalValidator({
      registry,
      observedAt: () => FIXED_TIME,
    });

    const result = validator.validate({
      dependencies: [
        {
          sourceModule: 'src/intelligence/orchestrator/IntelligenceOrchestrator.ts',
          targetModule: 'src/intelligence/student/StudentUnderstandingAuthority.ts',
          relationshipType: 'import',
        },
      ],
    });

    expect(result.summary.totalViolations).toBe(0);
  });

  it('generates observe-only audit reports with ownership, dependency, and violation data', () => {
    const registry = ConstitutionalOwnershipRegistry.createDefault();
    const validator = new ConstitutionalValidator({
      registry,
      observedAt: () => FIXED_TIME,
    });
    const validationResult = validator.validate({
      modulePaths: ['src/intelligence/not-mapped/MissingIntelligence.ts'],
    });
    const loggedAudits: string[] = [];
    const auditService = new ConstitutionalAuditService({
      registry,
      now: () => FIXED_TIME,
      logger: {
        logViolation: () => undefined,
        logAudit: (record) => loggedAudits.push(record.auditId),
      },
    });

    const report = auditService.generateAuditReport({
      validationResult,
      dependencyRelationships: [
        {
          sourceModule: 'src/intelligence/recommendation-engine/RecommendationEngine.ts',
          targetModule: 'src/intelligence/student-model/StudentBelief.ts',
          relationshipType: 'import',
        },
      ],
      notes: ['unit-test audit'],
    });

    expect(report.audit.auditId).toBe('constitutional-audit-000001');
    expect(report.audit.mode).toBe('observe');
    expect(report.audit.ownershipRecordsReviewed).toBe(444);
    expect(report.audit.dependencyRelationshipsReviewed).toBe(1);
    expect(report.audit.violations).toHaveLength(1);
    expect(report.authorityUsage.OptionGeneratorAuthority).toBe(339);
    expect(report.ownershipGaps).toContain('src/intelligence/not-mapped/missingintelligence.ts');
    expect(auditService.getAuditHistory()).toHaveLength(1);
    expect(loggedAudits).toEqual(['constitutional-audit-000001']);
  });

  it('defines constitutional events without dispatching or redirecting traffic', () => {
    expect(CONSTITUTIONAL_EVENT_DEFINITIONS.map((definition) => definition.eventType)).toContain(
      'violation.observed'
    );

    const event = createConstitutionalEvent(
      'validation.started',
      { requestId: 'unit-test-request' },
      {
        eventId: 'constitutional-event-unit-test',
        occurredAt: FIXED_TIME,
      }
    );

    expect(event).toEqual({
      eventId: 'constitutional-event-unit-test',
      eventType: 'validation.started',
      schemaVersion: '1.0.0',
      occurredAt: FIXED_TIME,
      authority: 'IntelligenceOrchestrator',
      enforcementMode: 'observe',
      payload: {
        requestId: 'unit-test-request',
      },
    });
  });
});
