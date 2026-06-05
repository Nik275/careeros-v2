/**
 * @fileoverview Decision Authority - Main Authority Implementation
 * @module @/intelligence/decision/DecisionAuthority
 * 
 * The Constitutional Decision Authority for CareerOS.
 * 
 * This is the SOLE sanctioned source of decision-making in CareerOS.
 * All decisions MUST flow through this authority.
 * 
 * Constitutional Principles:
 * 1. Single Ownership - Only this authority makes decisions
 * 2. Auditability - Every decision is fully traceable
 * 3. Explainability - Every decision can be explained
 * 4. Reproducibility - Same inputs produce same outputs
 * 5. Accountability - Clear responsibility for every decision
 * 
 * @version 1.0.0
 * @author CareerOS Constitutional Architecture Team
 * @since Wave 2.1 - Decision Authority Infrastructure
 */

import type {
  IDecisionAuthority,
  DecisionConfig,
  DecisionInput,
  DecisionOutput,
  DecisionId,
  DecisionMetrics,
  DecisionEvent,
  DecisionEventType,
  RankingConfig,
  ComparisonConfig,
  ArbitrationConfig,
  SelectionConfig,
  ExplanationConfig,
  RankingResult,
  DecisionComparisonResult,
  ArbitrationResult,
  SelectionResult,
  DecisionExplanation,
  RankedDecisionOption,
  DecisionOption,
  DecisionContext,
  Conflict,
  DecisionError,
  DecisionErrorType,
} from './IDecisionAuthority';

import type { IDecisionRanker } from './DecisionRanker';
import type { IDecisionComparator } from './DecisionComparator';
import type { IDecisionArbitrator } from './DecisionArbitrator';
import type { IDecisionSelector } from './DecisionSelector';
import type { IDecisionExplainer } from './DecisionExplainer';
import type { IDecisionHistory } from './DecisionHistory';
import type { IDecisionEvents } from './DecisionEvents';
import type { IDecisionAudit } from './DecisionAudit';

import {
  DEFAULT_DECISION_CONFIG,
  isValidDecisionInput,
} from './DecisionTypes';

import { createDecisionRanker } from './DecisionRanker';
import { createDecisionComparator } from './DecisionComparator';
import { createDecisionArbitrator } from './DecisionArbitrator';
import { createDecisionSelector } from './DecisionSelector';
import { createDecisionExplainer } from './DecisionExplainer';
import { createDecisionHistory } from './DecisionHistory';
import { createDecisionEvents, emitDecisionLifecycleEvents } from './DecisionEvents';
import { createDecisionAuditor } from './DecisionAudit';

// Wave 2.3 - Meta-Decision Authority Integration
import {
  createMetaDecisionAuthority,
  type IMetaDecisionAuthority,
  type MetaDecisionInput,
  type MetaDecisionAnalysis,
  type DecisionReadinessAnalysis,
  type DecisionQualityAnalysis,
  type DecisionTimingAnalysis,
  type DecisionState,
} from './meta/MetaDecisionAuthority';

// Wave 2.4 - Coalition Module Integration
import {
  createCoalitionModule,
  type ICoalitionModule,
  type CoalitionMember,
  type CoalitionMemberEvaluation,
  type CoalitionDynamics,
  type CoalitionAggregateScores,
  type MemberConflict,
  type CoalitionConfig,
  type CoalitionEvaluationInput,
  type PathInput,
} from './coalition/CoalitionModule';

/**
 * Decision Authority implementation.
 * 
 * This is the main entry point for ALL decision-making in CareerOS.
 */
export class DecisionAuthority implements IDecisionAuthority {
  private config: DecisionConfig;
  private ranker: IDecisionRanker;
  private comparator: IDecisionComparator;
  private arbitrator: IDecisionArbitrator;
  private selector: IDecisionSelector;
  private explainer: IDecisionExplainer;
  private history: IDecisionHistory;
  private events: IDecisionEvents;
  private auditor: IDecisionAudit;
  private metrics: DecisionMetrics;
  
  // Wave 2.3 - Meta-Decision Authority
  private metaDecisionAuthority: IMetaDecisionAuthority;

  // Wave 2.4 - Coalition Module
  private coalitionModule: ICoalitionModule;

  constructor(
    config: DecisionConfig = DEFAULT_DECISION_CONFIG,
    modules?: {
      ranker?: IDecisionRanker;
      comparator?: IDecisionComparator;
      arbitrator?: IDecisionArbitrator;
      selector?: IDecisionSelector;
      explainer?: IDecisionExplainer;
      history?: IDecisionHistory;
      events?: IDecisionEvents;
      auditor?: IDecisionAudit;
      metaDecisionAuthority?: IMetaDecisionAuthority;
      coalitionModule?: ICoalitionModule;
    }
  ) {
    this.config = config;
    this.ranker = modules?.ranker ?? createDecisionRanker();
    this.comparator = modules?.comparator ?? createDecisionComparator();
    this.arbitrator = modules?.arbitrator ?? createDecisionArbitrator();
    this.selector = modules?.selector ?? createDecisionSelector();
    this.explainer = modules?.explainer ?? createDecisionExplainer();
    this.history = modules?.history ?? createDecisionHistory();
    this.events = modules?.events ?? createDecisionEvents();
    this.auditor = modules?.auditor ?? createDecisionAuditor();
    
    // Wave 2.3 - Initialize Meta-Decision Authority
    this.metaDecisionAuthority = modules?.metaDecisionAuthority ?? createMetaDecisionAuthority();

    // Wave 2.4 - Initialize Coalition Module
    this.coalitionModule = modules?.coalitionModule ?? createCoalitionModule();

    // Initialize metrics
    this.metrics = {
      totalDecisions: 0,
      decisionsByType: {} as Record<string, number>,
      decisionsByStatus: {} as Record<string, number>,
      avgProcessingTime: 0,
      avgConfidence: 0.5,
      errorRate: 0,
      appealsRate: 0,
    };
  }

  /**
   * Make a decision.
   * 
   * This is the SOLE constitutional method for decision-making in CareerOS.
   */
  async decide<T = unknown>(input: DecisionInput<T>): Promise<DecisionOutput<T>> {
    const startTime = Date.now();
    const decisionId = this.generateDecisionId();

    // Validate input
    if (!isValidDecisionInput(input)) {
      throw new DecisionError('invalid-input', 'Invalid decision input', decisionId);
    }

    // Check for empty options
    if (input.options.length === 0) {
      throw new DecisionError('empty-options', 'No options provided for decision', decisionId);
    }

    // Create audit trail
    let audit = this.auditor.createAudit(decisionId, input, this.config);

    // Emit created event
    this.events.emitDecisionEvent('decision-created', decisionId, {
      type: input.type,
      optionCount: input.options.length,
    });

    try {
      // Step 1: Rank options
      audit = this.auditor.addStep(audit, {
        step: 'ranking',
        duration: 0,
        inputs: { options: input.options.map(o => o.id) },
        outputs: {},
        moduleVersion: this.ranker.getVersion(),
      });

      this.events.emitDecisionEvent('decision-ranking-started', decisionId, {});
      
      const rankingResult = await this.rank(input.options, input.context, input.config?.ranking);
      
      audit = this.auditor.addStep(audit, {
        step: 'ranking',
        duration: Date.now() - startTime,
        inputs: { options: input.options.map(o => o.id) },
        outputs: { rankedOptions: rankingResult.rankedOptions.map(o => ({ id: o.id, rank: o.rank, score: o.score })) },
        moduleVersion: this.ranker.getVersion(),
      });

      this.events.emitDecisionEvent('decision-ranking-completed', decisionId, {
        algorithm: rankingResult.algorithm,
        duration: rankingResult.duration,
      });

      // Step 2: Compare top options
      const comparisonResults: DecisionComparisonResult[] = [];
      
      if (rankingResult.rankedOptions.length >= 2) {
        audit = this.auditor.addStep(audit, {
          step: 'comparison',
          duration: 0,
          inputs: { topOptions: rankingResult.rankedOptions.slice(0, 3).map(o => o.id) },
          outputs: {},
          moduleVersion: this.comparator.getVersion(),
        });

        this.events.emitDecisionEvent('decision-comparison-started', decisionId, {});

        // Compare top 3 options pairwise
        const topOptions = rankingResult.rankedOptions.slice(0, 3);
        for (let i = 0; i < topOptions.length; i++) {
          for (let j = i + 1; j < topOptions.length; j++) {
            const comparison = await this.compare(
              topOptions[i],
              topOptions[j],
              input.context,
              input.config?.comparison
            );
            comparisonResults.push(comparison);
          }
        }

        audit = this.auditor.addStep(audit, {
          step: 'comparison',
          duration: Date.now() - startTime,
          inputs: { topOptions: topOptions.map(o => o.id) },
          outputs: { comparisons: comparisonResults.length },
          moduleVersion: this.comparator.getVersion(),
        });

        this.events.emitDecisionEvent('decision-comparison-completed', decisionId, {
          comparisonCount: comparisonResults.length,
        });
      }

      // Step 3: Detect and resolve conflicts
      let arbitrationResult: ArbitrationResult<T> | undefined;
      
      const conflicts = await this.arbitrator.detectConflicts(input.options, input.context);
      
      if (conflicts.length > 0) {
        audit = this.auditor.addStep(audit, {
          step: 'arbitration',
          duration: 0,
          inputs: { conflicts: conflicts.map(c => c.type) },
          outputs: {},
          moduleVersion: this.arbitrator.getVersion(),
        });

        this.events.emitDecisionEvent('decision-arbitration-started', decisionId, {
          conflictCount: conflicts.length,
        });

        arbitrationResult = await this.arbitrate(
          input.options,
          conflicts,
          input.context,
          input.config?.arbitration
        );

        audit = this.auditor.addStep(audit, {
          step: 'arbitration',
          duration: Date.now() - startTime,
          inputs: { conflicts: conflicts.map(c => c.type) },
          outputs: { 
            winner: arbitrationResult.winner?.id,
            resolvedConflicts: arbitrationResult.resolvedConflicts.length,
          },
          moduleVersion: this.arbitrator.getVersion(),
        });

        this.events.emitDecisionEvent('decision-arbitration-completed', decisionId, {
          strategy: arbitrationResult.strategy,
        });
      }

      // Step 4: Select winner
      audit = this.auditor.addStep(audit, {
        step: 'selection',
        duration: 0,
        inputs: { rankedOptions: rankingResult.rankedOptions.map(o => o.id) },
        outputs: {},
        moduleVersion: this.selector.getVersion(),
      });

      this.events.emitDecisionEvent('decision-selection-started', decisionId, {});

      const selectionResult = await this.select(
        rankingResult.rankedOptions,
        input.context,
        input.config?.selection
      );

      audit = this.auditor.addStep(audit, {
        step: 'selection',
        duration: Date.now() - startTime,
        inputs: { rankedOptions: rankingResult.rankedOptions.map(o => o.id) },
        outputs: { 
          winners: selectionResult.winners.map(w => w.id),
          success: selectionResult.success,
        },
        moduleVersion: this.selector.getVersion(),
      });

      this.events.emitDecisionEvent('decision-selection-completed', decisionId, {
        winnerCount: selectionResult.winners.length,
        success: selectionResult.success,
      });

      // Step 5: Generate explanation
      audit = this.auditor.addStep(audit, {
        step: 'explanation',
        duration: 0,
        inputs: { winner: selectionResult.winners[0]?.id },
        outputs: {},
        moduleVersion: this.explainer.getVersion(),
      });

      const winner = selectionResult.winners[0];
      let explanation: DecisionExplanation;

      if (winner) {
        explanation = await this.explain(
          decisionId,
          rankingResult.rankedOptions,
          winner,
          input.context,
          input.config?.explanation
        );
      } else {
        explanation = {
          summary: 'No winner could be selected.',
          details: 'The decision authority could not select a winner based on the provided options and constraints.',
          keyFactors: [],
          winnerRationale: 'No winner selected.',
          confidenceExplanation: 'N/A',
          level: input.config?.explanation?.level ?? 'standard',
        };
      }

      audit = this.auditor.addStep(audit, {
        step: 'explanation',
        duration: Date.now() - startTime,
        inputs: { winner: winner?.id },
        outputs: { explanationLevel: explanation.level },
        moduleVersion: this.explainer.getVersion(),
      });

      this.events.emitDecisionEvent('decision-explanation-generated', decisionId, {
        level: explanation.level,
      });

      // Finalize audit
      audit = this.auditor.finalize(audit);

      // Calculate confidence
      const confidence = winner?.metadata?.sourceConfidence ?? 0.5;

      // Build output
      const output: DecisionOutput<T> = {
        decisionId,
        type: input.type,
        status: selectionResult.success ? 'completed' : 'rejected',
        winner: winner as DecisionOption<T> | undefined,
        rankedOptions: rankingResult.rankedOptions,
        comparisons: comparisonResults,
        arbitration: arbitrationResult,
        confidence,
        explanation,
        audit,
        timestamp: new Date(),
      };

      // Store in history
      await this.history.store(output);

      // Update metrics
      this.updateMetrics(input.type, selectionResult.success, Date.now() - startTime, confidence);

      // Emit completion event
      emitDecisionLifecycleEvents(this.events, decisionId, output);

      return output;

    } catch (error) {
      this.events.emitDecisionEvent('decision-error', decisionId, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Rank options.
   */
  async rank<T = unknown>(
    options: ReadonlyArray<DecisionOption<T>>,
    context: DecisionContext,
    config?: Partial<RankingConfig>
  ): Promise<RankingResult<T>> {
    const fullConfig = { ...this.config.ranking, ...config };
    return this.ranker.rank(options, context, fullConfig);
  }

  /**
   * Compare two options.
   */
  async compare<T = unknown>(
    optionA: DecisionOption<T>,
    optionB: DecisionOption<T>,
    context: DecisionContext,
    config?: Partial<ComparisonConfig>
  ): Promise<DecisionComparisonResult> {
    const fullConfig = { ...this.config.comparison, ...config };
    return this.comparator.compare(optionA, optionB, context, fullConfig);
  }

  /**
   * Compare all options (tournament).
   */
  async compareAll<T = unknown>(
    options: ReadonlyArray<DecisionOption<T>>,
    context: DecisionContext
  ): Promise<ReadonlyArray<DecisionComparisonResult>> {
    const result = await this.comparator.compareTournament(options, context);
    return result.comparisons;
  }

  /**
   * Arbitrate conflicts.
   */
  async arbitrate<T = unknown>(
    options: ReadonlyArray<DecisionOption<T>>,
    conflicts: ReadonlyArray<Conflict>,
    context: DecisionContext,
    config?: Partial<ArbitrationConfig>
  ): Promise<ArbitrationResult<T>> {
    const fullConfig = { ...this.config.arbitration, ...config };
    return this.arbitrator.arbitrate(options, conflicts, context, fullConfig);
  }

  /**
   * Select winner(s).
   */
  async select<T = unknown>(
    rankedOptions: ReadonlyArray<RankedDecisionOption<T>>,
    context: DecisionContext,
    config?: Partial<SelectionConfig>
  ): Promise<SelectionResult<T>> {
    const fullConfig = { ...this.config.selection, ...config };
    return this.selector.select(rankedOptions, context, fullConfig);
  }

  /**
   * Explain a decision.
   */
  async explain<T = unknown>(
    decisionId: DecisionId | 'hypothetical',
    options: ReadonlyArray<RankedDecisionOption<T>>,
    winner: DecisionOption<T>,
    context: DecisionContext,
    config?: Partial<ExplanationConfig>
  ): Promise<DecisionExplanation> {
    const fullConfig = { ...this.config.explanation, ...config };
    
    // Get comparisons and arbitration if available
    let comparisons: DecisionComparisonResult[] = [];
    let arbitration: ArbitrationResult<T> | undefined;

    if (decisionId !== 'hypothetical') {
      const decision = await this.history.retrieve(decisionId);
      if (decision) {
        comparisons = decision.comparisons as DecisionComparisonResult[] ?? [];
        arbitration = decision.arbitration as ArbitrationResult<T> | undefined;
      }
    }

    return this.explainer.explain(options, winner, context, comparisons, arbitration, fullConfig);
  }

  /**
   * Reconsider a decision.
   */
  async reconsider<T = unknown>(
    decisionId: DecisionId,
    newContext: DecisionContext,
    newOptions?: ReadonlyArray<DecisionOption<T>>
  ): Promise<DecisionOutput<T>> {
    const original = await this.history.retrieve(decisionId);
    if (!original) {
      throw new DecisionError('invalid-input', `Decision ${decisionId} not found`, decisionId);
    }

    // Create new input with updated context
    const input: DecisionInput<T> = {
      type: original.type,
      context: newContext,
      options: newOptions ?? original.rankedOptions as unknown as ReadonlyArray<DecisionOption<T>>,
    };

    return this.decide(input);
  }

  /**
   * Appeal a decision.
   */
  async appeal(
    decisionId: DecisionId,
    reason: string,
    requestedBy: string
  ): Promise<{ success: boolean; appealId: string; status: 'pending-review' }> {
    this.events.emitDecisionEvent('decision-appealed', decisionId, {
      reason,
      requestedBy,
    });

    return {
      success: true,
      appealId: `appeal-${Date.now()}`,
      status: 'pending-review',
    };
  }

  /**
   * Get decision by ID.
   */
  async getDecision<T = unknown>(decisionId: DecisionId): Promise<DecisionOutput<T> | undefined> {
    return this.history.retrieve(decisionId);
  }

  /**
   * Get decision history for a student.
   */
  async getDecisionHistory(
    studentId: string,
    options?: {
      limit?: number;
      offset?: number;
      types?: string[];
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<ReadonlyArray<DecisionOutput>> {
    return this.history.getStudentHistory(studentId, options);
  }

  /**
   * Subscribe to events.
   */
  on(
    eventType: DecisionEventType | 'all',
    handler: (event: DecisionEvent) => void | Promise<void>
  ): () => void {
    return this.events.on(eventType, handler);
  }

  /**
   * Get configuration.
   */
  getConfig(): DecisionConfig {
    return { ...this.config };
  }

  /**
   * Update configuration.
   */
  updateConfig(config: Partial<DecisionConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get metrics.
   */
  async getMetrics(): Promise<DecisionMetrics> {
    return { ...this.metrics };
  }

  /**
   * Reset metrics.
   */
  resetMetrics(): void {
    this.metrics = {
      totalDecisions: 0,
      decisionsByType: {},
      decisionsByStatus: {},
      avgProcessingTime: 0,
      avgConfidence: 0.5,
      errorRate: 0,
      appealsRate: 0,
    };
  }

  /**
   * Health check.
   */
  async healthCheck(): Promise<boolean> {
    return (
      this.ranker !== undefined &&
      this.comparator !== undefined &&
      this.arbitrator !== undefined &&
      this.selector !== undefined &&
      this.explainer !== undefined
    );
  }

  /**
   * Dispose resources.
   */
  async dispose(): Promise<void> {
    this.events.clear();
  }

  // ============================================================================
  // WAVE 2.3 - META-DECISION AUTHORITY METHODS
  // ============================================================================

  /**
   * Perform meta-decision analysis.
   * 
   * Analyzes the quality of a decision itself.
   */
  async analyzeMetaDecision(input: MetaDecisionInput): Promise<MetaDecisionAnalysis> {
    const startTime = Date.now();
    
    // Emit event
    this.events.emitDecisionEvent('meta-decision-analysis-started', input.decisionId, {
      studentId: input.studentId,
    });

    try {
      const result = await this.metaDecisionAuthority.analyze(input);
      
      // Emit completion event
      this.events.emitDecisionEvent('meta-decision-analysis-completed', input.decisionId, {
        duration: Date.now() - startTime,
        recommendation: result.recommendedAction.action,
        overallConfidence: result.overallConfidence,
      });

      return result;
    } catch (error) {
      this.events.emitDecisionEvent('meta-decision-analysis-failed', input.decisionId, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Analyze decision readiness only.
   */
  async analyzeDecisionReadiness(input: MetaDecisionInput): Promise<DecisionReadinessAnalysis> {
    return this.metaDecisionAuthority.analyzeReadiness(input);
  }

  /**
   * Analyze decision quality only.
   */
  async analyzeDecisionQuality(input: MetaDecisionInput): Promise<DecisionQualityAnalysis> {
    return this.metaDecisionAuthority.analyzeQuality(input);
  }

  /**
   * Analyze decision timing only.
   */
  async analyzeDecisionTiming(
    input: MetaDecisionInput,
    readinessState: DecisionState,
    quality: number
  ): Promise<DecisionTimingAnalysis> {
    return this.metaDecisionAuthority.analyzeTiming(input, readinessState, quality);
  }

  /**
   * Check if student should decide now.
   */
  shouldDecideNow(analysis: MetaDecisionAnalysis): boolean {
    return this.metaDecisionAuthority.shouldDecideNow(analysis);
  }

  /**
   * Check if student should delay decision.
   */
  shouldDelayDecision(analysis: MetaDecisionAnalysis): boolean {
    return this.metaDecisionAuthority.shouldDelay(analysis);
  }

  // ============================================================================
  // WAVE 2.4 - COALITION AUTHORITY METHODS
  // ============================================================================

  /**
   * Evaluate all coalition members for a path.
   *
   * This method evaluates how each of the 7 coalition members (stakeholders)
   * views a given career path.
   */
  evaluateCoalitionMembers(input: CoalitionEvaluationInput): Map<CoalitionMember, CoalitionMemberEvaluation> {
    this.events.emitDecisionEvent('coalition-evaluation-started', input.path.id, {
      pathName: input.path.name,
    });

    try {
      const result = this.coalitionModule.evaluateMembers(input);

      this.events.emitDecisionEvent('coalition-evaluation-completed', input.path.id, {
        memberCount: result.size,
      });

      return result;
    } catch (error) {
      this.events.emitDecisionEvent('coalition-evaluation-failed', input.path.id, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Calculate coalition aggregate scores.
   *
   * Aggregates individual member evaluations into overall coalition metrics.
   */
  calculateCoalitionAggregate(
    evaluations: Map<CoalitionMember, CoalitionMemberEvaluation>
  ): CoalitionAggregateScores {
    return this.coalitionModule.calculateAggregateScores(evaluations);
  }

  /**
   * Analyze coalition dynamics.
   *
   * Identifies supporters, opposition, and conflicts within the coalition.
   */
  analyzeCoalitionDynamics(
    evaluations: Map<CoalitionMember, CoalitionMemberEvaluation>
  ): CoalitionDynamics {
    return this.coalitionModule.analyzeDynamics(evaluations);
  }

  /**
   * Identify conflicts between coalition members.
   */
  identifyCoalitionConflicts(
    evaluations: Map<CoalitionMember, CoalitionMemberEvaluation>,
    threshold?: number
  ): MemberConflict[] {
    return this.coalitionModule.identifyConflicts(evaluations, threshold);
  }

  /**
   * Rank paths by coalition stability.
   *
   * Uses the Decision Authority's ranking system to order paths by their
   * coalition stability scores.
   */
  rankCoalitionPaths(
    pathAnalyses: Array<{
      path: PathInput;
      aggregate: CoalitionAggregateScores;
      evaluations: Map<CoalitionMember, CoalitionMemberEvaluation>;
    }>
  ): Array<{
    path: PathInput;
    aggregate: CoalitionAggregateScores;
    evaluations: Map<CoalitionMember, CoalitionMemberEvaluation>;
    rank: number;
  }> {
    // Convert to decision options for ranking
    const options: DecisionOption[] = pathAnalyses.map(analysis => ({
      id: analysis.path.id,
      type: analysis.path.type === 'primary' ? 'career' : 'pathway',
      data: analysis.path,
      source: 'coalition-analysis',
      createdAt: new Date(),
      confidence: analysis.aggregate.stabilityScore / 100,
      score: analysis.aggregate.stabilityScore,
    }));

    // Rank by stability score (using Authority ranking)
    const ranked = this.ranker.rankByScore(options, 'desc');

    // Map back to coalition analyses with ranks
    return ranked.map((result, index) => {
      const analysis = pathAnalyses.find(a => a.path.id === result.option.id)!;
      return {
        ...analysis,
        rank: index + 1,
      };
    });
  }

  /**
   * Compare two paths from coalition perspective.
   *
   * Uses the Decision Authority's comparison system.
   */
  compareCoalitionPaths(
    pathA: { path: PathInput; aggregate: CoalitionAggregateScores },
    pathB: { path: PathInput; aggregate: CoalitionAggregateScores }
  ): {
    strongerSupport: 'pathA' | 'pathB' | 'equal';
    lowerConflict: 'pathA' | 'pathB' | 'equal';
    higherStability: 'pathA' | 'pathB' | 'equal';
    comparisonText: string;
  } {
    // Use comparator for structured comparison
    const options: DecisionOption[] = [
      {
        id: pathA.path.id,
        type: 'career',
        data: pathA.path,
        source: 'coalition',
        createdAt: new Date(),
        score: pathA.aggregate.stabilityScore,
      },
      {
        id: pathB.path.id,
        type: 'career',
        data: pathB.path,
        source: 'coalition',
        createdAt: new Date(),
        score: pathB.aggregate.stabilityScore,
      },
    ];

    const comparison = this.comparator.comparePairwise(options[0], options[1], ['score']);

    return {
      strongerSupport: pathA.aggregate.coalitionSupport > pathB.aggregate.coalitionSupport
        ? 'pathA'
        : pathA.aggregate.coalitionSupport < pathB.aggregate.coalitionSupport
          ? 'pathB'
          : 'equal',
      lowerConflict: pathA.aggregate.coalitionConflict < pathB.aggregate.coalitionConflict
        ? 'pathA'
        : pathA.aggregate.coalitionConflict > pathB.aggregate.coalitionConflict
          ? 'pathB'
          : 'equal',
      higherStability: comparison.winner === options[0].id ? 'pathA' : 'pathB',
      comparisonText: this.generateCoalitionComparisonText(pathA, pathB),
    };
  }

  /**
   * Generate comparison text for coalition paths.
   */
  private generateCoalitionComparisonText(
    pathA: { path: PathInput; aggregate: CoalitionAggregateScores },
    pathB: { path: PathInput; aggregate: CoalitionAggregateScores }
  ): string {
    const parts: string[] = [];

    if (pathA.aggregate.stabilityScore > pathB.aggregate.stabilityScore) {
      parts.push(`${pathA.path.name} has stronger coalition stability (${pathA.aggregate.stabilityScore} vs ${pathB.aggregate.stabilityScore}).`);
    } else {
      parts.push(`${pathB.path.name} has stronger coalition stability (${pathB.aggregate.stabilityScore} vs ${pathA.aggregate.stabilityScore}).`);
    }

    return parts.join(' ');
  }

  /**
   * Select coalition recommendation.
   *
   * Uses the Decision Authority's selection system to choose the best path.
   */
  selectCoalitionWinner(
    rankedPaths: Array<{
      path: PathInput;
      aggregate: CoalitionAggregateScores;
      dynamics: CoalitionDynamics;
    }>
  ): {
    winner: PathInput;
    confidence: number;
    supportingMembers: CoalitionMember[];
    opposingMembers: CoalitionMember[];
  } {
    if (rankedPaths.length === 0) {
      throw new Error('No paths to select from');
    }

    // Use selector to pick top path
    const options: DecisionOption[] = rankedPaths.map(r => ({
      id: r.path.id,
      type: 'career',
      data: r.path,
      source: 'coalition',
      createdAt: new Date(),
      score: r.aggregate.stabilityScore,
      confidence: r.aggregate.stabilityScore / 100,
    }));

    const selection = this.selector.selectTop(options, { count: 1 });
    const winner = rankedPaths.find(r => r.path.id === selection.selected[0]?.id);

    if (!winner) {
      throw new Error('Winner not found in ranked paths');
    }

    return {
      winner: winner.path,
      confidence: winner.aggregate.stabilityScore / 100,
      supportingMembers: winner.dynamics.strongSupport,
      opposingMembers: winner.dynamics.opposition,
    };
  }

  /**
   * Determine coalition consensus level.
   *
   * Analyzes the coalition dynamics to determine overall consensus.
   */
  determineCoalitionConsensus(dynamics: CoalitionDynamics): {
    level: CoalitionDynamics['consensusLevel'];
    supportRatio: number;
    canProceed: boolean;
  } {
    const totalMembers = 7; // All coalition members
    const supportRatio = dynamics.strongSupport.length / totalMembers;

    let canProceed = false;
    if (dynamics.consensusLevel === 'unanimous' || dynamics.consensusLevel === 'strong') {
      canProceed = true;
    } else if (dynamics.consensusLevel === 'moderate' && dynamics.opposition.length <= 1) {
      canProceed = true;
    }

    return {
      level: dynamics.consensusLevel,
      supportRatio,
      canProceed,
    };
  }

  /**
   * Explain coalition decision.
   *
   * Generates explanation using the Explanation Authority.
   */
  explainCoalitionDecision(context: {
    selectedPath: PathInput;
    rankedPaths: Array<{ path: PathInput; aggregate: CoalitionAggregateScores }>;
    dynamics: CoalitionDynamics;
    conflicts: MemberConflict[];
  }): {
    summary: string;
    details: string;
    factors: string[];
    concerns: string[];
  } {
    const explanation = this.explainer.explain({
      type: 'coalition-recommendation',
      context: {
        description: `Coalition analysis for ${context.selectedPath.name}`,
      },
      options: context.rankedPaths.map(r => ({
        id: r.path.id,
        type: 'career',
        data: r.path,
        source: 'coalition',
        createdAt: new Date(),
        score: r.aggregate.stabilityScore,
      })),
      selection: {
        winner: {
          id: context.selectedPath.id,
          type: 'career',
          data: context.selectedPath,
          source: 'coalition',
          createdAt: new Date(),
        },
        ranking: context.rankedPaths.map((r, i) => ({
          optionId: r.path.id,
          rank: i + 1,
          score: r.aggregate.stabilityScore,
        })),
        method: 'coalition-stability',
      },
      factors: [
        `Coalition stability: ${context.rankedPaths[0]?.aggregate.stabilityScore || 0}/100`,
        `Consensus level: ${context.dynamics.consensusLevel}`,
        `Strong support: ${context.dynamics.strongSupport.length} members`,
        `Opposition: ${context.dynamics.opposition.length} members`,
        `Conflicts: ${context.conflicts.length} identified`,
      ],
    }, 'standard');

    return {
      summary: explanation.summary,
      details: explanation.details,
      factors: explanation.factors,
      concerns: context.dynamics.opposition.map(m => `${m} has reservations`),
    };
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Generate decision ID.
   */
  private generateDecisionId(): DecisionId {
    return `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update metrics.
   */
  private updateMetrics(
    type: string,
    success: boolean,
    duration: number,
    confidence: number
  ): void {
    this.metrics.totalDecisions++;
    
    // Update by type
    this.metrics.decisionsByType[type] = (this.metrics.decisionsByType[type] ?? 0) + 1;
    
    // Update by status
    const status = success ? 'completed' : 'rejected';
    this.metrics.decisionsByStatus[status] = (this.metrics.decisionsByStatus[status] ?? 0) + 1;
    
    // Update average processing time
    const totalTime = this.metrics.avgProcessingTime * (this.metrics.totalDecisions - 1) + duration;
    this.metrics.avgProcessingTime = totalTime / this.metrics.totalDecisions;
    
    // Update average confidence
    const totalConfidence = this.metrics.avgConfidence * (this.metrics.totalDecisions - 1) + confidence;
    this.metrics.avgConfidence = totalConfidence / this.metrics.totalDecisions;
  }
}

/**
 * Factory function for creating a Decision Authority.
 */
export function createDecisionAuthority(
  config?: Partial<DecisionConfig>,
  modules?: {
    ranker?: IDecisionRanker;
    comparator?: IDecisionComparator;
    arbitrator?: IDecisionArbitrator;
    selector?: IDecisionSelector;
    explainer?: IDecisionExplainer;
    history?: IDecisionHistory;
    events?: IDecisionEvents;
    auditor?: IDecisionAudit;
    metaDecisionAuthority?: IMetaDecisionAuthority;
    coalitionModule?: ICoalitionModule;
  }
): IDecisionAuthority {
  const fullConfig = config ? { ...DEFAULT_DECISION_CONFIG, ...config } : DEFAULT_DECISION_CONFIG;
  return new DecisionAuthority(fullConfig, modules);
}

// Default instance
export const defaultDecisionAuthority = createDecisionAuthority();

// Export types
export type { IDecisionAuthority };
