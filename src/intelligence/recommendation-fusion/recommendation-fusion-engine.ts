/**
 * Recommendation Fusion Engine
 *
 * Master orchestrator that combines all CareerOS engines into a single
 * coherent recommendation system. Produces unified recommendations with
 * ONE confidence model, ONE reasoning chain, and ONE mentor voice.
 */

import {
  UnifiedRecommendationReport,
  FusionInputs,
  FusedRecommendation,
  PsychologyWeight,
  CareerWeight,
  MentorWeight,
  LearningWeight,
  ContradictionWeight,
  RecommendationConfidence,
  FusionTimestamp,
  FusionConfig,
  DEFAULT_FUSION_CONFIG,
  FusionEvent,
  FusionEventType,
  EngineRecommendation,
  AgreementScore,
  Weight,
  RankingResult,
} from './fusion-types';

import { PsychologyWeightEngine, PsychologyProfile, CareerPsychologyFit } from './psychology-weight-engine';
import { CareerWeightEngine, CareerFactors } from './career-weight-engine';
import { MentorWeightEngine, MentorProfile, CareerMentorFit } from './mentor-weight-engine';
import { LearningWeightEngine, LearningLoopReport, CareerLearningFit } from './learning-weight-engine';
import { ContradictionWeightEngine, ContradictionInput, CareerContradictionContext } from './contradiction-weight-engine';
import { ConfidenceFusionEngine, ConfidenceInputs } from './confidence-fusion-engine';
import { RecommendationRankingEngine, RankingInput, HistoricalRanking } from './recommendation-ranking-engine';
import { FusionExplanationEngine, ExplanationOutput } from './fusion-explanation-engine';

// ============================================================================
// CONFIGURATION
// ============================================================================

import { PsychologyWeightConfig } from './psychology-weight-engine';
import { CareerWeightConfig } from './career-weight-engine';
import { MentorWeightConfig } from './mentor-weight-engine';
import { LearningWeightConfig } from './learning-weight-engine';
import { ContradictionConfig } from './contradiction-weight-engine';
import { ConfidenceFusionConfig } from './confidence-fusion-engine';
import { RankingConfig } from './recommendation-ranking-engine';
import { ExplanationConfig } from './fusion-explanation-engine';

export interface RecommendationFusionEngineConfig extends FusionConfig {
  // Engine-specific configs
  psychologyConfig?: Partial<PsychologyWeightConfig>;
  careerConfig?: Partial<CareerWeightConfig>;
  mentorConfig?: Partial<MentorWeightConfig>;
  learningConfig?: Partial<LearningWeightConfig>;
  contradictionConfig?: Partial<ContradictionConfig>;
  confidenceConfig?: Partial<ConfidenceFusionConfig>;
  rankingConfig?: Partial<RankingConfig>;
  explanationConfig?: Partial<ExplanationConfig>;
}

// ============================================================================
// ENGINE
// ============================================================================

export class RecommendationFusionEngine {
  private config: RecommendationFusionEngineConfig;

  // Sub-engines
  private psychologyEngine: PsychologyWeightEngine;
  private careerEngine: CareerWeightEngine;
  private mentorEngine: MentorWeightEngine;
  private learningEngine: LearningWeightEngine;
  private contradictionEngine: ContradictionWeightEngine;
  private confidenceEngine: ConfidenceFusionEngine;
  private rankingEngine: RecommendationRankingEngine;
  private explanationEngine: FusionExplanationEngine;

  // Event handlers
  private eventHandlers: Array<(event: FusionEvent) => void> = [];

  constructor(config: Partial<RecommendationFusionEngineConfig> = {}) {
    this.config = { ...DEFAULT_FUSION_CONFIG, ...config };

    // Initialize sub-engines
    this.psychologyEngine = new PsychologyWeightEngine(this.config.psychologyConfig);
    this.careerEngine = new CareerWeightEngine(this.config.careerConfig);
    this.mentorEngine = new MentorWeightEngine(this.config.mentorConfig);
    this.learningEngine = new LearningWeightEngine(this.config.learningConfig);
    this.contradictionEngine = new ContradictionWeightEngine(this.config.contradictionConfig);
    this.confidenceEngine = new ConfidenceFusionEngine(this.config.confidenceConfig);
    this.rankingEngine = new RecommendationRankingEngine(this.config.rankingConfig);
    this.explanationEngine = new FusionExplanationEngine(this.config.explanationConfig);
  }

  /**
   * Generate unified recommendation report
   */
  generateReport(inputs: FusionInputs): UnifiedRecommendationReport {
    const startTime = Date.now();
    const reportId = `report-${inputs.studentId}-${Date.now()}`;

    this.emitEvent('fusion-started', inputs.studentId, { reportId });

    // Step 1: Calculate weights for each engine
    const weights = this.calculateWeights(inputs);
    this.emitEvent('weights-calculated', inputs.studentId, { weights });

    // Step 2: Process contradictions
    const contradictionResult = this.processContradictions(inputs);
    this.emitEvent('contradiction-detected', inputs.studentId, { contradictions: contradictionResult });

    // Step 3: Fuse recommendations from all engines
    const fusedRecommendations = this.fuseRecommendations(inputs, weights, contradictionResult);
    this.emitEvent('recommendations-fused', inputs.studentId, { count: fusedRecommendations.length });

    // Step 4: Calculate confidence for each recommendation
    const confidences = this.calculateConfidences(inputs, fusedRecommendations);
    this.emitEvent('confidence-calculated', inputs.studentId, { confidences });

    // Step 5: Rank recommendations
    const rankingResult = this.rankRecommendations(fusedRecommendations, confidences, inputs.studentId);
    this.emitEvent('ranking-completed', inputs.studentId, { topChoice: rankingResult.rankedRecommendations[0]?.careerName });

    // Step 6: Generate explanations
    const explainedRecommendations = this.generateExplanations(rankingResult.rankedRecommendations);
    this.emitEvent('explanation-generated', inputs.studentId, {});

    // Build final report
    const processingTime = Date.now() - startTime;

    const report: UnifiedRecommendationReport = {
      reportId,
      studentId: inputs.studentId,
      generatedAt: Date.now(),
      recommendations: explainedRecommendations,
      topRecommendation: explainedRecommendations[0],
      weights: {
        psychology: weights.psychology,
        career: weights.career,
        mentor: weights.mentor,
        learning: weights.learning,
        contradiction: weights.contradiction,
      },
      overallAssessment: {
        recommendationCount: explainedRecommendations.length,
        averageConfidence: this.calculateAverageConfidence(explainedRecommendations),
        engineAgreement: rankingResult.comparison.vsPsychologyOnly, // Use as proxy
        uncertaintyLevel: this.assessUncertaintyLevel(explainedRecommendations),
        stabilityScore: rankingResult.stability.score,
      },
      contradictionsSummary: {
        totalConflicts: contradictionResult.resolved.length + contradictionResult.flagged.length,
        resolved: contradictionResult.resolved.length,
        flagged: contradictionResult.flagged.length,
        requiresAttention: contradictionResult.requiresAttention,
      },
      nextSteps: this.generateNextSteps(explainedRecommendations[0]),
      fusionVersion: '1.0.0',
      processingTime,
    };

    this.emitEvent('fusion-completed', inputs.studentId, { reportId, processingTime });

    return report;
  }

  /**
   * Generate explanation for a specific recommendation
   */
  explainRecommendation(
    recommendation: FusedRecommendation,
    studentName?: string
  ): ExplanationOutput {
    return this.explanationEngine.generateExplanation(recommendation, { studentName });
  }

  /**
   * Compare multiple recommendations
   */
  compareRecommendations(
    recommendations: FusedRecommendation[]
  ): ReturnType<FusionExplanationEngine['generateComparisonExplanation']> {
    return this.explanationEngine.generateComparisonExplanation(recommendations);
  }

  /**
   * Get explanation for why a career was NOT recommended
   */
  explainExclusion(
    careerId: string,
    careerName: string,
    inputs: FusionInputs
  ): {
    reasons: string[];
    alternativePath: string;
  } {
    const reasons: string[] = [];

    // Check psychology fit
    const psychologyFit = this.inferPsychologyFit(careerId, inputs);
    if (psychologyFit < 0.4) {
      reasons.push(`Low psychological alignment (${Math.round(psychologyFit * 100)}% match with your profile)`);
    }

    // Check career factors
    const careerFit = this.inferCareerFit(careerId, inputs);
    if (careerFit.opportunityScore < 50) {
      reasons.push('Limited career opportunities in current market');
    }
    if (careerFit.irreversibilityScore > 80) {
      reasons.push('High commitment required with difficult reversal options');
    }

    // Check contradictions
    if (inputs.contradictionReport.valueConflicts.some(c => c.severity > 0.6)) {
      reasons.push('Potential conflicts with your core values');
    }

    const alternativePath = reasons.length > 0
      ? `Consider exploring related paths that address: ${reasons[0].toLowerCase()}`
      : 'Explore similar careers with better alignment scores';

    return { reasons, alternativePath };
  }

  /**
   * Register event handler
   */
  onEvent(handler: (event: FusionEvent) => void): void {
    this.eventHandlers.push(handler);
  }

  /**
   * Get engine configuration
   */
  getConfig(): RecommendationFusionEngineConfig {
    return { ...this.config };
  }

  /**
   * Update engine configuration
   */
  updateConfig(config: Partial<RecommendationFusionEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private calculateWeights(inputs: FusionInputs): {
    psychology: PsychologyWeight;
    career: CareerWeight;
    mentor: MentorWeight;
    learning: LearningWeight;
    contradiction: ContradictionWeight;
  } {
    // Get unique careers from all engine recommendations
    const careerIds = [...new Set(inputs.engineRecommendations.map(r => r.careerId))];

    // For demo, calculate weights for first career
    // In production, would iterate through all careers
    const firstCareerId = careerIds[0] || 'unknown';

    // Psychology weight
    const psychologyProfile: PsychologyProfile = {
      interests: inputs.psychologyProfile.interests,
      strengths: inputs.psychologyProfile.strengths,
      motivation: inputs.psychologyProfile.motivation,
      values: inputs.psychologyProfile.values,
      personality: inputs.psychologyProfile.personality,
      emotionalProfile: inputs.psychologyProfile.emotionalProfile,
    };

    const psychologyFit: CareerPsychologyFit = {
      careerId: firstCareerId,
      careerName: inputs.engineRecommendations.find(r => r.careerId === firstCareerId)?.careerName || firstCareerId,
      interestAlignment: 0.7,
      strengthAlignment: 0.6,
      motivationAlignment: 0.75,
      valueAlignment: 0.8,
      personalityAlignment: 0.65,
      emotionalFit: 0.7,
    };

    const psychologyWeight = this.psychologyEngine.calculateWeight(psychologyProfile, psychologyFit);

    // Career weight
    const careerFactors: CareerFactors = {
      careerId: firstCareerId,
      careerName: inputs.engineRecommendations.find(r => r.careerId === firstCareerId)?.careerName || firstCareerId,
      opportunityScore: inputs.careerGraphReport.futureOpportunityRanking.find(r => r.nodeId === firstCareerId)?.score || 70,
      opportunityDetails: { nearTerm: 75, mediumTerm: 70, longTerm: 65 },
      optionalityScore: inputs.careerGraphReport.optionalityRanking.find(r => r.nodeId === firstCareerId)?.score || 60,
      futureOptions: 5,
      pivotPossibilities: ['option1', 'option2'],
      irreversibilityScore: inputs.careerGraphReport.reversibilityRanking.find(r => r.nodeId === firstCareerId)?.reversibilityScore || 50,
      reversibleWithin: { oneYear: 0.3, threeYears: 0.5, fiveYears: 0.7 },
      futureDemand: 75,
      demandTrend: 'growing',
      demandGrowthRate: 8,
      graphRank: 2,
      pathQuality: 0.8,
      riskLevel: 'medium',
      marketDataRecency: new Date(),
    };

    const careerWeight = this.careerEngine.calculateWeight(careerFactors);

    // Mentor weight
    const mentorProfile: MentorProfile = {
      observedPatterns: inputs.mentorProfile.observedPatterns.map(p => ({
        pattern: p.pattern,
        description: `Pattern: ${p.pattern}`,
        frequency: p.frequency,
        confidence: p.confidence,
        supportingEvidence: [],
      })),
      historicalMistakes: inputs.mentorProfile.historicalMistakes.map(m => ({
        mistake: m.mistake,
        lesson: m.lesson,
        frequency: m.frequency,
        severity: 'medium',
        context: '',
      })),
      recurringThemes: inputs.mentorProfile.recurringThemes,
      decisionQuality: inputs.mentorProfile.decisionQuality,
      totalStudentsMentored: 100,
      yearsOfExperience: 5,
    };

    const mentorFit: CareerMentorFit = {
      careerId: firstCareerId,
      careerName: careerFactors.careerName,
      matchingPatterns: [{ pattern: 'pattern1', relevance: 0.7, insight: 'Strong pattern match' }],
      relevantLessons: [{ lesson: 'lesson1', relevance: 0.6, warning: 'Watch for this' }],
      themeAlignment: [{ theme: 'theme1', alignment: 0.75 }],
      careerSpecificQuality: 0.8,
    };

    const mentorWeight = this.mentorEngine.calculateWeight(mentorProfile, mentorFit);

    // Learning weight
    const learningReport: LearningLoopReport = {
      populationOutcomes: inputs.learningLoopReport.populationOutcomes.map(o => ({
        careerId: o.careerId,
        successRate: o.successRate,
        sampleSize: o.sampleSize,
        avgSatisfaction: 0.7,
        avgIncomePercentile: 60,
        outcomeDate: new Date(),
      })),
      historicalSuccess: inputs.learningLoopReport.historicalSuccess.map(s => ({
        pattern: s.pattern,
        careerId: firstCareerId,
        successRate: s.successRate,
        sampleSize: s.sampleSize,
        timeRange: s.timeRange,
      })),
      failurePatterns: inputs.learningLoopReport.failurePatterns.map(f => ({
        pattern: f,
        careerId: firstCareerId,
        failureRate: 0.3,
        commonCauses: [],
        warningSigns: [],
        preventable: true,
      })),
      recommendationEffectiveness: inputs.learningLoopReport.recommendationEffectiveness,
      totalRecommendationsTracked: inputs.learningLoopReport.totalRecommendationsTracked,
      dataLastUpdated: inputs.learningLoopReport.dataLastUpdated,
    };

    const learningFit: CareerLearningFit = {
      careerId: firstCareerId,
      careerName: careerFactors.careerName,
      populationOutcome: learningReport.populationOutcomes.find(o => o.careerId === firstCareerId),
      matchingSuccessPatterns: [{ pattern: 'success1', relevance: 0.7 }],
      matchingFailurePatterns: [],
      similarProfileEffectiveness: 0.75,
    };

    const learningWeight = this.learningEngine.calculateWeight(learningReport, learningFit);

    // Contradiction weight
    const contradictionInput: ContradictionInput = {
      valueConflicts: inputs.contradictionReport.valueConflicts.map(c => ({
        value1: c.value1,
        value2: c.value2,
        severity: c.severity,
        context: '',
      })),
      goalConflicts: inputs.contradictionReport.goalConflicts.map(c => ({
        goal1: c.goal1,
        goal2: c.goal2,
        severity: c.severity,
        timeframe: 'medium',
      })),
      identityConflicts: inputs.contradictionReport.identityConflicts.map(c => ({
        aspect1: c.aspect1,
        aspect2: c.aspect2,
        severity: c.severity,
        description: '',
      })),
      familyPressure: {
        detected: inputs.contradictionReport.familyPressure.detected,
        severity: inputs.contradictionReport.familyPressure.severity,
        source: [],
        expectation: '',
        studentDesire: '',
      },
    };

    const careerContext: CareerContradictionContext = {
      careerId: firstCareerId,
      careerName: careerFactors.careerName,
      supportedValues: inputs.psychologyProfile.values.slice(0, 3),
      supportedGoals: inputs.goals.mediumTerm.slice(0, 2),
      identityAlignment: [],
      familyApproval: 0.6,
    };

    const contradictionWeight = this.contradictionEngine.calculateWeight(contradictionInput, careerContext);

    return {
      psychology: psychologyWeight,
      career: careerWeight,
      mentor: mentorWeight,
      learning: learningWeight,
      contradiction: contradictionWeight,
    };
  }

  private processContradictions(inputs: FusionInputs): ReturnType<ContradictionWeightEngine['resolveContradictions']> {
    const contradictionInput: ContradictionInput = {
      valueConflicts: inputs.contradictionReport.valueConflicts.map(c => ({
        value1: c.value1,
        value2: c.value2,
        severity: c.severity,
        context: '',
      })),
      goalConflicts: inputs.contradictionReport.goalConflicts.map(c => ({
        goal1: c.goal1,
        goal2: c.goal2,
        severity: c.severity,
        timeframe: 'medium',
      })),
      identityConflicts: inputs.contradictionReport.identityConflicts.map(c => ({
        aspect1: c.aspect1,
        aspect2: c.aspect2,
        severity: c.severity,
        description: '',
      })),
      familyPressure: {
        detected: inputs.contradictionReport.familyPressure.detected,
        severity: inputs.contradictionReport.familyPressure.severity,
        source: [],
        expectation: '',
        studentDesire: '',
      },
    };

    return this.contradictionEngine.resolveContradictions(contradictionInput);
  }

  private fuseRecommendations(
    inputs: FusionInputs,
    weights: ReturnType<RecommendationFusionEngine['calculateWeights']>,
    contradictions: ReturnType<RecommendationFusionEngine['processContradictions']>
  ): Array<Omit<FusedRecommendation, 'recommendationId' | 'rank' | 'finalScore' | 'explanation' | 'generatedAt'>> {
    const careerIds = [...new Set(inputs.engineRecommendations.map(r => r.careerId))];

    return careerIds.map(careerId => {
      const careerRecommendations = inputs.engineRecommendations.filter(r => r.careerId === careerId);
      const careerName = careerRecommendations[0]?.careerName || careerId;

      // Calculate fused score
      let fusedScore = 0;
      const engineContributions: FusedRecommendation['engineContributions'] = [];

      for (const rec of careerRecommendations) {
        const weight = this.getEngineWeight(rec.engineId, weights);
        const contribution = rec.score * weight;
        fusedScore += contribution;

        engineContributions.push({
          engineId: rec.engineId,
          rawScore: rec.score,
          weight,
          contribution,
        });
      }

      // Apply contradiction adjustment
      if (contradictions.requiresAttention) {
        fusedScore *= 0.9;
      }

      // Mock data for other fields (in production, would come from actual engines)
      return {
        careerId,
        careerName,
        confidence: {} as RecommendationConfidence, // Will be calculated later
        evidence: {
          psychology: { contributes: true, strength: weights.psychology.totalWeight, keyFactors: [] },
          career: { contributes: true, strength: weights.career.totalWeight, keyFactors: [] },
          mentor: { contributes: true, strength: weights.mentor.totalWeight, keyFactors: [] },
          learning: { contributes: true, strength: weights.learning.totalWeight, keyFactors: [] },
        },
        risks: [],
        opportunityCost: {
          sacrificedOptions: [],
          estimatedValue: 50,
          reversibility: 0.6,
        },
        optionality: {
          futureOptions: 5,
          pivotPossibilities: [],
          optionalityScore: 60,
        },
        reversibility: {
          score: 0.6,
          reversalDifficulty: 'moderate',
          estimatedCost: 'moderate',
        },
        engineContributions,
        contradictions: {
          detected: contradictions.totalConflicts > 0,
          conflicts: contradictions.flagged.map(f => ({
            type: f.type,
            description: f.description,
            resolution: 'flagged',
          })),
        },
      };
    });
  }

  private calculateConfidences(
    inputs: FusionInputs,
    fusedRecommendations: Array<Omit<FusedRecommendation, 'recommendationId' | 'rank' | 'finalScore' | 'explanation' | 'generatedAt'>>
  ): Map<string, RecommendationConfidence> {
    const confidences = new Map<string, RecommendationConfidence>();

    for (const rec of fusedRecommendations) {
      const confidenceInputs: ConfidenceInputs = {
        careerId: rec.careerId,
        careerName: rec.careerName,
        engineRecommendations: inputs.engineRecommendations.filter(r => r.careerId === rec.careerId),
        evidenceQuality: {
          psychology: rec.evidence.psychology.strength,
          career: rec.evidence.career.strength,
          mentor: rec.evidence.mentor.strength,
          learning: rec.evidence.learning.strength,
          overall: (rec.evidence.psychology.strength + rec.evidence.career.strength + rec.evidence.mentor.strength + rec.evidence.learning.strength) / 4,
        },
        historicalValidation: {
          similarOutcomes: inputs.learningLoopReport.populationOutcomes.find(o => o.careerId === rec.careerId)?.sampleSize || 0,
          successRate: inputs.learningLoopReport.populationOutcomes.find(o => o.careerId === rec.careerId)?.successRate || 0.5,
          sampleSize: inputs.learningLoopReport.populationOutcomes.find(o => o.careerId === rec.careerId)?.sampleSize || 0,
          lastValidated: inputs.learningLoopReport.dataLastUpdated,
        },
        uncertaintyFactors: [],
        engineWeights: {
          psychology: 0.25,
          career: 0.25,
          mentor: 0.20,
          learning: 0.20,
          contradiction: 0.10,
        },
      };

      const confidence = this.confidenceEngine.calculateConfidence(confidenceInputs);
      confidences.set(rec.careerId, confidence);
    }

    return confidences;
  }

  private rankRecommendations(
    fusedRecommendations: Array<Omit<FusedRecommendation, 'recommendationId' | 'rank' | 'finalScore' | 'explanation' | 'generatedAt'>>,
    confidences: Map<string, RecommendationConfidence>,
    studentId: string
  ): RankingResult {
    const rankingInputs: RankingInput[] = fusedRecommendations.map(rec => ({
      careerId: rec.careerId,
      careerName: rec.careerName,
      fusedScore: rec.engineContributions.reduce((sum, e) => sum + e.contribution, 0) * 100,
      confidence: confidences.get(rec.careerId)!,
      engineContributions: rec.engineContributions,
      risks: rec.risks,
      opportunityCost: rec.opportunityCost,
      optionality: rec.optionality,
      reversibility: rec.reversibility,
      contradictions: rec.contradictions,
      category: rec.careerId.split('-')[0] || 'general',
    }));

    const history = this.rankingEngine.getRankingHistory(studentId);

    return this.rankingEngine.rankRecommendations(rankingInputs, {
      previousRankings: history,
    });
  }

  private generateExplanations(recommendations: FusedRecommendation[]): FusedRecommendation[] {
    return recommendations.map(rec => {
      const explanation = this.explanationEngine.generateExplanation(rec);

      return {
        ...rec,
        explanation: {
          summary: explanation.summary,
          detailedReasoning: explanation.keyPoints,
          keyInsights: explanation.keyPoints,
          warnings: explanation.riskExplanation ? [explanation.riskExplanation] : [],
        },
      };
    });
  }

  private getEngineWeight(engineId: string, weights: ReturnType<RecommendationFusionEngine['calculateWeights']>): Weight {
    switch (engineId) {
      case 'psychology':
        return weights.psychology.totalWeight;
      case 'career':
        return weights.career.totalWeight;
      case 'mentor':
        return weights.mentor.totalWeight;
      case 'learning':
        return weights.learning.totalWeight;
      default:
        return 0.2;
    }
  }

  private inferPsychologyFit(careerId: string, inputs: FusionInputs): Weight {
    // Infer from available data
    return 0.5;
  }

  private inferCareerFit(careerId: string, inputs: FusionInputs): { opportunityScore: number; irreversibilityScore: number } {
    const opportunity = inputs.careerGraphReport.futureOpportunityRanking.find(r => r.nodeId === careerId);
    const reversibility = inputs.careerGraphReport.reversibilityRanking.find(r => r.nodeId === careerId);

    return {
      opportunityScore: opportunity?.score || 50,
      irreversibilityScore: reversibility?.reversibilityScore || 50,
    };
  }

  private calculateAverageConfidence(recommendations: FusedRecommendation[]): number {
    if (recommendations.length === 0) return 0;
    return Math.round(
      recommendations.reduce((sum, r) => sum + r.confidence.overallConfidence, 0) / recommendations.length
    );
  }

  private assessUncertaintyLevel(recommendations: FusedRecommendation[]): 'low' | 'medium' | 'high' {
    const avgConfidence = this.calculateAverageConfidence(recommendations);
    if (avgConfidence >= 70) return 'low';
    if (avgConfidence >= 50) return 'medium';
    return 'high';
  }

  private generateNextSteps(topRecommendation: FusedRecommendation | undefined): string[] {
    if (!topRecommendation) {
      return ['Complete your profile to receive personalized recommendations'];
    }

    return [
      `Research ${topRecommendation.careerName} in more detail`,
      'Schedule informational interviews with professionals in this field',
      'Review the identified risks and mitigation strategies',
      'Discuss this recommendation with a career counselor',
    ];
  }

  private emitEvent(type: FusionEventType, studentId: string, data: Record<string, unknown>): void {
    const event: FusionEvent = {
      type,
      timestamp: Date.now(),
      studentId,
      data,
    };

    for (const handler of this.eventHandlers) {
      handler(event);
    }
  }
}

export default RecommendationFusionEngine;
