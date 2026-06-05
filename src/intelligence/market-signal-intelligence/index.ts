/**
 * CareerOS Market Signal Intelligence Engine V1
 *
 * Transform raw market signals into actionable market intelligence.
 *
 * ## Purpose
 *
 * Detect trends, opportunities, risks, and market shifts from processed
 * market data and profiles.
 *
 * ## Inputs
 *
 * - Market Signals (from ingestion pipeline)
 * - CareerMarketProfiles
 * - SkillMarketProfiles
 * - IndustryMarketProfiles
 * - RegionMarketProfiles
 *
 * ## Outputs
 *
 * - MarketTrend
 * - MarketOpportunity
 * - MarketRisk[]
 * - MarketMomentum
 * - EmergingCareer
 * - MarketNarrative
 * - MarketIntelligenceReport
 *
 * ## Engines
 *
 * | Engine | Purpose |
 * |--------|---------|
 * | TrendDetectionEngine | Detect growing/stable/declining/volatile/emerging trends |
 * | OpportunityScoringEngine | Calculate opportunity scores (0-100) |
 * | MarketRiskEngine | Detect oversaturation, automation, competition risks |
 * | MarketMomentumEngine | Measure rate of change, acceleration, persistence |
 * | EmergingCareerDetector | Identify high-growth emerging careers/skills/regions |
 * | MarketNarrativeEngine | Generate human-readable explanations |
 * | MarketIntelligenceEngine | Main orchestrator combining all engines |
 *
 * ## Example Usage
 *
 * ```typescript
 * import {
 *   MarketIntelligenceEngine,
 *   createMarketIntelligenceEngine,
 * } from '@/intelligence/market-signal-intelligence';
 *
 * // Create engine
 * const intelligence = createMarketIntelligenceEngine();
 *
 * // Define career profile with historical data
 * const profile: CareerMarketProfile = {
 *   id: 'career:software-engineer',
 *   careerId: 'software-engineer',
 *   name: 'Software Engineer',
 *   signals: [],
 *   history: {
 *     demand: [
 *       { timestamp: Date.now() - 86400000 * 90, value: 0.75, confidence: 0.9 },
 *       { timestamp: Date.now() - 86400000 * 60, value: 0.78, confidence: 0.9 },
 *       { timestamp: Date.now() - 86400000 * 30, value: 0.82, confidence: 0.9 },
 *       { timestamp: Date.now(), value: 0.85, confidence: 0.9 },
 *     ],
 *     salary: [
 *       { timestamp: Date.now() - 86400000 * 90, value: 0.7, confidence: 0.85 },
 *       { timestamp: Date.now() - 86400000 * 60, value: 0.72, confidence: 0.85 },
 *       { timestamp: Date.now() - 86400000 * 30, value: 0.74, confidence: 0.85 },
 *       { timestamp: Date.now(), value: 0.76, confidence: 0.85 },
 *     ],
 *     competition: [
 *       { timestamp: Date.now() - 86400000 * 90, value: 0.6, confidence: 0.8 },
 *       { timestamp: Date.now() - 86400000 * 60, value: 0.62, confidence: 0.8 },
 *       { timestamp: Date.now() - 86400000 * 30, value: 0.61, confidence: 0.8 },
 *       { timestamp: Date.now(), value: 0.6, confidence: 0.8 },
 *     ],
 *     growth: [
 *       { timestamp: Date.now() - 86400000 * 90, value: 0.65, confidence: 0.75 },
 *       { timestamp: Date.now() - 86400000 * 60, value: 0.68, confidence: 0.75 },
 *       { timestamp: Date.now() - 86400000 * 30, value: 0.72, confidence: 0.75 },
 *       { timestamp: Date.now(), value: 0.75, confidence: 0.75 },
 *     ],
 *     automationRisk: [
 *       { timestamp: Date.now() - 86400000 * 90, value: 0.3, confidence: 0.7 },
 *       { timestamp: Date.now() - 86400000 * 60, value: 0.32, confidence: 0.7 },
 *       { timestamp: Date.now() - 86400000 * 30, value: 0.35, confidence: 0.7 },
 *       { timestamp: Date.now(), value: 0.38, confidence: 0.7 },
 *     ],
 *   },
 *   lastUpdated: Date.now(),
 * };
 *
 * // Generate intelligence report
 * const report = intelligence.analyzeCareer(profile);
 *
 * console.log('Trend:', report.trend.trendType, '-', report.trend.explanation[0]);
 * console.log('Opportunity Score:', report.opportunity.opportunityScore);
 * console.log('Risks:', report.risks.length, 'identified');
 * console.log('Narrative:', report.narrative.summary);
 * console.log('Overall Assessment:', report.overallAssessment);
 * ```
 *
 * ## Trend Detection Example
 *
 * ```typescript
 * import { TrendDetectionEngine } from '@/intelligence/market-signal-intelligence';
 *
 * const trendEngine = new TrendDetectionEngine();
 *
 * const trend = trendEngine.detectTrend(
 *   'career:ai-engineer',
 *   'career',
 *   [
 *     { timestamp: Date.now() - 86400000 * 120, value: 0.3, confidence: 0.8 },
 *     { timestamp: Date.now() - 86400000 * 90, value: 0.4, confidence: 0.8 },
 *     { timestamp: Date.now() - 86400000 * 60, value: 0.55, confidence: 0.8 },
 *     { timestamp: Date.now() - 86400000 * 30, value: 0.7, confidence: 0.8 },
 *     { timestamp: Date.now(), value: 0.85, confidence: 0.8 },
 *   ],
 *   'demand'
 * );
 *
 * // Result: trendType: 'emerging', strength: 0.85, confidence: 0.9
 * ```
 *
 * ## Opportunity Scoring Example
 *
 * ```typescript
 * import { OpportunityScoringEngine } from '@/intelligence/market-signal-intelligence';
 *
 * const scoringEngine = new OpportunityScoringEngine();
 *
 * const opportunity = scoringEngine.calculateOpportunity(
 *   'career:cybersecurity-analyst',
 *   'career',
 *   'Cybersecurity Analyst',
 *   {
 *     demand: [{ timestamp: Date.now(), value: 0.85, confidence: 0.9 }],
 *     competition: [{ timestamp: Date.now(), value: 0.4, confidence: 0.8 }],
 *     salaryGrowth: [{ timestamp: Date.now(), value: 0.12, confidence: 0.85 }],
 *     futureOutlook: [{ timestamp: Date.now(), value: 0.8, confidence: 0.75 }],
 *     automationRisk: [{ timestamp: Date.now(), value: 0.2, confidence: 0.7 }],
 *   }
 * );
 *
 * // Result: opportunityScore: 78, drivers: ['Strong market demand', ...]
 * ```
 *
 * ## Risk Detection Example
 *
 * ```typescript
 * import { MarketRiskEngine } from '@/intelligence/market-signal-intelligence';
 *
 * const riskEngine = new MarketRiskEngine();
 *
 * const risks = riskEngine.detectRisks(
 *   'career:travel-agent',
 *   'career',
 *   'Travel Agent',
 *   {
 *     demand: [
 *       { timestamp: Date.now() - 86400000 * 365, value: 0.6, confidence: 0.8 },
 *       { timestamp: Date.now(), value: 0.3, confidence: 0.8 },
 *     ],
 *     automationRisk: [
 *       { timestamp: Date.now(), value: 0.75, confidence: 0.7 },
 *     ],
 *   }
 * );
 *
 * // Result: [declining-demand risk, automation-exposure risk]
 * ```
 *
 * ## Design Principles
 *
 * - **Deterministic** - Same inputs always produce same outputs
 * - **Explainable** - Every result includes reasoning
 * - **Compatible** - Works with Knowledge Graph, Decision Intelligence Engine,
 *   Future Simulation Engine, and Outcome Learning Architecture
 * - **Production-ready** - Caching, batching, error handling
 *
 * ## Requirements Met
 *
 * - ✅ Strong TypeScript typing throughout
 * - ✅ Deterministic calculations
 * - ✅ Explainable outputs
 * - ✅ No AI integration (foundation only)
 * - ✅ No scraping
 * - ✅ No external integrations
 * - ✅ Compatible with existing engines
 *
 * @module market-signal-intelligence
 */

// ============================================================================
// TYPES
// ============================================================================

export type {
  // Core identifiers
  EntityId,
  Timestamp,
  ConfidenceScore,
  TrendStrength,
  OpportunityScore,
  RiskScore,

  // Trend types
  TrendType,
  TrendDetectionMethod,

  // Risk types
  RiskType,
  RiskLevel,

  // Input profiles
  CareerMarketProfile,
  CareerSignalHistory,
  SkillMarketProfile,
  SkillSignalHistory,
  IndustryMarketProfile,
  IndustrySignalHistory,
  RegionMarketProfile,
  RegionSignalHistory,
  TimeSeriesPoint,

  // Output types
  MarketTrend,
  MarketOpportunity,
  MarketRisk,
  MarketMomentum,
  EmergingCareer,
  MarketNarrative,
  MarketIntelligenceReport,

  // Engine configurations
  TrendDetectionConfig,
  OpportunityScoringConfig,
  RiskEngineConfig,
  MomentumConfig,
  EmergingCareerConfig,
  NarrativeConfig,
  IntelligenceEngineConfig,
} from './types.js';

// ============================================================================
// CONSTANTS
// ============================================================================

export {
  TREND_TYPE_LABELS,
  RISK_TYPE_LABELS,
  RISK_LEVEL_LABELS,
  DEFAULT_TREND_DETECTION_CONFIG,
  DEFAULT_OPPORTUNITY_SCORING_CONFIG,
  DEFAULT_RISK_ENGINE_CONFIG,
  DEFAULT_MOMENTUM_CONFIG,
  DEFAULT_EMERGING_CAREER_CONFIG,
  DEFAULT_NARRATIVE_CONFIG,
  DEFAULT_INTELLIGENCE_ENGINE_CONFIG,
} from './types.js';

// ============================================================================
// MAIN ENGINE
// ============================================================================

export {
  MarketIntelligenceEngine,
  createMarketIntelligenceEngine,
  quickAnalyze,
  quickCompare,
} from './MarketIntelligenceEngine.js';

// ============================================================================
// SUB-ENGINES
// ============================================================================

export {
  TrendDetectionEngine,
  createTrendDetectionEngine,
  quickDetectTrend,
} from './TrendDetectionEngine.js';

export {
  OpportunityScoringEngine,
  createOpportunityScoringEngine,
  quickCalculateOpportunity,
} from './OpportunityScoringEngine.js';

export {
  MarketRiskEngine,
  createMarketRiskEngine,
  quickAssessRisk,
} from './MarketRiskEngine.js';

export {
  MarketMomentumEngine,
  createMarketMomentumEngine,
  quickCalculateMomentum,
} from './MarketMomentumEngine.js';

export {
  EmergingCareerDetector,
  createEmergingCareerDetector,
  quickDetectEmerging,
} from './EmergingCareerDetector.js';

export {
  MarketNarrativeEngine,
  createMarketNarrativeEngine,
  quickGenerateNarrative,
} from './MarketNarrativeEngine.js';
