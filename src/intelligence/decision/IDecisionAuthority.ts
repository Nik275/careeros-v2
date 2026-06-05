/**
 * @fileoverview Decision Authority - Public Interface
 * @module @/intelligence/decision/IDecisionAuthority
 * 
 * The constitutional public interface for the Decision Authority.
 * 
 * This interface defines the contract that all Decision Authority implementations
 * must satisfy. Following constitutional principles:
 * 
 * 1. Decision Authority is the SOLE owner of decision-making
 * 2. All decisions MUST flow through this interface
 * 3. No other system may make, rank, compare, or select decisions
 * 4. This interface is STABLE - changes require constitutional review
 * 
 * @version 1.0.0
 * @author CareerOS Constitutional Architecture Team
 * @since Wave 2.1 - Decision Authority Infrastructure
 */

import type {
  DecisionId,
  DecisionInput,
  DecisionOutput,
  DecisionConfig,
  DecisionMetrics,
  DecisionEvent,
  DecisionEventType,
  RankingResult,
  DecisionComparisonResult,
  ArbitrationResult,
  SelectionResult,
  DecisionExplanation,
  RankedDecisionOption,
  DecisionOption,
  DecisionContext,
  Conflict,
  RankingConfig,
  ComparisonConfig,
  ArbitrationConfig,
  SelectionConfig,
  ExplanationConfig,
} from './DecisionTypes';

// Wave 2.3 - Meta-Decision Authority Integration
import type {
  MetaDecisionInput,
  MetaDecisionAnalysis,
  DecisionReadinessAnalysis,
  DecisionQualityAnalysis,
  DecisionTimingAnalysis,
  DecisionState,
} from './meta/MetaDecisionAuthority';

/**
 * Public interface for the Decision Authority.
 * 
 * This is the ONLY sanctioned way to make decisions in CareerOS.
 * Any system requiring decision-making must use this interface.
 * 
 * @example
 * ```typescript
 * const authority = createDecisionAuthority(config);
 * 
 * const input: DecisionInput = {
 *   type: 'career-selection',
 *   context: { studentId: 'stu-123', sessionId: 'sess-456', timestamp: new Date() },
 *   options: [
 *     { id: 'career-1', type: 'career', data: { name: 'Software Engineer' }, source: 'knowledge-graph', createdAt: new Date() },
 *     { id: 'career-2', type: 'career', data: { name: 'Product Manager' }, source: 'knowledge-graph', createdAt: new Date() },
 *   ],
 * };
 * 
 * const output = await authority.decide(input);
 * console.log(`Winner: ${output.winner?.data.name}`);
 * ```
 */
export interface IDecisionAuthority {
  /**
   * The ONLY method for making decisions in CareerOS.
   * 
   * This is the constitutional entry point for all decision-making.
   * Every system that needs to make a decision MUST call this method.
   * 
   * The decision process follows these phases:
   * 1. Validation - Validate inputs
   * 2. Ranking - Rank all options
   * 3. Comparison - Compare top options
   * 4. Arbitration - Resolve any conflicts
   * 5. Selection - Select winner(s)
   * 6. Explanation - Generate rationale
   * 7. Audit - Record decision trail
   * 
   * @param input - Decision input with options and context
   * @returns Decision output with winner, rankings, and explanation
   * @throws DecisionError if decision cannot be made
   * 
   * @example
   * ```typescript
   * const output = await authority.decide({
   *   type: 'career-selection',
   *   context: studentContext,
   *   options: careerOptions,
   * });
   * ```
   */
  decide<T = unknown>(input: DecisionInput<T>): Promise<DecisionOutput<T>>;

  /**
   * Rank options without making a final decision.
   * 
   * Use this when you need to present ranked options to the user
   * without selecting a winner. The final decision may be made later
   * or by the user themselves.
   * 
   * @param options - Options to rank
   * @param context - Decision context
   * @param config - Optional ranking configuration
   * @returns Ranked options with scores
   * 
   * @example
   * ```typescript
   * const ranking = await authority.rank(careerOptions, context, {
   *   algorithm: 'confidence-weighted',
   *   tieBreaker: 'confidence',
   * });
   * ```
   */
  rank<T = unknown>(
    options: ReadonlyArray<DecisionOption<T>>,
    context: DecisionContext,
    config?: Partial<RankingConfig>
  ): Promise<RankingResult<T>>;

  /**
   * Compare two options pairwise.
   * 
   * Use this for explicit A/B comparisons when you need to understand
   * the relative merits of two specific options.
   * 
   * @param optionA - First option
   * @param optionB - Second option
   * @param context - Decision context
   * @param config - Optional comparison configuration
   * @returns Comparison result with rationale
   * 
   * @example
   * ```typescript
   * const comparison = await authority.compare(careerA, careerB, context);
   * if (comparison.outcome === 'a-better') {
   *   console.log(`${careerA.data.name} is better because ${comparison.rationale}`);
   * }
   * ```
   */
  compare<T = unknown>(
    optionA: DecisionOption<T>,
    optionB: DecisionOption<T>,
    context: DecisionContext,
    config?: Partial<ComparisonConfig>
  ): Promise<DecisionComparisonResult>;

  /**
   * Compare multiple options in tournament style.
   * 
   * Efficiently compares many options to find the best.
   * Uses tournament elimination to minimize comparisons.
   * 
   * @param options - Options to compare
   * @param context - Decision context
   * @returns Array of pairwise comparison results
   */
  compareAll<T = unknown>(
    options: ReadonlyArray<DecisionOption<T>>,
    context: DecisionContext
  ): Promise<ReadonlyArray<DecisionComparisonResult>>;

  /**
   * Arbitrate between conflicting options.
   * 
   * Use this when stakeholders disagree or when multiple
   * valid options exist with conflicting merits.
   * 
   * @param options - Options in conflict
   * @param conflicts - List of conflicts to resolve
   * @param context - Decision context
   * @param config - Optional arbitration configuration
   * @returns Arbitration result with resolution
   * 
   * @example
   * ```typescript
   * const arbitration = await authority.arbitrate(
   *   options,
   *   [{ type: 'stakeholder-conflict', optionIds: ['opt-1', 'opt-2'], severity: 0.8, description: 'Parents prefer opt-1, student prefers opt-2' }],
   *   context,
   *   { strategy: 'stakeholder-vote', stakeholderWeights: { student: 0.6, parent: 0.4 } }
   * );
   * ```
   */
  arbitrate<T = unknown>(
    options: ReadonlyArray<DecisionOption<T>>,
    conflicts: ReadonlyArray<Conflict>,
    context: DecisionContext,
    config?: Partial<ArbitrationConfig>
  ): Promise<ArbitrationResult<T>>;

  /**
   * Select winner(s) from ranked options.
   * 
   * This is the final selection step that determines the winner.
   * Can be used independently if options are already ranked.
   * 
   * @param rankedOptions - Pre-ranked options
   * @param context - Decision context
   * @param config - Optional selection configuration
   * @returns Selection result with winner(s)
   */
  select<T = unknown>(
    rankedOptions: ReadonlyArray<RankedDecisionOption<T>>,
    context: DecisionContext,
    config?: Partial<SelectionConfig>
  ): Promise<SelectionResult<T>>;

  /**
   * Explain a decision.
   * 
   * Generate human-readable explanation of why a decision was made.
   * Can explain previous decisions or hypothetical decisions.
   * 
   * @param decisionId - Decision to explain (or 'hypothetical' for new)
   * @param options - Options that were considered
   * @param winner - Winning option
   * @param context - Decision context
   * @param config - Optional explanation configuration
   * @returns Decision explanation
   */
  explain<T = unknown>(
    decisionId: DecisionId | 'hypothetical',
    options: ReadonlyArray<RankedDecisionOption<T>>,
    winner: DecisionOption<T>,
    context: DecisionContext,
    config?: Partial<ExplanationConfig>
  ): Promise<DecisionExplanation>;

  /**
   * Reconsider a previous decision.
   * 
   * Re-evaluates a previous decision with new information.
   * Preserves original decision history for audit.
   * 
   * @param decisionId - Original decision to reconsider
   * @param newContext - Updated context with new information
   * @param newOptions - Updated options (if changed)
   * @returns New decision output
   */
  reconsider<T = unknown>(
    decisionId: DecisionId,
    newContext: DecisionContext,
    newOptions?: ReadonlyArray<DecisionOption<T>>
  ): Promise<DecisionOutput<T>>;

  /**
   * Appeal a decision.
   * 
   * Marks a decision for review and potential reversal.
   * Does not automatically change the decision.
   * 
   * @param decisionId - Decision to appeal
   * @param reason - Reason for appeal
   * @param requestedBy - Who is appealing
   * @returns Appeal status
   */
  appeal(
    decisionId: DecisionId,
    reason: string,
    requestedBy: string
  ): Promise<{ success: boolean; appealId: string; status: 'pending-review' }>;

  /**
   * Get decision by ID.
   * 
   * Retrieves a previous decision from history.
   * 
   * @param decisionId - Decision ID
   * @returns Decision output or undefined if not found
   */
  getDecision<T = unknown>(decisionId: DecisionId): Promise<DecisionOutput<T> | undefined>;

  /**
   * Get decision history for a student.
   * 
   * Retrieves all decisions made for a specific student.
   * 
   * @param studentId - Student ID
   * @param options - Query options (pagination, filters)
   * @returns Array of decisions
   */
  getDecisionHistory(
    studentId: string,
    options?: {
      limit?: number;
      offset?: number;
      types?: string[];
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<ReadonlyArray<DecisionOutput>>;

  /**
   * Subscribe to decision events.
   * 
   * Listen for decision lifecycle events.
   * 
   * @param eventType - Type of event to subscribe to (or 'all')
   * @param handler - Event handler function
   * @returns Unsubscribe function
   * 
   * @example
   * ```typescript
   * const unsubscribe = authority.on('decision-completed', (event) => {
   *   console.log(`Decision ${event.decisionId} completed`);
   * });
   * // Later: unsubscribe();
   * ```
   */
  on(
    eventType: DecisionEventType | 'all',
    handler: (event: DecisionEvent) => void | Promise<void>
  ): () => void;

  /**
   * Get current configuration.
   * 
   * @returns Current Decision Authority configuration
   */
  getConfig(): DecisionConfig;

  /**
   * Update configuration.
   * 
   * Changes configuration for future decisions.
   * Does not affect past decisions.
   * 
   * @param config - Partial configuration to update
   */
  updateConfig(config: Partial<DecisionConfig>): void;

  /**
   * Get authority metrics.
   * 
   * Returns current performance and usage metrics.
   * 
   * @returns Decision metrics
   */
  getMetrics(): Promise<DecisionMetrics>;

  /**
   * Reset metrics.
   * 
   * Clears accumulated metrics (for testing).
   */
  resetMetrics(): void;

  /**
   * Health check.
   * 
   * Verifies authority is operational.
   * 
   * @returns True if healthy
   */
  healthCheck(): Promise<boolean>;

  /**
   * Dispose of resources.
   * 
   * Cleans up resources when authority is no longer needed.
   */
  dispose(): Promise<void>;

  // ============================================================================
  // WAVE 2.3 - META-DECISION AUTHORITY
  // ============================================================================

  /**
   * Perform meta-decision analysis.
   * 
   * Analyzes the quality of a decision itself, determining whether
   * to decide now, delay, gather information, explore, or commit.
   * 
   * This is the constitutional entry point for meta-decision analysis.
   * 
   * @param input - Meta-decision input with decision context
   * @returns Complete meta-decision analysis
   * @throws DecisionError if analysis cannot be performed
   * 
   * @example
   * ```typescript
   * const analysis = await authority.analyzeMetaDecision({
   *   studentId: 'stu-123',
   *   decisionId: 'dec-456',
   *   studentBeliefs: { identityStability: 75, valueStability: 80, understandingLevel: 70 },
   *   utilityConfidence: { overall: 0.75, byCareer: { 'career-1': 0.8 } },
   *   uncertainty: { overall: 40, informationGaps: [], unknownFactors: [] },
   *   biasProfile: { overallBias: 30, dominantBiases: [] },
   *   informationCompleteness: { careerData: 70, personalFit: 75, marketData: 60, outcomeData: 55 },
   *   decisionIntelligence: { recommendation: 'career-1', confidence: 0.75, alternatives: ['career-2'] },
   * });
   * 
   * if (analysis.recommendedAction.action === 'decide_now') {
   *   console.log('Ready to decide!');
   * }
   * ```
   */
  analyzeMetaDecision(input: MetaDecisionInput): Promise<MetaDecisionAnalysis>;

  /**
   * Analyze decision readiness only.
   * 
   * Evaluates decision readiness across multiple dimensions
   * without performing full meta-decision analysis.
   * 
   * @param input - Meta-decision input
   * @returns Decision readiness analysis
   */
  analyzeDecisionReadiness(input: MetaDecisionInput): Promise<DecisionReadinessAnalysis>;

  /**
   * Analyze decision quality only.
   * 
   * Evaluates decision quality across multiple dimensions
   * without performing full meta-decision analysis.
   * 
   * @param input - Meta-decision input
   * @returns Decision quality analysis
   */
  analyzeDecisionQuality(input: MetaDecisionInput): Promise<DecisionQualityAnalysis>;

  /**
   * Analyze decision timing only.
   * 
   * Determines optimal decision timing based on readiness and quality.
   * 
   * @param input - Meta-decision input
   * @param readinessState - Current decision state
   * @param quality - Overall quality score (0-100)
   * @returns Decision timing analysis
   */
  analyzeDecisionTiming(
    input: MetaDecisionInput,
    readinessState: DecisionState,
    quality: number
  ): Promise<DecisionTimingAnalysis>;

  /**
   * Check if student should decide now.
   * 
   * Quick utility method for checking decision readiness.
   * 
   * @param analysis - Meta-decision analysis
   * @returns True if decision should be made now
   */
  shouldDecideNow(analysis: MetaDecisionAnalysis): boolean;

  /**
   * Check if student should delay decision.
   * 
   * Quick utility method for checking if delay is recommended.
   * 
   * @param analysis - Meta-decision analysis
   * @returns True if decision should be delayed
   */
  shouldDelayDecision(analysis: MetaDecisionAnalysis): boolean;
}

/**
 * Factory function type for creating Decision Authority instances.
 */
export type DecisionAuthorityFactory = (
  config?: Partial<DecisionConfig>
) => IDecisionAuthority;

/**
 * Configuration for Decision Authority factory.
 */
export interface DecisionAuthorityFactoryConfig {
  /** Default configuration */
  readonly defaultConfig?: Partial<DecisionConfig>;
  
  /** Whether to enable caching */
  readonly enableCache?: boolean;
  
  /** Cache size limit */
  readonly cacheSize?: number;
  
  /** Whether to enable distributed tracing */
  readonly enableTracing?: boolean;
  
  /** Custom modules */
  readonly modules?: {
    ranker?: unknown;
    comparator?: unknown;
    arbitrator?: unknown;
    selector?: unknown;
    explainer?: unknown;
    auditor?: unknown;
  };
}

/**
 * Decision Authority constructor interface.
 * 
 * For internal use. Consumers should use the factory function.
 */
export interface IDecisionAuthorityConstructor {
  new (config: DecisionConfig): IDecisionAuthority;
}

/**
 * Decision result with full traceability.
 */
export interface TracedDecisionOutput<T = unknown> extends DecisionOutput<T> {
  /** Full processing trace */
  readonly trace: ReadonlyArray<{
    phase: string;
    timestamp: Date;
    duration: number;
    input: unknown;
    output: unknown;
  }>;
}

/**
 * Batch decision input.
 */
export interface BatchDecisionInput {
  /** Array of individual decision inputs */
  readonly decisions: ReadonlyArray<DecisionInput>;
  
  /** Whether decisions are independent */
  readonly independent: boolean;
  
  /** Maximum parallel processing */
  readonly maxConcurrency?: number;
}

/**
 * Batch decision output.
 */
export interface BatchDecisionOutput {
  /** Individual decision outputs */
  readonly results: ReadonlyArray<DecisionOutput>;
  
  /** Overall batch statistics */
  readonly statistics: {
    total: number;
    successful: number;
    failed: number;
    totalDuration: number;
    avgDuration: number;
  };
  
  /** Batch ID */
  readonly batchId: string;
}

/**
 * Extended interface for batch operations.
 */
export interface IBatchDecisionAuthority extends IDecisionAuthority {
  /**
   * Process multiple decisions in batch.
   * 
   * More efficient than calling decide() multiple times.
   * 
   * @param batch - Batch decision input
   * @returns Batch decision output
   */
  decideBatch(batch: BatchDecisionInput): Promise<BatchDecisionOutput>;
}

/**
 * Decision authority capability flags.
 */
export interface DecisionAuthorityCapabilities {
  /** Supports ranking */
  readonly ranking: boolean;
  
  /** Supports comparison */
  readonly comparison: boolean;
  
  /** Supports arbitration */
  readonly arbitration: boolean;
  
  /** Supports explanation */
  readonly explanation: boolean;
  
  /** Supports batch processing */
  readonly batchProcessing: boolean;
  
  /** Supports reconsideration */
  readonly reconsideration: boolean;
  
  /** supports appeals */
  readonly appeals: boolean;
  
  /** Supports distributed tracing */
  readonly distributedTracing: boolean;
}

/**
 * Get capabilities of a decision authority.
 */
export function getDecisionAuthorityCapabilities(
  authority: IDecisionAuthority
): DecisionAuthorityCapabilities {
  // Check if authority implements extended interfaces
  const hasBatch = 'decideBatch' in authority;
  
  return {
    ranking: true,
    comparison: true,
    arbitration: true,
    explanation: true,
    batchProcessing: hasBatch,
    reconsideration: true,
    appeals: true,
    distributedTracing: true,
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Maximum options per decision.
 */
export const MAX_OPTIONS_PER_DECISION = 1000;

/**
 * Default timeout for decisions (ms).
 */
export const DEFAULT_DECISION_TIMEOUT = 30000;

/**
 * Maximum explanation length.
 */
export const MAX_EXPLANATION_LENGTH = 5000;

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard for IDecisionAuthority.
 */
export function isDecisionAuthority(obj: unknown): obj is IDecisionAuthority {
  if (typeof obj !== 'object' || obj === null) return false;
  const authority = obj as IDecisionAuthority;
  return (
    typeof authority.decide === 'function' &&
    typeof authority.rank === 'function' &&
    typeof authority.compare === 'function' &&
    typeof authority.getConfig === 'function'
  );
}

/**
 * Type guard for IBatchDecisionAuthority.
 */
export function isBatchDecisionAuthority(
  obj: unknown
): obj is IBatchDecisionAuthority {
  return isDecisionAuthority(obj) && 'decideBatch' in (obj as IBatchDecisionAuthority);
}
