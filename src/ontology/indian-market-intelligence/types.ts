/**
 * Indian Market Intelligence Ontology V1
 *
 * Foundational data model for self-updating Indian labor market intelligence.
 *
 * Tracks:
 *   - Careers
 *   - Skills
 *   - Industries
 *   - Regions
 *   - Exams
 *   - Education Paths
 *
 * Design Principles:
 *   - Strong TypeScript typing
 *   - Future-proof for continuous updates
 *   - Compatible with Career Ontology, Knowledge Graph, Decision Intelligence, Outcome Learning
 *   - No APIs (yet) - ontology only
 *   - No scraping (yet) - foundation only
 *
 * Compatible Systems:
 *   - Career Ontology V2
 *   - Knowledge Graph
 *   - Decision Intelligence Engine
 *   - Outcome Learning System
 *
 * @module indian-market-intelligence
 */

/** Entity ID type */
export type EntityId = string;

/** Timestamp type (Unix milliseconds) */
export type Timestamp = number;

// ============================================================================
// MARKET SIGNAL TYPES
// ============================================================================

/**
 * Types of market signals that can be tracked.
 */
export const SIGNAL_TYPES = [
  'demand',
  'salary',
  'competition',
  'growth',
  'automationRisk',
  'skillDemand',
  'examDifficulty',
  'regionalOpportunity',
] as const;

/** Signal type identifier */
export type SignalType = (typeof SIGNAL_TYPES)[number];

/**
 * Human-readable labels for signal types.
 */
export const SIGNAL_TYPE_LABELS: Record<SignalType, string> = {
  demand: 'Market Demand',
  salary: 'Salary Trends',
  competition: 'Competition Level',
  growth: 'Growth Trajectory',
  automationRisk: 'Automation Risk',
  skillDemand: 'Skill Demand',
  examDifficulty: 'Exam Difficulty',
  regionalOpportunity: 'Regional Opportunity',
};

/**
 * Source types for market signals.
 */
export const SIGNAL_SOURCE_TYPES = [
  'government-data',
  'job-portal',
  'industry-report',
  'academic-research',
  'news-media',
  'expert-interview',
  'historical-trend',
  'ml-prediction',
  'manual-entry',
  'api-integration',
] as const;

/** Signal source type */
export type SignalSourceType = (typeof SIGNAL_SOURCE_TYPES)[number];

// ============================================================================
// MARKET SIGNAL
// ============================================================================

/**
 * A single market signal measurement.
 *
 * Signals are the atomic unit of market intelligence. They represent
 * a measurement of some market attribute at a specific point in time.
 */
export interface MarketSignal {
  /** Unique identifier for this signal */
  id: string;

  /** Type of signal being measured */
  signalType: SignalType;

  /** Signal value (0.0 - 1.0 normalized scale) */
  value: number;

  /** Confidence in this signal (0.0 - 1.0) */
  confidence: number;

  /** When this signal was recorded */
  timestamp: Timestamp;

  /** Source type of this signal */
  sourceType: SignalSourceType;

  /** Optional notes or context */
  notes?: string;

  /** Entity this signal applies to */
  entityId: EntityId;

  /** Entity type (career, skill, industry, region, exam) */
  entityType: MarketEntityType;
}

// ============================================================================
// MARKET ENTITY BASE
// ============================================================================

/**
 * Types of market-tracked entities.
 */
export const MARKET_ENTITY_TYPES = [
  'career',
  'skill',
  'industry',
  'region',
  'exam',
  'education-path',
] as const;

/** Market entity type */
export type MarketEntityType = (typeof MARKET_ENTITY_TYPES)[number];

/**
 * Base interface for all market-tracked entities.
 *
 * All market entities share common metadata and signal tracking capabilities.
 */
export interface MarketEntity {
  /** Unique identifier */
  id: EntityId;

  /** Entity type */
  type: MarketEntityType;

  /** Display name */
  name: string;

  /** Optional description */
  description?: string;

  /** When this entity was first tracked */
  createdAt: Timestamp;

  /** When this entity was last updated */
  updatedAt: Timestamp;

  /** Current market signals for this entity */
  signals: MarketSignal[];

  /** Historical signal timeline */
  signalHistory: MarketSignal[];

  /** Data quality metrics */
  dataQuality: DataQualityMetrics;

  /** Version for tracking updates */
  version: number;
}

/**
 * Data quality metrics for market entities.
 */
export interface DataQualityMetrics {
  /** Overall confidence score (0.0 - 1.0) */
  confidence: number;

  /** Data freshness score (0.0 - 1.0) */
  freshness: number;

  /** Number of signal sources */
  sourceCount: number;

  /** Last verified timestamp */
  lastVerifiedAt: Timestamp;

  /** Data gaps or concerns */
  gaps?: string[];
}

// ============================================================================
// CAREER MARKET PROFILE
// ============================================================================

/**
 * Market profile for a specific career.
 *
 * Tracks comprehensive market metrics for career decision-making.
 */
export interface CareerMarketProfile extends MarketEntity {
  type: 'career';

  /** Career slug/identifier from Career Ontology */
  careerSlug: string;

  /** Market demand score (0.0 - 1.0) */
  demandScore: number;

  /** Salary growth trajectory score (0.0 - 1.0) */
  salaryGrowthScore: number;

  /** Competition level score (0.0 - 1.0, higher = more competitive) */
  competitionScore: number;

  /** Future demand prediction (0.0 - 1.0) */
  futureDemandScore: number;

  /** Automation risk score (0.0 - 1.0, higher = more risk) */
  automationRiskScore: number;

  /** Overall opportunity score (composite) */
  opportunityScore: number;

  /** Required skills with demand scores */
  requiredSkills: Array<{
    skillId: EntityId;
    skillName: string;
    demandScore: number;
    isCritical: boolean;
  }>;

  /** Related industries */
  industries: EntityId[];

  /** Top hiring regions */
  topRegions: Array<{
    regionId: EntityId;
    regionName: string;
    opportunityScore: number;
  }>;

  /** Entry path difficulty */
  entryDifficulty: number;

  /** Career stage information */
  careerStages: CareerStageInfo[];
}

/**
 * Information about a career stage.
 */
export interface CareerStageInfo {
  /** Stage name (e.g., "Entry", "Mid", "Senior") */
  name: string;

  /** Years of experience typically required */
  yearsExperience: number;

  /** Salary range (LPA - Lakhs Per Annum) */
  salaryRange: {
    min: number;
    max: number;
    median: number;
  };

  /** Demand level at this stage */
  demandLevel: number;
}

// ============================================================================
// SKILL MARKET PROFILE
// ============================================================================

/**
 * Market profile for a specific skill.
 */
export interface SkillMarketProfile extends MarketEntity {
  type: 'skill';

  /** Skill identifier */
  skillId: string;

  /** Skill category */
  category: SkillCategory;

  /** Current demand level (0.0 - 1.0) */
  skillDemand: number;

  /** Growth rate (monthly, -1.0 to 1.0) */
  growthRate: number;

  /** Scarcity level (0.0 - 1.0, higher = more scarce) */
  scarcity: number;

  /** Future relevance prediction (0.0 - 1.0) */
  futureRelevance: number;

  /** AI/automation resistance (0.0 - 1.0, higher = more resistant) */
  aiResistance: number;

  /** Careers that require this skill */
  requiredByCareers: Array<{
    careerId: EntityId;
    careerName: string;
    importance: number;
  }>;

  /** Related skills */
  relatedSkills: EntityId[];

  /** Learning resources available */
  learningResources?: Array<{
    type: string;
    name: string;
    url?: string;
  }>;
}

/**
 * Skill categories.
 */
export const SKILL_CATEGORIES = [
  'technical',
  'soft',
  'domain',
  'tool',
  'language',
  'certification',
] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

// ============================================================================
// INDUSTRY MARKET PROFILE
// ============================================================================

/**
 * Market profile for a specific industry.
 */
export interface IndustryMarketProfile extends MarketEntity {
  type: 'industry';

  /** Industry identifier */
  industryId: string;

  /** Industry growth rate (annual, -1.0 to 1.0) */
  industryGrowth: number;

  /** Current hiring demand (0.0 - 1.0) */
  hiringDemand: number;

  /** Investment activity level (0.0 - 1.0) */
  investmentActivity: number;

  /** Overall talent demand (0.0 - 1.0) */
  talentDemand: number;

  /** Top hiring companies */
  topCompanies?: string[];

  /** Key growth drivers */
  growthDrivers?: string[];

  /** Challenges facing the industry */
  challenges?: string[];

  /** Related industries */
  relatedIndustries: EntityId[];

  /** Top careers in this industry */
  topCareers: Array<{
    careerId: EntityId;
    careerName: string;
    demandLevel: number;
  }>;
}

// ============================================================================
// REGION MARKET PROFILE
// ============================================================================

/**
 * Indian regions tracked by the system.
 */
export const INDIAN_REGIONS = [
  'bangalore',
  'hyderabad',
  'pune',
  'mumbai',
  'delhi-ncr',
  'chennai',
  'ahmedabad',
  'tier-2-cities',
] as const;

/** Indian region identifier */
export type IndianRegionId = (typeof INDIAN_REGIONS)[number];

/**
 * Display names for Indian regions.
 */
export const REGION_DISPLAY_NAMES: Record<IndianRegionId, string> = {
  bangalore: 'Bangalore (Bengaluru)',
  hyderabad: 'Hyderabad',
  pune: 'Pune',
  mumbai: 'Mumbai',
  'delhi-ncr': 'Delhi NCR',
  chennai: 'Chennai',
  ahmedabad: 'Ahmedabad',
  'tier-2-cities': 'Tier-2 Cities',
};

/**
 * Market profile for a specific Indian region.
 */
export interface RegionMarketProfile extends MarketEntity {
  type: 'region';

  /** Region identifier */
  regionId: IndianRegionId;

  /** Job availability score (0.0 - 1.0) */
  jobAvailability: number;

  /** Salary index relative to national average (1.0 = average) */
  salaryIndex: number;

  /** Startup activity level (0.0 - 1.0) */
  startupActivity: number;

  /** Remote work availability (0.0 - 1.0) */
  remoteWorkAvailability: number;

  /** Cost of living index (relative, 1.0 = national average) */
  costOfLivingIndex: number;

  /** Quality of life score (0.0 - 1.0) */
  qualityOfLifeScore: number;

  /** Top industries in this region */
  topIndustries: Array<{
    industryId: EntityId;
    industryName: string;
    strength: number;
  }>;

  /** Top careers in this region */
  topCareers: Array<{
    careerId: EntityId;
    careerName: string;
    opportunityScore: number;
  }>;

  /** Infrastructure quality */
  infrastructureScore: number;
}

// ============================================================================
// EXAM MARKET PROFILE
// ============================================================================

/**
 * Indian competitive exams tracked by the system.
 */
export const INDIAN_EXAMS = [
  'jee',
  'neet',
  'upsc',
  'cat',
  'gate',
  'clat',
  'ca',
] as const;

/** Indian exam identifier */
export type IndianExamId = (typeof INDIAN_EXAMS)[number];

/**
 * Display names for Indian exams.
 */
export const EXAM_DISPLAY_NAMES: Record<IndianExamId, string> = {
  jee: 'JEE (Joint Entrance Examination)',
  neet: 'NEET (National Eligibility cum Entrance Test)',
  upsc: 'UPSC (Union Public Service Commission)',
  cat: 'CAT (Common Admission Test)',
  gate: 'GATE (Graduate Aptitude Test in Engineering)',
  clat: 'CLAT (Common Law Admission Test)',
  ca: 'CA (Chartered Accountancy)',
};

/**
 * Market profile for a specific Indian competitive exam.
 */
export interface ExamMarketProfile extends MarketEntity {
  type: 'exam';

  /** Exam identifier */
  examId: IndianExamId;

  /** Competition level (0.0 - 1.0, higher = more competitive) */
  competitionLevel: number;

  /** Number of seats available (approximate) */
  seatsAvailable: number;

  /** Acceptance rate (0.0 - 1.0) */
  acceptanceRate: number;

  /** Trend direction */
  trendDirection: 'increasing' | 'stable' | 'decreasing';

  /** Difficulty score (0.0 - 1.0) */
  difficultyScore: number;

  /** Preparation time typically required (months) */
  typicalPreparationMonths: number;

  /** Average attempts before success */
  averageAttempts: number;

  /** Career outcomes after clearing */
  careerOutcomes: Array<{
    careerId: EntityId;
    careerName: string;
    probability: number;
  }>;

  /** Alternative paths if not cleared */
  alternativePaths: Array<{
    pathName: string;
    description: string;
  }>;
}

// ============================================================================
// EDUCATION PATH MARKET PROFILE
// ============================================================================

/**
 * Market profile for an education path.
 */
export interface EducationPathMarketProfile extends MarketEntity {
  type: 'education-path';

  /** Path identifier */
  pathId: string;

  /** Path name */
  pathName: string;

  /** Entry requirements */
  entryRequirements: string[];

  /** Duration in years */
  durationYears: number;

  /** Approximate cost (in INR lakhs) */
  approximateCost: number;

  /** ROI score (0.0 - 1.0) */
  roiScore: number;

  /** Placement rate (0.0 - 1.0) */
  placementRate: number;

  /** Average starting salary (LPA) */
  averageStartingSalary: number;

  /** Top recruiting companies */
  topRecruiters: string[];

  /** Leads to careers */
  leadsToCareers: Array<{
    careerId: EntityId;
    careerName: string;
    percentage: number;
  }>;

  /** Required exams */
  requiredExams: IndianExamId[];
}

// ============================================================================
// MARKET AGGREGATES
// ============================================================================

/**
 * Aggregated market snapshot across all entities.
 */
export interface MarketSnapshot {
  /** Snapshot identifier */
  id: string;

  /** When snapshot was taken */
  timestamp: Timestamp;

  /** Overall market health (0.0 - 1.0) */
  overallHealth: number;

  /** Top performing careers */
  topCareers: Array<{
    careerId: EntityId;
    careerName: string;
    opportunityScore: number;
  }>;

  /** Top in-demand skills */
  topSkills: Array<{
    skillId: EntityId;
    skillName: string;
    demandScore: number;
  }>;

  /** Fastest growing industries */
  growingIndustries: Array<{
    industryId: EntityId;
    industryName: string;
    growthRate: number;
  }>;

  /** Best regions for opportunities */
  topRegions: Array<{
    regionId: EntityId;
    regionName: string;
    opportunityScore: number;
  }>;

  /** Market trends summary */
  trendsSummary: string;

  /** Notable changes since last snapshot */
  notableChanges: string[];
}

// ============================================================================
// UPDATE METADATA
// ============================================================================

/**
 * Metadata about a market data update.
 */
export interface MarketUpdateMetadata {
  /** Update identifier */
  id: string;

  /** What was updated */
  entityType: MarketEntityType;

  /** Entity identifier */
  entityId: EntityId;

  /** When update occurred */
  updatedAt: Timestamp;

  /** Source of update */
  source: SignalSourceType;

  /** Confidence in update */
  confidence: number;

  /** What changed */
  changes: Array<{
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }>;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Configuration for Indian Market Intelligence.
 */
export interface IndianMarketIntelligenceConfig {
  /** Minimum confidence threshold for signals */
  minSignalConfidence: number;

  /** Maximum signal age before considered stale (days) */
  maxSignalAgeDays: number;

  /** Aggregation window for signals (days) */
  aggregationWindowDays: number;

  /** Whether to enable automatic updates */
  enableAutoUpdate: boolean;

  /** Update frequency (hours) */
  updateFrequencyHours: number;

  /** Data sources to prioritize */
  prioritizedSources: SignalSourceType[];
}

/** Default configuration */
export const DEFAULT_MARKET_INTELLIGENCE_CONFIG: IndianMarketIntelligenceConfig = {
  minSignalConfidence: 0.6,
  maxSignalAgeDays: 90,
  aggregationWindowDays: 30,
  enableAutoUpdate: false, // Manual updates until auto system built
  updateFrequencyHours: 168, // Weekly
  prioritizedSources: [
    'government-data',
    'industry-report',
    'job-portal',
    'academic-research',
  ],
};
