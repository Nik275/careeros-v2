/**
 * CareerOS Market Intelligence - Market Trends Module
 *
 * Phase 1.4: Market Trend & Forecast Preparation Layer
 *
 * Provides temporal intelligence for tracking how careers, skills, industries,
 * and regions evolve over time. This layer prepares data for analysis - it does
 * NOT perform forecasting or prediction. It only understands change.
 *
 * @module market-trends
 */

// Core Engines
export {
  TrendDetectionEngine,
  createTrendDetectionEngine,
  type TrendDetectionConfig,
  type TrendDetectionResult,
} from './TrendDetectionEngine';

export {
  MomentumEngine,
  createMomentumEngine,
  type MomentumConfig,
  type EnhancedMomentum,
} from './MomentumEngine';

export {
  AccelerationEngine,
  createAccelerationEngine,
  type AccelerationConfig,
  type AccelerationResult,
} from './AccelerationEngine';

export {
  TrendPersistenceEngine,
  createTrendPersistenceEngine,
  type PersistenceConfig,
  type PersistenceResult,
} from './TrendPersistenceEngine';

// Domain-Specific Engines
export {
  CareerTrendEngine,
  createCareerTrendEngine,
  type CareerTrendConfig,
  type CareerTrendAnalysis,
  type CareerTrendComparison,
} from './CareerTrendEngine';

export {
  SkillTrendEngine,
  createSkillTrendEngine,
  type SkillTrendConfig,
  type SkillTrendAnalysis,
  type SkillTrendComparison,
} from './SkillTrendEngine';

export {
  IndustryTrendEngine,
  createIndustryTrendEngine,
  type IndustryTrendConfig,
  type IndustryTrendAnalysis,
  type IndustryComparison,
} from './IndustryTrendEngine';

export {
  RegionTrendEngine,
  createRegionTrendEngine,
  type RegionTrendConfig,
  type RegionTrendAnalysis,
  type RegionComparison,
} from './RegionTrendEngine';

// Main Orchestrator
export {
  MarketTrendEngine,
  createMarketTrendEngine,
  type MarketTrendEngineConfig,
  type UnifiedTrendAnalysis,
  type MarketTrendSummary,
} from './MarketTrendEngine';

// Models
export {
  TrendClassification,
  classifyChange,
  getClassificationMetadata,
  type ClassificationMetadata,
} from './models/TrendClassification';

export {
  createTrendSnapshot,
  type SnapshotFrequency,
} from './models/TrendSnapshot';

export type {
  TrendSnapshot,
} from './models/TrendSnapshot';

export type {
  TrendAnalysis,
} from './models/TrendAnalysis';

export {
  calculateMomentum,
  calculateMomentumTrend,
  type MomentumTrend,
} from './models/MarketMomentum';

export type {
  MarketMomentum,
} from './models/MarketMomentum';

export {
  createTrendHistory,
  type TrendPoint,
} from './models/TrendHistory';

export type {
  TrendHistory,
} from './models/TrendHistory';
