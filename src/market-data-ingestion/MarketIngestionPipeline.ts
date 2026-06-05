/**
 * Market Ingestion Pipeline
 *
 * 5-stage pipeline for processing market data:
 *   1. Ingestion - Receive raw signals
 *   2. Validation - Check signal quality
 *   3. Normalization - Convert to standard format
 *   4. Aggregation - Combine multiple sources
 *   5. Storage - Store processed signals
 *
 * Design Principles:
 *   - Stage isolation
 *   - Configurable processing
 *   - Error recovery
 *   - Batch processing support
 *   - Statistics tracking
 */

import type {
  MarketDataSource,
  RawMarketSignal,
  NormalizedMarketSignal,
  AggregatedMarketSignal,
  PipelineResult,
  PipelineStage,
  IngestionPipelineConfig,
  PipelineStats,
  ValidationResult,
  EntityId,
} from './types.js';

import {
  DEFAULT_INGESTION_CONFIG,
} from './types.js';

import { SignalValidationEngine } from './SignalValidationEngine.js';
import { SignalNormalizationEngine } from './SignalNormalizationEngine.js';
import { SignalAggregationEngine } from './SignalAggregationEngine.js';
import { SourceTrustEngine } from './SourceTrustEngine.js';
import { FreshnessEngine } from './FreshnessEngine.js';

// ============================================================================
// MARKET INGESTION PIPELINE
// ============================================================================

/**
 * Main pipeline for ingesting and processing market data.
 */
export class MarketIngestionPipeline {
  private config: IngestionPipelineConfig;

  // Engines
  private validationEngine: SignalValidationEngine;
  private normalizationEngine: SignalNormalizationEngine;
  private aggregationEngine: SignalAggregationEngine;
  private trustEngine: SourceTrustEngine;
  private freshnessEngine: FreshnessEngine;

  // Storage
  private rawSignals: Map<string, RawMarketSignal> = new Map();
  private normalizedSignals: Map<string, NormalizedMarketSignal> = new Map();
  private aggregatedSignals: Map<string, AggregatedMarketSignal> = new Map();

  // Statistics
  private stats: PipelineStats;

  constructor(config: Partial<IngestionPipelineConfig> = {}) {
    this.config = { ...DEFAULT_INGESTION_CONFIG, ...config };

    // Initialize engines
    this.validationEngine = new SignalValidationEngine(this.config.validationConfig);
    this.normalizationEngine = new SignalNormalizationEngine(this.config.normalizationConfig);
    this.aggregationEngine = new SignalAggregationEngine(this.config.aggregationConfig);
    this.trustEngine = new SourceTrustEngine();
    this.freshnessEngine = new FreshnessEngine(this.config.freshnessPolicies);

    // Initialize statistics
    this.stats = {
      totalReceived: 0,
      byStatus: {
        received: 0,
        validating: 0,
        validated: 0,
        'validation-failed': 0,
        normalizing: 0,
        normalized: 0,
        'normalization-failed': 0,
        aggregating: 0,
        aggregated: 0,
        'aggregation-failed': 0,
        stored: 0,
        'storage-failed': 0,
        rejected: 0,
      },
      bySourceType: {
        government: 0,
        jobBoard: 0,
        industryReport: 0,
        salaryReport: 0,
        educationReport: 0,
        skillTrendProvider: 0,
      },
      avgProcessingTimeMs: 0,
      successRate: 0,
      errorsByType: {},
      timeRange: {
        start: Date.now(),
        end: Date.now(),
      },
    };
  }

  // ========================================================================
  // MAIN PIPELINE API
  // ========================================================================

  /**
   * Process a single raw signal through the pipeline.
   */
  processSignal(rawSignal: RawMarketSignal): PipelineResult {
    const startTime = Date.now();
    const stagesCompleted: PipelineStage[] = [];

    try {
      // Stage 1: Ingestion
      this.updateSignalStatus(rawSignal, 'received');
      this.stats.totalReceived++;
      this.stats.bySourceType[rawSignal.source.sourceType]++;
      stagesCompleted.push('ingestion');

      // Stage 2: Validation
      this.updateSignalStatus(rawSignal, 'validating');
      const validationResult = this.validationEngine.validate(rawSignal);

      if (!validationResult.isValid) {
        this.updateSignalStatus(rawSignal, 'validation-failed');
        this.recordError('validation', 'Signal failed validation');
        return {
          success: false,
          rawSignalId: rawSignal.id,
          error: {
            code: 'VALIDATION_FAILED',
            message: `Signal failed validation: ${validationResult.issues.map(i => i.description).join(', ')}`,
            details: { issues: validationResult.issues },
            recoverable: false,
          },
          durationMs: Date.now() - startTime,
          stagesCompleted,
        };
      }

      this.updateSignalStatus(rawSignal, 'validated');
      stagesCompleted.push('validation');

      // Stage 3: Normalization
      this.updateSignalStatus(rawSignal, 'normalizing');
      const normalizedSignal = this.normalizationEngine.normalize(rawSignal, validationResult);

      // Track in trust engine
      this.trustEngine.trackSignal(normalizedSignal);

      this.storeNormalizedSignal(normalizedSignal);
      this.updateSignalStatus(rawSignal, 'normalized');
      stagesCompleted.push('normalization');

      // Stage 4: Aggregation
      this.updateSignalStatus(rawSignal, 'aggregating');
      const aggregatedSignal = this.performAggregation(normalizedSignal);

      if (aggregatedSignal) {
        this.storeAggregatedSignal(aggregatedSignal);
      }

      this.updateSignalStatus(rawSignal, 'aggregated');
      stagesCompleted.push('aggregation');

      // Stage 5: Storage
      this.storeRawSignal(rawSignal);
      this.updateSignalStatus(rawSignal, 'stored');
      stagesCompleted.push('storage');

      // Update statistics
      this.updateSuccessStats(startTime);

      return {
        success: true,
        rawSignalId: rawSignal.id,
        normalizedSignal,
        aggregatedSignal: aggregatedSignal || undefined,
        durationMs: Date.now() - startTime,
        stagesCompleted,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.recordError('processing', errorMessage);

      return {
        success: false,
        rawSignalId: rawSignal.id,
        error: {
          code: 'PROCESSING_ERROR',
          message: errorMessage,
          recoverable: true,
        },
        durationMs: Date.now() - startTime,
        stagesCompleted,
      };
    }
  }

  /**
   * Process multiple signals in batch.
   */
  async processBatch(rawSignals: RawMarketSignal[]): Promise<PipelineResult[]> {
    const results: PipelineResult[] = [];

    // Process in batches based on config
    const batchSize = this.config.batchSize;
    const concurrency = this.config.maxConcurrency;

    for (let i = 0; i < rawSignals.length; i += batchSize * concurrency) {
      const batch = rawSignals.slice(i, i + batchSize * concurrency);

      // Process batch with limited concurrency
      const batchPromises = [];
      for (let j = 0; j < batch.length; j += batchSize) {
        const subBatch = batch.slice(j, j + batchSize);
        batchPromises.push(this.processSubBatch(subBatch));
      }

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.flat());
    }

    return results;
  }

  /**
   * Process a sub-batch of signals.
   */
  private async processSubBatch(signals: RawMarketSignal[]): Promise<PipelineResult[]> {
    return signals.map(signal => this.processSignal(signal));
  }

  // ========================================================================
  // STAGE METHODS
  // ========================================================================

  /**
   * Stage 2: Validate signal.
   */
  validate(signal: RawMarketSignal): ValidationResult {
    return this.validationEngine.validate(signal);
  }

  /**
   * Stage 3: Normalize signal.
   */
  normalize(
    signal: RawMarketSignal,
    validation: ValidationResult
  ): NormalizedMarketSignal {
    return this.normalizationEngine.normalize(signal, validation);
  }

  /**
   * Stage 4: Aggregate signals.
   */
  aggregate(
    signals: NormalizedMarketSignal[],
    entityType: NormalizedMarketSignal['entityType'],
    entityId: string,
    signalType: NormalizedMarketSignal['signalType']
  ): AggregatedMarketSignal | null {
    return this.aggregationEngine.aggregate(signals, entityType, entityId, signalType);
  }

  // ========================================================================
  // STORAGE
  // ========================================================================

  /**
   * Store raw signal.
   */
  private storeRawSignal(signal: RawMarketSignal): void {
    this.rawSignals.set(signal.id, signal);
  }

  /**
   * Store normalized signal.
   */
  private storeNormalizedSignal(signal: NormalizedMarketSignal): void {
    this.normalizedSignals.set(signal.id, signal);
  }

  /**
   * Store aggregated signal.
   */
  private storeAggregatedSignal(signal: AggregatedMarketSignal): void {
    const key = `${signal.entityType}:${signal.entityId}:${signal.signalType}`;
    this.aggregatedSignals.set(key, signal);
  }

  /**
   * Get raw signal.
   */
  getRawSignal(id: string): RawMarketSignal | undefined {
    return this.rawSignals.get(id);
  }

  /**
   * Get normalized signal.
   */
  getNormalizedSignal(id: string): NormalizedMarketSignal | undefined {
    return this.normalizedSignals.get(id);
  }

  /**
   * Get aggregated signal.
   */
  getAggregatedSignal(
    entityType: string,
    entityId: string,
    signalType: string
  ): AggregatedMarketSignal | undefined {
    const key = `${entityType}:${entityId}:${signalType}`;
    return this.aggregatedSignals.get(key);
  }

  // ========================================================================
  // HELPERS
  // ========================================================================

  /**
   * Perform aggregation for a normalized signal.
   */
  private performAggregation(
    normalizedSignal: NormalizedMarketSignal
  ): AggregatedMarketSignal | null {
    // Get all normalized signals for this entity/type
    const relatedSignals = Array.from(this.normalizedSignals.values())
      .filter(s =>
        s.entityType === normalizedSignal.entityType &&
        s.entityId === normalizedSignal.entityId &&
        s.signalType === normalizedSignal.signalType
      );

    // Add the new signal
    relatedSignals.push(normalizedSignal);

    // Aggregate
    return this.aggregationEngine.aggregate(
      relatedSignals,
      normalizedSignal.entityType,
      normalizedSignal.entityId,
      normalizedSignal.signalType
    );
  }

  /**
   * Update signal status.
   */
  private updateSignalStatus(
    signal: RawMarketSignal,
    status: RawMarketSignal['status']
  ): void {
    signal.status = status;
    signal.pipelineHistory.push({
      stage: this.getStageFromStatus(status),
      startedAt: Date.now(),
      status: status.includes('failed') ? 'failed' : 'completed',
    });
  }

  /**
   * Get pipeline stage from status.
   */
  private getStageFromStatus(status: RawMarketSignal['status']): PipelineStage {
    if (status.includes('valid')) return 'validation';
    if (status.includes('normal')) return 'normalization';
    if (status.includes('aggregat')) return 'aggregation';
    if (status.includes('stor')) return 'storage';
    return 'ingestion';
  }

  /**
   * Record error.
   */
  private recordError(type: string, message: string): void {
    this.stats.errorsByType[type] = (this.stats.errorsByType[type] || 0) + 1;
  }

  /**
   * Update success statistics.
   */
  private updateSuccessStats(startTime: number): void {
    const duration = Date.now() - startTime;

    // Update average processing time
    const totalProcessed = this.stats.totalReceived;
    this.stats.avgProcessingTimeMs =
      (this.stats.avgProcessingTimeMs * (totalProcessed - 1) + duration) / totalProcessed;

    // Update success rate
    const successCount = this.stats.byStatus.stored;
    this.stats.successRate = successCount / this.stats.totalReceived;

    // Update time range
    this.stats.timeRange.end = Date.now();
  }

  // ========================================================================
  // PUBLIC API
  // ========================================================================

  /**
   * Get pipeline statistics.
   */
  getStats(): PipelineStats {
    return { ...this.stats };
  }

  /**
   * Get storage counts.
   */
  getStorageCounts(): {
    raw: number;
    normalized: number;
    aggregated: number;
  } {
    return {
      raw: this.rawSignals.size,
      normalized: this.normalizedSignals.size,
      aggregated: this.aggregatedSignals.size,
    };
  }

  /**
   * Get engines.
   */
  getEngines(): {
    validation: SignalValidationEngine;
    normalization: SignalNormalizationEngine;
    aggregation: SignalAggregationEngine;
    trust: SourceTrustEngine;
    freshness: FreshnessEngine;
  } {
    return {
      validation: this.validationEngine,
      normalization: this.normalizationEngine,
      aggregation: this.aggregationEngine,
      trust: this.trustEngine,
      freshness: this.freshnessEngine,
    };
  }

  /**
   * Register a data source.
   */
  registerSource(source: MarketDataSource): void {
    this.trustEngine.initializeSource(source);
  }

  /**
   * Clear all data.
   */
  clear(): void {
    this.rawSignals.clear();
    this.normalizedSignals.clear();
    this.aggregatedSignals.clear();
    this.validationEngine.clearCache();
  }

  /**
   * Get configuration.
   */
  getConfig(): IngestionPipelineConfig {
    return { ...this.config };
  }

  /**
   * Update configuration.
   */
  updateConfig(config: Partial<IngestionPipelineConfig>): void {
    this.config = { ...this.config, ...config };

    // Update engine configs
    if (config.validationConfig) {
      this.validationEngine = new SignalValidationEngine(config.validationConfig);
    }
    if (config.normalizationConfig) {
      this.normalizationEngine = new SignalNormalizationEngine(config.normalizationConfig);
    }
    if (config.aggregationConfig) {
      this.aggregationEngine = new SignalAggregationEngine(config.aggregationConfig);
    }
    if (config.freshnessPolicies) {
      this.freshnessEngine = new FreshnessEngine(config.freshnessPolicies);
    }
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a new MarketIngestionPipeline.
 */
export function createMarketIngestionPipeline(
  config?: Partial<IngestionPipelineConfig>
): MarketIngestionPipeline {
  return new MarketIngestionPipeline(config);
}

/**
 * Quick process a single signal.
 */
export function quickProcess(
  signal: RawMarketSignal,
  config?: Partial<IngestionPipelineConfig>
): PipelineResult {
  const pipeline = new MarketIngestionPipeline(config);
  return pipeline.processSignal(signal);
}

/**
 * Create a raw market signal.
 */
export function createRawMarketSignal(
  source: MarketDataSource,
  entity: RawMarketSignal['entity'],
  metric: RawMarketSignal['metric'],
  metadata: RawMarketSignal['metadata']
): RawMarketSignal {
  const timestamp = Date.now();

  return {
    id: `raw_${source.id}_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
    source,
    timestamp,
    entity,
    metric,
    metadata,
    status: 'received',
    pipelineHistory: [{
      stage: 'ingestion',
      startedAt: timestamp,
      status: 'completed',
    }],
  };
}
