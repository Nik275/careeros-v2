/**
 * CareerOS Market Intelligence - Trend Analysis Model
 *
 * Complete trend analysis result.
 */

import type { TrendClassification } from './TrendClassification';
import type { TrendSnapshot } from './TrendSnapshot';

/**
 * Complete trend analysis for an entity.
 */
export interface TrendAnalysis {
  /** Entity identifier */
  readonly entityId: string;

  /** Entity type */
  readonly entityType: 'career' | 'skill' | 'industry' | 'region';

  /** Metric being analyzed */
  readonly metricType: string;

  /** Trend classification */
  readonly classification: TrendClassification;

  /** Momentum score (0-100) */
  readonly momentum: number;

  /** Acceleration score */
  readonly acceleration: number;

  /** Persistence score (0-100) */
  readonly persistence: number;

  /** Overall confidence (0-100) */
  readonly confidence: number;

  /** Direction of trend */
  readonly direction: 'up' | 'down' | 'flat';

  /** Strength of trend (0-100) */
  readonly strength: number;

  /** Rate of change (% per period) */
  readonly rateOfChange: number;

  /** Volatility measure */
  readonly volatility: number;

  /** Historical data used */
  readonly dataPoints: number;

  /** Analysis period (days) */
  readonly periodDays: number;

  /** Start value */
  readonly startValue: number;

  /** Current/end value */
  readonly currentValue: number;

  /** Peak value in period */
  readonly peakValue: number;

  /** Trough value in period */
  readonly troughValue: number;

  /** Timestamp of analysis */
  readonly analyzedAt: Date;

  /** Human-readable explanation */
  readonly explanation: string[];

  /** Key insights */
  readonly insights: string[];

  /** Risk flags */
  readonly riskFlags: string[];

  /** Supporting evidence */
  readonly evidence: Array<{
    type: string;
    value: string;
    confidence: number;
  }>;
}

/**
 * Comparative trend analysis.
 */
export interface ComparativeTrendAnalysis {
  /** Base entity ID */
  readonly baseEntityId: string;

  /** Comparison entity ID */
  readonly comparisonEntityId: string;

  /** Metric type */
  readonly metricType: string;

  /** Base trend */
  readonly baseTrend: TrendAnalysis;

  /** Comparison trend */
  readonly comparisonTrend: TrendAnalysis;

  /** Relative performance */
  readonly relativePerformance: {
    momentum: 'better' | 'worse' | 'similar';
    growth: 'better' | 'worse' | 'similar';
    stability: 'better' | 'worse' | 'similar';
    overall: 'better' | 'worse' | 'similar';
  };

  /** Score differences */
  readonly differences: {
    momentum: number;
    acceleration: number;
    persistence: number;
    rateOfChange: number;
  };

  /** Analysis timestamp */
  readonly analyzedAt: Date;
}

/**
 * Trend summary for dashboard display.
 */
export interface TrendSummary {
  /** Entity identifier */
  readonly entityId: string;

  /** Entity type */
  readonly entityType: string;

  /** Primary metric */
  readonly primaryMetric: string;

  /** Classification */
  readonly classification: TrendClassification;

  /** One-line summary */
  readonly summary: string;

  /** Key metrics */
  readonly keyMetrics: {
    momentum: number;
    growth: number;
    confidence: number;
  };

  /** Trend direction indicator */
  readonly direction: '↗' | '→' | '↘' | '↕';

  /** Last updated */
  readonly lastUpdated: Date;
}

/**
 * Create trend summary from analysis.
 */
export function createTrendSummary(analysis: TrendAnalysis): TrendSummary {
  const direction =
    analysis.classification === 'RAPID_GROWTH' || analysis.classification === 'GROWTH'
      ? '↗'
      : analysis.classification === 'RAPID_DECLINE' || analysis.classification === 'DECLINING'
      ? '↘'
      : analysis.classification === 'VOLATILE'
      ? '↕'
      : '→';

  const classificationLabel = analysis.classification
    .toLowerCase()
    .replace(/_/g, ' ');

  return {
    entityId: analysis.entityId,
    entityType: analysis.entityType,
    primaryMetric: analysis.metricType,
    classification: analysis.classification,
    summary: `${analysis.entityId} showing ${classificationLabel} (momentum: ${analysis.momentum})`,
    keyMetrics: {
      momentum: analysis.momentum,
      growth: Math.round(analysis.rateOfChange),
      confidence: analysis.confidence,
    },
    direction,
    lastUpdated: analysis.analyzedAt,
  };
}

/**
 * Generate human-readable explanation.
 */
export function generateExplanation(analysis: TrendAnalysis): string[] {
  const explanation: string[] = [];

  // Trend direction
  const directionText =
    analysis.direction === 'up'
      ? 'increasing'
      : analysis.direction === 'down'
      ? 'declining'
      : 'stable';

  explanation.push(
    `${analysis.metricType} is ${directionText} with ${analysis.strength}% strength.`
  );

  // Momentum
  if (analysis.momentum >= 70) {
    explanation.push(`Momentum is very high (${analysis.momentum}/100).`);
  } else if (analysis.momentum >= 40) {
    explanation.push(`Momentum is moderate (${analysis.momentum}/100).`);
  } else {
    explanation.push(`Momentum is low (${analysis.momentum}/100).`);
  }

  // Acceleration
  if (analysis.acceleration > 10) {
    explanation.push('Growth is accelerating.');
  } else if (analysis.acceleration < -10) {
    explanation.push('Growth is slowing down.');
  }

  // Persistence
  if (analysis.persistence >= 70) {
    explanation.push('Trend shows strong persistence (likely durable).');
  } else if (analysis.persistence < 40) {
    explanation.push('Trend may be temporary (low persistence).');
  }

  // Volatility
  if (analysis.volatility > 20) {
    explanation.push('High volatility detected.');
  }

  return explanation;
}

/**
 * Generate insights from trend analysis.
 */
export function generateInsights(analysis: TrendAnalysis): string[] {
  const insights: string[] = [];

  // Classification-based insights
  switch (analysis.classification) {
    case 'RAPID_GROWTH':
      insights.push('Exceptional growth trajectory');
      insights.push('Strong market momentum');
      break;
    case 'GROWTH':
      insights.push('Steady improvement observed');
      break;
    case 'DECLINING':
      insights.push('Market contraction detected');
      break;
    case 'RAPID_DECLINE':
      insights.push('Critical decline - immediate attention needed');
      break;
    case 'VOLATILE':
      insights.push('Unpredictable market behavior');
      break;
    case 'EMERGING':
      insights.push('New trend - monitor closely');
      break;
  }

  // Momentum insights
  if (analysis.momentum >= 80) {
    insights.push('Extremely high momentum');
  }

  // Acceleration insights
  if (analysis.acceleration > 20) {
    insights.push('Rapidly accelerating');
  } else if (analysis.acceleration < -20) {
    insights.push('Rapidly decelerating');
  }

  // Persistence insights
  if (analysis.persistence >= 80) {
    insights.push('Highly durable trend');
  }

  return insights;
}

/**
 * Identify risk flags.
 */
export function identifyRiskFlags(analysis: TrendAnalysis): string[] {
  const flags: string[] = [];

  if (analysis.classification === 'RAPID_DECLINE') {
    flags.push('critical-decline');
  }

  if (analysis.classification === 'DECLINING' && analysis.persistence >= 70) {
    flags.push('persistent-decline');
  }

  if (analysis.volatility > 30) {
    flags.push('high-volatility');
  }

  if (analysis.confidence < 40) {
    flags.push('low-confidence');
  }

  if (analysis.acceleration < -20) {
    flags.push('rapid-deceleration');
  }

  return flags;
}

/**
 * Compare two trend analyses.
 */
export function compareTrendAnalyses(
  base: TrendAnalysis,
  comparison: TrendAnalysis
): ComparativeTrendAnalysis {
  const momentumDiff = comparison.momentum - base.momentum;
  const accelerationDiff = comparison.acceleration - base.acceleration;
  const persistenceDiff = comparison.persistence - base.persistence;
  const rateDiff = comparison.rateOfChange - base.rateOfChange;

  const compareValue = (a: number, b: number): 'better' | 'worse' | 'similar' => {
    const diff = b - a;
    if (Math.abs(diff) < 10) return 'similar';
    return diff > 0 ? 'better' : 'worse';
  };

  return {
    baseEntityId: base.entityId,
    comparisonEntityId: comparison.entityId,
    metricType: base.metricType,
    baseTrend: base,
    comparisonTrend: comparison,
    relativePerformance: {
      momentum: compareValue(base.momentum, comparison.momentum),
      growth: compareValue(base.rateOfChange, comparison.rateOfChange),
      stability: compareValue(base.volatility, comparison.volatility),
      overall: compareValue(base.strength, comparison.strength),
    },
    differences: {
      momentum: momentumDiff,
      acceleration: accelerationDiff,
      persistence: persistenceDiff,
      rateOfChange: rateDiff,
    },
    analyzedAt: new Date(),
  };
}

/**
 * Validate trend analysis.
 */
export function validateTrendAnalysis(analysis: TrendAnalysis): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!analysis.entityId) {
    errors.push('Entity ID is required');
  }

  if (analysis.momentum < 0 || analysis.momentum > 100) {
    errors.push(`Momentum must be 0-100, got ${analysis.momentum}`);
  }

  if (analysis.persistence < 0 || analysis.persistence > 100) {
    errors.push(`Persistence must be 0-100, got ${analysis.persistence}`);
  }

  if (analysis.confidence < 0 || analysis.confidence > 100) {
    errors.push(`Confidence must be 0-100, got ${analysis.confidence}`);
  }

  if (analysis.dataPoints < 2) {
    errors.push('At least 2 data points required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Trend analysis result with raw data.
 */
export interface DetailedTrendAnalysis extends TrendAnalysis {
  /** Raw snapshots used */
  readonly snapshots: TrendSnapshot[];

  /** Moving averages */
  readonly movingAverages: Array<{
    window: number;
    values: number[];
  }>;

  /** Trend line (linear regression) */
  readonly trendLine: {
    slope: number;
    intercept: number;
    r2: number;
  };

  /** Support and resistance levels */
  readonly levels: {
    support: number;
    resistance: number;
  };

  /** Seasonal decomposition (if applicable) */
  readonly seasonal?: {
    seasonalStrength: number;
    peakMonths: number[];
    troughMonths: number[];
  };
}
