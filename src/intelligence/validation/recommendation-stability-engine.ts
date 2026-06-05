/**
 * Recommendation Stability Engine
 *
 * Verifies recommendation stability across perturbations:
 * - Small wording changes
 * - Reordered answers
 * - Session restarts
 * - Time delays
 * - Noise injection
 */

import {
  StabilityReport,
  ValidationTimestamp,
  ValidationId,
  DriftScore,
  DEFAULT_VALIDATION_CONFIG,
  ValidationConfig,
} from './validation-types';

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface StabilityConfig {
  // Drift thresholds
  maxAcceptableDrift: number; // E.g., 15 (15%)
  warningDrift: number; // E.g., 10 (10%)

  // Perturbation settings
  wordingVariations: number;
  reorderVariations: number;
  noiseLevels: number[];
  timeDelays: number[]; // ms

  // Ranking tolerance
  maxRankChange: number; // Maximum acceptable rank change

  // Statistical settings
  confidenceThreshold: number; // For determining significant drift
}

export const DEFAULT_STABILITY_CONFIG: StabilityConfig = {
  maxAcceptableDrift: 15,
  warningDrift: 10,
  wordingVariations: 5,
  reorderVariations: 3,
  noiseLevels: [0.05, 0.1, 0.15],
  timeDelays: [0, 1000, 5000],
  maxRankChange: 2,
  confidenceThreshold: 0.95,
};

// ============================================================================
// INPUTS
// ============================================================================

export interface RecommendationSnapshot {
  recommendationId: string;
  careerId: string;
  careerName: string;
  rank: number;
  confidence: number;
  score: number;
  timestamp: ValidationTimestamp;
  engines: Record<string, { score: number; confidence: number }>;
}

export interface PerturbationInput {
  type: 'wording-change' | 'reorder' | 'session-restart' | 'time-delay' | 'noise-injection';
  description: string;
  originalInput: Record<string, unknown>;
  perturbedInput: Record<string, unknown>;
}

// ============================================================================
// ENGINE
// ============================================================================

export class RecommendationStabilityEngine {
  private config: StabilityConfig;
  private validationConfig: ValidationConfig;

  constructor(
    config: Partial<StabilityConfig> = {},
    validationConfig: Partial<ValidationConfig> = {}
  ) {
    this.config = { ...DEFAULT_STABILITY_CONFIG, ...config };
    this.validationConfig = { ...DEFAULT_VALIDATION_CONFIG, ...validationConfig };
  }

  /**
   * Run stability analysis
   */
  async analyzeStability(
    studentId: string,
    baseRecommendations: RecommendationSnapshot[],
    perturbations: PerturbationInput[],
    recommendationProvider: (
      input: Record<string, unknown>
    ) => Promise<RecommendationSnapshot[]>
  ): Promise<StabilityReport> {
    const reportId = `stability-${studentId}-${Date.now()}`;
    const generatedAt = Date.now();

    const perturbationResults: StabilityReport['perturbationResults'] = [];

    for (const perturbation of perturbations) {
      try {
        // Get recommendations for perturbed input
        const perturbedRecommendations = await recommendationProvider(perturbation.perturbedInput);

        // Calculate drift
        const drift = this.calculateDrift(baseRecommendations, perturbedRecommendations);

        perturbationResults.push({
          perturbationType: perturbation.type,
          description: perturbation.description,
          originalRecommendation: this.getTopRecommendation(baseRecommendations),
          perturbedRecommendation: this.getTopRecommendation(perturbedRecommendations),
          recommendationDrift: drift.recommendationDrift,
          confidenceDrift: drift.confidenceDrift,
          rankDrift: drift.rankDrift,
          acceptable: this.isAcceptableDrift(drift),
        });
      } catch (error) {
        // Record failed perturbation
        perturbationResults.push({
          perturbationType: perturbation.type,
          description: `${perturbation.description} (FAILED: ${error})`,
          originalRecommendation: this.getTopRecommendation(baseRecommendations),
          perturbedRecommendation: 'ERROR',
          recommendationDrift: 100,
          confidenceDrift: 100,
          rankDrift: 100,
          acceptable: false,
        });
      }
    }

    // Calculate overall stability
    const overallStability = this.calculateOverallStability(perturbationResults);

    // Calculate drift metrics
    const driftMetrics = this.calculateDriftMetrics(perturbationResults);

    // Calculate engine stability
    const engineStability = this.calculateEngineStability(
      baseRecommendations,
      perturbations,
      recommendationProvider
    );

    // Determine if passed
    const passed = overallStability.score >= this.validationConfig.stabilityThresholds.stable;

    return {
      reportId,
      generatedAt,
      studentId,
      overallStability,
      perturbationResults,
      driftMetrics,
      engineStability,
      thresholdUsed: this.config.maxAcceptableDrift,
      passed,
    };
  }

  /**
   * Quick stability check for single perturbation
   */
  checkStability(
    original: RecommendationSnapshot[],
    perturbed: RecommendationSnapshot[]
  ): {
    stable: boolean;
    recommendationDrift: DriftScore;
    confidenceDrift: DriftScore;
    rankDrift: DriftScore;
    details: string;
  } {
    const drift = this.calculateDrift(original, perturbed);
    const stable = this.isAcceptableDrift(drift);

    return {
      stable,
      recommendationDrift: drift.recommendationDrift,
      confidenceDrift: drift.confidenceDrift,
      rankDrift: drift.rankDrift,
      details: this.generateDriftDetails(original, perturbed, drift),
    };
  }

  /**
   * Generate perturbation variations for testing
   */
  generatePerturbations(
    baseInput: Record<string, unknown>,
    options?: {
      includeWording?: boolean;
      includeReorder?: boolean;
      includeNoise?: boolean;
      includeTimeDelay?: boolean;
    }
  ): PerturbationInput[] {
    const perturbations: PerturbationInput[] = [];

    // Wording variations
    if (options?.includeWording !== false) {
      for (let i = 0; i < this.config.wordingVariations; i++) {
        perturbations.push({
          type: 'wording-change',
          description: `Wording variation ${i + 1}`,
          originalInput: baseInput,
          perturbedInput: this.applyWordingVariation(baseInput, i),
        });
      }
    }

    // Reorder variations
    if (options?.includeReorder !== false) {
      for (let i = 0; i < this.config.reorderVariations; i++) {
        perturbations.push({
          type: 'reorder',
          description: `Reorder variation ${i + 1}`,
          originalInput: baseInput,
          perturbedInput: this.applyReorderVariation(baseInput, i),
        });
      }
    }

    // Noise injection
    if (options?.includeNoise !== false) {
      for (const noiseLevel of this.config.noiseLevels) {
        perturbations.push({
          type: 'noise-injection',
          description: `Noise injection (${noiseLevel * 100}%)`,
          originalInput: baseInput,
          perturbedInput: this.applyNoise(baseInput, noiseLevel),
        });
      }
    }

    // Time delays (these would be handled differently in practice)
    if (options?.includeTimeDelay !== false) {
      for (const delay of this.config.timeDelays) {
        if (delay > 0) {
          perturbations.push({
            type: 'time-delay',
            description: `Time delay (${delay}ms)`,
            originalInput: baseInput,
            perturbedInput: { ...baseInput, _timestamp: Date.now() + delay },
          });
        }
      }
    }

    return perturbations;
  }

  /**
   * Calculate drift score between two recommendation sets
   */
  calculateDriftScore(
    original: RecommendationSnapshot[],
    perturbed: RecommendationSnapshot[]
  ): DriftScore {
    const drift = this.calculateDrift(original, perturbed);
    return (drift.recommendationDrift + drift.confidenceDrift + drift.rankDrift) / 3;
  }

  /**
   * Get stability rating
   */
  getStabilityRating(score: number): StabilityReport['overallStability']['status'] {
    if (score >= this.validationConfig.stabilityThresholds.highlyStable) return 'highly-stable';
    if (score >= this.validationConfig.stabilityThresholds.stable) return 'stable';
    if (score >= this.validationConfig.stabilityThresholds.moderate) return 'moderate';
    if (score >= this.validationConfig.stabilityThresholds.unstable) return 'unstable';
    return 'highly-unstable';
  }

  /**
   * Get current config
   */
  getConfig(): StabilityConfig {
    return { ...this.config };
  }

  /**
   * Update config
   */
  updateConfig(config: Partial<StabilityConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private calculateDrift(
    original: RecommendationSnapshot[],
    perturbed: RecommendationSnapshot[]
  ): {
    recommendationDrift: DriftScore;
    confidenceDrift: DriftScore;
    rankDrift: DriftScore;
  } {
    // Handle empty arrays
    if (original.length === 0 && perturbed.length === 0) {
      return {
        recommendationDrift: 0,
        confidenceDrift: 0,
        rankDrift: 0,
      };
    }

    // Get top recommendation IDs
    const originalTop = original.slice(0, 3).map(r => r.careerId);
    const perturbedTop = perturbed.slice(0, 3).map(r => r.careerId);

    // Calculate recommendation drift (Jaccard distance)
    const intersection = originalTop.filter(id => perturbedTop.includes(id));
    const union = [...new Set([...originalTop, ...perturbedTop])];
    const jaccardSimilarity = union.length > 0 ? intersection.length / union.length : 0;
    const recommendationDrift = (1 - jaccardSimilarity) * 100;

    // Calculate confidence drift
    let confidenceDiffSum = 0;
    let count = 0;
    for (const origRec of original.slice(0, 5)) {
      const pertRec = perturbed.find(r => r.careerId === origRec.careerId);
      if (pertRec) {
        confidenceDiffSum += Math.abs(origRec.confidence - pertRec.confidence);
        count++;
      }
    }
    const confidenceDrift = count > 0 ? confidenceDiffSum / count : 100;

    // Calculate rank drift (Spearman-like)
    let rankDiffSum = 0;
    let rankCount = 0;
    for (let i = 0; i < Math.min(original.length, 5); i++) {
      const origRec = original[i];
      const perturbedIndex = perturbed.findIndex(r => r.careerId === origRec.careerId);
      if (perturbedIndex !== -1) {
        rankDiffSum += Math.abs(i - perturbedIndex);
        rankCount++;
      }
    }
    const rankDrift = rankCount > 0 ? (rankDiffSum / rankCount) * 20 : 100; // Scale to 0-100

    return {
      recommendationDrift: Math.round(recommendationDrift),
      confidenceDrift: Math.round(confidenceDrift),
      rankDrift: Math.min(100, Math.round(rankDrift)),
    };
  }

  private isAcceptableDrift(drift: {
    recommendationDrift: DriftScore;
    confidenceDrift: DriftScore;
    rankDrift: DriftScore;
  }): boolean {
    return (
      drift.recommendationDrift <= this.config.maxAcceptableDrift &&
      drift.confidenceDrift <= this.config.maxAcceptableDrift &&
      drift.rankDrift <= this.config.maxAcceptableDrift * 2 // Allow slightly more rank drift
    );
  }

  private getTopRecommendation(recommendations: RecommendationSnapshot[]): string {
    const top = recommendations[0];
    return top ? `${top.careerName} (rank ${top.rank})` : 'None';
  }

  private calculateOverallStability(
    results: StabilityReport['perturbationResults']
  ): StabilityReport['overallStability'] {
    if (results.length === 0) {
      return { score: 0, status: 'highly-unstable' };
    }

    const acceptableCount = results.filter(r => r.acceptable).length;
    const score = (acceptableCount / results.length) * 100;

    return {
      score: Math.round(score),
      status: this.getStabilityRating(score),
    };
  }

  private calculateDriftMetrics(
    results: StabilityReport['perturbationResults']
  ): StabilityReport['driftMetrics'] {
    if (results.length === 0) {
      return {
        recommendationDrift: { mean: 0, max: 0, std: 0 },
        confidenceDrift: { mean: 0, max: 0, std: 0 },
        rankDrift: { mean: 0, max: 0, std: 0 },
      };
    }

    const calcStats = (values: number[]) => {
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const max = Math.max(...values);
      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
      const std = Math.sqrt(variance);
      return { mean: Math.round(mean), max, std: Math.round(std * 10) / 10 };
    };

    return {
      recommendationDrift: calcStats(results.map(r => r.recommendationDrift)),
      confidenceDrift: calcStats(results.map(r => r.confidenceDrift)),
      rankDrift: calcStats(results.map(r => r.rankDrift)),
    };
  }

  private async calculateEngineStability(
    baseRecommendations: RecommendationSnapshot[],
    perturbations: PerturbationInput[],
    recommendationProvider: (input: Record<string, unknown>) => Promise<RecommendationSnapshot[]>
  ): Promise<StabilityReport['engineStability']> {
    const engineStability: StabilityReport['engineStability'] = {};

    // Get unique engines from base recommendations
    const engines = new Set<string>();
    for (const rec of baseRecommendations) {
      Object.keys(rec.engines).forEach(e => engines.add(e));
    }

    for (const engineId of engines) {
      let driftCount = 0;
      let totalScore = 0;

      for (const perturbation of perturbations.slice(0, 3)) {
        try {
          const perturbed = await recommendationProvider(perturbation.perturbedInput);
          const origEngineScore = baseRecommendations[0]?.engines[engineId]?.score || 0;
          const pertEngineScore = perturbed[0]?.engines[engineId]?.score || 0;
          const diff = Math.abs(origEngineScore - pertEngineScore);

          if (diff > 0.1) driftCount++;
          totalScore += diff;
        } catch {
          driftCount++;
        }
      }

      const score = perturbations.length > 0 ? 100 - (driftCount / perturbations.length) * 100 : 100;

      engineStability[engineId] = {
        score: Math.round(score),
        driftCount,
      };
    }

    return engineStability;
  }

  private generateDriftDetails(
    original: RecommendationSnapshot[],
    perturbed: RecommendationSnapshot[],
    drift: { recommendationDrift: number; confidenceDrift: number; rankDrift: number }
  ): string {
    const parts: string[] = [];

    if (drift.recommendationDrift > 0) {
      const origTop = original[0]?.careerName || 'None';
      const pertTop = perturbed[0]?.careerName || 'None';
      parts.push(`Top recommendation changed from "${origTop}" to "${pertTop}"`);
    }

    if (drift.confidenceDrift > 5) {
      parts.push(`Confidence drift: ${drift.confidenceDrift.toFixed(1)}%`);
    }

    if (drift.rankDrift > 10) {
      parts.push(`Significant ranking changes detected`);
    }

    return parts.join('; ') || 'No significant drift';
  }

  private applyWordingVariation(input: Record<string, unknown>, variationIndex: number): Record<string, unknown> {
    // Simulate wording variations by slightly modifying text fields
    const variations = [
      (text: string) => text?.toUpperCase() || text,
      (text: string) => text?.toLowerCase() || text,
      (text: string) => text?.trim() || text,
      (text: string) => text?.replace(/\./g, '!') || text,
      (text: string) => text?.replace(/\?/g, '.') || text,
    ];

    const vary = variations[variationIndex % variations.length];

    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      if (typeof value === 'string') {
        result[key] = vary(value);
      } else if (typeof value === 'object' && value !== null) {
        result[key] = this.applyWordingVariation(value as Record<string, unknown>, variationIndex);
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  private applyReorderVariation(input: Record<string, unknown>, variationIndex: number): Record<string, unknown> {
    // Simulate reordering by rotating array elements
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(input)) {
      if (Array.isArray(value)) {
        const shift = (variationIndex + 1) % Math.max(1, value.length);
        result[key] = [...value.slice(shift), ...value.slice(0, shift)];
      } else if (typeof value === 'object' && value !== null) {
        result[key] = this.applyReorderVariation(value as Record<string, unknown>, variationIndex);
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  private applyNoise(input: Record<string, unknown>, noiseLevel: number): Record<string, unknown> {
    // Apply random noise to numeric values
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(input)) {
      if (typeof value === 'number') {
        const noise = (Math.random() - 0.5) * 2 * noiseLevel * value;
        result[key] = Math.max(0, Math.min(1, value + noise));
      } else if (typeof value === 'object' && value !== null) {
        result[key] = this.applyNoise(value as Record<string, unknown>, noiseLevel);
      } else {
        result[key] = value;
      }
    }

    return result;
  }
}

export default RecommendationStabilityEngine;
