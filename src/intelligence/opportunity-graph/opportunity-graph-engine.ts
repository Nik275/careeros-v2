/**
 * Opportunity Graph Engine - Main Orchestrator
 *
 * Phase 8.8: CareerOS India Opportunity Graph
 *
 * Main orchestrator that combines all opportunity graph functionality:
 * - Graph building and management
 * - Pathway generation
 * - Transition analysis
 * - Decision simulation
 * - Optionality analysis
 * - Criticality analysis
 * - Mentor explanations
 *
 * @module opportunity-graph-engine
 * @version 1.0.0
 */

import {
  OpportunityGraph,
  OpportunityNode,
  IOpportunityGraphEngine,
  GraphQuery,
  GraphQueryResult,
  PathwayAnalysis,
  TransitionAnalysis,
  OptionalityAnalysis,
  CriticalityAnalysis,
  DecisionSimulationInput,
  DecisionSimulationResult,
  PathSimulation,
  MentorExplanation,
} from './opportunity-node-types';
import { GraphBuilder, mergeGraphs } from './graph-builder';
import { PathwayEngine } from './pathway-engine';
import { TransitionEngine } from './transition-engine';
import { buildEducationGraph } from './education-graph';

export class OpportunityGraphEngine implements IOpportunityGraphEngine {
  private graph: OpportunityGraph;
  private pathwayEngine: PathwayEngine;
  private transitionEngine: TransitionEngine;
  private builder: GraphBuilder;

  constructor() {
    this.builder = buildEducationGraph();
    this.graph = this.builder.buildGraph();
    this.pathwayEngine = new PathwayEngine(this.graph);
    this.transitionEngine = new TransitionEngine(this.graph);
  }

  /**
   * Query the graph based on criteria
   */
  query(query: GraphQuery): GraphQueryResult {
    const paths: PathwayAnalysis[] = [];
    const nodes: OpportunityNode[] = [];
    const edges: any[] = [];

    // Find starting point
    let startNodes: string[] = [];
    if (query.startNode) {
      startNodes = [query.startNode];
    } else if (query.nodeTypes) {
      for (const node of this.graph.nodes.values()) {
        if (query.nodeTypes.includes(node.type)) {
          startNodes.push(node.id);
        }
      }
    }

    // Generate paths from each start node
    for (const startId of startNodes.slice(0, 10)) { // Limit to avoid explosion
      const generatedPaths = this.pathwayEngine.generateAllPathways(
        startId,
        query.maxDepth || 4
      );
      
      for (const path of generatedPaths) {
        // Filter by end node if specified
        if (query.endNode && path.endNode !== query.endNode) {
          continue;
        }

        // Filter by optionality
        if (query.minOptionality && path.optionalityScore < query.minOptionality) {
          continue;
        }

        // Filter by difficulty
        if (query.maxDifficulty && path.difficulty === query.maxDifficulty) {
          // Check if any step exceeds max difficulty
          const hasHigherDifficulty = path.steps.some(
            step => step.difficulty && this.compareDifficulty(step.difficulty, query.maxDifficulty!) > 0
          );
          if (hasHigherDifficulty) continue;
        }

        paths.push(path);
      }
    }

    // Collect unique nodes and edges
    const nodeIds = new Set<string>();
    for (const path of paths) {
      for (const step of path.steps) {
        if (!nodeIds.has(step.nodeId)) {
          nodeIds.add(step.nodeId);
          const node = this.graph.nodes.get(step.nodeId);
          if (node) nodes.push(node);
        }
      }
    }

    // Calculate metadata
    const optionalityScores = paths.map(p => p.optionalityScore);
    const averageOptionality = optionalityScores.length > 0
      ? optionalityScores.reduce((a, b) => a + b, 0) / optionalityScores.length
      : 0;

    const difficultyScores = paths.map(p => this.difficultyToScore(p.difficulty));
    const averageDifficulty = difficultyScores.length > 0
      ? difficultyScores.reduce((a, b) => a + b, 0) / difficultyScores.length
      : 0;

    return {
      paths,
      nodes,
      edges,
      metadata: {
        totalPaths: paths.length,
        averageOptionality,
        averageDifficulty: this.scoreToDifficulty(averageDifficulty),
      },
    };
  }

  /**
   * Simulate decision outcomes
   */
  simulateDecision(input: DecisionSimulationInput): DecisionSimulationResult {
    const simulations: PathSimulation[] = [];

    for (const candidateNode of input.candidateNodes) {
      // Generate pathway
      const pathway = this.pathwayEngine.generatePathway(candidateNode);

      // Analyze optionality
      const optionality = this.analyzeOptionality(candidateNode);

      // Analyze criticality
      const criticality = this.analyzeCriticality(candidateNode);

      // Find future opportunities
      const futureOpportunities = this.findFutureOpportunities(candidateNode, 3);

      // Find lost opportunities
      const opportunitiesLost = this.findLostOpportunities(
        input.currentNode,
        candidateNode,
        input.candidateNodes
      );

      // Calculate regret risks
      const regretRisks = this.calculateRegretRisks(
        candidateNode,
        input.studentProfile,
        pathway
      );

      simulations.push({
        pathId: `sim-${candidateNode}`,
        chosenNode: candidateNode,
        pathway,
        optionality,
        criticality,
        futureOpportunities: futureOpportunities.map(n => n.id),
        opportunitiesLost: opportunitiesLost.map(n => n.id),
        regretRisks,
        recommendation: this.generateSimulationRecommendation(
          pathway,
          optionality,
          criticality,
          input.studentProfile
        ),
      });
    }

    // Compare simulations
    const comparison = this.compareSimulations(simulations);

    return {
      id: `decision-${Date.now()}`,
      simulations,
      comparison,
      recommendation: this.generateOverallRecommendation(simulations),
      mentorFraming: this.generateMentorFraming(simulations),
    };
  }

  /**
   * Analyze optionality at a node
   */
  analyzeOptionality(nodeId: string): OptionalityAnalysis {
    return this.pathwayEngine.analyzeOptionality(nodeId);
  }

  /**
   * Analyze criticality at a node
   */
  analyzeCriticality(nodeId: string): CriticalityAnalysis {
    const node = this.graph.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    const optionality = this.pathwayEngine.analyzeOptionality(nodeId);
    const transitions = this.graph.adjacencyList.get(nodeId) || [];

    // Determine lock-in levels
    const pathLockIn = optionality.directTransitions <= 2;
    const careerLockIn = node.type === 'CAREER' && optionality.lockInLevel === 'HIGH';
    const educationLockIn = node.type === 'DEGREE' && (node as any).lockInLevel === 'HIGH';

    // Find closed opportunities
    const opportunityClosure: string[] = [];
    const allNodes = Array.from(this.graph.nodes.values());
    
    for (const otherNode of allNodes) {
      if (otherNode.id !== nodeId) {
        const hasPath = this.pathwayEngine.findShortestPath(nodeId, otherNode.id);
        if (!hasPath && this.isSignificantNode(otherNode)) {
          opportunityClosure.push(otherNode.id);
        }
      }
    }

    // Calculate irreversibility
    const irreversibilityScore = this.calculateIrreversibility(node, optionality);

    // Determine criticality level
    let criticalityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (irreversibilityScore > 0.8) criticalityLevel = 'CRITICAL';
    else if (irreversibilityScore > 0.6) criticalityLevel = 'HIGH';
    else if (irreversibilityScore > 0.4) criticalityLevel = 'MEDIUM';

    return {
      nodeId,
      pathLockIn,
      careerLockIn,
      educationLockIn,
      opportunityClosure: opportunityClosure.slice(0, 10),
      futureRestrictions: this.identifyFutureRestrictions(node),
      irreversibilityScore,
      criticalityLevel,
      warningSigns: this.generateWarningSigns(node, optionality),
      mitigationOptions: this.generateMitigationOptions(node, optionality),
    };
  }

  /**
   * Get mentor explanation for a pathway
   */
  getMentorExplanation(pathwayId: string): MentorExplanation {
    // Find the pathway
    let pathway: PathwayAnalysis | null = null;
    
    // Try to find from recent simulations or regenerate
    // For simplicity, we'll use the first node to generate
    // Handle different pathway ID formats: 'pathway-pcm' -> 'stream-pcm'
    let startNode: string | undefined;
    
    // Remove 'pathway-' prefix and map to actual node IDs
    if (pathwayId.startsWith('pathway-')) {
      const suffix = pathwayId.substring('pathway-'.length);
      // Map common suffixes to node IDs
      const nodeMap: Record<string, string> = {
        'pcm': 'stream-pcm',
        'pcb': 'stream-pcb',
        'commerce': 'stream-commerce',
        'arts': 'stream-arts',
      };
      startNode = nodeMap[suffix] || suffix;
    } else {
      startNode = pathwayId;
    }
    
    if (startNode && this.graph.nodes.has(startNode)) {
      pathway = this.pathwayEngine.generatePathway(startNode);
    }

    if (!pathway) {
      return {
        pathwaySummary: 'Pathway information not available',
        optionalityExplanation: '',
        criticalityExplanation: '',
        transitionAdvice: '',
        naturalLanguage: 'Unable to generate explanation at this time.',
        keyInsights: [],
        questionsToConsider: [],
      };
    }

    const optionality = this.analyzeOptionality(pathway.startNode);
    const criticality = this.analyzeCriticality(pathway.startNode);

    return {
      pathwaySummary: this.generatePathwaySummary(pathway),
      optionalityExplanation: this.generateOptionalityExplanation(optionality),
      criticalityExplanation: this.generateCriticalityExplanation(criticality),
      transitionAdvice: this.generateTransitionAdvice(pathway),
      naturalLanguage: this.generateNaturalLanguageExplanation(pathway, optionality, criticality),
      keyInsights: this.generateKeyInsights(pathway, optionality, criticality),
      questionsToConsider: this.generateQuestions(pathway, optionality),
    };
  }

  /**
   * Get a node by ID
   */
  getNode(id: string): OpportunityNode | undefined {
    return this.graph.nodes.get(id);
  }

  /**
   * Get connected nodes
   */
  getConnectedNodes(nodeId: string): OpportunityNode[] {
    const edgeIds = this.graph.adjacencyList.get(nodeId) || [];
    const connected: OpportunityNode[] = [];

    for (const edgeId of edgeIds) {
      const edge = this.graph.edges.get(edgeId);
      if (edge) {
        const node = this.graph.nodes.get(edge.target);
        if (node) connected.push(node);
      }
    }

    return connected;
  }

  /**
   * Get graph statistics
   */
  getStats() {
    return this.builder.getStats();
  }

  // Private helper methods

  private compareDifficulty(a: string, b: string): number {
    const order = ['VERY_EASY', 'EASY', 'MODERATE', 'DIFFICULT', 'VERY_DIFFICULT'];
    return order.indexOf(a) - order.indexOf(b);
  }

  private difficultyToScore(difficulty: string): number {
    const scores: Record<string, number> = {
      'VERY_EASY': 1, 'EASY': 2, 'MODERATE': 3, 'DIFFICULT': 4, 'VERY_DIFFICULT': 5
    };
    return scores[difficulty] || 3;
  }

  private scoreToDifficulty(score: number): string {
    if (score <= 1.5) return 'VERY_EASY';
    if (score <= 2.5) return 'EASY';
    if (score <= 3.5) return 'MODERATE';
    if (score <= 4.5) return 'DIFFICULT';
    return 'VERY_DIFFICULT';
  }

  private isSignificantNode(node: OpportunityNode): boolean {
    return ['DEGREE', 'CAREER', 'INDUSTRY'].includes(node.type);
  }

  private findFutureOpportunities(nodeId: string, depth: number): OpportunityNode[] {
    const opportunities: OpportunityNode[] = [];
    const visited = new Set<string>();
    const queue: Array<{ nodeId: string; currentDepth: number }> = [{ nodeId, currentDepth: 0 }];

    while (queue.length > 0) {
      const { nodeId: currentId, currentDepth } = queue.shift()!;

      if (currentDepth > depth) continue;
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const node = this.graph.nodes.get(currentId);
      if (node && this.isSignificantNode(node)) {
        opportunities.push(node);
      }

      const edgeIds = this.graph.adjacencyList.get(currentId) || [];
      for (const edgeId of edgeIds) {
        const edge = this.graph.edges.get(edgeId);
        if (edge) {
          queue.push({ nodeId: edge.target, currentDepth: currentDepth + 1 });
        }
      }
    }

    return opportunities;
  }

  private findLostOpportunities(
    currentNode: string,
    chosenNode: string,
    allOptions: string[]
  ): OpportunityNode[] {
    const lost: OpportunityNode[] = [];

    for (const option of allOptions) {
      if (option !== chosenNode) {
        const node = this.graph.nodes.get(option);
        if (node) {
          lost.push(node);
        }
      }
    }

    return lost;
  }

  private calculateRegretRisks(
    nodeId: string,
    profile: any,
    pathway: PathwayAnalysis
  ): string[] {
    const risks: string[] = [];

    if (pathway.difficulty === 'VERY_DIFFICULT') {
      risks.push('High difficulty may lead to dropout regret');
    }

    if (pathway.optionalityScore < 0.4) {
      risks.push('Low optionality may lead to flexibility regret');
    }

    if (profile.riskTolerance === 'LOW' && pathway.riskFactors.length > 2) {
      risks.push('High-risk path not aligned with risk tolerance');
    }

    return risks;
  }

  private generateSimulationRecommendation(
    pathway: PathwayAnalysis,
    optionality: OptionalityAnalysis,
    criticality: CriticalityAnalysis,
    profile: any
  ): string {
    const parts: string[] = [];

    if (optionality.pathFlexibility > 0.7) {
      parts.push('This path keeps many future doors open');
    }

    if (criticality.criticalityLevel === 'HIGH' || criticality.criticalityLevel === 'CRITICAL') {
      parts.push('This is a significant decision with long-term implications');
    }

    if (pathway.difficulty === 'VERY_DIFFICULT' && profile.riskTolerance === 'LOW') {
      parts.push('Consider if this difficulty level matches your preparation');
    }

    return parts.join('. ') || 'Standard pathway with moderate outcomes';
  }

  private compareSimulations(simulations: PathSimulation[]): any {
    let highestOptionality = simulations[0]?.pathId;
    let lowestRisk = simulations[0]?.pathId;
    let bestAlignment = simulations[0]?.pathId;

    let maxOptionality = -1;
    let minRisk = Infinity;
    let maxAlignment = -1;

    for (const sim of simulations) {
      if (sim.optionality.pathFlexibility > maxOptionality) {
        maxOptionality = sim.optionality.pathFlexibility;
        highestOptionality = sim.pathId;
      }

      const riskScore = sim.criticality.irreversibilityScore + sim.regretRisks.length;
      if (riskScore < minRisk) {
        minRisk = riskScore;
        lowestRisk = sim.pathId;
      }

      const alignment = sim.pathway.optionalityScore;
      if (alignment > maxAlignment) {
        maxAlignment = alignment;
        bestAlignment = sim.pathId;
      }
    }

    return {
      highestOptionality: highestOptionality || '',
      lowestRisk: lowestRisk || '',
      bestAlignment: bestAlignment || '',
    };
  }

  private generateOverallRecommendation(simulations: PathSimulation[]): string {
    const bestOptionality = simulations.find(s => s.pathway.optionalityScore > 0.7);
    
    if (bestOptionality) {
      return `Consider ${bestOptionality.chosenNode} for maximum future flexibility`;
    }

    return 'Evaluate each option based on your priorities';
  }

  private generateMentorFraming(simulations: PathSimulation[]): string {
    return `You have ${simulations.length} viable paths to explore. Each opens different doors.`;
  }

  private calculateIrreversibility(node: OpportunityNode, optionality: OptionalityAnalysis): number {
    let score = 0;

    if (node.type === 'DEGREE' && (node as any).lockInLevel === 'HIGH') {
      score += 0.4;
    }

    score += (1 - optionality.pathFlexibility) * 0.4;

    if (optionality.reversibility === 'DIFFICULT' || optionality.reversibility === 'IMPOSSIBLE') {
      score += 0.2;
    }

    return Math.min(score, 1);
  }

  private identifyFutureRestrictions(node: OpportunityNode): string[] {
    const restrictions: string[] = [];

    if (node.type === 'DEGREE') {
      const degree = node as any;
      if (degree.streamRequirement && degree.streamRequirement.length > 0) {
        restrictions.push(`Requires ${degree.streamRequirement.join('/')} background`);
      }
    }

    return restrictions;
  }

  private generateWarningSigns(node: OpportunityNode, optionality: OptionalityAnalysis): string[] {
    const warnings: string[] = [];

    if (optionality.lockInLevel === 'HIGH') {
      warnings.push('This choice significantly constrains future options');
    }

    if (node.type === 'EXAM' && (node as any).competitionLevel === 'EXTREME') {
      warnings.push('Extremely competitive - backup plans essential');
    }

    return warnings;
  }

  private generateMitigationOptions(node: OpportunityNode, optionality: OptionalityAnalysis): string[] {
    const options: string[] = [];

    if (optionality.lockInLevel === 'HIGH') {
      options.push('Explore related fields before committing');
      options.push('Consider hybrid or interdisciplinary paths');
    }

    if (optionality.pivotOpportunities.length > 0) {
      options.push('Keep pivot options open through skill development');
    }

    return options;
  }

  private generatePathwaySummary(pathway: PathwayAnalysis): string {
    return `This ${pathway.steps.length}-step pathway takes approximately ${pathway.totalDuration} years`;
  }

  private generateOptionalityExplanation(optionality: OptionalityAnalysis): string {
    return `This path leads to ${optionality.futurePathCount} potential future opportunities`;
  }

  private generateCriticalityExplanation(criticality: CriticalityAnalysis): string {
    return `Decision criticality: ${criticality.criticalityLevel.toLowerCase()}`;
  }

  private generateTransitionAdvice(pathway: PathwayAnalysis): string {
    return `Focus on building transferable skills at each step`;
  }

  private generateNaturalLanguageExplanation(
    pathway: PathwayAnalysis,
    optionality: OptionalityAnalysis,
    criticality: CriticalityAnalysis
  ): string {
    return `This pathway offers ${optionality.futurePathCount} future directions with ${criticality.criticalityLevel.toLowerCase()} commitment requirements`;
  }

  private generateKeyInsights(
    pathway: PathwayAnalysis,
    optionality: OptionalityAnalysis,
    criticality: CriticalityAnalysis
  ): string[] {
    return [
      `${optionality.futurePathCount} future paths available`,
      `Optionality score: ${Math.round(pathway.optionalityScore * 100)}%`,
      `Criticality: ${criticality.criticalityLevel}`,
    ];
  }

  private generateQuestions(pathway: PathwayAnalysis, optionality: OptionalityAnalysis): string[] {
    return [
      'Does this align with your long-term interests?',
      'Are you comfortable with the level of commitment?',
      'Have you explored alternative paths?',
    ];
  }
}

/**
 * Create a new OpportunityGraphEngine instance
 */
export function createOpportunityGraphEngine(): OpportunityGraphEngine {
  return new OpportunityGraphEngine();
}

/**
 * Query the opportunity graph
 */
export function queryOpportunityGraph(query: GraphQuery): GraphQueryResult {
  const engine = createOpportunityGraphEngine();
  return engine.query(query);
}

/**
 * Simulate a decision
 */
export function simulateDecision(input: DecisionSimulationInput): DecisionSimulationResult {
  const engine = createOpportunityGraphEngine();
  return engine.simulateDecision(input);
}

/**
 * Analyze optionality at a node
 */
export function analyzeOptionality(nodeId: string): OptionalityAnalysis {
  const engine = createOpportunityGraphEngine();
  return engine.analyzeOptionality(nodeId);
}

/**
 * Analyze criticality at a node
 */
export function analyzeCriticality(nodeId: string): CriticalityAnalysis {
  const engine = createOpportunityGraphEngine();
  return engine.analyzeCriticality(nodeId);
}
