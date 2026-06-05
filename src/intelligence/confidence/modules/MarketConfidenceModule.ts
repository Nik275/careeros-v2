/**
 * CareerOS Market Confidence Module
 * 
 * Domain-specific confidence module for market trend calculations.
 * Delegates ALL calculations to ConfidenceAuthority.
 * 
 * @module confidence/modules/market
 * @version 1.0.0
 * @deprecated Use ConfidenceAuthority.calculateConfidence() directly
 */

import type {
  Confidence,
  ConfidenceValue,
} from '../ConfidenceTypes';
import { ConfidenceAuthority, getConfidenceAuthority } from '../ConfidenceAuthority';

// ============================================================================
// MODULE INTERFACE
// ============================================================================

export interface MarketConfidenceInput {
  /** Market trend data */
  readonly trendData: {
    readonly trendId: string;
    readonly direction: 'up' | 'down' | 'stable';
    readonly magnitude: number;
    readonly timeframe: string;
  };
  
  /** Signal quality metrics */
  readonly signalMetrics: {
    readonly signalQuality: number;
    readonly signalQuantity: number;
    readonly sourceReliability: number;
    readonly dataFreshness: number;
    readonly consistency: number;
  };
  
  /** Supporting signals */
  readonly signals: Array<{
    readonly type: string;
    readonly source: string;
    readonly strength: number;
    readonly timestamp: number;
  }>;
}

export interface MarketConfidenceResult {
  readonly confidence: ConfidenceValue;
  readonly trendConfidence: number;
  readonly signalQuality: number;
}

// ============================================================================
// MARKET CONFIDENCE MODULE
// ============================================================================

/**
 * @deprecated Use ConfidenceAuthority.calculateConfidence() with predictionType 'market-trend'
 * 
 * This module exists for backward compatibility only.
 * All calculations are delegated to ConfidenceAuthority.
 */
export class MarketConfidenceModule {
  private authority: ConfidenceAuthority;

  constructor(authority?: ConfidenceAuthority) {
    this.authority = authority ?? getConfidenceAuthority();
  }

  /**
   * Calculate confidence for market trend.
   * 
   * @deprecated Use ConfidenceAuthority.calculateConfidence()
   */
  async calculateConfidence(
    input: MarketConfidenceInput
  ): Promise<MarketConfidenceResult> {
    console.warn(
      '[DEPRECATED] MarketConfidenceModule.calculateConfidence() is deprecated. ' +
      'Use ConfidenceAuthority.calculateConfidence() with predictionType "market-trend"'
    );

    const { trendData, signalMetrics, signals } = input;

    // Call Confidence Authority
    const confidenceResult = await this.authority.calculateConfidence({
      requestId: `market-trend-${Date.now()}`,
      requestingSystem: 'MarketConfidenceModule',
      predictionType: 'market-trend',
      prediction: {
        trendId: trendData.trendId,
        direction: trendData.direction,
        magnitude: trendData.magnitude,
      },
      evidence: signals.map(s => ({
        type: s.type,
        source: s.source,
        quality: Math.max(0, Math.min(1, s.strength)),
        timestamp: s.timestamp,
      })),
      context: {
        timestamp: Date.now(),
        metadata: {
          signalMetrics,
          trendData,
        },
      },
    });

    // Calculate trend confidence (domain metric)
    const trendConfidence = this.calculateTrendConfidence(signalMetrics);
    const signalQuality = this.calculateSignalQuality(signalMetrics);

    return {
      confidence: confidenceResult,
      trendConfidence,
      signalQuality,
    };
  }

  /**
   * Calculate trend confidence from signal metrics.
   * 
   * NOTE: This is domain logic.
   */
  private calculateTrendConfidence(
    metrics: MarketConfidenceInput['signalMetrics']
  ): number {
    const weights = {
      quality: 0.25,
      quantity: 0.20,
      reliability: 0.25,
      freshness: 0.15,
      consistency: 0.15,
    };

    return (
      metrics.signalQuality * weights.quality +
      metrics.signalQuantity * weights.quantity +
      metrics.sourceReliability * weights.reliability +
      metrics.dataFreshness * weights.freshness +
      metrics.consistency * weights.consistency
    );
  }

  /**
   * Calculate overall signal quality.
   */
  private calculateSignalQuality(
    metrics: MarketConfidenceInput['signalMetrics']
  ): number {
    return (metrics.signalQuality + metrics.sourceReliability) / 2;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let globalModule: MarketConfidenceModule | null = null;

/**
 * @deprecated Use ConfidenceAuthority directly
 */
export function getMarketConfidenceModule(): MarketConfidenceModule {
  console.warn(
    '[DEPRECATED] getMarketConfidenceModule() is deprecated. ' +
    'Use getConfidenceAuthority()'
  );
  
  if (!globalModule) {
    globalModule = new MarketConfidenceModule();
  }
  return globalModule;
}

export function resetMarketConfidenceModule(): void {
  globalModule = null;
}
