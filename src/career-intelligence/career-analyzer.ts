/**
 * CareerOS Career Intelligence Engine - Career Analyzer
 *
 * Phase C.1: Career Intelligence Engine
 *
 * Analyzes career data and generates comprehensive career profiles.
 *
 * @module career-analyzer
 * @version 1.0.0
 */

import type {
  CareerIntelligence,
  CareerAnalysis,
  CareerProfileSummary,
  CareerDifficulty,
  MarketOutlook,
  CareerComparison,
  DimensionComparison,
  CareerId,
} from './career-types';

/**
 * Analyzes careers and generates comprehensive profiles.
 *
 * Provides career profiling, difficulty assessment, market outlook,
 * and comparison capabilities.
 */
export class CareerAnalyzer {
  /**
   * Analyze a career and generate comprehensive profile.
   */
  analyzeCareer(career: CareerIntelligence): CareerAnalysis {
    const primaryProfile = this.extractPrimaryProfile(career);
    const secondaryCharacteristics = this.identifySecondaryCharacteristics(career);
    const difficulty = this.assessDifficulty(career);
    const marketOutlook = this.assessMarketOutlook(career);

    return {
      careerId: career.careerId,
      analyzedAt: new Date(),
      primaryProfile,
      secondaryCharacteristics,
      difficulty,
      marketOutlook,
    };
  }

  /**
   * Extract primary career profile.
   */
  private extractPrimaryProfile(career: CareerIntelligence): CareerProfileSummary {
    // Find dominant cognitive demand
    const cognitiveDemands = [
      { name: 'analytical', score: career.cognitiveDemands.analyticalDemand.score },
      { name: 'creative', score: career.cognitiveDemands.creativeDemand.score },
      { name: 'systematic', score: career.cognitiveDemands.systematicDemand.score },
      { name: 'verbal', score: career.cognitiveDemands.verbalDemand.score },
      { name: 'spatial', score: career.cognitiveDemands.spatialDemand.score },
      { name: 'quantitative', score: career.cognitiveDemands.quantitativeDemand.score },
    ];
    const dominantCognitive = cognitiveDemands.reduce((max, current) =>
      current.score > max.score ? current : max
    ).name;

    // Find dominant motivational demand
    const motivationalDemands = [
      { name: 'achievement', score: career.motivationalDemands.achievementDemand.score },
      { name: 'mastery', score: career.motivationalDemands.masteryDemand.score },
      { name: 'autonomy', score: career.motivationalDemands.autonomyDemand.score },
      { name: 'impact', score: career.motivationalDemands.impactDemand.score },
      { name: 'recognition', score: career.motivationalDemands.recognitionDemand.score },
      { name: 'security', score: career.motivationalDemands.securityDemand.score },
    ];
    const dominantMotivational = motivationalDemands.reduce((max, current) =>
      current.score > max.score ? current : max
    ).name;

    // Determine environment type
    const environmentType = this.determineEnvironmentType(career);

    // Assess risk level
    const riskLevel = this.assessRiskLevel(career);

    // Assess reward level
    const rewardLevel = this.assessRewardLevel(career);

    return {
      dominantCognitive,
      dominantMotivational,
      environmentType,
      riskLevel,
      rewardLevel,
    };
  }

  /**
   * Determine work environment type.
   */
  private determineEnvironmentType(career: CareerIntelligence): string {
    const workEnv = career.workEnvironment;

    const scores = [
      { type: 'people-focused', score: workEnv.peopleIntensity.score },
      { type: 'independent', score: workEnv.independenceLevel.score },
      { type: 'leadership', score: workEnv.leadershipOpportunity.score },
      { type: 'research', score: workEnv.researchIntensity.score },
      { type: 'execution', score: workEnv.executionIntensity.score },
    ];

    const dominant = scores.reduce((max, current) =>
      current.score > max.score ? current : max
    );

    return dominant.type;
  }

  /**
   * Assess risk level.
   */
  private assessRiskLevel(career: CareerIntelligence): 'LOW' | 'MODERATE' | 'HIGH' {
    const risks = career.careerRisks;
    const avgRisk =
      (risks.automationRisk.score +
        risks.competitionRisk.score +
        risks.burnoutRisk.score +
        risks.educationBarrier.score) /
      4;

    if (avgRisk >= 70) return 'HIGH';
    if (avgRisk >= 40) return 'MODERATE';
    return 'LOW';
  }

  /**
   * Assess reward level.
   */
  private assessRewardLevel(career: CareerIntelligence): 'LOW' | 'MODERATE' | 'HIGH' {
    const lifestyle = career.lifestyleCharacteristics;
    const advantages = career.careerAdvantages;

    const avgReward =
      (lifestyle.incomePotential.score +
        lifestyle.workLifeBalance.score +
        advantages.futureRelevance.score +
        advantages.optionality.score) /
      4;

    if (avgReward >= 70) return 'HIGH';
    if (avgReward >= 40) return 'MODERATE';
    return 'LOW';
  }

  /**
   * Identify secondary career characteristics.
   */
  private identifySecondaryCharacteristics(career: CareerIntelligence): string[] {
    const characteristics: string[] = [];

    // Cognitive characteristics
    if (career.cognitiveDemands.analyticalDemand.score >= 70) {
      characteristics.push('analytical-heavy');
    }
    if (career.cognitiveDemands.creativeDemand.score >= 70) {
      characteristics.push('creative-heavy');
    }
    if (career.cognitiveDemands.systematicDemand.score >= 70) {
      characteristics.push('systematic-processes');
    }

    // Motivational characteristics
    if (career.motivationalDemands.achievementDemand.score >= 70) {
      characteristics.push('achievement-driven');
    }
    if (career.motivationalDemands.autonomyDemand.score >= 70) {
      characteristics.push('autonomy-focused');
    }
    if (career.motivationalDemands.impactDemand.score >= 70) {
      characteristics.push('impact-oriented');
    }

    // Lifestyle characteristics
    if (career.lifestyleCharacteristics.incomePotential.score >= 70) {
      characteristics.push('high-income-potential');
    }
    if (career.lifestyleCharacteristics.workLifeBalance.score >= 70) {
      characteristics.push('work-life-balance-friendly');
    }
    if (career.lifestyleCharacteristics.locationFlexibility.score >= 70) {
      characteristics.push('location-flexible');
    }

    // Work environment
    if (career.workEnvironment.peopleIntensity.score >= 70) {
      characteristics.push('people-intensive');
    }
    if (career.workEnvironment.independenceLevel.score >= 70) {
      characteristics.push('high-independence');
    }
    if (career.workEnvironment.leadershipOpportunity.score >= 70) {
      characteristics.push('leadership-opportunities');
    }

    // Risks
    if (career.careerRisks.automationRisk.score >= 70) {
      characteristics.push('high-automation-risk');
    }
    if (career.careerRisks.burnoutRisk.score >= 70) {
      characteristics.push('burnout-risk');
    }

    // Advantages
    if (career.careerAdvantages.futureRelevance.score >= 70) {
      characteristics.push('future-proof');
    }
    if (career.careerAdvantages.transferability.score >= 70) {
      characteristics.push('highly-transferable');
    }

    return characteristics;
  }

  /**
   * Assess career difficulty.
   */
  private assessDifficulty(career: CareerIntelligence): CareerDifficulty {
    const risks = career.careerRisks;
    const lifestyle = career.lifestyleCharacteristics;

    // Entry barrier based on education and competition
    const entryBarrier = Math.round(
      (risks.educationBarrier.score * 0.6 + risks.competitionRisk.score * 0.4)
    );

    // Skill acquisition based on cognitive demands
    const cognitiveAvg =
      (career.cognitiveDemands.analyticalDemand.score +
        career.cognitiveDemands.creativeDemand.score +
        career.cognitiveDemands.systematicDemand.score) /
      3;
    const skillAcquisition = Math.round(cognitiveAvg * 0.8 + entryBarrier * 0.2);

    // Competition level
    const competition = risks.competitionRisk.score;

    // Stress level based on multiple factors
    const stressLevel = Math.round(
      (risks.burnoutRisk.score * 0.4 +
        (100 - lifestyle.workLifeBalance.score) * 0.3 +
        career.motivationalDemands.achievementDemand.score * 0.2 +
        risks.competitionRisk.score * 0.1)
    );

    // Overall difficulty
    const overallScore = Math.round(
      (entryBarrier + skillAcquisition + competition + stressLevel) / 4
    );

    return {
      overallScore,
      entryBarrier,
      skillAcquisition,
      competition,
      stressLevel,
    };
  }

  /**
   * Assess market outlook.
   */
  private assessMarketOutlook(career: CareerIntelligence): MarketOutlook {
    const advantages = career.careerAdvantages;
    const risks = career.careerRisks;
    const lifestyle = career.lifestyleCharacteristics;

    // Growth outlook
    let growthOutlook: MarketOutlook['growthOutlook'];
    const futureRelevance = advantages.futureRelevance.score;
    const automationRisk = risks.automationRisk.score;

    if (futureRelevance >= 75 && automationRisk <= 30) {
      growthOutlook = 'RAPIDLY_GROWING';
    } else if (futureRelevance >= 60 && automationRisk <= 50) {
      growthOutlook = 'GROWING';
    } else if (futureRelevance >= 40 && automationRisk <= 70) {
      growthOutlook = 'STABLE';
    } else {
      growthOutlook = 'DECLINING';
    }

    // Market saturation (inverse of demand indicators)
    const demandScore =
      (advantages.futureRelevance.score +
        lifestyle.incomePotential.score +
        (100 - risks.competitionRisk.score)) /
      3;

    let marketSaturation: MarketOutlook['marketSaturation'];
    if (demandScore >= 70) marketSaturation = 'UNDERSUPPLIED';
    else if (demandScore >= 40) marketSaturation = 'BALANCED';
    else marketSaturation = 'OVERSUPPLIED';

    // Geographic demand based on location flexibility
    const locationFlex = lifestyle.locationFlexibility.score;
    let geographicDemand: MarketOutlook['geographicDemand'];
    if (locationFlex >= 80) geographicDemand = 'GLOBAL';
    else if (locationFlex >= 60) geographicDemand = 'NATIONAL';
    else if (locationFlex >= 40) geographicDemand = 'REGIONAL';
    else geographicDemand = 'LOCAL';

    return {
      growthOutlook,
      marketSaturation,
      geographicDemand,
      futureRelevance: advantages.futureRelevance.score,
    };
  }

  /**
   * Compare multiple careers across dimensions.
   */
  compareCareers(careers: CareerIntelligence[]): CareerComparison {
    if (careers.length < 2) {
      throw new Error('At least 2 careers required for comparison');
    }

    const careerIds = careers.map((c) => c.careerId);

    // Define dimensions to compare
    const dimensionNames = [
      'analyticalDemand',
      'creativeDemand',
      'achievementDemand',
      'autonomyDemand',
      'incomePotential',
      'workLifeBalance',
      'peopleIntensity',
      'automationRisk',
      'futureRelevance',
    ];

    const dimensions: DimensionComparison[] = [];

    for (const dimName of dimensionNames) {
      const scores: Record<CareerId, number> = {};

      for (const career of careers) {
        const score = this.getDimensionScore(career, dimName);
        scores[career.careerId] = score;
      }

      const values = Object.values(scores);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance =
        values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;

      // Find most similar and most different
      const sorted = Object.entries(scores).sort((a, b) => a[1] - b[1]);
      const mostSimilar = sorted.slice(0, Math.ceil(sorted.length / 2)).map(([id]) => id);
      const mostDifferent = sorted.slice(-Math.ceil(sorted.length / 2)).map(([id]) => id);

      dimensions.push({
        dimension: dimName,
        scores,
        variance: Math.round(variance),
        mostSimilar,
        mostDifferent,
      });
    }

    // Calculate overall similarity
    const avgVariance =
      dimensions.reduce((sum, d) => sum + d.variance, 0) / dimensions.length;
    const similarityScore = Math.max(0, Math.round(100 - avgVariance));

    // Identify key differences
    const keyDifferences = dimensions
      .filter((d) => d.variance > 400)
      .map((d) => `Significant difference in ${d.dimension}`);

    // Identify commonalities
    const lowVarianceDims = dimensions.filter((d) => d.variance < 100);
    const commonalities = lowVarianceDims.map((d) => `Similar ${d.dimension}`);

    return {
      careers: careerIds,
      dimensions,
      similarityScore,
      keyDifferences,
      commonalities,
    };
  }

  /**
   * Get score for a specific dimension from career.
   */
  private getDimensionScore(career: CareerIntelligence, dimension: string): number {
    const cognitive = career.cognitiveDemands as Record<string, { score: number }>;
    const motivational = career.motivationalDemands as Record<string, { score: number }>;
    const lifestyle = career.lifestyleCharacteristics as Record<string, { score: number }>;
    const workEnv = career.workEnvironment as Record<string, { score: number }>;
    const risks = career.careerRisks as Record<string, { score: number }>;
    const advantages = career.careerAdvantages as Record<string, { score: number }>;

    return (
      cognitive[dimension]?.score ??
      motivational[dimension]?.score ??
      lifestyle[dimension]?.score ??
      workEnv[dimension]?.score ??
      risks[dimension]?.score ??
      advantages[dimension]?.score ??
      50
    );
  }

  /**
   * Get career complexity score.
   */
  getComplexityScore(career: CareerIntelligence): number {
    const dimensions = [
      ...Object.values(career.cognitiveDemands),
      ...Object.values(career.motivationalDemands),
    ];

    // Complexity based on variance across dimensions
    const scores = dimensions.map((d) => d.score);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance =
      scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;

    // High variance = more complex (requires diverse skills)
    return Math.round(Math.min(100, variance / 10));
  }

  /**
   * Get career attractiveness score.
   */
  getAttractivenessScore(career: CareerIntelligence): number {
    const lifestyle = career.lifestyleCharacteristics;
    const advantages = career.careerAdvantages;
    const risks = career.careerRisks;

    // Weighted attractiveness calculation
    const score = Math.round(
      lifestyle.incomePotential.score * 0.25 +
        lifestyle.workLifeBalance.score * 0.2 +
        advantages.futureRelevance.score * 0.2 +
        advantages.careerMobility.score * 0.15 +
        (100 - risks.automationRisk.score) * 0.1 +
        (100 - risks.burnoutRisk.score) * 0.1
    );

    return score;
  }
}

/**
 * Factory function for CareerAnalyzer.
 */
export function createCareerAnalyzer(): CareerAnalyzer {
  return new CareerAnalyzer();
}
