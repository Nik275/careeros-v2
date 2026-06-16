/**
 * CareerOS Meta-Decision Intelligence Engine - Main Engine
 *
 * Evaluates the quality of decisions themselves.
 * Determines whether to decide now, delay, gather information, explore, or commit.
 *
 * @deprecated This engine has been migrated to the Constitutional Decision Authority.
 * Use DecisionAuthority.analyzeMetaDecision() instead.
 *
 * This class now serves as a compatibility layer that delegates to the Decision Authority.
 */

import { DecisionReadinessEngine } from './DecisionReadinessEngine';
import { DecisionQualityEngine } from './DecisionQualityEngine';
import { DecisionTimingEngine } from './DecisionTimingEngine';
import { CommitmentReadinessEngine } from './CommitmentReadinessEngine';
import { DecisionFragilityEngine } from './DecisionFragilityEngine';
import { DecisionRobustnessEngine } from './DecisionRobustnessEngine';
import { MetaDecisionNarrativeEngine } from './MetaDecisionNarrativeEngine';

import type {
  MetaDecisionAnalysis,
  MetaDecisionInput,
  MetaDecisionConfig,
} from './types';
import { DEFAULT_META_DECISION_CONFIG, DecisionState } from './types';

// Wave 2.3 - Import Decision Authority for delegation
import type { IDecisionAuthority } from '../decision/IDecisionAuthority';
import { createDecisionAuthority } from '../decision/DecisionAuthority';
import type {
  MetaDecisionAnalysis as AuthorityMetaDecisionAnalysis,
  MetaDecisionInput as AuthorityMetaDecisionInput,
} from '../decision/meta/MetaDecisionAuthority';

/**
 * Main Meta-Decision Engine.
 * 
 * @deprecated Use DecisionAuthority.analyzeMetaDecision() instead.
 * This class now delegates to the Decision Authority.
 */
export class MetaDecisionEngine {
  private config: MetaDecisionConfig;

  // Sub-engines (retained for backward compatibility during transition)
  private readinessEngine: DecisionReadinessEngine;
  private qualityEngine: DecisionQualityEngine;
  private timingEngine: DecisionTimingEngine;
  private commitmentEngine: CommitmentReadinessEngine;
  private fragilityEngine: DecisionFragilityEngine;
  private robustnessEngine: DecisionRobustnessEngine;
  private narrativeEngine: MetaDecisionNarrativeEngine;

  // Wave 2.3 - Decision Authority for delegation
  private authority: IDecisionAuthority;

  constructor(config: Partial<MetaDecisionConfig> = {}) {
    this.config = { ...DEFAULT_META_DECISION_CONFIG, ...config };

    // Initialize sub-engines (for fallback during transition)
    this.readinessEngine = new DecisionReadinessEngine(this.config);
    this.qualityEngine = new DecisionQualityEngine(this.config);
    this.timingEngine = new DecisionTimingEngine(this.config);
    this.commitmentEngine = new CommitmentReadinessEngine(this.config);
    this.fragilityEngine = new DecisionFragilityEngine(this.config);
    this.robustnessEngine = new DecisionRobustnessEngine(this.config);
    this.narrativeEngine = new MetaDecisionNarrativeEngine();

    // Wave 2.3 - Initialize Decision Authority
    this.authority = createDecisionAuthority();
  }

  /**
   * Main entry point: analyze decision quality.
   *
   * @deprecated Use DecisionAuthority.analyzeMetaDecision() instead.
   * This method now delegates to the Decision Authority.
   */
  async analyze(input: MetaDecisionInput): Promise<MetaDecisionAnalysis> {
    // Wave 2.3 - Delegate to Decision Authority
    console.warn(
      '[DEPRECATED] MetaDecisionEngine.analyze() is deprecated. ' +
      'Use DecisionAuthority.analyzeMetaDecision() instead.'
    );

    try {
      const result = await this.authority.analyzeMetaDecision(
        this.toAuthorityInput(input)
      );
      return this.fromAuthorityAnalysis(result);
    } catch {
      // Fallback to legacy implementation during transition
      console.warn('Decision Authority delegation failed safely; falling back to legacy implementation.');
      return this.analyzeLegacy(input);
    }
  }

  /**
   * Legacy implementation for fallback during transition.
   * @deprecated Will be removed in Wave 2.4.
   */
  private analyzeLegacy(input: MetaDecisionInput): MetaDecisionAnalysis {
    // Apply custom config if provided
    if (input.config) {
      this.config = { ...this.config, ...input.config };
    }

    // Run sub-analyses
    const readiness = this.readinessEngine.analyze(input);
    const quality = this.qualityEngine.analyze(input);
    const timing = this.timingEngine.analyze(
      input,
      readiness.state,
      quality.overallQuality
    );
    const commitment = this.commitmentEngine.analyze(
      input,
      readiness.state,
      quality.overallQuality
    );
    const fragility = this.fragilityEngine.analyze(
      input,
      input.decisionIntelligence.recommendation
    );
    const robustness = this.robustnessEngine.analyze(
      input,
      input.decisionIntelligence.recommendation
    );

    // Determine recommended action
    const recommendedAction = this.determineRecommendedAction(
      timing.recommendation,
      readiness,
      quality,
      commitment,
      fragility,
      robustness
    );

    // Calculate overall confidence
    const overallConfidence = this.calculateOverallConfidence(
      readiness.confidence,
      quality.components.uncertainty,
      fragility.fragilityScore
    );

    // Build analysis object
    const analysis: Omit<MetaDecisionAnalysis, 'id' | 'timestamp' | 'narrative'> = {
      studentId: input.studentId,
      decisionId: input.decisionId,
      context: this.normalizeInputContext(input.context),
      readiness,
      quality,
      timing,
      commitment,
      fragility,
      robustness,
      recommendedAction,
      overallConfidence,
    };

    // Generate narrative
    const fullAnalysis: MetaDecisionAnalysis = {
      id: this.generateId(),
      timestamp: Date.now(),
      ...analysis,
      narrative: {
        summary: '',
        qualityExplanation: [],
        readinessExplanation: [],
        recommendationExplanation: [],
      },
    };

    fullAnalysis.narrative = this.narrativeEngine.generateNarrative(fullAnalysis);

    return fullAnalysis;
  }

  /**
   * Determine recommended next action.
   */
  private determineRecommendedAction(
    timingRecommendation: MetaDecisionAnalysis['timing']['recommendation'],
    readiness: MetaDecisionAnalysis['readiness'],
    quality: MetaDecisionAnalysis['quality'],
    commitment: MetaDecisionAnalysis['commitment'],
    fragility: MetaDecisionAnalysis['fragility'],
    robustness: MetaDecisionAnalysis['robustness']
  ): MetaDecisionAnalysis['recommendedAction'] {
    // Determine priority
    let priority: MetaDecisionAnalysis['recommendedAction']['priority'] = 'medium';

    if (fragility.fragilityScore >= 70 || quality.qualityLevel === 'very_low') {
      priority = 'critical';
    } else if (fragility.fragilityScore >= 50 || quality.qualityLevel === 'low') {
      priority = 'high';
    } else if (
      readiness.state === 'READY' ||
      readiness.state === 'HIGH_CONFIDENCE_READY'
    ) {
      priority = 'high';
    }

    // Generate reasoning
    const reasoning: string[] = [];

    reasoning.push(`Decision state: ${readiness.state.replace(/_/g, ' ').toLowerCase()}`);
    reasoning.push(`Quality level: ${quality.qualityLevel.replace('_', ' ')}`);

    if (fragility.fragilityScore >= 60) {
      reasoning.push(`High fragility (${fragility.fragilityScore}%) requires attention`);
    }

    if (!commitment.isAppropriate) {
      reasoning.push('Commitment prerequisites not yet met');
    }

    // Generate steps
    const steps = this.generateSteps(
      timingRecommendation,
      readiness,
      quality,
      fragility
    );

    return {
      action: timingRecommendation,
      priority,
      reasoning,
      steps,
    };
  }

  /**
   * Generate recommended steps.
   */
  private generateSteps(
    timingRecommendation: MetaDecisionAnalysis['timing']['recommendation'],
    readiness: MetaDecisionAnalysis['readiness'],
    quality: MetaDecisionAnalysis['quality'],
    fragility: MetaDecisionAnalysis['fragility']
  ): string[] {
    const steps: string[] = [];

    // Based on timing recommendation
    switch (timingRecommendation) {
      case 'decide_now':
        steps.push('Review final decision with trusted advisor');
        steps.push('Document reasoning for future reference');
        steps.push('Prepare action plan for chosen path');
        break;

      case 'delay':
        steps.push('Set specific date for decision');
        steps.push('Identify key information still needed');
        steps.push('Use delay period productively for research');
        break;

      case 'explore':
        steps.push('Research 3-5 additional career options');
        steps.push('Conduct informational interviews');
        steps.push('Broaden understanding of available paths');
        break;

      case 'experiment':
        steps.push('Design small experiments to test preferences');
        steps.push('Shadow professionals in target careers');
        steps.push('Take relevant courses or projects');
        break;

      case 'gather_evidence':
        steps.push('Identify specific knowledge gaps');
        steps.push('Research market data and outcomes');
        steps.push('Collect more evidence on personal fit');
        break;
    }

    // Add improvement steps based on weaknesses
    if (quality.components.informationQuality < 60) {
      steps.push('Improve information quality through research');
    }

    if (fragility.fragilityScore >= 60) {
      steps.push('Reduce fragility by addressing key uncertainties');
    }

    if (readiness.components.identityStability < 50) {
      steps.push('Work on self-discovery and identity development');
    }

    return steps.slice(0, 5);
  }

  /**
   * Calculate overall confidence.
   */
  private calculateOverallConfidence(
    readinessConfidence: number,
    uncertainty: number,
    fragility: number
  ): number {
    // Weighted average
    return Math.round(
      readinessConfidence * 0.4 +
        (100 - uncertainty) * 0.3 +
        (100 - fragility) * 0.3
    );
  }

  /**
   * Check if decision should be made now.
   *
   * @deprecated Use DecisionAuthority.shouldDecideNow() instead.
   */
  shouldDecideNow(analysis: MetaDecisionAnalysis): boolean {
    console.warn(
      '[DEPRECATED] MetaDecisionEngine.shouldDecideNow() is deprecated. ' +
      'Use DecisionAuthority.shouldDecideNow() instead.'
    );
    return (
      (analysis.readiness.state === 'READY' ||
        analysis.readiness.state === 'HIGH_CONFIDENCE_READY') &&
      analysis.quality.overallQuality >= 60
    );
  }

  /**
   * Check if student should delay decision.
   *
   * @deprecated Use DecisionAuthority.shouldDelayDecision() instead.
   */
  shouldDelay(analysis: MetaDecisionAnalysis): boolean {
    console.warn(
      '[DEPRECATED] MetaDecisionEngine.shouldDelay() is deprecated. ' +
      'Use DecisionAuthority.shouldDelayDecision() instead.'
    );
    return (
      analysis.readiness.state === 'NOT_READY' ||
      analysis.readiness.state === 'EXPLORING' ||
      analysis.quality.overallQuality < 50
    );
  }

  /**
   * Check if student should gather more information.
   *
   * @deprecated Use analysis.recommendedAction.action === 'gather_evidence' instead.
   */
  shouldGatherInformation(analysis: MetaDecisionAnalysis): boolean {
    console.warn(
      '[DEPRECATED] MetaDecisionEngine.shouldGatherInformation() is deprecated. ' +
      'Use analysis.recommendedAction.action === "gather_evidence" instead.'
    );
    return (
      analysis.fragility.keyUncertainties.length > 2 ||
      analysis.quality.components.uncertainty >= 50 ||
      analysis.readiness.uncertaintyLevel >= 50
    );
  }

  /**
   * Check if student should explore alternatives.
   *
   * @deprecated Use analysis.recommendedAction.action === 'explore' instead.
   */
  shouldExploreAlternatives(analysis: MetaDecisionAnalysis): boolean {
    console.warn(
      '[DEPRECATED] MetaDecisionEngine.shouldExploreAlternatives() is deprecated. ' +
      'Use analysis.recommendedAction.action === "explore" instead.'
    );
    return (
      analysis.readiness.components.informationCompleteness < 50 ||
      analysis.context.careerOptions.length < 3
    );
  }

  /**
   * Check if commitment is appropriate.
   *
   * @deprecated Use analysis.commitment.isAppropriate instead.
   */
  isCommitmentAppropriate(analysis: MetaDecisionAnalysis): boolean {
    console.warn(
      '[DEPRECATED] MetaDecisionEngine.isCommitmentAppropriate() is deprecated. ' +
      'Use analysis.commitment.isAppropriate instead.'
    );
    return analysis.commitment.isAppropriate;
  }

  /**
   * Generate unique ID.
   */
  private generateId(): string {
    return `meta-decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private toAuthorityInput(input: MetaDecisionInput): AuthorityMetaDecisionInput {
    return {
      studentId: input.studentId,
      decisionId: input.decisionId,
      context: input.context
        ? {
            studentId: input.studentId,
            sessionId: `meta-${input.decisionId}`,
            timestamp: new Date(),
            ...input.context,
          }
        : undefined,
      studentBeliefs: input.studentBeliefs,
      utilityConfidence: input.utilityConfidence,
      uncertainty: input.uncertainty,
      biasProfile: input.biasProfile,
      informationCompleteness: input.informationCompleteness,
      decisionIntelligence: {
        ...input.decisionIntelligence,
        confidence: this.toConfidence(input.decisionIntelligence.confidence),
      },
    };
  }

  private fromAuthorityAnalysis(
    analysis: AuthorityMetaDecisionAnalysis
  ): MetaDecisionAnalysis {
    return {
      id: analysis.id,
      timestamp: analysis.timestamp,
      studentId: analysis.studentId,
      decisionId: analysis.decisionId,
      context: {
        careerOptions: this.getCareerOptions(analysis),
        decisionType: this.getDecisionType(analysis),
        timePressure: this.getTimePressure(analysis),
      },
      readiness: {
        ...analysis.readiness,
        state: this.toLocalDecisionState(analysis.readiness.state),
        confidence: this.fromConfidence(analysis.readiness.confidence),
      },
      quality: {
        overallQuality: analysis.quality.overallQuality,
        qualityLevel: analysis.quality.qualityLevel,
        components: analysis.quality.components,
        informationQuality: {
          relevance: analysis.quality.components.informationQuality,
          completeness: analysis.quality.components.informationQuality,
          accuracy: analysis.quality.components.informationQuality,
          timeliness: analysis.quality.components.informationQuality,
        },
        reasoningQuality: {
          logicalConsistency: analysis.quality.components.reasoningQuality,
          evidenceAlignment: analysis.quality.components.reasoningQuality,
          alternativesConsidered: analysis.quality.components.reasoningQuality,
          tradeoffsEvaluated: analysis.quality.components.reasoningQuality,
        },
        evidenceQuality: {
          sourceReliability: analysis.quality.components.evidenceQuality,
          sampleSize: analysis.quality.components.evidenceQuality,
          recency: analysis.quality.components.evidenceQuality,
          diversity: analysis.quality.components.evidenceQuality,
        },
        explanation: analysis.quality.explanation,
      },
      timing: {
        ...analysis.timing,
        confidence: this.fromConfidence(analysis.timing.confidence),
        supportingFactors: {
          decideNow: [],
          delay: [],
          explore: [],
          experiment: [],
          gatherEvidence: [],
        },
      },
      commitment: {
        ...analysis.commitment,
        confidence: this.fromConfidence(analysis.commitment.confidence),
        risks: {
          reversalCost: 0,
          regretProbability: 0,
          opportunityCost: 0,
        },
        prerequisites: [],
      },
      fragility: {
        ...analysis.fragility,
        informationSensitivity: {
          score: analysis.fragility.fragilityScore,
          highImpactAreas: analysis.fragility.keyUncertainties.map(
            (uncertainty) => uncertainty.factor
          ),
        },
        valueSensitivity: {
          score: 0,
          unstableValues: [],
        },
        marketSensitivity: {
          score: 0,
          vulnerableAreas: [],
        },
      },
      robustness: {
        ...analysis.robustness,
        scenarioResults: [],
        crossScenarioStability: {
          consistency: analysis.robustness.robustnessScore,
          bestCaseOutcome: analysis.robustness.robustnessScore,
          worstCaseOutcome: analysis.robustness.robustnessScore,
          expectedOutcome: analysis.robustness.robustnessScore,
        },
        stressTests: [],
      },
      recommendedAction: analysis.recommendedAction,
      narrative: analysis.narrative,
      overallConfidence: this.fromConfidence(analysis.overallConfidence),
    };
  }

  private toConfidence(value: number): number {
    return value > 1 ? Math.max(0, Math.min(1, value / 100)) : value;
  }

  private fromConfidence(value: number): number {
    return value <= 1 ? Math.round(value * 100) : value;
  }

  private getCareerOptions(analysis: AuthorityMetaDecisionAnalysis): string[] {
    const options = analysis.context.careerOptions;
    return Array.isArray(options)
      ? options.filter((option): option is string => typeof option === 'string')
      : [];
  }

  private normalizeInputContext(
    context: MetaDecisionInput['context']
  ): MetaDecisionAnalysis['context'] {
    return {
      careerOptions: context?.careerOptions ?? [],
      decisionType: context?.decisionType ?? 'initial',
      timePressure: context?.timePressure ?? 'none',
    };
  }

  private toLocalDecisionState(state: AuthorityMetaDecisionAnalysis['readiness']['state']) {
    switch (state) {
      case 'HIGH_CONFIDENCE_READY':
        return DecisionState.HIGH_CONFIDENCE_READY;
      case 'READY':
        return DecisionState.READY;
      case 'PARTIALLY_READY':
        return DecisionState.PARTIALLY_READY;
      case 'EXPLORING':
        return DecisionState.EXPLORING;
      case 'NOT_READY':
      default:
        return DecisionState.NOT_READY;
    }
  }

  private getDecisionType(
    analysis: AuthorityMetaDecisionAnalysis
  ): MetaDecisionAnalysis['context']['decisionType'] {
    const decisionType = analysis.context.decisionType;
    return decisionType === 'initial' ||
      decisionType === 'transition' ||
      decisionType === 'specialization' ||
      decisionType === 'commitment'
      ? decisionType
      : 'initial';
  }

  private getTimePressure(
    analysis: AuthorityMetaDecisionAnalysis
  ): MetaDecisionAnalysis['context']['timePressure'] {
    const timePressure = analysis.context.timePressure;
    return timePressure === 'none' ||
      timePressure === 'low' ||
      timePressure === 'moderate' ||
      timePressure === 'high'
      ? timePressure
      : 'none';
  }
}

/**
 * Factory function for MetaDecisionEngine.
 */
export function createMetaDecisionEngine(
  config?: Partial<MetaDecisionConfig>
): MetaDecisionEngine {
  return new MetaDecisionEngine(config);
}

/**
 * Convenience function to analyze decision quality.
 */
export function analyzeDecisionQuality(
  input: MetaDecisionInput,
  config?: Partial<MetaDecisionConfig>
): Promise<MetaDecisionAnalysis> {
  const engine = new MetaDecisionEngine(config);
  return engine.analyze(input);
}
