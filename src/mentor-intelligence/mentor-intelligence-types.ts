/**
 * Mentor Intelligence Types
 * 
 * Type definitions for the Mentor Intelligence Engine (Phase 8.3).
 * Defines structures for extracting wisdom, patterns, lessons, and decision outcomes
 * from career journeys.
 * 
 * @module MentorIntelligenceTypes
 */

import {
  CareerJourney,
  JourneyId,
  CareerDecision,
  CareerFailure,
  CareerSuccess,
  LessonLearned,
  CareerRegret,
  TurningPoint,
  CareerTransition,
  ImpactLevel,
  ImportanceLevel,
} from '../career-journeys/career-journey-types';

import {
  JourneySimilarityResult,
  SimilarityScore,
  SimilarityDimension,
} from '../career-journeys/similarity/journey-similarity-types';

import type { Confidence } from '../intelligence/confidence';

// ============================================================================
// CORE IDENTIFIERS
// ============================================================================

/** Unique identifier for a mentor insight */
export type MentorInsightId = string & { readonly __brand: 'MentorInsightId' };

/** Unique identifier for a pattern */
export type PatternId = string & { readonly __brand: 'PatternId' };

/** Unique identifier for a decision outcome analysis */
export type DecisionOutcomeId = string & { readonly __brand: 'DecisionOutcomeId' };

/** Unique identifier for a lesson extraction */
export type LessonId = string & { readonly __brand: 'LessonId' };

/** Unique identifier for a mistake analysis */
export type MistakeId = string & { readonly __brand: 'MistakeId' };

// ============================================================================
// MENTOR INSIGHT
// ============================================================================

/**
 * A single extracted insight from career journeys
 * Represents wisdom that can be passed to students
 */
export interface MentorInsight {
  id: MentorInsightId;
  
  /** The core lesson or advice */
  lesson: string;
  
  /** Type of insight */
  type: InsightType;
  
  /** Confidence in this insight (0.0-1.0) */
  confidence: Confidence;
  
  /** Evidence supporting this insight */
  evidence: InsightEvidence[];
  
  /** Importance level */
  importance: ImportanceLevel;
  
  /** Who this insight applies to */
  applicability: InsightApplicability;
  
  /** Source journeys */
  sourceJourneys: JourneyId[];
  
  /** When this insight was extracted */
  extractedAt: Date;
  
  /** Extraction version */
  extractionVersion: string;
}

/** Types of insights that can be extracted */
export type InsightType =
  | 'SUCCESS_PATTERN'
  | 'FAILURE_PATTERN'
  | 'LESSON_LEARNED'
  | 'MISTAKE_AVOIDANCE'
  | 'DECISION_GUIDANCE'
  | 'TIMING_INSIGHT'
  | 'SKILL_INSIGHT'
  | 'NETWORK_INSIGHT'
  | 'MINDSET_INSIGHT'
  | 'STRATEGY_INSIGHT';

/** Evidence for an insight */
export interface InsightEvidence {
  /** Journey that provided this evidence */
  journeyId: JourneyId;
  
  /** Specific event or decision that supports the insight */
  event: string;
  
  /** Outcome that validates the insight */
  outcome: string;
  
  /** How strongly this evidence supports the insight (0-1) */
  strength: number;
  
  /** Type of evidence */
  type: EvidenceType;
}

/** Types of evidence */
export type EvidenceType =
  | 'DIRECT_OUTCOME'
  | 'CORRELATION'
  | 'CAUSAL_INFERENCE'
  | 'COUNTER_EXAMPLE'
  | 'ANALOGY';

/** Who an insight applies to */
export interface InsightApplicability {
  /** Archetypes this insight applies to */
  archetypes: string[];
  
  /** Career stages this insight applies to */
  careerStages: CareerStage[];
  
  /** Industries this insight applies to */
  industries: string[];
  
  /** Constraints this insight is relevant for */
  relevantConstraints: string[];
  
  /** Similarity threshold for application */
  minSimilarityScore: SimilarityScore;
}

/** Career stages for applicability */
export type CareerStage =
  | 'STUDENT'
  | 'EARLY_CAREER'
  | 'MID_CAREER'
  | 'SENIOR'
  | 'TRANSITION'
  | 'ENTREPRENEUR';

// ============================================================================
// SUCCESS PATTERN
// ============================================================================

/**
 * A pattern that leads to successful outcomes
 */
export interface SuccessPattern {
  id: PatternId;
  
  /** Description of the pattern */
  pattern: string;
  
  /** Category of success */
  category: SuccessCategory;
  
  /** How often this pattern appears in successful journeys */
  frequency: PatternFrequency;
  
  /** Confidence in this pattern (0-1) */
  confidence: ConfidenceLevel;
  
  /** Impact on outcome */
  outcomeImpact: OutcomeImpact;
  
  /** Specific behaviors or actions that constitute the pattern */
  behaviors: string[];
  
  /** Conditions under which this pattern works */
  enablingConditions: string[];
  
  /** Conditions that prevent this pattern from working */
  blockingConditions: string[];
  
  /** Source journeys demonstrating this pattern */
  sourceJourneys: JourneyId[];
  
  /** Counter-examples where pattern existed but success didn't occur */
  counterExamples: JourneyId[];
  
  /** Related patterns */
  relatedPatterns: PatternId[];
}

/** Categories of success */
export type SuccessCategory =
  | 'CAREER_ADVANCEMENT'
  | 'SKILL_MASTERY'
  | 'ENTREPRENEURIAL_SUCCESS'
  | 'WORK_LIFE_BALANCE'
  | 'FINANCIAL_SUCCESS'
  | 'IMPACT_ACHIEVEMENT'
  | 'NETWORK_BUILDING'
  | 'RESILIENCE'
  | 'LEARNING'
  | 'TRANSITION_SUCCESS';

/** Pattern frequency classification */
export interface PatternFrequency {
  /** Number of journeys showing this pattern */
  count: number;
  
  /** Total journeys analyzed */
  total: number;
  
  /** Percentage (0-1) */
  percentage: number;
  
  /** Classification */
  classification: 'RARE' | 'UNCOMMON' | 'COMMON' | 'VERY_COMMON' | 'UNIVERSAL';
}

/** Impact on outcomes */
export interface OutcomeImpact {
  /** Magnitude of impact */
  magnitude: 'TRANSFORMATIONAL' | 'MAJOR' | 'MODERATE' | 'MINOR' | 'NEGLIGIBLE';
  
  /** Direction of impact */
  direction: 'STRONGLY_POSITIVE' | 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'STRONGLY_NEGATIVE';
  
  /** Timeframe for impact */
  timeframe: 'IMMEDIATE' | 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM';
  
  /** Confidence in impact assessment */
  confidence: ConfidenceLevel;
}

// ============================================================================
// FAILURE PATTERN
// ============================================================================

/**
 * A pattern that leads to unsuccessful outcomes
 */
export interface FailurePattern {
  id: PatternId;
  
  /** Description of the pattern */
  pattern: string;
  
  /** Category of failure */
  category: FailureCategory;
  
  /** How often this pattern appears in failed journeys */
  frequency: PatternFrequency;
  
  /** Confidence in this pattern (0-1) */
  confidence: ConfidenceLevel;
  
  /** Impact on outcome */
  outcomeImpact: OutcomeImpact;
  
  /** Specific behaviors or actions that constitute the pattern */
  behaviors: string[];
  
  /** Warning signs that this pattern is emerging */
  warningSigns: string[];
  
  /** How to avoid or mitigate this pattern */
  mitigationStrategies: string[];
  
  /** Source journeys demonstrating this pattern */
  sourceJourneys: JourneyId[];
  
  /** Cases where pattern was avoided and success occurred */
  positiveDeviations: JourneyId[];
  
  /** Related failure patterns */
  relatedPatterns: PatternId[];
}

/** Categories of failure */
export type FailureCategory =
  | 'PREMATURE_EXIT'
  | 'SKILL_GAP'
  | 'NETWORK_FAILURE'
  | 'TIMING_MISTAKE'
  | 'VALIDATION_FAILURE'
  | 'EXECUTION_FAILURE'
  | 'STRATEGIC_ERROR'
  | 'RELATIONSHIP_FAILURE'
  | 'BURNOUT'
  | 'OPPORTUNITY_COST';

// ============================================================================
// DECISION OUTCOME
// ============================================================================

/**
 * Analysis of a decision and its outcomes over time
 */
export interface DecisionOutcome {
  id: DecisionOutcomeId;
  
  /** The decision that was made */
  decision: string;
  
  /** Type of decision */
  decisionType: DecisionType;
  
  /** Context in which decision was made */
  context: DecisionContext;
  
  /** Short-term outcome (0-2 years) */
  shortTermOutcome: OutcomeSnapshot;
  
  /** Medium-term outcome (2-5 years) */
  mediumTermOutcome?: OutcomeSnapshot;
  
  /** Long-term outcome (5+ years) */
  longTermOutcome?: OutcomeSnapshot;
  
  /** Unexpected consequences */
  unexpectedConsequences: UnexpectedConsequence[];
  
  /** Alternative decisions considered */
  alternativesConsidered: AlternativeAnalysis[];
  
  /** What would have happened with different choice */
  counterfactualAnalysis?: CounterfactualAnalysis;
  
  /** Source journeys with this decision */
  sourceJourneys: JourneyId[];
  
  /** Confidence in analysis */
  confidence: ConfidenceLevel;
}

/** Types of decisions */
export type DecisionType =
  | 'CAREER_CHANGE'
  | 'EDUCATION_CHOICE'
  | 'JOB_ACCEPTANCE'
  | 'JOB_DEPARTURE'
  | 'SKILL_INVESTMENT'
  | 'RELOCATION'
  | 'ENTREPRENEURIAL'
  | 'NETWORKING'
  | 'TIMING'
  | 'RISK_TAKING';

/** Context of a decision */
export interface DecisionContext {
  /** Career stage when decision was made */
  careerStage: CareerStage;
  
  /** Constraints present */
  constraints: string[];
  
  /** Available information at time */
  informationAvailability: 'COMPLETE' | 'SUBSTANTIAL' | 'PARTIAL' | 'LIMITED';
  
  /** Time pressure */
  timePressure: 'URGENT' | 'MODERATE' | 'RELAXED';
  
  /** Stakes involved */
  stakes: 'LIFE_CHANGING' | 'HIGH' | 'MODERATE' | 'LOW';
}

/** Snapshot of an outcome at a point in time */
export interface OutcomeSnapshot {
  /** When this outcome was observed */
  timeframe: string;
  
  /** Overall assessment */
  assessment: 'EXCELLENT' | 'GOOD' | 'NEUTRAL' | 'POOR' | 'DISASTROUS';
  
  /** Specific outcomes */
  careerProgression: ProgressionOutcome;
  financialOutcome: FinancialOutcome;
  satisfactionOutcome: SatisfactionOutcome;
  skillOutcome: SkillOutcome;
  networkOutcome: NetworkOutcome;
  
  /** Whether outcome matched expectations */
  matchedExpectations: boolean;
  
  /** Surprises */
  surprises: string[];
}

/** Career progression outcome */
export interface ProgressionOutcome {
  level: 'ADVANCED' | 'PROGRESSED' | 'MAINTAINED' | 'DECLINED' | 'STALLED';
  details: string;
}

/** Financial outcome */
export interface FinancialOutcome {
  level: 'SIGNIFICANTLY_IMPROVED' | 'IMPROVED' | 'MAINTAINED' | 'DECLINED' | 'SIGNIFICANTLY_DECLINED';
  details: string;
}

/** Satisfaction outcome */
export interface SatisfactionOutcome {
  level: 'VERY_SATISFIED' | 'SATISFIED' | 'NEUTRAL' | 'DISSATISFIED' | 'VERY_DISSATISFIED';
  details: string;
}

/** Skill outcome */
export interface SkillOutcome {
  level: 'SIGNIFICANTLY_GAINED' | 'GAINED' | 'MAINTAINED' | 'LOST' | 'SIGNIFICANTLY_LOST';
  details: string;
}

/** Network outcome */
export interface NetworkOutcome {
  level: 'SIGNIFICANTLY_EXPANDED' | 'EXPANDED' | 'MAINTAINED' | 'CONTRACTED' | 'SIGNIFICANTLY_CONTRACTED';
  details: string;
}

/** Unexpected consequence of a decision */
export interface UnexpectedConsequence {
  /** What happened */
  consequence: string;
  
  /** When it emerged */
  timeframe: 'IMMEDIATE' | 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM';
  
  /** Impact */
  impact: 'POSITIVE' | 'NEGATIVE' | 'MIXED';
  
  /** Magnitude */
  magnitude: ImpactLevel;
  
  /** Whether it could have been anticipated */
  foreseeable: boolean;
}

/** Analysis of an alternative decision */
export interface AlternativeAnalysis {
  /** The alternative */
  alternative: string;
  
  /** Why it wasn't chosen */
  whyNotChosen: string;
  
  /** Likely outcome if chosen */
  likelyOutcome: string;
  
  /** Confidence in this assessment */
  confidence: ConfidenceLevel;
}

/** Counterfactual analysis */
export interface CounterfactualAnalysis {
  /** What would likely have happened */
  likelyScenario: string;
  
  /** Key differences from actual path */
  keyDifferences: string[];
  
  /** Whether actual decision was better */
  actualWasBetter: boolean;
  
  /** Confidence in assessment */
  confidence: ConfidenceLevel;
}

// ============================================================================
// LESSON EXTRACTION
// ============================================================================

/**
 * An extracted lesson from career journeys
 */
export interface ExtractedLesson {
  id: LessonId;
  
  /** The lesson itself */
  lesson: string;
  
  /** Category of lesson */
  category: LessonCategory;
  
  /** Type of lesson */
  type: LessonType;
  
  /** How many journeys contributed this lesson */
  frequency: PatternFrequency;
  
  /** Confidence in this lesson (0-1) */
  confidence: ConfidenceLevel;
  
  /** Importance of this lesson */
  importance: ImportanceLevel;
  
  /** Evidence supporting this lesson */
  evidence: LessonEvidence[];
  
  /** When to apply this lesson */
  applicability: LessonApplicability;
  
  /** Related lessons */
  relatedLessons: LessonId[];
  
  /** Source journeys */
  sourceJourneys: JourneyId[];
  
  /** When extracted */
  extractedAt: Date;
}

/** Categories of lessons */
export type LessonCategory =
  | 'EARLY_CAREER'
  | 'SKILL_DEVELOPMENT'
  | 'NETWORKING'
  | 'DECISION_MAKING'
  | 'RISK_MANAGEMENT'
  | 'TIMING'
  | 'MINDSET'
  | 'EXECUTION'
  | 'TRANSITION'
  | 'ENTREPRENEURSHIP';

/** Types of lessons */
export type LessonType =
  | 'ACTION_TO_TAKE'
  | 'ACTION_TO_AVOID'
  | 'MINDSET_SHIFT'
  | 'STRATEGY_INSIGHT'
  | 'TIMING_INSIGHT'
  | 'PEOPLE_INSIGHT'
  | 'VALIDATION_INSIGHT'
  | 'PERSISTENCE_INSIGHT'
  | 'ADAPTATION_INSIGHT';

/** Evidence for a lesson */
export interface LessonEvidence {
  journeyId: JourneyId;
  situation: string;
  action: string;
  outcome: string;
  relevance: number;
}

/** When a lesson applies */
export interface LessonApplicability {
  careerStages: CareerStage[];
  situations: string[];
  prerequisites: string[];
  minSimilarityScore: SimilarityScore;
}

// ============================================================================
// MISTAKE ANALYSIS
// ============================================================================

/**
 * Analysis of a common or costly mistake
 */
export interface MistakeAnalysis {
  id: MistakeId;
  
  /** The mistake */
  mistake: string;
  
  /** Category of mistake */
  category: MistakeCategory;
  
  /** How common this mistake is */
  frequency: PatternFrequency;
  
  /** Cost/impact of this mistake */
  cost: MistakeCost;
  
  /** Confidence in analysis (0-1) */
  confidence: ConfidenceLevel;
  
  /** Warning signs */
  warningSigns: string[];
  
  /** How to avoid */
  avoidanceStrategies: string[];
  
  /** How to recover if made */
  recoveryStrategies: string[];
  
  /** Source journeys where this mistake occurred */
  sourceJourneys: JourneyId[];
  
  /** Journeys where this was avoided */
  avoidanceExamples: JourneyId[];
  
  /** Related mistakes */
  relatedMistakes: MistakeId[];
  
  /** When extracted */
  extractedAt: Date;
}

/** Categories of mistakes */
export type MistakeCategory =
  | 'PREMATURE_DECISION'
  | 'DELAYED_DECISION'
  | 'WRONG_SKILL_FOCUS'
  | 'NEGLECTED_NETWORKING'
  | 'POOR_TIMING'
  | 'INADEQUATE_VALIDATION'
  | 'OVERCONFIDENCE'
  | 'UNDERCONFIDENCE'
  | 'WRONG_COMPANY_CHOICE'
  | 'BURNOUT_NEGLECT';

/** Cost of a mistake */
export interface MistakeCost {
  /** Time lost (in months/years) */
  timeCost: string;
  
  /** Financial cost */
  financialCost: 'SEVERE' | 'SIGNIFICANT' | 'MODERATE' | 'MINOR' | 'NEGLIGIBLE';
  
  /** Career progression cost */
  careerCost: 'SEVERE' | 'SIGNIFICANT' | 'MODERATE' | 'MINOR' | 'NEGLIGIBLE';
  
  /** Opportunity cost */
  opportunityCost: string;
  
  /** Emotional/psychological cost */
  emotionalCost: 'SEVERE' | 'SIGNIFICANT' | 'MODERATE' | 'MINOR' | 'NEGLIGIBLE';
}

// ============================================================================
// MENTOR INTELLIGENCE REPORT
// ============================================================================

/**
 * Comprehensive report of extracted mentor intelligence
 */
export interface MentorIntelligenceReport {
  id: string;
  
  /** When report was generated */
  generatedAt: Date;
  
  /** Report version */
  version: string;
  
  /** Journeys analyzed */
  journeysAnalyzed: number;
  
  /** Similar journeys focused on (if applicable) */
  similarJourneys?: JourneyId[];
  
  /** Key insights */
  keyInsights: MentorInsight[];
  
  /** Success patterns */
  successPatterns: SuccessPattern[];
  
  /** Failure patterns */
  failurePatterns: FailurePattern[];
  
  /** Important lessons */
  lessons: ExtractedLesson[];
  
  /** Mistakes to avoid */
  mistakes: MistakeAnalysis[];
  
  /** Decision outcomes analyzed */
  decisionOutcomes: DecisionOutcome[];
  
  /** Summary statistics */
  statistics: MentorIntelligenceStatistics;
  
  /** Personalized recommendations (if student context provided) */
  personalizedRecommendations?: PersonalizedRecommendation[];
}

/** Statistics for mentor intelligence */
export interface MentorIntelligenceStatistics {
  totalPatternsExtracted: number;
  totalLessonsExtracted: number;
  totalMistakesIdentified: number;
  totalDecisionsAnalyzed: number;
  
  patternConfidence: {
    high: number;
    medium: number;
    low: number;
  };
  
  mostCommonSuccessCategory: SuccessCategory;
  mostCommonFailureCategory: FailureCategory;
  mostCommonLessonCategory: LessonCategory;
  mostCommonMistakeCategory: MistakeCategory;
  
  averageEvidenceCount: number;
  averageSourceJourneyCount: number;
}

/** Personalized recommendation */
export interface PersonalizedRecommendation {
  recommendation: string;
  rationale: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  basedOn: {
    patterns: PatternId[];
    lessons: LessonId[];
    mistakes: MistakeId[];
  };
  expectedImpact: string;
  timeframe: 'IMMEDIATE' | 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM';
}

// ============================================================================
// EXTRACTION CONFIGURATION
// ============================================================================

/**
 * Configuration for intelligence extraction
 */
export interface ExtractionConfig {
  /** Minimum confidence threshold for inclusion */
  minConfidenceThreshold: number;
  
  /** Minimum frequency for pattern recognition */
  minPatternFrequency: number;
  
  /** Whether to include counter-examples */
  includeCounterExamples: boolean;
  
  /** Whether to generate counterfactuals */
  generateCounterfactuals: boolean;
  
  /** Maximum insights to extract */
  maxInsights: number;
  
  /** Maximum patterns per category */
  maxPatternsPerCategory: number;
  
  /** Analysis depth */
  analysisDepth: 'SURFACE' | 'STANDARD' | 'DEEP';
  
  /** Whether to personalize for student */
  personalize: boolean;
}

/** Default extraction configuration */
export const DEFAULT_EXTRACTION_CONFIG: ExtractionConfig = {
  minConfidenceThreshold: 0.6,
  minPatternFrequency: 2,
  includeCounterExamples: true,
  generateCounterfactuals: true,
  maxInsights: 50,
  maxPatternsPerCategory: 10,
  analysisDepth: 'STANDARD',
  personalize: true,
};

// ============================================================================
// INPUT TYPES
// ============================================================================

/**
 * Input for extracting intelligence from journeys
 */
export interface ExtractIntelligenceInput {
  /** Journeys to analyze */
  journeys: CareerJourney[];
  
  /** Similarity results (if filtering by similarity) */
  similarityResults?: JourneySimilarityResult[];
  
  /** Student profile (if personalizing) */
  studentProfile?: {
    archetype?: string;
    careerStage: CareerStage;
    goals: string[];
    constraints: string[];
  };
  
  /** Specific focus areas */
  focusAreas?: IntelligenceFocusArea[];
  
  /** Extraction configuration */
  config?: Partial<ExtractionConfig>;
}

/** Areas to focus intelligence extraction */
export type IntelligenceFocusArea =
  | 'SUCCESS_PATTERNS'
  | 'FAILURE_PATTERNS'
  | 'LESSONS'
  | 'MISTAKES'
  | 'DECISIONS'
  | 'TIMING'
  | 'SKILLS'
  | 'NETWORKING'
  | 'MINDSET'
  | 'ALL';

/**
 * Input for generating personalized advice
 */
export interface GenerateAdviceInput {
  /** Student context */
  studentProfile: {
    archetype: string;
    careerStage: CareerStage;
    currentSituation: string;
    goals: string[];
    constraints: string[];
    upcomingDecisions?: string[];
  };
  
  /** Similar journeys */
  similarJourneys: JourneySimilarityResult[];
  
  /** Specific questions */
  questions?: string[];
  
  /** Advice preferences */
  preferences: {
    prioritizeRecent: boolean;
    includeCautionary: boolean;
    focusOnActionable: boolean;
    maxRecommendations: number;
  };
}

// ============================================================================
// EXPLANATION TYPES
// ============================================================================

/**
 * Generated explanation for an insight
 */
export interface InsightExplanation {
  insightId: MentorInsightId | PatternId | LessonId | MistakeId;
  
  /** Human-readable explanation */
  explanation: string;
  
  /** Why this is relevant */
  relevance: string;
  
  /** How to apply */
  application: string;
  
  /** Supporting evidence summary */
  evidenceSummary: string;
  
  /** Confidence explanation */
  confidenceExplanation: string;
  
  /** Generated at */
  generatedAt: Date;
}

/**
 * Contextual explanation for a student
 */
export interface ContextualExplanation {
  /** The insight being explained */
  insight: MentorInsight | SuccessPattern | FailurePattern | ExtractedLesson | MistakeAnalysis;
  
  /** Why this applies to the student */
  whyApplies: string;
  
  /** Specific actions to take */
  actions: string[];
  
  /** What to watch out for */
  watchOutFor: string[];
  
  /** Timeline for application */
  timeline: string;
  
  /** Expected outcomes */
  expectedOutcomes: string[];
}
