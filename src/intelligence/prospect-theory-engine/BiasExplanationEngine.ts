/**
 * CareerOS Prospect Theory & Cognitive Bias Engine - Bias Explanation Engine
 *
 * Generates human-readable explanations for bias analysis.
 */

import type {
  BiasAnalysis,
  BiasProfile,
  BiasImpact,
  BiasType,
  BiasExplanation,
  BiasSignal,
  DecisionDistortion,
} from './types';

/**
 * Generates explanations for bias analysis.
 */
export class BiasExplanationEngine {
  /**
   * Generate complete narrative for bias analysis.
   */
  generateNarrative(analysis: BiasAnalysis): BiasAnalysis['narrative'] {
    const overview = this.generateOverview(analysis);
    const biasExplanation = this.generateBiasExplanations(analysis);
    const impactExplanation = this.generateImpactExplanations(analysis);
    const recommendation = this.generateRecommendations(analysis);

    return {
      overview,
      biasExplanation,
      impactExplanation,
      recommendation,
    };
  }

  /**
   * Generate one-line overview.
   */
  private generateOverview(analysis: BiasAnalysis): string {
    const { profile, summary } = analysis;

    if (summary.dominantBias) {
      return `Analysis detected ${summary.dominantBias} as the primary cognitive bias influence (${Math.round(profile.overallBias)}% overall bias level).`;
    }

    if (summary.biasSeverity === 'minimal') {
      return 'Analysis shows minimal cognitive bias influence on career decisions.';
    }

    return `Analysis detected moderate cognitive bias influence (${Math.round(profile.overallBias)}%) across ${summary.totalSignals} signals.`;
  }

  /**
   * Generate bias explanations.
   */
  private generateBiasExplanations(analysis: BiasAnalysis): string[] {
    const explanations: string[] = [];

    for (const impact of analysis.impacts) {
      const explanation = this.explainBiasImpact(impact);
      explanations.push(explanation);
    }

    return explanations;
  }

  /**
   * Generate impact explanations.
   */
  private generateImpactExplanations(analysis: BiasAnalysis): string[] {
    const explanations: string[] = [];

    // Overall distortion
    if (analysis.distortion) {
      explanations.push(
        `Decision distortion level: ${analysis.distortion.level} (${analysis.distortion.overallScore}% distorted from rational choice)`
      );

      if (analysis.distortion.rationalComparison.rationalChoice !== analysis.distortion.rationalComparison.actualChoice) {
        explanations.push(
          `Your choice (${analysis.distortion.rationalComparison.actualChoice}) differs from the rational optimal (${analysis.distortion.rationalComparison.rationalChoice})`
        );
      }
    }

    // Individual bias impacts
    for (const impact of analysis.impacts) {
      if (impact.impact > 30) {
        const direction = this.describeDirection(impact.direction);
        explanations.push(
          `${impact.biasType}: ${impact.impact}% influence - ${direction}`
        );
      }
    }

    return explanations;
  }

  /**
   * Generate recommendations.
   */
  private generateRecommendations(analysis: BiasAnalysis): string[] {
    const recommendations: string[] = [];

    // Top bias recommendations
    for (const impact of analysis.impacts.slice(0, 3)) {
      const recs = this.getBiasRecommendations(impact.biasType);
      recommendations.push(...recs.slice(0, 2));
    }

    // General recommendations
    if (analysis.distortion && analysis.distortion.overallScore > 40) {
      recommendations.push('Consider taking time to reflect before making major career decisions');
      recommendations.push('Discuss your choices with a neutral advisor who can offer alternative perspectives');
    }

    // Remove duplicates
    return [...new Set(recommendations)];
  }

  /**
   * Explain a specific bias impact.
   */
  explainBiasImpact(impact: BiasImpact): string {
    const parts: string[] = [];

    // Bias name and severity
    const displayName = this.getBiasDisplayName(impact.biasType);
    parts.push(`${displayName} (${impact.severity} - ${impact.impact}%)`);

    // Manifestation
    parts.push(impact.manifestation);

    // Direction
    if (impact.direction === 'increases_attractiveness') {
      parts.push('This bias is making certain options appear more attractive than they objectively are.');
    } else if (impact.direction === 'decreases_attractiveness') {
      parts.push('This bias is making certain options appear less attractive than they objectively are.');
    } else {
      parts.push('This bias is distorting your perception of the options.');
    }

    return parts.join('. ') + '.';
  }

  /**
   * Generate explanation for specific bias type.
   */
  explainBias(biasType: BiasType): BiasExplanation {
    const explanations: Record<BiasType, BiasExplanation> = {
      lossAversion: {
        biasType: 'lossAversion',
        displayName: 'Loss Aversion',
        description: 'The tendency to prefer avoiding losses over acquiring equivalent gains.',
        manifestation: 'You may be avoiding high-upside career paths because the potential downside feels more significant than it objectively is.',
        impact: 'May cause you to choose safer but lower-potential career paths.',
        mitigation: [
          'Consider both upside and downside equally',
          'Calculate expected value objectively',
          'Ask: "What would I advise a friend?"',
        ],
      },
      statusSeeking: {
        biasType: 'statusSeeking',
        displayName: 'Status Seeking',
        description: 'The preference for careers with high prestige or social standing.',
        manifestation: 'You may be overweighting prestige and social perception in your career choices.',
        impact: 'May lead you to choose careers that look impressive but may not match your true interests.',
        mitigation: [
          'Distinguish between prestige and personal fit',
          'Consider day-to-day reality of the career',
          'Focus on intrinsic motivation factors',
        ],
      },
      socialConformity: {
        biasType: 'socialConformity',
        displayName: 'Social Conformity',
        description: 'The tendency to follow peer preferences and social norms.',
        manifestation: 'Your career preferences may be influenced by what your peers are choosing.',
        impact: 'May lead you to follow the crowd rather than your individual path.',
        mitigation: [
          'Reflect on your unique strengths and interests',
          'Consider paths less traveled by your peer group',
          'Seek diverse perspectives beyond your immediate circle',
        ],
      },
      authorityInfluence: {
        biasType: 'authorityInfluence',
        displayName: 'Authority Influence',
        description: 'Susceptibility to influence from authority figures like parents.',
        manifestation: 'You may be strongly considering careers based on parent or authority figure expectations.',
        impact: 'May lead to choices that please others but don\'t align with your authentic self.',
        mitigation: [
          'Distinguish your goals from others\' expectations',
          'Have explicit conversations about your interests',
          'Consider: "Will I be happy doing this in 10 years?"',
        ],
      },
      riskPerceptionBias: {
        biasType: 'riskPerceptionBias',
        displayName: 'Risk Perception Bias',
        description: 'Gap between actual and perceived risk levels.',
        manifestation: 'You may be overestimating or underestimating the risks of certain career paths.',
        impact: 'May lead to either excessive caution or unwarranted confidence.',
        mitigation: [
          'Gather objective data on career outcomes',
          'Talk to professionals in the field',
          'Consider best-case, worst-case, and most-likely scenarios',
        ],
      },
      optimismBias: {
        biasType: 'optimismBias',
        displayName: 'Optimism Bias',
        description: 'Tendency to overestimate positive outcomes.',
        manifestation: 'You may be expecting career success more readily than objective factors suggest.',
        impact: 'May lead to insufficient preparation for challenges.',
        mitigation: [
          'Research realistic career trajectories',
          'Talk to professionals about challenges they faced',
          'Plan for contingencies and setbacks',
        ],
      },
      sunkCostSensitivity: {
        biasType: 'sunkCostSensitivity',
        displayName: 'Sunk Cost Sensitivity',
        description: 'Tendency to continue a path due to past investment.',
        manifestation: 'You may be considering past time/effort investment in future decisions.',
        impact: 'May lead you to persist in suboptimal paths to justify past investments.',
        mitigation: [
          'Focus on future value, not past investment',
          'Ask: "If starting fresh today, what would I choose?"',
          'Consider switching costs vs. opportunity costs',
        ],
      },
      availabilityBias: {
        biasType: 'availabilityBias',
        displayName: 'Availability Bias',
        description: 'Overweighting readily available information.',
        manifestation: 'You may be influenced by recent or memorable examples more than representative data.',
        impact: 'May skew perception based on anecdotal rather than systematic evidence.',
        mitigation: [
          'Seek out diverse data sources',
          'Look for base rates and statistics',
          'Consider what information might be missing',
        ],
      },
      anchoringBias: {
        biasType: 'anchoringBias',
        displayName: 'Anchoring Bias',
        description: 'Over-reliance on first information received.',
        manifestation: 'Your perceptions may be anchored to initial career information you encountered.',
        impact: 'May prevent updating beliefs with new evidence.',
        mitigation: [
          'Actively seek disconfirming information',
          'Re-evaluate initial impressions periodically',
          'Consider multiple reference points',
        ],
      },
      confirmationBias: {
        biasType: 'confirmationBias',
        displayName: 'Confirmation Bias',
        description: 'Seeking information that confirms existing beliefs.',
        manifestation: 'You may be looking for evidence that supports your current career preferences.',
        impact: 'May prevent consideration of valuable alternatives.',
        mitigation: [
          'Actively seek disconfirming evidence',
          'Play devil\'s advocate for your preferences',
          'Consider evidence that contradicts your views',
        ],
      },
    };

    return explanations[biasType];
  }

  /**
   * Get display name for bias type.
   */
  private getBiasDisplayName(biasType: BiasType): string {
    const names: Record<BiasType, string> = {
      lossAversion: 'Loss Aversion',
      statusSeeking: 'Status Seeking',
      socialConformity: 'Social Conformity',
      authorityInfluence: 'Authority Influence',
      riskPerceptionBias: 'Risk Perception Bias',
      optimismBias: 'Optimism Bias',
      sunkCostSensitivity: 'Sunk Cost Sensitivity',
      availabilityBias: 'Availability Bias',
      anchoringBias: 'Anchoring Bias',
      confirmationBias: 'Confirmation Bias',
    };

    return names[biasType] || biasType;
  }

  /**
   * Describe direction of bias.
   */
  private describeDirection(direction: BiasImpact['direction']): string {
    switch (direction) {
      case 'increases_attractiveness':
        return 'making options appear more attractive';
      case 'decreases_attractiveness':
        return 'making options appear less attractive';
      default:
        return 'distorting perception';
    }
  }

  /**
   * Get recommendations for a specific bias.
   */
  private getBiasRecommendations(biasType: BiasType): string[] {
    const recs: Record<BiasType, string[]> = {
      lossAversion: [
        'Consider both upside and downside equally when evaluating options',
        'Calculate expected value objectively rather than focusing only on potential losses',
      ],
      statusSeeking: [
        'Focus on day-to-day work satisfaction rather than prestige',
        'Consider intrinsic motivation factors over external validation',
      ],
      socialConformity: [
        'Reflect on your unique strengths independent of peer choices',
        'Consider what you would choose if no one else knew your decision',
      ],
      authorityInfluence: [
        'Have explicit conversations with family about your authentic interests',
        'Distinguish your career goals from others\' expectations',
      ],
      riskPerceptionBias: [
        'Gather objective data on career outcomes from multiple sources',
        'Talk to professionals who have succeeded and struggled in the field',
      ],
      optimismBias: [
        'Research realistic career trajectories and timelines',
        'Plan for contingencies and potential setbacks',
      ],
      sunkCostSensitivity: [
        'Ask: "If starting fresh today with no prior investment, what would I choose?"',
        'Focus on future value rather than past investment',
      ],
      availabilityBias: [
        'Seek out systematic data rather than relying on memorable examples',
        'Look for base rates and statistical outcomes',
      ],
      anchoringBias: [
        'Periodically re-evaluate your initial impressions with new information',
        'Consider multiple reference points rather than one anchor',
      ],
      confirmationBias: [
        'Actively seek information that challenges your current preferences',
        'Play devil\'s advocate for your top choices',
      ],
    };

    return recs[biasType] || ['Reflect on how this bias might be influencing your thinking'];
  }

  /**
   * Generate profile explanation.
   */
  generateProfileExplanation(profile: BiasProfile): string[] {
    const parts: string[] = [];

    parts.push(`Overall Bias Level: ${Math.round(profile.overallBias)}%`);

    // Top biases
    const biases = [
      { name: 'Loss Aversion', value: profile.lossAversion },
      { name: 'Status Seeking', value: profile.statusSeeking },
      { name: 'Social Conformity', value: profile.socialConformity },
      { name: 'Authority Influence', value: profile.authorityInfluence },
      { name: 'Optimism Bias', value: profile.optimismBias },
    ].sort((a, b) => b.value - a.value);

    parts.push('Primary biases:');
    for (const bias of biases.slice(0, 3)) {
      parts.push(`  - ${bias.name}: ${Math.round(bias.value)}%`);
    }

    return parts;
  }

  /**
   * Generate signal explanation.
   */
  explainSignal(signal: BiasSignal): string {
    const biasName = this.getBiasDisplayName(signal.biasType);
    return `${biasName} detected from ${signal.source}: ${signal.evidence.description}`;
  }
}

/**
 * Factory function for BiasExplanationEngine.
 */
export function createBiasExplanationEngine(): BiasExplanationEngine {
  return new BiasExplanationEngine();
}
