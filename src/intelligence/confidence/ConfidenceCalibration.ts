/**
 * CareerOS Confidence Calibration
 * 
 * Calibrates confidence scores based on actual outcomes.
 * Ensures stated confidence reflects actual probability.
 * 
 * @module confidence/calibration
 * @version 1.0.0
 */

import type {
  Confidence,
  ConfidenceValue,
  CalibrationObservation,
  CalibrationProfile,
  CalibrationStatusType,
  ReliabilityBand,
} from './ConfidenceTypes';
import { getReliabilityBand } from './ConfidenceTypes';

// ============================================================================
// CALIBRATION CONFIGURATION
// ============================================================================

export interface CalibrationConfig {
  /** Minimum sample size for calibration */
  readonly minSampleSize: number;
  
  /** Number of bins for calibration */
  readonly binCount: number;
  
  /** Confidence threshold for calibration */
  readonly confidenceThreshold: number;
  
  /** Maximum acceptable calibration error */
  readonly maxCalibrationError: number;
  
  /** Learning rate for adjustments */
  readonly learningRate: number;
}

export const DEFAULT_CALIBRATION_CONFIG: CalibrationConfig = {
  minSampleSize: 30,
  binCount: 10,
  confidenceThreshold: 0.5,
  maxCalibrationError: 0.15,
  learningRate: 0.1,
};

// ============================================================================
// CALIBRATION ENGINE
// ============================================================================

export class ConfidenceCalibration {
  private config: CalibrationConfig;
  private observations: Map<string, CalibrationObservation[]> = new Map();
  private profiles: Map<string, CalibrationProfile> = new Map();

  constructor(config: Partial<CalibrationConfig> = {}) {
    this.config = { ...DEFAULT_CALIBRATION_CONFIG, ...config };
  }

  /**
   * Add calibration observation.
   * 
   * @param observation - Observation data
   */
  addObservation(observation: CalibrationObservation): void {
    const systemObservations = this.observations.get(observation.systemId) ?? [];
    systemObservations.push(observation);
    this.observations.set(observation.systemId, systemObservations);

    // Recalibrate if enough observations
    if (systemObservations.length >= this.config.minSampleSize) {
      this.calibrate(observation.systemId);
    }
  }

  /**
   * Get calibration profile for system.
   * 
   * @param systemId - System identifier
   * @returns Calibration profile
   */
  getProfile(systemId: string): CalibrationProfile {
    const existing = this.profiles.get(systemId);
    if (existing) {
      return existing;
    }

    // Return insufficient data profile
    return this.createInsufficientDataProfile(systemId);
  }

  /**
   * Apply calibration to confidence value.
   * 
   * @param confidence - Raw confidence
   * @param systemId - System that produced confidence
   * @returns Calibrated confidence value
   */
  calibrateConfidence(confidence: ConfidenceValue, systemId: string): ConfidenceValue {
    const profile = this.getProfile(systemId);

    if (profile.status === 'insufficient_data') {
      // Not enough data to calibrate
      return {
        ...confidence,
        calibration: {
          ...confidence.calibration,
          isCalibrated: false,
        },
      };
    }

    // Calculate adjustment based on calibration error
    const adjustment = this.calculateAdjustment(confidence.value, profile);
    const calibratedValue = Math.max(0, Math.min(1, confidence.value + adjustment));

    return {
      ...confidence,
      value: calibratedValue,
      calibration: {
        isCalibrated: true,
        error: profile.calibrationError,
        sampleSize: profile.sampleSize,
        reliability: profile.reliabilityBand,
      },
    };
  }

  /**
   * Check if system is calibrated.
   * 
   * @param systemId - System identifier
   * @returns True if calibrated
   */
  isCalibrated(systemId: string): boolean {
    const profile = this.getProfile(systemId);
    return profile.status === 'well_calibrated';
  }

  /**
   * Calibrate system based on observations.
   * 
   * @param systemId - System to calibrate
   */
  private calibrate(systemId: string): CalibrationProfile {
    const systemObservations = this.observations.get(systemId) ?? [];

    if (systemObservations.length < this.config.minSampleSize) {
      return this.createInsufficientDataProfile(systemId);
    }

    // Calculate bin calibrations
    const bins = this.calculateBins(systemObservations);

    // Calculate overall calibration error
    const calibrationError = this.calculateCalibrationError(bins);

    // Calculate reliability score
    const reliabilityScore = this.calculateReliabilityScore(bins, calibrationError);

    // Determine status
    const status = this.determineStatus(calibrationError);

    // Create profile
    const profile: CalibrationProfile = {
      id: `cal-${systemId}`,
      name: `Calibration Profile for ${systemId}`,
      status,
      reliabilityBand: getReliabilityBand(reliabilityScore),
      reliabilityScore,
      calibrationError,
      sampleSize: systemObservations.length,
      lastUpdated: Date.now(),
    };

    this.profiles.set(systemId, profile);
    return profile;
  }

  /**
   * Calculate bins for calibration.
   */
  private calculateBins(
    observations: CalibrationObservation[]
  ): Array<{ binRange: [number, number]; predictedRate: number; observedRate: number; sampleCount: number }> {
    const bins: Array<{ binRange: [number, number]; observations: CalibrationObservation[] }> = [];

    // Create bins
    const binSize = 1 / this.config.binCount;
    for (let i = 0; i < this.config.binCount; i++) {
      bins.push({
        binRange: [i * binSize, (i + 1) * binSize],
        observations: [],
      });
    }

    // Assign observations to bins
    for (const obs of observations) {
      const binIndex = Math.min(
        Math.floor(obs.predictedConfidence / binSize),
        this.config.binCount - 1
      );
      bins[binIndex].observations.push(obs);
    }

    // Calculate bin statistics
    return bins.map(bin => {
      const predictedRate = bin.observations.length > 0
        ? bin.observations.reduce((sum, o) => sum + o.predictedConfidence, 0) / bin.observations.length
        : (bin.binRange[0] + bin.binRange[1]) / 2;

      const observedRate = bin.observations.length > 0
        ? bin.observations.filter(o => o.actualOutcome).length / bin.observations.length
        : predictedRate;

      return {
        binRange: bin.binRange,
        predictedRate,
        observedRate,
        sampleCount: bin.observations.length,
      };
    });
  }

  /**
   * Calculate calibration error.
   */
  private calculateCalibrationError(
    bins: Array<{ predictedRate: number; observedRate: number; sampleCount: number }>
  ): number {
    let totalError = 0;
    let totalWeight = 0;

    for (const bin of bins) {
      if (bin.sampleCount > 0) {
        const weight = bin.sampleCount;
        const error = Math.abs(bin.predictedRate - bin.observedRate);
        totalError += error * weight;
        totalWeight += weight;
      }
    }

    return totalWeight > 0 ? totalError / totalWeight : 0.2;
  }

  /**
   * Calculate reliability score.
   */
  private calculateReliabilityScore(
    bins: Array<{ predictedRate: number; observedRate: number }>,
    calibrationError: number
  ): number {
    // Base score on calibration error
    const errorScore = Math.max(0, 1 - calibrationError);

    // Bonus for consistency across bins
    const consistencies = bins
      .filter(b => b.predictedRate > 0)
      .map(b => 1 - Math.abs(b.predictedRate - b.observedRate));
    const consistencyScore = consistencies.length > 0
      ? consistencies.reduce((sum, c) => sum + c, 0) / consistencies.length
      : 0;

    return (errorScore * 0.6 + consistencyScore * 0.4);
  }

  /**
   * Determine calibration status.
   */
  private determineStatus(calibrationError: number): CalibrationStatusType {
    if (calibrationError > this.config.maxCalibrationError * 2) {
      return 'drifting';
    }
    if (calibrationError > this.config.maxCalibrationError) {
      return 'overconfident';
    }
    if (calibrationError < 0.05) {
      return 'well_calibrated';
    }
    return 'underconfident';
  }

  /**
   * Calculate adjustment for confidence.
   */
  private calculateAdjustment(confidence: Confidence, profile: CalibrationProfile): number {
    // Simple adjustment based on calibration error
    // In practice, this would use more sophisticated methods
    const error = profile.calibrationError;
    
    if (profile.status === 'overconfident') {
      // Reduce high confidences more
      return -error * confidence * this.config.learningRate;
    }
    
    if (profile.status === 'underconfident') {
      // Increase low confidences more
      return error * (1 - confidence) * this.config.learningRate;
    }

    return 0;
  }

  /**
   * Create insufficient data profile.
   */
  private createInsufficientDataProfile(systemId: string): CalibrationProfile {
    return {
      id: `cal-${systemId}`,
      name: `Calibration Profile for ${systemId}`,
      status: 'insufficient_data',
      reliabilityBand: 'unreliable',
      reliabilityScore: 0,
      calibrationError: 0.2,
      sampleSize: this.observations.get(systemId)?.length ?? 0,
      lastUpdated: Date.now(),
    };
  }

  /**
   * Get all calibration profiles.
   */
  getAllProfiles(): CalibrationProfile[] {
    return Array.from(this.profiles.values());
  }

  /**
   * Clear observations for system.
   */
  clearObservations(systemId: string): void {
    this.observations.delete(systemId);
    this.profiles.delete(systemId);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let globalCalibration: ConfidenceCalibration | null = null;

export function getConfidenceCalibration(
  config?: Partial<CalibrationConfig>
): ConfidenceCalibration {
  if (!globalCalibration) {
    globalCalibration = new ConfidenceCalibration(config);
  }
  return globalCalibration;
}

export function resetConfidenceCalibration(): void {
  globalCalibration = null;
}
