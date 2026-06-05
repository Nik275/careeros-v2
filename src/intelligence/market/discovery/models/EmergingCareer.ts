/**
 * CareerOS Market Intelligence - Emerging Career Model
 *
 * Represents a newly discovered career opportunity.
 *
 * Examples:
 * - AI Agent Engineer
 * - Climate Risk Analyst
 * - Synthetic Media Producer
 * - Digital Twin Architect
 */

import type { DiscoverySignal } from './DiscoverySignal';

/**
 * Lifecycle stage of an emerging career.
 */
export type CareerLifecycleStage =
  | 'unverified'      // Initial detection, needs validation
  | 'emerging'        // Confirmed emergence, low volume
  | 'growing'         // Accelerating adoption
  | 'establishing'    // Becoming mainstream
  | 'established';    // Fully recognized career

/**
 * Evidence type for emerging careers.
 */
export type CareerEvidenceType =
  | 'job_posting'
  | 'industry_report'
  | 'news_article'
  | 'research_paper'
  | 'conference_talk'
  | 'education_program'
  | 'certification'
  | 'funding_news'
  | 'patent';

/**
 * An emerging career discovery.
 */
export interface EmergingCareer {
  /** Unique identifier */
  id: string;

  /** Career title */
  title: string;

  /** Alternative titles */
  alternativeTitles: string[];

  /** Current lifecycle stage */
  stage: CareerLifecycleStage;

  /** Overall confidence (0-100) */
  confidence: number;

  /** Growth signal strength (0-100) */
  growthSignal: number;

  /** Demand signal strength (0-100) */
  demandSignal: number;

  /** Momentum score (0-100) */
  momentum: number;

  /** Evidence sources */
  evidenceSources: Array<{
    type: CareerEvidenceType;
    source: string;
    url?: string;
    date: Date;
    strength: number;
  }>;

  /** Discovery signals */
  signals: DiscoverySignal[];

  /** Related skills */
  relatedSkills: string[];

  /** Related industries */
  relatedIndustries: string[];

  /** Geographic distribution */
  geography: {
    primaryRegions: string[];
    emergingRegions: string[];
  };

  /** When first discovered */
  discoveredAt: Date;

  /** Last updated */
  updatedAt: Date;

  /** Human review status */
  reviewStatus: 'pending' | 'in_review' | 'approved' | 'rejected';

  /** Review notes */
  reviewNotes?: string;

  /** Estimated market size (0-100 relative scale) */
  estimatedMarketSize: number;

  /** Salary indicators */
  salaryIndicators: {
    entryLevel?: number;
    midLevel?: number;
    seniorLevel?: number;
    currency: string;
  };
}

/**
 * Create an emerging career record.
 */
export function createEmergingCareer(
  params: Omit<EmergingCareer, 'id' | 'discoveredAt' | 'updatedAt' | 'reviewStatus'>
): EmergingCareer {
  const now = new Date();

  return {
    id: `emerging-career-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    discoveredAt: now,
    updatedAt: now,
    reviewStatus: 'pending',
    ...params,
  };
}

/**
 * Update career stage based on signals.
 */
export function updateCareerStage(
  career: EmergingCareer,
  signalCount: number,
  avgConfidence: number
): CareerLifecycleStage {
  if (signalCount < 3 || avgConfidence < 40) {
    return 'unverified';
  }

  if (signalCount < 10 || avgConfidence < 60) {
    return 'emerging';
  }

  if (signalCount < 25 || avgConfidence < 75) {
    return 'growing';
  }

  if (signalCount < 50) {
    return 'establishing';
  }

  return 'established';
}

/**
 * Calculate career maturity score.
 */
export function calculateMaturityScore(career: EmergingCareer): number {
  const stageScores: Record<CareerLifecycleStage, number> = {
    unverified: 10,
    emerging: 30,
    growing: 50,
    establishing: 75,
    established: 100,
  };

  const baseScore = stageScores[career.stage];

  // Adjust by signal quality
  const signalBonus = Math.min(20, career.signals.length * 2);

  // Adjust by evidence diversity
  const evidenceTypes = new Set(career.evidenceSources.map((e) => e.type)).size;
  const evidenceBonus = Math.min(15, evidenceTypes * 3);

  return Math.min(100, baseScore + signalBonus + evidenceBonus);
}

/**
 * Compare two emerging careers.
 */
export function compareEmergingCareers(
  a: EmergingCareer,
  b: EmergingCareer
): {
  strongerGrowth: 'a' | 'b' | 'tie';
  higherConfidence: 'a' | 'b' | 'tie';
  moreMature: 'a' | 'b' | 'tie';
} {
  const strongerGrowth = a.growthSignal > b.growthSignal + 10
    ? 'a'
    : b.growthSignal > a.growthSignal + 10
    ? 'b'
    : 'tie';

  const higherConfidence = a.confidence > b.confidence + 10
    ? 'a'
    : b.confidence > a.confidence + 10
    ? 'b'
    : 'tie';

  const maturityA = calculateMaturityScore(a);
  const maturityB = calculateMaturityScore(b);

  const moreMature = maturityA > maturityB + 10
    ? 'a'
    : maturityB > maturityA + 10
    ? 'b'
    : 'tie';

  return { strongerGrowth, higherConfidence, moreMature };
}
