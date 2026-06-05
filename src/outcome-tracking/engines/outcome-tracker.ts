/**
 * CareerOS - Outcome Tracker
 *
 * Phase: Outcome Tracking Engine - Sub-Engine
 *
 * Tracks outcome measurement events.
 *
 * @module outcome-tracker
 * @version 1.0.0
 */

import type {
  OutcomeEvent,
  TrackingEventId,
  OutcomeDimensions,
} from '../types/outcome-tracking-types';

/**
 * Outcome Tracker - Tracks final outcomes achieved by students.
 *
 * Records outcome events across all outcome dimensions.
 */
export class OutcomeTracker {
  private events: Map<TrackingEventId, OutcomeEvent> = new Map();

  /**
   * Track an outcome event.
   */
  async track(event: OutcomeEvent): Promise<TrackingEventId> {
    const eventId = this.generateEventId();

    const eventWithId: OutcomeEvent = {
      ...event,
      eventId,
    };

    this.events.set(eventId, eventWithId);

    return eventId;
  }

  /**
   * Get a tracked event by ID.
   */
  async getEvent(eventId: TrackingEventId): Promise<OutcomeEvent | null> {
    return this.events.get(eventId) || null;
  }

  /**
   * Get events for a student.
   */
  async getEventsForStudent(studentId: string): Promise<OutcomeEvent[]> {
    return Array.from(this.events.values()).filter(
      event => event.studentId === studentId
    );
  }

  /**
   * Get events for an action event.
   */
  async getEventsForActionEvent(
    actionEventId: TrackingEventId
  ): Promise<OutcomeEvent[]> {
    return Array.from(this.events.values()).filter(
      event => event.actionEventId === actionEventId
    );
  }

  /**
   * Get events by achievement status.
   */
  async getEventsByAchievement(
    achieved: boolean
  ): Promise<OutcomeEvent[]> {
    return Array.from(this.events.values()).filter(
      event => event.achievedOutcome === achieved
    );
  }

  /**
   * Get events by satisfaction range.
   */
  async getEventsBySatisfactionRange(
    minSatisfaction: number,
    maxSatisfaction: number
  ): Promise<OutcomeEvent[]> {
    return Array.from(this.events.values()).filter(
      event =>
        event.satisfaction.overallSatisfaction >= minSatisfaction &&
        event.satisfaction.overallSatisfaction <= maxSatisfaction
    );
  }

  /**
   * Get events by regret level.
   */
  async getEventsByRegretRange(
    minRegret: number,
    maxRegret: number
  ): Promise<OutcomeEvent[]> {
    return Array.from(this.events.values()).filter(
      event =>
        event.regret.regretLevel >= minRegret &&
        event.regret.regretLevel <= maxRegret
    );
  }

  /**
   * Get tracking statistics.
   */
  async getStatistics(): Promise<{
    totalOutcomes: number;
    achievementRate: number;
    averageSatisfaction: number;
    averageRegret: number;
    averageTimelineDays: number;
    onTimeAchievementRate: number;
    wouldChooseAgainRate: number;
    dimensionAverages: Record<string, number>;
  }> {
    const events = Array.from(this.events.values());

    const achieved = events.filter(e => e.achievedOutcome).length;
    const onTime = events.filter(e => e.timeline.onTime).length;
    const wouldChooseAgain = events.filter(e => e.regret.wouldChooseAgain).length;

    const avgSatisfaction = events.length > 0
      ? events.reduce((sum, e) => sum + e.satisfaction.overallSatisfaction, 0) / events.length
      : 0;

    const avgRegret = events.length > 0
      ? events.reduce((sum, e) => sum + e.regret.regretLevel, 0) / events.length
      : 0;

    const avgTimeline = events.length > 0
      ? events.reduce((sum, e) => sum + e.timeline.daysToOutcome, 0) / events.length
      : 0;

    // Dimension averages
    const dimensionAverages = this.calculateDimensionAverages(events);

    return {
      totalOutcomes: events.length,
      achievementRate: events.length > 0 ? (achieved / events.length) * 100 : 0,
      averageSatisfaction: avgSatisfaction,
      averageRegret: avgRegret,
      averageTimelineDays: avgTimeline,
      onTimeAchievementRate: events.length > 0 ? (onTime / events.length) * 100 : 0,
      wouldChooseAgainRate: events.length > 0 ? (wouldChooseAgain / events.length) * 100 : 0,
      dimensionAverages,
    };
  }

  /**
   * Get dimension-specific statistics.
   */
  async getDimensionStatistics(): Promise<{
    careerProgress: { average: number; achievementRate: number };
    incomeGrowth: { average: number; growthRate: number };
    skillGrowth: { average: number; skillsAcquiredAvg: number };
    lifeSatisfaction: { average: number; workLifeBalance: number };
    stressLevels: { average: number; workStress: number };
    learningGrowth: { average: number; growthVelocity: number };
    careerMobility: { average: number; internalMobility: number; externalMobility: number };
    goalAchievement: { average: number; goalsAchievedAvg: number };
  }> {
    const events = Array.from(this.events.values());

    const calculateAverage = (extractor: (e: OutcomeEvent) => number) => {
      return events.length > 0
        ? events.reduce((sum, e) => sum + extractor(e), 0) / events.length
        : 0;
    };

    return {
      careerProgress: {
        average: calculateAverage(e => e.dimensions.careerProgress.score),
        achievementRate: events.filter(e => e.dimensions.careerProgress.score >= 60).length / events.length * 100,
      },
      incomeGrowth: {
        average: calculateAverage(e => e.dimensions.incomeGrowth.score),
        growthRate: calculateAverage(e => e.dimensions.incomeGrowth.growthPercentage || 0),
      },
      skillGrowth: {
        average: calculateAverage(e => e.dimensions.skillGrowth.score),
        skillsAcquiredAvg: calculateAverage(e => e.dimensions.skillGrowth.skillsAcquired.length),
      },
      lifeSatisfaction: {
        average: calculateAverage(e => e.dimensions.lifeSatisfaction.score),
        workLifeBalance: calculateAverage(e => e.dimensions.lifeSatisfaction.workLifeBalance),
      },
      stressLevels: {
        average: calculateAverage(e => e.dimensions.stressLevels.score),
        workStress: calculateAverage(e => e.dimensions.stressLevels.workStress),
      },
      learningGrowth: {
        average: calculateAverage(e => e.dimensions.learningGrowth.score),
        growthVelocity: calculateAverage(e => e.dimensions.learningGrowth.growthVelocity),
      },
      careerMobility: {
        average: calculateAverage(e => e.dimensions.careerMobility.score),
        internalMobility: calculateAverage(e => e.dimensions.careerMobility.internalMobility),
        externalMobility: calculateAverage(e => e.dimensions.careerMobility.externalMobility),
      },
      goalAchievement: {
        average: calculateAverage(e => e.dimensions.goalAchievement.score),
        goalsAchievedAvg: calculateAverage(e => e.dimensions.goalAchievement.goalsAchieved.length),
      },
    };
  }

  /**
   * Get outcome distribution by dimension score ranges.
   */
  async getOutcomeDistribution(
    dimension: keyof OutcomeDimensions,
    bins: number[]
  ): Promise<Array<{ range: string; count: number; percentage: number }>> {
    const events = Array.from(this.events.values());

    const getScore = (event: OutcomeEvent): number => {
      const dim = event.dimensions[dimension];
      return 'score' in dim ? dim.score : 0;
    };

    const distribution: Array<{ range: string; count: number; percentage: number }> = [];

    for (let i = 0; i < bins.length - 1; i++) {
      const min = bins[i];
      const max = bins[i + 1];
      const count = events.filter(e => {
        const score = getScore(e);
        return score >= min && score < max;
      }).length;

      distribution.push({
        range: `${min}-${max}`,
        count,
        percentage: events.length > 0 ? (count / events.length) * 100 : 0,
      });
    }

    return distribution;
  }

  private calculateDimensionAverages(
    events: OutcomeEvent[]
  ): Record<string, number> {
    if (events.length === 0) return {};

    const dimensions: (keyof OutcomeDimensions)[] = [
      'careerProgress',
      'incomeGrowth',
      'skillGrowth',
      'lifeSatisfaction',
      'stressLevels',
      'learningGrowth',
      'careerMobility',
      'goalAchievement',
    ];

    const averages: Record<string, number> = {};

    for (const dim of dimensions) {
      const sum = events.reduce((acc, e) => acc + e.dimensions[dim].score, 0);
      averages[dim] = sum / events.length;
    }

    return averages;
  }

  private generateEventId(): TrackingEventId {
    return `out_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
