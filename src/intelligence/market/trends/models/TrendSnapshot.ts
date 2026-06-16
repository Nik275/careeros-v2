/**
 * CareerOS Market Intelligence - Trend Snapshot Model
 *
 * Temporal data point for tracking market evolution.
 */

/**
 * Types of entities that can have trends tracked.
 */
export type TrendEntityType = 'career' | 'skill' | 'industry' | 'region';

/**
 * Frequency of trend snapshots.
 */
export type TrendFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

/**
 * Backward-compatible alias for trend snapshot frequency.
 */
export type SnapshotFrequency = TrendFrequency;

/**
 * Types of metrics that can be tracked over time.
 */
export type TrendMetricType =
  | 'demand'
  | 'salary'
  | 'growth'
  | 'scarcity'
  | 'opportunity'
  | 'job_postings'
  | 'skill_demand'
  | 'investment'
  | 'confidence'
  | 'expansion'
  | 'hiring'
  | 'remote_opportunity'
  | 'startup_activity';

/**
 * Single temporal data point.
 */
export interface TrendSnapshot {
  /** Unique snapshot ID */
  readonly id: string;

  /** Entity identifier */
  readonly entityId: string;

  /** Type of entity */
  readonly entityType: TrendEntityType;

  /** Metric being tracked */
  readonly metricType: TrendMetricType;

  /** Timestamp of snapshot */
  readonly timestamp: Date;

  /** Measured value (0-100) */
  readonly value: number;

  /** Data point count in this snapshot */
  readonly dataPoints: number;

  /** Sources contributing to this snapshot */
  readonly sources: string[];

  /** Confidence in this snapshot */
  readonly confidence: number;

  /** Snapshot frequency */
  readonly frequency: TrendFrequency;

  /** Metadata */
  readonly metadata?: {
    geography?: string;
    seasonallyAdjusted?: boolean;
    outlier?: boolean;
  };
}

/**
 * Create a new trend snapshot.
 */
export function createTrendSnapshot(
  entityId: string,
  entityType: TrendEntityType,
  metricType: TrendMetricType,
  value: number,
  options?: {
    frequency?: TrendFrequency;
    dataPoints?: number;
    sources?: string[];
    confidence?: number;
    metadata?: TrendSnapshot['metadata'];
  }
): TrendSnapshot {
  return {
    id: `snapshot-${entityId}-${metricType}-${Date.now()}`,
    entityId,
    entityType,
    metricType,
    timestamp: new Date(),
    value: Math.max(0, Math.min(100, value)),
    dataPoints: options?.dataPoints ?? 1,
    sources: options?.sources ?? [],
    confidence: options?.confidence ?? 50,
    frequency: options?.frequency ?? 'daily',
    metadata: options?.metadata,
  };
}

/**
 * Aggregate multiple snapshots into a single snapshot.
 */
export function aggregateSnapshots(
  snapshots: TrendSnapshot[],
  entityId: string,
  entityType: TrendEntityType,
  metricType: TrendMetricType
): TrendSnapshot | null {
  if (snapshots.length === 0) return null;

  const validSnapshots = snapshots.filter((s) => s.confidence > 0);
  if (validSnapshots.length === 0) return null;

  // Weighted average by confidence
  const totalWeight = validSnapshots.reduce((sum, s) => sum + s.confidence, 0);
  const weightedValue = validSnapshots.reduce(
    (sum, s) => sum + s.value * s.confidence,
    0
  ) / totalWeight;

  const allSources = [...new Set(validSnapshots.flatMap((s) => s.sources))];

  return createTrendSnapshot(entityId, entityType, metricType, weightedValue, {
    frequency: validSnapshots[0].frequency,
    dataPoints: validSnapshots.reduce((sum, s) => sum + s.dataPoints, 0),
    sources: allSources,
    confidence: Math.round(totalWeight / validSnapshots.length),
  });
}

/**
 * Filter snapshots by time range.
 */
export function filterSnapshotsByTime(
  snapshots: TrendSnapshot[],
  start: Date,
  end: Date
): TrendSnapshot[] {
  return snapshots.filter(
    (s) => s.timestamp.getTime() >= start.getTime() && s.timestamp.getTime() <= end.getTime()
  );
}

/**
 * Get latest snapshot.
 */
export function getLatestSnapshot(snapshots: TrendSnapshot[]): TrendSnapshot | null {
  if (snapshots.length === 0) return null;

  return snapshots.reduce((latest, current) =>
    current.timestamp.getTime() > latest.timestamp.getTime() ? current : latest
  );
}

/**
 * Calculate change between two snapshots.
 */
export function calculateSnapshotChange(
  current: TrendSnapshot,
  previous: TrendSnapshot
): {
  absoluteChange: number;
  percentageChange: number;
  direction: 'increasing' | 'decreasing' | 'stable';
} {
  const absoluteChange = current.value - previous.value;
  const percentageChange = previous.value !== 0
    ? (absoluteChange / previous.value) * 100
    : 0;

  const threshold = 2; // 2% threshold for stability
  let direction: 'increasing' | 'decreasing' | 'stable';

  if (percentageChange > threshold) {
    direction = 'increasing';
  } else if (percentageChange < -threshold) {
    direction = 'decreasing';
  } else {
    direction = 'stable';
  }

  return {
    absoluteChange,
    percentageChange,
    direction,
  };
}

/**
 * Validate a trend snapshot.
 */
export function validateTrendSnapshot(snapshot: TrendSnapshot): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!snapshot.entityId) {
    errors.push('Entity ID is required');
  }

  if (snapshot.value < 0 || snapshot.value > 100) {
    errors.push(`Value must be 0-100, got ${snapshot.value}`);
  }

  if (snapshot.confidence < 0 || snapshot.confidence > 100) {
    errors.push(`Confidence must be 0-100, got ${snapshot.confidence}`);
  }

  if (snapshot.dataPoints < 1) {
    errors.push('At least 1 data point required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
