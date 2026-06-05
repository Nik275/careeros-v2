/**
 * Similar Student Engine
 * 
 * Identifies students with similar profiles for peer comparison,
 * outcome learning, and recommendation enhancement.
 * 
 * Compatible with future outcome learning pipeline.
 */

import type { StudentBeliefV3 } from '../types/index.js';
import type { EntityId } from '../types/index.js';

import {
  calculateOverallSimilarity,
  calculatePsychologicalSimilarity,
  calculateEconomicSimilarity,
  calculateEducationalSimilarity,
  calculateUtilitySimilarity,
  calculateLifestyleSimilarity,
} from './calculators.js';

import { generateExplanation } from './explanations.js';

import type {
  SimilarityAnalysis,
  SimilarStudentMatch,
  FindSimilarStudentsInput,
  FindSimilarStudentsOutput,
  SimilarityStatistics,
  DimensionWeights,
  SimilarStudentEngineConfig,
} from './types.js';

import { DEFAULT_CONFIG, SimilarityPresets } from './types.js';

// ============================================================================
// SIMILAR STUDENT ENGINE
// ============================================================================

/**
 * Engine for finding and analyzing similar students.
 */
export class SimilarStudentEngine {
  private config: SimilarStudentEngineConfig;

  constructor(config: Partial<SimilarStudentEngineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get current configuration.
   */
  getConfig(): SimilarStudentEngineConfig {
    return { ...this.config };
  }

  /**
   * Update configuration.
   */
  updateConfig(config: Partial<SimilarStudentEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // ========================================================================
  // MAIN API
  // ========================================================================

  /**
   * Find students similar to the reference student.
   * 
   * This is the primary API for finding peer matches.
   */
  findSimilarStudents(input: FindSimilarStudentsInput): FindSimilarStudentsOutput {
    const startTime = performance.now();
    
    const {
      referenceStudent,
      candidatePool,
      topK = this.config.defaultTopK,
      minThreshold = this.config.defaultThreshold,
      priorityDimensions,
      dimensionWeights,
      includeExplanations = true,
    } = input;

    // Merge custom weights with defaults
    const weights: DimensionWeights = {
      ...this.config.defaultWeights,
      ...dimensionWeights,
    };

    // Adjust weights if priority dimensions specified
    const finalWeights = priorityDimensions 
      ? this.adjustWeightsForPriority(weights, priorityDimensions)
      : weights;

    // Calculate similarity for all candidates
    const similarities: SimilarStudentMatch[] = [];
    
    for (const candidate of candidatePool) {
      // Skip self-comparison
      if (candidate.studentId === referenceStudent.studentId) continue;

      const match = this.calculateSimilarityMatch(
        referenceStudent,
        candidate,
        finalWeights,
        includeExplanations
      );

      // Apply threshold filter
      if (match.similarityScore >= minThreshold) {
        similarities.push(match);
      }
    }

    // Sort by similarity (descending)
    similarities.sort((a, b) => b.similarityScore - a.similarityScore);

    // Assign ranks
    const ranked = similarities.map((match, index) => ({
      ...match,
      rank: index + 1,
    }));

    // Take top K
    const topMatches = ranked.slice(0, topK);

    const computationTime = performance.now() - startTime;

    return {
      referenceStudentId: referenceStudent.studentId,
      similarStudents: topMatches,
      statistics: this.calculateStatistics(similarities.map(s => s.similarityScore)),
      metadata: {
        poolSize: candidatePool.length,
        candidatesConsidered: similarities.length,
        threshold: minThreshold,
        computationTimeMs: computationTime,
      },
    };
  }

  /**
   * Calculate detailed similarity analysis between two specific students.
   * 
   * Use this for detailed comparison of two known students.
   */
  analyzeSimilarity(
    studentA: StudentBeliefV3,
    studentB: StudentBeliefV3,
    customWeights?: Partial<DimensionWeights>
  ): SimilarityAnalysis {
    const weights = { ...this.config.defaultWeights, ...customWeights };
    
    const psychSim = calculatePsychologicalSimilarity(studentA, studentB);
    const econSim = calculateEconomicSimilarity(studentA, studentB);
    const eduSim = calculateEducationalSimilarity(studentA, studentB);
    const utilSim = calculateUtilitySimilarity(studentA, studentB);
    const lifeSim = calculateLifestyleSimilarity(studentA, studentB);

    const similarities = [
      psychSim.score * weights.psychological,
      econSim.score * weights.economic,
      eduSim.score * weights.educational,
      utilSim.score * weights.utility,
      lifeSim.score * weights.lifestyle,
    ];
    
    const overallScore = similarities.reduce((a, b) => a + b, 0);

    const explanation = generateExplanation(
      studentA,
      studentB,
      {
        psychological: psychSim,
        economic: econSim,
        educational: eduSim,
        utility: utilSim,
        lifestyle: lifeSim,
      },
      overallScore
    );

    return {
      referenceStudentId: studentA.studentId,
      comparisonStudentId: studentB.studentId,
      overallScore,
      dimensions: {
        psychological: psychSim,
        economic: econSim,
        educational: eduSim,
        utility: utilSim,
        lifestyle: lifeSim,
      },
      explanation,
      confidence: this.calculateOverallConfidence([psychSim, econSim, eduSim, utilSim, lifeSim]),
      computedAt: Date.now(),
    };
  }

  /**
   * Batch compare a student against multiple candidates.
   * 
   * Efficient for comparing one student against a large pool.
   */
  batchCompare(
    referenceStudent: StudentBeliefV3,
    candidates: StudentBeliefV3[],
    options: {
      threshold?: number;
      maxResults?: number;
      weights?: Partial<DimensionWeights>;
    } = {}
  ): SimilarStudentMatch[] {
    const threshold = options.threshold ?? this.config.defaultThreshold;
    const maxResults = options.maxResults ?? this.config.defaultTopK;
    const weights = { ...this.config.defaultWeights, ...options.weights };

    const matches: SimilarStudentMatch[] = [];

    for (const candidate of candidates) {
      if (candidate.studentId === referenceStudent.studentId) continue;

      const match = this.calculateSimilarityMatch(
        referenceStudent,
        candidate,
        weights,
        false // Skip explanations for batch
      );

      if (match.similarityScore >= threshold) {
        matches.push(match);
      }
    }

    matches.sort((a, b) => b.similarityScore - a.similarityScore);
    
    return matches.slice(0, maxResults).map((match, index) => ({
      ...match,
      rank: index + 1,
    }));
  }

  // ========================================================================
  // OUTCOME LEARNING COMPATIBILITY
  // ========================================================================

  /**
   * Find students similar enough for outcome learning.
   * 
   * This is optimized for the outcome learning pipeline.
   * Uses preset weights optimized for outcome prediction.
   */
  findPeersForOutcomeLearning(
    referenceStudent: StudentBeliefV3,
    candidatePool: StudentBeliefV3[],
    outcomeType: 'career_choice' | 'satisfaction' | 'income' | 'growth',
    minSimilarity: number = 0.6
  ): Array<{ student: StudentBeliefV3; similarity: number; relevantDimensions: string[] }> {
    // Use outcome learning preset
    const weights = { ...this.config.defaultWeights, ...SimilarityPresets.forOutcomeLearning() };
    
    // Adjust weights based on outcome type
    const adjustedWeights = this.adjustWeightsForOutcome(weights, outcomeType);

    const peers: Array<{ student: StudentBeliefV3; similarity: number; relevantDimensions: string[] }> = [];

    for (const candidate of candidatePool) {
      if (candidate.studentId === referenceStudent.studentId) continue;

      const result = calculateOverallSimilarity(referenceStudent, candidate, adjustedWeights);
      
      if (result.score >= minSimilarity) {
        // Identify which dimensions contributed most
        const relevantDimensions = this.identifyRelevantDimensions(result.dimensions);
        
        peers.push({
          student: candidate,
          similarity: result.score,
          relevantDimensions,
        });
      }
    }

    return peers.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Calculate similarity matrix for a group of students.
   * 
   * Useful for clustering and visualization.
   */
  calculateSimilarityMatrix(
    students: StudentBeliefV3[],
    options: {
      weights?: Partial<DimensionWeights>;
      symmetric?: boolean;
    } = {}
  ): Array<{ studentA: EntityId; studentB: EntityId; similarity: number }> {
    const weights = { ...this.config.defaultWeights, ...options.weights };
    const symmetric = options.symmetric ?? true;
    
    const results: Array<{ studentA: EntityId; studentB: EntityId; similarity: number }> = [];

    for (let i = 0; i < students.length; i++) {
      for (let j = symmetric ? i + 1 : 0; j < students.length; j++) {
        if (i === j) continue;

        const result = calculateOverallSimilarity(students[i], students[j], weights);
        
        results.push({
          studentA: students[i].studentId,
          studentB: students[j].studentId,
          similarity: result.score,
        });
      }
    }

    return results;
  }

  // ========================================================================
  // PRIVATE HELPERS
  // ========================================================================

  /**
   * Calculate a similarity match between two students.
   */
  private calculateSimilarityMatch(
    reference: StudentBeliefV3,
    candidate: StudentBeliefV3,
    weights: DimensionWeights,
    includeExplanations: boolean
  ): SimilarStudentMatch {
    const result = calculateOverallSimilarity(reference, candidate, weights);

    // Extract similarity factors from dimension details
    const similarityFactors: SimilarStudentMatch['similarityFactors'] = [];
    const differenceFactors: SimilarStudentMatch['differenceFactors'] = [];

    if (includeExplanations) {
      for (const dim of result.dimensions) {
        for (const detail of dim.details) {
          if (detail.similarity > 0.7) {
            similarityFactors.push({
              dimension: dim.weight.toString(),
              attribute: detail.aspect,
              score: detail.similarity,
              description: detail.description,
              weight: dim.weight,
            });
          } else if (detail.similarity < 0.4) {
            differenceFactors.push({
              dimension: dim.weight.toString(),
              attribute: detail.aspect,
              difference: 1 - detail.similarity,
              description: detail.description,
              impact: detail.similarity < 0.2 ? 'high' : 'medium',
            });
          }
        }
      }
    }

    return {
      studentId: candidate.studentId,
      studentBelief: candidate,
      similarityScore: result.score,
      dimensionScores: {
        psychological: result.dimensions[0].score,
        economic: result.dimensions[1].score,
        educational: result.dimensions[2].score,
        utility: result.dimensions[3].score,
        lifestyle: result.dimensions[4].score,
      },
      similarityFactors: similarityFactors.slice(0, 5), // Top 5
      differenceFactors: differenceFactors.slice(0, 3), // Top 3
      rank: 0, // Will be set later
    };
  }

  /**
   * Adjust weights to prioritize certain dimensions.
   */
  private adjustWeightsForPriority(
    weights: DimensionWeights,
    priorityDimensions: string[]
  ): DimensionWeights {
    const boost = 0.5; // 50% boost to priority dimensions
    
    const adjusted = { ...weights };
    let totalWeight = 0;

    // Boost priority dimensions
    for (const dim of priorityDimensions) {
      if (dim in adjusted) {
        adjusted[dim as keyof DimensionWeights] *= (1 + boost);
      }
    }

    // Normalize
    for (const key of Object.keys(adjusted)) {
      totalWeight += adjusted[key as keyof DimensionWeights];
    }

    for (const key of Object.keys(adjusted)) {
      adjusted[key as keyof DimensionWeights] /= totalWeight;
    }

    return adjusted;
  }

  /**
   * Adjust weights based on outcome type.
   */
  private adjustWeightsForOutcome(
    weights: DimensionWeights,
    outcomeType: string
  ): DimensionWeights {
    const adjusted = { ...weights };

    switch (outcomeType) {
      case 'career_choice':
        adjusted.psychological *= 1.3;
        adjusted.utility *= 1.2;
        break;
      case 'satisfaction':
        adjusted.psychological *= 1.4;
        adjusted.lifestyle *= 1.3;
        break;
      case 'income':
        adjusted.economic *= 1.4;
        adjusted.educational *= 1.2;
        break;
      case 'growth':
        adjusted.educational *= 1.3;
        adjusted.utility *= 1.2;
        break;
    }

    // Normalize
    const total = Object.values(adjusted).reduce((a, b) => a + b, 0);
    for (const key of Object.keys(adjusted)) {
      adjusted[key as keyof DimensionWeights] /= total;
    }

    return adjusted;
  }

  /**
   * Identify which dimensions are most relevant for similarity.
   */
  private identifyRelevantDimensions(
    dimensions: ReturnType<typeof calculateOverallSimilarity>['dimensions']
  ): string[] {
    const dimNames = ['psychological', 'economic', 'educational', 'utility', 'lifestyle'];
    const scores = dimensions.map(d => d.score);
    
    // Return dimensions with highest scores (most similar)
    return dimNames
      .map((name, i) => ({ name, score: scores[i] }))
      .filter(d => d.score > 0.6)
      .sort((a, b) => b.score - a.score)
      .map(d => d.name);
  }

  /**
   * Calculate overall confidence from dimension confidences.
   */
  private calculateOverallConfidence(
    dimensions: { confidence: number; weight: number }[]
  ): number {
    const totalWeight = dimensions.reduce((sum, d) => sum + d.weight, 0);
    const weightedConfidence = dimensions.reduce(
      (sum, d) => sum + d.confidence * d.weight,
      0
    );
    return weightedConfidence / totalWeight;
  }

  /**
   * Calculate statistics for similarity scores.
   */
  private calculateStatistics(scores: number[]): SimilarityStatistics {
    if (scores.length === 0) {
      return { mean: 0, median: 0, stdDev: 0, min: 0, max: 0, quartiles: [0, 0, 0] };
    }

    const sorted = [...scores].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    const median = sorted.length % 2 === 0
      ? (sorted[Math.floor(sorted.length / 2) - 1] + sorted[Math.floor(sorted.length / 2)]) / 2
      : sorted[Math.floor(sorted.length / 2)];

    const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    const q1Index = Math.floor(sorted.length * 0.25);
    const q2Index = Math.floor(sorted.length * 0.5);
    const q3Index = Math.floor(sorted.length * 0.75);

    return {
      mean,
      median,
      stdDev,
      min,
      max,
      quartiles: [sorted[q1Index], sorted[q2Index], sorted[q3Index]],
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a new SimilarStudentEngine instance.
 */
export function createSimilarStudentEngine(
  config?: Partial<SimilarStudentEngineConfig>
): SimilarStudentEngine {
  return new SimilarStudentEngine(config);
}

/**
 * Quick similarity check between two students.
 */
export function quickSimilarity(
  studentA: StudentBeliefV3,
  studentB: StudentBeliefV3,
  preset: keyof typeof SimilarityPresets = 'balanced'
): number {
  const engine = new SimilarStudentEngine();
  const weights = SimilarityPresets[preset]();
  const result = calculateOverallSimilarity(studentA, studentB, {
    ...DEFAULT_CONFIG.defaultWeights,
    ...weights,
  });
  return result.score;
}

/**
 * Find top K similar students using default settings.
 */
export function findSimilarStudentsQuick(
  reference: StudentBeliefV3,
  candidates: StudentBeliefV3[],
  topK: number = 5
): SimilarStudentMatch[] {
  const engine = new SimilarStudentEngine();
  const result = engine.findSimilarStudents({
    referenceStudent: reference,
    candidatePool: candidates,
    topK,
  });
  return result.similarStudents;
}
