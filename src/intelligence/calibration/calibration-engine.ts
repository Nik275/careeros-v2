/**
 * CareerOS Intelligence Calibration Engine
 *
 * Main orchestration engine that integrates all calibration components:
 * - Recommendation Calibration
 * - Decision Calibration
 * - Regret Calibration
 * - Criticality Calibration
 * - Reliability Assessment
 * - Report Generation
 *
 * Ensures all confidence scores in CareerOS reflect actual reliability.
 */

import {
  CalibrationEngineConfig,
  DEFAULT_CALIBRATION_CONFIG,
  CalibrationProfile,
  CalibrationObservation,
  CalibrationReport,
  ConfidenceTrustworthiness,
  ReliabilityBand,
  TrustLevel,
  CalibrationEvent,
  CalibrationEventType,
  CalibrationStatus,
} from './calibration-types';
import { ConfidenceCalibrationEngine } from './confidence-calibration-engine';
import {
  RecommendationCalibrationEngine,
  RecommendationOutcome,
} from './recommendation-calibration-engine';
import {
  DecisionCalibrationEngine,
  DecisionOutcome,
  DecisionQualityAssessment,
} from './decision-calibration-engine';
import {
  RegretCalibrationEngine,
  RegretSignal,
} from './regret-calibration-engine';
import {
  CriticalityCalibrationEngine,
  ImpactObservation,
} from './criticality-calibration-engine';
import { ReliabilityEngine } from './reliability-engine';
import { CalibrationReportEngine } from './calibration-report-engine';

export interface CalibrationEngineOptions {
  config?: Partial<CalibrationEngineConfig>;
  autoGenerateReports?: boolean;
  reportInterval?: number;
}

export interface UnifiedCalibrationProfile {
  recommendation: CalibrationProfile | null;
  decision: CalibrationProfile | null;
  regret: CalibrationProfile | null;
  criticality: CalibrationProfile | null;
  overallReliability: number;
  systemStatus: 'healthy' | 'degraded' | 'critical';
}

export interface MentorGuidance {
  confidence: number;
  language: 'strong' | 'moderate' | 'tentative' | 'uncertain';
  qualifiers: string[];
  shouldExpressUncertainty: boolean;
}

export class CalibrationEngine {
  private config: CalibrationEngineConfig;
  private recommendationEngine: RecommendationCalibrationEngine;
  private decisionEngine: DecisionCalibrationEngine;
  private regretEngine: RegretCalibrationEngine;
  private criticalityEngine: CriticalityCalibrationEngine;
  private reliabilityEngine: ReliabilityEngine;
  private reportEngine: CalibrationReportEngine;

  private eventListeners: Array<(event: CalibrationEvent) => void> = [];
  private reportInterval: NodeJS.Timeout | null = null;

  constructor(options: CalibrationEngineOptions = {}) {
    this.config = { ...DEFAULT_CALIBRATION_CONFIG, ...options.config };

    this.recommendationEngine = new RecommendationCalibrationEngine();
    this.decisionEngine = new DecisionCalibrationEngine();
    this.regretEngine = new RegretCalibrationEngine();
    this.criticalityEngine = new CriticalityCalibrationEngine();
    this.reliabilityEngine = new ReliabilityEngine();
    this.reportEngine = new CalibrationReportEngine();

    // Set up auto-reporting if enabled
    if (options.autoGenerateReports && options.reportInterval) {
      this.reportInterval = setInterval(() => {
        this.generateReport();
      }, options.reportInterval);
    }

    this.registerSystemsForReporting();
  }

  /**
   * Register all engines with the report engine
   */
  private registerSystemsForReporting(): void {
    this.reportEngine.registerSystem(
      'recommendation',
      'Recommendation System',
      this.createDefaultProfile('recommendation')
    );
    this.reportEngine.registerSystem(
      'decision',
      'Decision System',
      this.createDefaultProfile('decision')
    );
    this.reportEngine.registerSystem(
      'regret',
      'Regret Prediction',
      this.createDefaultProfile('regret')
    );
    this.reportEngine.registerSystem(
      'criticality',
      'Criticality Assessment',
      this.createDefaultProfile('criticality')
    );
  }

  /**
   * Create default profile for initialization
   */
  private createDefaultProfile(id: string): CalibrationProfile {
    return {
      id,
      name: id,
      status: CalibrationStatus.INSUFFICIENT_DATA,
      reliabilityBand: ReliabilityBand.UNRELIABLE,
      reliabilityScore: 0,
      calibrationError: 1,
      sampleSize: 0,
      lastUpdated: Date.now(),
      binCalibrations: [],
      trend: {
        direction: 'stable',
        rate: 0,
        periodsAnalyzed: 0,
      },
    };
  }

  // ============================================================================
  // RECOMMENDATION CALIBRATION
  // ============================================================================

  recordRecommendation(
    recommendationId: string,
    recommendationType: string,
    category: string,
    predictedConfidence: number,
    context: import('./calibration-types').CalibrationContext
  ): void {
    this.recommendationEngine.recordRecommendation(
      recommendationId,
      recommendationType,
      category,
      predictedConfidence,
      context
    );
    this.emitEvent(CalibrationEventType.OBSERVATION_ADDED, 'recommendation', {
      recommendationId,
      predictedConfidence,
    });
  }

  recordRecommendationAcceptance(recommendationId: string): void {
    this.recommendationEngine.recordAcceptance(recommendationId);
  }

  recordRecommendationAction(recommendationId: string): void {
    this.recommendationEngine.recordAction(recommendationId);
  }

  recordRecommendationOutcome(
    recommendationId: string,
    outcomeQuality: number,
    userSatisfaction: number
  ): void {
    this.recommendationEngine.recordOutcome(
      recommendationId,
      outcomeQuality,
      userSatisfaction
    );
    this.updateReportEngine('recommendation');
  }

  adjustRecommendationConfidence(
    confidence: number,
    recommendationType?: string,
    category?: string
  ): { adjusted: number; factor: number; reason: string } {
    return this.recommendationEngine.adjustConfidence(
      confidence,
      recommendationType,
      category
    );
  }

  // ============================================================================
  // DECISION CALIBRATION
  // ============================================================================

  recordDecision(
    decisionId: string,
    decisionType: string,
    complexity: DecisionOutcome['complexity'],
    predictedConfidence: number,
    alternativesConsidered: number,
    context: import('./calibration-types').CalibrationContext,
    decisionFactors: string[]
  ): void {
    this.decisionEngine.recordDecision(
      decisionId,
      decisionType,
      complexity,
      predictedConfidence,
      alternativesConsidered,
      context,
      decisionFactors
    );
    this.emitEvent(CalibrationEventType.OBSERVATION_ADDED, 'decision', {
      decisionId,
      predictedConfidence,
    });
  }

  recordDecisionOutcome(
    decisionId: string,
    assessment: DecisionQualityAssessment
  ): void {
    this.decisionEngine.recordOutcome(decisionId, assessment);
    this.updateReportEngine('decision');
  }

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
    return this.decisionEngine.assessDecisionQuality(
      predictedConfidence,
      decisionType,
      complexity
    );
  }

  // ============================================================================
  // REGRET CALIBRATION
  // ============================================================================

  recordRegretPrediction(
    prediction: import('./regret-calibration-engine').RegretPrediction,
    context: import('./calibration-types').CalibrationContext
  ): void {
    this.regretEngine.recordPrediction(prediction, context);
  }

  recordRegretSignal(signal: RegretSignal): void {
    this.regretEngine.recordRegretSignal(signal);
    this.emitEvent(CalibrationEventType.OBSERVATION_ADDED, 'regret', {
      decisionId: signal.decisionId,
      actualRegret: signal.actualRegret,
    });
    this.updateReportEngine('regret');
  }

  adjustRegretRisk(
    predictedRisk: number,
    regretType?: string,
    severity?: string
  ): {
    adjustedRisk: number;
    confidence: number;
    calibrationFactor: number;
  } {
    return this.regretEngine.adjustRegretRisk(predictedRisk, regretType, severity);
  }

  // ============================================================================
  // CRITICALITY CALIBRATION
  // ============================================================================

  recordCriticalityPrediction(
    prediction: import('./criticality-calibration-engine').CriticalityPrediction,
    context: import('./calibration-types').CalibrationContext
  ): void {
    this.criticalityEngine.recordPrediction(prediction, context);
  }

  recordImpact(observation: ImpactObservation): void {
    this.criticalityEngine.recordImpact(observation);
    this.emitEvent(CalibrationEventType.OBSERVATION_ADDED, 'criticality', {
      decisionId: observation.decisionId,
      predictedCriticality: observation.predictedCriticality,
    });
    this.updateReportEngine('criticality');
  }

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
    return this.criticalityEngine.adjustCriticality(
      predictedCriticality,
      criticalityLevel,
      impactFactors
    );
  }

  // ============================================================================
  // UNIFIED CALIBRATION ACCESS
  // ============================================================================

  getUnifiedProfile(): UnifiedCalibrationProfile {
    const recommendation = this.recommendationEngine.getProfile();
    const decision = this.decisionEngine.getProfile();
    const regret = this.regretEngine.getProfile();
    const criticality = this.criticalityEngine.getProfile();

    const reliabilities = [
      recommendation.reliabilityScore,
      decision.reliabilityScore,
      regret.reliabilityScore,
      criticality.reliabilityScore,
    ];

    const overallReliability =
      reliabilities.reduce((a, b) => a + b, 0) / reliabilities.length;

    let systemStatus: 'healthy' | 'degraded' | 'critical';
    if (overallReliability >= 0.75) {
      systemStatus = 'healthy';
    } else if (overallReliability >= 0.5) {
      systemStatus = 'degraded';
    } else {
      systemStatus = 'critical';
    }

    return {
      recommendation,
      decision,
      regret,
      criticality,
      overallReliability,
      systemStatus,
    };
  }

  // ============================================================================
  // RELIABILITY ASSESSMENT
  // ============================================================================

  assessReliability(system: 'recommendation' | 'decision' | 'regret' | 'criticality'): {
    score: number;
    band: ReliabilityBand;
    recommendations: string[];
  } {
    let profile: CalibrationProfile;

    switch (system) {
      case 'recommendation':
        profile = this.recommendationEngine.getProfile();
        break;
      case 'decision':
        profile = this.decisionEngine.getProfile();
        break;
      case 'regret':
        profile = this.regretEngine.getProfile();
        break;
      case 'criticality':
        profile = this.criticalityEngine.getProfile();
        break;
    }

    const assessment = this.reliabilityEngine.calculateReliability(profile);
    return {
      score: assessment.score,
      band: assessment.band,
      recommendations: assessment.recommendations,
    };
  }

  assessConfidenceTrustworthiness(
    confidence: number,
    system: 'recommendation' | 'decision' | 'regret' | 'criticality',
    context?: string
  ): ConfidenceTrustworthiness {
    let profile: CalibrationProfile;

    switch (system) {
      case 'recommendation':
        profile = this.recommendationEngine.getProfile();
        break;
      case 'decision':
        profile = this.decisionEngine.getProfile();
        break;
      case 'regret':
        profile = this.regretEngine.getProfile();
        break;
      case 'criticality':
        profile = this.criticalityEngine.getProfile();
        break;
    }

    return this.reliabilityEngine.assessConfidenceTrustworthiness(
      confidence,
      profile,
      context
    );
  }

  // ============================================================================
  // MENTOR INTEGRATION
  // ============================================================================

  /**
   * Generate mentor guidance for expressing confidence appropriately
   */
  generateMentorGuidance(
    confidence: number,
    system: 'recommendation' | 'decision' | 'regret' | 'criticality'
  ): MentorGuidance {
    const trustworthiness = this.assessConfidenceTrustworthiness(
      confidence,
      system
    );

    let language: 'strong' | 'moderate' | 'tentative' | 'uncertain';
    const qualifiers: string[] = [];
    let shouldExpressUncertainty: boolean;

    switch (trustworthiness.trustLevel) {
      case TrustLevel.HIGH:
        language = confidence > 0.8 ? 'strong' : 'moderate';
        shouldExpressUncertainty = false;
        break;

      case TrustLevel.MODERATE:
        language = 'moderate';
        qualifiers.push('based on current data');
        shouldExpressUncertainty = confidence > 0.7;
        break;

      case TrustLevel.LOW:
        language = 'tentative';
        qualifiers.push('with some uncertainty');
        qualifiers.push('further validation needed');
        shouldExpressUncertainty = true;
        break;

      case TrustLevel.UNTRUSTWORTHY:
        language = 'uncertain';
        qualifiers.push('limited confidence in this assessment');
        qualifiers.push('more data would improve accuracy');
        shouldExpressUncertainty = true;
        break;
    }

    return {
      confidence: trustworthiness.adjustedConfidence,
      language,
      qualifiers,
      shouldExpressUncertainty,
    };
  }

  /**
   * Generate uncertainty-aware language for mentor
   */
  generateMentorLanguage(
    statement: string,
    confidence: number,
    system: 'recommendation' | 'decision' | 'regret' | 'criticality'
  ): string {
    const guidance = this.generateMentorGuidance(confidence, system);

    if (!guidance.shouldExpressUncertainty) {
      return statement;
    }

    const qualifiers = guidance.qualifiers;
    let modifiedStatement = statement;

    // Replace absolute language with qualified language
    const absolutePatterns = [
      { pattern: /\b(definitely|certainly|absolutely)\b/gi, replacement: 'likely' },
      { pattern: /\b(will|shall)\b/gi, replacement: 'may' },
      { pattern: /\b(is|are) (the best|optimal|ideal)\b/gi, replacement: 'is currently the strongest' },
      { pattern: /\b(you should|you must)\b/gi, replacement: 'you might consider' },
    ];

    absolutePatterns.forEach(({ pattern, replacement }) => {
      modifiedStatement = modifiedStatement.replace(pattern, replacement);
    });

    // Add qualifiers
    if (qualifiers.length > 0) {
      modifiedStatement += ` (${qualifiers.join(', ')})`;
    }

    return modifiedStatement;
  }

  // ============================================================================
  // REPORTING
  // ============================================================================

  generateReport(): CalibrationReport {
    // Update all systems in report engine
    this.updateReportEngine('recommendation');
    this.updateReportEngine('decision');
    this.updateReportEngine('regret');
    this.updateReportEngine('criticality');

    return this.reportEngine.generateReport();
  }

  private updateReportEngine(system: string): void {
    try {
      let profile: CalibrationProfile;

      switch (system) {
        case 'recommendation':
          profile = this.recommendationEngine.getProfile();
          break;
        case 'decision':
          profile = this.decisionEngine.getProfile();
          break;
        case 'regret':
          profile = this.regretEngine.getProfile();
          break;
        case 'criticality':
          profile = this.criticalityEngine.getProfile();
          break;
        default:
          return;
      }

      this.reportEngine.updateSystemProfile(system, profile);
    } catch {
      // Profile not yet available
    }
  }

  // ============================================================================
  // EVENT HANDLING
  // ============================================================================

  onEvent(listener: (event: CalibrationEvent) => void): () => void {
    this.eventListeners.push(listener);
    return () => {
      const index = this.eventListeners.indexOf(listener);
      if (index > -1) {
        this.eventListeners.splice(index, 1);
      }
    };
  }

  private emitEvent(
    type: CalibrationEventType,
    systemId: string,
    data: unknown
  ): void {
    const event: CalibrationEvent = {
      type,
      timestamp: Date.now(),
      systemId,
      data,
    };

    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch {
        // Ignore listener errors
      }
    });
  }

  // ============================================================================
  // SYSTEM STATUS
  // ============================================================================

  getSystemStatus(): {
    recommendation: { observations: number; reliability: number };
    decision: { observations: number; reliability: number };
    regret: { observations: number; reliability: number };
    criticality: { observations: number; reliability: number };
    overall: { status: 'healthy' | 'degraded' | 'critical'; reliability: number };
  } {
    const unified = this.getUnifiedProfile();

    return {
      recommendation: {
        observations: this.recommendationEngine.getObservationCount(),
        reliability: unified.recommendation?.reliabilityScore || 0,
      },
      decision: {
        observations: this.decisionEngine.getOutcomesByType('all').length,
        reliability: unified.decision?.reliabilityScore || 0,
      },
      regret: {
        observations: this.regretEngine.getSignalsByType('all').length,
        reliability: unified.regret?.reliabilityScore || 0,
      },
      criticality: {
        observations: this.criticalityEngine.getObservationsByLevel('all').length,
        reliability: unified.criticality?.reliabilityScore || 0,
      },
      overall: {
        status: unified.systemStatus,
        reliability: unified.overallReliability,
      },
    };
  }

  // ============================================================================
  // RESET AND CLEANUP
  // ============================================================================

  reset(): void {
    this.recommendationEngine.reset();
    this.decisionEngine.reset();
    this.regretEngine.reset();
    this.criticalityEngine.reset();
    this.reportEngine.clearSystems();
    this.registerSystemsForReporting();
  }

  dispose(): void {
    if (this.reportInterval) {
      clearInterval(this.reportInterval);
      this.reportInterval = null;
    }
    this.eventListeners = [];
  }

  // ============================================================================
  // EXPORT
  // ============================================================================

  exportAllData(): {
    recommendations: ReturnType<RecommendationCalibrationEngine['exportData']>;
    decisions: ReturnType<DecisionCalibrationEngine['exportData']>;
    regrets: ReturnType<RegretCalibrationEngine['exportData']>;
    criticalities: ReturnType<CriticalityCalibrationEngine['exportData']>;
    report: CalibrationReport;
  } {
    return {
      recommendations: this.recommendationEngine.exportData(),
      decisions: this.decisionEngine.exportData(),
      regrets: this.regretEngine.exportData(),
      criticalities: this.criticalityEngine.exportData(),
      report: this.generateReport(),
    };
  }
}
