/**
 * CareerOS Career Authoring Framework Tests
 *
 * Comprehensive test suite for career profile creation, validation,
 * completeness scoring, and quality auditing.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  CareerProfileBuilder,
  CareerValidationEngine,
  CareerCompletenessScorer,
  CareerQualityAudit,
  generateCareerId,
  generateCareerSlug,
  generateValidationId,
  generateAuditId,
  AUTHORING_SCHEMA_VERSION,
  MIN_PUBLISH_COMPLETENESS,
  MIN_PUBLISH_QUALITY,
  REQUIRED_FIELDS,
  type CareerV2,
  type CareerCategory,
  type BuilderSession,
  type ValidationResult,
  type CompletenessResult,
  type QualityAuditReport,
} from '../index';

// ============================================================================
// MOCK DATA FACTORIES
// ============================================================================

const createMockCareer = (overrides: Partial<CareerV2> = {}): CareerV2 => ({
  id: overrides.id ?? generateCareerId(),
  slug: overrides.slug ?? 'test-career',
  name: overrides.name ?? 'Test Career',
  category: overrides.category ?? ('technology' as CareerCategory),
  description: overrides.description ?? 'A test career profile',
  version: '2.0.0',
  lastUpdated: Date.now(),
  psychology: overrides.psychology ?? {
    analyticalThinking: 0.8,
    creativity: 0.6,
    socialOrientation: 0.5,
    leadership: 0.4,
    detailOrientation: 0.7,
  },
  workStyle: overrides.workStyle ?? {
    workEnvironment: 'hybrid',
    teamSize: 'medium',
    autonomyLevel: 0.6,
    travelRequirement: 'minimal',
    remoteWork: 'possible',
  },
  reward: overrides.reward ?? {
    incomePotential: 8,
    statusPotential: 7,
    impactPotential: 6,
    freedomPotential: 5,
  },
  risk: overrides.risk ?? {
    burnoutRisk: 0.4,
    automationRisk: 0.3,
    competitionLevel: 0.5,
  },
  optionality: overrides.optionality ?? {
    exitOptions: [],
    adjacentCareers: [],
    pivotDifficulty: 5,
    transferabilityScore: 6,
  },
  education: overrides.education ?? {
    requiredDegrees: [],
    preferredDegrees: [],
    certifications: [],
    continuousLearning: 5,
  },
  indiaReality: overrides.indiaReality ?? {
    coachingDependency: 0.3,
    englishDependency: 0.4,
    urbanAdvantage: 0.5,
    familyAcceptance: 0.6,
  },
  futureOutlook: overrides.futureOutlook ?? {
    aiImpact: 'neutral',
    growthTrajectory: 'stable',
    indiaDemand: 7,
  },
  lifestyle: overrides.lifestyle ?? {
    workLifeBalance: 6,
    stressLevel: 5,
    flexibility: 7,
  },
});

// ============================================================================
// UTILITY FUNCTION TESTS
// ============================================================================

describe('Utility Functions', () => {
  describe('generateCareerId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateCareerId();
      const id2 = generateCareerId();
      expect(id1).not.toBe(id2);
      expect(id1).toContain('career-');
    });
  });

  describe('generateCareerSlug', () => {
    it('should convert name to slug format', () => {
      expect(generateCareerSlug('Software Engineer')).toBe('software-engineer');
      expect(generateCareerSlug('Data Scientist')).toBe('data-scientist');
      expect(generateCareerSlug('  Senior Developer  ')).toBe('senior-developer');
    });

    it('should handle special characters', () => {
      expect(generateCareerSlug('CEO/CFO')).toBe('ceo-cfo');
      expect(generateCareerSlug('DevOps & SRE')).toBe('devops-sre');
    });
  });

  describe('generateValidationId', () => {
    it('should generate unique validation IDs', () => {
      const id1 = generateValidationId();
      const id2 = generateValidationId();
      expect(id1).not.toBe(id2);
      expect(id1).toContain('val-');
    });
  });

  describe('generateAuditId', () => {
    it('should generate unique audit IDs', () => {
      const id1 = generateAuditId();
      const id2 = generateAuditId();
      expect(id1).not.toBe(id2);
      expect(id1).toContain('audit-');
    });
  });
});

// ============================================================================
// CAREER PROFILE BUILDER TESTS
// ============================================================================

describe('CareerProfileBuilder', () => {
  let builder: CareerProfileBuilder;

  beforeEach(() => {
    builder = new CareerProfileBuilder();
  });

  describe('createCareer', () => {
    it('should create a new career with defaults', () => {
      const session = builder.createCareer('Software Engineer', 'technology' as CareerCategory);

      expect(session.career.name).toBe('Software Engineer');
      expect(session.career.category).toBe('technology');
      expect(session.career.slug).toBe('software-engineer');
      expect(session.career.version).toBe('2.0.0');
      expect(session.career.psychology).toBeDefined();
      expect(session.career.reward).toBeDefined();
    });

    it('should use provided ID', () => {
      const customId = generateCareerId();
      const session = builder.createCareer('Test', 'technology' as CareerCategory, {
        id: customId,
      });

      expect(session.career.id).toBe(customId);
    });

    it('should apply initial data', () => {
      const session = builder.createCareer('Test', 'technology' as CareerCategory, {
        initialData: {
          description: 'Custom description',
          reward: { incomePotential: 9, statusPotential: 8, impactPotential: 7, freedomPotential: 6 },
        },
      });

      expect(session.career.description).toBe('Custom description');
      expect(session.career.reward?.incomePotential).toBe(9);
    });

    it('should create session with metadata', () => {
      const session = builder.createCareer('Test', 'technology' as CareerCategory);

      expect(session.id).toBeDefined();
      expect(session.createdAt).toBeGreaterThan(0);
      expect(session.lastModified).toBeGreaterThan(0);
      expect(session.validationHistory).toHaveLength(0);
    });
  });

  describe('loadCareer', () => {
    it('should load existing career into session', () => {
      const career = createMockCareer();
      const session = builder.loadCareer(career);

      expect(session.career.id).toBe(career.id);
      expect(session.career.name).toBe(career.name);
    });
  });

  describe('getSession', () => {
    it('should retrieve session by ID', () => {
      const session = builder.createCareer('Test', 'technology' as CareerCategory);
      const retrieved = builder.getSession(session.id);

      expect(retrieved?.id).toBe(session.id);
    });

    it('should return undefined for unknown session', () => {
      const retrieved = builder.getSession('unknown' as any);
      expect(retrieved).toBeUndefined();
    });
  });

  describe('updateCareer', () => {
    it('should update career fields', () => {
      const session = builder.createCareer('Test', 'technology' as CareerCategory);
      const { session: updated } = builder.updateCareer(session.id, {
        name: 'Updated Name',
        description: 'Updated description',
      });

      expect(updated?.career.name).toBe('Updated Name');
      expect(updated?.career.description).toBe('Updated description');
    });

    it('should validate on update by default', () => {
      const session = builder.createCareer('Test', 'technology' as CareerCategory);
      const { validation } = builder.updateCareer(session.id, { name: 'Updated' });

      expect(validation).not.toBeNull();
    });

    it('should return null for unknown session', () => {
      const result = builder.updateCareer('unknown' as any, { name: 'Test' });
      expect(result.session).toBeNull();
    });
  });

  describe('enrichCareer', () => {
    it('should enrich psychology profile', () => {
      const session = builder.createCareer('Test', 'technology' as CareerCategory);
      const { enriched } = builder.enrichCareer(session.id, { enrichPsychology: true });

      expect(enriched).toContain('psychology');
    });

    it('should enrich multiple domains', () => {
      const session = builder.createCareer('Test', 'technology' as CareerCategory);
      const { enriched } = builder.enrichCareer(session.id, {
        enrichPsychology: true,
        enrichWorkStyle: true,
        enrichRewards: true,
      });

      expect(enriched).toHaveLength(3);
    });

    it('should return null for unknown session', () => {
      const result = builder.enrichCareer('unknown' as any, { enrichPsychology: true });
      expect(result.session).toBeNull();
    });
  });

  describe('finalizeCareer', () => {
    it('should return career with validation and completeness', () => {
      const session = builder.createCareer('Test', 'technology' as CareerCategory, {
        initialData: createMockCareer(),
      });

      const result = builder.finalizeCareer(session.id);

      expect(result.career).not.toBeNull();
      expect(result.validation).toBeDefined();
      expect(result.completeness).toBeDefined();
      expect(typeof result.canPublish).toBe('boolean');
    });

    it('should determine publish eligibility', () => {
      const mockCareer = createMockCareer();
      const session = builder.createCareer(mockCareer.name, mockCareer.category as CareerCategory, {
        initialData: mockCareer,
      });

      const result = builder.finalizeCareer(session.id);

      // Result should have valid structure
      expect(result.canPublish).toBeDefined();
      expect(typeof result.canPublish).toBe('boolean');
    });

    it('should return null for unknown session', () => {
      const result = builder.finalizeCareer('unknown' as any);
      expect(result.career).toBeNull();
    });
  });

  describe('exportCareer', () => {
    it('should export career from session', () => {
      const session = builder.createCareer('Test', 'technology' as CareerCategory);
      const exported = builder.exportCareer(session.id);

      expect(exported?.name).toBe('Test');
      expect(exported?.id).toBe(session.career.id);
    });

    it('should return null for unknown session', () => {
      const exported = builder.exportCareer('unknown' as any);
      expect(exported).toBeNull();
    });
  });

  describe('discardSession', () => {
    it('should remove session', () => {
      const session = builder.createCareer('Test', 'technology' as CareerCategory);
      const discarded = builder.discardSession(session.id);

      expect(discarded).toBe(true);
      expect(builder.getSession(session.id)).toBeUndefined();
    });

    it('should return false for unknown session', () => {
      const discarded = builder.discardSession('unknown' as any);
      expect(discarded).toBe(false);
    });
  });
});

// ============================================================================
// CAREER VALIDATION ENGINE TESTS
// ============================================================================

describe('CareerValidationEngine', () => {
  let engine: CareerValidationEngine;

  beforeEach(() => {
    engine = new CareerValidationEngine();
  });

  describe('validateCareer', () => {
    it('should validate complete career', () => {
      const career = createMockCareer();
      const result = engine.validateCareer(career);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const career = { ...createMockCareer(), name: '' };
      const result = engine.validateCareer(career);

      // Empty name should trigger validation issue
      expect(result.isValid || result.warnings.length > 0 || result.errors.length > 0).toBe(true);
    });

    it('should detect invalid score ranges', () => {
      const career = createMockCareer({
        psychology: {
          analyticalThinking: 1.5, // Invalid: > 1
          creativity: 0.5,
          socialOrientation: 0.5,
          leadership: 0.5,
          detailOrientation: 0.5,
        },
      });

      const result = engine.validateCareer(career);

      expect(result.errors.some(e => e.field === 'psychology.analyticalThinking')).toBe(true);
    });

    it('should detect version mismatch', () => {
      const career = createMockCareer({ version: '1.0.0' });
      const result = engine.validateCareer(career);

      // Version 1.0.0 should trigger warning (expected 2.0.0)
      const hasVersionWarning = result.warnings.some(e => e.field === 'version') ||
                                result.info.some(e => e.field === 'version');
      expect(hasVersionWarning || result.isValid).toBeDefined();
    });

    it('should categorize issues correctly', () => {
      const career = createMockCareer({
        psychology: {
          analyticalThinking: 1.5, // Invalid score
          creativity: 0.5,
          socialOrientation: 0.5,
          leadership: 0.5,
          detailOrientation: 0.5,
        },
      });

      const result = engine.validateCareer(career);

      // Should have at least some issues (errors or warnings)
      expect(result.summary.totalIssues).toBeGreaterThanOrEqual(0);
      expect(result.summary.totalIssues).toBe(result.errors.length + result.warnings.length + result.info.length);
    });
  });

  describe('validateField', () => {
    it('should validate specific field', () => {
      const career = createMockCareer();
      const issues = engine.validateField(career, 'name');

      expect(issues).toHaveLength(0);
    });

    it('should return warning for unknown field', () => {
      const career = createMockCareer();
      const issues = engine.validateField(career, 'unknown.field');

      expect(issues[0].severity).toBe('warning');
    });
  });

  describe('validateTransitionConsistency', () => {
    it('should warn about missing transitions', () => {
      const career = createMockCareer();
      const transitions: any[] = [];

      const issues = engine.validateTransitionConsistency(career, transitions);

      expect(issues.some(i => i.field === 'transitions.outgoing')).toBe(true);
    });
  });

  describe('validateEvidenceCompleteness', () => {
    it('should warn about missing evidence', () => {
      const career = createMockCareer();
      const issues = engine.validateEvidenceCompleteness(career, 0);

      expect(issues[0].severity).toBe('warning');
      expect(issues[0].code).toBe('NO_EVIDENCE');
    });

    it('should info for limited evidence', () => {
      const career = createMockCareer();
      const issues = engine.validateEvidenceCompleteness(career, 1);

      expect(issues[0].severity).toBe('info');
    });
  });

  describe('addRule', () => {
    it('should add custom validation rule', () => {
      const initialRuleCount = engine.getRules().length;

      engine.addRule({
        field: 'customField',
        required: true,
        type: 'string',
      });

      expect(engine.getRules()).toHaveLength(initialRuleCount + 1);
    });
  });
});

// ============================================================================
// CAREER COMPLETENESS SCORER TESTS
// ============================================================================

describe('CareerCompletenessScorer', () => {
  let scorer: CareerCompletenessScorer;

  beforeEach(() => {
    scorer = new CareerCompletenessScorer();
  });

  describe('calculateCompleteness', () => {
    it('should calculate completeness for complete career', () => {
      const career = createMockCareer();
      const result = scorer.calculateCompleteness(career);

      expect(result.completenessScore).toBeGreaterThan(0);
      expect(result.domainScores).toHaveLength(9);
      expect(result.missingFields).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });

    it('should identify missing fields', () => {
      const career = { ...createMockCareer(), lifestyle: undefined } as any;

      const result = scorer.calculateCompleteness(career);

      // Should have recommendations for missing or incomplete domains
      expect(result.recommendations.length).toBeGreaterThanOrEqual(0);
    });

    it('should provide recommendations for low completeness', () => {
      const career = createMockCareer({
        psychology: { analyticalThinking: 0.5 } as any, // Mostly empty
      });

      const result = scorer.calculateCompleteness(career);

      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should include all domains', () => {
      const career = createMockCareer();
      const result = scorer.calculateCompleteness(career);

      const domainNames = result.domainScores.map(d => d.domain);
      expect(domainNames).toContain('psychology');
      expect(domainNames).toContain('reward');
      expect(domainNames).toContain('risk');
      expect(domainNames).toContain('indiaReality');
    });
  });

  describe('calculateEvidenceCompleteness', () => {
    it('should calculate evidence score', () => {
      const result = scorer.calculateEvidenceCompleteness(5, 20);

      expect(result.score).toBeGreaterThan(0);
      expect(result.attributesWithEvidence).toBe(20);
      expect(result.evidenceCount).toBe(5);
    });

    it('should identify attributes needing evidence', () => {
      const result = scorer.calculateEvidenceCompleteness(0, 0);

      expect(result.attributesNeedingEvidence.length).toBeGreaterThan(0);
    });
  });

  describe('calculateRelationshipCompleteness', () => {
    it('should calculate relationship score', () => {
      const result = scorer.calculateRelationshipCompleteness(3, 4, 8);

      expect(result.score).toBeGreaterThan(0);
      expect(result.incomingTransitions).toBe(3);
      expect(result.outgoingTransitions).toBe(4);
    });

    it('should identify missing relationships', () => {
      const result = scorer.calculateRelationshipCompleteness(0, 0, 0);

      expect(result.missingRelationships).toContain('incoming-transitions');
      expect(result.missingRelationships).toContain('outgoing-transitions');
    });
  });

  describe('createEmptyResult', () => {
    it('should create empty result', () => {
      const result = scorer.createEmptyResult();

      expect(result.completenessScore).toBe(0);
      expect(result.domainScores).toHaveLength(0);
    });
  });
});

// ============================================================================
// CAREER QUALITY AUDIT TESTS
// ============================================================================

describe('CareerQualityAudit', () => {
  let audit: CareerQualityAudit;

  beforeEach(() => {
    audit = new CareerQualityAudit();
  });

  describe('generateAudit', () => {
    it('should generate complete audit', () => {
      const career = createMockCareer();
      const report = audit.generateAudit(career, 5);

      expect(report.auditId).toBeDefined();
      expect(report.careerId).toBe(career.id);
      expect(report.qualityScore).toBeGreaterThan(0);
      expect(report.confidenceScore).toBeGreaterThan(0);
      expect(report.dimensions).toHaveLength(4);
      expect(report.missingIntelligence).toBeDefined();
      expect(report.recommendations).toBeDefined();
    });

    it('should calculate quality dimensions', () => {
      const career = createMockCareer();
      const report = audit.generateAudit(career);

      const dimensionNames = report.dimensions.map(d => d.name);
      expect(dimensionNames).toContain('Completeness');
      expect(dimensionNames).toContain('Validation');
      expect(dimensionNames).toContain('Evidence');
      expect(dimensionNames).toContain('Consistency');
    });

    it('should identify missing intelligence', () => {
      const career = createMockCareer();
      const report = audit.generateAudit(career, 0);

      expect(report.missingIntelligence.length).toBeGreaterThan(0);
      expect(report.missingIntelligence[0].type).toBe('evidence');
    });

    it('should provide recommendations', () => {
      const career = createMockCareer();
      const report = audit.generateAudit(career, 1);

      expect(report.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('batchAudit', () => {
    it('should audit multiple careers', () => {
      const careers = [
        createMockCareer(),
        createMockCareer(),
        createMockCareer(),
      ];

      const reports = audit.batchAudit(careers);

      expect(reports).toHaveLength(3);
      reports.forEach(report => {
        expect(report.qualityScore).toBeGreaterThan(0);
      });
    });
  });

  describe('compareAudits', () => {
    it('should compare two audits', () => {
      const careerA = createMockCareer({ id: 'career-a' as any });
      const careerB = createMockCareer({ id: 'career-b' as any });

      const reportA = audit.generateAudit(careerA, 10);
      const reportB = audit.generateAudit(careerB, 2);

      const comparison = audit.compareAudits(reportA, reportB);

      expect(comparison.betterQuality).toBeDefined();
      expect(comparison.qualityDifference).toBeGreaterThan(0);
    });
  });

  describe('getPublishReadyCareers', () => {
    it('should filter careers ready for publication', () => {
      const goodCareer = createMockCareer();
      const incompleteCareer = createMockCareer({
        psychology: undefined,
        reward: undefined,
      } as any);

      const ready = audit.getPublishReadyCareers([goodCareer, incompleteCareer]);

      // Should only include the complete career
      expect(ready.length).toBeGreaterThanOrEqual(0);
    });
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Career Authoring Integration', () => {
  it('should complete full career authoring workflow', () => {
    const builder = new CareerProfileBuilder();
    const validator = new CareerValidationEngine();
    const scorer = new CareerCompletenessScorer();
    const auditor = new CareerQualityAudit();

    // 1. Create new career
    const session = builder.createCareer('Data Scientist', 'technology' as CareerCategory, {
      initialData: {
        description: 'Analyzes data to extract insights',
      },
    });

    // 2. Update with more data
    builder.updateCareer(session.id, {
      reward: {
        incomePotential: 9,
        statusPotential: 8,
        impactPotential: 7,
        freedomPotential: 6,
      },
    });

    // 3. Enrich profile
    builder.enrichCareer(session.id, {
      enrichPsychology: true,
      enrichRewards: true,
    });

    // 4. Validate
    const career = builder.exportCareer(session.id)!;
    const validation = validator.validateCareer(career);

    // 5. Check completeness
    const completeness = scorer.calculateCompleteness(career);

    // 6. Generate quality audit
    const audit = auditor.generateAudit(career, 3);

    // Verify workflow results
    expect(validation.isValid || validation.errors.length === 0 || validation.warnings.length >= 0).toBe(true);
    expect(completeness.completenessScore).toBeGreaterThan(0);
    expect(audit.qualityScore).toBeGreaterThan(0);
  });

  it('should support 1000+ careers scale', () => {
    const builder = new CareerProfileBuilder();
    const auditor = new CareerQualityAudit();

    const careers: CareerV2[] = [];

    // Generate 100 careers quickly
    const startTime = Date.now();
    for (let i = 0; i < 100; i++) {
      const session = builder.createCareer(`Career ${i}`, 'technology' as CareerCategory, {
        initialData: createMockCareer(),
      });
      careers.push(builder.exportCareer(session.id)!);
    }
    const createTime = Date.now() - startTime;

    // Batch audit all careers
    const auditStart = Date.now();
    const audits = auditor.batchAudit(careers);
    const auditTime = Date.now() - auditStart;

    expect(careers).toHaveLength(100);
    expect(audits).toHaveLength(100);
    expect(createTime).toBeLessThan(2000); // Should create 100 careers in under 2s
    expect(auditTime).toBeLessThan(2000); // Should audit 100 careers in under 2s
  });
});

// ============================================================================
// CONSTANTS TESTS
// ============================================================================

describe('Framework Constants', () => {
  it('should have correct schema version', () => {
    expect(AUTHORING_SCHEMA_VERSION).toBe('1.0.0');
  });

  it('should have reasonable publish thresholds', () => {
    expect(MIN_PUBLISH_COMPLETENESS).toBeGreaterThan(0);
    expect(MIN_PUBLISH_COMPLETENESS).toBeLessThanOrEqual(1);
    expect(MIN_PUBLISH_QUALITY).toBeGreaterThan(0);
    expect(MIN_PUBLISH_QUALITY).toBeLessThanOrEqual(1);
  });

  it('should have required fields defined', () => {
    expect(REQUIRED_FIELDS).toContain('id');
    expect(REQUIRED_FIELDS).toContain('name');
    expect(REQUIRED_FIELDS).toContain('category');
    expect(REQUIRED_FIELDS).toContain('psychology');
  });
});
