/**
 * Decision Calibration Engine
 * 
 * Calibrates decision confidence scores against actual decision quality.
 * Tracks whether high-confidence decisions actually lead to optimal outcomes.
 */

import {
  CalibrationObservation,
  CalibrationProfile,
  DecisionCalibrationProfile,
  DecisionQualityMetrics,
  CalibrationStatus,
  CalibrationContext,
  TimeHorizon,
} from './calibration-types';
import { ConfidenceCalibrationEngine } from './confidence-calibration-engine';

export interface DecisionOutcome {
  decisionId: string;
  decisionType: string;
  complexity: 'simple' | 'moderate' | 'complex' | 'highly_complex';
  predictedConfidence: number;
  alternativesConsidered: number;
  wasOptimalChoice: boolean;
  resultedInRegret: boolean;
  longTermSuccess: number; // 0-1
  stakeholderSatisfaction: number; // 0-1
  timestamp: number;
  context: CalibrationContext;
  decisionFactors: string[];
}

export interface DecisionQualityAssessment {
  optimality: number; // 0-1, how close to optimal
  regretProbability: number;
  longTermValue: number;
  stakeholderAlignment: number;
  overallQuality: number;
}

export class DecisionCalibrationEngine {
  private baseEngine: ConfidenceCalibrationEngine;
  private typeEngines: Map<string, ConfidenceCalibrationEngine> = new Map();
  private complexityEngines: Map<string, ConfidenceCalibrationEngine> = new Map();
  private outcomes: DecisionOutcome[] = [];
  private qualityAssessments: Map<string, DecisionQualityAssessment> = new Map();

  constructor() {
    this.baseEngine = new ConfidenceCalibrationEngine('decision-base', 'Decision System');
  }

  /**
   * Record a decision being made
   */
  recordDecision(
    decisionId: string,
    decisionType: string,
    complexity: DecisionOutcome['complexity'],
    predictedConfidence: number,
    alternativesConsidered: number,
    context: CalibrationContext,
    decisionFactors: string[]
  ): void {
    // Initialize type engine
    if (!this.typeEngines.has(decisionType)) {
      this.typeEngines.set(
        decisionType,
        new ConfidenceCalibrationEngine(
          `dec-type-${decisionType}`,
          `Decision Type: ${decisionType}`
        )
      );
    }

    // Initialize complexity engine
    if (!this.complexityEngines.has(complexity)) {
      this.complexityEngines.set(
        complexity,
        new ConfidenceCalibrationEngine(
          `dec-complexity-${complexity}`,
          `Complexity: ${complexity}`
        )
      );
    }

    const outcome: DecisionOutcome = {
      decisionId,
      decisionType,
      complexity,
      predictedConfidence,
      alternativesConsidered,
      wasOptimalChoice: false,
      resultedInRegret: false,
      longTermSuccess: 0,
      stakeholderSatisfaction: 0,
      timestamp: Date.now(),
      context,
      decisionFactors,
    };

    this.outcomes.push(outcome);
  }

  /**
   * Record decision outcome
   */
  recordOutcome(
    decisionId: string,
    assessment: DecisionQualityAssessment
  ): void {
    const outcome = this.outcomes.find(o => o.decisionId === decisionId);
    if (!outcome) return;

    outcome.wasOptimalChoice = assessment.optimality > 0.7;
    outcome.resultedInRegret = assessment.regretProbability > 0.5;
    outcome.longTermSuccess = assessment.longTermValue;
    outcome.stakeholderSatisfaction = assessment.stakeholderAlignment;

    this.qualityAssessments.set(decisionId, assessment);

    // Add to calibration engines
    const observation = this.createObservation(outcome, assessment);
    this.baseEngine.addObservation(observation);

    const typeEngine = this.typeEngines.get(outcome.decisionType);
    if (typeEngine) {
      typeEngine.addObservation(observation);
    }

    const complexityEngine = this.complexityEngines.get(outcome.complexity);
    if (complexityEngine) {
      complexityEngine.addObservation(observation);
    }
  }

  /**
   * Create calibration observation from outcome
   */
  private createObservation(
    outcome: DecisionOutcome,
    assessment: DecisionQualityAssessment
  ): CalibrationObservation {
    // High confidence should correlate with high quality
    const success = assessment.overallQuality > 0.6;

    return {
      id: `dec-${outcome.decisionId}`,
      predictedConfidence: outcome.predictedConfidence,
      actualOutcome: success,
      outcomeQuality: assessment.overallQuality,
      timestamp: outcome.timestamp,
      context: outcome.context,
      metadata: {
        decisionType: outcome.decisionType,
        complexity: outcome.complexity,
        wasOptimal: outcome.wasOptimalChoice,
        resultedInRegret: outcome.resultedInRegret,
        alternativesConsidered: outcome.alternativesConsidered,
        decisionFactors: outcome.decisionFactors,
      },
    };
  }

  /**
   * Get decision calibration profile
   */
  getProfile(): DecisionCalibrationProfile {
    const baseProfile = this.baseEngine.getProfile();
    if (!baseProfile) {
      throw new Error('No calibration profile available. Record decision outcomes first.');
    }

    const typeProfiles = new Map<string, CalibrationProfile>();
    this.typeEngines.forEach((engine, type) => {
      const profile = engine.getProfile();
      if (profile) {
        typeProfiles.set(type, profile);
      }
    });

    const complexityProfiles = new Map<string, CalibrationProfile>();
    this.complexityEngines.forEach((engine, complexity) => {
      const profile = engine.getProfile();
      if (profile) {
        complexityProfiles.set(complexity, profile);
      }
    });

    return {
      ...baseProfile,
      decisionTypes: typeProfiles,
      complexityCalibrations: complexityProfiles,
      qualityMetrics: this.calculateQualityMetrics(),
    };
  }

  /**
   * Calculate quality metrics
   */
  private calculateQualityMetrics(): DecisionQualityMetrics {
    if (this.outcomes.length === 0) {
      return {
        optimalChoiceRate: 0,
        regretRate: 0,
        longTermSuccessRate: 0,
        stakeholderSatisfactionRate: 0,
      };
    }

    const total = this.outcomes.length;

    return {
      optimalChoiceRate: this.outcomes.filter(o => o.wasOptimalChoice).length / total,
      regretRate: this.outcomes.filter(o => o.resultedInRegret).length / total,
      longTermSuccessRate: this.outcomes.reduce((sum, o) => sum + o.longTermSuccess, 0) / total,
      stakeholderSatisfactionRate: this.outcomes.reduce((sum, o) => sum + o.stakeholderSatisfaction, 0) / total,
    };
  }

  /**
   * Assess decision quality with calibration adjustment
   */
  assessDecisionQuality(
    predictedConfidence: number,
    decisionType?: string,
    complexity?: string
  ): {
    adjustedConfidence: number;
    expectedQuality: number;
    regretRisk: number;
    reliability: number;
  } {
    // Get base adjustment
    const baseAdjustment = this.baseEngine.adjustConfidence(predictedConfidence);
    let adjustedConfidence = baseAdjustment.adjustedConfidence;

    // Apply type-specific adjustment
    if (decisionType && this.typeEngines.has(decisionType)) {
      const typeEngine = this.typeEngines.get(decisionType)!;
      const typeAdjustment = typeEngine.adjustConfidence(predictedConfidence);
      adjustedConfidence = (adjustedConfidence + typeAdjustment.adjustedConfidence) / 2;
    }

    // Apply complexity adjustment
    if (complexity && this.complexityEngines.has(complexity)) {
      const compEngine = this.complexityEngines.get(complexity)!;
      const compAdjustment = compEngine.adjustConfidence(predictedConfidence);
      adjustedConfidence = (adjustedConfidence + compAdjustment.adjustedConfidence) / 2;
    }

    const profile = this.baseEngine.getProfile();
    const reliability = profile?.reliabilityScore || 0;

    // Calculate expected quality based on historical data
    const expectedQuality = this.calculateExpectedQuality(adjustedConfidence);

    // Calculate regret risk
    const regretRisk = this.calculateRegretRisk(adjustedConfidence, decisionType);

    return {
      adjustedConfidence,
      expectedQuality,
      regretRisk,
      reliability,
    };
  }

  /**
   * Calculate expected quality for a given confidence level
   */
  private calculateExpectedQuality(confidence: number): number {
    // Find outcomes with similar confidence
    const similarOutcomes = this.outcomes.filter(o => 
      Math.abs(o.predictedConfidence - confidence) < 0.1
    );

    if (similarOutcomes.length === 0) {
      return confidence * 0.8; // Conservative estimate
    }

    const assessments = similarOutcomes
      .map(o => this.qualityAssessments.get(o.decisionId))
      .filter((a): a is DecisionQualityAssessment => a !== undefined);

    if (assessments.length === 0) return confidence * 0.8;

    return assessments.reduce((sum, a) => sum + a.overallQuality, 0) / assessments.length;
  }

  /**
   * Calculate regret risk
   */
  private calculateRegretRisk(confidence: number, decisionType?: string): number {
    let outcomes = this.outcomes;

    if (decisionType) {
      outcomes = outcomes.filter(o => o.decisionType === decisionType);
    }

    const similarOutcomes = outcomes.filter(o => 
      Math.abs(o.predictedConfidence - confidence) < 0.1
    );

    if (similarOutcomes.length === 0) {
      return 1 - confidence; // Higher regret risk with lower confidence
    }

    const regretCount = similarOutcomes.filter(o => o.resultedInRegret).length;
    return regretCount / similarOutcomes.length;
  }

  /**
   * Get calibration by decision type
   */
  getTypeCalibration(decisionType: string): CalibrationProfile | null {
    const engine = this.typeEngines.get(decisionType);
    return engine?.getProfile() || null;
  }

  /**
   * Get calibration by complexity
   */
  getComplexityCalibration(complexity: string): CalibrationProfile | null {
    const engine = this.complexityEngines.get(complexity);
    return engine?.getProfile() || null;
  }

  /**
   * Analyze confidence vs quality correlation
   */
  analyzeConfidenceQualityCorrelation(): {
    correlation: number;
    slope: number;
    intercept: number;
    rSquared: number;
  } {
    const data = this.outcomes
      .map(o => ({
        confidence: o.predictedConfidence,
        quality: this.qualityAssessments.get(o.decisionId)?.overallQuality || 0,
      }))
      .filter(d => d.quality > 0);

    if (data.length < 3) {
      return { correlation: 0, slope: 0, intercept: 0, rSquared: 0 };
    }

    const n = data.length;
    const sumX = data.reduce((sum, d) => sum + d.confidence, 0);
    const sumY = data.reduce((sum, d) => sum + d.quality, 0);
    const sumXY = data.reduce((sum, d) => sum + d.confidence * d.quality, 0);
    const sumX2 = data.reduce((sum, d) => sum + d.confidence * d.confidence, 0);
    const sumY2 = data.reduce((sum, d) => sum + d.quality * d.quality, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const correlation = (n * sumXY - sumX * sumY) / 
      Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    const yMean = sumY / n;
    const ssTotal = data.reduce((sum, d) => sum + Math.pow(d.quality - yMean, 2), 0);
    const ssResidual = data.reduce((sum, d) => {
      const predicted = slope * d.confidence + intercept;
      return sum + Math.pow(d.quality - predicted, 2);
    }, 0);
    const rSquared = 1 - (ssResidual / ssTotal);

    return { correlation, slope, intercept, rSquared };
  }

  /**
   * Identify overconfident decision patterns
   */
  identifyOverconfidencePatterns(): Array<{
    pattern: string;
    frequency: number;
    averageOverconfidence: number;
  }> {
    const patterns: Map<string, { count: number; totalOverconfidence: number }> = new Map();

    this.outcomes.forEach(outcome => {
      const assessment = this.qualityAssessments.get(outcome.decisionId);
      if (!assessment) return;

      const overconfidence = outcome.predictedConfidence - assessment.overallQuality;
      if (overconfidence > 0.2) {
        // Pattern by decision type
        const typeKey = `type:${outcome.decisionType}`;
        const typePattern = patterns.get(typeKey) || { count: 0, totalOverconfidence: 0 };
        typePattern.count++;
        typePattern.totalOverconfidence += overconfidence;
        patterns.set(typeKey, typePattern);

        // Pattern by complexity
        const compKey = `complexity:${outcome.complexity}`;
        const compPattern = patterns.get(compKey) || { count: 0, totalOverconfidence: 0 };
        compPattern.count++;
        compPattern.totalOverconfidence += overconfidence;
        patterns.set(compKey, compPattern);

        // Pattern by number of alternatives
        if (outcome.alternativesConsidered < 3) {
          const altKey = 'few_alternatives';
          const altPattern = patterns.get(altKey) || { count: 0, totalOverconfidence: 0 };
          altPattern.count++;
          altPattern.totalOverconfidence += overconfidence;
          patterns.set(altKey, altPattern);
        }
      }
    });

    return Array.from(patterns.entries())
      .map(([pattern, data]) => ({
        pattern,
        frequency: data.count,
        averageOverconfidence: data.totalOverconfidence / data.count,
      }))
      .sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Get decision outcomes by type
   */
  getOutcomesByType(decisionType: string): DecisionOutcome[] {
    return this.outcomes.filter(o => o.decisionType === decisionType);
  }

  /**
   * Get decision outcomes by complexity
   */
  getOutcomesByComplexity(complexity: string): DecisionOutcome[] {
    return this.outcomes.filter(o => o.complexity === complexity);
  }

  /**
   * Get best decision types by reliability
   */
  getBestDecisionTypes(limit: number = 5): Array<{ type: string; reliability: number }> {
    const results: Array<{ type: string; reliability: number }> = [];

    this.typeEngines.forEach((engine, type) => {
      const profile = engine.getProfile();
      if (profile) {
        results.push({ type, reliability: profile.reliabilityScore });
      }
    });

    return results
      .sort((a, b) => b.reliability - a.reliability)
      .slice(0, limit);
  }

  /**
   * Get complexity calibration ranking
   */
  getComplexityRanking(): Array<{ complexity: string; reliability: number; avgQuality: number }> {
    const results: Array<{ complexity: string; reliability: number; avgQuality: number }> = [];

    this.complexityEngines.forEach((engine, complexity) => {
      const profile = engine.getProfile();
      const outcomes = this.getOutcomesByComplexity(complexity);
      const avgQuality = outcomes.length > 0
        ? outcomes.reduce((sum, o) => sum + o.longTermSuccess, 0) / outcomes.length
        : 0;

      if (profile) {
        results.push({ complexity, reliability: profile.reliabilityScore, avgQuality });
      }
    });

    return results.sort((a, b) => b.reliability - a.reliability);
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
    this.complexityEngines.clear();
    this.outcomes = [];
    this.qualityAssessments.clear();
  }

  /**
   * Export all data
   */
  exportData(): {
    outcomes: DecisionOutcome[];
    assessments: Map<string, DecisionQualityAssessment>;
    baseProfile: CalibrationProfile | null;
    typeProfiles: Map<string, CalibrationProfile>;
    complexityProfiles: Map<string, CalibrationProfile>;
  } {
    const typeProfiles = new Map<string, CalibrationProfile>();
    this.typeEngines.forEach((engine, type) => {
      const profile = engine.getProfile();
      if (profile) typeProfiles.set(type, profile);
    });

    const complexityProfiles = new Map<string, CalibrationProfile>();
    this.complexityEngines.forEach((engine, complexity) => {
      const profile = engine.getProfile();
      if (profile) complexityProfiles.set(complexity, profile);
    });

    return {
      outcomes: [...this.outcomes],
      assessments: new Map(this.qualityAssessments),
      baseProfile: this.baseEngine.getProfile(),
      typeProfiles,
      complexityProfiles,
    };
  }
}
