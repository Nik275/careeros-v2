/**
 * CareerOS Archetype Profile - Domain Model
 *
 * Phase 1.1: Archetype Domain Model
 *
 * Defines deep behavioral archetypes that predict career preferences,
 * decision patterns, motivation patterns, and future behavior.
 *
 * These are CAREER archetypes, not personality types.
 * They are predictive of work behavior, not descriptive of personality.
 *
 * @module archetype-profile
 * @version 1.0.0
 */

/**
 * Career archetype types.
 *
 * Each archetype represents a fundamental pattern of career behavior,
 * motivation, and preference. These are mutually exclusive categories
 * that describe how a person approaches work, not who they are socially.
 *
 * @enum {string}
 */
export type ArchetypeType =
  | 'BUILDER'
  | 'RESEARCHER'
  | 'CREATOR'
  | 'OPERATOR'
  | 'LEADER'
  | 'EXPLORER'
  | 'TEACHER'
  | 'PROTECTOR'
  | 'STRATEGIST'
  | 'FOUNDER'
  | 'CRAFTSMAN';

/**
 * Human-readable descriptions for each archetype.
 *
 * Used for display and explanation purposes.
 */
export const ARCHETYPE_DESCRIPTIONS: Record<ArchetypeType, string> = {
  BUILDER: 'Creates systems, builds products, enjoys tangible creation',
  RESEARCHER: 'Seeks understanding, deep thinker, knowledge driven',
  CREATOR: 'Expression driven, originality driven, creative output focused',
  OPERATOR: 'Execution driven, process driven, reliable finisher',
  LEADER: 'Influence driven, people driven, direction setting',
  EXPLORER: 'Novelty driven, curiosity driven, change seeking',
  TEACHER: 'Learning driven, explanation driven, mentorship oriented',
  PROTECTOR: 'Security driven, responsibility driven, service oriented',
  STRATEGIST: 'Systems thinker, long-term planner, optimization focused',
  FOUNDER: 'Opportunity driven, autonomy driven, risk tolerant',
  CRAFTSMAN: 'Mastery driven, quality obsessed, skill perfection oriented',
};

/**
 * Core behavioral drivers for each archetype.
 *
 * Describes what fundamentally motivates individuals of each archetype.
 */
export const ARCHETYPE_DRIVERS: Record<ArchetypeType, string[]> = {
  BUILDER: ['Creation', 'Tangible output', 'System building', 'Product development'],
  RESEARCHER: ['Understanding', 'Truth seeking', 'Deep analysis', 'Knowledge discovery'],
  CREATOR: ['Originality', 'Self expression', 'Artistic output', 'Novel ideas'],
  OPERATOR: ['Execution', 'Process excellence', 'Reliability', 'Completion'],
  LEADER: ['Influence', 'Team success', 'Direction setting', 'People development'],
  EXPLORER: ['Novelty', 'Discovery', 'Change', 'New experiences'],
  TEACHER: ['Knowledge sharing', 'Mentorship', 'Explanation', 'Growth of others'],
  PROTECTOR: ['Security', 'Responsibility', 'Service', 'Caregiving'],
  STRATEGIST: ['Systems thinking', 'Optimization', 'Long-term planning', 'Pattern recognition'],
  FOUNDER: ['Autonomy', 'Opportunity capture', 'Risk taking', 'Creation of organizations'],
  CRAFTSMAN: ['Mastery', 'Quality', 'Skill perfection', 'Excellence'],
};

/**
 * Typical career preferences for each archetype.
 *
 * Describes work environments and role types that align with each archetype.
 */
export const ARCHETYPE_CAREER_PREFERENCES: Record<ArchetypeType, string[]> = {
  BUILDER: [
    'Software engineering',
    'Product development',
    'Infrastructure roles',
    'Technical architecture',
    'Manufacturing',
  ],
  RESEARCHER: [
    'R&D roles',
    'Data science',
    'Academic research',
    'Market research',
    'Scientific roles',
  ],
  CREATOR: [
    'Design roles',
    'Content creation',
    'Artistic professions',
    'Writing',
    'Creative direction',
  ],
  OPERATOR: [
    'Operations management',
    'Project management',
    'Supply chain',
    'Logistics',
    'Process engineering',
  ],
  LEADER: [
    'Management roles',
    'Executive positions',
    'Team leadership',
    'People management',
    'Organizational development',
  ],
  EXPLORER: [
    'Consulting',
    'Travel-heavy roles',
    'R&D exploration',
    'Early-stage startups',
    'Field research',
  ],
  TEACHER: [
    'Education roles',
    'Training positions',
    'Mentorship roles',
    'Knowledge management',
    'Technical writing',
  ],
  PROTECTOR: [
    'Healthcare',
    'Social work',
    'Security roles',
    'Risk management',
    'Compliance',
  ],
  STRATEGIST: [
    'Strategy consulting',
    'Business planning',
    'Systems architecture',
    'Policy development',
    'Corporate strategy',
  ],
  FOUNDER: [
    'Entrepreneurship',
    'Startup roles',
    'Business development',
    'Venture roles',
    'Intrapreneurship',
  ],
  CRAFTSMAN: [
    'Specialized trades',
    'Expert consulting',
    'Quality assurance',
    'Artisan roles',
    'Technical mastery roles',
  ],
};

/**
 * Score for a single archetype.
 *
 * Represents the strength of match between a student and a specific archetype.
 *
 * @interface ArchetypeScore
 */
export interface ArchetypeScore {
  /**
   * The archetype being scored.
   */
  readonly archetype: ArchetypeType;

  /**
   * Match score (0-100).
   *
   * Higher values indicate stronger alignment with this archetype.
   * 0 = no alignment
   * 100 = perfect alignment
   */
  readonly score: number;

  /**
   * Confidence in the score (0-100).
   *
   * Reflects data quality and assessment reliability.
   * 0 = no confidence
   * 100 = complete confidence
   */
  readonly confidence: number;
}

/**
 * Reliability level for archetype assessment.
 *
 * Categorical assessment of how reliable the archetype determination is.
 *
 * @enum {string}
 */
export type ArchetypeReliability =
  | 'HIGH'
  | 'MODERATE'
  | 'LOW'
  | 'INSUFFICIENT_DATA';

/**
 * Confidence metrics for archetype profile.
 *
 * Provides detailed confidence information about the archetype assessment.
 *
 * @interface ArchetypeConfidence
 */
export interface ArchetypeConfidence {
  /**
   * Overall confidence score (0-100).
   *
   * Aggregate measure of confidence across all archetype determinations.
   */
  readonly confidenceScore: number;

  /**
   * Number of evidence points used in assessment.
   *
   * Count of data points (assessments, behaviors, preferences)
   * that contributed to the archetype determination.
   */
  readonly evidenceCount: number;

  /**
   * Reliability classification.
   *
   * Categorical assessment based on confidence score and evidence count.
   */
  readonly reliability: ArchetypeReliability;
}

/**
 * Complete archetype profile for a student.
 *
 * Captures the primary and secondary archetypes as well as scores
 * across all archetypes. Used for career matching, recommendation,
 * and decision support.
 *
 * @interface ArchetypeProfile
 */
export interface ArchetypeProfile {
  /**
   * Unique identifier for the archetype profile.
   */
  readonly profileId: string;

  /**
   * Primary archetype.
   *
   * The dominant career behavior pattern for this student.
   * Represents their strongest natural inclination.
   */
  readonly primaryArchetype: ArchetypeType;

  /**
   * Secondary archetype.
   *
   * The second-strongest career behavior pattern.
   * Often represents how the student differs from pure primary archetype.
   * Can be undefined if no secondary archetype is clearly identified.
   */
  readonly secondaryArchetype?: ArchetypeType;

  /**
   * Scores for all archetypes.
   *
   * Complete scoring across all 11 archetypes.
   * Allows for nuanced understanding of archetype composition.
   */
  readonly archetypeScores: ArchetypeScore[];

  /**
   * Confidence metrics.
   *
   * Detailed confidence information about the assessment.
   */
  readonly confidence: ArchetypeConfidence;

  /**
   * Timestamp when profile was created/updated.
   */
  readonly assessedAt: Date;
}

/**
 * Archetype compatibility score.
 *
 * Represents how compatible a specific archetype is with a career.
 *
 * @interface ArchetypeCompatibility
 */
export interface ArchetypeCompatibility {
  /**
   * The archetype being evaluated.
   */
  readonly archetype: ArchetypeType;

  /**
   * Compatibility score (0-100).
   *
   * Higher values indicate better fit between archetype and career.
   */
  readonly compatibilityScore: number;

  /**
   * Explanation of why this archetype fits or doesn't fit.
   */
  readonly rationale: string;
}

/**
 * Archetype transition pattern.
 *
 * Describes how archetypes might evolve or combine over a career.
 *
 * @interface ArchetypeTransition
 */
export interface ArchetypeTransition {
  /**
   * Starting archetype.
   */
  readonly fromArchetype: ArchetypeType;

  /**
   * Ending archetype.
   */
  readonly toArchetype: ArchetypeType;

  /**
   * Typical career stage when transition occurs.
   */
  readonly typicalStage: 'EARLY' | 'MID' | 'SENIOR';

  /**
   * Common triggers for this transition.
   */
  readonly commonTriggers: string[];

  /**
   * Likelihood of this transition (0-100).
   */
  readonly likelihood: number;
}

/**
 * Common archetype combinations.
 *
 * Describes frequently occurring primary-secondary archetype pairs
 * and their characteristics.
 */
export const COMMON_ARCHETYPE_COMBINATIONS: Array<{
  readonly primary: ArchetypeType;
  readonly secondary: ArchetypeType;
  readonly description: string;
}> = [
  {
    primary: 'BUILDER',
    secondary: 'FOUNDER',
    description: 'Technical founder who builds products and companies',
  },
  {
    primary: 'RESEARCHER',
    secondary: 'TEACHER',
    description: 'Academic who advances knowledge and educates others',
  },
  {
    primary: 'CREATOR',
    secondary: 'BUILDER',
    description: 'Creative technologist who builds creative tools',
  },
  {
    primary: 'OPERATOR',
    secondary: 'LEADER',
    description: 'Operational leader who executes through teams',
  },
  {
    primary: 'LEADER',
    secondary: 'STRATEGIST',
    description: 'Strategic leader who sets direction and optimizes systems',
  },
  {
    primary: 'EXPLORER',
    secondary: 'FOUNDER',
    description: 'Serial entrepreneur who explores new opportunities',
  },
  {
    primary: 'TEACHER',
    secondary: 'CREATOR',
    description: 'Creative educator who develops novel teaching methods',
  },
  {
    primary: 'STRATEGIST',
    secondary: 'RESEARCHER',
    description: 'Research strategist who uses deep analysis for planning',
  },
  {
    primary: 'FOUNDER',
    secondary: 'BUILDER',
    description: 'Technical founder focused on product creation',
  },
  {
    primary: 'CRAFTSMAN',
    secondary: 'RESEARCHER',
    description: 'Master practitioner who advances their field',
  },
];

/**
 * Archetype conflict patterns.
 *
 * Describes archetype pairs that often create internal tension
 * or difficult career choices.
 */
export const ARCHETYPE_CONFLICTS: Array<{
  readonly archetype1: ArchetypeType;
  readonly archetype2: ArchetypeType;
  readonly conflict: string;
}> = [
  {
    archetype1: 'FOUNDER',
    archetype2: 'PROTECTOR',
    conflict: 'Risk tolerance vs. security seeking',
  },
  {
    archetype1: 'EXPLORER',
    archetype2: 'CRAFTSMAN',
    conflict: 'Novelty seeking vs. deep mastery',
  },
  {
    archetype1: 'LEADER',
    archetype2: 'RESEARCHER',
    conflict: 'People focus vs. solitary deep work',
  },
  {
    archetype1: 'OPERATOR',
    archetype2: 'CREATOR',
    conflict: 'Process adherence vs. creative freedom',
  },
  {
    archetype1: 'BUILDER',
    archetype2: 'STRATEGIST',
    conflict: 'Execution focus vs. planning focus',
  },
];

/**
 * Gets the description for an archetype.
 *
 * @param archetype - The archetype to describe
 * @returns Human-readable description
 */
export function getArchetypeDescription(archetype: ArchetypeType): string {
  return ARCHETYPE_DESCRIPTIONS[archetype];
}

/**
 * Gets the drivers for an archetype.
 *
 * @param archetype - The archetype
 * @returns Array of behavioral drivers
 */
export function getArchetypeDrivers(archetype: ArchetypeType): string[] {
  return ARCHETYPE_DRIVERS[archetype];
}

/**
 * Gets career preferences for an archetype.
 *
 * @param archetype - The archetype
 * @returns Array of preferred career types
 */
export function getArchetypeCareerPreferences(archetype: ArchetypeType): string[] {
  return ARCHETYPE_CAREER_PREFERENCES[archetype];
}

/**
 * Calculates reliability from confidence score and evidence count.
 *
 * @param confidenceScore - Confidence score (0-100)
 * @param evidenceCount - Number of evidence points
 * @returns Reliability classification
 */
export function calculateReliability(
  confidenceScore: number,
  evidenceCount: number
): ArchetypeReliability {
  if (confidenceScore >= 75 && evidenceCount >= 10) {
    return 'HIGH';
  }
  if (confidenceScore >= 50 && evidenceCount >= 5) {
    return 'MODERATE';
  }
  if (confidenceScore >= 30 && evidenceCount >= 3) {
    return 'LOW';
  }
  return 'INSUFFICIENT_DATA';
}

/**
 * All archetype types as an array.
 */
export const ALL_ARCHETYPE_TYPES: ArchetypeType[] = [
  'BUILDER',
  'RESEARCHER',
  'CREATOR',
  'OPERATOR',
  'LEADER',
  'EXPLORER',
  'TEACHER',
  'PROTECTOR',
  'STRATEGIST',
  'FOUNDER',
  'CRAFTSMAN',
];

/**
 * Number of archetypes in the system.
 */
export const ARCHETYPE_COUNT = ALL_ARCHETYPE_TYPES.length;
