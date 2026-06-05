/**
 * @fileoverview Decision Arbitrator - Arbitration Engine
 * @module @/intelligence/decision/DecisionArbitrator
 * 
 * Constitutional decision arbitration engine.
 * 
 * This module provides the ONLY sanctioned arbitration algorithms for CareerOS.
 * All decision conflicts MUST be resolved through this module.
 * 
 * Arbitration strategies:
 * - stakeholder-vote: Weighted voting among stakeholders
 * - weighted-average: Average of stakeholder preferences
 * - pareto-optimality: Pareto-optimal selection
 * - nash-bargaining: Nash bargaining solution
 * - fair-division: Fair division algorithms
 * - authority-decides: Authority makes final call
 * - custom: User-defined arbitration
 * 
 * @version 1.0.0
 * @author CareerOS Constitutional Architecture Team
 * @since Wave 2.1 - Decision Authority Infrastructure
 */

import type {
  DecisionOption,
  DecisionContext,
  ArbitrationConfig,
  ArbitrationResult,
  Conflict,
  ArbitrationStrategy,
  CustomArbitrator,
  DecisionConfidence,
} from './DecisionTypes';

/**
 * Interface for the Decision Arbitrator.
 */
export interface IDecisionArbitrator {
  /**
   * Arbitrate between conflicting options.
   */
  arbitrate<T = unknown>(
    options: ReadonlyArray<DecisionOption<T>>,
    conflicts: ReadonlyArray<Conflict>,
    context: DecisionContext,
    config: ArbitrationConfig
  ): Promise<ArbitrationResult<T>>;

  /**
   * Detect conflicts among options.
   */
  detectConflicts<T = unknown>(
    options: ReadonlyArray<DecisionOption<T>>,
    context: DecisionContext
  ): Promise<ReadonlyArray<Conflict>>;

  /**
   * Get arbitrator version.
   */
  getVersion(): string;
}

/**
 * Configuration for the Decision Arbitrator.
 */
export interface DecisionArbitratorConfig {
  /** Default arbitration strategy */
  readonly defaultStrategy: ArbitrationStrategy;
  
  /** Default stakeholder weights */
  readonly defaultStakeholderWeights: Record<string, number>;
  
  /** Whether to require consensus */
  readonly requireConsensus: boolean;
  
  /** Consensus threshold */
  readonly consensusThreshold: DecisionConfidence;
  
  /** Maximum arbitration attempts */
  readonly maxAttempts: number;
}

/**
 * Default arbitrator configuration.
 */
export const DEFAULT_ARBITRATOR_CONFIG: DecisionArbitratorConfig = {
  defaultStrategy: 'authority-decides',
  defaultStakeholderWeights: { student: 0.5, system: 0.5 },
  requireConsensus: false,
  consensusThreshold: 0.8,
  maxAttempts: 3,
};

/**
 * Decision Arbitrator implementation.
 */
export class DecisionArbitrator implements IDecisionArbitrator {
  private config: DecisionArbitratorConfig;

  constructor(config: Partial<DecisionArbitratorConfig> = {}) {
    this.config = { ...DEFAULT_ARBITRATOR_CONFIG, ...config };
  }

  /**
   * Arbitrate between conflicting options.
   */
  async arbitrate<T = unknown>(
    options: ReadonlyArray<DecisionOption<T>>,
    conflicts: ReadonlyArray<Conflict>,
    context: DecisionContext,
    config: ArbitrationConfig
  ): Promise<ArbitrationResult<T>> {
    const strategy = config.strategy ?? this.config.defaultStrategy;
    const weights = config.stakeholderWeights ?? this.config.defaultStakeholderWeights;
    
    let result: ArbitrationResult<T>;

    switch (strategy) {
      case 'stakeholder-vote':
        result = await this.stakeholderVote(options, conflicts, context, weights);
        break;
      case 'weighted-average':
        result = await this.weightedAverage(options, conflicts, context, weights);
        break;
      case 'pareto-optimality':
        result = await this.paretoOptimality(options, conflicts, context);
        break;
      case 'nash-bargaining':
        result = await this.nashBargaining(options, conflicts, context, weights);
        break;
      case 'fair-division':
        result = await this.fairDivision(options, conflicts, context);
        break;
      case 'authority-decides':
        result = await this.authorityDecides(options, conflicts, context);
        break;
      case 'custom':
        if (!config.customArbitrator) {
          throw new Error('Custom arbitrator not provided');
        }
        result = await config.customArbitrator(options, conflicts, context);
        break;
      default:
        result = await this.authorityDecides(options, conflicts, context);
    }

    // Check consensus if required
    if (config.requireConsensus && !this.hasConsensus(result, config.consensusThreshold)) {
      return {
        ...result,
        rationale: `${result.rationale} (Note: Consensus not achieved)`,
      };
    }

    return result;
  }

  /**
   * Stakeholder vote arbitration.
   */
  private async stakeholderVote<T>(
    options: ReadonlyArray<DecisionOption<T>>,
    conflicts: ReadonlyArray<Conflict>,
    _context: DecisionContext,
    weights: Record<string, number>
  ): Promise<ArbitrationResult<T>> {
    // Count weighted votes for each option
    const votes = new Map<string, number>();
    
    for (const option of options) {
      let voteCount = 0;
      const stakeholderWeights = option.metadata?.stakeholderWeights ?? {};
      
      for (const [stakeholder, weight] of Object.entries(weights)) {
        const preference = stakeholderWeights[stakeholder] ?? 0.5;
        voteCount += preference * weight;
      }
      
      votes.set(option.id, voteCount);
    }

    // Find winner
    let winnerId: string | undefined;
    let maxVotes = -1;
    
    for (const [id, count] of votes.entries()) {
      if (count > maxVotes) {
        maxVotes = count;
        winnerId = id;
      }
    }

    const winner = winnerId ? options.find(o => o.id === winnerId) : undefined;

    // Calculate satisfaction
    const satisfaction: Record<string, number> = {};
    for (const stakeholder of Object.keys(weights)) {
      satisfaction[stakeholder] = winner ? 
        (winner.metadata?.stakeholderWeights?.[stakeholder] ?? 0.5) : 0.5;
    }

    return {
      winner,
      strategy: 'stakeholder-vote',
      resolvedConflicts: conflicts,
      remainingConflicts: [],
      stakeholderSatisfaction: satisfaction,
      rationale: `Stakeholder vote with weighted preferences. Winner received ${maxVotes.toFixed(2)} weighted votes.`,
    };
  }

  /**
   * Weighted average arbitration.
   */
  private async weightedAverage<T>(
    options: ReadonlyArray<DecisionOption<T>>,
    conflicts: ReadonlyArray<Conflict>,
    _context: DecisionContext,
    weights: Record<string, number>
  ): Promise<ArbitrationResult<T>> {
    // Calculate weighted preference score for each option
    const scores = new Map<string, number>();
    
    for (const option of options) {
      let score = 0;
      const stakeholderWeights = option.metadata?.stakeholderWeights ?? {};
      
      for (const [stakeholder, weight] of Object.entries(weights)) {
        score += (stakeholderWeights[stakeholder] ?? 0.5) * weight;
      }
      
      scores.set(option.id, score);
    }

    // Find option closest to weighted average preference
    const avgScore = Array.from(scores.values()).reduce((a, b) => a + b, 0) / scores.size;
    
    let winnerId: string | undefined;
    let minDiff = Infinity;
    
    for (const [id, score] of scores.entries()) {
      const diff = Math.abs(score - avgScore);
      if (diff < minDiff) {
        minDiff = diff;
        winnerId = id;
      }
    }

    const winner = winnerId ? options.find(o => o.id === winnerId) : undefined;

    return {
      winner,
      strategy: 'weighted-average',
      resolvedConflicts: conflicts,
      remainingConflicts: [],
      rationale: `Weighted average preference. Winner is closest to average preference (${avgScore.toFixed(2)}).`,
    };
  }

  /**
   * Pareto optimality arbitration.
   */
  private async paretoOptimality<T>(
    options: ReadonlyArray<DecisionOption<T>>,
    conflicts: ReadonlyArray<Conflict>,
    _context: DecisionContext
  ): Promise<ArbitrationResult<T>> {
    // Find Pareto-optimal options
    const paretoOptimal: DecisionOption<T>[] = [];
    
    for (const option of options) {
      const scores = this.extractScores(option);
      let dominated = false;
      
      for (const other of options) {
        if (other.id === option.id) continue;
        
        const otherScores = this.extractScores(other);
        if (this.dominates(otherScores, scores)) {
          dominated = true;
          break;
        }
      }
      
      if (!dominated) {
        paretoOptimal.push(option);
      }
    }

    // If multiple Pareto-optimal, pick first (or could use secondary criterion)
    const winner = paretoOptimal.length > 0 ? paretoOptimal[0] : options[0];

    return {
      winner,
      strategy: 'pareto-optimality',
      resolvedConflicts: conflicts,
      remainingConflicts: paretoOptimal.length > 1 ? conflicts : [],
      rationale: `Pareto-optimal selection. ${paretoOptimal.length} options on Pareto frontier.`,
    };
  }

  /**
   * Nash bargaining arbitration.
   */
  private async nashBargaining<T>(
    options: ReadonlyArray<DecisionOption<T>>,
    conflicts: ReadonlyArray<Conflict>,
    _context: DecisionContext,
    weights: Record<string, number>
  ): Promise<ArbitrationResult<T>> {
    // Find option maximizing product of stakeholder utilities
    let winner: DecisionOption<T> | undefined;
    let maxProduct = -1;

    for (const option of options) {
      const stakeholderWeights = option.metadata?.stakeholderWeights ?? {};
      
      let product = 1;
      for (const [stakeholder, weight] of Object.entries(weights)) {
        const utility = (stakeholderWeights[stakeholder] ?? 0.5) * weight;
        product *= utility;
      }
      
      if (product > maxProduct) {
        maxProduct = product;
        winner = option;
      }
    }

    return {
      winner,
      strategy: 'nash-bargaining',
      resolvedConflicts: conflicts,
      remainingConflicts: [],
      rationale: `Nash bargaining solution. Maximizes product of stakeholder utilities (${maxProduct.toFixed(4)}).`,
    };
  }

  /**
   * Fair division arbitration.
   */
  private async fairDivision<T>(
    options: ReadonlyArray<DecisionOption<T>>,
    conflicts: ReadonlyArray<Conflict>,
    _context: DecisionContext
  ): Promise<ArbitrationResult<T>> {
    // Simplified fair division: maximize minimum stakeholder satisfaction
    let winner: DecisionOption<T> | undefined;
    let maxMinSatisfaction = -1;

    for (const option of options) {
      const stakeholderWeights = option.metadata?.stakeholderWeights ?? {};
      const satisfactions = Object.values(stakeholderWeights);
      const minSatisfaction = satisfactions.length > 0 ? Math.min(...satisfactions) : 0.5;
      
      if (minSatisfaction > maxMinSatisfaction) {
        maxMinSatisfaction = minSatisfaction;
        winner = option;
      }
    }

    return {
      winner,
      strategy: 'fair-division',
      resolvedConflicts: conflicts,
      remainingConflicts: [],
      rationale: `Fair division (maximin). Guarantees minimum satisfaction of ${maxMinSatisfaction.toFixed(2)}.`,
    };
  }

  /**
   * Authority decides arbitration.
   */
  private async authorityDecides<T>(
    options: ReadonlyArray<DecisionOption<T>>,
    conflicts: ReadonlyArray<Conflict>,
    _context: DecisionContext
  ): Promise<ArbitrationResult<T>> {
    // Authority picks the option with highest source confidence
    let winner: DecisionOption<T> | undefined;
    let maxConfidence = -1;

    for (const option of options) {
      const confidence = option.metadata?.sourceConfidence ?? 0.5;
      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        winner = option;
      }
    }

    return {
      winner,
      strategy: 'authority-decides',
      resolvedConflicts: conflicts,
      remainingConflicts: [],
      rationale: `Authority decision based on source confidence (${maxConfidence.toFixed(2)}).`,
    };
  }

  /**
   * Detect conflicts among options.
   */
  async detectConflicts<T = unknown>(
    options: ReadonlyArray<DecisionOption<T>>,
    _context: DecisionContext
  ): Promise<ReadonlyArray<Conflict>> {
    const conflicts: Conflict[] = [];

    // Detect stakeholder conflicts
    const stakeholderIds = this.extractAllStakeholders(options);
    
    for (const stakeholderId of stakeholderIds) {
      const preferences = options.map(o => ({
        id: o.id,
        preference: o.metadata?.stakeholderWeights?.[stakeholderId] ?? 0.5,
      }));
      
      // Check for high variance in preferences (indicates conflict)
      const maxPref = Math.max(...preferences.map(p => p.preference));
      const minPref = Math.min(...preferences.map(p => p.preference));
      
      if (maxPref - minPref > 0.5) {
        conflicts.push({
          type: 'stakeholder-preference-variance',
          optionIds: preferences.map(p => p.id),
          stakeholderIds: [stakeholderId],
          severity: maxPref - minPref,
          description: `Stakeholder ${stakeholderId} has highly varying preferences`,
        });
      }
    }

    // Detect mutually exclusive options
    const mutuallyExclusive = options.filter(o => 
      (o.metadata as Record<string, unknown>)?.mutuallyExclusive === true
    );
    
    if (mutuallyExclusive.length > 1) {
      conflicts.push({
        type: 'mutually-exclusive',
        optionIds: mutuallyExclusive.map(o => o.id),
        severity: 0.9,
        description: 'Options are mutually exclusive',
      });
    }

    return conflicts;
  }

  /**
   * Check if result has consensus.
   */
  private hasConsensus<T>(
    result: ArbitrationResult<T>,
    threshold: DecisionConfidence = 0.8
  ): boolean {
    if (!result.stakeholderSatisfaction) return true;
    
    const satisfactions = Object.values(result.stakeholderSatisfaction);
    if (satisfactions.length === 0) return true;
    
    const minSatisfaction = Math.min(...satisfactions);
    return minSatisfaction >= threshold;
  }

  /**
   * Extract scores from option.
   */
  private extractScores<T>(option: DecisionOption<T>): number[] {
    const metadata = option.metadata as Record<string, unknown> | undefined;
    if (metadata?.scores && Array.isArray(metadata.scores)) {
      return metadata.scores as number[];
    }
    return [metadata?.sourceConfidence as number ?? 0.5];
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
   * Extract all stakeholder IDs from options.
   */
  private extractAllStakeholders<T>(options: ReadonlyArray<DecisionOption<T>>): string[] {
    const stakeholders = new Set<string>();
    
    for (const option of options) {
      const weights = option.metadata?.stakeholderWeights ?? {};
      for (const stakeholder of Object.keys(weights)) {
        stakeholders.add(stakeholder);
      }
    }
    
    return Array.from(stakeholders);
  }

  /**
   * Get arbitrator version.
   */
  getVersion(): string {
    return '1.0.0';
  }
}

/**
 * Factory function for creating a Decision Arbitrator.
 */
export function createDecisionArbitrator(
  config?: Partial<DecisionArbitratorConfig>
): IDecisionArbitrator {
  return new DecisionArbitrator(config);
}

// Default instance
export const defaultDecisionArbitrator = createDecisionArbitrator();
