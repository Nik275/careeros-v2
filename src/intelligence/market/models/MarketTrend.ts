/**
 * CareerOS Market Intelligence - Market Trend Model
 *
 * Represents analyzed market movement through time.
 * Trends are derived from processed market signals.
 */

/**
 * Unique identifier for market trends.
 */
export type MarketTrendId = string;

/**
 * Market trend classifications.
 */
export enum MarketTrendDirection {
  RAPID_GROWTH = 'RAPID_GROWTH',
  GROWTH = 'GROWTH',
  STABLE = 'STABLE',
  DECLINING = 'DECLINING',
  RAPID_DECLINE = 'RAPID_DECLINE',
}

/**
 * Trend momentum classification.
 */
export enum MarketTrendMomentum {
  ACCELERATING = 'ACCELERATING',
  STEADY = 'STEADY',
  DECELERATING = 'DECELERATING',
  REVERSING = 'REVERSING',
}

/**
 * Types of market trends that can be analyzed.
 */
export type MarketTrendType =
  | 'demand'
  | 'salary'
  | 'growth'
  | 'competition'
  | 'automation_risk'
  | 'skill_demand'
  | 'hiring_rate';

/**
 * Market trend for a specific career and trend type.
 * 
 * Output from MarketTrendEngine after analyzing signal history.
 */
export interface MarketTrend {
  /** Unique identifier */
  readonly id: MarketTrendId;

  /** Career identifier */
  readonly careerId: string;

  /** Type of trend */
  readonly trendType: MarketTrendType;

  /** Trend direction classification */
  readonly direction: MarketTrendDirection;

  /** Trend momentum */
  readonly momentum: MarketTrendMomentum;

  /** Trend strength (0-100, higher = stronger trend) */
  readonly strength: number;

  /** Rate of change per month (-100 to +100) */
  readonly rateOfChange: number;

  /** Confidence in trend analysis (0-100) */
  readonly confidence: number;

  /** Historical data points used for analysis */
  readonly dataPoints: number;

  /** Time period analyzed */
  readonly analysisPeriod: {
    start: Date;
    end: Date;
  };

  /** When trend was calculated */
  readonly calculatedAt: Date;

  /** Projected future state (if trend continues) */
  readonly projection?: {
    /** Projected direction */
    projectedDirection: MarketTrendDirection;

    /** Projected strength in 6 months */
    projectedStrength6M: number;

    /** Projected strength in 12 months */
    projectedStrength12M: number;

    /** Confidence in projection */
    projectionConfidence: number;
  };

  /** Supporting evidence */
  readonly evidence: {
    /** Signal IDs that support this trend */
    signalIds: string[];

    /** Key events that influenced trend */
    keyEvents: Array<{
      date: Date;
      description: string;
      impact: number;
    }>;
  };
}

/**
 * Multi-dimensional trend analysis for a career.
 */
export interface CareerTrendAnalysis {
  /** Career identifier */
  readonly careerId: string;

  /** Overall trend summary */
  readonly overallTrend: {
    direction: MarketTrendDirection;
    strength: number;
    confidence: number;
  };

  /** Individual trend dimensions */
  readonly trends: Record<MarketTrendType, MarketTrend>;

  /** Trend coherence (how aligned are different trends) */
  readonly trendCoherence: number;

  /** Risk assessment */
  readonly riskAssessment: {
    trendReversalRisk: number;
    volatilityRisk: number;
    dataQualityRisk: number;
  };

  /** Last updated */
  readonly lastUpdated: Date;
}

/**
 * Trend change detection result.
 */
export interface TrendChangeDetection {
  /** Career identifier */
  readonly careerId: string;

  /** Whether a significant change was detected */
  readonly hasSignificantChange: boolean;

  /** Type of change */
  readonly changeType?: 'acceleration' | 'deceleration' | 'reversal' | 'stabilization';

  /** Magnitude of change */
  readonly changeMagnitude?: number;

  /** Previous trend state */
  readonly previousTrend?: MarketTrendDirection;

  /** Current trend state */
  readonly currentTrend?: MarketTrendDirection;

  /** Alert level */
  readonly alertLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';

  /** Detection timestamp */
  readonly detectedAt: Date;
}

/**
 * Trend thresholds for classification.
 */
export interface TrendThresholds {
  /** Rapid growth threshold (% per month) */
  rapidGrowthThreshold: number;

  /** Growth threshold (% per month) */
  growthThreshold: number;

  /** Decline threshold (% per month) */
  declineThreshold: number;

  /** Rapid decline threshold (% per month) */
  rapidDeclineThreshold: number;

  /** Minimum data points required for trend analysis */
  minDataPoints: number;

  /** Maximum age of data points (days) */
  maxDataAgeDays: number;
}

/**
 * Default trend thresholds.
 */
export const DEFAULT_TREND_THRESHOLDS: TrendThresholds = {
  rapidGrowthThreshold: 5.0,    // 5% per month
  growthThreshold: 1.0,         // 1% per month
  declineThreshold: -1.0,       // -1% per month
  rapidDeclineThreshold: -5.0,  // -5% per month
  minDataPoints: 3,
  maxDataAgeDays: 180,
};

/**
 * Factory function to create a market trend.
 */
export function createMarketTrend(
  careerId: string,
  trendType: MarketTrendType,
  direction: MarketTrendDirection,
  momentum: MarketTrendMomentum,
  strength: number,
  rateOfChange: number,
  confidence: number,
  dataPoints: number,
  analysisPeriod: { start: Date; end: Date },
  evidence: MarketTrend['evidence']
): MarketTrend {
  return {
    id: `trend-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    careerId,
    trendType,
    direction,
    momentum,
    strength: Math.max(0, Math.min(100, strength)),
    rateOfChange: Math.max(-100, Math.min(100, rateOfChange)),
    confidence: Math.max(0, Math.min(100, confidence)),
    dataPoints,
    analysisPeriod,
    calculatedAt: new Date(),
    evidence,
  };
}

/**
 * Get human-readable trend description.
 */
export function getTrendDescription(trend: MarketTrend): string {
  const directionDesc = {
    [MarketTrendDirection.RAPID_GROWTH]: 'rapidly growing',
    [MarketTrendDirection.GROWTH]: 'growing',
    [MarketTrendDirection.STABLE]: 'stable',
    [MarketTrendDirection.DECLINING]: 'declining',
    [MarketTrendDirection.RAPID_DECLINE]: 'rapidly declining',
  };

  const momentumDesc = {
    [MarketTrendMomentum.ACCELERATING]: 'and accelerating',
    [MarketTrendMomentum.STEADY]: 'at steady pace',
    [MarketTrendMomentum.DECELERATING]: 'but decelerating',
    [MarketTrendMomentum.REVERSING]: 'and reversing direction',
  };

  return `${trend.trendType} is ${directionDesc[trend.direction]} ${momentumDesc[trend.momentum]}`;
}
