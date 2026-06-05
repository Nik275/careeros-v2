/**
 * Career Path Simulator
 *
 * Simulates career trajectories over 3, 5, and 10 year horizons.
 * Generates likely paths, risks, pivot possibilities, and optionality changes.
 */

import {
  CareerGraph,
  CareerNode,
  CareerEdge,
  NodeId,
  PathSimulation,
  SimulatedPath,
  Risk,
  PivotOption,
  OptionalityScore,
  SimulationHorizon,
  Opportunity,
} from './career-graph-types';

export interface PathSimulatorOptions {
  maxPathsToSimulate: number;
  probabilityThreshold: number;
  includeRisks: boolean;
  includePivots: boolean;
  earningGrowthRate: number; // Annual earning growth rate
}

export const DEFAULT_SIMULATOR_OPTIONS: PathSimulatorOptions = {
  maxPathsToSimulate: 50,
  probabilityThreshold: 0.05,
  includeRisks: true,
  includePivots: true,
  earningGrowthRate: 0.08, // 8% annual growth
};

export interface SimulationContext {
  currentNodeId: NodeId;
  age: number;
  currentEarnings: number;
  completedNodes: NodeId[];
  constraints: string[];
}

export class PathSimulator {
  private graph: CareerGraph;
  private options: PathSimulatorOptions;

  constructor(graph: CareerGraph, options: Partial<PathSimulatorOptions> = {}) {
    this.graph = graph;
    this.options = { ...DEFAULT_SIMULATOR_OPTIONS, ...options };
  }

  /**
   * Simulate career paths from a starting node
   */
  simulate(
    startNodeId: NodeId,
    horizon: SimulationHorizon,
    context?: Partial<SimulationContext>
  ): PathSimulation {
    const simContext: SimulationContext = {
      currentNodeId: startNodeId,
      age: context?.age || 18,
      currentEarnings: context?.currentEarnings || 0,
      completedNodes: context?.completedNodes || [startNodeId],
      constraints: context?.constraints || [],
    };

    const likelyPaths = this.simulateLikelyPaths(startNodeId, horizon, simContext);
    const likelyRisks = this.options.includeRisks
      ? this.identifyRisks(startNodeId, likelyPaths)
      : [];
    const pivotPossibilities = this.options.includePivots
      ? this.identifyPivotOptions(startNodeId, simContext)
      : [];
    const optionalityTrajectory = this.calculateOptionalityTrajectory(
      startNodeId,
      horizon,
      likelyPaths
    );

    return {
      id: `sim-${startNodeId}-${horizon}-${Date.now()}`,
      startNodeId,
      horizon,
      generatedAt: Date.now(),
      likelyPaths: likelyPaths.slice(0, this.options.maxPathsToSimulate),
      likelyRisks,
      pivotPossibilities,
      optionalityTrajectory,
    };
  }

  /**
   * Simulate multiple likely paths using Monte Carlo-like approach
   */
  private simulateLikelyPaths(
    startNodeId: NodeId,
    horizon: SimulationHorizon,
    context: SimulationContext
  ): SimulatedPath[] {
    const paths: SimulatedPath[] = [];
    const numSimulations = Math.min(this.options.maxPathsToSimulate, 20);

    for (let i = 0; i < numSimulations; i++) {
      const path = this.runSingleSimulation(startNodeId, horizon, context, i);
      if (path.probability >= this.options.probabilityThreshold) {
        paths.push(path);
      }
    }

    // Sort by probability
    return paths.sort((a, b) => b.probability - a.probability);
  }

  /**
   * Run a single path simulation
   */
  private runSingleSimulation(
    startNodeId: NodeId,
    horizon: SimulationHorizon,
    context: SimulationContext,
    seed: number
  ): SimulatedPath {
    const nodes: NodeId[] = [startNodeId];
    const timeline: Array<{ nodeId: NodeId; startMonth: number; duration: number }> = [];
    let currentMonth = 0;
    let currentNodeId = startNodeId;
    let currentEarnings = context.currentEarnings;
    const earningTrajectory: number[] = [];
    let cumulativeProbability = 1.0;
    const keyRisks: string[] = [];

    const maxMonths = horizon * 12;

    while (currentMonth < maxMonths) {
      const node = this.graph.nodes.get(currentNodeId);
      if (!node) break;

      // Record timeline
      const duration = node.typicalDuration;
      timeline.push({
        nodeId: currentNodeId,
        startMonth: currentMonth,
        duration: Math.min(duration, maxMonths - currentMonth),
      });

      // Calculate earnings for this period
      const periodEarnings = this.calculatePeriodEarnings(
        node,
        currentEarnings,
        duration
      );
      for (let m = 0; m < duration && currentMonth + m < maxMonths; m++) {
        earningTrajectory.push(periodEarnings / duration);
      }
      currentEarnings = periodEarnings / duration * 12; // Annualize

      // Get possible next steps
      const edges = this.getOutgoingEdges(currentNodeId);
      if (edges.length === 0) break;

      // Select next node based on probabilities
      const nextEdge = this.selectNextEdge(edges, seed + currentMonth);
      if (!nextEdge || nextEdge.probability < this.options.probabilityThreshold) {
        break;
      }

      cumulativeProbability *= nextEdge.probability;
      currentNodeId = nextEdge.to;
      nodes.push(currentNodeId);
      currentMonth += duration;

      // Identify risks
      const risk = this.assessRiskForEdge(nextEdge);
      if (risk && !keyRisks.includes(risk)) {
        keyRisks.push(risk);
      }
    }

    // Calculate cumulative earnings
    const cumulativeEarnings = earningTrajectory.reduce((sum, e) => sum + e, 0);

    // Calculate final optionality
    const finalOptionality = this.calculateOptionalityAtNode(
      nodes[nodes.length - 1],
      horizon
    );

    // Assess risk level
    const riskLevel = this.assessOverallRisk(keyRisks, cumulativeProbability);

    return {
      id: `path-${startNodeId}-${seed}`,
      nodes,
      probability: cumulativeProbability,
      timeline,
      finalOptionality,
      earningTrajectory,
      cumulativeEarnings,
      riskLevel,
      keyRisks: keyRisks.slice(0, 5),
    };
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
   * Select next edge based on probabilities
   */
  private selectNextEdge(edges: CareerEdge[], seed: number): CareerEdge | null {
    if (edges.length === 0) return null;

    // Sort by probability descending
    const sortedEdges = [...edges].sort((a, b) => b.probability - a.probability);

    // Weighted random selection
    const totalWeight = sortedEdges.reduce((sum, e) => sum + e.probability, 0);
    let random = ((seed * 9301 + 49297) % 233280) / 233280 * totalWeight;

    for (const edge of sortedEdges) {
      random -= edge.probability;
      if (random <= 0) {
        return edge;
      }
    }

    return sortedEdges[0];
  }

  /**
   * Calculate earnings for a period
   */
  private calculatePeriodEarnings(
    node: CareerNode,
    currentAnnualEarnings: number,
    months: number
  ): number {
    if (node.type === 'subject-choice' || node.type === 'degree-choice') {
      // Educational periods often have no earnings or negative (cost)
      return -node.costRange.max / 12 * months;
    }

    const annualEarnings =
      node.earningPotential.entry > 0
        ? node.earningPotential.entry
        : currentAnnualEarnings * (1 + this.options.earningGrowthRate);

    return (annualEarnings / 12) * months;
  }

  /**
   * Assess risk for an edge transition
   */
  private assessRiskForEdge(edge: CareerEdge): string | null {
    const risks: string[] = [];

    if (edge.probability < 0.3) {
      risks.push('low-probability-transition');
    }
    if (edge.effortScore > 80) {
      risks.push('high-effort-required');
    }
    if (edge.optionalityImpact < -0.3) {
      risks.push('optionality-reduction');
    }
    if (edge.reversibilityScore < 30) {
      risks.push('difficult-to-reverse');
    }

    return risks.length > 0 ? risks[0] : null;
  }

  /**
   * Assess overall risk level
   */
  private assessOverallRisk(
    risks: string[],
    pathProbability: number
  ): 'low' | 'medium' | 'high' {
    let riskScore = 0;

    if (pathProbability < 0.2) riskScore += 2;
    else if (pathProbability < 0.5) riskScore += 1;

    riskScore += risks.filter(r => r.includes('high')).length * 2;
    riskScore += risks.filter(r => !r.includes('high')).length;

    if (riskScore >= 4) return 'high';
    if (riskScore >= 2) return 'medium';
    return 'low';
  }

  /**
   * Calculate optionality at a node
   */
  private calculateOptionalityAtNode(nodeId: NodeId, horizon: number): OptionalityScore {
    const reachable = this.getReachableNodes(nodeId, 3);
    const uniqueCareers = new Set<string>();
    const uniqueIndustries = new Set<string>();
    let pivotCount = 0;

    for (const [reachableId] of Array.from(reachable)) {
      const node = this.graph.nodes.get(reachableId);
      if (node) {
        if (node.type === 'career') uniqueCareers.add(node.name);
        if (node.type === 'industry') uniqueIndustries.add(node.name);
        if (reachableId !== nodeId) pivotCount++;
      }
    }

    const baseScore = Math.min(100, (uniqueCareers.size + uniqueIndustries.size) * 10 + pivotCount * 5);

    return {
      score: baseScore,
      careerOptions: uniqueCareers.size,
      industryOptions: uniqueIndustries.size,
      roleOptions: uniqueCareers.size,
      pivotOptions: pivotCount,
      nearTermOptionality: baseScore,
      mediumTermOptionality: Math.max(0, baseScore - 10),
      longTermOptionality: Math.max(0, baseScore - 20),
      contributingFactors: Array.from(uniqueCareers).slice(0, 3),
      limitingFactors: [],
      percentileRank: baseScore,
    };
  }

  /**
   * Get reachable nodes from a starting node
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
        if (!visited.has(edge.to)) {
          queue.push({ nodeId: edge.to, depth: depth + 1 });
        }
      }
    }

    return reachable;
  }

  /**
   * Identify risks for a starting node and paths
   */
  private identifyRisks(startNodeId: NodeId, paths: SimulatedPath[]): Risk[] {
    const risks: Risk[] = [];
    const startNode = this.graph.nodes.get(startNodeId);

    if (!startNode) return risks;

    // Risk: High competition
    if (startNode.demandLevel === 'very-high' || startNode.growthOutlook === 'strong-growth') {
      risks.push({
        id: `risk-competition-${startNodeId}`,
        name: 'High Competition',
        description: 'High demand attracts many candidates, increasing competition',
        likelihood: 0.7,
        impact: 'medium',
        timeframe: 'immediate',
        mitigation: ['differentiate-skills', 'build-network', 'gain-early-experience'],
      });
    }

    // Risk: Market decline
    if (startNode.growthOutlook === 'declining' || startNode.growthOutlook === 'strong-decline') {
      risks.push({
        id: `risk-decline-${startNodeId}`,
        name: 'Market Decline',
        description: 'Industry or role is experiencing decline',
        likelihood: 0.6,
        impact: 'high',
        timeframe: '5-10 years',
        mitigation: ['pivot-early', 'diversify-skills', 'enter-niche'],
      });
    }

    // Risk: Low optionality
    const avgOptionality =
      paths.reduce((sum, p) => sum + p.finalOptionality.score, 0) / Math.max(1, paths.length);
    if (avgOptionality < 40) {
      risks.push({
        id: `risk-optionality-${startNodeId}`,
        name: 'Limited Future Options',
        description: 'This path may limit future career flexibility',
        likelihood: 0.8,
        impact: 'medium',
        timeframe: 'medium-term',
        mitigation: ['maintain-transferable-skills', 'build-diverse-network', 'keep-options-open'],
      });
    }

    // Risk: High effort, low probability
    const highEffortPaths = paths.filter(p =>
      p.keyRisks.some(r => r.includes('high-effort'))
    );
    if (highEffortPaths.length > paths.length * 0.5) {
      risks.push({
        id: `risk-effort-${startNodeId}`,
        name: 'High Effort Requirements',
        description: 'Significant effort required to progress along typical paths',
        likelihood: 0.75,
        impact: 'medium',
        timeframe: 'ongoing',
        mitigation: ['build-support-system', 'maintain-work-life-balance', 'set-milestones'],
      });
    }

    return risks;
  }

  /**
   * Identify pivot options from a node
   */
  private identifyPivotOptions(
    startNodeId: NodeId,
    context: SimulationContext
  ): PivotOption[] {
    const pivots: PivotOption[] = [];
    const edges = this.getOutgoingEdges(startNodeId);

    for (const edge of edges) {
      const targetNode = this.graph.nodes.get(edge.to);
      if (!targetNode) continue;

      // Calculate pivot feasibility
      const feasibility = this.calculatePivotFeasibility(edge, context);

      // Calculate optionality change
      const currentOptionality = this.calculateOptionalityAtNode(startNodeId, 5);
      const targetOptionality = this.calculateOptionalityAtNode(edge.to, 5);
      const optionalityChange = (targetOptionality.score - currentOptionality.score) / 100;

      // Calculate earning impact
      const earningImpact = this.calculateEarningImpact(startNodeId, edge.to);

      pivots.push({
        id: `pivot-${startNodeId}-${edge.to}`,
        fromNodeId: startNodeId,
        toNodeId: edge.to,
        feasibility,
        effortRequired: edge.effortScore,
        timeRequired: edge.timeToTransition,
        optionalityChange,
        earningImpact,
        prerequisites: edge.conditions,
      });
    }

    // Sort by feasibility
    return pivots.sort((a, b) => b.feasibility - a.feasibility);
  }

  /**
   * Calculate pivot feasibility
   */
  private calculatePivotFeasibility(edge: CareerEdge, context: SimulationContext): number {
    let feasibility = edge.probability * 100;

    // Adjust based on reversibility
    feasibility *= edge.reversibilityScore / 100;

    // Adjust based on effort
    feasibility *= (100 - edge.effortScore) / 100;

    // Adjust based on constraints
    for (const constraint of context.constraints) {
      if (edge.conditions.includes(constraint)) {
        feasibility *= 0.8;
      }
    }

    return Math.max(0, Math.min(100, feasibility));
  }

  /**
   * Calculate earning impact of a pivot
   */
  private calculateEarningImpact(fromNodeId: NodeId, toNodeId: NodeId): number {
    const fromNode = this.graph.nodes.get(fromNodeId);
    const toNode = this.graph.nodes.get(toNodeId);

    if (!fromNode || !toNode) return 0;

    const fromEarnings = fromNode.earningPotential.entry;
    const toEarnings = toNode.earningPotential.entry;

    if (fromEarnings === 0) return 0;
    return (toEarnings - fromEarnings) / fromEarnings;
  }

  /**
   * Calculate optionality trajectory over time
   */
  private calculateOptionalityTrajectory(
    startNodeId: NodeId,
    horizon: SimulationHorizon,
    paths: SimulatedPath[]
  ): {
    year1: OptionalityScore;
    year3: OptionalityScore;
    year5: OptionalityScore;
    year10: OptionalityScore;
  } {
    // Get the most likely path
    const mostLikelyPath = paths[0];

    const getNodeAtYear = (year: number): NodeId => {
      if (!mostLikelyPath) return startNodeId;

      const monthTarget = year * 12;
      let currentMonth = 0;

      for (const segment of mostLikelyPath.timeline) {
        if (currentMonth + segment.duration >= monthTarget) {
          return segment.nodeId;
        }
        currentMonth += segment.duration;
      }

      return mostLikelyPath.nodes[mostLikelyPath.nodes.length - 1];
    };

    return {
      year1: this.calculateOptionalityAtNode(getNodeAtYear(1), 1),
      year3: this.calculateOptionalityAtNode(getNodeAtYear(3), 3),
      year5: this.calculateOptionalityAtNode(getNodeAtYear(5), 5),
      year10: horizon >= 10
        ? this.calculateOptionalityAtNode(getNodeAtYear(10), 10)
        : this.calculateOptionalityAtNode(getNodeAtYear(horizon), horizon),
    };
  }

  /**
   * Batch simulate multiple starting nodes
   */
  batchSimulate(
    startNodeIds: NodeId[],
    horizon: SimulationHorizon
  ): Map<NodeId, PathSimulation> {
    const results = new Map<NodeId, PathSimulation>();

    for (const nodeId of startNodeIds) {
      results.set(nodeId, this.simulate(nodeId, horizon));
    }

    return results;
  }

  /**
   * Compare simulations for different starting nodes
   */
  compareSimulations(
    nodeIds: NodeId[],
    horizon: SimulationHorizon
  ): Array<{
    nodeId: NodeId;
    nodeName: string;
    avgEarnings: number;
    avgOptionality: number;
    riskLevel: string;
    bestPathProbability: number;
  }> {
    const comparisons = nodeIds.map(nodeId => {
      const simulation = this.simulate(nodeId, horizon);
      const node = this.graph.nodes.get(nodeId);

      const avgEarnings =
        simulation.likelyPaths.reduce((sum, p) => sum + p.cumulativeEarnings, 0) /
        Math.max(1, simulation.likelyPaths.length);

      const avgOptionality =
        simulation.likelyPaths.reduce((sum, p) => sum + p.finalOptionality.score, 0) /
        Math.max(1, simulation.likelyPaths.length);

      const riskLevels = { low: 0, medium: 1, high: 2 };
      const avgRiskLevel =
        simulation.likelyPaths.reduce(
          (sum, p) => sum + riskLevels[p.riskLevel],
          0
        ) / Math.max(1, simulation.likelyPaths.length);

      const riskLevelString =
        avgRiskLevel < 0.7 ? 'low' : avgRiskLevel < 1.3 ? 'medium' : 'high';

      return {
        nodeId,
        nodeName: node?.name || nodeId,
        avgEarnings,
        avgOptionality,
        riskLevel: riskLevelString,
        bestPathProbability: simulation.likelyPaths[0]?.probability || 0,
      };
    });

    return comparisons.sort((a, b) => b.avgOptionality - a.avgOptionality);
  }

  /**
   * Update graph reference
   */
  updateGraph(graph: CareerGraph): void {
    this.graph = graph;
  }
}
