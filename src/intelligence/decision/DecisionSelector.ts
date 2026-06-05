/**
 * @fileoverview Decision Selector - Selection Engine
 * @module @/intelligence/decision/DecisionSelector
 * 
 * Constitutional decision selection engine.
 * 
 * This module provides the ONLY sanctioned selection algorithms for CareerOS.
 * All decision selections MUST use this module.
 * 
 * Selection strategies:
 * - top-ranked: Select highest ranked option
 * - threshold: Select all above threshold
 * - confidence-gated: Select based on confidence
 * - multi-select: Select top N options
 * - custom: User-defined selection
 * 
 * @version 1.0.0
 * @author CareerOS Constitutional Architecture Team
 * @since Wave 2.1 - Decision Authority Infrastructure
 */

import type {
  DecisionOption,
  RankedDecisionOption,
  DecisionContext,
  SelectionConfig,
  SelectionResult,
  SelectionStrategy,
  CustomSelector,
  DecisionConfidence,
} from './DecisionTypes';

/**
 * Interface for the Decision Selector.
 */
export interface IDecisionSelector {
  /**
   * Select winner(s) from ranked options.
   */
  select<T = unknown>(
    rankedOptions: ReadonlyArray<RankedDecisionOption<T>>,
    context: DecisionContext,
    config: SelectionConfig
  ): Promise<SelectionResult<T>>;

  /**
   * Validate selection result.
   */
  validateSelection<T = unknown>(
    result: SelectionResult<T>,
    constraints: {
      minConfidence?: DecisionConfidence;
      maxWinners?: number;
      requireWinner?: boolean;
    }
  ): { valid: boolean; errors: string[] };

  /**
   * Get selector version.
   */
  getVersion(): string;
}

/**
 * Configuration for the Decision Selector.
 */
export interface DecisionSelectorConfig {
  /** Default selection strategy */
  readonly defaultStrategy: SelectionStrategy;
  
  /** Default winner count for multi-select */
  readonly defaultWinnerCount: number;
  
  /** Default minimum score threshold */
  readonly defaultMinScore: number;
  
  /** Default minimum confidence threshold */
  readonly defaultMinConfidence: DecisionConfidence;
  
  /** Whether to allow empty selection */
  readonly allowEmptySelection: boolean;
}

/**
 * Default selector configuration.
 */
export const DEFAULT_SELECTOR_CONFIG: DecisionSelectorConfig = {
  defaultStrategy: 'top-ranked',
  defaultWinnerCount: 1,
  defaultMinScore: 0.5,
  defaultMinConfidence: 0.6,
  allowEmptySelection: false,
};

/**
 * Decision Selector implementation.
 */
export class DecisionSelector implements IDecisionSelector {
  private config: DecisionSelectorConfig;

  constructor(config: Partial<DecisionSelectorConfig> = {}) {
    this.config = { ...DEFAULT_SELECTOR_CONFIG, ...config };
  }

  /**
   * Select winner(s) from ranked options.
   */
  async select<T = unknown>(
    rankedOptions: ReadonlyArray<RankedDecisionOption<T>>,
    context: DecisionContext,
    config: SelectionConfig
  ): Promise<SelectionResult<T>> {
    const strategy = config.strategy ?? this.config.defaultStrategy;

    let result: SelectionResult<T>;

    switch (strategy) {
      case 'top-ranked':
        result = await this.selectTopRanked(rankedOptions, context, config);
        break;
      case 'threshold':
        result = await this.selectByThreshold(rankedOptions, context, config);
        break;
      case 'confidence-gated':
        result = await this.selectByConfidence(rankedOptions, context, config);
        break;
      case 'multi-select':
        result = await this.multiSelect(rankedOptions, context, config);
        break;
      case 'custom':
        if (!config.customSelector) {
          throw new Error('Custom selector not provided');
        }
        const customWinners = await config.customSelector(rankedOptions, context);
        result = {
          winners: customWinners,
          strategy: 'custom',
          success: customWinners.length > 0,
        };
        break;
      default:
        result = await this.selectTopRanked(rankedOptions, context, config);
    }

    // Validate selection
    if (!this.config.allowEmptySelection && result.winners.length === 0) {
      return {
        ...result,
        success: false,
        failureReason: 'No winners selected but empty selection not allowed',
      };
    }

    return result;
  }

  /**
   * Select top-ranked option.
   */
  private async selectTopRanked<T>(
    rankedOptions: ReadonlyArray<RankedDecisionOption<T>>,
    _context: DecisionContext,
    config: SelectionConfig
  ): Promise<SelectionResult<T>> {
    if (rankedOptions.length === 0) {
      return {
        winners: [],
        strategy: 'top-ranked',
        success: false,
        failureReason: 'No options to select from',
      };
    }

    // Check minimum score threshold
    const minScore = config.minScore ?? this.config.defaultMinScore;
    const topOption = rankedOptions[0];

    if (topOption.score < minScore) {
      return {
        winners: [],
        strategy: 'top-ranked',
        success: false,
        failureReason: `Top option score ${topOption.score.toFixed(2)} below minimum ${minScore}`,
      };
    }

    return {
      winners: [topOption],
      strategy: 'top-ranked',
      success: true,
    };
  }

  /**
   * Select by threshold.
   */
  private async selectByThreshold<T>(
    rankedOptions: ReadonlyArray<RankedDecisionOption<T>>,
    _context: DecisionContext,
    config: SelectionConfig
  ): Promise<SelectionResult<T>> {
    const minScore = config.minScore ?? this.config.defaultMinScore;
    
    const winners = rankedOptions.filter(option => option.score >= minScore);

    if (winners.length === 0) {
      return {
        winners: [],
        strategy: 'threshold',
        success: false,
        failureReason: `No options meet minimum score threshold ${minScore}`,
      };
    }

    return {
      winners,
      strategy: 'threshold',
      success: true,
    };
  }

  /**
   * Select by confidence gating.
   */
  private async selectByConfidence<T>(
    rankedOptions: ReadonlyArray<RankedDecisionOption<T>>,
    _context: DecisionContext,
    config: SelectionConfig
  ): Promise<SelectionResult<T>> {
    const minConfidence = config.minConfidence ?? this.config.defaultMinConfidence;

    // Filter by confidence
    const confidentOptions = rankedOptions.filter(option => {
      const confidence = option.metadata?.sourceConfidence ?? 0.5;
      return confidence >= minConfidence;
    });

    if (confidentOptions.length === 0) {
      // If no confident options, return empty or top-ranked based on config
      if (this.config.allowEmptySelection) {
        return {
          winners: [],
          strategy: 'confidence-gated',
          success: false,
          failureReason: `No options meet minimum confidence ${minConfidence}`,
        };
      }
      // Fall back to top-ranked
      return this.selectTopRanked(rankedOptions, _context, config);
    }

    // Return highest ranked confident option(s)
    return {
      winners: [confidentOptions[0]],
      strategy: 'confidence-gated',
      success: true,
    };
  }

  /**
   * Multi-select top N options.
   */
  private async multiSelect<T>(
    rankedOptions: ReadonlyArray<RankedDecisionOption<T>>,
    _context: DecisionContext,
    config: SelectionConfig
  ): Promise<SelectionResult<T>> {
    const winnerCount = config.winnerCount ?? this.config.defaultWinnerCount;
    const minScore = config.minScore ?? this.config.defaultMinScore;

    // Select top N that meet threshold
    const winners: RankedDecisionOption<T>[] = [];
    
    for (const option of rankedOptions) {
      if (option.score >= minScore && winners.length < winnerCount) {
        winners.push(option);
      }
    }

    if (winners.length === 0) {
      return {
        winners: [],
        strategy: 'multi-select',
        success: false,
        failureReason: 'No options meet criteria for multi-select',
      };
    }

    return {
      winners,
      strategy: 'multi-select',
      success: true,
    };
  }

  /**
   * Validate selection result.
   */
  validateSelection<T = unknown>(
    result: SelectionResult<T>,
    constraints: {
      minConfidence?: DecisionConfidence;
      maxWinners?: number;
      requireWinner?: boolean;
    }
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check success
    if (constraints.requireWinner && !result.success) {
      errors.push('Selection failed but winner is required');
    }

    // Check winner count
    if (constraints.maxWinners !== undefined && result.winners.length > constraints.maxWinners) {
      errors.push(`Too many winners: ${result.winners.length} > ${constraints.maxWinners}`);
    }

    // Check confidence
    if (constraints.minConfidence !== undefined) {
      for (const winner of result.winners) {
        const confidence = winner.metadata?.sourceConfidence ?? 0;
        if (confidence < constraints.minConfidence) {
          errors.push(`Winner ${winner.id} confidence ${confidence} below minimum ${constraints.minConfidence}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get selector version.
   */
  getVersion(): string {
    return '1.0.0';
  }
}

/**
 * Factory function for creating a Decision Selector.
 */
export function createDecisionSelector(
  config?: Partial<DecisionSelectorConfig>
): IDecisionSelector {
  return new DecisionSelector(config);
}

// Default instance
export const defaultDecisionSelector = createDecisionSelector();
