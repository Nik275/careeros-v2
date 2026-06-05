/**
 * Career Cascade Engine
 *
 * Calculates: Decision → Consequence → Future Decisions
 * Models the chain reaction of career choices.
 */

import {
  CareerGraph,
  CareerNode,
  CareerEdge,
  NodeId,
  CareerCascade,
  CascadeStage,
  CascadeDecision,
  CascadeOutcome,
  OptionalityScore,
} from './career-graph-types';

import { OptionalityEngine } from './optionality-engine';

export interface CascadeEngineOptions {
  maxStages: number;
  probabilityThreshold: number;
  includeOutcomes: boolean;
}

export const DEFAULT_CASCADE_OPTIONS: CascadeEngineOptions = {
  maxStages: 8,
  probabilityThreshold: 0.1,
  includeOutcomes: true,
};

export class CareerCascadeEngine {
  private graph: CareerGraph;
  private optionalityEngine: OptionalityEngine;
  private options: CascadeEngineOptions;

  constructor(graph: CareerGraph, options: Partial<CascadeEngineOptions> = {}) {
    this.graph = graph;
    this.optionalityEngine = new OptionalityEngine(graph);
    this.options = { ...DEFAULT_CASCADE_OPTIONS, ...options };
  }

  /**
   * Generate career cascade from a starting node
   */
  generateCascade(startNodeId: NodeId): CareerCascade {
    const startNode = this.graph.nodes.get(startNodeId);
    if (!startNode) {
      throw new Error(`Node not found: ${startNodeId}`);
    }

    const stages = this.buildCascadeStages(startNodeId);
    const finalOutcomes = this.options.includeOutcomes
      ? this.calculateFinalOutcomes(stages)
      : [];

    const totalTimeline = stages.reduce((sum, stage) => sum + stage.duration, 0);

    return {
      id: `cascade-${startNodeId}-${Date.now()}`,
      startNodeId,
      generatedAt: Date.now(),
      stages,
      totalStages: stages.length,
      typicalTimeline: totalTimeline,
      finalOutcomes,
    };
  }

  /**
   * Build cascade stages
   */
  private buildCascadeStages(startNodeId: NodeId): CascadeStage[] {
    const stages: CascadeStage[] = [];
    const visited = new Set<NodeId>();
    const queue: Array<{ nodeId: NodeId; order: number; age: number }> = [
      { nodeId: startNodeId, order: 0, age: 16 },
    ];

    while (queue.length > 0 && stages.length < this.options.maxStages) {
      const { nodeId, order, age } = queue.shift()!;

      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      const node = this.graph.nodes.get(nodeId);
      if (!node) continue;

      const edges = this.getOutgoingEdges(nodeId);
      const decisions = this.extractDecisions(edges);

      // Determine what this stage opens and restricts
      const opens = edges.filter(e => e.type === 'opens').map(e => e.to);
      const restricts = edges.filter(e => e.type === 'restricts').map(e => e.to);

      const stage: CascadeStage = {
        order,
        nodeId,
        name: node.name,
        opens,
        restricts,
        isDecisionPoint: decisions.length > 1,
        decisions,
        typicalAge: age,
        duration: node.typicalDuration,
      };

      stages.push(stage);

      // Queue next stages
      for (const edge of edges) {
        if (!visited.has(edge.to) && edge.probability >= this.options.probabilityThreshold) {
          queue.push({
            nodeId: edge.to,
            order: order + 1,
            age: age + node.typicalDuration / 12,
          });
        }
      }
    }

    return stages.sort((a, b) => a.order - b.order);
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
   * Extract decision points from edges
   */
  private extractDecisions(edges: CareerEdge[]): CascadeDecision[] {
    return edges
      .filter(edge => edge.probability >= this.options.probabilityThreshold)
      .map(edge => {
        const targetNode = this.graph.nodes.get(edge.to);
        return {
          id: `decision-${edge.id}`,
          name: targetNode?.name || edge.to,
          description: this.generateDecisionDescription(edge, targetNode),
          leadsTo: [edge.to],
          probability: edge.probability,
        };
      })
      .sort((a, b) => b.probability - a.probability);
  }

  /**
   * Generate decision description
   */
  private generateDecisionDescription(edge: CareerEdge, targetNode?: CareerNode): string {
    const descriptions: Record<string, string> = {
      'opens': `Transition to ${targetNode?.name || 'new opportunity'}`,
      'restricts': `Commit to ${targetNode?.name || 'specialized path'}`,
      'accelerates': `Fast-track to ${targetNode?.name || 'advanced position'}`,
      'delays': `Extended path to ${targetNode?.name || 'goal'}`,
      'requires': `Required step: ${targetNode?.name || 'prerequisite'}`,
      'enables': `Enables ${targetNode?.name || 'future opportunities'}`,
    };

    return descriptions[edge.type] || `Move to ${targetNode?.name || 'next stage'}`;
  }

  /**
   * Calculate final outcomes from cascade stages
   */
  private calculateFinalOutcomes(stages: CascadeStage[]): CascadeOutcome[] {
    const outcomes: CascadeOutcome[] = [];

    // Get final stages (those with no further decisions)
    const finalStages = stages.filter(
      stage => stage.order === Math.max(...stages.map(s => s.order))
    );

    for (const stage of finalStages) {
      const node = this.graph.nodes.get(stage.nodeId);
      if (!node) continue;

      // Build path to this outcome
      const path = this.buildPathToStage(stage, stages);

      // Calculate optionality
      const optionality = this.optionalityEngine.calculateOptionality(stage.nodeId);

      // Calculate probability of reaching this outcome
      const probability = this.calculatePathProbability(path);

      outcomes.push({
        nodeId: stage.nodeId,
        path,
        probability,
        optionality,
        earningPotential: node.earningPotential.senior,
        workLifeBalance: this.estimateWorkLifeBalance(node),
        growthPotential: this.calculateGrowthPotential(node),
      });
    }

    return outcomes.sort((a, b) => b.probability - a.probability);
  }

  /**
   * Build path to a stage
   */
  private buildPathToStage(targetStage: CascadeStage, allStages: CascadeStage[]): NodeId[] {
    const path: NodeId[] = [];
    const stageMap = new Map(allStages.map(s => [s.nodeId, s]));

    // Simple path reconstruction - assumes linear progression
    for (let i = 0; i <= targetStage.order; i++) {
      const stage = allStages.find(s => s.order === i);
      if (stage) {
        path.push(stage.nodeId);
      }
    }

    return path;
  }

  /**
   * Calculate probability of a path
   */
  private calculatePathProbability(path: NodeId[]): number {
    let probability = 1.0;

    for (let i = 0; i < path.length - 1; i++) {
      const fromId = path[i];
      const toId = path[i + 1];

      const edge = this.findEdge(fromId, toId);
      if (edge) {
        probability *= edge.probability;
      } else {
        probability *= 0.5; // Unknown transition
      }
    }

    return probability;
  }

  /**
   * Find edge between two nodes
   */
  private findEdge(fromId: NodeId, toId: NodeId): CareerEdge | undefined {
    const edges = this.getOutgoingEdges(fromId);
    return edges.find(e => e.to === toId);
  }

  /**
   * Estimate work-life balance
   */
  private estimateWorkLifeBalance(node: CareerNode): number {
    let score = 60; // Base

    // Leadership roles often have lower work-life balance
    if (node.type === 'leadership-track') score -= 15;

    // Entrepreneurship is demanding
    if (node.type === 'entrepreneurship-path') score -= 20;

    // Specialized medical fields
    if (node.name.toLowerCase().includes('surgeon')) score -= 15;
    if (node.name.toLowerCase().includes('doctor')) score -= 10;

    // Government jobs often better balance
    if (node.name.toLowerCase().includes('civil services') ||
        node.name.toLowerCase().includes('ias') ||
        node.name.toLowerCase().includes('government')) {
      score += 10;
    }

    // Teaching and academics
    if (node.name.toLowerCase().includes('professor') ||
        node.name.toLowerCase().includes('teacher')) {
      score += 15;
    }

    return Math.max(20, Math.min(90, score));
  }

  /**
   * Calculate growth potential
   */
  private calculateGrowthPotential(node: CareerNode): number {
    const growthScores: Record<string, number> = {
      'strong-growth': 90,
      'growth': 75,
      'stable': 50,
      'declining': 30,
      'strong-decline': 10,
    };

    let score = growthScores[node.growthOutlook] || 50;

    // Leadership and entrepreneurship have high growth
    if (node.type === 'leadership-track') score += 10;
    if (node.type === 'entrepreneurship-path') score += 15;

    return Math.min(100, score);
  }

  /**
   * Compare cascades for multiple starting nodes
   */
  compareCascades(nodeIds: NodeId[]): Array<{
    nodeId: NodeId;
    nodeName: string;
    totalStages: number;
    typicalTimeline: number;
    outcomeCount: number;
    avgOutcomeProbability: number;
    summary: string;
  }> {
    return nodeIds.map(nodeId => {
      const cascade = this.generateCascade(nodeId);
      const node = this.graph.nodes.get(nodeId);

      const avgProbability =
        cascade.finalOutcomes.reduce((sum, o) => sum + o.probability, 0) /
        Math.max(1, cascade.finalOutcomes.length);

      return {
        nodeId,
        nodeName: node?.name || nodeId,
        totalStages: cascade.totalStages,
        typicalTimeline: cascade.typicalTimeline,
        outcomeCount: cascade.finalOutcomes.length,
        avgOutcomeProbability: avgProbability,
        summary: this.generateCascadeSummary(cascade),
      };
    });
  }

  /**
   * Generate human-readable cascade summary
   */
  private generateCascadeSummary(cascade: CareerCascade): string {
    const stages = cascade.stages;
    if (stages.length === 0) return 'Empty cascade';

    const path = stages.map(s => s.name).join(' → ');
    const timeline = (cascade.typicalTimeline / 12).toFixed(1);

    return `${path} (${timeline} years, ${cascade.finalOutcomes.length} possible outcomes)`;
  }

  /**
   * Find critical decision points in a cascade
   */
  findCriticalDecisionPoints(startNodeId: NodeId): Array<{
    stage: CascadeStage;
    importance: 'low' | 'medium' | 'high' | 'critical';
    rationale: string;
  }> {
    const cascade = this.generateCascade(startNodeId);
    const criticalPoints: Array<{ stage: CascadeStage; importance: 'low' | 'medium' | 'high' | 'critical'; rationale: string }> = [];

    for (const stage of cascade.stages) {
      if (!stage.isDecisionPoint) continue;

      let importance: 'low' | 'medium' | 'high' | 'critical' = 'medium';
      let rationale = 'Decision point with multiple options';

      // High importance if many options
      if (stage.decisions.length >= 4) {
        importance = 'high';
        rationale = 'Multiple divergent paths available';
      }

      // Critical if irreversible
      const edges = this.getOutgoingEdges(stage.nodeId);
      const hasIrreversible = edges.some(e => e.reversibilityScore < 30);
      if (hasIrreversible) {
        importance = 'critical';
        rationale = 'Contains difficult-to-reverse decisions';
      }

      // Early decisions often more critical
      if (stage.order <= 1 && stage.decisions.length >= 2) {
        importance = importance === 'critical' ? 'critical' : 'high';
        rationale += '; Early decision with long-term impact';
      }

      criticalPoints.push({ stage, importance, rationale });
    }

    return criticalPoints.sort((a, b) => {
      const importanceOrder = { critical: 3, high: 2, medium: 1, low: 0 };
      return importanceOrder[b.importance] - importanceOrder[a.importance];
    });
  }

  /**
   * Update graph reference
   */
  updateGraph(graph: CareerGraph): void {
    this.graph = graph;
    this.optionalityEngine.updateGraph(graph);
  }
}
