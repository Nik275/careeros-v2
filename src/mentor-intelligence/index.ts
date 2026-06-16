/**
 * Mentor Intelligence Engine - Module 8.3
 *
 * Extracts wisdom from career journeys.
 *
 * Core Questions:
 * - "What works?"
 * - "What fails?"
 * - "What are common mistakes?"
 * - "What are common success patterns?"
 * - "What are decision outcomes?"
 *
 * @module MentorIntelligence
 */

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export {
  DEFAULT_EXTRACTION_CONFIG,
} from './mentor-intelligence-types';

export type {
  // Core Identifiers
  MentorInsightId,
  PatternId,
  DecisionOutcomeId,
  LessonId,
  MistakeId,

  // Core Types
  MentorInsight,
  InsightType,
  InsightEvidence,
  EvidenceType,
  InsightApplicability,
  CareerStage,

  // Success Pattern Types
  SuccessPattern,
  SuccessCategory,
  PatternFrequency,
  OutcomeImpact,

  // Failure Pattern Types
  FailurePattern,
  FailureCategory,
  LongitudinalPattern,

  // Decision Outcome Types
  DecisionOutcome,
  DecisionType,
  DecisionContext,
  OutcomeSnapshot,
  ProgressionOutcome,
  FinancialOutcome,
  SatisfactionOutcome,
  SkillOutcome,
  NetworkOutcome,
  UnexpectedConsequence,
  AlternativeAnalysis,
  CounterfactualAnalysis,

  // Lesson Types
  ExtractedLesson,
  LessonCategory,
  LessonType,
  LessonEvidence,
  LessonApplicability,

  // Mistake Types
  MistakeAnalysis,
  MistakeCategory,
  MistakeCost,

  // Report Types
  MentorIntelligenceReport,
  MentorIntelligenceStatistics,
  PersonalizedRecommendation,

  // Configuration Types
  ExtractionConfig,
  IntelligenceFocusArea,

  // Input/Output Types
  ExtractIntelligenceInput,
  GenerateAdviceInput,
  InsightExplanation,
  ContextualExplanation,
} from './mentor-intelligence-types';

// ============================================================================
// ENGINE EXPORTS
// ============================================================================

export {
  MentorIntelligenceEngine,
  DEFAULT_MENTOR_INTELLIGENCE_CONFIG,
  createMentorIntelligenceEngine,
} from './mentor-intelligence-engine';

export type {
  MentorIntelligenceEngineConfig,
  ValidationResult,
  IntelligenceQuery,
} from './mentor-intelligence-engine';

export {
  PatternExtractionEngine,
} from './pattern-extraction-engine';

export {
  LessonEngine,
} from './lesson-engine';

export {
  MistakeEngine,
} from './mistake-engine';

export {
  DecisionOutcomeEngine,
} from './decision-outcome-engine';

// ============================================================================
// MODULE VERSION
// ============================================================================

export const MENTOR_INTELLIGENCE_VERSION = '8.3.0';
