/**
 * Confidence Calibration Engine
 * 
 * Core calibration logic for evaluating and adjusting confidence scores.
 * Ensures that stated confidence reflects actual probability of success.
 */

import {
  CalibrationObservation,
  CalibrationProfile,
  BinCalibration,
  CalibrationStatus,
  CalibrationTrend,
  CalibrationMetrics,
  ReliabilityDiagramPoint,
  CalibrationError,
  ConfidenceAdjustment,
  CalibrationHistory,
  Timestamp,
  DEFAULT_CALIBRATION_CONFIG,
  CalibrationEngineConfig,
  ReliabilityBand,
} from './calibration-types';

export interface ConfidenceCalibrationEngineOptions {
  config?: Partial<CalibrationEngineConfig>;
  historySize?: number;
}

export class ConfidenceCalibrationEngine {
  private observations: CalibrationObservation[] = [];
  private profile: CalibrationProfile | null = null;
  private history: CalibrationHistory = {
    timestamps: [],
    reliabilityScores: [],
    calibrationErrors: [],
    sampleSizes: [],
  };
  private config: CalibrationEngineConfig;
  private lastCalibrationTime: Timestamp = 0;

  constructor(
    private profileId: string,
    private profileName: string,
    options: ConfidenceCalibrationEngineOptions = {}
  ) {
    this.config = { ...DEFAULT_CALIBRATION_CONFIG, ...options.config };
  }

  /**
   * Add a new observation for calibration learning
   */
  addObservation(observation: CalibrationObservation): void {
    this.observations.push(observation);
    
    // Check if recalibration is needed
    const now = Date.now();
    if (now - this.lastCalibrationTime > this.config.recalibrationInterval) {
      this.calibrate();
    }
  }

  /**
   * Add multiple observations in batch
   */
  addObservations(observations: CalibrationObservation[]): void {
    observations.forEach(obs => this.observations.push(obs));
    this.calibrate();
  }

  /**
   * Perform calibration calculation
   */
  calibrate(): CalibrationProfile {
    if (this.observations.length < this.config.minSampleSize) {
      this.profile = this.createInsufficientDataProfile();
      return this.profile;
    }

    const binCalibrations = this.calculateBinCalibrations();
    const calibrationError = this.calculateCalibrationError(binCalibrations);
    const reliabilityScore = this.calculateReliabilityScore(binCalibrations, calibrationError);
    const status = this.determineCalibrationStatus(calibrationError, binCalibrations);
    const trend = this.calculateTrend();

    this.profile = {
      id: this.profileId,
      name: this.profileName,
      status,
      reliabilityBand: this.scoreToBand(reliabilityScore),
      reliabilityScore,
      calibrationError,
      sampleSize: this.observations.length,
      lastUpdated: Date.now(),
      binCalibrations,
      trend,
    };

    this.updateHistory();
    this.lastCalibrationTime = Date.now();

    return this.profile;
  }

  /**
   * Calculate calibration bins using histogram approach
   */
  private calculateBinCalibrations(): BinCalibration[] {
    const bins: BinCalibration[] = [];
    const binSize = 1 / this.config.binCount;

    for (let i = 0; i < this.config.binCount; i++) {
      const min = i * binSize;
      const max = (i + 1) * binSize;
      
      const binObservations = this.observations.filter(
        obs => obs.predictedConfidence >= min && obs.predictedConfidence < max
      );

      if (binObservations.length === 0) {
        bins.push({
          binRange: [min, max],
          predictedRate: (min + max) / 2,
          observedRate: (min + max) / 2, // Neutral assumption
          sampleCount: 0,
          calibrationError: 0,
        });
        continue;
      }

      const predictedRate = binObservations.reduce((sum, obs) => sum + obs.predictedConfidence, 0) / binObservations.length;
      const observedRate = binObservations.filter(obs => obs.actualOutcome).length / binObservations.length;
      
      bins.push({
        binRange: [min, max],
        predictedRate,
        observedRate,
        sampleCount: binObservations.length,
        calibrationError: Math.abs(predictedRate - observedRate),
      });
    }

    return bins;
  }

  /**
   * Calculate Expected Calibration Error (ECE)
   */
  private calculateCalibrationError(bins: BinCalibration[]): CalibrationError {
    const totalSamples = this.observations.length;
    
    if (totalSamples === 0) return 1;

    const weightedError = bins.reduce((sum, bin) => {
      if (bin.sampleCount === 0) return sum;
      return sum + (bin.sampleCount / totalSamples) * bin.calibrationError;
    }, 0);

    return Math.min(1, Math.max(0, weightedError));
  }

  /**
   * Calculate Maximum Calibration Error (MCE)
   */
  calculateMaximumCalibrationError(): CalibrationError {
    if (!this.profile) return 1;
    
    return Math.max(...this.profile.binCalibrations.map(bin => bin.calibrationError));
  }

  /**
   * Calculate Brier Score for probabilistic accuracy
   */
  calculateBrierScore(): number {
    if (this.observations.length === 0) return 1;

    const brierSum = this.observations.reduce((sum, obs) => {
      const outcomeValue = obs.actualOutcome ? 1 : 0;
      return sum + Math.pow(obs.predictedConfidence - outcomeValue, 2);
    }, 0);

    return brierSum / this.observations.length;
  }

  /**
   * Calculate reliability score from calibration quality
   */
  private calculateReliabilityScore(bins: BinCalibration[], calibrationError: CalibrationError): number {
    // Base score from inverse of calibration error
    const baseScore = Math.max(0, 1 - calibrationError);
    
    // Penalty for bins with low sample sizes
    const totalSamples = this.observations.length;
    const lowSamplePenalty = bins.reduce((penalty, bin) => {
      if (bin.sampleCount < 5) {
        return penalty + 0.05;
      }
      return penalty;
    }, 0);

    // Sample size confidence factor
    const sampleConfidence = Math.min(1, totalSamples / (this.config.minSampleSize * 3));
    
    const score = (baseScore * sampleConfidence) - lowSamplePenalty;
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Determine calibration status based on error metrics
   */
  private determineCalibrationStatus(error: CalibrationError, bins: BinCalibration[]): CalibrationStatus {
    if (this.observations.length < this.config.minSampleSize) {
      return CalibrationStatus.INSUFFICIENT_DATA;
    }

    // Check for overconfidence (predicted > observed)
    const overconfidenceBias = bins.reduce((sum, bin) => {
      if (bin.sampleCount < 5) return sum;
      return sum + (bin.predictedRate - bin.observedRate);
    }, 0) / bins.filter(b => b.sampleCount >= 5).length;

    if (overconfidenceBias > 0.1) return CalibrationStatus.OVERCONFIDENT;
    if (overconfidenceBias < -0.1) return CalibrationStatus.UNDERCONFIDENT;
    
    if (error <= this.config.maxCalibrationError) {
      return CalibrationStatus.WELL_CALIBRATED;
    }

    return CalibrationStatus.DRIFTING;
  }

  /**
   * Calculate trend from historical data
   */
  private calculateTrend(): CalibrationTrend {
    const historyLength = this.history.calibrationErrors.length;
    
    if (historyLength < 3) {
      return {
        direction: 'stable',
        rate: 0,
        periodsAnalyzed: historyLength,
      };
    }

    // Linear regression on recent errors
    const recentErrors = this.history.calibrationErrors.slice(-5);
    const n = recentErrors.length;
    
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    recentErrors.forEach((error, idx) => {
      sumX += idx;
      sumY += error;
      sumXY += idx * error;
      sumX2 += idx * idx;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    
    let direction: 'improving' | 'stable' | 'degrading';
    if (slope < -0.01) direction = 'improving';
    else if (slope > 0.01) direction = 'degrading';
    else direction = 'stable';

    return {
      direction,
      rate: Math.abs(slope),
      periodsAnalyzed: n,
    };
  }

  /**
   * Convert reliability score to band
   */
  private scoreToBand(score: number): ReliabilityBand {
    if (score >= 0.9) return ReliabilityBand.EXCELLENT;
    if (score >= 0.75) return ReliabilityBand.GOOD;
    if (score >= 0.6) return ReliabilityBand.MODERATE;
    if (score >= 0.4) return ReliabilityBand.POOR;
    return ReliabilityBand.UNRELIABLE;
  }

  /**
   * Create profile when insufficient data
   */
  private createInsufficientDataProfile(): CalibrationProfile {
    const emptyBins: BinCalibration[] = Array.from({ length: this.config.binCount }, (_, i) => ({
      binRange: [i / this.config.binCount, (i + 1) / this.config.binCount],
      predictedRate: 0,
      observedRate: 0,
      sampleCount: 0,
      calibrationError: 0,
    }));

    return {
      id: this.profileId,
      name: this.profileName,
      status: CalibrationStatus.INSUFFICIENT_DATA,
      reliabilityBand: ReliabilityBand.UNRELIABLE,
      reliabilityScore: 0,
      calibrationError: 1,
      sampleSize: this.observations.length,
      lastUpdated: Date.now(),
      binCalibrations: emptyBins,
      trend: {
        direction: 'stable',
        rate: 0,
        periodsAnalyzed: 0,
      },
    };
  }

  /**
   * Update calibration history
   */
  private updateHistory(): void {
    if (!this.profile) return;

    this.history.timestamps.push(Date.now());
    this.history.reliabilityScores.push(this.profile.reliabilityScore);
    this.history.calibrationErrors.push(this.profile.calibrationError);
    this.history.sampleSizes.push(this.profile.sampleSize);

    // Keep history manageable
    const maxHistory = 100;
    if (this.history.timestamps.length > maxHistory) {
      this.history.timestamps.shift();
      this.history.reliabilityScores.shift();
      this.history.calibrationErrors.shift();
      this.history.sampleSizes.shift();
    }
  }

  /**
   * Adjust confidence based on calibration
   */
  adjustConfidence(confidence: number, context?: string): ConfidenceAdjustment {
    if (!this.profile || this.profile.status === CalibrationStatus.INSUFFICIENT_DATA) {
      return {
        originalConfidence: confidence,
        adjustedConfidence: confidence * 0.8, // Conservative adjustment
        adjustmentFactor: 0.8,
        reason: 'Insufficient calibration data - applying conservative discount',
      };
    }

    // Find relevant bin
    const bin = this.profile.binCalibrations.find(
      b => confidence >= b.binRange[0] && confidence < b.binRange[1]
    );

    if (!bin || bin.sampleCount < 5) {
      return {
        originalConfidence: confidence,
        adjustedConfidence: confidence * 0.9,
        adjustmentFactor: 0.9,
        reason: 'Limited data in confidence range',
      };
    }

    // Adjust towards observed rate
    const bias = bin.predictedRate - bin.observedRate;
    let adjustmentFactor: number;

    if (this.profile.status === CalibrationStatus.OVERCONFIDENT) {
      adjustmentFactor = Math.max(0.5, 1 - bias);
    } else if (this.profile.status === CalibrationStatus.UNDERCONFIDENT) {
      adjustmentFactor = Math.min(1.2, 1 - bias);
    } else {
      adjustmentFactor = 1 - (bias * 0.5);
    }

    const adjustedConfidence = Math.max(0, Math.min(1, confidence * adjustmentFactor));

    return {
      originalConfidence: confidence,
      adjustedConfidence,
      adjustmentFactor,
      reason: `Calibration adjustment based on ${bin.sampleCount} observations in this range`,
    };
  }

  /**
   * Get calibration metrics
   */
  getMetrics(): CalibrationMetrics {
    const reliabilityDiagram: ReliabilityDiagramPoint[] = this.profile?.binCalibrations.map(bin => ({
      predictedProbability: bin.predictedRate,
      observedFrequency: bin.observedRate,
      sampleCount: bin.sampleCount,
    })) || [];

    return {
      expectedCalibrationError: this.profile?.calibrationError || 1,
      maximumCalibrationError: this.calculateMaximumCalibrationError(),
      brierScore: this.calculateBrierScore(),
      reliabilityDiagram,
    };
  }

  /**
   * Get current profile
   */
  getProfile(): CalibrationProfile | null {
    return this.profile;
  }

  /**
   * Get calibration history
   */
  getHistory(): CalibrationHistory {
    return { ...this.history };
  }

  /**
   * Get observations count
   */
  getObservationCount(): number {
    return this.observations.length;
  }

  /**
   * Check if well calibrated
   */
  isWellCalibrated(): boolean {
    return this.profile?.status === CalibrationStatus.WELL_CALIBRATED;
  }

  /**
   * Get reliability score
   */
  getReliabilityScore(): number {
    return this.profile?.reliabilityScore || 0;
  }

  /**
   * Clear all observations and reset
   */
  reset(): void {
    this.observations = [];
    this.profile = null;
    this.history = {
      timestamps: [],
      reliabilityScores: [],
      calibrationErrors: [],
      sampleSizes: [],
    };
    this.lastCalibrationTime = 0;
  }

  /**
   * Export observations for analysis
   */
  exportObservations(): CalibrationObservation[] {
    return [...this.observations];
  }

  /**
   * Import observations from external source
   */
  importObservations(observations: CalibrationObservation[]): void {
    this.observations = [...observations];
    this.calibrate();
  }
}
