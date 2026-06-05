/**
 * CareerOS Market Intelligence - Emerging Industry Model
 *
 * Represents a newly discovered industry sector.
 *
 * Examples:
 * - Agent Economy
 * - Climate Tech
 * - Defense Tech
 * - Synthetic Biology
 * - Space Infrastructure
 * - Industrial AI
 */

import type { DiscoverySignal } from './DiscoverySignal';

/**
 * Industry maturity stage.
 */
export type IndustryMaturityStage =
  | 'frontier'        // Pure speculation
  | 'emerging'        // Early commercial activity
  | 'growth'          // Rapid expansion
  | 'consolidation'   // Market sorting
  | 'mature';         // Established sector

/**
 * Industry category.
 */
export type IndustryCategory =
  | 'technology'
  | 'sustainability'
  | 'healthcare'
  | 'finance'
  | 'manufacturing'
  | 'energy'
  | 'transportation'
  | 'defense'
  | 'media'
  | 'agriculture';

/**
 * Evidence type for industries.
 */
export type IndustryEvidenceType =
  | 'funding_round'
  | 'ipo'
  | 'acquisition'
  | 'regulatory_filing'
  | 'industry_report'
  | 'market_research'
  | 'news_coverage'
  | 'conference_launch'
  | 'patent_filing';

/**
 * An emerging industry discovery.
 */
export interface EmergingIndustry {
  /** Unique identifier */
  id: string;

  /** Industry name */
  name: string;

  /** Alternative names */
  alternativeNames: string[];

  /** Industry category */
  category: IndustryCategory;

  /** Current maturity stage */
  stage: IndustryMaturityStage;

  /** Overall confidence (0-100) */
  confidence: number;

  /** Growth signal strength (0-100) */
  growthSignal: number;

  /** Investment signal strength (0-100) */
  investmentSignal: number;

  /** Market size indicator (0-100 relative scale) */
  marketSizeIndicator: number;

  /** Momentum score (0-100) */
  momentum: number;

  /** Evidence sources */
  evidenceSources: Array<{
    type: IndustryEvidenceType;
    source: string;
    url?: string;
    date: Date;
    strength: number;
  }>;

  /** Discovery signals */
  signals: DiscoverySignal[];

  /** Key players */
  keyPlayers: string[];

  /** Related technologies */
  relatedTechnologies: string[];

  /** Geographic centers */
  geography: {
    leadingHubs: string[];
    emergingHubs: string[];
  };

  /** Regulatory environment */
  regulatoryEnvironment: 'supportive' | 'neutral' | 'uncertain' | 'restrictive';

  /** When first discovered */
  discoveredAt: Date;

  /** Last updated */
  updatedAt: Date;

  /** Human review status */
  reviewStatus: 'pending' | 'in_review' | 'approved' | 'rejected';

  /** Review notes */
  reviewNotes?: string;

  /** Investment trend */
  investmentTrend: 'accelerating' | 'growing' | 'stable' | 'slowing' | 'declining';

  /** Talent demand indicator */
  talentDemand: number;
}

/**
 * Create an emerging industry record.
 */
export function createEmergingIndustry(
  params: Omit<EmergingIndustry, 'id' | 'discoveredAt' | 'updatedAt' | 'reviewStatus'>
): EmergingIndustry {
  const now = new Date();

  return {
    id: `emerging-industry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    discoveredAt: now,
    updatedAt: now,
    reviewStatus: 'pending',
    ...params,
  };
}

/**
 * Update industry stage based on maturity indicators.
 */
export function updateIndustryStage(
  industry: EmergingIndustry,
  companyCount: number,
  totalFunding: number,
  marketAwareness: number
): IndustryMaturityStage {
  // Normalize indicators to 0-100 scale
  const companyScore = Math.min(100, companyCount * 2);
  const fundingScore = Math.min(100, totalFunding / 10);
  const awarenessScore = marketAwareness;

  const avgScore = (companyScore + fundingScore + awarenessScore) / 3;

  if (avgScore < 20) return 'frontier';
  if (avgScore < 40) return 'emerging';
  if (avgScore < 70) return 'growth';
  if (avgScore < 85) return 'consolidation';
  return 'mature';
}

/**
 * Calculate industry opportunity score.
 */
export function calculateOpportunityScore(industry: EmergingIndustry): number {
  // Growth signal weight
  const growthScore = industry.growthSignal * 0.35;

  // Investment signal weight
  const investmentScore = industry.investmentSignal * 0.25;

  // Market size weight
  const sizeScore = industry.marketSizeIndicator * 0.2;

  // Talent demand weight
  const talentScore = industry.talentDemand * 0.2;

  let baseScore = growthScore + investmentScore + sizeScore + talentScore;

  // Regulatory adjustment
  const regulatoryMultiplier: Record<string, number> = {
    supportive: 1.1,
    neutral: 1.0,
    uncertain: 0.9,
    restrictive: 0.7,
  };

  baseScore *= regulatoryMultiplier[industry.regulatoryEnvironment] ?? 1.0;

  // Stage adjustment
  const stageMultiplier: Record<IndustryMaturityStage, number> = {
    frontier: 0.8,
    emerging: 1.0,
    growth: 1.1,
    consolidation: 0.9,
    mature: 0.7,
  };

  baseScore *= stageMultiplier[industry.stage] ?? 1.0;

  return Math.min(100, Math.round(baseScore));
}

/**
 * Assess industry risk level.
 */
export function assessIndustryRisk(
  industry: EmergingIndustry
): {
  level: 'low' | 'moderate' | 'high' | 'extreme';
  factors: string[];
} {
  const factors: string[] = [];
  let riskScore = 0;

  // Stage risk
  if (industry.stage === 'frontier') {
    riskScore += 30;
    factors.push('Very early stage');
  } else if (industry.stage === 'emerging') {
    riskScore += 20;
    factors.push('Early stage volatility');
  }

  // Regulatory risk
  if (industry.regulatoryEnvironment === 'uncertain') {
    riskScore += 20;
    factors.push('Uncertain regulatory environment');
  } else if (industry.regulatoryEnvironment === 'restrictive') {
    riskScore += 30;
    factors.push('Restrictive regulations');
  }

  // Confidence risk
  if (industry.confidence < 50) {
    riskScore += 15;
    factors.push('Low confidence in signals');
  }

  // Market size risk
  if (industry.marketSizeIndicator < 30) {
    riskScore += 10;
    factors.push('Small addressable market');
  }

  // Determine level
  let level: 'low' | 'moderate' | 'high' | 'extreme';
  if (riskScore >= 70) level = 'extreme';
  else if (riskScore >= 50) level = 'high';
  else if (riskScore >= 30) level = 'moderate';
  else level = 'low';

  return { level, factors };
}
