/**
 * CareerOS - Decision Tracker
 *
 * Phase: Outcome Tracking Engine - Sub-Engine
 *
 * Tracks student decision events.
 *
 * @module decision-tracker
 * @version 1.0.0
 */

import type {
  DecisionEvent,
  TrackingEventId,
} from '../types/outcome-tracking-types';

/**
 * Decision Tracker - Tracks when students make decisions.
 *
 * Records decision events including selected options, rejected options,
 * confidence levels, and decision rationale.
 */
export class DecisionTracker {
  private events: Map<TrackingEventId, DecisionEvent> = new Map();

  /**
   * Track a decision event.
   */
  async track(event: DecisionEvent): Promise<TrackingEventId> {
    const eventId = this.generateEventId();

    const eventWithId: DecisionEvent = {
      ...event,
      eventId,
    };

    this.events.set(eventId, eventWithId);

    return eventId;
  }

  /**
   * Get a tracked event by ID.
   */
  async getEvent(eventId: TrackingEventId): Promise<DecisionEvent | null> {
    return this.events.get(eventId) || null;
  }

  /**
   * Get events for a student.
   */
  async getEventsForStudent(studentId: string): Promise<DecisionEvent[]> {
    return Array.from(this.events.values()).filter(
      event => event.studentId === studentId
    );
  }

  /**
   * Get events for a recommendation event.
   */
  async getEventsForRecommendationEvent(
    recommendationEventId: TrackingEventId
  ): Promise<DecisionEvent[]> {
    return Array.from(this.events.values()).filter(
      event => event.recommendationEventId === recommendationEventId
    );
  }

  /**
   * Get events by decision confidence range.
   */
  async getEventsByConfidenceRange(
    minConfidence: number,
    maxConfidence: number
  ): Promise<DecisionEvent[]> {
    return Array.from(this.events.values()).filter(
      event => event.confidence >= minConfidence && event.confidence <= maxConfidence
    );
  }

  /**
   * Get events where recommendation was accepted.
   */
  async getAcceptedRecommendations(): Promise<DecisionEvent[]> {
    return Array.from(this.events.values()).filter(
      event => event.selectedOption.matchesRecommendation
    );
  }

  /**
   * Get events where recommendation was rejected.
   */
  async getRejectedRecommendations(): Promise<DecisionEvent[]> {
    return Array.from(this.events.values()).filter(
      event => !event.selectedOption.matchesRecommendation
    );
  }

  /**
   * Get tracking statistics.
   */
  async getStatistics(): Promise<{
    totalDecisions: number;
    acceptanceRate: number;
    modificationRate: number;
    rejectionRate: number;
    averageConfidence: number;
    averageDecisionTimeframe: string;
    topRejectionReasons: Array<{ reason: string; count: number }>;
  }> {
    const events = Array.from(this.events.values());

    const accepted = events.filter(e => e.selectedOption.matchesRecommendation).length;
    const modified = events.filter(
      e => e.selectedOption.relationshipToRecommendation === 'MODIFIED'
    ).length;
    const rejected = events.filter(
      e => e.selectedOption.relationshipToRecommendation === 'CUSTOM'
    ).length;

    const avgConfidence = events.length > 0
      ? events.reduce((sum, e) => sum + e.confidence, 0) / events.length
      : 0;

    // Count rejection reasons
    const rejectionReasons = new Map<string, number>();
    for (const event of events) {
      for (const rejected of event.rejectedOptions) {
        if (rejected.rejectionReason) {
          const count = rejectionReasons.get(rejected.rejectionReason) || 0;
          rejectionReasons.set(rejected.rejectionReason, count + 1);
        }
      }
    }

    const topRejectionReasons = Array.from(rejectionReasons.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalDecisions: events.length,
      acceptanceRate: events.length > 0 ? (accepted / events.length) * 100 : 0,
      modificationRate: events.length > 0 ? (modified / events.length) * 100 : 0,
      rejectionRate: events.length > 0 ? (rejected / events.length) * 100 : 0,
      averageConfidence: avgConfidence,
      averageDecisionTimeframe: this.calculateAverageDecisionTimeframe(events),
      topRejectionReasons,
    };
  }

  private calculateAverageDecisionTimeframe(
    events: DecisionEvent[]
  ): string {
    const counts = {
      IMMEDIATE: 0,
      DAYS: 0,
      WEEKS: 0,
      MONTHS: 0,
    };

    for (const event of events) {
      counts[event.rationale.decisionTimeframe]++;
    }

    const total = events.length;
    if (total === 0) return 'N/A';

    const maxCount = Math.max(...Object.values(counts));
    const dominant = Object.entries(counts).find(([, count]) => count === maxCount)?.[0];

    return dominant || 'VARIED';
  }

  private generateEventId(): TrackingEventId {
    return `dec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
