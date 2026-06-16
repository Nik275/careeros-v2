/**
 * India Intelligence - UPSC Engine
 * 
 * Models the complete civil services examination ecosystem including:
 * - UPSC CSE (IAS, IPS, IFS, IRS) pathways
 * - State PSC alternatives
 * - Attempt strategy and age constraints
 * - Backup planning
 * - Success probability analysis
 * 
 * @module intelligence/india-intelligence
 */

import {
  IndiaIntelligenceInput,
  UPSCAnalysis,
  CivilServiceType,
  ServicePreference,
  UPSCBackupPlan,
  UPSCRiskAssessment,
  UPSCRecommendation,
  ExamAttempt,
  isUPSCAgeEligible,
  EconomicStratum,
} from '../types';

/**
 * UPSC Engine Configuration
 */
export interface UPSCEngineConfig {
  /** Maximum recommended attempts for general category */
  maxAttemptsGeneral: number;
  /** Maximum age for general category */
  maxAgeGeneral: number;
  /** Consider coaching requirement */
  considerCoachingRequirement: boolean;
  /** Minimum success probability to recommend */
  minSuccessProbability: number;
}

/**
 * Default UPSC Engine configuration
 */
export const DEFAULT_UPSC_CONFIG: UPSCEngineConfig = {
  maxAttemptsGeneral: 6,
  maxAgeGeneral: 32,
  considerCoachingRequirement: true,
  minSuccessProbability: 0.15,
};

type UPSCReservationCategory = 'GENERAL' | 'OBC' | 'SC' | 'ST' | 'EWS';

/**
 * UPSC Engine
 * 
 * Analyzes civil services pathway viability
 */
export class UPSCEngine {
  private config: UPSCEngineConfig;
  
  constructor(config: Partial<UPSCEngineConfig> = {}) {
    this.config = { ...DEFAULT_UPSC_CONFIG, ...config };
  }
  
  /**
   * Analyze UPSC pathway for a student
   */
  analyze(input: IndiaIntelligenceInput): UPSCAnalysis {
    const birthYear = this.estimateBirthYear(input);
    const category: UPSCReservationCategory = 'GENERAL'; // Should come from profile
    
    // Check eligibility
    const eligibility = this.checkEligibility(birthYear, category, input);
    
    // Assess current readiness
    const currentReadiness = this.assessReadiness(input);
    
    // Generate attempt strategy
    const attemptStrategy = this.generateAttemptStrategy(
      eligibility,
      currentReadiness,
      input
    );
    
    // Generate service preferences
    const servicePreferences = this.generateServicePreferences(input);
    
    // Generate backup plans
    const backupPlans = this.generateBackupPlans(input);
    
    // Assess risks
    const riskAssessment = this.assessRisks(
      eligibility,
      currentReadiness,
      input
    );
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      eligibility,
      currentReadiness,
      riskAssessment,
      input
    );
    
    return {
      eligibility,
      currentReadiness,
      attemptStrategy,
      servicePreferences,
      backupPlans,
      riskAssessment,
      recommendations,
    };
  }
  
  /**
   * Estimate birth year from education level
   */
  private estimateBirthYear(input: IndiaIntelligenceInput): number {
    const currentYear = new Date().getFullYear();
    const level = input.profile.currentEducationLevel;
    
    const ageMap: Record<string, number> = {
      'SCHOOL_10': 15,
      'SCHOOL_12': 17,
      'UNDERGRAD': 20,
      'POSTGRAD': 24,
      'WORKING': 26,
    };
    
    return currentYear - (ageMap[level] || 22);
  }
  
  /**
   * Check UPSC eligibility
   */
  private checkEligibility(
    birthYear: number,
    category: UPSCReservationCategory,
    input: IndiaIntelligenceInput
  ): UPSCAnalysis['eligibility'] {
    const ageCheck = isUPSCAgeEligible(birthYear, category);
    const attempts = this.extractUPSCAttempts(input.profile.examAttempts);
    const attemptsRemaining = this.config.maxAttemptsGeneral - attempts.length;
    
    return {
      ageEligible: ageCheck.eligible,
      attemptsRemaining: Math.max(0, attemptsRemaining),
      yearsLeft: ageCheck.yearsLeft,
      categoryBenefits: category !== 'GENERAL',
    };
  }
  
  /**
   * Extract UPSC attempts
   */
  private extractUPSCAttempts(attempts: ExamAttempt[]): ExamAttempt[] {
    return attempts.filter(a => 
      a.examType === 'UPSC'
    );
  }
  
  /**
   * Assess current readiness for UPSC
   */
  private assessReadiness(input: IndiaIntelligenceInput): UPSCAnalysis['currentReadiness'] {
    // This would ideally use actual test scores
    // For now, estimate based on academic performance and profile
    
    const academicScore = input.profile.academicPerformance.class10Percentage / 100;
    const hasAttempted = input.profile.examAttempts.some(a => a.examType === 'UPSC');
    
    let preliminaryScore = academicScore * 0.6; // Base score
    let mainsScore = academicScore * 0.5;
    let interviewScore = 0.5;
    
    // Adjust for attempts
    if (hasAttempted) {
      const attempts = this.extractUPSCAttempts(input.profile.examAttempts);
      const bestAttempt = attempts.sort((a, b) => (b.percentile || 0) - (a.percentile || 0))[0];
      if (bestAttempt) {
        preliminaryScore = Math.max(preliminaryScore, (bestAttempt.percentile || 0) / 100);
      }
    }
    
    // Reading habit indicator
    if (input.selfAssessment.preferredWorkEnvironment === 'GOVERNMENT') {
      preliminaryScore += 0.1;
      mainsScore += 0.1;
    }
    
    // Cap scores
    preliminaryScore = Math.min(preliminaryScore, 1);
    mainsScore = Math.min(mainsScore, 1);
    
    const overallReadiness = 
      preliminaryScore > 0.7 ? 'STRONG' :
      preliminaryScore > 0.5 ? 'READY' :
      preliminaryScore > 0.3 ? 'EARLY' : 'NOT_READY';
    
    return {
      preliminaryScore,
      mainsScore,
      interviewScore,
      overallReadiness,
    };
  }
  
  /**
   * Generate attempt strategy
   */
  private generateAttemptStrategy(
    eligibility: UPSCAnalysis['eligibility'],
    readiness: UPSCAnalysis['currentReadiness'],
    input: IndiaIntelligenceInput
  ): UPSCAnalysis['attemptStrategy'] {
    const attemptsToMake = Math.min(eligibility.attemptsRemaining, this.config.maxAttemptsGeneral);
    const preparationMonths = this.calculatePreparationTime(readiness);
    
    // Coaching recommendation
    const needsCoaching = readiness.overallReadiness !== 'STRONG' && 
                         input.profile.familyIncome >= EconomicStratum.LOWER_MIDDLE;
    
    const coachingCost = this.estimateCoachingCost(input);
    
    const currentYear = new Date().getFullYear();
    const firstAttemptYear = currentYear + Math.ceil(preparationMonths / 12);
    
    return {
      recommendedAttempts: attemptsToMake,
      preparationTimeline: preparationMonths,
      coachingRecommendation: {
        required: needsCoaching,
        type: needsCoaching ? 'DELHI' : 'SELF',
        duration: 12,
        cost: coachingCost,
      },
      attemptSchedule: {
        firstAttempt: firstAttemptYear,
        gapBetweenAttempts: 12, // 1 year between attempts
        finalAttemptBy: firstAttemptYear + attemptsToMake - 1,
      },
      dropYearRecommended: input.profile.currentEducationLevel === 'SCHOOL_12' ||
                            input.profile.currentEducationLevel === 'UNDERGRAD',
    };
  }
  
  /**
   * Calculate preparation time needed
   */
  private calculatePreparationTime(readiness: UPSCAnalysis['currentReadiness']): number {
    const baseMonths = 12;
    
    if (readiness.overallReadiness === 'STRONG') return baseMonths;
    if (readiness.overallReadiness === 'READY') return baseMonths + 6;
    if (readiness.overallReadiness === 'EARLY') return baseMonths + 12;
    return baseMonths + 18;
  }
  
  /**
   * Estimate coaching cost
   */
  private estimateCoachingCost(input: IndiaIntelligenceInput): number {
    // Delhi coaching costs 2-4L for full course
    if (input.profile.familyIncome >= EconomicStratum.UPPER_MIDDLE) return 350000;
    if (input.profile.familyIncome >= EconomicStratum.MIDDLE_CLASS) return 250000;
    return 150000; // Online/recorded
  }
  
  /**
   * Generate service preferences
   */
  private generateServicePreferences(input: IndiaIntelligenceInput): ServicePreference[] {
    const preferences: ServicePreference[] = [];
    
    // IAS
    preferences.push({
      service: CivilServiceType.IAS,
      rank: 1,
      probabilityAtCurrentReadiness: 0.001, // ~1000 selected out of 1M
      workProfile: 'Policy making, district administration, public service delivery',
      posting: { initial: 'RURAL', later: 'MIXED' },
      lifestyle: {
        power: 'HIGH',
        prestige: 'HIGH',
        workLifeBalance: 'DEMANDING',
        transfers: 'FREQUENT',
      },
      income: { starting: 850000, atRetirement: 2500000, perksValue: 500000 },
      bestFor: ['Leadership oriented', 'Policy interest', 'Public service motivation'],
    });
    
    // IPS
    preferences.push({
      service: CivilServiceType.IPS,
      rank: 2,
      probabilityAtCurrentReadiness: 0.0008,
      workProfile: 'Law enforcement, crime prevention, internal security',
      posting: { initial: 'MIXED', later: 'URBAN' },
      lifestyle: {
        power: 'HIGH',
        prestige: 'HIGH',
        workLifeBalance: 'DEMANDING',
        transfers: 'FREQUENT',
      },
      income: { starting: 850000, atRetirement: 2500000, perksValue: 400000 },
      bestFor: ['Adventure seeking', 'Law enforcement interest', 'Physical fitness'],
    });
    
    // IFS
    preferences.push({
      service: CivilServiceType.IFS,
      rank: 3,
      probabilityAtCurrentReadiness: 0.0005,
      workProfile: 'Diplomacy, foreign relations, international affairs',
      posting: { initial: 'URBAN', later: 'MIXED' },
      lifestyle: {
        power: 'MODERATE',
        prestige: 'HIGH',
        workLifeBalance: 'BALANCED',
        transfers: 'FREQUENT',
      },
      income: { starting: 900000, atRetirement: 2600000, perksValue: 1000000 }, // Foreign allowance
      bestFor: ['International exposure', 'Language skills', 'Diplomacy interest'],
    });
    
    // IRS (Income Tax)
    preferences.push({
      service: CivilServiceType.IRS_INCOME_TAX,
      rank: 4,
      probabilityAtCurrentReadiness: 0.002,
      workProfile: 'Tax administration, policy implementation, investigation',
      posting: { initial: 'URBAN', later: 'MIXED' },
      lifestyle: {
        power: 'MODERATE',
        prestige: 'MODERATE',
        workLifeBalance: 'BALANCED',
        transfers: 'MODERATE',
      },
      income: { starting: 800000, atRetirement: 2200000, perksValue: 200000 },
      bestFor: ['Finance interest', 'Stable posting', 'Urban preference'],
    });
    
    // IRS (Customs)
    preferences.push({
      service: CivilServiceType.IRS_CUSTOMS,
      rank: 5,
      probabilityAtCurrentReadiness: 0.0015,
      workProfile: 'Customs enforcement, trade regulation, airport posting',
      posting: { initial: 'MIXED', later: 'URBAN' },
      lifestyle: {
        power: 'MODERATE',
        prestige: 'MODERATE',
        workLifeBalance: 'BALANCED',
        transfers: 'MODERATE',
      },
      income: { starting: 800000, atRetirement: 2200000, perksValue: 300000 },
      bestFor: ['Trade interest', 'Airport cities', 'Enforcement work'],
    });
    
    return preferences;
  }
  
  /**
   * Generate backup plans
   */
  private generateBackupPlans(input: IndiaIntelligenceInput): UPSCBackupPlan[] {
    const plans: UPSCBackupPlan[] = [];
    
    // State PSC
    plans.push({
      option: 'STATE_PSC',
      similarityToUPSC: 'HIGH',
      preparationOverlap: 80,
      fallbackTrigger: 'After 2-3 UPSC attempts without success',
      transitionEffort: 'MINIMAL',
      careerOutcome: 'State-level administrative services with good prestige and power within state',
    });
    
    // Banking
    plans.push({
      option: 'BANK_PO',
      similarityToUPSC: 'MODERATE',
      preparationOverlap: 40,
      fallbackTrigger: 'Need stable income while continuing UPSC preparation',
      transitionEffort: 'MODERATE',
      careerOutcome: 'Banking career with growth to Scale IV/V. Parallel UPSC prep possible.',
    });
    
    // SSC CGL
    plans.push({
      option: 'SSC',
      similarityToUPSC: 'HIGH',
      preparationOverlap: 70,
      fallbackTrigger: 'Want government job with less preparation intensity',
      transitionEffort: 'MINIMAL',
      careerOutcome: 'Central government posts (Assistant, Inspector, etc.) with decent pay and stability',
    });
    
    // Corporate
    plans.push({
      option: 'CORPORATE',
      similarityToUPSC: 'LOW',
      preparationOverlap: 10,
      fallbackTrigger: 'Want to exit government preparation path',
      transitionEffort: 'SIGNIFICANT',
      careerOutcome: 'Private sector career based on your degree. UPSC skills (writing, knowledge) still valuable.',
    });
    
    return plans;
  }
  
  /**
   * Assess risks
   */
  private assessRisks(
    eligibility: UPSCAnalysis['eligibility'],
    readiness: UPSCAnalysis['currentReadiness'],
    input: IndiaIntelligenceInput
  ): UPSCRiskAssessment {
    // Base selection probability
    let selectionProbability = 0.001; // 0.1% base rate
    
    // Adjust for readiness
    if (readiness.overallReadiness === 'STRONG') selectionProbability *= 3;
    if (readiness.overallReadiness === 'READY') selectionProbability *= 2;
    if (readiness.overallReadiness === 'NOT_READY') selectionProbability *= 0.5;
    
    // Adjust for attempts
    selectionProbability *= Math.min(eligibility.attemptsRemaining, 6);
    
    // Cap probability
    selectionProbability = Math.min(selectionProbability, 0.1);
    
    // Calculate opportunity cost
    const yearsInvested = Math.min(eligibility.attemptsRemaining, 6);
    const avgCorporateSalary = 600000;
    const opportunityCost = yearsInvested * avgCorporateSalary;
    
    return {
      selectionProbability,
      timeInvestment: yearsInvested,
      opportunityCost: {
        income: opportunityCost,
        careerProgress: `${yearsInvested} years of corporate experience lost`,
        ageImpact: `Will be ${yearsInvested} years older when entering workforce if unsuccessful`,
      },
      failureScenarios: {
        noSelection: 'Exit to corporate sector or alternative government jobs. UPSC knowledge valuable for content, teaching, policy roles.',
        partialSuccess: 'May get State PSC or lower central services. Still good outcome.',
        healthImpact: 'Mental health strain from repeated attempts. Build support system.',
      },
      mitigationStrategies: [
        'Have clear backup plan from day 1',
        'Set attempt limit (max 4-6) and stick to it',
        'Maintain social connections outside preparation',
        'Build parallel skills (writing, teaching, content creation)',
        'Stay physically active',
      ],
    };
  }
  
  /**
   * Generate final recommendations
   */
  private generateRecommendations(
    eligibility: UPSCAnalysis['eligibility'],
    readiness: UPSCAnalysis['currentReadiness'],
    risks: UPSCRiskAssessment,
    input: IndiaIntelligenceInput
  ): UPSCRecommendation {
    const shouldAttempt = eligibility.ageEligible && 
                         eligibility.attemptsRemaining > 0 &&
                         readiness.overallReadiness !== 'NOT_READY';
    
    let commitmentRequired: UPSCRecommendation['commitmentRequired'] = 'NOT_RECOMMENDED';
    
    if (shouldAttempt) {
      if (risks.selectionProbability > 0.05) {
        commitmentRequired = 'FULL_TIME';
      } else if (risks.selectionProbability > 0.02) {
        commitmentRequired = 'PART_TIME_WITH_BACKUP';
      }
    }
    
    const warnings: string[] = [];
    
    if (risks.selectionProbability < 0.02) {
      warnings.push('Low selection probability. Ensure you have strong backup plans.');
    }
    
    if (input.profile.familyIncome <= EconomicStratum.LOW_INCOME) {
      warnings.push('Financial pressure may be high during preparation period. Consider part-time work or State PSC.');
    }
    
    if (eligibility.attemptsRemaining < 3) {
      warnings.push('Limited attempts remaining. Make each one count.');
    }
    
    return {
      shouldAttempt,
      commitmentRequired,
      optimalStrategy: shouldAttempt 
        ? `Dedicate ${risks.timeInvestment} years with parallel backup preparation. Focus on ${readiness.overallReadiness === 'STRONG' ? 'advanced preparation' : 'foundation building'}.`
        : 'Focus on alternative career paths.',
      timeline: shouldAttempt
        ? `Start preparation now. First attempt in ${new Date().getFullYear() + 1}. Maximum ${eligibility.attemptsRemaining} attempts by age ${this.config.maxAgeGeneral}.`
        : 'Not applicable',
      warnings,
    };
  }
  
  /**
   * Update configuration
   */
  updateConfig(config: Partial<UPSCEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Factory function for UPSC Engine
 */
export function createUPSCConfig(config?: Partial<UPSCEngineConfig>): UPSCEngine {
  return new UPSCEngine(config);
}
