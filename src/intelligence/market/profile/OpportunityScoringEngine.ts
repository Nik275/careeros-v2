/**
 * CareerOS Market Intelligence - Opportunity Scoring Engine
 *
 * Generates overall opportunity assessment (0-100).
 *
 * Inputs:
 * - Demand score
 * - Salary score
 * - Growth score
 * - Scarcity score
 * - Automation risk
 * - Future resilience
 *
 * Output: Opportunity Score (0-100)
 */

import type { OpportunityScoreBreakdown } from './models/MarketScoreBreakdown';
import type { CareerMarketProfile } from './models/CareerMarketProfile';
import type { OpportunityAnalysis, CareerStrength, CareerWeakness, CareerOpportunity, CareerRisk } from './models/OpportunityAnalysis';

/**
 * Configuration for opportunity scoring.
 */
export interface OpportunityScoringConfig {
  /** Weight for demand */
  demandWeight: number;

  /** Weight for salary */
  salaryWeight: number;

  /** Weight for growth */
  growthWeight: number;

  /** Weight for scarcity (talent shortage = opportunity) */
  scarcityWeight: number;

  /** Weight for automation risk (inverted) */
  automationRiskWeight: number;

  /** Weight for future resilience */
  resilienceWeight: number;

  /** Risk adjustment factor */
  riskAdjustmentFactor: number;
}

/**
 * Default configuration.
 */
export const DEFAULT_OPPORTUNITY_SCORING_CONFIG: OpportunityScoringConfig = {
  demandWeight: 0.25,
  salaryWeight: 0.2,
  growthWeight: 0.2,
  scarcityWeight: 0.1,
  automationRiskWeight: 0.1,
  resilienceWeight: 0.15,
  riskAdjustmentFactor: 0.3,
};

/**
 * Generates opportunity scores and analysis for careers.
 */
export class OpportunityScoringEngine {
  private config: OpportunityScoringConfig;

  constructor(config?: Partial<OpportunityScoringConfig>) {
    this.config = { ...DEFAULT_OPPORTUNITY_SCORING_CONFIG, ...config };
  }

  /**
   * Calculate opportunity score from career profile.
   */
  calculateScore(profile: CareerMarketProfile): {
    score: number;
    breakdown: OpportunityScoreBreakdown;
  } {
    // Base component scores
    const demand = profile.demandScore;
    const salary = profile.salaryScore;
    const growth = profile.growthScore;
    const scarcity = profile.scarcityScore;
    const automationRisk = profile.automationRiskScore;
    const resilience = profile.futureResilienceScore;

    // Weighted base opportunity (before risk adjustment)
    const baseOpportunity =
      demand * this.config.demandWeight +
      salary * this.config.salaryWeight +
      growth * this.config.growthWeight +
      scarcity * this.config.scarcityWeight +
      (100 - automationRisk) * this.config.automationRiskWeight + // Invert automation risk
      resilience * this.config.resilienceWeight;

    // Risk-adjusted score
    const riskFactor = this.calculateRiskFactor(automationRisk, profile);
    const riskAdjustedScore = baseOpportunity * (1 - this.config.riskAdjustmentFactor) +
      baseOpportunity * riskFactor * this.config.riskAdjustmentFactor;

    // Final score
    const finalScore = Math.max(0, Math.min(100, riskAdjustedScore));

    // Build breakdown
    const breakdown: OpportunityScoreBreakdown = {
      scoreType: 'opportunity',
      careerId: profile.careerId,
      calculatedAt: new Date(),
      contributions: [
        {
          factor: 'demand',
          weight: this.config.demandWeight,
          value: demand,
          contribution: demand * this.config.demandWeight,
          explanation: `Labor demand: ${demand}/100`,
        },
        {
          factor: 'salary',
          weight: this.config.salaryWeight,
          value: salary,
          contribution: salary * this.config.salaryWeight,
          explanation: `Economic attractiveness: ${salary}/100`,
        },
        {
          factor: 'growth',
          weight: this.config.growthWeight,
          value: growth,
          contribution: growth * this.config.growthWeight,
          explanation: `Career expansion: ${growth}/100`,
        },
        {
          factor: 'scarcity',
          weight: this.config.scarcityWeight,
          value: scarcity,
          contribution: scarcity * this.config.scarcityWeight,
          explanation: `Talent shortage creates opportunity: ${scarcity}/100`,
        },
        {
          factor: 'automationRisk',
          weight: this.config.automationRiskWeight,
          value: 100 - automationRisk,
          contribution: (100 - automationRisk) * this.config.automationRiskWeight,
          explanation: `Automation risk mitigated: ${100 - automationRisk}/100`,
        },
        {
          factor: 'resilience',
          weight: this.config.resilienceWeight,
          value: resilience,
          contribution: resilience * this.config.resilienceWeight,
          explanation: `Future resilience: ${resilience}/100`,
        },
      ],
      adjustments: [
        {
          type: 'multiplier',
          amount: riskFactor,
          reason: `Risk adjustment factor (${(riskFactor * 100).toFixed(0)}%)`,
        },
      ],
      formula: 'Weighted sum of components with risk adjustment',
      baseScore: baseOpportunity,
      finalScore,
      confidence: profile.confidence,
      evidence: [],
      components: {
        demand: { score: demand, weight: this.config.demandWeight, contribution: demand * this.config.demandWeight },
        salary: { score: salary, weight: this.config.salaryWeight, contribution: salary * this.config.salaryWeight },
        growth: { score: growth, weight: this.config.growthWeight, contribution: growth * this.config.growthWeight },
        scarcity: { score: scarcity, weight: this.config.scarcityWeight, contribution: scarcity * this.config.scarcityWeight },
        automationRisk: { score: 100 - automationRisk, weight: this.config.automationRiskWeight, contribution: (100 - automationRisk) * this.config.automationRiskWeight },
        resilience: { score: resilience, weight: this.config.resilienceWeight, contribution: resilience * this.config.resilienceWeight },
      },
      riskAdjustedScore,
      marketTiming: this.assessMarketTiming(profile),
    };

    return {
      score: Math.round(finalScore),
      breakdown,
    };
  }

  /**
   * Generate full opportunity analysis.
   */
  generateAnalysis(profile: CareerMarketProfile): OpportunityAnalysis {
    const { score: opportunityScore } = this.calculateScore(profile);

    return {
      careerId: profile.careerId,
      generatedAt: new Date(),
      opportunityScore,
      confidence: profile.confidence,
      strengths: this.identifyStrengths(profile),
      weaknesses: this.identifyWeaknesses(profile),
      opportunities: this.identifyOpportunities(profile),
      risks: this.identifyRisks(profile),
      marketTiming: this.analyzeMarketTiming(profile),
      trajectory: this.projectTrajectory(profile),
      competitiveLandscape: this.assessCompetitiveLandscape(profile),
      recommendations: this.generateRecommendations(profile),
      skillPriorities: this.identifySkillPriorities(profile),
      summary: this.generateSummary(profile, opportunityScore),
      keyTakeaways: this.generateKeyTakeaways(profile, opportunityScore),
      redFlags: this.identifyRedFlags(profile),
      greenLights: this.identifyGreenLights(profile),
    };
  }

  /**
   * Calculate risk adjustment factor.
   */
  private calculateRiskFactor(automationRisk: number, profile: CareerMarketProfile): number {
    // Automation risk reduces opportunity
    const automationFactor = 1 - (automationRisk / 200); // 0-50% reduction

    // Low confidence increases uncertainty
    const confidenceFactor = profile.confidence / 100;

    // Declining trend is a risk
    const trendFactor = profile.trendDirection === 'declining' ? 0.9 : 1;

    return (automationFactor + confidenceFactor + trendFactor) / 3;
  }

  /**
   * Assess market timing.
   */
  private assessMarketTiming(profile: CareerMarketProfile): OpportunityScoreBreakdown['marketTiming'] {
    const scores = [
      profile.demandScore,
      profile.salaryScore,
      profile.growthScore,
    ];
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    if (profile.trendDirection === 'improving' && avgScore >= 70) return 'favorable';
    if (profile.trendDirection === 'declining' || avgScore < 40) return 'unfavorable';
    return 'neutral';
  }

  /**
   * Identify career strengths.
   */
  private identifyStrengths(profile: CareerMarketProfile): CareerStrength[] {
    const strengths: CareerStrength[] = [];

    if (profile.demandScore >= 75) {
      strengths.push({
        area: 'High Demand',
        score: profile.demandScore,
        explanation: 'Strong employer demand across multiple regions',
        evidence: ['Active job postings', 'High hiring velocity'],
        marketContext: 'Labor market favors candidates',
      });
    }

    if (profile.salaryScore >= 75) {
      strengths.push({
        area: 'Strong Compensation',
        score: profile.salaryScore,
        explanation: 'Above-average compensation with growth potential',
        evidence: ['Competitive salaries', 'Good progression'],
        marketContext: 'Economic attractiveness is high',
      });
    }

    if (profile.growthScore >= 70) {
      strengths.push({
        area: 'Growing Market',
        score: profile.growthScore,
        explanation: 'Career is in expansion phase',
        evidence: ['Increasing job postings', 'Industry investment'],
        marketContext: 'Market is expanding rapidly',
      });
    }

    if (profile.futureResilienceScore >= 75) {
      strengths.push({
        area: 'Future-Proof',
        score: profile.futureResilienceScore,
        explanation: 'Strong resilience to automation and market changes',
        evidence: ['Human-essential tasks', 'Transferable skills'],
        marketContext: 'Long-term career viability',
      });
    }

    return strengths;
  }

  /**
   * Identify career weaknesses.
   */
  private identifyWeaknesses(profile: CareerMarketProfile): CareerWeakness[] {
    const weaknesses: CareerWeakness[] = [];

    if (profile.demandScore < 40) {
      weaknesses.push({
        area: 'Low Demand',
        score: profile.demandScore,
        severity: 'high',
        explanation: 'Limited employer demand in current market',
        mitigation: ['Consider adjacent roles', 'Geographic flexibility', 'Skill diversification'],
      });
    }

    if (profile.automationRiskScore >= 70) {
      weaknesses.push({
        area: 'Automation Risk',
        score: profile.automationRiskScore,
        severity: 'critical',
        explanation: 'High exposure to automation and AI substitution',
        mitigation: ['Develop human-essential skills', 'Focus on complex problem-solving', 'Build relationships'],
      });
    }

    if (profile.salaryScore < 40) {
      weaknesses.push({
        area: 'Below-Average Compensation',
        score: profile.salaryScore,
        severity: 'medium',
        explanation: 'Compensation below market average',
        mitigation: ['Target high-paying employers', 'Develop premium skills', 'Consider specializations'],
      });
    }

    if (profile.confidence < 50) {
      weaknesses.push({
        area: 'Data Uncertainty',
        score: profile.confidence,
        severity: 'medium',
        explanation: 'Limited market data available for this career',
        mitigation: ['Research additional sources', 'Network with professionals', 'Monitor trends closely'],
      });
    }

    return weaknesses;
  }

  /**
   * Identify opportunities.
   */
  private identifyOpportunities(profile: CareerMarketProfile): CareerOpportunity[] {
    const opportunities: CareerOpportunity[] = [];

    if (profile.scarcityScore >= 60 && profile.demandScore >= 60) {
      opportunities.push({
        type: 'skill_shortage',
        description: 'Talent shortage creating entry opportunities',
        timeWindow: 'immediate',
        magnitude: Math.round((profile.scarcityScore + profile.demandScore) / 2),
        likelihood: 80,
        requiredActions: ['Upskill quickly', 'Apply broadly', 'Highlight transferable skills'],
        confidence: profile.confidence,
      });
    }

    if (profile.growthScore >= 70) {
      opportunities.push({
        type: 'market_growth',
        description: 'Expanding market creating new roles',
        timeWindow: 'short_term',
        magnitude: profile.growthScore,
        likelihood: 75,
        requiredActions: ['Monitor job boards', 'Build relevant skills', 'Network in growing sectors'],
        confidence: profile.confidence,
      });
    }

    if (profile.futureResilienceScore >= 70 && profile.automationRiskScore < 50) {
      opportunities.push({
        type: 'technology_shift',
        description: 'Positioned to benefit from technology evolution',
        timeWindow: 'medium_term',
        magnitude: profile.futureResilienceScore,
        likelihood: 70,
        requiredActions: ['Stay current with tech', 'Develop complementary skills', 'Embrace AI tools'],
        confidence: profile.confidence,
      });
    }

    return opportunities;
  }

  /**
   * Identify risks.
   */
  private identifyRisks(profile: CareerMarketProfile): CareerRisk[] {
    const risks: CareerRisk[] = [];

    if (profile.automationRiskScore >= 50) {
      risks.push({
        type: 'automation',
        description: 'Role may be partially automated',
        timeHorizon: profile.automationRiskScore >= 70 ? 'short_term' : 'medium_term',
        probability: profile.automationRiskScore,
        impact: profile.automationRiskScore >= 70 ? 80 : 50,
        riskScore: Math.round((profile.automationRiskScore * (profile.automationRiskScore >= 70 ? 80 : 50)) / 100),
        mitigation: ['Develop AI-complementary skills', 'Focus on human interaction', 'Build expertise'],
        earlyWarning: ['Increasing AI tool adoption', 'Task automation in similar roles'],
        confidence: profile.confidence,
      });
    }

    if (profile.trendDirection === 'declining') {
      risks.push({
        type: 'market_contraction',
        description: 'Market showing decline signs',
        timeHorizon: 'short_term',
        probability: 60,
        impact: 70,
        riskScore: 42,
        mitigation: ['Diversify skills', 'Explore adjacent careers', 'Build transferability'],
        earlyWarning: ['Declining job postings', 'Salary stagnation', 'Industry consolidation'],
        confidence: profile.confidence,
      });
    }

    return risks;
  }

  /**
   * Analyze market timing.
   */
  private analyzeMarketTiming(profile: CareerMarketProfile): OpportunityAnalysis['marketTiming'] {
    const { outlook } = profile;

    const entryRecommendation: OpportunityAnalysis['marketTiming']['entryRecommendation'] =
      outlook === 'excellent' ? 'excellent' :
      outlook === 'good' ? 'good' :
      outlook === 'neutral' ? 'neutral' :
      outlook === 'caution' ? 'poor' : 'avoid';

    return {
      phase: profile.trendDirection === 'improving' ? 'growth' :
             profile.trendDirection === 'declining' ? 'decline' :
             profile.opportunityScore >= 70 ? 'maturity' : 'emerging',
      entryRecommendation,
      explanation: `Market outlook is ${outlook}. ${profile.trendDirection === 'improving' ? 'Trending upward.' : profile.trendDirection === 'declining' ? 'Showing decline.' : 'Stable.'}`,
    };
  }

  /**
   * Project career trajectory.
   */
  private projectTrajectory(profile: CareerMarketProfile): OpportunityAnalysis['trajectory'] {
    return {
      shortTerm: profile.growthScore >= 70 ? 'accelerating' : profile.growthScore >= 40 ? 'stable' : 'decelerating',
      mediumTerm: profile.futureResilienceScore >= 70 ? 'stable' : 'decelerating',
      longTerm: profile.futureResilienceScore >= 60 && profile.automationRiskScore < 50 ? 'stable' : 'decelerating',
      explanation: `Short-term driven by growth (${profile.growthScore}), medium/long-term by resilience (${profile.futureResilienceScore}) and automation risk (${profile.automationRiskScore}).`,
    };
  }

  /**
   * Assess competitive landscape.
   */
  private assessCompetitiveLandscape(profile: CareerMarketProfile): OpportunityAnalysis['competitiveLandscape'] {
    return {
      barriersToEntry: profile.scarcityScore >= 60 ? 'low' : profile.skillPriorities.length > 5 ? 'high' : 'medium',
      competitionIntensity: profile.demandScore >= 70 ? 'medium' : 'high',
      differentiationPotential: profile.futureResilienceScore >= 70 ? 'high' : 'medium',
    };
  }

  /**
   * Generate recommendations.
   */
  private generateRecommendations(profile: CareerMarketProfile): OpportunityAnalysis['recommendations'] {
    const recommendations: OpportunityAnalysis['recommendations'] = [];

    if (profile.automationRiskScore >= 50) {
      recommendations.push({
        priority: 'critical',
        action: 'Develop AI-complementary skills',
        rationale: 'High automation risk requires proactive skill development',
        timeframe: '0-6 months',
      });
    }

    if (profile.scarcityScore >= 60) {
      recommendations.push({
        priority: 'high',
        action: 'Enter market quickly',
        rationale: 'Talent shortage creates immediate opportunity',
        timeframe: '0-3 months',
      });
    }

    if (profile.growthScore >= 70) {
      recommendations.push({
        priority: 'high',
        action: 'Focus on high-growth sectors',
        rationale: 'Market expansion creating abundant opportunities',
        timeframe: '3-12 months',
      });
    }

    return recommendations;
  }

  /**
   * Identify skill priorities.
   */
  private identifySkillPriorities(profile: CareerMarketProfile): OpportunityAnalysis['skillPriorities'] {
    const priorities: OpportunityAnalysis['skillPriorities'] = [];

    if (profile.automationRiskScore >= 50) {
      priorities.push({
        skill: 'Complex Problem-Solving',
        importance: 95,
        urgency: 'immediate',
      });
    }

    priorities.push({
      skill: 'Communication',
      importance: 85,
      urgency: 'near_term',
    });

    priorities.push({
      skill: 'Adaptability',
      importance: 80,
      urgency: 'future',
    });

    return priorities;
  }

  /**
   * Generate executive summary.
   */
  private generateSummary(profile: CareerMarketProfile, opportunityScore: number): string {
    const parts: string[] = [];

    parts.push(`${profile.careerId} Market Analysis`);
    parts.push(`Opportunity Score: ${opportunityScore}/100`);
    parts.push(`Outlook: ${profile.outlook}`);
    parts.push(`Confidence: ${profile.confidence}%`);

    if (profile.automationRiskScore >= 60) {
      parts.push('⚠️ Elevated automation risk - skill development critical');
    }

    if (profile.scarcityScore >= 60 && profile.demandScore >= 60) {
      parts.push('✓ Talent shortage creating entry opportunities');
    }

    return parts.join(' | ');
  }

  /**
   * Generate key takeaways.
   */
  private generateKeyTakeaways(profile: CareerMarketProfile, opportunityScore: number): string[] {
    const takeaways: string[] = [];

    if (opportunityScore >= 70) {
      takeaways.push('Strong market opportunity');
    }

    if (profile.demandScore >= 75) {
      takeaways.push('High employer demand');
    }

    if (profile.automationRiskScore < 40) {
      takeaways.push('Low automation risk');
    }

    if (profile.futureResilienceScore >= 70) {
      takeaways.push('Future-resilient career path');
    }

    return takeaways;
  }

  /**
   * Identify red flags.
   */
  private identifyRedFlags(profile: CareerMarketProfile): string[] {
    const flags: string[] = [];

    if (profile.automationRiskScore >= 70) flags.push('Critical automation risk');
    if (profile.demandScore < 30) flags.push('Very low market demand');
    if (profile.trendDirection === 'declining') flags.push('Declining market trend');
    if (profile.confidence < 40) flags.push('High data uncertainty');

    return flags;
  }

  /**
   * Identify green lights.
   */
  private identifyGreenLights(profile: CareerMarketProfile): string[] {
    const lights: string[] = [];

    if (profile.opportunityScore >= 80) lights.push('Excellent opportunity score');
    if (profile.demandScore >= 80) lights.push('Very strong demand');
    if (profile.scarcityScore >= 70) lights.push('Significant talent shortage');
    if (profile.growthScore >= 75) lights.push('Rapid market growth');
    if (profile.automationRiskScore < 30) lights.push('Very low automation risk');

    return lights;
  }
}

/**
 * Factory function for OpportunityScoringEngine.
 */
export function createOpportunityScoringEngine(
  config?: Partial<OpportunityScoringConfig>
): OpportunityScoringEngine {
  return new OpportunityScoringEngine(config);
}
