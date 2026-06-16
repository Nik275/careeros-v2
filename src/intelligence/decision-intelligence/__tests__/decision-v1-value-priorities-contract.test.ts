import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DecisionIntelligenceEngineV1 } from '../DecisionIntelligenceEngineV1';
import type { StudentBeliefV3 } from '../../types';
import type { CareerPathExplorerResult, ExploredCareerPath } from '../../path-explorer';
import type { RegretAnalysis } from '../../regret-functional';
import type { DecisionCoalitionAnalysis } from '../../decision-coalition-v3';
import type { CareerTransitionGraphV1 } from '../../career-transition-graph';

function createPath(overrides: Partial<ExploredCareerPath> = {}): ExploredCareerPath {
  return {
    id: 'path-1',
    type: 'primary',
    name: 'Stable Path',
    nodes: [],
    edges: [],
    nodeIds: [],
    metrics: {
      totalYears: 1,
      transitionCount: 1,
      incomeRange: { entry: 1, mid: 1, senior: 1, growthRate: 1 },
      totalDifficulty: 10,
      avgTransitionTime: 2,
      cumulativeSuccessProbability: 0.8,
      minReversibility: 0.8,
      avgSkillOverlap: 0.8,
    },
    scores: {
      optionalityScore: 50,
      criticalityScore: 50,
      flexibilityScore: 50,
      growthScore: 10,
      stabilityScore: 100,
      compositeScore: 10,
    },
    risk: { level: 'low', score: 10, factors: [], mitigations: [] },
    explanation: {
      summary: 'Stable path',
      details: 'Stable path details',
      selectionReason: 'Stability',
      strengths: [],
      tradeoffs: [],
      preservedOptions: [],
      closedOptions: [],
    },
    recommendations: [],
    ...overrides,
  } as ExploredCareerPath;
}

function createStudentBelief(values: StudentBeliefV3['values']): StudentBeliefV3 {
  return {
    id: 'belief-1',
    studentId: 'student-1',
    version: 3,
    timestamp: Date.now(),
    motivations: [],
    strengths: [],
    values,
    personalityTraits: [],
    lifestylePreferences: [],
    constraints: [],
    familyReality: {},
    economicReality: {},
    educationalReality: {},
    decisionState: {},
    overallConfidence: 0.8,
    isValidated: true,
    metadata: {
      assessmentQuestionCount: 0,
      inferenceStepCount: 0,
      contributingEngines: [],
      assessmentDuration: 0,
    },
  } as unknown as StudentBeliefV3;
}

function createEngine(studentBelief: StudentBeliefV3): DecisionIntelligenceEngineV1 {
  const path = createPath();
  const pathExplorerResult = {
    id: 'explorer-1',
    startingCareer: {} as CareerPathExplorerResult['startingCareer'],
    startingCareerId: 'career-1',
    paths: [path],
    pathsByType: new Map([[path.type, path]]),
    comparison: {
      bestForGrowth: 'high-growth',
      bestForOptionality: 'high-optionality',
      bestForStability: 'balanced',
      safestPath: 'low-risk',
      riskiestPath: 'high-growth',
      comparisonText: '',
      keyDifferences: [],
    },
    recommendations: [],
    generatedAt: Date.now(),
  } as CareerPathExplorerResult;

  const regretAnalysis = {
    id: 'regret-1',
    studentBelief,
    pathExplorerResult,
    pathAnalyses: new Map(),
    rankedPaths: [],
    overallProfile: {
      averageRegret: 0,
      regretVariance: 0,
      dominantRegretType: null,
      overallRisk: 'low',
    },
    pathComparison: null,
    generatedAt: Date.now(),
  } as RegretAnalysis;

  const coalitionAnalysis = {
    id: 'coalition-1',
    studentBelief,
    pathExplorerResult,
    pathAnalyses: new Map(),
    rankedPaths: [],
    coalitionHealth: {
      cohesion: 80,
      conflictLevel: 10,
      clarity: 80,
      confidence: 0.8,
    },
    pathComparison: null,
    recommendation: {
      recommendedPathId: path.id,
      recommendedPathType: path.type,
      confidence: 0.8,
      reasoning: 'Stable path',
      supportingMembers: [],
      opposingMembers: [],
      successConditions: [],
      riskMitigation: [],
    },
    generatedAt: Date.now(),
  } as DecisionCoalitionAnalysis;

  return new DecisionIntelligenceEngineV1(
    studentBelief,
    pathExplorerResult,
    regretAnalysis,
    coalitionAnalysis,
    {} as CareerTransitionGraphV1
  );
}

describe('DecisionIntelligenceEngineV1 value priorities contract', () => {
  it('does not access valuePriorities through canonical StudentBeliefV3.values', () => {
    const source = readFileSync(
      'src/intelligence/decision-intelligence/DecisionIntelligenceEngineV1.ts',
      'utf8'
    );

    expect(source).not.toContain('this.studentBelief.values?.valuePriorities');
    expect(source).not.toContain('this.studentBelief.values.valuePriorities');
  });

  it('reads stability preference from canonical Value.importance', () => {
    const output = createEngine(createStudentBelief([
      {
        id: 'value_stability',
        name: 'Stability',
        description: 'Preference for stable career outcomes',
        importance: 1,
        evidence: [],
        isNonNegotiable: true,
      },
    ])).generate();

    expect(output.pathScores.get('path-1')?.psychologicalFit).toBe(75);
  });

  it('keeps the existing fallback when stability is absent from canonical values', () => {
    const output = createEngine(createStudentBelief([])).generate();

    expect(output.pathScores.get('path-1')?.psychologicalFit).toBe(65);
  });
});
