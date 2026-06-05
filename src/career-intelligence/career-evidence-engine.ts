/**
 * CareerOS Career Intelligence Engine - Career Evidence Engine
 *
 * Phase C.1: Career Intelligence Engine
 *
 * Manages evidence and confidence scoring for career intelligence.
 *
 * @module career-evidence-engine
 * @version 1.0.0
 */

import type {
  ScoredDimension,
  DimensionEvidence,
  EvidenceSourceType,
  CareerEvidence,
  CareerIntelligence,
} from './career-types';

/**
 * Manages evidence collection and confidence calculation for career data.
 *
 * Ensures every career score is backed by traceable evidence
 * with proper confidence weighting.
 */
export class CareerEvidenceEngine {
  private evidenceWeights: Map<EvidenceSourceType, number>;

  constructor() {
    // Initialize default evidence weights
    this.evidenceWeights = new Map([
      ['OCCUPATIONAL_DATA', 0.9],
      ['LABOR_STATISTICS', 0.95],
      ['INDUSTRY_REPORT', 0.85],
      ['PROFESSIONAL_SURVEY', 0.8],
      ['JOB_ANALYSIS', 0.9],
      ['EXPERT_ASSESSMENT', 0.75],
      ['SKILL_TAXONOMY', 0.85],
      ['EDUCATION_DATA', 0.8],
      ['MARKET_RESEARCH', 0.7],
    ]);
  }

  /**
   * Create a scored dimension with evidence.
   */
  createScoredDimension(
    score: number,
    evidence: DimensionEvidence[],
    baseConfidence?: number
  ): ScoredDimension {
    const normalizedScore = this.normalizeScore(score);
    const calculatedConfidence = this.calculateConfidence(evidence, baseConfidence);

    return {
      score: normalizedScore,
      confidence: calculatedConfidence,
      evidence: this.sortEvidenceByWeight(evidence),
      lastUpdated: new Date(),
    };
  }

  /**
   * Add evidence to an existing dimension.
   */
  addEvidence(
    dimension: ScoredDimension,
    newEvidence: DimensionEvidence
  ): ScoredDimension {
    const updatedEvidence = [...dimension.evidence, newEvidence];
    const newConfidence = this.calculateConfidence(updatedEvidence);

    // Recalculate score based on weighted evidence
    const newScore = this.recalculateScore(updatedEvidence);

    return {
      score: newScore,
      confidence: newConfidence,
      evidence: this.sortEvidenceByWeight(updatedEvidence),
      lastUpdated: new Date(),
    };
  }

  /**
   * Calculate confidence score from evidence.
   */
  calculateConfidence(
    evidence: DimensionEvidence[],
    baseConfidence?: number
  ): number {
    if (evidence.length === 0) {
      return baseConfidence ?? 30;
    }

    // Calculate weighted confidence from evidence
    let totalWeight = 0;
    let weightedConfidenceSum = 0;

    for (const item of evidence) {
      const sourceWeight = this.evidenceWeights.get(item.sourceType) ?? 0.5;
      const itemWeight = item.weight * sourceWeight;

      totalWeight += itemWeight;
      weightedConfidenceSum += itemWeight * 100;
    }

    // Base confidence from number of sources
    const sourceBonus = Math.min(20, evidence.length * 5);

    // Calculate final confidence
    let confidence = totalWeight > 0
      ? (weightedConfidenceSum / totalWeight) * 0.7 + 30
      : 30;

    confidence += sourceBonus;

    // Cap at 100
    return Math.min(100, Math.round(confidence));
  }

  /**
   * Recalculate score from evidence.
   */
  recalculateScore(evidence: DimensionEvidence[]): number {
    if (evidence.length === 0) return 50;

    let totalWeight = 0;
    let weightedSum = 0;

    for (const item of evidence) {
      const sourceWeight = this.evidenceWeights.get(item.sourceType) ?? 0.5;
      const itemWeight = item.weight * sourceWeight;

      // Extract score from evidence description if possible
      // Format expected: "Score: XX" or contains numeric value
      const scoreMatch = item.description.match(/score[:\s]*(\d+)/i);
      const evidenceScore = scoreMatch
        ? parseInt(scoreMatch[1], 10)
        : this.estimateScoreFromDescription(item.description);

      totalWeight += itemWeight;
      weightedSum += evidenceScore * itemWeight;
    }

    return totalWeight > 0
      ? Math.round(weightedSum / totalWeight)
      : 50;
  }

  /**
   * Estimate score from evidence description.
   */
  private estimateScoreFromDescription(description: string): number {
    const lowerDesc = description.toLowerCase();

    // High indicators
    if (lowerDesc.includes('very high') || lowerDesc.includes('extremely')) return 90;
    if (lowerDesc.includes('high') || lowerDesc.includes('significant')) return 75;

    // Medium indicators
    if (lowerDesc.includes('moderate') || lowerDesc.includes('average')) return 50;
    if (lowerDesc.includes('medium') || lowerDesc.includes('some')) return 50;

    // Low indicators
    if (lowerDesc.includes('low') || lowerDesc.includes('minimal')) return 25;
    if (lowerDesc.includes('very low') || lowerDesc.includes('little')) return 10;

    // Default
    return 50;
  }

  /**
   * Build career evidence summary.
   */
  buildCareerEvidence(career: CareerIntelligence): CareerEvidence {
    const allEvidence: DimensionEvidence[] = [];
    const primarySources = new Set<string>();

    // Collect all evidence from all dimensions
    const dimensions = [
      ...Object.values(career.cognitiveDemands),
      ...Object.values(career.motivationalDemands),
      ...Object.values(career.lifestyleCharacteristics),
      ...Object.values(career.workEnvironment),
      ...Object.values(career.careerRisks),
      ...Object.values(career.careerAdvantages),
    ];

    for (const dimension of dimensions) {
      for (const evidence of dimension.evidence) {
        allEvidence.push(evidence);
        primarySources.add(evidence.source);
      }
    }

    // Calculate overall confidence
    const overallConfidence = this.calculateOverallConfidence(dimensions);

    // Calculate evidence quality
    const evidenceQuality = this.calculateEvidenceQuality(allEvidence);

    // Calculate data freshness
    const dataFreshness = this.calculateDataFreshness(allEvidence);

    return {
      overallConfidence,
      sourceCount: allEvidence.length,
      primarySources: Array.from(primarySources).slice(0, 10),
      evidenceQuality,
      dataFreshness,
    };
  }

  /**
   * Calculate overall confidence across all dimensions.
   */
  calculateOverallConfidence(dimensions: ScoredDimension[]): number {
    if (dimensions.length === 0) return 0;

    const sum = dimensions.reduce((acc, dim) => acc + dim.confidence, 0);
    return Math.round(sum / dimensions.length);
  }

  /**
   * Calculate evidence quality score.
   */
  calculateEvidenceQuality(evidence: DimensionEvidence[]): number {
    if (evidence.length === 0) return 0;

    let qualitySum = 0;

    for (const item of evidence) {
      const sourceWeight = this.evidenceWeights.get(item.sourceType) ?? 0.5;
      const weightQuality = item.weight * 100;
      qualitySum += (sourceWeight * 0.5 + weightQuality * 0.5) * 100;
    }

    return Math.round(qualitySum / evidence.length);
  }

  /**
   * Calculate data freshness score.
   */
  calculateDataFreshness(evidence: DimensionEvidence[]): number {
    if (evidence.length === 0) return 0;

    const now = new Date().getTime();
    const oneYear = 365 * 24 * 60 * 60 * 1000;

    let freshnessSum = 0;

    for (const item of evidence) {
      const age = now - item.date.getTime();
      const freshness = Math.max(0, 100 - (age / oneYear) * 100);
      freshnessSum += freshness;
    }

    return Math.round(freshnessSum / evidence.length);
  }

  /**
   * Validate evidence for completeness.
   */
  validateEvidence(career: CareerIntelligence): {
    valid: boolean;
    issues: string[];
    coverage: number;
  } {
    const issues: string[] = [];
    let dimensionsWithEvidence = 0;
    let totalDimensions = 0;

    const checkDimension = (dimension: ScoredDimension, name: string) => {
      totalDimensions++;

      if (dimension.evidence.length === 0) {
        issues.push(`Missing evidence for ${name}`);
      } else {
        dimensionsWithEvidence++;
      }

      if (dimension.confidence < 50) {
        issues.push(`Low confidence (${dimension.confidence}%) for ${name}`);
      }

      // Check evidence age
      const oldEvidence = dimension.evidence.filter(
        (e) => new Date().getTime() - e.date.getTime() > 2 * 365 * 24 * 60 * 60 * 1000
      );
      if (oldEvidence.length > 0) {
        issues.push(`Outdated evidence for ${name}`);
      }
    };

    // Check all dimensions
    Object.entries(career.cognitiveDemands).forEach(([key, dim]) =>
      checkDimension(dim, `cognitive.${key}`)
    );
    Object.entries(career.motivationalDemands).forEach(([key, dim]) =>
      checkDimension(dim, `motivational.${key}`)
    );
    Object.entries(career.lifestyleCharacteristics).forEach(([key, dim]) =>
      checkDimension(dim, `lifestyle.${key}`)
    );
    Object.entries(career.workEnvironment).forEach(([key, dim]) =>
      checkDimension(dim, `workEnvironment.${key}`)
    );
    Object.entries(career.careerRisks).forEach(([key, dim]) =>
      checkDimension(dim, `risks.${key}`)
    );
    Object.entries(career.careerAdvantages).forEach(([key, dim]) =>
      checkDimension(dim, `advantages.${key}`)
    );

    const coverage = totalDimensions > 0
      ? Math.round((dimensionsWithEvidence / totalDimensions) * 100)
      : 0;

    return {
      valid: issues.length === 0,
      issues,
      coverage,
    };
  }

  /**
   * Create evidence from source.
   */
  createEvidence(
    sourceType: EvidenceSourceType,
    source: string,
    description: string,
    weight: number,
    date?: Date
  ): DimensionEvidence {
    return {
      sourceType,
      source,
      description,
      weight: Math.max(0, Math.min(1, weight)),
      date: date ?? new Date(),
    };
  }

  /**
   * Update evidence weights.
   */
  setEvidenceWeight(sourceType: EvidenceSourceType, weight: number): void {
    this.evidenceWeights.set(sourceType, Math.max(0, Math.min(1, weight)));
  }

  /**
   * Get evidence weight for source type.
   */
  getEvidenceWeight(sourceType: EvidenceSourceType): number {
    return this.evidenceWeights.get(sourceType) ?? 0.5;
  }

  /**
   * Normalize score to 0-100 range.
   */
  private normalizeScore(score: number): number {
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Sort evidence by weight (highest first).
   */
  private sortEvidenceByWeight(evidence: DimensionEvidence[]): DimensionEvidence[] {
    return [...evidence].sort((a, b) => b.weight - a.weight);
  }
}

/**
 * Factory function for CareerEvidenceEngine.
 */
export function createCareerEvidenceEngine(): CareerEvidenceEngine {
  return new CareerEvidenceEngine();
}
