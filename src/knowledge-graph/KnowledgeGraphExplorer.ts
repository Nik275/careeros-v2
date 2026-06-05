/**
 * CareerOS Knowledge Graph Explorer
 *
 * Natural language query interface for exploring career knowledge graphs.
 * Supports traversal, path discovery, and explainability.
 *
 * @version 1.0.0
 */

import type {
  KnowledgeGraph,
  KnowledgeNode,
  KnowledgeEdge,
  NodeType,
  GraphPath,
  CareerNode,
  SkillNode,
} from './KnowledgeGraphCore';
import type { CareerId } from '../ontology/career-ontology';
import type { Career } from '../domains/career/Career';
import {
  CareerSimilarityEngine,
  type CareerSimilarityResult,
  type DimensionSimilarity,
} from '../intelligence/similarity-engine';

// ============================================================================
// QUERY TYPES
// ============================================================================

/** Query type enumeration */
export type ExplorerQueryType =
  | 'reachable'           // What careers are reachable from X?
  | 'similar'             // What careers are similar to X?
  | 'connections'         // What connects X and Y?
  | 'pathways'            // What pathways lead to X?
  | 'neighbors'           // What is adjacent to X?
  | 'skills'              // What skills are needed for X?
  | 'requirements'        // What are the requirements for X?
  | 'custom';             // Custom query

/** Base query interface */
export interface ExplorerQuery {
  /** Query type */
  type: ExplorerQueryType;

  /** Query string (natural language) */
  query: string;

  /** Source node(s) */
  source?: string | string[];

  /** Target node(s) */
  target?: string | string[];

  /** Node type filter */
  nodeType?: NodeType | NodeType[];

  /** Edge type filter */
  edgeType?: string | string[];

  /** Maximum traversal depth */
  maxDepth?: number;

  /** Minimum relationship strength */
  minStrength?: number;

  /** Maximum results to return */
  limit?: number;

  /** Include explanations */
  explain?: boolean;

  /** Query metadata */
  metadata?: Record<string, unknown>;
}

/** Parsed query result */
export interface ParsedQuery {
  /** Original query string */
  original: string;

  /** Detected query type */
  type: ExplorerQueryType;

  /** Extracted entities */
  entities: {
    careers: string[];
    skills: string[];
    industries: string[];
    roles: string[];
  };

  /** Detected intent */
  intent: {
    action: 'find' | 'compare' | 'connect' | 'path' | 'explore';
    direction: 'from' | 'to' | 'between' | 'around';
  };

  /** Query parameters */
  parameters: {
    source?: string;
    target?: string;
    relationshipType?: string;
    constraints: Record<string, unknown>;
  };

  /** Confidence in parsing */
  confidence: number;
}

// ============================================================================
// RESULT TYPES
// ============================================================================

/** Exploration result */
export interface ExplorationResult {
  /** Query that produced this result */
  query: ExplorerQuery;

  /** Result type */
  resultType: 'nodes' | 'paths' | 'connections' | 'similarity' | 'mixed';

  /** Nodes found */
  nodes?: FoundNode[];

  /** Paths discovered */
  paths?: ExploredPath[];

  /** Connections between entities */
  connections?: EntityConnection[];

  /** Similarity results */
  similarities?: CareerSimilarityResult[];

  /** Explanation of results */
  explanation: ResultExplanation;

  /** Result metadata */
  metadata: {
    executionTimeMs: number;
    nodesExplored: number;
    edgesTraversed: number;
    cacheHit: boolean;
  };
}

/** Found node with context */
export interface FoundNode {
  /** The node */
  node: KnowledgeNode;

  /** How it was found */
  discovery: {
    method: 'traversal' | 'similarity' | 'direct' | 'inference';
    source?: string;
    path?: string[];
    distance?: number;
  };

  /** Relevance score (0-100) */
  relevanceScore: number;

  /** Relationship to query context */
  relationship?: {
    type: string;
    strength: number;
    description: string;
  };

  /** Node explanation */
  explanation?: string;
}

/** Explored path with details */
export interface ExploredPath {
  /** Path ID */
  id: string;

  /** Path from graph */
  path: GraphPath;

  /** Human-readable description */
  description: string;

  /** Path quality metrics */
  metrics: {
    feasibility: number;
    difficulty: number;
    timeEstimate: string;
    costEstimate?: string;
  };

  /** Step-by-step breakdown */
  steps: PathStep[];

  /** Alternative paths */
  alternatives?: string[];
}

/** Individual path step */
export interface PathStep {
  /** Step number */
  step: number;

  /** Node at this step */
  node: KnowledgeNode;

  /** Edge taken to reach this node */
  edge?: KnowledgeEdge;

  /** Action required */
  action: string;

  /** Requirements for this step */
  requirements?: string[];

  /** Estimated duration */
  duration?: string;
}

/** Connection between entities */
export interface EntityConnection {
  /** Source entity */
  source: KnowledgeNode;

  /** Target entity */
  target: KnowledgeNode;

  /** Connection type */
  type: 'direct' | 'indirect' | 'similar' | 'related';

  /** Paths connecting them */
  paths: GraphPath[];

  /** Shared attributes */
  sharedAttributes: {
    skills: string[];
    industries: string[];
    education: string[];
  };

  /** Connection strength (0-100) */
  strength: number;

  /** Explanation of connection */
  explanation: string;
}

/** Result explanation */
export interface ResultExplanation {
  /** Summary of results */
  summary: string;

  /** How the query was interpreted */
  queryInterpretation: string;

  /** Key findings */
  keyFindings: string[];

  /** Recommendations based on results */
  recommendations: string[];

  /** Confidence in results */
  confidence: number;

  /** Suggested follow-up queries */
  suggestedQueries: string[];
}

// ============================================================================
// EXPLORER CONFIGURATION
// ============================================================================

export interface ExplorerConfiguration {
  /** Maximum traversal depth */
  maxDepth: number;

  /** Maximum results per query */
  maxResults: number;

  /** Minimum edge confidence */
  minConfidence: number;

  /** Enable similarity search */
  enableSimilarity: boolean;

  /** Similarity threshold (0-100) */
  similarityThreshold: number;

  /** Enable pathfinding */
  enablePathfinding: boolean;

  /** Maximum path length */
  maxPathLength: number;

  /** Enable natural language parsing */
  enableNLP: boolean;

  /** Cache results */
  enableCache: boolean;

  /** Cache TTL in milliseconds */
  cacheTtl: number;

  /** Career data for similarity calculations */
  careerData?: Map<string, Career>;
}

export const DEFAULT_EXPLORER_CONFIG: ExplorerConfiguration = {
  maxDepth: 5,
  maxResults: 20,
  minConfidence: 0.6,
  enableSimilarity: true,
  similarityThreshold: 50,
  enablePathfinding: true,
  maxPathLength: 6,
  enableNLP: true,
  enableCache: true,
  cacheTtl: 300000, // 5 minutes
};

// ============================================================================
// KNOWLEDGE GRAPH EXPLORER
// ============================================================================

export class KnowledgeGraphExplorer {
  private graph: KnowledgeGraph;
  private config: ExplorerConfiguration;
  private similarityEngine: CareerSimilarityEngine;
  private cache: Map<string, { result: ExplorationResult; timestamp: number }>;
  private careerData: Map<string, Career>;

  constructor(
    graph: KnowledgeGraph,
    config: Partial<ExplorerConfiguration> = {},
    careerData: Map<string, Career> = new Map()
  ) {
    this.graph = graph;
    this.config = { ...DEFAULT_EXPLORER_CONFIG, ...config };
    this.similarityEngine = new CareerSimilarityEngine();
    this.cache = new Map();
    this.careerData = careerData;
  }

  // ============================================================================
  // QUERY PARSING
  // ============================================================================

  /**
   * Parse natural language query
   */
  parseQuery(queryString: string): ParsedQuery {
    const normalized = queryString.toLowerCase().trim();

    // Detect query type patterns
    const patterns: Array<{ type: ExplorerQueryType; regex: RegExp; confidence: number }> = [
      { type: 'reachable', regex: /what careers are reachable from|what can i do after|paths from|starting from/i, confidence: 0.9 },
      { type: 'similar', regex: /what careers are similar to|like|comparable to|alternatives to/i, confidence: 0.9 },
      { type: 'connections', regex: /what (skills|connects|connections|links).*between|how are.*connected|what connects/i, confidence: 0.85 },
      { type: 'pathways', regex: /what pathways lead to|how do i become|path to|steps to/i, confidence: 0.9 },
      { type: 'neighbors', regex: /what is adjacent to|what's next to|neighbors of|around/i, confidence: 0.8 },
      { type: 'skills', regex: /what skills (are needed|do i need|required) for/i, confidence: 0.9 },
      { type: 'requirements', regex: /what are the requirements for|what do i need for/i, confidence: 0.85 },
    ];

    let detectedType: ExplorerQueryType = 'custom';
    let parseConfidence = 0.5;

    for (const pattern of patterns) {
      if (pattern.regex.test(normalized)) {
        detectedType = pattern.type;
        parseConfidence = pattern.confidence;
        break;
      }
    }

    // Extract career names (simplified - would use NER in production)
    const careerNames = this.extractCareerNames(normalized);

    // Detect intent
    const intent = this.detectIntent(normalized);

    // Extract parameters
    const parameters = this.extractParameters(normalized, careerNames);

    return {
      original: queryString,
      type: detectedType,
      entities: {
        careers: careerNames,
        skills: [],
        industries: [],
        roles: [],
      },
      intent,
      parameters,
      confidence: parseConfidence,
    };
  }

  /**
   * Extract career names from query (simplified)
   */
  private extractCareerNames(query: string): string[] {
    const careerPatterns = [
      /software engineer/i,
      /ai engineer/i,
      /product manager/i,
      /data scientist/i,
      /doctor/i,
      /investment banker/i,
      /entrepreneur/i,
      /founder/i,
      /venture capital/i,
      /cybersecurity/i,
      /management consultant/i,
      /ux designer/i,
      /chartered accountant/i,
      /ias officer/i,
      /surgeon/i,
      /corporate lawyer/i,
      /research scientist/i,
      /ml engineer/i,
      /business analyst/i,
      /operations manager/i,
      /financial analyst/i,
      /cfa professional/i,
      /ips officer/i,
      /irs officer/i,
      /psychologist/i,
      /litigation lawyer/i,
      /judge/i,
      /product designer/i,
      /biotechnologist/i,
    ];

    const found: string[] = [];
    for (const pattern of careerPatterns) {
      const match = query.match(pattern);
      if (match) {
        found.push(match[0]);
      }
    }

    return found;
  }

  /**
   * Detect query intent
   */
  private detectIntent(query: string): ParsedQuery['intent'] {
    let action: ParsedQuery['intent']['action'] = 'explore';
    let direction: ParsedQuery['intent']['direction'] = 'around';

    if (/find|what|which|show/i.test(query)) {
      action = 'find';
    } else if (/compare|similar|like/i.test(query)) {
      action = 'compare';
    } else if (/connect|connection|between/i.test(query)) {
      action = 'connect';
    } else if (/path|pathway|steps|how/i.test(query)) {
      action = 'path';
    }

    if (/from|starting|after/i.test(query)) {
      direction = 'from';
    } else if (/to|become|lead/i.test(query)) {
      direction = 'to';
    } else if (/between|connect/i.test(query)) {
      direction = 'between';
    }

    return { action, direction };
  }

  /**
   * Extract query parameters
   */
  private extractParameters(query: string, careers: string[]): ParsedQuery['parameters'] {
    const params: ParsedQuery['parameters'] = {
      constraints: {},
    };

    if (careers.length > 0) {
      if (/from|starting/i.test(query)) {
        params.source = careers[0];
        if (careers.length > 1) {
          params.target = careers[1];
        }
      } else if (/to|become/i.test(query)) {
        params.target = careers[0];
      } else if (/between/i.test(query) && careers.length >= 2) {
        params.source = careers[0];
        params.target = careers[1];
      } else {
        params.source = careers[0];
      }
    }

    // Extract relationship type
    if (/similar|like|comparable/i.test(query)) {
      params.relationshipType = 'similar';
    } else if (/adjacent|next|progression/i.test(query)) {
      params.relationshipType = 'adjacent';
    } else if (/pivot|switch/i.test(query)) {
      params.relationshipType = 'pivot';
    }

    return params;
  }

  // ============================================================================
  // QUERY EXECUTION
  // ============================================================================

  /**
   * Execute a query
   */
  executeQuery(query: ExplorerQuery | string): ExplorationResult {
    const startTime = performance.now();

    // Parse string queries
    let parsedQuery: ExplorerQuery;
    if (typeof query === 'string') {
      const parsed = this.parseQuery(query);
      parsedQuery = {
        type: parsed.type,
        query: query,
        source: parsed.parameters.source,
        target: parsed.parameters.target,
        maxDepth: this.config.maxDepth,
        limit: this.config.maxResults,
        explain: true,
      };
    } else {
      parsedQuery = query;
    }

    // Check cache
    const cacheKey = this.getCacheKey(parsedQuery);
    if (this.config.enableCache) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return { ...cached, metadata: { ...cached.metadata, cacheHit: true } };
      }
    }

    // Execute based on query type
    let result: ExplorationResult;

    switch (parsedQuery.type) {
      case 'reachable':
        result = this.findReachableCareers(parsedQuery);
        break;
      case 'similar':
        result = this.findSimilarCareers(parsedQuery);
        break;
      case 'connections':
        result = this.findConnections(parsedQuery);
        break;
      case 'pathways':
        result = this.findPathways(parsedQuery);
        break;
      case 'neighbors':
        result = this.findNeighbors(parsedQuery);
        break;
      case 'skills':
        result = this.findRequiredSkills(parsedQuery);
        break;
      case 'requirements':
        result = this.findRequirements(parsedQuery);
        break;
      default:
        result = this.executeCustomQuery(parsedQuery);
    }

    // Cache result
    if (this.config.enableCache) {
      this.setCache(cacheKey, result);
    }

    // Update metadata
    const executionTime = performance.now() - startTime;
    result.metadata.executionTimeMs = Math.round(executionTime);
    result.metadata.cacheHit = false;

    return result;
  }

  // ============================================================================
  // QUERY IMPLEMENTATIONS
  // ============================================================================

  /**
   * Find careers reachable from a source career
   */
  private findReachableCareers(query: ExplorerQuery): ExplorationResult {
    const sourceId = this.resolveCareerId(query.source as string);
    const maxDepth = query.maxDepth || this.config.maxDepth;

    const reachableNodes: FoundNode[] = [];
    const visited = new Set<string>();
    const queue: Array<{ nodeId: string; depth: number; path: string[] }> = [
      { nodeId: sourceId, depth: 0, path: [sourceId] },
    ];

    let nodesExplored = 0;
    let edgesTraversed = 0;

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.depth > maxDepth) continue;
      if (visited.has(current.nodeId)) continue;
      visited.add(current.nodeId);
      nodesExplored++;

      const node = this.graph.getNode(current.nodeId);
      if (!node) continue;

      // Add to results if it's a career (and not the source)
      if (node.type === 'career' && current.depth > 0) {
        reachableNodes.push({
          node,
          discovery: {
            method: 'traversal',
            source: sourceId,
            path: current.path,
            distance: current.depth,
          },
          relevanceScore: Math.max(0, 100 - current.depth * 15),
          relationship: {
            type: 'reachable',
            strength: Math.max(0, 100 - current.depth * 15),
            description: `${current.depth} step${current.depth > 1 ? 's' : ''} from source`,
          },
        });
      }

      // Explore neighbors
      const connections = this.graph.getConnectedNodes(current.nodeId, {
        direction: 'outgoing',
        minConfidence: this.config.minConfidence,
      });

      for (const { node: neighbor, edge } of connections) {
        edgesTraversed++;
        if (!visited.has(neighbor.id)) {
          queue.push({
            nodeId: neighbor.id,
            depth: current.depth + 1,
            path: [...current.path, neighbor.id],
          });
        }
      }
    }

    // Sort by relevance
    reachableNodes.sort((a, b) => b.relevanceScore - a.relevanceScore);

    const limited = query.limit
      ? reachableNodes.slice(0, query.limit)
      : reachableNodes.slice(0, this.config.maxResults);

    return {
      query,
      resultType: 'nodes',
      nodes: limited,
      explanation: this.generateExplanation(query, {
        reachableCount: limited.length,
        maxDepth,
        sourceName: this.graph.getNode(sourceId)?.label || sourceId,
      }),
      metadata: {
        executionTimeMs: 0,
        nodesExplored,
        edgesTraversed,
        cacheHit: false,
      },
    };
  }

  /**
   * Find careers similar to a target career
   */
  private findSimilarCareers(query: ExplorerQuery): ExplorationResult {
    const targetId = this.resolveCareerId(query.source as string);
    const targetNode = this.graph.getNode(targetId);

    if (!targetNode || targetNode.type !== 'career') {
      return this.createEmptyResult(query, 'Target career not found');
    }

    const targetCareer = this.careerData.get(targetId);
    if (!targetCareer) {
      return this.createEmptyResult(query, 'Career data not available for similarity comparison');
    }

    // Get all career nodes from graph
    const allCareerNodes = this.graph.getNodesByType('career');
    const comparisonCareers: Career[] = [];

    for (const node of allCareerNodes) {
      if (node.id !== targetId) {
        const career = this.careerData.get(node.id);
        if (career) {
          comparisonCareers.push(career);
        }
      }
    }

    // Calculate similarities
    const similarities = this.similarityEngine.findMostSimilar(
      targetCareer,
      comparisonCareers,
      query.limit || this.config.maxResults,
      this.config.similarityThreshold
    );

    // Convert to FoundNode format
    const similarNodes: FoundNode[] = similarities.map(sim => {
      const node = this.graph.getNode(sim.careerB as string);
      return {
        node: node!,
        discovery: {
          method: 'similarity',
          source: targetId,
        },
        relevanceScore: sim.overallScore,
        relationship: {
          type: 'similar',
          strength: sim.overallScore,
          description: sim.explanation.summary,
        },
        explanation: sim.explanation.recommendation,
      };
    });

    return {
      query,
      resultType: 'similarity',
      nodes: similarNodes,
      similarities,
      explanation: this.generateExplanation(query, {
        targetName: targetNode.label,
        similarCount: similarNodes.length,
        topScore: similarNodes[0]?.relevanceScore || 0,
      }),
      metadata: {
        executionTimeMs: 0,
        nodesExplored: allCareerNodes.length,
        edgesTraversed: 0,
        cacheHit: false,
      },
    };
  }

  /**
   * Find connections between two careers
   */
  private findConnections(query: ExplorerQuery): ExplorationResult {
    const sourceId = this.resolveCareerId(query.source as string);
    const targetId = this.resolveCareerId(query.target as string);

    const sourceNode = this.graph.getNode(sourceId);
    const targetNode = this.graph.getNode(targetId);

    if (!sourceNode || !targetNode) {
      return this.createEmptyResult(query, 'Source or target not found');
    }

    // Find all paths
    const paths = this.graph.findRelationships(sourceId, targetId, {
      maxLength: this.config.maxPathLength,
    });

    // Get direct connections
    const directConnections = this.graph.getConnectedNodes(sourceId, {
      direction: 'both',
      minConfidence: this.config.minConfidence,
    }).filter(conn => conn.node.id === targetId);

    // Build connection objects
    const connections: EntityConnection[] = [];

    if (directConnections.length > 0) {
      connections.push({
        source: sourceNode,
        target: targetNode,
        type: 'direct',
        paths: [],
        sharedAttributes: { skills: [], industries: [], education: [] },
        strength: directConnections[0].edge.metadata.confidence * 100,
        explanation: `Direct ${directConnections[0].edge.type} relationship`,
      });
    }

    if (paths.length > 0) {
      const indirectPaths = paths.slice(0, 3); // Top 3 paths
      connections.push({
        source: sourceNode,
        target: targetNode,
        type: 'indirect',
        paths: indirectPaths,
        sharedAttributes: this.findSharedAttributes(sourceNode, targetNode),
        strength: this.calculateConnectionStrength(indirectPaths),
        explanation: `Connected through ${paths.length} indirect path${paths.length > 1 ? 's' : ''}`,
      });
    }

    // Also check similarity
    const sourceCareer = this.careerData.get(sourceId);
    const targetCareer = this.careerData.get(targetId);

    if (sourceCareer && targetCareer) {
      const similarity = this.similarityEngine.calculateSimilarity(sourceCareer, targetCareer);
      if (similarity.overallScore >= this.config.similarityThreshold) {
        connections.push({
          source: sourceNode,
          target: targetNode,
          type: 'similar',
          paths: [],
          sharedAttributes: this.findSharedAttributes(sourceNode, targetNode),
          strength: similarity.overallScore,
          explanation: similarity.explanation.summary,
        });
      }
    }

    return {
      query,
      resultType: 'connections',
      connections,
      explanation: this.generateExplanation(query, {
        sourceName: sourceNode.label,
        targetName: targetNode.label,
        connectionCount: connections.length,
        pathCount: paths.length,
      }),
      metadata: {
        executionTimeMs: 0,
        nodesExplored: 2,
        edgesTraversed: paths.reduce((sum, p) => sum + p.length, 0),
        cacheHit: false,
      },
    };
  }

  /**
   * Find pathways to a target career
   */
  private findPathways(query: ExplorerQuery): ExplorationResult {
    const targetId = this.resolveCareerId(query.target as string);
    const targetNode = this.graph.getNode(targetId);

    if (!targetNode) {
      return this.createEmptyResult(query, 'Target career not found');
    }

    // Find all careers that can reach this target
    const allCareers = this.graph.getNodesByType('career');
    const pathways: ExploredPath[] = [];

    for (const career of allCareers) {
      if (career.id === targetId) continue;

      const paths = this.graph.findRelationships(career.id, targetId, {
        maxLength: this.config.maxPathLength,
      });

      for (const path of paths.slice(0, 2)) { // Top 2 paths per career
        pathways.push(this.convertToExploredPath(path, career, targetNode));
      }
    }

    // Sort by feasibility
    pathways.sort((a, b) => b.metrics.feasibility - a.metrics.feasibility);

    const limited = pathways.slice(0, query.limit || this.config.maxResults);

    return {
      query,
      resultType: 'paths',
      paths: limited,
      explanation: this.generateExplanation(query, {
        targetName: targetNode.label,
        pathwayCount: limited.length,
      }),
      metadata: {
        executionTimeMs: 0,
        nodesExplored: allCareers.length,
        edgesTraversed: pathways.reduce((sum, p) => sum + p.path.length, 0),
        cacheHit: false,
      },
    };
  }

  /**
   * Find neighbors of a node
   */
  private findNeighbors(query: ExplorerQuery): ExplorationResult {
    const nodeId = this.resolveCareerId(query.source as string);
    const node = this.graph.getNode(nodeId);

    if (!node) {
      return this.createEmptyResult(query, 'Node not found');
    }

    const connections = this.graph.getConnectedNodes(nodeId, {
      direction: 'both',
      minConfidence: this.config.minConfidence,
    });

    const neighbors: FoundNode[] = connections.map(({ node: neighbor, edge }) => ({
      node: neighbor,
      discovery: {
        method: 'traversal',
        source: nodeId,
      },
      relevanceScore: edge.metadata.confidence * 100,
      relationship: {
        type: edge.type,
        strength: edge.metadata.strengthScore,
        description: `${edge.type} relationship`,
      },
    }));

    // Sort by strength
    neighbors.sort((a, b) => (b.relationship?.strength || 0) - (a.relationship?.strength || 0));

    return {
      query,
      resultType: 'nodes',
      nodes: neighbors.slice(0, query.limit || this.config.maxResults),
      explanation: this.generateExplanation(query, {
        sourceName: node.label,
        neighborCount: neighbors.length,
      }),
      metadata: {
        executionTimeMs: 0,
        nodesExplored: 1,
        edgesTraversed: connections.length,
        cacheHit: false,
      },
    };
  }

  /**
   * Find required skills for a career
   */
  private findRequiredSkills(query: ExplorerQuery): ExplorationResult {
    const careerId = this.resolveCareerId(query.source as string);

    const connections = this.graph.getConnectedNodes(careerId, {
      direction: 'incoming',
      edgeTypes: ['requires', 'needs', 'uses'],
      minConfidence: this.config.minConfidence,
    });

    const skillNodes = connections
      .filter(({ node }) => node.type === 'skill')
      .map(({ node, edge }) => ({
        node,
        discovery: { method: 'direct', source: careerId },
        relevanceScore: edge.metadata.confidence * 100,
        relationship: {
          type: 'required',
          strength: edge.metadata.strengthScore,
          description: `Required skill`,
        },
      }));

    return {
      query,
      resultType: 'nodes',
      nodes: skillNodes.slice(0, query.limit || this.config.maxResults),
      explanation: this.generateExplanation(query, {
        careerName: this.graph.getNode(careerId)?.label || careerId,
        skillCount: skillNodes.length,
      }),
      metadata: {
        executionTimeMs: 0,
        nodesExplored: 1,
        edgesTraversed: connections.length,
        cacheHit: false,
      },
    };
  }

  /**
   * Find requirements for a career
   */
  private findRequirements(query: ExplorerQuery): ExplorationResult {
    const careerId = this.resolveCareerId(query.source as string);

    const connections = this.graph.getConnectedNodes(careerId, {
      direction: 'incoming',
      minConfidence: this.config.minConfidence,
    });

    const requirementNodes = connections.map(({ node, edge }) => ({
      node,
      discovery: { method: 'direct', source: careerId },
      relevanceScore: edge.metadata.confidence * 100,
      relationship: {
        type: edge.type,
        strength: edge.metadata.strengthScore,
        description: `${edge.type} requirement`,
      },
    }));

    // Group by type
    const grouped = this.groupByType(requirementNodes);

    return {
      query,
      resultType: 'nodes',
      nodes: requirementNodes.slice(0, query.limit || this.config.maxResults),
      explanation: this.generateExplanation(query, {
        careerName: this.graph.getNode(careerId)?.label || careerId,
        requirementCount: requirementNodes.length,
        groups: grouped,
      }),
      metadata: {
        executionTimeMs: 0,
        nodesExplored: 1,
        edgesTraversed: connections.length,
        cacheHit: false,
      },
    };
  }

  /**
   * Execute custom query
   */
  private executeCustomQuery(query: ExplorerQuery): ExplorationResult {
    // Default to neighbor search
    return this.findNeighbors(query);
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Resolve career name to ID
   */
  private resolveCareerId(nameOrId: string): string {
    // Handle undefined/null
    if (!nameOrId) {
      return '';
    }

    // If it's already an ID format, return it
    if (nameOrId.startsWith('career-')) {
      return nameOrId;
    }

    // Try to find by label
    const normalized = nameOrId.toLowerCase();
    const allNodes = this.graph.getAllNodes();

    for (const node of allNodes) {
      if (node.label.toLowerCase() === normalized) {
        return node.id;
      }
    }

    // Return as-is if not found (will fail gracefully later)
    return nameOrId;
  }

  /**
   * Convert graph path to explored path
   */
  private convertToExploredPath(
    path: GraphPath,
    sourceNode: KnowledgeNode,
    targetNode: KnowledgeNode
  ): ExploredPath {
    const steps: PathStep[] = [];

    for (let i = 0; i < path.nodes.length; i++) {
      const nodeId = path.nodes[i];
      const node = this.graph.getNode(nodeId)!;
      const edge = i > 0 ? path.edges[i - 1] : undefined;

      steps.push({
        step: i + 1,
        node,
        edge,
        action: i === 0 ? 'Start' : `Transition via ${edge?.type || 'path'}`,
        duration: edge ? this.estimateDuration(edge) : undefined,
      });
    }

    return {
      id: path.id,
      path,
      description: `Path from ${sourceNode.label} to ${targetNode.label}`,
      metrics: {
        feasibility: this.calculateFeasibility(path),
        difficulty: this.estimateDifficulty(path),
        timeEstimate: this.estimateTotalTime(path),
      },
      steps,
    };
  }

  /**
   * Calculate path feasibility
   */
  private calculateFeasibility(path: GraphPath): number {
    const confidenceFactor = path.averageConfidence * 100;
    const lengthFactor = Math.max(0, 100 - path.length * 10);
    return Math.round((confidenceFactor + lengthFactor) / 2);
  }

  /**
   * Estimate path difficulty
   */
  private estimateDifficulty(path: GraphPath): number {
    return Math.min(100, path.length * 15 + (100 - path.averageConfidence * 100));
  }

  /**
   * Estimate duration for an edge
   */
  private estimateDuration(edge: KnowledgeEdge): string {
    const strength = edge.metadata.strengthScore;
    if (strength >= 8) return '1-2 years';
    if (strength >= 6) return '2-3 years';
    if (strength >= 4) return '3-5 years';
    return '5+ years';
  }

  /**
   * Estimate total time for a path
   */
  private estimateTotalTime(path: GraphPath): string {
    const years = path.length * 2;
    return `${years}-${years + 2} years`;
  }

  /**
   * Find shared attributes between nodes
   */
  private findSharedAttributes(nodeA: KnowledgeNode, nodeB: KnowledgeNode): EntityConnection['sharedAttributes'] {
    // This would be more sophisticated in production
    return {
      skills: [],
      industries: nodeA.type === nodeB.type ? [nodeA.type] : [],
      education: [],
    };
  }

  /**
   * Calculate connection strength from paths
   */
  private calculateConnectionStrength(paths: GraphPath[]): number {
    if (paths.length === 0) return 0;
    const avgConfidence = paths.reduce((sum, p) => sum + p.averageConfidence, 0) / paths.length;
    const pathBonus = Math.min(20, paths.length * 5);
    return Math.round(avgConfidence * 100 + pathBonus);
  }

  /**
   * Group nodes by type
   */
  private groupByType(nodes: FoundNode[]): Record<string, number> {
    const groups: Record<string, number> = {};
    for (const { node } of nodes) {
      groups[node.type] = (groups[node.type] || 0) + 1;
    }
    return groups;
  }

  /**
   * Generate result explanation
   */
  private generateExplanation(
    query: ExplorerQuery,
    context: Record<string, unknown>
  ): ResultExplanation {
    const explanations: Record<ExplorerQueryType, (ctx: typeof context) => ResultExplanation> = {
      reachable: (ctx) => ({
        summary: `Found ${ctx.reachableCount} careers reachable from ${ctx.sourceName} within ${ctx.maxDepth} steps.`,
        queryInterpretation: `Finding all career paths starting from ${ctx.sourceName}`,
        keyFindings: [
          `${ctx.reachableCount} viable career transitions identified`,
          `Maximum exploration depth: ${ctx.maxDepth} steps`,
          'Results sorted by relevance and distance',
        ],
        recommendations: [
          'Review high-relevance careers for immediate transitions',
          'Consider intermediate steps for distant careers',
          'Evaluate skill gaps before transitioning',
        ],
        confidence: 0.85,
        suggestedQueries: [
          `What skills are needed for ${ctx.sourceName}?`,
          `What careers are similar to ${ctx.sourceName}?`,
          `What pathways lead to ${ctx.sourceName}?`,
        ],
      }),

      similar: (ctx) => ({
        summary: `Found ${ctx.similarCount} careers similar to ${ctx.targetName}.`,
        queryInterpretation: `Comparing ${ctx.targetName} with all other careers`,
        keyFindings: [
          `${ctx.similarCount} similar careers identified`,
          `Top match score: ${ctx.topScore}/100`,
          'Similarity based on skills, psychology, work style, education, and industry',
        ],
        recommendations: [
          'Consider similar careers for alternative paths',
          'Review differences before making decisions',
          'Use similarity scores to prioritize options',
        ],
        confidence: 0.9,
        suggestedQueries: [
          `What careers are reachable from ${ctx.targetName}?`,
          `What connects ${ctx.targetName} and [similar career]?`,
          `What skills are needed for ${ctx.targetName}?`,
        ],
      }),

      connections: (ctx) => ({
        summary: `Found ${ctx.connectionCount} connection types between ${ctx.sourceName} and ${ctx.targetName}.`,
        queryInterpretation: `Analyzing relationships between ${ctx.sourceName} and ${ctx.targetName}`,
        keyFindings: [
          `${ctx.pathCount} connection paths identified`,
          'Direct and indirect relationships analyzed',
          'Similarity overlap calculated',
        ],
        recommendations: [
          'Review connection paths for transition feasibility',
          'Consider shared skills for easier transition',
          'Evaluate path difficulty before proceeding',
        ],
        confidence: 0.88,
        suggestedQueries: [
          `What pathways lead from ${ctx.sourceName} to ${ctx.targetName}?`,
          `What careers are similar to ${ctx.sourceName}?`,
          `What careers are similar to ${ctx.targetName}?`,
        ],
      }),

      pathways: (ctx) => ({
        summary: `Found ${ctx.pathwayCount} pathways leading to ${ctx.targetName}.`,
        queryInterpretation: `Discovering all paths to become a ${ctx.targetName}`,
        keyFindings: [
          `${ctx.pathwayCount} viable entry paths identified`,
          'Paths ranked by feasibility',
          'Multiple starting careers available',
        ],
        recommendations: [
          'Choose path based on your current career',
          'Consider path difficulty and time required',
          'Evaluate intermediate milestones',
        ],
        confidence: 0.82,
        suggestedQueries: [
          `What careers are reachable from my current role?`,
          `What skills are needed for ${ctx.targetName}?`,
          `What careers are similar to ${ctx.targetName}?`,
        ],
      }),

      neighbors: (ctx) => ({
        summary: `Found ${ctx.neighborCount} direct connections to ${ctx.sourceName}.`,
        queryInterpretation: `Finding immediate neighbors of ${ctx.sourceName}`,
        keyFindings: [
          `${ctx.neighborCount} adjacent nodes found`,
          'Connections sorted by strength',
          'Direct relationships only',
        ],
        recommendations: [
          'Explore strongest connections first',
          'Consider bidirectional relationships',
          'Review relationship types for context',
        ],
        confidence: 0.9,
        suggestedQueries: [
          `What careers are reachable from ${ctx.sourceName}?`,
          `What careers are similar to ${ctx.sourceName}?`,
          `What connects ${ctx.sourceName} and [neighbor]?`,
        ],
      }),

      skills: (ctx) => ({
        summary: `Found ${ctx.skillCount} required skills for ${ctx.careerName}.`,
        queryInterpretation: `Identifying skill requirements for ${ctx.careerName}`,
        keyFindings: [
          `${ctx.skillCount} essential skills identified`,
          'Skills ranked by importance',
          'Direct career-to-skill relationships',
        ],
        recommendations: [
          'Prioritize high-importance skills',
          'Assess current skill gaps',
          'Plan skill development timeline',
        ],
        confidence: 0.88,
        suggestedQueries: [
          `What careers use these skills?`,
          `What careers are similar to ${ctx.careerName}?`,
          `What pathways lead to ${ctx.careerName}?`,
        ],
      }),

      requirements: (ctx) => ({
        summary: `Found ${ctx.requirementCount} requirements for ${ctx.careerName}.`,
        queryInterpretation: `Gathering all requirements for ${ctx.careerName}`,
        keyFindings: [
          `${ctx.requirementCount} total requirements`,
          `Grouped by type: ${JSON.stringify(ctx.groups)}`,
          'Education, skills, and certifications included',
        ],
        recommendations: [
          'Review all requirement categories',
          'Plan requirement fulfillment timeline',
          'Consider prerequisite dependencies',
        ],
        confidence: 0.85,
        suggestedQueries: [
          `What skills are needed for ${ctx.careerName}?`,
          `What pathways lead to ${ctx.careerName}?`,
          `What careers are similar to ${ctx.careerName}?`,
        ],
      }),

      custom: (ctx) => ({
        summary: 'Custom query results',
        queryInterpretation: 'General exploration query',
        keyFindings: ['Results based on query parameters'],
        recommendations: ['Refine query for more specific results'],
        confidence: 0.7,
        suggestedQueries: ['Try a more specific query type'],
      }),
    };

    const generator = explanations[query.type] || explanations.custom;
    return generator(context);
  }

  /**
   * Create empty result for errors
   */
  private createEmptyResult(query: ExplorerQuery, reason: string): ExplorationResult {
    return {
      query,
      resultType: 'nodes',
      nodes: [],
      explanation: {
        summary: `No results found: ${reason}`,
        queryInterpretation: 'Query could not be completed',
        keyFindings: [reason],
        recommendations: ['Check query parameters', 'Verify career names', 'Try a different query'],
        confidence: 0,
        suggestedQueries: [],
      },
      metadata: {
        executionTimeMs: 0,
        nodesExplored: 0,
        edgesTraversed: 0,
        cacheHit: false,
      },
    };
  }

  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================

  private getCacheKey(query: ExplorerQuery): string {
    return `explore-${JSON.stringify(query)}`;
  }

  private getFromCache(key: string): ExplorationResult | undefined {
    const cached = this.cache.get(key);
    if (!cached) return undefined;

    if (Date.now() - cached.timestamp > this.config.cacheTtl) {
      this.cache.delete(key);
      return undefined;
    }

    return cached.result;
  }

  private setCache(key: string, result: ExplorationResult): void {
    this.cache.set(key, { result, timestamp: Date.now() });
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  // ============================================================================
  // PUBLIC UTILITY METHODS
  // ============================================================================

  /**
   * Get graph statistics
   */
  getGraphStatistics(): {
    nodeCount: number;
    edgeCount: number;
    careerCount: number;
    skillCount: number;
    cacheSize: number;
  } {
    return {
      nodeCount: this.graph.getAllNodes().length,
      edgeCount: this.graph.getAllEdges().length,
      careerCount: this.graph.getNodesByType('career').length,
      skillCount: this.graph.getNodesByType('skill').length,
      cacheSize: this.cache.size,
    };
  }

  /**
   * Update career data
   */
  setCareerData(careerData: Map<string, Career>): void {
    this.careerData = careerData;
    this.clearCache();
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ExplorerConfiguration>): void {
    this.config = { ...this.config, ...config };
    this.clearCache();
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export function createKnowledgeGraphExplorer(
  graph: KnowledgeGraph,
  config?: Partial<ExplorerConfiguration>,
  careerData?: Map<string, Career>
): KnowledgeGraphExplorer {
  return new KnowledgeGraphExplorer(graph, config, careerData);
}

// ============================================================================
// QUERY BUILDERS
// ============================================================================

export const QueryBuilders = {
  /** Build reachable query */
  reachable: (from: string, options: { maxDepth?: number; limit?: number } = {}): ExplorerQuery => ({
    type: 'reachable',
    query: `What careers are reachable from ${from}?`,
    source: from,
    maxDepth: options.maxDepth || 5,
    limit: options.limit || 20,
    explain: true,
  }),

  /** Build similar query */
  similar: (to: string, options: { threshold?: number; limit?: number } = {}): ExplorerQuery => ({
    type: 'similar',
    query: `What careers are similar to ${to}?`,
    source: to,
    minStrength: options.threshold || 50,
    limit: options.limit || 10,
    explain: true,
  }),

  /** Build connections query */
  connections: (from: string, to: string): ExplorerQuery => ({
    type: 'connections',
    query: `What connects ${from} and ${to}?`,
    source: from,
    target: to,
    explain: true,
  }),

  /** Build pathways query */
  pathways: (to: string, options: { limit?: number } = {}): ExplorerQuery => ({
    type: 'pathways',
    query: `What pathways lead to ${to}?`,
    target: to,
    limit: options.limit || 10,
    explain: true,
  }),

  /** Build neighbors query */
  neighbors: (of: string): ExplorerQuery => ({
    type: 'neighbors',
    query: `What is adjacent to ${of}?`,
    source: of,
    explain: true,
  }),

  /** Build skills query */
  skills: (forCareer: string): ExplorerQuery => ({
    type: 'skills',
    query: `What skills are needed for ${forCareer}?`,
    source: forCareer,
    explain: true,
  }),

  /** Build requirements query */
  requirements: (forCareer: string): ExplorerQuery => ({
    type: 'requirements',
    query: `What are the requirements for ${forCareer}?`,
    source: forCareer,
    explain: true,
  }),
};
