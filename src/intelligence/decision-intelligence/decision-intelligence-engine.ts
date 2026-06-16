/**
 * Decision Intelligence Engine
 *
 * Phase 8.5: Decision Intelligence Engine - Part 9
 *
 * Master orchestrator that transforms CareerOS from a recommendation engine
 * into a career decision-making intelligence system.
 *
 * @module decision-intelligence-engine
 * @version 1.0.0
 */

import {
  DecisionId,
  DecisionInput,
  DecisionAnalysis,
  DecisionIntelligenceReport,
  DecisionSummary,
  DecisionReadiness,
  PathRecommendation,
  PathType,
  DecisionEngineConfig,
  DecisionTelemetry,
  DecisionOption,
  OptionalityAnalysis,
  RegretProfile,
  RiskProfile,
  TradeoffAnalysis,
  DecisionReversibility,
  ScenarioComparison,
  ExperimentSuggestion,
} from './decision-types';
import { DEFAULT_DECISION_ENGINE_CONFIG, calculateAggregateProjectionScore } from './decision-model';
import { TradeoffEngine, createTradeoffEngine } from './tradeoff-engine';
import { RegretEngine, createRegretEngine } from './regret-engine';
import { OptionalityEngine, createOptionalityEngine } from './optionality-engine';
import { ReversibilityEngine, createReversibilityEngine } from './reversibility-engine';
import { RiskEngine, createRiskEngine } from './risk-engine';
import { ScenarioEngine, createScenarioEngine } from './scenario-engine';

export type DecisionInputValidationCode = 'EMPTY_DECISION_OPTIONS';

export interface DecisionInputValidationDetails {
  field: 'options';
  decisionId?: DecisionId;
  studentId?: string;
  optionCount: number;
}

export class DecisionInputValidationError extends Error {
  readonly code: DecisionInputValidationCode;
  readonly details: DecisionInputValidationDetails;

  constructor(message: string, details: DecisionInputValidationDetails) {
    super(message);
    this.name = 'DecisionInputValidationError';
    this.code = 'EMPTY_DECISION_OPTIONS';
    this.details = details;
  }
}

type NonEmptyArray<T> = [T, ...T[]];

type ValidatedDecisionInput = DecisionInput & {
  options: NonEmptyArray<DecisionOption>;
};

type DecisionOptionAnalysis = {
  option: DecisionOption;
  optionality: OptionalityAnalysis;
  reversibility: DecisionReversibility;
  risks: RiskProfile;
  scenarios: ScenarioComparison;
};

/**
 * Decision Intelligence Engine
 */
export class DecisionIntelligenceEngine {
  private tradeoffEngine: TradeoffEngine;
  private regretEngine: RegretEngine;
  private optionalityEngine: OptionalityEngine;
  private reversibilityEngine: ReversibilityEngine;
  private riskEngine: RiskEngine;
  private scenarioEngine: ScenarioEngine;
  private config: DecisionEngineConfig;

  constructor(config?: Partial<DecisionEngineConfig>) {
    this.config = { ...DEFAULT_DECISION_ENGINE_CONFIG, ...config };
    
    this.tradeoffEngine = createTradeoffEngine(this.config.tradeoff);
    this.regretEngine = createRegretEngine(this.config.regret);
    this.optionalityEngine = createOptionalityEngine(this.config.optionality);
    this.reversibilityEngine = createReversibilityEngine();
    this.riskEngine = createRiskEngine(this.config.risk);
    this.scenarioEngine = createScenarioEngine(this.config.scenario);
  }

  /**
   * Perform complete decision analysis
   */
  analyze(input: DecisionInput): DecisionAnalysis {
    this.validateDecisionInput(input);

    const startTime = Date.now();
    const analysisId = this.generateAnalysisId();

    // Run all analyses
    const tradeoffs = this.tradeoffEngine.analyzeTradeoffs(input);
    
    // Analyze each option
    const optionAnalyses = input.options.map(option => ({
      option,
      optionality: this.optionalityEngine.analyzeOptionality(input, option),
      reversibility: this.reversibilityEngine.assessReversibility(input, option),
      risks: this.riskEngine.calculateRiskProfile(input, option),
      scenarios: this.scenarioEngine.generateScenarios(input, option),
    })) as NonEmptyArray<DecisionOptionAnalysis>;

    // Calculate regret for the decision as a whole
    const regret = this.regretEngine.calculateRegretProfile(input);

    // Generate path recommendations
    const pathRecommendations = this.generatePathRecommendations(input, optionAnalyses);
    const primaryRecommendation = pathRecommendations[0];

    // Calculate decision readiness
    const decisionReadiness = this.assessDecisionReadiness(input, pathRecommendations);

    // Generate explanations
    const summary = this.generateSummary(input, primaryRecommendation, tradeoffs);
    const detailedExplanation = this.generateDetailedExplanation(
      input,
      pathRecommendations,
      tradeoffs,
      regret
    );
    const studentExplanation = this.generateStudentExplanation(
      input,
      primaryRecommendation,
      tradeoffs,
      regret
    );
    const mentorGuidance = this.generateMentorGuidance(
      input,
      primaryRecommendation,
      decisionReadiness,
      tradeoffs,
      regret
    );

    // Build telemetry
    const telemetry: DecisionTelemetry = {
      decisionId: analysisId,
      analysisDuration: Date.now() - startTime,
      complexityScore: this.calculateComplexityScore(input),
      confidence: primaryRecommendation?.confidence ?? 0,
      tradeoffsDetected: tradeoffs.detectedTradeoffs.length,
      risksIdentified: optionAnalyses.reduce((sum, oa) => sum + oa.risks.assessments.length, 0),
      scenariosGenerated: optionAnalyses.reduce((sum, oa) => sum + oa.scenarios.scenarios.length, 0),
      timestamp: new Date(),
    };

    return {
      id: analysisId,
      input,
      timestamp: new Date(),
      tradeoffs,
      regret,
      optionality: this.selectBestOptionality(optionAnalyses),
      reversibility: this.selectBestReversibility(optionAnalyses),
      risks: this.selectBestRisks(optionAnalyses),
      scenarios: this.selectBestScenarios(optionAnalyses),
      pathRecommendations,
      primaryRecommendation,
      decisionConfidence: primaryRecommendation?.confidence ?? 0,
      decisionReadiness: decisionReadiness.status,
      urgencyAssessment: input.context.personalCircumstances.some(c => c.includes('urgent'))
        ? 'HIGH'
        : 'MODERATE',
      summary,
      detailedExplanation,
      mentorGuidance,
      studentExplanation,
      nextSteps: this.generateNextSteps(decisionReadiness, pathRecommendations),
      informationGaps: decisionReadiness.missingInformation,
      experiments: this.generateExperiments(input, pathRecommendations),
    };
  }

  /**
   * Generate comprehensive decision intelligence report
   */
  generateReport(input: DecisionInput): DecisionIntelligenceReport {
    const analysis = this.analyze(input);

    return {
      id: analysis.id,
      studentId: input.studentId,
      generatedAt: analysis.timestamp,
      keyDecision: this.summarizeDecision(input),
      majorTradeoffs: analysis.tradeoffs,
      riskAnalysis: analysis.risks,
      optionalityAnalysis: analysis.optionality,
      regretAnalysis: analysis.regret,
      futureScenarios: analysis.scenarios,
      decisionRecommendation: analysis.primaryRecommendation,
      alternativePaths: analysis.pathRecommendations.slice(1),
      confidence: analysis.decisionConfidence,
      readiness: {
        status: analysis.decisionReadiness,
        missingInformation: analysis.informationGaps,
        recommendedPreparation: analysis.nextSteps,
      },
      executiveSummary: analysis.summary,
      detailedAnalysis: analysis.detailedExplanation,
      mentorTalkingPoints: this.generateMentorTalkingPoints(analysis),
      studentFacingExplanation: analysis.studentExplanation,
      immediateActions: analysis.nextSteps.slice(0, 3),
      mediumTermActions: analysis.nextSteps.slice(3, 6),
      longTermConsiderations: analysis.nextSteps.slice(6),
    };
  }

  /**
   * Quick decision check
   */
  quickCheck(input: DecisionInput): {
    recommendation: string;
    confidence: number;
    keyTradeoff: string | null;
    riskLevel: string;
  } {
    this.validateDecisionInput(input);

    const tradeoffs = this.tradeoffEngine.analyzeTradeoffs(input);
    
    // Quick option scoring
    const optionScores = input.options.map(option => {
      const reversibility = this.reversibilityEngine.assessReversibility(input, option);
      const quickRisk = this.riskEngine.calculateRiskProfile(input, option);
      
      const score = 
        reversibility.score * 0.3 +
        (100 - quickRisk.overallRisk) * 0.4 +
        (option.careerId ? 70 : 50) * 0.3;
      
      return { option, score };
    });

    const best = optionScores.reduce((max, current) =>
      current.score > max.score ? current : max
    );

    return {
      recommendation: best.option.label,
      confidence: Math.round(best.score),
      keyTradeoff: tradeoffs.primaryConflict?.type ?? null,
      riskLevel: best.score > 70 ? 'LOW' : best.score > 50 ? 'MODERATE' : 'HIGH',
    };
  }

  /**
   * Generate path recommendations
   */
  private generatePathRecommendations(
    input: DecisionInput,
    optionAnalyses: NonEmptyArray<DecisionOptionAnalysis>
  ): NonEmptyArray<PathRecommendation> {

    // Recommended path (balanced)
    const balanced = this.findBalancedOption(optionAnalyses);
    const primaryRecommendation: PathRecommendation = {
      pathType: 'RECOMMENDED',
      optionId: balanced.option.id,
      optionLabel: balanced.option.label,
      confidence: this.calculatePathConfidence(balanced),
      rationale: `Balanced across risk, optionality, and fit.`,
      fitScore: balanced.scenarios.mostLikely.projections.studentFit,
    };
    const recommendations: NonEmptyArray<PathRecommendation> = [primaryRecommendation];

    // Best long-term outcome
    const bestLongTerm = this.findBestLongTerm(optionAnalyses);
    if (bestLongTerm.option.id !== balanced.option.id) {
      recommendations.push({
        pathType: 'BEST_LONG_TERM',
        optionId: bestLongTerm.option.id,
        optionLabel: bestLongTerm.option.label,
        confidence: this.calculatePathConfidence(bestLongTerm),
        rationale: `Highest projected long-term value.`,
        fitScore: bestLongTerm.scenarios.mostLikely.projections.studentFit,
      });
    }

    // Highest optionality
    const highestOptionality = this.findHighestOptionality(optionAnalyses);
    if (highestOptionality.option.id !== balanced.option.id) {
      recommendations.push({
        pathType: 'HIGHEST_OPTIONALITY',
        optionId: highestOptionality.option.id,
        optionLabel: highestOptionality.option.label,
        confidence: this.calculatePathConfidence(highestOptionality),
        rationale: `Preserves maximum future flexibility.`,
        fitScore: highestOptionality.scenarios.mostLikely.projections.studentFit,
      });
    }

    // Lowest regret
    const lowestRegret = this.findLowestRegret(optionAnalyses);
    if (lowestRegret.option.id !== balanced.option.id) {
      recommendations.push({
        pathType: 'LOWEST_REGRET',
        optionId: lowestRegret.option.id,
        optionLabel: lowestRegret.option.label,
        confidence: this.calculatePathConfidence(lowestRegret),
        rationale: `Minimizes future regret risk.`,
        fitScore: lowestRegret.scenarios.mostLikely.projections.studentFit,
      });
    }

    // Safest path
    const safest = this.findSafest(optionAnalyses);
    if (safest.option.id !== balanced.option.id) {
      recommendations.push({
        pathType: 'SAFEST',
        optionId: safest.option.id,
        optionLabel: safest.option.label,
        confidence: this.calculatePathConfidence(safest),
        rationale: `Lowest risk profile.`,
        fitScore: safest.scenarios.mostLikely.projections.studentFit,
      });
    }

    // Sort by confidence
    recommendations.sort((a, b) => b.confidence - a.confidence);

    return recommendations;
  }

  /**
   * Find balanced option
   */
  private findBalancedOption(
    optionAnalyses: NonEmptyArray<DecisionOptionAnalysis>
  ): DecisionOptionAnalysis {
    return optionAnalyses.reduce((best, current) => {
      const bestScore = this.calculateBalancedScore(best);
      const currentScore = this.calculateBalancedScore(current);
      return currentScore > bestScore ? current : best;
    });
  }

  /**
   * Calculate balanced score
   */
  private calculateBalancedScore(analysis: {
    option: DecisionOption;
    optionality: OptionalityAnalysis;
    reversibility: DecisionReversibility;
    risks: RiskProfile;
    scenarios: ScenarioComparison;
  }): number {
    return (
      analysis.optionality.score * 0.2 +
      analysis.reversibility.score * 0.15 +
      (100 - analysis.risks.overallRisk) * 0.25 +
      analysis.scenarios.mostLikely.projections.studentFit * 0.3 +
      (100 - analysis.scenarios.mostLikely.projections.regretRisk) * 0.1
    );
  }

  /**
   * Find best long-term option
   */
  private findBestLongTerm(
    optionAnalyses: NonEmptyArray<DecisionOptionAnalysis>
  ): DecisionOptionAnalysis {
    return optionAnalyses.reduce((best, current) => {
      const bestScore = calculateAggregateProjectionScore(best.scenarios.mostLikely.projections);
      const currentScore = calculateAggregateProjectionScore(current.scenarios.mostLikely.projections);
      return currentScore > bestScore ? current : best;
    });
  }

  /**
   * Find highest optionality
   */
  private findHighestOptionality(
    optionAnalyses: NonEmptyArray<DecisionOptionAnalysis>
  ): DecisionOptionAnalysis {
    return optionAnalyses.reduce((best, current) =>
      current.optionality.score > best.optionality.score ? current : best
    );
  }

  /**
   * Find lowest regret
   */
  private findLowestRegret(
    optionAnalyses: NonEmptyArray<DecisionOptionAnalysis>
  ): DecisionOptionAnalysis {
    return optionAnalyses.reduce((best, current) =>
      current.scenarios.mostLikely.projections.regretRisk <
      best.scenarios.mostLikely.projections.regretRisk
        ? current
        : best
    );
  }

  /**
   * Find safest option
   */
  private findSafest(
    optionAnalyses: NonEmptyArray<DecisionOptionAnalysis>
  ): DecisionOptionAnalysis {
    return optionAnalyses.reduce((best, current) =>
      current.risks.overallRisk < best.risks.overallRisk ? current : best
    );
  }

  /**
   * Calculate path confidence
   */
  private calculatePathConfidence(analysis: {
    option: DecisionOption;
    optionality: OptionalityAnalysis;
    reversibility: DecisionReversibility;
    risks: RiskProfile;
    scenarios: ScenarioComparison;
  }): number {
    return Math.round(
      analysis.optionality.score * 0.2 +
        (100 - analysis.risks.overallRisk) * 0.3 +
        analysis.scenarios.mostLikely.projections.studentFit * 0.3 +
        (100 - analysis.scenarios.mostLikely.projections.regretRisk) * 0.2
    );
  }

  /**
   * Assess decision readiness
   */
  private assessDecisionReadiness(
    input: DecisionInput,
    recommendations: PathRecommendation[]
  ): DecisionReadiness {
    const missingInfo: string[] = [];

    // Check for missing information
    if (input.options.length < 2) {
      missingInfo.push('Need at least 2 options to compare');
    }

    if (input.context.values.length === 0) {
      missingInfo.push('Values not clearly articulated');
    }

    if (recommendations.length === 0) {
      missingInfo.push('Unable to generate recommendations');
    }

    // Determine status
    let status: DecisionReadiness['status'];
    if (missingInfo.length === 0 && recommendations[0]?.confidence > 70) {
      status = 'READY';
    } else if (missingInfo.length <= 2 && recommendations[0]?.confidence > 50) {
      status = 'NEEDS_MORE_INFO';
    } else if (missingInfo.length <= 3) {
      status = 'NEEDS_TIME';
    } else {
      status = 'NOT_READY';
    }

    return {
      status,
      missingInformation: missingInfo,
      recommendedPreparation: missingInfo.map((m) => `Clarify: ${m}`),
    };
  }

  /**
   * Generate summary
   */
  private generateSummary(
    input: DecisionInput,
    primary: PathRecommendation | undefined,
    tradeoffs: TradeoffAnalysis
  ): string {
    if (!primary) {
      return `No options available to analyze for your ${input.type} decision. Please add at least one option to proceed with the analysis.`;
    }

    let summary = `Based on your profile and priorities, the ${primary.optionLabel} path appears most aligned. `;

    if (tradeoffs.primaryConflict) {
      summary += `However, there's a significant tension between ${tradeoffs.primaryConflict.dimensionA} and ${tradeoffs.primaryConflict.dimensionB} that deserves attention. `;
    }

    summary += `This recommendation has ${primary.confidence}% confidence.`;

    return summary;
  }

  /**
   * Generate detailed explanation
   */
  private generateDetailedExplanation(
    input: DecisionInput,
    recommendations: PathRecommendation[],
    tradeoffs: TradeoffAnalysis,
    regret: RegretProfile
  ): string {
    let explanation = `## Decision Analysis\n\n`;

    if (recommendations.length === 0) {
      explanation += `### No Options Available\n`;
      explanation += `Please add at least one option to analyze your ${input.type} decision.\n\n`;
      return explanation;
    }

    explanation += `### Primary Recommendation\n`;
    explanation += `${recommendations[0].optionLabel}: ${recommendations[0].rationale}\n\n`;

    if (recommendations.length > 1) {
      explanation += `### Alternative Paths\n`;
      for (let i = 1; i < Math.min(3, recommendations.length); i++) {
        explanation += `- ${recommendations[i].optionLabel}: ${recommendations[i].rationale}\n`;
      }
      explanation += `\n`;
    }

    if (tradeoffs.detectedTradeoffs.length > 0) {
      explanation += `### Key Tradeoffs\n`;
      for (const tradeoff of tradeoffs.detectedTradeoffs.slice(0, 3)) {
        explanation += `- ${tradeoff.dimensionA} vs ${tradeoff.dimensionB}: ${tradeoff.intensity}\n`;
      }
      explanation += `\n`;
    }

    explanation += `### Regret Risk\n`;
    explanation += `Overall regret risk: ${regret.overallRisk}%. `;
    explanation += `Highest concern: ${regret.strongestCategory}.\n`;

    return explanation;
  }

  /**
   * Generate student-friendly explanation
   */
  private generateStudentExplanation(
    input: DecisionInput,
    primary: PathRecommendation | undefined,
    tradeoffs: TradeoffAnalysis,
    regret: RegretProfile
  ): string {
    let explanation = `I've been thinking about your situation, and I want to share what I'm seeing.\n\n`;

    if (!primary) {
      explanation += `I don't have enough information to recommend a specific path yet. `;
      explanation += `Please add some options to your ${input.type} decision so I can analyze them for you.\n\n`;
      return explanation;
    }

    explanation += `The path that seems most aligned with who you are is **${primary.optionLabel}**. `;
    explanation += `This isn't just about what's practical—it's about what fits your values and strengths.\n\n`;

    if (tradeoffs.primaryConflict) {
      explanation += `At the same time, I'm noticing something important. `;
      explanation += tradeoffs.primaryConflict.explanation;
      explanation += `\n\n`;
      explanation += `This tension is real, and acknowledging it is the first step to navigating it well.\n\n`;
    }

    if (regret.overallRisk > 60) {
      explanation += `I also want to flag that there's a meaningful risk of future regret here, particularly around ${regret.strongestCategory.toLowerCase().replace('_', ' ')}. `;
      explanation += `The choices we make now echo forward, and some are harder to undo than others.\n\n`;
    }

    explanation += `The decision is yours, of course. But I hope this perspective helps you see the landscape more clearly.`;

    return explanation;
  }

  /**
   * Generate mentor-facing guidance for discussion and support.
   */
  private generateMentorGuidance(
    input: DecisionInput,
    primary: PathRecommendation,
    readiness: DecisionReadiness,
    tradeoffs: TradeoffAnalysis,
    regret: RegretProfile
  ): string {
    const guidance: string[] = [
      `Discuss the ${primary.optionLabel} recommendation for this ${input.type} decision and verify whether the student agrees with the ${primary.confidence}% confidence level.`,
    ];

    if (readiness.missingInformation.length > 0) {
      guidance.push(
        `Prioritize missing information: ${readiness.missingInformation.join(', ')}.`
      );
    }

    if (tradeoffs.primaryConflict) {
      guidance.push(
        `Explore the tradeoff between ${tradeoffs.primaryConflict.dimensionA} and ${tradeoffs.primaryConflict.dimensionB}; the student's awareness is ${tradeoffs.studentAwareness.toLowerCase().replace('_', ' ')}.`
      );
    }

    guidance.push(
      `Monitor regret risk around ${regret.strongestCategory.toLowerCase().replace('_', ' ')} and help the student define a small experiment before committing.`
    );

    return guidance.join(' ');
  }

  /**
   * Generate next steps
   */
  private generateNextSteps(
    readiness: DecisionReadiness,
    recommendations: PathRecommendation[]
  ): string[] {
    const steps: string[] = [];

    if (readiness.status === 'READY') {
      steps.push(`Schedule decision conversation with trusted advisor`);
      steps.push(`Document your decision rationale while it's fresh`);
      steps.push(`Identify first concrete step toward ${recommendations[0].optionLabel}`);
    } else {
      steps.push(`Gather missing information: ${readiness.missingInformation.join(', ')}`);
      steps.push(`Reflect on your core values and priorities`);
      steps.push(`Discuss options with mentors who've faced similar choices`);
    }

    steps.push(`Set a decision deadline to avoid analysis paralysis`);
    steps.push(`Plan a small experiment to test your preferred path`);

    return steps;
  }

  /**
   * Generate experiments
   */
  private generateExperiments(
    input: DecisionInput,
    recommendations: PathRecommendation[]
  ): ExperimentSuggestion[] {
    return [
      {
        name: 'Shadow Day',
        description: `Spend a day shadowing someone in ${recommendations[0]?.optionLabel ?? 'your target field'}`,
        duration: 1,
        effort: 'LOW',
        potentialInsight: 'Realistic view of daily work',
        howItReducesUncertainty: 'Replaces imagination with experience',
      },
      {
        name: 'Informational Interviews',
        description: 'Talk to 3 people who made similar decisions',
        duration: 7,
        effort: 'MEDIUM',
        potentialInsight: 'Learn from others\' hindsight',
        howItReducesUncertainty: 'Reveals blind spots and unexpected outcomes',
      },
      {
        name: 'Values Clarification',
        description: 'Rank your top 5 values and check alignment',
        duration: 1,
        effort: 'LOW',
        potentialInsight: 'Clearer sense of what matters most',
        howItReducesUncertainty: 'Provides decision criteria',
      },
    ];
  }

  /**
   * Generate mentor talking points
   */
  private generateMentorTalkingPoints(analysis: DecisionAnalysis): string[] {
    const points: string[] = [];

    points.push(`The primary recommendation is ${analysis.primaryRecommendation.optionLabel} with ${analysis.primaryRecommendation.confidence}% confidence.`);

    if (analysis.tradeoffs.primaryConflict) {
      points.push(`Key tension: ${analysis.tradeoffs.primaryConflict.dimensionA} vs ${analysis.tradeoffs.primaryConflict.dimensionB}.`);
      points.push(`Student awareness: ${analysis.tradeoffs.studentAwareness.toLowerCase().replace('_', ' ')}.`);
    }

    points.push(`Regret risk: ${analysis.regret.overallRisk}%. Watch for ${analysis.regret.strongestCategory.toLowerCase().replace('_', ' ')} issues.`);

    return points;
  }

  /**
   * Summarize decision
   */
  private summarizeDecision(input: DecisionInput): DecisionSummary {
    const stakes: DecisionSummary['stakes'] =
      input.options.length > 0 && input.options[0].financialImplications.initialCost > 500000
        ? 'LIFE_CHANGING'
        : input.options.length > 0 && input.options[0].timeCommitment.duration > 48
        ? 'SIGNIFICANT'
        : 'MODERATE';

    return {
      id: input.id,
      type: input.type,
      description: input.description,
      options: input.options.map((o) => o.label),
      stakes,
      timeline: `${input.timeline.decisionBy.toDateString()}`,
    };
  }

  /**
   * Select best optionality analysis
   */
  private selectBestOptionality(
    optionAnalyses: NonEmptyArray<{ optionality: OptionalityAnalysis }>
  ): OptionalityAnalysis {
    return optionAnalyses.reduce((best, current) =>
      current.optionality.score > best.optionality.score ? current : best
    ).optionality;
  }

  /**
   * Select best reversibility
   */
  private selectBestReversibility(
    optionAnalyses: NonEmptyArray<{ reversibility: DecisionReversibility }>
  ): DecisionReversibility {
    return optionAnalyses.reduce((best, current) =>
      current.reversibility.score > best.reversibility.score ? current : best
    ).reversibility;
  }

  /**
   * Select best risks
   */
  private selectBestRisks(
    optionAnalyses: NonEmptyArray<{ risks: RiskProfile }>
  ): RiskProfile {
    return optionAnalyses.reduce((best, current) =>
      current.risks.overallRisk < best.risks.overallRisk ? current : best
    ).risks;
  }

  /**
   * Select best scenarios
   */
  private selectBestScenarios(
    optionAnalyses: NonEmptyArray<{ scenarios: ScenarioComparison }>
  ): ScenarioComparison {
    return optionAnalyses.reduce((best, current) => {
      const bestScore = calculateAggregateProjectionScore(best.scenarios.mostLikely.projections);
      const currentScore = calculateAggregateProjectionScore(
        current.scenarios.mostLikely.projections
      );
      return currentScore > bestScore ? current : best;
    }).scenarios;
  }

  /**
   * Calculate complexity score
   */
  private calculateComplexityScore(input: DecisionInput): number {
    let score = 0;
    score += input.options.length * 5;
    score += input.context.values.length * 2;
    score += (input.contradictions?.length ?? 0) * 10;
    score += input.constraints.length * 3;
    return Math.min(100, score);
  }

  private validateDecisionInput(input: DecisionInput): asserts input is ValidatedDecisionInput {
    const optionCount = Array.isArray(input.options) ? input.options.length : 0;

    if (optionCount === 0) {
      throw new DecisionInputValidationError(
        'Decision intelligence analysis requires at least one decision option.',
        {
          field: 'options',
          decisionId: input.id,
          studentId: input.studentId,
          optionCount,
        }
      );
    }
  }

  /**
   * Generate unique analysis ID
   */
  private generateAnalysisId(): DecisionId {
    return `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` as DecisionId;
  }

  /**
   * Get current configuration
   */
  getConfig(): DecisionEngineConfig {
    return { ...this.config };
  }
}

/**
 * Factory function for creating decision intelligence engine
 */
export function createDecisionIntelligenceEngine(
  config?: Partial<DecisionEngineConfig>
): DecisionIntelligenceEngine {
  return new DecisionIntelligenceEngine(config);
}

/**
 * Analyze decision
 */
export function analyzeDecision(input: DecisionInput): DecisionAnalysis {
  const engine = createDecisionIntelligenceEngine();
  return engine.analyze(input);
}

/**
 * Generate decision report
 */
export function generateDecisionReport(input: DecisionInput): DecisionIntelligenceReport {
  const engine = createDecisionIntelligenceEngine();
  return engine.generateReport(input);
}

/**
 * Quick decision check
 */
export function quickDecisionCheck(input: DecisionInput): {
  recommendation: string;
  confidence: number;
  keyTradeoff: string | null;
  riskLevel: string;
} {
  const engine = createDecisionIntelligenceEngine();
  return engine.quickCheck(input);
}

/**
 * Is decision ready
 */
export function isDecisionReady(input: DecisionInput): {
  ready: boolean;
  missing: string[];
} {
  const engine = createDecisionIntelligenceEngine();
  const analysis = engine.analyze(input);

  return {
    ready: analysis.decisionReadiness === 'READY',
    missing: analysis.informationGaps,
  };
}
