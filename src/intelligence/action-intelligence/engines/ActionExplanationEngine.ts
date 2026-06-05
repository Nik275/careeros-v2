/**
 * Action Intelligence - Action Explanation Engine
 *
 * Generates natural language explanations for actions:
 * - Why each action matters
 * - How it fits the student's context
 * - Expected outcomes and ROI
 * - Alternative approaches
 * - Personalized reasoning
 *
 * @module intelligence/action-intelligence
 */

import type {
  EntityId,
} from '../../types';

import type {
  Action,
  PrioritizedAction,
  ActionExplanation,
  ActionImpact,
  ActionIntelligenceInput,
  ActionOutput,
} from '../types';

/**
 * Action Explanation Engine Configuration
 */
export interface ExplanationEngineConfig {
  /** Detail level for explanations */
  detailLevel: 'brief' | 'standard' | 'detailed';

  /** Include personalization */
  includePersonalization: boolean;

  /** Include alternative suggestions */
  includeAlternatives: boolean;

  /** Include ROI calculations */
  includeROI: boolean;

  /** Tone of explanations */
  tone: 'professional' | 'encouraging' | 'direct';

  /** Maximum length of explanation */
  maxLength: number;
}

/**
 * Default configuration
 */
export const DEFAULT_EXPLANATION_CONFIG: ExplanationEngineConfig = {
  detailLevel: 'standard',
  includePersonalization: true,
  includeAlternatives: true,
  includeROI: true,
  tone: 'encouraging',
  maxLength: 500,
};

/**
 * Action Explanation Engine
 *
 * Creates personalized explanations for recommended actions.
 */
export class ActionExplanationEngine {
  private config: ExplanationEngineConfig;

  constructor(config: Partial<ExplanationEngineConfig> = {}) {
    this.config = { ...DEFAULT_EXPLANATION_CONFIG, ...config };
  }

  /**
   * Generate explanation for an action
   */
  explain(
    action: PrioritizedAction,
    input: ActionIntelligenceInput,
    allActions: PrioritizedAction[]
  ): ActionExplanation {
    return {
      actionId: action.id,
      whyThisMatters: this.explainWhy(action, input),
      howItFits: this.explainHowItFits(action, input, allActions),
      expectedOutcome: this.explainExpectedOutcome(action),
      roi: this.config.includeROI ? this.calculateROI(action) : undefined,
      ifNotDone: this.explainConsequences(action, input),
      personalContext: this.config.includePersonalization
        ? this.addPersonalContext(action, input)
        : undefined,
      alternativeApproaches: this.config.includeAlternatives
        ? this.suggestAlternatives(action)
        : undefined,
    };
  }

  /**
   * Generate summary for action plan
   */
  summarize(
    output: ActionOutput,
    input: ActionIntelligenceInput
  ): string {
    const parts: string[] = [];

    // Opening
    parts.push(this.generateOpening(input));

    // Key insights
    parts.push(this.generateKeyInsights(output, input));

    // Immediate priorities
    parts.push(this.generateImmediatePriorities(output));

    // Path forward
    parts.push(this.generatePathForward(output));

    // Closing motivation
    parts.push(this.generateClosing());

    return parts.join('\n\n');
  }

  /**
   * Explain why an action matters
   */
  private explainWhy(
    action: PrioritizedAction,
    input: ActionIntelligenceInput
  ): string {
    const reasons: string[] = [];

    // Strategic contribution
    if (action.strategicContribution) {
      reasons.push(`This action ${action.strategicContribution.toLowerCase()}.`);
    }

    // Skills developed
    if (action.skillsDeveloped.length > 0) {
      reasons.push(`You'll develop ${action.skillsDeveloped.slice(0, 3).join(', ')}.`);
    }

    // Priority reason
    if (action.reasonForPriority) {
      reasons.push(action.reasonForPriority);
    }

    // Target alignment
    const target = input.targetCareer || 'your career goals';
    reasons.push(`This directly advances your path toward ${target}.`);

    return reasons.join(' ');
  }

  /**
   * Explain how action fits into overall plan
   */
  private explainHowItFits(
    action: PrioritizedAction,
    input: ActionIntelligenceInput,
    allActions: PrioritizedAction[]
  ): string {
    const parts: string[] = [];

    // Position in sequence
    const rank = action.rank || 0;
    const total = allActions.length;

    if (rank <= 3) {
      parts.push(`This is a top priority action (ranked #${rank} of ${total}).`);
    } else if (rank <= total * 0.25) {
      parts.push(`This is among the first 25% of actions you should complete.`);
    } else {
      parts.push(`This is action #${rank} of ${total} in your plan.`);
    }

    // Prerequisites
    if (action.prerequisites.length > 0) {
      const prereqCount = action.prerequisites.length;
      parts.push(`Complete ${prereqCount} prerequisite(s) first.`);
    }

    // Dependencies
    if (action.dependenciesOn && action.dependenciesOn.length > 0) {
      parts.push(`This builds on ${action.dependenciesOn.length} previous action(s).`);
    }

    // Time horizon context
    const horizonMap: Record<string, string> = {
      'NEXT_7_DAYS': 'immediate focus',
      'NEXT_30_DAYS': 'this month\'s priority',
      'NEXT_90_DAYS': 'quarterly goal',
      'NEXT_1_YEAR': 'annual milestone',
      'NEXT_3_YEARS': 'long-term objective',
    };

    parts.push(`It's part of your ${horizonMap[action.timeHorizon] || 'plan'}.`);

    return parts.join(' ');
  }

  /**
   * Explain expected outcome
   */
  private explainExpectedOutcome(action: PrioritizedAction): string {
    const outcomes: string[] = [];

    if (action.expectedOutcome) {
      outcomes.push(action.expectedOutcome);
    }

    // Success criteria
    if (action.successCriteria && action.successCriteria.length > 0) {
      outcomes.push(`Success means: ${action.successCriteria.join(', ')}.`);
    }

    // Confidence
    if (action.confidence > 0.8) {
      outcomes.push(`High confidence (${Math.round(action.confidence * 100)}%) this will work.`);
    }

    return outcomes.join(' ') || 'Successful completion of this action.';
  }

  /**
   * Calculate ROI for action
   */
  private calculateROI(action: PrioritizedAction): ActionImpact {
    const score = action.priorityScore;

    return {
      shortTerm: {
        description: this.getShortTermImpact(action),
        timeframe: this.getShortTermTimeframe(action),
        value: this.calculateShortTermValue(action),
      },
      mediumTerm: {
        description: this.getMediumTermImpact(action),
        timeframe: this.getMediumTermTimeframe(action),
        value: this.calculateMediumTermValue(action),
      },
      longTerm: {
        description: this.getLongTermImpact(action),
        timeframe: this.getLongTermTimeframe(action),
        value: this.calculateLongTermValue(action),
      },
      careerTrajectory: this.getTrajectoryImpact(action),
      confidence: action.confidence,
      supportingEvidence: this.getSupportingEvidence(action),
    };
  }

  /**
   * Get short-term impact description
   */
  private getShortTermImpact(action: PrioritizedAction): string {
    const impacts: Record<string, string> = {
      'LEARN': 'New knowledge and understanding',
      'PRACTICE': 'Improved skills and confidence',
      'NETWORK': 'New connections and insights',
      'RESEARCH': 'Better information for decisions',
      'APPLY': 'Progress toward opportunity',
      'DECIDE': 'Clarity on next steps',
      'EXECUTE': 'Task completion and momentum',
      'REFLECT': 'Self-awareness and learning',
      'COLLABORATE': 'Teamwork experience and results',
    };

    return impacts[action.type] || 'Progress on your plan';
  }

  /**
   * Get medium-term impact description
   */
  private getMediumTermImpact(action: PrioritizedAction): string {
    if (action.skillsDeveloped.length > 0) {
      return `Demonstrable ${action.skillsDeveloped.slice(0, 2).join(' and ')} skills`;
    }

    if (action.type === 'APPLY') {
      return 'Potential job offers or opportunities';
    }

    return 'Strengthened position for next steps';
  }

  /**
   * Get long-term impact description
   */
  private getLongTermImpact(action: PrioritizedAction): string {
    if (action.strategicContribution.includes('Foundation')) {
      return 'Strong foundation for career growth';
    }

    if (action.strategicContribution.includes('career')) {
      return 'Direct advancement toward career goals';
    }

    return 'Cumulative benefit to your career trajectory';
  }

  /**
   * Get timeframe strings
   */
  private getShortTermTimeframe(action: PrioritizedAction): string {
    return action.timeHorizon === 'NEXT_7_DAYS' ? 'Within 1 week' : 'Within 1 month';
  }

  private getMediumTermTimeframe(action: PrioritizedAction): string {
    return '3-6 months';
  }

  private getLongTermTimeframe(action: PrioritizedAction): string {
    return '1-3 years';
  }

  /**
   * Calculate value scores (0-1)
   */
  private calculateShortTermValue(action: PrioritizedAction): number {
    return (action.priorityScore?.impact || 0.5) * 0.8;
  }

  private calculateMediumTermValue(action: PrioritizedAction): number {
    return (action.priorityScore?.expectedReturn || 0.5) * 0.9;
  }

  private calculateLongTermValue(action: PrioritizedAction): number {
    return (action.priorityScore?.strategicImportance || 0.5) * 0.85;
  }

  /**
   * Get trajectory impact
   */
  private getTrajectoryImpact(action: PrioritizedAction): string {
    const score = action.priorityScore?.strategicImportance || 0.5;

    if (score > 0.8) {
      return 'Significantly accelerates career trajectory';
    } else if (score > 0.6) {
      return 'Meaningfully advances career goals';
    } else if (score > 0.4) {
      return 'Supports steady career progress';
    }
    return 'Maintains forward momentum';
  }

  /**
   * Get supporting evidence
   */
  private getSupportingEvidence(action: PrioritizedAction): string[] {
    const evidence: string[] = [];

    if (action.priorityScore) {
      const ps = action.priorityScore;
      evidence.push(`Impact score: ${Math.round(ps.impact * 100)}%`);
      evidence.push(`Expected return: ${Math.round(ps.expectedReturn * 100)}%`);
    }

    if (action.confidence) {
      evidence.push(`Confidence: ${Math.round(action.confidence * 100)}%`);
    }

    return evidence;
  }

  /**
   * Explain consequences of not doing action
   */
  private explainConsequences(
    action: PrioritizedAction,
    input: ActionIntelligenceInput
  ): string {
    const consequences: string[] = [];

    if (action.priority === 'CRITICAL') {
      consequences.push('Skipping this may significantly delay your progress.');
    } else if (action.priority === 'HIGH') {
      consequences.push('Missing this will slow your momentum.');
    }

    // Dependency consequences
    if (action.prerequisites.length > 0) {
      consequences.push('Other actions depend on completing this first.');
    }

    // Time-sensitive
    if (action.deadline) {
      const daysLeft = Math.ceil((action.deadline - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysLeft < 30) {
        consequences.push(`This is time-sensitive (${daysLeft} days remaining).`);
      }
    }

    if (consequences.length === 0) {
      return 'You can defer this without major impact, but progress may slow.';
    }

    return consequences.join(' ');
  }

  /**
   * Add personal context
   */
  private addPersonalContext(
    action: PrioritizedAction,
    input: ActionIntelligenceInput
  ): string {
    const context: string[] = [];

    // Academic background
    if ('academic' in input.studentBelief) {
      const academic = (input.studentBelief as any).academic;
      if (academic?.program) {
        context.push(`As a ${academic.program} student,`);
      }
    }

    // Current context
    if (input.currentContext) {
      const ctx = input.currentContext;
      if (ctx.currentRole) {
        context.push(`in your current role as ${ctx.currentRole},`);
      }
    }

    // Target alignment
    if (input.targetCareer) {
      context.push(`this builds directly toward your goal of becoming a ${input.targetCareer}.`);
    }

    return context.join(' ');
  }

  /**
   * Suggest alternative approaches
   */
  private suggestAlternatives(action: PrioritizedAction): string[] {
    const alternatives: string[] = [];

    // Type-based alternatives
    switch (action.type) {
      case 'LEARN':
        alternatives.push('Self-study using free online resources');
        alternatives.push('Join a study group or cohort-based course');
        alternatives.push('Find a mentor to guide your learning');
        break;
      case 'NETWORK':
        alternatives.push('Online networking via LinkedIn');
        alternatives.push('Attend local meetups');
        alternatives.push('Join relevant online communities');
        break;
      case 'PRACTICE':
        alternatives.push('Build a personal project');
        alternatives.push('Contribute to open source');
        alternatives.push('Participate in hackathons');
        break;
      case 'APPLY':
        alternatives.push('Apply to similar roles at different companies');
        alternatives.push('Seek referrals from your network');
        alternatives.push('Start with internships or contract work');
        break;
      default:
        alternatives.push('Break this into smaller steps');
        alternatives.push('Seek guidance from someone who has done this');
        alternatives.push('Adjust timeline based on your availability');
    }

    return alternatives;
  }

  /**
   * Generate opening summary
   */
  private generateOpening(input: ActionIntelligenceInput): string {
    const name = (input.studentBelief as any).personal?.name || 'there';
    const target = input.targetCareer || 'your career goals';

    return `Hi ${name},\n\nBased on your goal of becoming a ${target}, I've created a personalized action plan with ${this.config.tone === 'encouraging' ? 'clear steps to help you succeed' : 'specific next steps'}.`;
  }

  /**
   * Generate key insights
   */
  private generateKeyInsights(
    output: ActionOutput,
    input: ActionIntelligenceInput
  ): string {
    const insights: string[] = [];

    // Plan overview
    const totalActions = output.allActions.length;
    const criticalActions = output.allActions.filter(a => a.priority === 'CRITICAL').length;

    insights.push(`**Your Plan Overview**`);
    insights.push(`- ${totalActions} total actions across ${output.milestones.length} milestones`);
    insights.push(`- ${criticalActions} critical actions requiring immediate attention`);

    // Skills to develop
    const uniqueSkills = new Set(output.allActions.flatMap(a => a.skillsDeveloped));
    insights.push(`- ${uniqueSkills.size} skills you'll develop`);

    // Timeline
    insights.push(`- Estimated completion: ${output.estimatedCompletionTime}`);

    // Top priority
    if (output.topActions.length > 0) {
      insights.push(`\n**Your Top Priority:**`);
      insights.push(`${output.topActions[0].title}`);
    }

    return insights.join('\n');
  }

  /**
   * Generate immediate priorities
   */
  private generateImmediatePriorities(output: ActionOutput): string {
    const parts: string[] = [];
    parts.push(`**What to Do This Week:**`);

    output.weeklyPlan?.weeklyPlans?.slice(0, 1).forEach(week => {
      week.actions.slice(0, 3).forEach((action, i) => {
        parts.push(`${i + 1}. **${action.title}** (${action.estimatedDuration} hours)`);
        parts.push(`   ${action.description.slice(0, 100)}...`);
      });
    });

    return parts.join('\n');
  }

  /**
   * Generate path forward
   */
  private generatePathForward(output: ActionOutput): string {
    const parts: string[] = [];
    parts.push(`**Your Path Forward:**`);

    output.milestones.slice(0, 3).forEach((milestone, i) => {
      parts.push(`\n**Milestone ${i + 1}: ${milestone.name}**`);
      parts.push(`${milestone.description}`);
      parts.push(`Success: ${milestone.successCriteria.join(', ')}`);
    });

    return parts.join('\n');
  }

  /**
   * Generate closing motivation
   */
  private generateClosing(): string {
    const closings = [
      "Remember: Every action you take brings you closer to your goal. Start with the first item and build momentum!",
      "You've got this! The plan is clear - now it's time to execute. Start today with your first action.",
      "Small consistent actions lead to big results. Let's get started!",
    ];

    return closings[Math.floor(Math.random() * closings.length)];
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ExplanationEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): ExplanationEngineConfig {
    return { ...this.config };
  }
}

/**
 * Factory function to create ActionExplanationEngine
 */
export function createExplanationEngine(
  config?: Partial<ExplanationEngineConfig>
): ActionExplanationEngine {
  return new ActionExplanationEngine(config);
}
