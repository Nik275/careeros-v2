/**
 * CareerOS Market Intelligence - Signal Adapter
 *
 * Converts all provider outputs into standardized MarketSignal objects.
 *
 * RULE: No provider-specific logic may leak outside the adapter layer.
 * All external data must pass through SignalAdapter before entering
 * the intelligence system.
 */

import { randomUUID } from 'node:crypto';
import type {
  MarketSignal,
  MarketSignalId,
  MarketSignalType,
  MarketSignalSource,
} from '../../models/MarketSignal';
import type {
  ExtractedSignal,
  RawMarketData,
  SignalAdapterConfig,
  SignalAdaptationResult,
} from '../types';
import { SourceReliabilityEngine } from '../reliability/SourceReliabilityEngine';

/**
 * Default adapter configuration.
 */
export const DEFAULT_ADAPTER_CONFIG: SignalAdapterConfig = {
  minConfidence: 20,
  maxSignalAgeDays: 365,
  validateRanges: true,
  normalizeGeography: true,
  careerMapping: 'taxonomy',
};

/**
 * Career mapping result.
 */
interface CareerMapping {
  careerId: string;
  confidence: number;
  matchedTitle: string;
}

/**
 * Signal validation result.
 */
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  confidence: number;
}

/**
 * Adapts extracted signals from any source into standardized MarketSignals.
 *
 * This is the ONLY place where external data becomes internal MarketSignal.
 * All provider-specific quirks, formats, and naming conventions are
 * normalized here.
 */
export class SignalAdapter {
  private config: SignalAdapterConfig;
  private reliabilityEngine: SourceReliabilityEngine;

  constructor(
    reliabilityEngine: SourceReliabilityEngine,
    config?: Partial<SignalAdapterConfig>
  ) {
    this.reliabilityEngine = reliabilityEngine;
    this.config = { ...DEFAULT_ADAPTER_CONFIG, ...config };
  }

  /**
   * Adapt extracted signals to MarketSignals.
   *
   * This is the main entry point. All external data flows through here.
   */
  adapt(
    extracted: ExtractedSignal[],
    sourceId: string,
    rawData: RawMarketData
  ): SignalAdaptationResult {
    const startTime = Date.now();
    const signals: MarketSignal[] = [];
    const failures: SignalAdaptationResult['failures'] = [];

    for (const extractedSignal of extracted) {
      try {
        // Validate extracted signal
        const validation = this.validateExtractedSignal(extractedSignal);
        if (!validation.isValid) {
          failures.push({
            extracted: extractedSignal,
            reason: validation.errors.join('; '),
          });
          continue;
        }

        // Map career title to internal career ID
        const careerMapping = this.mapCareer(extractedSignal.careerTitle);

        // Calculate signal confidence
        const confidence = this.calculateConfidence(
          extractedSignal,
          sourceId,
          validation.confidence,
          careerMapping.confidence
        );

        if (confidence < this.config.minConfidence) {
          failures.push({
            extracted: extractedSignal,
            reason: `Confidence ${confidence} below threshold ${this.config.minConfidence}`,
          });
          continue;
        }

        // Normalize geography
        const geography = this.config.normalizeGeography
          ? this.normalizeGeography(extractedSignal.geography)
          : extractedSignal.geography;

        // Build MarketSignal
        const signal: MarketSignal = {
          id: this.generateSignalId(),
          careerId: careerMapping.careerId,
          careerTitle: careerMapping.matchedTitle,
          signalType: extractedSignal.signalType,
          source: this.mapSourceToEnum(sourceId),
          geography,
          strength: this.normalizeStrength(extractedSignal.strength, extractedSignal.unit),
          unit: extractedSignal.unit,
          confidence,
          timestamp: extractedSignal.periodEnd,
          rawData: {
            payload: rawData.payload,
            originalTitle: extractedSignal.careerTitle,
            context: extractedSignal.context,
            sourceId,
            fetchId: rawData.fetchedAt.toISOString(),
            careerMappingConfidence: careerMapping.confidence,
          },
          metadata: {
            sourceReliability: this.reliabilityEngine.getReliability(sourceId),
            geography: this.mapMetadataGeography(geography),
            timePeriod: {
              start: extractedSignal.periodStart,
              end: extractedSignal.periodEnd,
            },
          },
        };

        signals.push(signal);
      } catch (error) {
        failures.push({
          extracted: extractedSignal,
          reason: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      signals,
      failures,
      metadata: {
        sourceId,
        processedAt: new Date(),
        inputCount: extracted.length,
        outputCount: signals.length,
        durationMs: Date.now() - startTime,
      },
    };
  }

  /**
   * Adapt a single signal (convenience method).
   */
  adaptSingle(
    extracted: ExtractedSignal,
    sourceId: string,
    rawData: RawMarketData
  ): MarketSignal | null {
    const result = this.adapt([extracted], sourceId, rawData);
    return result.signals[0] ?? null;
  }

  /**
   * Batch adapt multiple sources.
   */
  adaptBatch(
    batch: Array<{
      extracted: ExtractedSignal[];
      sourceId: string;
      rawData: RawMarketData;
    }>
  ): SignalAdaptationResult {
    const allSignals: MarketSignal[] = [];
    const allFailures: SignalAdaptationResult['failures'] = [];
    const startTime = Date.now();

    for (const item of batch) {
      const result = this.adapt(item.extracted, item.sourceId, item.rawData);
      allSignals.push(...result.signals);
      allFailures.push(...result.failures);
    }

    return {
      signals: allSignals,
      failures: allFailures,
      metadata: {
        sourceId: 'batch',
        processedAt: new Date(),
        inputCount: batch.reduce((sum, b) => sum + b.extracted.length, 0),
        outputCount: allSignals.length,
        durationMs: Date.now() - startTime,
      },
    };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Validate an extracted signal.
   */
  private validateExtractedSignal(extracted: ExtractedSignal): ValidationResult {
    const errors: string[] = [];
    let confidence = 100;

    // Check required fields
    if (!extracted.careerTitle || extracted.careerTitle.trim().length === 0) {
      errors.push('Missing career title');
    }

    if (!extracted.signalType) {
      errors.push('Missing signal type');
    }

    if (typeof extracted.strength !== 'number' || isNaN(extracted.strength)) {
      errors.push('Invalid strength value');
    }

    // Check age
    const ageDays = (Date.now() - extracted.periodEnd.getTime()) / (1000 * 60 * 60 * 24);
    if (ageDays > this.config.maxSignalAgeDays) {
      errors.push(`Signal too old (${Math.round(ageDays)} days)`);
      confidence -= 20;
    }

    // Validate ranges
    if (this.config.validateRanges) {
      if (Math.abs(extracted.strength) > 10000) {
        errors.push('Strength value out of reasonable range');
        confidence -= 10;
      }
    }

    // Geography check
    if (!extracted.geography || extracted.geography.trim().length === 0) {
      errors.push('Missing geography');
      confidence -= 15;
    }

    return {
      isValid: errors.length === 0 || confidence > this.config.minConfidence,
      errors,
      confidence: Math.max(0, confidence),
    };
  }

  /**
   * Map career title to internal career ID.
   *
   * In production, this would query the career taxonomy system.
   */
  private mapCareer(careerTitle: string): CareerMapping {
    // Placeholder implementation
    // In production, this would:
    // 1. Exact match against career taxonomy
    // 2. Fuzzy match if no exact match
    // 3. Return best match with confidence score

    const normalized = careerTitle.toLowerCase().trim();

    // Simple normalization for now
    const careerId = normalized
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-');

    return {
      careerId,
      confidence: 80, // Placeholder confidence
      matchedTitle: careerTitle,
    };
  }

  /**
   * Calculate final signal confidence.
   */
  private calculateConfidence(
    extracted: ExtractedSignal,
    sourceId: string,
    validationConfidence: number,
    mappingConfidence: number
  ): number {
    // Get source reliability
    const sourceReliability = this.reliabilityEngine.getReliability(sourceId);

    // Get signal type reliability (may vary by source)
    const signalTypeReliability = this.reliabilityEngine.getSignalTypeReliability(
      sourceId,
      extracted.signalType
    );

    // Calculate data freshness score
    const ageDays = (Date.now() - extracted.periodEnd.getTime()) / (1000 * 60 * 60 * 24);
    const freshnessScore = Math.max(0, 100 - ageDays * 0.5);

    // Weighted combination
    const confidence =
      sourceReliability * 0.3 +
      signalTypeReliability * 0.25 +
      validationConfidence * 0.2 +
      mappingConfidence * 0.15 +
      freshnessScore * 0.1;

    return Math.round(confidence);
  }

  /**
   * Normalize geography names.
   */
  private normalizeGeography(geography: string): string {
    const normalized = geography.toLowerCase().trim();

    // India state/UT mappings
    const indiaMappings: Record<string, string> = {
      'delhi': 'delhi',
      'new delhi': 'delhi',
      'mumbai': 'maharashtra',
      'bangalore': 'karnataka',
      'bengaluru': 'karnataka',
      'hyderabad': 'telangana',
      'chennai': 'tamil-nadu',
      'madras': 'tamil-nadu',
      'pune': 'maharashtra',
      'gurgaon': 'haryana',
      'gurugram': 'haryana',
      'noida': 'uttar-pradesh',
      'kolkata': 'west-bengal',
      'calcutta': 'west-bengal',
      'ahmedabad': 'gujarat',
      'jaipur': 'rajasthan',
      'india': 'india',
      'all india': 'india',
      'pan india': 'india',
    };

    return indiaMappings[normalized] ?? geography.toLowerCase().replace(/\s+/g, '-');
  }

  /**
   * Normalize strength to a consistent scale.
   */
  private normalizeStrength(strength: number, unit: string): number {
    // Different units require different normalization
    const unitLower = unit.toLowerCase();

    if (unitLower.includes('percent') || unitLower.includes('%')) {
      return strength; // Already normalized
    }

    if (unitLower.includes('count') || unitLower.includes('number')) {
      // Convert count to relative strength (0-100 scale based on typical ranges)
      // This is a placeholder - real implementation would use historical baselines
      return Math.min(100, Math.max(-100, strength / 10));
    }

    if (unitLower.includes('index')) {
      // Assume index is already roughly 0-100
      return strength;
    }

    // Default: assume raw value needs clamping
    return Math.min(100, Math.max(-100, strength));
  }

  /**
   * Map source ID to MarketSignalSource enum.
   */
  private mapSourceToEnum(sourceId: string): MarketSignalSource {
    const mapping: Record<string, MarketSignalSource> = {
      'ncs-india': 'ncs_india',
      'nsdc': 'nsdc',
      'aicte': 'government_report',
      'ugc': 'government_report',
      'ministry-labor': 'government_report',
      'naukri': 'naukri',
      'foundit': 'foundit',
      'indeed': 'indeed',
      'linkedin': 'linkedin',
      'nasscom': 'industry_association',
      'startup-india': 'government_report',
      'wef': 'research_report',
      'ilo': 'research_report',
    };

    return mapping[sourceId] ?? 'news_media';
  }

  /**
   * Map normalized provider geography to the canonical MarketSignal metadata scope.
   */
  private mapMetadataGeography(geography: string): MarketSignal['metadata']['geography'] {
    const normalized = geography.toLowerCase();

    if (normalized === 'global') {
      return 'global';
    }

    if (normalized === 'india' || normalized === 'all-india' || normalized === 'pan-india') {
      return 'india';
    }

    if (
      normalized.includes('delhi') ||
      normalized.includes('mumbai') ||
      normalized.includes('bangalore') ||
      normalized.includes('bengaluru') ||
      normalized.includes('hyderabad') ||
      normalized.includes('chennai') ||
      normalized.includes('pune') ||
      normalized.includes('kolkata')
    ) {
      return 'city';
    }

    return 'state';
  }

  /**
   * Generate unique signal ID.
   */
  private generateSignalId(): MarketSignalId {
    return `sig-${randomUUID()}` as MarketSignalId;
  }
}

/**
 * Factory function for SignalAdapter.
 */
export function createSignalAdapter(
  reliabilityEngine: SourceReliabilityEngine,
  config?: Partial<SignalAdapterConfig>
): SignalAdapter {
  return new SignalAdapter(reliabilityEngine, config);
}
