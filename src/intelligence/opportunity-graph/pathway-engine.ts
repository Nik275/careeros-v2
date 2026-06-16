/**
 * Pathway Engine
 *
 * Phase 8.8: CareerOS India Opportunity Graph
 *
 * Generates career pathways by traversing the opportunity graph.
 * Provides methods for finding shortest paths, all paths, and
 * paths ranked by optionality.
 *
 * @module pathway-engine
 * @version 1.0.0
 */

import {
  OpportunityGraph,
  OpportunityNode,
  PathwayAnalysis,
  PathwayStep,
  IPathwayEngine,
  OptionalityAnalysis,
  DifficultyLevel,
} from './opportunity-node-types';

export class PathwayEngine implements IPathwayEngine {
  private graph: OpportunityGraph;

  constructor(graph: OpportunityGraph) {
    this.graph = graph;
  }

  /**
   * Generate a pathway from start to end node
   */
  generatePathway(startNode: string, endNode?: string): PathwayAnalysis {
    const steps: PathwayStep[] = [];
    const visited = new Set<string>();
    const queue: Array<{ nodeId: string; depth: number }> = [{ nodeId: startNode, depth: 0 }];

    let currentNode: OpportunityNode | undefined;

    while (queue.length > 0) {
      const { nodeId, depth } = queue.shift()!;

      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      currentNode = this.graph.nodes.get(nodeId);
      if (!currentNode) break;

      const step: PathwayStep = {
        nodeId: currentNode.id,
        nodeType: currentNode.type,
        name: currentNode.name,
        description: currentNode.description,
        duration: this.getDuration(currentNode),
        difficulty: currentNode.difficulty,
        requirements: this.getRequirements(currentNode),
        alternatives: this.getAlternatives(currentNode),
        optionalityAtThisStep: this.calculateNodeOptionality(currentNode.id),
      };
      steps.push(step);

      if (endNode && nodeId === endNode) break;

      // Get connected nodes and continue traversal
      const edgeIds = this.graph.adjacencyList.get(nodeId) || [];
      for (const edgeId of edgeIds) {
        const edge = this.graph.edges.get(edgeId);
        if (edge && !visited.has(edge.target)) {
          queue.push({ nodeId: edge.target, depth: depth + 1 });
        }
      }
    }

    const totalDuration = steps.reduce((sum, step) => sum + (step.duration || 0), 0);

    return {
      id: `pathway-${startNode}-${endNode || 'open'}`,
      startNode,
      endNode,
      steps,
      totalDuration,
      totalCost: this.calculateTotalCost(steps),
      difficulty: this.calculateOverallDifficulty(steps),
      optionalityScore: this.calculatePathwayOptionality(steps),
      futurePathCount: this.countFuturePaths(startNode),
      pivotOpportunities: this.countPivotOpportunities(steps),
      alternativeRoutes: [],
      riskFactors: this.identifyRiskFactors(steps),
      recommendation: this.generateRecommendation(steps),
    };
  }

  /**
   * Generate all possible pathways from a start node
   */
  generateAllPathways(startNode: string, maxDepth: number = 5): PathwayAnalysis[] {
    const pathways: PathwayAnalysis[] = [];
    const visited = new Set<string>();

    const dfs = (currentId: string, steps: PathwayStep[], depth: number) => {
      if (depth > maxDepth) {
        pathways.push(this.createPathwayFromSteps(startNode, steps));
        return;
      }

      visited.add(currentId);
      const node = this.graph.nodes.get(currentId);
      if (!node) return;

      const step: PathwayStep = {
        nodeId: node.id,
        nodeType: node.type,
        name: node.name,
        description: node.description,
        duration: this.getDuration(node),
        difficulty: node.difficulty,
        requirements: this.getRequirements(node),
        alternatives: this.getAlternatives(node),
        optionalityAtThisStep: this.calculateNodeOptionality(node.id),
      };
      steps.push(step);

      const edgeIds = this.graph.adjacencyList.get(currentId) || [];
      if (edgeIds.length === 0 || depth === maxDepth) {
        pathways.push(this.createPathwayFromSteps(startNode, [...steps]));
      } else {
        for (const edgeId of edgeIds) {
          const edge = this.graph.edges.get(edgeId);
          if (edge && !visited.has(edge.target)) {
            dfs(edge.target, [...steps], depth + 1);
          }
        }
      }

      visited.delete(currentId);
    };

    dfs(startNode, [], 0);
    return pathways;
  }

  /**
   * Find the shortest path between two nodes using BFS
   */
  findShortestPath(startNode: string, endNode: string): PathwayAnalysis | null {
    if (startNode === endNode) {
      return this.generatePathway(startNode, endNode);
    }

    const visited = new Set<string>();
    const queue: Array<{ nodeId: string; steps: PathwayStep[] }> = [
      { nodeId: startNode, steps: [] },
    ];

    while (queue.length > 0) {
      const { nodeId, steps } = queue.shift()!;

      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      const node = this.graph.nodes.get(nodeId);
      if (!node) continue;

      const step: PathwayStep = {
        nodeId: node.id,
        nodeType: node.type,
        name: node.name,
        description: node.description,
        duration: this.getDuration(node),
        difficulty: node.difficulty,
        requirements: this.getRequirements(node),
        alternatives: this.getAlternatives(node),
        optionalityAtThisStep: this.calculateNodeOptionality(node.id),
      };
      steps.push(step);

      if (nodeId === endNode) {
        return this.createPathwayFromSteps(startNode, steps, endNode);
      }

      const edgeIds = this.graph.adjacencyList.get(nodeId) || [];
      for (const edgeId of edgeIds) {
        const edge = this.graph.edges.get(edgeId);
        if (edge && !visited.has(edge.target)) {
          queue.push({ nodeId: edge.target, steps: [...steps] });
        }
      }
    }

    return null;
  }

  /**
   * Find paths with minimum optionality score
   */
  findPathsByOptionality(startNode: string, minOptionality: number): PathwayAnalysis[] {
    const allPaths = this.generateAllPathways(startNode, 4);
    return allPaths.filter(path => path.optionalityScore >= minOptionality);
  }

  /**
   * Analyze optionality at a specific node
   */
  analyzeOptionality(nodeId: string): OptionalityAnalysis {
    const directTransitions = this.graph.adjacencyList.get(nodeId)?.length || 0;
    const pivotOpportunities = this.findPivotOpportunities(nodeId);
    const futurePathCount = this.countFuturePaths(nodeId);

    return {
      nodeId,
      futurePathCount,
      directTransitions,
      indirectTransitions: futurePathCount - directTransitions,
      pivotOpportunities,
      alternativeRoutes: [],
      pathFlexibility: this.calculatePathFlexibility(nodeId),
      futureOpportunityBreadth: this.calculateOpportunityBreadth(nodeId),
      lockInLevel: this.determineLockInLevel(nodeId),
      reversibility: this.determineReversibility(nodeId),
    };
  }

  /**
   * Find pivot opportunities from a node
   */
  private findPivotOpportunities(nodeId: string): string[] {
    const pivots: string[] = [];
    const visited = new Set<string>();
    const queue: Array<{ nodeId: string; depth: number }> = [{ nodeId, depth: 0 }];

    while (queue.length > 0) {
      const { nodeId: currentId, depth } = queue.shift()!;

      if (depth > 2) continue;
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const edgeIds = this.graph.adjacencyList.get(currentId) || [];
      for (const edgeId of edgeIds) {
        const edge = this.graph.edges.get(edgeId);
        if (edge) {
          if (edge.type === 'PIVOT_PATH' || edge.type === 'COMMON_TRANSITION') {
            pivots.push(edge.target);
          }
          queue.push({ nodeId: edge.target, depth: depth + 1 });
        }
      }
    }

    return [...new Set(pivots)];
  }

  /**
   * Helper methods
   */
  private getDuration(node: OpportunityNode): number {
    if ('duration' in node && typeof node.duration === 'number') {
      return node.duration;
    }
    return 0;
  }

  private getRequirements(node: OpportunityNode): string[] {
    const requirements: string[] = [];

    if (node.type === 'DEGREE' && 'entranceExams' in node) {
      requirements.push(...(node as any).entranceExams);
    }
    if (node.type === 'EXAM' && 'eligibilityCriteria' in node) {
      requirements.push(...(node as any).eligibilityCriteria);
    }

    return requirements;
  }

  private getAlternatives(node: OpportunityNode): string[] {
    if (node.type === 'EXAM' && 'alternativeExams' in node) {
      return (node as any).alternativeExams;
    }
    return [];
  }

  private calculateTotalCost(steps: PathwayStep[]): { min: number; max: number; currency: 'INR' | 'USD' | 'EUR'; period: 'TOTAL' | 'PER_YEAR' | 'PER_SEMESTER' } {
    let totalMin = 0;
    let totalMax = 0;

    for (const step of steps) {
      const node = this.graph.nodes.get(step.nodeId);
      if (node && 'costRange' in node) {
        const cost = (node as any).costRange;
        if (cost) {
          totalMin += cost.min;
          totalMax += cost.max;
        }
      }
    }

    return {
      min: totalMin,
      max: totalMax,
      currency: 'INR',
      period: 'TOTAL',
    };
  }

  private calculateOverallDifficulty(steps: PathwayStep[]): DifficultyLevel {
    const difficultyScores: Record<DifficultyLevel, number> = {
      'VERY_EASY': 1,
      'EASY': 2,
      'MODERATE': 3,
      'DIFFICULT': 4,
      'VERY_DIFFICULT': 5,
    };

    let totalScore = 0;
    let count = 0;

    for (const step of steps) {
      if (step.difficulty) {
        totalScore += difficultyScores[step.difficulty];
        count++;
      }
    }

    if (count === 0) return 'MODERATE';

    const avgScore = totalScore / count;

    if (avgScore <= 1.5) return 'VERY_EASY';
    if (avgScore <= 2.5) return 'EASY';
    if (avgScore <= 3.5) return 'MODERATE';
    if (avgScore <= 4.5) return 'DIFFICULT';
    return 'VERY_DIFFICULT';
  }

  private calculatePathwayOptionality(steps: PathwayStep[]): number {
    if (steps.length === 0) return 0;
    const optionalitySum = steps.reduce((sum, step) => sum + (step.optionalityAtThisStep || 0), 0);
    return optionalitySum / steps.length;
  }

  private calculateNodeOptionality(nodeId: string): number {
    const reachableNodes = new Set<string>();
    const queue: Array<{ nodeId: string; depth: number }> = [{ nodeId, depth: 0 }];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const { nodeId: currentId, depth } = queue.shift()!;

      if (depth > 3) continue;
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      reachableNodes.add(currentId);

      const edgeIds = this.graph.adjacencyList.get(currentId) || [];
      for (const edgeId of edgeIds) {
        const edge = this.graph.edges.get(edgeId);
        if (edge) {
          queue.push({ nodeId: edge.target, depth: depth + 1 });
        }
      }
    }

    return Math.min(reachableNodes.size / 30, 1);
  }

  private countFuturePaths(nodeId: string): number {
    const reachableNodes = new Set<string>();
    const queue: Array<{ nodeId: string; depth: number }> = [{ nodeId, depth: 0 }];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const { nodeId: currentId, depth } = queue.shift()!;

      if (depth > 4) continue;
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      reachableNodes.add(currentId);

      const edgeIds = this.graph.adjacencyList.get(currentId) || [];
      for (const edgeId of edgeIds) {
        const edge = this.graph.edges.get(edgeId);
        if (edge) {
          queue.push({ nodeId: edge.target, depth: depth + 1 });
        }
      }
    }

    return reachableNodes.size - 1; // Exclude the start node
  }

  private countPivotOpportunities(steps: PathwayStep[]): number {
    let pivotCount = 0;

    for (const step of steps) {
      const edgeIds = this.graph.adjacencyList.get(step.nodeId) || [];
      for (const edgeId of edgeIds) {
        const edge = this.graph.edges.get(edgeId);
        if (edge && (edge.type === 'PIVOT_PATH' || edge.type === 'COMMON_TRANSITION')) {
          pivotCount++;
        }
      }
    }

    return pivotCount;
  }

  private identifyRiskFactors(steps: PathwayStep[]): string[] {
    const risks: string[] = [];

    for (const step of steps) {
      const node = this.graph.nodes.get(step.nodeId);
      if (!node) continue;

      if (node.type === 'EXAM') {
        const exam = node as any;
        if (exam.competitionLevel === 'EXTREME' || exam.competitionLevel === 'VERY_HIGH') {
          risks.push(`High competition for ${node.name}`);
        }
      }

      if (node.type === 'DEGREE' && (node as any).lockInLevel === 'HIGH') {
        risks.push(`High lock-in for ${node.name}`);
      }
    }

    return risks;
  }

  private generateRecommendation(steps: PathwayStep[]): string {
    if (steps.length === 0) return 'No pathway generated';

    const optionality = this.calculatePathwayOptionality(steps);
    const difficulty = this.calculateOverallDifficulty(steps);

    if (optionality > 0.7 && difficulty !== 'VERY_DIFFICULT') {
      return 'This pathway offers excellent future flexibility with manageable difficulty.';
    } else if (optionality > 0.5) {
      return 'This pathway offers good future opportunities.';
    } else if (difficulty === 'VERY_DIFFICULT') {
      return 'This is a challenging pathway. Ensure strong preparation.';
    } else {
      return 'Consider exploring alternative pathways for more flexibility.';
    }
  }

  private createPathwayFromSteps(startNode: string, steps: PathwayStep[], endNode?: string): PathwayAnalysis {
    const totalDuration = steps.reduce((sum, step) => sum + (step.duration || 0), 0);
    const pathNodeIds = steps.map(step => step.nodeId).join('-');

    return {
      id: `pathway-${pathNodeIds || startNode}`,
      startNode,
      endNode: endNode || steps[steps.length - 1]?.nodeId,
      steps,
      totalDuration,
      totalCost: this.calculateTotalCost(steps),
      difficulty: this.calculateOverallDifficulty(steps),
      optionalityScore: this.calculatePathwayOptionality(steps),
      futurePathCount: this.countFuturePaths(startNode),
      pivotOpportunities: this.countPivotOpportunities(steps),
      alternativeRoutes: [],
      riskFactors: this.identifyRiskFactors(steps),
      recommendation: this.generateRecommendation(steps),
    };
  }

  private calculatePathFlexibility(nodeId: string): number {
    const node = this.graph.nodes.get(nodeId);
    if (node && 'optionalityScore' in node && typeof node.optionalityScore === 'number') {
      return node.optionalityScore;
    }

    const transitions = this.graph.adjacencyList.get(nodeId)?.length || 0;
    return Math.min(transitions / 5, 1);
  }

  private calculateOpportunityBreadth(nodeId: string): number {
    const uniqueTypes = new Set<string>();
    const visited = new Set<string>();
    const queue: Array<{ nodeId: string; depth: number }> = [{ nodeId, depth: 0 }];

    while (queue.length > 0) {
      const { nodeId: currentId, depth } = queue.shift()!;

      if (depth > 3) continue;
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const node = this.graph.nodes.get(currentId);
      if (node) {
        uniqueTypes.add(node.type);
      }

      const edgeIds = this.graph.adjacencyList.get(currentId) || [];
      for (const edgeId of edgeIds) {
        const edge = this.graph.edges.get(edgeId);
        if (edge) {
          queue.push({ nodeId: edge.target, depth: depth + 1 });
        }
      }
    }

    return Math.min(uniqueTypes.size / 8, 1);
  }

  private determineLockInLevel(nodeId: string): 'LOW' | 'MEDIUM' | 'HIGH' {
    const node = this.graph.nodes.get(nodeId);
    if (!node) return 'MEDIUM';

    if (node.type === 'DEGREE' && (node as any).lockInLevel) {
      return (node as any).lockInLevel;
    }

    const transitions = this.graph.adjacencyList.get(nodeId)?.length || 0;
    if (transitions > 4) return 'LOW';
    if (transitions > 2) return 'MEDIUM';
    return 'HIGH';
  }

  private determineReversibility(nodeId: string): 'EASY' | 'MODERATE' | 'DIFFICULT' | 'IMPOSSIBLE' {
    const lockIn = this.determineLockInLevel(nodeId);

    switch (lockIn) {
      case 'LOW':
        return 'EASY';
      case 'MEDIUM':
        return 'MODERATE';
      case 'HIGH':
        return 'DIFFICULT';
      default:
        return 'MODERATE';
    }
  }
}

/**
 * Create a new PathwayEngine instance
 */
export function createPathwayEngine(graph: OpportunityGraph): PathwayEngine {
  return new PathwayEngine(graph);
}

/**
 * Generate a simple pathway from start to end
 */
export function generatePathway(
  graph: OpportunityGraph,
  startNode: string,
  endNode?: string
): PathwayAnalysis {
  const engine = new PathwayEngine(graph);
  return engine.generatePathway(startNode, endNode);
}

/**
 * Find all pathways from a start node
 */
export function findAllPathways(
  graph: OpportunityGraph,
  startNode: string,
  maxDepth: number = 5
): PathwayAnalysis[] {
  const engine = new PathwayEngine(graph);
  return engine.generateAllPathways(startNode, maxDepth);
}

/**
 * Find the shortest path between two nodes
 */
export function findShortestPath(
  graph: OpportunityGraph,
  startNode: string,
  endNode: string
): PathwayAnalysis | null {
  const engine = new PathwayEngine(graph);
  return engine.findShortestPath(startNode, endNode);
}
