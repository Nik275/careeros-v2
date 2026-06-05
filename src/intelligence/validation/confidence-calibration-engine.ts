/**
 * Confidence Calibration Engine
 *
 * Validates confidence scores against historical outcomes.
 * Detects overconfidence, underconfidence, and confidence inflation.
 */

import {
  ConfidenceCalibrationReport,
  ValidationTimestamp,
  ValidationId,
  CalibrationScore,
  ConfidenceLevel,
  DEFAULT_VALIDATION_CONFIG,
  ValidationConfig,
} from './validation-types';

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface CalibrationConfig {
  // Bin configuration
  numBins: number;
  binSize: number;

  // Minimum samples per bin for statistical significance
  minSamplesPerBin: number;

  // Recency weighting (more recent outcomes weighted higher)
  recencyHalfLife: number; // days

  // Smoothing factor for small samples
  smoothingFactor: number;

  // Alert thresholds
  maxCalibrationError: number; // E.g., 0.15 (15%)
  maxOverconfidence: number; // E.g., 0.2 (20%)
}

export const DEFAULT_CALIBRATION_CONFIG: CalibrationConfig = {
  numBins: 10,
  binSize: 10, // 10% per bin (0-10, 10-20, etc.)
  minSamplesPerBin: 30,
  recencyHalfLife: 90, // 90 days
  smoothingFactor: 0.1,
  maxCalibrationError: 0.15,
  maxOverconfidence: 0.2,
};

// ============================================================================
// INPUTS
// ============================================================================

export interface CalibrationInput {
  recommendationId: string;
  engineId: string;
  predictedConfidence: ConfidenceLevel; // 0-100
  predictedOutcome: 'success' | 'failure' | 'partial';
  actualOutcome?: 'success' | 'failure' | 'partial' | 'unknown';
  timestamp: ValidationTimestamp;
  weight?: number; // Importance weight
}

// ============================================================================
// ENGINE
// ============================================================================

export class ConfidenceCalibrationEngine {
  private config: CalibrationConfig;
  private validationConfig: ValidationConfig;
  private historicalData: CalibrationInput[] = [];

  constructor(
    config: Partial<CalibrationConfig> = {},
    validationConfig: Partial<ValidationConfig> = {}
  ) {
    this.config = { ...DEFAULT_CALIBRATION_CONFIG, ...config };
    this.validationConfig = { ...DEFAULT_VALIDATION_CONFIG, ...validationConfig };
  }

  /**
   * Add historical data point for calibration analysis
   */
  addDataPoint(input: CalibrationInput): void {
    this.historicalData.push(input);
    // Keep only last 2 years of data
    const cutoff = Date.now() - 2 * 365 * 24 * 60 * 60 * 1000;
    this.historicalData = this.historicalData.filter(d => d.timestamp > cutoff);
  }

  /**
   * Add multiple data points
   */
  addDataPoints(inputs: CalibrationInput[]): void {
    for (const input of inputs) {
      this.addDataPoint(input);
    }
  }

  /**
   * Generate calibration report
   */
  generateReport(options?: {
    engineFilter?: string;
    timeRange?: { start: ValidationTimestamp; end: ValidationTimestamp };
  }): ConfidenceCalibrationReport {
    const reportId = `calibration-${Date.now()}`;
    const generatedAt = Date.now();

    // Filter data
    let data = this.historicalData;
    if (options?.engineFilter) {
      data = data.filter(d => d.engineId === options.engineFilter);
    }
    if (options?.timeRange) {
      data = data.filter(
        d => d.timestamp >= options.timeRange!.start && d.timestamp <= options.timeRange!.end
      );
    }

    // Only include data with known outcomes
    const completedData = data.filter(d => d.actualOutcome && d.actualOutcome !== 'unknown');

    if (completedData.length === 0) {
      return this.generateEmptyReport(reportId, generatedAt);
    }

    // Analyze confidence bins
    const confidenceBins = this.analyzeConfidenceBins(completedData);

    // Calculate overall calibration
    const overallCalibration = this.calculateOverallCalibration(confidenceBins);

    // Analyze by engine
    const engineCalibration = this.analyzeEngineCalibration(data);

    // Calculate trend
    const calibrationTrend = this.calculateCalibrationTrend(completedData);

    // Generate recommendations
    const recommendations = this.generateCalibrationRecommendations(
      overallCalibration,
      confidenceBins,
      engineCalibration
    );

    return {
      reportId,
      generatedAt,
      overallCalibration,
      confidenceBins,
      engineCalibration,
      calibrationTrend,
      recommendations,
      totalRecommendationsAnalyzed: completedData.length,
      timeRange: {
        start: completedData[0]?.timestamp || generatedAt,
        end: completedData[completedData.length - 1]?.timestamp || generatedAt,
      },
    };
  }

  /**
   * Check if a confidence score is well-calibrated
   */
  checkCalibration(
    confidence: ConfidenceLevel,
    engineId: string
  ): {
    calibrated: boolean;
    expectedAccuracy: number;
    bias: 'overconfident' | 'underconfident' | 'neutral';
    adjustment: number;
  } {
    const engineData = this.historicalData.filter(
      d => d.engineId === engineId && d.actualOutcome && d.actualOutcome !== 'unknown'
    );

    if (engineData.length < this.config.minSamplesPerBin) {
      return {
        calibrated: true, // Assume calibrated if insufficient data
        expectedAccuracy: confidence,
        bias: 'neutral',
        adjustment: 1.0,
      };
    }

    const binIndex = Math.min(
      Math.floor(confidence / this.config.binSize),
      this.config.numBins - 1
    );
    const binStart = binIndex * this.config.binSize;
    const binEnd = binStart + this.config.binSize;

    const binData = engineData.filter(
      d => d.predictedConfidence >= binStart && d.predictedConfidence < binEnd
    );

    if (binData.length < this.config.minSamplesPerBin) {
      return {
        calibrated: true,
        expectedAccuracy: confidence,
        bias: 'neutral',
        adjustment: 1.0,
      };
    }

    const actualAccuracy =
      binData.filter(d => d.actualOutcome === 'success').length / binData.length;
    const predictedAccuracy = confidence / 100;
    const calibrationError = Math.abs(predictedAccuracy - actualAccuracy);

    let bias: 'overconfident' | 'underconfident' | 'neutral' = 'neutral';
    if (predictedAccuracy > actualAccuracy + this.config.maxCalibrationError) {
      bias = 'overconfident';
    } else if (actualAccuracy > predictedAccuracy + this.config.maxCalibrationError) {
      bias = 'underconfident';
    }

    const adjustment = actualAccuracy / predictedAccuracy;

    return {
      calibrated: calibrationError <= this.config.maxCalibrationError,
      expectedAccuracy: actualAccuracy * 100,
      bias,
      adjustment,
    };
  }

  /**
   * Calculate calibration score using Expected Calibration Error (ECE)
   */
  calculateECE(data: CalibrationInput[]): number {
    const completedData = data.filter(d => d.actualOutcome && d.actualOutcome !== 'unknown');
    if (completedData.length === 0) return 0;

    let totalError = 0;
    let totalSamples = 0;

    for (let bin = 0; bin < this.config.numBins; bin++) {
      const binStart = bin * this.config.binSize;
      const binEnd = binStart + this.config.binSize;

      const binData = completedData.filter(
        d => d.predictedConfidence >= binStart && d.predictedConfidence < binEnd
      );

      if (binData.length === 0) continue;

      const binPredicted =
        binData.reduce((sum, d) => sum + d.predictedConfidence, 0) / binData.length / 100;
      const binActual =
        binData.filter(d => d.actualOutcome === 'success').length / binData.length;

      totalError += binData.length * Math.abs(binPredicted - binActual);
      totalSamples += binData.length;
    }

    return totalSamples > 0 ? totalError / totalSamples : 0;
  }

  /**
   * Calculate Brier score for probabilistic predictions
   */
  calculateBrierScore(data: CalibrationInput[]): number {
    const completedData = data.filter(d => d.actualOutcome && d.actualOutcome !== 'unknown');
    if (completedData.length === 0) return 0;

    let totalScore = 0;
    for (const point of completedData) {
      const predictedProb = point.predictedConfidence / 100;
      const actualOutcome = point.actualOutcome === 'success' ? 1 : 0;
      totalScore += Math.pow(predictedProb - actualOutcome, 2);
    }

    return totalScore / completedData.length;
  }

  /**
   * Get calibration statistics
   */
  getStatistics(): {
    totalDataPoints: number;
    completedOutcomes: number;
    successRate: number;
    averageConfidence: number;
    calibrationError: number;
  } {
    const completedData = this.historicalData.filter(
      d => d.actualOutcome && d.actualOutcome !== 'unknown'
    );

    if (completedData.length === 0) {
      return {
        totalDataPoints: this.historicalData.length,
        completedOutcomes: 0,
        successRate: 0,
        averageConfidence: 0,
        calibrationError: 0,
      };
    }

    const successRate =
      completedData.filter(d => d.actualOutcome === 'success').length / completedData.length;
    const averageConfidence =
      completedData.reduce((sum, d) => sum + d.predictedConfidence, 0) / completedData.length;

    return {
      totalDataPoints: this.historicalData.length,
      completedOutcomes: completedData.length,
      successRate: successRate * 100,
      averageConfidence,
      calibrationError: Math.abs(averageConfidence / 100 - successRate) * 100,
    };
  }

  /**
   * Clear all historical data
   */
  clearData(): void {
    this.historicalData = [];
  }

  /**
   * Get current config
   */
  getConfig(): CalibrationConfig {
    return { ...this.config };
  }

  /**
   * Update config
   */
  updateConfig(config: Partial<CalibrationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Bin predictions by confidence level
   */
  binPredictions(predictions: Array<{ careerId: string; confidence: number; actualOutcome: boolean | undefined }>): Array<{
    binStart: number;
    binEnd: number;
    predictions: typeof predictions;
    count: number;
    averageConfidence: number;
    actualFrequency: number;
    error: number;
    sampleSizeAdequate: boolean;
  }> {
    // Return empty array if no predictions
    if (predictions.length === 0) {
      return [];
    }

    const bins: ReturnType<typeof this.binPredictions> = [];
    const binSize = 100 / this.config.numBins;

    for (let i = 0; i < this.config.numBins; i++) {
      const binStart = i * binSize;
      const binEnd = (i + 1) * binSize;
      const binPredictions = predictions.filter(
        p => p.confidence >= binStart && p.confidence < binEnd
      );

      const validPredictions = binPredictions.filter(p => typeof p.actualOutcome === 'boolean');
      const count = binPredictions.length;
      const averageConfidence = count > 0
        ? binPredictions.reduce((sum, p) => sum + p.confidence, 0) / count
        : (binStart + binEnd) / 2;
      const actualFrequency = validPredictions.length > 0
        ? (validPredictions.filter(p => p.actualOutcome === true).length / validPredictions.length) * 100
        : 0;
      const error = Math.abs(averageConfidence - actualFrequency);

      bins.push({
        binStart,
        binEnd,
        predictions: binPredictions,
        count,
        averageConfidence,
        actualFrequency,
        error,
        sampleSizeAdequate: count >= this.config.minSamplesPerBin,
      });
    }

    return bins;
  }

  /**
   * Analyze calibration from binned predictions
   */
  analyzeCalibration(bins: ReturnType<typeof this.binPredictions>): {
    overallCalibration: {
      score: number;
      status: 'well-calibrated' | 'overconfident' | 'underconfident' | 'severely-miscalibrated';
      ece: number;
      miscalibration: number;
      overconfidence: number;
      underconfidence: number;
      actualAccuracy: number;
      confidenceAccuracyCorrelation: number;
    };
    binAnalysis: Array<{
      binStart: number;
      binEnd: number;
      predictedAccuracy: number;
      actualAccuracy: number;
      error: number;
      sampleSize: number;
      sampleSizeAdequate: boolean;
    }>;
    recommendations: string[];
  } {
    const validBins = bins.filter(b => b.count > 0);
    const totalSamples = validBins.reduce((sum, b) => sum + b.count, 0);

    if (totalSamples === 0) {
      return {
        overallCalibration: {
          score: 0,
          status: 'well-calibrated',
          ece: 0,
          miscalibration: 0,
          overconfidence: 0,
          underconfidence: 0,
          actualAccuracy: 0,
          confidenceAccuracyCorrelation: 0,
        },
        binAnalysis: [],
        recommendations: ['Insufficient data for calibration analysis'],
      };
    }

    // Calculate ECE (Expected Calibration Error)
    let ece = 0;
    let overconfidenceSum = 0;
    let underconfidenceSum = 0;
    let overconfidenceWeight = 0;
    let underconfidenceWeight = 0;

    for (const bin of validBins) {
      const weight = bin.count / totalSamples;
      const predictedAcc = bin.averageConfidence;
      const actualAcc = bin.actualFrequency;
      const error = Math.abs(predictedAcc - actualAcc);
      ece += weight * error;

      if (predictedAcc > actualAcc) {
        overconfidenceSum += error * weight;
        overconfidenceWeight += weight;
      } else if (actualAcc > predictedAcc) {
        underconfidenceSum += error * weight;
        underconfidenceWeight += weight;
      }
    }

    const overconfidence = overconfidenceWeight > 0 ? overconfidenceSum / overconfidenceWeight : 0;
    const underconfidence = underconfidenceWeight > 0 ? underconfidenceSum / underconfidenceWeight : 0;

    // Calculate actual accuracy across all predictions
    const allValidPredictions = validBins.flatMap(b =>
      b.predictions.filter(p => typeof p.actualOutcome === 'boolean')
    );
    const actualAccuracy = allValidPredictions.length > 0
      ? (allValidPredictions.filter(p => p.actualOutcome === true).length / allValidPredictions.length) * 100
      : 0;

    // Calculate correlation (simplified)
    const avgConfidence = validBins.reduce((sum, b) => sum + b.averageConfidence * (b.count / totalSamples), 0);
    const correlation = actualAccuracy > 0 ? 1 - Math.abs(avgConfidence - actualAccuracy) / 100 : 0;

    // Determine status and score
    let status: typeof report.overallCalibration.status = 'well-calibrated';
    let score = Math.max(0, 100 - ece * 2);

    if (ece > 30) {
      status = 'severely-miscalibrated';
      score = Math.max(0, 100 - ece * 3);
    } else if (overconfidence > 15) {
      status = 'overconfident';
    } else if (underconfidence > 15) {
      status = 'underconfident';
    }

    const binAnalysis = bins.map(b => ({
      binStart: b.binStart,
      binEnd: b.binEnd,
      predictedAccuracy: b.averageConfidence,
      actualAccuracy: b.actualFrequency,
      error: b.error,
      sampleSize: b.count,
      sampleSizeAdequate: b.sampleSizeAdequate,
    }));

    const recommendations: string[] = [];
    if (status === 'overconfident') {
      recommendations.push('Reduce confidence scores to match actual accuracy');
    } else if (status === 'underconfident') {
      recommendations.push('Increase confidence scores when evidence is strong');
    } else if (status === 'well-calibrated') {
      recommendations.push('Calibration is good - maintain current practices');
    }

    const report = {
      overallCalibration: {
        score,
        status,
        ece,
        miscalibration: ece,
        overconfidence,
        underconfidence,
        actualAccuracy,
        confidenceAccuracyCorrelation: correlation,
      },
      binAnalysis,
      recommendations,
    };

    return report;
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private generateEmptyReport(
    reportId: ValidationId,
    generatedAt: ValidationTimestamp
  ): ConfidenceCalibrationReport {
    return {
      reportId,
      generatedAt,
      overallCalibration: {
        score: 0,
        status: 'unstable',
        confidence: 0,
      },
      confidenceBins: [],
      engineCalibration: {},
      calibrationTrend: [],
      recommendations: ['Insufficient data for calibration analysis. Collect more outcomes.'],
      totalRecommendationsAnalyzed: 0,
      timeRange: { start: generatedAt, end: generatedAt },
    };
  }

  private analyzeConfidenceBins(data: CalibrationInput[]): ConfidenceCalibrationReport['confidenceBins'] {
    const bins: ConfidenceCalibrationReport['confidenceBins'] = [];

    for (let bin = 0; bin < this.config.binCount; bin++) {
      const binStart = bin * this.config.binSize;
      const binEnd = Math.min(binStart + this.config.binSize, 100);

      const binData = data.filter(
        d => d.predictedConfidence >= binStart && d.predictedConfidence < binEnd
      );

      if (binData.length === 0) {
        bins.push({
          binRange: [binStart, binEnd],
          predictedConfidence: (binStart + binEnd) / 2,
          actualAccuracy: 0,
          sampleSize: 0,
          calibrationError: 0,
        });
        continue;
      }

      const predictedConfidence =
        binData.reduce((sum, d) => sum + d.predictedConfidence, 0) / binData.length;
      const actualAccuracy =
        (binData.filter(d => d.actualOutcome === 'success').length / binData.length) * 100;

      bins.push({
        binRange: [binStart, binEnd],
        predictedConfidence,
        actualAccuracy,
        sampleSize: binData.length,
        calibrationError: Math.abs(predictedConfidence - actualAccuracy),
      });
    }

    return bins;
  }

  private calculateOverallCalibration(
    bins: ConfidenceCalibrationReport['confidenceBins']
  ): ConfidenceCalibrationReport['overallCalibration'] {
    const validBins = bins.filter(b => b.sampleSize >= this.config.minSamplesPerBin);

    if (validBins.length === 0) {
      return {
        score: 0,
        status: 'unstable',
        confidence: 0,
      };
    }

    // Calculate ECE (Expected Calibration Error)
    const totalSamples = validBins.reduce((sum, b) => sum + b.sampleSize, 0);
    const ece =
      validBins.reduce((sum, b) => sum + b.sampleSize * (b.calibrationError / 100), 0) /
      totalSamples;

    // Convert ECE to calibration score (1 - ECE, scaled to 0-1)
    const score = Math.max(0, 1 - ece);

    let status: ConfidenceCalibrationReport['overallCalibration']['status'] = 'unstable';
    if (score >= this.validationConfig.calibrationThresholds.wellCalibrated) {
      status = 'well-calibrated';
    } else if (score >= this.validationConfig.calibrationThresholds.acceptable) {
      status = 'overconfident';
    } else if (score >= this.validationConfig.calibrationThresholds.poor) {
      status = 'underconfident';
    }

    // Calculate average confidence
    const avgConfidence =
      validBins.reduce((sum, b) => sum + b.predictedConfidence * b.sampleSize, 0) /
      totalSamples;

    return {
      score,
      status,
      confidence: avgConfidence,
    };
  }

  private analyzeEngineCalibration(
    data: CalibrationInput[]
  ): ConfidenceCalibrationReport['engineCalibration'] {
    const engineData: Record<string, CalibrationInput[]> = {};

    for (const point of data) {
      if (!engineData[point.engineId]) {
        engineData[point.engineId] = [];
      }
      engineData[point.engineId].push(point);
    }

    const engineCalibration: ConfidenceCalibrationReport['engineCalibration'] = {};

    for (const [engineId, points] of Object.entries(engineData)) {
      const completedPoints = points.filter(p => p.actualOutcome && p.actualOutcome !== 'unknown');

      if (completedPoints.length < this.config.minSamplesPerBin * 2) {
        engineCalibration[engineId] = {
          score: 0.5,
          bias: 'neutral',
          recommendedAdjustment: 1.0,
        };
        continue;
      }

      const avgPredicted =
        completedPoints.reduce((sum, p) => sum + p.predictedConfidence, 0) /
        completedPoints.length;
      const avgActual =
        (completedPoints.filter(p => p.actualOutcome === 'success').length /
          completedPoints.length) *
        100;

      const bias: 'overconfident' | 'underconfident' | 'neutral' =
        avgPredicted > avgActual + 10 ? 'overconfident' : avgActual > avgPredicted + 10 ? 'underconfident' : 'neutral';

      const adjustment = avgActual / avgPredicted;
      const score = 1 - Math.abs(avgPredicted - avgActual) / 100;

      engineCalibration[engineId] = {
        score,
        bias,
        recommendedAdjustment: Math.max(0.5, Math.min(1.5, adjustment)),
      };
    }

    return engineCalibration;
  }

  private calculateCalibrationTrend(
    data: CalibrationInput[]
  ): ConfidenceCalibrationReport['calibrationTrend'] {
    // Sort by timestamp
    const sortedData = [...data].sort((a, b) => a.timestamp - b.timestamp);

    // Calculate rolling calibration over time windows
    const windowSize = Math.max(50, Math.floor(sortedData.length / 10));
    const trend: ConfidenceCalibrationReport['calibrationTrend'] = [];

    for (let i = windowSize; i <= sortedData.length; i += windowSize / 2) {
      const windowData = sortedData.slice(i - windowSize, i);
      const bins = this.analyzeConfidenceBins(windowData);
      const calibration = this.calculateOverallCalibration(bins);

      trend.push({
        timestamp: windowData[windowData.length - 1].timestamp,
        score: calibration.score,
      });
    }

    return trend;
  }

  private generateCalibrationRecommendations(
    overallCalibration: ConfidenceCalibrationReport['overallCalibration'],
    bins: ConfidenceCalibrationReport['confidenceBins'],
    engineCalibration: ConfidenceCalibrationReport['engineCalibration']
  ): string[] {
    const recommendations: string[] = [];

    if (overallCalibration.status === 'overconfident') {
      recommendations.push(
        'System is overconfident. Consider reducing confidence scores by 10-15% or gathering more conservative evidence.'
      );
    } else if (overallCalibration.status === 'underconfident') {
      recommendations.push(
        'System is underconfident. Confidence scores may be increased if evidence supports it.'
      );
    }

    // Check for poorly calibrated bins
    const poorlyCalibratedBins = bins.filter(
      b => b.sampleSize >= this.config.minSamplesPerBin && b.calibrationError > 20
    );
    if (poorlyCalibratedBins.length > 0) {
      recommendations.push(
        `${poorlyCalibratedBins.length} confidence bins show significant calibration error (>20%). Review confidence scoring in these ranges.`
      );
    }

    // Check engine-specific issues
    const overconfidentEngines = Object.entries(engineCalibration).filter(
      ([_, cal]) => cal.bias === 'overconfident'
    );
    if (overconfidentEngines.length > 0) {
      recommendations.push(
        `Engines showing overconfidence: ${overconfidentEngines.map(([id]) => id).join(', ')}. Apply recommended adjustments.`
      );
    }

    // Sample size recommendations
    const lowSampleBins = bins.filter(b => b.sampleSize > 0 && b.sampleSize < this.config.minSamplesPerBin);
    if (lowSampleBins.length > 0) {
      recommendations.push(
        `${lowSampleBins.length} confidence bins have insufficient samples. Collect more outcome data for reliable calibration.`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('Calibration is within acceptable bounds. Continue monitoring.');
    }

    return recommendations;
  }
}

export default ConfidenceCalibrationEngine;
