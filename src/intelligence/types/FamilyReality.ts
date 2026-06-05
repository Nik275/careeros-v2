/**
 * FamilyReality Domain
 *
 * CareerOS Intelligence - Reality Layer V3
 *
 * Purpose:
 *   Capture the student's family context, obligations, support system,
 *   and cultural factors that influence career decisions.
 *
 * India-First Design:
 *   - Joint family considerations
 *   - Parental expectation pressure
 * *   - Cultural obligation tracking
 *   - Sibling career patterns
 *
 * Key Concepts:
 *   - FamilyStructure: Nuclear, joint, extended household composition
 *   - FamilyObligation: Financial or caregiving responsibilities
 *   - ParentalExpectation: Career expectations from parents
 *   - FamilySupport: Emotional and financial backing available
 *   - CulturalConstraint: Cultural norms affecting career choices
 */

import type { EntityId, ConfidenceScore, BeliefTimestamp, Evidence } from './index';

// ============================================================================
// FAMILY STRUCTURE
// ============================================================================

/**
 * Types of family structures in India.
 */
export type FamilyStructureType =
  | 'NUCLEAR'        // Parents + children only
  | 'JOINT'          // Multi-generational, shared household
  | 'EXTENDED'       // Nuclear with nearby relatives
  | 'SINGLE_PARENT'  // One parent household
  | 'GUARDIAN'       // Raised by non-parent relatives
  | 'INDEPENDENT';   // Living alone, financially independent

/**
 * Family structure and composition.
 */
export interface FamilyStructure {
  /** Unique identifier */
  id: EntityId;

  /** Type of family structure */
  type: FamilyStructureType;

  /** Human-readable description */
  description: string;

  /** Number of dependents relying on student */
  dependentCount: number;

  /** Is student the primary breadwinner */
  isPrimaryBreadwinner: boolean;

  /** Family members in the household */
  householdMembers: HouseholdMember[];

  /** Evidence supporting this structure assessment */
  evidence: Evidence[];

  /** Confidence in this assessment */
  confidence: ConfidenceScore;

  /** When this was assessed */
  assessedAt: BeliefTimestamp;
}

/**
 * Individual household member.
 */
export interface HouseholdMember {
  /** Relationship to student */
  relationship: 'FATHER' | 'MOTHER' | 'SIBLING' | 'GRANDPARENT' | 'SPOUSE' | 'CHILD' | 'OTHER';

  /** Whether this member earns income */
  isEarning: boolean;

  /** Whether this member requires financial support */
  requiresSupport: boolean;

  /** Whether this member provides financial support to student */
  providesSupport: boolean;

  /** Education level (for context) */
  educationLevel?: string;

  /** Occupation (for context) */
  occupation?: string;
}

// ============================================================================
// FAMILY OBLIGATIONS
// ============================================================================

/**
 * Types of family obligations.
 */
export type ObligationType =
  | 'FINANCIAL_SUPPORT'     // Supporting family financially
  | 'CAREGIVING'            // Caring for elderly/sick family members
  | 'CONTRIBUTION'          // Expected contribution to family income
  | 'EARLY_MARRIAGE'        // Pressure to marry early
  | 'LOCATION_BOUND'        // Expected to stay in hometown
  | 'FAMILY_BUSINESS'       // Expected to join family business
  | 'SIBLING_EDUCATION';    // Responsible for sibling's education

/**
 * Family obligation that constrains career decisions.
 */
export interface FamilyObligation {
  /** Unique identifier */
  id: EntityId;

  /** Type of obligation */
  type: ObligationType;

  /** Human-readable description */
  description: string;

  /** Monthly financial obligation in INR (if applicable) */
  monthlyAmount?: number;

  /** Time commitment required (hours per week) */
  timeCommitmentHours?: number;

  /** Duration of obligation (ongoing, temporary, etc.) */
  duration: 'ONGOING' | 'TEMPORARY' | 'UNTIL_EVENT';

  /** Whether this obligation is negotiable */
  isNegotiable: boolean;

  /** Impact on career flexibility (0.0 - 1.0) */
  impactOnFlexibility: ConfidenceScore;

  /** Evidence supporting this obligation assessment */
  evidence: Evidence[];

  /** Confidence in this assessment */
  confidence: ConfidenceScore;
}

// ============================================================================
// PARENTAL EXPECTATIONS
// ============================================================================

/**
 * Strength of parental expectation.
 */
export type ExpectationStrength = 'STRONG' | 'MODERATE' | 'WEAK' | 'NONE';

/**
 * Parental expectation for student's career.
 */
export interface ParentalExpectation {
  /** Unique identifier */
  id: EntityId;

  /** Which parent (or both) */
  source: 'FATHER' | 'MOTHER' | 'BOTH' | 'GUARDIAN';

  /** Expected career field (e.g., "Engineering", "Medicine") */
  expectedField?: string;

  /** Expected degree or qualification */
  expectedDegree?: string;

  /** Specific institutions mentioned */
  preferredInstitutions?: string[];

  /** Strength of expectation */
  strength: ExpectationStrength;

  /** Whether expectation is explicitly stated or inferred */
  isExplicit: boolean;

  /** Pressure level felt by student (0.0 - 1.0) */
  pressureLevel: ConfidenceScore;

  /** Evidence supporting this expectation assessment */
  evidence: Evidence[];

  /** Confidence in this assessment */
  confidence: ConfidenceScore;
}

// ============================================================================
// FAMILY SUPPORT
// ============================================================================

/**
 * Types of family support.
 */
export type SupportType =
  | 'FINANCIAL'      // Money for education/career
  | 'EMOTIONAL'      // Encouragement and understanding
  | 'NETWORK'        // Family connections and referrals
  | 'ACCOMMODATION'  // Free/cheap housing
  | 'FLEXIBILITY';   // Allowing student to explore options

/**
 * Family support available to student.
 */
export interface FamilySupport {
  /** Unique identifier */
  id: EntityId;

  /** Type of support */
  type: SupportType;

  /** Description of support */
  description: string;

  /** Estimated financial value (INR per month/year) */
  financialValue?: {
    amount: number;
    period: 'MONTHLY' | 'YEARLY' | 'ONE_TIME';
  };

  /** Reliability of support (0.0 - 1.0) */
  reliability: ConfidenceScore;

  /** Duration support is expected to continue */
  expectedDuration: string;

  /** Evidence supporting this support assessment */
  evidence: Evidence[];

  /** Confidence in this assessment */
  confidence: ConfidenceScore;
}

// ============================================================================
// CULTURAL CONSTRAINTS
// ============================================================================

/**
 * Types of cultural constraints.
 */
export type CulturalConstraintType =
  | 'GENDER_ROLES'           // Gender-based career expectations
  | 'CASTE_CONSIDERATIONS'   // Caste-based profession preferences
  | 'COMMUNITY_PRESSURE'     // Community standing concerns
  | 'RELIGIOUS_OBLIGATIONS'  // Religious duties affecting career
  | 'TRADITIONAL_PATHS'      // Pressure to follow traditional careers
  | 'GEOGRAPHIC_LIMITS';     // Expected to stay in specific region

/**
 * Cultural constraint on career decisions.
 */
export interface CulturalConstraint {
  /** Unique identifier */
  id: EntityId;

  /** Type of constraint */
  type: CulturalConstraintType;

  /** Description of constraint */
  description: string;

  /** Impact on career options (0.0 - 1.0) */
  impact: ConfidenceScore;

  /** Whether constraint is strictly enforced or flexible */
  flexibility: 'STRICT' | 'MODERATE' | 'FLEXIBLE';

  /** Evidence supporting this constraint assessment */
  evidence: Evidence[];

  /** Confidence in this assessment */
  confidence: ConfidenceScore;
}

// ============================================================================
// FAMILY REALITY AGGREGATE
// ============================================================================

/**
 * FamilyReality captures the complete family context for career decisions.
 *
 * This is part of StudentBelief V3 - Reality Layer.
 */
export interface FamilyReality {
  /** Unique identifier */
  id: EntityId;

  /** Family structure and composition */
  structure: FamilyStructure;

  /** Family obligations constraining decisions */
  obligations: FamilyObligation[];

  /** Parental career expectations */
  parentalExpectations: ParentalExpectation[];

  /** Support available from family */
  support: FamilySupport[];

  /** Cultural constraints on career */
  culturalConstraints: CulturalConstraint[];

  /** Overall family influence score (0.0 - 1.0) */
  overallInfluence: ConfidenceScore;

  /** Whether family is a major decision factor */
  isMajorFactor: boolean;

  /** Evidence supporting this reality assessment */
  evidence: Evidence[];

  /** Confidence in overall family reality */
  confidence: ConfidenceScore;

  /** When this reality was assessed */
  assessedAt: BeliefTimestamp;
}
