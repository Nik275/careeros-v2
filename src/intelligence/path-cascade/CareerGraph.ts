/**
 * Career Graph - State-Transition Graph for Career Paths
 * 
 * CareerOS Frontier Engine V2 - Path Dependency Cascade
 * 
 * Purpose:
 *   Model careers as a state-transition graph rather than flat scores.
 *   Each node represents a career state (exam, degree, job, pivot).
 *   Each edge represents a transition with probability, cost, and reversibility.
 * 
 * Architecture Principle:
 *   Career decisions create path dependencies. Choosing JEE → IIT → Software Engineer
 *   closes some doors and opens others. The graph makes these dependencies explicit.
 * 
 * Key Concepts:
 *   - CareerNode: A state in the career journey (exam, degree, job, career)
 *   - CareerEdge: A possible transition between states
 *   - CareerPath: A sequence of nodes connected by edges
 *   - Criticality: How much a decision collapses future options
 *   - Optionality: Size of future reachable opportunity space
 * 
 * Node Types:
 *   - EXAM: Entrance exams (JEE, NEET, CAT, etc.)
 *   - DEGREE: Educational qualifications (B.Tech, MBBS, B.Com, etc.)
 *   - JOB: Specific job roles (Software Engineer, Doctor, etc.)
 *   - CAREER: Broad career categories (Engineering, Medicine, etc.)
 *   - PIVOT: Transition points between career tracks
 * 
 * Edge Properties:
 *   - probability: Likelihood of successful transition
 *   - reversibility: Can you go back? (0.0 = irreversible, 1.0 = easily reversible)
 *   - timeCost: Years required for transition
 *   - financialCost: Money required (in INR for India context)
 * 
 * India-First Design:
 *   - Entrance exam nodes (JEE, NEET, etc.)
 *   - Tiered college system (IIT, NIT, state colleges)
 *   - Financial costs in INR
 *   - Time costs account for Indian education system
 * 
 * Future Expansion:
 *   - Probabilistic path modeling
 *   - Real-time job market data integration
 *   - Regional variation (metro vs tier-2/3 cities)
 *   - International transition edges
 */

import { EntityId, ConfidenceScore } from '../types';

// ============================================================================
// NODE TYPES
// ============================================================================

/**
 * Types of nodes in the career graph.
 */
export type CareerNodeType = 
  | 'EXAM'      // Entrance examination
  | 'DEGREE'    // Educational qualification
  | 'JOB'       // Specific job role
  | 'CAREER'    // Broad career category
  | 'PIVOT';    // Transition point between tracks

/**
 * A node in the career state-transition graph.
 * 
 * Represents a specific state in a person's career journey.
 */
export interface CareerNode {
  /** Unique identifier */
  id: EntityId;
  
  /** Human-readable name */
  name: string;
  
  /** Type of node */
  type: CareerNodeType;
  
  /** Description */
  description: string;
  
  /** Category (Engineering, Medicine, Business, etc.) */
  category: string;
  
  /** Typical duration to complete/achieve (years) */
  typicalDuration: number;
  
  /** Financial cost (INR) */
  financialCost: {
    min: number;
    max: number;
    typical: number;
  };
  
  /** Prerequisites to enter this node */
  prerequisites: Prerequisite[];
  
  /** Skills gained at this node */
  skillsGained: string[];
  
  /** Average outcome metrics */
  outcomes: {
    averageSalary?: number;      // Annual salary in INR
    jobSecurity?: number;        // 0.0 - 1.0
    growthPotential?: number;    // 0.0 - 1.0
    workLifeBalance?: number;    // 0.0 - 1.0
  };
  
  /** Whether this is a terminal node (end of path) */
  isTerminal: boolean;
  
  /** Popularity/commonness of this path */
  popularity: number;  // 0.0 - 1.0
}

/**
 * Prerequisite for entering a career node.
 */
export interface Prerequisite {
  /** Type of prerequisite */
  type: 'EXAM' | 'DEGREE' | 'SKILL' | 'EXPERIENCE' | 'AGE';
  
  /** Description */
  description: string;
  
  /** Minimum required (exam percentile, years of experience, etc.) */
  minimum?: number;
  
  /** Is this a hard requirement? */
  isHardRequirement: boolean;
}

// ============================================================================
// EDGE TYPES
// ============================================================================

/**
 * Types of transitions between career nodes.
 */
export type TransitionType = 
  | 'EXAM_TO_DEGREE'      // Cleared exam → admission
  | 'DEGREE_TO_JOB'       // Graduation → employment
  | 'JOB_TO_JOB'          // Job change/promotion
  | 'JOB_TO_PIVOT'        // Career change preparation
  | 'PIVOT_TO_JOB'        // After pivot → new job
  | 'DEGREE_TO_DEGREE'    // Higher education
  | 'EXAM_TO_EXAM';       // Sequential exams

/**
 * An edge in the career state-transition graph.
 * 
 * Represents a possible transition between two career states.
 */
export interface CareerEdge {
  /** Unique identifier */
  id: EntityId;
  
  /** Source node */
  fromNodeId: EntityId;
  
  /** Target node */
  toNodeId: EntityId;
  
  /** Type of transition */
  transitionType: TransitionType;
  
  /** Probability of successful transition (0.0 - 1.0) */
  probability: ConfidenceScore;
  
  /** How reversible is this transition? (0.0 = irreversible, 1.0 = fully reversible) */
  reversibility: ConfidenceScore;
  
  /** Time cost in years */
  timeCost: number;
  
  /** Financial cost in INR */
  financialCost: {
    min: number;
    max: number;
    typical: number;
  };
  
  /** Difficulty of transition (0.0 = easy, 1.0 = very difficult) */
  difficulty: ConfidenceScore;
  
  /** Prerequisites for this edge */
  prerequisites: string[];
  
  /** Skills that transfer */
  transferableSkills: string[];
  
  /** New skills required */
  newSkillsRequired: string[];
  
  /** Description of the transition */
  description: string;
}

// ============================================================================
// PATH TYPES
// ============================================================================

/**
 * A path through the career graph.
 *
 * Sequence of nodes connected by edges representing a career trajectory.
 *
 * Note: This is the graph-level path structure. For the high-level evaluation
 * path used by RecommendationEngine, see types/index.ts CareerPath.
 */
export interface CareerPath {
  /** Unique identifier */
  id: EntityId;

  /** Human-readable name */
  name: string;

  /** Ordered sequence of nodes */
  nodes: CareerNode[];

  /** Edges connecting the nodes */
  edges: CareerEdge[];

  /** Total time for this path (years) - alias for totalYears */
  totalTime: number;

  /** Total financial cost (INR) */
  totalCost: number;

  /** Calculated metrics */
  metrics: PathMetrics;

  /** When this path was created */
  createdAt: number;

  // Compatibility with types/index.ts CareerPath
  /** Total years for this path (alias for totalTime) */
  totalYears?: number;

  /** Student belief this path was generated for */
  studentBeliefId?: EntityId;

  /** Scores from various evaluation engines */
  scores?: import('../types').PathScores;

  /** Whether this path has been validated by the student */
  isValidated?: boolean;

  /** When this path was generated */
  generatedAt?: number;
}

/**
 * Metrics calculated for a career path.
 */
export interface PathMetrics {
  /** Criticality: how much this path reduces future options (0.0 - 1.0) */
  criticality: number;
  
  /** Optionality: size of future opportunity space (0.0 - 1.0) */
  optionality: number;
  
  /** Path probability: likelihood of successfully completing this path */
  pathProbability: number;
  
  /** Reversibility: ease of changing course (0.0 - 1.0) */
  reversibility: number;
  
  /** Risk score: combined uncertainty (0.0 - 1.0) */
  riskScore: number;
}

// ============================================================================
// CRITICALITY & OPTIONALITY
// ============================================================================

/**
 * Criticality Analysis Result
 * 
 * Criticality = how much a decision collapses future reachable options.
 * High criticality = choosing this path closes many doors.
 */
export interface CriticalityAnalysis {
  /** The node being analyzed */
  nodeId: EntityId;
  
  /** Criticality score (0.0 = low, 1.0 = very high) */
  score: number;
  
  /** Number of options before this node */
  optionsBefore: number;
  
  /** Number of options after this node */
  optionsAfter: number;
  
  /** Options that are closed by choosing this path */
  closedOptions: ClosedOption[];
  
  /** Whether this is a point of no return */
  isPointOfNoReturn: boolean;
  
  /** Human-readable explanation */
  explanation: string;
}

/**
 * An option that is closed by a decision.
 */
export interface ClosedOption {
  /** What was closed */
  nodeId: EntityId;
  nodeName: string;
  
  /** Why it was closed */
  reason: string;
  
  /** Can it be reopened later? */
  canReopen: boolean;
  
  /** Cost to reopen */
  reopenCost?: {
    time: number;
    financial: number;
  };
}

/**
 * Optionality Analysis Result
 * 
 * Optionality = size of future reachable opportunity space.
 * High optionality = many future paths available.
 */
export interface OptionalityAnalysis {
  /** The node being analyzed */
  nodeId: EntityId;
  
  /** Optionality score (0.0 = few options, 1.0 = many options) */
  score: number;
  
  /** Number of reachable nodes from this position */
  reachableNodeCount: number;
  
  /** Reachable terminal careers (jobs) */
  reachableCareers: ReachableCareer[];
  
  /** Diversity of reachable options */
  diversity: {
    categories: string[];
    salaryRange: { min: number; max: number };
    riskLevels: number[];
  };
  
  /** Human-readable explanation */
  explanation: string;
}

/**
 * A career reachable from current position.
 */
export interface ReachableCareer {
  /** Career node */
  nodeId: EntityId;
  name: string;
  
  /** Path to reach this career */
  path: CareerPath;
  
  /** Probability of reaching this career */
  probability: number;
  
  /** Time to reach */
  timeToReach: number;
  
  /** Cost to reach */
  costToReach: number;
}

// ============================================================================
// CAREER GRAPH CLASS
// ============================================================================

/**
 * Career Graph
 * 
 * Manages nodes and edges, provides graph traversal methods,
 * and calculates criticality and optionality metrics.
 */
class CareerGraph {
  private nodes: Map<EntityId, CareerNode> = new Map();
  private edges: Map<EntityId, CareerEdge> = new Map();
  private adjacencyList: Map<EntityId, CareerEdge[]> = new Map();

  /**
   * Add a node to the graph.
   */
  addNode(node: CareerNode): void {
    this.nodes.set(node.id, node);
    if (!this.adjacencyList.has(node.id)) {
      this.adjacencyList.set(node.id, []);
    }
  }

  /**
   * Add an edge to the graph.
   */
  addEdge(edge: CareerEdge): void {
    this.edges.set(edge.id, edge);
    
    // Add to adjacency list
    const fromEdges = this.adjacencyList.get(edge.fromNodeId) || [];
    fromEdges.push(edge);
    this.adjacencyList.set(edge.fromNodeId, fromEdges);
  }

  /**
   * Get a node by ID.
   */
  getNode(id: EntityId): CareerNode | undefined {
    return this.nodes.get(id);
  }

  /**
   * Get an edge by ID.
   */
  getEdge(id: EntityId): CareerEdge | undefined {
    return this.edges.get(id);
  }

  /**
   * Get all outgoing edges from a node.
   */
  getOutgoingEdges(nodeId: EntityId): CareerEdge[] {
    return this.adjacencyList.get(nodeId) || [];
  }

  /**
   * Get all nodes in the graph.
   */
  getAllNodes(): CareerNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Get all edges in the graph.
   */
  getAllEdges(): CareerEdge[] {
    return Array.from(this.edges.values());
  }

  /**
   * Find all paths from start node to any terminal node.
   * 
   * @param startNodeId - Starting node
   * @param maxDepth - Maximum path length
   * @returns Array of career paths
   */
  findAllPaths(startNodeId: EntityId, maxDepth: number = 5): CareerPath[] {
    const paths: CareerPath[] = [];
    const visited = new Set<EntityId>();

    const dfs = (
      currentNodeId: EntityId,
      currentPath: CareerNode[],
      currentEdges: CareerEdge[],
      depth: number
    ) => {
      const node = this.getNode(currentNodeId);
      if (!node) return;

      // Add current node to path
      const newPath = [...currentPath, node];
      visited.add(currentNodeId);

      // If terminal node, save path
      if (node.isTerminal && newPath.length > 1) {
        const path = this.buildPath(newPath, currentEdges);
        paths.push(path);
      }

      // Stop if max depth reached
      if (depth >= maxDepth) {
        visited.delete(currentNodeId);
        return;
      }

      // Explore neighbors
      const edges = this.getOutgoingEdges(currentNodeId);
      for (const edge of edges) {
        if (!visited.has(edge.toNodeId)) {
          dfs(edge.toNodeId, newPath, [...currentEdges, edge], depth + 1);
        }
      }

      visited.delete(currentNodeId);
    };

    dfs(startNodeId, [], [], 0);
    return paths;
  }

  /**
   * Calculate Criticality for a node.
   * 
   * Criticality = 1 - (options_after / options_before)
   * High criticality means choosing this node significantly reduces future options.
   */
  calculateCriticality(nodeId: EntityId): CriticalityAnalysis {
    const node = this.getNode(nodeId);
    if (!node) {
      throw new Error(`Node not found: ${nodeId}`);
    }

    // Get all reachable nodes from current position
    const reachableFromHere = this.getAllReachableNodes(nodeId);
    
    // Get nodes that could have led here (reverse traversal)
    const couldHaveComeFrom = this.getNodesThatCouldLeadTo(nodeId);
    
    // Calculate what options are closed
    const closedOptions: ClosedOption[] = [];
    
    // For each node we could have come from, what paths are now closed?
    for (const prevNodeId of couldHaveComeFrom) {
      const prevReachable = this.getAllReachableNodes(prevNodeId);
      const closed = prevReachable.filter(n => !reachableFromHere.includes(n));
      
      for (const closedNodeId of closed) {
        const closedNode = this.getNode(closedNodeId);
        if (closedNode && closedNode.type === 'JOB') {
          // Check if any path exists from current node to this closed node
          const canReopen = this.pathExists(nodeId, closedNodeId, 3);
          
          closedOptions.push({
            nodeId: closedNodeId,
            nodeName: closedNode.name,
            reason: `Cannot reach ${closedNode.name} from ${node.name}`,
            canReopen,
            reopenCost: canReopen ? this.estimateReopenCost(nodeId, closedNodeId) : undefined,
          });
        }
      }
    }

    // Calculate criticality score
    // Based on: (1) number of closed options, (2) reversibility of edges taken
    const totalOptionsBefore = couldHaveComeFrom.length + reachableFromHere.length;
    const totalOptionsAfter = reachableFromHere.length;
    
    let criticalityScore = 0;
    if (totalOptionsBefore > 0) {
      criticalityScore = 1 - (totalOptionsAfter / totalOptionsBefore);
    }

    // Adjust for reversibility
    const outgoingEdges = this.getOutgoingEdges(nodeId);
    const avgReversibility = outgoingEdges.length > 0
      ? outgoingEdges.reduce((sum, e) => sum + e.reversibility, 0) / outgoingEdges.length
      : 1;
    
    // Lower reversibility = higher criticality
    criticalityScore = (criticalityScore + (1 - avgReversibility)) / 2;

    // Check if point of no return
    const isPointOfNoReturn = outgoingEdges.every(e => e.reversibility < 0.3);

    // Generate explanation
    let explanation: string;
    if (criticalityScore > 0.7) {
      explanation = `This is a HIGH criticality decision. Choosing ${node.name} closes ${closedOptions.length} career paths and is difficult to reverse.`;
    } else if (criticalityScore > 0.4) {
      explanation = `This is a MODERATE criticality decision. ${node.name} reduces some future options but maintains reasonable flexibility.`;
    } else {
      explanation = `This is a LOW criticality decision. ${node.name} keeps most future options open.`;
    }

    return {
      nodeId,
      score: Math.min(1, Math.max(0, criticalityScore)),
      optionsBefore: totalOptionsBefore,
      optionsAfter: totalOptionsAfter,
      closedOptions: closedOptions.slice(0, 10), // Limit to top 10
      isPointOfNoReturn,
      explanation,
    };
  }

  /**
   * Calculate Optionality for a node.
   * 
   * Optionality = measure of future opportunity space size.
   * High optionality means many diverse paths available.
   */
  calculateOptionality(nodeId: EntityId, maxDepth: number = 4): OptionalityAnalysis {
    const node = this.getNode(nodeId);
    if (!node) {
      throw new Error(`Node not found: ${nodeId}`);
    }

    // Find all reachable terminal careers
    const reachableCareers: ReachableCareer[] = [];
    const visited = new Set<EntityId>();
    const categories = new Set<string>();
    const salaryMinMax = { min: Infinity, max: 0 };
    const riskLevels: number[] = [];

    const dfs = (
      currentId: EntityId,
      currentPath: CareerNode[],
      currentEdges: CareerEdge[],
      cumulativeProbability: number,
      cumulativeTime: number,
      cumulativeCost: number,
      depth: number
    ) => {
      const current = this.getNode(currentId);
      if (!current) return;

      visited.add(currentId);

      // If terminal job node, add to reachable careers
      if (current.type === 'JOB' && current.isTerminal) {
        const path = this.buildPath([...currentPath, current], currentEdges);
        
        reachableCareers.push({
          nodeId: currentId,
          name: current.name,
          path,
          probability: cumulativeProbability,
          timeToReach: cumulativeTime,
          costToReach: cumulativeCost,
        });

        // Track diversity metrics
        categories.add(current.category);
        if (current.outcomes.averageSalary) {
          salaryMinMax.min = Math.min(salaryMinMax.min, current.outcomes.averageSalary);
          salaryMinMax.max = Math.max(salaryMinMax.max, current.outcomes.averageSalary);
        }
        riskLevels.push(1 - cumulativeProbability);
      }

      if (depth >= maxDepth) {
        visited.delete(currentId);
        return;
      }

      // Explore neighbors
      const edges = this.getOutgoingEdges(currentId);
      for (const edge of edges) {
        if (!visited.has(edge.toNodeId)) {
          const nextProb = cumulativeProbability * edge.probability;
          const nextTime = cumulativeTime + edge.timeCost;
          const nextCost = cumulativeCost + edge.financialCost.typical;
          
          dfs(
            edge.toNodeId,
            [...currentPath, current],
            [...currentEdges, edge],
            nextProb,
            nextTime,
            nextCost,
            depth + 1
          );
        }
      }

      visited.delete(currentId);
    };

    dfs(nodeId, [], [], 1, 0, 0, 0);

    // Calculate optionality score
    // Factors: (1) number of options, (2) diversity, (3) probability-weighted reachability
    const rawOptionality = reachableCareers.length;
    const categoryDiversity = categories.size;
    const avgProbability = reachableCareers.length > 0
      ? reachableCareers.reduce((sum, c) => sum + c.probability, 0) / reachableCareers.length
      : 0;

    // Normalize to 0-1 scale (assuming 20+ careers = max optionality)
    const normalizedCount = Math.min(1, rawOptionality / 20);
    const normalizedDiversity = Math.min(1, categoryDiversity / 5);

    const optionalityScore = (
      normalizedCount * 0.4 +
      normalizedDiversity * 0.3 +
      avgProbability * 0.3
    );

    // Generate explanation
    let explanation: string;
    if (optionalityScore > 0.7) {
      explanation = `${node.name} offers HIGH optionality with ${reachableCareers.length} reachable careers across ${categories.size} different fields.`;
    } else if (optionalityScore > 0.4) {
      explanation = `${node.name} offers MODERATE optionality with ${reachableCareers.length} career paths available.`;
    } else {
      explanation = `${node.name} has LOW optionality with limited future paths. Consider if this specialization aligns with your goals.`;
    }

    return {
      nodeId,
      score: Math.min(1, Math.max(0, optionalityScore)),
      reachableNodeCount: reachableCareers.length,
      reachableCareers: reachableCareers.slice(0, 10), // Top 10
      diversity: {
        categories: Array.from(categories),
        salaryRange: {
          min: salaryMinMax.min === Infinity ? 0 : salaryMinMax.min,
          max: salaryMinMax.max,
        },
        riskLevels,
      },
      explanation,
    };
  }

  // ========================================================================
  // PRIVATE HELPER METHODS
  // ========================================================================

  /**
   * Build a CareerPath from nodes and edges.
   */
  private buildPath(nodes: CareerNode[], edges: CareerEdge[]): CareerPath {
    const totalTime = edges.reduce((sum, e) => sum + e.timeCost, 0);
    const totalCost = edges.reduce((sum, e) => sum + e.financialCost.typical, 0);
    
    // Calculate path probability
    const pathProbability = edges.reduce((prod, e) => prod * e.probability, 1);
    
    // Calculate reversibility (minimum of all edges)
    const reversibility = edges.length > 0
      ? Math.min(...edges.map(e => e.reversibility))
      : 1;

    // Calculate criticality and optionality for the path
    const criticality = this.calculatePathCriticality(nodes);
    const optionality = edges.length > 0
      ? edges[edges.length - 1].reversibility // Last edge's reversibility proxy
      : 1;

    // Risk score
    const riskScore = 1 - (pathProbability * reversibility);

    return {
      id: `path_${nodes[0].id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: this.generatePathName(nodes),
      nodes,
      edges,
      totalTime,
      totalCost,
      metrics: {
        criticality,
        optionality,
        pathProbability,
        reversibility,
        riskScore,
      },
      createdAt: Date.now(),
    };
  }

  /**
   * Generate a human-readable name for a path.
   */
  private generatePathName(nodes: CareerNode[]): string {
    if (nodes.length === 0) return 'Empty Path';
    if (nodes.length === 1) return nodes[0].name;
    
    const start = nodes[0].name;
    const end = nodes[nodes.length - 1].name;
    
    if (nodes.length === 2) {
      return `${start} → ${end}`;
    }
    
    return `${start} → ... → ${end}`;
  }

  /**
   * Get all nodes reachable from a given node.
   */
  private getAllReachableNodes(startId: EntityId): EntityId[] {
    const reachable: EntityId[] = [];
    const visited = new Set<EntityId>();
    const stack = [startId];

    while (stack.length > 0) {
      const currentId = stack.pop()!;
      if (visited.has(currentId)) continue;
      
      visited.add(currentId);
      reachable.push(currentId);

      const edges = this.getOutgoingEdges(currentId);
      for (const edge of edges) {
        if (!visited.has(edge.toNodeId)) {
          stack.push(edge.toNodeId);
        }
      }
    }

    return reachable;
  }

  /**
   * Get all nodes that could lead to a given node (reverse adjacency).
   */
  private getNodesThatCouldLeadTo(targetId: EntityId): EntityId[] {
    const predecessors: EntityId[] = [];
    
    for (const edge of this.edges.values()) {
      if (edge.toNodeId === targetId) {
        predecessors.push(edge.fromNodeId);
      }
    }

    return predecessors;
  }

  /**
   * Check if a path exists between two nodes within max depth.
   */
  private pathExists(fromId: EntityId, toId: EntityId, maxDepth: number): boolean {
    const visited = new Set<EntityId>();
    const queue: { id: EntityId; depth: number }[] = [{ id: fromId, depth: 0 }];

    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;
      
      if (id === toId) return true;
      if (depth >= maxDepth) continue;
      if (visited.has(id)) continue;
      
      visited.add(id);

      const edges = this.getOutgoingEdges(id);
      for (const edge of edges) {
        if (!visited.has(edge.toNodeId)) {
          queue.push({ id: edge.toNodeId, depth: depth + 1 });
        }
      }
    }

    return false;
  }

  /**
   * Estimate cost to reopen a closed option.
   */
  private estimateReopenCost(fromId: EntityId, toId: EntityId): { time: number; financial: number } {
    // Find shortest path
    const path = this.findShortestPath(fromId, toId);
    
    if (!path) {
      return { time: 5, financial: 500000 }; // Default high cost
    }

    return {
      time: path.totalTime,
      financial: path.totalCost,
    };
  }

  /**
   * Find shortest path between two nodes (Dijkstra's algorithm simplified).
   */
  private findShortestPath(fromId: EntityId, toId: EntityId): CareerPath | null {
    const distances = new Map<EntityId, number>();
    const previous = new Map<EntityId, CareerEdge | null>();
    const unvisited = new Set<EntityId>();

    // Initialize
    for (const nodeId of this.nodes.keys()) {
      distances.set(nodeId, nodeId === fromId ? 0 : Infinity);
      previous.set(nodeId, null);
      unvisited.add(nodeId);
    }

    while (unvisited.size > 0) {
      // Find minimum distance node
      let currentId: EntityId | null = null;
      let minDistance = Infinity;
      
      for (const nodeId of unvisited) {
        const dist = distances.get(nodeId)!;
        if (dist < minDistance) {
          minDistance = dist;
          currentId = nodeId;
        }
      }

      if (currentId === null || currentId === toId) break;
      unvisited.delete(currentId);

      // Update distances to neighbors
      const edges = this.getOutgoingEdges(currentId);
      for (const edge of edges) {
        if (unvisited.has(edge.toNodeId)) {
          const alt = minDistance + edge.timeCost;
          if (alt < distances.get(edge.toNodeId)!) {
            distances.set(edge.toNodeId, alt);
            previous.set(edge.toNodeId, edge);
          }
        }
      }
    }

    // Reconstruct path
    if (distances.get(toId) === Infinity) {
      return null;
    }

    const pathNodes: CareerNode[] = [];
    const pathEdges: CareerEdge[] = [];
    let current: EntityId | null = toId;

    while (current !== null) {
      const node = this.getNode(current);
      if (node) pathNodes.unshift(node);
      
      const edge = previous.get(current);
      if (edge) {
        pathEdges.unshift(edge);
        current = edge.fromNodeId;
      } else {
        current = null;
      }
    }

    return this.buildPath(pathNodes, pathEdges);
  }

  /**
   * Calculate criticality for an entire path.
   */
  private calculatePathCriticality(nodes: CareerNode[]): number {
    if (nodes.length < 2) return 0;

    // Average criticality across all nodes in path
    let totalCriticality = 0;
    let count = 0;

    for (const node of nodes) {
      try {
        const analysis = this.calculateCriticality(node.id);
        totalCriticality += analysis.score;
        count++;
      } catch {
        // Skip if can't calculate
      }
    }

    return count > 0 ? totalCriticality / count : 0;
  }
}

// ============================================================================
// EXAMPLE GRAPHS
// ============================================================================

/**
 * Create the example India-focused career graph.
 *
 * Paths:
 *   JEE → IIT → B.Tech → Software Engineer
 *   JEE → NIT → B.Tech → Product Manager
 *   NEET → MBBS → Doctor
 */
function createIndiaCareerGraph(): CareerGraph {
  const graph = new CareerGraph();

  // ========================================================================
  // EXAM NODES
  // ========================================================================

  const jeeExam: CareerNode = {
    id: 'exam_jee',
    name: 'JEE (Joint Entrance Examination)',
    type: 'EXAM',
    description: 'Entrance exam for IITs, NITs, and other engineering colleges',
    category: 'Engineering',
    typicalDuration: 0.5, // 6 months prep + exam
    financialCost: { min: 10000, max: 200000, typical: 50000 },
    prerequisites: [],
    skillsGained: ['Problem Solving', 'Time Management', 'Test Taking'],
    outcomes: {},
    isTerminal: false,
    popularity: 0.9,
  };

  const neetExam: CareerNode = {
    id: 'exam_neet',
    name: 'NEET (National Eligibility cum Entrance Test)',
    type: 'EXAM',
    description: 'Entrance exam for medical colleges in India',
    category: 'Medicine',
    typicalDuration: 1, // 1 year prep
    financialCost: { min: 20000, max: 300000, typical: 100000 },
    prerequisites: [],
    skillsGained: ['Biological Sciences', 'Chemistry', 'Test Taking'],
    outcomes: {},
    isTerminal: false,
    popularity: 0.8,
  };

  // ========================================================================
  // DEGREE NODES
  // ========================================================================

  const iitDegree: CareerNode = {
    id: 'degree_iit_btech',
    name: 'B.Tech from IIT',
    type: 'DEGREE',
    description: 'Bachelor of Technology from Indian Institute of Technology',
    category: 'Engineering',
    typicalDuration: 4,
    financialCost: { min: 400000, max: 1000000, typical: 800000 },
    prerequisites: [{ type: 'EXAM', description: 'JEE Advanced', isHardRequirement: true }],
    skillsGained: ['Engineering Fundamentals', 'Programming', 'Technical Problem Solving'],
    outcomes: {
      averageSalary: 1500000, // 15 LPA
      jobSecurity: 0.7,
      growthPotential: 0.9,
      workLifeBalance: 0.6,
    },
    isTerminal: false,
    popularity: 0.85,
  };

  const nitDegree: CareerNode = {
    id: 'degree_nit_btech',
    name: 'B.Tech from NIT',
    type: 'DEGREE',
    description: 'Bachelor of Technology from National Institute of Technology',
    category: 'Engineering',
    typicalDuration: 4,
    financialCost: { min: 300000, max: 800000, typical: 600000 },
    prerequisites: [{ type: 'EXAM', description: 'JEE Main', isHardRequirement: true }],
    skillsGained: ['Engineering Fundamentals', 'Programming', 'Technical Problem Solving'],
    outcomes: {
      averageSalary: 800000, // 8 LPA
      jobSecurity: 0.7,
      growthPotential: 0.8,
      workLifeBalance: 0.6,
    },
    isTerminal: false,
    popularity: 0.75,
  };

  const mbbsDegree: CareerNode = {
    id: 'degree_mbbs',
    name: 'MBBS',
    type: 'DEGREE',
    description: 'Bachelor of Medicine and Bachelor of Surgery',
    category: 'Medicine',
    typicalDuration: 5.5,
    financialCost: { min: 50000, max: 5000000, typical: 1000000 },
    prerequisites: [{ type: 'EXAM', description: 'NEET', isHardRequirement: true }],
    skillsGained: ['Medical Knowledge', 'Patient Care', 'Clinical Skills'],
    outcomes: {
      averageSalary: 1200000, // 12 LPA initially
      jobSecurity: 0.95,
      growthPotential: 0.85,
      workLifeBalance: 0.4,
    },
    isTerminal: false,
    popularity: 0.7,
  };

  // ========================================================================
  // JOB NODES
  // ========================================================================

  const softwareEngineer: CareerNode = {
    id: 'job_software_engineer',
    name: 'Software Engineer',
    type: 'JOB',
    description: 'Develops software applications and systems',
    category: 'Engineering',
    typicalDuration: 0,
    financialCost: { min: 0, max: 0, typical: 0 },
    prerequisites: [{ type: 'DEGREE', description: 'B.Tech or equivalent', isHardRequirement: false }],
    skillsGained: ['Software Development', 'System Design', 'Team Collaboration'],
    outcomes: {
      averageSalary: 1500000,
      jobSecurity: 0.7,
      growthPotential: 0.9,
      workLifeBalance: 0.6,
    },
    isTerminal: true,
    popularity: 0.9,
  };

  const productManager: CareerNode = {
    id: 'job_product_manager',
    name: 'Product Manager',
    type: 'JOB',
    description: 'Manages product development and strategy',
    category: 'Business',
    typicalDuration: 0,
    financialCost: { min: 0, max: 0, typical: 0 },
    prerequisites: [
      { type: 'DEGREE', description: 'B.Tech or MBA', isHardRequirement: false },
      { type: 'EXPERIENCE', description: '2+ years experience', isHardRequirement: false },
    ],
    skillsGained: ['Product Strategy', 'Stakeholder Management', 'Market Analysis'],
    outcomes: {
      averageSalary: 2000000,
      jobSecurity: 0.6,
      growthPotential: 0.85,
      workLifeBalance: 0.5,
    },
    isTerminal: true,
    popularity: 0.6,
  };

  const doctor: CareerNode = {
    id: 'job_doctor',
    name: 'Doctor (General Practitioner)',
    type: 'JOB',
    description: 'Medical doctor providing patient care',
    category: 'Medicine',
    typicalDuration: 0,
    financialCost: { min: 0, max: 0, typical: 0 },
    prerequisites: [
      { type: 'DEGREE', description: 'MBBS', isHardRequirement: true },
      { type: 'EXPERIENCE', description: 'Internship', isHardRequirement: true },
    ],
    skillsGained: ['Patient Care', 'Diagnosis', 'Medical Practice'],
    outcomes: {
      averageSalary: 1500000,
      jobSecurity: 0.95,
      growthPotential: 0.85,
      workLifeBalance: 0.4,
    },
    isTerminal: true,
    popularity: 0.8,
  };

  // ========================================================================
  // EDGES
  // ========================================================================

  // JEE → IIT
  const jeeToIit: CareerEdge = {
    id: 'edge_jee_iit',
    fromNodeId: 'exam_jee',
    toNodeId: 'degree_iit_btech',
    transitionType: 'EXAM_TO_DEGREE',
    probability: 0.02, // Very competitive
    reversibility: 0.1,
    timeCost: 0.5,
    financialCost: { min: 100000, max: 500000, typical: 200000 },
    difficulty: 0.95,
    prerequisites: ['Clear JEE Advanced'],
    transferableSkills: [],
    newSkillsRequired: ['Advanced Mathematics', 'Physics', 'Chemistry'],
    description: 'Clear JEE Advanced to get admission to IIT',
  };

  // JEE → NIT
  const jeeToNit: CareerEdge = {
    id: 'edge_jee_nit',
    fromNodeId: 'exam_jee',
    toNodeId: 'degree_nit_btech',
    transitionType: 'EXAM_TO_DEGREE',
    probability: 0.15, // More achievable
    reversibility: 0.2,
    timeCost: 0.5,
    financialCost: { min: 50000, max: 300000, typical: 150000 },
    difficulty: 0.8,
    prerequisites: ['Clear JEE Main with good rank'],
    transferableSkills: [],
    newSkillsRequired: ['Mathematics', 'Physics', 'Chemistry'],
    description: 'Clear JEE Main to get admission to NIT',
  };

  // NEET → MBBS
  const neetToMbbs: CareerEdge = {
    id: 'edge_neet_mbbs',
    fromNodeId: 'exam_neet',
    toNodeId: 'degree_mbbs',
    transitionType: 'EXAM_TO_DEGREE',
    probability: 0.05, // Very competitive
    reversibility: 0.05,
    timeCost: 1,
    financialCost: { min: 50000, max: 2000000, typical: 500000 },
    difficulty: 0.95,
    prerequisites: ['Clear NEET with good rank'],
    transferableSkills: [],
    newSkillsRequired: ['Biology', 'Chemistry', 'Physics'],
    description: 'Clear NEET to get admission to medical college',
  };

  // IIT → Software Engineer
  const iitToSoftware: CareerEdge = {
    id: 'edge_iit_software',
    fromNodeId: 'degree_iit_btech',
    toNodeId: 'job_software_engineer',
    transitionType: 'DEGREE_TO_JOB',
    probability: 0.8, // High placement rates at IITs
    reversibility: 0.6,
    timeCost: 0.5,
    financialCost: { min: 0, max: 50000, typical: 10000 },
    difficulty: 0.3,
    prerequisites: [],
    transferableSkills: ['Programming', 'Problem Solving'],
    newSkillsRequired: ['Industry Practices', 'Code Review'],
    description: 'Campus placement or off-campus hiring',
  };

  // NIT → Software Engineer
  const nitToSoftware: CareerEdge = {
    id: 'edge_nit_software',
    fromNodeId: 'degree_nit_btech',
    toNodeId: 'job_software_engineer',
    transitionType: 'DEGREE_TO_JOB',
    probability: 0.6, // Good but lower than IIT
    reversibility: 0.6,
    timeCost: 0.5,
    financialCost: { min: 0, max: 50000, typical: 10000 },
    difficulty: 0.4,
    prerequisites: [],
    transferableSkills: ['Programming', 'Problem Solving'],
    newSkillsRequired: ['Industry Practices'],
    description: 'Campus placement or off-campus hiring',
  };

  // IIT → Product Manager
  const iitToPm: CareerEdge = {
    id: 'edge_iit_pm',
    fromNodeId: 'degree_iit_btech',
    toNodeId: 'job_product_manager',
    transitionType: 'DEGREE_TO_JOB',
    probability: 0.1, // Requires additional skills/experience
    reversibility: 0.5,
    timeCost: 2, // Usually after some experience
    financialCost: { min: 0, max: 500000, typical: 100000 },
    difficulty: 0.7,
    prerequisites: ['Some work experience or MBA'],
    transferableSkills: ['Technical Knowledge', 'Problem Solving'],
    newSkillsRequired: ['Business Acumen', 'Communication', 'Leadership'],
    description: 'Transition to product management after experience or MBA',
  };

  // NIT → Product Manager
  const nitToPm: CareerEdge = {
    id: 'edge_nit_pm',
    fromNodeId: 'degree_nit_btech',
    toNodeId: 'job_product_manager',
    transitionType: 'DEGREE_TO_JOB',
    probability: 0.08,
    reversibility: 0.5,
    timeCost: 3,
    financialCost: { min: 0, max: 500000, typical: 150000 },
    difficulty: 0.75,
    prerequisites: ['Work experience + possibly MBA'],
    transferableSkills: ['Technical Knowledge'],
    newSkillsRequired: ['Business Acumen', 'Communication'],
    description: 'Transition to product management after experience',
  };

  // MBBS → Doctor
  const mbbsToDoctor: CareerEdge = {
    id: 'edge_mbbs_doctor',
    fromNodeId: 'degree_mbbs',
    toNodeId: 'job_doctor',
    transitionType: 'DEGREE_TO_JOB',
    probability: 0.9, // Almost guaranteed after MBBS + internship
    reversibility: 0.2,
    timeCost: 1, // Internship year
    financialCost: { min: 0, max: 100000, typical: 0 },
    difficulty: 0.2,
    prerequisites: ['Complete internship'],
    transferableSkills: ['Medical Knowledge', 'Clinical Skills'],
    newSkillsRequired: ['Independent Practice'],
    description: 'Start medical practice after completing degree and internship',
  };

  // Add all nodes
  graph.addNode(jeeExam);
  graph.addNode(neetExam);
  graph.addNode(iitDegree);
  graph.addNode(nitDegree);
  graph.addNode(mbbsDegree);
  graph.addNode(softwareEngineer);
  graph.addNode(productManager);
  graph.addNode(doctor);

  // Add all edges
  graph.addEdge(jeeToIit);
  graph.addEdge(jeeToNit);
  graph.addEdge(neetToMbbs);
  graph.addEdge(iitToSoftware);
  graph.addEdge(nitToSoftware);
  graph.addEdge(iitToPm);
  graph.addEdge(nitToPm);
  graph.addEdge(mbbsToDoctor);

  return graph;
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  CareerGraph,
  createIndiaCareerGraph,
};
