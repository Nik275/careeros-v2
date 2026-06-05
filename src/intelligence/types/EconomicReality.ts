/**
 * EconomicReality Domain
 *
 * CareerOS Intelligence - Reality Layer V3
 *
 * Purpose:
 *   Capture the student's financial situation, economic constraints,
 *   and resource availability for career decisions.
 *
 * India-First Design:
 *   - Family income brackets (urban/rural differentiation)
 *   - Education loan burden tracking
 *   - Tier-1 vs tier-2/3 city cost differences
 *   - Emergency fund requirements
 *
 * Key Concepts:
 *   - FinancialSituation: Income, savings, net worth
 *   - EducationFinancing: Loans, scholarships, family funding
 *   - EconomicConstraint: Financial barriers to career options
 *   - ResourceAvailability: What student can afford for career development
 *   - RiskTolerance: Financial capacity to take career risks
 */

import type { EntityId, ConfidenceScore, BeliefTimestamp, Evidence } from './index';

// ============================================================================
// FINANCIAL SITUATION
// ============================================================================

/**
 * Income brackets (annual, in INR) - India specific.
 */
export type IncomeBracket =
  | 'BELOW_3_LAKH'      // Below ₹3 lakh (poverty line)
  | '3_TO_6_LAKH'       // ₹3-6 lakh (lower middle class)
  | '6_TO_12_LAKH'      // ₹6-12 lakh (middle class)
  | '12_TO_25_LAKH'     // ₹12-25 lakh (upper middle class)
  | 'ABOVE_25_LAKH';    // Above ₹25 lakh (affluent)

/**
 * Financial situation of the student/family.
 */
export interface FinancialSituation {
  /** Unique identifier */
  id: EntityId;

  /** Annual family income bracket */
  familyIncomeBracket: IncomeBracket;

  /** Estimated annual family income (if known precisely) */
  estimatedAnnualIncome?: number;

  /** Geographic location type (affects cost of living) */
  locationType: 'METRO' | 'TIER_2' | 'TIER_3' | 'RURAL';

  /** Monthly discretionary budget for student */
  monthlyDiscretionaryBudget: number;

  /** Total savings available for education/career */
  availableSavings: number;

  /** Emergency fund requirement (months of expenses) */
  emergencyFundMonths: number;

  /** Whether student has their own income */
  hasOwnIncome: boolean;

  /** Student's monthly income if applicable */
  studentMonthlyIncome?: number;

  /** Evidence supporting this assessment */
  evidence: Evidence[];

  /** Confidence in this assessment */
  confidence: ConfidenceScore;

  /** When this was assessed */
  assessedAt: BeliefTimestamp;
}

// ============================================================================
// EDUCATION FINANCING
// ============================================================================

/**
 * Types of education funding sources.
 */
export type FundingSourceType =
  | 'FAMILY_SAVINGS'
  | 'EDUCATION_LOAN'
  | 'SCHOLARSHIP'
  | 'PART_TIME_WORK'
  | 'GOVERNMENT_AID'
  | 'CROWDFUNDING'
  | 'EMPLOYER_SPONSORED';

/**
 * Education loan details.
 */
export interface EducationLoan {
  /** Unique identifier */
  id: EntityId;

  /** Loan amount in INR */
  amount: number;

  /** Interest rate (annual percentage) */
  interestRate: number;

  /** Monthly EMI */
  monthlyEMI: number;

  /** Remaining tenure in months */
  remainingMonths: number;

  /** Outstanding principal */
  outstandingPrincipal: number;

  /** Whether loan is government subsidized */
  isSubsidized: boolean;

  /** Impact on career decisions */
  impactOnCareer: 'HIGH' | 'MODERATE' | 'LOW';
}

/**
 * Scholarship details.
 */
export interface Scholarship {
  /** Unique identifier */
  id: EntityId;

  /** Scholarship name */
  name: string;

  /** Amount in INR */
  amount: number;

  /** Duration of scholarship */
  duration: string;

  /** Conditions or requirements */
  conditions: string[];

  /** Whether scholarship is renewable */
  isRenewable: boolean;
}

/**
 * Education financing situation.
 */
export interface EducationFinancing {
  /** Unique identifier */
  id: EntityId;

  /** Current education funding sources */
  fundingSources: FundingSource[];

  /** Active education loans */
  loans: EducationLoan[];

  /** Active scholarships */
  scholarships: Scholarship[];

  /** Total current education debt */
  totalEducationDebt: number;

  /** Monthly debt obligation */
  monthlyDebtObligation: number;

  /** Debt-to-income ratio (if student has income) */
  debtToIncomeRatio?: number;

  /** Whether financing is a constraint on career choices */
  isConstraint: boolean;

  /** Evidence supporting this assessment */
  evidence: Evidence[];

  /** Confidence in this assessment */
  confidence: ConfidenceScore;

  /** When this was assessed */
  assessedAt: BeliefTimestamp;
}

/**
 * Individual funding source.
 */
export interface FundingSource {
  /** Type of funding */
  type: FundingSourceType;

  /** Amount provided */
  amount: number;

  /** Duration of funding */
  duration: string;

  /** Reliability of continued funding */
  reliability: ConfidenceScore;
}

// ============================================================================
// ECONOMIC CONSTRAINTS
// ============================================================================

/**
 * Types of economic constraints.
 */
export type EconomicConstraintType =
  | 'TUITION_FEES'           // Cannot afford expensive programs
  | 'RELOCATION_COSTS'       // Cannot afford to move for education/job
  | 'EXAM_PREP_COSTS'        // Cannot afford coaching/exam prep
  | 'INTERNSHIP_UNPAID'      // Cannot afford unpaid internships
  | 'CERTIFICATION_COSTS'    // Cannot afford professional certifications
  | 'NETWORKING_COSTS'       // Cannot afford professional networking events
  | 'TECHNOLOGY_COSTS'       // Cannot afford required devices/software
  | 'INTERNET_ACCESS';       // Limited/unreliable internet

/**
 * Economic constraint on career decisions.
 */
export interface EconomicConstraint {
  /** Unique identifier */
  id: EntityId;

  /** Type of constraint */
  type: EconomicConstraintType;

  /** Description of constraint */
  description: string;

  /** Estimated cost that is prohibitive (INR) */
  prohibitiveCost?: number;

  /** Impact on career options (0.0 - 1.0) */
  impact: ConfidenceScore;

  /** Whether workaround exists */
  hasWorkaround: boolean;

  /** Description of workaround if exists */
  workaroundDescription?: string;

  /** Evidence supporting this constraint */
  evidence: Evidence[];

  /** Confidence in this assessment */
  confidence: ConfidenceScore;
}

// ============================================================================
// RESOURCE AVAILABILITY
// ============================================================================

/**
 * Available resources for career development.
 */
export interface ResourceAvailability {
  /** Unique identifier */
  id: EntityId;

  /** Monthly budget for skill development */
  monthlySkillBudget: number;

  /** Budget for certifications/courses */
  certificationBudget: number;

  /** Access to technology (laptop, internet quality) */
  technologyAccess: 'FULL' | 'LIMITED' | 'MINIMAL';

  /** Access to mentorship/networking */
  mentorshipAccess: 'FULL' | 'LIMITED' | 'NONE';

  /** Time available for career development (hours per week) */
  timeAvailability: number;

  /** Whether student can relocate for opportunities */
  canRelocate: boolean;

  /** Maximum relocation budget if applicable */
  relocationBudget?: number;

  /** Evidence supporting this assessment */
  evidence: Evidence[];

  /** Confidence in this assessment */
  confidence: ConfidenceScore;

  /** When this was assessed */
  assessedAt: BeliefTimestamp;
}

// ============================================================================
// RISK TOLERANCE
// ============================================================================

/**
 * Financial risk tolerance for career decisions.
 */
export interface FinancialRiskTolerance {
  /** Unique identifier */
  id: EntityId;

  /** Can afford to pursue passion over salary */
  canPursuePassion: boolean;

  /** Can afford career change/retraining */
  canAffordRetraining: boolean;

  /** Can afford to start own business */
  canAffordEntrepreneurship: boolean;

  /** Can afford unpaid/low-paid internships */
  canAffordUnpaidWork: boolean;

  /** Can afford higher education without immediate ROI */
  canAffordDelayedROI: boolean;

  /** Months of financial runway available */
  financialRunwayMonths: number;

  /** Overall risk tolerance score (0.0 - 1.0) */
  riskToleranceScore: ConfidenceScore;

  /** Evidence supporting this assessment */
  evidence: Evidence[];

  /** Confidence in this assessment */
  confidence: ConfidenceScore;
}

// ============================================================================
// ECONOMIC REALITY AGGREGATE
// ============================================================================

/**
 * EconomicReality captures the complete financial context for career decisions.
 *
 * This is part of StudentBelief V3 - Reality Layer.
 */
export interface EconomicReality {
  /** Unique identifier */
  id: EntityId;

  /** Financial situation */
  financialSituation: FinancialSituation;

  /** Education financing */
  educationFinancing: EducationFinancing;

  /** Economic constraints */
  constraints: EconomicConstraint[];

  /** Available resources */
  resources: ResourceAvailability;

  /** Financial risk tolerance */
  riskTolerance: FinancialRiskTolerance;

  /** Overall economic barrier score (0.0 - 1.0, higher = more barriers) */
  overallBarrierScore: ConfidenceScore;

  /** Whether economics is a major decision factor */
  isMajorFactor: boolean;

  /** Evidence supporting this reality assessment */
  evidence: Evidence[];

  /** Confidence in overall economic reality */
  confidence: ConfidenceScore;

  /** When this reality was assessed */
  assessedAt: BeliefTimestamp;
}
