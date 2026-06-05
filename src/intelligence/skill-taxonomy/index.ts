/**
 * CareerOS Skill Taxonomy V1
 *
 * Hierarchical skill intelligence layer for CareerOS.
 * Enables accurate transferability calculations, career similarity,
 * skill gap analysis, and transition difficulty estimation.
 *
 * @module intelligence/skill-taxonomy
 * @version 1.0.0
 */

export {
  SkillTaxonomyV1,
  createSkillTaxonomy,
  createSkillNode,
  createCareerSkillRequirement,
  createCareerSkillProfile,
  createStudentSkillInventory,
  getCareerSkillProfile,
  calculateSkillOverlap,
  calculateSkillGap,
  calculateSkillTransferability,
  calculateSkillSimilarity,
  findAdjacentSkills,
  findEmergingSkills,
  generateSkillGapReport,
  proficiencyToScore,
  compareProficiency,
  meetsProficiencyRequirement,
  DEFAULT_SKILL_TAXONOMY_CONFIG,
} from './SkillTaxonomyV1.js';

export type {
  SkillId,
  SkillCategory,
  ProficiencyLevel,
  SkillNode,
  CareerSkillRequirement,
  CareerSkillProfile,
  StudentSkillInventory,
  SkillGap,
  SkillGapReport,
  SkillSimilarity,
  TransferabilityAnalysis,
  SkillFilter,
  SkillTaxonomyConfig,
} from './SkillTaxonomyV1.js';
