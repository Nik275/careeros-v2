/**
 * CareerOS Skill Transition Engine V1
 *
 * Analyzes career transitions using actual skill profiles.
 * Transition quality emerges from skill relationships, not arbitrary scores.
 *
 * Features:
 * - Skill overlap calculation from taxonomy
 * - Transferable skill identification
 * - Missing skill gap analysis
 * - Learning time estimation
 * - Transition probability modeling
 * - Transition difficulty scoring
 * - Explainable transition analysis
 *
 * Integrates with:
 * - Career Graph V2 (weighted transitions)
 * - Optionality Engine (pivot potential)
 * - Criticality Engine (irreversibility)
 * - Path Explorer (path quality)
 * - Future Explorer (scenario modeling)
 * - Recommendation Engine (fit scoring)
 *
 * @module intelligence/skill-transition-engine
 * @version 1.0.0
 */

import type { CareerSlug } from '../../domains/career/Career.js';
import type {
  SkillTaxonomyV1,
  CareerSkillProfile,
  SkillNode,
  SkillId,
  ProficiencyLevel,
  SkillCategory,
} from '../skill-taxonomy/SkillTaxonomyV1.js';
import {
  calculateSkillOverlap,
  calculateSkillTransferability,
  calculateSkillSimilarity,
  DEFAULT_SKILL_TAXONOMY_CONFIG,
  type SkillTaxonomyConfig,
} from '../skill-taxonomy/SkillTaxonomyV1.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Unique identifier for transition analyses
 */
export type TransitionAnalysisId = string;

/**
 * Skill match between source and target careers
 */
export interface SkillMatch {
  /** Skill identifier */
  skillId: SkillId;

  /** Skill name */
  skillName: string;

  /** Skill category */
  category: SkillCategory;

  /** Importance in source career (0-100) */
  sourceImportance: number;

  /** Importance in target career (0-100) */
  targetImportance: number;

  /** Whether skill is required in target */
  isRequiredInTarget: boolean;

  /** Transfer value (0-100) */
  transferValue: number;
}

/**
 * Missing skill in target career
 */
export interface MissingSkill {
  /** Skill identifier */
  skillId: SkillId;

  /** Skill name */
  skillName: string;

  /** Skill category */
  category: SkillCategory;

  /** Importance to target career (0-100) */
  importance: number;

  /** Whether this is a blocking requirement */
  isCritical: boolean;

  /** Time to acquire (months) */
  timeToAcquireMonths: number;

  /** Difficulty to acquire (0-100) */
  acquisitionDifficulty: number;

  /** Prerequisites needed */
  prerequisiteSkills: SkillId[];
}

/**
 * Transferable skill from source to target
 */
export interface TransferableSkill {
  /** Skill identifier */
  skillId: SkillId;

  /** Skill name */
  skillName: string;

  /** Skill category */
  category: SkillCategory;

  /** Value in source career (0-100) */
  sourceValue: number;

  /** Value in target career (0-100) */
  targetValue: number;

  /** Transfer efficiency (0-100) */
  transferEfficiency: number;

  /** Whether skill is directly applicable */
  isDirectlyApplicable: boolean;

  /** Whether skill needs adaptation */
  needsAdaptation: boolean;
}

/**
 * Learning path for missing skills
 */
export interface LearningPath {
  /** Ordered list of skills to acquire */
  skills: Array<{
    skillId: SkillId;
    skillName: string;
    importance: number;
    timeToAcquireMonths: number;
    dependencies: SkillId[];
  }>;

  /** Total learning time (months) */
  totalTimeMonths: number;

  /** Critical path time (months) - longest dependency chain */
  criticalPathMonths: number;

  /** Parallel learning opportunities */
  parallelizableSkills: SkillId[];

  /** Learning phases */
  phases: Array<{
    name: string;
    skills: SkillId[];
    durationMonths: number;
    focus: string;
  }>;
}

/**
 * Complete skill-based transition analysis
 */
export interface SkillTransitionAnalysis {
  /** Analysis identifier */
  id: TransitionAnalysisId;

  /** Source career */
  sourceCareerId: CareerSlug;

  /** Target career */
  targetCareerId: CareerSlug;

  /** Analysis timestamp */
  generatedAt: number;

  // Skill Overlap Analysis
  /** Overall skill overlap percentage (0-100) */
  skillOverlap: number;

  /** Weighted skill overlap (accounting for importance) */
  weightedSkillOverlap: number;

  /** Common skills between careers */
  commonSkills: SkillMatch[];

  /** Skills transferable from source to target */
  transferableSkills: TransferableSkill[];

  /** Skills missing in source for target career */
  missingSkills: MissingSkill[];

  /** Critical missing skills (blocking requirements) */
  criticalMissingSkills: MissingSkill[];

  // Learning Analysis
  /** Optimal learning path for missing skills */
  learningPath: LearningPath;

  /** Estimated total learning time (months) */
  estimatedLearningTimeMonths: number;

  // Transition Metrics
  /** Transition difficulty (0-100) */
  transitionDifficulty: number;

  /** Transition probability (0-1) */
  transitionProbability: number;

  /** Transition quality score (0-100) */
  transitionQualityScore: number;

  /** Transition rating */
  transitionRating: 'exceptional' | 'excellent' | 'good' | 'moderate' | 'challenging' | 'difficult';

  // Category Analysis
  /** Category-by-category overlap */
  categoryOverlap: Record<SkillCategory, {
    overlap: number;
    transferableSkills: number;
    missingSkills: number;
  }>;

  // Explanations
  /** Detailed explanation points */
  explanation: string[];

  /** Key insights */
  insights: string[];

  /** Recommendations */
  recommendations: string[];

  // Integration Data
  /** Data for Career Graph V2 integration */
  careerGraphData: {
    edgeWeight: number;
    transitionProbability: number;
    difficulty: number;
    cost: number;
    time: number;
  };

  /** Data for Optionality Engine integration */
  optionalityData: {
    optionalityGain: number;
    newPathways: CareerSlug[];
    skillExpansion: number;
  };

  /** Data for Path Explorer integration */
  pathExplorerData: {
    pathQuality: number;
    skillContinuity: number;
    learningInvestment: number;
  };
}

/**
 * Configuration for transition analysis
 */
export interface SkillTransitionEngineConfig {
  /** Weights for transition quality calculation */
  qualityWeights: {
    skillOverlap: number;
    transferEfficiency: number;
    learningTime: number;
    criticalGaps: number;
    categoryMatch: number;
  };

  /** Thresholds for critical skills */
  criticalSkillThreshold: number;

  /** Maximum reasonable learning time (months) */
  maxLearningTimeMonths: number;

  /** Minimum overlap for viable transition */
  minViableOverlap: number;

  /** Taxonomy configuration */
  taxonomyConfig: SkillTaxonomyConfig;
}

/**
 * Input for transition analysis
 */
export interface SkillTransitionInput {
  /** Source career */
  sourceCareerId: CareerSlug;

  /** Target career */
  targetCareerId: CareerSlug;

  /** Optional student skills (for personalized analysis) */
  studentSkills?: Array<{
    skillId: SkillId;
    proficiency: ProficiencyLevel;
  }>;

  /** Analysis depth */
  depth: 'quick' | 'standard' | 'deep';
}

/**
 * Comparison of multiple transition options
 */
export interface TransitionComparison {
  /** Comparison identifier */
  id: string;

  /** Source career */
  sourceCareerId: CareerSlug;

  /** Target careers analyzed */
  targets: Array<{
    careerId: CareerSlug;
    analysis: SkillTransitionAnalysis;
    rank: number;
    advantage: string;
  }>;

  /** Best option */
  bestOption: CareerSlug;

  /** Comparison summary */
  summary: string;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_SKILL_TRANSITION_CONFIG: SkillTransitionEngineConfig = {
  qualityWeights: {
    skillOverlap: 0.30,
    transferEfficiency: 0.25,
    learningTime: 0.20,
    criticalGaps: 0.15,
    categoryMatch: 0.10,
  },
  criticalSkillThreshold: 80,
  maxLearningTimeMonths: 60,
  minViableOverlap: 15,
  taxonomyConfig: DEFAULT_SKILL_TAXONOMY_CONFIG,
};

// ============================================================================
// CORE ANALYSIS FUNCTION
// ============================================================================

/**
 * Analyze career transition using skill profiles
 *
 * This is the primary function that derives transition quality
 * from actual skill relationships in the taxonomy.
 */
export function analyzeCareerTransition(
  taxonomy: SkillTaxonomyV1,
  input: SkillTransitionInput,
  config: SkillTransitionEngineConfig = DEFAULT_SKILL_TRANSITION_CONFIG
): SkillTransitionAnalysis {
  const sourceProfile = taxonomy.getCareerProfile(input.sourceCareerId);
  const targetProfile = taxonomy.getCareerProfile(input.targetCareerId);

  if (!sourceProfile || !targetProfile) {
    throw new Error(
      `Missing career profile(s): ${!sourceProfile ? input.sourceCareerId : ''} ${!targetProfile ? input.targetCareerId : ''}`
    );
  }

  // 1. Calculate skill overlap
  const overlap = calculateSkillOverlap(sourceProfile, targetProfile);

  // 2. Identify transferable skills
  const transferableSkills = identifyTransferableSkills(
    taxonomy,
    sourceProfile,
    targetProfile,
    overlap.commonSkills
  );

  // 3. Identify missing skills
  const missingSkills = identifyMissingSkills(
    taxonomy,
    sourceProfile,
    targetProfile,
    input.studentSkills
  );

  // 4. Identify critical missing skills
  const criticalMissingSkills = missingSkills.filter(
    s => s.isCritical && s.importance >= config.criticalSkillThreshold
  );

  // 5. Build learning path
  const learningPath = buildLearningPath(taxonomy, missingSkills);

  // 6. Calculate transition difficulty
  const transitionDifficulty = calculateTransitionDifficulty(
    missingSkills,
    criticalMissingSkills,
    learningPath.totalTimeMonths,
    config.maxLearningTimeMonths
  );

  // 7. Calculate transition probability
  const transitionProbability = calculateTransitionProbability(
    overlap.overlapScore,
    transferableSkills,
    missingSkills,
    criticalMissingSkills,
    learningPath.totalTimeMonths,
    config.maxLearningTimeMonths
  );

  // 8. Calculate category overlap
  const categoryOverlap = calculateCategoryOverlap(
    taxonomy,
    sourceProfile,
    targetProfile,
    overlap.commonSkills,
    missingSkills
  );

  // 9. Calculate transition quality score
  const transitionQualityScore = calculateTransitionQualityScore(
    overlap.overlapScore,
    transferableSkills,
    learningPath.totalTimeMonths,
    criticalMissingSkills.length,
    categoryOverlap,
    config
  );

  // 10. Determine rating
  const transitionRating = scoreToRating(transitionQualityScore);

  // 11. Generate explanations
  const explanation = generateTransitionExplanation(
    input.sourceCareerId,
    input.targetCareerId,
    overlap.overlapScore,
    transferableSkills,
    missingSkills,
    criticalMissingSkills,
    learningPath,
    transitionProbability,
    transitionDifficulty
  );

  // 12. Generate insights
  const insights = generateInsights(
    overlap,
    transferableSkills,
    missingSkills,
    criticalMissingSkills,
    categoryOverlap
  );

  // 13. Generate recommendations
  const recommendations = generateRecommendations(
    missingSkills,
    criticalMissingSkills,
    learningPath,
    transitionProbability
  );

  // Build analysis result
  return {
    id: `transition-${input.sourceCareerId}-${input.targetCareerId}-${Date.now()}`,
    sourceCareerId: input.sourceCareerId,
    targetCareerId: input.targetCareerId,
    generatedAt: Date.now(),

    skillOverlap: Math.round(overlap.overlapScore),
    weightedSkillOverlap: Math.round(
      overlap.commonSkills.reduce((sum, s) => sum + Math.min(s.importanceInSource, s.importanceInTarget), 0) /
      Math.max(1, overlap.commonSkills.length)
    ),
    commonSkills: overlap.commonSkills.map(s => ({
      skillId: s.skillId,
      skillName: s.skillId, // Would lookup actual name
      category: taxonomy.getSkill(s.skillId)?.category || 'domain',
      sourceImportance: s.importanceInSource,
      targetImportance: s.importanceInTarget,
      isRequiredInTarget: targetProfile.requiredSkills.some(r => r.skillId === s.skillId),
      transferValue: Math.min(s.importanceInSource, s.importanceInTarget),
    })),
    transferableSkills,
    missingSkills,
    criticalMissingSkills,

    learningPath,
    estimatedLearningTimeMonths: learningPath.totalTimeMonths,

    transitionDifficulty: Math.round(transitionDifficulty),
    transitionProbability: Math.round(transitionProbability * 100) / 100,
    transitionQualityScore: Math.round(transitionQualityScore),
    transitionRating,

    categoryOverlap,

    explanation,
    insights,
    recommendations,

    careerGraphData: {
      edgeWeight: transitionQualityScore / 100,
      transitionProbability,
      difficulty: transitionDifficulty,
      cost: Math.min(100, learningPath.totalTimeMonths * 2),
      time: learningPath.totalTimeMonths,
    },

    optionalityData: {
      optionalityGain: Math.round(missingSkills.length * 2),
      newPathways: [], // Would need graph data
      skillExpansion: Math.round((missingSkills.length / Math.max(1, overlap.commonSkills.length + missingSkills.length)) * 100),
    },

    pathExplorerData: {
      pathQuality: Math.round(transitionQualityScore),
      skillContinuity: Math.round(overlap.overlapScore),
      learningInvestment: Math.round(Math.min(100, learningPath.totalTimeMonths * 1.5)),
    },
  };
}

// ============================================================================
// SKILL IDENTIFICATION FUNCTIONS
// ============================================================================

function identifyTransferableSkills(
  taxonomy: SkillTaxonomyV1,
  sourceProfile: CareerSkillProfile,
  targetProfile: CareerSkillProfile,
  commonSkills: Array<{ skillId: string; importanceInSource: number; importanceInTarget: number }>
): TransferableSkill[] {
  return commonSkills.map(match => {
    const skill = taxonomy.getSkill(match.skillId);
    const sourceReq = [...sourceProfile.requiredSkills, ...sourceProfile.optionalSkills]
      .find(r => r.skillId === match.skillId);
    const targetReq = [...targetProfile.requiredSkills, ...targetProfile.optionalSkills]
      .find(r => r.skillId === match.skillId);

    // Calculate transfer efficiency
    const sourceValue = match.importanceInSource;
    const targetValue = match.importanceInTarget;
    const transferEfficiency = Math.round(
      (Math.min(sourceValue, targetValue) / Math.max(sourceValue, 1)) * 100
    );

    // Determine applicability
    const isDirectlyApplicable = targetReq?.minimumProficiency === sourceReq?.minimumProficiency;
    const needsAdaptation = !isDirectlyApplicable && targetValue > sourceValue;

    return {
      skillId: match.skillId,
      skillName: skill?.name || match.skillId,
      category: skill?.category || 'domain',
      sourceValue,
      targetValue,
      transferEfficiency,
      isDirectlyApplicable,
      needsAdaptation,
    };
  }).sort((a, b) => b.transferEfficiency - a.transferEfficiency);
}

function identifyMissingSkills(
  taxonomy: SkillTaxonomyV1,
  sourceProfile: CareerSkillProfile,
  targetProfile: CareerSkillProfile,
  studentSkills?: Array<{ skillId: SkillId; proficiency: ProficiencyLevel }>
): MissingSkill[] {
  const sourceSkillIds = new Set([
    ...sourceProfile.requiredSkills.map(s => s.skillId),
    ...sourceProfile.optionalSkills.map(s => s.skillId),
  ]);

  const studentSkillIds = new Set(studentSkills?.map(s => s.skillId) || []);

  const missing: MissingSkill[] = [];

  for (const targetReq of [...targetProfile.requiredSkills, ...targetProfile.optionalSkills]) {
    // Skip if student already has this skill
    if (studentSkillIds.has(targetReq.skillId)) continue;

    // Skip if source career has this skill
    if (sourceSkillIds.has(targetReq.skillId)) continue;

    const skill = taxonomy.getSkill(targetReq.skillId);
    if (!skill) continue;

    // Determine if critical
    const isCritical = targetProfile.requiredSkills.some(r => r.skillId === targetReq.skillId) &&
      targetReq.importance >= 80;

    // Calculate acquisition difficulty
    const acquisitionDifficulty = Math.round(
      (skill.timeToAcquireMonths / 12) * 20 + // Time factor
      (100 - skill.transferability) * 0.3 +   // Transferability factor
      (100 - skill.aiResistance) * 0.1         // Complexity factor
    );

    // Find prerequisites
    const prerequisites: SkillId[] = [];
    if (skill.parentSkillId) {
      prerequisites.push(skill.parentSkillId);
    }
    for (const relatedId of skill.relatedSkillIds.slice(0, 3)) {
      if (!sourceSkillIds.has(relatedId) && !studentSkillIds.has(relatedId)) {
        prerequisites.push(relatedId);
      }
    }

    missing.push({
      skillId: targetReq.skillId,
      skillName: skill.name,
      category: skill.category,
      importance: targetReq.importance,
      isCritical,
      timeToAcquireMonths: skill.timeToAcquireMonths,
      acquisitionDifficulty: Math.min(100, acquisitionDifficulty),
      prerequisiteSkills: prerequisites.slice(0, 3),
    });
  }

  return missing.sort((a, b) => {
    // Sort by criticality, then importance, then time
    if (a.isCritical !== b.isCritical) return a.isCritical ? -1 : 1;
    if (b.importance !== a.importance) return b.importance - a.importance;
    return a.timeToAcquireMonths - b.timeToAcquireMonths;
  });
}

// ============================================================================
// LEARNING PATH FUNCTIONS
// ============================================================================

function buildLearningPath(
  taxonomy: SkillTaxonomyV1,
  missingSkills: MissingSkill[]
): LearningPath {
  if (missingSkills.length === 0) {
    return {
      skills: [],
      totalTimeMonths: 0,
      criticalPathMonths: 0,
      parallelizableSkills: [],
      phases: [],
    };
  }

  // Group skills by category
  const byCategory = new Map<SkillCategory, MissingSkill[]>();
  for (const skill of missingSkills) {
    const list = byCategory.get(skill.category) || [];
    list.push(skill);
    byCategory.set(skill.category, list);
  }

  // Sort skills within each category by importance and dependencies
  const orderedSkills: Array<{
    skillId: SkillId;
    skillName: string;
    importance: number;
    timeToAcquireMonths: number;
    dependencies: SkillId[];
  }> = [];

  for (const [category, skills] of byCategory) {
    // Sort by: critical first, then by time (shorter first for quick wins)
    const sorted = skills.sort((a, b) => {
      if (a.isCritical !== b.isCritical) return a.isCritical ? -1 : 1;
      return a.timeToAcquireMonths - b.timeToAcquireMonths;
    });

    for (const skill of sorted) {
      orderedSkills.push({
        skillId: skill.skillId,
        skillName: skill.skillName,
        importance: skill.importance,
        timeToAcquireMonths: skill.timeToAcquireMonths,
        dependencies: skill.prerequisiteSkills,
      });
    }
  }

  // Calculate total time (with parallelization assumption)
  // Assume 2-3 skills can be learned in parallel
  const totalTime = orderedSkills.reduce((sum, s) => sum + s.timeToAcquireMonths, 0);
  const parallelTime = Math.round(totalTime / 2.5); // Rough parallelization factor

  // Calculate critical path (longest dependency chain)
  const criticalPath = calculateCriticalPath(orderedSkills);

  // Identify parallelizable skills (no dependencies or dependencies already met)
  const parallelizableSkills = orderedSkills
    .filter(s => s.dependencies.length === 0)
    .map(s => s.skillId);

  // Build phases
  const phases = buildLearningPhases(orderedSkills);

  return {
    skills: orderedSkills,
    totalTimeMonths: Math.round(parallelTime),
    criticalPathMonths: criticalPath,
    parallelizableSkills,
    phases,
  };
}

function calculateCriticalPath(
  skills: Array<{ skillId: SkillId; timeToAcquireMonths: number; dependencies: SkillId[] }>
): number {
  // Simplified critical path: assume dependencies add sequentially
  let maxPath = 0;
  const visited = new Set<SkillId>();

  for (const skill of skills) {
    if (visited.has(skill.skillId)) continue;

    let pathTime = skill.timeToAcquireMonths;
    visited.add(skill.skillId);

    // Add dependency times
    for (const depId of skill.dependencies) {
      const dep = skills.find(s => s.skillId === depId);
      if (dep && !visited.has(depId)) {
        pathTime += dep.timeToAcquireMonths;
        visited.add(depId);
      }
    }

    maxPath = Math.max(maxPath, pathTime);
  }

  return maxPath;
}

function buildLearningPhases(
  skills: Array<{ skillId: SkillId; skillName: string; importance: number; timeToAcquireMonths: number; dependencies: SkillId[] }>
): LearningPath['phases'] {
  if (skills.length === 0) return [];

  const phases: LearningPath['phases'] = [];

  // Phase 1: Foundation (prerequisites and critical skills)
  const foundation = skills.filter(s => s.dependencies.length > 0 || s.importance >= 80);
  if (foundation.length > 0) {
    const duration = foundation.reduce((sum, s) => s.timeToAcquireMonths, 0);
    phases.push({
      name: 'Foundation Building',
      skills: foundation.map(s => s.skillId),
      durationMonths: Math.round(duration / 2), // Parallel learning
      focus: 'Core competencies and prerequisites',
    });
  }

  // Phase 2: Core Skills (high importance)
  const core = skills.filter(s => s.importance >= 60 && !foundation.includes(s));
  if (core.length > 0) {
    const duration = core.reduce((sum, s) => s.timeToAcquireMonths, 0);
    phases.push({
      name: 'Core Skill Development',
      skills: core.map(s => s.skillId),
      durationMonths: Math.round(duration / 2),
      focus: 'Primary career requirements',
    });
  }

  // Phase 3: Specialization (remaining skills)
  const specialization = skills.filter(s => !foundation.includes(s) && !core.includes(s));
  if (specialization.length > 0) {
    const duration = specialization.reduce((sum, s) => s.timeToAcquireMonths, 0);
    phases.push({
      name: 'Specialization',
      skills: specialization.map(s => s.skillId),
      durationMonths: Math.round(duration / 2),
      focus: 'Advanced and specialized skills',
    });
  }

  return phases;
}

// ============================================================================
// TRANSITION METRICS FUNCTIONS
// ============================================================================

function calculateTransitionDifficulty(
  missingSkills: MissingSkill[],
  criticalMissingSkills: MissingSkill[],
  learningTimeMonths: number,
  maxLearningTime: number
): number {
  // Base difficulty from missing skills
  const missingSkillPenalty = Math.min(40, missingSkills.length * 3);

  // Critical gaps add significant difficulty
  const criticalGapPenalty = criticalMissingSkills.length * 15;

  // Time penalty (longer = harder)
  const timePenalty = (learningTimeMonths / maxLearningTime) * 30;

  // Acquisition difficulty average
  const avgAcquisitionDifficulty = missingSkills.length > 0
    ? missingSkills.reduce((sum, s) => sum + s.acquisitionDifficulty, 0) / missingSkills.length
    : 0;
  const acquisitionPenalty = (avgAcquisitionDifficulty / 100) * 20;

  return Math.min(100, missingSkillPenalty + criticalGapPenalty + timePenalty + acquisitionPenalty);
}

function calculateTransitionProbability(
  skillOverlap: number,
  transferableSkills: TransferableSkill[],
  missingSkills: MissingSkill[],
  criticalMissingSkills: MissingSkill[],
  learningTimeMonths: number,
  maxLearningTime: number
): number {
  // Base probability from skill overlap
  let probability = skillOverlap / 100;

  // Boost from transferable skills efficiency
  const avgTransferEfficiency = transferableSkills.length > 0
    ? transferableSkills.reduce((sum, s) => sum + s.transferEfficiency, 0) / transferableSkills.length
    : 50;
  probability *= (0.5 + (avgTransferEfficiency / 100) * 0.5);

  // Penalty for missing skills
  const missingPenalty = Math.min(0.4, missingSkills.length * 0.03);
  probability -= missingPenalty;

  // Critical gaps significantly reduce probability
  const criticalPenalty = criticalMissingSkills.length * 0.15;
  probability -= criticalPenalty;

  // Time penalty (longer transitions less likely to complete)
  const timePenalty = (learningTimeMonths / maxLearningTime) * 0.2;
  probability -= timePenalty;

  return Math.max(0.05, Math.min(0.95, probability));
}

function calculateCategoryOverlap(
  taxonomy: SkillTaxonomyV1,
  sourceProfile: CareerSkillProfile,
  targetProfile: CareerSkillProfile,
  commonSkills: Array<{ skillId: string; importanceInSource: number; importanceInTarget: number }>,
  missingSkills: MissingSkill[]
): SkillTransitionAnalysis['categoryOverlap'] {
  const categories: SkillCategory[] = ['technical', 'analytical', 'creative', 'business', 'leadership', 'communication', 'domain'];
  const result = {} as SkillTransitionAnalysis['categoryOverlap'];

  for (const category of categories) {
    const commonInCategory = commonSkills.filter(s => {
      const skill = taxonomy.getSkill(s.skillId);
      return skill?.category === category;
    });

    const missingInCategory = missingSkills.filter(s => s.category === category);

    const totalSkills = commonInCategory.length + missingInCategory.length;
    const overlap = totalSkills > 0 ? (commonInCategory.length / totalSkills) * 100 : 0;

    result[category] = {
      overlap: Math.round(overlap),
      transferableSkills: commonInCategory.length,
      missingSkills: missingInCategory.length,
    };
  }

  return result;
}

function calculateTransitionQualityScore(
  skillOverlap: number,
  transferableSkills: TransferableSkill[],
  learningTimeMonths: number,
  criticalGapCount: number,
  categoryOverlap: SkillTransitionAnalysis['categoryOverlap'],
  config: SkillTransitionEngineConfig
): number {
  const w = config.qualityWeights;

  // Skill overlap component (0-100)
  const overlapScore = skillOverlap;

  // Transfer efficiency component
  const avgTransferEfficiency = transferableSkills.length > 0
    ? transferableSkills.reduce((sum, s) => sum + s.transferEfficiency, 0) / transferableSkills.length
    : 0;

  // Learning time component (inverse, shorter is better)
  const timeScore = Math.max(0, 100 - (learningTimeMonths / config.maxLearningTimeMonths) * 100);

  // Critical gaps component (inverse, fewer is better)
  const gapScore = Math.max(0, 100 - criticalGapCount * 20);

  // Category match component
  const categoryScores = Object.values(categoryOverlap).map(c => c.overlap);
  const categoryScore = categoryScores.length > 0
    ? categoryScores.reduce((sum, s) => sum + s, 0) / categoryScores.length
    : 0;

  // Weighted composite
  return Math.round(
    overlapScore * w.skillOverlap +
    avgTransferEfficiency * w.transferEfficiency +
    timeScore * w.learningTime +
    gapScore * w.criticalGaps +
    categoryScore * w.categoryMatch
  );
}

function scoreToRating(score: number): SkillTransitionAnalysis['transitionRating'] {
  if (score >= 85) return 'exceptional';
  if (score >= 70) return 'excellent';
  if (score >= 55) return 'good';
  if (score >= 40) return 'moderate';
  if (score >= 25) return 'challenging';
  return 'difficult';
}

// ============================================================================
// EXPLANATION FUNCTIONS
// ============================================================================

function generateTransitionExplanation(
  sourceCareerId: CareerSlug,
  targetCareerId: CareerSlug,
  skillOverlap: number,
  transferableSkills: TransferableSkill[],
  missingSkills: MissingSkill[],
  criticalMissingSkills: MissingSkill[],
  learningPath: LearningPath,
  transitionProbability: number,
  transitionDifficulty: number
): string[] {
  const explanations: string[] = [];

  // Overall assessment
  explanations.push(
    `Transition from ${sourceCareerId} to ${targetCareerId} has ${Math.round(skillOverlap)}% skill overlap.`
  );

  // Transferable skills
  if (transferableSkills.length > 0) {
    const topSkills = transferableSkills.slice(0, 3).map(s => s.skillName).join(', ');
    explanations.push(
      `${transferableSkills.length} skills transfer directly, including: ${topSkills}.`
    );
  }

  // Missing skills
  if (missingSkills.length > 0) {
    explanations.push(
      `${missingSkills.length} skills need to be acquired for this transition.`
    );
  }

  // Critical gaps
  if (criticalMissingSkills.length > 0) {
    const criticalNames = criticalMissingSkills.slice(0, 2).map(s => s.skillName).join(', ');
    explanations.push(
      `Critical gaps: ${criticalNames}${criticalMissingSkills.length > 2 ? ' and others' : ''} must be addressed.`
    );
  }

  // Learning time
  if (learningPath.totalTimeMonths > 0) {
    explanations.push(
      `Estimated learning time: ${learningPath.totalTimeMonths} months${learningPath.phases.length > 1 ? ` across ${learningPath.phases.length} phases` : ''}.`
    );
  }

  // Probability and difficulty
  explanations.push(
    `Transition probability: ${Math.round(transitionProbability * 100)}% with ${transitionDifficulty}/100 difficulty.`
  );

  return explanations;
}

function generateInsights(
  overlap: { overlapScore: number; commonSkills: Array<{ skillId: string; importanceInSource: number; importanceInTarget: number }> },
  transferableSkills: TransferableSkill[],
  missingSkills: MissingSkill[],
  criticalMissingSkills: MissingSkill[],
  categoryOverlap: SkillTransitionAnalysis['categoryOverlap']
): string[] {
  const insights: string[] = [];

  // Strength insights
  if (overlap.overlapScore >= 60) {
    insights.push('Strong skill foundation enables natural career progression.');
  } else if (overlap.overlapScore >= 40) {
    insights.push('Moderate skill overlap provides viable transition path.');
  } else {
    insights.push('Limited skill overlap indicates significant career change.');
  }

  // Transfer efficiency insights
  const highEfficiencySkills = transferableSkills.filter(s => s.transferEfficiency >= 80);
  if (highEfficiencySkills.length >= 3) {
    insights.push(`${highEfficiencySkills.length} high-value skills transfer with minimal adaptation.`);
  }

  // Gap insights
  if (criticalMissingSkills.length === 0) {
    insights.push('No critical skill gaps - all requirements can be met through learning.');
  } else if (criticalMissingSkills.length <= 2) {
    insights.push(`Only ${criticalMissingSkills.length} critical skill gaps to address.`);
  } else {
    insights.push(`${criticalMissingSkills.length} critical gaps require focused learning plan.`);
  }

  // Category insights
  const strongCategories = Object.entries(categoryOverlap)
    .filter(([, data]) => data.overlap >= 70)
    .map(([cat]) => cat);
  if (strongCategories.length > 0) {
    insights.push(`Strong skill continuity in: ${strongCategories.join(', ')}.`);
  }

  const weakCategories = Object.entries(categoryOverlap)
    .filter(([, data]) => data.missingSkills > data.transferableSkills)
    .map(([cat]) => cat);
  if (weakCategories.length > 0) {
    insights.push(`New skill domains to develop: ${weakCategories.join(', ')}.`);
  }

  return insights;
}

function generateRecommendations(
  missingSkills: MissingSkill[],
  criticalMissingSkills: MissingSkill[],
  learningPath: LearningPath,
  transitionProbability: number
): string[] {
  const recommendations: string[] = [];

  // Priority recommendations
  if (criticalMissingSkills.length > 0) {
    const quickCritical = criticalMissingSkills
      .filter(s => s.timeToAcquireMonths <= 6)
      .map(s => s.skillName);
    if (quickCritical.length > 0) {
      recommendations.push(`Prioritize quick critical wins: ${quickCritical.slice(0, 2).join(', ')}.`);
    }
  }

  // Learning path recommendations
  if (learningPath.phases.length > 0) {
    recommendations.push(`Follow the ${learningPath.phases.length}-phase learning plan starting with ${learningPath.phases[0].name}.`);
  }

  // Parallel learning
  if (learningPath.parallelizableSkills.length >= 3) {
    recommendations.push(`Leverage parallel learning for ${learningPath.parallelizableSkills.length} independent skills.`);
  }

  // Probability-based recommendations
  if (transitionProbability < 0.4) {
    recommendations.push('Consider intermediate stepping-stone roles to build transition skills gradually.');
  } else if (transitionProbability >= 0.7) {
    recommendations.push('Strong transition profile - direct transition is viable.');
  }

  // Time-based recommendations
  if (learningPath.totalTimeMonths > 24) {
    recommendations.push('Extended learning timeline - consider part-time transition or bridge role.');
  } else if (learningPath.totalTimeMonths <= 6) {
    recommendations.push('Short learning curve enables rapid transition.');
  }

  return recommendations;
}

// ============================================================================
// COMPARISON FUNCTIONS
// ============================================================================

/**
 * Compare multiple transition options from a source career
 */
export function compareTransitions(
  taxonomy: SkillTaxonomyV1,
  sourceCareerId: CareerSlug,
  targetCareerIds: CareerSlug[],
  config: SkillTransitionEngineConfig = DEFAULT_SKILL_TRANSITION_CONFIG
): TransitionComparison {
  const analyses = targetCareerIds.map(targetId =>
    analyzeCareerTransition(
      taxonomy,
      { sourceCareerId, targetCareerId: targetId, depth: 'standard' },
      config
    )
  );

  // Sort by quality score
  const ranked = analyses
    .map(analysis => ({
      careerId: analysis.targetCareerId,
      analysis,
      score: analysis.transitionQualityScore,
    }))
    .sort((a, b) => b.score - a.score);

  // Build comparison result
  const targets = ranked.map((item, index) => ({
    careerId: item.careerId,
    analysis: item.analysis,
    rank: index + 1,
    advantage: generateAdvantageDescription(item.analysis, index === 0),
  }));

  const bestOption = ranked[0]?.careerId || targetCareerIds[0];

  // Generate summary
  const summary = generateComparisonSummary(sourceCareerId, targets);

  return {
    id: `comparison-${sourceCareerId}-${Date.now()}`,
    sourceCareerId,
    targets,
    bestOption,
    summary,
  };
}

function generateAdvantageDescription(
  analysis: SkillTransitionAnalysis,
  isBest: boolean
): string {
  if (isBest) {
    return `Highest overall quality (${analysis.transitionQualityScore}/100) with ${Math.round(analysis.transitionProbability * 100)}% success probability.`;
  }

  if (analysis.skillOverlap >= 70) {
    return `Strong skill continuity (${analysis.skillOverlap}% overlap).`;
  }

  if (analysis.estimatedLearningTimeMonths <= 6) {
    return `Rapid transition possible (${analysis.estimatedLearningTimeMonths} months).`;
  }

  if (analysis.criticalMissingSkills.length === 0) {
    return 'No critical skill gaps.';
  }

  return `Viable option with ${analysis.transferableSkills.length} transferable skills.`;
}

function generateComparisonSummary(
  sourceCareerId: CareerSlug,
  targets: TransitionComparison['targets']
): string {
  const best = targets[0];
  const alternatives = targets.slice(1);

  let summary = `From ${sourceCareerId}, ${best.careerId} offers the best transition profile `;
  summary += `with ${best.analysis.transitionQualityScore}/100 quality and ${Math.round(best.analysis.transitionProbability * 100)}% probability. `;

  if (alternatives.length > 0) {
    summary += `Alternative options include ${alternatives.map(t => t.careerId).join(', ')} `;
    summary += `with quality scores of ${alternatives.map(t => t.analysis.transitionQualityScore).join(', ')}.`;
  }

  return summary;
}

// ============================================================================
// INTEGRATION FUNCTIONS
// ============================================================================

/**
 * Generate Career Graph V2 edge data from skill analysis
 */
export function generateCareerGraphEdgeData(
  analysis: SkillTransitionAnalysis
): {
  probability: number;
  difficulty: number;
  cost: number;
  timeMonths: number;
  skillOverlap: number;
  optionalityGain: number;
  futureStrength: number;
} {
  return {
    probability: analysis.transitionProbability,
    difficulty: analysis.transitionDifficulty,
    cost: analysis.careerGraphData.cost,
    timeMonths: analysis.estimatedLearningTimeMonths,
    skillOverlap: analysis.skillOverlap / 100,
    optionalityGain: analysis.optionalityData.optionalityGain,
    futureStrength: 50 + (analysis.skillOverlap / 2), // Derive from skill overlap
  };
}

/**
 * Generate Optionality Engine data from skill analysis
 */
export function generateOptionalityData(
  analysis: SkillTransitionAnalysis
): {
  pivotPotential: number;
  skillExpansion: number;
  newDomains: string[];
  reversibility: number;
} {
  const newDomains = Object.entries(analysis.categoryOverlap)
    .filter(([, data]) => data.missingSkills > data.transferableSkills)
    .map(([category]) => category);

  return {
    pivotPotential: Math.round(analysis.transitionQualityScore),
    skillExpansion: analysis.optionalityData.skillExpansion,
    newDomains,
    reversibility: analysis.skillOverlap >= 50 ? 70 : 40,
  };
}

/**
 * Generate Path Explorer data from skill analysis
 */
export function generatePathExplorerData(
  analysis: SkillTransitionAnalysis
): {
  pathQuality: number;
  skillContinuity: number;
  learningInvestment: number;
  transitionRisk: number;
} {
  return {
    pathQuality: analysis.pathExplorerData.pathQuality,
    skillContinuity: analysis.pathExplorerData.skillContinuity,
    learningInvestment: analysis.pathExplorerData.learningInvestment,
    transitionRisk: Math.round((1 - analysis.transitionProbability) * 100),
  };
}

// ============================================================================
// SKILL TRANSITION ENGINE CLASS
// ============================================================================

export class SkillTransitionEngineV1 {
  private taxonomy: SkillTaxonomyV1;
  private config: SkillTransitionEngineConfig;

  constructor(
    taxonomy: SkillTaxonomyV1,
    config?: Partial<SkillTransitionEngineConfig>
  ) {
    this.taxonomy = taxonomy;
    this.config = {
      ...DEFAULT_SKILL_TRANSITION_CONFIG,
      ...config,
    };
  }

  /**
   * Analyze a single career transition
   */
  analyzeTransition(
    sourceCareerId: CareerSlug,
    targetCareerId: CareerSlug,
    studentSkills?: Array<{ skillId: SkillId; proficiency: ProficiencyLevel }>
  ): SkillTransitionAnalysis {
    return analyzeCareerTransition(
      this.taxonomy,
      {
        sourceCareerId,
        targetCareerId,
        depth: 'standard',
        studentSkills,
      },
      this.config
    );
  }

  /**
   * Compare multiple transition options
   */
  compareTransitions(
    sourceCareerId: CareerSlug,
    targetCareerIds: CareerSlug[]
  ): TransitionComparison {
    return compareTransitions(this.taxonomy, sourceCareerId, targetCareerIds, this.config);
  }

  /**
   * Find best transition targets from a source career
   */
  findBestTransitions(
    sourceCareerId: CareerSlug,
    candidateTargets: CareerSlug[],
    limit: number = 5
): Array<{ careerId: CareerSlug; analysis: SkillTransitionAnalysis; score: number }> {
    const analyses = candidateTargets.map(targetId =>
      this.analyzeTransition(sourceCareerId, targetId)
    );

    return analyses
      .map(analysis => ({
        careerId: analysis.targetCareerId,
        analysis,
        score: analysis.transitionQualityScore,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Batch analyze all transitions from a source career
   */
  batchAnalyze(
    sourceCareerId: CareerSlug,
    targetCareerIds: CareerSlug[]
  ): SkillTransitionAnalysis[] {
    return targetCareerIds.map(targetId =>
      this.analyzeTransition(sourceCareerId, targetId)
    );
  }

  /**
   * Get transition difficulty distribution
   */
  getDifficultyDistribution(
    analyses: SkillTransitionAnalysis[]
  ): {
    easy: number;      // 0-30
    moderate: number;  // 31-60
    difficult: number; // 61-100
    average: number;
  } {
    const easy = analyses.filter(a => a.transitionDifficulty <= 30).length;
    const moderate = analyses.filter(a => a.transitionDifficulty > 30 && a.transitionDifficulty <= 60).length;
    const difficult = analyses.filter(a => a.transitionDifficulty > 60).length;
    const average = analyses.length > 0
      ? analyses.reduce((sum, a) => sum + a.transitionDifficulty, 0) / analyses.length
      : 0;

    return { easy, moderate, difficult, average: Math.round(average) };
  }

  /**
   * Update engine configuration
   */
  updateConfig(config: Partial<SkillTransitionEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): SkillTransitionEngineConfig {
    return { ...this.config };
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createSkillTransitionEngine(
  taxonomy: SkillTaxonomyV1,
  config?: Partial<SkillTransitionEngineConfig>
): SkillTransitionEngineV1 {
  return new SkillTransitionEngineV1(taxonomy, config);
}


