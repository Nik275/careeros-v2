/**
 * CareerOS Career Ontology V2 Tests
 *
 * Comprehensive test suite for career knowledge model.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  CareerOntologyV2,
  createCareer,
  validateCareer,
  createCareerSlug,
  normalizeCareerData,
  generateCareerId,
  type Career,
  type CareerId,
  type CareerCategory,
  type CareerSlug,
} from '../index';
import { ONTOLOGY_SCHEMA_VERSION } from '../CareerOntologyV2';

// ============================================================================
// MOCK DATA FACTORIES
// ============================================================================

const createMockCareer = (overrides: Partial<Career> & { name?: string } = {}): Career => {
  const name = overrides.identity?.name ?? 'Software Engineer';

  return {
    identity: {
      id: overrides.identity?.id ?? ('career-test-1' as CareerId),
      slug: overrides.identity?.slug ?? ('software-engineer' as CareerSlug),
      name,
      category: overrides.identity?.category ?? 'technology',
      description: overrides.identity?.description ?? 'Designs and builds software applications',
      tagline: overrides.identity?.tagline ?? 'Build the future with code',
      aliases: overrides.identity?.aliases ?? ['Developer', 'Programmer', 'Coder'],
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        schemaVersion: ONTOLOGY_SCHEMA_VERSION,
        isVerified: true,
        source: 'test',
      },
    },
    psychology: {
      analyticalThinking: 0.9,
      creativity: 0.7,
      socialOrientation: 0.5,
      leadership: 0.6,
      detailOrientation: 0.8,
      curiosity: 0.8,
      competitiveness: 0.6,
      riskTolerance: 0.5,
      ...overrides.psychology,
    },
    workStyle: {
      remoteWork: 'fully-remote',
      officeWork: true,
      fieldWork: false,
      travelRequirement: 'occasional',
      teamOrientation: 'medium-team',
      soloOrientation: true,
      structuredEnvironment: false,
      unstructuredEnvironment: true,
      ...overrides.workStyle,
    },
    reward: {
      incomePotential: 0.85,
      statusPotential: 0.7,
      impactPotential: 0.8,
      freedomPotential: 0.8,
      stabilityPotential: 0.7,
      ...overrides.reward,
    },
    risk: {
      burnoutRisk: 'moderate',
      automationRisk: 'moderate',
      competitionLevel: 'high',
      incomeVolatility: 'low',
      ...overrides.risk,
    },
    optionality: {
      careerFlexibility: 0.8,
      transferableSkills: 8,
      entrepreneurshipPotential: 0.7,
      ...overrides.optionality,
    },
    education: {
      minimumEducation: 'bachelor',
      typicalDegrees: ['B.Tech', 'B.E.', 'B.Sc Computer Science', 'BCA'],
      certifications: ['AWS Certified', 'Google Cloud Professional'],
      optionalCertifications: ['Scrum Master', 'PMP'],
      examRequirements: {
        type: 'none',
        exams: [],
        difficulty: 'low',
        preparationMonths: 0,
      },
      yearsOfStudy: 4,
      educationCostRange: {
        min: 200000,
        max: 2000000,
        typical: 800000,
      },
      ...overrides.education,
    },
    indiaReality: {
      coachingDependency: 'minimal',
      englishDependency: 'essential',
      urbanAdvantage: 'significant',
      migrationRequirement: false,
      reservationSensitivity: false,
      familyAcceptance: 'high',
      socioEconomicBarriers: 'low',
      genderConsiderations: {
        maleDominance: true,
        femaleRepresentation: 0.25,
        genderBarriers: 'moderate',
      },
      ...overrides.indiaReality,
    },
    future: {
      aiDisruptionRisk: 'moderate',
      futureDemand: 'high-growth',
      globalMobility: 0.9,
      industryGrowth: 'rapid',
      emergingOpportunities: ['AI/ML Engineering', 'DevOps', 'Cybersecurity'],
      ...overrides.future,
    },
    lifestyle: {
      workLifeBalance: 'good',
      stressLevel: 'moderate',
      scheduleFlexibility: 0.7,
      geographicFreedom: 0.8,
      ...overrides.lifestyle,
    },
  };
};

// ============================================================================
// UTILITY FUNCTION TESTS
// ============================================================================

describe('Utility Functions', () => {
  describe('createCareerSlug', () => {
    it('should create slugs from names', () => {
      expect(createCareerSlug('Software Engineer')).toBe('software-engineer');
      expect(createCareerSlug('Data Scientist')).toBe('data-scientist');
      expect(createCareerSlug('CEO')).toBe('ceo');
    });

    it('should handle special characters', () => {
      expect(createCareerSlug('AI/ML Engineer')).toBe('aiml-engineer');
      expect(createCareerSlug('C++ Developer')).toBe('c-developer');
    });

    it('should handle multiple spaces', () => {
      expect(createCareerSlug('Software   Engineer')).toBe('software-engineer');
    });

    it('should lowercase', () => {
      expect(createCareerSlug('SOFTWARE ENGINEER')).toBe('software-engineer');
    });
  });

  describe('generateCareerId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateCareerId();
      const id2 = generateCareerId();
      expect(id1).not.toBe(id2);
      expect(id1).toContain('career-');
    });
  });

  describe('validateCareer', () => {
    it('should validate complete careers', () => {
      const career = createMockCareer();
      const result = validateCareer(career);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject missing identity fields', () => {
      const result = validateCareer({});
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject invalid psychology scores', () => {
      const career = createMockCareer({
        psychology: {
          analyticalThinking: 1.5, // Invalid > 1
          creativity: 0.5,
          socialOrientation: 0.5,
          leadership: 0.5,
          detailOrientation: 0.5,
          curiosity: 0.5,
          competitiveness: 0.5,
          riskTolerance: 0.5,
        },
      });
      const result = validateCareer(career);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field.includes('analyticalThinking'))).toBe(true);
    });

    it('should reject negative scores', () => {
      const career = createMockCareer({
        psychology: {
          analyticalThinking: -0.1, // Invalid < 0
          creativity: 0.5,
          socialOrientation: 0.5,
          leadership: 0.5,
          detailOrientation: 0.5,
          curiosity: 0.5,
          competitiveness: 0.5,
          riskTolerance: 0.5,
        },
      });
      const result = validateCareer(career);
      expect(result.isValid).toBe(false);
    });

    it('should provide warnings for missing optional fields', () => {
      const career = createMockCareer({
        identity: {
          ...createMockCareer().identity,
          tagline: undefined,
          aliases: [],
        },
      });
      const result = validateCareer(career);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('normalizeCareerData', () => {
    it('should fill in defaults', () => {
      const partial = {
        identity: {
          name: 'Test Career',
          category: 'technology' as CareerCategory,
          description: 'Test description',
        },
      };
      const career = normalizeCareerData(partial);

      expect(career.identity.id).toBeDefined();
      expect(career.identity.slug).toBe('test-career');
      expect(career.psychology.analyticalThinking).toBe(0.5);
      expect(career.education.minimumEducation).toBe('bachelor');
    });

    it('should preserve provided values', () => {
      const partial = {
        identity: {
          name: 'Test Career',
          category: 'technology' as CareerCategory,
          description: 'Test description',
        },
        psychology: {
          analyticalThinking: 0.9,
          creativity: 0.8,
          socialOrientation: 0.7,
          leadership: 0.6,
          detailOrientation: 0.5,
          curiosity: 0.9,
          competitiveness: 0.4,
          riskTolerance: 0.3,
        },
      };
      const career = normalizeCareerData(partial);

      expect(career.psychology.analyticalThinking).toBe(0.9);
      expect(career.psychology.creativity).toBe(0.8);
    });
  });

  describe('createCareer', () => {
    it('should create careers with auto-generated slug', () => {
      const career = createCareer(
        {
          name: 'Data Scientist',
          category: 'technology',
          description: 'Analyzes data',
        },
        {}
      );

      expect(career.identity.slug).toBe('data-scientist');
      expect(career.identity.metadata?.schemaVersion).toBe(ONTOLOGY_SCHEMA_VERSION);
    });

    it('should use custom slug when provided', () => {
      const career = createCareer(
        {
          name: 'Data Scientist',
          slug: 'custom-slug' as CareerSlug,
          category: 'technology',
          description: 'Analyzes data',
        },
        {}
      );

      expect(career.identity.slug).toBe('custom-slug');
    });
  });
});

// ============================================================================
// CAREER ONTOLOGY V2 CLASS TESTS
// ============================================================================

describe('CareerOntologyV2', () => {
  let ontology: CareerOntologyV2;

  beforeEach(() => {
    ontology = new CareerOntologyV2();
  });

  describe('addCareer', () => {
    it('should add valid careers', () => {
      const career = createMockCareer();
      const result = ontology.addCareer(career);

      expect(result.isValid).toBe(true);
      expect(ontology.getCareerCount()).toBe(1);
    });

    it('should reject invalid careers', () => {
      const career = createMockCareer({ identity: { ...createMockCareer().identity, name: '' } });
      const result = ontology.addCareer(career);

      expect(result.isValid).toBe(false);
      expect(ontology.getCareerCount()).toBe(0);
    });

    it('should reject duplicate slugs', () => {
      const career1 = createMockCareer({ identity: { ...createMockCareer().identity, id: 'career-1' as CareerId } });
      const career2 = createMockCareer({ identity: { ...createMockCareer().identity, id: 'career-2' as CareerId } });

      ontology.addCareer(career1);
      const result = ontology.addCareer(career2);

      expect(result.isValid).toBe(false);
      expect(result.errors[0].field).toBe('identity.slug');
    });
  });

  describe('getCareer', () => {
    it('should retrieve careers by ID', () => {
      const career = createMockCareer();
      ontology.addCareer(career);

      const retrieved = ontology.getCareer(career.identity.id);
      expect(retrieved?.identity.name).toBe(career.identity.name);
    });

    it('should return undefined for unknown IDs', () => {
      const retrieved = ontology.getCareer('unknown' as CareerId);
      expect(retrieved).toBeUndefined();
    });
  });

  describe('getCareerBySlug', () => {
    it('should retrieve careers by slug', () => {
      const career = createMockCareer();
      ontology.addCareer(career);

      const retrieved = ontology.getCareerBySlug(career.identity.slug);
      expect(retrieved?.identity.id).toBe(career.identity.id);
    });
  });

  describe('getAllCareers', () => {
    it('should return all careers', () => {
      ontology.addCareer(createMockCareer({ identity: { ...createMockCareer().identity, id: 'c1' as CareerId, slug: 'slug-1' as CareerSlug, name: 'Career 1' } }));
      ontology.addCareer(createMockCareer({ identity: { ...createMockCareer().identity, id: 'c2' as CareerId, slug: 'slug-2' as CareerSlug, name: 'Career 2' } }));

      const all = ontology.getAllCareers();
      expect(all).toHaveLength(2);
    });
  });

  describe('getCareersByCategory', () => {
    it('should filter by category', () => {
      ontology.addCareer(createMockCareer({ identity: { ...createMockCareer().identity, id: 'c1' as CareerId, slug: 'slug-1' as CareerSlug, category: 'technology' } }));
      ontology.addCareer(createMockCareer({ identity: { ...createMockCareer().identity, id: 'c2' as CareerId, slug: 'slug-2' as CareerSlug, category: 'healthcare' } }));
      ontology.addCareer(createMockCareer({ identity: { ...createMockCareer().identity, id: 'c3' as CareerId, slug: 'slug-3' as CareerSlug, category: 'technology' } }));

      const techCareers = ontology.getCareersByCategory('technology');
      expect(techCareers).toHaveLength(2);
    });
  });

  describe('getCategories', () => {
    it('should return unique categories', () => {
      ontology.addCareer(createMockCareer({ identity: { ...createMockCareer().identity, id: 'c1' as CareerId, slug: 'slug-1' as CareerSlug, category: 'technology' } }));
      ontology.addCareer(createMockCareer({ identity: { ...createMockCareer().identity, id: 'c2' as CareerId, slug: 'slug-2' as CareerSlug, category: 'healthcare' } }));

      const categories = ontology.getCategories();
      expect(categories).toContain('technology');
      expect(categories).toContain('healthcare');
    });
  });

  describe('filterCareers', () => {
    beforeEach(() => {
      ontology.addCareer(createMockCareer({
        identity: { ...createMockCareer().identity, id: 'c1' as CareerId, slug: 'slug-1' as CareerSlug, category: 'technology' },
        reward: { incomePotential: 0.9, statusPotential: 0.7, impactPotential: 0.8, freedomPotential: 0.8, stabilityPotential: 0.7 },
        risk: { burnoutRisk: 'moderate', automationRisk: 'low', competitionLevel: 'high', incomeVolatility: 'low' },
        workStyle: { remoteWork: 'fully-remote', officeWork: true, fieldWork: false, travelRequirement: 'occasional', teamOrientation: 'medium-team', soloOrientation: true, structuredEnvironment: false, unstructuredEnvironment: true },
        future: { futureDemand: 'high-growth', industryGrowth: 'rapid', aiDisruptionRisk: 'moderate', globalMobility: 0.9 },
        lifestyle: { workLifeBalance: 'good', stressLevel: 'moderate', scheduleFlexibility: 0.7, geographicFreedom: 0.8 },
        indiaReality: { coachingDependency: 'minimal', englishDependency: 'essential', urbanAdvantage: 'significant', migrationRequirement: false, reservationSensitivity: false, familyAcceptance: 'high', socioEconomicBarriers: 'low' },
        education: { minimumEducation: 'bachelor', typicalDegrees: [], certifications: [], examRequirements: { type: 'none', exams: [], difficulty: 'low', preparationMonths: 0 }, yearsOfStudy: 4, educationCostRange: { min: 0, max: 1000000, typical: 500000 } },
      }));
      ontology.addCareer(createMockCareer({
        identity: { ...createMockCareer().identity, id: 'c2' as CareerId, slug: 'slug-2' as CareerSlug, category: 'healthcare' },
        reward: { incomePotential: 0.6, statusPotential: 0.9, impactPotential: 0.9, freedomPotential: 0.5, stabilityPotential: 0.9 },
        risk: { burnoutRisk: 'high', automationRisk: 'low', competitionLevel: 'moderate', incomeVolatility: 'low' },
        workStyle: { remoteWork: 'none', officeWork: true, fieldWork: true, travelRequirement: 'none', teamOrientation: 'large-team', soloOrientation: false, structuredEnvironment: true, unstructuredEnvironment: false },
        future: { futureDemand: 'stable', industryGrowth: 'moderate', aiDisruptionRisk: 'low', globalMobility: 0.6 },
        lifestyle: { workLifeBalance: 'poor', stressLevel: 'high', scheduleFlexibility: 0.3, geographicFreedom: 0.4 },
        indiaReality: { coachingDependency: 'high', englishDependency: 'important', urbanAdvantage: 'essential', migrationRequirement: false, reservationSensitivity: true, familyAcceptance: 'very-high', socioEconomicBarriers: 'high' },
        education: { minimumEducation: 'professional-degree', typicalDegrees: ['MBBS'], certifications: [], examRequirements: { type: 'entrance+licensing', exams: ['NEET'], difficulty: 'high', preparationMonths: 24 }, yearsOfStudy: 6, educationCostRange: { min: 5000000, max: 20000000, typical: 10000000 } },
      }));
    });

    it('should filter by category', () => {
      const techCareers = ontology.filterCareers({ categories: ['technology'] });
      expect(techCareers).toHaveLength(1);
      expect(techCareers[0].identity.category).toBe('technology');
    });

    it('should filter by income potential', () => {
      const highIncome = ontology.filterCareers({ minIncomePotential: 0.8 });
      expect(highIncome).toHaveLength(1);
    });

    it('should filter by risk level', () => {
      const lowRisk = ontology.filterCareers({ maxRiskLevel: 'low' });
      expect(lowRisk.length).toBeGreaterThanOrEqual(1);
    });

    it('should filter by remote work', () => {
      const remote = ontology.filterCareers({ remoteWork: ['fully-remote', 'hybrid'] });
      expect(remote).toHaveLength(1);
    });

    it('should filter by education level', () => {
      const bachelor = ontology.filterCareers({ educationLevel: ['bachelor'] });
      expect(bachelor).toHaveLength(1);
    });

    it('should filter by future demand', () => {
      const growing = ontology.filterCareers({ futureDemand: ['high-growth', 'booming'] });
      expect(growing).toHaveLength(1);
    });

    it('should filter by work-life balance', () => {
      const goodBalance = ontology.filterCareers({ workLifeBalance: ['good', 'excellent'] });
      expect(goodBalance).toHaveLength(1);
    });

    it('should filter by coaching dependency', () => {
      const minimalCoaching = ontology.filterCareers({ coachingDependency: ['none', 'minimal'] });
      expect(minimalCoaching).toHaveLength(1);
    });

    it('should filter by family acceptance', () => {
      const highAcceptance = ontology.filterCareers({ familyAcceptance: ['high', 'very-high'] });
      expect(highAcceptance).toHaveLength(2);
    });
  });

  describe('compareCareers', () => {
    it('should compare multiple careers', () => {
      const career1 = createMockCareer({
        identity: { ...createMockCareer().identity, id: 'c1' as CareerId, slug: 'slug-1' as CareerSlug },
        psychology: { analyticalThinking: 0.9, creativity: 0.7, socialOrientation: 0.5, leadership: 0.6, detailOrientation: 0.8, curiosity: 0.8, competitiveness: 0.6, riskTolerance: 0.5 },
        reward: { incomePotential: 0.9, statusPotential: 0.7, impactPotential: 0.8, freedomPotential: 0.8, stabilityPotential: 0.7 },
      });
      const career2 = createMockCareer({
        identity: { ...createMockCareer().identity, id: 'c2' as CareerId, slug: 'slug-2' as CareerSlug },
        psychology: { analyticalThinking: 0.3, creativity: 0.8, socialOrientation: 0.9, leadership: 0.8, detailOrientation: 0.4, curiosity: 0.7, competitiveness: 0.5, riskTolerance: 0.4 },
        reward: { incomePotential: 0.6, statusPotential: 0.9, impactPotential: 0.9, freedomPotential: 0.5, stabilityPotential: 0.9 },
      });

      ontology.addCareer(career1);
      ontology.addCareer(career2);

      const comparison = ontology.compareCareers(['c1' as CareerId, 'c2' as CareerId]);

      expect(comparison.careers).toHaveLength(2);
      expect(comparison.differences.size).toBeGreaterThan(0);
    });

    it('should identify similarities', () => {
      const career1 = createMockCareer({
        identity: { ...createMockCareer().identity, id: 'c1' as CareerId, slug: 'slug-1' as CareerSlug, category: 'technology' },
        psychology: { analyticalThinking: 0.8, creativity: 0.7, socialOrientation: 0.5, leadership: 0.6, detailOrientation: 0.8, curiosity: 0.8, competitiveness: 0.6, riskTolerance: 0.5 },
      });
      const career2 = createMockCareer({
        identity: { ...createMockCareer().identity, id: 'c2' as CareerId, slug: 'slug-2' as CareerSlug, category: 'technology' },
        psychology: { analyticalThinking: 0.85, creativity: 0.75, socialOrientation: 0.55, leadership: 0.65, detailOrientation: 0.82, curiosity: 0.81, competitiveness: 0.62, riskTolerance: 0.52 },
      });

      ontology.addCareer(career1);
      ontology.addCareer(career2);

      const comparison = ontology.compareCareers(['c1' as CareerId, 'c2' as CareerId]);

      expect(comparison.similarities.length).toBeGreaterThan(0);
    });
  });

  describe('removeCareer', () => {
    it('should remove careers', () => {
      const career = createMockCareer();
      ontology.addCareer(career);

      const removed = ontology.removeCareer(career.identity.id);
      expect(removed).toBe(true);
      expect(ontology.getCareerCount()).toBe(0);
    });

    it('should return false for non-existent careers', () => {
      const removed = ontology.removeCareer('unknown' as CareerId);
      expect(removed).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all careers', () => {
      ontology.addCareer(createMockCareer({ identity: { ...createMockCareer().identity, id: 'c1' as CareerId, slug: 'slug-1' as CareerSlug } }));
      ontology.addCareer(createMockCareer({ identity: { ...createMockCareer().identity, id: 'c2' as CareerId, slug: 'slug-2' as CareerSlug } }));

      ontology.clear();
      expect(ontology.getCareerCount()).toBe(0);
    });
  });

  describe('export/import', () => {
    it('should export to JSON', () => {
      ontology.addCareer(createMockCareer());

      const json = ontology.exportToJSON();
      expect(json).toContain('Software Engineer');
      expect(() => JSON.parse(json)).not.toThrow();
    });

    it('should import from JSON', () => {
      const career = createMockCareer();
      ontology.addCareer(career);

      const json = ontology.exportToJSON();
      ontology.clear();

      const results = ontology.importFromJSON(json);
      expect(results.every(r => r.isValid)).toBe(true);
      expect(ontology.getCareerCount()).toBe(1);
    });
  });
});

// ============================================================================
// DOMAIN COVERAGE TESTS
// ============================================================================

describe('Domain Coverage', () => {
  it('should support all 10 domain profiles', () => {
    const career = createMockCareer();

    expect(career.identity).toBeDefined();
    expect(career.psychology).toBeDefined();
    expect(career.workStyle).toBeDefined();
    expect(career.reward).toBeDefined();
    expect(career.risk).toBeDefined();
    expect(career.optionality).toBeDefined();
    expect(career.education).toBeDefined();
    expect(career.indiaReality).toBeDefined();
    expect(career.future).toBeDefined();
    expect(career.lifestyle).toBeDefined();
  });

  it('should support all career categories', () => {
    const categories: CareerCategory[] = [
      'technology', 'healthcare', 'finance', 'education', 'engineering',
      'creative', 'business', 'legal', 'science', 'trades',
      'government', 'nonprofit', 'media', 'agriculture', 'hospitality',
      'manufacturing', 'research', 'sports', 'military', 'other',
    ];

    categories.forEach(category => {
      const career = createMockCareer({ identity: { ...createMockCareer().identity, category } });
      expect(career.identity.category).toBe(category);
    });
  });

  it('should support all India-specific fields', () => {
    const career = createMockCareer();

    expect(career.indiaReality.coachingDependency).toBeDefined();
    expect(career.indiaReality.englishDependency).toBeDefined();
    expect(career.indiaReality.urbanAdvantage).toBeDefined();
    expect(career.indiaReality.migrationRequirement).toBeDefined();
    expect(career.indiaReality.reservationSensitivity).toBeDefined();
    expect(career.indiaReality.familyAcceptance).toBeDefined();
    expect(career.indiaReality.socioEconomicBarriers).toBeDefined();
    expect(career.indiaReality.genderConsiderations).toBeDefined();
  });
});

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

describe('Performance', () => {
  it('should handle 1000 careers efficiently', () => {
    const ontology = new CareerOntologyV2();

    const startTime = Date.now();

    // Add 1000 careers
    for (let i = 0; i < 1000; i++) {
      const career = createMockCareer({
        identity: {
          ...createMockCareer().identity,
          id: `career-${i}` as CareerId,
          slug: `slug-${i}` as CareerSlug,
          name: `Career ${i}`,
          category: ['technology', 'healthcare', 'finance', 'education'][i % 4] as CareerCategory,
        },
      });
      ontology.addCareer(career);
    }

    const addTime = Date.now() - startTime;
    expect(addTime).toBeLessThan(5000); // Should complete in under 5 seconds

    // Test retrieval
    const retrieveStart = Date.now();
    const all = ontology.getAllCareers();
    const retrieveTime = Date.now() - retrieveStart;

    expect(all).toHaveLength(1000);
    expect(retrieveTime).toBeLessThan(100); // Should retrieve in under 100ms

    // Test filtering
    const filterStart = Date.now();
    const tech = ontology.filterCareers({ categories: ['technology'] });
    const filterTime = Date.now() - filterStart;

    expect(tech).toHaveLength(250);
    expect(filterTime).toBeLessThan(100); // Should filter in under 100ms
  });
});
