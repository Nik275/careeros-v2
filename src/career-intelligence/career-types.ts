/**
 * CareerOS Career Intelligence Engine - Type Definitions
 *
 * Phase C.1: Career Intelligence Engine
 *
 * Structured intelligence model for careers as complex systems.
 *
 * @module career-types
 * @version 1.0.0
 */

/**
 * Unique identifier for a career.
 */
export type CareerId = string;

/**
 * Complete career intelligence model.
 */
export interface CareerIntelligence {
  /** Unique career identifier */
  careerId: CareerId;

  /** Career title */
  careerTitle: string;

  /** Brief career summary */
  careerSummary: string;

  /** Cognitive demands of the career */
  cognitiveDemands: CareerCognitiveDemands;

  /** Motivational demands of the career */
  motivationalDemands: CareerMotivationalDemands;

  /** Lifestyle characteristics */
  lifestyleCharacteristics: CareerLifestyleCharacteristics;

  /** Work environment characteristics */
  workEnvironment: CareerWorkEnvironment;

  /** Career risks */
  careerRisks: CareerRisks;

  /** Career advantages */
  careerAdvantages: CareerAdvantages;

  /** Evidence supporting this intelligence */
  evidence: CareerEvidence;

  /** Generated insights about this career */
  insights?: CareerInsights;

  /** Metadata */
  metadata: CareerMetadata;
}

/**
 * Cognitive demands required by a career.
 */
export interface CareerCognitiveDemands {
  /** Analytical thinking demand (0-100) */
  analyticalDemand: ScoredDimension;

  /** Creative thinking demand (0-100) */
  creativeDemand: ScoredDimension;

  /** Systematic processing demand (0-100) */
  systematicDemand: ScoredDimension;

  /** Verbal communication demand (0-100) */
  verbalDemand: ScoredDimension;

  /** Spatial reasoning demand (0-100) */
  spatialDemand: ScoredDimension;

  /** Quantitative reasoning demand (0-100) */
  quantitativeDemand: ScoredDimension;
}

/**
 * Motivational demands required by a career.
 */
export interface CareerMotivationalDemands {
  /** Achievement drive demand (0-100) */
  achievementDemand: ScoredDimension;

  /** Mastery/learning demand (0-100) */
  masteryDemand: ScoredDimension;

  /** Autonomy demand (0-100) */
  autonomyDemand: ScoredDimension;

  /** Impact/meaning demand (0-100) */
  impactDemand: ScoredDimension;

  /** Recognition demand (0-100) */
  recognitionDemand: ScoredDimension;

  /** Security/stability demand (0-100) */
  securityDemand: ScoredDimension;
}

/**
 * Lifestyle characteristics of a career.
 */
export interface CareerLifestyleCharacteristics {
  /** Income potential (0-100) */
  incomePotential: ScoredDimension;

  /** Work-life balance level (0-100) */
  workLifeBalance: ScoredDimension;

  /** Location flexibility (0-100) */
  locationFlexibility: ScoredDimension;

  /** Travel requirement level (0-100) */
  travelRequirement: ScoredDimension;

  /** Stability level (0-100) */
  stabilityLevel: ScoredDimension;
}

/**
 * Work environment characteristics of a career.
 */
export interface CareerWorkEnvironment {
  /** People interaction intensity (0-100) */
  peopleIntensity: ScoredDimension;

  /** Independence level (0-100) */
  independenceLevel: ScoredDimension;

  /** Leadership opportunity level (0-100) */
  leadershipOpportunity: ScoredDimension;

  /** Research intensity (0-100) */
  researchIntensity: ScoredDimension;

  /** Execution intensity (0-100) */
  executionIntensity: ScoredDimension;
}

/**
 * Career risks and challenges.
 */
export interface CareerRisks {
  /** Automation risk level (0-100) */
  automationRisk: ScoredDimension;

  /** Competition risk level (0-100) */
  competitionRisk: ScoredDimension;

  /** Burnout risk level (0-100) */
  burnoutRisk: ScoredDimension;

  /** Education barrier level (0-100) */
  educationBarrier: ScoredDimension;
}

/**
 * Career advantages and opportunities.
 */
export interface CareerAdvantages {
  /** Future relevance score (0-100) */
  futureRelevance: ScoredDimension;

  /** Career optionality score (0-100) */
  optionality: ScoredDimension;

  /** Career mobility score (0-100) */
  careerMobility: ScoredDimension;

  /** Skill transferability score (0-100) */
  transferability: ScoredDimension;
}

/**
 * A scored dimension with evidence.
 */
export interface ScoredDimension {
  /** Score value (0-100) */
  score: number;

  /** Confidence in this score (0-100) */
  confidence: number;

  /** Evidence sources for this score */
  evidence: DimensionEvidence[];

  /** Last updated timestamp */
  lastUpdated: Date;
}

/**
 * Evidence for a dimension score.
 */
export interface DimensionEvidence {
  /** Evidence source type */
  sourceType: EvidenceSourceType;

  /** Source identifier or description */
  source: string;

  /** Evidence description */
  description: string;

  /** Evidence weight (0-1) */
  weight: number;

  /** Evidence date */
  date: Date;
}

/**
 * Types of evidence sources.
 */
export type EvidenceSourceType =
  | 'OCCUPATIONAL_DATA'
  | 'LABOR_STATISTICS'
  | 'INDUSTRY_REPORT'
  | 'PROFESSIONAL_SURVEY'
  | 'JOB_ANALYSIS'
  | 'EXPERT_ASSESSMENT'
  | 'SKILL_TAXONOMY'
  | 'EDUCATION_DATA'
  | 'MARKET_RESEARCH';

/**
 * Career evidence summary.
 */
export interface CareerEvidence {
  /** Overall confidence score (0-100) */
  overallConfidence: number;

  /** Number of evidence sources */
  sourceCount: number;

  /** Primary evidence sources */
  primarySources: string[];

  /** Evidence quality score (0-100) */
  evidenceQuality: number;

  /** Data freshness score (0-100) */
  dataFreshness: number;
}

/**
 * Career metadata.
 */
export interface CareerMetadata {
  /** Career category/taxonomy */
  category: string;

  /** Industry sector */
  industry: string;

  /** Required education level */
  educationLevel: EducationLevel;

  /** Experience level */
  experienceLevel: ExperienceLevel;

  /** Creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;

  /** Version of intelligence model */
  version: string;
}

/**
 * Education level requirements.
 */
export type EducationLevel =
  | 'NONE'
  | 'HIGH_SCHOOL'
  | 'ASSOCIATE'
  | 'BACHELOR'
  | 'MASTER'
  | 'DOCTORAL'
  | 'PROFESSIONAL';

/**
 * Experience level categories.
 */
export type ExperienceLevel =
  | 'ENTRY'
  | 'JUNIOR'
  | 'MID'
  | 'SENIOR'
  | 'EXPERT';

/**
 * Career insights generated from intelligence.
 */
export interface CareerInsights {
  /** Who thrives in this career */
  whoThrives: InsightStatement;

  /** Who struggles in this career */
  whoStruggles: InsightStatement;

  /** Common misconceptions */
  misconceptions: Misconception[];

  /** Major tradeoffs */
  tradeoffs: Tradeoff[];

  /** Long-term opportunities */
  longTermOpportunities: Opportunity[];

  /** Success factors */
  successFactors: string[];

  /** Warning signs */
  warningSigns: string[];
}

/**
 * Insight statement about who fits a career.
 */
export interface InsightStatement {
  /** Summary statement */
  summary: string;

  /** Detailed explanation */
  explanation: string;

  /** Key matching dimensions */
  keyDimensions: string[];

  /** Confidence in this insight */
  confidence: number;
}

/**
 * Common misconception about a career.
 */
export interface Misconception {
  /** Misconception statement */
  misconception: string;

  /** Reality/clarification */
  reality: string;

  /** Why this misconception exists */
  origin: string;

  /** Impact of misconception */
  impact: string;
}

/**
 * Career tradeoff.
 */
export interface Tradeoff {
  /** Tradeoff name */
  name: string;

  /** Description of the tradeoff */
  description: string;

  /** What you gain */
  gain: string;

  /** What you give up */
  sacrifice: string;

  /** Who should accept this tradeoff */
  forWhom: string;

  /** Who should avoid this tradeoff */
  avoidIf: string;
}

/**
 * Long-term career opportunity.
 */
export interface Opportunity {
  /** Opportunity name */
  name: string;

  /** Description */
  description: string;

  /** Timeline (years) */
  timeline: string;

  /** Requirements to access */
  requirements: string[];

  /** Probability of access (0-100) */
  probability: number;
}

/**
 * Career analysis result.
 */
export interface CareerAnalysis {
  /** Career being analyzed */
  careerId: CareerId;

  /** Analysis timestamp */
  analyzedAt: Date;

  /** Primary career profile */
  primaryProfile: CareerProfileSummary;

  /** Secondary characteristics */
  secondaryCharacteristics: string[];

  /** Career difficulty assessment */
  difficulty: CareerDifficulty;

  /** Market outlook */
  marketOutlook: MarketOutlook;
}

/**
 * Career profile summary.
 */
export interface CareerProfileSummary {
  /** Dominant cognitive demand */
  dominantCognitive: string;

  /** Dominant motivational demand */
  dominantMotivational: string;

  /** Work environment type */
  environmentType: string;

  /** Risk level */
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';

  /** Reward level */
  rewardLevel: 'LOW' | 'MODERATE' | 'HIGH';
}

/**
 * Career difficulty assessment.
 */
export interface CareerDifficulty {
  /** Overall difficulty score (0-100) */
  overallScore: number;

  /** Entry barrier difficulty */
  entryBarrier: number;

  /** Skill acquisition difficulty */
  skillAcquisition: number;

  /** Competition level */
  competition: number;

  /** Stress level */
  stressLevel: number;
}

/**
 * Market outlook for career.
 */
export interface MarketOutlook {
  /** Growth outlook */
  growthOutlook: 'DECLINING' | 'STABLE' | 'GROWING' | 'RAPIDLY_GROWING';

  /** Job market saturation */
  marketSaturation: 'UNDERSUPPLIED' | 'BALANCED' | 'OVERSUPPLIED';

  /** Geographic demand */
  geographicDemand: 'LOCAL' | 'REGIONAL' | 'NATIONAL' | 'GLOBAL';

  /** Future relevance score (0-100) */
  futureRelevance: number;
}

/**
 * Career comparison result.
 */
export interface CareerComparison {
  /** Careers being compared */
  careers: CareerId[];

  /** Comparison dimensions */
  dimensions: DimensionComparison[];

  /** Overall similarity score (0-100) */
  similarityScore: number;

  /** Key differences */
  keyDifferences: string[];

  /** Commonalities */
  commonalities: string[];
}

/**
 * Comparison of a single dimension across careers.
 */
export interface DimensionComparison {
  /** Dimension name */
  dimension: string;

  /** Scores by career */
  scores: Record<CareerId, number>;

  /** Variance across careers */
  variance: number;

  /** Most similar careers */
  mostSimilar: CareerId[];

  /** Most different careers */
  mostDifferent: CareerId[];
}

/**
 * Career intelligence configuration.
 */
export interface CareerIntelligenceConfig {
  /** Minimum confidence threshold */
  minConfidenceThreshold: number;

  /** Minimum evidence sources required */
  minEvidenceSources: number;

  /** Maximum age of data (days) */
  maxDataAgeDays: number;

  /** Enable insight generation */
  enableInsights: boolean;

  /** Enable evidence tracking */
  enableEvidenceTracking: boolean;
}

/**
 * Default career intelligence configuration.
 */
export const DEFAULT_CAREER_INTELLIGENCE_CONFIG: CareerIntelligenceConfig = {
  minConfidenceThreshold: 60,
  minEvidenceSources: 2,
  maxDataAgeDays: 365,
  enableInsights: true,
  enableEvidenceTracking: true,
};

/**
 * Career intelligence query.
 */
export interface CareerIntelligenceQuery {
  /** Career IDs to query */
  careerIds?: CareerId[];

  /** Filter by category */
  category?: string;

  /** Filter by industry */
  industry?: string;

  /** Filter by education level */
  educationLevel?: EducationLevel;

  /** Minimum confidence threshold */
  minConfidence?: number;

  /** Include insights */
  includeInsights?: boolean;
}

/**
 * Career intelligence result set.
 */
export interface CareerIntelligenceResult {
  /** Matching careers */
  careers: CareerIntelligence[];

  /** Total count (before pagination) */
  totalCount: number;

  /** Query metadata */
  query: CareerIntelligenceQuery;

  /** Result timestamp */
  generatedAt: Date;
}
