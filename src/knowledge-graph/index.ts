/**
 * CareerOS Knowledge Graph Module
 *
 * High-performance graph system for career intelligence.
 *
 * @module knowledge-graph
 * @version 1.0.0
 */

// Core Graph
export {
  KnowledgeGraph,
  DEFAULT_GRAPH_CONFIG,
  createNode,
  createEdge,
} from './KnowledgeGraphCore';

// Graph Explorer
export {
  KnowledgeGraphExplorer,
  createKnowledgeGraphExplorer,
  QueryBuilders,
} from './KnowledgeGraphExplorer';

// Factory function (re-exported from core for convenience)
import { KnowledgeGraph as KG } from './KnowledgeGraphCore';
import type { GraphConfiguration } from './KnowledgeGraphCore';

export function createKnowledgeGraph(config?: Partial<GraphConfiguration>): KG {
  return new KG(config);
}

// Core Types
export type {
  NodeType,
  NodeMetadata,
  BaseNode,
  CareerNode,
  SkillNode,
  DegreeNode,
  ExamNode,
  CertificationNode,
  IndustryNode,
  RoleNode,
  KnowledgeNode,
  EdgeMetadata,
  KnowledgeEdge,
  GraphConfiguration,
  NodeQuery,
  EdgeQuery,
  PathQuery,
  NeighborhoodQuery,
  GraphPath,
  Neighborhood,
  GraphStatistics,
} from './KnowledgeGraphCore';

// Explorer Types
export type {
  ExplorerQueryType,
  ExplorerQuery,
  ParsedQuery,
  ExplorationResult,
  FoundNode,
  ExploredPath,
  PathStep,
  EntityConnection,
  ResultExplanation,
  ExplorerConfiguration,
} from './KnowledgeGraphExplorer';
