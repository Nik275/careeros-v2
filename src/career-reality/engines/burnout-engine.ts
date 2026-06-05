/**
 * CareerOS - Burnout Engine
 *
 * Models burnout risk, stress sources, frequency, and recovery potential.
 *
 * Examples: Investment Banking, Medicine, Consulting, Startups
 *
 * @module burnout-engine
 * @version 1.0.0
 */

import type {
  BurnoutProfile,
  StressSource,
  StressFrequency,
  RecoveryPotential,
  PreventionFactor,
  IndustryBurnoutPattern,
  CareerId,
  CompanyStage,
  DailyLifeProfile,
  WorkEnvironmentProfile,
} from '../types/career-reality-types';

/** Input for burnout modeling */
export interface BurnoutInput {
  careerId: CareerId;
  careerTitle: string;
  companyStage?: CompanyStage;
  dailyLife?: DailyLifeProfile;
  workEnvironment?: WorkEnvironmentProfile;
  industry?: string;
}

/** Career burnout risk templates */
interface BurnoutTemplate {
  baseRisk: number;
  primaryStressors: string[];
  typicalTimeline: number;
  warningSigns: string[];
  commonExitPoints: string[];
}

const CAREER_BURNOUT_TEMPLATES: Record<string, BurnoutTemplate> = {
  'investment-banker': {
    baseRisk: 85,
    primaryStressors: [
      'Long hours (80-100/week)',
      'High-stakes deals',
      'Client demands',
      'Competitive culture',
      'Sleep deprivation',
    ],
    typicalTimeline: 2,
    warningSigns: [
      'Chronic exhaustion',
      'Cynicism about deals',
      'Physical health decline',
      'Social isolation',
      'Substance use increase',
    ],
    commonExitPoints: ['Private equity', 'Corporate finance', 'Business school', 'Burnout leave'],
  },
  'doctor': {
    baseRisk: 75,
    primaryStressors: [
      'Life-or-death decisions',
      'Administrative burden',
      'Long shifts',
      'Emotional toll',
      'Sleep disruption',
    ],
    typicalTimeline: 5,
    warningSigns: [
      'Compassion fatigue',
      'Detachment from patients',
      'Moral distress',
      'Physical exhaustion',
      'Cynicism',
    ],
    commonExitPoints: ['Different specialty', 'Administrative role', 'Private practice', 'Leave of absence'],
  },
  'consultant': {
    baseRisk: 70,
    primaryStressors: [
      'Constant travel',
      'Client pressure',
      'Tight deadlines',
      'Up-or-out culture',
      'Work-life imbalance',
    ],
    typicalTimeline: 3,
    warningSigns: [
      'Travel fatigue',
      'Relationship strain',
      'Cynicism about client work',
      'Physical exhaustion',
      'Identity loss',
    ],
    commonExitPoints: ['Industry role', 'Startup', 'MBA', 'Independent consulting'],
  },
  'software-engineer-startup': {
    baseRisk: 65,
    primaryStressors: [
      'Crunch periods',
      'Technical debt pressure',
      'Equity uncertainty',
      'Rapid change',
      'On-call demands',
    ],
    typicalTimeline: 3,
    warningSigns: [
      'Code quality decline',
      'Irritability in standups',
      'Avoidance of new features',
      'Physical symptoms',
      'Cynicism about company',
    ],
    commonExitPoints: ['Big tech', 'Different startup', 'Consulting', 'Sabbatical'],
  },
  'teacher': {
    baseRisk: 60,
    primaryStressors: [
      'Emotional labor',
      'Administrative burden',
      'Limited resources',
      'Behavioral challenges',
      'Low compensation stress',
    ],
    typicalTimeline: 5,
    warningSigns: [
      'Emotional exhaustion',
      'Cynicism about students',
      'Reduced accomplishment feeling',
      'Physical fatigue',
      'Disengagement',
    ],
    commonExitPoints: ['Different school', 'Administration', 'Different career', 'Early retirement'],
  },
  'lawyer': {
    baseRisk: 70,
    primaryStressors: [
      'Billable hours pressure',
      'Adversarial environment',
      'Client demands',
      'Perfectionism culture',
      'Long hours',
    ],
    typicalTimeline: 4,
    warningSigns: [
      'Chronic stress',
      'Cynicism about law',
      'Physical symptoms',
      'Relationship problems',
      'Substance use',
    ],
    commonExitPoints: ['In-house counsel', 'Government', 'Different firm', 'Career change'],
  },
  'default': {
    baseRisk: 50,
    primaryStressors: [
      'Workload pressure',
      'Deadline stress',
      'Work-life balance',
      'Career uncertainty',
      'Organizational change',
    ],
    typicalTimeline: 5,
    warningSigns: [
      'Exhaustion',
      'Cynicism',
      'Reduced efficacy',
      'Physical symptoms',
      'Disengagement',
    ],
    commonExitPoints: ['Different role', 'Different company', 'Career break', 'Career change'],
  },
};

/** Company stage burnout modifiers */
const STAGE_BURNOUT_MODIFIERS: Record<CompanyStage, number> = {
  STARTUP: 15,
  GROWTH: 5,
  MID_SIZED: -5,
  ENTERPRISE: -10,
  GOVERNMENT: -15,
  FAMILY_BUSINESS: -5,
};

/**
 * Burnout Engine - Models burnout risk and stress patterns.
 */
export class BurnoutEngine {
  /**
   * Generate a burnout profile for a career.
   */
  generateProfile(input: BurnoutInput): BurnoutProfile {
    const template = this.getTemplate(input.careerId, input.companyStage);
    const baseRisk = this.calculateBaseRisk(template, input);

    return {
      overallRisk: baseRisk,
      riskLevel: this.getRiskLevel(baseRisk),
      stressSources: this.generateStressSources(template, input),
      stressFrequency: this.calculateStressFrequency(input),
      recoveryPotential: this.calculateRecoveryPotential(input, baseRisk),
      preventionFactors: this.generatePreventionFactors(input),
      industryPatterns: this.generateIndustryPatterns(template, input),
    };
  }

  /**
   * Get the burnout template for a career.
   */
  private getTemplate(careerId: CareerId, companyStage?: CompanyStage): BurnoutTemplate {
    // Check for startup modifier
    if (companyStage === 'STARTUP' && careerId.includes('software')) {
      return CAREER_BURNOUT_TEMPLATES['software-engineer-startup'];
    }

    // Check for specific career matches
    for (const [key, template] of Object.entries(CAREER_BURNOUT_TEMPLATES)) {
      if (careerId.toLowerCase().includes(key.replace('-startup', ''))) {
        return template;
      }
    }

    return CAREER_BURNOUT_TEMPLATES.default;
  }

  /**
   * Calculate base burnout risk.
   */
  private calculateBaseRisk(template: BurnoutTemplate, input: BurnoutInput): number {
    let risk = template.baseRisk;

    // Apply company stage modifier
    if (input.companyStage) {
      risk += STAGE_BURNOUT_MODIFIERS[input.companyStage];
    }

    // Adjust based on work environment if available
    if (input.workEnvironment) {
      // High autonomy reduces risk
      risk -= (input.workEnvironment.autonomy.overallScore - 50) * 0.2;

      // High flexibility reduces risk
      risk -= (input.workEnvironment.flexibility.overallScore - 50) * 0.2;

      // High competition increases risk
      risk += (input.workEnvironment.competition.overallScore - 50) * 0.15;

      // High politics increases risk
      risk += (input.workEnvironment.politics.overallScore - 50) * 0.1;
    }

    // Adjust based on daily life if available
    if (input.dailyLife) {
      // High hours increase risk
      const hoursRisk = (input.dailyLife.typicalWeek.typicalHoursPerWeek - 40) * 1.5;
      risk += hoursRisk;

      // High weekend work increases risk
      risk += (input.dailyLife.typicalWeek.weekendWorkFrequency - 20) * 0.3;

      // High reactive work increases risk
      risk += (input.dailyLife.workRhythm.contextSwitching - 50) * 0.2;
    }

    return Math.max(0, Math.min(100, risk));
  }

  /**
   * Get risk level category.
   */
  private getRiskLevel(risk: number): 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE' {
    if (risk < 30) return 'LOW';
    if (risk < 50) return 'MODERATE';
    if (risk < 70) return 'HIGH';
    return 'SEVERE';
  }

  /**
   * Generate stress sources.
   */
  private generateStressSources(template: BurnoutTemplate, input: BurnoutInput): StressSource[] {
    const sources: StressSource[] = [];

    // Add template stressors
    template.primaryStressors.forEach((stressor, index) => {
      sources.push({
        id: `stress-${index}`,
        name: stressor,
        description: `Primary stress source: ${stressor}`,
        impact: 70 + Math.random() * 20,
        frequency: 60 + Math.random() * 30,
        controllability: 30 + Math.random() * 40,
      });
    });

    // Add contextual stressors based on work environment
    if (input.workEnvironment) {
      if (input.workEnvironment.bureaucracy.overallScore > 60) {
        sources.push({
          id: 'stress-bureaucracy',
          name: 'Bureaucratic Friction',
          description: 'Excessive administrative processes and approvals',
          impact: 50,
          frequency: 70,
          controllability: 20,
        });
      }

      if (input.workEnvironment.politics.overallScore > 60) {
        sources.push({
          id: 'stress-politics',
          name: 'Organizational Politics',
          description: 'Navigating internal politics and power dynamics',
          impact: 60,
          frequency: 60,
          controllability: 30,
        });
      }
    }

    // Add contextual stressors based on daily life
    if (input.dailyLife) {
      if (input.dailyLife.typicalWeek.weekendWorkFrequency > 30) {
        sources.push({
          id: 'stress-weekend',
          name: 'Weekend Work Intrusion',
          description: 'Regular work encroaching on personal time',
          impact: 75,
          frequency: input.dailyLife.typicalWeek.weekendWorkFrequency,
          controllability: 25,
        });
      }

      if (input.dailyLife.workRhythm.contextSwitching > 70) {
        sources.push({
          id: 'stress-context',
          name: 'Constant Context Switching',
          description: 'Frequent interruptions and task switching',
          impact: 65,
          frequency: input.dailyLife.workRhythm.contextSwitching,
          controllability: 35,
        });
      }
    }

    return sources;
  }

  /**
   * Calculate stress frequency characteristics.
   */
  private calculateStressFrequency(input: BurnoutInput): StressFrequency {
    const baseFrequency = {
      daily: 40,
      weekly: 50,
      monthly: 60,
      chronic: 30,
      acuteEpisodes: 20,
      crisisFrequency: 10,
    };

    // Adjust based on career
    if (input.careerId.includes('investment') || input.careerId.includes('banker')) {
      return {
        daily: 80,
        weekly: 90,
        monthly: 85,
        chronic: 70,
        acuteEpisodes: 60,
        crisisFrequency: 40,
      };
    }

    if (input.careerId.includes('doctor') || input.careerId.includes('emergency')) {
      return {
        daily: 70,
        weekly: 75,
        monthly: 70,
        chronic: 60,
        acuteEpisodes: 50,
        crisisFrequency: 30,
      };
    }

    if (input.careerId.includes('consultant')) {
      return {
        daily: 60,
        weekly: 75,
        monthly: 70,
        chronic: 50,
        acuteEpisodes: 40,
        crisisFrequency: 25,
      };
    }

    // Adjust based on company stage
    if (input.companyStage === 'STARTUP') {
      return {
        daily: Math.min(100, baseFrequency.daily + 20),
        weekly: Math.min(100, baseFrequency.weekly + 15),
        monthly: Math.min(100, baseFrequency.monthly + 10),
        chronic: Math.min(100, baseFrequency.chronic + 15),
        acuteEpisodes: Math.min(100, baseFrequency.acuteEpisodes + 20),
        crisisFrequency: Math.min(100, baseFrequency.crisisFrequency + 15),
      };
    }

    if (input.companyStage === 'GOVERNMENT') {
      return {
        daily: Math.max(0, baseFrequency.daily - 20),
        weekly: Math.max(0, baseFrequency.weekly - 15),
        monthly: Math.max(0, baseFrequency.monthly - 10),
        chronic: Math.max(0, baseFrequency.chronic - 10),
        acuteEpisodes: Math.max(0, baseFrequency.acuteEpisodes - 10),
        crisisFrequency: Math.max(0, baseFrequency.crisisFrequency - 5),
      };
    }

    return baseFrequency;
  }

  /**
   * Calculate recovery potential.
   */
  private calculateRecoveryPotential(input: BurnoutInput, risk: number): RecoveryPotential {
    let baseRecovery = 60;

    // Higher risk careers often have better recovery infrastructure
    if (risk > 70) {
      baseRecovery = 50;
    }

    // Adjust based on work environment
    if (input.workEnvironment) {
      baseRecovery += (input.workEnvironment.flexibility.overallScore - 50) * 0.3;
      baseRecovery += (input.workEnvironment.autonomy.scheduleAutonomy - 50) * 0.2;
    }

    // Adjust based on daily life
    if (input.dailyLife) {
      baseRecovery += (input.dailyLife.typicalYear.leaveUtilizationRate - 50) * 0.3;
      baseRecovery += (100 - input.dailyLife.typicalWeek.eveningWorkFrequency) * 0.2;
    }

    const overallScore = Math.max(20, Math.min(90, baseRecovery));

    return {
      overallScore,
      typicalRecoveryDays: risk > 70 ? 30 : risk > 50 ? 21 : 14,
      severeRecoveryDays: risk > 70 ? 90 : risk > 50 ? 60 : 45,
      vacationEffectiveness: overallScore - 10,
      weekendRecovery: overallScore + 5,
      boundaryControl: input.workEnvironment?.flexibility.overallScore || 50,
    };
  }

  /**
   * Generate prevention factors.
   */
  private generatePreventionFactors(input: BurnoutInput): PreventionFactor[] {
    const factors: PreventionFactor[] = [
      {
        name: 'Vacation Time',
        description: 'Regular time off to recharge',
        effectiveness: 75,
        availability: input.dailyLife?.typicalYear.annualLeaveDays
          ? Math.min(100, input.dailyLife.typicalYear.annualLeaveDays * 3)
          : 60,
      },
      {
        name: 'Flexible Schedule',
        description: 'Ability to adjust work hours',
        effectiveness: 70,
        availability: input.workEnvironment?.flexibility.scheduleFlexibility || 50,
      },
      {
        name: 'Autonomy',
        description: 'Control over work methods and decisions',
        effectiveness: 80,
        availability: input.workEnvironment?.autonomy.overallScore || 50,
      },
      {
        name: 'Social Support',
        description: 'Supportive colleagues and management',
        effectiveness: 75,
        availability: 60,
      },
      {
        name: 'Clear Boundaries',
        description: 'Separation between work and personal life',
        effectiveness: 85,
        availability: Math.max(
          0,
          100 - (input.dailyLife?.typicalWeek.weekendWorkFrequency || 20)
        ),
      },
      {
        name: 'Meaningful Work',
        description: 'Sense of purpose and impact',
        effectiveness: 80,
        availability: 70,
      },
    ];

    return factors;
  }

  /**
   * Generate industry-specific burnout patterns.
   */
  private generateIndustryPatterns(
    template: BurnoutTemplate,
    input: BurnoutInput
  ): IndustryBurnoutPattern[] {
    const patterns: IndustryBurnoutPattern[] = [];

    // Main industry pattern
    patterns.push({
      name: `${input.careerTitle} Burnout Pattern`,
      description: `Typical burnout progression for ${input.careerTitle} professionals`,
      typicalTimeline: template.typicalTimeline,
      warningSigns: template.warningSigns,
      commonExitPoints: template.commonExitPoints,
    });

    // Add stage-specific pattern if applicable
    if (input.companyStage === 'STARTUP') {
      patterns.push({
        name: 'Startup Accelerated Burnout',
        description: 'Compressed timeline due to startup intensity',
        typicalTimeline: Math.max(1, template.typicalTimeline - 1),
        warningSigns: [
          ...template.warningSigns.slice(0, 3),
          'Cynicism about company mission',
          'Equity anxiety',
        ],
        commonExitPoints: ['Different startup', 'Big tech', 'Sabbatical', 'Consulting'],
      });
    }

    return patterns;
  }

  /**
   * Calculate burnout risk score for a specific individual profile.
   */
  calculatePersonalRisk(
    baseProfile: BurnoutProfile,
    personalFactors: {
      resilienceScore: number;
      supportSystemStrength: number;
      workLifeBoundary: number;
      previousBurnoutHistory: boolean;
    }
  ): number {
    let risk = baseProfile.overallRisk;

    // Adjust for personal resilience
    risk -= (personalFactors.resilienceScore - 50) * 0.5;

    // Adjust for support system
    risk -= (personalFactors.supportSystemStrength - 50) * 0.3;

    // Adjust for work-life boundaries
    risk -= (personalFactors.workLifeBoundary - 50) * 0.4;

    // Previous burnout history increases risk
    if (personalFactors.previousBurnoutHistory) {
      risk += 15;
    }

    return Math.max(0, Math.min(100, risk));
  }

  /**
   * Compare burnout profiles between two careers.
   */
  compareProfiles(
    profileA: BurnoutProfile,
    profileB: BurnoutProfile
  ): {
    riskDifference: number;
    recommendation: string;
    saferChoice: 'A' | 'B' | 'SIMILAR';
  } {
    const riskDiff = profileA.overallRisk - profileB.overallRisk;

    let saferChoice: 'A' | 'B' | 'SIMILAR';
    let recommendation: string;

    if (Math.abs(riskDiff) < 10) {
      saferChoice = 'SIMILAR';
      recommendation = 'Both careers have similar burnout risk profiles';
    } else if (riskDiff > 0) {
      saferChoice = 'B';
      recommendation = `Career B has ${riskDiff.toFixed(0)} points lower burnout risk`;
    } else {
      saferChoice = 'A';
      recommendation = `Career A has ${Math.abs(riskDiff).toFixed(0)} points lower burnout risk`;
    }

    return { riskDifference: riskDiff, recommendation, saferChoice };
  }

  /**
   * Get early warning indicators for a career.
   */
  getEarlyWarningIndicators(careerId: CareerId): string[] {
    const template = this.getTemplate(careerId);
    return template.warningSigns.slice(0, 3);
  }

  /**
   * Get recommended interventions based on risk level.
   */
  getRecommendedInterventions(riskLevel: BurnoutProfile['riskLevel']): string[] {
    const interventions: Record<typeof riskLevel, string[]> = {
      LOW: [
        'Maintain current work-life balance',
        'Regular check-ins with self',
        'Continue healthy habits',
      ],
      MODERATE: [
        'Set clearer work boundaries',
        'Increase vacation utilization',
        'Develop stress management practices',
        'Build stronger support network',
      ],
      HIGH: [
        'Immediate boundary setting required',
        'Consider role or company change',
        'Seek professional support',
        'Implement strict recovery routines',
        'Evaluate career fit',
      ],
      SEVERE: [
        'Urgent: Consider career break',
        'Seek professional help immediately',
        'Reduce workload significantly',
        'Consider career change',
        'Prioritize health over career progression',
      ],
    };

    return interventions[riskLevel];
  }
}

/**
 * Factory function for BurnoutEngine.
 */
export function createBurnoutEngine(): BurnoutEngine {
  return new BurnoutEngine();
}
