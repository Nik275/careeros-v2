/**
 * CareerOS Assessment Signal Engine - Assessment Engine
 *
 * Phase B.1: Assessment Processing Layer
 *
 * Orchestrates the assessment processing pipeline from responses to profile.
 *
 * Pipeline:
 * Question Response → Signal Extraction → Dimension Scoring → Confidence Calculation → StudentLifeProfile Population
 *
 * @module assessment-engine
 * @version 1.0.0
 */

import type {
  AssessmentQuestion,
  AssessmentResponse,
  AssessmentSignal,
  AssessmentConfidence,
  AssessmentConfig,
  DimensionScoreMap,
} from './assessment-types';

import type {
  StudentLifeProfile,
  CognitiveProfile,
  MotivationProfile,
  LifestyleProfile,
  RiskProfile,
  WorkEnvironmentProfile,
  ValuesProfile,
  StrengthProfile,
  WeaknessProfile,
  ConstraintsProfile,
  ConfidenceProfile,
} from '../types/student-life-profile';

import { createSignalExtractor } from './signal-extractor';
import { createDimensionScorer } from './dimension-scorer';
import { createConfidenceCalculator } from './confidence-calculator';
import {
  createAssessmentObserveHook,
  type AssessmentObserveHook,
  type AssessmentObserveHookOptions,
} from '../intelligence/orchestrator/observe/AssessmentObserveHook';

/**
 * Orchestrates assessment processing pipeline.
 *
 * The AssessmentEngine coordinates signal extraction, dimension scoring,
 * confidence calculation, and profile generation into a cohesive workflow.
 */
export class AssessmentEngine {
  private signalExtractor = createSignalExtractor();
  private dimensionScorer = createDimensionScorer();
  private confidenceCalculator: ReturnType<typeof createConfidenceCalculator>;
  private observeHook: AssessmentObserveHook;
  private readonly config?: Partial<AssessmentConfig>;

  constructor(config?: Partial<AssessmentConfig>, observeOptions?: AssessmentObserveHookOptions) {
    this.config = config ? { ...config } : undefined;
    this.confidenceCalculator = createConfidenceCalculator(config);
    this.observeHook = createAssessmentObserveHook(observeOptions);
  }

  /**
   * Process assessment responses through complete pipeline.
   *
   * @param questions - Assessment questions that were presented
   * @param responses - User's responses to questions
   * @returns Generated student profile
   */
  processResponses(
    questions: AssessmentQuestion[],
    responses: AssessmentResponse[]
  ): StudentLifeProfile {
    const signals = this.extractSignals(questions, responses);
    const dimensionScores = this.calculateDimensionScores(signals);
    const confidence = this.calculateAssessmentConfidence(signals, responses);
    const profile = this.generateStudentProfile(dimensionScores, confidence);

    this.observeHook.observeProcessResponses({
      questions,
      responses,
      productionOutput: profile,
      independentDryRunOperation: () => {
        const dryRunEngine = new AssessmentEngine(this.config);
        return dryRunEngine.processResponses(questions, responses);
      },
    });

    return profile;
  }

  /**
   * Extract signals from responses.
   *
   * @param questions - Source questions
   * @param responses - User responses
   * @returns Extracted assessment signals
   */
  extractSignals(
    questions: AssessmentQuestion[],
    responses: AssessmentResponse[]
  ): AssessmentSignal[] {
    return this.signalExtractor.extractSignals(questions, responses);
  }

  /**
   * Calculate dimension scores from signals.
   *
   * @param signals - Extracted assessment signals
   * @returns Map of dimension scores
   */
  calculateDimensionScores(signals: AssessmentSignal[]): DimensionScoreMap {
    return this.dimensionScorer.calculateDimensionScores(signals);
  }

  /**
   * Calculate assessment confidence.
   *
   * @param signals - Extracted signals
   * @param responses - Original responses
   * @returns Confidence calculation result
   */
  calculateAssessmentConfidence(
    signals: AssessmentSignal[],
    responses: AssessmentResponse[]
  ): AssessmentConfidence {
    return this.confidenceCalculator.calculateConfidence(signals, responses);
  }

  /**
   * Generate complete student profile from dimension scores.
   *
   * @param dimensionScores - Calculated dimension scores
   * @param confidence - Assessment confidence
   * @returns Populated StudentLifeProfile
   */
  generateStudentProfile(
    dimensionScores: DimensionScoreMap,
    confidence: AssessmentConfidence
  ): StudentLifeProfile {
    const getScore = (dimension: string): number => {
      return dimensionScores.get(dimension)?.score ?? 50;
    };

    const cognitive: CognitiveProfile = {
      analytical: getScore('analyticalThinking'),
      creative: getScore('creativity'),
      systematic: getScore('analyticalThinking'),
      abstractThinking: getScore('analyticalThinking'),
      verbalReasoning: getScore('socialOrientation'),
      spatialReasoning: getScore('creativity'),
      quantitativeReasoning: getScore('analyticalThinking'),
    };

    const motivation: MotivationProfile = {
      achievement: getScore('achievementDrive'),
      mastery: getScore('creativity'),
      autonomy: getScore('independence'),
      impact: getScore('socialOrientation'),
      recognition: getScore('leadership'),
      security: getScore('stabilityPreference'),
    };

    const lifestyle: LifestyleProfile = {
      workLifeBalance: getScore('stabilityPreference'),
      incomePriority: getScore('achievementDrive'),
      locationFreedom: getScore('independence'),
      travelPreference: getScore('riskTolerance'),
      stabilityPreference: getScore('stabilityPreference'),
    };

    const risk: RiskProfile = {
      careerRiskTolerance: getScore('riskTolerance'),
      financialRiskTolerance: getScore('riskTolerance'),
      uncertaintyComfort: getScore('riskTolerance'),
    };

    const workEnvironment: WorkEnvironmentProfile = {
      peopleOriented: getScore('socialOrientation'),
      independentWork: getScore('independence'),
      leadershipPreference: getScore('leadership'),
      researchPreference: getScore('creativity'),
      executionPreference: getScore('achievementDrive'),
    };

    const values: ValuesProfile = {
      money: getScore('achievementDrive'),
      prestige: getScore('leadership'),
      familyTime: getScore('stabilityPreference'),
      freedom: getScore('independence'),
      impact: getScore('socialOrientation'),
      learning: getScore('creativity'),
    };

    const strengths: StrengthProfile = {
      topStrengths: this.identifyTopStrengths(dimensionScores),
      supportingStrengths: this.identifySupportingStrengths(dimensionScores),
    };

    const weaknesses: WeaknessProfile = {
      developmentAreas: this.identifyDevelopmentAreas(dimensionScores),
      riskFactors: [],
    };

    const constraints: ConstraintsProfile = {
      financialConstraint: 30,
      geographicConstraint: 30,
      educationConstraint: 30,
      familyResponsibilityConstraint: 30,
    };

    const confidenceProfile: ConfidenceProfile = {
      profileConfidence: confidence.score,
      assessmentCompleteness: confidence.coverageScore,
    };

    return {
      cognitive,
      motivation,
      lifestyle,
      risk,
      workEnvironment,
      values,
      strengths,
      weaknesses,
      constraints,
      confidence: confidenceProfile,
    };
  }

  /**
   * Identify top strengths from dimension scores.
   */
  private identifyTopStrengths(dimensionScores: DimensionScoreMap): string[] {
    const scores = Array.from(dimensionScores.entries());
    scores.sort((a, b) => (b[1]?.score ?? 0) - (a[1]?.score ?? 0));

    const strengthMap: Record<string, string> = {
      analyticalThinking: 'Analytical Thinking',
      creativity: 'Creativity & Innovation',
      socialOrientation: 'Social Skills',
      independence: 'Independence',
      leadership: 'Leadership',
      riskTolerance: 'Risk Taking',
      achievementDrive: 'Achievement Drive',
      stabilityPreference: 'Consistency & Reliability',
    };

    return scores.slice(0, 3).map(([dimension]) => strengthMap[dimension] ?? dimension);
  }

  /**
   * Identify supporting strengths from dimension scores.
   */
  private identifySupportingStrengths(dimensionScores: DimensionScoreMap): string[] {
    const scores = Array.from(dimensionScores.entries());
    scores.sort((a, b) => (b[1]?.score ?? 0) - (a[1]?.score ?? 0));

    const strengthMap: Record<string, string> = {
      analyticalThinking: 'Logical Reasoning',
      creativity: 'Problem Solving',
      socialOrientation: 'Communication',
      independence: 'Self-Motivation',
      leadership: 'Decision Making',
      riskTolerance: 'Adaptability',
      achievementDrive: 'Goal Orientation',
      stabilityPreference: 'Attention to Detail',
    };

    return scores.slice(3, 5).map(([dimension]) => strengthMap[dimension] ?? dimension);
  }

  /**
   * Identify development areas from dimension scores.
   */
  private identifyDevelopmentAreas(dimensionScores: DimensionScoreMap): string[] {
    const scores = Array.from(dimensionScores.entries());
    scores.sort((a, b) => (a[1]?.score ?? 100) - (b[1]?.score ?? 100));

    const developmentMap: Record<string, string> = {
      analyticalThinking: 'Structured Analysis',
      creativity: 'Creative Thinking',
      socialOrientation: 'Interpersonal Skills',
      independence: 'Self-Direction',
      leadership: 'Leadership Skills',
      riskTolerance: 'Comfort with Uncertainty',
      achievementDrive: 'Drive & Ambition',
      stabilityPreference: 'Adaptability to Change',
    };

    return scores.slice(0, 2).map(([dimension]) => developmentMap[dimension] ?? dimension);
  }
}

/**
 * Factory function for AssessmentEngine.
 */
export function createAssessmentEngine(
  config?: Partial<AssessmentConfig>,
  observeOptions?: AssessmentObserveHookOptions
): AssessmentEngine {
  return new AssessmentEngine(config, observeOptions);
}

export { createSignalExtractor, createDimensionScorer, createConfidenceCalculator };
