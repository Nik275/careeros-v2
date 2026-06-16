/**
 * CareerOS Decision Intelligence Engine - Comparison Engine
 *
 * Phase D.1: Decision Intelligence Engine
 *
 * Compares multiple career decision options across dimensions,
 * generates rankings, and provides head-to-head analysis.
 *
 * @module decision-comparison-engine
 * @version 2.0.0
 * 
 * @deprecated Wave 2.2 - Migrated to Decision Authority
 * This engine now delegates all comparison logic to the Constitutional Decision Authority.
 * Use DecisionAuthority directly for new code.
 * 
 * @since Wave 2.2 - Decision Comparison Consolidation
 */

import type {
  DecisionOption,
  DecisionAnalysis,
  DecisionComparison,
  DimensionComparison,
  DecisionRanking,
  HeadToHeadComparison,
  DecisionDimension,
  ScoredDimension,
  DecisionIntelligenceConfig,
  ComparisonCriteria,
  DecisionContext,
} from './decision-types';

// Import Decision Authority for constitutional delegation
import {
  createDecisionAuthority,
  type IDecisionAuthority,
  type DecisionInput,
  type DecisionOption as AuthorityDecisionOption,
  type DecisionContext as AuthorityDecisionContext,
  type ComparisonConfig,
  type RankingConfig,
  type SelectionConfig,
  type DecisionExplanation,
} from '@/intelligence/decision';

/**
 * Engine for comparing career decision options.
 * 
 * @deprecated Wave 2.2 - All comparison logic migrated to DecisionAuthority
 * This class now serves as a compatibility wrapper. Direct usage of DecisionAuthority
 * is recommended for new implementations.
 * 
 * Migration path:
 * Before: new DecisionComparisonEngine(config).compareDecisions(id, options, analyses)
 * After: createDecisionAuthority().decide({ type: 'comparison', options, context })
 */
export class DecisionComparisonEngine {
  /** Engine configuration (legacy, for compatibility) */
  private config: DecisionIntelligenceConfig;
  
  /** Constitutional Decision Authority - sole owner of comparison logic */
  private authority: IDecisionAuthority;
  
  /** Migration warning flag */
  private warned: boolean = false;

  /**
   * Creates a new DecisionComparisonEngine.
   *
   * @param config - Configuration for the engine (legacy compatibility)
   * @deprecated Use DecisionAuthority directly via createDecisionAuthority()
   */
  constructor(config: DecisionIntelligenceConfig) {
    this.config = config;
    // Initialize constitutional authority - comparison ownership transferred to authority
    this.authority = createDecisionAuthority({
      comparison: this.convertToComparisonConfig(config),
      ranking: this.convertToRankingConfig(config),
      selection: this.convertToSelectionConfig(config),
    });
    
    // Log migration warning once
    if (!this.warned && process.env.NODE_ENV !== 'test') {
      console.warn(
        '[DecisionComparisonEngine] DEPRECATED: This engine has been migrated to Decision Authority. ' +
        'Use DecisionAuthority directly for new code. See docs/decision-authority/ for migration guide.'
      );
      this.warned = true;
    }
  }

  /**
   * Compares multiple decision options.
   *
   * WAVE 2.2 MIGRATION: This method now delegates to DecisionAuthority.
   * All comparison logic has been transferred to the constitutional authority.
   *
   * @param comparisonId - Unique comparison identifier
   * @param options - Decision options to compare
   * @param analyses - Analyses for each option
   * @param criteria - Comparison criteria
   * @returns Complete comparison result
   * @deprecated Use DecisionAuthority.decide() directly for new implementations
   */
  async compareDecisions(
    comparisonId: string,
    options: DecisionOption[],
    analyses: Record<string, DecisionAnalysis>,
    criteria?: ComparisonCriteria
  ): Promise<DecisionComparison> {
    // Validate we have analyses for all options
    const missingAnalyses = options.filter((opt) => !analyses[opt.id]);
    if (missingAnalyses.length > 0) {
      throw new Error(
        `Missing analyses for options: ${missingAnalyses.map((o) => o.id).join(', ')}`
      );
    }

    // Convert legacy inputs to constitutional authority format
    const authorityOptions = this.convertOptionsToAuthority(options, analyses);
    const authorityContext = this.createAuthorityContext(comparisonId, analyses);

    // Delegate to Constitutional Decision Authority
    const authorityResult = await this.authority.decide({
      type: 'option-comparison',
      context: authorityContext,
      options: authorityOptions,
      config: {
        ranking: this.convertToRankingConfig(this.config, criteria),
        comparison: this.convertToComparisonConfig(this.config),
        selection: this.convertToSelectionConfig(this.config),
        explanation: {
          level: 'detailed',
          includeScores: true,
          includeComparisons: true,
          includeArbitration: false,
          includeAlternatives: true,
        },
      },
    });

    // Convert authority output back to legacy format
    return this.convertAuthorityResultToLegacy(
      authorityResult,
      comparisonId,
      options,
      analyses,
      criteria
    );
  }

  /**
   * Compares options across all dimensions.
   *
   * @param options - Decision options
   * @param analyses - Decision analyses
   * @param criteria - Comparison criteria
   * @returns Dimension comparisons
   */
  private compareDimensions(
    options: DecisionOption[],
    analyses: Record<string, DecisionAnalysis>,
    criteria: ComparisonCriteria
  ): DimensionComparison[] {
    const comparisons: DimensionComparison[] = [];

    for (const dimension of criteria.dimensions) {
      const comparison = this.compareSingleDimension(
        dimension,
        options,
        analyses
      );
      comparisons.push(comparison);
    }

    return comparisons;
  }

  /**
   * Compares options on a single dimension.
   *
   * @param dimension - Dimension to compare
   * @param options - Decision options
   * @param analyses - Decision analyses
   * @returns Single dimension comparison
   */
  private compareSingleDimension(
    dimension: DecisionDimension,
    options: DecisionOption[],
    analyses: Record<string, DecisionAnalysis>
  ): DimensionComparison {
    const scores: Record<string, ScoredDimension> = {};

    // Extract scores for each option
    for (const option of options) {
      const analysis = analyses[option.id];
      scores[option.id] = this.extractDimensionScore(dimension, analysis);
    }

    // Find best option
    const bestOption = this.findBestOption(scores);

    // Calculate variance
    const variance = this.calculateVariance(scores);

    // Calculate significance (how much this dimension matters)
    const significance = this.calculateDimensionSignificance(dimension, variance);

    return {
      dimension,
      scores,
      bestOption,
      variance,
      significance,
    };
  }

  /**
   * Extracts dimension score from analysis.
   *
   * @param dimension - Dimension to extract
   * @param analysis - Decision analysis
   * @returns Scored dimension
   */
  private extractDimensionScore(
    dimension: DecisionDimension,
    analysis: DecisionAnalysis
  ): ScoredDimension {
    const quality = analysis.decisionQuality;

    switch (dimension) {
      case 'FIT_QUALITY':
        return quality.fitQuality;
      case 'LIFESTYLE_QUALITY':
        return quality.lifestyleQuality;
      case 'VALUE_ALIGNMENT':
        return quality.valueAlignment;
      case 'FUTURE_POTENTIAL':
        return quality.futurePotential;
      case 'FLEXIBILITY':
        return quality.flexibility;
      case 'CONFIDENCE':
        return {
          score: analysis.confidence.overall,
          confidence: 80,
        };
      case 'RISK_LEVEL':
        return this.calculateRiskScore(analysis);
      case 'OPPORTUNITY_LEVEL':
        return this.calculateOpportunityScore(analysis);
      case 'OVERALL_QUALITY':
        return {
          score: quality.overall,
          confidence: analysis.confidence.overall,
        };
      default:
        return { score: 50, confidence: 50 };
    }
  }

  /**
   * Calculates risk score for comparison.
   *
   * @param analysis - Decision analysis
   * @returns Risk score (lower is better)
   */
  private calculateRiskScore(analysis: DecisionAnalysis): ScoredDimension {
    if (analysis.risks.length === 0) {
      return { score: 100, confidence: 80 }; // No risks = perfect score
    }

    // Calculate average risk score
    const avgRiskScore =
      analysis.risks.reduce((sum, r) => sum + r.riskScore, 0) / analysis.risks.length;

    // Convert to 0-100 scale where higher is better (less risk)
    const score = Math.max(100 - avgRiskScore, 0);

    // Confidence based on analysis confidence
    const confidence = analysis.confidence.overall;

    return { score: Math.round(score), confidence };
  }

  /**
   * Calculates opportunity score for comparison.
   *
   * @param analysis - Decision analysis
   * @returns Opportunity score
   */
  private calculateOpportunityScore(analysis: DecisionAnalysis): ScoredDimension {
    if (analysis.opportunities.length === 0) {
      return { score: 50, confidence: 70 };
    }

    // Calculate average opportunity score
    const avgOpportunityScore =
      analysis.opportunities.reduce((sum, o) => sum + o.opportunityScore, 0) /
      analysis.opportunities.length;

    // Confidence based on analysis confidence
    const confidence = analysis.confidence.overall;

    return { score: Math.round(avgOpportunityScore), confidence };
  }

  /**
   * Finds the best option for a dimension.
   *
   * @param scores - Scores by option
   * @returns Best option ID
   */
  private findBestOption(
    scores: Record<string, ScoredDimension>
  ): string {
    let bestId = Object.keys(scores)[0];
    let bestScore = scores[bestId].score;

    for (const [id, score] of Object.entries(scores)) {
      if (score.score > bestScore) {
        bestId = id;
        bestScore = score.score;
      }
    }

    return bestId;
  }

  /**
   * Calculates variance across scores.
   *
   * @param scores - Scores by option
   * @returns Variance 0-100
   */
  private calculateVariance(
    scores: Record<string, ScoredDimension>
  ): number {
    const values = Object.values(scores).map((s) => s.score);
    
    if (values.length < 2) return 0;

    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance =
      values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;

    // Normalize to 0-100 scale
    return Math.min(Math.round(variance), 100);
  }

  /**
   * Calculates dimension significance.
   *
   * @param dimension - Dimension name
   * @param variance - Variance across options
   * @returns Significance 0-100
   */
  private calculateDimensionSignificance(
    dimension: DecisionDimension,
    variance: number
  ): number {
    // Base significance by dimension type
    const baseSignificance: Record<DecisionDimension, number> = {
      FIT_QUALITY: 90,
      LIFESTYLE_QUALITY: 85,
      VALUE_ALIGNMENT: 80,
      FUTURE_POTENTIAL: 75,
      FLEXIBILITY: 70,
      CONFIDENCE: 60,
      RISK_LEVEL: 80,
      OPPORTUNITY_LEVEL: 70,
      OVERALL_QUALITY: 85,
    };

    const base = baseSignificance[dimension] ?? 70;

    // Higher variance = more significant (options differ more)
    const varianceBoost = variance * 0.3;

    return Math.min(Math.round(base + varianceBoost), 100);
  }

  /**
   * Generates rankings for all options.
   *
   * @param options - Decision options
   * @param analyses - Decision analyses
   * @param dimensions - Dimension comparisons
   * @returns Ranked options
   */
  private generateRankings(
    options: DecisionOption[],
    analyses: Record<string, DecisionAnalysis>,
    dimensions: DimensionComparison[]
  ): DecisionRanking[] {
    // Calculate overall score for each option
    const scoredOptions = options.map((option) => {
      const analysis = analyses[option.id];
      const overallScore = analysis.decisionQuality.overall;

      // Calculate relative strengths
      const relativeStrengths = this.identifyRelativeStrengths(
        option.id,
        options,
        analyses,
        dimensions
      );

      // Calculate relative weaknesses
      const relativeWeaknesses = this.identifyRelativeWeaknesses(
        option.id,
        options,
        analyses,
        dimensions
      );

      return {
        optionId: option.id,
        score: overallScore,
        relativeStrengths,
        relativeWeaknesses,
      };
    });

    // Sort by score descending
    scoredOptions.sort((a, b) => b.score - a.score);

    // Assign ranks
    return scoredOptions.map((so, index) => ({
      rank: index + 1,
      optionId: so.optionId,
      score: so.score,
      relativeStrengths: so.relativeStrengths,
      relativeWeaknesses: so.relativeWeaknesses,
    }));
  }

  /**
   * Identifies relative strengths of an option.
   *
   * @param optionId - Option to analyze
   * @param allOptions - All options
   * @param analyses - All analyses
   * @param dimensions - Dimension comparisons
   * @returns List of relative strengths
   */
  private identifyRelativeStrengths(
    optionId: string,
    allOptions: DecisionOption[],
    analyses: Record<string, DecisionAnalysis>,
    dimensions: DimensionComparison[]
  ): string[] {
    const strengths: string[] = [];

    // Check where this option is best
    for (const dim of dimensions) {
      if (dim.bestOption === optionId && dim.significance >= 60) {
        strengths.push(`Best ${this.formatDimensionName(dim.dimension)}`);
      }
    }

    // Check significant advantages
    const analysis = analyses[optionId];
    const topAdvantages = analysis.advantages
      .filter((a) => a.importance >= 75)
      .slice(0, 2);
    
    topAdvantages.forEach((adv) => {
      strengths.push(adv.description);
    });

    return strengths;
  }

  /**
   * Identifies relative weaknesses of an option.
   *
   * @param optionId - Option to analyze
   * @param allOptions - All options
   * @param analyses - All analyses
   * @param dimensions - Dimension comparisons
   * @returns List of relative weaknesses
   */
  private identifyRelativeWeaknesses(
    optionId: string,
    allOptions: DecisionOption[],
    analyses: Record<string, DecisionAnalysis>,
    dimensions: DimensionComparison[]
  ): string[] {
    const weaknesses: string[] = [];

    // Check where this option is significantly behind
    for (const dim of dimensions) {
      const score = dim.scores[optionId].score;
      const bestScore = dim.scores[dim.bestOption].score;
      const gap = bestScore - score;

      if (gap >= 20 && dim.significance >= 60) {
        weaknesses.push(`Lower ${this.formatDimensionName(dim.dimension)}`);
      }
    }

    // Check significant concerns
    const analysis = analyses[optionId];
    const topConcerns = analysis.disadvantages
      .filter((d) => d.severity >= 60)
      .slice(0, 2);
    
    topConcerns.forEach((concern) => {
      weaknesses.push(concern.description);
    });

    return weaknesses;
  }

  /**
   * Formats dimension name for display.
   *
   * @param dimension - Dimension identifier
   * @returns Formatted name
   */
  private formatDimensionName(dimension: DecisionDimension): string {
    const names: Record<DecisionDimension, string> = {
      FIT_QUALITY: 'personal fit',
      LIFESTYLE_QUALITY: 'lifestyle quality',
      VALUE_ALIGNMENT: 'value alignment',
      FUTURE_POTENTIAL: 'future potential',
      FLEXIBILITY: 'flexibility',
      CONFIDENCE: 'confidence',
      RISK_LEVEL: 'risk profile',
      OPPORTUNITY_LEVEL: 'opportunity level',
      OVERALL_QUALITY: 'overall quality',
    };

    return names[dimension] ?? dimension;
  }

  /**
   * Generates head-to-head comparisons between all option pairs.
   *
   * @param options - Decision options
   * @param analyses - Decision analyses
   * @param dimensions - Dimension comparisons
   * @returns Head-to-head comparisons
   */
  private generateHeadToHeadComparisons(
    options: DecisionOption[],
    analyses: Record<string, DecisionAnalysis>,
    dimensions: DimensionComparison[]
  ): HeadToHeadComparison[] {
    const comparisons: HeadToHeadComparison[] = [];

    // Compare each pair (avoid duplicates)
    for (let i = 0; i < options.length; i++) {
      for (let j = i + 1; j < options.length; j++) {
        const optionA = options[i];
        const optionB = options[j];

        const comparison = this.comparePair(
          optionA.id,
          optionB.id,
          analyses,
          dimensions
        );

        comparisons.push(comparison);
      }
    }

    return comparisons;
  }

  /**
   * Compares a pair of options.
   *
   * @param optionA - First option ID
   * @param optionB - Second option ID
   * @param analyses - Decision analyses
   * @param dimensions - Dimension comparisons
   * @returns Head-to-head comparison
   */
  private comparePair(
    optionA: string,
    optionB: string,
    analyses: Record<string, DecisionAnalysis>,
    dimensions: DimensionComparison[]
  ): HeadToHeadComparison {
    const optionAWins: DecisionDimension[] = [];
    const optionBWins: DecisionDimension[] = [];
    const equivalent: DecisionDimension[] = [];

    for (const dim of dimensions) {
      const scoreA = dim.scores[optionA].score;
      const scoreB = dim.scores[optionB].score;
      const gap = Math.abs(scoreA - scoreB);

      if (gap < 10) {
        equivalent.push(dim.dimension);
      } else if (scoreA > scoreB) {
        optionAWins.push(dim.dimension);
      } else {
        optionBWins.push(dim.dimension);
      }
    }

    // Determine winner
    let winner: string | null = null;
    let winnerRationale = '';

    const analysisA = analyses[optionA];
    const analysisB = analyses[optionB];
    const scoreA = analysisA.decisionQuality.overall;
    const scoreB = analysisB.decisionQuality.overall;

    if (Math.abs(scoreA - scoreB) < 5) {
      winner = null;
      winnerRationale = `These options are closely matched with only a ${Math.abs(scoreA - scoreB)}-point difference in overall quality.`;
    } else if (scoreA > scoreB) {
      winner = optionA;
      winnerRationale = `${analysisA.option.title} scores higher overall (${scoreA} vs ${scoreB}) and wins on ${optionAWins.length} key dimensions.`;
    } else {
      winner = optionB;
      winnerRationale = `${analysisB.option.title} scores higher overall (${scoreB} vs ${scoreA}) and wins on ${optionBWins.length} key dimensions.`;
    }

    return {
      optionA,
      optionB,
      optionAWins,
      optionBWins,
      equivalent,
      winner,
      winnerRationale,
    };
  }

  /**
   * Determines the overall winner.
   *
   * @param rankings - Ranked options
   * @param analyses - Decision analyses
   * @returns Winner option ID or null if tie
   */
  private determineWinner(
    rankings: DecisionRanking[],
    analyses: Record<string, DecisionAnalysis>
  ): string | null {
    if (rankings.length === 0) return null;
    if (rankings.length === 1) return rankings[0].optionId;

    // Check for clear winner (top score significantly higher)
    const first = rankings[0];
    const second = rankings[1];

    const gap = first.score - second.score;

    // Need at least 5-point gap for clear winner
    if (gap >= 5) {
      return first.optionId;
    }

    // Check confidence
    const firstConfidence = analyses[first.optionId].confidence.overall;
    const secondConfidence = analyses[second.optionId].confidence.overall;

    // If top option has much higher confidence, it's the winner
    if (gap >= 2 && firstConfidence > secondConfidence + 15) {
      return first.optionId;
    }

    return null; // No clear winner
  }

  /**
   * Identifies key differentiators between options.
   *
   * @param options - Decision options
   * @param analyses - Decision analyses
   * @param dimensions - Dimension comparisons
   * @returns Key differentiators
   */
  private identifyKeyDifferentiators(
    options: DecisionOption[],
    analyses: Record<string, DecisionAnalysis>,
    dimensions: DimensionComparison[]
  ): string[] {
    const differentiators: string[] = [];

    // Find dimensions with high variance
    const highVarianceDims = dimensions
      .filter((d) => d.variance >= 20)
      .sort((a, b) => b.variance - a.variance);

    for (const dim of highVarianceDims.slice(0, 3)) {
      const bestOption = options.find((o) => o.id === dim.bestOption);
      const bestScore = dim.scores[dim.bestOption].score;

      // Find worst
      let worstId = dim.bestOption;
      let worstScore = bestScore;

      for (const [id, score] of Object.entries(dim.scores)) {
        if (score.score < worstScore) {
          worstId = id;
          worstScore = score.score;
        }
      }

      const worstOption = options.find((o) => o.id === worstId);
      const gap = bestScore - worstScore;

      if (gap >= 15 && bestOption && worstOption) {
        differentiators.push(
          `${this.formatDimensionName(dim.dimension)}: ${bestOption.title} leads by ${Math.round(gap)} points over ${worstOption.title}`
        );
      }
    }

    // Add risk comparison if significant
    const riskDim = dimensions.find((d) => d.dimension === 'RISK_LEVEL');
    if (riskDim && riskDim.variance >= 15) {
      const bestRiskOption = options.find((o) => o.id === riskDim.bestOption);
      if (bestRiskOption) {
        differentiators.push(
          `Risk profile: ${bestRiskOption.title} offers the lowest risk`
        );
      }
    }

    return differentiators;
  }

  /**
   * Gets default comparison criteria.
   *
   * @returns Default criteria
   * @deprecated Configuration now managed by DecisionAuthority
   */
  private getDefaultCriteria(): ComparisonCriteria {
    return {
      minConfidence: this.config.minConfidenceThreshold,
      dimensions: [
        'FIT_QUALITY',
        'LIFESTYLE_QUALITY',
        'VALUE_ALIGNMENT',
        'FUTURE_POTENTIAL',
        'FLEXIBILITY',
        'RISK_LEVEL',
        'OVERALL_QUALITY',
      ],
      requireAllDimensions: false,
    };
  }

  // ============================================================================
  // WAVE 2.2 MIGRATION: Conversion Methods
  // These methods convert between legacy format and constitutional authority format
  // ============================================================================

  /**
   * Converts legacy options and analyses to authority format.
   * 
   * @param options - Legacy decision options
   * @param analyses - Legacy decision analyses
   * @returns Authority-compatible options
   */
  private convertOptionsToAuthority(
    options: DecisionOption[],
    analyses: Record<string, DecisionAnalysis>
  ): AuthorityDecisionOption[] {
    return options.map((option) => {
      const analysis = analyses[option.id];
      
      return {
        id: option.id,
        type: 'career-comparison',
        data: {
          title: option.title,
          description: option.description,
          careerId: option.careerId,
        },
        metadata: {
          label: option.title,
          sourceConfidence: analysis?.confidence?.overall ?? 50,
          scores: {
            fitQuality: analysis?.decisionQuality?.fitQuality?.score ?? 50,
            lifestyleQuality: analysis?.decisionQuality?.lifestyleQuality?.score ?? 50,
            valueAlignment: analysis?.decisionQuality?.valueAlignment?.score ?? 50,
            futurePotential: analysis?.decisionQuality?.futurePotential?.score ?? 50,
            flexibility: analysis?.decisionQuality?.flexibility?.score ?? 50,
            overall: analysis?.decisionQuality?.overall ?? 50,
          },
          analysis: analysis,
        },
        source: 'legacy-comparison-engine',
        createdAt: new Date(),
      };
    });
  }

  /**
   * Creates authority context from legacy data.
   * 
   * @param comparisonId - Legacy comparison ID
   * @param analyses - Legacy analyses
   * @returns Authority-compatible context
   */
  private createAuthorityContext(
    comparisonId: string,
    analyses: Record<string, DecisionAnalysis>
  ): AuthorityDecisionContext {
    return {
      studentId: 'unknown',
      sessionId: comparisonId,
      timestamp: new Date(),
      metadata: {
        comparisonId,
        optionCount: Object.keys(analyses).length,
        migratedFrom: 'DecisionComparisonEngine',
      },
    };
  }

  /**
   * Converts legacy config to authority comparison config.
   * 
   * @param config - Legacy engine config
   * @returns Authority comparison config
   */
  private convertToComparisonConfig(
    config: DecisionIntelligenceConfig
  ): ComparisonConfig {
    return {
      method: 'pairwise',
      transitive: true,
    };
  }

  /**
   * Converts legacy config to authority ranking config.
   * 
   * @param config - Legacy engine config
   * @param criteria - Optional legacy criteria
   * @returns Authority ranking config
   */
  private convertToRankingConfig(
    config: DecisionIntelligenceConfig,
    criteria?: ComparisonCriteria
  ): RankingConfig {
    return {
      algorithm: 'multi-criteria',
      criteriaWeights: {
        fitQuality: config.fitQualityWeight ?? 0.25,
        lifestyleQuality: config.lifestyleQualityWeight ?? 0.2,
        valueAlignment: config.valueAlignmentWeight ?? 0.2,
        futurePotential: config.futurePotentialWeight ?? 0.2,
        flexibility: config.flexibilityWeight ?? 0.15,
      },
      tieBreaker: 'confidence',
      allowTies: false,
    };
  }

  /**
   * Converts legacy config to authority selection config.
   * 
   * @param config - Legacy engine config
   * @returns Authority selection config
   */
  private convertToSelectionConfig(
    config: DecisionIntelligenceConfig
  ): SelectionConfig {
    return {
      strategy: 'top-ranked',
      minConfidence: config.minConfidenceThreshold ?? 50,
    };
  }

  /**
   * Converts authority result back to legacy DecisionComparison format.
   * 
   * @param result - Authority decision result
   * @param comparisonId - Original comparison ID
   * @param options - Original options
   * @param analyses - Original analyses
   * @param criteria - Original criteria
   * @returns Legacy DecisionComparison
   */
  private convertAuthorityResultToLegacy(
    result: Awaited<ReturnType<IDecisionAuthority['decide']>>,
    comparisonId: string,
    options: DecisionOption[],
    analyses: Record<string, DecisionAnalysis>,
    criteria?: ComparisonCriteria
  ): DecisionComparison {
    // Build dimension comparisons from authority result
    const dimensions = this.buildLegacyDimensions(result, options, analyses);
    
    // Build rankings from authority ranked options
    const rankings = this.buildLegacyRankings(result, analyses);
    
    // Build head-to-head from authority comparisons
    const headToHead = this.buildLegacyHeadToHead(result);
    
    // Identify key differentiators
    const keyDifferentiators = this.buildLegacyDifferentiators(result, dimensions);

    return {
      comparisonId,
      options,
      analyses,
      dimensions,
      rankings,
      headToHead,
      winner: result.winner?.id ?? null,
      keyDifferentiators,
      comparedAt: new Date(),
    };
  }

  /**
   * Builds legacy dimension comparisons from authority result.
   */
  private buildLegacyDimensions(
    result: Awaited<ReturnType<IDecisionAuthority['decide']>>,
    options: DecisionOption[],
    analyses: Record<string, DecisionAnalysis>
  ): DimensionComparison[] {
    // Map authority metadata scores back to legacy dimensions
    const dimensions: DecisionDimension[] = [
      'FIT_QUALITY',
      'LIFESTYLE_QUALITY',
      'VALUE_ALIGNMENT',
      'FUTURE_POTENTIAL',
      'FLEXIBILITY',
      'CONFIDENCE',
      'RISK_LEVEL',
      'OPPORTUNITY_LEVEL',
      'OVERALL_QUALITY',
    ];

    return dimensions.map((dimension) => {
      const scores: Record<string, ScoredDimension> = {};
      
      for (const option of options) {
        const analysis = analyses[option.id];
        scores[option.id] = this.extractDimensionScoreForLegacy(dimension, analysis);
      }

      const bestOption = this.findBestOption(scores);
      const variance = this.calculateVariance(scores);
      const significance = this.calculateDimensionSignificance(dimension, variance);

      return {
        dimension,
        scores,
        bestOption,
        variance,
        significance,
      };
    });
  }

  /**
   * Extracts dimension score for legacy compatibility.
   */
  private extractDimensionScoreForLegacy(
    dimension: DecisionDimension,
    analysis: DecisionAnalysis
  ): ScoredDimension {
    const quality = analysis.decisionQuality;

    switch (dimension) {
      case 'FIT_QUALITY':
        return quality.fitQuality;
      case 'LIFESTYLE_QUALITY':
        return quality.lifestyleQuality;
      case 'VALUE_ALIGNMENT':
        return quality.valueAlignment;
      case 'FUTURE_POTENTIAL':
        return quality.futurePotential;
      case 'FLEXIBILITY':
        return quality.flexibility;
      case 'CONFIDENCE':
        return {
          score: analysis.confidence.overall,
          confidence: 80,
        };
      case 'RISK_LEVEL':
        return this.calculateRiskScore(analysis);
      case 'OPPORTUNITY_LEVEL':
        return this.calculateOpportunityScore(analysis);
      case 'OVERALL_QUALITY':
        return {
          score: quality.overall,
          confidence: analysis.confidence.overall,
        };
      default:
        return { score: 50, confidence: 50 };
    }
  }

  /**
   * Builds legacy rankings from authority result.
   */
  private buildLegacyRankings(
    result: Awaited<ReturnType<IDecisionAuthority['decide']>>,
    analyses: Record<string, DecisionAnalysis>
  ): DecisionRanking[] {
    return result.rankedOptions.map((option, index) => {
      const analysis = analyses[option.id];
      
      return {
        rank: index + 1,
        optionId: option.id,
        score: this.readAuthorityOverallScore(option.metadata) ?? option.score ?? 50,
        relativeStrengths: this.identifyRelativeStrengthsForLegacy(option.id, analyses),
        relativeWeaknesses: this.identifyRelativeWeaknessesForLegacy(option.id, analyses),
      };
    });
  }

  /**
   * Reads optional authority score metadata without assuming metadata shape.
   */
  private readAuthorityOverallScore(metadata: object | undefined): number | undefined {
    if (!metadata || !('scores' in metadata)) {
      return undefined;
    }

    const scores = metadata.scores;
    if (typeof scores !== 'object' || scores === null || !('overall' in scores)) {
      return undefined;
    }

    const overall = scores.overall;
    return typeof overall === 'number' ? overall : undefined;
  }

  /**
   * Builds legacy head-to-head from authority comparisons.
   */
  private buildLegacyHeadToHead(
    result: Awaited<ReturnType<IDecisionAuthority['decide']>>
  ): HeadToHeadComparison[] {
    if (!result.comparisons || result.comparisons.length === 0) {
      return [];
    }

    return result.comparisons.map((comp) => {
      const optionA = comp.optionA?.id ?? '';
      const optionB = comp.optionB?.id ?? '';
      const winner =
        comp.outcome === 'a-better' ? optionA :
        comp.outcome === 'b-better' ? optionB :
        null;

      return {
        optionA,
        optionB,
        optionAWins: comp.outcome === 'a-better' ? ['OVERALL_QUALITY'] : [],
        optionBWins: comp.outcome === 'b-better' ? ['OVERALL_QUALITY'] : [],
        equivalent: comp.outcome === 'equivalent' ? ['OVERALL_QUALITY'] : [],
        winner,
        winnerRationale: comp.rationale ?? '',
      };
    });
  }

  /**
   * Builds legacy key differentiators.
   */
  private buildLegacyDifferentiators(
    result: Awaited<ReturnType<IDecisionAuthority['decide']>>,
    dimensions: DimensionComparison[]
  ): string[] {
    const differentiators: string[] = [];

    // Extract from authority explanation
    if (result.explanation?.keyFactors) {
      differentiators.push(...result.explanation.keyFactors.slice(0, 5));
    }

    // Add dimension-based differentiators
    const highVarianceDims = dimensions
      .filter((d) => d.variance >= 20)
      .sort((a, b) => b.variance - a.variance)
      .slice(0, 2);

    for (const dim of highVarianceDims) {
      differentiators.push(
        `${this.formatDimensionName(dim.dimension)} shows significant variance across options`
      );
    }

    return differentiators;
  }

  /**
   * Identifies relative strengths for legacy format.
   */
  private identifyRelativeStrengthsForLegacy(
    optionId: string,
    analyses: Record<string, DecisionAnalysis>
  ): string[] {
    const analysis = analyses[optionId];
    if (!analysis) return [];

    return analysis.advantages
      .filter((a) => a.importance >= 70)
      .slice(0, 3)
      .map((a) => a.description);
  }

  /**
   * Identifies relative weaknesses for legacy format.
   */
  private identifyRelativeWeaknessesForLegacy(
    optionId: string,
    analyses: Record<string, DecisionAnalysis>
  ): string[] {
    const analysis = analyses[optionId];
    if (!analysis) return [];

    return analysis.disadvantages
      .filter((d) => d.severity >= 60)
      .slice(0, 3)
      .map((d) => d.description);
  }

  // ============================================================================
  // LEGACY PRIVATE METHODS (preserved for backward compatibility)
  // These methods are kept to support internal calculations during conversion
  // but comparison ownership has been transferred to DecisionAuthority
  // ============================================================================
}


/**
 * Creates a default decision comparison engine.
 *
 * @param config - Partial configuration
 * @returns Configured DecisionComparisonEngine
 * @deprecated Use createDecisionAuthority() directly for new implementations
 */
export function createDecisionComparisonEngine(
  config?: Partial<DecisionIntelligenceConfig>
): DecisionComparisonEngine {
  const fullConfig: DecisionIntelligenceConfig = {
    minConfidenceThreshold: 50,
    defaultTimeHorizon: 5,
    enableTradeoffAnalysis: true,
    enableRiskAnalysis: true,
    enableOpportunityAnalysis: true,
    fitQualityWeight: 0.25,
    lifestyleQualityWeight: 0.2,
    valueAlignmentWeight: 0.2,
    futurePotentialWeight: 0.2,
    flexibilityWeight: 0.15,
    ...config,
  };

  return new DecisionComparisonEngine(fullConfig);
}

/**
 * Legacy comparison result type.
 * @deprecated Use DecisionOutput from DecisionAuthority
 */
export type { DecisionComparison } from './decision-types';
