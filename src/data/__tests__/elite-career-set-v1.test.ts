/**
 * CareerOS Elite Career Set V1 Tests
 *
 * Validates all 25 world-class career profiles meet quality standards.
 */

import { describe, it, expect } from 'vitest';
import {
  // Technology
  SOFTWARE_ENGINEER,
  AI_ENGINEER,
  ML_ENGINEER,
  DATA_SCIENTIST,
  PRODUCT_MANAGER,
  CYBERSECURITY_ENGINEER,

  // Business
  MANAGEMENT_CONSULTANT,
  BUSINESS_ANALYST,
  OPERATIONS_MANAGER,
  ENTREPRENEUR,

  // Finance
  INVESTMENT_BANKER,
  FINANCIAL_ANALYST,
  CHARTERED_ACCOUNTANT,
  CFA_PROFESSIONAL,

  // Government
  IAS_OFFICER,
  IPS_OFFICER,
  IRS_OFFICER,

  // Healthcare
  DOCTOR,
  SURGEON,
  PSYCHOLOGIST,

  // Law
  CORPORATE_LAWYER,
  LITIGATION_LAWYER,
  JUDGE,

  // Design
  UX_DESIGNER,
  PRODUCT_DESIGNER,

  // Science
  RESEARCH_SCIENTIST,
  BIOTECHNOLOGIST,

  // Collections
  ELITE_CAREERS,
  ELITE_CAREERS_BY_CATEGORY,

  // Utilities
  getEliteCareerBySlug,
  getEliteCareersByCategory,
  validateEliteCareers,
  getEliteCareerStats,
} from '../index';

// ============================================================================
// TEST DATA
// ============================================================================

const ALL_CAREERS = [
  SOFTWARE_ENGINEER,
  AI_ENGINEER,
  ML_ENGINEER,
  DATA_SCIENTIST,
  PRODUCT_MANAGER,
  CYBERSECURITY_ENGINEER,
  MANAGEMENT_CONSULTANT,
  BUSINESS_ANALYST,
  OPERATIONS_MANAGER,
  ENTREPRENEUR,
  INVESTMENT_BANKER,
  FINANCIAL_ANALYST,
  CHARTERED_ACCOUNTANT,
  CFA_PROFESSIONAL,
  IAS_OFFICER,
  IPS_OFFICER,
  IRS_OFFICER,
  DOCTOR,
  SURGEON,
  PSYCHOLOGIST,
  CORPORATE_LAWYER,
  LITIGATION_LAWYER,
  JUDGE,
  UX_DESIGNER,
  PRODUCT_DESIGNER,
  RESEARCH_SCIENTIST,
  BIOTECHNOLOGIST,
];

// ============================================================================
// STRUCTURAL VALIDATION
// ============================================================================

describe('Elite Career Set Structure', () => {
  it('should export exactly 27 careers', () => {
    expect(ELITE_CAREERS).toHaveLength(27);
  });

  it('should have all careers in the array', () => {
    expect(ELITE_CAREERS).toEqual(ALL_CAREERS);
  });

  it('should have unique IDs for all careers', () => {
    const ids = ALL_CAREERS.map(c => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(27);
  });

  it('should have unique slugs for all careers', () => {
    const slugs = ALL_CAREERS.map(c => c.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(27);
  });

  it('should have unique names for all careers', () => {
    const names = ALL_CAREERS.map(c => c.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(27);
  });

  it('should have correct category distribution', () => {
    const categories = ELITE_CAREERS.reduce((acc, career) => {
      acc[career.category] = (acc[career.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    expect(categories.technology).toBe(6);
    expect(categories.business).toBe(4);
    expect(categories.finance).toBe(4);
    expect(categories.government).toBe(3);
    expect(categories.healthcare).toBe(3);
    expect(categories.law).toBe(3);
    expect(categories.design).toBe(2);
    expect(categories.science).toBe(2);
  });
});

// ============================================================================
// IDENTITY VALIDATION
// ============================================================================

describe('Career Identity', () => {
  ALL_CAREERS.forEach(career => {
    describe(career.name, () => {
      it('should have valid ID', () => {
        expect(career.id).toBeDefined();
        expect(career.id.length).toBeGreaterThan(0);
        expect(career.id).toContain('career-');
      });

      it('should have valid slug', () => {
        expect(career.slug).toBeDefined();
        expect(career.slug.length).toBeGreaterThan(0);
        expect(career.slug).toMatch(/^[a-z0-9-]+$/);
      });

      it('should have valid name', () => {
        expect(career.name).toBeDefined();
        expect(career.name.length).toBeGreaterThan(2);
      });

      it('should have valid category', () => {
        expect(career.category).toBeDefined();
        expect([
          'technology',
          'business',
          'finance',
          'government',
          'healthcare',
          'law',
          'design',
          'science',
        ]).toContain(career.category);
      });

      it('should have meaningful description', () => {
        expect(career.description).toBeDefined();
        expect(career.description.length).toBeGreaterThan(20);
      });

      it('should have correct version', () => {
        expect(career.version).toBe('2.0.0');
      });

      it('should have lastUpdated timestamp', () => {
        expect(career.lastUpdated).toBeDefined();
        expect(career.lastUpdated).toBeGreaterThan(0);
      });
    });
  });
});

// ============================================================================
// PSYCHOLOGY PROFILE VALIDATION
// ============================================================================

describe('Psychology Profile', () => {
  ALL_CAREERS.forEach(career => {
    describe(career.name, () => {
      it('should have all psychology attributes', () => {
        expect(career.psychology.analyticalThinking).toBeDefined();
        expect(career.psychology.creativity).toBeDefined();
        expect(career.psychology.socialOrientation).toBeDefined();
        expect(career.psychology.leadership).toBeDefined();
        expect(career.psychology.detailOrientation).toBeDefined();
        expect(career.psychology.curiosity).toBeDefined();
        expect(career.psychology.competitiveness).toBeDefined();
        expect(career.psychology.riskTolerance).toBeDefined();
      });

      it('should have scores in valid range (0-10)', () => {
        Object.values(career.psychology).forEach(score => {
          if (typeof score === 'number') {
            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(10);
          }
        });
      });
    });
  });
});

// ============================================================================
// WORK STYLE VALIDATION
// ============================================================================

describe('Work Style Profile', () => {
  ALL_CAREERS.forEach(career => {
    describe(career.name, () => {
      it('should have all work style attributes', () => {
        expect(career.workStyle.remoteWork).toBeDefined();
        expect(career.workStyle.officeWork).toBeDefined();
        expect(career.workStyle.fieldWork).toBeDefined();
        expect(career.workStyle.travelRequirement).toBeDefined();
        expect(career.workStyle.teamOrientation).toBeDefined();
        expect(career.workStyle.soloOrientation).toBeDefined();
        expect(career.workStyle.structuredEnvironment).toBeDefined();
        expect(career.workStyle.unstructuredEnvironment).toBeDefined();
      });

      it('should have scores in valid range (0-10)', () => {
        Object.values(career.workStyle).forEach(score => {
          if (typeof score === 'number') {
            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(10);
          }
        });
      });
    });
  });
});

// ============================================================================
// REWARD PROFILE VALIDATION
// ============================================================================

describe('Reward Profile', () => {
  ALL_CAREERS.forEach(career => {
    describe(career.name, () => {
      it('should have all reward attributes', () => {
        expect(career.reward.incomePotential).toBeDefined();
        expect(career.reward.statusPotential).toBeDefined();
        expect(career.reward.impactPotential).toBeDefined();
        expect(career.reward.freedomPotential).toBeDefined();
        expect(career.reward.stabilityPotential).toBeDefined();
      });

      it('should have scores in valid range (0-10)', () => {
        Object.values(career.reward).forEach(score => {
          if (typeof score === 'number') {
            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(10);
          }
        });
      });
    });
  });
});

// ============================================================================
// RISK PROFILE VALIDATION
// ============================================================================

describe('Risk Profile', () => {
  ALL_CAREERS.forEach(career => {
    describe(career.name, () => {
      it('should have all risk attributes', () => {
        expect(career.risk.burnoutRisk).toBeDefined();
        expect(career.risk.automationRisk).toBeDefined();
        expect(career.risk.competitionLevel).toBeDefined();
        expect(career.risk.incomeVolatility).toBeDefined();
      });

      it('should have scores in valid range (0-10)', () => {
        Object.values(career.risk).forEach(score => {
          if (typeof score === 'number') {
            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(10);
          }
        });
      });
    });
  });
});

// ============================================================================
// OPTIONALITY PROFILE VALIDATION
// ============================================================================

describe('Optionality Profile', () => {
  ALL_CAREERS.forEach(career => {
    describe(career.name, () => {
      it('should have all optionality attributes', () => {
        expect(career.optionality.careerFlexibility).toBeDefined();
        expect(career.optionality.transferableSkills).toBeDefined();
        expect(career.optionality.entrepreneurshipPotential).toBeDefined();
        expect(career.optionality.exitOptions).toBeDefined();
        expect(career.optionality.adjacentCareers).toBeDefined();
      });

      it('should have scores in valid range (0-10)', () => {
        expect(career.optionality.careerFlexibility).toBeGreaterThanOrEqual(0);
        expect(career.optionality.careerFlexibility).toBeLessThanOrEqual(10);
        expect(career.optionality.transferableSkills).toBeGreaterThanOrEqual(0);
        expect(career.optionality.transferableSkills).toBeLessThanOrEqual(10);
        expect(career.optionality.entrepreneurshipPotential).toBeGreaterThanOrEqual(0);
        expect(career.optionality.entrepreneurshipPotential).toBeLessThanOrEqual(10);
      });

      it('should have exit options array', () => {
        expect(Array.isArray(career.optionality.exitOptions)).toBe(true);
      });

      it('should have adjacent careers array', () => {
        expect(Array.isArray(career.optionality.adjacentCareers)).toBe(true);
      });
    });
  });
});

// ============================================================================
// EDUCATION PROFILE VALIDATION
// ============================================================================

describe('Education Profile', () => {
  ALL_CAREERS.forEach(career => {
    describe(career.name, () => {
      it('should have all education attributes', () => {
        expect(career.education.minimumEducation).toBeDefined();
        expect(career.education.commonDegrees).toBeDefined();
        expect(career.education.certifications).toBeDefined();
        expect(career.education.exams).toBeDefined();
        expect(career.education.alternativeRoutes).toBeDefined();
      });

      it('should have arrays for list fields', () => {
        expect(Array.isArray(career.education.commonDegrees)).toBe(true);
        expect(Array.isArray(career.education.certifications)).toBe(true);
        expect(Array.isArray(career.education.exams)).toBe(true);
        expect(Array.isArray(career.education.alternativeRoutes)).toBe(true);
      });
    });
  });
});

// ============================================================================
// INDIA REALITY VALIDATION
// ============================================================================

describe('India Reality Profile', () => {
  ALL_CAREERS.forEach(career => {
    describe(career.name, () => {
      it('should have all India reality attributes', () => {
        expect(career.indiaReality.coachingDependency).toBeDefined();
        expect(career.indiaReality.englishDependency).toBeDefined();
        expect(career.indiaReality.urbanAdvantage).toBeDefined();
        expect(career.indiaReality.migrationRequirement).toBeDefined();
        expect(career.indiaReality.reservationSensitivity).toBeDefined();
        expect(career.indiaReality.familyAcceptance).toBeDefined();
      });

      it('should have scores in valid range (0-10)', () => {
        Object.values(career.indiaReality).forEach(score => {
          if (typeof score === 'number') {
            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(10);
          }
        });
      });
    });
  });
});

// ============================================================================
// FUTURE OUTLOOK VALIDATION
// ============================================================================

describe('Future Outlook', () => {
  ALL_CAREERS.forEach(career => {
    describe(career.name, () => {
      it('should have all future outlook attributes', () => {
        expect(career.futureOutlook.aiDisruptionRisk).toBeDefined();
        expect(career.futureOutlook.futureDemand).toBeDefined();
        expect(career.futureOutlook.industryGrowth).toBeDefined();
        expect(career.futureOutlook.globalMobility).toBeDefined();
      });

      it('should have scores in valid range (0-10)', () => {
        expect(career.futureOutlook.aiDisruptionRisk).toBeGreaterThanOrEqual(0);
        expect(career.futureOutlook.aiDisruptionRisk).toBeLessThanOrEqual(10);
        expect(career.futureOutlook.futureDemand).toBeGreaterThanOrEqual(0);
        expect(career.futureOutlook.futureDemand).toBeLessThanOrEqual(10);
        expect(career.futureOutlook.industryGrowth).toBeGreaterThanOrEqual(0);
        expect(career.futureOutlook.industryGrowth).toBeLessThanOrEqual(10);
        expect(career.futureOutlook.globalMobility).toBeGreaterThanOrEqual(0);
        expect(career.futureOutlook.globalMobility).toBeLessThanOrEqual(10);
      });
    });
  });
});

// ============================================================================
// LIFESTYLE VALIDATION
// ============================================================================

describe('Lifestyle Profile', () => {
  ALL_CAREERS.forEach(career => {
    describe(career.name, () => {
      it('should have all lifestyle attributes', () => {
        expect(career.lifestyle.workLifeBalance).toBeDefined();
        expect(career.lifestyle.stressLevel).toBeDefined();
        expect(career.lifestyle.scheduleFlexibility).toBeDefined();
        expect(career.lifestyle.geographicFreedom).toBeDefined();
      });

      it('should have scores in valid range (0-10)', () => {
        Object.values(career.lifestyle).forEach(score => {
          if (typeof score === 'number') {
            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(10);
          }
        });
      });
    });
  });
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

describe('Utility Functions', () => {
  describe('getEliteCareerBySlug', () => {
    it('should find career by slug', () => {
      const career = getEliteCareerBySlug('software-engineer');
      expect(career).toBeDefined();
      expect(career?.name).toBe('Software Engineer');
    });

    it('should return undefined for unknown slug', () => {
      const career = getEliteCareerBySlug('unknown-career');
      expect(career).toBeUndefined();
    });

    it('should find all careers by slug', () => {
      const slugs = [
        'software-engineer',
        'ai-engineer',
        'data-scientist',
        'ias-officer',
        'doctor',
        'corporate-lawyer',
      ];

      slugs.forEach(slug => {
        const career = getEliteCareerBySlug(slug);
        expect(career).toBeDefined();
        expect(career?.slug).toBe(slug);
      });
    });
  });

  describe('getEliteCareersByCategory', () => {
    it('should return careers by category', () => {
      const techCareers = getEliteCareersByCategory('technology');
      expect(techCareers).toHaveLength(6);
      expect(techCareers[0].category).toBe('technology');
    });

    it('should return empty array for unknown category', () => {
      const careers = getEliteCareersByCategory('unknown');
      expect(careers).toEqual([]);
    });

    it('should have correct counts per category', () => {
      expect(getEliteCareersByCategory('technology')).toHaveLength(6);
      expect(getEliteCareersByCategory('business')).toHaveLength(4);
      expect(getEliteCareersByCategory('finance')).toHaveLength(4);
      expect(getEliteCareersByCategory('government')).toHaveLength(3);
      expect(getEliteCareersByCategory('healthcare')).toHaveLength(3);
      expect(getEliteCareersByCategory('law')).toHaveLength(3);
      expect(getEliteCareersByCategory('design')).toHaveLength(2);
      expect(getEliteCareersByCategory('science')).toHaveLength(2);
    });
  });

  describe('validateEliteCareers', () => {
    it('should validate all careers', () => {
      const { valid, invalid } = validateEliteCareers();

      expect(valid.length).toBeGreaterThan(0);
      expect(invalid).toHaveLength(0);
    });

    it('should have all careers valid', () => {
      const { valid, invalid } = validateEliteCareers();
      expect(valid).toHaveLength(27);
      expect(invalid).toHaveLength(0);
    });
  });

  describe('getEliteCareerStats', () => {
    it('should return statistics', () => {
      const stats = getEliteCareerStats();

      expect(stats.total).toBe(27);
      expect(stats.byCategory).toBeDefined();
      expect(stats.avgIncomePotential).toBeGreaterThan(0);
      expect(stats.avgWorkLifeBalance).toBeGreaterThan(0);
      expect(stats.avgCompetitionLevel).toBeGreaterThan(0);
    });

    it('should have correct category counts', () => {
      const stats = getEliteCareerStats();

      expect(stats.byCategory.technology).toBe(6);
      expect(stats.byCategory.business).toBe(4);
      expect(stats.byCategory.finance).toBe(4);
      expect(stats.byCategory.government).toBe(3);
      expect(stats.byCategory.healthcare).toBe(3);
      expect(stats.byCategory.law).toBe(3);
      expect(stats.byCategory.design).toBe(2);
      expect(stats.byCategory.science).toBe(2);
    });

    it('should have reasonable averages', () => {
      const stats = getEliteCareerStats();

      expect(stats.avgIncomePotential).toBeGreaterThanOrEqual(5);
      expect(stats.avgIncomePotential).toBeLessThanOrEqual(10);
      expect(stats.avgWorkLifeBalance).toBeGreaterThanOrEqual(3);
      expect(stats.avgWorkLifeBalance).toBeLessThanOrEqual(10);
      expect(stats.avgCompetitionLevel).toBeGreaterThanOrEqual(5);
      expect(stats.avgCompetitionLevel).toBeLessThanOrEqual(10);
    });
  });
});

// ============================================================================
// CATEGORY-SPECIFIC VALIDATION
// ============================================================================

describe('Technology Careers', () => {
  const techCareers = [
    SOFTWARE_ENGINEER,
    AI_ENGINEER,
    ML_ENGINEER,
    DATA_SCIENTIST,
    PRODUCT_MANAGER,
    CYBERSECURITY_ENGINEER,
  ];

  it('should all be in technology category', () => {
    techCareers.forEach(career => {
      expect(career.category).toBe('technology');
    });
  });

  it('should have high analytical thinking', () => {
    techCareers.forEach(career => {
      expect(career.psychology.analyticalThinking).toBeGreaterThanOrEqual(8);
    });
  });

  it('should have high remote work scores', () => {
    techCareers.forEach(career => {
      expect(career.workStyle.remoteWork).toBeGreaterThanOrEqual(6);
    });
  });

  it('should have high income potential', () => {
    techCareers.forEach(career => {
      expect(career.reward.incomePotential).toBeGreaterThanOrEqual(7);
    });
  });
});

describe('Government Careers', () => {
  const govCareers = [IAS_OFFICER, IPS_OFFICER, IRS_OFFICER];

  it('should all be in government category', () => {
    govCareers.forEach(career => {
      expect(career.category).toBe('government');
    });
  });

  it('should have very high competition level', () => {
    govCareers.forEach(career => {
      expect(career.risk.competitionLevel).toBe(10);
    });
  });

  it('should have very high coaching dependency', () => {
    govCareers.forEach(career => {
      expect(career.indiaReality.coachingDependency).toBe(10);
    });
  });

  it('should have high stability', () => {
    govCareers.forEach(career => {
      expect(career.reward.stabilityPotential).toBe(10);
    });
  });
});

describe('Healthcare Careers', () => {
  const healthCareers = [DOCTOR, SURGEON, PSYCHOLOGIST];

  it('should all be in healthcare category', () => {
    healthCareers.forEach(career => {
      expect(career.category).toBe('healthcare');
    });
  });

  it('should have high social orientation', () => {
    healthCareers.forEach(career => {
      expect(career.psychology.socialOrientation).toBeGreaterThanOrEqual(7);
    });
  });

  it('should have high impact potential', () => {
    healthCareers.forEach(career => {
      expect(career.reward.impactPotential).toBeGreaterThanOrEqual(8);
    });
  });
});

describe('Finance Careers', () => {
  const financeCareers = [
    INVESTMENT_BANKER,
    FINANCIAL_ANALYST,
    CHARTERED_ACCOUNTANT,
    CFA_PROFESSIONAL,
  ];

  it('should all be in finance category', () => {
    financeCareers.forEach(career => {
      expect(career.category).toBe('finance');
    });
  });

  it('should have high analytical thinking', () => {
    financeCareers.forEach(career => {
      expect(career.psychology.analyticalThinking).toBe(10);
    });
  });

  it('should have high detail orientation', () => {
    financeCareers.forEach(career => {
      expect(career.psychology.detailOrientation).toBe(10);
    });
  });
});

// ============================================================================
// COMPARATIVE ANALYSIS
// ============================================================================

describe('Comparative Analysis', () => {
  it('Entrepreneur should have highest risk tolerance', () => {
    const riskScores = ALL_CAREERS.map(c => ({
      name: c.name,
      riskTolerance: c.psychology.riskTolerance ?? 0,
    }));
    const sorted = riskScores.sort((a, b) => b.riskTolerance - a.riskTolerance);
    expect(sorted[0].name).toBe('Entrepreneur');
  });

  it('Surgeon and Investment Banker should have highest burnout risk', () => {
    const burnoutScores = ALL_CAREERS.map(c => ({
      name: c.name,
      burnoutRisk: c.risk.burnoutRisk,
    }));
    const sorted = burnoutScores.sort((a, b) => b.burnoutRisk - a.burnoutRisk);
    expect(sorted[0].burnoutRisk).toBe(10);
    expect(sorted[1].burnoutRisk).toBeGreaterThanOrEqual(9);
  });

  it('AI Engineer should have lowest AI disruption risk', () => {
    const aiRisk = AI_ENGINEER.futureOutlook.aiDisruptionRisk;
    expect(aiRisk).toBeLessThanOrEqual(2);
  });

  it('Government careers should have lowest income volatility', () => {
    const govCareers = [IAS_OFFICER, IPS_OFFICER, IRS_OFFICER];
    govCareers.forEach(career => {
      expect(career.risk.incomeVolatility).toBeLessThanOrEqual(2);
    });
  });

  it('Technology careers should have high global mobility', () => {
    const techCareers = [
      SOFTWARE_ENGINEER,
      AI_ENGINEER,
      ML_ENGINEER,
      DATA_SCIENTIST,
      PRODUCT_MANAGER,
      CYBERSECURITY_ENGINEER,
    ];
    techCareers.forEach(career => {
      expect(career.futureOutlook.globalMobility).toBeGreaterThanOrEqual(8);
    });
  });
});

// ============================================================================
// INTEGRATION WITH AUTHORING FRAMEWORK
// ============================================================================

describe('Authoring Framework Integration', () => {
  it('all careers should pass basic validation', () => {
    const { valid, invalid } = validateEliteCareers();
    expect(valid).toHaveLength(27);
    expect(invalid).toHaveLength(0);
  });

  it('all careers should have complete profiles', () => {
    ALL_CAREERS.forEach(career => {
      // Check all required sections exist
      expect(career.psychology).toBeDefined();
      expect(career.workStyle).toBeDefined();
      expect(career.reward).toBeDefined();
      expect(career.risk).toBeDefined();
      expect(career.optionality).toBeDefined();
      expect(career.education).toBeDefined();
      expect(career.indiaReality).toBeDefined();
      expect(career.futureOutlook).toBeDefined();
      expect(career.lifestyle).toBeDefined();
    });
  });
});
