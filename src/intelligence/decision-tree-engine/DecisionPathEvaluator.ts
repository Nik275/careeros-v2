/**
 * CareerOS Decision Tree Engine - Decision Path Evaluator
 *
 * Evaluates paths through the decision tree on:
 * - Utility
 * - Regret
 * - Optionality
 * - Risk
 * - Market Outlook
 */

import type {
  DecisionTree,
  DecisionTreeNode,
  DecisionTreeEdge,
  DecisionPathEvaluation,
  RiskLevel,
  DecisionTreeEngineConfig,
} from './types';

import type {
  OptimalDecision,
} from '../decision-optimization-engine';

/**
 * Evaluates decision paths through the tree.
 */
export class DecisionPathEvaluator {
  private config: DecisionTreeEngineConfig;

  constructor(config: DecisionTreeEngineConfig) {
    this.config = config;
  }

  /**
   * Main entry point: evaluate all paths.
   */
  evaluate(
    tree: DecisionTree,
    optimalDecision: OptimalDecision
  ): DecisionPathEvaluation[] {
    const evaluations: DecisionPathEvaluation[] = [];

    // Extract all paths
    const paths = this.extractPaths(tree);

    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      const evaluation = this.evaluatePath(
        path,
        tree,
        optimalDecision,
        i
      );
      evaluations.push(evaluation);
    }

    // Sort by composite score
    evaluations.sort((a, b) => b.compositeScore - a.compositeScore);

    // Update ranks
    evaluations.forEach((e, i) => {
      e.rank = i + 1;
    });

    return evaluations;
  }

  /**
   * Evaluate a single path.
   */
  private evaluatePath(
    path: { nodeIds: string[]; edgeIds: string[]; probability: number },
    tree: DecisionTree,
    optimalDecision: OptimalDecision,
    index: number
  ): DecisionPathEvaluation {
    const nodes = path.nodeIds.map((id) => tree.nodes.get(id)).filter(Boolean) as DecisionTreeNode[];
    const edges = this.getEdgesForPath(path, tree);

    // Determine path type
    const pathType = this.determinePathType(nodes, edges, optimalDecision);

    // Evaluate utility
    const utility = this.evaluateUtility(nodes, edges, optimalDecision);

    // Evaluate regret
    const regret = this.evaluateRegret(nodes, edges, optimalDecision);

    // Evaluate optionality
    const optionality = this.evaluateOptionality(nodes);

    // Evaluate risk
    const risk = this.evaluateRisk(nodes, edges, path.probability);

    // Evaluate market outlook
    const market = this.evaluateMarket(nodes);

    // Calculate composite score
    const compositeScore = this.calculateCompositeScore(
      utility,
      regret,
      optionality,
      risk
    );

    return {
      pathId: `path-${index}`,
      nodeIds: path.nodeIds,
      edgeIds: path.edgeIds,
      pathType,
      utility,
      regret,
      optionality,
      risk,
      market,
      compositeScore,
      rank: 0, // Will be set after sorting
    };
  }

  /**
   * Determine path type based on characteristics.
   */
  private determinePathType(
    nodes: DecisionTreeNode[],
    edges: DecisionTreeEdge[],
    optimalDecision: OptimalDecision
  ): DecisionPathEvaluation['pathType'] {
    // Check if this is the optimal path
    const hasOptimalOutcome = nodes.some(
      (n) => n.data?.careerPathId === optimalDecision.path?.id
    );

    if (hasOptimalOutcome) {
      return 'optimal';
    }

    // Check risk level
    const outcomeNode = nodes[nodes.length - 1];
    const scenarioType = outcomeNode?.data?.outcomeState;

    if (scenarioType === 'high-risk') {
      return 'risky';
    }

    if (scenarioType === 'conservative') {
      return 'conservative';
    }

    // Check for transitions
    const hasTransition = edges.some((e) =>
      e.action?.name?.toLowerCase().includes('transition')
    );

    if (hasTransition) {
      return 'exploratory';
    }

    return 'alternative';
  }

  /**
   * Evaluate utility along the path.
   */
  private evaluateUtility(
    nodes: DecisionTreeNode[],
    edges: DecisionTreeEdge[],
    optimalDecision: OptimalDecision
  ): DecisionPathEvaluation['utility'] {
    const byStage: number[] = [];

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      let stageUtility = 50; // Base utility

      // Factor in node metrics
      if (node.data?.metrics) {
        const metrics = node.data.metrics;
        if (metrics.totalIncome) {
          stageUtility += this.normalizeIncome(metrics.totalIncome) * 20;
        }
        if (metrics.finalOptionality !== undefined) {
          stageUtility += metrics.finalOptionality * 15;
        }
        if (metrics.cumulativeSuccessProbability) {
          stageUtility += metrics.cumulativeSuccessProbability * 10;
        }
      }

      // Factor in scores
      if (node.data?.scores) {
        const scores = node.data.scores;
        if (scores.compositeScore !== undefined) {
          stageUtility = scores.compositeScore;
        }
      }

      // Apply discount for future stages
      const discount = Math.pow(1 - this.config.discountRate, i);
      byStage.push(stageUtility * discount);
    }

    const total = byStage.reduce((sum, u) => sum + u, 0) / byStage.length;
    const discounted = byStage.reduce((sum, u, i) => sum + u * Math.pow(0.95, i), 0) / byStage.length;

    // Calculate confidence based on data quality
    const confidence = nodes.some((n) => n.data?.scenarioId) ? 0.7 : 0.5;

    return {
      total,
      discounted,
      byStage,
      confidence,
    };
  }

  /**
   * Evaluate regret potential.
   */
  private evaluateRegret(
    nodes: DecisionTreeNode[],
    edges: DecisionTreeEdge[],
    optimalDecision: OptimalDecision
  ): DecisionPathEvaluation['regret'] {
    const outcomeNode = nodes[nodes.length - 1];

    // Expected regret based on outcome type
    const scenarioType = outcomeNode?.data?.outcomeState;
    let expectedRegret = 30; // Base regret

    switch (scenarioType) {
      case 'best-case':
        expectedRegret = 10;
        break;
      case 'expected':
        expectedRegret = 25;
        break;
      case 'conservative':
        expectedRegret = 35;
        break;
      case 'high-risk':
        expectedRegret = 50;
        break;
    }

    // Max regret for risky paths
    const maxRegret = scenarioType === 'high-risk' ? 70 : 40;

    // Regret risk based on path type
    const hasRiskyEdge = edges.some((e) =>
      e.explanation?.toLowerCase().includes('risk')
    );
    const regretRisk = hasRiskyEdge ? 0.6 : 0.3;

    return {
      expectedRegret,
      maxRegret,
      regretRisk,
    };
  }

  /**
   * Evaluate optionality preservation.
   */
  private evaluateOptionality(
    nodes: DecisionTreeNode[]
  ): DecisionPathEvaluation['optionality'] {
    const initialNode = nodes[0];
    const outcomeNode = nodes[nodes.length - 1];

    // Initial optionality
    const initial = initialNode?.data?.scores?.optionalityScore || 50;

    // Final optionality
    const final = outcomeNode?.data?.metrics?.finalOptionality !== undefined
      ? outcomeNode.data.metrics.finalOptionality * 100
      : outcomeNode?.data?.scores?.optionalityScore || 40;

    // Preservation ratio
    const preservation = initial > 0 ? final / initial : 0;

    // Future options count
    const futureOptions = nodes.reduce(
      (sum, n) => sum + (n.data?.metrics?.minReversibility !== undefined ? 1 : 0),
      0
    );

    return {
      initial,
      final,
      preservation,
      futureOptions,
    };
  }

  /**
   * Evaluate risk.
   */
  private evaluateRisk(
    nodes: DecisionTreeNode[],
    edges: DecisionTreeEdge[],
    pathProbability: number
  ): DecisionPathEvaluation['risk'] {
    const outcomeNode = nodes[nodes.length - 1];
    const scenarioType = outcomeNode?.data?.outcomeState;

    // Overall risk level
    let overall: RiskLevel = 'moderate';
    let probability = 0.3;

    switch (scenarioType) {
      case 'best-case':
        overall = 'low';
        probability = 0.15;
        break;
      case 'expected':
        overall = 'low';
        probability = 0.20;
        break;
      case 'conservative':
        overall = 'minimal';
        probability = 0.10;
        break;
      case 'high-risk':
        overall = 'high';
        probability = 0.50;
        break;
    }

    // Variance based on outcome uncertainty
    const variance = (1 - pathProbability) * 100;

    // Best and worst case
    const worstCase = scenarioType === 'high-risk' ? 30 : 50;
    const bestCase = scenarioType === 'best-case' ? 90 : 70;

    return {
      overall,
      probability,
      variance,
      worstCase,
      bestCase,
    };
  }

  /**
   * Evaluate market outlook.
   */
  private evaluateMarket(
    nodes: DecisionTreeNode[]
  ): DecisionPathEvaluation['market'] {
    const outcomeNode = nodes[nodes.length - 1];
    const scenarioType = outcomeNode?.data?.outcomeState;

    // Market outlook based on scenario
    let outlook: DecisionPathEvaluation['market']['outlook'] = 'neutral';
    let demandTrend: DecisionPathEvaluation['market']['demandTrend'] = 'stable';
    let competitionLevel: DecisionPathEvaluation['market']['competitionLevel'] = 'moderate';

    switch (scenarioType) {
      case 'best-case':
        outlook = 'strong';
        demandTrend = 'booming';
        competitionLevel = 'moderate';
        break;
      case 'expected':
        outlook = 'positive';
        demandTrend = 'growing';
        competitionLevel = 'moderate';
        break;
      case 'conservative':
        outlook = 'neutral';
        demandTrend = 'stable';
        competitionLevel = 'high';
        break;
      case 'high-risk':
        outlook = 'negative';
        demandTrend = 'declining';
        competitionLevel = 'intense';
        break;
    }

    return {
      outlook,
      demandTrend,
      competitionLevel,
    };
  }

  /**
   * Calculate composite score.
   */
  private calculateCompositeScore(
    utility: DecisionPathEvaluation['utility'],
    regret: DecisionPathEvaluation['regret'],
    optionality: DecisionPathEvaluation['optionality'],
    risk: DecisionPathEvaluation['risk']
  ): number {
    // Utility component
    const utilityComponent = (utility.discounted / 100) * this.config.utilityWeight;

    // Regret component (lower is better)
    const regretComponent =
      (1 - regret.expectedRegret / 100) * this.config.regretWeight;

    // Optionality component
    const optionalityComponent =
      (optionality.preservation * 100 / 100) * this.config.optionalityWeight;

    // Risk component (higher risk = lower score)
    const riskMultiplier: Record<RiskLevel, number> = {
      minimal: 1.0,
      low: 0.9,
      moderate: 0.75,
      high: 0.55,
      severe: 0.35,
    };
    const riskComponent =
      (riskMultiplier[risk.overall] - 1) * Math.abs(this.config.riskWeight);

    const score =
      (utilityComponent + regretComponent + optionalityComponent + riskComponent) * 100;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Extract all paths from tree.
   */
  private extractPaths(
    tree: DecisionTree
  ): Array<{ nodeIds: string[]; edgeIds: string[]; probability: number }> {
    const paths: Array<{ nodeIds: string[]; edgeIds: string[]; probability: number }> = [];

    const traverse = (
      nodeId: string,
      currentPath: string[],
      currentEdges: string[],
      currentProb: number
    ): void => {
      const node = tree.nodes.get(nodeId);
      if (!node) return;

      currentPath.push(nodeId);

      if (node.isTerminal) {
        paths.push({
          nodeIds: [...currentPath],
          edgeIds: [...currentEdges],
          probability: currentProb,
        });
        return;
      }

      const outgoingEdges = tree.edges.filter((e) => e.sourceId === nodeId);

      for (const edge of outgoingEdges) {
        const edgeProb = edge.probability || 1;
        traverse(
          edge.targetId,
          [...currentPath],
          [...currentEdges, `${edge.sourceId}-${edge.targetId}`],
          currentProb * edgeProb
        );
      }
    };

    traverse(tree.rootId, [], [], 1);

    return paths;
  }

  /**
   * Get edges for a path.
   */
  private getEdgesForPath(
    path: { nodeIds: string[]; edgeIds: string[] },
    tree: DecisionTree
  ): DecisionTreeEdge[] {
    return path.edgeIds
      .map((edgeId) => {
        const [sourceId, targetId] = edgeId.split('-');
        return tree.edges.find(
          (e) => e.sourceId === sourceId && e.targetId === targetId
        );
      })
      .filter(Boolean) as DecisionTreeEdge[];
  }

  /**
   * Normalize income to 0-100 scale.
   */
  private normalizeIncome(income: number): number {
    // Assume income range of 0-5M for normalization
    return Math.min(income / 50000, 1);
  }
}

/**
 * Factory function for DecisionPathEvaluator.
 */
export function createDecisionPathEvaluator(
  config: DecisionTreeEngineConfig
): DecisionPathEvaluator {
  return new DecisionPathEvaluator(config);
}
