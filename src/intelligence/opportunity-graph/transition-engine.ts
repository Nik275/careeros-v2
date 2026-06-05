/**
 * Transition Engine
 *
 * Phase 8.8: CareerOS India Opportunity Graph
 *
 * Models career path changes and transitions between different
 * education and career nodes. Analyzes difficulty, probability,
 * and requirements for making transitions.
 *
 * @module transition-engine
 * @version 1.0.0
 */

import {
  OpportunityGraph,
  TransitionAnalysis,
  OpportunityNode,
  ITransitionEngine,
  DifficultyLevel,
  SkillNode,
} from './opportunity-node-types';

export class TransitionEngine implements ITransitionEngine {
  private graph: OpportunityGraph;

  constructor(graph: OpportunityGraph) {
    this.graph = graph;
  }

  /**
   * Analyze a transition from one node to another
   */
  analyzeTransition(fromNode: string, toNode: string): TransitionAnalysis {
    const from = this.graph.nodes.get(fromNode);
    const to = this.graph.nodes.get(toNode);

    if (!from || !to) {
      throw new Error('Invalid node IDs provided');
    }

    const difficulty = this.calculateTransitionDifficulty(from, to);
    const probability = this.calculateTransitionProbability(from, to, difficulty);
    const requiredSkills = this.identifyRequiredSkills(from, to);
    const skillsToAcquire = this.identifySkillsToAcquire(from, to);
    const timeEstimate = this.estimateTransitionTime(from, to, skillsToAcquire.length);
    const challenges = this.identifyChallenges(from, to);
    const mitigationStrategies = this.generateMitigationStrategies(challenges);

    return {
      id: `transition-${fromNode}-${toNode}`,
      fromNode,
      toNode,
      type: this.determineTransitionType(from, to),
      difficulty,
      probability,
      requiredSkills,
      skillsToAcquire,
      timeEstimate,
      costEstimate: this.estimateTransitionCost(from, to, skillsToAcquire.length),
      successStories: this.getSuccessStories(from.type, to.type),
      challenges,
      mitigationStrategies,
      recommendedPath: this.generateRecommendedPath(fromNode, toNode),
    };
  }

  /**
   * Find all possible transitions from a node
   */
  findPossibleTransitions(nodeId: string): TransitionAnalysis[] {
    const transitions: TransitionAnalysis[] = [];
    const visited = new Set<string>();

    // Get directly connected nodes
    const edgeIds = this.graph.adjacencyList.get(nodeId) || [];
    for (const edgeId of edgeIds) {
      const edge = this.graph.edges.get(edgeId);
      if (edge && !visited.has(edge.target)) {
        visited.add(edge.target);
        try {
          const transition = this.analyzeTransition(nodeId, edge.target);
          transitions.push(transition);
        } catch {
          // Skip invalid transitions
        }
      }
    }

    // Find nodes within 2 hops for pivot opportunities
    const queue: Array<{ nodeId: string; depth: number }> = [{ nodeId, depth: 0 }];
    while (queue.length > 0) {
      const { nodeId: currentId, depth } = queue.shift()!;

      if (depth > 2) continue;

      const currentEdgeIds = this.graph.adjacencyList.get(currentId) || [];
      for (const edgeId of currentEdgeIds) {
        const edge = this.graph.edges.get(edgeId);
        if (edge && !visited.has(edge.target)) {
          visited.add(edge.target);
          if (depth > 0) {
            try {
              const transition = this.analyzeTransition(nodeId, edge.target);
              transitions.push(transition);
            } catch {
              // Skip invalid transitions
            }
          }
          queue.push({ nodeId: edge.target, depth: depth + 1 });
        }
      }
    }

    return transitions;
  }

  /**
   * Find pivot opportunities from a node
   */
  findPivotOpportunities(nodeId: string): string[] {
    const pivots: string[] = [];
    const edgeIds = this.graph.adjacencyList.get(nodeId) || [];

    for (const edgeId of edgeIds) {
      const edge = this.graph.edges.get(edgeId);
      if (edge && (edge.type === 'PIVOT_PATH' || edge.type === 'COMMON_TRANSITION')) {
        pivots.push(edge.target);
      }
    }

    // Also check for degree pivots (e.g., Engineering -> MBA)
    const node = this.graph.nodes.get(nodeId);
    if (node?.type === 'DEGREE') {
      const degree = node as any;
      if (degree.furtherEducation) {
        pivots.push(...degree.furtherEducation);
      }
    }

    return [...new Set(pivots)];
  }

  /**
   * Get transition difficulty between two nodes
   */
  getTransitionDifficulty(fromNode: string, toNode: string): DifficultyLevel {
    const from = this.graph.nodes.get(fromNode);
    const to = this.graph.nodes.get(toNode);

    if (!from || !to) {
      return 'VERY_DIFFICULT';
    }

    return this.calculateTransitionDifficulty(from, to);
  }

  /**
   * Helper: Calculate transition difficulty
   */
  private calculateTransitionDifficulty(from: OpportunityNode, to: OpportunityNode): DifficultyLevel {
    let difficultyScore = 0;

    // Type transition difficulty
    const typeTransitions: Record<string, Record<string, number>> = {
      'SCHOOL_STREAM': { 'DEGREE': 2, 'EXAM': 2, 'CAREER': 5 },
      'DEGREE': { 'CAREER': 2, 'DEGREE': 3, 'CERTIFICATION': 2 },
      'EXAM': { 'DEGREE': 2, 'CAREER': 3 },
      'CAREER': { 'CAREER': 3, 'DEGREE': 4, 'ENTREPRENEURSHIP': 4 },
      'SKILL': { 'CAREER': 2, 'DEGREE': 3 },
      'CERTIFICATION': { 'CAREER': 1, 'DEGREE': 3 },
    };

    const typeDifficulty = typeTransitions[from.type]?.[to.type] || 3;
    difficultyScore += typeDifficulty;

    // Check if there's a direct edge
    const hasDirectEdge = this.hasDirectEdge(from.id, to.id);
    if (hasDirectEdge) {
      difficultyScore -= 1;
    }

    // Check competition level
    if ('competitionLevel' in to) {
      const competitionMap: Record<string, number> = {
        'LOW': 0, 'MODERATE': 1, 'HIGH': 2, 'VERY_HIGH': 3, 'EXTREME': 4
      };
      difficultyScore += competitionMap[(to as any).competitionLevel] || 0;
    }

    // Map score to difficulty level
    if (difficultyScore <= 2) return 'EASY';
    if (difficultyScore <= 4) return 'MODERATE';
    if (difficultyScore <= 6) return 'DIFFICULT';
    return 'VERY_DIFFICULT';
  }

  /**
   * Helper: Calculate transition probability
   */
  private calculateTransitionProbability(
    from: OpportunityNode,
    to: OpportunityNode,
    difficulty: DifficultyLevel
  ): number {
    const difficultyWeights: Record<DifficultyLevel, number> = {
      'VERY_EASY': 0.9,
      'EASY': 0.75,
      'MODERATE': 0.5,
      'DIFFICULT': 0.25,
      'VERY_DIFFICULT': 0.1
    };

    let baseProbability = difficultyWeights[difficulty];

    // Adjust based on edge weight if direct edge exists
    const edge = this.getDirectEdge(from.id, to.id);
    if (edge) {
      baseProbability = (baseProbability + edge.weight) / 2;
    }

    // Adjust for optionality
    if ('optionalityScore' in from) {
      const optionality = (from as any).optionalityScore || 0.5;
      baseProbability *= (0.8 + optionality * 0.4);
    }

    return Math.min(Math.max(baseProbability, 0), 1);
  }

  /**
   * Helper: Identify required skills
   */
  private identifyRequiredSkills(from: OpportunityNode, to: OpportunityNode): string[] {
    const required: string[] = [];

    if ('skillsDeveloped' in from) {
      required.push(...(from as any).skillsDeveloped);
    }

    if ('requiredSkills' in to) {
      required.push(...(to as any).requiredSkills);
    }

    return [...new Set(required)];
  }

  /**
   * Helper: Identify skills that need to be acquired
   */
  private identifySkillsToAcquire(from: OpportunityNode, to: OpportunityNode): string[] {
    const fromSkills = new Set<string>();
    const toSkills = new Set<string>();

    if ('skillsDeveloped' in from) {
      ((from as any).skillsDeveloped || []).forEach((s: string) => fromSkills.add(s));
    }

    if ('requiredSkills' in to) {
      ((to as any).requiredSkills || []).forEach((s: string) => toSkills.add(s));
    }

    const toAcquire: string[] = [];
    for (const skill of toSkills) {
      if (!fromSkills.has(skill)) {
        toAcquire.push(skill);
      }
    }

    return toAcquire;
  }

  /**
   * Helper: Estimate transition time
   */
  private estimateTransitionTime(from: OpportunityNode, to: OpportunityNode, skillsToAcquire: number): number {
    let baseTime = 6; // 6 months base

    // Add time for skill acquisition
    baseTime += skillsToAcquire * 3;

    // Add time for education transitions
    if (to.type === 'DEGREE' && 'duration' in to) {
      baseTime += (to as any).duration * 12;
    }

    // Add time for exam preparation
    if (to.type === 'EXAM') {
      baseTime += 6;
    }

    return baseTime;
  }

  /**
   * Helper: Estimate transition cost
   */
  private estimateTransitionCost(
    from: OpportunityNode,
    to: OpportunityNode,
    skillsToAcquire: number
  ): { min: number; max: number; currency: 'INR' | 'USD' | 'EUR'; period: 'TOTAL' } {
    let minCost = skillsToAcquire * 50000; // 50k per skill
    let maxCost = skillsToAcquire * 200000; // 2L per skill

    if ('costRange' in to) {
      const cost = (to as any).costRange;
      if (cost) {
        minCost += cost.min;
        maxCost += cost.max;
      }
    }

    return {
      min: minCost,
      max: maxCost,
      currency: 'INR',
      period: 'TOTAL'
    };
  }

  /**
   * Helper: Identify challenges
   */
  private identifyChallenges(from: OpportunityNode, to: OpportunityNode): string[] {
    const challenges: string[] = [];

    // Competition challenges
    if ('competitionLevel' in to) {
      const competition = (to as any).competitionLevel;
      if (competition === 'VERY_HIGH' || competition === 'EXTREME') {
        challenges.push(`High competition for ${to.name}`);
      }
    }

    // Skill gap challenges
    const skillsToAcquire = this.identifySkillsToAcquire(from, to);
    if (skillsToAcquire.length > 3) {
      challenges.push(`Significant skill gap - ${skillsToAcquire.length} skills to acquire`);
    }

    // Career change challenges
    if (from.type === 'CAREER' && to.type === 'CAREER') {
      challenges.push('Career transition requires rebuilding professional network');
    }

    // Age/financial constraints
    if (to.type === 'DEGREE' && 'duration' in to && (to as any).duration > 2) {
      challenges.push(`Time investment of ${(to as any).duration} years`);
    }

    return challenges;
  }

  /**
   * Helper: Generate mitigation strategies
   */
  private generateMitigationStrategies(challenges: string[]): string[] {
    const strategies: string[] = [];

    for (const challenge of challenges) {
      if (challenge.includes('competition')) {
        strategies.push('Start preparation early with structured study plan');
        strategies.push('Join coaching or mentorship program');
      }
      if (challenge.includes('skill')) {
        strategies.push('Pursue online certifications and courses');
        strategies.push('Build portfolio through projects');
      }
      if (challenge.includes('Career transition')) {
        strategies.push('Leverage transferable skills from current role');
        strategies.push('Network in target industry through events and LinkedIn');
      }
      if (challenge.includes('Time investment')) {
        strategies.push('Consider part-time or online options');
        strategies.push('Evaluate ROI of time commitment');
      }
    }

    return [...new Set(strategies)];
  }

  /**
   * Helper: Generate recommended transition path
   */
  private generateRecommendedPath(fromNode: string, toNode: string): string[] {
    const path: string[] = [fromNode];

    // Find shortest path using BFS
    const visited = new Set<string>();
    const queue: Array<{ nodeId: string; path: string[] }> = [
      { nodeId: fromNode, path: [fromNode] }
    ];

    while (queue.length > 0) {
      const { nodeId, path: currentPath } = queue.shift()!;

      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      if (nodeId === toNode) {
        return currentPath;
      }

      const edgeIds = this.graph.adjacencyList.get(nodeId) || [];
      for (const edgeId of edgeIds) {
        const edge = this.graph.edges.get(edgeId);
        if (edge && !visited.has(edge.target)) {
          queue.push({
            nodeId: edge.target,
            path: [...currentPath, edge.target]
          });
        }
      }
    }

    return path;
  }

  /**
   * Helper: Determine transition type
   */
  private determineTransitionType(from: OpportunityNode, to: OpportunityNode): any {
    if (from.type === 'DEGREE' && to.type === 'CAREER') {
      return 'CAREER_EVOLUTION';
    }
    if (from.type === 'DEGREE' && to.type === 'DEGREE') {
      return 'SPECIALIZATION';
    }
    if (from.type === 'CAREER' && to.type === 'CAREER') {
      return 'PIVOT_PATH';
    }
    if (from.type === 'CAREER' && to.type === 'DEGREE') {
      return 'UPSKILL_PATH';
    }

    const edge = this.getDirectEdge(from.id, to.id);
    return edge?.type || 'COMMON_TRANSITION';
  }

  /**
   * Helper: Check if direct edge exists
   */
  private hasDirectEdge(fromId: string, toId: string): boolean {
    const edgeIds = this.graph.adjacencyList.get(fromId) || [];
    for (const edgeId of edgeIds) {
      const edge = this.graph.edges.get(edgeId);
      if (edge?.target === toId) return true;
    }
    return false;
  }

  /**
   * Helper: Get direct edge
   */
  private getDirectEdge(fromId: string, toId: string): any {
    const edgeIds = this.graph.adjacencyList.get(fromId) || [];
    for (const edgeId of edgeIds) {
      const edge = this.graph.edges.get(edgeId);
      if (edge?.target === toId) return edge;
    }
    return null;
  }

  /**
   * Helper: Get success stories
   */
  private getSuccessStories(fromType: string, toType: string): string[] {
    const stories: Record<string, string[]> = {
      'DEGREE-CAREER': [
        'Engineering to Product Management transition',
        'Commerce to Investment Banking transition',
        'Arts to UX Design transition'
      ],
      'CAREER-CAREER': [
        'Software Engineer to Engineering Manager transition',
        'CA to CFO transition',
        'Doctor to Hospital Administrator transition'
      ],
      'DEGREE-DEGREE': [
        'B.Tech to MBA transition',
        'B.Com to CA transition',
        'B.A. to LLB transition'
      ]
    };

    return stories[`${fromType}-${toType}`] || [
      'Many professionals successfully make this transition',
      'Requires dedication and strategic planning'
    ];
  }
}

/**
 * Create a new TransitionEngine instance
 */
export function createTransitionEngine(graph: OpportunityGraph): TransitionEngine {
  return new TransitionEngine(graph);
}

/**
 * Analyze a transition between two nodes
 */
export function analyzeTransition(
  graph: OpportunityGraph,
  fromNode: string,
  toNode: string
): TransitionAnalysis {
  const engine = new TransitionEngine(graph);
  return engine.analyzeTransition(fromNode, toNode);
}

/**
 * Find possible transitions from a node
 */
export function findPossibleTransitions(
  graph: OpportunityGraph,
  nodeId: string
): TransitionAnalysis[] {
  const engine = new TransitionEngine(graph);
  return engine.findPossibleTransitions(nodeId);
}

/**
 * Find pivot opportunities from a node
 */
export function findPivotOpportunities(
  graph: OpportunityGraph,
  nodeId: string
): string[] {
  const engine = new TransitionEngine(graph);
  return engine.findPivotOpportunities(nodeId);
}
