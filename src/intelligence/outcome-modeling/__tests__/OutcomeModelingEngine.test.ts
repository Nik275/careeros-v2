/**
 * CareerOS Outcome Modeling Engine Tests
 *
 * Comprehensive tests for the outcome range modeling system.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  OutcomeModelingEngine,
  createOutcomeModelingEngine,
  modelOutcomes,
  DEFAULT_OUTCOME_MODELING_CONFIG,
  type OutcomeModelingInput,
  type ScenarioOutcomeModel,
  type ConfidenceLevel,
} from '../index.js';
import type {
  FutureScenario,
  ScenarioType,
  CareerState,
  EducationState,
  ScenarioMilestone,
  IncomePoint,
  FlexibilityPoint,
  ScenarioMetrics,
  ScenarioAssumptions,
  RiskFactor,
} from '../../future-scenario/FutureScenarioGeneratorV1.js';
import type {
  StudentBeliefV3,
} from '../../types/index.js';
import type {
  OptionalityAnalysis,
} from '../../optionality-engine/OptionalityEngineV1.js';
import type {
  CriticalityAnalysis,
} from '../../criticality-engine/CriticalityEngineV1.js';
import type {
  DecisionCoalitionAnalysis,
} from '../../decision-coalition-v3/DecisionCoalitionEngineV3.js';

// ============================================================================
// MOCK DATA FACTORIES
// ============================================================================

const createMockStudentBeliefV3 = (): StudentBeliefV3 => ({
  id: 'belief-test-001',
  studentId: 'student-test-001',
  version: 3,
  timestamp: Date.now(),
  motivations: [{
    id: 'mot-1',
    name: 'Achievement',
    description: 'Drive to accomplish goals',
    strength: 0.8,
    evidence: [],
    isExplicit: true,
  }],
  strengths: [{
    id: 'str-1',
    name: 'Analytical Thinking',
    category: 'COGNITIVE',
    description: 'Strong problem-solving abilities',
    level: 0.85,
    evidence: [],
    isSelfReported: false,
  }],
  values: [{
    id: 'val-1',
    name: 'Work-Life Balance',
    description: 'Importance of personal time',
    importance: 0.75,
    evidence: [],
    isNonNegotiable: false,
  }],
  personalityTraits: [{
    id: 'trait-1',
    name: 'Openness',
    dimension: 'OPENNESS',
    position: 0.6,
    confidence: 0.8,
    evidence: [],
  }],
  lifestylePreferences: [],
  constraints: [{
    id: 'con-1',
    name: 'Financial Limitation',
    type: 'FINANCIAL',
    description: 'Limited education budget',
    isHardConstraint: false,
    severity: 0.6,
    evidence: [],
  }],
  familyReality: {
    obligations: [],
    expectations: [],
    supportLevel: 0.7,
    culturalFactors: [],
  },
  economicReality: {
    currentIncome: 0,
    familyIncome: 500000,
    financialAidEligible: true,
    educationBudget: 1000000,
  },
  educationalReality: {
    currentLevel: 'high-school',
    academicPerformance: 0.8,
    learningStyle: 'analytical',
    strengths: ['mathematics', 'science'],
    weaknesses: [],
  },
  decisionState: {
    urgency: 0.5,
    readiness: 0.7,
    pressureLevel: 0.4,
  },
  overallConfidence: 0.75,
  isValidated: true,
  metadata: {
    assessmentQuestionCount: 50,
    inferenceStepCount: 120,
    contributingEngines: ['student-model', 'belief-v3'],
    assessmentDuration: 1800000,
  },
});

const createMockFutureScenario = (type: ScenarioType = 'expected'): FutureScenario => ({
  id: `scenario-${type}-001`,
  type,
  name: `${type.charAt(0).toUpperCase() + type.slice(1)} Scenario`,
  description: `Test ${type} scenario for outcome modeling`,
  basePathId: 'path-test-001',
  timelineYears: 10,
  careerStates: [
    {
      nodeId: 'node-1',
      name: 'Junior Software Engineer',
      type: 'career',
      year: 2024,
      duration: 2,
      seniority: 'entry',
      skillsAcquired: ['JavaScript', 'React', 'Node.js'],
      performanceLevel: 'average',
    },
    {
      nodeId: 'node-2',
      name: 'Software Engineer',
      type: 'career',
      year: 2026,
      duration: 3,
      seniority: 'mid',
      skillsAcquired: ['System Design', 'Leadership', 'Architecture'],
      performanceLevel: 'above-average',
    },
    {
      nodeId: 'node-3',
      name: 'Senior Software Engineer',
      type: 'career',
      year: 2029,
      duration: 5,
      seniority: 'senior',
      skillsAcquired: ['Team Management', 'Strategic Planning'],
      performanceLevel: 'above-average',
    },
  ],
  educationStates: [
    {
      id: 'edu-1',
      name: 'B.Tech Computer Science',
      type: 'degree',
      startYear: 2020,
      endYear: 2024,
      status: 'completed',
      outcome: 'above-average',
      cost: 800000,
    },
  ],
  milestones: [
    {
      id: 'mile-1',
      name: 'First Job',
      description: 'Land first software engineering role',
      year: 2024,
      type: 'transition',
      isAchieved: true,
      conditions: ['Complete degree', 'Pass interviews'],
      impact: 'major',
    },
    {
      id: 'mile-2',
      name: 'Promotion to Senior',
      description: 'Achieve senior engineer level',
      year: 2029,
      type: 'promotion',
      isAchieved: false,
      conditions: ['5 years experience', 'Demonstrated leadership'],
      impact: 'critical',
    },
  ],
  incomeTrajectory: Array.from({ length: 10 }, (_, i) => ({
    year: 2024 + i,
    annualIncome: 500000 + (i * 100000),
    monthlyIncome: Math.round((500000 + (i * 100000)) / 12),
    growthRate: 0.08,
    sources: { primary: 500000 + (i * 100000) },
  })),
  flexibilityTrajectory: Array.from({ length: 10 }, (_, i) => ({
    year: 2024 + i,
    optionalityScore: Math.max(20, 70 - (i * 5)),
    reachableOptions: Math.max(10, 35 - (i * 2)),
    pivotPotential: Math.max(15, 60 - (i * 4)),
    skillTransferability: 75,
    geographicFlexibility: 80,
  })),
  metrics: {
    totalIncome: 9500000,
    peakIncome: 1400000,
    averageIncome: 950000,
    finalOptionality: 25,
    averageFlexibility: 45,
    transitionCount: 2,
    educationCompletionRate: 1.0,
    probability: type === 'conservative' ? 80 : type === 'expected' ? 60 : type === 'best-case' ? 15 : 35,
  },
  assumptions: {
    performanceLevel: type === 'best-case' ? 'exceptional' : type === 'high-risk' ? 'above-average' : 'average',
    marketConditions: type === 'best-case' ? 'boom' : type === 'conservative' ? 'slow' : 'stable',
    familySupport: 'moderate',
    financialConstraint: 'minimal',
    riskTolerance: type === 'high-risk' ? 'very-high' : type === 'conservative' ? 'low' : 'moderate',
    externalOpportunities: 'moderate',
  },
  riskFactors: [
    {
      id: 'risk-1',
      name: 'Market Demand Risk',
      description: 'Risk of decreased demand in field',
      category: 'market',
      probability: 30,
      impact: 70,
      riskScore: 21,
      isMitigated: false,
      mitigations: ['Diversify skills', 'Network building'],
    },
  ],
  generatedAt: Date.now(),
});

const createMockOptionalityAnalysis = (): OptionalityAnalysis => ({
  overallScore: 72,
  rating: 'good',
  dimensions: {
    careerFlexibility: {
      name: 'Career Flexibility',
      score: 0.75,
      explanation: 'Multiple career paths available',
      factors: ['Transferable skills', 'High demand field'],
    },
    transferableSkills: {
      name: 'Transferable Skills',
      score: 0.8,
      explanation: 'Strong foundation in problem-solving',
      factors: ['Analytical skills', 'Programming knowledge'],
    },
    pivotPotential: {
      name: 'Pivot Potential',
      score: 0.7,
      explanation: 'Can transition to related fields',
      factors: ['Adjacent career options', 'Skill overlap'],
    },
    entrepreneurshipPotential: {
      name: 'Entrepreneurship Potential',
      score: 0.65,
      explanation: 'Good foundation for tech startups',
      factors: ['Technical skills', 'Industry knowledge'],
    },
    futureCareerOptions: {
      name: 'Future Career Options',
      score: 0.75,
      explanation: 'Growing field with many specializations',
      factors: ['Industry growth', 'Specialization options'],
    },
  },
  summary: 'Good optionality with strong transferable skills',
  reasoning: ['High demand field', 'Multiple career paths', 'Strong foundation'],
  adjacentCareers: [],
  skillCategories: [],
  percentile: 75,
  calculatedAt: Date.now(),
});

const createMockCriticalityAnalysis = (): CriticalityAnalysis => ({
  id: 'crit-test-001',
  careerId: 'software-engineer',
  careerName: 'Software Engineer',
  criticalityScore: 35,
  category: 'low',
  summary: 'Low criticality path with good flexibility',
  explanation: 'Software engineering offers multiple exit options',
  metrics: {
    reachableCareerCount: {
      value: 15,
      explanation: '15+ careers reachable',
      impact: 'high',
      isPositive: true,
    },
    branchingFactor: {
      value: 4,
      explanation: 'Multiple branching points',
      impact: 'medium',
      isPositive: true,
    },
    reversibility: {
      value: 0.6,
      explanation: 'Moderately reversible',
      impact: 'medium',
      isPositive: true,
    },
    transferability: {
      value: 0.8,
      explanation: 'High skill transferability',
      impact: 'high',
      isPositive: true,
    },
    timeToFlexibility: {
      value: 2,
      explanation: 'Flexible after 2 years',
      impact: 'medium',
      isPositive: true,
    },
    optionalityPreservation: {
      value: 0.75,
      explanation: 'Good optionality preservation',
      impact: 'high',
      isPositive: true,
    },
    futureConstraint: {
      value: 0.3,
      explanation: 'Low future constraint',
      impact: 'low',
      isPositive: true,
    },
  },
  reachableCareers: {
    total: 15,
    byCategory: new Map(),
    topPaths: [],
  },
  constraints: {
    inaccessibleCareers: [],
    minimumCommitmentYears: 2,
    financialCommitment: 800000,
    educationRequirements: ['B.Tech or equivalent'],
  },
  comparison: {
    percentile: 30,
    vsCategoryAverage: -10,
    categorySize: 50,
  },
  calculatedAt: Date.now(),
});

const createMockCoalitionAnalysis = (): DecisionCoalitionAnalysis => ({
  id: 'coalition-test-001',
  studentBelief: createMockStudentBeliefV3(),
  pathExplorerResult: {
    id: 'explorer-test-001',
    startingCareer: {
      id: 'start',
      name: 'Starting Point',
      type: 'career',
      description: 'Starting point',
      category: 'General',
      typicalDuration: 0,
      financialCost: { min: 0, max: 0, typical: 0 },
      prerequisites: [],
      skillsGained: [],
      outcomes: {},
      isTerminal: false,
      popularity: 0.5,
    },
    startingCareerId: 'start',
    paths: [],
    pathsByType: new Map(),
    comparison: {
      bestOptionalityPath: null,
      bestGrowthPath: null,
      safestPath: null,
      fastestPath: null,
      tradeOffs: [],
    },
    recommendations: [],
    generatedAt: Date.now(),
  },
  pathAnalyses: new Map(),
  rankedPaths: [],
  coalitionHealth: {
    cohesion: 75,
    conflictLevel: 25,
    clarity: 80,
    confidence: 0.75,
  },
  pathComparison: null,
  recommendation: {
    recommendedPathId: 'path-test-001',
    recommendedPathType: 'primary',
    confidence: 0.7,
    reasoning: 'Good alignment across coalition members',
    supportingMembers: ['student-interests', 'family-expectations'],
    opposingMembers: [],
    successConditions: ['Maintain academic performance', 'Build relevant skills'],
    riskMitigation: ['Regular check-ins with family', 'Financial planning'],
  },
  generatedAt: Date.now(),
});

// ============================================================================
// TEST SUITE
// ============================================================================

describe('OutcomeModelingEngine', () => {
  let engine: OutcomeModelingEngine;
  let mockInput: OutcomeModelingInput;

  beforeEach(() => {
    engine = new OutcomeModelingEngine();
    mockInput = {
      scenario: createMockFutureScenario('expected'),
      studentBelief: createMockStudentBeliefV3(),
      coalitionAnalysis: createMockCoalitionAnalysis(),
      criticalityAnalysis: createMockCriticalityAnalysis(),
      optionalityAnalysis: createMockOptionalityAnalysis(),
    };
  });

  describe('Engine Creation', () => {
    it('should create engine with default config', () => {
      const eng = new OutcomeModelingEngine();
      expect(eng).toBeDefined();
    });

    it('should create engine with custom config', () => {
      const customConfig = {
        confidenceLevels: [0.95, 0.80] as ConfidenceLevel[],
        uncertaintyExpansionFactor: 2.0,
      };
      const eng = new OutcomeModelingEngine(customConfig);
      expect(eng).toBeDefined();
    });

    it('should use factory function', () => {
      const eng = createOutcomeModelingEngine();
      expect(eng).toBeDefined();
      expect(eng).toBeInstanceOf(OutcomeModelingEngine);
    });
  });

  describe('Outcome Modeling', () => {
    it('should generate outcome model for scenario', () => {
      const result = engine.modelOutcomes(mockInput);

      expect(result.outcomeModel).toBeDefined();
      expect(result.outcomeModel.scenarioId).toBe(mockInput.scenario.id);
      expect(result.outcomeModel.scenarioType).toBe(mockInput.scenario.type);
    });

    it('should include year range', () => {
      const result = engine.modelOutcomes(mockInput);

      expect(result.outcomeModel.yearRange).toBeDefined();
      expect(result.outcomeModel.yearRange.start).toBe(2024);
      expect(result.outcomeModel.yearRange.end).toBe(2034);
    });

    it('should include input metadata', () => {
      const result = engine.modelOutcomes(mockInput);

      expect(result.input.scenarioId).toBe(mockInput.scenario.id);
      expect(result.input.studentId).toBe(mockInput.studentBelief.studentId);
      expect(result.input.yearRange).toBeDefined();
    });

    it('should include modeling metadata', () => {
      const result = engine.modelOutcomes(mockInput);

      expect(result.metadata.confidenceLevelsUsed).toContain(0.95);
      expect(result.metadata.confidenceLevelsUsed).toContain(0.80);
      expect(result.metadata.confidenceLevelsUsed).toContain(0.50);
      expect(result.metadata.modelingApproach).toBeDefined();
      expect(result.metadata.assumptions.length).toBeGreaterThan(0);
      expect(result.metadata.limitations.length).toBeGreaterThan(0);
    });

    it('should include generation timestamp', () => {
      const result = engine.modelOutcomes(mockInput);

      expect(result.generatedAt).toBeGreaterThan(0);
      expect(result.outcomeModel.generatedAt).toBeGreaterThan(0);
    });
  });

  describe('Income Range Modeling', () => {
    it('should generate income ranges for each year', () => {
      const result = engine.modelOutcomes(mockInput);

      expect(result.outcomeModel.incomeRanges.length).toBe(10);
    });

    it('should include confidence intervals for annual income', () => {
      const result = engine.modelOutcomes(mockInput);

      result.outcomeModel.incomeRanges.forEach(yearModel => {
        expect(yearModel.annual.length).toBe(3); // 95%, 80%, 50%
        expect(yearModel.annual[0].level).toBe(0.95);
        expect(yearModel.annual[1].level).toBe(0.80);
        expect(yearModel.annual[2].level).toBe(0.50);
      });
    });

    it('should have valid range structure', () => {
      const result = engine.modelOutcomes(mockInput);

      result.outcomeModel.incomeRanges.forEach(yearModel => {
        yearModel.annual.forEach(interval => {
          expect(interval.range.lower).toBeGreaterThanOrEqual(0);
          expect(interval.range.upper).toBeGreaterThanOrEqual(interval.range.lower);
          expect(interval.range.midpoint).toBe(Math.round((interval.range.lower + interval.range.upper) / 2));
          expect(interval.range.width).toBe(interval.range.upper - interval.range.lower);
          expect(interval.interpretation.length).toBeGreaterThan(0);
        });
      });
    });

    it('should have wider ranges for higher confidence levels', () => {
      const result = engine.modelOutcomes(mockInput);

      result.outcomeModel.incomeRanges.forEach(yearModel => {
        const range95 = yearModel.annual.find(i => i.level === 0.95)!.range.width;
        const range80 = yearModel.annual.find(i => i.level === 0.80)!.range.width;
        const range50 = yearModel.annual.find(i => i.level === 0.50)!.range.width;

        expect(range95).toBeGreaterThan(range80);
        expect(range80).toBeGreaterThan(range50);
      });
    });

    it('should include monthly income ranges', () => {
      const result = engine.modelOutcomes(mockInput);

      result.outcomeModel.incomeRanges.forEach(yearModel => {
        expect(yearModel.monthly.length).toBe(3);
        yearModel.monthly.forEach(interval => {
          expect(interval.range.lower).toBeGreaterThanOrEqual(0);
        });
      });
    });

    it('should include cumulative income ranges', () => {
      const result = engine.modelOutcomes(mockInput);

      result.outcomeModel.incomeRanges.forEach(yearModel => {
        expect(yearModel.cumulative.length).toBe(3);
        yearModel.cumulative.forEach(interval => {
          expect(interval.range.lower).toBeGreaterThanOrEqual(0);
        });
      });
    });

    it('should include growth rate ranges', () => {
      const result = engine.modelOutcomes(mockInput);

      result.outcomeModel.incomeRanges.forEach(yearModel => {
        expect(yearModel.growthRate.length).toBe(3);
        yearModel.growthRate.forEach(interval => {
          expect(interval.range.lower).toBeGreaterThanOrEqual(-0.5);
          expect(interval.range.upper).toBeLessThanOrEqual(1.0);
        });
      });
    });

    it('should include income factors', () => {
      const result = engine.modelOutcomes(mockInput);

      result.outcomeModel.incomeRanges.forEach(yearModel => {
        expect(yearModel.factors.length).toBeGreaterThan(0);
        yearModel.factors.forEach(factor => {
          expect(factor.name).toBeDefined();
          expect(factor.impact).toBeGreaterThanOrEqual(-1);
          expect(factor.impact).toBeLessThanOrEqual(1);
          expect(factor.confidence).toBeGreaterThanOrEqual(0);
          expect(factor.confidence).toBeLessThanOrEqual(1);
          expect(['narrows', 'widens', 'shifts-up', 'shifts-down']).toContain(factor.rangeImpact);
        });
      });
    });
  });

  describe('Optionality Range Modeling', () => {
    it('should generate optionality ranges for each year', () => {
      const result = engine.modelOutcomes(mockInput);

      expect(result.outcomeModel.optionalityRanges.length).toBe(10);
    });

    it('should include confidence intervals for optionality score', () => {
      const result = engine.modelOutcomes(mockInput);

      result.outcomeModel.optionalityRanges.forEach(yearModel => {
        expect(yearModel.score.length).toBe(3);
        yearModel.score.forEach(interval => {
          expect(interval.range.lower).toBeGreaterThanOrEqual(0);
          expect(interval.range.upper).toBeLessThanOrEqual(100);
        });
      });
    });

    it('should include reachable careers ranges', () => {
      const result = engine.modelOutcomes(mockInput);

      result.outcomeModel.optionalityRanges.forEach(yearModel => {
        expect(yearModel.reachableCareers.length).toBe(3);
        yearModel.reachableCareers.forEach(interval => {
          expect(interval.range.lower).toBeGreaterThanOrEqual(0);
        });
      });
    });

    it('should include pivot potential ranges', () => {
      const result = engine.modelOutcomes(mockInput);

      result.outcomeModel.optionalityRanges.forEach(yearModel => {
        expect(yearModel.pivotPotential.length).toBe(3);
        yearModel.pivotPotential.forEach(interval => {
          expect(interval.range.lower).toBeGreaterThanOrEqual(0);
          expect(interval.range.upper).toBeLessThanOrEqual(100);
        });
      });
    });

    it('should include transferability ranges', () => {
      const result = engine.modelOutcomes(mockInput);

      result.outcomeModel.optionalityRanges.forEach(yearModel => {
        expect(yearModel.transferability.length).toBe(3);
        yearModel.transferability.forEach(interval => {
          expect(interval.range.lower).toBeGreaterThanOrEqual(0);
          expect(interval.range.upper).toBeLessThanOrEqual(100);
        });
      });
    });

    it('should include optionality factors', () => {
      const result = engine.modelOutcomes(mockInput);

      result.outcomeModel.optionalityRanges.forEach(yearModel => {
        expect(yearModel.factors.length).toBeGreaterThan(0);
        yearModel.factors.forEach(factor => {
          expect(factor.name).toBeDefined();
          expect(factor.impact).toBeGreaterThanOrEqual(-1);
          expect(factor.impact).toBeLessThanOrEqual(1);
          expect(factor.timeDecay).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });

  describe('Regret Exposure Modeling', () => {
    it('should generate regret exposure model', () => {
      const result = engine.modelOutcomes(mockInput);

      expect(result.outcomeModel.regretExposure).toBeDefined();
    });

    it('should include overall regret confidence intervals', () => {
      const result = engine.modelOutcomes(mockInput);

      expect(result.outcomeModel.regretExposure.overall.length).toBe(3);
      result.outcomeModel.regretExposure.overall.forEach(interval => {
        expect(interval.range.lower).toBeGreaterThanOrEqual(0);
        expect(interval.range.upper).toBeLessThanOrEqual(100);
      });
    });

    it('should include regret by category', () => {
      const result = engine.modelOutcomes(mockInput);

      expect(result.outcomeModel.regretExposure.byCategory.size).toBeGreaterThan(0);
      result.outcomeModel.regretExposure.byCategory.forEach((intervals, category) => {
        expect(intervals.length).toBe(3);
        expect(category).toBeDefined();
      });
    });

    it('should include regret over time', () => {
      const result = engine.modelOutcomes(mockInput);

      expect(result.outcomeModel.regretExposure.overTime.length).toBeGreaterThan(0);
      result.outcomeModel.regretExposure.overTime.forEach(timePoint => {
        expect(timePoint.year).toBeGreaterThanOrEqual(2024);
        expect(timePoint.range.length).toBe(3);
        expect(Array.isArray(timePoint.drivers)).toBe(true);
      });
    });

    it('should include regret factors', () => {
      const result = engine.modelOutcomes(mockInput);

      expect(result.outcomeModel.regretExposure.factors.length).toBeGreaterThan(0);
      result.outcomeModel.regretExposure.factors.forEach(factor => {
        expect(factor.name).toBeDefined();
        expect(factor.category).toBeDefined();
        expect(factor.contribution).toBeGreaterThanOrEqual(0);
        expect(factor.contribution).toBeLessThanOrEqual(1);
        expect(typeof factor.isMitigable).toBe('boolean');
        expect(Array.isArray(factor.mitigations)).toBe(true);
      });
    });
  });

  describe('Coalition Stability Modeling', () => {
    it('should generate coalition stability model', () => {
      const result = engine.modelOutcomes(mockInput);

      expect(result.outcomeModel.coalitionStability).toBeDefined();
    });

    it('should include overall stability confidence intervals', () => {
      const result = engine.modelOutcomes(mockInput);

      expect(result.outcomeModel.coalitionStability.overall.length).toBe(3);
      result.outcomeModel.coalitionStability.overall.forEach(interval => {
        expect(interval.range.lower).toBeGreaterThanOrEqual(0);
        expect(interval.range.upper).toBeLessThanOrEqual(100);
      });
    });

    it('should include stability by member', () => {
      const result = engine.modelOutcomes(mockInput);

      expect(result.outcomeModel.coalitionStability.byMember.size).toBeGreaterThan(0);
      result.outcomeModel.coalitionStability.byMember.forEach((intervals, member) => {
        expect(intervals.length).toBe(3);
        expect(member).toBeDefined();
      });
    });

    it('should include stability over time', () => {
      const result = engine.modelOutcomes(mockInput);

      expect(result.outcomeModel.coalitionStability.overTime.length).toBeGreaterThan(0);
      result.outcomeModel.coalitionStability.overTime.forEach(timePoint => {
        expect(timePoint.year).toBeGreaterThanOrEqual(2024);
        expect(timePoint.stability.length).toBe(3);
        expect(Array.isArray(timePoint.stressors)).toBe(true);
        expect(Array.isArray(timePoint.supports)).toBe(true);
      });
    });

    it('should include conflict likelihood ranges', () => {
      const result = engine.modelOutcomes(mockInput);

      expect(result.outcomeModel.coalitionStability.conflictLikelihood.length).toBe(3);
      result.outcomeModel.coalitionStability.conflictLikelihood.forEach(interval => {
        expect(interval.range.lower).toBeGreaterThanOrEqual(0);
        expect(interval.range.upper).toBeLessThanOrEqual(100);
      });
    });

    it('should include resolution probability ranges', () => {
      const result = engine.modelOutcomes(mockInput);

      expect(result.outcomeModel.coalitionStability.resolutionProbability.length).toBe(3);
      result.outcomeModel.coalitionStability.resolutionProbability.forEach(interval => {
        expect(interval.range.lower).toBeGreaterThanOrEqual(0);
        expect(interval.range.upper).toBeLessThanOrEqual(100);
      });
    });

    it('should include coalition stability factors', () => {
      const result = engine.modelOutcomes(mockInput);

      expect(result.outcomeModel.coalitionStability.factors.length).toBeGreaterThan(0);
      result.outcomeModel.coalitionStability.factors.forEach(factor => {
        expect(factor.name).toBeDefined();
        expect(factor.impact).toBeGreaterThanOrEqual(-1);
        expect(factor.impact).toBeLessThanOrEqual(1);
        expect(typeof factor.isDynamic).toBe('boolean');
        expect(['immediate', 'short-term', 'medium-term', 'long-term']).toContain(factor.timeHorizon);
      });
    });
  });

  describe('Satisfaction Likelihood Modeling', () => {
    it('should generate satisfaction likelihood model', () => {
      const result = engine.modelOutcomes(mockInput);

      expect(result.outcomeModel.satisfactionLikelihood).toBeDefined();
    });

    it('should include overall satisfaction confidence intervals', () => {
      const result = engine.modelOutcomes(mockInput);

      expect(result.outcomeModel.satisfactionLikelihood.overall.length).toBe(3);
      result.outcomeModel.satisfactionLikelihood.overall.forEach(interval => {
        expect(interval.range.lower).toBeGreaterThanOrEqual(0);
        expect(interval.range.upper).toBeLessThanOrEqual(100);
      });
    });

    it('should include satisfaction by dimension', () => {
      const result = engine.modelOutcomes(mockInput);

      expect(result.outcomeModel.satisfactionLikelihood.byDimension.size).toBeGreaterThan(0);
      result.outcomeModel.satisfactionLikelihood.byDimension.forEach((intervals, dimension) => {
        expect(intervals.length).toBe(3);
        expect(dimension).toBeDefined();
      });
    });

    it('should include satisfaction over time', () => {
      const result = engine.modelOutcomes(mockInput);

      expect(result.outcomeModel.satisfactionLikelihood.overTime.length).toBeGreaterThan(0);
      result.outcomeModel.satisfactionLikelihood.overTime.forEach(timePoint => {
        expect(timePoint.year).toBeGreaterThanOrEqual(2024);
        expect(timePoint.range.length).toBe(3);
        expect(Array.isArray(timePoint.contributors)).toBe(true);
        expect(Array.isArray(timePoint.detractors)).toBe(true);
      });
    });

    it('should include value alignment ranges', () => {
      const result = engine.modelOutcomes(mockInput);

      expect(result.outcomeModel.satisfactionLikelihood.valueAlignment.length).toBe(3);
      result.outcomeModel.satisfactionLikelihood.valueAlignment.forEach(interval => {
        expect(interval.range.lower).toBeGreaterThanOrEqual(0);
        expect(interval.range.upper).toBeLessThanOrEqual(100);
      });
    });

    it('should include strength alignment ranges', () => {
      const result = engine.modelOutcomes(mockInput);

      expect(result.outcomeModel.satisfactionLikelihood.strengthAlignment.length).toBe(3);
      result.outcomeModel.satisfactionLikelihood.strengthAlignment.forEach(interval => {
        expect(interval.range.lower).toBeGreaterThanOrEqual(0);
        expect(interval.range.upper).toBeLessThanOrEqual(100);
      });
    });

    it('should include satisfaction factors', () => {
      const result = engine.modelOutcomes(mockInput);

      expect(result.outcomeModel.satisfactionLikelihood.factors.length).toBeGreaterThan(0);
      result.outcomeModel.satisfactionLikelihood.factors.forEach(factor => {
        expect(factor.name).toBeDefined();
        expect(factor.dimension).toBeDefined();
        expect(factor.impact).toBeGreaterThanOrEqual(-1);
        expect(factor.impact).toBeLessThanOrEqual(1);
        expect(typeof factor.isControllable).toBe('boolean');
      });
    });
  });

  describe('Metric Correlations', () => {
    it('should generate correlations between metrics', () => {
      const result = engine.modelOutcomes(mockInput);

      expect(result.outcomeModel.correlations.length).toBeGreaterThan(0);
    });

    it('should include correlation details', () => {
      const result = engine.modelOutcomes(mockInput);

      result.outcomeModel.correlations.forEach(correlation => {
        expect(correlation.metricA).toBeDefined();
        expect(correlation.metricB).toBeDefined();
        expect(correlation.correlation.length).toBe(3);
        expect(correlation.interpretation.length).toBeGreaterThan(0);
        expect(correlation.causationNote.length).toBeGreaterThan(0);
      });
    });

    it('should have valid correlation ranges', () => {
      const result = engine.modelOutcomes(mockInput);

      result.outcomeModel.correlations.forEach(correlation => {
        correlation.correlation.forEach(interval => {
          expect(interval.range.lower).toBeGreaterThanOrEqual(-1);
          expect(interval.range.upper).toBeLessThanOrEqual(1);
        });
      });
    });

    it('should include income-optionality correlation', () => {
      const result = engine.modelOutcomes(mockInput);

      const incomeOptionalityCorr = result.outcomeModel.correlations.find(
        c => c.metricA === 'income' && c.metricB === 'optionality'
      );
      expect(incomeOptionalityCorr).toBeDefined();
    });

    it('should include income-satisfaction correlation', () => {
      const result = engine.modelOutcomes(mockInput);

      const incomeSatisfactionCorr = result.outcomeModel.correlations.find(
        c => c.metricA === 'income' && c.metricB === 'satisfaction'
      );
      expect(incomeSatisfactionCorr).toBeDefined();
    });
  });

  describe('Overall Confidence Assessment', () => {
    it('should generate overall confidence assessment', () => {
      const result = engine.modelOutcomes(mockInput);

      expect(result.outcomeModel.overallConfidence).toBeDefined();
    });

    it('should have valid confidence score', () => {
      const result = engine.modelOutcomes(mockInput);

      expect(result.outcomeModel.overallConfidence.score).toBeGreaterThanOrEqual(20);
      expect(result.outcomeModel.overallConfidence.score).toBeLessThanOrEqual(95);
    });

    it('should have valid confidence level', () => {
      const result = engine.modelOutcomes(mockInput);

      expect(['very-high', 'high', 'moderate', 'low', 'very-low']).toContain(
        result.outcomeModel.overallConfidence.level
      );
    });

    it('should include confidence drivers', () => {
      const result = engine.modelOutcomes(mockInput);

      expect(result.outcomeModel.overallConfidence.drivers.length).toBeGreaterThan(0);
    });

    it('should include uncertainty sources', () => {
      const result = engine.modelOutcomes(mockInput);

      expect(result.outcomeModel.overallConfidence.uncertainties.length).toBeGreaterThan(0);
    });

    it('should include recommendations', () => {
      const result = engine.modelOutcomes(mockInput);

      expect(result.outcomeModel.overallConfidence.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Scenario Type Variations', () => {
    it('should model best-case scenario', () => {
      const input = {
        ...mockInput,
        scenario: createMockFutureScenario('best-case'),
      };
      const result = engine.modelOutcomes(input);

      expect(result.outcomeModel.scenarioType).toBe('best-case');
      expect(result.outcomeModel.incomeRanges.length).toBe(10);
    });

    it('should model conservative scenario', () => {
      const input = {
        ...mockInput,
        scenario: createMockFutureScenario('conservative'),
      };
      const result = engine.modelOutcomes(input);

      expect(result.outcomeModel.scenarioType).toBe('conservative');
      expect(result.outcomeModel.incomeRanges.length).toBe(10);
    });

    it('should model high-risk scenario', () => {
      const input = {
        ...mockInput,
        scenario: createMockFutureScenario('high-risk'),
      };
      const result = engine.modelOutcomes(input);

      expect(result.outcomeModel.scenarioType).toBe('high-risk');
      expect(result.outcomeModel.incomeRanges.length).toBe(10);
    });

    it('should have different confidence levels by scenario type', () => {
      const conservativeInput = { ...mockInput, scenario: createMockFutureScenario('conservative') };
      const highRiskInput = { ...mockInput, scenario: createMockFutureScenario('high-risk') };

      const conservativeResult = engine.modelOutcomes(conservativeInput);
      const highRiskResult = engine.modelOutcomes(highRiskInput);

      // Conservative should have higher confidence than high-risk
      expect(conservativeResult.outcomeModel.overallConfidence.score).toBeGreaterThan(
        highRiskResult.outcomeModel.overallConfidence.score
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing coalition analysis', () => {
      const input = {
        ...mockInput,
        coalitionAnalysis: undefined,
      };
      const result = engine.modelOutcomes(input);

      expect(result.outcomeModel.coalitionStability).toBeDefined();
      expect(result.outcomeModel.overallConfidence).toBeDefined();
    });

    it('should handle empty alternative scenarios', () => {
      const input = {
        ...mockInput,
        alternativeScenarios: [],
      };
      const result = engine.modelOutcomes(input);

      expect(result.outcomeModel.regretExposure).toBeDefined();
    });

    it('should handle single-year scenario', () => {
      const singleYearScenario = {
        ...createMockFutureScenario('expected'),
        timelineYears: 1,
        incomeTrajectory: [{
          year: 2024,
          annualIncome: 500000,
          monthlyIncome: 41667,
          growthRate: 0.08,
          sources: { primary: 500000 },
        }],
        flexibilityTrajectory: [{
          year: 2024,
          optionalityScore: 70,
          reachableOptions: 35,
          pivotPotential: 60,
          skillTransferability: 75,
          geographicFlexibility: 80,
        }],
      };
      const input = {
        ...mockInput,
        scenario: singleYearScenario,
      };
      const result = engine.modelOutcomes(input);

      expect(result.outcomeModel.incomeRanges.length).toBe(1);
      expect(result.outcomeModel.optionalityRanges.length).toBe(1);
    });

    it('should handle scenario with no education states', () => {
      const noEducationScenario = {
        ...createMockFutureScenario('expected'),
        educationStates: [],
      };
      const input = {
        ...mockInput,
        scenario: noEducationScenario,
      };
      const result = engine.modelOutcomes(input);

      expect(result.outcomeModel).toBeDefined();
    });
  });

  describe('Convenience Function', () => {
    it('should model outcomes using convenience function', () => {
      const result = modelOutcomes(mockInput);

      expect(result.outcomeModel).toBeDefined();
      expect(result.outcomeModel.scenarioId).toBe(mockInput.scenario.id);
    });
  });

  describe('Default Configuration', () => {
    it('should have valid default config', () => {
      expect(DEFAULT_OUTCOME_MODELING_CONFIG.confidenceLevels).toContain(0.95);
      expect(DEFAULT_OUTCOME_MODELING_CONFIG.confidenceLevels).toContain(0.80);
      expect(DEFAULT_OUTCOME_MODELING_CONFIG.confidenceLevels).toContain(0.50);
      expect(DEFAULT_OUTCOME_MODELING_CONFIG.uncertaintyExpansionFactor).toBe(1.5);
    });

    it('should have income volatility factors for all scenario types', () => {
      expect(DEFAULT_OUTCOME_MODELING_CONFIG.incomeVolatilityFactors['best-case']).toBeDefined();
      expect(DEFAULT_OUTCOME_MODELING_CONFIG.incomeVolatilityFactors['expected']).toBeDefined();
      expect(DEFAULT_OUTCOME_MODELING_CONFIG.incomeVolatilityFactors['conservative']).toBeDefined();
      expect(DEFAULT_OUTCOME_MODELING_CONFIG.incomeVolatilityFactors['high-risk']).toBeDefined();
    });

    it('should have base rates for all scenario types', () => {
      expect(DEFAULT_OUTCOME_MODELING_CONFIG.satisfactionBaseRates['best-case']).toBeDefined();
      expect(DEFAULT_OUTCOME_MODELING_CONFIG.satisfactionBaseRates['expected']).toBeDefined();
      expect(DEFAULT_OUTCOME_MODELING_CONFIG.satisfactionBaseRates['conservative']).toBeDefined();
      expect(DEFAULT_OUTCOME_MODELING_CONFIG.satisfactionBaseRates['high-risk']).toBeDefined();
    });
  });

  describe('Deterministic Behavior', () => {
    it('should produce consistent results for same input', () => {
      const result1 = engine.modelOutcomes(mockInput);
      const result2 = engine.modelOutcomes(mockInput);

      expect(result1.outcomeModel.scenarioId).toBe(result2.outcomeModel.scenarioId);
      expect(result1.outcomeModel.incomeRanges.length).toBe(result2.outcomeModel.incomeRanges.length);
      expect(result1.outcomeModel.correlations.length).toBe(result2.outcomeModel.correlations.length);
    });
  });
});
