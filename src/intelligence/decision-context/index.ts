/**
 * Decision Context Engine
 * 
 * A comprehensive system for detecting and analyzing a student's current
 * decision context. Context represents the situational factors that influence
 * career decisions, separate from behavioral archetypes.
 * 
 * ## Core Concepts
 * 
 * - **Context**: Current life situation (JEE prep, career switching, etc.)
 * - **Archetype**: Behavioral pattern (Builder, Researcher, etc.)
 * - **Context ≠ Archetype**: A student can be a Builder preparing for UPSC
 * 
 * ## Supported Contexts
 * 
 * ### Entrance Exams
 * - JEE_PREPARATION: Engineering entrance focus
 * - NEET_PREPARATION: Medical entrance focus
 * - UPSC_PREPARATION: Civil services preparation
 * - STATE_PSC_PREPARATION: State-level administrative exams
 * 
 * ### Professional Qualifications
 * - CA_PATHWAY: Chartered Accountancy
 * - CS_PATHWAY: Company Secretary
 * - CMA_PATHWAY: Cost & Management Accountancy
 * 
 * ### Education Selection
 * - COLLEGE_SELECTION: Choosing higher education institutions
 * - SCHOOL_SELECTION: School/board selection
 * - COURSE_SELECTION: Major/specialization decisions
 * 
 * ### Career Phases
 * - CAREER_EXPLORATION: Exploring options
 * - EARLY_CAREER: 0-3 years experience
 * - MID_CAREER: 5+ years experience
 * 
 * ### Career Transitions
 * - CAREER_SWITCH: Changing career paths
 * - INDUSTRY_TRANSITION: Moving between industries
 * 
 * ### Entrepreneurial
 * - STARTUP_EXPLORATION: Exploring entrepreneurship
 * - ENTREPRENEURSHIP_BUILDING: Actively building ventures
 * 
 * ### Family Context
 * - FAMILY_BUSINESS: Involved in family enterprise
 * 
 * ### Constraints
 * - REGIONAL_CONSTRAINT: Geographic limitations
 * - FINANCIAL_CONSTRAINT: Budget-driven decisions
 * - TIME_CONSTRAINT: Limited availability
 * 
 * ## Quick Start
 * 
 * ```typescript
 * import { createDecisionContextEngine, DecisionContextType } from './decision-context';
 * 
 * const engine = createDecisionContextEngine();
 * 
 * const analysis = engine.analyze({
 *   profile: studentProfile,
 *   assessmentResponses: responses,
 *   explicitGoals: ['Clear JEE Advanced', 'Get into IIT Bombay'],
 *   timestamp: Date.now(),
 * });
 * 
 * console.log(analysis.primaryContext?.context); // DecisionContextType.JEE_PREPARATION
 * console.log(analysis.narrative.summary);
 * ```
 * 
 * @module intelligence/decision-context
 */

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export {
  // Core Types
  DecisionContextType,
  ContextCategory,
  CONTEXT_TYPE_CATEGORIES,
  
  // Evidence Types
  EvidenceType,
  EvidenceStrength,
  ContextEvidence,
  
  // Uncertainty Types
  UncertaintySource,
  ContextUncertainty,
  
  // Result Types
  DetectedContext,
  ContextAnalysis,
  ContextConflict,
  ContextPriority,
  ContextNarrative,
  ContextRecommendation,
  
  // Input Types
  ContextDetectionInput,
  RawContextSignals,
  SignalExtractor,
  
  // Configuration Types
  ContextEngineConfig,
  EvidenceWeights,
  
  // Engine Interfaces
  IDecisionContextEngine,
  IContextExplanationEngine,
  IContextScoringEngine,
  
  // Utility Functions
  isDecisionContextType,
  isContextCategory,
  getContextTypeLabel,
  getContextTypeDescription,
} from './types';

// ============================================================================
// ENGINE EXPORTS
// ============================================================================

export {
  DecisionContextOrchestrator,
  createDecisionContextEngine,
  createQuickContextEngine,
  createPreciseContextEngine,
  DEFAULT_CONTEXT_ENGINE_CONFIG,
} from './DecisionContextOrchestrator';

export {
  ContextScoringEngine,
  createContextScoringEngine,
  DEFAULT_SCORING_CONFIG,
  ScoringConfig,
  ConfidenceResult,
} from './scoring/ContextScoringEngine';

export {
  ContextExplanationEngine,
  createContextExplanationEngine,
  DEFAULT_EXPLANATION_CONFIG,
  ExplanationConfig,
} from './explanation/ContextExplanationEngine';

// ============================================================================
// DETECTION EXPORTS
// ============================================================================

export {
  // Extractor Registry
  CONTEXT_EXTRACTORS,
  getExtractorForContext,
  extractAllSignals,
  
  // Individual Extractors (for custom use)
  extractJeeSignals,
  extractNeetSignals,
  extractUpscSignals,
  extractStatePscSignals,
  extractCaSignals,
  extractCsSignals,
  extractCmaSignals,
  extractCollegeSelectionSignals,
  extractSchoolSelectionSignals,
  extractCourseSelectionSignals,
  extractCareerExplorationSignals,
  extractEarlyCareerSignals,
  extractMidCareerSignals,
  extractCareerSwitchSignals,
  extractIndustryTransitionSignals,
  extractStartupExplorationSignals,
  extractEntrepreneurshipBuildingSignals,
  extractFamilyBusinessSignals,
  extractRegionalConstraintSignals,
  extractFinancialConstraintSignals,
  extractTimeConstraintSignals,
} from './detection/signalExtractors';
