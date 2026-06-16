/**
 * MetaDecisionAuthority
 *
 * Constitutional authority for meta-decision analysis.
 * Internal specialization of DecisionAuthority.
 *
 * Responsibilities:
 * - Decision readiness analysis
 * - Decision quality analysis
 * - Decision timing analysis
 * - Commitment readiness analysis
 * - Decision fragility analysis
 * - Decision robustness analysis
 * - Meta-decision narrative generation
 *
 * Constitutional Rule:
 * This is the ONLY system that may perform meta-decision analysis.
 */

import type { Confidence } from '../../confidence/ConfidenceTypes';
import type { DecisionContext } from '../DecisionTypes';

// Re-export types from meta-decision-engine for internal use
export type DecisionState =
  | 'NOT_READY'
  | 'EXPLORING'
  | 'PARTIALLY_READY'
  | 'READY'
  | 'HIGH_CONFIDENCE_READY';

export type DecisionTiming =
  | 'decide_now'
  | 'delay'
  | 'explore'
  | 'experiment'
  | 'gather_evidence';

export type DecisionQualityLevel =
  | 'very_low'
  | 'low'
  | 'moderate'
  | 'good'
  | 'excellent';

export interface DecisionReadinessAnalysis {
  readonly readinessScore: number;
  readonly state: DecisionState;
  readonly confidence: Confidence;
  readonly decisionQuality: number;
  readonly uncertaintyLevel: number;
  readonly recommendation: DecisionTiming;
  readonly explanation: string[];
  readonly components: {
    readonly studentUnderstanding: number;
    readonly identityStability: number;
    readonly valueStability: number;
    readonly utilityConfidence: number;
    readonly informationCompleteness: number;
    readonly marketConfidence: number;
    readonly futureSimulationConfidence: number;
  };
}

export interface DecisionQualityAnalysis {
  readonly overallQuality: number;
  readonly qualityLevel: DecisionQualityLevel;
  readonly components: {
    readonly informationQuality: number;
    readonly reasoningQuality: number;
    readonly evidenceQuality: number;
    readonly biasInfluence: number;
    readonly uncertainty: number;
  };
  readonly explanation: string[];
}

export interface DecisionTimingAnalysis {
  readonly recommendation: DecisionTiming;
  readonly confidence: Confidence;
  readonly urgency: number;
  readonly delayCost: {
    readonly financial: number;
    readonly opportunity: number;
    readonly psychological: number;
  };
  readonly decideNowCost: {
    readonly regretRisk: number;
    readonly informationGap: number;
    readonly reversalDifficulty: number;
  };
  readonly timeline: {
    readonly minimumDelay: number;
    readonly optimalDelay: number;
    readonly maximumDelay: number;
  };
  readonly explanation: string[];
}

export interface CommitmentReadinessAnalysis {
  readonly isAppropriate: boolean;
  readonly readinessScore: number;
  readonly confidence: Confidence;
  readonly supportingFactors: string[];
  readonly opposingFactors: string[];
  readonly explanation: string[];
}

export interface DecisionFragilityAnalysis {
  readonly fragilityScore: number;
  readonly fragilityLevel: 'robust' | 'stable' | 'sensitive' | 'fragile' | 'volatile';
  readonly keyUncertainties: Array<{
    readonly factor: string;
    readonly impact: number;
    readonly reducible: boolean;
  }>;
  readonly explanation: string[];
}

export interface DecisionRobustnessAnalysis {
  readonly robustnessScore: number;
  readonly robustnessLevel: 'weak' | 'moderate' | 'strong' | 'very_strong';
  readonly explanation: string[];
}

export interface MetaDecisionAnalysis {
  readonly id: string;
  readonly timestamp: number;
  readonly studentId: string;
  readonly decisionId: string;
  readonly context: DecisionContext;
  readonly readiness: DecisionReadinessAnalysis;
  readonly quality: DecisionQualityAnalysis;
  readonly timing: DecisionTimingAnalysis;
  readonly commitment: CommitmentReadinessAnalysis;
  readonly fragility: DecisionFragilityAnalysis;
  readonly robustness: DecisionRobustnessAnalysis;
  readonly recommendedAction: {
    readonly action: DecisionTiming;
    readonly priority: 'critical' | 'high' | 'medium' | 'low';
    readonly reasoning: string[];
    readonly steps: string[];
  };
  readonly narrative: {
    readonly summary: string;
    readonly qualityExplanation: string[];
    readonly readinessExplanation: string[];
    readonly recommendationExplanation: string[];
  };
  readonly overallConfidence: Confidence;
}

export interface MetaDecisionInput {
  readonly studentId: string;
  readonly decisionId: string;
  readonly context?: Partial<DecisionContext> & {
    readonly timePressure?: string;
  };
  readonly studentBeliefs: {
    readonly identityStability: number;
    readonly valueStability: number;
    readonly understandingLevel: number;
  };
  readonly utilityConfidence: {
    readonly overall: number;
    readonly byCareer: Record<string, number>;
  };
  readonly uncertainty: {
    readonly overall: number;
    readonly informationGaps: string[];
    readonly unknownFactors: string[];
  };
  readonly biasProfile: {
    readonly overallBias: number;
    readonly dominantBiases: string[];
  };
  readonly informationCompleteness: {
    readonly careerData: number;
    readonly personalFit: number;
    readonly marketData: number;
    readonly outcomeData: number;
  };
  readonly decisionIntelligence: {
    readonly recommendation: string;
    readonly confidence: Confidence;
    readonly alternatives: string[];
  };
}

export interface MetaDecisionConfig {
  readonly readinessThresholds: {
    readonly notReady: number;
    readonly exploring: number;
    readonly partiallyReady: number;
    readonly ready: number;
    readonly highConfidenceReady: number;
  };
  readonly readinessWeights: {
    readonly studentUnderstanding: number;
    readonly identityStability: number;
    readonly valueStability: number;
    readonly utilityConfidence: number;
    readonly informationCompleteness: number;
    readonly marketConfidence: number;
    readonly futureSimulationConfidence: number;
  };
  readonly qualityWeights: {
    readonly informationQuality: number;
    readonly reasoningQuality: number;
    readonly evidenceQuality: number;
    readonly biasInfluence: number;
    readonly uncertainty: number;
  };
  readonly minCommitmentConfidence: number;
  readonly maxAcceptableBias: number;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_META_DECISION_CONFIG: MetaDecisionConfig = {
  readinessThresholds: {
    notReady: 30,
    exploring: 45,
    partiallyReady: 60,
    ready: 75,
    highConfidenceReady: 90,
  },
  readinessWeights: {
    studentUnderstanding: 0.15,
    identityStability: 0.15,
    valueStability: 0.15,
    utilityConfidence: 0.15,
    informationCompleteness: 0.15,
    marketConfidence: 0.15,
    futureSimulationConfidence: 0.1,
  },
  qualityWeights: {
    informationQuality: 0.25,
    reasoningQuality: 0.25,
    evidenceQuality: 0.2,
    biasInfluence: 0.15,
    uncertainty: 0.15,
  },
  minCommitmentConfidence: 70,
  maxAcceptableBias: 50,
};

// ============================================================================
// META DECISION AUTHORITY
// ============================================================================

export interface IMetaDecisionAuthority {
  /**
   * Main entry point: perform complete meta-decision analysis.
   */
  analyze(input: MetaDecisionInput): Promise<MetaDecisionAnalysis>;

  /**
   * Analyze decision readiness only.
   */
  analyzeReadiness(input: MetaDecisionInput): Promise<DecisionReadinessAnalysis>;

  /**
   * Analyze decision quality only.
   */
  analyzeQuality(input: MetaDecisionInput): Promise<DecisionQualityAnalysis>;

  /**
   * Analyze decision timing only.
   */
  analyzeTiming(
    input: MetaDecisionInput,
    readinessState: DecisionState,
    quality: number
  ): Promise<DecisionTimingAnalysis>;

  /**
   * Check if decision should be made now.
   */
  shouldDecideNow(analysis: MetaDecisionAnalysis): boolean;

  /**
   * Check if decision should be delayed.
   */
  shouldDelay(analysis: MetaDecisionAnalysis): boolean;

  /**
   * Get authority version.
   */
  getVersion(): string;
}

export class MetaDecisionAuthority implements IMetaDecisionAuthority {
  private config: MetaDecisionConfig;

  constructor(config: Partial<MetaDecisionConfig> = {}) {
    this.config = { ...DEFAULT_META_DECISION_CONFIG, ...config };
  }

  /**
   * Main entry point: perform complete meta-decision analysis.
   */
  async analyze(input: MetaDecisionInput): Promise<MetaDecisionAnalysis> {
    // Run sub-analyses
    const readiness = await this.analyzeReadiness(input);
    const quality = await this.analyzeQuality(input);

    // Run dependent analyses
    const [timing, commitment, fragility, robustness] = await Promise.all([
      this.analyzeTiming(input, readiness.state, quality.overallQuality),
      this.analyzeCommitment(input, readiness.state, quality.overallQuality),
      this.analyzeFragility(input, input.decisionIntelligence.recommendation),
      this.analyzeRobustness(input, input.decisionIntelligence.recommendation),
    ]);

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

    // Generate narrative
    const narrative = this.generateNarrative(
      readiness,
      quality,
      timing,
      recommendedAction
    );

    return {
      id: this.generateId(),
      timestamp: Date.now(),
      studentId: input.studentId,
      decisionId: input.decisionId,
      context: {
        ...input.context,
        studentId: input.studentId,
        sessionId: input.context?.sessionId ?? `meta-${input.decisionId}`,
        timestamp: input.context?.timestamp ?? new Date(),
        careerOptions: input.decisionIntelligence.alternatives,
        decisionType: 'initial',
        timePressure: input.context?.timePressure ?? 'none',
      },
      readiness,
      quality,
      timing,
      commitment,
      fragility,
      robustness,
      recommendedAction,
      narrative,
      overallConfidence,
    };
  }

  /**
   * Analyze decision readiness.
   */
  async analyzeReadiness(input: MetaDecisionInput): Promise<DecisionReadinessAnalysis> {
    const components = {
      studentUnderstanding: this.evaluateStudentUnderstanding(input),
      identityStability: input.studentBeliefs.identityStability,
      valueStability: input.studentBeliefs.valueStability,
      utilityConfidence: input.utilityConfidence.overall,
      informationCompleteness: this.evaluateInformationCompleteness(input),
      marketConfidence: input.informationCompleteness.marketData,
      futureSimulationConfidence: Math.max(0, 100 - input.uncertainty.overall),
    };

    const readinessScore = this.calculateReadinessScore(components);
    const state = this.determineDecisionState(readinessScore);
    const confidence = this.calculateReadinessConfidence(components);
    const decisionQuality = this.calculateDecisionQuality(input, components);
    const recommendation = this.determineRecommendation(state, input);

    return {
      readinessScore,
      state,
      confidence,
      decisionQuality,
      uncertaintyLevel: input.uncertainty.overall,
      recommendation,
      explanation: this.generateReadinessExplanation(components, readinessScore, state, recommendation),
      components,
    };
  }

  /**
   * Analyze decision quality.
   */
  async analyzeQuality(input: MetaDecisionInput): Promise<DecisionQualityAnalysis> {
    const components = {
      informationQuality: this.evaluateInformationQuality(input),
      reasoningQuality: this.evaluateReasoningQuality(input),
      evidenceQuality: this.evaluateEvidenceQuality(input),
      biasInfluence: input.biasProfile.overallBias,
      uncertainty: input.uncertainty.overall,
    };

    const overallQuality = this.calculateOverallQuality(components);
    const qualityLevel = this.determineQualityLevel(overallQuality);

    return {
      overallQuality,
      qualityLevel,
      components,
      explanation: this.generateQualityExplanation(components, overallQuality, qualityLevel),
    };
  }

  /**
   * Analyze decision timing.
   */
  async analyzeTiming(
    input: MetaDecisionInput,
    readinessState: DecisionState,
    quality: number
  ): Promise<DecisionTimingAnalysis> {
    const urgency = this.calculateUrgency(input);
    const recommendation = this.determineTimingRecommendation(
      readinessState,
      quality,
      urgency,
      input
    );

    return {
      recommendation,
      confidence: this.calculateTimingConfidence(input, readinessState),
      urgency,
      delayCost: this.calculateDelayCost(readinessState),
      decideNowCost: this.calculateDecideNowCost(input, quality),
      timeline: this.calculateTimeline(readinessState, recommendation),
      explanation: this.generateTimingExplanation(recommendation, readinessState, urgency),
    };
  }

  /**
   * Analyze commitment readiness.
   */
  private async analyzeCommitment(
    input: MetaDecisionInput,
    readinessState: DecisionState,
    quality: number
  ): Promise<CommitmentReadinessAnalysis> {
    const score = this.calculateCommitmentScore(input, readinessState, quality);
    const isAppropriate = this.isCommitmentAppropriate(score, quality, input);

    return {
      isAppropriate,
      readinessScore: score,
      confidence: this.calculateCommitmentConfidence(input),
      supportingFactors: this.getSupportingFactors(input, readinessState, quality),
      opposingFactors: this.getOpposingFactors(input, readinessState, quality),
      explanation: this.generateCommitmentExplanation(isAppropriate, score),
    };
  }

  /**
   * Analyze decision fragility.
   */
  private async analyzeFragility(
    input: MetaDecisionInput,
    recommendation: string
  ): Promise<DecisionFragilityAnalysis> {
    const fragilityScore = this.calculateFragilityScore(input);

    return {
      fragilityScore,
      fragilityLevel: this.determineFragilityLevel(fragilityScore),
      keyUncertainties: input.uncertainty.unknownFactors.map((factor) => ({
        factor,
        impact: Math.round(input.uncertainty.overall * 0.8),
        reducible: input.informationCompleteness.careerData > 50,
      })),
      explanation: [`Decision fragility: ${fragilityScore}%`],
    };
  }

  /**
   * Analyze decision robustness.
   */
  private async analyzeRobustness(
    input: MetaDecisionInput,
    recommendation: string
  ): Promise<DecisionRobustnessAnalysis> {
    const robustnessScore = Math.max(0, 100 - input.uncertainty.overall * 0.8);

    return {
      robustnessScore,
      robustnessLevel: this.determineRobustnessLevel(robustnessScore),
      explanation: [`Decision robustness: ${robustnessScore}%`],
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private evaluateStudentUnderstanding(input: MetaDecisionInput): number {
    return Math.min(100, input.studentBeliefs.understandingLevel + input.informationCompleteness.personalFit * 0.1);
  }

  private evaluateInformationCompleteness(input: MetaDecisionInput): number {
    const { careerData, personalFit, marketData, outcomeData } = input.informationCompleteness;
    return Math.round(careerData * 0.25 + personalFit * 0.3 + marketData * 0.25 + outcomeData * 0.2);
  }

  private calculateReadinessScore(components: DecisionReadinessAnalysis['components']): number {
    const weights = this.config.readinessWeights;
    return Math.round(
      components.studentUnderstanding * weights.studentUnderstanding +
      components.identityStability * weights.identityStability +
      components.valueStability * weights.valueStability +
      components.utilityConfidence * weights.utilityConfidence +
      components.informationCompleteness * weights.informationCompleteness +
      components.marketConfidence * weights.marketConfidence +
      components.futureSimulationConfidence * weights.futureSimulationConfidence
    );
  }

  private determineDecisionState(score: number): DecisionState {
    const t = this.config.readinessThresholds;
    if (score >= t.highConfidenceReady) return 'HIGH_CONFIDENCE_READY';
    if (score >= t.ready) return 'READY';
    if (score >= t.partiallyReady) return 'PARTIALLY_READY';
    if (score >= t.exploring) return 'EXPLORING';
    return 'NOT_READY';
  }

  private calculateReadinessConfidence(components: DecisionReadinessAnalysis['components']): Confidence {
    const values = Object.values(components);
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
    return Math.max(0, Math.round((100 - variance / 10) / 100 * 100) / 100);
  }

  private calculateDecisionQuality(input: MetaDecisionInput, components: DecisionReadinessAnalysis['components']): number {
    const base = (components.studentUnderstanding + components.informationCompleteness + components.utilityConfidence) / 3;
    return Math.max(0, Math.round(base - input.biasProfile.overallBias * 0.3 - input.uncertainty.overall * 0.2));
  }

  private determineRecommendation(state: DecisionState, input: MetaDecisionInput): DecisionTiming {
    if (input.uncertainty.overall > 60) return 'gather_evidence';
    if (input.informationCompleteness.careerData < 50) return 'explore';
    if (input.biasProfile.overallBias > 60) return 'experiment';
    if (state === 'HIGH_CONFIDENCE_READY' || state === 'READY') return 'decide_now';
    if (state === 'PARTIALLY_READY') return input.uncertainty.overall > 40 ? 'gather_evidence' : 'decide_now';
    if (state === 'EXPLORING') return 'explore';
    return input.informationCompleteness.careerData < 40 ? 'explore' : 'gather_evidence';
  }

  private evaluateInformationQuality(input: MetaDecisionInput): number {
    const { careerData, personalFit, marketData, outcomeData } = input.informationCompleteness;
    const completeness = careerData * 0.25 + personalFit * 0.3 + marketData * 0.25 + outcomeData * 0.2;
    return Math.max(0, Math.round(completeness - input.uncertainty.overall * 0.2));
  }

  private evaluateReasoningQuality(input: MetaDecisionInput): number {
    let score = 50 + input.decisionIntelligence.confidence * 30;
    if (input.decisionIntelligence.alternatives.length >= 2) score += 10;
    if (input.decisionIntelligence.alternatives.length >= 3) score += 10;
    score -= input.biasProfile.overallBias * 0.3;
    score += input.utilityConfidence.overall * 0.1;
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private evaluateEvidenceQuality(input: MetaDecisionInput): number {
    const base = (input.informationCompleteness.careerData + input.informationCompleteness.personalFit + input.informationCompleteness.outcomeData) / 3;
    return Math.min(100, Math.round(base + 10));
  }

  private calculateOverallQuality(components: DecisionQualityAnalysis['components']): number {
    const weights = this.config.qualityWeights;
    return Math.round(
      components.informationQuality * weights.informationQuality +
      components.reasoningQuality * weights.reasoningQuality +
      components.evidenceQuality * weights.evidenceQuality +
      (100 - components.biasInfluence) * weights.biasInfluence +
      (100 - components.uncertainty) * weights.uncertainty
    );
  }

  private determineQualityLevel(quality: number): DecisionQualityLevel {
    if (quality >= 85) return 'excellent';
    if (quality >= 70) return 'good';
    if (quality >= 50) return 'moderate';
    if (quality >= 30) return 'low';
    return 'very_low';
  }

  private calculateUrgency(input: MetaDecisionInput): number {
    let urgency = 30;
    const pressure = input.context?.timePressure || 'none';
    const pressureMap: Record<string, number> = { none: 0, low: 20, moderate: 40, high: 70 };
    urgency += pressureMap[pressure] || 0;
    if (input.informationCompleteness.careerData > 80) urgency += 10;
    if (input.uncertainty.overall > 60) urgency -= 20;
    return Math.max(0, Math.min(100, urgency));
  }

  private determineTimingRecommendation(
    readinessState: DecisionState,
    quality: number,
    urgency: number,
    input: MetaDecisionInput
  ): DecisionTiming {
    if (quality >= 70 && (readinessState === 'READY' || readinessState === 'HIGH_CONFIDENCE_READY')) return 'decide_now';
    if (urgency >= 70 && quality >= 50) return 'decide_now';
    if (input.informationCompleteness.careerData < 50) return 'explore';
    if (input.biasProfile.overallBias > 60) return 'experiment';
    if (input.uncertainty.overall > 50) return 'gather_evidence';
    if (readinessState === 'PARTIALLY_READY') return 'gather_evidence';
    if (readinessState === 'EXPLORING') return 'explore';
    if (readinessState === 'NOT_READY') return 'delay';
    return 'gather_evidence';
  }

  private calculateTimingConfidence(input: MetaDecisionInput, readinessState: DecisionState): Confidence {
    let confidence = 50 + input.informationCompleteness.careerData * 0.3 + (100 - input.uncertainty.overall) * 0.2;
    if (readinessState === 'READY' || readinessState === 'HIGH_CONFIDENCE_READY' || readinessState === 'NOT_READY') {
      confidence += 15;
    }
    return Math.min(0.95, Math.round(confidence) / 100);
  }

  private calculateDelayCost(readinessState: DecisionState): DecisionTimingAnalysis['delayCost'] {
    const base = readinessState === 'READY' || readinessState === 'HIGH_CONFIDENCE_READY' ? 30 : 10;
    return { financial: Math.round(base * 0.8), opportunity: Math.round(base * 1.2), psychological: Math.round(base * 0.5) };
  }

  private calculateDecideNowCost(input: MetaDecisionInput, quality: number): DecisionTimingAnalysis['decideNowCost'] {
    return {
      regretRisk: Math.round(100 - quality),
      informationGap: input.uncertainty.overall,
      reversalDifficulty: Math.round((100 - input.informationCompleteness.careerData) * 0.7),
    };
  }

  private calculateTimeline(readinessState: DecisionState, recommendation: DecisionTiming): DecisionTimingAnalysis['timeline'] {
    const baseDays: Record<DecisionState, number> = {
      NOT_READY: 60, EXPLORING: 45, PARTIALLY_READY: 30, READY: 7, HIGH_CONFIDENCE_READY: 0,
    };
    const base = baseDays[readinessState] || 30;

    if (recommendation === 'decide_now') return { minimumDelay: 0, optimalDelay: 0, maximumDelay: 7 };
    if (recommendation === 'explore') return { minimumDelay: 30, optimalDelay: 60, maximumDelay: 90 };
    if (recommendation === 'experiment') return { minimumDelay: 14, optimalDelay: 30, maximumDelay: 60 };
    return { minimumDelay: Math.max(0, base - 14), optimalDelay: base, maximumDelay: base + 30 };
  }

  private calculateCommitmentScore(input: MetaDecisionInput, readinessState: DecisionState, quality: number): number {
    const multipliers: Record<DecisionState, number> = { NOT_READY: 0.1, EXPLORING: 0.3, PARTIALLY_READY: 0.6, READY: 0.85, HIGH_CONFIDENCE_READY: 1.0 };
    let score = multipliers[readinessState] * 50 + quality * 0.3;
    score += input.informationCompleteness.careerData * 0.1;
    score += input.studentBeliefs.identityStability * 0.05;
    score += input.studentBeliefs.valueStability * 0.05;
    return Math.min(100, Math.round(score));
  }

  private isCommitmentAppropriate(score: number, quality: number, input: MetaDecisionInput): boolean {
    return (
      score >= this.config.minCommitmentConfidence &&
      quality >= 50 &&
      input.biasProfile.overallBias <= this.config.maxAcceptableBias &&
      input.uncertainty.overall <= 60
    );
  }

  private calculateCommitmentConfidence(input: MetaDecisionInput): Confidence {
    let confidence = 50 + input.informationCompleteness.careerData * 0.3 + (100 - input.uncertainty.overall) * 0.2;
    confidence += input.studentBeliefs.identityStability * 0.15;
    confidence += input.studentBeliefs.valueStability * 0.15;
    return Math.min(0.95, Math.round(confidence) / 100);
  }

  private getSupportingFactors(input: MetaDecisionInput, readinessState: DecisionState, quality: number): string[] {
    const factors: string[] = [];
    if (readinessState === 'READY' || readinessState === 'HIGH_CONFIDENCE_READY') factors.push('High decision readiness');
    if (quality >= 70) factors.push('Good decision quality');
    if (input.informationCompleteness.careerData >= 70) factors.push('Complete career information');
    if (input.utilityConfidence.overall >= 70) factors.push('High utility confidence');
    if (input.studentBeliefs.identityStability >= 60) factors.push('Stable identity');
    if (input.uncertainty.overall <= 40) factors.push('Low uncertainty');
    return factors;
  }

  private getOpposingFactors(input: MetaDecisionInput, readinessState: DecisionState, quality: number): string[] {
    const factors: string[] = [];
    if (readinessState === 'NOT_READY' || readinessState === 'EXPLORING') factors.push('Decision not yet ready');
    if (quality < 50) factors.push('Low decision quality');
    if (input.uncertainty.overall >= 60) factors.push('High uncertainty');
    if (input.biasProfile.overallBias >= 60) factors.push('Significant bias influence');
    return factors;
  }

  private calculateFragilityScore(input: MetaDecisionInput): number {
    return Math.round(input.uncertainty.overall * 0.6 + input.biasProfile.overallBias * 0.3 + (100 - input.informationCompleteness.careerData) * 0.1);
  }

  private determineFragilityLevel(score: number): DecisionFragilityAnalysis['fragilityLevel'] {
    if (score < 20) return 'robust';
    if (score < 40) return 'stable';
    if (score < 60) return 'sensitive';
    if (score < 80) return 'fragile';
    return 'volatile';
  }

  private determineRobustnessLevel(score: number): DecisionRobustnessAnalysis['robustnessLevel'] {
    if (score < 30) return 'weak';
    if (score < 50) return 'moderate';
    if (score < 75) return 'strong';
    return 'very_strong';
  }

  private determineRecommendedAction(
    timingRecommendation: DecisionTiming,
    readiness: DecisionReadinessAnalysis,
    quality: DecisionQualityAnalysis,
    commitment: CommitmentReadinessAnalysis,
    fragility: DecisionFragilityAnalysis,
    robustness: DecisionRobustnessAnalysis
  ): MetaDecisionAnalysis['recommendedAction'] {
    let priority: MetaDecisionAnalysis['recommendedAction']['priority'] = 'medium';

    if (fragility.fragilityScore >= 70 || quality.qualityLevel === 'very_low') priority = 'critical';
    else if (fragility.fragilityScore >= 50 || quality.qualityLevel === 'low') priority = 'high';
    else if (readiness.state === 'READY') priority = 'high';

    const reasoning: string[] = [];
    reasoning.push(`Decision state: ${readiness.state.replace(/_/g, ' ').toLowerCase()}`);
    reasoning.push(`Quality level: ${quality.qualityLevel.replace('_', ' ')}`);
    if (fragility.fragilityScore >= 60) reasoning.push(`High fragility (${fragility.fragilityScore}%) requires attention`);
    if (!commitment.isAppropriate) reasoning.push('Commitment prerequisites not yet met');

    return {
      action: timingRecommendation,
      priority,
      reasoning,
      steps: this.generateSteps(timingRecommendation, readiness, quality, fragility),
    };
  }

  private generateSteps(
    timingRecommendation: DecisionTiming,
    readiness: DecisionReadinessAnalysis,
    quality: DecisionQualityAnalysis,
    fragility: DecisionFragilityAnalysis
  ): string[] {
    const steps: string[] = [];

    switch (timingRecommendation) {
      case 'decide_now':
        steps.push('Review final decision with trusted advisor');
        steps.push('Document reasoning for future reference');
        steps.push('Prepare action plan for chosen path');
        break;
      case 'delay':
        steps.push('Set specific date for decision');
        steps.push('Identify key information still needed');
        break;
      case 'explore':
        steps.push('Research 3-5 additional career options');
        steps.push('Conduct informational interviews');
        break;
      case 'experiment':
        steps.push('Design small experiments to test preferences');
        steps.push('Shadow professionals in target careers');
        break;
      case 'gather_evidence':
        steps.push('Identify specific knowledge gaps');
        steps.push('Research market data and outcomes');
        break;
    }

    if (quality.components.informationQuality < 60) steps.push('Improve information quality through research');
    if (fragility.fragilityScore >= 60) steps.push('Reduce fragility by addressing key uncertainties');

    return steps.slice(0, 5);
  }

  private calculateOverallConfidence(readinessConfidence: Confidence, uncertainty: number, fragility: number): Confidence {
    return Math.round((readinessConfidence * 0.4 + (100 - uncertainty) * 0.3 + (100 - fragility) * 0.3) / 100 * 100) / 100;
  }

  private generateNarrative(
    readiness: DecisionReadinessAnalysis,
    quality: DecisionQualityAnalysis,
    timing: DecisionTimingAnalysis,
    recommendedAction: MetaDecisionAnalysis['recommendedAction']
  ): MetaDecisionAnalysis['narrative'] {
    return {
      summary: `Decision readiness: ${readiness.readinessScore}%. Quality: ${quality.qualityLevel}. Recommendation: ${recommendedAction.action.replace(/_/g, ' ')}.`,
      qualityExplanation: quality.explanation,
      readinessExplanation: readiness.explanation,
      recommendationExplanation: [`Recommended action: ${recommendedAction.action.replace(/_/g, ' ')} (${recommendedAction.priority} priority)`],
    };
  }

  private generateReadinessExplanation(
    components: DecisionReadinessAnalysis['components'],
    readinessScore: number,
    state: DecisionState,
    recommendation: DecisionTiming
  ): string[] {
    const explanation: string[] = [];
    explanation.push(`Decision readiness: ${readinessScore}% (${state.replace(/_/g, ' ').toLowerCase()})`);

    const strong = Object.entries(components).filter(([, v]) => v >= 70).map(([k]) => k.replace(/([A-Z])/g, ' $1').toLowerCase());
    if (strong.length > 0) explanation.push(`Strengths: ${strong.join(', ')}`);

    const weak = Object.entries(components).filter(([, v]) => v < 50).map(([k]) => k.replace(/([A-Z])/g, ' $1').toLowerCase());
    if (weak.length > 0) explanation.push(`Areas for improvement: ${weak.join(', ')}`);

    const recText: Record<DecisionTiming, string> = {
      decide_now: 'Ready to make a decision with confidence.',
      delay: 'Consider delaying until more information is available.',
      explore: 'Explore more career options before deciding.',
      experiment: 'Run career experiments to validate preferences.',
      gather_evidence: 'Gather more evidence to reduce uncertainty.',
    };
    explanation.push(recText[recommendation]);

    return explanation;
  }

  private generateQualityExplanation(
    components: DecisionQualityAnalysis['components'],
    overallQuality: number,
    qualityLevel: DecisionQualityLevel
  ): string[] {
    const explanation: string[] = [];
    explanation.push(`Decision quality: ${overallQuality}% (${qualityLevel.replace('_', ' ')})`);

    if (components.informationQuality >= 70) explanation.push('Good information quality supports this decision.');
    else explanation.push('Information quality could be improved with more research.');

    if (components.reasoningQuality >= 70) explanation.push('Reasoning process appears sound.');
    else explanation.push('Reasoning process may benefit from structured evaluation.');

    if (components.biasInfluence >= 50) explanation.push(`Significant bias influence (${components.biasInfluence}%) may be distorting judgment.`);
    else if (components.biasInfluence >= 30) explanation.push(`Moderate bias influence (${components.biasInfluence}%) - be aware of potential distortions.`);

    if (components.uncertainty >= 50) explanation.push(`High uncertainty (${components.uncertainty}%) suggests gathering more evidence.`);

    return explanation;
  }

  private generateTimingExplanation(
    recommendation: DecisionTiming,
    readinessState: DecisionState,
    urgency: number
  ): string[] {
    const explanation: string[] = [];

    const recText: Record<DecisionTiming, string> = {
      decide_now: 'CareerOS recommends deciding now based on current readiness and quality.',
      delay: 'CareerOS recommends delaying the decision to gather more information.',
      explore: 'CareerOS recommends exploring more career options before committing.',
      experiment: 'CareerOS recommends running career experiments to validate preferences.',
      gather_evidence: 'CareerOS recommends gathering additional evidence to reduce uncertainty.',
    };
    explanation.push(recText[recommendation]);

    if (urgency >= 60) explanation.push(`Urgency level is ${urgency}% - time pressure influences this recommendation.`);
    explanation.push(`Current readiness state: ${readinessState.replace(/_/g, ' ').toLowerCase()}.`);

    return explanation;
  }

  private generateCommitmentExplanation(isAppropriate: boolean, score: number): string[] {
    const explanation: string[] = [];
    if (isAppropriate) explanation.push(`Commitment is appropriate (${score}% readiness).`);
    else explanation.push(`Commitment is not yet appropriate (${score}% readiness).`);
    return explanation;
  }

  private generateId(): string {
    return `meta-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if decision should be made now.
   */
  shouldDecideNow(analysis: MetaDecisionAnalysis): boolean {
    return (
      (analysis.readiness.state === 'READY' || analysis.readiness.state === 'HIGH_CONFIDENCE_READY') &&
      analysis.quality.overallQuality >= 60
    );
  }

  /**
   * Check if decision should be delayed.
   */
  shouldDelay(analysis: MetaDecisionAnalysis): boolean {
    return (
      analysis.readiness.state === 'NOT_READY' ||
      analysis.readiness.state === 'EXPLORING' ||
      analysis.quality.overallQuality < 50
    );
  }

  /**
   * Get authority version.
   */
  getVersion(): string {
    return '2.3.0';
  }
}

// Factory function
export function createMetaDecisionAuthority(
  config?: Partial<MetaDecisionConfig>
): IMetaDecisionAuthority {
  return new MetaDecisionAuthority(config);
}
