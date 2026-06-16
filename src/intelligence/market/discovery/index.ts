/**
 * CareerOS Market Intelligence - Market Discovery Module
 *
 * Phase 1.5: Emerging Career & Skill Discovery Engine
 *
 * Continuously identifies new opportunities and declining areas in the labor market.
 * This is a DISCOVERY system, not a recommendation system.
 *
 * All discoveries enter a review pipeline. Human review required.
 *
 * @module market-discovery
 */

// Core Engine
export {
  DiscoveryEngine,
  createDiscoveryEngine,
  type DiscoveryEngineConfig,
  type DiscoveryResult,
  type DiscoveryStatistics,
} from './DiscoveryEngine';

// Discovery Confidence
export {
  DiscoveryConfidenceEngine,
  createDiscoveryConfidenceEngine,
  type ConfidenceConfig,
} from './DiscoveryConfidenceEngine';

// Emerging Career
export {
  EmergingCareerEngine,
  createEmergingCareerEngine,
  type EmergingCareerConfig,
  type CareerDetectionResult,
} from './EmergingCareerEngine';

// Career Discovery (main)
export {
  CareerDiscoveryEngine,
  createCareerDiscoveryEngine,
  type CareerDiscoveryConfig,
  type DiscoveryQueueEntry,
} from './CareerDiscoveryEngine';

// Emerging Skill
export {
  EmergingSkillEngine,
  createEmergingSkillEngine,
  type EmergingSkillConfig,
  type SkillDetectionResult,
} from './EmergingSkillEngine';

// Skill Discovery (main)
export {
  SkillDiscoveryEngine,
  createSkillDiscoveryEngine,
  type SkillDiscoveryConfig,
  type SkillQueueEntry,
} from './SkillDiscoveryEngine';

// Emerging Industry
export {
  EmergingIndustryEngine,
  createEmergingIndustryEngine,
  type EmergingIndustryConfig,
  type IndustryDetectionResult,
} from './EmergingIndustryEngine';

// Industry Discovery (main)
export {
  IndustryDiscoveryEngine,
  createIndustryDiscoveryEngine,
  type IndustryDiscoveryConfig,
  type IndustryQueueEntry,
} from './IndustryDiscoveryEngine';

// Declining Career
export {
  DecliningCareerEngine,
  createDecliningCareerEngine,
  type DecliningCareerConfig,
  type DeclineDetectionResult,
  type DeclineAlert,
} from './DecliningCareerEngine';

// Declining Skill
export {
  DecliningSkillEngine,
  createDecliningSkillEngine,
  type DecliningSkillConfig,
  type SkillDeclineResult,
  type ObsolescenceStage,
  type ObsolescenceDriver,
  type DecliningSkill,
} from './DecliningSkillEngine';

// Models
export {
  createDiscoverySignal,
  validateSignal,
  calculateWeightedStrength,
  groupSignalsByEntity,
  filterSignals,
  type DiscoverySignalType,
  type SourceQuality,
  type SignalProcessingConfig,
} from './models/DiscoverySignal';

export type {
  DiscoverySignal,
} from './models/DiscoverySignal';

export {
  createEmergingCareer,
  updateCareerStage,
  calculateMaturityScore,
  compareEmergingCareers,
  type CareerLifecycleStage,
  type CareerEvidenceType,
} from './models/EmergingCareer';

export type {
  EmergingCareer,
} from './models/EmergingCareer';

export {
  createEmergingSkill,
  updateSkillStage,
  calculateRelevanceScore,
  predictSkillTrajectory,
  type SkillAdoptionStage,
  type SkillCategory,
} from './models/EmergingSkill';

export type {
  EmergingSkill,
} from './models/EmergingSkill';

export {
  createEmergingIndustry,
  updateIndustryStage,
  calculateOpportunityScore,
  assessIndustryRisk,
  type IndustryMaturityStage,
  type IndustryCategory,
} from './models/EmergingIndustry';

export type {
  EmergingIndustry,
} from './models/EmergingIndustry';

export {
  createDecliningCareer,
  updateDeclineStage,
  calculateDeclineUrgency,
  recommendAlternativePaths,
  generateDeclineExplanation,
  type DeclineStage,
  type DeclineDriver,
} from './models/DecliningCareer';

export type {
  DecliningCareer,
} from './models/DecliningCareer';

export {
  createDiscoveryAnalysis,
  calculateOverallConfidence,
  updateDiscoveryStatus,
  mergeAnalyses,
  generateDiscoverySummary,
  type DiscoveryType,
  type DiscoveryStatus,
  type ConfidenceFactors,
} from './models/DiscoveryAnalysis';

export type {
  DiscoveryAnalysis,
} from './models/DiscoveryAnalysis';
