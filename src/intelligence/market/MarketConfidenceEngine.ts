/**
 * CareerOS Market Intelligence - Market Confidence Engine
 *
 * Every market conclusion must contain confidence estimation.
 * 
 * Rules:
 * - Confidence is mandatory
 * - Confidence must propagate throughout the system
 * - No intelligence result can exist without confidence
 */

import type { MarketSignal, NormalizedMarketSignal } from './models/MarketSignal';
import type { MarketTrend } from './models/MarketTrend';
import type { CareerMarketProfile } from './models/CareerMarketProfile';
import type { MarketSnapshot } from './models/MarketSnapshot';
import { CONFIDENCE_FACTOR_WEIGHTS, CONFIDENCE_THRESHOLDS } from './constants/MarketWeights';

/**
 * Confidence calculation context.
 */
export interface ConfidenceContext {
  /** Number of signals */
  signalCount: number;

  /** Average signal quality (0-100) */
  averageSignalQuality: number;

  /** Source diversity (0-100) */
  sourceDiversity: number;

  /** Data freshness (0-100, 100 = most fresh) */
  dataFreshness: number;

  /** Consistency across sources (0-100) */
  consistency: number;

  /** Source reliability average (0-100) */
  sourceReliability: number;
}

/**
 * Confidence breakdown by factor.
 */
export interface ConfidenceBreakdown {
  overall: number;
  factors: {
    signalQuality: number;
    signalQuantity: number;
    sourceReliability: number;
    dataFreshness: number;
    consistency: number;
  };
  level: 'very_high' | 'high' | 'moderate' | 'low' | 'very_low';
  recommendations: string[];
}

/**
 * Confidence requirements for different use cases.
 */
export interface ConfidenceRequirements {
  /** Minimum confidence for career recommendation */
  recommendationMin: number;

  /** Minimum confidence for decision support */
  decisionSupportMin: number;

  /** Minimum confidence for trend analysis */
  trendAnalysisMin: number;

  /** Minimum confidence for profile display */
  profileDisplayMin: number;
}

/**
 * Default confidence requirements.
 */
export const DEFAULT_CONFIDENCE_REQUIREMENTS: ConfidenceRequirements = {
  recommendationMin: 70,
  decisionSupportMin: 60,
  trendAnalysisMin: 50,
  profileDisplayMin: 40,
};

/**
 * Calculates confidence for all market intelligence outputs.
 */
export class MarketConfidenceEngine {
  private requirements: ConfidenceRequirements;

  constructor(requirements?: Partial<ConfidenceRequirements>) {
    this.requirements = { ...DEFAULT_CONFIDENCE_REQUIREMENTS, ...requirements };
  }

  /**
   * Calculate overall confidence from context.
   */
  calculateConfidence(context: ConfidenceContext): ConfidenceBreakdown {
    // Calculate individual factor scores
    const signalQuality = this.calculateSignalQualityScore(context);
    const signalQuantity = this.calculateSignalQuantityScore(context);
    const sourceReliability = context.sourceReliability;
    const dataFreshness = context.dataFreshness;
    const consistency = context.consistency;

    // Calculate weighted overall confidence
    const factors = {
      signalQuality,
      signalQuantity,
      sourceReliability,
      dataFreshness,
      consistency,
    };

    const overall = Math.round(
      signalQuality * CONFIDENCE_FACTOR_WEIGHTS.signalQuality +
        signalQuantity * CONFIDENCE_FACTOR_WEIGHTS.signalQuantity +
        sourceReliability * CONFIDENCE_FACTOR_WEIGHTS.sourceReliability +
        dataFreshness * CONFIDENCE_FACTOR_WEIGHTS.dataFreshness +
        consistency * CONFIDENCE_FACTOR_WEIGHTS.consistency
    );

    // Determine level
    const level = this.getConfidenceLevel(overall);

    // Generate recommendations
    const recommendations = this.generateRecommendations(factors, overall);

    return {
      overall,
      factors,
      level,
      recommendations,
    };
  }

  /**
   * Calculate confidence for a market trend.
   */
  calculateTrendConfidence(
    trend: MarketTrend,
    signals: NormalizedMarketSignal[]
  ): ConfidenceBreakdown {
    const context: ConfidenceContext = {
      signalCount: trend.dataPoints,
      averageSignalQuality:
        signals.reduce((sum, s) => sum + s.confidence, 0) / Math.max(signals.length, 1),
      sourceDiversity: this.calculateSourceDiversity(signals),
      dataFreshness: this.calculateDataFreshness(signals),
      consistency: trend.strength, // Use trend strength as consistency proxy
      sourceReliability:
        signals.reduce((sum, s) => sum + this.getSourceReliability(s.source), 0) /
        Math.max(signals.length, 1),
    };

    return this.calculateConfidence(context);
  }

  /**
   * Calculate confidence for a career market profile.
   */
  calculateProfileConfidence(
    profile: CareerMarketProfile,
    signals: NormalizedMarketSignal[]
  ): ConfidenceBreakdown {
    const context: ConfidenceContext = {
      signalCount: signals.length,
      averageSignalQuality:
        signals.reduce((sum, s) => sum + s.confidence, 0) / Math.max(signals.length, 1),
      sourceDiversity: this.calculateSourceDiversity(signals),
      dataFreshness: this.calculateDataFreshness(signals),
      consistency: this.calculateProfileConsistency(profile),
      sourceReliability:
        signals.reduce((sum, s) => sum + this.getSourceReliability(s.source), 0) /
        Math.max(signals.length, 1),
    };

    return this.calculateConfidence(context);
  }

  /**
   * Calculate confidence for a market snapshot.
   */
  calculateSnapshotConfidence(
    snapshot: MarketSnapshot,
    signals: NormalizedMarketSignal[]
  ): ConfidenceBreakdown {
    const context: ConfidenceContext = {
      signalCount: snapshot.signalSummary.totalSignals,
      averageSignalQuality: snapshot.signalSummary.averageSignalQuality,
      sourceDiversity: this.calculateSourceDiversityFromSummary(snapshot.signalSummary.bySource),
      dataFreshness: Math.max(0, 100 - snapshot.dataFreshness * 2), // Convert hours to score
      consistency: this.calculateSnapshotConsistency(snapshot),
      sourceReliability: 75, // Default for aggregated data
    };

    return this.calculateConfidence(context);
  }

  /**
   * Validate if confidence meets requirements.
   */
  validateConfidence(
    confidence: number,
    useCase: keyof ConfidenceRequirements
  ): { valid: boolean; message: string } {
    const required = this.requirements[useCase];

    if (confidence >= required) {
      return { valid: true, message: 'Confidence meets requirements' };
    }

    return {
      valid: false,
      message: `Confidence ${confidence}% below required ${required}% for ${useCase}`,
    };
  }

  /**
   * Get minimum confidence for a use case.
   */
  getMinimumConfidence(useCase: keyof ConfidenceRequirements): number {
    return this.requirements[useCase];
  }

  /**
   * Calculate signal quality score.
   */
  private calculateSignalQualityScore(context: ConfidenceContext): number {
    // More signals generally increase confidence, but with diminishing returns
    const quantityScore = Math.min(100, context.signalCount * 10);
    return (context.averageSignalQuality + quantityScore) / 2;
  }

  /**
   * Calculate signal quantity score.
   */
  private calculateSignalQuantityScore(context: ConfidenceContext): number {
    // Score based on signal count with diminishing returns
    if (context.signalCount >= 20) return 100;
    if (context.signalCount >= 10) return 90;
    if (context.signalCount >= 5) return 75;
    if (context.signalCount >= 3) return 60;
    if (context.signalCount >= 1) return 40;
    return 0;
  }

  /**
   * Calculate source diversity score.
   */
  private calculateSourceDiversity(signals: NormalizedMarketSignal[]): number {
    const sources = new Set(signals.map((s) => s.source));
    const sourceCount = sources.size;

    if (sourceCount >= 5) return 100;
    if (sourceCount >= 4) return 90;
    if (sourceCount >= 3) return 75;
    if (sourceCount >= 2) return 60;
    return 40;
  }

  /**
   * Calculate source diversity from summary.
   */
  private calculateSourceDiversityFromSummary(bySource: Record<string, number>): number {
    const sourceCount = Object.keys(bySource).length;

    if (sourceCount >= 5) return 100;
    if (sourceCount >= 4) return 90;
    if (sourceCount >= 3) return 75;
    if (sourceCount >= 2) return 60;
    return 40;
  }

  /**
   * Calculate data freshness score.
   */
  private calculateDataFreshness(signals: NormalizedMarketSignal[]): number {
    if (signals.length === 0) return 0;

    const now = Date.now();
    const ages = signals.map((s) => now - s.timestamp.getTime());
    const averageAge = ages.reduce((a, b) => a + b, 0) / ages.length;
    const averageAgeDays = averageAge / (1000 * 60 * 60 * 24);

    // Score decreases with age
    if (averageAgeDays <= 7) return 100;
    if (averageAgeDays <= 30) return 85;
    if (averageAgeDays <= 90) return 65;
    if (averageAgeDays <= 180) return 40;
    return 20;
  }

  /**
   * Calculate profile consistency score.
   */
  private calculateProfileConsistency(profile: CareerMarketProfile): number {
    // Check if scores are within reasonable ranges
    const scores = [
      profile.demandScore,
      profile.salaryScore,
      profile.growthScore,
      profile.scarcityScore,
      profile.automationRiskScore,
      profile.futureResilienceScore,
    ];

    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    // High variance suggests inconsistency
    if (stdDev < 10) return 95;
    if (stdDev < 20) return 85;
    if (stdDev < 30) return 70;
    if (stdDev < 40) return 55;
    return 40;
  }

  /**
   * Calculate snapshot consistency score.
   */
  private calculateSnapshotConsistency(snapshot: MarketSnapshot): number {
    // Check if trends align with outlook
    const trendAlignment =
      (snapshot.demandTrend + snapshot.salaryTrend + snapshot.hiringTrend) / 3;

    const outlookAlignment = snapshot.futureOutlook - 50;

    const difference = Math.abs(trendAlignment - outlookAlignment);

    if (difference < 10) return 95;
    if (difference < 20) return 80;
    if (difference < 30) return 65;
    if (difference < 40) return 50;
    return 35;
  }

  /**
   * Get source reliability score.
   */
  private getSourceReliability(source: string): number {
    const reliabilityMap: Record<string, number> = {
      ncs_india: 95,
      nsdc: 95,
      nasscom: 90,
      government_report: 95,
      industry_association: 88,
      research_report: 85,
      linkedin: 82,
      naukri: 80,
      foundit: 78,
      indeed: 78,
      wef: 85,
      ilo: 88,
      news_media: 65,
      company_announcement: 75,
    };

    return reliabilityMap[source] ?? 70;
  }

  /**
   * Get confidence level label.
   */
  private getConfidenceLevel(confidence: number): ConfidenceBreakdown['level'] {
    if (confidence >= CONFIDENCE_THRESHOLDS.veryHigh) return 'very_high';
    if (confidence >= CONFIDENCE_THRESHOLDS.high) return 'high';
    if (confidence >= CONFIDENCE_THRESHOLDS.moderate) return 'moderate';
    if (confidence >= CONFIDENCE_THRESHOLDS.low) return 'low';
    return 'very_low';
  }

  /**
   * Generate improvement recommendations.
   */
  private generateRecommendations(
    factors: ConfidenceBreakdown['factors'],
    overall: number
  ): string[] {
    const recommendations: string[] = [];

    if (overall >= 80) {
      recommendations.push('Confidence is excellent for decision-making');
      return recommendations;
    }

    if (factors.signalQuantity < 60) {
      recommendations.push('Increase signal collection frequency');
    }

    if (factors.signalQuality < 60) {
      recommendations.push('Improve signal source quality');
    }

    if (factors.sourceReliability < 70) {
      recommendations.push('Integrate more reliable data sources');
    }

    if (factors.dataFreshness < 60) {
      recommendations.push('Update data more frequently');
    }

    if (factors.consistency < 60) {
      recommendations.push('Investigate conflicting signals');
    }

    return recommendations;
  }
}

/**
 * Factory function for MarketConfidenceEngine.
 */
export function createMarketConfidenceEngine(
  requirements?: Partial<ConfidenceRequirements>
): MarketConfidenceEngine {
  return new MarketConfidenceEngine(requirements);
}
