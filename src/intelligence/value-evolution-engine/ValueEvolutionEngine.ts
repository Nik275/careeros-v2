/**
 * Value Evolution Engine
 *
 * Tracks how student values evolve over time.
 *
 * Purpose:
 *   - Track 8 core values: Money, Status, Impact, Freedom, Stability,
 *     Learning, Family Approval, Optionality
 *   - Store historical value snapshots
 *   - Detect value drift, stability, and major shifts
 *   - Generate evolution analysis and forecasts
 *
 * Design Principles:
 *   - Deterministic algorithms
 *   - Explainable detection logic
 *   - Strong typing
 *   - Compatible with Utility Engine
 *
 * Example Usage:
 *   const engine = new ValueEvolutionEngine();
 *
 *   // Add snapshot
 *   engine.addSnapshot({
 *     studentId: 'student-123',
 *     timestamp: Date.now(),
 *     values: {
 *       income: 0.8,
 *       status: 0.6,
 *       socialImpact: 0.4,
 *       freedom: 0.5,
 *       stability: 0.3,
 *       growth: 0.7,
 *       familyApproval: 0.9,
 *       optionality: 0.4,
 *     },
 *     source: 'explicit-assessment',
 *     context: { lifeStage: 'early-career' },
 *   });
 *
 *   // Analyze evolution
 *   const analysis = engine.analyze({ studentId: 'student-123' });
 *   console.log(analysis.dominantValue.current); // Current dominant value
 *   console.log(analysis.evolutions['freedom'].pattern); // How freedom is evolving
 *   console.log(analysis.forecast?.predictedDominantValue); // Future prediction
 */

import type {
  EntityId,
  BeliefTimestamp,
} from '../types/index.js';

import type {
  ValueSnapshot,
  ValueHistory,
  TrackedValueId,
  ValueEvolution,
  ValueShift,
  ValueDrift,
  ValueStability,
  DominantValueAnalysis,
  ValueTrajectoryForecast,
  ValueEvolutionAnalysis,
  ValueInsight,
  ValueEvolutionRecommendation,
  DominantValueSnapshot,
  ValueEvolutionInput,
  ValueEvolutionOptions,
  ValueEvolutionConfig,
} from './types.js';

import {
  TRACKED_VALUES,
  DEFAULT_VALUE_EVOLUTION_CONFIG,
  VALUE_DISPLAY_NAMES,
} from './types.js';

import {
  detectEvolutionPattern,
  detectValueShifts,
  detectValueDrift,
  analyzeValueStability,
  analyzeDominantValues,
  forecastTrajectory,
} from './detection.js';

// ============================================================================
// VALUE EVOLUTION ENGINE
// ============================================================================

/**
 * Engine for tracking and analyzing value evolution over time.
 */
export class ValueEvolutionEngine {
  private config: ValueEvolutionConfig;
  private histories: Map<EntityId, ValueHistory> = new Map();

  constructor(config: Partial<ValueEvolutionConfig> = {}) {
    this.config = { ...DEFAULT_VALUE_EVOLUTION_CONFIG, ...config };
  }

  /**
   * Get current configuration.
   */
  getConfig(): ValueEvolutionConfig {
    return { ...this.config };
  }

  /**
   * Update configuration.
   */
  updateConfig(config: Partial<ValueEvolutionConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // ========================================================================
  // SNAPSHOT MANAGEMENT
  // ========================================================================

  /**
   * Add a new value snapshot.
   */
  addSnapshot(snapshot: Omit<ValueSnapshot, 'id'>): ValueSnapshot {
    const fullSnapshot: ValueSnapshot = {
      ...snapshot,
      id: `snapshot_${snapshot.studentId}_${snapshot.timestamp}`,
    };

    let history = this.histories.get(snapshot.studentId);

    if (!history) {
      history = this.createEmptyHistory(snapshot.studentId);
      this.histories.set(snapshot.studentId, history);
    }

    // Add snapshot in chronological order
    const insertIndex = history.snapshots.findIndex(
      s => s.timestamp > fullSnapshot.timestamp
    );

    if (insertIndex === -1) {
      history.snapshots.push(fullSnapshot);
    } else {
      history.snapshots.splice(insertIndex, 0, fullSnapshot);
    }

    // Enforce max snapshots limit
    if (history.snapshots.length > this.config.maxSnapshots) {
      history.snapshots = history.snapshots.slice(-this.config.maxSnapshots);
    }

    // Update history metadata
    history.lastUpdatedAt = Date.now();
    history.summary = this.calculateHistorySummary(history);

    return fullSnapshot;
  }

  /**
   * Add multiple snapshots at once.
   */
  addSnapshots(snapshots: Omit<ValueSnapshot, 'id'>[]): ValueSnapshot[] {
    return snapshots.map(s => this.addSnapshot(s));
  }

  /**
   * Get value history for a student.
   */
  getHistory(studentId: EntityId): ValueHistory | undefined {
    return this.histories.get(studentId);
  }

  /**
   * Get all snapshots for a student.
   */
  getSnapshots(studentId: EntityId): ValueSnapshot[] {
    return this.getHistory(studentId)?.snapshots ?? [];
  }

  /**
   * Get the latest snapshot for a student.
   */
  getLatestSnapshot(studentId: EntityId): ValueSnapshot | undefined {
    const history = this.getHistory(studentId);
    if (!history || history.snapshots.length === 0) return undefined;
    return history.snapshots[history.snapshots.length - 1];
  }

  /**
   * Get snapshots within a time range.
   */
  getSnapshotsInRange(
    studentId: EntityId,
    startTime: number,
    endTime: number
  ): ValueSnapshot[] {
    const history = this.getHistory(studentId);
    if (!history) return [];

    return history.snapshots.filter(
      s => s.timestamp >= startTime && s.timestamp <= endTime
    );
  }

  /**
   * Clear history for a student.
   */
  clearHistory(studentId: EntityId): void {
    this.histories.delete(studentId);
  }

  // ========================================================================
  // ANALYSIS
  // ========================================================================

  /**
   * Perform complete value evolution analysis.
   *
   * This is the primary API for the engine.
   */
  analyze(input: ValueEvolutionInput): ValueEvolutionAnalysis {
    const startedAt = Date.now();

    // Get or create history
    let history = input.history ?? this.getHistory(input.studentId);

    // Add any new snapshots
    if (input.newSnapshots && input.newSnapshots.length > 0) {
      for (const snapshot of input.newSnapshots) {
        this.addSnapshot({ ...snapshot, studentId: input.studentId });
      }
      history = this.getHistory(input.studentId);
    }

    // Create empty history if none exists
    if (!history) {
      history = this.createEmptyHistory(input.studentId);
    }

    const options = { ...DEFAULT_VALUE_EVOLUTION_CONFIG, ...input.options };

    // Check minimum snapshots
    if (history.snapshots.length < options.minSnapshots!) {
      return this.createMinimalAnalysis(input.studentId, history, startedAt);
    }

    // Perform analyses
    const evolutions = this.analyzeEvolutions(history);
    const shifts = options.detectShifts !== false
      ? detectValueShifts(history.snapshots, options.shiftThreshold)
      : [];
    const drift = detectValueDrift(history.snapshots, options.driftSensitivity);
    const stability = analyzeValueStability(history.snapshots, options.stabilityThreshold);
    const dominantValue = analyzeDominantValues(history.snapshots);
    const dominantValueTimeline = this.buildDominantValueTimeline(history);

    // Generate forecast if requested
    const forecast = options.generateForecast !== false
      ? forecastTrajectory(history.snapshots, options.forecastHorizonMonths)
      : undefined;

    // Generate insights
    const insights = options.generateInsights !== false
      ? this.generateInsights(history, evolutions, shifts, dominantValue)
      : [];

    // Generate recommendations
    const recommendations = options.generateRecommendations !== false
      ? this.generateRecommendations(evolutions, shifts, stability, dominantValue)
      : [];

    return {
      id: `analysis_${input.studentId}_${startedAt}`,
      studentId: input.studentId,
      generatedAt: startedAt,
      history,
      evolutions,
      shifts,
      drift,
      stability,
      dominantValue,
      dominantValueTimeline,
      forecast,
      insights,
      recommendations,
    };
  }

  /**
   * Quick analysis with default settings.
   */
  quickAnalyze(studentId: EntityId): ValueEvolutionAnalysis {
    return this.analyze({ studentId });
  }

  /**
   * Compare two points in time.
   */
  comparePoints(
    studentId: EntityId,
    timeA: number,
    timeB: number
  ): { valueA: ValueSnapshot; valueB: ValueSnapshot; changes: Record<TrackedValueId, number> } | null {
    const snapshotA = this.getSnapshotsInRange(studentId, timeA, timeA + 1)[0];
    const snapshotB = this.getSnapshotsInRange(studentId, timeB, timeB + 1)[0];

    if (!snapshotA || !snapshotB) return null;

    const changes = {} as Record<TrackedValueId, number>;
    for (const valueId of TRACKED_VALUES) {
      changes[valueId] = snapshotB.values[valueId] - snapshotA.values[valueId];
    }

    return { valueA: snapshotA, valueB: snapshotB, changes };
  }

  /**
   * Get evolution for a specific value.
   */
  getValueEvolution(
    studentId: EntityId,
    valueId: TrackedValueId
  ): ValueEvolution | undefined {
    const history = this.getHistory(studentId);
    if (!history || history.snapshots.length < 2) return undefined;

    return detectEvolutionPattern(history.snapshots, valueId, this.config);
  }

  // ========================================================================
  // INSIGHTS & RECOMMENDATIONS
  // ========================================================================

  /**
   * Generate insights from analysis.
   */
  private generateInsights(
    history: ValueHistory,
    evolutions: Record<TrackedValueId, ValueEvolution>,
    shifts: ValueShift[],
    dominantValue: DominantValueAnalysis
  ): ValueInsight[] {
    const insights: ValueInsight[] = [];

    // Detect value shift insight
    if (shifts.length > 0) {
      const majorShifts = shifts.filter(s => s.significance === 'major' || s.significance === 'transformative');
      if (majorShifts.length > 0) {
        insights.push({
          id: `insight_shift_${Date.now()}`,
          type: 'value-shift',
          description: `${majorShifts.length} major value shift(s) detected`,
          evidence: majorShifts.map(s => s.explanation),
          confidence: 0.85,
        });
      }
    }

    // Detect emerging value
    const emerging = Object.values(evolutions).filter(e => e.pattern === 'emerge');
    if (emerging.length > 0) {
      insights.push({
        id: `insight_emerge_${Date.now()}`,
        type: 'emerging-value',
        description: `${emerging.map(e => e.valueId).join(', ')} ${emerging.length === 1 ? 'is' : 'are'} emerging as more important`,
        evidence: emerging.map(e => e.explanation),
        confidence: 0.8,
      });
    }

    // Detect declining value
    const declining = Object.values(evolutions).filter(e => e.pattern === 'decline');
    if (declining.length > 0) {
      insights.push({
        id: `insight_decline_${Date.now()}`,
        type: 'declining-value',
        description: `${declining.map(e => e.valueId).join(', ')} ${declining.length === 1 ? 'is' : 'are'} declining in importance`,
        evidence: declining.map(e => e.explanation),
        confidence: 0.75,
      });
    }

    // Detect stable priority
    const stableValues = Object.values(evolutions).filter(e => e.pattern === 'stable');
    if (stableValues.length >= 3) {
      insights.push({
        id: `insight_stable_${Date.now()}`,
        type: 'stable-priority',
        description: `${stableValues.length} values have remained stable over time`,
        evidence: stableValues.map(e => e.explanation),
        confidence: 0.9,
      });
    }

    // Dominant value changed
    if (dominantValue.previous && dominantValue.previous !== dominantValue.current) {
      insights.push({
        id: `insight_dominant_change_${Date.now()}`,
        type: 'decision-driver',
        description: `Dominant value changed from ${VALUE_DISPLAY_NAMES[dominantValue.previous]} to ${VALUE_DISPLAY_NAMES[dominantValue.current]}`,
        evidence: [dominantValue.explanation],
        confidence: 0.85,
      });
    }

    return insights;
  }

  /**
   * Generate recommendations based on analysis.
   */
  private generateRecommendations(
    evolutions: Record<TrackedValueId, ValueEvolution>,
    shifts: ValueShift[],
    stability: ValueStability,
    dominantValue: DominantValueAnalysis
  ): ValueEvolutionRecommendation[] {
    const recommendations: ValueEvolutionRecommendation[] = [];

    // Recommendation for unstable values
    if (!stability.isGenerallyStable) {
      const unstableValues = Object.entries(stability.valueStability)
        .filter(([, score]) => score < 0.5)
        .map(([id]) => id);

      if (unstableValues.length > 0) {
        recommendations.push({
          id: `rec_unstable_${Date.now()}`,
          area: 'assessment',
          recommendation: `Consider revisiting value assessment for ${unstableValues.join(', ')} - values appear to be in flux`,
          rationale: `Low stability scores (${unstableValues.map(v => stability.valueStability[v as TrackedValueId].toFixed(2)).join(', ')}) suggest values are still evolving`,
          priority: 'medium',
        });
      }
    }

    // Recommendation for major shifts
    const majorShifts = shifts.filter(s => s.significance === 'transformative');
    if (majorShifts.length > 0) {
      recommendations.push({
        id: `rec_shift_${Date.now()}`,
        area: 'recommendation',
        recommendation: 'Re-evaluate career recommendations in light of recent value transformations',
        rationale: `Transformative shifts detected in ${majorShifts.map(s => s.valueId).join(', ')} may invalidate previous recommendations`,
        priority: 'high',
      });
    }

    // Recommendation for emerging values
    const emerging = Object.values(evolutions).filter(e => e.pattern === 'emerge');
    if (emerging.length > 0) {
      recommendations.push({
        id: `rec_emerge_${Date.now()}`,
        area: 'exploration',
        recommendation: `Explore career options that emphasize ${emerging.map(e => VALUE_DISPLAY_NAMES[e.valueId]).join(', ')}`,
        rationale: 'These values are becoming more important to the student',
        priority: 'medium',
      });
    }

    return recommendations;
  }

  // ========================================================================
  // UTILITY ENGINE INTEGRATION
  // ========================================================================

  /**
   * Convert value snapshot to utility weights.
   */
  toUtilityWeights(snapshot: ValueSnapshot): Record<TrackedValueId, number> {
    return { ...snapshot.values };
  }

  /**
   * Create snapshot from utility weights.
   */
  fromUtilityWeights(
    studentId: EntityId,
    weights: Record<TrackedValueId, number>,
    source: ValueSnapshot['source'] = 'engine-derived',
    context?: ValueSnapshot['context']
  ): ValueSnapshot {
    return this.addSnapshot({
      studentId,
      timestamp: Date.now(),
      values: weights,
      confidences: Object.fromEntries(
        TRACKED_VALUES.map(v => [v, 0.7])
      ) as Record<TrackedValueId, number>,
      source,
      context: context ?? {},
    });
  }

  // ========================================================================
  // HELPERS
  // ========================================================================

  /**
   * Create empty history.
   */
  private createEmptyHistory(studentId: EntityId): ValueHistory {
    const now = Date.now();
    return {
      studentId,
      snapshots: [],
      startedAt: now,
      lastUpdatedAt: now,
      summary: {
        snapshotCount: 0,
        timeSpanMs: 0,
        averages: Object.fromEntries(TRACKED_VALUES.map(v => [v, 0.5])) as Record<TrackedValueId, number>,
        dominantValue: TRACKED_VALUES[0],
        currentDominantValue: TRACKED_VALUES[0],
        hasMajorShifts: false,
        shiftCount: 0,
      },
    };
  }

  /**
   * Calculate history summary.
   */
  private calculateHistorySummary(history: ValueHistory): ValueHistory['summary'] {
    const snapshots = history.snapshots;
    const n = snapshots.length;

    if (n === 0) {
      return {
        snapshotCount: 0,
        timeSpanMs: 0,
        averages: Object.fromEntries(TRACKED_VALUES.map(v => [v, 0.5])) as Record<TrackedValueId, number>,
        dominantValue: TRACKED_VALUES[0],
        currentDominantValue: TRACKED_VALUES[0],
        hasMajorShifts: false,
        shiftCount: 0,
      };
    }

    // Calculate averages
    const averages = {} as Record<TrackedValueId, number>;
    for (const valueId of TRACKED_VALUES) {
      const sum = snapshots.reduce((acc, s) => acc + s.values[valueId], 0);
      averages[valueId] = sum / n;
    }

    // Find dominant values
    const sortedByAvg = Object.entries(averages).sort((a, b) => b[1] - a[1]);
    const dominantValue = sortedByAvg[0][0] as TrackedValueId;

    const latest = snapshots[n - 1];
    const sortedCurrent = Object.entries(latest.values).sort((a, b) => b[1] - a[1]);
    const currentDominantValue = sortedCurrent[0][0] as TrackedValueId;

    // Detect shifts
    const shifts = detectValueShifts(snapshots, this.config.shiftThreshold);
    const majorShifts = shifts.filter(s => s.significance === 'major' || s.significance === 'transformative');

    return {
      snapshotCount: n,
      timeSpanMs: snapshots[n - 1].timestamp - snapshots[0].timestamp,
      averages,
      dominantValue,
      currentDominantValue,
      hasMajorShifts: majorShifts.length > 0,
      shiftCount: shifts.length,
    };
  }

  /**
   * Analyze evolutions for all values.
   */
  private analyzeEvolutions(history: ValueHistory): Record<TrackedValueId, ValueEvolution> {
    const evolutions = {} as Record<TrackedValueId, ValueEvolution>;

    for (const valueId of TRACKED_VALUES) {
      evolutions[valueId] = detectEvolutionPattern(history.snapshots, valueId, this.config);
    }

    return evolutions;
  }

  /**
   * Build timeline of dominant values.
   */
  private buildDominantValueTimeline(history: ValueHistory): DominantValueSnapshot[] {
    return history.snapshots.map(snapshot => {
      const ranked = Object.entries(snapshot.values)
        .sort((a, b) => b[1] - a[1]);

      return {
        timestamp: snapshot.timestamp,
        dominantValue: ranked[0][0] as TrackedValueId,
        score: ranked[0][1],
      };
    });
  }

  /**
   * Create minimal analysis for insufficient data.
   */
  private createMinimalAnalysis(
    studentId: EntityId,
    history: ValueHistory,
    generatedAt: number
  ): ValueEvolutionAnalysis {
    const defaultEvolutions = Object.fromEntries(
      TRACKED_VALUES.map(v => [v, {
        valueId: v,
        pattern: 'stable' as const,
        startValue: 0.5,
        currentValue: 0.5,
        totalChange: 0,
        changeRatePerMonth: 0,
        confidence: 0.3,
        explanation: `Insufficient data to determine evolution pattern for ${v}`,
      }])
    ) as Record<TrackedValueId, ValueEvolution>;

    return {
      id: `analysis_${studentId}_${generatedAt}`,
      studentId,
      generatedAt,
      history,
      evolutions: defaultEvolutions,
      shifts: [],
      drift: {
        hasDrift: false,
        driftedValues: [],
        driftMagnitudes: {} as Record<TrackedValueId, number>,
        overallDriftScore: 0,
        explanation: 'Insufficient data for drift detection',
      },
      stability: {
        overallStability: 0.5,
        valueStability: Object.fromEntries(TRACKED_VALUES.map(v => [v, 0.5])) as Record<TrackedValueId, number>,
        mostStableValue: TRACKED_VALUES[0],
        leastStableValue: TRACKED_VALUES[0],
        isGenerallyStable: false,
        explanation: 'Insufficient data for stability analysis',
      },
      dominantValue: {
        current: TRACKED_VALUES[0],
        ranking: [...TRACKED_VALUES],
        topScore: 0.5,
        dominanceGap: 0,
        isClearDominance: false,
        explanation: 'No data available for dominant value analysis',
      },
      dominantValueTimeline: [],
      insights: [],
      recommendations: [],
    };
  }

  // ========================================================================
  // REPORTING
  // ========================================================================

  /**
   * Generate human-readable report.
   */
  generateReport(analysis: ValueEvolutionAnalysis): string {
    const lines: string[] = [];

    lines.push('=== Value Evolution Report ===');
    lines.push('');

    lines.push(`Student: ${analysis.studentId}`);
    lines.push(`Generated: ${new Date(analysis.generatedAt).toISOString()}`);
    lines.push(`Snapshots: ${analysis.history.snapshots.length}`);
    lines.push('');

    // Dominant Value
    lines.push('Dominant Value:');
    lines.push(`  Current: ${VALUE_DISPLAY_NAMES[analysis.dominantValue.current]} (${analysis.dominantValue.topScore.toFixed(2)})`);
    if (analysis.dominantValue.previous) {
      lines.push(`  Previous: ${VALUE_DISPLAY_NAMES[analysis.dominantValue.previous]}`);
    }
    lines.push('');

    // Evolution Patterns
    lines.push('Value Evolution Patterns:');
    for (const [valueId, evolution] of Object.entries(analysis.evolutions)) {
      const emoji = this.getPatternEmoji(evolution.pattern);
      lines.push(`  ${emoji} ${VALUE_DISPLAY_NAMES[valueId as TrackedValueId]}: ${evolution.pattern} (${evolution.totalChange >= 0 ? '+' : ''}${evolution.totalChange.toFixed(2)})`);
    }
    lines.push('');

    // Shifts
    if (analysis.shifts.length > 0) {
      lines.push(`Detected Shifts (${analysis.shifts.length}):`);
      for (const shift of analysis.shifts.slice(0, 5)) {
        lines.push(`  ${shift.significance}: ${VALUE_DISPLAY_NAMES[shift.valueId]} ${shift.direction}ed by ${shift.magnitude.toFixed(2)}`);
      }
      lines.push('');
    }

    // Forecast
    if (analysis.forecast) {
      lines.push('Forecast:');
      lines.push(`  Predicted dominant: ${VALUE_DISPLAY_NAMES[analysis.forecast.predictedDominantValue]}`);
      lines.push(`  Method: ${analysis.forecast.method}`);
      lines.push(`  Confidence: ${(analysis.forecast.forecastConfidence * 100).toFixed(0)}%`);
      lines.push('');
    }

    // Insights
    if (analysis.insights.length > 0) {
      lines.push(`Insights (${analysis.insights.length}):`);
      for (const insight of analysis.insights) {
        lines.push(`  • ${insight.description}`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Get emoji for evolution pattern.
   */
  private getPatternEmoji(pattern: ValueEvolution['pattern']): string {
    const emojis: Record<ValueEvolution['pattern'], string> = {
      stable: '➖',
      drift: '↗️',
      shift: '⬆️',
      oscillate: '〰️',
      emerge: '🌱',
      decline: '📉',
      volatile: '📊',
      converge: '🎯',
    };
    return emojis[pattern] || '❓';
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a new ValueEvolutionEngine instance.
 */
export function createValueEvolutionEngine(
  config?: Partial<ValueEvolutionConfig>
): ValueEvolutionEngine {
  return new ValueEvolutionEngine(config);
}

/**
 * Quick analysis with default settings.
 */
export function quickValueAnalysis(
  studentId: EntityId,
  snapshots: Omit<ValueSnapshot, 'id'>[]
): ValueEvolutionAnalysis {
  const engine = new ValueEvolutionEngine();
  return engine.analyze({ studentId, newSnapshots: snapshots });
}

/**
 * Create a value snapshot.
 */
export function createValueSnapshot(
  studentId: EntityId,
  values: Record<TrackedValueId, number>,
  options?: {
    timestamp?: number;
    source?: ValueSnapshot['source'];
    context?: ValueSnapshot['context'];
    confidences?: Record<TrackedValueId, number>;
  }
): Omit<ValueSnapshot, 'id'> {
  return {
    studentId,
    timestamp: options?.timestamp ?? Date.now(),
    values,
    confidences: options?.confidences ?? Object.fromEntries(
      TRACKED_VALUES.map(v => [v, 0.7])
    ) as Record<TrackedValueId, number>,
    source: options?.source ?? 'explicit-assessment',
    context: options?.context ?? {},
    trigger: undefined,
  };
}
