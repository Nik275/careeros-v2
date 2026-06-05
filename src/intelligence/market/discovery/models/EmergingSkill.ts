/**
 * CareerOS Market Intelligence - Emerging Skill Model
 *
 * Represents a newly discovered skill gaining relevance.
 *
 * Examples:
 * - Agent Orchestration
 * - LLMOps
 * - AI Governance
 * - Synthetic Data Engineering
 * - Prompt Evaluation
 */

import type { DiscoverySignal } from './DiscoverySignal';

/**
 * Skill adoption stage.
 */
export type SkillAdoptionStage =
  | 'experimental'    // Early adopters experimenting
  | 'early_adoption'  // Growing interest
  | 'early_majority'  // Mainstream awareness
  | 'late_majority'   // Broad adoption
  | 'ubiquitous';     // Standard skill

/**
 * Skill category.
 */
export type SkillCategory =
  | 'technical'
  | 'ai_ml'
  | 'data'
  | 'soft'
  | 'domain'
  | 'emerging_tech'
  | 'automation'
  | 'sustainability'
  | 'security'
  | 'creative';

/**
 * Evidence type for skills.
 */
export type SkillEvidenceType =
  | 'job_description'
  | 'course_catalog'
  | 'certification'
  | 'tool_platform'
  | 'github_activity'
  | 'research_paper'
  | 'conference'
  | 'social_mention';

/**
 * An emerging skill discovery.
 */
export interface EmergingSkill {
  /** Unique identifier */
  id: string;

  /** Skill name */
  name: string;

  /** Alternative names */
  alternativeNames: string[];

  /** Skill category */
  category: SkillCategory;

  /** Current adoption stage */
  stage: SkillAdoptionStage;

  /** Overall confidence (0-100) */
  confidence: number;

  /** Growth signal strength (0-100) */
  growthSignal: number;

  /** Adoption signal strength (0-100) */
  adoptionSignal: number;

  /** Momentum score (0-100) */
  momentum: number;

  /** Evidence sources */
  evidenceSources: Array<{
    type: SkillEvidenceType;
    source: string;
    url?: string;
    date: Date;
    strength: number;
  }>;

  /** Discovery signals */
  signals: DiscoverySignal[];

  /** Related skills */
  relatedSkills: string[];

  /** Prerequisites */
  prerequisites: string[];

  /** Tools/platforms associated */
  tools: string[];

  /** Industries adopting */
  adoptingIndustries: string[];

  /** Geographic distribution */
  geography: {
    leadingRegions: string[];
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

  /** Learning curve assessment */
  learningCurve: 'steep' | 'moderate' | 'gentle' | 'unknown';

  /** Time to proficiency (months) */
  timeToProficiency?: number;
}

/**
 * Create an emerging skill record.
 */
export function createEmergingSkill(
  params: Omit<EmergingSkill, 'id' | 'discoveredAt' | 'updatedAt' | 'reviewStatus'>
): EmergingSkill {
  const now = new Date();

  return {
    id: `emerging-skill-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    discoveredAt: now,
    updatedAt: now,
    reviewStatus: 'pending',
    ...params,
  };
}

/**
 * Update skill stage based on adoption metrics.
 */
export function updateSkillStage(
  skill: EmergingSkill,
  jobMentions: number,
  courseAvailability: number,
  toolMaturity: number
): SkillAdoptionStage {
  const avgMetric = (jobMentions + courseAvailability + toolMaturity) / 3;

  if (avgMetric < 20) return 'experimental';
  if (avgMetric < 40) return 'early_adoption';
  if (avgMetric < 60) return 'early_majority';
  if (avgMetric < 80) return 'late_majority';
  return 'ubiquitous';
}

/**
 * Calculate skill relevance score.
 */
export function calculateRelevanceScore(skill: EmergingSkill): number {
  // Base score from signals
  const signalScore = skill.growthSignal * 0.4 + skill.adoptionSignal * 0.3;

  // Industry diversity bonus
  const industryBonus = Math.min(20, skill.adoptingIndustries.length * 4);

  // Evidence quality bonus
  const evidenceTypes = new Set(skill.evidenceSources.map((e) => e.type)).size;
  const evidenceBonus = Math.min(15, evidenceTypes * 3);

  // Stage progression bonus
  const stageBonus: Record<SkillAdoptionStage, number> = {
    experimental: 5,
    early_adoption: 10,
    early_majority: 15,
    late_majority: 10,
    ubiquitous: 5,
  };

  return Math.min(100, signalScore + industryBonus + evidenceBonus + stageBonus[skill.stage]);
}

/**
 * Predict skill trajectory.
 */
export function predictSkillTrajectory(
  skill: EmergingSkill,
  recentSignals: DiscoverySignal[]
): {
  direction: 'accelerating' | 'stable' | 'decelerating';
  confidence: number;
  projectedStage: SkillAdoptionStage;
} {
  if (recentSignals.length < 3) {
    return {
      direction: 'stable',
      confidence: 30,
      projectedStage: skill.stage,
    };
  }

  const avgStrength = recentSignals.reduce((sum, s) => sum + s.strength, 0) / recentSignals.length;
  const momentum = skill.momentum;

  let direction: 'accelerating' | 'stable' | 'decelerating';
  if (momentum > 70 && avgStrength > 60) direction = 'accelerating';
  else if (momentum < 30 && avgStrength < 40) direction = 'decelerating';
  else direction = 'stable';

  // Project next stage
  const stages: SkillAdoptionStage[] = ['experimental', 'early_adoption', 'early_majority', 'late_majority', 'ubiquitous'];
  const currentIndex = stages.indexOf(skill.stage);
  let projectedIndex = currentIndex;

  if (direction === 'accelerating' && currentIndex < stages.length - 1) {
    projectedIndex = currentIndex + 1;
  }

  return {
    direction,
    confidence: Math.round(skill.confidence * 0.8),
    projectedStage: stages[projectedIndex]!,
  };
}
