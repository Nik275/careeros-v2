/**
 * CareerOS Future Scenario Generator V1 Tests
 *
 * Comprehensive tests for the future scenario generation system.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  FutureScenarioGeneratorV1,
  createFutureScenarioGenerator,
  generateFutureScenarios,
  DEFAULT_SCENARIO_CONFIG,
  type ScenarioGenerationInput,
  type FutureScenario,
  type ScenarioType,
} from '../index.js';
import {
  ConstraintType,
  PersonalityDimension,
  StrengthCategory,
} from '../../types/index.js';
import type {
  StudentBeliefV3,
} from '../../types/index.js';
import type {
  CareerNode,
  CareerEdge,
} from '../../career-transition-graph/index.js';
import type {
  ExploredCareerPath,
} from '../../path-explorer/index.js';
import type {
  OptionalityAnalysis,
} from '../../optionality-engine/OptionalityEngineV1.js';
import type {
  CriticalityAnalysis,
} from '../../criticality-engine/CriticalityEngineV1.js';
import type {
  DecisionCoalitionAnalysis,
} from '../../decision-coalition-v3/DecisionCoalitionEngineV3.js';
import { KnowledgeGraph } from '../../../knowledge-graph/KnowledgeGraphCore.js';

// ============================================================================
// MOCK DATA FACTORIES
// ============================================================================

type ScenarioCareerNodeKind = 'exam' | 'degree' | 'job' | 'career' | 'pivot';

type LegacyScenarioNodeFields = {
  type: ScenarioCareerNodeKind;
  typicalDuration: number;
  financialCost: {
    min: number;
    max: number;
    typical: number;
  };
  prerequisites: string[];
  skillsGained: string[];
  outcomes: {
    averageSalary: number;
    jobSecurity: number;
    growthPotential: number;
    workLifeBalance: number;
  };
  isTerminal: boolean;
  popularity: number;
};

type LegacyScenarioEdgeFields = {
  fromNodeId: string;
  toNodeId: string;
  probability: number;
  reversibility: number;
  timeCost: number;
  difficulty: number;
  financialCost: {
    min: number;
    max: number;
    typical: number;
  };
  prerequisites: string[];
  newSkillsRequired: string[];
  description: string;
};

type ScenarioCareerNode = CareerNode & LegacyScenarioNodeFields;
type ScenarioCareerEdge = CareerEdge & LegacyScenarioEdgeFields;
type ScenarioPathMetrics = ExploredCareerPath['metrics'] & {
  criticality: number;
  optionality: number;
  pathProbability: number;
  reversibility: number;
  riskScore: number;
};
type ScenarioPathExplanation = ExploredCareerPath['explanation'] & {
  concerns: string[];
  alignmentRationale: string;
};
type ScenarioExploredCareerPath = Omit<
  ExploredCareerPath,
  'nodes' | 'edges' | 'metrics' | 'explanation'
> & {
  nodes: ScenarioCareerNode[];
  edges: ScenarioCareerEdge[];
  metrics: ScenarioPathMetrics;
  explanation: ScenarioPathExplanation;
};

const createMockFamilyReality = (): StudentBeliefV3['familyReality'] => ({
  id: 'family-reality-test-001',
  structure: {
    id: 'family-structure-test-001',
    type: 'NUCLEAR',
    description: 'Nuclear family with moderate support',
    dependentCount: 0,
    isPrimaryBreadwinner: false,
    householdMembers: [],
    evidence: [],
    confidence: 0.8,
    assessedAt: Date.now(),
  },
  obligations: [],
  parentalExpectations: [],
  support: [{
    id: 'family-support-test-001',
    type: 'FINANCIAL',
    description: 'Family can support education costs',
    reliability: 0.7,
    expectedDuration: '4 years',
    evidence: [],
    confidence: 0.8,
  }],
  culturalConstraints: [],
  overallInfluence: 0.4,
  isMajorFactor: false,
  evidence: [],
  confidence: 0.8,
  assessedAt: Date.now(),
});

const createMockEconomicReality = (): StudentBeliefV3['economicReality'] => ({
  id: 'economic-reality-test-001',
  financialSituation: {
    id: 'financial-situation-test-001',
    familyIncomeBracket: '6_TO_12_LAKH',
    estimatedAnnualIncome: 500000,
    locationType: 'TIER_2',
    monthlyDiscretionaryBudget: 10000,
    availableSavings: 1000000,
    emergencyFundMonths: 6,
    hasOwnIncome: false,
    evidence: [],
    confidence: 0.8,
    assessedAt: Date.now(),
  },
  educationFinancing: {
    id: 'education-financing-test-001',
    fundingSources: [{
      type: 'FAMILY_SAVINGS',
      amount: 1000000,
      duration: '4 years',
      reliability: 0.7,
    }],
    loans: [],
    scholarships: [],
    totalEducationDebt: 0,
    monthlyDebtObligation: 0,
    isConstraint: false,
    evidence: [],
    confidence: 0.8,
    assessedAt: Date.now(),
  },
  constraints: [],
  resources: {
    id: 'resource-availability-test-001',
    monthlySkillBudget: 5000,
    certificationBudget: 20000,
    technologyAccess: 'FULL',
    mentorshipAccess: 'LIMITED',
    timeAvailability: 10,
    canRelocate: true,
    relocationBudget: 200000,
    evidence: [],
    confidence: 0.8,
    assessedAt: Date.now(),
  },
  riskTolerance: {
    id: 'financial-risk-tolerance-test-001',
    canPursuePassion: true,
    canAffordRetraining: true,
    canAffordEntrepreneurship: false,
    canAffordUnpaidWork: false,
    canAffordDelayedROI: true,
    financialRunwayMonths: 12,
    riskToleranceScore: 0.6,
    evidence: [],
    confidence: 0.8,
  },
  overallBarrierScore: 0.3,
  isMajorFactor: false,
  evidence: [],
  confidence: 0.8,
  assessedAt: Date.now(),
});

const createMockEducationalReality = (): StudentBeliefV3['educationalReality'] => ({
  id: 'educational-reality-test-001',
  background: {
    id: 'academic-background-test-001',
    stream: 'SCIENCE_PCM',
    board: 'CBSE',
    currentLevel: 'HIGHER_SECONDARY',
    yearsCompleted: 12,
    evidence: [],
    confidence: 0.8,
    assessedAt: Date.now(),
  },
  performance: {
    id: 'academic-performance-test-001',
    overallStanding: 'GOOD',
    class10Score: 90,
    class12Score: 88,
    percentile: 85,
    subjectPerformance: [
      {
        subject: 'mathematics',
        score: 90,
        strength: 'STRONG',
        careerRelevance: 'HIGH',
      },
      {
        subject: 'science',
        score: 88,
        strength: 'STRONG',
        careerRelevance: 'HIGH',
      },
    ],
    achievements: [],
    evidence: [],
    confidence: 0.8,
    assessedAt: Date.now(),
  },
  competitiveExams: [],
  learningProfile: {
    id: 'learning-profile-test-001',
    primaryStyle: 'VISUAL',
    secondaryStyles: ['READING_WRITING'],
    preferredEnvironment: 'PROJECT_BASED',
    studyHoursPerWeek: 20,
    peakLearningTime: 'MORNING',
    attentionSpanMinutes: 45,
    breakFrequency: 'MODERATE',
    selfDiscipline: 'HIGH',
    evidence: [],
    confidence: 0.8,
    assessedAt: Date.now(),
  },
  opportunities: [],
  overallPotential: 0.8,
  barriers: [],
  isMajorFactor: true,
  evidence: [],
  confidence: 0.8,
  assessedAt: Date.now(),
});

const createMockDecisionState = (): StudentBeliefV3['decisionState'] => ({
  id: 'decision-state-test-001',
  timeline: {
    id: 'decision-timeline-test-001',
    urgency: 'MEDIUM_TERM',
    deadlines: [],
    daysToNextDecision: 180,
    daysToFinalDecision: 365,
    currentPhase: 'EXPLORATION',
    explorationTimeAvailable: 90,
    evidence: [],
    confidence: 0.8,
    assessedAt: Date.now(),
  },
  pressure: {
    id: 'decision-pressure-test-001',
    factors: [],
    overallPressure: 0.4,
    isUnhealthy: false,
    primarySource: 'FAMILY',
    reportedStressLevel: 0.3,
    evidence: [],
    confidence: 0.8,
    assessedAt: Date.now(),
  },
  information: {
    id: 'information-status-test-001',
    needs: [],
    gapsCount: 0,
    criticalGapsCount: 0,
    sufficiencyScore: 0.7,
    hasAdequateResearch: true,
    sourcesUsed: [],
    evidence: [],
    confidence: 0.8,
    assessedAt: Date.now(),
  },
  readiness: {
    id: 'decision-readiness-test-001',
    components: [],
    overallReadiness: 0.7,
    category: 'NEARLY_READY',
    canDecideNow: true,
    recommendedPreparation: [],
    evidence: [],
    confidence: 0.8,
    assessedAt: Date.now(),
  },
  context: {
    id: 'decision-context-test-001',
    lifeSituation: 'IN_SCHOOL',
    emotionalState: 'OPTIMISTIC',
    lifeChanges: [],
    supportSystemAvailable: true,
    decisionCapacity: 'FULL',
    isGoodTiming: true,
    evidence: [],
    confidence: 0.8,
    assessedAt: Date.now(),
  },
  activeDecision: 'career path selection',
  alternativesConsidered: ['software engineering'],
  isStuck: false,
  evidence: [],
  confidence: 0.8,
  assessedAt: Date.now(),
});

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
    category: StrengthCategory.COGNITIVE,
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
    dimension: PersonalityDimension.OPENNESS,
    position: 0.6,
    confidence: 0.8,
    evidence: [],
  }],
  lifestylePreferences: [],
  constraints: [{
    id: 'con-1',
    name: 'Financial Limitation',
    type: ConstraintType.FINANCIAL,
    description: 'Limited education budget',
    isHardConstraint: false,
    severity: 0.6,
    evidence: [],
  }],
  familyReality: createMockFamilyReality(),
  economicReality: createMockEconomicReality(),
  educationalReality: createMockEducationalReality(),
  decisionState: createMockDecisionState(),
  overallConfidence: 0.75,
  isValidated: true,
  metadata: {
    assessmentQuestionCount: 50,
    inferenceStepCount: 120,
    contributingEngines: ['student-model', 'belief-v3'],
    assessmentDuration: 1800000,
  },
});

const createMockCareerNode = (
  id: string,
  name: string,
  type: ScenarioCareerNodeKind,
  options: Partial<ScenarioCareerNode> = {}
): ScenarioCareerNode => ({
  id,
  name,
  type,
  description: `Description for ${name}`,
  category: 'technology',
  requiredProfile: {
    analyticalThinking: 0.8,
    creativity: 0.5,
    socialOrientation: 0.4,
    leadership: 0.5,
    detailOrientation: 0.7,
    curiosity: 0.8,
    competitiveness: 0.6,
    riskTolerance: 0.5,
  },
  keySkills: ['programming', 'problem-solving'],
  skillCategories: ['technical'],
  typicalExperienceYears: type === 'degree' ? 0 : type === 'job' ? 1 : 3,
  incomeLevel: 0.7,
  isEntryLevel: type === 'degree' || type === 'job',
  isTerminal: false,
  relatedCareers: [],
  metadata: {
    demandLevel: 0.8,
    growthOutlook: 0.8,
    addedAt: Date.now(),
  },
  typicalDuration: 2,
  financialCost: {
    min: 100000,
    max: 500000,
    typical: 300000,
  },
  prerequisites: [],
  skillsGained: ['skill-1', 'skill-2'],
  outcomes: {
    averageSalary: 600000,
    jobSecurity: 0.7,
    growthPotential: 0.8,
    workLifeBalance: 0.6,
  },
  popularity: 0.75,
  ...options,
});

const createMockCareerEdge = (
  fromId: string,
  toId: string,
  options: Partial<ScenarioCareerEdge> = {}
): ScenarioCareerEdge => ({
  id: `edge-${fromId}-${toId}`,
  fromNodeId: fromId,
  toNodeId: toId,
  transitionDifficulty: 50,
  transitionTimeYears: 1,
  skillOverlap: 0.6,
  probabilityOfSuccess: 0.8,
  transitionType: 'promotion',
  description: `Transition from ${fromId} to ${toId}`,
  prerequisites: [],
  transferableSkills: [],
  skillsToAcquire: [],
  commonPaths: [],
  metadata: {
    frequency: 'common',
    confidence: 0.8,
    addedAt: Date.now(),
  },
  probability: 0.8,
  reversibility: 0.3,
  timeCost: 1,
  financialCost: {
    min: 0,
    max: 100000,
    typical: 50000,
  },
  difficulty: 0.5,
  newSkillsRequired: [],
  ...options,
});

const createMockExploredCareerPath = (): ScenarioExploredCareerPath => ({
  id: 'path-test-001',
  type: 'primary',
  name: 'Software Engineer Path',
  nodes: [
    createMockCareerNode('node-1', 'B.Tech Computer Science', 'degree', {
      typicalDuration: 4,
      financialCost: { min: 400000, max: 1200000, typical: 800000 },
    }),
    createMockCareerNode('node-2', 'Junior Software Engineer', 'job', {
      typicalDuration: 2,
      outcomes: { averageSalary: 500000, jobSecurity: 0.7, growthPotential: 0.8, workLifeBalance: 0.6 },
    }),
    createMockCareerNode('node-3', 'Software Engineer', 'career', {
      typicalDuration: 3,
      outcomes: { averageSalary: 800000, jobSecurity: 0.75, growthPotential: 0.85, workLifeBalance: 0.65 },
    }),
    createMockCareerNode('node-4', 'Senior Software Engineer', 'career', {
      typicalDuration: 3,
      outcomes: { averageSalary: 1500000, jobSecurity: 0.8, growthPotential: 0.75, workLifeBalance: 0.6 },
    }),
  ],
  edges: [
    createMockCareerEdge('node-1', 'node-2', { probability: 0.85 }),
    createMockCareerEdge('node-2', 'node-3', { probability: 0.9 }),
    createMockCareerEdge('node-3', 'node-4', { probability: 0.75 }),
  ],
  nodeIds: ['node-1', 'node-2', 'node-3', 'node-4'],
  metrics: {
    totalYears: 12,
    transitionCount: 3,
    incomeRange: {
      entry: 500000,
      mid: 800000,
      senior: 1500000,
      growthRate: 0.08,
    },
    totalDifficulty: 0.5,
    avgTransitionTime: 1,
    cumulativeSuccessProbability: 0.65,
    minReversibility: 0.3,
    avgSkillOverlap: 0.7,
    criticality: 0.4,
    optionality: 0.7,
    pathProbability: 0.65,
    reversibility: 0.5,
    riskScore: 0.35,
  },
  scores: {
    optionalityScore: 70,
    criticalityScore: 40,
    flexibilityScore: 65,
    growthScore: 80,
    stabilityScore: 75,
    compositeScore: 72,
  },
  risk: {
    level: 'medium',
    score: 35,
    factors: [],
    mitigations: [],
  },
  explanation: {
    summary: 'Strong path with good growth potential',
    details: 'Software engineering has a clear skill progression and strong market demand.',
    selectionReason: 'Good fit for analytical students',
    strengths: ['High demand', 'Good salary growth'],
    tradeoffs: ['Requires continuous learning'],
    preservedOptions: ['Data science', 'Product engineering'],
    closedOptions: [],
    concerns: ['Requires continuous learning'],
    alignmentRationale: 'Good fit for analytical students',
  },
  recommendations: ['Focus on programming fundamentals', 'Build portfolio projects'],
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
  adjacentCareers: [
    {
      careerId: 'data-scientist',
      name: 'Data Scientist',
      transitionEase: 0.7,
      skillOverlap: 0.6,
      transitionTimeMonths: 12,
      reasoning: 'Overlapping skills in programming and analysis',
    },
  ],
  skillCategories: [
    {
      category: 'Technical',
      skills: ['Programming', 'System Design', 'Debugging'],
      transferability: 0.85,
      applicableIndustries: ['Technology', 'Finance', 'Healthcare'],
    },
  ],
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
  explanation: 'Software engineering offers multiple exit options and transferable skills',
  metrics: {
    reachableCareerCount: {
      value: 15,
      explanation: '15+ careers reachable from this path',
      impact: 'high',
      isPositive: true,
    },
    branchingFactor: {
      value: 4,
      explanation: 'Multiple branching points available',
      impact: 'medium',
      isPositive: true,
    },
    reversibility: {
      value: 0.6,
      explanation: 'Moderately reversible decisions',
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
    byCategory: new Map([['Technology', 8], ['Business', 4], ['Other', 3]]),
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
    startingCareer: createMockCareerNode('start', 'Starting Point', 'career'),
    startingCareerId: 'start',
    paths: [],
    pathsByType: new Map(),
    comparison: {
      bestForGrowth: 'primary',
      bestForOptionality: 'primary',
      bestForStability: 'primary',
      safestPath: 'primary',
      riskiestPath: 'high-growth',
      comparisonText: 'Single test path comparison',
      keyDifferences: [],
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

describe('FutureScenarioGeneratorV1', () => {
  let generator: FutureScenarioGeneratorV1;
  let mockInput: ScenarioGenerationInput;

  beforeEach(() => {
    generator = new FutureScenarioGeneratorV1();
    mockInput = {
      studentBelief: createMockStudentBeliefV3(),
      basePath: createMockExploredCareerPath(),
      knowledgeGraph: new KnowledgeGraph(),
      optionalityAnalysis: createMockOptionalityAnalysis(),
      criticalityAnalysis: createMockCriticalityAnalysis(),
      coalitionAnalysis: createMockCoalitionAnalysis(),
      startYear: 2024,
      duration: 10,
      currentAge: 18,
    };
  });

  describe('Generator Creation', () => {
    it('should create generator with default config', () => {
      const gen = new FutureScenarioGeneratorV1();
      expect(gen).toBeDefined();
    });

    it('should create generator with custom config', () => {
      const customConfig = {
        incomeGrowthRates: {
          'best-case': 0.2,
          'expected': 0.1,
          'conservative': 0.05,
          'high-risk': 0.15,
        },
      };
      const gen = new FutureScenarioGeneratorV1(customConfig);
      expect(gen).toBeDefined();
    });

    it('should use factory function', () => {
      const gen = createFutureScenarioGenerator();
      expect(gen).toBeDefined();
      expect(gen).toBeInstanceOf(FutureScenarioGeneratorV1);
    });
  });

  describe('Scenario Generation', () => {
    it('should generate all 4 scenario types', () => {
      const result = generator.generateScenarios(mockInput);

      expect(result.scenarios).toHaveLength(4);

      const types = result.scenarios.map(s => s.type);
      expect(types).toContain('best-case');
      expect(types).toContain('expected');
      expect(types).toContain('conservative');
      expect(types).toContain('high-risk');
    });

    it('should generate unique IDs for each scenario', () => {
      const result = generator.generateScenarios(mockInput);
      const ids = result.scenarios.map(s => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(4);
    });

    it('should include base path ID in all scenarios', () => {
      const result = generator.generateScenarios(mockInput);

      result.scenarios.forEach(scenario => {
        expect(scenario.basePathId).toBe(mockInput.basePath.id);
      });
    });

    it('should include student ID in result', () => {
      const result = generator.generateScenarios(mockInput);
      expect(result.studentId).toBe(mockInput.studentBelief.studentId);
    });

    it('should include generation parameters', () => {
      const result = generator.generateScenarios(mockInput);

      expect(result.parameters.startYear).toBe(2024);
      expect(result.parameters.duration).toBe(10);
      expect(result.parameters.currentAge).toBe(18);
    });

    it('should include generation timestamp', () => {
      const result = generator.generateScenarios(mockInput);
      expect(result.generatedAt).toBeGreaterThan(0);
    });
  });

  describe('Career States', () => {
    it('should generate career states for each node', () => {
      const result = generator.generateScenarios(mockInput);

      result.scenarios.forEach(scenario => {
        expect(scenario.careerStates.length).toBeGreaterThan(0);
        expect(scenario.careerStates.length).toBe(mockInput.basePath.nodes.length);
      });
    });

    it('should include correct node information in career states', () => {
      const result = generator.generateScenarios(mockInput);
      const scenario = result.scenarios[0];

      scenario.careerStates.forEach((state, index) => {
        expect(state.nodeId).toBe(mockInput.basePath.nodes[index].id);
        expect(state.name).toBe(mockInput.basePath.nodes[index].name);
        expect(state.type).toBeDefined();
        expect(state.year).toBeGreaterThanOrEqual(2024);
      });
    });

    it('should assign appropriate seniority levels', () => {
      const result = generator.generateScenarios(mockInput);

      result.scenarios.forEach(scenario => {
        scenario.careerStates.forEach(state => {
          expect(['entry', 'junior', 'mid', 'senior', 'leadership']).toContain(state.seniority);
        });
      });
    });

    it('should include skills acquired in each state', () => {
      const result = generator.generateScenarios(mockInput);

      result.scenarios.forEach(scenario => {
        scenario.careerStates.forEach(state => {
          expect(Array.isArray(state.skillsAcquired)).toBe(true);
        });
      });
    });
  });

  describe('Education States', () => {
    it('should generate education states for education nodes', () => {
      const result = generator.generateScenarios(mockInput);

      result.scenarios.forEach(scenario => {
        // Should have at least one education state (B.Tech)
        expect(scenario.educationStates.length).toBeGreaterThan(0);
      });
    });

    it('should include correct education details', () => {
      const result = generator.generateScenarios(mockInput);

      result.scenarios.forEach(scenario => {
        scenario.educationStates.forEach(state => {
          expect(state.id).toBeDefined();
          expect(state.name).toBeDefined();
          expect(state.type).toBeDefined();
          expect(state.startYear).toBeGreaterThanOrEqual(2024);
          expect(state.endYear).toBeGreaterThan(state.startYear);
          expect(state.status).toBe('completed');
          expect(state.outcome).toBeDefined();
          expect(state.cost).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });

  describe('Milestones', () => {
    it('should generate milestones for each scenario', () => {
      const result = generator.generateScenarios(mockInput);

      result.scenarios.forEach(scenario => {
        expect(scenario.milestones.length).toBeGreaterThan(0);
      });
    });

    it('should include milestone details', () => {
      const result = generator.generateScenarios(mockInput);

      result.scenarios.forEach(scenario => {
        scenario.milestones.forEach(milestone => {
          expect(milestone.id).toBeDefined();
          expect(milestone.name).toBeDefined();
          expect(milestone.description).toBeDefined();
          expect(milestone.year).toBeGreaterThanOrEqual(2024);
          expect(milestone.type).toBeDefined();
          expect(milestone.impact).toBeDefined();
          expect(Array.isArray(milestone.conditions)).toBe(true);
        });
      });
    });

    it('should sort milestones by year', () => {
      const result = generator.generateScenarios(mockInput);

      result.scenarios.forEach(scenario => {
        for (let i = 1; i < scenario.milestones.length; i++) {
          expect(scenario.milestones[i].year).toBeGreaterThanOrEqual(scenario.milestones[i - 1].year);
        }
      });
    });
  });

  describe('Income Trajectory', () => {
    it('should generate income trajectory for all years', () => {
      const result = generator.generateScenarios(mockInput);

      result.scenarios.forEach(scenario => {
        expect(scenario.incomeTrajectory.length).toBe(10); // 10 years
      });
    });

    it('should include income details for each year', () => {
      const result = generator.generateScenarios(mockInput);

      result.scenarios.forEach(scenario => {
        scenario.incomeTrajectory.forEach((point, index) => {
          expect(point.year).toBe(2024 + index);
          expect(point.annualIncome).toBeGreaterThan(0);
          expect(point.monthlyIncome).toBeGreaterThan(0);
          expect(point.monthlyIncome).toBe(Math.round(point.annualIncome / 12));
          expect(point.growthRate).toBeDefined();
          expect(point.sources.primary).toBe(point.annualIncome);
        });
      });
    });

    it('should have different income levels by scenario type', () => {
      const result = generator.generateScenarios(mockInput);

      const bestCase = result.scenarios.find(s => s.type === 'best-case');
      const conservative = result.scenarios.find(s => s.type === 'conservative');

      expect(bestCase).toBeDefined();
      expect(conservative).toBeDefined();

      // Best case should have higher income than conservative
      const bestIncome = bestCase!.incomeTrajectory[5].annualIncome;
      const conservativeIncome = conservative!.incomeTrajectory[5].annualIncome;
      expect(bestIncome).toBeGreaterThan(conservativeIncome);
    });

    it('should show income growth over time', () => {
      const result = generator.generateScenarios(mockInput);

      result.scenarios.forEach(scenario => {
        const earlyIncome = scenario.incomeTrajectory[0].annualIncome;
        const lateIncome = scenario.incomeTrajectory[9].annualIncome;
        expect(lateIncome).toBeGreaterThan(earlyIncome);
      });
    });
  });

  describe('Flexibility Trajectory', () => {
    it('should generate flexibility trajectory for all years', () => {
      const result = generator.generateScenarios(mockInput);

      result.scenarios.forEach(scenario => {
        expect(scenario.flexibilityTrajectory.length).toBe(10);
      });
    });

    it('should include flexibility details', () => {
      const result = generator.generateScenarios(mockInput);

      result.scenarios.forEach(scenario => {
        scenario.flexibilityTrajectory.forEach((point, index) => {
          expect(point.year).toBe(2024 + index);
          expect(point.optionalityScore).toBeGreaterThanOrEqual(0);
          expect(point.optionalityScore).toBeLessThanOrEqual(100);
          expect(point.reachableOptions).toBeGreaterThanOrEqual(0);
          expect(point.pivotPotential).toBeGreaterThanOrEqual(0);
          expect(point.pivotPotential).toBeLessThanOrEqual(100);
          expect(point.skillTransferability).toBeGreaterThanOrEqual(0);
          expect(point.skillTransferability).toBeLessThanOrEqual(100);
        });
      });
    });

    it('should show flexibility decay over time', () => {
      const result = generator.generateScenarios(mockInput);

      result.scenarios.forEach(scenario => {
        const earlyFlexibility = scenario.flexibilityTrajectory[0].optionalityScore;
        const lateFlexibility = scenario.flexibilityTrajectory[9].optionalityScore;
        // Flexibility generally decreases as career progresses
        expect(lateFlexibility).toBeLessThanOrEqual(earlyFlexibility + 10); // Allow small variance
      });
    });
  });

  describe('Scenario Metrics', () => {
    it('should calculate total income', () => {
      const result = generator.generateScenarios(mockInput);

      result.scenarios.forEach(scenario => {
        expect(scenario.metrics.totalIncome).toBeGreaterThan(0);
        // Total should be sum of annual incomes
        const calculatedTotal = scenario.incomeTrajectory.reduce((sum, p) => sum + p.annualIncome, 0);
        expect(scenario.metrics.totalIncome).toBe(calculatedTotal);
      });
    });

    it('should calculate peak income', () => {
      const result = generator.generateScenarios(mockInput);

      result.scenarios.forEach(scenario => {
        expect(scenario.metrics.peakIncome).toBeGreaterThan(0);
        const calculatedPeak = Math.max(...scenario.incomeTrajectory.map(p => p.annualIncome));
        expect(scenario.metrics.peakIncome).toBe(calculatedPeak);
      });
    });

    it('should calculate average income', () => {
      const result = generator.generateScenarios(mockInput);

      result.scenarios.forEach(scenario => {
        expect(scenario.metrics.averageIncome).toBeGreaterThan(0);
        const calculatedAverage = Math.round(scenario.metrics.totalIncome / scenario.incomeTrajectory.length);
        expect(scenario.metrics.averageIncome).toBe(calculatedAverage);
      });
    });

    it('should include final optionality', () => {
      const result = generator.generateScenarios(mockInput);

      result.scenarios.forEach(scenario => {
        expect(scenario.metrics.finalOptionality).toBeGreaterThanOrEqual(0);
        expect(scenario.metrics.finalOptionality).toBeLessThanOrEqual(100);
      });
    });

    it('should include average flexibility', () => {
      const result = generator.generateScenarios(mockInput);

      result.scenarios.forEach(scenario => {
        expect(scenario.metrics.averageFlexibility).toBeGreaterThanOrEqual(0);
        expect(scenario.metrics.averageFlexibility).toBeLessThanOrEqual(100);
      });
    });

    it('should count transitions', () => {
      const result = generator.generateScenarios(mockInput);

      result.scenarios.forEach(scenario => {
        expect(scenario.metrics.transitionCount).toBeGreaterThanOrEqual(0);
      });
    });

    it('should include education completion rate', () => {
      const result = generator.generateScenarios(mockInput);

      result.scenarios.forEach(scenario => {
        expect(scenario.metrics.educationCompletionRate).toBeGreaterThanOrEqual(0);
        expect(scenario.metrics.educationCompletionRate).toBeLessThanOrEqual(1);
      });
    });

    it('should include probability score', () => {
      const result = generator.generateScenarios(mockInput);

      result.scenarios.forEach(scenario => {
        expect(scenario.metrics.probability).toBeGreaterThan(0);
        expect(scenario.metrics.probability).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Scenario Assumptions', () => {
    it('should include assumptions for each scenario', () => {
      const result = generator.generateScenarios(mockInput);

      result.scenarios.forEach(scenario => {
        expect(scenario.assumptions.performanceLevel).toBeDefined();
        expect(scenario.assumptions.marketConditions).toBeDefined();
        expect(scenario.assumptions.familySupport).toBeDefined();
        expect(scenario.assumptions.financialConstraint).toBeDefined();
        expect(scenario.assumptions.riskTolerance).toBeDefined();
        expect(scenario.assumptions.externalOpportunities).toBeDefined();
      });
    });

    it('should have different assumptions by scenario type', () => {
      const result = generator.generateScenarios(mockInput);

      const bestCase = result.scenarios.find(s => s.type === 'best-case');
      const conservative = result.scenarios.find(s => s.type === 'conservative');

      expect(bestCase!.assumptions.performanceLevel).toBe('exceptional');
      expect(conservative!.assumptions.performanceLevel).toBe('average');
    });
  });

  describe('Risk Factors', () => {
    it('should generate risk factors for each scenario', () => {
      const result = generator.generateScenarios(mockInput);

      result.scenarios.forEach(scenario => {
        expect(scenario.riskFactors.length).toBeGreaterThan(0);
      });
    });

    it('should include risk factor details', () => {
      const result = generator.generateScenarios(mockInput);

      result.scenarios.forEach(scenario => {
        scenario.riskFactors.forEach(risk => {
          expect(risk.id).toBeDefined();
          expect(risk.name).toBeDefined();
          expect(risk.description).toBeDefined();
          expect(risk.category).toBeDefined();
          expect(risk.probability).toBeGreaterThanOrEqual(0);
          expect(risk.probability).toBeLessThanOrEqual(100);
          expect(risk.impact).toBeGreaterThanOrEqual(0);
          expect(risk.impact).toBeLessThanOrEqual(100);
          expect(risk.riskScore).toBeGreaterThanOrEqual(0);
          expect(typeof risk.isMitigated).toBe('boolean');
          expect(Array.isArray(risk.mitigations)).toBe(true);
        });
      });
    });

    it('should have different risk profiles by scenario type', () => {
      const result = generator.generateScenarios(mockInput);

      const highRisk = result.scenarios.find(s => s.type === 'high-risk');
      const conservative = result.scenarios.find(s => s.type === 'conservative');

      const highRiskTotal = highRisk!.riskFactors.reduce((sum, r) => sum + r.riskScore, 0);
      const conservativeTotal = conservative!.riskFactors.reduce((sum, r) => sum + r.riskScore, 0);

      expect(highRiskTotal).toBeGreaterThan(conservativeTotal);
    });
  });

  describe('Scenario Comparison', () => {
    it('should include comparison in result', () => {
      const result = generator.generateScenarios(mockInput);

      expect(result.comparison).toBeDefined();
      expect(result.comparison.income).toBeDefined();
      expect(result.comparison.flexibility).toBeDefined();
      expect(result.comparison.risk).toBeDefined();
      expect(result.comparison.probability).toBeDefined();
      expect(result.comparison.recommended).toBeDefined();
      expect(result.comparison.recommendationReason).toBeDefined();
    });

    it('should identify highest and lowest income scenarios', () => {
      const result = generator.generateScenarios(mockInput);

      expect(result.comparison.income.highest).toBeDefined();
      expect(result.comparison.income.lowest).toBeDefined();
      expect(result.comparison.income.mostStable).toBeDefined();
    });

    it('should identify highest and lowest flexibility scenarios', () => {
      const result = generator.generateScenarios(mockInput);

      expect(result.comparison.flexibility.highest).toBeDefined();
      expect(result.comparison.flexibility.lowest).toBeDefined();
    });

    it('should identify highest and lowest risk scenarios', () => {
      const result = generator.generateScenarios(mockInput);

      expect(result.comparison.risk.highest).toBeDefined();
      expect(result.comparison.risk.lowest).toBeDefined();
    });

    it('should identify highest and lowest probability scenarios', () => {
      const result = generator.generateScenarios(mockInput);

      expect(result.comparison.probability.highest).toBeDefined();
      expect(result.comparison.probability.lowest).toBeDefined();
    });

    it('should provide a recommendation', () => {
      const result = generator.generateScenarios(mockInput);

      expect(['best-case', 'expected', 'conservative', 'high-risk']).toContain(result.comparison.recommended);
      expect(result.comparison.recommendationReason.length).toBeGreaterThan(0);
    });
  });

  describe('Scenario Names and Descriptions', () => {
    it('should have appropriate names for each scenario type', () => {
      const result = generator.generateScenarios(mockInput);

      const bestCase = result.scenarios.find(s => s.type === 'best-case');
      expect(bestCase!.name).toContain('Best Case');

      const expected = result.scenarios.find(s => s.type === 'expected');
      expect(expected!.name).toContain('Expected');

      const conservative = result.scenarios.find(s => s.type === 'conservative');
      expect(conservative!.name).toContain('Conservative');

      const highRisk = result.scenarios.find(s => s.type === 'high-risk');
      expect(highRisk!.name).toContain('High-Risk');
    });

    it('should have descriptions for each scenario', () => {
      const result = generator.generateScenarios(mockInput);

      result.scenarios.forEach(scenario => {
        expect(scenario.description.length).toBeGreaterThan(20);
      });
    });
  });

  describe('Convenience Function', () => {
    it('should generate scenarios using convenience function', () => {
      const result = generateFutureScenarios(mockInput);

      expect(result.scenarios).toHaveLength(4);
      expect(result.basePathId).toBe(mockInput.basePath.id);
    });
  });

  describe('Edge Cases', () => {
    it('should handle paths with single node', () => {
      const singleNodePath: ExploredCareerPath = {
        ...createMockExploredCareerPath(),
        nodes: [createMockCareerNode('single', 'Single Node', 'career')],
        edges: [],
        nodeIds: ['single'],
      };

      const input = {
        ...mockInput,
        basePath: singleNodePath,
      };

      const result = generator.generateScenarios(input);
      expect(result.scenarios).toHaveLength(4);
    });

    it('should handle paths without education nodes', () => {
      const noEducationPath: ExploredCareerPath = {
        ...createMockExploredCareerPath(),
        nodes: [
          createMockCareerNode('job1', 'Job 1', 'job'),
          createMockCareerNode('job2', 'Job 2', 'job'),
        ],
        edges: [createMockCareerEdge('job1', 'job2')],
        nodeIds: ['job1', 'job2'],
      };

      const input = {
        ...mockInput,
        basePath: noEducationPath,
      };

      const result = generator.generateScenarios(input);
      expect(result.scenarios).toHaveLength(4);
      // Education states should be empty or minimal
      result.scenarios.forEach(scenario => {
        expect(scenario.educationStates.length).toBe(0);
      });
    });

    it('should handle missing coalition analysis', () => {
      const inputWithoutCoalition = {
        ...mockInput,
        coalitionAnalysis: undefined,
      };

      const result = generator.generateScenarios(inputWithoutCoalition);
      expect(result.scenarios).toHaveLength(4);
    });

    it('should handle different durations', () => {
      const input5Year = {
        ...mockInput,
        duration: 5,
      };

      const result = generator.generateScenarios(input5Year);
      result.scenarios.forEach(scenario => {
        expect(scenario.incomeTrajectory.length).toBe(5);
        expect(scenario.flexibilityTrajectory.length).toBe(5);
      });
    });

    it('should handle long durations', () => {
      const input20Year = {
        ...mockInput,
        duration: 20,
      };

      const result = generator.generateScenarios(input20Year);
      result.scenarios.forEach(scenario => {
        expect(scenario.incomeTrajectory.length).toBe(20);
        expect(scenario.flexibilityTrajectory.length).toBe(20);
      });
    });
  });

  describe('Deterministic Behavior', () => {
    it('should produce consistent results for same input', () => {
      const result1 = generator.generateScenarios(mockInput);
      const result2 = generator.generateScenarios(mockInput);

      // Same number of scenarios
      expect(result1.scenarios.length).toBe(result2.scenarios.length);

      // Same scenario types
      const types1 = result1.scenarios.map(s => s.type).sort();
      const types2 = result2.scenarios.map(s => s.type).sort();
      expect(types1).toEqual(types2);
    });
  });

  describe('Default Configuration', () => {
    it('should have valid default config', () => {
      expect(DEFAULT_SCENARIO_CONFIG.incomeGrowthRates['best-case']).toBe(0.15);
      expect(DEFAULT_SCENARIO_CONFIG.incomeGrowthRates['expected']).toBe(0.08);
      expect(DEFAULT_SCENARIO_CONFIG.incomeGrowthRates['conservative']).toBe(0.05);
      expect(DEFAULT_SCENARIO_CONFIG.incomeGrowthRates['high-risk']).toBe(0.12);

      expect(DEFAULT_SCENARIO_CONFIG.performanceMultipliers['best-case']).toBe(1.3);
      expect(DEFAULT_SCENARIO_CONFIG.performanceMultipliers['expected']).toBe(1.0);
    });
  });
});
