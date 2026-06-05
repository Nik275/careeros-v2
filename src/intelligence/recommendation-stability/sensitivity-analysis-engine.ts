/**
 * Sensitivity Analysis Engine
 *
 * Phase 8.4: Recommendation Stability Engine - Part 6
 *
 * Determines which variables influence recommendations most:
 * - Feature importance ranking
 * - Sensitivity weights for dimension-career pairs
 * - Dimension impact analysis
 * - Change thresholds
 *
 * @module sensitivity-analysis-engine
 * @version 1.0.0
 */

import {
  DimensionScoreMap,
} from '../../assessment/assessment-types';
import {
  RecommendationSet,
} from '../../recommendation/recommendation-types';
import {
  SensitivityResult,
  FeatureImportance,
  SensitivityWeight,
  DimensionImpact,
  PerturbedProfile,
  PerturbationId,
} from './recommendation-stability-types';

/**
 * Career position tracking
 */
interface CareerPosition {
  careerId: string;
  rank: number;
  score: number;
}

/**
 * Dimension correlation data
 */
interface DimensionCorrelation {
  dimension: string;
  deltas: number[];
  rankChanges: Map<string, number[]>; // careerId -> rank changes
  scoreChanges: Map<string, number[]>; // careerId -> score changes
}

/**
 * Sensitivity Analysis Engine implementation
 */
export class SensitivityAnalysisEngine {
  /**
   * Analyze sensitivity to dimension changes
   */
  analyzeSensitivity(
    baseProfile: DimensionScoreMap,
    perturbedProfiles: PerturbedProfile[],
    perturbedRecommendations: Map<PerturbationId, RecommendationSet>,
    topCareersToAnalyze: number = 5
  ): SensitivityResult {
    // Extract career positions from all perturbations
    const careerPositionsByPerturbation = this.extractCareerPositions(
      perturbedRecommendations
    );

    // Calculate correlations between dimension changes and recommendation changes
    const correlations = this.calculateCorrelations(
      perturbedProfiles,
      careerPositionsByPerturbation
    );

    // Calculate feature importance
    const featureImportance = this.calculateFeatureImportance(
      correlations,
      baseProfile
    );

    // Calculate sensitivity weights
    const sensitivityWeights = this.calculateSensitivityWeights(
      correlations,
      topCareersToAnalyze
    );

    // Calculate dimension impacts
    const dimensionImpacts = this.calculateDimensionImpacts(
      correlations,
      featureImportance
    );

    // Calculate change thresholds
    const changeThresholds = this.calculateChangeThresholds(correlations);

    // Generate explanation
    const explanation = this.generateExplanation(featureImportance);

    // Generate insights
    const insights = this.generateInsights(featureImportance, correlations);

    return {
      featureImportance: featureImportance.sort((a, b) => b.importanceScore - a.importanceScore),
      mostInfluentialDimensions: featureImportance
        .slice(0, 5)
        .map(f => f.dimension),
      sensitivityWeights,
      dimensionImpacts,
      changeThresholds,
      explanation,
      insights,
      generatedAt: new Date(),
    };
  }

  /**
   * Extract career positions from all perturbations
   */
  private extractCareerPositions(
    perturbedRecommendations: Map<PerturbationId, RecommendationSet>
  ): Map<PerturbationId, Map<string, CareerPosition>> {
    const positions = new Map<PerturbationId, Map<string, CareerPosition>>();

    for (const [pertId, recSet] of perturbedRecommendations) {
      const careerPositions = new Map<string, CareerPosition>();
      
      const allRecs = [
        ...recSet.topRecommendations,
        ...recSet.alternativeRecommendations,
      ];

      for (let i = 0; i < allRecs.length; i++) {
        const rec = allRecs[i];
        careerPositions.set(rec.careerId, {
          careerId: rec.careerId,
          rank: i + 1,
          score: rec.score,
        });
      }

      positions.set(pertId, careerPositions);
    }

    return positions;
  }

  /**
   * Calculate correlations between dimension changes and recommendation changes
   */
  private calculateCorrelations(
    perturbedProfiles: PerturbedProfile[],
    careerPositions: Map<PerturbationId, Map<string, CareerPosition>>
  ): Map<string, DimensionCorrelation> {
    const correlations = new Map<string, DimensionCorrelation>();

    // Initialize correlations structure
    const dimensions = perturbedProfiles[0]?.dimensionScores.keys();
    if (!dimensions) return correlations;

    for (const dimension of dimensions) {
      correlations.set(dimension, {
        dimension,
        deltas: [],
        rankChanges: new Map(),
        scoreChanges: new Map(),
      });
    }

    // Collect data points
    for (const profile of perturbedProfiles) {
      const positions = careerPositions.get(profile.id);
      if (!positions) continue;

      for (const [dimension, delta] of profile.deltas) {
        const corr = correlations.get(dimension);
        if (!corr) continue;

        corr.deltas.push(delta);

        // Track rank and score changes for each career
        for (const [careerId, position] of positions) {
          if (!corr.rankChanges.has(careerId)) {
            corr.rankChanges.set(careerId, []);
            corr.scoreChanges.set(careerId, []);
          }

          // Store rank (we'll calculate changes relative to baseline later)
          corr.rankChanges.get(careerId)!.push(position.rank);
          corr.scoreChanges.get(careerId)!.push(position.score);
        }
      }
    }

    return correlations;
  }

  /**
   * Calculate feature importance for each dimension
   */
  private calculateFeatureImportance(
    correlations: Map<string, DimensionCorrelation>,
    baseProfile: DimensionScoreMap
  ): FeatureImportance[] {
    const importance: FeatureImportance[] = [];

    for (const [dimension, corr] of correlations) {
      if (corr.deltas.length === 0) continue;

      // Calculate importance based on multiple factors
      
      // 1. Variance of deltas (how much this dimension varies)
      const deltaVariance = this.calculateVariance(corr.deltas);
      
      // 2. Impact on career rankings
      let totalRankImpact = 0;
      let careerCount = 0;
      
      for (const [careerId, ranks] of corr.rankChanges) {
        if (ranks.length > 1) {
          const rankVariance = this.calculateVariance(ranks);
          totalRankImpact += rankVariance;
          careerCount++;
        }
      }
      
      const avgRankImpact = careerCount > 0 ? totalRankImpact / careerCount : 0;

      // 3. Impact on career scores
      let totalScoreImpact = 0;
      let scoreCount = 0;
      
      for (const [careerId, scores] of corr.scoreChanges) {
        if (scores.length > 1) {
          const scoreVariance = this.calculateVariance(scores);
          totalScoreImpact += scoreVariance;
          scoreCount++;
        }
      }
      
      const avgScoreImpact = scoreCount > 0 ? totalScoreImpact / scoreCount : 0;

      // 4. Profile dimension confidence
      const dimScore = baseProfile.get(dimension);
      const confidenceFactor = dimScore ? dimScore.confidence / 100 : 0.5;

      // Combine into importance score
      // Higher delta variance + higher rank impact + higher score impact = more important
      const rawImportance = (
        deltaVariance * 0.2 +
        avgRankImpact * 30 +
        avgScoreImpact * 0.5
      ) * confidenceFactor;

      // Normalize to 0-100 scale
      const importanceScore = Math.min(100, rawImportance * 2);

      // Calculate influence magnitude
      const influenceMagnitude = avgRankImpact * 10 + avgScoreImpact * 0.1;

      // Calculate influence stability (consistency of direction)
      const directionByCareer = this.calculateInfluenceDirection(corr);
      
      // Calculate influence stability
      const influenceStability = this.calculateInfluenceStability(corr, directionByCareer);

      importance.push({
        dimension,
        importanceScore: Math.round(importanceScore),
        rank: 0, // Will be set after sorting
        influenceMagnitude: Math.round(influenceMagnitude * 10) / 10,
        directionByCareer,
        influenceStability: Math.round(influenceStability * 100),
      });
    }

    // Sort and assign ranks
    importance.sort((a, b) => b.importanceScore - a.importanceScore);
    importance.forEach((f, i) => {
      f.rank = i + 1;
    });

    return importance;
  }

  /**
   * Calculate influence direction for each career
   */
  private calculateInfluenceDirection(
    corr: DimensionCorrelation
  ): Map<string, 'POSITIVE' | 'NEGATIVE' | 'MIXED'> {
    const directions = new Map<string, 'POSITIVE' | 'NEGATIVE' | 'MIXED'>();

    for (const [careerId, ranks] of corr.rankChanges) {
      if (ranks.length < 2 || corr.deltas.length < 2) {
        directions.set(careerId, 'MIXED');
        continue;
      }

      // Calculate correlation between dimension delta and rank
      let positiveCorrelations = 0;
      let negativeCorrelations = 0;

      for (let i = 1; i < Math.min(ranks.length, corr.deltas.length); i++) {
        const deltaChange = corr.deltas[i] - corr.deltas[i - 1];
        const rankChange = ranks[i] - ranks[i - 1];
        
        // Negative correlation: higher delta = lower rank (better)
        if (deltaChange * rankChange < 0) {
          positiveCorrelations++;
        } else if (deltaChange * rankChange > 0) {
          negativeCorrelations++;
        }
      }

      const total = positiveCorrelations + negativeCorrelations;
      if (total === 0) {
        directions.set(careerId, 'MIXED');
      } else {
        const positiveRatio = positiveCorrelations / total;
        if (positiveRatio > 0.7) {
          directions.set(careerId, 'POSITIVE');
        } else if (positiveRatio < 0.3) {
          directions.set(careerId, 'NEGATIVE');
        } else {
          directions.set(careerId, 'MIXED');
        }
      }
    }

    return directions;
  }

  /**
   * Calculate influence stability
   */
  private calculateInfluenceStability(
    corr: DimensionCorrelation,
    directions: Map<string, 'POSITIVE' | 'NEGATIVE' | 'MIXED'>
  ): number {
    let consistentCount = 0;
    let totalCount = 0;

    for (const direction of directions.values()) {
      totalCount++;
      if (direction === 'POSITIVE' || direction === 'NEGATIVE') {
        consistentCount++;
      }
    }

    return totalCount > 0 ? consistentCount / totalCount : 0;
  }

  /**
   * Calculate sensitivity weights for dimension-career pairs
   */
  private calculateSensitivityWeights(
    correlations: Map<string, DimensionCorrelation>,
    topCareers: number
  ): SensitivityWeight[] {
    const weights: SensitivityWeight[] = [];

    for (const [dimension, corr] of correlations) {
      // Get top careers by appearance frequency
      const careerImpactScores = new Map<string, number>();
      
      for (const [careerId, ranks] of corr.rankChanges) {
        if (ranks.length < 2) continue;
        
        const rankVariance = this.calculateVariance(ranks);
        const scores = corr.scoreChanges.get(careerId);
        const scoreVariance = scores && scores.length > 1 
          ? this.calculateVariance(scores) 
          : 0;
        
        const impactScore = rankVariance * 10 + scoreVariance * 0.01;
        careerImpactScores.set(careerId, impactScore);
      }

      // Get top careers for this dimension
      const sortedCareers = Array.from(careerImpactScores.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, topCareers);

      for (const [careerId, impactScore] of sortedCareers) {
        // Calculate correlation coefficient
        const deltas = corr.deltas;
        const ranks = corr.rankChanges.get(careerId);
        
        if (!ranks || deltas.length !== ranks.length) continue;

        const correlation = this.calculatePearsonCorrelation(deltas, ranks);
        
        weights.push({
          dimension,
          careerId,
          weight: Math.round(correlation * 100) / 100,
          recommendationImpact: Math.round(impactScore * 10) / 10,
          confidence: Math.min(100, Math.abs(correlation) * 100 + deltas.length),
        });
      }
    }

    return weights.sort((a, b) => 
      Math.abs(b.recommendationImpact) - Math.abs(a.recommendationImpact)
    );
  }

  /**
   * Calculate Pearson correlation coefficient
   */
  private calculatePearsonCorrelation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    if (n < 2) return 0;

    const xSlice = x.slice(0, n);
    const ySlice = y.slice(0, n);

    const sumX = xSlice.reduce((a, b) => a + b, 0);
    const sumY = ySlice.reduce((a, b) => a + b, 0);
    const sumXY = xSlice.reduce((sum, xi, i) => sum + xi * ySlice[i], 0);
    const sumX2 = xSlice.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = ySlice.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt(
      (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
    );

    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Calculate dimension impacts
   */
  private calculateDimensionImpacts(
    correlations: Map<string, DimensionCorrelation>,
    featureImportance: FeatureImportance[]
  ): DimensionImpact[] {
    const impacts: DimensionImpact[] = [];

    for (const [dimension, corr] of correlations) {
      const importance = featureImportance.find(f => f.dimension === dimension);
      if (!importance) continue;

      const affectedCareers: Array<{
        careerId: string;
        impactDirection: 'INCREASES' | 'DECREASES' | 'MIXED';
        magnitude: number;
      }> = [];

      for (const [careerId, ranks] of corr.rankChanges) {
        if (ranks.length < 2) continue;

        const rankVariance = this.calculateVariance(ranks);
        const scores = corr.scoreChanges.get(careerId);
        const scoreVariance = scores && scores.length > 1
          ? this.calculateVariance(scores)
          : 0;

        const magnitude = rankVariance * 5 + scoreVariance * 0.05;

        // Determine impact direction
        const direction = importance.directionByCareer.get(careerId);
        let impactDirection: 'INCREASES' | 'DECREASES' | 'MIXED';
        
        if (direction === 'POSITIVE') {
          impactDirection = 'INCREASES';
        } else if (direction === 'NEGATIVE') {
          impactDirection = 'DECREASES';
        } else {
          impactDirection = 'MIXED';
        }

        affectedCareers.push({
          careerId,
          impactDirection,
          magnitude: Math.round(magnitude * 10) / 10,
        });
      }

      // Sort by magnitude
      affectedCareers.sort((a, b) => b.magnitude - a.magnitude);

      // Calculate change threshold
      const changeThreshold = this.estimateChangeThreshold(corr);

      impacts.push({
        dimension,
        impactScore: importance.importanceScore,
        affectedCareers: affectedCareers.slice(0, 5),
        changeThreshold,
        explanation: this.generateDimensionExplanation(dimension, importance, affectedCareers),
      });
    }

    return impacts.sort((a, b) => b.impactScore - a.impactScore);
  }

  /**
   * Estimate change threshold for significant recommendation changes
   */
  private estimateChangeThreshold(corr: DimensionCorrelation): number {
    // Calculate based on average delta magnitude that causes rank changes
    const avgDeltaMagnitude = corr.deltas.reduce((sum, d) => sum + Math.abs(d), 0) / corr.deltas.length;
    
    // Threshold is typically 2-3x the average perturbation
    return Math.round(Math.max(5, avgDeltaMagnitude * 2.5));
  }

  /**
   * Calculate change thresholds for all dimensions
   */
  private calculateChangeThresholds(
    correlations: Map<string, DimensionCorrelation>
  ): Map<string, number> {
    const thresholds = new Map<string, number>();

    for (const [dimension, corr] of correlations) {
      thresholds.set(dimension, this.estimateChangeThreshold(corr));
    }

    return thresholds;
  }

  /**
   * Generate human-readable explanation
   */
  private generateExplanation(featureImportance: FeatureImportance[]): string {
    if (featureImportance.length === 0) {
      return 'Insufficient data to determine influential factors.';
    }

    const top3 = featureImportance.slice(0, 3);
    const dimensionNames = top3.map(f => f.dimension).join(', ');

    let explanation = `The most influential factors in your recommendations are ${dimensionNames}. `;

    const topFactor = top3[0];
    if (topFactor.importanceScore >= 80) {
      explanation += `${topFactor.dimension} has a very strong influence on your career recommendations.`;
    } else if (topFactor.importanceScore >= 60) {
      explanation += `${topFactor.dimension} significantly shapes your career direction.`;
    } else {
      explanation += `Multiple factors contribute to your recommendations with no single dominant factor.`;
    }

    return explanation;
  }

  /**
   * Generate insights about sensitivity
   */
  private generateInsights(
    featureImportance: FeatureImportance[],
    correlations: Map<string, DimensionCorrelation>
  ): string[] {
    const insights: string[] = [];

    // Insight 1: Dominant factors
    if (featureImportance.length > 0) {
      const topFactor = featureImportance[0];
      if (topFactor.importanceScore >= 70) {
        insights.push(`${topFactor.dimension} is the dominant factor in your recommendations - small changes here have the biggest impact.`);
      } else if (featureImportance[0].importanceScore - featureImportance[1]?.importanceScore < 10) {
        insights.push('Multiple factors are equally important in shaping your recommendations.');
      }
    }

    // Insight 2: Stable vs volatile influences
    const stableInfluences = featureImportance.filter(f => f.influenceStability >= 70);
    const volatileInfluences = featureImportance.filter(f => f.influenceStability < 50);

    if (stableInfluences.length > 0) {
      insights.push(`${stableInfluences[0].dimension} shows consistent influence across different scenarios.`);
    }

    if (volatileInfluences.length > 0) {
      insights.push(`${volatileInfluences[0].dimension} has variable impact depending on other factors.`);
    }

    // Insight 3: Threshold sensitivity
    const highImpactDimensions = featureImportance.filter(f => f.influenceMagnitude > 5);
    if (highImpactDimensions.length > 0) {
      insights.push('Your recommendations are sensitive to changes in key dimensions - moderate shifts could alter your top career match.');
    } else {
      insights.push('Your recommendations are relatively robust - significant changes needed to alter outcomes.');
    }

    return insights;
  }

  /**
   * Generate explanation for a specific dimension
   */
  private generateDimensionExplanation(
    dimension: string,
    importance: FeatureImportance,
    affectedCareers: Array<{
      careerId: string;
      impactDirection: 'INCREASES' | 'DECREASES' | 'MIXED';
      magnitude: number;
    }>
  ): string {
    const direction = importance.directionByCareer.get(affectedCareers[0]?.careerId);
    
    let explanation = `${dimension} has `;
    
    if (importance.importanceScore >= 80) {
      explanation += 'very high influence';
    } else if (importance.importanceScore >= 60) {
      explanation += 'high influence';
    } else if (importance.importanceScore >= 40) {
      explanation += 'moderate influence';
    } else {
      explanation += 'low influence';
    }

    explanation += ' on recommendations.';

    if (affectedCareers.length > 0) {
      const topCareer = affectedCareers[0];
      explanation += ` Changes in this dimension ${topCareer.impactDirection.toLowerCase()} the ranking of ${topCareer.careerId}.`;
    }

    return explanation;
  }

  /**
   * Calculate variance of an array
   */
  private calculateVariance(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * Get most sensitive dimensions for a specific career
   */
  getSensitiveDimensionsForCareer(
    sensitivityResult: SensitivityResult,
    careerId: string,
    topN: number = 3
  ): Array<{ dimension: string; sensitivity: number }> {
    const relevant = sensitivityResult.sensitivityWeights.filter(
      w => w.careerId === careerId
    );

    return relevant
      .sort((a, b) => Math.abs(b.recommendationImpact) - Math.abs(a.recommendationImpact))
      .slice(0, topN)
      .map(w => ({
        dimension: w.dimension,
        sensitivity: Math.abs(w.recommendationImpact),
      }));
  }

  /**
   * Predict recommendation changes from dimension changes
   */
  predictChanges(
    sensitivityResult: SensitivityResult,
    dimensionChanges: Map<string, number>
  ): Array<{
    careerId: string;
    predictedRankChange: number;
    confidence: number;
  }> {
    const predictions = new Map<string, { totalChange: number; confidenceSum: number; count: number }>();

    for (const [dimension, change] of dimensionChanges) {
      const weights = sensitivityResult.sensitivityWeights.filter(
        w => w.dimension === dimension
      );

      for (const weight of weights) {
        if (!predictions.has(weight.careerId)) {
          predictions.set(weight.careerId, { totalChange: 0, confidenceSum: 0, count: 0 });
        }

        const pred = predictions.get(weight.careerId)!;
        pred.totalChange += weight.weight * change * 0.1; // Scale factor
        pred.confidenceSum += weight.confidence;
        pred.count++;
      }
    }

    return Array.from(predictions.entries()).map(([careerId, data]) => ({
      careerId,
      predictedRankChange: Math.round(data.totalChange * 10) / 10,
      confidence: Math.round(data.confidenceSum / data.count),
    }));
  }
}

/**
 * Factory function for creating sensitivity analysis engine
 */
export function createSensitivityAnalysisEngine(): SensitivityAnalysisEngine {
  return new SensitivityAnalysisEngine();
}

/**
 * Quick sensitivity analysis
 */
export function analyzeQuickSensitivity(
  baseProfile: DimensionScoreMap,
  perturbedProfiles: PerturbedProfile[],
  perturbedRecommendations: Map<PerturbationId, RecommendationSet>
): SensitivityResult {
  const engine = new SensitivityAnalysisEngine();
  return engine.analyzeSensitivity(
    baseProfile,
    perturbedProfiles,
    perturbedRecommendations
  );
}

/**
 * Check if profile is highly sensitive (unstable)
 */
export function isProfileHighlySensitive(
  sensitivityResult: SensitivityResult,
  threshold: number = 70
): boolean {
  const topFactor = sensitivityResult.featureImportance[0];
  return topFactor ? topFactor.importanceScore >= threshold : false;
}
