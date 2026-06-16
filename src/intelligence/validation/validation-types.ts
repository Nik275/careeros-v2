/**
 * Validation Types
 *
 * Core type definitions for the CareerOS Intelligence Validation & Calibration system.
 */

// ============================================================================
// BASE TYPES
// ============================================================================

export type ValidationTimestamp = number;
export type ValidationId = string;
export type ConfidenceLevel = number; // 0-100
export type DriftScore = number; // 0-100, lower is better
export type CalibrationScore = number; // 0-1, 1 = perfect calibration

// ============================================================================
// CONFIDENCE CALIBRATION
// ============================================================================

export interface ConfidenceCalibrationReport {
  reportId: ValidationId;
  generatedAt: ValidationTimestamp;

  // Overall calibration status
  overallCalibration: {
    score: CalibrationScore;
    status: 'well-calibrated' | 'overconfident' | 'underconfident' | 'unstable' | 'severely-miscalibrated';
    confidence: ConfidenceLevel;
  };

  // Bin analysis (confidence buckets)
  confidenceBins: Array<{
    binRange: [number, number]; // e.g., [90, 100]
    predictedConfidence: number; // Average predicted confidence in bin
    actualAccuracy: number; // Actual accuracy observed
    sampleSize: number;
    calibrationError: number; // |predicted - actual|
  }>;

  // Engine-specific calibration
  engineCalibration: Record<string, {
    score: CalibrationScore;
    bias: 'overconfident' | 'underconfident' | 'neutral';
    recommendedAdjustment: number; // Factor to multiply confidence by
  }>;

  // Trends over time
  calibrationTrend: Array<{
    timestamp: ValidationTimestamp;
    score: CalibrationScore;
  }>;

  // Recommendations
  recommendations: string[];

  // Statistics
  totalRecommendationsAnalyzed: number;
  timeRange: { start: ValidationTimestamp; end: ValidationTimestamp };
}

export type CalibrationBin = ConfidenceCalibrationReport['confidenceBins'][number];
export type CalibrationStats = ConfidenceCalibrationReport['overallCalibration'];
export type CalibrationReport = {
  overallCalibration: {
    score: number;
    status: 'well-calibrated' | 'overconfident' | 'underconfident' | 'severely-miscalibrated';
    ece: number;
    miscalibration: number;
    overconfidence: number;
    underconfidence: number;
    actualAccuracy: number;
    confidenceAccuracyCorrelation: number;
  };
  binAnalysis: Array<{
    binStart: number;
    binEnd: number;
    predictedAccuracy: number;
    actualAccuracy: number;
    error: number;
    sampleSize: number;
    sampleSizeAdequate: boolean;
  }>;
  recommendations: string[];
  passed?: boolean;
};

// ============================================================================
// STABILITY
// ============================================================================

export interface StabilityReport {
  reportId: ValidationId;
  generatedAt: ValidationTimestamp;
  studentId: string;

  // Overall stability
  overallStability: {
    score: number; // 0-100
    status: 'highly-stable' | 'stable' | 'moderate' | 'unstable' | 'highly-unstable';
  };

  // Stability across different perturbations
  perturbationResults: Array<{
    perturbationType: 'wording-change' | 'reorder' | 'session-restart' | 'time-delay' | 'noise-injection';
    description: string;
    originalRecommendation: string;
    perturbedRecommendation: string;
    recommendationDrift: DriftScore;
    confidenceDrift: DriftScore;
    rankDrift: DriftScore;
    acceptable: boolean;
  }>;

  // Drift metrics
  driftMetrics: {
    recommendationDrift: { mean: number; max: number; std: number };
    confidenceDrift: { mean: number; max: number; std: number };
    rankDrift: { mean: number; max: number; std: number };
  };

  // Stability by engine
  engineStability: Record<string, {
    score: number;
    driftCount: number;
  }>;

  // Acceptability threshold
  thresholdUsed: number;
  passed: boolean;
}

// ============================================================================
// CONSISTENCY
// ============================================================================

export type AssessmentPath = Array<{
  step: string;
  component: string;
  timestamp: ValidationTimestamp;
}>;

export interface ConsistencyReport {
  reportId: ValidationId;
  generatedAt: ValidationTimestamp;
  studentId: string;

  // Overall consistency
  overallConsistency: {
    score: number; // 0-100
    status: 'highly-consistent' | 'consistent' | 'moderate' | 'inconsistent';
  };

  // Path comparison results
  pathComparisons: Array<{
    pathA: AssessmentPath;
    pathB: AssessmentPath;
    topRecommendationMatch: boolean;
    top3Overlap: number; // Jaccard similarity
    confidenceCorrelation: number; // Pearson correlation
    rankCorrelation: number; // Spearman correlation
    consistent: boolean;
  }>;

  // Component consistency
  componentConsistency: Record<string, {
    score: number;
    variance: number;
  }>;

  // Convergence analysis
  convergence: {
    stepsToStabilize: number;
    stableRecommendations: string[];
  };

  // Acceptability
  thresholdUsed: number;
  passed: boolean;
}

// ============================================================================
// UNCERTAINTY
// ============================================================================

export interface UncertaintyAssessment {
  assessmentId: ValidationId;
  generatedAt: ValidationTimestamp;
  studentId: string;

  // Overall uncertainty level
  overallUncertainty: {
    level: 'none' | 'low' | 'medium' | 'high' | 'critical';
    score: number; // 0-100, higher = more uncertain
    admissionRequired: boolean;
    explanation?: string;
  };

  // Uncertainty sources
  sources: Array<{
    type: 'insufficient-evidence' | 'conflicting-signals' | 'contradictory-profile' | 'data-gap' | 'novel-situation' | 'edge-case';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    affectedEngines: string[];
    recommendation: string;
  }>;

  // Evidence gaps
  evidenceGaps: Array<{
    area: string;
    impact: 'low' | 'medium' | 'high';
    suggestion: string;
  }>;

  // Confidence bounds
  confidenceBounds: {
    pointEstimate: ConfidenceLevel;
    lowerBound: ConfidenceLevel;
    upperBound: ConfidenceLevel;
    confidenceInterval: number;
    lower?: ConfidenceLevel;
    upper?: ConfidenceLevel;
  };

  // System response
  systemResponse: {
    shouldDefer: boolean;
    shouldGatherMoreData: boolean;
    shouldEscalate: boolean;
    alternativeApproaches: string[];
    shouldAdmitUncertainty?: boolean;
    explanation?: string;
  };
}

export type EvidenceGap = UncertaintyAssessment['evidenceGaps'][number];
export type UncertaintySource = UncertaintyAssessment['sources'][number];
export type SystemResponse = UncertaintyAssessment['systemResponse'];
export type ConfidenceBounds = UncertaintyAssessment['confidenceBounds'];
export type OverallUncertainty = UncertaintyAssessment['overallUncertainty'];

// ============================================================================
// COUNTERFACTUAL
// ============================================================================

export interface CounterfactualReport {
  reportId: ValidationId;
  generatedAt: ValidationTimestamp;
  studentId: string;
  baseRecommendation: string;

  // Counterfactual scenarios
  scenarios: Array<{
    scenarioId: string;
    description: string;
    change: {
      variable: string;
      from: unknown;
      to: unknown;
    };
    originalRecommendation: string;
    counterfactualRecommendation: string;
    wouldChange: boolean;
    magnitude: 'minor' | 'moderate' | 'major' | 'fundamental';
    reasoning: string;
    sensitivityScore: number; // 0-100
  }>;

  // Sensitivity analysis
  sensitivityRanking: Array<{
    variable: string;
    sensitivityScore: number;
    impact: 'low' | 'medium' | 'high';
  }>;

  // Robustness assessment
  robustness: {
    score: number; // 0-100
    status: 'robust' | 'moderately-robust' | 'fragile';
    criticalFactors: string[];
  };

  // Decision boundaries
  decisionBoundaries: Array<{
    variable: string;
    threshold: number;
    belowRecommendation: string;
    aboveRecommendation: string;
  }>;
}

export type PathComparison = ConsistencyReport['pathComparisons'][number];
export type CounterfactualScenario = CounterfactualReport['scenarios'][number];
export type SensitivityRanking = CounterfactualReport['sensitivityRanking'][number];
export type Robustness = CounterfactualReport['robustness'];
export type DecisionBoundary = CounterfactualReport['decisionBoundaries'][number];

// ============================================================================
// RECOMMENDATION AUDIT
// ============================================================================

export interface RecommendationAuditReport {
  auditId: ValidationId;
  generatedAt: ValidationTimestamp;
  recommendationId: string;
  studentId: string;

  // Recommendation details
  recommendation: {
    careerId: string;
    careerName: string;
    rank: number;
    confidence: ConfidenceLevel;
    score: number;
  };

  // Evidence audit
  evidence: {
    sources: Array<{
      engine: string;
      evidenceType: string;
      description: string;
      strength: number;
      verifiable: boolean;
    }>;
    totalEvidencePieces: number;
    evidenceQuality: number;
  };

  // Engine involvement
  engines: Array<{
    engineId: string;
    contribution: number;
    confidence: ConfidenceLevel;
    keyFactors: string[];
  }>;

  // Confidence basis
  confidenceBasis: {
    primaryFactors: string[];
    supportingFactors: string[];
    detractingFactors: string[];
    sampleSize: number;
    historicalAccuracy: number;
  };

  // Opportunity costs
  opportunityCosts: {
    sacrificedOptions: Array<{
      careerId: string;
      careerName: string;
      potentialValue: number;
    }>;
    reversibilityScore: number;
    switchCost: string;
  };

  // Uncertainty sources
  uncertainties: Array<{
    source: string;
    impact: 'low' | 'medium' | 'high';
    mitigation: string;
  }>;

  // Audit findings
  findings: {
    strengths: string[];
    weaknesses: string[];
    risks: string[];
    recommendations: string[];
  };

  // Verdict
  verdict: {
    trustworthy: boolean;
    confidence: ConfidenceLevel;
    caveats: string[];
  };
}

export type EvidenceSource = RecommendationAuditReport['evidence']['sources'][number];
export type EngineAudit = RecommendationAuditReport['engines'][number];
export type ConfidenceBasis = RecommendationAuditReport['confidenceBasis'];
export type OpportunityCost = RecommendationAuditReport['opportunityCosts'];
export type UncertaintyAudit = RecommendationAuditReport['uncertainties'][number];
export type AuditFinding = RecommendationAuditReport['findings'];
export type AuditVerdict = RecommendationAuditReport['verdict'];

// ============================================================================
// VALIDATION INPUTS
// ============================================================================

export interface ValidationInputs {
  // Student context
  studentId: string;
  profile: {
    psychology: Record<string, unknown>;
    mentor: Record<string, unknown>;
    learning: Record<string, unknown>;
  };

  // Recommendations to validate
  recommendations: Array<{
    recommendationId: string;
    careerId: string;
    careerName: string;
    confidence: ConfidenceLevel;
    engines: string[];
    timestamp: ValidationTimestamp;
  }>;

  // Historical outcomes (for calibration)
  historicalOutcomes?: Array<{
    recommendationId: string;
    predictedConfidence: ConfidenceLevel;
    actualOutcome: 'success' | 'partial' | 'failure' | 'unknown';
    timestamp: ValidationTimestamp;
  }>;

  // Validation options
  options: {
    runCalibration: boolean;
    runStability: boolean;
    runConsistency: boolean;
    runUncertainty: boolean;
    runCounterfactual: boolean;
    runAudit: boolean;
  };
}

// ============================================================================
// MASTER VALIDATION REPORT
// ============================================================================

export interface IntelligenceValidationReport {
  reportId: ValidationId;
  generatedAt: ValidationTimestamp;
  studentId?: string;

  // Overall validation status
  overallStatus: {
    valid: boolean;
    confidence: ConfidenceLevel;
    issues: string[];
    warnings: string[];
  };

  // Component reports
  calibrationReport?: ConfidenceCalibrationReport;
  stabilityReport?: StabilityReport;
  consistencyReport?: ConsistencyReport;
  uncertaintyAssessment?: UncertaintyAssessment;
  counterfactualReport?: CounterfactualReport;
  auditReports?: RecommendationAuditReport[];

  // Cross-cutting analysis
  crossCutting: {
    reliabilityScore: number; // 0-100
    trustworthinessScore: number; // 0-100
    explainabilityScore: number; // 0-100
    robustnessScore: number; // 0-100
  };

  // Actionable insights
  insights: Array<{
    category: 'strength' | 'weakness' | 'opportunity' | 'threat';
    description: string;
    severity: 'low' | 'medium' | 'high';
    recommendation: string;
  }>;

  // Recommendations for improvement
  improvementRecommendations: string[];

  // Validation metadata
  metadata: {
    validationVersion: string;
    enginesValidated: string[];
    testsRun: number;
    testsPassed: number;
    coverage: number; // percentage
    duration: number; // ms
  };
}

// ============================================================================
// VALIDATION EVENTS
// ============================================================================

export type ValidationEventType =
  | 'validation-started'
  | 'validation-completed'
  | 'calibration-started'
  | 'calibration-completed'
  | 'stability-check-started'
  | 'stability-check-completed'
  | 'consistency-check-started'
  | 'consistency-check-completed'
  | 'uncertainty-assessment-started'
  | 'uncertainty-assessment-completed'
  | 'counterfactual-analysis-started'
  | 'counterfactual-analysis-completed'
  | 'audit-started'
  | 'audit-completed'
  | 'validation-failed'
  | 'issue-detected';

export interface ValidationEvent {
  type: ValidationEventType;
  timestamp: ValidationTimestamp;
  validationId: ValidationId;
  studentId?: string;
  data: Record<string, unknown>;
}

// ============================================================================
// VALIDATION CONFIG
// ============================================================================

export interface ValidationConfig {
  // Calibration thresholds
  calibrationThresholds: {
    wellCalibrated: number; // e.g., 0.9
    acceptable: number; // e.g., 0.7
    poor: number; // e.g., 0.5
  };

  // Stability thresholds
  stabilityThresholds: {
    highlyStable: number; // e.g., 90
    stable: number; // e.g., 70
    moderate: number; // e.g., 50
    unstable: number; // e.g., 30
  };

  // Consistency thresholds
  consistencyThresholds: {
    highlyConsistent: number; // e.g., 95
    consistent: number; // e.g., 85
    moderate: number; // e.g., 70
  };

  // Uncertainty thresholds
  uncertaintyThresholds: {
    admitUncertainty: number; // confidence below this requires admission
    gatherMoreData: number; // confidence below this requires more data
    escalate: number; // confidence below this requires escalation
  };

  // Perturbation settings
  perturbationSettings: {
    wordingVariations: number;
    reorderVariations: number;
    noiseLevels: number[];
    timeDelays: number[];
  };

  // Audit settings
  auditSettings: {
    verifyEvidence: boolean;
    checkEngineAgreement: boolean;
    validateOpportunityCosts: boolean;
    assessUncertainty: boolean;
  };
}

export const DEFAULT_VALIDATION_CONFIG: ValidationConfig = {
  calibrationThresholds: {
    wellCalibrated: 0.9,
    acceptable: 0.7,
    poor: 0.5,
  },
  stabilityThresholds: {
    highlyStable: 90,
    stable: 70,
    moderate: 50,
    unstable: 30,
  },
  consistencyThresholds: {
    highlyConsistent: 90,
    consistent: 75,
    moderate: 55,
  },
  uncertaintyThresholds: {
    admitUncertainty: 60,
    gatherMoreData: 50,
    escalate: 40,
  },
  perturbationSettings: {
    wordingVariations: 5,
    reorderVariations: 3,
    noiseLevels: [0.05, 0.1, 0.15],
    timeDelays: [0, 1000, 5000],
  },
  auditSettings: {
    verifyEvidence: true,
    checkEngineAgreement: true,
    validateOpportunityCosts: true,
    assessUncertainty: true,
  },
};

// ============================================================================
// TYPE ALIASES
// ============================================================================

export type ValidationStatus = 'passed' | 'failed' | 'warning' | 'skipped';

export interface ValidationSummary {
  overallScore: number;
  overallStatus: ValidationStatus;
  confidenceScore: number;
  trustworthinessScore: number;
  individualScores: Record<string, number>;
  statusBreakdown: Record<string, ValidationStatus>;
  recommendationCount?: number;
  issueCount?: number;
  engineResults?: Record<string, {
    status: ValidationStatus;
    score: number;
    passed: boolean;
  }>;
}

/** Run-level validation report used by the validation orchestrator. */
export interface ValidationReport {
  reportId: ValidationId;
  generatedAt: ValidationTimestamp;
  studentId?: string;
  requestId?: string;
  status: ValidationStatus;
  summary: ValidationSummary;
  results: {
    calibration?: CalibrationReport;
    stability?: StabilityReport;
    consistency?: ConsistencyReport;
    uncertainty?: UncertaintyAssessment;
    counterfactual?: CounterfactualReport;
    audit?: RecommendationAuditReport;
  };
  gates: {
    passed: boolean;
    failed: string[];
    warnings: string[];
  };
  recommendations: string[];
  errors?: Array<{ engine: string; error: string }>;
  overallStatus?: IntelligenceValidationReport['overallStatus'];
  crossCutting?: IntelligenceValidationReport['crossCutting'];
  insights?: IntelligenceValidationReport['insights'];
  improvementRecommendations?: string[];
  metadata?: IntelligenceValidationReport['metadata'];
}
