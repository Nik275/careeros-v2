/**
 * CareerOS Student Profile Generator - Profile Synthesizer
 *
 * Phase B.3: Profile Generation Layer
 *
 * Synthesizes dimension scores into structured profile components.
 *
 * @module profile-synthesizer
 * @version 1.0.0
 */

import type {
  StudentLifeProfile,
  CognitiveProfile,
  MotivationProfile,
  LifestyleProfile,
  RiskProfile,
  WorkEnvironmentProfile,
  ValuesProfile,
  StrengthProfile,
  WeaknessProfile,
  ConstraintsProfile,
} from '../types/student-life-profile';

import type {
  AssessmentResult,
  ProfileGenerationConfig,
} from './profile-types';

/**
 * Synthesizes assessment results into profile components.
 *
 * Maps dimension scores to structured profile sections using
 * deterministic rules and weighted calculations.
 */
export class ProfileSynthesizer {
  /**
   * Synthesize CognitiveProfile from assessment results.
   */
  synthesizeCognitiveProfile(result: AssessmentResult): CognitiveProfile {
    const getScore = (dimension: string): number =>
      this.getDimensionScore(result, dimension);

    return {
      analytical: getScore('analyticalThinking'),
      creative: getScore('creativity'),
      systematic: getScore('systematicProcessing'),
      abstractThinking: getScore('abstractReasoning'),
      verbalReasoning: Math.round(
        (getScore('socialOrientation') + getScore('communicationStyle')) / 2
      ),
      spatialReasoning: Math.round(
        (getScore('creativity') + getScore('patternRecognition')) / 2
      ),
      quantitativeReasoning: getScore('analyticalThinking'),
    };
  }

  /**
   * Synthesize MotivationProfile from assessment results.
   */
  synthesizeMotivationProfile(result: AssessmentResult): MotivationProfile {
    const getScore = (dimension: string): number =>
      this.getDimensionScore(result, dimension);

    return {
      achievement: getScore('achievementDrive'),
      mastery: getScore('masteryOrientation'),
      autonomy: getScore('autonomyNeed'),
      impact: getScore('purposeAlignment'),
      recognition: getScore('recognitionDrive'),
      security: getScore('securityNeed'),
    };
  }

  /**
   * Synthesize LifestyleProfile from assessment results.
   */
  synthesizeLifestyleProfile(result: AssessmentResult): LifestyleProfile {
    const getScore = (dimension: string): number =>
      this.getDimensionScore(result, dimension);

    return {
      workLifeBalance: getScore('workLifeIntegration'),
      incomePriority: Math.round(
        (getScore('achievementDrive') + getScore('extrinsicValues')) / 2
      ),
      locationFreedom: getScore('locationPreference'),
      travelPreference: getScore('riskTolerance'),
      stabilityPreference: getScore('stabilityPreference'),
    };
  }

  /**
   * Synthesize RiskProfile from assessment results.
   */
  synthesizeRiskProfile(result: AssessmentResult): RiskProfile {
    const getScore = (dimension: string): number =>
      this.getDimensionScore(result, dimension);

    return {
      careerRiskTolerance: getScore('careerRiskTolerance'),
      financialRiskTolerance: getScore('financialRiskTolerance'),
      uncertaintyComfort: getScore('ambiguityTolerance'),
    };
  }

  /**
   * Synthesize WorkEnvironmentProfile from assessment results.
   */
  synthesizeWorkEnvironmentProfile(result: AssessmentResult): WorkEnvironmentProfile {
    const getScore = (dimension: string): number =>
      this.getDimensionScore(result, dimension);

    return {
      peopleOriented: getScore('socialOrientation'),
      independentWork: getScore('independencePreference'),
      leadershipPreference: getScore('influenceOrientation'),
      researchPreference: getScore('creativeProblemSolving'),
      executionPreference: getScore('achievementDrive'),
    };
  }

  /**
   * Synthesize ValuesProfile from assessment results.
   */
  synthesizeValuesProfile(result: AssessmentResult): ValuesProfile {
    const getScore = (dimension: string): number =>
      this.getDimensionScore(result, dimension);

    return {
      money: getScore('extrinsicValues'),
      prestige: Math.round(
        (getScore('recognitionDrive') + getScore('leadership')) / 2
      ),
      familyTime: getScore('socialValues'),
      freedom: getScore('autonomyNeed'),
      impact: getScore('impactValues'),
      learning: getScore('growthValues'),
    };
  }

  /**
   * Identify strengths from dimension scores.
   */
  identifyStrengths(
    result: AssessmentResult,
    config: ProfileGenerationConfig
  ): StrengthProfile {
    const scores = Array.from(result.dimensionScores.entries());

    // Sort by score descending
    scores.sort((a, b) => b[1].score - a[1].score);

    // Map dimensions to strength names
    const strengthMap: Record<string, string> = {
      analyticalThinking: 'Analytical Thinking',
      abstractReasoning: 'Abstract Reasoning',
      creativeProblemSolving: 'Creative Problem Solving',
      systematicProcessing: 'Systematic Processing',
      patternRecognition: 'Pattern Recognition',
      criticalEvaluation: 'Critical Evaluation',
      achievementDrive: 'Achievement Drive',
      masteryOrientation: 'Mastery Orientation',
      autonomyNeed: 'Independence',
      purposeAlignment: 'Purpose-Driven',
      recognitionDrive: 'Recognition Seeking',
      securityNeed: 'Consistency & Reliability',
      intrinsicValues: 'Intrinsic Motivation',
      extrinsicValues: 'Results-Oriented',
      socialValues: 'Relationship-Focused',
      growthValues: 'Growth-Oriented',
      stabilityValues: 'Stability-Seeking',
      impactValues: 'Impact-Driven',
      workLifeIntegration: 'Work-Life Balance Aware',
      flexibilityNeed: 'Flexibility-Oriented',
      locationPreference: 'Location-Flexible',
      pacePreference: 'High-Energy',
      stabilityPreference: 'Steady & Consistent',
      careerRiskTolerance: 'Risk-Tolerant',
      financialRiskTolerance: 'Financially Adventurous',
      ambiguityTolerance: 'Comfortable with Ambiguity',
      failureRecovery: 'Resilient',
      uncertaintyComfort: 'Uncertainty-Comfortable',
      independencePreference: 'Independently-Minded',
      collaborationPreference: 'Collaborative',
      structureNeed: 'Structure-Seeking',
      varietyNeed: 'Variety-Seeking',
      environmentSensitivity: 'Environmentally Aware',
      influenceOrientation: 'Influence-Oriented',
      decisionComfort: 'Decisive',
      responsibilityCapacity: 'Responsibility-Ready',
      visionCapability: 'Visionary',
      teamOrientation: 'Team-Focused',
      socialEnergy: 'Socially Energized',
      empathyLevel: 'Empathetic',
      communicationStyle: 'Communicative',
      relationshipImportance: 'Relationship-Focused',
      conflictApproach: 'Direct in Conflict',
      explorationOpenness: 'Open to Exploration',
      industryInterest: 'Industry-Curious',
      roleCuriosity: 'Role-Curious',
      careerAwareness: 'Career-Aware',
    };

    const topStrengths = scores
      .slice(0, config.primaryStrengthCount)
      .map(([dimension]) => strengthMap[dimension] ?? dimension);

    const supportingStrengths = scores
      .slice(
        config.primaryStrengthCount,
        config.primaryStrengthCount + config.secondaryStrengthCount
      )
      .map(([dimension]) => strengthMap[dimension] ?? dimension);

    return {
      topStrengths,
      supportingStrengths,
    };
  }

  /**
   * Identify weaknesses/development areas from dimension scores.
   */
  identifyWeaknesses(
    result: AssessmentResult,
    config: ProfileGenerationConfig
  ): WeaknessProfile {
    const scores = Array.from(result.dimensionScores.entries());

    // Sort by score ascending (lowest first)
    scores.sort((a, b) => a[1].score - b[1].score);

    // Map dimensions to development area names
    const developmentMap: Record<string, string> = {
      analyticalThinking: 'Structured Analysis',
      abstractReasoning: 'Abstract Thinking',
      creativeProblemSolving: 'Creative Problem Solving',
      systematicProcessing: 'Systematic Approach',
      patternRecognition: 'Pattern Recognition',
      criticalEvaluation: 'Critical Evaluation',
      achievementDrive: 'Drive & Ambition',
      masteryOrientation: 'Skill Mastery',
      autonomyNeed: 'Self-Direction',
      purposeAlignment: 'Purpose Alignment',
      recognitionDrive: 'Seeking Recognition',
      securityNeed: 'Security Orientation',
      intrinsicValues: 'Intrinsic Motivation',
      extrinsicValues: 'External Motivation',
      socialValues: 'Social Connection',
      growthValues: 'Growth Mindset',
      stabilityValues: 'Stability Preference',
      impactValues: 'Impact Orientation',
      workLifeIntegration: 'Work-Life Balance',
      flexibilityNeed: 'Flexibility',
      locationPreference: 'Location Flexibility',
      pacePreference: 'Work Pace Adaptability',
      stabilityPreference: 'Consistency',
      careerRiskTolerance: 'Career Risk Comfort',
      financialRiskTolerance: 'Financial Risk Comfort',
      ambiguityTolerance: 'Ambiguity Tolerance',
      failureRecovery: 'Failure Recovery',
      uncertaintyComfort: 'Uncertainty Comfort',
      independencePreference: 'Independence',
      collaborationPreference: 'Collaboration',
      structureNeed: 'Structure Preference',
      varietyNeed: 'Variety Seeking',
      environmentSensitivity: 'Environmental Sensitivity',
      influenceOrientation: 'Influence Skills',
      decisionComfort: 'Decision Making',
      responsibilityCapacity: 'Responsibility Capacity',
      visionCapability: 'Vision Setting',
      teamOrientation: 'Team Skills',
      socialEnergy: 'Social Energy',
      empathyLevel: 'Empathy',
      communicationStyle: 'Communication',
      relationshipImportance: 'Relationship Building',
      conflictApproach: 'Conflict Handling',
      explorationOpenness: 'Exploration Openness',
      industryInterest: 'Industry Interest',
      roleCuriosity: 'Role Curiosity',
      careerAwareness: 'Career Awareness',
    };

    const developmentAreas = scores
      .slice(0, config.growthAreaCount)
      .map(([dimension]) => developmentMap[dimension] ?? dimension);

    // Identify risk factors (very low scores)
    const riskThreshold = 35;
    const riskFactors = scores
      .filter(([, score]) => score.score < riskThreshold)
      .map(([dimension]) => `Low ${developmentMap[dimension] ?? dimension}`);

    return {
      developmentAreas,
      riskFactors,
    };
  }

  /**
   * Synthesize constraints profile.
   *
   * Note: Constraints may come from additional assessment data
   * or be set to defaults if not assessed.
   */
  synthesizeConstraints(result: AssessmentResult): ConstraintsProfile {
    // Default constraints - could be enhanced with explicit constraint assessment
    return {
      financialConstraint: 30,
      geographicConstraint: 30,
      educationConstraint: 30,
      familyResponsibilityConstraint: 30,
    };
  }

  /**
   * Helper to get dimension score with fallback.
   */
  private getDimensionScore(result: AssessmentResult, dimension: string): number {
    return result.dimensionScores.get(dimension)?.score ?? 50;
  }
}

/**
 * Factory function for ProfileSynthesizer.
 */
export function createProfileSynthesizer(): ProfileSynthesizer {
  return new ProfileSynthesizer();
}
