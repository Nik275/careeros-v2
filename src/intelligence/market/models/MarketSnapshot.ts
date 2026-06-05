/**
 * CareerOS Market Intelligence - Market Snapshot Model
 *
 * Represents the current market state for a career at a point in time.
 * Snapshots provide time-series data for trend analysis.
 */

/**
 * Unique identifier for market snapshots.
 */
export type MarketSnapshotId = string;

/**
 * Market snapshot representing current state for a career.
 * 
 * This is a point-in-time capture of all market intelligence for a career.
 */
export interface MarketSnapshot {
  /** Unique identifier */
  readonly id: MarketSnapshotId;

  /** Career identifier */
  readonly careerId: string;

  /** Snapshot timestamp */
  readonly timestamp: Date;

  /** Demand trend (-100 to +100, positive = increasing) */
  readonly demandTrend: number;

  /** Salary trend (-100 to +100, positive = increasing) */
  readonly salaryTrend: number;

  /** Hiring trend (-100 to +100, positive = increasing) */
  readonly hiringTrend: number;

  /** Automation risk (0-100, higher = more risk) */
  readonly automationRisk: number;

  /** Future outlook score (0-100) */
  readonly futureOutlook: number;

  /** Confidence in snapshot (0-100) */
  readonly confidence: number;

  /** Data freshness (hours since last update) */
  readonly dataFreshness: number;

  /** Snapshot version */
  readonly version: number;

  /** Component scores */
  readonly components: {
    /** Demand component */
    demand: {
      score: number;
      jobPostingsChange: number;
      applicationsPerJob: number;
      timeToFill: number;
    };

    /** Salary component */
    salary: {
      score: number;
      entryLevelChange: number;
      midLevelChange: number;
      seniorLevelChange: number;
    };

    /** Hiring component */
    hiring: {
      score: number;
      hiringRate: number;
      offerAcceptanceRate: number;
    };

    /** Automation component */
    automation: {
      score: number;
      taskAutomationPotential: number;
      aiDisruptionIndex: number;
    };

    /** Future outlook component */
    outlook: {
      score: number;
      sectorGrowth: number;
      investmentTrend: number;
      skillRelevance: number;
    };
  };

  /** Raw signal summary */
  readonly signalSummary: {
    /** Total signals in period */
    totalSignals: number;

    /** Signals by type */
    byType: Record<string, number>;

    /** Signals by source */
    bySource: Record<string, number>;

    /** Signal quality (average confidence) */
    averageSignalQuality: number;
  };

  /** Comparison to previous snapshot */
  readonly changeFromPrevious?: {
    /** Time period */
    periodDays: number;

    /** Change in demand trend */
    demandTrendChange: number;

    /** Change in salary trend */
    salaryTrendChange: number;

    /** Change in hiring trend */
    hiringTrendChange: number;

    /** Change in automation risk */
    automationRiskChange: number;

    /** Change in future outlook */
    futureOutlookChange: number;

    /** Significant change detected */
    significantChange: boolean;
  };
}

/**
 * Multi-career market snapshot for comparative analysis.
 */
export interface MarketSnapshotCollection {
  /** Collection timestamp */
  readonly timestamp: Date;

  /** Career snapshots */
  readonly snapshots: MarketSnapshot[];

  /** Market summary statistics */
  readonly summary: {
    /** Average demand trend across all careers */
    averageDemandTrend: number;

    /** Average salary trend */
    averageSalaryTrend: number;

    /** Careers with positive outlook */
    positiveOutlookCount: number;

    /** Careers with negative outlook */
    negativeOutlookCount: number;

    /** Top growing careers */
    topGrowing: Array<{ careerId: string; growthRate: number }>;

    /** Top declining careers */
    topDeclining: Array<{ careerId: string; declineRate: number }>;
  };

  /** Collection metadata */
  readonly metadata: {
    /** Total careers in collection */
    totalCareers: number;

    /** Careers with complete data */
    completeDataCount: number;

    /** Average confidence across all snapshots */
    averageConfidence: number;

    /** Data freshness */
    dataFreshness: number;
  };
}

/**
 * Historical market data for trend analysis.
 */
export interface MarketHistory {
  /** Career identifier */
  readonly careerId: string;

  /** Time series of snapshots */
  readonly snapshots: MarketSnapshot[];

  /** Time range */
  readonly timeRange: {
    start: Date;
    end: Date;
  };

  /** Trend analysis */
  readonly trendAnalysis: {
    /** Overall demand trend direction */
    demandTrendDirection: 'rising' | 'falling' | 'stable';

    /** Overall salary trend direction */
    salaryTrendDirection: 'rising' | 'falling' | 'stable';

    /** Volatility score (0-100) */
    volatility: number;

    /** Acceleration (change in trend rate) */
    acceleration: number;
  };

  /** Key events during period */
  readonly keyEvents: Array<{
    date: Date;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
}

/**
 * Market snapshot comparison.
 */
export interface MarketSnapshotComparison {
  /** Base snapshot */
  readonly base: MarketSnapshot;

  /** Comparison snapshot */
  readonly comparison: MarketSnapshot;

  /** Time difference in days */
  readonly timeDifferenceDays: number;

  /** Score changes */
  readonly changes: {
    demandTrend: number;
    salaryTrend: number;
    hiringTrend: number;
    automationRisk: number;
    futureOutlook: number;
    confidence: number;
  };

  /** Change classification */
  readonly classification: {
    demandChange: 'significant_increase' | 'increase' | 'stable' | 'decrease' | 'significant_decrease';
    salaryChange: 'significant_increase' | 'increase' | 'stable' | 'decrease' | 'significant_decrease';
    overallChange: 'improved' | 'stable' | 'declined';
  };

  /** Whether this represents significant market shift */
  readonly isSignificantShift: boolean;
}

/**
 * Factory function to create a market snapshot.
 */
export function createMarketSnapshot(
  careerId: string,
  scores: {
    demandTrend: number;
    salaryTrend: number;
    hiringTrend: number;
    automationRisk: number;
    futureOutlook: number;
  },
  confidence: number,
  components: MarketSnapshot['components'],
  signalSummary: MarketSnapshot['signalSummary'],
  previousSnapshot?: MarketSnapshot
): MarketSnapshot {
  const timestamp = new Date();

  // Calculate change from previous if available
  let changeFromPrevious: MarketSnapshot['changeFromPrevious'] | undefined;
  if (previousSnapshot) {
    const periodDays = Math.round(
      (timestamp.getTime() - previousSnapshot.timestamp.getTime()) / (1000 * 60 * 60 * 24)
    );

    const demandTrendChange = scores.demandTrend - previousSnapshot.demandTrend;
    const salaryTrendChange = scores.salaryTrend - previousSnapshot.salaryTrend;
    const hiringTrendChange = scores.hiringTrend - previousSnapshot.hiringTrend;
    const automationRiskChange = scores.automationRisk - previousSnapshot.automationRisk;
    const futureOutlookChange = scores.futureOutlook - previousSnapshot.futureOutlook;

    // Significant change if any component changed by more than 10
    const significantChange =
      Math.abs(demandTrendChange) > 10 ||
      Math.abs(salaryTrendChange) > 10 ||
      Math.abs(hiringTrendChange) > 10 ||
      Math.abs(automationRiskChange) > 10 ||
      Math.abs(futureOutlookChange) > 10;

    changeFromPrevious = {
      periodDays,
      demandTrendChange,
      salaryTrendChange,
      hiringTrendChange,
      automationRiskChange,
      futureOutlookChange,
      significantChange,
    };
  }

  return {
    id: `snapshot-${careerId}-${Date.now()}`,
    careerId,
    timestamp,
    demandTrend: Math.max(-100, Math.min(100, scores.demandTrend)),
    salaryTrend: Math.max(-100, Math.min(100, scores.salaryTrend)),
    hiringTrend: Math.max(-100, Math.min(100, scores.hiringTrend)),
    automationRisk: Math.max(0, Math.min(100, scores.automationRisk)),
    futureOutlook: Math.max(0, Math.min(100, scores.futureOutlook)),
    confidence: Math.max(0, Math.min(100, confidence)),
    dataFreshness: 0, // Fresh snapshot
    version: previousSnapshot ? previousSnapshot.version + 1 : 1,
    components,
    signalSummary,
    changeFromPrevious,
  };
}

/**
 * Validate a market snapshot.
 */
export function validateMarketSnapshot(snapshot: MarketSnapshot): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  if (!snapshot.careerId || snapshot.careerId.trim() === '') {
    issues.push('Career ID is required');
  }

  const scores = [
    { name: 'demandTrend', value: snapshot.demandTrend, range: [-100, 100] },
    { name: 'salaryTrend', value: snapshot.salaryTrend, range: [-100, 100] },
    { name: 'hiringTrend', value: snapshot.hiringTrend, range: [-100, 100] },
    { name: 'automationRisk', value: snapshot.automationRisk, range: [0, 100] },
    { name: 'futureOutlook', value: snapshot.futureOutlook, range: [0, 100] },
    { name: 'confidence', value: snapshot.confidence, range: [0, 100] },
  ];

  for (const score of scores) {
    if (score.value < score.range[0] || score.value > score.range[1]) {
      issues.push(
        `${score.name} must be between ${score.range[0]} and ${score.range[1]}`
      );
    }
  }

  if (snapshot.signalSummary.totalSignals === 0) {
    issues.push('Snapshot should have at least one signal');
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

/**
 * Compare two market snapshots.
 */
export function compareMarketSnapshots(
  base: MarketSnapshot,
  comparison: MarketSnapshot
): MarketSnapshotComparison {
  const timeDifferenceMs = comparison.timestamp.getTime() - base.timestamp.getTime();
  const timeDifferenceDays = Math.round(timeDifferenceMs / (1000 * 60 * 60 * 24));

  const changes = {
    demandTrend: comparison.demandTrend - base.demandTrend,
    salaryTrend: comparison.salaryTrend - base.salaryTrend,
    hiringTrend: comparison.hiringTrend - base.hiringTrend,
    automationRisk: comparison.automationRisk - base.automationRisk,
    futureOutlook: comparison.futureOutlook - base.futureOutlook,
    confidence: comparison.confidence - base.confidence,
  };

  // Classify changes
  const classifyChange = (change: number): MarketSnapshotComparison['classification']['demandChange'] => {
    if (change > 15) return 'significant_increase';
    if (change > 5) return 'increase';
    if (change < -15) return 'significant_decrease';
    if (change < -5) return 'decrease';
    return 'stable';
  };

  const overallScore =
    (changes.demandTrend + changes.salaryTrend + changes.hiringTrend + changes.futureOutlook) / 4;

  let overallChange: MarketSnapshotComparison['classification']['overallChange'];
  if (overallScore > 10) overallChange = 'improved';
  else if (overallScore < -10) overallChange = 'declined';
  else overallChange = 'stable';

  // Significant shift if any major component changed by >20
  const isSignificantShift =
    Math.abs(changes.demandTrend) > 20 ||
    Math.abs(changes.salaryTrend) > 20 ||
    Math.abs(changes.automationRisk) > 20;

  return {
    base,
    comparison,
    timeDifferenceDays,
    changes,
    classification: {
      demandChange: classifyChange(changes.demandTrend),
      salaryChange: classifyChange(changes.salaryTrend),
      overallChange,
    },
    isSignificantShift,
  };
}

/**
 * Create a collection of snapshots.
 */
export function createSnapshotCollection(
  snapshots: MarketSnapshot[]
): MarketSnapshotCollection {
  const timestamp = new Date();

  // Calculate summary statistics
  const averageDemandTrend =
    snapshots.reduce((sum, s) => sum + s.demandTrend, 0) / snapshots.length;
  const averageSalaryTrend =
    snapshots.reduce((sum, s) => sum + s.salaryTrend, 0) / snapshots.length;

  const positiveOutlookCount = snapshots.filter((s) => s.futureOutlook > 60).length;
  const negativeOutlookCount = snapshots.filter((s) => s.futureOutlook < 40).length;

  // Top growing careers
  const topGrowing = snapshots
    .map((s) => ({ careerId: s.careerId, growthRate: s.demandTrend }))
    .sort((a, b) => b.growthRate - a.growthRate)
    .slice(0, 5);

  // Top declining careers
  const topDeclining = snapshots
    .map((s) => ({ careerId: s.careerId, declineRate: -s.demandTrend }))
    .sort((a, b) => b.declineRate - a.declineRate)
    .slice(0, 5);

  const averageConfidence =
    snapshots.reduce((sum, s) => sum + s.confidence, 0) / snapshots.length;

  return {
    timestamp,
    snapshots,
    summary: {
      averageDemandTrend: Math.round(averageDemandTrend),
      averageSalaryTrend: Math.round(averageSalaryTrend),
      positiveOutlookCount,
      negativeOutlookCount,
      topGrowing,
      topDeclining,
    },
    metadata: {
      totalCareers: snapshots.length,
      completeDataCount: snapshots.filter((s) => s.confidence >= 70).length,
      averageConfidence: Math.round(averageConfidence),
      dataFreshness: Math.max(...snapshots.map((s) => s.dataFreshness)),
    },
  };
}
