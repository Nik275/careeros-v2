/**
 * CareerOS Confidence Calculator
 * 
 * Core calculation logic for confidence values.
 * This is the ONLY place where confidence calculations occur.
 * 
 * @module confidence/calculator
 * @version 1.0.0
 */

import type {
  Confidence,
  ConfidenceValue,
  ConfidenceFactor,
  ConfidenceEvidence,
  CalibrationStatus,
  ConfidenceRequest,
  ValidatedConfidence,
} from './ConfidenceTypes';
import { uuidv4 } from './ConfidenceId';
import {
  validateConfidence,
  getReliabilityBand,
  createDefaultBounds,
} from './ConfidenceTypes';

// ============================================================================
// CALCULATION CONFIGURATION
// ============================================================================

export interface CalculatorConfig {
  /** Default confidence when no evidence */
  readonly defaultConfidence: Confidence;
  
  /** Minimum confidence threshold */
  readonly minConfidence: Confidence;
  
  /** Maximum confidence threshold */
  readonly maxConfidence: Confidence;
  
  /** Evidence quality threshold */
  readonly evidenceThreshold: Confidence;
  
  /** Factor weights for different prediction types */
  readonly factorWeights: Record<string, Record<string, number>>;
}

export const DEFAULT_CALCULATOR_CONFIG: CalculatorConfig = {
  defaultConfidence: 0.5,
  minConfidence: 0.1,
  maxConfidence: 0.99,
  evidenceThreshold: 0.3,
  factorWeights: {
    'career-fit': {
      'profile-confidence': 0.30,
      'career-confidence': 0.30,
      'evidence-confidence': 0.20,
      'calculation-confidence': 0.20,
    },
    'career-recommendation': {
      'recommendation-confidence': 0.30,
      'evidence-confidence': 0.25,
      'profile-confidence': 0.25,
      'career-confidence': 0.20,
    },
    'decision': {
      'profile-certainty': 0.30,
      'career-certainty': 0.25,
      'evidence-certainty': 0.25,
      'recommendation-certainty': 0.20,
    },
    'archetype': {
      'evidence-score': 0.25,
      'stability-score': 0.20,
      'coverage-score': 0.20,
      'consistency-score': 0.20,
      'separation-score': 0.15,
    },
    'market-trend': {
      'signal-quality': 0.25,
      'signal-quantity': 0.20,
      'source-reliability': 0.25,
      'data-freshness': 0.15,
      'consistency': 0.15,
    },
    'default': {
      'evidence-quality': 0.40,
      'source-reliability': 0.35,
      'data-completeness': 0.25,
    },
  },
};

// ============================================================================
// CALCULATION INPUT
// ============================================================================

export interface CalculationInput {
  /** Prediction type */
  readonly predictionType: string;
  
  /** Evidence items */
  readonly evidence: ConfidenceEvidence[];
  
  /** Raw factor scores (0.0-1.0) */
  readonly factorScores: Record<string, Confidence>;
  
  /** System ID for context */
  readonly systemId: string;
  
  /** Request ID for tracing */
  readonly requestId: string;
}

// ============================================================================
// CONFIDENCE CALCULATOR
// ============================================================================

export class ConfidenceCalculator {
  private config: CalculatorConfig;

  constructor(config: Partial<CalculatorConfig> = {}) {
    this.config = { ...DEFAULT_CALCULATOR_CONFIG, ...config };
  }

  /**
   * Calculate confidence from input.
   * 
   * This is the SINGLE entry point for ALL confidence calculations.
   * No other system may calculate confidence.
   * 
   * @param input - Calculation input
   * @returns Confidence value with metadata
   */
  calculate(input: CalculationInput): ConfidenceValue {
    const lineageId = this.generateLineageId();
    const calculatedAt = Date.now();

    try {
      // Validate input
      this.validateInput(input);

      // Calculate factors
      const factors = this.calculateFactors(input);

      // Compute weighted confidence
      const rawConfidence = this.computeWeightedConfidence(
        input.predictionType,
        factors
      );

      // Validate and clamp
      const validatedConfidence = validateConfidence(rawConfidence);

      // Create confidence value
      const confidenceValue: ConfidenceValue = {
        value: validatedConfidence,
        lineageId,
        authority: 'ConfidenceAuthority',
        component: this.getComponentName(input.predictionType),
        calculatedAt,
        factors,
        evidence: input.evidence,
        calibration: this.createDefaultCalibration(),
        bounds: createDefaultBounds(validatedConfidence),
      };

      return confidenceValue;
    } catch {
      // Return fallback confidence on error
      console.error('Confidence calculation failed safely.');
      return this.createFallbackConfidence(lineageId, calculatedAt, input.evidence);
    }
  }

  /**
   * Calculate confidence from request.
   */
  calculateFromRequest(request: ConfidenceRequest): ConfidenceValue {
    // Convert evidence
    const evidence: ConfidenceEvidence[] = request.evidence.map(e => ({
      type: e.type,
      source: e.source,
      quality: e.quality,
      timestamp: e.timestamp,
    }));

    // Build factor scores from evidence
    const factorScores = this.buildFactorScoresFromEvidence(evidence);

    return this.calculate({
      predictionType: request.predictionType,
      evidence,
      factorScores,
      systemId: request.requestingSystem,
      requestId: request.requestId,
    });
  }

  /**
   * Validate calculation input.
   */
  private validateInput(input: CalculationInput): void {
    if (!input.predictionType) {
      throw new Error('Prediction type is required');
    }
    if (!input.systemId) {
      throw new Error('System ID is required');
    }
    if (!input.requestId) {
      throw new Error('Request ID is required');
    }

    // Validate factor scores
    Object.entries(input.factorScores).forEach(([name, score]) => {
      if (typeof score !== 'number' || isNaN(score)) {
        throw new Error(`Invalid factor score for ${name}: ${score}`);
      }
    });
  }

  /**
   * Calculate confidence factors.
   */
  private calculateFactors(input: CalculationInput): ConfidenceFactor[] {
    const weights = this.getWeights(input.predictionType);
    const factors: ConfidenceFactor[] = [];

    for (const [name, score] of Object.entries(input.factorScores)) {
      const weight = weights[name] ?? (1 / Object.keys(input.factorScores).length);
      const contribution = score * weight;

      factors.push({
        name,
        weight,
        score: validateConfidence(score),
        contribution,
        explanation: this.generateFactorExplanation(name, score),
      });
    }

    return factors;
  }

  /**
   * Compute weighted confidence from factors.
   */
  private computeWeightedConfidence(
    predictionType: string,
    factors: ConfidenceFactor[]
  ): Confidence {
    if (factors.length === 0) {
      return this.config.defaultConfidence;
    }

    // Sum weighted contributions
    const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
    const weightedSum = factors.reduce((sum, f) => sum + f.contribution, 0);

    // Normalize by total weight
    const confidence = totalWeight > 0 ? weightedSum / totalWeight : this.config.defaultConfidence;

    // Apply bounds
    return Math.max(
      this.config.minConfidence,
      Math.min(this.config.maxConfidence, confidence)
    );
  }

  /**
   * Get weights for prediction type.
   */
  private getWeights(predictionType: string): Record<string, number> {
    return this.config.factorWeights[predictionType] ?? this.config.factorWeights['default'];
  }

  /**
   * Build factor scores from evidence.
   */
  private buildFactorScoresFromEvidence(
    evidence: ConfidenceEvidence[]
  ): Record<string, Confidence> {
    if (evidence.length === 0) {
      return { 'default-confidence': this.config.defaultConfidence };
    }

    // Calculate average evidence quality
    const avgQuality = evidence.reduce((sum, e) => sum + e.quality, 0) / evidence.length;

    // Calculate source reliability from unique sources
    const uniqueSources = new Set(evidence.map(e => e.source));
    const sourceReliability = Math.min(1, uniqueSources.size / 5); // Max at 5+ sources

    return {
      'evidence-quality': avgQuality,
      'source-reliability': sourceReliability,
      'data-completeness': Math.min(1, evidence.length / 10), // Max at 10+ pieces
    };
  }

  /**
   * Generate factor explanation.
   */
  private generateFactorExplanation(name: string, score: Confidence): string {
    const percentage = Math.round(score * 100);
    
    const descriptions: Record<string, string> = {
      'profile-confidence': `Student profile confidence at ${percentage}%`,
      'career-confidence': `Career data confidence at ${percentage}%`,
      'evidence-confidence': `Evidence quality at ${percentage}%`,
      'calculation-confidence': `Calculation reliability at ${percentage}%`,
      'recommendation-confidence': `Recommendation strength at ${percentage}%`,
      'evidence-score': `Evidence score at ${percentage}%`,
      'stability-score': `Stability assessment at ${percentage}%`,
      'coverage-score': `Coverage at ${percentage}%`,
      'consistency-score': `Consistency at ${percentage}%`,
      'separation-score': `Archetype separation at ${percentage}%`,
      'signal-quality': `Signal quality at ${percentage}%`,
      'signal-quantity': `Signal quantity at ${percentage}%`,
      'source-reliability': `Source reliability at ${percentage}%`,
      'data-freshness': `Data freshness at ${percentage}%`,
    };

    return descriptions[name] ?? `${name} at ${percentage}%`;
  }

  /**
   * Create default calibration status.
   */
  private createDefaultCalibration(): CalibrationStatus {
    return {
      isCalibrated: false,
      error: 0.2,
      sampleSize: 0,
      reliability: 'unreliable',
    };
  }

  /**
   * Create fallback confidence for error cases.
   */
  private createFallbackConfidence(
    lineageId: string,
    calculatedAt: number,
    evidence: ConfidenceEvidence[]
  ): ConfidenceValue {
    const fallbackConfidence = this.config.defaultConfidence;

    return {
      value: fallbackConfidence,
      lineageId,
      authority: 'ConfidenceAuthority',
      component: 'fallback',
      calculatedAt,
      factors: [{
        name: 'fallback',
        weight: 1.0,
        score: fallbackConfidence,
        contribution: fallbackConfidence,
        explanation: 'Fallback confidence due to calculation error',
      }],
      evidence,
      calibration: this.createDefaultCalibration(),
      bounds: createDefaultBounds(fallbackConfidence),
    };
  }

  /**
   * Get component name for prediction type.
   */
  private getComponentName(predictionType: string): string {
    const componentMap: Record<string, string> = {
      'career-fit': 'CareerConfidenceModule',
      'career-recommendation': 'DecisionConfidenceModule',
      'decision': 'DecisionConfidenceModule',
      'archetype': 'ArchetypeConfidenceModule',
      'market-trend': 'MarketConfidenceModule',
    };

    return componentMap[predictionType] ?? 'ConfidenceCalculator';
  }

  /**
   * Generate unique lineage ID.
   */
  private generateLineageId(): string {
    return `conf-${uuidv4()}`;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let globalCalculator: ConfidenceCalculator | null = null;

export function getConfidenceCalculator(
  config?: Partial<CalculatorConfig>
): ConfidenceCalculator {
  if (!globalCalculator) {
    globalCalculator = new ConfidenceCalculator(config);
  }
  return globalCalculator;
}

export function resetConfidenceCalculator(): void {
  globalCalculator = null;
}
