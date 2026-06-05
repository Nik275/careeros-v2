/**
 * CareerOS - Action Tracker
 *
 * Phase: Outcome Tracking Engine - Sub-Engine
 *
 * Tracks student action events.
 *
 * @module action-tracker
 * @version 1.0.0
 */

import type {
  ActionEvent,
  TrackingEventId,
  ActionItem,
  Milestone,
} from '../types/outcome-tracking-types';

/**
 * Action Tracker - Tracks actions students take toward career goals.
 *
 * Records action events including milestones completed and progress status.
 */
export class ActionTracker {
  private events: Map<TrackingEventId, ActionEvent> = new Map();

  /**
   * Track an action event.
   */
  async track(event: ActionEvent): Promise<TrackingEventId> {
    const eventId = this.generateEventId();

    const eventWithId: ActionEvent = {
      ...event,
      eventId,
    };

    this.events.set(eventId, eventWithId);

    return eventId;
  }

  /**
   * Get a tracked event by ID.
   */
  async getEvent(eventId: TrackingEventId): Promise<ActionEvent | null> {
    return this.events.get(eventId) || null;
  }

  /**
   * Get events for a student.
   */
  async getEventsForStudent(studentId: string): Promise<ActionEvent[]> {
    return Array.from(this.events.values()).filter(
      event => event.studentId === studentId
    );
  }

  /**
   * Get events for a decision event.
   */
  async getEventsForDecisionEvent(
    decisionEventId: TrackingEventId
  ): Promise<ActionEvent[]> {
    return Array.from(this.events.values()).filter(
      event => event.decisionEventId === decisionEventId
    );
  }

  /**
   * Get events by progress status.
   */
  async getEventsByProgressStatus(
    minProgress: number,
    maxProgress: number
  ): Promise<ActionEvent[]> {
    return Array.from(this.events.values()).filter(
      event =>
        event.progressStatus.overallProgress >= minProgress &&
        event.progressStatus.overallProgress <= maxProgress
    );
  }

  /**
   * Get events by career pursuit stage.
   */
  async getEventsByStage(
    stage: string
  ): Promise<ActionEvent[]> {
    return Array.from(this.events.values()).filter(
      event => event.progressStatus.currentStage === stage
    );
  }

  /**
   * Get completed milestones across all events.
   */
  async getAllMilestones(): Promise<Milestone[]> {
    const milestones: Milestone[] = [];

    for (const event of Array.from(this.events.values())) {
      milestones.push(...event.milestonesCompleted);
    }

    return milestones;
  }

  /**
   * Get tracking statistics.
   */
  async getStatistics(): Promise<{
    totalActionEvents: number;
    averageProgress: number;
    activePursuits: number;
    completedPursuits: number;
    abandonedPursuits: number;
    averageMilestonesCompleted: number;
    topActionTypes: Array<{ type: string; count: number }>;
    topMilestoneCategories: Array<{ category: string; count: number }>;
    stageDistribution: Record<string, number>;
  }> {
    const events = Array.from(this.events.values());

    const avgProgress = events.length > 0
      ? events.reduce((sum, e) => sum + e.progressStatus.overallProgress, 0) / events.length
      : 0;

    const active = events.filter(e => e.progressStatus.isActive).length;
    const completed = events.filter(e => e.progressStatus.currentStage === 'ESTABLISHED').length;
    const abandoned = events.filter(e => e.progressStatus.currentStage === 'ABANDONED').length;

    const avgMilestones = events.length > 0
      ? events.reduce((sum, e) => sum + e.milestonesCompleted.length, 0) / events.length
      : 0;

    // Count action types
    const actionTypes = new Map<string, number>();
    for (const event of events) {
      for (const action of event.actionsTaken) {
        const count = actionTypes.get(action.actionType) || 0;
        actionTypes.set(action.actionType, count + 1);
      }
    }

    const topActionTypes = Array.from(actionTypes.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Count milestone categories
    const milestoneCategories = new Map<string, number>();
    for (const event of events) {
      for (const milestone of event.milestonesCompleted) {
        const count = milestoneCategories.get(milestone.category) || 0;
        milestoneCategories.set(milestone.category, count + 1);
      }
    }

    const topMilestoneCategories = Array.from(milestoneCategories.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Stage distribution
    const stageDistribution: Record<string, number> = {};
    for (const event of events) {
      const stage = event.progressStatus.currentStage;
      stageDistribution[stage] = (stageDistribution[stage] || 0) + 1;
    }

    return {
      totalActionEvents: events.length,
      averageProgress: avgProgress,
      activePursuits: active,
      completedPursuits: completed,
      abandonedPursuits: abandoned,
      averageMilestonesCompleted: avgMilestones,
      topActionTypes,
      topMilestoneCategories,
      stageDistribution,
    };
  }

  /**
   * Get action completion statistics.
   */
  async getActionCompletionStats(): Promise<{
    totalActions: number;
    completedActions: number;
    completionRate: number;
    averageEffortHours: number;
    completionByType: Record<string, { total: number; completed: number; rate: number }>;
  }> {
    const events = Array.from(this.events.values());
    const allActions: ActionItem[] = [];

    for (const event of events) {
      allActions.push(...event.actionsTaken);
    }

    const completed = allActions.filter(a => a.completed).length;
    const actionsWithEffort = allActions.filter(a => a.effortHours);
    const totalEffort = actionsWithEffort.reduce(
      (sum, a) => sum + (a.effortHours || 0),
      0
    );

    // By type
    const byType: Record<string, { total: number; completed: number; rate: number }> = {};
    for (const action of allActions) {
      if (!byType[action.actionType]) {
        byType[action.actionType] = { total: 0, completed: 0, rate: 0 };
      }
      byType[action.actionType].total++;
      if (action.completed) {
        byType[action.actionType].completed++;
      }
    }

    // Calculate rates
    for (const type of Object.keys(byType)) {
      const stats = byType[type];
      stats.rate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
    }

    return {
      totalActions: allActions.length,
      completedActions: completed,
      completionRate: allActions.length > 0 ? (completed / allActions.length) * 100 : 0,
      averageEffortHours: actionsWithEffort.length > 0
        ? totalEffort / actionsWithEffort.length
        : 0,
      completionByType: byType,
    };
  }

  private generateEventId(): TrackingEventId {
    return `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
