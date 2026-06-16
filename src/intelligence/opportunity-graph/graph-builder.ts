/**
 * Graph Builder
 * 
 * Phase 8.8: CareerOS India Opportunity Graph
 * 
 * Constructs and manages the opportunity graph data structure.
 * Provides methods for adding nodes, edges, and querying the graph.
 * 
 * @module graph-builder
 * @version 1.0.0
 */

import {
  OpportunityGraph,
  OpportunityNode,
  OpportunityEdge,
  IGraphBuilder,
  OpportunityNodeType,
  EdgeType,
} from './opportunity-node-types';

export class GraphBuilder implements IGraphBuilder {
  private graph: OpportunityGraph;

  constructor() {
    this.graph = {
      nodes: new Map(),
      edges: new Map(),
      adjacencyList: new Map(),
    };
  }

  /**
   * Build and return the complete opportunity graph
   */
  buildGraph(): OpportunityGraph {
    return this.graph;
  }

  /**
   * Add a node to the graph
   */
  addNode(node: OpportunityNode): void {
    this.graph.nodes.set(node.id, node);
    if (!this.graph.adjacencyList.has(node.id)) {
      this.graph.adjacencyList.set(node.id, []);
    }
  }

  /**
   * Add multiple nodes at once
   */
  addNodes(nodes: OpportunityNode[]): void {
    for (const node of nodes) {
      this.addNode(node);
    }
  }

  /**
   * Add an edge to the graph
   */
  addEdge(edge: OpportunityEdge): void {
    // Validate that source and target nodes exist
    if (!this.graph.nodes.has(edge.source)) {
      throw new Error(`Source node ${edge.source} does not exist`);
    }
    if (!this.graph.nodes.has(edge.target)) {
      throw new Error(`Target node ${edge.target} does not exist`);
    }

    this.graph.edges.set(edge.id, edge);

    // Update adjacency list
    if (!this.graph.adjacencyList.has(edge.source)) {
      this.graph.adjacencyList.set(edge.source, []);
    }
    this.graph.adjacencyList.get(edge.source)!.push(edge.id);
  }

  /**
   * Add multiple edges at once
   */
  addEdges(edges: OpportunityEdge[]): void {
    for (const edge of edges) {
      this.addEdge(edge);
    }
  }

  /**
   * Get a node by ID
   */
  getNode(id: string): OpportunityNode | undefined {
    return this.graph.nodes.get(id);
  }

  /**
   * Get all edges from a node
   */
  getEdgesFrom(nodeId: string): OpportunityEdge[] {
    const edgeIds = this.graph.adjacencyList.get(nodeId) || [];
    return edgeIds.map(id => this.graph.edges.get(id)!).filter(Boolean);
  }

  /**
   * Get all edges to a node
   */
  getEdgesTo(nodeId: string): OpportunityEdge[] {
    const edges: OpportunityEdge[] = [];
    for (const edge of this.graph.edges.values()) {
      if (edge.target === nodeId) {
        edges.push(edge);
      }
    }
    return edges;
  }

  /**
   * Get all edges between two nodes
   */
  getEdgesBetween(sourceId: string, targetId: string): OpportunityEdge[] {
    const edges: OpportunityEdge[] = [];
    for (const edge of this.graph.edges.values()) {
      if (edge.source === sourceId && edge.target === targetId) {
        edges.push(edge);
      }
    }
    return edges;
  }

  /**
   * Get all nodes of a specific type
   */
  getNodesByType(type: OpportunityNodeType): OpportunityNode[] {
    const nodes: OpportunityNode[] = [];
    for (const node of this.graph.nodes.values()) {
      if (node.type === type) {
        nodes.push(node);
      }
    }
    return nodes;
  }

  /**
   * Get all nodes connected from a given node
   */
  getConnectedNodes(nodeId: string): OpportunityNode[] {
    const edges = this.getEdgesFrom(nodeId);
    return edges.map(edge => this.graph.nodes.get(edge.target)!).filter(Boolean);
  }

  /**
   * Get all nodes that can reach a given node
   */
  getPredecessorNodes(nodeId: string): OpportunityNode[] {
    const edges = this.getEdgesTo(nodeId);
    return edges.map(edge => this.graph.nodes.get(edge.source)!).filter(Boolean);
  }

  /**
   * Create an edge between two nodes with automatic ID generation
   */
  createEdge(
    source: string,
    target: string,
    type: EdgeType,
    weight: number,
    description: string,
    metadata: Record<string, unknown> = {}
  ): OpportunityEdge {
    const edge: OpportunityEdge = {
      id: `edge-${source}-${target}-${type}`,
      source,
      target,
      type,
      weight,
      description,
      metadata,
    };
    this.addEdge(edge);
    return edge;
  }

  /**
   * Check if a path exists between two nodes
   */
  hasPath(startId: string, endId: string, maxDepth: number = 10): boolean {
    if (startId === endId) return true;
    
    const visited = new Set<string>();
    const queue: Array<{ nodeId: string; depth: number }> = [{ nodeId: startId, depth: 0 }];

    while (queue.length > 0) {
      const { nodeId, depth } = queue.shift()!;
      
      if (depth > maxDepth) continue;
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      const connectedNodes = this.getConnectedNodes(nodeId);
      for (const node of connectedNodes) {
        if (node.id === endId) return true;
        queue.push({ nodeId: node.id, depth: depth + 1 });
      }
    }

    return false;
  }

  /**
   * Find all paths between two nodes up to a maximum depth
   */
  findAllPaths(startId: string, endId: string, maxDepth: number = 5): string[][] {
    const paths: string[][] = [];
    const visited = new Set<string>();

    const dfs = (currentId: string, path: string[], depth: number) => {
      if (depth > maxDepth) return;
      if (currentId === endId) {
        paths.push([...path]);
        return;
      }

      visited.add(currentId);
      const connectedNodes = this.getConnectedNodes(currentId);
      
      for (const node of connectedNodes) {
        if (!visited.has(node.id)) {
          path.push(node.id);
          dfs(node.id, path, depth + 1);
          path.pop();
        }
      }
      
      visited.delete(currentId);
    };

    dfs(startId, [startId], 0);
    return paths;
  }

  /**
   * Calculate the optionality score for a node (number of future paths)
   */
  calculateOptionality(nodeId: string, depth: number = 3): number {
    const reachableNodes = new Set<string>();
    const queue: Array<{ nodeId: string; currentDepth: number }> = [{ nodeId, currentDepth: 0 }];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const { nodeId: currentId, currentDepth } = queue.shift()!;
      
      if (currentDepth > depth) continue;
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      reachableNodes.add(currentId);
      
      const connectedNodes = this.getConnectedNodes(currentId);
      for (const node of connectedNodes) {
        queue.push({ nodeId: node.id, currentDepth: currentDepth + 1 });
      }
    }

    // Normalize to 0-1 range (assuming max reasonable paths is 50)
    return Math.min(reachableNodes.size / 50, 1);
  }

  /**
   * Get graph statistics
   */
  getStats(): {
    nodeCount: number;
    edgeCount: number;
    nodeTypeDistribution: Record<OpportunityNodeType, number>;
    edgeTypeDistribution: Record<EdgeType, number>;
  } {
    const nodeTypeDistribution = {} as Record<OpportunityNodeType, number>;
    const edgeTypeDistribution = {} as Record<EdgeType, number>;

    for (const node of this.graph.nodes.values()) {
      nodeTypeDistribution[node.type] = (nodeTypeDistribution[node.type] || 0) + 1;
    }

    for (const edge of this.graph.edges.values()) {
      edgeTypeDistribution[edge.type] = (edgeTypeDistribution[edge.type] || 0) + 1;
    }

    return {
      nodeCount: this.graph.nodes.size,
      edgeCount: this.graph.edges.size,
      nodeTypeDistribution,
      edgeTypeDistribution,
    };
  }

  /**
   * Clear the graph
   */
  clear(): void {
    this.graph.nodes.clear();
    this.graph.edges.clear();
    this.graph.adjacencyList.clear();
  }

  /**
   * Clone the graph
   */
  clone(): OpportunityGraph {
    return {
      nodes: new Map(this.graph.nodes),
      edges: new Map(this.graph.edges),
      adjacencyList: new Map(this.graph.adjacencyList),
    };
  }
}

/**
 * Create a new GraphBuilder instance
 */
export function createGraphBuilder(): GraphBuilder {
  return new GraphBuilder();
}

/**
 * Merge multiple graphs into one
 */
export function mergeGraphs(...graphs: Array<OpportunityGraph | OpportunityGraph[]>): OpportunityGraph {
  const merged: OpportunityGraph = {
    nodes: new Map(),
    edges: new Map(),
    adjacencyList: new Map(),
  };

  const graphList = graphs.flatMap(graph => Array.isArray(graph) ? graph : [graph]);

  for (const graph of graphList) {
    for (const [id, node] of graph.nodes) {
      merged.nodes.set(id, node);
    }
    for (const [id, edge] of graph.edges) {
      merged.edges.set(id, edge);
    }
    for (const [id, edges] of graph.adjacencyList) {
      if (!merged.adjacencyList.has(id)) {
        merged.adjacencyList.set(id, []);
      }
      merged.adjacencyList.get(id)!.push(...edges);
    }
  }

  return merged;
}
