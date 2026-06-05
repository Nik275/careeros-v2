/**
 * Decision Coalition Engine V2 - India-First Stakeholder Model
 * 
 * CareerOS Frontier Engine V2 - Decision Coalition Engine
 * 
 * Purpose:
 *   Model career decisions as a coalition problem rather than individual preference.
 *   Specifically designed for Indian context where family influence is significant.
 * 
 * Architecture Principle:
 *   Career decisions in India involve multiple stakeholders:
 *   - Student (primary decision maker)
 *   - Parents (significant influence, often financial sponsors)
 *   - Extended family (cultural/social expectations)
 *   - Economic reality (financial pressures, income urgency)
 * 
 *   The engine estimates the WEIGHT of each stakeholder's influence and
 *   the PRESSURES affecting the decision (financial, social, cultural).
 * 
 * Key Concepts:
 *   - Stakeholder: An entity with influence (student, parent, family)
 *   - Influence Weight: How much say each stakeholder has (0.0 - 1.0)
 *   - Pressure Factor: External forces shaping the decision
 *   - Coalition Dynamics: How stakeholders interact and conflict
 * 
 * Inputs:
 *   - Assessment Responses (family dynamics, financial situation, etc.)
 *   - StudentBelief (from Student Model Engine)
 * 
 * Outputs:
 *   - DecisionCoalition: Complete stakeholder model with weights and pressures
 *   - Explainability: Why each weight was assigned
 *   - Parent Report Data: Structured for future parent-facing reports
 * 
 * India-First Design:
 *   - Heavy emphasis on family influence and obligation
 *   - Financial pressure modeling (education loans, family income)
 *   - Cultural expectation tracking (prestige, marriageability, social status)
 *   - Income urgency for families needing immediate financial support
 * 
 * Future Expansion:
 *   - Parent portal integration
 *   - Family counseling session support
 *   - Multi-generational obligation tracking
 *   - Regional cultural variation (North vs South India, urban vs rural)
 */

import { EntityId, ConfidenceScore, BeliefTimestamp, EvidenceSource } from '../types';
import { AssessmentResponse, AssessmentResult } from '../student-model/StudentModelEngine';

// ============================================================================
// COALITION STAKEHOLDER TYPES
// ============================================================================

/**
 * Types of stakeholders in the career decision coalition.
 * 
 * In Indian context, decisions often involve:
 *   - STUDENT: Primary decision maker but often constrained by family
 *   - PARENT_PRIMARY: Main decision authority (father or mother)
 *   - PARENT_SECONDARY: Other parent with secondary influence
 *   - EXTENDED_FAMILY: Grandparents, uncles, aunts with cultural influence
 *   - SIBLINGS: Older siblings who may be role models or financial supporters
 */
export type StakeholderType = 
  | 'STUDENT'
  | 'PARENT_PRIMARY'
  | 'PARENT_SECONDARY' 
  | 'EXTENDED_FAMILY'
  | 'SIBLING';

/**
 * A stakeholder in the career decision coalition.
 * 
 * Each stakeholder has:
 *   - weight: Influence on final decision (0.0 - 1.0)
 *   - confidence: How certain we are about their weight
 *   - evidence: Assessment responses that determined their weight
 */
export interface Stakeholder {
  /** Unique identifier for this stakeholder instance */
  id: EntityId;
  
  /** Type of stakeholder */
  type: StakeholderType;
  
  /** Display name (e.g., "Student", "Father", "Mother", "Family") */
  name: string;
  
  /** Influence weight on decision (0.0 - 1.0) */
  weight: ConfidenceScore;
  
  /** Confidence in this weight estimate */
  confidence: ConfidenceScore;
  
  /** Evidence items supporting this weight */
  evidence: StakeholderEvidence[];
  
  /** Relationship to student (for parent reports) */
  relationship?: string;
}

/**
 * Evidence for stakeholder weight determination.
 */
export interface StakeholderEvidence {
  /** Evidence identifier */
  id: string;
  
  /** Question that provided this evidence */
  questionId: string;
  
  /** Response value */
  response: string;
  
  /** How this evidence affects weight */
  impact: 'INCREASES_WEIGHT' | 'DECREASES_WEIGHT' | 'NEUTRAL';
  
  /** Human-readable explanation */
  explanation: string;
  
  /** Timestamp */
  timestamp: BeliefTimestamp;
}

// ============================================================================
// COALITION PRESSURE FACTORS
// ============================================================================

/**
 * The 7 core coalition factors that model decision pressures.
 * 
 * These factors capture the EXTERNAL FORCES shaping the career decision,
 * distinct from the student's internal preferences (which are in StudentBelief).
 */
export interface CoalitionPressures {
  /** 
   * Student's relative decision-making power (0.0 - 1.0)
   * 1.0 = Student decides independently
   * 0.0 = Student has no say
   * 
   * India context: Often 0.3-0.6 for traditional families, 0.7-1.0 for progressive
   */
  studentWeight: PressureFactor;
  
  /**
   * Parent's relative decision-making power (0.0 - 1.0)
   * 1.0 = Parents decide completely
   * 0.0 = Parents have no influence
   * 
   * India context: Often 0.4-0.8, higher in traditional/conservative families
   */
  parentWeight: PressureFactor;
  
  /**
   * Extended family's cultural/social influence (0.0 - 1.0)
   * Captures pressure from grandparents, relatives, community
   * 
   * India context: Significant in joint families, matters for "prestige" careers
   */
  familyInfluence: PressureFactor;
  
  /**
   * Financial pressure on career choice (0.0 - 1.0)
   * How much financial considerations constrain options
   * 
   * India context: Very high for middle-class families, education loan burdens
   */
  financialPressure: PressureFactor;
  
  /**
   * Urgency for immediate income (0.0 - 1.0)
   * How quickly the family needs the student to earn
   * 
   * India context: High for families with financial distress,
   *                affects willingness to pursue long education paths
   */
  incomeUrgency: PressureFactor;
  
  /**
   * Family's collective risk tolerance (0.0 - 1.0)
   * How much uncertainty the family can accept
   * 
   * India context: Often lower than student tolerance due to 
   *                responsibility to extended family
   */
  riskTolerance: PressureFactor;
  
  /**
   * Flexibility in career path choice (0.0 - 1.0)
   * How open the coalition is to non-traditional paths
   * 
   * India context: Low for "safe" careers (engineering, medicine),
   *                affects creative/entrepreneurial choices
   */
  careerFlexibility: PressureFactor;
}

/**
 * Individual pressure factor with value, confidence, and evidence.
 */
export interface PressureFactor {
  /** Estimated value (0.0 - 1.0) */
  value: ConfidenceScore;
  
  /** Confidence in this estimate */
  confidence: ConfidenceScore;
  
  /** Number of evidence items */
  evidenceCount: number;
  
  /** Evidence items */
  evidence: PressureEvidence[];
  
  /** Human-readable explanation */
  explanation: string;
}

/**
 * Evidence for pressure factor calculation.
 */
export interface PressureEvidence {
  /** Evidence identifier */
  id: string;
  
  /** Question that provided this evidence */
  questionId: string;
  
  /** Response value */
  response: string;
  
  /** Score contribution */
  contribution: number;
  
  /** Human-readable explanation */
  explanation: string;
  
  /** Timestamp */
  timestamp: BeliefTimestamp;
}

// ============================================================================
// DECISION COALITION MODEL
// ============================================================================

/**
 * The complete Decision Coalition model.
 * 
 * This is the PRIMARY OUTPUT of the Decision Coalition Engine.
 * It captures the complete stakeholder dynamics for a career decision.
 */
export interface DecisionCoalition {
  /** Unique identifier for this coalition model */
  id: EntityId;
  
  /** Student this coalition belongs to */
  studentId: EntityId;
  
  /** Version number */
  version: number;
  
  /** When this coalition was modeled */
  timestamp: BeliefTimestamp;
  
  /** All stakeholders in the coalition */
  stakeholders: Stakeholder[];
  
  /** The 7 pressure factors */
  pressures: CoalitionPressures;
  
  /** Coalition dynamics summary */
  dynamics: CoalitionDynamics;
  
  /** Data for future parent-facing reports */
  parentReportData: ParentReportData;
  
  /** Family obligation calculations for future use */
  familyObligations: CoalitionFamilyObligation[];
  
  /** Overall confidence in the coalition model */
  overallConfidence: ConfidenceScore;
  
  /** Number of assessment responses used */
  evidenceCount: number;
}

/**
 * Coalition dynamics summary.
 */
export interface CoalitionDynamics {
  /** Description of power balance (e.g., "Parent-dominated", "Student-led") */
  powerBalance: string;
  
  /** Whether student and parent weights are balanced */
  isBalanced: boolean;
  
  /** Potential conflict areas */
  conflictAreas: string[];
  
  /** Alignment between stakeholders (0.0 - 1.0) */
  stakeholderAlignment: ConfidenceScore;
  
  /** Primary decision maker */
  primaryDecisionMaker: StakeholderType;
}

/**
 * Data structured for parent-facing reports.
 * 
 * This enables future parent portal features where parents can see:
 * - Their influence on the decision
 * - Financial implications
 * - How their child's preferences align with family constraints
 */
export interface ParentReportData {
  /** Whether this data can be shown to parents */
  canShowToParents: boolean;
  
  /** Parent-friendly summary of coalition */
  parentSummary: string;
  
  /** Student's stated preferences (simplified) */
  studentPreferences: string[];
  
  /** Family constraints that affect options */
  familyConstraints: string[];
  
  /** Financial considerations */
  financialConsiderations: string[];
  
  /** Suggested conversation topics */
  conversationStarters: string[];
}

/**
 * Family obligation calculation for coalition use.
 * 
 * Captures financial and social obligations that constrain career choices.
 * Note: This is separate from FamilyReality.FamilyObligation in StudentBelief V3.
 */
export interface CoalitionFamilyObligation {
  /** Type of obligation */
  type: 'FINANCIAL_SUPPORT' | 'CAREGIVING' | 'STATUS_MAINTENANCE' | 'SIBLING_SUPPORT';
  
  /** Description */
  description: string;
  
  /** Estimated monthly financial impact (INR) */
  estimatedMonthlyImpact?: number;
  
  /** Timeline (immediate, short-term, long-term) */
  timeline: 'IMMEDIATE' | 'SHORT_TERM' | 'LONG_TERM';
  
  /** Flexibility (can it be negotiated?) */
  flexibility: 'FIXED' | 'NEGOTIABLE' | 'FLEXIBLE';
}

// ============================================================================
// TRANSPARENT SCORING CONFIGURATION
// ============================================================================

/**
 * Scoring rule for coalition factor calculation.
 */
export interface CoalitionScoringRule {
  /** Question this rule applies to */
  questionId: string;
  
  /** Response value this rule matches */
  responseValue: string;
  
  /** Which pressure factor this affects */
  targetFactor: keyof CoalitionPressures;
  
  /** Base score contribution (0.0 - 1.0) */
  baseScore: number;
  
  /** Weight of this evidence */
  weight: number;
  
  /** Human-readable explanation */
  explanation: string;
}

/**
 * Configuration for coalition scoring.
 */
export interface CoalitionScoringConfig {
  /** Version identifier */
  version: string;
  
  /** All scoring rules */
  rules: CoalitionScoringRule[];
  
  /** Confidence calculation parameters */
  confidence: {
    baseConfidence: number;
    evidenceMultiplier: number;
    maxConfidence: number;
    minEvidenceForConfidence: number;
  };
}

/**
 * DEFAULT COALITION SCORING CONFIGURATION
 * 
 * Explicit, documented scoring rules for all coalition factors.
 * No magic numbers - all logic is transparent.
 */
const DEFAULT_COALITION_SCORING: CoalitionScoringConfig = {
  version: 'v2.0.0-india',
  
  rules: [
    // ========================================================================
    // STUDENT WEIGHT - Decision-making autonomy
    // ========================================================================
    {
      questionId: 'decision_maker',
      responseValue: 'myself',
      targetFactor: 'studentWeight',
      baseScore: 0.90,
      weight: 1.0,
      explanation: 'Student claims primary decision-making authority',
    },
    {
      questionId: 'decision_maker',
      responseValue: 'parents',
      targetFactor: 'studentWeight',
      baseScore: 0.20,
      weight: 1.0,
      explanation: 'Parents are primary decision makers, student has limited say',
    },
    {
      questionId: 'decision_maker',
      responseValue: 'family_collective',
      targetFactor: 'studentWeight',
      baseScore: 0.40,
      weight: 0.9,
      explanation: 'Collective family decision dilutes individual student weight',
    },
    {
      questionId: 'parent_discussion_frequency',
      responseValue: 'always',
      targetFactor: 'studentWeight',
      baseScore: 0.60,
      weight: 0.8,
      explanation: 'Always discussing with parents suggests shared decision making',
    },
    {
      questionId: 'parent_discussion_frequency',
      responseValue: 'sometimes',
      targetFactor: 'studentWeight',
      baseScore: 0.75,
      weight: 0.7,
      explanation: 'Sometimes discussing suggests moderate student autonomy',
    },
    {
      questionId: 'parent_discussion_frequency',
      responseValue: 'rarely',
      targetFactor: 'studentWeight',
      baseScore: 0.90,
      weight: 0.7,
      explanation: 'Rarely discussing suggests high student autonomy',
    },
    
    // ========================================================================
    // PARENT WEIGHT - Parental influence
    // ========================================================================
    {
      questionId: 'decision_maker',
      responseValue: 'parents',
      targetFactor: 'parentWeight',
      baseScore: 0.85,
      weight: 1.0,
      explanation: 'Explicit parent decision-making authority',
    },
    {
      questionId: 'decision_maker',
      responseValue: 'family_collective',
      targetFactor: 'parentWeight',
      baseScore: 0.70,
      weight: 0.9,
      explanation: 'Collective decision includes strong parent influence',
    },
    {
      questionId: 'parent_discussion_frequency',
      responseValue: 'always',
      targetFactor: 'parentWeight',
      baseScore: 0.80,
      weight: 0.8,
      explanation: 'Always discussing indicates high parent involvement',
    },
    {
      questionId: 'parent_career_expectation',
      responseValue: 'very_important',
      targetFactor: 'parentWeight',
      baseScore: 0.75,
      weight: 0.9,
      explanation: 'Very important parent expectations increase parent weight',
    },
    {
      questionId: 'parent_career_expectation',
      responseValue: 'somewhat_important',
      targetFactor: 'parentWeight',
      baseScore: 0.50,
      weight: 0.8,
      explanation: 'Moderate parent expectations indicate moderate influence',
    },
    {
      questionId: 'financial_sponsor',
      responseValue: 'parents',
      targetFactor: 'parentWeight',
      baseScore: 0.70,
      weight: 0.9,
      explanation: 'Parents as financial sponsors increases their decision weight',
    },
    
    // ========================================================================
    // FAMILY INFLUENCE - Extended family and cultural pressure
    // ========================================================================
    {
      questionId: 'extended_family_opinion',
      responseValue: 'very_important',
      targetFactor: 'familyInfluence',
      baseScore: 0.85,
      weight: 1.0,
      explanation: 'Very important extended family opinion indicates high cultural pressure',
    },
    {
      questionId: 'extended_family_opinion',
      responseValue: 'somewhat_important',
      targetFactor: 'familyInfluence',
      baseScore: 0.55,
      weight: 0.8,
      explanation: 'Moderate extended family influence',
    },
    {
      questionId: 'extended_family_opinion',
      responseValue: 'not_important',
      targetFactor: 'familyInfluence',
      baseScore: 0.15,
      weight: 0.8,
      explanation: 'Extended family opinion not important suggests low cultural pressure',
    },
    {
      questionId: 'family_type',
      responseValue: 'joint_family',
      targetFactor: 'familyInfluence',
      baseScore: 0.75,
      weight: 0.9,
      explanation: 'Joint families typically have higher extended family influence',
    },
    {
      questionId: 'family_type',
      responseValue: 'nuclear_family',
      targetFactor: 'familyInfluence',
      baseScore: 0.40,
      weight: 0.8,
      explanation: 'Nuclear families typically have lower extended family influence',
    },
    {
      questionId: 'prestige_career_pressure',
      responseValue: 'high',
      targetFactor: 'familyInfluence',
      baseScore: 0.80,
      weight: 0.9,
      explanation: 'High pressure for prestigious careers indicates strong family/social influence',
    },
    
    // ========================================================================
    // FINANCIAL PRESSURE - Economic constraints
    // ========================================================================
    {
      questionId: 'financial_constraints',
      responseValue: 'major_constraint',
      targetFactor: 'financialPressure',
      baseScore: 0.90,
      weight: 1.0,
      explanation: 'Major financial constraints significantly limit career options',
    },
    {
      questionId: 'financial_constraints',
      responseValue: 'some_constraint',
      targetFactor: 'financialPressure',
      baseScore: 0.60,
      weight: 0.9,
      explanation: 'Some financial constraints moderately limit options',
    },
    {
      questionId: 'financial_constraints',
      responseValue: 'no_constraint',
      targetFactor: 'financialPressure',
      baseScore: 0.10,
      weight: 0.8,
      explanation: 'No financial constraints means options are not limited by money',
    },
    {
      questionId: 'education_funding',
      responseValue: 'education_loan',
      targetFactor: 'financialPressure',
      baseScore: 0.75,
      weight: 0.9,
      explanation: 'Education loans create pressure for high-return careers',
    },
    {
      questionId: 'education_funding',
      responseValue: 'family_savings',
      targetFactor: 'financialPressure',
      baseScore: 0.50,
      weight: 0.8,
      explanation: 'Family savings reduce but do not eliminate financial pressure',
    },
    {
      questionId: 'family_income_level',
      responseValue: 'below_3_lakh',
      targetFactor: 'financialPressure',
      baseScore: 0.85,
      weight: 0.9,
      explanation: 'Lower family income increases financial pressure on career choice',
    },
    {
      questionId: 'family_income_level',
      responseValue: '3_to_8_lakh',
      targetFactor: 'financialPressure',
      baseScore: 0.60,
      weight: 0.8,
      explanation: 'Middle income creates moderate financial pressure',
    },
    
    // ========================================================================
    // INCOME URGENCY - Need for immediate earnings
    // ========================================================================
    {
      questionId: 'income_urgency',
      responseValue: 'immediate',
      targetFactor: 'incomeUrgency',
      baseScore: 0.95,
      weight: 1.0,
      explanation: 'Immediate need for income rules out long education paths',
    },
    {
      questionId: 'income_urgency',
      responseValue: 'within_1_year',
      targetFactor: 'incomeUrgency',
      baseScore: 0.75,
      weight: 0.9,
      explanation: 'Need income within 1 year limits education duration',
    },
    {
      questionId: 'income_urgency',
      responseValue: 'within_3_years',
      targetFactor: 'incomeUrgency',
      baseScore: 0.45,
      weight: 0.8,
      explanation: '3-year horizon allows some education but not extensive',
    },
    {
      questionId: 'income_urgency',
      responseValue: 'no_urgency',
      targetFactor: 'incomeUrgency',
      baseScore: 0.10,
      weight: 0.8,
      explanation: 'No urgency allows pursuit of longer education paths',
    },
    {
      questionId: 'family_financial_dependence',
      responseValue: 'fully_dependent',
      targetFactor: 'incomeUrgency',
      baseScore: 0.90,
      weight: 0.9,
      explanation: 'Family fully dependent on student creates extreme income urgency',
    },
    {
      questionId: 'family_financial_dependence',
      responseValue: 'partially_dependent',
      targetFactor: 'incomeUrgency',
      baseScore: 0.60,
      weight: 0.8,
      explanation: 'Partial dependence creates moderate income urgency',
    },
    
    // ========================================================================
    // RISK TOLERANCE - Family's collective risk appetite
    // ========================================================================
    {
      questionId: 'family_risk_attitude',
      responseValue: 'very_conservative',
      targetFactor: 'riskTolerance',
      baseScore: 0.15,
      weight: 1.0,
      explanation: 'Very conservative family has low risk tolerance',
    },
    {
      questionId: 'family_risk_attitude',
      responseValue: 'somewhat_conservative',
      targetFactor: 'riskTolerance',
      baseScore: 0.35,
      weight: 0.9,
      explanation: 'Somewhat conservative family has below-average risk tolerance',
    },
    {
      questionId: 'family_risk_attitude',
      responseValue: 'moderate',
      targetFactor: 'riskTolerance',
      baseScore: 0.55,
      weight: 0.8,
      explanation: 'Moderate risk attitude indicates average tolerance',
    },
    {
      questionId: 'family_risk_attitude',
      responseValue: 'somewhat_risk_taking',
      targetFactor: 'riskTolerance',
      baseScore: 0.75,
      weight: 0.9,
      explanation: 'Somewhat risk-taking family has above-average tolerance',
    },
    {
      questionId: 'career_path_preference',
      responseValue: 'tried_tested',
      targetFactor: 'riskTolerance',
      baseScore: 0.25,
      weight: 0.8,
      explanation: 'Preference for tried-and-tested paths indicates low risk tolerance',
    },
    {
      questionId: 'career_path_preference',
      responseValue: 'emerging_fields',
      targetFactor: 'riskTolerance',
      baseScore: 0.75,
      weight: 0.8,
      explanation: 'Openness to emerging fields indicates higher risk tolerance',
    },
    
    // ========================================================================
    // CAREER FLEXIBILITY - Openness to non-traditional paths
    // ========================================================================
    {
      questionId: 'unconventional_career_acceptance',
      responseValue: 'very_accepting',
      targetFactor: 'careerFlexibility',
      baseScore: 0.90,
      weight: 1.0,
      explanation: 'Very accepting of unconventional careers indicates high flexibility',
    },
    {
      questionId: 'unconventional_career_acceptance',
      responseValue: 'somewhat_accepting',
      targetFactor: 'careerFlexibility',
      baseScore: 0.60,
      weight: 0.9,
      explanation: 'Somewhat accepting indicates moderate flexibility',
    },
    {
      questionId: 'unconventional_career_acceptance',
      responseValue: 'not_accepting',
      targetFactor: 'careerFlexibility',
      baseScore: 0.15,
      weight: 0.9,
      explanation: 'Not accepting unconventional careers indicates low flexibility',
    },
    {
      questionId: 'traditional_career_expectation',
      responseValue: 'strong_expectation',
      targetFactor: 'careerFlexibility',
      baseScore: 0.20,
      weight: 0.9,
      explanation: 'Strong traditional expectations severely limit flexibility',
    },
    {
      questionId: 'traditional_career_expectation',
      responseValue: 'mild_preference',
      targetFactor: 'careerFlexibility',
      baseScore: 0.55,
      weight: 0.8,
      explanation: 'Mild traditional preference allows some flexibility',
    },
    {
      questionId: 'entrepreneurship_support',
      responseValue: 'fully_supportive',
      targetFactor: 'careerFlexibility',
      baseScore: 0.85,
      weight: 0.9,
      explanation: 'Support for entrepreneurship indicates high career flexibility',
    },
    {
      questionId: 'entrepreneurship_support',
      responseValue: 'not_supportive',
      targetFactor: 'careerFlexibility',
      baseScore: 0.25,
      weight: 0.8,
      explanation: 'Lack of entrepreneurship support indicates low flexibility',
    },
  ],
  
  confidence: {
    baseConfidence: 0.70,
    evidenceMultiplier: 0.05,
    maxConfidence: 0.95,
    minEvidenceForConfidence: 2,
  },
};

// ============================================================================
// DECISION COALITION ENGINE
// ============================================================================

/**
 * Configuration for the Decision Coalition Engine.
 */
export interface DecisionCoalitionEngineConfig {
  /** Scoring configuration */
  scoringConfig: CoalitionScoringConfig;
  
  /** Whether to enable debug logging */
  debugMode: boolean;
  
  /** Minimum confidence threshold for valid model */
  minConfidenceThreshold: number;
}

/**
 * Default engine configuration.
 */
const DEFAULT_DECISION_COALITION_CONFIG: DecisionCoalitionEngineConfig = {
  scoringConfig: DEFAULT_COALITION_SCORING,
  debugMode: false,
  minConfidenceThreshold: 0.3,
};

/**
 * Result of converting assessment to coalition model.
 */
export interface CoalitionConversionResult {
  /** Success status */
  success: boolean;
  
  /** The generated coalition model (if successful) */
  coalition?: DecisionCoalition;
  
  /** Error message (if failed) */
  error?: string;
  
  /** Warnings about the conversion */
  warnings: string[];
  
  /** Statistics */
  stats: {
    questionsProcessed: number;
    evidenceItemsGenerated: number;
    factorsAssessed: number;
    averageConfidence: number;
  };
}

/**
 * Decision Coalition Engine V2
 * 
 * India-first stakeholder modeling for career decisions.
 * 
 * Usage:
 *   const engine = createDecisionCoalitionEngine();
 *   const result = engine.formCoalition(assessment);
 *   if (result.success) {
 *     console.log(result.coalition.pressures.parentWeight);
 *   }
 */
class DecisionCoalitionEngine {
  private config: DecisionCoalitionEngineConfig;
  private debugLog: string[] = [];

  constructor(config: Partial<DecisionCoalitionEngineConfig> = {}) {
    this.config = {
      ...DEFAULT_DECISION_COALITION_CONFIG,
      ...config,
      scoringConfig: {
        ...DEFAULT_COALITION_SCORING,
        ...config.scoringConfig,
      },
    };
  }

  /**
   * Form a Decision Coalition from assessment responses.
   * 
   * This is the PRIMARY METHOD of the engine.
   * 
   * @param assessment - Assessment responses with family/cultural questions
   * @returns CoalitionConversionResult containing the coalition or error
   */
  formCoalition(assessment: AssessmentResult): CoalitionConversionResult {
    this.debug('Starting coalition formation', {
      assessmentId: assessment.assessmentId,
      responseCount: assessment.responses.length,
    });

    const warnings: string[] = [];

    // Validate input
    if (assessment.responses.length === 0) {
      return {
        success: false,
        error: 'No responses provided in assessment',
        warnings: ['Empty assessment submitted'],
        stats: {
          questionsProcessed: 0,
          evidenceItemsGenerated: 0,
          factorsAssessed: 0,
          averageConfidence: 0,
        },
      };
    }

    // Initialize pressure factors
    const pressures = this.initializePressures();
    
    // Process each response to calculate pressure factors
    let totalEvidence = 0;
    for (const response of assessment.responses) {
      const evidenceCount = this.processResponse(response, pressures);
      totalEvidence += evidenceCount;
    }

    // Finalize pressure factor calculations
    this.finalizePressures(pressures);

    // Check for under-assessed factors
    const pressureKeys = Object.keys(pressures) as (keyof CoalitionPressures)[];
    for (const factor of pressureKeys) {
      if (pressures[factor].evidenceCount < this.config.scoringConfig.confidence.minEvidenceForConfidence) {
        warnings.push(`Factor "${factor}" has insufficient evidence (${pressures[factor].evidenceCount} items)`);
      }
    }

    // Calculate overall confidence
    const overallConfidence = this.calculateOverallConfidence(pressures);

    // Identify stakeholders
    const stakeholders = this.identifyStakeholders(pressures, assessment);

    // Calculate coalition dynamics
    const dynamics = this.calculateDynamics(pressures, stakeholders);

    // Generate parent report data
    const parentReportData = this.generateParentReportData(pressures, stakeholders);

    // Calculate family obligations
    const familyObligations = this.calculateFamilyObligations(pressures, assessment);

    // Create the coalition model
    const coalition: DecisionCoalition = {
      id: this.generateCoalitionId(assessment.studentId),
      studentId: assessment.studentId,
      version: 1,
      timestamp: Date.now(),
      stakeholders,
      pressures,
      dynamics,
      parentReportData,
      familyObligations,
      overallConfidence,
      evidenceCount: totalEvidence,
    };

    this.debug('Coalition formation complete', {
      coalitionId: coalition.id,
      overallConfidence,
      totalEvidence,
      stakeholderCount: stakeholders.length,
    });

    return {
      success: true,
      coalition,
      warnings,
      stats: {
        questionsProcessed: assessment.responses.length,
        evidenceItemsGenerated: totalEvidence,
        factorsAssessed: pressureKeys.length,
        averageConfidence: overallConfidence,
      },
    };
  }

  /**
   * Generate explainability text for a specific pressure factor.
   * 
   * Example: "Parent influence is high because the user indicated 
   *           major decisions are usually discussed with family."
   * 
   * @param coalition - The coalition model
   * @param factor - Which factor to explain
   * @returns Human-readable explanation
   */
  explainFactor(
    coalition: DecisionCoalition,
    factor: keyof CoalitionPressures
  ): string {
    const pressure = coalition.pressures[factor];
    
    if (pressure.evidenceCount === 0) {
      return `No assessment data available to determine ${this.formatFactorName(factor)}.`;
    }

    // Get the strongest evidence
    const strongestEvidence = pressure.evidence.sort((a, b) => 
      Math.abs(b.contribution) - Math.abs(a.contribution)
    )[0];

    // Build explanation
    const factorName = this.formatFactorName(factor);
    const valueDescription = this.describeValue(factor, pressure.value);
    
    let explanation = `${factorName} is ${valueDescription} because `;
    
    if (strongestEvidence) {
      explanation += strongestEvidence.explanation.toLowerCase();
    } else {
      explanation += `assessment responses indicate this level.`;
    }

    explanation += ` (confidence: ${Math.round(pressure.confidence * 100)}%)`;

    return explanation;
  }

  /**
   * Generate complete explainability report for all factors.
   * 
   * @param coalition - The coalition model
   * @returns Map of factor names to explanations
   */
  explainAllFactors(coalition: DecisionCoalition): Record<string, string> {
    const explanations: Record<string, string> = {};
    
    const factors: (keyof CoalitionPressures)[] = [
      'studentWeight',
      'parentWeight',
      'familyInfluence',
      'financialPressure',
      'incomeUrgency',
      'riskTolerance',
      'careerFlexibility',
    ];

    for (const factor of factors) {
      explanations[this.formatFactorName(factor)] = this.explainFactor(coalition, factor);
    }

    return explanations;
  }

  /**
   * Generate parent-facing report content.
   * 
   * Future use: Populate parent portal with understandable information.
   * 
   * @param coalition - The coalition model
   * @returns Parent report content
   */
  generateParentReport(coalition: DecisionCoalition): {
    summary: string;
    theirInfluence: string;
    studentPerspective: string;
    financialContext: string;
    conversationGuide: string[];
  } {
    const pressures = coalition.pressures;
    const dynamics = coalition.dynamics;

    // Summary
    const summary = `Based on the assessment, your child's career decision involves ` +
      `${dynamics.powerBalance.toLowerCase()}. ` +
      `Financial considerations play a ${this.describeValue('financialPressure', pressures.financialPressure.value)} role.`;

    // Their influence
    const theirInfluence = pressures.parentWeight.value > 0.6
      ? `You have significant influence (${Math.round(pressures.parentWeight.value * 100)}%) on this decision. Your guidance will be important.`
      : pressures.parentWeight.value > 0.3
      ? `You have moderate influence (${Math.round(pressures.parentWeight.value * 100)}%) on this decision. Collaboration with your child is key.`
      : `Your child is taking the lead (${Math.round(pressures.studentWeight.value * 100)}%) on this decision. Your support is still valuable.`;

    // Student perspective
    const studentPerspective = `Your child has ${pressures.studentWeight.value > 0.6 ? 'strong' : 'some'} ` +
      `autonomy in this decision (${Math.round(pressures.studentWeight.value * 100)}%). ` +
      `Consider their preferences alongside practical constraints.`;

    // Financial context
    const financialContext = pressures.financialPressure.value > 0.6
      ? `Financial factors significantly constrain options. Focus on careers with good ROI and shorter education paths.`
      : pressures.financialPressure.value > 0.3
      ? `Financial factors moderately affect choices. Balance aspirations with practical considerations.`
      : `Financial flexibility allows exploring a wider range of career options.`;

    // Conversation guide
    const conversationGuide = [
      `How much input does your child want from you?`,
      `What does "success" mean to each of you?`,
      `What traditional and emerging paths should you explore together?`,
      `When do you expect financial independence?`,
      `How much risk can the family tolerate for unconventional choices?`,
    ];

    return {
      summary,
      theirInfluence,
      studentPerspective,
      financialContext,
      conversationGuide,
    };
  }

  /**
   * Get the debug log (if debug mode is enabled).
   */
  getDebugLog(): string[] {
    return [...this.debugLog];
  }

  // ========================================================================
  // PRIVATE HELPER METHODS
  // ========================================================================

  /**
   * Initialize all pressure factors with default values.
   */
  private initializePressures(): CoalitionPressures {
    const defaultFactor = (explanation: string): PressureFactor => ({
      value: 0.5,
      confidence: 0,
      evidenceCount: 0,
      evidence: [],
      explanation,
    });

    return {
      studentWeight: defaultFactor('Student decision-making autonomy'),
      parentWeight: defaultFactor('Parental influence on decision'),
      familyInfluence: defaultFactor('Extended family cultural influence'),
      financialPressure: defaultFactor('Financial constraints on options'),
      incomeUrgency: defaultFactor('Urgency for immediate income'),
      riskTolerance: defaultFactor('Family collective risk tolerance'),
      careerFlexibility: defaultFactor('Openness to non-traditional paths'),
    };
  }

  /**
   * Process a single assessment response and update pressure factors.
   */
  private processResponse(
    response: AssessmentResponse,
    pressures: CoalitionPressures
  ): number {
    let evidenceCount = 0;

    // Find matching scoring rules
    const matchingRules = this.config.scoringConfig.rules.filter(
      rule => rule.questionId === response.questionId &&
              (rule.responseValue === response.value || 
               (Array.isArray(response.value) && 
                response.value.some(v => v === String(rule.responseValue))))
    );

    for (const rule of matchingRules) {
      const factor = pressures[rule.targetFactor];
      
      // Create evidence record
      const evidence: PressureEvidence = {
        id: `ev_${response.questionId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        questionId: response.questionId,
        response: Array.isArray(response.value) ? response.value.join(',') : String(response.value),
        contribution: rule.baseScore * rule.weight,
        explanation: rule.explanation,
        timestamp: response.timestamp,
      };

      factor.evidence.push(evidence);
      factor.evidenceCount++;
      evidenceCount++;

      this.debug('Processed evidence', {
        questionId: response.questionId,
        factor: rule.targetFactor,
        baseScore: rule.baseScore,
        weight: rule.weight,
      });
    }

    return evidenceCount;
  }

  /**
   * Calculate final pressure factor values and confidence.
   */
  private finalizePressures(pressures: CoalitionPressures): void {
    const factorKeys = Object.keys(pressures) as (keyof CoalitionPressures)[];

    for (const factorKey of factorKeys) {
      const factor = pressures[factorKey];
      
      if (factor.evidenceCount === 0) {
        factor.value = 0.5;
        factor.confidence = 0;
        continue;
      }

      // Calculate weighted average
      let weightedSum = 0;
      let totalWeight = 0;

      for (const evidence of factor.evidence) {
        weightedSum += evidence.contribution;
        totalWeight += 1; // Each evidence counts as 1 unit of weight
      }

      if (totalWeight > 0) {
        factor.value = Math.max(0, Math.min(1, weightedSum / totalWeight));
      }

      // Calculate confidence
      const { baseConfidence, evidenceMultiplier, maxConfidence, minEvidenceForConfidence } = 
        this.config.scoringConfig.confidence;
      
      const safeMinEvidence = Math.max(1, minEvidenceForConfidence);
      
      if (factor.evidenceCount >= safeMinEvidence) {
        const extraEvidence = factor.evidenceCount - safeMinEvidence;
        factor.confidence = Math.min(
          maxConfidence,
          baseConfidence + (extraEvidence * evidenceMultiplier)
        );
      } else {
        factor.confidence = baseConfidence * (factor.evidenceCount / safeMinEvidence);
      }

      factor.confidence = Math.max(0, Math.min(1, factor.confidence || 0));

      // Generate explanation
      factor.explanation = this.generateFactorExplanation(factorKey, factor);
    }
  }

  /**
   * Identify stakeholders based on pressure factors.
   */
  private identifyStakeholders(
    pressures: CoalitionPressures,
    assessment: AssessmentResult
  ): Stakeholder[] {
    const stakeholders: Stakeholder[] = [];

    // Student stakeholder
    stakeholders.push({
      id: `stakeholder_student_${assessment.studentId}`,
      type: 'STUDENT',
      name: 'Student',
      weight: pressures.studentWeight.value,
      confidence: pressures.studentWeight.confidence,
      evidence: this.mapToStakeholderEvidence(pressures.studentWeight.evidence),
    });

    // Parent stakeholders (primary)
    stakeholders.push({
      id: `stakeholder_parent_primary_${assessment.studentId}`,
      type: 'PARENT_PRIMARY',
      name: 'Parents',
      weight: pressures.parentWeight.value,
      confidence: pressures.parentWeight.confidence,
      evidence: this.mapToStakeholderEvidence(pressures.parentWeight.evidence),
      relationship: 'Parent/Guardian',
    });

    // Extended family stakeholder
    if (pressures.familyInfluence.value > 0.3) {
      stakeholders.push({
        id: `stakeholder_family_${assessment.studentId}`,
        type: 'EXTENDED_FAMILY',
        name: 'Extended Family',
        weight: pressures.familyInfluence.value,
        confidence: pressures.familyInfluence.confidence,
        evidence: this.mapToStakeholderEvidence(pressures.familyInfluence.evidence),
        relationship: 'Extended Family',
      });
    }

    return stakeholders;
  }

  /**
   * Map pressure evidence to stakeholder evidence format.
   */
  private mapToStakeholderEvidence(evidence: PressureEvidence[]): StakeholderEvidence[] {
    return evidence.map(e => ({
      id: e.id,
      questionId: e.questionId,
      response: e.response,
      impact: e.contribution > 0.5 ? 'INCREASES_WEIGHT' : 'DECREASES_WEIGHT',
      explanation: e.explanation,
      timestamp: e.timestamp,
    }));
  }

  /**
   * Calculate coalition dynamics.
   */
  private calculateDynamics(
    pressures: CoalitionPressures,
    stakeholders: Stakeholder[]
  ): CoalitionDynamics {
    const studentWeight = pressures.studentWeight.value;
    const parentWeight = pressures.parentWeight.value;

    // Determine power balance
    let powerBalance: string;
    if (studentWeight > 0.7 && parentWeight < 0.4) {
      powerBalance = 'Student-led';
    } else if (parentWeight > 0.7 && studentWeight < 0.4) {
      powerBalance = 'Parent-dominated';
    } else if (Math.abs(studentWeight - parentWeight) < 0.2) {
      powerBalance = 'Balanced collaboration';
    } else if (studentWeight > parentWeight) {
      powerBalance = 'Student-weighted collaboration';
    } else {
      powerBalance = 'Parent-weighted collaboration';
    }

    // Check balance
    const isBalanced = Math.abs(studentWeight - parentWeight) < 0.3;

    // Identify conflict areas
    const conflictAreas: string[] = [];
    if (pressures.financialPressure.value > 0.6 && pressures.careerFlexibility.value > 0.6) {
      conflictAreas.push('Financial constraints vs. creative career aspirations');
    }
    if (pressures.incomeUrgency.value > 0.6 && pressures.riskTolerance.value < 0.4) {
      conflictAreas.push('Need for immediate income vs. conservative risk approach');
    }
    if (studentWeight > 0.6 && pressures.familyInfluence.value > 0.6) {
      conflictAreas.push('Student autonomy vs. family expectations');
    }

    // Calculate stakeholder alignment
    const stakeholderAlignment = 1 - (Math.abs(studentWeight - parentWeight) / 2);

    // Determine primary decision maker
    let primaryDecisionMaker: StakeholderType = 'STUDENT';
    if (parentWeight > studentWeight && parentWeight > 0.5) {
      primaryDecisionMaker = 'PARENT_PRIMARY';
    } else if (pressures.familyInfluence.value > Math.max(studentWeight, parentWeight)) {
      primaryDecisionMaker = 'EXTENDED_FAMILY';
    }

    return {
      powerBalance,
      isBalanced,
      conflictAreas,
      stakeholderAlignment,
      primaryDecisionMaker,
    };
  }

  /**
   * Generate parent report data.
   */
  private generateParentReportData(
    pressures: CoalitionPressures,
    stakeholders: Stakeholder[]
  ): ParentReportData {
    const parentStakeholder = stakeholders.find(s => s.type === 'PARENT_PRIMARY');
    const studentStakeholder = stakeholders.find(s => s.type === 'STUDENT');

    return {
      canShowToParents: true,
      parentSummary: `Your influence on this career decision is ${this.describeValue('parentWeight', parentStakeholder?.weight || 0)}.`,
      studentPreferences: [
        `Student autonomy level: ${this.describeValue('studentWeight', studentStakeholder?.weight || 0)}`,
        `Risk tolerance: ${this.describeValue('riskTolerance', pressures.riskTolerance.value)}`,
        `Career flexibility desired: ${this.describeValue('careerFlexibility', pressures.careerFlexibility.value)}`,
      ],
      familyConstraints: [
        `Financial pressure: ${this.describeValue('financialPressure', pressures.financialPressure.value)}`,
        `Income urgency: ${this.describeValue('incomeUrgency', pressures.incomeUrgency.value)}`,
        `Family influence: ${this.describeValue('familyInfluence', pressures.familyInfluence.value)}`,
      ],
      financialConsiderations: pressures.financialPressure.value > 0.5
        ? [
            'Education costs are a significant factor',
            'Consider careers with shorter training periods',
            'Look for scholarship and financial aid opportunities',
          ]
        : [
            'Financial flexibility allows broader exploration',
            'Consider long-term ROI alongside immediate costs',
          ],
      conversationStarters: [
        'What does your child want from their career?',
        'What are your main concerns about their future?',
        'How can you support them while respecting their autonomy?',
        'What financial boundaries need to be discussed?',
      ],
    };
  }

  /**
   * Calculate family obligations for future use.
   */
  private calculateFamilyObligations(
    pressures: CoalitionPressures,
    assessment: AssessmentResult
  ): CoalitionFamilyObligation[] {
    const obligations: CoalitionFamilyObligation[] = [];

    // Financial support obligation
    if (pressures.incomeUrgency.value > 0.6) {
      obligations.push({
        type: 'FINANCIAL_SUPPORT',
        description: 'Family needs financial support from student',
        timeline: pressures.incomeUrgency.value > 0.8 ? 'IMMEDIATE' : 'SHORT_TERM',
        flexibility: pressures.financialPressure.value > 0.7 ? 'FIXED' : 'NEGOTIABLE',
      });
    }

    // Status maintenance obligation
    if (pressures.familyInfluence.value > 0.6) {
      obligations.push({
        type: 'STATUS_MAINTENANCE',
        description: 'Career choice affects family social standing',
        timeline: 'LONG_TERM',
        flexibility: 'NEGOTIABLE',
      });
    }

    return obligations;
  }

  /**
   * Calculate overall confidence across all pressure factors.
   */
  private calculateOverallConfidence(pressures: CoalitionPressures): ConfidenceScore {
    const factorKeys = Object.keys(pressures) as (keyof CoalitionPressures)[];
    const confidences = factorKeys.map(key => pressures[key].confidence);
    const validConfidences = confidences.filter(c => typeof c === 'number' && !isNaN(c));
    if (validConfidences.length === 0) return 0;
    return validConfidences.reduce((a, b) => a + b, 0) / validConfidences.length;
  }

  /**
   * Generate explanation for a pressure factor.
   */
  private generateFactorExplanation(
    factorKey: keyof CoalitionPressures,
    factor: PressureFactor
  ): string {
    const valueDescription = this.describeValue(factorKey, factor.value);
    return `${this.formatFactorName(factorKey)} is ${valueDescription} based on ${factor.evidenceCount} assessment responses.`;
  }

  /**
   * Format factor name for display.
   */
  private formatFactorName(factor: keyof CoalitionPressures): string {
    const names: Record<keyof CoalitionPressures, string> = {
      studentWeight: 'Student Decision Weight',
      parentWeight: 'Parent Influence',
      familyInfluence: 'Extended Family Influence',
      financialPressure: 'Financial Pressure',
      incomeUrgency: 'Income Urgency',
      riskTolerance: 'Risk Tolerance',
      careerFlexibility: 'Career Path Flexibility',
    };
    return names[factor];
  }

  /**
   * Describe a value in human terms.
   */
  private describeValue(factor: string, value: number): string {
    if (value >= 0.8) return 'very high';
    if (value >= 0.6) return 'high';
    if (value >= 0.4) return 'moderate';
    if (value >= 0.2) return 'low';
    return 'very low';
  }

  /**
   * Generate unique coalition identifier.
   */
  private generateCoalitionId(studentId: EntityId): EntityId {
    return `coalition_${studentId}_${Date.now()}`;
  }

  /**
   * Log debug message if debug mode is enabled.
   */
  private debug(message: string, data?: Record<string, unknown>): void {
    if (this.config.debugMode) {
      this.debugLog.push(JSON.stringify({ message, data, timestamp: Date.now() }));
    }
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a new Decision Coalition Engine with the specified configuration.
 * 
 * @param config - Partial configuration to override defaults
 * @returns Configured DecisionCoalitionEngine instance
 * 
 * @example
 * ```typescript
 * const engine = createDecisionCoalitionEngine({
 *   debugMode: true,
 * });
 * ```
 */
export function createDecisionCoalitionEngine(
  config?: Partial<DecisionCoalitionEngineConfig>
): DecisionCoalitionEngine {
  return new DecisionCoalitionEngine(config);
}

/**
 * Convenience function to form a coalition in one call.
 * 
 * @param assessment - Assessment result to convert
 * @param config - Optional engine configuration
 * @returns Coalition conversion result
 * 
 * @example
 * ```typescript
 * const result = formDecisionCoalition(assessment);
 * if (result.success) {
 *   console.log(result.coalition.pressures.parentWeight);
 * }
 * ```
 */
export function formDecisionCoalition(
  assessment: AssessmentResult,
  config?: Partial<DecisionCoalitionEngineConfig>
): CoalitionConversionResult {
  const engine = createDecisionCoalitionEngine(config);
  return engine.formCoalition(assessment);
}

/**
 * Create empty assessment result for testing.
 */
export function createEmptyCoalitionAssessment(studentId: EntityId): AssessmentResult {
  return {
    assessmentId: `coalition_assessment_${Date.now()}`,
    studentId,
    responses: [],
    startedAt: Date.now(),
    completedAt: Date.now(),
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  DecisionCoalitionEngine,
  DEFAULT_DECISION_COALITION_CONFIG,
  DEFAULT_COALITION_SCORING,
};
