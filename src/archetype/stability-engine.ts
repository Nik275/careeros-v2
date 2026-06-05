/**
 * CareerOS Archetype Confidence Engine - Stability Engine
 *
 * Phase 1.3: Archetype Confidence Engine
 *
 * Estimates stability of archetype assignments.
 *
 * @module stability-engine
 * @version 1.0.0
 */

import type { ArchetypeType, ArchetypeScore } from '@/types/archetype-profile';
import type {
  StabilityAnalysis,
  RobustnessIndicator,
  VulnerabilityFactor,
  ChangeScenario,
  SeparationAnalysis,
  ConsistencyAnalysis,
  ArchetypeSignal,
} from './confidence-types';
import { SEPARATION_THRESHOLDS } from './confidence-types';

/**
 * Stability Engine for analyzing archetype assignment stability.
 */
export class StabilityEngine {
  /**
   * Analyzes stability of archetype assignment.
   *
   * @param primary - Primary archetype
   * @param secondary - Secondary archetype
   * @param scores - All archetype scores
   * @param signals - Assessment signals
   * @returns Stability analysis
   */
  analyzeStability(
    primary: ArchetypeType,
    secondary: ArchetypeType | undefined,
    scores: ArchetypeScore[],
    signals: ArchetypeSignal[]
  ): StabilityAnalysis {
    const sensitivityScore = this.calculateSensitivity(scores, signals);
    const robustnessIndicators = this.identifyRobustnessIndicators(scores, signals);
    const vulnerabilityFactors = this.identifyVulnerabilities(scores, signals);
    const confidenceInterval = this.calculateConfidenceInterval(primary, scores);
    const changeScenarios = this.identifyChangeScenarios(primary, secondary, scores);

    // Stability is inverse of sensitivity, boosted by robustness
    const stabilityScore = Math.round(
      100 - sensitivityScore * 0.7 + robustnessIndicators.length * 5
    );

    return {
      stabilityScore: Math.min(100, Math.max(0, stabilityScore)),
      sensitivityScore,
      robustnessIndicators,
      vulnerabilityFactors,
      confidenceInterval,
      changeScenarios,
    };
  }

  /**
   * Calculates sensitivity score.
   *
   * How much would small input changes affect results?
   *
   * @param scores - Archetype scores
   * @param signals - Assessment signals
   * @returns Sensitivity score (0-100), lower is better
   */
  private calculateSensitivity(
    scores: ArchetypeScore[],
    signals: ArchetypeSignal[]
  ): number {
    const sorted = [...scores].sort((a, b) => b.score - a.score);
    const primary = sorted[0];
    const secondary = sorted[1];

    // High sensitivity if primary and secondary are close
    if (!secondary) return 20;

    const gap = primary.score - secondary.score;
    
    // Gap < 10: very sensitive
    // Gap > 30: not sensitive
    if (gap < 10) return 80;
    if (gap < 15) return 60;
    if (gap < 20) return 40;
    if (gap < 30) return 25;
    return 15;
  }

  /**
   * Identifies robustness indicators.
   *
   * @param scores - Archetype scores
   * @param signals - Assessment signals
   * @returns Array of robustness indicators
   */
  private identifyRobustnessIndicators(
    scores: ArchetypeScore[],
    signals: ArchetypeSignal[]
  ): RobustnessIndicator[] {
    const indicators: RobustnessIndicator[] = [];
    const sorted = [...scores].sort((a, b) => b.score - a.score);
    const primary = sorted[0];

    // Clear separation
    const gap = primary.score - (sorted[1]?.score ?? 0);
    if (gap > 20) {
      indicators.push({
        name: 'Clear Archetype Separation',
        description: `Primary archetype is ${gap} points ahead of secondary`,
        contribution: Math.min(20, gap / 2),
      });
    }

    // Multiple strong signals
    const strongSignals = signals.filter((s) => s.strength > 70);
    if (strongSignals.length >= 3) {
      indicators.push({
        name: 'Multiple Strong Signals',
        description: `${strongSignals.length} strong signals support primary archetype`,
        contribution: Math.min(15, strongSignals.length * 3),
      });
    }

    // Diverse sources
    const sources = new Set(signals.map((s) => s.source));
    if (sources.size >= 4) {
      indicators.push({
        name: 'Diverse Evidence Sources',
        description: `Signals from ${sources.size} different sources`,
        contribution: Math.min(15, sources.size * 3),
      });
    }

    // High confidence in primary
    if (primary.confidence > 70) {
      indicators.push({
        name: 'High Confidence in Primary',
        description: `Primary archetype confidence: ${primary.confidence}`,
        contribution: (primary.confidence - 70) / 2,
      });
    }

    return indicators;
  }

  /**
   * Identifies vulnerability factors.
   *
   * @param scores - Archetype scores
   * @param signals - Assessment signals
   * @returns Array of vulnerability factors
   */
  private identifyVulnerabilities(
    scores: ArchetypeScore[],
    signals: ArchetypeSignal[]
  ): VulnerabilityFactor[] {
    const vulnerabilities: VulnerabilityFactor[] = [];
    const sorted = [...scores].sort((a, b) => b.score - a.score);
    const primary = sorted[0];
    const secondary = sorted[1];

    // Close competition
    if (secondary) {
      const gap = primary.score - secondary.score;
      if (gap < 15) {
        vulnerabilities.push({
          name: 'Close Competition',
          description: `Primary only ${gap} points ahead of ${secondary.archetype}`,
          impact: 70 - gap * 2,
          likelihood: 60,
        });
      }
    }

    // Low signal diversity
    const sources = new Set(signals.map((s) => s.source));
    if (sources.size < 3) {
      vulnerabilities.push({
        name: 'Limited Evidence Sources',
        description: `Only ${sources.size} sources of evidence`,
        impact: 40,
        likelihood: 50,
      });
    }

    // Low confidence signals
    const lowConfidenceSignals = signals.filter((s) => s.strength < 50);
    if (lowConfidenceSignals.length > signals.length * 0.5) {
      vulnerabilities.push({
        name: 'Many Weak Signals',
        description: `${lowConfidenceSignals.length} weak signals out of ${signals.length}`,
        impact: 30,
        likelihood: 40,
      });
    }

    // Conflicting signals
    const conflicting = this.findConflictingSignals(signals);
    if (conflicting.length > 0) {
      vulnerabilities.push({
        name: 'Conflicting Evidence',
        description: `${conflicting.length} conflicting signal pairs detected`,
        impact: 35,
        likelihood: 45,
      });
    }

    return vulnerabilities;
  }

  /**
   * Finds conflicting signal pairs.
   *
   * @param signals - Assessment signals
   * @returns Conflicting pairs
   */
  private findConflictingSignals(
    signals: ArchetypeSignal[]
  ): Array<{ archetype1: ArchetypeType; archetype2: ArchetypeType }> {
    const conflicts: Array<{ archetype1: ArchetypeType; archetype2: ArchetypeType }> = [];

    // Known conflicting archetype pairs
    const conflictPairs: Array<[ArchetypeType, ArchetypeType]> = [
      ['FOUNDER', 'PROTECTOR'],
      ['EXPLORER', 'CRAFTSMAN'],
      ['LEADER', 'RESEARCHER'],
      ['OPERATOR', 'CREATOR'],
      ['BUILDER', 'STRATEGIST'],
    ];

    const archetypeSignals = new Map<ArchetypeType, number>();
    for (const signal of signals) {
      const current = archetypeSignals.get(signal.archetype) ?? 0;
      archetypeSignals.set(signal.archetype, current + signal.strength);
    }

    for (const [a1, a2] of conflictPairs) {
      const s1 = archetypeSignals.get(a1) ?? 0;
      const s2 = archetypeSignals.get(a2) ?? 0;
      
      // Conflict if both have significant signals
      if (s1 > 50 && s2 > 50) {
        conflicts.push({ archetype1: a1, archetype2: a2 });
      }
    }

    return conflicts;
  }

  /**
   * Calculates confidence interval for primary archetype.
   *
   * @param primary - Primary archetype
   * @param scores - All archetype scores
   * @returns Confidence interval
   */
  private calculateConfidenceInterval(
    primary: ArchetypeType,
    scores: ArchetypeScore[]
  ): { lowerBound: number; upperBound: number } {
    const primaryScore = scores.find((s) => s.archetype === primary);
    if (!primaryScore) return { lowerBound: 0, upperBound: 100 };

    const confidence = primaryScore.confidence;
    const margin = (100 - confidence) / 2;

    return {
      lowerBound: Math.max(0, primaryScore.score - margin),
      upperBound: Math.min(100, primaryScore.score + margin),
    };
  }

  /**
   * Identifies scenarios that could change the assignment.
   *
   * @param primary - Primary archetype
   * @param secondary - Secondary archetype
   * @param scores - All archetype scores
   * @returns Change scenarios
   */
  private identifyChangeScenarios(
    primary: ArchetypeType,
    secondary: ArchetypeType | undefined,
    scores: ArchetypeScore[]
  ): ChangeScenario[] {
    const scenarios: ChangeScenario[] = [];
    const sorted = [...scores].sort((a, b) => b.score - a.score);
    const primaryScore = sorted[0];

    // Scenario 1: Secondary overtakes primary
    if (secondary) {
      const secondaryScore = sorted.find((s) => s.archetype === secondary);
      if (secondaryScore) {
        const gap = primaryScore.score - secondaryScore.score;
        scenarios.push({
          scenario: 'Secondary archetype becomes primary',
          requiredChange: `Secondary score increases by ${gap + 5} points`,
          probability: gap < 15 ? 40 : gap < 25 ? 25 : 10,
          potentialNewArchetype: secondary,
        });
      }
    }

    // Scenario 2: New assessment data shifts results
    scenarios.push({
      scenario: 'New assessment data reveals different pattern',
      requiredChange: 'Completing additional assessments',
      probability: 20,
    });

    // Scenario 3: Life experience changes perspective
    scenarios.push({
      scenario: 'Significant life experience alters career preferences',
      requiredChange: 'Major life event or experience',
      probability: 15,
    });

    // Scenario 4: Tertiary archetype emerges
    if (sorted.length >= 3) {
      const tertiary = sorted[2];
      if (tertiary.score > 50) {
        scenarios.push({
          scenario: 'Tertiary archetype emerges as contender',
          requiredChange: `Tertiary score increases by ${primaryScore.score - tertiary.score + 10} points`,
          probability: 10,
          potentialNewArchetype: tertiary.archetype,
        });
      }
    }

    return scenarios;
  }

  /**
   * Analyzes archetype separation.
   *
   * @param scores - Archetype scores
   * @returns Separation analysis
   */
  analyzeSeparation(scores: ArchetypeScore[]): SeparationAnalysis {
    const sorted = [...scores].sort((a, b) => b.score - a.score);
    const primary = sorted[0];
    const secondary = sorted[1];
    const tertiary = sorted[2];

    const primarySecondaryGap = secondary
      ? primary.score - secondary.score
      : 100;
    const primaryTertiaryGap = tertiary
      ? primary.score - tertiary.score
      : primarySecondaryGap + 10;

    // Distribution evenness (Gini-like coefficient)
    const scores_values = sorted.map((s) => s.score);
    const mean = scores_values.reduce((a, b) => a + b, 0) / scores_values.length;
    const variance =
      scores_values.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) /
      scores_values.length;
    const distributionEvenness = Math.min(100, variance / 10);

    // Clear winner check
    const hasClearWinner =
      primarySecondaryGap >= SEPARATION_THRESHOLDS.primarySecondary;

    // Separation score
    const separationScore = Math.round(
      primarySecondaryGap * 1.5 +
        primaryTertiaryGap * 0.5 -
        distributionEvenness * 0.3
    );

    return {
      separationScore: Math.min(100, Math.max(0, separationScore)),
      primarySecondaryGap,
      primaryTertiaryGap,
      distributionEvenness,
      hasClearWinner,
    };
  }

  /**
   * Analyzes signal consistency.
   *
   * @param signals - Assessment signals
   * @returns Consistency analysis
   */
  analyzeConsistency(signals: ArchetypeSignal[]): ConsistencyAnalysis {
    const groupedBySource = this.groupSignalsBySource(signals);
    
    // Cross-source agreement
    const sourceArchetypes = new Map<string, ArchetypeType[]>();
    for (const [source, sourceSignals] of groupedBySource) {
      const topArchetype = sourceSignals.sort((a, b) => b.strength - a.strength)[0]?.archetype;
      if (topArchetype) {
        sourceArchetypes.set(source, [topArchetype]);
      }
    }

    const archetypeCounts = new Map<ArchetypeType, number>();
    for (const archetypes of sourceArchetypes.values()) {
      for (const archetype of archetypes) {
        archetypeCounts.set(archetype, (archetypeCounts.get(archetype) ?? 0) + 1);
      }
    }

    const maxAgreement = Math.max(...archetypeCounts.values(), 0);
    const crossSourceAgreement = Math.round(
      (maxAgreement / Math.max(1, sourceArchetypes.size)) * 100
    );

    // Internal consistency
    const internalConsistency = this.calculateInternalConsistency(signals);

    // Overall consistency
    const consistencyScore = Math.round(
      crossSourceAgreement * 0.6 + internalConsistency * 0.4
    );

    return {
      consistencyScore,
      crossSourceAgreement,
      internalConsistency,
      conflictingSignals: [],
    };
  }

  /**
   * Groups signals by source.
   *
   * @param signals - Assessment signals
   * @returns Grouped signals
   */
  private groupSignalsBySource(
    signals: ArchetypeSignal[]
  ): Map<string, ArchetypeSignal[]> {
    const grouped = new Map<string, ArchetypeSignal[]>();

    for (const signal of signals) {
      const existing = grouped.get(signal.source) ?? [];
      existing.push(signal);
      grouped.set(signal.source, existing);
    }

    return grouped;
  }

  /**
   * Calculates internal consistency.
   *
   * @param signals - Assessment signals
   * @returns Internal consistency score
   */
  private calculateInternalConsistency(signals: ArchetypeSignal[]): number {
    const groupedBySource = this.groupSignalsBySource(signals);
    let totalVariance = 0;
    let sourceCount = 0;

    for (const sourceSignals of groupedBySource.values()) {
      if (sourceSignals.length < 2) continue;

      const strengths = sourceSignals.map((s) => s.strength);
      const mean = strengths.reduce((a, b) => a + b, 0) / strengths.length;
      const variance =
        strengths.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) /
        strengths.length;

      totalVariance += variance;
      sourceCount++;
    }

    if (sourceCount === 0) return 70;

    const avgVariance = totalVariance / sourceCount;
    return Math.max(0, 100 - avgVariance);
  }
}

/**
 * Creates default stability engine.
 *
 * @returns New StabilityEngine instance
 */
export function createStabilityEngine(): StabilityEngine {
  return new StabilityEngine();
}

/**
 * Quick stability check.
 *
 * @param primary - Primary archetype
 * @param scores - All archetype scores
 * @returns Stability score (0-100)
 */
export function quickStabilityCheck(
  primary: ArchetypeType,
  scores: ArchetypeScore[]
): number {
  const engine = createStabilityEngine();
  const analysis = engine.analyzeStability(primary, undefined, scores, []);
  return analysis.stabilityScore;
}
