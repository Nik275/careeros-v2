/**
 * CareerOS Archetype Confidence Engine - Calculator
 *
 * Local confidence calculator used by the deprecated ArchetypeConfidenceEngine.
 * It preserves the synchronous API expected by archetype-confidence-engine.ts.
 */

import type { ArchetypeType } from '@/types/archetype-profile';
import type { ArchetypeSignal, SignalSource } from './archetype-types';
import type {
  CompletenessAnalysis,
  ConfidenceCalculationInput,
  ConfidenceCalculationResult,
  CoverageAnalysis,
} from './confidence-types';
import { ALL_ARCHETYPE_TYPES } from '@/types/archetype-profile';
import { ALL_SIGNAL_SOURCES } from './confidence-types';

export class ConfidenceCalculator {
  calculate(input: ConfidenceCalculationInput): ConfidenceCalculationResult {
    try {
      const coverage = this.analyzeCoverage(input.signals);
      const completeness = this.analyzeCompleteness(input.assessmentReliability);
      const evidenceScore = this.calculateEvidenceScore(input.signals);
      const separationScore = this.calculateSeparationScore(input);
      const consistencyScore = this.calculateConsistencyScore(input.signals);
      const stabilityScore = this.calculateStabilityScore(separationScore, consistencyScore);
      const confidenceScore = clampScore(
        Math.round(
          input.profileReliability * 0.25 +
            evidenceScore * 0.25 +
            coverage.coverageScore * 0.15 +
            consistencyScore * 0.15 +
            separationScore * 0.1 +
            completeness.completenessScore * 0.1
        )
      );

      return {
        success: true,
        confidence: {
          confidenceScore,
          confidence: confidenceScore / 100,
          stabilityScore,
          evidenceScore,
          coverageScore: coverage.coverageScore,
          consistencyScore,
          separationScore,
          completenessScore: completeness.completenessScore,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Archetype confidence calculation failed.',
      };
    }
  }

  analyzeCoverage(signals: ArchetypeSignal[]): CoverageAnalysis {
    const archetypesWithSignals = new Set(signals.map((signal) => signal.archetype));
    const sourcesWithData = [...new Set(signals.map((signal) => signal.source))];
    const missingSources = ALL_SIGNAL_SOURCES.filter((source) => !sourcesWithData.includes(source));
    const coverageScore = clampScore(Math.round((archetypesWithSignals.size / ALL_ARCHETYPE_TYPES.length) * 100));

    return {
      coverageScore,
      archetypesWithSignals: archetypesWithSignals.size,
      totalArchetypes: ALL_ARCHETYPE_TYPES.length,
      sourcesWithData,
      missingSources,
      gaps: missingSources.map((source) => ({
        missing: source,
        impact: Math.round(100 / ALL_SIGNAL_SOURCES.length),
        recommendation: `Collect ${source.toLowerCase().replace(/_/g, ' ')} evidence`,
      })),
    };
  }

  analyzeCompleteness(assessmentReliability: Record<string, number>): CompletenessAnalysis {
    const expectedAssessments = ['cognitive', 'interest', 'values', 'behavioral'];
    const completedAssessments = expectedAssessments.filter((assessment) => assessmentReliability[assessment] !== undefined);
    const missingAssessments = expectedAssessments.filter((assessment) => !completedAssessments.includes(assessment));
    const completenessScore = clampScore(Math.round((completedAssessments.length / expectedAssessments.length) * 100));

    return {
      completenessScore,
      completedAssessments,
      missingAssessments,
      profileSectionsComplete: completedAssessments.length,
      profileSectionsTotal: expectedAssessments.length,
    };
  }

  private calculateEvidenceScore(signals: ArchetypeSignal[]): number {
    if (signals.length === 0) return 0;
    const averageStrength = signals.reduce((sum, signal) => sum + signal.strength, 0) / signals.length;
    const sourceDiversity = new Set(signals.map((signal) => signal.source)).size;
    return clampScore(Math.round(averageStrength * 0.8 + Math.min(20, sourceDiversity * 3)));
  }

  private calculateSeparationScore(input: ConfidenceCalculationInput): number {
    const sorted = [...input.archetypeScores].sort((a, b) => b.score - a.score);
    const primary = sorted.find((score) => score.archetype === input.primaryArchetype) ?? sorted[0];
    const secondary = input.secondaryArchetype
      ? sorted.find((score) => score.archetype === input.secondaryArchetype)
      : sorted.find((score) => score.archetype !== primary?.archetype);
    if (!primary || !secondary) return 100;
    return clampScore(primary.score - secondary.score + 50);
  }

  private calculateConsistencyScore(signals: ArchetypeSignal[]): number {
    if (signals.length === 0) return 0;
    const byArchetype = new Map<ArchetypeType, number>();
    for (const signal of signals) byArchetype.set(signal.archetype, (byArchetype.get(signal.archetype) ?? 0) + signal.strength);
    const totals = [...byArchetype.values()];
    const max = Math.max(...totals);
    const total = totals.reduce((sum, value) => sum + value, 0);
    return clampScore(Math.round((max / Math.max(1, total)) * 100));
  }

  private calculateStabilityScore(separationScore: number, consistencyScore: number): number {
    return clampScore(Math.round(separationScore * 0.55 + consistencyScore * 0.45));
  }
}

export function createConfidenceCalculator(): ConfidenceCalculator {
  return new ConfidenceCalculator();
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, value));
}
