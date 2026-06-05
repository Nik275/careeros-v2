/**
 * CareerOS Decision Tree Engine - Decision Tree Generator
 *
 * Generates decision trees from career paths, future simulations, and transition graphs.
 */

import type {
  ExploredCareerPath,
  CareerNode,
  CareerEdge,
} from '../path-explorer';

import type {
  FutureScenario,
  ScenarioType,
} from '../future-scenario';

import type {
  DecisionTree,
  DecisionTreeNode,
  DecisionTreeEdge,
  DecisionTreeNodeType,
  DecisionType,
  TreeGenerationResult,
  DecisionTreeEngineConfig,
} from './types';

/**
 * Generates decision trees from career data.
 */
export class DecisionTreeGenerator {
  private config: DecisionTreeEngineConfig;
  private nodeCounter: number;
  private edgeCounter: number;

  constructor(config: DecisionTreeEngineConfig) {
    this.config = config;
    this.nodeCounter = 0;
    this.edgeCounter = 0;
  }

  /**
   * Main entry point: generate decision tree.
   */
  generate(
    startingCareerId: string,
    startingCareerName: string,
    careerPaths: ExploredCareerPath[],
    futureScenarios: FutureScenario[]
  ): TreeGenerationResult {
    // Reset counters
    this.nodeCounter = 0;
    this.edgeCounter = 0;

    // Create root node
    const rootNode = this.createRootNode(startingCareerId, startingCareerName);

    // Build tree structure
    const nodes = new Map<string, DecisionTreeNode>();
    const edges: DecisionTreeEdge[] = [];

    nodes.set(rootNode.id, rootNode);

    // Generate initial decision branches
    this.generateInitialDecisionBranches(
      rootNode,
      careerPaths,
      nodes,
      edges
    );

    // Generate scenario branches for each path
    this.generateScenarioBranches(
      rootNode,
      careerPaths,
      futureScenarios,
      nodes,
      edges
    );

    // Generate transition branches for career changes
    this.generateTransitionBranches(
      careerPaths,
      nodes,
      edges
    );

    // Build the tree
    const tree: DecisionTree = {
      id: this.generateTreeId(),
      rootId: rootNode.id,
      nodes,
      edges,
      startingState: {
        careerId: startingCareerId,
        careerName: startingCareerName,
        studentContext: 'Initial career decision point',
      },
      metadata: {
        createdAt: Date.now(),
        maxDepth: this.calculateMaxDepth(nodes),
        nodeCount: nodes.size,
        branchCount: edges.length,
        terminalNodeCount: this.countTerminalNodes(nodes, edges),
      },
    };

    // Extract all paths
    const paths = this.extractAllPaths(tree);

    // Get terminal nodes
    const terminalNodes = Array.from(nodes.values()).filter((n) => n.isTerminal);

    return {
      tree,
      rootNode,
      terminalNodes,
      paths,
    };
  }

  /**
   * Create root node.
   */
  private createRootNode(
    careerId: string,
    careerName: string
  ): DecisionTreeNode {
    return {
      id: this.generateNodeId(),
      nodeType: 'decision',
      label: `Start: ${careerName}`,
      description: `Initial decision point for ${careerName} career path`,
      data: {
        decisionType: 'career-entry',
        careerPathId: careerId,
      },
      depth: 0,
      parentId: null,
      isTerminal: false,
    };
  }

  /**
   * Generate initial decision branches from root.
   */
  private generateInitialDecisionBranches(
    rootNode: DecisionTreeNode,
    careerPaths: ExploredCareerPath[],
    nodes: Map<string, DecisionTreeNode>,
    edges: DecisionTreeEdge[]
  ): void {
    // Create decision nodes for each path type
    const pathTypes = ['primary', 'high-growth', 'high-optionality', 'low-risk'] as const;

    for (const pathType of pathTypes) {
      const path = careerPaths.find((p) => p.type === pathType);
      if (!path) continue;

      // Create decision node for this path
      const decisionNode: DecisionTreeNode = {
        id: this.generateNodeId(),
        nodeType: 'decision',
        label: `Choose ${this.formatPathType(pathType)} Path`,
        description: `Commit to ${path.name} trajectory`,
        data: {
          decisionType: 'specialization',
          careerPathId: path.id,
          metrics: path.metrics,
          scores: path.scores,
        },
        depth: 1,
        parentId: rootNode.id,
        isTerminal: false,
      };

      nodes.set(decisionNode.id, decisionNode);

      // Create edge from root to decision
      const edge: DecisionTreeEdge = {
        sourceId: rootNode.id,
        targetId: decisionNode.id,
        edgeType: 'choice',
        explanation: `Choose the ${this.formatPathType(pathType)} career trajectory`,
        action: {
          name: `Select ${this.formatPathType(pathType)} Path`,
          description: path.explanation?.overview || '',
          time: `${path.metrics?.totalYears || 5} years`,
        },
      };

      edges.push(edge);
    }
  }

  /**
   * Generate scenario branches (chance nodes).
   */
  private generateScenarioBranches(
    rootNode: DecisionTreeNode,
    careerPaths: ExploredCareerPath[],
    futureScenarios: FutureScenario[],
    nodes: Map<string, DecisionTreeNode>,
    edges: DecisionTreeEdge[]
  ): void {
    // Group scenarios by path
    const scenariosByPath = this.groupScenariosByPath(futureScenarios, careerPaths);

    // For each path decision node, add scenario branches
    for (const [, node] of nodes) {
      if (node.nodeType !== 'decision' || node.depth !== 1) continue;

      const pathId = node.data?.careerPathId;
      if (!pathId) continue;

      const scenarios = scenariosByPath.get(pathId) || [];

      // Create chance node for scenarios
      const chanceNode: DecisionTreeNode = {
        id: this.generateNodeId(),
        nodeType: 'chance',
        label: 'Market Conditions',
        description: 'Uncertain future market conditions affect outcomes',
        data: {
          eventDescription: 'Market and external factors',
          careerPathId: pathId,
        },
        depth: 2,
        parentId: node.id,
        isTerminal: false,
      };

      nodes.set(chanceNode.id, chanceNode);

      // Edge from decision to chance
      edges.push({
        sourceId: node.id,
        targetId: chanceNode.id,
        edgeType: 'deterministic',
        explanation: 'Proceed with chosen path, subject to market conditions',
      });

      // Create outcome nodes for each scenario
      for (const scenario of scenarios.slice(0, this.config.maxBranches)) {
        const probability = this.estimateScenarioProbability(scenario.type);

        const outcomeNode: DecisionTreeNode = {
          id: this.generateNodeId(),
          nodeType: 'outcome',
          label: `${this.formatScenarioType(scenario.type)} Outcome`,
          description: scenario.description,
          data: {
            outcomeState: scenario.type,
            scenarioId: scenario.id,
            metrics: {
              totalIncome: scenario.metrics?.totalIncome,
              finalOptionality: scenario.metrics?.finalOptionality,
            },
          },
          depth: 3,
          parentId: chanceNode.id,
          isTerminal: true,
        };

        nodes.set(outcomeNode.id, outcomeNode);

        // Edge from chance to outcome
        edges.push({
          sourceId: chanceNode.id,
          targetId: outcomeNode.id,
          probability,
          edgeType: 'probability',
          explanation: `${this.formatScenarioType(scenario.type)} scenario with ${Math.round(probability * 100)}% probability`,
        });
      }
    }
  }

  /**
   * Generate transition branches for career changes.
   */
  private generateTransitionBranches(
    careerPaths: ExploredCareerPath[],
    nodes: Map<string, DecisionTreeNode>,
    edges: DecisionTreeEdge[]
  ): void {
    // Find decision nodes that could have transitions
    const decisionNodes = Array.from(nodes.values()).filter(
      (n) => n.nodeType === 'decision' && n.depth === 1
    );

    for (const node of decisionNodes) {
      const path = careerPaths.find((p) => p.id === node.data?.careerPathId);
      if (!path || !path.edges) continue;

      // Create transition decision node
      const transitionNode: DecisionTreeNode = {
        id: this.generateNodeId(),
        nodeType: 'decision',
        label: 'Career Transition Opportunity',
        description: 'Option to transition to adjacent career',
        data: {
          decisionType: 'transition',
          careerPathId: path.id,
        },
        depth: 2,
        parentId: node.id,
        isTerminal: false,
      };

      nodes.set(transitionNode.id, transitionNode);

      // Edge to transition decision
      edges.push({
        sourceId: node.id,
        targetId: transitionNode.id,
        edgeType: 'choice',
        explanation: 'Consider career transition options',
        action: {
          name: 'Explore Transitions',
          description: 'Evaluate adjacent career opportunities',
          time: '6-12 months',
        },
      });

      // Add transition options
      for (const edge of path.edges.slice(0, 3)) {
        const targetNode = this.findTargetNode(edge, path);
        if (!targetNode) continue;

        const transitionOutcome: DecisionTreeNode = {
          id: this.generateNodeId(),
          nodeType: 'outcome',
          label: `Transition to ${targetNode.careerId || 'New Career'}`,
          description: `Career change via ${edge.type || 'transition'}`,
          data: {
            outcomeState: 'transition',
            metrics: {
              totalDifficulty: edge.difficulty,
              avgTransitionTime: edge.timeRequired,
            },
          },
          depth: 3,
          parentId: transitionNode.id,
          isTerminal: true,
        };

        nodes.set(transitionOutcome.id, transitionOutcome);

        edges.push({
          sourceId: transitionNode.id,
          targetId: transitionOutcome.id,
          edgeType: 'choice',
          explanation: `Transition to ${targetNode.careerId || 'new career'}`,
          action: {
            name: 'Execute Transition',
            description: `Move to ${targetNode.careerId || 'new role'}`,
            time: edge.timeRequired,
            cost: edge.difficulty,
          },
          requirements: edge.prerequisites,
        });
      }
    }
  }

  /**
   * Group scenarios by career path.
   */
  private groupScenariosByPath(
    scenarios: FutureScenario[],
    paths: ExploredCareerPath[]
  ): Map<string, FutureScenario[]> {
    const grouped = new Map<string, FutureScenario[]>();

    for (const path of paths) {
      const pathScenarios = scenarios.filter(
        (s) => s.basePathId === path.id || s.basePathId === path.nodes[0]?.careerId
      );
      if (pathScenarios.length > 0) {
        grouped.set(path.id, pathScenarios);
      }
    }

    return grouped;
  }

  /**
   * Estimate probability for a scenario type.
   */
  private estimateScenarioProbability(scenarioType: ScenarioType): number {
    const probabilities: Record<ScenarioType, number> = {
      'best-case': 0.15,
      'expected': 0.50,
      'conservative': 0.25,
      'high-risk': 0.10,
    };

    return probabilities[scenarioType] || 0.25;
  }

  /**
   * Find target node from edge.
   */
  private findTargetNode(
    edge: CareerEdge,
    path: ExploredCareerPath
  ): CareerNode | undefined {
    return path.nodes.find((n) => n.id === edge.targetId);
  }

  /**
   * Extract all paths from root to terminal nodes.
   */
  private extractAllPaths(tree: DecisionTree): Array<{ nodeIds: string[]; edgeIds: string[]; probability: number }> {
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
   * Calculate maximum depth in tree.
   */
  private calculateMaxDepth(nodes: Map<string, DecisionTreeNode>): number {
    let maxDepth = 0;
    for (const node of nodes.values()) {
      maxDepth = Math.max(maxDepth, node.depth);
    }
    return maxDepth;
  }

  /**
   * Count terminal nodes.
   */
  private countTerminalNodes(
    nodes: Map<string, DecisionTreeNode>,
    edges: DecisionTreeEdge[]
  ): number {
    let count = 0;
    for (const node of nodes.values()) {
      const hasOutgoing = edges.some((e) => e.sourceId === node.id);
      if (!hasOutgoing || node.isTerminal) {
        count++;
      }
    }
    return count;
  }

  /**
   * Generate unique node ID.
   */
  private generateNodeId(): string {
    return `node-${++this.nodeCounter}`;
  }

  /**
   * Generate unique tree ID.
   */
  private generateTreeId(): string {
    return `tree-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Format path type for display.
   */
  private formatPathType(type: string): string {
    const formats: Record<string, string> = {
      primary: 'Primary',
      'high-growth': 'High-Growth',
      'high-optionality': 'High-Optionality',
      'low-risk': 'Low-Risk',
    };
    return formats[type] || type;
  }

  /**
   * Format scenario type for display.
   */
  private formatScenarioType(type: ScenarioType): string {
    const formats: Record<ScenarioType, string> = {
      'best-case': 'Best-Case',
      'expected': 'Expected',
      'conservative': 'Conservative',
      'high-risk': 'High-Risk',
    };
    return formats[type] || type;
  }
}

/**
 * Factory function for DecisionTreeGenerator.
 */
export function createDecisionTreeGenerator(
  config: DecisionTreeEngineConfig
): DecisionTreeGenerator {
  return new DecisionTreeGenerator(config);
}
