/**
 * CareerOS Intelligence Consistency Engine - Types
 *
 * Validates consistency across all intelligence layers.
 */

import type {
  ConfidenceScore,
  EntityId,
  CareerPath,
  CareerRecommendation,
} from '../types';
import type { MatchingResult } from '../matching-engine';
import type { OptionalityAnalysis } from '../optionality-engine';
import type { CriticalityAnalysis } from '../criticality-engine';
import type { DecisionCoalitionAnalysis } from '../decision-coalition-v3';
import type { RegretAnalysis } from '../regret-functional';
import type { MarketIntelligenceReport } from '../market-signal-intelligence';
import type { ScenarioGenerationResult } from '../future-scenario';

// ============================================================================
// CORE PRIMITIVE TYPES
// ============================================================================

/**
 * Unique identifier for consistency analyses.
 */
export type ConsistencyId = string;

/**
 * Severity level for consistency violations.
 */
export type ViolationSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

/**
 * Type of consistency relationship detected.
 */
export type ConsistencyType = 'contradiction' | 'agreement' | 'weak_chain' | 'override' | 'conflict';

/**
 * Source intelligence engine.
 */
export type EngineSource =
  | 'matching'
  | 'utility'
  | 'optionality'
  | 'criticality'
  | 'coalition'
  | 'regret'
  | 'market'
  | 'future_simulation'
  | 'recommendation';

// ============================================================================
// INPUT AGGREGATION
// ============================================================================

/**
 * All intelligence results to validate for consistency.
 */
export interface IntelligenceResults {
  /** Matching engine results */
  matching?: MatchingResult;

  /** Utility analysis results */
  utility?: UtilityResults;

  /** Optionality analysis results */
  optionality?: OptionalityAnalysis | OptionalityAnalysis[];

  /** Criticality analysis results */
  criticality?: CriticalityAnalysis | CriticalityAnalysis[];

  /** Decision coalition analysis results */
  coalition?: DecisionCoalitionAnalysis;

  /** Regret analysis results */
  regret?: RegretAnalysis;

  /** Market signal analysis results */
  market?: MarketIntelligenceReport;

  /** Future simulation results */
  futureSimulation?: ScenarioGenerationResult;

  /** Final recommendations to validate */
  recommendations?: CareerRecommendation[];

  /** Target career/path being analyzed */
  targetPath?: CareerPath;
}

/**
 * Utility analysis placeholder - to be expanded when Utility Engine is built.
 */
export interface UtilityResults {
  id: EntityId;
  totalUtility: number;
  components: UtilityComponent[];
  confidence: ConfidenceScore;
}

/**
 * Individual utility component.
 */
export interface UtilityComponent {
  name: string;
  value: number;
  weight: number;
  confidence: ConfidenceScore;
}

// ============================================================================
// CONSISTENCY VIOLATION
// ============================================================================

/**
 * A detected inconsistency between intelligence outputs.
 */
export interface ConsistencyViolation {
  /** Unique identifier */
  id: string;

  /** Type of violation */
  type: ConsistencyType;

  /** Severity level */
  severity: ViolationSeverity;

  /** Engines involved in this violation */
  involvedEngines: EngineSource[];

  /** Human-readable description */
  description: string;

  /** Detailed explanation of the inconsistency */
  explanation: string;

  /** Specific values that contradict or conflict */
  conflictingValues: ConflictingValue[];

  /** Path or career ID where violation occurs */
  targetId?: string;

  /** Recommended resolution */
  resolution?: ResolutionRecommendation;

  /** Confidence in this violation detection */
  detectionConfidence: ConfidenceScore;
}

/**
 * Conflicting values between engines.
 */
export interface ConflictingValue {
  /** Source engine */
  engine: EngineSource;

  /** Attribute name */
  attribute: string;

  /** Value from this engine */
  value: number | string | boolean;

  /** Confidence in this value */
  confidence: ConfidenceScore;
}

/**
 * Recommendation for resolving a violation.
 */
export interface ResolutionRecommendation {
  /** Suggested action */
  action: string;

  /** Why this resolves the issue */
  reasoning: string;

  /** Priority (1 = highest) */
  priority: number;

  /** Expected impact on consistency score */
  expectedImpact: number;
}

// ============================================================================
// AGREEMENT DETECTION
// ============================================================================

/**
 * Detected agreement between engines.
 */
export interface EngineAgreement {
  /** Unique identifier */
  id: string;

  /** Engines in agreement */
  engines: EngineSource[];

  /** What they agree on */
  subject: string;

  /** Agreed value or conclusion */
  agreedValue: number | string | boolean;

  /** Strength of agreement (0-1) */
  strength: ConfidenceScore;

  /** Individual engine confidences */
  engineConfidences: Record<EngineSource, ConfidenceScore>;

  /** Explanation of the agreement */
  explanation: string;

  /** Path or career ID where agreement occurs */
  targetId?: string;
}

// ============================================================================
// REASONING GRAPH
// ============================================================================

/**
 * Node in the reasoning graph.
 */
export interface ReasoningNode {
  /** Unique identifier */
  id: string;

  /** Source engine */
  engine: EngineSource;

  /** Claim or assertion */
  claim: string;

  /** Confidence in this claim */
  confidence: ConfidenceScore;

  /** Type of node */
  type: 'assertion' | 'inference' | 'evidence' | 'conclusion';

  /** Supporting evidence */
  evidence?: string[];

  /** Value if numeric */
  numericValue?: number;
}

/**
 * Edge connecting reasoning nodes.
 */
export interface ReasoningEdge {
  /** Unique identifier */
  id: string;

  /** Source node */
  from: string;

  /** Target node */
  to: string;

  /** Type of relationship */
  relationship: 'supports' | 'contradicts' | 'implies' | 'depends_on';

  /** Strength of relationship (0-1) */
  strength: ConfidenceScore;

  /** Explanation */
  explanation: string;
}

/**
 * Complete reasoning graph.
 */
export interface ReasoningGraph {
  /** Nodes in the graph */
  nodes: ReasoningNode[];

  /** Edges connecting nodes */
  edges: ReasoningEdge[];

  /** Root conclusions */
  conclusions: string[];

  /** Evidence nodes */
  evidence: string[];
}

// ============================================================================
// WEAK REASONING CHAIN
// ============================================================================

/**
 * Detected weak reasoning chain.
 */
export interface WeakReasoningChain {
  /** Unique identifier */
  id: string;

  /** Start of the chain */
  startNode: string;

  /** End of the chain */
  endNode: string;

  /** Chain of reasoning steps */
  steps: ReasoningStep[];

  /** Overall chain strength (0-1) */
  chainStrength: ConfidenceScore;

  /** Weakest link in the chain */
  weakestLink: {
    stepIndex: number;
    reason: string;
  };

  /** Suggested improvements */
  improvements: string[];
}

/**
 * Individual reasoning step.
 */
export interface ReasoningStep {
  /** Step number */
  step: number;

  /** Premise */
  premise: string;

  /** Conclusion */
  conclusion: string;

  /** Inference rule used */
  inferenceRule: string;

  /** Confidence in this step */
  confidence: ConfidenceScore;
}

// ============================================================================
// OVERRIDE & CONFLICT DETECTION
// ============================================================================

/**
 * Detected override relationship.
 */
export interface OverrideDetection {
  /** Unique identifier */
  id: string;

  /** Engine being overridden */
  overriddenEngine: EngineSource;

  /** Engine doing the overriding */
  overridingEngine: EngineSource;

  /** What is being overridden */
  subject: string;

  /** Original value */
  originalValue: number | string | boolean;

  /** Overridden value */
  overriddenValue: number | string | boolean;

  /** Justification for override */
  justification: string;

  /** Whether override is warranted */
  isWarranted: boolean;
}

/**
 * Detected engine conflict.
 */
export interface EngineConflict {
  /** Unique identifier */
  id: string;

  /** Conflicting engines */
  engines: EngineSource[];

  /** Subject of conflict */
  subject: string;

  /** Conflicting positions */
  positions: Record<EngineSource, number | string | boolean>;

  /** Severity of conflict */
  severity: ViolationSeverity;

  /** Recommended resolution strategy */
  resolutionStrategy: 'prioritize' | 'average' | 'escalate' | 'investigate';

  /** Which engine should be prioritized if applicable */
  prioritizedEngine?: EngineSource;
}

// ============================================================================
// CONSISTENCY REPORT
// ============================================================================

/**
 * Complete consistency validation report.
 */
export interface ConsistencyReport {
  /** Unique identifier */
  id: ConsistencyId;

  /** Timestamp */
  timestamp: number;

  /** Overall consistency score (0-100) */
  consistencyScore: number;

  /** Score interpretation */
  interpretation: ConsistencyInterpretation;

  /** All detected violations */
  violations: ConsistencyViolation[];

  /** All detected agreements */
  agreements: EngineAgreement[];

  /** Weak reasoning chains */
  weakChains: WeakReasoningChain[];

  /** Detected overrides */
  overrides: OverrideDetection[];

  /** Engine conflicts */
  conflicts: EngineConflict[];

  /** Reasoning graph */
  reasoningGraph: ReasoningGraph;

  /** Per-engine reliability scores */
  engineReliability: Record<EngineSource, number>;

  /** Highest-confidence recommendation */
  topRecommendation: TopRecommendation | null;

  /** Summary statistics */
  statistics: ConsistencyStatistics;
}

/**
 * Score interpretation.
 */
export interface ConsistencyInterpretation {
  /** Category */
  category: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';

  /** Human-readable summary */
  summary: string;

  /** Detailed explanation */
  explanation: string;

  /** Actionable recommendations */
  recommendations: string[];
}

/**
 * Highest-confidence recommendation.
 */
export interface TopRecommendation {
  /** Career path ID */
  pathId: string;

  /** Confidence level */
  confidence: ConfidenceScore;

  /** Supporting engines */
  supportingEngines: EngineSource[];

  /** Opposing engines (if any) */
  opposingEngines: EngineSource[];

  /** Primary reasoning */
  reasoning: string;

  /** Cross-engine agreement score */
  crossEngineAgreement: number;
}

/**
 * Consistency statistics.
 */
export interface ConsistencyStatistics {
  /** Total engines analyzed */
  totalEngines: number;

  /** Total violations found */
  totalViolations: number;

  /** Violations by severity */
  violationsBySeverity: Record<ViolationSeverity, number>;

  /** Total agreements found */
  totalAgreements: number;

  /** Total weak chains found */
  totalWeakChains: number;

  /** Total conflicts found */
  totalConflicts: number;

  /** Average engine confidence */
  averageEngineConfidence: number;

  /** Most reliable engine */
  mostReliableEngine: EngineSource | null;

  /** Least reliable engine */
  leastReliableEngine: EngineSource | null;
}

// ============================================================================
// VALIDATION RULES
// ============================================================================

/**
 * Consistency validation rule.
 */
export interface ConsistencyRule {
  /** Rule identifier */
  id: string;

  /** Human-readable name */
  name: string;

  /** Description */
  description: string;

  /** Engines this rule applies to */
  applicableEngines: EngineSource[];

  /** Validation function */
  validate: (results: IntelligenceResults) => ConsistencyViolation | null;

  /** Default severity if violation found */
  defaultSeverity: ViolationSeverity;

  /** Whether rule is enabled */
  enabled: boolean;
}

/**
 * Rule configuration.
 */
export interface RuleConfiguration {
  /** Rule overrides */
  ruleOverrides: Record<string, { enabled: boolean; severity: ViolationSeverity }>;

  /** Custom rules to add */
  customRules: ConsistencyRule[];

  /** Global thresholds */
  thresholds: {
    minAgreementStrength: number;
    maxChainWeakness: number;
    criticalViolationThreshold: number;
  };
}

// ============================================================================
// ENGINE CONFIGURATION
// ============================================================================

/**
 * Configuration for the Consistency Engine.
 */
export interface ConsistencyEngineConfig {
  /** Enable contradiction detection */
  enableContradictionDetection: boolean;

  /** Enable agreement detection */
  enableAgreementDetection: boolean;

  /** Enable weak chain detection */
  enableWeakChainDetection: boolean;

  /** Enable override detection */
  enableOverrideDetection: boolean;

  /** Enable conflict detection */
  enableConflictDetection: boolean;

  /** Minimum confidence threshold for analysis */
  minConfidenceThreshold: number;

  /** Rule configuration */
  rules: RuleConfiguration;

  /** Engine weights for consensus calculation */
  engineWeights: Record<EngineSource, number>;

  /** Logging level */
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Default engine configuration.
 */
export const DEFAULT_CONSISTENCY_CONFIG: ConsistencyEngineConfig = {
  enableContradictionDetection: true,
  enableAgreementDetection: true,
  enableWeakChainDetection: true,
  enableOverrideDetection: true,
  enableConflictDetection: true,
  minConfidenceThreshold: 0.3,
  rules: {
    ruleOverrides: {},
    customRules: [],
    thresholds: {
      minAgreementStrength: 0.7,
      maxChainWeakness: 0.5,
      criticalViolationThreshold: 3,
    },
  },
  engineWeights: {
    matching: 0.15,
    utility: 0.1,
    optionality: 0.1,
    criticality: 0.1,
    coalition: 0.15,
    regret: 0.15,
    market: 0.1,
    future_simulation: 0.1,
    recommendation: 0.05,
  },
  logLevel: 'info',
};

// ============================================================================
// ANALYSIS OPTIONS
// ============================================================================

/**
 * Options for consistency analysis.
 */
export interface ConsistencyAnalysisOptions {
  /** Specific engines to include (undefined = all) */
  includeEngines?: EngineSource[];

  /** Engines to exclude */
  excludeEngines?: EngineSource[];

  /** Focus on specific path/career */
  targetPathId?: string;

  /** Minimum severity to report */
  minSeverity?: ViolationSeverity;

  /** Maximum violations to return */
  maxViolations?: number;

  /** Custom configuration overrides */
  configOverrides?: Partial<ConsistencyEngineConfig>;
}
