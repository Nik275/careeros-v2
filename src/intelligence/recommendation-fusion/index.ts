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
  DEFAULT_FUSION_CONFIG,

  // Events
  FusionEvent,
  FusionEventType,
} from './fusion-types';

// ============================================================================
// ENGINE EXPORTS
// ============================================================================

export {
  PsychologyWeightEngine,
  PsychologyWeightConfig,
  DEFAULT_PSYCHOLOGY_CONFIG,
  PsychologyProfile,
  CareerPsychologyFit,
} from './psychology-weight-engine';

export {
  CareerWeightEngine,
  CareerWeightConfig,
  DEFAULT_CAREER_CONFIG,
  CareerFactors,
} from './career-weight-engine';

export {
  MentorWeightEngine,
  MentorWeightConfig,
  DEFAULT_MENTOR_CONFIG,
  MentorProfile,
  CareerMentorFit,
  MentorPattern,
  HistoricalMistake,
} from './mentor-weight-engine';

export {
  LearningWeightEngine,
  LearningWeightConfig,
  DEFAULT_LEARNING_CONFIG,
  LearningLoopReport,
  CareerLearningFit,
  PopulationOutcome,
  HistoricalSuccess,
  FailurePattern,
} from './learning-weight-engine';

export {
  ContradictionWeightEngine,
  ContradictionConfig,
  DEFAULT_CONTRADICTION_CONFIG,
  ValueConflict,
  GoalConflict,
  IdentityConflict,
  FamilyPressure,
  ContradictionInput,
  CareerContradictionContext,
} from './contradiction-weight-engine';

export {
  ConfidenceFusionEngine,
  ConfidenceFusionConfig,
  DEFAULT_CONFIDENCE_CONFIG,
  ConfidenceInputs,
} from './confidence-fusion-engine';

export {
  RecommendationRankingEngine,
  RankingConfig,
  DEFAULT_RANKING_CONFIG,
  RankingInput,
  HistoricalRanking,
} from './recommendation-ranking-engine';

export {
  FusionExplanationEngine,
  ExplanationConfig,
  DEFAULT_EXPLANATION_CONFIG,
  ExplanationOutput,
} from './fusion-explanation-engine';

export {
  RecommendationFusionEngine,
  RecommendationFusionEngineConfig,
} from './recommendation-fusion-engine';

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export { RecommendationFusionEngine as default } from './recommendation-fusion-engine';
