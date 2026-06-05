/**
 * Reliability Engine
 * 
 * Generates reliability scores, bands, and trustworthiness assessments
 * for all confidence predictions in the CareerOS system.
 */

import {
  CalibrationProfile,
  ReliabilityScore,
  ReliabilityBand,
  ReliabilityAssessment,
  ReliabilityFactor,
  ConfidenceTrustworthiness,
  TrustLevel,
  CalibrationStatus,
  CalibrationHistory,
  Timestamp,
} from './calibration-types';

export interface ReliabilityEngineConfig {
  minSampleSizeForReliable: number;
  excellentThreshold: number;
  goodThreshold: number;
  moderateThreshold: number;
  poorThreshold: number;
  historyLookbackPeriod: number; // milliseconds
}

export const DEFAULT_RELIABILITY_CONFIG: ReliabilityEngineConfig = {
  minSampleSizeForReliable: 50,
  excellentThreshold: 0.9,
  goodThreshold: 0.75,
  moderateThreshold: 0.6,
  poorThreshold: 0.4,
  historyLookbackPeriod: 30 * 24 * 60 * 60 * 1000, // 30 days
};

export class ReliabilityEngine {
  private config: ReliabilityEngineConfig;
  private profileCache: Map<string, CalibrationProfile> = new Map();
  private historyCache: Map<string, CalibrationHistory> = new Map();

  constructor(config: Partial<ReliabilityEngineConfig> = {}) {
    this.config = { ...DEFAULT_RELIABILITY_CONFIG, ...config };
  }

  /**
   * Calculate reliability score from calibration profile
   */
  calculateReliability(profile: CalibrationProfile): ReliabilityAssessment {
    const factors = this.assessReliabilityFactors(profile);
    const weightedScore = this.calculateWeightedScore(factors);
    const band = this.scoreToBand(weightedScore);
    const recommendations = this.generateRecommendations(profile, factors);

    return {
      score: weightedScore,
      band,
      confidence: this.calculateAssessmentConfidence(profile),
      factors,
      recommendations,
    };
  }

  /**
   * Assess individual reliability factors
   */
  private assessReliabilityFactors(profile: CalibrationProfile): ReliabilityFactor[] {
    const factors: ReliabilityFactor[] = [];

    // Calibration error factor
    factors.push({
      name: 'calibration_error',
      weight: 0.3,
      score: Math.max(0, 1 - profile.calibrationError * 2),
      impact: profile.calibrationError < 0.1 ? 'positive' : profile.calibrationError > 0.2 ? 'negative' : 'neutral',
    });

    // Sample size factor
    const sampleScore = Math.min(1, profile.sampleSize / this.config.minSampleSizeForReliable);
    factors.push({
      name: 'sample_size',
      weight: 0.25,
      score: sampleScore,
      impact: sampleScore > 0.8 ? 'positive' : sampleScore < 0.5 ? 'negative' : 'neutral',
    });

    // Trend factor
    const trendScore = profile.trend.direction === 'improving' 
      ? 0.8 + (profile.trend.rate * 0.2)
      : profile.trend.direction === 'degrading'
        ? Math.max(0, 0.5 - profile.trend.rate)
        : 0.7;
    factors.push({
      name: 'trend',
      weight: 0.2,
      score: trendScore,
      impact: profile.trend.direction === 'improving' ? 'positive' : 
              profile.trend.direction === 'degrading' ? 'negative' : 'neutral',
    });

    // Status factor
    const statusScores: Record<CalibrationStatus, number> = {
      [CalibrationStatus.WELL_CALIBRATED]: 1.0,
      [CalibrationStatus.UNDERCONFIDENT]: 0.8,
      [CalibrationStatus.OVERCONFIDENT]: 0.6,
      [CalibrationStatus.INSUFFICIENT_DATA]: 0.3,
      [CalibrationStatus.DRIFTING]: 0.4,
    };
    factors.push({
      name: 'calibration_status',
      weight: 0.15,
      score: statusScores[profile.status],
      impact: profile.status === CalibrationStatus.WELL_CALIBRATED ? 'positive' :
              profile.status === CalibrationStatus.INSUFFICIENT_DATA || 
              profile.status === CalibrationStatus.DRIFTING ? 'negative' : 'neutral',
    });

    // Recency factor
    const age = Date.now() - profile.lastUpdated;
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    const recencyScore = Math.max(0, 1 - age / maxAge);
    factors.push({
      name: 'recency',
      weight: 0.1,
      score: recencyScore,
      impact: recencyScore > 0.7 ? 'positive' : recencyScore < 0.3 ? 'negative' : 'neutral',
    });

    return factors;
  }

  /**
   * Calculate weighted reliability score
   */
  private calculateWeightedScore(factors: ReliabilityFactor[]): ReliabilityScore {
    const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
    const weightedSum = factors.reduce((sum, f) => sum + f.score * f.weight, 0);
    return Math.min(1, Math.max(0, weightedSum / totalWeight));
  }

  /**
   * Convert score to band
   */
  private scoreToBand(score: ReliabilityScore): ReliabilityBand {
    if (score >= this.config.excellentThreshold) return ReliabilityBand.EXCELLENT;
    if (score >= this.config.goodThreshold) return ReliabilityBand.GOOD;
    if (score >= this.config.moderateThreshold) return ReliabilityBand.MODERATE;
    if (score >= this.config.poorThreshold) return ReliabilityBand.POOR;
    return ReliabilityBand.UNRELIABLE;
  }

  /**
   * Calculate confidence in the reliability assessment
   */
  private calculateAssessmentConfidence(profile: CalibrationProfile): number {
    // Higher confidence with more samples and lower error
    const sampleConfidence = Math.min(1, profile.sampleSize / 100);
    const errorConfidence = Math.max(0, 1 - profile.calibrationError);
    return (sampleConfidence + errorConfidence) / 2;
  }

  /**
   * Generate improvement recommendations
   */
  private generateRecommendations(profile: CalibrationProfile, factors: ReliabilityFactor[]): string[] {
    const recommendations: string[] = [];

    // Check calibration error
    if (profile.calibrationError > 0.15) {
      if (profile.status === CalibrationStatus.OVERCONFIDENT) {
        recommendations.push('System is overconfident. Apply conservative confidence discount of 15-20%.');
      } else if (profile.status === CalibrationStatus.UNDERCONFIDENT) {
        recommendations.push('System is underconfident. Consider raising confidence in well-supported predictions.');
      } else {
        recommendations.push('High calibration error detected. Review prediction features and model.');
      }
    }

    // Check sample size
    if (profile.sampleSize < this.config.minSampleSizeForReliable) {
      recommendations.push(`Insufficient data (${profile.sampleSize} samples). Collect at least ${this.config.minSampleSizeForReliable} observations.`);
    }

    // Check trend
    if (profile.trend.direction === 'degrading') {
      recommendations.push('Calibration is degrading. Investigate recent prediction quality and data drift.');
    }

    // Check recency
    const age = Date.now() - profile.lastUpdated;
    if (age > 3 * 24 * 60 * 60 * 1000) {
      recommendations.push('Calibration is stale. Run recalibration with recent data.');
    }

    // Check bin distribution
    const emptyBins = profile.binCalibrations.filter(b => b.sampleCount === 0).length;
    if (emptyBins > profile.binCalibrations.length / 3) {
      recommendations.push('Uneven confidence distribution. Encourage more diverse confidence levels.');
    }

    return recommendations;
  }

  /**
   * Assess confidence trustworthiness
   */
  assessConfidenceTrustworthiness(
    confidence: number,
    profile: CalibrationProfile,
    context?: string
  ): ConfidenceTrustworthiness {
    const reliabilityAssessment = this.calculateReliability(profile);
    const reliabilityScore = reliabilityAssessment.score;

    // Adjust confidence based on reliability
    let adjustedConfidence: number;
    let trustLevel: TrustLevel;
    let explanation: string;

    if (reliabilityScore >= 0.9) {
      adjustedConfidence = confidence;
      trustLevel = TrustLevel.HIGH;
      explanation = 'High reliability calibration. Confidence can be trusted.';
    } else if (reliabilityScore >= 0.75) {
      adjustedConfidence = confidence * (0.95 + reliabilityScore * 0.05);
      trustLevel = TrustLevel.HIGH;
      explanation = 'Good reliability. Minor confidence adjustment applied.';
    } else if (reliabilityScore >= 0.6) {
      adjustedConfidence = confidence * (0.9 + reliabilityScore * 0.1);
      trustLevel = TrustLevel.MODERATE;
      explanation = 'Moderate reliability. Confidence adjusted conservatively.';
    } else if (reliabilityScore >= 0.4) {
      adjustedConfidence = confidence * (0.8 + reliabilityScore * 0.1);
      trustLevel = TrustLevel.LOW;
      explanation = 'Poor reliability. Significant confidence discount applied.';
    } else {
      adjustedConfidence = confidence * 0.7;
      trustLevel = TrustLevel.UNTRUSTWORTHY;
      explanation = 'Unreliable calibration. Heavy confidence discount applied. Use with caution.';
    }

    // Additional adjustment based on calibration status
    if (profile.status === CalibrationStatus.OVERCONFIDENT) {
      adjustedConfidence *= 0.85;
      explanation += ' Additional discount for known overconfidence.';
    } else if (profile.status === CalibrationStatus.INSUFFICIENT_DATA) {
      adjustedConfidence *= 0.75;
      trustLevel = TrustLevel.UNTRUSTWORTHY;
      explanation += ' Insufficient calibration data.';
    }

    return {
      confidence,
      reliabilityScore,
      adjustedConfidence: Math.min(1, Math.max(0, adjustedConfidence)),
      trustLevel,
      explanation,
    };
  }

  /**
   * Compare reliability across multiple profiles
   */
  compareReliability(profiles: Map<string, CalibrationProfile>): Array<{
    id: string;
    score: ReliabilityScore;
    band: ReliabilityBand;
    rank: number;
  }> {
    const assessments = Array.from(profiles.entries()).map(([id, profile]) => ({
      id,
      ...this.calculateReliability(profile),
    }));

    return assessments
      .sort((a, b) => b.score - a.score)
      .map((assessment, index) => ({
        id: assessment.id,
        score: assessment.score,
        band: assessment.band,
        rank: index + 1,
      }));
  }

  /**
   * Detect reliability drift from history
   */
  detectReliabilityDrift(
    profile: CalibrationProfile,
    history: CalibrationHistory
  ): {
    hasDrift: boolean;
    driftMagnitude: number;
    driftDirection: 'improving' | 'degrading' | 'stable';
    confidence: number;
  } {
    if (history.reliabilityScores.length < 5) {
      return { hasDrift: false, driftMagnitude: 0, driftDirection: 'stable', confidence: 0 };
    }

    const recentScores = history.reliabilityScores.slice(-5);
    const olderScores = history.reliabilityScores.slice(-10, -5);

    if (olderScores.length === 0) {
      return { hasDrift: false, driftMagnitude: 0, driftDirection: 'stable', confidence: 0 };
    }

    const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    const olderAvg = olderScores.reduce((a, b) => a + b, 0) / olderScores.length;

    const driftMagnitude = Math.abs(recentAvg - olderAvg);
    const hasDrift = driftMagnitude > 0.1;

    let driftDirection: 'improving' | 'degrading' | 'stable';
    if (recentAvg > olderAvg + 0.05) {
      driftDirection = 'improving';
    } else if (recentAvg < olderAvg - 0.05) {
      driftDirection = 'degrading';
    } else {
      driftDirection = 'stable';
    }

    // Confidence based on sample sizes
    const confidence = Math.min(1, history.sampleSizes.slice(-5).reduce((a, b) => a + b, 0) / 100);

    return { hasDrift, driftMagnitude, driftDirection, confidence };
  }

  /**
   * Get trust level description
   */
  getTrustLevelDescription(level: TrustLevel): string {
    const descriptions: Record<TrustLevel, string> = {
      [TrustLevel.HIGH]: 'Confidence scores are reliable and well-calibrated.',
      [TrustLevel.MODERATE]: 'Confidence scores are reasonably reliable with minor adjustments needed.',
      [TrustLevel.LOW]: 'Confidence scores should be treated with caution. Significant discount recommended.',
      [TrustLevel.UNTRUSTWORTHY]: 'Confidence scores are not reliable. Heavy discounting required.',
    };
    return descriptions[level];
  }

  /**
   * Get reliability band description
   */
  getBandDescription(band: ReliabilityBand): string {
    const descriptions: Record<ReliabilityBand, string> = {
      [ReliabilityBand.EXCELLENT]: 'System demonstrates excellent calibration with high confidence reliability.',
      [ReliabilityBand.GOOD]: 'System shows good calibration. Minor improvements possible.',
      [ReliabilityBand.MODERATE]: 'System has moderate calibration. Regular monitoring recommended.',
      [ReliabilityBand.POOR]: 'System has poor calibration. Significant improvements needed.',
      [ReliabilityBand.UNRELIABLE]: 'System is unreliable. Major recalibration required.',
    };
    return descriptions[band];
  }

  /**
   * Cache profile for quick access
   */
  cacheProfile(id: string, profile: CalibrationProfile): void {
    this.profileCache.set(id, profile);
  }

  /**
   * Get cached profile
   */
  getCachedProfile(id: string): CalibrationProfile | undefined {
    return this.profileCache.get(id);
  }

  /**
   * Clear profile cache
   */
  clearCache(): void {
    this.profileCache.clear();
    this.historyCache.clear();
  }

  /**
   * Calculate system-wide reliability statistics
   */
  calculateSystemReliability(profiles: CalibrationProfile[]): {
    averageReliability: number;
    medianReliability: number;
    minReliability: number;
    maxReliability: number;
    excellentCount: number;
    unreliableCount: number;
  } {
    if (profiles.length === 0) {
      return {
        averageReliability: 0,
        medianReliability: 0,
        minReliability: 0,
        maxReliability: 0,
        excellentCount: 0,
        unreliableCount: 0,
      };
    }

    const scores = profiles.map(p => p.reliabilityScore).sort((a, b) => a - b);
    const sum = scores.reduce((a, b) => a + b, 0);

    return {
      averageReliability: sum / scores.length,
      medianReliability: scores[Math.floor(scores.length / 2)],
      minReliability: scores[0],
      maxReliability: scores[scores.length - 1],
      excellentCount: profiles.filter(p => p.reliabilityBand === ReliabilityBand.EXCELLENT).length,
      unreliableCount: profiles.filter(p => p.reliabilityBand === ReliabilityBand.UNRELIABLE).length,
    };
  }

  /**
   * Generate reliability trend forecast
   */
  forecastReliability(history: CalibrationHistory, periods: number = 5): number[] {
    if (history.reliabilityScores.length < 3) {
      return Array(periods).fill(history.reliabilityScores[0] || 0.5);
    }

    // Simple linear extrapolation
    const recent = history.reliabilityScores.slice(-5);
    const n = recent.length;
    const sumX = recent.reduce((sum, _, i) => sum + i, 0);
    const sumY = recent.reduce((sum, score) => sum + score, 0);
    const sumXY = recent.reduce((sum, score, i) => sum + i * score, 0);
    const sumX2 = recent.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const forecast: number[] = [];
    for (let i = 1; i <= periods; i++) {
      const predicted = slope * (n + i) + intercept;
      forecast.push(Math.min(1, Math.max(0, predicted)));
    }

    return forecast;
  }
}
