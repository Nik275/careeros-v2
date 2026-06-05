/**
 * CareerOS Assessment Reliability & Validation System - Response Pattern Detector
 *
 * Phase B.4: Assessment Validation Layer
 *
 * Detects suspicious response patterns in assessments.
 *
 * @module response-pattern-detector
 * @version 1.0.0
 */

import type {
  AssessmentResponse,
  ResponseTiming,
  ResponsePatternAnalysis,
  DetectedPattern,
  ResponsePatternType,
  ResponseDistribution,
  PatternThresholds,
  DEFAULT_PATTERN_THRESHOLDS,
} from './validation-types';

/**
 * Detects suspicious response patterns in assessment data.
 *
 * Identifies straight-lining, random responding, speeding,
 * and other patterns that may indicate low-quality responses.
 */
export class ResponsePatternDetector {
  private thresholds: PatternThresholds;

  constructor(thresholds?: Partial<PatternThresholds>) {
    this.thresholds = { ...DEFAULT_PATTERN_THRESHOLDS, ...thresholds };
  }

  /**
   * Analyze response patterns.
   */
  analyzePatterns(
    responses: AssessmentResponse[],
    timings?: ResponseTiming[]
  ): ResponsePatternAnalysis {
    const detectedPatterns: DetectedPattern[] = [];

    // Detect straight-lining
    const straightLinePattern = this.detectStraightLining(responses);
    if (straightLinePattern) {
      detectedPatterns.push(straightLinePattern);
    }

    // Detect random responding
    const randomPattern = this.detectRandomResponding(responses);
    if (randomPattern) {
      detectedPatterns.push(randomPattern);
    }

    // Detect speeding
    if (timings) {
      const speedingPattern = this.detectSpeeding(responses, timings);
      if (speedingPattern) {
        detectedPatterns.push(speedingPattern);
      }

      // Detect answer fatigue
      const fatiguePattern = this.detectAnswerFatigue(timings);
      if (fatiguePattern) {
        detectedPatterns.push(fatiguePattern);
      }
    }

    // Detect extreme responding
    const extremePattern = this.detectExtremeResponding(responses);
    if (extremePattern) {
      detectedPatterns.push(extremePattern);
    }

    // Detect midpoint responding
    const midpointPattern = this.detectMidpointResponding(responses);
    if (midpointPattern) {
      detectedPatterns.push(midpointPattern);
    }

    // Detect pattern repetition
    const repetitionPattern = this.detectPatternRepetition(responses);
    if (repetitionPattern) {
      detectedPatterns.push(repetitionPattern);
    }

    // Calculate distribution
    const distribution = this.analyzeDistribution(responses);

    // Calculate pattern score
    const patternScore = this.calculatePatternScore(detectedPatterns);

    // Calculate engagement score
    const engagementScore = this.calculateEngagementScore(
      detectedPatterns,
      distribution
    );

    return {
      patternScore,
      detectedPatterns,
      distribution,
      engagementScore,
    };
  }

  /**
   * Detect straight-lining (same answer repeated).
   */
  private detectStraightLining(responses: AssessmentResponse[]): DetectedPattern | null {
    if (responses.length === 0) return null;

    // Group by response value for Likert and Scale
    const valueCounts = new Map<string | number, number>();

    for (const response of responses) {
      let value: string | number | undefined;

      if (response.type === 'likert' || response.type === 'scale') {
        value = response.value;
      } else if (response.type === 'forcedChoice') {
        value = response.selectedOptionId;
      }

      if (value !== undefined) {
        const count = valueCounts.get(value) ?? 0;
        valueCounts.set(value, count + 1);
      }
    }

    // Check if any value exceeds threshold
    const maxCount = Math.max(...valueCounts.values());
    const percentage = (maxCount / responses.length) * 100;

    if (percentage > this.thresholds.straightLineThreshold) {
      const mostCommonValue = Array.from(valueCounts.entries()).find(
        ([, count]) => count === maxCount
      )?.[0];

      return {
        type: 'STRAIGHT_LINING',
        severity: percentage > 90 ? 'HIGH' : percentage > 80 ? 'MEDIUM' : 'LOW',
        description: `${Math.round(percentage)}% of responses selected the same option`,
        evidence: [
          `Most common value: ${mostCommonValue}`,
          `${maxCount} out of ${responses.length} responses`,
        ],
        affectedQuestionIds: responses
          .filter((r) => {
            if (r.type === 'likert' || r.type === 'scale') {
              return r.value === mostCommonValue;
            }
            return false;
          })
          .map((r) => r.questionId),
        validityImpact: Math.round(percentage * 0.3),
      };
    }

    return null;
  }

  /**
   * Detect random responding (low variance).
   */
  private detectRandomResponding(responses: AssessmentResponse[]): DetectedPattern | null {
    const numericResponses: number[] = [];

    for (const response of responses) {
      if (response.type === 'likert' || response.type === 'scale') {
        numericResponses.push(response.value);
      }
    }

    if (numericResponses.length < 5) return null;

    const variance = this.calculateVariance(numericResponses);

    if (variance < this.thresholds.minVariance) {
      return {
        type: 'RANDOM_RESPONDING',
        severity: variance < 50 ? 'HIGH' : variance < 80 ? 'MEDIUM' : 'LOW',
        description: `Unusually low variance in responses (${variance.toFixed(1)})`,
        evidence: [
          `Variance: ${variance.toFixed(2)}`,
          `Expected minimum: ${this.thresholds.minVariance}`,
        ],
        affectedQuestionIds: responses.map((r) => r.questionId),
        validityImpact: Math.round((this.thresholds.minVariance - variance) * 0.1),
      };
    }

    return null;
  }

  /**
   * Detect speeding (too fast responses).
   */
  private detectSpeeding(
    responses: AssessmentResponse[],
    timings: ResponseTiming[]
  ): DetectedPattern | null {
    if (timings.length === 0) return null;

    const fastResponses = timings.filter(
      (t) => t.durationSeconds < this.thresholds.minTimePerQuestion
    );

    const percentage = (fastResponses.length / timings.length) * 100;

    if (percentage > 30) {
      return {
        type: 'SPEEDING',
        severity: percentage > 60 ? 'HIGH' : percentage > 45 ? 'MEDIUM' : 'LOW',
        description: `${Math.round(percentage)}% of questions answered too quickly`,
        evidence: [
          `${fastResponses.length} questions under ${this.thresholds.minTimePerQuestion}s`,
          `Average time: ${(
            timings.reduce((sum, t) => sum + t.durationSeconds, 0) / timings.length
          ).toFixed(1)}s`,
        ],
        affectedQuestionIds: fastResponses.map((t) => t.questionId),
        validityImpact: Math.round(percentage * 0.3),
      };
    }

    return null;
  }

  /**
   * Detect answer fatigue (decreasing response times/quality).
   */
  private detectAnswerFatigue(timings: ResponseTiming[]): DetectedPattern | null {
    if (timings.length < 10) return null;

    // Split into halves
    const mid = Math.floor(timings.length / 2);
    const firstHalf = timings.slice(0, mid);
    const secondHalf = timings.slice(mid);

    const firstAvg =
      firstHalf.reduce((sum, t) => sum + t.durationSeconds, 0) / firstHalf.length;
    const secondAvg =
      secondHalf.reduce((sum, t) => sum + t.durationSeconds, 0) / secondHalf.length;

    // Check if second half is significantly faster
    if (secondAvg < firstAvg * 0.6) {
      return {
        type: 'ANSWER_FATIGUE',
        severity: secondAvg < firstAvg * 0.4 ? 'HIGH' : 'MEDIUM',
        description: 'Response speed increased significantly in second half',
        evidence: [
          `First half average: ${firstAvg.toFixed(1)}s`,
          `Second half average: ${secondAvg.toFixed(1)}s`,
          `Speed increase: ${(((firstAvg - secondAvg) / firstAvg) * 100).toFixed(0)}%`,
        ],
        affectedQuestionIds: secondHalf.map((t) => t.questionId),
        validityImpact: Math.round(((firstAvg - secondAvg) / firstAvg) * 30),
      };
    }

    return null;
  }

  /**
   * Detect extreme responding (only using extremes of scale).
   */
  private detectExtremeResponding(responses: AssessmentResponse[]): DetectedPattern | null {
    const extremeResponses: string[] = [];
    let totalNumeric = 0;

    for (const response of responses) {
      if (response.type === 'likert' || response.type === 'scale') {
        totalNumeric++;
        // Consider 1-2 and 4-5 (on 5-point scale) as extremes
        if (response.value <= 2 || response.value >= 4) {
          extremeResponses.push(response.questionId);
        }
      }
    }

    if (totalNumeric === 0) return null;

    const percentage = (extremeResponses.length / totalNumeric) * 100;

    if (percentage > this.thresholds.extremeResponseThreshold) {
      return {
        type: 'EXTREME_RESPONDING',
        severity: percentage > 90 ? 'HIGH' : percentage > 85 ? 'MEDIUM' : 'LOW',
        description: `${Math.round(percentage)}% of responses use extreme scale values`,
        evidence: [
          `${extremeResponses.length} extreme responses out of ${totalNumeric}`,
          'May indicate acquiescence bias or lack of nuance',
        ],
        affectedQuestionIds: extremeResponses,
        validityImpact: Math.round((percentage - 50) * 0.3),
      };
    }

    return null;
  }

  /**
   * Detect midpoint responding (avoiding extremes).
   */
  private detectMidpointResponding(responses: AssessmentResponse[]): DetectedPattern | null {
    const midpointResponses: string[] = [];
    let totalNumeric = 0;

    for (const response of responses) {
      if (response.type === 'likert' || response.type === 'scale') {
        totalNumeric++;
        // Consider value 3 (on 5-point scale) as midpoint
        if (response.value === 3) {
          midpointResponses.push(response.questionId);
        }
      }
    }

    if (totalNumeric === 0) return null;

    const percentage = (midpointResponses.length / totalNumeric) * 100;

    if (percentage > this.thresholds.midpointThreshold) {
      return {
        type: 'MIDPOINT_RESPONDING',
        severity: percentage > 80 ? 'HIGH' : percentage > 75 ? 'MEDIUM' : 'LOW',
        description: `${Math.round(percentage)}% of responses select midpoint`,
        evidence: [
          `${midpointResponses.length} midpoint responses out of ${totalNumeric}`,
          'May indicate satisficing or neutral responding',
        ],
        affectedQuestionIds: midpointResponses,
        validityImpact: Math.round((percentage - 40) * 0.3),
      };
    }

    return null;
  }

  /**
   * Detect pattern repetition (ABABAB patterns).
   */
  private detectPatternRepetition(responses: AssessmentResponse[]): DetectedPattern | null {
    const values: number[] = [];

    for (const response of responses) {
      if (response.type === 'likert' || response.type === 'scale') {
        values.push(response.value);
      }
    }

    if (values.length < 6) return null;

    // Check for alternating patterns
    let alternatingCount = 0;
    for (let i = 2; i < values.length; i++) {
      if (values[i] === values[i - 2]) {
        alternatingCount++;
      }
    }

    const percentage = (alternatingCount / (values.length - 2)) * 100;

    if (percentage > 80) {
      return {
        type: 'PATTERN_REPETITION',
        severity: percentage > 90 ? 'HIGH' : 'MEDIUM',
        description: 'Detected repetitive response pattern',
        evidence: [
          `${Math.round(percentage)}% of responses follow alternating pattern`,
          'Pattern suggests inattention or automated responding',
        ],
        affectedQuestionIds: responses.map((r) => r.questionId),
        validityImpact: Math.round(percentage * 0.25),
      };
    }

    return null;
  }

  /**
   * Analyze response distribution.
   */
  private analyzeDistribution(responses: AssessmentResponse[]): ResponseDistribution {
    const distribution = new Map<number, number>();
    const values: number[] = [];

    for (const response of responses) {
      if (response.type === 'likert' || response.type === 'scale') {
        const count = distribution.get(response.value) ?? 0;
        distribution.set(response.value, count + 1);
        values.push(response.value);
      }
    }

    const variance = this.calculateVariance(values);
    const stdDev = Math.sqrt(variance);
    const range = values.length > 0 ? Math.max(...values) - Math.min(...values) : 0;

    // Suspicious if very low variance or all same value
    const isSuspicious = variance < 50 || range < 2;

    return {
      scaleDistribution: distribution,
      variance,
      standardDeviation: stdDev,
      range,
      isSuspicious,
    };
  }

  /**
   * Calculate variance of values.
   */
  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * Calculate overall pattern score.
   */
  private calculatePatternScore(patterns: DetectedPattern[]): number {
    if (patterns.length === 0) return 0;

    const totalImpact = patterns.reduce((sum, p) => sum + p.validityImpact, 0);
    return Math.min(100, totalImpact);
  }

  /**
   * Calculate engagement score.
   */
  private calculateEngagementScore(
    patterns: DetectedPattern[],
    distribution: ResponseDistribution
  ): number {
    let score = 100;

    // Deduct for detected patterns
    for (const pattern of patterns) {
      score -= pattern.validityImpact;
    }

    // Deduct for suspicious distribution
    if (distribution.isSuspicious) {
      score -= 20;
    }

    return Math.max(0, score);
  }
}

/**
 * Factory function for ResponsePatternDetector.
 */
export function createResponsePatternDetector(
  thresholds?: Partial<PatternThresholds>
): ResponsePatternDetector {
  return new ResponsePatternDetector(thresholds);
}
