/**
 * CareerOS Assessment Reliability & Validation System - Assessment Validator
 *
 * Phase B.4: Assessment Validation Layer
 *
 * Orchestrates assessment validation and generates comprehensive reports.
 *
 * @module assessment-validator
 * @version 1.0.0
 */

import type {
  AssessmentResponse,
  AssessmentSignal,
  DimensionScoreMap,
  ValidationReport,
  ValidationContext,
  ValidationConfig,
  ValidationRecommendation,
  RetestRecommendation,
  ConsistencyAnalysis,
  ResponsePatternAnalysis,
  ReliabilityMetrics,
  QualityMetrics,
} from './validation-types';
import { DEFAULT_VALIDATION_CONFIG } from './validation-types';

import { ConsistencyEngine } from './consistency-engine';
import { ResponsePatternDetector } from './response-pattern-detector';
import { ReliabilityEngine } from './reliability-engine';
import { QualityScoreEngine } from './quality-score-engine';

/**
 * Orchestrates assessment validation and reporting.
 *
 * Coordinates consistency checks, pattern detection, reliability
 * calculation, and quality scoring into comprehensive reports.
 */
export class AssessmentValidator {
  private consistencyEngine: ConsistencyEngine;
  private patternDetector: ResponsePatternDetector;
  private reliabilityEngine: ReliabilityEngine;
  private qualityEngine: QualityScoreEngine;
  private config: ValidationConfig;

  constructor(config?: Partial<ValidationConfig>) {
    this.config = { ...DEFAULT_VALIDATION_CONFIG, ...config };
    this.consistencyEngine = new ConsistencyEngine();
    this.patternDetector = new ResponsePatternDetector();
    this.reliabilityEngine = new ReliabilityEngine();
    this.qualityEngine = new QualityScoreEngine(this.config);
  }

  /**
   * Validate complete assessment and generate report.
   */
  validate(context: ValidationContext): ValidationReport {
    const { responses, signals, timings, expectedQuestionCount } = context;

    // Run all validation engines
    const consistency = this.consistencyEngine.analyzeConsistency(signals);
    const patterns = this.patternDetector.analyzePatterns(responses, timings);

    // Calculate reliability (need dimension scores)
    const dimensionScores = this.buildDimensionScores(signals);
    const reliability = this.reliabilityEngine.calculateReliability(
      signals,
      responses,
      dimensionScores
    );

    // Calculate quality
    const quality = this.qualityEngine.calculateQuality(
      responses,
      signals,
      expectedQuestionCount,
      timings
    );

    // Identify issues
    const issues = this.identifyIssues(
      consistency,
      patterns,
      reliability,
      quality
    );

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      consistency,
      patterns,
      reliability,
      quality
    );

    // Generate retest recommendation
    const retestRecommendation = this.generateRetestRecommendation(
      reliability,
      quality,
      consistency,
      patterns
    );

    // Determine overall validity
    const isValid = this.determineValidity(
      reliability,
      quality,
      issues
    );

    return {
      isValid,
      reliabilityScore: reliability.overallScore,
      qualityLevel: this.qualityEngine.getQualityLevel(quality.overallScore),
      reliability,
      consistency,
      patterns,
      quality,
      issues,
      recommendations,
      retestRecommendation,
      validatedAt: new Date(),
    };
  }

  /**
   * Build dimension scores from signals.
   */
  private buildDimensionScores(signals: AssessmentSignal[]): DimensionScoreMap {
    const scores = new Map();

    const grouped = new Map<string, AssessmentSignal[]>();
    for (const signal of signals) {
      const existing = grouped.get(signal.dimension) ?? [];
      existing.push(signal);
      grouped.set(signal.dimension, existing);
    }

    for (const [dimension, dimensionSignals] of grouped) {
      const avgStrength =
        dimensionSignals.reduce((sum, s) => sum + s.strength, 0) /
        dimensionSignals.length;

      const avgConfidence =
        dimensionSignals.reduce((sum, s) => sum + s.confidence, 0) /
        dimensionSignals.length;

      scores.set(dimension, {
        dimension,
        score: Math.round(avgStrength),
        confidence: Math.round(avgConfidence),
        signalCount: dimensionSignals.length,
      });
    }

    return scores;
  }

  /**
   * Identify all validation issues.
   */
  private identifyIssues(
    consistency: ConsistencyAnalysis,
    patterns: ResponsePatternAnalysis,
    reliability: ReliabilityMetrics,
    quality: QualityMetrics
  ): ValidationReport['issues'] {
    const issues: ValidationReport['issues'] = [];

    // Check completion
    if (quality.completionRate < this.config.minCompletionRate) {
      issues.push({
        type: 'LOW_COMPLETION',
        severity: 'ERROR',
        description: `Completion rate ${quality.completionRate}% below threshold ${this.config.minCompletionRate}%`,
        affectedAreas: ['all_dimensions'],
        suggestion: 'Complete remaining questions or schedule retest',
      });
    }

    // Check consistency
    if (consistency.consistencyScore < 60) {
      issues.push({
        type: 'INCONSISTENT_RESPONSES',
        severity: 'WARNING',
        description: `Low consistency score: ${consistency.consistencyScore}%`,
        affectedAreas: consistency.contradictions.length > 0
          ? consistency.contradictions.flatMap((c) => c.dimensions)
          : ['general'],
        suggestion: 'Review responses for contradictions or retest',
      });
    }

    // Check contradictions
    if (consistency.contradictions.length > this.config.maxContradictions) {
      issues.push({
        type: 'CONTRADICTORY_SIGNALS',
        severity: 'WARNING',
        description: `${consistency.contradictions.length} contradictions detected`,
        affectedAreas: consistency.contradictions.flatMap((c) => c.dimensions),
        suggestion: 'Review contradictory responses or retest',
      });
    }

    // Check patterns
    if (patterns.detectedPatterns.length > 0) {
      const highSeverity = patterns.detectedPatterns.filter(
        (p) => p.severity === 'HIGH'
      );

      if (highSeverity.length > 0) {
        issues.push({
          type: 'SUSPICIOUS_PATTERNS',
          severity: 'ERROR',
          description: `${highSeverity.length} suspicious response patterns detected`,
          affectedAreas: ['response_quality'],
          suggestion: 'Retest recommended due to suspicious patterns',
        });
      }
    }

    // Check reliability
    if (reliability.overallScore < this.config.minReliabilityThreshold) {
      issues.push({
        type: 'LOW_CONFIDENCE',
        severity: 'WARNING',
        description: `Reliability score ${reliability.overallScore}% below threshold`,
        affectedAreas: ['profile_reliability'],
        suggestion: 'Add more questions or retest for higher confidence',
      });
    }

    // Check coverage
    if (quality.overallScore < this.config.minQualityThreshold) {
      issues.push({
        type: 'INSUFFICIENT_COVERAGE',
        severity: 'WARNING',
        description: `Quality score ${quality.overallScore}% below threshold`,
        affectedAreas: ['dimension_coverage'],
        suggestion: 'Expand assessment coverage for more reliable results',
      });
    }

    // Check engagement
    if (patterns.engagementScore < 50) {
      issues.push({
        type: 'LOW_CONFIDENCE',
        severity: 'WARNING',
        description: `Low engagement detected: ${patterns.engagementScore}%`,
        affectedAreas: ['response_quality'],
        suggestion: 'Review assessment conditions and consider retest',
      });
    }

    return issues;
  }

  /**
   * Generate validation recommendations.
   */
  private generateRecommendations(
    consistency: ConsistencyAnalysis,
    patterns: ResponsePatternAnalysis,
    reliability: ReliabilityMetrics,
    quality: QualityMetrics
  ): ValidationRecommendation[] {
    const recommendations: ValidationRecommendation[] = [];

    // Reliability-based recommendations
    if (reliability.overallScore < 40) {
      recommendations.push({
        type: 'RETEST_FULL',
        priority: 'HIGH',
        description: 'Full retest recommended due to low reliability',
        rationale: `Reliability score ${reliability.overallScore}% indicates unreliable results`,
        expectedImpact: 'Significant improvement in profile accuracy',
      });
    } else if (reliability.overallScore < 60) {
      recommendations.push({
        type: 'RETEST_PARTIAL',
        priority: 'MEDIUM',
        description: 'Partial retest of weak dimensions recommended',
        rationale: 'Some dimensions show low confidence',
        expectedImpact: 'Improved confidence in specific areas',
      });
    }

    // Contradiction recommendations
    if (consistency.contradictions.length > 0) {
      recommendations.push({
        type: 'REVIEW_CONTRADICTIONS',
        priority: 'MEDIUM',
        description: 'Review and clarify contradictory responses',
        rationale: `${consistency.contradictions.length} contradictions may indicate unclear preferences`,
        expectedImpact: 'Better understanding of true preferences',
      });
    }

    // Pattern-based recommendations
    const highSeverityPatterns = patterns.detectedPatterns.filter(
      (p) => p.severity === 'HIGH'
    );

    if (highSeverityPatterns.length > 0) {
      recommendations.push({
        type: 'RETEST_FULL',
        priority: 'HIGH',
        description: 'Retest due to suspicious response patterns',
        rationale: 'Detected patterns suggest low-quality responses',
        expectedImpact: 'More reliable and valid results',
      });
    }

    // Quality-based recommendations
    if (quality.overallScore < 60) {
      recommendations.push({
        type: 'ADDITIONAL_QUESTIONS',
        priority: 'MEDIUM',
        description: 'Add more questions to improve coverage',
        rationale: 'Current coverage insufficient for reliable profile',
        expectedImpact: 'Increased confidence in dimension scores',
      });
    }

    // No action if everything looks good
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'NO_ACTION',
        priority: 'LOW',
        description: 'Assessment quality is acceptable',
        rationale: 'All quality metrics within acceptable ranges',
        expectedImpact: 'Current results are reliable',
      });
    }

    return recommendations;
  }

  /**
   * Generate retest recommendation.
   */
  private generateRetestRecommendation(
    reliability: ReliabilityMetrics,
    quality: QualityMetrics,
    consistency: ConsistencyAnalysis,
    patterns: ResponsePatternAnalysis
  ): RetestRecommendation {
    const highSeverityPatterns = patterns.detectedPatterns.filter(
      (p) => p.severity === 'HIGH'
    );

    // Determine retest need
    if (
      reliability.overallScore < 40 ||
      quality.overallScore < 40 ||
      highSeverityPatterns.length > 1
    ) {
      return {
        shouldRetest: true,
        retestType: 'FULL',
        reason: 'Assessment quality too low for reliable results',
        dimensionsToRetest: [],
        confidence: Math.round((100 - reliability.overallScore) * 0.8),
      };
    }

    if (
      reliability.overallScore < 60 ||
      consistency.inconsistentDimensions.length > 2
    ) {
      return {
        shouldRetest: true,
        retestType: 'PARTIAL',
        reason: 'Some dimensions need clarification',
        dimensionsToRetest: consistency.inconsistentDimensions.slice(0, 3),
        confidence: Math.round((100 - reliability.overallScore) * 0.6),
      };
    }

    if (quality.overallScore < 70) {
      return {
        shouldRetest: false,
        retestType: 'NONE',
        reason: 'Quality acceptable but interpret with caution',
        dimensionsToRetest: [],
        confidence: Math.round(quality.overallScore * 0.8),
      };
    }

    return {
      shouldRetest: false,
      retestType: 'NONE',
      reason: 'Assessment quality is good',
      dimensionsToRetest: [],
      confidence: Math.round((reliability.overallScore + quality.overallScore) / 2),
    };
  }

  /**
   * Determine overall validity.
   */
  private determineValidity(
    reliability: { overallScore: number },
    quality: { overallScore: number },
    issues: ValidationReport['issues']
  ): boolean {
    // Check for critical errors
    const hasCriticalErrors = issues.some((i) => i.severity === 'ERROR');
    if (hasCriticalErrors) return false;

    // Check minimum thresholds
    if (reliability.overallScore < 30) return false;
    if (quality.overallScore < 30) return false;

    // Valid if no critical issues and above minimum thresholds
    return true;
  }

  /**
   * Quick validation check.
   */
  quickValidate(
    reliabilityScore: number,
    qualityScore: number
  ): { valid: boolean; quality: 'LOW' | 'MEDIUM' | 'HIGH' } {
    const quality = this.qualityEngine.getQualityLevel(qualityScore);

    const valid =
      reliabilityScore >= this.config.minReliabilityThreshold &&
      qualityScore >= this.config.minQualityThreshold;

    return { valid, quality };
  }

  /**
   * Get validation summary.
   */
  getSummary(report: ValidationReport): string {
    const parts: string[] = [];

    parts.push(`Assessment Valid: ${report.isValid ? 'Yes' : 'No'}`);
    parts.push(`Reliability: ${report.reliabilityScore}%`);
    parts.push(`Quality: ${report.qualityLevel}`);
    parts.push(`Issues: ${report.issues.length}`);
    parts.push(`Retest: ${report.retestRecommendation.shouldRetest ? 'Recommended' : 'Not Needed'}`);

    return parts.join(' | ');
  }
}

/**
 * Factory function for AssessmentValidator.
 */
export function createAssessmentValidator(
  config?: Partial<ValidationConfig>
): AssessmentValidator {
  return new AssessmentValidator(config);
}

// Re-export engines for direct access
export {
  ConsistencyEngine,
  createConsistencyEngine,
} from './consistency-engine';

export {
  ResponsePatternDetector,
  createResponsePatternDetector,
} from './response-pattern-detector';

export {
  ReliabilityEngine,
  createReliabilityEngine,
} from './reliability-engine';

export {
  QualityScoreEngine,
  createQualityScoreEngine,
} from './quality-score-engine';
