/**
 * CareerOS Career Relationship Taxonomy Tests
 *
 * Comprehensive tests for the relationship system.
 */

import { describe, it, expect } from 'vitest';
import {
  // Types
  type CareerRelationship,

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
} from '../index';

// ============================================================================
// TEST DATA
// ============================================================================

const createTestRelationships = (): CareerRelationship[] => {
  const builder = new RelationshipBuilder();

  return [
    // Career to Career
    builder
      .withId('rel-ctc-001')
      .withSource('career-sw-eng')
      .withTarget('career-ai-eng')
      .withRelation('progression')
      .withStrength('strong')
      .withMetadata({
        timestamp: Date.now(),
        confidence: 0.9,
        rationale: 'Natural progression from SWE to AI Engineer',
      })
      .buildCareerToCareer(),

    builder
      .withId('rel-ctc-002')
      .withSource('career-sw-eng')
      .withTarget('career-pm')
      .withRelation('pivot')
      .withStrength('moderate')
      .withMetadata({
        timestamp: Date.now(),
        confidence: 0.75,
        rationale: 'Common pivot path',
      })
      .buildCareerToCareer(),

    // Career to Skill
    builder
      .withId('rel-cts-001')
      .withSource('career-sw-eng')
      .withTarget('skill-python')
      .withRelation('required')
      .withStrength('very-strong')
      .withMetadata({
        timestamp: Date.now(),
        confidence: 0.95,
        importance: 9,
        proficiencyLevel: 'advanced',
      })
      .buildCareerToSkill(),

    builder
      .withId('rel-cts-002')
      .withSource('career-sw-eng')
      .withTarget('skill-communication')
      .withRelation('recommended')
      .withStrength('moderate')
      .withMetadata({
        timestamp: Date.now(),
        confidence: 0.7,
        importance: 6,
        proficiencyLevel: 'intermediate',
      })
      .buildCareerToSkill(),

    // Career to Degree
    builder
      .withId('rel-ctd-001')
      .withSource('career-sw-eng')
      .withTarget('degree-btech-cse')
      .withRelation('common')
      .withStrength('strong')
      .withMetadata({
        timestamp: Date.now(),
        confidence: 0.85,
        relevance: 8,
        prevalence: 0.7,
      })
      .buildCareerToDegree(),

    // Career to Exam
    builder
      .withId('rel-cte-001')
      .withSource('career-ias')
      .withTarget('exam-upsc-cse')
      .withRelation('required')
      .withStrength('very-strong')
      .withMetadata({
        timestamp: Date.now(),
        confidence: 1.0,
        difficulty: 10,
        passRate: 0.001,
        prepTime: 24,
      })
      .buildCareerToExam(),

    // Career to Industry
    builder
      .withId('rel-cti-001')
      .withSource('career-sw-eng')
      .withTarget('industry-tech')
      .withRelation('primary')
      .withStrength('very-strong')
      .withMetadata({
        timestamp: Date.now(),
        confidence: 0.95,
        relevance: 10,
        marketSize: 'large',
        growthTrajectory: 'growing',
      })
      .buildCareerToIndustry(),

    // Career to Certification
    builder
      .withId('rel-ctcert-001')
      .withSource('career-aws-architect')
      .withTarget('cert-aws-sa')
      .withRelation('required')
      .withStrength('strong')
      .withMetadata({
        timestamp: Date.now(),
        confidence: 0.8,
        value: 8,
        recognition: 'industry-standard',
        validityPeriod: 3,
      })
      .buildCareerToCertification(),

    // Career to Role
    builder
      .withId('rel-ctr-001')
      .withSource('career-sw-eng')
      .withTarget('role-junior-dev')
      .withRelation('entry')
      .withStrength('very-strong')
      .withMetadata({
        timestamp: Date.now(),
        confidence: 0.9,
        yearsExperience: 0,
        compensationLevel: 'low',
      })
      .buildCareerToRole(),

    builder
      .withId('rel-ctr-002')
      .withSource('career-sw-eng')
      .withTarget('role-senior-dev')
      .withRelation('senior')
      .withStrength('strong')
      .withMetadata({
        timestamp: Date.now(),
        confidence: 0.85,
        yearsExperience: 5,
        compensationLevel: 'high',
      })
      .buildCareerToRole(),
  ];
};

// ============================================================================
// STRENGTH CONVERSION TESTS
// ============================================================================

describe('Strength Conversion', () => {
  describe('strengthToScore', () => {
    it('should convert very-strong to 10', () => {
      expect(strengthToScore('very-strong')).toBe(10);
    });

    it('should convert strong to 8', () => {
      expect(strengthToScore('strong')).toBe(8);
    });

    it('should convert moderate to 6', () => {
      expect(strengthToScore('moderate')).toBe(6);
    });

    it('should convert weak to 4', () => {
      expect(strengthToScore('weak')).toBe(4);
    });

    it('should convert very-weak to 2', () => {
      expect(strengthToScore('very-weak')).toBe(2);
    });
  });

  describe('scoreToStrength', () => {
    it('should convert 10 to very-strong', () => {
      expect(scoreToStrength(10)).toBe('very-strong');
    });

    it('should convert 9 to very-strong', () => {
      expect(scoreToStrength(9)).toBe('very-strong');
    });

    it('should convert 8 to strong', () => {
      expect(scoreToStrength(8)).toBe('strong');
    });

    it('should convert 7 to strong', () => {
      expect(scoreToStrength(7)).toBe('strong');
    });

    it('should convert 6 to moderate', () => {
      expect(scoreToStrength(6)).toBe('moderate');
    });

    it('should convert 5 to moderate', () => {
      expect(scoreToStrength(5)).toBe('moderate');
    });

    it('should convert 4 to weak', () => {
      expect(scoreToStrength(4)).toBe('weak');
    });

    it('should convert 3 to weak', () => {
      expect(scoreToStrength(3)).toBe('weak');
    });

    it('should convert 2 to very-weak', () => {
      expect(scoreToStrength(2)).toBe('very-weak');
    });

    it('should convert 1 to very-weak', () => {
      expect(scoreToStrength(1)).toBe('very-weak');
    });
  });

  describe('round-trip conversion', () => {
    it('should maintain consistency for all strength levels', () => {
      const levels = ['very-strong', 'strong', 'moderate', 'weak', 'very-weak'] as const;
      levels.forEach(level => {
        const score = strengthToScore(level);
        const backToLevel = scoreToStrength(score);
        expect(backToLevel).toBe(level);
      });
    });
  });
});

// ============================================================================
// RELATIONSHIP BUILDER TESTS
// ============================================================================

describe('RelationshipBuilder', () => {
  describe('Career to Career', () => {
    it('should build valid career-to-career relationship', () => {
      const builder = new RelationshipBuilder();
      const relationship = builder
        .withId('rel-test-001')
        .withSource('career-a')
        .withTarget('career-b')
        .withRelation('progression')
        .withStrength('strong')
        .withVersion('1.0.0')
        .buildCareerToCareer();

      expect(relationship.id).toBe('rel-test-001');
      expect(relationship.type).toBe('career-to-career');
      expect(relationship.sourceId).toBe('career-a');
      expect(relationship.targetId).toBe('career-b');
      expect(relationship.relation).toBe('progression');
      expect(relationship.strength).toBe('strong');
      expect(relationship.strengthScore).toBe(8);
      expect(relationship.version).toBe('1.0.0');
      expect(relationship.metadata.timestamp).toBeDefined();
      expect(relationship.metadata.confidence).toBe(0.8);
    });

    it('should auto-generate ID if not provided', () => {
      const builder = new RelationshipBuilder();
      const relationship = builder
        .withSource('career-a')
        .withTarget('career-b')
        .withRelation('adjacent')
        .withStrength('moderate')
        .buildCareerToCareer();

      expect(relationship.id).toContain('rel-ctc-');
      expect(relationship.id).toContain('career-a');
      expect(relationship.id).toContain('career-b');
    });
  });

  describe('Career to Skill', () => {
    it('should build valid career-to-skill relationship', () => {
      const builder = new RelationshipBuilder();
      const relationship = builder
        .withId('rel-test-002')
        .withSource('career-sw')
        .withTarget('skill-js')
        .withRelation('required')
        .withStrength('very-strong')
        .withMetadata({
          importance: 9,
          proficiencyLevel: 'expert',
        })
        .buildCareerToSkill();

      expect(relationship.type).toBe('career-to-skill');
      expect(relationship.metadata.importance).toBe(9);
      expect(relationship.metadata.proficiencyLevel).toBe('expert');
    });
  });

  describe('Career to Degree', () => {
    it('should build valid career-to-degree relationship', () => {
      const builder = new RelationshipBuilder();
      const relationship = builder
        .withId('rel-test-003')
        .withSource('career-doc')
        .withTarget('degree-mbbs')
        .withRelation('mandatory')
        .withStrength('very-strong')
        .withMetadata({
          relevance: 10,
          prevalence: 0.95,
        })
        .buildCareerToDegree();

      expect(relationship.type).toBe('career-to-degree');
      expect(relationship.metadata.relevance).toBe(10);
      expect(relationship.metadata.prevalence).toBe(0.95);
    });
  });

  describe('Career to Exam', () => {
    it('should build valid career-to-exam relationship', () => {
      const builder = new RelationshipBuilder();
      const relationship = builder
        .withId('rel-test-004')
        .withSource('career-ca')
        .withTarget('exam-ca-final')
        .withRelation('required')
        .withStrength('very-strong')
        .withMetadata({
          difficulty: 9,
          passRate: 0.15,
          prepTime: 36,
        })
        .buildCareerToExam();

      expect(relationship.type).toBe('career-to-exam');
      expect(relationship.metadata.difficulty).toBe(9);
      expect(relationship.metadata.passRate).toBe(0.15);
    });
  });

  describe('Career to Industry', () => {
    it('should build valid career-to-industry relationship', () => {
      const builder = new RelationshipBuilder();
      const relationship = builder
        .withId('rel-test-005')
        .withSource('career-ib')
        .withTarget('industry-finance')
        .withRelation('primary')
        .withStrength('very-strong')
        .withMetadata({
          relevance: 10,
          marketSize: 'large',
          growthTrajectory: 'stable',
        })
        .buildCareerToIndustry();

      expect(relationship.type).toBe('career-to-industry');
      expect(relationship.metadata.relevance).toBe(10);
      expect(relationship.metadata.marketSize).toBe('large');
    });
  });

  describe('Career to Certification', () => {
    it('should build valid career-to-certification relationship', () => {
      const builder = new RelationshipBuilder();
      const relationship = builder
        .withId('rel-test-006')
        .withSource('career-pmp')
        .withTarget('cert-pmp')
        .withRelation('required')
        .withStrength('strong')
        .withMetadata({
          value: 8,
          recognition: 'industry-standard',
          validityPeriod: 3,
        })
        .buildCareerToCertification();

      expect(relationship.type).toBe('career-to-certification');
      expect(relationship.metadata.value).toBe(8);
      expect(relationship.metadata.validityPeriod).toBe(3);
    });
  });

  describe('Career to Role', () => {
    it('should build valid career-to-role relationship', () => {
      const builder = new RelationshipBuilder();
      const relationship = builder
        .withId('rel-test-007')
        .withSource('career-sw')
        .withTarget('role-staff-eng')
        .withRelation('senior')
        .withStrength('strong')
        .withMetadata({
          yearsExperience: 8,
          compensationLevel: 'very-high',
        })
        .buildCareerToRole();

      expect(relationship.type).toBe('career-to-role');
      expect(relationship.metadata.yearsExperience).toBe(8);
      expect(relationship.metadata.compensationLevel).toBe('very-high');
    });
  });

  describe('withStrengthScore', () => {
    it('should set strength from numeric score', () => {
      const builder = new RelationshipBuilder();
      const relationship = builder
        .withSource('a')
        .withTarget('b')
        .withRelation('adjacent')
        .withStrengthScore(9)
        .buildCareerToCareer();

      expect(relationship.strength).toBe('very-strong');
      expect(relationship.strengthScore).toBe(10);
    });
  });
});

// ============================================================================
// TYPE GUARD TESTS
// ============================================================================

describe('Type Guards', () => {
  const relationships = createTestRelationships();

  describe('isCareerToCareerRelationship', () => {
    it('should return true for career-to-career relationships', () => {
      const rel = relationships.find(r => r.id === 'rel-ctc-001');
      expect(isCareerToCareerRelationship(rel!)).toBe(true);
    });

    it('should return false for other relationship types', () => {
      const rel = relationships.find(r => r.id === 'rel-cts-001');
      expect(isCareerToCareerRelationship(rel!)).toBe(false);
    });
  });

  describe('isCareerToSkillRelationship', () => {
    it('should return true for career-to-skill relationships', () => {
      const rel = relationships.find(r => r.id === 'rel-cts-001');
      expect(isCareerToSkillRelationship(rel!)).toBe(true);
    });

    it('should return false for other relationship types', () => {
      const rel = relationships.find(r => r.id === 'rel-ctc-001');
      expect(isCareerToSkillRelationship(rel!)).toBe(false);
    });
  });

  describe('isCareerToDegreeRelationship', () => {
    it('should return true for career-to-degree relationships', () => {
      const rel = relationships.find(r => r.id === 'rel-ctd-001');
      expect(isCareerToDegreeRelationship(rel!)).toBe(true);
    });
  });

  describe('isCareerToExamRelationship', () => {
    it('should return true for career-to-exam relationships', () => {
      const rel = relationships.find(r => r.id === 'rel-cte-001');
      expect(isCareerToExamRelationship(rel!)).toBe(true);
    });
  });

  describe('isCareerToIndustryRelationship', () => {
    it('should return true for career-to-industry relationships', () => {
      const rel = relationships.find(r => r.id === 'rel-cti-001');
      expect(isCareerToIndustryRelationship(rel!)).toBe(true);
    });
  });

  describe('isCareerToCertificationRelationship', () => {
    it('should return true for career-to-certification relationships', () => {
      const rel = relationships.find(r => r.id === 'rel-ctcert-001');
      expect(isCareerToCertificationRelationship(rel!)).toBe(true);
    });
  });

  describe('isCareerToRoleRelationship', () => {
    it('should return true for career-to-role relationships', () => {
      const rel = relationships.find(r => r.id === 'rel-ctr-001');
      expect(isCareerToRoleRelationship(rel!)).toBe(true);
    });
  });
});

// ============================================================================
// VALIDATION TESTS
// ============================================================================

describe('validateRelationship', () => {
  it('should validate a correct relationship', () => {
    const builder = new RelationshipBuilder();
    const relationship = builder
      .withId('rel-valid')
      .withSource('a')
      .withTarget('b')
      .withRelation('adjacent')
      .withStrength('strong')
      .buildCareerToCareer();

    const result = validateRelationship(relationship);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should detect missing ID', () => {
    const relationship = {
      id: '',
      type: 'career-to-career' as const,
      sourceId: 'a',
      targetId: 'b',
      relation: 'adjacent' as const,
      strength: 'strong' as const,
      strengthScore: 8 as const,
      metadata: {
        timestamp: Date.now(),
        confidence: 0.8,
      },
      version: '1.0.0',
    };

    const result = validateRelationship(relationship);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing relationship ID');
  });

  it('should detect missing source ID', () => {
    const builder = new RelationshipBuilder();
    const relationship = builder
      .withId('rel-test')
      .withTarget('b')
      .withRelation('adjacent')
      .withStrength('strong')
      .buildCareerToCareer();

    // Manually override sourceId
    (relationship as any).sourceId = '';

    const result = validateRelationship(relationship);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing source ID');
  });

  it('should detect invalid confidence', () => {
    const builder = new RelationshipBuilder();
    const relationship = builder
      .withId('rel-test')
      .withSource('a')
      .withTarget('b')
      .withRelation('adjacent')
      .withStrength('strong')
      .withMetadata({
        confidence: 1.5, // Invalid: > 1
      })
      .buildCareerToCareer();

    const result = validateRelationship(relationship);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Confidence must be between 0 and 1');
  });

  it('should detect missing importance in career-to-skill', () => {
    // Create relationship manually to bypass builder defaults
    const relationship = {
      id: 'rel-test',
      type: 'career-to-skill' as const,
      sourceId: 'a',
      targetId: 'b',
      relation: 'required' as const,
      strength: 'strong' as const,
      strengthScore: 8 as const,
      metadata: {
        timestamp: Date.now(),
        confidence: 0.8,
        // Missing importance
      },
      version: '1.0.0',
    };

    const result = validateRelationship(relationship);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      'Career-to-skill relationship missing importance score'
    );
  });

  it('should warn about strength mismatch', () => {
    const builder = new RelationshipBuilder();
    const relationship = builder
      .withId('rel-test')
      .withSource('a')
      .withTarget('b')
      .withRelation('adjacent')
      .withStrength('strong')
      .buildCareerToCareer();

    // Manually change strengthScore to mismatch
    (relationship as any).strengthScore = 6;

    const result = validateRelationship(relationship);
    expect(result.valid).toBe(true); // Still valid, just warning
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('does not match');
  });
});

// ============================================================================
// QUERY TESTS
// ============================================================================

describe('Relationship Queries', () => {
  const relationships = createTestRelationships();

  describe('filterRelationshipsByType', () => {
    it('should filter by career-to-career type', () => {
      const filtered = filterRelationshipsByType(relationships, 'career-to-career');
      expect(filtered).toHaveLength(2);
      expect(filtered.every(r => r.type === 'career-to-career')).toBe(true);
    });

    it('should filter by career-to-skill type', () => {
      const filtered = filterRelationshipsByType(relationships, 'career-to-skill');
      expect(filtered).toHaveLength(2);
      expect(filtered.every(r => r.type === 'career-to-skill')).toBe(true);
    });

    it('should return empty array for non-existent type', () => {
      const filtered = filterRelationshipsByType(
        relationships,
        'non-existent' as any
      );
      expect(filtered).toHaveLength(0);
    });
  });

  describe('filterRelationshipsByStrength', () => {
    it('should filter by minimum strength', () => {
      const filtered = filterRelationshipsByStrength(relationships, 'strong');
      expect(filtered.length).toBeGreaterThan(0);
      expect(
        filtered.every(r =>
          ['strong', 'very-strong'].includes(r.strength)
        )
      ).toBe(true);
    });

    it('should include all when min strength is very-weak', () => {
      const filtered = filterRelationshipsByStrength(relationships, 'very-weak');
      expect(filtered).toHaveLength(relationships.length);
    });

    it('should return empty when min strength is very-strong and none exist', () => {
      const weakRels = relationships.filter(r => r.strength !== 'very-strong');
      const filtered = filterRelationshipsByStrength(weakRels, 'very-strong');
      expect(filtered).toHaveLength(0);
    });
  });

  describe('getRelationshipsBySource', () => {
    it('should find relationships by source', () => {
      const found = getRelationshipsBySource(relationships, 'career-sw-eng');
      expect(found.length).toBeGreaterThan(0);
      expect(found.every(r => r.sourceId === 'career-sw-eng')).toBe(true);
    });

    it('should return empty for unknown source', () => {
      const found = getRelationshipsBySource(relationships, 'unknown');
      expect(found).toHaveLength(0);
    });
  });

  describe('getRelationshipsByTarget', () => {
    it('should find relationships by target', () => {
      const found = getRelationshipsByTarget(relationships, 'career-ai-eng');
      expect(found.length).toBeGreaterThan(0);
      expect(found.every(r => r.targetId === 'career-ai-eng')).toBe(true);
    });
  });

  describe('findRelationship', () => {
    it('should find specific relationship', () => {
      const found = findRelationship(
        relationships,
        'career-sw-eng',
        'career-ai-eng'
      );
      expect(found).toBeDefined();
      expect(found?.id).toBe('rel-ctc-001');
    });

    it('should return undefined for non-existent relationship', () => {
      const found = findRelationship(relationships, 'a', 'b');
      expect(found).toBeUndefined();
    });
  });
});

// ============================================================================
// ANALYTICS TESTS
// ============================================================================

describe('Relationship Analytics', () => {
  const relationships = createTestRelationships();

  describe('calculateRelationshipStats', () => {
    it('should calculate total count', () => {
      const stats = calculateRelationshipStats(relationships);
      expect(stats.total).toBe(relationships.length);
    });

    it('should count by type', () => {
      const stats = calculateRelationshipStats(relationships);
      expect(stats.byType['career-to-career']).toBe(2);
      expect(stats.byType['career-to-skill']).toBe(2);
      expect(stats.byType['career-to-degree']).toBe(1);
      expect(stats.byType['career-to-exam']).toBe(1);
      expect(stats.byType['career-to-industry']).toBe(1);
      expect(stats.byType['career-to-certification']).toBe(1);
      expect(stats.byType['career-to-role']).toBe(2);
    });

    it('should count by strength', () => {
      const stats = calculateRelationshipStats(relationships);
      expect(stats.byStrength['very-strong']).toBeGreaterThan(0);
      expect(stats.byStrength['strong']).toBeGreaterThan(0);
      expect(stats.byStrength['moderate']).toBeGreaterThan(0);
    });

    it('should calculate average confidence', () => {
      const stats = calculateRelationshipStats(relationships);
      expect(stats.averageConfidence).toBeGreaterThan(0);
      expect(stats.averageConfidence).toBeLessThanOrEqual(1);
    });

    it('should count high confidence relationships', () => {
      const stats = calculateRelationshipStats(relationships);
      expect(stats.highConfidenceCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getStrongestRelationships', () => {
    it('should return strongest relationships for entity', () => {
      const strongest = getStrongestRelationships(
        relationships,
        'career-sw-eng',
        5
      );
      expect(strongest.length).toBeGreaterThan(0);
      expect(strongest.length).toBeLessThanOrEqual(5);

      // Should be sorted by strength
      for (let i = 0; i < strongest.length - 1; i++) {
        const current = strongest[i].strength;
        const next = strongest[i + 1].strength;
        const order = ['very-weak', 'weak', 'moderate', 'strong', 'very-strong'];
        expect(order.indexOf(current)).toBeGreaterThanOrEqual(
          order.indexOf(next)
        );
      }
    });

    it('should respect limit parameter', () => {
      const strongest = getStrongestRelationships(
        relationships,
        'career-sw-eng',
        2
      );
      expect(strongest.length).toBeLessThanOrEqual(2);
    });

    it('should return empty for unknown entity', () => {
      const strongest = getStrongestRelationships(relationships, 'unknown', 5);
      expect(strongest).toHaveLength(0);
    });
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Integration', () => {
  it('should support complete workflow', () => {
    // 1. Build relationships
    const builder = new RelationshipBuilder();
    const relationships: CareerRelationship[] = [
      builder
        .withId('rel-1')
        .withSource('career-a')
        .withTarget('career-b')
        .withRelation('progression')
        .withStrength('strong')
        .withMetadata({ confidence: 0.9 })
        .buildCareerToCareer(),
      builder
        .withId('rel-2')
        .withSource('career-a')
        .withTarget('skill-x')
        .withRelation('required')
        .withStrength('very-strong')
        .withMetadata({ confidence: 0.95, importance: 9 })
        .buildCareerToSkill(),
      builder
        .withId('rel-3')
        .withSource('career-b')
        .withTarget('career-c')
        .withRelation('adjacent')
        .withStrength('moderate')
        .withMetadata({ confidence: 0.6 })
        .buildCareerToCareer(),
    ];

    // 2. Validate all
    const validations = relationships.map(r => validateRelationship(r));
    expect(validations.every(v => v.valid)).toBe(true);

    // 3. Filter by type
    const careerRels = filterRelationshipsByType(relationships, 'career-to-career');
    expect(careerRels).toHaveLength(2);

    // 4. Get by source
    const fromA = getRelationshipsBySource(relationships, 'career-a');
    expect(fromA).toHaveLength(2);

    // 5. Get stats
    const stats = calculateRelationshipStats(relationships);
    expect(stats.total).toBe(3);
    expect(stats.averageConfidence).toBeGreaterThan(0.8);

    // 6. Get strongest
    const strongest = getStrongestRelationships(relationships, 'career-a', 2);
    expect(strongest.length).toBe(2);
    expect(strongest[0].strength).toBe('very-strong');
  });
});
