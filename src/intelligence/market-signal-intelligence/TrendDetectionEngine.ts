/**
 * Trend Detection Engine
 *
 * Detects trends in:
 *   - Demand Trends
 *   - Salary Trends
 *   - Competition Trends
 *   - Skill Demand Trends
 *   - Industry Growth Trends
 *   - Regional Opportunity Trends
 *
 * ## Trend Types
 *   - growing: Consistent upward movement
 *   - stable: Minimal change
 *   - declining: Consistent downward movement
 *   - volatile: High variance, unpredictable
 *   - emerging: Rapid growth from low base
 *
 * ## Detection Methods
 *   - linear-regression: Slope-based trend detection
 *   - moving-average: Smoothed trend analysis
 *   - change-point-detection: Structural break detection
 *   - momentum-based: Rate-of-change analysis
 */

import type {
  MarketTrend,
  TrendType,
  TrendDetectionMethod,
  TimeSeriesPoint,
  TrendDetectionConfig,
  NormalizedEntityType,
  EntityId,
} from './types.js';

import {
  DEFAULT_TREND_DETECTION_CONFIG,
  TREND_TYPE_LABELS,
} from './types.js';

// ============================================================================
// TREND DETECTION ENGINE
// ============================================================================

export class TrendDetectionEngine {
  private config: TrendDetectionConfig;

  constructor(config: Partial<TrendDetectionConfig> = {}) {
    this.config = { ...DEFAULT_TREND_DETECTION_CONFIG, ...config };
  }

  /**
   * Detect trend from time series data.
   */
  detectTrend(
    entityId: EntityId,
    entityType: NormalizedEntityType,
    dataPoints: TimeSeriesPoint[],
    metricName: string,
    method: TrendDetectionMethod = 'linear-regression'
  ): MarketTrend | null {
    if (dataPoints.length < this.config.minDataPoints) {
      return null;
    }

    // Sort by timestamp
    const sorted = [...dataPoints].sort((a, b) => a.timestamp - b.timestamp);

    // Filter to time window
    const cutoff = Date.now() - this.config.timeWindowMs;
    const recent = sorted.filter(p => p.timestamp >= cutoff);

    if (recent.length < this.config.minDataPoints) {
      return null;
    }

    // Calculate trend based on method
    const trend = this.calculateTrend(recent, method);

    // Generate explanation
    const explanation = this.generateExplanation(
      trend.trendType,
      trend.strength,
      metricName,
      recent,
      trend.slope
    );

    return {
      id: `trend_${entityId}_${metricName}_${Date.now()}`,
      entityId,
      entityType,
      trendType: trend.trendType,
      strength: trend.strength,
      confidence: trend.confidence,
      explanation,
      detectedAt: Date.now(),
      detectionMethod: method,
      timeWindow: {
        start: recent[0].timestamp,
        end: recent[recent.length - 1].timestamp,
      },
      supportingData: {
        dataPoints: recent.length,
        slope: trend.slope,
        r2Score: trend.r2Score,
      },
    };
  }

  /**
   * Detect multiple trends for an entity.
   */
  detectTrends(
    entityId: EntityId,
    entityType: NormalizedEntityType,
    metrics: Record<string, TimeSeriesPoint[]>
  ): MarketTrend[] {
    const trends: MarketTrend[] = [];

    for (const [metricName, dataPoints] of Object.entries(metrics)) {
      const trend = this.detectTrend(entityId, entityType, dataPoints, metricName);
      if (trend) {
        trends.push(trend);
      }
    }

    return trends;
  }

  /**
   * Calculate trend using selected method.
   */
  private calculateTrend(
    dataPoints: TimeSeriesPoint[],
    method: TrendDetectionMethod
  ): {
    trendType: TrendType;
    strength: number;
    confidence: number;
    slope: number;
    r2Score: number;
  } {
    switch (method) {
      case 'linear-regression':
        return this.linearRegressionTrend(dataPoints);
      case 'moving-average':
        return this.movingAverageTrend(dataPoints);
      case 'momentum-based':
        return this.momentumBasedTrend(dataPoints);
      default:
        return this.linearRegressionTrend(dataPoints);
    }
  }

  /**
   * Linear regression trend detection.
   */
  private linearRegressionTrend(dataPoints: TimeSeriesPoint[]): {
    trendType: TrendType;
    strength: number;
    confidence: number;
    slope: number;
    r2Score: number;
  } {
    const n = dataPoints.length;

    // Normalize timestamps to days from start
    const startTime = dataPoints[0].timestamp;
    const x = dataPoints.map(p => (p.timestamp - startTime) / (24 * 60 * 60 * 1000));
    const y = dataPoints.map(p => p.value);

    // Calculate means
    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;

    // Calculate slope and intercept
    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < n; i++) {
      numerator += (x[i] - meanX) * (y[i] - meanY);
      denominator += (x[i] - meanX) ** 2;
    }

    const slope = denominator !== 0 ? numerator / denominator : 0;
    const intercept = meanY - slope * meanX;

    // Calculate R-squared
    const ssTotal = y.reduce((sum, yi) => sum + (yi - meanY) ** 2, 0);
    const ssResidual = y.reduce((sum, yi, i) => sum + (yi - (slope * x[i] + intercept)) ** 2, 0);
    const r2Score = ssTotal !== 0 ? 1 - ssResidual / ssTotal : 0;

    // Calculate volatility (coefficient of variation)
    const variance = y.reduce((sum, yi) => sum + (yi - meanY) ** 2, 0) / n;
    const stdDev = Math.sqrt(variance);
    const cv = meanY !== 0 ? stdDev / meanY : 0;

    // Determine trend type
    let trendType: TrendType;
    if (cv > this.config.volatilityThreshold) {
      trendType = 'volatile';
    } else if (slope > this.config.growthThreshold / 100) {
      trendType = 'growing';
    } else if (slope < this.config.declineThreshold / 100) {
      trendType = 'declining';
    } else {
      trendType = 'stable';
    }

    // Check for emerging pattern (rapid growth from low base)
    if (trendType === 'growing' && y[0] < 0.3 && slope > 0.01) {
      trendType = 'emerging';
    }

    // Calculate strength (0-1)
    const strength = Math.min(1, Math.abs(slope) * 100);

    // Calculate confidence based on R-squared and data points
    const confidence = Math.min(1, r2Score * (1 - 1 / n));

    return { trendType, strength, confidence, slope, r2Score };
  }

  /**
   * Moving average trend detection.
   */
  private movingAverageTrend(dataPoints: TimeSeriesPoint[]): {
    trendType: TrendType;
    strength: number;
    confidence: number;
    slope: number;
    r2Score: number;
  } {
    const n = dataPoints.length;
    const windowSize = Math.min(3, Math.floor(n / 2));

    if (windowSize < 2) {
      return this.linearRegressionTrend(dataPoints);
    }

    // Calculate moving averages
    const ma: number[] = [];
    for (let i = windowSize - 1; i < n; i++) {
      const window = dataPoints.slice(i - windowSize + 1, i + 1);
      const avg = window.reduce((sum, p) => sum + p.value, 0) / windowSize;
      ma.push(avg);
    }

    // Use moving averages for trend
    const maPoints: TimeSeriesPoint[] = ma.map((value, i) => ({
      timestamp: dataPoints[i + windowSize - 1].timestamp,
      value,
      confidence: dataPoints[i + windowSize - 1].confidence,
    }));

    return this.linearRegressionTrend(maPoints);
  }

  /**
   * Momentum-based trend detection.
   */
  private momentumBasedTrend(dataPoints: TimeSeriesPoint[]): {
    trendType: TrendType;
    strength: number;
    confidence: number;
    slope: number;
    r2Score: number;
  } {
    const n = dataPoints.length;
    if (n < 4) {
      return this.linearRegressionTrend(dataPoints);
    }

    // Calculate short-term and long-term momentum
    const shortWindow = Math.min(3, Math.floor(n / 3));
    const longWindow = Math.min(6, Math.floor(n * 2 / 3));

    const shortTerm = this.calculateMomentum(dataPoints, shortWindow);
    const longTerm = this.calculateMomentum(dataPoints, longWindow);

    // Determine trend based on momentum alignment
    let trendType: TrendType;
    if (Math.abs(shortTerm - longTerm) > 0.3) {
      trendType = 'volatile';
    } else if (longTerm > this.config.growthThreshold) {
      trendType = 'growing';
    } else if (longTerm < this.config.declineThreshold) {
      trendType = 'declining';
    } else {
      trendType = 'stable';
    }

    // Check for emerging
    const firstAvg = dataPoints.slice(0, 2).reduce((sum, p) => sum + p.value, 0) / 2;
    if (trendType === 'growing' && firstAvg < 0.3 && longTerm > 0.02) {
      trendType = 'emerging';
    }

    const strength = Math.min(1, Math.abs(longTerm) * 50);
    const confidence = 1 - Math.abs(shortTerm - longTerm);
    const slope = longTerm;
    const r2Score = confidence;

    return { trendType, strength, confidence, slope, r2Score };
  }

  /**
   * Calculate momentum.
   */
  private calculateMomentum(dataPoints: TimeSeriesPoint[], window: number): number {
    const recent = dataPoints.slice(-window);
    if (recent.length < 2) return 0;

    const first = recent[0].value;
    const last = recent[recent.length - 1].value;

    return (last - first) / first;
  }

  /**
   * Generate explanation for trend.
   */
  private generateExplanation(
    trendType: TrendType,
    strength: number,
    metricName: string,
    dataPoints: TimeSeriesPoint[],
    slope: number
  ): string[] {
    const explanation: string[] = [];
    const trendLabel = TREND_TYPE_LABELS[trendType].toLowerCase();

    // Main trend statement
    if (trendType === 'growing' || trendType === 'emerging') {
      explanation.push(`${metricName} is ${trendLabel} with ${(strength * 100).toFixed(1)}% strength`);
    } else if (trendType === 'declining') {
      explanation.push(`${metricName} is ${trendLabel} at ${(Math.abs(slope) * 100).toFixed(1)}% rate`);
    } else if (trendType === 'volatile') {
      explanation.push(`${metricName} shows high volatility with unpredictable patterns`);
    } else {
      explanation.push(`${metricName} is ${trendLabel} with minimal change`);
    }

    // Value context
    const firstValue = dataPoints[0].value;
    const lastValue = dataPoints[dataPoints.length - 1].value;
    const change = ((lastValue - firstValue) / firstValue) * 100;

    if (Math.abs(change) > 5) {
      explanation.push(`Changed ${change > 0 ? '+' : ''}${change.toFixed(1)}% over the period`);
    }

    // Data quality
    explanation.push(`Based on ${dataPoints.length} data points`);

    return explanation;
  }

  /**
   * Detect trend direction only (simplified).
   */
  detectDirection(dataPoints: TimeSeriesPoint[]): 'up' | 'down' | 'flat' {
    if (dataPoints.length < 2) return 'flat';

    const sorted = [...dataPoints].sort((a, b) => a.timestamp - b.timestamp);
    const result = this.linearRegressionTrend(sorted);

    if (result.trendType === 'growing' || result.trendType === 'emerging') return 'up';
    if (result.trendType === 'declining') return 'down';
    return 'flat';
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export function createTrendDetectionEngine(
  config?: Partial<TrendDetectionConfig>
): TrendDetectionEngine {
  return new TrendDetectionEngine(config);
}

export function quickDetectTrend(
  dataPoints: TimeSeriesPoint[],
  metricName: string = 'metric'
): MarketTrend | null {
  const engine = new TrendDetectionEngine();
  return engine.detectTrend(
    'quick-test',
    'career',
    dataPoints,
    metricName
  );
}
