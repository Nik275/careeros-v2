import { describe, expect, it } from 'vitest';
import { ConsistencyEngine } from '../ConsistencyEngine';
import type { IntelligenceResults } from '../types';
import type { OptionalityAnalysis } from '../../optionality-engine';
import type { CriticalityAnalysis } from '../../criticality-engine';

describe('Phase 6.6.R optionality-criticality target regression', () => {
  it('uses criticality careerId when optionality analysis has no source careerId', () => {
    const engine = new ConsistencyEngine();
    const results: IntelligenceResults = {
      optionality: optionalityAnalysis(82),
      criticality: criticalityAnalysis('career-1', 81),
    };

    const report = engine.validate(results);
    const violation = report.violations.find((entry) =>
      entry.involvedEngines.includes('optionality') && entry.involvedEngines.includes('criticality')
    );

    expect(violation?.targetId).toBe('career-1');
  });
});

function optionalityAnalysis(score: number): OptionalityAnalysis {
  return {
    overallScore: score,
    rating: 'high',
    dimensions: {
      careerFlexibility: dimension(score),
      transferableSkills: dimension(score),
      pivotPotential: dimension(score),
      entrepreneurshipPotential: dimension(score),
      futureCareerOptions: dimension(score),
    },
    summary: 'High optionality fixture',
    reasoning: ['Fixture reasoning'],
    adjacentCareers: [],
    skillCategories: [],
    percentile: 80,
    calculatedAt: Date.now(),
  };
}

function criticalityAnalysis(careerId: string, score: number): CriticalityAnalysis {
  return {
    id: `criticality-${careerId}`,
    careerId,
    careerName: 'Career Fixture',
    criticalityScore: score,
    category: 'high',
    summary: 'High criticality fixture',
    explanation: 'Fixture explanation',
    metrics: {
      reachableCareerCount: metric(4),
      branchingFactor: metric(2),
      reversibility: metric(0.2),
      transferability: metric(0.4),
      timeToFlexibility: metric(5),
      optionalityPreservation: metric(0.2),
      futureConstraint: metric(0.8),
    },
    reachableCareers: {
      total: 4,
      byCategory: new Map(),
      topPaths: [],
    },
    constraints: {
      inaccessibleCareers: [],
      minimumCommitmentYears: 0,
      financialCommitment: 0,
      educationRequirements: [],
    },
    comparison: {
      percentile: 75,
      vsCategoryAverage: 10,
      categorySize: 20,
    },
    calculatedAt: Date.now(),
  };
}

function dimension(score: number) {
  return {
    name: 'fixture',
    score: score / 100,
    explanation: 'Fixture dimension',
    factors: [],
  };
}

function metric(value: number) {
  return {
    value,
    explanation: 'Fixture metric',
    impact: 'high' as const,
    isPositive: true,
  };
}
