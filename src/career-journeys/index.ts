/**
 * Career Journey Intelligence - Module 8
 * 
 * Foundation for understanding how real people reach their careers.
 * Captures authentic career paths, decisions, turning points, and insights.
 * 
 * Phase 8.1: Career Journey Foundation
 * Phase 8.2: Journey Similarity Engine
 */

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export {
  // Core Journey Types
  JourneyId,
  CareerJourney,
  JourneyStartingPoint,
  LocationContext,
  CityTier,
  FamilyContext,
  SupportLevel,
  NetworkQuality,
  EconomicContext,
  IncomeLevel,
  
  // Education Types
  EducationMilestone,
  EducationType,
  InstitutionTier,
  EducationLevel,
  EducationImpact,
  EntranceExamResult,
  
  // Career Position Types
  CareerPosition,
  CompanyStage,
  Industry,
  CompensationRange,
  SkillUsage,
  SkillLevel,
  GrowthContribution,
  RoleSnapshot,
  
  // Decision Types
  CareerDecision,
  DecisionType,
  DecisionOutcome,
  // ConfidenceLevel BANNED - use Confidence from @/intelligence/confidence
  ImpactLevel,
  ImportanceLevel,
  DecisionInfluence,
  InfluenceType,
  InfluenceImpact,
  
  // Turning Point Types
  TurningPoint,
  TurningPointType,
  Effect,
  EffectCategory,
  TrajectoryImpact,
  PathChange,
  
  // Failure and Success Types
  CareerFailure,
  FailureType,
  CareerSuccess,
  SuccessType,
  
  // Lesson and Regret Types
  LessonLearned,
  LessonCategory,
  CareerRegret,
  RegretType,
  
  // Constraint Types
  Constraint,
  ConstraintType,
  
  // Transition Types
  CareerTransition,
  TransitionType,
  DifficultyLevel,
  SupportType,
  
  // Insights Types
  JourneyInsights,
  ValuableDecision,
  MajorMistake,
  UnexpectedOutcome,
  RegretAnalysis,
  JourneyPattern,
  
  // Analysis Types
  TransitionMap,
  TransitionPattern,
  TurningPointAnalysis,
  TurningPointPattern,
  JourneyMetadata,
  JourneySource,
  AnalysisDepth,
  JourneyAnalysisInput,
  JourneyAnalysisResult,
  SimilarJourneyQuery,
  SimilarJourneyResult,
  JourneyComparisonInput,
  JourneyComparisonResult,
  ComparisonDimension,
  PerformanceMetric,
  Difference,
  RelevanceScore,
} from './career-journey-types';

// ============================================================================
// ENGINE EXPORTS
// ============================================================================

export {
  CareerJourneyEngine,
  CareerJourneyEngineConfig,
  createCareerJourneyEngine,
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from './career-journey-engine';

export {
  JourneyAnalyzer,
  PatternDetectionResult,
  TrajectoryAnalysis,
  DecisionPatternAnalysis,
} from './journey-analyzer';

export {
  TurningPointEngine,
  CausalFactor,
  EffectAnalysis,
  TimingAnalysis,
} from './turning-point-engine';

export {
  CareerTransitionEngine,
  BridgeAnalysis,
  SuccessFactors,
  AlternativePath,
} from './career-transition-engine';

export {
  JourneyInsightsEngine,
  InsightCategory,
  ComparativeInsight,
  ActionableRecommendation,
} from './journey-insights-engine';

// ============================================================================
// SIMILARITY ENGINE EXPORTS (Phase 8.2)
// ============================================================================

export * from './similarity';

// ============================================================================
// MODULE VERSION
// ============================================================================

export const CAREER_JOURNEY_MODULE_VERSION = '8.2.0';
