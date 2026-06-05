/**
 * CareerOS - Recommendation Tracker
 *
 * Phase: Outcome Tracking Engine - Sub-Engine
 *
 * Tracks recommendation presentation events.
 *
 * @module recommendation-tracker
 * @version 1.0.0
 */

import type {
  RecommendationEvent,
  TrackingEventId,
} from '../types/outcome-tracking-types';

/**
 * Recommendation Tracker - Tracks when recommendations are presented.
 *
 * Records recommendation events for outcome tracking analysis.
 */
export class RecommendationTracker {
  private events: Map<TrackingEventId, RecommendationEvent> = new Map();

  /**
   * Track a recommendation event.
   */
  async track(event: RecommendationEvent): Promise<TrackingEventId> {
    const eventId = this.generateEventId();

    const eventWithId: RecommendationEvent = {
      ...event,
      eventId,
    };

    this.events.set(eventId, eventWithId);

    // In production, this would also:
    // - Store in database
    // - Send to analytics pipeline
    // - Update real-time metrics

    return eventId;
  }

  /**
   * Get a tracked event by ID.
   */
  async getEvent(eventId: TrackingEventId): Promise<RecommendationEvent | null> {
    return this.events.get(eventId) || null;
  }

  /**
   * Get events for a student.
   */
  async getEventsForStudent(studentId: string): Promise<RecommendationEvent[]> {
    return Array.from(this.events.values()).filter(
      event => event.studentId === studentId
    );
  }

  /**
   * Get events for a recommendation.
   */
  async getEventsForRecommendation(recommendationId: string): Promise<RecommendationEvent[]> {
    return Array.from(this.events.values()).filter(
      event => event.recommendationId === recommendationId
    );
  }

  /**
   * Get events within a time range.
   */
  async getEventsInRange(
    startDate: Date,
    endDate: Date
  ): Promise<RecommendationEvent[]> {
    return Array.from(this.events.values()).filter(
      event => event.timestamp >= startDate && event.timestamp <= endDate
    );
  }

  /**
   * Get tracking statistics.
   */
  async getStatistics(): Promise<{
    totalEvents: number;
    uniqueStudents: number;
    uniqueRecommendations: number;
    interactionRate: number;
    averageViewDuration: number;
  }> {
    const events = Array.from(this.events.values());

    const uniqueStudents = new Set(events.map(e => e.studentId)).size;
    const uniqueRecommendations = new Set(events.map(e => e.recommendationId)).size;
    const interactedEvents = events.filter(e => e.context.wasInteracted).length;
    const eventsWithDuration = events.filter(e => e.context.viewDurationSeconds);

    const totalDuration = eventsWithDuration.reduce(
      (sum, e) => sum + (e.context.viewDurationSeconds || 0),
      0
    );

    return {
      totalEvents: events.length,
      uniqueStudents,
      uniqueRecommendations,
      interactionRate: events.length > 0 ? (interactedEvents / events.length) * 100 : 0,
      averageViewDuration: eventsWithDuration.length > 0
        ? totalDuration / eventsWithDuration.length
        : 0,
    };
  }

  private generateEventId(): TrackingEventId {
    return `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
