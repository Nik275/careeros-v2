/**
 * Recommendation Stability Engine
 *
 * Phase 8.4: Recommendation Stability Engine - Main Orchestrator
 *
 * Coordinates all stability components:
 * - Perturbation Engine
 * - Recommendation Consensus Engine
 * - Confidence Engine
 * - Stability Engine
 * - Volatility Engine
 * - Sensitivity Analysis Engine
 * - Uncertainty Engine
 * - Student Explanation Engine
 *
 * Provides unified interface for stability analysis.
 *
 * @module recommendation-stability-engine
 * @version 1.0.0
 */

import {
  DimensionScoreMap,
} from '../../assessment/assessment-types';
import {
  RecommendationSet,
} from '../../recommendation/recommendation-types';
import {
  StabilityAnalysis,
  StabilityAnalysisInput,
  StabilityAnalysisConfig,
  StabilityAnalysisId,
  StabilityTelemetry,
  MentorStabilityContext,
  RecommendationStabilityContext,
  type PerturbationId,
  DEFAULT_STABILITY_ANALYSIS_CONFIG,
} from './recommendation-stability-types';

import { PerturbationEngine, createPerturbationEngine } from './perturbation-engine';
import { RecommendationConsensusEngine, createConsensusEngine } from './recommendation-consensus-engine';
import { ConfidenceEngine, createConfidenceEngine } from './confidence-engine';
import { StabilityEngine, createStabilityEngine } from './stability-engine';
import { VolatilityEngine, createVolatilityEngine } from './volatility-engine';
import { SensitivityAnalysisEngine, createSensitivityAnalysisEngine } from './sensitivity-analysis-engine';
import { UncertaintyEngine, createUncertaintyEngine } from './uncertainty-engine';
import { StudentExplanationEngine, createStudentExplanationEngine } from './student-explanation-engine';

/**
 * Recommendation generation function type
 * Provided by the consumer to generate recommendations for perturbed profiles
 */
export type RecommendationGenerator = (
  profile: DimensionScoreMap
) => Promise<RecommendationSet> | RecommendationSet;

/**
 * Main Recommendation Stability Engine
 */
export class RecommendationStabilityEngine {
  private perturbationEngine: PerturbationEngine;
  private consensusEngine: RecommendationConsensusEngine;
  private confidenceEngine: ConfidenceEngine;
  private stabilityEngine: StabilityEngine;
  private volatilityEngine: VolatilityEngine;
  private sensitivityEngine: SensitivityAnalysisEngine;
  private uncertaintyEngine: UncertaintyEngine;
  private explanationEngine: StudentExplanationEngine;
  private engineConfig: StabilityAnalysisConfig;

  constructor(
    private recommendationGenerator: RecommendationGenerator,
    config?: Partial<StabilityAnalysisConfig>
  ) {
    this.engineConfig = { ...DEFAULT_STABILITY_ANALYSIS_CONFIG, ...config };
    
    this.perturbationEngine = createPerturbationEngine(this.engineConfig.perturbation.randomSeed);
    this.consensusEngine = createConsensusEngine(this.engineConfig.consensus);
    this.confidenceEngine = createConfidenceEngine(this.engineConfig.confidenceWeights);
    this.stabilityEngine = createStabilityEngine();
    this.volatilityEngine = createVolatilityEngine();
    this.sensitivityEngine = createSensitivityAnalysisEngine();
    this.uncertaintyEngine = createUncertaintyEngine();
    this.explanationEngine = createStudentExplanationEngine(this.engineConfig.explanation);
  }

  /**
   * Perform complete stability analysis
   */
  async analyze(input: StabilityAnalysisInput): Promise<StabilityAnalysis> {
    const startTime = Date.now();
    const analysisId = this.generateAnalysisId();
    const config = { ...this.engineConfig, ...input.config };

    // Step 1: Generate perturbed profiles
    const perturbationResult = this.perturbationEngine.generatePerturbations(
      input.baseProfile,
      config.perturbation
    );

    // Step 2: Generate recommendations for each perturbed profile
    const perturbedRecommendations = await this.generateAllRecommendations(
      perturbationResult.perturbedProfiles
    );

    // Step 3: Calculate consensus
    const consensusResult = this.consensusEngine.calculateConsensus(
      perturbedRecommendations,
      config.consensus
    );

    // Step 4: Calculate confidence
    const confidenceResult = this.confidenceEngine.calculateConfidence(
      consensusResult,
      input.baseProfile,
      input.contradictions ?? []
    );

    // Step 5: Measure stability
    const stabilityResult = this.stabilityEngine.measureStability(
      consensusResult,
      perturbedRecommendations,
      consensusResult.primaryRecommendation.careerId
    );

    // Step 6: Measure volatility (if enabled)
    const volatilityResult = config.includeVolatilityAnalysis
      ? this.volatilityEngine.measureVolatility(perturbedRecommendations, consensusResult)
      : undefined;

    // Step 7: Analyze sensitivity (if enabled)
    const sensitivityResult = config.includeSensitivityAnalysis
      ? this.sensitivityEngine.analyzeSensitivity(
          input.baseProfile,
          perturbationResult.perturbedProfiles,
          perturbedRecommendations
        )
      : undefined;

    // Step 8: Calculate uncertainty
    const profileCompleteness = input.profileCompleteness?.completenessScore ?? 0.7;
    const uncertaintyResult = this.uncertaintyEngine.calculateUncertainty(
      consensusResult,
      confidenceResult,
      profileCompleteness,
      input.contradictions ?? [],
      input.baseProfile
    );

    // Step 9: Generate student explanation (if enabled)
    const studentExplanation = config.generateStudentExplanation
      ? this.explanationEngine.generateExplanation(
          stabilityResult,
          confidenceResult,
          consensusResult,
          uncertaintyResult,
          consensusResult.primaryRecommendation.careerTitle,
          consensusResult.runnerUpRecommendation?.careerTitle
        )
      : undefined;

    // Calculate analysis duration
    const analysisDurationMs = Date.now() - startTime;

    // Build telemetry
    const telemetry: StabilityTelemetry = {
      confidenceScore: confidenceResult.confidenceScore,
      stabilityScore: stabilityResult.stabilityScore,
      volatilityScore: volatilityResult?.volatilityScore ?? 0,
      uncertaintyScore: uncertaintyResult.uncertaintyScore,
      consensusScore: Math.round(consensusResult.primaryRecommendation.consensusPercentage * 100),
      simulationCount: perturbationResult.perturbedProfiles.length,
      primaryRecommendation: consensusResult.primaryRecommendation.careerId,
      primaryConsensusPercentage: Math.round(
        consensusResult.primaryRecommendation.consensusPercentage * 100
      ),
      analysisDurationMs,
      perturbationIntensity: config.perturbation.intensity,
    };

    return {
      id: analysisId,
      input,
      perturbation: perturbationResult,
      perturbedRecommendations,
      consensus: consensusResult,
      confidence: confidenceResult,
      stability: stabilityResult,
      volatility: volatilityResult,
      sensitivity: sensitivityResult,
      uncertainty: uncertaintyResult,
      studentExplanation,
      telemetry,
      analyzedAt: new Date(),
      config,
    };
  }

  /**
   * Generate recommendations for all perturbed profiles
   */
  private async generateAllRecommendations(
    perturbedProfiles: Array<{ id: PerturbationId; dimensionScores: DimensionScoreMap }>
  ): Promise<Map<PerturbationId, RecommendationSet>> {
    const recommendations = new Map<PerturbationId, RecommendationSet>();
    
    // Process in batches to avoid overwhelming the recommendation generator
    const batchSize = 50;
    
    for (let i = 0; i < perturbedProfiles.length; i += batchSize) {
      const batch = perturbedProfiles.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (profile) => {
        try {
          const recSet = await this.recommendationGenerator(profile.dimensionScores);
          return { id: profile.id, recSet };
        } catch {
          // Log error and return empty recommendation set
          console.error('Failed to generate recommendations for a perturbation safely.');
          return { id: profile.id, recSet: this.createEmptyRecommendationSet() };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      
      for (const result of batchResults) {
        recommendations.set(result.id, result.recSet);
      }
    }

    return recommendations;
  }

  /**
   * Create empty recommendation set for error cases
   */
  private createEmptyRecommendationSet(): RecommendationSet {
    return {
      studentProfileId: '',
      topRecommendations: [],
      alternativeRecommendations: [],
      stretchRecommendations: [],
      allRecommendations: [],
      metadata: {
        totalEvaluated: 0,
        totalRecommended: 0,
        generatedAt: new Date(),
        averageScore: 0,
        averageConfidence: 0,
      },
    };
  }

  /**
   * Generate unique analysis ID
   */
  private generateAnalysisId(): StabilityAnalysisId {
    return `stability-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` as StabilityAnalysisId;
  }

  /**
   * Create mentor stability context for integration
   */
  createMentorContext(analysis: StabilityAnalysis): MentorStabilityContext {
    const { stability, confidence, uncertainty, consensus } = analysis;

    const stabilityContext = {
      shouldMentionStability: stability.stabilityScore < 85 || stability.stabilityScore > 60,
      stabilityMention: this.generateStabilityMention(stability, consensus),
      confidenceMention: this.generateConfidenceMention(confidence),
      uncertaintyMention: uncertainty.uncertaintyScore > 40 
        ? this.generateUncertaintyMention(uncertainty) 
        : undefined,
    };

    const suggestedAdaptations = this.generateSuggestedAdaptations(analysis);
    const emphasizeTopics = this.generateEmphasizeTopics(analysis);
    const downplayTopics = this.generateDownplayTopics(analysis);

    return {
      stabilityContext,
      suggestedAdaptations,
      emphasizeTopics,
      downplayTopics,
    };
  }

  /**
   * Generate stability mention for mentor
   */
  private generateStabilityMention(
    stability: StabilityAnalysis['stability'],
    consensus: StabilityAnalysis['consensus']
  ): string {
    const retention = Math.round(stability.metrics.primaryRetentionRate * 100);
    
    if (retention >= 90) {
      return `This recommendation showed remarkable consistency across ${retention}% of analysis scenarios.`;
    } else if (retention >= 70) {
      return `This recommendation was stable in ${retention}% of scenarios, with some natural variation.`;
    } else {
      return `Multiple career paths showed strong alignment, with the top recommendation leading in ${retention}% of scenarios.`;
    }
  }

  /**
   * Generate confidence mention for mentor
   */
  private generateConfidenceMention(confidence: StabilityAnalysis['confidence']): string {
    const score = confidence.confidenceScore;
    
    if (score >= 80) {
      return `We have high confidence (${score}%) in this recommendation based on strong profile signals.`;
    } else if (score >= 60) {
      return `We have moderate confidence (${score}%) - solid foundation with room for clarity.`;
    } else {
      return `Confidence is ${score}%, suggesting this is a starting point for exploration.`;
    }
  }

  /**
   * Generate uncertainty mention for mentor
   */
  private generateUncertaintyMention(uncertainty: StabilityAnalysis['uncertainty']): string {
    return `Notable uncertainty (${uncertainty.uncertaintyScore}%) comes from ${uncertainty.primarySource.toLowerCase().replace('_', ' ')}.`;
  }

  /**
   * Generate suggested adaptations for mentor responses
   */
  private generateSuggestedAdaptations(analysis: StabilityAnalysis): string[] {
    const adaptations: string[] = [];

    if (analysis.stability.stabilityScore < 70) {
      adaptations.push('Emphasize exploration and discovery over commitment');
      adaptations.push('Mention that multiple paths could suit the student');
    }

    if (analysis.confidence.confidenceScore < 60) {
      adaptations.push('Frame recommendations as hypotheses to test');
      adaptations.push('Suggest specific ways to gain clarity');
    }

    if (analysis.uncertainty.uncertaintyScore > 50) {
      adaptations.push('Be transparent about uncertainty');
      adaptations.push('Focus on process over specific outcomes');
    }

    if (analysis.stability.metrics.primaryRetentionRate > 0.85) {
      adaptations.push('Provide specific, actionable guidance for the top recommendation');
    }

    return adaptations;
  }

  /**
   * Generate topics to emphasize
   */
  private generateEmphasizeTopics(analysis: StabilityAnalysis): string[] {
    const topics: string[] = [];

    if (analysis.sensitivity) {
      // Emphasize the most influential dimensions
      const topDimensions = analysis.sensitivity.mostInfluentialDimensions.slice(0, 2);
      topics.push(...topDimensions);
    }

    if (analysis.consensus.runnerUpRecommendation) {
      topics.push(`Alternative: ${analysis.consensus.runnerUpRecommendation.careerTitle}`);
    }

    if (analysis.stability.forecast.potentialTriggers.length > 0) {
      topics.push('Potential changes to watch for');
    }

    return topics;
  }

  /**
   * Generate topics to downplay
   */
  private generateDownplayTopics(analysis: StabilityAnalysis): string[] {
    const topics: string[] = [];

    if (analysis.stability.stabilityScore < 50) {
      topics.push('Specific career commitments');
      topics.push('Long-term planning');
    }

    if (analysis.uncertainty.uncertaintyBand === 'HIGH' || 
        analysis.uncertainty.uncertaintyBand === 'VERY_HIGH') {
      topics.push('Definitive statements about fit');
    }

    return topics;
  }

  /**
   * Create recommendation stability context for integration
   */
  createRecommendationContext(analysis: StabilityAnalysis): RecommendationStabilityContext {
    const { stability, consensus } = analysis;

    // Calculate stability-adjusted scores
    const stabilityAdjustedScores = new Map<string, number>();
    
    for (const freq of consensus.recommendationDistribution) {
      // Boost scores for stable recommendations
      const stabilityBoost = stability.stabilityScore / 100;
      const adjustedScore = freq.averageScore * (0.7 + 0.3 * stabilityBoost);
      stabilityAdjustedScores.set(freq.careerId, adjustedScore);
    }

    // Identify stable recommendations
    const stableRecommendations = consensus.recommendationDistribution
      .filter(f => f.percentage >= 0.5)
      .map(f => f.careerId);

    // Identify uncertain recommendations
    const uncertainRecommendations = consensus.recommendationDistribution
      .filter(f => f.percentage < 0.3 && f.percentage > 0.1)
      .map(f => f.careerId);

    return {
      boostStableRecommendations: stability.stabilityScore >= 70,
      stabilityAdjustedScores,
      stableRecommendations,
      uncertainRecommendations,
    };
  }

  /**
   * Quick stability check
   */
  async quickCheck(
    profile: DimensionScoreMap,
    baseRecommendations: RecommendationSet
  ): Promise<{
    isStable: boolean;
    stabilityScore: number;
    confidenceScore: number;
    primaryRecommendation: string;
  }> {
    const analysis = await this.analyze({
      baseProfile: profile,
      baseRecommendations,
      config: {
        perturbation: {
          intensity: 'MEDIUM',
          simulationCount: 100,
          strategy: 'WEIGHTED',
          preserveRankOrder: true,
          minScore: 0,
          maxScore: 100,
        },
        includeSensitivityAnalysis: false,
        includeVolatilityAnalysis: false,
        generateStudentExplanation: false,
      },
    });

    return {
      isStable: analysis.stability.stabilityScore >= 70,
      stabilityScore: analysis.stability.stabilityScore,
      confidenceScore: analysis.confidence.confidenceScore,
      primaryRecommendation: analysis.consensus.primaryRecommendation.careerId,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<StabilityAnalysisConfig>): void {
    if (config.perturbation) {
      this.perturbationEngine = createPerturbationEngine(config.perturbation.randomSeed);
    }
    if (config.consensus) {
      this.consensusEngine = createConsensusEngine(config.consensus);
    }
    if (config.confidenceWeights) {
      this.confidenceEngine = createConfidenceEngine(config.confidenceWeights);
    }
    if (config.explanation) {
      this.explanationEngine = createStudentExplanationEngine(config.explanation);
    }
  }
}

/**
 * Factory function for creating stability engine
 */
export function createRecommendationStabilityEngine(
  recommendationGenerator: RecommendationGenerator,
  config?: Partial<StabilityAnalysisConfig>
): RecommendationStabilityEngine {
  return new RecommendationStabilityEngine(recommendationGenerator, config);
}

/**
 * Convenience function for quick analysis
 */
export async function analyzeStability(
  profile: DimensionScoreMap,
  baseRecommendations: RecommendationSet,
  recommendationGenerator: RecommendationGenerator,
  config?: Partial<StabilityAnalysisConfig>
): Promise<StabilityAnalysis> {
  const engine = createRecommendationStabilityEngine(recommendationGenerator, config);
  return engine.analyze({
    baseProfile: profile,
    baseRecommendations,
    config,
  });
}

/**
 * Check if recommendation is stable without full analysis
 */
export async function isRecommendationStable(
  profile: DimensionScoreMap,
  baseRecommendations: RecommendationSet,
  recommendationGenerator: RecommendationGenerator,
  threshold: number = 70
): Promise<boolean> {
  const engine = createRecommendationStabilityEngine(recommendationGenerator);
  const result = await engine.quickCheck(profile, baseRecommendations);
  return result.isStable && result.stabilityScore >= threshold;
}

export type {
  StabilityAnalysis,
  StabilityAnalysisInput,
  StabilityAnalysisConfig,
  StabilityTelemetry,
  MentorStabilityContext,
  RecommendationStabilityContext,
};
