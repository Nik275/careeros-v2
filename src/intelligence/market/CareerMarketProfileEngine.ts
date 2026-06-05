/**
 * CareerOS Market Intelligence - Career Market Profile Engine
 *
 * Generates complete market profiles for careers.
 * Produces single authoritative profile per career.
 */

import type {
  CareerMarketProfile,
  CareerMarketProfileSnapshot,
  CareerMarketProfileUpdate,
  MarketOutlook,
} from './models/CareerMarketProfile';
import type { MarketTrend, MarketTrendType } from './models/MarketTrend';
import type { AggregateMarketSignal } from './models/MarketSignal';
import type { MarketSnapshot } from './models/MarketSnapshot';
import type { CareerMarketRepository } from './repositories/CareerMarketRepository';
import type { MarketConfidenceEngine } from './MarketConfidenceEngine';
import {
  PROFILE_COMPONENT_WEIGHTS,
  DEMAND_SUBCOMPONENT_WEIGHTS,
  SALARY_SUBCOMPONENT_WEIGHTS,
  GROWTH_SUBCOMPONENT_WEIGHTS,
  SCARCITY_SUBCOMPONENT_WEIGHTS,
  AUTOMATION_RISK_SUBCOMPONENT_WEIGHTS,
  RESILIENCE_SUBCOMPONENT_WEIGHTS,
  OUTLOOK_SCORE_THRESHOLDS,
} from './constants/MarketWeights';

/**
 * Configuration for CareerMarketProfileEngine.
 */
export interface CareerMarketProfileEngineConfig {
  /** Minimum signals required for profile generation */
  minSignalsForProfile: number;

  /** Profile update frequency (hours) */
  updateFrequencyHours: number;

  /** Enable historical snapshots */
  enableSnapshots: boolean;

  /** Maximum snapshots to retain */
  maxSnapshots: number;
}

/**
 * Default configuration.
 */
export const DEFAULT_CAREER_MARKET_PROFILE_ENGINE_CONFIG: CareerMarketProfileEngineConfig = {
  minSignalsForProfile: 5,
  updateFrequencyHours: 24,
  enableSnapshots: true,
  maxSnapshots: 100,
};

/**
 * Profile generation input.
 */
export interface ProfileGenerationInput {
  careerId: string;
  trends: MarketTrend[];
  signals: AggregateMarketSignal[];
  snapshots: MarketSnapshot[];
}

/**
 * Generates authoritative career market profiles.
 */
export class CareerMarketProfileEngine {
  private config: CareerMarketProfileEngineConfig;
  private repository: CareerMarketRepository;
  private confidenceEngine: MarketConfidenceEngine;

  constructor(
    repository: CareerMarketRepository,
    confidenceEngine: MarketConfidenceEngine,
    config?: Partial<CareerMarketProfileEngineConfig>
  ) {
    this.repository = repository;
    this.confidenceEngine = confidenceEngine;
    this.config = { ...DEFAULT_CAREER_MARKET_PROFILE_ENGINE_CONFIG, ...config };
  }

  /**
   * Generate market profile for a career.
   */
  async generateProfile(input: ProfileGenerationInput): Promise<CareerMarketProfile | null> {
    const { careerId, trends, signals, snapshots } = input;

    // Validate minimum data
    if (signals.length < this.config.minSignalsForProfile) {
      return null;
    }

    // Calculate component scores
    const demandScore = this.calculateDemandScore(trends, signals);
    const salaryScore = this.calculateSalaryScore(trends, signals);
    const growthScore = this.calculateGrowthScore(trends, signals);
    const scarcityScore = this.calculateScarcityScore(trends, signals);
    const automationRiskScore = this.calculateAutomationRiskScore(trends, signals);
    const futureResilienceScore = this.calculateResilienceScore(trends, signals);

    // Calculate component details
    const components = {
      demand: this.calculateDemandComponents(trends, signals),
      salary: this.calculateSalaryComponents(trends, signals),
      growth: this.calculateGrowthComponents(trends, signals),
      scarcity: this.calculateScarcityComponents(trends, signals),
      automationRisk: this.calculateAutomationRiskComponents(trends, signals),
      resilience: this.calculateResilienceComponents(trends, signals),
    };

    // Calculate confidence
    const confidenceBreakdown = this.confidenceEngine.calculateProfileConfidence(
      {
        careerId,
        demandScore,
        salaryScore,
        growthScore,
        scarcityScore,
        automationRiskScore,
        futureResilienceScore,
        outlook: MarketOutlook.NEUTRAL,
        confidence: 0,
        lastUpdated: new Date(),
        version: 1,
        history: [],
        components,
        evidence: {
          signalCount: signals.length,
          sources: [...new Set(signals.map((s) => s.sources).flat())],
          analysisPeriod: {
            start: new Date(Math.min(...signals.map((s) => s.timeRange.start.getTime()))),
            end: new Date(Math.max(...signals.map((s) => s.timeRange.end.getTime()))),
          },
          keyEvents: [],
        },
      } as CareerMarketProfile,
      signals as unknown as import('./models/MarketSignal').NormalizedMarketSignal[]
    );

    // Calculate outlook
    const outlook = this.calculateOutlook({
      demandScore,
      salaryScore,
      growthScore,
      automationRiskScore,
      futureResilienceScore,
    });

    // Check for existing profile to get version
    const existingProfile = await this.repository.getProfileByCareerId(careerId);
    const version = existingProfile ? existingProfile.version + 1 : 1;

    // Build profile
    const profile: CareerMarketProfile = {
      id: `profile-${careerId}-${Date.now()}`,
      careerId,
      demandScore,
      salaryScore,
      growthScore,
      scarcityScore,
      automationRiskScore,
      futureResilienceScore,
      outlook,
      confidence: confidenceBreakdown.overall,
      lastUpdated: new Date(),
      version,
      history: existingProfile?.history ?? [],
      components,
      evidence: {
        signalCount: signals.length,
        sources: [...new Set(signals.map((s) => s.sources).flat())],
        analysisPeriod: {
          start: new Date(Math.min(...signals.map((s) => s.timeRange.start.getTime()))),
          end: new Date(Math.max(...signals.map((s) => s.timeRange.end.getTime()))),
        },
        keyEvents: this.extractKeyEvents(signals),
      },
    };

    // Save snapshot if enabled
    if (this.config.enableSnapshots && existingProfile) {
      const snapshot: CareerMarketProfileSnapshot = {
        id: `snapshot-${careerId}-${Date.now()}`,
        version: existingProfile.version,
        timestamp: existingProfile.lastUpdated,
        scores: {
          demandScore: existingProfile.demandScore,
          salaryScore: existingProfile.salaryScore,
          growthScore: existingProfile.growthScore,
          scarcityScore: existingProfile.scarcityScore,
          automationRiskScore: existingProfile.automationRiskScore,
          futureResilienceScore: existingProfile.futureResilienceScore,
        },
        confidence: existingProfile.confidence,
        outlook: existingProfile.outlook,
      };
      await this.repository.saveProfileSnapshot(careerId, snapshot);
    }

    // Save profile
    await this.repository.saveProfile(profile);

    return profile;
  }

  /**
   * Update an existing profile.
   */
  async updateProfile(
    careerId: string,
    update: Partial<CareerMarketProfileUpdate['scores']>
  ): Promise<CareerMarketProfile | null> {
    const existingProfile = await this.repository.getProfileByCareerId(careerId);

    if (!existingProfile) {
      return null;
    }

    const updatedProfile: CareerMarketProfile = {
      ...existingProfile,
      ...update,
      lastUpdated: new Date(),
      version: existingProfile.version + 1,
    };

    await this.repository.saveProfile(updatedProfile);
    return updatedProfile;
  }

  /**
   * Calculate demand score.
   */
  private calculateDemandScore(
    trends: MarketTrend[],
    signals: AggregateMarketSignal[]
  ): number {
    const demandTrend = trends.find((t) => t.trendType === 'demand');
    const hiringTrend = trends.find((t) => t.trendType === 'hiring_rate');
    const competitionTrend = trends.find((t) => t.trendType === 'competition');

    const demandSignal = signals.find((s) => s.signalType === 'job_postings');

    let score = 50; // Neutral base

    if (demandTrend) {
      score = demandTrend.strength;
    } else if (demandSignal) {
      score = demandSignal.aggregatedStrength;
    }

    if (hiringTrend) {
      score = score * 0.7 + hiringTrend.strength * 0.3;
    }

    if (competitionTrend) {
      // Inverse relationship - more competition = lower demand score
      score = score * 0.8 + (100 - competitionTrend.strength) * 0.2;
    }

    return Math.round(score);
  }

  /**
   * Calculate salary score.
   */
  private calculateSalaryScore(
    trends: MarketTrend[],
    signals: AggregateMarketSignal[]
  ): number {
    const salaryTrend = trends.find((t) => t.trendType === 'salary');
    const salarySignal = signals.find((s) => s.signalType === 'salary_growth');

    if (salaryTrend) {
      return salaryTrend.strength;
    }

    if (salarySignal) {
      return salarySignal.aggregatedStrength;
    }

    return 50;
  }

  /**
   * Calculate growth score.
   */
  private calculateGrowthScore(
    trends: MarketTrend[],
    signals: AggregateMarketSignal[]
  ): number {
    const growthTrend = trends.find((t) => t.trendType === 'growth');
    const startupSignal = signals.find((s) => s.signalType === 'startup_activity');
    const investmentSignal = signals.find((s) => s.signalType === 'investment_flow');
    const governmentSignal = signals.find((s) => s.signalType === 'government_push');

    let score = 50;

    if (growthTrend) {
      score = growthTrend.strength;
    }

    if (startupSignal) {
      score = score * 0.6 + startupSignal.aggregatedStrength * 0.4;
    }

    if (investmentSignal) {
      score = score * 0.8 + investmentSignal.aggregatedStrength * 0.2;
    }

    if (governmentSignal) {
      score = score * 0.9 + governmentSignal.aggregatedStrength * 0.1;
    }

    return Math.round(score);
  }

  /**
   * Calculate scarcity score.
   */
  private calculateScarcityScore(
    trends: MarketTrend[],
    signals: AggregateMarketSignal[]
  ): number {
    const skillTrend = trends.find((t) => t.trendType === 'skill_demand');
    const competitionTrend = trends.find((t) => t.trendType === 'competition');

    let score = 50;

    // Higher skill demand = higher scarcity
    if (skillTrend) {
      score = skillTrend.strength;
    }

    // More competition = lower scarcity (more people available)
    if (competitionTrend) {
      score = score * 0.7 + (100 - competitionTrend.strength) * 0.3;
    }

    return Math.round(score);
  }

  /**
   * Calculate automation risk score.
   */
  private calculateAutomationRiskScore(
    trends: MarketTrend[],
    signals: AggregateMarketSignal[]
  ): number {
    const automationTrend = trends.find((t) => t.trendType === 'automation_risk');
    const layoffSignal = signals.find((s) => s.signalType === 'layoffs');

    let score = 50;

    if (automationTrend) {
      score = automationTrend.strength;
    }

    // Layoffs may indicate automation risk
    if (layoffSignal) {
      score = score * 0.7 + layoffSignal.aggregatedStrength * 0.3;
    }

    return Math.round(score);
  }

  /**
   * Calculate future resilience score.
   */
  private calculateResilienceScore(
    trends: MarketTrend[],
    signals: AggregateMarketSignal[]
  ): number {
    // Resilience is inverse of automation risk + growth potential
    const automationRisk = this.calculateAutomationRiskScore(trends, signals);
    const growthScore = this.calculateGrowthScore(trends, signals);

    // Higher growth + lower automation = higher resilience
    return Math.round((growthScore * 0.6 + (100 - automationRisk) * 0.4));
  }

  /**
   * Calculate demand components.
   */
  private calculateDemandComponents(
    trends: MarketTrend[],
    signals: AggregateMarketSignal[]
  ): CareerMarketProfile['components']['demand'] {
    const demandTrend = trends.find((t) => t.trendType === 'demand');
    const hiringTrend = trends.find((t) => t.trendType === 'hiring_rate');
    const competitionTrend = trends.find((t) => t.trendType === 'competition');

    return {
      jobPostingsTrend: demandTrend?.rateOfChange ?? 0,
      hiringRate: hiringTrend?.strength ?? 50,
      competitionRatio: competitionTrend?.strength ?? 50,
    };
  }

  /**
   * Calculate salary components.
   */
  private calculateSalaryComponents(
    _trends: MarketTrend[],
    _signals: AggregateMarketSignal[]
  ): CareerMarketProfile['components']['salary'] {
    // Placeholder - would need granular salary data
    return {
      entryLevelTrend: 0,
      midLevelTrend: 0,
      seniorLevelTrend: 0,
    };
  }

  /**
   * Calculate growth components.
   */
  private calculateGrowthComponents(
    trends: MarketTrend[],
    signals: AggregateMarketSignal[]
  ): CareerMarketProfile['components']['growth'] {
    const growthTrend = trends.find((t) => t.trendType === 'growth');
    const startupSignal = signals.find((s) => s.signalType === 'startup_activity');
    const investmentSignal = signals.find((s) => s.signalType === 'investment_flow');

    return {
      sectorGrowth: growthTrend?.strength ?? 50,
      investmentFlow: investmentSignal?.aggregatedStrength ?? 50,
      startupActivity: startupSignal?.aggregatedStrength ?? 50,
    };
  }

  /**
   * Calculate scarcity components.
   */
  private calculateScarcityComponents(
    trends: MarketTrend[],
    _signals: AggregateMarketSignal[]
  ): CareerMarketProfile['components']['scarcity'] {
    const skillTrend = trends.find((t) => t.trendType === 'skill_demand');
    const competitionTrend = trends.find((t) => t.trendType === 'competition');

    return {
      qualifiedCandidatesRatio: competitionTrend ? 100 - competitionTrend.strength : 50,
      skillGapSeverity: skillTrend?.strength ?? 50,
      educationPipelineStrength: 50, // Placeholder
    };
  }

  /**
   * Calculate automation risk components.
   */
  private calculateAutomationRiskComponents(
    trends: MarketTrend[],
    _signals: AggregateMarketSignal[]
  ): CareerMarketProfile['components']['automationRisk'] {
    const automationTrend = trends.find((t) => t.trendType === 'automation_risk');

    return {
      taskAutomationPotential: automationTrend?.strength ?? 50,
      aiDisruptionRisk: automationTrend ? automationTrend.strength * 0.8 : 40,
      technologicalObsolescenceRisk: automationTrend ? automationTrend.strength * 0.6 : 30,
    };
  }

  /**
   * Calculate resilience components.
   */
  private calculateResilienceComponents(
    _trends: MarketTrend[],
    _signals: AggregateMarketSignal[]
  ): CareerMarketProfile['components']['resilience'] {
    // Placeholder - would need transferability analysis
    return {
      crossIndustryTransferability: 50,
      skillLongevity: 50,
      adaptabilityRequirements: 50,
    };
  }

  /**
   * Calculate market outlook.
   */
  private calculateOutlook(scores: {
    demandScore: number;
    salaryScore: number;
    growthScore: number;
    automationRiskScore: number;
    futureResilienceScore: number;
  }): MarketOutlook {
    const averageScore =
      (scores.demandScore +
        scores.salaryScore +
        scores.growthScore +
        scores.futureResilienceScore -
        scores.automationRiskScore) /
      5;

    if (averageScore >= OUTLOOK_SCORE_THRESHOLDS.excellent) return MarketOutlook.EXCELLENT;
    if (averageScore >= OUTLOOK_SCORE_THRESHOLDS.good) return MarketOutlook.GOOD;
    if (averageScore >= OUTLOOK_SCORE_THRESHOLDS.neutral) return MarketOutlook.NEUTRAL;
    if (averageScore >= OUTLOOK_SCORE_THRESHOLDS.caution) return MarketOutlook.CAUTION;
    return MarketOutlook.POOR;
  }

  /**
   * Extract key events from signals.
   */
  private extractKeyEvents(
    signals: AggregateMarketSignal[]
  ): CareerMarketProfile['evidence']['keyEvents'] {
    return signals.slice(0, 5).map((s) => ({
      date: s.timeRange.end,
      description: `${s.signalType} aggregated from ${s.sources.join(', ')}`,
      impact: s.aggregatedStrength > 50 ? 'positive' : 'negative',
    }));
  }

  /**
   * Get profiles requiring update.
   */
  async getProfilesRequiringUpdate(): Promise<string[]> {
    const maxAgeMs = this.config.updateFrequencyHours * 60 * 60 * 1000;
    const cutoffDate = new Date(Date.now() - maxAgeMs);

    const allProfiles = await this.repository.getAllProfiles();

    return allProfiles
      .filter((p) => p.lastUpdated < cutoffDate)
      .map((p) => p.careerId);
  }

  /**
   * Batch generate profiles.
   */
  async batchGenerateProfiles(
    inputs: ProfileGenerationInput[]
  ): Promise<CareerMarketProfile[]> {
    const profiles: CareerMarketProfile[] = [];

    for (const input of inputs) {
      const profile = await this.generateProfile(input);
      if (profile) {
        profiles.push(profile);
      }
    }

    return profiles;
  }
}

/**
 * Factory function for CareerMarketProfileEngine.
 */
export function createCareerMarketProfileEngine(
  repository: CareerMarketRepository,
  confidenceEngine: MarketConfidenceEngine,
  config?: Partial<CareerMarketProfileEngineConfig>
): CareerMarketProfileEngine {
  return new CareerMarketProfileEngine(repository, confidenceEngine, config);
}
