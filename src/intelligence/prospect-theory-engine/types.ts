/**
 * CareerOS Prospect Theory & Cognitive Bias Engine - Types
 *
 * Type definitions for modeling predictable human decision biases.
 */

// ============================================================================
// CORE PRIMITIVE TYPES
// ============================================================================

/**
 * Unique identifier for bias analyses.
 */
export type BiasAnalysisId = string;

/**
 * Bias type classification.
 */
export type BiasType =
  | 'lossAversion'
  | 'statusSeeking'
  | 'socialConformity'
  | 'authorityInfluence'
  | 'riskPerceptionBias'
  | 'optimismBias'
  | 'sunkCostSensitivity'
  | 'availabilityBias'
  | 'anchoringBias'
  | 'confirmationBias';

/**
 * Bias signal source.
 */
export type BiasSignalSource =
  | 'assessment'
  | 'behavior'
  | 'careerChoice'
  | 'decisionHistory'
  | 'familyInteraction';

/**
 * Bias severity level.
 */
export type BiasSeverity = 'minimal' | 'mild' | 'moderate' | 'strong' | 'extreme';

/**
 * Decision distortion score (0-100).
 */
export type DistortionScore = number;

// ============================================================================
// BIAS PROFILE
// ============================================================================

/**
 * Complete bias profile for a student.
 */
export interface BiasProfile {
  /** Student ID */
  studentId: string;

  /** Timestamp */
  timestamp: number;

  /** Loss aversion (0-100): Tendency to prefer avoiding losses vs acquiring gains */
  lossAversion: number;

  /** Status seeking (0-100): Preference for prestige/status careers */
  statusSeeking: number;

  /** Social conformity (0-100): Tendency to follow peer preferences */
  socialConformity: number;

  /** Authority influence (0-100): Susceptibility to authority figures */
  authorityInfluence: number;

  /** Risk perception bias (0-100): Gap between actual and perceived risk */
  riskPerceptionBias: number;

  /** Optimism bias (0-100): Tendency to overestimate positive outcomes */
  optimismBias: number;

  /** Sunk cost sensitivity (0-100): Tendency to continue due to past investment */
  sunkCostSensitivity: number;

  /** Availability bias (0-100): Overweighting readily available information */
  availabilityBias: number;

  /** Anchoring bias (0-100): Over-reliance on first information received */
  anchoringBias: number;

  /** Confirmation bias (0-100): Seeking information that confirms existing beliefs */
  confirmationBias: number;

  /** Overall bias influence */
  overallBias: number;

  /** Confidence in bias detection */
  confidence: number;
}

// ============================================================================
// BIAS SIGNAL
// ============================================================================

/**
 * Signal indicating presence of a bias.
 */
export interface BiasSignal {
  /** Unique identifier */
  id: string;

  /** Bias type */
  biasType: BiasType;

  /** Source of signal */
  source: BiasSignalSource;

  /** Signal strength (0-1) */
  strength: number;

  /** Timestamp */
  timestamp: number;

  /** Evidence for this signal */
  evidence: {
    description: string;
    data: Record<string, unknown>;
  };

  /** Context */
  context: {
    decisionId?: string;
    careerId?: string;
    situation: string;
  };
}

// ============================================================================
// BIAS IMPACT
// ============================================================================

/**
 * Impact of a specific bias on a decision.
 */
export interface BiasImpact {
  /** Bias type */
  biasType: BiasType;

  /** Impact on this decision (0-100) */
  impact: number;

  /** How the bias manifests */
  manifestation: string;

  /** Affected aspects */
  affectedAspects: string[];

  /** Direction of bias */
  direction: 'increases_attractiveness' | 'decreases_attractiveness' | 'distorts_perception';

  /** Severity */
  severity: BiasSeverity;
}

// ============================================================================
// RISK PERCEPTION
// ============================================================================

/**
 * Comparison of actual vs perceived risk.
 */
export interface RiskPerception {
  /** Career or option ID */
  careerId: string;

  /** Actual risk level (0-100) */
  actualRisk: number;

  /** Perceived risk level (0-100) */
  perceivedRisk: number;

  /** Gap between actual and perceived */
  perceptionGap: number;

  /** Direction of bias */
  biasDirection: 'overestimated' | 'underestimated' | 'accurate';

  /** Factors contributing to perception */
  factors: string[];
}

// ============================================================================
// DECISION DISTORTION
// ============================================================================

/**
 * Analysis of decision distortion.
 */
export interface DecisionDistortion {
  /** Decision ID */
  decisionId: string;

  /** Overall distortion score (0-100) */
  overallScore: DistortionScore;

  /** Distortion level */
  level: 'minimal' | 'low' | 'moderate' | 'high' | 'extreme';

  /** Contributing biases */
  contributingBiases: BiasImpact[];

  /** Biases ranked by impact */
  rankedBiases: BiasImpact[];

  /** Comparison to rational choice */
  rationalComparison: {
    rationalChoice: string;
    actualChoice: string;
    deviation: number;
  };
}

// ============================================================================
// BIAS ANALYSIS
// ============================================================================

/**
 * Complete bias analysis result.
 */
export interface BiasAnalysis {
  /** Unique identifier */
  id: BiasAnalysisId;

  /** Timestamp */
  timestamp: number;

  /** Student ID */
  studentId: string;

  /** Bias profile */
  profile: BiasProfile;

  /** Signals detected */
  signals: BiasSignal[];

  /** Decision context */
  context?: {
    decisionId: string;
    careerOptions: string[];
    familyPressures?: string[];
  };

  /** Risk perceptions */
  riskPerceptions?: RiskPerception[];

  /** Decision distortion analysis */
  distortion?: DecisionDistortion;

  /** Bias impacts on current decision */
  impacts: BiasImpact[];

  /** Summary */
  summary: {
    dominantBias: BiasType | null;
    totalSignals: number;
    averageDistortion: number;
    biasSeverity: BiasSeverity;
  };

  /** Narrative explanation */
  narrative: {
    overview: string;
    biasExplanation: string[];
    impactExplanation: string[];
    recommendation: string[];
  };
}

// ============================================================================
// BIAS DETECTION INPUT
// ============================================================================

/**
 * Input for bias detection.
 */
export interface BiasDetectionInput {
  /** Student ID */
  studentId: string;

  /** Student beliefs */
  studentBeliefs: {
    interests: Array<{ id: string; strength: number }>;
    values: Array<{ id: string; importance: number }>;
  };

  /** Assessment responses */
  assessmentResponses?: Array<{
    questionId: string;
    response: string | number;
    category: string;
  }>;

  /** Career choices */
  careerChoices: Array<{
    careerId: string;
    utility: number;
    rank: number;
    rationale?: string;
  }>;

  /** Decision history */
  decisionHistory?: Array<{
    decisionId: string;
    choice: string;
    alternatives: string[];
    timestamp: number;
  }>;

  /** Family interactions */
  familyInteractions?: {
    parentExpectations: Array<{ careerId: string; strength: number }>;
    studentAlignment: number;
    conflictLevel: number;
  };

  /** Configuration */
  config?: Partial<ProspectTheoryConfig>;
}

// ============================================================================
// BIAS DETECTION RESULT
// ============================================================================

/**
 * Result of bias detection.
 */
export interface BiasDetectionResult {
  /** Detected signals */
  signals: BiasSignal[];

  /** Bias profile */
  profile: Partial<BiasProfile>;

  /** Confidence in detection */
  confidence: number;
}

// ============================================================================
// BIAS EXPLANATION
// ============================================================================

/**
 * Human-readable bias explanation.
 */
export interface BiasExplanation {
  /** Bias type */
  biasType: BiasType;

  /** Display name */
  displayName: string;

  /** Description */
  description: string;

  /** How it manifests */
  manifestation: string;

  /** Impact on decision */
  impact: string;

  /** Mitigation strategies */
  mitigation: string[];
}

// ============================================================================
// DECISION DISTORTION REPORT
// ============================================================================

/**
 * Complete distortion report.
 */
export interface DecisionDistortionReport {
  /** Report ID */
  id: string;

  /** Student ID */
  studentId: string;

  /** Timestamp */
  timestamp: number;

  /** Overall distortion */
  overallDistortion: DistortionScore;

  /** Distortion level */
  level: DecisionDistortion['level'];

  /** Bias breakdown */
  biasBreakdown: Record<BiasType, number>;

  /** Affected decisions */
  affectedDecisions: Array<{
    decisionId: string;
    distortion: number;
    primaryBias: BiasType;
  }>;

  /** Explanations */
  explanations: BiasExplanation[];

  /** Recommendations */
  recommendations: string[];
}

// ============================================================================
// ENGINE CONFIGURATION
// ============================================================================

/**
 * Configuration for Prospect Theory Engine.
 */
export interface ProspectTheoryConfig {
  /** Threshold for detecting loss aversion */
  lossAversionThreshold: number;

  /** Threshold for detecting status seeking */
  statusSeekingThreshold: number;

  /** Threshold for detecting social conformity */
  socialConformityThreshold: number;

  /** Threshold for detecting authority influence */
  authorityInfluenceThreshold: number;

  /** Threshold for detecting risk perception bias */
  riskPerceptionThreshold: number;

  /** Threshold for detecting optimism bias */
  optimismBiasThreshold: number;

  /** Threshold for detecting sunk cost sensitivity */
  sunkCostThreshold: number;

  /** Minimum signal strength to consider */
  minSignalStrength: number;

  /** Weight for assessment signals */
  assessmentWeight: number;

  /** Weight for behavioral signals */
  behaviorWeight: number;

  /** Weight for career choice signals */
  careerChoiceWeight: number;

  /** Weight for decision history signals */
  decisionHistoryWeight: number;

  /** Weight for family interaction signals */
  familyInteractionWeight: number;
}

/**
 * Default configuration.
 */
export const DEFAULT_PROSPECT_THEORY_CONFIG: ProspectTheoryConfig = {
  lossAversionThreshold: 0.6,
  statusSeekingThreshold: 0.6,
  socialConformityThreshold: 0.6,
  authorityInfluenceThreshold: 0.6,
  riskPerceptionThreshold: 0.5,
  optimismBiasThreshold: 0.6,
  sunkCostThreshold: 0.5,
  minSignalStrength: 0.3,
  assessmentWeight: 0.3,
  behaviorWeight: 0.25,
  careerChoiceWeight: 0.25,
  decisionHistoryWeight: 0.1,
  familyInteractionWeight: 0.1,
};
