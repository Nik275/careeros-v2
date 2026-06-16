/**
 * Recommendation Audit Engine
 *
 * Provides complete audit trail for every recommendation including:
 * - Evidence used
 * - Engines involved
 * - Confidence basis
 * - Opportunity costs
 * - Uncertainty sources
 */

import {
  RecommendationAuditReport,
  ValidationTimestamp,
  ValidationId,
  DEFAULT_VALIDATION_CONFIG,
  ValidationConfig,
} from './validation-types';

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface AuditConfig {
  // Audit depth
  verifyEvidence: boolean;
  checkEngineAgreement: boolean;
  validateOpportunityCosts: boolean;
  assessUncertainty: boolean;

  // Thresholds
  minEvidenceStrength: number;
  minEngineContribution: number;
  maxAcceptableRisk: 'low' | 'medium' | 'high';

  // Output settings
  includeRawData: boolean;
  maxEvidenceItems: number;
  maxUncertaintyItems: number;
}

export const DEFAULT_AUDIT_CONFIG: AuditConfig = {
  verifyEvidence: true,
  checkEngineAgreement: true,
  validateOpportunityCosts: true,
  assessUncertainty: true,
  minEvidenceStrength: 0.5,
  minEngineContribution: 0.1,
  maxAcceptableRisk: 'medium',
  includeRawData: false,
  maxEvidenceItems: 20,
  maxUncertaintyItems: 10,
};

// ============================================================================
// INPUTS
// ============================================================================

export interface AuditInput {
  recommendationId: string;
  studentId: string;
  timestamp: ValidationTimestamp;

  recommendation: {
    careerId: string;
    careerName: string;
    rank: number;
    confidence: number;
    score: number;
  };

  evidence: Array<{
    engine: string;
    type: string;
    description: string;
    strength: number;
    source?: string;
    verifiable?: boolean;
  }>;

  engines: Array<{
    id: string;
    contribution: number;
    confidence: number;
    factors: string[];
  }>;

  opportunityCosts: {
    sacrificed: Array<{
      careerId: string;
      careerName: string;
      value: number;
    }>;
    reversibilityScore: number;
    switchCost: string;
  };

  uncertainties: Array<{
    source: string;
    impact: 'low' | 'medium' | 'high';
    mitigation?: string;
  }>;

  risks: Array<{
    type: string;
    likelihood: number;
    impact: 'low' | 'medium' | 'high' | 'severe';
    mitigation: string;
  }>;

  historicalOutcomes?: {
    similarRecommendations: number;
    successRate: number;
    sampleSize: number;
  };
}

// ============================================================================
// ENGINE
// ============================================================================

export class RecommendationAuditEngine {
  private config: AuditConfig;
  private validationConfig: ValidationConfig;

  constructor(
    config: Partial<AuditConfig> = {},
    validationConfig: Partial<ValidationConfig> = {}
  ) {
    this.config = { ...DEFAULT_AUDIT_CONFIG, ...config };
    this.validationConfig = { ...DEFAULT_VALIDATION_CONFIG, ...validationConfig };
  }

  /**
   * Audit a single recommendation
   */
  auditRecommendation(input: AuditInput): RecommendationAuditReport {
    const auditId = `audit-${input.recommendationId}-${Date.now()}`;
    const generatedAt = Date.now();

    // Audit evidence
    const evidenceAudit = this.auditEvidence(input.evidence);

    // Audit engine involvement
    const engineAudit = this.auditEngines(input.engines);

    // Audit confidence basis
    const confidenceBasis = this.auditConfidenceBasis(
      input.recommendation.confidence,
      input.evidence,
      input.engines,
      input.historicalOutcomes
    );

    // Audit opportunity costs
    const opportunityCosts = this.auditOpportunityCosts(
      input.opportunityCosts,
      input.recommendation
    );

    // Audit uncertainties
    const uncertainties = this.auditUncertainties(input.uncertainties, input.risks);

    // Generate findings
    const findings = this.generateFindings(
      evidenceAudit,
      engineAudit,
      confidenceBasis,
      opportunityCosts,
      uncertainties
    );

    // Determine verdict
    const verdict = this.determineVerdict(findings, input.recommendation.confidence);

    return {
      auditId,
      generatedAt,
      recommendationId: input.recommendationId,
      studentId: input.studentId,
      recommendation: input.recommendation,
      evidence: evidenceAudit,
      engines: engineAudit,
      confidenceBasis,
      opportunityCosts,
      uncertainties,
      findings,
      verdict,
    };
  }

  /**
   * Batch audit multiple recommendations
   */
  auditRecommendations(inputs: AuditInput[]): RecommendationAuditReport[] {
    return inputs.map(input => this.auditRecommendation(input));
  }

  /**
   * Quick audit check
   */
  quickAudit(input: AuditInput): {
    trustworthy: boolean;
    confidence: number;
    issues: string[];
  } {
    const report = this.auditRecommendation(input);
    return {
      trustworthy: report.verdict.trustworthy,
      confidence: report.verdict.confidence,
      issues: report.findings.weaknesses,
    };
  }

  /**
   * Compare audit reports
   */
  compareAudits(
    auditA: RecommendationAuditReport,
    auditB: RecommendationAuditReport
  ): {
    evidenceDifference: number;
    confidenceDifference: number;
    engineOverlap: number;
    moreTrustworthy: 'A' | 'B' | 'tie';
  } {
    const evidenceDiff = Math.abs(auditA.evidence.totalEvidencePieces - auditB.evidence.totalEvidencePieces);
    const confidenceDiff = Math.abs(auditA.recommendation.confidence - auditB.recommendation.confidence);

    const enginesA = new Set(auditA.engines.map(e => e.engineId));
    const enginesB = new Set(auditB.engines.map(e => e.engineId));
    const intersection = [...enginesA].filter(e => enginesB.has(e));
    const union = [...new Set([...enginesA, ...enginesB])];
    const engineOverlap = union.length > 0 ? intersection.length / union.length : 0;

    let moreTrustworthy: 'A' | 'B' | 'tie' = 'tie';
    if (auditA.verdict.confidence > auditB.verdict.confidence + 10) {
      moreTrustworthy = 'A';
    } else if (auditB.verdict.confidence > auditA.verdict.confidence + 10) {
      moreTrustworthy = 'B';
    }

    return {
      evidenceDifference: evidenceDiff,
      confidenceDifference: confidenceDiff,
      engineOverlap,
      moreTrustworthy,
    };
  }

  /**
   * Get current config
   */
  getConfig(): AuditConfig {
    return { ...this.config };
  }

  /**
   * Update config
   */
  updateConfig(config: Partial<AuditConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private auditEvidence(
    evidence: AuditInput['evidence']
  ): RecommendationAuditReport['evidence'] {
    const auditedSources = evidence.slice(0, this.config.maxEvidenceItems).map(e => ({
      engine: e.engine,
      evidenceType: e.type,
      description: e.description,
      strength: e.strength,
      verifiable: e.verifiable ?? this.isVerifiable(e),
    }));

    const verifiableCount = auditedSources.filter(e => e.verifiable).length;
    const quality =
      evidence.length > 0
        ? (evidence.reduce((sum, e) => sum + e.strength, 0) / evidence.length) * 100
        : 0;

    return {
      sources: auditedSources,
      totalEvidencePieces: evidence.length,
      evidenceQuality: Math.round(quality),
    };
  }

  private isVerifiable(evidence: AuditInput['evidence'][0]): boolean {
    // Evidence is verifiable if it has a clear source
    return !!evidence.source && evidence.source !== 'inferred';
  }

  private auditEngines(
    engines: AuditInput['engines']
  ): RecommendationAuditReport['engines'] {
    return engines
      .filter(e => e.contribution >= this.config.minEngineContribution)
      .map(e => ({
        engineId: e.id,
        contribution: Math.round(e.contribution * 100) / 100,
        confidence: e.confidence,
        keyFactors: e.factors.slice(0, 5),
      }));
  }

  private auditConfidenceBasis(
    confidence: number,
    evidence: AuditInput['evidence'],
    engines: AuditInput['engines'],
    historicalOutcomes?: AuditInput['historicalOutcomes']
  ): RecommendationAuditReport['confidenceBasis'] {
    const primaryFactors: string[] = [];
    const supportingFactors: string[] = [];
    const detractingFactors: string[] = [];

    // Analyze evidence strengths
    const strongEvidence = evidence.filter(e => e.strength >= 0.8);
    const weakEvidence = evidence.filter(e => e.strength < 0.5);

    for (const e of strongEvidence.slice(0, 3)) {
      primaryFactors.push(`${e.engine}: ${e.type}`);
    }

    for (const e of evidence.filter(e => e.strength >= 0.5 && e.strength < 0.8).slice(0, 3)) {
      supportingFactors.push(`${e.engine}: ${e.type}`);
    }

    for (const e of weakEvidence.slice(0, 2)) {
      detractingFactors.push(`Weak ${e.type} evidence from ${e.engine}`);
    }

    // Check engine agreement
    const avgEngineConfidence =
      engines.length > 0
        ? engines.reduce((sum, e) => sum + e.confidence, 0) / engines.length
        : 0;

    if (avgEngineConfidence < confidence - 10) {
      detractingFactors.push('Fusion confidence exceeds average engine confidence');
    }

    return {
      primaryFactors,
      supportingFactors,
      detractingFactors,
      sampleSize: historicalOutcomes?.sampleSize ?? 0,
      historicalAccuracy: historicalOutcomes
        ? Math.round(historicalOutcomes.successRate * 100)
        : 0,
    };
  }

  private auditOpportunityCosts(
    costs: AuditInput['opportunityCosts'],
    recommendation: AuditInput['recommendation']
  ): RecommendationAuditReport['opportunityCosts'] {
    return {
      sacrificedOptions: costs.sacrificed.map(s => ({
        careerId: s.careerId,
        careerName: s.careerName,
        potentialValue: Math.round(s.value),
      })),
      reversibilityScore: Math.round(costs.reversibilityScore * 100),
      switchCost: costs.switchCost,
    };
  }

  private auditUncertainties(
    uncertainties: AuditInput['uncertainties'],
    risks: AuditInput['risks']
  ): RecommendationAuditReport['uncertainties'] {
    const audited = uncertainties.slice(0, this.config.maxUncertaintyItems).map(u => ({
      source: u.source,
      impact: u.impact,
      mitigation: u.mitigation || 'No mitigation identified',
    }));

    // Add risks as uncertainties if significant
    for (const risk of risks.filter(r => r.impact === 'high' || r.impact === 'severe')) {
      audited.push({
        source: `Risk: ${risk.type}`,
        impact: risk.impact === 'severe' ? 'high' : 'medium',
        mitigation: risk.mitigation,
      });
    }

    return audited;
  }

  private generateFindings(
    evidence: RecommendationAuditReport['evidence'],
    engines: RecommendationAuditReport['engines'],
    confidenceBasis: RecommendationAuditReport['confidenceBasis'],
    opportunityCosts: RecommendationAuditReport['opportunityCosts'],
    uncertainties: RecommendationAuditReport['uncertainties']
  ): RecommendationAuditReport['findings'] {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const risks: string[] = [];
    const recommendations: string[] = [];

    // Evidence analysis
    if (evidence.totalEvidencePieces >= 5) {
      strengths.push(`Strong evidence base (${evidence.totalEvidencePieces} pieces)`);
    } else {
      weaknesses.push(`Limited evidence (${evidence.totalEvidencePieces} pieces)`);
      recommendations.push('Gather more supporting evidence');
    }

    if (evidence.evidenceQuality >= 70) {
      strengths.push('High-quality evidence');
    } else if (evidence.evidenceQuality < 50) {
      weaknesses.push('Low evidence quality');
    }

    const verifiableRatio =
      evidence.sources.length > 0
        ? evidence.sources.filter(e => e.verifiable).length / evidence.sources.length
        : 0;
    if (verifiableRatio >= 0.7) {
      strengths.push('Most evidence is verifiable');
    } else {
      weaknesses.push('Much evidence is unverifiable');
    }

    // Engine analysis
    if (engines.length >= 3) {
      strengths.push(`Multiple engines support recommendation (${engines.length})`);
    } else {
      weaknesses.push(`Limited engine diversity (${engines.length})`);
    }

    // Confidence analysis
    if (confidenceBasis.historicalAccuracy >= 70) {
      strengths.push(`Good historical track record (${confidenceBasis.historicalAccuracy}%)`);
    } else if (confidenceBasis.historicalAccuracy > 0 && confidenceBasis.historicalAccuracy < 50) {
      risks.push('Poor historical accuracy for similar recommendations');
    }

    if (confidenceBasis.sampleSize >= 100) {
      strengths.push('Large historical sample size');
    } else if (confidenceBasis.sampleSize > 0 && confidenceBasis.sampleSize < 30) {
      weaknesses.push('Small historical sample size');
    }

    // Opportunity cost analysis
    if (opportunityCosts.reversibilityScore >= 70) {
      strengths.push('High reversibility - easy to pivot if needed');
    } else if (opportunityCosts.reversibilityScore < 40) {
      risks.push('Low reversibility - difficult to change course');
    }

    if (opportunityCosts.sacrificedOptions.length <= 2) {
      strengths.push('Low opportunity cost');
    } else {
      weaknesses.push('Multiple good alternatives being sacrificed');
    }

    // Uncertainty analysis
    const highImpactUncertainties = uncertainties.filter(u => u.impact === 'high');
    if (highImpactUncertainties.length === 0) {
      strengths.push('No high-impact uncertainties');
    } else {
      risks.push(`${highImpactUncertainties.length} high-impact uncertainties`);
      recommendations.push('Address key uncertainties before committing');
    }

    return { strengths, weaknesses, risks, recommendations };
  }

  private determineVerdict(
    findings: RecommendationAuditReport['findings'],
    confidence: number
  ): RecommendationAuditReport['verdict'] {
    const trustworthy =
      findings.weaknesses.length <= 2 &&
      findings.risks.length <= 1 &&
      confidence >= 60;

    const confidenceScore = Math.round(
      confidence * 0.4 +
        (findings.strengths.length / Math.max(1, findings.strengths.length + findings.weaknesses.length)) * 40 +
        (findings.risks.length === 0 ? 20 : findings.risks.length === 1 ? 10 : 0)
    );

    const caveats: string[] = [];
    if (findings.weaknesses.length > 0) {
      caveats.push(`Consider: ${findings.weaknesses[0]}`);
    }
    if (findings.risks.length > 0) {
      caveats.push(`Risk: ${findings.risks[0]}`);
    }

    return {
      trustworthy,
      confidence: confidenceScore,
      caveats,
    };
  }
}

export default RecommendationAuditEngine;
