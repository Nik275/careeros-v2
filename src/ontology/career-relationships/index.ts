/**
 * CareerOS Career Relationship Taxonomy
 *
 * Foundational relationship system for the Career Knowledge Graph.
 */

export {
  // Relationship Types
  type CareerToCareerRelationship,
  type CareerToSkillRelationship,
  type CareerToDegreeRelationship,
  type CareerToExamRelationship,
  type CareerToIndustryRelationship,
  type CareerToCertificationRelationship,
  type CareerToRoleRelationship,
  type RelationshipType,

  // Relationship Strength
  type RelationshipStrength,
  type StrengthScore,
  strengthToScore,
  scoreToStrength,

  // Metadata Types
  type RelationshipMetadata,
  type CareerToCareerMetadata,
  type CareerToSkillMetadata,
  type CareerToDegreeMetadata,
  type CareerToExamMetadata,
  type CareerToIndustryMetadata,
  type CareerToCertificationMetadata,
  type CareerToRoleMetadata,

  // Relationship Interfaces
  type BaseRelationship,
  type CareerToCareerRelationshipEntity,
  type CareerToSkillRelationshipEntity,
  type CareerToDegreeRelationshipEntity,
  type CareerToExamRelationshipEntity,
  type CareerToIndustryRelationshipEntity,
  type CareerToCertificationRelationshipEntity,
  type CareerToRoleRelationshipEntity,
  type CareerRelationship,

  // Type Guards
  isCareerToCareerRelationship,
  isCareerToSkillRelationship,
  isCareerToDegreeRelationship,
  isCareerToExamRelationship,
  isCareerToIndustryRelationship,
  isCareerToCertificationRelationship,
  isCareerToRoleRelationship,

  // Builder
  RelationshipBuilder,

  // Validation
  type RelationshipValidationResult,
  validateRelationship,

  // Queries
  filterRelationshipsByType,
  filterRelationshipsByStrength,
  getRelationshipsBySource,
  getRelationshipsByTarget,
  findRelationship,

  // Analytics
  calculateRelationshipStats,
  getStrongestRelationships,
} from './CareerRelationshipTaxonomy';
