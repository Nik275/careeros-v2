/**
 * CareerOS Meta-Decision Intelligence Engine - Decision Quality Engine
 *
 * Measures decision quality across multiple dimensions.
 */

import type {
  DecisionQualityAnalysis,
  DecisionQualityLevel,
  MetaDecisionInput,
  MetaDecisionConfig,
} from './types';

/**
 * Measures decision quality.
 */
export class DecisionQualityEngine {
  private config: MetaDecisionConfig;

  constructor(config: MetaDecisionConfig) {
    this.config = config;
  }

  /**
   * Main entry point: analyze decision quality.
   */
  analyze(input: MetaDecisionInput): DecisionQualityAnalysis {
    // Calculate component scores
    const components = {
      informationQuality: this.evaluateInformationQuality(input),
      reasoningQuality: this.evaluateReasoningQuality(input),
      evidenceQuality: this.evaluateEvidenceQuality(input),
      biasInfluence: this.evaluateBiasInfluence(input),
      uncertainty: input.uncertainty.overall,
    };

    // Calculate breakdowns
    const informationQuality = this.analyzeInformationQuality(input);
    const reasoningQuality = this.analyzeReasoningQuality(input);
    const evidenceQuality = this.analyzeEvidenceQuality(input);

    // Calculate overall quality
    const overallQuality = this.calculateOverallQuality(components);

    // Determine quality level
    const qualityLevel = this.determineQualityLevel(overallQuality);

    // Generate explanation
    const explanation = this.generateExplanation(
      components,
      overallQuality,
      qualityLevel
    );

    return {
      overallQuality,
      qualityLevel,
      components,
      informationQuality,
      reasoningQuality,
      evidenceQuality,
      explanation,
    };
  }

  /**
   * Evaluate information quality.
   */
  private evaluateInformationQuality(input: MetaDecisionInput): number {
    const { careerData, personalFit, marketData, outcomeData } =
      input.informationCompleteness;

    // Weighted average
    const completeness =
      careerData * 0.25 +
      personalFit * 0.3 +
      marketData * 0.25 +
      outcomeData * 0.2;

    // Adjust for uncertainty
    const uncertaintyPenalty = input.uncertainty.overall * 0.2;

    return Math.max(0, Math.round(completeness - uncertaintyPenalty));
  }

  /**
   * Evaluate reasoning quality.
   */
  private evaluateReasoningQuality(input: MetaDecisionInput): number {
    let score = 50; // Base score

    // Bonus for decision intelligence confidence
    score += input.decisionIntelligence.confidence * 0.3;

    // Bonus for considering alternatives
    if (input.decisionIntelligence.alternatives.length >= 2) {
      score += 10;
    }
    if (input.decisionIntelligence.alternatives.length >= 3) {
      score += 10;
    }

    // Penalty for high bias
    score -= input.biasProfile.overallBias * 0.3;

    // Bonus for utility confidence
    score += input.utilityConfidence.overall * 0.1;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Evaluate evidence quality.
   */
  private evaluateEvidenceQuality(input: MetaDecisionInput): number {
    // Based on information completeness
    const baseQuality =
      (input.informationCompleteness.careerData +
        input.informationCompleteness.personalFit +
        input.informationCompleteness.outcomeData) /
      3;

    // Adjust for recency and diversity (estimated)
    const diversityBonus = 10; // Assume decent diversity

    return Math.min(100, Math.round(baseQuality + diversityBonus));
  }

  /**
   * Evaluate bias influence.
   */
  private evaluateBiasInfluence(input: MetaDecisionInput): number {
    return input.biasProfile.overallBias;
  }

  /**
   * Analyze information quality breakdown.
   */
  private analyzeInformationQuality(input: MetaDecisionInput) {
    const { careerData, personalFit, marketData, outcomeData } =
      input.informationCompleteness;

    return {
      relevance: Math.round(
        (personalFit * 0.5 + careerData * 0.3 + marketData * 0.2)
      ),
      completeness: Math.round(
        (careerData + personalFit + marketData + outcomeData) / 4
      ),
      accuracy: 75, // Estimated
      timeliness: 70, // Estimated
    };
  }

  /**
   * Analyze reasoning quality breakdown.
   */
  private analyzeReasoningQuality(input: MetaDecisionInput) {
    return {
      logicalConsistency: Math.round(100 - input.biasProfile.overallBias * 0.5),
      evidenceAlignment: input.utilityConfidence.overall,
      alternativesConsidered: Math.min(
        100,
        input.decisionIntelligence.alternatives.length * 25
      ),
      tradeoffsEvaluated: Math.round(input.utilityConfidence.overall * 0.8),
    };
  }

  /**
   * Analyze evidence quality breakdown.
   */
  private analyzeEvidenceQuality(input: MetaDecisionInput) {
    return {
      sourceReliability: 75, // Estimated
      sampleSize: Math.round(input.informationCompleteness.outcomeData),
      recency: 70, // Estimated
      diversity: Math.round(
        (input.informationCompleteness.careerData +
          input.informationCompleteness.marketData) /
          2
      ),
    };
  }

  /**
   * Calculate overall quality score.
   */
  private calculateOverallQuality(
    components: DecisionQualityAnalysis['components']
  ): number {
    const weights = this.config.qualityWeights;

    // Invert bias and uncertainty (lower is better)
    const adjustedBias = 100 - components.biasInfluence;
    const adjustedUncertainty = 100 - components.uncertainty;

    return Math.round(
      components.informationQuality * weights.informationQuality +
        components.reasoningQuality * weights.reasoningQuality +
        components.evidenceQuality * weights.evidenceQuality +
        adjustedBias * weights.biasInfluence +
        adjustedUncertainty * weights.uncertainty
    );
  }

  /**
   * Determine quality level.
   */
  private determineQualityLevel(quality: number): DecisionQualityLevel {
    if (quality >= 85) return 'excellent';
    if (quality >= 70) return 'good';
    if (quality >= 50) return 'moderate';
    if (quality >= 30) return 'low';
    return 'very_low';
  }

  /**
   * Generate explanation.
   */
  private generateExplanation(
    components: DecisionQualityAnalysis['components'],
    overallQuality: number,
    qualityLevel: DecisionQualityLevel
  ): string[] {
    const explanation: string[] = [];

    // Overall quality
    explanation.push(`Decision quality: ${overallQuality}% (${qualityLevel.replace('_', ' ')})`);

    // Component analysis
    if (components.informationQuality >= 70) {
      explanation.push('Good information quality supports this decision.');
    } else {
      explanation.push('Information quality could be improved with more research.');
    }

    if (components.reasoningQuality >= 70) {
      explanation.push('Reasoning process appears sound.');
    } else {
      explanation.push('Reasoning process may benefit from structured evaluation.');
    }

    if (components.biasInfluence >= 50) {
      explanation.push(`Significant bias influence (${components.biasInfluence}%) may be distorting judgment.`);
    } else if (components.biasInfluence >= 30) {
      explanation.push(`Moderate bias influence (${components.biasInfluence}%) - be aware of potential distortions.`);
    }

    if (components.uncertainty >= 50) {
      explanation.push(`High uncertainty (${components.uncertainty}%) suggests gathering more evidence.`);
    }

    return explanation;
  }
}

/**
 * Factory function for DecisionQualityEngine.
 */
export function createDecisionQualityEngine(
  config: MetaDecisionConfig
): DecisionQualityEngine {
  return new DecisionQualityEngine(config);
}
