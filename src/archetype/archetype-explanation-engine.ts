/**
 * CareerOS Archetype Explanation Engine
 *
 * Phase 1.4: Archetype Explanation Engine
 *
 * Main orchestrator for explaining archetype results.
 *
 * @module archetype-explanation-engine
 * @version 1.0.0
 */

import type {
  ArchetypeProfile,
  ArchetypeType,
} from '@/types/archetype-profile';
import type { ArchetypeSignal } from './archetype-types';
import type { ArchetypeConfidenceDetails } from './confidence-types';
import type {
  ArchetypeExplanation,
  ExplanationOptions,
  ExplanationResult,
  ConfidenceExplanation,
} from './archetype-explanation-types';

import { StrengthEngine, createStrengthEngine } from './archetype-strength-engine';
import { RiskEngine, createRiskEngine } from './archetype-risk-engine';
import { NarrativeEngine, createNarrativeEngine } from './archetype-narrative-engine';
import { InsightsEngine, createInsightsEngine } from './archetype-insights-engine';

/**
 * Main Archetype Explanation Engine.
 *
 * Orchestrates the generation of human-readable archetype explanations.
 */
export class ArchetypeExplanationEngine {
  /** Strength engine */
  private strengthEngine: StrengthEngine;

  /** Risk engine */
  private riskEngine: RiskEngine;

  /** Narrative engine */
  private narrativeEngine: NarrativeEngine;

  /** Insights engine */
  private insightsEngine: InsightsEngine;

  /**
   * Creates a new ArchetypeExplanationEngine.
   */
  constructor() {
    this.strengthEngine = createStrengthEngine();
    this.riskEngine = createRiskEngine();
    this.narrativeEngine = createNarrativeEngine();
    this.insightsEngine = createInsightsEngine();
  }

  /**
   * Generates complete archetype explanation.
   *
   * @param profile - Archetype profile
   * @param confidence - Confidence details
   * @param signals - Assessment signals
   * @param options - Generation options
   * @returns Explanation result
   */
  generateExplanation(
    profile: ArchetypeProfile,
    confidence: ArchetypeConfidenceDetails,
    signals: ArchetypeSignal[],
    options: ExplanationOptions = {}
  ): ExplanationResult {
    try {
      // Generate primary archetype explanation
      const primaryScore = profile.archetypeScores.find(
        (s) => s.archetype === profile.primaryArchetype
      );
      const primaryExplanation = this.narrativeEngine.generateSingleArchetypeExplanation(
        profile.primaryArchetype,
        primaryScore?.score ?? 0
      );

      // Generate secondary explanation if present
      let secondaryExplanation;
      let mixedExplanation;
      if (profile.secondaryArchetype) {
        const secondaryScore = profile.archetypeScores.find(
          (s) => s.archetype === profile.secondaryArchetype
        );
        secondaryExplanation = this.narrativeEngine.generateSingleArchetypeExplanation(
          profile.secondaryArchetype,
          secondaryScore?.score ?? 0
        );
        mixedExplanation = this.narrativeEngine.generateMixedArchetypeExplanation(
          profile.primaryArchetype,
          profile.secondaryArchetype
        );
      }

      // Generate strengths
      const strengths = profile.secondaryArchetype
        ? this.strengthEngine.generateCombinedStrengths(
            profile.primaryArchetype,
            profile.secondaryArchetype
          )
        : this.strengthEngine.generateStrengths(profile.primaryArchetype);

      // Generate risks
      const risks = profile.secondaryArchetype
        ? this.riskEngine.generateCombinedRisks(
            profile.primaryArchetype,
            profile.secondaryArchetype
          )
        : this.riskEngine.generateRisks(profile.primaryArchetype);

      // Generate work environment analysis
      const workEnvironment = profile.secondaryArchetype
        ? this.insightsEngine.generateCombinedEnvironmentAnalysis(
            profile.primaryArchetype,
            profile.secondaryArchetype
          )
        : this.insightsEngine.generateEnvironmentAnalysis(profile.primaryArchetype);

      // Generate career implications
      const careerImplications = profile.secondaryArchetype
        ? this.insightsEngine.generateCombinedCareerImplications(
            profile.primaryArchetype,
            profile.secondaryArchetype
          )
        : this.insightsEngine.generateCareerImplications(profile.primaryArchetype);

      // Generate confidence explanation
      const confidenceExplanation = this.generateConfidenceExplanation(
        confidence,
        signals
      );

      // Generate summary
      const summary = this.narrativeEngine.generateSummary(
        profile.primaryArchetype,
        profile.secondaryArchetype,
        primaryScore?.score ?? 0
      );

      // Generate actionable insights
      const actionableInsights = this.insightsEngine.generateActionableInsights(
        profile.primaryArchetype
      );

      const explanation: ArchetypeExplanation = {
        explanationId: `explanation-${profile.profileId}-${Date.now()}`,
        primaryExplanation,
        secondaryExplanation,
        mixedExplanation,
        summary,
        strengths,
        risks,
        workEnvironment,
        careerImplications,
        confidenceExplanation,
        actionableInsights,
        generatedAt: new Date(),
      };

      return {
        success: true,
        explanation,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Explanation generation failed',
      };
    }
  }

  /**
   * Generates confidence explanation.
   *
   * @param confidence - Confidence details
   * @param signals - Assessment signals
   * @returns Confidence explanation
   */
  private generateConfidenceExplanation(
    confidence: ArchetypeConfidenceDetails,
    signals: ArchetypeSignal[]
  ): ConfidenceExplanation {
    const summary = this.generateConfidenceSummary(confidence);

    const highConfidenceReasons =
      confidence.confidenceScore >= 70
        ? this.identifyHighConfidenceReasons(confidence, signals)
        : undefined;

    const lowConfidenceReasons =
      confidence.confidenceScore < 70
        ? this.identifyLowConfidenceReasons(confidence, signals)
        : undefined;

    const evidenceSummary = this.generateEvidenceSummary(signals);

    const improvementRecommendations =
      confidence.confidenceScore < 80
        ? this.generateImprovementRecommendations(confidence)
        : undefined;

    return {
      summary,
      highConfidenceReasons,
      lowConfidenceReasons,
      evidenceSummary,
      improvementRecommendations,
    };
  }

  /**
   * Generates confidence summary.
   *
   * @param confidence - Confidence details
   * @returns Summary text
   */
  private generateConfidenceSummary(confidence: ArchetypeConfidenceDetails): string {
    const level = confidence.confidenceLevel.toLowerCase().replace('_', ' ');

    if (confidence.confidenceScore >= 80) {
      return `We have ${level} confidence in this archetype assignment. The evidence strongly supports this result.`;
    } else if (confidence.confidenceScore >= 60) {
      return `We have ${level} confidence in this archetype assignment. While the evidence is supportive, there is room for additional validation.`;
    } else if (confidence.confidenceScore >= 40) {
      return `We have ${level} confidence in this archetype assignment. Additional assessment data would strengthen this result.`;
    } else {
      return `We have ${level} confidence in this archetype assignment. This should be considered preliminary and requires more data.`;
    }
  }

  /**
   * Identifies reasons for high confidence.
   *
   * @param confidence - Confidence details
   * @param signals - Assessment signals
   * @returns Reasons
   */
  private identifyHighConfidenceReasons(
    confidence: ArchetypeConfidenceDetails,
    signals: ArchetypeSignal[]
  ): string[] {
    const reasons: string[] = [];

    if (confidence.evidenceScore >= 70) {
      reasons.push('Strong evidence from multiple assessment sources');
    }

    if (confidence.separationScore >= 70) {
      reasons.push('Clear distinction between primary and other archetypes');
    }

    if (confidence.stabilityScore >= 70) {
      reasons.push('Consistent signals unlikely to change significantly');
    }

    if (confidence.coverageScore >= 70) {
      reasons.push('Comprehensive assessment coverage across archetypes');
    }

    if (confidence.consistencyScore >= 70) {
      reasons.push('Highly consistent responses across assessments');
    }

    if (signals.length >= 10) {
      reasons.push('Large volume of supporting signals');
    }

    return reasons;
  }

  /**
   * Identifies reasons for low confidence.
   *
   * @param confidence - Confidence details
   * @param signals - Assessment signals
   * @returns Reasons
   */
  private identifyLowConfidenceReasons(
    confidence: ArchetypeConfidenceDetails,
    signals: ArchetypeSignal[]
  ): string[] {
    const reasons: string[] = [];

    if (confidence.evidenceScore < 60) {
      reasons.push('Limited evidence from assessments');
    }

    if (confidence.separationScore < 50) {
      reasons.push('Primary archetype not clearly distinct from others');
    }

    if (confidence.stabilityScore < 60) {
      reasons.push('Signals suggest results may change with additional data');
    }

    if (confidence.coverageScore < 60) {
      reasons.push('Incomplete assessment coverage');
    }

    if (confidence.consistencyScore < 60) {
      reasons.push('Some inconsistent responses detected');
    }

    if (signals.length < 5) {
      reasons.push('Insufficient signal volume for reliable determination');
    }

    return reasons;
  }

  /**
   * Generates evidence summary.
   *
   * @param signals - Assessment signals
   * @returns Evidence summary
   */
  private generateEvidenceSummary(signals: ArchetypeSignal[]): string {
    const sourceCount = new Set(signals.map((s) => s.source)).size;
    const archetypeCount = new Set(signals.map((s) => s.archetype)).size;
    const strongSignals = signals.filter((s) => s.strength > 70).length;

    return `This assessment is based on ${signals.length} signals from ${sourceCount} sources, covering ${archetypeCount} archetypes. ${strongSignals} signals showed strong alignment with specific archetypes.`;
  }

  /**
   * Generates improvement recommendations.
   *
   * @param confidence - Confidence details
   * @returns Recommendations
   */
  private generateImprovementRecommendations(
    confidence: ArchetypeConfidenceDetails
  ): string[] {
    const recommendations: string[] = [];

    if (confidence.evidenceScore < 70) {
      recommendations.push('Complete additional assessments to strengthen evidence');
    }

    if (confidence.coverageScore < 70) {
      recommendations.push('Ensure all assessment types are completed');
    }

    if (confidence.separationScore < 60) {
      recommendations.push('Review archetype preferences to clarify distinctions');
    }

    if (confidence.consistencyScore < 60) {
      recommendations.push('Review responses for consistency');
    }

    if (recommendations.length === 0) {
      recommendations.push('Confidence is adequate for decision-making');
    }

    return recommendations;
  }

  /**
   * Generates explanation for specific archetype.
   *
   * @param archetype - The archetype
   * @returns Single archetype explanation
   */
  explainArchetype(archetype: ArchetypeType) {
    return {
      narrative: this.narrativeEngine.generateSingleArchetypeExplanation(archetype, 75),
      strengths: this.strengthEngine.generateStrengths(archetype),
      risks: this.riskEngine.generateRisks(archetype),
      environment: this.insightsEngine.generateEnvironmentAnalysis(archetype),
      career: this.insightsEngine.generateCareerImplications(archetype),
    };
  }

  /**
   * Compares two archetypes.
   *
   * @param archetype1 - First archetype
   * @param archetype2 - Second archetype
   * @returns Comparison
   */
  compareArchetypes(archetype1: ArchetypeType, archetype2: ArchetypeType) {
    return {
      strengths: this.strengthEngine.compareStrengths(archetype1, archetype2),
      risks: this.riskEngine.compareRisks(archetype1, archetype2),
      narratives: this.narrativeEngine.compareNarratives(archetype1, archetype2),
    };
  }
}

/**
 * Creates default archetype explanation engine.
 *
 * @returns New ArchetypeExplanationEngine instance
 */
export function createArchetypeExplanationEngine(): ArchetypeExplanationEngine {
  return new ArchetypeExplanationEngine();
}

/**
 * Quick explanation generation.
 *
 * @param profile - Archetype profile
 * @param confidence - Confidence details
 * @param signals - Assessment signals
 * @returns Explanation or undefined
 */
export function generateQuickExplanation(
  profile: ArchetypeProfile,
  confidence: ArchetypeConfidenceDetails,
  signals: ArchetypeSignal[]
): ArchetypeExplanation | undefined {
  const engine = createArchetypeExplanationEngine();
  const result = engine.generateExplanation(profile, confidence, signals);
  return result.success ? result.explanation : undefined;
}

/**
 * Default exports for the explanation module.
 */
export { StrengthEngine, createStrengthEngine } from './archetype-strength-engine';
export { RiskEngine, createRiskEngine } from './archetype-risk-engine';
export { NarrativeEngine, createNarrativeEngine } from './archetype-narrative-engine';
export { InsightsEngine, createInsightsEngine } from './archetype-insights-engine';
export * from './archetype-explanation-types';
