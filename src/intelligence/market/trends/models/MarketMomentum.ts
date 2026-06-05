/**
 * CareerOS Market Intelligence - Market Momentum Model
 *
 * Measures speed of change in market trends.
 */

import type { TrendSnapshot } from './TrendSnapshot';

/**
 * Momentum calculation result.
 */
export interface MarketMomentum {
  /** Entity identifier */
  entityId: string;

  /** Metric type */
  metricType: string;

  /** Momentum score (0-100) */
  score: number;

  /** Momentum level */
  level: 'static' | 'low' | 'moderate' | 'high' | 'extreme';

  /** Direction of momentum */
  direction: 'increasing' | 'decreasing' | 'neutral';

  /** Rate of change (units per time period) */
  rateOfChange: number;

  /** Change velocity */
  velocity: number;

  /** Measurement period (days) */
  periodDays: number;

  /** Starting value */
  startValue: number;

  /** Ending value */
  endValue: number;

  /** Confidence in momentum measurement */
  confidence: number;

  /** Timestamp of calculation */
  calculatedAt: Date;
}

/**
 * Momentum trend over time.
 */
export interface MomentumTrend {
  /** Entity identifier */
  entityId: string;

  /** Historical momentum values */
  history: Array<{
    timestamp: Date;
    momentum: number;
    direction: MarketMomentum['direction'];
  }>;

  /** Peak momentum in period */
  peakMomentum: number;

  /** Trough momentum in period */
  troughMomentum: number;

  /** Average momentum */
  averageMomentum: number;

  /** Momentum volatility */
  volatility: number;

  /** Is momentum accelerating or decelerating */
  acceleration: 'accelerating' | 'decelerating' | 'stable';
}

/**
 * Calculate momentum from snapshots.
 */
export function calculateMomentum(
  snapshots: TrendSnapshot[],
  periodDays: number = 30
): MarketMomentum | null {
  if (snapshots.length < 2) return null;

  // Sort by timestamp
  const sorted = [...snapshots].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );

  const start = sorted[0];
  const end = sorted[sorted.length - 1];

  // Calculate time difference in days
  const timeDiffMs = end.timestamp.getTime() - start.timestamp.getTime();
  const timeDiffDays = timeDiffMs / (1000 * 60 * 60 * 24);

  if (timeDiffDays < 1) return null;

  // Calculate rate of change
  const valueChange = end.value - start.value;
  const rateOfChange = valueChange / timeDiffDays;

  // Calculate velocity (change per normalized time unit)
  const velocity = rateOfChange * (periodDays / timeDiffDays);

  // Calculate momentum score (0-100 based on velocity magnitude)
  const normalizedVelocity = Math.abs(velocity);
  let score: number;

  if (normalizedVelocity >= 5) {
    score = 100; // Very rapid change
  } else if (normalizedVelocity >= 3) {
    score = 80 + (normalizedVelocity - 3) * 10;
  } else if (normalizedVelocity >= 1) {
    score = 50 + (normalizedVelocity - 1) * 15;
  } else if (normalizedVelocity >= 0.5) {
    score = 25 + (normalizedVelocity - 0.5) * 50;
  } else {
    score = normalizedVelocity * 50;
  }

  score = Math.min(100, Math.max(0, score));

  // Determine level
  let level: MarketMomentum['level'];
  if (score >= 80) level = 'extreme';
  else if (score >= 60) level = 'high';
  else if (score >= 40) level = 'moderate';
  else if (score >= 20) level = 'low';
  else level = 'static';

  // Determine direction
  let direction: MarketMomentum['direction'];
  if (Math.abs(velocity) < 0.1) direction = 'neutral';
  else if (velocity > 0) direction = 'increasing';
  else direction = 'decreasing';

  // Calculate confidence
  const avgConfidence =
    sorted.reduce((sum, s) => sum + s.confidence, 0) / sorted.length;

  return {
    entityId: start.entityId,
    metricType: start.metricType,
    score: Math.round(score),
    level,
    direction,
    rateOfChange,
    velocity,
    periodDays: Math.round(timeDiffDays),
    startValue: start.value,
    endValue: end.value,
    confidence: Math.round(avgConfidence),
    calculatedAt: new Date(),
  };
}

/**
 * Calculate momentum trend over time.
 */
export function calculateMomentumTrend(
  snapshots: TrendSnapshot[],
  windowSize: number = 7
): MomentumTrend | null {
  if (snapshots.length < windowSize * 2) return null;

  const sorted = [...snapshots].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );

  const history: MomentumTrend['history'] = [];

  // Calculate rolling momentum
  for (let i = windowSize; i < sorted.length; i++) {
    const window = sorted.slice(i - windowSize, i);
    const momentum = calculateMomentum(window);

    if (momentum) {
      history.push({
        timestamp: sorted[i].timestamp,
        momentum: momentum.score,
        direction: momentum.direction,
      });
    }
  }

  if (history.length === 0) return null;

  const momentums = history.map((h) => h.momentum);
  const peakMomentum = Math.max(...momentums);
  const troughMomentum = Math.min(...momentums);
  const averageMomentum = momentums.reduce((a, b) => a + b, 0) / momentums.length;

  // Calculate volatility
  const variance =
    momentums.reduce((sum, m) => sum + Math.pow(m - averageMomentum, 2), 0) /
    momentums.length;
  const volatility = Math.sqrt(variance);

  // Determine acceleration
  const firstHalf = momentums.slice(0, Math.floor(momentums.length / 2));
  const secondHalf = momentums.slice(Math.floor(momentums.length / 2));
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  let acceleration: MomentumTrend['acceleration'];
  if (secondAvg > firstAvg * 1.1) acceleration = 'accelerating';
  else if (secondAvg < firstAvg * 0.9) acceleration = 'decelerating';
  else acceleration = 'stable';

  return {
    entityId: sorted[0].entityId,
    history,
    peakMomentum,
    troughMomentum,
    averageMomentum,
    volatility,
    acceleration,
  };
}

/**
 * Interpret momentum level.
 */
export function interpretMomentum(momentum: MarketMomentum): string {
  const parts: string[] = [];

  parts.push(`${momentum.level.toUpperCase()} momentum`);
  parts.push(`${momentum.direction}`);
  parts.push(`(${momentum.score}/100)`);

  if (momentum.level === 'extreme' || momentum.level === 'high') {
    parts.push(`- ${momentum.direction === 'increasing' ? 'Rapid growth' : 'Rapid decline'}`);
  }

  return parts.join(' ');
}

/**
 * Compare momentum values.
 */
export function compareMomentum(a: number, b: number): 'stronger' | 'weaker' | 'similar' {
  const diff = Math.abs(a - b);
  if (diff < 10) return 'similar';
  return a > b ? 'stronger' : 'weaker';
}
