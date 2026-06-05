/**
 * India Intelligence - Family Business Engine
 *
 * Models family business dynamics including:
 * - Succession planning and decisions
 * - Family expectations and pressure
 * - Business modernization potential
 * - Integration vs Independent path analysis
 *
 * @module intelligence/india-intelligence
 */

import {
  IndiaIntelligenceInput,
  FamilyBusinessAnalysis,
  FamilyBusinessContext,
  FamilyBusinessIntegration,
  IndependentPathAnalysis,
  FamilyPressureAssessment,
  FamilyBusinessRecommendation,
  FamilyBusinessInvolvement,
  FamilyPressureSource,
  IndiaCareerMotivation,
} from '../types';

/**
 * Family Business Engine Configuration
 */
export interface FamilyBusinessEngineConfig {
  /** Consider family pressure in recommendations */
  considerFamilyPressure: boolean;
  /** Weight for business growth potential */
  growthPotentialWeight: number;
  /** Weight for student interest */
  studentInterestWeight: number;
}

/**
 * Default Family Business Engine configuration
 */
export const DEFAULT_FAMILY_BUSINESS_CONFIG: FamilyBusinessEngineConfig = {
  considerFamilyPressure: true,
  growthPotentialWeight: 0.3,
  studentInterestWeight: 0.4,
};

/**
 * Family Business Engine
 *
 * Analyzes family business dynamics and generates recommendations
 */
export class FamilyBusinessEngine {
  private config: FamilyBusinessEngineConfig;

  constructor(config: Partial<FamilyBusinessEngineConfig> = {}) {
    this.config = { ...DEFAULT_FAMILY_BUSINESS_CONFIG, ...config };
  }

  /**
   * Analyze family business context for a student
   */
  analyze(
    input: IndiaIntelligenceInput,
    familyBusinessContext: FamilyBusinessContext
  ): FamilyBusinessAnalysis {
    // Analyze business profile
    const businessProfile = this.analyzeBusinessProfile(familyBusinessContext);

    // Analyze succession
    const succession = this.analyzeSuccession(familyBusinessContext, input);

    // Generate integration options
    const integrationOptions = this.generateIntegrationOptions(
      familyBusinessContext,
      input
    );

    // Analyze independent path
    const independentPath = this.analyzeIndependentPath(
      familyBusinessContext,
      input
    );

    // Assess pressure
    const pressureAssessment = this.assessPressure(familyBusinessContext, input);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      familyBusinessContext,
      businessProfile,
      succession,
      independentPath,
      pressureAssessment,
      input
    );

    return {
      businessProfile,
      succession,
      integrationOptions,
      independentPath,
      pressureAssessment,
      recommendations,
    };
  }

  /**
   * Analyze business profile
   */
  private analyzeBusinessProfile(
    context: FamilyBusinessContext
  ): FamilyBusinessAnalysis['businessProfile'] {
    let growthStage: 'STARTUP' | 'GROWTH' | 'MATURE' | 'DECLINE' = 'MATURE';

    if (context.employeeCount && context.employeeCount < 10) {
      growthStage = 'STARTUP';
    } else if (context.modernizationPotential === 'HIGH') {
      growthStage = 'GROWTH';
    } else if (context.growthProspects === 'LOW') {
      growthStage = 'DECLINE';
    }

    return {
      industry: context.businessType,
      size: context.businessSize,
      growthStage,
      modernizationNeed: context.modernizationPotential,
    };
  }

  /**
   * Analyze succession situation
   */
  private analyzeSuccession(
    context: FamilyBusinessContext,
    input: IndiaIntelligenceInput
  ): FamilyBusinessAnalysis['succession'] {
    const defined = context.successionPlan === 'DEFINED';

    let studentPosition: 'SOLE_HEIR' | 'CO_HEIR' | 'EMPLOYEE' | 'UNDEFINED' =
      'UNDEFINED';

    if (defined) {
      studentPosition =
        context.studentRoleIfJoining === 'OWNER' ? 'SOLE_HEIR' : 'CO_HEIR';
    } else if (context.parentsExpectStudentToJoin) {
      studentPosition = 'EMPLOYEE';
    }

    const timelineToLeadership =
      context.growthProspects === 'HIGH' ? 5 : context.growthProspects === 'MODERATE' ? 10 : 15;

    return {
      defined,
      studentPosition,
      timelineToLeadership,
      preparationRequired: this.generatePreparationRequirements(context),
      challenges: this.identifySuccessionChallenges(context, input),
      opportunities: this.identifySuccessionOpportunities(context),
    };
  }

  /**
   * Generate preparation requirements
   */
  private generatePreparationRequirements(
    context: FamilyBusinessContext
  ): string[] {
    const requirements: string[] = [];

    requirements.push('Understanding business operations end-to-end');
    requirements.push('Building relationships with key employees and stakeholders');
    requirements.push('Developing industry-specific knowledge');

    if (context.modernizationPotential === 'HIGH' || context.modernizationPotential === 'CRITICAL') {
      requirements.push('Digital transformation skills');
      requirements.push('Modern management education (MBA recommended)');
    }

    if (context.businessSize === FamilyBusinessInvolvement.MEDIUM_BUSINESS ||
        context.businessSize === FamilyBusinessInvolvement.LARGE_BUSINESS) {
      requirements.push('Financial management and fundraising skills');
      requirements.push('Strategic planning capabilities');
    }

    return requirements;
  }

  /**
   * Identify succession challenges
   */
  private identifySuccessionChallenges(
    context: FamilyBusinessContext,
    input: IndiaIntelligenceInput
  ): string[] {
    const challenges: string[] = [];

    if (context.successionPlan === 'UNDEFINED') {
      challenges.push('Unclear succession plan creates uncertainty');
    }

    if (context.studentRoleIfJoining === 'UNDECIDED') {
      challenges.push('Undefined role upon joining');
    }

    if (context.modernizationPotential === 'CRITICAL') {
      challenges.push('Business needs urgent modernization - high pressure');
    }

    if (input.statedPreferences.preferredMotivations.includes(IndiaCareerMotivation.ENTREPRENEURSHIP)) {
      challenges.push('Your independent entrepreneurial drive may conflict with family business structure');
    }

    return challenges;
  }

  /**
   * Identify succession opportunities
   */
  private identifySuccessionOpportunities(
    context: FamilyBusinessContext
  ): string[] {
    const opportunities: string[] = [];

    if (context.growthProspects === 'HIGH') {
      opportunities.push('Growing business offers expansion opportunities');
    }

    if (context.modernizationPotential === 'HIGH') {
      opportunities.push('Your skills can drive business transformation');
      opportunities.push('Opportunity to build something significant');
    }

    if (context.businessSize === FamilyBusinessInvolvement.LARGE_BUSINESS ||
        context.businessSize === FamilyBusinessInvolvement.FAMILY_EMPIRE) {
      opportunities.push('Established platform to launch from');
      opportunities.push('Access to capital and networks');
    }

    return opportunities;
  }

  /**
   * Generate integration options
   */
  private generateIntegrationOptions(
    context: FamilyBusinessContext,
    input: IndiaIntelligenceInput
  ): FamilyBusinessIntegration[] {
    const options: FamilyBusinessIntegration[] = [];

    // Full-time joining
    options.push({
      model: 'FULL_TIME',
      timeline: 'Immediate after education',
      role: context.studentRoleIfJoining === 'OWNER' ? 'Junior Management / Future Leader' : 'Employee / Manager',
      valueAdd: 'Full dedication to business growth',
      challenges: [
        'Limited external experience',
        'Family dynamics in workplace',
        'Pressure to perform',
      ],
      benefits: [
        'Fast-track leadership',
        'Family support',
        'Established platform',
        'Job security',
      ],
    });

    // Part-time involvement
    if (input.profile.currentEducationLevel === 'UNDERGRAD' ||
        input.profile.currentEducationLevel === 'POSTGRAD') {
      options.push({
        model: 'PART_TIME',
        timeline: 'During studies',
        role: 'Intern / Project Contributor',
        valueAdd: 'Bring fresh ideas while learning',
        challenges: [
          'Time management with studies',
          'Limited impact',
          'Family expectations of more involvement',
        ],
        benefits: [
          'Learn business while studying',
          'Build credibility',
          'Test interest',
          'Flexible commitment',
        ],
      });
    }

    // Hybrid path
    options.push({
      model: 'HYBRID',
      timeline: 'After 2-3 years external experience',
      role: 'Experienced Hire with Family Premium',
      valueAdd: 'External perspective + Family commitment',
      challenges: [
        'Delayed family business entry',
        'May lose succession position',
        'Parents may not understand',
      ],
      benefits: [
        'External credibility',
        'Broader skills',
        'Better negotiation position',
        'Professional network',
      ],
    });

    // Later entry
    options.push({
      model: 'LATER',
      timeline: 'After 5+ years external career',
      role: 'Senior Leader / CEO Material',
      valueAdd: 'Proven track record from outside',
      challenges: [
        'May miss succession window',
        'Need to prove yourself again',
        'Parents may retire before you join',
      ],
      benefits: [
        'Maximum external experience',
        'Lead from position of strength',
        'Independent identity',
        'Better compensation negotiation',
      ],
    });

    return options;
  }

  /**
   * Analyze independent path
   */
  private analyzeIndependentPath(
    context: FamilyBusinessContext,
    input: IndiaIntelligenceInput
  ): IndependentPathAnalysis {
    // Assess feasibility
    let feasibility: 'HIGH' | 'MODERATE' | 'LOW' = 'MODERATE';

    if (input.profile.familyIncome >= 'MIDDLE_CLASS' &&
        input.statedPreferences.preferredMotivations.includes(IndiaCareerMotivation.ENTREPRENEURSHIP)) {
      feasibility = 'HIGH';
    } else if (context.pressureLevel === 'HIGH' || context.pressureLevel === 'EXTREME') {
      feasibility = 'LOW';
    }

    // Assess family support
    let familySupport: 'FULL' | 'PARTIAL' | 'NONE' = 'PARTIAL';

    if (!context.parentsExpectStudentToJoin) {
      familySupport = 'FULL';
    } else if (context.pressureLevel === 'EXTREME') {
      familySupport = 'NONE';
    }

    // Assess financial independence
    let financialIndependence: 'ACHIEVED' | 'PARTIAL' | 'DEPENDENT' = 'DEPENDENT';

    if (input.profile.familyIncome >= 'UPPER_MIDDLE') {
      financialIndependence = 'ACHIEVED';
    } else if (input.profile.familyIncome >= 'MIDDLE_CLASS') {
      financialIndependence = 'PARTIAL';
    }

    // Assess guilt factor
    let guiltFactor: 'HIGH' | 'MODERATE' | 'LOW' = 'MODERATE';

    if (context.pressureLevel === 'HIGH' || context.pressureLevel === 'EXTREME') {
      guiltFactor = 'HIGH';
    } else if (!context.parentsExpectStudentToJoin) {
      guiltFactor = 'LOW';
    }

    return {
      feasibility,
      familySupport,
      financialIndependence,
      guiltFactor,
      longTermRelationsImpact: this.assessRelationsImpact(context, input),
    };
  }

  /**
   * Assess long-term relations impact
   */
  private assessRelationsImpact(
    context: FamilyBusinessContext,
    input: IndiaIntelligenceInput
  ): string {
    if (!context.parentsExpectStudentToJoin) {
      return 'Minimal impact - parents supportive of independent path';
    }

    if (context.pressureLevel === 'EXTREME') {
      return 'Significant strain possible - family may see it as betrayal. Requires careful communication.';
    }

    if (context.businessSize === FamilyBusinessInvolvement.SMALL_BUSINESS) {
      return 'Moderate impact initially, but family will likely accept if you succeed independently';
    }

    return 'Depends on how you communicate. Success in independent career heals most tensions';
  }

  /**
   * Assess family pressure
   */
  private assessPressure(
    context: FamilyBusinessContext,
    input: IndiaIntelligenceInput
  ): FamilyPressureAssessment {
    const sources: FamilyPressureSource[] = [];

    if (context.parentsExpectStudentToJoin) {
      sources.push(FamilyPressureSource.PARENT_EXPECTATION);
    }

    if (context.businessSize >= FamilyBusinessInvolvement.MEDIUM_BUSINESS) {
      sources.push(FamilyPressureSource.COMMUNITY_PRESSURE);
    }

    if (input.profile.familyDependents > 2) {
      sources.push(FamilyPressureSource.FINANCIAL_DEPENDENCY);
    }

    if (context.successionPlan === 'DEFINED') {
      sources.push(FamilyPressureSource.CULTURAL_OBLIGATION);
    }

    // Identify manipulative tactics
    const manipulativeTactics: string[] = [];

    if (context.pressureLevel === 'HIGH' || context.pressureLevel === 'EXTREME') {
      manipulativeTactics.push('Emotional appeals about family legacy');
      manipulativeTactics.push('Comparisons with relatives who joined family business');
      manipulativeTactics.push('Guilt about parental sacrifices');
    }

    // Cultural obligations
    const culturalObligations: string[] = [];

    if (context.businessSize >= FamilyBusinessInvolvement.LARGE_BUSINESS) {
      culturalObligations.push('Carrying forward family name');
    }

    if (input.profile.familyDependents > 0) {
      culturalObligations.push('Responsibility toward family');
    }

    // Resistance strategies
    const resistanceStrategies: string[] = [];

    resistanceStrategies.push('Demonstrate success in chosen path');
    resistanceStrategies.push('Maintain regular communication with family');
    resistanceStrategies.push('Offer to help business in advisory capacity');
    resistanceStrategies.push('Show appreciation for business legacy');

    if (context.modernizationPotential === 'HIGH') {
      resistanceStrategies.push('Position independent career as bringing skills that can later help business');
    }

    return {
      sources,
      intensity: context.pressureLevel,
      manipulativeTactics,
      culturalObligations,
      resistanceStrategies,
    };
  }

  /**
   * Generate final recommendations
   */
  private generateRecommendations(
    context: FamilyBusinessContext,
    businessProfile: FamilyBusinessAnalysis['businessProfile'],
    succession: FamilyBusinessAnalysis['succession'],
    independentPath: IndependentPathAnalysis,
    pressure: FamilyPressureAssessment,
    input: IndiaIntelligenceInput
  ): FamilyBusinessRecommendation {
    let optimalPath: FamilyBusinessRecommendation['optimalPath'] = 'UNDECIDED';

    // Decision logic
    const joinScore =
      (context.studentInterestInJoining === 'HIGH' ? 3 : context.studentInterestInJoining === 'MODERATE' ? 2 : 0) +
      (businessProfile.growthStage === 'GROWTH' ? 2 : 0) +
      (context.growthProspects === 'HIGH' ? 2 : 0) +
      (pressure.intensity === 'EXTREME' ? 1 : 0);

    const independentScore =
      (input.statedPreferences.preferredMotivations.includes(IndiaCareerMotivation.ENTREPRENEURSHIP) ? 2 : 0) +
      (independentPath.feasibility === 'HIGH' ? 2 : 0) +
      (context.studentInterestInJoining === 'NONE' || context.studentInterestInJoining === 'LOW' ? 2 : 0) +
      (businessProfile.growthStage === 'DECLINE' ? 2 : 0);

    if (joinScore >= independentScore + 2) {
      optimalPath = 'JOIN_NOW';
    } else if (independentScore >= joinScore + 2) {
      optimalPath = 'INDEPENDENT';
    } else if (joinScore > independentScore) {
      optimalPath = 'JOIN_LATER';
    } else {
      optimalPath = 'HYBRID';
    }

    // Generate rationale
    const rationale: string[] = [];

    if (optimalPath === 'JOIN_NOW') {
      rationale.push('Your interest in the business aligns with family expectations');
      if (businessProfile.growthStage === 'GROWTH') {
        rationale.push('Growing business offers significant opportunities');
      }
    } else if (optimalPath === 'INDEPENDENT') {
      rationale.push('Your entrepreneurial drive is better served outside family business');
      rationale.push('External experience will build credibility for future decisions');
    } else if (optimalPath === 'JOIN_LATER') {
      rationale.push('External experience first, then bring value to family business');
    } else {
      rationale.push('Balanced approach maintains family relations while pursuing growth');
    }

    // Generate negotiation points
    const negotiationPoints: string[] = [];

    if (optimalPath === 'HYBRID' || optimalPath === 'JOIN_LATER') {
      negotiationPoints.push('Propose 2-3 years external experience before joining');
      negotiationPoints.push('Promise to maintain involvement as advisor/consultant');
      negotiationPoints.push('Show how external skills will help modernize business');
    }

    if (optimalPath === 'INDEPENDENT') {
      negotiationPoints.push('Express gratitude for business legacy');
      negotiationPoints.push('Commit to supporting siblings/cousins who join');
      negotiationPoints.push('Offer to consult on digital/modernization aspects');
    }

    return {
      optimalPath,
      rationale,
      negotiationPoints,
      timeline: this.generateTimeline(optimalPath),
      preparationActions: this.generatePreparationActions(optimalPath, context),
    };
  }

  /**
   * Generate timeline for recommendation
   */
  private generateTimeline(
    path: FamilyBusinessRecommendation['optimalPath']
  ): string {
    switch (path) {
      case 'JOIN_NOW':
        return 'Join immediately after completing education';
      case 'JOIN_LATER':
        return 'Gain 2-4 years external experience, then join';
      case 'HYBRID':
        return 'Start part-time involvement now, transition to full-time in 3-5 years';
      case 'INDEPENDENT':
        return 'Pursue independent career, maintain family connection';
      default:
        return 'Decision pending - gather more information';
    }
  }

  /**
   * Generate preparation actions
   */
  private generatePreparationActions(
    path: FamilyBusinessRecommendation['optimalPath'],
    context: FamilyBusinessContext
  ): string[] {
    const actions: string[] = [];

    if (path === 'JOIN_NOW' || path === 'JOIN_LATER' || path === 'HYBRID') {
      actions.push('Study business operations during breaks');
      actions.push('Build relationships with key employees');
      actions.push('Learn industry-specific regulations');

      if (context.modernizationPotential === 'HIGH' || context.modernizationPotential === 'CRITICAL') {
        actions.push('Pursue MBA or management education');
        actions.push('Learn digital transformation skills');
      }
    }

    if (path === 'INDEPENDENT' || path === 'HYBRID') {
      actions.push('Build independent financial base');
      actions.push('Develop professional network outside family');
      actions.push('Maintain open communication with family');
    }

    return actions;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<FamilyBusinessEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Factory function for Family Business Engine
 */
export function createFamilyBusinessEngine(
  config?: Partial<FamilyBusinessEngineConfig>
): FamilyBusinessEngine {
  return new FamilyBusinessEngine(config);
}
