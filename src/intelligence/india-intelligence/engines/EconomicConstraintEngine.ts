/**
 * India Intelligence - Economic Constraint Engine
 *
 * Models financial realities and constraints including:
 * - Education affordability across different strata
 * - Student debt capacity and willingness
 * - Opportunity cost calculations
 * - Income urgency factors
 *
 * @module intelligence/india-intelligence
 */

import {
  IndiaIntelligenceInput,
  EconomicConstraintAnalysis,
  EconomicStratum,
  AffordabilityProfile,
  EconomicConstraint,
  EconomicOpportunity,
  EconomicTimeline,
  EconomicRecommendation,
  IndiaExamType,
  MedicalEducationPath,
} from '../types';
import { normalizeLoanToleranceToWillingness } from '../vocabulary';

/**
 * Economic Constraint Engine Configuration
 */
export interface EconomicConstraintEngineConfig {
  /** Consider family dependents in urgency */
  considerDependents: boolean;
  /** Emergency fund requirement months */
  emergencyFundMonths: number;
  /** Maximum recommended loan-to-income ratio */
  maxLoanToIncomeRatio: number;
}

/**
 * Default Economic Constraint Engine configuration
 */
export const DEFAULT_ECONOMIC_CONFIG: EconomicConstraintEngineConfig = {
  considerDependents: true,
  emergencyFundMonths: 6,
  maxLoanToIncomeRatio: 0.5,
};

/**
 * Economic Constraint Engine
 *
 * Analyzes financial constraints and opportunities
 */
export class EconomicConstraintEngine {
  private config: EconomicConstraintEngineConfig;

  constructor(config: Partial<EconomicConstraintEngineConfig> = {}) {
    this.config = { ...DEFAULT_ECONOMIC_CONFIG, ...config };
  }

  /**
   * Analyze economic constraints for a student
   */
  analyze(input: IndiaIntelligenceInput): EconomicConstraintAnalysis {
    // Build affordability profile
    const affordability = this.buildAffordabilityProfile(input);

    // Identify constraints
    const constraints = this.identifyConstraints(input, affordability);

    // Identify opportunities
    const opportunities = this.identifyOpportunities(input, affordability);

    // Build timeline
    const timeline = this.buildTimeline(input, opportunities);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      input,
      affordability,
      constraints,
      opportunities
    );

    return {
      stratum: input.profile.familyIncome,
      affordability,
      constraints,
      opportunities,
      timeline,
      recommendations,
    };
  }

  /**
   * Build affordability profile
   */
  private buildAffordabilityProfile(
    input: IndiaIntelligenceInput
  ): AffordabilityProfile {
    const stratum = input.profile.familyIncome;
    const maxBudget = input.profile.financialConstraints.maxEducationBudget;

    // Determine affordable exams/coaching
    const affordableCoaching: string[] = [];

    if (stratum >= EconomicStratum.UPPER_MIDDLE) {
      affordableCoaching.push('All coaching types including premium');
    } else if (stratum >= EconomicStratum.MIDDLE_CLASS) {
      affordableCoaching.push('Standard coaching (Kota/Hyderabad/Delhi)');
      affordableCoaching.push('Online coaching');
    } else if (stratum >= EconomicStratum.LOWER_MIDDLE) {
      affordableCoaching.push('Local coaching');
      affordableCoaching.push('Online coaching');
      affordableCoaching.push('Self-study with test series');
    } else {
      affordableCoaching.push('Free/ scholarship coaching');
      affordableCoaching.push('Self-study');
      affordableCoaching.push('YouTube/Free resources');
    }

    // Determine affordable colleges
    const affordableColleges: string[] = [];

    if (maxBudget >= 10000000) {
      affordableColleges.push('Private MBBS');
      affordableColleges.push('MBBS Abroad');
      affordableColleges.push('Premium Private Engineering');
    }

    if (maxBudget >= 5000000) {
      affordableColleges.push('Private Engineering (Tier 1)');
      affordableColleges.push('Private Medical (BDS/BAMS)');
    }

    if (maxBudget >= 2000000) {
      affordableColleges.push('Government Engineering (with hostel)');
      affordableColleges.push('State Universities');
    }

    if (maxBudget >= 500000) {
      affordableColleges.push('Government colleges');
      affordableColleges.push('Scholarship-based programs');
    }

    // Loan capacity
    const loanCapacity = this.calculateLoanCapacity(input);

    return {
      maxEducationBudget: maxBudget,
      affordableExamCoaching: affordableCoaching,
      affordableColleges,
      loanCapacity,
      loanWillingness: normalizeLoanToleranceToWillingness(
        input.profile.financialConstraints.loanTolerance
      ),
      familyContribution: this.estimateFamilyContribution(input),
      selfContributionRequired: stratum <= EconomicStratum.LOWER_MIDDLE,
    };
  }

  /**
   * Calculate loan capacity
   */
  private calculateLoanCapacity(input: IndiaIntelligenceInput): number {
    const stratum = input.profile.familyIncome;

    const loanCaps: Record<EconomicStratum, number> = {
      [EconomicStratum.BPL]: 0,
      [EconomicStratum.LOW_INCOME]: 200000,
      [EconomicStratum.LOWER_MIDDLE]: 500000,
      [EconomicStratum.MIDDLE_CLASS]: 1500000,
      [EconomicStratum.UPPER_MIDDLE]: 3000000,
      [EconomicStratum.AFFLUENT]: 5000000,
      [EconomicStratum.WEALTHY]: 10000000,
    };

    // Adjust for loan tolerance
    const toleranceMultiplier: Record<string, number> = {
      'NONE': 0,
      'LOW': 0.5,
      'MEDIUM': 1,
      'HIGH': 1.5,
    };

    const baseLoan = loanCaps[stratum] || 500000;
    const multiplier = toleranceMultiplier[input.profile.financialConstraints.loanTolerance] || 0;

    return baseLoan * multiplier;
  }

  /**
   * Estimate family contribution
   */
  private estimateFamilyContribution(input: IndiaIntelligenceInput): number {
    const stratum = input.profile.familyIncome;

    const contributions: Record<EconomicStratum, number> = {
      [EconomicStratum.BPL]: 0,
      [EconomicStratum.LOW_INCOME]: 100000,
      [EconomicStratum.LOWER_MIDDLE]: 300000,
      [EconomicStratum.MIDDLE_CLASS]: 800000,
      [EconomicStratum.UPPER_MIDDLE]: 1500000,
      [EconomicStratum.AFFLUENT]: 3000000,
      [EconomicStratum.WEALTHY]: 10000000,
    };

    return contributions[stratum] || 300000;
  }

  /**
   * Identify economic constraints
   */
  private identifyConstraints(
    input: IndiaIntelligenceInput,
    affordability: AffordabilityProfile
  ): EconomicConstraint[] {
    const constraints: EconomicConstraint[] = [];

    // Upfront cost constraint
    if (input.profile.financialConstraints.loanTolerance === 'NONE' &&
        affordability.maxEducationBudget < 500000) {
      constraints.push({
        type: 'UPFRONT_COST',
        severity: 'BLOCKING',
        description: 'Limited budget without loan options significantly restricts choices',
        alternatives: [
          'Scholarship-based institutions',
          'Government colleges only',
          'Part-time work + study',
          'Crowdfunding/family support',
        ],
      });
    }

    // Opportunity cost constraint
    if (input.profile.familyDependents > 0) {
      constraints.push({
        type: 'OPPORTUNITY_COST',
        severity: input.profile.familyDependents > 2 ? 'BLOCKING' : 'LIMITING',
        description: `${input.profile.familyDependents} dependents need financial support - extended education delays earning`,
        alternatives: [
          'Shorter duration courses',
          'Earn-while-you-learn programs',
          'Correspondence/distance education',
          'Immediate employment with upskilling',
        ],
      });
    }

    // Ongoing expense constraint
    if (input.profile.familyIncome <= EconomicStratum.LOWER_MIDDLE) {
      constraints.push({
        type: 'ONGOING_EXPENSE',
        severity: 'LIMITING',
        description: 'Limited ability to cover living expenses during education',
        alternatives: [
          'Hostel accommodation (cheaper)',
          'Part-time tutoring',
          'Scholarships covering living expenses',
          'Education near home',
        ],
      });
    }

    // Debt aversion constraint
    if (input.profile.financialConstraints.loanTolerance === 'NONE') {
      constraints.push({
        type: 'DEBT_AVERSION',
        severity: 'LIMITING',
        description: 'Aversion to education loans limits options to affordable choices only',
        alternatives: [
          'Scholarship hunting',
          'Merit-based admissions',
          'Work-study programs',
          'Corporate-sponsored education',
        ],
      });
    }

    // Family dependency constraint
    if (this.config.considerDependents && input.profile.familyDependents > 1) {
      constraints.push({
        type: 'FAMILY_DEPENDENCY',
        severity: input.profile.familyDependents > 3 ? 'BLOCKING' : 'LIMITING',
        description: 'Financial responsibility toward family limits risky career paths',
        alternatives: [
          'Immediate income paths',
          'Government jobs (job security)',
          'Family business',
          'High-probability private jobs',
        ],
      });
    }

    return constraints;
  }

  /**
   * Identify economic opportunities
   */
  private identifyOpportunities(
    input: IndiaIntelligenceInput,
    affordability: AffordabilityProfile
  ): EconomicOpportunity[] {
    const opportunities: EconomicOpportunity[] = [];
    const totalBudget = affordability.maxEducationBudget + affordability.loanCapacity;

    // Government college path
    opportunities.push({
      path: 'Government College (Engineering/Medical)',
      cost: 500000,
      roi: 8,
      timeline: '4-5.5 years',
      accessible: totalBudget >= 500000,
      financialAid: ['Merit scholarships', 'State government schemes', 'Minority scholarships'],
    });

    // CA/CS path
    opportunities.push({
      path: 'CA/CS Professional Course',
      cost: 300000,
      roi: 12,
      timeline: '4-5 years',
      accessible: totalBudget >= 300000,
      financialAid: ['Institute scholarships', 'Articleship stipend', 'Distance learning savings'],
    });

    // Government job path
    opportunities.push({
      path: 'Government Job (SSC/Banking/State PSC)',
      cost: 100000,
      roi: 15,
      timeline: '1-2 years preparation',
      accessible: totalBudget >= 100000,
      financialAid: ['Free coaching for SC/ST/OBC', 'Public library resources', 'Online free resources'],
    });

    // Engineering - Private Tier 1
    if (totalBudget >= 2000000) {
      opportunities.push({
        path: 'Private Engineering (Tier 1)',
        cost: 2000000,
        roi: 4,
        timeline: '4 years',
        accessible: true,
        financialAid: ['Education loans', 'Institute scholarships', 'Corporate scholarships'],
      });
    }

    // MBBS Abroad
    if (totalBudget >= 4000000 && input.statedPreferences.willingToStudyAbroad) {
      opportunities.push({
        path: 'MBBS Abroad (Russia/Philippines)',
        cost: 4000000,
        roi: 5,
        timeline: '6 years',
        accessible: true,
        financialAid: ['Education loans (secured)', 'Family savings', 'Part-time work abroad'],
      });
    }

    // Skill-based short courses
    opportunities.push({
      path: 'Short-term Skill Courses + Immediate Employment',
      cost: 50000,
      roi: 20,
      timeline: '6-12 months',
      accessible: totalBudget >= 50000,
      financialAid: ['NSDC schemes', 'Skill India programs', 'Corporate training programs'],
    });

    return opportunities;
  }

  /**
   * Build economic timeline
   */
  private buildTimeline(
    input: IndiaIntelligenceInput,
    opportunities: EconomicOpportunity[]
  ): EconomicTimeline {
    const stratum = input.profile.familyIncome;

    // Years to financial independence
    let yearsToIndependence: number;
    switch (stratum) {
      case EconomicStratum.BPL:
      case EconomicStratum.LOW_INCOME:
        yearsToIndependence = 1; // Urgent need
        break;
      case EconomicStratum.LOWER_MIDDLE:
        yearsToIndependence = 3;
        break;
      case EconomicStratum.MIDDLE_CLASS:
        yearsToIndependence = 5;
        break;
      default:
        yearsToIndependence = 7;
    }

    // Years to family support capability
    const yearsToFamilySupport = yearsToIndependence + 2;

    // Critical earning points
    const criticalEarningPoints: EconomicTimeline['criticalEarningPoints'] = [];

    if (input.profile.familyDependents > 0) {
      criticalEarningPoints.push({
        age: this.estimateAge(input) + 1,
        need: 'Contribute to family expenses',
        amount: 5000 * input.profile.familyDependents, // Monthly
      });
    }

    criticalEarningPoints.push({
      age: this.estimateAge(input) + yearsToIndependence,
      need: 'Full financial independence',
      amount: 30000, // Monthly
    });

    if (input.profile.familyDependents > 1) {
      criticalEarningPoints.push({
        age: this.estimateAge(input) + yearsToFamilySupport,
        need: 'Support family significantly',
        amount: 50000, // Monthly
      });
    }

    return {
      yearsToFinancialIndependence: yearsToIndependence,
      yearsToFamilySupportCapability: yearsToFamilySupport,
      criticalEarningPoints,
    };
  }

  /**
   * Estimate age from education level
   */
  private estimateAge(input: IndiaIntelligenceInput): number {
    const ageMap: Record<string, number> = {
      'SCHOOL_10': 15,
      'SCHOOL_12': 17,
      'UNDERGRAD': 20,
      'POSTGRAD': 24,
      'WORKING': 24,
    };
    return ageMap[input.profile.currentEducationLevel] || 22;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    input: IndiaIntelligenceInput,
    affordability: AffordabilityProfile,
    constraints: EconomicConstraint[],
    opportunities: EconomicOpportunity[]
  ): EconomicRecommendation {
    // Filter viable paths
    const viablePaths = opportunities
      .filter(o => o.accessible)
      .sort((a, b) => b.roi - a.roi)
      .map(o => o.path);

    // Scholarship targets
    const scholarshipTargets: string[] = [];

    if (input.profile.academicPerformance.class10Percentage >= 90) {
      scholarshipTargets.push('Institute merit scholarships');
      scholarshipTargets.push('Corporate scholarship programs');
    }

    if (input.profile.familyIncome <= EconomicStratum.LOWER_MIDDLE) {
      scholarshipTargets.push('Government post-matric scholarships');
      scholarshipTargets.push('Minority welfare schemes');
    }

    scholarshipTargets.push('NSF Scholarship');
    scholarshipTargets.push('Prime Minister\'s Scholarship Scheme');

    // Loan strategy
    let loanStrategy = '';
    if (affordability.loanWillingness === 'NONE') {
      loanStrategy = 'No loans - focus on affordable options and scholarships';
    } else if (affordability.loanCapacity > 0) {
      loanStrategy = `Education loan up to ₹${(affordability.loanCapacity / 100000).toFixed(1)}L from nationalized banks. Look for collateral-free options under ₹4L.`;
    }

    // Earning while learning
    const earningOptions: string[] = [];

    if (input.profile.currentEducationLevel === 'UNDERGRAD') {
      earningOptions.push('Part-time tutoring (₹5-15K/month)');
      earningOptions.push('Internships (₹10-20K/month)');
    }

    earningOptions.push('Freelancing in your skill area');
    earningOptions.push('Content creation/educational YouTube');

    // Urgency level
    let urgencyLevel: EconomicRecommendation['urgencyLevel'] = 'FLEXIBLE';

    if (constraints.some(c => c.severity === 'BLOCKING')) {
      urgencyLevel = 'IMMEDIATE';
    } else if (input.profile.familyIncome <= EconomicStratum.LOWER_MIDDLE) {
      urgencyLevel = 'MODERATE';
    }

    return {
      financiallyViablePaths: viablePaths,
      scholarshipTargets,
      loanStrategy,
      earningWhileLearning: earningOptions,
      urgencyLevel,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<EconomicConstraintEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Factory function for Economic Constraint Engine
 */
export function createEconomicConstraintEngine(
  config?: Partial<EconomicConstraintEngineConfig>
): EconomicConstraintEngine {
  return new EconomicConstraintEngine(config);
}
