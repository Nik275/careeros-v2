/**
 * Recommendation Ranking Engine
 *
 * Generates top recommendations with ranking.
 * Each recommendation includes confidence, evidence, risks,
 * opportunity cost, optionality, and reversibility.
 */

import {
  FusedRecommendation,
  RecommendationConfidence,
  RankingResult,
  FusionTimestamp,
  Weight,
  ConfidenceScore,
  AgreementScore,
} from './fusion-types';

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface RankingConfig {
  // Ranking parameters
  minRecommendations: number;
  maxRecommendations: number;
  confidenceThreshold: ConfidenceScore;

  // Diversity settings
  diversityBonus: Weight;
  maxSimilarCareers: number;

  // Stability settings
  stabilityWindow: number; // Number of previous rankings to consider
  minStabilityScore: Weight;

  // Score weights
  scoreWeight: Weight;
  confidenceWeight: Weight;
  diversityWeight: Weight;
}

export const DEFAULT_RANKING_CONFIG: RankingConfig = {
  minRecommendations: 3,
  maxRecommendations: 10,
  confidenceThreshold: 40,

  diversityBonus: 0.1,
  maxSimilarCareers: 2,

  stabilityWindow: 5,
  minStabilityScore: 0.6,

  scoreWeight: 0.5,
  confidenceWeight: 0.3,
  diversityWeight: 0.2,
};

// ============================================================================
// INPUTS
// ============================================================================

export interface RankingInput {
  careerId: string;
  careerName: string;

  // Fused score
  fusedScore: number;

  // Confidence
  confidence: RecommendationConfidence;

  // Evidence contributions
  engineContributions: Array<{
    engineId: string;
    rawScore: number;
    weight: Weight;
    contribution: number;
  }>;

  // Risks
  risks: Array<{
    risk: string;
    likelihood: Weight;
    impact: 'low' | 'medium' | 'high' | 'severe';
    mitigation: string;
  }>;

  // Opportunity cost
  opportunityCost: {
    sacrificedOptions: string[];
    estimatedValue: number;
    reversibility: Weight;
  };

  // Optionality
  optionality: {
    futureOptions: number;
    pivotPossibilities: string[];
    optionalityScore: number;
  };

  // Reversibility
  reversibility: {
    score: number;
    reversalDifficulty: 'easy' | 'moderate' | 'difficult' | 'very-difficult';
    estimatedCost: string;
  };

  // Contradictions
  contradictions: {
    detected: boolean;
    conflicts: Array<{
      type: 'value' | 'goal' | 'identity' | 'family';
      description: string;
      resolution: string;
    }>;
  };

  // Category for diversity
  category: string;
}

export interface HistoricalRanking {
  timestamp: FusionTimestamp;
  rankings: Array<{
    careerId: string;
    rank: number;
    score: number;
  }>;
}

// ============================================================================
// ENGINE
// ============================================================================

export class RecommendationRankingEngine {
  private config: RankingConfig;
  private rankingHistory: Map<string, HistoricalRanking[]> = new Map();

  constructor(config: Partial<RankingConfig> = {}) {
    this.config = { ...DEFAULT_RANKING_CONFIG, ...config };
  }

  /**
   * Rank recommendations
   */
  rankRecommendations(
    inputs: RankingInput[],
    options: {
      previousRankings?: HistoricalRanking[];
      diversityPreference?: 'high' | 'medium' | 'low';
    } = {}
  ): RankingResult {
    if (inputs.length === 0) {
      return {
        rankedRecommendations: [],
        quality: { diversity: 0, coverage: 0, balance: 0 },
        stability: { score: 0, previousRankings: [] },
        comparison: {
          vsPsychologyOnly: 0,
          vsCareerOnly: 0,
          vsMentorOnly: 0,
          vsLearningOnly: 0,
        },
      };
    }

    // Filter by confidence threshold
    let filtered = inputs.filter(
      input => input.confidence.overallConfidence >= this.config.confidenceThreshold
    );

    // Ensure minimum recommendations
    if (filtered.length < this.config.minRecommendations) {
      filtered = inputs
        .sort((a, b) => b.fusedScore - a.fusedScore)
        .slice(0, this.config.minRecommendations);
    }

    // Calculate final scores
    const scoredInputs = filtered.map(input => ({
      input,
      finalScore: this.calculateFinalScore(input, options.diversityPreference),
    }));

    // Sort by final score
    scoredInputs.sort((a, b) => b.finalScore - a.finalScore);

    // Apply diversity
    const diverseRankings = this.applyDiversity(scoredInputs, options.diversityPreference);

    // Limit to max recommendations
    const limited = diverseRankings.slice(0, this.config.maxRecommendations);

    // Build fused recommendations
    const rankedRecommendations: FusedRecommendation[] = limited.map((item, index) =>
      this.buildFusedRecommendation(item.input, index + 1, item.finalScore)
    );

    // Calculate quality metrics
    const quality = this.calculateQuality(rankedRecommendations);

    // Calculate stability
    const stability = this.calculateStability(
      rankedRecommendations,
      options.previousRankings || []
    );

    // Calculate comparison metrics
    const comparison = this.calculateComparisonMetrics(inputs, rankedRecommendations);

    // Store ranking history
    this.storeRankingHistory(rankedRecommendations);

    return {
      rankedRecommendations,
      quality,
      stability,
      comparison,
    };
  }

  /**
   * Re-rank based on new information
   */
  reRankWithFeedback(
    currentRankings: FusedRecommendation[],
    feedback: Array<{
      careerId: string;
      feedback: 'positive' | 'negative' | 'neutral';
      reason?: string;
    }>
  ): FusedRecommendation[] {
    const adjustedRankings = currentRankings.map(rec => {
      const careerFeedback = feedback.find(f => f.careerId === rec.careerId);

      if (!careerFeedback) return rec;

      let scoreAdjustment = 0;
      if (careerFeedback.feedback === 'positive') {
        scoreAdjustment = 5;
      } else if (careerFeedback.feedback === 'negative') {
        scoreAdjustment = -10;
      }

      return {
        ...rec,
        finalScore: Math.max(0, rec.finalScore + scoreAdjustment),
      };
    });

    // Re-sort
    adjustedRankings.sort((a, b) => b.finalScore - a.finalScore);

    // Update ranks
    return adjustedRankings.map((rec, index) => ({
      ...rec,
      rank: index + 1,
    }));
  }

  /**
   * Get ranking history for a student
   */
  getRankingHistory(studentId: string): HistoricalRanking[] {
    return this.rankingHistory.get(studentId) || [];
  }

  // ============================================================================
  // PRIVATE CALCULATIONS
  // ============================================================================

  private calculateFinalScore(
    input: RankingInput,
    diversityPreference?: 'high' | 'medium' | 'low'
  ): number {
    // Base score from fusion
    let score = input.fusedScore;

    // Confidence adjustment
    const confidenceBoost =
      (input.confidence.overallConfidence / 100) * this.config.confidenceWeight * 20;
    score += confidenceBoost;

    // Risk penalty
    const riskPenalty = this.calculateRiskPenalty(input.risks);
    score -= riskPenalty;

    // Optionality bonus
    const optionalityBonus = (input.optionality.optionalityScore / 100) * 5;
    score += optionalityBonus;

    // Reversibility bonus (easier to reverse = higher score)
    const reversibilityBonus = (input.reversibility.score / 100) * 3;
    score += reversibilityBonus;

    // Contradiction penalty
    if (input.contradictions.detected) {
      const conflictPenalty = input.contradictions.conflicts.length * 2;
      score -= conflictPenalty;
    }

    return Math.max(0, score);
  }

  private calculateRiskPenalty(risks: RankingInput['risks']): number {
    if (risks.length === 0) return 0;

    let penalty = 0;
    for (const risk of risks) {
      const impactMultiplier =
        risk.impact === 'severe' ? 3 :
        risk.impact === 'high' ? 2 :
        risk.impact === 'medium' ? 1 :
        0.5;
      penalty += risk.likelihood * 5 * impactMultiplier;
    }

    return penalty;
  }

  private applyDiversity(
    scoredInputs: Array<{ input: RankingInput; finalScore: number }>,
    diversityPreference?: 'high' | 'medium' | 'low'
  ): Array<{ input: RankingInput; finalScore: number }> {
    const diversityMultiplier =
      diversityPreference === 'high' ? 1.5 :
      diversityPreference === 'low' ? 0.5 :
      1.0;

    const maxSimilar = Math.max(
      1,
      Math.floor(this.config.maxSimilarCareers * diversityMultiplier)
    );

    const selected: Array<{ input: RankingInput; finalScore: number }> = [];
    const categoryCounts: Record<string, number> = {};

    for (const item of scoredInputs) {
      const category = item.input.category;
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;

      if (categoryCounts[category] <= maxSimilar) {
        selected.push(item);
      } else {
        // Apply diversity penalty
        selected.push({
          ...item,
          finalScore: item.finalScore * (1 - this.config.diversityBonus),
        });
      }
    }

    // Re-sort after diversity adjustments
    selected.sort((a, b) => b.finalScore - a.finalScore);

    return selected;
  }

  private buildFusedRecommendation(
    input: RankingInput,
    rank: number,
    finalScore: number
  ): FusedRecommendation {
    const timestamp = Date.now();

    return {
      recommendationId: `rec-${input.careerId}-${timestamp}`,
      careerId: input.careerId,
      careerName: input.careerName,
      rank,
      finalScore: Math.round(finalScore * 10) / 10,
      confidence: input.confidence,
      evidence: {
        psychology: {
          contributes: input.engineContributions.some(e => e.engineId === 'psychology'),
          strength: this.getEngineContribution(input, 'psychology'),
          keyFactors: this.extractKeyFactors(input, 'psychology'),
        },
        career: {
          contributes: input.engineContributions.some(e => e.engineId === 'career'),
          strength: this.getEngineContribution(input, 'career'),
          keyFactors: this.extractKeyFactors(input, 'career'),
        },
        mentor: {
          contributes: input.engineContributions.some(e => e.engineId === 'mentor'),
          strength: this.getEngineContribution(input, 'mentor'),
          keyFactors: this.extractKeyFactors(input, 'mentor'),
        },
        learning: {
          contributes: input.engineContributions.some(e => e.engineId === 'learning'),
          strength: this.getEngineContribution(input, 'learning'),
          keyFactors: this.extractKeyFactors(input, 'learning'),
        },
      },
      risks: input.risks,
      opportunityCost: input.opportunityCost,
      optionality: input.optionality,
      reversibility: input.reversibility,
      explanation: this.generateExplanation(input, rank),
      engineContributions: input.engineContributions,
      contradictions: input.contradictions,
      generatedAt: timestamp,
    };
  }

  private getEngineContribution(input: RankingInput, engineId: string): Weight {
    const contribution = input.engineContributions.find(e => e.engineId === engineId);
    return contribution?.contribution || 0;
  }

  private extractKeyFactors(input: RankingInput, engineId: string): string[] {
    const contribution = input.engineContributions.find(e => e.engineId === engineId);
    if (!contribution) return [];

    // In a real implementation, these would come from the individual engines
    return [`${engineId} alignment: ${Math.round(contribution.rawScore * 100)}%`];
  }

  private generateExplanation(input: RankingInput, rank: number): {
    summary: string;
    detailedReasoning: string[];
    keyInsights: string[];
    warnings: string[];
  } {
    const detailedReasoning: string[] = [];
    const keyInsights: string[] = [];
    const warnings: string[] = [];

    // Build reasoning from engine contributions
    for (const contribution of input.engineContributions) {
      if (contribution.contribution > 0.1) {
        detailedReasoning.push(
          `${contribution.engineId} engine contributed ${Math.round(contribution.contribution * 100)}% to this recommendation.`
        );
      }
    }

    // Key insights
    if (input.confidence.overallConfidence > 80) {
      keyInsights.push('High confidence recommendation based on strong evidence.');
    }

    if (input.optionality.optionalityScore > 80) {
      keyInsights.push(`High optionality: ${input.optionality.futureOptions} future paths available.`);
    }

    if (input.reversibility.score > 0.7) {
      keyInsights.push('Easy to pivot if this path doesn\'t work out.');
    }

    // Warnings
    for (const risk of input.risks) {
      if (risk.impact === 'high' || risk.impact === 'severe') {
        warnings.push(`${risk.risk} (${risk.impact} impact)`);
      }
    }

    if (input.contradictions.detected) {
      for (const conflict of input.contradictions.conflicts) {
        warnings.push(`${conflict.type} conflict: ${conflict.description}`);
      }
    }

    const summary = `${input.careerName} ranks #${rank} with ${input.confidence.overallConfidence}% confidence based on ${input.engineContributions.length} contributing engines.`;

    return {
      summary,
      detailedReasoning,
      keyInsights,
      warnings,
    };
  }

  // ============================================================================
  // QUALITY METRICS
  // ============================================================================

  private calculateQuality(recommendations: FusedRecommendation[]): {
    diversity: Weight;
    coverage: Weight;
    balance: Weight;
  } {
    if (recommendations.length === 0) {
      return { diversity: 0, coverage: 0, balance: 0 };
    }

    // Calculate diversity (unique categories)
    const categories = new Set(recommendations.map(r => r.careerId.split('-')[0]));
    const diversity = categories.size / recommendations.length;

    // Calculate coverage (confidence range)
    const confidences = recommendations.map(r => r.confidence.overallConfidence);
    const avgConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
    const coverage = avgConfidence / 100;

    // Calculate balance (score distribution)
    const scores = recommendations.map(r => r.finalScore);
    const scoreVariance = this.calculateVariance(scores);
    const balance = Math.max(0, 1 - scoreVariance / 100);

    return {
      diversity: Math.round(diversity * 100) / 100,
      coverage: Math.round(coverage * 100) / 100,
      balance: Math.round(balance * 100) / 100,
    };
  }

  private calculateStability(
    current: FusedRecommendation[],
    previous: HistoricalRanking[]
  ): {
    score: ConfidenceScore;
    previousRankings: HistoricalRanking['rankings'];
  } {
    if (previous.length === 0) {
      return { score: 50, previousRankings: [] };
    }

    // Get most recent ranking
    const recent = previous[previous.length - 1];

    // Calculate stability based on rank changes
    let stabilityScore = 100;

    for (const rec of current) {
      const previousRank = recent.rankings.find(r => r.careerId === rec.careerId);
      if (previousRank) {
        const rankChange = Math.abs(rec.rank - previousRank.rank);
        stabilityScore -= rankChange * 5;
      } else {
        stabilityScore -= 10; // New recommendation
      }
    }

    // Include previous rankings in result
    const previousRankings = previous.slice(-this.config.stabilityWindow).flatMap(p => p.rankings);

    return {
      score: Math.max(0, Math.round(stabilityScore)),
      previousRankings,
    };
  }

  private calculateComparisonMetrics(
    inputs: RankingInput[],
    ranked: FusedRecommendation[]
  ): {
    vsPsychologyOnly: AgreementScore;
    vsCareerOnly: AgreementScore;
    vsMentorOnly: AgreementScore;
    vsLearningOnly: AgreementScore;
  } {
    const topRanked = ranked.slice(0, 3).map(r => r.careerId);

    // Simulate single-engine rankings
    const psychologyTop = inputs
      .sort((a, b) => this.getEngineContribution(b, 'psychology') - this.getEngineContribution(a, 'psychology'))
      .slice(0, 3)
      .map(i => i.careerId);

    const careerTop = inputs
      .sort((a, b) => this.getEngineContribution(b, 'career') - this.getEngineContribution(a, 'career'))
      .slice(0, 3)
      .map(i => i.careerId);

    const mentorTop = inputs
      .sort((a, b) => this.getEngineContribution(b, 'mentor') - this.getEngineContribution(a, 'mentor'))
      .slice(0, 3)
      .map(i => i.careerId);

    const learningTop = inputs
      .sort((a, b) => this.getEngineContribution(b, 'learning') - this.getEngineContribution(a, 'learning'))
      .slice(0, 3)
      .map(i => i.careerId);

    return {
      vsPsychologyOnly: this.calculateOverlap(topRanked, psychologyTop),
      vsCareerOnly: this.calculateOverlap(topRanked, careerTop),
      vsMentorOnly: this.calculateOverlap(topRanked, mentorTop),
      vsLearningOnly: this.calculateOverlap(topRanked, learningTop),
    };
  }

  private calculateOverlap(a: string[], b: string[]): AgreementScore {
    const intersection = a.filter(item => b.includes(item));
    return Math.round((intersection.length / Math.max(a.length, b.length)) * 100);
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  // ============================================================================
  // HISTORY MANAGEMENT
  // ============================================================================

  private storeRankingHistory(recommendations: FusedRecommendation[]): void {
    const studentId = recommendations[0]?.careerId.split('-')[0] || 'unknown';

    const ranking: HistoricalRanking = {
      timestamp: Date.now(),
      rankings: recommendations.map(r => ({
        careerId: r.careerId,
        rank: r.rank,
        score: r.finalScore,
      })),
    };

    const history = this.rankingHistory.get(studentId) || [];
    history.push(ranking);

    // Keep only recent history
    if (history.length > this.config.stabilityWindow) {
      history.shift();
    }

    this.rankingHistory.set(studentId, history);
  }

  // ============================================================================
  // CONFIGURATION METHODS
  // ============================================================================

  getConfig(): RankingConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<RankingConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

export default RecommendationRankingEngine;
