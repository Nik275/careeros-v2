/**
 * Confidence Fusion Engine
 *
 * Generates RecommendationConfidence based on:
 * - evidence quality
 * - engine agreement
 * - historical validation
 * - uncertainty
 */

import {
  RecommendationConfidence,
  EngineRecommendation,
  ConfidenceScore,
  AgreementScore,
  Weight,
  FusionTimestamp,
} from './fusion-types';

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface ConfidenceFusionConfig {
  // Component weights
  evidenceQualityWeight: Weight;
  engineAgreementWeight: Weight;
  historicalValidationWeight: Weight;

  // Thresholds
  highConfidenceThreshold: ConfidenceScore;
  mediumConfidenceThreshold: ConfidenceScore;
  lowConfidenceThreshold: ConfidenceScore;

  // Agreement thresholds
  strongAgreementThreshold: AgreementScore;
  moderateAgreementThreshold: AgreementScore;

  // Calibration
  calibrationTarget: number;
  maxConfidenceInflation: number;
}

export const DEFAULT_CONFIDENCE_CONFIG: ConfidenceFusionConfig = {
  evidenceQualityWeight: 0.35,
  engineAgreementWeight: 0.35,
  historicalValidationWeight: 0.30,

  highConfidenceThreshold: 80,
  mediumConfidenceThreshold: 60,
  lowConfidenceThreshold: 40,

  strongAgreementThreshold: 75,
  moderateAgreementThreshold: 50,

  calibrationTarget: 0.8,
  maxConfidenceInflation: 1.2,
};

// ============================================================================
// INPUTS
// ============================================================================

export interface ConfidenceInputs {
  careerId: string;
  careerName: string;

  // From individual engines
  engineRecommendations: EngineRecommendation[];

  // Quality metrics
  evidenceQuality: {
    psychology: Weight;
    career: Weight;
    mentor: Weight;
    learning: Weight;
    overall: Weight;
  };

  // Historical validation
  historicalValidation: {
    similarOutcomes: number;
    successRate: Weight;
    sampleSize: number;
    lastValidated: FusionTimestamp;
  };

  // Uncertainty factors
  uncertaintyFactors: string[];

  // Engine weights (to determine contribution)
  engineWeights: Record<string, Weight>;
}

// ============================================================================
// ENGINE
// ============================================================================

export class ConfidenceFusionEngine {
  private config: ConfidenceFusionConfig;

  constructor(config: Partial<ConfidenceFusionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIDENCE_CONFIG, ...config };
  }

  /**
   * Calculate confidence for a recommendation
   */
  calculateConfidence(inputs: ConfidenceInputs): RecommendationConfidence {
    const calculatedAt = Date.now();

    // Calculate component confidences
    const evidenceQuality = this.calculateEvidenceQuality(inputs);
    const engineAgreement = this.calculateEngineAgreement(inputs);
    const historicalValidation = this.calculateHistoricalValidation(inputs);
    const uncertainty = this.calculateUncertainty(inputs);

    // Calculate overall confidence
    let overallConfidence =
      evidenceQuality * this.config.evidenceQualityWeight +
      engineAgreement.agreementScore * this.config.engineAgreementWeight +
      historicalValidation * this.config.historicalValidationWeight;

    // Apply uncertainty penalty
    overallConfidence *= (1 - uncertainty * 0.3);

    // Calibrate confidence
    const { calibrationStatus, calibrationFactor } = this.calibrateConfidence(
      overallConfidence,
      inputs
    );
    overallConfidence *= calibrationFactor;

    // Ensure bounds
    overallConfidence = Math.min(100, Math.max(0, overallConfidence));

    // Identify uncertainty sources
    const uncertaintySources = this.identifyUncertaintySources(inputs);

    return {
      recommendationId: `rec-${inputs.careerId}`,
      careerId: inputs.careerId,
      overallConfidence: Math.round(overallConfidence),
      evidenceQuality: Math.round(evidenceQuality),
      engineAgreement: Math.round(engineAgreement.agreementScore),
      historicalValidation: Math.round(historicalValidation),
      uncertainty: Math.round(uncertainty * 100),
      engineAgreementDetails: {
        agreeingEngines: engineAgreement.agreeingEngines,
        disagreeingEngines: engineAgreement.disagreeingEngines,
        neutralEngines: engineAgreement.neutralEngines,
        agreementScore: Math.round(engineAgreement.agreementScore),
      },
      calibrationStatus,
      calibrationFactor,
      uncertaintySources,
      calculatedAt,
    };
  }

  /**
   * Calculate confidence for multiple recommendations
   */
  calculateBatchConfidence(
    inputsList: ConfidenceInputs[]
  ): Map<string, RecommendationConfidence> {
    const confidences = new Map<string, RecommendationConfidence>();

    for (const inputs of inputsList) {
      const confidence = this.calculateConfidence(inputs);
      confidences.set(inputs.careerId, confidence);
    }

    return confidences;
  }

  /**
   * Assess confidence calibration
   */
  assessCalibration(
    predictions: Array<{
      careerId: string;
      confidence: ConfidenceScore;
      actualOutcome: boolean;
    }>
  ): {
    calibrationScore: Weight;
    isWellCalibrated: boolean;
    bias: 'over-confident' | 'under-confident' | 'well-calibrated';
    recommendations: string[];
  } {
    // Group predictions by confidence bins
    const bins: Record<string, { predicted: number; actual: number; count: number }> = {};

    for (const pred of predictions) {
      const bin = `${Math.floor(pred.confidence / 10) * 10}`;
      if (!bins[bin]) {
        bins[bin] = { predicted: 0, actual: 0, count: 0 };
      }
      bins[bin].predicted += pred.confidence / 100;
      bins[bin].actual += pred.actualOutcome ? 1 : 0;
      bins[bin].count += 1;
    }

    // Calculate calibration error
    let totalError = 0;
    let totalCount = 0;

    for (const [_, bin] of Object.entries(bins)) {
      if (bin.count > 0) {
        const predictedRate = bin.predicted / bin.count;
        const actualRate = bin.actual / bin.count;
        totalError += Math.abs(predictedRate - actualRate) * bin.count;
        totalCount += bin.count;
      }
    }

    const calibrationError = totalCount > 0 ? totalError / totalCount : 0;
    const calibrationScore = Math.max(0, 1 - calibrationError);

    // Determine bias
    let bias: 'over-confident' | 'under-confident' | 'well-calibrated';
    if (calibrationScore > 0.8) {
      bias = 'well-calibrated';
    } else {
      const avgPredicted = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
      const avgActual = predictions.filter(p => p.actualOutcome).length / predictions.length * 100;
      bias = avgPredicted > avgActual + 10 ? 'over-confident' : 'under-confident';
    }

    const recommendations: string[] = [];
    if (bias === 'over-confident') {
      recommendations.push('Reduce confidence scores by 10-15% to match actual outcomes');
    } else if (bias === 'under-confident') {
      recommendations.push('Confidence scores can be increased by 5-10%');
    }

    return {
      calibrationScore,
      isWellCalibrated: bias === 'well-calibrated',
      bias,
      recommendations,
    };
  }

  // ============================================================================
  // PRIVATE CALCULATIONS
  // ============================================================================

  private calculateEvidenceQuality(inputs: ConfidenceInputs): ConfidenceScore {
    const { evidenceQuality } = inputs;

    // Weighted average of evidence quality from all engines
    const weightedQuality =
      evidenceQuality.psychology * 0.25 +
      evidenceQuality.career * 0.25 +
      evidenceQuality.mentor * 0.25 +
      evidenceQuality.learning * 0.25;

    return Math.round(weightedQuality * 100);
  }

  private calculateEngineAgreement(inputs: ConfidenceInputs): {
    agreementScore: AgreementScore;
    agreeingEngines: string[];
    disagreeingEngines: string[];
    neutralEngines: string[];
  } {
    const recommendations = inputs.engineRecommendations;
    if (recommendations.length === 0) {
      return {
        agreementScore: 0,
        agreeingEngines: [],
        disagreeingEngines: [],
        neutralEngines: [],
      };
    }

    // Get scores for this career from each engine
    const scores = recommendations.map(r => ({
      engineId: r.engineId,
      score: r.score,
    }));

    // Calculate mean and variance
    const meanScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
    const variance =
      scores.reduce((sum, s) => sum + Math.pow(s.score - meanScore, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    // Determine agreement based on standard deviation
    const agreementScore = Math.max(0, 100 - stdDev * 2);

    // Classify engines
    const agreeingEngines: string[] = [];
    const disagreeingEngines: string[] = [];
    const neutralEngines: string[] = [];

    for (const s of scores) {
      const diff = Math.abs(s.score - meanScore);
      if (diff < 0.1) {
        agreeingEngines.push(s.engineId);
      } else if (diff > 0.2) {
        disagreeingEngines.push(s.engineId);
      } else {
        neutralEngines.push(s.engineId);
      }
    }

    return {
      agreementScore: Math.round(agreementScore),
      agreeingEngines,
      disagreeingEngines,
      neutralEngines,
    };
  }

  private calculateHistoricalValidation(inputs: ConfidenceInputs): ConfidenceScore {
    const { historicalValidation } = inputs;

    if (historicalValidation.sampleSize === 0) {
      return 40; // Low confidence without validation
    }

    // Base score on success rate
    let score = historicalValidation.successRate * 100;

    // Adjust for sample size (more data = more reliable)
    const sampleFactor = Math.min(1, historicalValidation.sampleSize / 100);
    score = score * 0.7 + sampleFactor * 30;

    // Penalty for stale data
    const dataAge = Date.now() - historicalValidation.lastValidated;
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    if (dataAge > 2 * oneYear) {
      score *= 0.8;
    }

    return Math.round(score);
  }

  private calculateUncertainty(inputs: ConfidenceInputs): Weight {
    const factors = inputs.uncertaintyFactors;

    // Base uncertainty
    let uncertainty = 0.2;

    // Increase uncertainty based on number of factors
    uncertainty += Math.min(0.3, factors.length * 0.05);

    // Specific uncertainty increases
    const criticalFactors = [
      'limited-historical-data',
      'conflicting-engine-recommendations',
      'high-market-volatility',
      'student-profile-incomplete',
    ];

    for (const factor of factors) {
      if (criticalFactors.some(cf => factor.toLowerCase().includes(cf))) {
        uncertainty += 0.1;
      }
    }

    return Math.min(1, uncertainty);
  }

  private calibrateConfidence(
    rawConfidence: ConfidenceScore,
    inputs: ConfidenceInputs
  ): {
    calibrationStatus: 'well-calibrated' | 'over-confident' | 'under-confident';
    calibrationFactor: number;
  } {
    // Simple calibration based on historical validation
    const validation = inputs.historicalValidation;

    if (validation.sampleSize < 10) {
      // Not enough data to calibrate
      return {
        calibrationStatus: 'under-confident',
        calibrationFactor: 0.95, // Slightly reduce to avoid over-confidence
      };
    }

    const successRate = validation.successRate * 100;
    const diff = rawConfidence - successRate;

    if (Math.abs(diff) < 10) {
      return {
        calibrationStatus: 'well-calibrated',
        calibrationFactor: 1.0,
      };
    }

    if (diff > 10) {
      // Over-confident
      const factor = Math.max(0.8, 1 - diff / 200);
      return {
        calibrationStatus: 'over-confident',
        calibrationFactor: factor,
      };
    }

    // Under-confident
    const factor = Math.min(this.config.maxConfidenceInflation, 1 + Math.abs(diff) / 200);
    return {
      calibrationStatus: 'under-confident',
      calibrationFactor: factor,
    };
  }

  private identifyUncertaintySources(
    inputs: ConfidenceInputs
  ): Array<{ source: string; impact: Weight; reducible: boolean }> {
    const sources: Array<{ source: string; impact: Weight; reducible: boolean }> = [];

    // Check evidence quality
    if (inputs.evidenceQuality.overall < 0.6) {
      sources.push({
        source: 'Incomplete evidence from engines',
        impact: 0.15,
        reducible: true,
      });
    }

    // Check sample size
    if (inputs.historicalValidation.sampleSize < 30) {
      sources.push({
        source: 'Limited historical validation data',
        impact: 0.2,
        reducible: true,
      });
    }

    // Check engine agreement
    if (inputs.engineRecommendations.length > 1) {
      const scores = inputs.engineRecommendations.map(r => r.score);
      const variance =
        scores.reduce((sum, s) => sum + Math.pow(s - scores[0], 2), 0) / scores.length;
      if (variance > 0.05) {
        sources.push({
          source: 'Disagreement between recommendation engines',
          impact: 0.15,
          reducible: false,
        });
      }
    }

    // Check for specific factors
    for (const factor of inputs.uncertaintyFactors) {
      sources.push({
        source: factor,
        impact: 0.1,
        reducible: !factor.includes('market') && !factor.includes('external'),
      });
    }

    return sources;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  getConfidenceLevel(confidence: ConfidenceScore): 'high' | 'medium' | 'low' {
    if (confidence >= this.config.highConfidenceThreshold) return 'high';
    if (confidence >= this.config.mediumConfidenceThreshold) return 'medium';
    return 'low';
  }

  getAgreementLevel(agreement: AgreementScore): 'strong' | 'moderate' | 'weak' {
    if (agreement >= this.config.strongAgreementThreshold) return 'strong';
    if (agreement >= this.config.moderateAgreementThreshold) return 'moderate';
    return 'weak';
  }

  getConfig(): ConfidenceFusionConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<ConfidenceFusionConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

export default ConfidenceFusionEngine;
