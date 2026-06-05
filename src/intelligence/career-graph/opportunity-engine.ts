/**
 * Opportunity Engine
 *
 * Calculates future opportunities unlocked by a career decision.
 * Maps near-term, medium-term, and long-term opportunities.
 */

import {
  CareerGraph,
  CareerNode,
  CareerEdge,
  NodeId,
  Opportunity,
  OpportunityMap,
  OpportunityTimeframe,
  Score,
  Probability,
} from './career-graph-types';

export interface OpportunityEngineOptions {
  nearTermMonths: number;
  mediumTermMonths: number;
  longTermMonths: number;
  qualityThreshold: Score;
  accessibilityThreshold: Score;
}

export const DEFAULT_OPPORTUNITY_OPTIONS: OpportunityEngineOptions = {
  nearTermMonths: 24,
  mediumTermMonths: 60,
  longTermMonths: 120,
  qualityThreshold: 50,
  accessibilityThreshold: 40,
};

export interface OpportunityContext {
  currentSkills: string[];
  completedNodes: NodeId[];
  preferences: {
    industries: string[];
    roles: string[];
    locations: string[];
  };
  constraints: {
    maxCost: number;
    maxTime: number;
  };
}

export class OpportunityEngine {
  private graph: CareerGraph;
  private options: OpportunityEngineOptions;

  constructor(graph: CareerGraph, options: Partial<OpportunityEngineOptions> = {}) {
    this.graph = graph;
    this.options = { ...DEFAULT_OPPORTUNITY_OPTIONS, ...options };
  }

  /**
   * Calculate opportunity map for a starting node
   */
  calculateOpportunities(
    startNodeId: NodeId,
    context?: Partial<OpportunityContext>
  ): OpportunityMap {
    const nearTerm = this.findOpportunities(startNodeId, 'near-term', context);
    const mediumTerm = this.findOpportunities(startNodeId, 'medium-term', context);
    const longTerm = this.findOpportunities(startNodeId, 'long-term', context);

    const allOpportunities = [...nearTerm, ...mediumTerm, ...longTerm];
    const highQuality = allOpportunities.filter(o => o.qualityScore >= 70);
    const accessible = allOpportunities.filter(o => o.accessibility >= 60);

    return {
      nodeId: startNodeId,
      generatedAt: Date.now(),
      nearTerm,
      mediumTerm,
      longTerm,
      totalOpportunities: allOpportunities.length,
      highQualityOpportunities: highQuality.length,
      accessibleOpportunities: accessible.length,
    };
  }

  /**
   * Find opportunities for a specific timeframe
   */
  private findOpportunities(
    startNodeId: NodeId,
    timeframe: OpportunityTimeframe,
    context?: Partial<OpportunityContext>
  ): Opportunity[] {
    const maxMonths = this.getTimeframeMonths(timeframe);
    const reachableNodes = this.getReachableWithinTime(startNodeId, maxMonths);
    const opportunities: Opportunity[] = [];

    for (const [nodeId, timeToReach] of Array.from(reachableNodes)) {
      const node = this.graph.nodes.get(nodeId);
      if (!node) continue;

      // Skip non-career nodes for opportunity mapping
      if (!this.isCareerNode(node.type)) continue;

      const opportunity = this.createOpportunity(node, timeframe, timeToReach, context);
      if (opportunity.qualityScore >= this.options.qualityThreshold) {
        opportunities.push(opportunity);
      }
    }

    // Sort by quality and accessibility
    return opportunities.sort(
      (a, b) => b.qualityScore * b.accessibility - a.qualityScore * a.accessibility
    );
  }

  /**
   * Check if node type represents a career opportunity
   */
  private isCareerNode(type: string): boolean {
    return ['career', 'leadership-track', 'entrepreneurship-path', 'role', 'specialization'].includes(type);
  }

  /**
   * Create an opportunity object from a node
   */
  private createOpportunity(
    node: CareerNode,
    timeframe: OpportunityTimeframe,
    timeToReach: number,
    context?: Partial<OpportunityContext>
  ): Opportunity {
    const qualityScore = this.calculateQualityScore(node);
    const accessibility = this.calculateAccessibility(node, context);
    const likelihood = this.calculateLikelihood(node, timeToReach);

    return {
      id: `opp-${node.id}-${timeframe}`,
      nodeId: node.id,
      name: node.name,
      description: this.generateOpportunityDescription(node, timeframe),
      timeframe,
      likelihood,
      qualityScore,
      requirements: node.requiredSkills,
      prerequisites: node.prerequisites,
      earningPotential: node.earningPotential.senior,
      growthPotential: this.calculateGrowthPotential(node),
      satisfactionPotential: this.estimateSatisfaction(node),
      accessibility,
      competitionLevel: this.assessCompetition(node),
    };
  }

  /**
   * Get months for a timeframe
   */
  private getTimeframeMonths(timeframe: OpportunityTimeframe): number {
    switch (timeframe) {
      case 'near-term':
        return this.options.nearTermMonths;
      case 'medium-term':
        return this.options.mediumTermMonths;
      case 'long-term':
        return this.options.longTermMonths;
      default:
        return 24;
    }
  }

  /**
   * Get nodes reachable within a time limit
   */
  private getReachableWithinTime(startNodeId: NodeId, maxMonths: number): Map<NodeId, number> {
    const reachable = new Map<NodeId, number>();
    const visited = new Set<NodeId>();
    const queue: Array<{ nodeId: NodeId; months: number }> = [{ nodeId: startNodeId, months: 0 }];

    while (queue.length > 0) {
      const { nodeId, months } = queue.shift()!;

      if (visited.has(nodeId) || months > maxMonths) continue;
      visited.add(nodeId);

      if (nodeId !== startNodeId) {
        reachable.set(nodeId, months);
      }

      const edges = this.getOutgoingEdges(nodeId);
      for (const edge of edges) {
        if (!visited.has(edge.to)) {
          const transitionTime = edge.timeToTransition;
          queue.push({ nodeId: edge.to, months: months + transitionTime });
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
   * Calculate quality score for a node
   */
  private calculateQualityScore(node: CareerNode): Score {
    let score = 50; // Base score

    // Earnings factor (30%)
    const earningScore = Math.min(30, (node.earningPotential.senior / 1000000) * 10);
    score += earningScore;

    // Growth outlook factor (20%)
    const growthScores: Record<string, number> = {
      'strong-growth': 20,
      'growth': 15,
      'stable': 10,
      'declining': 5,
      'strong-decline': 0,
    };
    score += growthScores[node.growthOutlook] || 10;

    // Demand level factor (20%)
    const demandScores: Record<string, number> = {
      'very-high': 20,
      'high': 16,
      'medium': 12,
      'low': 6,
      'very-low': 0,
    };
    score += demandScores[node.demandLevel] || 10;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate accessibility score
   */
  private calculateAccessibility(node: CareerNode, context?: Partial<OpportunityContext>): Score {
    let score = 60; // Base accessibility

    // Cost factor (lower cost = higher accessibility)
    if (node.costRange.max > 0) {
      const costFactor = Math.max(0, 1 - node.costRange.max / 2000000);
      score += costFactor * 20;
    } else {
      score += 20;
    }

    // Prerequisites factor (fewer prerequisites = higher accessibility)
    const prereqFactor = Math.max(0, 1 - node.prerequisites.length / 5);
    score += prereqFactor * 10;

    // Skills factor (fewer required skills = higher accessibility)
    const skillsFactor = Math.max(0, 1 - node.requiredSkills.length / 10);
    score += skillsFactor * 10;

    // Context-based adjustments
    if (context?.currentSkills) {
      const matchingSkills = node.requiredSkills.filter(skill =>
        context.currentSkills!.some(s => s.toLowerCase().includes(skill.toLowerCase()))
      );
      score += (matchingSkills.length / Math.max(1, node.requiredSkills.length)) * 20;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate likelihood of reaching this opportunity
   */
  private calculateLikelihood(node: CareerNode, timeToReach: number): Probability {
    // Base likelihood based on demand and growth
    let likelihood = 0.5;

    if (node.demandLevel === 'very-high') likelihood += 0.2;
    else if (node.demandLevel === 'high') likelihood += 0.1;
    else if (node.demandLevel === 'low') likelihood -= 0.1;
    else if (node.demandLevel === 'very-low') likelihood -= 0.2;

    if (node.growthOutlook === 'strong-growth') likelihood += 0.15;
    else if (node.growthOutlook === 'growth') likelihood += 0.1;
    else if (node.growthOutlook === 'declining') likelihood -= 0.15;
    else if (node.growthOutlook === 'strong-decline') likelihood -= 0.25;

    // Time factor (longer time = more uncertainty)
    const timeFactor = Math.max(0, 1 - timeToReach / 120);
    likelihood *= 0.7 + timeFactor * 0.3;

    return Math.min(1, Math.max(0.1, likelihood));
  }

  /**
   * Calculate growth potential score
   */
  private calculateGrowthPotential(node: CareerNode): Score {
    const growthScores: Record<string, number> = {
      'strong-growth': 90,
      'growth': 75,
      'stable': 50,
      'declining': 25,
      'strong-decline': 10,
    };
    return growthScores[node.growthOutlook] || 50;
  }

  /**
   * Estimate satisfaction potential
   */
  private estimateSatisfaction(node: CareerNode): Score {
    // Estimate based on earning potential and growth
    let satisfaction = 50;

    // Higher earnings generally correlate with satisfaction
    if (node.earningPotential.senior > 10000000) satisfaction += 20;
    else if (node.earningPotential.senior > 5000000) satisfaction += 15;
    else if (node.earningPotential.senior > 2000000) satisfaction += 10;

    // Growth outlook affects satisfaction
    if (node.growthOutlook === 'strong-growth') satisfaction += 15;
    else if (node.growthOutlook === 'growth') satisfaction += 10;
    else if (node.growthOutlook === 'declining') satisfaction -= 10;
    else if (node.growthOutlook === 'strong-decline') satisfaction -= 20;

    // Leadership and entrepreneurship paths often high satisfaction
    if (node.type === 'leadership-track') satisfaction += 10;
    if (node.type === 'entrepreneurship-path') satisfaction += 5;

    return Math.min(100, Math.max(20, satisfaction));
  }

  /**
   * Assess competition level
   */
  private assessCompetition(node: CareerNode): 'low' | 'medium' | 'high' | 'very-high' {
    if (node.demandLevel === 'very-high' && node.growthOutlook === 'strong-growth') return 'low';
    if (node.demandLevel === 'high' && node.growthOutlook === 'growth') return 'medium';
    if (node.demandLevel === 'low' || node.growthOutlook === 'declining') return 'high';
    if (node.demandLevel === 'very-low' || node.growthOutlook === 'strong-decline') return 'very-high';
    return 'medium';
  }

  /**
   * Generate opportunity description
   */
  private generateOpportunityDescription(node: CareerNode, timeframe: OpportunityTimeframe): string {
    const timeframeDesc = {
      'near-term': 'within 2 years',
      'medium-term': 'in 2-5 years',
      'long-term': 'in 5+ years',
    };

    return `${node.description} ${timeframeDesc[timeframe]}. ` +
      `Senior earning potential: ₹${(node.earningPotential.senior / 100000).toFixed(1)}L. ` +
      `Growth outlook: ${node.growthOutlook.replace('-', ' ')}.`;
  }

  /**
   * Find opportunities by type
   */
  findOpportunitiesByType(
    startNodeId: NodeId,
    type: string,
    timeframe?: OpportunityTimeframe
  ): Opportunity[] {
    const map = this.calculateOpportunities(startNodeId);

    let opportunities: Opportunity[] = [];
    if (!timeframe || timeframe === 'near-term') opportunities.push(...map.nearTerm);
    if (!timeframe || timeframe === 'medium-term') opportunities.push(...map.mediumTerm);
    if (!timeframe || timeframe === 'long-term') opportunities.push(...map.longTerm);

    return opportunities.filter(o => {
      const node = this.graph.nodes.get(o.nodeId);
      return node?.type === type;
    });
  }

  /**
   * Find highest earning opportunities
   */
  findHighestEarningOpportunities(
    startNodeId: NodeId,
    limit: number = 10
  ): Opportunity[] {
    const map = this.calculateOpportunities(startNodeId);
    const allOpportunities = [...map.nearTerm, ...map.mediumTerm, ...map.longTerm];

    return allOpportunities
      .sort((a, b) => b.earningPotential - a.earningPotential)
      .slice(0, limit);
  }

  /**
   * Find best growth opportunities
   */
  findBestGrowthOpportunities(
    startNodeId: NodeId,
    limit: number = 10
  ): Opportunity[] {
    const map = this.calculateOpportunities(startNodeId);
    const allOpportunities = [...map.nearTerm, ...map.mediumTerm, ...map.longTerm];

    return allOpportunities
      .sort((a, b) => b.growthPotential - a.growthPotential)
      .slice(0, limit);
  }

  /**
   * Compare opportunity maps for multiple nodes
   */
  compareOpportunityMaps(
    nodeIds: NodeId[],
    context?: Partial<OpportunityContext>
  ): Array<{
    nodeId: NodeId;
    nodeName: string;
    totalOpportunities: number;
    highQualityCount: number;
    accessibleCount: number;
    avgEarningPotential: number;
    avgQualityScore: number;
  }> {
    return nodeIds.map(nodeId => {
      const map = this.calculateOpportunities(nodeId, context);
      const node = this.graph.nodes.get(nodeId);

      const allOpps = [...map.nearTerm, ...map.mediumTerm, ...map.longTerm];
      const avgEarning =
        allOpps.reduce((sum, o) => sum + o.earningPotential, 0) / Math.max(1, allOpps.length);
      const avgQuality =
        allOpps.reduce((sum, o) => sum + o.qualityScore, 0) / Math.max(1, allOpps.length);

      return {
        nodeId,
        nodeName: node?.name || nodeId,
        totalOpportunities: map.totalOpportunities,
        highQualityCount: map.highQualityOpportunities,
        accessibleCount: map.accessibleOpportunities,
        avgEarningPotential: avgEarning,
        avgQualityScore: avgQuality,
      };
    });
  }

  /**
   * Update graph reference
   */
  updateGraph(graph: CareerGraph): void {
    this.graph = graph;
  }
}
