/**
 * Student Explanation Engine
 *
 * Phase 8.4: Recommendation Stability Engine - Part 8
 *
 * Generates human-readable, warm explanations for students:
 * - Stability explanations
 * - Confidence explanations  
 * - Uncertainty explanations
 * - Volatility explanations
 * - Consensus explanations
 * - Integrated narratives
 *
 * Tone: Mentor-quality, warm, clear, precise, non-generic.
 *
 * @module student-explanation-engine
 * @version 1.0.0
 */

import {
  StabilityResult,
  ConfidenceResult,
  ConsensusResult,
  UncertaintyResult,
  StudentExplanation,
  ExplanationConfig,
  StabilityBand,
  ConfidenceBand,
  UncertaintyBand,
  DEFAULT_EXPLANATION_CONFIG,
} from './recommendation-stability-types';

/**
 * Student Explanation Engine implementation
 */
export class StudentExplanationEngine {
  private config: ExplanationConfig;

  constructor(config: Partial<ExplanationConfig> = {}) {
    this.config = { ...DEFAULT_EXPLANATION_CONFIG, ...config };
  }

  /**
   * Generate complete student-facing explanation
   */
  generateExplanation(
    stability: StabilityResult,
    confidence: ConfidenceResult,
    consensus: ConsensusResult,
    uncertainty: UncertaintyResult,
    primaryCareerTitle: string,
    runnerUpCareerTitle?: string
  ): StudentExplanation {
    const stabilityExplanation = this.generateStabilityExplanation(
      stability,
      primaryCareerTitle,
      runnerUpCareerTitle
    );

    const confidenceExplanation = this.generateConfidenceExplanation(
      confidence,
      primaryCareerTitle
    );

    const uncertaintyExplanation = this.generateUncertaintyExplanation(
      uncertainty,
      primaryCareerTitle,
      runnerUpCareerTitle
    );

    const volatilityExplanation = this.generateVolatilityExplanation(
      stability,
      consensus,
      primaryCareerTitle
    );

    const consensusExplanation = this.generateConsensusExplanation(
      consensus,
      primaryCareerTitle,
      runnerUpCareerTitle
    );

    const integratedNarrative = this.generateIntegratedNarrative(
      stability,
      confidence,
      consensus,
      uncertainty,
      primaryCareerTitle,
      runnerUpCareerTitle
    );

    const keyTakeaways = this.generateKeyTakeaways(
      stability,
      confidence,
      uncertainty,
      primaryCareerTitle,
      runnerUpCareerTitle
    );

    const tone = this.determineTone(stability, confidence, uncertainty);

    return {
      stability: stabilityExplanation,
      confidence: confidenceExplanation,
      uncertainty: uncertaintyExplanation,
      volatility: volatilityExplanation,
      consensus: consensusExplanation,
      integratedNarrative,
      keyTakeaways,
      tone,
      generatedAt: new Date(),
    };
  }

  /**
   * Generate stability explanation
   */
  private generateStabilityExplanation(
    stability: StabilityResult,
    primaryCareer: string,
    runnerUpCareer?: string
  ): { summary: string; detail: string; practicalImplications: string[] } {
    const retentionPercent = Math.round(stability.metrics.primaryRetentionRate * 100);

    const summaries: Record<StabilityBand, string> = {
      ROCK_SOLID: `This is a rock-solid recommendation.`,
      HIGHLY_STABLE: `This is a highly stable recommendation.`,
      STABLE: `This is a stable recommendation with good consistency.`,
      MODERATELY_STABLE: `This recommendation is moderately stable.`,
      UNSTABLE: `This recommendation shows some instability.`,
      HIGHLY_UNSTABLE: `This recommendation is currently unstable.`,
    };

    const summary = summaries[stability.stabilityBand];

    // Generate detail based on stability metrics
    let detail: string;
    
    if (stability.stabilityBand === 'ROCK_SOLID' || stability.stabilityBand === 'HIGHLY_STABLE') {
      detail = `${primaryCareer} emerged as the top recommendation in ${retentionPercent}% of our simulations. `;
      detail += `Even when we varied your profile slightly—simulating natural fluctuations in self-perception—`;
      detail += `this career remained the clear frontrunner. This suggests a strong alignment between your profile and this path.`;
    } else if (stability.stabilityBand === 'STABLE') {
      detail = `${primaryCareer} was the top recommendation in ${retentionPercent}% of simulations. `;
      detail += `While there was some variation in the rankings, this career consistently performed well. `;
      detail += `This stability suggests a genuine fit, though exploring the alternatives could provide valuable perspective.`;
    } else if (stability.stabilityBand === 'MODERATELY_STABLE') {
      detail = `${primaryCareer} appeared as the top recommendation in ${retentionPercent}% of simulations. `;
      detail += `There's meaningful competition from other careers, and your rankings shifted with profile variations. `;
      detail += `This isn't a concern—it simply means multiple paths could suit you well.`;
    } else {
      detail = `${primaryCareer} was the top recommendation in only ${retentionPercent}% of simulations. `;
      detail += `Several careers are competing closely for your top match. `;
      detail += `This is actually exciting—it means you have genuine options to explore before committing.`;
    }

    // Generate practical implications
    const practicalImplications: string[] = [];

    if (stability.metrics.primaryRetentionRate >= 0.85) {
      practicalImplications.push('You can feel confident exploring this path in depth');
      practicalImplications.push('Focus your research and networking on this specific career');
      practicalImplications.push('Small changes in your self-perception are unlikely to change this recommendation');
    } else if (stability.metrics.primaryRetentionRate >= 0.60) {
      practicalImplications.push('This is a strong direction worth serious exploration');
      practicalImplications.push('Keep an open mind about the alternative careers that also performed well');
      practicalImplications.push('As you learn more about yourself, this recommendation should stabilize further');
    } else {
      practicalImplications.push('Explore multiple top careers before committing');
      practicalImplications.push('Use this as a starting point for discovery, not a final decision');
      practicalImplications.push('Completing more assessment questions may help clarify your direction');
      if (runnerUpCareer) {
        practicalImplications.push(`Pay particular attention to ${runnerUpCareer} as a strong alternative`);
      }
    }

    return { summary, detail, practicalImplications };
  }

  /**
   * Generate confidence explanation
   */
  private generateConfidenceExplanation(
    confidence: ConfidenceResult,
    primaryCareer: string
  ): { summary: string; detail: string; supportingEvidence: string[]; caveats: string[] } {
    const summaries: Record<ConfidenceBand, string> = {
      VERY_HIGH: `We have very high confidence in this recommendation.`,
      HIGH: `We have high confidence in this recommendation.`,
      MODERATE: `We have moderate confidence in this recommendation.`,
      LOW: `We have limited confidence in this recommendation.`,
      VERY_LOW: `Confidence in this recommendation is currently low.`,
    };

    const summary = summaries[confidence.confidenceBand];

    // Generate detail
    let detail: string;
    
    if (confidence.confidenceBand === 'VERY_HIGH' || confidence.confidenceBand === 'HIGH') {
      detail = `Our confidence in recommending ${primaryCareer} is ${confidence.confidenceScore}%. `;
      detail += `This confidence comes from multiple factors: your profile shows clear patterns, `;
      detail += `the assessment data is comprehensive, and there's strong consistency across our analysis.`;
    } else if (confidence.confidenceBand === 'MODERATE') {
      detail = `We have ${confidence.confidenceScore}% confidence in recommending ${primaryCareer}. `;
      detail += `While the recommendation is solid, there are some areas where we could be more certain. `;
      detail += `This is typical for profiles at your stage of exploration.`;
    } else {
      detail = `Our confidence in this recommendation is ${confidence.confidenceScore}%. `;
      detail += `This doesn't mean the recommendation is wrong—it simply means there's more to discover `;
      detail += `about your preferences and strengths before we can be fully confident.`;
    }

    // Supporting evidence
    const supportingEvidence: string[] = [];
    for (const factor of confidence.supportingFactors.slice(0, 3)) {
      supportingEvidence.push(factor);
    }

    // Caveats
    const caveats: string[] = [];
    for (const factor of confidence.reducingFactors.slice(0, 2)) {
      caveats.push(factor);
    }

    if (caveats.length === 0) {
      caveats.push('No significant caveats identified');
    }

    return { summary, detail, supportingEvidence, caveats };
  }

  /**
   * Generate uncertainty explanation
   */
  private generateUncertaintyExplanation(
    uncertainty: UncertaintyResult,
    primaryCareer: string,
    runnerUpCareer?: string
  ): { summary: string; detail: string; whatThisMeans: string; whatToDo: string[] } {
    const summaries: Record<UncertaintyBand, string> = {
      MINIMAL: `There's minimal uncertainty about this recommendation.`,
      LOW: `There's low uncertainty about this recommendation.`,
      MODERATE: `There's moderate uncertainty to consider.`,
      HIGH: `There's significant uncertainty in this recommendation.`,
      VERY_HIGH: `There's considerable uncertainty at this stage.`,
    };

    const summary = summaries[uncertainty.uncertaintyBand];

    // Generate detail
    let detail: string;
    
    if (uncertainty.uncertaintyBand === 'MINIMAL' || uncertainty.uncertaintyBand === 'LOW') {
      detail = `The uncertainty in this recommendation is low (${uncertainty.uncertaintyScore}%). `;
      detail += `Your profile provides clear signals, and the assessment data is robust. `;
      detail += `While no career prediction is ever 100% certain, this recommendation is on solid ground.`;
    } else if (uncertainty.uncertaintyBand === 'MODERATE') {
      detail = `There's moderate uncertainty (${uncertainty.uncertaintyScore}%) in this recommendation. `;
      detail += `This is completely normal—it means we're working with good but not perfect information. `;
      detail += `The recommendation is still valuable, but should be treated as a strong hypothesis rather than certainty.`;
    } else {
      detail = `There's notable uncertainty (${uncertainty.uncertaintyScore}%) in this recommendation. `;
      detail += `This isn't a problem—it's an invitation to explore further. `;
      detail += `Your profile has interesting complexity that makes multiple paths viable.`;
    }

    // What this means
    let whatThisMeans: string;
    if (uncertainty.uncertaintyBand === 'MINIMAL' || uncertainty.uncertaintyBand === 'LOW') {
      whatThisMeans = `You can move forward with confidence. This recommendation is well-supported by your profile.`;
    } else if (uncertainty.uncertaintyBand === 'MODERATE') {
      whatThisMeans = `Use this recommendation as a strong starting point, but remain curious and open to discovery as you explore further.`;
    } else {
      whatThisMeans = `Think of this as an exploration phase. You're discovering what resonates, and clarity will come with experience.`;
    }

    // What to do
    const whatToDo: string[] = [];
    
    if (uncertainty.reducible && uncertainty.reductionStrategies.length > 0) {
      whatToDo.push(...uncertainty.reductionStrategies.slice(0, 3));
    } else {
      whatToDo.push('Explore multiple top-matching careers through conversations and research');
    }

    whatToDo.push('Trust the process—clarity often comes from action, not just analysis');

    if (runnerUpCareer) {
      whatToDo.push(`Keep ${runnerUpCareer} in mind as a viable alternative path`);
    }

    return { summary, detail, whatThisMeans, whatToDo };
  }

  /**
   * Generate volatility explanation
   */
  private generateVolatilityExplanation(
    stability: StabilityResult,
    consensus: ConsensusResult,
    primaryCareer: string
  ): { summary: string; detail: string; alternativeScenarios: string[] } {
    const volatilityScore = 100 - stability.stabilityScore;
    
    let summary: string;
    if (volatilityScore < 20) {
      summary = `Your recommendations are very consistent.`;
    } else if (volatilityScore < 40) {
      summary = `Your recommendations show some natural variation.`;
    } else if (volatilityScore < 60) {
      summary = `Your recommendations vary meaningfully with different interpretations.`;
    } else {
      summary = `Your recommendations are quite sensitive to how you see yourself.`;
    }

    // Generate detail
    let detail: string;
    if (volatilityScore < 30) {
      detail = `Across hundreds of simulations with slight variations in your profile, `;
      detail += `${primaryCareer} consistently emerged as a top recommendation. `;
      detail += `This consistency suggests a genuine alignment with your core traits.`;
    } else if (volatilityScore < 50) {
      detail = `When we explored slight variations in your profile, we saw some shifts in rankings. `;
      detail += `This is natural—it reflects the complexity of career fit. `;
      detail += `${primaryCareer} remained strong overall, but other careers also showed promise.`;
    } else {
      detail = `Your recommendations showed notable variation across simulations. `;
      detail += `This suggests that small changes in how you see yourself—your confidence in certain skills, `;
      detail += `your prioritization of values—can shift which careers seem most aligned. `;
      detail += `This is valuable insight: it means you have genuine flexibility in your path.`;
    }

    // Alternative scenarios
    const alternativeScenarios: string[] = [];
    
    if (consensus.runnerUpRecommendation) {
      alternativeScenarios.push(
        `If you discover that ${consensus.runnerUpRecommendation.careerId} aspects of work matter more to you, ` +
        `${consensus.runnerUpRecommendation.careerId} could become your top match.`
      );
    }

    if (volatilityScore > 40) {
      alternativeScenarios.push(
        'If your priorities shift between creativity and stability, your top recommendation may change'
      );
    }

    alternativeScenarios.push(
      `As you gain real-world experience, your understanding of ${primaryCareer} will deepen, ` +
      `potentially strengthening or shifting this recommendation`
    );

    return { summary, detail, alternativeScenarios };
  }

  /**
   * Generate consensus explanation
   */
  private generateConsensusExplanation(
    consensus: ConsensusResult,
    primaryCareer: string,
    runnerUpCareer?: string
  ): { summary: string; detail: string; runnerUpInfo: string } {
    const consensusPercent = Math.round(consensus.primaryRecommendation.consensusPercentage * 100);
    
    let summary: string;
    if (consensusPercent >= 85) {
      summary = `There's very strong consensus for ${primaryCareer}.`;
    } else if (consensusPercent >= 65) {
      summary = `There's strong consensus for ${primaryCareer}.`;
    } else if (consensusPercent >= 45) {
      summary = `There's moderate consensus, with ${primaryCareer} leading.`;
    } else {
      summary = `There's split consensus among several promising careers.`;
    }

    // Generate detail
    let detail: string;
    if (consensusPercent >= 70) {
      detail = `Across all our simulations, ${primaryCareer} emerged as the top choice ${consensusPercent}% of the time. `;
      detail += `This strong consensus means that even when we account for natural uncertainty in self-assessment, `;
      detail += `this career remains the most aligned with your profile.`;
    } else if (consensusPercent >= 50) {
      detail = `${primaryCareer} was the top recommendation in ${consensusPercent}% of simulations. `;
      detail += `While this is a solid lead, there's meaningful competition from other careers. `;
      detail += `This suggests ${primaryCareer} is likely a good fit, but not the only possible fit.`;
    } else {
      detail = `${primaryCareer} was the top recommendation in ${consensusPercent}% of simulations. `;
      detail += `The field is more open, with several careers showing strong potential. `;
      detail += `This diversity of strong options is a good problem to have.`;
    }

    // Runner-up info
    let runnerUpInfo: string;
    if (consensus.runnerUpRecommendation && runnerUpCareer) {
      const runnerUpPercent = Math.round(consensus.runnerUpRecommendation.consensusPercentage * 100);
      const gap = Math.round(consensus.runnerUpRecommendation.gapToPrimary * 100);
      
      runnerUpInfo = `${runnerUpCareer} was the runner-up, appearing as top recommendation `;
      runnerUpInfo += `${runnerUpPercent}% of the time—just ${gap} percentage points behind. `;
      runnerUpInfo += `This makes it worth serious consideration alongside ${primaryCareer}.`;
    } else {
      runnerUpInfo = 'No clear runner-up emerged, suggesting multiple viable paths forward.';
    }

    return { summary, detail, runnerUpInfo };
  }

  /**
   * Generate integrated narrative
   */
  private generateIntegratedNarrative(
    stability: StabilityResult,
    confidence: ConfidenceResult,
    consensus: ConsensusResult,
    uncertainty: UncertaintyResult,
    primaryCareer: string,
    runnerUpCareer?: string
  ): string {
    const parts: string[] = [];

    // Opening based on overall picture
    if (stability.stabilityBand === 'ROCK_SOLID' || stability.stabilityBand === 'HIGHLY_STABLE') {
      parts.push(`${primaryCareer} stands out as a remarkably consistent recommendation for you.`);
    } else if (stability.stabilityBand === 'STABLE') {
      parts.push(`${primaryCareer} emerges as a strong, stable recommendation.`);
    } else {
      parts.push(`${primaryCareer} is your current top recommendation, though the landscape is still evolving.`);
    }

    // Add confidence context
    if (confidence.confidenceBand === 'HIGH' || confidence.confidenceBand === 'VERY_HIGH') {
      parts.push(`We have high confidence in this match because your profile shows clear, consistent patterns.`);
    } else if (confidence.confidenceBand === 'MODERATE') {
      parts.push(`We have moderate confidence based on your current profile, with room for clarity as you explore further.`);
    }

    // Add consensus context
    const consensusPercent = Math.round(consensus.primaryRecommendation.consensusPercentage * 100);
    if (consensusPercent >= 70) {
      parts.push(`This career was the top choice in ${consensusPercent}% of our analysis scenarios, showing strong alignment.`);
    } else if (consensusPercent >= 50) {
      parts.push(`This career led in ${consensusPercent}% of scenarios, with other options also showing promise.`);
    }

    // Add uncertainty/what to do
    if (uncertainty.uncertaintyBand === 'LOW' || uncertainty.uncertaintyBand === 'MINIMAL') {
      parts.push(`The path forward is clear: explore ${primaryCareer} with confidence.`);
    } else if (uncertainty.uncertaintyBand === 'MODERATE') {
      parts.push(`Use this as your starting point, but stay open to discovery as you learn more.`);
      if (runnerUpCareer) {
        parts.push(`${runnerUpCareer} is also worth exploring as a strong alternative.`);
      }
    } else {
      parts.push(`Take time to explore multiple paths before committing—that's where the clarity will come from.`);
    }

    // Closing based on stability forecast
    if (stability.forecast.likelihoodOfStability > 0.7) {
      parts.push(`As you gain more experience and self-knowledge, this recommendation is likely to strengthen.`);
    }

    return parts.join(' ');
  }

  /**
   * Generate key takeaways
   */
  private generateKeyTakeaways(
    stability: StabilityResult,
    confidence: ConfidenceResult,
    uncertainty: UncertaintyResult,
    primaryCareer: string,
    runnerUpCareer?: string
  ): string[] {
    const takeaways: string[] = [];

    // Primary recommendation takeaway
    takeaways.push(`${primaryCareer} is your strongest career match based on your profile.`);

    // Stability takeaway
    if (stability.metrics.primaryRetentionRate >= 0.80) {
      takeaways.push('This recommendation is very stable across different interpretations of your profile.');
    } else if (stability.metrics.primaryRetentionRate >= 0.50) {
      takeaways.push('This is a solid direction, though other careers also show strong potential.');
    } else {
      takeaways.push('Multiple career paths align well with your profile—exploration is valuable.');
    }

    // Confidence takeaway
    if (confidence.confidenceBand === 'HIGH' || confidence.confidenceBand === 'VERY_HIGH') {
      takeaways.push('High confidence means you can pursue this direction with conviction.');
    } else {
      takeaways.push('Moderate confidence suggests this is a strong hypothesis worth testing through exploration.');
    }

    // Action-oriented takeaway
    if (uncertainty.reducible) {
      takeaways.push('You can increase confidence by completing more assessment questions.');
    }

    if (runnerUpCareer && stability.metrics.primaryRetentionRate < 0.75) {
      takeaways.push(`${runnerUpCareer} is also a strong contender worth exploring.`);
    }

    // General takeaway
    takeaways.push('Remember: recommendations are starting points for exploration, not final decisions.');

    return takeaways.slice(0, 5);
  }

  /**
   * Determine overall tone
   */
  private determineTone(
    stability: StabilityResult,
    confidence: ConfidenceResult,
    uncertainty: UncertaintyResult
  ): 'REASSURING' | 'CAUTIOUS' | 'ENCOURAGING' | 'NEUTRAL' {
    if (stability.stabilityBand === 'ROCK_SOLID' && confidence.confidenceBand === 'VERY_HIGH') {
      return 'REASSURING';
    }
    
    if (uncertainty.uncertaintyBand === 'HIGH' || uncertainty.uncertaintyBand === 'VERY_HIGH') {
      return 'CAUTIOUS';
    }
    
    if (stability.stabilityBand === 'UNSTABLE' || stability.stabilityBand === 'HIGHLY_UNSTABLE') {
      return 'ENCOURAGING';
    }
    
    return 'NEUTRAL';
  }

  /**
   * Generate brief summary for quick display
   */
  generateBriefSummary(
    stability: StabilityResult,
    confidence: ConfidenceResult,
    primaryCareer: string
  ): string {
    const stabilityWord = this.bandToAdjective(stability.stabilityBand);
    const confidenceWord = this.confidenceToAdjective(confidence.confidenceBand);
    
    return `${primaryCareer} is a ${stabilityWord}, ${confidenceWord} recommendation based on your profile.`;
  }

  /**
   * Convert stability band to adjective
   */
  private bandToAdjective(band: StabilityBand): string {
    const adjectives: Record<StabilityBand, string> = {
      ROCK_SOLID: 'rock-solid',
      HIGHLY_STABLE: 'highly stable',
      STABLE: 'stable',
      MODERATELY_STABLE: 'moderately stable',
      UNSTABLE: 'developing',
      HIGHLY_UNSTABLE: 'exploratory',
    };
    return adjectives[band];
  }

  /**
   * Convert confidence band to adjective
   */
  private confidenceToAdjective(band: ConfidenceBand): string {
    const adjectives: Record<ConfidenceBand, string> = {
      VERY_HIGH: 'very high-confidence',
      HIGH: 'high-confidence',
      MODERATE: 'moderate-confidence',
      LOW: 'preliminary',
      VERY_LOW: 'exploratory',
    };
    return adjectives[band];
  }

  /**
   * Generate mentor-style response snippet
   */
  generateMentorSnippet(
    stability: StabilityResult,
    confidence: ConfidenceResult,
    primaryCareer: string,
    context: 'intro' | 'reassurance' | 'caution' | 'next-steps'
  ): string {
    switch (context) {
      case 'intro':
        return this.generateBriefSummary(stability, confidence, primaryCareer);
      
      case 'reassurance':
        if (stability.metrics.primaryRetentionRate >= 0.80) {
          return `I want to reassure you that ${primaryCareer} is a consistently strong match. ` +
                 `Even when we account for natural variations in how you might see yourself, ` +
                 `this career remains the top recommendation.`;
        }
        return `While ${primaryCareer} is your top match right now, remember that career discovery ` +
               `is a journey. Stay open to learning more about yourself as you explore.`;
      
      case 'caution':
        if (confidence.confidenceBand === 'LOW' || confidence.confidenceBand === 'VERY_LOW') {
          return `I want to be transparent: we have limited confidence in this specific recommendation ` +
                 `at this stage. This isn't a problem—it just means there's more to discover about ` +
                 `what truly matters to you.`;
        }
        return `This recommendation is on solid ground, but I always encourage students to verify ` +
               `career fit through real-world exploration, not just assessments.`;
      
      case 'next-steps':
        if (stability.metrics.primaryRetentionRate >= 0.80) {
          return `Your next step is clear: dive deeper into ${primaryCareer}. ` +
                 `Talk to people in this field, try a small project, and see how it resonates.`;
        }
        return `Your next step is to explore the top few careers that emerged, including ${primaryCareer}. ` +
               `Through conversations and small experiments, you'll discover what truly fits.`;
    }
  }
}

/**
 * Factory function for creating student explanation engine
 */
export function createStudentExplanationEngine(
  config?: Partial<ExplanationConfig>
): StudentExplanationEngine {
  return new StudentExplanationEngine(config);
}

/**
 * Generate quick explanation with default settings
 */
export function generateQuickExplanation(
  stability: StabilityResult,
  confidence: ConfidenceResult,
  consensus: ConsensusResult,
  uncertainty: UncertaintyResult,
  primaryCareer: string,
  runnerUpCareer?: string
): StudentExplanation {
  const engine = new StudentExplanationEngine();
  return engine.generateExplanation(
    stability,
    confidence,
    consensus,
    uncertainty,
    primaryCareer,
    runnerUpCareer
  );
}

/**
 * Generate stability-focused summary
 */
export function generateStabilitySummary(
  stability: StabilityResult,
  primaryCareer: string
): string {
  const retention = Math.round(stability.metrics.primaryRetentionRate * 100);
  
  if (retention >= 85) {
    return `${primaryCareer} remained the top recommendation in ${retention}% of simulations. This is a very stable match.`;
  } else if (retention >= 65) {
    return `${primaryCareer} was the top recommendation in ${retention}% of simulations, showing solid stability.`;
  } else if (retention >= 45) {
    return `${primaryCareer} led in ${retention}% of simulations, with meaningful competition from alternatives.`;
  } else {
    return `${primaryCareer} was the top recommendation in ${retention}% of simulations. Multiple careers show strong potential.`;
  }
}
