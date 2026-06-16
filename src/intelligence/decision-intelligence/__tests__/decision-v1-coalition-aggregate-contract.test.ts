import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DecisionIntelligenceEngineV1 } from '../DecisionIntelligenceEngineV1';
import type { StudentBeliefV3 } from '../../types';
import type { CareerPathExplorerResult, ExploredCareerPath } from '../../path-explorer';
import type { RegretAnalysis } from '../../regret-functional';
import type { DecisionCoalitionAnalysis, PathCoalitionAnalysis } from '../../decision-coalition-v3';
import type { CareerTransitionGraphV1 } from '../../career-transition-graph';
import { DEFAULT_CANARY_SHADOW_CONFIG } from '../../orchestrator/rollout/CanaryShadowConfig';
import { DEFAULT_DEPLOYED_ROUTE_SHADOW_CONFIG } from '../../orchestrator/rollout/route-shadow-deployed/DeployedRouteShadowConfig';

const canonicalAggregate = {
  coalitionSupport: 80,
  coalitionConflict: 10,
  alignmentScore: 75,
  tensionScore: 15,
  stabilityScore: 80,
} satisfies PathCoalitionAnalysis['aggregate'];

function createPath(overrides: Partial<ExploredCareerPath> = {}): ExploredCareerPath {
  return {
    id: 'path-1',
    type: 'primary',
    name: 'Canonical Coalition Path',
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
      growthScore: 50,
      stabilityScore: 80,
      compositeScore: 50,
    },
    risk: { level: 'low', score: 10, factors: [], mitigations: [] },
    explanation: {
      summary: 'Canonical path',
      details: 'Canonical path details',
      selectionReason: 'Coalition stability',
      strengths: [],
      tradeoffs: [],
      preservedOptions: [],
      closedOptions: [],
    },
    recommendations: [],
    ...overrides,
  } as ExploredCareerPath;
}

function createStudentBelief(): StudentBeliefV3 {
  return {
    id: 'belief-1',
    studentId: 'student-1',
    version: 3,
    timestamp: Date.now(),
    motivations: [],
    strengths: [],
    values: [],
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

function createPathExplorerResult(path: ExploredCareerPath): CareerPathExplorerResult {
  return {
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
}

function createCoalitionAnalysis(
  studentBelief: StudentBeliefV3,
  pathExplorerResult: CareerPathExplorerResult
): DecisionCoalitionAnalysis {
  const pathAnalysis: PathCoalitionAnalysis = {
    pathId: 'path-1',
    pathType: 'primary',
    pathName: 'Canonical Coalition Path',
    memberEvaluations: new Map(),
    aggregate: canonicalAggregate,
    dynamics: {
      strongSupport: [],
      reservations: [],
      opposition: [],
      memberConflicts: [],
      consensusLevel: 'strong',
    },
    explanation: {
      summary: 'Canonical V3 coalition aggregate',
      details: 'Canonical V3 coalition aggregate details',
      reasoning: 'Uses stabilityScore',
      coalitionStrengths: [],
      coalitionConflicts: [],
      recommendedNegotiations: [],
      alternativeConsiderations: [],
    },
  };

  return {
    id: 'coalition-1',
    studentBelief,
    pathExplorerResult,
    pathAnalyses: new Map([[pathAnalysis.pathId, pathAnalysis]]),
    rankedPaths: [pathAnalysis],
    coalitionHealth: {
      cohesion: 80,
      conflictLevel: 10,
      clarity: 80,
      confidence: 0.8,
    },
    pathComparison: null,
    recommendation: {
      recommendedPathId: pathAnalysis.pathId,
      recommendedPathType: pathAnalysis.pathType,
      confidence: 0.8,
      reasoning: 'Canonical V3 aggregate is stable',
      supportingMembers: [],
      opposingMembers: [],
      successConditions: [],
      riskMitigation: [],
    },
    generatedAt: Date.now(),
  };
}

function createEngine(): DecisionIntelligenceEngineV1 {
  const studentBelief = createStudentBelief();
  const path = createPath();
  const pathExplorerResult = createPathExplorerResult(path);
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

  return new DecisionIntelligenceEngineV1(
    studentBelief,
    pathExplorerResult,
    regretAnalysis,
    createCoalitionAnalysis(studentBelief, pathExplorerResult),
    {} as CareerTransitionGraphV1
  );
}

describe('DecisionIntelligenceEngineV1 coalition aggregate contract', () => {
  it('imports successfully', () => {
    expect(DecisionIntelligenceEngineV1).toBeDefined();
  });

  it('recognizes the V3 coalition aggregate shape as canonical', () => {
    expect(Object.keys(canonicalAggregate).sort()).toEqual([
      'alignmentScore',
      'coalitionConflict',
      'coalitionSupport',
      'stabilityScore',
      'tensionScore',
    ]);
  });

  it('does not read nonexistent legacy aggregate fields directly', () => {
    const source = readFileSync(
      'src/intelligence/decision-intelligence/DecisionIntelligenceEngineV1.ts',
      'utf8'
    );

    expect(source).not.toContain('aggregate.weightedAgreement');
    expect(source).not.toContain('aggregate.overallStability');
    expect(source).not.toContain('coalitionAnalysis?.aggregate.overallConfidence');
    expect(source).not.toContain('aggregate.conflictCount');
    expect(source).not.toContain('aggregate.criticalConflictCount');
  });

  it('keeps the coalition result shape stable for Decision V1 scoring', () => {
    const output = createEngine().generate();
    const score = output.pathScores.get('path-1');

    expect(score).toBeDefined();
    expect(score?.coalition).toBe(80);
  });

  it('valid decision analysis still works with canonical V3 coalition aggregate', () => {
    const output = createEngine().generate();

    expect(output.recommendation.pathId).toBe('path-1');
    expect(output.rankedPathIds).toEqual(['path-1']);
    expect(output.confidence.coalition).toBe(0.8);
  });

  it('keeps live routing and raw payload capture disabled by default', () => {
    expect(DEFAULT_CANARY_SHADOW_CONFIG.globalShadowEnabled).toBe(false);
    expect(DEFAULT_CANARY_SHADOW_CONFIG.sampleRate).toBe(0);
    expect(DEFAULT_DEPLOYED_ROUTE_SHADOW_CONFIG.allowLiveRouting).toBe(false);
    expect(DEFAULT_DEPLOYED_ROUTE_SHADOW_CONFIG.allowOutputReplacement).toBe(false);
    expect(DEFAULT_DEPLOYED_ROUTE_SHADOW_CONFIG.captureRawPayloads).toBe(false);
  });
});
