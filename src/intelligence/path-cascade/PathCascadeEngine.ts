/**
 * Path Cascade Engine V2 - Path Dependency Analysis
 *
 * CareerOS Frontier Engine V2 - Path Dependency Cascade
 *
 * Purpose:
 *   Model careers as state-transition graphs rather than flat career scores.
 *   Calculate criticality (how much a decision collapses future options)
 *   and optionality (size of future reachable opportunity space).
 *
 * Architecture Principle:
 *   Career decisions create path dependencies. Choosing JEE → IIT closes some doors
 *   and opens others. The engine makes these dependencies explicit through
 *   criticality and optionality calculations.
 *
 * Key Concepts:
 *   - CareerNode: A state in the career journey (exam, degree, job)
 *   - CareerEdge: A possible transition between states
 *   - CareerPath: A sequence of nodes connected by edges
 *   - Criticality: How much a decision reduces future options
 *   - Optionality: Size of future reachable opportunity space
 *
 * Calculations:
 *   - Criticality = 1 - (options_after / options_before)
 *   - Optionality = diversity × reachability × probability
 *
 * Inputs:
 *   - CareerGraph: The state-transition graph
 *   - StartNodeId: Where to begin analysis
 *
 * Outputs:
 *   - CareerPath[]: All paths from start to terminal nodes
 *   - CriticalityAnalysis: For each decision point
 *   - OptionalityAnalysis: For each position
 *   - Explainability: Human-readable explanations
 *
 * Example Graph:
 *   JEE → IIT → Software Engineer
 *   JEE → NIT → Product Manager
 *   NEET → MBBS → Doctor
 *
 * Future Expansion:
 *   - Integration with RegretEngine for path evaluation
 *   - Integration with RecommendationEngine for ranking
 *   - Real-time probability updates from job market data
 */

import {
  CareerGraph,
  createIndiaCareerGraph,
} from './CareerGraph';

import type {
  CareerNode,
  CareerEdge,
  CareerPath,
  CareerNodeType,
  TransitionType,
  Prerequisite,
  PathMetrics,
  CriticalityAnalysis,
  ClosedOption,
  OptionalityAnalysis,
  ReachableCareer,
} from './CareerGraph';

import { EntityId, ConfidenceScore } from '../types';

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Configuration for the Path Cascade Engine.
 */
export interface PathCascadeConfig {
  /** Maximum path length to explore */
  maxPathLength: number;

  /** Minimum path length to consider valid */
  minPathLength: number;

  /** Whether to include explainability outputs */
  includeExplanations: boolean;

  /** Whether to calculate criticality for each node */
  calculateCriticality: boolean;

  /** Whether to calculate optionality for each node */
  calculateOptionality: boolean;

  /** Debug mode */
  debugMode: boolean;
}

/**
 * Default configuration.
 */
const DEFAULT_PATH_CONFIG: PathCascadeConfig = {
  maxPathLength: 5,
  minPathLength: 2,
  includeExplanations: true,
  calculateCriticality: true,
  calculateOptionality: true,
  debugMode: false,
};

// ============================================================================
// RESULT TYPES
// ============================================================================

/**
 * Result of path cascade analysis.
 */
export interface PathCascadeResult {
  /** Success status */
  success: boolean;

  /** Error message if failed */
  error?: string;

  /** All paths found from start node */
  paths: CareerPath[];

  /** Criticality analysis for each node */
  criticalityAnalysis: Map<EntityId, CriticalityAnalysis>;

  /** Optionality analysis for each node */
  optionalityAnalysis: Map<EntityId, OptionalityAnalysis>;

  /** Explainability outputs */
  explanations: PathExplanations;

  /** Statistics */
  statistics: PathCascadeStatistics;
}

/**
 * Explainability outputs for paths.
 */
export interface PathExplanations {
  /** Explanation for each path's criticality */
  pathCriticality: Map<EntityId, string>;

  /** Explanation for each path's optionality */
  pathOptionality: Map<EntityId, string>;

  /** Comparison between paths */
  pathComparisons: PathComparison[];

  /** Overall summary */
  summary: string;
}

/**
 * Comparison between two paths.
 */
export interface PathComparison {
  /** First path */
  path1Id: EntityId;
  path1Name: string;

  /** Second path */
  path2Id: EntityId;
  path2Name: string;

  /** Key differences */
  differences: string[];

  /** Which has higher criticality */
  higherCriticality: EntityId;

  /** Which has higher optionality */
  higherOptionality: EntityId;
}

/**
 * Statistics for path cascade.
 */
export interface PathCascadeStatistics {
  /** Number of paths found */
  pathsFound: number;

  /** Number of nodes explored */
  nodesExplored: number;

  /** Number of edges traversed */
  edgesTraversed: number;

  /** Time taken (ms) */
  timeTaken: number;

  /** Average path length */
  averagePathLength: number;

  /** Average criticality score */
  averageCriticality: number;

  /** Average optionality score */
  averageOptionality: number;
}

// ============================================================================
// PATH CASCADE ENGINE
// ============================================================================

/**
 * Path Cascade Engine V2
 *
 * Analyzes career paths through state-transition graphs,
 * calculating criticality and optionality for each decision point.
 *
 * Usage:
 *   const engine = createPathCascadeEngine();
 *   const result = engine.analyzePaths('exam_jee');
 *   if (result.success) {
 *     console.log(result.explanations.summary);
 *   }
 */
class PathCascadeEngine {
  private graph: CareerGraph;
  private config: PathCascadeConfig;
  private debugLog: string[] = [];

  constructor(graph: CareerGraph, config: Partial<PathCascadeConfig> = {}) {
    this.graph = graph;
    this.config = { ...DEFAULT_PATH_CONFIG, ...config };
  }

  /**
   * Analyze all paths from a starting node.
   *
   * This is the PRIMARY METHOD of the engine.
   *
   * @param startNodeId - Node to start analysis from
   * @returns PathCascadeResult with paths, criticality, and optionality
   */
  analyzePaths(startNodeId: EntityId): PathCascadeResult {
    const startTime = Date.now();
    this.debug('Starting path analysis', { startNodeId });

    // Validate start node
    const startNode = this.graph.getNode(startNodeId);
    if (!startNode) {
      return {
        success: false,
        error: `Start node not found: ${startNodeId}`,
        paths: [],
        criticalityAnalysis: new Map(),
        optionalityAnalysis: new Map(),
        explanations: {
          pathCriticality: new Map(),
          pathOptionality: new Map(),
          pathComparisons: [],
          summary: '',
        },
        statistics: {
          pathsFound: 0,
          nodesExplored: 0,
          edgesTraversed: 0,
          timeTaken: 0,
          averagePathLength: 0,
          averageCriticality: 0,
          averageOptionality: 0,
        },
      };
    }

    try {
      // Find all paths from start node
      const paths = this.graph.findAllPaths(startNodeId, this.config.maxPathLength);
      this.debug('Paths found', { count: paths.length });

      // Filter paths by minimum length
      const validPaths = paths.filter(p => p.nodes.length >= this.config.minPathLength);

      // Calculate criticality for each node
      const criticalityAnalysis = new Map<EntityId, CriticalityAnalysis>();
      if (this.config.calculateCriticality) {
        const uniqueNodes = this.getUniqueNodes(validPaths);
        for (const nodeId of uniqueNodes) {
          try {
            const analysis = this.graph.calculateCriticality(nodeId);
            criticalityAnalysis.set(nodeId, analysis);
          } catch (e) {
            this.debug('Criticality calculation failed', { nodeId, error: String(e) });
          }
        }
      }

      // Calculate optionality for each node
      const optionalityAnalysis = new Map<EntityId, OptionalityAnalysis>();
      if (this.config.calculateOptionality) {
        const uniqueNodes = this.getUniqueNodes(validPaths);
        for (const nodeId of uniqueNodes) {
          try {
            const analysis = this.graph.calculateOptionality(nodeId);
            optionalityAnalysis.set(nodeId, analysis);
          } catch (e) {
            this.debug('Optionality calculation failed', { nodeId, error: String(e) });
          }
        }
      }

      // Generate explanations
      const explanations = this.config.includeExplanations
        ? this.generateExplanations(validPaths, criticalityAnalysis, optionalityAnalysis)
        : {
            pathCriticality: new Map(),
            pathOptionality: new Map(),
            pathComparisons: [],
            summary: '',
          };

      // Calculate statistics
      const timeTaken = Date.now() - startTime;
      const statistics = this.calculateStatistics(
        validPaths,
        criticalityAnalysis,
        optionalityAnalysis,
        timeTaken
      );

      this.debug('Analysis complete', { timeTaken, paths: validPaths.length });

      return {
        success: true,
        paths: validPaths,
        criticalityAnalysis,
        optionalityAnalysis,
        explanations,
        statistics,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        paths: [],
        criticalityAnalysis: new Map(),
        optionalityAnalysis: new Map(),
        explanations: {
          pathCriticality: new Map(),
          pathOptionality: new Map(),
          pathComparisons: [],
          summary: '',
        },
        statistics: {
          pathsFound: 0,
          nodesExplored: 0,
          edgesTraversed: 0,
          timeTaken: Date.now() - startTime,
          averagePathLength: 0,
          averageCriticality: 0,
          averageOptionality: 0,
        },
      };
    }
  }

  /**
   * Get criticality explanation for a specific node.
   *
   * Example output:
   * "JEE has HIGH criticality because it closes access to medical careers
   *  and is nearly irreversible. Once you commit to JEE, switching to NEET
   *  requires starting over with 1+ years of preparation."
   *
   * @param nodeId - Node to explain
   * @returns Human-readable explanation
   */
  explainCriticality(nodeId: EntityId): string {
    const node = this.graph.getNode(nodeId);
    if (!node) {
      return `Node ${nodeId} not found.`;
    }

    try {
      const analysis = this.graph.calculateCriticality(nodeId);
      return analysis.explanation;
    } catch {
      return `Unable to calculate criticality for ${node.name}.`;
    }
  }

  /**
   * Get optionality explanation for a specific node.
   *
   * Example output:
   * "B.Tech from IIT offers HIGH optionality with 15 reachable careers
   *  across 4 different fields including Software Engineering, Product Management,
   *  Data Science, and Entrepreneurship."
   *
   * @param nodeId - Node to explain
   * @returns Human-readable explanation
   */
  explainOptionality(nodeId: EntityId): string {
    const node = this.graph.getNode(nodeId);
    if (!node) {
      return `Node ${nodeId} not found.`;
    }

    try {
      const analysis = this.graph.calculateOptionality(nodeId);
      return analysis.explanation;
    } catch {
      return `Unable to calculate optionality for ${node.name}.`;
    }
  }

  /**
   * Compare two paths and explain differences.
   *
   * @param path1Id - First path ID
   * @param path2Id - Second path ID
   * @returns Comparison explanation
   */
  comparePaths(path1Id: EntityId, path2Id: EntityId, paths: CareerPath[]): string {
    const path1 = paths.find(p => p.id === path1Id);
    const path2 = paths.find(p => p.id === path2Id);

    if (!path1 || !path2) {
      return 'One or both paths not found.';
    }

    const differences: string[] = [];

    // Compare criticality
    if (path1.metrics.criticality > path2.metrics.criticality + 0.1) {
      differences.push(`${path1.name} has higher criticality, meaning it closes more future options.`);
    } else if (path2.metrics.criticality > path1.metrics.criticality + 0.1) {
      differences.push(`${path2.name} has higher criticality, meaning it closes more future options.`);
    }

    // Compare optionality
    if (path1.metrics.optionality > path2.metrics.optionality + 0.1) {
      differences.push(`${path1.name} offers more future flexibility with higher optionality.`);
    } else if (path2.metrics.optionality > path1.metrics.optionality + 0.1) {
      differences.push(`${path2.name} offers more future flexibility with higher optionality.`);
    }

    // Compare time
    if (path1.totalTime < path2.totalTime) {
      differences.push(`${path1.name} is faster by ${path2.totalTime - path1.totalTime} years.`);
    } else if (path2.totalTime < path1.totalTime) {
      differences.push(`${path2.name} is faster by ${path1.totalTime - path2.totalTime} years.`);
    }

    // Compare cost
    const costDiff = Math.abs(path1.totalCost - path2.totalCost);
    if (costDiff > 100000) {
      const cheaper = path1.totalCost < path2.totalCost ? path1.name : path2.name;
      differences.push(`${cheaper} is cheaper by ₹${(costDiff / 100000).toFixed(1)} lakhs.`);
    }

    // Compare probability
    if (path1.metrics.pathProbability > path2.metrics.pathProbability + 0.1) {
      differences.push(`${path1.name} has higher success probability.`);
    } else if (path2.metrics.pathProbability > path1.metrics.pathProbability + 0.1) {
      differences.push(`${path2.name} has higher success probability.`);
    }

    if (differences.length === 0) {
      return `Both paths are relatively similar in terms of criticality, optionality, time, and cost.`;
    }

    return differences.join(' ');
  }

  /**
   * Get the debug log.
   */
  getDebugLog(): string[] {
    return [...this.debugLog];
  }

  // ========================================================================
  // PRIVATE METHODS
  // ========================================================================

  /**
   * Get all unique nodes from a set of paths.
   */
  private getUniqueNodes(paths: CareerPath[]): EntityId[] {
    const unique = new Set<EntityId>();
    for (const path of paths) {
      for (const node of path.nodes) {
        unique.add(node.id);
      }
    }
    return Array.from(unique);
  }

  /**
   * Generate explanations for paths.
   */
  private generateExplanations(
    paths: CareerPath[],
    criticalityAnalysis: Map<EntityId, CriticalityAnalysis>,
    optionalityAnalysis: Map<EntityId, OptionalityAnalysis>
  ): PathExplanations {
    const pathCriticality = new Map<EntityId, string>();
    const pathOptionality = new Map<EntityId, string>();
    const pathComparisons: PathComparison[] = [];

    // Generate criticality explanations
    for (const [nodeId, analysis] of criticalityAnalysis) {
      pathCriticality.set(nodeId, analysis.explanation);
    }

    // Generate optionality explanations
    for (const [nodeId, analysis] of optionalityAnalysis) {
      pathOptionality.set(nodeId, analysis.explanation);
    }

    // Generate path comparisons
    for (let i = 0; i < paths.length; i++) {
      for (let j = i + 1; j < paths.length; j++) {
        const path1 = paths[i];
        const path2 = paths[j];

        const differences: string[] = [];

        if (path1.metrics.criticality > path2.metrics.criticality) {
          differences.push(`${path1.name} has higher criticality`);
        } else {
          differences.push(`${path2.name} has higher criticality`);
        }

        if (path1.metrics.optionality > path2.metrics.optionality) {
          differences.push(`${path1.name} has higher optionality`);
        } else {
          differences.push(`${path2.name} has higher optionality`);
        }

        pathComparisons.push({
          path1Id: path1.id,
          path1Name: path1.name,
          path2Id: path2.id,
          path2Name: path2.name,
          differences,
          higherCriticality: path1.metrics.criticality > path2.metrics.criticality ? path1.id : path2.id,
          higherOptionality: path1.metrics.optionality > path2.metrics.optionality ? path1.id : path2.id,
        });
      }
    }

    // Generate summary
    const summary = this.generateSummary(paths, criticalityAnalysis, optionalityAnalysis);

    return {
      pathCriticality,
      pathOptionality,
      pathComparisons,
      summary,
    };
  }

  /**
   * Generate overall summary.
   */
  private generateSummary(
    paths: CareerPath[],
    criticalityAnalysis: Map<EntityId, CriticalityAnalysis>,
    optionalityAnalysis: Map<EntityId, OptionalityAnalysis>
  ): string {
    if (paths.length === 0) {
      return 'No valid paths found from the starting position.';
    }

    const avgCriticality = paths.reduce((sum, p) => sum + p.metrics.criticality, 0) / paths.length;
    const avgOptionality = paths.reduce((sum, p) => sum + p.metrics.optionality, 0) / paths.length;

    let summary = `Found ${paths.length} career paths. `;

    if (avgCriticality > 0.6) {
      summary += 'These are HIGH criticality paths that significantly limit future options. ';
    } else if (avgCriticality > 0.3) {
      summary += 'These are MODERATE criticality paths with some flexibility. ';
    } else {
      summary += 'These are LOW criticality paths that keep many options open. ';
    }

    if (avgOptionality > 0.6) {
      summary += 'The paths offer GOOD optionality with diverse future opportunities.';
    } else if (avgOptionality > 0.3) {
      summary += 'The paths offer MODERATE optionality.';
    } else {
      summary += 'The paths are SPECIALIZED with limited future pivots.';
    }

    return summary;
  }

  /**
   * Calculate statistics.
   */
  private calculateStatistics(
    paths: CareerPath[],
    criticalityAnalysis: Map<EntityId, CriticalityAnalysis>,
    optionalityAnalysis: Map<EntityId, OptionalityAnalysis>,
    timeTaken: number
  ): PathCascadeStatistics {
    const pathsFound = paths.length;

    // Count unique nodes and edges
    const uniqueNodes = new Set<EntityId>();
    let edgesTraversed = 0;

    for (const path of paths) {
      for (const node of path.nodes) {
        uniqueNodes.add(node.id);
      }
      edgesTraversed += path.edges.length;
    }

    // Average path length
    const averagePathLength = paths.length > 0
      ? paths.reduce((sum, p) => sum + p.nodes.length, 0) / paths.length
      : 0;

    // Average criticality
    let avgCriticality = 0;
    if (criticalityAnalysis.size > 0) {
      const scores = Array.from(criticalityAnalysis.values()).map(a => a.score);
      avgCriticality = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    }

    // Average optionality
    let avgOptionality = 0;
    if (optionalityAnalysis.size > 0) {
      const scores = Array.from(optionalityAnalysis.values()).map(a => a.score);
      avgOptionality = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    }

    return {
      pathsFound,
      nodesExplored: uniqueNodes.size,
      edgesTraversed,
      timeTaken,
      averagePathLength,
      averageCriticality: avgCriticality,
      averageOptionality: avgOptionality,
    };
  }

  /**
   * Log debug message.
   */
  private debug(message: string, data?: Record<string, unknown>): void {
    if (this.config.debugMode) {
      this.debugLog.push(JSON.stringify({ message, data, timestamp: Date.now() }));
    }
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a new Path Cascade Engine.
 *
 * @param graph - Career graph to analyze
 * @param config - Optional configuration
 * @returns Configured PathCascadeEngine
 *
 * @example
 * ```typescript
 * const graph = createIndiaCareerGraph();
 * const engine = createPathCascadeEngine(graph);
 * const result = engine.analyzePaths('exam_jee');
 * ```
 */
function createPathCascadeEngine(
  graph: CareerGraph,
  config?: Partial<PathCascadeConfig>
): PathCascadeEngine {
  return new PathCascadeEngine(graph, config);
}

/**
 * Convenience function to analyze paths with the default India career graph.
 *
 * @param startNodeId - Starting node (e.g., 'exam_jee', 'exam_neet')
 * @param config - Optional configuration
 * @returns Analysis result
 *
 * @example
 * ```typescript
 * const result = analyzeCareerPaths('exam_jee');
 * if (result.success) {
 *   console.log(result.explanations.summary);
 * }
 * ```
 */
function analyzeCareerPaths(
  startNodeId: EntityId,
  config?: Partial<PathCascadeConfig>
): PathCascadeResult {
  const graph = createIndiaCareerGraph();
  const engine = createPathCascadeEngine(graph, config);
  return engine.analyzePaths(startNodeId);
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  // Engine
  PathCascadeEngine,
  createPathCascadeEngine,
  analyzeCareerPaths,

  // Career Graph
  CareerGraph,
  createIndiaCareerGraph,

  // Config
  DEFAULT_PATH_CONFIG,
};

// Re-export types from CareerGraph for convenience
// Note: CareerNode, CareerEdge, CareerPath are NOT re-exported here
// to avoid conflicts with types/index.ts. Import directly from CareerGraph if needed.
export type {
  CareerNodeType,
  TransitionType,
  Prerequisite,
  PathMetrics,
  CriticalityAnalysis,
  ClosedOption,
  OptionalityAnalysis,
  ReachableCareer,
} from './CareerGraph';
