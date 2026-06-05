/**
 * CareerOS Career Intelligence Engine
 *
 * Phase C.1: Career Intelligence Engine
 *
 * Structured intelligence model for careers as complex systems.
 *
 * @module career-intelligence
 * @version 1.0.0
 */

// Main Engine
export {
  CareerIntelligenceEngine,
  createCareerIntelligenceEngine,
} from './career-intelligence-engine';

// Component Engines
export {
  CareerEvidenceEngine,
  createCareerEvidenceEngine,
} from './career-evidence-engine';

export {
  CareerAnalyzer,
  createCareerAnalyzer,
} from './career-analyzer';

export {
  CareerInsightsEngine,
  createCareerInsightsEngine,
} from './career-insights-engine';

// Types
export type {
  CareerId,
  CareerIntelligence,
  CareerCognitiveDemands,
  CareerMotivationalDemands,
  CareerLifestyleCharacteristics,
  CareerWorkEnvironment,
  CareerRisks,
  CareerAdvantages,
  ScoredDimension,
  DimensionEvidence,
  EvidenceSourceType,
  CareerEvidence,
  CareerMetadata,
  EducationLevel,
  ExperienceLevel,
  CareerInsights,
  InsightStatement,
  Misconception,
  Tradeoff,
  Opportunity,
  CareerAnalysis,
  CareerProfileSummary,
  CareerDifficulty,
  MarketOutlook,
  CareerComparison,
  DimensionComparison,
  CareerIntelligenceConfig,
  CareerIntelligenceQuery,
  CareerIntelligenceResult,
} from './career-types';

// Constants
export { DEFAULT_CAREER_INTELLIGENCE_CONFIG } from './career-types';
