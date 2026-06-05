/**
 * CareerOS Market Intelligence - Market Narrative Engine
 *
 * Generates explanations about why market conditions matter
 * and why they do not dominate decisions.
 *
 * Principle: Market intelligence provides context, not direction.
 */

import type { MarketAwareCareerAnalysis } from './models/MarketAwareCareerAnalysis';
import type { Forecast } from '../forecasting/models/Forecast';

/**
 * Narrative configuration.
 */
export interface NarrativeConfig {
  /** Tone of narratives */
  tone: 'professional' | 'conversational' | 'educational';

  /** Detail level */
  detailLevel: 'brief' | 'standard' | 'detailed';

  /** Include market data */
  includeMarketData: boolean;

  /** Emphasize fit priority */
  emphasizeFitPriority: boolean;
}

/**
 * Default configuration.
 */
export const DEFAULT_NARRATIVE_CONFIG: NarrativeConfig = {
  tone: 'professional',
  detailLevel: 'standard',
  includeMarketData: true,
  emphasizeFitPriority: true,
};

/**
 * Narrative sections.
 */
export interface MarketNarrative {
  /** Primary recommendation explanation */
  primaryRecommendation: string;

  /** How market conditions support or challenge */
  marketContext: string;

  /** Why fit matters more than market */
  fitPriority: string;

  /** Confidence explanation */
  confidenceExplanation: string;

  /** Risks to consider */
  riskConsiderations: string;

  /** Full narrative */
  fullNarrative: string;

  /** Summary for quick reading */
  summary: string;
}

/**
 * Market Narrative Engine.
 */
export class MarketNarrativeEngine {
  private config: NarrativeConfig;

  constructor(config?: Partial<NarrativeConfig>) {
    this.config = { ...DEFAULT_NARRATIVE_CONFIG, ...config };
  }

  /**
   * Generate narrative for a career analysis.
   */
  generateNarrative(
    analysis: MarketAwareCareerAnalysis,
    forecast?: Forecast
  ): MarketNarrative {
    const primaryRecommendation = this.generatePrimaryRecommendation(analysis);
    const marketContext = this.generateMarketContext(analysis, forecast);
    const fitPriority = this.generateFitPriority(analysis);
    const confidenceExplanation = this.generateConfidenceExplanation(analysis);
    const riskConsiderations = this.generateRiskConsiderations(analysis);

    const fullNarrative = [
      primaryRecommendation,
      '',
      marketContext,
      '',
      fitPriority,
      '',
      confidenceExplanation,
      '',
      riskConsiderations,
    ].join('\n');

    const summary = this.generateSummary(analysis);

    return {
      primaryRecommendation,
      marketContext,
      fitPriority,
      confidenceExplanation,
      riskConsiderations,
      fullNarrative,
      summary,
    };
  }

  /**
   * Generate comparison narrative.
   */
  generateComparisonNarrative(
    analyses: MarketAwareCareerAnalysis[],
    forecasts?: Map<string, Forecast>
  ): {
    overview: string;
    individualNarratives: Map<string, MarketNarrative>;
    comparisonSummary: string;
  } {
    const individualNarratives = new Map<string, MarketNarrative>();

    for (const analysis of analyses) {
      const forecast = forecasts?.get(analysis.careerId);
      individualNarratives.set(analysis.careerId, this.generateNarrative(analysis, forecast));
    }

    const overview = this.generateComparisonOverview(analyses);
    const comparisonSummary = this.generateComparisonSummary(analyses);

    return {
      overview,
      individualNarratives,
      comparisonSummary,
    };
  }

  /**
   * Generate market context narrative.
   */
  generateMarketContext(
    analysis: MarketAwareCareerAnalysis,
    forecast?: Forecast
  ): string {
    if (!this.config.includeMarketData) {
      return '';
    }

    const marketScore = analysis.marketScore;

    let context: string;

    if (marketScore >= 80) {
      context = `Current market conditions are highly favorable for ${analysis.careerTitle}. `;
      context += `Strong demand, competitive salaries, and growth opportunities support this path.`;
    } else if (marketScore >= 65) {
      context = `Market conditions are generally positive for ${analysis.careerTitle}. `;
      context += `Steady demand and reasonable opportunities exist.`;
    } else if (marketScore >= 50) {
      context = `Market conditions for ${analysis.careerTitle} are stable. `;
      context += `Neither strong tailwinds nor significant headwinds are present.`;
    } else if (marketScore >= 35) {
      context = `Market conditions for ${analysis.careerTitle} present some challenges. `;
      context += `Reduced demand or increased competition may require additional effort.`;
    } else {
      context = `Market conditions for ${analysis.careerTitle} are currently difficult. `;
      context += `Lower demand or other challenges exist, but strong fit can overcome these obstacles.`;
    }

    if (forecast && this.config.detailLevel === 'detailed') {
      context += `\n\nForecast data: `;
      const baselineDemand = typeof forecast.baselineScenario.demandProjection === 'number'
        ? forecast.baselineScenario.demandProjection
        : forecast.baselineScenario.demandProjection.expected;
      context += `Baseline demand projection of ${baselineDemand}/100 over ${forecast.horizon.replace('_', ' ')}. `;
      context += `Confidence in forecast: ${forecast.confidence.overall}%.`;
    }

    return context;
  }

  /**
   * Generate why fit matters more narrative.
   */
  generateFitPriority(analysis: MarketAwareCareerAnalysis): string {
    const parts: string[] = [];

    parts.push('Why fit matters more than market demand:');
    parts.push('');

    parts.push('While market conditions provide important context, psychological fit remains the primary factor in career satisfaction and long-term success.');
    parts.push('');

    parts.push(`Your fit score of ${analysis.fitScore}/100 indicates strong alignment with the core demands and characteristics of ${analysis.careerTitle}. `);

    if (analysis.fitScore >= 80) {
      parts.push('This excellent fit suggests you would thrive in this role regardless of market fluctuations.');
    } else if (analysis.fitScore >= 65) {
      parts.push('This good fit provides a solid foundation for career satisfaction.');
    } else {
      parts.push('Moderate fit should be carefully weighed against market factors.');
    }

    parts.push('');
    parts.push('Research consistently shows that intrinsic motivation, derived from fit, drives sustained performance more than external market rewards. ');
    parts.push('Market conditions change; your fundamental fit with a career path endures.');

    if (this.config.emphasizeFitPriority) {
      parts.push('');
      parts.push('This recommendation prioritizes your long-term fulfillment over short-term market advantages.');
    }

    return parts.join('\n');
  }

  /**
   * Generate confidence explanation.
   */
  generateConfidenceExplanation(analysis: MarketAwareCareerAnalysis): string {
    const parts: string[] = [];

    parts.push(`Confidence assessment (${analysis.confidence}%):`);
    parts.push('');

    // Base confidence factors
    parts.push(`Base factors: Fit (${analysis.fitScore}), Values (${analysis.valuesScore}), Utility (${analysis.utilityScore})`);

    if (analysis.marketAdjustment !== 0) {
      parts.push(`Market adjustment: ${analysis.marketAdjustment > 0 ? '+' : ''}${analysis.marketAdjustment} points`);
    }

    parts.push('');

    // Explain confidence level
    if (analysis.confidence >= 90) {
      parts.push('Very high confidence reflects strong alignment across all dimensions, supported by favorable market conditions.');
    } else if (analysis.confidence >= 75) {
      parts.push('High confidence indicates solid foundation with either strong fit supporting weaker market conditions or good market conditions supporting moderate fit.');
    } else if (analysis.confidence >= 60) {
      parts.push('Moderate confidence suggests viable path but may require trade-offs or additional development.');
    } else {
      parts.push('Lower confidence indicates significant uncertainties or trade-offs that warrant careful consideration.');
    }

    return parts.join('\n');
  }

  /**
   * Generate risk considerations.
   */
  generateRiskConsiderations(analysis: MarketAwareCareerAnalysis): string {
    const parts: string[] = [];

    parts.push('Risk considerations:');
    parts.push('');

    if (analysis.riskFlags.length === 0) {
      parts.push('No significant risk flags identified. Standard career transition considerations apply.');
    } else {
      for (const flag of analysis.riskFlags) {
        parts.push(this.explainRiskFlag(flag, analysis));
      }
    }

    parts.push('');
    parts.push('Mitigation: ');

    if (analysis.marketScore < 50 && analysis.fitScore > 75) {
      parts.push('Your strong fit provides resilience against market headwinds. Consider developing complementary skills to broaden opportunities.');
    } else if (analysis.marketScore > 75 && analysis.fitScore < 75) {
      parts.push('Strong market conditions present opportunity, but ensure fit alignment through skill development or role customization.');
    } else {
      parts.push('Regular reassessment of market conditions and continued skill development will support career progression.');
    }

    return parts.join('\n');
  }

  /**
   * Generate quick summary.
   */
  generateSummary(analysis: MarketAwareCareerAnalysis): string {
    const parts: string[] = [];

    parts.push(`${analysis.careerTitle}:`);
    parts.push(`Fit: ${analysis.fitScore} | Market: ${analysis.marketScore} | Final: ${analysis.finalScore}`);

    if (analysis.marketDriven) {
      parts.push('⚠️ Market-driven recommendation - verify fit carefully');
    } else {
      parts.push(`✓ Driven by ${this.getPrimaryDriver(analysis)}`);
    }

    return parts.join('\n');
  }

  // Private methods

  private generatePrimaryRecommendation(analysis: MarketAwareCareerAnalysis): string {
    const parts: string[] = [];

    parts.push(`Recommendation: ${analysis.careerTitle}`);
    parts.push('');

    // Primary driver
    const driver = this.getPrimaryDriver(analysis);
    parts.push(`Primary driver: ${driver}`);

    // Score summary
    parts.push(`\nScore breakdown:`);
    parts.push(`- Psychological Fit: ${analysis.fitScore}/100`);
    parts.push(`- Values Alignment: ${analysis.valuesScore}/100`);
    parts.push(`- Utility: ${analysis.utilityScore}/100`);
    parts.push(`- Market Conditions: ${analysis.marketScore}/100`);
    parts.push(`\nFinal Score: ${analysis.finalScore}/100 (${analysis.confidence}% confidence)`);

    return parts.join('\n');
  }

  private getPrimaryDriver(analysis: MarketAwareCareerAnalysis): string {
    const scores = [
      { name: 'Psychological Fit', score: analysis.fitScore },
      { name: 'Values Alignment', score: analysis.valuesScore },
      { name: 'Utility', score: analysis.utilityScore },
      { name: 'Market Conditions', score: analysis.marketScore },
    ];

    scores.sort((a, b) => b.score - a.score);
    return scores[0]!.name;
  }

  private generateComparisonOverview(
    analyses: MarketAwareCareerAnalysis[]
  ): string {
    const avgFit = Math.round(
      analyses.reduce((sum, a) => sum + a.fitScore, 0) / analyses.length
    );
    const avgMarket = Math.round(
      analyses.reduce((sum, a) => sum + a.marketScore, 0) / analyses.length
    );

    const marketDriven = analyses.filter((a) => a.marketDriven).length;

    return `Comparing ${analyses.length} career options. ` +
      `Average fit: ${avgFit}/100. ` +
      `Average market: ${avgMarket}/100. ` +
      `${marketDriven} options flagged as market-driven and require verification.`;
  }

  private generateComparisonSummary(
    analyses: MarketAwareCareerAnalysis[]
  ): string {
    const sorted = [...analyses].sort((a, b) => b.finalScore - a.finalScore);
    const top = sorted[0]!;

    return `Top recommendation: ${top.careerTitle} (Score: ${top.finalScore}). ` +
      `Driven by ${this.getPrimaryDriver(top)}. ` +
      `${top.marketDriven ? '⚠️ Verify fit carefully - market-driven.' : '✓ Well-balanced recommendation.'}`;
  }

  private explainRiskFlag(flag: string, analysis: MarketAwareCareerAnalysis): string {
    const explanations: Record<string, string> = {
      'market-driven-low-fit': `⚠️ Recommendation appears driven by market demand (${analysis.marketScore}) despite moderate fit (${analysis.fitScore}). Verify personal alignment before pursuing.`,
      'strong-fit-weak-market': `ℹ️ Strong fit (${analysis.fitScore}) exists in challenging market (${analysis.marketScore}). Path is viable but may require additional effort or time.`,
      'large-market-adjustment': `ℹ️ Significant market adjustment (${analysis.marketAdjustment}) applied. Monitor market conditions for changes.`,
      'low-overall-confidence': `⚠️ Lower confidence (${analysis.confidence}%) suggests uncertainties. Consider gathering more information before committing.`,
      'market-confidence-reduction': `ℹ️ Market conditions reduced confidence. Fit remains primary justification.`,
      'high-market-volatility': `ℹ️ High market volatility introduces uncertainty. Wide scenario ranges reflect this.`,
    };

    return explanations[flag] || `ℹ️ ${flag}`;
  }
}

/**
 * Factory function.
 */
export function createMarketNarrativeEngine(
  config?: Partial<NarrativeConfig>
): MarketNarrativeEngine {
  return new MarketNarrativeEngine(config);
}
