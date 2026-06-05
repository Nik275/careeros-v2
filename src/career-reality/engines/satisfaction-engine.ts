/**
 * CareerOS - Satisfaction Engine
 *
 * Models career satisfaction drivers, frustrations, rewards, and exit patterns.
 *
 * @module satisfaction-engine
 * @version 1.0.0
 */

import type {
  SatisfactionProfile,
  SatisfactionDriver,
  Frustration,
  Reward,
  ExitPattern,
  FulfillmentTrajectory,
  CareerId,
  CompanyStage,
  DailyLifeProfile,
  WorkEnvironmentProfile,
} from '../types/career-reality-types';

/** Input for satisfaction modeling */
export interface SatisfactionInput {
  careerId: CareerId;
  careerTitle: string;
  companyStage?: CompanyStage;
  dailyLife?: DailyLifeProfile;
  workEnvironment?: WorkEnvironmentProfile;
  industry?: string;
}

/** Career satisfaction template */
interface SatisfactionTemplate {
  baseSatisfaction: number;
  primaryDrivers: string[];
  commonFrustrations: string[];
  commonRewards: string[];
  typicalExitReasons: string[];
  trajectory: 'INCREASING' | 'STABLE' | 'DECLINING' | 'U_SHAPED' | 'INVERTED_U';
}

const CAREER_SATISFACTION_TEMPLATES: Record<string, SatisfactionTemplate> = {
  'software-engineer': {
    baseSatisfaction: 72,
    primaryDrivers: [
      'Problem-solving',
      'Building things',
      'Learning new technologies',
      'Remote work flexibility',
      'High compensation',
    ],
    commonFrustrations: [
      'Technical debt',
      'Unrealistic deadlines',
      'Legacy code maintenance',
      'Meeting overload',
      'Lack of recognition',
    ],
    commonRewards: [
      'Shipping features',
      'Solving complex problems',
      'Mentoring junior developers',
      'Learning new skills',
      'Competitive salary',
    ],
    typicalExitReasons: [
      'Seeking management track',
      'Burnout',
      'Better compensation elsewhere',
      'Desire for more impact',
      'Starting own company',
    ],
    trajectory: 'STABLE',
  },
  'product-manager': {
    baseSatisfaction: 68,
    primaryDrivers: [
      'Product impact',
      'Cross-functional leadership',
      'Customer problem-solving',
      'Strategic thinking',
      'Ship products',
    ],
    commonFrustrations: [
      'Stakeholder management overhead',
      'Lack of authority',
      'Feature factory pressure',
      'Conflicting priorities',
      'Limited resources',
    ],
    commonRewards: [
      'Successful product launches',
      'Customer love',
      'Team alignment',
      'Business impact',
      'Career growth',
    ],
    typicalExitReasons: [
      'Seeking more strategic role',
      'Founding own startup',
      'Moving to GM/VP role',
      'Burnout from politics',
      'Better compensation',
    ],
    trajectory: 'INVERTED_U',
  },
  'investment-banker': {
    baseSatisfaction: 55,
    primaryDrivers: [
      'High compensation',
      'Prestige',
      'Deal excitement',
      'Exit opportunities',
      'Intellectual challenge',
    ],
    commonFrustrations: [
      'Extreme hours',
      'Repetitive work',
      'Lack of creativity',
      'Client pressure',
      'Limited autonomy',
    ],
    commonRewards: [
      'Large bonuses',
      'Prestigious deals',
      'Career acceleration',
      'Network building',
      'Exit to PE/HF',
    ],
    typicalExitReasons: [
      'Burnout',
      'Moving to private equity',
      'Business school',
      'Corporate development',
      'Entrepreneurship',
    ],
    trajectory: 'DECLINING',
  },
  'doctor': {
    baseSatisfaction: 70,
    primaryDrivers: [
      'Helping patients',
      'Intellectual challenge',
      'Respect and prestige',
      'Job security',
      'Making a difference',
    ],
    commonFrustrations: [
      'Administrative burden',
      'Long training period',
      'Work-life imbalance',
      'Insurance hassles',
      'EMR systems',
    ],
    commonRewards: [
      'Patient gratitude',
      'Successful treatments',
      'Respect from community',
      'Stable income',
      'Intellectual fulfillment',
    ],
    typicalExitReasons: [
      'Burnout',
      'Administrative overload',
      'Desire for better lifestyle',
      'Changing specialty',
      'Early retirement',
    ],
    trajectory: 'U_SHAPED',
  },
  'consultant': {
    baseSatisfaction: 65,
    primaryDrivers: [
      'Variety of projects',
      'Learning opportunities',
      'Travel and exposure',
      'Network building',
      'Problem-solving',
    ],
    commonFrustrations: [
      'Constant travel',
      'Work-life imbalance',
      'Up-or-out pressure',
      'Client demands',
      'Lack of implementation',
    ],
    commonRewards: [
      'Solving client problems',
      'Rapid skill development',
      'Career acceleration',
      'Network expansion',
      'Exit opportunities',
    ],
    typicalExitReasons: [
      'Burnout from travel',
      'Seeking implementation role',
      'Industry position',
      'MBA or further education',
      'Entrepreneurship',
    ],
    trajectory: 'INVERTED_U',
  },
  'teacher': {
    baseSatisfaction: 62,
    primaryDrivers: [
      'Making a difference',
      'Student success',
      'Summer breaks',
      'Intellectual engagement',
      'Job security',
    ],
    commonFrustrations: [
      'Low compensation',
      'Administrative burden',
      'Limited resources',
      'Behavioral challenges',
      'Standardized testing pressure',
    ],
    commonRewards: [
      'Student breakthroughs',
      'Making a difference',
      'Community respect',
      'Job stability',
      'Intellectual engagement',
    ],
    typicalExitReasons: [
      'Low compensation',
      'Burnout',
      'Administrative burden',
      'Seeking different career',
      'Early retirement',
    ],
    trajectory: 'DECLINING',
  },
  'data-scientist': {
    baseSatisfaction: 74,
    primaryDrivers: [
      'Solving complex problems',
      'Intellectual challenge',
      'High compensation',
      'Remote work options',
      'Business impact',
    ],
    commonFrustrations: [
      'Dirty data',
      'Unclear business problems',
      'Model deployment issues',
      'Stakeholder communication',
      'Unrealistic expectations',
    ],
    commonRewards: [
      'Model success',
      'Business insights',
      'Learning new techniques',
      'Competitive salary',
      'Intellectual fulfillment',
    ],
    typicalExitReasons: [
      'Seeking management track',
      'Better compensation',
      'Moving to ML engineering',
      'Starting own company',
      'Burnout',
    ],
    trajectory: 'STABLE',
  },
  'designer': {
    baseSatisfaction: 71,
    primaryDrivers: [
      'Creative expression',
      'User impact',
      'Problem-solving',
      'Visual craft',
      'Collaboration',
    ],
    commonFrustrations: [
      'Subjective feedback',
      'Scope creep',
      'Stakeholder management',
      'Limited resources',
      'Design system maintenance',
    ],
    commonRewards: [
      'Successful launches',
      'User love',
      'Creative fulfillment',
      'Team collaboration',
      'Portfolio growth',
    ],
    typicalExitReasons: [
      'Seeking more strategic role',
      'Burnout',
      'Starting own studio',
      'Moving to product',
      'Better compensation',
    ],
    trajectory: 'INCREASING',
  },
  'default': {
    baseSatisfaction: 65,
    primaryDrivers: [
      'Compensation',
      'Work-life balance',
      'Growth opportunities',
      'Meaningful work',
      'Good colleagues',
    ],
    commonFrustrations: [
      'Workload pressure',
      'Limited growth',
      'Bureaucracy',
      'Compensation concerns',
      'Work-life balance',
    ],
    commonRewards: [
      'Achievement',
      'Recognition',
      'Learning',
      'Relationships',
      'Stability',
    ],
    typicalExitReasons: [
      'Better opportunity',
      'Career change',
      'Relocation',
      'Compensation',
      'Burnout',
    ],
    trajectory: 'STABLE',
  },
};

/**
 * Satisfaction Engine - Models career satisfaction patterns.
 */
export class SatisfactionEngine {
  /**
   * Generate a satisfaction profile for a career.
   */
  generateProfile(input: SatisfactionInput): SatisfactionProfile {
    const template = this.getTemplate(input.careerId, input.careerTitle);
    const adjustedSatisfaction = this.adjustSatisfactionForContext(template, input);

    return {
      overallSatisfaction: adjustedSatisfaction,
      drivers: this.generateDrivers(template, input),
      frustrations: this.generateFrustrations(template, input),
      rewards: this.generateRewards(template, input),
      exitPatterns: this.generateExitPatterns(template, input),
      fulfillmentTrajectory: this.generateTrajectory(template, input),
    };
  }

  /**
   * Get the satisfaction template for a career.
   */
  private getTemplate(careerId: CareerId, careerTitle: string): SatisfactionTemplate {
    for (const [key, template] of Object.entries(CAREER_SATISFACTION_TEMPLATES)) {
      if (careerId.toLowerCase().includes(key)) {
        return template;
      }
    }

    for (const [key, template] of Object.entries(CAREER_SATISFACTION_TEMPLATES)) {
      if (careerTitle.toLowerCase().includes(key.replace('-', ' '))) {
        return template;
      }
    }

    return CAREER_SATISFACTION_TEMPLATES.default;
  }

  /**
   * Adjust base satisfaction based on context.
   */
  private adjustSatisfactionForContext(
    template: SatisfactionTemplate,
    input: SatisfactionInput
  ): number {
    let satisfaction = template.baseSatisfaction;

    // Adjust for company stage
    const stageModifiers: Record<CompanyStage, number> = {
      STARTUP: -5, // More exciting but more stressful
      GROWTH: 2,
      MID_SIZED: 5,
      ENTERPRISE: 3,
      GOVERNMENT: -3, // Stable but bureaucratic
      FAMILY_BUSINESS: 0,
    };

    if (input.companyStage) {
      satisfaction += stageModifiers[input.companyStage];
    }

    // Adjust for work environment
    if (input.workEnvironment) {
      satisfaction += (input.workEnvironment.autonomy.overallScore - 50) * 0.1;
      satisfaction += (input.workEnvironment.flexibility.overallScore - 50) * 0.1;
      satisfaction -= (input.workEnvironment.bureaucracy.overallScore - 50) * 0.05;
    }

    // Adjust for daily life
    if (input.dailyLife) {
      // Work-life balance impact
      const workLifeScore =
        100 - (input.dailyLife.typicalWeek.typicalHoursPerWeek - 40) * 2;
      satisfaction += (workLifeScore - 50) * 0.1;

      // Deep work satisfaction
      satisfaction +=
        (input.dailyLife.activityDistribution.deepWorkPercentage - 25) * 0.1;
    }

    return Math.max(30, Math.min(95, satisfaction));
  }

  /**
   * Generate satisfaction drivers.
   */
  private generateDrivers(
    template: SatisfactionTemplate,
    input: SatisfactionInput
  ): SatisfactionDriver[] {
    const drivers: SatisfactionDriver[] = [];

    template.primaryDrivers.forEach((driver, index) => {
      const importance = 90 - index * 8;
      const satisfaction = this.calculateDriverSatisfaction(driver, input);

      drivers.push({
        name: driver,
        description: `Primary satisfaction driver: ${driver}`,
        importance,
        satisfaction,
        isDifferentiator: index < 3,
      });
    });

    // Add contextual drivers based on work environment
    if (input.workEnvironment) {
      if (input.workEnvironment.autonomy.overallScore > 70) {
        drivers.push({
          name: 'Autonomy',
          description: 'Freedom to make decisions and work independently',
          importance: 75,
          satisfaction: input.workEnvironment.autonomy.overallScore,
          isDifferentiator: true,
        });
      }

      if (input.workEnvironment.flexibility.overallScore > 70) {
        drivers.push({
          name: 'Flexibility',
          description: 'Ability to balance work and personal life',
          importance: 80,
          satisfaction: input.workEnvironment.flexibility.overallScore,
          isDifferentiator: true,
        });
      }
    }

    return drivers.sort((a, b) => b.importance - a.importance);
  }

  /**
   * Calculate satisfaction for a specific driver.
   */
  private calculateDriverSatisfaction(driver: string, input: SatisfactionInput): number {
    let baseSatisfaction = 70;

    // Adjust based on context
    if (input.workEnvironment) {
      if (driver.includes('autonomy') || driver.includes('independent')) {
        baseSatisfaction = input.workEnvironment.autonomy.overallScore;
      }
      if (driver.includes('compensation') || driver.includes('salary')) {
        baseSatisfaction = 75; // Assume competitive
      }
    }

    if (input.dailyLife) {
      if (driver.includes('learning') || driver.includes('growth')) {
        baseSatisfaction = Math.min(
          95,
          70 + input.dailyLife.typicalDay.learningHours * 10
        );
      }
    }

    return Math.max(40, Math.min(95, baseSatisfaction));
  }

  /**
   * Generate frustrations.
   */
  private generateFrustrations(
    template: SatisfactionTemplate,
    input: SatisfactionInput
  ): Frustration[] {
    const frustrations: Frustration[] = [];

    template.commonFrustrations.forEach((frustration, index) => {
      const frequency = 70 - index * 8;
      const impact = 60 + index * 5;

      frustrations.push({
        name: frustration,
        description: `Common frustration: ${frustration}`,
        frequency,
        impact,
        isDealbreaker: impact > 75 && frequency > 70,
        mitigationStrategies: this.generateMitigationStrategies(frustration),
      });
    });

    // Add contextual frustrations
    if (input.dailyLife) {
      if (input.dailyLife.typicalWeek.typicalHoursPerWeek > 50) {
        frustrations.push({
          name: 'Long Hours',
          description: `Average ${input.dailyLife.typicalWeek.typicalHoursPerWeek} hours per week`,
          frequency: 80,
          impact: 75,
          isDealbreaker: input.dailyLife.typicalWeek.typicalHoursPerWeek > 60,
          mitigationStrategies: ['Set boundaries', 'Negotiate flexibility', 'Prioritize ruthlessly'],
        });
      }

      if (input.dailyLife.activityDistribution.meetingsPercentage > 40) {
        frustrations.push({
          name: 'Meeting Overload',
          description: `${input.dailyLife.activityDistribution.meetingsPercentage}% of time in meetings`,
          frequency: 75,
          impact: 65,
          isDealbreaker: false,
          mitigationStrategies: ['Block focus time', 'Decline unnecessary meetings', 'Request agendas'],
        });
      }
    }

    return frustrations.sort((a, b) => b.impact * b.frequency - a.impact * a.frequency);
  }

  /**
   * Generate mitigation strategies for a frustration.
   */
  private generateMitigationStrategies(frustration: string): string[] {
    const strategies: Record<string, string[]> = {
      'Technical debt': ['Allocate 20% time for refactoring', 'Document decisions', 'Advocate for quality'],
      'Unrealistic deadlines': ['Push back early', 'Scope negotiation', 'Communicate trade-offs'],
      'Meeting overload': ['Block focus time', 'Decline unnecessary meetings', 'Request agendas'],
      'Stakeholder management': ['Set clear boundaries', 'Document decisions', 'Build relationships'],
      'Administrative burden': ['Automate where possible', 'Delegate', 'Batch administrative tasks'],
      'Long hours': ['Set boundaries', 'Negotiate flexibility', 'Prioritize ruthlessly'],
      'Low compensation': ['Negotiate raises', 'Build skills', 'Consider moves'],
      'Burnout': ['Take breaks', 'Set boundaries', 'Seek support'],
    };

    for (const [key, value] of Object.entries(strategies)) {
      if (frustration.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }

    return ['Communicate concerns', 'Seek support', 'Consider alternatives'];
  }

  /**
   * Generate rewards.
   */
  private generateRewards(template: SatisfactionTemplate, input: SatisfactionInput): Reward[] {
    const rewards: Reward[] = [];

    template.commonRewards.forEach((reward, index) => {
      const frequency = 80 - index * 8;
      const impact = 75 + index * 3;

      rewards.push({
        name: reward,
        description: `Common reward: ${reward}`,
        frequency,
        impact,
        isRetentionFactor: index < 3,
      });
    });

    // Add contextual rewards
    if (input.workEnvironment) {
      if (input.workEnvironment.ownership.overallScore > 70) {
        rewards.push({
          name: 'Ownership & Impact',
          description: 'Clear ownership and visible impact',
          frequency: 75,
          impact: 85,
          isRetentionFactor: true,
        });
      }
    }

    return rewards.sort((a, b) => b.impact * b.frequency - a.impact * a.frequency);
  }

  /**
   * Generate exit patterns.
   */
  private generateExitPatterns(
    template: SatisfactionTemplate,
    input: SatisfactionInput
  ): ExitPattern[] {
    const patterns: ExitPattern[] = [];

    template.typicalExitReasons.forEach((reason, index) => {
      const frequency = 60 - index * 8;
      const typicalStage = this.getTypicalExitStage(reason);

      patterns.push({
        reason,
        description: `Common exit reason: ${reason}`,
        frequency,
        typicalStage,
        destinations: this.getExitDestinations(reason, input.careerId),
      });
    });

    return patterns.sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Get typical career stage for an exit reason.
   */
  private getTypicalExitStage(reason: string): string {
    if (reason.includes('burnout') || reason.includes('lifestyle')) return '2-4 years';
    if (reason.includes('management') || reason.includes('strategic')) return '4-7 years';
    if (reason.includes('startup') || reason.includes('founding')) return '3-6 years';
    if (reason.includes('retirement')) return '15+ years';
    return '3-5 years';
  }

  /**
   * Get common exit destinations.
   */
  private getExitDestinations(reason: string, careerId: CareerId): string[] {
    if (reason.includes('management')) {
      return ['Engineering Manager', 'Product Manager', 'VP of Engineering'];
    }
    if (reason.includes('startup') || reason.includes('founding')) {
      return ['Founder', 'Co-founder', 'Early employee'];
    }
    if (reason.includes('burnout') || reason.includes('lifestyle')) {
      return ['Different company', 'Different industry', 'Sabbatical'];
    }
    if (reason.includes('compensation')) {
      return ['Big tech', 'Finance', 'Consulting'];
    }

    return ['Different role', 'Different company', 'Career change'];
  }

  /**
   * Generate fulfillment trajectory.
   */
  private generateTrajectory(
    template: SatisfactionTemplate,
    input: SatisfactionInput
  ): FulfillmentTrajectory {
    const baseScores = this.getTrajectoryScores(template.trajectory);

    // Adjust based on context
    let earlyCareer = baseScores.early;
    let midCareer = baseScores.mid;
    let lateCareer = baseScores.late;

    if (input.workEnvironment) {
      const envAdjustment = (input.workEnvironment.autonomy.overallScore - 50) * 0.2;
      earlyCareer += envAdjustment;
      midCareer += envAdjustment;
      lateCareer += envAdjustment;
    }

    return {
      earlyCareer: Math.max(30, Math.min(95, earlyCareer)),
      midCareer: Math.max(30, Math.min(95, midCareer)),
      lateCareer: Math.max(30, Math.min(95, lateCareer)),
      description: this.getTrajectoryDescription(template.trajectory),
      inflectionPoints: this.getInflectionPoints(template.trajectory, input),
    };
  }

  /**
   * Get trajectory scores based on pattern.
   */
  private getTrajectoryScores(
    trajectory: SatisfactionTemplate['trajectory']
  ): { early: number; mid: number; late: number } {
    const scores: Record<typeof trajectory, { early: number; mid: number; late: number }> = {
      INCREASING: { early: 60, mid: 70, late: 80 },
      STABLE: { early: 70, mid: 70, late: 70 },
      DECLINING: { early: 75, mid: 65, late: 55 },
      U_SHAPED: { early: 55, mid: 45, late: 70 },
      INVERTED_U: { early: 75, mid: 80, late: 65 },
    };

    return scores[trajectory];
  }

  /**
   * Get trajectory description.
   */
  private getTrajectoryDescription(trajectory: SatisfactionTemplate['trajectory']): string {
    const descriptions: Record<typeof trajectory, string> = {
      INCREASING: 'Satisfaction increases as expertise and autonomy grow',
      STABLE: 'Consistent satisfaction across career stages',
      DECLINING: 'Initial excitement fades; need for change increases',
      U_SHAPED: 'Difficult early years, improvement with seniority',
      INVERTED_U: 'Peak satisfaction in mid-career, then potential plateau',
    };

    return descriptions[trajectory];
  }

  /**
   * Get inflection points for trajectory.
   */
  private getInflectionPoints(
    trajectory: SatisfactionTemplate['trajectory'],
    input: SatisfactionInput
  ): FulfillmentTrajectory['inflectionPoints'] {
    const points: Record<typeof trajectory, FulfillmentTrajectory['inflectionPoints']> = {
      INCREASING: [
        { name: 'Skill Mastery', timing: 3, description: 'Core skills mastered', satisfactionImpact: 'INCREASE' },
        { name: 'Senior Role', timing: 7, description: 'Reached senior level', satisfactionImpact: 'INCREASE' },
      ],
      STABLE: [
        { name: 'Competence', timing: 2, description: 'Full competence achieved', satisfactionImpact: 'PLATEAU' },
      ],
      DECLINING: [
        { name: 'Reality Sets In', timing: 2, description: 'Novelty wears off', satisfactionImpact: 'DECREASE' },
        { name: 'Burnout Risk', timing: 4, description: 'Cumulative stress', satisfactionImpact: 'DECREASE' },
      ],
      U_SHAPED: [
        { name: 'Training Complete', timing: 3, description: 'Finished training period', satisfactionImpact: 'INCREASE' },
        { name: 'Autonomy Gained', timing: 7, description: 'Independent practice', satisfactionImpact: 'INCREASE' },
      ],
      INVERTED_U: [
        { name: 'Peak Performance', timing: 5, description: 'Optimal challenge-skill balance', satisfactionImpact: 'INCREASE' },
        { name: 'Plateau', timing: 10, description: 'Diminishing new challenges', satisfactionImpact: 'DECREASE' },
      ],
    };

    return points[trajectory];
  }

  /**
   * Compare satisfaction profiles between two careers.
   */
  compareProfiles(
    profileA: SatisfactionProfile,
    profileB: SatisfactionProfile
  ): {
    satisfactionDifference: number;
    driverComparison: Array<{ driver: string; scoreA: number; scoreB: number }>;
    recommendation: string;
  } {
    const satisfactionDifference = profileA.overallSatisfaction - profileB.overallSatisfaction;

    // Compare top drivers
    const driverComparison: Array<{ driver: string; scoreA: number; scoreB: number }> = [];
    const allDrivers = new Set([
      ...profileA.drivers.slice(0, 3).map((d) => d.name),
      ...profileB.drivers.slice(0, 3).map((d) => d.name),
    ]);

    for (const driver of Array.from(allDrivers)) {
      const driverA = profileA.drivers.find((d) => d.name === driver);
      const driverB = profileB.drivers.find((d) => d.name === driver);

      driverComparison.push({
        driver,
        scoreA: driverA?.satisfaction || 0,
        scoreB: driverB?.satisfaction || 0,
      });
    }

    let recommendation: string;
    if (satisfactionDifference > 10) {
      recommendation = `Career A offers significantly higher satisfaction potential`;
    } else if (satisfactionDifference < -10) {
      recommendation = `Career B offers significantly higher satisfaction potential`;
    } else {
      recommendation = `Both careers offer similar satisfaction potential - choose based on specific drivers`;
    }

    return { satisfactionDifference, driverComparison, recommendation };
  }

  /**
   * Get satisfaction prediction for a specific individual.
   */
  predictPersonalSatisfaction(
    baseProfile: SatisfactionProfile,
    personalFactors: {
      valuesAlignment: number;
      previousSatisfaction: number;
      adaptability: number;
      supportSystem: number;
    }
  ): number {
    let predictedSatisfaction = baseProfile.overallSatisfaction;

    // Adjust for values alignment
    predictedSatisfaction += (personalFactors.valuesAlignment - 50) * 0.3;

    // Adjust for previous satisfaction pattern
    predictedSatisfaction += (personalFactors.previousSatisfaction - 50) * 0.2;

    // Adjust for adaptability
    predictedSatisfaction += (personalFactors.adaptability - 50) * 0.15;

    // Adjust for support system
    predictedSatisfaction += (personalFactors.supportSystem - 50) * 0.1;

    return Math.max(30, Math.min(95, predictedSatisfaction));
  }
}

/**
 * Factory function for SatisfactionEngine.
 */
export function createSatisfactionEngine(): SatisfactionEngine {
  return new SatisfactionEngine();
}
