/**
 * Indian Market Intelligence Ontology V1
 *
 * Foundational data model for self-updating Indian labor market intelligence.
 *
 * ## Purpose
 *
 * CareerOS must track labor market dynamics across:
 * - **Careers** - Job roles and career paths
 * - **Skills** - In-demand capabilities
 * - **Industries** - Sector-level trends
 * - **Regions** - Geographic opportunities
 * - **Exams** - Competitive entrance tests
 * - **Education Paths** - Learning trajectories
 *
 * ## Market Signals
 *
 * All market data flows through signals:
 *
 * | Signal Type | Description |
 * |-------------|-------------|
 * | `demand` | Market demand for entity |
 * | `salary` | Salary trend |
 * | `competition` | Competition level |
 * | `growth` | Growth trajectory |
 * | `automationRisk` | Risk of automation |
 * | `skillDemand` | Skill-specific demand |
 * | `examDifficulty` | Exam competitiveness |
 * | `regionalOpportunity` | Regional opportunity level |
 *
 * ## Signal Sources
 *
 * Quality-weighted sources:
 * - `government-data` (1.0)
 * - `industry-report` (0.95)
 * - `academic-research` (0.9)
 * - `job-portal` (0.85)
 * - `expert-interview` (0.8)
 * - `api-integration` (0.8)
 * - `ml-prediction` (0.75)
 * - `historical-trend` (0.7)
 * - `news-media` (0.6)
 * - `manual-entry` (0.5)
 *
 * ## Tracked Regions
 *
 * - Bangalore (Bengaluru)
 * - Hyderabad
 * - Pune
 * - Mumbai
 * - Delhi NCR
 * - Chennai
 * - Ahmedabad
 * - Tier-2 Cities
 *
 * ## Tracked Exams
 *
 * - JEE (Joint Entrance Examination)
 * - NEET (National Eligibility cum Entrance Test)
 * - UPSC (Union Public Service Commission)
 * - CAT (Common Admission Test)
 * - GATE (Graduate Aptitude Test in Engineering)
 * - CLAT (Common Law Admission Test)
 * - CA (Chartered Accountancy)
 *
 * ## Usage Example
 *
 * ```typescript
 * import {
 *   MarketIntelligenceRepository,
 *   createMarketIntelligenceRepository,
 *   createMarketSignal,
 * } from '@/ontology/indian-market-intelligence';
 *
 * // Create repository
 * const repository = createMarketIntelligenceRepository();
 *
 * // Add a market signal
 * const signal = createMarketSignal(
 *   'demand',
 *   0.85,
 *   'software-engineer',
 *   'career',
 *   { confidence: 0.9, sourceType: 'job-portal' }
 * );
 * repository.addSignal(signal);
 *
 * // Generate market snapshot
 * const snapshot = repository.generateMarketSnapshot();
 * console.log(snapshot.topCareers[0].careerName);
 * // "Software Engineer"
 *
 * // Get aggregated signal
 * const demand = repository.getAggregatedSignal('software-engineer', 'demand');
 * console.log(`Demand: ${(demand.value * 100).toFixed(0)}%`);
 * ```
 *
 * ## Architecture
 *
 * ```
 * MarketSignal → Repository → Aggregation → Profiles → Snapshots
 *      ↓              ↓              ↓            ↓          ↓
 *   Raw data    Storage       Weighted      Entity    Market
 *   points      & indexing    averages      views     overview
 * ```
 *
 * ## Compatibility
 *
 * - **Career Ontology** - Links to career definitions
 * - **Knowledge Graph** - Entity relationships
 * - **Decision Intelligence** - Market inputs to decisions
 * - **Outcome Learning** - Feedback on predictions
 *
 * ## Design Principles
 *
 * - **Continuous updates** - Built for ongoing data refresh
 * - **Confidence-weighted** - Every signal has confidence
 * - **Time-decay** - Older signals weighted less
 * - **Source quality** - Different sources weighted by reliability
 * - **Explainable** - All scores show calculation method
 *
 * @module indian-market-intelligence
 */

// ============================================================================
// TYPES
// ============================================================================

export type {
  // Signals
  MarketSignal,
  SignalType,
  SignalSourceType,

  // Entities
  MarketEntity,
  MarketEntityType,
  DataQualityMetrics,

  // Profiles
  CareerMarketProfile,
  CareerStageInfo,
  SkillMarketProfile,
  IndustryMarketProfile,
  RegionMarketProfile,
  ExamMarketProfile,
  EducationPathMarketProfile,

  // Categories
  SkillCategory,
  IndianRegionId,
  IndianExamId,

  // Aggregates
  MarketSnapshot,
  MarketUpdateMetadata,

  // Config
  IndianMarketIntelligenceConfig,
} from './types.js';

// ============================================================================
// CONSTANTS
// ============================================================================

export {
  SIGNAL_TYPES,
  SIGNAL_TYPE_LABELS,
  SIGNAL_SOURCE_TYPES,
  MARKET_ENTITY_TYPES,
  SKILL_CATEGORIES,
  INDIAN_REGIONS,
  REGION_DISPLAY_NAMES,
  INDIAN_EXAMS,
  EXAM_DISPLAY_NAMES,
  DEFAULT_MARKET_INTELLIGENCE_CONFIG,
} from './types.js';

// ============================================================================
// REPOSITORIES
// ============================================================================

export {
  MarketSignalRepository,
  MarketProfileRepository,
  MarketIntelligenceRepository,
  createMarketIntelligenceRepository,
  createMarketSignal,
} from './repositories.js';

// ============================================================================
// CALCULATORS
// ============================================================================

export {
  // Source quality
  SOURCE_QUALITY_WEIGHTS,
  getSourceQualityWeight,

  // Confidence calculations
  calculateMarketConfidence,
  calculateSignalTypeConfidence,
  calculateDataQualityMetrics,

  // Freshness calculations
  calculateMarketFreshness,
  calculateSignalTypeFreshness,
  needsRefresh,
  getRefreshPriority,

  // Signal aggregation
  aggregateSignals,
  aggregateSignalsByType,
  detectSignalTrend,
  detectSignalAnomalies,

  // Opportunity scoring
  calculateOpportunityScore,
  calculateRiskAdjustedScore,
} from './calculators.js';
