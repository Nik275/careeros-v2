/**
 * CareerOS Market Intelligence - Career Market Profile Engine
 *
 * Main orchestrator for generating career market profiles.
 *
 * Converts:
 * - MarketSignals
 *
 * Into:
 * - CareerMarketProfiles
 *
 * Single source of truth for career market intelligence.
 * All recommendation systems must consume these profiles.
 */

import type {
  MarketSignal,
  NormalizedMarketSignal,
  AggregateMarketSignal,
} from '../models/MarketSignal';
import type {
  CareerMarketProfile,
  CareerMarketProfileId,
  GeographicPresence,
} from './models/CareerMarketProfile';
import type { OpportunityAnalysis } from './models/OpportunityAnalysis';
import type { CompleteScoreBreakdown } from './models/MarketScoreBreakdown';

import { DemandScoringEngine, createDemandScoringEngine } from './DemandScoringEngine';
import { SalaryScoringEngine, createSalaryScoringEngine } from './SalaryScoringEngine';
import { GrowthScoringEngine, createGrowthScoringEngine } from './GrowthScoringEngine';
import { ScarcityScoringEngine, createScarcityScoringEngine } from './ScarcityScoringEngine';
import { AutomationRiskEngine, createAutomationRiskEngine } from './AutomationRiskEngine';
import { FutureResilienceEngine, createFutureResilienceEngine } from './FutureResilienceEngine';
import { OpportunityScoringEngine, createOpportunityScoringEngine } from './OpportunityScoringEngine';

/**
 * Configuration for the profile generation engine.
 */
export interface ProfileEngineConfig {
  /** Minimum signals required for profile generation */
  minSignals: number;

  /** Maximum age of signals (days) */
  maxSignalAgeDays: number;

  /** Enable geographic analysis */
  enableGeographicAnalysis: boolean;

  /** Enable opportunity analysis */
  enableOpportunityAnalysis: boolean;

  /** Confidence threshold for profile validity */
  minConfidenceThreshold: number;
}

/**
 * Default configuration.
 */
export const DEFAULT_PROFILE_ENGINE_CONFIG: ProfileEngineConfig = {
  minSignals: 5,
  maxSignalAgeDays: 90,
  enableGeographicAnalysis: true,
  enableOpportunityAnalysis: true,
  minConfidenceThreshold: 40,
};

/**
 * Result of profile generation.
 */
export interface ProfileGenerationResult {
  /** Whether generation was successful */
  success: boolean;

  /** Generated profile (if successful) */
  profile?: CareerMarketProfile;

  /** Error details (if failed) */
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };

  /** Generation metadata */
  metadata: {
    careerId: string;
    startedAt: Date;
    completedAt: Date;
    durationMs: number;
    signalsUsed: number;
    scoresCalculated: number;
  };
}

/**
 * Input for profile generation.
 */
export interface ProfileGenerationInput {
  /** Career identifier */
  careerId: string;

  /** Raw market signals */
  signals: MarketSignal[];

  /** Normalized signals */
  normalizedSignals: NormalizedMarketSignal[];

  /** Aggregate signals */
  aggregateSignals: AggregateMarketSignal[];

  /** Previous profile (for versioning) */
  previousProfile?: CareerMarketProfile;

  /** Target geography (optional) */
  targetGeography?: string;
}

/**
 * Orchestrates the generation of career market profiles.
 *
 * This is the main entry point for converting raw market signals
 * into actionable career intelligence.
 */
export class CareerMarketProfileEngine {
  private config: ProfileEngineConfig;

  // Sub-engines
  private demandEngine: DemandScoringEngine;
  private salaryEngine: SalaryScoringEngine;
  private growthEngine: GrowthScoringEngine;
  private scarcityEngine: ScarcityScoringEngine;
  private automationRiskEngine: AutomationRiskEngine;
  private resilienceEngine: FutureResilienceEngine;
  private opportunityEngine: OpportunityScoringEngine;

  constructor(config?: Partial<ProfileEngineConfig>) {
    this.config = { ...DEFAULT_PROFILE_ENGINE_CONFIG, ...config };

    // Initialize sub-engines
    this.demandEngine = createDemandScoringEngine();
    this.salaryEngine = createSalaryScoringEngine();
    this.growthEngine = createGrowthScoringEngine();
    this.scarcityEngine = createScarcityScoringEngine();
    this.automationRiskEngine = createAutomationRiskEngine();
    this.resilienceEngine = createFutureResilienceEngine();
    this.opportunityEngine = createOpportunityScoringEngine();
  }

  /**
   * Generate a complete career market profile.
   *
   * This is the main entry point for profile generation.
   */
  generateProfile(input: ProfileGenerationInput): ProfileGenerationResult {
    const startedAt = new Date();
    const startTime = Date.now();

    try {
      // Validate input
      const validation = this.validateInput(input);
      if (!validation.valid) {
        return {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: validation.error ?? 'Invalid profile generation input',
          },
          metadata: {
            careerId: input.careerId,
            startedAt,
            completedAt: new Date(),
            durationMs: Date.now() - startTime,
            signalsUsed: 0,
            scoresCalculated: 0,
          },
        };
      }

      // Calculate individual scores
      const demandResult = this.demandEngine.calculateScore(
        input.careerId,
        input.normalizedSignals,
        input.aggregateSignals
      );

      const salaryResult = this.salaryEngine.calculateScore(
        input.careerId,
        input.normalizedSignals,
        input.aggregateSignals
      );

      const growthResult = this.growthEngine.calculateScore(
        input.careerId,
        input.normalizedSignals,
        input.aggregateSignals
      );

      const scarcityResult = this.scarcityEngine.calculateScore(
        input.careerId,
        input.normalizedSignals,
        input.aggregateSignals
      );

      const automationRiskResult = this.automationRiskEngine.calculateScore(
        input.careerId,
        input.normalizedSignals,
        input.aggregateSignals
      );

      const resilienceResult = this.resilienceEngine.calculateScore(
        input.careerId,
        input.normalizedSignals,
        input.aggregateSignals
      );

      // Build partial profile for opportunity scoring
      const partialProfile: Omit<CareerMarketProfile, 'id' | 'opportunityScore' | 'breakdowns'> = {
        careerId: input.careerId,
        demandScore: demandResult.score,
        salaryScore: salaryResult.score,
        growthScore: growthResult.score,
        scarcityScore: scarcityResult.score,
        automationRiskScore: automationRiskResult.score,
        futureResilienceScore: resilienceResult.score,
        confidence: 0, // Will be calculated
        confidenceBreakdown: {
          demandConfidence: demandResult.breakdown.confidence,
          salaryConfidence: salaryResult.breakdown.confidence,
          growthConfidence: growthResult.breakdown.confidence,
          scarcityConfidence: scarcityResult.breakdown.confidence,
          automationRiskConfidence: automationRiskResult.breakdown.confidence,
          resilienceConfidence: resilienceResult.breakdown.confidence,
        },
        version: (input.previousProfile?.version ?? 0) + 1,
        lastUpdated: new Date(),
        dataFreshness: this.calculateDataFreshness(input.normalizedSignals),
        signalCount: input.normalizedSignals.length,
        sourceCount: new Set(input.normalizedSignals.map((s) => s.source)).size,
        outlook: 'neutral', // Will be determined
        trendDirection: 'stable', // Will be determined
        geographicPresence: this.calculateGeographicPresence(input.normalizedSignals),
        topRegions: [], // Will be populated
        insights: [], // Will be populated
        riskFlags: [], // Will be populated
      };

      // Calculate overall confidence
      const confidence = this.calculateOverallConfidence(
        partialProfile.confidenceBreakdown
      );

      // Calculate opportunity score
      const opportunityResult = this.opportunityEngine.calculateScore({
        ...partialProfile,
        confidence,
      });

      // Determine outlook and trend
      const outlook = this.determineOutlook(
        demandResult.score,
        salaryResult.score,
        growthResult.score,
        automationRiskResult.score,
        resilienceResult.score
      );

      const trendDirection = this.determineTrendDirection(
        input.previousProfile,
        demandResult.score,
        salaryResult.score,
        growthResult.score,
        opportunityResult.score
      );

      // Build complete breakdowns
      const breakdowns: CareerMarketProfile['breakdowns'] = {
        demand: demandResult.breakdown,
        salary: salaryResult.breakdown,
        growth: growthResult.breakdown,
        scarcity: scarcityResult.breakdown,
        automationRisk: automationRiskResult.breakdown,
        resilience: resilienceResult.breakdown,
        opportunity: opportunityResult.breakdown,
      };

      // Generate insights and risk flags
      const insights = this.generateInsights(
        demandResult.score,
        salaryResult.score,
        growthResult.score,
        scarcityResult.score,
        automationRiskResult.score,
        resilienceResult.score,
        opportunityResult.score
      );

      const riskFlags = this.identifyRiskFlags(
        demandResult.score,
        automationRiskResult.score,
        confidence,
        trendDirection
      );

      // Build complete profile
      const profile: CareerMarketProfile = {
        id: this.generateProfileId(input.careerId),
        careerId: input.careerId,
        demandScore: demandResult.score,
        salaryScore: salaryResult.score,
        growthScore: growthResult.score,
        scarcityScore: scarcityResult.score,
        automationRiskScore: automationRiskResult.score,
        futureResilienceScore: resilienceResult.score,
        opportunityScore: opportunityResult.score,
        confidence,
        confidenceBreakdown: partialProfile.confidenceBreakdown,
        version: partialProfile.version,
        lastUpdated: new Date(),
        dataFreshness: partialProfile.dataFreshness,
        signalCount: partialProfile.signalCount,
        sourceCount: partialProfile.sourceCount,
        outlook,
        trendDirection,
        geographicPresence: partialProfile.geographicPresence,
        topRegions: this.getTopRegions(partialProfile.geographicPresence),
        breakdowns,
        insights,
        riskFlags,
      };

      const completedAt = new Date();

      return {
        success: true,
        profile,
        metadata: {
          careerId: input.careerId,
          startedAt,
          completedAt,
          durationMs: Date.now() - startTime,
          signalsUsed: input.normalizedSignals.length,
          scoresCalculated: 7,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'GENERATION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: { error },
        },
        metadata: {
          careerId: input.careerId,
          startedAt,
          completedAt: new Date(),
          durationMs: Date.now() - startTime,
          signalsUsed: 0,
          scoresCalculated: 0,
        },
      };
    }
  }

  /**
   * Generate opportunity analysis for a profile.
   */
  generateOpportunityAnalysis(profile: CareerMarketProfile): OpportunityAnalysis {
    return this.opportunityEngine.generateAnalysis(profile);
  }

  /**
   * Compare two career profiles.
   */
  compareProfiles(
    profileA: CareerMarketProfile,
    profileB: CareerMarketProfile
  ): {
    scores: Record<string, { a: number; b: number; diff: number; winner: 'a' | 'b' | 'tie' }>;
    overallWinner: 'a' | 'b' | 'tie';
    confidence: number;
  } {
    const scores = [
      'demandScore',
      'salaryScore',
      'growthScore',
      'scarcityScore',
      'futureResilienceScore',
      'opportunityScore',
    ] as const;

    const comparison: Record<string, { a: number; b: number; diff: number; winner: 'a' | 'b' | 'tie' }> = {};

    let aWins = 0;
    let bWins = 0;

    for (const score of scores) {
      const a = profileA[score];
      const b = profileB[score];
      const diff = b - a;
      let winner: 'a' | 'b' | 'tie' = 'tie';

      if (Math.abs(diff) > 5) {
        winner = diff > 0 ? 'b' : 'a';
      }

      if (winner === 'a') aWins++;
      if (winner === 'b') bWins++;

      comparison[score] = { a, b, diff, winner };
    }

    // Special handling for automation risk (lower is better)
    const autoDiff = profileA.automationRiskScore - profileB.automationRiskScore;
    let autoWinner: 'a' | 'b' | 'tie' = 'tie';
    if (Math.abs(autoDiff) > 5) {
      autoWinner = autoDiff > 0 ? 'b' : 'a';
    }
    if (autoWinner === 'a') aWins++;
    if (autoWinner === 'b') bWins++;

    comparison['automationRiskScore'] = {
      a: profileA.automationRiskScore,
      b: profileB.automationRiskScore,
      diff: autoDiff,
      winner: autoWinner,
    };

    const overallWinner = aWins > bWins ? 'a' : bWins > aWins ? 'b' : 'tie';
    const avgConfidence = (profileA.confidence + profileB.confidence) / 2;

    return {
      scores: comparison,
      overallWinner,
      confidence: Math.round(avgConfidence),
    };
  }

  /**
   * Get complete score breakdown.
   */
  getScoreBreakdown(profile: CareerMarketProfile): CompleteScoreBreakdown {
    return {
      careerId: profile.careerId,
      generatedAt: new Date(),
      demand: profile.breakdowns.demand,
      salary: profile.breakdowns.salary,
      growth: profile.breakdowns.growth,
      scarcity: profile.breakdowns.scarcity,
      automationRisk: profile.breakdowns.automationRisk,
      resilience: profile.breakdowns.resilience,
      opportunity: profile.breakdowns.opportunity,
      overallConfidence: profile.confidence,
      dataQuality: {
        signalCount: profile.signalCount,
        sourceDiversity: profile.sourceCount,
        freshness: Math.max(0, 100 - profile.dataFreshness),
        consistency: profile.confidence,
      },
    };
  }

  /**
   * Validate generation input.
   */
  private validateInput(input: ProfileGenerationInput): { valid: boolean; error?: string } {
    if (!input.careerId) {
      return { valid: false, error: 'Career ID is required' };
    }

    if (input.normalizedSignals.length < this.config.minSignals) {
      return {
        valid: false,
        error: `Insufficient signals: ${input.normalizedSignals.length} < ${this.config.minSignals}`,
      };
    }

    // Check signal freshness
    const cutoff = Date.now() - this.config.maxSignalAgeDays * 24 * 60 * 60 * 1000;
    const freshSignals = input.normalizedSignals.filter(
      (s) => s.timestamp.getTime() > cutoff
    );

    if (freshSignals.length < this.config.minSignals) {
      return {
        valid: false,
        error: `Insufficient fresh signals: ${freshSignals.length} fresh signals available`,
      };
    }

    return { valid: true };
  }

  /**
   * Generate unique profile ID.
   */
  private generateProfileId(careerId: string): CareerMarketProfileId {
    return `profile-${careerId}-${Date.now()}` as CareerMarketProfileId;
  }

  /**
   * Calculate overall confidence.
   */
  private calculateOverallConfidence(breakdown: CareerMarketProfile['confidenceBreakdown']): number {
    const scores = [
      breakdown.demandConfidence,
      breakdown.salaryConfidence,
      breakdown.growthConfidence,
      breakdown.scarcityConfidence,
      breakdown.automationRiskConfidence,
      breakdown.resilienceConfidence,
    ];

    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const min = Math.min(...scores);

    // Weight average more, but penalize low minimum
    return Math.round(avg * 0.7 + min * 0.3);
  }

  /**
   * Calculate data freshness (hours since newest signal).
   */
  private calculateDataFreshness(signals: NormalizedMarketSignal[]): number {
    if (signals.length === 0) return Infinity;

    const newest = Math.max(...signals.map((s) => s.timestamp.getTime()));
    const hours = (Date.now() - newest) / (1000 * 60 * 60);

    return Math.round(hours);
  }

  /**
   * Calculate geographic presence.
   */
  private calculateGeographicPresence(signals: NormalizedMarketSignal[]): GeographicPresence[] {
    const byRegion = new Map<string, NormalizedMarketSignal[]>();

    for (const signal of signals) {
      const existing = byRegion.get(signal.geography) ?? [];
      existing.push(signal);
      byRegion.set(signal.geography, existing);
    }

    const presence: GeographicPresence[] = [];

    for (const [region, regionSignals] of byRegion) {
      const avgStrength =
        regionSignals.reduce((sum, s) => sum + s.normalizedStrength, 0) /
        regionSignals.length;

      presence.push({
        region,
        demandScore: Math.round(avgStrength),
        salaryScore: Math.round(avgStrength * 0.9), // Placeholder
        jobCount: regionSignals.length,
        growthRate: 0, // Would calculate from time series
      });
    }

    return presence.sort((a, b) => b.demandScore - a.demandScore);
  }

  /**
   * Get top regions by demand.
   */
  private getTopRegions(presence: GeographicPresence[]): string[] {
    return presence
      .sort((a, b) => b.demandScore - a.demandScore)
      .slice(0, 5)
      .map((p) => p.region);
  }

  /**
   * Determine market outlook.
   */
  private determineOutlook(
    demand: number,
    salary: number,
    growth: number,
    automationRisk: number,
    resilience: number
  ): CareerMarketProfile['outlook'] {
    const weightedScore =
      demand * 0.25 +
      salary * 0.2 +
      growth * 0.2 +
      resilience * 0.2 +
      (100 - automationRisk) * 0.15;

    if (weightedScore >= 80) return 'excellent';
    if (weightedScore >= 65) return 'good';
    if (weightedScore >= 45) return 'neutral';
    if (weightedScore >= 30) return 'caution';
    return 'poor';
  }

  /**
   * Determine trend direction.
   */
  private determineTrendDirection(
    previousProfile: CareerMarketProfile | undefined,
    demand: number,
    salary: number,
    growth: number,
    opportunity: number
  ): CareerMarketProfile['trendDirection'] {
    if (!previousProfile) return 'stable';

    const currentScores = [demand, salary, growth, opportunity];
    const previousScores = [
      previousProfile.demandScore,
      previousProfile.salaryScore,
      previousProfile.growthScore,
      previousProfile.opportunityScore,
    ];

    const currentAvg = currentScores.reduce((a, b) => a + b, 0) / currentScores.length;
    const previousAvg = previousScores.reduce((a, b) => a + b, 0) / previousScores.length;

    const change = currentAvg - previousAvg;
    const volatility = Math.abs(change);

    if (volatility > 15) return 'volatile';
    if (change > 5) return 'improving';
    if (change < -5) return 'declining';
    return 'stable';
  }

  /**
   * Generate insights.
   */
  private generateInsights(
    demand: number,
    salary: number,
    growth: number,
    scarcity: number,
    automationRisk: number,
    resilience: number,
    opportunity: number
  ): string[] {
    const insights: string[] = [];

    if (demand >= 80) insights.push('Exceptional demand in labor market');
    if (salary >= 80) insights.push('Strong compensation potential');
    if (growth >= 80) insights.push('Rapid market expansion');
    if (scarcity >= 70) insights.push('Significant talent shortage creates opportunity');
    if (automationRisk <= 30) insights.push('Well-positioned against automation');
    if (resilience >= 80) insights.push('High future resilience');
    if (opportunity >= 80) insights.push('Excellent overall opportunity');

    if (demand < 40) insights.push('Low market demand observed');
    if (automationRisk >= 70) insights.push('Elevated automation risk - skill development critical');

    return insights;
  }

  /**
   * Identify risk flags.
   */
  private identifyRiskFlags(
    demand: number,
    automationRisk: number,
    confidence: number,
    trendDirection: CareerMarketProfile['trendDirection']
  ): string[] {
    const flags: string[] = [];

    if (automationRisk >= 70) flags.push('critical-automation-risk');
    if (automationRisk >= 50) flags.push('elevated-automation-risk');
    if (demand < 30) flags.push('very-low-demand');
    if (confidence < 40) flags.push('low-confidence-data');
    if (trendDirection === 'declining') flags.push('declining-trend');

    return flags;
  }

  /**
   * Batch generate profiles for multiple careers.
   */
  async generateProfiles(
    inputs: ProfileGenerationInput[]
  ): Promise<ProfileGenerationResult[]> {
    const results: ProfileGenerationResult[] = [];

    for (const input of inputs) {
      const result = this.generateProfile(input);
      results.push(result);
    }

    return results;
  }

  /**
   * Update configuration.
   */
  updateConfig(config: Partial<ProfileEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration.
   */
  getConfig(): ProfileEngineConfig {
    return { ...this.config };
  }
}

/**
 * Factory function for CareerMarketProfileEngine.
 */
export function createCareerMarketProfileEngine(
  config?: Partial<ProfileEngineConfig>
): CareerMarketProfileEngine {
  return new CareerMarketProfileEngine(config);
}
