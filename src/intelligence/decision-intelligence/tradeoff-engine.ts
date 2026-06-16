/**
 * Tradeoff Engine
 *
 * Phase 8.5: Decision Intelligence Engine - Part 3
 *
 * Detects hidden tradeoffs inside student reasoning.
 * Identifies conflicts between competing values and priorities.
 *
 * Examples:
 * - Money vs Meaning
 * - Prestige vs Freedom
 * - Security vs Growth
 * - Passion vs Practicality
 * - Family Expectations vs Personal Identity
 * - Short-Term Reward vs Long-Term Fulfillment
 * - Status vs Autonomy
 *
 * @module tradeoff-engine
 * @version 1.0.0
 */

import {
  DetectedTradeoff,
  TradeoffAnalysis,
  TradeoffEvidence,
  TradeoffDimension,
  TradeoffIntensity,
  TradeoffEngineConfig,
  DecisionInput,
  Contradiction,
  DecisionOption,
} from './decision-types';
import type { TradeoffFramework } from './decision-types';
import { TRADEOFF_PATTERNS } from './decision-model';

/**
 * Tradeoff Engine implementation
 */
export class TradeoffEngine {
  private config: TradeoffEngineConfig;

  constructor(config?: Partial<TradeoffEngineConfig>) {
    this.config = {
      sensitivity: 0.7,
      minEvidenceCount: 2,
      dimensionWeights: new Map([
        ['MONEY_VS_MEANING', 1.0],
        ['PRESTIGE_VS_FREEDOM', 0.9],
        ['SECURITY_VS_GROWTH', 0.9],
        ['PASSION_VS_PRACTICALITY', 1.0],
        ['FAMILY_VS_IDENTITY', 1.0],
        ['SHORT_TERM_VS_LONG_TERM', 0.8],
        ['STATUS_VS_AUTONOMY', 0.85],
      ]),
      awarenessThresholds: {
        unaware: 0.3,
        partiallyAware: 0.6,
        fullyAware: 0.85,
      },
      ...config,
    };
  }

  /**
   * Analyze decision for tradeoffs
   */
  analyzeTradeoffs(input: DecisionInput): TradeoffAnalysis {
    const detectedTradeoffs: DetectedTradeoff[] = [];

    // Analyze each tradeoff pattern
    for (const pattern of TRADEOFF_PATTERNS) {
      const evidence = this.gatherEvidence(input, pattern);

      if (evidence.length >= this.config.minEvidenceCount) {
        const intensity = this.calculateIntensity(evidence, pattern.dimension);
        const tradeoff = this.createTradeoff(pattern.dimension, evidence, intensity, input);
        detectedTradeoffs.push(tradeoff);
      }
    }

    // Sort by intensity and weight
    detectedTradeoffs.sort((a, b) => {
      const weightA = this.config.dimensionWeights.get(a.type) ?? 0.5;
      const weightB = this.config.dimensionWeights.get(b.type) ?? 0.5;
      const scoreA = this.intensityToScore(a.intensity) * weightA;
      const scoreB = this.intensityToScore(b.intensity) * weightB;
      return scoreB - scoreA;
    });

    const primaryConflict = detectedTradeoffs[0] ?? null;
    const studentAwareness = this.assessStudentAwareness(detectedTradeoffs, input);

    return {
      detectedTradeoffs,
      primaryConflict,
      studentAwareness,
      resolutionSuggestions: this.generateResolutionSuggestions(detectedTradeoffs),
      explanation: this.generateExplanation(detectedTradeoffs, primaryConflict),
    };
  }

  /**
   * Gather evidence for a tradeoff pattern
   */
  private gatherEvidence(
    input: DecisionInput,
    pattern: { dimension: TradeoffDimension; indicators: string[]; evidenceTypes: string[] }
  ): TradeoffEvidence[] {
    const evidence: TradeoffEvidence[] = [];

    // Search in context values
    for (const value of input.context.values) {
      for (const indicator of pattern.indicators) {
        if (value.toLowerCase().includes(indicator.toLowerCase())) {
          evidence.push({
            source: 'STATEMENT',
            content: value,
            weight: 0.7,
          });
        }
      }
    }

    // Search in aspirational goals
    for (const goal of input.context.aspirationalGoals) {
      for (const indicator of pattern.indicators) {
        if (goal.toLowerCase().includes(indicator.toLowerCase())) {
          evidence.push({
            source: 'PREFERENCE',
            content: goal,
            weight: 0.8,
          });
        }
      }
    }

    // Analyze contradictions
    if (input.contradictions) {
      for (const contradiction of input.contradictions) {
        const content = `${contradiction.dimensionA} vs ${contradiction.dimensionB}`;
        for (const indicator of pattern.indicators) {
          if (content.toLowerCase().includes(indicator.toLowerCase())) {
            evidence.push({
              source: 'CONTRADICTION',
              content: content,
              weight: 0.9,
              timestamp: contradiction.timestamp,
            });
          }
        }
      }
    }

    return evidence;
  }

  /**
   * Calculate tradeoff intensity based on evidence
   */
  private calculateIntensity(
    evidence: TradeoffEvidence[],
    dimension: TradeoffDimension
  ): TradeoffIntensity {
    const totalWeight = evidence.reduce((sum, e) => sum + e.weight, 0);
    const avgWeight = totalWeight / Math.max(1, evidence.length);

    // Factor in dimension-specific weight
    const dimensionWeight = this.config.dimensionWeights.get(dimension) ?? 0.5;
    const adjustedScore = avgWeight * dimensionWeight * this.config.sensitivity;

    if (adjustedScore >= 0.8) return 'EXTREME';
    if (adjustedScore >= 0.6) return 'STRONG';
    if (adjustedScore >= 0.4) return 'MODERATE';
    return 'MILD';
  }

  /**
   * Create a detected tradeoff
   */
  private createTradeoff(
    dimension: TradeoffDimension,
    evidence: TradeoffEvidence[],
    intensity: TradeoffIntensity,
    input: DecisionInput
  ): DetectedTradeoff {
    const [dimensionA, dimensionB] = this.parseDimension(dimension);
    const intensityScore = this.intensityToScore(intensity) * 100;

    return {
      id: `tradeoff-${dimension}-${Date.now()}`,
      dimensionA,
      dimensionB,
      type: dimension,
      intensity,
      intensityScore: Math.round(intensityScore),
      evidence,
      explanation: this.generateTradeoffExplanation(dimension, evidence, input),
      resolution: this.suggestResolution(dimension, intensity, evidence),
    };
  }

  /**
   * Parse dimension pair from tradeoff dimension
   */
  private parseDimension(dimension: TradeoffDimension): [string, string] {
    const parts = dimension.split('_VS_');
    return [parts[0] || 'Dimension A', parts[1] || 'Dimension B'];
  }

  /**
   * Generate human-readable explanation for a tradeoff
   */
  private generateTradeoffExplanation(
    dimension: TradeoffDimension,
    evidence: TradeoffEvidence[],
    input: DecisionInput
  ): string {
    const [dimA, dimB] = this.parseDimension(dimension);

    const explanations: Record<TradeoffDimension, string> = {
      MONEY_VS_MEANING: `I notice you're navigating the tension between financial security and meaningful work. This is one of the most common struggles students face.`,
      PRESTIGE_VS_FREEDOM: `There seems to be a pull between achieving status and having autonomy in your work. Both matter, but they often require different tradeoffs.`,
      SECURITY_VS_GROWTH: `You're weighing the comfort of stability against the potential of growth. Staying safe feels good now, but growth often requires stepping into uncertainty.`,
      PASSION_VS_PRACTICALITY: `I can sense the tension between what you love and what seems practical. This is a deeply personal choice that affects long-term satisfaction.`,
      FAMILY_VS_IDENTITY: `There appears to be some tension between family expectations and your own sense of who you are and want to become.`,
      SHORT_TERM_VS_LONG_TERM: `You're considering whether to optimize for immediate rewards or long-term fulfillment. This affects everything from career choice to education paths.`,
      STATUS_VS_AUTONOMY: `I notice a consideration between having a prestigious position versus having control over your work and decisions.`,
      STABILITY_VS_ADVENTURE: `There's a tension between wanting security and craving new experiences or challenges.`,
      SOCIAL_APPROVAL_VS_AUTHENTICITY: `You seem to be weighing what others will think against being true to yourself.`,
      COMFORT_VS_CHALLENGE: `There's a pull between staying comfortable and pushing yourself to grow through challenges.`,
      IMMEDIATE_VS_DELAYED: `You're considering whether to take benefits now or invest in greater rewards later.`,
      BREADTH_VS_DEPTH: `There's tension between exploring many options versus going deep in one area.`,
      INDEPENDENCE_VS_BELONGING: `You're weighing the desire for autonomy against the need for connection and belonging.`,
      CREATIVITY_VS_STRUCTURE: `There's a consideration between creative freedom and the security of structured environments.`,
      IMPACT_VS_INCOME: `You're navigating between wanting to make a difference and needing financial stability.`,
    };

    return explanations[dimension] || `I notice tension between ${dimA} and ${dimB}.`;
  }

  /**
   * Suggest resolution approach for a tradeoff
   */
  private suggestResolution(
    dimension: TradeoffDimension,
    intensity: TradeoffIntensity,
    evidence: TradeoffEvidence[]
  ): DetectedTradeoff['resolution'] {
    // Count evidence for each side
    const dimA = dimension.split('_VS_')[0];
    const dimAScore = evidence.filter((e) =>
      e.content.toLowerCase().includes(dimA.toLowerCase())
    ).length;
    const dimBScore = evidence.length - dimAScore;

    const diff = Math.abs(dimAScore - dimBScore);

    if (diff <= 1) {
      return {
        recommended: 'INTEGRATE',
        rationale: `Both dimensions appear equally important. Consider paths that honor both values, even if imperfectly.`,
        conditions: ['Find roles that combine both', 'Create hybrid approaches'],
      };
    }

    if (intensity === 'EXTREME') {
      return {
        recommended: 'DEFER',
        rationale: `This is a fundamental tension that may need time to resolve. Experiment with both paths before committing.`,
        conditions: ['Try short-term experiments', 'Seek mentorship from both paths'],
      };
    }

    const winner = dimAScore > dimBScore ? 'PRIORITIZE_A' : 'PRIORITIZE_B';
    const winnerName = dimAScore > dimBScore ? dimension.split('_VS_')[0] : dimension.split('_VS_')[1];

    return {
      recommended: winner,
      rationale: `Evidence suggests ${winnerName} matters more to you right now. This may change over time, but clarity comes from honoring current priorities.`,
      conditions: ['Revisit in 1-2 years', 'Monitor satisfaction levels'],
    };
  }

  /**
   * Assess how aware the student is of each tradeoff
   */
  private assessStudentAwareness(
    tradeoffs: DetectedTradeoff[],
    input: DecisionInput
  ): TradeoffAnalysis['studentAwareness'] {
    if (tradeoffs.length === 0) return 'FULLY_AWARE';

    // Check if student has explicitly mentioned tradeoffs
    const allContext = [
      ...input.context.values,
      ...input.context.aspirationalGoals,
      input.description,
    ].join(' ').toLowerCase();

    let awarenessScore = 0;
    let totalTradeoffs = 0;

    for (const tradeoff of tradeoffs) {
      totalTradeoffs++;
      const [dimA, dimB] = this.parseDimension(tradeoff.type);
      const dimALower = dimA.toLowerCase();
      const dimBLower = dimB.toLowerCase();

      // Check if both dimensions are mentioned together
      if (
        (allContext.includes(dimALower) && allContext.includes(dimBLower)) ||
        allContext.includes('tradeoff') ||
        allContext.includes('balance') ||
        allContext.includes('choose between')
      ) {
        awarenessScore++;
      }
    }

    const awarenessRatio = awarenessScore / totalTradeoffs;

    if (awarenessRatio >= this.config.awarenessThresholds.fullyAware) return 'FULLY_AWARE';
    if (awarenessRatio >= this.config.awarenessThresholds.partiallyAware) return 'PARTIALLY_AWARE';
    return 'UNAWARE';
  }

  /**
   * Generate resolution suggestions
   */
  private generateResolutionSuggestions(tradeoffs: DetectedTradeoff[]): string[] {
    const suggestions: string[] = [];

    for (const tradeoff of tradeoffs.slice(0, 3)) {
      const [dimA, dimB] = this.parseDimension(tradeoff.type);

      switch (tradeoff.resolution.recommended) {
        case 'INTEGRATE':
          suggestions.push(`Consider how you might blend ${dimA} and ${dimB} rather than choosing one.`);
          break;
        case 'PRIORITIZE_A':
          suggestions.push(`For now, let ${dimA} take priority, but plan to revisit ${dimB} in the future.`);
          break;
        case 'PRIORITIZE_B':
          suggestions.push(`For now, prioritize ${dimB}, while keeping ${dimA} in mind for later.`);
          break;
        case 'DEFER':
          suggestions.push(`Take time to explore both ${dimA} and ${dimB} through small experiments before committing.`);
          break;
        case 'BALANCE':
          suggestions.push(`Seek a middle path that gives you reasonable amounts of both ${dimA} and ${dimB}.`);
          break;
      }
    }

    return suggestions;
  }

  /**
   * Generate overall explanation
   */
  private generateExplanation(
    tradeoffs: DetectedTradeoff[],
    primaryConflict: DetectedTradeoff | null
  ): string {
    if (tradeoffs.length === 0) {
      return `Your decision appears straightforward without major internal conflicts. Focus on practical considerations.`;
    }

    let explanation = `I've identified ${tradeoffs.length} key tradeoff${tradeoffs.length > 1 ? 's' : ''} in your decision. `;

    if (primaryConflict) {
      const [dimA, dimB] = this.parseDimension(primaryConflict.type);
      explanation += `The most significant tension is between ${dimA} and ${dimB}. `;
      explanation += primaryConflict.explanation;
    }

    return explanation;
  }

  /**
   * Convert intensity to numeric score
   */
  private intensityToScore(intensity: TradeoffIntensity): number {
    const scores = {
      MILD: 0.25,
      MODERATE: 0.5,
      STRONG: 0.75,
      EXTREME: 1.0,
    };
    return scores[intensity];
  }

  /**
   * Quick tradeoff check
   */
  quickTradeoffCheck(
    values: string[],
    goals: string[]
  ): { hasTradeoffs: boolean; primaryTradeoff: TradeoffDimension | null } {
    const input: DecisionInput = {
      id: 'quick-check' as any,
      type: 'LIFE_DIRECTION',
      studentId: 'anonymous',
      description: '',
      options: [],
      context: {
        familyExpectations: [],
        peerInfluence: [],
        culturalFactors: [],
        economicClimate: '',
        personalCircumstances: [],
        values,
        nonNegotiables: [],
        aspirationalGoals: goals,
      },
      constraints: [],
      timeline: { decisionBy: new Date(), implementationStart: new Date(), keyMilestones: [], flexibility: 30 },
      psychologyProfile: {} as any,
      dimensionScores: new Map(),
      careerRecommendations: {} as any,
    };

    const analysis = this.analyzeTradeoffs(input);

    return {
      hasTradeoffs: analysis.detectedTradeoffs.length > 0,
      primaryTradeoff: analysis.primaryConflict?.type ?? null,
    };
  }

  /**
   * Get current configuration
   */
  getConfig(): TradeoffEngineConfig {
    return { ...this.config };
  }

  /**
   * Create a decision matrix for comparing options
   */
  createDecisionMatrix(input: DecisionInput): {
    optionIds: string[];
    criteria: string[];
    scores: Record<string, Record<string, number>>;
    weights: Record<string, number>;
  } {
    const optionIds = input.options.map((o) => o.id);
    const criteria = ['risk', 'optionality', 'reversibility', 'fit'];

    const scores: Record<string, Record<string, number>> = {};

    for (const option of input.options) {
      scores[option.id] = {
        risk: option.riskLevel === 'LOW' ? 80 : option.riskLevel === 'MODERATE' ? 60 : option.riskLevel === 'HIGH' ? 40 : 20,
        optionality: option.reversibility.score,
        reversibility: option.reversibility.score,
        fit: 70, // Default fit score
      };
    }

    const weights: Record<string, number> = {
      risk: 0.25,
      optionality: 0.25,
      reversibility: 0.25,
      fit: 0.25,
    };

    return { optionIds, criteria, scores, weights };
  }

  /**
   * Resolve a tradeoff with a specific strategy
   */
  resolveTradeoff(
    input: DecisionInput,
    tradeoff: {
      type: TradeoffDimension;
      dimensionA: string;
      dimensionB: string;
      intensity: number;
      explanation: string;
      studentAwareness: string;
      framework: TradeoffFramework;
      resolutionStrategies: string[];
    }
  ): { recommendedOption: DecisionOption | null; rationale: string; confidence: number } {
    // Analyze options against the tradeoff dimensions
    const scoredOptions = input.options.map((option) => {
      const dimensionAScore = this.scoreOptionForDimension(option, tradeoff.dimensionA);
      const dimensionBScore = this.scoreOptionForDimension(option, tradeoff.dimensionB);
      const balanceScore = 100 - Math.abs(dimensionAScore - dimensionBScore);
      const totalScore = dimensionAScore * 0.4 + dimensionBScore * 0.4 + balanceScore * 0.2;
      return { option, score: totalScore };
    });

    // Sort by score descending
    scoredOptions.sort((a, b) => b.score - a.score);
    const best = scoredOptions[0];

    return {
      recommendedOption: best?.option ?? null,
      rationale: `Based on balancing ${tradeoff.dimensionA} and ${tradeoff.dimensionB}, this option best addresses the tradeoff.`,
      confidence: Math.min(100, tradeoff.intensity * 0.8 + 20),
    };
  }

  /**
   * Score an option for a specific dimension
   */
  private scoreOptionForDimension(option: DecisionOption, dimension: string): number {
    const dimLower = dimension.toLowerCase();
    if (dimLower.includes('financial') || dimLower.includes('money')) {
      return option.riskLevel === 'LOW' ? 70 : option.riskLevel === 'MODERATE' ? 60 : 50;
    }
    if (dimLower.includes('purpose') || dimLower.includes('meaning')) {
      return 60 + Math.random() * 20; // Simulated purpose score
    }
    if (dimLower.includes('risk') || dimLower.includes('security')) {
      return option.riskLevel === 'LOW' ? 80 : option.riskLevel === 'MODERATE' ? 60 : 40;
    }
    return 50; // Default score
  }
}

/**
 * Factory function for creating tradeoff engine
 */
export function createTradeoffEngine(config?: Partial<TradeoffEngineConfig>): TradeoffEngine {
  return new TradeoffEngine(config);
}

/**
 * Resolve a tradeoff using the canonical TradeoffEngine implementation.
 */
export function resolveTradeoff(
  input: DecisionInput,
  tradeoff: Parameters<TradeoffEngine['resolveTradeoff']>[1]
): ReturnType<TradeoffEngine['resolveTradeoff']> {
  return createTradeoffEngine().resolveTradeoff(input, tradeoff);
}

/**
 * Quick tradeoff analysis
 */
export function analyzeQuickTradeoff(
  values: string[],
  goals: string[] = []
): { intensity: number; detected: TradeoffDimension[]; explanation: string } {
  const engine = createTradeoffEngine();
  const result = engine.quickTradeoffCheck(values, goals);

  let explanation = '';
  if (result.primaryTradeoff) {
    const parts = result.primaryTradeoff.split('_VS_');
    explanation = `Primary tension detected between ${parts[0]} and ${parts[1]}.`;
  } else {
    explanation = 'No major tradeoffs detected in your values and goals.';
  }

  const detected = result.primaryTradeoff ? [result.primaryTradeoff] : [];
  const intensity = result.hasTradeoffs ? 70 : 0;

  return { intensity, detected, explanation };
}

/**
 * Detect specific tradeoff type
 */
export function detectTradeoffType(
  text: string,
  dimension: TradeoffDimension
): { detected: boolean; confidence: number } {
  const pattern = TRADEOFF_PATTERNS.find((p) => p.dimension === dimension);
  if (!pattern) return { detected: false, confidence: 0 };

  const textLower = text.toLowerCase();
  let matches = 0;

  for (const indicator of pattern.indicators) {
    if (textLower.includes(indicator.toLowerCase())) {
      matches++;
    }
  }

  const confidence = Math.min(100, (matches / pattern.minEvidence) * 100);
  return { detected: matches >= pattern.minEvidence, confidence };
}
