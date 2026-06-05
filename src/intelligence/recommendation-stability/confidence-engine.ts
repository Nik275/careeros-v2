/**
 * Confidence Engine
 *
 * Phase 8.4: Recommendation Stability Engine - Part 3
 *
 * Calculates recommendation confidence using statistical measures:
 * - Recommendation consistency
 * - Profile coherence
 * - Contradiction severity
 * - Assessment completeness
 * - Uncertainty level
 * - Consensus strength
 *
 * NOT LLM confidence - purely algorithmic and statistical.
 *
 * @module confidence-engine
 * @version 1.0.0
 */

import {
  DimensionScoreMap,
  DimensionScore,
} from '../../assessment/assessment-types';
import {
  ConsensusResult,
  ConfidenceResult,
  ConfidenceComponents,
  ConfidenceWeights,
  ConfidenceBand,
  DEFAULT_CONFIDENCE_WEIGHTS,
} from './recommendation-stability-types';

/**
 * Profile coherence metrics
 */
interface ProfileCoherence {
  score: number;
  dimensionVariances: Map<string, number>;
  overallVariance: number;
  outlierDimensions: string[];
  balanceScore: number;
}

/**
 * Assessment completeness metrics
 */
interface CompletenessMetrics {
  score: number;
  coverageRatio: number;
  averageSignalCount: number;
  lowConfidenceDimensions: string[];
  missingCriticalDimensions: string[];
}

/**
 * Confidence Engine implementation
 */
export class ConfidenceEngine {
  private weights: ConfidenceWeights;

  constructor(weights: Partial<ConfidenceWeights> = {}) {
    this.weights = { ...DEFAULT_CONFIDENCE_WEIGHTS, ...weights };
    this.validateWeights();
  }

  /**
   * Calculate comprehensive confidence score
   */
  calculateConfidence(
    consensus: ConsensusResult,
    profile: DimensionScoreMap,
    contradictions: Array<{ severity: 'LOW' | 'MEDIUM' | 'HIGH' }> = []
  ): ConfidenceResult {
    const components = this.calculateComponents(
      consensus,
      profile,
      contradictions
    );

    const confidenceScore = this.computeWeightedScore(components);
    const confidenceBand = this.classifyConfidenceBand(confidenceScore);

    const { supportingFactors, reducingFactors, improvementSuggestions } =
      this.generateFactorAnalysis(components, profile);

    return {
      confidenceScore: Math.round(confidenceScore),
      confidenceBand,
      components,
      explanation: this.generateExplanation(confidenceBand, components),
      supportingFactors,
      reducingFactors,
      improvementSuggestions,
      generatedAt: new Date(),
    };
  }

  /**
   * Calculate all confidence components
   */
  private calculateComponents(
    consensus: ConsensusResult,
    profile: DimensionScoreMap,
    contradictions: Array<{ severity: 'LOW' | 'MEDIUM' | 'HIGH' }>
  ): ConfidenceComponents {
    return {
      recommendationConsistency: this.calculateRecommendationConsistency(consensus),
      profileCoherence: this.calculateProfileCoherence(profile).score,
      contradictionSeverity: this.calculateContradictionSeverity(contradictions),
      assessmentCompleteness: this.calculateCompleteness(profile).score,
      uncertaintyLevel: this.calculateUncertaintyLevel(profile),
      consensusStrength: this.calculateConsensusStrength(consensus),
    };
  }

  /**
   * Calculate recommendation consistency component
   * Based on how consistent recommendations are across perturbations
   */
  private calculateRecommendationConsistency(consensus: ConsensusResult): number {
    const { primaryRecommendation, normalizedEntropy, giniCoefficient } = consensus;
    
    // High primary percentage = high consistency
    const primaryScore = primaryRecommendation.consensusPercentage * 100;
    
    // Low entropy = high consistency
    const entropyScore = (1 - normalizedEntropy) * 100;
    
    // High Gini = high consistency (concentrated distribution)
    const giniScore = giniCoefficient * 100;
    
    // Weighted combination
    return Math.round(primaryScore * 0.5 + entropyScore * 0.3 + giniScore * 0.2);
  }

  /**
   * Calculate profile coherence component
   * Measures how internally consistent the profile dimensions are
   */
  private calculateProfileCoherence(profile: DimensionScoreMap): ProfileCoherence {
    const scores: number[] = [];
    const dimensionVariances = new Map<string, number>();
    const outlierDimensions: string[] = [];

    for (const [dimension, score] of profile) {
      scores.push(score.score);
      
      // Variance relative to confidence
      const variance = (100 - score.confidence) / 100 * score.score;
      dimensionVariances.set(dimension, variance);
    }

    if (scores.length === 0) {
      return {
        score: 0,
        dimensionVariances,
        overallVariance: 100,
        outlierDimensions: [],
        balanceScore: 0,
      };
    }

    // Calculate overall variance
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const squaredDiffs = scores.map(s => Math.pow(s - mean, 2));
    const overallVariance = squaredDiffs.reduce((a, b) => a + b, 0) / scores.length;

    // Identify outlier dimensions (those far from mean)
    const stdDev = Math.sqrt(overallVariance);
    for (const [dimension, score] of profile) {
      if (Math.abs(score.score - mean) > 2 * stdDev) {
        outlierDimensions.push(dimension);
      }
    }

    // Balance score - penalize extreme profiles
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    const range = maxScore - minScore;
    const balanceScore = Math.max(0, 100 - range);

    // Coherence score combines low variance with balance
    const varianceScore = Math.max(0, 100 - overallVariance / 10);
    const coherenceScore = Math.round(varianceScore * 0.6 + balanceScore * 0.4);

    return {
      score: coherenceScore,
      dimensionVariances,
      overallVariance,
      outlierDimensions,
      balanceScore,
    };
  }

  /**
   * Calculate contradiction severity component
   * Lower score = more severe contradictions
   */
  private calculateContradictionSeverity(
    contradictions: Array<{ severity: 'LOW' | 'MEDIUM' | 'HIGH' }>
  ): number {
    if (contradictions.length === 0) {
      return 100; // No contradictions = full score
    }

    // Weight contradictions by severity
    const severityWeights = { LOW: 1, MEDIUM: 2, HIGH: 4 };
    const totalWeight = contradictions.reduce(
      (sum, c) => sum + severityWeights[c.severity],
      0
    );

    // More and more severe contradictions = lower score
    // Start with 100, subtract based on weighted contradictions
    const penalty = Math.min(100, totalWeight * 10);
    return Math.max(0, 100 - penalty);
  }

  /**
   * Calculate assessment completeness component
   */
  private calculateCompleteness(profile: DimensionScoreMap): CompletenessMetrics {
    if (profile.size === 0) {
      return {
        score: 0,
        coverageRatio: 0,
        averageSignalCount: 0,
        lowConfidenceDimensions: [],
        missingCriticalDimensions: [],
      };
    }

    const dimensions = Array.from(profile.values());
    const lowConfidenceDimensions: string[] = [];
    let totalSignalCount = 0;
    let totalConfidence = 0;

    for (const [name, dim] of profile) {
      totalSignalCount += dim.signalCount;
      totalConfidence += dim.confidence;

      if (dim.confidence < 50) {
        lowConfidenceDimensions.push(name);
      }
    }

    const averageConfidence = totalConfidence / dimensions.length;
    const averageSignalCount = totalSignalCount / dimensions.length;

    // Expected dimensions for a complete assessment
    const expectedDimensions = 8; // Based on SUPPORTED_DIMENSIONS
    const coverageRatio = Math.min(1, profile.size / expectedDimensions);

    // Score based on coverage and confidence
    const coverageScore = coverageRatio * 100;
    const confidenceScore = averageConfidence;
    const signalScore = Math.min(100, averageSignalCount * 20); // Expect ~5 signals per dimension

    const completenessScore = Math.round(
      coverageScore * 0.4 + confidenceScore * 0.4 + signalScore * 0.2
    );

    return {
      score: completenessScore,
      coverageRatio,
      averageSignalCount,
      lowConfidenceDimensions,
      missingCriticalDimensions: [], // Would be populated based on expected dimensions
    };
  }

  /**
   * Calculate uncertainty level component
   * Based on confidence scores across dimensions
   */
  private calculateUncertaintyLevel(profile: DimensionScoreMap): number {
    if (profile.size === 0) return 100;

    let totalUncertainty = 0;

    for (const [, dim] of profile) {
      // Uncertainty is inverse of confidence
      totalUncertainty += 100 - dim.confidence;
    }

    const averageUncertainty = totalUncertainty / profile.size;
    
    // Scale so higher uncertainty = lower score
    return Math.round(100 - averageUncertainty);
  }

  /**
   * Calculate consensus strength component
   */
  private calculateConsensusStrength(consensus: ConsensusResult): number {
    const primaryPercentage = consensus.primaryRecommendation.consensusPercentage;
    
    // Direct mapping from consensus percentage
    return Math.round(primaryPercentage * 100);
  }

  /**
   * Compute weighted confidence score
   */
  private computeWeightedScore(components: ConfidenceComponents): number {
    let weightedSum = 0;
    let totalWeight = 0;

    const componentEntries: [keyof ConfidenceComponents, number][] = [
      ['recommendationConsistency', components.recommendationConsistency],
      ['profileCoherence', components.profileCoherence],
      ['contradictionSeverity', components.contradictionSeverity],
      ['assessmentCompleteness', components.assessmentCompleteness],
      ['uncertaintyLevel', components.uncertaintyLevel],
      ['consensusStrength', components.consensusStrength],
    ];

    for (const [key, value] of componentEntries) {
      const weight = this.weights[key];
      weightedSum += value * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  /**
   * Classify confidence band
   */
  private classifyConfidenceBand(score: number): ConfidenceBand {
    if (score >= 90) return 'VERY_HIGH';
    if (score >= 75) return 'HIGH';
    if (score >= 50) return 'MODERATE';
    if (score >= 25) return 'LOW';
    return 'VERY_LOW';
  }

  /**
   * Generate human-readable explanation
   */
  private generateExplanation(
    band: ConfidenceBand,
    components: ConfidenceComponents
  ): string {
    const bandDescriptions: Record<ConfidenceBand, string> = {
      VERY_HIGH:
        'This recommendation is supported by strong evidence across all dimensions.',
      HIGH:
        'This recommendation has solid support with consistent patterns across analyses.',
      MODERATE:
        'This recommendation has reasonable support, though some factors introduce uncertainty.',
      LOW:
        'This recommendation has limited support and should be considered preliminary.',
      VERY_LOW:
        'This recommendation has weak support and should be interpreted with caution.',
    };

    // Identify strongest and weakest components
    const componentArray = [
      { name: 'recommendation consistency', value: components.recommendationConsistency },
      { name: 'profile coherence', value: components.profileCoherence },
      { name: 'contradiction absence', value: components.contradictionSeverity },
      { name: 'assessment completeness', value: components.assessmentCompleteness },
      { name: 'certainty level', value: components.uncertaintyLevel },
      { name: 'consensus strength', value: components.consensusStrength },
    ];

    const strongest = componentArray.reduce((a, b) => (a.value > b.value ? a : b));
    const weakest = componentArray.reduce((a, b) => (a.value < b.value ? a : b));

    return `${bandDescriptions[band]} Strongest factor: ${strongest.name} (${Math.round(strongest.value)}%). Area for improvement: ${weakest.name} (${Math.round(weakest.value)}%).`;
  }

  /**
   * Generate factor analysis
   */
  private generateFactorAnalysis(
    components: ConfidenceComponents,
    profile: DimensionScoreMap
  ): {
    supportingFactors: string[];
    reducingFactors: string[];
    improvementSuggestions: string[];
  } {
    const supportingFactors: string[] = [];
    const reducingFactors: string[] = [];
    const improvementSuggestions: string[] = [];

    // Analyze each component
    if (components.recommendationConsistency >= 75) {
      supportingFactors.push('Recommendations remained consistent across simulation variations');
    } else if (components.recommendationConsistency < 50) {
      reducingFactors.push('Recommendations varied significantly with small profile changes');
      improvementSuggestions.push('Consider exploring the alternative careers that appeared in simulations');
    }

    if (components.profileCoherence >= 75) {
      supportingFactors.push('Profile dimensions are well-balanced and coherent');
    } else if (components.profileCoherence < 50) {
      reducingFactors.push('Profile shows some internal inconsistencies');
      improvementSuggestions.push('Review dimension scores for potential contradictions');
    }

    if (components.contradictionSeverity >= 75) {
      supportingFactors.push('No significant contradictions detected in profile');
    } else if (components.contradictionSeverity < 50) {
      reducingFactors.push('Profile contains contradictions that affect confidence');
      improvementSuggestions.push('Address identified contradictions through additional assessment');
    }

    if (components.assessmentCompleteness >= 75) {
      supportingFactors.push('Assessment is comprehensive across all key dimensions');
    } else if (components.assessmentCompleteness < 50) {
      reducingFactors.push('Assessment coverage could be improved');
      improvementSuggestions.push('Complete additional questions to improve coverage');
    }

    if (components.uncertaintyLevel >= 75) {
      supportingFactors.push('Dimension scores have high confidence');
    } else if (components.uncertaintyLevel < 50) {
      reducingFactors.push('Some dimension scores have low confidence');
      improvementSuggestions.push('Focus on dimensions with lower confidence scores');
    }

    if (components.consensusStrength >= 75) {
      supportingFactors.push('Strong consensus emerged across all simulations');
    } else if (components.consensusStrength < 50) {
      reducingFactors.push('Low consensus - multiple careers competed for top position');
      improvementSuggestions.push('Consider exploring the close runner-up careers');
    }

    return { supportingFactors, reducingFactors, improvementSuggestions };
  }

  /**
   * Validate that weights sum to 1
   */
  private validateWeights(): void {
    const sum = Object.values(this.weights).reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 1) > 0.001) {
      // Normalize weights
      const factor = 1 / sum;
      for (const key of Object.keys(this.weights) as Array<keyof ConfidenceWeights>) {
        this.weights[key] *= factor;
      }
    }
  }

  /**
   * Update weights for confidence calculation
   */
  setWeights(weights: Partial<ConfidenceWeights>): void {
    this.weights = { ...this.weights, ...weights };
    this.validateWeights();
  }

  /**
   * Get current weights
   */
  getWeights(): ConfidenceWeights {
    return { ...this.weights };
  }
}

/**
 * Factory function for creating confidence engine
 */
export function createConfidenceEngine(
  weights?: Partial<ConfidenceWeights>
): ConfidenceEngine {
  return new ConfidenceEngine(weights);
}

/**
 * Quick confidence calculation with default settings
 */
export function calculateQuickConfidence(
  consensus: ConsensusResult,
  profile: DimensionScoreMap,
  contradictions: Array<{ severity: 'LOW' | 'MEDIUM' | 'HIGH' }> = []
): ConfidenceResult {
  const engine = new ConfidenceEngine();
  return engine.calculateConfidence(consensus, profile, contradictions);
}

/**
 * Calculate confidence component breakdown for detailed analysis
 */
export function analyzeConfidenceComponents(
  consensus: ConsensusResult,
  profile: DimensionScoreMap,
  contradictions: Array<{ severity: 'LOW' | 'MEDIUM' | 'HIGH' }> = []
): ConfidenceComponents {
  const engine = new ConfidenceEngine();
  const result = engine.calculateConfidence(consensus, profile, contradictions);
  return result.components;
}

/**
 * Determine if confidence is sufficient for actionable recommendations
 */
export function isConfidenceActionable(
  confidence: ConfidenceResult,
  minThreshold: ConfidenceBand = 'MODERATE'
): boolean {
  const bandOrder: ConfidenceBand[] = [
    'VERY_LOW',
    'LOW',
    'MODERATE',
    'HIGH',
    'VERY_HIGH',
  ];
  
  const confidenceLevel = bandOrder.indexOf(confidence.confidenceBand);
  const thresholdLevel = bandOrder.indexOf(minThreshold);
  
  return confidenceLevel >= thresholdLevel;
}
