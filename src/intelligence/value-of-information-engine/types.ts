/**
 * CareerOS Value of Information Engine - Types
 *
 * Type definitions for identifying which additional information
 * would most improve decision quality.
 */

import type {
  StudentBeliefV3,
  ConfidenceScore,
} from '../types';

import type {
  UncertaintyProfile,
} from '../uncertainty-engine';

import type {
  InformationValueAnalysis,
  RecommendedAction,
} from '../information-value-engine';

import type {
  OptimalDecisionSet,
  DecisionOption,
} from '../decision-optimization-engine';

import type {
  ScenarioGenerationResult,
} from '../future-scenario';

// ============================================================================
// CORE PRIMITIVE TYPES
// ============================================================================

/**
 * Unique identifier for VoI analyses.
 */
export type VoIAnalysisId = string;

/**
 * Information gap category.
 */
export type InformationGapCategory =
  | 'interest'
  | 'aptitude'
  | 'values'
  | 'skills'
  | 'market'
  | 'identity'
  | 'constraints'
  | 'outcomes';

/**
 * Category labels for display.
 */
export const INFORMATION_GAP_CATEGORY_LABELS: Record<InformationGapCategory, string> = {
  interest: 'Career Interests',
  aptitude: 'Aptitudes & Abilities',
  values: 'Work Values',
  skills: 'Skills & Competencies',
  market: 'Market Understanding',
  identity: 'Professional Identity',
  constraints: 'Reality Constraints',
  outcomes: 'Outcome Expectations',
};

/**
 * Information acquisition method.
 */
export type InformationMethod =
  | 'assessment'
  | 'interview'
  | 'shadowing'
  | 'internship'
  | 'project'
  | 'course'
  | 'conversation'
  | 'research'
  | 'experiment'
  | 'reflection';

/**
 * Experiment type for hands-on learning.
 */
export type ExperimentType =
  | 'coding-project'
  | 'product-project'
  | 'research-project'
  | 'shadowing'
  | 'internship'
  | 'volunteering'
  | 'freelance'
  | 'startup-challenge'
  | 'case-competition'
  | 'portfolio-project';

// ============================================================================
// INFORMATION GAP
// ============================================================================

/**
 * Identified gap in student information that affects decision quality.
 */
export interface InformationGap {
  /** Unique identifier */
  id: string;

  /** Category of information gap */
  category: InformationGapCategory;

  /** Specific aspect within category */
  aspect: string;

  /** Current uncertainty level (0-1) */
  currentUncertainty: number;

  /** Potential uncertainty reduction (0-1) */
  potentialReduction: number;

  /** Impact on decision quality (0-1) */
  decisionImpact: number;

  /** Value of information score = uncertainty × impact */
  informationValue: number;

  /** Priority ranking */
  priority: 'critical' | 'high' | 'medium' | 'low';

  /** Human-readable explanation */
  explanation: string[];

  /** Evidence currently available */
  currentEvidence: string[];

  /** What evidence is missing */
  missingEvidence: string[];

  /** Related career paths affected */
  affectedPaths: string[];
}

// ============================================================================
// INFORMATION OPPORTUNITY
// ============================================================================

/**
 * Specific activity that can provide valuable information.
 */
export interface InformationOpportunity {
  /** Unique identifier */
  id: string;

  /** Activity name */
  activity: string;

  /** Type of information method */
  method: InformationMethod;

  /** Category of information gained */
  informationCategory: InformationGapCategory;

  /** Expected value of information (0-1) */
  informationValue: number;

  /** Expected confidence improvement (0-1) */
  confidenceGain: number;

  /** Expected utility improvement (0-1) */
  utilityImprovement: number;

  /** Expected decision quality improvement */
  decisionImprovement: number;

  /** Cost to acquire (time, money, effort) */
  acquisitionCost: {
    time: string;
    money?: string;
    effort: 'low' | 'medium' | 'high';
  };

  /** Prerequisites for this activity */
  prerequisites: string[];

  /** Risks or barriers */
  risks: string[];

  /** Alternative activities if this is not feasible */
  alternatives: string[];

  /** Primary reasoning for recommendation */
  recommendationReason: string[];

  /** Which gaps this addresses */
  addressesGaps: string[];

  /** Rank among all opportunities */
  rank: number;
}

// ============================================================================
// EXPERIMENT RECOMMENDATION
// ============================================================================

/**
 * Recommended hands-on experiment for information gathering.
 */
export interface ExperimentRecommendation {
  /** Unique identifier */
  id: string;

  /** Type of experiment */
  type: ExperimentType;

  /** Human-readable name */
  name: string;

  /** Detailed description */
  description: string;

  /** What this experiment reveals */
  reveals: InformationGapCategory[];

  /** Specific skills/traits assessed */
  assesses: string[];

  /** How to conduct the experiment */
  howTo: {
    steps: string[];
    resources: string[];
    timeline: string;
    successCriteria: string[];
  };

  /** Expected outcomes */
  expectedOutcomes: {
    informationValue: number;
    confidenceGain: number;
    skillDevelopment: string[];
  };

  /** Comparison to other methods */
  comparisonToAlternatives: {
    vsAssessment: string;
    vsInterview: string;
    vsCourse: string;
  };

  /** Information value */
  valueOfInformation: number;

  /** Priority */
  priority: 'critical' | 'high' | 'medium' | 'low';
}

// ============================================================================
// VALUE OF INFORMATION CALCULATION
// ============================================================================

/**
 * Calculated value of information for decision improvement.
 */
export interface ValueOfInformationCalculation {
  /** Gap being addressed */
  gapId: string;

  /** Current decision confidence without information */
  currentConfidence: number;

  /** Expected confidence with information */
  expectedConfidence: number;

  /** Confidence improvement */
  confidenceImprovement: number;

  /** Current expected utility */
  currentUtility: number;

  /** Expected utility with information */
  expectedUtility: number;

  /** Utility improvement */
  utilityImprovement: number;

  /** Decision quality improvement */
  decisionImprovement: number;

  /** Probability of changing decision */
  probabilityOfChange: number;

  /** Value of perfect information (upper bound) */
  valueOfPerfectInformation: number;

  /** Value of sample information (expected) */
  valueOfSampleInformation: number;

  /** Expected value of information (EVI) */
  evi: number;

  /** Net value after accounting for cost */
  netValue: number;
}

// ============================================================================
// EXPLANATION
// ============================================================================

/**
 * Explanation for VoI recommendations.
 */
export interface VoIExplanation {
  /** One-line summary */
  summary: string;

  /** Detailed explanation */
  detailedExplanation: string;

  /** Why this information is valuable */
  valueJustification: string[];

  /** Comparison to alternatives */
  comparisonToAlternatives: {
    activity: string;
    alternative: string;
    reasoning: string;
  }[];

  /** Expected impact on decision */
  expectedImpact: {
    confidence: string;
    utility: string;
    decision: string;
  };

  /** Confidence in this recommendation */
  confidence: number;
}

// ============================================================================
// REPORT
// ============================================================================

/**
 * Complete Value of Information report.
 */
export interface ValueOfInformationReport {
  /** Unique identifier */
  id: VoIAnalysisId;

  /** Timestamp */
  timestamp: number;

  /** Student reference */
  studentId: string;

  /** Current decision state */
  currentDecisionState: {
    topPath: string;
    confidence: number;
    utility: number;
    uncertainty: number;
  };

  /** Information gaps identified */
  informationGaps: InformationGap[];

  /** Highest-priority gaps */
  criticalGaps: InformationGap[];

  /** Information opportunities ranked */
  opportunities: InformationOpportunity[];

  /** Top opportunities by value */
  highestValueActivities: InformationOpportunity[];

  /** Experiment recommendations */
  recommendedExperiments: ExperimentRecommendation[];

  /** Expected improvements */
  expectedImprovements: {
    confidence: number;
    utility: number;
    decisionQuality: number;
  };

  /** Explanation */
  explanation: VoIExplanation;

  /** Action plan */
  actionPlan: {
    immediate: InformationOpportunity[];
    shortTerm: InformationOpportunity[];
    longTerm: InformationOpportunity[];
  };

  /** Comparison to gathering no information */
  valueVsNoInformation: {
    netValue: number;
    confidenceGain: number;
    utilityGain: number;
  };
}

// ============================================================================
// INPUTS
// ============================================================================

/**
 * Input for VoI analysis.
 */
export interface ValueOfInformationInput {
  /** Student belief state */
  studentBelief: StudentBeliefV3;

  /** Utility profile */
  utilityProfile: {
    attributes: Array<{
      id: string;
      name: string;
      weight: number;
    }>;
  };

  /** Decision intelligence results */
  decisionResults: OptimalDecisionSet;

  /** Uncertainty profile */
  uncertaintyProfile: UncertaintyProfile;

  /** Future simulation results */
  futureSimulation?: ScenarioGenerationResult;

  /** Previous information value analysis (optional) */
  previousAnalysis?: InformationValueAnalysis;

  /** Constraints on information gathering */
  constraints?: {
    maxTime?: string;
    maxCost?: string;
    excludedMethods?: InformationMethod[];
  };
}

// ============================================================================
// ENGINE CONFIGURATION
// ============================================================================

/**
 * Configuration for Value of Information Engine.
 */
export interface ValueOfInformationEngineConfig {
  /** Minimum uncertainty threshold to consider (0-1) */
  minUncertaintyThreshold: number;

  /** Minimum decision impact threshold (0-1) */
  minDecisionImpact: number;

  /** Maximum number of gaps to report */
  maxGaps: number;

  /** Maximum number of opportunities to report */
  maxOpportunities: number;

  /** Maximum number of experiments to recommend */
  maxExperiments: number;

  /** Weight for confidence in opportunity ranking */
  confidenceWeight: number;

  /** Weight for utility in opportunity ranking */
  utilityWeight: number;

  /** Weight for cost in opportunity ranking */
  costWeight: number;

  /** Target confidence level */
  targetConfidence: number;

  /** Enable explanation generation */
  enableExplanations: boolean;

  /** Prioritize quick wins */
  prioritizeQuickWins: boolean;
}

/**
 * Default configuration.
 */
export const DEFAULT_VOI_CONFIG: ValueOfInformationEngineConfig = {
  minUncertaintyThreshold: 0.2,
  minDecisionImpact: 0.15,
  maxGaps: 10,
  maxOpportunities: 15,
  maxExperiments: 5,
  confidenceWeight: 0.4,
  utilityWeight: 0.4,
  costWeight: 0.2,
  targetConfidence: 0.8,
  enableExplanations: true,
  prioritizeQuickWins: true,
};

// ============================================================================
// DETECTOR RESULTS
// ============================================================================

/**
 * Results from gap detection.
 */
export interface GapDetectionResult {
  /** All detected gaps */
  gaps: InformationGap[];

  /** Gaps by category */
  gapsByCategory: Record<InformationGapCategory, InformationGap[]>;

  /** Summary statistics */
  statistics: {
    totalGaps: number;
    criticalGaps: number;
    highGaps: number;
    averageUncertainty: number;
    highestImpactCategory: InformationGapCategory | null;
  };
}

/**
 * Results from prioritization.
 */
export interface PrioritizationResult {
  /** Ranked opportunities */
  rankedOpportunities: InformationOpportunity[];

  /** Quick wins (high value, low cost) */
  quickWins: InformationOpportunity[];

  /** High impact opportunities */
  highImpact: InformationOpportunity[];

  /** Minimum viable set to reach target confidence */
  minimumViableSet: InformationOpportunity[];

  /** Expected confidence progression */
  confidenceProgression: Array<{
    step: number;
    activity: string;
    cumulativeConfidence: number;
  }>;
}

/**
 * Results from experiment recommendation.
 */
export interface ExperimentRecommendationResult {
  /** All experiment recommendations */
  experiments: ExperimentRecommendation[];

  /** By experiment type */
  byType: Record<ExperimentType, ExperimentRecommendation[]>;

  /** By information category */
  byCategory: Record<InformationGapCategory, ExperimentRecommendation[]>;

  /** Top recommendation */
  topRecommendation: ExperimentRecommendation | null;
}
