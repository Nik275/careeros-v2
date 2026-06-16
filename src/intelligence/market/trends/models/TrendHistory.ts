/**
 * CareerOS Market Intelligence - Trend History Model
 *
 * Historical storage and retrieval of trend data.
 */

import type { TrendSnapshot, TrendFrequency, TrendEntityType, TrendMetricType } from './TrendSnapshot';

/**
 * Historical trend point alias.
 */
export type TrendPoint = TrendSnapshot;

/**
 * Trend history for a single entity-metric combination.
 */
export interface TrendHistory {
  /** Unique history ID */
  readonly id: string;

  /** Entity identifier */
  readonly entityId: string;

  /** Entity type */
  readonly entityType: TrendEntityType;

  /** Metric type */
  readonly metricType: TrendMetricType;

  /** Frequency of snapshots */
  readonly frequency: TrendFrequency;

  /** Historical snapshots */
  readonly snapshots: TrendSnapshot[];

  /** First data point timestamp */
  readonly startDate: Date;

  /** Last data point timestamp */
  readonly endDate: Date;

  /** Total number of data points */
  readonly dataPointCount: number;

  /** Metadata */
  readonly metadata: {
    createdAt: Date;
    updatedAt: Date;
    version: number;
    sourceCount: number;
  };
}

/**
 * Query parameters for trend history.
 */
export interface TrendHistoryQuery {
  /** Entity ID filter */
  entityId?: string;

  /** Entity type filter */
  entityType?: TrendEntityType;

  /** Metric type filter */
  metricType?: TrendMetricType;

  /** Start date */
  startDate?: Date;

  /** End date */
  endDate?: Date;

  /** Minimum data points required */
  minDataPoints?: number;

  /** Frequency filter */
  frequency?: TrendFrequency;

  /** Limit results */
  limit?: number;
}

/**
 * Trend history statistics.
 */
export interface TrendHistoryStats {
  /** Entity identifier */
  entityId: string;

  /** Metric type */
  metricType: TrendMetricType;

  /** Total snapshots */
  totalSnapshots: number;

  /** Date range */
  dateRange: { start: Date; end: Date };

  /** Value statistics */
  values: {
    min: number;
    max: number;
    average: number;
    median: number;
    stdDev: number;
  };

  /** Trend statistics */
  trend: {
    overallChange: number;
    averageChange: number;
    volatility: number;
  };

  /** Data quality */
  quality: {
    coverage: number; // % of expected data points
    avgConfidence: number;
    sourceDiversity: number;
  };
}

/**
 * Create empty trend history.
 */
export function createTrendHistory(
  entityId: string,
  entityType: TrendEntityType,
  metricType: TrendMetricType,
  frequency: TrendFrequency = 'daily'
): TrendHistory {
  const now = new Date();

  return {
    id: `history-${entityId}-${metricType}-${frequency}`,
    entityId,
    entityType,
    metricType,
    frequency,
    snapshots: [],
    startDate: now,
    endDate: now,
    dataPointCount: 0,
    metadata: {
      createdAt: now,
      updatedAt: now,
      version: 1,
      sourceCount: 0,
    },
  };
}

/**
 * Add snapshot to history.
 */
export function addSnapshotToHistory(
  history: TrendHistory,
  snapshot: TrendSnapshot
): TrendHistory {
  // Validate snapshot matches history
  if (
    snapshot.entityId !== history.entityId ||
    snapshot.metricType !== history.metricType
  ) {
    throw new Error('Snapshot does not match history entity/metric');
  }

  const updatedSnapshots = [...history.snapshots, snapshot];

  // Sort by timestamp
  updatedSnapshots.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  // Update source count
  const allSources = new Set(updatedSnapshots.flatMap((s) => s.sources));

  return {
    ...history,
    snapshots: updatedSnapshots,
    startDate: updatedSnapshots[0].timestamp,
    endDate: updatedSnapshots[updatedSnapshots.length - 1].timestamp,
    dataPointCount: updatedSnapshots.length,
    metadata: {
      ...history.metadata,
      updatedAt: new Date(),
      sourceCount: allSources.size,
    },
  };
}

/**
 * Get snapshots within time range.
 */
export function getSnapshotsInRange(
  history: TrendHistory,
  start: Date,
  end: Date
): TrendSnapshot[] {
  return history.snapshots.filter(
    (s) => s.timestamp.getTime() >= start.getTime() && s.timestamp.getTime() <= end.getTime()
  );
}

/**
 * Get recent snapshots.
 */
export function getRecentSnapshots(
  history: TrendHistory,
  count: number
): TrendSnapshot[] {
  return history.snapshots.slice(-count);
}

/**
 * Calculate history statistics.
 */
export function calculateHistoryStats(history: TrendHistory): TrendHistoryStats | null {
  if (history.snapshots.length === 0) return null;

  const values = history.snapshots.map((s) => s.value);
  const sorted = [...values].sort((a, b) => a - b);

  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const average = values.reduce((a, b) => a + b, 0) / values.length;
  const median = sorted[Math.floor(sorted.length / 2)];

  // Standard deviation
  const variance = values.reduce((sum, v) => sum + Math.pow(v - average, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // Overall change
  const overallChange = ((values[values.length - 1] - values[0]) / values[0]) * 100;

  // Average change
  let totalChange = 0;
  for (let i = 1; i < values.length; i++) {
    totalChange += Math.abs(values[i] - values[i - 1]);
  }
  const averageChange = totalChange / (values.length - 1);

  // Volatility
  const volatility = stdDev;

  // Coverage (assuming daily for now)
  const daysSpan =
    (history.endDate.getTime() - history.startDate.getTime()) / (1000 * 60 * 60 * 24);
  const expectedPoints = daysSpan + 1;
  const coverage = (history.snapshots.length / expectedPoints) * 100;

  // Average confidence
  const avgConfidence =
    history.snapshots.reduce((sum, s) => sum + s.confidence, 0) / history.snapshots.length;

  return {
    entityId: history.entityId,
    metricType: history.metricType,
    totalSnapshots: history.snapshots.length,
    dateRange: { start: history.startDate, end: history.endDate },
    values: {
      min,
      max,
      average: Math.round(average),
      median,
      stdDev: Math.round(stdDev),
    },
    trend: {
      overallChange: Math.round(overallChange),
      averageChange: Math.round(averageChange),
      volatility: Math.round(volatility),
    },
    quality: {
      coverage: Math.round(coverage),
      avgConfidence: Math.round(avgConfidence),
      sourceDiversity: history.metadata.sourceCount,
    },
  };
}

/**
 * Resample history to different frequency.
 */
export function resampleHistory(
  history: TrendHistory,
  targetFrequency: TrendFrequency
): TrendSnapshot[] {
  // Group snapshots by target frequency
  const groups = new Map<string, TrendSnapshot[]>();

  for (const snapshot of history.snapshots) {
    const key = getFrequencyKey(snapshot.timestamp, targetFrequency);
    const existing = groups.get(key) ?? [];
    existing.push(snapshot);
    groups.set(key, existing);
  }

  // Aggregate each group
  const resampled: TrendSnapshot[] = [];

  for (const [key, group] of groups) {
    if (group.length === 0) continue;

    const avgValue =
      group.reduce((sum, s) => sum + s.value * s.confidence, 0) /
      group.reduce((sum, s) => sum + s.confidence, 0);

    const totalDataPoints = group.reduce((sum, s) => sum + s.dataPoints, 0);
    const allSources = [...new Set(group.flatMap((s) => s.sources))];
    const avgConfidence =
      group.reduce((sum, s) => sum + s.confidence, 0) / group.length;

    resampled.push({
      id: `resampled-${key}`,
      entityId: history.entityId,
      entityType: history.entityType,
      metricType: history.metricType,
      timestamp: new Date(group[0].timestamp),
      value: Math.round(avgValue),
      dataPoints: totalDataPoints,
      sources: allSources,
      confidence: Math.round(avgConfidence),
      frequency: targetFrequency,
    });
  }

  return resampled.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

/**
 * Get frequency key for grouping.
 */
function getFrequencyKey(date: Date, frequency: TrendFrequency): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const week = Math.floor(day / 7);
  const quarter = Math.floor(month / 3);

  switch (frequency) {
    case 'daily':
      return `${year}-${month}-${day}`;
    case 'weekly':
      return `${year}-${month}-W${week}`;
    case 'monthly':
      return `${year}-${month}`;
    case 'quarterly':
      return `${year}-Q${quarter}`;
    case 'yearly':
      return `${year}`;
    default:
      return `${year}-${month}-${day}`;
  }
}

/**
 * Merge multiple histories.
 */
export function mergeHistories(histories: TrendHistory[]): TrendHistory | null {
  if (histories.length === 0) return null;
  if (histories.length === 1) return histories[0];

  const base = histories[0];
  let merged = { ...base };

  for (let i = 1; i < histories.length; i++) {
    for (const snapshot of histories[i].snapshots) {
      merged = addSnapshotToHistory(merged, snapshot);
    }
  }

  return merged;
}

/**
 * Detect gaps in history.
 */
export function detectHistoryGaps(
  history: TrendHistory,
  expectedFrequency: TrendFrequency = 'daily'
): Array<{ start: Date; end: Date; durationDays: number }> {
  if (history.snapshots.length < 2) return [];

  const gaps: Array<{ start: Date; end: Date; durationDays: number }> = [];
  const sorted = [...history.snapshots].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );

  const expectedInterval = getExpectedInterval(expectedFrequency);

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const diff = curr.timestamp.getTime() - prev.timestamp.getTime();

    if (diff > expectedInterval * 2) {
      gaps.push({
        start: prev.timestamp,
        end: curr.timestamp,
        durationDays: Math.round(diff / (1000 * 60 * 60 * 24)),
      });
    }
  }

  return gaps;
}

/**
 * Get expected interval in milliseconds.
 */
function getExpectedInterval(frequency: TrendFrequency): number {
  const day = 24 * 60 * 60 * 1000;

  switch (frequency) {
    case 'daily':
      return day;
    case 'weekly':
      return day * 7;
    case 'monthly':
      return day * 30;
    case 'quarterly':
      return day * 90;
    case 'yearly':
      return day * 365;
    default:
      return day;
  }
}
