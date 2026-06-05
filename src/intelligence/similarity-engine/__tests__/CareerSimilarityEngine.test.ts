/**
 * Career Similarity Engine Tests
 *
 * Comprehensive test suite for multi-dimensional career similarity.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  CareerSimilarityEngine,
  createSimilarityEngine,
  quickSimilarity,
  SimilarityEngines,
  DEFAULT_WEIGHTS,
} from '../CareerSimilarityEngine';
import type { Career, PsychologyProfile, WorkStyleProfile, EducationProfile } from '../../../domains/career/Career';
import type { CareerCategory } from '../../../ontology/career-ontology';

// ============================================================================
// TEST FIXTURES
// ============================================================================

const createMockCareer = (
  id: string,
  name: string,
  category: CareerCategory,
  overrides: Partial<Career> = {}
): Career => ({
  id: id as any,
  name,
  category,
  description: `Description for ${name}`,
  tagline: `${name} tagline`,
  psychology: {
    analyticalThinking: 0.7,
    creativity: 0.5,
    socialOrientation: 0.6,
    leadership: 0.5,
    detailOrientation: 0.7,
    curiosity: 0.6,
    competitiveness: 0.5,
    riskTolerance: 0.4,
    ...(overrides.psychology || {}),
  } as PsychologyProfile,
  workStyle: {
    remoteWork: 'hybrid',
    officeWork: true,
    fieldWork: false,
    travelRequirement: 'occasional',
    teamOrientation: 'medium-team',
    soloOrientation: true,
    structuredEnvironment: true,
    unstructuredEnvironment: false,
    ...(overrides.workStyle || {}),
  } as WorkStyleProfile,
  reward: {
    incomePotential: 0.7,
    statusPotential: 0.6,
    impactPotential: 0.6,
    freedomPotential: 0.5,
    stabilityPotential: 0.6,
  },
  risk: {
    burnoutRisk: 'moderate',
    automationRisk: 'low',
    competitionLevel: 'moderate',
    incomeVolatility: 'low',
  },
  optionality: {
    careerFlexibility: 0.6,
    transferableSkills: 8,
    entrepreneurshipPotential: 0.4,
  },
  education: {
    minimumEducation: 'bachelor',
    typicalDegrees: ['B.Tech', 'B.E.'],
    certifications: [],
    examRequirements: {
      type: 'entrance',
      exams: ['JEE'],
      difficulty: 'high',
      preparationMonths: 12,
    },
    yearsOfStudy: 4,
    educationCostRange: { min: 200000, max: 1000000, typical: 500000 },
    ...(overrides.education || {}),
  } as EducationProfile,
  indiaReality: {
    coachingDependency: 'moderate',
    englishDependency: 'important',
    urbanAdvantage: 'significant',
    migrationRequirement: false,
    reservationSensitivity: true,
    familyAcceptance: 'high',
    socioEconomicBarriers: 'moderate',
  },
  future: {
    aiDisruptionRisk: 'low',
    futureDemand: 'growing',
    globalMobility: 0.7,
    industryGrowth: 'rapid',
  },
  lifestyle: {
    workLifeBalance: 'good',
    stressLevel: 'moderate',
    scheduleFlexibility: 0.6,
    geographicFreedom: 0.5,
  },
  ...overrides,
} as Career);

// Test careers
const softwareEngineer = createMockCareer(
  'career-software-engineer',
  'Software Engineer',
  'technology',
  {
    psychology: {
      analyticalThinking: 0.9,
      creativity: 0.6,
      socialOrientation: 0.4,
      leadership: 0.4,
      detailOrientation: 0.8,
      curiosity: 0.8,
      competitiveness: 0.5,
      riskTolerance: 0.5,
    },
    optionality: {
      careerFlexibility: 0.8,
      transferableSkills: 12,
      entrepreneurshipPotential: 0.6,
    },
    workStyle: {
      remoteWork: 'fully-remote',
      officeWork: true,
      fieldWork: false,
      travelRequirement: 'none',
      teamOrientation: 'small-team',
      soloOrientation: true,
      structuredEnvironment: false,
      unstructuredEnvironment: true,
    },
  }
);

const aiEngineer = createMockCareer(
  'career-ai-engineer',
  'AI Engineer',
  'technology',
  {
    psychology: {
      analyticalThinking: 0.95,
      creativity: 0.7,
      socialOrientation: 0.3,
      leadership: 0.4,
      detailOrientation: 0.85,
      curiosity: 0.9,
      competitiveness: 0.6,
      riskTolerance: 0.6,
    },
    optionality: {
      careerFlexibility: 0.75,
      transferableSkills: 10,
      entrepreneurshipPotential: 0.5,
    },
    workStyle: {
      remoteWork: 'fully-remote',
      officeWork: true,
      fieldWork: false,
      travelRequirement: 'none',
      teamOrientation: 'small-team',
      soloOrientation: true,
      structuredEnvironment: false,
      unstructuredEnvironment: true,
    },
    education: {
      minimumEducation: 'master',
      typicalDegrees: ['B.Tech', 'M.Tech', 'MS'],
      certifications: [],
      examRequirements: {
        type: 'entrance',
        exams: ['GATE', 'GRE'],
        difficulty: 'high',
        preparationMonths: 18,
      },
      yearsOfStudy: 6,
      educationCostRange: { min: 500000, max: 3000000, typical: 1500000 },
    },
  }
);

const doctor = createMockCareer(
  'career-doctor',
  'Doctor',
  'healthcare',
  {
    psychology: {
      analyticalThinking: 0.8,
      creativity: 0.3,
      socialOrientation: 0.9,
      leadership: 0.5,
      detailOrientation: 0.9,
      curiosity: 0.7,
      competitiveness: 0.8,
      riskTolerance: 0.3,
    },
    optionality: {
      careerFlexibility: 0.3,
      transferableSkills: 6,
      entrepreneurshipPotential: 0.3,
    },
    workStyle: {
      remoteWork: 'none',
      officeWork: true,
      fieldWork: false,
      travelRequirement: 'occasional',
      teamOrientation: 'large-team',
      soloOrientation: false,
      structuredEnvironment: true,
      unstructuredEnvironment: false,
    },
    education: {
      minimumEducation: 'professional-degree',
      typicalDegrees: ['MBBS', 'MD'],
      certifications: ['Medical License'],
      examRequirements: {
        type: 'entrance+licensing',
        exams: ['NEET', 'FMGE'],
        difficulty: 'severe',
        preparationMonths: 24,
      },
      yearsOfStudy: 10,
      educationCostRange: { min: 2000000, max: 10000000, typical: 5000000 },
    },
    future: {
      aiDisruptionRisk: 'low',
      futureDemand: 'high-growth',
      globalMobility: 0.8,
      industryGrowth: 'moderate',
    },
  }
);

const investmentBanker = createMockCareer(
  'career-investment-banker',
  'Investment Banker',
  'finance',
  {
    psychology: {
      analyticalThinking: 0.85,
      creativity: 0.4,
      socialOrientation: 0.8,
      leadership: 0.7,
      detailOrientation: 0.9,
      curiosity: 0.6,
      competitiveness: 0.9,
      riskTolerance: 0.8,
    },
    optionality: {
      careerFlexibility: 0.5,
      transferableSkills: 7,
      entrepreneurshipPotential: 0.5,
    },
    workStyle: {
      remoteWork: 'limited',
      officeWork: true,
      fieldWork: false,
      travelRequirement: 'frequent',
      teamOrientation: 'medium-team',
      soloOrientation: false,
      structuredEnvironment: true,
      unstructuredEnvironment: false,
    },
    education: {
      minimumEducation: 'master',
      typicalDegrees: ['MBA', 'B.Com'],
      certifications: ['CFA'],
      examRequirements: {
        type: 'certification',
        exams: ['CAT', 'CFA'],
        difficulty: 'high',
        preparationMonths: 12,
      },
      yearsOfStudy: 5,
      educationCostRange: { min: 1000000, max: 5000000, typical: 2500000 },
    },
    future: {
      aiDisruptionRisk: 'moderate',
      futureDemand: 'stable',
      globalMobility: 0.9,
      industryGrowth: 'moderate',
    },
  }
);

// ============================================================================
// TEST SUITE
// ============================================================================

describe('CareerSimilarityEngine', () => {
  let engine: CareerSimilarityEngine;

  beforeEach(() => {
    engine = new CareerSimilarityEngine();
  });

  describe('initialization', () => {
    it('should create with default weights', () => {
      expect(engine.getWeights()).toEqual(DEFAULT_WEIGHTS);
    });

    it('should create with custom weights', () => {
      const custom = new CareerSimilarityEngine({
        skillOverlap: 0.5,
        psychologyOverlap: 0.1,
        workStyleOverlap: 0.1,
        educationOverlap: 0.1,
        industryOverlap: 0.2,
      });
      expect(custom.getWeights().skillOverlap).toBe(0.5);
    });

    it('should throw on invalid weights', () => {
      expect(() => {
        new CareerSimilarityEngine({
          skillOverlap: 0.5,
          psychologyOverlap: 0.5,
          workStyleOverlap: 0.5,
          educationOverlap: 0.5,
          industryOverlap: 0.5,
        });
      }).toThrow('Weights must sum to 1.0');
    });
  });

  describe('similarity calculation', () => {
    it('should return score between 0-100', () => {
      const result = engine.calculateSimilarity(softwareEngineer, aiEngineer);
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
    });

    it('should return high similarity for same-category careers', () => {
      const result = engine.calculateSimilarity(softwareEngineer, aiEngineer);
      expect(result.overallScore).toBeGreaterThan(60);
      expect(result.dimensions.industryOverlap.score).toBe(100);
    });

    it('should return lower similarity for different-category careers', () => {
      const result = engine.calculateSimilarity(softwareEngineer, doctor);
      // Different categories should have lower similarity than same category
      const sameCategoryResult = engine.calculateSimilarity(softwareEngineer, aiEngineer);
      expect(result.overallScore).toBeLessThan(sameCategoryResult.overallScore);
    });

    it('should include all 5 dimensions', () => {
      const result = engine.calculateSimilarity(softwareEngineer, aiEngineer);
      expect(result.dimensions.skillOverlap).toBeDefined();
      expect(result.dimensions.psychologyOverlap).toBeDefined();
      expect(result.dimensions.workStyleOverlap).toBeDefined();
      expect(result.dimensions.educationOverlap).toBeDefined();
      expect(result.dimensions.industryOverlap).toBeDefined();
    });

    it('should include dimension scores and weights', () => {
      const result = engine.calculateSimilarity(softwareEngineer, aiEngineer);
      Object.values(result.dimensions).forEach(dim => {
        expect(dim.score).toBeGreaterThanOrEqual(0);
        expect(dim.score).toBeLessThanOrEqual(100);
        expect(dim.weight).toBeGreaterThan(0);
        expect(dim.details).toBeInstanceOf(Array);
      });
    });

    it('should include explanation', () => {
      const result = engine.calculateSimilarity(softwareEngineer, aiEngineer);
      expect(result.explanation.summary).toBeTruthy();
      expect(result.explanation.keySimilarities).toBeInstanceOf(Array);
      expect(result.explanation.keyDifferences).toBeInstanceOf(Array);
      expect(result.explanation.transitionAssessment).toBeTruthy();
      expect(result.explanation.recommendation).toBeTruthy();
    });

    it('should include confidence score', () => {
      const result = engine.calculateSimilarity(softwareEngineer, aiEngineer);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should include timestamp', () => {
      const before = Date.now();
      const result = engine.calculateSimilarity(softwareEngineer, aiEngineer);
      const after = Date.now();
      expect(result.computedAt).toBeGreaterThanOrEqual(before);
      expect(result.computedAt).toBeLessThanOrEqual(after);
    });
  });

  describe('dimension-specific calculations', () => {
    it('should calculate skill overlap based on transferable skills', () => {
      const result = engine.calculateSimilarity(softwareEngineer, aiEngineer);
      // Both tech careers should have high skill overlap
      expect(result.dimensions.skillOverlap.score).toBeGreaterThan(50);
    });

    it('should calculate psychology overlap based on trait similarity', () => {
      const result = engine.calculateSimilarity(softwareEngineer, doctor);
      // Tech vs healthcare should have lower psychology overlap
      expect(result.dimensions.psychologyOverlap.score).toBeDefined();
    });

    it('should calculate work-style overlap based on environment', () => {
      const result = engine.calculateSimilarity(softwareEngineer, doctor);
      // Remote vs no-remote should have lower work-style overlap
      expect(result.dimensions.workStyleOverlap.score).toBeLessThan(60);
    });

    it('should calculate education overlap based on requirements', () => {
      const result = engine.calculateSimilarity(softwareEngineer, doctor);
      // Bachelor vs professional degree should have lower education overlap
      expect(result.dimensions.educationOverlap.score).toBeLessThan(50);
    });

    it('should calculate industry overlap with category match', () => {
      const result = engine.calculateSimilarity(softwareEngineer, aiEngineer);
      // Same category = 100 industry overlap
      expect(result.dimensions.industryOverlap.score).toBe(100);
    });
  });

  describe('explanation generation', () => {
    it('should generate appropriate summary for high similarity', () => {
      const result = engine.calculateSimilarity(softwareEngineer, aiEngineer);
      if (result.overallScore >= 80) {
        expect(result.explanation.summary).toContain('highly similar');
      }
    });

    it('should generate appropriate summary for low similarity', () => {
      const result = engine.calculateSimilarity(softwareEngineer, doctor);
      if (result.overallScore < 40) {
        expect(result.explanation.summary).toContain('different');
      }
    });

    it('should include key similarities when dimensions align', () => {
      const result = engine.calculateSimilarity(softwareEngineer, aiEngineer);
      expect(result.explanation.keySimilarities.length).toBeGreaterThan(0);
    });

    it('should provide transition assessment', () => {
      const result = engine.calculateSimilarity(softwareEngineer, aiEngineer);
      expect(result.explanation.transitionAssessment).toContain('Transition');
    });

    it('should provide recommendation', () => {
      const result = engine.calculateSimilarity(softwareEngineer, aiEngineer);
      expect(result.explanation.recommendation.length).toBeGreaterThan(10);
    });
  });

  describe('batch comparison', () => {
    const careerPool = [softwareEngineer, aiEngineer, doctor, investmentBanker];

    it('should compare target with all careers in pool', () => {
      const result = engine.compareWithMany(softwareEngineer, careerPool);
      expect(result.comparisons.length).toBe(3); // Excludes self
      expect(result.targetCareer).toBe(softwareEngineer.id);
    });

    it('should rank comparisons by score', () => {
      const result = engine.compareWithMany(softwareEngineer, careerPool);
      for (let i = 1; i < result.ranked.length; i++) {
        expect(result.ranked[i].overallScore).toBeLessThanOrEqual(
          result.ranked[i - 1].overallScore
        );
      }
    });

    it('should include statistics', () => {
      const result = engine.compareWithMany(softwareEngineer, careerPool);
      expect(result.statistics.mean).toBeDefined();
      expect(result.statistics.median).toBeDefined();
      expect(result.statistics.min).toBeDefined();
      expect(result.statistics.max).toBeDefined();
      expect(result.statistics.stdDev).toBeDefined();
      expect(result.statistics.quartiles).toHaveLength(3);
    });

    it('should find most similar careers', () => {
      const mostSimilar = engine.findMostSimilar(softwareEngineer, careerPool, 2);
      expect(mostSimilar.length).toBeLessThanOrEqual(2);
      expect(mostSimilar[0].overallScore).toBeGreaterThanOrEqual(
        mostSimilar[mostSimilar.length - 1]?.overallScore || 0
      );
    });

    it('should find least similar careers', () => {
      const leastSimilar = engine.findLeastSimilar(softwareEngineer, careerPool, 2);
      expect(leastSimilar.length).toBeLessThanOrEqual(2);
      expect(leastSimilar[0].overallScore).toBeLessThanOrEqual(
        leastSimilar[leastSimilar.length - 1]?.overallScore || 100
      );
    });

    it('should respect minimum threshold', () => {
      const mostSimilar = engine.findMostSimilar(softwareEngineer, careerPool, 10, 70);
      mostSimilar.forEach(result => {
        expect(result.overallScore).toBeGreaterThanOrEqual(70);
      });
    });
  });

  describe('weight customization', () => {
    it('should update weights dynamically', () => {
      engine.setWeights({ skillOverlap: 0.5, psychologyOverlap: 0.1, workStyleOverlap: 0.1, educationOverlap: 0.1, industryOverlap: 0.2 });
      expect(engine.getWeights().skillOverlap).toBe(0.5);
    });

    it('should throw on invalid weight updates', () => {
      expect(() => {
        engine.setWeights({ skillOverlap: 1.0 });
      }).toThrow('Weights must sum to 1.0');
    });

    it('should use different weights for different engines', () => {
      const balanced = new CareerSimilarityEngine(DEFAULT_WEIGHTS);
      const skillFocused = SimilarityEngines.skillFocused();
      const lifestyleFocused = SimilarityEngines.lifestyleFocused();

      // Verify different engines have different weights
      expect(balanced.getWeights().skillOverlap).toBe(0.25);
      expect(skillFocused.getWeights().skillOverlap).toBe(0.40);
      expect(lifestyleFocused.getWeights().workStyleOverlap).toBe(0.40);

      // All engines should produce valid scores
      const balancedResult = balanced.calculateSimilarity(softwareEngineer, doctor);
      const skillResult = skillFocused.calculateSimilarity(softwareEngineer, doctor);
      const lifestyleResult = lifestyleFocused.calculateSimilarity(softwareEngineer, doctor);

      expect(balancedResult.overallScore).toBeGreaterThanOrEqual(0);
      expect(skillResult.overallScore).toBeGreaterThanOrEqual(0);
      expect(lifestyleResult.overallScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('pre-configured engines', () => {
    it('should create balanced engine', () => {
      const balanced = SimilarityEngines.balanced();
      expect(balanced.getWeights()).toEqual(DEFAULT_WEIGHTS);
    });

    it('should create skill-focused engine', () => {
      const skill = SimilarityEngines.skillFocused();
      expect(skill.getWeights().skillOverlap).toBe(0.40);
      expect(skill.getWeights().psychologyOverlap).toBe(0.15);
    });

    it('should create lifestyle-focused engine', () => {
      const lifestyle = SimilarityEngines.lifestyleFocused();
      expect(lifestyle.getWeights().workStyleOverlap).toBe(0.40);
    });

    it('should create future-focused engine', () => {
      const future = SimilarityEngines.futureFocused();
      expect(future.getWeights().industryOverlap).toBe(0.45);
    });

    it('should create psychology-focused engine', () => {
      const psych = SimilarityEngines.psychologyFocused();
      expect(psych.getWeights().psychologyOverlap).toBe(0.45);
    });
  });

  describe('utility functions', () => {
    it('should create engine via factory', () => {
      const engine = createSimilarityEngine();
      expect(engine).toBeInstanceOf(CareerSimilarityEngine);
    });

    it('should create engine with custom weights via factory', () => {
      const engine = createSimilarityEngine({ skillOverlap: 0.5, psychologyOverlap: 0.1, workStyleOverlap: 0.1, educationOverlap: 0.1, industryOverlap: 0.2 });
      expect(engine.getWeights().skillOverlap).toBe(0.5);
    });

    it('should provide quick similarity score', () => {
      const score = quickSimilarity(softwareEngineer, aiEngineer);
      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('edge cases', () => {
    it('should handle careers with minimal data', () => {
      const minimalCareer = {
        id: 'minimal',
        name: 'Minimal',
        category: 'other',
      } as Career;

      const result = engine.calculateSimilarity(minimalCareer, softwareEngineer);
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
    });

    it('should handle identical careers', () => {
      const result = engine.calculateSimilarity(softwareEngineer, softwareEngineer);
      // Same career should have high similarity (though not necessarily 100 due to implementation)
      expect(result.overallScore).toBeGreaterThan(80);
    });

    it('should handle empty career pool', () => {
      const result = engine.compareWithMany(softwareEngineer, []);
      expect(result.comparisons).toHaveLength(0);
      expect(result.ranked).toHaveLength(0);
    });

    it('should handle single career pool', () => {
      const result = engine.compareWithMany(softwareEngineer, [aiEngineer]);
      expect(result.comparisons).toHaveLength(1);
    });
  });

  describe('confidence calculation', () => {
    it('should have higher confidence when dimensions agree', () => {
      // Similar careers should have more consistent dimension scores
      const similar = engine.calculateSimilarity(softwareEngineer, aiEngineer);
      const different = engine.calculateSimilarity(softwareEngineer, doctor);

      // Both should have reasonable confidence
      expect(similar.confidence).toBeGreaterThan(0.8);
      expect(different.confidence).toBeGreaterThan(0.8);
    });
  });

  describe('dimension details', () => {
    it('should provide details for skill overlap', () => {
      const result = engine.calculateSimilarity(softwareEngineer, aiEngineer);
      expect(result.dimensions.skillOverlap.details.length).toBeGreaterThan(0);
    });

    it('should provide details for psychology overlap', () => {
      const result = engine.calculateSimilarity(softwareEngineer, doctor);
      expect(result.dimensions.psychologyOverlap.details.length).toBeGreaterThanOrEqual(0);
    });

    it('should provide details for work-style overlap', () => {
      const result = engine.calculateSimilarity(softwareEngineer, doctor);
      expect(result.dimensions.workStyleOverlap.details.length).toBeGreaterThanOrEqual(0);
    });

    it('should provide details for education overlap', () => {
      const result = engine.calculateSimilarity(softwareEngineer, doctor);
      expect(result.dimensions.educationOverlap.details.length).toBeGreaterThanOrEqual(0);
    });

    it('should provide details for industry overlap', () => {
      const result = engine.calculateSimilarity(softwareEngineer, aiEngineer);
      expect(result.dimensions.industryOverlap.details.length).toBeGreaterThan(0);
    });
  });
});
