/**
 * CareerOS - Career Reality Engine Types
 *
 * Phase: Career Reality Engine
 *
 * Models what life is actually like in different careers.
 *
 * CareerOS answers: "What is life actually like in this career?"
 *
 * @module career-reality-types
 * @version 1.0.0
 */

// ============================================================================
// CORE IDENTIFIERS
// ============================================================================

/** Unique identifier for a career reality profile */
export type CareerRealityProfileId = string;

/** Career identifier reference */
export type CareerId = string;

// ============================================================================
// CAREER REALITY PROFILE
// ============================================================================

/**
 * Comprehensive reality profile for a career.
 *
 * Captures what life is actually like in this career,
 * not just salary and demand metrics.
 */
export interface CareerRealityProfile {
  /** Unique profile identifier */
  profileId: CareerRealityProfileId;

  /** Career this profile describes */
  careerId: CareerId;

  /** Career title for display */
  careerTitle: string;

  /** Daily life patterns */
  dailyLife: DailyLifeProfile;

  /** Work environment characteristics */
  workEnvironment: WorkEnvironmentProfile;

  /** Burnout risk assessment */
  burnoutProfile: BurnoutProfile;

  /** Culture characteristics */
  cultureProfile: CultureProfile;

  /** Satisfaction drivers and patterns */
  satisfactionProfile: SatisfactionProfile;

  /** Reality gap analysis (expectation vs reality) */
  realityGap: RealityGapAnalysis;

  /** Career personality fit */
  personalityFit: CareerPersonalityFit;

  /** Reality explanations */
  explanations: RealityExplanations;

  /** Profile metadata */
  metadata: CareerRealityMetadata;
}

/** Metadata for career reality profile */
export interface CareerRealityMetadata {
  /** Profile creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;

  /** Profile version */
  version: number;

  /** Data quality score (0-100) */
  dataQualityScore: number;

  /** Confidence level in this profile */
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';

  /** Sample size for data collection */
  sampleSize: number;

  /** Data sources used */
  dataSources: DataSource[];
}

/** Data source for reality profiling */
export interface DataSource {
  /** Source type */
  type: 'PROFESSIONAL_SURVEY' | 'EXIT_INTERVIEW' | 'INDUSTRY_REPORT' | 'EXPERT_INTERVIEW' | 'JOB_ANALYSIS';

  /** Source name/description */
  description: string;

  /** Sample size from this source */
  sampleSize: number;

  /** Collection date */
  collectedAt: Date;

  /** Reliability score (0-100) */
  reliabilityScore: number;
}

// ============================================================================
// DAILY LIFE PROFILE
// ============================================================================

/**
 * Daily life patterns in a career.
 *
 * Models what a typical day, week, month, and year look like.
 */
export interface DailyLifeProfile {
  /** Typical day breakdown */
  typicalDay: TimeBlockBreakdown;

  /** Typical week pattern */
  typicalWeek: WeekPattern;

  /** Typical month pattern */
  typicalMonth: MonthPattern;

  /** Typical year pattern */
  typicalYear: YearPattern;

  /** Activity distribution */
  activityDistribution: ActivityDistribution;

  /** Work rhythm characteristics */
  workRhythm: WorkRhythm;
}

/** Time block breakdown for daily activities */
export interface TimeBlockBreakdown {
  /** Deep work / focused work hours per day */
  deepWorkHours: number;

  /** Meetings and collaboration hours per day */
  meetingHours: number;

  /** Administrative tasks hours per day */
  adminHours: number;

  /** Customer/client interaction hours per day */
  customerInteractionHours: number;

  /** Travel hours per day (average) */
  travelHours: number;

  /** Reactive work (interrupts, firefighting) hours per day */
  reactiveWorkHours: number;

  /** Learning and development hours per day */
  learningHours: number;

  /** Social/team building hours per day */
  socialHours: number;
}

/** Week pattern characteristics */
export interface WeekPattern {
  /** Typical hours per week */
  typicalHoursPerWeek: number;

  /** Peak hours per week (during crunch time) */
  peakHoursPerWeek: number;

  /** Minimum hours per week (during slow periods) */
  minimumHoursPerWeek: number;

  /** Weekend work frequency (0-100) */
  weekendWorkFrequency: number;

  /** Evening work frequency (0-100) */
  eveningWorkFrequency: number;

  /** Early morning work frequency (0-100) */
  earlyMorningWorkFrequency: number;

  /** Schedule predictability (0-100, higher = more predictable) */
  schedulePredictability: number;
}

/** Month pattern characteristics */
export interface MonthPattern {
  /** Monthly crunch periods (e.g., month-end, quarter-end) */
  crunchPeriods: CrunchPeriod[];

  /** Travel frequency (days per month) */
  travelDaysPerMonth: number;

  /** Work from home frequency (days per month) */
  wfhDaysPerMonth: number;

  /** Overtime frequency (0-100) */
  overtimeFrequency: number;
}

/** Crunch period definition */
export interface CrunchPeriod {
  /** Period name */
  name: string;

  /** Frequency (e.g., "monthly", "quarterly") */
  frequency: string;

  /** Typical duration in days */
  durationDays: number;

  /** Intensity level (0-100) */
  intensity: number;

  /** Hours per day during crunch */
  hoursPerDay: number;
}

/** Year pattern characteristics */
export interface YearPattern {
  /** Seasonal variations */
  seasonalPatterns: SeasonalPattern[];

  /** Annual leave typical entitlement */
  annualLeaveDays: number;

  /** Actual leave utilization rate (0-100) */
  leaveUtilizationRate: number;

  /** Shutdown periods (if any) */
  shutdownPeriods: string[];

  /** Conference/training travel weeks per year */
  professionalTravelWeeks: number;
}

/** Seasonal pattern definition */
export interface SeasonalPattern {
  /** Season name */
  season: string;

  /** Months included */
  months: string[];

  /** Workload level relative to average (0-100, 50 = average) */
  workloadLevel: number;

  /** Characteristics of this season */
  characteristics: string[];
}

/** Activity distribution across work types */
export interface ActivityDistribution {
  /** Percentage of time in meetings (0-100) */
  meetingsPercentage: number;

  /** Percentage of time in deep work (0-100) */
  deepWorkPercentage: number;

  /** Percentage of time in execution work (0-100) */
  executionPercentage: number;

  /** Percentage of time in collaboration (0-100) */
  collaborationPercentage: number;

  /** Percentage of time in customer interaction (0-100) */
  customerInteractionPercentage: number;

  /** Percentage of time in administrative work (0-100) */
  adminPercentage: number;

  /** Percentage of time in creative work (0-100) */
  creativeWorkPercentage: number;

  /** Percentage of time in analytical work (0-100) */
  analyticalWorkPercentage: number;
}

/** Work rhythm characteristics */
export interface WorkRhythm {
  /** Pace of work (0-100, higher = faster pace) */
  pace: number;

  /** Deadline pressure frequency (0-100) */
  deadlinePressure: number;

  /** Multi-tasking requirement (0-100) */
  multiTasking: number;

  /** Context switching frequency (0-100) */
  contextSwitching: number;

  /** Work intensity pattern */
  intensityPattern: 'STEADY' | 'CYCLICAL' | 'PROJECT_BASED' | 'CRISIS_DRIVEN' | 'SEASONAL';
}

// ============================================================================
// WORK ENVIRONMENT PROFILE
// ============================================================================

/**
 * Work environment characteristics.
 *
 * Models autonomy, structure, bureaucracy, ownership, competition, politics, flexibility.
 */
export interface WorkEnvironmentProfile {
  /** Autonomy level */
  autonomy: AutonomyProfile;

  /** Structure level */
  structure: StructureProfile;

  /** Bureaucracy level */
  bureaucracy: BureaucracyProfile;

  /** Ownership characteristics */
  ownership: OwnershipProfile;

  /** Competition level */
  competition: CompetitionProfile;

  /** Politics level */
  politics: PoliticsProfile;

  /** Flexibility characteristics */
  flexibility: FlexibilityProfile;

  /** Physical environment */
  physicalEnvironment: PhysicalEnvironmentProfile;
}

/** Autonomy characteristics */
export interface AutonomyProfile {
  /** Decision-making autonomy (0-100) */
  decisionMaking: number;

  /** Task autonomy (0-100) */
  taskAutonomy: number;

  /** Schedule autonomy (0-100) */
  scheduleAutonomy: number;

  /** Method autonomy (how to do the work) (0-100) */
  methodAutonomy: number;

  /** Overall autonomy score (0-100) */
  overallScore: number;
}

/** Structure characteristics */
export interface StructureProfile {
  /** Process formalization (0-100) */
  processFormalization: number;

  /** Hierarchy clarity (0-100) */
  hierarchyClarity: number;

  /** Role clarity (0-100) */
  roleClarity: number;

  /** Reporting structure formality (0-100) */
  reportingFormality: number;

  /** Overall structure level (0-100) */
  overallScore: number;
}

/** Bureaucracy characteristics */
export interface BureaucracyProfile {
  /** Approval layers required (0-100) */
  approvalLayers: number;

  /** Documentation requirements (0-100) */
  documentationRequirements: number;

  /** Policy adherence requirements (0-100) */
  policyAdherence: number;

  /** Red tape level (0-100) */
  redTape: number;

  /** Overall bureaucracy score (0-100, higher = more bureaucratic) */
  overallScore: number;
}

/** Ownership characteristics */
export interface OwnershipProfile {
  /** End-to-end ownership level (0-100) */
  endToEndOwnership: number;

  /** Accountability clarity (0-100) */
  accountabilityClarity: number;

  /** Resource control (0-100) */
  resourceControl: number;

  /** Impact visibility (0-100) */
  impactVisibility: number;

  /** Overall ownership score (0-100) */
  overallScore: number;
}

/** Competition characteristics */
export interface CompetitionProfile {
  /** Internal competition level (0-100) */
  internalCompetition: number;

  /** External market competition pressure (0-100) */
  marketCompetition: number;

  /** Performance ranking systems (0-100) */
  performanceRanking: number;

  /** Upward mobility competition (0-100) */
  promotionCompetition: number;

  /** Overall competition level (0-100) */
  overallScore: number;
}

/** Politics characteristics */
export interface PoliticsProfile {
  /** Organizational politics level (0-100) */
  organizationalPolitics: number;

  /** Stakeholder management requirements (0-100) */
  stakeholderManagement: number;

  /** Networking importance (0-100) */
  networkingImportance: number;

  /** Visibility importance (0-100) */
  visibilityImportance: number;

  /** Overall politics level (0-100) */
  overallScore: number;
}

/** Flexibility characteristics */
export interface FlexibilityProfile {
  /** Schedule flexibility (0-100) */
  scheduleFlexibility: number;

  /** Location flexibility (0-100) */
  locationFlexibility: number;

  /** Work arrangement options */
  workArrangements: WorkArrangement[];

  /** Overall flexibility score (0-100) */
  overallScore: number;
}

/** Work arrangement option */
export interface WorkArrangement {
  /** Arrangement type */
  type: 'FULLY_REMOTE' | 'HYBRID' | 'FLEXIBLE_HOURS' | 'COMPRESSED_WEEK' | 'JOB_SHARING';

  /** Availability of this arrangement (0-100) */
  availability: number;

  /** Commonality of this arrangement (0-100) */
  commonality: number;
}

/** Physical environment characteristics */
export interface PhysicalEnvironmentProfile {
  /** Office type */
  officeType: 'OPEN_PLAN' | 'PRIVATE_OFFICES' | 'CUBICLES' | 'ACTIVITY_BASED' | 'REMOTE_FIRST';

  /** Noise level (0-100, higher = noisier) */
  noiseLevel: number;

  /** Commute typical duration (minutes) */
  typicalCommuteMinutes: number;

  /** Travel requirements (0-100) */
  travelRequirements: number;

  /** Remote work feasibility (0-100) */
  remoteFeasibility: number;
}

// ============================================================================
// COMPANY STAGE TYPES
// ============================================================================

/** Company stage types */
export type CompanyStage = 'STARTUP' | 'GROWTH' | 'MID_SIZED' | 'ENTERPRISE' | 'GOVERNMENT' | 'FAMILY_BUSINESS';

/** Career variant by company stage */
export interface CompanyStageVariant {
  /** Company stage */
  stage: CompanyStage;

  /** How this career differs at this stage */
  differences: StageDifference[];

  /** Work environment at this stage */
  workEnvironment: WorkEnvironmentProfile;

  /** Daily life at this stage */
  dailyLife: DailyLifeProfile;

  /** Satisfaction patterns at this stage */
  satisfaction: SatisfactionProfile;
}

/** Difference at a specific company stage */
export interface StageDifference {
  /** Aspect of the career */
  aspect: string;

  /** How it differs at this stage */
  difference: string;

  /** Magnitude of difference (0-100) */
  magnitude: number;
}

// ============================================================================
// BURNOUT PROFILE
// ============================================================================

/**
 * Burnout risk assessment for a career.
 *
 * Models burnout risk, stress sources, frequency, and recovery potential.
 */
export interface BurnoutProfile {
  /** Overall burnout risk score (0-100, higher = more risk) */
  overallRisk: number;

  /** Risk level category */
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';

  /** Primary stress sources */
  stressSources: StressSource[];

  /** Stress frequency characteristics */
  stressFrequency: StressFrequency;

  /** Recovery potential */
  recoveryPotential: RecoveryPotential;

  /** Burnout prevention factors */
  preventionFactors: PreventionFactor[];

  /** Industry-specific burnout patterns */
  industryPatterns: IndustryBurnoutPattern[];
}

/** Stress source definition */
export interface StressSource {
  /** Source identifier */
  id: string;

  /** Source name */
  name: string;

  /** Description of the stress source */
  description: string;

  /** Impact level (0-100) */
  impact: number;

  /** Frequency of occurrence (0-100) */
  frequency: number;

  /** Controllability (0-100, higher = more controllable) */
  controllability: number;
}

/** Stress frequency characteristics */
export interface StressFrequency {
  /** Daily stress frequency (0-100) */
  daily: number;

  /** Weekly stress frequency (0-100) */
  weekly: number;

  /** Monthly stress frequency (0-100) */
  monthly: number;

  /** Chronic stress level (0-100) */
  chronic: number;

  /** Acute stress episodes frequency (0-100) */
  acuteEpisodes: number;

  /** Crisis situations frequency (0-100) */
  crisisFrequency: number;
}

/** Recovery potential characteristics */
export interface RecoveryPotential {
  /** Overall recovery potential (0-100, higher = better recovery) */
  overallScore: number;

  /** Time to recover from typical stress (days) */
  typicalRecoveryDays: number;

  /** Time to recover from severe stress (days) */
  severeRecoveryDays: number;

  /** Vacation effectiveness (0-100) */
  vacationEffectiveness: number;

  /** Weekend recovery effectiveness (0-100) */
  weekendRecovery: number;

  /** Boundary control (ability to disconnect) (0-100) */
  boundaryControl: number;
}

/** Burnout prevention factor */
export interface PreventionFactor {
  /** Factor name */
  name: string;

  /** Factor description */
  description: string;

  /** Effectiveness (0-100) */
  effectiveness: number;

  /** Availability in this career (0-100) */
  availability: number;
}

/** Industry-specific burnout pattern */
export interface IndustryBurnoutPattern {
  /** Pattern name */
  name: string;

  /** Description */
  description: string;

  /** Typical timeline to burnout (years) */
  typicalTimeline: number;

  /** Warning signs */
  warningSigns: string[];

  /** Common exit points */
  commonExitPoints: string[];
}

// ============================================================================
// CULTURE PROFILE
// ============================================================================

/**
 * Culture characteristics and personality fit.
 *
 * Models who thrives and who struggles in this career.
 */
export interface CultureProfile {
  /** Cultural dimensions */
  dimensions: CulturalDimensions;

  /** Values alignment */
  valuesAlignment: ValuesAlignment;

  /** Social dynamics */
  socialDynamics: SocialDynamics;

  /** Personality fit analysis */
  personalityFit: CareerPersonalityFit;

  /** Cultural archetypes present */
  culturalArchetypes: CulturalArchetype[];
}

/** Cultural dimensions */
export interface CulturalDimensions {
  /** Collaboration vs Individual focus (0-100, higher = more collaborative) */
  collaboration: number;

  /** Innovation vs Stability focus (0-100, higher = more innovative) */
  innovation: number;

  /** Results vs Process focus (0-100, higher = more results-focused) */
  resultsFocus: number;

  /** Speed vs Quality focus (0-100, higher = more speed-focused) */
  speedFocus: number;

  /** Transparency level (0-100) */
  transparency: number;

  /** Psychological safety level (0-100) */
  psychologicalSafety: number;

  /** Feedback culture strength (0-100) */
  feedbackCulture: number;

  /** Learning culture strength (0-100) */
  learningCulture: number;
}

/** Values alignment characteristics */
export interface ValuesAlignment {
  /** Core values in this career */
  coreValues: string[];

  /** Values that align well */
  alignedValues: string[];

  /** Values that conflict */
  conflictingValues: string[];

  /** Ethical considerations */
  ethicalConsiderations: string[];
}

/** Social dynamics characteristics */
export interface SocialDynamics {
  /** Team orientation (0-100) */
  teamOrientation: number;

  /** Social interaction requirements (0-100) */
  socialRequirements: number;

  /** Networking importance (0-100) */
  networkingImportance: number;

  /** Mentorship availability (0-100) */
  mentorshipAvailability: number;

  /** Community strength (0-100) */
  communityStrength: number;

  /** Social events importance (0-100) */
  socialEventsImportance: number;
}

/** Cultural archetype */
export interface CulturalArchetype {
  /** Archetype name */
  name: string;

  /** Description */
  description: string;

  /** Prevalence (0-100) */
  prevalence: number;

  /** Characteristics */
  characteristics: string[];
}

// ============================================================================
// CAREER PERSONALITY FIT
// ============================================================================

/**
 * Personality fit analysis for a career.
 *
 * Models who thrives and who struggles in this career.
 */
export interface CareerPersonalityFit {
  /** Personality types that thrive */
  thrives: PersonalityType[];

  /** Personality types that struggle */
  struggles: PersonalityType[];

  /** Cognitive fit */
  cognitiveFit: CognitiveFit;

  /** Behavioral fit */
  behavioralFit: BehavioralFit;

  /** Motivational fit */
  motivationalFit: MotivationalFit;

  /** Work style fit */
  workStyleFit: WorkStyleFit;
}

/** Personality type with fit analysis */
export interface PersonalityType {
  /** Type identifier */
  type: string;

  /** Type name */
  name: string;

  /** Why this type thrives/struggles */
  reason: string;

  /** Fit score (0-100) */
  fitScore: number;

  /** Success factors for this type */
  successFactors: string[];

  /** Challenges for this type */
  challenges: string[];
}

/** Cognitive fit characteristics */
export interface CognitiveFit {
  /** Analytical thinking requirement (0-100) */
  analytical: number;

  /** Creative thinking requirement (0-100) */
  creative: number;

  /** Practical thinking requirement (0-100) */
  practical: number;

  /** Social thinking requirement (0-100) */
  social: number;

  /** Strategic thinking requirement (0-100) */
  strategic: number;

  /** Detail orientation requirement (0-100) */
  detailOriented: number;
}

/** Behavioral fit characteristics */
export interface BehavioralFit {
  /** Extroversion fit (0-100) */
  extroversion: number;

  /** Conscientiousness fit (0-100) */
  conscientiousness: number;

  /** Openness fit (0-100) */
  openness: number;

  /** Agreeableness fit (0-100) */
  agreeableness: number;

  /** Emotional stability fit (0-100) */
  emotionalStability: number;
}

/** Motivational fit characteristics */
export interface MotivationalFit {
  /** Achievement motivation fit (0-100) */
  achievement: number;

  /** Affiliation motivation fit (0-100) */
  affiliation: number;

  /** Power motivation fit (0-100) */
  power: number;

  /** Autonomy motivation fit (0-100) */
  autonomy: number;

  /** Purpose motivation fit (0-100) */
  purpose: number;

  /** Security motivation fit (0-100) */
  security: number;
}

/** Work style fit characteristics */
export interface WorkStyleFit {
  /** Independence preference fit (0-100) */
  independence: number;

  /** Structure preference fit (0-100) */
  structure: number;

  /** Variety preference fit (0-100) */
  variety: number;

  /** Pace preference fit (0-100) */
  pace: number;

  /** Collaboration preference fit (0-100) */
  collaboration: number;
}

// ============================================================================
// SATISFACTION PROFILE
// ============================================================================

/**
 * Career satisfaction drivers and patterns.
 *
 * Models what drives satisfaction, common frustrations, rewards, and exit reasons.
 */
export interface SatisfactionProfile {
  /** Overall satisfaction score (0-100) */
  overallSatisfaction: number;

  /** Satisfaction drivers */
  drivers: SatisfactionDriver[];

  /** Common frustrations */
  frustrations: Frustration[];

  /** Common rewards */
  rewards: Reward[];

  /** Exit patterns */
  exitPatterns: ExitPattern[];

  /** Long-term fulfillment trajectory */
  fulfillmentTrajectory: FulfillmentTrajectory;
}

/** Satisfaction driver */
export interface SatisfactionDriver {
  /** Driver name */
  name: string;

  /** Driver description */
  description: string;

  /** Importance (0-100) */
  importance: number;

  /** Satisfaction level (0-100) */
  satisfaction: number;

  /** Whether this is a differentiator */
  isDifferentiator: boolean;
}

/** Frustration definition */
export interface Frustration {
  /** Frustration name */
  name: string;

  /** Description */
  description: string;

  /** Frequency (0-100) */
  frequency: number;

  /** Impact on satisfaction (0-100) */
  impact: number;

  /** Whether this is a dealbreaker for some */
  isDealbreaker: boolean;

  /** Mitigation strategies */
  mitigationStrategies: string[];
}

/** Reward definition */
export interface Reward {
  /** Reward name */
  name: string;

  /** Description */
  description: string;

  /** Frequency (0-100) */
  frequency: number;

  /** Impact on satisfaction (0-100) */
  impact: number;

  /** Whether this is a key retention factor */
  isRetentionFactor: boolean;
}

/** Exit pattern */
export interface ExitPattern {
  /** Exit reason category */
  reason: string;

  /** Description */
  description: string;

  /** Frequency (0-100) */
  frequency: number;

  /** Typical career stage when this occurs */
  typicalStage: string;

  /** Destinations after exit */
  destinations: string[];
}

/** Fulfillment trajectory */
export interface FulfillmentTrajectory {
  /** Early career fulfillment (0-100) */
  earlyCareer: number;

  /** Mid career fulfillment (0-100) */
  midCareer: number;

  /** Late career fulfillment (0-100) */
  lateCareer: number;

  /** Trajectory description */
  description: string;

  /** Key inflection points */
  inflectionPoints: InflectionPoint[];
}

/** Inflection point in fulfillment trajectory */
export interface InflectionPoint {
  /** Point name */
  name: string;

  /** Typical timing (years) */
  timing: number;

  /** What happens at this point */
  description: string;

  /** Satisfaction impact */
  satisfactionImpact: 'INCREASE' | 'DECREASE' | 'PLATEAU' | 'VARIABLE';
}

// ============================================================================
// REALITY GAP ANALYSIS
// ============================================================================

/**
 * Reality gap analysis - expectation vs reality.
 *
 * Models the gap between what students expect and what the career actually is.
 */
export interface RealityGapAnalysis {
  /** Overall gap score (0-100, higher = bigger gap) */
  overallGap: number;

  /** Common expectations */
  commonExpectations: Expectation[];

  /** Reality factors */
  realityFactors: RealityFactor[];

  /** Specific gaps */
  gaps: SpecificGap[];

  /** Surprises for newcomers */
  surprises: Surprise[];

  /** Advice for bridging the gap */
  bridgingAdvice: string[];
}

/** Expectation definition */
export interface Expectation {
  /** Expectation description */
  expectation: string;

  /** How common this expectation is (0-100) */
  commonality: number;

  /** Source of expectation (media, education, etc.) */
  source: string;

  /** Whether this expectation is accurate */
  isAccurate: boolean;

  /** Reality if expectation is inaccurate */
  reality?: string;
}

/** Reality factor */
export interface RealityFactor {
  /** Factor name */
  name: string;

  /** Description */
  description: string;

  /** How surprising this is (0-100) */
  surpriseFactor: number;

  /** Impact on career satisfaction (0-100) */
  impact: number;
}

/** Specific gap between expectation and reality */
export interface SpecificGap {
  /** Aspect of the career */
  aspect: string;

  /** Common expectation */
  expectation: string;

  /** Actual reality */
  reality: string;

  /** Gap magnitude (0-100) */
  gapMagnitude: number;

  /** Impact on satisfaction (0-100) */
  satisfactionImpact: number;
}

/** Surprise for newcomers */
export interface Surprise {
  /** What surprises people */
  surprise: string;

  /** Why it's surprising */
  whySurprising: string;

  /** Whether positive or negative */
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'MIXED';

  /** How to prepare for this */
  preparation: string;
}

// ============================================================================
// REALITY EXPLANATIONS
// ============================================================================

/**
 * Reality explanations - what people love, hate, and what nobody tells you.
 */
export interface RealityExplanations {
  /** What people love about this career */
  whatPeopleLove: string[];

  /** What people hate about this career */
  whatPeopleHate: string[];

  /** What surprises people */
  whatSurprises: Surprise[];

  /** What nobody tells you */
  whatNobodyTellsYou: string[];

  /** The real deal - honest summary */
  theRealDeal: string;

  /** Day in the life narrative */
  dayInTheLife: DayInTheLife;

  /** Career reality stories */
  stories: CareerStory[];
}

/** Day in the life narrative */
export interface DayInTheLife {
  /** Narrative description */
  narrative: string;

  /** Hour by hour breakdown */
  hourlyBreakdown: HourlyActivity[];

  /** Typical day variations */
  variations: DayVariation[];
}

/** Hourly activity */
export interface HourlyActivity {
  /** Hour (24h format) */
  hour: number;

  /** Activity description */
  activity: string;

  /** Activity type */
  type: 'DEEP_WORK' | 'MEETING' | 'ADMIN' | 'BREAK' | 'COMMUTE' | 'LEARNING' | 'SOCIAL' | 'REACTIVE';

  /** Energy level required (0-100) */
  energyLevel: number;

  /** Stress level (0-100) */
  stressLevel: number;
}

/** Day variation */
export interface DayVariation {
  /** Variation name */
  name: string;

  /** When this occurs */
  when: string;

  /** How it differs */
  differences: string;
}

/** Career reality story */
export interface CareerStory {
  /** Story title */
  title: string;

  /** Story content */
  content: string;

  /** Storyteller context (years of experience, etc.) */
  context: string;

  /** Key takeaway */
  takeaway: string;
}

// ============================================================================
// ENGINE INPUTS AND OUTPUTS
// ============================================================================

/** Input for generating a career reality profile */
export interface CareerRealityInput {
  /** Career ID */
  careerId: CareerId;

  /** Career title */
  careerTitle: string;

  /** Company stage to model (optional) */
  companyStage?: CompanyStage;

  /** Experience level (optional) */
  experienceLevel?: 'ENTRY' | 'MID' | 'SENIOR' | 'EXECUTIVE';

  /** Geographic context (optional) */
  geography?: string;

  /** Industry context (optional) */
  industry?: string;
}

/** Scoring configuration */
export interface ScoringConfig {
  /** Weight for daily life (0-1) */
  dailyLifeWeight: number;

  /** Weight for work environment (0-1) */
  workEnvironmentWeight: number;

  /** Weight for burnout (0-1) */
  burnoutWeight: number;

  /** Weight for culture (0-1) */
  cultureWeight: number;

  /** Weight for satisfaction (0-1) */
  satisfactionWeight: number;
}

/** Default scoring configuration */
export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  dailyLifeWeight: 0.2,
  workEnvironmentWeight: 0.2,
  burnoutWeight: 0.2,
  cultureWeight: 0.2,
  satisfactionWeight: 0.2,
};

/** Reality profile score */
export interface RealityProfileScore {
  /** Overall reality score (0-100) */
  overall: number;

  /** Daily life score (0-100) */
  dailyLife: number;

  /** Work environment score (0-100) */
  workEnvironment: number;

  /** Burnout risk score (0-100, inverted - higher = better) */
  burnoutResilience: number;

  /** Culture fit score (0-100) */
  culture: number;

  /** Satisfaction potential score (0-100) */
  satisfaction: number;

  /** Reality clarity score (0-100) */
  realityClarity: number;
}

/** Comparison result between two careers */
export interface CareerRealityComparison {
  /** Career A ID */
  careerA: CareerId;

  /** Career B ID */
  careerB: CareerId;

  /** Comparison by dimension */
  dimensions: DimensionComparison[];

  /** Overall similarity (0-100) */
  similarity: number;

  /** Key differences */
  keyDifferences: string[];

  /** Recommendation for who should choose A */
  chooseAIf: string[];

  /** Recommendation for who should choose B */
  chooseBIf: string[];
}

/** Dimension comparison */
export interface DimensionComparison {
  /** Dimension name */
  dimension: string;

  /** Career A score */
  scoreA: number;

  /** Career B score */
  scoreB: number;

  /** Difference (A - B) */
  difference: number;

  /** Winner */
  winner: 'A' | 'B' | 'TIE';

  /** Significance (0-100) */
  significance: number;
}
