/**
 * Regret Calibration Engine
 * 
 * Calibrates regret risk predictions against actual regret signals.
 * Ensures regret predictions are accurate for decision quality assessment.
 */

import {
  CalibrationObservation,
  CalibrationProfile,
  RegretCalibrationProfile,
  RegretPredictionMetrics,
  CalibrationStatus,
  CalibrationContext,
} from './calibration-types';
import { ConfidenceCalibrationEngine } from './confidence-calibration-engine';

export interface RegretSignal {
  decisionId: string;
  regretType: 'opportunity' | 'process' | 'outcome' | 'comparison' | 'timing';
  severity: 'mild' | 'moderate' | 'severe' | 'extreme';
  predictedRisk: number; // 0-1
  actualRegret: boolean;
  actualSeverity?: 'mild' | 'moderate' | 'severe' | 'extreme';
  timeToRegret: number; // milliseconds from decision
  factors: string[];
  timestamp: number;
  context: CalibrationContext;
  userFeedback?: {
    statedRegret: boolean;
    intensity: number;
    description: string;
  };
}

export interface RegretPrediction {
  decisionId: string;
  riskLevel: number;
  confidence: number;
  primaryFactors: string[];
  severityDistribution: Map<string, number>;
}

export class RegretCalibrationEngine {
  private baseEngine: ConfidenceCalibrationEngine;
  private typeEngines: Map<string, ConfidenceCalibrationEngine> = new Map();
  private severityEngines: Map<string, ConfidenceCalibrationEngine> = new Map();
  private signals: RegretSignal[] = [];
  private predictions: Map<string, RegretPrediction> = new Map();

  constructor() {
    this.baseEngine = new ConfidenceCalibrationEngine('regret-base', 'Regret Prediction System');
  }

  /**
   * Record a regret prediction
   */
  recordPrediction(prediction: RegretPrediction, context: CalibrationContext): void {
    this.predictions.set(prediction.decisionId, prediction);

    // Initialize engines for regret types
    prediction.primaryFactors.forEach(factor => {
      if (!this.typeEngines.has(factor)) {
        this.typeEngines.set(
          factor,
          new ConfidenceCalibrationEngine(`regret-factor-${factor}`, `Regret Factor: ${factor}`)
        );
      }
    });
  }

  /**
   * Record actual regret signal
   */
  recordRegretSignal(signal: RegretSignal): void {
    // Initialize type engine
    if (!this.typeEngines.has(signal.regretType)) {
      this.typeEngines.set(
        signal.regretType,
        new ConfidenceCalibrationEngine(
          `regret-type-${signal.regretType}`,
          `Regret Type: ${signal.regretType}`
        )
      );
    }

    // Initialize severity engine
    if (!this.severityEngines.has(signal.severity)) {
      this.severityEngines.set(
        signal.severity,
        new ConfidenceCalibrationEngine(
          `regret-severity-${signal.severity}`,
          `Severity: ${signal.severity}`
        )
      );
    }

    this.signals.push(signal);

    // Add to calibration
    const observation = this.createObservation(signal);
    this.baseEngine.addObservation(observation);

    const typeEngine = this.typeEngines.get(signal.regretType);
    if (typeEngine) {
      typeEngine.addObservation(observation);
    }

    const severityEngine = this.severityEngines.get(signal.severity);
    if (severityEngine) {
      severityEngine.addObservation(observation);
    }

    // Add to factor-specific engines
    signal.factors.forEach(factor => {
      const factorEngine = this.typeEngines.get(factor);
      if (factorEngine) {
        factorEngine.addObservation(observation);
      }
    });
  }

  /**
   * Create calibration observation from regret signal
   */
  private createObservation(signal: RegretSignal): CalibrationObservation {
    const outcomeQuality = signal.actualRegret 
      ? this.severityToQuality(signal.actualSeverity || signal.severity)
      : 1; // No regret = best outcome

    return {
      id: `regret-${signal.decisionId}`,
      predictedConfidence: 1 - signal.predictedRisk, // Higher confidence = lower regret risk
      actualOutcome: !signal.actualRegret, // Success = no regret
      outcomeQuality,
      timestamp: signal.timestamp,
      context: signal.context,
      metadata: {
        regretType: signal.regretType,
        predictedSeverity: signal.severity,
        actualSeverity: signal.actualSeverity,
        timeToRegret: signal.timeToRegret,
        factors: signal.factors,
        userFeedback: signal.userFeedback,
      },
    };
  }

  /**
   * Convert severity to quality score
   */
  private severityToQuality(severity: string): number {
    switch (severity) {
      case 'mild': return 0.75;
      case 'moderate': return 0.5;
      case 'severe': return 0.25;
      case 'extreme': return 0.1;
      default: return 0.5;
    }
  }

  /**
   * Get regret calibration profile
   */
  getProfile(): RegretCalibrationProfile {
    const baseProfile = this.baseEngine.getProfile();
    if (!baseProfile) {
      throw new Error('No calibration profile available. Record regret signals first.');
    }

    const typeProfiles = new Map<string, CalibrationProfile>();
    this.typeEngines.forEach((engine, type) => {
      const profile = engine.getProfile();
      if (profile) {
        typeProfiles.set(type, profile);
      }
    });

    const severityProfiles = new Map<string, CalibrationProfile>();
    this.severityEngines.forEach((engine, severity) => {
      const profile = engine.getProfile();
      if (profile) {
        severityProfiles.set(severity, profile);
      }
    });

    return {
      ...baseProfile,
      regretTypes: typeProfiles,
      severityCalibrations: severityProfiles,
      predictionMetrics: this.calculatePredictionMetrics(),
    };
  }

  /**
   * Calculate prediction metrics
   */
  private calculatePredictionMetrics(): RegretPredictionMetrics {
    if (this.signals.length === 0) {
      return {
        truePositiveRate: 0,
        falsePositiveRate: 0,
        trueNegativeRate: 0,
        falseNegativeRate: 0,
        severityAccuracy: 0,
      };
    }

    let tp = 0, fp = 0, tn = 0, fn = 0;
    let correctSeverity = 0;

    this.signals.forEach(signal => {
      const predicted = signal.predictedRisk > 0.5;
      const actual = signal.actualRegret;

      if (predicted && actual) tp++;
      else if (predicted && !actual) fp++;
      else if (!predicted && !actual) tn++;
      else if (!predicted && actual) fn++;

      if (signal.actualSeverity === signal.severity) {
        correctSeverity++;
      }
    });

    const total = this.signals.length;

    return {
      truePositiveRate: (tp + fn) > 0 ? tp / (tp + fn) : 0,
      falsePositiveRate: (fp + tn) > 0 ? fp / (fp + tn) : 0,
      trueNegativeRate: (fp + tn) > 0 ? tn / (fp + tn) : 0,
      falseNegativeRate: (tp + fn) > 0 ? fn / (tp + fn) : 0,
      severityAccuracy: correctSeverity / total,
    };
  }

  /**
   * Adjust regret risk prediction
   */
  adjustRegretRisk(
    predictedRisk: number,
    regretType?: string,
    severity?: string
  ): {
    adjustedRisk: number;
    confidence: number;
    calibrationFactor: number;
  } {
    // Convert to confidence for calibration (1 - risk)
    const predictedConfidence = 1 - predictedRisk;
    
    // Get base adjustment
    const baseAdjustment = this.baseEngine.adjustConfidence(predictedConfidence);
    let adjustedConfidence = baseAdjustment.adjustedConfidence;

    // Apply type-specific adjustment
    if (regretType && this.typeEngines.has(regretType)) {
      const typeEngine = this.typeEngines.get(regretType)!;
      const typeAdjustment = typeEngine.adjustConfidence(predictedConfidence);
      adjustedConfidence = (adjustedConfidence + typeAdjustment.adjustedConfidence) / 2;
    }

    // Apply severity-specific adjustment
    if (severity && this.severityEngines.has(severity)) {
      const sevEngine = this.severityEngines.get(severity)!;
      const sevAdjustment = sevEngine.adjustConfidence(predictedConfidence);
      adjustedConfidence = (adjustedConfidence + sevAdjustment.adjustedConfidence) / 2;
    }

    const profile = this.baseEngine.getProfile();
    const reliability = profile?.reliabilityScore || 0;

    // Convert back to risk
    const adjustedRisk = 1 - adjustedConfidence;
    const calibrationFactor = predictedRisk > 0 ? adjustedRisk / predictedRisk : 1;

    return {
      adjustedRisk,
      confidence: reliability,
      calibrationFactor,
    };
  }

  /**
   * Get calibration for specific regret type
   */
  getTypeCalibration(regretType: string): CalibrationProfile | null {
    const engine = this.typeEngines.get(regretType);
    return engine?.getProfile() || null;
  }

  /**
   * Get calibration for specific severity level
   */
  getSeverityCalibration(severity: string): CalibrationProfile | null {
    const engine = this.severityEngines.get(severity);
    return engine?.getProfile() || null;
  }

  /**
   * Analyze regret patterns
   */
  analyzeRegretPatterns(): Array<{
    pattern: string;
    occurrenceRate: number;
    averageSeverity: number;
    timeToRegret: number;
  }> {
    const patterns: Map<string, {
      count: number;
      totalSeverity: number;
      totalTime: number;
    }> = new Map();

    this.signals.forEach(signal => {
      if (!signal.actualRegret) return;

      const pattern = signal.regretType;
      const data = patterns.get(pattern) || { count: 0, totalSeverity: 0, totalTime: 0 };
      
      data.count++;
      data.totalSeverity += this.severityToNumeric(signal.actualSeverity || signal.severity);
      data.totalTime += signal.timeToRegret;
      
      patterns.set(pattern, data);
    });

    const totalSignals = this.signals.length;

    return Array.from(patterns.entries())
      .map(([pattern, data]) => ({
        pattern,
        occurrenceRate: data.count / totalSignals,
        averageSeverity: data.totalSeverity / data.count,
        timeToRegret: data.totalTime / data.count,
      }))
      .sort((a, b) => b.occurrenceRate - a.occurrenceRate);
  }

  /**
   * Convert severity to numeric
   */
  private severityToNumeric(severity: string): number {
    switch (severity) {
      case 'mild': return 1;
      case 'moderate': return 2;
      case 'severe': return 3;
      case 'extreme': return 4;
      default: return 2;
    }
  }

  /**
   * Get early warning indicators
   */
  getEarlyWarningIndicators(): Array<{
    indicator: string;
    predictivePower: number;
    falsePositiveRate: number;
  }> {
    const indicators: Map<string, { tp: number; fp: number; total: number }> = new Map();

    this.signals.forEach(signal => {
      signal.factors.forEach(factor => {
        const data = indicators.get(factor) || { tp: 0, fp: 0, total: 0 };
        data.total++;
        
        if (signal.actualRegret) {
          data.tp++;
        } else {
          data.fp++;
        }
        
        indicators.set(factor, data);
      });
    });

    return Array.from(indicators.entries())
      .map(([indicator, data]) => ({
        indicator,
        predictivePower: data.tp / data.total,
        falsePositiveRate: data.fp / data.total,
      }))
      .sort((a, b) => b.predictivePower - a.predictivePower);
  }

  /**
   * Calculate regret risk by decision characteristics
   */
  calculateRiskByCharacteristics(): Array<{
    characteristic: string;
    riskLevel: number;
    sampleSize: number;
  }> {
    const characteristics: Map<string, { regretCount: number; total: number }> = new Map();

    this.signals.forEach(signal => {
      // By regret type
      const typeData = characteristics.get(`type:${signal.regretType}`) || { regretCount: 0, total: 0 };
      typeData.total++;
      if (signal.actualRegret) typeData.regretCount++;
      characteristics.set(`type:${signal.regretType}`, typeData);

      // By predicted severity
      const sevData = characteristics.get(`severity:${signal.severity}`) || { regretCount: 0, total: 0 };
      sevData.total++;
      if (signal.actualRegret) sevData.regretCount++;
      characteristics.set(`severity:${signal.severity}`, sevData);

      // By factors
      signal.factors.forEach(factor => {
        const factorData = characteristics.get(`factor:${factor}`) || { regretCount: 0, total: 0 };
        factorData.total++;
        if (signal.actualRegret) factorData.regretCount++;
        characteristics.set(`factor:${factor}`, factorData);
      });
    });

    return Array.from(characteristics.entries())
      .map(([characteristic, data]) => ({
        characteristic,
        riskLevel: data.total > 0 ? data.regretCount / data.total : 0,
        sampleSize: data.total,
      }))
      .filter(c => c.sampleSize >= 5)
      .sort((a, b) => b.riskLevel - a.riskLevel);
  }

  /**
   * Get signals by type
   */
  getSignalsByType(regretType: string): RegretSignal[] {
    return this.signals.filter(s => s.regretType === regretType);
  }

  /**
   * Get signals by severity
   */
  getSignalsBySeverity(severity: string): RegretSignal[] {
    return this.signals.filter(s => s.severity === severity);
  }

  /**
   * Get temporal regret analysis
   */
  getTemporalAnalysis(): Array<{
    timeBucket: string;
    regretRate: number;
    avgSeverity: number;
    sampleSize: number;
  }> {
    const buckets: Map<string, { regretCount: number; totalSeverity: number; total: number }> = new Map();

    this.signals.forEach(signal => {
      const days = Math.floor(signal.timeToRegret / (24 * 60 * 60 * 1000));
      let bucket: string;
      
      if (days < 1) bucket = 'same_day';
      else if (days < 7) bucket = 'within_week';
      else if (days < 30) bucket = 'within_month';
      else if (days < 90) bucket = 'within_quarter';
      else bucket = 'after_quarter';

      const data = buckets.get(bucket) || { regretCount: 0, totalSeverity: 0, total: 0 };
      data.total++;
      
      if (signal.actualRegret) {
        data.regretCount++;
        data.totalSeverity += this.severityToNumeric(signal.actualSeverity || signal.severity);
      }
      
      buckets.set(bucket, data);
    });

    return Array.from(buckets.entries())
      .map(([timeBucket, data]) => ({
        timeBucket,
        regretRate: data.total > 0 ? data.regretCount / data.total : 0,
        avgSeverity: data.regretCount > 0 ? data.totalSeverity / data.regretCount : 0,
        sampleSize: data.total,
      }))
      .sort((a, b) => b.regretRate - a.regretRate);
  }

  /**
   * Check if system is well calibrated
   */
  isWellCalibrated(): boolean {
    return this.baseEngine.isWellCalibrated();
  }

  /**
   * Get overall reliability score
   */
  getReliabilityScore(): number {
    return this.baseEngine.getReliabilityScore();
  }

  /**
   * Reset all calibration data
   */
  reset(): void {
    this.baseEngine.reset();
    this.typeEngines.clear();
    this.severityEngines.clear();
    this.signals = [];
    this.predictions.clear();
  }

  /**
   * Export all data
   */
  exportData(): {
    signals: RegretSignal[];
    predictions: Map<string, RegretPrediction>;
    baseProfile: CalibrationProfile | null;
    typeProfiles: Map<string, CalibrationProfile>;
    severityProfiles: Map<string, CalibrationProfile>;
  } {
    const typeProfiles = new Map<string, CalibrationProfile>();
    this.typeEngines.forEach((engine, type) => {
      const profile = engine.getProfile();
      if (profile) typeProfiles.set(type, profile);
    });

    const severityProfiles = new Map<string, CalibrationProfile>();
    this.severityEngines.forEach((engine, severity) => {
      const profile = engine.getProfile();
      if (profile) severityProfiles.set(severity, profile);
    });

    return {
      signals: [...this.signals],
      predictions: new Map(this.predictions),
      baseProfile: this.baseEngine.getProfile(),
      typeProfiles,
      severityProfiles,
    };
  }
}
