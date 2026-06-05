/**
 * Optionality Engine
 *
 * Measures "How many future opportunities remain available?"
 * Outputs an OptionalityScore (0-100) for any career decision.
 */

import {
  CareerGraph,
  CareerNode,
  CareerEdge,
  NodeId,
  OptionalityScore,
  Score,
  EdgeType,
} from './career-graph-types';

export interface OptionalityEngineOptions {
  careerOptionWeight: number;
  industryOptionWeight: number;
  roleOptionWeight: number;
  pivotOptionWeight: number;
  depthLimit: number;
}

export const DEFAULT_OPTIONALITY_OPTIONS: OptionalityEngineOptions = {
  careerOptionWeight: 0.30,
  industryOptionWeight: 0.25,
  roleOptionWeight: 0.25,
  pivotOptionWeight: 0.20,
  depthLimit: 4,
};

export interface OptionalityBreakdown {
  careerOptions: string[];
  industryOptions: string[];
  roleOptions: string[];
  pivotOptions: Array<{ nodeId: NodeId; reversibility: Score }>;
}

export class OptionalityEngine {
  private graph: CareerGraph;
  private options: OptionalityEngineOptions;

  constructor(graph: CareerGraph, options: Partial<OptionalityEngineOptions> = {}) {
    this.graph = graph;
    this.options = { ...DEFAULT_OPTIONALITY_OPTIONS, ...options };
  }

  /**
   * Calculate optionality score for a node
   */
  calculateOptionality(nodeId: NodeId): OptionalityScore {
    const node = this.graph.nodes.get(nodeId);
    if (!node) {
      return this.createEmptyScore();
    }

    const breakdown = this.analyzeOptionality(nodeId);
    const reachable = this.getReachableNodes(nodeId, this.options.depthLimit);

    // Calculate component scores
    const careerScore = Math.min(100, breakdown.careerOptions.length * 15);
    const industryScore = Math.min(100, breakdown.industryOptions.length * 12);
    const roleScore = Math.min(100, breakdown.roleOptions.length * 10);
    const pivotScore = Math.min(100, breakdown.pivotOptions.length * 8);

    // Weighted total
    const totalScore = Math.round(
      careerScore * this.options.careerOptionWeight +
      industryScore * this.options.industryOptionWeight +
      roleScore * this.options.roleOptionWeight +
      pivotScore * this.options.pivotOptionWeight
    );

    // Calculate time-based optionality
    const timeBasedOptionality = this.calculateTimeBasedOptionality(nodeId, reachable);

    // Identify factors
    const contributingFactors = this.identifyContributingFactors(node, breakdown);
    const limitingFactors = this.identifyLimitingFactors(node, breakdown);

    return {
      score: totalScore,
      careerOptions: breakdown.careerOptions.length,
      industryOptions: breakdown.industryOptions.length,
      roleOptions: breakdown.roleOptions.length,
      pivotOptions: breakdown.pivotOptions.length,
      nearTermOptionality: timeBasedOptionality.nearTerm,
      mediumTermOptionality: timeBasedOptionality.mediumTerm,
      longTermOptionality: timeBasedOptionality.longTerm,
      contributingFactors,
      limitingFactors,
      percentileRank: this.calculatePercentile(nodeId, totalScore),
    };
  }

  /**
   * Analyze optionality breakdown
   */
  private analyzeOptionality(nodeId: NodeId): OptionalityBreakdown {
    const reachable = this.getReachableNodes(nodeId, this.options.depthLimit);

    const careerOptions: string[] = [];
    const industryOptions: string[] = [];
    const roleOptions: string[] = [];
    const pivotOptions: Array<{ nodeId: NodeId; reversibility: Score }> = [];

    for (const [reachableId] of Array.from(reachable)) {
      const node = this.graph.nodes.get(reachableId);
      if (!node) continue;

      if (node.type === 'career' && !careerOptions.includes(node.name)) {
        careerOptions.push(node.name);
      }
      if (node.type === 'industry' && !industryOptions.includes(node.name)) {
        industryOptions.push(node.name);
      }
      if ((node.type === 'role' || node.type === 'leadership-track') && !roleOptions.includes(node.name)) {
        roleOptions.push(node.name);
      }

      // Check reversibility for pivot options
      const edge = this.findEdge(nodeId, reachableId);
      if (edge) {
        pivotOptions.push({
          nodeId: reachableId,
          reversibility: edge.reversibilityScore,
        });
      }
    }

    return {
      careerOptions,
      industryOptions,
      roleOptions,
      pivotOptions,
    };
  }

  /**
   * Get reachable nodes within depth limit
   */
  private getReachableNodes(startNodeId: NodeId, maxDepth: number): Map<NodeId, number> {
    const reachable = new Map<NodeId, number>();
    const visited = new Set<NodeId>();
    const queue: Array<{ nodeId: NodeId; depth: number }> = [{ nodeId: startNodeId, depth: 0 }];

    while (queue.length > 0) {
      const { nodeId, depth } = queue.shift()!;

      if (visited.has(nodeId) || depth > maxDepth) continue;
      visited.add(nodeId);

      if (nodeId !== startNodeId) {
        reachable.set(nodeId, depth);
      }

      const edges = this.getOutgoingEdges(nodeId);
      for (const edge of edges) {
        if (!visited.has(edge.to) && edge.type !== 'blocks') {
          queue.push({ nodeId: edge.to, depth: depth + 1 });
        }
      }
    }

    return reachable;
  }

  /**
   * Get outgoing edges from a node
   */
  private getOutgoingEdges(nodeId: NodeId): CareerEdge[] {
    const edgeIds = this.graph.edgesFrom.get(nodeId) || [];
    return edgeIds
      .map(id => this.graph.edges.get(id))
      .filter((edge): edge is CareerEdge => edge !== undefined);
  }

  /**
   * Find edge between two nodes
   */
  private findEdge(fromId: NodeId, toId: NodeId): CareerEdge | undefined {
    const edges = this.getOutgoingEdges(fromId);
    return edges.find(e => e.to === toId);
  }

  /**
   * Calculate time-based optionality
   */
  private calculateTimeBasedOptionality(
    nodeId: NodeId,
    reachable: Map<NodeId, number>
  ): {
    nearTerm: Score;
    mediumTerm: Score;
    longTerm: Score;
  } {
    let nearTermCount = 0;
    let mediumTermCount = 0;
    let longTermCount = 0;

    for (const [reachableId, depth] of Array.from(reachable)) {
      const node = this.graph.nodes.get(reachableId);
      if (!node || !this.isCareerNode(node.type)) continue;

      if (depth <= 1) nearTermCount++;
      else if (depth <= 2) mediumTermCount++;
      else longTermCount++;
    }

    return {
      nearTerm: Math.min(100, nearTermCount * 20),
      mediumTerm: Math.min(100, mediumTermCount * 15),
      longTerm: Math.min(100, longTermCount * 10),
    };
  }

  /**
   * Check if node type is a career node
   */
  private isCareerNode(type: string): boolean {
    return ['career', 'industry', 'role', 'leadership-track', 'entrepreneurship-path', 'specialization'].includes(type);
  }

  /**
   * Identify contributing factors to optionality
   */
  private identifyContributingFactors(node: CareerNode, breakdown: OptionalityBreakdown): string[] {
    const factors: string[] = [];

    if (breakdown.careerOptions.length >= 5) {
      factors.push('Multiple career paths available');
    }
    if (breakdown.industryOptions.length >= 3) {
      factors.push('Cross-industry mobility');
    }
    if (breakdown.pivotOptions.some(p => p.reversibility >= 70)) {
      factors.push('Reversible transitions');
    }
    if (node.growthOutlook === 'strong-growth' || node.growthOutlook === 'growth') {
      factors.push('Growing field');
    }
    if (node.type === 'subject-choice' && node.name.includes('PCM')) {
      factors.push('Science foundation enables many paths');
    }

    return factors;
  }

  /**
   * Identify limiting factors
   */
  private identifyLimitingFactors(node: CareerNode, breakdown: OptionalityBreakdown): string[] {
    const factors: string[] = [];

    if (breakdown.careerOptions.length <= 2) {
      factors.push('Limited career paths');
    }
    if (breakdown.pivotOptions.every(p => p.reversibility < 40)) {
      factors.push('Difficult to reverse decisions');
    }
    if (node.growthOutlook === 'declining' || node.growthOutlook === 'strong-decline') {
      factors.push('Declining industry');
    }
    if (node.type === 'specialization') {
      factors.push('Specialized path limits options');
    }
    if (node.prerequisites.length > 3) {
      factors.push('High prerequisites reduce flexibility');
    }

    return factors;
  }

  /**
   * Calculate percentile rank
   */
  private calculatePercentile(nodeId: NodeId, score: Score): number {
    let higherCount = 0;
    let totalCount = 0;

    for (const [id, node] of Array.from(this.graph.nodes)) {
      if (this.isCareerNode(node.type)) {
        totalCount++;
        const nodeScore = this.quickScoreEstimate(node);
        if (nodeScore > score && id !== nodeId) {
          higherCount++;
        }
      }
    }

    if (totalCount === 0) return 50;
    return Math.round(((totalCount - higherCount) / totalCount) * 100);
  }

  /**
   * Quick score estimate for percentile calculation
   */
  private quickScoreEstimate(node: CareerNode): Score {
    let score = 50;

    if (node.type === 'subject-choice') score += 30;
    if (node.type === 'degree-choice') score += 20;
    if (node.type === 'specialization') score -= 20;

    const edges = this.getOutgoingEdges(node.id);
    score += Math.min(30, edges.length * 5);

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Compare optionality across multiple nodes
   */
  compareOptionality(nodeIds: NodeId[]): Array<{
    nodeId: NodeId;
    nodeName: string;
    score: Score;
    percentile: number;
    careerOptions: number;
    keyFactor: string;
  }> {
    return nodeIds.map(nodeId => {
      const score = this.calculateOptionality(nodeId);
      const node = this.graph.nodes.get(nodeId);

      return {
        nodeId,
        nodeName: node?.name || nodeId,
        score: score.score,
        percentile: score.percentileRank,
        careerOptions: score.careerOptions,
        keyFactor: score.contributingFactors[0] || score.limitingFactors[0] || 'Standard optionality',
      };
    }).sort((a, b) => b.score - a.score);
  }

  /**
   * Find high-optionality nodes
   */
  findHighOptionalityNodes(minScore: Score = 70, limit: number = 10): Array<{
    nodeId: NodeId;
    nodeName: string;
    score: Score;
    type: string;
  }> {
    const results: Array<{ nodeId: NodeId; nodeName: string; score: Score; type: string }> = [];

    for (const [nodeId, node] of Array.from(this.graph.nodes)) {
      if (this.isCareerNode(node.type)) {
        const score = this.calculateOptionality(nodeId);
        if (score.score >= minScore) {
          results.push({
            nodeId,
            nodeName: node.name,
            score: score.score,
            type: node.type,
          });
        }
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Find low-optionality nodes (for warnings)
   */
  findLowOptionalityNodes(maxScore: Score = 40, limit: number = 10): Array<{
    nodeId: NodeId;
    nodeName: string;
    score: Score;
    warning: string;
  }> {
    const results: Array<{ nodeId: NodeId; nodeName: string; score: Score; warning: string }> = [];

    for (const [nodeId, node] of Array.from(this.graph.nodes)) {
      if (this.isCareerNode(node.type)) {
        const score = this.calculateOptionality(nodeId);
        if (score.score <= maxScore) {
          results.push({
            nodeId,
            nodeName: node.name,
            score: score.score,
            warning: score.limitingFactors[0] || 'Limited future options',
          });
        }
      }
    }

    return results
      .sort((a, b) => a.score - b.score)
      .slice(0, limit);
  }

  /**
   * Create empty optionality score
   */
  private createEmptyScore(): OptionalityScore {
    return {
      score: 0,
      careerOptions: 0,
      industryOptions: 0,
      roleOptions: 0,
      pivotOptions: 0,
      nearTermOptionality: 0,
      mediumTermOptionality: 0,
      longTermOptionality: 0,
      contributingFactors: [],
      limitingFactors: ['Node not found'],
      percentileRank: 0,
    };
  }

  /**
   * Update graph reference
   */
  updateGraph(graph: CareerGraph): void {
    this.graph = graph;
  }
}
