/**
 * Founder Intelligence V2 - Main Engine
 *
 * Comprehensive founder potential assessment engine that coordinates:
 * - Dimension scoring across 8 core dimensions
 * - False positive protection against non-founder profiles
 * - Founder type classification
 * - Market fit assessment
 * - Risk profiling
 * - Explanation generation
 * - Development roadmap creation
 *
 * Usage:
 * ```typescript
 * const engine = createFounderIntelligenceEngineV2();
 * const analysis = engine.analyze(input);
 * ```
 *
 * @module intelligence/founder-intelligence-v2
 */

import {
  FounderAnalysisInputV2,
  FounderPotentialAnalysisV2,
  FounderDimensionV2,
  DimensionScoreV2,
  FounderReadinessV2,
  FounderEngineConfigV2,
  DEFAULT_FOUNDER_ENGINE_CONFIG,
  calculateReadinessV2,
} from './types';

import {
  DimensionScoringEngineV2,
  createDimensionScoringEngineV2,
} from './DimensionScoringEngine';

import {
  FalsePositiveProtectionEngineV2,
  createFalsePositiveProtectionEngineV2,
} from './FalsePositiveProtectionEngine';

import {
  FounderClassificationEngineV2,
  createFounderClassificationEngineV2,
} from './FounderClassificationEngine';

import {
  FounderMarketFitEngineV2,
  createFounderMarketFitEngineV2,
} from './FounderMarketFitEngine';

import {
  FounderRiskProfileEngineV2,
  createFounderRiskProfileEngineV2,
} from './FounderRiskProfileEngine';

import {
  FounderExplanationEngineV2,
  createFounderExplanationEngineV2,
} from './FounderExplanationEngine';

import {
  FounderRoadmapEngineV2,
  createFounderRoadmapEngineV2,
} from './FounderRoadmapEngine';

/**
 * Configuration for the main founder intelligence engine.
 */
export interface FounderIntelligenceEngineConfigV2 {
  /** Dimension scoring configuration */
  dimensionScoring?: ConstructorParameters<typeof DimensionScoringEngineV2>[0];
  /** False positive protection configuration */
  falsePositiveProtection?: ConstructorParameters<typeof FalsePositiveProtectionEngineV2>[0];
  /** Classification configuration */
  classification?: ConstructorParameters<typeof FounderClassificationEngineV2>[0];
  /** Market fit configuration */
  marketFit?: ConstructorParameters<typeof FounderMarketFitEngineV2>[0];
  /** Risk profile configuration */
  riskProfile?: ConstructorParameters<typeof FounderRiskProfileEngineV2>[0];
  /** Explanation configuration */
  explanation?: ConstructorParameters<typeof FounderExplanationEngineV2>[0];
  /** Roadmap configuration */
  roadmap?: ConstructorParameters<typeof FounderRoadmapEngineV2>[0];
  /** Main engine configuration */
  engine?: Partial<FounderEngineConfigV2>;
}

/**
 * Main Founder Intelligence Engine V2
 *
 * Orchestrates all sub-engines to produce comprehensive founder analysis.
 */
export class FounderIntelligenceEngineV2 {
  private config: FounderEngineConfigV2;
  private dimensionEngine: DimensionScoringEngineV2;
  private falsePositiveEngine: FalsePositiveProtectionEngineV2;
  private classificationEngine: FounderClassificationEngineV2;
  private marketFitEngine: FounderMarketFitEngineV2;
  private riskProfileEngine: FounderRiskProfileEngineV2;
  private explanationEngine: FounderExplanationEngineV2;
  private roadmapEngine: FounderRoadmapEngineV2;

  constructor(config: FounderIntelligenceEngineConfigV2 = {}) {
    // Initialize configuration
    this.config = {
      ...DEFAULT_FOUNDER_ENGINE_CONFIG,
      ...config.engine,
    };

    // Initialize sub-engines
    this.dimensionEngine = createDimensionScoringEngineV2(config.dimensionScoring);
    this.falsePositiveEngine = createFalsePositiveProtectionEngineV2(config.falsePositiveProtection);
    this.classificationEngine = createFounderClassificationEngineV2(config.classification);
    this.marketFitEngine = createFounderMarketFitEngineV2(config.marketFit);
    this.riskProfileEngine = createFounderRiskProfileEngineV2(config.riskProfile);
    this.explanationEngine = createFounderExplanationEngineV2(config.explanation);
    this.roadmapEngine = createFounderRoadmapEngineV2(config.roadmap);
  }

  /**
   * Perform comprehensive founder potential analysis.
   *
   * @param input - Founder analysis input data
   * @returns Complete founder potential analysis
   */
  analyze(input: FounderAnalysisInputV2): FounderPotentialAnalysisV2 {
    const startTime = Date.now();

    // Step 1: Score all 8 dimensions
    const dimensionScores = this.dimensionEngine.scoreAllDimensions(input);
    const dimensionMap = new Map(dimensionScores.map(d => [d.dimension, d]));

    // Step 2: Calculate overall potential
    const { potential: overallPotential, confidence: potentialConfidence } =
      this.dimensionEngine.calculateOverallPotential(
        dimensionScores,
        this.config.dimensionWeights
      );

    // Step 3: Detect non-founder profiles (false positive protection)
    const nonFounderProfiles = this.falsePositiveEngine.analyze(input, dimensionScores);
    const falsePositiveRiskScore =
      this.falsePositiveEngine.calculateFalsePositiveRisk(nonFounderProfiles);
    const isClassificationBlocked =
      this.falsePositiveEngine.shouldBlockFounderClassification(nonFounderProfiles);
    const isFalsePositiveRisk = falsePositiveRiskScore >= this.config.falsePositiveWarningThreshold;

    // Step 4: Classify founder type
    const typeClassification = this.classificationEngine.classify(dimensionScores, input);
    const primaryFounderType = typeClassification.primaryType;

    // Step 5: Determine readiness
    const readiness = calculateReadinessV2(
      overallPotential,
      dimensionScores,
      this.config.minDimensionThreshold
    );

    // Step 6: Assess market fit
    const marketFit = this.marketFitEngine.assess(
      primaryFounderType,
      dimensionScores,
      readiness,
      overallPotential
    );

    // Step 7: Assess risk profile
    const riskProfile = this.riskProfileEngine.assess(
      dimensionScores,
      readiness,
      nonFounderProfiles,
      input
    );

    // Step 8: Generate narrative
    const preliminaryAnalysis: FounderPotentialAnalysisV2 = {
      id: this.generateAnalysisId(),
      timestamp: Date.now(),
      studentId: input.profile.id,
      engineVersion: '2.0.0',
      overallPotential: isClassificationBlocked ? overallPotential * 0.5 : overallPotential,
      confidence: potentialConfidence,
      dimensions: dimensionScores,
      dimensionMap,
      typeClassification,
      primaryFounderType,
      readiness,
      readinessConfidence: this.calculateReadinessConfidence(dimensionScores),
      nonFounderProfiles,
      isFalsePositiveRisk,
      falsePositiveRiskScore,
      isClassificationBlocked,
      riskProfile,
      marketFit,
      strengths: this.dimensionEngine.getTopDimensions(dimensionScores, 3),
      developmentAreas: this.dimensionEngine.getDevelopmentAreas(dimensionScores),
      criticalGaps: dimensionScores
        .filter(d => d.score < 0.3)
        .map(d => d.dimension),
      narrative: {} as any, // Will be filled in
      recommendations: [], // Will be generated
      roadmap: undefined,
      inputSummary: {
        evidenceCount: dimensionScores.reduce((sum, d) => sum + d.evidenceCount, 0),
        textSourcesAnalyzed: this.countTextSources(input),
        projectsAnalyzed: input.projectPortfolio?.length ?? 0,
        assessmentResponsesUsed: input.assessmentResponses?.length ?? 0,
      },
    };

    // Generate narrative and recommendations
    const narrative = this.explanationEngine.generateNarrative(preliminaryAnalysis);
    const recommendations = this.generateRecommendations(preliminaryAnalysis);

    // Generate roadmap if enabled
    let roadmap: FounderRoadmapEngineV2['generateRoadmap'] | undefined;
    if (this.config.generateRoadmap) {
      roadmap = this.roadmapEngine.generateRoadmap(
        readiness,
        dimensionScores,
        primaryFounderType,
        riskProfile
      );
    }

    // Compile final analysis
    const finalAnalysis: FounderPotentialAnalysisV2 = {
      ...preliminaryAnalysis,
      narrative,
      recommendations,
      roadmap,
    };

    return finalAnalysis;
  }

  /**
   * Quick analysis for lightweight use cases.
   * Returns core metrics without full narrative and roadmap.
   */
  quickAnalyze(input: FounderAnalysisInputV2): {
    overallPotential: number;
    confidence: number;
    readiness: FounderReadinessV2;
    primaryType: FounderDimensionV2 | null;
    isFalsePositiveRisk: boolean;
    topStrengths: FounderDimensionV2[];
    developmentAreas: FounderDimensionV2[];
  } {
    const dimensionScores = this.dimensionEngine.scoreAllDimensions(input);
    const { potential } = this.dimensionEngine.calculateOverallPotential(dimensionScores);

    const nonFounderProfiles = this.falsePositiveEngine.analyze(input, dimensionScores);
    const falsePositiveRiskScore =
      this.falsePositiveEngine.calculateFalsePositiveRisk(nonFounderProfiles);

    const typeClassification = this.classificationEngine.classify(dimensionScores, input);

    const readiness = calculateReadinessV2(potential, dimensionScores);

    return {
      overallPotential: potential,
      confidence: dimensionScores.reduce((sum, d) => sum + d.confidence, 0) / dimensionScores.length,
      readiness,
      primaryType: typeClassification.primaryType,
      isFalsePositiveRisk: falsePositiveRiskScore >= this.config.falsePositiveWarningThreshold,
      topStrengths: this.dimensionEngine
        .getTopDimensions(dimensionScores, 3)
        .map(d => d.dimension),
      developmentAreas: this.dimensionEngine
        .getDevelopmentAreas(dimensionScores)
        .map(d => d.dimension),
    };
  }

  /**
   * Generate recommendations based on analysis.
   */
  private generateRecommendations(
    analysis: FounderPotentialAnalysisV2
  ): FounderPotentialAnalysisV2['recommendations'] {
    const recommendations: FounderPotentialAnalysisV2['recommendations'] = [];

    // Recommendation 1: Address critical gaps
    if (analysis.criticalGaps.length > 0) {
      recommendations.push({
        type: 'skill_building',
        priority: 'critical',
        description: `Focus on developing ${analysis.criticalGaps
          .slice(0, 2)
          .map(d => d.replace(/_/g, ' '))
          .join(' and ')}`,
        potentialImpact: 0.3,
        actionItems: analysis.criticalGaps.map(gap =>
          this.getSkillBuildingAction(gap)
        ),
        relatedDimensions: analysis.criticalGaps,
      });
    }

    // Recommendation 2: Type-specific development
    if (analysis.primaryFounderType) {
      const typeFit = analysis.typeClassification.allTypes.find(
        t => t.type === analysis.primaryFounderType
      );
      if (typeFit && typeFit.skillGaps.length > 0) {
        recommendations.push({
          type: 'skill_building',
          priority: 'high',
          description: `Develop skills complementary to your ${analysis.primaryFounderType
            .toLowerCase()
            .replace(/_/g, ' ')} profile`,
          potentialImpact: 0.2,
          actionItems: typeFit.skillGaps.slice(0, 2).map(gap =>
            this.getSkillBuildingAction(gap)
          ),
          relatedDimensions: typeFit.skillGaps,
        });
      }
    }

    // Recommendation 3: Co-founder recommendation
    if (analysis.marketFit.coFounderNeeds.needed) {
      recommendations.push({
        type: 'co_founder',
        priority: analysis.marketFit.coFounderNeeds.priority === 'CRITICAL' ? 'critical' : 'high',
        description: `Find a complementary co-founder (${analysis.marketFit.coFounderNeeds.complementaryTypes
          .slice(0, 2)
          .map(t => t.toLowerCase().replace(/_/g, ' '))
          .join(' or ')})`,
        potentialImpact: 0.25,
        actionItems: [
          'Attend startup events and hackathons',
          'Join founder matching platforms',
          'Build projects that attract collaborators',
          'Network in communities where target co-founders gather',
        ],
        relatedDimensions: [FounderDimensionV2.TALENT_MAGNETISM],
      });
    }

    // Recommendation 4: Experience building
    recommendations.push({
      type: 'experience',
      priority: analysis.readiness === FounderReadinessV2.EARLY ? 'critical' : 'high',
      description: 'Build experience through deliberate practice',
      potentialImpact: 0.2,
      actionItems: [
        'Launch a side project with real users',
        'Work at an early-stage startup',
        'Complete a challenging project end-to-end',
        'Experience failure and recovery',
      ],
      relatedDimensions: [
        FounderDimensionV2.OWNERSHIP_ORIENTATION,
        FounderDimensionV2.RESOURCEFULNESS,
      ],
    });

    // Recommendation 5: Network building
    recommendations.push({
      type: 'network',
      priority: 'high',
      description: 'Build relationships in the startup ecosystem',
      potentialImpact: 0.15,
      actionItems: [
        'Join founder communities and Slack groups',
        'Attend 2-3 startup events per month',
        'Find a mentor who has founded before',
        'Connect with 10 other aspiring founders',
      ],
      relatedDimensions: [FounderDimensionV2.TALENT_MAGNETISM],
    });

    // Recommendation 6: Timing recommendation (if relevant)
    if (!analysis.marketFit.timingAssessment.favorable) {
      recommendations.push({
        type: 'timing',
        priority: 'medium',
        description: analysis.marketFit.timingAssessment.explanation,
        potentialImpact: 0.15,
        actionItems: analysis.marketFit.timingAssessment.recommendations.slice(0, 3),
        relatedDimensions: [],
      });
    }

    return recommendations;
  }

  /**
   * Get specific action for skill building.
   */
  private getSkillBuildingAction(dimension: FounderDimensionV2): string {
    const actions: Record<FounderDimensionV2, string> = {
      [FounderDimensionV2.OPPORTUNITY_RECOGNITION]:
        'Conduct 10 customer discovery interviews to practice identifying problems',
      [FounderDimensionV2.OBSESSION_CAPACITY]:
        'Commit to a 6-month project and track weekly progress',
      [FounderDimensionV2.RESOURCEFULNESS]:
        'Build something valuable with zero budget in 30 days',
      [FounderDimensionV2.AMBIGUITY_TOLERANCE]:
        'Make 5 decisions with incomplete information and track outcomes',
      [FounderDimensionV2.RESILIENCE]:
        'Apply for something competitive, embrace rejection, and try again',
      [FounderDimensionV2.TALENT_MAGNETISM]:
        'Lead a volunteer project and recruit 3+ collaborators',
      [FounderDimensionV2.SALES_CAPABILITY]:
        'Sell something (product, service, or idea) to 5 people',
      [FounderDimensionV2.OWNERSHIP_ORIENTATION]:
        'Take complete ownership of a project outcome, good or bad',
    };

    return actions[dimension] || `Practice ${dimension.toLowerCase().replace(/_/g, ' ')}`;
  }

  /**
   * Calculate confidence in readiness assessment.
   */
  private calculateReadinessConfidence(dimensionScores: DimensionScoreV2[]): number {
    const avgConfidence =
      dimensionScores.reduce((sum, d) => sum + d.confidence, 0) / dimensionScores.length;
    const dimensionsAboveThreshold = dimensionScores.filter(d => d.score >= 0.5).length;
    const confidenceBoost = Math.min(dimensionsAboveThreshold * 0.05, 0.2);

    return Math.min(avgConfidence + confidenceBoost, 1);
  }

  /**
   * Count text sources analyzed.
   */
  private countTextSources(input: FounderAnalysisInputV2): number {
    let count = 0;
    if (input.userInput) count++;
    if (input.explicitStatements) count += input.explicitStatements.length;
    if (input.experienceDescriptions) count += input.experienceDescriptions.length;
    return count;
  }

  /**
   * Generate unique analysis ID.
   */
  private generateAnalysisId(): string {
    return `founder_analysis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Update engine configuration.
   */
  updateConfig(config: Partial<FounderEngineConfigV2>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration.
   */
  getConfig(): FounderEngineConfigV2 {
    return { ...this.config };
  }
}

/**
 * Factory function for creating the founder intelligence engine.
 */
export function createFounderIntelligenceEngineV2(
  config: FounderIntelligenceEngineConfigV2 = {}
): FounderIntelligenceEngineV2 {
  return new FounderIntelligenceEngineV2(config);
}

// Re-export all types and engines
export * from './types';
export * from './signals';
export { DimensionScoringEngineV2, createDimensionScoringEngineV2 } from './DimensionScoringEngine';
export {
  FalsePositiveProtectionEngineV2,
  createFalsePositiveProtectionEngineV2,
} from './FalsePositiveProtectionEngine';
export {
  FounderClassificationEngineV2,
  createFounderClassificationEngineV2,
} from './FounderClassificationEngine';
export { FounderMarketFitEngineV2, createFounderMarketFitEngineV2 } from './FounderMarketFitEngine';
export {
  FounderRiskProfileEngineV2,
  createFounderRiskProfileEngineV2,
} from './FounderRiskProfileEngine';
export {
  FounderExplanationEngineV2,
  createFounderExplanationEngineV2,
} from './FounderExplanationEngine';
export { FounderRoadmapEngineV2, createFounderRoadmapEngineV2 } from './FounderRoadmapEngine';
