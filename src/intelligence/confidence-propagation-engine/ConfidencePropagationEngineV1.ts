/**
 * CareerOS Confidence Propagation Engine V1
 *
 * Propagates uncertainty through the entire CareerOS intelligence stack.
 * Every engine outputs score + confidence with full traceability.
 *
 * Features:
 * - Confidence aggregation across multiple sources
 * - Confidence propagation through dependency chains
 * - Explainable confidence reasoning
 * - Compatible with all CareerOS intelligence engines
 *
 * @module intelligence/confidence-propagation-engine
 * @version 1.0.0
 */

import type { UncertaintyProfile, ConfidenceLevel } from '../uncertainty-engine/UncertaintyEngineV1.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Engine identifier
 */
export type EngineId =
  | 'student-model'
  | 'career-ontology'
  | 'skill-taxonomy'
  | 'matching'
  | 'optionality'
  | 'criticality'
  | 'path-explorer'
  | 'coalition'
  | 'regret'
  | 'future-scenario'
  | 'counterfactual'
  | 'future-explorer'
  | 'maut-foundation'
  | 'utility-discovery'
  | 'decision-optimization'
  | 'pareto-frontier'
  | 'career-expansion'
  | 'skill-transition';

/**
 * Confidence source from an engine
 */
export interface ConfidenceSource {
  /** Engine that produced this confidence */
  engine: EngineId;

  /** Component within engine */
  component?: string;

  /** Score output (0-100) */
  score: number;

  /** Confidence in this score (0-100) */
  confidence: number;

  /** Weight in aggregation */
  weight: number;

  /** Timestamp */
  timestamp: number;

  /** Dependencies for this source */
  dependencies?: string[];

  /** Raw data quality metrics */
  dataQuality?: {
    completeness: number;
    reliability: number;
    freshness: number;
  };
}

/**
 * Confidence propagation node in dependency graph
 */
export interface ConfidenceNode {
  /** Node identifier */
  id: string;

  /** Engine */
  engine: EngineId;

  /** Score */
  score: number;

  /** Base confidence (before propagation) */
  baseConfidence: number;

  /** Propagated confidence (after dependency adjustment) */
  propagatedConfidence: number;

  /** Parent nodes this depends on */
  parents: string[];

  /** Child nodes that depend on this */
  children: string[];

  /** Confidence decay from parents */
  decayFactor: number;
}

/**
 * Aggregated confidence result
 */
export interface AggregatedConfidence {
  /** Final aggregated score */
  score: number;

  /** Final aggregated confidence */
  confidence: number;

  /** Confidence level */
  level: ConfidenceLevel;

  /** All sources contributing */
  sources: ConfidenceSource[];

  /** Weighted average confidence */
  weightedConfidence: number;

  /** Minimum confidence (worst case) */
  minConfidence: number;

  /** Maximum confidence (best case) */
  maxConfidence: number;

  /** Confidence variance across sources */
  variance: number;

  /** Agreement level between sources */
  agreement: 'high' | 'moderate' | 'low';
}

/**
 * Final decision confidence
 */
export interface FinalDecisionConfidence {
  /** Decision identifier */
  decisionId: string;

  /** Student identifier */
  studentId: string;

  /** Final recommended path */
  pathId: string;

  /** Final score */
  score: number;

  /** Final confidence */
  confidence: number;

  /** Confidence level */
  level: ConfidenceLevel;

  /** Confidence bounds */
  bounds: {
    lower: number;
    expected: number;
    upper: number;
  };

  /** Component confidences */
  components: Record<EngineId, ComponentConfidenceResult>;

  /** Propagation chain */
  propagationChain: ConfidenceNode[];

  /** Explanation */
  explanation: {
    summary: string;
    factors: string[];
    limitingFactors: string[];
    improvementActions: string[];
  };

  /** Timestamp */
  timestamp: number;
}

/**
 * Component confidence result
 */
export interface ComponentConfidenceResult {
  /** Engine ID */
  engine: EngineId;

  /** Score from this component */
  score: number;

  /** Confidence from this component */
  confidence: number;

  /** Weight in final decision */
  weight: number;

  /** Contribution to final confidence */
  contribution: number;

  /** Whether this is a limiting factor */
  isLimiting: boolean;
}

/**
 * Confidence propagation configuration
 */
export interface ConfidencePropagationConfig {
  /** Confidence decay per dependency hop */
  decayPerHop: number;

  /** Minimum confidence threshold */
  minConfidence: number;

  /** Method for aggregation */
  aggregationMethod: 'weighted' | 'geometric' | 'harmonic' | 'minimum';

  /** Whether to propagate uncertainty */
  enablePropagation: boolean;

  /** Maximum propagation depth */
  maxDepth: number;

  /** Confidence floor (minimum possible) */
  confidenceFloor: number;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_CONFIDENCE_PROPAGATION_CONFIG: ConfidencePropagationConfig = {
  decayPerHop: 0.95, // 5% decay per hop
  minConfidence: 50,
  aggregationMethod: 'weighted',
  enablePropagation: true,
  maxDepth: 10,
  confidenceFloor: 10,
};

// ============================================================================
// CONFIDENCE AGGREGATION
// ============================================================================

/**
 * Aggregate confidence from multiple sources
 */
export function aggregateConfidence(
  sources: ConfidenceSource[],
  config: ConfidencePropagationConfig = DEFAULT_CONFIDENCE_PROPAGATION_CONFIG
): AggregatedConfidence {
  if (sources.length === 0) {
    return {
      score: 0,
      confidence: 0,
      level: 'LOW',
      sources: [],
      weightedConfidence: 0,
      minConfidence: 0,
      maxConfidence: 0,
      variance: 0,
      agreement: 'low',
    };
  }

  // Normalize weights
  const totalWeight = sources.reduce((sum, s) => sum + s.weight, 0);
  const normalizedSources = sources.map(s => ({
    ...s,
    weight: totalWeight > 0 ? s.weight / totalWeight : 1 / sources.length,
  }));

  // Calculate weighted score
  const score = normalizedSources.reduce(
    (sum, s) => sum + s.score * s.weight,
    0
  );

  // Calculate confidence based on method
  let confidence: number;
  let weightedConfidence: number;

  switch (config.aggregationMethod) {
    case 'geometric':
      // Geometric mean of confidences
      const logSum = normalizedSources.reduce(
        (sum, s) => sum + Math.log(Math.max(1, s.confidence)) * s.weight,
        0
      );
      confidence = Math.exp(logSum);
      break;

    case 'harmonic':
      // Harmonic mean (penalizes low confidences more)
      const harmonicSum = normalizedSources.reduce(
        (sum, s) => sum + s.weight / Math.max(1, s.confidence),
        0
      );
      confidence = harmonicSum > 0 ? 1 / harmonicSum : 0;
      break;

    case 'minimum':
      // Minimum confidence (most conservative)
      confidence = Math.min(...normalizedSources.map(s => s.confidence));
      break;

    default: // weighted
      // Weighted average
      confidence = normalizedSources.reduce(
        (sum, s) => sum + s.confidence * s.weight,
        0
      );
  }

  // Apply confidence floor
  confidence = Math.max(config.confidenceFloor, confidence);

  // Calculate weighted confidence
  weightedConfidence = normalizedSources.reduce(
    (sum, s) => sum + s.confidence * s.weight,
    0
  );

  // Calculate min/max
  const confidences = normalizedSources.map(s => s.confidence);
  const minConfidence = Math.min(...confidences);
  const maxConfidence = Math.max(...confidences);

  // Calculate variance
  const avgConfidence = confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
  const variance = confidences.reduce(
    (sum, c) => sum + Math.pow(c - avgConfidence, 2),
    0
  ) / confidences.length;

  // Determine agreement level
  const range = maxConfidence - minConfidence;
  let agreement: AggregatedConfidence['agreement'];
  if (range < 15) agreement = 'high';
  else if (range < 30) agreement = 'moderate';
  else agreement = 'low';

  // Determine confidence level
  let level: ConfidenceLevel;
  if (confidence >= 85) level = 'VERY_HIGH';
  else if (confidence >= 70) level = 'HIGH';
  else if (confidence >= 50) level = 'MEDIUM';
  else level = 'LOW';

  return {
    score: Math.round(score),
    confidence: Math.round(confidence),
    level,
    sources: normalizedSources,
    weightedConfidence: Math.round(weightedConfidence),
    minConfidence: Math.round(minConfidence),
    maxConfidence: Math.round(maxConfidence),
    variance: Math.round(variance),
    agreement,
  };
}

// ============================================================================
// CONFIDENCE PROPAGATION
// ============================================================================

/**
 * Propagate confidence through dependency chain
 */
export function propagateConfidence(
  nodes: ConfidenceNode[],
  config: ConfidencePropagationConfig = DEFAULT_CONFIDENCE_PROPAGATION_CONFIG
): ConfidenceNode[] {
  if (!config.enablePropagation || nodes.length === 0) {
    return nodes;
  }

  // Build node map
  const nodeMap = new Map<string, ConfidenceNode>();
  for (const node of nodes) {
    nodeMap.set(node.id, { ...node });
  }

  // Topological sort (simplified - assume nodes are roughly in order)
  const sorted = [...nodes];

  // Propagate confidence forward
  for (const node of sorted) {
    const currentNode = nodeMap.get(node.id)!;

    if (currentNode.parents.length === 0) {
      // Root node - use base confidence
      currentNode.propagatedConfidence = currentNode.baseConfidence;
    } else {
      // Calculate confidence from parents
      let parentConfidence = 100;

      for (const parentId of currentNode.parents) {
        const parent = nodeMap.get(parentId);
        if (parent) {
          // Apply decay
          const decayedConfidence = parent.propagatedConfidence * config.decayPerHop;
          parentConfidence = Math.min(parentConfidence, decayedConfidence);
        }
      }

      // Combined confidence is minimum of base and parent confidence
      currentNode.propagatedConfidence = Math.min(
        currentNode.baseConfidence,
        parentConfidence
      );

      // Calculate decay factor
      currentNode.decayFactor = currentNode.propagatedConfidence / currentNode.baseConfidence;
    }
  }

  return Array.from(nodeMap.values());
}

/**
 * Build confidence propagation graph from sources
 */
export function buildPropagationGraph(
  sources: ConfidenceSource[],
  config: ConfidencePropagationConfig = DEFAULT_CONFIDENCE_PROPAGATION_CONFIG
): ConfidenceNode[] {
  const nodes: ConfidenceNode[] = sources.map((source, index) => ({
    id: `${source.engine}-${index}`,
    engine: source.engine,
    score: source.score,
    baseConfidence: source.confidence,
    propagatedConfidence: source.confidence,
    parents: source.dependencies || [],
    children: [],
    decayFactor: 1.0,
  }));

  // Build child relationships
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  for (const node of nodes) {
    for (const parentId of node.parents) {
      const parent = nodeMap.get(parentId);
      if (parent) {
        parent.children.push(node.id);
      }
    }
  }

  // Propagate confidence
  return propagateConfidence(nodes, config);
}

// ============================================================================
// CONFIDENCE EXPLANATION
// ============================================================================

/**
 * Generate explanation for aggregated confidence
 */
export function explainConfidence(
  aggregated: AggregatedConfidence,
  propagationChain?: ConfidenceNode[]
): {
  summary: string;
  factors: string[];
  limitingFactors: string[];
  improvementActions: string[];
} {
  const factors: string[] = [];
  const limitingFactors: string[] = [];
  const improvementActions: string[] = [];

  // Overall confidence explanation
  factors.push(`Overall confidence is ${aggregated.confidence}% (${aggregated.level.toLowerCase().replace('_', ' ')})`);

  // Source count
  factors.push(`Based on ${aggregated.sources.length} confidence sources`);

  // Agreement level
  if (aggregated.agreement === 'high') {
    factors.push('High agreement between sources increases reliability');
  } else if (aggregated.agreement === 'low') {
    limitingFactors.push('Low agreement between sources indicates conflicting data');
    improvementActions.push('Investigate discrepancies between confidence sources');
  }

  // Variance
  if (aggregated.variance > 200) {
    limitingFactors.push(`High variance (${Math.round(aggregated.variance)}) in source confidences`);
  }

  // Individual source analysis
  const sortedSources = [...aggregated.sources].sort((a, b) => a.confidence - b.confidence);
  const lowestSource = sortedSources[0];

  if (lowestSource && lowestSource.confidence < 50) {
    limitingFactors.push(`Lowest confidence from ${lowestSource.engine} (${lowestSource.confidence}%)`);
    improvementActions.push(`Improve data quality for ${lowestSource.engine}`);
  }

  // Propagation chain analysis
  if (propagationChain && propagationChain.length > 0) {
    const highDecayNodes = propagationChain.filter(n => n.decayFactor < 0.8);
    if (highDecayNodes.length > 0) {
      limitingFactors.push(`${highDecayNodes.length} nodes experienced significant confidence decay`);
      improvementActions.push('Reduce dependency chain length or improve intermediate node confidence');
    }
  }

  // Generate summary
  let summary: string;
  if (aggregated.confidence >= 80) {
    summary = `High confidence (${aggregated.confidence}%) in this result based on strong agreement across ${aggregated.sources.length} sources.`;
  } else if (aggregated.confidence >= 60) {
    summary = `Moderate confidence (${aggregated.confidence}%) with some uncertainty due to ${limitingFactors.length > 0 ? 'data limitations' : 'inherent prediction uncertainty'}.`;
  } else {
    summary = `Low confidence (${aggregated.confidence}%) - results should be treated as preliminary and require additional validation.`;
  }

  return {
    summary,
    factors,
    limitingFactors,
    improvementActions,
  };
}

// ============================================================================
// FINAL DECISION CONFIDENCE
// ============================================================================

/**
 * Calculate final decision confidence from all engine outputs
 */
export function calculateFinalDecisionConfidence(
  decisionId: string,
  studentId: string,
  pathId: string,
  componentResults: Record<EngineId, { score: number; confidence: number; weight: number }>,
  config: ConfidencePropagationConfig = DEFAULT_CONFIDENCE_PROPAGATION_CONFIG
): FinalDecisionConfidence {
  // Convert to confidence sources
  const sources: ConfidenceSource[] = Object.entries(componentResults).map(
    ([engine, result]) => ({
      engine: engine as EngineId,
      score: result.score,
      confidence: result.confidence,
      weight: result.weight,
      timestamp: Date.now(),
    })
  );

  // Aggregate confidence
  const aggregated = aggregateConfidence(sources, config);

  // Build propagation chain
  const propagationChain = buildPropagationGraph(sources, config);

  // Generate explanation
  const explanation = explainConfidence(aggregated, propagationChain);

  // Build component results
  const components: Record<EngineId, ComponentConfidenceResult> = {} as Record<EngineId, ComponentConfidenceResult>;
  for (const [engine, result] of Object.entries(componentResults)) {
    const engineId = engine as EngineId;
    const isLimiting = result.confidence < aggregated.confidence * 0.8;
    components[engineId] = {
      engine: engineId,
      score: result.score,
      confidence: result.confidence,
      weight: result.weight,
      contribution: result.confidence * result.weight,
      isLimiting,
    };
  }

  // Calculate bounds
  const bounds = {
    lower: Math.round(aggregated.score * (aggregated.confidence / 100) * 0.8),
    expected: Math.round(aggregated.score),
    upper: Math.round(Math.min(100, aggregated.score * (1 + (100 - aggregated.confidence) / 200))),
  };

  return {
    decisionId,
    studentId,
    pathId,
    score: Math.round(aggregated.score),
    confidence: Math.round(aggregated.confidence),
    level: aggregated.level,
    bounds,
    components,
    propagationChain,
    explanation,
    timestamp: Date.now(),
  };
}

// ============================================================================
// ENGINE-SPECIFIC CONFIDENCE EXTRACTORS
// ============================================================================

/**
 * Extract confidence from Matching Engine output
 */
export function extractMatchingConfidence(
  matchScore: number,
  dataQuality: number,
  studentCompleteness: number,
  careerCompleteness: number
): { score: number; confidence: number } {
  const confidence = Math.round(
    dataQuality * 0.4 +
    studentCompleteness * 0.3 +
    careerCompleteness * 0.3
  );
  return { score: Math.round(matchScore), confidence };
}

/**
 * Extract confidence from Optionality Engine output
 */
export function extractOptionalityConfidence(
  optionalityScore: number,
  graphCoverage: number,
  pathDiversity: number
): { score: number; confidence: number } {
  const confidence = Math.round(
    graphCoverage * 0.6 +
    pathDiversity * 0.4
  );
  return { score: Math.round(optionalityScore), confidence };
}

/**
 * Extract confidence from Criticality Engine output
 */
export function extractCriticalityConfidence(
  criticalityScore: number,
  dataCompleteness: number,
  temporalStability: number
): { score: number; confidence: number } {
  const confidence = Math.round(
    dataCompleteness * 0.5 +
    temporalStability * 0.5
  );
  return { score: Math.round(criticalityScore), confidence };
}

/**
 * Extract confidence from Path Explorer output
 */
export function extractPathExplorerConfidence(
  pathQuality: number,
  nodeCoverage: number,
  edgeQuality: number,
  validationScore: number
): { score: number; confidence: number } {
  const confidence = Math.round(
    nodeCoverage * 0.3 +
    edgeQuality * 0.3 +
    validationScore * 0.4
  );
  return { score: Math.round(pathQuality), confidence };
}

/**
 * Extract confidence from Coalition Engine output
 */
export function extractCoalitionConfidence(
  coalitionScore: number,
  stakeholderCount: number,
  dataFreshness: number
): { score: number; confidence: number } {
  const stakeholderFactor = Math.min(100, stakeholderCount * 20); // 5 stakeholders = 100%
  const confidence = Math.round(
    stakeholderFactor * 0.5 +
    dataFreshness * 0.5
  );
  return { score: Math.round(coalitionScore), confidence };
}

/**
 * Extract confidence from Regret Engine output
 */
export function extractRegretConfidence(
  regretScore: number,
  scenarioCoverage: number,
  temporalHorizon: number
): { score: number; confidence: number } {
  const horizonFactor = Math.max(0, 100 - temporalHorizon * 5); // Decay 5% per year
  const confidence = Math.round(
    scenarioCoverage * 0.6 +
    horizonFactor * 0.4
  );
  return { score: Math.round(regretScore), confidence };
}

/**
 * Extract confidence from Decision Optimization output
 */
export function extractDecisionOptimizationConfidence(
  utilityScore: number,
  componentConfidences: number[]
): { score: number; confidence: number } {
  const minConfidence = Math.min(...componentConfidences);
  const avgConfidence = componentConfidences.reduce((sum, c) => sum + c, 0) / componentConfidences.length;
  const confidence = Math.round(minConfidence * 0.6 + avgConfidence * 0.4);
  return { score: Math.round(utilityScore), confidence };
}

/**
 * Extract confidence from Pareto Frontier output
 */
export function extractParetoFrontierConfidence(
  frontierSize: number,
  totalPaths: number,
  analysisDepth: number
): { score: number; confidence: number } {
  const coverage = totalPaths > 0 ? (frontierSize / totalPaths) * 100 : 0;
  const confidence = Math.round(
    Math.min(100, frontierSize * 5) * 0.4 + // More paths = higher confidence
    coverage * 0.3 +
    Math.min(100, analysisDepth * 10) * 0.3
  );
  return { score: Math.round(frontierSize), confidence };
}

// ============================================================================
// CONFIDENCE PROPAGATION ENGINE CLASS
// ============================================================================

export class ConfidencePropagationEngineV1 {
  private config: ConfidencePropagationConfig;

  constructor(config?: Partial<ConfidencePropagationConfig>) {
    this.config = { ...DEFAULT_CONFIDENCE_PROPAGATION_CONFIG, ...config };
  }

  /**
   * Aggregate confidence from sources
   */
  aggregate(sources: ConfidenceSource[]): AggregatedConfidence {
    return aggregateConfidence(sources, this.config);
  }

  /**
   * Propagate confidence through dependency chain
   */
  propagate(nodes: ConfidenceNode[]): ConfidenceNode[] {
    return propagateConfidence(nodes, this.config);
  }

  /**
   * Build propagation graph
   */
  buildGraph(sources: ConfidenceSource[]): ConfidenceNode[] {
    return buildPropagationGraph(sources, this.config);
  }

  /**
   * Explain confidence
   */
  explain(
    aggregated: AggregatedConfidence,
    propagationChain?: ConfidenceNode[]
  ): ReturnType<typeof explainConfidence> {
    return explainConfidence(aggregated, propagationChain);
  }

  /**
   * Calculate final decision confidence
   */
  calculateFinalDecision(
    decisionId: string,
    studentId: string,
    pathId: string,
    componentResults: Record<EngineId, { score: number; confidence: number; weight: number }>
  ): FinalDecisionConfidence {
    return calculateFinalDecisionConfidence(decisionId, studentId, pathId, componentResults, this.config);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ConfidencePropagationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): ConfidencePropagationConfig {
    return { ...this.config };
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createConfidencePropagationEngine(
  config?: Partial<ConfidencePropagationConfig>
): ConfidencePropagationEngineV1 {
  return new ConfidencePropagationEngineV1(config);
}


