/**
 * CareerOS Intelligence Foundation
 * 
 * This module exports all types, engines, and utilities for the CareerOS
 * Intelligence System. Import from this file to access all intelligence
 * functionality.
 * 
 * Example usage:
 * ```typescript
 * import {
 *   createStudentBeliefFromAssessment,
 *   createPathCascadeEngine,
 *   createRegretEngine,
 *   createRecommendationEngine,
 *   createMentorEngine,
 *   StudentBelief,
 *   CareerPath,
 *   CareerRecommendation,
 * } from '@/intelligence';
 * ```
 */

// ============================================================================
// TYPES
// ============================================================================

export {
  // Core types
  type ConfidenceScore,
  type BeliefTimestamp,
  type EntityId,
  type Result,
  type AsyncResult,
  EvidenceSource,
  
  // Student belief types
  type Evidence,
  type Motivation,
  type Strength,
  type Value,
  type PersonalityTrait,
  type LifestylePreference,
  type Constraint,
  type StudentBelief,
  StrengthCategory,
  PersonalityDimension,
  LifestyleCategory,
  ConstraintType,
  
  // Legacy Career graph types (kept for compatibility)
  type PathScores,
  CareerCategory,
  WorkEnvironmentType,
  EntryRequirementType,
  
  // Legacy Decision coalition V1 types (kept for compatibility)
  type Voter,
  type Vote,
  type Preference,
  VoterType,
  AggregationMethod,
  
  // Recommendation types
  type CareerRecommendation,
  type RecommendationReasoning,
  type RecommendationConcern,
  type NextStep,
  
  // Regret types
  type RegretPrediction,
  RegretType,
  
  // Mentor types
  type MentorContext,
  type MentorInteraction,
  type MentorResponse,
  ResponseType,
  EmotionalState,
  
  // Utility types
  type CareerFilter,
  CareerSortOption,

  // V3 Reality Domains
  type FamilyReality,
  type FamilyStructure,
  type FamilyStructureType,
  type HouseholdMember,
  type FamilyObligation,
  type ObligationType,
  type ParentalExpectation,
  type ExpectationStrength,
  type FamilySupport,
  type SupportType,
  type CulturalConstraint,
  type CulturalConstraintType,

  type EconomicReality,
  type FinancialSituation,
  type IncomeBracket,
  type EducationFinancing,
  type FundingSourceType,
  type EducationLoan,
  type Scholarship,
  type EconomicConstraint,
  type EconomicConstraintType,
  type ResourceAvailability,
  type FinancialRiskTolerance,

  type EducationalReality,
  type AcademicBackground,
  type AcademicStream,
  type EducationBoard,
  type InstitutionTier,
  type AcademicPerformance,
  type SubjectPerformance,
  type AcademicAchievement,
  type CompetitiveExam,
  type CompetitiveExamType,
  type ExamStatus,
  type InstitutionStanding,
  type LearningProfile,
  type LearningStyle,
  type LearningEnvironment,
  type EducationalOpportunity,

  type DecisionState,
  type DecisionTimeline,
  type DecisionUrgency,
  type DecisionDeadline,
  type DecisionPressure,
  type PressureSource,
  type DecisionPressureFactor,
  type InformationStatus,
  type InformationCategory,
  type InformationNeed,
  type DecisionReadiness,
  type ReadinessAspect,
  type ReadinessComponent,
  type DecisionContext,
  type LifeSituation,
  type DecisionEmotionalState,

  // V3 StudentBelief
  type StudentBeliefV3,
} from './types';

// ============================================================================
// STUDENT MODEL
// ============================================================================

export {
  // Main builder
  StudentBeliefBuilder,
  StudentBeliefQuery,
  createStudentBeliefFromAssessment,
  queryStudentBelief,
  
  // Types
  type AssessmentAnswer,
} from './student-model/StudentBelief';

// ============================================================================
// STUDENT MODEL ENGINE (V2)
// ============================================================================

export {
  // Main engine
  StudentModelEngine,
  createStudentModelEngine,
  convertAssessmentToBelief,
  createEmptyAssessment,
  createMockResponse,
  
  // Constants
  DEFAULT_SCORING_CONFIG,
  DEFAULT_ENGINE_CONFIG,
  CORE_TRAITS,
  TRAIT_DESCRIPTIONS,
  
  // Types
  type CoreTrait,
  type TraitBelief,
  type TraitEvidence,
  type StudentBeliefModel,
  type AssessmentResponse,
  type AssessmentResult,
  type QuestionType,
  type QuestionCategory,
  type ScoringRule,
  type ScoringConfiguration,
  type StudentModelEngineConfig,
  type ConversionResult,
} from './student-model/StudentModelEngine';

// ============================================================================
// STUDENT BELIEF V3 - REALITY DOMAINS
// ============================================================================

export {
  // V3 Builder
  StudentBeliefV3Builder,
  StudentBeliefV3Query,
  createStudentBeliefV3,
  queryStudentBeliefV3,
  migrateV2ToV3,
  isStudentBeliefV3,

  // Migration
  type V2ToV3MigrationOptions,
  type V2ToV3MigrationResult,

  // Reality Input Types
  type FamilyRealityInput,
  type EconomicRealityInput,
  type EducationalRealityInput,
  type DecisionStateInput,
} from './student-model/StudentBeliefV3';

// ============================================================================
// DECISION COALITION
// ============================================================================

export {
  // Main engine
  DecisionCoalitionEngine,
  createDecisionCoalitionEngine,
  formDecisionCoalition,
  createEmptyCoalitionAssessment,
  
  // Configuration
  type DecisionCoalitionEngineConfig,
  DEFAULT_DECISION_COALITION_CONFIG,
  DEFAULT_COALITION_SCORING,
  
  // Core types
  type CoalitionPressures,
  type PressureFactor,
  type DecisionCoalition,
  type Stakeholder,
  type StakeholderType,
  type CoalitionDynamics,
  type CoalitionConversionResult,
  
  // Evidence types
  type PressureEvidence,
  type StakeholderEvidence,
  type CoalitionScoringRule,
  type CoalitionScoringConfig,
  
  // Report types
  type ParentReportData,
  type CoalitionFamilyObligation,

} from './decision-coalition/DecisionCoalitionEngine';

// ============================================================================
// PATH CASCADE V2 - Career Graph & Dependency Analysis
// ============================================================================

export {
  // Main engine
  PathCascadeEngine,
  createPathCascadeEngine,
  analyzeCareerPaths,
  
  // Configuration
  type PathCascadeConfig,
  DEFAULT_PATH_CONFIG,
  
  // Career Graph
  CareerGraph,
  createIndiaCareerGraph,

  // Graph Types (GraphNode/GraphEdge/GraphPath - note: different from types/index.ts CareerNode/CareerPath)
  type CareerNodeType,
  type TransitionType,
  type Prerequisite,
  type PathMetrics,

  // Analysis Types
  type CriticalityAnalysis,
  type ClosedOption,
  type OptionalityAnalysis,
  type ReachableCareer,
  
  // Result Types
  type PathCascadeResult,
  type PathExplanations,
  type PathComparison,
  type PathCascadeStatistics,
} from './path-cascade/PathCascadeEngine';



// ============================================================================
// REGRET ENGINE
// ============================================================================

export {
  // Main engine
  RegretEngine,
  createRegretEngine,
  
  // Configuration
  type RegretEngineConfig,
  DEFAULT_REGRET_CONFIG,
  
  // Data types
  type HistoricalRegretData,
  
  // Result types
  type RegretAnalysisResult,
  type RegretMitigation,
  type AlternativePathComparison,
} from './regret-engine/RegretEngine';

// ============================================================================
// RECOMMENDATION ENGINE
// ============================================================================

export {
  // Main engine
  RecommendationEngine,
  createRecommendationEngine,
  generateRecommendations,
  
  // Configuration
  type RecommendationEngineConfig,
  DEFAULT_RECOMMENDATION_CONFIG,
  
  // Input/Result types
  type RecommendationInput,
  type RecommendationEngineResult,
  type RecommendationSummary,
  type RecommendationStatistics,
  type RecommendationWarning,
} from './recommendation-engine/RecommendationEngine';

// ============================================================================
// MENTOR ENGINE
// ============================================================================

export {
  // Main engine
  MentorEngine,
  createMentorEngine,
  getMentorGuidance,
  
  // Configuration
  type MentorEngineConfig,
  DEFAULT_MENTOR_CONFIG,
  
  // Input/Result types
  type MentorInput,
  MentorTopic,
  type MentorInteractionResult,
  type InteractionInsight,
} from './mentor/MentorEngine';

// ============================================================================
// MATCHING ENGINE V1
// ============================================================================

export {
  // Core matching functions
  calculatePsychologicalFit,
  calculateWorkStyleFit,
  calculateMotivationFit,
  calculateConstraintFit,
  matchCareer,
  matchAllCareers,
  matchStudentToCareers,
  createNeutralWorkStylePreference,
  inferWorkStylePreference,
  
  // Types
  type WorkStylePreference,
  type MatchingInput,
  type MatchingWeights,
  type TraitMatch,
  type MotivationMatch,
  type ConstraintResult,
  type MatchExplanation,
  type CareerMatch,
  type MatchingResult,
} from './matching-engine';

// ============================================================================
// EXPLAINABILITY ENGINE
// ============================================================================

export {
  // Main engine
  ExplainabilityEngine,
  explainCareerMatch,
  explainMultipleMatches,
  
  // Types
  type CareerExplanation,
  type PsychologicalExplanation,
  type TraitExplanation,
  type MotivationExplanation,
  type MotivationSatisfaction,
  type MotivationGap,
  type WorkStyleExplanation,
  type ConstraintsExplanation,
  type SpecificConstraint,
  type StrengthsExplanation,
  type RisksExplanation,
  type RiskDetail,
  type TradeoffsExplanation,
  type RecommendationExplanation,
} from './explainability-engine';

// ============================================================================
// OPTIONALITY ENGINE
// ============================================================================

export {
  // Main engine
  OptionalityEngineV1,
  calculateOptionality,
  calculateBatchOptionality,
  compareCareerOptionality,

  // Types
  type OptionalityAnalysis,
  type OptionalityDimensionScore,
  type AdjacentCareer,
  type SkillCategory,
  type OptionalityWeights,
  type OptionalityCalculationOptions,
} from './optionality-engine';

// ============================================================================
// CAREER TRANSITION GRAPH
// ============================================================================

export {
  // Main graph
  CareerTransitionGraphV1,
  createCareerTransitionGraph,
  findCareerTransitionPath,
  getReachableCareersFrom,

  // Types
  type CareerNode,
  type CareerEdge,
  type CareerTransitionPath,
  type AdjacentCareer,
  type ReachableCareer,
  type GraphStatistics,
  type GraphTraversalOptions,
  type ShortestPathOptions,
  type TransitionType,
  type TransitionPrerequisite,
  type SkillCategory,
  type NodeId,
  type EdgeId,
} from './career-transition-graph';

// ============================================================================
// CRITICALITY ENGINE
// ============================================================================

export {
  // Main engine
  CriticalityEngineV1,
  calculateCriticality,
  compareCriticality,
  calculateBatchCriticality,

  // Types
  type CriticalityAnalysis,
  type CriticalityMetric,
  type CriticalityCalculationOptions,
  type CriticalityWeights,
  type CriticalityComparison,
  type BatchCriticalityResult,
  type CriticalityId,
} from './criticality-engine';

// ============================================================================
// CAREER PATH EXPLORER
// ============================================================================

export {
  // Main engine
  CareerPathExplorerV1,
  exploreCareerPaths,
  exploreSinglePath,

  // Types
  type CareerPathExplorerResult,
  type ExploredCareerPath,
  type PathMetrics,
  type PathScores,
  type PathExplanation,
  type PathComparison,
  type PathRecommendation,
  type PathExplorerOptions,
  type PathFilters,
  type RiskAssessment,
  type RiskFactor,
  type PathType,
  type PathStrategy,
  type PathDifference,
  type PathExplorerId,
} from './path-explorer';

// ============================================================================
// DECISION COALITION V3
// ============================================================================

export {
  // Main engine
  DecisionCoalitionEngineV3,
  analyzeDecisionCoalition,

  // Types
  type DecisionCoalitionAnalysis,
  type PathCoalitionAnalysis,
  type CoalitionMemberEvaluation,
  type CoalitionMember,
  type MemberConflict,
  type CoalitionExplanation,
  type CoalitionPathComparison,
  type CoalitionRecommendation,
  type CoalitionAnalysisOptions,
  type CoalitionAnalysisId,
} from './decision-coalition-v3';

// ============================================================================
// REGRET FUNCTIONAL V2
// ============================================================================

export {
  // Main engine
  RegretFunctionalV2,
  analyzeRegret,

  // Types
  type RegretAnalysis,
  type PathRegretAnalysis,
  type RegretFactor,
  type RegretComponent,
  type RegretExplanation,
  type RegretPathComparison,
  type RegretAnalysisOptions,
  type RegretAnalysisId,
  type RegretType,
} from './regret-functional';

// ============================================================================
// DECISION INTELLIGENCE ENGINE V1
// ============================================================================

export {
  // Main engine
  DecisionIntelligenceEngineV1,
  generateDecision,

  // Types
  type DecisionRecommendation,
  type DecisionAlternative,
  type DecisionConfidence,
  type DecisionReasoning,
  type DecisionTradeoffs,
  type RecommendationStrength,
  type RecommendationCaveat,
  type DecisionFactors,
  type PathDecisionScore,
  type DecisionIntelligenceOptions,
  type DecisionIntelligenceId,
  type DecisionTier,
  type DecisionUrgency,
} from './decision-intelligence';

// ============================================================================
// CAREER SIMILARITY ENGINE
// ============================================================================

export {
  // Main engine
  CareerSimilarityEngine,
  createSimilarityEngine,
  quickSimilarity,
  SimilarityEngines,
  DEFAULT_WEIGHTS,

  // Types
  type DimensionSimilarity,
  type CareerSimilarityResult,
  type SimilarityExplanation,
  type SimilarityOptions,
  type DimensionWeights,
  type BatchSimilarityResult,
  type SimilarityStatistics,
} from './similarity-engine';

// ============================================================================
// SIMILAR STUDENT ENGINE
// ============================================================================

export {
  // Main engine
  SimilarStudentEngine,
  createSimilarStudentEngine,
  quickSimilarity as quickStudentSimilarity,
  findSimilarStudentsQuick,

  // Calculators
  calculatePsychologicalSimilarity,
  calculateEconomicSimilarity,
  calculateEducationalSimilarity,
  calculateUtilitySimilarity,
  calculateLifestyleSimilarity,
  calculateOverallSimilarity,

  // Explanations
  generateExplanation,
  generateSimpleExplanation,
  generateDimensionExplanation,

  // Presets & Config
  SimilarityPresets as StudentSimilarityPresets,
  DEFAULT_CONFIG as DEFAULT_STUDENT_SIMILARITY_CONFIG,

  // Types
  type SimilarityScore,
  type DimensionSimilarity as StudentDimensionSimilarity,
  type SimilarityDetail as StudentSimilarityDetail,
  type SimilarityAnalysis as StudentSimilarityAnalysis,
  type SimilarityExplanation as StudentSimilarityExplanation,
  type SimilarStudentMatch,
  type SimilarityFactor,
  type DifferenceFactor,
  type FindSimilarStudentsInput,
  type FindSimilarStudentsOutput,
  type SimilarityDimension,
  type DimensionWeights as StudentDimensionWeights,
  type SimilarityStatistics as StudentSimilarityStatistics,
  type SimilarStudentEngineConfig,
} from './similar-student-engine';

// ============================================================================
// OUTCOME EVIDENCE ENGINE
// ============================================================================

export {
  // Main engine
  OutcomeEvidenceEngine,
  createOutcomeEvidenceEngine,
  generateQuickEvidence,
  batchComparePaths,

  // Analysis functions
  calculateMean,
  calculateStdDev,
  calculateMedian,
  calculateCohensD,
  welchTTest,
  determineSignificance,
  determineDirection,
  calculateConfidenceInterval,
  extractOutcomeValues,
  getSatisfactionScore,
  getSuccessIndicator,
  matchesTraitFilters,
  compareOutcomeGroups,
  calculateEvidenceQuality,
  calculateConsistencyScore,
  calculateConfidenceFromStats,
  calculateDataQuality,

  // Explanations
  generateEvidenceExplanation,
  generateDerivationExplanation,
  generateOneSentenceSummary,
  generateAudienceExplanation,
  formatEffectDirection,

  // Enums
  OutcomeEvidenceType,
  EvidenceQuality,
  EffectDirection,
  StatisticalSignificance,

  // Config
  DEFAULT_OUTCOME_EVIDENCE_CONFIG,

  // Types
  type OutcomeEvidenceId,
  type OutcomeEvidence,
  type TraitFilter,
  type GenerateEvidenceInput,
  type GenerateEvidenceOutput,
  type OutcomeGroupComparison,
  type MetricComparison,
  type EvidenceQuery,
  type EvidenceQueryResult,
  type EvidenceDerivationExplanation,
  type DerivationStep,
  type OutcomeEvidenceEngineConfig,
} from './outcome-evidence-engine';

// ============================================================================
// RECOMMENDATION FEEDBACK LOOP
// ============================================================================

export {
  // Main engine
  RecommendationFeedbackEngine,
  createRecommendationFeedbackEngine,
  quickAnalyze,
  calculateSimpleAccuracy,

  // Measurement functions
  measurePathChoiceAccuracy,
  measureSatisfactionAccuracy,
  measureUtilityAccuracy,
  measureRegretAccuracy,
  measureConfidenceCalibration,
  calculateCalibrationMetrics,
  calculateTypeAccuracyMetrics,
  calculatePathAccuracyMetrics,
  calculateOverallAccuracy,

  // Signal generation
  generateLearningSignals,
  generateImprovementSignals,

  // Enums
  AccuracyType,
  ComparisonResult,
  LearningSignalType,
  ImprovementArea,

  // Config
  DEFAULT_FEEDBACK_CONFIG,

  // Types
  type FeedbackAnalysisId,
  type RecommendationOutcomePair,
  type AccuracyMeasurement,
  type RecommendationAccuracyAnalysis,
  type ConfidenceCalibration,
  type AggregateAccuracyMetrics,
  type TypeAccuracyMetrics,
  type PathAccuracyMetrics,
  type SegmentAccuracyMetrics,
  type CalibrationMetrics,
  type LearningSignal,
  type RecommendationImprovementSignal,
  type FeedbackLoopInput,
  type FeedbackLoopOutput,
  type RecommendationFeedbackConfig,
} from './recommendation-feedback-loop';

// ============================================================================
// VALUE EVOLUTION ENGINE
// ============================================================================

export {
  // Main engine
  ValueEvolutionEngine,
  createValueEvolutionEngine,
  quickValueAnalysis,
  createValueSnapshot,

  // Detection algorithms
  detectEvolutionPattern,
  detectValueShifts,
  detectValueDrift,
  analyzeValueStability,
  analyzeDominantValues,
  forecastTrajectory,

  // Constants
  TRACKED_VALUES,
  VALUE_DISPLAY_NAMES,
  VALUE_TO_UTILITY_ATTRIBUTE,
  DEFAULT_VALUE_EVOLUTION_CONFIG,

  // Types
  type TrackedValueId,
  type ValueSnapshot,
  type SnapshotSource,
  type SnapshotContext,
  type ValueHistory,
  type EvolutionPattern,
  type ValueEvolution,
  type ValueShift,
  type ValueDrift,
  type ValueStability,
  type DominantValueAnalysis,
  type ValueTrajectoryForecast,
  type ForecastMethod,
  type ValueEvolutionAnalysis,
  type ValueInsight,
  type InsightType,
  type ValueEvolutionRecommendation,
  type ValueEvolutionInput,
  type ValueEvolutionConfig,
} from './value-evolution-engine';

// ============================================================================
// IDENTITY DEVELOPMENT ENGINE
// ============================================================================

export {
  // Main engine
  IdentityDevelopmentEngine,
  createIdentityDevelopmentEngine,
  quickIdentityAnalysis,
  getArchetypeDefinition,
  getArchetypeDisplayName,

  // Detection algorithms
  extractSignalsFromBelief,
  calculateArchetypeScores,
  calculateIdentityConfidence,
  determineIdentityStatus,
  detectConflicts,
  detectTransitions,
  determineEvolutionPattern,
  generateInsights,

  // Constants
  IDENTITY_ARCHETYPES,
  ARCHETYPE_DISPLAY_NAMES,
  ARCHETYPE_DEFINITIONS,
  DEFAULT_IDENTITY_CONFIG,

  // Types
  type IdentityArchetypeId,
  type ArchetypeDefinition,
  type IdentitySignal,
  type SignalType,
  type SignalSource,
  type IdentityProfile,
  type IdentityConfidence,
  type IdentityConflict,
  type ConflictType,
  type IdentityStatus,
  type IdentityEvolution,
  type IdentitySnapshot,
  type IdentityTransition,
  type TransitionType,
  type EvolutionPattern,
  type PrimaryIdentityRecord,
  type IdentityAnalysisInput,
  type IdentityAnalysisOptions,
  type IdentityAnalysisOutput,
  type IdentityInsight,
  type InsightType,
  type IdentityRecommendation,
  type IdentityDevelopmentConfig,
} from './identity-development-engine';

// ============================================================================
// PERSONAL GROWTH ENGINE
// ============================================================================

export {
  // Main engine
  PersonalGrowthEngine,
  createPersonalGrowthEngine,
  quickGrowthAnalysis,
  getDimensionDisplayName,
  getGrowthDimensions,

  // Analysis algorithms
  assessCurrentState,
  assessPotential,
  analyzeGaps,
  generateTrajectory,
  generateInsights,
  generateRecommendations,

  // Constants
  GROWTH_DIMENSIONS,
  DIMENSION_DISPLAY_NAMES,
  DIMENSION_DESCRIPTIONS,
  DEFAULT_PERSONAL_GROWTH_CONFIG,

  // Types
  type GrowthDimension,
  type GrowthState,
  type GrowthIndicator,
  type CurrentGrowthState,
  type PotentialState,
  type GrowthPotential,
  type GrowthGap,
  type GrowthGapAnalysis,
  type TrajectoryPoint,
  type DimensionTrajectory,
  type GrowthTrajectory,
  type PersonalGrowthAnalysis,
  type GrowthInsight,
  type GrowthInsightType,
  type GrowthRecommendation,
  type PersonalGrowthInput,
  type PersonalGrowthOptions,
  type PersonalGrowthConfig,
} from './personal-growth-engine';

// ============================================================================
// LONGITUDINAL INTELLIGENCE ENGINE
// ============================================================================

export {
  // Main engine
  LongitudinalIntelligenceEngine,
  createLongitudinalIntelligenceEngine,
  quickLongitudinalAnalysis,
  getEventTypeLabel,
  getEventTypes,

  // Analysis algorithms
  generateTimeline,
  detectTransitions,
  identifyMilestones,
  analyzeDecisionPatterns,
  generateInsights,
  generatePredictions,

  // Constants
  TIMELINE_EVENT_TYPES,
  EVENT_TYPE_LABELS,
  TRANSITION_TYPES,
  MILESTONE_TYPES,
  DECISION_PATTERN_TYPES,
  DEFAULT_LONGITUDINAL_CONFIG,

  // Types
  type TimelineEvent,
  type TimelineEventType,
  type AssessmentEvent,
  type DecisionEvent,
  type ValueShiftEvent,
  type IdentityTransitionEvent,
  type OutcomeEvent,
  type MilestoneEvent,
  type StudentTimeline,
  type TimelineSummary,
  type MajorTransition,
  type TransitionType,
  type GrowthMilestone,
  type MilestoneType,
  type DecisionPattern,
  type DecisionPatternType,
  type LongitudinalAnalysis,
  type LongitudinalInsight,
  type LongitudinalInsightType,
  type LongitudinalPrediction,
  type AssessmentSnapshot,
  type DecisionRecord,
  type OutcomeRecord,
  type LongitudinalAnalysisInput,
  type LongitudinalOptions,
  type LongitudinalConfig,
} from './longitudinal-intelligence-engine';

// ============================================================================
// ADAPTIVE MENTOR FOUNDATION
// ============================================================================

export {
  // Main foundation
  AdaptiveMentorFoundation,
  createAdaptiveMentorFoundation,
  quickMentorAnalysis,
  generateSatisfactionGapWarning,

  // Analysis algorithms
  buildMentorContext,
  generateInsights,
  generateGrowthObservations,
  generateDecisionWarnings,

  // Constants
  DEFAULT_MENTOR_FOUNDATION_CONFIG,

  // Types
  type MentorContext,
  type StudentStateSnapshot,
  type HistoricalPatterns,
  type StateContrast,
  type ContrastType,
  type ActiveConsideration,
  type ConsiderationCategory,
  type GuidancePriority,
  type MentorInsight,
  type MentorInsightType,
  type GrowthObservation,
  type GrowthObservationType,
  type DecisionWarning,
  type DecisionWarningType,
  type MentorFoundationOutput,
  type MentorFoundationInput,
  type MentorFoundationOptions,
  type MentorFoundationConfig,
} from './adaptive-mentor-foundation';

// ============================================================================
// COUNTERFACTUAL ENGINE
// ============================================================================

export {
  // Main engine
  CounterfactualEngine,
  createCounterfactualEngine,
  comparePaths,
  DEFAULT_COUNTERFACTUAL_CONFIG,

  // CareerV2 Adapter
  adaptCareerToPathData,
  adaptCareersForComparison,
  createCareerComparisonPair,
  DEFAULT_ADAPTER_CONFIG,

  // Comparison Factories
  compareMedicineVsSoftwareEngineering,
  compareAIEngineerVsDataScientist,
  compareEngineerVsProductManager,
  compareBankingVsEngineering,
  compareCivilServicesVsCorporate,
  compareCAVsEngineering,
  compareLawVsEngineering,
  compareDesignVsEngineering,
  compareResearchVsIndustry,
  compareConsultingVsEngineering,
  compareCareersBySlug,
  compareAnyCareers,
  compareAgainstAlternatives,
  getAllComparisonScenarios,
  getComparisonsByCategory,

  // Types
  type CounterfactualComparison,
  type PathComparisonData,
  type ComparisonSummary,
  type PathDifferences,
  type DurationDifference,
  type EducationDifference,
  type CostDifference,
  type PrestigeDifference,
  type EntryRequirementsDifference,
  type DifficultyComparison,
  type ProgressionDifference,
  type SpeedComparison,
  type CeilingComparison,
  type OpportunityComparison,
  type SkillsDifference,
  type TransferabilityComparison,
  type GeographyDifference,
  type LocationRequirementComparison,
  type LifestyleDifference,
  type ComparisonScore,
  type OpportunitiesAnalysis,
  type Opportunity,
  type OpportunityCategory,
  type OpportunityCostSummary,
  type OptionalityComparison,
  type OptionalityTimePoint,
  type PivotPotentialComparison,
  type PreservationComparison,
  type RegretComparison,
  type RegretCategory,
  type RegretLevelComparison,
  type RegretTimePointComparison,
  type RegretMinimizationStrategy,
  type IncomeComparison,
  type IncomePointComparison,
  type IncomeTrajectoryComparison,
  type YearlyIncomeComparison,
  type GrowthRateComparison,
  type CrossoverPoint,
  type CumulativeEarningsComparison,
  type StabilityComparison,
  type TimelineComparison,
  type MilestoneComparison,
  type EducationTimelineComparison,
  type CareerTimelineComparison,
  type TimeComparison,
  type RiskComparison,
  type RiskCategoryComparison,
  type RiskTimePoint,
  type RiskMitigationComparison,
  type SatisfactionComparison,
  type SatisfactionDimensionComparison,
  type SatisfactionTrajectoryPoint,
  type CoalitionImpactComparison,
  type ComparisonExplanation,
  type TradeOff,
  type DecisionFramework,
  type CounterfactualInput,
  type CounterfactualConfig,
  type CareerAdapterConfig,
} from './counterfactual-engine';

// Future Explorer
export {
  FutureExplorerV1,
  createFutureExplorer,
  exploreFutures,
  quickPathComparison,
  compareScenariosAcrossFutures,
  DEFAULT_FUTURE_EXPLORER_CONFIG,
} from './future-explorer';

export type {
  FutureExplorerId,
  FutureContext,
  FutureCharacteristic,
  FutureComparison,
  FutureComparisonDimension,
  FutureRanking,
  FutureTradeoff,
  FutureWinners,
  PathComparisonAcrossFutures,
  PathComparisonMetric,
  PathSimilarity,
  PathDifference,
  ConvergencePoint,
  DivergencePoint,
  ScenarioComparisonAcrossFutures,
  CrossScenarioAnalysis,
  ScenarioOutcomeRange,
  ScenarioExtremes,
  RegretComparisonAcrossFutures,
  FutureRegret,
  ComparativeRegretAnalysis,
  RegretMinimizationRecommendation,
  OptionalityComparisonAcrossFutures,
  FutureOptionality,
  ComparativeOptionalityAnalysis,
  OptionalityPreservationStrategy,
  FutureExplorerResult,
  FutureExplorerExplanation,
  FutureDecisionFramework,
  FutureExplorerRecommendation,
  FutureExplorerInput,
  FutureExplorerConfig,
} from './future-explorer';

// Career Graph V2
export {
  CareerGraphV2,
  createCareerGraphV2,
  calculateTransitionQuality,
  calculateTransitionDifficulty,
  calculateSkillTransferability,
  calculateOptionalityGain,
  calculateFutureStrength,
  calculateTransitionProbability,
  calculateTransitionCost,
  calculateTransitionTime,
  createTransitionEdge,
  createTransitionEdgeWithQuality,
  createAdjacentTransition,
  createProgressionTransition,
  createSpecializationTransition,
  createPivotTransition,
  createCrossDomainTransition,
  createFoundationalTransition,
  calculatePathMetrics,
  calculatePathQuality,
  filterTransitions,
  findBestTransitions,
  findViablePaths,
  compareTransitions,
  calculateTransitionMetrics,
  DEFAULT_CAREER_GRAPH_V2_CONFIG,
} from './career-graph-v2';

export type {
  TransitionEdgeId,
  RelationshipType,
  EvidenceConfidence,
  CareerTransitionEdge,
  TransitionOpportunityScore,
  TransitionMetrics,
  CareerTransitionPath,
  TransitionFilter,
  CareerGraphV2Config,
} from './career-graph-v2';

// Skill Taxonomy V1
export {
  SkillTaxonomyV1,
  createSkillTaxonomy,
  createSkillNode,
  createCareerSkillRequirement,
  createCareerSkillProfile,
  createStudentSkillInventory,
  getCareerSkillProfile,
  calculateSkillOverlap,
  calculateSkillGap,
  calculateSkillTransferability,
  calculateSkillSimilarity,
  findAdjacentSkills,
  findEmergingSkills,
  generateSkillGapReport,
  proficiencyToScore,
  compareProficiency,
  meetsProficiencyRequirement,
  DEFAULT_SKILL_TAXONOMY_CONFIG,
} from './skill-taxonomy';

export type {
  SkillId,
  SkillCategory,
  ProficiencyLevel,
  SkillNode,
  CareerSkillRequirement,
  CareerSkillProfile,
  StudentSkillInventory,
  SkillGap,
  SkillGapReport,
  SkillSimilarity,
  TransferabilityAnalysis,
  SkillFilter,
  SkillTaxonomyConfig,
} from './skill-taxonomy';

// Skill Transition Engine V1
export {
  SkillTransitionEngineV1,
  createSkillTransitionEngine,
  analyzeCareerTransition,
  compareTransitions,
  generateCareerGraphEdgeData,
  generateOptionalityData,
  generatePathExplorerData,
  DEFAULT_SKILL_TRANSITION_CONFIG,
} from './skill-transition-engine';

export type {
  TransitionAnalysisId,
  SkillMatch,
  MissingSkill,
  TransferableSkill,
  LearningPath,
  SkillTransitionAnalysis,
  SkillTransitionEngineConfig,
  SkillTransitionInput,
  TransitionComparison,
} from './skill-transition-engine';

// Career Expansion Engine V1
export {
  CareerExpansionEngineV1,
  createCareerExpansionEngine,
  findSimilarCareers,
  suggestAdjacentCareers,
  generateTransitionCandidates,
  calculateExpansionConfidence,
  careerCoverageAnalysis,
  graphDensityAnalysis,
  suggestCareerExpansions,
  executeCareerExpansion,
  DEFAULT_CAREER_EXPANSION_CONFIG,
} from './career-expansion-engine';

export type {
  ExpansionAnalysisId,
  CareerSimilarity,
  AdjacentCareer,
  TransitionCandidate,
  ExpansionConfidence,
  CareerCoverageAnalysis,
  GraphDensityAnalysis,
  CareerExpansionCandidate,
  CareerExpansionEngineConfig,
  ExpansionResult,
} from './career-expansion-engine';

// MAUT Foundation V1
export {
  MAUTFoundationV1,
  createMAUTFoundation,
  validateUtilityProfile,
  normalizeUtilityWeights,
  checkUtilityConsistency,
  calculateUtilityScore,
  generateUtilityExplanation,
  compareUtilityScores,
  createDefaultUtilityProfile,
  createUtilityProfile,
  createCareerPathUtilityData,
  CORE_UTILITY_ATTRIBUTES,
  DEFAULT_MAUT_CONFIG,
} from './maut-foundation';

export type {
  UtilityAttributeId,
  UtilityAttributeCategory,
  UtilityAttribute,
  StudentUtilityProfile,
  CareerPathUtilityData,
  UtilityScore,
  UtilityExplanation,
  UtilityValidationResult,
  UtilityComparison,
  MAUTConfig,
} from './maut-foundation';

// Utility Discovery Engine V1
export {
  UtilityDiscoveryEngineV1,
  createUtilityDiscoveryEngine,
  analyzeTradeoffChoices,
  generateTradeoffScenarios,
  detectValueConflicts,
  calculateWeightConfidences,
  trackUtilityEvolution,
  generateWeightExplanations,
  discoverUtilityProfile,
  DEFAULT_UTILITY_DISCOVERY_CONFIG,
} from './utility-discovery-engine';

export type {
  DiscoveryAnalysisId,
  BehavioralSignalType,
  BehavioralSignal,
  TradeoffScenario,
  TradeoffResponse,
  ValueConflict,
  WeightConfidence,
  UtilityEvolutionSnapshot,
  WeightExplanation,
  UtilityDiscoveryResult,
  UtilityDiscoveryConfig,
} from './utility-discovery-engine';

// Decision Optimization Engine V1
export {
  DecisionOptimizationEngineV1,
  createDecisionOptimizationEngine,
  calculateExpectedUtility,
  calculateParetoFrontier,
  analyzeTradeoffs,
  generateDecisionExplanation,
  findBestByAttribute,
  findBestByCoalition,
  findBestByRegret,
  findBestByOptionality,
  generateOptimalDecisionSet,
  DEFAULT_OPTIMIZATION_CONFIG,
} from './decision-optimization-engine';

export type {
  PathId,
  DecisionOption,
  ExpectedUtility,
  OptimalDecision,
  OptimalDecisionSet,
  PathTradeoff,
  TradeoffAnalysis,
  DecisionExplanation,
  ParetoPoint,
  OptimizationConfig,
} from './decision-optimization-engine';

// Pareto Frontier Engine V1
export {
  ParetoFrontierEngineV1,
  createParetoFrontierEngine,
  isDominated,
  computeParetoFrontier as computeParetoFrontierV2,
  analyzeTradeoffs as analyzeParetoTradeoffs,
  classifyLifeStrategy,
  generateFrontierExplanations,
  generateFrontierGuidance,
  analyzeParetoFrontier,
  DEFAULT_PARETO_CONFIG,
} from './pareto-frontier-engine';

export type {
  ParetoFrontierId,
  LifeStrategyType,
  ParetoCandidate,
  ParetoFrontierResult,
  LifeStrategyClassification,
  PathTradeoff as ParetoPathTradeoff,
  TradeoffDimension,
  TradeoffAnalysis as ParetoTradeoffAnalysis,
  FrontierExplanations,
  FrontierGuidance,
  ParetoFrontierConfig,
} from './pareto-frontier-engine';

// Uncertainty Engine V1
export {
  UncertaintyEngineV1,
  createUncertaintyEngine,
  confidenceToLevel,
  getConfidenceDescription,
  calculateStudentProfileConfidence,
  calculateCareerDataConfidence,
  calculateGraphQualityConfidence,
  calculateSimulationConfidence,
  generateUncertaintyProfile,
  DEFAULT_UNCERTAINTY_CONFIG,
} from './uncertainty-engine';

export type {
  ConfidenceLevel,
  UncertaintyProfile,
  ComponentConfidence,
  StudentProfileConfidence,
  CareerDataConfidence,
  GraphQualityConfidence,
  SimulationConfidence,
  UncertaintyEngineConfig,
} from './uncertainty-engine';

// Confidence Propagation Engine V1
export {
  ConfidencePropagationEngineV1,
  createConfidencePropagationEngine,
  aggregateConfidence,
  propagateConfidence,
  buildPropagationGraph,
  explainConfidence,
  calculateFinalDecisionConfidence,
  extractMatchingConfidence,
  extractOptionalityConfidence,
  extractCriticalityConfidence,
  extractPathExplorerConfidence,
  extractCoalitionConfidence,
  extractRegretConfidence,
  extractDecisionOptimizationConfidence,
  extractParetoFrontierConfidence,
  DEFAULT_CONFIDENCE_PROPAGATION_CONFIG,
} from './confidence-propagation-engine';

export type {
  EngineId,
  ConfidenceSource,
  ConfidenceNode,
  AggregatedConfidence,
  FinalDecisionConfidence,
  ComponentConfidenceResult,
  ConfidencePropagationConfig,
} from './confidence-propagation-engine';

// Confidence-Aware Recommendation Layer V1
export {
  ConfidenceAwareRecommendationEngineV1,
  createConfidenceAwareRecommendationEngine,
  calculateUtilityBounds,
  classifyRecommendationStrength,
  calculateDecisionRisk,
  generateRecommendationExplanation,
  buildConfidenceAwareRecommendation,
  buildRecommendationSet,
  DEFAULT_CONFIDENCE_AWARE_CONFIG,
} from './confidence-aware-recommendation';

export type {
  RecommendationId,
  RecommendationStrength,
  DecisionRiskLevel,
  UtilityBounds,
  ConfidenceAwareRecommendation,
  ConfidenceAwareRecommendationSet,
  ConfidenceAwareRecommendationConfig,
} from './confidence-aware-recommendation';

// Information Value Engine V1
export {
  InformationValueEngineV1,
  createInformationValueEngine,
  analyzeInformationValue,
  identifyUncertaintyFactors,
  identifyMissingEvidence,
  identifyWeakAssumptions,
  generateRecommendedActions,
  generateStrategy,
  generateExplanation,
  DEFAULT_INFORMATION_VALUE_CONFIG,
} from './information-value-engine';

export type {
  InformationType,
  InformationMethod,
  UncertaintyFactor,
  MissingEvidence,
  WeakAssumption,
  RecommendedAction,
  AssessmentRecommendation,
  ExperimentRecommendation,
  ExplorationActivity,
  InformationValueAnalysis,
  InformationValueConfig,
} from './information-value-engine';

// Outcome Tracking Engine V1
export {
  OutcomeTrackingEngineV1,
  createOutcomeTrackingEngine,
  createOutcomeRecord,
  createOutcomeSnapshot,
  recordAction,
  aggregateOutcomes,
  DEFAULT_OUTCOME_TRACKING_CONFIG,
} from './outcome-tracking-engine';

export type {
  OutcomeRecordId,
  StudentId,
  RecommendationId,
  PathId,
  SnapshotId,
  OutcomeTimepoint,
  EducationProgress,
  SkillGrowth,
  IncomeGrowth,
  SatisfactionMetrics,
  StressMetrics,
  RegretMetrics,
  ConfidenceMetrics,
  OutcomeSnapshot,
  ActionTaken,
  OutcomeRecord,
  OutcomeQuery,
  OutcomeAggregation,
  OutcomeRepository,
  OutcomeTrackingConfig,
} from './outcome-tracking-engine';

// ============================================================================
// VALUE OF INFORMATION ENGINE
// ============================================================================

export {
  // Main engine
  ValueOfInformationEngine,
  createValueOfInformationEngine,
  analyzeValueOfInformation,

  // Components
  InformationGapDetector,
  createInformationGapDetector,
  ValueOfInformationCalculator,
  createValueOfInformationCalculator,
  InformationPrioritizer,
  createInformationPrioritizer,
  ExperimentRecommender,
  createExperimentRecommender,
  VoIExplanationEngine,
  createVoIExplanationEngine,

  // Constants
  DEFAULT_VOI_CONFIG,
  INFORMATION_GAP_CATEGORY_LABELS,
} from './value-of-information-engine';

export type {
  // Core types
  VoIAnalysisId,
  InformationGapCategory,
  InformationMethod,
  ExperimentType,

  // Main interfaces
  InformationGap,
  InformationOpportunity,
  ExperimentRecommendation,
  ValueOfInformationCalculation,
  VoIExplanation,
  ValueOfInformationReport,

  // Input/Output
  ValueOfInformationInput,
  ValueOfInformationEngineConfig,

  // Results
  GapDetectionResult,
  PrioritizationResult,
  ExperimentRecommendationResult,
} from './value-of-information-engine';

// ============================================================================
// DECISION TREE ENGINE
// ============================================================================

export {
  // Main engine
  DecisionTreeEngine,
  createDecisionTreeEngine,
  analyzeDecisionTree,

  // Components
  DecisionTreeGenerator,
  createDecisionTreeGenerator,
  DecisionPathEvaluator,
  createDecisionPathEvaluator,
  DecisionBranchAnalyzer,
  createDecisionBranchAnalyzer,
  DecisionExplanationEngine,
  createDecisionExplanationEngine,

  // Constants
  DEFAULT_DECISION_TREE_CONFIG,
} from './decision-tree-engine';

export type {
  // Core types
  DecisionTreeId,
  DecisionTreeNodeType,
  DecisionType,
  RiskLevel,
  UpsideLevel,
  OptionalityLevel,

  // Main interfaces
  DecisionTreeNode,
  DecisionTreeEdge,
  DecisionTree,
  DecisionPathEvaluation,
  DecisionBranchAnalysis,
  CriticalDecisionPoint,
  BranchingOpportunity,
  DecisionTreeAnalysis,

  // Input/Output
  DecisionTreeInput,
  DecisionTreeEngineConfig,
  DecisionTreeExplanation,

  // Results
  TreeGenerationResult,
} from './decision-tree-engine';

// ============================================================================
// INTELLIGENCE CONSISTENCY ENGINE
// ============================================================================

export {
  // Main engine
  ConsistencyEngine,
  createConsistencyEngine,
  validateConsistency,
  isConsistent,

  // Constants
  DEFAULT_CONSISTENCY_CONFIG,

  // Utilities
  validateInput,
  calculateValueDistance,
  detectDirectionalConflict,
  normalizeScore,
  weightedAverage,
  calculateStdDev,
  inRange,
  clamp,
  formatConfidence,
  approximatelyEqual,
  getSeverityColor,
  getConsistencyColor,
  deepMerge,
} from './consistency-engine';

export type {
  // Core types
  ConsistencyId,
  ViolationSeverity,
  ConsistencyType,
  EngineSource,

  // Input types
  IntelligenceResults,
  UtilityResults,
  UtilityComponent,

  // Violation types
  ConsistencyViolation,
  ConflictingValue,
  ResolutionRecommendation,

  // Agreement types
  EngineAgreement,

  // Reasoning graph types
  ReasoningGraph,
  ReasoningNode,
  ReasoningEdge,

  // Weak chain types
  WeakReasoningChain,
  ReasoningStep,

  // Override and conflict types
  OverrideDetection,
  EngineConflict,

  // Report types
  ConsistencyReport,
  ConsistencyInterpretation,
  TopRecommendation,
  ConsistencyStatistics,

  // Rule types
  ConsistencyRule,
  RuleConfiguration,

  // Configuration types
  ConsistencyEngineConfig,
  ConsistencyAnalysisOptions,
} from './consistency-engine';

// ============================================================================
// REAL OPTIONS THEORY ENGINE
// ============================================================================

export {
  // Main engine
  RealOptionsEngine,
  createRealOptionsEngine,
  analyzeCareerOptions,
  compareCareerOptions,

  // Calculators
  OptionValueCalculator,
  createOptionValueCalculator,
  FlexibilityCalculator,
  createFlexibilityCalculator,
  ReversibilityCalculator,
  createReversibilityCalculator,
  FutureOpportunityCalculator,
  createFutureOpportunityCalculator,
  CommitmentCostEngine,
  createCommitmentCostEngine,
  OptionNarrativeEngine,
  createOptionNarrativeEngine,

  // Constants
  DEFAULT_REAL_OPTIONS_CONFIG,
} from './real-options-engine';

export type {
  // Core types
  RealOptionsId,
  CareerId,
  RealOptionsScore,
  CommitmentLevel,
  LockInType,
  OptionValueRating,

  // Career Option
  CareerOption,

  // Calculations
  OptionValueCalculation,
  FlexibilityCalculation,
  ReversibilityCalculation,
  FutureOpportunityCalculation,
  CommitmentCostCalculation,

  // Analysis
  RealOptionsAnalysis,
  RealOptionsInput,
  RealOptionsComparison,
  RealOptionsComparisonInput,

  // Configuration
  RealOptionsEngineConfig,
} from './real-options-engine';

// ============================================================================
// BAYESIAN BELIEF UPDATING ENGINE
// ============================================================================

export {
  // Main engine
  BayesianBeliefEngine,
  createBayesianBeliefEngine,
  updateStudentBeliefs,
  processEvidenceEvent,

  // Components
  EvidenceWeightEngine,
  createEvidenceWeightEngine,
  PosteriorCalculator,
  createPosteriorCalculator,
  BeliefConfidenceEngine,
  createBeliefConfidenceEngine,
  ContradictionDetector,
  createContradictionDetector,
  BeliefNarrativeEngine,
  createBeliefNarrativeEngine,

  // Constants
  DEFAULT_BAYESIAN_CONFIG,
} from './bayesian-belief-engine';

export type {
  // Core types
  BeliefUpdateId,
  EvidenceId,
  BeliefType,
  EvidenceType,
  ConfidenceLevel,
  StabilityLevel,

  // Main interfaces
  BeliefNode,
  EvidenceEvent,
  BeliefUpdate,
  EvidenceWeight,
  BeliefConfidence,
  Contradiction,
  BeliefHistory,
  UpdatedStudentBelief,

  // Input/Output
  BeliefUpdateInput,
  ProcessEvidenceInput,

  // Narrative
  BeliefNarrative,

  // Configuration
  BayesianBeliefConfig,
} from './bayesian-belief-engine';

// ============================================================================
// PROSPECT THEORY & COGNITIVE BIAS ENGINE
// ============================================================================

export {
  // Main engine
  ProspectTheoryEngine,
  createProspectTheoryEngine,
  analyzeBiases,
  generateDistortionReport,

  // Detectors
  LossAversionDetector,
  SocialConformityDetector,
  StatusBiasDetector,
  AuthorityInfluenceDetector,
  RiskPerceptionEngine,
  OptimismBiasDetector,
  SunkCostDetector,
  createLossAversionDetector,
  createSocialConformityDetector,
  createStatusBiasDetector,
  createAuthorityInfluenceDetector,
  createRiskPerceptionEngine,
  createOptimismBiasDetector,
  createSunkCostDetector,

  // Analysis
  BiasImpactAnalysis,
  createBiasImpactAnalysis,

  // Explanation
  BiasExplanationEngine,
  createBiasExplanationEngine,

  // Constants
  DEFAULT_PROSPECT_THEORY_CONFIG,
} from './prospect-theory-engine';

export type {
  // Core types
  BiasAnalysisId,
  BiasType,
  BiasSignalSource,
  BiasSeverity,
  DistortionScore,

  // Main interfaces
  BiasProfile,
  BiasSignal,
  BiasImpact,
  RiskPerception,
  DecisionDistortion,
  BiasAnalysis,
  BiasExplanation,
  DecisionDistortionReport,

  // Input/Output
  BiasDetectionInput,

  // Configuration
  ProspectTheoryConfig,
} from './prospect-theory-engine';

// ============================================================================
// META-DECISION INTELLIGENCE ENGINE
// ============================================================================

export {
  // Main engine
  MetaDecisionEngine,
  createMetaDecisionEngine,
  analyzeDecisionQuality,

  // Sub-engines
  DecisionReadinessEngine,
  createDecisionReadinessEngine,
  DecisionQualityEngine,
  createDecisionQualityEngine,
  DecisionTimingEngine,
  createDecisionTimingEngine,
  CommitmentReadinessEngine,
  createCommitmentReadinessEngine,
  DecisionFragilityEngine,
  createDecisionFragilityEngine,
  DecisionRobustnessEngine,
  createDecisionRobustnessEngine,
  MetaDecisionNarrativeEngine,
  createMetaDecisionNarrativeEngine,

  // Constants
  DEFAULT_META_DECISION_CONFIG,
} from './meta-decision-engine';

export type {
  // Core types
  MetaDecisionId,
  DecisionState,
  DecisionTiming,
  DecisionQualityLevel,
  UncertaintyLevel,

  // Main interfaces
  DecisionReadinessAnalysis,
  DecisionQualityAnalysis,
  DecisionTimingAnalysis,
  CommitmentReadinessAnalysis,
  DecisionFragilityAnalysis,
  DecisionRobustnessAnalysis,
  MetaDecisionAnalysis,

  // Input/Output
  MetaDecisionInput,

  // Configuration
  MetaDecisionConfig,
} from './meta-decision-engine';

// ============================================================================
// ACTION INTELLIGENCE ENGINE
// ============================================================================

export {
  // Main engine
  ActionIntelligenceEngine,
  createActionIntelligenceEngine,
  DEFAULT_ACTION_INTELLIGENCE_CONFIG,

  // Sub-engines
  ActionGenerator,
  createActionGenerator,
  PriorityEngine,
  createPriorityEngine,
  SkillGapEngine,
  createSkillGapEngine,
  OpportunityEngine,
  createOpportunityEngine,
  ExecutionPlanner,
  createExecutionPlanner,
  ActionExplanationEngine,
  createExplanationEngine,

  // Enums
  ActionPriority,
  ActionStatus,
  ActionType,
  TimeHorizon,
  OpportunityType,

  // Constants
  DEFAULT_PRIORITY_ENGINE_CONFIG,
  DEFAULT_SKILL_GAP_CONFIG,
  DEFAULT_OPPORTUNITY_CONFIG,
  DEFAULT_EXECUTION_CONFIG,
  DEFAULT_EXPLANATION_CONFIG,
} from './action-intelligence';

export type {
  // Core types
  ActionIntelligenceInput,
  ActionIntelligenceConfig,
  ActionOutput,
  Action,
  PrioritizedAction,
  PriorityScore,
  PriorityRoadmap,

  // Skill gap types
  SkillGap,
  SkillGapAnalysis,
  SkillAssessment,
  SkillRequirement,
  LearningStep,
  SkillDevelopmentPlan,

  // Opportunity types
  Opportunity,
  OpportunityBundle,
  OpportunityLocation,

  // Execution types
  ExecutionPlan,
  WeeklyPlan,
  MonthlyPlan,
  Milestone,
  PlannedMilestone,
  ReviewPoint,
  ContingencyPlan,
  ProgressTracker,

  // Explanation types
  ActionExplanation,
  ActionImpact,

  // Resource types
  ResourceRequirement,
  ResourceAvailability,
  ConstraintAnalysis,

  // Sub-engine configs
  ActionGeneratorConfig,
  PriorityEngineConfig,
  SkillGapEngineConfig,
  OpportunityEngineConfig,
  ExecutionPlannerConfig,
  ExplanationEngineConfig,
} from './action-intelligence';
