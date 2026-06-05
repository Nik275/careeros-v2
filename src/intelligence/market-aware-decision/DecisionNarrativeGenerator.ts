/**
 * Decision Narrative Generator
 *
 * Generates market-aware explanations that preserve decision quality focus.
 *
 * ## Example Output
 *
 * "Software Engineering remains recommended because:
 *  - strong fit with your psychological profile
 *  - strong optionality for future transitions
 *  - healthy market outlook
 *
 * Market conditions improve confidence but are not the primary reason
 * for this recommendation."
 *
 * ## Narrative Principles
 *
 * 1. Lead with fit and utility, not market trends
 * 2. Present market as supporting evidence
 * 3. Avoid implying market > personal factors
 * 4. Be transparent about adjustments
 * 5. Maintain supportive tone
 */

import type {
  MarketAwareDecisionNarrative,
  MarketAwareRecommendation,
  DecisionIntelligenceResult,
  MarketIntelligenceReport,
  NarrativeGeneratorConfig,
  DecisionId,
  RecommendationId,
} from './types.js';

import { DEFAULT_NARRATIVE_GENERATOR_CONFIG } from './types.js';

// ============================================================================
// DECISION NARRATIVE GENERATOR
// ============================================================================

export class DecisionNarrativeGenerator {
  private config: NarrativeGeneratorConfig;

  constructor(config: Partial<NarrativeGeneratorConfig> = {}) {
    this.config = { ...DEFAULT_NARRATIVE_GENERATOR_CONFIG, ...config };
  }

  /**
   * Generate narrative for a market-aware recommendation.
   */
  generateNarrative(
    decisionId: DecisionId,
    recommendationId: RecommendationId,
    recommendation: MarketAwareRecommendation
  ): MarketAwareDecisionNarrative {
    const entityName = recommendation.entityName;
    const decision = recommendation.originalDecision;
    const marketIntel = recommendation.marketIntelligence;

    // Generate summary
    const summary = this.generateSummary(entityName, decision, marketIntel, recommendation);

    // Generate primary reasoning (fit, utility, etc.)
    const primaryReasoning = this.generatePrimaryReasoning(decision);

    // Generate market context
    const marketContext = this.generateMarketContext(marketIntel, recommendation);

    // Generate confidence statement
    const confidenceStatement = this.generateConfidenceStatement(recommendation);

    // Generate caveats
    const caveats = this.generateCaveats(recommendation);

    return {
      id: `narrative_${recommendationId}_${Date.now()}`,
      decisionId,
      recommendationId,
      summary,
      primaryReasoning: primaryReasoning.slice(0, this.config.maxPrimaryPoints),
      marketContext: marketContext.slice(0, this.config.maxMarketPoints),
      confidenceStatement,
      caveats,
      generatedAt: Date.now(),
    };
  }

  /**
   * Generate one-line summary.
   */
  private generateSummary(
    entityName: string,
    decision: DecisionIntelligenceResult,
    marketIntel: MarketIntelligenceReport,
    recommendation: MarketAwareRecommendation
  ): string {
    const parts: string[] = [];

    // Entity name
    parts.push(`${entityName}`);

    // Fit quality
    if (decision.fit.overall >= 80) {
      parts.push('is strongly recommended');
    } else if (decision.fit.overall >= 60) {
      parts.push('is recommended');
    } else {
      parts.push('is a viable option');
    }

    // Primary reason
    const topFactor = this.getTopFactor(decision);
    parts.push(`based on ${topFactor}`);

    // Market qualifier
    if (recommendation.opportunityBoost?.wasBoosted) {
      parts.push('with favorable market support');
    } else if (recommendation.riskAdjustment?.wasAdjusted) {
      parts.push('despite market headwinds');
    }

    return parts.join(' ') + '.';
  }

  /**
   * Generate primary reasoning (fit, utility, etc.).
   */
  private generatePrimaryReasoning(decision: DecisionIntelligenceResult): string[] {
    const reasoning: string[] = [];

    // Psychological fit
    if (decision.fit.psychological >= 70) {
      reasoning.push(`Strong psychological fit (${decision.fit.psychological}/100) - aligns with your personality and work style preferences`);
    } else if (decision.fit.psychological >= 50) {
      reasoning.push(`Moderate psychological fit (${decision.fit.psychological}/100) - reasonably aligned with your preferences`);
    }

    // Overall fit
    if (decision.fit.overall >= 75) {
      reasoning.push(`Excellent overall fit (${decision.fit.overall}/100) across all dimensions`);
    } else if (decision.fit.overall >= 60) {
      reasoning.push(`Good overall fit (${decision.fit.overall}/100) with manageable gaps`);
    }

    // Utility alignment
    if (decision.utility.aligned >= 70) {
      reasoning.push(`Strong utility alignment (${decision.utility.aligned}/100) - supports your long-term goals`);
    } else if (decision.utility.aligned >= 50) {
      reasoning.push(`Moderate utility alignment (${decision.utility.aligned}/100) - reasonably aligned with your objectives`);
    }

    // Optionality
    if (decision.optionality >= 70) {
      reasoning.push(`High optionality (${decision.optionality}/100) - preserves future career flexibility`);
    } else if (decision.optionality >= 50) {
      reasoning.push(`Good optionality (${decision.optionality}/100) - maintains reasonable future paths`);
    }

    // Satisfaction potential
    if (decision.satisfactionPotential >= 70) {
      reasoning.push(`High satisfaction potential (${decision.satisfactionPotential}/100) - likely to be fulfilling`);
    }

    // Identity congruence
    if (decision.identityCongruence >= 70) {
      reasoning.push(`Strong identity congruence (${decision.identityCongruence}/100) - aligns with who you are`);
    }

    // Low regret risk
    if (decision.regretRisk <= 30) {
      reasoning.push(`Low regret risk (${decision.regretRisk}/100) - unlikely to second-guess this choice`);
    }

    return reasoning;
  }

  /**
   * Generate market context.
   */
  private generateMarketContext(
    marketIntel: MarketIntelligenceReport,
    recommendation: MarketAwareRecommendation
  ): string[] {
    const context: string[] = [];

    // Trend context
    if (marketIntel.trend.trendType === 'growing' || marketIntel.trend.trendType === 'emerging') {
      context.push(`Growing market with ${(marketIntel.trend.strength * 100).toFixed(0)}% trend strength`);
    } else if (marketIntel.trend.trendType === 'declining') {
      context.push(`Market facing headwinds but fundamentals remain sound`);
    }

    // Opportunity score
    if (marketIntel.opportunity.opportunityScore >= 70) {
      context.push(`Strong market opportunity score (${marketIntel.opportunity.opportunityScore}/100)`);
    } else if (marketIntel.opportunity.opportunityScore >= 50) {
      context.push(`Moderate market opportunity (${marketIntel.opportunity.opportunityScore}/100)`);
    }

    // Risk context
    const riskCount = marketIntel.risks.length;
    const highRisks = marketIntel.risks.filter(r => r.riskLevel === 'high' || r.riskLevel === 'critical').length;

    if (highRisks === 0 && riskCount === 0) {
      context.push('No significant market risks identified');
    } else if (highRisks === 0) {
      context.push(`${riskCount} minor market risk(s) present but manageable`);
    } else {
      context.push(`${highRisks} significant market risk(s) to monitor`);
    }

    // Boost/adjustment note
    if (recommendation.opportunityBoost?.wasBoosted) {
      context.push(`Favorable market conditions increased confidence by ${recommendation.opportunityBoost.confidenceBoost.toFixed(1)} points`);
    } else if (recommendation.riskAdjustment?.wasAdjusted) {
      context.push(`Market risks reduced confidence by ${Math.abs(recommendation.riskAdjustment.confidenceAdjustment * 100).toFixed(1)}%`);
    }

    return context;
  }

  /**
   * Generate confidence statement.
   */
  private generateConfidenceStatement(recommendation: MarketAwareRecommendation): string {
    const confidence = recommendation.confidence;

    if (confidence >= 0.85) {
      return 'We have very high confidence in this recommendation based on strong fit and favorable conditions.';
    } else if (confidence >= 0.70) {
      return 'We have good confidence in this recommendation, though some factors warrant monitoring.';
    } else if (confidence >= 0.55) {
      return 'We have moderate confidence in this recommendation. Consider exploring alternatives.';
    } else {
      return 'We have limited confidence in this recommendation. Please review carefully before proceeding.';
    }
  }

  /**
   * Generate caveats and warnings.
   */
  private generateCaveats(recommendation: MarketAwareRecommendation): string[] {
    const caveats: string[] = [];

    // Market risks
    const criticalRisks = recommendation.marketIntelligence.risks.filter(
      r => r.riskLevel === 'critical'
    );
    const highRisks = recommendation.marketIntelligence.risks.filter(
      r => r.riskLevel === 'high'
    );

    for (const risk of criticalRisks) {
      caveats.push(`Critical: ${risk.riskType} - ${risk.indicators[0]}`);
    }

    for (const risk of highRisks.slice(0, 2)) {
      caveats.push(`Warning: ${risk.riskType} - consider mitigation strategies`);
    }

    // Fit gaps
    const decision = recommendation.originalDecision;
    if (decision.fit.psychological < 60) {
      caveats.push('Psychological fit could be stronger - assess personal compatibility carefully');
    }

    if (decision.regretRisk > 50) {
      caveats.push('Higher than ideal regret risk - ensure alignment with core values');
    }

    // Override protection note
    if (recommendation.overrideProtection.isProtected) {
      caveats.push('Market trends were prevented from overriding fit considerations');
    }

    // Stability note
    if (!recommendation.stability.isStable) {
      caveats.push('This recommendation has shown volatility - monitor for changes');
    }

    return caveats;
  }

  /**
   * Get the top factor for a decision.
   */
  private getTopFactor(decision: DecisionIntelligenceResult): string {
    const factors = [
      { name: 'strong psychological fit', score: decision.fit.psychological },
      { name: 'strong overall fit', score: decision.fit.overall },
      { name: 'strong utility alignment', score: decision.utility.aligned },
      { name: 'high optionality', score: decision.optionality },
      { name: 'high satisfaction potential', score: decision.satisfactionPotential },
      { name: 'strong identity congruence', score: decision.identityCongruence },
    ];

    factors.sort((a, b) => b.score - a.score);
    return factors[0].name;
  }

  /**
   * Generate comparison narrative.
   */
  generateComparisonNarrative(
    recommendations: MarketAwareRecommendation[]
  ): string {
    const topRec = recommendations[0];
    const secondRec = recommendations[1];

    if (!topRec || !secondRec) {
      return 'Insufficient recommendations for comparison.';
    }

    const parts: string[] = [];

    parts.push(`${topRec.entityName} is ranked first`);

    // Compare fit
    const fitDiff = topRec.originalDecision.fit.overall - secondRec.originalDecision.fit.overall;
    if (fitDiff > 10) {
      parts.push(`due to significantly better fit (+${fitDiff.toFixed(0)} points)`);
    } else if (fitDiff > 0) {
      parts.push(`with modest fit advantage (+${fitDiff.toFixed(0)} points)`);
    }

    // Compare market
    const marketDiff = topRec.marketIntelligence.opportunity.opportunityScore -
      secondRec.marketIntelligence.opportunity.opportunityScore;
    if (marketDiff > 10) {
      parts.push(`and stronger market conditions (+${marketDiff.toFixed(0)} points)`);
    }

    // Final score difference
    const scoreDiff = topRec.scores.final - secondRec.scores.final;
    parts.push(`(overall advantage: ${scoreDiff.toFixed(1)} points)`);

    return parts.join(' ') + '.';
  }

  /**
   * Generate summary for all recommendations.
   */
  generateDecisionSummary(
    decisionId: DecisionId,
    recommendations: MarketAwareRecommendation[]
  ): {
    summary: string;
    topRecommendation: string;
    totalConsidered: number;
    marketInfluence: string;
  } {
    const topRec = recommendations[0];

    const summary = `Analyzed ${recommendations.length} recommendations with market awareness. ` +
      `${topRec.entityName} ranked highest with score of ${topRec.scores.final.toFixed(1)}/100.`;

    const topRecommendation = `${topRec.entityName}: ${topRec.narrative.summary}`;

    // Calculate market influence
    const boosted = recommendations.filter(r => r.opportunityBoost?.wasBoosted).length;
    const penalized = recommendations.filter(r => r.riskAdjustment?.wasAdjusted).length;
    const protected = recommendations.filter(r => r.overrideProtection.isProtected).length;

    let marketInfluence = `Market adjustments: ${boosted} boosted, ${penalized} penalized`;
    if (protected > 0) {
      marketInfluence += `, ${protected} protected from trend chasing`;
    }

    return {
      summary,
      topRecommendation,
      totalConsidered: recommendations.length,
      marketInfluence,
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export function createDecisionNarrativeGenerator(
  config?: Partial<NarrativeGeneratorConfig>
): DecisionNarrativeGenerator {
  return new DecisionNarrativeGenerator(config);
}

export function quickGenerateDecisionNarrative(
  entityName: string,
  fitScore: number,
  marketScore: number
): string {
  const generator = new DecisionNarrativeGenerator();

  // Create minimal mock recommendation for quick narrative
  const mockDecision: DecisionIntelligenceResult = {
    decisionId: 'mock',
    recommendationId: 'mock',
    fit: {
      psychological: fitScore,
      skills: fitScore,
      values: fitScore,
      overall: fitScore,
    },
    utility: {
      shortTerm: 70,
      longTerm: 70,
      aligned: 70,
    },
    optionality: 70,
    regretRisk: 30,
    satisfactionPotential: 75,
    identityCongruence: 70,
    originalScore: fitScore,
    isParetoOptimal: true,
  };

  const mockMarketIntel: MarketIntelligenceReport = {
    id: 'mock',
    entityId: 'mock',
    entityType: 'career',
    entityName,
    generatedAt: Date.now(),
    trend: {
      id: 'mock',
      entityId: 'mock',
      entityType: 'career',
      trendType: 'stable',
      strength: 0.6,
      confidence: 0.8,
      explanation: [],
      detectedAt: Date.now(),
      detectionMethod: 'linear-regression',
      timeWindow: { start: Date.now(), end: Date.now() },
      supportingData: { dataPoints: 5, slope: 0.05, r2Score: 0.8 },
    },
    opportunity: {
      id: 'mock',
      entityId: 'mock',
      entityType: 'career',
      opportunityScore: marketScore,
      confidence: 0.75,
      drivers: [],
      risks: [],
      assessedAt: Date.now(),
      scoreComponents: {
        demand: marketScore,
        competition: 60,
        salaryGrowth: 60,
        futureOutlook: marketScore,
        automationRisk: 70,
      },
    },
    risks: [],
    momentum: undefined,
    narrative: {
      id: 'mock',
      entityId: 'mock',
      entityType: 'career',
      summary: '',
      keyPoints: [],
      supportingEvidence: [],
      recommendations: [],
      generatedAt: Date.now(),
      confidence: 0.75,
    },
    overallScore: (fitScore + marketScore) / 2 - 50,
    overallAssessment: 'favorable',
    confidence: 0.75,
    dataQuality: {
      dataPoints: 10,
      timeSpan: 180,
      sources: 3,
    },
  };

  const mockRecommendation: MarketAwareRecommendation = {
    id: 'mock',
    decisionId: 'mock',
    recommendationId: 'mock',
    entityId: 'mock',
    entityType: 'career',
    entityName,
    originalDecision: mockDecision,
    marketIntelligence: mockMarketIntel,
    marketAdjustment: {
      id: 'mock',
      recommendationId: 'mock',
      originalScore: fitScore,
      marketAdjustment: (marketScore - fitScore) / 10,
      adjustedScore: (fitScore + marketScore) / 2,
      adjustmentReasoning: [],
      confidence: 0.75,
      components: {
        demandAdjustment: 0,
        salaryAdjustment: 0,
        competitionAdjustment: 0,
        automationAdjustment: 0,
        outlookAdjustment: 0,
        regionalAdjustment: 0,
      },
      analyzedAt: Date.now(),
    },
    overrideProtection: {
      isProtected: false,
      reason: 'No protection needed',
      protectedFactors: [],
      wouldBeBoost: 0,
      confidence: 0.9,
    },
    stability: {
      recommendationId: 'mock',
      decisionId: 'mock',
      firstRecommendedAt: Date.now(),
      lastUpdatedAt: Date.now(),
      changeCount: 0,
      scoreHistory: [],
      isStable: true,
      volatilityScore: 0,
    },
    scores: {
      original: fitScore,
      marketAdjusted: (fitScore + marketScore) / 2,
      final: (fitScore + marketScore) / 2,
    },
    confidence: 0.75,
    rank: 1,
    isTopRecommendation: true,
    narrative: {
      id: 'mock',
      decisionId: 'mock',
      recommendationId: 'mock',
      summary: '',
      primaryReasoning: [],
      marketContext: [],
      confidenceStatement: '',
      caveats: [],
      generatedAt: Date.now(),
    },
    generatedAt: Date.now(),
  };

  const narrative = generator.generateNarrative('mock', 'mock', mockRecommendation);
  return narrative.summary;
}
