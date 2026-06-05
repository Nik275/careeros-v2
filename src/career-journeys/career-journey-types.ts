/**
 * Career Journey Intelligence - Type Definitions
 * 
 * Core types for understanding how real people reach their careers.
 * Captures authentic career paths, decisions, turning points, and insights.
 */

// ============================================================================
// CORE JOURNEY TYPES
// ============================================================================

/**
 * Unique identifier for career journeys
 */
export type JourneyId = string;

/**
 * Represents a complete career journey from starting point to current state
 */
export interface CareerJourney {
  id: JourneyId;
  
  /** Where the journey began - initial context and constraints */
  startingPoint: JourneyStartingPoint;
  
  /** Current role and position */
  currentRole: RoleSnapshot;
  
  /** Current industry sector */
  currentIndustry: Industry;
  
  /** Educational background and milestones */
  educationHistory: EducationMilestone[];
  
  /** Sequential career positions held */
  careerHistory: CareerPosition[];
  
  /** Major career decisions made along the way */
  majorDecisions: CareerDecision[];
  
  /** Key inflection points that changed trajectory */
  turningPoints: TurningPoint[];
  
  /** Failures and setbacks experienced */
  failures: CareerFailure[];
  
  /** Successes and achievements */
  successes: CareerSuccess[];
  
  /** Lessons learned from experience */
  lessons: LessonLearned[];
  
  /** Regrets and missed opportunities */
  regrets: CareerRegret[];
  
  /** Metadata */
  metadata: JourneyMetadata;
}

/**
 * Starting context of a career journey
 */
export interface JourneyStartingPoint {
  /** Geographic origin - city tier, region */
  location: LocationContext;
  
  /** Family background and resources */
  familyBackground: FamilyContext;
  
  /** Economic situation at start */
  economicContext: EconomicContext;
  
  /** Initial education level */
  initialEducation: EducationLevel;
  
  /** Year journey began */
  startYear: number;
  
  /** Initial career aspirations if any */
  initialAspirations?: string[];
  
  /** Constraints and limitations at start */
  initialConstraints: Constraint[];
}

/**
 * Geographic context for journey starting point
 */
export interface LocationContext {
  /** City or town name */
  city: string;
  
  /** State or province */
  state: string;
  
  /** Country */
  country: string;
  
  /** City tier classification */
  tier: CityTier;
  
  /** Proximity to major metro */
  proximityToMetro?: number; // in km
}

export type CityTier = 'TIER_1' | 'TIER_2' | 'TIER_3' | 'RURAL';

/**
 * Family background context
 */
export interface FamilyContext {
  /** Family's primary occupation/income source */
  familyOccupation: string;
  
  /** Education level of parents */
  parentEducation: EducationLevel;
  
  /** Family support level for career */
  supportLevel: SupportLevel;
  
  /** Any family obligations or constraints */
  obligations?: string[];
  
  /** Family network/connections */
  networkQuality: NetworkQuality;
}

export type SupportLevel = 'HIGH' | 'MODERATE' | 'LOW' | 'NONE';
export type NetworkQuality = 'EXTENSIVE' | 'MODERATE' | 'LIMITED' | 'NONE';

/**
 * Economic context at journey start
 */
export interface EconomicContext {
  /** Family income level */
  familyIncomeLevel: IncomeLevel;
  
  /** Financial independence at start */
  financiallyIndependent: boolean;
  
  /** Debt or financial obligations */
  hasFinancialObligations: boolean;
  
  /** Access to capital for education/career */
  accessToCapital: boolean;
}

export type IncomeLevel = 'LOW' | 'LOWER_MIDDLE' | 'MIDDLE' | 'UPPER_MIDDLE' | 'HIGH';

// ============================================================================
// EDUCATION TYPES
// ============================================================================

export interface EducationMilestone {
  id: string;
  
  /** Type of education/qualification */
  type: EducationType;
  
  /** Institution name */
  institution: string;
  
  /** Institution tier/prestige */
  institutionTier: InstitutionTier;
  
  /** Field of study */
  fieldOfStudy: string;
  
  /** Year started */
  startYear: number;
  
  /** Year completed (null if ongoing) */
  endYear?: number;
  
  /** Was this completed */
  completed: boolean;
  
  /** GPA or grade equivalent */
  performance?: string;
  
  /** Key skills/knowledge gained */
  skillsGained: string[];
  
  /** How this education impacted career */
  careerImpact: EducationImpact;
  
  /** Any entrance exams taken */
  entranceExams?: EntranceExamResult[];
}

export type EducationType = 
  | 'HIGH_SCHOOL'
  | 'UNDERGRADUATE'
  | 'POSTGRADUATE'
  | 'DIPLOMA'
  | 'CERTIFICATION'
  | 'PROFESSIONAL_COURSE'
  | 'ONLINE_COURSE'
  | 'BOOTCAMP';

export type InstitutionTier = 'TIER_1' | 'TIER_2' | 'TIER_3' | 'LOCAL' | 'INTERNATIONAL';

export type EducationLevel = 'NONE' | 'HIGH_SCHOOL' | 'UNDERGRADUATE' | 'POSTGRADUATE';

export interface EducationImpact {
  /** How crucial was this education for career */
  importance: ImportanceLevel;
  
  /** Direct outcomes from this education */
  directOutcomes: string[];
  
  /** Network gained */
  networkValue: NetworkQuality;
}

export interface EntranceExamResult {
  examName: string;
  rank?: number;
  percentile?: number;
  qualified: boolean;
  attempts: number;
}

// ============================================================================
// CAREER POSITION TYPES
// ============================================================================

export interface CareerPosition {
  id: string;
  
  /** Role title */
  title: string;
  
  /** Company/Organization */
  organization: string;
  
  /** Company size/stage */
  companyStage: CompanyStage;
  
  /** Industry sector */
  industry: Industry;
  
  /** Start date */
  startDate: Date;
  
  /** End date (null if current) */
  endDate?: Date;
  
  /** Duration in months */
  durationMonths: number;
  
  /** Location of this position */
  location: string;
  
  /** Compensation range */
  compensation?: CompensationRange;
  
  /** Key responsibilities */
  responsibilities: string[];
  
  /** Skills used and developed */
  skills: SkillUsage[];
  
  /** Key achievements */
  achievements: string[];
  
  /** Why this position was taken */
  reasonForJoining: string;
  
  /** Why this position was left (if applicable) */
  reasonForLeaving?: string;
  
  /** How this position contributed to growth */
  growthContribution: GrowthContribution;
}

export type CompanyStage = 'STARTUP_EARLY' | 'STARTUP_GROWTH' | 'STARTUP_LATE' | 'SMB' | 'ENTERPRISE' | 'GOVERNMENT' | 'NONPROFIT' | 'SELF_EMPLOYED';

export type Industry = 
  | 'TECHNOLOGY'
  | 'FINANCE'
  | 'CONSULTING'
  | 'HEALTHCARE'
  | 'EDUCATION'
  | 'MANUFACTURING'
  | 'RETAIL'
  | 'MEDIA'
  | 'GOVERNMENT'
  | 'NONPROFIT'
  | 'LEGAL'
  | 'REAL_ESTATE'
  | 'ENERGY'
  | 'OTHER';

export interface CompensationRange {
  min: number;
  max: number;
  currency: string;
  period: 'YEARLY' | 'MONTHLY';
}

export interface SkillUsage {
  skill: string;
  level: SkillLevel;
  gainedOrUsed: 'GAINED' | 'USED' | 'BOTH';
}

export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export interface GrowthContribution {
  /** How much this position contributed to career growth */
  contributionLevel: ImportanceLevel;
  
  /** Specific capabilities built */
  capabilitiesBuilt: string[];
  
  /** Network expansion */
  networkExpansion: NetworkQuality;
}

export interface RoleSnapshot {
  title: string;
  organization: string;
  companyStage: CompanyStage;
  industry: Industry;
  yearsInRole: number;
  totalYearsExperience: number;
}

// ============================================================================
// DECISION TYPES
// ============================================================================

export interface CareerDecision {
  id: string;
  
  /** The decision made */
  decision: string;
  
  /** Type of decision */
  type: DecisionType;
  
  /** Reasoning behind the decision */
  reasoning: string;
  
  /** Alternatives considered */
  alternativesConsidered: string[];
  
  /** Expected outcome at time of decision */
  expectedOutcome: string;
  
  /** Actual outcome */
  actualOutcome: DecisionOutcome;
  
  /** Constitutional confidence (0.0-1.0) when making decision */
  confidence: Confidence;
  
  /** When decision was made */
  timestamp: Date;
  
  /** Factors influencing decision */
  influencingFactors: string[];
  
  /** Who/what influenced the decision */
  influences: DecisionInfluence[];
  
  /** Long-term impact assessment */
  longTermImpact?: string;
}

export type DecisionType = 
  | 'CAREER_CHANGE'
  | 'EDUCATION'
  | 'RELOCATION'
  | 'COMPANY_CHANGE'
  | 'ROLE_CHANGE'
  | 'SKILL_DEVELOPMENT'
  | 'NETWORKING'
  | 'ENTREPRENEURSHIP'
  | 'STAY_PUT'
  | 'OTHER';

export interface DecisionOutcome {
  /** Whether outcome matched expectations */
  matchedExpectations: boolean;
  
  /** Description of actual outcome */
  description: string;
  
  /** Was outcome positive */
  positive: boolean;
  
  /** Magnitude of impact */
  impact: ImpactLevel;
  
  /** Time to see results */
  timeToOutcome: string;
}

// BANNED: ConfidenceLevel enum removed - use Confidence type from @/intelligence/confidence
import type { Confidence } from '../intelligence/confidence';
export type ImpactLevel = 'TRANSFORMATIONAL' | 'MAJOR' | 'MODERATE' | 'MINOR' | 'NEGLIGIBLE';
export type ImportanceLevel = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';

export interface DecisionInfluence {
  source: string;
  type: InfluenceType;
  impact: InfluenceImpact;
}

export type InfluenceType = 'FAMILY' | 'FRIEND' | 'MENTOR' | 'COLLEAGUE' | 'ONLINE' | 'BOOK' | 'EVENT' | 'MARKET_CONDITIONS' | 'FINANCIAL' | 'OTHER';

export type InfluenceImpact = 'DECISIVE' | 'SIGNIFICANT' | 'MODERATE' | 'MINOR';

// ============================================================================
// TURNING POINT TYPES
// ============================================================================

export interface TurningPoint {
  id: string;
  
  /** Description of the event */
  event: string;
  
  /** Type of turning point */
  type: TurningPointType;
  
  /** When it occurred */
  timestamp: Date;
  
  /** Overall impact on career trajectory */
  impact: TrajectoryImpact;
  
  /** Positive effects */
  positiveEffects: Effect[];
  
  /** Negative effects */
  negativeEffects: Effect[];
  
  /** How important this was in overall journey */
  importance: ImportanceLevel;
  
  /** Whether this was expected or unexpected */
  expected: boolean;
  
  /** How this changed the career path */
  pathChange: PathChange;
  
  /** Learning from this turning point */
  keyLearning: string;
}

export type TurningPointType = 
  | 'OPPORTUNITY'
  | 'CRISIS'
  | 'REALIZATION'
  | 'MEETING'
  | 'FAILURE'
  | 'SUCCESS'
  | 'MARKET_SHIFT'
  | 'PERSONAL_CIRCUMSTANCE'
  | 'NETWORK_EVENT'
  | 'EDUCATION_MILESTONE';

export interface Effect {
  description: string;
  category: EffectCategory;
  magnitude: ImpactLevel;
}

export type EffectCategory = 'CAREER' | 'FINANCIAL' | 'SKILLS' | 'NETWORK' | 'PERSONAL' | 'LOCATION';

export interface TrajectoryImpact {
  /** Direction of change */
  direction: 'UPWARD' | 'DOWNWARD' | 'LATERAL' | 'CHANGED_PATH';
  
  /** Magnitude of change */
  magnitude: ImpactLevel;
  
  /** Long-term vs short-term */
  duration: 'IMMEDIATE' | 'SHORT_TERM' | 'LONG_TERM' | 'PERMANENT';
}

export interface PathChange {
  /** Previous trajectory */
  fromPath: string;
  
  /** New trajectory */
  toPath: string;
  
  /** Whether this was a deliberate change */
  deliberate: boolean;
}

// ============================================================================
// FAILURE AND SUCCESS TYPES
// ============================================================================

export interface CareerFailure {
  id: string;
  
  /** Description of the failure */
  description: string;
  
  /** Type of failure */
  type: FailureType;
  
  /** When it occurred */
  timestamp: Date;
  
  /** Impact severity */
  impact: ImpactLevel;
  
  /** How it was handled */
  response: string;
  
  /** Lessons learned */
  lessonsLearned: string[];
  
  /** Whether recovery was successful */
  recovered: boolean;
  
  /** Time to recover */
  recoveryTime?: string;
  
  /** Long-term impact */
  longTermImpact: string;
}

export type FailureType = 
  | 'JOB_LOSS'
  | 'PROJECT_FAILURE'
  | 'EXAM_FAILURE'
  | 'BUSINESS_FAILURE'
  | 'REJECTION'
  | 'MISSED_OPPORTUNITY'
  | 'BAD_DECISION'
  | 'SKILL_GAP'
  | 'MARKET_MISREAD'
  | 'OTHER';

export interface CareerSuccess {
  id: string;
  
  /** Description of success */
  description: string;
  
  /** Type of success */
  type: SuccessType;
  
  /** When it occurred */
  timestamp: Date;
  
  /** Magnitude */
  magnitude: ImpactLevel;
  
  /** Factors contributing to success */
  contributingFactors: string[];
  
  /** Skills that enabled success */
  keySkills: string[];
  
  /** Impact on career */
  careerImpact: string;
  
  /** Was this expected */
  expected: boolean;
}

export type SuccessType = 
  | 'PROMOTION'
  | 'JOB_OFFER'
  | 'EXAM_SUCCESS'
  | 'PROJECT_SUCCESS'
  | 'BUSINESS_SUCCESS'
  | 'SKILL_MASTERY'
  | 'NETWORK_EXPANSION'
  | 'RECOGNITION'
  | 'FINANCIAL'
  | 'OTHER';

// ============================================================================
// LESSON AND REGRET TYPES
// ============================================================================

export interface LessonLearned {
  id: string;
  
  /** The lesson */
  lesson: string;
  
  /** How it was learned */
  learnedFrom: string;
  
  /** Category */
  category: LessonCategory;
  
  /** When it was learned */
  timestamp: Date;
  
  /** How it has been applied */
  application: string;
  
  /** Importance of this lesson */
  importance: ImportanceLevel;
}

export type LessonCategory = 
  | 'SKILLS'
  | 'NETWORKING'
  | 'DECISION_MAKING'
  | 'INDUSTRY_KNOWLEDGE'
  | 'SELF_AWARENESS'
  | 'TIMING'
  | 'RISK_MANAGEMENT'
  | 'COMMUNICATION'
  | 'OTHER';

export interface CareerRegret {
  id: string;
  
  /** What is regretted */
  regret: string;
  
  /** Type of regret */
  type: RegretType;
  
  /** What was done instead */
  whatWasDone: string;
  
  /** What should have been done */
  whatShouldHaveBeenDone: string;
  
  /** Estimated impact of the regret */
  estimatedImpact: string;
  
  /** Whether this regret can still be addressed */
  addressable: boolean;
  
  /** If addressable, how */
  howToAddress?: string;
  
  /** Intensity of regret */
  intensity: 'SEVERE' | 'MODERATE' | 'MILD';
}

export type RegretType = 
  | 'ACTION_TAKEN'
  | 'ACTION_NOT_TAKEN'
  | 'TIMING'
  | 'SKILL_NOT_DEVELOPED'
  | 'OPPORTUNITY_MISSED'
  | 'RELATIONSHIP_NEGLECTED'
  | 'DECISION_QUALITY'
  | 'OTHER';

// ============================================================================
// CONSTRAINT TYPES
// ============================================================================

export interface Constraint {
  id: string;
  
  /** Description of constraint */
  description: string;
  
  /** Type of constraint */
  type: ConstraintType;
  
  /** Impact level */
  impact: ImpactLevel;
  
  /** Whether it was overcome */
  overcome: boolean;
  
  /** How it was overcome (if applicable) */
  howOvercome?: string;
}

export type ConstraintType = 
  | 'FINANCIAL'
  | 'GEOGRAPHIC'
  | 'FAMILY'
  | 'EDUCATION'
  | 'HEALTH'
  | 'SKILL'
  | 'NETWORK'
  | 'MARKET'
  | 'TIMING'
  | 'OTHER';

// ============================================================================
// TRANSITION TYPES
// ============================================================================

export interface CareerTransition {
  id: string;
  
  /** Previous career/role */
  fromCareer: string;
  
  /** New career/role */
  toCareer: string;
  
  /** Specific reason for transition */
  reason: string;
  
  /** Type of transition */
  type: TransitionType;
  
  /** Difficulty level experienced */
  difficulty: DifficultyLevel;
  
  /** Skills required for transition */
  skillsRequired: string[];
  
  /** Skills already possessed */
  skillsPossessed: string[];
  
  /** Skills gap */
  skillsGap: string[];
  
  /** How gap was addressed */
  howGapAddressed?: string;
  
  /** Time taken for transition */
  transitionTime: string;
  
  /** Whether transition was successful */
  successful: boolean;
  
  /** Support received during transition */
  supportReceived: SupportType[];
}

export type TransitionType = 
  | 'INDUSTRY_CHANGE'
  | 'ROLE_CHANGE'
  | 'LEVEL_CHANGE'
  | 'LOCATION_CHANGE'
  | 'STAGE_CHANGE'
  | 'FUNCTION_CHANGE'
  | 'ENTREPRENEURSHIP'
  | 'EMPLOYMENT';

export type DifficultyLevel = 'VERY_EASY' | 'EASY' | 'MODERATE' | 'DIFFICULT' | 'VERY_DIFFICULT';

export type SupportType = 
  | 'FAMILY'
  | 'FRIENDS'
  | 'MENTOR'
  | 'COLLEAGUES'
  | 'FORMAL_EDUCATION'
  | 'ONLINE_RESOURCES'
  | 'FINANCIAL'
  | 'PROFESSIONAL_NETWORK';

// ============================================================================
// INSIGHTS TYPES
// ============================================================================

export interface JourneyInsights {
  journeyId: JourneyId;
  
  /** Single biggest lesson from entire journey */
  biggestLesson: string;
  
  /** Most valuable decision made */
  mostValuableDecision: ValuableDecision;
  
  /** Largest mistake or failure */
  largestMistake: MajorMistake;
  
  /** Most unexpected outcome */
  unexpectedOutcome: UnexpectedOutcome;
  
  /** Regret analysis summary */
  regretAnalysis: RegretAnalysis;
  
  /** Pattern analysis */
  patterns: JourneyPattern[];
  
  /** Advice for others */
  adviceForOthers: string[];
  
  /** What would be done differently */
  wouldDoDifferently: string[];
  
  /** Key success factors */
  keySuccessFactors: string[];
  
  /** Generated timestamp */
  generatedAt: Date;
}

export interface ValuableDecision {
  decision: string;
  value: string;
  whyValuable: string;
  when: Date;
}

export interface MajorMistake {
  mistake: string;
  impact: string;
  lesson: string;
  when: Date;
}

export interface UnexpectedOutcome {
  whatHappened: string;
  whatWasExpected: string;
  impact: string;
}

export interface RegretAnalysis {
  totalRegrets: number;
  addressableRegrets: number;
  biggestRegret?: string;
  regretPattern: string;
  advice: string;
}

export interface JourneyPattern {
  pattern: string;
  description: string;
  evidence: string[];
  significance: ImportanceLevel;
}

// ============================================================================
// ANALYSIS TYPES
// ============================================================================

export interface TransitionMap {
  /** All transitions in journey */
  transitions: CareerTransition[];
  
  /** Transition patterns identified */
  patterns: TransitionPattern[];
  
  /** Most common transition type */
  mostCommonType: TransitionType;
  
  /** Average transition difficulty */
  averageDifficulty: DifficultyLevel;
  
  /** Success rate */
  successRate: number;
}

export interface TransitionPattern {
  fromCategory: string;
  toCategory: string;
  frequency: number;
  avgDifficulty: DifficultyLevel;
  successRate: number;
  commonReasons: string[];
}

export interface TurningPointAnalysis {
  /** All turning points */
  turningPoints: TurningPoint[];
  
  /** Critical turning points (high importance) */
  criticalPoints: TurningPoint[];
  
  /** Unexpected turning points */
  unexpectedPoints: TurningPoint[];
  
  /** Pattern in turning points */
  patterns: TurningPointPattern[];
  
  /** Net trajectory impact */
  netImpact: TrajectoryImpact;
}

export interface TurningPointPattern {
  type: TurningPointType;
  frequency: number;
  typicalImpact: TrajectoryImpact;
  commonTiming: string;
}

export interface JourneyMetadata {
  /** When journey was recorded */
  recordedAt: Date;
  
  /** Last updated */
  updatedAt: Date;
  
  /** Verification status */
  verified: boolean;
  
  /** Source of journey data */
  source: JourneySource;
  
  /** Constitutional confidence (0.0-1.0) in data quality */
  dataQuality: Confidence;
  
  /** Tags for categorization */
  tags: string[];
}

export type JourneySource = 'SELF_REPORTED' | 'INTERVIEW' | 'SURVEY' | 'PUBLIC_DATA' | 'ANALYSIS';

// ============================================================================
// ENGINE INPUT/OUTPUT TYPES
// ============================================================================

export interface JourneyAnalysisInput {
  journey: CareerJourney;
  analysisDepth: AnalysisDepth;
  focusAreas?: AnalysisFocus[];
}

export type AnalysisDepth = 'BASIC' | 'STANDARD' | 'DEEP';

export type AnalysisFocus = 
  | 'DECISIONS'
  | 'TRANSITIONS'
  | 'TURNING_POINTS'
  | 'LESSONS'
  | 'REGRETS'
  | 'PATTERNS'
  | 'COMPARISON';

export interface JourneyAnalysisResult {
  journeyId: JourneyId;
  insights: JourneyInsights;
  transitionMap: TransitionMap;
  turningPointAnalysis: TurningPointAnalysis;
  confidence: Confidence; // 0.0-1.0 constitutional confidence
  generatedAt: Date;
}

export interface JourneyComparisonInput {
  journeys: CareerJourney[];
  comparisonDimensions: ComparisonDimension[];
}

export type ComparisonDimension = 
  | 'STARTING_POINT'
  | 'CAREER_PATH'
  | 'DECISIONS'
  | 'OUTCOMES'
  | 'TIMELINE'
  | 'CHALLENGES'
  | 'SUCCESSES';

export interface JourneyComparisonResult {
  commonalities: string[];
  differences: Difference[];
  relativePerformance: Map<JourneyId, PerformanceMetric[]>;
  keyInsights: string[];
}

export interface Difference {
  dimension: string;
  description: string;
  significance: ImportanceLevel;
}

export interface PerformanceMetric {
  metric: string;
  value: number;
  percentile: number;
}

export interface SimilarJourneyQuery {
  startingPoint?: Partial<JourneyStartingPoint>;
  currentRole?: Partial<RoleSnapshot>;
  constraints?: ConstraintType[];
  transitions?: TransitionType[];
  limit?: number;
}

export interface SimilarJourneyResult {
  journeyId: JourneyId;
  similarityScore: number;
  matchingFactors: string[];
  keyDifferences: string[];
  relevance: RelevanceScore;
}

export type RelevanceScore = 'HIGHLY_RELEVANT' | 'RELEVANT' | 'SOMEWHAT_RELEVANT' | 'LOOSELY_RELEVANT';
