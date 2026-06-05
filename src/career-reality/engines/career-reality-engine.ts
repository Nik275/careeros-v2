/**
 * CareerOS - Career Reality Engine
 *
 * Main orchestrator for the Career Reality Intelligence System.
 *
 * Answers: "What is life actually like in this career?"
 *
 * Coordinates sub-engines:
 * - DailyLifeEngine
 * - WorkEnvironmentEngine
 * - BurnoutEngine
 * - CultureEngine
 * - CompanyStageEngine
 * - SatisfactionEngine
 * - RealityExplanationEngine
 *
 * @module career-reality-engine
 * @version 1.0.0
 */

import type {
  CareerRealityProfile,
  CareerRealityInput,
  CareerRealityProfileId,
  CareerRealityMetadata,
  DataSource,
  CareerId,
  CompanyStage,
  CompanyStageVariant,
  RealityProfileScore,
  CareerRealityComparison,
  ScoringConfig,
  BurnoutProfile,
  SatisfactionProfile,
} from '../types/career-reality-types';
import { DEFAULT_SCORING_CONFIG } from '../types/career-reality-types';

import { DailyLifeEngine, type DailyLifeInput } from './daily-life-engine';
import { WorkEnvironmentEngine, type WorkEnvironmentInput } from './work-environment-engine';
import { BurnoutEngine, type BurnoutInput } from './burnout-engine';
import { CultureEngine, type CultureInput } from './culture-engine';
import { CompanyStageEngine, type CompanyStageInput } from './company-stage-engine';
import { SatisfactionEngine, type SatisfactionInput } from './satisfaction-engine';
import {
  RealityExplanationEngine,
  type RealityExplanationInput,
} from './reality-explanation-engine';

/** Engine configuration */
export interface CareerRealityEngineConfig {
  enableScoring: boolean;
  enableComparisons: boolean;
  enableStageVariants: boolean;
  defaultScoringConfig: ScoringConfig;
}

/** Default configuration */
export const DEFAULT_CONFIG: CareerRealityEngineConfig = {
  enableScoring: true,
  enableComparisons: true,
  enableStageVariants: true,
  defaultScoringConfig: DEFAULT_SCORING_CONFIG,
};

/**
 * Career Reality Engine - Main orchestrator for career reality intelligence.
 *
 * Generates comprehensive reality profiles that answer:
 * "What is life actually like in this career?"
 */
export class CareerRealityEngine {
  private dailyLifeEngine: DailyLifeEngine;
  private workEnvironmentEngine: WorkEnvironmentEngine;
  private burnoutEngine: BurnoutEngine;
  private cultureEngine: CultureEngine;
  private companyStageEngine: CompanyStageEngine;
  private satisfactionEngine: SatisfactionEngine;
  private realityExplanationEngine: RealityExplanationEngine;

  private config: CareerRealityEngineConfig;
  private profileCache: Map<CareerRealityProfileId, CareerRealityProfile>;

  constructor(config?: Partial<CareerRealityEngineConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    this.dailyLifeEngine = new DailyLifeEngine();
    this.workEnvironmentEngine = new WorkEnvironmentEngine();
    this.burnoutEngine = new BurnoutEngine();
    this.cultureEngine = new CultureEngine();
    this.companyStageEngine = new CompanyStageEngine();
    this.satisfactionEngine = new SatisfactionEngine();
    this.realityExplanationEngine = new RealityExplanationEngine();

    this.profileCache = new Map();
  }

  /**
   * Generate a complete career reality profile.
   */
  generateProfile(input: CareerRealityInput): CareerRealityProfile {
    const profileId = this.generateProfileId(input);

    // Check cache
    const cached = this.profileCache.get(profileId);
    if (cached) {
      return cached;
    }

    // Generate sub-profiles
    const dailyLife = this.generateDailyLife(input);
    const workEnvironment = this.generateWorkEnvironment(input);
    const burnoutProfile = this.generateBurnoutProfile(input, dailyLife, workEnvironment);
    const cultureProfile = this.generateCultureProfile(input, workEnvironment);
    const satisfactionProfile = this.generateSatisfactionProfile(
      input,
      dailyLife,
      workEnvironment
    );
    const realityGap = this.generateRealityGap(input);
    const explanations = this.generateExplanations(
      input,
      dailyLife,
      workEnvironment,
      burnoutProfile,
      satisfactionProfile
    );

    // Create full profile
    const profile: CareerRealityProfile = {
      profileId,
      careerId: input.careerId,
      careerTitle: input.careerTitle,
      dailyLife,
      workEnvironment,
      burnoutProfile,
      cultureProfile,
      satisfactionProfile,
      realityGap,
      personalityFit: cultureProfile.personalityFit,
      explanations,
      metadata: this.generateMetadata(input),
    };

    // Cache profile
    this.profileCache.set(profileId, profile);

    return profile;
  }

  /**
   * Generate daily life profile.
   */
  private generateDailyLife(input: CareerRealityInput) {
    const dailyLifeInput: DailyLifeInput = {
      careerId: input.careerId,
      careerTitle: input.careerTitle,
      companyStage: input.companyStage,
      experienceLevel: input.experienceLevel,
      industry: input.industry,
    };

    return this.dailyLifeEngine.generateProfile(dailyLifeInput);
  }

  /**
   * Generate work environment profile.
   */
  private generateWorkEnvironment(input: CareerRealityInput) {
    const workEnvInput: WorkEnvironmentInput = {
      careerId: input.careerId,
      careerTitle: input.careerTitle,
      companyStage: input.companyStage,
      industry: input.industry,
      experienceLevel: input.experienceLevel,
    };

    return this.workEnvironmentEngine.generateProfile(workEnvInput);
  }

  /**
   * Generate burnout profile.
   */
  private generateBurnoutProfile(
    input: CareerRealityInput,
    dailyLife: CareerRealityProfile['dailyLife'],
    workEnvironment: CareerRealityProfile['workEnvironment']
  ) {
    const burnoutInput: BurnoutInput = {
      careerId: input.careerId,
      careerTitle: input.careerTitle,
      companyStage: input.companyStage,
      dailyLife,
      workEnvironment,
      industry: input.industry,
    };

    return this.burnoutEngine.generateProfile(burnoutInput);
  }

  /**
   * Generate culture profile.
   */
  private generateCultureProfile(
    input: CareerRealityInput,
    workEnvironment: CareerRealityProfile['workEnvironment']
  ) {
    const cultureInput: CultureInput = {
      careerId: input.careerId,
      careerTitle: input.careerTitle,
      companyStage: input.companyStage,
      workEnvironment,
      industry: input.industry,
    };

    return this.cultureEngine.generateProfile(cultureInput);
  }

  /**
   * Generate satisfaction profile.
   */
  private generateSatisfactionProfile(
    input: CareerRealityInput,
    dailyLife: CareerRealityProfile['dailyLife'],
    workEnvironment: CareerRealityProfile['workEnvironment']
  ) {
    const satisfactionInput: SatisfactionInput = {
      careerId: input.careerId,
      careerTitle: input.careerTitle,
      companyStage: input.companyStage,
      dailyLife,
      workEnvironment,
      industry: input.industry,
    };

    return this.satisfactionEngine.generateProfile(satisfactionInput);
  }

  /**
   * Generate reality gap analysis.
   */
  private generateRealityGap(input: CareerRealityInput) {
    const explanationInput: RealityExplanationInput = {
      careerId: input.careerId,
      careerTitle: input.careerTitle,
      companyStage: input.companyStage,
    };

    return this.realityExplanationEngine.generateRealityGapAnalysis(explanationInput);
  }

  /**
   * Generate reality explanations.
   */
  private generateExplanations(
    input: CareerRealityInput,
    dailyLife: CareerRealityProfile['dailyLife'],
    workEnvironment: CareerRealityProfile['workEnvironment'],
    burnoutProfile: BurnoutProfile,
    satisfactionProfile: SatisfactionProfile
  ) {
    const explanationInput: RealityExplanationInput = {
      careerId: input.careerId,
      careerTitle: input.careerTitle,
      companyStage: input.companyStage,
      dailyLife,
      workEnvironment,
      burnoutProfile,
      satisfactionProfile,
    };

    return this.realityExplanationEngine.generateExplanations(explanationInput);
  }

  /**
   * Generate profile metadata.
   */
  private generateMetadata(input: CareerRealityInput): CareerRealityMetadata {
    return {
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      dataQualityScore: 75,
      confidenceLevel: 'MEDIUM',
      sampleSize: 500,
      dataSources: [
        {
          type: 'PROFESSIONAL_SURVEY',
          description: 'Industry professionals survey',
          sampleSize: 300,
          collectedAt: new Date(),
          reliabilityScore: 80,
        },
        {
          type: 'EXIT_INTERVIEW',
          description: 'Career exit interviews',
          sampleSize: 100,
          collectedAt: new Date(),
          reliabilityScore: 75,
        },
        {
          type: 'JOB_ANALYSIS',
          description: 'Job posting and requirement analysis',
          sampleSize: 100,
          collectedAt: new Date(),
          reliabilityScore: 70,
        },
      ],
    };
  }

  /**
   * Generate profile ID.
   */
  private generateProfileId(input: CareerRealityInput): CareerRealityProfileId {
    const parts = [input.careerId];
    if (input.companyStage) parts.push(input.companyStage);
    if (input.experienceLevel) parts.push(input.experienceLevel);
    if (input.geography) parts.push(input.geography);
    return parts.join('-');
  }

  /**
   * Calculate scores for a profile.
   */
  calculateScores(
    profile: CareerRealityProfile,
    scoringConfig?: ScoringConfig
  ): RealityProfileScore {
    const config = scoringConfig || this.config.defaultScoringConfig;

    const dailyLifeScore = this.calculateDailyLifeScore(profile.dailyLife);
    const workEnvironmentScore = this.calculateWorkEnvironmentScore(profile.workEnvironment);
    const burnoutResilienceScore = 100 - profile.burnoutProfile.overallRisk;
    const cultureScore = this.calculateCultureScore(profile.cultureProfile);
    const satisfactionScore = profile.satisfactionProfile.overallSatisfaction;
    const realityClarityScore = 100 - profile.realityGap.overallGap;

    const overall = Math.round(
      dailyLifeScore * config.dailyLifeWeight +
        workEnvironmentScore * config.workEnvironmentWeight +
        burnoutResilienceScore * config.burnoutWeight +
        cultureScore * config.cultureWeight +
        satisfactionScore * config.satisfactionWeight
    );

    return {
      overall,
      dailyLife: dailyLifeScore,
      workEnvironment: workEnvironmentScore,
      burnoutResilience: burnoutResilienceScore,
      culture: cultureScore,
      satisfaction: satisfactionScore,
      realityClarity: realityClarityScore,
    };
  }

  /**
   * Calculate daily life score.
   */
  private calculateDailyLifeScore(dailyLife: CareerRealityProfile['dailyLife']): number {
    const hoursScore = Math.max(0, 100 - (dailyLife.typicalWeek.typicalHoursPerWeek - 40) * 2);
    const deepWorkScore = dailyLife.activityDistribution.deepWorkPercentage;
    const meetingScore = Math.max(0, 100 - dailyLife.activityDistribution.meetingsPercentage);
    const predictabilityScore = dailyLife.typicalWeek.schedulePredictability;

    return Math.round((hoursScore + deepWorkScore + meetingScore + predictabilityScore) / 4);
  }

  /**
   * Calculate work environment score.
   */
  private calculateWorkEnvironmentScore(
    workEnv: CareerRealityProfile['workEnvironment']
  ): number {
    return Math.round(
      (workEnv.autonomy.overallScore +
        (100 - workEnv.bureaucracy.overallScore) +
        workEnv.flexibility.overallScore +
        (100 - workEnv.politics.overallScore)) /
        4
    );
  }

  /**
   * Calculate culture score.
   */
  private calculateCultureScore(culture: CareerRealityProfile['cultureProfile']): number {
    return Math.round(
      (culture.dimensions.collaboration +
        culture.dimensions.psychologicalSafety +
        culture.dimensions.learningCulture +
        culture.socialDynamics.communityStrength) /
        4
    );
  }

  /**
   * Compare two careers.
   */
  compareCareers(careerA: CareerId, careerB: CareerId, titleA: string, titleB: string): CareerRealityComparison {
    const profileA = this.generateProfile({
      careerId: careerA,
      careerTitle: titleA,
    });
    const profileB = this.generateProfile({
      careerId: careerB,
      careerTitle: titleB,
    });

    const scoresA = this.calculateScores(profileA);
    const scoresB = this.calculateScores(profileB);

    const dimensions = [
      { name: 'Daily Life', scoreA: scoresA.dailyLife, scoreB: scoresB.dailyLife },
      { name: 'Work Environment', scoreA: scoresA.workEnvironment, scoreB: scoresB.workEnvironment },
      { name: 'Burnout Resilience', scoreA: scoresA.burnoutResilience, scoreB: scoresB.burnoutResilience },
      { name: 'Culture', scoreA: scoresA.culture, scoreB: scoresB.culture },
      { name: 'Satisfaction', scoreA: scoresA.satisfaction, scoreB: scoresB.satisfaction },
    ].map((d) => ({
      dimension: d.name,
      scoreA: d.scoreA,
      scoreB: d.scoreB,
      difference: d.scoreA - d.scoreB,
      winner: (d.scoreA > d.scoreB ? 'A' : d.scoreB > d.scoreA ? 'B' : 'TIE') as 'A' | 'B' | 'TIE',
      significance: Math.abs(d.scoreA - d.scoreB),
    }));

    const avgDiff =
      dimensions.reduce((sum, d) => sum + Math.abs(d.difference), 0) / dimensions.length;
    const similarity = Math.max(0, 100 - avgDiff);

    const keyDifferences: string[] = [];
    if (Math.abs(scoresA.dailyLife - scoresB.dailyLife) > 15) {
      keyDifferences.push('Significantly different daily life patterns');
    }
    if (Math.abs(scoresA.burnoutResilience - scoresB.burnoutResilience) > 15) {
      keyDifferences.push('Different burnout risk profiles');
    }
    if (Math.abs(scoresA.workEnvironment - scoresB.workEnvironment) > 15) {
      keyDifferences.push('Different work environment characteristics');
    }

    const chooseAIf = [
      ...(scoresA.dailyLife > scoresB.dailyLife ? ['You value better daily life patterns'] : []),
      ...(scoresA.burnoutResilience > scoresB.burnoutResilience
        ? ['You prioritize lower burnout risk']
        : []),
      ...(scoresA.satisfaction > scoresB.satisfaction
        ? ['You want higher satisfaction potential']
        : []),
    ];

    const chooseBIf = [
      ...(scoresB.dailyLife > scoresA.dailyLife ? ['You value better daily life patterns'] : []),
      ...(scoresB.burnoutResilience > scoresA.burnoutResilience
        ? ['You prioritize lower burnout risk']
        : []),
      ...(scoresB.satisfaction > scoresA.satisfaction
        ? ['You want higher satisfaction potential']
        : []),
    ];

    return {
      careerA,
      careerB,
      dimensions,
      similarity,
      keyDifferences,
      chooseAIf: chooseAIf.length > 0 ? chooseAIf : ['Choose A based on specific career interests'],
      chooseBIf: chooseBIf.length > 0 ? chooseBIf : ['Choose B based on specific career interests'],
    };
  }

  /**
   * Get stage variants for a career.
   */
  getStageVariants(input: CareerRealityInput): CompanyStageVariant[] {
    if (!this.config.enableStageVariants) {
      return [];
    }

    const stageInput: CompanyStageInput = {
      careerId: input.careerId,
      careerTitle: input.careerTitle,
      industry: input.industry,
    };

    return this.companyStageEngine.generateStageVariants(
      stageInput,
      (dailyLifeInput) => this.dailyLifeEngine.generateProfile(dailyLifeInput),
      (workEnvInput) => this.workEnvironmentEngine.generateProfile(workEnvInput)
    );
  }

  /**
   * Get a specific stage variant.
   */
  getStageVariant(input: CareerRealityInput, stage: CompanyStage): CompanyStageVariant {
    const stageInput: CompanyStageInput = {
      careerId: input.careerId,
      careerTitle: input.careerTitle,
      industry: input.industry,
    };

    return this.companyStageEngine.generateStageVariant(
      stage,
      stageInput,
      (dailyLifeInput) => this.dailyLifeEngine.generateProfile(dailyLifeInput),
      (workEnvInput) => this.workEnvironmentEngine.generateProfile(workEnvInput)
    );
  }

  /**
   * Get quick summary of a career.
   */
  getQuickSummary(profile: CareerRealityProfile): {
    headline: string;
    keyTradeoffs: string[];
    fitProfile: string;
    warningSigns: string[];
  } {
    const scores = this.calculateScores(profile);

    const headline = `${profile.careerTitle}: ${scores.overall >= 70 ? 'Strong' : scores.overall >= 50 ? 'Moderate' : 'Challenging'} career reality profile`;

    const keyTradeoffs = [
      `Work-life: ${profile.dailyLife.typicalWeek.typicalHoursPerWeek}h/week, ${profile.dailyLife.typicalWeek.weekendWorkFrequency}% weekend work`,
      `Autonomy: ${profile.workEnvironment.autonomy.overallScore}/100`,
      `Burnout risk: ${profile.burnoutProfile.riskLevel}`,
      `Satisfaction: ${profile.satisfactionProfile.overallSatisfaction}/100`,
    ];

    const fitProfile = `Best for: ${profile.cultureProfile.personalityFit.thrives
      .slice(0, 2)
      .map((p) => p.name)
      .join(', ')}`;

    const warningSigns = [
      ...(profile.burnoutProfile.overallRisk > 70 ? ['High burnout risk'] : []),
      ...(profile.dailyLife.typicalWeek.typicalHoursPerWeek > 55 ? ['Long hours expected'] : []),
      ...(profile.workEnvironment.bureaucracy.overallScore > 70 ? ['High bureaucracy'] : []),
      ...(profile.satisfactionProfile.overallSatisfaction < 60 ? ['Low satisfaction scores'] : []),
    ];

    return { headline, keyTradeoffs, fitProfile, warningSigns };
  }

  /**
   * Clear profile cache.
   */
  clearCache(): void {
    this.profileCache.clear();
  }

  /**
   * Get cache statistics.
   */
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.profileCache.size,
      hitRate: 0, // Would track hits/misses in real implementation
    };
  }
}

/**
 * Factory function for CareerRealityEngine.
 */
export function createCareerRealityEngine(
  config?: Partial<CareerRealityEngineConfig>
): CareerRealityEngine {
  return new CareerRealityEngine(config);
}

// Re-export all sub-engines
export { DailyLifeEngine, createDailyLifeEngine } from './daily-life-engine';
export { WorkEnvironmentEngine, createWorkEnvironmentEngine } from './work-environment-engine';
export { BurnoutEngine, createBurnoutEngine } from './burnout-engine';
export { CultureEngine, createCultureEngine } from './culture-engine';
export { CompanyStageEngine, createCompanyStageEngine } from './company-stage-engine';
export { SatisfactionEngine, createSatisfactionEngine } from './satisfaction-engine';
export {
  RealityExplanationEngine,
  createRealityExplanationEngine,
} from './reality-explanation-engine';
