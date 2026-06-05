/**
 * Emerging Career Detector
 *
 * Identifies:
 *   - High-growth careers
 *   - Emerging industries
 *   - Emerging skills
 *   - Emerging regions
 *
 * ## Detection Criteria
 *
 * | Factor | Threshold | Weight |
 * |--------|-----------|--------|
 * | Growth Rate | >20% annual | High |
 * | Acceleration | Positive | Medium |
 * | Low Base | Started <0.3 | Medium |
 * | Data Points | >=4 | Required |
 * | Trend Consistency | >0.7 | Medium |
 *
 * ## Trajectory Projections
 *   - accelerating: Growth rate increasing
 *   - steady: Consistent growth
 *   - maturing: Growth rate slowing
 *   - uncertain: Inconsistent pattern
 */

import type {
  EmergingCareer,
  TimeSeriesPoint,
  EmergingCareerConfig,
  NormalizedEntityType,
  EntityId,
} from './types.js';

import { DEFAULT_EMERGING_CAREER_CONFIG } from './types.js';

// ============================================================================
// EMERGING CAREER DETECTOR
// ============================================================================

export class EmergingCareerDetector {
  private config: EmergingCareerConfig;

  constructor(config: Partial<EmergingCareerConfig> = {}) {
    this.config = { ...DEFAULT_EMERGING_CAREER_CONFIG, ...config };
  }

  /**
   * Detect if an entity is emerging.
   */
  detectEmerging(
    entityId: EntityId,
    entityType: NormalizedEntityType,
    entityName: string,
    dataPoints: TimeSeriesPoint[]
  ): EmergingCareer | null {
    if (dataPoints.length < this.config.minDataPoints) {
      return null;
    }

    // Sort by timestamp
    const sorted = [...dataPoints].sort((a, b) => a.timestamp - b.timestamp);

    // Check time window
    const timeSpan = sorted[sorted.length - 1].timestamp - sorted[0].timestamp;
    if (timeSpan < this.config.timeWindowMs / 4) {
      return null; // Not enough time coverage
    }

    // Calculate metrics
    const growthRate = this.calculateGrowthRate(sorted);

    // Check minimum growth rate
    if (growthRate < this.config.minGrowthRate) {
      return null;
    }

    const acceleration = this.calculateAcceleration(sorted);
    const startedLow = sorted[0].value < 0.3;
    const consistency = this.calculateConsistency(sorted);

    // Calculate emergence score
    const emergenceScore = this.calculateEmergenceScore(
      growthRate,
      acceleration,
      startedLow,
      consistency
    );

    // Determine trajectory
    const trajectory = this.determineTrajectory(sorted, acceleration, consistency);

    // Generate indicators
    const indicators = this.generateIndicators(
      growthRate,
      acceleration,
      startedLow,
      consistency,
      sorted
    );

    // Calculate confidence
    const confidence = this.calculateConfidence(sorted, consistency);

    return {
      id: `emerging_${entityId}_${Date.now()}`,
      entityId,
      entityType,
      emergenceScore: Math.round(emergenceScore),
      growthRate: Math.round(growthRate * 100) / 100,
      confidence,
      indicators,
      detectedAt: Date.now(),
      projectedTrajectory: trajectory,
    };
  }

  /**
   * Batch detect emerging entities from multiple profiles.
   */
  detectEmergingBatch(
    profiles: Array<{
      id: EntityId;
      type: NormalizedEntityType;
      name: string;
      dataPoints: TimeSeriesPoint[];
    }>
  ): EmergingCareer[] {
    const emerging: EmergingCareer[] = [];

    for (const profile of profiles) {
      const detection = this.detectEmerging(
        profile.id,
        profile.type,
        profile.name,
        profile.dataPoints
      );
      if (detection) {
        emerging.push(detection);
      }
    }

    // Sort by emergence score
    return emerging.sort((a, b) => b.emergenceScore - a.emergenceScore);
  }

  /**
   * Calculate annual growth rate.
   */
  private calculateGrowthRate(dataPoints: TimeSeriesPoint[]): number {
    const first = dataPoints[0].value;
    const last = dataPoints[dataPoints.length - 1].value;

    // Time span in years
    const timeSpanMs = dataPoints[dataPoints.length - 1].timestamp - dataPoints[0].timestamp;
    const timeSpanYears = timeSpanMs / (365 * 24 * 60 * 60 * 1000);

    if (timeSpanYears === 0 || first === 0) return 0;

    // Compound annual growth rate (CAGR)
    return Math.pow(last / first, 1 / timeSpanYears) - 1;
  }

  /**
   * Calculate acceleration (change in growth rate).
   */
  private calculateAcceleration(dataPoints: TimeSeriesPoint[]): number {
    if (dataPoints.length < 4) return 0;

    // Split into two halves
    const mid = Math.floor(dataPoints.length / 2);
    const firstHalf = dataPoints.slice(0, mid);
    const secondHalf = dataPoints.slice(mid);

    const firstGrowth = this.calculateGrowthRateForWindow(firstHalf);
    const secondGrowth = this.calculateGrowthRateForWindow(secondHalf);

    return secondGrowth - firstGrowth;
  }

  /**
   * Calculate growth rate for a specific window.
   */
  private calculateGrowthRateForWindow(dataPoints: TimeSeriesPoint[]): number {
    if (dataPoints.length < 2) return 0;

    const first = dataPoints[0].value;
    const last = dataPoints[dataPoints.length - 1].value;
    const timeSpanYears = (dataPoints[dataPoints.length - 1].timestamp - dataPoints[0].timestamp) /
      (365 * 24 * 60 * 60 * 1000);

    if (timeSpanYears === 0 || first === 0) return 0;

    return Math.pow(last / first, 1 / timeSpanYears) - 1;
  }

  /**
   * Calculate trend consistency.
   */
  private calculateConsistency(dataPoints: TimeSeriesPoint[]): number {
    if (dataPoints.length < 3) return 0.5;

    // Count positive changes
    let positiveChanges = 0;
    let totalChanges = 0;

    for (let i = 1; i < dataPoints.length; i++) {
      const change = dataPoints[i].value - dataPoints[i - 1].value;
      totalChanges++;
      if (change > 0) {
        positiveChanges++;
      }
    }

    // Consistency is how often the direction matches overall trend
    const growthRate = this.calculateGrowthRate(dataPoints);
    const expectedDirection = growthRate > 0;

    if (expectedDirection) {
      return positiveChanges / totalChanges;
    } else {
      return (totalChanges - positiveChanges) / totalChanges;
    }
  }

  /**
   * Calculate emergence score.
   */
  private calculateEmergenceScore(
    growthRate: number,
    acceleration: number,
    startedLow: boolean,
    consistency: number
  ): number {
    // Base score from growth rate (cap at 50 points for growth alone)
    const growthScore = Math.min(50, growthRate * 100);

    // Bonus for acceleration (up to 20 points)
    const accelerationScore = acceleration > 0 ? Math.min(20, acceleration * 200) : 0;

    // Bonus for starting from low base (10 points)
    const lowBaseScore = startedLow ? 10 : 0;

    // Consistency factor (0-10 points)
    const consistencyScore = consistency * 10;

    // Penalty for high maturity (if near ceiling)
    const maturityPenalty = 0; // Would need ceiling detection

    return Math.min(100, growthScore + accelerationScore + lowBaseScore + consistencyScore - maturityPenalty);
  }

  /**
   * Determine projected trajectory.
   */
  private determineTrajectory(
    dataPoints: TimeSeriesPoint[],
    acceleration: number,
    consistency: number
  ): 'accelerating' | 'steady' | 'maturing' | 'uncertain' {
    // Check current value vs max
    const current = dataPoints[dataPoints.length - 1].value;
    const max = Math.max(...dataPoints.map(p => p.value));

    // If near max and growth slowing, it's maturing
    if (current > max * 0.9 && acceleration < 0) {
      return 'maturing';
    }

    // If acceleration is positive and consistent, it's accelerating
    if (acceleration > this.config.accelerationThreshold && consistency > 0.7) {
      return 'accelerating';
    }

    // If consistent but flat acceleration, it's steady
    if (consistency > 0.7) {
      return 'steady';
    }

    return 'uncertain';
  }

  /**
   * Generate emergence indicators.
   */
  private generateIndicators(
    growthRate: number,
    acceleration: number,
    startedLow: boolean,
    consistency: number,
    dataPoints: TimeSeriesPoint[]
  ): string[] {
    const indicators: string[] = [];

    indicators.push(`${(growthRate * 100).toFixed(1)}% annual growth rate`);

    if (acceleration > 0) {
      indicators.push('Growth is accelerating');
    }

    if (startedLow) {
      indicators.push(`Started from low base (${(dataPoints[0].value * 100).toFixed(1)}%)`);
    }

    if (consistency > 0.8) {
      indicators.push('Highly consistent growth pattern');
    } else if (consistency > 0.6) {
      indicators.push('Moderately consistent growth');
    }

    const recentGrowth = this.calculateGrowthRateForWindow(dataPoints.slice(-Math.ceil(dataPoints.length / 2)));
    if (recentGrowth > growthRate * 1.5) {
      indicators.push('Recent growth is outpacing historical average');
    }

    return indicators;
  }

  /**
   * Calculate confidence in detection.
   */
  private calculateConfidence(
    dataPoints: TimeSeriesPoint[],
    consistency: number
  ): number {
    // Data point confidence
    const avgConfidence = dataPoints.reduce((sum, p) => sum + p.confidence, 0) / dataPoints.length;

    // Quantity factor
    const quantityFactor = Math.min(1, dataPoints.length / 12);

    // Consistency factor
    const consistencyFactor = consistency;

    return avgConfidence * 0.4 + quantityFactor * 0.3 + consistencyFactor * 0.3;
  }

  /**
   * Get top emerging entities.
   */
  getTopEmerging(
    detections: EmergingCareer[],
    limit: number = 10,
    minScore: number = 50
  ): EmergingCareer[] {
    return detections
      .filter(d => d.emergenceScore >= minScore)
      .slice(0, limit);
  }

  /**
   * Get emerging by type.
   */
  getEmergingByType(
    detections: EmergingCareer[],
    entityType: NormalizedEntityType
  ): EmergingCareer[] {
    return detections.filter(d => d.entityType === entityType);
  }

  /**
   * Filter by trajectory.
   */
  filterByTrajectory(
    detections: EmergingCareer[],
    trajectory: EmergingCareer['projectedTrajectory']
  ): EmergingCareer[] {
    return detections.filter(d => d.projectedTrajectory === trajectory);
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export function createEmergingCareerDetector(
  config?: Partial<EmergingCareerConfig>
): EmergingCareerDetector {
  return new EmergingCareerDetector(config);
}

export function quickDetectEmerging(
  dataPoints: TimeSeriesPoint[]
): { isEmerging: boolean; growthRate: number; confidence: number } {
  const detector = new EmergingCareerDetector();
  const result = detector.detectEmerging('quick', 'career', 'test', dataPoints);

  if (!result) {
    return { isEmerging: false, growthRate: 0, confidence: 0 };
  }

  return {
    isEmerging: true,
    growthRate: result.growthRate,
    confidence: result.confidence,
  };
}
