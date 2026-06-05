/**
 * CareerOS Decision Tree Engine
 *
 * Models career decisions as sequential decision trees.
 *
 * Inputs:
 * - Career Paths
 * - Future Simulations
 * - Transition Graph
 *
 * Output:
 * - DecisionTreeAnalysis
 *
 * Requirements:
 * - Deterministic
 * - Explainable
 * - Compatible with Path Explorer, Future Simulation, Utility Engine, Decision Intelligence
 */

import type {
  DecisionTreeInput,
  DecisionTreeAnalysis,
  DecisionTreeEngineConfig,
  DEFAULT_DECISION_TREE_CONFIG,
} from './types';

import { DecisionTreeGenerator, createDecisionTreeGenerator } from './DecisionTreeGenerator';
import { DecisionPathEvaluator, createDecisionPathEvaluator } from './DecisionPathEvaluator';
import { DecisionBranchAnalyzer, createDecisionBranchAnalyzer } from './DecisionBranchAnalyzer';
import { DecisionExplanationEngine, createDecisionExplanationEngine } from './DecisionExplanationEngine';

/**
 * Main Decision Tree Engine.
 *
 * Orchestrates tree generation, path evaluation,
 * branch analysis, and explanation generation.
 */
export class DecisionTreeEngine {
  private config: DecisionTreeEngineConfig;
  private generator: DecisionTreeGenerator;
  private evaluator: DecisionPathEvaluator;
  private branchAnalyzer: DecisionBranchAnalyzer;
  private explanationEngine: DecisionExplanationEngine;

  constructor(config: Partial<DecisionTreeEngineConfig> = {}) {
    this.config = { ...DEFAULT_DECISION_TREE_CONFIG, ...config };

    this.generator = createDecisionTreeGenerator(this.config);
    this.evaluator = createDecisionPathEvaluator(this.config);
    this.branchAnalyzer = createDecisionBranchAnalyzer(this.config);
    this.explanationEngine = createDecisionExplanationEngine(this.config);
  }

  /**
   * Analyze and generate decision tree analysis.
   *
   * @param input - All inputs for decision tree analysis
   * @returns Complete Decision Tree Analysis
   */
  analyze(input: DecisionTreeInput): DecisionTreeAnalysis {
    const {
      studentId,
      startingCareerId,
      startingCareerName,
      careerPaths,
      futureScenarios,
      optimalDecision,
    } = input;

    // Step 1: Generate decision tree
    const generationResult = this.generator.generate(
      startingCareerId,
      startingCareerName || 'Starting Career',
      careerPaths,
      futureScenarios
    );

    // Step 2: Evaluate all paths
    const pathEvaluations = this.evaluator.evaluate(
      generationResult.tree,
      optimalDecision
    );

    // Step 3: Analyze branches
    const {
      branchAnalyses,
      criticalPoints,
      branchingOpportunities,
    } = this.branchAnalyzer.analyze(generationResult.tree, pathEvaluations);

    // Step 4: Identify best path
    const bestPath = pathEvaluations[0];

    // Step 5: Identify alternative paths
    const alternativePaths = pathEvaluations.slice(1, this.config.alternativePathCount + 1);

    // Step 6: Generate path comparisons
    const pathComparisons = this.generatePathComparisons(pathEvaluations);

    // Step 7: Generate explanation
    const analysis: DecisionTreeAnalysis = {
      id: generationResult.tree.id,
      timestamp: Date.now(),
      studentId,
      tree: generationResult.tree,
      bestPath,
      alternativePaths,
      criticalPoints,
      branchingOpportunities,
      branchAnalyses,
      pathComparisons,
      explanation: {
        summary: '',
        recommendedPath: bestPath.pathId,
        keyInsights: [],
        warnings: [],
      },
      statistics: {
        totalPaths: pathEvaluations.length,
        terminalNodes: generationResult.terminalNodes.length,
        criticalPointsCount: criticalPoints.length,
        branchingOpportunitiesCount: branchingOpportunities.length,
        averagePathUtility: this.calculateAverageUtility(pathEvaluations),
        utilityVariance: this.calculateUtilityVariance(pathEvaluations),
      },
    };

    // Generate full explanation
    const explanation = this.explanationEngine.explain(analysis);
    analysis.explanation = {
      summary: explanation.summary,
      recommendedPath: bestPath.pathId,
      keyInsights: explanation.recommendationReasoning,
      warnings: this.generateWarnings(pathEvaluations, criticalPoints),
    };

    return analysis;
  }

  /**
   * Quick analysis with minimal inputs.
   */
  quickAnalyze(
    studentId: string,
    startingCareerId: string,
    careerPaths: DecisionTreeInput['careerPaths'],
    optimalDecision: DecisionTreeInput['optimalDecision']
  ): DecisionTreeAnalysis {
    return this.analyze({
      studentId,
      startingCareerId,
      startingCareerName: 'Career Start',
      careerPaths,
      futureScenarios: [],
      optimalDecision,
      utilityProfile: { weights: {} },
    });
  }

  /**
   * Get top recommendations only.
   */
  getTopRecommendations(
    input: DecisionTreeInput,
    count: number = 3
  ): {
    bestPath: DecisionTreeAnalysis['bestPath'];
    alternatives: DecisionTreeAnalysis['alternativePaths'];
    criticalPoints: DecisionTreeAnalysis['criticalPoints'];
  } {
    const analysis = this.analyze(input);

    return {
      bestPath: analysis.bestPath,
      alternatives: analysis.alternativePaths.slice(0, count),
      criticalPoints: analysis.criticalPoints.slice(0, count),
    };
  }

  /**
   * Generate path comparisons.
   */
  private generatePathComparisons(
    pathEvaluations: ReturnType<DecisionPathEvaluator['evaluate']>
  ): DecisionTreeAnalysis['pathComparisons'] {
    const comparisons: DecisionTreeAnalysis['pathComparisons'] = [];

    // Compare best path to alternatives
    const bestPath = pathEvaluations[0];

    for (let i = 1; i < Math.min(pathEvaluations.length, 4); i++) {
      const alternative = pathEvaluations[i];
      const margin = bestPath.compositeScore - alternative.compositeScore;

      // Determine winner
      let winner: string | 'tie' = bestPath.pathId;
      if (margin < 5) {
        winner = 'tie';
      }

      // Key differences
      const differences: string[] = [];

      if (Math.abs(bestPath.utility.total - alternative.utility.total) > 10) {
        differences.push(
          bestPath.utility.total > alternative.utility.total
            ? 'Higher utility'
            : 'Lower utility'
        );
      }

      if (Math.abs(bestPath.risk.probability - alternative.risk.probability) > 0.15) {
        differences.push(
          bestPath.risk.probability < alternative.risk.probability
            ? 'Lower risk'
            : 'Higher risk'
        );
      }

      if (Math.abs(bestPath.optionality.preservation - alternative.optionality.preservation) > 0.2) {
        differences.push(
          bestPath.optionality.preservation > alternative.optionality.preservation
            ? 'Better optionality'
            : 'Reduced optionality'
        );
      }

      comparisons.push({
        pathA: bestPath.pathId,
        pathB: alternative.pathId,
        winner,
        margin,
        keyDifferences: differences,
      });
    }

    return comparisons;
  }

  /**
   * Generate warnings for the analysis.
   */
  private generateWarnings(
    pathEvaluations: ReturnType<DecisionPathEvaluator['evaluate']>,
    criticalPoints: DecisionTreeAnalysis['criticalPoints']
  ): string[] {
    const warnings: string[] = [];

    const bestPath = pathEvaluations[0];

    // Risk warning
    if (bestPath.risk.overall === 'high' || bestPath.risk.overall === 'severe') {
      warnings.push(
        `High risk profile (${bestPath.risk.overall}) requires careful risk mitigation planning.`
      );
    }

    // Regret warning
    if (bestPath.regret.regretRisk > 0.5) {
      warnings.push(
        `Elevated regret risk (${Math.round(bestPath.regret.regretRisk * 100)}%) suggests high uncertainty in preferences.`
      );
    }

    // Critical points warning
    if (criticalPoints.some((p) => p.impact.magnitude === 'critical')) {
      warnings.push(
        'Critical decision points identified - choices at these points have major long-term impact.'
      );
    }

    // Low confidence warning
    if (bestPath.utility.confidence < 0.5) {
      warnings.push(
        'Low confidence in utility estimates - gather more information before committing.'
      );
    }

    // Market warning
    if (bestPath.market.outlook === 'negative') {
      warnings.push(
        'Negative market outlook for this path - consider timing or alternative entry strategies.'
      );
    }

    return warnings;
  }

  /**
   * Calculate average utility.
   */
  private calculateAverageUtility(
    pathEvaluations: ReturnType<DecisionPathEvaluator['evaluate']>
  ): number {
    if (pathEvaluations.length === 0) return 0;
    return (
      pathEvaluations.reduce((sum, p) => sum + p.utility.total, 0) / pathEvaluations.length
    );
  }

  /**
   * Calculate utility variance.
   */
  private calculateUtilityVariance(
    pathEvaluations: ReturnType<DecisionPathEvaluator['evaluate']>
  ): number {
    if (pathEvaluations.length === 0) return 0;

    const mean = this.calculateAverageUtility(pathEvaluations);
    const squaredDiffs = pathEvaluations.map((p) => Math.pow(p.utility.total - mean, 2));
    return (
      squaredDiffs.reduce((sum, d) => sum + d, 0) / pathEvaluations.length
    );
  }

  /**
   * Update configuration.
   */
  updateConfig(config: Partial<DecisionTreeEngineConfig>): void {
    this.config = { ...this.config, ...config };

    // Recreate components with new config
    this.generator = createDecisionTreeGenerator(this.config);
    this.evaluator = createDecisionPathEvaluator(this.config);
    this.branchAnalyzer = createDecisionBranchAnalyzer(this.config);
    this.explanationEngine = createDecisionExplanationEngine(this.config);
  }

  /**
   * Get current configuration.
   */
  getConfig(): DecisionTreeEngineConfig {
    return { ...this.config };
  }
}

/**
 * Factory function for DecisionTreeEngine.
 */
export function createDecisionTreeEngine(
  config?: Partial<DecisionTreeEngineConfig>
): DecisionTreeEngine {
  return new DecisionTreeEngine(config);
}

/**
 * Convenience function for single-call analysis.
 */
export function analyzeDecisionTree(
  input: DecisionTreeInput,
  config?: Partial<DecisionTreeEngineConfig>
): DecisionTreeAnalysis {
  const engine = createDecisionTreeEngine(config);
  return engine.analyze(input);
}

// Export all types and components
export * from './types';
export { DecisionTreeGenerator, createDecisionTreeGenerator } from './DecisionTreeGenerator';
export { DecisionPathEvaluator, createDecisionPathEvaluator } from './DecisionPathEvaluator';
export { DecisionBranchAnalyzer, createDecisionBranchAnalyzer } from './DecisionBranchAnalyzer';
export { DecisionExplanationEngine, createDecisionExplanationEngine } from './DecisionExplanationEngine';
