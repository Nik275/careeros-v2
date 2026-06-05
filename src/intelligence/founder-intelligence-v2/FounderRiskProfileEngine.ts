/**
 * Founder Intelligence V2 - Risk Profile Engine
 * 
 * Assesses risk factors that impact founder success probability:
 * - Financial instability
 * - Commitment risk
 * - Co-founder risk
 * - Skill gaps
 * - Market risk
 * - Execution risk
 * - Wellness risk
 * - Profile misclassification risk
 * 
 * @module intelligence/founder-intelligence-v2
 */

import {
  FounderDimensionV2,
  DimensionScoreV2,
  FounderRiskProfileV2,
  RiskAssessmentV2,
  FounderRiskFactorV2,
  FounderReadinessV2,
  NonFounderProfileDetectionV2,
  FounderAnalysisInputV2,
} from './types';

/**
 * Configuration for risk profile engine.
 */
export interface RiskProfileConfigV2 {
  /** Weight for financial risk */
  financialWeight: number;
  
  /** Weight for commitment risk */
  commitmentWeight: number;
  
  /** Weight for co-founder risk */
  coFounderWeight: number;
  
  /** Weight for skill gap risk */
  skillGapWeight: number;
  
  /** Weight for execution risk */
  executionWeight: number;
  
  /** Weight for wellness risk */
  wellnessWeight: number;
  
  /** Weight for misclassification risk */
  misclassificationWeight: number;
  
  /** Threshold for high risk */
  highRiskThreshold: number;
  
  /** Threshold for critical risk */
  criticalRiskThreshold: number;
}

/**
 * Default risk profile configuration.
 */
export const DEFAULT_RISK_PROFILE_CONFIG: RiskProfileConfigV2 = {
  financialWeight: 0.15,
  commitmentWeight: 0.2,
  coFounderWeight: 0.15,
  skillGapWeight: 0.2,
  executionWeight: 0.15,
  wellnessWeight: 0.1,
  misclassificationWeight: 0.25,
  highRiskThreshold: 0.6,
  criticalRiskThreshold: 0.8,
};

/**
 * Risk Profile Engine V2
 */
export class FounderRiskProfileEngineV2 {
  private config: RiskProfileConfigV2;
  
  constructor(config: Partial<RiskProfileConfigV2> = {}) {
    this.config = { ...DEFAULT_RISK_PROFILE_CONFIG, ...config };
  }
  
  /**
   * Assess risk profile for founder.
   */
  assess(
    dimensionScores: DimensionScoreV2[],
    readiness: FounderReadinessV2,
    nonFounderDetections: NonFounderProfileDetectionV2[],
    input: FounderAnalysisInputV2
  ): FounderRiskProfileV2 {
    const risks: RiskAssessmentV2[] = [];
    
    // Assess each risk factor
    risks.push(this.assessFinancialRisk(dimensionScores, input));
    risks.push(this.assessCommitmentRisk(dimensionScores, readiness));
    risks.push(this.assessCoFounderRisk(dimensionScores, input));
    risks.push(this.assessSkillGapRisk(dimensionScores));
    risks.push(this.assessExecutionRisk(dimensionScores));
    risks.push(this.assessWellnessRisk(dimensionScores, input));
    risks.push(this.assessMisclassificationRisk(nonFounderDetections));
    
    // Calculate overall risk
    const overallRiskScore = this.calculateOverallRisk(risks);
    const overallRiskLevel = this.determineRiskLevel(overallRiskScore);
    
    // Get top risks
    const topRisks = this.getTopRisks(risks);
    
    // Calculate risk-adjusted potential
    const riskAdjustedPotential = this.calculateRiskAdjustedPotential(
      this.calculateBasePotential(dimensionScores),
      overallRiskScore
    );
    
    return {
      overallRiskScore,
      overallRiskLevel,
      risks,
      topRisks,
      riskAdjustedPotential,
      confidence: this.calculateConfidence(risks),
    };
  }
  
  /**
   * Assess financial instability risk.
   */
  private assessFinancialRisk(
    dimensionScores: DimensionScoreV2[],
    input: FounderAnalysisInputV2
  ): RiskAssessmentV2 {
    const dimensionMap = new Map(dimensionScores.map(d => [d.dimension, d.score]));
    
    let score = 0;
    const evidence: any[] = [];
    
    // Low resourcefulness increases financial risk
    const resourcefulness = dimensionMap.get(FounderDimensionV2.RESOURCEFULNESS) ?? 0.5;
    if (resourcefulness < 0.4) {
      score += 0.3;
      evidence.push({ factor: 'Low resourcefulness', impact: 0.3 });
    }
    
    // Check life context if available
    if (input.lifeContext) {
      if (input.lifeContext.financialStability === 'UNSTABLE') {
        score += 0.4;
        evidence.push({ factor: 'Financial instability reported', impact: 0.4 });
      } else if (input.lifeContext.financialStability === 'MODERATE') {
        score += 0.15;
        evidence.push({ factor: 'Moderate financial stability', impact: 0.15 });
      }
    }
    
    // Early readiness increases financial risk
    // (covered in commitment risk)
    
    score = Math.min(score, 1);
    const level = this.getRiskLevel(score);
    
    return {
      factor: FounderRiskFactorV2.FINANCIAL_INSTABILITY,
      level,
      score,
      explanation: this.getFinancialRiskExplanation(score),
      mitigations: this.getFinancialMitigations(score),
      evidence,
    };
  }
  
  /**
   * Assess commitment risk.
   */
  private assessCommitmentRisk(
    dimensionScores: DimensionScoreV2[],
    readiness: FounderReadinessV2
  ): RiskAssessmentV2 {
    const dimensionMap = new Map(dimensionScores.map(d => [d.dimension, d.score]));
    
    let score = 0;
    const evidence: any[] = [];
    
    // Low obsession capacity = high commitment risk
    const obsession = dimensionMap.get(FounderDimensionV2.OBSESSION_CAPACITY) ?? 0.5;
    if (obsession < 0.4) {
      score += 0.35;
      evidence.push({ factor: 'Low obsession capacity', impact: 0.35 });
    } else if (obsession < 0.6) {
      score += 0.15;
      evidence.push({ factor: 'Moderate obsession capacity', impact: 0.15 });
    }
    
    // Low resilience = high commitment risk (quitting when hard)
    const resilience = dimensionMap.get(FounderDimensionV2.RESILIENCE) ?? 0.5;
    if (resilience < 0.4) {
      score += 0.25;
      evidence.push({ factor: 'Low resilience', impact: 0.25 });
    }
    
    // Early readiness = higher commitment risk
    if (readiness === FounderReadinessV2.EARLY) {
      score += 0.2;
      evidence.push({ factor: 'Early stage readiness', impact: 0.2 });
    }
    
    score = Math.min(score, 1);
    const level = this.getRiskLevel(score);
    
    return {
      factor: FounderRiskFactorV2.COMMITMENT_RISK,
      level,
      score,
      explanation: this.getCommitmentRiskExplanation(score, obsession, resilience),
      mitigations: this.getCommitmentMitigations(score),
      evidence,
    };
  }
  
  /**
   * Assess co-founder risk.
   */
  private assessCoFounderRisk(
    dimensionScores: DimensionScoreV2[],
    input: FounderAnalysisInputV2
  ): RiskAssessmentV2 {
    const dimensionMap = new Map(dimensionScores.map(d => [d.dimension, d.score]));
    
    let score = 0;
    const evidence: any[] = [];
    
    // Low talent magnetism = harder to find co-founder
    const talentMagnetism = dimensionMap.get(FounderDimensionV2.TALENT_MAGNETISM) ?? 0.5;
    if (talentMagnetism < 0.4) {
      score += 0.25;
      evidence.push({ factor: 'Low talent magnetism', impact: 0.25 });
    }
    
    // Solo preference indicators in text
    const textSources = [input.userInput, ...(input.explicitStatements || [])].filter(Boolean);
    const soloIndicators = ['prefer to work alone', 'solo founder', 'by myself'];
    for (const text of textSources) {
      if (text && soloIndicators.some(ind => text.toLowerCase().includes(ind))) {
        score += 0.15;
        evidence.push({ factor: 'Expressed solo preference', impact: 0.15 });
        break;
      }
    }
    
    // Multiple skill gaps = need co-founder
    const criticalGaps = [
      FounderDimensionV2.TECHNICAL_FOUNDER,
      FounderDimensionV2.SALES_CAPABILITY,
      FounderDimensionV2.RESOURCEFULNESS,
    ].filter(d => (dimensionMap.get(d as FounderDimensionV2) ?? 0.5) < 0.4).length;
    
    if (criticalGaps >= 2) {
      score += 0.3;
      evidence.push({ factor: 'Multiple critical skill gaps', impact: 0.3 });
    }
    
    score = Math.min(score, 1);
    const level = this.getRiskLevel(score);
    
    return {
      factor: FounderRiskFactorV2.CO_FOUNDER_RISK,
      level,
      score,
      explanation: this.getCoFounderRiskExplanation(score, criticalGaps),
      mitigations: this.getCoFounderMitigations(score),
      evidence,
    };
  }
  
  /**
   * Assess skill gap risk.
   */
  private assessSkillGapRisk(dimensionScores: DimensionScoreV2[]): RiskAssessmentV2 {
    const developmentAreas = dimensionScores.filter(d => d.score < 0.5);
    const criticalGaps = dimensionScores.filter(d => d.score < 0.3);
    
    let score = 0;
    const evidence: any[] = [];
    
    // Score based on number and severity of gaps
    score += Math.min(developmentAreas.length * 0.1, 0.4);
    score += Math.min(criticalGaps.length * 0.15, 0.4);
    
    if (criticalGaps.length > 0) {
      evidence.push({ factor: `${criticalGaps.length} critical skill gaps`, impact: criticalGaps.length * 0.15 });
    }
    if (developmentAreas.length > criticalGaps.length) {
      evidence.push({ factor: `${developmentAreas.length - criticalGaps.length} areas needing development`, impact: (developmentAreas.length - criticalGaps.length) * 0.1 });
    }
    
    score = Math.min(score, 1);
    const level = this.getRiskLevel(score);
    
    return {
      factor: FounderRiskFactorV2.SKILL_GAP_RISK,
      level,
      score,
      explanation: this.getSkillGapExplanation(developmentAreas.length, criticalGaps.length),
      mitigations: this.getSkillGapMitigations(criticalGaps.map(d => d.dimension)),
      evidence,
    };
  }
  
  /**
   * Assess execution risk.
   */
  private assessExecutionRisk(dimensionScores: DimensionScoreV2[]): RiskAssessmentV2 {
    const dimensionMap = new Map(dimensionScores.map(d => [d.dimension, d.score]));
    
    let score = 0;
    const evidence: any[] = [];
    
    // Key execution dimensions
    const resourcefulness = dimensionMap.get(FounderDimensionV2.RESOURCEFULNESS) ?? 0.5;
    const ownership = dimensionMap.get(FounderDimensionV2.OWNERSHIP_ORIENTATION) ?? 0.5;
    const obsession = dimensionMap.get(FounderDimensionV2.OBSESSION_CAPACITY) ?? 0.5;
    
    if (resourcefulness < 0.4) {
      score += 0.25;
      evidence.push({ factor: 'Low resourcefulness', impact: 0.25 });
    }
    
    if (ownership < 0.4) {
      score += 0.3;
      evidence.push({ factor: 'Low ownership orientation', impact: 0.3 });
    }
    
    if (obsession < 0.4) {
      score += 0.2;
      evidence.push({ factor: 'Low obsession capacity', impact: 0.2 });
    }
    
    // Combined execution score
    const executionScore = (resourcefulness + ownership + obsession) / 3;
    if (executionScore < 0.4) {
      score += 0.15;
      evidence.push({ factor: 'Overall weak execution profile', impact: 0.15 });
    }
    
    score = Math.min(score, 1);
    const level = this.getRiskLevel(score);
    
    return {
      factor: FounderRiskFactorV2.EXECUTION_RISK,
      level,
      score,
      explanation: this.getExecutionRiskExplanation(executionScore),
      mitigations: this.getExecutionMitigations(score),
      evidence,
    };
  }
  
  /**
   * Assess wellness risk.
   */
  private assessWellnessRisk(
    dimensionScores: DimensionScoreV2[],
    input: FounderAnalysisInputV2
  ): RiskAssessmentV2 {
    const dimensionMap = new Map(dimensionScores.map(d => [d.dimension, d.score]));
    
    let score = 0;
    const evidence: any[] = [];
    
    // Resilience is key wellness indicator
    const resilience = dimensionMap.get(FounderDimensionV2.RESILIENCE) ?? 0.5;
    if (resilience < 0.3) {
      score += 0.4;
      evidence.push({ factor: 'Very low resilience', impact: 0.4 });
    } else if (resilience < 0.5) {
      score += 0.2;
      evidence.push({ factor: 'Low resilience', impact: 0.2 });
    }
    
    // Ambiguity tolerance affects stress handling
    const ambiguity = dimensionMap.get(FounderDimensionV2.AMBIGUITY_TOLERANCE) ?? 0.5;
    if (ambiguity < 0.3) {
      score += 0.25;
      evidence.push({ factor: 'Low ambiguity tolerance', impact: 0.25 });
    }
    
    score = Math.min(score, 1);
    const level = this.getRiskLevel(score);
    
    return {
      factor: FounderRiskFactorV2.WELLNESS_RISK,
      level,
      score,
      explanation: this.getWellnessRiskExplanation(resilience, ambiguity),
      mitigations: this.getWellnessMitigations(score),
      evidence,
    };
  }
  
  /**
   * Assess misclassification risk.
   */
  private assessMisclassificationRisk(
    nonFounderDetections: NonFounderProfileDetectionV2[]
  ): RiskAssessmentV2 {
    let score = 0;
    const evidence: any[] = [];
    
    if (nonFounderDetections.length === 0) {
      return {
        factor: FounderRiskFactorV2.PROFILE_MISCLASSIFICATION_RISK,
        level: 'LOW',
        score: 0.1,
        explanation: 'No significant non-founder profile indicators detected.',
        mitigations: ['Continue to monitor for profile drift'],
        evidence: [],
      };
    }
    
    const topDetection = nonFounderDetections[0];
    
    if (topDetection.blocksClassification) {
      score = 0.9;
      evidence.push({ factor: `Dominant ${topDetection.profile} pattern`, impact: 0.9 });
    } else if (topDetection.isDominant) {
      score = 0.7;
      evidence.push({ factor: `Strong ${topDetection.profile} indicators`, impact: 0.7 });
    } else if (topDetection.confidence > 0.5) {
      score = 0.4;
      evidence.push({ factor: `Moderate ${topDetection.profile} indicators`, impact: 0.4 });
    } else {
      score = 0.2;
      evidence.push({ factor: `Weak ${topDetection.profile} indicators`, impact: 0.2 });
    }
    
    score = Math.min(score, 1);
    const level = this.getRiskLevel(score);
    
    return {
      factor: FounderRiskFactorV2.PROFILE_MISCLASSIFICATION_RISK,
      level,
      score,
      explanation: this.getMisclassificationExplanation(topDetection),
      mitigations: this.getMisclassificationMitigations(topDetection),
      evidence,
    };
  }
  
  /**
   * Calculate overall risk score.
   */
  private calculateOverallRisk(risks: RiskAssessmentV2[]): number {
    const weights: Record<FounderRiskFactorV2, number> = {
      [FounderRiskFactorV2.FINANCIAL_INSTABILITY]: this.config.financialWeight,
      [FounderRiskFactorV2.COMMITMENT_RISK]: this.config.commitmentWeight,
      [FounderRiskFactorV2.CO_FOUNDER_RISK]: this.config.coFounderWeight,
      [FounderRiskFactorV2.SKILL_GAP_RISK]: this.config.skillGapWeight,
      [FounderRiskFactorV2.MARKET_RISK]: 0.1, // Not directly assessed
      [FounderRiskFactorV2.EXECUTION_RISK]: this.config.executionWeight,
      [FounderRiskFactorV2.WELLNESS_RISK]: this.config.wellnessWeight,
      [FounderRiskFactorV2.PROFILE_MISCLASSIFICATION_RISK]: this.config.misclassificationWeight,
    };
    
    let weightedSum = 0;
    let totalWeight = 0;
    
    for (const risk of risks) {
      const weight = weights[risk.factor] ?? 0.1;
      weightedSum += risk.score * weight;
      totalWeight += weight;
    }
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }
  
  /**
   * Determine risk level from score.
   */
  private determineRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (score >= this.config.criticalRiskThreshold) return 'CRITICAL';
    if (score >= this.config.highRiskThreshold) return 'HIGH';
    if (score >= 0.4) return 'MEDIUM';
    return 'LOW';
  }
  
  /**
   * Get risk level for individual factor.
   */
  private getRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    return this.determineRiskLevel(score);
  }
  
  /**
   * Get top risks to address.
   */
  private getTopRisks(risks: RiskAssessmentV2[]): RiskAssessmentV2[] {
    return risks
      .filter(r => r.level === 'HIGH' || r.level === 'CRITICAL')
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }
  
  /**
   * Calculate base potential from dimensions.
   */
  private calculateBasePotential(dimensionScores: DimensionScoreV2[]): number {
    const avgScore = dimensionScores.reduce((sum, d) => sum + d.score, 0) / dimensionScores.length;
    return avgScore;
  }
  
  /**
   * Calculate risk-adjusted potential.
   */
  private calculateRiskAdjustedPotential(basePotential: number, riskScore: number): number {
    // Risk reduces potential
    const riskAdjustment = riskScore * 0.5;
    return Math.max(0, basePotential - riskAdjustment);
  }
  
  /**
   * Calculate confidence in risk assessment.
   */
  private calculateConfidence(risks: RiskAssessmentV2[]): number {
    const avgEvidence = risks.reduce((sum, r) => sum + r.evidence.length, 0) / risks.length;
    return Math.min(0.5 + avgEvidence * 0.1, 0.9);
  }
  
  // Explanation generators
  private getFinancialRiskExplanation(score: number): string {
    if (score >= 0.7) return 'High financial instability risk. Consider stabilizing finances before starting.';
    if (score >= 0.4) return 'Moderate financial risk. Plan for personal runway and emergency fund.';
    return 'Financial risk appears manageable.';
  }
  
  private getCommitmentRiskExplanation(score: number, obsession: number, resilience: number): string {
    if (score >= 0.7) return 'High commitment risk due to low persistence and resilience indicators.';
    if (obsession < 0.5) return 'Moderate commitment risk. Building obsession capacity is recommended.';
    return 'Commitment risk appears manageable.';
  }
  
  private getCoFounderRiskExplanation(score: number, gaps: number): string {
    if (score >= 0.7) return 'High co-founder risk. You need a complementary co-founder but may struggle to attract one.';
    if (gaps >= 2) return 'Multiple skill gaps suggest co-founder need, but talent magnetism may need development.';
    return 'Co-founder risk appears manageable.';
  }
  
  private getSkillGapExplanation(developmentCount: number, criticalCount: number): string {
    if (criticalCount >= 3) return `Significant skill gaps with ${criticalCount} critical areas requiring development.`;
    if (developmentCount >= 4) return `${developmentCount} areas need development before founder readiness.`;
    return 'Skill gaps are manageable with focused development.';
  }
  
  private getExecutionRiskExplanation(executionScore: number): string {
    if (executionScore < 0.3) return 'Very high execution risk. Critical execution capabilities need development.';
    if (executionScore < 0.5) return 'Moderate execution risk. Focus on resourcefulness and ownership.';
    return 'Execution capability appears sufficient.';
  }
  
  private getWellnessRiskExplanation(resilience: number, ambiguity: number): string {
    if (resilience < 0.3) return 'High wellness risk due to low resilience. Startup stress may be overwhelming.';
    if (ambiguity < 0.3) return 'Moderate wellness risk. Uncertainty tolerance needs development.';
    return 'Wellness risk appears manageable.';
  }
  
  private getMisclassificationExplanation(detection: NonFounderProfileDetectionV2): string {
    return `Risk of misclassification as ${detection.profile}. ${detection.distinctionExplanation}`;
  }
  
  // Mitigation generators
  private getFinancialMitigations(score: number): string[] {
    if (score >= 0.7) {
      return [
        'Build 12-month personal runway before starting',
        'Consider starting as side project while employed',
        'Reduce personal expenses aggressively',
        'Explore funding options early',
      ];
    }
    return [
      'Maintain 6-month emergency fund',
      'Track personal burn rate carefully',
      'Consider consulting income during early stages',
    ];
  }
  
  private getCommitmentMitigations(score: number): string[] {
    return [
      'Start with a 6-month commitment trial',
      'Build public accountability (announce intentions)',
      'Join founder communities for peer support',
      'Set concrete milestones to maintain momentum',
    ];
  }
  
  private getCoFounderMitigations(score: number): string[] {
    return [
      'Attend startup events and hackathons',
      'Join founder matching platforms',
      'Build projects that attract collaborators',
      'Develop storytelling skills to inspire others',
    ];
  }
  
  private getSkillGapMitigations(gaps: FounderDimensionV2[]): string[] {
    const mitigations: string[] = [];
    
    for (const gap of gaps.slice(0, 3)) {
      switch (gap) {
        case FounderDimensionV2.SALES_CAPABILITY:
          mitigations.push('Practice selling through side projects or fundraising for nonprofits');
          break;
        case FounderDimensionV2.TECHNICAL_FOUNDER:
          mitigations.push('Learn to code through intensive bootcamp or self-study');
          break;
        case FounderDimensionV2.TALENT_MAGNETISM:
          mitigations.push('Lead volunteer projects or community initiatives');
          break;
        case FounderDimensionV2.RESOURCEFULNESS:
          mitigations.push('Build something with severe constraints (no budget, limited time)');
          break;
        default:
          mitigations.push(`Develop ${gap.replace(/_/g, ' ').toLowerCase()} through deliberate practice`);
      }
    }
    
    return mitigations;
  }
  
  private getExecutionMitigations(score: number): string[] {
    return [
      'Complete a small project end-to-end',
      'Practice "shipping" over perfection',
      'Build in public to create accountability',
      'Set weekly deliverables for yourself',
    ];
  }
  
  private getWellnessMitigations(score: number): string[] {
    return [
      'Establish stress management practices (meditation, exercise)',
      'Build a support network before starting',
      'Set boundaries between work and personal life',
      'Consider therapy or coaching for resilience building',
    ];
  }
  
  private getMisclassificationMitigations(detection: NonFounderProfileDetectionV2): string[] {
    return [
      'Build a product with actual users',
      'Focus on commercial outcomes, not just interest',
      'Take concrete action rather than planning',
      'Seek feedback from actual founders on your approach',
    ];
  }
  
  /**
   * Update configuration.
   */
  updateConfig(config: Partial<RiskProfileConfigV2>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Factory function for creating risk profile engine.
 */
export function createFounderRiskProfileEngineV2(
  config?: Partial<RiskProfileConfigV2>
): FounderRiskProfileEngineV2 {
  return new FounderRiskProfileEngineV2(config);
}
