/**
 * Intelligence Validation Engine
 *
 * Master orchestrator that coordinates all validation sub-engines:
 * - ConfidenceCalibrationEngine
 * - RecommendationStabilityEngine
 * - RecommendationConsistencyEngine
 * - UncertaintyEngine
 * - CounterfactualEngine
 * - RecommendationAuditEngine
 *
 * Produces unified validation reports and enforces validation gates.
 */

import {
  ValidationId,
  ValidationTimestamp,
  ValidationReport,
  ValidationSummary,
  CalibrationReport,
  CalibrationBin,
  StabilityReport,
  ConsistencyReport,
  UncertaintyAssessment,
  CounterfactualReport,
  RecommendationAuditReport,
  DEFAULT_VALIDATION_CONFIG,
  ValidationConfig,
  ValidationStatus,
} from './validation-types';

import { ConfidenceCalibrationEngine } from './confidence-calibration-engine';
import { RecommendationStabilityEngine, RecommendationSnapshot } from './recommendation-stability-engine';
import { RecommendationConsistencyEngine, PathwayResult, ComponentDefinition } from './recommendation-consistency-engine';
import { UncertaintyEngine, UncertaintyInput } from './uncertainty-engine';
import { CounterfactualEngine, CounterfactualInput } from './counterfactual-engine';
import { RecommendationAuditEngine, AuditInput } from './recommendation-audit-engine';

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface IntelligenceValidationConfig {
  enabledEngines: {
    calibration: boolean;
    stability: boolean;
    consistency: boolean;
    uncertainty: boolean;
    counterfactual: boolean;
    audit: boolean;
  };
  gateThresholds: {
    calibration: number;
    stability: number;
    consistency: number;
    uncertainty: number;
    minConfidence: number;
    minTrustworthiness: number;
  };
  autoEscalate: boolean;
  logAllValidations: boolean;
  validationTimeout: number;
}

export const DEFAULT_INTELLIGENCE_VALIDATION_CONFIG: IntelligenceValidationConfig = {
  enabledEngines: {
    calibration: true,
    stability: true,
    consistency: true,
    uncertainty: true,
    counterfactual: true,
    audit: true,
  },
  gateThresholds: {
    calibration: 75,
    stability: 70,
    consistency: 70,
    uncertainty: 50,
    minConfidence: 50,
    minTrustworthiness: 60,
  },
  autoEscalate: true,
  logAllValidations: true,
  validationTimeout: 30000,
};

// ============================================================================
// INPUTS
// ============================================================================

export interface ValidationRunInput {
  studentId: string;
  requestId: string;

  // For calibration check
  predictions?: Array<{
    careerId: string;
    confidence: number;
    actualOutcome: boolean;
  }>;

  // For stability check
  baseRecommendations?: RecommendationSnapshot[];
  perturbationProvider?: (input: Record<string, unknown>) => Promise<RecommendationSnapshot[]>;

  // For consistency check
  profile?: Record<string, unknown>;
  components?: ComponentDefinition[];
  pathwayRunner?: (path: unknown, profile: Record<string, unknown>) => Promise<PathwayResult>;

  // For uncertainty check
  uncertaintyInput?: UncertaintyInput;

  // For counterfactual check
  counterfactualInput?: CounterfactualInput;
  counterfactualProvider?: (profile: Record<string, unknown>) => Promise<unknown>;

  // For audit check
  auditInput?: AuditInput;
}

export interface ValidationRunOptions {
  engines?: (keyof IntelligenceValidationConfig['enabledEngines'])[];
  skipGates?: boolean;
  timeout?: number;
}

// ============================================================================
// MASTER ENGINE
// ============================================================================

export class IntelligenceValidationEngine {
  private config: IntelligenceValidationConfig;
  private validationConfig: ValidationConfig;

  // Sub-engines
  private calibrationEngine: ConfidenceCalibrationEngine;
  private stabilityEngine: RecommendationStabilityEngine;
  private consistencyEngine: RecommendationConsistencyEngine;
  private uncertaintyEngine: UncertaintyEngine;
  private counterfactualEngine: CounterfactualEngine;
  private auditEngine: RecommendationAuditEngine;

  // History for tracking
  private validationHistory: ValidationReport[] = [];
  private maxHistorySize = 100;

  constructor(
    config: Partial<IntelligenceValidationConfig> = {},
    validationConfig: Partial<ValidationConfig> = {}
  ) {
    this.config = { ...DEFAULT_INTELLIGENCE_VALIDATION_CONFIG, ...config };
    this.validationConfig = { ...DEFAULT_VALIDATION_CONFIG, ...validationConfig };

    // Initialize sub-engines
    this.calibrationEngine = new ConfidenceCalibrationEngine({}, this.validationConfig);
    this.stabilityEngine = new RecommendationStabilityEngine({}, this.validationConfig);
    this.consistencyEngine = new RecommendationConsistencyEngine({}, this.validationConfig);
    this.uncertaintyEngine = new UncertaintyEngine({}, this.validationConfig);
    this.counterfactualEngine = new CounterfactualEngine({});
    this.auditEngine = new RecommendationAuditEngine({}, this.validationConfig);
  }

  /**
   * Run comprehensive validation
   */
  async validate(
    input: ValidationRunInput,
    options?: ValidationRunOptions
  ): Promise<ValidationReport> {
    const reportId = `validation-${input.studentId}-${Date.now()}`;
    const generatedAt = Date.now();
    const enginesToRun = options?.engines ?? Object.keys(this.config.enabledEngines) as (keyof typeof this.config.enabledEngines)[];

    const results: Partial<ValidationReport['results']> = {};
    const errors: Array<{ engine: string; error: string }> = [];

    // Run each enabled engine
    for (const engineName of enginesToRun) {
      if (!this.config.enabledEngines[engineName]) continue;

      try {
        switch (engineName) {
          case 'calibration':
            if (input.predictions) {
              results.calibration = await this.runCalibration(input.predictions);
            }
            break;

          case 'stability':
            if (input.baseRecommendations && input.perturbationProvider) {
              results.stability = await this.runStability(
                input.studentId,
                input.baseRecommendations,
                input.perturbationProvider
              );
            }
            break;

          case 'consistency':
            if (input.profile && input.components && input.pathwayRunner) {
              results.consistency = await this.runConsistency(
                input.studentId,
                input.profile,
                input.components,
                input.pathwayRunner
              );
            }
            break;

          case 'uncertainty':
            if (input.uncertaintyInput) {
              results.uncertainty = this.runUncertainty(input.uncertaintyInput);
            }
            break;

          case 'counterfactual':
            if (input.counterfactualInput && input.counterfactualProvider) {
              results.counterfactual = await this.runCounterfactual(
                input.counterfactualInput,
                input.counterfactualProvider as (profile: Record<string, unknown>) => Promise<{
                  careerId: string;
                  careerName: string;
                  confidence: number;
                  score: number;
                }>
              );
            }
            break;

          case 'audit':
            if (input.auditInput) {
              results.audit = this.runAudit(input.auditInput);
            }
            break;
        }
      } catch (error) {
        errors.push({
          engine: engineName,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Generate summary
    const summary = this.generateSummary(results as ValidationReport['results']);

    // Check gates
    const gates = options?.skipGates
      ? { passed: true, failed: [] as string[], warnings: [] as string[] }
      : this.checkGates(results as ValidationReport['results']);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      results as ValidationReport['results'],
      gates
    );

    const report: ValidationReport = {
      reportId,
      generatedAt,
      studentId: input.studentId,
      requestId: input.requestId,
      status: gates.passed ? 'passed' : 'failed',
      summary,
      results: results as ValidationReport['results'],
      gates,
      recommendations,
      errors: errors.length > 0 ? errors : undefined,
    };

    // Store in history
    this.addToHistory(report);

    return report;
  }

  /**
   * Quick validation check - runs minimal validation
   */
  async quickValidate(
    studentId: string,
    confidence: number,
    uncertaintyInput?: UncertaintyInput
  ): Promise<{
    pass: boolean;
    confidence: number;
    uncertainty: 'none' | 'low' | 'medium' | 'high' | 'critical';
    issues: string[];
  }> {
    const issues: string[] = [];

    // Check confidence
    if (confidence < this.config.gateThresholds.minConfidence) {
      issues.push(`Confidence ${confidence.toFixed(1)} below threshold ${this.config.gateThresholds.minConfidence}`);
    }

    // Check uncertainty
    let uncertainty: 'none' | 'low' | 'medium' | 'high' | 'critical' = 'none';
    if (uncertaintyInput) {
      const assessment = this.uncertaintyEngine.assessUncertainty(uncertaintyInput);
      uncertainty = assessment.overallUncertainty.level;

      if (assessment.overallUncertainty.admissionRequired) {
        issues.push('Uncertainty admission required');
      }

      for (const source of assessment.sources.filter(s => s.severity === 'high' || s.severity === 'critical')) {
        issues.push(`Uncertainty: ${source.description}`);
      }
    }

    const pass = confidence >= this.config.gateThresholds.minConfidence && issues.length <= 2;

    // Create minimal report for history tracking
    const report: ValidationReport = {
      reportId: `quick-${studentId}-${Date.now()}`,
      generatedAt: Date.now(),
      studentId,
      status: pass ? 'passed' : 'failed',
      results: {},
      gates: {
        passed: pass,
        failed: pass ? [] : ['confidence'],
        warnings: [],
      },
      overallStatus: {
        valid: pass,
        confidence,
        issues,
        warnings: [],
      },
      summary: {
        overallScore: confidence,
        overallStatus: pass ? 'passed' : 'failed',
        confidenceScore: confidence,
        trustworthinessScore: confidence,
        individualScores: { confidence },
        statusBreakdown: { confidence: pass ? 'passed' : 'failed' },
        recommendationCount: 1,
        issueCount: issues.length,
        engineResults: {
          uncertainty: {
            status: uncertainty as ValidationStatus,
            score: confidence,
            passed: pass,
          },
        },
      },
      crossCutting: {
        reliabilityScore: pass ? 80 : 40,
        trustworthinessScore: pass ? 80 : 40,
        explainabilityScore: 70,
        robustnessScore: pass ? 75 : 35,
      },
      insights: issues.map(issue => ({
        category: 'weakness' as const,
        description: issue,
        severity: 'medium' as const,
        recommendation: 'Address the identified issue',
      })),
      improvementRecommendations: issues.length > 0 ? ['Review and address issues'] : [],
      recommendations: issues.length > 0 ? ['Address issues before proceeding'] : ['Proceed with recommendation'],
      metadata: {
        validationVersion: '1.0.0',
        enginesValidated: ['uncertainty'],
        testsRun: 1,
        testsPassed: pass ? 1 : 0,
        coverage: 50,
        duration: 0,
      },
    };

    this.addToHistory(report);

    return {
      pass,
      confidence,
      uncertainty,
      issues,
    };
  }

  /**
   * Validate batch of recommendations
   */
  async validateBatch(
    inputs: ValidationRunInput[],
    options?: ValidationRunOptions
  ): Promise<ValidationReport[]> {
    const reports: ValidationReport[] = [];

    for (const input of inputs) {
      const report = await this.validate(input, options);
      reports.push(report);
    }

    return reports;
  }

  /**
   * Get validation history
   */
  getValidationHistory(studentId?: string): ValidationReport[] {
    if (studentId) {
      return this.validationHistory.filter(r => r.studentId === studentId);
    }
    return [...this.validationHistory];
  }

  /**
   * Get validation statistics
   */
  getStatistics(): {
    totalValidations: number;
    passRate: number;
    avgConfidence: number;
    commonIssues: Array<{ issue: string; count: number }>;
  } {
    const total = this.validationHistory.length;
    const passed = this.validationHistory.filter(r => r.status === 'passed').length;
    const passRate = total > 0 ? (passed / total) * 100 : 0;

    const avgConfidence =
      total > 0
        ? this.validationHistory.reduce((sum, r) => sum + r.summary.confidenceScore, 0) / total
        : 0;

    // Count common issues
    const issueCounts = new Map<string, number>();
    for (const report of this.validationHistory) {
      for (const recommendation of report.recommendations) {
        const count = issueCounts.get(recommendation) || 0;
        issueCounts.set(recommendation, count + 1);
      }
    }

    const commonIssues = [...issueCounts.entries()]
      .map(([issue, count]) => ({ issue, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalValidations: total,
      passRate: Math.round(passRate),
      avgConfidence: Math.round(avgConfidence),
      commonIssues,
    };
  }

  /**
   * Get config
   */
  getConfig(): IntelligenceValidationConfig {
    return { ...this.config };
  }

  /**
   * Update config
   */
  updateConfig(config: Partial<IntelligenceValidationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get sub-engine instances for direct access
   */
  getEngines(): {
    calibration: ConfidenceCalibrationEngine;
    stability: RecommendationStabilityEngine;
    consistency: RecommendationConsistencyEngine;
    uncertainty: UncertaintyEngine;
    counterfactual: CounterfactualEngine;
    audit: RecommendationAuditEngine;
  } {
    return {
      calibration: this.calibrationEngine,
      stability: this.stabilityEngine,
      consistency: this.consistencyEngine,
      uncertainty: this.uncertaintyEngine,
      counterfactual: this.counterfactualEngine,
      audit: this.auditEngine,
    };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private async runCalibration(predictions: { careerId: string; confidence: number; actualOutcome: boolean }[]): Promise<CalibrationReport> {
    // Bin predictions
    const bins = this.calibrationEngine.binPredictions(predictions);

    // Run analysis
    return this.calibrationEngine.analyzeCalibration(bins);
  }

  private async runStability(
    studentId: string,
    baseRecommendations: RecommendationSnapshot[],
    provider: (input: Record<string, unknown>) => Promise<RecommendationSnapshot[]>
  ): Promise<StabilityReport> {
    // Generate perturbations
    const perturbations = this.stabilityEngine.generatePerturbations({ studentId });

    // Run stability analysis
    return this.stabilityEngine.analyzeStability(
      studentId,
      baseRecommendations,
      perturbations,
      provider
    );
  }

  private async runConsistency(
    studentId: string,
    profile: Record<string, unknown>,
    components: ComponentDefinition[],
    runner: (path: unknown, profile: Record<string, unknown>) => Promise<PathwayResult>
  ): Promise<ConsistencyReport> {
    return this.consistencyEngine.analyzeConsistency(studentId, profile, components, runner);
  }

  private runUncertainty(input: UncertaintyInput): UncertaintyAssessment {
    return this.uncertaintyEngine.assessUncertainty(input);
  }

  private async runCounterfactual(
    input: CounterfactualInput,
    provider: (profile: Record<string, unknown>) => Promise<{
      careerId: string;
      careerName: string;
      confidence: number;
      score: number;
    }>
  ): Promise<CounterfactualReport> {
    return this.counterfactualEngine.analyzeCounterfactuals(input, provider);
  }

  private runAudit(input: AuditInput): RecommendationAuditReport {
    return this.auditEngine.auditRecommendation(input);
  }

  private generateSummary(results: ValidationReport['results']): ValidationSummary {
    const scores: Record<string, number> = {};
    const statuses: Record<string, ValidationStatus> = {};

    // Calibration score
    if (results.calibration) {
      scores.calibration = results.calibration.overallCalibration.score;
      statuses.calibration = results.calibration.passed ? 'passed' : 'failed';
    }

    // Stability score
    if (results.stability) {
      scores.stability = results.stability.overallStability.score;
      statuses.stability = results.stability.passed ? 'passed' : 'failed';
    }

    // Consistency score
    if (results.consistency) {
      scores.consistency = results.consistency.overallConsistency.score;
      statuses.consistency = results.consistency.passed ? 'passed' : 'failed';
    }

    // Uncertainty score (invert - lower uncertainty is better)
    if (results.uncertainty) {
      scores.uncertainty = Math.max(0, 100 - results.uncertainty.overallUncertainty.score);
      statuses.uncertainty =
        results.uncertainty.overallUncertainty.level === 'none' ||
        results.uncertainty.overallUncertainty.level === 'low'
          ? 'passed'
          : results.uncertainty.overallUncertainty.level === 'medium'
          ? 'warning'
          : 'failed';
    }

    // Audit score
    if (results.audit) {
      scores.audit = results.audit.verdict.confidence;
      statuses.audit = results.audit.verdict.trustworthy ? 'passed' : 'failed';
    }

    // Calculate overall scores
    const scoreValues = Object.values(scores);
    const overallScore =
      scoreValues.length > 0
        ? Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length)
        : 0;

    // Overall status
    let overallStatus: ValidationStatus = 'passed';
    if (Object.values(statuses).includes('failed')) {
      overallStatus = 'failed';
    } else if (Object.values(statuses).includes('warning')) {
      overallStatus = 'warning';
    }

    return {
      overallScore,
      overallStatus,
      confidenceScore: scores.audit || scores.calibration || overallScore,
      trustworthinessScore: scores.audit || overallScore,
      individualScores: scores,
      statusBreakdown: statuses,
    };
  }

  private checkGates(results: ValidationReport['results']): {
    passed: boolean;
    failed: string[];
    warnings: string[];
  } {
    const failed: string[] = [];
    const warnings: string[] = [];

    // Calibration gate
    if (results.calibration) {
      if (results.calibration.overallCalibration.score < this.config.gateThresholds.calibration) {
        failed.push('calibration');
      } else if (results.calibration.overallCalibration.score < this.config.gateThresholds.calibration + 10) {
        warnings.push('calibration');
      }
    }

    // Stability gate
    if (results.stability) {
      if (results.stability.overallStability.score < this.config.gateThresholds.stability) {
        failed.push('stability');
      } else if (results.stability.overallStability.score < this.config.gateThresholds.stability + 10) {
        warnings.push('stability');
      }
    }

    // Consistency gate
    if (results.consistency) {
      if (results.consistency.overallConsistency.score < this.config.gateThresholds.consistency) {
        failed.push('consistency');
      } else if (results.consistency.overallConsistency.score < this.config.gateThresholds.consistency + 10) {
        warnings.push('consistency');
      }
    }

    // Uncertainty gate
    if (results.uncertainty) {
      if (results.uncertainty.overallUncertainty.score > this.config.gateThresholds.uncertainty) {
        failed.push('uncertainty');
      } else if (results.uncertainty.overallUncertainty.score > this.config.gateThresholds.uncertainty - 10) {
        warnings.push('uncertainty');
      }
    }

    // Audit gate
    if (results.audit) {
      if (!results.audit.verdict.trustworthy) {
        failed.push('trustworthiness');
      } else if (results.audit.verdict.confidence < this.config.gateThresholds.minTrustworthiness) {
        warnings.push('trustworthiness');
      }
    }

    return {
      passed: failed.length === 0,
      failed,
      warnings,
    };
  }

  private generateRecommendations(
    results: ValidationReport['results'],
    gates: { passed: boolean; failed: string[]; warnings: string[] }
  ): string[] {
    const recommendations: string[] = [];

    // Add recommendations based on failed gates
    for (const gate of gates.failed) {
      switch (gate) {
        case 'calibration':
          recommendations.push('Recalibrate confidence models with recent outcome data');
          break;
        case 'stability':
          recommendations.push('Review recommendation stability - high sensitivity to input changes detected');
          break;
        case 'consistency':
          recommendations.push('Reconcile inconsistent engine outputs - check for conflicting signals');
          break;
        case 'uncertainty':
          recommendations.push('Acknowledge uncertainty in recommendations to users');
          break;
        case 'trustworthiness':
          recommendations.push('Escalate to human review - recommendation failed trustworthiness audit');
          break;
      }
    }

    // Add recommendations based on specific results
    if (results.uncertainty?.systemResponse.shouldGatherMoreData) {
      recommendations.push('Gather additional assessment data before finalizing recommendations');
    }

    if (results.uncertainty?.systemResponse.shouldEscalate) {
      recommendations.push('Escalate to human expert due to high uncertainty');
    }

    if ((results.stability?.driftMetrics.recommendationDrift.mean ?? 0) > 20) {
      recommendations.push('Recommendations show high drift - consider averaging across multiple runs');
    }

    if ((results.calibration?.overallCalibration.overconfidence ?? 0) > 10) {
      recommendations.push('System is overconfident - reduce confidence scores by 10-15%');
    }

    return recommendations;
  }

  private addToHistory(report: ValidationReport): void {
    this.validationHistory.push(report);
    if (this.validationHistory.length > this.maxHistorySize) {
      this.validationHistory.shift();
    }
  }
}

export default IntelligenceValidationEngine;
