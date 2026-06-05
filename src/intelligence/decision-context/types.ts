/**
 * Decision Context Engine - Type Definitions
 * 
 * This module defines the complete type system for detecting and analyzing
 * a student's decision context. Context represents the current life situation
 * that influences career decisions (e.g., JEE preparation, career switching).
 * 
 * Context is SEPARATE from Archetype:
 * - Context = Current life situation (situational, temporary)
 * - Archetype = Behavioral pattern (personality-based, stable)
 * 
 * @module intelligence/decision-context
 */

import { StudentProfile } from '@/domains/student/StudentProfile';
import { AssessmentResponse } from '@/types/assessment';

// ============================================================================
// CONTEXT TYPE ENUMERATIONS
// ============================================================================

/**
 * Primary decision contexts that influence career decision-making.
 * 
 * These represent the student's CURRENT situation, not their personality.
 * A student can have multiple contexts simultaneously (e.g., JEE aspirant
 * also exploring startups).
 * 
 * NOTE: These are intentionally extensible. New contexts can be added
 * without breaking existing detection logic.
 */
export enum DecisionContextType {
  // Engineering Entrance Focus
  JEE_PREPARATION = 'JEE_PREPARATION',
  
  // Medical Entrance Focus  
  NEET_PREPARATION = 'NEET_PREPARATION',
  
  // Civil Services Focus
  UPSC_PREPARATION = 'UPSC_PREPARATION',
  STATE_PSC_PREPARATION = 'STATE_PSC_PREPARATION',
  
  // Professional Qualification Paths
  CA_PATHWAY = 'CA_PATHWAY',
  CS_PATHWAY = 'CS_PATHWAY',
  CMA_PATHWAY = 'CMA_PATHWAY',
  
  // Education Selection Phase
  COLLEGE_SELECTION = 'COLLEGE_SELECTION',
  SCHOOL_SELECTION = 'SCHOOL_SELECTION',
  COURSE_SELECTION = 'COURSE_SELECTION',
  
  // Career Exploration Phases
  CAREER_EXPLORATION = 'CAREER_EXPLORATION',
  EARLY_CAREER = 'EARLY_CAREER',
  MID_CAREER = 'MID_CAREER',
  
  // Career Transition
  CAREER_SWITCH = 'CAREER_SWITCH',
  INDUSTRY_TRANSITION = 'INDUSTRY_TRANSITION',
  
  // Entrepreneurial
  STARTUP_EXPLORATION = 'STARTUP_EXPLORATION',
  ENTREPRENEURSHIP_BUILDING = 'ENTREPRENEURSHIP_BUILDING',
  
  // Family Context
  FAMILY_BUSINESS = 'FAMILY_BUSINESS',
  
  // Constraint-Driven
  REGIONAL_CONSTRAINT = 'REGIONAL_CONSTRAINT',
  FINANCIAL_CONSTRAINT = 'FINANCIAL_CONSTRAINT',
  TIME_CONSTRAINT = 'TIME_CONSTRAINT',
  
  // Future Extensibility Markers
  // MBA_PREP = 'MBA_PREP',
  // INTERNATIONAL_EDUCATION = 'INTERNATIONAL_EDUCATION',
  // GOVERNMENT_JOB = 'GOVERNMENT_JOB',
  // MEDICAL_SPECIALIZATION = 'MEDICAL_SPECIALIZATION',
}

/**
 * Categories for organizing context types.
 * Useful for UI grouping and analysis aggregation.
 */
export enum ContextCategory {
  ENTRANCE_EXAM = 'ENTRANCE_EXAM',
  PROFESSIONAL_QUALIFICATION = 'PROFESSIONAL_QUALIFICATION',
  EDUCATION_SELECTION = 'EDUCATION_SELECTION',
  CAREER_PHASE = 'CAREER_PHASE',
  CAREER_TRANSITION = 'CAREER_TRANSITION',
  ENTREPRENEURIAL = 'ENTREPRENEURIAL',
  FAMILY_CONTEXT = 'FAMILY_CONTEXT',
  CONSTRAINT_DRIVEN = 'CONSTRAINT_DRIVEN',
}

/**
 * Maps each context type to its category.
 */
export const CONTEXT_TYPE_CATEGORIES: Record<DecisionContextType, ContextCategory> = {
  [DecisionContextType.JEE_PREPARATION]: ContextCategory.ENTRANCE_EXAM,
  [DecisionContextType.NEET_PREPARATION]: ContextCategory.ENTRANCE_EXAM,
  [DecisionContextType.UPSC_PREPARATION]: ContextCategory.ENTRANCE_EXAM,
  [DecisionContextType.STATE_PSC_PREPARATION]: ContextCategory.ENTRANCE_EXAM,
  
  [DecisionContextType.CA_PATHWAY]: ContextCategory.PROFESSIONAL_QUALIFICATION,
  [DecisionContextType.CS_PATHWAY]: ContextCategory.PROFESSIONAL_QUALIFICATION,
  [DecisionContextType.CMA_PATHWAY]: ContextCategory.PROFESSIONAL_QUALIFICATION,
  
  [DecisionContextType.COLLEGE_SELECTION]: ContextCategory.EDUCATION_SELECTION,
  [DecisionContextType.SCHOOL_SELECTION]: ContextCategory.EDUCATION_SELECTION,
  [DecisionContextType.COURSE_SELECTION]: ContextCategory.EDUCATION_SELECTION,
  
  [DecisionContextType.CAREER_EXPLORATION]: ContextCategory.CAREER_PHASE,
  [DecisionContextType.EARLY_CAREER]: ContextCategory.CAREER_PHASE,
  [DecisionContextType.MID_CAREER]: ContextCategory.CAREER_PHASE,
  
  [DecisionContextType.CAREER_SWITCH]: ContextCategory.CAREER_TRANSITION,
  [DecisionContextType.INDUSTRY_TRANSITION]: ContextCategory.CAREER_TRANSITION,
  
  [DecisionContextType.STARTUP_EXPLORATION]: ContextCategory.ENTREPRENEURIAL,
  [DecisionContextType.ENTREPRENEURSHIP_BUILDING]: ContextCategory.ENTREPRENEURIAL,
  
  [DecisionContextType.FAMILY_BUSINESS]: ContextCategory.FAMILY_CONTEXT,
  
  [DecisionContextType.REGIONAL_CONSTRAINT]: ContextCategory.CONSTRAINT_DRIVEN,
  [DecisionContextType.FINANCIAL_CONSTRAINT]: ContextCategory.CONSTRAINT_DRIVEN,
  [DecisionContextType.TIME_CONSTRAINT]: ContextCategory.CONSTRAINT_DRIVEN,
};

// ============================================================================
// EVIDENCE & SIGNAL TYPES
// ============================================================================

/**
 * Types of evidence that can support context detection.
 */
export enum EvidenceType {
  // Assessment-based evidence
  EXPLICIT_ANSWER = 'EXPLICIT_ANSWER',
  IMPLICIT_SIGNAL = 'IMPLICIT_SIGNAL',
  PATTERN_MATCH = 'PATTERN_MATCH',
  
  // Profile-based evidence
  EDUCATION_DATA = 'EDUCATION_DATA',
  EXPERIENCE_DATA = 'EXPERIENCE_DATA',
  GOAL_STATEMENT = 'GOAL_STATEMENT',
  
  // Behavioral evidence
  BROWSING_PATTERN = 'BROWSING_PATTERN',
  INTERACTION_HISTORY = 'INTERACTION_HISTORY',
  
  // User-declared
  USER_DECLARED = 'USER_DECLARED',
  
  // Inferred
  TEMPORAL_INFERENCE = 'TEMPORAL_INFERENCE',
  COMBINATORIAL_INFERENCE = 'COMBINATORIAL_INFERENCE',
}

/**
 * Strength of a piece of evidence.
 */
export enum EvidenceStrength {
  WEAK = 0.3,
  MODERATE = 0.6,
  STRONG = 0.9,
  DEFINITIVE = 1.0,
}

/**
 * A single piece of evidence supporting a context detection.
 */
export interface ContextEvidence {
  /** Unique identifier for this evidence */
  id: string;
  
  /** Type of evidence */
  type: EvidenceType;
  
  /** Strength of this evidence (0-1) */
  strength: number;
  
  /** Human-readable description of the evidence */
  description: string;
  
  /** Source of the evidence (e.g., question ID, profile field) */
  source: string;
  
  /** Raw data that produced this evidence */
  rawValue: unknown;
  
  /** Timestamp when evidence was extracted */
  timestamp: number;
}

// ============================================================================
// UNCERTAINTY & CONFIDENCE TYPES
// ============================================================================

/**
 * Sources of uncertainty in context detection.
 */
export enum UncertaintySource {
  INSUFFICIENT_DATA = 'INSUFFICIENT_DATA',
  CONFLICTING_SIGNALS = 'CONFLICTING_SIGNALS',
  AMBIGUOUS_PROFILE = 'AMBIGUOUS_PROFILE',
  TEMPORAL_UNCERTAINTY = 'TEMPORAL_UNCERTAINTY',
  INCOMPLETE_ASSESSMENT = 'INCOMPLETE_ASSESSMENT',
  NOVEL_SITUATION = 'NOVEL_SITUATION',
}

/**
 * Quantified uncertainty for a context detection.
 */
export interface ContextUncertainty {
  /** Overall uncertainty score (0-1, higher = more uncertain) */
  score: number;
  
  /** Specific sources of uncertainty */
  sources: UncertaintySource[];
  
  /** Human-readable explanation of uncertainty */
  explanation: string;
  
  /** Confidence that could be gained with more data */
  potentialImprovement: number;
  
  /** What data would reduce uncertainty */
  dataNeeds: string[];
}

// ============================================================================
// CONTEXT DETECTION RESULTS
// ============================================================================

/**
 * Priority level for a detected context.
 */
export enum ContextPriority {
  PRIMARY = 'PRIMARY',
  SECONDARY = 'SECONDARY',
  TERTIARY = 'TERTIARY',
  INCIDENTAL = 'INCIDENTAL',
}

/**
 * A single detected context with full analysis.
 */
export interface DetectedContext {
  /** The context type detected */
  context: DecisionContextType;
  
  /** Category of this context */
  category: ContextCategory;
  
  /** Confidence score (0-1) */
  confidence: number;
  
  /** All evidence supporting this detection */
  evidence: ContextEvidence[];
  
  /** Uncertainty analysis */
  uncertainty: ContextUncertainty;
  
  /** Priority level (primary = most relevant) */
  priority: ContextPriority;
  
  /** Human-readable explanation of why this context was detected */
  explanation: string;
  
  /** Key characteristics of this context for the user */
  characteristics: string[];
  
  /** How long this context has been active (if known) */
  duration?: {
    estimated: boolean;
    months?: number;
    description: string;
  };
  
  /** Whether this context is currently active */
  isActive: boolean;
  
  /** When this context was first detected */
  firstDetectedAt: number;
  
  /** When this context was last updated */
  lastUpdatedAt: number;
}

/**
 * Complete context analysis result.
 */
export interface ContextAnalysis {
  /** Unique analysis ID */
  id: string;
  
  /** Timestamp of analysis */
  timestamp: number;
  
  /** Student ID */
  studentId: string;
  
  /** All detected contexts ordered by priority */
  contexts: DetectedContext[];
  
  /** Primary context (highest priority) */
  primaryContext?: DetectedContext;
  
  /** Secondary contexts (active but lower priority) */
  secondaryContexts: DetectedContext[];
  
  /** Conflicting contexts that need resolution */
  conflicts: ContextConflict[];
  
  /** Overall confidence in the analysis */
  overallConfidence: number;
  
  /** Whether the analysis is complete or partial */
  completeness: 'complete' | 'partial' | 'insufficient_data';
  
  /** Narrative summary of the context landscape */
  narrative: ContextNarrative;
  
  /** Recommended next steps to improve context understanding */
  recommendations: ContextRecommendation[];
}

/**
 * Conflict between two or more contexts.
 */
export interface ContextConflict {
  /** IDs of conflicting contexts */
  contextIds: DecisionContextType[];
  
  /** Type of conflict */
  type: 'mutually_exclusive' | 'resource_competition' | 'priority_dispute' | 'temporal_conflict';
  
  /** Description of the conflict */
  description: string;
  
  /** How to resolve the conflict */
  resolution: string;
  
  /** Confidence that this is a real conflict vs. false positive */
  confidence: number;
}

/**
 * Human-readable narrative about context.
 */
export interface ContextNarrative {
  /** One-sentence summary */
  summary: string;
  
  /** Detailed explanation */
  detailed: string;
  
  /** Key insight about the context landscape */
  insight: string;
  
  /** What this context means for career decisions */
  implications: string;
  
  /** How contexts interact */
  contextInteraction?: string;
}

/**
 * Recommendation for improving context detection.
 */
export interface ContextRecommendation {
  /** Type of recommendation */
  type: 'assessment' | 'profile_update' | 'clarification' | 'monitoring';
  
  /** Description of what to do */
  description: string;
  
  /** Expected impact on confidence */
  confidenceImpact: number;
  
  /** Priority of this recommendation */
  priority: 'high' | 'medium' | 'low';
}

// ============================================================================
// SCORING & DETECTION TYPES
// ============================================================================

/**
 * A signal extractor function that finds evidence for a specific context.
 */
export type SignalExtractor = (
  input: ContextDetectionInput
) => ContextEvidence[];

/**
 * A scorer that calculates context confidence from evidence.
 */
export type ContextScorer = (
  context: DecisionContextType,
  evidence: ContextEvidence[]
) => {
  confidence: number;
  uncertainty: ContextUncertainty;
};

/**
 * Weight configuration for different evidence types.
 */
export interface EvidenceWeights {
  [EvidenceType.EXPLICIT_ANSWER]: number;
  [EvidenceType.IMPLICIT_SIGNAL]: number;
  [EvidenceType.PATTERN_MATCH]: number;
  [EvidenceType.EDUCATION_DATA]: number;
  [EvidenceType.EXPERIENCE_DATA]: number;
  [EvidenceType.GOAL_STATEMENT]: number;
  [EvidenceType.BROWSING_PATTERN]: number;
  [EvidenceType.INTERACTION_HISTORY]: number;
  [EvidenceType.USER_DECLARED]: number;
  [EvidenceType.TEMPORAL_INFERENCE]: number;
  [EvidenceType.COMBINATORIAL_INFERENCE]: number;
}

/**
 * Configuration for the context detection engine.
 */
export interface ContextEngineConfig {
  /** Minimum confidence to report a context */
  minConfidenceThreshold: number;
  
  /** Weights for different evidence types */
  evidenceWeights: EvidenceWeights;
  
  /** Minimum evidence count for primary context */
  minEvidenceForPrimary: number;
  
  /** Threshold for considering contexts as conflicting */
  conflictThreshold: number;
  
  /** Whether to include incidental contexts in output */
  includeIncidental: boolean;
  
  /** Enable/disable specific context detectors */
  enabledContexts: DecisionContextType[];
  
  /** Custom signal extractors */
  customExtractors?: SignalExtractor[];
  
  /** Explanation verbosity level */
  explanationVerbosity: 'minimal' | 'standard' | 'detailed';
  
  /** Maximum number of contexts to return */
  maxContexts: number;
}

// ============================================================================
// INPUT TYPES
// ============================================================================

/**
 * Input data for context detection.
 */
export interface ContextDetectionInput {
  /** Student profile data */
  profile: StudentProfile;
  
  /** Assessment responses (if available) */
  assessmentResponses?: AssessmentResponse[];
  
  /** Explicitly stated goals */
  explicitGoals?: string[];
  
  /** User input text (free form) */
  userInput?: string;
  
  /** Previous context analysis (for delta detection) */
  previousAnalysis?: ContextAnalysis;
  
  /** Timestamp of input */
  timestamp: number;
  
  /** Additional metadata */
  metadata?: {
    assessmentId?: string;
    sessionId?: string;
    source: 'assessment' | 'profile' | 'conversation' | 'system';
  };
}

/**
 * Raw signal data extracted from various sources.
 */
export interface RawContextSignals {
  /** Signals from assessment answers */
  assessmentSignals: Map<string, unknown>;
  
  /** Signals from profile data */
  profileSignals: Map<string, unknown>;
  
  /** Signals from explicit goals */
  goalSignals: Map<string, unknown>;
  
  /** Signals from user input text */
  inputSignals: Map<string, unknown>;
  
  /** Temporal signals (timing-based) */
  temporalSignals: Map<string, unknown>;
}

// ============================================================================
// ENGINE INTERFACES
// ============================================================================

/**
 * Interface for the main Decision Context Engine.
 */
export interface IDecisionContextEngine {
  /**
   * Analyze input data and detect contexts.
   */
  analyze(input: ContextDetectionInput): ContextAnalysis;
  
  /**
   * Update configuration.
   */
  updateConfig(config: Partial<ContextEngineConfig>): void;
  
  /**
   * Get current configuration.
   */
  getConfig(): ContextEngineConfig;
  
  /**
   * Add a custom signal extractor.
   */
  addSignalExtractor(extractor: SignalExtractor): void;
  
  /**
   * Detect a specific context type.
   */
  detectContext(
    contextType: DecisionContextType,
    input: ContextDetectionInput
  ): DetectedContext | null;
}

/**
 * Interface for the Context Explanation Engine.
 */
export interface IContextExplanationEngine {
  /**
   * Generate explanation for a detected context.
   */
  explain(context: DetectedContext, allContexts: DetectedContext[]): string;
  
  /**
   * Generate narrative summary for analysis.
   */
  generateNarrative(analysis: ContextAnalysis): ContextNarrative;
  
  /**
   * Generate characteristics for a context.
   */
  generateCharacteristics(context: DetectedContext): string[];
  
  /**
   * Explain conflicts between contexts.
   */
  explainConflict(conflict: ContextConflict, contexts: DetectedContext[]): string;
}

/**
 * Interface for the Context Scoring Engine.
 */
export interface IContextScoringEngine {
  /**
   * Calculate confidence from evidence.
   */
  calculateConfidence(
    context: DecisionContextType,
    evidence: ContextEvidence[],
    weights: EvidenceWeights
  ): {
    confidence: number;
    uncertainty: ContextUncertainty;
  };
  
  /**
   * Prioritize detected contexts.
   */
  prioritize(contexts: DetectedContext[]): DetectedContext[];
  
  /**
   * Detect conflicts between contexts.
   */
  detectConflicts(contexts: DetectedContext[]): ContextConflict[];
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Type guard for DecisionContextType.
 */
export function isDecisionContextType(value: unknown): value is DecisionContextType {
  return typeof value === 'string' && Object.values(DecisionContextType).includes(value as DecisionContextType);
}

/**
 * Type guard for ContextCategory.
 */
export function isContextCategory(value: unknown): value is ContextCategory {
  return typeof value === 'string' && Object.values(ContextCategory).includes(value as ContextCategory);
}

/**
 * Get human-readable label for a context type.
 */
export function getContextTypeLabel(type: DecisionContextType): string {
  const labels: Record<DecisionContextType, string> = {
    [DecisionContextType.JEE_PREPARATION]: 'JEE Preparation',
    [DecisionContextType.NEET_PREPARATION]: 'NEET Preparation',
    [DecisionContextType.UPSC_PREPARATION]: 'UPSC Preparation',
    [DecisionContextType.STATE_PSC_PREPARATION]: 'State PSC Preparation',
    [DecisionContextType.CA_PATHWAY]: 'Chartered Accountancy Pathway',
    [DecisionContextType.CS_PATHWAY]: 'Company Secretary Pathway',
    [DecisionContextType.CMA_PATHWAY]: 'Cost & Management Accountancy Pathway',
    [DecisionContextType.COLLEGE_SELECTION]: 'College Selection',
    [DecisionContextType.SCHOOL_SELECTION]: 'School Selection',
    [DecisionContextType.COURSE_SELECTION]: 'Course Selection',
    [DecisionContextType.CAREER_EXPLORATION]: 'Career Exploration',
    [DecisionContextType.EARLY_CAREER]: 'Early Career Professional',
    [DecisionContextType.MID_CAREER]: 'Mid Career Professional',
    [DecisionContextType.CAREER_SWITCH]: 'Career Switch',
    [DecisionContextType.INDUSTRY_TRANSITION]: 'Industry Transition',
    [DecisionContextType.STARTUP_EXPLORATION]: 'Startup Exploration',
    [DecisionContextType.ENTREPRENEURSHIP_BUILDING]: 'Entrepreneurship Building',
    [DecisionContextType.FAMILY_BUSINESS]: 'Family Business Context',
    [DecisionContextType.REGIONAL_CONSTRAINT]: 'Regional Constraints',
    [DecisionContextType.FINANCIAL_CONSTRAINT]: 'Financial Constraints',
    [DecisionContextType.TIME_CONSTRAINT]: 'Time Constraints',
  };
  return labels[type] || type;
}

/**
 * Get description for a context type.
 */
export function getContextTypeDescription(type: DecisionContextType): string {
  const descriptions: Record<DecisionContextType, string> = {
    [DecisionContextType.JEE_PREPARATION]: 
      'Preparing for Joint Entrance Examination for engineering admissions',
    [DecisionContextType.NEET_PREPARATION]: 
      'Preparing for National Eligibility cum Entrance Test for medical admissions',
    [DecisionContextType.UPSC_PREPARATION]: 
      'Preparing for Union Public Service Commission civil services examination',
    [DecisionContextType.STATE_PSC_PREPARATION]: 
      'Preparing for State Public Service Commission examinations',
    [DecisionContextType.CA_PATHWAY]: 
      'Pursuing Chartered Accountancy qualification through ICAI',
    [DecisionContextType.CS_PATHWAY]: 
      'Pursuing Company Secretary qualification through ICSI',
    [DecisionContextType.CMA_PATHWAY]: 
      'Pursuing Cost & Management Accountancy through ICMAI',
    [DecisionContextType.COLLEGE_SELECTION]: 
      'Currently in the process of selecting colleges or universities',
    [DecisionContextType.SCHOOL_SELECTION]: 
      'Selecting schools for further education',
    [DecisionContextType.COURSE_SELECTION]: 
      'Deciding between specific courses or academic programs',
    [DecisionContextType.CAREER_EXPLORATION]: 
      'Exploring different career options without a specific commitment',
    [DecisionContextType.EARLY_CAREER]: 
      'In the early stages of professional career (0-3 years)',
    [DecisionContextType.MID_CAREER]: 
      'Established in career with significant experience (5+ years)',
    [DecisionContextType.CAREER_SWITCH]: 
      'Considering or actively pursuing a change in career path',
    [DecisionContextType.INDUSTRY_TRANSITION]: 
      'Moving from one industry to another',
    [DecisionContextType.STARTUP_EXPLORATION]: 
      'Exploring entrepreneurship and startup opportunities',
    [DecisionContextType.ENTREPRENEURSHIP_BUILDING]: 
      'Actively building or running a business venture',
    [DecisionContextType.FAMILY_BUSINESS]: 
      'Involved in or preparing to join family business',
    [DecisionContextType.REGIONAL_CONSTRAINT]: 
      'Career decisions constrained by geographic or regional factors',
    [DecisionContextType.FINANCIAL_CONSTRAINT]: 
      'Career decisions heavily influenced by financial limitations',
    [DecisionContextType.TIME_CONSTRAINT]: 
      'Career decisions constrained by limited time availability',
  };
  return descriptions[type] || 'Unknown context';
}
