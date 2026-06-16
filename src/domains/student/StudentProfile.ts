/**
 * StudentProfile Domain Model
 *
 * CareerOS - Career Intelligence System
 *
 * Complete representation of a student's career-relevant profile.
 * Designed for scalability, strong typing, and future-proofing.
 *
 * Architecture Principles:
 *   - Normalized scores (0.0 - 1.0) for all dimensions
 *   - Immutable domain objects
 *   - Comprehensive India-specific context
 *   - Builder pattern for construction
 *   - Full type safety with no implicit any
 *
 * Profile Sections:
 *   - Psychology: 8 cognitive and personality traits
 *   - Motivations: 5 career drivers
 *   - Reality Constraints: 5 contextual factors (India-specific)
 *   - Academic: Performance and aptitude
 *   - Decision Context: Readiness and urgency
 */

// ============================================================================
// CORE PRIMITIVE TYPES
// ============================================================================

/**
 * Normalized score representing a dimension of student profile.
 * Range: 0.0 (low/absent) to 1.0 (high/present)
 *
 * Used for:
 *   - Psychological trait levels
 *   - Motivation strengths
 *   - Academic performance
 *   - Constraint severities
 */
export type ProfileScore = number;

/**
 * Unique identifier for a student profile.
 * Format: UUID v4
 */
export type StudentProfileId = string;

/**
 * Student identifier (external reference).
 * Can be user ID, anonymous session ID, etc.
 */
export type StudentId = string;

/**
 * Timestamp in milliseconds since epoch.
 */
export type Timestamp = number;

// ============================================================================
// ENUMERATIONS
// ============================================================================

/**
 * Student's current educational stage.
 */
export enum EducationStage {
  HIGH_SCHOOL_9_10 = 'high_school_9_10',
  HIGH_SCHOOL_11_12 = 'high_school_11_12',
  UNDERGRADUATE = 'undergraduate',
  POSTGRADUATE = 'postgraduate',
  WORKING_PROFESSIONAL = 'working_professional',
  CAREER_CHANGER = 'career_changer',
}

/**
 * Academic stream/board in Indian education system.
 */
export enum AcademicStream {
  SCIENCE = 'science',
  COMMERCE = 'commerce',
  ARTS = 'arts',
  DIPLOMA = 'diploma',
  VOCATIONAL = 'vocational',
  OPEN_SCHOOLING = 'open_schooling',
  INTERNATIONAL = 'international',
}

/**
 * Education board types in India.
 */
export enum EducationBoard {
  CBSE = 'cbse',
  ICSE = 'icse',
  STATE_BOARD = 'state_board',
  IB = 'ib',
  IGCSE = 'igcse',
  NIOS = 'nios',
}

/**
 * Location type for India context.
 */
export enum LocationType {
  METRO_TIER_1 = 'metro_tier_1',     // Delhi, Mumbai, Bangalore, etc.
  TIER_2_CITY = 'tier_2_city',       // Pune, Jaipur, Lucknow, etc.
  TIER_3_TOWN = 'tier_3_town',       // Smaller cities
  RURAL = 'rural',                   // Villages, small towns
}

/**
 * Language comfort levels.
 */
export enum LanguageComfort {
  NATIVE_ONLY = 'native_only',               // Regional language only
  NATIVE_AND_HINDI = 'native_and_hindi',     // Regional + Hindi
  BASIC_ENGLISH = 'basic_english',           // Can understand, limited expression
  FUNCTIONAL_ENGLISH = 'functional_english', // Can work with English
  FLUENT_ENGLISH = 'fluent_english',         // Full professional proficiency
}

/**
 * Coaching access levels.
 */
export enum CoachingAccess {
  NONE = 'none',                             // No coaching available/affordable
  LIMITED = 'limited',                       // Some access (online, local)
  MODERATE = 'moderate',                     // Regular coaching
  EXTENSIVE = 'extensive',                   // Premium coaching (FIITJEE, Allen, etc.)
}

/**
 * Family income brackets (annual, INR).
 */
export enum FamilyIncomeBracket {
  BELOW_3_LPA = 'below_3_lpa',               // < ₹3 Lakhs
  BETWEEN_3_6_LPA = 'between_3_6_lpa',       // ₹3-6 Lakhs
  BETWEEN_6_12_LPA = 'between_6_12_lpa',     // ₹6-12 Lakhs
  BETWEEN_12_25_LPA = 'between_12_25_lpa',   // ₹12-25 Lakhs
  ABOVE_25_LPA = 'above_25_lpa',             // > ₹25 Lakhs
}

/**
 * Family pressure intensity.
 */
export enum FamilyPressure {
  NONE = 'none',                             // Complete autonomy
  MILD = 'mild',                             // Suggestions, no pressure
  MODERATE = 'moderate',                     // Active discussion, some pressure
  SIGNIFICANT = 'significant',               // Strong expectations
  EXTREME = 'extreme',                       // Career choice dictated by family
}

/**
 * Decision urgency levels.
 */
export enum DecisionUrgency {
  EXPLORING = 'exploring',                   // Just looking, no immediate need
  PLANNING = 'planning',                     // Planning 1-2 years ahead
  UPCOMING = 'upcoming',                     // Decision within 6 months
  IMMEDIATE = 'immediate',                   // Decision within 1 month
  CRITICAL = 'critical',                     // Overdue, immediate action needed
}

/**
 * Exploration stages in career decision journey.
 */
export enum ExplorationStage {
  UNAWARE = 'unaware',                       // No career thinking yet
  AWARE = 'aware',                           // Knows career choice matters
  EXPLORING = 'exploring',                   // Actively learning about options
  NARROWING = 'narrowing',                   // Shortlisting specific careers
  DECIDING = 'deciding',                     // Comparing final options
  COMMITTED = 'committed',                   // Decision made, executing
}

/**
 * Confidence levels in career decision.
 */
export enum DecisionConfidence {
  VERY_UNCERTAIN = 'very_uncertain',         // No idea what to do
  UNCERTAIN = 'uncertain',                   // Some ideas but unsure
  SOMEWHAT_CONFIDENT = 'somewhat_confident', // Leaning toward options
  CONFIDENT = 'confident',                   // Clear direction
  VERY_CONFIDENT = 'very_confident',         // Firm decision made
}

/**
 * Academic grade scales.
 */
export enum GradeScale {
  PERCENTAGE = 'percentage',                 // 0-100%
  CGPA_10 = 'cgpa_10',                       // 0-10 scale
  CGPA_4 = 'cgpa_4',                         // 0-4 scale (GPA)
  LETTER_GRADES = 'letter_grades',           // A-F
}

/**
 * Competitive exam types relevant for India.
 */
export enum CompetitiveExamType {
  // Engineering
  JEE_MAIN = 'jee_main',
  JEE_ADVANCED = 'jee_advanced',
  BITSAT = 'bitsat',
  VITEEE = 'viteee',
  SRMJEEE = 'srmjeee',

  // Medical
  NEET = 'neet',
  AIIMS = 'aiims',

  // Other Professional
  CLAT = 'clat',
  NIFT = 'nift',
  NATA = 'nata',

  // Management
  CAT = 'cat',
  XAT = 'xat',
  MAT = 'mat',

  // Civil Services
  UPSC_CSE = 'upsc_cse',
  UPSC_CDS = 'upsc_cds',
  STATE_PSC = 'state_psc',

  // Banking/SSC
  IBPS_PO = 'ibps_po',
  SBI_PO = 'sbi_po',
  SSC_CGL = 'ssc_cgl',

  // International
  SAT = 'sat',
  ACT = 'act',
  GRE = 'gre',
  GMAT = 'gmat',
}

// ============================================================================
// PSYCHOLOGY PROFILE
// ============================================================================

/**
 * Psychological traits relevant to career matching.
 *
 * All scores 0.0 - 1.0:
 *   0.0 = Trait is not present/developed
 *   0.5 = Moderate presence
 *   1.0 = Very strong trait
 */
export interface PsychologyProfile {
  /** Analytical thinking: logical reasoning, problem decomposition */
  analyticalThinking: ProfileScore;

  /** Creativity: original thinking, innovation, artistic expression */
  creativity: ProfileScore;

  /** Social orientation: interpersonal interaction, empathy, communication */
  socialOrientation: ProfileScore;

  /** Leadership: influence, decision-making, team direction */
  leadership: ProfileScore;

  /** Detail orientation: precision, thoroughness, error detection */
  detailOrientation: ProfileScore;

  /** Curiosity: continuous learning, exploration, questioning */
  curiosity: ProfileScore;

  /** Competitiveness: drive to outperform, achievement orientation */
  competitiveness: ProfileScore;

  /** Risk tolerance: comfort with uncertainty, taking calculated risks */
  riskTolerance: ProfileScore;
}

// ============================================================================
// MOTIVATIONS
// ============================================================================

/**
 * Career motivations - what drives the student's career decisions.
 *
 * All scores 0.0 - 1.0 indicating importance to the student.
 */
export interface Motivations {
  /** Money: Income potential and financial success */
  money: ProfileScore;

  /** Impact: Making a difference, helping others, societal contribution */
  impact: ProfileScore;

  /** Status: Social prestige, recognition, respect */
  status: ProfileScore;

  /** Freedom: Autonomy, flexibility, independence */
  freedom: ProfileScore;

  /** Stability: Job security, predictable income, low risk */
  stability: ProfileScore;
}

/**
 * Primary motivation - the top driver.
 * Derived from Motivations but explicitly tracked.
 */
export type PrimaryMotivation =
  | 'money'
  | 'impact'
  | 'status'
  | 'freedom'
  | 'stability'
  | 'undetermined';

// ============================================================================
// REALITY CONSTRAINTS
// ============================================================================

/**
 * Financial context and constraints.
 */
export interface FinancialContext {
  /** Family income bracket */
  familyIncomeBracket: FamilyIncomeBracket;

  /** Estimated annual family income (optional, precise) */
  estimatedAnnualIncome?: number;

  /** Student has personal income */
  hasPersonalIncome: boolean;

  /** Monthly personal income if applicable */
  personalMonthlyIncome?: number;

  /** Education loan burden exists */
  hasEducationLoan: boolean;

  /** Can afford coaching if needed */
  canAffordCoaching: boolean;

  /** Can afford private college fees */
  canAffordPrivateCollege: boolean;
}

/**
 * Family context and constraints.
 */
export interface FamilyContext {
  /** Level of family pressure on career choice */
  familyPressure: FamilyPressure;

  /** Family's preferred career field (if any) */
  familyPreferredField?: string;

  /** Student is first-generation college goer */
  isFirstGeneration: boolean;

  /** Number of dependents relying on student */
  dependentCount: number;

  /** Expected to contribute to family income soon */
  expectedToContribute: boolean;

  /** Geographic constraint - must stay near family */
  mustStayNearFamily: boolean;
}

/**
 * Geographic and environmental constraints.
 */
export interface GeographicContext {
  /** Current location type */
  locationType: LocationType;

  /** Specific city/town name */
  currentCity?: string;

  /** State/UT */
  currentState?: string;

  /** Willing to relocate for career */
  willingToRelocate: boolean;

  /** Preferred locations (if any) */
  preferredLocations?: string[];

  /** Constraints on relocation */
  relocationConstraints?: string;
}

/**
 * Language and accessibility constraints.
 */
export interface AccessibilityContext {
  /** English language comfort level */
  languageComfort: LanguageComfort;

  /** Native/regional language */
  nativeLanguage: string;

  /** Coaching access level */
  coachingAccess: CoachingAccess;

  /** Has reliable internet access */
  hasInternetAccess: boolean;

  /** Has device for online learning */
  hasLearningDevice: boolean;

  /** Quality of local educational institutions */
  localInstitutionQuality: 'poor' | 'average' | 'good' | 'excellent';
}

/**
 * Combined reality constraints.
 */
export interface RealityConstraints {
  /** Financial context */
  financial: FinancialContext;

  /** Family context */
  family: FamilyContext;

  /** Geographic context */
  geographic: GeographicContext;

  /** Accessibility context */
  accessibility: AccessibilityContext;
}

// ============================================================================
// ACADEMIC PROFILE
// ============================================================================

/**
 * Academic performance in a specific subject.
 */
export interface SubjectGrade {
  /** Subject name */
  subject: string;

  /** Score (normalized 0.0 - 1.0) */
  score: ProfileScore;

  /** Raw score for display */
  rawScore: number;

  /** Maximum possible score */
  maxScore: number;
}

/**
 * Overall academic performance.
 */
export interface AcademicPerformance {
  /** Education stage */
  stage: EducationStage;

  /** Academic stream */
  stream?: AcademicStream;

  /** Education board */
  board?: EducationBoard;

  /** Grade scale used */
  gradeScale: GradeScale;

  /** Overall score (normalized 0.0 - 1.0) */
  overallScore: ProfileScore;

  /** Subject-wise performance */
  subjectGrades: SubjectGrade[];

  /** Year/semester of study */
  currentYear?: number;

  /** Institution name */
  institutionName?: string;

  /** Institution tier (if known) */
  institutionTier?: 'tier_1' | 'tier_2' | 'tier_3' | 'unranked';
}

/**
 * Aptitude test scores.
 */
export interface AptitudeScores {
  /** Logical reasoning score */
  logicalReasoning?: ProfileScore;

  /** Numerical ability score */
  numericalAbility?: ProfileScore;

  /** Verbal ability score */
  verbalAbility?: ProfileScore;

  /** Spatial reasoning score */
  spatialReasoning?: ProfileScore;

  /** Critical thinking score */
  criticalThinking?: ProfileScore;

  /** Overall aptitude percentile (if available) */
  overallPercentile?: number;
}

/**
 * Competitive exam results.
 */
export interface ExamResult {
  /** Exam type */
  examType: CompetitiveExamType;

  /** Rank/score achieved */
  rank?: number;

  /** Percentile achieved */
  percentile?: number;

  /** Raw score */
  rawScore?: number;

  /** Qualifying status */
  qualified: boolean;

  /** Year of exam */
  year: number;

  /** Attempt number */
  attemptNumber: number;
}

/**
 * Academic interests and preferences.
 */
export interface AcademicInterests {
  /** Favorite subjects */
  favoriteSubjects: string[];

  /** Disliked subjects */
  dislikedSubjects: string[];

  /** Preferred learning style */
  preferredLearningStyle?:
    | 'visual'
    | 'auditory'
    | 'reading_writing'
    | 'kinesthetic'
    | 'mixed';

  /** Extracurricular activities */
  extracurriculars: string[];

  /** Projects or achievements */
  notableProjects?: string[];
}

/**
 * Complete academic profile.
 */
export interface AcademicProfile {
  /** Academic performance history */
  performance: AcademicPerformance;

  /** Aptitude test scores */
  aptitude: AptitudeScores;

  /** Competitive exam results */
  examResults: ExamResult[];

  /** Academic interests */
  interests: AcademicInterests;
}

// ============================================================================
// DECISION CONTEXT
// ============================================================================

/**
 * Timeline and deadlines for career decision.
 */
export interface DecisionTimeline {
  /** Current urgency level */
  urgency: DecisionUrgency;

  /** Specific deadline if applicable */
  deadlineDate?: Timestamp;

  /** Months until decision needed */
  monthsToDecision?: number;

  /** Academic year/semester of decision */
  decisionPoint?: string;
}

/**
 * Confidence and readiness assessment.
 */
export interface DecisionConfidenceAssessment {
  /** Overall confidence level */
  level: DecisionConfidence;

  /** Confidence score (0.0 - 1.0) */
  score: ProfileScore;

  /** Areas of confidence */
  confidentAreas: string[];

  /** Areas of uncertainty */
  uncertainAreas: string[];
}

/**
 * Information needs and gaps.
 */
export interface InformationNeeds {
  /** Information gaps identified */
  gaps: string[];

  /** Careers needing more research */
  careersToResearch: string[];

  /** Questions that need answers */
  openQuestions: string[];

  /** Has spoken to professionals in target fields */
  hasDoneInformationalInterviews: boolean;
}

/**
 * Complete decision context.
 */
export interface DecisionContext {
  /** Current exploration stage */
  explorationStage: ExplorationStage;

  /** Decision timeline */
  timeline: DecisionTimeline;

  /** Confidence assessment */
  confidence: DecisionConfidenceAssessment;

  /** Information needs */
  informationNeeds: InformationNeeds;

  /** Previous career assessments taken */
  previousAssessments: string[];

  /** Has mentor or guidance */
  hasMentor: boolean;
}

// ============================================================================
// MAIN STUDENT PROFILE INTERFACE
// ============================================================================

/**
 * Complete student profile for CareerOS.
 *
 * This is the central domain entity representing a student's
 * career-relevant characteristics, constraints, and context.
 */
export interface StudentProfile {
  // -------------------------------------------------------------------------
  // Identity
  // -------------------------------------------------------------------------

  /** Unique profile identifier */
  id: StudentProfileId;

  /** Student identifier (external reference) */
  studentId: StudentId;

  /** Profile creation timestamp */
  createdAt: Timestamp;

  /** Last update timestamp */
  updatedAt: Timestamp;

  /** Profile version for schema evolution */
  schemaVersion: number;

  // -------------------------------------------------------------------------
  // Core Profiles
  // -------------------------------------------------------------------------

  /** Psychological traits */
  psychology: PsychologyProfile;

  /** Career motivations */
  motivations: Motivations;

  /** Primary motivation (derived) */
  primaryMotivation: PrimaryMotivation;

  // -------------------------------------------------------------------------
  // Context & Constraints
  // -------------------------------------------------------------------------

  /** Reality constraints (India-specific) */
  constraints: RealityConstraints;

  /** Academic background */
  academic: AcademicProfile;

  /** Decision context */
  decision: DecisionContext;

  // -------------------------------------------------------------------------
  // Metadata
  // -------------------------------------------------------------------------

  /** Data confidence score (0.0 - 1.0) */
  dataConfidence: ProfileScore;

  /** Completeness of profile (0.0 - 1.0) */
  completeness: ProfileScore;

  /** Source of profile data */
  dataSource: 'assessment' | 'manual_entry' | 'imported' | 'hybrid';

  /** Notes or additional context */
  notes?: string;
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validates that a score is within valid range (0.0 - 1.0).
 */
export function isValidProfileScore(score: number): score is ProfileScore {
  return typeof score === 'number' && score >= 0 && score <= 1;
}

/**
 * Validates a PsychologyProfile.
 */
export function validatePsychologyProfile(
  profile: PsychologyProfile
): boolean {
  const keys: (keyof PsychologyProfile)[] = [
    'analyticalThinking',
    'creativity',
    'socialOrientation',
    'leadership',
    'detailOrientation',
    'curiosity',
    'competitiveness',
    'riskTolerance',
  ];
  return keys.every((key) => isValidProfileScore(profile[key]));
}

/**
 * Validates Motivations.
 */
export function validateMotivations(motivations: Motivations): boolean {
  const keys: (keyof Motivations)[] = [
    'money',
    'impact',
    'status',
    'freedom',
    'stability',
  ];
  return keys.every((key) => isValidProfileScore(motivations[key]));
}

/**
 * Validates a complete StudentProfile.
 */
export function validateStudentProfile(
  profile: unknown
): profile is StudentProfile {
  if (!profile || typeof profile !== 'object') return false;

  const p = profile as Partial<StudentProfile>;

  // Check required identity fields
  if (!p.id || !p.studentId) return false;
  if (typeof p.createdAt !== 'number') return false;
  if (typeof p.updatedAt !== 'number') return false;

  // Check required profiles
  if (!p.psychology || !validatePsychologyProfile(p.psychology)) return false;
  if (!p.motivations || !validateMotivations(p.motivations)) return false;

  // Check constraints
  if (!p.constraints) return false;
  if (!p.constraints.financial || !p.constraints.family) return false;
  if (!p.constraints.geographic || !p.constraints.accessibility) return false;

  // Check academic
  if (!p.academic || !p.academic.performance) return false;

  // Check decision
  if (!p.decision) return false;

  return true;
}

// ============================================================================
// BUILDER PATTERN
// ============================================================================

/**
 * Builder for creating StudentProfile objects.
 *
 * Usage:
 *   const profile = new StudentProfileBuilder('student-123')
 *     .withPsychology({ analyticalThinking: 0.8, ... })
 *     .withMotivations({ money: 0.7, impact: 0.9, ... })
 *     .withConstraints({ financial: {...}, family: {...} })
 *     .build();
 */
export class StudentProfileBuilder {
  private profile: Partial<StudentProfile> = {
    schemaVersion: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    dataConfidence: 0.5,
    completeness: 0,
    dataSource: 'manual_entry',
    primaryMotivation: 'undetermined',
  };

  private psychology: Partial<PsychologyProfile> = {};
  private motivations: Partial<Motivations> = {};
  private constraints: {
    financial?: Partial<FinancialContext>;
    family?: Partial<FamilyContext>;
    geographic?: Partial<GeographicContext>;
    accessibility?: Partial<AccessibilityContext>;
  } = {};
  private academic: {
    performance?: Partial<AcademicPerformance>;
    aptitude?: Partial<AptitudeScores>;
    examResults?: ExamResult[];
    interests?: Partial<AcademicInterests>;
  } = {};
  private decision: {
    explorationStage?: ExplorationStage;
    timeline?: Partial<DecisionTimeline>;
    confidence?: Partial<DecisionConfidenceAssessment>;
    informationNeeds?: Partial<InformationNeeds>;
    previousAssessments?: string[];
    hasMentor?: boolean;
  } = {};

  constructor(studentId: StudentId) {
    this.profile.id = this.generateId();
    this.profile.studentId = studentId;
  }

  private generateId(): StudentProfileId {
    return `profile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // -------------------------------------------------------------------------
  // Psychology
  // -------------------------------------------------------------------------

  withPsychology(psychology: Partial<PsychologyProfile>): this {
    this.psychology = { ...this.psychology, ...psychology };
    return this;
  }

  withAnalyticalThinking(score: ProfileScore): this {
    this.psychology.analyticalThinking = score;
    return this;
  }

  withCreativity(score: ProfileScore): this {
    this.psychology.creativity = score;
    return this;
  }

  withSocialOrientation(score: ProfileScore): this {
    this.psychology.socialOrientation = score;
    return this;
  }

  withLeadership(score: ProfileScore): this {
    this.psychology.leadership = score;
    return this;
  }

  withDetailOrientation(score: ProfileScore): this {
    this.psychology.detailOrientation = score;
    return this;
  }

  withCuriosity(score: ProfileScore): this {
    this.psychology.curiosity = score;
    return this;
  }

  withCompetitiveness(score: ProfileScore): this {
    this.psychology.competitiveness = score;
    return this;
  }

  withRiskTolerance(score: ProfileScore): this {
    this.psychology.riskTolerance = score;
    return this;
  }

  // -------------------------------------------------------------------------
  // Motivations
  // -------------------------------------------------------------------------

  withMotivations(motivations: Partial<Motivations>): this {
    this.motivations = { ...this.motivations, ...motivations };
    return this;
  }

  withPrimaryMotivation(motivation: PrimaryMotivation): this {
    this.profile.primaryMotivation = motivation;
    return this;
  }

  // -------------------------------------------------------------------------
  // Constraints
  // -------------------------------------------------------------------------

  withFinancialContext(context: Partial<FinancialContext>): this {
    this.constraints.financial = { ...this.constraints.financial, ...context };
    return this;
  }

  withFamilyContext(context: Partial<FamilyContext>): this {
    this.constraints.family = { ...this.constraints.family, ...context };
    return this;
  }

  withGeographicContext(context: Partial<GeographicContext>): this {
    this.constraints.geographic = { ...this.constraints.geographic, ...context };
    return this;
  }

  withAccessibilityContext(context: Partial<AccessibilityContext>): this {
    this.constraints.accessibility = {
      ...this.constraints.accessibility,
      ...context,
    };
    return this;
  }

  // -------------------------------------------------------------------------
  // Academic
  // -------------------------------------------------------------------------

  withAcademicPerformance(performance: Partial<AcademicPerformance>): this {
    this.academic.performance = { ...this.academic.performance, ...performance };
    return this;
  }

  withAptitudeScores(scores: Partial<AptitudeScores>): this {
    this.academic.aptitude = { ...this.academic.aptitude, ...scores };
    return this;
  }

  withExamResults(results: ExamResult[]): this {
    this.academic.examResults = results;
    return this;
  }

  withAcademicInterests(interests: Partial<AcademicInterests>): this {
    this.academic.interests = { ...this.academic.interests, ...interests };
    return this;
  }

  // -------------------------------------------------------------------------
  // Decision Context
  // -------------------------------------------------------------------------

  withExplorationStage(stage: ExplorationStage): this {
    this.decision.explorationStage = stage;
    return this;
  }

  withDecisionTimeline(timeline: Partial<DecisionTimeline>): this {
    this.decision.timeline = { ...this.decision.timeline, ...timeline };
    return this;
  }

  withDecisionConfidence(confidence: Partial<DecisionConfidenceAssessment>): this {
    this.decision.confidence = { ...this.decision.confidence, ...confidence };
    return this;
  }

  withInformationNeeds(needs: Partial<InformationNeeds>): this {
    this.decision.informationNeeds = { ...this.decision.informationNeeds, ...needs };
    return this;
  }

  withDataSource(source: StudentProfile['dataSource'], confidence?: ProfileScore): this {
    this.profile.dataSource = source;
    if (confidence !== undefined) this.profile.dataConfidence = confidence;
    return this;
  }

  withNotes(notes: string): this {
    this.profile.notes = notes;
    return this;
  }

  // -------------------------------------------------------------------------
  // Build
  // -------------------------------------------------------------------------

  build(): StudentProfile {
    // Create default values for missing fields
    const defaultPsychology: PsychologyProfile = {
      analyticalThinking: 0.5,
      creativity: 0.5,
      socialOrientation: 0.5,
      leadership: 0.5,
      detailOrientation: 0.5,
      curiosity: 0.5,
      competitiveness: 0.5,
      riskTolerance: 0.5,
    };

    const defaultMotivations: Motivations = {
      money: 0.5,
      impact: 0.5,
      status: 0.5,
      freedom: 0.5,
      stability: 0.5,
    };

    const defaultConstraints: RealityConstraints = {
      financial: {
        familyIncomeBracket: FamilyIncomeBracket.BETWEEN_6_12_LPA,
        hasPersonalIncome: false,
        hasEducationLoan: false,
        canAffordCoaching: false,
        canAffordPrivateCollege: false,
        ...this.constraints.financial,
      } as FinancialContext,
      family: {
        familyPressure: FamilyPressure.NONE,
        isFirstGeneration: false,
        dependentCount: 0,
        expectedToContribute: false,
        mustStayNearFamily: false,
        ...this.constraints.family,
      } as FamilyContext,
      geographic: {
        locationType: LocationType.TIER_2_CITY,
        willingToRelocate: true,
        ...this.constraints.geographic,
      } as GeographicContext,
      accessibility: {
        languageComfort: LanguageComfort.FUNCTIONAL_ENGLISH,
        nativeLanguage: 'Hindi',
        coachingAccess: CoachingAccess.NONE,
        hasInternetAccess: true,
        hasLearningDevice: true,
        localInstitutionQuality: 'average',
        ...this.constraints.accessibility,
      } as AccessibilityContext,
    };

    const defaultAcademic: AcademicProfile = {
      performance: {
        stage: EducationStage.HIGH_SCHOOL_11_12,
        gradeScale: GradeScale.PERCENTAGE,
        overallScore: 0.7,
        subjectGrades: [],
        ...this.academic.performance,
      } as AcademicPerformance,
      aptitude: this.academic.aptitude ?? {},
      examResults: this.academic.examResults ?? [],
      interests: {
        favoriteSubjects: [],
        dislikedSubjects: [],
        extracurriculars: [],
        ...this.academic.interests,
      } as AcademicInterests,
    };

    const defaultDecision: DecisionContext = {
      explorationStage: this.decision.explorationStage ?? ExplorationStage.EXPLORING,
      timeline: {
        urgency: DecisionUrgency.PLANNING,
        ...this.decision.timeline,
      } as DecisionTimeline,
      confidence: {
        level: DecisionConfidence.SOMEWHAT_CONFIDENT,
        score: 0.5,
        confidentAreas: [],
        uncertainAreas: [],
        ...this.decision.confidence,
      } as DecisionConfidenceAssessment,
      informationNeeds: {
        gaps: [],
        careersToResearch: [],
        openQuestions: [],
        hasDoneInformationalInterviews: false,
        ...this.decision.informationNeeds,
      } as InformationNeeds,
      previousAssessments: this.decision.previousAssessments ?? [],
      hasMentor: this.decision.hasMentor ?? false,
    };

    // Calculate completeness
    const completeness = this.calculateCompleteness();

    const profile: StudentProfile = {
      id: this.profile.id!,
      studentId: this.profile.studentId!,
      createdAt: this.profile.createdAt!,
      updatedAt: Date.now(),
      schemaVersion: this.profile.schemaVersion!,
      psychology: { ...defaultPsychology, ...this.psychology },
      motivations: { ...defaultMotivations, ...this.motivations },
      primaryMotivation: this.profile.primaryMotivation!,
      constraints: defaultConstraints,
      academic: defaultAcademic,
      decision: defaultDecision,
      dataConfidence: this.profile.dataConfidence!,
      completeness,
      dataSource: this.profile.dataSource!,
      notes: this.profile.notes,
    };

    // Determine primary motivation if not set
    if (profile.primaryMotivation === 'undetermined') {
      profile.primaryMotivation = this.derivePrimaryMotivation(profile.motivations);
    }

    if (!validateStudentProfile(profile)) {
      throw new Error('Invalid StudentProfile: missing required fields or invalid scores');
    }

    return profile;
  }

  private calculateCompleteness(): ProfileScore {
    let completedFields = 0;
    let totalFields = 0;

    // Psychology (8 traits)
    const psychKeys = Object.keys(this.psychology).length;
    completedFields += psychKeys;
    totalFields += 8;

    // Motivations (5 drivers)
    const motKeys = Object.keys(this.motivations).length;
    completedFields += motKeys;
    totalFields += 5;

    // Constraints (4 contexts)
    const constraintContexts = [
      this.constraints.financial,
      this.constraints.family,
      this.constraints.geographic,
      this.constraints.accessibility,
    ].filter(Boolean).length;
    completedFields += constraintContexts;
    totalFields += 4;

    // Academic (4 sections)
    const academicSections = [
      this.academic.performance?.overallScore !== undefined,
      Object.keys(this.academic.aptitude ?? {}).length > 0,
      (this.academic.examResults?.length ?? 0) > 0,
      (this.academic.interests?.favoriteSubjects?.length ?? 0) > 0,
    ].filter(Boolean).length;
    completedFields += academicSections;
    totalFields += 4;

    // Decision context
    const hasDecisionContext = this.decision.explorationStage !== undefined;
    completedFields += hasDecisionContext ? 1 : 0;
    totalFields += 1;

    return completedFields / totalFields;
  }

  private derivePrimaryMotivation(motivations: Partial<Motivations>): PrimaryMotivation {
    const entries = Object.entries(motivations) as [keyof Motivations, ProfileScore][];
    if (entries.length === 0) return 'undetermined';

    const sorted = entries.sort((a, b) => b[1] - a[1]);
    const top = sorted[0];

    if (top[1] < 0.6) return 'undetermined';
    return top[0];
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Creates a neutral psychology profile (all 0.5).
 */
export function createNeutralPsychologyProfile(): PsychologyProfile {
  return {
    analyticalThinking: 0.5,
    creativity: 0.5,
    socialOrientation: 0.5,
    leadership: 0.5,
    detailOrientation: 0.5,
    curiosity: 0.5,
    competitiveness: 0.5,
    riskTolerance: 0.5,
  };
}

/**
 * Creates a neutral motivations profile (all 0.5).
 */
export function createNeutralMotivations(): Motivations {
  return {
    money: 0.5,
    impact: 0.5,
    status: 0.5,
    freedom: 0.5,
    stability: 0.5,
  };
}

/**
 * Determines the primary motivation from motivations profile.
 */
export function derivePrimaryMotivation(motivations: Motivations): PrimaryMotivation {
  const entries = Object.entries(motivations) as [keyof Motivations, ProfileScore][];
  const sorted = entries.sort((a, b) => b[1] - a[1]);
  const top = sorted[0];

  if (top[1] < 0.6) return 'undetermined';
  return top[0];
}

/**
 * Calculates profile completeness score.
 */
export function calculateProfileCompleteness(profile: StudentProfile): ProfileScore {
  let completedFields = 0;
  let totalFields = 0;

  // Psychology (8 traits)
  const psychValid = validatePsychologyProfile(profile.psychology);
  completedFields += psychValid ? 8 : 0;
  totalFields += 8;

  // Motivations (5 drivers)
  const motValid = validateMotivations(profile.motivations);
  completedFields += motValid ? 5 : 0;
  totalFields += 5;

  // Constraints (4 contexts)
  const hasConstraints =
    profile.constraints.financial &&
    profile.constraints.family &&
    profile.constraints.geographic &&
    profile.constraints.accessibility;
  completedFields += hasConstraints ? 4 : 0;
  totalFields += 4;

  // Academic
  const hasAcademic =
    profile.academic.performance.subjectGrades.length > 0 ||
    Object.keys(profile.academic.aptitude).length > 0;
  completedFields += hasAcademic ? 4 : 0;
  totalFields += 4;

  // Decision context
  completedFields += 1;
  totalFields += 1;

  return completedFields / totalFields;
}

/**
 * Formats a profile score as percentage.
 */
export function formatProfileScore(score: ProfileScore): string {
  return `${Math.round(score * 100)}%`;
}

/**
 * Compares two psychology profiles and returns differences.
 */
export function comparePsychologyProfiles(
  profileA: PsychologyProfile,
  profileB: PsychologyProfile
): Array<{ trait: keyof PsychologyProfile; diff: number }> {
  const traits: (keyof PsychologyProfile)[] = [
    'analyticalThinking',
    'creativity',
    'socialOrientation',
    'leadership',
    'detailOrientation',
    'curiosity',
    'competitiveness',
    'riskTolerance',
  ];

  return traits
    .map((trait) => ({
      trait,
      diff: Math.abs(profileA[trait] - profileB[trait]),
    }))
    .sort((a, b) => b.diff - a.diff);
}

/**
 * Type guard for StudentProfile.
 */
export function isStudentProfile(obj: unknown): obj is StudentProfile {
  return validateStudentProfile(obj);
}
