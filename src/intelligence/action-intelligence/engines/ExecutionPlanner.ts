/**
 * Action Intelligence - Execution Planner
 *
 * Creates detailed execution schedules:
 * - Weekly plans with specific time blocks
 * - Monthly plans with goals and milestones
 * - Milestone schedules
 * - Progress tracking frameworks
 * - Contingency plans
 *
 * @module intelligence/action-intelligence
 */

import type {
  EntityId,
  BeliefTimestamp,
} from '../../types';

import type {
  Action,
  ActionStatus,
  WeeklyPlan,
  MonthlyPlan,
  PlannedMilestone,
  ExecutionPlan,
  ReviewPoint,
  ContingencyPlan,
  ProgressTracker,
  ActionIntelligenceInput,
  PriorityRoadmap,
} from '../types';

/**
 * Execution Planner Configuration
 */
export interface ExecutionPlannerConfig {
  /** Default hours per week for career development */
  defaultWeeklyHours: number;

  /** Hours distribution across categories */
  hoursDistribution: {
    learning: number;
    practice: number;
    networking: number;
    research: number;
    other: number;
  };

  /** Week start day (0 = Sunday, 1 = Monday) */
  weekStartDay: number;

  /** Include weekends in planning */
  includeWeekends: boolean;

  /** Buffer percentage for unexpected issues */
  bufferPercentage: number;

  /** Review frequency in weeks */
  reviewFrequencyWeeks: number;
}

/**
 * Default configuration
 */
export const DEFAULT_EXECUTION_CONFIG: ExecutionPlannerConfig = {
  defaultWeeklyHours: 10,
  hoursDistribution: {
    learning: 0.4,
    practice: 0.3,
    networking: 0.2,
    research: 0.05,
    other: 0.05,
  },
  weekStartDay: 1, // Monday
  includeWeekends: false,
  bufferPercentage: 0.2,
  reviewFrequencyWeeks: 2,
};

/**
 * Execution Planner
 *
 * Creates actionable schedules and tracks progress.
 */
export class ExecutionPlanner {
  private config: ExecutionPlannerConfig;

  constructor(config: Partial<ExecutionPlannerConfig> = {}) {
    this.config = { ...DEFAULT_EXECUTION_CONFIG, ...config };
  }

  /**
   * Create complete execution plan
   */
  createPlan(
    actions: Action[],
    milestones: PlannedMilestone[],
    input: ActionIntelligenceInput
  ): ExecutionPlan {
    const weeklyHours = input.currentContext?.availableHoursPerWeek ||
                       this.config.defaultWeeklyHours;

    // Create weekly plans for next 12 weeks
    const weeklyPlans = this.createWeeklyPlans(actions, 12, weeklyHours);

    // Create monthly plans
    const monthlyPlans = this.createMonthlyPlans(weeklyPlans);

    // Create milestone schedule
    const milestoneSchedule = this.scheduleMilestones(milestones);

    // Create review schedule
    const reviewSchedule = this.createReviewSchedule(weeklyPlans);

    // Create contingency plans
    const contingencyPlans = this.createContingencyPlans(actions);

    // Create progress tracker
    const progressTracking = this.createProgressTracker(actions);

    return {
      planId: this.generatePlanId(),
      studentId: input.studentBelief.id,
      targetDate: this.calculateTargetDate(actions),
      weeklyPlans,
      monthlyPlans,
      milestoneSchedule,
      reviewSchedule,
      contingencyPlans,
      progressTracking,
    };
  }

  /**
   * Create weekly plans
   */
  private createWeeklyPlans(
    actions: Action[],
    numberOfWeeks: number,
    weeklyHours: number
  ): WeeklyPlan[] {
    const weeklyPlans: WeeklyPlan[] = [];
    let remainingActions = [...actions];

    for (let week = 1; week <= numberOfWeeks; week++) {
      const weekActions = this.selectActionsForWeek(
        remainingActions,
        weeklyHours
      );

      // Remove selected actions from remaining
      weekActions.forEach(action => {
        const index = remainingActions.findIndex(a => a.id === action.id);
        if (index > -1) {
          remainingActions.splice(index, 1);
        }
      });

      const weeklyPlan: WeeklyPlan = {
        weekNumber: week,
        startDate: this.getWeekStartDate(week),
        endDate: this.getWeekEndDate(week),
        focus: this.determineWeekFocus(weekActions),
        goals: this.generateWeeklyGoals(weekActions),
        actions: weekActions,
        milestones: [], // Will be populated based on actions
        timeBudget: this.calculateTimeBudget(weekActions, weeklyHours),
        reviewPoints: {
          midWeek: `Review progress on ${weekActions.length} actions`,
          endOfWeek: `Complete week ${week} review and plan week ${week + 1}`,
        },
      };

      weeklyPlans.push(weeklyPlan);
    }

    return weeklyPlans;
  }

  /**
   * Select actions for a week
   */
  private selectActionsForWeek(
    availableActions: Action[],
    weeklyHours: number
  ): Action[] {
    const selected: Action[] = [];
    let hoursUsed = 0;

    // Sort by priority and prerequisites
    const sorted = this.sortActionsByPriority(availableActions);

    for (const action of sorted) {
      const hoursWithBuffer = action.estimatedDuration * (1 + this.config.bufferPercentage);

      if (hoursUsed + hoursWithBuffer <= weeklyHours * 4) { // Monthly allocation
        selected.push(action);
        hoursUsed += hoursWithBuffer;
      }

      if (hoursUsed >= weeklyHours * 4 * 0.8) { // 80% capacity
        break;
      }
    }

    return selected;
  }

  /**
   * Sort actions by priority and prerequisites
   */
  private sortActionsByPriority(actions: Action[]): Action[] {
    const priorityOrder = {
      'CRITICAL': 0,
      'HIGH': 1,
      'MEDIUM': 2,
      'LOW': 3,
      'OPTIONAL': 4,
    };

    return actions.sort((a, b) => {
      // Sort by priority
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then by time horizon (shorter first)
      const horizonOrder = {
        'NEXT_7_DAYS': 0,
        'NEXT_30_DAYS': 1,
        'NEXT_90_DAYS': 2,
        'NEXT_1_YEAR': 3,
        'NEXT_3_YEARS': 4,
      };

      return horizonOrder[a.timeHorizon] - horizonOrder[b.timeHorizon];
    });
  }

  /**
   * Determine week focus based on actions
   */
  private determineWeekFocus(actions: Action[]): string {
    if (actions.length === 0) return 'Catch up and review';

    const types = actions.map(a => a.type);
    const primaryType = this.getMostCommon(types);

    const focusMap: Record<string, string> = {
      'LEARN': 'Skill building and learning',
      'PRACTICE': 'Hands-on practice and projects',
      'NETWORK': 'Networking and relationship building',
      'RESEARCH': 'Research and exploration',
      'APPLY': 'Applications and submissions',
    };

    return focusMap[primaryType] || 'Mixed focus - various activities';
  }

  /**
   * Generate weekly goals
   */
  private generateWeeklyGoals(actions: Action[]): string[] {
    return actions.map(action =>
      `Complete: ${action.title}`
    ).slice(0, 3); // Top 3 goals
  }

  /**
   * Calculate time budget for week
   */
  private calculateTimeBudget(
    actions: Action[],
    weeklyHours: number
  ): WeeklyPlan['timeBudget'] {
    const learning = actions
      .filter(a => a.type === 'LEARN')
      .reduce((sum, a) => sum + a.estimatedDuration, 0);

    const practice = actions
      .filter(a => a.type === 'PRACTICE')
      .reduce((sum, a) => sum + a.estimatedDuration, 0);

    const networking = actions
      .filter(a => a.type === 'NETWORK')
      .reduce((sum, a) => sum + a.estimatedDuration, 0);

    const other = actions
      .filter(a => !['LEARN', 'PRACTICE', 'NETWORK'].includes(a.type))
      .reduce((sum, a) => sum + a.estimatedDuration, 0);

    return {
      totalHours: weeklyHours,
      studyHours: Math.round(learning),
      practiceHours: Math.round(practice),
      networkingHours: Math.round(networking),
      otherHours: Math.round(other),
    };
  }

  /**
   * Create monthly plans from weekly plans
   */
  private createMonthlyPlans(weeklyPlans: WeeklyPlan[]): MonthlyPlan[] {
    const monthlyPlans: MonthlyPlan[] = [];
    const weeksPerMonth = 4;

    for (let i = 0; i < weeklyPlans.length; i += weeksPerMonth) {
      const monthWeeks = weeklyPlans.slice(i, i + weeksPerMonth);
      const monthNumber = Math.floor(i / weeksPerMonth) + 1;

      monthlyPlans.push({
        month: monthNumber,
        name: this.getMonthName(monthNumber),
        theme: this.determineMonthTheme(monthWeeks),
        description: this.generateMonthDescription(monthWeeks),
        weeklyPlans: monthWeeks,
        monthlyGoals: this.generateMonthlyGoals(monthWeeks),
        keyMilestones: [],
        skillTargets: [],
        reviewCriteria: [
          'All weekly goals achieved',
          'Milestones on track',
          'Skills progressing',
          'Obstacles addressed',
        ],
      });
    }

    return monthlyPlans;
  }

  /**
   * Get month name
   */
  private getMonthName(monthNumber: number): string {
    const names = [
      'Foundation',
      'Skill Building',
      'Application',
      'Growth',
      'Mastery',
      'Transition',
    ];
    return names[monthNumber - 1] || `Month ${monthNumber}`;
  }

  /**
   * Determine month theme
   */
  private determineMonthTheme(weeks: WeeklyPlan[]): string {
    const focuses = weeks.map(w => w.focus);
    return this.getMostCommon(focuses);
  }

  /**
   * Generate month description
   */
  private generateMonthDescription(weeks: WeeklyPlan[]): string {
    const actionCount = weeks.reduce((sum, w) => sum + w.actions.length, 0);
    return `Execute ${actionCount} actions across ${weeks.length} weeks with focus on skill development.`;
  }

  /**
   * Generate monthly goals
   */
  private generateMonthlyGoals(weeks: WeeklyPlan[]): string[] {
    const allGoals = weeks.flatMap(w => w.goals);
    return [...new Set(allGoals)].slice(0, 5);
  }

  /**
   * Schedule milestones
   */
  private scheduleMilestones(
    milestones: PlannedMilestone[]
  ): PlannedMilestone[] {
    return milestones.map((milestone, index) => ({
      ...milestone,
      targetDate: this.calculateMilestoneDate(index),
    }));
  }

  /**
   * Create review schedule
   */
  private createReviewSchedule(weeklyPlans: WeeklyPlan[]): ReviewPoint[] {
    const reviews: ReviewPoint[] = [];

    // Weekly reviews
    weeklyPlans.forEach(week => {
      reviews.push({
        date: week.endDate,
        type: 'WEEKLY',
        focus: `Week ${week.weekNumber} review`,
        questions: [
          'What did I accomplish this week?',
          'What obstacles did I face?',
          'What will I focus on next week?',
        ],
        successIndicators: ['All planned actions completed', 'Skills practiced'],
      });
    });

    // Bi-weekly deep reviews
    for (let i = 1; i < weeklyPlans.length; i += this.config.reviewFrequencyWeeks) {
      reviews.push({
        date: weeklyPlans[i].endDate,
        type: 'MONTHLY',
        focus: `Bi-weekly progress assessment`,
        questions: [
          'Am I on track with my goals?',
          'Do I need to adjust my plan?',
          'What have I learned about myself?',
        ],
        successIndicators: [
          'Progress visible in skills',
          'Milestones approaching',
          'Confidence increasing',
        ],
      });
    }

    return reviews;
  }

  /**
   * Create contingency plans
   */
  private createContingencyPlans(actions: Action[]): ContingencyPlan[] {
    return [
      {
        trigger: 'Missed weekly goals',
        condition: 'Less than 50% of weekly actions completed',
        alternativeActions: this.createRecoveryActions(),
        adjustmentStrategy: 'Reduce scope, extend timeline, or increase hours temporarily',
      },
      {
        trigger: 'Financial constraint',
        condition: 'Cannot afford planned course/certification',
        alternativeActions: this.createFreeAlternativeActions(),
        adjustmentStrategy: 'Switch to free resources, delay paid options, or seek scholarships',
      },
      {
        trigger: 'Time constraint',
        condition: 'Available hours reduced unexpectedly',
        alternativeActions: this.createMinimalActions(),
        adjustmentStrategy: 'Focus on highest impact actions only, defer lower priority items',
      },
      {
        trigger: 'Skill learning difficulty',
        condition: 'Struggling with specific skill acquisition',
        alternativeActions: this.createSupportActions(),
        adjustmentStrategy: 'Seek mentorship, join study group, or switch learning resource',
      },
    ];
  }

  /**
   * Create recovery actions for missed goals
   */
  private createRecoveryActions(): Action[] {
    return [
      {
        id: 'recovery_1',
        title: 'Catch-up session',
        description: 'Dedicated block to complete missed items',
        type: 'EXECUTE',
        priority: 'HIGH',
        status: 'NOT_STARTED' as ActionStatus,
        timeHorizon: 'NEXT_7_DAYS',
        estimatedDuration: 4,
        resourcesRequired: [{ type: 'TIME', amount: 4, unit: 'hours', isNegotiable: false }],
        skillsDeveloped: [],
        prerequisites: [],
        tags: ['recovery', 'catch-up'],
        source: 'ExecutionPlanner',
        expectedOutcome: 'Back on track with plan',
        successCriteria: ['Missed items completed'],
        strategicContribution: 'Maintains momentum',
        confidence: 0.9,
        generatedAt: Date.now(),
      },
    ];
  }

  /**
   * Create free alternative actions
   */
  private createFreeAlternativeActions(): Action[] {
    return [
      {
        id: 'free_alt_1',
        title: 'Switch to free learning resources',
        description: 'Use freeCodeCamp, YouTube, or library resources',
        type: 'RESEARCH',
        priority: 'HIGH',
        status: 'NOT_STARTED' as ActionStatus,
        timeHorizon: 'NEXT_7_DAYS',
        estimatedDuration: 2,
        resourcesRequired: [{ type: 'TIME', amount: 2, unit: 'hours', isNegotiable: false }],
        skillsDeveloped: [],
        prerequisites: [],
        tags: ['cost-saving', 'alternative'],
        source: 'ExecutionPlanner',
        expectedOutcome: 'Free learning path identified',
        successCriteria: ['Free resources identified and accessed'],
        strategicContribution: 'Maintains progress within budget',
        confidence: 0.85,
        generatedAt: Date.now(),
      },
    ];
  }

  /**
   * Create minimal actions for time constraints
   */
  private createMinimalActions(): Action[] {
    return [
      {
        id: 'minimal_1',
        title: 'Focus on single highest-impact action',
        description: 'Do only the most critical action this week',
        type: 'EXECUTE',
        priority: 'CRITICAL',
        status: 'NOT_STARTED' as ActionStatus,
        timeHorizon: 'NEXT_7_DAYS',
        estimatedDuration: 2,
        resourcesRequired: [{ type: 'TIME', amount: 2, unit: 'hours', isNegotiable: false }],
        skillsDeveloped: [],
        prerequisites: [],
        tags: ['minimal', 'focus'],
        source: 'ExecutionPlanner',
        expectedOutcome: 'Critical progress maintained',
        successCriteria: ['One critical action completed'],
        strategicContribution: 'Maintains minimum viable progress',
        confidence: 0.9,
        generatedAt: Date.now(),
      },
    ];
  }

  /**
   * Create support-seeking actions
   */
  private createSupportActions(): Action[] {
    return [
      {
        id: 'support_1',
        title: 'Find study partner or mentor',
        description: 'Connect with someone who can help with this skill',
        type: 'NETWORK',
        priority: 'HIGH',
        status: 'NOT_STARTED' as ActionStatus,
        timeHorizon: 'NEXT_7_DAYS',
        estimatedDuration: 3,
        resourcesRequired: [{ type: 'TIME', amount: 3, unit: 'hours', isNegotiable: false }],
        skillsDeveloped: [],
        prerequisites: [],
        tags: ['support', 'mentorship'],
        source: 'ExecutionPlanner',
        expectedOutcome: 'Support system established',
        successCriteria: ['Mentor or study partner found'],
        strategicContribution: 'Overcomes learning obstacles',
        confidence: 0.75,
        generatedAt: Date.now(),
      },
    ];
  }

  /**
   * Create progress tracker
   */
  private createProgressTracker(actions: Action[]): ProgressTracker {
    return {
      metrics: [
        'Actions completed per week',
        'Hours spent on skill development',
        'Skills acquired',
        'Portfolio projects completed',
        'Network connections made',
        'Applications submitted',
      ],
      trackingFrequency: 'Weekly',
      checkInPoints: this.generateCheckInPoints(),
      successIndicators: [
        'Consistent weekly progress',
        'Skills visibly improving',
        'Confidence increasing',
        'Milestones being reached',
      ],
      warningIndicators: [
        'Missing weekly goals repeatedly',
        'Procrastination on critical tasks',
        'Feeling overwhelmed or stuck',
        'No visible progress after 4 weeks',
      ],
    };
  }

  /**
   * Generate check-in points
   */
  private generateCheckInPoints(): BeliefTimestamp[] {
    const points: BeliefTimestamp[] = [];
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;

    for (let i = 1; i <= 12; i++) {
      points.push(now + i * weekMs);
    }

    return points;
  }

  /**
   * Get week start date
   */
  private getWeekStartDate(weekNumber: number): BeliefTimestamp {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilStart = (this.config.weekStartDay - dayOfWeek + 7) % 7;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + daysUntilStart + (weekNumber - 1) * 7);
    return weekStart.getTime();
  }

  /**
   * Get week end date
   */
  private getWeekEndDate(weekNumber: number): BeliefTimestamp {
    return this.getWeekStartDate(weekNumber + 1) - 1;
  }

  /**
   * Calculate milestone date
   */
  private calculateMilestoneDate(index: number): BeliefTimestamp {
    const now = Date.now();
    const monthMs = 30 * 24 * 60 * 60 * 1000;
    return now + (index + 1) * monthMs;
  }

  /**
   * Calculate target completion date
   */
  private calculateTargetDate(actions: Action[]): BeliefTimestamp {
    const totalHours = actions.reduce((sum, a) => sum + a.estimatedDuration, 0);
    const weeks = Math.ceil(totalHours / this.config.defaultWeeklyHours);
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    return Date.now() + weeks * weekMs;
  }

  /**
   * Get most common item in array
   */
  private getMostCommon<T>(items: T[]): T {
    const counts = new Map<T, number>();
    items.forEach(item => {
      counts.set(item, (counts.get(item) || 0) + 1);
    });

    let maxCount = 0;
    let mostCommon = items[0];

    counts.forEach((count, item) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = item;
      }
    });

    return mostCommon;
  }

  /**
   * Generate plan ID
   */
  private generatePlanId(): EntityId {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ExecutionPlannerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): ExecutionPlannerConfig {
    return { ...this.config };
  }
}

/**
 * Factory function to create ExecutionPlanner
 */
export function createExecutionPlanner(
  config?: Partial<ExecutionPlannerConfig>
): ExecutionPlanner {
  return new ExecutionPlanner(config);
}
