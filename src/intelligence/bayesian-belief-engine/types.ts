/**
 * CareerOS Bayesian Belief Updating Engine - Types
 *
 * Type definitions for continuously updating student beliefs
 * as new evidence is collected.
 */

// ============================================================================
// CORE PRIMITIVE TYPES
// ============================================================================

/**
 * Unique identifier for belief updates.
 */
export type BeliefUpdateId = string;

/**
 * Unique identifier for evidence events.
 */
export type EvidenceId = string;

/**
 * Belief type classification.
 */
export type BeliefType =
  | 'interest'
  | 'aptitude'
  | 'value'
  | 'identity'
  | 'skill'
  | 'careerPreference';

/**
 * Evidence event type.
 */
export type EvidenceType =
  | 'assessment'
  | 'project'
  | 'internship'
  | 'competition'
  | 'hackathon'
  | 'certification'
  | 'academicPerformance'
  | 'reflection'
  | 'careerExperiment'
  | 'behavior';

/**
 * Local Bayesian belief confidence category.
 *
 * This is a type-only compatibility surface for the existing belief confidence
 * output shape. It is not a runtime enum and does not replace ConfidenceAuthority.
 */
export type BeliefConfidenceLevel = 'low' | 'moderate' | 'high' | 'veryHigh';
export type ConfidenceLevel = BeliefConfidenceLevel;

/**
 * Belief stability level.
 */
export type StabilityLevel = 'volatile' | 'evolving' | 'stable' | 'entrenched';

// ============================================================================
// BELIEF NODE
// ============================================================================

/**
 * Represents a belief node in the Bayesian network.
 */
export interface BeliefNode {
  /** Unique identifier */
  id: string;

  /** Belief type */
  beliefType: BeliefType;

  /** Specific belief identifier (e.g., 'entrepreneurship-interest') */
  beliefId: string;

  /** Human-readable name */
  name: string;

  /** Current probability (0-1) */
  currentProbability: number;

  /** Confidence in this belief (0-1) */
  confidence: number;

  /** Number of evidence items supporting this belief */
  evidenceCount: number;

  /** Timestamp of last update */
  lastUpdated: number;

  /** Belief creation timestamp */
  createdAt: number;
}

// ============================================================================
// EVIDENCE EVENT
// ============================================================================

/**
 * Represents evidence that can update a belief.
 */
export interface EvidenceEvent {
  /** Unique identifier */
  id: EvidenceId;

  /** Evidence type */
  type: EvidenceType;

  /** Timestamp */
  timestamp: number;

  /** Student ID */
  studentId: string;

  /** Belief being updated */
  targetBeliefId: string;

  /** Belief type */
  targetBeliefType: BeliefType;

  /** Evidence value (supports belief) */
  supportsBelief: boolean;

  /** Evidence strength (0-1) */
  strength: number;

  /** Evidence source */
  source: {
    type: 'selfReport' | 'observed' | 'inferred' | 'external';
    description: string;
  };

  /** Evidence weight (calculated) */
  weight?: number;

  /** Raw data */
  data: {
    description: string;
    metadata: Record<string, unknown>;
  };
}

// ============================================================================
// BELIEF UPDATE
// ============================================================================

/**
 * Records a belief update event.
 */
export interface BeliefUpdate {
  /** Unique identifier */
  id: BeliefUpdateId;

  /** Timestamp */
  timestamp: number;

  /** Student ID */
  studentId: string;

  /** Belief being updated */
  beliefId: string;

  /** Prior belief state */
  priorBelief: {
    probability: number;
    confidence: number;
  };

  /** New evidence applied */
  evidence: EvidenceEvent;

  /** Posterior belief state */
  posteriorBelief: {
    probability: number;
    confidence: number;
  };

  /** Change magnitude */
  change: {
    probabilityDelta: number;
    confidenceDelta: number;
  };

  /** Human-readable explanation */
  explanation: string;

  /** Bayesian calculation details */
  calculation: {
    prior: number;
    likelihood: number;
    posterior: number;
    bayesFactor: number;
  };
}

// ============================================================================
// EVIDENCE WEIGHT
// ============================================================================

/**
 * Weight assigned to evidence based on source and type.
 */
export interface EvidenceWeight {
  /** Evidence type */
  evidenceType: EvidenceType;

  /** Source type */
  sourceType: EvidenceEvent['source']['type'];

  /** Base weight (0-1) */
  baseWeight: number;

  /** Multipliers */
  multipliers: {
    duration: number;
    consistency: number;
    externalValidation: number;
  };

  /** Final calculated weight */
  finalWeight: number;

  /** Explanation of weight assignment */
  explanation: string;
}

// ============================================================================
// BELIEF CONFIDENCE
// ============================================================================

/**
 * Tracks confidence metrics for a belief.
 */
export interface BeliefConfidence {
  /** Belief ID */
  beliefId: string;

  /** Current confidence level */
  currentConfidence: number;

  /** Local Bayesian confidence category for narrative grouping */
  confidenceLevel: BeliefConfidenceLevel;

  /** Confidence history */
  history: Array<{
    timestamp: number;
    confidence: number;
    event: string;
  }>;

  /** Confidence growth rate */
  growthRate: number;

  /** Confidence decay (if no new evidence) */
  decayRate: number;

  /** Belief stability */
  stability: {
    level: StabilityLevel;
    score: number;
    volatility: number;
  };

  /** Time since last update */
  timeSinceLastUpdate: number;
}

// ============================================================================
// CONTRADICTION
// ============================================================================

/**
 * Detected contradiction between belief and evidence.
 */
export interface Contradiction {
  /** Unique identifier */
  id: string;

  /** Belief in question */
  beliefId: string;

  /** Belief type */
  beliefType: BeliefType;

  /** Claimed belief value */
  claimedValue: number;

  /** Evidence suggesting otherwise */
  conflictingEvidence: EvidenceEvent;

  /** Contradiction severity (0-1) */
  severity: number;

  /** Type of contradiction */
  type:
    | 'actionInconsistency'
    | 'statementInconsistency'
    | 'temporalInconsistency'
    | 'behavioralInconsistency';

  /** Human-readable description */
  description: string;

  /** Resolution suggestions */
  suggestions: string[];
}

// ============================================================================
// BELIEF HISTORY
// ============================================================================

/**
 * Complete history of a belief.
 */
export interface BeliefHistory {
  /** Belief ID */
  beliefId: string;

  /** Belief metadata */
  metadata: {
    type: BeliefType;
    name: string;
    createdAt: number;
  };

  /** All updates to this belief */
  updates: BeliefUpdate[];

  /** Confidence trajectory */
  confidenceTrajectory: Array<{
    timestamp: number;
    confidence: number;
  }>;

  /** Probability trajectory */
  probabilityTrajectory: Array<{
    timestamp: number;
    probability: number;
  }>;

  /** Evidence applied */
  evidence: EvidenceEvent[];

  /** Contradictions detected */
  contradictions: Contradiction[];

  /** Summary statistics */
  statistics: {
    totalUpdates: number;
    totalEvidence: number;
    averageChange: number;
    maxProbability: number;
    minProbability: number;
  };
}

// ============================================================================
// UPDATED STUDENT BELIEF
// ============================================================================

/**
 * Result of belief updating process.
 */
export interface UpdatedStudentBelief {
  /** Student ID */
  studentId: string;

  /** Timestamp of update */
  timestamp: number;

  /** Updated beliefs */
  beliefs: BeliefNode[];

  /** Belief updates performed */
  updates: BeliefUpdate[];

  /** Confidence levels */
  confidence: Record<string, BeliefConfidence>;

  /** Belief histories */
  histories: Record<string, BeliefHistory>;

  /** Detected contradictions */
  contradictions: Contradiction[];

  /** Summary */
  summary: {
    totalBeliefs: number;
    updatedBeliefs: number;
    newBeliefs: number;
    contradictionsFound: number;
    averageConfidence: number;
  };

  /** Narrative explanation */
  narrative: {
    summary: string;
    keyChanges: string[];
    confidenceInsights: string[];
    recommendations: string[];
  };
}

// ============================================================================
// INPUTS
// ============================================================================

/**
 * Input for belief update.
 */
export interface BeliefUpdateInput {
  /** Student ID */
  studentId: string;

  /** Current beliefs */
  currentBeliefs: BeliefNode[];

  /** New evidence */
  newEvidence: EvidenceEvent[];

  /** Belief histories */
  histories?: Record<string, BeliefHistory>;

  /** Update configuration */
  config?: Partial<BayesianBeliefConfig>;
}

/**
 * Input for processing single evidence.
 */
export interface ProcessEvidenceInput {
  /** Student ID */
  studentId: string;

  /** Evidence to process */
  evidence: EvidenceEvent;

  /** Current belief state */
  currentBelief?: BeliefNode;

  /** Update configuration */
  config?: Partial<BayesianBeliefConfig>;
}

// ============================================================================
// ENGINE CONFIGURATION
// ============================================================================

/**
 * Configuration for Bayesian Belief Engine.
 */
export interface BayesianBeliefConfig {
  /** Prior probability for new beliefs */
  defaultPrior: number;

  /** Default confidence for new beliefs */
  defaultConfidence: number;

  /** Confidence growth rate per evidence */
  confidenceGrowthRate: number;

  /** Confidence decay rate (per day without evidence) */
  confidenceDecayRate: number;

  /** Minimum confidence threshold */
  minConfidence: number;

  /** Maximum confidence cap */
  maxConfidence: number;

  /** Evidence weight by type */
  evidenceWeights: Record<EvidenceType, number>;

  /** Source reliability multipliers */
  sourceReliability: Record<EvidenceEvent['source']['type'], number>;

  /** Contradiction detection threshold */
  contradictionThreshold: number;

  /** Minimum evidence for high confidence */
  minEvidenceForHighConfidence: number;

  /** Time window for consistency checks (days) */
  consistencyWindow: number;
}

/**
 * Default configuration.
 */
export const DEFAULT_BAYESIAN_CONFIG: BayesianBeliefConfig = {
  defaultPrior: 0.5,
  defaultConfidence: 0.3,
  confidenceGrowthRate: 0.1,
  confidenceDecayRate: 0.01,
  minConfidence: 0.1,
  maxConfidence: 0.95,
  evidenceWeights: {
    assessment: 0.4,
    project: 0.7,
    internship: 0.8,
    competition: 0.6,
    hackathon: 0.6,
    certification: 0.7,
    academicPerformance: 0.5,
    reflection: 0.3,
    careerExperiment: 0.8,
    behavior: 0.7,
  },
  sourceReliability: {
    selfReport: 0.5,
    observed: 0.8,
    inferred: 0.6,
    external: 0.9,
  },
  contradictionThreshold: 0.6,
  minEvidenceForHighConfidence: 3,
  consistencyWindow: 90,
};

// ============================================================================
// NARRATIVE
// ============================================================================

/**
 * Narrative explanation for belief updates.
 */
export interface BeliefNarrative {
  /** Summary statement */
  summary: string;

  /** Key changes explained */
  keyChanges: string[];

  /** Confidence insights */
  confidenceInsights: string[];

  /** Contradiction warnings */
  contradictionWarnings: string[];

  /** Recommendations */
  recommendations: string[];
}
