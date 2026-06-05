/**
 * CareerOS Career Taxonomy & Relationship System - Graph Engine
 *
 * Phase C.2: Career Taxonomy & Relationship Engine
 *
 * Manages the career graph structure and graph operations.
 *
 * @module career-graph-engine
 * @version 1.0.0
 */

import type {
  CareerNode,
  CareerNodeId,
  CareerGraph,
  CareerPath,
  GraphQuery,
  GraphTraversalResult,
  CareerRelationship,
  RelationshipType,
} from './career-taxonomy-types';

/**
 * Manages the career taxonomy graph structure.
 *
 * Provides graph traversal, path discovery, neighbor discovery,
 * and relationship queries across the career network.
 */
export class CareerGraphEngine {
  private graph: CareerGraph;

  constructor() {
    this.graph = {
      nodes: new Map(),
      edges: new Map(),
      metadata: {
        nodeCount: 0,
        edgeCount: 0,
        lastUpdated: new Date(),
        version: '1.0.0',
      },
    };
  }

  /**
   * Add a career node to the graph.
   */
  addNode(node: CareerNode): CareerNode {
    this.graph.nodes.set(node.id, node);
    this.updateMetadata();
    return node;
  }

  /**
   * Add multiple nodes to the graph.
   */
  addNodes(nodes: CareerNode[]): CareerNode[] {
    for (const node of nodes) {
      this.graph.nodes.set(node.id, node);
    }
    this.updateMetadata();
    return nodes;
  }

  /**
   * Get a node by ID.
   */
  getNode(nodeId: CareerNodeId): CareerNode | undefined {
    return this.graph.nodes.get(nodeId);
  }

  /**
   * Remove a node from the graph.
   */
  removeNode(nodeId: CareerNodeId): boolean {
    const existed = this.graph.nodes.has(nodeId);
    this.graph.nodes.delete(nodeId);
    this.graph.edges.delete(nodeId);

    // Remove edges pointing to this node
    for (const [sourceId, edges] of this.graph.edges) {
      const filtered = edges.filter((e) => e.targetCareerId !== nodeId);
      this.graph.edges.set(sourceId, filtered);
    }

    this.updateMetadata();
    return existed;
  }

  /**
   * Add a relationship edge to the graph.
   */
  addEdge(relationship: CareerRelationship): CareerRelationship {
    const edges = this.graph.edges.get(relationship.sourceCareerId) ?? [];
    edges.push(relationship);
    this.graph.edges.set(relationship.sourceCareerId, edges);
    this.updateMetadata();
    return relationship;
  }

  /**
   * Get edges from a node.
   */
  getEdgesFrom(nodeId: CareerNodeId): CareerRelationship[] {
    return this.graph.edges.get(nodeId) ?? [];
  }

  /**
   * Get edges to a node.
   */
  getEdgesTo(nodeId: CareerNodeId): CareerRelationship[] {
    const edges: CareerRelationship[] = [];

    for (const [, nodeEdges] of this.graph.edges) {
      for (const edge of nodeEdges) {
        if (edge.targetCareerId === nodeId) {
          edges.push(edge);
        }
      }
    }

    return edges;
  }

  /**
   * Get all edges for a node (both directions).
   */
  getAllEdgesForNode(nodeId: CareerNodeId): CareerRelationship[] {
    const from = this.getEdgesFrom(nodeId);
    const to = this.getEdgesTo(nodeId);
    return [...from, ...to];
  }

  /**
   * Get neighbors of a node.
   */
  getNeighbors(nodeId: CareerNodeId): CareerNodeId[] {
    const edges = this.getEdgesFrom(nodeId);
    const neighbors = edges.map((e) => e.targetCareerId);

    // Add bidirectional neighbors
    for (const [sourceId, sourceEdges] of this.graph.edges) {
      for (const edge of sourceEdges) {
        if (edge.targetCareerId === nodeId && edge.directionality === 'BIDIRECTIONAL') {
          neighbors.push(sourceId);
        }
      }
    }

    return [...new Set(neighbors)];
  }

  /**
   * Get neighbors filtered by relationship type.
   */
  getNeighborsByType(
    nodeId: CareerNodeId,
    relationshipType: RelationshipType
  ): CareerNodeId[] {
    const edges = this.getEdgesFrom(nodeId).filter(
      (e) => e.relationshipType === relationshipType
    );
    return edges.map((e) => e.targetCareerId);
  }

  /**
   * Find path between two careers.
   */
  findPath(
    startCareerId: CareerNodeId,
    endCareerId: CareerNodeId,
    maxDepth: number = 5
  ): CareerPath | null {
    if (!this.graph.nodes.has(startCareerId) || !this.graph.nodes.has(endCareerId)) {
      return null;
    }

    // BFS for shortest path
    const queue: Array<{ node: CareerNodeId; path: CareerNodeId[]; depth: number }> = [
      { node: startCareerId, path: [startCareerId], depth: 0 },
    ];
    const visited = new Set<CareerNodeId>();

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.node === endCareerId) {
        return this.buildPathResult(current.path);
      }

      if (current.depth >= maxDepth) continue;

      visited.add(current.node);

      const neighbors = this.getNeighbors(current.node);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push({
            node: neighbor,
            path: [...current.path, neighbor],
            depth: current.depth + 1,
          });
        }
      }
    }

    return null;
  }

  /**
   * Find all paths between two careers.
   */
  findAllPaths(
    startCareerId: CareerNodeId,
    endCareerId: CareerNodeId,
    maxDepth: number = 4,
    maxPaths: number = 10
  ): CareerPath[] {
    const paths: CareerPath[] = [];

    const dfs = (
      current: CareerNodeId,
      target: CareerNodeId,
      path: CareerNodeId[],
      depth: number
    ) => {
      if (depth > maxDepth) return;
      if (paths.length >= maxPaths) return;

      if (current === target) {
        paths.push(this.buildPathResult(path));
        return;
      }

      const neighbors = this.getNeighbors(current);
      for (const neighbor of neighbors) {
        if (!path.includes(neighbor)) {
          dfs(target, target, [...path, neighbor], depth + 1);
        }
      }
    };

    dfs(startCareerId, endCareerId, [startCareerId], 0);

    return paths;
  }

  /**
   * Traverse graph from starting node.
   */
  traverse(query: GraphQuery): GraphTraversalResult {
    const { startNodeId, maxDepth = 3, relationshipTypes, minStrength = 0 } = query;

    const discoveredNodes = new Set<CareerNodeId>();
    const discoveredEdges: CareerRelationship[] = [];
    const nodeDepths = new Map<CareerNodeId, number>();
    const paths = new Map<CareerNodeId, CareerPath>();

    const queue: Array<{ node: CareerNodeId; depth: number; path: CareerNodeId[] }> = [
      { node: startNodeId, depth: 0, path: [startNodeId] },
    ];

    discoveredNodes.add(startNodeId);
    nodeDepths.set(startNodeId, 0);
    paths.set(startNodeId, this.buildPathResult([startNodeId]));

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.depth >= maxDepth) continue;

      const edges = this.getEdgesFrom(current.node);

      for (const edge of edges) {
        // Filter by relationship type
        if (relationshipTypes && !relationshipTypes.includes(edge.relationshipType)) {
          continue;
        }

        // Filter by strength
        if (edge.strength < minStrength) {
          continue;
        }

        const target = edge.targetCareerId;

        if (!discoveredNodes.has(target)) {
          discoveredNodes.add(target);
          nodeDepths.set(target, current.depth + 1);
          paths.set(target, this.buildPathResult([...current.path, target]));

          queue.push({
            node: target,
            depth: current.depth + 1,
            path: [...current.path, target],
          });
        }

        discoveredEdges.push(edge);
      }
    }

    return {
      startNode: startNodeId,
      discoveredNodes: Array.from(discoveredNodes),
      discoveredEdges,
      nodeDepths,
      paths,
    };
  }

  /**
   * Find careers within distance.
   */
  findWithinDistance(
    startCareerId: CareerNodeId,
    maxDistance: number,
    minRelationshipStrength: number = 0
  ): Array<{ careerId: CareerNodeId; distance: number; strength: number }> {
    const result: Array<{ careerId: CareerNodeId; distance: number; strength: number }> = [];
    const visited = new Map<CareerNodeId, number>();

    const queue: Array<{ node: CareerNodeId; distance: number; minStrength: number }> = [
      { node: startCareerId, distance: 0, minStrength: 100 },
    ];

    visited.set(startCareerId, 0);

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.distance >= maxDistance) continue;

      const edges = this.getEdgesFrom(current.node);

      for (const edge of edges) {
        if (edge.strength < minRelationshipStrength) continue;

        const target = edge.targetCareerId;
        const newStrength = Math.min(current.minStrength, edge.strength);

        if (!visited.has(target) || visited.get(target)! > current.distance + 1) {
          visited.set(target, current.distance + 1);

          result.push({
            careerId: target,
            distance: current.distance + 1,
            strength: newStrength,
          });

          queue.push({
            node: target,
            distance: current.distance + 1,
            minStrength: newStrength,
          });
        }
      }
    }

    return result.sort((a, b) => a.distance - b.distance || b.strength - a.strength);
  }

  /**
   * Get connected components in graph.
   */
  getConnectedComponents(): CareerNodeId[][] {
    const visited = new Set<CareerNodeId>();
    const components: CareerNodeId[][] = [];

    for (const nodeId of this.graph.nodes.keys()) {
      if (!visited.has(nodeId)) {
        const component = this.dfsCollect(nodeId, visited);
        components.push(component);
      }
    }

    return components;
  }

  /**
   * DFS to collect connected nodes.
   */
  private dfsCollect(start: CareerNodeId, visited: Set<CareerNodeId>): CareerNodeId[] {
    const component: CareerNodeId[] = [];
    const stack: CareerNodeId[] = [start];

    while (stack.length > 0) {
      const node = stack.pop()!;

      if (!visited.has(node)) {
        visited.add(node);
        component.push(node);

        const neighbors = this.getNeighbors(node);
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            stack.push(neighbor);
          }
        }
      }
    }

    return component;
  }

  /**
   * Calculate graph statistics.
   */
  getStatistics(): {
    nodeCount: number;
    edgeCount: number;
    averageDegree: number;
    density: number;
  } {
    const nodeCount = this.graph.nodes.size;
    let edgeCount = 0;

    for (const edges of this.graph.edges.values()) {
      edgeCount += edges.length;
    }

    const averageDegree = nodeCount > 0 ? edgeCount / nodeCount : 0;
    const density =
      nodeCount > 1 ? (2 * edgeCount) / (nodeCount * (nodeCount - 1)) : 0;

    return {
      nodeCount,
      edgeCount,
      averageDegree: Math.round(averageDegree * 100) / 100,
      density: Math.round(density * 100) / 100,
    };
  }

  /**
   * Get nodes by category.
   */
  getNodesByCategory(category: string): CareerNode[] {
    return Array.from(this.graph.nodes.values()).filter(
      (node) => node.category === category
    );
  }

  /**
   * Get nodes by sub-category.
   */
  getNodesBySubCategory(subCategory: string): CareerNode[] {
    return Array.from(this.graph.nodes.values()).filter(
      (node) => node.subCategory === subCategory
    );
  }

  /**
   * Search nodes by title.
   */
  searchNodes(searchTerm: string): CareerNode[] {
    const lowerTerm = searchTerm.toLowerCase();
    return Array.from(this.graph.nodes.values()).filter((node) =>
      node.title.toLowerCase().includes(lowerTerm)
    );
  }

  /**
   * Get all node IDs.
   */
  getAllNodeIds(): CareerNodeId[] {
    return Array.from(this.graph.nodes.keys());
  }

  /**
   * Get all nodes.
   */
  getAllNodes(): CareerNode[] {
    return Array.from(this.graph.nodes.values());
  }

  /**
   * Check if node exists.
   */
  hasNode(nodeId: CareerNodeId): boolean {
    return this.graph.nodes.has(nodeId);
  }

  /**
   * Get graph snapshot.
   */
  getGraph(): CareerGraph {
    return {
      nodes: new Map(this.graph.nodes),
      edges: new Map(this.graph.edges),
      metadata: { ...this.graph.metadata },
    };
  }

  /**
   * Clear the graph.
   */
  clear(): void {
    this.graph.nodes.clear();
    this.graph.edges.clear();
    this.updateMetadata();
  }

  /**
   * Build path result from node sequence.
   */
  private buildPathResult(nodePath: CareerNodeId[]): CareerPath {
    const relationships: CareerRelationship[] = [];

    for (let i = 0; i < nodePath.length - 1; i++) {
      const edges = this.getEdgesFrom(nodePath[i]);
      const edge = edges.find((e) => e.targetCareerId === nodePath[i + 1]);
      if (edge) {
        relationships.push(edge);
      }
    }

    const totalDifficulty = Math.round(
      relationships.reduce((sum, r) => sum + (100 - r.strength), 0) /
        Math.max(1, relationships.length)
    );

    const estimatedTimeMonths = relationships.length * 6;

    const avgStrength =
      relationships.length > 0
        ? relationships.reduce((sum, r) => sum + r.strength, 0) / relationships.length
        : 100;

    return {
      id: nodePath.join('-'),
      startCareerId: nodePath[0],
      endCareerId: nodePath[nodePath.length - 1],
      path: nodePath,
      relationships,
      totalDifficulty,
      estimatedTimeMonths,
      confidence: Math.round(avgStrength),
    };
  }

  /**
   * Update graph metadata.
   */
  private updateMetadata(): void {
    let edgeCount = 0;
    for (const edges of this.graph.edges.values()) {
      edgeCount += edges.length;
    }

    this.graph.metadata = {
      nodeCount: this.graph.nodes.size,
      edgeCount,
      lastUpdated: new Date(),
      version: this.graph.metadata.version,
    };
  }
}

/**
 * Factory function for CareerGraphEngine.
 */
export function createCareerGraphEngine(): CareerGraphEngine {
  return new CareerGraphEngine();
}
