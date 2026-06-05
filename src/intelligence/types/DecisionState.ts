/**
 * DecisionState Domain
 *
 * CareerOS Intelligence - Decision Context Layer V3
 *
 * Purpose:
 *   Capture the student's current decision context, timeline,
 *   pressure level, and readiness for making career decisions.
 *
 * India-First Design:
 *   - Admission cycle awareness
 *   - Multiple exam result timelines
 *   - Counseling dates and deadlines
 *   - Societal pressure factors
 *
 * Key Concepts:
 *   - DecisionTimeline: Urgency and available time
 *   - DecisionPressure: External and internal pressure factors
 *   - InformationStatus: What student knows vs needs to know
 *   - ReadinessLevel: Preparedness for decision-making
 *   - DecisionContext: Current life situation
 */

import type { EntityId, ConfidenceScore, BeliefTimestamp, Evidence } from './index';

// ============================================================================
// DECISION TIMELINE
// ============================================================================

/**
 * Decision urgency levels.
 */
export type DecisionUrgency =
  | 'IMMEDIATE'      // Days to decide
  | 'SHORT_TERM'     // Weeks to decide
  | 'MEDIUM_TERM'    // Months to decide
  | 'LONG_TERM'      // Year or more
  | 'EXPLORATORY';   // Just exploring, no immediate decision needed

/**
 * Key deadline or milestone.
 */
export interface DecisionDeadline {
  /** Unique identifier */
  id: EntityId;

  /** Name of deadline/milestone */
  name: string;

  /** Description */
  description: string;

  /** Deadline timestamp */
  deadline: BeliefTimestamp;

  /** Type of deadline */
  type: 'EXAM_DATE' | 'RESULT_DATE' | 'APPLICATION_DEADLINE' | 'COUNSELING_DATE' | 'OTHER';

  /** Consequence of missing deadline */
  consequence: string;

  /** Whether deadline is flexible */
  isFlexible: boolean;

  /** Days remaining until deadline */
  daysRemaining: number;
}

/**
 * Timeline for career decision.
 */
export interface DecisionTimeline {
  /** Unique identifier */
  id: EntityId;

  /** Urgency level */
  urgency: DecisionUrgency;

  /** Key upcoming deadlines */
  deadlines: DecisionDeadline[];

  /** Days until next critical decision */
  daysToNextDecision: number;

  /** Days until final decision needed */
  daysToFinalDecision?: number;

  /** Current phase in decision process */
  currentPhase: 'EXPLORATION' | 'RESEARCH' | 'EVALUATION' | 'DECISION' | 'COMMITMENT';

  /** Time available for further exploration (days) */
  explorationTimeAvailable: number;

  /** Evidence supporting this timeline assessment */
  evidence: Evidence[];

  /** Confidence in this assessment */
  confidence: ConfidenceScore;

  /** When this was assessed */
  assessedAt: BeliefTimestamp;
}

// ============================================================================
// DECISION PRESSURE
// ============================================================================

/**
 * Types of decision pressure.
 */
export type PressureSource =
  | 'FAMILY'           // Family expectations and pressure
  | 'PEERS'            // Peer comparison and competition
  | 'SOCIETAL'         // Societal norms and expectations
  | 'AGE'              // Age-related pressure
  | 'FINANCIAL'        // Financial constraints and pressure
  | 'TIME'             // Time running out
  | 'EXAM_RESULTS'     // Pending or received exam results
  | 'INSTITUTION_DEADLINE' // College/institution deadlines
  | 'SELF_IMPOSED';    // Student's own high standards

/**
 * Pressure factor affecting decision in DecisionState.
 */
export interface DecisionPressureFactor {
  /** Unique identifier */
  id: EntityId;

  /** Source of pressure */
  source: PressureSource;

  /** Description of pressure */
  description: string;

  /** Pressure intensity (0.0 - 1.0) */
  intensity: ConfidenceScore;

  /** Whether pressure is external or internal */
  isExternal: boolean;

  /** Whether pressure is helping or hindering decision */
  impact: 'HELPFUL' | 'NEUTRAL' | 'HINDERING';

  /** Can the pressure be mitigated */
  isMitigable: boolean;

  /** Evidence supporting this pressure assessment */
  evidence: Evidence[];
}

/**
 * Decision pressure context.
 */
export interface DecisionPressure {
  /** Unique identifier */
  id: EntityId;

  /** Individual pressure factors */
  factors: DecisionPressureFactor[];

  /** Overall pressure level (0.0 - 1.0) */
  overallPressure: ConfidenceScore;

  /** Whether pressure is at unhealthy levels */
  isUnhealthy: boolean;

  /** Primary pressure source */
  primarySource?: PressureSource;

  /** Stress level reported by student (0.0 - 1.0) */
  reportedStressLevel?: ConfidenceScore;

  /** Evidence supporting this pressure assessment */
  evidence: Evidence[];

  /** Confidence in this assessment */
  confidence: ConfidenceScore;

  /** When this was assessed */
  assessedAt: BeliefTimestamp;
}

// ============================================================================
// INFORMATION STATUS
// ============================================================================

/**
 * Information category.
 */
export type InformationCategory =
  | 'CAREER_OPTIONS'
  | 'EDUCATION_PATHS'
  | 'MARKET_TRENDS'
  | 'SALARY_EXPECTATIONS'
  | 'SKILL_REQUIREMENTS'
  | 'INSTITUTION_DETAILS'
  | 'ENTRANCE_EXAMS'
  | 'FINANCIAL_AID'
  | 'GEOGRAPHIC_OPTIONS';

/**
 * Information need.
 */
export interface InformationNeed {
  /** Unique identifier */
  id: EntityId;

  /** Category of information */
  category: InformationCategory;

  /** Specific information needed */
  description: string;

  /** Priority level */
  priority: 'HIGH' | 'MEDIUM' | 'LOW';

  /** Whether information is critical for decision */
  isCritical: boolean;

  /** How difficult is it to obtain this information */
  difficultyToObtain: 'EASY' | 'MODERATE' | 'DIFFICULT';
}

/**
 * Information status for decision-making.
 */
export interface InformationStatus {
  /** Unique identifier */
  id: EntityId;

  /** Information needs */
  needs: InformationNeed[];

  /** Information gaps count */
  gapsCount: number;

  /** Critical gaps count */
  criticalGapsCount: number;

  /** Information sufficiency score (0.0 - 1.0) */
  sufficiencyScore: ConfidenceScore;

  /** Has student researched options adequately */
  hasAdequateResearch: boolean;

  /** Sources of information used */
  sourcesUsed: string[];

  /** Evidence supporting this status assessment */
  evidence: Evidence[];

  /** Confidence in this assessment */
  confidence: ConfidenceScore;

  /** When this was assessed */
  assessedAt: BeliefTimestamp;
}

// ============================================================================
// READINESS LEVEL
// ============================================================================

/**
 * Aspects of decision readiness.
 */
export type ReadinessAspect =
  | 'SELF_AWARENESS'
  | 'OPTION_KNOWLEDGE'
  | 'DECISION_SKILLS'
  | 'EMOTIONAL_PREPAREDNESS'
  | 'FINANCIAL_PREPAREDNESS'
  | 'FAMILY_ALIGNMENT';

/**
 * Readiness level for a specific aspect.
 */
export interface ReadinessComponent {
  /** Aspect of readiness */
  aspect: ReadinessAspect;

  /** Readiness level (0.0 - 1.0) */
  level: ConfidenceScore;

  /** Description */
  description: string;

  /** Areas needing improvement */
  improvementAreas: string[];
}

/**
 * Decision readiness assessment.
 */
export interface DecisionReadiness {
  /** Unique identifier */
  id: EntityId;

  /** Readiness components */
  components: ReadinessComponent[];

  /** Overall readiness score (0.0 - 1.0) */
  overallReadiness: ConfidenceScore;

  /** Readiness category */
  category: 'READY' | 'NEARLY_READY' | 'NEEDS_PREP' | 'NOT_READY';

  /** Can student make a good decision now */
  canDecideNow: boolean;

  /** What would improve readiness */
  recommendedPreparation: string[];

  /** Evidence supporting this readiness assessment */
  evidence: Evidence[];

  /** Confidence in this assessment */
  confidence: ConfidenceScore;

  /** When this was assessed */
  assessedAt: BeliefTimestamp;
}

// ============================================================================
// DECISION CONTEXT
// ============================================================================

/**
 * Current life situation affecting decisions.
 */
export type LifeSituation =
  | 'IN_SCHOOL'
  | 'GAP_YEAR'
  | 'PREPARING_FOR_EXAMS'
  | 'IN_COLLEGE'
  | 'WORKING_PROFESSIONAL'
  | 'WORKING_AND_STUDYING'
  | 'UNEMPLOYED_SEEKING'
  | 'CAREER_CHANGE';

/**
 * Current emotional state in decision context.
 */
export type DecisionEmotionalState =
  | 'OPTIMISTIC'
  | 'ANXIOUS'
  | 'CONFUSED'
  | 'OVERWHELMED'
  | 'CONFIDENT'
  | 'UNCERTAIN'
  | 'PRESSURED'
  | 'EXCITED';

/**
 * Decision context - current life situation.
 */
export interface DecisionContext {
  /** Unique identifier */
  id: EntityId;

  /** Current life situation */
  lifeSituation: LifeSituation;

  /** Current emotional state */
  emotionalState: DecisionEmotionalState;

  /** Major life changes occurring */
  lifeChanges: string[];

  /** Support system availability */
  supportSystemAvailable: boolean;

  /** Decision-making capacity (affected by stress/health) */
  decisionCapacity: 'FULL' | 'REDUCED' | 'LIMITED';

  /** Is this a good time to make major decisions */
  isGoodTiming: boolean;

  /** Evidence supporting this context assessment */
  evidence: Evidence[];

  /** Confidence in this assessment */
  confidence: ConfidenceScore;

  /** When this was assessed */
  assessedAt: BeliefTimestamp;
}

// ============================================================================
// DECISION STATE AGGREGATE
// ============================================================================

/**
 * DecisionState captures the complete decision-making context.
 *
 * This is part of StudentBelief V3 - Decision Context Layer.
 */
export interface DecisionState {
  /** Unique identifier */
  id: EntityId;

  /** Decision timeline */
  timeline: DecisionTimeline;

  /** Decision pressure factors */
  pressure: DecisionPressure;

  /** Information status */
  information: InformationStatus;

  /** Decision readiness */
  readiness: DecisionReadiness;

  /** Decision context */
  context: DecisionContext;

  /** Active decision to be made */
  activeDecision?: string;

  /** Alternatives being considered */
  alternativesConsidered: string[];

  /** Whether student is stuck/decision paralysis */
  isStuck: boolean;

  /** Recommended intervention (if any) */
  recommendedIntervention?: string;

  /** Evidence supporting this state assessment */
  evidence: Evidence[];

  /** Confidence in overall decision state */
  confidence: ConfidenceScore;

  /** When this state was assessed */
  assessedAt: BeliefTimestamp;
}
