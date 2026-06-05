/**
 * CareerOS Assessment Reliability & Validation System - Consistency Engine
 *
 * Phase B.4: Assessment Validation Layer
 *
 * Detects contradictions and inconsistencies in assessment responses.
 *
 * @module consistency-engine
 * @version 1.0.0
 */

import type {
  AssessmentSignal,
  Contradiction,
  ContradictionType,
  ConsistencyAnalysis,
} from './validation-types';

/**
 * Detects contradictions and inconsistencies in assessment signals.
 *
 * Uses deterministic rules to identify logically incompatible
 * dimension scores that may indicate response issues.
 */
export class ConsistencyEngine {
  /**
   * Analyze consistency of assessment signals.
   */
  analyzeConsistency(signals: AssessmentSignal[]): ConsistencyAnalysis {
    const contradictions = this.detectContradictions(signals);
    const dimensionScores = this.aggregateDimensionScores(signals);

    const consistentDimensions: string[] = [];
    const inconsistentDimensions: string[] = [];

    for (const [dimension, score] of dimensionScores) {
      // Check if dimension is involved in contradictions
      const isInconsistent = contradictions.some((c) =>
        c.dimensions.includes(dimension)
      );

      if (isInconsistent) {
        inconsistentDimensions.push(dimension);
      } else {
        consistentDimensions.push(dimension);
      }
    }

    // Calculate consistency score
    const consistencyScore = this.calculateConsistencyScore(
      contradictions,
      dimensionScores.size
    );

    return {
      consistencyScore,
      contradictions,
      consistentDimensions,
      inconsistentDimensions,
    };
  }

  /**
   * Detect contradictions between dimensions.
   */
  private detectContradictions(signals: AssessmentSignal[]): Contradiction[] {
    const contradictions: Contradiction[] = [];
    const dimensionScores = this.aggregateDimensionScores(signals);

    // Define contradiction patterns
    const contradictionPatterns: Array<{
      type: ContradictionType;
      description: string;
      dimensions: [string, string];
      threshold: number;
      severity: 'LOW' | 'MEDIUM' | 'HIGH';
      suggestion: string;
    }> = [
      {
        type: 'LEADERSHIP_RESPONSIBILITY',
        description: 'High leadership preference with low responsibility comfort',
        dimensions: ['influenceOrientation', 'responsibilityCapacity'],
        threshold: 40,
        severity: 'HIGH',
        suggestion: 'Review responses about leadership and responsibility',
      },
      {
        type: 'RISK_CERTAINTY',
        description: 'High risk tolerance with strong preference for certainty',
        dimensions: ['careerRiskTolerance', 'ambiguityTolerance'],
        threshold: 40,
        severity: 'HIGH',
        suggestion: 'Clarify risk tolerance vs certainty preference',
      },
      {
        type: 'SOCIAL_INDEPENDENCE',
        description: 'High social orientation with strong avoidance of teamwork',
        dimensions: ['socialOrientation', 'independencePreference'],
        threshold: 40,
        severity: 'MEDIUM',
        suggestion: 'Review social vs independence preferences',
      },
      {
        type: 'AUTONOMY_STRUCTURE',
        description: 'High autonomy need with high structure preference',
        dimensions: ['autonomyNeed', 'structureNeed'],
        threshold: 35,
        severity: 'MEDIUM',
        suggestion: 'Consider balance between autonomy and structure',
      },
      {
        type: 'ACHIEVEMENT_SECURITY',
        description: 'High achievement drive with high security need',
        dimensions: ['achievementDrive', 'securityNeed'],
        threshold: 35,
        severity: 'LOW',
        suggestion: 'Normal tension - may indicate balanced motivation',
      },
      {
        type: 'CREATIVITY_SYSTEMATIC',
        description: 'High creativity with extremely high systematic preference',
        dimensions: ['creativeProblemSolving', 'systematicProcessing'],
        threshold: 30,
        severity: 'LOW',
        suggestion: 'May indicate structured creativity - review if needed',
      },
      {
        type: 'FLEXIBILITY_STABILITY',
        description: 'High flexibility need with high stability preference',
        dimensions: ['flexibilityNeed', 'stabilityPreference'],
        threshold: 35,
        severity: 'MEDIUM',
        suggestion: 'Review preferences for change vs consistency',
      },
      {
        type: 'RECOGNITION_AUTONOMY',
        description: 'High recognition drive with very high autonomy',
        dimensions: ['recognitionDrive', 'autonomyNeed'],
        threshold: 40,
        severity: 'LOW',
        suggestion: 'May indicate internal motivation with external validation needs',
      },
    ];

    for (const pattern of contradictionPatterns) {
      const [dim1, dim2] = pattern.dimensions;
      const score1 = dimensionScores.get(dim1) ?? 50;
      const score2 = dimensionScores.get(dim2) ?? 50;

      // Check if both are high but one contradicts the other
      const isContradiction = this.isContradictory(score1, score2, pattern.threshold);

      if (isContradiction) {
        contradictions.push({
          id: `${pattern.type}-${Date.now()}`,
          type: pattern.type,
          severity: pattern.severity,
          description: pattern.description,
          dimensions: [dim1, dim2],
          scores: [
            { dimension: dim1, score: score1 },
            { dimension: dim2, score: score2 },
          ],
          reliabilityImpact: this.calculateContradictionImpact(score1, score2, pattern.severity),
          suggestion: pattern.suggestion,
        });
      }
    }

    return contradictions;
  }

  /**
   * Check if two scores represent a contradiction.
   */
  private isContradictory(score1: number, score2: number, threshold: number): boolean {
    // Both scores must be above average
    if (score1 < 60 || score2 < 60) return false;

    // Check if difference exceeds threshold
    const difference = Math.abs(score1 - score2);
    return difference > threshold;
  }

  /**
   * Calculate impact of contradiction on reliability.
   */
  private calculateContradictionImpact(
    score1: number,
    score2: number,
    severity: 'LOW' | 'MEDIUM' | 'HIGH'
  ): number {
    const baseImpact = {
      LOW: 5,
      MEDIUM: 10,
      HIGH: 15,
    };

    const difference = Math.abs(score1 - score2);
    const multiplier = Math.min(difference / 50, 2);

    return Math.round(baseImpact[severity] * multiplier);
  }

  /**
   * Aggregate signals by dimension.
   */
  private aggregateDimensionScores(
    signals: AssessmentSignal[]
  ): Map<string, number> {
    const scores = new Map<string, number[]>();

    for (const signal of signals) {
      const existing = scores.get(signal.dimension) ?? [];
      existing.push(signal.strength);
      scores.set(signal.dimension, existing);
    }

    const averages = new Map<string, number>();
    for (const [dimension, values] of scores) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      averages.set(dimension, Math.round(avg));
    }

    return averages;
  }

  /**
   * Calculate overall consistency score.
   */
  private calculateConsistencyScore(
    contradictions: Contradiction[],
    dimensionCount: number
  ): number {
    if (dimensionCount === 0) return 0;

    // Base score
    let score = 100;

    // Deduct for contradictions
    for (const contradiction of contradictions) {
      score -= contradiction.reliabilityImpact;
    }

    // Bonus for dimensions without contradictions
    const affectedDimensions = new Set(
      contradictions.flatMap((c) => c.dimensions)
    );
    const cleanDimensions = dimensionCount - affectedDimensions.size;
    score += cleanDimensions * 2;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Check if specific dimension has contradictions.
   */
  hasContradictions(
    dimension: string,
    contradictions: Contradiction[]
  ): boolean {
    return contradictions.some((c) => c.dimensions.includes(dimension));
  }

  /**
   * Get contradictions for specific dimension.
   */
  getContradictionsForDimension(
    dimension: string,
    contradictions: Contradiction[]
  ): Contradiction[] {
    return contradictions.filter((c) => c.dimensions.includes(dimension));
  }
}

/**
 * Factory function for ConsistencyEngine.
 */
export function createConsistencyEngine(): ConsistencyEngine {
  return new ConsistencyEngine();
}
