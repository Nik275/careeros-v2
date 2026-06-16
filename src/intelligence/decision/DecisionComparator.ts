/**
 * @fileoverview Decision Comparator - Comparison Engine
 * @module @/intelligence/decision/DecisionComparator
 * 
 * Constitutional decision comparison engine.
 * 
 * This module provides the ONLY sanctioned comparison algorithms for CareerOS.
 * All decision comparisons MUST use this module.
 * 
 * Comparison methods:
 * - pairwise: Direct A vs B comparison
 * - tournament: Tournament-style elimination
 * - elo: Elo rating system
 * - bradley-terry: Bradley-Terry model
 * - dominance: Pareto dominance
 * - custom: User-defined comparison
 * 
 * @version 1.0.0
 * @author CareerOS Constitutional Architecture Team
 * @since Wave 2.1 - Decision Authority Infrastructure
 */

import type {
  DecisionOption,
  DecisionContext,
  ComparisonConfig,
  DecisionComparisonResult,
  ComparisonOutcome,
  ComparisonMethod,
  CustomComparator,
  DecisionConfidence,
} from './DecisionTypes';

/**
 * Interface for the Decision Comparator.
 */
export interface IDecisionComparator {
  /**
   * Compare two options.
   */
  compare<T = unknown>(
    optionA: DecisionOption<T>,
    optionB: DecisionOption<T>,
    context: DecisionContext,
    config: ComparisonConfig
  ): Promise<DecisionComparisonResult>;

  /**
   * Compare multiple options using tournament.
   */
  compareTournament<T = unknown>(
    options: ReadonlyArray<DecisionOption<T>>,
    context: DecisionContext
  ): Promise<{
    winner: DecisionOption<T>;
    comparisons: ReadonlyArray<DecisionComparisonResult>;
  }>;

  /**
   * Compare two pre-scored options synchronously.
   */
  comparePairwise<T = unknown>(
    optionA: DecisionOption<T>,
    optionB: DecisionOption<T>,
    scoreFields?: ReadonlyArray<string>
  ): {
    winner: string | 'equal';
    optionA: { id: string; score: number };
    optionB: { id: string; score: number };
  };

  /**
   * Get comparator version.
   */
  getVersion(): string;
}

/**
 * Configuration for the Decision Comparator.
 */
export interface DecisionComparatorConfig {
  /** Default comparison method */
  readonly defaultMethod: ComparisonMethod;
  
  /** Whether to enforce transitivity */
  readonly enforceTransitivity: boolean;
  
  /** Confidence threshold for comparisons */
  readonly confidenceThreshold: DecisionConfidence;
  
  /** Maximum comparison depth for tournament */
  readonly maxTournamentDepth: number;
}

/**
 * Default comparator configuration.
 */
export const DEFAULT_COMPARATOR_CONFIG: DecisionComparatorConfig = {
  defaultMethod: 'pairwise',
  enforceTransitivity: true,
  confidenceThreshold: 0.7,
  maxTournamentDepth: 10,
};

/**
 * Decision Comparator implementation.
 */
export class DecisionComparator implements IDecisionComparator {
  private config: DecisionComparatorConfig;

  constructor(config: Partial<DecisionComparatorConfig> = {}) {
    this.config = { ...DEFAULT_COMPARATOR_CONFIG, ...config };
  }

  /**
   * Compare two options.
   */
  async compare<T = unknown>(
    optionA: DecisionOption<T>,
    optionB: DecisionOption<T>,
    context: DecisionContext,
    config: ComparisonConfig
  ): Promise<DecisionComparisonResult> {
    const method = config.method ?? this.config.defaultMethod;
    
    let outcome: ComparisonOutcome;
    let confidence: DecisionConfidence;
    let rationale: string;

    switch (method) {
      case 'pairwise':
        ({ outcome, confidence, rationale } = await this.pairwiseCompare(optionA, optionB, context));
        break;
      case 'elo':
        ({ outcome, confidence, rationale } = await this.eloCompare(optionA, optionB, context));
        break;
      case 'bradley-terry':
        ({ outcome, confidence, rationale } = await this.bradleyTerryCompare(optionA, optionB, context));
        break;
      case 'dominance':
        ({ outcome, confidence, rationale } = await this.dominanceCompare(optionA, optionB, context));
        break;
      case 'custom':
        if (!config.customComparator) {
          throw new Error('Custom comparator not provided');
        }
        outcome = await config.customComparator(optionA, optionB, context);
        confidence = 0.8;
        rationale = 'Custom comparison';
        break;
      default:
        ({ outcome, confidence, rationale } = await this.pairwiseCompare(optionA, optionB, context));
    }

    // Calculate scores
    const scoreA = this.calculateOptionScore(optionA, outcome === 'a-better');
    const scoreB = this.calculateOptionScore(optionB, outcome === 'b-better');

    return {
      optionA: { id: optionA.id, score: scoreA },
      optionB: { id: optionB.id, score: scoreB },
      outcome,
      confidence,
      rationale,
    };
  }

  comparePairwise<T = unknown>(
    optionA: DecisionOption<T>,
    optionB: DecisionOption<T>,
    scoreFields: ReadonlyArray<string> = []
  ): {
    winner: string | 'equal';
    optionA: { id: string; score: number };
    optionB: { id: string; score: number };
  } {
    const scoreA = this.extractComparableScore(optionA, scoreFields);
    const scoreB = this.extractComparableScore(optionB, scoreFields);

    return {
      winner: scoreA > scoreB ? optionA.id : scoreB > scoreA ? optionB.id : 'equal',
      optionA: { id: optionA.id, score: scoreA },
      optionB: { id: optionB.id, score: scoreB },
    };
  }

  /**
   * Pairwise comparison.
   */
  private async pairwiseCompare<T>(
    optionA: DecisionOption<T>,
    optionB: DecisionOption<T>,
    _context: DecisionContext
  ): Promise<{ outcome: ComparisonOutcome; confidence: DecisionConfidence; rationale: string }> {
    const scoreA = this.extractScore(optionA);
    const scoreB = this.extractScore(optionB);
    
    const diff = Math.abs(scoreA - scoreB);
    const confidence = Math.min(0.5 + diff, 0.95) as DecisionConfidence;
    
    let outcome: ComparisonOutcome;
    let rationale: string;
    
    if (scoreA > scoreB + 0.1) {
      outcome = 'a-better';
      rationale = `${optionA.id} has higher score (${scoreA.toFixed(2)} vs ${scoreB.toFixed(2)})`;
    } else if (scoreB > scoreA + 0.1) {
      outcome = 'b-better';
      rationale = `${optionB.id} has higher score (${scoreB.toFixed(2)} vs ${scoreA.toFixed(2)})`;
    } else if (diff < 0.05) {
      outcome = 'equivalent';
      rationale = `Scores are nearly equal (${scoreA.toFixed(2)} vs ${scoreB.toFixed(2)})`;
    } else {
      outcome = 'incomparable';
      rationale = 'Cannot definitively compare these options';
    }

    return { outcome, confidence, rationale };
  }

  /**
   * Elo rating comparison.
   */
  private async eloCompare<T>(
    optionA: DecisionOption<T>,
    optionB: DecisionOption<T>,
    _context: DecisionContext
  ): Promise<{ outcome: ComparisonOutcome; confidence: DecisionConfidence; rationale: string }> {
    // Simplified Elo-style comparison
    const ratingA = this.getEloRating(optionA);
    const ratingB = this.getEloRating(optionB);
    
    const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
    const expectedB = 1 - expectedA;
    
    const confidence = Math.abs(expectedA - expectedB) as DecisionConfidence;
    
    let outcome: ComparisonOutcome;
    let rationale: string;
    
    if (expectedA > expectedB + 0.2) {
      outcome = 'a-better';
      rationale = `${optionA.id} has higher Elo rating (${ratingA.toFixed(0)} vs ${ratingB.toFixed(0)})`;
    } else if (expectedB > expectedA + 0.2) {
      outcome = 'b-better';
      rationale = `${optionB.id} has higher Elo rating (${ratingB.toFixed(0)} vs ${ratingA.toFixed(0)})`;
    } else {
      outcome = 'equivalent';
      rationale = 'Elo ratings are comparable';
    }

    return { outcome, confidence, rationale };
  }

  /**
   * Bradley-Terry model comparison.
   */
  private async bradleyTerryCompare<T>(
    optionA: DecisionOption<T>,
    optionB: DecisionOption<T>,
    _context: DecisionContext
  ): Promise<{ outcome: ComparisonOutcome; confidence: DecisionConfidence; rationale: string }> {
    // Simplified Bradley-Terry comparison
    const abilityA = this.extractScore(optionA);
    const abilityB = this.extractScore(optionB);
    
    const probA = abilityA / (abilityA + abilityB);
    const confidence = Math.abs(probA - 0.5) * 2 as DecisionConfidence;
    
    let outcome: ComparisonOutcome;
    let rationale: string;
    
    if (probA > 0.6) {
      outcome = 'a-better';
      rationale = `${optionA.id} has higher Bradley-Terry probability (${(probA * 100).toFixed(1)}%)`;
    } else if (probA < 0.4) {
      outcome = 'b-better';
      rationale = `${optionB.id} has higher Bradley-Terry probability (${((1 - probA) * 100).toFixed(1)}%)`;
    } else {
      outcome = 'equivalent';
      rationale = 'Bradley-Terry probabilities are similar';
    }

    return { outcome, confidence, rationale };
  }

  /**
   * Dominance comparison (Pareto).
   */
  private async dominanceCompare<T>(
    optionA: DecisionOption<T>,
    optionB: DecisionOption<T>,
    _context: DecisionContext
  ): Promise<{ outcome: ComparisonOutcome; confidence: DecisionConfidence; rationale: string }> {
    const scoresA = this.extractMultiScores(optionA);
    const scoresB = this.extractMultiScores(optionB);
    
    const aDominates = this.dominates(scoresA, scoresB);
    const bDominates = this.dominates(scoresB, scoresA);
    
    let outcome: ComparisonOutcome;
    let rationale: string;
    let confidence: DecisionConfidence;
    
    if (aDominates && !bDominates) {
      outcome = 'a-better';
      rationale = `${optionA.id} Pareto-dominates ${optionB.id}`;
      confidence = 0.95;
    } else if (bDominates && !aDominates) {
      outcome = 'b-better';
      rationale = `${optionB.id} Pareto-dominates ${optionA.id}`;
      confidence = 0.95;
    } else if (!aDominates && !bDominates) {
      outcome = 'incomparable';
      rationale = 'Neither option dominates the other';
      confidence = 0.8;
    } else {
      outcome = 'equivalent';
      rationale = 'Options are equivalent on all dimensions';
      confidence = 0.9;
    }

    return { outcome, confidence, rationale };
  }

  /**
   * Tournament comparison for multiple options.
   */
  async compareTournament<T = unknown>(
    options: ReadonlyArray<DecisionOption<T>>,
    context: DecisionContext
  ): Promise<{
    winner: DecisionOption<T>;
    comparisons: ReadonlyArray<DecisionComparisonResult>;
  }> {
    if (options.length === 0) {
      throw new Error('Cannot run tournament with no options');
    }
    if (options.length === 1) {
      return { winner: options[0], comparisons: [] };
    }

    const comparisons: DecisionComparisonResult[] = [];
    const config: ComparisonConfig = { method: 'pairwise', transitive: true };
    
    // Single elimination tournament
    let currentRound = [...options];
    
    while (currentRound.length > 1) {
      const nextRound: DecisionOption<T>[] = [];
      
      for (let i = 0; i < currentRound.length; i += 2) {
        if (i + 1 >= currentRound.length) {
          // Odd option advances automatically
          nextRound.push(currentRound[i]);
          continue;
        }
        
        const result = await this.compare(currentRound[i], currentRound[i + 1], context, config);
        comparisons.push(result);
        
        if (result.outcome === 'a-better' || result.outcome === 'equivalent') {
          nextRound.push(currentRound[i]);
        } else {
          nextRound.push(currentRound[i + 1]);
        }
      }
      
      currentRound = nextRound;
      
      // Safety check for max depth
      if (comparisons.length > options.length * this.config.maxTournamentDepth) {
        throw new Error('Tournament exceeded maximum depth');
      }
    }

    return { winner: currentRound[0], comparisons };
  }

  /**
   * Extract score from option.
   */
  private extractScore<T>(option: DecisionOption<T>): number {
    return option.metadata?.sourceConfidence ?? 0.5;
  }

  private extractComparableScore<T>(
    option: DecisionOption<T>,
    scoreFields: ReadonlyArray<string>
  ): number {
    const metadata = option.metadata;

    for (const field of scoreFields) {
      const value = metadata?.[field];
      if (typeof value === 'number') {
        return value;
      }
    }

    return this.extractScore(option);
  }

  /**
   * Extract multiple scores from option.
   */
  private extractMultiScores<T>(option: DecisionOption<T>): number[] {
    const metadata = option.metadata as Record<string, unknown> | undefined;
    if (metadata?.scores && Array.isArray(metadata.scores)) {
      return metadata.scores as number[];
    }
    return [this.extractScore(option)];
  }

  /**
   * Get Elo rating for option.
   */
  private getEloRating<T>(option: DecisionOption<T>): number {
    const metadata = option.metadata as Record<string, unknown> | undefined;
    return (metadata?.eloRating as number) ?? 1500;
  }

  /**
   * Check if scoresA dominates scoresB.
   */
  private dominates(scoresA: number[], scoresB: number[]): boolean {
    let strictlyBetter = false;
    
    for (let i = 0; i < scoresA.length; i++) {
      if (scoresA[i] < scoresB[i]) return false;
      if (scoresA[i] > scoresB[i]) strictlyBetter = true;
    }
    
    return strictlyBetter;
  }

  /**
   * Calculate option score based on comparison outcome.
   */
  private calculateOptionScore<T>(option: DecisionOption<T>, isWinner: boolean): number {
    const baseScore = this.extractScore(option);
    return isWinner ? baseScore * 1.1 : baseScore * 0.9;
  }

  /**
   * Get comparator version.
   */
  getVersion(): string {
    return '1.0.0';
  }
}

/**
 * Factory function for creating a Decision Comparator.
 */
export function createDecisionComparator(
  config?: Partial<DecisionComparatorConfig>
): IDecisionComparator {
  return new DecisionComparator(config);
}

// Default instance
export const defaultDecisionComparator = createDecisionComparator();
