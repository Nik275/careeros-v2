/**
 * CareerOS Confidence Aggregator
 * 
 * Aggregates multiple confidence values into a single confidence.
 * 
 * @module confidence/aggregator
 * @version 1.0.0
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  Confidence,
  ConfidenceValue,
  AggregationMethod,
  ConfidenceFactor,
} from './ConfidenceTypes';
import { validateConfidence, getReliabilityBand, createDefaultBounds } from './ConfidenceTypes';

// ============================================================================
// AGGREGATION INPUT
// ============================================================================

export interface AggregationInput {
  /** Confidence values to aggregate */
  readonly confidences: ConfidenceValue[];
  
  /** Aggregation method */
  readonly method: AggregationMethod;
  
  /** System requesting aggregation */
  readonly systemId: string;
  
  /** Request ID for tracing */
  readonly requestId: string;
  
  /** Optional custom weights (for weighted-average) */
  readonly weights?: number[];
}

// ============================================================================
// CONFIDENCE AGGREGATOR
// ============================================================================

export class ConfidenceAggregator {
  /**
   * Aggregate multiple confidence values.
   * 
   * @param input - Aggregation input
   * @returns Aggregated confidence value
   */
  aggregate(input: AggregationInput): ConfidenceValue {
    const { confidences, method, systemId, requestId } = input;

    if (confidences.length === 0) {
      throw new Error('Cannot aggregate empty confidence array');
    }

    if (confidences.length === 1) {
      return confidences[0];
    }

    const lineageId = this.generateLineageId();
    const calculatedAt = Date.now();

    // Perform aggregation
    let aggregatedConfidence: Confidence;
    let factors: ConfidenceFactor[];

    switch (method) {
      case 'weighted-average':
        ({ confidence: aggregatedConfidence, factors } = this.weightedAverage(
          confidences,
          input.weights
        ));
        break;
      case 'minimum':
        ({ confidence: aggregatedConfidence, factors } = this.minimum(confidences));
        break;
      case 'maximum':
        ({ confidence: aggregatedConfidence, factors } = this.maximum(confidences));
        break;
      case 'bayesian':
        ({ confidence: aggregatedConfidence, factors } = this.bayesian(confidences));
        break;
      case 'consensus':
        ({ confidence: aggregatedConfidence, factors } = this.consensus(confidences));
        break;
      default:
        ({ confidence: aggregatedConfidence, factors } = this.weightedAverage(
          confidences,
          input.weights
        ));
    }

    // Validate result
    aggregatedConfidence = validateConfidence(aggregatedConfidence);

    // Combine evidence from all inputs
    const allEvidence = confidences.flatMap(c => c.evidence);

    return {
      value: aggregatedConfidence,
      lineageId,
      authority: 'ConfidenceAuthority',
      component: 'ConfidenceAggregator',
      calculatedAt,
      factors: [
        ...factors,
        {
          name: 'aggregation-method',
          weight: 0.1,
          score: 0.9,
          contribution: 0.09,
          explanation: `Aggregated using ${method} method`,
        },
      ],
      evidence: allEvidence,
      calibration: this.combineCalibrationStatus(confidences),
      bounds: createDefaultBounds(aggregatedConfidence),
    };
  }

  /**
   * Weighted average aggregation.
   */
  private weightedAverage(
    confidences: ConfidenceValue[],
    weights?: number[]
  ): { confidence: Confidence; factors: ConfidenceFactor[] } {
    const validWeights = weights ?? confidences.map(() => 1 / confidences.length);
    
    if (validWeights.length !== confidences.length) {
      throw new Error('Weights length must match confidences length');
    }

    const totalWeight = validWeights.reduce((sum, w) => sum + w, 0);
    
    if (totalWeight === 0) {
      throw new Error('Total weight cannot be zero');
    }

    const weightedSum = confidences.reduce(
      (sum, c, i) => sum + c.value * validWeights[i],
      0
    );

    const confidence = weightedSum / totalWeight;

    const factors: ConfidenceFactor[] = confidences.map((c, i) => ({
      name: `input-${i + 1}`,
      weight: validWeights[i] / totalWeight,
      score: c.value,
      contribution: (c.value * validWeights[i]) / totalWeight,
      explanation: `Input ${i + 1} confidence: ${Math.round(c.value * 100)}%`,
    }));

    return { confidence, factors };
  }

  /**
   * Minimum confidence aggregation (conservative).
   */
  private minimum(confidences: ConfidenceValue[]): { 
    confidence: Confidence; 
    factors: ConfidenceFactor[] 
  } {
    const minConfidence = Math.min(...confidences.map(c => c.value));
    
    const factors: ConfidenceFactor[] = confidences.map((c, i) => ({
      name: `input-${i + 1}`,
      weight: 1 / confidences.length,
      score: c.value,
      contribution: c.value / confidences.length,
      explanation: `Input ${i + 1} confidence: ${Math.round(c.value * 100)}%`,
    }));

    return { confidence: minConfidence, factors };
  }

  /**
   * Maximum confidence aggregation (optimistic).
   */
  private maximum(confidences: ConfidenceValue[]): { 
    confidence: Confidence; 
    factors: ConfidenceFactor[] 
  } {
    const maxConfidence = Math.max(...confidences.map(c => c.value));
    
    const factors: ConfidenceFactor[] = confidences.map((c, i) => ({
      name: `input-${i + 1}`,
      weight: 1 / confidences.length,
      score: c.value,
      contribution: c.value / confidences.length,
      explanation: `Input ${i + 1} confidence: ${Math.round(c.value * 100)}%`,
    }));

    return { confidence: maxConfidence, factors };
  }

  /**
   * Bayesian aggregation.
   * Treats confidences as probabilities and combines using Bayes' theorem.
   */
  private bayesian(confidences: ConfidenceValue[]): { 
    confidence: Confidence; 
    factors: ConfidenceFactor[] 
  } {
    // Start with prior of 0.5
    let logOdds = 0;

    for (const c of confidences) {
      // Convert confidence to log-odds and add
      const odds = c.value / (1 - c.value);
      logOdds += Math.log(odds);
    }

    // Convert back to probability
    const aggregatedOdds = Math.exp(logOdds);
    const confidence = aggregatedOdds / (1 + aggregatedOdds);

    const factors: ConfidenceFactor[] = confidences.map((c, i) => ({
      name: `input-${i + 1}`,
      weight: 1 / confidences.length,
      score: c.value,
      contribution: c.value / confidences.length,
      explanation: `Input ${i + 1} confidence: ${Math.round(c.value * 100)}%`,
    }));

    return { confidence: Math.min(0.99, confidence), factors };
  }

  /**
   * Consensus aggregation.
   * Rewards agreement between confidences.
   */
  private consensus(confidences: ConfidenceValue[]): { 
    confidence: Confidence; 
    factors: ConfidenceFactor[] 
  } {
    const values = confidences.map(c => c.value);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    
    // Calculate variance
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    
    // Agreement factor: 1 when all agree, lower when they disagree
    const agreementFactor = 1 - Math.sqrt(variance);
    
    // Weight by agreement
    const confidence = mean * (0.7 + 0.3 * agreementFactor);

    const factors: ConfidenceFactor[] = [
      ...confidences.map((c, i) => ({
        name: `input-${i + 1}`,
        weight: 1 / confidences.length,
        score: c.value,
        contribution: c.value / confidences.length,
        explanation: `Input ${i + 1} confidence: ${Math.round(c.value * 100)}%`,
      })),
      {
        name: 'agreement-factor',
        weight: 0.3,
        score: agreementFactor,
        contribution: agreementFactor * 0.3,
        explanation: `Agreement factor: ${Math.round(agreementFactor * 100)}%`,
      },
    ];

    return { confidence, factors };
  }

  /**
   * Combine calibration statuses.
   */
  private combineCalibrationStatus(confidences: ConfidenceValue[]): {
    isCalibrated: boolean;
    error: number;
    sampleSize: number;
    reliability: 'excellent' | 'good' | 'moderate' | 'poor' | 'unreliable';
  } {
    const calibratedCount = confidences.filter(c => c.calibration.isCalibrated).length;
    const totalError = confidences.reduce((sum, c) => sum + c.calibration.error, 0);
    const totalSampleSize = confidences.reduce((sum, c) => sum + c.calibration.sampleSize, 0);

    const avgError = totalError / confidences.length;
    const isCalibrated = calibratedCount === confidences.length;

    return {
      isCalibrated,
      error: avgError,
      sampleSize: totalSampleSize,
      reliability: getReliabilityBand(1 - avgError),
    };
  }

  /**
   * Generate unique lineage ID.
   */
  private generateLineageId(): string {
    return `agg-${uuidv4()}`;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let globalAggregator: ConfidenceAggregator | null = null;

export function getConfidenceAggregator(): ConfidenceAggregator {
  if (!globalAggregator) {
    globalAggregator = new ConfidenceAggregator();
  }
  return globalAggregator;
}

export function resetConfidenceAggregator(): void {
  globalAggregator = null;
}
