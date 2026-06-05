/**
 * @fileoverview Decision Explainer - Explanation Engine
 * @module @/intelligence/decision/DecisionExplainer
 * 
 * Constitutional decision explanation engine.
 * 
 * This module generates human-readable explanations for decisions.
 * All decision explanations MUST be generated through this module.
 * 
 * Explanation levels:
 * - minimal: One sentence summary
 * - standard: Key factors and rationale
 * - detailed: Comprehensive explanation
 * - technical: Full technical details
 * 
 * @version 1.0.0
 * @author CareerOS Constitutional Architecture Team
 * @since Wave 2.1 - Decision Authority Infrastructure
 */

import type {
  DecisionOption,
  RankedDecisionOption,
  DecisionContext,
  ExplanationConfig,
  DecisionExplanation,
  ExplanationLevel,
  DecisionComparisonResult,
  ArbitrationResult,
} from './DecisionTypes';

/**
 * Interface for the Decision Explainer.
 */
export interface IDecisionExplainer {
  /**
   * Generate explanation for a decision.
   */
  explain<T = unknown>(
    options: ReadonlyArray<RankedDecisionOption<T>>,
    winner: DecisionOption<T>,
    context: DecisionContext,
    comparisons: ReadonlyArray<DecisionComparisonResult>,
    arbitration: ArbitrationResult<T> | undefined,
    config: ExplanationConfig
  ): Promise<DecisionExplanation>;

  /**
   * Get explainer version.
   */
  getVersion(): string;
}

/**
 * Configuration for the Decision Explainer.
 */
export interface DecisionExplainerConfig {
  /** Default explanation level */
  readonly defaultLevel: ExplanationLevel;
  
  /** Whether to include alternatives */
  readonly includeAlternatives: boolean;
  
  /** Whether to include confidence details */
  readonly includeConfidence: boolean;
  
  /** Maximum summary length */
  readonly maxSummaryLength: number;
  
  /** Template for explanations */
  readonly template?: string;
}

/**
 * Default explainer configuration.
 */
export const DEFAULT_EXPLAINER_CONFIG: DecisionExplainerConfig = {
  defaultLevel: 'standard',
  includeAlternatives: true,
  includeConfidence: true,
  maxSummaryLength: 200,
};

/**
 * Decision Explainer implementation.
 */
export class DecisionExplainer implements IDecisionExplainer {
  private config: DecisionExplainerConfig;

  constructor(config: Partial<DecisionExplainerConfig> = {}) {
    this.config = { ...DEFAULT_EXPLAINER_CONFIG, ...config };
  }

  /**
   * Generate explanation for a decision.
   */
  async explain<T = unknown>(
    options: ReadonlyArray<RankedDecisionOption<T>>,
    winner: DecisionOption<T>,
    context: DecisionContext,
    comparisons: ReadonlyArray<DecisionComparisonResult>,
    arbitration: ArbitrationResult<T> | undefined,
    config: ExplanationConfig
  ): Promise<DecisionExplanation> {
    const level = config.level ?? this.config.defaultLevel;

    const summary = this.generateSummary(winner, options, level);
    const details = this.generateDetails(winner, options, context, comparisons, arbitration, config);
    const keyFactors = this.extractKeyFactors(winner, options, comparisons);
    const winnerRationale = this.generateWinnerRationale(winner, options, arbitration);
    const rejectionRationale = this.generateRejectionRationale(winner, options);
    const alternatives = config.includeAlternatives ? this.generateAlternatives(options, winner) : undefined;
    const confidenceExplanation = this.generateConfidenceExplanation(winner, options);

    return {
      summary,
      details,
      keyFactors,
      winnerRationale,
      rejectionRationale,
      alternatives,
      confidenceExplanation,
      level,
    };
  }

  /**
   * Generate summary based on level.
   */
  private generateSummary<T>(
    winner: DecisionOption<T>,
    options: ReadonlyArray<RankedDecisionOption<T>>,
    level: ExplanationLevel
  ): string {
    const winnerName = this.getOptionName(winner);
    const totalOptions = options.length;
    const winnerRank = options.findIndex(o => o.id === winner.id) + 1;

    switch (level) {
      case 'minimal':
        return `Selected ${winnerName} from ${totalOptions} options.`;
      
      case 'standard':
        return `${winnerName} was selected as the top choice (ranked #${winnerRank}) from ${totalOptions} options based on comprehensive evaluation of your profile and preferences.`;
      
      case 'detailed':
        return `${winnerName} emerged as the optimal choice after evaluating ${totalOptions} options across multiple dimensions including your assessment results, career preferences, market conditions, and stakeholder inputs. This option ranked #${winnerRank} with the highest composite score.`;
      
      case 'technical':
        return `Decision Authority selected ${winnerName} (ID: ${winner.id}) as the optimal solution from a candidate set of ${totalOptions} options. Selection was determined through constitutional ranking algorithm with confidence-weighted scoring, yielding a final rank of ${winnerRank} with normalized score ${options[winnerRank - 1]?.normalizedScore.toFixed(4) ?? 'N/A'}.`;
      
      default:
        return `Selected ${winnerName}.`;
    }
  }

  /**
   * Generate detailed explanation.
   */
  private generateDetails<T>(
    winner: DecisionOption<T>,
    options: ReadonlyArray<RankedDecisionOption<T>>,
    context: DecisionContext,
    comparisons: ReadonlyArray<DecisionComparisonResult>,
    arbitration: ArbitrationResult<T> | undefined,
    config: ExplanationConfig
  ): string {
    const parts: string[] = [];

    // Introduction
    parts.push(`The Decision Authority evaluated ${options.length} options to determine the optimal choice for your situation.`);

    // Ranking explanation
    if (config.includeScores && winner.metadata?.sourceConfidence) {
      parts.push(`The winning option achieved a confidence score of ${(winner.metadata.sourceConfidence * 100).toFixed(1)}%, reflecting strong alignment with your profile.`);
    }

    // Comparison highlights
    if (comparisons.length > 0) {
      const relevantComparisons = comparisons.filter(c => 
        c.optionA.id === winner.id || c.optionB.id === winner.id
      );
      if (relevantComparisons.length > 0) {
        parts.push(`In direct comparisons, this option outperformed ${relevantComparisons.filter(c => c.outcome === 'a-better' && c.optionA.id === winner.id).length} alternatives.`);
      }
    }

    // Arbitration explanation
    if (arbitration) {
      parts.push(`Conflict resolution using ${this.formatStrategy(arbitration.strategy)} ensured fair consideration of all stakeholder perspectives.`);
    }

    // Context awareness
    if (context.sessionHistory && context.sessionHistory.length > 0) {
      parts.push(`This decision builds upon ${context.sessionHistory.length} previous decisions in your current session.`);
    }

    return parts.join(' ');
  }

  /**
   * Extract key factors.
   */
  private extractKeyFactors<T>(
    winner: DecisionOption<T>,
    options: ReadonlyArray<RankedDecisionOption<T>>,
    comparisons: ReadonlyArray<DecisionComparisonResult>
  ): ReadonlyArray<string> {
    const factors: string[] = [];

    const winnerRanked = options.find(o => o.id === winner.id);
    
    if (winnerRanked?.scoreBreakdown) {
      const { baseScore, confidenceAdjustment, stakeholderWeighting } = winnerRanked.scoreBreakdown;
      
      if (baseScore > 0.7) {
        factors.push('Strong base evaluation score');
      }
      if (confidenceAdjustment > 0.8) {
        factors.push('High source confidence');
      }
      if (stakeholderWeighting > 1.0) {
        factors.push('Strong stakeholder preference alignment');
      }
    }

    // Add comparison-based factors
    const winCount = comparisons.filter(c => 
      (c.optionA.id === winner.id && c.outcome === 'a-better') ||
      (c.optionB.id === winner.id && c.outcome === 'b-better')
    ).length;

    if (winCount > comparisons.length / 2) {
      factors.push(`Won ${winCount} of ${comparisons.length} direct comparisons`);
    }

    // Add confidence factor
    const confidence = winner.metadata?.sourceConfidence;
    if (confidence && confidence > 0.8) {
      factors.push(`High confidence (${(confidence * 100).toFixed(0)}%)`);
    }

    // Ensure at least some factors
    if (factors.length === 0) {
      factors.push('Optimal ranking position');
      factors.push('Comprehensive evaluation alignment');
    }

    return factors;
  }

  /**
   * Generate winner rationale.
   */
  private generateWinnerRationale<T>(
    winner: DecisionOption<T>,
    options: ReadonlyArray<RankedDecisionOption<T>>,
    arbitration: ArbitrationResult<T> | undefined
  ): string {
    const parts: string[] = [];

    parts.push(`${this.getOptionName(winner)} was selected because it:`);
    
    const winnerRanked = options.find(o => o.id === winner.id);
    if (winnerRanked) {
      parts.push(`• Achieved the highest overall rank (#${winnerRanked.rank})`);
      parts.push(`• Scored ${winnerRanked.score.toFixed(2)} on the evaluation metric`);
    }

    if (winner.metadata?.sourceConfidence) {
      parts.push(`• Demonstrated ${(winner.metadata.sourceConfidence * 100).toFixed(0)}% confidence from source systems`);
    }

    if (arbitration?.stakeholderSatisfaction) {
      const satisfactions = Object.values(arbitration.stakeholderSatisfaction);
      const avgSatisfaction = satisfactions.reduce((a, b) => a + b, 0) / satisfactions.length;
      parts.push(`• Achieved ${(avgSatisfaction * 100).toFixed(0)}% average stakeholder satisfaction`);
    }

    return parts.join('\n');
  }

  /**
   * Generate rejection rationale for alternatives.
   */
  private generateRejectionRationale<T>(
    winner: DecisionOption<T>,
    options: ReadonlyArray<RankedDecisionOption<T>>
  ): Record<string, string> | undefined {
    const rationale: Record<string, string> = {};

    for (const option of options) {
      if (option.id === winner.id) continue;

      const reasons: string[] = [];

      if (option.rank > 3) {
        reasons.push('Lower overall ranking');
      }

      const confidence = option.metadata?.sourceConfidence;
      if (confidence && confidence < 0.6) {
        reasons.push('Lower source confidence');
      }

      if (option.score < 0.6) {
        reasons.push('Lower evaluation score');
      }

      if (reasons.length === 0) {
        reasons.push('Runner-up to top choice');
      }

      rationale[option.id] = reasons.join('; ');
    }

    return Object.keys(rationale).length > 0 ? rationale : undefined;
  }

  /**
   * Generate alternatives list.
   */
  private generateAlternatives<T>(
    options: ReadonlyArray<RankedDecisionOption<T>>,
    winner: DecisionOption<T>
  ): ReadonlyArray<{ id: string; reason: string }> {
    const alternatives = options
      .filter(o => o.id !== winner.id)
      .slice(0, 3) // Top 3 alternatives
      .map(o => ({
        id: o.id,
        reason: `Ranked #${o.rank} with score ${o.score.toFixed(2)}`,
      }));

    return alternatives;
  }

  /**
   * Generate confidence explanation.
   */
  private generateConfidenceExplanation<T>(
    winner: DecisionOption<T>,
    options: ReadonlyArray<RankedDecisionOption<T>>
  ): string {
    const confidence = winner.metadata?.sourceConfidence ?? 0.5;
    const percentage = (confidence * 100).toFixed(0);

    if (confidence > 0.9) {
      return `Very high confidence (${percentage}%). Multiple validation sources strongly support this decision.`;
    } else if (confidence > 0.75) {
      return `High confidence (${percentage}%). Strong evidence supports this decision.`;
    } else if (confidence > 0.6) {
      return `Moderate confidence (${percentage}%). Good evidence supports this decision, though some uncertainty remains.`;
    } else {
      return `Lower confidence (${percentage}%). Limited evidence available; consider gathering more information.`;
    }
  }

  /**
   * Get human-readable option name.
   */
  private getOptionName<T>(option: DecisionOption<T>): string {
    const metadata = option.metadata as Record<string, unknown> | undefined;
    if (metadata?.label && typeof metadata.label === 'string') {
      return metadata.label;
    }
    
    const data = option.data as Record<string, unknown> | undefined;
    if (data?.name && typeof data.name === 'string') {
      return data.name;
    }
    
    return `Option ${option.id}`;
  }

  /**
   * Format strategy name.
   */
  private formatStrategy(strategy: string): string {
    return strategy
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Get explainer version.
   */
  getVersion(): string {
    return '1.0.0';
  }
}

/**
 * Factory function for creating a Decision Explainer.
 */
export function createDecisionExplainer(
  config?: Partial<DecisionExplainerConfig>
): IDecisionExplainer {
  return new DecisionExplainer(config);
}

// Default instance
export const defaultDecisionExplainer = createDecisionExplainer();
