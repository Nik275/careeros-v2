/**
 * CareerOS Decision Context Engine - Types
 *
 * Decision Context System
 *
 * Captures the situational context of a student's career decision-making.
 * Context is separate from Archetype - they operate on different dimensions.
 *
 * @module context-types
 * @version 1.0.0
 */

/**
 * Decision context types.
 *
 * Represents the situational context influencing career decisions.
 * A student can have multiple simultaneous contexts (e.g., JEE + Startup Exploration).
 *
 * @enum {string}
 */
export type DecisionContextType =
  | 'JEE_PREPARATION'
  | 'NEET_PREPARATION'
  | 'UPSC_PREPARATION'
  | 'CA_PATHWAY'
  | 'COLLEGE_SELECTION'
  | 'CAREER_EXPLORATION'
  | 'CAREER_SWITCH'
  | 'EARLY_CAREER'
  | 'MID_CAREER'
  | 'STARTUP_EXPLORATION'
  | 'FAMILY_BUSINESS'
  | 'REGIONAL_CONSTRAINT';

/**
 * All decision context types as an array.
 * Used for iteration and validation.
 */
export const ALL_DECISION_CONTEXT_TYPES: DecisionContextType[] = [
  'JEE_PREPARATION',
  'NEET_PREPARATION',
  'UPSC_PREPARATION',
  'CA_PATHWAY',
  'COLLEGE_SELECTION',
  'CAREER_EXPLORATION',
  'CAREER_SWITCH',
  'EARLY_CAREER',
  'MID_CAREER',
  'STARTUP_EXPLORATION',
  'FAMILY_BUSINESS',
  'REGIONAL_CONSTRAINT',
];

/**
 * Human-readable labels for each context type.
 */
export const CONTEXT_TYPE_LABELS: Record<DecisionContextType, string> = {
  JEE_PREPARATION: 'JEE Preparation',
  NEET_PREPARATION: 'NEET Preparation',
  UPSC_PREPARATION: 'UPSC Preparation',
  CA_PATHWAY: 'CA Pathway',
  COLLEGE_SELECTION: 'College Selection',
  CAREER_EXPLORATION: 'Career Exploration',
  CAREER_SWITCH: 'Career Switch',
  EARLY_CAREER: 'Early Career',
  MID_CAREER: 'Mid Career',
  STARTUP_EXPLORATION: 'Startup Exploration',
  FAMILY_BUSINESS: 'Family Business',
  REGIONAL_CONSTRAINT: 'Regional Constraint',
};

/**
 * Context category for grouping related contexts.
 */
export type ContextCategory =
  | 'EXAM_PREPARATION'
  | 'EDUCATION_SELECTION'
  | 'CAREER_TRANSITION'
  | 'CAREER_STAGE'
  | 'EXPLORATION'
  | 'CONSTRAINT';

/**
 * Category mapping for each context type.
 */
export const CONTEXT_CATEGORIES: Record<DecisionContextType, ContextCategory> = {
  JEE_PREPARATION: 'EXAM_PREPARATION',
  NEET_PREPARATION: 'EXAM_PREPARATION',
  UPSC_PREPARATION: 'EXAM_PREPARATION',
  CA_PATHWAY: 'EDUCATION_SELECTION',
  COLLEGE_SELECTION: 'EDUCATION_SELECTION',
  CAREER_EXPLORATION: 'EXPLORATION',
  CAREER_SWITCH: 'CAREER_TRANSITION',
  EARLY_CAREER: 'CAREER_STAGE',
  MID_CAREER: 'CAREER_STAGE',
  STARTUP_EXPLORATION: 'EXPLORATION',
  FAMILY_BUSINESS: 'CONSTRAINT',
  REGIONAL_CONSTRAINT: 'CONSTRAINT',
};

/**
 * Time horizon for the context.
 * Indicates how immediate the decision is.
 */
export type ContextTimeHorizon =
  | 'IMMEDIATE'      // Decision needed within weeks
  | 'SHORT_TERM'     // Decision needed within months
  | 'MEDIUM_TERM'    // Decision needed within 1-2 years
  | 'LONG_TERM';     // Decision needed in 2+ years

/**
 * Time horizon mapping for each context type.
 */
export const CONTEXT_TIME_HORIZONS: Record<DecisionContextType, ContextTimeHorizon> = {
  JEE_PREPARATION: 'SHORT_TERM',
  NEET_PREPARATION: 'SHORT_TERM',
  UPSC_PREPARATION: 'MEDIUM_TERM',
  CA_PATHWAY: 'MEDIUM_TERM',
  COLLEGE_SELECTION: 'SHORT_TERM',
  CAREER_EXPLORATION: 'MEDIUM_TERM',
  CAREER_SWITCH: 'MEDIUM_TERM',
  EARLY_CAREER: 'SHORT_TERM',
  MID_CAREER: 'MEDIUM_TERM',
  STARTUP_EXPLORATION: 'MEDIUM_TERM',
  FAMILY_BUSINESS: 'LONG_TERM',
  REGIONAL_CONSTRAINT: 'LONG_TERM',
};

/**
 * Priority level for the context.
 * Indicates how dominant this context is in decision-making.
 */
export type ContextPriority = 'PRIMARY' | 'SECONDARY' | 'TERTIARY' | 'BACKGROUND';

/**
 * Evidence source for context detection.
 */
export type ContextEvidenceSource =
  | 'EDUCATION_DATA'
  | 'ASSESSMENT_ANSWERS'
  | 'PROFILE_DATA'
  | 'EXPLICIT_GOALS'
  | 'BEHAVIORAL_SIGNALS'
  | 'TIMESTAMP_DATA'
  | 'GEOGRAPHIC_DATA'
  | 'DEMOGRAPHIC_DATA';

/**
 * Individual piece of evidence supporting a context.
 */
export interface ContextEvidence {
  /**
   * Unique identifier for this evidence.
   */
  readonly evidenceId: string;

  /**
   * The context this evidence supports.
   */
  readonly context: DecisionContextType;

  /**
   * Source of the evidence.
   */
  readonly source: ContextEvidenceSource;

  /**
   * Evidence strength (0-100).
   */
  readonly strength: number;

  /**
   * Description of what triggered this evidence.
   */
  readonly description: string;

  /**
   * Raw data that generated this evidence.
   */
  readonly rawData?: unknown;

  /**
   * Timestamp when evidence was collected.
   */
  readonly collectedAt: Date;
}

/**
 * Confidence metrics for a context.
 */
export interface ContextConfidence {
  /**
   * Overall confidence score (0-100).
   */
  readonly score: number;

  /**
   * Number of evidence points supporting this context.
   */
  readonly evidenceCount: number;

  /**
   * Evidence strength distribution.
   */
  readonly evidenceStrength: {
    readonly strong: number;    // 70-100
    readonly moderate: number;  // 40-69
    readonly weak: number;      // 0-39
  };

  /**
   * Source diversity score (0-100).
   * Higher means evidence from more different sources.
   */
  readonly sourceDiversity: number;

  /**
   * Uncertainty factors.
   */
  readonly uncertaintyFactors: string[];

  /**
   * Reliability classification.
   */
  readonly reliability: 'HIGH' | 'MODERATE' | 'LOW' | 'UNRELIABLE';
}

/**
 * Single detected context with full metadata.
 */
export interface DetectedContext {
  /**
   * The detected context type.
   */
  readonly context: DecisionContextType;

  /**
   * Priority level of this context.
   */
  readonly priority: ContextPriority;

  /**
   * Confidence metrics.
   */
  readonly confidence: ContextConfidence;

  /**
   * Evidence supporting this detection.
   */
  readonly evidence: ContextEvidence[];

  /**
   * Time horizon for this context.
   */
  readonly timeHorizon: ContextTimeHorizon;

  /**
   * Category of this context.
   */
  readonly category: ContextCategory;

  /**
   * Whether this context is in conflict with others.
   */
  readonly hasConflicts: boolean;

  /**
   * Conflicting contexts (if any).
   */
  readonly conflictingContexts?: DecisionContextType[];
}

/**
 * Complete context profile for a student.
 */
export interface ContextProfile {
  /**
   * Unique identifier for this context profile.
   */
  readonly profileId: string;

  /**
   * Primary context - the dominant decision context.
   */
  readonly primaryContext: DetectedContext;

  /**
   * Secondary contexts - supporting or related contexts.
   */
  readonly secondaryContexts: DetectedContext[];

  /**
   * All detected contexts (primary + secondary).
   */
  readonly allContexts: DetectedContext[];

  /**
   * Contexts that were explicitly ruled out.
   */
  readonly excludedContexts: DecisionContextType[];

  /**
   * Overall profile confidence.
   */
  readonly overallConfidence: number;

  /**
   * Whether the profile is complete enough for decision support.
   */
  readonly isDecisionReady: boolean;

  /**
   * Timestamp when profile was created/updated.
   */
  readonly assessedAt: Date;
}

/**
 * Input data for context detection.
 */
export interface ContextDetectionInput {
  /**
   * Profile identifier.
   */
  readonly profileId: string;

  /**
   * Student education data.
   */
  readonly educationData: {
    readonly currentLevel: 'SCHOOL' | 'HIGH_SCHOOL' | 'UNDERGRADUATE' | 'POSTGRADUATE' | 'WORKING';
    readonly institutionType?: string;
    readonly currentYear?: number;
    readonly subjects?: string[];
    readonly grades?: Record<string, number>;
    readonly competitiveExamHistory?: Array<{
      readonly exam: string;
      readonly year: number;
      readonly rank?: number;
      readonly score?: number;
      readonly status: 'PREPARING' | 'APPEARED' | 'QUALIFIED' | 'RANKED';
    }>;
  };

  /**
   * Assessment responses.
   */
  readonly assessmentResponses?: {
    readonly careerGoals?: string[];
    readonly timelinePreferences?: string[];
    readonly constraintIndicators?: string[];
    readonly explorationSignals?: string[];
  };

  /**
   * Profile data.
   */
  readonly profileData?: {
    readonly age: number;
    readonly location: {
      readonly city: string;
      readonly state: string;
      readonly tier: 'TIER_1' | 'TIER_2' | 'TIER_3' | 'RURAL';
    };
    readonly familyBackground?: {
      readonly hasFamilyBusiness: boolean;
      readonly businessType?: string;
      readonly expectedToJoin: boolean;
    };
    readonly financialConstraints?: {
      readonly needsScholarship: boolean;
      readonly budgetLimitations: boolean;
      readonly canRelocate: boolean;
    };
  };

  /**
   * Explicit goals stated by student.
   */
  readonly explicitGoals?: {
    readonly shortTerm?: string[];
    readonly mediumTerm?: string[];
    readonly longTerm?: string[];
    readonly examsTargeted?: string[];
    readonly careersConsidering?: string[];
  };

  /**
   * Behavioral signals.
   */
  readonly behavioralSignals?: {
    readonly sessionPatterns?: string[];
    readonly contentEngagement?: Record<string, number>;
    readonly searchQueries?: string[];
  };

  /**
   * Timestamp of current assessment.
   */
  readonly assessmentTimestamp: Date;
}

/**
 * Result of context detection.
 */
export interface ContextDetectionResult {
  /**
   * Whether detection succeeded.
   */
  readonly success: boolean;

  /**
   * Context profile (if successful).
   */
  readonly profile?: ContextProfile;

  /**
   * Error information (if failed).
   */
  readonly error?: {
    readonly code: ContextDetectionErrorCode;
    readonly message: string;
  };
}

/**
 * Error codes for context detection.
 */
export type ContextDetectionErrorCode =
  | 'INSUFFICIENT_DATA'
  | 'CONFLICTING_CONTEXTS'
  | 'DETECTION_FAILED'
  | 'VALIDATION_ERROR';

/**
 * Context explanation - human-readable explanation of why context was detected.
 */
export interface ContextExplanation {
  /**
   * The context being explained.
   */
  readonly context: DecisionContextType;

  /**
   * Summary explanation.
   */
  readonly summary: string;

  /**
   * Detailed explanation of detection reasoning.
   */
  readonly detailedExplanation: string;

  /**
   * Key indicators that triggered this detection.
   */
  readonly keyIndicators: string[];

  /**
   * Evidence summary.
   */
  readonly evidenceSummary: string;

  /**
   * Confidence explanation.
   */
  readonly confidenceExplanation: string;

  /**
   * Implications for career decisions.
   */
  readonly decisionImplications: string[];

  /**
   * Recommended next steps.
   */
  readonly recommendedActions: string[];
}

/**
 * Complete explanation for a context profile.
 */
export interface ContextProfileExplanation {
  /**
   * Overall narrative.
   */
  readonly overallNarrative: string;

  /**
   * Primary context explanation.
   */
  readonly primaryExplanation: ContextExplanation;

  /**
   * Secondary context explanations.
   */
  readonly secondaryExplanations: ContextExplanation[];

  /**
   * How contexts interact.
   */
  readonly contextInteractions: string[];

  /**
   * Priority guidance.
   */
  readonly priorityGuidance: string;

  /**
   * Conflicts and resolutions.
   */
  readonly conflictResolution?: string;
}

/**
 * Indicator definition for context detection.
 */
export interface ContextIndicator {
  /**
   * Unique identifier.
   */
  readonly id: string;

  /**
   * Context this indicator detects.
   */
  readonly context: DecisionContextType;

  /**
   * Human-readable description.
   */
  readonly description: string;

  /**
   * Evidence source.
   */
  readonly source: ContextEvidenceSource;

  /**
   * Detection function.
   * Returns strength (0-100) if indicator is present, 0 otherwise.
   */
  readonly detect: (input: ContextDetectionInput) => number;

  /**
   * Weight of this indicator (0-1).
   */
  readonly weight: number;

  /**
   * Whether this is a strong indicator (vs. weak signal).
   */
  readonly isStrongIndicator: boolean;
}

/**
 * Scoring configuration for context detection.
 */
export interface ContextScoringConfig {
  /**
   * Minimum evidence count for valid detection.
   */
  readonly minEvidenceCount: number;

  /**
   * Minimum confidence for primary context.
   */
  readonly minPrimaryConfidence: number;

  /**
   * Minimum confidence for secondary context.
   */
  readonly minSecondaryConfidence: number;

  /**
   * Gap required between primary and secondary.
   */
  readonly primarySecondaryGap: number;

  /**
   * Source weights.
   */
  readonly sourceWeights: Record<ContextEvidenceSource, number>;

  /**
   * Maximum number of contexts to return.
   */
  readonly maxContexts: number;
}

/**
 * Default scoring configuration.
 */
export const DEFAULT_CONTEXT_SCORING_CONFIG: ContextScoringConfig = {
  minEvidenceCount: 2,
  minPrimaryConfidence: 60,
  minSecondaryConfidence: 40,
  primarySecondaryGap: 15,
  sourceWeights: {
    EDUCATION_DATA: 1.0,
    ASSESSMENT_ANSWERS: 0.9,
    PROFILE_DATA: 0.8,
    EXPLICIT_GOALS: 0.95,
    BEHAVIORAL_SIGNALS: 0.6,
    TIMESTAMP_DATA: 0.5,
    GEOGRAPHIC_DATA: 0.7,
    DEMOGRAPHIC_DATA: 0.4,
  },
  maxContexts: 3,
};

/**
 * Calculates reliability from confidence score.
 *
 * @param score - Confidence score (0-100)
 * @returns Reliability classification
 */
export function calculateReliability(score: number): ContextConfidence['reliability'] {
  if (score >= 75) return 'HIGH';
  if (score >= 50) return 'MODERATE';
  if (score >= 30) return 'LOW';
  return 'UNRELIABLE';
}

/**
 * Checks if input has sufficient data for detection.
 *
 * @param input - Detection input
 * @returns Whether sufficient data exists
 */
export function hasSufficientData(input: ContextDetectionInput): boolean {
  let score = 0;

  // Education data
  if (input.educationData) score += 2;

  // Explicit goals
  if (input.explicitGoals?.examsTargeted?.length) score += 2;
  if (input.explicitGoals?.careersConsidering?.length) score += 1;

  // Profile data
  if (input.profileData?.age) score += 1;
  if (input.profileData?.location) score += 1;

  // Assessment responses
  if (input.assessmentResponses) score += 1;

  return score >= 4;
}

/**
 * Gets all contexts in a category.
 *
 * @param category - Context category
 * @returns Context types in that category
 */
export function getContextsInCategory(category: ContextCategory): DecisionContextType[] {
  return ALL_DECISION_CONTEXT_TYPES.filter(
    (ctx) => CONTEXT_CATEGORIES[ctx] === category
  );
}

/**
 * Checks if two contexts can coexist.
 *
 * @param ctx1 - First context
 * @param ctx2 - Second context
 * @returns Whether they can coexist
 */
export function canCoexist(ctx1: DecisionContextType, ctx2: DecisionContextType): boolean {
  // Same contexts can't coexist
  if (ctx1 === ctx2) return false;

  // Exam preparations generally don't coexist with each other
  const examContexts = getContextsInCategory('EXAM_PREPARATION');
  if (examContexts.includes(ctx1) && examContexts.includes(ctx2)) {
    return false;
  }

  // Career stages don't coexist
  const stageContexts = getContextsInCategory('CAREER_STAGE');
  if (stageContexts.includes(ctx1) && stageContexts.includes(ctx2)) {
    return false;
  }

  // Education selections can coexist with exam prep
  // Exploration can coexist with most things
  // Constraints can coexist with anything

  return true;
}
