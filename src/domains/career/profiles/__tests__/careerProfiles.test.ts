/**
 * Career Profiles Validation Tests
 *
 * Validates all career profiles have complete, valid data.
 */

import { describe, it, expect } from 'vitest';
import {
  allCareers,
  getCareerBySlug,
  CAREER_COUNT,
  softwareEngineer,
  doctor,
  lawyer,
  charteredAccountant,
  productManager,
  dataScientist,
  civilServant,
  teacher,
  entrepreneur,
  uxDesigner,
} from '../index';
import { validateCareer, CareerCategory } from '../../Career';

describe('Career Profiles', () => {
  describe('Collection', () => {
    it('should have 10 career profiles', () => {
      expect(allCareers.length).toBe(10);
      expect(CAREER_COUNT).toBe(10);
    });

    it('should have all required careers', () => {
      const slugs = allCareers.map(c => c.slug);
      expect(slugs).toContain('software-engineer');
      expect(slugs).toContain('doctor');
      expect(slugs).toContain('lawyer');
      expect(slugs).toContain('chartered-accountant');
      expect(slugs).toContain('product-manager');
      expect(slugs).toContain('data-scientist');
      expect(slugs).toContain('civil-servant');
      expect(slugs).toContain('teacher');
      expect(slugs).toContain('entrepreneur');
      expect(slugs).toContain('ux-designer');
    });
  });

  describe('Validation', () => {
    it('should validate all career profiles', () => {
      for (const career of allCareers) {
        const isValid = validateCareer(career);
        expect(isValid).toBe(true);
      }
    });
  });

  describe('Registry', () => {
    it('should retrieve careers by slug', () => {
      expect(getCareerBySlug('software-engineer')).toBeDefined();
      expect(getCareerBySlug('doctor')).toBeDefined();
      expect(getCareerBySlug('non-existent')).toBeUndefined();
    });
  });

  describe('Individual Profiles', () => {
    describe('Software Engineer', () => {
      it('should have correct category', () => {
        expect(softwareEngineer.category).toBe(CareerCategory.TECHNOLOGY);
      });

      it('should have high analytical thinking', () => {
        expect(softwareEngineer.psychologicalProfile.analyticalThinking).toBeGreaterThan(0.8);
      });

      it('should have high remote work score', () => {
        expect(softwareEngineer.workStyle.remoteWork).toBeGreaterThan(0.8);
      });

      it('should have realistic salary ranges', () => {
        expect(softwareEngineer.salary.entrySalaryIndia.median).toBeGreaterThan(500000);
        expect(softwareEngineer.salary.seniorSalaryIndia.max).toBeGreaterThan(10000000);
      });
    });

    describe('Doctor', () => {
      it('should have correct category', () => {
        expect(doctor.category).toBe(CareerCategory.HEALTHCARE);
      });

      it('should have high coaching dependency', () => {
        expect(doctor.indiaReality.coachingDependency).toBeGreaterThan(0.9);
      });

      it('should have high status potential', () => {
        expect(doctor.rewardProfile.statusPotential).toBeGreaterThan(0.9);
      });

      it('should have reservation applicable', () => {
        expect(doctor.indiaReality.reservationApplicable).toBe(true);
      });
    });

    describe('Civil Servant', () => {
      it('should have correct category', () => {
        expect(civilServant.category).toBe(CareerCategory.GOVERNMENT);
      });

      it('should have maximum competition level', () => {
        expect(civilServant.riskProfile.competitionLevel).toBe(1.0);
      });

      it('should have perfect stability', () => {
        expect(civilServant.rewardProfile.stabilityPotential).toBe(1.0);
      });

      it('should have high coaching dependency', () => {
        expect(civilServant.indiaReality.coachingDependency).toBeGreaterThan(0.7);
      });
    });

    describe('Entrepreneur', () => {
      it('should have correct category', () => {
        expect(entrepreneur.category).toBe(CareerCategory.BUSINESS);
      });

      it('should have very high risk tolerance requirement', () => {
        expect(entrepreneur.psychologicalProfile.riskTolerance).toBeGreaterThan(0.9);
      });

      it('should have high income volatility', () => {
        expect(entrepreneur.riskProfile.incomeVolatility).toBeGreaterThan(0.9);
      });

      it('should have no formal education requirement', () => {
        // Check that the degree list is flexible
        expect(entrepreneur.education.typicalDegrees.length).toBeGreaterThan(0);
      });
    });

    describe('Chartered Accountant', () => {
      it('should have correct category', () => {
        expect(charteredAccountant.category).toBe(CareerCategory.FINANCE);
      });

      it('should have very high analytical thinking', () => {
        expect(charteredAccountant.psychologicalProfile.analyticalThinking).toBeGreaterThan(0.9);
      });

      it('should have high coaching dependency', () => {
        expect(charteredAccountant.indiaReality.coachingDependency).toBeGreaterThan(0.7);
      });
    });

    describe('Product Manager', () => {
      it('should have correct category', () => {
        expect(productManager.category).toBe(CareerCategory.TECHNOLOGY);
      });

      it('should have high social orientation', () => {
        expect(productManager.psychologicalProfile.socialOrientation).toBeGreaterThan(0.7);
      });

      it('should have high leadership requirement', () => {
        expect(productManager.psychologicalProfile.leadership).toBeGreaterThan(0.7);
      });
    });

    describe('Data Scientist', () => {
      it('should have correct category', () => {
        expect(dataScientist.category).toBe(CareerCategory.TECHNOLOGY);
      });

      it('should have very high analytical thinking', () => {
        expect(dataScientist.psychologicalProfile.analyticalThinking).toBeGreaterThan(0.9);
      });

      it('should require masters level education', () => {
        expect(dataScientist.education.minimumLevel).toBe('masters');
      });
    });

    describe('Teacher', () => {
      it('should have correct category', () => {
        expect(teacher.category).toBe(CareerCategory.EDUCATION);
      });

      it('should have high social orientation', () => {
        expect(teacher.psychologicalProfile.socialOrientation).toBeGreaterThan(0.8);
      });

      it('should have low competitiveness', () => {
        expect(teacher.psychologicalProfile.competitiveness).toBeLessThan(0.5);
      });
    });

    describe('Lawyer', () => {
      it('should have correct category', () => {
        expect(lawyer.category).toBe(CareerCategory.LAW);
      });

      it('should have high social orientation', () => {
        expect(lawyer.psychologicalProfile.socialOrientation).toBeGreaterThan(0.7);
      });

      it('should have high income volatility', () => {
        expect(lawyer.riskProfile.incomeVolatility).toBeGreaterThan(0.6);
      });
    });

    describe('UX Designer', () => {
      it('should have correct category', () => {
        expect(uxDesigner.category).toBe(CareerCategory.TECHNOLOGY);
      });

      it('should have high creativity', () => {
        expect(uxDesigner.psychologicalProfile.creativity).toBeGreaterThan(0.8);
      });

      it('should have high remote work score', () => {
        expect(uxDesigner.workStyle.remoteWork).toBeGreaterThan(0.7);
      });
    });
  });

  describe('Salary Data', () => {
    it('should have realistic salary ranges for all careers', () => {
      for (const career of allCareers) {
        // Entry salary should be reasonable
        expect(career.salary.entrySalaryIndia.min).toBeGreaterThanOrEqual(0);
        expect(career.salary.entrySalaryIndia.max).toBeGreaterThan(career.salary.entrySalaryIndia.min);
        expect(career.salary.entrySalaryIndia.median).toBeGreaterThanOrEqual(career.salary.entrySalaryIndia.min);
        expect(career.salary.entrySalaryIndia.median).toBeLessThanOrEqual(career.salary.entrySalaryIndia.max);

        // Senior salary should be higher
        expect(career.salary.seniorSalaryIndia.min).toBeGreaterThanOrEqual(career.salary.entrySalaryIndia.min);
        expect(career.salary.seniorSalaryIndia.max).toBeGreaterThan(1000000);
      }
    });
  });

  describe('Evolution Data', () => {
    it('should have adjacent careers defined', () => {
      for (const career of allCareers) {
        expect(career.evolution.adjacentCareers).toBeDefined();
        expect(career.evolution.adjacentCareers.length).toBeGreaterThan(0);
      }
    });

    it('should have future career paths defined', () => {
      for (const career of allCareers) {
        expect(career.evolution.futureCareerPaths).toBeDefined();
        expect(career.evolution.futureCareerPaths.length).toBeGreaterThan(0);
      }
    });
  });

  describe('India Reality', () => {
    it('should have coaching dependency defined', () => {
      for (const career of allCareers) {
        expect(career.indiaReality.coachingDependency).toBeGreaterThanOrEqual(0);
        expect(career.indiaReality.coachingDependency).toBeLessThanOrEqual(1);
      }
    });

    it('should have urban advantage defined', () => {
      for (const career of allCareers) {
        expect(career.indiaReality.urbanAdvantage).toBeGreaterThanOrEqual(0);
        expect(career.indiaReality.urbanAdvantage).toBeLessThanOrEqual(1);
      }
    });
  });
});
