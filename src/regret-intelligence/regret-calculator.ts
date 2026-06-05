/**
 * CareerOS Regret Intelligence Engine - Regret Calculator
 *
 * Phase D.4: Regret Intelligence Engine
 *
 * Calculates regret risk across all six dimensions.
 *
 * @module regret-calculator
 * @version 1.0.0
 */

import type {
  RegretBreakdown,
  IdentityRegret,
  LifestyleRegret,
  FinancialRegret,
  OpportunityRegret,
  GrowthRegret,
  ValuesRegret,
  RegretDimensionWeights,
  RegretIntelligenceConfig,
  IdentityFactor,
  IdentityMismatch,
  LifestyleFactor,
  IncomeAdequacy,
  FinancialGrowth,
  FinancialFactor,
  LearningAssessment,
  ChallengeAssessment,
  MasteryAssessment,
  GrowthFactor,
  ValuesAlignment,
  ValuesConflict,
  ValuesFactor,
  OpportunityAtRisk,
  OptionalityReference,
} from './regret-types';
import type { CareerIntelligence } from '@/career-intelligence/career-types';
import type { CareerFitResult } from '@/career-fit/career-fit-types';
import type { StudentLifeProfile } from '@/types/student-profile';
import type { OptionalityAnalysis } from '@/optionality-intelligence/optionality-types';

/**
 * Calculator for regret risk across all dimensions.
 */
export class RegretCalculator {
  /** Configuration */
  private config: RegretIntelligenceConfig;

  /**
   * Creates a new RegretCalculator.
   *
   * @param config - Configuration
   */
  constructor(config: RegretIntelligenceConfig) {
    this.config = config;
  }

  /**
   * Calculates complete regret breakdown across all dimensions.
   *
   * @param profile - Student life profile
   * @param career - Career intelligence
   * @param fitResult - Career fit result
   * @param optionalityAnalysis - Optional optionality analysis
   * @returns Complete regret breakdown
   */
  calculateRegretBreakdown(
    profile: StudentLifeProfile,
    career: CareerIntelligence,
    fitResult: CareerFitResult,
    optionalityAnalysis?: OptionalityAnalysis
  ): RegretBreakdown {
    return {
      identity: this.calculateIdentityRegret(profile, career, fitResult),
      lifestyle: this.calculateLifestyleRegret(profile, career),
      financial: this.calculateFinancialRegret(profile, career),
      opportunity: this.calculateOpportunityRegret(optionalityAnalysis),
      growth: this.calculateGrowthRegret(profile, career, fitResult),
      values: this.calculateValuesRegret(profile, career),
    };
  }

  /**
   * Calculates overall regret risk from breakdown.
   *
   * @param breakdown - Regret breakdown
   * @returns Overall regret risk (0-100) and confidence
   */
  calculateOverallRegretRisk(
    breakdown: RegretBreakdown
  ): { overallRegretRisk: number; confidence: number } {
    const weights = this.config.dimensionWeights;

    // Weighted average of dimension scores
    const overallRegretRisk = Math.round(
      breakdown.identity.score * weights.identityRegret +
      breakdown.lifestyle.score * weights.lifestyleRegret +
      breakdown.financial.score * weights.financialRegret +
      breakdown.opportunity.score * weights.opportunityRegret +
      breakdown.growth.score * weights.growthRegret +
      breakdown.values.score * weights.valuesRegret
    );

    // Average confidence across dimensions
    const confidence = Math.round(
      (breakdown.identity.confidence +
        breakdown.lifestyle.confidence +
        breakdown.financial.confidence +
        breakdown.opportunity.confidence +
        breakdown.growth.confidence +
        breakdown.values.confidence) / 6
    );

    return { overallRegretRisk, confidence };
  }

  /**
   * Calculates identity regret.
   *
   * @param profile - Student life profile
   * @param career - Career intelligence
   * @param fitResult - Career fit result
   * @returns Identity regret assessment
   */
  private calculateIdentityRegret(
    profile: StudentLifeProfile,
    career: CareerIntelligence,
    fitResult: CareerFitResult
  ): IdentityRegret {
    const factors: IdentityFactor[] = [];
    const mismatches: IdentityMismatch[] = [];

    // Analyze cognitive demand mismatches
    const creativeDemand = career.cognitiveDemands.creativeDemand?.score ?? 50;
    const analyticalDemand = career.cognitiveDemands.analyticalDemand?.score ?? 50;

    // Check for creative mismatch
    if (profile.workStyle?.preferenceForCreative !== undefined) {
      const creativePreference = profile.workStyle.preferenceForCreative;
      if (creativePreference >= 70 && creativeDemand <= 40) {
        const impact = Math.round((creativePreference - creativeDemand) * 0.8);
        factors.push({
          name: 'Creative Suppression',
          description: 'Career may not provide sufficient creative outlet',
          impact,
          direction: 'INCREASES',
        });
        mismatches.push({
          studentTrait: 'High creativity preference',
          careerCharacteristic: 'Low creative demands',
          severity: impact,
        });
      }
    }

    // Check for analytical mismatch
    if (profile.workStyle?.preferenceForAnalytical !== undefined) {
      const analyticalPreference = profile.workStyle.preferenceForAnalytical;
      if (analyticalPreference >= 70 && analyticalDemand <= 40) {
        const impact = Math.round((analyticalPreference - analyticalDemand) * 0.7);
        factors.push({
          name: 'Analytical Underutilization',
          description: 'Career may not engage analytical capabilities',
          impact,
          direction: 'INCREASES',
        });
        mismatches.push({
          studentTrait: 'High analytical preference',
          careerCharacteristic: 'Low analytical demands',
          severity: impact,
        });
      }
    }

    // Check social interaction alignment
    const socialDemand = career.workEnvironment.peopleIntensity?.score ?? 50;
    if (profile.socialProfile?.socialPreference !== undefined) {
      const socialPreference = profile.socialProfile.socialPreference;
      const gap = Math.abs(socialPreference - socialDemand);
      if (gap >= 30) {
        const impact = Math.round(gap * 0.6);
        factors.push({
          name: 'Social Environment Mismatch',
          description: socialPreference > socialDemand
            ? 'Career may be too isolating'
            : 'Career may require too much social interaction',
          impact,
          direction: 'INCREASES',
        });
        mismatches.push({
          studentTrait: socialPreference > 50 ? 'Socially oriented' : 'Independently oriented',
          careerCharacteristic: socialDemand > 50 ? 'Highly social' : 'Independent work',
          severity: impact,
        });
      }
    }

    // Check fit result for identity signals
    const overallFit = fitResult.overallFit?.compatibility ?? 50;
    if (overallFit < 50) {
      factors.push({
        name: 'Low Overall Fit',
        description: 'Poor alignment between student profile and career requirements',
        impact: Math.round((50 - overallFit) * 1.2),
        direction: 'INCREASES',
      });
    } else {
      factors.push({
        name: 'Good Overall Fit',
        description: 'Strong alignment between student profile and career',
        impact: Math.round((overallFit - 50) * 0.6),
        direction: 'DECREASES',
      });
    }

    // Calculate score
    const baseScore = 50;
    const increases = factors
      .filter((f) => f.direction === 'INCREASES')
      .reduce((sum, f) => sum + f.impact, 0);
    const decreases = factors
      .filter((f) => f.direction === 'DECREASES')
      .reduce((sum, f) => sum + f.impact, 0);

    const score = Math.max(0, Math.min(100, baseScore + increases - decreases));

    const confidence = career.evidence.overallConfidence;

    return {
      type: 'IDENTITY',
      score,
      confidence,
      factors,
      mismatches,
    };
  }

  /**
   * Calculates lifestyle regret.
   *
   * @param profile - Student life profile
   * @param career - Career intelligence
   * @returns Lifestyle regret assessment
   */
  private calculateLifestyleRegret(
    profile: StudentLifeProfile,
    career: CareerIntelligence
  ): LifestyleRegret {
    const factors: LifestyleFactor[] = [];

    // Define lifestyle dimensions to evaluate
    const lifestyleDimensions: Array<{
      name: import('./regret-types').LifestyleFactorName;
      desiredGetter: () => number | undefined;
      actualGetter: () => number;
      description: string;
    }> = [
      {
        name: 'WORK_LIFE_BALANCE',
        desiredGetter: () => profile.personalPreferences?.workLifeBalancePriority,
        actualGetter: () => 100 - (career.workEnvironment.schedulePredictability?.score ?? 50),
        description: 'Balance between work and personal life',
      },
      {
        name: 'SCHEDULE_FLEXIBILITY',
        desiredGetter: () => profile.workStyle?.preferenceForFlexibility,
        actualGetter: () => career.workEnvironment.scheduleFlexibility?.score ?? 50,
        description: 'Flexibility in work schedule',
      },
      {
        name: 'REMOTE_WORK',
        desiredGetter: () => profile.workStyle?.preferenceForRemote,
        actualGetter: () => career.workEnvironment.remoteCompatibility?.score ?? 50,
        description: 'Ability to work remotely',
      },
      {
        name: 'AUTONOMY',
        desiredGetter: () => profile.workStyle?.preferenceForAutonomy,
        actualGetter: () => career.workEnvironment.autonomyLevel?.score ?? 50,
        description: 'Level of independence in work',
      },
      {
        name: 'SOCIAL_INTERACTION',
        desiredGetter: () => profile.socialProfile?.socialPreference,
        actualGetter: () => career.workEnvironment.peopleIntensity?.score ?? 50,
        description: 'Amount of social interaction',
      },
      {
        name: 'STRESS_LEVEL',
        desiredGetter: () => profile.personalPreferences?.stressTolerance
          ? 100 - profile.personalPreferences.stressTolerance
          : undefined,
        actualGetter: () => career.cognitiveDemands.stressTolerance?.score ?? 50,
        description: 'Level of stress in the role',
      },
    ];

    lifestyleDimensions.forEach((dim) => {
      const desired = dim.desiredGetter();
      if (desired !== undefined) {
        const actual = dim.actualGetter();
        const gap = Math.abs(desired - actual);
        const regretRisk = Math.min(100, Math.round(gap * 1.2));

        factors.push({
          name: dim.name,
          description: dim.description,
          desiredLevel: desired,
          actualLevel: actual,
          gap,
          regretRisk,
        });
      }
    });

    // Calculate overall score from factor risks
    const score = factors.length > 0
      ? Math.round(factors.reduce((sum, f) => sum + f.regretRisk, 0) / factors.length)
      : 50;

    const confidence = career.evidence.overallConfidence;

    return {
      type: 'LIFESTYLE',
      score,
      confidence,
      factors,
    };
  }

  /**
   * Calculates financial regret.
   *
   * @param profile - Student life profile
   * @param career - Career intelligence
   * @returns Financial regret assessment
   */
  private calculateFinancialRegret(
    profile: StudentLifeProfile,
    career: CareerIntelligence
  ): FinancialRegret {
    const factors: FinancialFactor[] = [];

    // Get salary information
    const salaryRange = career.metadata.averageSalary;
    const medianSalary = (salaryRange.min + salaryRange.max) / 2;

    // Income adequacy assessment
    const minimumAcceptable = profile.personalPreferences?.minimumSalaryRequirement ?? salaryRange.min * 0.8;
    const buffer = ((medianSalary - minimumAcceptable) / minimumAcceptable) * 100;
    const shortfallRisk = buffer < 0 ? Math.min(100, Math.round(Math.abs(buffer) * 2)) : 0;

    const incomeAdequacy: IncomeAdequacy = {
      minimumAcceptable: Math.round(minimumAcceptable),
      expectedIncome: Math.round(medianSalary),
      buffer: Math.round(buffer),
      shortfallRisk,
    };

    if (shortfallRisk > 0) {
      factors.push({
        name: 'Income Shortfall Risk',
        description: 'Career income may fall below minimum requirements',
        impact: shortfallRisk,
      });
    }

    // Growth potential assessment
    const currentPotential = career.careerAdvantages.salaryGrowth?.score ?? 50;
    const growthTrajectory = career.careerAdvantages.careerMobility?.score ?? 50;
    const ceilingRisk = 100 - currentPotential;

    const growthPotential: FinancialGrowth = {
      currentPotential,
      growthTrajectory,
      ceilingRisk,
    };

    if (ceilingRisk > 60) {
      factors.push({
        name: 'Income Ceiling Risk',
        description: 'Limited potential for salary growth',
        impact: Math.round(ceilingRisk * 0.8),
      });
    }

    // Financial priority alignment
    if (profile.personalPreferences?.financialStabilityPriority !== undefined) {
      const financialPriority = profile.personalPreferences.financialStabilityPriority;
      const stabilityScore = 100 - (career.careerRisks.automationRisk?.score ?? 50);

      if (financialPriority >= 70 && stabilityScore <= 50) {
        factors.push({
          name: 'Financial Stability Concern',
          description: 'High financial priority but career has stability risks',
          impact: Math.round((financialPriority - stabilityScore) * 0.7),
        });
      }
    }

    // Calculate score
    const baseScore = 40;
    const factorImpact = factors.reduce((sum, f) => sum + f.impact * 0.5, 0);
    const score = Math.min(100, Math.round(baseScore + factorImpact));

    const confidence = career.evidence.overallConfidence;

    return {
      type: 'FINANCIAL',
      score,
      confidence,
      incomeAdequacy,
      growthPotential,
      factors,
    };
  }

  /**
   * Calculates opportunity regret.
   *
   * @param optionalityAnalysis - Optionality analysis
   * @returns Opportunity regret assessment
   */
  private calculateOpportunityRegret(
    optionalityAnalysis?: OptionalityAnalysis
  ): OpportunityRegret {
    // If no optionality analysis, return moderate regret risk
    if (!optionalityAnalysis) {
      return {
        type: 'OPPORTUNITY',
        score: 50,
        confidence: 40,
        lostOptionality: 50,
        optionalityReference: {
          overallOptionality: 50,
          pathsClosed: 0,
          pathsOpen: 0,
        },
        opportunitiesAtRisk: [],
      };
    }

    // Calculate lost optionality (inverse of optionality score)
    const optionalityScore = optionalityAnalysis.overallOptionality;
    const lostOptionality = Math.round(100 - optionalityScore);

    // Generate opportunities at risk
    const opportunitiesAtRisk: OpportunityAtRisk[] = [];

    // Add paths that would be closed
    optionalityAnalysis.futureOptions.alternativePaths.slice(0, 3).forEach((path) => {
      opportunitiesAtRisk.push({
        name: path.title,
        type: 'Alternative Path',
        attractiveness: path.viability,
        likelihoodOfInterest: Math.round(100 - path.transitionDifficulty),
        regretIfLost: Math.round(path.viability * 0.7),
      });
    });

    // Add expansion paths
    optionalityAnalysis.futureOptions.expansionPaths.slice(0, 2).forEach((path) => {
      opportunitiesAtRisk.push({
        name: path.title,
        type: 'Expansion Path',
        attractiveness: path.viability,
        likelihoodOfInterest: Math.round(100 - path.transitionDifficulty),
        regretIfLost: Math.round(path.viability * 0.6),
      });
    });

    const optionalityReference: OptionalityReference = {
      overallOptionality: optionalityScore,
      pathsClosed: optionalityAnalysis.futureOptions.totalPathCount < 10
        ? Math.round(15 - optionalityAnalysis.futureOptions.totalPathCount)
        : 0,
      pathsOpen: optionalityAnalysis.futureOptions.totalPathCount,
    };

    // Calculate score based on lost optionality
    const score = Math.round(lostOptionality * 0.8 + 10);

    const confidence = optionalityAnalysis.confidence;

    return {
      type: 'OPPORTUNITY',
      score,
      confidence,
      lostOptionality,
      optionalityReference,
      opportunitiesAtRisk,
    };
  }

  /**
   * Calculates growth regret.
   *
   * @param profile - Student life profile
   * @param career - Career intelligence
   * @param fitResult - Career fit result
   * @returns Growth regret assessment
   */
  private calculateGrowthRegret(
    profile: StudentLifeProfile,
    career: CareerIntelligence,
    fitResult: CareerFitResult
  ): GrowthRegret {
    const factors: GrowthFactor[] = [];

    // Learning opportunity assessment
    const skillBreadth = career.cognitiveDemands.learningRequirement?.score ?? 50;
    const skillAcquisitionRate: import('./regret-types').LearningAssessment['skillAcquisitionRate'] =
      skillBreadth >= 70 ? 'HIGH' : skillBreadth >= 45 ? 'MODERATE' : 'LOW';

    const learningOpportunity: LearningAssessment = {
      score: skillBreadth,
      skillAcquisitionRate,
      learningBreadth: skillBreadth,
    };

    if (skillAcquisitionRate === 'LOW') {
      factors.push({
        name: 'Limited Learning',
        description: 'Career offers limited opportunities for new skill development',
        impact: 60,
      });
    }

    // Challenge assessment
    const complexityDemand = career.cognitiveDemands.complexityLevel?.score ?? 50;
    const underChallengeRisk = complexityDemand < 40 ? Math.round(50 - complexityDemand) : 0;
    const overChallengeRisk = complexityDemand > 80 ? Math.round(complexityDemand - 70) : 0;

    const challengeLevel: ChallengeAssessment = {
      score: complexityDemand,
      underChallengeRisk,
      overChallengeRisk,
    };

    if (underChallengeRisk > 30) {
      factors.push({
        name: 'Under-Challenge Risk',
        description: 'Career may not provide sufficient intellectual challenge',
        impact: underChallengeRisk,
      });
    }

    // Mastery potential
    const expertiseCeiling: import('./regret-types').MasteryAssessment['expertiseCeiling'] =
      skillBreadth >= 70 ? 'HIGH' : skillBreadth >= 45 ? 'MODERATE' : 'LOW';

    const masteryPotential: MasteryAssessment = {
      score: skillBreadth,
      expertiseCeiling,
      recognitionPotential: career.careerAdvantages.recognitionPotential?.score ?? 50,
    };

    if (expertiseCeiling === 'LOW') {
      factors.push({
        name: 'Low Mastery Ceiling',
        description: 'Limited potential for becoming an expert',
        impact: 50,
      });
    }

    // Check student growth orientation
    if (profile.workStyle?.preferenceForGrowth !== undefined) {
      const growthPreference = profile.workStyle.preferenceForGrowth;
      if (growthPreference >= 70 && skillBreadth <= 50) {
        factors.push({
          name: 'Growth Mismatch',
          description: 'High growth preference but limited growth opportunities',
          impact: Math.round((growthPreference - skillBreadth) * 0.8),
        });
      }
    }

    // Calculate score
    const baseScore = 35;
    const factorImpact = factors.reduce((sum, f) => sum + f.impact * 0.4, 0);
    const score = Math.min(100, Math.round(baseScore + factorImpact));

    const confidence = career.evidence.overallConfidence;

    return {
      type: 'GROWTH',
      score,
      confidence,
      learningOpportunity,
      challengeLevel,
      masteryPotential,
      factors,
    };
  }

  /**
   * Calculates values regret.
   *
   * @param profile - Student life profile
   * @param career - Career intelligence
   * @returns Values regret assessment
   */
  private calculateValuesRegret(
    profile: StudentLifeProfile,
    career: CareerIntelligence
  ): ValuesRegret {
    const conflicts: ValuesConflict[] = [];
    const factors: ValuesFactor[] = [];

    // Get student values (from various profile sections)
    const studentValues: Array<{ name: string; strength: number }> = [];

    if (profile.personalPreferences?.impactPriority !== undefined) {
      studentValues.push({ name: 'Impact', strength: profile.personalPreferences.impactPriority });
    }

    if (profile.personalPreferences?.financialStabilityPriority !== undefined) {
      studentValues.push({
        name: 'Financial Stability',
        strength: profile.personalPreferences.financialStabilityPriority,
      });
    }

    // Work-life balance as value
    if (profile.personalPreferences?.workLifeBalancePriority !== undefined) {
      studentValues.push({
        name: 'Work-Life Balance',
        strength: profile.personalPreferences.workLifeBalancePriority,
      });
    }

    // Analyze each value for conflicts
    let alignedCount = 0;
    let conflictingCount = 0;
    let neutralCount = 0;

    studentValues.forEach((value) => {
      if (value.name === 'Impact') {
        const impactScore = career.careerAdvantages.socialImpact?.score ?? 50;
        if (value.strength >= 70 && impactScore < 50) {
          const severity = Math.round((value.strength - impactScore) * 0.8);
          conflicts.push({
            studentValue: 'High desire for social impact',
            careerConflict: 'Limited social impact potential',
            severity,
          });
          conflictingCount++;
        } else if (value.strength >= 70 && impactScore >= 60) {
          alignedCount++;
        } else {
          neutralCount++;
        }
      }

      if (value.name === 'Financial Stability') {
        const stabilityScore = 100 - (career.careerRisks.automationRisk?.score ?? 50);
        if (value.strength >= 70 && stabilityScore < 50) {
          const severity = Math.round((value.strength - stabilityScore) * 0.8);
          conflicts.push({
            studentValue: 'Strong need for financial stability',
            careerConflict: 'Career instability risks',
            severity,
          });
          conflictingCount++;
        } else if (value.strength >= 70 && stabilityScore >= 60) {
          alignedCount++;
        } else {
          neutralCount++;
        }
      }

      if (value.name === 'Work-Life Balance') {
        const schedulePredictability = career.workEnvironment.schedulePredictability?.score ?? 50;
        if (value.strength >= 70 && schedulePredictability < 50) {
          const severity = Math.round((value.strength - (100 - schedulePredictability)) * 0.8);
          conflicts.push({
            studentValue: 'Strong work-life balance preference',
            careerConflict: 'Unpredictable schedule demands',
            severity,
          });
          conflictingCount++;
        } else if (value.strength >= 70 && schedulePredictability >= 60) {
          alignedCount++;
        } else {
          neutralCount++;
        }
      }
    });

    // Add factors based on conflicts
    conflicts.forEach((conflict) => {
      factors.push({
        name: `Values Conflict: ${conflict.studentValue}`,
        description: conflict.careerConflict,
        impact: conflict.severity,
      });
    });

    // Calculate alignment score
    const totalValues = alignedCount + conflictingCount + neutralCount || 1;
    const alignmentScore = Math.round(
      (alignedCount * 100 - conflictingCount * 50 + neutralCount * 25) / totalValues
    );

    const valuesAlignment: ValuesAlignment = {
      score: Math.max(0, alignmentScore),
      alignedCount,
      conflictingCount,
      neutralCount,
    };

    // Calculate regret score (inverse of alignment, adjusted for conflict severity)
    const conflictSeverity = conflicts.reduce((sum, c) => sum + c.severity, 0);
    const score = Math.min(100, Math.round(
      (100 - valuesAlignment.score) * 0.6 + conflictSeverity * 0.1
    ));

    const confidence = career.evidence.overallConfidence;

    return {
      type: 'VALUES',
      score,
      confidence,
      valuesAlignment,
      conflicts,
      factors,
    };
  }
}

/**
 * Creates a default regret calculator.
 *
 * @param config - Optional partial configuration
 * @returns Configured RegretCalculator
 */
export function createRegretCalculator(
  config?: Partial<RegretIntelligenceConfig>
): RegretCalculator {
  const fullConfig: RegretIntelligenceConfig = {
    ...import('./regret-types').DEFAULT_REGRET_INTELLIGENCE_CONFIG,
    ...config,
  };

  return new RegretCalculator(fullConfig);
}
