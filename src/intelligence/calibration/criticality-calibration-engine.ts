/**
 * Criticality Calibration Engine
 * 
 * Calibrates criticality predictions against actual long-term impact.
 * Ensures criticality scores accurately reflect decision significance.
 */

import {
  CalibrationObservation,
  CalibrationProfile,
  CriticalityCalibrationProfile,
  ImpactMetrics,
  CalibrationStatus,
  CalibrationContext,
} from './calibration-types';
import { ConfidenceCalibrationEngine } from './confidence-calibration-engine';

export interface ImpactObservation {
  decisionId: string;
  criticalityLevel: 'low' | 'medium' | 'high' | 'critical';
  predictedCriticality: number; // 0-1
  predictedImpact: {
    magnitude: number;
    direction: 'positive' | 'negative' | 'mixed';
    timeHorizon: 'short' | 'medium' | 'long';
  };
  actualImpact: {
    shortTerm: number; // -1 to 1
    longTerm: number; // -1 to 1
    magnitude: number;
    direction: 'positive' | 'negative' | 'mixed';
  };
  timestamp: number;
  context: CalibrationContext;
  impactFactors: string[];
}

export interface CriticalityPrediction {
  decisionId: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  reasoning: string[];
  expectedImpacts: Array<{
    timeframe: string;
    magnitude: number;
    probability: number;
  }>;
}

export class CriticalityCalibrationEngine {
  private baseEngine: ConfidenceCalibrationEngine;
  private levelEngines: Map<string, ConfidenceCalibrationEngine> = new Map();
  private impactEngines: Map<string, ConfidenceCalibrationEngine> = new Map();
  private observations: ImpactObservation[] = [];
  private predictions: Map<string, CriticalityPrediction> = new Map();

  constructor() {
    this.baseEngine = new ConfidenceCalibrationEngine('criticality-base', 'Criticality Assessment System');
  }

  /**
   * Record a criticality prediction
   */
  recordPrediction(prediction: CriticalityPrediction, context: CalibrationContext): void {
    this.predictions.set(prediction.decisionId, prediction);

    // Initialize level engine
    if (!this.levelEngines.has(prediction.level)) {
      this.levelEngines.set(
        prediction.level,
        new ConfidenceCalibrationEngine(
          `crit-level-${prediction.level}`,
          `Criticality Level: ${prediction.level}`
        )
      );
    }
  }

  /**
   * Record actual impact observation
   */
  recordImpact(observation: ImpactObservation): void {
    // Initialize level engine
    if (!this.levelEngines.has(observation.criticalityLevel)) {
      this.levelEngines.set(
        observation.criticalityLevel,
        new ConfidenceCalibrationEngine(
          `crit-level-${observation.criticalityLevel}`,
          `Criticality Level: ${observation.criticalityLevel}`
        )
      );
    }

    // Initialize impact factor engines
    observation.impactFactors.forEach(factor => {
      if (!this.impactEngines.has(factor)) {
        this.impactEngines.set(
          factor,
          new ConfidenceCalibrationEngine(
            `crit-factor-${factor}`,
            `Impact Factor: ${factor}`
          )
        );
      }
    });

    this.observations.push(observation);

    // Add to calibration
    const calObservation = this.createCalibrationObservation(observation);
    this.baseEngine.addObservation(calObservation);

    const levelEngine = this.levelEngines.get(observation.criticalityLevel);
    if (levelEngine) {
      levelEngine.addObservation(calObservation);
    }

    observation.impactFactors.forEach(factor => {
      const factorEngine = this.impactEngines.get(factor);
      if (factorEngine) {
        factorEngine.addObservation(calObservation);
      }
    });
  }

  /**
   * Create calibration observation from impact observation
   */
  private createCalibrationObservation(obs: ImpactObservation): CalibrationObservation {
    // Determine if criticality prediction was accurate
    // High criticality should correlate with high impact magnitude
    const predictedImpact = obs.predictedImpact.magnitude;
    const actualImpact = Math.abs(obs.actualImpact.longTerm);
    
    // Success = predicted and actual are aligned
    const threshold = 0.3;
    const bothHigh = predictedImpact > threshold && actualImpact > threshold;
    const bothLow = predictedImpact <= threshold && actualImpact <= threshold;
    const accurate = bothHigh || bothLow;

    // Quality based on alignment
    const quality = 1 - Math.abs(predictedImpact - actualImpact);

    return {
      id: `crit-${obs.decisionId}`,
      predictedConfidence: obs.predictedCriticality,
      actualOutcome: accurate,
      outcomeQuality: quality,
      timestamp: obs.timestamp,
      context: obs.context,
      metadata: {
        criticalityLevel: obs.criticalityLevel,
        predictedImpact: obs.predictedImpact,
        actualImpact: obs.actualImpact,
        impactFactors: obs.impactFactors,
      },
    };
  }

  /**
   * Get criticality calibration profile
   */
  getProfile(): CriticalityCalibrationProfile {
    const baseProfile = this.baseEngine.getProfile();
    if (!baseProfile) {
      throw new Error('No calibration profile available. Record impact observations first.');
    }

    const levelProfiles = new Map<string, CalibrationProfile>();
    this.levelEngines.forEach((engine, level) => {
      const profile = engine.getProfile();
      if (profile) {
        levelProfiles.set(level, profile);
      }
    });

    const impactProfiles = new Map<string, CalibrationProfile>();
    this.impactEngines.forEach((engine, factor) => {
      const profile = engine.getProfile();
      if (profile) {
        impactProfiles.set(factor, profile);
      }
    });

    return {
      ...baseProfile,
      criticalityLevels: levelProfiles,
      impactCalibrations: impactProfiles,
      impactMetrics: this.calculateImpactMetrics(),
    };
  }

  /**
   * Calculate impact metrics
   */
  private calculateImpactMetrics(): ImpactMetrics {
    if (this.observations.length === 0) {
      return {
        shortTermAccuracy: 0,
        longTermAccuracy: 0,
        impactMagnitudeAccuracy: 0,
        impactDirectionAccuracy: 0,
      };
    }

    let shortTermCorrect = 0;
    let longTermCorrect = 0;
    let magnitudeCorrect = 0;
    let directionCorrect = 0;

    this.observations.forEach(obs => {
      // Short term accuracy
      const predShort = this.predictShortTermImpact(obs.predictedImpact);
      if (Math.sign(predShort) === Math.sign(obs.actualImpact.shortTerm)) {
        shortTermCorrect++;
      }

      // Long term accuracy
      const predLong = this.predictLongTermImpact(obs.predictedImpact);
      if (Math.sign(predLong) === Math.sign(obs.actualImpact.longTerm)) {
        longTermCorrect++;
      }

      // Magnitude accuracy
      const magnitudeDiff = Math.abs(obs.predictedImpact.magnitude - obs.actualImpact.magnitude);
      if (magnitudeDiff < 0.3) {
        magnitudeCorrect++;
      }

      // Direction accuracy
      if (obs.predictedImpact.direction === obs.actualImpact.direction) {
        directionCorrect++;
      }
    });

    const total = this.observations.length;

    return {
      shortTermAccuracy: shortTermCorrect / total,
      longTermAccuracy: longTermCorrect / total,
      impactMagnitudeAccuracy: magnitudeCorrect / total,
      impactDirectionAccuracy: directionCorrect / total,
    };
  }

  /**
   * Predict short term impact from prediction
   */
  private predictShortTermImpact(predicted: ImpactObservation['predictedImpact']): number {
    const baseMagnitude = predicted.magnitude;
    return predicted.direction === 'positive' ? baseMagnitude : -baseMagnitude;
  }

  /**
   * Predict long term impact from prediction
   */
  private predictLongTermImpact(predicted: ImpactObservation['predictedImpact']): number {
    // Long term tends to be amplified
    const multiplier = predicted.timeHorizon === 'long' ? 1.5 : 1.0;
    const baseMagnitude = predicted.magnitude * multiplier;
    return predicted.direction === 'positive' ? baseMagnitude : -baseMagnitude;
  }

  /**
   * Adjust criticality score
   */
  adjustCriticality(
    predictedCriticality: number,
    criticalityLevel?: string,
    impactFactors?: string[]
  ): {
    adjustedCriticality: number;
    confidence: number;
    expectedImpact: {
      shortTerm: number;
      longTerm: number;
    };
  } {
    // Get base adjustment
    const baseAdjustment = this.baseEngine.adjustConfidence(predictedCriticality);
    let adjustedCriticality = baseAdjustment.adjustedConfidence;

    // Apply level-specific adjustment
    if (criticalityLevel && this.levelEngines.has(criticalityLevel)) {
      const levelEngine = this.levelEngines.get(criticalityLevel)!;
      const levelAdjustment = levelEngine.adjustConfidence(predictedCriticality);
      adjustedCriticality = (adjustedCriticality + levelAdjustment.adjustedConfidence) / 2;
    }

    // Apply factor-specific adjustments
    if (impactFactors && impactFactors.length > 0) {
      let factorAdjustmentSum = 0;
      let factorCount = 0;

      impactFactors.forEach(factor => {
        const factorEngine = this.impactEngines.get(factor);
        if (factorEngine) {
          const factorAdjustment = factorEngine.adjustConfidence(predictedCriticality);
          factorAdjustmentSum += factorAdjustment.adjustedConfidence;
          factorCount++;
        }
      });

      if (factorCount > 0) {
        const avgFactorAdjustment = factorAdjustmentSum / factorCount;
        adjustedCriticality = (adjustedCriticality + avgFactorAdjustment) / 2;
      }
    }

    const profile = this.baseEngine.getProfile();
    const confidence = profile?.reliabilityScore || 0;

    // Calculate expected impact based on historical data
    const expectedImpact = this.calculateExpectedImpact(adjustedCriticality);

    return {
      adjustedCriticality,
      confidence,
      expectedImpact,
    };
  }

  /**
   * Calculate expected impact for criticality level
   */
  private calculateExpectedImpact(criticality: number): {
    shortTerm: number;
    longTerm: number;
  } {
    const similarObservations = this.observations.filter(obs => 
      Math.abs(obs.predictedCriticality - criticality) < 0.15
    );

    if (similarObservations.length === 0) {
      return {
        shortTerm: criticality * 0.5,
        longTerm: criticality * 0.7,
      };
    }

    const avgShortTerm = similarObservations.reduce((sum, obs) => 
      sum + obs.actualImpact.shortTerm, 0) / similarObservations.length;
    
    const avgLongTerm = similarObservations.reduce((sum, obs) => 
      sum + obs.actualImpact.longTerm, 0) / similarObservations.length;

    return {
      shortTerm: avgShortTerm,
      longTerm: avgLongTerm,
    };
  }

  /**
   * Get calibration for specific criticality level
   */
  getLevelCalibration(level: string): CalibrationProfile | null {
    const engine = this.levelEngines.get(level);
    return engine?.getProfile() || null;
  }

  /**
   * Get calibration for specific impact factor
   */
  getFactorCalibration(factor: string): CalibrationProfile | null {
    const engine = this.impactEngines.get(factor);
    return engine?.getProfile() || null;
  }

  /**
   * Analyze criticality accuracy by level
   */
  analyzeAccuracyByLevel(): Array<{
    level: string;
    predictionAccuracy: number;
    avgPredictedImpact: number;
    avgActualImpact: number;
    sampleSize: number;
  }> {
    const results: Map<string, {
      correct: number;
      totalPredicted: number;
      totalActual: number;
      count: number;
    }> = new Map();

    this.observations.forEach(obs => {
      const data = results.get(obs.criticalityLevel) || {
        correct: 0,
        totalPredicted: 0,
        totalActual: 0,
        count: 0,
      };

      const predictedImpact = obs.predictedImpact.magnitude;
      const actualImpact = Math.abs(obs.actualImpact.longTerm);
      const accurate = Math.abs(predictedImpact - actualImpact) < 0.3;

      if (accurate) data.correct++;
      data.totalPredicted += predictedImpact;
      data.totalActual += actualImpact;
      data.count++;

      results.set(obs.criticalityLevel, data);
    });

    return Array.from(results.entries())
      .map(([level, data]) => ({
        level,
        predictionAccuracy: data.correct / data.count,
        avgPredictedImpact: data.totalPredicted / data.count,
        avgActualImpact: data.totalActual / data.count,
        sampleSize: data.count,
      }))
      .sort((a, b) => b.predictionAccuracy - a.predictionAccuracy);
  }

  /**
   * Identify under-estimated decisions
   */
  identifyUnderEstimatedDecisions(limit: number = 10): Array<{
    decisionId: string;
    predictedCriticality: number;
    actualImpact: number;
    underestimation: number;
  }> {
    return this.observations
      .map(obs => ({
        decisionId: obs.decisionId,
        predictedCriticality: obs.predictedCriticality,
        actualImpact: Math.abs(obs.actualImpact.longTerm),
        underestimation: Math.abs(obs.actualImpact.longTerm) - obs.predictedCriticality,
      }))
      .filter(d => d.underestimation > 0.3)
      .sort((a, b) => b.underestimation - a.underestimation)
      .slice(0, limit);
  }

  /**
   * Identify over-estimated decisions
   */
  identifyOverEstimatedDecisions(limit: number = 10): Array<{
    decisionId: string;
    predictedCriticality: number;
    actualImpact: number;
    overestimation: number;
  }> {
    return this.observations
      .map(obs => ({
        decisionId: obs.decisionId,
        predictedCriticality: obs.predictedCriticality,
        actualImpact: Math.abs(obs.actualImpact.longTerm),
        overestimation: obs.predictedCriticality - Math.abs(obs.actualImpact.longTerm),
      }))
      .filter(d => d.overestimation > 0.3)
      .sort((a, b) => b.overestimation - a.overestimation)
      .slice(0, limit);
  }

  /**
   * Get impact factor importance ranking
   */
  getFactorImportanceRanking(): Array<{
    factor: string;
    correlationWithImpact: number;
    reliability: number;
  }> {
    const results: Array<{
      factor: string;
      correlationWithImpact: number;
      reliability: number;
    }> = [];

    this.impactEngines.forEach((engine, factor) => {
      const profile = engine.getProfile();
      if (!profile) return;

      // Calculate correlation with impact magnitude
      const factorObservations = this.observations.filter(obs =>
        obs.impactFactors.includes(factor)
      );

      if (factorObservations.length < 3) return;

      const avgImpact = factorObservations.reduce((sum, obs) =>
        sum + Math.abs(obs.actualImpact.longTerm), 0) / factorObservations.length;

      results.push({
        factor,
        correlationWithImpact: avgImpact,
        reliability: profile.reliabilityScore,
      });
    });

    return results.sort((a, b) => b.correlationWithImpact - a.correlationWithImpact);
  }

  /**
   * Get observations by criticality level
   */
  getObservationsByLevel(level: string): ImpactObservation[] {
    return this.observations.filter(o => o.criticalityLevel === level);
  }

  /**
   * Get temporal impact analysis
   */
  getTemporalImpactAnalysis(): {
    shortTermVsLongTerm: number;
    impactEvolution: Array<{
      timeRange: string;
      avgImpact: number;
      criticalityAlignment: number;
    }>;
  } {
    const shortTermImpacts = this.observations.map(o => o.actualImpact.shortTerm);
    const longTermImpacts = this.observations.map(o => o.actualImpact.longTerm);

    const avgShort = shortTermImpacts.reduce((a, b) => a + b, 0) / shortTermImpacts.length;
    const avgLong = longTermImpacts.reduce((a, b) => a + b, 0) / longTermImpacts.length;

    // Categorize by time
    const timeBuckets: Map<string, number[]> = new Map();
    this.observations.forEach(obs => {
      const prediction = this.predictions.get(obs.decisionId);
      if (!prediction) return;

      const timeframe = prediction.expectedImpacts[0]?.timeframe || 'unknown';
      const impacts = timeBuckets.get(timeframe) || [];
      impacts.push(obs.actualImpact.longTerm);
      timeBuckets.set(timeframe, impacts);
    });

    const impactEvolution = Array.from(timeBuckets.entries())
      .map(([timeRange, impacts]) => ({
        timeRange,
        avgImpact: impacts.reduce((a, b) => a + b, 0) / impacts.length,
        criticalityAlignment: 0, // Would need to calculate based on predictions
      }));

    return {
      shortTermVsLongTerm: avgLong - avgShort,
      impactEvolution,
    };
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
    this.levelEngines.clear();
    this.impactEngines.clear();
    this.observations = [];
    this.predictions.clear();
  }

  /**
   * Export all data
   */
  exportData(): {
    observations: ImpactObservation[];
    predictions: Map<string, CriticalityPrediction>;
    baseProfile: CalibrationProfile | null;
    levelProfiles: Map<string, CalibrationProfile>;
    factorProfiles: Map<string, CalibrationProfile>;
  } {
    const levelProfiles = new Map<string, CalibrationProfile>();
    this.levelEngines.forEach((engine, level) => {
      const profile = engine.getProfile();
      if (profile) levelProfiles.set(level, profile);
    });

    const factorProfiles = new Map<string, CalibrationProfile>();
    this.impactEngines.forEach((engine, factor) => {
      const profile = engine.getProfile();
      if (profile) factorProfiles.set(factor, profile);
    });

    return {
      observations: [...this.observations],
      predictions: new Map(this.predictions),
      baseProfile: this.baseEngine.getProfile(),
      levelProfiles,
      factorProfiles,
    };
  }
}
