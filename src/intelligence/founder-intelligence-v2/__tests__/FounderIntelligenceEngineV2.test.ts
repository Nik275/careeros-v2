/**
 * Founder Intelligence V2 - Test Suite
 *
 * Comprehensive tests for the founder potential assessment engine.
 */

import {
  createFounderIntelligenceEngineV2,
  FounderDimensionV2,
  FounderTypeV2,
  FounderReadinessV2,
  NonFounderProfileV2,
  FounderAnalysisInputV2,
} from '../index';

// Test fixtures
const createMockProfile = (overrides: Partial<FounderAnalysisInputV2['profile']> = {}) => ({
  id: 'test-student-123',
  psychology: {
    openness: 0.7,
    conscientiousness: 0.6,
    extraversion: 0.5,
    neuroticism: 0.4,
    assertiveness: 0.6,
  },
  ...overrides,
});

const createMockInput = (overrides: Partial<FounderAnalysisInputV2> = {}): FounderAnalysisInputV2 => ({
  profile: createMockProfile(),
  timestamp: Date.now(),
  ...overrides,
});

describe('FounderIntelligenceEngineV2', () => {
  let engine: ReturnType<typeof createFounderIntelligenceEngineV2>;

  beforeEach(() => {
    engine = createFounderIntelligenceEngineV2();
  });

  describe('Core Analysis', () => {
    it('should analyze basic input and return valid structure', () => {
      const input = createMockInput({
        userInput: 'I want to start a company that solves real problems. I built a product with 100 users.',
      });

      const analysis = engine.analyze(input);

      expect(analysis).toBeDefined();
      expect(analysis.id).toBeDefined();
      expect(analysis.timestamp).toBeGreaterThan(0);
      expect(analysis.studentId).toBe('test-student-123');
      expect(analysis.engineVersion).toBe('2.0.0');
      expect(analysis.overallPotential).toBeGreaterThanOrEqual(0);
      expect(analysis.overallPotential).toBeLessThanOrEqual(1);
      expect(analysis.confidence).toBeGreaterThanOrEqual(0);
      expect(analysis.confidence).toBeLessThanOrEqual(1);
    });

    it('should score all 8 dimensions', () => {
      const input = createMockInput({
        userInput: 'I am passionate about building products and have started several projects.',
      });

      const analysis = engine.analyze(input);

      expect(analysis.dimensions).toHaveLength(8);
      expect(analysis.dimensions.map(d => d.dimension)).toEqual(
        expect.arrayContaining(Object.values(FounderDimensionV2))
      );

      for (const dim of analysis.dimensions) {
        expect(dim.score).toBeGreaterThanOrEqual(0);
        expect(dim.score).toBeLessThanOrEqual(1);
        expect(dim.confidence).toBeGreaterThanOrEqual(0);
        expect(dim.confidence).toBeLessThanOrEqual(1);
      }
    });

    it('should create dimension map for easy access', () => {
      const input = createMockInput();
      const analysis = engine.analyze(input);

      expect(analysis.dimensionMap).toBeInstanceOf(Map);
      expect(analysis.dimensionMap.size).toBe(8);
      expect(analysis.dimensionMap.has(FounderDimensionV2.OWNERSHIP_ORIENTATION)).toBe(true);
    });
  });

  describe('Dimension Scoring', () => {
    it('should detect ownership orientation from explicit statements', () => {
      const input = createMockInput({
        explicitStatements: [
          'I want to start my own company and build something meaningful.',
          'I took responsibility for the entire project outcome.',
        ],
      });

      const analysis = engine.analyze(input);
      const ownershipScore = analysis.dimensionMap.get(FounderDimensionV2.OWNERSHIP_ORIENTATION);

      expect(ownershipScore).toBeDefined();
      expect(ownershipScore!.score).toBeGreaterThan(0.5);
    });

    it('should detect resilience from failure recovery language', () => {
      const input = createMockInput({
        experienceDescriptions: [
          'My first startup failed but I learned valuable lessons and started again.',
          'I faced rejection multiple times but kept improving and eventually succeeded.',
        ],
      });

      const analysis = engine.analyze(input);
      const resilienceScore = analysis.dimensionMap.get(FounderDimensionV2.RESILIENCE);

      expect(resilienceScore).toBeDefined();
      expect(resilienceScore!.score).toBeGreaterThan(0.5);
    });

    it('should detect resourcefulness from constraint navigation', () => {
      const input = createMockInput({
        userInput: 'I had no budget so I taught myself to code and built the MVP myself using free resources.',
      });

      const analysis = engine.analyze(input);
      const resourcefulnessScore = analysis.dimensionMap.get(FounderDimensionV2.RESOURCEFULNESS);

      expect(resourcefulnessScore).toBeDefined();
      expect(resourcefulnessScore!.score).toBeGreaterThan(0.4);
    });

    it('should detect sales capability from revenue generation', () => {
      const input = createMockInput({
        projectPortfolio: [
          {
            name: 'SaaS Tool',
            description: 'B2B productivity tool',
            isProduct: true,
            hadUsers: true,
            hadRevenue: true,
            revenueAmount: 5000,
            teamSize: 1,
            durationMonths: 6,
            outcome: 'ongoing',
            demonstratedSkills: ['development', 'sales'],
          },
        ],
      });

      const analysis = engine.analyze(input);
      const salesScore = analysis.dimensionMap.get(FounderDimensionV2.SALES_CAPABILITY);

      expect(salesScore).toBeDefined();
      expect(salesScore!.score).toBeGreaterThan(0.5);
    });
  });

  describe('False Positive Protection', () => {
    it('should detect freelancer patterns', () => {
      const input = createMockInput({
        userInput: 'I work as a freelance designer and take on client projects for hourly rates.',
        explicitStatements: ['I love the flexibility of freelance work'],
      });

      const analysis = engine.analyze(input);

      expect(analysis.nonFounderProfiles.length).toBeGreaterThan(0);
      const freelancerDetection = analysis.nonFounderProfiles.find(
        d => d.profile === NonFounderProfileV2.FREELANCER
      );
      expect(freelancerDetection).toBeDefined();
    });

    it('should detect wantrepreneur patterns', () => {
      const input = createMockInput({
        userInput: 'I have a great idea for a startup someday. I am planning to start once I have more savings.',
        explicitStatements: ['I want to start a company one day'],
      });

      const analysis = engine.analyze(input);

      const wantrepreneurDetection = analysis.nonFounderProfiles.find(
        d => d.profile === NonFounderProfileV2.WANTREPRENEUR
      );
      expect(wantrepreneurDetection).toBeDefined();
    });

    it('should override non-founder patterns with differential indicators', () => {
      const input = createMockInput({
        userInput: 'I do freelance work but I also built a product with paying customers and co-founded a startup.',
        projectPortfolio: [
          {
            name: 'Startup Project',
            description: 'My actual startup',
            isProduct: true,
            hadUsers: true,
            hadRevenue: true,
            teamSize: 2,
            durationMonths: 12,
            outcome: 'ongoing',
            demonstratedSkills: ['founding', 'product'],
            role: 'CO_FOUNDER',
          },
        ],
      });

      const analysis = engine.analyze(input);

      // Should have reduced confidence in freelancer pattern due to differential indicators
      const freelancerDetection = analysis.nonFounderProfiles.find(
        d => d.profile === NonFounderProfileV2.FREELANCER
      );

      if (freelancerDetection) {
        expect(freelancerDetection.confidence).toBeLessThan(0.8);
      }
    });

    it('should identify false positive risk appropriately', () => {
      const input = createMockInput({
        userInput: 'I am a consultant who advises companies on strategy. I help them identify problems.',
      });

      const analysis = engine.analyze(input);

      expect(analysis.isFalsePositiveRisk).toBe(true);
      expect(analysis.falsePositiveRiskScore).toBeGreaterThan(0);
    });
  });

  describe('Founder Type Classification', () => {
    it('should classify technical founders', () => {
      const input = createMockInput({
        userInput: 'I am an engineer who loves building technical products. I write code and architect systems.',
        explicitStatements: ['I built the entire platform myself'],
      });

      const analysis = engine.analyze(input);

      if (analysis.primaryFounderType) {
        expect([FounderTypeV2.TECHNICAL_FOUNDER, FounderTypeV2.PRODUCT_FOUNDER]).toContain(
          analysis.primaryFounderType
        );
      }
    });

    it('should classify business founders', () => {
      const input = createMockInput({
        userInput: 'I excel at partnerships and business development. I love selling and closing deals.',
        experienceDescriptions: ['I built a sales team and grew revenue 10x'],
      });

      const analysis = engine.analyze(input);

      if (analysis.primaryFounderType) {
        expect([FounderTypeV2.BUSINESS_FOUNDER, FounderTypeV2.VISIONARY_FOUNDER]).toContain(
          analysis.primaryFounderType
        );
      }
    });

    it('should provide type fit scores for all types', () => {
      const input = createMockInput();
      const analysis = engine.analyze(input);

      expect(analysis.typeClassification.allTypes).toHaveLength(7);

      for (const typeFit of analysis.typeClassification.allTypes) {
        expect(typeFit.fitScore).toBeGreaterThanOrEqual(0);
        expect(typeFit.fitScore).toBeLessThanOrEqual(1);
        expect(typeFit.recommendedCoFounderTypes.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Readiness Assessment', () => {
    it('should assess early readiness for minimal evidence', () => {
      const input = createMockInput({
        userInput: 'I am interested in startups.',
      });

      const analysis = engine.analyze(input);

      expect([FounderReadinessV2.EARLY, FounderReadinessV2.EMERGING]).toContain(
        analysis.readiness
      );
    });

    it('should assess high potential for strong evidence', () => {
      const input = createMockInput({
        userInput: 'I co-founded a startup, raised funding, and have 1000 paying customers.',
        projectPortfolio: [
          {
            name: 'Successful Startup',
            description: 'Growing SaaS business',
            isProduct: true,
            hadUsers: true,
            hadRevenue: true,
            revenueAmount: 100000,
            teamSize: 5,
            durationMonths: 24,
            outcome: 'ongoing',
            demonstratedSkills: ['founding', 'fundraising', 'sales', 'leadership'],
            role: 'CO_FOUNDER',
          },
        ],
      });

      const analysis = engine.analyze(input);

      expect(analysis.overallPotential).toBeGreaterThan(0.6);
      expect([FounderReadinessV2.READY, FounderReadinessV2.HIGH_POTENTIAL]).toContain(
        analysis.readiness
      );
    });
  });

  describe('Risk Profile', () => {
    it('should identify skill gap risks', () => {
      const input = createMockInput({
        userInput: 'I am good at coding but struggle with sales and networking.',
      });

      const analysis = engine.analyze(input);

      const skillGapRisk = analysis.riskProfile.risks.find(
        r => r.factor === 'SKILL_GAP_RISK'
      );
      expect(skillGapRisk).toBeDefined();
    });

    it('should calculate risk-adjusted potential', () => {
      const input = createMockInput();
      const analysis = engine.analyze(input);

      expect(analysis.riskProfile.riskAdjustedPotential).toBeLessThanOrEqual(
        analysis.overallPotential
      );
    });
  });

  describe('Market Fit', () => {
    it('should recommend suitable sectors', () => {
      const input = createMockInput({
        userInput: 'I am a technical founder interested in AI and software.',
      });

      const analysis = engine.analyze(input);

      expect(analysis.marketFit.bestSectors.length).toBeGreaterThan(0);
      expect(analysis.marketFit.alignmentScore).toBeGreaterThanOrEqual(0);
    });

    it('should assess co-founder needs', () => {
      const input = createMockInput({
        userInput: 'I am a solo technical founder who needs help with business development.',
      });

      const analysis = engine.analyze(input);

      expect(analysis.marketFit.coFounderNeeds.needed).toBe(true);
      expect(analysis.marketFit.coFounderNeeds.complementaryTypes.length).toBeGreaterThan(0);
    });
  });

  describe('Narrative Generation', () => {
    it('should generate comprehensive narrative', () => {
      const input = createMockInput();
      const analysis = engine.analyze(input);

      expect(analysis.narrative).toBeDefined();
      expect(analysis.narrative.summary).toBeTruthy();
      expect(analysis.narrative.potentialDescription).toBeTruthy();
      expect(analysis.narrative.readinessExplanation).toBeTruthy();
      expect(analysis.narrative.keyInsight).toBeTruthy();
      expect(analysis.narrative.strengthsParagraph).toBeTruthy();
      expect(analysis.narrative.developmentParagraph).toBeTruthy();
    });

    it('should include false positive warning when relevant', () => {
      const input = createMockInput({
        userInput: 'I am a freelance consultant who works with startups.',
      });

      const analysis = engine.analyze(input);

      if (analysis.isFalsePositiveRisk) {
        expect(analysis.narrative.falsePositiveWarning).toBeTruthy();
      }
    });
  });

  describe('Recommendations', () => {
    it('should generate actionable recommendations', () => {
      const input = createMockInput();
      const analysis = engine.analyze(input);

      expect(analysis.recommendations.length).toBeGreaterThan(0);

      for (const rec of analysis.recommendations) {
        expect(rec.type).toBeDefined();
        expect(rec.priority).toBeDefined();
        expect(rec.description).toBeTruthy();
        expect(rec.actionItems.length).toBeGreaterThan(0);
      }
    });

    it('should prioritize critical gaps', () => {
      const input = createMockInput({
        userInput: 'I struggle with taking ownership and making decisions.',
      });

      const analysis = engine.analyze(input);

      const criticalRecs = analysis.recommendations.filter(r => r.priority === 'critical');
      expect(criticalRecs.length).toBeGreaterThan(0);
    });
  });

  describe('Roadmap Generation', () => {
    it('should generate development roadmap when enabled', () => {
      const engineWithRoadmap = createFounderIntelligenceEngineV2({
        engine: { generateRoadmap: true },
      });

      const input = createMockInput();
      const analysis = engineWithRoadmap.analyze(input);

      expect(analysis.roadmap).toBeDefined();
      expect(analysis.roadmap!.milestones.length).toBeGreaterThan(0);
      expect(analysis.roadmap!.skillPriorities.length).toBeGreaterThan(0);
      expect(analysis.roadmap!.immediateActions.length).toBeGreaterThan(0);
    });

    it('should not generate roadmap when disabled', () => {
      const engineNoRoadmap = createFounderIntelligenceEngineV2({
        engine: { generateRoadmap: false },
      });

      const input = createMockInput();
      const analysis = engineNoRoadmap.analyze(input);

      expect(analysis.roadmap).toBeUndefined();
    });
  });

  describe('Quick Analysis', () => {
    it('should provide quick analysis with core metrics', () => {
      const input = createMockInput();
      const quick = engine.quickAnalyze(input);

      expect(quick.overallPotential).toBeDefined();
      expect(quick.confidence).toBeDefined();
      expect(quick.readiness).toBeDefined();
      expect(quick.isFalsePositiveRisk).toBeDefined();
      expect(quick.topStrengths).toBeInstanceOf(Array);
      expect(quick.developmentAreas).toBeInstanceOf(Array);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty input gracefully', () => {
      const input = createMockInput({
        userInput: '',
        explicitStatements: [],
        experienceDescriptions: [],
      });

      const analysis = engine.analyze(input);

      expect(analysis).toBeDefined();
      expect(analysis.dimensions).toHaveLength(8);
      expect(analysis.confidence).toBeLessThan(0.5); // Low confidence with no data
    });

    it('should handle portfolio with abandoned projects', () => {
      const input = createMockInput({
        projectPortfolio: [
          {
            name: 'Project 1',
            description: 'Abandoned',
            isProduct: false,
            hadUsers: false,
            hadRevenue: false,
            teamSize: 1,
            durationMonths: 2,
            outcome: 'abandoned',
            demonstratedSkills: [],
          },
          {
            name: 'Project 2',
            description: 'Abandoned',
            isProduct: false,
            hadUsers: false,
            hadRevenue: false,
            teamSize: 1,
            durationMonths: 1,
            outcome: 'abandoned',
            demonstratedSkills: [],
          },
          {
            name: 'Project 3',
            description: 'Abandoned',
            isProduct: false,
            hadUsers: false,
            hadRevenue: false,
            teamSize: 1,
            durationMonths: 3,
            outcome: 'abandoned',
            demonstratedSkills: [],
          },
        ],
      });

      const analysis = engine.analyze(input);

      // Should detect wantrepreneur pattern
      const wantrepreneurDetection = analysis.nonFounderProfiles.find(
        d => d.profile === NonFounderProfileV2.WANTREPRENEUR
      );
      expect(wantrepreneurDetection).toBeDefined();
    });

    it('should handle very strong founder signals', () => {
      const input = createMockInput({
        userInput: `
          I co-founded a startup, raised $2M in seed funding, and grew to 50 employees.
          We achieved product-market fit and have 10,000 paying customers.
          Before this, I built several products and learned from failures.
          I am obsessed with solving this problem and work 12 hours a day on it.
        `,
        projectPortfolio: [
          {
            name: 'Current Startup',
            description: 'Successful venture',
            isProduct: true,
            hadUsers: true,
            userCount: 10000,
            hadRevenue: true,
            revenueAmount: 1000000,
            teamSize: 50,
            durationMonths: 36,
            outcome: 'ongoing',
            demonstratedSkills: ['founding', 'fundraising', 'leadership', 'sales'],
            role: 'CO_FOUNDER',
          },
        ],
      });

      const analysis = engine.analyze(input);

      expect(analysis.overallPotential).toBeGreaterThan(0.8);
      expect(analysis.readiness).toBe(FounderReadinessV2.HIGH_POTENTIAL);
      expect(analysis.isFalsePositiveRisk).toBe(false);
    });
  });
});

describe('Signal Patterns', () => {
  it('should have signal patterns for all dimensions', () => {
    const { DIMENSION_SIGNAL_MAP } = require('../signals');

    for (const dimension of Object.values(FounderDimensionV2)) {
      expect(DIMENSION_SIGNAL_MAP[dimension]).toBeDefined();
      expect(DIMENSION_SIGNAL_MAP[dimension].length).toBeGreaterThan(0);
    }
  });

  it('should have non-founder patterns for all profiles', () => {
    const { NON_FOUNDER_PATTERN_MAP } = require('../signals');

    for (const profile of Object.values(NonFounderProfileV2)) {
      expect(NON_FOUNDER_PATTERN_MAP[profile]).toBeDefined();
      expect(NON_FOUNDER_PATTERN_MAP[profile].length).toBeGreaterThan(0);
    }
  });
});
