/**
 * Action Intelligence - Priority Engine
 *
 * Ranks and prioritizes actions based on multiple dimensions:
 * - Impact on goals
 * - Urgency/time sensitivity
 * - Difficulty
 * - Expected return
 * - Risk
 * - Constraint alignment
 *
 * @module intelligence/action-intelligence
 */

import type {
  Action,
  PrioritizedAction,
  PriorityScore,
  PriorityRoadmap,
  ActionIntelligenceInput,
} from '../types';

import {
  ActionPriority,
  calculateOverallPriorityScore,
  getPriorityWeight,
  TimeHorizon,
} from '../types';

/**
 * Priority Engine Configuration
 */
export interface PriorityEngineConfig {
  /** Weight for impact dimension */
  impactWeight: number;

  /** Weight for urgency dimension */
  urgencyWeight: number;

  /** Weight for difficulty (inverted - easier = higher score) */
  difficultyWeight: number;

  /** Weight for expected return */
  returnWeight: number;

  /** Weight for risk */
  riskWeight: number;

  /** Weight for constraint alignment */
  constraintWeight: number;

  /** Whether to consider dependencies in sequencing */
  respectDependencies: boolean;

  /** Minimum score for CRITICAL priority */
  criticalThreshold: number;

  /** Minimum score for HIGH priority */
  highThreshold: number;

  /** Minimum score for MEDIUM priority */
  mediumThreshold: number;
}

/**
 * Default configuration
 */
export const DEFAULT_PRIORITY_ENGINE_CONFIG: PriorityEngineConfig = {
  impactWeight: 0.25,
  urgencyWeight: 0.25,
  difficultyWeight: 0.15,
  returnWeight: 0.15,
  riskWeight: 0.1,
  constraintWeight: 0.1,
  respectDependencies: true,
  criticalThreshold: 0.85,
  highThreshold: 0.7,
  mediumThreshold: 0.5,
};

/**
 * Priority Engine
 *
 * Calculates priority scores and creates ranked roadmaps.
 */
export class PriorityEngine {
  private config: PriorityEngineConfig;

  constructor(config: Partial<PriorityEngineConfig> = {}) {
    this.config = { ...DEFAULT_PRIORITY_ENGINE_CONFIG, ...config };
  }

  /**
   * Prioritize a list of actions
   */
  prioritize(
    actions: Action[],
    input: ActionIntelligenceInput
  ): PriorityRoadmap {
    // Calculate priority scores for each action
    const scoredActions: PrioritizedAction[] = actions.map(action => ({
      ...action,
      priorityScore: this.calculatePriorityScore(action, input),
      rank: 0, // Will be set after sorting
      reasonForPriority: '',
      suggestedOrder: 0,
      dependenciesOn: [],
    }));

    // Assign priority levels based on scores
    const withPriorities = scoredActions.map(action => ({
      ...action,
      priority: this.assignPriorityLevel(action.priorityScore.overall),
      reasonForPriority: this.generatePriorityReason(action),
    }));

    // Sort by overall score
    const sorted = withPriorities.sort((a, b) => {
      // First by priority level
      const priorityDiff = getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
      if (priorityDiff !== 0) return priorityDiff;

      // Then by overall score
      return b.priorityScore.overall - a.priorityScore.overall;
    });

    // Assign ranks
    sorted.forEach((action, index) => {
      action.rank = index + 1;
      action.suggestedOrder = index + 1;
    });

    // Handle dependencies if enabled
    if (this.config.respectDependencies) {
      this.reorderForDependencies(sorted);
    }

    // Organize into priority buckets
    const roadmap: PriorityRoadmap = {
      critical: sorted.filter(a => a.priority === ActionPriority.CRITICAL),
      high: sorted.filter(a => a.priority === ActionPriority.HIGH),
      medium: sorted.filter(a => a.priority === ActionPriority.MEDIUM),
      low: sorted.filter(a => a.priority === ActionPriority.LOW),
      optional: sorted.filter(a => a.priority === ActionPriority.OPTIONAL),
      sequencedOrder: sorted,
      estimatedTimeline: this.estimateTimeline(sorted),
    };

    return roadmap;
  }

  /**
   * Calculate comprehensive priority score for an action
   */
  private calculatePriorityScore(
    action: Action,
    input: ActionIntelligenceInput
  ): PriorityScore {
    return {
      impact: this.calculateImpactScore(action, input),
      urgency: this.calculateUrgencyScore(action, input),
      difficulty: this.calculateDifficultyScore(action, input),
      expectedReturn: this.calculateReturnScore(action, input),
      risk: this.calculateRiskScore(action, input),
      constraintAlignment: this.calculateConstraintAlignment(action, input),
      strategicImportance: this.calculateStrategicImportance(action, input),
      overall: 0, // Will be calculated below
    };
  }

  /**
   * Calculate impact score (0-1)
   */
  private calculateImpactScore(
    action: Action,
    input: ActionIntelligenceInput
  ): number {
    let score = 0.5; // Base score

    // Critical priority actions have high impact
    if (action.priority === ActionPriority.CRITICAL) {
      score += 0.3;
    } else if (action.priority === ActionPriority.HIGH) {
      score += 0.2;
    }

    // Actions that develop critical skills have higher impact
    if (action.skillsDeveloped.some(skill =>
      this.isCriticalSkill(skill, input)
    )) {
      score += 0.15;
    }

    // Foundation-setting actions (research, assessment) have high impact
    if (action.type === 'RESEARCH' || action.type === 'REFLECT') {
      score += 0.1;
    }

    // Actions with explicit strategic contribution
    if (action.strategicContribution.includes('Foundation') ||
        action.strategicContribution.includes('Critical')) {
      score += 0.1;
    }

    // Adjust by confidence
    score = score * (0.8 + action.confidence * 0.2);

    return Math.min(score, 1);
  }

  /**
   * Calculate urgency score (0-1)
   */
  private calculateUrgencyScore(
    action: Action,
    input: ActionIntelligenceInput
  ): number {
    let score = 0.3; // Base urgency

    // Time horizon affects urgency
    switch (action.timeHorizon) {
      case TimeHorizon.NEXT_7_DAYS:
        score += 0.4;
        break;
      case TimeHorizon.NEXT_30_DAYS:
        score += 0.3;
        break;
      case TimeHorizon.NEXT_90_DAYS:
        score += 0.15;
        break;
      case TimeHorizon.NEXT_1_YEAR:
        score += 0.05;
        break;
      default:
        break;
    }

    // Deadline-based urgency
    if (action.deadline) {
      const daysUntil = (action.deadline - Date.now()) / (1000 * 60 * 60 * 24);
      if (daysUntil < 7) {
        score += 0.3;
      } else if (daysUntil < 30) {
        score += 0.2;
      } else if (daysUntil < 90) {
        score += 0.1;
      }
    }

    // Decision context urgency
    if (input.decisionContext?.urgency === 'CRITICAL') {
      score += 0.2;
    } else if (input.decisionContext?.urgency === 'HIGH') {
      score += 0.1;
    }

    return Math.min(score, 1);
  }

  /**
   * Calculate difficulty score (0-1, higher = harder)
   */
  private calculateDifficultyScore(
    action: Action,
    input: ActionIntelligenceInput
  ): number {
    // Start with estimated duration as proxy for difficulty
    let score = Math.min(action.estimatedDuration / 50, 1) * 0.5;

    // Resource requirements add difficulty
    const moneyResources = action.resourcesRequired.filter(r => r.type === 'MONEY');
    const totalCost = moneyResources.reduce((sum, r) => sum + (r.amount || 0), 0);

    if (totalCost > 50000) {
      score += 0.2;
    } else if (totalCost > 20000) {
      score += 0.1;
    }

    // Prerequisites add complexity
    if (action.prerequisites.length > 2) {
      score += 0.15;
    } else if (action.prerequisites.length > 0) {
      score += 0.05;
    }

    // Type-based difficulty adjustments
    const difficultTypes = ['LEARN', 'CERTIFICATION', 'APPLY'];
    if (difficultTypes.includes(action.type)) {
      score += 0.1;
    }

    return Math.min(score, 1);
  }

  /**
   * Calculate expected return score (0-1)
   */
  private calculateReturnScore(
    action: Action,
    input: ActionIntelligenceInput
  ): number {
    let score = 0.4; // Base return

    // Skills developed indicate return
    score += Math.min(action.skillsDeveloped.length * 0.1, 0.3);

    // Strategic contribution indicates return
    if (action.strategicContribution.includes('career') ||
        action.strategicContribution.includes('employment')) {
      score += 0.2;
    }

    // Application-type actions lead to jobs
    if (action.type === 'APPLY') {
      score += 0.15;
    }

    // Confidence in outcome affects expected return
    score = score * (0.5 + action.confidence * 0.5);

    return Math.min(score, 1);
  }

  /**
   * Calculate risk score (0-1)
   */
  private calculateRiskScore(
    action: Action,
    input: ActionIntelligenceInput
  ): number {
    let score = 0.3; // Base risk

    // Application-type actions have risk of rejection
    if (action.type === 'APPLY') {
      score += 0.3;
    }

    // Financial investment increases risk
    const moneyResources = action.resourcesRequired.filter(r => r.type === 'MONEY');
    const totalCost = moneyResources.reduce((sum, r) => sum + (r.amount || 0), 0);

    if (totalCost > 50000) {
      score += 0.2;
    } else if (totalCost > 20000) {
      score += 0.1;
    }

    // Time investment is also a risk
    if (action.estimatedDuration > 100) {
      score += 0.1;
    }

    // Confidence inverse affects risk
    score += (1 - action.confidence) * 0.2;

    return Math.min(score, 1);
  }

  /**
   * Calculate constraint alignment score (0-1)
   */
  private calculateConstraintAlignment(
    action: Action,
    input: ActionIntelligenceInput
  ): number {
    let score = 0.7; // Base alignment

    // Check financial constraints
    if (input.constraints?.financial) {
      const moneyResources = action.resourcesRequired.filter(r => r.type === 'MONEY');
      const totalCost = moneyResources.reduce((sum, r) => sum + (r.amount || 0), 0);

      if (totalCost > input.constraints.financial.budget) {
        score -= 0.3;
      } else if (totalCost > input.constraints.financial.monthlyLimit * 3) {
        score -= 0.1;
      }
    }

    // Check temporal constraints
    if (input.constraints?.temporal) {
      const weeklyHours = action.estimatedDuration / 4; // Approximate
      if (weeklyHours > input.constraints.temporal.maxHoursPerWeek) {
        score -= 0.2;
      }
    }

    // Check location constraints
    if (input.constraints?.location) {
      // If action requires physical presence but can't relocate
      if (!input.constraints.location.canRelocate) {
        // Penalize location-dependent actions
        score -= 0.1;
      }
    }

    // Check family constraints
    if (input.constraints?.family?.requiresApproval) {
      // Family-dependent decisions need alignment
      if (action.tags.includes('family') || action.tags.includes('decision')) {
        score += 0.1; // Bonus for actions that address family concerns
      }
    }

    return Math.max(score, 0);
  }

  /**
   * Calculate strategic importance score (0-1)
   */
  private calculateStrategicImportance(
    action: Action,
    input: ActionIntelligenceInput
  ): number {
    let score = 0.4;

    // Critical path actions are strategically important
    if (action.priority === ActionPriority.CRITICAL) {
      score += 0.3;
    }

    // Foundation-setting actions are important
    if (action.strategicContribution.includes('Foundation') ||
        action.strategicContribution.includes('foundation')) {
      score += 0.2;
    }

    // Actions that unblock other actions are important
    if (action.prerequisites.length === 0) {
      score += 0.1; // Can start immediately
    }

    // High-confidence actions are strategically sound
    score += action.confidence * 0.2;

    return Math.min(score, 1);
  }

  /**
   * Assign priority level based on overall score
   */
  private assignPriorityLevel(score: number): ActionPriority {
    if (score >= this.config.criticalThreshold) {
      return ActionPriority.CRITICAL;
    }
    if (score >= this.config.highThreshold) {
      return ActionPriority.HIGH;
    }
    if (score >= this.config.mediumThreshold) {
      return ActionPriority.MEDIUM;
    }
    if (score >= 0.3) {
      return ActionPriority.LOW;
    }
    return ActionPriority.OPTIONAL;
  }

  /**
   * Generate human-readable reason for priority
   */
  private generatePriorityReason(action: PrioritizedAction): string {
    const reasons: string[] = [];
    const score = action.priorityScore;

    if (score.impact > 0.7) {
      reasons.push('high impact');
    }
    if (score.urgency > 0.7) {
      reasons.push('urgent');
    }
    if (score.expectedReturn > 0.7) {
      reasons.push('high return');
    }
    if (score.strategicImportance > 0.7) {
      reasons.push('strategically important');
    }
    if (score.difficulty < 0.3) {
      reasons.push('easy to complete');
    }
    if (score.constraintAlignment > 0.8) {
      reasons.push('fits constraints well');
    }

    if (reasons.length === 0) {
      return 'Standard priority based on overall assessment';
    }

    return `Prioritized due to: ${reasons.join(', ')}`;
  }

  /**
   * Reorder actions to respect dependencies
   */
  private reorderForDependencies(actions: PrioritizedAction[]): void {
    // Build dependency graph
    const dependencyMap = new Map<string, string[]>();
    const actionMap = new Map<string, PrioritizedAction>();

    actions.forEach(action => {
      dependencyMap.set(action.id, action.prerequisites);
      actionMap.set(action.id, action);
    });

    // Topological sort with priority preservation
    const visited = new Set<string>();
    const result: PrioritizedAction[] = [];

    const visit = (action: PrioritizedAction) => {
      if (visited.has(action.id)) return;
      visited.add(action.id);

      // Visit prerequisites first
      const prereqs = dependencyMap.get(action.id) || [];
      for (const prereqId of prereqs) {
        const prereq = actionMap.get(prereqId);
        if (prereq) {
          visit(prereq);
        }
      }

      result.push(action);
    };

    // Sort by priority first, then visit
    const sortedByPriority = [...actions].sort((a, b) => {
      return getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
    });

    sortedByPriority.forEach(action => visit(action));

    // Update suggested order based on dependency-respecting sequence
    result.forEach((action, index) => {
      const originalAction = actions.find(a => a.id === action.id);
      if (originalAction) {
        originalAction.suggestedOrder = index + 1;
        originalAction.dependenciesOn = originalAction.prerequisites.filter(
          id => actionMap.has(id)
        );
      }
    });
  }

  /**
   * Estimate timeline for completing actions
   */
  private estimateTimeline(
    actions: PrioritizedAction[]
  ): PriorityRoadmap['estimatedTimeline'] {
    const critical = actions.filter(a => a.priority === ActionPriority.CRITICAL);
    const high = actions.filter(a => a.priority === ActionPriority.HIGH);
    const medium = actions.filter(a => a.priority === ActionPriority.MEDIUM);

    const criticalHours = critical.reduce((sum, a) => sum + a.estimatedDuration, 0);
    const highHours = high.reduce((sum, a) => sum + a.estimatedDuration, 0);
    const mediumHours = medium.reduce((sum, a) => sum + a.estimatedDuration, 0);

    // Assume 10 hours/week available for career development
    const hoursPerWeek = 10;

    return {
      critical: this.formatWeeks(criticalHours / hoursPerWeek),
      high: this.formatWeeks((criticalHours + highHours) / hoursPerWeek),
      medium: this.formatWeeks((criticalHours + highHours + mediumHours) / hoursPerWeek),
      all: this.formatWeeks(
        actions.reduce((sum, a) => sum + a.estimatedDuration, 0) / hoursPerWeek
      ),
    };
  }

  /**
   * Format weeks into readable string
   */
  private formatWeeks(weeks: number): string {
    if (weeks < 1) {
      return 'Less than 1 week';
    }
    if (weeks < 4) {
      return `${Math.round(weeks)} weeks`;
    }
    const months = weeks / 4;
    if (months < 12) {
      return `${Math.round(months)} months`;
    }
    const years = months / 12;
    return `${Math.round(years * 10) / 10} years`;
  }

  /**
   * Check if a skill is critical for the target career
   */
  private isCriticalSkill(skill: string, input: ActionIntelligenceInput): boolean {
    // This would integrate with skill taxonomy
    const criticalSkills = [
      'Programming',
      'Data Analysis',
      'Communication',
      'Problem Solving',
      'Project Management',
    ];

    return criticalSkills.some(cs =>
      skill.toLowerCase().includes(cs.toLowerCase())
    );
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<PriorityEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): PriorityEngineConfig {
    return { ...this.config };
  }
}

/**
 * Factory function to create PriorityEngine
 */
export function createPriorityEngine(
  config?: Partial<PriorityEngineConfig>
): PriorityEngine {
  return new PriorityEngine(config);
}
