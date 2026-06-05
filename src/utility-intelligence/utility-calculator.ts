/**
 * CareerOS Utility Intelligence Engine - Utility Calculator
 *
 * Phase D.2: Utility Intelligence Engine
 *
 * Calculates utility scores across all six dimensions:
 * Fulfillment, Lifestyle, Financial, Growth, Freedom, Meaning
 *
 * @module utility-calculator
 * @version 1.0.0
 */

import type {
  FulfillmentUtility,
  LifestyleUtility,
  FinancialUtility,
  GrowthUtility,
  FreedomUtility,
  MeaningUtility,
  UtilityBreakdown,
  UtilityCalculationResult,
  UtilityIntelligenceConfig,
  UtilityContext,
  UtilityDimension,
  SubDimensionScore,
} from './utility-types';
import type { CareerFitResult } from '@/career-fit/career-fit-types';
import type { CareerIntelligence } from '@/career-intelligence/career-types';
import type { GeneratedProfile, IdentifiedStrength } from '@/profile/profile-types';

/**
 * Calculator for utility scores.
 */
export class UtilityCalculator {
  /** Configuration */
  private config: UtilityIntelligenceConfig;

  /**
   * Creates a new UtilityCalculator.
   *
   * @param config - Configuration
   */
  constructor(config: UtilityIntelligenceConfig) {
    this.config = config;
  }

  /**
   * Calculates complete utility breakdown.
   *
   * @param profile - Student profile
   * @param career - Career intelligence
   * @param fitResult - Career fit result
   * @param context - Analysis context
   * @returns Complete utility breakdown
   */
  calculateUtilityBreakdown(
    profile: GeneratedProfile,
    career: CareerIntelligence,
    fitResult: CareerFitResult,
    context?: UtilityContext
  ): UtilityBreakdown {
    const weights = this.getDimensionWeights(context);

    return {
      fulfillment: this.calculateFulfillmentUtility(profile, career, fitResult, weights.FULFILLMENT),
      lifestyle: this.calculateLifestyleUtility(profile, career, fitResult, weights.LIFESTYLE),
      financial: this.calculateFinancialUtility(career, fitResult, weights.FINANCIAL),
      growth: this.calculateGrowthUtility(profile, career, fitResult, weights.GROWTH),
      freedom: this.calculateFreedomUtility(career, fitResult, weights.FREEDOM),
      meaning: this.calculateMeaningUtility(profile, career, fitResult, weights.MEANING),
    };
  }

  /**
   * Calculates overall utility score.
   *
   * @param breakdown - Utility breakdown
   * @returns Overall score and confidence
   */
  calculateOverallUtility(breakdown: UtilityBreakdown): UtilityCalculationResult {
    const fulfillmentScore = breakdown.fulfillment.score;
    const lifestyleScore = breakdown.lifestyle.score;
    const financialScore = breakdown.financial.score;
    const growthScore = breakdown.growth.score;
    const freedomScore = breakdown.freedom.score;
    const meaningScore = breakdown.meaning.score;

    // Weighted average using dimension weights
    const overall = Math.round(
      fulfillmentScore * breakdown.fulfillment.weight +
      lifestyleScore * breakdown.lifestyle.weight +
      financialScore * breakdown.financial.weight +
      growthScore * breakdown.growth.weight +
      freedomScore * breakdown.freedom.weight +
      meaningScore * breakdown.meaning.weight
    );

    // Confidence is weighted average of dimension confidences
    const confidence = Math.round(
      breakdown.fulfillment.confidence * breakdown.fulfillment.weight +
      breakdown.lifestyle.confidence * breakdown.lifestyle.weight +
      breakdown.financial.confidence * breakdown.financial.weight +
      breakdown.growth.confidence * breakdown.growth.weight +
      breakdown.freedom.confidence * breakdown.freedom.weight +
      breakdown.meaning.confidence * breakdown.meaning.weight
    );

    return {
      fulfillment: fulfillmentScore,
      lifestyle: lifestyleScore,
      financial: financialScore,
      growth: growthScore,
      freedom: freedomScore,
      meaning: meaningScore,
      overall,
      confidence,
      calculatedAt: new Date(),
    };
  }

  /**
   * Calculates fulfillment utility.
   *
   * @param profile - Student profile
   * @param career - Career intelligence
   * @param fitResult - Career fit result
   * @param weight - Dimension weight
   * @returns Fulfillment utility
   */
  private calculateFulfillmentUtility(
    profile: GeneratedProfile,
    career: CareerIntelligence,
    fitResult: CareerFitResult,
    weight: number
  ): FulfillmentUtility {
    // Strength alignment - how well can they use their strengths
    const strengthAlignment = this.calculateStrengthAlignment(profile, fitResult);

    // Interest alignment - based on archetype and career match
    const interestAlignment = this.calculateInterestAlignment(profile, career, fitResult);

    // Motivation alignment - how well career satisfies their motivators
    const motivationAlignment = this.calculateMotivationAlignment(fitResult);

    // Calculate overall score (weighted average of sub-dimensions)
    const score = Math.round(
      strengthAlignment.score * 0.35 +
      interestAlignment.score * 0.3 +
      motivationAlignment.score * 0.35
    );

    // Confidence is average of sub-dimension confidences
    const confidence = Math.round(
      (strengthAlignment.confidence + interestAlignment.confidence + motivationAlignment.confidence) / 3
    );

    const findings = this.generateFulfillmentFindings(
      strengthAlignment,
      interestAlignment,
      motivationAlignment,
      score
    );

    return {
      score,
      confidence,
      weight,
      strengthAlignment,
      interestAlignment,
      motivationAlignment,
      findings,
    };
  }

  /**
   * Calculates strength alignment.
   *
   * @param profile - Student profile
   * @param fitResult - Career fit result
   * @returns Strength alignment score
   */
  private calculateStrengthAlignment(
    profile: GeneratedProfile,
    fitResult: CareerFitResult
  ): SubDimensionScore {
    // Primary strengths contribute more
    const primaryStrengths = profile.strengths.primary;
    const secondaryStrengths = profile.strengths.secondary;

    // Calculate how many strengths can be leveraged
    const cognitiveFit = fitResult.breakdown.cognitive;
    const environmentFit = fitResult.breakdown.workEnvironment;

    // Score based on fit in areas where they have strengths
    let score = 50; // Base score

    // Boost score for strong cognitive fit when they have cognitive strengths
    if (primaryStrengths.some((s) => s.dimension.includes('analytical') || s.dimension.includes('systematic'))) {
      score += cognitiveFit.analyticalFit.score * 0.2;
      score += cognitiveFit.systematicFit.score * 0.15;
    }

    if (primaryStrengths.some((s) => s.dimension.includes('creative'))) {
      score += cognitiveFit.creativeFit.score * 0.25;
    }

    if (primaryStrengths.some((s) => s.dimension.includes('verbal') || s.dimension.includes('communication'))) {
      score += cognitiveFit.verbalFit.score * 0.2;
    }

    // Leadership strength match
    if (primaryStrengths.some((s) => s.dimension.includes('leadership'))) {
      score += environmentFit.leadershipFit.score * 0.2;
    }

    // Cap at 100
    score = Math.min(Math.round(score), 100);

    // Confidence based on number of identified strengths and fit confidence
    const confidence = Math.round(
      (primaryStrengths.length + secondaryStrengths.length) * 10 +
      fitResult.confidence.overall * 0.5
    );

    return {
      score,
      confidence: Math.min(confidence, 100),
      factors: profile.strengths.primary.map((s) => s.name),
    };
  }

  /**
   * Calculates interest alignment.
   *
   * @param profile - Student profile
   * @param career - Career intelligence
   * @param fitResult - Career fit result
   * @returns Interest alignment score
   */
  private calculateInterestAlignment(
    profile: GeneratedProfile,
    career: CareerIntelligence,
    fitResult: CareerFitResult
  ): SubDimensionScore {
    // Interest alignment is based on archetype match and overall fit
    const archetypeMatch = profile.archetype.matchScore;

    // Overall fit indicates interest alignment
    const overallFit = fitResult.overallFitScore;

    // Career characteristics alignment with typical interests of archetype
    const workEnvironment = career.workEnvironment;
    const researchIntensity = workEnvironment.researchIntensity?.score ?? 50;
    const peopleIntensity = workEnvironment.peopleIntensity?.score ?? 50;
    const executionIntensity = workEnvironment.executionIntensity?.score ?? 50;

    // Calculate score
    const score = Math.round(
      archetypeMatch * 0.3 +
      overallFit * 0.4 +
      (researchIntensity + peopleIntensity + executionIntensity) / 3 * 0.3
    );

    const confidence = Math.round(
      profile.archetype.confidence.score * 0.5 +
      fitResult.confidence.overall * 0.5
    );

    return {
      score,
      confidence,
      factors: [profile.archetype.name, career.metadata.industry],
    };
  }

  /**
   * Calculates motivation alignment.
   *
   * @param fitResult - Career fit result
   * @returns Motivation alignment score
   */
  private calculateMotivationAlignment(fitResult: CareerFitResult): SubDimensionScore {
    const motivationFit = fitResult.breakdown.motivation;

    // Weight primary motivators more heavily
    const achievementWeight = 0.2;
    const masteryWeight = 0.2;
    const autonomyWeight = 0.2;
    const impactWeight = 0.2;
    const recognitionWeight = 0.1;
    const securityWeight = 0.1;

    const score = Math.round(
      motivationFit.achievementFit.score * achievementWeight +
      motivationFit.masteryFit.score * masteryWeight +
      motivationFit.autonomyFit.score * autonomyWeight +
      motivationFit.impactFit.score * impactWeight +
      motivationFit.recognitionFit.score * recognitionWeight +
      motivationFit.securityFit.score * securityWeight
    );

    return {
      score,
      confidence: fitResult.confidence.overall,
      factors: [motivationFit.primaryMatch],
    };
  }

  /**
   * Calculates lifestyle utility.
   *
   * @param profile - Student profile
   * @param career - Career intelligence
   * @param fitResult - Career fit result
   * @param weight - Dimension weight
   * @returns Lifestyle utility
   */
  private calculateLifestyleUtility(
    profile: GeneratedProfile,
    career: CareerIntelligence,
    fitResult: CareerFitResult,
    weight: number
  ): LifestyleUtility {
    const lifestyleChars = career.lifestyleCharacteristics;
    const lifestyleFit = fitResult.breakdown.lifestyle;

    // Work-life balance
    const workLifeBalance: SubDimensionScore = {
      score: lifestyleChars.workLifeBalance?.score ?? 50,
      confidence: 70,
      factors: ['Work-life balance characteristics'],
    };

    // Flexibility
    const flexibility: SubDimensionScore = {
      score: lifestyleChars.locationFlexibility?.score ?? 50,
      confidence: 65,
      factors: ['Location flexibility'],
    };

    // Location freedom
    const locationFreedom: SubDimensionScore = {
      score: lifestyleFit.locationFit.score,
      confidence: fitResult.confidence.overall,
      factors: ['Location preference alignment'],
    };

    // Lifestyle compatibility
    const lifestyleCompatibility: SubDimensionScore = {
      score: lifestyleFit.score,
      confidence: fitResult.confidence.overall,
      factors: ['Overall lifestyle fit'],
    };

    // Calculate overall score
    const score = Math.round(
      workLifeBalance.score * 0.3 +
      flexibility.score * 0.2 +
      locationFreedom.score * 0.25 +
      lifestyleCompatibility.score * 0.25
    );

    const confidence = Math.round(
      (workLifeBalance.confidence + flexibility.confidence + locationFreedom.confidence + lifestyleCompatibility.confidence) / 4
    );

    const findings = this.generateLifestyleFindings(
      workLifeBalance,
      flexibility,
      locationFreedom,
      lifestyleCompatibility
    );

    return {
      score,
      confidence,
      weight,
      workLifeBalance,
      flexibility,
      locationFreedom,
      lifestyleCompatibility,
      findings,
    };
  }

  /**
   * Calculates financial utility.
   *
   * @param career - Career intelligence
   * @param fitResult - Career fit result
   * @param weight - Dimension weight
   * @returns Financial utility
   */
  private calculateFinancialUtility(
    career: CareerIntelligence,
    fitResult: CareerFitResult,
    weight: number
  ): FinancialUtility {
    const lifestyleChars = career.lifestyleCharacteristics;
    const careerRisks = career.careerRisks;
    const advantages = career.careerAdvantages;

    // Income potential
    const incomeScore = lifestyleChars.incomePotential?.score ?? 50;
    const incomePotential: SubDimensionScore = {
      score: incomeScore,
      confidence: career.evidence.overallConfidence,
      factors: ['Income potential data'],
    };

    // Financial stability
    const stabilityScore = lifestyleChars.stabilityLevel?.score ?? 50;
    const stability: SubDimensionScore = {
      score: stabilityScore,
      confidence: 70,
      factors: ['Career stability characteristics'],
    };

    // Economic resilience - based on optionality and future relevance
    const optionalityScore = advantages.optionality?.score ?? 50;
    const futureRelevance = advantages.futureRelevance?.score ?? 50;
    const automationRisk = careerRisks.automationRisk?.score ?? 50;

    const resilienceScore = Math.round(
      optionalityScore * 0.4 +
      futureRelevance * 0.4 +
      (100 - automationRisk) * 0.2
    );

    const resilience: SubDimensionScore = {
      score: resilienceScore,
      confidence: 65,
      factors: ['Optionality', 'Future relevance', 'Automation risk'],
    };

    // Calculate overall score
    const score = Math.round(
      incomePotential.score * 0.4 +
      stability.score * 0.3 +
      resilience.score * 0.3
    );

    const confidence = Math.round(
      (incomePotential.confidence + stability.confidence + resilience.confidence) / 3
    );

    const findings = this.generateFinancialFindings(
      incomePotential,
      stability,
      resilience,
      career
    );

    return {
      score,
      confidence,
      weight,
      incomePotential,
      stability,
      resilience,
      findings,
    };
  }

  /**
   * Calculates growth utility.
   *
   * @param profile - Student profile
   * @param career - Career intelligence
   * @param fitResult - Career fit result
   * @param weight - Dimension weight
   * @returns Growth utility
   */
  private calculateGrowthUtility(
    profile: GeneratedProfile,
    career: CareerIntelligence,
    fitResult: CareerFitResult,
    weight: number
  ): GrowthUtility {
    const advantages = career.careerAdvantages;
    const workEnvironment = career.workEnvironment;
    const cognitiveDemands = career.cognitiveDemands;

    // Learning opportunities - based on cognitive demands and research intensity
    const researchIntensity = workEnvironment.researchIntensity?.score ?? 50;
    const cognitiveComplexity = Math.round(
      (cognitiveDemands.analyticalDemand?.score ?? 50 +
        cognitiveDemands.creativeDemand?.score ?? 50) / 2
    );

    const learningScore = Math.round(
      researchIntensity * 0.4 +
      cognitiveComplexity * 0.3 +
      (profile.insights.learningStyle.primary ? 70 : 50) * 0.3
    );

    const learning: SubDimensionScore = {
      score: learningScore,
      confidence: 70,
      factors: ['Research intensity', 'Cognitive complexity', 'Learning opportunities'],
    };

    // Mastery potential
    const masteryDemand = career.motivationalDemands.masteryDemand?.score ?? 50;
    const systematicDemand = cognitiveDemands.systematicDemand?.score ?? 50;

    const masteryScore = Math.round(
      masteryDemand * 0.5 +
      systematicDemand * 0.3 +
      advantages.careerMobility?.score ?? 50 * 0.2
    );

    const mastery: SubDimensionScore = {
      score: masteryScore,
      confidence: 65,
      factors: ['Mastery demand', 'Systematic complexity', 'Career depth'],
    };

    // Career development
    const careerDevelopmentScore = advantages.careerMobility?.score ?? 50;
    const careerDevelopment: SubDimensionScore = {
      score: careerDevelopmentScore,
      confidence: career.evidence.overallConfidence,
      factors: ['Career mobility', 'Advancement opportunities'],
    };

    // Skill growth
    const transferability = advantages.transferability?.score ?? 50;
    const skillGrowthScore = Math.round(
      transferability * 0.5 +
      learningScore * 0.3 +
      masteryScore * 0.2
    );

    const skillGrowth: SubDimensionScore = {
      score: skillGrowthScore,
      confidence: 65,
      factors: ['Skill transferability', 'Learning curve', 'Mastery depth'],
    };

    // Calculate overall score
    const score = Math.round(
      learning.score * 0.3 +
      mastery.score * 0.25 +
      careerDevelopment.score * 0.25 +
      skillGrowth.score * 0.2
    );

    const confidence = Math.round(
      (learning.confidence + mastery.confidence + careerDevelopment.confidence + skillGrowth.confidence) / 4
    );

    const findings = this.generateGrowthFindings(
      learning,
      mastery,
      careerDevelopment,
      skillGrowth
    );

    return {
      score,
      confidence,
      weight,
      learning,
      mastery,
      careerDevelopment,
      skillGrowth,
      findings,
    };
  }

  /**
   * Calculates freedom utility.
   *
   * @param career - Career intelligence
   * @param fitResult - Career fit result
   * @param weight - Dimension weight
   * @returns Freedom utility
   */
  private calculateFreedomUtility(
    career: CareerIntelligence,
    fitResult: CareerFitResult,
    weight: number
  ): FreedomUtility {
    const advantages = career.careerAdvantages;
    const lifestyleChars = career.lifestyleCharacteristics;
    const workEnvironment = career.workEnvironment;
    const motivationFit = fitResult.breakdown.motivation;

    // Autonomy
    const autonomyDemand = career.motivationalDemands.autonomyDemand?.score ?? 50;
    const independenceLevel = workEnvironment.independenceLevel?.score ?? 50;

    const autonomyScore = Math.round(
      motivationFit.autonomyFit.score * 0.5 +
      independenceLevel * 0.3 +
      (100 - workEnvironment.peopleIntensity?.score ?? 50) * 0.2
    );

    const autonomy: SubDimensionScore = {
      score: autonomyScore,
      confidence: motivationFit.autonomyFit.score > 0 ? 75 : 60,
      factors: ['Autonomy fit', 'Independence level', 'Work structure'],
    };

    // Choice preservation - optionality and mobility
    const optionalityScore = advantages.optionality?.score ?? 50;
    const mobilityScore = advantages.careerMobility?.score ?? 50;

    const choicePreservationScore = Math.round(
      optionalityScore * 0.6 +
      mobilityScore * 0.4
    );

    const choicePreservation: SubDimensionScore = {
      score: choicePreservationScore,
      confidence: 70,
      factors: ['Career optionality', 'Mobility potential'],
    };

    // Optionality support
    const transferability = advantages.transferability?.score ?? 50;
    const locationFlexibility = lifestyleChars.locationFlexibility?.score ?? 50;

    const optionalitySupportScore = Math.round(
      transferability * 0.4 +
      optionalityScore * 0.35 +
      locationFlexibility * 0.25
    );

    const optionality: SubDimensionScore = {
      score: optionalitySupportScore,
      confidence: 65,
      factors: ['Skill transferability', 'Optionality', 'Location flexibility'],
    };

    // Calculate overall score
    const score = Math.round(
      autonomy.score * 0.4 +
      choicePreservation.score * 0.3 +
      optionality.score * 0.3
    );

    const confidence = Math.round(
      (autonomy.confidence + choicePreservation.confidence + optionality.confidence) / 3
    );

    const findings = this.generateFreedomFindings(autonomy, choicePreservation, optionality);

    return {
      score,
      confidence,
      weight,
      autonomy,
      choicePreservation,
      optionality,
      findings,
    };
  }

  /**
   * Calculates meaning utility.
   *
   * @param profile - Student profile
   * @param career - Career intelligence
   * @param fitResult - Career fit result
   * @param weight - Dimension weight
   * @returns Meaning utility
   */
  private calculateMeaningUtility(
    profile: GeneratedProfile,
    career: CareerIntelligence,
    fitResult: CareerFitResult,
    weight: number
  ): MeaningUtility {
    const valuesFit = fitResult.breakdown.values;
    const motivationFit = fitResult.breakdown.motivation;

    // Purpose - connection to something larger
    const impactDemand = career.motivationalDemands.impactDemand?.score ?? 50;
    const purposeScore = Math.round(
      motivationFit.impactFit.score * 0.6 +
      impactDemand * 0.4
    );

    const purpose: SubDimensionScore = {
      score: purposeScore,
      confidence: motivationFit.impactFit.score > 0 ? 75 : 60,
      factors: ['Impact motivation fit', 'Career purpose potential'],
    };

    // Impact potential
    const impactScore = valuesFit.impactFit.score;
    const impact: SubDimensionScore = {
      score: impactScore,
      confidence: fitResult.confidence.overall,
      factors: ['Impact fit', 'Values alignment'],
    };

    // Contribution opportunity
    const contributionScore = Math.round(
      (valuesFit.impactFit.score + motivationFit.impactFit.score) / 2
    );

    const contribution: SubDimensionScore = {
      score: contributionScore,
      confidence: Math.round((fitResult.confidence.overall + motivationFit.impactFit.score > 0 ? 70 : 50) / 2),
      factors: ['Contribution potential', 'Service orientation'],
    };

    // Values alignment
    const valuesAlignmentScore = valuesFit.score;
    const valuesAlignment: SubDimensionScore = {
      score: valuesAlignmentScore,
      confidence: fitResult.confidence.overall,
      factors: ['Overall values fit', 'Ethical alignment'],
    };

    // Calculate overall score
    const score = Math.round(
      purpose.score * 0.25 +
      impact.score * 0.25 +
      contribution.score * 0.25 +
      valuesAlignment.score * 0.25
    );

    const confidence = Math.round(
      (purpose.confidence + impact.confidence + contribution.confidence + valuesAlignment.confidence) / 4
    );

    const findings = this.generateMeaningFindings(purpose, impact, contribution, valuesAlignment);

    return {
      score,
      confidence,
      weight,
      purpose,
      impact,
      contribution,
      valuesAlignment,
      findings,
    };
  }

  /**
   * Gets dimension weights based on context.
   *
   * @param context - Analysis context
   * @returns Dimension weights
   */
  private getDimensionWeights(
    context?: UtilityContext
  ): Record<UtilityDimension, number> {
    // Use context weights if provided
    if (context?.dimensionWeights) {
      return {
        ...this.config.dimensionWeights,
        ...context.dimensionWeights,
      };
    }

    // Use life stage weights if applicable
    if (context?.lifeStage) {
      const stageWeights = this.getLifeStageWeights(context.lifeStage);
      return {
        ...this.config.dimensionWeights,
        ...stageWeights,
      };
    }

    return this.config.dimensionWeights;
  }

  /**
   * Gets weights for a life stage.
   *
   * @param lifeStage - Life stage
   * @returns Partial dimension weights
   */
  private getLifeStageWeights(
    lifeStage: import('./utility-types').LifeStage
  ): Partial<Record<UtilityDimension, number>> {
    const weights: Record<import('./utility-types').LifeStage, Partial<Record<UtilityDimension, number>>> = {
      STUDENT: { GROWTH: 0.25, FULFILLMENT: 0.2, MEANING: 0.15 },
      EARLY_CAREER: { GROWTH: 0.25, FINANCIAL: 0.2, FULFILLMENT: 0.15 },
      MID_CAREER: { FULFILLMENT: 0.25, MEANING: 0.2, FINANCIAL: 0.15 },
      LATE_CAREER: { MEANING: 0.25, FREEDOM: 0.2, LIFESTYLE: 0.2 },
      TRANSITION: { FREEDOM: 0.25, GROWTH: 0.2, FULFILLMENT: 0.2 },
    };

    return weights[lifeStage] ?? {};
  }

  /**
   * Generates fulfillment findings.
   */
  private generateFulfillmentFindings(
    strengthAlignment: SubDimensionScore,
    interestAlignment: SubDimensionScore,
    motivationAlignment: SubDimensionScore,
    score: number
  ): import('./utility-types').FulfillmentFinding[] {
    const findings: import('./utility-types').FulfillmentFinding[] = [];

    if (strengthAlignment.score >= 70) {
      findings.push({
        type: 'STRENGTH_MATCH',
        description: 'Strong alignment with personal strengths',
        impact: Math.round((strengthAlignment.score - 50) * 0.5),
      });
    }

    if (interestAlignment.score >= 70) {
      findings.push({
        type: 'INTEREST_MATCH',
        description: 'Good alignment with interests',
        impact: Math.round((interestAlignment.score - 50) * 0.4),
      });
    }

    if (motivationAlignment.score >= 70) {
      findings.push({
        type: 'MOTIVATION_MATCH',
        description: 'Strong motivation fit',
        impact: Math.round((motivationAlignment.score - 50) * 0.5),
      });
    }

    if (score < 50) {
      findings.push({
        type: 'MISALIGNMENT',
        description: 'Overall misalignment may lead to dissatisfaction',
        impact: Math.round((50 - score) * -0.5),
      });
    }

    return findings;
  }

  /**
   * Generates lifestyle findings.
   */
  private generateLifestyleFindings(
    workLifeBalance: SubDimensionScore,
    flexibility: SubDimensionScore,
    locationFreedom: SubDimensionScore,
    lifestyleCompatibility: SubDimensionScore
  ): import('./utility-types').LifestyleFinding[] {
    const findings: import('./utility-types').LifestyleFinding[] = [];

    if (workLifeBalance.score >= 70) {
      findings.push({
        type: 'BALANCE',
        description: 'Good work-life balance supports wellbeing',
        impact: Math.round((workLifeBalance.score - 50) * 0.4),
      });
    }

    if (flexibility.score >= 70) {
      findings.push({
        type: 'FLEXIBILITY',
        description: 'Flexible work arrangements enhance lifestyle',
        impact: Math.round((flexibility.score - 50) * 0.3),
      });
    }

    if (locationFreedom.score < 50) {
      findings.push({
        type: 'LOCATION',
        description: 'Location constraints may limit lifestyle options',
        impact: Math.round((50 - locationFreedom.score) * -0.4),
      });
    }

    if (lifestyleCompatibility.score < 50) {
      findings.push({
        type: 'CONFLICT',
        description: 'Lifestyle conflicts detected',
        impact: Math.round((50 - lifestyleCompatibility.score) * -0.5),
      });
    }

    return findings;
  }

  /**
   * Generates financial findings.
   */
  private generateFinancialFindings(
    incomePotential: SubDimensionScore,
    stability: SubDimensionScore,
    resilience: SubDimensionScore,
    career: CareerIntelligence
  ): import('./utility-types').FinancialFinding[] {
    const findings: import('./utility-types').FinancialFinding[] = [];

    if (incomePotential.score >= 75) {
      findings.push({
        type: 'INCOME',
        description: 'Strong income potential supports financial goals',
        impact: Math.round((incomePotential.score - 50) * 0.5),
      });
    }

    if (stability.score >= 70) {
      findings.push({
        type: 'STABILITY',
        description: 'Career stability provides security',
        impact: Math.round((stability.score - 50) * 0.3),
      });
    }

    if (resilience.score >= 70) {
      findings.push({
        type: 'RESILIENCE',
        description: 'Economic resilience protects against market changes',
        impact: Math.round((resilience.score - 50) * 0.4),
      });
    }

    const automationRisk = career.careerRisks.automationRisk?.score ?? 0;
    if (automationRisk > 60) {
      findings.push({
        type: 'RISK',
        description: 'Automation risk threatens long-term financial stability',
        impact: Math.round((automationRisk - 50) * -0.5),
      });
    }

    return findings;
  }

  /**
   * Generates growth findings.
   */
  private generateGrowthFindings(
    learning: SubDimensionScore,
    mastery: SubDimensionScore,
    careerDevelopment: SubDimensionScore,
    skillGrowth: SubDimensionScore
  ): import('./utility-types').GrowthFinding[] {
    const findings: import('./utility-types').GrowthFinding[] = [];

    if (learning.score >= 70) {
      findings.push({
        type: 'LEARNING',
        description: 'Rich learning environment supports development',
        impact: Math.round((learning.score - 50) * 0.4),
      });
    }

    if (mastery.score >= 70) {
      findings.push({
        type: 'MASTERY',
        description: 'Clear path to expertise and mastery',
        impact: Math.round((mastery.score - 50) * 0.4),
      });
    }

    if (careerDevelopment.score >= 70) {
      findings.push({
        type: 'DEVELOPMENT',
        description: 'Strong career advancement opportunities',
        impact: Math.round((careerDevelopment.score - 50) * 0.35),
      });
    }

    if (skillGrowth.score < 50) {
      findings.push({
        type: 'STAGNATION',
        description: 'Limited skill development potential',
        impact: Math.round((50 - skillGrowth.score) * -0.5),
      });
    }

    return findings;
  }

  /**
   * Generates freedom findings.
   */
  private generateFreedomFindings(
    autonomy: SubDimensionScore,
    choicePreservation: SubDimensionScore,
    optionality: SubDimensionScore
  ): import('./utility-types').FreedomFinding[] {
    const findings: import('./utility-types').FreedomFinding[] = [];

    if (autonomy.score >= 70) {
      findings.push({
        type: 'AUTONOMY',
        description: 'High autonomy supports self-direction',
        impact: Math.round((autonomy.score - 50) * 0.4),
      });
    }

    if (choicePreservation.score >= 70) {
      findings.push({
        type: 'CHOICE',
        description: 'Career preserves future options',
        impact: Math.round((choicePreservation.score - 50) * 0.35),
      });
    }

    if (optionality.score >= 70) {
      findings.push({
        type: 'OPTIONALITY',
        description: 'Multiple paths available',
        impact: Math.round((optionality.score - 50) * 0.35),
      });
    }

    if (autonomy.score < 40) {
      findings.push({
        type: 'CONSTRAINT',
        description: 'Limited autonomy may cause frustration',
        impact: Math.round((40 - autonomy.score) * -0.5),
      });
    }

    return findings;
  }

  /**
   * Generates meaning findings.
   */
  private generateMeaningFindings(
    purpose: SubDimensionScore,
    impact: SubDimensionScore,
    contribution: SubDimensionScore,
    valuesAlignment: SubDimensionScore
  ): import('./utility-types').MeaningFinding[] {
    const findings: import('./utility-types').MeaningFinding[] = [];

    if (purpose.score >= 70) {
      findings.push({
        type: 'PURPOSE',
        description: 'Strong sense of purpose available',
        impact: Math.round((purpose.score - 50) * 0.4),
      });
    }

    if (impact.score >= 70) {
      findings.push({
        type: 'IMPACT',
        description: 'Opportunity to make meaningful impact',
        impact: Math.round((impact.score - 50) * 0.4),
      });
    }

    if (contribution.score >= 70) {
      findings.push({
        type: 'CONTRIBUTION',
        description: 'Can contribute to something larger than self',
        impact: Math.round((contribution.score - 50) * 0.35),
      });
    }

    if (valuesAlignment.score >= 75) {
      findings.push({
        type: 'VALUES',
        description: 'Strong values alignment creates meaning',
        impact: Math.round((valuesAlignment.score - 50) * 0.45),
      });
    }

    if (purpose.score < 40 && impact.score < 40) {
      findings.push({
        type: 'EMPTINESS',
        description: 'Limited purpose or impact potential may lead to emptiness',
        impact: -20,
      });
    }

    return findings;
  }
}

/**
 * Creates a default utility calculator.
 *
 * @param config - Optional partial configuration
 * @returns Configured UtilityCalculator
 */
export function createUtilityCalculator(
  config?: Partial<UtilityIntelligenceConfig>
): UtilityCalculator {
  const fullConfig: UtilityIntelligenceConfig = {
    ...import('./utility-types').DEFAULT_UTILITY_INTELLIGENCE_CONFIG,
    ...config,
  };

  return new UtilityCalculator(fullConfig);
}
