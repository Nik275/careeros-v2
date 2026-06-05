/**
 * Career Criticality Types
 *
 * Phase 8.6: Career Criticality Engine
 *
 * Core data structures for understanding how much a decision matters,
 * how it constrains future paths, and what flexibility remains.
 *
 * @module criticality-types
 * @version 1.0.0
 */

// ============================================================================
// DECISION CATEGORIES
// ============================================================================

/**
 * Types of decisions that have varying levels of criticality
 */
export type CriticalityDecisionType =
  | 'MAJOR_SELECTION'
  | 'DEGREE_SELECTION'
  | 'COLLEGE_SELECTION'
  | 'CAREER_SELECTION'
  | 'DROP_YEAR_DECISION'
  | 'STUDY_ABROAD_DECISION'
  | 'ENTREPRENEURSHIP_DECISION'
  | 'JOB_ACCEPTANCE'
  | 'CAREER_SWITCHING'
  | 'GRADUATE_EDUCATION'
  | 'SPECIALIZATION_CHOICE'
  | 'LOCATION_DECISION';

/**
 * Criticality band - how much a decision matters
 */
export type CriticalityBand =
  | 'VERY_LOW'
  | 'LOW'
  | 'MODERATE'
  | 'HIGH'
  | 'VERY_HIGH'
  | 'CRITICAL';

// ============================================================================
// PATH DEPENDENCY ANALYSIS
// ============================================================================

/**
 * Analysis of how much a decision constrains future options
 */
export interface PathDependencyAnalysis {
  /** Score 0-1 indicating path dependency (0 = flexible, 1 = locked) */
  dependencyScore: number;
  /** Human-readable constraint level */
  futureConstraintLevel: 'MINIMAL' | 'MODERATE' | 'SIGNIFICANT' | 'SEVERE';
  /** How reversible this path dependency is */
  reversibility: 'EASY' | 'MODERATE' | 'DIFFICULT' | 'VERY_DIFFICULT' | 'NEARLY_IMPOSSIBLE';
  /** Evidence supporting this analysis */
  evidence: PathDependencyEvidence[];
  /** Years until the path becomes less constraining */
  constraintDuration: number;
  /** Alternative paths that remain open */
  alternativePaths: string[];
}

/**
 * Evidence for path dependency
 */
export interface PathDependencyEvidence {
  type: 'DEGREE_REQUIREMENT' | 'CERTIFICATION_NEEDED' | 'TIME_INVESTMENT' | 'SKILL_SPECIALIZATION' | 'NETWORK_EFFECTS';
  description: string;
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
}

// ============================================================================
// OPTION CLOSURE ANALYSIS
// ============================================================================

/**
 * Analysis of future opportunities affected by a decision
 */
export interface OptionClosureAnalysis {
  /** Number of future paths opened by this decision */
  doorsOpened: number;
  /** Number of future paths closed by this decision */
  doorsClosed: number;
  /** Difficulty of pivoting away from this path */
  pivotDifficulty: 'EASY' | 'MODERATE' | 'HARD' | 'VERY_HARD';
  /** How much future options are restricted */
  futureRestriction: 'MINIMAL' | 'SOME' | 'SIGNIFICANT' | 'SEVERE';
  /** Specific opportunities lost */
  opportunitiesLost: LostOpportunity[];
  /** Specific opportunities gained */
  opportunitiesGained: GainedOpportunity[];
  /** Time to recover closed options (years) */
  recoveryTimeEstimate: number;
}

/**
 * An opportunity that becomes unavailable
 */
export interface LostOpportunity {
  name: string;
  category: 'CAREER' | 'EDUCATION' | 'LIFESTYLE' | 'LOCATION' | 'TIMING';
  reason: string;
  reversibility: 'REVERSIBLE' | 'PARTIALLY_REVERSIBLE' | 'IRREVERSIBLE';
}

/**
 * An opportunity that becomes available
 */
export interface GainedOpportunity {
  name: string;
  category: 'CAREER' | 'EDUCATION' | 'LIFESTYLE' | 'LOCATION' | 'NETWORK';
  value: 'LOW' | 'MEDIUM' | 'HIGH';
}

// ============================================================================
// FUTURE FLEXIBILITY ANALYSIS
// ============================================================================

/**
 * Analysis of remaining adaptability after a decision
 */
export interface FutureFlexibilityAnalysis {
  /** Overall flexibility score 0-100 */
  futureFlexibilityScore: number;
  /** Capacity to pivot careers */
  careerPivotCapacity: 'HIGH' | 'MODERATE' | 'LOW' | 'VERY_LOW';
  /** Capacity to explore new areas */
  explorationCapacity: 'HIGH' | 'MODERATE' | 'LOW' | 'VERY_LOW';
  /** Ability to move between domains */
  crossDomainMobility: 'HIGH' | 'MODERATE' | 'LOW' | 'VERY_LOW';
  /** Years until next major decision point */
  nextDecisionWindow: number;
  /** Flexibility preservation strategies */
  preservationStrategies: string[];
}

// ============================================================================
// CRITICALITY ANALYSIS
// ============================================================================

/**
 * Complete criticality analysis for a decision
 */
export interface CriticalityAnalysis {
  /** Unique identifier */
  id: string;
  /** Decision being analyzed */
  decisionType: CriticalityDecisionType;
  /** Overall criticality score 0-100 */
  criticalityScore: number;
  /** Criticality band */
  criticalityBand: CriticalityBand;
  /** Human-readable reason for criticality */
  criticalityReason: string;
  /** Impact on future opportunities */
  futureImpact: 'MINIMAL' | 'MODERATE' | 'SIGNIFICANT' | 'TRANSFORMATIVE';
  /** How much optionality is lost */
  optionalityLoss: 'MINIMAL' | 'SOME' | 'SUBSTANTIAL' | 'SEVERE';
  /** Relative weight of this decision */
  decisionWeight: 'LIGHT' | 'MODERATE' | 'HEAVY' | 'VERY_HEAVY';
  /** Component analyses */
  pathDependency: PathDependencyAnalysis;
  optionClosure: OptionClosureAnalysis;
  futureFlexibility: FutureFlexibilityAnalysis;
  /** Timestamp */
  timestamp: Date;
}

// ============================================================================
// CRITICALITY REPORT
// ============================================================================

/**
 * Comprehensive criticality report
 */
export interface CriticalityReport {
  /** Report ID */
  id: string;
  /** Analysis results */
  analysis: CriticalityAnalysis;
  /** Human-readable summary */
  summary: string;
  /** Student-friendly explanation */
  studentExplanation: string;
  /** Mentor talking points */
  mentorTalkingPoints: string[];
  /** Recommended actions */
  recommendations: CriticalityRecommendation[];
  /** Risk factors */
  riskFactors: string[];
  /** Mitigation strategies */
  mitigationStrategies: string[];
  /** Timestamp */
  generatedAt: Date;
}

/**
 * Recommendation based on criticality analysis
 */
export interface CriticalityRecommendation {
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  action: string;
  rationale: string;
  timeframe: string;
}

// ============================================================================
// ENGINE INPUT/OUTPUT
// ============================================================================

/**
 * Input for criticality analysis
 */
export interface CriticalityInput {
  /** Type of decision */
  decisionType: CriticalityDecisionType;
  /** Description of the specific decision */
  description: string;
  /** Options being considered */
  options: CriticalityOption[];
  /** Student's current context */
  context: CriticalityContext;
  /** Student profile info */
  studentProfile: {
    currentEducation: string;
    fieldOfStudy?: string;
    yearsOfExperience?: number;
    age?: number;
  };
}

/**
 * An option being evaluated
 */
export interface CriticalityOption {
  id: string;
  name: string;
  description: string;
  type: 'EDUCATION' | 'CAREER' | 'LOCATION' | 'LIFESTYLE' | 'OTHER';
  duration?: number; // months
  cost?: number;
  specializationLevel?: 'GENERAL' | 'MODERATE' | 'SPECIALIZED' | 'HIGHLY_SPECIALIZED';
}

/**
 * Context for criticality analysis
 */
export interface CriticalityContext {
  /** Time pressure */
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  /** Resources available */
  resources: 'LIMITED' | 'MODERATE' | 'ABUNDANT';
  /** Family/social constraints */
  constraints: string[];
  /** Previous similar decisions */
  priorDecisions: string[];
  /** Risk tolerance */
  riskTolerance: 'LOW' | 'MODERATE' | 'HIGH';
}

// ============================================================================
// DECISION-SPECIFIC CRITICALITY DATA
// ============================================================================

/**
 * Criticality weights for different decision types
 */
export interface DecisionTypeCriticality {
  type: CriticalityDecisionType;
  baseCriticality: number;
  timeSensitivity: number;
  reversibilityDifficulty: number;
  pathDependencyWeight: number;
  explanation: string;
}

// ============================================================================
// COMPARATIVE ANALYSIS
// ============================================================================

/**
 * Comparison of criticality across multiple options
 */
export interface CriticalityComparison {
  options: Array<{
    optionId: string;
    optionName: string;
    criticalityScore: number;
    criticalityBand: CriticalityBand;
    keyConstraint: string;
  }>;
  lowestCriticalityOption: string;
  highestCriticalityOption: string;
  recommendation: string;
}

// ============================================================================
// ENGINE CONFIGURATION
// ============================================================================

/**
 * Configuration for criticality engines
 */
export interface CriticalityEngineConfig {
  /** Weight for path dependency in overall score */
  pathDependencyWeight: number;
  /** Weight for option closure in overall score */
  optionClosureWeight: number;
  /** Weight for future flexibility in overall score */
  flexibilityWeight: number;
  /** Thresholds for criticality bands */
  bandThresholds: {
    veryLow: number;
    low: number;
    moderate: number;
    high: number;
    veryHigh: number;
  };
  /** Whether to include detailed explanations */
  includeExplanations: boolean;
  /** Whether to include mitigation strategies */
  includeMitigations: boolean;
}
