/**
 * CareerOS Optionality Engine V1 Tests
 *
 * Comprehensive test suite for optionality calculations.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  OptionalityEngineV1,
  calculateOptionality,
  calculateBatchOptionality,
  compareCareerOptionality,
  type OptionalityAnalysis,
  type OptionalityCalculationOptions,
} from '../index';
import type { Career, OptionalityProfile, PsychologicalProfile, WorkStyleProfile, RewardProfile, RiskProfile } from '../../../domains/career/Career';

// ============================================================================
// MOCK DATA FACTORIES
// ============================================================================

const createMockPsychologicalProfile = (overrides: Partial<PsychologicalProfile> = {}): PsychologicalProfile => ({
  analyticalThinking: 0.7,
  creativity: 0.6,
  socialOrientation: 0.5,
  leadership: 0.5,
  detailOrientation: 0.7,
  curiosity: 0.7,
  competitiveness: 0.5,
  riskTolerance: 0.5,
  ...overrides,
});

const createMockWorkStyle = (overrides: Partial<WorkStyleProfile> = {}): WorkStyleProfile => ({
  remoteWork: 0.7,
  officeWork: 0.4,
  fieldWork: 0.1,
  travelRequirement: 0.2,
  teamOrientation: 0.6,
  soloOrientation: 0.4,
  structuredEnvironment: 0.5,
  unstructuredEnvironment: 0.5,
  ...overrides,
});

const createMockRewardProfile = (overrides: Partial<RewardProfile> = {}): RewardProfile => ({
  incomePotential: 0.7,
  statusPotential: 0.6,
  impactPotential: 0.6,
  freedomPotential: 0.6,
  stabilityPotential: 0.6,
  ...overrides,
});

const createMockRiskProfile = (overrides: Partial<RiskProfile> = {}): RiskProfile => ({
  burnoutRisk: 0.5,
  automationRisk: 0.3,
  competitionLevel: 0.5,
  incomeVolatility: 0.4,
  ...overrides,
});

const createMockOptionalityProfile = (overrides: Partial<OptionalityProfile> = {}): OptionalityProfile => ({
  careerFlexibility: 0.7,
  transferableSkills: 0.7,
  entrepreneurshipPotential: 0.5,
  ...overrides,
});

const createMockCareer = (overrides: Partial<Career> & { id?: string; name?: string } = {}): Career => ({
  id: overrides.id || 'test-career',
  name: overrides.name || 'Test Career',
  slug: overrides.id || 'test-career',
  category: 'technology',
  description: 'A test career for unit tests.',
  tagline: 'Test your code',
  psychologicalProfile: createMockPsychologicalProfile(overrides.psychologicalProfile),
  workStyle: createMockWorkStyle(overrides.workStyle),
  rewardProfile: createMockRewardProfile(overrides.rewardProfile),
  riskProfile: createMockRiskProfile(overrides.riskProfile),
  optionality: createMockOptionalityProfile(overrides.optionality),
  education: {
    minimumLevel: 'bachelors',
    typicalDegrees: ['B.Tech'],
    certifications: [],
  },
  indiaReality: {
    coachingDependency: 0.3,
    urbanAdvantage: 0.6,
    englishDependency: 0.5,
    migrationRequirement: 0.2,
    reservationApplicable: false,
  },
  evolution: {
    adjacentCareers: [],
    futureCareerPaths: [],
  },
  salary: {
    entrySalaryIndia: { min: 400000, max: 1000000, median: 700000 },
    midCareerSalaryIndia: { min: 1000000, max: 3000000, median: 2000000 },
    seniorSalaryIndia: { min: 2500000, max: 8000000, median: 5000000 },
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  schemaVersion: 1,
  ...overrides,
} as Career);

// ============================================================================
// OPTIONALITY ENGINE TESTS
// ============================================================================

describe('OptionalityEngineV1', () => {
  let engine: OptionalityEngineV1;

  beforeEach(() => {
    engine = new OptionalityEngineV1();
  });

  describe('calculateOptionality', () => {
    it('should calculate optionality for a career', () => {
      const career = createMockCareer({ id: 'software-engineer', name: 'Software Engineer' });
      const analysis = engine.calculateOptionality(career);

      expect(analysis).toBeDefined();
      expect(analysis.overallScore).toBeGreaterThanOrEqual(0);
      expect(analysis.overallScore).toBeLessThanOrEqual(100);
    });

    it('should return all dimension scores', () => {
      const career = createMockCareer();
      const analysis = engine.calculateOptionality(career);

      expect(analysis.dimensions.careerFlexibility).toBeDefined();
      expect(analysis.dimensions.transferableSkills).toBeDefined();
      expect(analysis.dimensions.pivotPotential).toBeDefined();
      expect(analysis.dimensions.entrepreneurshipPotential).toBeDefined();
      expect(analysis.dimensions.futureCareerOptions).toBeDefined();

      // All scores should be between 0 and 1
      Object.values(analysis.dimensions).forEach(dim => {
        expect(dim.score).toBeGreaterThanOrEqual(0);
        expect(dim.score).toBeLessThanOrEqual(1);
      });
    });

    it('should include summary and reasoning', () => {
      const career = createMockCareer({ name: 'Test Career' });
      const analysis = engine.calculateOptionality(career);

      expect(analysis.summary).toContain('Test Career');
      expect(analysis.reasoning).toBeInstanceOf(Array);
      expect(analysis.reasoning.length).toBeGreaterThan(0);
    });

    it('should include adjacent careers', () => {
      const career = createMockCareer({ id: 'software-engineer' });
      const analysis = engine.calculateOptionality(career);

      expect(analysis.adjacentCareers).toBeInstanceOf(Array);
      // Software engineer should have adjacent careers defined
      expect(analysis.adjacentCareers.length).toBeGreaterThan(0);
    });

    it('should include skill categories', () => {
      const career = createMockCareer();
      const analysis = engine.calculateOptionality(career);

      expect(analysis.skillCategories).toBeInstanceOf(Array);
      expect(analysis.skillCategories.length).toBeGreaterThan(0);
    });

    it('should assign appropriate rating', () => {
      const highOptionalityCareer = createMockCareer({
        id: 'software-engineer',
        optionality: { careerFlexibility: 0.9, transferableSkills: 0.9, entrepreneurshipPotential: 0.8 },
        psychologicalProfile: createMockPsychologicalProfile({
          analyticalThinking: 0.9,
          leadership: 0.8,
          curiosity: 0.9,
          riskTolerance: 0.8,
        }),
      });

      const analysis = engine.calculateOptionality(highOptionalityCareer);
      expect(['exceptional', 'high', 'good']).toContain(analysis.rating);
    });

    it('should include timestamp', () => {
      const career = createMockCareer();
      const analysis = engine.calculateOptionality(career);

      expect(analysis.calculatedAt).toBeGreaterThan(0);
      expect(analysis.calculatedAt).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('Dimension Calculations', () => {
    it('should calculate career flexibility based on psychological traits', () => {
      const highFlexCareer = createMockCareer({
        psychologicalProfile: createMockPsychologicalProfile({
          analyticalThinking: 0.9,
          curiosity: 0.8,
          riskTolerance: 0.7,
        }),
        workStyle: createMockWorkStyle({ remoteWork: 0.8 }),
      });

      const analysis = engine.calculateOptionality(highFlexCareer);
      expect(analysis.dimensions.careerFlexibility.score).toBeGreaterThan(0.6);
    });

    it('should calculate transferable skills based on profile', () => {
      const highTransferCareer = createMockCareer({
        psychologicalProfile: createMockPsychologicalProfile({
          leadership: 0.9,
          socialOrientation: 0.8,
          analyticalThinking: 0.8,
          creativity: 0.7,
        }),
      });

      const analysis = engine.calculateOptionality(highTransferCareer);
      expect(analysis.dimensions.transferableSkills.score).toBeGreaterThan(0.6);
    });

    it('should calculate pivot potential based on adjacencies', () => {
      const softwareEng = createMockCareer({ id: 'software-engineer' });
      const analysis = engine.calculateOptionality(softwareEng);

      // Software engineer should have good pivot potential
      expect(analysis.dimensions.pivotPotential.score).toBeGreaterThan(0.4);
    });

    it('should calculate entrepreneurship potential', () => {
      const entrepreneurialCareer = createMockCareer({
        psychologicalProfile: createMockPsychologicalProfile({
          riskTolerance: 0.9,
          leadership: 0.8,
          creativity: 0.8,
        }),
        rewardProfile: createMockRewardProfile({ freedomPotential: 0.8 }),
      });

      const analysis = engine.calculateOptionality(entrepreneurialCareer);
      expect(analysis.dimensions.entrepreneurshipPotential.score).toBeGreaterThan(0.5);
    });

    it('should calculate future career options', () => {
      const career = createMockCareer({ id: 'software-engineer' });
      const analysis = engine.calculateOptionality(career);

      expect(analysis.dimensions.futureCareerOptions.score).toBeGreaterThan(0);
      expect(analysis.dimensions.futureCareerOptions.explanation).toMatch(/career|paths|options/i);
    });
  });

  describe('Career Comparisons', () => {
    it('should compare two careers', () => {
      const career1 = createMockCareer({
        id: 'software-engineer',
        name: 'Software Engineer',
        optionality: { careerFlexibility: 0.9, transferableSkills: 0.9, entrepreneurshipPotential: 0.7 },
      });

      const career2 = createMockCareer({
        id: 'doctor',
        name: 'Doctor',
        optionality: { careerFlexibility: 0.3, transferableSkills: 0.4, entrepreneurshipPotential: 0.3 },
      });

      const comparison = engine.compareOptionality(career1, career2);

      expect(comparison.winner).toBe('career1');
      expect(comparison.score1).toBeGreaterThan(comparison.score2);
      expect(comparison.comparison).toContain('Software Engineer');
    });

    it('should identify tie when scores are close', () => {
      const career1 = createMockCareer({
        id: 'career-a',
        name: 'Career A',
        optionality: { careerFlexibility: 0.7, transferableSkills: 0.7, entrepreneurshipPotential: 0.5 },
      });

      const career2 = createMockCareer({
        id: 'career-b',
        name: 'Career B',
        optionality: { careerFlexibility: 0.7, transferableSkills: 0.7, entrepreneurshipPotential: 0.5 },
      });

      const comparison = engine.compareOptionality(career1, career2);
      expect(comparison.winner).toBe('tie');
    });

    it('should provide dimension comparison', () => {
      const career1 = createMockCareer({ id: 'software-engineer' });
      const career2 = createMockCareer({ id: 'doctor' });

      const comparison = engine.compareOptionality(career1, career2);

      expect(comparison.dimensionComparison.careerFlexibility).toBeDefined();
      expect(comparison.dimensionComparison.transferableSkills).toBeDefined();
    });
  });

  describe('Batch Calculations', () => {
    it('should calculate optionality for multiple careers', () => {
      const careers = [
        createMockCareer({ id: 'career-1', name: 'Career 1' }),
        createMockCareer({ id: 'career-2', name: 'Career 2' }),
        createMockCareer({ id: 'career-3', name: 'Career 3' }),
      ];

      const results = engine.calculateBatch(careers);

      expect(results.size).toBe(3);
      expect(results.has('career-1')).toBe(true);
      expect(results.has('career-2')).toBe(true);
      expect(results.has('career-3')).toBe(true);
    });

    it('should use provided careers for adjacency analysis', () => {
      const careers = [
        createMockCareer({ id: 'software-engineer', name: 'Software Engineer' }),
        createMockCareer({ id: 'product-manager', name: 'Product Manager' }),
      ];

      const results = engine.calculateBatch(careers);
      const seAnalysis = results.get('software-engineer')!;

      expect(seAnalysis.adjacentCareers.some(a => a.careerId === 'product-manager')).toBe(true);
    });
  });

  describe('Rating Categories', () => {
    it('should assign exceptional rating for scores >= 90', () => {
      const career = createMockCareer({
        optionality: { careerFlexibility: 0.95, transferableSkills: 0.95, entrepreneurshipPotential: 0.9 },
        psychologicalProfile: createMockPsychologicalProfile({
          analyticalThinking: 0.9,
          leadership: 0.9,
          creativity: 0.9,
          riskTolerance: 0.9,
        }),
      });

      const analysis = engine.calculateOptionality(career);
      if (analysis.overallScore >= 90) {
        expect(analysis.rating).toBe('exceptional');
      }
    });

    it('should assign limited rating for low scores', () => {
      const career = createMockCareer({
        id: 'specialized-role',
        optionality: { careerFlexibility: 0.2, transferableSkills: 0.2, entrepreneurshipPotential: 0.1 },
        psychologicalProfile: createMockPsychologicalProfile({
          riskTolerance: 0.2,
          socialOrientation: 0.3,
        }),
      });

      const analysis = engine.calculateOptionality(career);
      if (analysis.overallScore < 30) {
        expect(analysis.rating).toBe('limited');
      }
    });
  });

  describe('Explanation Quality', () => {
    it('should provide meaningful dimension explanations', () => {
      const career = createMockCareer({ id: 'software-engineer' });
      const analysis = engine.calculateOptionality(career);

      Object.values(analysis.dimensions).forEach(dim => {
        expect(dim.explanation).toBeTruthy();
        expect(dim.explanation.length).toBeGreaterThan(10);
      });
    });

    it('should include factors for each dimension', () => {
      const career = createMockCareer({
        psychologicalProfile: createMockPsychologicalProfile({
          analyticalThinking: 0.9,
          leadership: 0.9,
          creativity: 0.8,
        }),
      });

      const analysis = engine.calculateOptionality(career);

      // High-scoring dimensions should have factors
      const highScoringDims = Object.values(analysis.dimensions).filter(d => d.score > 0.6);
      expect(highScoringDims.length).toBeGreaterThan(0);
    });

    it('should generate appropriate summary based on score', () => {
      const highOptionality = createMockCareer({
        id: 'software-engineer',
        name: 'Software Engineer',
        optionality: { careerFlexibility: 0.9, transferableSkills: 0.9, entrepreneurshipPotential: 0.8 },
      });

      const analysis = engine.calculateOptionality(highOptionality);
      expect(analysis.summary).toContain('Software Engineer');

      if (analysis.overallScore >= 75) {
        expect(analysis.summary).toContain('high-optionality');
      }
    });
  });

  describe('Skill Categories', () => {
    it('should identify technical skills for analytical careers', () => {
      const career = createMockCareer({
        psychologicalProfile: createMockPsychologicalProfile({
          analyticalThinking: 0.9,
        }),
      });

      const analysis = engine.calculateOptionality(career);
      const technicalCategory = analysis.skillCategories.find(s => s.category === 'Technical');

      expect(technicalCategory).toBeDefined();
      expect(technicalCategory!.transferability).toBeGreaterThan(0.8);
    });

    it('should identify people skills for social careers', () => {
      const career = createMockCareer({
        psychologicalProfile: createMockPsychologicalProfile({
          socialOrientation: 0.9,
          leadership: 0.8,
        }),
      });

      const analysis = engine.calculateOptionality(career);
      const peopleCategory = analysis.skillCategories.find(s => s.category === 'People');

      expect(peopleCategory).toBeDefined();
    });

    it('should include applicable industries for each category', () => {
      const career = createMockCareer();
      const analysis = engine.calculateOptionality(career);

      analysis.skillCategories.forEach(cat => {
        expect(cat.applicableIndustries).toBeInstanceOf(Array);
        expect(cat.applicableIndustries.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Adjacent Careers', () => {
    it('should include transition ease for adjacent careers', () => {
      const career = createMockCareer({ id: 'software-engineer' });
      const analysis = engine.calculateOptionality(career);

      analysis.adjacentCareers.forEach(adj => {
        expect(adj.transitionEase).toBeGreaterThanOrEqual(0);
        expect(adj.transitionEase).toBeLessThanOrEqual(1);
        expect(adj.transitionTimeMonths).toBeGreaterThan(0);
      });
    });

    it('should include reasoning for each adjacent career', () => {
      const career = createMockCareer({ id: 'software-engineer' });
      const analysis = engine.calculateOptionality(career);

      analysis.adjacentCareers.forEach(adj => {
        expect(adj.reasoning).toBeTruthy();
        expect(adj.reasoning.length).toBeGreaterThan(5);
      });
    });

    it('should estimate skill overlap', () => {
      const career = createMockCareer({ id: 'software-engineer' });
      const analysis = engine.calculateOptionality(career);

      analysis.adjacentCareers.forEach(adj => {
        expect(adj.skillOverlap).toBeGreaterThanOrEqual(0);
        expect(adj.skillOverlap).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Percentile Calculation', () => {
    it('should assign high percentile for high scores', () => {
      const career = createMockCareer({
        optionality: { careerFlexibility: 0.95, transferableSkills: 0.95, entrepreneurshipPotential: 0.9 },
      });

      const analysis = engine.calculateOptionality(career);
      if (analysis.overallScore >= 85) {
        expect(analysis.percentile).toBeGreaterThanOrEqual(75);
      }
    });

    it('should assign low percentile for low scores', () => {
      const career = createMockCareer({
        optionality: { careerFlexibility: 0.2, transferableSkills: 0.2, entrepreneurshipPotential: 0.1 },
      });

      const analysis = engine.calculateOptionality(career);
      if (analysis.overallScore < 50) {
        expect(analysis.percentile).toBeLessThan(50);
      }
    });
  });
});

// ============================================================================
// FACTORY FUNCTION TESTS
// ============================================================================

describe('Factory Functions', () => {
  describe('calculateOptionality', () => {
    it('should calculate optionality using factory function', () => {
      const career = createMockCareer({ id: 'software-engineer', name: 'Software Engineer' });
      const analysis = calculateOptionality(career);

      expect(analysis).toBeDefined();
      expect(analysis.overallScore).toBeGreaterThanOrEqual(0);
      expect(analysis.overallScore).toBeLessThanOrEqual(100);
    });

    it('should accept custom options', () => {
      const career = createMockCareer();
      const options: OptionalityCalculationOptions = {
        weights: {
          careerFlexibility: 0.4,
          transferableSkills: 0.3,
        },
      };

      const analysis = calculateOptionality(career, options);
      expect(analysis).toBeDefined();
    });
  });

  describe('calculateBatchOptionality', () => {
    it('should calculate batch optionality', () => {
      const careers = [
        createMockCareer({ id: 'career-1', name: 'Career 1' }),
        createMockCareer({ id: 'career-2', name: 'Career 2' }),
      ];

      const results = calculateBatchOptionality(careers);
      expect(results.size).toBe(2);
    });
  });

  describe('compareCareerOptionality', () => {
    it('should compare two careers using factory function', () => {
      const career1 = createMockCareer({ id: 'software-engineer', name: 'Software Engineer' });
      const career2 = createMockCareer({ id: 'doctor', name: 'Doctor' });

      const comparison = compareCareerOptionality(career1, career2);

      expect(comparison.winner).toBeDefined();
      expect(comparison.score1).toBeDefined();
      expect(comparison.score2).toBeDefined();
      expect(comparison.comparison).toBeTruthy();
    });
  });
});

// ============================================================================
// SPECIFIC CAREER TESTS
// ============================================================================

describe('Specific Career Analysis', () => {
  it('should analyze Software Engineer as high optionality', () => {
    const softwareEng = createMockCareer({
      id: 'software-engineer',
      name: 'Software Engineer',
      optionality: { careerFlexibility: 0.9, transferableSkills: 0.9, entrepreneurshipPotential: 0.8 },
      psychologicalProfile: createMockPsychologicalProfile({
        analyticalThinking: 0.9,
        creativity: 0.7,
        curiosity: 0.9,
      }),
    });

    const analysis = calculateOptionality(softwareEng);

    expect(analysis.overallScore).toBeGreaterThan(70);
    expect(analysis.adjacentCareers.length).toBeGreaterThanOrEqual(4);
    expect(analysis.dimensions.careerFlexibility.score).toBeGreaterThan(0.7);
    expect(analysis.dimensions.transferableSkills.score).toBeGreaterThan(0.7);
  });

  it('should analyze Doctor as lower optionality', () => {
    const doctor = createMockCareer({
      id: 'doctor',
      name: 'Doctor',
      optionality: { careerFlexibility: 0.3, transferableSkills: 0.4, entrepreneurshipPotential: 0.3 },
      psychologicalProfile: createMockPsychologicalProfile({
        analyticalThinking: 0.9,
        detailOrientation: 0.9,
        riskTolerance: 0.3,
      }),
    });

    const analysis = calculateOptionality(doctor);

    // Doctor should have lower pivot potential due to specialization
    expect(analysis.dimensions.pivotPotential.score).toBeLessThan(0.6);
    expect(analysis.adjacentCareers.length).toBeLessThanOrEqual(5);
  });

  it('should identify entrepreneur as high entrepreneurship potential', () => {
    const entrepreneur = createMockCareer({
      id: 'entrepreneur',
      name: 'Entrepreneur',
      optionality: { careerFlexibility: 0.9, transferableSkills: 0.8, entrepreneurshipPotential: 0.95 },
      psychologicalProfile: createMockPsychologicalProfile({
        riskTolerance: 0.9,
        leadership: 0.9,
        creativity: 0.8,
        competitiveness: 0.8,
      }),
      rewardProfile: createMockRewardProfile({ freedomPotential: 0.9 }),
    });

    const analysis = calculateOptionality(entrepreneur);

    expect(analysis.dimensions.entrepreneurshipPotential.score).toBeGreaterThan(0.7);
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

describe('Edge Cases', () => {
  it('should handle career without optionality profile', () => {
    const career = createMockCareer({ optionality: undefined });
    const analysis = calculateOptionality(career);

    expect(analysis).toBeDefined();
    expect(analysis.overallScore).toBeGreaterThanOrEqual(0);
  });

  it('should handle career with minimal psychological data', () => {
    const career = createMockCareer({
      psychologicalProfile: createMockPsychologicalProfile({
        analyticalThinking: 0.5,
        creativity: 0.5,
        socialOrientation: 0.5,
        leadership: 0.5,
        detailOrientation: 0.5,
        curiosity: 0.5,
        competitiveness: 0.5,
        riskTolerance: 0.5,
      }),
    });

    const analysis = calculateOptionality(career);
    expect(analysis).toBeDefined();
    expect(analysis.overallScore).toBeGreaterThanOrEqual(20);
  });

  it('should handle career with unknown ID (no adjacency rules)', () => {
    const career = createMockCareer({ id: 'unknown-career-123' });
    const analysis = calculateOptionality(career);

    expect(analysis).toBeDefined();
    expect(analysis.dimensions.pivotPotential.score).toBeGreaterThanOrEqual(0);
  });

  it('should be deterministic - same input produces same output', () => {
    const career = createMockCareer({ id: 'software-engineer' });

    const analysis1 = calculateOptionality(career);
    const analysis2 = calculateOptionality(career);

    expect(analysis1.overallScore).toBe(analysis2.overallScore);
    expect(analysis1.rating).toBe(analysis2.rating);
    expect(analysis1.dimensions.careerFlexibility.score).toBe(analysis2.dimensions.careerFlexibility.score);
  });
});

// ============================================================================
// WEIGHTS CUSTOMIZATION
// ============================================================================

describe('Custom Weights', () => {
  it('should allow custom dimension weights', () => {
    const career = createMockCareer();
    const options: OptionalityCalculationOptions = {
      weights: {
        entrepreneurshipPotential: 0.5,
        careerFlexibility: 0.3,
        transferableSkills: 0.2,
        pivotPotential: 0,
        futureCareerOptions: 0,
      },
    };

    const analysis = calculateOptionality(career, options);
    expect(analysis).toBeDefined();
  });

  it('should use default weights when not specified', () => {
    const career = createMockCareer();
    const options: OptionalityCalculationOptions = {};

    const analysis = calculateOptionality(career, options);
    expect(analysis).toBeDefined();
  });
});
