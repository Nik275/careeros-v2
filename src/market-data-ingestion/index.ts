/**
 * CareerOS Market Data Ingestion Architecture V1
 *
 * Infrastructure for ingesting labor market intelligence from multiple sources.
 *
 * ## Purpose
 *
 * Accept data from:
 *   - Government Sources
 *   - Industry Reports
 *   - Job Boards
 *   - Salary Reports
 *   - Education Reports
 *   - Skill Trend Providers
 *
 * Without changing core architecture.
 *
 * ## 5-Stage Pipeline
 *
 * ```
 * ┌────────────┐   ┌───────────┐   ┌─────────────┐   ┌─────────────┐   ┌──────────┐
 * │ Ingestion  │ → │ Validation│ → │Normalization│ → │ Aggregation │ → │ Storage  │
 * └────────────┘   └───────────┘   └─────────────┘   └─────────────┘   └──────────┘
 *       │                │                │                │               │
 *   Raw signals    Check quality   Convert scales   Combine sources   Store result
 * ```
 *
 * ## Signal Types
 *
 * | Signal Type | Description |
 * |-------------|-------------|
 * | `demand` | Market demand |
 * | `salary` | Salary trends |
 * | `competition` | Competition level |
 * | `growth` | Growth trajectory |
 * | `automation-risk` | Automation risk |
 * | `skill-demand` | Skill demand |
 * | `exam-difficulty` | Exam difficulty |
 * | `regional-opportunity` | Regional opportunity |
 *
 * ## Example Usage
 *
 * ```typescript
 * import {
 *   MarketIngestionPipeline,
 *   createMarketIngestionPipeline,
 *   createRawMarketSignal,
 * } from '@/market-data-ingestion';
 *
 * // Create pipeline
 * const pipeline = createMarketIngestionPipeline();
 *
 * // Register data source
 * const source: MarketDataSource = {
 *   id: 'naukri-jobs',
 *   name: 'Naukri Job Portal',
 *   sourceType: 'jobBoard',
 *   reliabilityScore: 0.85,
 *   updateFrequency: 'P1D', // Daily
 *   registeredAt: Date.now(),
 *   successfulFetchCount: 0,
 *   failedFetchCount: 0,
 *   isActive: true,
 * };
 * pipeline.registerSource(source);
 *
 * // Create raw signal
 * const signal = createRawMarketSignal(
 *   source,
 *   { type: 'career', id: 'software-engineer', name: 'Software Engineer' },
 *   { type: 'demand', rawValue: 8500, unit: 'job-postings' },
 *   {
 *     originalFormat: 'json',
 *     collectionMethod: 'api',
 *   }
 * );
 *
 * // Process through pipeline
 * const result = pipeline.processSignal(signal);
 *
 * if (result.success) {
 *   console.log('Normalized value:', result.normalizedSignal?.normalizedValue);
 *   console.log('Aggregated value:', result.aggregatedSignal?.aggregatedValue);
 *   console.log('Confidence:', result.aggregatedSignal?.confidence);
 * }
 * ```
 *
 * ## Aggregation Example
 *
 * ```typescript
 * // AI Engineer demand from multiple sources
 * const signals = [
 *   { source: 'Source A', value: 0.85, confidence: 0.9 },
 *   { source: 'Source B', value: 0.79, confidence: 0.8 },
 *   { source: 'Source C', value: 0.88, confidence: 0.95 },
 * ];
 *
 * // Generated:
 * // aggregatedValue: 0.84
 * // confidence: 0.88
 * // variance: 0.0015
 * // sourceCount: 3
 * ```
 *
 * ## Architecture
 *
 * ```
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │                         MarketIngestionPipeline                              │
 * │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
 * │  │ Validation  │ │Normalization│ │ Aggregation │ │  Freshness  │            │
 * │  │   Engine    │ │   Engine    │ │   Engine    │ │   Engine    │            │
 * │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘            │
 * │         ↑               ↑               ↑               ↑                    │
 * │  ┌─────────────────────────────────────────────────────────────────┐        │
 * │  │                    Source Trust Engine                           │        │
 * │  └─────────────────────────────────────────────────────────────────┘        │
 * └─────────────────────────────────────────────────────────────────────────────┘
 * ```
 *
 * ## Design Principles
 *
 * - **Stage isolation** - Each stage is independent
 * - **Configurable processing** - All parameters configurable
 * - **Error recovery** - Failed signals can be retried
 * - **Batch processing** - Efficient bulk operations
 * - **Statistics tracking** - Full visibility into processing
 *
 * ## Requirements Met
 *
 * - ✅ Strong TypeScript typing
 * - ✅ No external APIs (foundation only)
 * - ✅ No scraping (infrastructure only)
 * - ✅ No UI (backend only)
 * - ✅ Millions of signals capacity
 * - ✅ Continuous updates support
 * - ✅ Future real-world integration ready
 *
 * @module market-data-ingestion
 */

// ============================================================================
// TYPES
// ============================================================================

export type {
  // Core types
  EntityId,
  Timestamp,
  SignalValue,
  ConfidenceScore,

  // Data sources
  MarketDataSource,
  DataSourceType,
  DataSourceConfig,

  // Signals
  RawMarketSignal,
  RawSignalMetadata,
  RawSignalStatus,
  NormalizedMarketSignal,
  NormalizedEntityType,
  NormalizedSignalType,
  AggregatedMarketSignal,
  SignalQualityMetrics,

  // Pipeline
  PipelineStage,
  PipelineStageRecord,
  PipelineResult,
  PipelineError,
  PipelineStats,

  // Validation
  ValidationResult,
  ValidationIssue,
  ValidationWarning,

  // Trust & Freshness
  SourceTrustMetrics,
  SourceAccuracyRecord,
  SignalFreshnessStatus,
  FreshnessPolicy,

  // Config
  IngestionPipelineConfig,
} from './types.js';

export type {
  AggregationMethod,
  AggregationOptions,
} from './SignalAggregationEngine.js';

// ============================================================================
// CONSTANTS
// ============================================================================

export {
  DATA_SOURCE_TYPES,
  DATA_SOURCE_TYPE_LABELS,
  SIGNAL_TYPES,
  SIGNAL_TYPE_LABELS,
  SIGNAL_SOURCE_TYPES,
  RAW_SIGNAL_STATUSES,
  NORMALIZED_ENTITY_TYPES,
  NORMALIZED_SIGNAL_TYPES,
  VALIDATION_ISSUE_TYPES,
  PIPELINE_STAGES,
  DEFAULT_INGESTION_CONFIG,
} from './types.js';

// ============================================================================
// MAIN PIPELINE
// ============================================================================

export {
  MarketIngestionPipeline,
  createMarketIngestionPipeline,
  quickProcess,
  createRawMarketSignal,
} from './MarketIngestionPipeline.js';

// ============================================================================
// ENGINES
// ============================================================================

export {
  SignalValidationEngine,
  createSignalValidationEngine,
  quickValidate,
  getValidEntityTypes,
  getValidSignalTypes,
} from './SignalValidationEngine.js';

export {
  SignalNormalizationEngine,
  createSignalNormalizationEngine,
  quickNormalize,
  getSupportedSignalTypes,
  addNormalizationRule,
} from './SignalNormalizationEngine.js';

export {
  SignalAggregationEngine,
  createSignalAggregationEngine,
  quickAggregate,
  weightedMean,
} from './SignalAggregationEngine.js';

export {
  SourceTrustEngine,
  createSourceTrustEngine,
  calculateQuickTrustScore,
} from './SourceTrustEngine.js';

export {
  FreshnessEngine,
  createFreshnessEngine,
  quickFreshnessCheck,
  createFreshnessPolicy,
} from './FreshnessEngine.js';
