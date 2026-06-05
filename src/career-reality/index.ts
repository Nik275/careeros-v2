/**
 * CareerOS - Career Reality Engine
 *
 * Career Reality Intelligence System
 *
 * Answers: "What is life actually like in this career?"
 *
 * Architecture:
 * - CareerRealityEngine (main orchestrator)
 * - DailyLifeEngine (time distribution, work patterns)
 * - WorkEnvironmentEngine (autonomy, structure, bureaucracy)
 * - BurnoutEngine (stress, risk, recovery)
 * - CultureEngine (values, personality fit)
 * - CompanyStageEngine (startup vs enterprise)
 * - SatisfactionEngine (drivers, frustrations, rewards)
 * - RealityExplanationEngine (expectation vs reality)
 *
 * @module career-reality
 * @version 1.0.0
 */

// Export types
export type {
  // Core types
  CareerRealityProfile,
  CareerRealityProfileId,
  CareerRealityMetadata,
  DataSource,
  CareerRealityInput,
  
  // Daily Life
  DailyLifeProfile,
  TimeBlockBreakdown,
  WeekPattern,
  MonthPattern,
  YearPattern,
  ActivityDistribution,
  WorkRhythm,
  CrunchPeriod,
  SeasonalPattern,
  
  // Work Environment
  WorkEnvironmentProfile,
  AutonomyProfile,
  StructureProfile,
  BureaucracyProfile,
  OwnershipProfile,
  CompetitionProfile,
  PoliticsProfile,
  FlexibilityProfile,
  PhysicalEnvironmentProfile,
  WorkArrangement,
  
  // Company Stage
  CompanyStage,
  CompanyStageVariant,
  StageDifference,
  
  // Burnout
  BurnoutProfile,
  StressSource,
  StressFrequency,
  RecoveryPotential,
  PreventionFactor,
  IndustryBurnoutPattern,
  
  // Culture
  CultureProfile,
  CulturalDimensions,
  ValuesAlignment,
  SocialDynamics,
  CulturalArchetype,
  
  // Personality Fit
  CareerPersonalityFit,
  PersonalityType,
  CognitiveFit,
  BehavioralFit,
  MotivationalFit,
  WorkStyleFit,
  
  // Satisfaction
  SatisfactionProfile,
  SatisfactionDriver,
  Frustration,
  Reward,
  ExitPattern,
  FulfillmentTrajectory,
  InflectionPoint,
  
  // Reality Gap
  RealityGapAnalysis,
  Expectation,
  RealityFactor,
  SpecificGap,
  Surprise,
  
  // Explanations
  RealityExplanations,
  DayInTheLife,
  HourlyActivity,
  DayVariation,
  CareerStory,
  
  // Scoring
  RealityProfileScore,
  CareerRealityComparison,
  DimensionComparison,
  ScoringConfig,
} from './types/career-reality-types';

// Export constants
export { DEFAULT_SCORING_CONFIG } from './types/career-reality-types';

// Export engines
export {
  CareerRealityEngine,
  createCareerRealityEngine,
  type CareerRealityEngineConfig,
  DEFAULT_CONFIG,
} from './engines/career-reality-engine';

export {
  DailyLifeEngine,
  createDailyLifeEngine,
  type DailyLifeInput,
} from './engines/daily-life-engine';

export {
  WorkEnvironmentEngine,
  createWorkEnvironmentEngine,
  type WorkEnvironmentInput,
} from './engines/work-environment-engine';

export {
  BurnoutEngine,
  createBurnoutEngine,
  type BurnoutInput,
} from './engines/burnout-engine';

export {
  CultureEngine,
  createCultureEngine,
  type CultureInput,
} from './engines/culture-engine';

export {
  CompanyStageEngine,
  createCompanyStageEngine,
  type CompanyStageInput,
} from './engines/company-stage-engine';

export {
  SatisfactionEngine,
  createSatisfactionEngine,
  type SatisfactionInput,
} from './engines/satisfaction-engine';

export {
  RealityExplanationEngine,
  createRealityExplanationEngine,
  type RealityExplanationInput,
} from './engines/reality-explanation-engine';
