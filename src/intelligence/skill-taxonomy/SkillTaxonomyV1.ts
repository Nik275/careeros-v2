/**
 * CareerOS Skill Taxonomy V1
 *
 * Hierarchical skill intelligence layer for CareerOS.
 * Enables accurate transferability calculations, career similarity,
 * skill gap analysis, and transition difficulty estimation.
 *
 * Features:
 * - Hierarchical skill nodes (parent-child relationships)
 * - Skill categories (technical, analytical, creative, business, leadership, communication, domain)
 * - Future importance and AI resistance scoring
 * - Transferability calculations
 * - Career skill requirements
 * - Skill gap analysis
 *
 * @module intelligence/skill-taxonomy
 * @version 1.0.0
 */

import type { CareerSlug } from '../../domains/career/Career.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Unique identifier for skills
 */
export type SkillId = string;

/**
 * Skill categories
 */
export type SkillCategory =
  | 'technical'      // Programming, engineering, tools
  | 'analytical'     // Data analysis, research, problem-solving
  | 'creative'       // Design, writing, artistic
  | 'business'       // Strategy, finance, operations
  | 'leadership'     // Management, mentorship, decision-making
  | 'communication'  // Presentation, negotiation, writing
  | 'domain';        // Industry-specific knowledge

/**
 * Proficiency levels
 */
export type ProficiencyLevel =
  | 'beginner'       // Basic understanding
  | 'intermediate'   // Practical application
  | 'advanced'       // Expert execution
  | 'expert';        // Mastery and innovation

/**
 * Single node in the skill hierarchy
 */
export interface SkillNode {
  /** Unique skill identifier */
  id: SkillId;

  /** Human-readable name */
  name: string;

  /** Skill category */
  category: SkillCategory;

  /** Parent skill (for hierarchical relationships) */
  parentSkillId?: SkillId;

  /** Child skills (derived from taxonomy) */
  childSkillIds?: SkillId[];

  /** Detailed description */
  description: string;

  /**
   * Future importance (0-100)
   * How critical this skill will be in future job markets
   */
  futureImportance: number;

  /**
   * AI resistance (0-100)
   * How resistant this skill is to AI automation
   * 0 = easily automated, 100 = uniquely human
   */
  aiResistance: number;

  /**
   * Transferability (0-100)
   * How easily this skill transfers across careers
   */
  transferability: number;

  /**
   * Time to acquire (months) for average learner
   */
  timeToAcquireMonths: number;

  /**
   * Related skills (adjacent in skill graph) */
  relatedSkillIds: SkillId[];

  /**
   * Metadata
   */
  metadata: {
    /** When this skill was added to taxonomy */
    createdAt: number;

    /** When last updated */
    updatedAt: number;

    /** Data source */
    source: string;

    /** Confidence in data (low/medium/high) */
    confidence: 'low' | 'medium' | 'high';
  };
}

/**
 * Skill requirement for a specific career
 */
export interface CareerSkillRequirement {
  /** Skill identifier */
  skillId: SkillId;

  /**
   * Importance to career success (0-100)
   * 0 = nice to have, 100 = absolutely essential
   */
  importance: number;

  /**
   * Minimum proficiency required
   */
  minimumProficiency: ProficiencyLevel;

  /**
   * Future importance (0-100)
   * How important this skill will be in 5-10 years
   */
  futureImportance: number;

  /**
   * Whether this skill is emerging (growing importance)
   */
  isEmerging: boolean;

  /**
   * Whether this skill is declining (shrinking importance)
   */
  isDeclining: boolean;

  /**
   * Alternative skills that can substitute
   */
  alternativeSkillIds: SkillId[];
}

/**
 * Complete skill profile for a career
 */
export interface CareerSkillProfile {
  /** Career identifier */
  careerId: CareerSlug;

  /** Required skills (must have) */
  requiredSkills: CareerSkillRequirement[];

  /** Optional skills (nice to have) */
  optionalSkills: CareerSkillRequirement[];

  /** Emerging skills (growing importance) */
  emergingSkills: CareerSkillRequirement[];

  /** Declining skills (shrinking importance) */
  decliningSkills: CareerSkillRequirement[];

  /** Core skill categories for this career */
  primaryCategories: SkillCategory[];

  /** Skill complexity score (0-100) */
  complexityScore: number;

  /** Learning curve duration (months) */
  learningCurveMonths: number;
}

/**
 * Student's skill inventory
 */
export interface StudentSkillInventory {
  /** Student identifier */
  studentId: string;

  /** Skills with proficiency levels */
  skills: Array<{
    skillId: SkillId;
    proficiency: ProficiencyLevel;
    acquiredAt: number;
    source: 'education' | 'work' | 'self-study' | 'certification';
  }>;

  /** Last updated */
  updatedAt: number;
}

/**
 * Skill gap between student and career requirement
 */
export interface SkillGap {
  /** Skill identifier */
  skillId: SkillId;

  /** Skill name */
  skillName: string;

  /** Required proficiency */
  requiredProficiency: ProficiencyLevel;

  /** Current proficiency (null if missing) */
  currentProficiency: ProficiencyLevel | null;

  /** Gap severity */
  severity: 'critical' | 'significant' | 'moderate' | 'minor' | 'none';

  /** Importance to career */
  importance: number;

  /** Time to close gap (months) */
  timeToCloseMonths: number;

  /** Whether this is a blocking gap */
  isBlocking: boolean;
}

/**
 * Complete skill gap report
 */
export interface SkillGapReport {
  /** Report identifier */
  id: string;

  /** Career being analyzed */
  careerId: CareerSlug;

  /** Student being analyzed */
  studentId: string;

  /** Current skills student has */
  currentSkills: Array<{
    skillId: SkillId;
    skillName: string;
    proficiency: ProficiencyLevel;
    category: SkillCategory;
  }>;

  /** Missing skills required by career */
  missingSkills: SkillGap[];

  /** Skills that transfer from current to target */
  transferableSkills: Array<{
    skillId: SkillId;
    skillName: string;
    proficiency: ProficiencyLevel;
    relevanceToTarget: number;
  }>;

  /** Fastest upskill path */
  fastestUpskillPath: {
    skills: SkillId[];
    totalTimeMonths: number;
    priority: 'high' | 'medium' | 'low';
  };

  /** Estimated total learning time */
  estimatedLearningTimeMonths: number;

  /** Overall readiness score (0-100) */
  readinessScore: number;

  /** Generated timestamp */
  generatedAt: number;
}

/**
 * Skill similarity between two careers
 */
export interface SkillSimilarity {
  /** Source career */
  sourceCareerId: CareerSlug;

  /** Target career */
  targetCareerId: CareerSlug;

  /** Overall similarity score (0-100) */
  similarityScore: number;

  /** Common skills */
  commonSkills: Array<{
    skillId: SkillId;
    skillName: string;
    importanceInSource: number;
    importanceInTarget: number;
  }>;

  /** Skills unique to source */
  uniqueToSource: Array<{
    skillId: SkillId;
    skillName: string;
    importance: number;
  }>;

  /** Skills unique to target */
  uniqueToTarget: Array<{
    skillId: SkillId;
    skillName: string;
    importance: number;
  }>;

  /** Transferability analysis */
  transferability: {
    /** Percentage of source skills that transfer */
    transferPercentage: number;

    /** Weighted by importance */
    weightedTransferPercentage: number;

    /** High-value transferable skills */
    highValueTransfers: SkillId[];
  };

  /** Category overlap */
  categoryOverlap: Record<SkillCategory, number>;
}

/**
 * Transferability analysis between careers
 */
export interface TransferabilityAnalysis {
  /** Source career */
  sourceCareerId: CareerSlug;

  /** Target career */
  targetCareerId: CareerSlug;

  /** Overall transferability score (0-100) */
  overallScore: number;

  /** Rating */
  rating: 'exceptional' | 'high' | 'moderate' | 'low' | 'minimal';

  /** Skill-by-skill breakdown */
  skillTransfers: Array<{
    skillId: SkillId;
    skillName: string;
    transferable: boolean;
    relevanceInTarget: number;
    value: number;
  }>;

  /** Transferable skill value (0-100) */
  transferableValue: number;

  /** Gap skills that need development */
  gapSkills: Array<{
    skillId: SkillId;
    skillName: string;
    importance: number;
    timeToAcquire: number;
  }>;

  /** Estimated transition difficulty */
  transitionDifficulty: number;

  /** Explanation */
  explanation: string;
}

/**
 * Filter criteria for skill queries
 */
export interface SkillFilter {
  /** Categories to include */
  categories?: SkillCategory[];

  /** Minimum future importance */
  minFutureImportance?: number;

  /** Minimum AI resistance */
  minAIResistance?: number;

  /** Minimum transferability */
  minTransferability?: number;

  /** Maximum time to acquire */
  maxTimeToAcquire?: number;

  /** Search query */
  searchQuery?: string;
}

/**
 * Configuration for skill taxonomy operations
 */
export interface SkillTaxonomyConfig {
  /** Proficiency level scores for calculations */
  proficiencyScores: Record<ProficiencyLevel, number>;

  /** Default weights for similarity calculations */
  similarityWeights: {
    skillOverlap: number;
    importanceMatch: number;
    categoryMatch: number;
    proficiencyMatch: number;
  };

  /** Gap severity thresholds */
  gapThresholds: {
    critical: number;
    significant: number;
    moderate: number;
    minor: number;
  };
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_SKILL_TAXONOMY_CONFIG: SkillTaxonomyConfig = {
  proficiencyScores: {
    beginner: 25,
    intermediate: 50,
    advanced: 75,
    expert: 100,
  },
  similarityWeights: {
    skillOverlap: 0.35,
    importanceMatch: 0.25,
    categoryMatch: 0.20,
    proficiencyMatch: 0.20,
  },
  gapThresholds: {
    critical: 90,
    significant: 70,
    moderate: 50,
    minor: 30,
  },
};

// ============================================================================
// SKILL TAXONOMY CLASS
// ============================================================================

export class SkillTaxonomyV1 {
  private skills: Map<SkillId, SkillNode> = new Map();
  private careerProfiles: Map<CareerSlug, CareerSkillProfile> = new Map();
  private config: SkillTaxonomyConfig;

  constructor(config?: Partial<SkillTaxonomyConfig>) {
    this.config = {
      ...DEFAULT_SKILL_TAXONOMY_CONFIG,
      ...config,
    };
  }

  /**
   * Add a skill to the taxonomy
   */
  addSkill(skill: SkillNode): void {
    this.skills.set(skill.id, skill);

    // Update parent-child relationships
    if (skill.parentSkillId) {
      const parent = this.skills.get(skill.parentSkillId);
      if (parent) {
        parent.childSkillIds = parent.childSkillIds || [];
        if (!parent.childSkillIds.includes(skill.id)) {
          parent.childSkillIds.push(skill.id);
        }
      }
    }
  }

  /**
   * Add multiple skills
   */
  addSkills(skills: SkillNode[]): void {
    for (const skill of skills) {
      this.addSkill(skill);
    }
  }

  /**
   * Get a skill by ID
   */
  getSkill(id: SkillId): SkillNode | undefined {
    return this.skills.get(id);
  }

  /**
   * Get all skills
   */
  getAllSkills(): SkillNode[] {
    return [...this.skills.values()];
  }

  /**
   * Get skills by category
   */
  getSkillsByCategory(category: SkillCategory): SkillNode[] {
    return this.getAllSkills().filter(s => s.category === category);
  }

  /**
   * Get child skills
   */
  getChildSkills(parentId: SkillId): SkillNode[] {
    const parent = this.skills.get(parentId);
    if (!parent || !parent.childSkillIds) return [];
    return parent.childSkillIds
      .map(id => this.skills.get(id))
      .filter((s): s is SkillNode => s !== undefined);
  }

  /**
   * Get parent skill
   */
  getParentSkill(childId: SkillId): SkillNode | undefined {
    const child = this.skills.get(childId);
    if (!child || !child.parentSkillId) return undefined;
    return this.skills.get(child.parentSkillId);
  }

  /**
   * Get skill ancestry (parent, grandparent, etc.)
   */
  getSkillAncestry(skillId: SkillId): SkillNode[] {
    const ancestry: SkillNode[] = [];
    let current = this.skills.get(skillId);

    while (current && current.parentSkillId) {
      const parent = this.skills.get(current.parentSkillId);
      if (parent) {
        ancestry.push(parent);
        current = parent;
      } else {
        break;
      }
    }

    return ancestry;
  }

  /**
   * Add career skill profile
   */
  addCareerProfile(profile: CareerSkillProfile): void {
    this.careerProfiles.set(profile.careerId, profile);
  }

  /**
   * Get career skill profile
   */
  getCareerProfile(careerId: CareerSlug): CareerSkillProfile | undefined {
    return this.careerProfiles.get(careerId);
  }

  /**
   * Filter skills by criteria
   */
  filterSkills(filter: SkillFilter): SkillNode[] {
    return this.getAllSkills().filter(skill => {
      if (filter.categories && !filter.categories.includes(skill.category)) {
        return false;
      }
      if (filter.minFutureImportance !== undefined && skill.futureImportance < filter.minFutureImportance) {
        return false;
      }
      if (filter.minAIResistance !== undefined && skill.aiResistance < filter.minAIResistance) {
        return false;
      }
      if (filter.minTransferability !== undefined && skill.transferability < filter.minTransferability) {
        return false;
      }
      if (filter.maxTimeToAcquire !== undefined && skill.timeToAcquireMonths > filter.maxTimeToAcquire) {
        return false;
      }
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        const match =
          skill.name.toLowerCase().includes(query) ||
          skill.description.toLowerCase().includes(query);
        if (!match) return false;
      }
      return true;
    });
  }

  /**
   * Find related skills
   */
  findRelatedSkills(skillId: SkillId, depth: number = 1): SkillNode[] {
    const skill = this.skills.get(skillId);
    if (!skill) return [];

    const related = new Set<SkillId>();

    // Direct related skills
    for (const id of skill.relatedSkillIds) {
      related.add(id);
    }

    // Parent and children
    if (skill.parentSkillId) {
      related.add(skill.parentSkillId);
    }
    if (skill.childSkillIds) {
      for (const id of skill.childSkillIds) {
        related.add(id);
      }
    }

    // Siblings (same parent)
    if (skill.parentSkillId) {
      const parent = this.skills.get(skill.parentSkillId);
      if (parent && parent.childSkillIds) {
        for (const id of parent.childSkillIds) {
          if (id !== skillId) {
            related.add(id);
          }
        }
      }
    }

    // Recursive for depth > 1
    if (depth > 1) {
      for (const id of [...related]) {
        const deeper = this.findRelatedSkills(id, depth - 1);
        for (const s of deeper) {
          related.add(s.id);
        }
      }
    }

    return [...related]
      .map(id => this.skills.get(id))
      .filter((s): s is SkillNode => s !== undefined && s.id !== skillId);
  }

  /**
   * Find emerging skills (high future importance, currently low adoption)
   */
  findEmergingSkills(category?: SkillCategory): SkillNode[] {
    return this.getAllSkills().filter(skill => {
      if (category && skill.category !== category) return false;
      return skill.futureImportance >= 70 && skill.metadata.confidence !== 'high';
    });
  }

  /**
   * Find AI-resistant skills
   */
  findAIResistantSkills(minResistance: number = 70): SkillNode[] {
    return this.getAllSkills()
      .filter(s => s.aiResistance >= minResistance)
      .sort((a, b) => b.aiResistance - a.aiResistance);
  }
}

// ============================================================================
// CORE CALCULATION FUNCTIONS
// ============================================================================

/**
 * Get career skill profile with full skill details
 */
export function getCareerSkillProfile(
  taxonomy: SkillTaxonomyV1,
  careerId: CareerSlug
): CareerSkillProfile | null {
  return taxonomy.getCareerProfile(careerId) || null;
}

/**
 * Calculate skill overlap between two careers
 */
export function calculateSkillOverlap(
  sourceProfile: CareerSkillProfile,
  targetProfile: CareerSkillProfile
): {
  overlapScore: number;
  commonSkills: Array<{ skillId: string; importanceInSource: number; importanceInTarget: number }>;
  sourceUnique: Array<{ skillId: string; importance: number }>;
  targetUnique: Array<{ skillId: string; importance: number }>;
} {
  const sourceSkills = new Map<string, CareerSkillRequirement>();
  for (const req of [...sourceProfile.requiredSkills, ...sourceProfile.optionalSkills]) {
    sourceSkills.set(req.skillId, req);
  }

  const targetSkills = new Map<string, CareerSkillRequirement>();
  for (const req of [...targetProfile.requiredSkills, ...targetProfile.optionalSkills]) {
    targetSkills.set(req.skillId, req);
  }

  // Find common skills
  const commonSkills: Array<{ skillId: string; importanceInSource: number; importanceInTarget: number }> = [];
  for (const [skillId, sourceReq] of sourceSkills) {
    const targetReq = targetSkills.get(skillId);
    if (targetReq) {
      commonSkills.push({
        skillId,
        importanceInSource: sourceReq.importance,
        importanceInTarget: targetReq.importance,
      });
    }
  }

  // Find unique skills
  const sourceUnique: Array<{ skillId: string; importance: number }> = [];
  for (const [skillId, req] of sourceSkills) {
    if (!targetSkills.has(skillId)) {
      sourceUnique.push({ skillId, importance: req.importance });
    }
  }

  const targetUnique: Array<{ skillId: string; importance: number }> = [];
  for (const [skillId, req] of targetSkills) {
    if (!sourceSkills.has(skillId)) {
      targetUnique.push({ skillId, importance: req.importance });
    }
  }

  // Calculate overlap score
  const totalSourceImportance = [...sourceSkills.values()].reduce((sum, s) => sum + s.importance, 0);
  const commonImportance = commonSkills.reduce((sum, s) => sum + Math.min(s.importanceInSource, s.importanceInTarget), 0);

  const overlapScore = totalSourceImportance > 0 ? (commonImportance / totalSourceImportance) * 100 : 0;

  return {
    overlapScore: Math.round(overlapScore),
    commonSkills,
    sourceUnique,
    targetUnique,
  };
}

/**
 * Calculate skill gap between student inventory and career requirements
 */
export function calculateSkillGap(
  taxonomy: SkillTaxonomyV1,
  studentInventory: StudentSkillInventory,
  careerProfile: CareerSkillProfile,
  config: SkillTaxonomyConfig = DEFAULT_SKILL_TAXONOMY_CONFIG
): SkillGap[] {
  const gaps: SkillGap[] = [];

  // Create map of student skills
  const studentSkills = new Map<SkillId, ProficiencyLevel>();
  for (const skill of studentInventory.skills) {
    studentSkills.set(skill.skillId, skill.proficiency);
  }

  // Check each required skill
  for (const req of careerProfile.requiredSkills) {
    const skill = taxonomy.getSkill(req.skillId);
    if (!skill) continue;

    const currentProficiency = studentSkills.get(req.skillId) || null;
    const requiredScore = config.proficiencyScores[req.minimumProficiency];
    const currentScore = currentProficiency ? config.proficiencyScores[currentProficiency] : 0;

    // Determine severity
    let severity: SkillGap['severity'];
    const gapSize = requiredScore - currentScore;
    const gapPercentage = (gapSize / 100) * (req.importance / 100);

    if (gapPercentage >= config.gapThresholds.critical / 100) {
      severity = 'critical';
    } else if (gapPercentage >= config.gapThresholds.significant / 100) {
      severity = 'significant';
    } else if (gapPercentage >= config.gapThresholds.moderate / 100) {
      severity = 'moderate';
    } else if (gapPercentage > 0) {
      severity = 'minor';
    } else {
      severity = 'none';
    }

    // Calculate time to close gap
    const timeToClose = currentProficiency
      ? Math.max(0, skill.timeToAcquireMonths * (gapSize / 100))
      : skill.timeToAcquireMonths;

    gaps.push({
      skillId: req.skillId,
      skillName: skill.name,
      requiredProficiency: req.minimumProficiency,
      currentProficiency,
      severity,
      importance: req.importance,
      timeToCloseMonths: Math.round(timeToClose),
      isBlocking: severity === 'critical' && req.importance >= 80,
    });
  }

  return gaps.sort((a, b) => {
    // Sort by severity then importance
    const severityOrder = { critical: 0, significant: 1, moderate: 2, minor: 3, none: 4 };
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    return b.importance - a.importance;
  });
}

/**
 * Calculate skill transferability between careers
 */
export function calculateSkillTransferability(
  taxonomy: SkillTaxonomyV1,
  sourceProfile: CareerSkillProfile,
  targetProfile: CareerSkillProfile,
  config: SkillTaxonomyConfig = DEFAULT_SKILL_TAXONOMY_CONFIG
): TransferabilityAnalysis {
  const overlap = calculateSkillOverlap(sourceProfile, targetProfile);

  // Calculate transferable value
  const transferableValue = overlap.commonSkills.reduce((sum, s) => {
    return sum + (s.importanceInSource + s.importanceInTarget) / 2;
  }, 0) / Math.max(1, overlap.commonSkills.length);

  // Calculate gap skills
  const gapSkills = targetProfile.requiredSkills
    .filter(req => !overlap.commonSkills.some(s => s.skillId === req.skillId))
    .map(req => {
      const skill = taxonomy.getSkill(req.skillId);
      return {
        skillId: req.skillId,
        skillName: skill?.name || req.skillId,
        importance: req.importance,
        timeToAcquire: skill?.timeToAcquireMonths || 6,
      };
    });

  // Calculate overall score
  const transferPercentage = overlap.overlapScore;
  const gapPenalty = Math.min(50, gapSkills.length * 5);
  const overallScore = Math.max(0, transferPercentage - gapPenalty);

  // Determine rating
  let rating: TransferabilityAnalysis['rating'];
  if (overallScore >= 80) rating = 'exceptional';
  else if (overallScore >= 60) rating = 'high';
  else if (overallScore >= 40) rating = 'moderate';
  else if (overallScore >= 20) rating = 'low';
  else rating = 'minimal';

  // Calculate transition difficulty
  const totalGapTime = gapSkills.reduce((sum, g) => sum + g.timeToAcquire, 0);
  const transitionDifficulty = Math.min(100, totalGapTime * 2);

  // Generate explanation
  const explanation = generateTransferabilityExplanation(
    sourceProfile.careerId,
    targetProfile.careerId,
    overallScore,
    rating,
    overlap.commonSkills.length,
    gapSkills.length
  );

  return {
    sourceCareerId: sourceProfile.careerId,
    targetCareerId: targetProfile.careerId,
    overallScore: Math.round(overallScore),
    rating,
    skillTransfers: overlap.commonSkills.map(s => ({
      skillId: s.skillId,
      skillName: s.skillId, // Would lookup actual name
      transferable: true,
      relevanceInTarget: s.importanceInTarget,
      value: (s.importanceInSource + s.importanceInTarget) / 2,
    })),
    transferableValue: Math.round(transferableValue),
    gapSkills,
    transitionDifficulty: Math.round(transitionDifficulty),
    explanation,
  };
}

/**
 * Calculate skill similarity score (0-100)
 */
export function calculateSkillSimilarity(
  taxonomy: SkillTaxonomyV1,
  sourceProfile: CareerSkillProfile,
  targetProfile: CareerSkillProfile,
  config: SkillTaxonomyConfig = DEFAULT_SKILL_TAXONOMY_CONFIG
): number {
  const overlap = calculateSkillOverlap(sourceProfile, targetProfile);

  // Category overlap
  const categoryOverlap: Record<SkillCategory, number> = {
    technical: 0,
    analytical: 0,
    creative: 0,
    business: 0,
    leadership: 0,
    communication: 0,
    domain: 0,
  };

  for (const category of sourceProfile.primaryCategories) {
    if (targetProfile.primaryCategories.includes(category)) {
      categoryOverlap[category] = 100;
    }
  }

  const categoryMatch = Object.values(categoryOverlap).filter(v => v > 0).length /
    Math.max(1, sourceProfile.primaryCategories.length) * 100;

  // Calculate weighted similarity
  const similarity =
    overlap.overlapScore * config.similarityWeights.skillOverlap +
    categoryMatch * config.similarityWeights.categoryMatch +
    (overlap.commonSkills.length > 0 ? 100 : 0) * config.similarityWeights.importanceMatch;

  return Math.round(similarity);
}

/**
 * Find adjacent skills (related skills not yet acquired)
 */
export function findAdjacentSkills(
  taxonomy: SkillTaxonomyV1,
  studentInventory: StudentSkillInventory,
  careerProfile: CareerSkillProfile
): Array<{ skillId: SkillId; skillName: string; relevance: number; timeToAcquire: number }> {
  const adjacent = new Map<SkillId, { relevance: number; timeToAcquire: number }>();

  // Get student's current skills
  const studentSkillIds = new Set(studentInventory.skills.map(s => s.skillId));

  // For each career skill, find related skills
  for (const req of [...careerProfile.requiredSkills, ...careerProfile.optionalSkills]) {
    const related = taxonomy.findRelatedSkills(req.skillId, 1);
    for (const skill of related) {
      if (!studentSkillIds.has(skill.id) && !adjacent.has(skill.id)) {
        adjacent.set(skill.id, {
          relevance: req.importance,
          timeToAcquire: skill.timeToAcquireMonths,
        });
      }
    }
  }

  return [...adjacent.entries()]
    .map(([skillId, data]) => {
      const skill = taxonomy.getSkill(skillId);
      return {
        skillId,
        skillName: skill?.name || skillId,
        relevance: data.relevance,
        timeToAcquire: data.timeToAcquire,
      };
    })
    .sort((a, b) => b.relevance - a.relevance);
}

/**
 * Find emerging skills for a career
 */
export function findEmergingSkills(
  taxonomy: SkillTaxonomyV1,
  careerProfile: CareerSkillProfile
): Array<{ skillId: SkillId; skillName: string; futureImportance: number; timeToAcquire: number }> {
  return careerProfile.emergingSkills
    .map(req => {
      const skill = taxonomy.getSkill(req.skillId);
      return {
        skillId: req.skillId,
        skillName: skill?.name || req.skillId,
        futureImportance: req.futureImportance,
        timeToAcquire: skill?.timeToAcquireMonths || 6,
      };
    })
    .sort((a, b) => b.futureImportance - a.futureImportance);
}

// ============================================================================
// SKILL GAP REPORT GENERATOR
// ============================================================================

/**
 * Generate comprehensive skill gap report
 */
export function generateSkillGapReport(
  taxonomy: SkillTaxonomyV1,
  studentInventory: StudentSkillInventory,
  careerId: CareerSlug,
  config: SkillTaxonomyConfig = DEFAULT_SKILL_TAXONOMY_CONFIG
): SkillGapReport {
  const careerProfile = taxonomy.getCareerProfile(careerId);
  if (!careerProfile) {
    throw new Error(`Career profile not found: ${careerId}`);
  }

  // Calculate gaps
  const gaps = calculateSkillGap(taxonomy, studentInventory, careerProfile, config);

  // Current skills with details
  const currentSkills = studentInventory.skills.map(s => {
    const skill = taxonomy.getSkill(s.skillId);
    return {
      skillId: s.skillId,
      skillName: skill?.name || s.skillId,
      proficiency: s.proficiency,
      category: skill?.category || 'domain',
    };
  });

  // Missing skills (critical and significant gaps)
  const missingSkills = gaps.filter(g => g.severity !== 'none');

  // Transferable skills (current skills relevant to target)
  const transferableSkills = currentSkills.map(s => {
    const relevance = careerProfile.requiredSkills.find(r => r.skillId === s.skillId)?.importance ||
      careerProfile.optionalSkills.find(r => r.skillId === s.skillId)?.importance ||
      0;
    return {
      ...s,
      relevanceToTarget: relevance,
    };
  }).filter(s => s.relevanceToTarget > 0);

  // Find fastest upskill path
  const criticalGaps = gaps.filter(g => g.severity === 'critical' || g.severity === 'significant');
  const sortedByTime = [...criticalGaps].sort((a, b) => a.timeToCloseMonths - b.timeToCloseMonths);
  const fastestPath = sortedByTime.slice(0, 3); // Top 3 quickest to acquire

  // Calculate total learning time
  const totalLearningTime = criticalGaps.reduce((sum, g) => sum + g.timeToCloseMonths, 0);

  // Calculate readiness score
  const blockingGaps = gaps.filter(g => g.isBlocking).length;
  const totalCriticalGaps = gaps.filter(g => g.severity === 'critical').length;
  const readinessScore = Math.max(0, 100 - (blockingGaps * 20) - (totalCriticalGaps * 10));

  return {
    id: `skill-gap-${studentInventory.studentId}-${careerId}-${Date.now()}`,
    careerId,
    studentId: studentInventory.studentId,
    currentSkills,
    missingSkills,
    transferableSkills,
    fastestUpskillPath: {
      skills: fastestPath.map(g => g.skillId),
      totalTimeMonths: fastestPath.reduce((sum, g) => sum + g.timeToCloseMonths, 0),
      priority: blockingGaps > 0 ? 'high' : totalCriticalGaps > 2 ? 'medium' : 'low',
    },
    estimatedLearningTimeMonths: Math.round(totalLearningTime),
    readinessScore: Math.round(readinessScore),
    generatedAt: Date.now(),
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function generateTransferabilityExplanation(
  sourceCareerId: string,
  targetCareerId: string,
  score: number,
  rating: string,
  commonSkillCount: number,
  gapSkillCount: number
): string {
  const parts: string[] = [];

  parts.push(`Transition from ${sourceCareerId} to ${targetCareerId} has ${rating} transferability (${score}/100).`);

  if (score >= 60) {
    parts.push(`This is a natural career progression with significant skill overlap.`);
  } else if (score >= 40) {
    parts.push(`This transition requires moderate skill development but builds on existing capabilities.`);
  } else {
    parts.push(`This is a significant career change requiring substantial new skill acquisition.`);
  }

  parts.push(`${commonSkillCount} skills transfer directly, while ${gapSkillCount} new skills need development.`);

  return parts.join(' ');
}

/**
 * Convert proficiency level to numeric score
 */
export function proficiencyToScore(
  level: ProficiencyLevel,
  config: SkillTaxonomyConfig = DEFAULT_SKILL_TAXONOMY_CONFIG
): number {
  return config.proficiencyScores[level];
}

/**
 * Compare proficiency levels
 */
export function compareProficiency(
  a: ProficiencyLevel,
  b: ProficiencyLevel,
  config: SkillTaxonomyConfig = DEFAULT_SKILL_TAXONOMY_CONFIG
): number {
  return config.proficiencyScores[a] - config.proficiencyScores[b];
}

/**
 * Check if proficiency meets requirement
 */
export function meetsProficiencyRequirement(
  current: ProficiencyLevel,
  required: ProficiencyLevel,
  config: SkillTaxonomyConfig = DEFAULT_SKILL_TAXONOMY_CONFIG
): boolean {
  return config.proficiencyScores[current] >= config.proficiencyScores[required];
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a skill node
 */
export function createSkillNode(
  id: SkillId,
  name: string,
  category: SkillCategory,
  description: string,
  options: {
    parentSkillId?: SkillId;
    futureImportance?: number;
    aiResistance?: number;
    transferability?: number;
    timeToAcquireMonths?: number;
    relatedSkillIds?: SkillId[];
    source?: string;
    confidence?: 'low' | 'medium' | 'high';
  } = {}
): SkillNode {
  const now = Date.now();
  return {
    id,
    name,
    category,
    parentSkillId: options.parentSkillId,
    description,
    futureImportance: options.futureImportance ?? 50,
    aiResistance: options.aiResistance ?? 50,
    transferability: options.transferability ?? 50,
    timeToAcquireMonths: options.timeToAcquireMonths ?? 6,
    relatedSkillIds: options.relatedSkillIds ?? [],
    metadata: {
      createdAt: now,
      updatedAt: now,
      source: options.source ?? 'manual',
      confidence: options.confidence ?? 'medium',
    },
  };
}

/**
 * Create a career skill requirement
 */
export function createCareerSkillRequirement(
  skillId: SkillId,
  importance: number,
  minimumProficiency: ProficiencyLevel,
  options: {
    futureImportance?: number;
    isEmerging?: boolean;
    isDeclining?: boolean;
    alternativeSkillIds?: SkillId[];
  } = {}
): CareerSkillRequirement {
  return {
    skillId,
    importance,
    minimumProficiency,
    futureImportance: options.futureImportance ?? importance,
    isEmerging: options.isEmerging ?? false,
    isDeclining: options.isDeclining ?? false,
    alternativeSkillIds: options.alternativeSkillIds ?? [],
  };
}

/**
 * Create a career skill profile
 */
export function createCareerSkillProfile(
  careerId: CareerSlug,
  skills: {
    required: CareerSkillRequirement[];
    optional: CareerSkillRequirement[];
    emerging: CareerSkillRequirement[];
    declining: CareerSkillRequirement[];
  },
  options: {
    primaryCategories?: SkillCategory[];
    complexityScore?: number;
    learningCurveMonths?: number;
  } = {}
): CareerSkillProfile {
  return {
    careerId,
    requiredSkills: skills.required,
    optionalSkills: skills.optional,
    emergingSkills: skills.emerging,
    decliningSkills: skills.declining,
    primaryCategories: options.primaryCategories ?? ['technical'],
    complexityScore: options.complexityScore ?? 50,
    learningCurveMonths: options.learningCurveMonths ?? 12,
  };
}

/**
 * Create student skill inventory
 */
export function createStudentSkillInventory(
  studentId: string,
  skills: Array<{
    skillId: SkillId;
    proficiency: ProficiencyLevel;
    source: 'education' | 'work' | 'self-study' | 'certification';
  }>
): StudentSkillInventory {
  const now = Date.now();
  return {
    studentId,
    skills: skills.map(s => ({
      ...s,
      acquiredAt: now,
    })),
    updatedAt: now,
  };
}

/**
 * Create skill taxonomy with default configuration
 */
export function createSkillTaxonomy(
  config?: Partial<SkillTaxonomyConfig>
): SkillTaxonomyV1 {
  return new SkillTaxonomyV1(config);
}


