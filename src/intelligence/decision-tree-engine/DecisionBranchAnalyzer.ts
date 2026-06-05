/**
 * CareerOS Decision Tree Engine - Decision Branch Analyzer
 *
 * Detects:
 * - High-risk branches
 * - High-upside branches
 * - High-optionality branches
 */

import type {
  DecisionTree,
  DecisionTreeNode,
  DecisionTreeEdge,
  DecisionPathEvaluation,
  DecisionBranchAnalysis,
  CriticalDecisionPoint,
  BranchingOpportunity,
  RiskLevel,
  UpsideLevel,
  OptionalityLevel,
  DecisionTreeEngineConfig,
  DecisionType,
} from './types';

/**
 * Analyzes branches in the decision tree.
 */
export class DecisionBranchAnalyzer {
  private config: DecisionTreeEngineConfig;

  constructor(config: DecisionTreeEngineConfig) {
    this.config = config;
  }

  /**
   * Main entry point: analyze all branches.
   */
  analyze(
    tree: DecisionTree,
    pathEvaluations: DecisionPathEvaluation[]
  ): {
    branchAnalyses: DecisionBranchAnalysis[];
    criticalPoints: CriticalDecisionPoint[];
    branchingOpportunities: BranchingOpportunity[];
  } {
    // Analyze branches from decision nodes
    const branchAnalyses = this.analyzeBranches(tree, pathEvaluations);

    // Identify critical decision points
    const criticalPoints = this.identifyCriticalPoints(tree, pathEvaluations);

    // Identify branching opportunities
    const branchingOpportunities = this.identifyBranchingOpportunities(tree, pathEvaluations);

    return {
      branchAnalyses,
      criticalPoints,
      branchingOpportunities,
    };
  }

  /**
   * Analyze individual branches.
   */
  private analyzeBranches(
    tree: DecisionTree,
    pathEvaluations: DecisionPathEvaluation[]
  ): DecisionBranchAnalysis[] {
    const analyses: DecisionBranchAnalysis[] = [];

    // Find all decision nodes
    const decisionNodes = Array.from(tree.nodes.values()).filter(
      (n) => n.nodeType === 'decision'
    );

    for (const node of decisionNodes) {
      const outgoingEdges = tree.edges.filter((e) => e.sourceId === node.id);

      for (const edge of outgoingEdges) {
        const analysis = this.analyzeBranch(
          edge,
          node,
          tree,
          pathEvaluations
        );
        analyses.push(analysis);
      }
    }

    return analyses;
  }

  /**
   * Analyze a single branch.
   */
  private analyzeBranch(
    edge: DecisionTreeEdge,
    sourceNode: DecisionTreeNode,
    tree: DecisionTree,
    pathEvaluations: DecisionPathEvaluation[]
  ): DecisionBranchAnalysis {
    // Get all paths that go through this edge
    const affectedPaths = pathEvaluations.filter((p) =>
      p.edgeIds.includes(`${edge.sourceId}-${edge.targetId}`)
    );

    // Get target node
    const targetNode = tree.nodes.get(edge.targetId);
    const targetNodeIds = this.getReachableNodes(edge.targetId, tree);

    // Analyze risk
    const riskAnalysis = this.analyzeBranchRisk(
      edge,
      affectedPaths,
      targetNode
    );

    // Analyze upside
    const upsideAnalysis = this.analyzeBranchUpside(
      edge,
      affectedPaths,
      targetNode
    );

    // Analyze optionality
    const optionalityAnalysis = this.analyzeBranchOptionality(
      edge,
      affectedPaths,
      targetNode,
      targetNodeIds,
      tree
    );

    // Determine characteristics
    const characteristics = {
      risk: riskAnalysis.level,
      upside: upsideAnalysis.level,
      optionality: optionalityAnalysis.level,
    };

    // Generate recommendation
    const recommendation = this.generateBranchRecommendation(
      characteristics,
      affectedPaths
    );

    return {
      branchId: `${edge.sourceId}-${edge.targetId}`,
      sourceNodeId: sourceNode.id,
      targetNodeIds,
      characteristics,
      riskAnalysis,
      upsideAnalysis,
      optionalityAnalysis,
      recommendation,
    };
  }

  /**
   * Analyze branch risk.
   */
  private analyzeBranchRisk(
    edge: DecisionTreeEdge,
    affectedPaths: DecisionPathEvaluation[],
    targetNode: DecisionTreeNode | undefined
  ): DecisionBranchAnalysis['riskAnalysis'] {
    // Calculate average risk
    const avgRiskProbability =
      affectedPaths.reduce((sum, p) => sum + p.risk.probability, 0) /
      Math.max(affectedPaths.length, 1);

    // Determine risk level
    let level: RiskLevel = 'moderate';
    if (avgRiskProbability < 0.15) level = 'minimal';
    else if (avgRiskProbability < 0.25) level = 'low';
    else if (avgRiskProbability < 0.40) level = 'moderate';
    else if (avgRiskProbability < 0.60) level = 'high';
    else level = 'severe';

    // Potential loss
    const worstCase = Math.min(...affectedPaths.map((p) => p.risk.worstCase));
    const potentialLoss = 100 - worstCase;

    // Risk factors
    const riskFactors: string[] = [];

    if (edge.edgeType === 'probability' && (edge.probability || 1) < 0.3) {
      riskFactors.push('Low probability of success');
    }

    if (targetNode?.data?.outcomeState === 'high-risk') {
      riskFactors.push('High-risk scenario outcome');
    }

    if (affectedPaths.some((p) => p.regret.regretRisk > 0.5)) {
      riskFactors.push('Elevated regret risk');
    }

    // Mitigation options
    const mitigationOptions: string[] = [];

    if (level === 'high' || level === 'severe') {
      mitigationOptions.push('Gather more information before committing');
      mitigationOptions.push('Develop contingency plans');
      mitigationOptions.push('Build skills that transfer to alternatives');
    }

    if (potentialLoss > 50) {
      mitigationOptions.push('Test the path with small experiments first');
    }

    return {
      level,
      probability: avgRiskProbability,
      potentialLoss,
      riskFactors,
      mitigationOptions,
    };
  }

  /**
   * Analyze branch upside.
   */
  private analyzeBranchUpside(
    edge: DecisionTreeEdge,
    affectedPaths: DecisionPathEvaluation[],
    targetNode: DecisionTreeNode | undefined
  ): DecisionBranchAnalysis['upsideAnalysis'] {
    // Calculate best case
    const bestCase = Math.max(...affectedPaths.map((p) => p.risk.bestCase));
    const potentialGain = bestCase - 50; // Relative to baseline

    // Upside probability
    const upsideProbability = affectedPaths.reduce(
      (sum, p) => sum + (p.market.outlook === 'strong' ? 1 : p.market.outlook === 'positive' ? 0.7 : 0.3),
      0
    ) / Math.max(affectedPaths.length, 1);

    // Determine upside level
    let level: UpsideLevel = 'moderate';
    if (potentialGain < 10) level = 'minimal';
    else if (potentialGain < 25) level = 'low';
    else if (potentialGain < 40) level = 'moderate';
    else if (potentialGain < 55) level = 'high';
    else level = 'exceptional';

    // Upside factors
    const upsideFactors: string[] = [];

    if (bestCase > 80) {
      upsideFactors.push('Exceptional outcome possible');
    }

    if (targetNode?.data?.outcomeState === 'best-case') {
      upsideFactors.push('Best-case scenario path');
    }

    if (affectedPaths.some((p) => p.market.outlook === 'strong')) {
      upsideFactors.push('Favorable market conditions');
    }

    if (affectedPaths.some((p) => p.optionality.futureOptions > 3)) {
      upsideFactors.push('Multiple future growth paths');
    }

    // Catalysts
    const catalysts: string[] = [];

    if (upsideFactors.length > 0) {
      catalysts.push('Strong performance in current role');
      catalysts.push('Favorable industry trends');
      catalysts.push('Network expansion');
    }

    return {
      level,
      probability: upsideProbability,
      potentialGain,
      upsideFactors,
      catalysts,
    };
  }

  /**
   * Analyze branch optionality.
   */
  private analyzeBranchOptionality(
    edge: DecisionTreeEdge,
    affectedPaths: DecisionPathEvaluation[],
    targetNode: DecisionTreeNode | undefined,
    targetNodeIds: string[],
    tree: DecisionTree
  ): DecisionBranchAnalysis['optionalityAnalysis'] {
    // Count preserved options
    const preservedOptions = targetNodeIds.length;

    // Calculate future flexibility
    const avgFlexibility =
      affectedPaths.reduce((sum, p) => sum + p.optionality.preservation, 0) /
      Math.max(affectedPaths.length, 1);
    const futureFlexibility = avgFlexibility * 100;

    // Calculate reversibility
    const reversibility = targetNode?.data?.metrics?.minReversibility !== undefined
      ? targetNode.data.metrics.minReversibility
      : 0.5;

    // Closed options - estimate based on branch specificity
    const closedOptions = edge.edgeType === 'choice' ? 1 : 0;

    // Determine optionality level
    let level: OptionalityLevel = 'moderate';
    if (futureFlexibility < 30) level = 'constrained';
    else if (futureFlexibility < 50) level = 'limited';
    else if (futureFlexibility < 70) level = 'moderate';
    else if (futureFlexibility < 85) level = 'flexible';
    else level = 'expansive';

    return {
      level,
      preservedOptions,
      closedOptions,
      futureFlexibility,
      reversibility,
    };
  }

  /**
   * Generate branch recommendation.
   */
  private generateBranchRecommendation(
    characteristics: DecisionBranchAnalysis['characteristics'],
    affectedPaths: DecisionPathEvaluation[]
  ): DecisionBranchAnalysis['recommendation'] {
    const { risk, upside, optionality } = characteristics;

    // Calculate attractiveness score
    let score = 50;

    // Risk penalty
    const riskScores: Record<RiskLevel, number> = {
      minimal: 15,
      low: 10,
      moderate: 0,
      high: -15,
      severe: -25,
    };
    score += riskScores[risk];

    // Upside bonus
    const upsideScores: Record<UpsideLevel, number> = {
      minimal: -10,
      low: 0,
      moderate: 5,
      high: 15,
      exceptional: 25,
    };
    score += upsideScores[upside];

    // Optionality bonus
    const optionalityScores: Record<OptionalityLevel, number> = {
      constrained: -15,
      limited: -5,
      moderate: 0,
      flexible: 10,
      expansive: 15,
    };
    score += optionalityScores[optionality];

    // Determine if recommended
    const isRecommended = score > 60;
    const confidence = Math.min(Math.abs(score - 50) / 50, 1);

    // Generate reasoning
    const reasoning: string[] = [];

    if (isRecommended) {
      if (upside === 'high' || upside === 'exceptional') {
        reasoning.push('Strong upside potential');
      }
      if (optionality === 'flexible' || optionality === 'expansive') {
        reasoning.push('Preserves future options');
      }
      if (risk === 'low' || risk === 'minimal') {
        reasoning.push('Manageable risk profile');
      }
    } else {
      if (risk === 'high' || risk === 'severe') {
        reasoning.push('Excessive risk exposure');
      }
      if (optionality === 'constrained' || optionality === 'limited') {
        reasoning.push('Limits future flexibility');
      }
      if (upside === 'minimal' || upside === 'low') {
        reasoning.push('Limited upside potential');
      }
    }

    // Add path-based reasoning
    const avgUtility =
      affectedPaths.reduce((sum, p) => sum + p.utility.total, 0) /
      Math.max(affectedPaths.length, 1);

    if (avgUtility > 60) {
      reasoning.push('Strong utility across scenarios');
    }

    return {
      isRecommended,
      confidence,
      reasoning,
    };
  }

  /**
   * Identify critical decision points.
   */
  private identifyCriticalPoints(
    tree: DecisionTree,
    pathEvaluations: DecisionPathEvaluation[]
  ): CriticalDecisionPoint[] {
    const criticalPoints: CriticalDecisionPoint[] = [];

    // Find decision nodes with significant impact
    const decisionNodes = Array.from(tree.nodes.values()).filter(
      (n) => n.nodeType === 'decision'
    );

    for (const node of decisionNodes) {
      // Skip root node
      if (node.depth === 0) continue;

      // Get outgoing edges
      const outgoingEdges = tree.edges.filter((e) => e.sourceId === node.id);

      if (outgoingEdges.length < 2) continue;

      // Calculate impact of this decision
      const impact = this.calculateDecisionImpact(node, outgoingEdges, pathEvaluations);

      // Only include if impact is significant
      if (impact.magnitude === 'low') continue;

      // Build choices
      const choices = outgoingEdges.map((edge) => {
        const affectedPaths = pathEvaluations.filter((p) =>
          p.edgeIds.includes(`${edge.sourceId}-${edge.targetId}`)
        );

        const avgUtility =
          affectedPaths.reduce((sum, p) => sum + p.utility.total, 0) /
          Math.max(affectedPaths.length, 1);

        return {
          edgeId: `${edge.sourceId}-${edge.targetId}`,
          label: edge.action?.name || edge.explanation,
          consequences: this.extractConsequences(edge, tree),
          metrics: {
            expectedUtility: avgUtility,
            risk: this.calculateChoiceRisk(affectedPaths),
            optionality: this.calculateChoiceOptionality(affectedPaths),
          },
        };
      });

      // Sort choices by utility
      choices.sort((a, b) => b.metrics.expectedUtility - a.metrics.expectedUtility);

      criticalPoints.push({
        nodeId: node.id,
        description: node.description,
        decisionType: node.data?.decisionType || 'specialization',
        choices,
        impact,
        timing: {
          isTimeSensitive: node.depth <= 2,
          urgency: node.depth <= 1 ? 'high' : 'medium',
        },
        recommendedChoice: choices[0]?.edgeId || '',
        recommendationReason: choices[0]
          ? [`Highest expected utility (${Math.round(choices[0].metrics.expectedUtility)}%)`]
          : [],
      });
    }

    // Sort by impact magnitude
    const magnitudeOrder = { critical: 4, high: 3, moderate: 2, low: 1 };
    criticalPoints.sort(
      (a, b) => magnitudeOrder[b.impact.magnitude] - magnitudeOrder[a.impact.magnitude]
    );

    return criticalPoints.slice(0, 5);
  }

  /**
   * Calculate decision impact.
   */
  private calculateDecisionImpact(
    node: DecisionTreeNode,
    edges: DecisionTreeEdge[],
    pathEvaluations: DecisionPathEvaluation[]
  ): CriticalDecisionPoint['impact'] {
    // Calculate utility variance between choices
    const choiceUtilities: number[] = [];

    for (const edge of edges) {
      const affectedPaths = pathEvaluations.filter((p) =>
        p.edgeIds.includes(`${edge.sourceId}-${edge.targetId}`)
      );

      const avgUtility =
        affectedPaths.reduce((sum, p) => sum + p.utility.total, 0) /
        Math.max(affectedPaths.length, 1);

      choiceUtilities.push(avgUtility);
    }

    const utilityRange = Math.max(...choiceUtilities) - Math.min(...choiceUtilities);

    // Determine magnitude
    let magnitude: CriticalDecisionPoint['impact']['magnitude'] = 'low';
    if (utilityRange > 30) magnitude = 'critical';
    else if (utilityRange > 20) magnitude = 'high';
    else if (utilityRange > 10) magnitude = 'moderate';

    // Calculate irreversibility
    const irreversibility = node.depth <= 1 ? 0.8 : node.depth <= 2 ? 0.5 : 0.3;

    // Long-term effect description
    const longTermEffect =
      magnitude === 'critical'
        ? 'Profound impact on career trajectory and long-term outcomes'
        : magnitude === 'high'
        ? 'Significant influence on career direction'
        : magnitude === 'moderate'
        ? 'Moderate impact on career options'
        : 'Limited long-term impact';

    return {
      magnitude,
      irreversibility,
      longTermEffect,
    };
  }

  /**
   * Extract consequences from edge.
   */
  private extractConsequences(
    edge: DecisionTreeEdge,
    tree: DecisionTree
  ): string[] {
    const consequences: string[] = [];

    if (edge.action) {
      consequences.push(`Requires ${edge.action.time} commitment`);
      if (edge.action.cost) {
        consequences.push(`Involves cost of ${edge.action.cost}`);
      }
    }

    if (edge.requirements && edge.requirements.length > 0) {
      consequences.push(`Requires: ${edge.requirements.join(', ')}`);
    }

    return consequences;
  }

  /**
   * Calculate risk level for a choice.
   */
  private calculateChoiceRisk(
    affectedPaths: DecisionPathEvaluation[]
  ): RiskLevel {
    const avgRisk =
      affectedPaths.reduce((sum, p) => sum + p.risk.probability, 0) /
      Math.max(affectedPaths.length, 1);

    if (avgRisk < 0.15) return 'minimal';
    if (avgRisk < 0.25) return 'low';
    if (avgRisk < 0.40) return 'moderate';
    if (avgRisk < 0.60) return 'high';
    return 'severe';
  }

  /**
   * Calculate optionality level for a choice.
   */
  private calculateChoiceOptionality(
    affectedPaths: DecisionPathEvaluation[]
  ): OptionalityLevel {
    const avgPreservation =
      affectedPaths.reduce((sum, p) => sum + p.optionality.preservation, 0) /
      Math.max(affectedPaths.length, 1);

    if (avgPreservation < 0.3) return 'constrained';
    if (avgPreservation < 0.5) return 'limited';
    if (avgPreservation < 0.7) return 'moderate';
    if (avgPreservation < 0.85) return 'flexible';
    return 'expansive';
  }

  /**
   * Identify branching opportunities.
   */
  private identifyBranchingOpportunities(
    tree: DecisionTree,
    pathEvaluations: DecisionPathEvaluation[]
  ): BranchingOpportunity[] {
    const opportunities: BranchingOpportunity[] = [];

    // Find outcome nodes that have transitions
    const outcomeNodes = Array.from(tree.nodes.values()).filter(
      (n) => n.nodeType === 'outcome' && n.data?.outcomeState === 'transition'
    );

    for (const node of outcomeNodes) {
      // Get incoming edge
      const incomingEdge = tree.edges.find((e) => e.targetId === node.id);
      if (!incomingEdge) continue;

      // Get source node
      const sourceNode = tree.nodes.get(incomingEdge.sourceId);
      if (!sourceNode) continue;

      // Find alternative paths
      const alternativePaths = pathEvaluations.filter(
        (p) => !p.nodeIds.includes(node.id)
      );

      if (alternativePaths.length === 0) continue;

      // Build branches
      const branches = alternativePaths.slice(0, 3).map((path) => ({
        branchId: path.pathId,
        label: path.pathType,
        destinationCareerId: 'alternative',
        requirements: ['Successful transition'],
        metrics: {
          expectedUtility: path.utility.total,
          transitionDifficulty: 50, // Default
          successProbability: 1 - path.risk.probability,
        },
      }));

      // Calculate optionality value
      const optionalityValue = branches.reduce(
        (sum, b) => sum + b.metrics.expectedUtility,
        0
      ) / Math.max(branches.length, 1);

      opportunities.push({
        nodeId: node.id,
        description: `Branch from ${sourceNode.label} to explore alternatives`,
        branches,
        optionalityValue,
        recommendation: {
          shouldBranch: optionalityValue > 50,
          preferredBranch: branches[0]?.branchId || null,
          reasoning:
            optionalityValue > 50
              ? ['Alternative paths offer comparable utility']
              : ['Current path maintains better trajectory'],
        },
      });
    }

    return opportunities;
  }

  /**
   * Get all nodes reachable from a given node.
   */
  private getReachableNodes(nodeId: string, tree: DecisionTree): string[] {
    const reachable: string[] = [nodeId];
    const visited = new Set<string>([nodeId]);

    const traverse = (currentId: string): void => {
      const outgoingEdges = tree.edges.filter((e) => e.sourceId === currentId);

      for (const edge of outgoingEdges) {
        if (!visited.has(edge.targetId)) {
          visited.add(edge.targetId);
          reachable.push(edge.targetId);
          traverse(edge.targetId);
        }
      }
    };

    traverse(nodeId);

    return reachable;
  }
}

/**
 * Factory function for DecisionBranchAnalyzer.
 */
export function createDecisionBranchAnalyzer(
  config: DecisionTreeEngineConfig
): DecisionBranchAnalyzer {
  return new DecisionBranchAnalyzer(config);
}
