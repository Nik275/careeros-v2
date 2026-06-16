/**
 * CareerOS Knowledge Graph Core
 *
 * High-performance graph system for career intelligence.
 * Optimized for 100,000+ nodes and 1,000,000+ edges.
 *
 * @version 1.0.0
 */

import type { CareerRelationship, RelationshipStrength, StrengthScore } from '../ontology/career-relationships';
import type { CareerEvidence } from '../ontology/career-evidence';

// ============================================================================
// NODE TYPES
// ============================================================================

export type NodeType =
  | 'career'
  | 'skill'
  | 'degree'
  | 'exam'
  | 'certification'
  | 'industry'
  | 'role';

export interface NodeMetadata {
  /** Creation timestamp */
  createdAt: number;

  /** Last update timestamp */
  updatedAt: number;

  /** Node version */
  version: string;

  /** Additional properties */
  [key: string]: unknown;
}

export interface BaseNode {
  /** Unique node identifier */
  id: string;

  /** Node type */
  type: NodeType;

  /** Human-readable label */
  label: string;

  /** Node metadata */
  metadata: NodeMetadata;

  /** Node weight (importance/priority) */
  weight: number;
}

export interface CareerNode extends BaseNode {
  type: 'career';
  careerId: string;
  category: string;
}

export interface SkillNode extends BaseNode {
  type: 'skill';
  skillId: string;
  category: string;
}

export interface DegreeNode extends BaseNode {
  type: 'degree';
  degreeId: string;
  level: 'undergraduate' | 'postgraduate' | 'doctoral';
}

export interface ExamNode extends BaseNode {
  type: 'exam';
  examId: string;
  difficulty: number;
}

export interface CertificationNode extends BaseNode {
  type: 'certification';
  certificationId: string;
  validityPeriod?: number;
}

export interface IndustryNode extends BaseNode {
  type: 'industry';
  industryId: string;
  growthRate: number;
}

export interface RoleNode extends BaseNode {
  type: 'role';
  roleId: string;
  seniority: 'entry' | 'mid' | 'senior' | 'leadership';
}

export type KnowledgeNode =
  | CareerNode
  | SkillNode
  | DegreeNode
  | ExamNode
  | CertificationNode
  | IndustryNode
  | RoleNode;

export type KnowledgeNodeUpdate = Partial<Omit<KnowledgeNode, 'id' | 'type' | 'metadata'>> & {
  metadata?: Partial<NodeMetadata>;
};

// ============================================================================
// EDGE TYPES
// ============================================================================

export interface EdgeMetadata {
  /** Relationship type from taxonomy */
  relationType: string;

  /** Relationship strength level */
  strength: RelationshipStrength;

  /** Numeric strength score (1-10) */
  strengthScore: StrengthScore;

  /** Confidence in this edge (0-1) */
  confidence: number;

  /** Supporting evidence */
  evidence?: CareerEvidence;

  /** Edge weight for algorithms */
  weight: number;

  /** Creation timestamp */
  createdAt: number;

  /** Last update timestamp */
  updatedAt: number;

  /** Edge version */
  version: string;

  /** Additional context */
  context?: Record<string, unknown>;
}

export interface KnowledgeEdge {
  /** Unique edge identifier */
  id: string;

  /** Source node ID */
  sourceId: string;

  /** Target node ID */
  targetId: string;

  /** Edge type (mirrors relationship type) */
  type: string;

  /** Edge metadata */
  metadata: EdgeMetadata;

  /** Is edge bidirectional */
  bidirectional: boolean;
}

export type KnowledgeEdgeUpdate = Partial<Omit<KnowledgeEdge, 'id' | 'metadata'>> & {
  metadata?: Partial<EdgeMetadata>;
};

// ============================================================================
// GRAPH CONFIGURATION
// ============================================================================

export interface GraphConfiguration {
  /** Enable caching for frequent queries */
  enableCache: boolean;

  /** Cache size limit */
  cacheSize: number;

  /** Enable parallel processing for large operations */
  enableParallelProcessing: boolean;

  /** Parallel processing threshold */
  parallelThreshold: number;

  /** Maximum path length for pathfinding */
  maxPathLength: number;

  /** Default algorithm timeout (ms) */
  algorithmTimeout: number;

  /** Enable persistence */
  enablePersistence: boolean;

  /** Persistence batch size */
  persistenceBatchSize: number;
}

export const DEFAULT_GRAPH_CONFIG: GraphConfiguration = {
  enableCache: true,
  cacheSize: 10000,
  enableParallelProcessing: true,
  parallelThreshold: 1000,
  maxPathLength: 10,
  algorithmTimeout: 5000,
  enablePersistence: false,
  persistenceBatchSize: 1000,
};

// ============================================================================
// QUERY TYPES
// ============================================================================

export interface NodeQuery {
  /** Filter by node types */
  types?: NodeType[];

  /** Filter by node IDs */
  ids?: string[];

  /** Filter by label pattern */
  labelPattern?: RegExp;

  /** Minimum weight */
  minWeight?: number;

  /** Maximum weight */
  maxWeight?: number;

  /** Custom filter function */
  filter?: (node: KnowledgeNode) => boolean;

  /** Result limit */
  limit?: number;
}

export interface EdgeQuery {
  /** Filter by source node IDs */
  sourceIds?: string[];

  /** Filter by target node IDs */
  targetIds?: string[];

  /** Filter by edge types */
  types?: string[];

  /** Filter by relationship strengths */
  strengths?: RelationshipStrength[];

  /** Minimum confidence */
  minConfidence?: number;

  /** Maximum confidence */
  maxConfidence?: number;

  /** Minimum weight */
  minWeight?: number;

  /** Custom filter function */
  filter?: (edge: KnowledgeEdge) => boolean;

  /** Result limit */
  limit?: number;
}

export interface PathQuery {
  /** Source node ID */
  sourceId: string;

  /** Target node ID */
  targetId: string;

  /** Maximum path length */
  maxLength?: number;

  /** Minimum edge confidence */
  minConfidence?: number;

  /** Edge types to traverse */
  allowedEdgeTypes?: string[];

  /** Node types to traverse */
  allowedNodeTypes?: NodeType[];

  /** Algorithm to use */
  algorithm?: 'dijkstra' | 'astar' | 'bfs';

  /** Timeout in milliseconds */
  timeout?: number;
}

export interface NeighborhoodQuery {
  /** Center node ID */
  nodeId: string;

  /** Number of hops */
  depth: number;

  /** Minimum edge confidence */
  minConfidence?: number;

  /** Edge types to traverse */
  allowedEdgeTypes?: string[];

  /** Include only specific node types */
  nodeTypes?: NodeType[];
}

// ============================================================================
// RESULT TYPES
// ============================================================================

export interface GraphPath {
  /** Path ID */
  id: string;

  /** Ordered node IDs in path */
  nodes: string[];

  /** Ordered edges in path */
  edges: KnowledgeEdge[];

  /** Total path weight */
  totalWeight: number;

  /** Average confidence */
  averageConfidence: number;

  /** Path length (number of edges) */
  length: number;
}

export interface Neighborhood {
  /** Center node */
  center: KnowledgeNode;

  /** Nodes by distance from center */
  layers: Map<number, KnowledgeNode[]>;

  /** Edges connecting nodes in neighborhood */
  edges: KnowledgeEdge[];

  /** Maximum depth explored */
  depth: number;

  /** Total nodes in neighborhood */
  totalNodes: number;
}

export interface GraphStatistics {
  /** Total nodes */
  nodeCount: number;

  /** Total edges */
  edgeCount: number;

  /** Nodes by type */
  nodesByType: Map<NodeType, number>;

  /** Edges by type */
  edgesByType: Map<string, number>;

  /** Average node weight */
  averageNodeWeight: number;

  /** Average edge weight */
  averageEdgeWeight: number;

  /** Average edge confidence */
  averageEdgeConfidence: number;

  /** Graph density (0-1) */
  density: number;

  /** Average degree (edges per node) */
  averageDegree: number;
}

// ============================================================================
// KNOWLEDGE GRAPH CLASS
// ============================================================================

export class KnowledgeGraph {
  /** Node storage: ID -> Node */
  private nodes: Map<string, KnowledgeNode>;

  /** Edge storage: ID -> Edge */
  private edges: Map<string, KnowledgeEdge>;

  /** Adjacency list: Node ID -> Edge IDs (outgoing) */
  private adjacencyList: Map<string, Set<string>>;

  /** Reverse adjacency: Node ID -> Edge IDs (incoming) */
  private reverseAdjacency: Map<string, Set<string>>;

  /** Node index by type */
  private nodeTypeIndex: Map<NodeType, Set<string>>;

  /** Edge index by type */
  private edgeTypeIndex: Map<string, Set<string>>;

  /** Configuration */
  private config: GraphConfiguration;

  /** Query cache */
  private cache: Map<string, unknown>;

  /** Cache access order for LRU */
  private cacheAccessOrder: string[];

  constructor(config: Partial<GraphConfiguration> = {}) {
    this.config = { ...DEFAULT_GRAPH_CONFIG, ...config };
    this.nodes = new Map();
    this.edges = new Map();
    this.adjacencyList = new Map();
    this.reverseAdjacency = new Map();
    this.nodeTypeIndex = new Map();
    this.edgeTypeIndex = new Map();
    this.cache = new Map();
    this.cacheAccessOrder = [];

    // Initialize type indexes
    const nodeTypes: NodeType[] = ['career', 'skill', 'degree', 'exam', 'certification', 'industry', 'role'];
    nodeTypes.forEach(type => this.nodeTypeIndex.set(type, new Set()));
  }

  // ============================================================================
  // NODE OPERATIONS
  // ============================================================================

  /**
   * Add a node to the graph
   */
  addNode(node: KnowledgeNode): boolean {
    if (this.nodes.has(node.id)) {
      return false; // Node already exists
    }

    // Store node
    this.nodes.set(node.id, node);

    // Update indexes
    this.nodeTypeIndex.get(node.type)?.add(node.id);

    // Initialize adjacency lists
    if (!this.adjacencyList.has(node.id)) {
      this.adjacencyList.set(node.id, new Set());
    }
    if (!this.reverseAdjacency.has(node.id)) {
      this.reverseAdjacency.set(node.id, new Set());
    }

    // Invalidate cache
    this.invalidateCache();

    return true;
  }

  /**
   * Add multiple nodes efficiently
   */
  addNodes(nodes: KnowledgeNode[]): { added: number; failed: number } {
    let added = 0;
    let failed = 0;

    for (const node of nodes) {
      if (this.addNode(node)) {
        added++;
      } else {
        failed++;
      }
    }

    return { added, failed };
  }

  /**
   * Get a node by ID
   */
  getNode(id: string): KnowledgeNode | undefined {
    return this.nodes.get(id);
  }

  /**
   * Check if node exists
   */
  hasNode(id: string): boolean {
    return this.nodes.has(id);
  }

  /**
   * Remove a node and all its edges
   */
  removeNode(id: string): boolean {
    if (!this.nodes.has(id)) {
      return false;
    }

    const node = this.nodes.get(id)!;

    // Remove all outgoing edges
    const outgoingEdges = this.adjacencyList.get(id) || new Set();
    for (const edgeId of outgoingEdges) {
      this.removeEdge(edgeId);
    }

    // Remove all incoming edges
    const incomingEdges = this.reverseAdjacency.get(id) || new Set();
    for (const edgeId of incomingEdges) {
      this.removeEdge(edgeId);
    }

    // Remove from indexes
    this.nodes.delete(id);
    this.nodeTypeIndex.get(node.type)?.delete(id);
    this.adjacencyList.delete(id);
    this.reverseAdjacency.delete(id);

    // Invalidate cache
    this.invalidateCache();

    return true;
  }

  /**
   * Update a node
   */
  updateNode(id: string, updates: KnowledgeNodeUpdate): boolean {
    const node = this.nodes.get(id);
    if (!node) {
      return false;
    }

    // Update node
    const updatedNode = {
      ...node,
      ...updates,
      metadata: {
        ...node.metadata,
        ...updates.metadata,
        updatedAt: Date.now(),
      },
    };

    this.nodes.set(id, updatedNode as KnowledgeNode);

    // Invalidate cache
    this.invalidateCache();

    return true;
  }

  /**
   * Query nodes
   */
  queryNodes(query: NodeQuery = {}): KnowledgeNode[] {
    const cacheKey = this.getCacheKey('nodes', query);
    const cached = this.getFromCache<KnowledgeNode[]>(cacheKey);
    if (cached) {
      return cached;
    }

    let results: KnowledgeNode[] = [];

    // Start with type filter if provided
    if (query.types && query.types.length > 0) {
      for (const type of query.types) {
        const typeNodes = this.nodeTypeIndex.get(type);
        if (typeNodes) {
          for (const nodeId of typeNodes) {
            const node = this.nodes.get(nodeId);
            if (node) {
              results.push(node);
            }
          }
        }
      }
    } else if (query.ids && query.ids.length > 0) {
      // Start with ID filter
      for (const id of query.ids) {
        const node = this.nodes.get(id);
        if (node) {
          results.push(node);
        }
      }
    } else {
      // All nodes
      results = Array.from(this.nodes.values());
    }

    // Apply label pattern filter
    if (query.labelPattern) {
      results = results.filter(node => query.labelPattern!.test(node.label));
    }

    // Apply weight filters
    if (query.minWeight !== undefined) {
      results = results.filter(node => node.weight >= query.minWeight!);
    }
    if (query.maxWeight !== undefined) {
      results = results.filter(node => node.weight <= query.maxWeight!);
    }

    // Apply custom filter
    if (query.filter) {
      results = results.filter(query.filter);
    }

    // Apply limit
    if (query.limit && query.limit > 0) {
      results = results.slice(0, query.limit);
    }

    // Cache results
    this.setCache(cacheKey, results);

    return results;
  }

  /**
   * Get all nodes
   */
  getAllNodes(): KnowledgeNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Get nodes by type
   */
  getNodesByType(type: NodeType): KnowledgeNode[] {
    const nodeIds = this.nodeTypeIndex.get(type);
    if (!nodeIds) {
      return [];
    }

    const nodes: KnowledgeNode[] = [];
    for (const id of nodeIds) {
      const node = this.nodes.get(id);
      if (node) {
        nodes.push(node);
      }
    }
    return nodes;
  }

  // ============================================================================
  // EDGE OPERATIONS
  // ============================================================================

  /**
   * Add an edge to the graph
   */
  addEdge(edge: KnowledgeEdge): boolean {
    // Validate source and target exist
    if (!this.nodes.has(edge.sourceId) || !this.nodes.has(edge.targetId)) {
      return false;
    }

    // Check for duplicate
    if (this.edges.has(edge.id)) {
      return false;
    }

    // Store edge
    this.edges.set(edge.id, edge);

    // Update adjacency lists
    this.adjacencyList.get(edge.sourceId)?.add(edge.id);
    this.reverseAdjacency.get(edge.targetId)?.add(edge.id);

    // Update type index
    if (!this.edgeTypeIndex.has(edge.type)) {
      this.edgeTypeIndex.set(edge.type, new Set());
    }
    this.edgeTypeIndex.get(edge.type)?.add(edge.id);

    // Handle bidirectional
    if (edge.bidirectional) {
      this.reverseAdjacency.get(edge.sourceId)?.add(edge.id);
      this.adjacencyList.get(edge.targetId)?.add(edge.id);
    }

    // Invalidate cache
    this.invalidateCache();

    return true;
  }

  /**
   * Add multiple edges efficiently
   */
  addEdges(edges: KnowledgeEdge[]): { added: number; failed: number } {
    let added = 0;
    let failed = 0;

    for (const edge of edges) {
      if (this.addEdge(edge)) {
        added++;
      } else {
        failed++;
      }
    }

    return { added, failed };
  }

  /**
   * Get an edge by ID
   */
  getEdge(id: string): KnowledgeEdge | undefined {
    return this.edges.get(id);
  }

  /**
   * Check if edge exists
   */
  hasEdge(id: string): boolean {
    return this.edges.has(id);
  }

  /**
   * Remove an edge
   */
  removeEdge(id: string): boolean {
    const edge = this.edges.get(id);
    if (!edge) {
      return false;
    }

    // Remove from adjacency lists
    this.adjacencyList.get(edge.sourceId)?.delete(id);
    this.reverseAdjacency.get(edge.targetId)?.delete(id);

    if (edge.bidirectional) {
      this.reverseAdjacency.get(edge.sourceId)?.delete(id);
      this.adjacencyList.get(edge.targetId)?.delete(id);
    }

    // Remove from type index
    this.edgeTypeIndex.get(edge.type)?.delete(id);

    // Remove edge
    this.edges.delete(id);

    // Invalidate cache
    this.invalidateCache();

    return true;
  }

  /**
   * Update an edge
   */
  updateEdge(id: string, updates: KnowledgeEdgeUpdate): boolean {
    const edge = this.edges.get(id);
    if (!edge) {
      return false;
    }

    const updatedEdge = {
      ...edge,
      ...updates,
      metadata: {
        ...edge.metadata,
        ...updates.metadata,
        updatedAt: Date.now(),
      },
    };

    this.edges.set(id, updatedEdge as KnowledgeEdge);

    // Invalidate cache
    this.invalidateCache();

    return true;
  }

  /**
   * Query edges
   */
  queryEdges(query: EdgeQuery = {}): KnowledgeEdge[] {
    const cacheKey = this.getCacheKey('edges', query);
    const cached = this.getFromCache<KnowledgeEdge[]>(cacheKey);
    if (cached) {
      return cached;
    }

    let results: KnowledgeEdge[] = [];

    // Start with type filter if provided
    if (query.types && query.types.length > 0) {
      for (const type of query.types) {
        const typeEdges = this.edgeTypeIndex.get(type);
        if (typeEdges) {
          for (const edgeId of typeEdges) {
            const edge = this.edges.get(edgeId);
            if (edge) {
              results.push(edge);
            }
          }
        }
      }
    } else if (query.sourceIds && query.sourceIds.length > 0) {
      // Start with source filter
      for (const sourceId of query.sourceIds) {
        const edgeIds = this.adjacencyList.get(sourceId);
        if (edgeIds) {
          for (const edgeId of edgeIds) {
            const edge = this.edges.get(edgeId);
            if (edge) {
              results.push(edge);
            }
          }
        }
      }
    } else if (query.targetIds && query.targetIds.length > 0) {
      // Start with target filter
      for (const targetId of query.targetIds) {
        const edgeIds = this.reverseAdjacency.get(targetId);
        if (edgeIds) {
          for (const edgeId of edgeIds) {
            const edge = this.edges.get(edgeId);
            if (edge) {
              results.push(edge);
            }
          }
        }
      }
    } else {
      // All edges
      results = Array.from(this.edges.values());
    }

    // Apply strength filters
    if (query.strengths && query.strengths.length > 0) {
      results = results.filter(edge =>
        query.strengths!.includes(edge.metadata.strength)
      );
    }

    // Apply confidence filters
    if (query.minConfidence !== undefined) {
      results = results.filter(
        edge => edge.metadata.confidence >= query.minConfidence!
      );
    }
    if (query.maxConfidence !== undefined) {
      results = results.filter(
        edge => edge.metadata.confidence <= query.maxConfidence!
      );
    }

    // Apply weight filters
    if (query.minWeight !== undefined) {
      results = results.filter(
        edge => edge.metadata.weight >= query.minWeight!
      );
    }

    // Apply custom filter
    if (query.filter) {
      results = results.filter(query.filter);
    }

    // Apply limit
    if (query.limit && query.limit > 0) {
      results = results.slice(0, query.limit);
    }

    // Cache results
    this.setCache(cacheKey, results);

    return results;
  }

  /**
   * Get all edges
   */
  getAllEdges(): KnowledgeEdge[] {
    return Array.from(this.edges.values());
  }

  /**
   * Get edges from a node
   */
  getEdgesFrom(nodeId: string): KnowledgeEdge[] {
    const edgeIds = this.adjacencyList.get(nodeId);
    if (!edgeIds) {
      return [];
    }

    const edges: KnowledgeEdge[] = [];
    for (const id of edgeIds) {
      const edge = this.edges.get(id);
      if (edge) {
        edges.push(edge);
      }
    }
    return edges;
  }

  /**
   * Get edges to a node
   */
  getEdgesTo(nodeId: string): KnowledgeEdge[] {
    const edgeIds = this.reverseAdjacency.get(nodeId);
    if (!edgeIds) {
      return [];
    }

    const edges: KnowledgeEdge[] = [];
    for (const id of edgeIds) {
      const edge = this.edges.get(id);
      if (edge) {
        edges.push(edge);
      }
    }
    return edges;
  }

  // ============================================================================
  // CONNECTIVITY OPERATIONS
  // ============================================================================

  /**
   * Get connected nodes (neighbors)
   */
  getConnectedNodes(
    nodeId: string,
    options: {
      direction?: 'outgoing' | 'incoming' | 'both';
      edgeTypes?: string[];
      minConfidence?: number;
    } = {}
  ): { node: KnowledgeNode; edge: KnowledgeEdge }[] {
    const node = this.nodes.get(nodeId);
    if (!node) {
      return [];
    }

    const results: { node: KnowledgeNode; edge: KnowledgeEdge }[] = [];
    const seenNodes = new Set<string>();

    const direction = options.direction || 'both';

    // Outgoing edges
    if (direction === 'outgoing' || direction === 'both') {
      const outgoingEdges = this.getEdgesFrom(nodeId);
      for (const edge of outgoingEdges) {
        if (options.edgeTypes && !options.edgeTypes.includes(edge.type)) {
          continue;
        }
        if (
          options.minConfidence !== undefined &&
          edge.metadata.confidence < options.minConfidence
        ) {
          continue;
        }

        const targetNode = this.nodes.get(edge.targetId);
        if (targetNode && !seenNodes.has(targetNode.id)) {
          seenNodes.add(targetNode.id);
          results.push({ node: targetNode, edge });
        }
      }
    }

    // Incoming edges
    if (direction === 'incoming' || direction === 'both') {
      const incomingEdges = this.getEdgesTo(nodeId);
      for (const edge of incomingEdges) {
        if (options.edgeTypes && !options.edgeTypes.includes(edge.type)) {
          continue;
        }
        if (
          options.minConfidence !== undefined &&
          edge.metadata.confidence < options.minConfidence
        ) {
          continue;
        }

        const sourceNode = this.nodes.get(edge.sourceId);
        if (sourceNode && !seenNodes.has(sourceNode.id)) {
          seenNodes.add(sourceNode.id);
          results.push({ node: sourceNode, edge });
        }
      }
    }

    return results;
  }

  /**
   * Find relationships between two nodes
   */
  findRelationships(
    sourceId: string,
    targetId: string,
    options: {
      directed?: boolean;
      maxLength?: number;
    } = {}
  ): GraphPath[] {
    const cacheKey = `relationships-${sourceId}-${targetId}-${JSON.stringify(options)}`;
    const cached = this.getFromCache<GraphPath[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const maxLength = options.maxLength || this.config.maxPathLength;
    const paths: GraphPath[] = [];

    // BFS to find all paths
    const queue: { nodeId: string; path: string[]; edges: string[] }[] = [
      { nodeId: sourceId, path: [sourceId], edges: [] },
    ];

    const visited = new Set<string>();

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.path.length > maxLength + 1) {
        continue;
      }

      if (current.nodeId === targetId && current.path.length > 1) {
        // Found a path
        const edgeObjects: KnowledgeEdge[] = [];
        let totalWeight = 0;
        let totalConfidence = 0;

        for (const edgeId of current.edges) {
          const edge = this.edges.get(edgeId);
          if (edge) {
            edgeObjects.push(edge);
            totalWeight += edge.metadata.weight;
            totalConfidence += edge.metadata.confidence;
          }
        }

        paths.push({
          id: `path-${sourceId}-${targetId}-${paths.length}`,
          nodes: current.path,
          edges: edgeObjects,
          totalWeight,
          averageConfidence:
            edgeObjects.length > 0 ? totalConfidence / edgeObjects.length : 0,
          length: current.edges.length,
        });

        continue;
      }

      // Explore neighbors
      const outgoingEdges = this.getEdgesFrom(current.nodeId);
      for (const edge of outgoingEdges) {
        if (current.path.includes(edge.targetId)) {
          continue; // Avoid cycles
        }

        queue.push({
          nodeId: edge.targetId,
          path: [...current.path, edge.targetId],
          edges: [...current.edges, edge.id],
        });
      }

      // Handle undirected
      if (!options.directed) {
        const incomingEdges = this.getEdgesTo(current.nodeId);
        for (const edge of incomingEdges) {
          if (current.path.includes(edge.sourceId)) {
            continue;
          }

          queue.push({
            nodeId: edge.sourceId,
            path: [...current.path, edge.sourceId],
            edges: [...current.edges, edge.id],
          });
        }
      }
    }

    // Cache results
    this.setCache(cacheKey, paths);

    return paths;
  }

  /**
   * Get shortest path between nodes
   */
  getShortestPath(query: PathQuery): GraphPath | null {
    const cacheKey = this.getCacheKey('shortestPath', query);
    const cached = this.getFromCache<GraphPath | null>(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    const { sourceId, targetId } = query;

    if (!this.nodes.has(sourceId) || !this.nodes.has(targetId)) {
      return null;
    }

    // Dijkstra's algorithm
    const distances = new Map<string, number>();
    const previous = new Map<string, { nodeId: string; edgeId: string } | null>();
    const unvisited = new Set<string>();

    // Initialize
    for (const [id] of this.nodes) {
      distances.set(id, Infinity);
      previous.set(id, null);
      unvisited.add(id);
    }
    distances.set(sourceId, 0);



    while (unvisited.size > 0) {
      // Find minimum distance node
      let currentId: string | null = null;
      let minDistance = Infinity;

      for (const id of unvisited) {
        const dist = distances.get(id) ?? Infinity;
        if (dist < minDistance) {
          minDistance = dist;
          currentId = id;
        }
      }

      if (currentId === null || minDistance === Infinity) {
        break;
      }

      // Remove from unvisited
      unvisited.delete(currentId);

      // Check if we reached target
      if (currentId === targetId) {
        break;
      }

      // Explore neighbors
      const outgoingEdges = this.getEdgesFrom(currentId);
      for (const edge of outgoingEdges) {
        // Apply filters
        if (
          query.allowedEdgeTypes &&
          !query.allowedEdgeTypes.includes(edge.type)
        ) {
          continue;
        }
        if (
          query.minConfidence !== undefined &&
          edge.metadata.confidence < query.minConfidence
        ) {
          continue;
        }

        const neighborId = edge.targetId;
        if (!unvisited.has(neighborId)) {
          continue;
        }

        const alt = (distances.get(currentId) ?? 0) + edge.metadata.weight;
        if (alt < (distances.get(neighborId) ?? Infinity)) {
          distances.set(neighborId, alt);
          previous.set(neighborId, { nodeId: currentId, edgeId: edge.id });
        }
      }
    }

    // Reconstruct path
    if ((distances.get(targetId) ?? Infinity) === Infinity) {
      this.setCache(cacheKey, null);
      return null;
    }

    const path: string[] = [];
    const edgeIds: string[] = [];
    let current: string | null = targetId;

    while (current !== null) {
      path.unshift(current);
      const prev = previous.get(current);
      if (prev) {
        edgeIds.unshift(prev.edgeId);
        current = prev.nodeId;
      } else {
        current = null;
      }
    }

    // Build edge objects
    const edgeObjects: KnowledgeEdge[] = [];
    let totalWeight = 0;
    let totalConfidence = 0;

    for (const edgeId of edgeIds) {
      const edge = this.edges.get(edgeId);
      if (edge) {
        edgeObjects.push(edge);
        totalWeight += edge.metadata.weight;
        totalConfidence += edge.metadata.confidence;
      }
    }

    const result: GraphPath = {
      id: `path-${sourceId}-${targetId}`,
      nodes: path,
      edges: edgeObjects,
      totalWeight,
      averageConfidence:
        edgeObjects.length > 0 ? totalConfidence / edgeObjects.length : 0,
      length: edgeObjects.length,
    };

    this.setCache(cacheKey, result);
    return result;
  }

  /**
   * Get neighborhood around a node
   */
  getNeighborhood(query: NeighborhoodQuery): Neighborhood {
    const cacheKey = this.getCacheKey('neighborhood', query);
    const cached = this.getFromCache<Neighborhood>(cacheKey);
    if (cached) {
      return cached;
    }

    const { nodeId, depth } = query;

    const center = this.nodes.get(nodeId);
    if (!center) {
      throw new Error(`Node not found: ${nodeId}`);
    }

    const layers = new Map<number, KnowledgeNode[]>();
    const allEdges: KnowledgeEdge[] = [];
    const visited = new Set<string>([nodeId]);

    // Layer 0: center node
    layers.set(0, [center]);

    // BFS for each layer
    let currentLayer = [center];

    for (let d = 1; d <= depth; d++) {
      const nextLayer: KnowledgeNode[] = [];
      const layerEdges: KnowledgeEdge[] = [];

      for (const node of currentLayer) {
        const connected = this.getConnectedNodes(node.id, {
          minConfidence: query.minConfidence,
          edgeTypes: query.allowedEdgeTypes,
        });

        for (const { node: neighbor, edge } of connected) {
          if (!visited.has(neighbor.id)) {
            // Check node type filter
            if (
              query.nodeTypes &&
              !query.nodeTypes.includes(neighbor.type)
            ) {
              continue;
            }

            visited.add(neighbor.id);
            nextLayer.push(neighbor);
            layerEdges.push(edge);
          }
        }
      }

      if (nextLayer.length === 0) {
        break;
      }

      layers.set(d, nextLayer);
      allEdges.push(...layerEdges);
      currentLayer = nextLayer;
    }

    const result: Neighborhood = {
      center,
      layers,
      edges: allEdges,
      depth,
      totalNodes: visited.size - 1, // Exclude center
    };

    this.setCache(cacheKey, result);
    return result;
  }

  // ============================================================================
  // STATISTICS
  // ============================================================================

  /**
   * Get graph statistics
   */
  getStatistics(): GraphStatistics {
    const nodeCount = this.nodes.size;
    const edgeCount = this.edges.size;

    // Count by type
    const nodesByType = new Map<NodeType, number>();
    for (const [type, ids] of this.nodeTypeIndex) {
      nodesByType.set(type, ids.size);
    }

    const edgesByType = new Map<string, number>();
    for (const [type, ids] of this.edgeTypeIndex) {
      edgesByType.set(type, ids.size);
    }

    // Calculate averages
    let totalNodeWeight = 0;
    for (const node of this.nodes.values()) {
      totalNodeWeight += node.weight;
    }

    let totalEdgeWeight = 0;
    let totalEdgeConfidence = 0;
    for (const edge of this.edges.values()) {
      totalEdgeWeight += edge.metadata.weight;
      totalEdgeConfidence += edge.metadata.confidence;
    }

    const averageNodeWeight = nodeCount > 0 ? totalNodeWeight / nodeCount : 0;
    const averageEdgeWeight = edgeCount > 0 ? totalEdgeWeight / edgeCount : 0;
    const averageEdgeConfidence =
      edgeCount > 0 ? totalEdgeConfidence / edgeCount : 0;

    // Calculate density
    const maxEdges = nodeCount * (nodeCount - 1);
    const density = maxEdges > 0 ? edgeCount / maxEdges : 0;

    // Average degree
    const averageDegree = nodeCount > 0 ? (edgeCount * 2) / nodeCount : 0;

    return {
      nodeCount,
      edgeCount,
      nodesByType,
      edgesByType,
      averageNodeWeight,
      averageEdgeWeight,
      averageEdgeConfidence,
      density,
      averageDegree,
    };
  }

  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================

  private getCacheKey(type: string, query: unknown): string {
    return `${type}:${JSON.stringify(query)}`;
  }

  private getFromCache<T>(key: string): T | undefined {
    if (!this.config.enableCache) {
      return undefined;
    }

    const value = this.cache.get(key);
    if (value !== undefined) {
      // Update access order
      const index = this.cacheAccessOrder.indexOf(key);
      if (index > -1) {
        this.cacheAccessOrder.splice(index, 1);
      }
      this.cacheAccessOrder.push(key);
    }
    return value as T;
  }

  private setCache(key: string, value: unknown): void {
    if (!this.config.enableCache) {
      return;
    }

    // Evict oldest if at capacity
    if (
      this.cache.size >= this.config.cacheSize &&
      this.cacheAccessOrder.length > 0
    ) {
      const oldest = this.cacheAccessOrder.shift();
      if (oldest) {
        this.cache.delete(oldest);
      }
    }

    this.cache.set(key, value);
    this.cacheAccessOrder.push(key);
  }

  private invalidateCache(): void {
    this.cache.clear();
    this.cacheAccessOrder = [];
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.invalidateCache();
  }

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  /**
   * Clear all data
   */
  clear(): void {
    this.nodes.clear();
    this.edges.clear();
    this.adjacencyList.clear();
    this.reverseAdjacency.clear();
    this.nodeTypeIndex.forEach(set => set.clear());
    this.edgeTypeIndex.clear();
    this.invalidateCache();
  }

  /**
   * Export graph data
   */
  export(): {
    nodes: KnowledgeNode[];
    edges: KnowledgeEdge[];
    config: GraphConfiguration;
  } {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values()),
      config: this.config,
    };
  }

  /**
   * Import graph data
   */
  import(data: {
    nodes: KnowledgeNode[];
    edges: KnowledgeEdge[];
    config?: GraphConfiguration;
  }): { nodesAdded: number; edgesAdded: number } {
    this.clear();

    if (data.config) {
      this.config = { ...this.config, ...data.config };
    }

    // Add nodes first
    let nodesAdded = 0;
    for (const node of data.nodes) {
      if (this.addNode(node)) {
        nodesAdded++;
      }
    }

    // Then add edges
    let edgesAdded = 0;
    for (const edge of data.edges) {
      if (this.addEdge(edge)) {
        edgesAdded++;
      }
    }

    return { nodesAdded, edgesAdded };
  }

  // ============================================================================
  // SIMULATION SUPPORT
  // ============================================================================

  /**
   * Create a subgraph for simulation
   */
  createSimulationSubgraph(
    nodeIds: string[],
    options: {
      includeNeighbors?: boolean;
      neighborDepth?: number;
    } = {}
  ): KnowledgeGraph {
    const subgraph = new KnowledgeGraph(this.config);

    // Add specified nodes
    for (const id of nodeIds) {
      const node = this.nodes.get(id);
      if (node) {
        subgraph.addNode(node);
      }
    }

    // Add neighbors if requested
    if (options.includeNeighbors) {
      const depth = options.neighborDepth || 1;
      const toAdd = new Set<string>();

      for (const id of nodeIds) {
        const neighborhood = this.getNeighborhood({
          nodeId: id,
          depth,
        });

        for (let d = 1; d <= depth; d++) {
          const layer = neighborhood.layers.get(d);
          if (layer) {
            for (const node of layer) {
              toAdd.add(node.id);
            }
          }
        }
      }

      for (const id of toAdd) {
        const node = this.nodes.get(id);
        if (node) {
          subgraph.addNode(node);
        }
      }
    }

    // Add edges between nodes in subgraph
    for (const edge of this.edges.values()) {
      if (
        subgraph.hasNode(edge.sourceId) &&
        subgraph.hasNode(edge.targetId)
      ) {
        subgraph.addEdge(edge);
      }
    }

    return subgraph;
  }

  /**
   * Clone the graph
   */
  clone(): KnowledgeGraph {
    const cloned = new KnowledgeGraph(this.config);
    const data = this.export();
    cloned.import(data);
    return cloned;
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export function createKnowledgeGraph(
  config?: Partial<GraphConfiguration>
): KnowledgeGraph {
  return new KnowledgeGraph(config);
}

export function createNode(
  type: NodeType,
  id: string,
  label: string,
  options: {
    weight?: number;
    metadata?: Partial<NodeMetadata>;
  } = {}
): KnowledgeNode {
  const now = Date.now();

  const baseNode = {
    id,
    type,
    label,
    weight: options.weight ?? 1,
    metadata: {
      createdAt: now,
      updatedAt: now,
      version: '1.0.0',
      ...options.metadata,
    },
  };

  switch (type) {
    case 'career':
      return {
        ...baseNode,
        type: 'career',
        careerId: id,
        category: 'general',
      };
    case 'skill':
      return {
        ...baseNode,
        type: 'skill',
        skillId: id,
        category: 'technical',
      };
    case 'degree':
      return {
        ...baseNode,
        type: 'degree',
        degreeId: id,
        level: 'undergraduate',
      };
    case 'exam':
      return {
        ...baseNode,
        type: 'exam',
        examId: id,
        difficulty: 5,
      };
    case 'certification':
      return {
        ...baseNode,
        type: 'certification',
        certificationId: id,
      };
    case 'industry':
      return {
        ...baseNode,
        type: 'industry',
        industryId: id,
        growthRate: 0,
      };
    case 'role':
      return {
        ...baseNode,
        type: 'role',
        roleId: id,
        seniority: 'entry',
      };
    default:
      throw new Error(`Unknown node type: ${type}`);
  }
}

export function createEdge(
  sourceId: string,
  targetId: string,
  type: string,
  options: {
    id?: string;
    strength?: RelationshipStrength;
    strengthScore?: StrengthScore;
    confidence?: number;
    weight?: number;
    bidirectional?: boolean;
    evidence?: CareerEvidence;
    context?: Record<string, unknown>;
  } = {}
): KnowledgeEdge {
  const now = Date.now();
  const id = options.id || `edge-${sourceId}-${targetId}-${now}`;

  const strength = options.strength || 'moderate';
  const strengthScore = options.strengthScore || 6;

  return {
    id,
    sourceId,
    targetId,
    type,
    bidirectional: options.bidirectional || false,
    metadata: {
      relationType: type,
      strength,
      strengthScore,
      confidence: options.confidence ?? 0.8,
      evidence: options.evidence,
      weight: options.weight ?? 1,
      createdAt: now,
      updatedAt: now,
      version: '1.0.0',
      context: options.context,
    },
  };
}
