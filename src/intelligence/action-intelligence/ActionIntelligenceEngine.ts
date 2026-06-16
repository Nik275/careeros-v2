/**
 * Action Intelligence Engine (AIE)
 *
 * The Action Intelligence Engine transforms all CareerOS intelligence into
 * executable plans. It answers the fundamental question: "What do I do next?"
 *
 * Architecture:
 * - ActionGenerator: Creates specific, actionable items from intelligence
 * - PriorityEngine: Ranks and prioritizes actions
 * - SkillGapEngine: Identifies skill gaps and development plans
 * - OpportunityEngine: Recommends courses, projects, internships
 * - ExecutionPlanner: Creates detailed schedules and timelines
 * - ActionExplanationEngine: Generates natural language explanations
 *
 * Time Horizons:
 * - NEXT_7_DAYS: Immediate actions
 * - NEXT_30_DAYS: This month's priorities
 * - NEXT_90_DAYS: Quarterly goals
 * - NEXT_1_YEAR: Annual milestones
 * - NEXT_3_YEARS: Long-term trajectory
 *
 * @module intelligence/action-intelligence
 */

import type {
  EntityId,
  StudentBelief,
  BeliefTimestamp,
} from '../types';

import type {
  ActionIntelligenceInput,
  ActionIntelligenceConfig,
  ActionOutput,
  Action,
  PrioritizedAction,
  PriorityRoadmap,
  SkillGapAnalysis,
  SkillDevelopmentPlan,
  OpportunityBundle,
  ExecutionPlan,
  ActionExplanation,
  WeeklyPlan,
  MonthlyPlan,
  Milestone,
  PlannedMilestone,
} from './types';

import { ActionPriority, ActionStatus, ActionType, TimeHorizon } from './types';

// Import sub-engines
import {
  ActionGenerator,
  createActionGenerator,
  type ActionGeneratorConfig,
} from './engines/ActionGenerator';

import {
  PriorityEngine,
  createPriorityEngine,
  type PriorityEngineConfig,
} from './engines/PriorityEngine';

import {
  SkillGapEngine,
  createSkillGapEngine,
  type SkillGapEngineConfig,
} from './engines/SkillGapEngine';

import {
  OpportunityEngine,
  createOpportunityEngine,
  type OpportunityEngineConfig,
} from './engines/OpportunityEngine';

import {
  ExecutionPlanner,
  createExecutionPlanner,
  type ExecutionPlannerConfig,
} from './engines/ExecutionPlanner';

import {
  ActionExplanationEngine,
  createExplanationEngine,
  type ExplanationEngineConfig,
} from './engines/ActionExplanationEngine';

// Default configuration
export const DEFAULT_ACTION_INTELLIGENCE_CONFIG: ActionIntelligenceConfig = {
  generateExplanations: true,
  includeContingencyPlans: true,
  includeResourceAnalysis: true,
  autoAdjustForConstraints: true,
  maxActionsPerHorizon: 10,
  minActionPriority: 'OPTIONAL',
  explanationDetailLevel: 'standard',
  defaultTimeHorizon: TimeHorizon.NEXT_90_DAYS,
  includeWeeklyPlans: true,
  includeMonthlyPlans: true,
};

/**
 * Action Intelligence Engine
 *
 * Main orchestrator that coordinates all sub-engines to generate
 * comprehensive, prioritized action plans.
 */
export class ActionIntelligenceEngine {
  private config: ActionIntelligenceConfig;
  private actionGenerator: ActionGenerator;
  private priorityEngine: PriorityEngine;
  private skillGapEngine: SkillGapEngine;
  private opportunityEngine: OpportunityEngine;
  private executionPlanner: ExecutionPlanner;
  private explanationEngine: ActionExplanationEngine;

  constructor(config: Partial<ActionIntelligenceConfig> = {}) {
    this.config = { ...DEFAULT_ACTION_INTELLIGENCE_CONFIG, ...config };

    // Initialize sub-engines with appropriate configurations
    this.actionGenerator = createActionGenerator();
    this.priorityEngine = createPriorityEngine();
    this.skillGapEngine = createSkillGapEngine();
    this.opportunityEngine = createOpportunityEngine();
    this.executionPlanner = createExecutionPlanner();
    this.explanationEngine = createExplanationEngine({
      detailLevel: this.config.explanationDetailLevel,
    });
  }

  /**
   * Generate complete action intelligence output
   *
   * This is the main entry point that orchestrates all sub-engines
   * to produce a comprehensive action plan.
   */
  generate(input: ActionIntelligenceInput): ActionOutput {
    const timestamp = Date.now();

    // 1. Generate all possible actions
    const actions = this.generateActions(input);

    // 2. Prioritize actions
    const priorityRoadmap = this.prioritizeActions(actions, input);

    // 3. Analyze skill gaps
    const skillGapAnalysis = this.analyzeSkillGaps(input);
    const skillDevelopmentPlan = this.createSkillDevelopmentPlan(skillGapAnalysis, input);

    // 4. Generate opportunities
    const opportunities = this.generateOpportunities(input);

    // 5. Create execution plan
    const allPrioritizedActions = priorityRoadmap.sequencedOrder;
    const milestones = this.createMilestones(allPrioritizedActions, input);
    const executionPlan = this.createExecutionPlan(allPrioritizedActions, milestones, input);

    // 6. Generate explanations if enabled
    const explanations = this.config.generateExplanations
      ? this.generateExplanations(priorityRoadmap, input)
      : [];

    // 7. Create summary
    const summary = this.createSummary(
      actions,
      priorityRoadmap,
      milestones,
      opportunities,
      input
    );

    // 8. Compile final output
    return {
      // Core outputs
      immediateActions: this.filterByTimeHorizon(allPrioritizedActions, TimeHorizon.NEXT_7_DAYS),
      weeklyPlan: executionPlan.weeklyPlans[0],
      monthlyPlan: executionPlan.monthlyPlans[0],

      // Priority-organized actions
      prioritizedActions: {
        critical: priorityRoadmap.critical,
        high: priorityRoadmap.high,
        medium: priorityRoadmap.medium,
        low: priorityRoadmap.low,
      },

      // All actions
      allActions: allPrioritizedActions,
      topActions: this.getTopActions(allPrioritizedActions, 5),

      // Milestones
      milestones: milestones,
      milestonesByTimeHorizon: this.organizeMilestonesByHorizon(milestones),

      // Skill development
      skillGapAnalysis,
      skillDevelopmentPlan,

      // Opportunities
      opportunities,

      // Execution
      executionPlan,

      // Explanations
      explanations,
      summary,

      // Metadata
      generatedAt: timestamp,
      targetCareer: input.targetCareer || 'Not specified',
      estimatedCompletionTime: priorityRoadmap.estimatedTimeline.all,
      nextReviewDate: this.calculateNextReviewDate(executionPlan),
    };
  }

  /**
   * Generate actions from all intelligence inputs
   */
  private generateActions(input: ActionIntelligenceInput): Action[] {
    return Object.values(this.actionGenerator.generate(input)).flat();
  }

  /**
   * Prioritize all actions
   */
  private prioritizeActions(
    actions: Action[],
    input: ActionIntelligenceInput
  ): PriorityRoadmap {
    return this.priorityEngine.prioritize(actions, input);
  }

  /**
   * Analyze skill gaps
   */
  private analyzeSkillGaps(input: ActionIntelligenceInput): SkillGapAnalysis {
    return this.skillGapEngine.analyze(input);
  }

  /**
   * Create skill development plan
   */
  private createSkillDevelopmentPlan(
    analysis: SkillGapAnalysis,
    input: ActionIntelligenceInput
  ): SkillDevelopmentPlan {
    return this.skillGapEngine.createDevelopmentPlan(analysis, input);
  }

  /**
   * Generate opportunities
   */
  private generateOpportunities(input: ActionIntelligenceInput): OpportunityBundle[] {
    return this.opportunityEngine.generate(input);
  }

  /**
   * Create execution plan
   */
  private createExecutionPlan(
    actions: PrioritizedAction[],
    milestones: PlannedMilestone[],
    input: ActionIntelligenceInput
  ): ExecutionPlan {
    return this.executionPlanner.createPlan(actions, milestones, input);
  }

  /**
   * Generate explanations for actions
   */
  private generateExplanations(
    roadmap: PriorityRoadmap,
    input: ActionIntelligenceInput
  ): ActionExplanation[] {
    const allActions = roadmap.sequencedOrder;

    // Generate explanations for top priority actions
    const topActions = allActions.filter(
      a => a.priority === ActionPriority.CRITICAL || a.priority === ActionPriority.HIGH
    ).slice(0, 10);

    return topActions.map(action =>
      this.explanationEngine.explain(action, input, allActions)
    );
  }

  /**
   * Create milestones from actions
   */
  private createMilestones(
    actions: PrioritizedAction[],
    input: ActionIntelligenceInput
  ): PlannedMilestone[] {
    const milestones: PlannedMilestone[] = [];

    // Create foundation milestone
    milestones.push({
      id: this.generateId(),
      name: 'Foundation Set',
      description: 'Complete initial research and self-assessment',
      targetDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      successCriteria: [
        'Career research completed',
        'Skills assessment done',
        'Gap analysis complete',
      ],
      associatedActions: actions
        .filter(a => a.timeHorizon === TimeHorizon.NEXT_30_DAYS && a.type === ActionType.RESEARCH)
        .slice(0, 5)
        .map(a => a.id),
      estimatedEffort: 40, // hours
      priority: ActionPriority.CRITICAL,
      timeHorizon: TimeHorizon.NEXT_30_DAYS,
      status: ActionStatus.NOT_STARTED,
    });

    // Create skill building milestone
    milestones.push({
      id: this.generateId(),
      name: 'Core Skills Built',
      description: 'Develop foundational skills for target career',
      targetDate: Date.now() + 90 * 24 * 60 * 60 * 1000, // 90 days
      successCriteria: [
        'Critical skills developed',
        'Projects completed',
        'Portfolio pieces created',
      ],
      associatedActions: actions
        .filter(a => a.type === ActionType.LEARN || a.type === ActionType.PRACTICE)
        .slice(0, 5)
        .map(a => a.id),
      estimatedEffort: 120, // hours
      priority: ActionPriority.HIGH,
      timeHorizon: TimeHorizon.NEXT_90_DAYS,
      status: ActionStatus.NOT_STARTED,
      dependencies: [milestones[0]?.id].filter(Boolean) as EntityId[],
    });

    // Create application milestone
    milestones.push({
      id: this.generateId(),
      name: 'Applications Submitted',
      description: 'Apply to target opportunities',
      targetDate: Date.now() + 180 * 24 * 60 * 60 * 1000, // 180 days
      successCriteria: [
        'Applications submitted',
        'Interviews scheduled',
        'Offers received',
      ],
      associatedActions: actions
        .filter(a => a.type === ActionType.APPLY)
        .slice(0, 5)
        .map(a => a.id),
      estimatedEffort: 60, // hours
      priority: ActionPriority.HIGH,
      timeHorizon: TimeHorizon.NEXT_1_YEAR,
      status: ActionStatus.NOT_STARTED,
      dependencies: [milestones[1]?.id].filter(Boolean) as EntityId[],
    });

    // Create transition milestone
    milestones.push({
      id: this.generateId(),
      name: 'Career Transition',
      description: 'Successfully transition to target career',
      targetDate: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
      successCriteria: [
        'Offer accepted',
        'Career transition complete',
        'First 90 days successful',
      ],
      associatedActions: [],
      estimatedEffort: 40, // hours
      priority: ActionPriority.CRITICAL,
      timeHorizon: TimeHorizon.NEXT_1_YEAR,
      status: ActionStatus.NOT_STARTED,
      dependencies: [milestones[2]?.id].filter(Boolean) as EntityId[],
    });

    return milestones;
  }

  /**
   * Create human-readable summary
   */
  private createSummary(
    actions: Action[],
    roadmap: PriorityRoadmap,
    milestones: PlannedMilestone[],
    opportunities: OpportunityBundle[],
    input: ActionIntelligenceInput
  ): string {
    const output: ActionOutput = {
      immediateActions: this.filterByTimeHorizon(roadmap.sequencedOrder, TimeHorizon.NEXT_7_DAYS),
      weeklyPlan: { weekNumber: 1, actions: [], goals: [], timeBudget: { totalHours: 0, studyHours: 0, practiceHours: 0, networkingHours: 0, otherHours: 0 } },
      monthlyPlan: { month: 1, name: 'Foundation', weeklyPlans: [], monthlyGoals: [], reviewCriteria: [] },
      prioritizedActions: {
        critical: roadmap.critical,
        high: roadmap.high,
        medium: roadmap.medium,
        low: roadmap.low,
      },
      allActions: roadmap.sequencedOrder,
      topActions: this.getTopActions(roadmap.sequencedOrder, 5),
      milestones,
      milestonesByTimeHorizon: this.organizeMilestonesByHorizon(milestones),
      opportunities,
      generatedAt: Date.now(),
      targetCareer: input.targetCareer || 'Not specified',
      estimatedCompletionTime: roadmap.estimatedTimeline.all,
      nextReviewDate: Date.now() + 14 * 24 * 60 * 60 * 1000,
    };

    return this.explanationEngine.summarize(output, input);
  }

  /**
   * Filter actions by time horizon
   */
  private filterByTimeHorizon(
    actions: PrioritizedAction[],
    horizon: TimeHorizon
  ): PrioritizedAction[] {
    return actions.filter(a => a.timeHorizon === horizon);
  }

  /**
   * Get top N actions
   */
  private getTopActions(
    actions: PrioritizedAction[],
    count: number
  ): PrioritizedAction[] {
    return actions
      .filter(a =>
        a.priority === ActionPriority.CRITICAL ||
        a.priority === ActionPriority.HIGH
      )
      .slice(0, count);
  }

  /**
   * Organize milestones by time horizon
   */
  private organizeMilestonesByHorizon(
    milestones: PlannedMilestone[]
  ): Record<TimeHorizon, PlannedMilestone[]> {
    return {
      [TimeHorizon.NEXT_7_DAYS]: [],
      [TimeHorizon.NEXT_30_DAYS]: milestones.filter(m => m.timeHorizon === TimeHorizon.NEXT_30_DAYS),
      [TimeHorizon.NEXT_90_DAYS]: milestones.filter(m => m.timeHorizon === TimeHorizon.NEXT_90_DAYS),
      [TimeHorizon.NEXT_1_YEAR]: milestones.filter(m => m.timeHorizon === TimeHorizon.NEXT_1_YEAR),
      [TimeHorizon.NEXT_3_YEARS]: milestones.filter(m => m.timeHorizon === TimeHorizon.NEXT_3_YEARS),
    };
  }

  /**
   * Calculate next review date
   */
  private calculateNextReviewDate(executionPlan: ExecutionPlan): BeliefTimestamp {
    // Default to 2 weeks from now
    return Date.now() + 14 * 24 * 60 * 60 * 1000;
  }

  /**
   * Generate unique ID
   */
  private generateId(): EntityId {
    return `aie_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ============ Configuration Management ============

  /**
   * Update engine configuration
   */
  updateConfig(config: Partial<ActionIntelligenceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): ActionIntelligenceConfig {
    return { ...this.config };
  }

  /**
   * Update sub-engine configurations
   */
  updateSubEngineConfigs(configs: {
    generator?: Partial<ActionGeneratorConfig>;
    priority?: Partial<PriorityEngineConfig>;
    skillGap?: Partial<SkillGapEngineConfig>;
    opportunity?: Partial<OpportunityEngineConfig>;
    execution?: Partial<ExecutionPlannerConfig>;
    explanation?: Partial<ExplanationEngineConfig>;
  }): void {
    if (configs.generator) this.actionGenerator.updateConfig(configs.generator);
    if (configs.priority) this.priorityEngine.updateConfig(configs.priority);
    if (configs.skillGap) this.skillGapEngine.updateConfig(configs.skillGap);
    if (configs.opportunity) this.opportunityEngine.updateConfig(configs.opportunity);
    if (configs.execution) this.executionPlanner.updateConfig(configs.execution);
    if (configs.explanation) this.explanationEngine.updateConfig(configs.explanation);
  }
}

/**
 * Factory function to create ActionIntelligenceEngine
 */
export function createActionIntelligenceEngine(
  config?: Partial<ActionIntelligenceConfig>
): ActionIntelligenceEngine {
  return new ActionIntelligenceEngine(config);
}

// Re-export types
export type {
  ActionIntelligenceInput,
  ActionIntelligenceConfig,
  ActionOutput,
  Action,
  PrioritizedAction,
  PriorityRoadmap,
  SkillGapAnalysis,
  SkillDevelopmentPlan,
  OpportunityBundle,
  ExecutionPlan,
  ActionExplanation,
  WeeklyPlan,
  MonthlyPlan,
  PlannedMilestone,
} from './types';

export { ActionType, ActionStatus, ActionPriority, TimeHorizon } from './types';

// Re-export sub-engines
export {
  ActionGenerator,
  createActionGenerator,
  type ActionGeneratorConfig,
} from './engines/ActionGenerator';

export {
  PriorityEngine,
  createPriorityEngine,
  type PriorityEngineConfig,
} from './engines/PriorityEngine';

export {
  SkillGapEngine,
  createSkillGapEngine,
  type SkillGapEngineConfig,
} from './engines/SkillGapEngine';

export {
  OpportunityEngine,
  createOpportunityEngine,
  type OpportunityEngineConfig,
} from './engines/OpportunityEngine';

export {
  ExecutionPlanner,
  createExecutionPlanner,
  type ExecutionPlannerConfig,
} from './engines/ExecutionPlanner';

export {
  ActionExplanationEngine,
  createExplanationEngine,
  type ExplanationEngineConfig,
} from './engines/ActionExplanationEngine';
