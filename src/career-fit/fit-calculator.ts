/**
 * CareerOS Career Fit Engine - Fit Calculator
 *
 * Phase C.3: Career Fit Engine
 *
 * Calculates fit scores between StudentLifeProfile and CareerIntelligence.
 *
 * @module fit-calculator
 * @version 1.0.0
 */

import type { StudentLifeProfile } from '../types/student-life-profile';
import type { CareerIntelligence } from '../career-intelligence/career-types';
import type {
  CareerFitResult,
  FitBreakdown,
  CognitiveFit,
  MotivationFit,
  LifestyleFit,
  RiskFit,
  WorkEnvironmentFit,
  ValuesFit,
  DimensionFit,
  FitLevel,
  FitCalculationConfig,
} from './career-fit-types';
import { DEFAULT_FIT_CONFIG } from './career-fit-types';

/**
 * Calculates comprehensive fit scores between student profiles and careers.
 *
 * Provides deterministic, explainable fit calculations across all dimensions.
 */
export class FitCalculator {
  private config: FitCalculationConfig;

  constructor(config?: Partial<FitCalculationConfig>) {
    this.config = { ...DEFAULT_FIT_CONFIG, ...config };
  }

  /**
   * Calculate complete fit between a student profile and a career.
   */
  calculateFit(
    profile: StudentLifeProfile,
    career: CareerIntelligence,
    profileId: string
  ): CareerFitResult {
    const breakdown = this.calculateBreakdown(profile, career);
    const overallScore = this.calculateOverallScore(breakdown);
    const fitLevel = this.determineFitLevel(overallScore);

    return {
      id: `${profileId}-${career.careerId}-${Date.now()}`,
      studentProfileId: profileId,
      careerId: career.careerId,
      overallFitScore: overallScore,
      fitLevel,
      breakdown,
      strengths: [], // Populated by FitBreakdownEngine
      concerns: [], // Populated by FitBreakdownEngine
      explanations: {
        strongFitReasons: [],
        weakFitReasons: [],
        alignments: [],
        conflicts: [],
        summary: '',
      }, // Populated by FitExplanationEngine
      confidence: {
        overall: 0,
        profileConfidence: profile.confidence?.profileConfidence ?? 50,
        careerConfidence: career.evidence?.overallConfidence ?? 50,
        evidenceConfidence: 50,
        calculationConfidence: 80,
        level: 'MEDIUM',
      }, // Refined by FitConfidenceEngine
      evaluatedAt: new Date(),
      metadata: {
        calculationMethod: 'deterministic-weighted',
        version: '1.0.0',
        profileTimestamp: new Date(),
        careerTimestamp: career.metadata?.updatedAt ?? new Date(),
      },
    };
  }

  /**
   * Calculate fit breakdown across all dimensions.
   */
  private calculateBreakdown(
    profile: StudentLifeProfile,
    career: CareerIntelligence
  ): FitBreakdown {
    return {
      cognitive: this.calculateCognitiveFit(profile, career),
      motivation: this.calculateMotivationFit(profile, career),
      lifestyle: this.calculateLifestyleFit(profile, career),
      risk: this.calculateRiskFit(profile, career),
      workEnvironment: this.calculateWorkEnvironmentFit(profile, career),
      values: this.calculateValuesFit(profile, career),
    };
  }

  /**
   * Calculate cognitive fit.
   */
  private calculateCognitiveFit(
    profile: StudentLifeProfile,
    career: CareerIntelligence
  ): CognitiveFit {
    const studentCognitive = profile.cognitive;
    const careerCognitive = career.cognitiveDemands;

    const analyticalFit = this.calculateDimensionFit(
      studentCognitive.analytical,
      careerCognitive.analyticalDemand.score
    );
    const creativeFit = this.calculateDimensionFit(
      studentCognitive.creative,
      careerCognitive.creativeDemand.score
    );
    const systematicFit = this.calculateDimensionFit(
      studentCognitive.systematic,
      careerCognitive.systematicDemand.score
    );
    const verbalFit = this.calculateDimensionFit(
      studentCognitive.verbalReasoning,
      careerCognitive.verbalDemand.score
    );
    const spatialFit = this.calculateDimensionFit(
      studentCognitive.spatialReasoning,
      careerCognitive.spatialDemand.score
    );
    const quantitativeFit = this.calculateDimensionFit(
      studentCognitive.quantitativeReasoning,
      careerCognitive.quantitativeDemand.score
    );

    const dimensions = [
      { name: 'analytical', fit: analyticalFit },
      { name: 'creative', fit: creativeFit },
      { name: 'systematic', fit: systematicFit },
      { name: 'verbal', fit: verbalFit },
      { name: 'spatial', fit: spatialFit },
      { name: 'quantitative', fit: quantitativeFit },
    ];

    const dominantMatch = dimensions.reduce((best, current) =>
      current.fit.score > best.fit.score ? current : best
    ).name;

    const score = Math.round(
      dimensions.reduce((sum, d) => sum + d.fit.score, 0) / dimensions.length
    );

    const gaps = dimensions
      .filter((d) => d.fit.gap > this.config.gapTolerance)
      .map((d) => ({
        dimension: d.name,
        gap: d.fit.gap,
        impact: d.fit.gap > 30 ? ('HIGH' as const) : d.fit.gap > 15 ? ('MEDIUM' as const) : ('LOW' as const),
        isDevelopable: true,
      }));

    return {
      score,
      analyticalFit,
      creativeFit,
      systematicFit,
      verbalFit,
      spatialFit,
      quantitativeFit,
      dominantMatch,
      gaps,
    };
  }

  /**
   * Calculate motivation fit.
   */
  private calculateMotivationFit(
    profile: StudentLifeProfile,
    career: CareerIntelligence
  ): MotivationFit {
    const studentMotivation = profile.motivation;
    const careerMotivation = career.motivationalDemands;

    const achievementFit = this.calculateDimensionFit(
      studentMotivation.achievement,
      careerMotivation.achievementDemand.score
    );
    const masteryFit = this.calculateDimensionFit(
      studentMotivation.mastery,
      careerMotivation.masteryDemand.score
    );
    const autonomyFit = this.calculateDimensionFit(
      studentMotivation.autonomy,
      careerMotivation.autonomyDemand.score
    );
    const impactFit = this.calculateDimensionFit(
      studentMotivation.impact,
      careerMotivation.impactDemand.score
    );
    const recognitionFit = this.calculateDimensionFit(
      studentMotivation.recognition,
      careerMotivation.recognitionDemand.score
    );
    const securityFit = this.calculateDimensionFit(
      studentMotivation.security,
      careerMotivation.securityDemand.score
    );

    const dimensions = [
      { name: 'achievement', fit: achievementFit },
      { name: 'mastery', fit: masteryFit },
      { name: 'autonomy', fit: autonomyFit },
      { name: 'impact', fit: impactFit },
      { name: 'recognition', fit: recognitionFit },
      { name: 'security', fit: securityFit },
    ];

    const primaryMatch = dimensions.reduce((best, current) =>
      current.fit.score > best.fit.score ? current : best
    ).name;

    const score = Math.round(
      dimensions.reduce((sum, d) => sum + d.fit.score, 0) / dimensions.length
    );

    const conflicts = dimensions
      .filter((d) => d.fit.gap > 25)
      .map((d) => ({
        dimension: d.name,
        studentScore: d.fit.studentScore,
        careerDemand: d.fit.careerDemand,
        severity: d.fit.gap > 40 ? ('HIGH' as const) : ('MEDIUM' as const),
        description: `Student ${d.name} (${d.fit.studentScore}%) vs Career demand (${d.fit.careerDemand}%)`,
      }));

    return {
      score,
      achievementFit,
      masteryFit,
      autonomyFit,
      impactFit,
      recognitionFit,
      securityFit,
      primaryMatch,
      conflicts,
    };
  }

  /**
   * Calculate lifestyle fit.
   */
  private calculateLifestyleFit(
    profile: StudentLifeProfile,
    career: CareerIntelligence
  ): LifestyleFit {
    const studentLifestyle = profile.lifestyle;
    const careerLifestyle = career.lifestyleCharacteristics;

    const incomeFit = this.calculateDimensionFit(
      studentLifestyle.incomePriority,
      careerLifestyle.incomePotential.score
    );
    const workLifeBalanceFit = this.calculateDimensionFit(
      studentLifestyle.workLifeBalance,
      careerLifestyle.workLifeBalance.score
    );
    const locationFit = this.calculateDimensionFit(
      studentLifestyle.locationFreedom,
      careerLifestyle.locationFlexibility.score
    );
    const travelFit = this.calculateDimensionFit(
      studentLifestyle.travelPreference,
      careerLifestyle.travelRequirement.score
    );
    const stabilityFit = this.calculateDimensionFit(
      studentLifestyle.stabilityPreference,
      careerLifestyle.stabilityLevel.score
    );

    const score = Math.round(
      (incomeFit.score + workLifeBalanceFit.score + locationFit.score + travelFit.score + stabilityFit.score) / 5
    );

    const dealbreakers: LifestyleFit['dealbreakers'] = [];

    // Check for critical lifestyle mismatches
    if (workLifeBalanceFit.gap > 40) {
      dealbreakers.push({
        dimension: 'workLifeBalance',
        studentPreference: `High work-life balance priority (${studentLifestyle.workLifeBalance}%)`,
        careerReality: `Demanding schedule (${careerLifestyle.workLifeBalance.score}% balance)`,
        severity: 'CRITICAL',
      });
    }

    if (stabilityFit.gap > 35) {
      dealbreakers.push({
        dimension: 'stability',
        studentPreference: `High stability need (${studentLifestyle.stabilityPreference}%)`,
        careerReality: `Variable stability (${careerLifestyle.stabilityLevel.score}%)`,
        severity: 'WARNING',
      });
    }

    return {
      score,
      incomeFit,
      workLifeBalanceFit,
      locationFit,
      travelFit,
      stabilityFit,
      dealbreakers,
    };
  }

  /**
   * Calculate risk fit.
   */
  private calculateRiskFit(
    profile: StudentLifeProfile,
    career: CareerIntelligence
  ): RiskFit {
    const studentRisk = profile.risk;
    const careerRisk = career.careerRisks;

    // For risks, lower career risk is better when student has low tolerance
    const automationRiskFit = this.calculateRiskAlignment(
      studentRisk.careerRiskTolerance,
      careerRisk.automationRisk.score
    );
    const competitionRiskFit = this.calculateRiskAlignment(
      studentRisk.careerRiskTolerance,
      careerRisk.competitionRisk.score
    );
    const burnoutRiskFit = this.calculateRiskAlignment(
      studentRisk.careerRiskTolerance,
      careerRisk.burnoutRisk.score
    );
    const educationBarrierFit = this.calculateRiskAlignment(
      50, // Neutral baseline for education
      careerRisk.educationBarrier.score
    );

    const score = Math.round(
      (automationRiskFit.score + competitionRiskFit.score + burnoutRiskFit.score + educationBarrierFit.score) / 4
    );

    const riskToleranceMatch = Math.round(
      100 - Math.abs(studentRisk.careerRiskTolerance - this.calculateAverageCareerRisk(careerRisk))
    );

    const concerns: RiskFit['concerns'] = [];

    if (automationRiskFit.gap > 30) {
      concerns.push({
        riskType: 'automation',
        studentTolerance: studentRisk.careerRiskTolerance,
        careerRiskLevel: careerRisk.automationRisk.score,
        level: 'HIGH',
        description: 'Career has high automation risk that exceeds student tolerance',
      });
    }

    if (burnoutRiskFit.gap > 25) {
      concerns.push({
        riskType: 'burnout',
        studentTolerance: studentRisk.careerRiskTolerance,
        careerRiskLevel: careerRisk.burnoutRisk.score,
        level: 'MEDIUM',
        description: 'High burnout risk may conflict with risk tolerance',
      });
    }

    return {
      score,
      automationRiskFit,
      competitionRiskFit,
      burnoutRiskFit,
      educationBarrierFit,
      riskToleranceMatch,
      concerns,
    };
  }

  /**
   * Calculate work environment fit.
   */
  private calculateWorkEnvironmentFit(
    profile: StudentLifeProfile,
    career: CareerIntelligence
  ): WorkEnvironmentFit {
    const studentWorkEnv = profile.workEnvironment;
    const careerWorkEnv = career.workEnvironment;

    const peopleFit = this.calculateDimensionFit(
      studentWorkEnv.peopleOriented,
      careerWorkEnv.peopleIntensity.score
    );
    const independenceFit = this.calculateDimensionFit(
      studentWorkEnv.independentWork,
      careerWorkEnv.independenceLevel.score
    );
    const leadershipFit = this.calculateDimensionFit(
      studentWorkEnv.leadershipPreference,
      careerWorkEnv.leadershipOpportunity.score
    );
    const researchFit = this.calculateDimensionFit(
      studentWorkEnv.researchPreference,
      careerWorkEnv.researchIntensity.score
    );
    const executionFit = this.calculateDimensionFit(
      studentWorkEnv.executionPreference,
      careerWorkEnv.executionIntensity.score
    );

    const score = Math.round(
      (peopleFit.score + independenceFit.score + leadershipFit.score + researchFit.score + executionFit.score) / 5
    );

    const dimensions = [
      { name: 'people-oriented', fit: peopleFit },
      { name: 'independent', fit: independenceFit },
      { name: 'leadership', fit: leadershipFit },
      { name: 'research', fit: researchFit },
      { name: 'execution', fit: executionFit },
    ];

    const environmentMatch = dimensions.reduce((best, current) =>
      current.fit.score > best.fit.score ? current : best
    ).name;

    return {
      score,
      peopleFit,
      independenceFit,
      leadershipFit,
      researchFit,
      executionFit,
      environmentMatch,
    };
  }

  /**
   * Calculate values fit.
   */
  private calculateValuesFit(
    profile: StudentLifeProfile,
    career: CareerIntelligence
  ): ValuesFit {
    const studentValues = profile.values;
    const careerLifestyle = career.lifestyleCharacteristics;
    const careerWorkEnv = career.workEnvironment;

    // Map career characteristics to value proxies
    const moneyFit = this.calculateDimensionFit(
      studentValues.money,
      careerLifestyle.incomePotential.score
    );
    const prestigeFit = this.calculateDimensionFit(
      studentValues.prestige,
      careerWorkEnv.leadershipOpportunity.score
    );
    const familyTimeFit = this.calculateDimensionFit(
      studentValues.familyTime,
      careerLifestyle.workLifeBalance.score
    );
    const freedomFit = this.calculateDimensionFit(
      studentValues.freedom,
      careerWorkEnv.independenceLevel.score
    );
    const impactFit = this.calculateDimensionFit(
      studentValues.impact,
      career.motivationalDemands.impactDemand.score
    );
    const learningFit = this.calculateDimensionFit(
      studentValues.learning,
      career.motivationalDemands.masteryDemand.score
    );

    const score = Math.round(
      (moneyFit.score + prestigeFit.score + familyTimeFit.score + freedomFit.score + impactFit.score + learningFit.score) / 6
    );

    const highlyAligned: string[] = [];
    const moderatelyAligned: string[] = [];
    const misaligned: string[] = [];

    const values = [
      { name: 'money', fit: moneyFit },
      { name: 'prestige', fit: prestigeFit },
      { name: 'familyTime', fit: familyTimeFit },
      { name: 'freedom', fit: freedomFit },
      { name: 'impact', fit: impactFit },
      { name: 'learning', fit: learningFit },
    ];

    for (const v of values) {
      if (v.fit.score >= 80) highlyAligned.push(v.name);
      else if (v.fit.score >= 60) moderatelyAligned.push(v.name);
      else misaligned.push(v.name);
    }

    let satisfactionPotential: ValuesFit['alignment']['satisfactionPotential'];
    if (highlyAligned.length >= 3) satisfactionPotential = 'HIGH';
    else if (highlyAligned.length >= 1 || moderatelyAligned.length >= 3) satisfactionPotential = 'MODERATE';
    else satisfactionPotential = 'LOW';

    return {
      score,
      moneyFit,
      prestigeFit,
      familyTimeFit,
      freedomFit,
      impactFit,
      learningFit,
      alignment: {
        highlyAligned,
        moderatelyAligned,
        misaligned,
        satisfactionPotential,
      },
    };
  }

  /**
   * Calculate fit for a single dimension.
   */
  private calculateDimensionFit(studentScore: number, careerDemand: number): DimensionFit {
    const gap = Math.abs(studentScore - careerDemand);
    const isMatch = gap <= this.config.gapTolerance;
    const exceedsDemand = studentScore > careerDemand;

    // Fit score: 100 if perfect match, decreases as gap increases
    let score = Math.max(0, 100 - gap);

    // Bonus for exceeding demand (up to a point)
    if (exceedsDemand && gap <= 30) {
      score = Math.min(100, score + 5);
    }

    return {
      score: Math.round(score),
      studentScore: Math.round(studentScore),
      careerDemand: Math.round(careerDemand),
      gap: Math.round(gap),
      isMatch,
      exceedsDemand,
    };
  }

  /**
   * Calculate risk alignment (lower risk is better when tolerance is low).
   */
  private calculateRiskAlignment(tolerance: number, risk: number): DimensionFit {
    // Inverse relationship: high tolerance + high risk = good fit
    // low tolerance + low risk = good fit
    const gap = Math.abs(tolerance - (100 - risk));
    const score = Math.max(0, 100 - gap);

    return {
      score: Math.round(score),
      studentScore: Math.round(tolerance),
      careerDemand: Math.round(100 - risk),
      gap: Math.round(gap),
      isMatch: gap <= this.config.gapTolerance,
      exceedsDemand: tolerance > (100 - risk),
    };
  }

  /**
   * Calculate overall fit score from breakdown.
   */
  private calculateOverallScore(breakdown: FitBreakdown): number {
    const weights = this.config.dimensionWeights;

    const weightedScore =
      breakdown.cognitive.score * weights.cognitive +
      breakdown.motivation.score * weights.motivation +
      breakdown.lifestyle.score * weights.lifestyle +
      breakdown.risk.score * weights.risk +
      breakdown.workEnvironment.score * weights.workEnvironment +
      breakdown.values.score * weights.values;

    return Math.round(weightedScore);
  }

  /**
   * Determine fit level from score.
   */
  private determineFitLevel(score: number): FitLevel {
    if (score >= this.config.excellentFitThreshold) return 'EXCELLENT';
    if (score >= this.config.goodFitThreshold) return 'GOOD';
    if (score >= this.config.moderateFitThreshold) return 'MODERATE';
    if (score >= this.config.poorFitThreshold) return 'POOR';
    return 'MISFIT';
  }

  /**
   * Calculate average career risk.
   */
  private calculateAverageCareerRisk(careerRisk: CareerIntelligence['careerRisks']): number {
    return Math.round(
      (careerRisk.automationRisk.score +
        careerRisk.competitionRisk.score +
        careerRisk.burnoutRisk.score +
        careerRisk.educationBarrier.score) / 4
    );
  }

  /**
   * Update configuration.
   */
  setConfig(config: Partial<FitCalculationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration.
   */
  getConfig(): FitCalculationConfig {
    return { ...this.config };
  }
}

/**
 * Factory function for FitCalculator.
 */
export function createFitCalculator(
  config?: Partial<FitCalculationConfig>
): FitCalculator {
  return new FitCalculator(config);
}
