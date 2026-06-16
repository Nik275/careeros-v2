/**
 * Uncertainty Engine
 *
 * Phase 8.4: Recommendation Stability Engine - Part 7
 *
 * Calculates uncertainty from various sources:
 * - Sparse profile data
 * - Contradictions
 * - Weak recommendation signals
 * - High recommendation competition
 * - Profile ambiguity
 * - Low consensus
 *
 * @module uncertainty-engine
 * @version 1.0.0
 */

import {
  DimensionScoreMap,
} from '../../assessment/assessment-types';
import {
  ConsensusResult,
  ConfidenceResult,
  UncertaintyResult,
  UncertaintyContribution,
  UncertaintyBand,
  UncertaintyType,
  UncertaintySource,
} from './recommendation-stability-types';

/**
 * Uncertainty Engine implementation
 */
export class UncertaintyEngine {
  /**
   * Calculate comprehensive uncertainty
   */
  calculateUncertainty(
    consensus: ConsensusResult,
    confidence: ConfidenceResult,
    profileCompleteness: number,
    contradictions: Array<{ severity: 'LOW' | 'MEDIUM' | 'HIGH' }>,
    profile: DimensionScoreMap
  ): UncertaintyResult {
    const contributions = this.calculateContributions(
      consensus,
      confidence,
      profileCompleteness,
      contradictions,
      profile
    );

    const uncertaintyScore = this.computeTotalUncertainty(contributions);
    const uncertaintyBand = this.classifyUncertaintyBand(uncertaintyScore);
    const uncertaintyType = this.classifyUncertaintyType(contributions);
    const primarySource = this.identifyPrimarySource(contributions);

    const reducible = this.isReducible(contributions);
    const reductionStrategies = this.generateReductionStrategies(
      contributions,
      profile
    );

    const confidenceInterval = this.calculateConfidenceInterval(
      consensus,
      uncertaintyScore
    );

    return {
      uncertaintyScore: Math.round(uncertaintyScore),
      uncertaintyBand,
      uncertaintyType,
      sourceContributions: contributions,
      primarySource,
      explanation: this.generateExplanation(uncertaintyBand, contributions, primarySource),
      reducible,
      reductionStrategies,
      confidenceInterval,
      generatedAt: new Date(),
    };
  }

  /**
   * Calculate contributions from each uncertainty source
   */
  private calculateContributions(
    consensus: ConsensusResult,
    confidence: ConfidenceResult,
    profileCompleteness: number,
    contradictions: Array<{ severity: 'LOW' | 'MEDIUM' | 'HIGH' }>,
    profile: DimensionScoreMap
  ): UncertaintyContribution[] {
    const contributions: UncertaintyContribution[] = [];

    // 1. Sparse data contribution
    const sparseDataScore = this.calculateSparseDataContribution(
      profileCompleteness,
      profile
    );
    contributions.push({
      source: 'SPARSE_DATA',
      contribution: sparseDataScore,
      severity: this.scoreToSeverity(sparseDataScore),
      reducible: true,
      explanation: 'Some profile dimensions have limited assessment data',
    });

    // 2. Contradictions contribution
    const contradictionScore = this.calculateContradictionContribution(contradictions);
    contributions.push({
      source: 'CONTRADICTIONS',
      contribution: contradictionScore,
      severity: this.scoreToSeverity(contradictionScore),
      reducible: true,
      explanation: 'Profile contains conflicting dimension scores',
    });

    // 3. Weak signals contribution
    const weakSignalsScore = this.calculateWeakSignalsContribution(profile);
    contributions.push({
      source: 'WEAK_SIGNALS',
      contribution: weakSignalsScore,
      severity: this.scoreToSeverity(weakSignalsScore),
      reducible: true,
      explanation: 'Some dimension scores have low confidence',
    });

    // 4. High competition contribution
    const competitionScore = this.calculateCompetitionContribution(consensus);
    contributions.push({
      source: 'HIGH_COMPETITION',
      contribution: competitionScore,
      severity: this.scoreToSeverity(competitionScore),
      reducible: false,
      explanation: 'Multiple careers are competing closely for top position',
    });

    // 5. Profile ambiguity contribution
    const ambiguityScore = this.calculateAmbiguityContribution(profile);
    contributions.push({
      source: 'PROFILE_AMBIGUITY',
      contribution: ambiguityScore,
      severity: this.scoreToSeverity(ambiguityScore),
      reducible: true,
      explanation: 'Profile dimensions suggest multiple possible directions',
    });

    // 6. Low consensus contribution
    const lowConsensusScore = this.calculateLowConsensusContribution(consensus);
    contributions.push({
      source: 'LOW_CONSENSUS',
      contribution: lowConsensusScore,
      severity: this.scoreToSeverity(lowConsensusScore),
      reducible: false,
      explanation: 'Recommendations varied across profile perturbations',
    });

    // 7. Measurement error contribution
    const measurementScore = this.calculateMeasurementContribution(profile);
    contributions.push({
      source: 'MEASUREMENT_ERROR',
      contribution: measurementScore,
      severity: this.scoreToSeverity(measurementScore),
      reducible: true,
      explanation: 'Inherent uncertainty in assessment measurements',
    });

    // 8. Model uncertainty contribution
    const modelScore = this.calculateModelUncertaintyContribution();
    contributions.push({
      source: 'MODEL_UNCERTAINTY',
      contribution: modelScore,
      severity: this.scoreToSeverity(modelScore),
      reducible: false,
      explanation: 'Inherent uncertainty in recommendation model',
    });

    return contributions.sort((a, b) => b.contribution - a.contribution);
  }

  /**
   * Calculate sparse data contribution
   */
  private calculateSparseDataContribution(
    profileCompleteness: number,
    profile: DimensionScoreMap
  ): number {
    // Base score from profile completeness
    const completenessScore = Math.max(0, 100 - profileCompleteness * 100);

    // Bonus for low confidence dimensions
    let lowConfidenceCount = 0;
    for (const [, dimScore] of profile) {
      if (dimScore.confidence < 50) {
        lowConfidenceCount++;
      }
    }
    const lowConfidencePenalty = (lowConfidenceCount / Math.max(1, profile.size)) * 20;

    return Math.min(100, completenessScore + lowConfidencePenalty);
  }

  /**
   * Calculate contradiction contribution
   */
  private calculateContradictionContribution(
    contradictions: Array<{ severity: 'LOW' | 'MEDIUM' | 'HIGH' }>
  ): number {
    if (contradictions.length === 0) return 0;

    const severityWeights = { LOW: 10, MEDIUM: 25, HIGH: 45 };
    const totalWeight = contradictions.reduce(
      (sum, c) => sum + severityWeights[c.severity],
      0
    );

    return Math.min(100, totalWeight);
  }

  /**
   * Calculate weak signals contribution
   */
  private calculateWeakSignalsContribution(profile: DimensionScoreMap): number {
    let totalConfidence = 0;
    let weakSignalPenalty = 0;

    for (const [, dimScore] of profile) {
      totalConfidence += dimScore.confidence;
      
      // Penalize very low signal counts
      if (dimScore.signalCount < 2) {
        weakSignalPenalty += 10;
      }
    }

    const avgConfidence = profile.size > 0 ? totalConfidence / profile.size : 0;
    const confidenceScore = Math.max(0, 100 - avgConfidence);

    return Math.min(100, confidenceScore + weakSignalPenalty);
  }

  /**
   * Calculate competition contribution
   */
  private calculateCompetitionContribution(consensus: ConsensusResult): number {
    const primary = consensus.primaryRecommendation.consensusPercentage;
    
    // Higher competition = lower primary percentage = higher uncertainty
    if (primary >= 0.8) return 10;
    if (primary >= 0.6) return 30;
    if (primary >= 0.4) return 50;
    if (primary >= 0.25) return 70;
    return 90;
  }

  /**
   * Calculate profile ambiguity contribution
   */
  private calculateAmbiguityContribution(profile: DimensionScoreMap): number {
    if (profile.size < 2) return 50;

    const scores: number[] = [];
    for (const [, dimScore] of profile) {
      scores.push(dimScore.score);
    }

    // Calculate standard deviation
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const squaredDiffs = scores.map(s => Math.pow(s - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    // Low standard deviation = ambiguous (all dimensions similar) or 
    // balanced profile = higher uncertainty about which dimension matters most
    if (stdDev < 10) {
      return 60; // Very balanced profile = ambiguous
    } else if (stdDev < 20) {
      return 40; // Moderately balanced
    } else {
      return 20; // Clear differentiation
    }
  }

  /**
   * Calculate low consensus contribution
   */
  private calculateLowConsensusContribution(consensus: ConsensusResult): number {
    // Direct mapping from consensus strength
    const strengthMap: Record<string, number> = {
      'UNANIMOUS': 5,
      'STRONG': 20,
      'MODERATE': 45,
      'WEAK': 70,
      'FRAGMENTED': 95,
    };

    return strengthMap[consensus.consensusStrength] ?? 50;
  }

  /**
   * Calculate measurement contribution
   */
  private calculateMeasurementContribution(profile: DimensionScoreMap): number {
    // Inherent measurement uncertainty - assume 10-15% baseline
    // Plus additional based on dimension count
    const baseUncertainty = 12;
    const dimensionFactor = Math.max(0, 10 - profile.size) * 2;

    return Math.min(100, baseUncertainty + dimensionFactor);
  }

  /**
   * Calculate model uncertainty contribution
   */
  private calculateModelUncertaintyContribution(): number {
    // Fixed baseline model uncertainty
    return 15;
  }

  /**
   * Compute total uncertainty score
   */
  private computeTotalUncertainty(contributions: UncertaintyContribution[]): number {
    if (contributions.length === 0) return 0;

    // Weighted average of contributions
    const weights: Record<UncertaintySource, number> = {
      'SPARSE_DATA': 0.15,
      'CONTRADICTIONS': 0.20,
      'WEAK_SIGNALS': 0.15,
      'HIGH_COMPETITION': 0.15,
      'PROFILE_AMBIGUITY': 0.10,
      'LOW_CONSENSUS': 0.15,
      'MEASUREMENT_ERROR': 0.05,
      'MODEL_UNCERTAINTY': 0.05,
    };

    let weightedSum = 0;
    let totalWeight = 0;

    for (const contribution of contributions) {
      const weight = weights[contribution.source];
      weightedSum += contribution.contribution * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  /**
   * Classify uncertainty band
   */
  private classifyUncertaintyBand(score: number): UncertaintyBand {
    if (score <= 10) return 'MINIMAL';
    if (score <= 25) return 'LOW';
    if (score <= 50) return 'MODERATE';
    if (score <= 75) return 'HIGH';
    return 'VERY_HIGH';
  }

  /**
   * Classify uncertainty type
   */
  private classifyUncertaintyType(
    contributions: UncertaintyContribution[]
  ): UncertaintyType {
    // Determine dominant type based on contributions
    const epistemicScore = this.getTypeScore(contributions, [
      'SPARSE_DATA',
      'WEAK_SIGNALS',
      'MEASUREMENT_ERROR',
    ]);

    const alembicScore = this.getTypeScore(contributions, [
      'HIGH_COMPETITION',
      'MODEL_UNCERTAINTY',
    ]);

    const measurementScore = this.getTypeScore(contributions, [
      'MEASUREMENT_ERROR',
      'WEAK_SIGNALS',
    ]);

    // Check for contradictions and ambiguity
    const contradictionScore = contributions.find(c => c.source === 'CONTRADICTIONS')?.contribution ?? 0;
    const ambiguityScore = contributions.find(c => c.source === 'PROFILE_AMBIGUITY')?.contribution ?? 0;

    if (contradictionScore > 50 || ambiguityScore > 50) {
      return 'EPISTEMIC';
    }

    if (measurementScore > epistemicScore && measurementScore > alembicScore) {
      return 'MEASUREMENT';
    }

    if (epistemicScore > alembicScore) {
      return 'EPISTEMIC';
    }

    return 'MODEL';
  }

  /**
   * Get combined score for uncertainty type
   */
  private getTypeScore(
    contributions: UncertaintyContribution[],
    sources: UncertaintySource[]
  ): number {
    return contributions
      .filter(c => sources.includes(c.source))
      .reduce((sum, c) => sum + c.contribution, 0);
  }

  /**
   * Identify primary source of uncertainty
   */
  private identifyPrimarySource(
    contributions: UncertaintyContribution[]
  ): UncertaintySource {
    return contributions[0]?.source ?? 'MODEL_UNCERTAINTY';
  }

  /**
   * Score to severity conversion
   */
  private scoreToSeverity(score: number): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (score < 30) return 'LOW';
    if (score < 60) return 'MEDIUM';
    return 'HIGH';
  }

  /**
   * Check if uncertainty is reducible
   */
  private isReducible(contributions: UncertaintyContribution[]): boolean {
    const reducibleContributions = contributions.filter(c => c.reducible);
    const reducibleScore = reducibleContributions.reduce((sum, c) => sum + c.contribution, 0);
    const totalScore = contributions.reduce((sum, c) => sum + c.contribution, 0);

    return totalScore > 0 && (reducibleScore / totalScore) > 0.4;
  }

  /**
   * Generate reduction strategies
   */
  private generateReductionStrategies(
    contributions: UncertaintyContribution[],
    profile: DimensionScoreMap
  ): string[] {
    const strategies: string[] = [];

    for (const contribution of contributions) {
      if (!contribution.reducible || contribution.contribution < 15) continue;

      switch (contribution.source) {
        case 'SPARSE_DATA':
          strategies.push('Complete additional assessment questions to fill gaps in profile');
          break;
        case 'CONTRADICTIONS':
          strategies.push('Review and clarify conflicting answers in assessment');
          break;
        case 'WEAK_SIGNALS':
          strategies.push('Answer more questions in low-confidence dimensions');
          break;
        case 'PROFILE_AMBIGUITY':
          strategies.push('Explore priority ranking exercises to clarify preferences');
          break;
        case 'MEASUREMENT_ERROR':
          strategies.push('Take assessment when focused and not rushed');
          break;
      }
    }

    // Remove duplicates and limit
    return [...new Set(strategies)].slice(0, 4);
  }

  /**
   * Calculate confidence interval
   */
  private calculateConfidenceInterval(
    consensus: ConsensusResult,
    uncertaintyScore: number
  ): { lowerBound: number; upperBound: number; confidenceLevel: number } {
    const primary = consensus.primaryRecommendation.consensusPercentage;
    
    // Adjust confidence level based on uncertainty
    let confidenceLevel: number;
    if (uncertaintyScore < 25) {
      confidenceLevel = 0.95;
    } else if (uncertaintyScore < 50) {
      confidenceLevel = 0.90;
    } else if (uncertaintyScore < 75) {
      confidenceLevel = 0.80;
    } else {
      confidenceLevel = 0.70;
    }

    // Calculate interval based on uncertainty
    const margin = uncertaintyScore / 200; // 0-0.5 range
    const lowerBound = Math.max(0, primary - margin);
    const upperBound = Math.min(1, primary + margin);

    return {
      lowerBound: Math.round(lowerBound * 100) / 100,
      upperBound: Math.round(upperBound * 100) / 100,
      confidenceLevel: Math.round(confidenceLevel * 100) / 100,
    };
  }

  /**
   * Generate human-readable explanation
   */
  private generateExplanation(
    band: UncertaintyBand,
    contributions: UncertaintyContribution[],
    primarySource: UncertaintySource
  ): string {
    const bandDescriptions: Record<UncertaintyBand, string> = {
      MINIMAL: 'This recommendation has very low uncertainty.',
      LOW: 'This recommendation has low uncertainty with clear supporting evidence.',
      MODERATE: 'This recommendation has moderate uncertainty - reliable but with some caveats.',
      HIGH: 'This recommendation has high uncertainty and should be interpreted cautiously.',
      VERY_HIGH: 'This recommendation has very high uncertainty and needs additional exploration.',
    };

    let explanation = bandDescriptions[band];

    // Add source-specific context
    const sourceExplanations: Record<UncertaintySource, string> = {
      SPARSE_DATA: ' More assessment data would strengthen confidence.',
      CONTRADICTIONS: ' Some responses appear contradictory and may need clarification.',
      WEAK_SIGNALS: ' Some dimension scores have low confidence.',
      HIGH_COMPETITION: ' Multiple careers are closely matched.',
      PROFILE_AMBIGUITY: ' Your profile suggests several possible directions.',
      LOW_CONSENSUS: ' Recommendations varied with small profile changes.',
      MEASUREMENT_ERROR: ' Some measurement uncertainty is present.',
      MODEL_UNCERTAINTY: ' Inherent model limitations contribute to uncertainty.',
    };

    const primaryContribution = contributions[0];
    if (primaryContribution && primaryContribution.contribution > 20) {
      explanation += sourceExplanations[primarySource];
    }

    return explanation;
  }

  /**
   * Check if uncertainty is acceptable
   */
  isAcceptable(uncertainty: UncertaintyResult, maxBand: UncertaintyBand = 'MODERATE'): boolean {
    const bandOrder: UncertaintyBand[] = ['MINIMAL', 'LOW', 'MODERATE', 'HIGH', 'VERY_HIGH'];
    const currentLevel = bandOrder.indexOf(uncertainty.uncertaintyBand);
    const maxLevel = bandOrder.indexOf(maxBand);
    return currentLevel <= maxLevel;
  }

  /**
   * Prioritize uncertainty reduction
   */
  prioritizeReduction(
    contributions: UncertaintyContribution[]
  ): Array<{ source: UncertaintySource; priority: number; effort: 'LOW' | 'MEDIUM' | 'HIGH' }> {
    return contributions
      .filter(c => c.reducible && c.contribution > 15)
      .map((c): { source: UncertaintySource; priority: number; effort: 'LOW' | 'MEDIUM' | 'HIGH' } => ({
        source: c.source,
        priority: Math.round(c.contribution),
        effort: c.source === 'SPARSE_DATA' ? 'LOW' : 
                c.source === 'CONTRADICTIONS' ? 'MEDIUM' : 'HIGH',
      }))
      .sort((a, b) => b.priority - a.priority);
  }
}

/**
 * Factory function for creating uncertainty engine
 */
export function createUncertaintyEngine(): UncertaintyEngine {
  return new UncertaintyEngine();
}

/**
 * Quick uncertainty calculation
 */
export function calculateQuickUncertainty(
  consensus: ConsensusResult,
  confidence: ConfidenceResult,
  profileCompleteness: number,
  contradictions: Array<{ severity: 'LOW' | 'MEDIUM' | 'HIGH' }> = [],
  profile: DimensionScoreMap
): UncertaintyResult {
  const engine = new UncertaintyEngine();
  return engine.calculateUncertainty(
    consensus,
    confidence,
    profileCompleteness,
    contradictions,
    profile
  );
}

/**
 * Get top uncertainty sources
 */
export function getTopUncertaintySources(
  uncertaintyResult: UncertaintyResult,
  count: number = 3
): UncertaintyContribution[] {
  return uncertaintyResult.sourceContributions.slice(0, count);
}
