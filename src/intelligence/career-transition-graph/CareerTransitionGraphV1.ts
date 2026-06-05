/**
 * CareerOS Career Transition Graph V1
 *
 * CareerOS - Career Intelligence System
 *
 * Represents careers as a connected graph rather than isolated profiles.
 * Enables pathfinding, transition analysis, and future opportunity exploration.
 *
 * Architecture Principles:
 *   - Graph-based: Careers are nodes, transitions are edges
 *   - Weighted edges: Each transition has difficulty, time, probability
 *   - Deterministic: Same input always produces same output
 *   - Scalable: Supports 150+ careers efficiently
 *   - Type-safe: Full TypeScript coverage
 *
 * Node: Represents a career (e.g., Software Engineer, Doctor, Lawyer)
 * Edge: Represents a realistic career transition with properties
 *
 * Example Transitions:
 *   Software Engineer → Senior Engineer → Staff Engineer → CTO
 *   Software Engineer → Product Manager
 *   Software Engineer → Founder
 *   Doctor → Specialist
 *   Doctor → Hospital Administrator
 *   Lawyer → Corporate Counsel
 *   Lawyer → Judge
 */

import type { Career, PsychologicalProfile, SkillProfile } from '../../domains/career/Career';

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * Unique identifier for graph entities.
 */
export type NodeId = string;
export type EdgeId = string;

/**
 * A career node in the transition graph.
 */
export interface CareerNode {
  /** Unique identifier (matches Career.id) */
  id: NodeId;

  /** Human-readable name */
  name: string;

  /** Career category */
  category: string;

  /** Brief description */
  description: string;

  /** Required psychological profile for this career */
  requiredProfile: PsychologicalProfile;

  /** Key skills for this career */
  keySkills: string[];

  /** Skill categories this career belongs to */
  skillCategories: SkillCategory[];

  /** Typical years of experience to reach this level */
  typicalExperienceYears: number;

  /** Income level (normalized 0-1) */
  incomeLevel: number;

  /** Whether this is an entry-level position */
  isEntryLevel: boolean;

  /** Whether this is a terminal/senior position */
  isTerminal: boolean;

  /** Related career IDs */
  relatedCareers: NodeId[];

  /** Career metadata */
  metadata: {
    /** Demand level in job market (0-1) */
    demandLevel: number;

    /** Growth outlook (0-1) */
    growthOutlook: number;

    /** When this node was added to graph */
    addedAt: number;
  };
}

/**
 * Skill categories for classification.
 */
export type SkillCategory =
  | 'technical'
  | 'business'
  | 'creative'
  | 'healthcare'
  | 'legal'
  | 'education'
  | 'operations'
  | 'research'
  | 'leadership';

/**
 * An edge representing a career transition.
 */
export interface CareerEdge {
  /** Unique identifier */
  id: EdgeId;

  /** Source career node */
  fromNodeId: NodeId;

  /** Target career node */
  toNodeId: NodeId;

  /** Transition difficulty (0-100, higher = harder) */
  transitionDifficulty: number;

  /** Time required for transition in years */
  transitionTimeYears: number;

  /** Skill overlap between careers (0-1) */
  skillOverlap: number;

  /** Probability of successful transition (0-1) */
  probabilityOfSuccess: number;

  /** How reversible is this transition (0-1, 1 = easily reversible) */
  reversibility: number;

  /** Type of transition */
  transitionType: TransitionType;

  /** Description of the transition path */
  description: string;

  /** Prerequisites for this transition */
  prerequisites: TransitionPrerequisite[];

  /** Skills that transfer well */
  transferableSkills: string[];

  /** New skills required */
  skillsToAcquire: string[];

  /** Common paths people take for this transition */
  commonPaths: string[];

  /** Estimated financial cost of transition (INR) */
  financialCost: {
    min: number;
    max: number;
    typical: number;
  };

  /** Edge metadata */
  metadata: {
    /** How common is this transition */
    frequency: 'common' | 'uncommon' | 'rare';

    /** Data confidence (0-1) */
    confidence: number;

    /** When this edge was added */
    addedAt: number;
  };
}

/**
 * Types of career transitions.
 */
export type TransitionType =
  | 'promotion'           // Same track, higher level (SE → Senior SE)
  | 'lateral'             // Same level, different role (SE → PM)
  | 'pivot'               // Different track (Doctor → Hospital Admin)
  | 'entrepreneurship'    // Employee → Founder
  | 'specialization'      // Generalist → Specialist
  | 'generalization'      // Specialist → Generalist
  | 'academia'            // Industry → Academia
  | 'industry'            // Academia → Industry
  | 'consulting'          // Full-time → Consulting
  | 'freelance'           // Full-time → Freelance
  | 'return';             // Return to previous career

/**
 * Prerequisite for a career transition.
 */
export interface TransitionPrerequisite {
  /** Type of prerequisite */
  type: 'education' | 'certification' | 'experience' | 'skill' | 'network' | 'financial';

  /** Description */
  description: string;

  /** Is this a hard requirement */
  isRequired: boolean;

  /** Importance weight (0-1) */
  importance: number;
}

/**
 * A path through the career graph.
 */
export interface CareerTransitionPath {
  /** Unique identifier */
  id: string;

  /** Path name/description */
  name: string;

  /** Ordered sequence of node IDs */
  nodeIds: NodeId[];

  /** Edges connecting the nodes */
  edges: CareerEdge[];

  /** Total metrics for the path */
  totalMetrics: {
    /** Total years for this path */
    totalYears: number;

    /** Total difficulty (sum of edge difficulties) */
    totalDifficulty: number;

    /** Average probability of success */
    averageProbability: number;

    /** Overall skill overlap */
    overallSkillOverlap: number;

    /** Total financial cost */
    totalFinancialCost: number;

    /** Path reversibility (minimum of edge reversibilities) */
    pathReversibility: number;
  };

  /** Path quality assessment */
  quality: {
    /** Is this a recommended path */
    isRecommended: boolean;

    /** Risk level */
    riskLevel: 'low' | 'medium' | 'high';

    /** Confidence in this path (0-1) */
    confidence: number;
  };
}

/**
 * Result of adjacency query.
 */
export interface AdjacentCareer {
  /** Career node */
  node: CareerNode;

  /** Edge connecting to this career */
  edge: CareerEdge;

  /** Direction of relationship */
  direction: 'to' | 'from';

  /** Calculated transition score (0-1) */
  transitionScore: number;
}

/**
 * Result of reachability analysis.
 */
export interface ReachableCareer {
  /** Career node */
  node: CareerNode;

  /** Shortest path from source */
  shortestPath: CareerTransitionPath;

  /** Minimum transitions required */
  minTransitions: number;

  /** Minimum years to reach */
  minYears: number;

  /** Cumulative probability of reaching */
  cumulativeProbability: number;
}

/**
 * Graph statistics.
 */
export interface GraphStatistics {
  /** Total number of career nodes */
  totalNodes: number;

  /** Total number of transition edges */
  totalEdges: number;

  /** Average node degree (connections per node) */
  averageDegree: number;

  /** Graph density (0-1) */
  density: number;

  /** Number of connected components */
  connectedComponents: number;

  /** Largest component size */
  largestComponentSize: number;

  /** Average path length between connected nodes */
  averagePathLength: number;

  /** Career categories in graph */
  categories: string[];

  /** Nodes by category */
  nodesByCategory: Map<string, number>;
}

/**
 * Options for graph operations.
 */
export interface GraphTraversalOptions {
  /** Maximum depth for traversal (default: unlimited) */
  maxDepth?: number;

  /** Minimum probability threshold (default: 0) */
  minProbability?: number;

  /** Maximum transition difficulty (default: 100) */
  maxDifficulty?: number;

  /** Maximum transition time in years (default: unlimited) */
  maxTimeYears?: number;

  /** Filter by transition types */
  transitionTypes?: TransitionType[];

  /** Filter by categories */
  categories?: string[];

  /** Include only reversible transitions */
  reversibleOnly?: boolean;

  /** Maximum number of results (default: unlimited) */
  limit?: number;
}

/**
 * Options for shortest path calculation.
 */
export interface ShortestPathOptions {
  /** Weight function for edges (default: time) */
  weightBy?: 'time' | 'difficulty' | 'probability' | 'combined';

  /** Minimum probability threshold */
  minProbability?: number;

  /** Maximum difficulty threshold */
  maxDifficulty?: number;

  /** Avoid these node IDs */
  avoidNodes?: NodeId[];

  /** Avoid these edge IDs */
  avoidEdges?: EdgeId[];
}

// ============================================================================
// CAREER TRANSITION GRAPH
// ============================================================================

export class CareerTransitionGraphV1 {
  private nodes: Map<NodeId, CareerNode> = new Map();
  private edges: Map<EdgeId, CareerEdge> = new Map();
  private adjacencyList: Map<NodeId, Set<EdgeId>> = new Map();
  private reverseAdjacencyList: Map<NodeId, Set<EdgeId>> = new Map();

  /**
   * Add a career node to the graph.
   */
  addNode(node: CareerNode): void {
    if (this.nodes.has(node.id)) {
      throw new Error(`Node with ID ${node.id} already exists`);
    }

    this.nodes.set(node.id, node);
    this.adjacencyList.set(node.id, new Set());
    this.reverseAdjacencyList.set(node.id, new Set());
  }

  /**
   * Remove a career node and all its connected edges.
   */
  removeNode(nodeId: NodeId): boolean {
    if (!this.nodes.has(nodeId)) {
      return false;
    }

    // Remove all connected edges
    const outgoingEdges = this.adjacencyList.get(nodeId) || new Set();
    const incomingEdges = this.reverseAdjacencyList.get(nodeId) || new Set();

    for (const edgeId of outgoingEdges) {
      this.removeEdge(edgeId);
    }

    for (const edgeId of incomingEdges) {
      this.removeEdge(edgeId);
    }

    // Remove node
    this.nodes.delete(nodeId);
    this.adjacencyList.delete(nodeId);
    this.reverseAdjacencyList.delete(nodeId);

    return true;
  }

  /**
   * Get a career node by ID.
   */
  getNode(nodeId: NodeId): CareerNode | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * Check if a node exists.
   */
  hasNode(nodeId: NodeId): boolean {
    return this.nodes.has(nodeId);
  }

  /**
   * Get all career nodes.
   */
  getAllNodes(): CareerNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Get nodes by category.
   */
  getNodesByCategory(category: string): CareerNode[] {
    return this.getAllNodes().filter(node => node.category === category);
  }

  /**
   * Add a transition edge between careers.
   */
  addEdge(edge: CareerEdge): void {
    // Validate nodes exist
    if (!this.nodes.has(edge.fromNodeId)) {
      throw new Error(`Source node ${edge.fromNodeId} does not exist`);
    }
    if (!this.nodes.has(edge.toNodeId)) {
      throw new Error(`Target node ${edge.toNodeId} does not exist`);
    }

    // Check for duplicate edge
    const existingEdge = this.findEdge(edge.fromNodeId, edge.toNodeId);
    if (existingEdge) {
      throw new Error(`Edge from ${edge.fromNodeId} to ${edge.toNodeId} already exists`);
    }

    this.edges.set(edge.id, edge);
    this.adjacencyList.get(edge.fromNodeId)!.add(edge.id);
    this.reverseAdjacencyList.get(edge.toNodeId)!.add(edge.id);
  }

  /**
   * Remove a transition edge.
   */
  removeEdge(edgeId: EdgeId): boolean {
    const edge = this.edges.get(edgeId);
    if (!edge) {
      return false;
    }

    this.edges.delete(edgeId);
    this.adjacencyList.get(edge.fromNodeId)?.delete(edgeId);
    this.reverseAdjacencyList.get(edge.toNodeId)?.delete(edgeId);

    return true;
  }

  /**
   * Get an edge by ID.
   */
  getEdge(edgeId: EdgeId): CareerEdge | undefined {
    return this.edges.get(edgeId);
  }

  /**
   * Find edge between two nodes.
   */
  findEdge(fromNodeId: NodeId, toNodeId: NodeId): CareerEdge | undefined {
    const outgoingEdges = this.adjacencyList.get(fromNodeId);
    if (!outgoingEdges) return undefined;

    for (const edgeId of outgoingEdges) {
      const edge = this.edges.get(edgeId);
      if (edge && edge.toNodeId === toNodeId) {
        return edge;
      }
    }

    return undefined;
  }

  /**
   * Get all edges.
   */
  getAllEdges(): CareerEdge[] {
    return Array.from(this.edges.values());
  }

  /**
   * Get edges from a specific node.
   */
  getEdgesFrom(nodeId: NodeId): CareerEdge[] {
    const edgeIds = this.adjacencyList.get(nodeId);
    if (!edgeIds) return [];

    return Array.from(edgeIds)
      .map(id => this.edges.get(id))
      .filter((edge): edge is CareerEdge => edge !== undefined);
  }

  /**
   * Get edges to a specific node.
   */
  getEdgesTo(nodeId: NodeId): CareerEdge[] {
    const edgeIds = this.reverseAdjacencyList.get(nodeId);
    if (!edgeIds) return [];

    return Array.from(edgeIds)
      .map(id => this.edges.get(id))
      .filter((edge): edge is CareerEdge => edge !== undefined);
  }

  // ============================================================================
  // GRAPH TRAVERSAL METHODS
  // ============================================================================

  /**
   * Get adjacent careers (direct connections).
   */
  getAdjacentCareers(nodeId: NodeId, options: GraphTraversalOptions = {}): AdjacentCareer[] {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} does not exist`);
    }

    const adjacent: AdjacentCareer[] = [];

    // Outgoing edges (careers you can transition to)
    const outgoingEdges = this.getEdgesFrom(nodeId);
    for (const edge of outgoingEdges) {
      if (this.matchesTraversalOptions(edge, options)) {
        const targetNode = this.nodes.get(edge.toNodeId);
        if (targetNode) {
          adjacent.push({
            node: targetNode,
            edge,
            direction: 'to',
            transitionScore: this.calculateTransitionScore(edge),
          });
        }
      }
    }

    // Incoming edges (careers you can transition from)
    if (!options.transitionTypes || options.transitionTypes.length === 0) {
      const incomingEdges = this.getEdgesTo(nodeId);
      for (const edge of incomingEdges) {
        if (this.matchesTraversalOptions(edge, options)) {
          const sourceNode = this.nodes.get(edge.fromNodeId);
          if (sourceNode) {
            adjacent.push({
              node: sourceNode,
              edge,
              direction: 'from',
              transitionScore: this.calculateTransitionScore(edge),
            });
          }
        }
      }
    }

    // Sort by transition score (highest first)
    adjacent.sort((a, b) => b.transitionScore - a.transitionScore);

    // Apply limit
    if (options.limit && options.limit > 0) {
      return adjacent.slice(0, options.limit);
    }

    return adjacent;
  }

  /**
   * Get all reachable careers (within max depth).
   */
  getReachableCareers(nodeId: NodeId, options: GraphTraversalOptions = {}): ReachableCareer[] {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} does not exist`);
    }

    const maxDepth = options.maxDepth ?? 5;
    const reachable = new Map<NodeId, ReachableCareer>();
    const visited = new Set<NodeId>();

    // BFS with depth tracking
    const queue: Array<{ nodeId: NodeId; depth: number; path: CareerTransitionPath }> = [
      {
        nodeId,
        depth: 0,
        path: {
          id: `${nodeId}-start`,
          name: 'Start',
          nodeIds: [nodeId],
          edges: [],
          totalMetrics: {
            totalYears: 0,
            totalDifficulty: 0,
            averageProbability: 1,
            overallSkillOverlap: 1,
            totalFinancialCost: 0,
            pathReversibility: 1,
          },
          quality: {
            isRecommended: true,
            riskLevel: 'low',
            confidence: 1,
          },
        },
      },
    ];

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.depth >= maxDepth) continue;
      if (visited.has(current.nodeId)) continue;
      visited.add(current.nodeId);

      const edges = this.getEdgesFrom(current.nodeId);

      for (const edge of edges) {
        if (!this.matchesTraversalOptions(edge, options)) continue;

        const targetNode = this.nodes.get(edge.toNodeId);
        if (!targetNode) continue;

        const newPath = this.extendPath(current.path, edge, targetNode);
        const minTransitions = current.depth + 1;

        // Calculate cumulative probability
        const cumulativeProbability = current.path.totalMetrics.averageProbability * edge.probabilityOfSuccess;

        // Update if this is the shortest path to this node
        const existing = reachable.get(edge.toNodeId);
        if (!existing || existing.minTransitions > minTransitions) {
          reachable.set(edge.toNodeId, {
            node: targetNode,
            shortestPath: newPath,
            minTransitions,
            minYears: newPath.totalMetrics.totalYears,
            cumulativeProbability,
          });

          queue.push({
            nodeId: edge.toNodeId,
            depth: minTransitions,
            path: newPath,
          });
        }
      }
    }

    // Remove the starting node
    reachable.delete(nodeId);

    // Convert to array and sort by minimum transitions
    return Array.from(reachable.values())
      .sort((a, b) => a.minTransitions - b.minTransitions);
  }

  /**
   * Get shortest transition path between two careers.
   */
  getShortestTransitionPath(
    fromNodeId: NodeId,
    toNodeId: NodeId,
    options: ShortestPathOptions = {}
  ): CareerTransitionPath | null {
    if (!this.nodes.has(fromNodeId)) {
      throw new Error(`Source node ${fromNodeId} does not exist`);
    }
    if (!this.nodes.has(toNodeId)) {
      throw new Error(`Target node ${toNodeId} does not exist`);
    }

    // Dijkstra's algorithm
    const distances = new Map<NodeId, number>();
    const previous = new Map<NodeId, { nodeId: NodeId; edgeId: EdgeId } | null>();
    const unvisited = new Set<NodeId>();

    // Initialize
    for (const nodeId of this.nodes.keys()) {
      distances.set(nodeId, nodeId === fromNodeId ? 0 : Infinity);
      previous.set(nodeId, null);
      unvisited.add(nodeId);
    }

    while (unvisited.size > 0) {
      // Find unvisited node with minimum distance
      let currentNodeId: NodeId | null = null;
      let minDistance = Infinity;

      for (const nodeId of unvisited) {
        const distance = distances.get(nodeId)!;
        if (distance < minDistance) {
          minDistance = distance;
          currentNodeId = nodeId;
        }
      }

      if (currentNodeId === null || currentNodeId === toNodeId) break;
      unvisited.delete(currentNodeId);

      // Update distances to neighbors
      const edges = this.getEdgesFrom(currentNodeId);
      for (const edge of edges) {
        if (!this.matchesShortestPathOptions(edge, options)) continue;
        if (options.avoidEdges?.includes(edge.id)) continue;
        if (options.avoidNodes?.includes(edge.toNodeId)) continue;

        const weight = this.calculateEdgeWeight(edge, options.weightBy || 'combined');
        const newDistance = distances.get(currentNodeId)! + weight;

        if (newDistance < distances.get(edge.toNodeId)!) {
          distances.set(edge.toNodeId, newDistance);
          previous.set(edge.toNodeId, { nodeId: currentNodeId, edgeId: edge.id });
        }
      }
    }

    // Reconstruct path
    if (distances.get(toNodeId) === Infinity) {
      return null; // No path found
    }

    const path: CareerTransitionPath = {
      id: `${fromNodeId}-to-${toNodeId}`,
      name: `Path from ${this.nodes.get(fromNodeId)!.name} to ${this.nodes.get(toNodeId)!.name}`,
      nodeIds: [],
      edges: [],
      totalMetrics: {
        totalYears: 0,
        totalDifficulty: 0,
        averageProbability: 1,
        overallSkillOverlap: 1,
        totalFinancialCost: 0,
        pathReversibility: 1,
      },
      quality: {
        isRecommended: true,
        riskLevel: 'low',
        confidence: 1,
      },
    };

    // Build path backwards
    const nodeIds: NodeId[] = [toNodeId];
    const edgeIds: EdgeId[] = [];

    let current: NodeId | null = toNodeId;
    while (current !== null && current !== fromNodeId) {
      const prev = previous.get(current);
      if (!prev) break;

      nodeIds.unshift(prev.nodeId);
      edgeIds.unshift(prev.edgeId);
      current = prev.nodeId;
    }

    // Build path with full objects
    path.nodeIds = nodeIds;
    for (const edgeId of edgeIds) {
      const edge = this.edges.get(edgeId);
      if (edge) {
        path.edges.push(edge);
        path.totalMetrics.totalYears += edge.transitionTimeYears;
        path.totalMetrics.totalDifficulty += edge.transitionDifficulty;
        path.totalMetrics.averageProbability *= edge.probabilityOfSuccess;
        path.totalMetrics.totalFinancialCost += edge.financialCost.typical;
        path.totalMetrics.pathReversibility = Math.min(
          path.totalMetrics.pathReversibility,
          edge.reversibility
        );
      }
    }

    // Calculate overall skill overlap (average)
    if (path.edges.length > 0) {
      path.totalMetrics.overallSkillOverlap =
        path.edges.reduce((sum, e) => sum + e.skillOverlap, 0) / path.edges.length;
    }

    // Determine risk level
    if (path.totalMetrics.averageProbability < 0.4 || path.totalMetrics.totalDifficulty > 150) {
      path.quality.riskLevel = 'high';
    } else if (path.totalMetrics.averageProbability < 0.7 || path.totalMetrics.totalDifficulty > 80) {
      path.quality.riskLevel = 'medium';
    }

    return path;
  }

  /**
   * Get all career paths from a starting node.
   */
  getCareerPaths(
    fromNodeId: NodeId,
    options: GraphTraversalOptions & { maxPaths?: number } = {}
  ): CareerTransitionPath[] {
    const node = this.nodes.get(fromNodeId);
    if (!node) {
      throw new Error(`Node ${fromNodeId} does not exist`);
    }

    const paths: CareerTransitionPath[] = [];
    const maxDepth = options.maxDepth ?? 4;
    const maxPaths = options.maxPaths ?? 100;

    // DFS to find all paths
    const dfs = (currentNodeId: NodeId, currentPath: CareerTransitionPath, depth: number) => {
      if (depth >= maxDepth) return;

      const edges = this.getEdgesFrom(currentNodeId);

      for (const edge of edges) {
        if (paths.length >= maxPaths) return;
        if (!this.matchesTraversalOptions(edge, options)) continue;

        const targetNode = this.nodes.get(edge.toNodeId);
        if (!targetNode) continue;

        // Avoid cycles
        if (currentPath.nodeIds.includes(edge.toNodeId)) continue;

        const newPath = this.extendPath(currentPath, edge, targetNode);
        paths.push(newPath);

        dfs(edge.toNodeId, newPath, depth + 1);
      }
    };

    const startPath: CareerTransitionPath = {
      id: `${fromNodeId}-start`,
      name: node.name,
      nodeIds: [fromNodeId],
      edges: [],
      totalMetrics: {
        totalYears: 0,
        totalDifficulty: 0,
        averageProbability: 1,
        overallSkillOverlap: 1,
        totalFinancialCost: 0,
        pathReversibility: 1,
      },
      quality: {
        isRecommended: true,
        riskLevel: 'low',
        confidence: 1,
      },
    };

    dfs(fromNodeId, startPath, 0);

    // Sort by probability (highest first)
    return paths.sort((a, b) => b.totalMetrics.averageProbability - a.totalMetrics.averageProbability);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Calculate graph statistics.
   */
  getStatistics(): GraphStatistics {
    const totalNodes = this.nodes.size;
    const totalEdges = this.edges.size;

    // Calculate average degree
    let totalDegree = 0;
    for (const nodeId of this.nodes.keys()) {
      const outDegree = this.adjacencyList.get(nodeId)?.size || 0;
      const inDegree = this.reverseAdjacencyList.get(nodeId)?.size || 0;
      totalDegree += outDegree + inDegree;
    }
    const averageDegree = totalNodes > 0 ? totalDegree / totalNodes : 0;

    // Calculate density
    const maxPossibleEdges = totalNodes * (totalNodes - 1);
    const density = maxPossibleEdges > 0 ? totalEdges / maxPossibleEdges : 0;

    // Count by category
    const nodesByCategory = new Map<string, number>();
    for (const node of this.nodes.values()) {
      const count = nodesByCategory.get(node.category) || 0;
      nodesByCategory.set(node.category, count + 1);
    }

    return {
      totalNodes,
      totalEdges,
      averageDegree,
      density,
      connectedComponents: this.countConnectedComponents(),
      largestComponentSize: this.getLargestComponentSize(),
      averagePathLength: this.calculateAveragePathLength(),
      categories: Array.from(nodesByCategory.keys()),
      nodesByCategory,
    };
  }

  /**
   * Import careers from Career domain objects.
   */
  importCareers(careers: Career[]): void {
    for (const career of careers) {
      const node: CareerNode = {
        id: career.id,
        name: career.name,
        category: career.category,
        description: career.description,
        requiredProfile: career.psychologicalProfile,
        keySkills: this.extractKeySkills(career),
        skillCategories: this.classifySkillCategories(career),
        typicalExperienceYears: this.estimateExperienceYears(career),
        incomeLevel: this.normalizeIncome(career),
        isEntryLevel: this.isEntryLevelCareer(career),
        isTerminal: this.isTerminalCareer(career),
        relatedCareers: career.evolution?.adjacentCareers || [],
        metadata: {
          demandLevel: 0.5, // Default, would come from market data
          growthOutlook: 0.5,
          addedAt: Date.now(),
        },
      };

      this.addNode(node);
    }
  }

  /**
   * Build edges based on skill overlap and career relationships.
   */
  buildEdgesFromSkillOverlap(): void {
    const nodes = this.getAllNodes();

    for (let i = 0; i < nodes.length; i++) {
      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue;

        const fromNode = nodes[i];
        const toNode = nodes[j];

        // Skip if edge already exists
        if (this.findEdge(fromNode.id, toNode.id)) continue;

        // Calculate skill overlap
        const skillOverlap = this.calculateSkillOverlap(fromNode, toNode);

        // Create edge if overlap is significant
        if (skillOverlap >= 0.3) {
          const edge = this.createEdgeFromOverlap(fromNode, toNode, skillOverlap);
          this.addEdge(edge);
        }
      }
    }
  }

  /**
   * Clear all nodes and edges.
   */
  clear(): void {
    this.nodes.clear();
    this.edges.clear();
    this.adjacencyList.clear();
    this.reverseAdjacencyList.clear();
  }

  /**
   * Get graph size.
   */
  size(): { nodes: number; edges: number } {
    return {
      nodes: this.nodes.size,
      edges: this.edges.size,
    };
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private matchesTraversalOptions(edge: CareerEdge, options: GraphTraversalOptions): boolean {
    if (options.minProbability !== undefined && edge.probabilityOfSuccess < options.minProbability) {
      return false;
    }

    if (options.maxDifficulty !== undefined && edge.transitionDifficulty > options.maxDifficulty) {
      return false;
    }

    if (options.maxTimeYears !== undefined && edge.transitionTimeYears > options.maxTimeYears) {
      return false;
    }

    if (options.transitionTypes && options.transitionTypes.length > 0) {
      if (!options.transitionTypes.includes(edge.transitionType)) {
        return false;
      }
    }

    if (options.reversibleOnly && edge.reversibility < 0.5) {
      return false;
    }

    return true;
  }

  private matchesShortestPathOptions(edge: CareerEdge, options: ShortestPathOptions): boolean {
    if (options.minProbability !== undefined && edge.probabilityOfSuccess < options.minProbability) {
      return false;
    }

    if (options.maxDifficulty !== undefined && edge.transitionDifficulty > options.maxDifficulty) {
      return false;
    }

    return true;
  }

  private calculateTransitionScore(edge: CareerEdge): number {
    // Higher is better
    const probabilityWeight = 0.4;
    const skillOverlapWeight = 0.3;
    const reversibilityWeight = 0.2;
    const timeWeight = 0.1;

    const timeScore = Math.max(0, 1 - edge.transitionTimeYears / 5); // Normalize to 0-1

    return (
      edge.probabilityOfSuccess * probabilityWeight +
      edge.skillOverlap * skillOverlapWeight +
      edge.reversibility * reversibilityWeight +
      timeScore * timeWeight
    );
  }

  private calculateEdgeWeight(edge: CareerEdge, weightBy: ShortestPathOptions['weightBy']): number {
    switch (weightBy) {
      case 'time':
        return edge.transitionTimeYears;
      case 'difficulty':
        return edge.transitionDifficulty;
      case 'probability':
        return 1 - edge.probabilityOfSuccess; // Invert so higher probability = lower weight
      case 'combined':
      default:
        // Combined weight: time + difficulty - probability bonus
        return edge.transitionTimeYears * 10 + edge.transitionDifficulty - edge.probabilityOfSuccess * 20;
    }
  }

  private extendPath(path: CareerTransitionPath, edge: CareerEdge, targetNode: CareerNode): CareerTransitionPath {
    const newEdges = [...path.edges, edge];

    return {
      id: `${path.id}-${targetNode.id}`,
      name: `${path.name} → ${targetNode.name}`,
      nodeIds: [...path.nodeIds, targetNode.id],
      edges: newEdges,
      totalMetrics: {
        totalYears: path.totalMetrics.totalYears + edge.transitionTimeYears,
        totalDifficulty: path.totalMetrics.totalDifficulty + edge.transitionDifficulty,
        averageProbability: path.totalMetrics.averageProbability * edge.probabilityOfSuccess,
        overallSkillOverlap: (path.totalMetrics.overallSkillOverlap * path.edges.length + edge.skillOverlap) / newEdges.length,
        totalFinancialCost: path.totalMetrics.totalFinancialCost + edge.financialCost.typical,
        pathReversibility: Math.min(path.totalMetrics.pathReversibility, edge.reversibility),
      },
      quality: {
        isRecommended: path.totalMetrics.averageProbability * edge.probabilityOfSuccess > 0.3,
        riskLevel: path.quality.riskLevel,
        confidence: path.quality.confidence * 0.95, // Decrease confidence with each step
      },
    };
  }

  private countConnectedComponents(): number {
    const visited = new Set<NodeId>();
    let components = 0;

    for (const nodeId of this.nodes.keys()) {
      if (!visited.has(nodeId)) {
        components++;
        this.dfsComponent(nodeId, visited);
      }
    }

    return components;
  }

  private dfsComponent(nodeId: NodeId, visited: Set<NodeId>): void {
    visited.add(nodeId);

    const outgoingEdges = this.adjacencyList.get(nodeId) || new Set();
    for (const edgeId of outgoingEdges) {
      const edge = this.edges.get(edgeId);
      if (edge && !visited.has(edge.toNodeId)) {
        this.dfsComponent(edge.toNodeId, visited);
      }
    }

    const incomingEdges = this.reverseAdjacencyList.get(nodeId) || new Set();
    for (const edgeId of incomingEdges) {
      const edge = this.edges.get(edgeId);
      if (edge && !visited.has(edge.fromNodeId)) {
        this.dfsComponent(edge.fromNodeId, visited);
      }
    }
  }

  private getLargestComponentSize(): number {
    const visited = new Set<NodeId>();
    let largestSize = 0;

    for (const nodeId of this.nodes.keys()) {
      if (!visited.has(nodeId)) {
        const size = this.countComponentSize(nodeId, new Set(visited));
        largestSize = Math.max(largestSize, size);
        // Mark all as visited
        this.dfsComponent(nodeId, visited);
      }
    }

    return largestSize;
  }

  private countComponentSize(nodeId: NodeId, visited: Set<NodeId>): number {
    if (visited.has(nodeId)) return 0;
    visited.add(nodeId);

    let size = 1;

    const outgoingEdges = this.adjacencyList.get(nodeId) || new Set();
    for (const edgeId of outgoingEdges) {
      const edge = this.edges.get(edgeId);
      if (edge) {
        size += this.countComponentSize(edge.toNodeId, visited);
      }
    }

    const incomingEdges = this.reverseAdjacencyList.get(nodeId) || new Set();
    for (const edgeId of incomingEdges) {
      const edge = this.edges.get(edgeId);
      if (edge) {
        size += this.countComponentSize(edge.fromNodeId, visited);
      }
    }

    return size;
  }

  private calculateAveragePathLength(): number {
    // Sample-based approximation for large graphs
    const nodes = this.getAllNodes();
    if (nodes.length < 2) return 0;

    const sampleSize = Math.min(50, nodes.length);
    let totalPathLength = 0;
    let pathCount = 0;

    for (let i = 0; i < sampleSize; i++) {
      for (let j = i + 1; j < sampleSize; j++) {
        const path = this.getShortestTransitionPath(nodes[i].id, nodes[j].id);
        if (path) {
          totalPathLength += path.nodeIds.length - 1;
          pathCount++;
        }
      }
    }

    return pathCount > 0 ? totalPathLength / pathCount : 0;
  }

  private extractKeySkills(career: Career): string[] {
    const skills: string[] = [];

    // Extract from psychological profile
    const psych = career.psychologicalProfile;
    if (psych.analyticalThinking >= 0.7) skills.push('analytical-thinking');
    if (psych.creativity >= 0.7) skills.push('creativity');
    if (psych.socialOrientation >= 0.7) skills.push('communication');
    if (psych.leadership >= 0.7) skills.push('leadership');
    if (psych.detailOrientation >= 0.7) skills.push('attention-to-detail');
    if (psych.curiosity >= 0.7) skills.push('research');
    if (psych.competitiveness >= 0.7) skills.push('competitive-drive');
    if (psych.riskTolerance >= 0.7) skills.push('risk-management');

    return skills;
  }

  private classifySkillCategories(career: Career): SkillCategory[] {
    const categories: SkillCategory[] = [];

    const psych = career.psychologicalProfile;

    if (psych.analyticalThinking >= 0.6 || psych.detailOrientation >= 0.6) {
      categories.push('technical');
    }
    if (psych.leadership >= 0.6 || psych.competitiveness >= 0.6) {
      categories.push('business');
    }
    if (psych.creativity >= 0.6) {
      categories.push('creative');
    }
    if (psych.socialOrientation >= 0.6) {
      categories.push('education');
    }
    if (psych.curiosity >= 0.6) {
      categories.push('research');
    }

    return categories;
  }

  private estimateExperienceYears(career: Career): number {
    // Estimate based on salary progression
    const entry = career.salary.entrySalaryIndia.median;
    const senior = career.salary.seniorSalaryIndia.median;

    // Rough heuristic: higher senior/entry ratio suggests longer progression
    const ratio = senior / entry;
    if (ratio > 8) return 15;
    if (ratio > 5) return 12;
    if (ratio > 3) return 8;
    return 5;
  }

  private normalizeIncome(career: Career): number {
    const median = career.salary.midCareerSalaryIndia.median;
    // Normalize assuming 20L is high income
    return Math.min(1, median / 2000000);
  }

  private isEntryLevelCareer(career: Career): boolean {
    // Entry level if no specific evolution paths defined
    return !career.evolution?.futureCareerPaths || career.evolution.futureCareerPaths.length === 0;
  }

  private isTerminalCareer(career: Career): boolean {
    // Terminal if high senior salary relative to entry
    const ratio = career.salary.seniorSalaryIndia.median / career.salary.entrySalaryIndia.median;
    return ratio > 6;
  }

  private calculateSkillOverlap(fromNode: CareerNode, toNode: CareerNode): number {
    const fromSkills = new Set(fromNode.keySkills);
    const toSkills = new Set(toNode.keySkills);

    if (fromSkills.size === 0 || toSkills.size === 0) return 0;

    let overlap = 0;
    for (const skill of fromSkills) {
      if (toSkills.has(skill)) {
        overlap++;
      }
    }

    // Jaccard similarity
    const union = new Set([...fromSkills, ...toSkills]).size;
    return union > 0 ? overlap / union : 0;
  }

  private createEdgeFromOverlap(fromNode: CareerNode, toNode: CareerNode, skillOverlap: number): CareerEdge {
    const transitionType = this.inferTransitionType(fromNode, toNode);

    // Calculate difficulty based on skill overlap and experience gap
    const experienceGap = Math.max(0, toNode.typicalExperienceYears - fromNode.typicalExperienceYears);
    const baseDifficulty = 100 - skillOverlap * 100;
    const experiencePenalty = experienceGap * 5;
    const difficulty = Math.min(100, baseDifficulty + experiencePenalty);

    // Time based on difficulty
    const timeYears = Math.max(0.5, difficulty / 20);

    // Probability inversely related to difficulty
    const probability = Math.max(0.1, 1 - difficulty / 150);

    // Reversibility based on time and difficulty
    const reversibility = Math.max(0.1, 1 - timeYears / 10 - difficulty / 200);

    return {
      id: `${fromNode.id}-to-${toNode.id}`,
      fromNodeId: fromNode.id,
      toNodeId: toNode.id,
      transitionDifficulty: difficulty,
      transitionTimeYears: timeYears,
      skillOverlap,
      probabilityOfSuccess: probability,
      reversibility,
      transitionType,
      description: `Transition from ${fromNode.name} to ${toNode.name}`,
      prerequisites: this.generatePrerequisites(fromNode, toNode),
      transferableSkills: fromNode.keySkills.filter(skill => toNode.keySkills.includes(skill)),
      skillsToAcquire: toNode.keySkills.filter(skill => !fromNode.keySkills.includes(skill)),
      commonPaths: this.suggestCommonPaths(fromNode, toNode),
      financialCost: {
        min: 0,
        max: 500000,
        typical: 100000 * timeYears,
      },
      metadata: {
        frequency: probability > 0.6 ? 'common' : probability > 0.3 ? 'uncommon' : 'rare',
        confidence: 0.7,
        addedAt: Date.now(),
      },
    };
  }

  private inferTransitionType(fromNode: CareerNode, toNode: CareerNode): TransitionType {
    if (toNode.isEntryLevel) return 'pivot';
    if (fromNode.category !== toNode.category) return 'pivot';
    if (toNode.typicalExperienceYears > fromNode.typicalExperienceYears + 2) return 'promotion';
    if (toNode.incomeLevel > fromNode.incomeLevel * 1.5 && toNode.isTerminal) return 'entrepreneurship';
    if (fromNode.typicalExperienceYears > toNode.typicalExperienceYears) return 'generalization';
    return 'lateral';
  }

  private generatePrerequisites(fromNode: CareerNode, toNode: CareerNode): TransitionPrerequisite[] {
    const prerequisites: TransitionPrerequisite[] = [];

    if (toNode.typicalExperienceYears > fromNode.typicalExperienceYears) {
      prerequisites.push({
        type: 'experience',
        description: `${toNode.typicalExperienceYears - fromNode.typicalExperienceYears} additional years of experience`,
        isRequired: true,
        importance: 0.8,
      });
    }

    const skillsToAcquire = toNode.keySkills.filter(skill => !fromNode.keySkills.includes(skill));
    if (skillsToAcquire.length > 0) {
      prerequisites.push({
        type: 'skill',
        description: `Develop skills: ${skillsToAcquire.slice(0, 3).join(', ')}`,
        isRequired: false,
        importance: 0.7,
      });
    }

    return prerequisites;
  }

  private suggestCommonPaths(fromNode: CareerNode, toNode: CareerNode): string[] {
    const paths: string[] = [];

    if (fromNode.category === toNode.category) {
      paths.push(`Internal promotion within ${fromNode.category}`);
    }

    if (fromNode.skillCategories.some(cat => toNode.skillCategories.includes(cat))) {
      paths.push('Leverage transferable skills');
    }

    paths.push('Direct application with relevant experience');

    return paths;
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a career transition graph from a list of careers.
 */
export function createCareerTransitionGraph(careers: Career[]): CareerTransitionGraphV1 {
  const graph = new CareerTransitionGraphV1();
  graph.importCareers(careers);
  graph.buildEdgesFromSkillOverlap();
  return graph;
}

/**
 * Find shortest path between two careers.
 */
export function findCareerTransitionPath(
  fromCareerId: string,
  toCareerId: string,
  graph: CareerTransitionGraphV1,
  options?: ShortestPathOptions
): CareerTransitionPath | null {
  return graph.getShortestTransitionPath(fromCareerId, toCareerId, options);
}

/**
 * Get reachable careers from a starting point.
 */
export function getReachableCareersFrom(
  careerId: string,
  graph: CareerTransitionGraphV1,
  options?: GraphTraversalOptions
): ReachableCareer[] {
  return graph.getReachableCareers(careerId, options);
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  CareerNode,
  CareerEdge,
  CareerTransitionPath,
  AdjacentCareer,
  ReachableCareer,
  GraphStatistics,
  GraphTraversalOptions,
  ShortestPathOptions,
  TransitionType,
  TransitionPrerequisite,
  SkillCategory,
  NodeId,
  EdgeId,
};
