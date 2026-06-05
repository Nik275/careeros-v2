/**
 * EducationalReality Domain
 *
 * CareerOS Intelligence - Reality Layer V3
 *
 * Purpose:
 *   Capture the student's academic background, achievements,
 *   and educational opportunities relevant to career decisions.
 *
 * India-First Design:
 *   - Board exam performance (CBSE, ICSE, State Boards)
 *   - Competitive exam scores (JEE, NEET, CAT, etc.)
 *   - Institution tiers (IIT, NIT, Tier-1/2/3 colleges)
 *   - Academic streams (Science, Commerce, Arts, Diploma)
 *
 * Key Concepts:
 *   - AcademicBackground: Previous education history
 *   - AcademicPerformance: Grades, percentiles, achievements
 *   - CompetitiveExam: Entrance exam results and prospects
 *   - InstitutionStanding: Quality of current/aimed institution
 *   - LearningProfile: How student learns best
 */

import type { EntityId, ConfidenceScore, BeliefTimestamp, Evidence } from './index';

// ============================================================================
// ACADEMIC BACKGROUND
// ============================================================================

/**
 * Academic streams in India.
 */
export type AcademicStream =
  | 'SCIENCE_PCM'     // Physics, Chemistry, Math
  | 'SCIENCE_PCB'     // Physics, Chemistry, Biology
  | 'SCIENCE_PCMB'    // All four sciences
  | 'COMMERCE'        // Commerce with/without math
  | 'ARTS_HUMANITIES' // Arts/Humanities
  | 'DIPLOMA'         // Polytechnic diploma
  | 'VOCATIONAL'      // Vocational courses
  | 'GENERAL';        // General/other

/**
 * Education board types.
 */
export type EducationBoard =
  | 'CBSE'
  | 'ICSE'
  | 'STATE_BOARD'
  | 'IB'
  | 'NIOS'
  | 'OTHER';

/**
 * Institution tier (quality classification).
 */
export type InstitutionTier =
  | 'IIT'           // IITs
  | 'NIT_IIIT'      // NITs, IIITs, BITS
  | 'TIER_1'        // Top private/central universities
  | 'TIER_2'        // Good state/private colleges
  | 'TIER_3'        // Average colleges
  | 'LOCAL'         // Local/regional colleges
  | 'UNKNOWN';      // Not yet known

/**
 * Academic background and history.
 */
export interface AcademicBackground {
  /** Unique identifier */
  id: EntityId;

  /** Current/previous academic stream */
  stream: AcademicStream;

  /** Education board */
  board: EducationBoard;

  /** Current education level */
  currentLevel: 'HIGH_SCHOOL' | 'HIGHER_SECONDARY' | 'UNDERGRADUATE' | 'POSTGRADUATE' | 'WORKING';

  /** Year of study (if applicable) */
  currentYear?: number;

  /** Institution name */
  institutionName?: string;

  /** Institution tier (if known) */
  institutionTier?: InstitutionTier;

  /** Years of education completed */
  yearsCompleted: number;

  /** Evidence supporting this background */
  evidence: Evidence[];

  /** Confidence in this assessment */
  confidence: ConfidenceScore;

  /** When this was assessed */
  assessedAt: BeliefTimestamp;
}

// ============================================================================
// ACADEMIC PERFORMANCE
// ============================================================================

/**
 * Academic performance metrics.
 */
export interface AcademicPerformance {
  /** Unique identifier */
  id: EntityId;

  /** Overall academic standing */
  overallStanding: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'BELOW_AVERAGE' | 'POOR';

  /** Class 10th percentage/CGPA */
  class10Score?: number;

  /** Class 12th percentage/CGPA */
  class12Score?: number;

  /** Current CGPA (if in college) */
  currentCGPA?: number;

  /** Academic percentile in peer group */
  percentile?: number;

  /** Key subjects and performance in each */
  subjectPerformance: SubjectPerformance[];

  /** Any academic achievements/awards */
  achievements: AcademicAchievement[];

  /** Evidence supporting this performance assessment */
  evidence: Evidence[];

  /** Confidence in this assessment */
  confidence: ConfidenceScore;

  /** When this was assessed */
  assessedAt: BeliefTimestamp;
}

/**
 * Performance in a specific subject.
 */
export interface SubjectPerformance {
  /** Subject name */
  subject: string;

  /** Score/grade */
  score: number;

  /** Relative strength in this subject */
  strength: 'STRONG' | 'MODERATE' | 'WEAK';

  /** Relevance to career interests */
  careerRelevance: 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * Academic achievement or award.
 */
export interface AcademicAchievement {
  /** Achievement name */
  name: string;

  /** Description */
  description: string;

  /** When achieved */
  year?: number;

  /** Level of achievement */
  level: 'SCHOOL' | 'DISTRICT' | 'STATE' | 'NATIONAL' | 'INTERNATIONAL';
}

// ============================================================================
// COMPETITIVE EXAMS
// ============================================================================

/**
 * Major competitive exams in India.
 */
export type CompetitiveExamType =
  | 'JEE_MAIN'
  | 'JEE_ADVANCED'
  | 'NEET'
  | 'CAT'
  | 'CLAT'
  | 'NIFT_NID'
  | 'UPSC'
  | 'SSC'
  | 'BANKING'
  | 'GATE'
  | 'GRE'
  | 'GMAT'
  | 'OTHER';

/**
 * Exam status.
 */
export type ExamStatus =
  | 'NOT_TAKEN'
  | 'PREPARING'
  | 'TAKEN_WAITING'
  | 'RESULT_DECLARED'
  | 'MULTIPLE_ATTEMPTS';

/**
 * Competitive exam result/prospects.
 */
export interface CompetitiveExam {
  /** Unique identifier */
  id: EntityId;

  /** Exam type */
  examType: CompetitiveExamType;

  /** Current status */
  status: ExamStatus;

  /** Exam year */
  year?: number;

  /** Score/rank if declared */
  score?: number;

  /** Percentile if declared */
  percentile?: number;

  /** Rank if declared */
  rank?: number;

  /** Category rank (if applicable) */
  categoryRank?: number;

  /** Qualifying status */
  isQualified?: boolean;

  /** Expected colleges based on score */
  expectedInstitutions?: string[];

  /** Institution tier reachable with this score */
  reachableTier?: InstitutionTier;

  /** Evidence supporting this exam assessment */
  evidence: Evidence[];

  /** Confidence in this assessment */
  confidence: ConfidenceScore;

  /** When this was assessed */
  assessedAt: BeliefTimestamp;
}

// ============================================================================
// INSTITUTION STANDING
// ============================================================================

/**
 * Institution standing and reputation.
 */
export interface InstitutionStanding {
  /** Unique identifier */
  id: EntityId;

  /** Institution tier */
  tier: InstitutionTier;

  /** Institution name */
  name?: string;

  /** NAAC accreditation grade */
  naacGrade?: 'A++' | 'A+' | 'A' | 'B++' | 'B+' | 'B' | 'C' | 'UNACCREDITED';

  /** NIRF ranking (if applicable) */
  nirfRanking?: number;

  /** Placement record quality */
  placementQuality: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR' | 'UNKNOWN';

  /** Average package offered */
  averagePackage?: number;

  /** Top recruiting companies */
  topRecruiters?: string[];

  /** Evidence supporting this standing assessment */
  evidence: Evidence[];

  /** Confidence in this assessment */
  confidence: ConfidenceScore;

  /** When this was assessed */
  assessedAt: BeliefTimestamp;
}

// ============================================================================
// LEARNING PROFILE
// ============================================================================

/**
 * Learning style preferences.
 */
export type LearningStyle =
  | 'VISUAL'
  | 'AUDITORY'
  | 'READING_WRITING'
  | 'KINESTHETIC'
  | 'MULTIMODAL';

/**
 * Preferred learning environment.
 */
export type LearningEnvironment =
  | 'STRUCTURED_CLASSROOM'
  | 'SELF_PACED_ONLINE'
  | 'PROJECT_BASED'
  | 'MENTORSHIP_BASED'
  | 'PEER_LEARNING';

/**
 * Learning profile - how student learns best.
 */
export interface LearningProfile {
  /** Unique identifier */
  id: EntityId;

  /** Primary learning style */
  primaryStyle: LearningStyle;

  /** Secondary learning styles */
  secondaryStyles: LearningStyle[];

  /** Preferred environment */
  preferredEnvironment: LearningEnvironment;

  /** Study hours per week capacity */
  studyHoursPerWeek: number;

  /** Best time of day for learning */
  peakLearningTime: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';

  /** Attention span (minutes) */
  attentionSpanMinutes: number;

  /** Need for breaks frequency */
  breakFrequency: 'FREQUENT' | 'MODERATE' | 'RARE';

  /** Self-discipline level */
  selfDiscipline: 'HIGH' | 'MODERATE' | 'LOW';

  /** Evidence supporting this profile */
  evidence: Evidence[];

  /** Confidence in this assessment */
  confidence: ConfidenceScore;

  /** When this was assessed */
  assessedAt: BeliefTimestamp;
}

// ============================================================================
// EDUCATIONAL OPPORTUNITIES
// ============================================================================

/**
 * Available educational opportunities.
 */
export interface EducationalOpportunity {
  /** Unique identifier */
  id: EntityId;

  /** Opportunity type */
  type: 'DEGREE_PROGRAM' | 'CERTIFICATION' | 'ONLINE_COURSE' | 'WORKSHOP' | 'INTERNSHIP';

  /** Name of opportunity */
  name: string;

  /** Institution/provider */
  provider: string;

  /** Duration */
  duration: string;

  /** Cost in INR */
  cost: number;

  /** Relevance to career goals */
  relevance: 'HIGH' | 'MEDIUM' | 'LOW';

  /** Whether student is eligible */
  isEligible: boolean;

  /** Application deadline if applicable */
  deadline?: BeliefTimestamp;
}

// ============================================================================
// EDUCATIONAL REALITY AGGREGATE
// ============================================================================

/**
 * EducationalReality captures the complete academic context for career decisions.
 *
 * This is part of StudentBelief V3 - Reality Layer.
 */
export interface EducationalReality {
  /** Unique identifier */
  id: EntityId;

  /** Academic background */
  background: AcademicBackground;

  /** Academic performance */
  performance: AcademicPerformance;

  /** Competitive exams taken/being prepared */
  competitiveExams: CompetitiveExam[];

  /** Institution standing (current or expected) */
  institutionStanding?: InstitutionStanding;

  /** Learning profile */
  learningProfile: LearningProfile;

  /** Available opportunities */
  opportunities: EducationalOpportunity[];

  /** Overall academic potential (0.0 - 1.0) */
  overallPotential: ConfidenceScore;

  /** Academic barriers to career goals */
  barriers: string[];

  /** Whether academics is a major decision factor */
  isMajorFactor: boolean;

  /** Evidence supporting this reality assessment */
  evidence: Evidence[];

  /** Confidence in overall educational reality */
  confidence: ConfidenceScore;

  /** When this reality was assessed */
  assessedAt: BeliefTimestamp;
}
