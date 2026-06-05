/**
 * Market Narrative Engine
 *
 * Generates human-readable explanations of market intelligence.
 *
 * ## Example Output
 *
 * "Cybersecurity remains attractive because:
 *  - demand growth is strong
 *  - competition remains moderate
 *  - AI disruption risk is low"
 *
 * ## Narrative Structure
 *   - Summary: One-line assessment
 *   - Key Points: 3-5 bullet points
 *   - Supporting Evidence: Data-backed facts
 *   - Recommendations: Actionable insights
 */

import type {
  MarketNarrative,
  MarketTrend,
  MarketOpportunity,
  MarketRisk,
  MarketMomentum,
  EmergingCareer,
  NarrativeConfig,
  NormalizedEntityType,
  EntityId,
} from './types.js';

import { DEFAULT_NARRATIVE_CONFIG } from './types.js';

// ============================================================================
// MARKET NARRATIVE ENGINE
// ============================================================================

export class MarketNarrativeEngine {
  private config: NarrativeConfig;

  constructor(config: Partial<NarrativeConfig> = {}) {
    this.config = { ...DEFAULT_NARRATIVE_CONFIG, ...config };
  }

  /**
   * Generate narrative for an entity.
   */
  generateNarrative(
    entityId: EntityId,
    entityType: NormalizedEntityType,
    entityName: string,
    intelligence: {
      trend: MarketTrend;
      opportunity: MarketOpportunity;
      risks: MarketRisk[];
      momentum?: MarketMomentum;
      emergingStatus?: EmergingCareer;
    }
  ): MarketNarrative {
    // Generate summary
    const summary = this.generateSummary(entityName, intelligence);

    // Generate key points
    const keyPoints = this.generateKeyPoints(intelligence);

    // Generate supporting evidence
    const supportingEvidence = this.config.includeSupportingEvidence
      ? this.generateSupportingEvidence(intelligence)
      : [];

    // Generate recommendations
    const recommendations = this.generateRecommendations(intelligence);

    // Calculate confidence
    const confidence = this.calculateNarrativeConfidence(intelligence);

    return {
      id: `narrative_${entityId}_${Date.now()}`,
      entityId,
      entityType,
      summary,
      keyPoints: keyPoints.slice(0, this.config.maxKeyPoints),
      supportingEvidence: supportingEvidence.slice(0, 5),
      recommendations: recommendations.slice(0, this.config.maxRecommendations),
      generatedAt: Date.now(),
      confidence,
    };
  }

  /**
   * Generate one-line summary.
   */
  private generateSummary(
    entityName: string,
    intelligence: {
      trend: MarketTrend;
      opportunity: MarketOpportunity;
      risks: MarketRisk[];
      emergingStatus?: EmergingCareer;
    }
  ): string {
    const parts: string[] = [];

    // Base statement
    parts.push(`${entityName}`);

    // Trend status
    if (intelligence.trend.trendType === 'growing' || intelligence.trend.trendType === 'emerging') {
      parts.push('is in a growth phase');
    } else if (intelligence.trend.trendType === 'declining') {
      parts.push('is experiencing decline');
    } else if (intelligence.trend.trendType === 'volatile') {
      parts.push('shows volatile patterns');
    } else {
      parts.push('is stable');
    }

    // Opportunity context
    if (intelligence.opportunity.opportunityScore >= 70) {
      parts.push('with strong opportunity potential');
    } else if (intelligence.opportunity.opportunityScore >= 40) {
      parts.push('with moderate opportunity');
    } else {
      parts.push('with limited opportunity');
    }

    // Risk context
    const highRisks = intelligence.risks.filter(r => r.riskLevel === 'high' || r.riskLevel === 'critical').length;
    if (highRisks === 0) {
      parts.push('and minimal risk factors');
    } else if (highRisks <= 2) {
      parts.push('but some risk factors present');
    } else {
      parts.push('with significant risk factors');
    }

    return parts.join(' ') + '.';
  }

  /**
   * Generate key points.
   */
  private generateKeyPoints(intelligence: {
    trend: MarketTrend;
    opportunity: MarketOpportunity;
    risks: MarketRisk[];
    momentum?: MarketMomentum;
    emergingStatus?: EmergingCareer;
  }): string[] {
    const points: string[] = [];

    // Trend point
    const trendStrength = intelligence.trend.strength > 0.7 ? 'strongly' :
      intelligence.trend.strength > 0.4 ? 'moderately' : 'slightly';

    if (intelligence.trend.trendType === 'growing') {
      points.push(`${trendStrength} growing with ${(intelligence.trend.confidence * 100).toFixed(0)}% confidence`);
    } else if (intelligence.trend.trendType === 'emerging') {
      points.push(`Emerging opportunity with ${trendStrength} growth trajectory`);
    } else if (intelligence.trend.trendType === 'declining') {
      points.push(`Declining market with ${trendStrength} downward trend`);
    } else if (intelligence.trend.trendType === 'volatile') {
      points.push(`Volatile market conditions with unpredictable patterns`);
    } else {
      points.push(`Stable market with consistent patterns`);
    }

    // Opportunity score
    const score = intelligence.opportunity.opportunityScore;
    if (score >= 80) {
      points.push(`Excellent opportunity score of ${score}/100`);
    } else if (score >= 60) {
      points.push(`Good opportunity score of ${score}/100`);
    } else if (score >= 40) {
      points.push(`Moderate opportunity score of ${score}/100`);
    } else {
      points.push(`Challenging opportunity score of ${score}/100`);
    }

    // Key drivers
    if (intelligence.opportunity.drivers.length > 0) {
      points.push(`Key drivers: ${intelligence.opportunity.drivers.slice(0, 2).join(', ')}`);
    }

    // Risk summary
    const criticalRisks = intelligence.risks.filter(r => r.riskLevel === 'critical').length;
    const highRisks = intelligence.risks.filter(r => r.riskLevel === 'high').length;

    if (criticalRisks > 0) {
      points.push(`⚠️ ${criticalRisks} critical risk factor(s) identified`);
    } else if (highRisks > 0) {
      points.push(`${highRisks} high-risk factor(s) to monitor`);
    } else if (intelligence.risks.length > 0) {
      points.push(`${intelligence.risks.length} low-risk factor(s) present`);
    } else {
      points.push('No significant risk factors identified');
    }

    // Momentum
    if (intelligence.momentum) {
      const direction = intelligence.momentum.direction;
      const speed = Math.abs(intelligence.momentum.rateOfChange) > 0.05 ? 'rapidly' :
        Math.abs(intelligence.momentum.rateOfChange) > 0.01 ? 'moderately' : 'slowly';

      if (direction === 'up') {
        points.push(`Momentum is ${speed} increasing`);
      } else if (direction === 'down') {
        points.push(`Momentum is ${speed} decreasing`);
      }

      if (intelligence.momentum.acceleration > 0.05) {
        points.push('Growth is accelerating');
      } else if (intelligence.momentum.acceleration < -0.05) {
        points.push('Growth is decelerating');
      }
    }

    // Emerging status
    if (intelligence.emergingStatus) {
      points.push(`Emerging category with ${(intelligence.emergingStatus.growthRate * 100).toFixed(0)}% growth rate`);
      points.push(`Projected trajectory: ${intelligence.emergingStatus.projectedTrajectory}`);
    }

    return points;
  }

  /**
   * Generate supporting evidence.
   */
  private generateSupportingEvidence(intelligence: {
    trend: MarketTrend;
    opportunity: MarketOpportunity;
    risks: MarketRisk[];
  }): Array<{ metric: string; value: number; trend: MarketTrend['trendType'] }> {
    const evidence: Array<{ metric: string; value: number; trend: MarketTrend['trendType'] }> = [];

    // Opportunity components
    evidence.push({
      metric: 'Demand Score',
      value: intelligence.opportunity.scoreComponents.demand,
      trend: intelligence.opportunity.scoreComponents.demand > 60 ? 'growing' : 'stable',
    });

    evidence.push({
      metric: 'Competition Score',
      value: intelligence.opportunity.scoreComponents.competition,
      trend: intelligence.opportunity.scoreComponents.competition > 60 ? 'growing' : 'stable',
    });

    evidence.push({
      metric: 'Salary Growth',
      value: intelligence.opportunity.scoreComponents.salaryGrowth,
      trend: intelligence.opportunity.scoreComponents.salaryGrowth > 60 ? 'growing' : 'stable',
    });

    evidence.push({
      metric: 'Future Outlook',
      value: intelligence.opportunity.scoreComponents.futureOutlook,
      trend: intelligence.opportunity.scoreComponents.futureOutlook > 60 ? 'growing' : 'stable',
    });

    evidence.push({
      metric: 'Automation Risk',
      value: intelligence.opportunity.scoreComponents.automationRisk,
      trend: intelligence.opportunity.scoreComponents.automationRisk > 60 ? 'growing' : 'stable',
    });

    return evidence;
  }

  /**
   * Generate recommendations.
   */
  private generateRecommendations(intelligence: {
    trend: MarketTrend;
    opportunity: MarketOpportunity;
    risks: MarketRisk[];
  }): string[] {
    const recommendations: string[] = [];

    const score = intelligence.opportunity.opportunityScore;
    const hasHighRisks = intelligence.risks.some(r => r.riskLevel === 'high' || r.riskLevel === 'critical');

    // Opportunity-based recommendations
    if (score >= 70 && !hasHighRisks) {
      recommendations.push('Strong candidate for career consideration');
    } else if (score >= 50 && !hasHighRisks) {
      recommendations.push('Worth exploring with proper due diligence');
    } else if (score < 40) {
      recommendations.push('Consider alternative paths with better prospects');
    }

    // Risk-based recommendations
    if (hasHighRisks) {
      recommendations.push('Address identified risk factors before committing');
    }

    const automationRisk = intelligence.risks.find(r => r.riskType === 'automation-exposure');
    if (automationRisk && automationRisk.riskScore > 60) {
      recommendations.push('Develop skills resistant to automation');
    }

    const competitionRisk = intelligence.risks.find(r => r.riskType === 'high-competition');
    if (competitionRisk && competitionRisk.riskScore > 60) {
      recommendations.push('Differentiate through specialized skills or niche focus');
    }

    // Trend-based recommendations
    if (intelligence.trend.trendType === 'growing') {
      recommendations.push('Enter market while growth trend continues');
    } else if (intelligence.trend.trendType === 'declining') {
      recommendations.push('Consider transition strategy if currently in this field');
    }

    return recommendations;
  }

  /**
   * Calculate narrative confidence.
   */
  private calculateNarrativeConfidence(intelligence: {
    trend: MarketTrend;
    opportunity: MarketOpportunity;
    risks: MarketRisk[];
    momentum?: MarketMomentum;
    emergingStatus?: EmergingCareer;
  }): number {
    const confidences: number[] = [
      intelligence.trend.confidence,
      intelligence.opportunity.confidence,
    ];

    // Average risk confidence
    if (intelligence.risks.length > 0) {
      const avgRiskConfidence = intelligence.risks.reduce((sum, r) => sum + r.confidence, 0) /
        intelligence.risks.length;
      confidences.push(avgRiskConfidence);
    }

    if (intelligence.momentum) {
      confidences.push(intelligence.momentum.confidence);
    }

    if (intelligence.emergingStatus) {
      confidences.push(intelligence.emergingStatus.confidence);
    }

    const avgConfidence = confidences.reduce((sum, c) => sum + c, 0) / confidences.length;

    // Boost confidence if all components agree
    const allPositive = intelligence.trend.trendType === 'growing' || intelligence.trend.trendType === 'emerging';
    const highOpportunity = intelligence.opportunity.opportunityScore > 60;
    const lowRisk = !intelligence.risks.some(r => r.riskLevel === 'high' || r.riskLevel === 'critical');

    if (allPositive && highOpportunity && lowRisk) {
      return Math.min(1, avgConfidence * 1.1);
    }

    return avgConfidence;
  }

  /**
   * Generate comparison narrative.
   */
  generateComparisonNarrative(
    entityA: { name: string; opportunity: MarketOpportunity; trend: MarketTrend },
    entityB: { name: string; opportunity: MarketOpportunity; trend: MarketTrend }
  ): string {
    const parts: string[] = [];

    parts.push(`Comparing ${entityA.name} vs ${entityB.name}:`);

    // Opportunity comparison
    const oppDiff = entityA.opportunity.opportunityScore - entityB.opportunity.opportunityScore;
    if (Math.abs(oppDiff) > 10) {
      const better = oppDiff > 0 ? entityA.name : entityB.name;
      parts.push(`${better} offers ${Math.abs(oppDiff).toFixed(0)} points better opportunity score`);
    } else {
      parts.push('Both offer similar opportunity scores');
    }

    // Trend comparison
    if (entityA.trend.trendType !== entityB.trend.trendType) {
      if ((entityA.trend.trendType === 'growing' || entityA.trend.trendType === 'emerging') &&
          (entityB.trend.trendType === 'declining' || entityB.trend.trendType === 'stable')) {
        parts.push(`${entityA.name} shows stronger growth trajectory`);
      } else if ((entityB.trend.trendType === 'growing' || entityB.trend.trendType === 'emerging') &&
                 (entityA.trend.trendType === 'declining' || entityA.trend.trendType === 'stable')) {
        parts.push(`${entityB.name} shows stronger growth trajectory`);
      }
    }

    return parts.join('. ') + '.';
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export function createMarketNarrativeEngine(
  config?: Partial<NarrativeConfig>
): MarketNarrativeEngine {
  return new MarketNarrativeEngine(config);
}

export function quickGenerateNarrative(
  entityName: string,
  trendType: MarketTrend['trendType'],
  opportunityScore: number
): string {
  const engine = new MarketNarrativeEngine();

  // Create minimal intelligence for quick narrative
  const mockTrend: MarketTrend = {
    id: 'mock',
    entityId: 'mock',
    entityType: 'career',
    trendType,
    strength: 0.7,
    confidence: 0.8,
    explanation: [],
    detectedAt: Date.now(),
    detectionMethod: 'linear-regression',
    timeWindow: { start: Date.now() - 86400000, end: Date.now() },
    supportingData: { dataPoints: 5, slope: 0.1, r2Score: 0.8 },
  };

  const mockOpportunity: MarketOpportunity = {
    id: 'mock',
    entityId: 'mock',
    entityType: 'career',
    opportunityScore,
    confidence: 0.75,
    drivers: [],
    risks: [],
    assessedAt: Date.now(),
    scoreComponents: {
      demand: 70,
      competition: 60,
      salaryGrowth: 65,
      futureOutlook: 70,
      automationRisk: 80,
    },
  };

  const narrative = engine.generateNarrative('mock', 'career', entityName, {
    trend: mockTrend,
    opportunity: mockOpportunity,
    risks: [],
  });

  return narrative.summary;
}
