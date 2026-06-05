/**
 * Career Domain Model Tests
 *
 * Validates the Career domain model structure and behavior.
 */

import { describe, it, expect } from 'vitest';
import {
  // Types
  Career,
  CareerCategory,
  EducationLevel,
  DegreeType,
  CertificationType,
  CareerSortOption,

  // Validation
  isValidCareerScore,
  validateCareer,

  // Builder
  CareerBuilder,

  // Helpers
  createNeutralPsychologicalProfile,
  formatSalaryINR,
  formatSalaryRange,
} from '../Career';

import {
  softwareEngineer,
  doctor,
  sampleCareers,
  getCareerBySlug,
} from '../examples';

describe('Career Domain Model', () => {
  describe('Type System', () => {
    it('should have valid career categories', () => {
      expect(Object.values(CareerCategory)).toContain('technology');
      expect(Object.values(CareerCategory)).toContain('healthcare');
      expect(Object.values(CareerCategory)).toContain('business');
    });

    it('should have valid education levels', () => {
      expect(Object.values(EducationLevel)).toContain('bachelors');
      expect(Object.values(EducationLevel)).toContain('masters');
      expect(Object.values(EducationLevel)).toContain('doctorate');
    });

    it('should have valid degree types', () => {
      expect(Object.values(DegreeType)).toContain('B.Tech');
      expect(Object.values(DegreeType)).toContain('MBBS');
      expect(Object.values(DegreeType)).toContain('MBA');
    });

    it('should have valid certification types', () => {
      expect(Object.values(CertificationType)).toContain('AWS Certified');
      expect(Object.values(CertificationType)).toContain('Project Management Professional');
    });
  });

  describe('Career Score Validation', () => {
    it('should validate valid scores (0.0 - 1.0)', () => {
      expect(isValidCareerScore(0)).toBe(true);
      expect(isValidCareerScore(0.5)).toBe(true);
      expect(isValidCareerScore(1)).toBe(true);
      expect(isValidCareerScore(0.75)).toBe(true);
    });

    it('should reject invalid scores', () => {
      expect(isValidCareerScore(-0.1)).toBe(false);
      expect(isValidCareerScore(1.1)).toBe(false);
      expect(isValidCareerScore(NaN)).toBe(false);
      expect(isValidCareerScore('0.5' as unknown as number)).toBe(false);
    });
  });

  describe('CareerBuilder', () => {
    it('should create a valid career with all required fields', () => {
      const career = new CareerBuilder('test-career', 'Test Career')
        .withDescription('A test career for validation')
        .inCategory(CareerCategory.TECHNOLOGY)
        .withPsychologicalProfile(createNeutralPsychologicalProfile())
        .withWorkStyle({
          remoteWork: 0.5,
          officeWork: 0.5,
          fieldWork: 0,
          travelRequirement: 0.2,
          teamOrientation: 0.5,
          soloOrientation: 0.5,
          structuredEnvironment: 0.5,
          unstructuredEnvironment: 0.5,
        })
        .withRewardProfile({
          incomePotential: 0.5,
          statusPotential: 0.5,
          impactPotential: 0.5,
          freedomPotential: 0.5,
          stabilityPotential: 0.5,
        })
        .withRiskProfile({
          burnoutRisk: 0.5,
          automationRisk: 0.3,
          competitionLevel: 0.5,
          incomeVolatility: 0.4,
        })
        .withOptionality({
          careerFlexibility: 0.5,
          transferableSkills: 0.5,
          entrepreneurshipPotential: 0.5,
        })
        .withEducation({
          minimumLevel: EducationLevel.BACHELORS,
          typicalDegrees: [DegreeType.BTECH],
          certifications: [],
        })
        .withIndiaReality({
          coachingDependency: 0.3,
          urbanAdvantage: 0.4,
          englishDependency: 0.5,
          migrationRequirement: 0.2,
          reservationApplicable: false,
        })
        .withEvolution({
          adjacentCareers: [],
          futureCareerPaths: [],
        })
        .withSalary({
          entrySalaryIndia: { min: 300000, max: 800000, median: 500000 },
          midCareerSalaryIndia: { min: 600000, max: 1500000, median: 1000000 },
          seniorSalaryIndia: { min: 1200000, max: 3000000, median: 2000000 },
        })
        .build();

      expect(career.id).toBe('test-career');
      expect(career.name).toBe('Test Career');
      expect(career.category).toBe(CareerCategory.TECHNOLOGY);
      expect(validateCareer(career)).toBe(true);
    });

    it('should throw error for invalid career', () => {
      expect(() => {
        new CareerBuilder('invalid', 'Invalid')
          // Missing required fields
          .build();
      }).toThrow('Invalid Career');
    });
  });

  describe('Example Careers', () => {
    it('should have valid software engineer career', () => {
      expect(validateCareer(softwareEngineer)).toBe(true);
      expect(softwareEngineer.id).toBe('software-engineer');
      expect(softwareEngineer.category).toBe(CareerCategory.TECHNOLOGY);
      expect(softwareEngineer.psychologicalProfile.analyticalThinking).toBe(0.9);
    });

    it('should have valid doctor career', () => {
      expect(validateCareer(doctor)).toBe(true);
      expect(doctor.id).toBe('doctor');
      expect(doctor.category).toBe(CareerCategory.HEALTHCARE);
      expect(doctor.psychologicalProfile.socialOrientation).toBe(0.8);
    });

    it('should have contrasting profiles between careers', () => {
      // Software engineer: high remote work
      expect(softwareEngineer.workStyle.remoteWork).toBeGreaterThan(0.8);

      // Doctor: low remote work
      expect(doctor.workStyle.remoteWork).toBeLessThan(0.2);

      // Doctor: high coaching dependency
      expect(doctor.indiaReality.coachingDependency).toBeGreaterThan(0.9);

      // Software engineer: low coaching dependency
      expect(softwareEngineer.indiaReality.coachingDependency).toBeLessThan(0.3);
    });
  });

  describe('Career Registry', () => {
    it('should retrieve career by slug', () => {
      const found = getCareerBySlug('software-engineer');
      expect(found).toBeDefined();
      expect(found?.name).toBe('Software Engineer');
    });

    it('should return undefined for unknown slug', () => {
      const found = getCareerBySlug('non-existent');
      expect(found).toBeUndefined();
    });

    it('should have all sample careers', () => {
      expect(sampleCareers.length).toBeGreaterThan(0);
      expect(sampleCareers.every(c => validateCareer(c))).toBe(true);
    });
  });

  describe('Salary Formatting', () => {
    it('should format salary in LPA', () => {
      expect(formatSalaryINR(800000)).toBe('₹8.0 LPA');
      expect(formatSalaryINR(1250000)).toBe('₹12.5 LPA');
      expect(formatSalaryINR(2500000)).toBe('₹25.0 LPA');
    });

    it('should format salary ranges', () => {
      const formatted = formatSalaryRange(400000, 2500000, 800000);
      expect(formatted).toContain('₹4.0 LPA');
      expect(formatted).toContain('₹25.0 LPA');
      expect(formatted).toContain('₹8.0 LPA');
    });
  });

  describe('Career Validation', () => {
    it('should reject career with invalid scores', () => {
      const invalidCareer = {
        id: 'invalid',
        name: 'Invalid',
        slug: 'invalid',
        category: CareerCategory.TECHNOLOGY,
        description: 'Test',
        psychologicalProfile: {
          analyticalThinking: 1.5, // Invalid: > 1.0
          creativity: 0.5,
          socialOrientation: 0.5,
          leadership: 0.5,
          detailOrientation: 0.5,
          curiosity: 0.5,
          competitiveness: 0.5,
          riskTolerance: 0.5,
        },
        // ... other required fields would make this valid
      };

      expect(validateCareer(invalidCareer)).toBe(false);
    });

    it('should reject career with missing required fields', () => {
      const incompleteCareer = {
        id: 'incomplete',
        name: 'Incomplete',
        // Missing slug, category, description, profiles, etc.
      };

      expect(validateCareer(incompleteCareer)).toBe(false);
    });
  });
});
