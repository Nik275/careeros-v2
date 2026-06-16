/**
 * @fileoverview Decision Ranker - Ranking Engine
 * @module @/intelligence/decision/DecisionRanker
 * 
 * Constitutional decision ranking engine.
 * 
 * This module provides the ONLY sanctioned ranking algorithms for CareerOS.
 * All decision ranking MUST use this module.
 * 
 * Algorithms available:
 * - score-based: Simple weighted scoring
 * - confidence-weighted: Scores weighted by confidence
 * - stakeholder-weighted: Multi-stakeholder preference aggregation
 * - multi-criteria: Multiple weighted criteria
 * - utility-maximization: Expected utility optimization
 * - pareto-optimal: Pareto frontier selection
 * - custom: User-defined ranking function
 * 
 * @version 1.0.0
 * @author CareerOS Constitutional Architecture Team
 * @since Wave 2.1 - Decision Authority Infrastructure
 */

import type {
  DecisionOption,
  RankedDecisionOption,
  DecisionContext,
  RankingConfig,
  RankingResult,
  CustomRanker,
  ScoreBreakdown,
} from './DecisionTypes';

/**
 * Interface for the Decision Ranker.
 * 
 * The Decision Ranker is responsible for ordering decision options
 * from best to worst based on configurable algorithms.
 */
export interface IDecisionRanker {
  /**
   * Rank options using configured algorithm.
   * 
   * @param options - Options to rank
   * @param context - Decision context
   * @param config - Ranking configuration
   * @returns Ranked options with scores
   */
  rank<T = unknown>(
    options: ReadonlyArray<DecisionOption<T>>,
    context: DecisionContext,
    config: RankingConfig
  ): Promise<RankingResult<T>>;

  /**
   * Rank pre-scored options synchronously.
   *
   * Used by authority modules that already own a canonical score and only need
   * deterministic ordering plus RankedDecisionOption wrapping.
   */
  rankByScore<T = unknown>(
    options: ReadonlyArray<DecisionOption<T> & { readonly score: number }>,
    direction?: 'asc' | 'desc'
  ): ReadonlyArray<RankedDecisionOption<T>>;

  /**
   * Get ranker version.
   */
  getVersion(): string;
}

/**
 * Configuration for the Decision Ranker.
 */
export interface DecisionRankerConfig {
  /** Default ranking algorithm */
  readonly defaultAlgorithm: RankingConfig['algorithm'];
  
  /** Whether to normalize scores to [0, 1] */
  readonly normalizeScores: boolean;
  
  /** Precision for score values */
  readonly scorePrecision: number;
  
  /** Whether to cache rankings */
  readonly enableCache: boolean;
  
  /** Cache TTL in milliseconds */
  readonly cacheTtl: number;
}

/**
 * Default ranker configuration.
 */
export const DEFAULT_RANKER_CONFIG: DecisionRankerConfig = {
  defaultAlgorithm: 'score-based',
  normalizeScores: true,
  scorePrecision: 4,
  enableCache: false,
  cacheTtl: 60000,
};

/**
 * Decision Ranker implementation.
 */
export class DecisionRanker implements IDecisionRanker {
  private config: DecisionRankerConfig;
  private cache: Map<string, RankingResult<unknown>> = new Map();

  constructor(config: Partial<DecisionRankerConfig> = {}) {
    this.config = { ...DEFAULT_RANKER_CONFIG, ...config };
  }

  /**
   * Rank options using configured algorithm.
   */
  async rank<T = unknown>(
    options: ReadonlyArray<DecisionOption<T>>,
    context: DecisionContext,
    config: RankingConfig
  ): Promise<RankingResult<T>> {
    // Check cache if enabled
    if (this.config.enableCache) {
      const cacheKey = this.getCacheKey(options, context, config);
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached as RankingResult<T>;
      }
    }

    const startTime = Date.now();

    // Select and execute ranking algorithm
    let rankedOptions: ReadonlyArray<RankedDecisionOption<T>>;
    
    switch (config.algorithm) {
      case 'score-based':
        rankedOptions = await this.scoreBasedRanking(options, context, config);
        break;
      case 'confidence-weighted':
        rankedOptions = await this.confidenceWeightedRanking(options, context, config);
        break;
      case 'stakeholder-weighted':
        rankedOptions = await this.stakeholderWeightedRanking(options, context, config);
        break;
      case 'multi-criteria':
        rankedOptions = await this.multiCriteriaRanking(options, context, config);
        break;
      case 'utility-maximization':
        rankedOptions = await this.utilityMaximizationRanking(options, context, config);
        break;
      case 'pareto-optimal':
        rankedOptions = await this.paretoOptimalRanking(options, context, config);
        break;
      case 'custom':
        if (!config.customRanker) {
          throw new Error('Custom ranker not provided');
        }
        rankedOptions = await config.customRanker(options, context);
        break;
      default:
        rankedOptions = await this.scoreBasedRanking(options, context, config);
    }

    // Handle ties
    rankedOptions = this.handleTies(rankedOptions, config);

    const duration = Date.now() - startTime;
    const tieCount = this.countTies(rankedOptions);

    const result: RankingResult<T> = {
      rankedOptions,
      algorithm: config.algorithm,
      duration,
      tieCount,
    };

    // Cache result if enabled
    if (this.config.enableCache) {
      const cacheKey = this.getCacheKey(options, context, config);
      this.cache.set(cacheKey, result as RankingResult<unknown>);
      setTimeout(() => this.cache.delete(cacheKey), this.config.cacheTtl);
    }

    return result;
  }

  rankByScore<T = unknown>(
    options: ReadonlyArray<DecisionOption<T> & { readonly score: number }>,
    direction: 'asc' | 'desc' = 'desc'
  ): ReadonlyArray<RankedDecisionOption<T>> {
    return [...options]
      .sort((a, b) => (direction === 'asc' ? a.score - b.score : b.score - a.score))
      .map((option, index) => {
        const score = this.roundScore(option.score);
        return {
          ...option,
          rank: index + 1,
          score,
          normalizedScore: score,
          scoreBreakdown: {
            baseScore: score,
            confidenceAdjustment: 0,
            constraintPenalty: 0,
            stakeholderWeighting: 0,
            finalScore: score,
          },
        };
      });
  }

  /**
   * Score-based ranking.
   * 
   * Simple weighted scoring based on option metadata.
   */
  private async scoreBasedRanking<T>(
    options: ReadonlyArray<DecisionOption<T>>,
    _context: DecisionContext,
    _config: RankingConfig
  ): Promise<ReadonlyArray<RankedDecisionOption<T>>> {
    const scored = options.map((option, index) => {
      // Calculate base score from metadata if available
      const baseScore = this.calculateBaseScore(option);
      
      // Calculate normalized score
      const normalizedScore = this.config.normalizeScores
        ? this.normalizeScore(baseScore, options)
        : baseScore;

      const scoreBreakdown: ScoreBreakdown = {
        baseScore,
        confidenceAdjustment: 0,
        constraintPenalty: 0,
        stakeholderWeighting: 0,
        finalScore: normalizedScore,
      };

      return this.createRankedOption(option, index + 1, normalizedScore, scoreBreakdown);
    });

    // Sort by score descending
    return scored.sort((a, b) => b.score - a.score);
  }

  /**
   * Confidence-weighted ranking.
   * 
   * Scores are weighted by source confidence.
   */
  private async confidenceWeightedRanking<T>(
    options: ReadonlyArray<DecisionOption<T>>,
    _context: DecisionContext,
    _config: RankingConfig
  ): Promise<ReadonlyArray<RankedDecisionOption<T>>> {
    const scored = options.map((option, index) => {
      const baseScore = this.calculateBaseScore(option);
      const confidence = option.metadata?.sourceConfidence ?? 0.5;
      
      // Weight score by confidence
      const weightedScore = baseScore * confidence;
      
      const normalizedScore = this.config.normalizeScores
        ? this.normalizeScore(weightedScore, options)
        : weightedScore;

      const scoreBreakdown: ScoreBreakdown = {
        baseScore,
        confidenceAdjustment: confidence,
        constraintPenalty: 0,
        stakeholderWeighting: 0,
        finalScore: normalizedScore,
      };

      return this.createRankedOption(option, index + 1, normalizedScore, scoreBreakdown);
    });

    return scored.sort((a, b) => b.score - a.score);
  }

  /**
   * Stakeholder-weighted ranking.
   * 
   * Aggregates preferences across multiple stakeholders.
   */
  private async stakeholderWeightedRanking<T>(
    options: ReadonlyArray<DecisionOption<T>>,
    _context: DecisionContext,
    config: RankingConfig
  ): Promise<ReadonlyArray<RankedDecisionOption<T>>> {
    const weights = config.criteriaWeights ?? {};

    const scored = options.map((option, index) => {
      const baseScore = this.calculateBaseScore(option);
      const stakeholderWeights = option.metadata?.stakeholderWeights ?? {};
      
      // Calculate stakeholder-weighted score
      let stakeholderWeighting = 0;
      let weightSum = 0;
      
      for (const [stakeholder, weight] of Object.entries(stakeholderWeights)) {
        const globalWeight = weights[stakeholder] ?? 1.0;
        stakeholderWeighting += weight * globalWeight;
        weightSum += globalWeight;
      }
      
      const normalizedStakeholderWeight = weightSum > 0 ? stakeholderWeighting / weightSum : 1.0;
      const finalScore = baseScore * normalizedStakeholderWeight;

      const scoreBreakdown: ScoreBreakdown = {
        baseScore,
        confidenceAdjustment: 0,
        constraintPenalty: 0,
        stakeholderWeighting: normalizedStakeholderWeight,
        finalScore,
      };

      return this.createRankedOption(option, index + 1, finalScore, scoreBreakdown);
    });

    return scored.sort((a, b) => b.score - a.score);
  }

  /**
   * Multi-criteria ranking.
   * 
   * Combines multiple weighted criteria into a single score.
   */
  private async multiCriteriaRanking<T>(
    options: ReadonlyArray<DecisionOption<T>>,
    _context: DecisionContext,
    config: RankingConfig
  ): Promise<ReadonlyArray<RankedDecisionOption<T>>> {
    const criteriaWeights = config.criteriaWeights ?? { default: 1.0 };

    const scored = options.map((option, index) => {
      // Extract criteria scores from option data
      const criteriaScores = this.extractCriteriaScores(option);
      
      // Calculate weighted sum
      let totalWeight = 0;
      let weightedSum = 0;
      
      for (const [criterion, weight] of Object.entries(criteriaWeights)) {
        const score = criteriaScores[criterion] ?? 0.5;
        weightedSum += score * weight;
        totalWeight += weight;
      }
      
      const finalScore = totalWeight > 0 ? weightedSum / totalWeight : 0.5;

      const scoreBreakdown: ScoreBreakdown = {
        baseScore: finalScore,
        confidenceAdjustment: 0,
        constraintPenalty: 0,
        stakeholderWeighting: 0,
        finalScore,
      };

      return this.createRankedOption(option, index + 1, finalScore, scoreBreakdown);
    });

    return scored.sort((a, b) => b.score - a.score);
  }

  /**
   * Utility maximization ranking.
   * 
   * Optimizes for expected utility.
   */
  private async utilityMaximizationRanking<T>(
    options: ReadonlyArray<DecisionOption<T>>,
    _context: DecisionContext,
    _config: RankingConfig
  ): Promise<ReadonlyArray<RankedDecisionOption<T>>> {
    // This is a simplified implementation
    // Full implementation would use utility functions and probability distributions
    
    const scored = options.map((option, index) => {
      const baseScore = this.calculateBaseScore(option);
      const confidence = option.metadata?.sourceConfidence ?? 0.5;
      
      // Expected utility = score * confidence (simplified)
      const expectedUtility = baseScore * confidence;

      const scoreBreakdown: ScoreBreakdown = {
        baseScore,
        confidenceAdjustment: confidence,
        constraintPenalty: 0,
        stakeholderWeighting: 0,
        finalScore: expectedUtility,
      };

      return this.createRankedOption(option, index + 1, expectedUtility, scoreBreakdown);
    });

    return scored.sort((a, b) => b.score - a.score);
  }

  /**
   * Pareto-optimal ranking.
   * 
   * Identifies Pareto-optimal options (no other option dominates).
   */
  private async paretoOptimalRanking<T>(
    options: ReadonlyArray<DecisionOption<T>>,
    _context: DecisionContext,
    _config: RankingConfig
  ): Promise<ReadonlyArray<RankedDecisionOption<T>>> {
    // Extract multi-dimensional scores
    const scoredOptions = options.map((option, index) => ({
      option,
      scores: this.extractMultiDimensionalScores(option),
      index,
    }));

    // Identify dominated options
    const dominated = new Set<number>();
    
    for (let i = 0; i < scoredOptions.length; i++) {
      for (let j = 0; j < scoredOptions.length; j++) {
        if (i === j) continue;
        
        if (this.dominates(scoredOptions[j].scores, scoredOptions[i].scores)) {
          dominated.add(i);
          break;
        }
      }
    }

    // Score Pareto-optimal options higher
    const scored = scoredOptions.map(({ option, scores, index }) => {
      const isParetoOptimal = !dominated.has(index);
      const baseScore = this.calculateBaseScore(option);
      
      // Boost Pareto-optimal options
      const paretoBoost = isParetoOptimal ? 1.2 : 1.0;
      const finalScore = baseScore * paretoBoost;

      const scoreBreakdown: ScoreBreakdown = {
        baseScore,
        confidenceAdjustment: 0,
        constraintPenalty: 0,
        stakeholderWeighting: isParetoOptimal ? 1.2 : 1.0,
        finalScore,
      };

      return this.createRankedOption(option, index + 1, finalScore, scoreBreakdown);
    });

    return scored.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate base score for an option.
   */
  private calculateBaseScore<T>(option: DecisionOption<T>): number {
    // Try to extract score from metadata
    if (typeof option.metadata?.sourceConfidence === 'number') {
      return option.metadata.sourceConfidence;
    }
    
    // Default to neutral score
    return 0.5;
  }

  /**
   * Normalize score to [0, 1] range.
   */
  private normalizeScore<T>(score: number, options: ReadonlyArray<DecisionOption<T>>): number {
    const scores = options.map(o => this.calculateBaseScore(o));
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    
    if (max === min) return 0.5;
    
    return (score - min) / (max - min);
  }

  /**
   * Extract criteria scores from option.
   */
  private extractCriteriaScores<T>(option: DecisionOption<T>): Record<string, number> {
    // Try to extract from metadata
    const metadata = option.metadata as Record<string, unknown> | undefined;
    if (metadata?.criteriaScores && typeof metadata.criteriaScores === 'object') {
      return metadata.criteriaScores as Record<string, number>;
    }
    
    // Default criteria
    return {
      relevance: this.calculateBaseScore(option),
      confidence: option.metadata?.sourceConfidence ?? 0.5,
    };
  }

  /**
   * Extract multi-dimensional scores.
   */
  private extractMultiDimensionalScores<T>(option: DecisionOption<T>): number[] {
    const criteria = this.extractCriteriaScores(option);
    return Object.values(criteria);
  }

  /**
   * Check if scoreA dominates scoreB (Pareto dominance).
   */
  private dominates(scoreA: number[], scoreB: number[]): boolean {
    let strictlyBetter = false;
    
    for (let i = 0; i < scoreA.length; i++) {
      if (scoreA[i] < scoreB[i]) return false;
      if (scoreA[i] > scoreB[i]) strictlyBetter = true;
    }
    
    return strictlyBetter;
  }

  /**
   * Create ranked option.
   */
  private createRankedOption<T>(
    option: DecisionOption<T>,
    rank: number,
    score: number,
    scoreBreakdown: ScoreBreakdown
  ): RankedDecisionOption<T> {
    return {
      ...option,
      rank,
      score: this.roundScore(score),
      normalizedScore: this.roundScore(score),
      scoreBreakdown,
    };
  }

  /**
   * Round score to configured precision.
   */
  private roundScore(score: number): number {
    const factor = Math.pow(10, this.config.scorePrecision);
    return Math.round(score * factor) / factor;
  }

  /**
   * Handle ties according to configuration.
   */
  private handleTies<T>(
    ranked: ReadonlyArray<RankedDecisionOption<T>>,
    config: RankingConfig
  ): ReadonlyArray<RankedDecisionOption<T>> {
    if (config.allowTies) {
      return ranked;
    }

    // Group by score
    const scoreGroups = new Map<number, RankedDecisionOption<T>[]>();
    
    for (const option of ranked) {
      const existing = scoreGroups.get(option.score) ?? [];
      existing.push(option);
      scoreGroups.set(option.score, existing);
    }

    // Break ties
    const result: RankedDecisionOption<T>[] = [];
    let currentRank = 1;

    for (const [score, options] of scoreGroups.entries()) {
      if (options.length === 1) {
        result.push({ ...options[0], rank: currentRank });
        currentRank++;
      } else {
        // Break tie
        const broken = this.breakTie(options, config.tieBreaker);
        for (const option of broken) {
          result.push({ ...option, rank: currentRank });
          currentRank++;
        }
      }
    }

    return result;
  }

  /**
   * Break tie between options.
   */
  private breakTie<T>(
    options: RankedDecisionOption<T>[],
    strategy: RankingConfig['tieBreaker']
  ): RankedDecisionOption<T>[] {
    switch (strategy) {
      case 'first':
        // Keep original order
        return options;
      
      case 'last':
        // Reverse order
        return [...options].reverse();
      
      case 'random':
        // Random shuffle
        return [...options].sort(() => Math.random() - 0.5);
      
      case 'confidence':
        // Sort by confidence
        return [...options].sort((a, b) => {
          const confA = a.metadata?.sourceConfidence ?? 0;
          const confB = b.metadata?.sourceConfidence ?? 0;
          return confB - confA;
        });
      
      case 'timestamp':
        // Sort by creation time
        return [...options].sort((a, b) => 
          a.createdAt.getTime() - b.createdAt.getTime()
        );
      
      default:
        return options;
    }
  }

  /**
   * Count ties in ranked options.
   */
  private countTies<T>(ranked: ReadonlyArray<RankedDecisionOption<T>>): number {
    const scoreCounts = new Map<number, number>();
    
    for (const option of ranked) {
      const count = scoreCounts.get(option.score) ?? 0;
      scoreCounts.set(option.score, count + 1);
    }

    let tieCount = 0;
    for (const count of scoreCounts.values()) {
      if (count > 1) {
        tieCount += count - 1;
      }
    }
    
    return tieCount;
  }

  /**
   * Generate cache key.
   */
  private getCacheKey<T>(
    options: ReadonlyArray<DecisionOption<T>>,
    context: DecisionContext,
    config: RankingConfig
  ): string {
    const optionIds = options.map(o => o.id).join(',');
    return `${optionIds}:${context.studentId}:${config.algorithm}`;
  }

  /**
   * Get ranker version.
   */
  getVersion(): string {
    return '1.0.0';
  }
}

/**
 * Factory function for creating a Decision Ranker.
 */
export function createDecisionRanker(
  config?: Partial<DecisionRankerConfig>
): IDecisionRanker {
  return new DecisionRanker(config);
}

// Default instance
export const defaultDecisionRanker = createDecisionRanker();
