/**
 * CareerOS Career Relationship Taxonomy V1
 *
 * Foundational relationship system for the Career Knowledge Graph.
 * Defines all relationship types between careers and related entities
 * with confidence scoring and evidence tracking.
 *
 * @version 1.0.0
 */

import type { CareerEvidence, EvidenceSource, EvidenceConfidence } from '../career-evidence/CareerEvidenceSystem';

// ============================================================================
// RELATIONSHIP TYPE ENUMERATIONS
// ============================================================================

/**
 * Relationship types between careers
 */
export type CareerToCareerRelationship =
  | 'adjacent'           // Similar careers with transferable skills
  | 'progression'        // Natural career advancement path
  | 'pivot'              // Viable career transition
  | 'alternative'      // Different path with similar outcomes
  | 'specialization';    // Deep specialization within broader field

/**
 * Relationship types between careers and skills
 */
export type CareerToSkillRelationship =
  | 'required'           // Must-have skill
  | 'recommended'        // Strongly beneficial skill
  | 'differentiating';   // Skill that sets candidates apart

/**
 * Relationship types between careers and degrees
 */
export type CareerToDegreeRelationship =
  | 'mandatory'          // Required degree
  | 'common'             // Most common path
  | 'alternative';      // Viable alternative degree

/**
 * Relationship types between careers and exams
 */
export type CareerToExamRelationship =
  | 'required'           // Must pass exam
  | 'beneficial';        // Helpful but not required

/**
 * Relationship types between careers and industries
 */
export type CareerToIndustryRelationship =
  | 'primary'            // Main industry for this career
  | 'secondary';         // Secondary/common alternative

/**
 * Relationship types between careers and certifications
 */
export type CareerToCertificationRelationship =
  | 'required'           // Mandatory certification
  | 'optional';          // Nice-to-have certification

/**
 * Relationship types between careers and role levels
 */
export type CareerToRoleRelationship =
  | 'entry'              // Entry-level roles
  | 'mid'                // Mid-career roles
  | 'senior'             // Senior roles
  | 'leadership';        // Leadership/executive roles

/**
 * Union of all relationship types
 */
export type RelationshipType =
  | CareerToCareerRelationship
  | CareerToSkillRelationship
  | CareerToDegreeRelationship
  | CareerToExamRelationship
  | CareerToIndustryRelationship
  | CareerToCertificationRelationship
  | CareerToRoleRelationship;

// ============================================================================
// RELATIONSHIP STRENGTH
// ============================================================================

/**
 * Relationship strength levels
 */
export type RelationshipStrength =
  | 'very-strong'   // 9-10/10 - Essential or defining relationship
  | 'strong'        // 7-8/10 - Important relationship
  | 'moderate'      // 5-6/10 - Notable relationship
  | 'weak'          // 3-4/10 - Minor relationship
  | 'very-weak';    // 1-2/10 - Tenuous relationship

/**
 * Numeric strength score (1-10)
 */
export type StrengthScore = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/**
 * Map strength level to numeric score
 */
export function strengthToScore(strength: RelationshipStrength): StrengthScore {
  const map: Record<RelationshipStrength, StrengthScore> = {
    'very-strong': 10,
    'strong': 8,
    'moderate': 6,
    'weak': 4,
    'very-weak': 2,
  };
  return map[strength];
}

/**
 * Map numeric score to strength level
 */
export function scoreToStrength(score: number): RelationshipStrength {
  if (score >= 9) return 'very-strong';
  if (score >= 7) return 'strong';
  if (score >= 5) return 'moderate';
  if (score >= 3) return 'weak';
  return 'very-weak';
}

// ============================================================================
// RELATIONSHIP METADATA
// ============================================================================

/**
 * Base metadata for all relationships
 */
export interface RelationshipMetadata {
  /** When this relationship was established/updated */
  timestamp: number;

  /** Confidence in this relationship (0-1) */
  confidence: number;

  /** Evidence supporting this relationship */
  evidence?: CareerEvidence;

  /** Source of this relationship data */
  source?: EvidenceSource;

  /** Human-readable rationale */
  rationale?: string;

  /** Additional context */
  context?: Record<string, unknown>;
}

/**
 * Metadata specific to career-to-career relationships
 */
export interface CareerToCareerMetadata extends RelationshipMetadata {
  /** Estimated time to transition (in months) */
  transitionTime?: number;

  /** Skill overlap percentage (0-1) */
  skillOverlap?: number;

  /** Salary change expectation */
  salaryChange?: 'increase' | 'decrease' | 'neutral' | 'variable';

  /** Common transition path frequency */
  transitionFrequency?: 'very-common' | 'common' | 'uncommon' | 'rare';
}

/**
 * Metadata specific to career-to-skill relationships
 */
export interface CareerToSkillMetadata extends RelationshipMetadata {
  /** Skill importance level (0-10) */
  importance: number;

  /** Time to acquire skill (in months) */
  acquisitionTime?: number;

  /** Skill level required (beginner to expert) */
  proficiencyLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';

  /** Whether skill can be learned on the job */
  onTheJobLearnable?: boolean;
}

/**
 * Metadata specific to career-to-degree relationships
 */
export interface CareerToDegreeMetadata extends RelationshipMetadata {
  /** Degree relevance score (0-10) */
  relevance: number;

  /** Percentage of professionals with this degree */
  prevalence?: number;

  /** Alternative credentials accepted */
  alternativesAccepted?: boolean;
}

/**
 * Metadata specific to career-to-exam relationships
 */
export interface CareerToExamMetadata extends RelationshipMetadata {
  /** Exam difficulty (0-10) */
  difficulty?: number;

  /** Pass rate percentage */
  passRate?: number;

  /** Preparation time required (in months) */
  prepTime?: number;

  /** Maximum attempts allowed (0 = unlimited) */
  maxAttempts?: number;
}

/**
 * Metadata specific to career-to-industry relationships
 */
export interface CareerToIndustryMetadata extends RelationshipMetadata {
  /** Industry relevance score (0-10) */
  relevance: number;

  /** Market size for this career in industry */
  marketSize?: 'large' | 'medium' | 'small' | 'niche';

  /** Growth trajectory */
  growthTrajectory?: 'growing' | 'stable' | 'declining';
}

/**
 * Metadata specific to career-to-certification relationships
 */
export interface CareerToCertificationMetadata extends RelationshipMetadata {
  /** Certification value (0-10) */
  value: number;

  /** Industry recognition level */
  recognition?: 'universal' | 'industry-standard' | 'niche' | 'emerging';

  /** Validity period (in years, 0 = lifetime) */
  validityPeriod?: number;
}

/**
 * Metadata specific to career-to-role relationships
 */
export interface CareerToRoleMetadata extends RelationshipMetadata {
  /** Years of experience typically required */
  yearsExperience: number;

  /** Typical responsibilities at this level */
  responsibilities?: string[];

  /** Compensation range indicator */
  compensationLevel?: 'low' | 'medium' | 'high' | 'very-high';
}

// ============================================================================
// RELATIONSHIP INTERFACES
// ============================================================================

/**
 * Base relationship interface
 */
export interface BaseRelationship<
  TSource extends string,
  TTarget extends string,
  TRelation extends RelationshipType,
  TMetadata extends RelationshipMetadata
> {
  /** Unique relationship ID */
  id: string;

  /** Source entity ID */
  sourceId: TSource;

  /** Target entity ID */
  targetId: TTarget;

  /** Relationship type */
  relation: TRelation;

  /** Relationship strength */
  strength: RelationshipStrength;

  /** Numeric strength score (1-10) */
  strengthScore: StrengthScore;

  /** Relationship metadata */
  metadata: TMetadata;

  /** Relationship version */
  version: string;
}

/**
 * Career to Career relationship
 */
export interface CareerToCareerRelationshipEntity
  extends BaseRelationship<
    string,  // Career ID
    string,  // Career ID
    CareerToCareerRelationship,
    CareerToCareerMetadata
  > {
  type: 'career-to-career';
}

/**
 * Career to Skill relationship
 */
export interface CareerToSkillRelationshipEntity
  extends BaseRelationship<
    string,  // Career ID
    string,  // Skill ID
    CareerToSkillRelationship,
    CareerToSkillMetadata
  > {
  type: 'career-to-skill';
}

/**
 * Career to Degree relationship
 */
export interface CareerToDegreeRelationshipEntity
  extends BaseRelationship<
    string,  // Career ID
    string,  // Degree ID
    CareerToDegreeRelationship,
    CareerToDegreeMetadata
  > {
  type: 'career-to-degree';
}

/**
 * Career to Exam relationship
 */
export interface CareerToExamRelationshipEntity
  extends BaseRelationship<
    string,  // Career ID
    string,  // Exam ID
    CareerToExamRelationship,
    CareerToExamMetadata
  > {
  type: 'career-to-exam';
}

/**
 * Career to Industry relationship
 */
export interface CareerToIndustryRelationshipEntity
  extends BaseRelationship<
    string,  // Career ID
    string,  // Industry ID
    CareerToIndustryRelationship,
    CareerToIndustryMetadata
  > {
  type: 'career-to-industry';
}

/**
 * Career to Certification relationship
 */
export interface CareerToCertificationRelationshipEntity
  extends BaseRelationship<
    string,  // Career ID
    string,  // Certification ID
    CareerToCertificationRelationship,
    CareerToCertificationMetadata
  > {
  type: 'career-to-certification';
}

/**
 * Career to Role relationship
 */
export interface CareerToRoleRelationshipEntity
  extends BaseRelationship<
    string,  // Career ID
    string,  // Role ID
    CareerToRoleRelationship,
    CareerToRoleMetadata
  > {
  type: 'career-to-role';
}

/**
 * Union of all relationship entities
 */
export type CareerRelationship =
  | CareerToCareerRelationshipEntity
  | CareerToSkillRelationshipEntity
  | CareerToDegreeRelationshipEntity
  | CareerToExamRelationshipEntity
  | CareerToIndustryRelationshipEntity
  | CareerToCertificationRelationshipEntity
  | CareerToRoleRelationshipEntity;

export type RelationshipValidationInput = Omit<CareerRelationship, 'metadata'> & {
  metadata: RelationshipMetadata;
};

// ============================================================================
// RELATIONSHIP TYPE GUARDS
// ============================================================================

export function isCareerToCareerRelationship(
  relationship: CareerRelationship
): relationship is CareerToCareerRelationshipEntity {
  return relationship.type === 'career-to-career';
}

export function isCareerToSkillRelationship(
  relationship: CareerRelationship
): relationship is CareerToSkillRelationshipEntity {
  return relationship.type === 'career-to-skill';
}

export function isCareerToDegreeRelationship(
  relationship: CareerRelationship
): relationship is CareerToDegreeRelationshipEntity {
  return relationship.type === 'career-to-degree';
}

export function isCareerToExamRelationship(
  relationship: CareerRelationship
): relationship is CareerToExamRelationshipEntity {
  return relationship.type === 'career-to-exam';
}

export function isCareerToIndustryRelationship(
  relationship: CareerRelationship
): relationship is CareerToIndustryRelationshipEntity {
  return relationship.type === 'career-to-industry';
}

export function isCareerToCertificationRelationship(
  relationship: CareerRelationship
): relationship is CareerToCertificationRelationshipEntity {
  return relationship.type === 'career-to-certification';
}

export function isCareerToRoleRelationship(
  relationship: CareerRelationship
): relationship is CareerToRoleRelationshipEntity {
  return relationship.type === 'career-to-role';
}

// ============================================================================
// RELATIONSHIP BUILDER
// ============================================================================

/**
 * Builder for creating relationships with proper typing
 */
export class RelationshipBuilder {
  private id: string = '';
  private sourceId: string = '';
  private targetId: string = '';
  private relation: RelationshipType = 'adjacent';
  private strength: RelationshipStrength = 'moderate';
  private metadata: Partial<RelationshipMetadata> = {};
  private version: string = '1.0.0';

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withSource(sourceId: string): this {
    this.sourceId = sourceId;
    return this;
  }

  withTarget(targetId: string): this {
    this.targetId = targetId;
    return this;
  }

  withRelation(relation: RelationshipType): this {
    this.relation = relation;
    return this;
  }

  withStrength(strength: RelationshipStrength): this {
    this.strength = strength;
    return this;
  }

  withStrengthScore(score: StrengthScore): this {
    this.strength = scoreToStrength(score);
    return this;
  }

  withMetadata<TMetadata extends RelationshipMetadata>(
    metadata: Partial<TMetadata>
  ): this {
    this.metadata = { ...this.metadata, ...metadata };
    return this;
  }

  withVersion(version: string): this {
    this.version = version;
    return this;
  }

  buildCareerToCareer(): CareerToCareerRelationshipEntity {
    return {
      id: this.id || `rel-ctc-${this.sourceId}-${this.targetId}`,
      type: 'career-to-career',
      sourceId: this.sourceId,
      targetId: this.targetId,
      relation: this.relation as CareerToCareerRelationship,
      strength: this.strength,
      strengthScore: strengthToScore(this.strength),
      metadata: {
        timestamp: Date.now(),
        confidence: 0.8,
        ...this.metadata,
      } as CareerToCareerMetadata,
      version: this.version,
    };
  }

  buildCareerToSkill(): CareerToSkillRelationshipEntity {
    return {
      id: this.id || `rel-cts-${this.sourceId}-${this.targetId}`,
      type: 'career-to-skill',
      sourceId: this.sourceId,
      targetId: this.targetId,
      relation: this.relation as CareerToSkillRelationship,
      strength: this.strength,
      strengthScore: strengthToScore(this.strength),
      metadata: {
        timestamp: Date.now(),
        confidence: 0.8,
        importance: 7,
        ...this.metadata,
      } as CareerToSkillMetadata,
      version: this.version,
    };
  }

  buildCareerToDegree(): CareerToDegreeRelationshipEntity {
    return {
      id: this.id || `rel-ctd-${this.sourceId}-${this.targetId}`,
      type: 'career-to-degree',
      sourceId: this.sourceId,
      targetId: this.targetId,
      relation: this.relation as CareerToDegreeRelationship,
      strength: this.strength,
      strengthScore: strengthToScore(this.strength),
      metadata: {
        timestamp: Date.now(),
        confidence: 0.8,
        relevance: 7,
        ...this.metadata,
      } as CareerToDegreeMetadata,
      version: this.version,
    };
  }

  buildCareerToExam(): CareerToExamRelationshipEntity {
    return {
      id: this.id || `rel-cte-${this.sourceId}-${this.targetId}`,
      type: 'career-to-exam',
      sourceId: this.sourceId,
      targetId: this.targetId,
      relation: this.relation as CareerToExamRelationship,
      strength: this.strength,
      strengthScore: strengthToScore(this.strength),
      metadata: {
        timestamp: Date.now(),
        confidence: 0.8,
        ...this.metadata,
      } as CareerToExamMetadata,
      version: this.version,
    };
  }

  buildCareerToIndustry(): CareerToIndustryRelationshipEntity {
    return {
      id: this.id || `rel-cti-${this.sourceId}-${this.targetId}`,
      type: 'career-to-industry',
      sourceId: this.sourceId,
      targetId: this.targetId,
      relation: this.relation as CareerToIndustryRelationship,
      strength: this.strength,
      strengthScore: strengthToScore(this.strength),
      metadata: {
        timestamp: Date.now(),
        confidence: 0.8,
        relevance: 7,
        ...this.metadata,
      } as CareerToIndustryMetadata,
      version: this.version,
    };
  }

  buildCareerToCertification(): CareerToCertificationRelationshipEntity {
    return {
      id: this.id || `rel-ctcert-${this.sourceId}-${this.targetId}`,
      type: 'career-to-certification',
      sourceId: this.sourceId,
      targetId: this.targetId,
      relation: this.relation as CareerToCertificationRelationship,
      strength: this.strength,
      strengthScore: strengthToScore(this.strength),
      metadata: {
        timestamp: Date.now(),
        confidence: 0.8,
        value: 7,
        ...this.metadata,
      } as CareerToCertificationMetadata,
      version: this.version,
    };
  }

  buildCareerToRole(): CareerToRoleRelationshipEntity {
    return {
      id: this.id || `rel-ctr-${this.sourceId}-${this.targetId}`,
      type: 'career-to-role',
      sourceId: this.sourceId,
      targetId: this.targetId,
      relation: this.relation as CareerToRoleRelationship,
      strength: this.strength,
      strengthScore: strengthToScore(this.strength),
      metadata: {
        timestamp: Date.now(),
        confidence: 0.8,
        yearsExperience: 0,
        ...this.metadata,
      } as CareerToRoleMetadata,
      version: this.version,
    };
  }
}

// ============================================================================
// RELATIONSHIP VALIDATION
// ============================================================================

/**
 * Validation result for relationships
 */
export interface RelationshipValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate a career relationship
 */
export function validateRelationship(
  relationship: RelationshipValidationInput
): RelationshipValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  if (!relationship.id) errors.push('Missing relationship ID');
  if (!relationship.sourceId) errors.push('Missing source ID');
  if (!relationship.targetId) errors.push('Missing target ID');
  if (!relationship.relation) errors.push('Missing relationship type');
  if (!relationship.strength) errors.push('Missing relationship strength');
  if (!relationship.metadata) errors.push('Missing metadata');

  // Validate strength score matches strength level
  const expectedScore = strengthToScore(relationship.strength);
  if (relationship.strengthScore !== expectedScore) {
    warnings.push(
      `Strength score ${relationship.strengthScore} does not match strength level ${relationship.strength} (expected ${expectedScore})`
    );
  }

  // Validate metadata
  if (relationship.metadata) {
    if (!relationship.metadata.timestamp) {
      warnings.push('Missing timestamp in metadata');
    }
    if (typeof relationship.metadata.confidence !== 'number') {
      warnings.push('Missing or invalid confidence in metadata');
    } else if (
      relationship.metadata.confidence < 0 ||
      relationship.metadata.confidence > 1
    ) {
      errors.push('Confidence must be between 0 and 1');
    }
  }

  // Type-specific validation
  switch (relationship.type) {
    case 'career-to-skill': {
      const meta = relationship.metadata as CareerToSkillMetadata;
      if (typeof meta.importance !== 'number') {
        errors.push('Career-to-skill relationship missing importance score');
      }
      break;
    }
    case 'career-to-degree': {
      const meta = relationship.metadata as CareerToDegreeMetadata;
      if (typeof meta.relevance !== 'number') {
        errors.push('Career-to-degree relationship missing relevance score');
      }
      break;
    }
    case 'career-to-industry': {
      const meta = relationship.metadata as CareerToIndustryMetadata;
      if (typeof meta.relevance !== 'number') {
        errors.push('Career-to-industry relationship missing relevance score');
      }
      break;
    }
    case 'career-to-certification': {
      const meta = relationship.metadata as CareerToCertificationMetadata;
      if (typeof meta.value !== 'number') {
        errors.push('Career-to-certification relationship missing value score');
      }
      break;
    }
    case 'career-to-role': {
      const meta = relationship.metadata as CareerToRoleMetadata;
      if (typeof meta.yearsExperience !== 'number') {
        errors.push('Career-to-role relationship missing yearsExperience');
      }
      break;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// RELATIONSHIP QUERIES
// ============================================================================

/**
 * Filter relationships by type
 */
export function filterRelationshipsByType<
  T extends CareerRelationship
>(
  relationships: T[],
  type: T['type']
): T[] {
  return relationships.filter(r => r.type === type);
}

/**
 * Filter relationships by strength
 */
export function filterRelationshipsByStrength(
  relationships: CareerRelationship[],
  minStrength: RelationshipStrength
): CareerRelationship[] {
  const strengthOrder: RelationshipStrength[] = [
    'very-weak',
    'weak',
    'moderate',
    'strong',
    'very-strong',
  ];
  const minIndex = strengthOrder.indexOf(minStrength);
  return relationships.filter(r =>
    strengthOrder.indexOf(r.strength) >= minIndex
  );
}

/**
 * Get relationships by source ID
 */
export function getRelationshipsBySource(
  relationships: CareerRelationship[],
  sourceId: string
): CareerRelationship[] {
  return relationships.filter(r => r.sourceId === sourceId);
}

/**
 * Get relationships by target ID
 */
export function getRelationshipsByTarget(
  relationships: CareerRelationship[],
  targetId: string
): CareerRelationship[] {
  return relationships.filter(r => r.targetId === targetId);
}

/**
 * Find relationship between two entities
 */
export function findRelationship(
  relationships: CareerRelationship[],
  sourceId: string,
  targetId: string
): CareerRelationship | undefined {
  return relationships.find(
    r => r.sourceId === sourceId && r.targetId === targetId
  );
}

// ============================================================================
// RELATIONSHIP ANALYTICS
// ============================================================================

/**
 * Calculate relationship statistics
 */
export function calculateRelationshipStats(
  relationships: CareerRelationship[]
): {
  total: number;
  byType: Record<string, number>;
  byStrength: Record<RelationshipStrength, number>;
  averageConfidence: number;
  highConfidenceCount: number;
} {
  const byType: Record<string, number> = {};
  const byStrength: Record<RelationshipStrength, number> = {
    'very-strong': 0,
    'strong': 0,
    'moderate': 0,
    'weak': 0,
    'very-weak': 0,
  };

  let totalConfidence = 0;
  let highConfidenceCount = 0;

  for (const rel of relationships) {
    // Count by type
    byType[rel.type] = (byType[rel.type] || 0) + 1;

    // Count by strength
    byStrength[rel.strength]++;

    // Confidence stats
    const confidence = rel.metadata?.confidence || 0;
    totalConfidence += confidence;
    if (confidence >= 0.8) highConfidenceCount++;
  }

  return {
    total: relationships.length,
    byType,
    byStrength,
    averageConfidence: relationships.length > 0
      ? totalConfidence / relationships.length
      : 0,
    highConfidenceCount,
  };
}

/**
 * Get strongest relationships for an entity
 */
export function getStrongestRelationships(
  relationships: CareerRelationship[],
  entityId: string,
  limit: number = 10
): CareerRelationship[] {
  const entityRels = relationships.filter(
    r => r.sourceId === entityId || r.targetId === entityId
  );

  const strengthOrder: RelationshipStrength[] = [
    'very-weak',
    'weak',
    'moderate',
    'strong',
    'very-strong',
  ];

  return entityRels
    .sort((a, b) =>
      strengthOrder.indexOf(b.strength) - strengthOrder.indexOf(a.strength)
    )
    .slice(0, limit);
}
