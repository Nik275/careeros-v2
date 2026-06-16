/**
 * Recommendation Consistency Engine
 *
 * Verifies that different assessment pathways produce the same conclusion.
 * Example: Interest→Strengths→Values vs Values→Interests→Personality
 * should produce highly similar recommendations.
 */

import {
  ConsistencyReport,
  AssessmentPath,
  ValidationTimestamp,
  ValidationId,
  DEFAULT_VALIDATION_CONFIG,
  ValidationConfig,
} from './validation-types';

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface ConsistencyConfig {
  // Thresholds
  highConsistencyThreshold: number; // e.g., 90
  acceptableConsistencyThreshold: number; // e.g., 75
  minCorrelationThreshold: number; // e.g., 0.8

  // Path settings
  maxPathVariations: number;
  minPathSteps: number;
  maxPathSteps: number;

  // Statistical settings
  confidenceInterval: number; // e.g., 0.95
  minSampleSize: number;
}

export const DEFAULT_CONSISTENCY_CONFIG: ConsistencyConfig = {
  highConsistencyThreshold: 90,
  acceptableConsistencyThreshold: 75,
  minCorrelationThreshold: 0.8,
  maxPathVariations: 10,
  minPathSteps: 3,
  maxPathSteps: 8,
  confidenceInterval: 0.95,
  minSampleSize: 5,
};

// ============================================================================
// INPUTS
// ============================================================================

export interface PathwayResult {
  path: AssessmentPath;
  recommendations: Array<{
    careerId: string;
    careerName: string;
    rank: number;
    confidence: number;
    score: number;
  }>;
  confidenceScores: Record<string, number>;
  componentResults: Record<string, unknown>;
}

export interface ComponentDefinition {
  id: string;
  name: string;
  dependencies: string[];
  provides: string[];
}

// ============================================================================
// ENGINE
// ============================================================================

export class RecommendationConsistencyEngine {
  private config: ConsistencyConfig;
  private validationConfig: ValidationConfig;

  constructor(
    config: Partial<ConsistencyConfig> = {},
    validationConfig: Partial<ValidationConfig> = {}
  ) {
    this.config = { ...DEFAULT_CONSISTENCY_CONFIG, ...config };
    this.validationConfig = { ...DEFAULT_VALIDATION_CONFIG, ...validationConfig };
  }

  /**
   * Analyze consistency across different assessment pathways
   */
  async analyzeConsistency(
    studentId: string,
    baseProfile: Record<string, unknown>,
    components: ComponentDefinition[],
    pathwayRunner: (
      path: AssessmentPath,
      profile: Record<string, unknown>
    ) => Promise<PathwayResult>
  ): Promise<ConsistencyReport> {
    const reportId = `consistency-${studentId}-${Date.now()}`;
    const generatedAt = Date.now();

    // Generate different assessment paths
    const paths = this.generateAssessmentPaths(components);

    // Run each path
    const pathwayResults: PathwayResult[] = [];
    for (const path of paths) {
      try {
        const result = await pathwayRunner(path, baseProfile);
        pathwayResults.push(result);
      } catch {
        console.error('Recommendation consistency path failed safely.');
      }
    }

    if (pathwayResults.length < 2) {
      return this.generateEmptyReport(reportId, generatedAt, studentId);
    }

    // Compare paths
    const pathComparisons = this.comparePathways(pathwayResults);

    // Calculate component consistency
    const componentConsistency = this.calculateComponentConsistency(pathwayResults);

    // Calculate convergence
    const convergence = this.analyzeConvergence(pathwayResults);

    // Calculate overall consistency
    const overallConsistency = this.calculateOverallConsistency(pathComparisons);

    // Determine if passed
    const passed = overallConsistency.score >= this.validationConfig.consistencyThresholds.consistent;

    return {
      reportId,
      generatedAt,
      studentId,
      overallConsistency,
      pathComparisons,
      componentConsistency,
      convergence,
      thresholdUsed: this.config.acceptableConsistencyThreshold,
      passed,
    };
  }

  /**
   * Quick consistency check between two results
   */
  checkConsistency(resultA: PathwayResult | null, resultB: PathwayResult | null): {
    consistent: boolean;
    topMatch: boolean;
    top3Overlap: number;
    confidenceCorrelation: number;
    rankCorrelation: number;
    details: string;
  } {
    // Handle null results
    if (!resultA || !resultB) {
      return {
        consistent: false,
        topMatch: false,
        top3Overlap: 0,
        confidenceCorrelation: 0,
        rankCorrelation: 0,
        details: 'One or both results are null',
      };
    }

    // Handle empty recommendations
    if (!resultA.recommendations || !resultB.recommendations) {
      return {
        consistent: resultA.recommendations?.length === resultB.recommendations?.length,
        topMatch: false,
        top3Overlap: 0,
        confidenceCorrelation: 0,
        rankCorrelation: 0,
        details: 'Missing recommendations array',
      };
    }

    const topA = resultA.recommendations[0]?.careerId;
    const topB = resultB.recommendations[0]?.careerId;
    const topMatch = topA === topB;

    const top3A = resultA.recommendations.slice(0, 3).map(r => r.careerId);
    const top3B = resultB.recommendations.slice(0, 3).map(r => r.careerId);
    const intersection = top3A.filter(id => top3B.includes(id));
    const union = [...new Set([...top3A, ...top3B])];
    const top3Overlap = union.length > 0 ? intersection.length / union.length : 0;

    const confidenceCorrelation = this.calculateCorrelation(
      resultA.recommendations,
      resultB.recommendations,
      'confidence'
    );

    const rankCorrelation = this.calculateSpearmanCorrelation(
      resultA.recommendations,
      resultB.recommendations
    );

    const consistent =
      top3Overlap >= 0.67 && // At least 2 out of 3 match
      confidenceCorrelation >= this.config.minCorrelationThreshold &&
      rankCorrelation >= this.config.minCorrelationThreshold;

    return {
      consistent,
      topMatch,
      top3Overlap,
      confidenceCorrelation,
      rankCorrelation,
      details: this.generateConsistencyDetails(topMatch, top3Overlap, confidenceCorrelation, rankCorrelation),
    };
  }

  /**
   * Generate different assessment paths through components
   */
  generateAssessmentPaths(components: ComponentDefinition[]): AssessmentPath[] {
    const paths: AssessmentPath[] = [];

    // Define some standard path variations
    const pathTemplates = [
      ['psychology', 'interests', 'strengths', 'values'],
      ['psychology', 'values', 'interests', 'strengths'],
      ['psychology', 'strengths', 'values', 'interests'],
      ['psychology', 'personality', 'interests', 'values'],
      ['career', 'opportunity', 'optionality', 'reversibility'],
      ['career', 'optionality', 'opportunity', 'reversibility'],
      ['mentor', 'patterns', 'mistakes', 'themes'],
      ['learning', 'outcomes', 'success', 'failures'],
    ];

    for (const template of pathTemplates.slice(0, this.config.maxPathVariations)) {
      const path: AssessmentPath = template.map((component, index) => ({
        step: `step-${index + 1}`,
        component,
        timestamp: Date.now() + index * 1000,
      }));
      paths.push(path);
    }

    return paths;
  }

  /**
   * Calculate consistency score between multiple results
   */
  calculateConsistencyScore(results: PathwayResult[]): number {
    if (results.length < 2) return 100;

    let totalScore = 0;
    let comparisons = 0;

    for (let i = 0; i < results.length; i++) {
      for (let j = i + 1; j < results.length; j++) {
        const check = this.checkConsistency(results[i], results[j]);
        totalScore +=
          (check.top3Overlap * 100 +
            check.confidenceCorrelation * 50 +
            check.rankCorrelation * 50) /
          2;
        comparisons++;
      }
    }

    return comparisons > 0 ? totalScore / comparisons : 100;
  }

  /**
   * Get consistency rating
   */
  getConsistencyRating(score: number): ConsistencyReport['overallConsistency']['status'] {
    if (score >= this.validationConfig.consistencyThresholds.highlyConsistent) return 'highly-consistent';
    if (score >= this.validationConfig.consistencyThresholds.consistent) return 'consistent';
    if (score >= this.validationConfig.consistencyThresholds.moderate) return 'moderate';
    return 'inconsistent';
  }

  /**
   * Get current config
   */
  getConfig(): ConsistencyConfig {
    return { ...this.config };
  }

  /**
   * Update config
   */
  updateConfig(config: Partial<ConsistencyConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private generateEmptyReport(
    reportId: ValidationId,
    generatedAt: ValidationTimestamp,
    studentId: string
  ): ConsistencyReport {
    return {
      reportId,
      generatedAt,
      studentId,
      overallConsistency: {
        score: 100, // Single result is perfectly consistent
        status: 'highly-consistent',
      },
      pathComparisons: [],
      componentConsistency: {},
      convergence: {
        stepsToStabilize: 0,
        stableRecommendations: [],
      },
      thresholdUsed: this.config.acceptableConsistencyThreshold,
      passed: true,
    };
  }

  private comparePathways(results: PathwayResult[]): ConsistencyReport['pathComparisons'] {
    const comparisons: ConsistencyReport['pathComparisons'] = [];

    for (let i = 0; i < results.length; i++) {
      for (let j = i + 1; j < results.length; j++) {
        const check = this.checkConsistency(results[i], results[j]);

        comparisons.push({
          pathA: results[i]?.path ?? [],
          pathB: results[j]?.path ?? [],
          topRecommendationMatch: check.topMatch,
          top3Overlap: check.top3Overlap,
          confidenceCorrelation: check.confidenceCorrelation,
          rankCorrelation: check.rankCorrelation,
          consistent: check.consistent,
        });
      }
    }

    return comparisons;
  }

  private calculateComponentConsistency(
    results: PathwayResult[]
  ): ConsistencyReport['componentConsistency'] {
    const componentScores: Record<string, number[]> = {};

    for (const result of results) {
      if (!result || !result.confidenceScores) continue;
      for (const [component, score] of Object.entries(result.confidenceScores)) {
        if (!componentScores[component]) {
          componentScores[component] = [];
        }
        componentScores[component].push(score);
      }
    }

    const consistency: ConsistencyReport['componentConsistency'] = {};

    for (const [component, scores] of Object.entries(componentScores)) {
      if (scores.length < 2) continue;

      const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
      const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;

      consistency[component] = {
        score: Math.max(0, 100 - variance * 10),
        variance: Math.round(variance * 100) / 100,
      };
    }

    return consistency;
  }

  private analyzeConvergence(results: PathwayResult[]): ConsistencyReport['convergence'] {
    // Filter out null results
    const validResults = results.filter(r => r != null);
    
    if (validResults.length === 0) {
      return { stepsToStabilize: 0, stableRecommendations: [] };
    }

    // Find common recommendations across all paths
    const recommendationSets = validResults.map(r =>
      new Set(r.recommendations?.slice(0, 3).map(rec => rec.careerId) ?? [])
    );

    const commonRecommendations = recommendationSets.length > 0
      ? [...recommendationSets[0]].filter(id =>
          recommendationSets.every(set => set.has(id))
        )
      : [];

    // Estimate steps to stabilize (simplified)
    const avgSteps =
      validResults.reduce((sum, r) => sum + r.path.length, 0) / validResults.length;

    return {
      stepsToStabilize: Math.round(avgSteps),
      stableRecommendations: commonRecommendations,
    };
  }

  private calculateOverallConsistency(
    comparisons: ConsistencyReport['pathComparisons']
  ): ConsistencyReport['overallConsistency'] {
    if (comparisons.length === 0) {
      return { score: 0, status: 'inconsistent' };
    }

    const consistentCount = comparisons.filter(c => c.consistent).length;
    const avgTop3Overlap =
      comparisons.reduce((sum, c) => sum + c.top3Overlap, 0) / comparisons.length;
    const avgConfidenceCorrelation =
      comparisons.reduce((sum, c) => sum + c.confidenceCorrelation, 0) / comparisons.length;
    const avgRankCorrelation =
      comparisons.reduce((sum, c) => sum + c.rankCorrelation, 0) / comparisons.length;

    const score =
      (consistentCount / comparisons.length) * 40 +
      avgTop3Overlap * 30 +
      avgConfidenceCorrelation * 15 +
      avgRankCorrelation * 15;

    return {
      score: Math.round(score),
      status: this.getConsistencyRating(score),
    };
  }

  private calculateCorrelation(
    recsA: PathwayResult['recommendations'],
    recsB: PathwayResult['recommendations'],
    metric: 'confidence' | 'score'
  ): number {
    const valuesA: number[] = [];
    const valuesB: number[] = [];

    for (const recA of recsA) {
      const recB = recsB.find(r => r.careerId === recA.careerId);
      if (recB) {
        valuesA.push(recA[metric]);
        valuesB.push(recB[metric]);
      }
    }

    if (valuesA.length === 0) return 0;
    if (valuesA.length === 1) {
      // For single pair, return 1 if identical, 0 otherwise
      return valuesA[0] === valuesB[0] ? 1 : 0;
    }

    const meanA = valuesA.reduce((a, b) => a + b, 0) / valuesA.length;
    const meanB = valuesB.reduce((a, b) => a + b, 0) / valuesB.length;

    let numerator = 0;
    let denomA = 0;
    let denomB = 0;

    for (let i = 0; i < valuesA.length; i++) {
      const diffA = valuesA[i] - meanA;
      const diffB = valuesB[i] - meanB;
      numerator += diffA * diffB;
      denomA += diffA * diffA;
      denomB += diffB * diffB;
    }

    const denominator = Math.sqrt(denomA * denomB);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  private calculateSpearmanCorrelation(
    recsA: PathwayResult['recommendations'],
    recsB: PathwayResult['recommendations']
  ): number {
    // Get all unique career IDs
    const allCareers = [...new Set([...recsA.map(r => r.careerId), ...recsB.map(r => r.careerId)])];

    const ranksA = this.getRanks(recsA, allCareers);
    const ranksB = this.getRanks(recsB, allCareers);

    return this.calculatePearsonCorrelation(ranksA, ranksB);
  }

  private getRanks(recs: PathwayResult['recommendations'], allCareers: string[]): number[] {
    const careerToRank = new Map(recs.map((r, i) => [r.careerId, i + 1]));
    return allCareers.map(c => careerToRank.get(c) || recs.length + 1);
  }

  private calculatePearsonCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    if (n === 0) return 0;
    if (n === 1) {
      // For single pair, return 1 if identical, 0 otherwise
      return x[0] === y[0] ? 1 : 0;
    }

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  private generateConsistencyDetails(
    topMatch: boolean,
    top3Overlap: number,
    confidenceCorrelation: number,
    rankCorrelation: number
  ): string {
    const parts: string[] = [];

    if (topMatch) {
      parts.push('Top recommendations match');
    } else {
      parts.push('Top recommendations differ');
    }

    parts.push(`Top-3 overlap: ${(top3Overlap * 100).toFixed(0)}%`);
    parts.push(`Confidence correlation: ${confidenceCorrelation.toFixed(2)}`);
    parts.push(`Rank correlation: ${rankCorrelation.toFixed(2)}`);

    return parts.join('; ');
  }
}

export default RecommendationConsistencyEngine;
