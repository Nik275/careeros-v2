/**
 * CareerOS Recommendation Fusion System
 *
 * Central intelligence layer that combines all CareerOS engines into a single
 * coherent recommendation system with ONE confidence model, ONE reasoning chain,
 * and ONE mentor voice.
 *
 * @module intelligence/recommendation-fusion
 */

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export {
  DEFAULT_FUSION_CONFIG,
} from './fusion-types';

export type {
  // Core types
  EngineId,
  RecommendationId,
  FusionTimestamp,
  Weight,
  ConfidenceScore,
  AgreementScore,

  // Engine weights
  PsychologyWeight,
  CareerWeight,
  MentorWeight,
  LearningWeight,
  ContradictionWeight,

  // Engine recommendations
  EngineRecommendation,

  // Fusion inputs
  FusionInputs,

  // Confidence
  RecommendationConfidence,

  // Fused recommendation
  FusedRecommendation,

  // Report
  UnifiedRecommendationReport,

  // Ranking
  RankingResult,

  // Config
  FusionConfig,

  // Events
  FusionEvent,
  FusionEventType,
} from './fusion-types';

// ============================================================================
// ENGINE EXPORTS
// ============================================================================

export {
  PsychologyWeightEngine,
  DEFAULT_PSYCHOLOGY_CONFIG,
} from './psychology-weight-engine';

export type {
  PsychologyWeightConfig,
  PsychologyProfile,
  CareerPsychologyFit,
} from './psychology-weight-engine';

export {
  CareerWeightEngine,
  DEFAULT_CAREER_CONFIG,
} from './career-weight-engine';

export type {
  CareerWeightConfig,
  CareerFactors,
} from './career-weight-engine';

export {
  MentorWeightEngine,
  DEFAULT_MENTOR_CONFIG,
} from './mentor-weight-engine';

export type {
  MentorWeightConfig,
  MentorProfile,
  CareerMentorFit,
  MentorPattern,
  HistoricalMistake,
} from './mentor-weight-engine';

export {
  LearningWeightEngine,
  DEFAULT_LEARNING_CONFIG,
} from './learning-weight-engine';

export type {
  LearningWeightConfig,
  LearningLoopReport,
  CareerLearningFit,
  PopulationOutcome,
  HistoricalSuccess,
  FailurePattern,
} from './learning-weight-engine';

export {
  ContradictionWeightEngine,
  DEFAULT_CONTRADICTION_CONFIG,
} from './contradiction-weight-engine';

export type {
  ContradictionConfig,
  ValueConflict,
  GoalConflict,
  IdentityConflict,
  FamilyPressure,
  ContradictionInput,
  CareerContradictionContext,
} from './contradiction-weight-engine';

export {
  ConfidenceFusionEngine,
  DEFAULT_CONFIDENCE_CONFIG,
} from './confidence-fusion-engine';

export type {
  ConfidenceFusionConfig,
  ConfidenceInputs,
} from './confidence-fusion-engine';

export {
  RecommendationRankingEngine,
  DEFAULT_RANKING_CONFIG,
} from './recommendation-ranking-engine';

export type {
  RankingConfig,
  RankingInput,
  HistoricalRanking,
} from './recommendation-ranking-engine';

export {
  FusionExplanationEngine,
  DEFAULT_EXPLANATION_CONFIG,
} from './fusion-explanation-engine';

export type {
  ExplanationConfig,
  ExplanationOutput,
} from './fusion-explanation-engine';

export {
  RecommendationFusionEngine,
} from './recommendation-fusion-engine';

export type {
  RecommendationFusionEngineConfig,
} from './recommendation-fusion-engine';

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export { RecommendationFusionEngine as default } from './recommendation-fusion-engine';
