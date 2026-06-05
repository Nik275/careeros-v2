/**
 * Recommendation Fusion System - Type Definitions
 *
 * Central intelligence layer that combines all CareerOS engines
 * into a single coherent recommendation system.
 */

// ============================================================================
// CORE TYPES
// ============================================================================

export type EngineId = string;
export type RecommendationId = string;
export type FusionTimestamp = number;
export type Weight = number; // 0-1
export type ConfidenceScore = number; // 0-100
export type AgreementScore = number; // 0-100

// ============================================================================
// ENGINE WEIGHTS
// ============================================================================

export interface PsychologyWeight {
  engineId: 'psychology';
  timestamp: FusionTimestamp;

  // Component weights
  interests: Weight;
  strengths: Weight;
  motivation: Weight;
  values: Weight;
  personality: Weight;
  emotionalProfile: Weight;

  // Overall
  totalWeight: Weight;

  // Quality metrics
  dataQuality: Weight;
  recency: Weight;
  completeness: Weight;

  // Explanation
  reasoning: string[];
}

export interface CareerWeight {
  engineId: 'career';
  timestamp: FusionTimestamp;

  // Component weights
  opportunityScore: Weight;
  optionalityScore: Weight;
  irreversibilityScore: Weight;
  futureDemand: Weight;
  graphAnalysis: Weight;

  // Overall
  totalWeight: Weight;

  // Quality metrics
  dataQuality: Weight;
  marketRecency: Weight;
  graphCompleteness: Weight;

  // Explanation
  reasoning: string[];
}

export interface MentorWeight {
  engineId: 'mentor';
  timestamp: FusionTimestamp;

  // Component weights
  observedPatterns: Weight;
  historicalMistakes: Weight;
  recurringThemes: Weight;
  decisionQuality: Weight;

  // Overall
  totalWeight: Weight;

  // Quality metrics
  patternConfidence: Weight;
  historicalDepth: Weight;
  themeConsistency: Weight;

  // Explanation
  reasoning: string[];
}

export interface LearningWeight {
  engineId: 'learning';
  timestamp: FusionTimestamp;

  // Component weights
  populationOutcomes: Weight;
  historicalSuccess: Weight;
  failurePatterns: Weight;
  recommendationEffectiveness: Weight;

  // Overall
  totalWeight: Weight;

  // Quality metrics
  sampleSize: number;
  outcomeRecency: Weight;
  statisticalSignificance: Weight;

  // Explanation
  reasoning: string[];
}

export interface ContradictionWeight {
  engineId: 'contradiction';
  timestamp: FusionTimestamp;

  // Detected conflicts
  valueConflicts: Array<{
    value1: string;
    value2: string;
    severity: Weight;
    resolution: 'prioritize' | 'balance' | 'flag';
  }>;

  goalConflicts: Array<{
    goal1: string;
    goal2: string;
    severity: Weight;
    resolution: 'prioritize' | 'balance' | 'flag';
  }>;

  identityConflicts: Array<{
    aspect1: string;
    aspect2: string;
    severity: Weight;
    resolution: 'prioritize' | 'balance' | 'flag';
  }>;

  familyPressure: {
    detected: boolean;
    severity: Weight;
    source: string[];
    resolution: string;
  };

  // Overall impact
  totalWeight: Weight;
  adjustmentFactor: number; // Multiplier (0.5-1.5)

  // Explanation
  reasoning: string[];
}

// ============================================================================
// ENGINE RECOMMENDATIONS
// ============================================================================

export interface EngineRecommendation {
  engineId: EngineId;
  recommendationId: RecommendationId;
  timestamp: FusionTimestamp;

  // The recommendation
  careerId: string;
  careerName: string;
  score: number; // Raw score from engine
  rank: number; // Rank within this engine

  // Supporting evidence
  evidence: {
    type: string;
    description: string;
    strength: Weight;
  }[];

  // Confidence from this engine
  engineConfidence: ConfidenceScore;

  // Uncertainty
  uncertaintyFactors: string[];
}

// ============================================================================
// FUSION INPUTS
// ============================================================================

export interface FusionInputs {
  studentId: string;
  timestamp: FusionTimestamp;

  // Psychology profile
  psychologyProfile: {
    interests: string[];
    strengths: string[];
    motivation: Record<string, number>;
    values: string[];
    personality: Record<string, number>;
    emotionalProfile: Record<string, number>;
  };

  // Goals
  goals: {
    shortTerm: string[];
    mediumTerm: string[];
    longTerm: string[];
  };

  // Mentor profile
  mentorProfile: {
    observedPatterns: Array<{
      pattern: string;
      frequency: number;
      confidence: Weight;
    }>;
    historicalMistakes: Array<{
      mistake: string;
      lesson: string;
      frequency: number;
    }>;
    recurringThemes: string[];
    decisionQuality: Weight;
  };

  // Learning loop report
  learningLoopReport: {
    populationOutcomes: Array<{
      careerId: string;
      successRate: Weight;
      sampleSize: number;
    }>;
    historicalSuccess: Array<{
      pattern: string;
      successRate: Weight;
      sampleSize: number;
      timeRange: string;
    }>;
    failurePatterns: string[];
    recommendationEffectiveness: Weight;
    totalRecommendationsTracked: number;
    dataLastUpdated: FusionTimestamp;
  };

  // Career graph report
  careerGraphReport: {
    optionalityRanking: Array<{
      nodeId: string;
      score: number;
    }>;
    riskRanking: Array<{
      nodeId: string;
      riskLevel: string;
    }>;
    reversibilityRanking: Array<{
      nodeId: string;
      reversibilityScore: number;
    }>;
    futureOpportunityRanking: Array<{
      nodeId: string;
      score: number;
    }>;
    recommendedPaths: Array<{
      pathId: string;
      matchScore: number;
    }>;
  };

  // Contradiction report
  contradictionReport: {
    valueConflicts: Array<{
      value1: string;
      value2: string;
      severity: Weight;
    }>;
    goalConflicts: Array<{
      goal1: string;
      goal2: string;
      severity: Weight;
    }>;
    identityConflicts: Array<{
      aspect1: string;
      aspect2: string;
      severity: Weight;
    }>;
    familyPressure: {
      detected: boolean;
      severity: Weight;
    };
  };

  // Engine recommendations
  engineRecommendations: EngineRecommendation[];
}

// ============================================================================
// CONFIDENCE FUSION
// ============================================================================

export interface RecommendationConfidence {
  recommendationId: RecommendationId;
  careerId: string;

  // Overall confidence
  overallConfidence: ConfidenceScore;

  // Component confidences
  evidenceQuality: ConfidenceScore;
  engineAgreement: ConfidenceScore;
  historicalValidation: ConfidenceScore;
  uncertainty: ConfidenceScore; // Inverse - lower is better

  // Agreement metrics
  engineAgreementDetails: {
    agreeingEngines: EngineId[];
    disagreeingEngines: EngineId[];
    neutralEngines: EngineId[];
    agreementScore: AgreementScore;
  };

  // Calibration
  calibrationStatus: 'well-calibrated' | 'over-confident' | 'under-confident';
  calibrationFactor: number;

  // Uncertainty breakdown
  uncertaintySources: Array<{
    source: string;
    impact: Weight;
    reducible: boolean;
  }>;

  // Timestamp
  calculatedAt: FusionTimestamp;
}

// ============================================================================
// FUSED RECOMMENDATION
// ============================================================================

export interface FusedRecommendation {
  recommendationId: RecommendationId;
  careerId: string;
  careerName: string;

  // Ranking
  rank: number;
  finalScore: number;

  // Confidence
  confidence: RecommendationConfidence;

  // Evidence
  evidence: {
    psychology: {
      contributes: boolean;
      strength: Weight;
      keyFactors: string[];
    };
    career: {
      contributes: boolean;
      strength: Weight;
      keyFactors: string[];
    };
    mentor: {
      contributes: boolean;
      strength: Weight;
      keyFactors: string[];
    };
    learning: {
      contributes: boolean;
      strength: Weight;
      keyFactors: string[];
    };
  };

  // Risks
  risks: Array<{
    risk: string;
    likelihood: Weight;
    impact: 'low' | 'medium' | 'high' | 'severe';
    mitigation: string;
  }>;

  // Opportunity cost
  opportunityCost: {
    sacrificedOptions: string[];
    estimatedValue: number; // Score 0-100
    reversibility: Weight;
  };

  // Optionality
  optionality: {
    futureOptions: number;
    pivotPossibilities: string[];
    optionalityScore: number;
  };

  // Reversibility
  reversibility: {
    score: number;
    reversalDifficulty: 'easy' | 'moderate' | 'difficult' | 'very-difficult';
    estimatedCost: string;
  };

  // Explanation
  explanation: {
    summary: string;
    detailedReasoning: string[];
    keyInsights: string[];
    warnings: string[];
  };

  // Engine contributions
  engineContributions: Array<{
    engineId: EngineId;
    rawScore: number;
    weight: Weight;
    contribution: number;
  }>;

  // Contradictions
  contradictions: {
    detected: boolean;
    conflicts: Array<{
      type: 'value' | 'goal' | 'identity' | 'family';
      description: string;
      resolution: string;
    }>;
  };

  // Timestamp
  generatedAt: FusionTimestamp;
}

// ============================================================================
// UNIFIED RECOMMENDATION REPORT
// ============================================================================

export interface UnifiedRecommendationReport {
  reportId: string;
  studentId: string;
  generatedAt: FusionTimestamp;

  // Top recommendations
  recommendations: FusedRecommendation[];
  topRecommendation: FusedRecommendation;

  // Engine weights used
  weights: {
    psychology: PsychologyWeight;
    career: CareerWeight;
    mentor: MentorWeight;
    learning: LearningWeight;
    contradiction: ContradictionWeight;
  };

  // Overall assessment
  overallAssessment: {
    recommendationCount: number;
    averageConfidence: ConfidenceScore;
    engineAgreement: AgreementScore;
    uncertaintyLevel: 'low' | 'medium' | 'high';
    stabilityScore: ConfidenceScore;
  };

  // Contradictions summary
  contradictionsSummary: {
    totalConflicts: number;
    resolved: number;
    flagged: number;
    requiresAttention: boolean;
  };

  // Next steps
  nextSteps: string[];

  // Meta
  fusionVersion: string;
  processingTime: number; // milliseconds
}

// ============================================================================
// RANKING RESULTS
// ============================================================================

export interface RankingResult {
  rankedRecommendations: FusedRecommendation[];

  // Ranking quality metrics
  quality: {
    diversity: Weight;
    coverage: Weight;
    balance: Weight;
  };

  // Stability
  stability: {
    score: ConfidenceScore;
    previousRankings: Array<{
      careerId: string;
      rank: number;
      score: number;
    }>;
  };

  // Comparison
  comparison: {
    vsPsychologyOnly: AgreementScore;
    vsCareerOnly: AgreementScore;
    vsMentorOnly: AgreementScore;
    vsLearningOnly: AgreementScore;
  };
}

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface FusionConfig {
  // Weight configuration
  defaultWeights: {
    psychology: Weight;
    career: Weight;
    mentor: Weight;
    learning: Weight;
    contradiction: Weight;
  };

  // Confidence thresholds
  confidenceThresholds: {
    high: ConfidenceScore;
    medium: ConfidenceScore;
    low: ConfidenceScore;
  };

  // Agreement thresholds
  agreementThresholds: {
    strong: AgreementScore;
    moderate: AgreementScore;
    weak: AgreementScore;
  };

  // Ranking configuration
  ranking: {
    minRecommendations: number;
    maxRecommendations: number;
    diversityBonus: Weight;
  };

  // Explanation configuration
  explanation: {
    includeDetailed: boolean;
    maxReasoningPoints: number;
    includeWarnings: boolean;
  };
}

export const DEFAULT_FUSION_CONFIG: FusionConfig = {
  defaultWeights: {
    psychology: 0.25,
    career: 0.25,
    mentor: 0.20,
    learning: 0.20,
    contradiction: 0.10,
  },
  confidenceThresholds: {
    high: 80,
    medium: 60,
    low: 40,
  },
  agreementThresholds: {
    strong: 75,
    moderate: 50,
    weak: 25,
  },
  ranking: {
    minRecommendations: 3,
    maxRecommendations: 10,
    diversityBonus: 0.1,
  },
  explanation: {
    includeDetailed: true,
    maxReasoningPoints: 5,
    includeWarnings: true,
  },
};

// ============================================================================
// EVENTS
// ============================================================================

export type FusionEventType =
  | 'fusion-started'
  | 'weights-calculated'
  | 'recommendations-fused'
  | 'confidence-calculated'
  | 'ranking-completed'
  | 'explanation-generated'
  | 'contradiction-detected'
  | 'fusion-completed'
  | 'low-confidence-flagged'
  | 'high-agreement-achieved';

export interface FusionEvent {
  type: FusionEventType;
  timestamp: FusionTimestamp;
  studentId: string;
  data: Record<string, unknown>;
}
