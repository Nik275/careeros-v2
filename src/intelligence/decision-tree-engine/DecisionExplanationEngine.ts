/**
 * CareerOS Decision Tree Engine - Decision Explanation Engine
 *
 * Generates explanations for decision tree recommendations.
 */

import type {
  DecisionTreeAnalysis,
  DecisionPathEvaluation,
  DecisionBranchAnalysis,
  CriticalDecisionPoint,
  DecisionTreeExplanation,
  DecisionTreeEngineConfig,
} from './types';

/**
 * Generates explanations for decision tree analysis.
 */
export class DecisionExplanationEngine {
  private config: DecisionTreeEngineConfig;

  constructor(config: DecisionTreeEngineConfig) {
    this.config = config;
  }

  /**
   * Main entry point: generate complete explanation.
   */
  explain(analysis: DecisionTreeAnalysis): DecisionTreeExplanation {
    const summary = this.generateSummary(analysis);
    const detailedExplanation = this.generateDetailedExplanation(analysis);
    const recommendationReasoning = this.generateRecommendationReasoning(analysis);
    const comparisons = this.generateComparisons(analysis);
    const criticalPointsExplanation = this.generateCriticalPointsExplanation(analysis);
    const branchExplanations = this.generateBranchExplanations(analysis);

    return {
      summary,
      detailedExplanation,
      recommendationReasoning,
      comparisons,
      criticalPointsExplanation,
      branchExplanations,
      confidence: this.calculateConfidence(analysis),
    };
  }

  /**
   * Generate one-line summary.
   */
  private generateSummary(analysis: DecisionTreeAnalysis): string {
    const bestPath = analysis.bestPath;
    const pathType = bestPath.pathType;

    if (pathType === 'optimal') {
      return `The optimal career path maintains strong utility while minimizing regret risk, with ${analysis.criticalPoints.length} critical decision points requiring careful attention.`;
    }

    if (pathType === 'conservative') {
      return `The recommended conservative path prioritizes stability and optionality preservation over maximum upside.`;
    }

    if (pathType === 'exploratory') {
      return `The exploratory path maintains maximum flexibility with ${bestPath.optionality.futureOptions} future transition options.`;
    }

    return `The recommended path offers the best balance of utility (${Math.round(
      bestPath.utility.total
    )}%), regret protection, and future flexibility.`;
  }

  /**
   * Generate detailed explanation.
   */
  private generateDetailedExplanation(analysis: DecisionTreeAnalysis): string {
    const parts: string[] = [];

    // Overall structure
    parts.push(
      `This decision tree models ${analysis.statistics.totalPaths} possible career trajectories from your starting point.`
    );

    // Best path description
    const bestPath = analysis.bestPath;
    parts.push(
      `The recommended path is characterized as "${bestPath.pathType}" with a composite score of ${Math.round(
        bestPath.compositeScore
      )}%.`
    );

    // Key metrics
    parts.push(
      `Expected utility: ${Math.round(bestPath.utility.total)}%, ` +
        `Regret risk: ${Math.round(bestPath.regret.regretRisk * 100)}%, ` +
        `Optionality preservation: ${Math.round(bestPath.optionality.preservation * 100)}%.`
    );

    // Critical points
    if (analysis.criticalPoints.length > 0) {
      parts.push(
        `There are ${analysis.criticalPoints.length} critical decision points where choices significantly impact long-term outcomes.`
      );
    }

    // Branching opportunities
    if (analysis.branchingOpportunities.length > 0) {
      parts.push(
        `${analysis.branchingOpportunities.length} branching opportunities exist to pivot to alternative paths if conditions change.`
      );
    }

    // Risk profile
    parts.push(
      `Overall risk profile: ${bestPath.risk.overall}, with market outlook classified as ${bestPath.market.outlook}.`
    );

    return parts.join(' ');
  }

  /**
   * Generate recommendation reasoning.
   */
  private generateRecommendationReasoning(analysis: DecisionTreeAnalysis): string[] {
    const reasoning: string[] = [];
    const bestPath = analysis.bestPath;

    // Utility-based reasoning
    if (bestPath.utility.total > 60) {
      reasoning.push(
        `Strong utility score of ${Math.round(bestPath.utility.total)}% indicates good alignment with your preferences.`
      );
    }

    // Regret-based reasoning
    if (bestPath.regret.expectedRegret < 30) {
      reasoning.push(
        `Low expected regret (${Math.round(
          bestPath.regret.expectedRegret
        )}%) minimizes risk of future dissatisfaction.`
      );
    }

    // Optionality-based reasoning
    if (bestPath.optionality.preservation > 0.6) {
      reasoning.push(
        `Preserves ${Math.round(
          bestPath.optionality.preservation * 100
        )}% of future options, maintaining flexibility.`
      );
    }

    // Risk-based reasoning
    if (bestPath.risk.overall === 'low' || bestPath.risk.overall === 'minimal') {
      reasoning.push(
        `Manageable risk profile (${bestPath.risk.overall}) provides confidence in outcomes.`
      );
    }

    // Market-based reasoning
    if (bestPath.market.outlook === 'positive' || bestPath.market.outlook === 'strong') {
      reasoning.push(
        `Favorable market outlook (${bestPath.market.outlook}) supports career success.`
      );
    }

    // Path-specific reasoning
    if (bestPath.pathType === 'optimal') {
      reasoning.push('This path emerged as optimal across multiple evaluation criteria.');
    }

    if (bestPath.pathType === 'conservative') {
      reasoning.push('Conservative approach prioritizes stability and predictability.');
    }

    // Critical points handling
    if (analysis.criticalPoints.length > 0) {
      reasoning.push(
        `${analysis.criticalPoints.length} critical decision points provide clear guidance for key choices.`
      );
    }

    return reasoning;
  }

  /**
   * Generate path comparisons.
   */
  private generateComparisons(
    analysis: DecisionTreeAnalysis
  ): DecisionTreeExplanation['comparisons'] {
    const comparisons: DecisionTreeExplanation['comparisons'] = [];

    // Compare best path to first alternative
    if (analysis.alternativePaths.length > 0) {
      const alternative = analysis.alternativePaths[0];
      const margin = analysis.bestPath.compositeScore - alternative.compositeScore;

      comparisons.push({
        pathName: this.formatPathName(analysis.bestPath),
        vsPathName: this.formatPathName(alternative),
        reasoning: this.generateComparisonReasoning(analysis.bestPath, alternative, margin),
      });
    }

    // Compare to risky path if exists
    const riskyPath = analysis.alternativePaths.find((p) => p.pathType === 'risky');
    if (riskyPath && riskyPath.pathId !== analysis.bestPath.pathId) {
      comparisons.push({
        pathName: this.formatPathName(analysis.bestPath),
        vsPathName: 'Risky alternative',
        reasoning: `Avoids the ${Math.round(
          riskyPath.risk.probability * 100
        )}% risk probability while maintaining ${Math.round(
          riskyPath.utility.total * 0.8
        )}% of the upside potential.`,
      });
    }

    return comparisons;
  }

  /**
   * Generate comparison reasoning.
   */
  private generateComparisonReasoning(
    best: DecisionPathEvaluation,
    alternative: DecisionPathEvaluation,
    margin: number
  ): string {
    const reasons: string[] = [];

    if (margin > 10) {
      reasons.push(`Significant advantage (${Math.round(margin)}% composite score margin)`);
    }

    if (best.utility.total > alternative.utility.total) {
      reasons.push(
        `${Math.round(best.utility.total - alternative.utility.total)}% higher utility`
      );
    }

    if (best.regret.expectedRegret < alternative.regret.expectedRegret) {
      reasons.push(
        `${Math.round(
          alternative.regret.expectedRegret - best.regret.expectedRegret
        )}% lower regret risk`
      );
    }

    if (best.optionality.preservation > alternative.optionality.preservation) {
      reasons.push('Better optionality preservation');
    }

    if (best.risk.probability < alternative.risk.probability) {
      reasons.push('Lower risk profile');
    }

    if (reasons.length === 0) {
      return 'More balanced across all evaluation criteria';
    }

    return reasons.join('; ');
  }

  /**
   * Generate critical points explanation.
   */
  private generateCriticalPointsExplanation(
    analysis: DecisionTreeAnalysis
  ): DecisionTreeExplanation['criticalPointsExplanation'] {
    return analysis.criticalPoints.map((point) => ({
      point: point.description,
      recommendation: `Choose: ${this.formatChoiceLabel(point.choices[0])}`,
      reasoning: this.generateCriticalPointReasoning(point),
    }));
  }

  /**
   * Generate reasoning for a critical point.
   */
  private generateCriticalPointReasoning(point: CriticalDecisionPoint): string {
    const reasoning: string[] = [];

    reasoning.push(`${point.impact.magnitude} impact decision with ${Math.round(
      point.impact.irreversibility * 100
    )}% irreversibility.`);

    if (point.choices.length > 1) {
      const best = point.choices[0];
      const second = point.choices[1];
      const diff = best.metrics.expectedUtility - second.metrics.expectedUtility;

      reasoning.push(
        `Recommended choice offers ${Math.round(diff)}% higher expected utility.`
      );
    }

    if (point.timing.isTimeSensitive) {
      reasoning.push(`Time-sensitive: ${point.timing.urgency} urgency.`);
    }

    return reasoning.join(' ');
  }

  /**
   * Generate branch explanations.
   */
  private generateBranchExplanations(
    analysis: DecisionTreeAnalysis
  ): DecisionTreeExplanation['branchExplanations'] {
    // Focus on recommended branches
    const recommendedBranches = analysis.branchAnalyses.filter(
      (b) => b.recommendation.isRecommended
    );

    return recommendedBranches.slice(0, 3).map((branch) => ({
      branch: this.formatBranchLabel(branch),
      attractiveness: this.describeBranchAttractiveness(branch),
      risks: this.describeBranchRisks(branch),
    }));
  }

  /**
   * Describe branch attractiveness.
   */
  private describeBranchAttractiveness(branch: DecisionBranchAnalysis): string {
    const parts: string[] = [];

    if (branch.upsideAnalysis.level === 'high' || branch.upsideAnalysis.level === 'exceptional') {
      parts.push(`${branch.upsideAnalysis.level} upside potential`);
    }

    if (
      branch.optionalityAnalysis.level === 'flexible' ||
      branch.optionalityAnalysis.level === 'expansive'
    ) {
      parts.push('preserves flexibility');
    }

    if (branch.upsideAnalysis.upsideFactors.length > 0) {
      parts.push(`driven by ${branch.upsideAnalysis.upsideFactors[0].toLowerCase()}`);
    }

    if (parts.length === 0) {
      return 'Balanced risk-reward profile';
    }

    return parts.join(', ');
  }

  /**
   * Describe branch risks.
   */
  private describeBranchRisks(branch: DecisionBranchAnalysis): string {
    if (branch.riskAnalysis.level === 'minimal' || branch.riskAnalysis.level === 'low') {
      return 'Minimal risk with manageable downside';
    }

    if (branch.riskAnalysis.level === 'high' || branch.riskAnalysis.level === 'severe') {
      return `Elevated risk (${branch.riskAnalysis.level}) with ${Math.round(
        branch.riskAnalysis.potentialLoss
      )}% potential downside`;
    }

    return 'Moderate risk requiring monitoring';
  }

  /**
   * Calculate confidence in explanation.
   */
  private calculateConfidence(analysis: DecisionTreeAnalysis): number {
    // Base confidence on data quality
    const dataQualityScore = Math.min(analysis.statistics.totalPaths / 10, 1);

    // Confidence from best path margin
    let marginScore = 0.5;
    if (analysis.alternativePaths.length > 0) {
      const margin =
        analysis.bestPath.compositeScore - analysis.alternativePaths[0].compositeScore;
      marginScore = Math.min(margin / 20, 1);
    }

    // Confidence from critical points clarity
    const criticalPointsScore = Math.min(analysis.criticalPoints.length / 3, 1);

    return dataQualityScore * 0.3 + marginScore * 0.4 + criticalPointsScore * 0.3;
  }

  /**
   * Format path name.
   */
  private formatPathName(path: DecisionPathEvaluation): string {
    const typeLabels: Record<string, string> = {
      optimal: 'Optimal Path',
      alternative: 'Alternative Path',
      risky: 'High-Risk Path',
      conservative: 'Conservative Path',
      exploratory: 'Exploratory Path',
    };

    return typeLabels[path.pathType] || path.pathType;
  }

  /**
   * Format choice label.
   */
  private formatChoiceLabel(choice: CriticalDecisionPoint['choices'][0]): string {
    return choice.label.length > 40 ? choice.label.substring(0, 40) + '...' : choice.label;
  }

  /**
   * Format branch label.
   */
  private formatBranchLabel(branch: DecisionBranchAnalysis): string {
    return `Branch from ${branch.sourceNodeId}`;
  }
}

/**
 * Factory function for DecisionExplanationEngine.
 */
export function createDecisionExplanationEngine(
  config: DecisionTreeEngineConfig
): DecisionExplanationEngine {
  return new DecisionExplanationEngine(config);
}
