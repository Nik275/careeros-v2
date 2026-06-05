/**
 * Fusion Explanation Engine
 *
 * Generates explainable reasoning for recommendations.
 * Transforms raw scores into human-readable explanations.
 */

import {
  FusedRecommendation,
  FusionTimestamp,
  Weight,
} from './fusion-types';

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface ExplanationConfig {
  // Explanation style
  style: 'concise' | 'detailed' | 'conversational';
  maxLength: number;
  includeNumbers: boolean;

  // Component inclusion
  includePsychology: boolean;
  includeCareer: boolean;
  includeMentor: boolean;
  includeLearning: boolean;
  includeRisks: boolean;
  includeOpportunityCost: boolean;

  // Language settings
  tone: 'supportive' | 'neutral' | 'direct';
  useSecondPerson: boolean;
}

export const DEFAULT_EXPLANATION_CONFIG: ExplanationConfig = {
  style: 'detailed',
  maxLength: 500,
  includeNumbers: true,

  includePsychology: true,
  includeCareer: true,
  includeMentor: true,
  includeLearning: true,
  includeRisks: true,
  includeOpportunityCost: true,

  tone: 'supportive',
  useSecondPerson: true,
};

// ============================================================================
// OUTPUT TYPES
// ============================================================================

export interface ExplanationOutput {
  recommendationId: string;
  careerId: string;
  careerName: string;
  generatedAt: FusionTimestamp;

  // Core explanation
  summary: string;
  detailedExplanation: string;
  keyPoints: string[];

  // Component explanations
  psychologyExplanation?: string;
  careerExplanation?: string;
  mentorExplanation?: string;
  learningExplanation?: string;

  // Risk explanation
  riskExplanation?: string;
  opportunityCostExplanation?: string;

  // Comparison (if applicable)
  comparisonWithAlternatives?: Array<{
    careerName: string;
    whyRankedLower: string;
  }>;

  // Next steps
  suggestedNextSteps: string[];

  // Metadata
  confidence: number;
  wordCount: number;
  readingTime: number; // seconds
}

// ============================================================================
// ENGINE
// ============================================================================

export class FusionExplanationEngine {
  private config: ExplanationConfig;

  constructor(config: Partial<ExplanationConfig> = {}) {
    this.config = { ...DEFAULT_EXPLANATION_CONFIG, ...config };
  }

  /**
   * Generate explanation for a recommendation
   */
  generateExplanation(
    recommendation: FusedRecommendation,
    options?: {
      compareWith?: FusedRecommendation[];
      studentName?: string;
    }
  ): ExplanationOutput {
    const generatedAt = Date.now();
    const you = this.config.useSecondPerson ? 'you' : 'the student';
    const your = this.config.useSecondPerson ? 'your' : 'the student\'s';

    // Generate summary
    const summary = this.generateSummary(recommendation, you, your);

    // Generate detailed explanation
    const detailedExplanation = this.generateDetailedExplanation(
      recommendation,
      you,
      your,
      options?.studentName
    );

    // Generate key points
    const keyPoints = this.generateKeyPoints(recommendation, you, your);

    // Generate component explanations
    const psychologyExplanation = this.config.includePsychology
      ? this.generatePsychologyExplanation(recommendation, you, your)
      : undefined;

    const careerExplanation = this.config.includeCareer
      ? this.generateCareerExplanation(recommendation, you, your)
      : undefined;

    const mentorExplanation = this.config.includeMentor
      ? this.generateMentorExplanation(recommendation, you, your)
      : undefined;

    const learningExplanation = this.config.includeLearning
      ? this.generateLearningExplanation(recommendation, you, your)
      : undefined;

    // Generate risk explanation
    const riskExplanation = this.config.includeRisks
      ? this.generateRiskExplanation(recommendation, you, your)
      : undefined;

    // Generate opportunity cost explanation
    const opportunityCostExplanation = this.config.includeOpportunityCost
      ? this.generateOpportunityCostExplanation(recommendation, you, your)
      : undefined;

    // Generate comparison
    const comparisonWithAlternatives = options?.compareWith
      ? this.generateComparison(recommendation, options.compareWith, you, your)
      : undefined;

    // Generate next steps
    const suggestedNextSteps = this.generateNextSteps(recommendation, you, your);

    // Calculate metadata
    const fullText = `${summary} ${detailedExplanation} ${keyPoints.join(' ')}`;
    const wordCount = fullText.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); // 200 WPM reading speed

    return {
      recommendationId: recommendation.recommendationId,
      careerId: recommendation.careerId,
      careerName: recommendation.careerName,
      generatedAt,
      summary,
      detailedExplanation,
      keyPoints,
      psychologyExplanation,
      careerExplanation,
      mentorExplanation,
      learningExplanation,
      riskExplanation,
      opportunityCostExplanation,
      comparisonWithAlternatives,
      suggestedNextSteps,
      confidence: recommendation.confidence.overallConfidence,
      wordCount,
      readingTime,
    };
  }

  /**
   * Generate comparison explanation between multiple recommendations
   */
  generateComparisonExplanation(
    recommendations: FusedRecommendation[],
    options?: {
      studentName?: string;
      highlightDifferences?: boolean;
    }
  ): {
    overview: string;
    comparisonTable: Array<{
      careerName: string;
      rank: number;
      confidence: number;
      keyStrength: string;
      mainConcern: string;
    }>;
    tradeOffs: string[];
    recommendation: string;
  } {
    if (recommendations.length === 0) {
      return {
        overview: 'No recommendations available for comparison.',
        comparisonTable: [],
        tradeOffs: [],
        recommendation: '',
      };
    }

    const top3 = recommendations.slice(0, 3);
    const you = this.config.useSecondPerson ? 'you' : 'the student';

    // Generate overview
    const overview = `Based on the analysis, ${top3[0].careerName} emerges as the strongest recommendation for ${you}, with ${top3[0].confidence.overallConfidence}% confidence. Here's how the top options compare:`;

    // Generate comparison table
    const comparisonTable = top3.map(rec => ({
      careerName: rec.careerName,
      rank: rec.rank,
      confidence: rec.confidence.overallConfidence,
      keyStrength: this.extractKeyStrength(rec),
      mainConcern: rec.risks.length > 0 ? rec.risks[0].risk : 'None identified',
    }));

    // Generate trade-offs
    const tradeOffs = this.generateTradeOffs(top3, you);

    // Generate final recommendation
    const recommendation = this.generateComparisonRecommendation(top3[0], top3[1], you);

    return {
      overview,
      comparisonTable,
      tradeOffs,
      recommendation,
    };
  }

  /**
   * Generate a short explanation (for UI cards)
   */
  generateShortExplanation(recommendation: FusedRecommendation): string {
    const you = this.config.useSecondPerson ? 'you' : 'the student';
    const your = this.config.useSecondPerson ? 'your' : 'the student\'s';

    let explanation = `${recommendation.careerName} ranks #${recommendation.rank} because `;

    // Add top contributing factor
    const topEngine = recommendation.engineContributions.sort((a, b) => b.contribution - a.contribution)[0];
    if (topEngine) {
      const engineName = topEngine.engineId;
      explanation += `it strongly aligns with ${your} ${engineName} profile.`;
    }

    // Add optionality if high
    if (recommendation.optionality.optionalityScore > 80) {
      explanation += ` It also keeps ${recommendation.optionality.futureOptions} future paths open.`;
    }

    return explanation;
  }

  // ============================================================================
  // PRIVATE GENERATION METHODS
  // ============================================================================

  private generateSummary(
    rec: FusedRecommendation,
    you: string,
    your: string
  ): string {
    const tone = this.getTonePrefix();
    const confidencePhrase = this.getConfidencePhrase(rec.confidence.overallConfidence);

    return `${tone}${rec.careerName} is ${confidencePhrase} recommended for ${you} based on strong alignment across multiple dimensions.`;
  }

  private generateDetailedExplanation(
    rec: FusedRecommendation,
    you: string,
    your: string,
    studentName?: string
  ): string {
    const name = studentName || you;
    const parts: string[] = [];

    // Opening
    parts.push(`This recommendation for ${rec.careerName} is built on a comprehensive analysis of ${your} profile, combining insights from psychology, career prospects, mentor intelligence, and historical outcomes.`);

    // Engine contributions
    const contributingEngines = rec.engineContributions
      .filter(e => e.contribution > 0.1)
      .map(e => e.engineId)
      .join(', ');

    if (contributingEngines) {
      parts.push(`The ${rec.careerName} recommendation draws strength from ${contributingEngines} insights, each contributing unique perspectives to the overall assessment.`);
    }

    // Confidence explanation
    parts.push(`With ${rec.confidence.overallConfidence}% confidence, this recommendation reflects ${rec.confidence.engineAgreementDetails.agreeingEngines.length} engines in strong agreement.`);

    return parts.join(' ');
  }

  private generateKeyPoints(
    rec: FusedRecommendation,
    you: string,
    your: string
  ): string[] {
    const points: string[] = [];

    // Psychology point
    if (rec.evidence.psychology.contributes && rec.evidence.psychology.strength > 0.5) {
      points.push(`Aligns well with ${your} psychological profile and interests.`);
    }

    // Career point
    if (rec.evidence.career.contributes && rec.evidence.career.strength > 0.5) {
      points.push(`Strong career prospects with good future demand.`);
    }

    // Optionality point
    if (rec.optionality.optionalityScore > 70) {
      points.push(`Keeps ${rec.optionality.futureOptions} future career paths open.`);
    }

    // Reversibility point
    if (rec.reversibility.score > 0.6) {
      points.push(`Can pivot relatively easily if needed (${rec.reversibility.reversalDifficulty} reversal).`);
    }

    // Risk point
    if (rec.risks.length === 0) {
      points.push(`Low risk profile with no major concerns identified.`);
    } else if (rec.risks.every(r => r.impact !== 'high' && r.impact !== 'severe')) {
      points.push(`Manageable risk profile with clear mitigation strategies.`);
    }

    return points;
  }

  private generatePsychologyExplanation(
    rec: FusedRecommendation,
    you: string,
    your: string
  ): string {
    if (!rec.evidence.psychology.contributes) {
      return `${this.getTonePrefix()}The psychological alignment is moderate for this recommendation.`;
    }

    const strength = Math.round(rec.evidence.psychology.strength * 100);
    return `${this.getTonePrefix()}From a psychological perspective, ${rec.careerName} shows ${strength}% alignment with ${your} interests, strengths, and values. This career matches ${your} motivation patterns and supports ${your} core value system.`;
  }

  private generateCareerExplanation(
    rec: FusedRecommendation,
    you: string,
    your: string
  ): string {
    if (!rec.evidence.career.contributes) {
      return `${this.getTonePrefix()}Career market data provides neutral support for this path.`;
    }

    const strength = Math.round(rec.evidence.career.strength * 100);
    let explanation = `${this.getTonePrefix()}Career analysis shows ${strength}% favorability for ${rec.careerName}. `;

    if (rec.optionality.optionalityScore > 70) {
      explanation += `This path offers excellent optionality with ${rec.optionality.pivotPossibilities.length} viable pivot options.`;
    }

    if (rec.reversibility.score > 0.6) {
      explanation += ` The reversibility score indicates ${you} can change course with ${rec.reversibility.estimatedCost}.`;
    }

    return explanation;
  }

  private generateMentorExplanation(
    rec: FusedRecommendation,
    you: string,
    your: string
  ): string {
    if (!rec.evidence.mentor.contributes) {
      return `${this.getTonePrefix()}Limited mentor pattern data available for this career path.`;
    }

    return `${this.getTonePrefix()}Mentor intelligence indicates this career path aligns with observed success patterns. Historical mentoring data shows students with similar profiles have succeeded in this field.`;
  }

  private generateLearningExplanation(
    rec: FusedRecommendation,
    you: string,
    your: string
  ): string {
    if (!rec.evidence.learning.contributes) {
      return `${this.getTonePrefix()}Learning loop data is still being gathered for this career path.`;
    }

    return `${this.getTonePrefix()}Population outcome data supports this recommendation. Students who chose similar paths have shown positive long-term outcomes with manageable risk profiles.`;
  }

  private generateRiskExplanation(
    rec: FusedRecommendation,
    you: string,
    your: string
  ): string {
    if (rec.risks.length === 0) {
      return `${this.getTonePrefix()}No significant risks have been identified for this career path.`;
    }

    const highRisks = rec.risks.filter(r => r.impact === 'high' || r.impact === 'severe');
    const otherRisks = rec.risks.filter(r => r.impact !== 'high' && r.impact !== 'severe');

    let explanation = `${this.getTonePrefix()}Several risks warrant consideration: `;

    if (highRisks.length > 0) {
      explanation += `${highRisks.map(r => r.risk).join(', ')} are notable concerns. `;
    }

    if (otherRisks.length > 0) {
      explanation += `Additional factors include ${otherRisks.map(r => r.risk).join(', ')}. `;
    }

    explanation += `Mitigation strategies are available for each identified risk.`;

    return explanation;
  }

  private generateOpportunityCostExplanation(
    rec: FusedRecommendation,
    you: string,
    your: string
  ): string {
    if (rec.opportunityCost.sacrificedOptions.length === 0) {
      return `${this.getTonePrefix()}This career path doesn't require sacrificing other viable options.`;
    }

    const options = rec.opportunityCost.sacrificedOptions.slice(0, 3).join(', ');
    return `${this.getTonePrefix()}By choosing ${rec.careerName}, ${you} would be setting aside opportunities in ${options}. However, the reversibility score of ${Math.round(rec.reversibility.score * 100)}% means these options may remain accessible later.`;
  }

  private generateComparison(
    rec: FusedRecommendation,
    alternatives: FusedRecommendation[],
    you: string,
    your: string
  ): Array<{ careerName: string; whyRankedLower: string }> {
    return alternatives
      .filter(alt => alt.careerId !== rec.careerId)
      .slice(0, 2)
      .map(alt => {
        const scoreDiff = rec.finalScore - alt.finalScore;
        let reason: string;

        if (scoreDiff > 10) {
          reason = `Lower overall alignment score (${Math.round(alt.finalScore)} vs ${Math.round(rec.finalScore)})`;
        } else if (rec.confidence.overallConfidence - alt.confidence.overallConfidence > 15) {
          reason = `Lower confidence from supporting evidence`;
        } else if (rec.optionality.optionalityScore > alt.optionality.optionalityScore + 10) {
          reason = `Fewer future pivot options`;
        } else {
          reason = `Slightly lower multi-dimensional fit`;
        }

        return {
          careerName: alt.careerName,
          whyRankedLower: reason,
        };
      });
  }

  private generateNextSteps(
    rec: FusedRecommendation,
    you: string,
    your: string
  ): string[] {
    const steps: string[] = [];

    steps.push(`Explore ${rec.careerName} in more detail through informational interviews or job shadowing.`);

    if (rec.risks.length > 0) {
      steps.push(`Research mitigation strategies for the identified risks.`);
    }

    if (rec.optionality.pivotPossibilities.length > 0) {
      steps.push(`Consider exploring related paths like ${rec.optionality.pivotPossibilities.slice(0, 2).join(' or ')} as backup options.`);
    }

    if (rec.confidence.overallConfidence < 70) {
      steps.push(`Gather more information to increase confidence in this recommendation.`);
    }

    steps.push(`Discuss this recommendation with a career counselor or mentor.`);

    return steps;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private getTonePrefix(): string {
    switch (this.config.tone) {
      case 'supportive':
        return '';
      case 'direct':
        return '';
      case 'neutral':
      default:
        return '';
    }
  }

  private getConfidencePhrase(confidence: number): string {
    if (confidence >= 85) return 'strongly';
    if (confidence >= 70) return 'confidently';
    if (confidence >= 55) return 'moderately';
    return 'provisionally';
  }

  private extractKeyStrength(rec: FusedRecommendation): string {
    const contributions = rec.engineContributions.sort((a, b) => b.contribution - a.contribution);
    if (contributions.length === 0) return 'Balanced profile fit';

    const topEngine = contributions[0].engineId;
    const engineLabels: Record<string, string> = {
      psychology: 'Strong psychological alignment',
      career: 'Excellent career prospects',
      mentor: 'Proven mentor track record',
      learning: 'Strong historical outcomes',
    };

    return engineLabels[topEngine] || 'Good overall fit';
  }

  private generateTradeOffs(
    recs: FusedRecommendation[],
    you: string
  ): string[] {
    const tradeOffs: string[] = [];

    if (recs.length < 2) return tradeOffs;

    const [first, second] = recs;

    if (first.optionality.optionalityScore > second.optionality.optionalityScore + 15) {
      tradeOffs.push(`${first.careerName} offers more future flexibility than ${second.careerName}.`);
    } else if (second.optionality.optionalityScore > first.optionality.optionalityScore + 15) {
      tradeOffs.push(`${second.careerName} offers more future flexibility, though ${first.careerName} ranks higher overall.`);
    }

    if (first.confidence.overallConfidence > second.confidence.overallConfidence + 15) {
      tradeOffs.push(`${first.careerName} has stronger evidence support (${first.confidence.overallConfidence}% vs ${second.confidence.overallConfidence}% confidence).`);
    }

    return tradeOffs;
  }

  private generateComparisonRecommendation(
    top: FusedRecommendation,
    runnerUp: FusedRecommendation | undefined,
    you: string
  ): string {
    let rec = `Based on this analysis, ${top.careerName} is the recommended path forward.`;

    if (runnerUp && top.finalScore - runnerUp.finalScore < 10) {
      rec += ` However, ${runnerUp.careerName} is a close alternative worth considering if ${you} have specific preferences.`;
    }

    return rec;
  }

  getConfig(): ExplanationConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<ExplanationConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

export default FusionExplanationEngine;
