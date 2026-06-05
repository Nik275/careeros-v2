/**
 * Perturbation Engine
 *
 * Phase 8.4: Recommendation Stability Engine - Part 1
 *
 * Generates realistic profile perturbations to simulate:
 * - Answer uncertainty
 * - Self-perception fluctuation
 * - Mood variation
 * - Confidence variation
 * - Small inconsistencies
 *
 * All perturbations preserve overall profile identity.
 *
 * @module perturbation-engine
 * @version 1.0.0
 */

import {
  DimensionScoreMap,
  DimensionScore,
} from '../../assessment/assessment-types';
import {
  PerturbationConfig,
  PerturbationIntensity,
  PerturbationStrategy,
  PerturbationResult,
  PerturbedProfile,
  PerturbationStatistics,
  PerturbationId,
  PERTURBATION_PARAMS,
} from './recommendation-stability-types';

/**
 * Seeded random number generator for reproducible perturbations
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number = Date.now()) {
    this.seed = seed;
  }

  /**
   * Generate next random number between 0 and 1
   */
  next(): number {
    // Linear congruential generator
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }

  /**
   * Generate normally distributed random number (Box-Muller transform)
   */
  nextGaussian(mean: number = 0, stdDev: number = 1): number {
    let u = 0;
    let v = 0;
    while (u === 0) u = this.next();
    while (v === 0) v = this.next();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + z * stdDev;
  }

  /**
   * Generate random number in range
   */
  nextInRange(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
}

/**
 * Perturbation Engine implementation
 */
export class PerturbationEngine {
  private random: SeededRandom;

  constructor(seed?: number) {
    this.random = new SeededRandom(seed ?? Date.now());
  }

  /**
   * Generate perturbed profile variants
   */
  generatePerturbations(
    baseProfile: DimensionScoreMap,
    config: PerturbationConfig
  ): PerturbationResult {
    const startTime = Date.now();
    
    // Re-seed if specified
    if (config.randomSeed !== undefined) {
      this.random = new SeededRandom(config.randomSeed);
    }

    const params = PERTURBATION_PARAMS[config.intensity];
    const perturbedProfiles: PerturbedProfile[] = [];
    const baseDimensions = Array.from(baseProfile.entries());
    
    // Calculate dimension uncertainties for weighted strategy
    const dimensionUncertainties = this.calculateDimensionUncertainties(baseProfile);

    // Generate perturbed profiles
    for (let i = 0; i < config.simulationCount; i++) {
      const perturbedProfile = this.generateSinglePerturbation(
        baseProfile,
        baseDimensions,
        dimensionUncertainties,
        config,
        params,
        i
      );
      perturbedProfiles.push(perturbedProfile);
    }

    const generationTimeMs = Date.now() - startTime;
    const statistics = this.calculateStatistics(
      perturbedProfiles,
      baseDimensions,
      generationTimeMs
    );

    return {
      baseProfile,
      perturbedProfiles,
      config,
      statistics,
      generatedAt: new Date(),
    };
  }

  /**
   * Generate a single perturbed profile
   */
  private generateSinglePerturbation(
    baseProfile: DimensionScoreMap,
    baseDimensions: Array<[string, DimensionScore]>,
    dimensionUncertainties: Map<string, number>,
    config: PerturbationConfig,
    params: { stdDev: number; maxDelta: number },
    index: number
  ): PerturbedProfile {
    const perturbedScores = new Map<string, DimensionScore>();
    const deltas = new Map<string, number>();
    const mostPerturbedDimensions: string[] = [];
    let maxDelta = 0;
    let totalPerturbationMagnitude = 0;

    // Store original rank order if preservation is required
    const originalRanks = config.preserveRankOrder
      ? this.calculateRanks(baseDimensions)
      : null;

    // Generate perturbations for each dimension
    for (const [dimension, baseScore] of baseDimensions) {
      const uncertainty = dimensionUncertainties.get(dimension) ?? 0.5;
      const multiplier = config.dimensionMultipliers?.get(dimension) ?? 1;
      
      // Calculate effective standard deviation based on strategy
      let effectiveStdDev = params.stdDev;
      
      switch (config.strategy) {
        case 'WEIGHTED':
          effectiveStdDev *= (1 + uncertainty);
          break;
        case 'COGNITIVE_FOCUS':
          if (this.isCognitiveDimension(dimension)) {
            effectiveStdDev *= 1.5;
          }
          break;
        case 'MOTIVATION_FOCUS':
          if (this.isMotivationDimension(dimension)) {
            effectiveStdDev *= 1.5;
          }
          break;
        case 'RANDOM_WALK':
          // Use index to create correlated random walk
          effectiveStdDev *= (1 + Math.sin(index * 0.1) * 0.3);
          break;
      }

      effectiveStdDev *= multiplier;

      // Generate perturbation using Gaussian distribution
      let delta = this.random.nextGaussian(0, effectiveStdDev);
      
      // Clamp delta to max allowed
      delta = Math.max(-params.maxDelta, Math.min(params.maxDelta, delta));
      
      // Round to reasonable precision (simulate assessment granularity)
      delta = Math.round(delta);

      let newScore = baseScore.score + delta;
      
      // Clamp to valid range
      newScore = Math.max(config.minScore, Math.min(config.maxScore, newScore));
      
      // Recalculate delta after clamping
      delta = newScore - baseScore.score;

      perturbedScores.set(dimension, {
        ...baseScore,
        score: newScore,
      });

      deltas.set(dimension, delta);
      totalPerturbationMagnitude += Math.abs(delta);

      if (Math.abs(delta) > maxDelta) {
        maxDelta = Math.abs(delta);
        mostPerturbedDimensions.length = 0;
        mostPerturbedDimensions.push(dimension);
      } else if (Math.abs(delta) === maxDelta && maxDelta > 0) {
        mostPerturbedDimensions.push(dimension);
      }
    }

    // Apply rank order preservation if required
    let rankOrderPreserved = true;
    if (config.preserveRankOrder && originalRanks) {
      const perturbedDimensions = Array.from(perturbedScores.entries());
      const newRanks = this.calculateRanks(perturbedDimensions);
      
      // Check if rank order is preserved
      for (const [dimension, originalRank] of originalRanks) {
        const newRank = newRanks.get(dimension);
        if (newRank !== undefined && Math.abs(newRank - originalRank) > 1) {
          rankOrderPreserved = false;
          break;
        }
      }

      // If rank order is significantly violated, apply correction
      if (!rankOrderPreserved) {
        this.correctRankOrder(perturbedScores, originalRanks, baseDimensions);
        rankOrderPreserved = true;
      }
    }

    const perturbationMagnitude = totalPerturbationMagnitude / baseDimensions.length;

    return {
      id: this.generatePerturbationId(index),
      dimensionScores: perturbedScores,
      deltas,
      perturbationMagnitude,
      mostPerturbedDimensions,
      rankOrderPreserved,
    };
  }

  /**
   * Calculate dimension uncertainties based on confidence scores
   */
  private calculateDimensionUncertainties(
    profile: DimensionScoreMap
  ): Map<string, number> {
    const uncertainties = new Map<string, number>();
    
    for (const [dimension, score] of profile) {
      // Higher confidence = lower uncertainty
      // Normalize to 0-1 range
      const uncertainty = (100 - score.confidence) / 100;
      uncertainties.set(dimension, uncertainty);
    }
    
    return uncertainties;
  }

  /**
   * Calculate rank order of dimensions by score
   */
  private calculateRanks(
    dimensions: Array<[string, DimensionScore]>
  ): Map<string, number> {
    const sorted = [...dimensions].sort((a, b) => b[1].score - a[1].score);
    const ranks = new Map<string, number>();
    
    sorted.forEach(([dimension], index) => {
      ranks.set(dimension, index + 1);
    });
    
    return ranks;
  }

  /**
   * Correct rank order by adjusting perturbed scores minimally
   */
  private correctRankOrder(
    perturbedScores: Map<string, DimensionScore>,
    originalRanks: Map<string, number>,
    baseDimensions: Array<[string, DimensionScore]>
  ): void {
    // Sort dimensions by original rank
    const sortedByOriginalRank = [...baseDimensions]
      .sort((a, b) => (originalRanks.get(a[0]) ?? 0) - (originalRanks.get(b[0]) ?? 0));
    
    // Ensure perturbed scores maintain approximate rank order
    for (let i = 0; i < sortedByOriginalRank.length - 1; i++) {
      const [dimA, baseA] = sortedByOriginalRank[i];
      const [dimB, baseB] = sortedByOriginalRank[i + 1];
      
      const perturbedA = perturbedScores.get(dimA);
      const perturbedB = perturbedScores.get(dimB);
      
      if (perturbedA && perturbedB && perturbedA.score < perturbedB.score) {
        // Swap would have occurred - adjust to prevent it
        const midpoint = (perturbedA.score + perturbedB.score) / 2;
        const separation = Math.max(1, Math.abs(baseA.score - baseB.score) * 0.1);
        
        perturbedScores.set(dimA, {
          ...perturbedA,
          score: Math.min(100, midpoint + separation / 2),
        });
        perturbedScores.set(dimB, {
          ...perturbedB,
          score: Math.max(0, midpoint - separation / 2),
        });
      }
    }
  }

  /**
   * Check if dimension is cognitive-related
   */
  private isCognitiveDimension(dimension: string): boolean {
    const cognitiveDimensions = [
      'analyticalThinking',
      'creativity',
      'logicalReasoning',
      'problemSolving',
      'criticalThinking',
      'spatialReasoning',
      'verbalAbility',
      'numericalAbility',
    ];
    return cognitiveDimensions.includes(dimension);
  }

  /**
   * Check if dimension is motivation-related
   */
  private isMotivationDimension(dimension: string): boolean {
    const motivationDimensions = [
      'achievementDrive',
      'independence',
      'leadership',
      'socialOrientation',
      'riskTolerance',
      'stabilityPreference',
      'recognitionDrive',
      'purposeDrive',
    ];
    return motivationDimensions.includes(dimension);
  }

  /**
   * Generate unique perturbation ID
   */
  private generatePerturbationId(index: number): PerturbationId {
    return `pert-${Date.now()}-${index}` as PerturbationId;
  }

  /**
   * Calculate statistics for perturbation results
   */
  private calculateStatistics(
    perturbedProfiles: PerturbedProfile[],
    baseDimensions: Array<[string, DimensionScore]>,
    generationTimeMs: number
  ): PerturbationStatistics {
    const totalGenerated = perturbedProfiles.length;
    
    // Calculate average and max magnitude
    let totalMagnitude = 0;
    let maxMagnitude = 0;
    let rankOrderPreservedCount = 0;
    
    // Track dimension variance
    const dimensionDeltas = new Map<string, number[]>();
    
    for (const profile of perturbedProfiles) {
      totalMagnitude += profile.perturbationMagnitude;
      maxMagnitude = Math.max(maxMagnitude, profile.perturbationMagnitude);
      
      if (profile.rankOrderPreserved) {
        rankOrderPreservedCount++;
      }
      
      for (const [dimension, delta] of profile.deltas) {
        if (!dimensionDeltas.has(dimension)) {
          dimensionDeltas.set(dimension, []);
        }
        dimensionDeltas.get(dimension)!.push(delta);
      }
    }
    
    // Calculate dimension statistics
    const mostVariableDimensions = Array.from(dimensionDeltas.entries())
      .map(([dimension, deltas]) => {
        const averageDelta = deltas.reduce((a, b) => a + Math.abs(b), 0) / deltas.length;
        const variance = this.calculateVariance(deltas);
        return { dimension, averageDelta, variance };
      })
      .sort((a, b) => b.variance - a.variance)
      .slice(0, 5);
    
    return {
      totalGenerated,
      averageMagnitude: totalMagnitude / totalGenerated,
      maxMagnitude,
      rankOrderPreservationRate: rankOrderPreservedCount / totalGenerated,
      mostVariableDimensions,
      generationTimeMs,
    };
  }

  /**
   * Calculate variance of an array of numbers
   */
  private calculateVariance(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * Create perturbation config with intensity preset
   */
  static createConfig(
    intensity: PerturbationIntensity,
    simulationCount: 50 | 100 | 250 | 500 | 1000 = 250,
    overrides: Partial<PerturbationConfig> = {}
  ): PerturbationConfig {
    return {
      intensity,
      simulationCount,
      strategy: 'WEIGHTED',
      preserveRankOrder: true,
      minScore: 0,
      maxScore: 100,
      ...overrides,
    };
  }

  /**
   * Quick perturbation for light uncertainty simulation
   */
  static lightPerturbation(
    baseProfile: DimensionScoreMap,
    simulationCount: 50 | 100 | 250 | 500 | 1000 = 100
  ): PerturbationResult {
    const engine = new PerturbationEngine();
    return engine.generatePerturbations(
      baseProfile,
      PerturbationEngine.createConfig('LIGHT', simulationCount)
    );
  }

  /**
   * Standard perturbation for normal stability analysis
   */
  static mediumPerturbation(
    baseProfile: DimensionScoreMap,
    simulationCount: 50 | 100 | 250 | 500 | 1000 = 250
  ): PerturbationResult {
    const engine = new PerturbationEngine();
    return engine.generatePerturbations(
      baseProfile,
      PerturbationEngine.createConfig('MEDIUM', simulationCount)
    );
  }

  /**
   * Heavy perturbation for stress testing
   */
  static heavyPerturbation(
    baseProfile: DimensionScoreMap,
    simulationCount: 50 | 100 | 250 | 500 | 1000 = 500
  ): PerturbationResult {
    const engine = new PerturbationEngine();
    return engine.generatePerturbations(
      baseProfile,
      PerturbationEngine.createConfig('HEAVY', simulationCount)
    );
  }
}

/**
 * Factory function for creating perturbation engine
 */
export function createPerturbationEngine(seed?: number): PerturbationEngine {
  return new PerturbationEngine(seed);
}

/**
 * Utility to apply perturbation to a single dimension score
 */
export function perturbDimensionScore(
  score: DimensionScore,
  intensity: PerturbationIntensity,
  random: SeededRandom
): DimensionScore {
  const params = PERTURBATION_PARAMS[intensity];
  const delta = Math.round(
    Math.max(
      -params.maxDelta,
      Math.min(params.maxDelta, random.nextGaussian(0, params.stdDev))
    )
  );
  
  return {
    ...score,
    score: Math.max(0, Math.min(100, score.score + delta)),
  };
}

export { SeededRandom };
