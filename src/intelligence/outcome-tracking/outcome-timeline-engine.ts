/**
 * CareerOS Outcome Tracking System - Timeline Engine
 *
 * Phase 8.9: Outcome Tracking System
 *
 * Longitudinal timeline construction for visualizing student journey
 * from recommendation through outcomes over time.
 *
 * @module intelligence/outcome-tracking
 * @version 1.0.0
 */

import {
  type StudentOutcomeRecord,
  type TimelineEntry,
  type TimelineEntryId,
  type TimelineEventType,
  type OutcomeTimepoint,
  type ITimelineEngine,
  type StudentId,
} from './outcome-types.js';

// ============================================================================
// TIMELINE SEGMENT TYPES
// ============================================================================

/** Timeline segment representing a period */
export interface TimelineSegment {
  startDate: number;
  endDate: number;
  title: string;
  description: string;
  events: TimelineEntry[];
  outcomes: string[];
  growthMetrics: Record<string, number>;
}

/** Timeline milestone */
export interface TimelineMilestone {
  date: number;
  title: string;
  description: string;
  type: 'DECISION' | 'ACHIEVEMENT' | 'SETBACK' | 'PIVOT' | 'GROWTH' | 'MILESTONE';
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  verified: boolean;
}

/** Timeline view configuration */
export interface TimelineViewConfig {
  startDate?: number;
  endDate?: number;
  granularity: 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';
  includePredictions: boolean;
  includeOutcomes: boolean;
  includeGrowth: boolean;
  maxEvents: number;
}

/** Timeline summary */
export interface TimelineSummary {
  totalDuration: number;
  eventCount: number;
  milestoneCount: number;
  outcomeCount: number;
  keyDecisions: TimelineEntry[];
  majorAchievements: TimelineEntry[];
  growthTrajectory: 'UPWARD' | 'STABLE' | 'DOWNWARD' | 'MIXED';
  narrative: string;
}

/** Timeline comparison between students */
export interface TimelineComparison {
  studentA: StudentId;
  studentB: StudentId;
  similarEvents: TimelineEntry[];
  divergentEvents: {
    onlyA: TimelineEntry[];
    onlyB: TimelineEntry[];
  };
  similarityScore: number;
  insights: string[];
}

// ============================================================================
// TIMELINE ENGINE IMPLEMENTATION
// ============================================================================

/**
 * Timeline Engine
 *
 * Builds and manages longitudinal timelines for student outcome tracking.
 */
export class TimelineEngine implements ITimelineEngine {
  /**
   * Build complete timeline from record
   */
  buildTimeline(record: StudentOutcomeRecord): TimelineEntry[] {
    // Sort by timestamp
    const sorted = [...record.timeline].sort((a, b) => a.timestamp - b.timestamp);

    // Enrich with computed fields
    return sorted.map((entry, index) => ({
      ...entry,
      data: {
        ...entry.data,
        _sequence: index + 1,
        _daysSinceStart: Math.floor((entry.timestamp - record.createdAt) / (1000 * 60 * 60 * 24)),
      },
    }));
  }

  /**
   * Add event to timeline
   */
  addEvent(record: StudentOutcomeRecord, event: TimelineEntry): StudentOutcomeRecord {
    return {
      ...record,
      timeline: [...record.timeline, event].sort((a, b) => a.timestamp - b.timestamp),
      updatedAt: Date.now(),
    };
  }

  /**
   * Get events by type
   */
  getEventsByType(record: StudentOutcomeRecord, eventType: TimelineEventType): TimelineEntry[] {
    return record.timeline.filter(e => e.eventType === eventType);
  }

  /**
   * Get events by time range
   */
  getEventsByTimeRange(record: StudentOutcomeRecord, start: number, end: number): TimelineEntry[] {
    return record.timeline.filter(e => e.timestamp >= start && e.timestamp <= end);
  }

  /**
   * Build timeline segments
   */
  buildSegments(record: StudentOutcomeRecord, segmentDurationDays = 90): TimelineSegment[] {
    const sortedEvents = this.buildTimeline(record);
    if (sortedEvents.length === 0) return [];

    const segments: TimelineSegment[] = [];
    const startDate = sortedEvents[0].timestamp;
    const endDate = sortedEvents[sortedEvents.length - 1].timestamp;
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const numSegments = Math.ceil(totalDays / segmentDurationDays);

    for (let i = 0; i < numSegments; i++) {
      const segmentStart = startDate + i * segmentDurationDays * 24 * 60 * 60 * 1000;
      const segmentEnd = Math.min(
        segmentStart + segmentDurationDays * 24 * 60 * 60 * 1000,
        endDate
      );

      const segmentEvents = sortedEvents.filter(
        e => e.timestamp >= segmentStart && e.timestamp < segmentEnd
      );

      if (segmentEvents.length > 0) {
        segments.push({
          startDate: segmentStart,
          endDate: segmentEnd,
          title: this.generateSegmentTitle(i, segmentEvents),
          description: this.generateSegmentDescription(segmentEvents),
          events: segmentEvents,
          outcomes: this.extractOutcomes(segmentEvents),
          growthMetrics: this.calculateGrowthForPeriod(record, segmentStart, segmentEnd),
        });
      }
    }

    return segments;
  }

  /**
   * Extract milestones from timeline
   */
  extractMilestones(record: StudentOutcomeRecord): TimelineMilestone[] {
    const milestones: TimelineMilestone[] = [];

    // Decision milestones
    const decisions = this.getEventsByType(record, 'DECISION_MADE');
    for (const decision of decisions) {
      milestones.push({
        date: decision.timestamp,
        title: decision.title,
        description: decision.description,
        type: 'DECISION',
        impact: this.inferImpact(decision),
        verified: decision.metadata.verified,
      });
    }

    // Achievement milestones
    const achievements = [
      ...this.getEventsByType(record, 'EDUCATION_COMPLETED'),
      ...this.getEventsByType(record, 'JOB_STARTED'),
      ...this.getEventsByType(record, 'INTERNSHIP_COMPLETED'),
      ...this.getEventsByType(record, 'SKILL_ACQUIRED'),
    ];

    for (const achievement of achievements) {
      milestones.push({
        date: achievement.timestamp,
        title: achievement.title,
        description: achievement.description,
        type: 'ACHIEVEMENT',
        impact: this.inferImpact(achievement),
        verified: achievement.metadata.verified,
      });
    }

    // Growth milestones
    const growthSnapshots = record.growth.snapshots;
    for (let i = 1; i < growthSnapshots.length; i++) {
      const current = growthSnapshots[i];
      const previous = growthSnapshots[i - 1];
      const overallGrowth = current.overallScore - previous.overallScore;

      if (overallGrowth > 10) {
        milestones.push({
          date: current.timestamp,
          title: 'Significant Growth',
          description: `Overall growth increased by ${overallGrowth.toFixed(1)} points`,
          type: 'GROWTH',
          impact: overallGrowth > 20 ? 'HIGH' : 'MEDIUM',
          verified: true,
        });
      }
    }

    // Sort by date
    return milestones.sort((a, b) => a.date - b.date);
  }

  /**
   * Generate timeline summary
   */
  generateSummary(record: StudentOutcomeRecord): TimelineSummary {
    const timeline = this.buildTimeline(record);
    const milestones = this.extractMilestones(record);

    const totalDuration = timeline.length > 0
      ? timeline[timeline.length - 1].timestamp - timeline[0].timestamp
      : 0;

    const keyDecisions = this.getEventsByType(record, 'DECISION_MADE').slice(0, 5);
    const majorAchievements = this.extractMilestones(record)
      .filter(m => m.type === 'ACHIEVEMENT' && m.impact === 'HIGH')
      .map(m => ({
        id: `milestone-${m.date}` as TimelineEntryId,
        timestamp: m.date,
        timepoint: 'IMMEDIATE' as OutcomeTimepoint,
        eventType: 'MILESTONE_REACHED' as TimelineEventType,
        title: m.title,
        description: m.description,
        data: {},
        metadata: {
          source: 'SYSTEM' as const,
          confidence: 100,
          verified: m.verified,
        },
      }));

    // Calculate growth trajectory
    const growthScores = record.growth.snapshots.map(s => s.overallScore);
    let growthTrajectory: TimelineSummary['growthTrajectory'] = 'STABLE';

    if (growthScores.length >= 2) {
      const firstHalf = growthScores.slice(0, Math.floor(growthScores.length / 2));
      const secondHalf = growthScores.slice(Math.floor(growthScores.length / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

      if (secondAvg > firstAvg + 5) {
        growthTrajectory = 'UPWARD';
      } else if (secondAvg < firstAvg - 5) {
        growthTrajectory = 'DOWNWARD';
      } else {
        growthTrajectory = 'MIXED';
      }
    }

    return {
      totalDuration,
      eventCount: timeline.length,
      milestoneCount: milestones.length,
      outcomeCount: this.countOutcomes(record),
      keyDecisions,
      majorAchievements,
      growthTrajectory,
      narrative: this.generateNarrative(record, milestones, growthTrajectory),
    };
  }

  /**
   * Generate mentor-friendly narrative
   */
  generateMentorNarrative(record: StudentOutcomeRecord, monthsAgo = 6): string {
    const cutoffTime = Date.now() - monthsAgo * 30 * 24 * 60 * 60 * 1000;
    const recentEvents = this.getEventsByTimeRange(record, cutoffTime, Date.now());
    const milestones = this.extractMilestones(record).filter(m => m.date >= cutoffTime);

    if (recentEvents.length === 0) {
      return `No major events recorded in the last ${monthsAgo} months.`;
    }

    const parts: string[] = [];

    // Opening with growth context
    const recentGrowth = record.growth.snapshots.filter(s => s.timestamp >= cutoffTime);
    if (recentGrowth.length >= 2) {
      const first = recentGrowth[0].overallScore;
      const last = recentGrowth[recentGrowth.length - 1].overallScore;
      const change = last - first;

      if (change > 10) {
        parts.push(`Over the last ${monthsAgo} months, you've shown significant growth.`);
      } else if (change > 0) {
        parts.push(`Over the last ${monthsAgo} months, you've shown steady progress.`);
      } else if (change < -10) {
        parts.push(`The last ${monthsAgo} months have been challenging.`);
      }
    }

    // Key achievements
    const achievements = milestones.filter(m => m.type === 'ACHIEVEMENT');
    if (achievements.length > 0) {
      const achievementList = achievements.slice(0, 3).map(m => m.title.toLowerCase()).join(', ');
      parts.push(`You've achieved: ${achievementList}.`);
    }

    // Decisions made
    const decisions = milestones.filter(m => m.type === 'DECISION');
    if (decisions.length > 0) {
      parts.push(`You made ${decisions.length} important decision${decisions.length > 1 ? 's' : ''} during this period.`);
    }

    // Psychological changes
    const confidenceChange = this.calculatePsychologicalChange(record, 'confidence', cutoffTime);
    const clarityChange = this.calculatePsychologicalChange(record, 'clarity', cutoffTime);

    if (confidenceChange > 5) {
      parts.push('Your confidence has grown substantially.');
    } else if (confidenceChange < -5) {
      parts.push('Your confidence has decreased - this is worth exploring.');
    }

    if (clarityChange > 5) {
      parts.push('You have much more clarity about your direction now.');
    } else if (clarityChange < -5) {
      parts.push('You seem less certain about your path than before.');
    }

    return parts.join(' ');
  }

  /**
   * Compare timelines between two students
   */
  compareTimelines(recordA: StudentOutcomeRecord, recordB: StudentOutcomeRecord): TimelineComparison {
    const timelineA = this.buildTimeline(recordA);
    const timelineB = this.buildTimeline(recordB);

    // Find similar events
    const similarEvents: TimelineEntry[] = [];
    const onlyA: TimelineEntry[] = [];
    const onlyB: TimelineEntry[] = [];

    for (const eventA of timelineA) {
      const match = timelineB.find(eventB =>
        eventA.eventType === eventB.eventType &&
        this.eventSimilarity(eventA, eventB) > 0.7
      );

      if (match) {
        similarEvents.push(eventA);
      } else {
        onlyA.push(eventA);
      }
    }

    for (const eventB of timelineB) {
      const match = timelineA.find(eventA =>
        eventA.eventType === eventB.eventType &&
        this.eventSimilarity(eventA, eventB) > 0.7
      );

      if (!match) {
        onlyB.push(eventB);
      }
    }

    // Calculate similarity score
    const totalEvents = timelineA.length + timelineB.length;
    const similarityScore = totalEvents > 0 ? (similarEvents.length * 2) / totalEvents : 0;

    // Generate insights
    const insights: string[] = [];

    if (similarEvents.length > 0) {
      insights.push(`Found ${similarEvents.length} similar events between the two students.`);
    }

    if (onlyA.length > onlyB.length) {
      insights.push(`${recordA.studentId} has had more diverse experiences.`);
    } else if (onlyB.length > onlyA.length) {
      insights.push(`${recordB.studentId} has had more diverse experiences.`);
    }

    const growthA = recordA.growth.profile.overallGrowth;
    const growthB = recordB.growth.profile.overallGrowth;

    if (Math.abs(growthA - growthB) > 10) {
      insights.push(`The student${growthA > growthB ? 'A' : 'B'} has shown significantly more growth.`);
    }

    return {
      studentA: recordA.studentId,
      studentB: recordB.studentId,
      similarEvents,
      divergentEvents: { onlyA, onlyB },
      similarityScore,
      insights,
    };
  }

  /**
   * Filter timeline by configuration
   */
  filterTimeline(record: StudentOutcomeRecord, config: TimelineViewConfig): TimelineEntry[] {
    let events = this.buildTimeline(record);

    // Apply date range
    if (config.startDate) {
      events = events.filter(e => e.timestamp >= config.startDate!);
    }
    if (config.endDate) {
      events = events.filter(e => e.timestamp <= config.endDate!);
    }

    // Filter by type based on config
    if (!config.includePredictions) {
      events = events.filter(e => e.eventType !== 'RECOMMENDATION_GIVEN');
    }

    if (!config.includeOutcomes) {
      events = events.filter(e =>
        !['JOB_STARTED', 'INTERNSHIP_COMPLETED', 'EDUCATION_COMPLETED'].includes(e.eventType)
      );
    }

    if (!config.includeGrowth) {
      events = events.filter(e => e.eventType !== 'CONFIDENCE_MEASURED');
    }

    // Apply granularity filter
    events = this.applyGranularity(events, config.granularity);

    // Limit max events
    if (events.length > config.maxEvents) {
      // Keep first, last, and evenly spaced middle events
      const step = events.length / config.maxEvents;
      events = events.filter((_, index) =>
        index === 0 ||
        index === events.length - 1 ||
        Math.floor(index % step) === 0
      );
    }

    return events;
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private generateSegmentTitle(index: number, events: TimelineEntry[]): string {
    const typeCounts = new Map<TimelineEventType, number>();
    for (const event of events) {
      typeCounts.set(event.eventType, (typeCounts.get(event.eventType) || 0) + 1);
    }

    const mostCommon = Array.from(typeCounts.entries())
      .sort((a, b) => b[1] - a[1])[0];

    if (mostCommon) {
      return `Period ${index + 1}: ${this.formatEventType(mostCommon[0])}`;
    }

    return `Period ${index + 1}`;
  }

  private generateSegmentDescription(events: TimelineEntry[]): string {
    const descriptions = events.slice(0, 3).map(e => e.title);
    return descriptions.join(', ');
  }

  private extractOutcomes(events: TimelineEntry[]): string[] {
    return events
      .filter(e =>
        ['JOB_STARTED', 'INTERNSHIP_COMPLETED', 'EDUCATION_COMPLETED', 'SKILL_ACQUIRED'].includes(e.eventType)
      )
      .map(e => e.title);
  }

  private calculateGrowthForPeriod(
    record: StudentOutcomeRecord,
    start: number,
    end: number
  ): Record<string, number> {
    const snapshots = record.growth.snapshots.filter(
      s => s.timestamp >= start && s.timestamp <= end
    );

    if (snapshots.length < 2) return {};

    const first = snapshots[0];
    const last = snapshots[snapshots.length - 1];

    const growth: Record<string, number> = {};
    for (const dimension of Object.keys(last.scores)) {
      growth[dimension] = last.scores[dimension as keyof typeof last.scores] -
        (first.scores[dimension as keyof typeof first.scores] || 0);
    }

    return growth;
  }

  private inferImpact(event: TimelineEntry): TimelineMilestone['impact'] {
    // Infer impact from event data and metadata
    if (event.data && typeof event.data === 'object') {
      const data = event.data as Record<string, unknown>;
      if (data.impact === 'MAJOR' || data.impact === 'HIGH') return 'HIGH';
      if (data.impact === 'MODERATE' || data.impact === 'MEDIUM') return 'MEDIUM';
    }

    // Default based on event type
    const highImpactEvents: TimelineEventType[] = ['DECISION_MADE', 'PIVOT_EXECUTED', 'JOB_STARTED'];
    const mediumImpactEvents: TimelineEventType[] = ['EDUCATION_COMPLETED', 'INTERNSHIP_COMPLETED', 'PROJECT_COMPLETED'];

    if (highImpactEvents.includes(event.eventType)) return 'HIGH';
    if (mediumImpactEvents.includes(event.eventType)) return 'MEDIUM';

    return 'LOW';
  }

  private countOutcomes(record: StudentOutcomeRecord): number {
    return (
      record.outcomes.careerDecisions.length +
      record.outcomes.education.length +
      record.outcomes.skills.length +
      record.outcomes.internships.length +
      record.outcomes.jobs.length +
      record.outcomes.explorations.length
    );
  }

  private generateNarrative(
    record: StudentOutcomeRecord,
    milestones: TimelineMilestone[],
    growthTrajectory: TimelineSummary['growthTrajectory']
  ): string {
    const parts: string[] = [];

    parts.push(`Student ${record.studentId} started their journey on ${new Date(record.createdAt).toLocaleDateString()}.`);

    const decisions = milestones.filter(m => m.type === 'DECISION');
    if (decisions.length > 0) {
      parts.push(`They made ${decisions.length} key decision${decisions.length > 1 ? 's' : ''} along the way.`);
    }

    const achievements = milestones.filter(m => m.type === 'ACHIEVEMENT');
    if (achievements.length > 0) {
      parts.push(`They achieved ${achievements.length} significant milestone${achievements.length > 1 ? 's' : ''}.`);
    }

    if (growthTrajectory === 'UPWARD') {
      parts.push('Their overall trajectory shows strong growth and development.');
    } else if (growthTrajectory === 'DOWNWARD') {
      parts.push('They faced challenges, but showed resilience throughout.');
    } else {
      parts.push('They maintained steady progress throughout their journey.');
    }

    return parts.join(' ');
  }

  private calculatePsychologicalChange(
    record: StudentOutcomeRecord,
    type: 'confidence' | 'clarity',
    cutoffTime: number
  ): number {
    const measurements = type === 'confidence'
      ? record.psychological.confidence.measurements
      : record.psychological.clarity.measurements;

    const relevant = measurements.filter(m => m.timestamp >= cutoffTime);
    if (relevant.length < 2) return 0;

    const first = relevant[0].value;
    const last = relevant[relevant.length - 1].value;

    return last - first;
  }

  private eventSimilarity(eventA: TimelineEntry, eventB: TimelineEntry): number {
    let similarity = 0;

    // Type match
    if (eventA.eventType === eventB.eventType) {
      similarity += 0.4;
    }

    // Title similarity (simple string comparison)
    if (eventA.title.toLowerCase() === eventB.title.toLowerCase()) {
      similarity += 0.3;
    } else if (eventA.title.toLowerCase().includes(eventB.title.toLowerCase()) ||
               eventB.title.toLowerCase().includes(eventA.title.toLowerCase())) {
      similarity += 0.15;
    }

    // Time proximity (within 30 days)
    const timeDiff = Math.abs(eventA.timestamp - eventB.timestamp);
    if (timeDiff < 30 * 24 * 60 * 60 * 1000) {
      similarity += 0.3 * (1 - timeDiff / (30 * 24 * 60 * 60 * 1000));
    }

    return similarity;
  }

  private applyGranularity(events: TimelineEntry[], granularity: TimelineViewConfig['granularity']): TimelineEntry[] {
    if (granularity === 'DAY') return events;

    const bucketSize = {
      WEEK: 7 * 24 * 60 * 60 * 1000,
      MONTH: 30 * 24 * 60 * 60 * 1000,
      QUARTER: 90 * 24 * 60 * 60 * 1000,
      YEAR: 365 * 24 * 60 * 60 * 1000,
    }[granularity];

    const buckets = new Map<number, TimelineEntry[]>();

    for (const event of events) {
      const bucket = Math.floor(event.timestamp / bucketSize) * bucketSize;
      if (!buckets.has(bucket)) {
        buckets.set(bucket, []);
      }
      buckets.get(bucket)!.push(event);
    }

    // Return most important event from each bucket
    return Array.from(buckets.values()).map(bucketEvents => {
      // Sort by importance (verified first, then by confidence)
      bucketEvents.sort((a, b) => {
        if (a.metadata.verified !== b.metadata.verified) {
          return a.metadata.verified ? -1 : 1;
        }
        return b.metadata.confidence - a.metadata.confidence;
      });
      return bucketEvents[0];
    }).sort((a, b) => a.timestamp - b.timestamp);
  }

  private formatEventType(eventType: TimelineEventType): string {
    return eventType
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create timeline engine
 */
export function createTimelineEngine(): TimelineEngine {
  return new TimelineEngine();
}

/**
 * Build timeline from record
 */
export function buildTimeline(record: StudentOutcomeRecord): TimelineEntry[] {
  const engine = createTimelineEngine();
  return engine.buildTimeline(record);
}

/**
 * Generate timeline summary
 */
export function generateTimelineSummary(record: StudentOutcomeRecord): TimelineSummary {
  const engine = createTimelineEngine();
  return engine.generateSummary(record);
}

/**
 * Generate mentor narrative
 */
export function generateMentorNarrative(record: StudentOutcomeRecord, monthsAgo?: number): string {
  const engine = createTimelineEngine();
  return engine.generateMentorNarrative(record, monthsAgo);
}
