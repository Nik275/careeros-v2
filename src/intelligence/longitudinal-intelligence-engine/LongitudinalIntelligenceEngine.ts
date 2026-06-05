/**
 * Longitudinal Intelligence Engine
 *
 * Maintain evolving student models over time.
 *
 * Purpose:
 *   - Track assessment history
 *   - Track decision history
 *   - Track value evolution
 *   - Track identity evolution
 *   - Track outcome history
 *
 * Generates:
 *   - StudentTimeline
 *   - Major transitions
 *   - Growth milestones
 *   - Decision patterns
 *
 * Compatible with:
 *   - Outcome Learning
 *   - Utility Engine
 *   - Identity Engine
 *   - Value Evolution Engine
 *
 * Example Usage:
 *   const engine = new LongitudinalIntelligenceEngine();
 *
 *   const result = engine.analyze({
 *     studentId: 'student-123',
 *     assessments: assessmentHistory,
 *     decisions: decisionHistory,
 *     valueHistory: valueEvolutionHistory,
 *     identityEvolution: identityEvolution,
 *     growthAnalyses: growthAnalyses,
 *     outcomes: outcomeHistory,
 *   });
 *
 *   console.log(result.timeline.events.length);       // 25
 *   console.log(result.transitions.length);           // 3
 *   console.log(result.milestones.length);            // 5
 *   console.log(result.decisionPatterns[0].type);     // 'analytical'
 */

import type {
  EntityId,
} from '../types/index.js';

import type {
  StudentTimeline,
  TimelineEvent,
  MajorTransition,
  GrowthMilestone,
  DecisionPattern,
  LongitudinalAnalysis,
  LongitudinalInsight,
  LongitudinalPrediction,
  AssessmentSnapshot,
  DecisionRecord,
  OutcomeRecord,
  LongitudinalAnalysisInput,
  LongitudinalOptions,
  LongitudinalConfig,
} from './types.js';

import {
  TIMELINE_EVENT_TYPES,
  EVENT_TYPE_LABELS,
  DEFAULT_LONGITUDINAL_CONFIG,
} from './types.js';

import {
  generateTimeline,
  detectTransitions,
  identifyMilestones,
  analyzeDecisionPatterns,
  generateInsights,
  generatePredictions,
} from './analysis.js';

// ============================================================================
// LONGITUDINAL INTELLIGENCE ENGINE
// ============================================================================

/**
 * Engine for maintaining evolving student models over time.
 */
export class LongitudinalIntelligenceEngine {
  private config: LongitudinalConfig;
  private analyses: Map<EntityId, LongitudinalAnalysis> = new Map();
  private timelines: Map<EntityId, StudentTimeline> = new Map();

  constructor(config: Partial<LongitudinalConfig> = {}) {
    this.config = { ...DEFAULT_LONGITUDINAL_CONFIG, ...config };
  }

  /**
   * Get current configuration.
   */
  getConfig(): LongitudinalConfig {
    return { ...this.config };
  }

  /**
   * Update configuration.
   */
  updateConfig(config: Partial<LongitudinalConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // ========================================================================
  // MAIN API: ANALYZE
  // ========================================================================

  /**
   * Perform comprehensive longitudinal analysis.
   *
   * This is the primary API for the engine.
   */
  analyze(input: LongitudinalAnalysisInput): LongitudinalAnalysis {
    const startedAt = Date.now();
    const options = { ...this.config, ...input.options };

    // Generate timeline
    const timeline = generateTimeline(
      input.studentId,
      input.assessments,
      input.decisions,
      input.valueHistory,
      input.identityEvolution,
      input.growthAnalyses,
      input.outcomes,
      this.config
    );

    // Detect transitions
    const transitions = detectTransitions(
      timeline,
      input.assessments ?? [],
      this.config
    );

    // Identify milestones
    const milestones = identifyMilestones(
      timeline,
      input.assessments ?? [],
      input.growthAnalyses,
      this.config
    );

    // Analyze decision patterns
    const decisionPatterns = analyzeDecisionPatterns(
      input.decisions ?? [],
      this.config
    );

    // Generate insights
    const insights = generateInsights(
      timeline,
      transitions,
      milestones,
      decisionPatterns
    );

    // Generate predictions
    const predictions = options.includePredictions !== false
      ? generatePredictions(timeline, transitions, milestones, this.config)
      : [];

    const analysis: LongitudinalAnalysis = {
      id: `longitudinal_${input.studentId}_${startedAt}`,
      studentId: input.studentId,
      generatedAt: startedAt,
      timeRange: {
        start: timeline.timeRange.start,
        end: timeline.timeRange.end,
        durationMs: timeline.timeRange.durationMs,
      },
      timeline,
      transitions,
      milestones,
      decisionPatterns,
      insights,
      predictions,
    };

    // Store analysis and timeline
    this.analyses.set(input.studentId, analysis);
    this.timelines.set(input.studentId, timeline);

    return analysis;
  }

  /**
   * Quick longitudinal analysis with minimal data.
   */
  quickAnalyze(
    studentId: EntityId,
    assessments: AssessmentSnapshot[]
  ): LongitudinalAnalysis {
    return this.analyze({ studentId, assessments });
  }

  // ========================================================================
  // TIMELINE OPERATIONS
  // ========================================================================

  /**
   * Add event to student's timeline.
   */
  addEvent(studentId: EntityId, event: Omit<TimelineEvent, 'id'>): TimelineEvent {
    let timeline = this.timelines.get(studentId);

    // Create timeline if doesn't exist
    if (!timeline) {
      timeline = {
        id: `timeline_${studentId}_${Date.now()}`,
        studentId,
        startedAt: event.timestamp,
        lastUpdatedAt: event.timestamp,
        events: [],
        timeRange: {
          start: event.timestamp,
          end: event.timestamp,
          durationMs: 0,
        },
        summary: {
          totalEvents: 0,
          eventsByType: {} as Record<import('./types.js').TimelineEventType, number>,
          eventsPerMonth: 0,
          mostActivePeriod: { start: event.timestamp, end: event.timestamp, eventCount: 0 },
          quietestPeriod: null,
        },
      };
    }

    // Create full event
    const fullEvent: TimelineEvent = {
      ...event,
      id: `evt_${event.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    // Add to timeline
    timeline.events.push(fullEvent);
    timeline.events.sort((a, b) => a.timestamp - b.timestamp);
    timeline.lastUpdatedAt = Math.max(timeline.lastUpdatedAt, event.timestamp);
    timeline.timeRange.end = timeline.lastUpdatedAt;
    timeline.timeRange.durationMs = timeline.timeRange.end - timeline.timeRange.start;

    // Update summary (simplified)
    timeline.summary.totalEvents = timeline.events.length;

    // Store updated timeline
    this.timelines.set(studentId, timeline);

    return fullEvent;
  }

  /**
   * Get timeline for a student.
   */
  getTimeline(studentId: EntityId): StudentTimeline | undefined {
    return this.timelines.get(studentId);
  }

  /**
   * Get events by type.
   */
  getEventsByType(
    studentId: EntityId,
    type: import('./types.js').TimelineEventType
  ): TimelineEvent[] {
    const timeline = this.timelines.get(studentId);
    if (!timeline) return [];
    return timeline.events.filter(e => e.type === type);
  }

  /**
   * Get events in time range.
   */
  getEventsInRange(
    studentId: EntityId,
    start: number,
    end: number
  ): TimelineEvent[] {
    const timeline = this.timelines.get(studentId);
    if (!timeline) return [];
    return timeline.events.filter(e => e.timestamp >= start && e.timestamp <= end);
  }

  // ========================================================================
  // TRANSITION QUERIES
  // ========================================================================

  /**
   * Get transitions for a student.
   */
  getTransitions(studentId: EntityId): MajorTransition[] {
    return this.analyses.get(studentId)?.transitions ?? [];
  }

  /**
   * Get recent transitions.
   */
  getRecentTransitions(
    studentId: EntityId,
    days: number = 90
  ): MajorTransition[] {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return this.getTransitions(studentId).filter(t => t.startedAt >= cutoff);
  }

  /**
   * Get transition by type.
   */
  getTransitionsByType(
    studentId: EntityId,
    type: import('./types.js').TransitionType
  ): MajorTransition[] {
    return this.getTransitions(studentId).filter(t => t.type === type);
  }

  // ========================================================================
  // MILESTONE QUERIES
  // ========================================================================

  /**
   * Get milestones for a student.
   */
  getMilestones(studentId: EntityId): GrowthMilestone[] {
    return this.analyses.get(studentId)?.milestones ?? [];
  }

  /**
   * Get milestones by type.
   */
  getMilestonesByType(
    studentId: EntityId,
    type: import('./types.js').MilestoneType
  ): GrowthMilestone[] {
    return this.getMilestones(studentId).filter(m => m.type === type);
  }

  /**
   * Get latest milestone.
   */
  getLatestMilestone(studentId: EntityId): GrowthMilestone | undefined {
    const milestones = this.getMilestones(studentId);
    if (milestones.length === 0) return undefined;
    return milestones.sort((a, b) => b.achievedAt - a.achievedAt)[0];
  }

  // ========================================================================
  // DECISION PATTERN QUERIES
  // ========================================================================

  /**
   * Get decision patterns for a student.
   */
  getDecisionPatterns(studentId: EntityId): DecisionPattern[] {
    return this.analyses.get(studentId)?.decisionPatterns ?? [];
  }

  /**
   * Get dominant decision pattern.
   */
  getDominantDecisionPattern(studentId: EntityId): DecisionPattern | undefined {
    const patterns = this.getDecisionPatterns(studentId);
    if (patterns.length === 0) return undefined;
    return patterns.sort((a, b) => b.confidence - a.confidence)[0];
  }

  // ========================================================================
  // INSIGHT AND PREDICTION QUERIES
  // ========================================================================

  /**
   * Get insights for a student.
   */
  getInsights(studentId: EntityId): LongitudinalInsight[] {
    return this.analyses.get(studentId)?.insights ?? [];
  }

  /**
   * Get urgent insights.
   */
  getUrgentInsights(studentId: EntityId): LongitudinalInsight[] {
    return this.getInsights(studentId).filter(i => i.urgency === 'immediate');
  }

  /**
   * Get predictions for a student.
   */
  getPredictions(studentId: EntityId): LongitudinalPrediction[] {
    return this.analyses.get(studentId)?.predictions ?? [];
  }

  // ========================================================================
  // REPORTING
  // ========================================================================

  /**
   * Generate human-readable report.
   */
  generateReport(analysis: LongitudinalAnalysis): string {
    const { timeline, transitions, milestones, decisionPatterns, insights, predictions } = analysis;
    const lines: string[] = [];

    lines.push('=== Longitudinal Intelligence Report ===');
    lines.push('');

    lines.push(`Student: ${analysis.studentId}`);
    lines.push(`Generated: ${new Date(analysis.generatedAt).toISOString()}`);
    lines.push(`Time Range: ${new Date(analysis.timeRange.start).toISOString()} to ${new Date(analysis.timeRange.end).toISOString()}`);
    lines.push(`Duration: ${(analysis.timeRange.durationMs / (24 * 60 * 60 * 1000)).toFixed(0)} days`);
    lines.push('');

    // Timeline Summary
    lines.push('Timeline Summary:');
    lines.push(`  Total Events: ${timeline.summary.totalEvents}`);
    lines.push(`  Events per Month: ${timeline.summary.eventsPerMonth.toFixed(1)}`);
    lines.push('  Events by Type:');
    for (const [type, count] of Object.entries(timeline.summary.eventsByType)) {
      if (count > 0) {
        lines.push(`    ${EVENT_TYPE_LABELS[type as import('./types.js').TimelineEventType]}: ${count}`);
      }
    }
    lines.push('');

    // Transitions
    if (transitions.length > 0) {
      lines.push(`Major Transitions (${transitions.length}):`);
      for (const t of transitions) {
        const status = t.wasPositive ? '✓' : '✗';
        lines.push(`  ${status} ${t.description}`);
        lines.push(`     Duration: ${(t.durationMs / (24 * 60 * 60 * 1000)).toFixed(0)} days`);
      }
      lines.push('');
    }

    // Milestones
    if (milestones.length > 0) {
      lines.push(`Growth Milestones (${milestones.length}):`);
      for (const m of milestones) {
        lines.push(`  ★ ${m.title} (${new Date(m.achievedAt).toLocaleDateString()})`);
        lines.push(`     ${m.description}`);
      }
      lines.push('');
    }

    // Decision Patterns
    if (decisionPatterns.length > 0) {
      lines.push(`Decision Patterns (${decisionPatterns.length}):`);
      for (const p of decisionPatterns) {
        lines.push(`  ${p.type}: ${p.description}`);
        lines.push(`     Confidence: ${(p.confidence * 100).toFixed(0)}%`);
        lines.push(`     Avg Decision Time: ${p.statistics.avgDecisionTime.toFixed(1)} days`);
        lines.push(`     Satisfaction Rate: ${(p.statistics.satisfactionRate * 100).toFixed(0)}%`);
      }
      lines.push('');
    }

    // Insights
    if (insights.length > 0) {
      lines.push(`Insights (${insights.length}):`);
      for (const insight of insights) {
        const urgencyIcon = insight.urgency === 'immediate' ? '[!]' : insight.urgency === 'near-term' ? '[~]' : '[-]';
        lines.push(`  ${urgencyIcon} ${insight.description}`);
      }
      lines.push('');
    }

    // Predictions
    if (predictions.length > 0) {
      lines.push(`Predictions (${predictions.length}):`);
      for (const pred of predictions) {
        lines.push(`  • ${pred.prediction}`);
        lines.push(`    Likelihood: ${(pred.likelihood * 100).toFixed(0)}%`);
      }
    }

    return lines.join('\n');
  }

  // ========================================================================
  // STORAGE
  // ========================================================================

  /**
   * Get stored analysis.
   */
  getAnalysis(studentId: EntityId): LongitudinalAnalysis | undefined {
    return this.analyses.get(studentId);
  }

  /**
   * Get all stored analyses.
   */
  getAllAnalyses(): LongitudinalAnalysis[] {
    return Array.from(this.analyses.values());
  }

  /**
   * Clear stored data for a student.
   */
  clearStudentData(studentId: EntityId): void {
    this.analyses.delete(studentId);
    this.timelines.delete(studentId);
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a new LongitudinalIntelligenceEngine instance.
 */
export function createLongitudinalIntelligenceEngine(
  config?: Partial<LongitudinalConfig>
): LongitudinalIntelligenceEngine {
  return new LongitudinalIntelligenceEngine(config);
}

/**
 * Quick longitudinal analysis.
 */
export function quickLongitudinalAnalysis(
  studentId: EntityId,
  assessments: AssessmentSnapshot[]
): LongitudinalAnalysis {
  const engine = new LongitudinalIntelligenceEngine();
  return engine.quickAnalyze(studentId, assessments);
}

/**
 * Get event type label.
 */
export function getEventTypeLabel(type: import('./types.js').TimelineEventType): string {
  return EVENT_TYPE_LABELS[type] || type;
}

/**
 * Get all event types.
 */
export function getEventTypes(): import('./types.js').TimelineEventType[] {
  return [...TIMELINE_EVENT_TYPES];
}
