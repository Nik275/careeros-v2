/**
 * India Intelligence - Motivation Model
 *
 * Detects India-specific career motivations from student input:
 * - Stability seeking (government job preference)
 * - Prestige seeking (status, recognition)
 * - Family responsibility (supporting family)
 * - Social mobility (upward class movement)
 * - Public service (serving society)
 * - Wealth creation (financial success)
 * - Entrepreneurship (own business)
 * - Family legacy (continuing tradition)
 *
 * @module intelligence/india-intelligence
 */

import {
  IndiaIntelligenceInput,
  IndiaMotivationAnalysis,
  IndiaCareerMotivation,
  DetectedMotivation,
  MotivationConflict,
  MotivationAlignment,
  EconomicStratum,
  FamilyBusinessInvolvement,
} from './types';

/**
 * Motivation Model Configuration
 */
export interface IndiaMotivationModelConfig {
  /** Minimum confidence to report a motivation */
  minConfidenceThreshold: number;
  /** Consider family context in detection */
  considerFamilyContext: boolean;
  /** Consider economic context in detection */
  considerEconomicContext: boolean;
}

/**
 * Default Motivation Model configuration
 */
export const DEFAULT_MOTIVATION_CONFIG: IndiaMotivationModelConfig = {
  minConfidenceThreshold: 0.4,
  considerFamilyContext: true,
  considerEconomicContext: true,
};

/**
 * India Motivation Model
 *
 * Analyzes student input to detect career motivations
 */
export class IndiaMotivationModel {
  private config: IndiaMotivationModelConfig;

  constructor(config: Partial<IndiaMotivationModelConfig> = {}) {
    this.config = { ...DEFAULT_MOTIVATION_CONFIG, ...config };
  }

  /**
   * Analyze motivations from student input
   */
  analyze(input: IndiaIntelligenceInput): IndiaMotivationAnalysis {
    const detectedMotivations: DetectedMotivation[] = [];

    // Detect each motivation type
    detectedMotivations.push(this.detectStabilitySeeking(input));
    detectedMotivations.push(this.detectPrestigeSeeking(input));
    detectedMotivations.push(this.detectFamilyResponsibility(input));
    detectedMotivations.push(this.detectSocialMobility(input));
    detectedMotivations.push(this.detectPublicService(input));
    detectedMotivations.push(this.detectWealthCreation(input));
    detectedMotivations.push(this.detectEntrepreneurship(input));
    detectedMotivations.push(this.detectFamilyLegacy(input));
    detectedMotivations.push(this.detectGeographicalMobility(input));
    detectedMotivations.push(this.detectStudyAbroad(input));
    detectedMotivations.push(this.detectGiveBackSociety(input));
    detectedMotivations.push(this.detectProveAbility(input));

    // Filter by confidence threshold
    const filteredMotivations = detectedMotivations.filter(
      m => m.confidence >= this.config.minConfidenceThreshold
    );

    // Sort by confidence
    filteredMotivations.sort((a, b) => b.confidence - a.confidence);

    // Identify primary and secondary motivations
    const primaryMotivation = filteredMotivations[0]?.motivation ||
      IndiaCareerMotivation.STABILITY_SEEKING;
    const secondaryMotivations = filteredMotivations
      .slice(1, 4)
      .map(m => m.motivation);

    // Identify conflicts
    const conflicts = this.identifyConflicts(filteredMotivations);

    // Analyze alignment with pathways
    const alignment = this.analyzePathwayAlignment(filteredMotivations);

    return {
      detectedMotivations: filteredMotivations,
      primaryMotivation,
      secondaryMotivations,
      conflicts,
      alignmentWithPathways: alignment,
    };
  }

  /**
   * Detect stability seeking motivation
   */
  private detectStabilitySeeking(input: IndiaIntelligenceInput): DetectedMotivation {
    let confidence = 0.3; // Base confidence
    const evidence: string[] = [];

    // Explicit statements
    if (input.selfAssessment.preferredWorkEnvironment === 'GOVERNMENT') {
      confidence += 0.3;
      evidence.push('Explicitly prefers government work environment');
    }

    if (input.selfAssessment.importanceOfStability >= 4) {
      confidence += 0.2;
      evidence.push('Rates stability as highly important');
    }

    // Economic context
    if (this.config.considerEconomicContext) {
      if (input.profile.familyIncome <= EconomicStratum.LOWER_MIDDLE) {
        confidence += 0.15;
        evidence.push('Lower economic background - stability provides security');
      }
    }

    // Family context
    if (this.config.considerFamilyContext && input.profile.familyDependents > 2) {
      confidence += 0.15;
      evidence.push('Multiple dependents increase need for stable income');
    }

    // Stated preferences
    if (input.statedPreferences.preferredCareers.some(c =>
      c.toLowerCase().includes('government') ||
      c.toLowerCase().includes('upsc') ||
      c.toLowerCase().includes('bank')
    )) {
      confidence += 0.2;
      evidence.push('Interested in government/banking careers');
    }

    return {
      motivation: IndiaCareerMotivation.STABILITY_SEEKING,
      confidence: Math.min(confidence, 1),
      evidence,
      intensity: confidence > 0.7 ? 'HIGH' : confidence > 0.5 ? 'MODERATE' : 'LOW',
    };
  }

  /**
   * Detect prestige seeking motivation
   */
  private detectPrestigeSeeking(input: IndiaIntelligenceInput): DetectedMotivation {
    let confidence = 0.2;
    const evidence: string[] = [];

    if (input.selfAssessment.importanceOfPrestige >= 4) {
      confidence += 0.3;
      evidence.push('Rates prestige as highly important');
    }

    if (input.statedPreferences.preferredCareers.some(c =>
      c.toLowerCase().includes('ias') ||
      c.toLowerCase().includes('doctor') ||
      c.toLowerCase().includes('iit') ||
      c.toLowerCase().includes('engineer')
    )) {
      confidence += 0.25;
      evidence.push('Interested in high-prestige professions (IAS, Doctor, IIT)');
    }

    if (input.profile.academicPerformance.class10Percentage >= 90) {
      confidence += 0.1;
      evidence.push('High academic achiever - may value prestigious outcomes');
    }

    // Family pressure for status
    if (input.profile.familyPressureSources.includes('EXTENDED_FAMILY_OPINION')) {
      confidence += 0.15;
      evidence.push('Extended family opinion matters - social status important');
    }

    return {
      motivation: IndiaCareerMotivation.PRESTIGE_SEEKING,
      confidence: Math.min(confidence, 1),
      evidence,
      intensity: confidence > 0.7 ? 'HIGH' : confidence > 0.5 ? 'MODERATE' : 'LOW',
    };
  }

  /**
   * Detect family responsibility motivation
   */
  private detectFamilyResponsibility(input: IndiaIntelligenceInput): DetectedMotivation {
    let confidence = 0.3;
    const evidence: string[] = [];

    if (input.profile.familyDependents > 0) {
      confidence += 0.25;
      evidence.push(`${input.profile.familyDependents} family members dependent`);
    }

    if (input.profile.familyIncome <= EconomicStratum.LOWER_MIDDLE) {
      confidence += 0.2;
      evidence.push('Economic situation requires family contribution');
    }

    if (input.statedPreferences.preferredMotivations.includes(IndiaCareerMotivation.FAMILY_RESPONSIBILITY)) {
      confidence += 0.25;
      evidence.push('Explicitly states family responsibility as motivation');
    }

    if (input.profile.familyExpectations.length > 0) {
      confidence += 0.1;
      evidence.push('Family expectations are a consideration');
    }

    return {
      motivation: IndiaCareerMotivation.FAMILY_RESPONSIBILITY,
      confidence: Math.min(confidence, 1),
      evidence,
      intensity: confidence > 0.7 ? 'HIGH' : confidence > 0.5 ? 'MODERATE' : 'LOW',
    };
  }

  /**
   * Detect social mobility motivation
   */
  private detectSocialMobility(input: IndiaIntelligenceInput): DetectedMotivation {
    let confidence = 0.2;
    const evidence: string[] = [];

    // Lower stratum aspiring upward
    if (input.profile.familyIncome <= EconomicStratum.LOWER_MIDDLE) {
      confidence += 0.3;
      evidence.push('Lower economic background - seeking upward mobility');
    }

    // First generation aspirations
    if (!input.profile.parentOccupations.father?.toLowerCase().includes('graduate') &&
        !input.profile.parentOccupations.mother?.toLowerCase().includes('graduate')) {
      confidence += 0.2;
      evidence.push('Potential first-generation graduate - social mobility focus');
    }

    if (input.selfAssessment.importanceOfIncome >= 4) {
      confidence += 0.15;
      evidence.push('High importance on income suggests mobility goals');
    }

    return {
      motivation: IndiaCareerMotivation.SOCIAL_MOBILITY,
      confidence: Math.min(confidence, 1),
      evidence,
      intensity: confidence > 0.7 ? 'HIGH' : confidence > 0.5 ? 'MODERATE' : 'LOW',
    };
  }

  /**
   * Detect public service motivation
   */
  private detectPublicService(input: IndiaIntelligenceInput): DetectedMotivation {
    let confidence = 0.2;
    const evidence: string[] = [];

    if (input.statedPreferences.preferredCareers.some(c =>
      c.toLowerCase().includes('ias') ||
      c.toLowerCase().includes('ips') ||
      c.toLowerCase().includes('civil service') ||
      c.toLowerCase().includes('public service')
    )) {
      confidence += 0.35;
      evidence.push('Explicitly interested in civil/public service');
    }

    if (input.selfAssessment.preferredWorkEnvironment === 'GOVERNMENT' &&
        input.selfAssessment.importanceOfPrestige < 4) {
      confidence += 0.2;
      evidence.push('Government preference without prestige focus suggests service motive');
    }

    if (input.statedPreferences.preferredMotivations.includes(IndiaCareerMotivation.PUBLIC_SERVICE)) {
      confidence += 0.25;
      evidence.push('Explicitly states public service motivation');
    }

    return {
      motivation: IndiaCareerMotivation.PUBLIC_SERVICE,
      confidence: Math.min(confidence, 1),
      evidence,
      intensity: confidence > 0.7 ? 'HIGH' : confidence > 0.5 ? 'MODERATE' : 'LOW',
    };
  }

  /**
   * Detect wealth creation motivation
   */
  private detectWealthCreation(input: IndiaIntelligenceInput): DetectedMotivation {
    let confidence = 0.25;
    const evidence: string[] = [];

    if (input.selfAssessment.importanceOfIncome === 5) {
      confidence += 0.3;
      evidence.push('Highest importance on income');
    }

    if (input.statedPreferences.preferredCareers.some(c =>
      c.toLowerCase().includes('business') ||
      c.toLowerCase().includes('startup') ||
      c.toLowerCase().includes('finance') ||
      c.toLowerCase().includes('investment')
    )) {
      confidence += 0.25;
      evidence.push('Interested in high-income careers');
    }

    if (input.selfAssessment.riskTolerance === 'HIGH') {
      confidence += 0.15;
      evidence.push('High risk tolerance associated with wealth creation goals');
    }

    return {
      motivation: IndiaCareerMotivation.WEALTH_CREATION,
      confidence: Math.min(confidence, 1),
      evidence,
      intensity: confidence > 0.7 ? 'HIGH' : confidence > 0.5 ? 'MODERATE' : 'LOW',
    };
  }

  /**
   * Detect entrepreneurship motivation
   */
  private detectEntrepreneurship(input: IndiaIntelligenceInput): DetectedMotivation {
    let confidence = 0.2;
    const evidence: string[] = [];

    if (input.statedPreferences.preferredWorkEnvironment === 'OWN_BUSINESS') {
      confidence += 0.35;
      evidence.push('Explicitly prefers own business environment');
    }

    if (input.statedPreferences.preferredCareers.some(c =>
      c.toLowerCase().includes('entrepreneur') ||
      c.toLowerCase().includes('startup') ||
      c.toLowerCase().includes('business owner')
    )) {
      confidence += 0.3;
      evidence.push('Explicitly interested in entrepreneurship');
    }

    if (input.selfAssessment.riskTolerance === 'HIGH') {
      confidence += 0.2;
      evidence.push('High risk tolerance - essential for entrepreneurship');
    }

    // Family business background
    if (input.profile.familyBusinessInvolvement !== FamilyBusinessInvolvement.NO_BUSINESS) {
      confidence += 0.1;
      evidence.push('Family business exposure may foster entrepreneurial mindset');
    }

    return {
      motivation: IndiaCareerMotivation.ENTREPRENEURSHIP,
      confidence: Math.min(confidence, 1),
      evidence,
      intensity: confidence > 0.7 ? 'HIGH' : confidence > 0.5 ? 'MODERATE' : 'LOW',
    };
  }

  /**
   * Detect family legacy motivation
   */
  private detectFamilyLegacy(input: IndiaIntelligenceInput): DetectedMotivation {
    let confidence = 0.15;
    const evidence: string[] = [];

    if (input.statedPreferences.willingToJoinFamilyBusiness) {
      confidence += 0.3;
      evidence.push('Willing to join family business');
    }

    if (input.profile.familyBusinessInvolvement >= FamilyBusinessInvolvement.MEDIUM_BUSINESS) {
      confidence += 0.25;
      evidence.push('Significant family business to continue');
    }

    if (input.profile.familyPressureSources.includes('CULTURAL_OBLIGATION')) {
      confidence += 0.2;
      evidence.push('Cultural obligation pressure suggests legacy expectations');
    }

    if (input.statedPreferences.preferredMotivations.includes(IndiaCareerMotivation.FAMILY_LEGACY)) {
      confidence += 0.3;
      evidence.push('Explicitly values family legacy');
    }

    return {
      motivation: IndiaCareerMotivation.FAMILY_LEGACY,
      confidence: Math.min(confidence, 1),
      evidence,
      intensity: confidence > 0.7 ? 'HIGH' : confidence > 0.5 ? 'MODERATE' : 'LOW',
    };
  }

  /**
   * Detect geographical mobility motivation
   */
  private detectGeographicalMobility(input: IndiaIntelligenceInput): DetectedMotivation {
    let confidence = 0.2;
    const evidence: string[] = [];

    if (input.profile.canRelocate) {
      confidence += 0.3;
      evidence.push('Willing to relocate for opportunities');
    }

    if (input.statedPreferences.preferredLocations.length > 1) {
      confidence += 0.15;
      evidence.push('Multiple preferred locations');
    }

    if (input.selfAssessment.importanceOfLocation <= 2) {
      confidence += 0.2;
      evidence.push('Location is not a high priority');
    }

    return {
      motivation: IndiaCareerMotivation.GEOGRAPHICAL_MOBILITY,
      confidence: Math.min(confidence, 1),
      evidence,
      intensity: confidence > 0.7 ? 'HIGH' : confidence > 0.5 ? 'MODERATE' : 'LOW',
    };
  }

  /**
   * Detect study abroad motivation
   */
  private detectStudyAbroad(input: IndiaIntelligenceInput): DetectedMotivation {
    let confidence = 0.15;
    const evidence: string[] = [];

    if (input.statedPreferences.willingToStudyAbroad) {
      confidence += 0.4;
      evidence.push('Explicitly willing to study abroad');
    }

    if (input.profile.familyIncome >= EconomicStratum.UPPER_MIDDLE) {
      confidence += 0.15;
      evidence.push('Economic capacity for abroad education');
    }

    return {
      motivation: IndiaCareerMotivation.STUDY_ABROAD,
      confidence: Math.min(confidence, 1),
      evidence,
      intensity: confidence > 0.7 ? 'HIGH' : confidence > 0.5 ? 'MODERATE' : 'LOW',
    };
  }

  /**
   * Detect give back to society motivation
   */
  private detectGiveBackSociety(input: IndiaIntelligenceInput): DetectedMotivation {
    let confidence = 0.15;
    const evidence: string[] = [];

    if (input.statedPreferences.preferredMotivations.includes(IndiaCareerMotivation.GIVE_BACK_SOCIETY)) {
      confidence += 0.4;
      evidence.push('Explicitly wants to give back to society');
    }

    if (input.statedPreferences.preferredCareers.some(c =>
      c.toLowerCase().includes('ngo') ||
      c.toLowerCase().includes('social') ||
      c.toLowerCase().includes('teaching') ||
      c.toLowerCase().includes('rural')
    )) {
      confidence += 0.25;
      evidence.push('Interested in social impact careers');
    }

    return {
      motivation: IndiaCareerMotivation.GIVE_BACK_SOCIETY,
      confidence: Math.min(confidence, 1),
      evidence,
      intensity: confidence > 0.7 ? 'HIGH' : confidence > 0.5 ? 'MODERATE' : 'LOW',
    };
  }

  /**
   * Detect prove ability motivation
   */
  private detectProveAbility(input: IndiaIntelligenceInput): DetectedMotivation {
    let confidence = 0.2;
    const evidence: string[] = [];

    if (input.statedPreferences.preferredMotivations.includes(IndiaCareerMotivation.PROVE_ABILITY)) {
      confidence += 0.4;
      evidence.push('Explicitly motivated by proving abilities');
    }

    if (input.selfAssessment.importanceOfPrestige >= 4 &&
        input.profile.academicPerformance.class10Percentage >= 85) {
      confidence += 0.2;
      evidence.push('High achiever with prestige focus - validation seeking');
    }

    return {
      motivation: IndiaCareerMotivation.PROVE_ABILITY,
      confidence: Math.min(confidence, 1),
      evidence,
      intensity: confidence > 0.7 ? 'HIGH' : confidence > 0.5 ? 'MODERATE' : 'LOW',
    };
  }

  /**
   * Identify conflicts between motivations
   */
  private identifyConflicts(detected: DetectedMotivation[]): MotivationConflict[] {
    const conflicts: MotivationConflict[] = [];

    // Stability vs Entrepreneurship
    const stability = detected.find(m => m.motivation === IndiaCareerMotivation.STABILITY_SEEKING);
    const entrepreneurship = detected.find(m => m.motivation === IndiaCareerMotivation.ENTREPRENEURSHIP);

    if (stability && entrepreneurship && stability.confidence > 0.5 && entrepreneurship.confidence > 0.5) {
      conflicts.push({
        motivation1: IndiaCareerMotivation.STABILITY_SEEKING,
        motivation2: IndiaCareerMotivation.ENTREPRENEURSHIP,
        conflictSeverity: 'SEVERE',
        resolution: 'Consider corporate roles with startup exposure, or build side business while employed',
      });
    }

    // Family Legacy vs Independent Path
    const familyLegacy = detected.find(m => m.motivation === IndiaCareerMotivation.FAMILY_LEGACY);
    const independence = detected.find(m => m.motivation === IndiaCareerMotivation.ENTREPRENEURSHIP);

    if (familyLegacy && independence && familyLegacy.confidence > 0.5 && independence.confidence > 0.5) {
      conflicts.push({
        motivation1: IndiaCareerMotivation.FAMILY_LEGACY,
        motivation2: IndiaCareerMotivation.ENTREPRENEURSHIP,
        conflictSeverity: 'MODERATE',
        resolution: 'Modernize family business or start new venture with family support',
      });
    }

    // Wealth vs Public Service
    const wealth = detected.find(m => m.motivation === IndiaCareerMotivation.WEALTH_CREATION);
    const publicService = detected.find(m => m.motivation === IndiaCareerMotivation.PUBLIC_SERVICE);

    if (wealth && publicService && wealth.confidence > 0.5 && publicService.confidence > 0.5) {
      conflicts.push({
        motivation1: IndiaCareerMotivation.WEALTH_CREATION,
        motivation2: IndiaCareerMotivation.PUBLIC_SERVICE,
        conflictSeverity: 'MILD',
        resolution: 'Civil services offer decent income; or serve society after wealth creation',
      });
    }

    // Prestige vs Social Mobility
    const prestige = detected.find(m => m.motivation === IndiaCareerMotivation.PRESTIGE_SEEKING);
    const mobility = detected.find(m => m.motivation === IndiaCareerMotivation.SOCIAL_MOBILITY);

    if (prestige && mobility && prestige.confidence > 0.6 && mobility.confidence > 0.6) {
      conflicts.push({
        motivation1: IndiaCareerMotivation.PRESTIGE_SEEKING,
        motivation2: IndiaCareerMotivation.SOCIAL_MOBILITY,
        conflictSeverity: 'MILD',
        resolution: 'Prestigious careers often enable social mobility - aligned goals',
      });
    }

    return conflicts;
  }

  /**
   * Analyze alignment of motivations with pathways
   */
  private analyzePathwayAlignment(detected: DetectedMotivation[]): MotivationAlignment[] {
    const alignments: MotivationAlignment[] = [];

    const pathways = [
      'UPSC/Civil Services',
      'Engineering (IT/Software)',
      'Engineering (Core)',
      'Medicine',
      'CA/CS Professional',
      'MBA',
      'Entrepreneurship',
      'Government Jobs (Banking/SSC)',
    ];

    for (const pathway of pathways) {
      const satisfying: IndiaCareerMotivation[] = [];
      const frustrating: IndiaCareerMotivation[] = [];

      // UPSC
      if (pathway === 'UPSC/Civil Services') {
        if (detected.find(m => m.motivation === IndiaCareerMotivation.STABILITY_SEEKING)) satisfying.push(IndiaCareerMotivation.STABILITY_SEEKING);
        if (detected.find(m => m.motivation === IndiaCareerMotivation.PRESTIGE_SEEKING)) satisfying.push(IndiaCareerMotivation.PRESTIGE_SEEKING);
        if (detected.find(m => m.motivation === IndiaCareerMotivation.PUBLIC_SERVICE)) satisfying.push(IndiaCareerMotivation.PUBLIC_SERVICE);
        if (detected.find(m => m.motivation === IndiaCareerMotivation.WEALTH_CREATION)) frustrating.push(IndiaCareerMotivation.WEALTH_CREATION);
        if (detected.find(m => m.motivation === IndiaCareerMotivation.ENTREPRENEURSHIP)) frustrating.push(IndiaCareerMotivation.ENTREPRENEURSHIP);
      }

      // Engineering IT
      if (pathway === 'Engineering (IT/Software)') {
        if (detected.find(m => m.motivation === IndiaCareerMotivation.WEALTH_CREATION)) satisfying.push(IndiaCareerMotivation.WEALTH_CREATION);
        if (detected.find(m => m.motivation === IndiaCareerMotivation.SOCIAL_MOBILITY)) satisfying.push(IndiaCareerMotivation.SOCIAL_MOBILITY);
        if (detected.find(m => m.motivation === IndiaCareerMotivation.GEOGRAPHICAL_MOBILITY)) satisfying.push(IndiaCareerMotivation.GEOGRAPHICAL_MOBILITY);
        if (detected.find(m => m.motivation === IndiaCareerMotivation.PUBLIC_SERVICE)) frustrating.push(IndiaCareerMotivation.PUBLIC_SERVICE);
      }

      // Medicine
      if (pathway === 'Medicine') {
        if (detected.find(m => m.motivation === IndiaCareerMotivation.PRESTIGE_SEEKING)) satisfying.push(IndiaCareerMotivation.PRESTIGE_SEEKING);
        if (detected.find(m => m.motivation === IndiaCareerMotivation.GIVE_BACK_SOCIETY)) satisfying.push(IndiaCareerMotivation.GIVE_BACK_SOCIETY);
        if (detected.find(m => m.motivation === IndiaCareerMotivation.WEALTH_CREATION)) satisfying.push(IndiaCareerMotivation.WEALTH_CREATION);
        if (detected.find(m => m.motivation === IndiaCareerMotivation.ENTREPRENEURSHIP)) frustrating.push(IndiaCareerMotivation.ENTREPRENEURSHIP);
      }

      // Entrepreneurship
      if (pathway === 'Entrepreneurship') {
        if (detected.find(m => m.motivation === IndiaCareerMotivation.ENTREPRENEURSHIP)) satisfying.push(IndiaCareerMotivation.ENTREPRENEURSHIP);
        if (detected.find(m => m.motivation === IndiaCareerMotivation.WEALTH_CREATION)) satisfying.push(IndiaCareerMotivation.WEALTH_CREATION);
        if (detected.find(m => m.motivation === IndiaCareerMotivation.PROVE_ABILITY)) satisfying.push(IndiaCareerMotivation.PROVE_ABILITY);
        if (detected.find(m => m.motivation === IndiaCareerMotivation.STABILITY_SEEKING)) frustrating.push(IndiaCareerMotivation.STABILITY_SEEKING);
        if (detected.find(m => m.motivation === IndiaCareerMotivation.FAMILY_RESPONSIBILITY)) frustrating.push(IndiaCareerMotivation.FAMILY_RESPONSIBILITY);
      }

      const alignmentScore = satisfying.length / (satisfying.length + frustrating.length + 1);

      alignments.push({
        pathway,
        alignmentScore,
        satisfyingMotivations: satisfying,
        frustratingMotivations: frustrating,
      });
    }

    // Sort by alignment score
    alignments.sort((a, b) => b.alignmentScore - a.alignmentScore);

    return alignments;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<IndiaMotivationModelConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Factory function for India Motivation Model
 */
export function createIndiaMotivationModel(
  config?: Partial<IndiaMotivationModelConfig>
): IndiaMotivationModel {
  return new IndiaMotivationModel(config);
}
