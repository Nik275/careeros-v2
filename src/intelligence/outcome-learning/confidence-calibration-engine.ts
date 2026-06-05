/**
 * CareerOS Outcome Learning Engine - Confidence Calibration Engine
 *
 * Phase 9.0: Outcome Learning Engine
 *
 * Calibrates confidence predictions against reality.
 *
 * @module intelligence/outcome-learning
 * @version 1.0.0
 */

import {
  type ConfidenceCalibrationEntry,
  type CalibrationMetrics,
  type ConfidenceReliability,
  type IConfidenceCalibrationEngine,
  type OutcomeLearningConfig,
  DEFAULT_OUTCOME_LEARNING_CONFIG,
} from './learning-types.js';

// ============================================================================
// CALIBRATION BIN
// ============================================================================

type CalibrationBin = {
  binId: string;
  minConfidence: number;
  maxConfidence: number;
  expectedRate: number;
  entries: ConfidenceCalibrationEntry[];
};

/**
 * Manages calibration bins
 */
class CalibrationBins {
  private bins: CalibrationBin[] = [];
  private binCount: number;

  constructor(binCount: number) {
    this.binCount = binCount;
    this.initializeBins();
  }

  private initializeBins(): void {
    const binSize = 100 / this.binCount;

    for (let i = 0; i < this.binCount; i++) {
      const min = i * binSize;
      const max = (i + 1) * binSize;
      const mid = (min + max) / 2;

      this.bins.push({
        binId: `bin-${min}-${max}`,
        minConfidence: min,
        maxConfidence: max,
        expectedRate: mid,
        entries: [],
      });
    }
  }

  /**
   * Get bin for confidence level
   */
  getBin(confidence: number): CalibrationBin {
    const bin = this.bins.find(
      b => confidence >= b.minConfidence && confidence <= b.maxConfidence
    );
    return bin || this.bins[this.bins.length - 1];
  }

  /**
   * Add entry to appropriate bin
   */
  addEntry(entry: ConfidenceCalibrationEntry): void {
    const bin = this.getBin(entry.statedConfidence);
    bin.entries.push(entry);
  }

  /**
   * Calculate actual success rate for each bin
   */
  calculateActualRates(): Map<string, number> {
    const rates = new Map<string, number>();

    for (const bin of this.bins) {
      if (bin.entries.length === 0) {
        rates.set(bin.binId, bin.expectedRate);
        continue;
      }

      const successes = bin.entries.filter(e => e.outcome).length;
      const rate = (successes / bin.entries.length) * 100;
      rates.set(bin.binId, rate);
    }

    return rates;
  }

  /**
   * Calculate gaps between expected and actual
   */
  calculateGaps(): Map<string, number> {
    const gaps = new Map<string, number>();
    const actualRates = this.calculateActualRates();

    for (const bin of this.bins) {
      const actual = actualRates.get(bin.binId) || 0;
      const gap = Math.abs(bin.expectedRate - actual);
      gaps.set(bin.binId, gap);
    }

    return gaps;
  }

  /**
   * Get all bins
   */
  getBins(): CalibrationBin[] {
    return [...this.bins];
  }

  /**
   * Get bin by ID
   */
  getBinById(binId: string): CalibrationBin | undefined {
    return this.bins.find(b => b.binId === binId);
  }

  /**
   * Get total entries
   */
  getTotalEntries(): number {
    return this.bins.reduce((sum, b) => sum + b.entries.length, 0);
  }

  /**
   * Clear all bins
   */
  clear(): void {
    for (const bin of this.bins) {
      bin.entries = [];
    }
  }
}

// ============================================================================
// EXPECTED CALIBRATION ERROR CALCULATOR
// ============================================================================

/**
 * Calculates Expected Calibration Error (ECE)
 */
class ECECalculator {
  /**
   * Calculate ECE
   */
  calculate(bins: CalibrationBins): number {
    const totalEntries = bins.getTotalEntries();
    if (totalEntries === 0) return 0;

    let ece = 0;
    const gaps = bins.calculateGaps();

    for (const bin of bins.getBins()) {
      const binSize = bin.entries.length;
      const gap = gaps.get(bin.binId) || 0;
      ece += (binSize / totalEntries) * gap;
    }

    return ece;
  }

  /**
   * Calculate Maximum Calibration Error (MCE)
   */
  calculateMCE(bins: CalibrationBins): number {
    const gaps = bins.calculateGaps();
    return Math.max(...gaps.values());
  }

  /**
   * Calculate Brier Score
   */
  calculateBrierScore(entries: ConfidenceCalibrationEntry[]): number {
    if (entries.length === 0) return 0;

    let sumSquaredDiff = 0;

    for (const entry of entries) {
      const predictedProb = entry.statedConfidence / 100;
      const actualOutcome = entry.outcome ? 1 : 0;
      sumSquaredDiff += Math.pow(predictedProb - actualOutcome, 2);
    }

    return sumSquaredDiff / entries.length;
  }
}

// ============================================================================
// BIAS DETECTOR
// ============================================================================

/**
 * Detects calibration bias
 */
class BiasDetector {
  /**
   * Detect bias direction and magnitude
   */
  detect(bins: CalibrationBins): {
    direction: 'OVERCONFIDENT' | 'UNDERCONFIDENT' | 'CALIBRATED';
    magnitude: number;
  } {
    const gaps = bins.calculateGaps();
    const actualRates = bins.calculateActualRates();

    let totalOverestimation = 0;
    let totalUnderestimation = 0;
    let binCount = 0;

    for (const bin of bins.getBins()) {
      if (bin.entries.length === 0) continue;

      const actual = actualRates.get(bin.binId) || 0;
      const gap = gaps.get(bin.binId) || 0;

      if (bin.expectedRate > actual) {
        totalOverestimation += gap;
      } else if (bin.expectedRate < actual) {
        totalUnderestimation += gap;
      }
      binCount++;
    }

    if (binCount === 0) {
      return { direction: 'CALIBRATED', magnitude: 0 };
    }

    const avgOverestimation = totalOverestimation / binCount;
    const avgUnderestimation = totalUnderestimation / binCount;

    if (avgOverestimation > avgUnderestimation + 5) {
      return { direction: 'OVERCONFIDENT', magnitude: avgOverestimation };
    }

    if (avgUnderestimation > avgOverestimation + 5) {
      return { direction: 'UNDERCONFIDENT', magnitude: avgUnderestimation };
    }

    return { direction: 'CALIBRATED', magnitude: Math.min(avgOverestimation, avgUnderestimation) };
  }
}

// ============================================================================
// TREND ANALYZER
// ============================================================================

/**
 * Analyzes calibration trends over time
 */
class TrendAnalyzer {
  private history: { timestamp: number; ece: number }[] = [];

  /**
   * Record calibration measurement
   */
  record(ece: number): void {
    this.history.push({
      timestamp: Date.now(),
      ece,
    });

    // Keep only last 100 measurements
    if (this.history.length > 100) {
      this.history.shift();
    }
  }

  /**
   * Get trend
   */
  getTrend(): 'IMPROVING' | 'STABLE' | 'WORSENING' {
    if (this.history.length < 10) return 'STABLE';

    const recent = this.history.slice(-10);
    const earlier = this.history.slice(-20, -10);

    const recentAvg = recent.reduce((sum, h) => sum + h.ece, 0) / recent.length;
    const earlierAvg = earlier.length > 0 
      ? earlier.reduce((sum, h) => sum + h.ece, 0) / earlier.length 
      : recentAvg;

    const change = recentAvg - earlierAvg;
    const threshold = 0.02;

    if (change < -threshold) return 'IMPROVING';
    if (change > threshold) return 'WORSENING';
    return 'STABLE';
  }

  /**
   * Get calibration history
   */
  getHistory(): { timestamp: number; ece: number }[] {
    return [...this.history];
  }

  /**
   * Clear history
   */
  clear(): void {
    this.history = [];
  }
}

// ============================================================================
// CONFIDENCE CALIBRATION ENGINE
// ============================================================================

/**
 * Confidence Calibration Engine
 *
 * Tracks and calibrates confidence predictions.
 */
class ConfidenceCalibrationEngine implements IConfidenceCalibrationEngine {
  private config: OutcomeLearningConfig;
  private bins: CalibrationBins;
  private eceCalc: ECECalculator;
  private biasDetector: BiasDetector;
  private trendAnalyzer: TrendAnalyzer;
  
  private entries: ConfidenceCalibrationEntry[] = [];
  private adjustments: Map<number, number> = new Map(); // Confidence -> Adjustment

  constructor(config?: Partial<OutcomeLearningConfig>) {
    this.config = { ...DEFAULT_OUTCOME_LEARNING_CONFIG, ...config };
    this.bins = new CalibrationBins(this.config.calibration.binCount);
    this.eceCalc = new ECECalculator();
    this.biasDetector = new BiasDetector();
    this.trendAnalyzer = new TrendAnalyzer();
  }

  /**
   * Record a calibration entry
   */
  recordEntry(entry: ConfidenceCalibrationEntry): void {
    this.entries.push(entry);
    this.bins.addEntry(entry);
  }

  /**
   * Calculate calibration metrics
   */
  calculateMetrics(): CalibrationMetrics {
    const actualRates = this.bins.calculateActualRates();
    const gaps = this.bins.calculateGaps();

    const bins = this.bins.getBins();
    const expectedRates = bins.map(b => b.expectedRate);
    const actualRatesArray = bins.map(b => actualRates.get(b.binId) || 0);
    const gapsArray = bins.map(b => gaps.get(b.binId) || 0);

    const ece = this.eceCalc.calculate(this.bins);
    const mce = this.eceCalc.calculateMCE(this.bins);
    const brierScore = this.eceCalc.calculateBrierScore(this.entries);

    const bias = this.biasDetector.detect(this.bins);
    const trend = this.trendAnalyzer.getTrend();

    // Record for trend analysis
    this.trendAnalyzer.record(ece);

    return {
      reliability: {
        bins: bins.map(b => b.binId),
        expectedRates,
        actualRates: actualRatesArray,
        gaps: gapsArray,
      },
      expectedCalibrationError: ece,
      maximumCalibrationError: mce,
      brierScore,
      bias,
      trend,
      calibrationHistory: this.trendAnalyzer.getHistory(),
    };
  }

  /**
   * Get reliability for a specific confidence level
   */
  getReliability(confidenceLevel: number): ConfidenceReliability {
    const bin = this.bins.getBin(confidenceLevel);
    const actualRates = this.bins.calculateActualRates();
    const actualRate = actualRates.get(bin.binId) || 0;

    const reliable = Math.abs(bin.expectedRate - actualRate) < this.config.calibration.recalibrationThreshold * 100;

    const adjustment = reliable ? 0 : actualRate - bin.expectedRate;

    return {
      confidenceLevel,
      predictedSuccessRate: bin.expectedRate,
      actualSuccessRate: actualRate,
      sampleSize: bin.entries.length,
      reliable,
      adjustment,
    };
  }

  /**
   * Calibrate confidence
   */
  calibrateConfidence(rawConfidence: number): number {
    const reliability = this.getReliability(rawConfidence);

    if (!this.config.calibration.autoAdjustConfidence) {
      return rawConfidence;
    }

    if (reliability.reliable) {
      return rawConfidence;
    }

    // Apply adjustment
    let calibrated = rawConfidence + reliability.adjustment;

    // Clamp to valid range
    calibrated = Math.max(0, Math.min(100, calibrated));

    // Store adjustment
    this.adjustments.set(rawConfidence, reliability.adjustment);

    return calibrated;
  }

  /**
   * Check if calibration is well-calibrated
   */
  isWellCalibrated(): boolean {
    const metrics = this.calculateMetrics();
    return metrics.expectedCalibrationError < 0.05; // Less than 5% error
  }

  /**
   * Get calibration data for visualization
   */
  getCalibrationData(): {
    confidence: number[];
    predicted: number[];
    actual: number[];
    sampleSizes: number[];
  } {
    const bins = this.bins.getBins();
    const actualRates = this.bins.calculateActualRates();

    return {
      confidence: bins.map(b => b.expectedRate),
      predicted: bins.map(b => b.expectedRate),
      actual: bins.map(b => actualRates.get(b.binId) || 0),
      sampleSizes: bins.map(b => b.entries.length),
    };
  }

  /**
   * Get all entries
   */
  getAllEntries(): ConfidenceCalibrationEntry[] {
    return [...this.entries];
  }

  /**
   * Get adjustment for confidence level
   */
  getAdjustment(confidenceLevel: number): number {
    return this.adjustments.get(confidenceLevel) || 0;
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.entries = [];
    this.bins.clear();
    this.trendAnalyzer.clear();
    this.adjustments.clear();
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalEntries: number;
    wellCalibrated: boolean;
    currentECE: number;
    biasDirection: string;
  } {
    const metrics = this.calculateMetrics();
    return {
      totalEntries: this.entries.length,
      wellCalibrated: this.isWellCalibrated(),
      currentECE: metrics.expectedCalibrationError,
      biasDirection: metrics.bias.direction,
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create confidence calibration engine
 */
export function createConfidenceCalibrationEngine(
  config?: Partial<OutcomeLearningConfig>
): ConfidenceCalibrationEngine {
  return new ConfidenceCalibrationEngine(config);
}

/**
 * Create confidence calibration entry
 */
export function createCalibrationEntry(
  statedConfidence: number,
  outcome: boolean,
  overrides: Partial<ConfidenceCalibrationEntry> = {}
): ConfidenceCalibrationEntry {
  const binSize = 100 / 10; // Assuming 10 bins
  const binIndex = Math.min(9, Math.floor(statedConfidence / binSize));
  const binMin = binIndex * binSize;
  const binMax = (binIndex + 1) * binSize;
  const expectedRate = (binMin + binMax) / 2;

  const expectedSuccesses = expectedRate / 100;
  const actualSuccesses = outcome ? 1 : 0;
  const calibrationError = Math.abs(expectedRate - (outcome ? 100 : 0));

  return {
    entryId: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    timestamp: Date.now(),
    predictionId: `pred-${Date.now()}`,
    statedConfidence,
    confidenceBin: `${binMin}-${binMax}`,
    outcome,
    actualProbability: outcome ? 100 : 0,
    expectedSuccesses,
    actualSuccesses,
    calibrationError,
    ...overrides,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  ConfidenceCalibrationEngine,
  CalibrationBins,
  ECECalculator,
  BiasDetector,
  TrendAnalyzer,
};
