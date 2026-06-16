/**
 * Uncertainty Engine
 *
 * Detects when the system should admit uncertainty.
 * Prevents fake certainty by identifying:
 * - Insufficient evidence
 * - Conflicting signals
 * - Contradictory profiles
 * - Data gaps
 * - Novel situations
 */

import {
  UncertaintyAssessment,
  ValidationTimestamp,
  ValidationId,
  DEFAULT_VALIDATION_CONFIG,
  ValidationConfig,
} from './validation-types';

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface UncertaintyConfig {
  // Thresholds for admitting uncertainty
  admitUncertaintyThreshold: number; // Confidence below this requires admission
  gatherMoreDataThreshold: number; // Confidence below this requires more data
  escalateThreshold: number; // Confidence below this requires escalation

  // Evidence thresholds
  minEvidencePieces: number;
  minEngineAgreement: number; // Minimum agreeing engines
  maxConflictSeverity: number; // Maximum acceptable conflict

  // Sample size thresholds
  minSampleSize: number;
  minHistoricalDataPoints: number;

  // Statistical thresholds
  maxVariance: number; // Maximum acceptable variance in recommendations
  minConfidenceInterval: number; // Minimum acceptable confidence interval
}

export const DEFAULT_UNCERTAINTY_CONFIG: UncertaintyConfig = {
  admitUncertaintyThreshold: 60,
  gatherMoreDataThreshold: 50,
  escalateThreshold: 40,
  minEvidencePieces: 3,
  minEngineAgreement: 2,
  maxConflictSeverity: 0.6,
  minSampleSize: 30,
  minHistoricalDataPoints: 10,
  maxVariance: 0.3,
  minConfidenceInterval: 0.2,
};

// ============================================================================
// INPUTS
// ============================================================================

export interface UncertaintyInput {
  studentId: string;
  profile: {
    completeness: number; // 0-1
    dataPoints: number;
    lastUpdated: ValidationTimestamp;
  };
  recommendations: Array<{
    careerId: string;
    confidence: number;
    evidenceCount: number;
    engines: string[];
  }>;
  engines: Record<string, {
    confidence: number;
    evidence: number;
    variance: number;
  }>;
  conflicts: Array<{
    type: string;
    severity: number;
    description: string;
  }>;
  historicalData: {
    sampleSize: number;
    outcomes: number;
    recency: number; // days
  };
}

// ============================================================================
// ENGINE
// ============================================================================

export class UncertaintyEngine {
  private config: UncertaintyConfig;
  private validationConfig: ValidationConfig;

  constructor(
    config: Partial<UncertaintyConfig> = {},
    validationConfig: Partial<ValidationConfig> = {}
  ) {
    this.config = { ...DEFAULT_UNCERTAINTY_CONFIG, ...config };
    this.validationConfig = { ...DEFAULT_VALIDATION_CONFIG, ...validationConfig };
  }

  /**
   * Assess uncertainty for a student profile and recommendations
   */
  assessUncertainty(input: UncertaintyInput): UncertaintyAssessment {
    // Handle undefined/null input gracefully
    if (!input) {
      return this.createEmptyAssessment('unknown', Date.now());
    }

    // Ensure engines is always an object
    const safeInput = {
      ...input,
      engines: input.engines || {},
      recommendations: input.recommendations || [],
      conflicts: input.conflicts || [],
      profile: input.profile || { completeness: 0, dataPoints: 0, lastUpdated: Date.now() },
      historicalData: input.historicalData || { sampleSize: 0, outcomes: 0, recency: 0 },
    };

    const assessmentId = `uncertainty-${safeInput.studentId}-${Date.now()}`;
    const generatedAt = Date.now();

    // Detect uncertainty sources
    const sources = this.detectUncertaintySources(safeInput);

    // Identify evidence gaps
    const evidenceGaps = this.identifyEvidenceGaps(safeInput);

    // Calculate confidence bounds
    const confidenceBounds = this.calculateConfidenceBounds(safeInput);

    // Determine system response
    const systemResponse = this.determineSystemResponse(
      confidenceBounds.pointEstimate,
      sources,
      evidenceGaps
    );

    // Calculate overall uncertainty
    const overallUncertainty = this.calculateOverallUncertainty(
      sources,
      evidenceGaps,
      confidenceBounds
    );

    return {
      assessmentId,
      generatedAt,
      studentId: safeInput.studentId,
      overallUncertainty,
      sources,
      evidenceGaps,
      confidenceBounds,
      systemResponse,
    };
  }

  private createEmptyAssessment(studentId: string, generatedAt: number): UncertaintyAssessment {
    return {
      assessmentId: `uncertainty-${studentId}-${generatedAt}`,
      generatedAt,
      studentId,
      overallUncertainty: {
        level: 'critical',
        score: 0,
        admissionRequired: true,
        explanation: 'No input data available',
      },
      sources: [{
        type: 'data-gap',
        severity: 'critical',
        description: 'Input data is missing or invalid',
        affectedEngines: ['all'],
        recommendation: 'Provide valid input data',
      }],
      evidenceGaps: [],
      confidenceBounds: {
        pointEstimate: 0,
        lowerBound: 0,
        upperBound: 0,
        confidenceInterval: 0,
        lower: 0,
        upper: 0,
      },
      systemResponse: {
        shouldDefer: true,
        shouldAdmitUncertainty: true,
        shouldGatherMoreData: true,
        shouldEscalate: true,
        alternativeApproaches: ['Provide valid input data'],
        explanation: 'Critical: No input data available',
      },
    };
  }

  /**
   * Quick check if uncertainty should be admitted
   */
  shouldAdmitUncertainty(input: UncertaintyInput): {
    admit: boolean;
    reason: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  } {
    const avgConfidence =
      input.recommendations.reduce((sum, r) => sum + r.confidence, 0) /
      Math.max(1, input.recommendations.length);

    if (avgConfidence < this.config.escalateThreshold) {
      return { admit: true, reason: 'Critical confidence level', severity: 'critical' };
    }

    if (avgConfidence < this.config.gatherMoreDataThreshold) {
      return { admit: true, reason: 'Low confidence requires more data', severity: 'high' };
    }

    if (avgConfidence < this.config.admitUncertaintyThreshold) {
      return { admit: true, reason: 'Moderate uncertainty', severity: 'medium' };
    }

    // Check for conflicts
    const severeConflicts = input.conflicts.filter(c => c.severity > this.config.maxConflictSeverity);
    if (severeConflicts.length > 0) {
      return {
        admit: true,
        reason: `Conflicting signals detected: ${severeConflicts[0].description}`,
        severity: 'high',
      };
    }

    // Check evidence sufficiency
    const totalEvidence = input.recommendations.reduce((sum, r) => sum + r.evidenceCount, 0);
    if (totalEvidence < this.config.minEvidencePieces) {
      return {
        admit: true,
        reason: 'Insufficient evidence',
        severity: 'medium',
      };
    }

    return { admit: false, reason: 'Confidence level acceptable', severity: 'low' };
  }

  /**
   * Calculate uncertainty score
   */
  calculateUncertaintyScore(input: UncertaintyInput): number {
    let score = 0;

    // Confidence contribution (40%)
    const avgConfidence =
      input.recommendations.reduce((sum, r) => sum + r.confidence, 0) /
      Math.max(1, input.recommendations.length);
    score += (100 - avgConfidence) * 0.4;

    // Conflict contribution (20%)
    const maxConflict = Math.max(0, ...input.conflicts.map(c => c.severity * 100));
    score += maxConflict * 0.2;

    // Evidence contribution (20%)
    const evidenceRatio = Math.min(
      1,
      input.recommendations.reduce((sum, r) => sum + r.evidenceCount, 0) /
        (this.config.minEvidencePieces * 3)
    );
    score += (1 - evidenceRatio) * 100 * 0.2;

    // Data quality contribution (20%)
    const dataQuality =
      (Math.min(1, input.historicalData.sampleSize / this.config.minSampleSize) +
        Math.min(1, input.profile.completeness)) /
      2;
    score += (1 - dataQuality) * 100 * 0.2;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Generate uncertainty explanation
   */
  generateExplanation(assessment: UncertaintyAssessment): string {
    const parts: string[] = [];

    parts.push(`Uncertainty level: ${assessment.overallUncertainty.level}`);

    if (assessment.sources.length > 0) {
      parts.push(`\nKey uncertainty sources:`);
      for (const source of assessment.sources.slice(0, 3)) {
        parts.push(`- ${source.description} (${source.severity})`);
      }
    }

    if (assessment.evidenceGaps.length > 0) {
      parts.push(`\nEvidence gaps:`);
      for (const gap of assessment.evidenceGaps.slice(0, 3)) {
        parts.push(`- ${gap.area}: ${gap.suggestion}`);
      }
    }

    parts.push(`\nRecommended action: ${assessment.systemResponse.shouldDefer ? 'Defer recommendation' : 
      assessment.systemResponse.shouldGatherMoreData ? 'Gather more data' : 
      assessment.systemResponse.shouldEscalate ? 'Escalate to human' : 'Proceed with caution'}`);

    return parts.join('\n');
  }

  /**
   * Get current config
   */
  getConfig(): UncertaintyConfig {
    return { ...this.config };
  }

  /**
   * Update config
   */
  updateConfig(config: Partial<UncertaintyConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private detectUncertaintySources(input: UncertaintyInput): UncertaintyAssessment['sources'] {
    const sources: UncertaintyAssessment['sources'] = [];

    // Check for insufficient evidence
    const totalEvidence = input.recommendations.reduce((sum, r) => sum + r.evidenceCount, 0);
    if (totalEvidence < this.config.minEvidencePieces) {
      sources.push({
        type: 'insufficient-evidence',
        severity: 'high',
        description: `Only ${totalEvidence} evidence pieces available (minimum ${this.config.minEvidencePieces})`,
        affectedEngines: input.recommendations.filter(r => r.evidenceCount < 2).map(r => r.engines).flat(),
        recommendation: 'Gather more assessment data',
      });
    }

    // Check for conflicting signals
    const confidences = input.recommendations.map(r => r.confidence);
    const confidenceVariance = this.calculateVariance(confidences);

    // Also check engine confidence variance
    const engineConfidences = Object.values(input.engines || {}).map(e => e.confidence);
    const engineVariance = engineConfidences.length > 1 ? this.calculateVariance(engineConfidences) : 0;

    if (confidenceVariance > this.config.maxVariance * 1000 || engineVariance > this.config.maxVariance * 1000) {
      sources.push({
        type: 'conflicting-signals',
        severity: 'medium',
        description: `High variance in confidence scores (${confidenceVariance.toFixed(1)})`,
        affectedEngines: Object.keys(input.engines || {}),
        recommendation: 'Reconcile conflicting engine outputs',
      });
    }

    // Check for contradictory profile
    const severeConflicts = input.conflicts.filter(c => c.severity > this.config.maxConflictSeverity);
    if (severeConflicts.length > 0) {
      for (const conflict of severeConflicts) {
        sources.push({
          type: 'contradictory-profile',
          severity: conflict.severity > 0.8 ? 'critical' : 'high',
          description: conflict.description,
          affectedEngines: ['psychology', 'contradiction'],
          recommendation: 'Resolve profile contradictions before proceeding',
        });
      }
    }

    // Check for any conflicts (not just severe) - adds extra uncertainty when multiple conflicts exist
    if (input.conflicts.length >= 3) {
      sources.push({
        type: 'contradictory-profile',
        severity: 'medium',
        description: `Multiple conflicts detected (${input.conflicts.length})`,
        affectedEngines: ['psychology', 'contradiction'],
        recommendation: 'Review all profile contradictions',
      });
    }

    // Check for data gaps
    if (input.profile.completeness < 0.7) {
      sources.push({
        type: 'data-gap',
        severity: 'medium',
        description: `Profile only ${(input.profile.completeness * 100).toFixed(0)}% complete`,
        affectedEngines: ['all'],
        recommendation: 'Complete remaining profile sections',
      });
    }

    // Check for novel situation
    if (input.historicalData.sampleSize < this.config.minSampleSize) {
      sources.push({
        type: 'novel-situation',
        severity: 'medium',
        description: `Limited historical data (${input.historicalData.sampleSize} samples)`,
        affectedEngines: ['learning'],
        recommendation: 'Use conservative estimates',
      });
    }

    // Check for stale data
    if (input.historicalData.recency > 365) {
      sources.push({
        type: 'data-gap',
        severity: 'low',
        description: `Historical data is ${input.historicalData.recency} days old`,
        affectedEngines: ['learning', 'career'],
        recommendation: 'Update with recent outcomes',
      });
    }

    return sources;
  }

  private identifyEvidenceGaps(input: UncertaintyInput): UncertaintyAssessment['evidenceGaps'] {
    const gaps: UncertaintyAssessment['evidenceGaps'] = [];

    // Check engine coverage
    const engineCoverage = Object.keys(input.engines);
    const expectedEngines = ['psychology', 'career', 'mentor', 'learning'];
    const missingEngines = expectedEngines.filter(e => !engineCoverage.includes(e));

    if (missingEngines.length > 0) {
      gaps.push({
        area: 'Engine Coverage',
        impact: 'high',
        suggestion: `Run ${missingEngines.join(', ')} assessments`,
      });
    }

    // Check for low confidence engines
    for (const [engineId, data] of Object.entries(input.engines)) {
      if (data.confidence < 50) {
        gaps.push({
          area: `${engineId} Engine`,
          impact: 'medium',
          suggestion: `Strengthen ${engineId} assessment evidence`,
        });
      }
    }

    // Check sample size
    if (input.historicalData.sampleSize < this.config.minSampleSize) {
      gaps.push({
        area: 'Historical Outcomes',
        impact: 'medium',
        suggestion: `Collect more outcome data (currently ${input.historicalData.sampleSize}, need ${this.config.minSampleSize})`,
      });
    }

    return gaps;
  }

  private calculateConfidenceBounds(input: UncertaintyInput): UncertaintyAssessment['confidenceBounds'] {
    const confidences = input.recommendations.map(r => r.confidence);

    if (confidences.length === 0) {
      return {
        pointEstimate: 0,
        lowerBound: 0,
        upperBound: 0,
        confidenceInterval: 0,
      };
    }

    const mean = confidences.reduce((a, b) => a + b, 0) / confidences.length;
    const std = Math.sqrt(this.calculateVariance(confidences));

    // 95% confidence interval
    const margin = 1.96 * std;
    const lowerBound = Math.max(0, mean - margin);
    const upperBound = Math.min(100, mean + margin);

    return {
      pointEstimate: Math.round(mean),
      lowerBound: Math.round(lowerBound),
      upperBound: Math.round(upperBound),
      confidenceInterval: Math.round(upperBound - lowerBound),
    };
  }

  private determineSystemResponse(
    pointEstimate: number,
    sources: UncertaintyAssessment['sources'],
    gaps: UncertaintyAssessment['evidenceGaps']

  ): UncertaintyAssessment['systemResponse'] {
    const criticalSources = sources.filter(s => s.severity === 'critical');
    const highSources = sources.filter(s => s.severity === 'high');

    // Determine appropriate response
    let shouldDefer = false;
    let shouldGatherMoreData = false;
    let shouldEscalate = false;
    const alternativeApproaches: string[] = [];

    if (criticalSources.length > 0 || pointEstimate < this.config.escalateThreshold) {
      shouldEscalate = true;
      alternativeApproaches.push('Human expert review required');
    }

    if (highSources.length > 0 || gaps.length >= 3 || sources.length >= 2) {
      shouldGatherMoreData = true;
      alternativeApproaches.push('Complete additional assessments');
    }

    if (pointEstimate < this.config.admitUncertaintyThreshold) {
      shouldDefer = true;
      alternativeApproaches.push('Defer until confidence improves');
    }

    if (sources.some(s => s.type === 'conflicting-signals')) {
      alternativeApproaches.push('Reconcile engine conflicts');
    }

    if (sources.some(s => s.type === 'novel-situation')) {
      alternativeApproaches.push('Use conservative estimates');
    }

    return {
      shouldDefer,
      shouldGatherMoreData,
      shouldEscalate,
      alternativeApproaches,
    };
  }

  private calculateOverallUncertainty(
    sources: UncertaintyAssessment['sources'],
    gaps: UncertaintyAssessment['evidenceGaps'],
    bounds: UncertaintyAssessment['confidenceBounds']
  ): UncertaintyAssessment['overallUncertainty'] {
    // Handle critical case of 0% confidence
    if (bounds.pointEstimate === 0) {
      return {
        level: 'critical',
        score: 100,
        admissionRequired: true,
        explanation: 'Zero confidence indicates critical uncertainty',
      };
    }

    // Calculate uncertainty score
    let score = 0;

    // Source severity contribution
    for (const source of sources) {
      score +=
        source.severity === 'critical' ? 30 :
        source.severity === 'high' ? 20 :
        source.severity === 'medium' ? 10 :
        5;
    }

    // Bonus for multiple sources - more sources = higher uncertainty
    if (sources.length >= 3) {
      score += 10;
    } else if (sources.length >= 2) {
      score += 5;
    }

    // Gap contribution
    score += gaps.length * 5;

    // Confidence interval contribution
    score += bounds.confidenceInterval * 0.5;

    // Point estimate contribution - higher weight for low confidence
    score += (100 - bounds.pointEstimate) * 0.6;

    score = Math.min(100, score);

    // Determine level
    let level: UncertaintyAssessment['overallUncertainty']['level'];
    if (score < 10) level = 'none';
    else if (score < 30) level = 'low';
    else if (score < 50) level = 'medium';
    else if (score < 75) level = 'high';
    else level = 'critical';

    // Check for low confidence admission
    const avgConfidence = bounds.pointEstimate;
    const lowConfidenceAdmission = avgConfidence < this.config.admitUncertaintyThreshold;

    return {
      level,
      score: Math.round(score),
      admissionRequired: score >= 50 || sources.some(s => s.severity === 'critical') || lowConfidenceAdmission,
    };
  }

  private calculateVariance(values: number[]): number {
    if (values.length < 2) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  }
}

export default UncertaintyEngine;
