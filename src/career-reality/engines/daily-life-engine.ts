/**
 * CareerOS - Daily Life Engine
 *
 * Models what a typical day, week, month, and year look like in a career.
 *
 * Generates realistic time distributions for:
 * - meetings
 * - deep work
 * - travel
 * - collaboration
 * - customer interaction
 * - execution work
 *
 * @module daily-life-engine
 * @version 1.0.0
 */

import type {
  DailyLifeProfile,
  TimeBlockBreakdown,
  WeekPattern,
  MonthPattern,
  YearPattern,
  ActivityDistribution,
  WorkRhythm,
  CrunchPeriod,
  SeasonalPattern,
  CareerId,
  CompanyStage,
} from '../types/career-reality-types';

/** Input for daily life modeling */
export interface DailyLifeInput {
  careerId: CareerId;
  careerTitle: string;
  companyStage?: CompanyStage;
  experienceLevel?: 'ENTRY' | 'MID' | 'SENIOR' | 'EXECUTIVE';
  industry?: string;
}

/** Activity weights for different career types */
interface ActivityWeights {
  deepWork: number;
  meetings: number;
  admin: number;
  customerInteraction: number;
  travel: number;
  reactiveWork: number;
  learning: number;
  social: number;
}

/** Career activity templates */
const CAREER_TEMPLATES: Record<string, ActivityWeights> = {
  'software-engineer': {
    deepWork: 40,
    meetings: 15,
    admin: 10,
    customerInteraction: 5,
    travel: 2,
    reactiveWork: 15,
    learning: 8,
    social: 5,
  },
  'product-manager': {
    deepWork: 15,
    meetings: 40,
    admin: 15,
    customerInteraction: 15,
    travel: 5,
    reactiveWork: 5,
    learning: 3,
    social: 2,
  },
  'investment-banker': {
    deepWork: 25,
    meetings: 30,
    admin: 20,
    customerInteraction: 10,
    travel: 5,
    reactiveWork: 5,
    learning: 3,
    social: 2,
  },
  'doctor': {
    deepWork: 20,
    meetings: 10,
    admin: 25,
    customerInteraction: 35,
    travel: 0,
    reactiveWork: 5,
    learning: 3,
    social: 2,
  },
  'consultant': {
    deepWork: 25,
    meetings: 35,
    admin: 15,
    customerInteraction: 10,
    travel: 10,
    reactiveWork: 3,
    learning: 2,
    social: 0,
  },
  'teacher': {
    deepWork: 10,
    meetings: 15,
    admin: 25,
    customerInteraction: 40,
    travel: 0,
    reactiveWork: 5,
    learning: 3,
    social: 2,
  },
  'sales-representative': {
    deepWork: 10,
    meetings: 25,
    admin: 20,
    customerInteraction: 30,
    travel: 10,
    reactiveWork: 3,
    learning: 1,
    social: 1,
  },
  'data-scientist': {
    deepWork: 50,
    meetings: 15,
    admin: 10,
    customerInteraction: 5,
    travel: 2,
    reactiveWork: 10,
    learning: 6,
    social: 2,
  },
  'designer': {
    deepWork: 45,
    meetings: 20,
    admin: 10,
    customerInteraction: 10,
    travel: 2,
    reactiveWork: 5,
    learning: 5,
    social: 3,
  },
  'default': {
    deepWork: 25,
    meetings: 25,
    admin: 15,
    customerInteraction: 10,
    travel: 5,
    reactiveWork: 10,
    learning: 5,
    social: 5,
  },
};

/** Company stage modifiers */
const STAGE_MODIFIERS: Record<CompanyStage, Partial<ActivityWeights>> = {
  STARTUP: {
    deepWork: 10,
    meetings: -5,
    admin: -5,
    reactiveWork: 5,
    social: -5,
  },
  GROWTH: {
    deepWork: 5,
    meetings: 5,
    admin: 0,
    reactiveWork: -5,
    social: -5,
  },
  MID_SIZED: {
    deepWork: -5,
    meetings: 5,
    admin: 5,
    reactiveWork: -5,
    social: 0,
  },
  ENTERPRISE: {
    deepWork: -10,
    meetings: 10,
    admin: 10,
    reactiveWork: -5,
    social: -5,
  },
  GOVERNMENT: {
    deepWork: -15,
    meetings: 5,
    admin: 15,
    reactiveWork: -5,
    social: 0,
  },
  FAMILY_BUSINESS: {
    deepWork: -5,
    meetings: 0,
    admin: 5,
    reactiveWork: 0,
    social: 0,
  },
};

/** Experience level modifiers */
const EXPERIENCE_MODIFIERS: Record<string, Partial<ActivityWeights>> = {
  ENTRY: {
    deepWork: 5,
    meetings: -10,
    admin: -5,
    learning: 10,
    social: 0,
  },
  MID: {
    deepWork: 0,
    meetings: 0,
    admin: 0,
    learning: 5,
    social: -5,
  },
  SENIOR: {
    deepWork: -10,
    meetings: 10,
    admin: 5,
    learning: -5,
    social: 0,
  },
  EXECUTIVE: {
    deepWork: -20,
    meetings: 20,
    admin: 10,
    learning: -10,
    social: 0,
  },
};

/**
 * Daily Life Engine - Models time distribution and work patterns.
 */
export class DailyLifeEngine {
  /**
   * Generate a daily life profile for a career.
   */
  generateProfile(input: DailyLifeInput): DailyLifeProfile {
    const template = this.getTemplate(input.careerId, input.careerTitle);
    const weights = this.applyModifiers(template, input);

    return {
      typicalDay: this.generateTimeBlockBreakdown(weights),
      typicalWeek: this.generateWeekPattern(input, weights),
      typicalMonth: this.generateMonthPattern(input),
      typicalYear: this.generateYearPattern(input),
      activityDistribution: this.generateActivityDistribution(weights),
      workRhythm: this.generateWorkRhythm(input, weights),
    };
  }

  /**
   * Get the base template for a career.
   */
  private getTemplate(careerId: CareerId, careerTitle: string): ActivityWeights {
    // Try to match by career ID
    for (const [key, template] of Object.entries(CAREER_TEMPLATES)) {
      if (careerId.toLowerCase().includes(key)) {
        return template;
      }
    }

    // Try to match by career title
    for (const [key, template] of Object.entries(CAREER_TEMPLATES)) {
      if (careerTitle.toLowerCase().includes(key.replace('-', ' '))) {
        return template;
      }
    }

    return CAREER_TEMPLATES.default;
  }

  /**
   * Apply modifiers based on company stage and experience level.
   */
  private applyModifiers(
    template: ActivityWeights,
    input: DailyLifeInput
  ): ActivityWeights {
    let weights = { ...template };

    // Apply company stage modifier
    if (input.companyStage) {
      const stageMod = STAGE_MODIFIERS[input.companyStage];
      weights = this.mergeWeights(weights, stageMod);
    }

    // Apply experience level modifier
    if (input.experienceLevel) {
      const expMod = EXPERIENCE_MODIFIERS[input.experienceLevel];
      weights = this.mergeWeights(weights, expMod);
    }

    return weights;
  }

  /**
   * Merge weights with modifiers.
   */
  private mergeWeights(
    base: ActivityWeights,
    modifier: Partial<ActivityWeights>
  ): ActivityWeights {
    return {
      deepWork: Math.max(0, base.deepWork + (modifier.deepWork || 0)),
      meetings: Math.max(0, base.meetings + (modifier.meetings || 0)),
      admin: Math.max(0, base.admin + (modifier.admin || 0)),
      customerInteraction: Math.max(
        0,
        base.customerInteraction + (modifier.customerInteraction || 0)
      ),
      travel: Math.max(0, base.travel + (modifier.travel || 0)),
      reactiveWork: Math.max(
        0,
        base.reactiveWork + (modifier.reactiveWork || 0)
      ),
      learning: Math.max(0, base.learning + (modifier.learning || 0)),
      social: Math.max(0, base.social + (modifier.social || 0)),
    };
  }

  /**
   * Generate time block breakdown from weights.
   */
  private generateTimeBlockBreakdown(weights: ActivityWeights): TimeBlockBreakdown {
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    const workHours = 8; // Standard work day

    return {
      deepWorkHours: Math.round((weights.deepWork / total) * workHours * 10) / 10,
      meetingHours: Math.round((weights.meetings / total) * workHours * 10) / 10,
      adminHours: Math.round((weights.admin / total) * workHours * 10) / 10,
      customerInteractionHours:
        Math.round((weights.customerInteraction / total) * workHours * 10) / 10,
      travelHours: Math.round((weights.travel / total) * workHours * 10) / 10,
      reactiveWorkHours:
        Math.round((weights.reactiveWork / total) * workHours * 10) / 10,
      learningHours: Math.round((weights.learning / total) * workHours * 10) / 10,
      socialHours: Math.round((weights.social / total) * workHours * 10) / 10,
    };
  }

  /**
   * Generate week pattern.
   */
  private generateWeekPattern(
    input: DailyLifeInput,
    weights: ActivityWeights
  ): WeekPattern {
    const baseHours = 40;
    const isHighIntensity = weights.deepWork > 40 || weights.meetings > 35;
    const isLowIntensity = weights.deepWork < 20 && weights.meetings < 20;

    return {
      typicalHoursPerWeek: isHighIntensity ? 45 : isLowIntensity ? 38 : baseHours,
      peakHoursPerWeek: isHighIntensity ? 60 : 50,
      minimumHoursPerWeek: isLowIntensity ? 35 : 40,
      weekendWorkFrequency: this.calculateWeekendFrequency(input),
      eveningWorkFrequency: this.calculateEveningFrequency(input, weights),
      earlyMorningWorkFrequency: this.calculateEarlyMorningFrequency(input),
      schedulePredictability: this.calculatePredictability(input),
    };
  }

  /**
   * Calculate weekend work frequency.
   */
  private calculateWeekendFrequency(input: DailyLifeInput): number {
    const highWeekendCareers = ['investment-banker', 'consultant', 'doctor', 'startup'];
    const mediumWeekendCareers = ['product-manager', 'software-engineer', 'sales'];

    const careerKey = input.careerId.toLowerCase();

    if (highWeekendCareers.some((c) => careerKey.includes(c))) return 40;
    if (mediumWeekendCareers.some((c) => careerKey.includes(c))) return 15;
    return 5;
  }

  /**
   * Calculate evening work frequency.
   */
  private calculateEveningFrequency(
    input: DailyLifeInput,
    weights: ActivityWeights
  ): number {
    const baseFrequency = weights.meetings > 30 ? 40 : 20;

    if (input.companyStage === 'STARTUP') return Math.min(100, baseFrequency + 20);
    if (input.companyStage === 'ENTERPRISE') return Math.max(0, baseFrequency - 10);

    return baseFrequency;
  }

  /**
   * Calculate early morning work frequency.
   */
  private calculateEarlyMorningFrequency(input: DailyLifeInput): number {
    const earlyCareers = ['trader', 'doctor', 'teacher', 'consultant'];
    return earlyCareers.some((c) => input.careerId.toLowerCase().includes(c)) ? 30 : 10;
  }

  /**
   * Calculate schedule predictability.
   */
  private calculatePredictability(input: DailyLifeInput): number {
    if (input.companyStage === 'STARTUP') return 30;
    if (input.companyStage === 'ENTERPRISE') return 75;
    if (input.companyStage === 'GOVERNMENT') return 85;
    return 60;
  }

  /**
   * Generate month pattern.
   */
  private generateMonthPattern(input: DailyLifeInput): MonthPattern {
    return {
      crunchPeriods: this.generateCrunchPeriods(input),
      travelDaysPerMonth: this.calculateTravelDays(input),
      wfhDaysPerMonth: this.calculateWfhDays(input),
      overtimeFrequency: this.calculateOvertimeFrequency(input),
    };
  }

  /**
   * Generate crunch periods.
   */
  private generateCrunchPeriods(input: DailyLifeInput): CrunchPeriod[] {
    const periods: CrunchPeriod[] = [];

    // Quarter-end crunch for many corporate roles
    if (
      input.careerId.includes('product') ||
      input.careerId.includes('manager') ||
      input.careerId.includes('sales')
    ) {
      periods.push({
        name: 'Quarter-End',
        frequency: 'quarterly',
        durationDays: 5,
        intensity: 80,
        hoursPerDay: 10,
      });
    }

    // Month-end for finance roles
    if (input.careerId.includes('finance') || input.careerId.includes('accountant')) {
      periods.push({
        name: 'Month-End Close',
        frequency: 'monthly',
        durationDays: 3,
        intensity: 85,
        hoursPerDay: 11,
      });
    }

    // Deal crunch for investment banking/consulting
    if (
      input.careerId.includes('investment') ||
      input.careerId.includes('banker') ||
      input.careerId.includes('consultant')
    ) {
      periods.push({
        name: 'Deal Crunch',
        frequency: 'project-based',
        durationDays: 14,
        intensity: 95,
        hoursPerDay: 14,
      });
    }

    return periods;
  }

  /**
   * Calculate travel days per month.
   */
  private calculateTravelDays(input: DailyLifeInput): number {
    const highTravel = ['consultant', 'sales', 'account-manager', 'field-engineer'];
    const mediumTravel = ['product-manager', 'executive', 'trainer'];

    if (highTravel.some((c) => input.careerId.toLowerCase().includes(c))) return 8;
    if (mediumTravel.some((c) => input.careerId.toLowerCase().includes(c))) return 3;
    return 1;
  }

  /**
   * Calculate work from home days.
   */
  private calculateWfhDays(input: DailyLifeInput): number {
    if (input.companyStage === 'STARTUP' && input.careerId.includes('software')) return 15;
    if (input.companyStage === 'ENTERPRISE') return 8;
    if (input.companyStage === 'GOVERNMENT') return 2;
    return 10;
  }

  /**
   * Calculate overtime frequency.
   */
  private calculateOvertimeFrequency(input: DailyLifeInput): number {
    const highOvertime = ['investment-banker', 'consultant', 'doctor', 'startup-founder'];
    if (highOvertime.some((c) => input.careerId.toLowerCase().includes(c))) return 70;
    return 25;
  }

  /**
   * Generate year pattern.
   */
  private generateYearPattern(input: DailyLifeInput): YearPattern {
    return {
      seasonalPatterns: this.generateSeasonalPatterns(input),
      annualLeaveDays: this.calculateAnnualLeave(input),
      leaveUtilizationRate: this.calculateLeaveUtilization(input),
      shutdownPeriods: this.generateShutdownPeriods(input),
      professionalTravelWeeks: this.calculateProfessionalTravel(input),
    };
  }

  /**
   * Generate seasonal patterns.
   */
  private generateSeasonalPatterns(input: DailyLifeInput): SeasonalPattern[] {
    const patterns: SeasonalPattern[] = [];

    // Q1 - Planning and goal setting
    patterns.push({
      season: 'Q1 (Jan-Mar)',
      months: ['January', 'February', 'March'],
      workloadLevel: 85,
      characteristics: ['Goal setting', 'Planning', 'Strategy development', 'Budget finalization'],
    });

    // Q2 - Execution
    patterns.push({
      season: 'Q2 (Apr-Jun)',
      months: ['April', 'May', 'June'],
      workloadLevel: 90,
      characteristics: ['Peak execution', 'Mid-year reviews', 'Conference season'],
    });

    // Q3 - Summer slowdown for some
    patterns.push({
      season: 'Q3 (Jul-Sep)',
      months: ['July', 'August', 'September'],
      workloadLevel: input.careerId.includes('teacher') ? 90 : 70,
      characteristics:
        input.careerId.includes('teacher')
          ? ['Back to school prep', 'Curriculum planning']
          : ['Summer vacations', 'Slower pace', 'Q3 planning'],
    });

    // Q4 - Year-end push
    patterns.push({
      season: 'Q4 (Oct-Dec)',
      months: ['October', 'November', 'December'],
      workloadLevel: 95,
      characteristics: ['Year-end targets', 'Budget planning', 'Holiday slowdown in Dec'],
    });

    return patterns;
  }

  /**
   * Calculate annual leave days.
   */
  private calculateAnnualLeave(input: DailyLifeInput): number {
    if (input.companyStage === 'STARTUP') return 15;
    if (input.companyStage === 'ENTERPRISE') return 25;
    if (input.companyStage === 'GOVERNMENT') return 30;
    return 20;
  }

  /**
   * Calculate leave utilization rate.
   */
  private calculateLeaveUtilization(input: DailyLifeInput): number {
    const lowUtilization = ['investment-banker', 'consultant', 'doctor', 'lawyer'];
    if (lowUtilization.some((c) => input.careerId.toLowerCase().includes(c))) return 50;
    return 75;
  }

  /**
   * Generate shutdown periods.
   */
  private generateShutdownPeriods(input: DailyLifeInput): string[] {
    const periods: string[] = [];

    if (input.companyStage === 'ENTERPRISE') {
      periods.push('Year-end holidays (Dec 25 - Jan 1)');
    }

    if (input.careerId.includes('teacher') || input.careerId.includes('academic')) {
      periods.push('Summer break (varies by institution)');
    }

    return periods;
  }

  /**
   * Calculate professional travel weeks.
   */
  private calculateProfessionalTravel(input: DailyLifeInput): number {
    const highTravel = ['consultant', 'sales', 'executive'];
    const mediumTravel = ['product-manager', 'engineer', 'researcher'];

    if (highTravel.some((c) => input.careerId.toLowerCase().includes(c))) return 8;
    if (mediumTravel.some((c) => input.careerId.toLowerCase().includes(c))) return 3;
    return 1;
  }

  /**
   * Generate activity distribution.
   */
  private generateActivityDistribution(weights: ActivityWeights): ActivityDistribution {
    const total = Object.values(weights).reduce((a, b) => a + b, 0);

    return {
      meetingsPercentage: Math.round((weights.meetings / total) * 100),
      deepWorkPercentage: Math.round((weights.deepWork / total) * 100),
      executionPercentage: Math.round(
        ((weights.admin + weights.reactiveWork) / total) * 100
      ),
      collaborationPercentage: Math.round(
        ((weights.meetings + weights.social) / total) * 100
      ),
      customerInteractionPercentage: Math.round(
        (weights.customerInteraction / total) * 100
      ),
      adminPercentage: Math.round((weights.admin / total) * 100),
      creativeWorkPercentage: Math.round((weights.deepWork / total) * 50),
      analyticalWorkPercentage: Math.round((weights.deepWork / total) * 50),
    };
  }

  /**
   * Generate work rhythm characteristics.
   */
  private generateWorkRhythm(
    input: DailyLifeInput,
    weights: ActivityWeights
  ): WorkRhythm {
    const pace = this.calculatePace(input, weights);
    const deadlinePressure = this.calculateDeadlinePressure(input);
    const multiTasking = this.calculateMultiTasking(weights);
    const contextSwitching = this.calculateContextSwitching(weights);

    return {
      pace,
      deadlinePressure,
      multiTasking,
      contextSwitching,
      intensityPattern: this.determineIntensityPattern(input),
    };
  }

  /**
   * Calculate work pace.
   */
  private calculatePace(input: DailyLifeInput, weights: ActivityWeights): number {
    let pace = 50;

    if (input.careerId.includes('trader') || input.careerId.includes('emergency')) {
      pace = 90;
    } else if (weights.reactiveWork > 15) {
      pace = 75;
    } else if (weights.deepWork > 40) {
      pace = 40;
    }

    if (input.companyStage === 'STARTUP') pace += 15;
    if (input.companyStage === 'GOVERNMENT') pace -= 15;

    return Math.max(0, Math.min(100, pace));
  }

  /**
   * Calculate deadline pressure.
   */
  private calculateDeadlinePressure(input: DailyLifeInput): number {
    const highPressure = [
      'investment-banker',
      'journalist',
      'consultant',
      'lawyer-litigation',
    ];
    const lowPressure = ['researcher', 'academic', 'librarian', 'archivist'];

    if (highPressure.some((c) => input.careerId.toLowerCase().includes(c))) return 85;
    if (lowPressure.some((c) => input.careerId.toLowerCase().includes(c))) return 30;
    return 60;
  }

  /**
   * Calculate multi-tasking requirement.
   */
  private calculateMultiTasking(weights: ActivityWeights): number {
    return weights.meetings > 30 ? 75 : weights.deepWork > 40 ? 30 : 50;
  }

  /**
   * Calculate context switching frequency.
   */
  private calculateContextSwitching(weights: ActivityWeights): number {
    return weights.reactiveWork > 15 || weights.meetings > 35 ? 80 : 40;
  }

  /**
   * Determine intensity pattern.
   */
  private determineIntensityPattern(
    input: DailyLifeInput
  ): 'STEADY' | 'CYCLICAL' | 'PROJECT_BASED' | 'CRISIS_DRIVEN' | 'SEASONAL' {
    if (input.careerId.includes('emergency') || input.careerId.includes('support')) {
      return 'CRISIS_DRIVEN';
    }
    if (input.careerId.includes('consultant') || input.careerId.includes('project')) {
      return 'PROJECT_BASED';
    }
    if (input.careerId.includes('teacher') || input.careerId.includes('accountant')) {
      return 'SEASONAL';
    }
    if (input.careerId.includes('sales') || input.careerId.includes('finance')) {
      return 'CYCLICAL';
    }
    return 'STEADY';
  }

  /**
   * Compare daily life profiles between two careers.
   */
  compareProfiles(profileA: DailyLifeProfile, profileB: DailyLifeProfile): {
    similarity: number;
    differences: string[];
    recommendation: string;
  } {
    const differences: string[] = [];

    // Compare work hours
    const hoursDiff = Math.abs(
      profileA.typicalWeek.typicalHoursPerWeek - profileB.typicalWeek.typicalHoursPerWeek
    );
    if (hoursDiff > 5) {
      differences.push(
        `Work hours differ by ${hoursDiff} hours per week`
      );
    }

    // Compare deep work
    const deepWorkDiff = Math.abs(
      profileA.activityDistribution.deepWorkPercentage -
        profileB.activityDistribution.deepWorkPercentage
    );
    if (deepWorkDiff > 15) {
      differences.push(
        `Deep work percentage differs by ${deepWorkDiff}%`
      );
    }

    // Compare meetings
    const meetingDiff = Math.abs(
      profileA.activityDistribution.meetingsPercentage -
        profileB.activityDistribution.meetingsPercentage
    );
    if (meetingDiff > 15) {
      differences.push(
        `Meeting percentage differs by ${meetingDiff}%`
      );
    }

    // Calculate similarity score
    const similarity = Math.max(
      0,
      100 - hoursDiff * 2 - deepWorkDiff * 0.5 - meetingDiff * 0.5
    );

    // Generate recommendation
    let recommendation = '';
    if (profileA.activityDistribution.deepWorkPercentage > profileB.activityDistribution.deepWorkPercentage + 15) {
      recommendation = 'Choose Career A if you prefer focused, independent work';
    } else if (profileB.activityDistribution.deepWorkPercentage > profileA.activityDistribution.deepWorkPercentage + 15) {
      recommendation = 'Choose Career B if you prefer focused, independent work';
    } else if (profileA.activityDistribution.meetingsPercentage > profileB.activityDistribution.meetingsPercentage + 15) {
      recommendation = 'Choose Career B if you prefer less meeting time';
    } else if (profileB.activityDistribution.meetingsPercentage > profileA.activityDistribution.meetingsPercentage + 15) {
      recommendation = 'Choose Career A if you prefer less meeting time';
    } else {
      recommendation = 'Both careers have similar daily life patterns';
    }

    return { similarity, differences, recommendation };
  }
}

/**
 * Factory function for DailyLifeEngine.
 */
export function createDailyLifeEngine(): DailyLifeEngine {
  return new DailyLifeEngine();
}
