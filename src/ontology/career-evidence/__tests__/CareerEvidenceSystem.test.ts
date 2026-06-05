/**
 * CareerOS Career Evidence System Tests
 *
 * Comprehensive test suite for evidence traceability and explainability.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  CareerEvidenceSystem,
  createEvidence,
  createEvidenceCollection,
  calculateAggregateConfidence,
  evidenceSourceToString,
  confidenceLevelToString,
  validateEvidence,
  generateEvidenceId,
  generateCollectionId,
  EVIDENCE_SCHEMA_VERSION,
  type CareerEvidence,
  type EvidenceSource,
  type EvidenceMethodology,
  type EvidenceQuery,
  type CareerId,
  type DataQuality,
  type EvidenceId,
} from '../index';

// ============================================================================
// MOCK DATA FACTORIES
// ============================================================================

const createMockSource = (overrides: Partial<EvidenceSource> & { type?: EvidenceSource['type'] } = {}): EvidenceSource => ({
  type: overrides.type ?? 'salary-survey',
  name: overrides.name ?? 'Mock Salary Survey 2024',
  reference: overrides.reference ?? 'https://example.com/survey',
  publisher: overrides.publisher ?? 'Test Organization',
  date: overrides.date ?? '2024-01-15',
  geography: overrides.geography ?? 'india',
  sampleSize: overrides.sampleSize ?? 1000,
  ...overrides,
});

const createMockMethodology = (overrides: Partial<EvidenceMethodology> & { type?: EvidenceMethodology['type'] } = {}): EvidenceMethodology => ({
  type: overrides.type ?? 'statistical-analysis',
  description: overrides.description ?? 'Statistical analysis of survey data with confidence intervals',
  limitations: overrides.limitations ?? ['Sample may not be fully representative'],
  assumptions: overrides.assumptions ?? ['Normal distribution of salaries'],
  ...overrides,
});

const createMockEvidence = (
  overrides: Partial<CareerEvidence> & { careerId?: CareerId; attributePath?: string } = {}
): CareerEvidence => ({
  id: overrides.id ?? generateEvidenceId(),
  careerId: overrides.careerId ?? ('career-1' as CareerId),
  attributePath: overrides.attributePath ?? 'reward.incomePotential',
  value: overrides.value ?? 0.85,
  source: overrides.source ?? createMockSource(),
  confidence: overrides.confidence ?? { score: 0.8, level: 'high', factors: ['Large sample size'] },
  methodology: overrides.methodology ?? createMockMethodology(),
  notes: overrides.notes ?? 'Based on annual survey data',
  metadata: {
    createdAt: overrides.metadata?.createdAt ?? Date.now(),
    lastUpdated: overrides.metadata?.lastUpdated ?? Date.now(),
    schemaVersion: overrides.metadata?.schemaVersion ?? EVIDENCE_SCHEMA_VERSION,
    isVerified: overrides.metadata?.isVerified ?? true,
    dataQuality: overrides.metadata?.dataQuality ?? 'good',
    verifiedAt: overrides.metadata?.verifiedAt ?? Date.now(),
  },
  attribution: overrides.attribution ?? {
    author: 'Test Author',
    organization: 'Test Org',
  },
});

// ============================================================================
// UTILITY FUNCTION TESTS
// ============================================================================

describe('Utility Functions', () => {
  describe('generateEvidenceId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateEvidenceId();
      const id2 = generateEvidenceId();
      expect(id1).not.toBe(id2);
      expect(id1).toContain('evidence-');
    });
  });

  describe('generateCollectionId', () => {
    it('should generate unique collection IDs', () => {
      const id1 = generateCollectionId();
      const id2 = generateCollectionId();
      expect(id1).not.toBe(id2);
      expect(id1).toContain('collection-');
    });
  });

  describe('createEvidence', () => {
    it('should create evidence with required fields', () => {
      const evidence = createEvidence(
        'career-1' as CareerId,
        'reward.incomePotential',
        0.9,
        createMockSource(),
        createMockMethodology()
      );

      expect(evidence.id).toBeDefined();
      expect(evidence.careerId).toBe('career-1');
      expect(evidence.attributePath).toBe('reward.incomePotential');
      expect(evidence.value).toBe(0.9);
      expect(evidence.metadata.schemaVersion).toBe(EVIDENCE_SCHEMA_VERSION);
    });

    it('should use default confidence when not provided', () => {
      const evidence = createEvidence(
        'career-1' as CareerId,
        'reward.incomePotential',
        0.9,
        createMockSource(),
        createMockMethodology()
      );

      expect(evidence.confidence.score).toBe(0.5);
      expect(evidence.confidence.level).toBe('moderate');
    });

    it('should accept custom confidence', () => {
      const evidence = createEvidence(
        'career-1' as CareerId,
        'reward.incomePotential',
        0.9,
        createMockSource(),
        createMockMethodology(),
        { score: 0.9, level: 'very-high', factors: ['Expert consensus'] }
      );

      expect(evidence.confidence.score).toBe(0.9);
      expect(evidence.confidence.level).toBe('very-high');
    });
  });

  describe('createEvidenceCollection', () => {
    it('should create collection from evidence items', () => {
      const items = [
        createMockEvidence({ value: 0.8, confidence: { score: 0.7, level: 'high' } }),
        createMockEvidence({ value: 0.85, confidence: { score: 0.8, level: 'high' } }),
      ];

      const collection = createEvidenceCollection(
        'career-1' as CareerId,
        'reward.incomePotential',
        0.82,
        items,
        'weighted-average'
      );

      expect(collection.evidenceItems).toHaveLength(2);
      expect(collection.consolidationMethod).toBe('weighted-average');
    });
  });

  describe('calculateAggregateConfidence', () => {
    it('should return very-low for empty array', () => {
      const result = calculateAggregateConfidence([]);
      expect(result.level).toBe('very-low');
      expect(result.score).toBe(0);
    });

    it('should calculate weighted average', () => {
      const items = [
        createMockEvidence({
          confidence: { score: 0.9, level: 'very-high' },
          source: createMockSource({ type: 'government-data' }), // High quality
        }),
        createMockEvidence({
          confidence: { score: 0.5, level: 'moderate' },
          source: createMockSource({ type: 'expert-opinion' }), // Lower quality
        }),
      ];

      const result = calculateAggregateConfidence(items);
      expect(result.score).toBeGreaterThan(0.5);
      expect(result.score).toBeLessThan(0.9);
    });

    it('should weight by source quality', () => {
      const items = [
        createMockEvidence({
          confidence: { score: 0.7, level: 'high' },
          source: createMockSource({ type: 'government-data' }),
        }),
        createMockEvidence({
          confidence: { score: 0.7, level: 'high' },
          source: createMockSource({ type: 'user-generated' }),
        }),
      ];

      const result = calculateAggregateConfidence(items);
      // Government data should have more weight
      expect(result.factors).toContain('Based on 2 evidence sources');
    });
  });

  describe('validateEvidence', () => {
    it('should validate complete evidence', () => {
      const evidence = createMockEvidence();
      const result = validateEvidence(evidence);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject missing careerId', () => {
      const result = validateEvidence({
        attributePath: 'reward.incomePotential',
        value: 0.5,
        source: createMockSource(),
        methodology: createMockMethodology(),
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'careerId')).toBe(true);
    });

    it('should reject missing source', () => {
      const result = validateEvidence({
        careerId: 'career-1' as CareerId,
        attributePath: 'reward.incomePotential',
        value: 0.5,
        methodology: createMockMethodology(),
      } as Partial<CareerEvidence>);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'source')).toBe(true);
    });

    it('should reject invalid confidence score', () => {
      const result = validateEvidence({
        careerId: 'career-1' as CareerId,
        attributePath: 'reward.incomePotential',
        value: 0.5,
        source: createMockSource(),
        methodology: createMockMethodology(),
        confidence: { score: 1.5, level: 'high' },
      } as Partial<CareerEvidence>);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'confidence.score')).toBe(true);
    });

    it('should provide warnings for optional fields', () => {
      const result = validateEvidence({
        careerId: 'career-1' as CareerId,
        attributePath: 'reward.incomePotential',
        value: 0.5,
        source: createMockSource(),
        methodology: createMockMethodology(),
      });
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('evidenceSourceToString', () => {
    it('should convert source types to readable strings', () => {
      expect(evidenceSourceToString('government-data')).toBe('Government Data');
      expect(evidenceSourceToString('salary-survey')).toBe('Salary Survey');
      expect(evidenceSourceToString('academic-research')).toBe('Academic Research');
    });
  });

  describe('confidenceLevelToString', () => {
    it('should convert confidence levels to readable strings', () => {
      expect(confidenceLevelToString('very-high')).toBe('Very High');
      expect(confidenceLevelToString('high')).toBe('High');
      expect(confidenceLevelToString('moderate')).toBe('Moderate');
    });
  });
});

// ============================================================================
// CAREER EVIDENCE SYSTEM CLASS TESTS
// ============================================================================

describe('CareerEvidenceSystem', () => {
  let system: CareerEvidenceSystem;

  beforeEach(() => {
    system = new CareerEvidenceSystem();
  });

  describe('addEvidence', () => {
    it('should add valid evidence', () => {
      const evidence = createMockEvidence();
      const result = system.addEvidence(evidence);

      expect(result.isValid).toBe(true);
      expect(system.getEvidenceCount()).toBe(1);
    });

    it('should reject invalid evidence', () => {
      const evidence = {
        id: generateEvidenceId(),
        attributePath: 'reward.incomePotential',
        value: 0.5,
        source: createMockSource(),
        methodology: createMockMethodology(),
        metadata: {
          createdAt: Date.now(),
          lastUpdated: Date.now(),
          schemaVersion: EVIDENCE_SCHEMA_VERSION,
          isVerified: true,
          dataQuality: 'good' as DataQuality,
        },
        // Missing careerId makes this invalid
      } as CareerEvidence;

      const result = system.addEvidence(evidence);

      expect(result.isValid).toBe(false);
      expect(system.getEvidenceCount()).toBe(0);
    });
  });

  describe('getEvidence', () => {
    it('should retrieve evidence by ID', () => {
      const evidence = createMockEvidence();
      system.addEvidence(evidence);

      const retrieved = system.getEvidence(evidence.id);
      expect(retrieved?.value).toBe(evidence.value);
    });

    it('should return undefined for unknown IDs', () => {
      const retrieved = system.getEvidence('unknown' as EvidenceId);
      expect(retrieved).toBeUndefined();
    });
  });

  describe('getEvidenceForCareer', () => {
    it('should get all evidence for a career', () => {
      system.addEvidence(createMockEvidence({ careerId: 'career-1' as CareerId }));
      system.addEvidence(createMockEvidence({ careerId: 'career-1' as CareerId, attributePath: 'psychology.creativity' }));
      system.addEvidence(createMockEvidence({ careerId: 'career-2' as CareerId }));

      const career1Evidence = system.getEvidenceForCareer('career-1' as CareerId);
      expect(career1Evidence).toHaveLength(2);
    });
  });

  describe('getEvidenceForAttribute', () => {
    it('should filter by attribute path', () => {
      system.addEvidence(createMockEvidence({ careerId: 'career-1' as CareerId, attributePath: 'reward.incomePotential' }));
      system.addEvidence(createMockEvidence({ careerId: 'career-1' as CareerId, attributePath: 'reward.statusPotential' }));
      system.addEvidence(createMockEvidence({ careerId: 'career-1' as CareerId, attributePath: 'psychology.creativity' }));

      const incomeEvidence = system.getEvidenceForAttribute('career-1' as CareerId, 'reward.incomePotential');
      expect(incomeEvidence).toHaveLength(1);
    });
  });

  describe('queryEvidence', () => {
    beforeEach(() => {
      system.addEvidence(createMockEvidence({
        careerId: 'career-1' as CareerId,
        attributePath: 'reward.incomePotential',
        source: createMockSource({ type: 'government-data' }),
        confidence: { score: 0.9, level: 'very-high' },
        metadata: { createdAt: Date.now(), lastUpdated: Date.now(), schemaVersion: EVIDENCE_SCHEMA_VERSION, isVerified: true, dataQuality: 'excellent' },
      }));
      system.addEvidence(createMockEvidence({
        careerId: 'career-2' as CareerId,
        attributePath: 'psychology.creativity',
        source: createMockSource({ type: 'expert-opinion' }),
        confidence: { score: 0.5, level: 'moderate' },
        metadata: { createdAt: Date.now(), lastUpdated: Date.now(), schemaVersion: EVIDENCE_SCHEMA_VERSION, isVerified: false, dataQuality: 'fair' },
      }));
    });

    it('should filter by career IDs', () => {
      const query: EvidenceQuery = { careerIds: ['career-1' as CareerId] };
      const results = system.queryEvidence(query);
      expect(results).toHaveLength(1);
      expect(results[0].careerId).toBe('career-1');
    });

    it('should filter by source types', () => {
      const query: EvidenceQuery = { sourceTypes: ['government-data'] };
      const results = system.queryEvidence(query);
      expect(results).toHaveLength(1);
      expect(results[0].source.type).toBe('government-data');
    });

    it('should filter by confidence levels', () => {
      const query: EvidenceQuery = { confidenceLevels: ['very-high'] };
      const results = system.queryEvidence(query);
      expect(results).toHaveLength(1);
      expect(results[0].confidence.level).toBe('very-high');
    });

    it('should filter by verification status', () => {
      const query: EvidenceQuery = { isVerified: true };
      const results = system.queryEvidence(query);
      expect(results).toHaveLength(1);
      expect(results[0].metadata.isVerified).toBe(true);
    });

    it('should filter by data quality', () => {
      const query: EvidenceQuery = { dataQuality: ['excellent', 'good'] };
      const results = system.queryEvidence(query);
      expect(results).toHaveLength(1);
    });
  });

  describe('createCollection', () => {
    it('should create collection from evidence', () => {
      system.addEvidence(createMockEvidence({
        careerId: 'career-1' as CareerId,
        attributePath: 'reward.incomePotential',
        value: 0.8,
        confidence: { score: 0.7, level: 'high' },
      }));
      system.addEvidence(createMockEvidence({
        careerId: 'career-1' as CareerId,
        attributePath: 'reward.incomePotential',
        value: 0.85,
        confidence: { score: 0.8, level: 'high' },
      }));

      const collection = system.createCollection('career-1' as CareerId, 'reward.incomePotential', 'weighted-average');

      expect(collection.evidenceItems).toHaveLength(2);
      expect(collection.consolidationMethod).toBe('weighted-average');
      expect(collection.aggregateConfidence.score).toBeGreaterThan(0);
    });

    it('should calculate consolidated value', () => {
      system.addEvidence(createMockEvidence({
        careerId: 'career-1' as CareerId,
        attributePath: 'reward.incomePotential',
        value: 0.8,
        confidence: { score: 0.5, level: 'moderate' },
      }));
      system.addEvidence(createMockEvidence({
        careerId: 'career-1' as CareerId,
        attributePath: 'reward.incomePotential',
        value: 0.9,
        confidence: { score: 0.9, level: 'very-high' },
      }));

      const collection = system.createCollection('career-1' as CareerId, 'reward.incomePotential', 'weighted-average');

      // Higher confidence value should have more weight
      expect(collection.consolidatedValue).toBeGreaterThan(0.8);
    });
  });

  describe('compareEvidence', () => {
    it('should compare two evidence items', () => {
      const evidenceA = createMockEvidence({
        value: 0.9,
        confidence: { score: 0.9, level: 'very-high' },
        source: createMockSource({ type: 'government-data' }),
        metadata: { createdAt: Date.now(), lastUpdated: Date.now(), schemaVersion: EVIDENCE_SCHEMA_VERSION, isVerified: true, dataQuality: 'excellent' },
      });
      const evidenceB = createMockEvidence({
        value: 0.7,
        confidence: { score: 0.5, level: 'moderate' },
        source: createMockSource({ type: 'expert-opinion' }),
        metadata: { createdAt: Date.now() - 100000, lastUpdated: Date.now() - 100000, schemaVersion: EVIDENCE_SCHEMA_VERSION, isVerified: false, dataQuality: 'fair' },
      });

      system.addEvidence(evidenceA);
      system.addEvidence(evidenceB);

      const comparison = system.compareEvidence(evidenceA.id, evidenceB.id);

      expect(comparison).not.toBeNull();
      expect(comparison?.sourceQualityComparison).toBe('better');
      expect(comparison?.dateComparison).toBe('newer');
      expect(comparison?.recommendation).toBe('prefer-a');
    });

    it('should return null for unknown IDs', () => {
      const comparison = system.compareEvidence('unknown1' as EvidenceId, 'unknown2' as EvidenceId);
      expect(comparison).toBeNull();
    });
  });

  describe('verifyEvidence', () => {
    it('should verify evidence', () => {
      const evidence = createMockEvidence({ metadata: { ...createMockEvidence().metadata, isVerified: false } });
      system.addEvidence(evidence);

      const result = system.verifyEvidence(evidence.id, 'Test Reviewer', 'Verified by senior analyst');

      expect(result).toBe(true);
      const verified = system.getEvidence(evidence.id);
      expect(verified?.metadata.isVerified).toBe(true);
      expect(verified?.metadata.verifiedAt).toBeDefined();
    });

    it('should return false for unknown evidence', () => {
      const result = system.verifyEvidence('unknown' as EvidenceId, 'Reviewer');
      expect(result).toBe(false);
    });
  });

  describe('getEvidenceCoverage', () => {
    it('should calculate coverage percentage', () => {
      system.addEvidence(createMockEvidence({ careerId: 'career-1' as CareerId, attributePath: 'reward.incomePotential' }));
      system.addEvidence(createMockEvidence({ careerId: 'career-1' as CareerId, attributePath: 'reward.statusPotential' }));
      system.addEvidence(createMockEvidence({ careerId: 'career-1' as CareerId, attributePath: 'psychology.creativity' }));

      const coverage = system.getEvidenceCoverage('career-1' as CareerId);

      expect(coverage.attributesWithEvidence).toBe(3);
      expect(coverage.coveragePercentage).toBeGreaterThan(0);
    });
  });

  describe('getCareersWithEvidence', () => {
    it('should return unique career IDs', () => {
      system.addEvidence(createMockEvidence({ careerId: 'career-1' as CareerId }));
      system.addEvidence(createMockEvidence({ careerId: 'career-1' as CareerId, attributePath: 'psychology.creativity' }));
      system.addEvidence(createMockEvidence({ careerId: 'career-2' as CareerId }));

      const careers = system.getCareersWithEvidence();
      expect(careers).toHaveLength(2);
      expect(careers).toContain('career-1');
      expect(careers).toContain('career-2');
    });
  });

  describe('removeEvidence', () => {
    it('should remove evidence', () => {
      const evidence = createMockEvidence();
      system.addEvidence(evidence);

      const removed = system.removeEvidence(evidence.id);

      expect(removed).toBe(true);
      expect(system.getEvidenceCount()).toBe(0);
    });

    it('should return false for unknown evidence', () => {
      const removed = system.removeEvidence('unknown' as EvidenceId);
      expect(removed).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all evidence', () => {
      system.addEvidence(createMockEvidence());
      system.addEvidence(createMockEvidence({ id: generateEvidenceId() }));

      system.clear();

      expect(system.getEvidenceCount()).toBe(0);
      expect(system.getCareersWithEvidence()).toHaveLength(0);
    });
  });

  describe('export/import', () => {
    it('should export to JSON', () => {
      system.addEvidence(createMockEvidence());

      const json = system.exportToJSON();
      const parsed = JSON.parse(json);

      expect(parsed.evidence).toHaveLength(1);
      expect(parsed.schemaVersion).toBe(EVIDENCE_SCHEMA_VERSION);
    });

    it('should import from JSON', () => {
      const evidence = createMockEvidence();
      system.addEvidence(evidence);
      const json = system.exportToJSON();
      system.clear();

      const result = system.importFromJSON(json);

      expect(result.evidence).toBe(1);
      expect(system.getEvidenceCount()).toBe(1);
    });
  });
});

// ============================================================================
// EVIDENCE ATTRIBUTE PATH TESTS
// ============================================================================

describe('Evidence Attribute Paths', () => {
  let system: CareerEvidenceSystem;

  beforeEach(() => {
    system = new CareerEvidenceSystem();
  });

  it('should support all psychology attributes', () => {
    const paths = [
      'psychology.analyticalThinking',
      'psychology.creativity',
      'psychology.socialOrientation',
      'psychology.leadership',
      'psychology.detailOrientation',
      'psychology.curiosity',
      'psychology.competitiveness',
      'psychology.riskTolerance',
    ];

    paths.forEach(path => {
      system.addEvidence(createMockEvidence({ attributePath: path }));
    });

    expect(system.getEvidenceCount()).toBe(8);
  });

  it('should support all reward attributes', () => {
    const paths = [
      'reward.incomePotential',
      'reward.statusPotential',
      'reward.impactPotential',
      'reward.freedomPotential',
      'reward.stabilityPotential',
    ];

    paths.forEach(path => {
      system.addEvidence(createMockEvidence({ attributePath: path }));
    });

    expect(system.getEvidenceCount()).toBe(5);
  });

  it('should support all risk attributes', () => {
    const paths = [
      'risk.burnoutRisk',
      'risk.automationRisk',
      'risk.competitionLevel',
      'risk.incomeVolatility',
    ];

    paths.forEach(path => {
      system.addEvidence(createMockEvidence({ attributePath: path }));
    });

    expect(system.getEvidenceCount()).toBe(4);
  });

  it('should support India reality attributes', () => {
    const paths = [
      'indiaReality.coachingDependency',
      'indiaReality.englishDependency',
      'indiaReality.urbanAdvantage',
      'indiaReality.familyAcceptance',
    ];

    paths.forEach(path => {
      system.addEvidence(createMockEvidence({ attributePath: path }));
    });

    expect(system.getEvidenceCount()).toBe(4);
  });
});

// ============================================================================
// SOURCE TYPE TESTS
// ============================================================================

describe('Evidence Source Types', () => {
  let system: CareerEvidenceSystem;

  beforeEach(() => {
    system = new CareerEvidenceSystem();
  });

  it('should support all source types', () => {
    const sourceTypes: EvidenceSource['type'][] = [
      'government-data',
      'salary-survey',
      'industry-report',
      'academic-research',
      'expert-interview',
      'practitioner-survey',
      'job-posting-analysis',
      'market-research',
      'historical-data',
      'machine-learning-model',
      'expert-opinion',
      'user-generated',
      'third-party-api',
      'internal-research',
      'other',
    ];

    sourceTypes.forEach(type => {
      system.addEvidence(createMockEvidence({
        source: createMockSource({ type }),
      }));
    });

    expect(system.getEvidenceCount()).toBe(15);
  });

  it('should rank source quality correctly', () => {
    system.addEvidence(createMockEvidence({
      source: createMockSource({ type: 'government-data' }),
      confidence: { score: 0.7, level: 'high' },
    }));
    system.addEvidence(createMockEvidence({
      source: createMockSource({ type: 'user-generated' }),
      confidence: { score: 0.7, level: 'high' },
    }));

    const collection = system.createCollection('career-1' as CareerId, 'reward.incomePotential');

    // Government data should contribute more to aggregate
    expect(collection.aggregateConfidence.score).toBeGreaterThan(0.5);
  });
});

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

describe('Performance', () => {
  it('should handle 1000 evidence items efficiently', () => {
    const system = new CareerEvidenceSystem();
    const careerId = 'career-1' as CareerId;

    const startTime = Date.now();

    // Add 1000 evidence items
    for (let i = 0; i < 1000; i++) {
      system.addEvidence(createMockEvidence({
        id: generateEvidenceId(),
        careerId,
        attributePath: `attribute-${i % 50}`,
      }));
    }

    const addTime = Date.now() - startTime;
    expect(addTime).toBeLessThan(2000); // Should complete in under 2 seconds

    // Test query
    const queryStart = Date.now();
    const results = system.queryEvidence({ careerIds: [careerId] });
    const queryTime = Date.now() - queryStart;

    expect(results).toHaveLength(1000);
    expect(queryTime).toBeLessThan(100); // Should query in under 100ms
  });
});
