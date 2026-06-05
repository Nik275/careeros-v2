/**
 * CareerOS Market Intelligence - Declining Career Model
 *
 * Represents a career experiencing structural decline.
 *
 * Examples:
 * - Manual Data Entry
 * - Traditional Print Journalism
 * - Toll Booth Operator
 * - Film Developer
 */

import type { DiscoverySignal } from './DiscoverySignal';

/**
 * Decline stage.
 */
export type DeclineStage =
  | 'early_decline'    // First signs of decline
  | 'accelerating'     // Decline speeding up
  | 'steady_decline'   // Consistent decline
  | 'terminal'         // Near obsolete
  | 'obsolete';        // No longer viable

/**
 * Decline driver.
 */
export type DeclineDriver =
  | 'automation'
  | 'ai_replacement'
  | 'outsourcing'
  | 'market_contraction'
  | 'technology_obsolescence'
  | 'regulatory_change'
  | 'industry_consolidation'
  | 'changing_preferences'
  | 'environmental_factors';

/**
 * Evidence type for declining careers.
 */
export type DeclineEvidenceType =
  | 'job_decline'
  | 'salary_stagnation'
  | 'automation_report'
  | 'industry_report'
  | 'news_article'
  | 'education_decline'
  | 'company_closure';

/**
 * A declining career record.
 */
export interface DecliningCareer {
  /** Unique identifier */
  id: string;

  /** Career title */
  title: string;

  /** Alternative titles */
  alternativeTitles: string[];

  /** Current decline stage */
  stage: DeclineStage;

  /** Overall confidence (0-100) */
  confidence: number;

  /** Decline severity (0-100) */
  declineSeverity: number;

  /** Rate of decline indicator (0-100) */
  declineRate: number;

  /** Primary decline drivers */
  drivers: DeclineDriver[];

  /** Evidence sources */
  evidenceSources: Array<{
    type: DeclineEvidenceType;
    source: string;
    url?: string;
    date: Date;
    strength: number;
  }>;

  /** Discovery signals */
  signals: DiscoverySignal[];

  /** Affected regions */
  affectedRegions: string[];

  /** Timeline estimate (years until obsolete) */
  timelineEstimate?: number;

  /** When first identified */
  identifiedAt: Date;

  /** Last updated */
  updatedAt: Date;

  /** Human review status */
  reviewStatus: 'pending' | 'in_review' | 'confirmed' | 'disputed';

  /** Review notes */
  reviewNotes?: string;

  /** Alternative career paths */
  alternativePaths: string[];

  /** Transferable skills */
  transferableSkills: string[];

  /** Reskilling difficulty (0-100) */
  reskillingDifficulty: number;
}

/**
 * Create a declining career record.
 */
export function createDecliningCareer(
  params: Omit<DecliningCareer, 'id' | 'identifiedAt' | 'updatedAt' | 'reviewStatus'>
): DecliningCareer {
  const now = new Date();

  return {
    id: `declining-career-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    identifiedAt: now,
    updatedAt: now,
    reviewStatus: 'pending',
    ...params,
  };
}

/**
 * Update decline stage based on severity.
 */
export function updateDeclineStage(
  career: DecliningCareer,
  newSeverity: number
): DeclineStage {
  if (newSeverity >= 90) return 'obsolete';
  if (newSeverity >= 75) return 'terminal';
  if (newSeverity >= 60) return 'steady_decline';
  if (newSeverity >= 40) return 'accelerating';
  return 'early_decline';
}

/**
 * Calculate decline urgency.
 */
export function calculateDeclineUrgency(career: DecliningCareer): number {
  const stageUrgency: Record<DeclineStage, number> = {
    early_decline: 30,
    accelerating: 50,
    steady_decline: 60,
    terminal: 85,
    obsolete: 100,
  };

  const baseUrgency = stageUrgency[career.stage];

  // Adjust by severity
  const severityAdjustment = (career.declineSeverity - 50) * 0.2;

  // Adjust by rate
  const rateAdjustment = (career.declineRate - 50) * 0.1;

  return Math.min(100, Math.max(0, baseUrgency + severityAdjustment + rateAdjustment));
}

/**
 * Recommend alternative paths.
 */
export function recommendAlternativePaths(
  career: DecliningCareer,
  availablePaths: Array<{ id: string; requiredSkills: string[] }>
): Array<{ pathId: string; matchScore: number; reasoning: string }> {
  const recommendations: Array<{ pathId: string; matchScore: number; reasoning: string }> = [];

  for (const path of availablePaths) {
    // Calculate skill overlap
    const overlap = path.requiredSkills.filter((skill) =>
      career.transferableSkills.includes(skill)
    ).length;

    const matchScore = path.requiredSkills.length > 0
      ? (overlap / path.requiredSkills.length) * 100
      : 0;

    if (matchScore >= 40) {
      recommendations.push({
        pathId: path.id,
        matchScore: Math.round(matchScore),
        reasoning: `${overlap} transferable skills identified`,
      });
    }
  }

  // Sort by match score
  recommendations.sort((a, b) => b.matchScore - a.matchScore);

  return recommendations;
}

/**
 * Generate decline explanation.
 */
export function generateDeclineExplanation(career: DecliningCareer): string[] {
  const explanations: string[] = [];

  explanations.push(`${career.title} is in ${career.stage.replace('_', ' ')}`);
  explanations.push(`Decline severity: ${career.declineSeverity}/100`);

  for (const driver of career.drivers) {
    switch (driver) {
      case 'automation':
        explanations.push('Automation is replacing manual tasks');
        break;
      case 'ai_replacement':
        explanations.push('AI systems are taking over core functions');
        break;
      case 'outsourcing':
        explanations.push('Work is being moved to lower-cost regions');
        break;
      case 'technology_obsolescence':
        explanations.push('Underlying technology is becoming obsolete');
        break;
      case 'market_contraction':
        explanations.push('Overall market demand is shrinking');
        break;
      default:
        explanations.push(`Driven by ${driver.replace('_', ' ')}`);
    }
  }

  return explanations;
}
