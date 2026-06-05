/**
 * Career Path Intelligence - Failure Recovery Engine
 *
 * Models what happens when milestones fail and generates recovery paths.
 *
 * Recovery Strategies:
 * - RETRY: Attempt the same milestone again
 * - PIVOT: Switch to a different path
 * - BRANCH: Take a side path and return
 * - BYPASS: Skip this milestone if possible
 * - ABANDON: Give up on this path
 * - PARALLEL: Work on alternatives simultaneously
 *
 * Examples:
 * - Failed JEE → State Engineering College / Private College / Diploma Route
 * - Failed Startup → Join Company / Pivot Idea / Get Job First
 * - Failed Exam → Retry / Alternative Exam / Different Career
 *
 * @module intelligence/career-path-intelligence
 */

import {
  CareerPath,
  Milestone,
  RecoveryPlan,
  RecoveryOption,
  RecoveryStrategy,
  MilestoneStatus,
  PathType,
  PathDifficulty,
  PathRisk,
  CareerPathIntelligenceInput,
} from '../types';

/**
 * Failure Recovery Engine Configuration
 */
export interface FailureRecoveryEngineConfig {
  /** Maximum recovery depth (how many failures to plan for) */
  maxRecoveryDepth: number;
  /** Generate retry options */
  allowRetry: boolean;
  /** Generate pivot options */
  allowPivot: boolean;
  /** Cost threshold for recovery options */
  maxRecoveryCostMultiplier: number;
}

/**
 * Default configuration
 */
export const DEFAULT_FAILURE_RECOVERY_CONFIG: FailureRecoveryEngineConfig = {
  maxRecoveryDepth: 2,
  allowRetry: true,
  allowPivot: true,
  maxRecoveryCostMultiplier: 1.5,
};

/**
 * Milestone failure context
 */
interface FailureContext {
  milestone: Milestone;
  path: CareerPath;
  input: CareerPathIntelligenceInput;
  failureReason: string;
  studentProfile: CareerPathIntelligenceInput['studentProfile'];
}

/**
 * Failure Recovery Engine
 */
export class FailureRecoveryEngine {
  private config: FailureRecoveryEngineConfig;

  constructor(config: Partial<FailureRecoveryEngineConfig> = {}) {
    this.config = { ...DEFAULT_FAILURE_RECOVERY_CONFIG, ...config };
  }

  /**
   * Generate recovery plan for a failed milestone
   */
  generateRecoveryPlan(
    milestone: Milestone,
    path: CareerPath,
    input: CareerPathIntelligenceInput,
    failureReason?: string
  ): RecoveryPlan {
    const context: FailureContext = {
      milestone,
      path,
      input,
      failureReason: failureReason || this.inferFailureReason(milestone),
      studentProfile: input.studentProfile,
    };

    const recoveryOptions = this.generateRecoveryOptions(context);

    // Sort by viability
    const sortedOptions = recoveryOptions.sort((a, b) => {
      const aScore = a.successProbability / (a.cost + a.time);
      const bScore = b.successProbability / (b.cost + b.time);
      return bScore - aScore;
    });

    const recommendedOption = sortedOptions[0];

    return {
      failedMilestoneId: milestone.id,
      failedMilestoneName: milestone.name,
      failureReason: context.failureReason,
      recoveryOptions: sortedOptions,
      recommendedOption,
      impactOnPath: {
        additionalCost: recommendedOption ? recommendedOption.cost : 0,
        additionalTime: recommendedOption ? recommendedOption.time : 0,
        confidenceImpact: this.calculateConfidenceImpact(milestone, path),
      },
    };
  }

  /**
   * Generate recovery plans for all high-risk milestones in a path
   */
  generateAllRecoveryPlans(
    path: CareerPath,
    input: CareerPathIntelligenceInput
  ): Record<string, RecoveryPlan> {
    const plans: Record<string, RecoveryPlan> = {};

    // Identify high-risk milestones
    const highRiskMilestones = path.milestones.filter(
      m => m.failureProbability > 0.3 || m.recoveryPaths.length > 0
    );

    for (const milestone of highRiskMilestones) {
      plans[milestone.id] = this.generateRecoveryPlan(milestone, path, input);
    }

    return plans;
  }

  /**
   * Generate recovery options for a failure context
   */
  private generateRecoveryOptions(context: FailureContext): RecoveryOption[] {
    const options: RecoveryOption[] = [];

    // RETRY: Try again
    if (this.config.allowRetry && this.canRetry(context)) {
      options.push(this.createRetryOption(context));
    }

    // PIVOT: Switch to alternative path
    if (this.config.allowPivot) {
      options.push(...this.createPivotOptions(context));
    }

    // BRANCH: Side path
    options.push(...this.createBranchOptions(context));

    // BYPASS: Skip if possible
    if (this.canBypass(context)) {
      options.push(this.createBypassOption(context));
    }

    // PARALLEL: Work on alternatives
    options.push(this.createParallelOption(context));

    return options.filter(o => this.isViableOption(o, context));
  }

  /**
   * Check if milestone can be retried
   */
  private canRetry(context: FailureContext): boolean {
    const { milestone, studentProfile } = context;

    // Exams can typically be retried
    if (milestone.name.toLowerCase().includes('jee')) return true;
    if (milestone.name.toLowerCase().includes('neet')) return true;
    if (milestone.name.toLowerCase().includes('upsc')) return true;
    if (milestone.name.toLowerCase().includes('exam')) return true;

    // Check resource constraints
    const retryCost = this.estimateRetryCost(milestone);
    if (retryCost > studentProfile.financialConstraints.maxInvestment * 0.3) {
      return false;
    }

    return true;
  }

  /**
   * Create retry option
   */
  private createRetryOption(context: FailureContext): RecoveryOption {
    const { milestone } = context;
    const cost = this.estimateRetryCost(milestone);
    const time = milestone.expectedDuration;

    return {
      id: `retry_${milestone.id}`,
      name: `Retry ${milestone.name}`,
      strategy: RecoveryStrategy.RETRY,
      description: `Attempt ${milestone.name} again with improved preparation`,
      steps: [
        'Analyze why the previous attempt failed',
        'Identify weak areas and create improvement plan',
        'Gather better resources or coaching if needed',
        'Retake with better preparation',
      ],
      cost,
      time,
      successProbability: Math.min(0.9, milestone.failureProbability * 1.5),
      longTermImpact: 'Slight delay but maintains original path trajectory',
    };
  }

  /**
   * Create pivot options to alternative paths
   */
  private createPivotOptions(context: FailureContext): RecoveryOption[] {
    const options: RecoveryOption[] = [];
    const { milestone, path, studentProfile } = context;

    // JEE failure pivots
    if (milestone.name.toLowerCase().includes('jee')) {
      options.push({
        id: `pivot_state_eng_${milestone.id}`,
        name: 'Pivot to State Engineering College',
        strategy: RecoveryStrategy.PIVOT,
        description: 'Accept admission to state engineering college based on state entrance',
        steps: [
          'Register for state counseling',
          'Research state college options',
          'Choose branch based on interest and placement',
          'Complete admission process',
        ],
        cost: 500000,
        time: 48,
        successProbability: 0.85,
        longTermImpact: 'Still leads to engineering career with slightly lower initial salary',
      });

      options.push({
        id: `pivot_private_eng_${milestone.id}`,
        name: 'Pivot to Private Engineering College',
        strategy: RecoveryStrategy.PIVOT,
        description: 'Join private engineering college with direct admission',
        steps: [
          'Research private colleges with good placements',
          'Check management quota availability',
          'Arrange for funding if needed',
          'Complete admission',
        ],
        cost: 1500000,
        time: 48,
        successProbability: 0.9,
        longTermImpact: 'Higher cost but maintains engineering path',
      });

      options.push({
        id: `pivot_diploma_${milestone.id}`,
        name: 'Diploma to Degree Route',
        strategy: RecoveryStrategy.PIVOT,
        description: 'Complete diploma first, then lateral entry to engineering',
        steps: [
          'Join polytechnic for 3-year diploma',
          'Focus on practical skills',
          'Apply for lateral entry to B.Tech',
          'Complete engineering degree in 3 years instead of 4',
        ],
        cost: 400000,
        time: 72,
        successProbability: 0.8,
        longTermImpact: 'Longer timeline but strong practical foundation',
      });
    }

    // Startup failure pivots
    if (milestone.name.toLowerCase().includes('startup') ||
        milestone.name.toLowerCase().includes('venture')) {
      options.push({
        id: `pivot_job_${milestone.id}`,
        name: 'Join Company First',
        strategy: RecoveryStrategy.PIVOT,
        description: 'Get industry experience before attempting again',
        steps: [
          'Update resume with startup experience',
          'Apply for relevant roles',
          'Build network and savings',
          'Retry startup after 2-3 years with better resources',
        ],
        cost: 50000,
        time: 36,
        successProbability: 0.9,
        longTermImpact: 'Delayed entrepreneurship but better preparation',
      });

      options.push({
        id: `pivot_pivot_idea_${milestone.id}`,
        name: 'Pivot Business Idea',
        strategy: RecoveryStrategy.PIVOT,
        description: 'Modify business model based on lessons learned',
        steps: [
          'Analyze why previous attempt failed',
          'Identify market gaps or pivots',
          'Develop new MVP',
          'Test with smaller investment',
        ],
        cost: 100000,
        time: 12,
        successProbability: 0.6,
        longTermImpact: 'Maintains entrepreneurial path with adjusted strategy',
      });
    }

    // Generic exam failure pivot
    if (milestone.name.toLowerCase().includes('exam')) {
      options.push({
        id: `pivot_alternative_career_${milestone.id}`,
        name: 'Alternative Career Path',
        strategy: RecoveryStrategy.PIVOT,
        description: 'Pursue different career leveraging existing skills',
        steps: [
          'Assess transferable skills from preparation',
          'Research alternative careers',
          'Upskill in relevant areas',
          'Enter new career track',
        ],
        cost: 200000,
        time: 12,
        successProbability: 0.75,
        longTermImpact: 'Career pivot with skills transfer',
      });
    }

    return options;
  }

  /**
   * Create branch options
   */
  private createBranchOptions(context: FailureContext): RecoveryOption[] {
    const options: RecoveryOption[] = [];
    const { milestone } = context;

    // Take a side course/certification
    options.push({
      id: `branch_cert_${milestone.id}`,
      name: 'Skill Certification Route',
      strategy: RecoveryStrategy.BRANCH,
      description: 'Gain certifications while preparing for retry',
      steps: [
        'Identify relevant industry certifications',
        'Complete certification courses',
        'Build portfolio projects',
        'Apply for entry-level roles with certifications',
      ],
      cost: 50000,
      time: 6,
      successProbability: 0.7,
      longTermImpact: 'Parallel skill building enhances future options',
    });

    return options;
  }

  /**
   * Check if milestone can be bypassed
   */
  private canBypass(context: FailureContext): boolean {
    const { milestone, path } = context;

    // Some milestones are optional
    if (milestone.name.toLowerCase().includes('optional')) return true;
    if (milestone.name.toLowerCase().includes('certification') &&
        !milestone.prerequisites.some(p => p.required)) return true;

    // Check if alternative satisfies the requirement
    const hasAlternative = path.milestones.some(m =>
      m.order > milestone.order &&
      m.prerequisites.some(p => p.alternativeSatisfiers && p.alternativeSatisfiers.length > 0)
    );

    return hasAlternative;
  }

  /**
   * Create bypass option
   */
  private createBypassOption(context: FailureContext): RecoveryOption {
    const { milestone } = context;

    return {
      id: `bypass_${milestone.id}`,
      name: `Skip ${milestone.name}`,
      strategy: RecoveryStrategy.BYPASS,
      description: `Proceed without completing ${milestone.name} using alternative qualifications`,
      steps: [
        'Identify alternative credentials that satisfy requirement',
        'Acquire alternative qualification',
        'Update path to reflect bypass',
        'Continue to next milestone',
      ],
      cost: 30000,
      time: 3,
      successProbability: 0.6,
      longTermImpact: 'Faster progress but may have knowledge gaps',
    };
  }

  /**
   * Create parallel option
   */
  private createParallelOption(context: FailureContext): RecoveryOption {
    const { milestone, path } = context;

    return {
      id: `parallel_${milestone.id}`,
      name: 'Parallel Track Approach',
      strategy: RecoveryStrategy.PARALLEL,
      description: 'Work on multiple options simultaneously',
      steps: [
        'Continue preparing for retry',
        'Simultaneously explore alternative paths',
        'Apply to backup options',
        'Choose best available outcome',
      ],
      cost: this.estimateRetryCost(milestone) * 1.2,
      time: milestone.expectedDuration,
      successProbability: 0.8,
      longTermImpact: 'Higher resource usage but maximizes success probability',
    };
  }

  /**
   * Infer failure reason
   */
  private inferFailureReason(milestone: Milestone): string {
    if (milestone.name.toLowerCase().includes('jee')) {
      return 'Did not qualify for desired rank in JEE';
    }
    if (milestone.name.toLowerCase().includes('neet')) {
      return 'Did not qualify for medical college admission';
    }
    if (milestone.name.toLowerCase().includes('upsc')) {
      return 'Did not clear UPSC examination';
    }
    if (milestone.name.toLowerCase().includes('startup')) {
      return 'Business did not achieve viability';
    }
    if (milestone.name.toLowerCase().includes('exam')) {
      return 'Did not pass required examination';
    }

    return 'Milestone requirements not met';
  }

  /**
   * Estimate cost to retry a milestone
   */
  private estimateRetryCost(milestone: Milestone): number {
    let baseCost = 50000;

    if (milestone.name.toLowerCase().includes('jee')) baseCost = 150000;
    if (milestone.name.toLowerCase().includes('neet')) baseCost = 150000;
    if (milestone.name.toLowerCase().includes('upsc')) baseCost = 200000;
    if (milestone.name.toLowerCase().includes('startup')) baseCost = 100000;
    if (milestone.name.toLowerCase().includes('college')) baseCost = 500000;

    return baseCost;
  }

  /**
   * Check if recovery option is viable
   */
  private isViableOption(
    option: RecoveryOption,
    context: FailureContext
  ): boolean {
    const { studentProfile } = context;

    // Check cost viability
    const maxCost = studentProfile.financialConstraints.maxInvestment *
                    this.config.maxRecoveryCostMultiplier;
    if (option.cost > maxCost) return false;

    // Check time viability
    const maxTime = studentProfile.timeConstraints.maxDuration * 1.5;
    if (option.time > maxTime) return false;

    // Check probability viability
    if (option.successProbability < 0.3) return false;

    return true;
  }

  /**
   * Calculate confidence impact of failure
   */
  private calculateConfidenceImpact(
    milestone: Milestone,
    path: CareerPath
  ): number {
    // Critical milestones have higher impact
    const isCritical = milestone.order <= 2; // First two milestones are critical
    const baseImpact = isCritical ? 0.3 : 0.15;

    // Higher failure probability means expected impact
    return baseImpact * milestone.failureProbability;
  }

  /**
   * Get recovery path suggestions
   */
  getRecoverySuggestions(
    path: CareerPath,
    milestoneId: string,
    input: CareerPathIntelligenceInput
  ): string[] {
    const milestone = path.milestones.find(m => m.id === milestoneId);
    if (!milestone) return [];

    const plan = this.generateRecoveryPlan(milestone, path, input);
    
    return plan.recoveryOptions.map(o => 
      `${o.name}: ${o.description} (${o.successProbability * 100}% success, ${o.time} months)`
    );
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<FailureRecoveryEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Factory function
 */
export function createFailureRecoveryEngine(
  config?: Partial<FailureRecoveryEngineConfig>
): FailureRecoveryEngine {
  return new FailureRecoveryEngine(config);
}
