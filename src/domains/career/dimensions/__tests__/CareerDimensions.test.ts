/**
 * Career Dimensions System Tests
 *
 * Validates the dimensional framework for career evaluation.
 */

import { describe, it, expect } from 'vitest';
import {
  // Enums
  CareerDimension,
  DimensionCategory,
  IndiaCareerDimension,
  ALL_CAREER_DIMENSIONS,
  TOTAL_DIMENSION_COUNT,
  DIMENSION_SCORE_MIN,
  DIMENSION_SCORE_MAX,

  // Metadata
  DimensionRegistry,
  IndiaDimensionRegistry,
  DimensionCategoryLabels,
  DimensionCategoryDescriptions,

  // Utilities
  getDimensionMetadata,
  getDimensionsByCategory,
  toDimensionScore,
  toCareerScore,
  isValidDimensionScore,
  getCareerDimensionValue,
  getAllCareerDimensionValues,
  getDimensionScoreLabel,
  compareCareersOnDimension,
  findCareerDimensionDifferences,
  calculateDimensionMatchScore,
  createNeutralDimensionProfile,
} from '../CareerDimensions';

import { softwareEngineer, doctor } from '../../examples';

describe('Career Dimensions System', () => {
  describe('Core Constants', () => {
    it('should have correct dimension count', () => {
      expect(TOTAL_DIMENSION_COUNT).toBe(28);
      expect(ALL_CAREER_DIMENSIONS.length).toBe(28);
    });

    it('should have valid score ranges', () => {
      expect(DIMENSION_SCORE_MIN).toBe(0);
      expect(DIMENSION_SCORE_MAX).toBe(10);
    });
  });

  describe('CareerDimension Enum', () => {
    it('should have all psychology dimensions', () => {
      expect(Object.values(CareerDimension)).toContain('analyticalThinking');
      expect(Object.values(CareerDimension)).toContain('creativity');
      expect(Object.values(CareerDimension)).toContain('socialOrientation');
      expect(Object.values(CareerDimension)).toContain('leadership');
      expect(Object.values(CareerDimension)).toContain('detailOrientation');
      expect(Object.values(CareerDimension)).toContain('curiosity');
      expect(Object.values(CareerDimension)).toContain('competitiveness');
      expect(Object.values(CareerDimension)).toContain('riskTolerance');
    });

    it('should have all work style dimensions', () => {
      expect(Object.values(CareerDimension)).toContain('remoteWork');
      expect(Object.values(CareerDimension)).toContain('officeWork');
      expect(Object.values(CareerDimension)).toContain('fieldWork');
      expect(Object.values(CareerDimension)).toContain('travelRequirement');
      expect(Object.values(CareerDimension)).toContain('teamOrientation');
      expect(Object.values(CareerDimension)).toContain('soloOrientation');
      expect(Object.values(CareerDimension)).toContain('structuredEnvironment');
      expect(Object.values(CareerDimension)).toContain('unstructuredEnvironment');
    });

    it('should have all reward dimensions', () => {
      expect(Object.values(CareerDimension)).toContain('incomePotential');
      expect(Object.values(CareerDimension)).toContain('statusPotential');
      expect(Object.values(CareerDimension)).toContain('impactPotential');
      expect(Object.values(CareerDimension)).toContain('freedomPotential');
      expect(Object.values(CareerDimension)).toContain('stabilityPotential');
    });

    it('should have all risk dimensions', () => {
      expect(Object.values(CareerDimension)).toContain('burnoutRisk');
      expect(Object.values(CareerDimension)).toContain('automationRisk');
      expect(Object.values(CareerDimension)).toContain('competitionLevel');
      expect(Object.values(CareerDimension)).toContain('incomeVolatility');
    });

    it('should have all optionality dimensions', () => {
      expect(Object.values(CareerDimension)).toContain('careerFlexibility');
      expect(Object.values(CareerDimension)).toContain('transferableSkills');
      expect(Object.values(CareerDimension)).toContain('entrepreneurshipPotential');
    });
  });

  describe('Dimension Categories', () => {
    it('should have valid category labels', () => {
      expect(DimensionCategoryLabels[DimensionCategory.PSYCHOLOGY]).toBe('Psychological Traits');
      expect(DimensionCategoryLabels[DimensionCategory.WORK_STYLE]).toBe('Work Style');
      expect(DimensionCategoryLabels[DimensionCategory.REWARDS]).toBe('Rewards & Satisfaction');
      expect(DimensionCategoryLabels[DimensionCategory.RISKS]).toBe('Risks & Challenges');
      expect(DimensionCategoryLabels[DimensionCategory.OPTIONALITY]).toBe('Future Flexibility');
    });

    it('should have category descriptions', () => {
      expect(DimensionCategoryDescriptions[DimensionCategory.PSYCHOLOGY]).toContain('Psychological traits');
      expect(DimensionCategoryDescriptions[DimensionCategory.WORK_STYLE]).toContain('work environment');
    });
  });

  describe('Dimension Registry', () => {
    it('should have metadata for all dimensions', () => {
      for (const dimension of ALL_CAREER_DIMENSIONS) {
        const metadata = DimensionRegistry[dimension];
        expect(metadata).toBeDefined();
        expect(metadata.dimension).toBe(dimension);
        expect(metadata.label).toBeDefined();
        expect(metadata.description).toBeDefined();
        expect(metadata.category).toBeDefined();
        expect(metadata.lowScoreDescription).toBeDefined();
        expect(metadata.mediumScoreDescription).toBeDefined();
        expect(metadata.highScoreDescription).toBeDefined();
        expect(metadata.defaultWeight).toBeGreaterThan(0);
        expect(metadata.defaultWeight).toBeLessThanOrEqual(1);
      }
    });

    it('should correctly categorize dimensions', () => {
      expect(DimensionRegistry[CareerDimension.ANALYTICAL_THINKING].category).toBe(DimensionCategory.PSYCHOLOGY);
      expect(DimensionRegistry[CareerDimension.REMOTE_WORK].category).toBe(DimensionCategory.WORK_STYLE);
      expect(DimensionRegistry[CareerDimension.INCOME_POTENTIAL].category).toBe(DimensionCategory.REWARDS);
      expect(DimensionRegistry[CareerDimension.BURNOUT_RISK].category).toBe(DimensionCategory.RISKS);
      expect(DimensionRegistry[CareerDimension.CAREER_FLEXIBILITY].category).toBe(DimensionCategory.OPTIONALITY);
    });

    it('should identify risk factors correctly', () => {
      expect(DimensionRegistry[CareerDimension.BURNOUT_RISK].isRiskFactor).toBe(true);
      expect(DimensionRegistry[CareerDimension.AUTOMATION_RISK].isRiskFactor).toBe(true);
      expect(DimensionRegistry[CareerDimension.INCOME_POTENTIAL].isRiskFactor).toBe(false);
      expect(DimensionRegistry[CareerDimension.CREATIVITY].isRiskFactor).toBe(false);
    });
  });

  describe('Dimension Metadata Access', () => {
    it('should get metadata by dimension', () => {
      const metadata = getDimensionMetadata(CareerDimension.ANALYTICAL_THINKING);
      expect(metadata.label).toBe('Analytical Thinking');
      expect(metadata.category).toBe(DimensionCategory.PSYCHOLOGY);
    });

    it('should get dimensions by category', () => {
      const psychologyDimensions = getDimensionsByCategory(DimensionCategory.PSYCHOLOGY);
      expect(psychologyDimensions.length).toBe(8);
      expect(psychologyDimensions).toContain(CareerDimension.ANALYTICAL_THINKING);
      expect(psychologyDimensions).toContain(CareerDimension.CREATIVITY);

      const workStyleDimensions = getDimensionsByCategory(DimensionCategory.WORK_STYLE);
      expect(workStyleDimensions.length).toBe(8);

      const rewardDimensions = getDimensionsByCategory(DimensionCategory.REWARDS);
      expect(rewardDimensions.length).toBe(5);

      const riskDimensions = getDimensionsByCategory(DimensionCategory.RISKS);
      expect(riskDimensions.length).toBe(4);

      const optionalityDimensions = getDimensionsByCategory(DimensionCategory.OPTIONALITY);
      expect(optionalityDimensions.length).toBe(3);
    });
  });

  describe('Score Conversion', () => {
    it('should convert CareerScore to DimensionScore', () => {
      expect(toDimensionScore(0)).toBe(0);
      expect(toDimensionScore(0.5)).toBe(5);
      expect(toDimensionScore(1)).toBe(10);
      expect(toDimensionScore(0.85)).toBe(9);
    });

    it('should convert DimensionScore to CareerScore', () => {
      expect(toCareerScore(0)).toBe(0);
      expect(toCareerScore(5)).toBe(0.5);
      expect(toCareerScore(10)).toBe(1);
      expect(toCareerScore(7)).toBe(0.7);
    });

    it('should validate dimension scores', () => {
      expect(isValidDimensionScore(0)).toBe(true);
      expect(isValidDimensionScore(5)).toBe(true);
      expect(isValidDimensionScore(10)).toBe(true);
      expect(isValidDimensionScore(-1)).toBe(false);
      expect(isValidDimensionScore(11)).toBe(false);
      expect(isValidDimensionScore('5' as unknown as number)).toBe(false);
    });
  });

  describe('Career Dimension Extraction', () => {
    it('should extract psychology dimensions from career', () => {
      const analyticalThinking = getCareerDimensionValue(softwareEngineer, CareerDimension.ANALYTICAL_THINKING);
      expect(analyticalThinking).toBe(0.9);

      const creativity = getCareerDimensionValue(softwareEngineer, CareerDimension.CREATIVITY);
      expect(creativity).toBe(0.6);
    });

    it('should extract work style dimensions from career', () => {
      const remoteWork = getCareerDimensionValue(softwareEngineer, CareerDimension.REMOTE_WORK);
      expect(remoteWork).toBe(0.85);

      const officeWork = getCareerDimensionValue(doctor, CareerDimension.OFFICE_WORK);
      expect(officeWork).toBe(0.3);
    });

    it('should extract all dimensions from career', () => {
      const dimensions = getAllCareerDimensionValues(softwareEngineer);
      expect(Object.keys(dimensions).length).toBe(28);
      expect(dimensions[CareerDimension.ANALYTICAL_THINKING]).toBe(0.9);
      expect(dimensions[CareerDimension.INCOME_POTENTIAL]).toBe(0.9);
    });
  });

  describe('Dimension Score Labels', () => {
    it('should provide labels for low scores', () => {
      const label = getDimensionScoreLabel(CareerDimension.ANALYTICAL_THINKING, 1);
      expect(label).toContain('Intuitive');
    });

    it('should provide labels for medium scores', () => {
      const label = getDimensionScoreLabel(CareerDimension.ANALYTICAL_THINKING, 5);
      expect(label).toContain('Balanced');
    });

    it('should provide labels for high scores', () => {
      const label = getDimensionScoreLabel(CareerDimension.ANALYTICAL_THINKING, 9);
      expect(label).toContain('Heavy reliance');
    });
  });

  describe('Career Comparison', () => {
    it('should compare careers on a dimension', () => {
      const comparison = compareCareersOnDimension(
        softwareEngineer,
        doctor,
        CareerDimension.REMOTE_WORK
      );
      // Software engineer: 0.85, Doctor: 0.1
      expect(comparison).toBeGreaterThan(0);
    });

    it('should find dimension differences between careers', () => {
      const differences = findCareerDimensionDifferences(softwareEngineer, doctor, 0.3);

      // Should find significant differences
      expect(differences.length).toBeGreaterThan(0);

      // Remote work should be a big difference (0.85 vs 0.1)
      const remoteDiff = differences.find(d => d.dimension === CareerDimension.REMOTE_WORK);
      expect(remoteDiff).toBeDefined();
      expect(remoteDiff!.difference).toBeGreaterThan(0.7);
    });
  });

  describe('Dimension Matching', () => {
    it('should calculate match score for perfect match', () => {
      const preferences = {
        [CareerDimension.ANALYTICAL_THINKING]: 9, // 0.9
        [CareerDimension.CREATIVITY]: 6, // 0.6
      };

      const score = calculateDimensionMatchScore(softwareEngineer, preferences);
      expect(score).toBeGreaterThan(0.9); // Very close match
    });

    it('should calculate match score for partial match', () => {
      const preferences = {
        [CareerDimension.ANALYTICAL_THINKING]: 5, // Different from 0.9
        [CareerDimension.CREATIVITY]: 5, // Different from 0.6
      };

      const score = calculateDimensionMatchScore(softwareEngineer, preferences);
      expect(score).toBeLessThan(0.9); // Not a perfect match
      expect(score).toBeGreaterThan(0); // Some match
    });

    it('should handle empty preferences', () => {
      const score = calculateDimensionMatchScore(softwareEngineer, {});
      expect(score).toBe(0);
    });

    it('should respect dimension weights', () => {
      const preferences = {
        [CareerDimension.ANALYTICAL_THINKING]: 5,
      };

      // With high weight on mismatch
      const scoreWithWeight = calculateDimensionMatchScore(
        softwareEngineer,
        preferences,
        { [CareerDimension.ANALYTICAL_THINKING]: 2.0 }
      );

      // With default weight
      const scoreDefault = calculateDimensionMatchScore(
        softwareEngineer,
        preferences
      );

      // Weighted score should be lower (more penalty for mismatch)
      expect(scoreWithWeight).toBeLessThanOrEqual(scoreDefault);
    });
  });

  describe('Profile Creation', () => {
    it('should create neutral dimension profile', () => {
      const profile = createNeutralDimensionProfile();

      expect(profile[CareerDimension.ANALYTICAL_THINKING]).toBe(5);
      expect(profile[CareerDimension.REMOTE_WORK]).toBe(5);
      expect(profile[CareerDimension.INCOME_POTENTIAL]).toBe(5);
      expect(profile[CareerDimension.BURNOUT_RISK]).toBe(5);
      expect(profile[CareerDimension.CAREER_FLEXIBILITY]).toBe(5);
    });
  });

  describe('India-Specific Dimensions', () => {
    it('should have India-specific dimension enum', () => {
      expect(Object.values(IndiaCareerDimension)).toContain('coachingDependency');
      expect(Object.values(IndiaCareerDimension)).toContain('urbanAdvantage');
      expect(Object.values(IndiaCareerDimension)).toContain('englishDependency');
      expect(Object.values(IndiaCareerDimension)).toContain('migrationRequirement');
    });

    it('should have metadata for India dimensions', () => {
      const coachingMeta = IndiaDimensionRegistry[IndiaCareerDimension.COACHING_DEPENDENCY];
      expect(coachingMeta.label).toBe('Coaching Dependency');
      expect(coachingMeta.isRiskFactor).toBe(true);
      expect(coachingMeta.description).toContain('FIITJEE');
    });
  });

  describe('Dimension Relationships', () => {
    it('should identify related dimensions', () => {
      const analyticalMeta = DimensionRegistry[CareerDimension.ANALYTICAL_THINKING];
      expect(analyticalMeta.relatedDimensions).toContain(CareerDimension.DETAIL_ORIENTATION);

      const creativityMeta = DimensionRegistry[CareerDimension.CREATIVITY];
      expect(creativityMeta.relatedDimensions).toContain(CareerDimension.CURIOSITY);
    });

    it('should link dimensions to student traits', () => {
      const analyticalMeta = DimensionRegistry[CareerDimension.ANALYTICAL_THINKING];
      expect(analyticalMeta.relatedStudentTrait).toBe('analyticalThinking');

      const creativityMeta = DimensionRegistry[CareerDimension.CREATIVITY];
      expect(creativityMeta.relatedStudentTrait).toBe('creativity');
    });
  });

  describe('Dimension Weights', () => {
    it('should have meaningful default weights', () => {
      // Critical dimensions should have high weights
      expect(DimensionRegistry[CareerDimension.INCOME_POTENTIAL].defaultWeight).toBe(1.0);
      expect(DimensionRegistry[CareerDimension.BURNOUT_RISK].defaultWeight).toBe(1.0);
      expect(DimensionRegistry[CareerDimension.AUTOMATION_RISK].defaultWeight).toBe(0.95);

      // Less critical dimensions should have lower weights
      expect(DimensionRegistry[CareerDimension.COMPETITIVENESS].defaultWeight).toBeLessThan(1.0);
    });
  });
});
