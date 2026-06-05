/**
 * CareerOS Prospect Theory & Cognitive Bias Engine - Main Engine
 *
 * Models predictable human decision biases.
 * Understands where student choices diverge from rational decision optimization.
 */

import {
  LossAversionDetector,
  SocialConformityDetector,
  StatusBiasDetector,
  AuthorityInfluenceDetector,
  RiskPerceptionEngine,
  OptimismBiasDetector,
  SunkCostDetector,
} from './BiasDetectors';

import { BiasImpactAnalysis } from './BiasImpactAnalysis';
import { BiasExplanationEngine } from './BiasExplanationEngine';

import type {
  BiasAnalysisId,
  BiasProfile,
  BiasSignal,
  BiasImpact,
  BiasType,
  BiasAnalysis,
  BiasDetectionInput,
  BiasExplanation,
  DecisionDistortion,
  DecisionDistortionReport,
  ProspectTheoryConfig,
  DEFAULT_PROSPECT_THEORY_CONFIG,
} from './types';

/**
 * Main Prospect Theory Engine.
 */
export class ProspectTheoryEngine {
  private config: ProspectTheoryConfig;

  // Detectors
  private lossAversionDetector: LossAversionDetector;
  private socialConformityDetector: SocialConformityDetector;
  private statusBiasDetector: StatusBiasDetector;
  private authorityInfluenceDetector: AuthorityInfluenceDetector;
  private riskPerceptionEngine: RiskPerceptionEngine;
  private optimismBiasDetector: OptimismBiasDetector;
  private sunkCostDetector: SunkCostDetector;

  // Analysis engines
  private impactAnalysis: BiasImpactAnalysis;
  private explanationEngine: BiasExplanationEngine;

  constructor(config: Partial<ProspectTheoryConfig> = {}) {
    this.config = { ...DEFAULT_PROSPECT_THEORY_CONFIG, ...config };

    // Initialize detectors
    this.lossAversionDetector = new LossAversionDetector(this.config);
    this.socialConformityDetector = new SocialConformityDetector(this.config);
    this.statusBiasDetector = new StatusBiasDetector(this.config);
    this.authorityInfluenceDetector = new AuthorityInfluenceDetector(this.config);
    this.riskPerceptionEngine = new RiskPerceptionEngine(this.config);
    this.optimismBiasDetector = new OptimismBiasDetector(this.config);
    this.sunkCostDetector = new SunkCostDetector(this.config);

    // Initialize analysis engines
    this.impactAnalysis = new BiasImpactAnalysis(this.config);
    this.explanationEngine = new BiasExplanationEngine();
  }

  /**
   * Main entry point: analyze biases for a student.
   */
  analyze(input: BiasDetectionInput): BiasAnalysis {
    // Apply custom config if provided
    if (input.config) {
      this.config = { ...this.config, ...input.config };
    }

    // Detect all bias signals
    const signals = this.detectSignals(input);

    // Build bias profile
    const profile = this.buildProfile(input.studentId, signals);

    // Calculate impacts
    const impacts = this.impactAnalysis.calculateImpacts(signals, input);

    // Calculate distortion if we have decision context
    let distortion: DecisionDistortion | undefined;
    if (input.careerChoices.length > 0) {
      const rationalChoice = this.determineRationalChoice(input.careerChoices);
      const actualChoice = input.careerChoices[0]?.careerId || '';
      distortion = this.impactAnalysis.calculateDistortion(
        impacts,
        rationalChoice,
        actualChoice
      );
    }

    // Determine dominant bias
    const dominantBias = this.determineDominantBias(impacts);

    // Calculate summary
    const summary = {
      dominantBias,
      totalSignals: signals.length,
      averageDistortion: distortion?.overallScore || 0,
      biasSeverity: this.getBiasSeverity(profile.overallBias),
    };

    // Build analysis object
    const analysis: Omit<BiasAnalysis, 'id' | 'timestamp' | 'narrative'> = {
      studentId: input.studentId,
      profile,
      signals,
      impacts,
      distortion,
      summary,
    };

    // Generate narrative
    const fullAnalysis: BiasAnalysis = {
      id: this.generateId(),
      timestamp: Date.now(),
      ...analysis,
      narrative: { overview: '', biasExplanation: [], impactExplanation: [], recommendation: [] },
    };

    fullAnalysis.narrative = this.explanationEngine.generateNarrative(fullAnalysis);

    return fullAnalysis;
  }

  /**
   * Detect all bias signals.
   */
  detectSignals(input: BiasDetectionInput): BiasSignal[] {
    const signals: BiasSignal[] = [];

    // Run all detectors
    signals.push(...this.lossAversionDetector.detect(input));
    signals.push(...this.socialConformityDetector.detect(input));
    signals.push(...this.statusBiasDetector.detect(input));
    signals.push(...this.authorityInfluenceDetector.detect(input));
    signals.push(...this.riskPerceptionEngine.detectSignals(input));
    signals.push(...this.optimismBiasDetector.detect(input));
    signals.push(...this.sunkCostDetector.detect(input));

    // Filter by minimum strength
    return signals.filter((s) => s.strength >= this.config.minSignalStrength);
  }

  /**
   * Build bias profile from signals.
   */
  buildProfile(studentId: string, signals: BiasSignal[]): BiasProfile {
    // Group signals by bias type
    const signalsByType = new Map<BiasType, BiasSignal[]>();

    for (const signal of signals) {
      const existing = signalsByType.get(signal.biasType) || [];
      existing.push(signal);
      signalsByType.set(signal.biasType, existing);
    }

    // Calculate each bias score
    const calculateScore = (type: BiasType): number => {
      const typeSignals = signalsByType.get(type) || [];
      if (typeSignals.length === 0) return 0;

      const avgStrength =
        typeSignals.reduce((sum, s) => sum + s.strength, 0) /
        typeSignals.length;

      return Math.round(avgStrength * 100);
    };

    const lossAversion = calculateScore('lossAversion');
    const statusSeeking = calculateScore('statusSeeking');
    const socialConformity = calculateScore('socialConformity');
    const authorityInfluence = calculateScore('authorityInfluence');
    const riskPerceptionBias = calculateScore('riskPerceptionBias');
    const optimismBias = calculateScore('optimismBias');
    const sunkCostSensitivity = calculateScore('sunkCostSensitivity');
    const availabilityBias = calculateScore('availabilityBias');
    const anchoringBias = calculateScore('anchoringBias');
    const confirmationBias = calculateScore('confirmationBias');

    // Calculate overall bias
    const allScores = [
      lossAversion,
      statusSeeking,
      socialConformity,
      authorityInfluence,
      riskPerceptionBias,
      optimismBias,
      sunkCostSensitivity,
    ];

    const overallBias = Math.round(
      allScores.reduce((sum, s) => sum + s, 0) / allScores.length
    );

    // Calculate confidence
    const confidence = Math.min(0.95, 0.3 + signals.length * 0.05);

    return {
      studentId,
      timestamp: Date.now(),
      lossAversion,
      statusSeeking,
      socialConformity,
      authorityInfluence,
      riskPerceptionBias,
      optimismBias,
      sunkCostSensitivity,
      availabilityBias,
      anchoringBias,
      confirmationBias,
      overallBias,
      confidence,
    };
  }

  /**
   * Calculate distortion for a specific decision.
   */
  calculateDistortion(
    input: BiasDetectionInput,
    rationalChoice: string,
    actualChoice: string
  ): DecisionDistortion {
    const analysis = this.analyze(input);
    return this.impactAnalysis.calculateDistortion(
      analysis.impacts,
      rationalChoice,
      actualChoice
    );
  }

  /**
   * Generate explanation for a bias.
   */
  explainBias(biasType: BiasType): BiasExplanation {
    return this.explanationEngine.explainBias(biasType);
  }

  /**
   * Generate full distortion report.
   */
  generateDistortionReport(
    input: BiasDetectionInput,
    analyses: BiasAnalysis[]
  ): DecisionDistortionReport {
    // Calculate overall distortion
    const avgDistortion =
      analyses.reduce((sum, a) => sum + (a.distortion?.overallScore || 0), 0) /
      Math.max(analyses.length, 1);

    // Build bias breakdown
    const biasBreakdown: Record<BiasType, number> = {
      lossAversion: 0,
      statusSeeking: 0,
      socialConformity: 0,
      authorityInfluence: 0,
      riskPerceptionBias: 0,
      optimismBias: 0,
      sunkCostSensitivity: 0,
      availabilityBias: 0,
      anchoringBias: 0,
      confirmationBias: 0,
    };

    for (const analysis of analyses) {
      for (const impact of analysis.impacts) {
        biasBreakdown[impact.biasType] = Math.max(
          biasBreakdown[impact.biasType],
          impact.impact
        );
      }
    }

    // Get affected decisions
    const affectedDecisions = analyses
      .filter((a) => a.distortion && a.distortion.overallScore > 20)
      .map((a) => ({
        decisionId: a.distortion?.decisionId || '',
        distortion: a.distortion?.overallScore || 0,
        primaryBias: a.summary.dominantBias || 'lossAversion',
      }));

    // Generate explanations
    const explanations = Object.entries(biasBreakdown)
      .filter(([, score]) => score > 20)
      .map(([biasType]) => this.explainBias(biasType as BiasType));

    // Generate recommendations
    const recommendations = this.generateRecommendations(biasBreakdown);

    return {
      id: this.generateId(),
      studentId: input.studentId,
      timestamp: Date.now(),
      overallDistortion: Math.round(avgDistortion),
      level: this.getDistortionLevel(avgDistortion),
      biasBreakdown,
      affectedDecisions,
      explanations,
      recommendations,
    };
  }

  /**
   * Analyze risk perception.
   */
  analyzeRiskPerception(
    careerId: string,
    actualRisk: number,
    perceivedRisk: number
  ) {
    return this.riskPerceptionEngine.analyzeRiskPerception(
      careerId,
      actualRisk,
      perceivedRisk
    );
  }

  /**
   * Get bias severity from score.
   */
  private getBiasSeverity(score: number) {
    if (score >= 70) return 'extreme';
    if (score >= 50) return 'strong';
    if (score >= 30) return 'moderate';
    if (score >= 15) return 'mild';
    return 'minimal';
  }

  /**
   * Get distortion level from score.
   */
  private getDistortionLevel(score: number): DecisionDistortion['level'] {
    if (score >= 80) return 'extreme';
    if (score >= 60) return 'high';
    if (score >= 40) return 'moderate';
    if (score >= 20) return 'low';
    return 'minimal';
  }

  /**
   * Determine dominant bias from impacts.
   */
  private determineDominantBias(impacts: BiasImpact[]): BiasType | null {
    if (impacts.length === 0) return null;

    const sorted = [...impacts].sort((a, b) => b.impact - a.impact);
    return sorted[0].impact > 30 ? sorted[0].biasType : null;
  }

  /**
   * Determine rational choice from options.
   */
  private determineRationalChoice(
    choices: BiasDetectionInput['careerChoices']
  ): string {
    // Sort by utility (highest first)
    const sorted = [...choices].sort((a, b) => b.utility - a.utility);
    return sorted[0]?.careerId || '';
  }

  /**
   * Generate recommendations from bias breakdown.
   */
  private generateRecommendations(
    biasBreakdown: Record<BiasType, number>
  ): string[] {
    const recommendations: string[] = [];

    // Sort biases by score
    const sortedBiases = Object.entries(biasBreakdown)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    for (const [biasType, score] of sortedBiases) {
      if (score > 30) {
        const explanation = this.explainBias(biasType as BiasType);
        recommendations.push(...explanation.mitigation.slice(0, 2));
      }
    }

    // Remove duplicates
    return [...new Set(recommendations)];
  }

  /**
   * Generate unique ID.
   */
  private generateId(): string {
    return `bias-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Factory function for ProspectTheoryEngine.
 */
export function createProspectTheoryEngine(
  config?: Partial<ProspectTheoryConfig>
): ProspectTheoryEngine {
  return new ProspectTheoryEngine(config);
}

/**
 * Convenience function to analyze biases.
 */
export function analyzeBiases(
  input: BiasDetectionInput,
  config?: Partial<ProspectTheoryConfig>
): BiasAnalysis {
  const engine = new ProspectTheoryEngine(config);
  return engine.analyze(input);
}

/**
 * Convenience function to generate distortion report.
 */
export function generateDistortionReport(
  input: BiasDetectionInput,
  analyses: BiasAnalysis[],
  config?: Partial<ProspectTheoryConfig>
): DecisionDistortionReport {
  const engine = new ProspectTheoryEngine(config);
  return engine.generateDistortionReport(input, analyses);
}
