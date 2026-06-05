/**
 * CareerOS Optionality Intelligence Engine - Type Definitions
 *
 * Phase D.3: Optionality Intelligence Engine
 *
 * Evaluates future choice preservation after career decisions.
 *
 * @module optionality-types
 * @version 1.0.0
 */

import type { CareerId } from '@/career-intelligence/career-types';

/**
 * Unique identifier for an optionality analysis.
 */
export type OptionalityAnalysisId = string;

/**
 * Complete optionality analysis for a career path.
 */
export interface OptionalityAnalysis {
  /** Unique analysis identifier */
  id: OptionalityAnalysisId;

  /** Student profile identifier */
  profileId: string;

  /** Career being evaluated */
  careerId: CareerId;

  /** Overall optionality score (0-100) */
  overallOptionality: number;

  /** Confidence in this analysis (0-100) */
  confidence: number;

  /** Available future options */
  futureOptions: FutureOptions;

  /** Career flexibility assessment */
  careerFlexibility: CareerFlexibility;

  /** Pivot potential */
  pivotPotential: PivotPotential;

  /** Optionality breakdown by dimension */
  breakdown: OptionalityBreakdown;

  /** Explanation of optionality assessment */
  explanation: OptionalityExplanation;

  /** Analysis timestamp */
  analyzedAt: Date;
}

/**
 * Available future options from this career path.
 */
export interface FutureOptions {
  /** Primary career paths (natural next steps) */
  primaryPaths: FuturePath[];

  /** Alternative career paths (lateral moves) */
  alternativePaths: FuturePath[];

  /** Expansion paths (broader scope moves) */
  expansionPaths: FuturePath[];

  /** Backup paths (if primary doesn't work out) */
  backupPaths: FuturePath[];

  /** Total number of viable future paths */
  totalPathCount: number;

  /** Diversity of available paths */
  pathDiversity: PathDiversity;
}

/**
 * A potential future career path.
 */
export interface FuturePath {
  /** Path identifier */
  id: string;

  /** Target career ID */
  targetCareerId: CareerId;

  /** Path name/title */
  title: string;

  /** Path description */
  description: string;

  /** Type of path */
  type: PathType;

  /** Difficulty of transition (0-100, higher = harder) */
  transitionDifficulty: number;

  /** Estimated time to transition (months) */
  estimatedTransitionTime: number;

  /** Skills required for transition */
  requiredSkills: string[];

  /** Skills already possessed */
  possessedSkills: string[];

  /** Skill gap percentage */
  skillGapPercent: number;

  /** Viability score (0-100) */
  viability: number;
}

/**
 * Types of career paths.
 */
export type PathType =
  | 'PROMOTION' // Natural advancement
  | 'PIVOT' // Lateral move
  | 'EXPANSION' // Broader scope
  | 'SPECIALIZATION' // Deeper expertise
  | 'BACKUP' // Fallback option
  | 'ENTREPRENEURIAL'; // Startup/founder path

/**
 * Diversity of available career paths.
 */
export interface PathDiversity {
  /** Industry diversity score (0-100) */
  industryDiversity: number;

  /** Function diversity score (0-100) */
  functionDiversity: number;

  /** Seniority diversity score (0-100) */
  seniorityDiversity: number;

  /** Geographic diversity score (0-100) */
  geographicDiversity: number;

  /** Overall diversity score (0-100) */
  overall: number;
}

/**
 * Career flexibility assessment.
 */
export interface CareerFlexibility {
  /** Overall flexibility score (0-100) */
  score: number;

  /** Confidence in score (0-100) */
  confidence: number;

  /** Number of accessible future careers */
  accessibleCareerCount: number;

  /** Flexibility by career level */
  byLevel: LevelFlexibility[];

  /** Key flexibility factors */
  factors: FlexibilityFactor[];
}

/**
 * Flexibility at a specific career level.
 */
export interface LevelFlexibility {
  /** Career level */
  level: 'ENTRY' | 'MID' | 'SENIOR' | 'EXECUTIVE';

  /** Flexibility score at this level (0-100) */
  score: number;

  /** Number of viable transitions */
  transitionCount: number;

  /** Common transition types */
  commonTransitions: string[];
}

/**
 * Factor contributing to flexibility.
 */
export interface FlexibilityFactor {
  /** Factor name */
  name: string;

  /** Factor description */
  description: string;

  /** Impact on flexibility (0-100) */
  impact: number;

  /** Direction (positive or negative) */
  direction: 'POSITIVE' | 'NEGATIVE';
}

/**
 * Pivot potential - ease of transitioning to adjacent careers.
 */
export interface PivotPotential {
  /** Overall pivot potential score (0-100) */
  score: number;

  /** Confidence in score (0-100) */
  confidence: number;

  /** Ease of pivot (0-100, higher = easier) */
  pivotEase: number;

  /** Common pivot targets */
  commonPivots: PivotTarget[];

  /** Pivot barriers */
  barriers: PivotBarrier[];
}

/**
 * A potential pivot target.
 */
export interface PivotTarget {
  /** Target career ID */
  careerId: CareerId;

  /** Target career title */
  title: string;

  /** Pivot difficulty (0-100, higher = harder) */
  difficulty: number;

  /** Likelihood of successful pivot (0-100) */
  likelihood: number;

  /** Common transition path */
  transitionPath: string;
}

/**
 * Barrier to pivoting.
 */
export interface PivotBarrier {
  /** Barrier type */
  type: PivotBarrierType;

  /** Barrier description */
  description: string;

  /** Severity (0-100) */
  severity: number;

  /** Whether surmountable */
  isSurmountable: boolean;
}

/**
 * Types of pivot barriers.
 */
export type PivotBarrierType =
  | 'SKILL_GAP'
  | 'CERTIFICATION'
  | 'EXPERIENCE'
  | 'NETWORK'
  | 'REPUTATION'
  | 'INDUSTRY'
  | 'GEOGRAPHIC'
  | 'FINANCIAL';

/**
 * Breakdown of optionality by dimension.
 */
export interface OptionalityBreakdown {
  /** Career flexibility dimension */
  careerFlexibility: DimensionScore;

  /** Pivot potential dimension */
  pivotPotential: DimensionScore;

  /** Transferable skills dimension */
  transferableSkills: DimensionScore;

  /** Industry mobility dimension */
  industryMobility: DimensionScore;

  /** Geographic mobility dimension */
  geographicMobility: DimensionScore;

  /** Entrepreneurial potential dimension */
  entrepreneurialPotential: DimensionScore;
}

/**
 * Score for a single dimension.
 */
export interface DimensionScore {
  /** Score value (0-100) */
  score: number;

  /** Confidence (0-100) */
  confidence: number;

  /** Weight in overall optionality */
  weight: number;

  /** Detailed findings */
  findings: DimensionFinding[];
}

/**
 * Finding for a dimension.
 */
export interface DimensionFinding {
  /** Finding type */
  type: string;

  /** Finding description */
  description: string;

  /** Impact on score */
  impact: number;
}

/**
 * Transferable skills assessment.
 */
export interface TransferableSkillsAssessment {
  /** Overall portability score (0-100) */
  overallPortability: number;

  /** Cognitive skills portability */
  cognitiveSkills: SkillCategoryPortability;

  /** Social skills portability */
  socialSkills: SkillCategoryPortability;

  /** Technical skills portability */
  technicalSkills: SkillCategoryPortability;

  /** Business skills portability */
  businessSkills: SkillCategoryPortability;

  /** Specific transferable skills */
  transferableSkills: TransferableSkill[];
}

/**
 * Portability for a skill category.
 */
export interface SkillCategoryPortability {
  /** Category name */
  category: string;

  /** Portability score (0-100) */
  portability: number;

  /** Key skills in category */
  keySkills: string[];
}

/**
 * A transferable skill.
 */
export interface TransferableSkill {
  /** Skill name */
  name: string;

  /** Transferability score (0-100) */
  transferability: number;

  /** Industries where applicable */
  applicableIndustries: string[];

  /** Careers where applicable */
  applicableCareers: string[];
}

/**
 * Industry mobility assessment.
 */
export interface IndustryMobility {
  /** Overall mobility score (0-100) */
  score: number;

  /** Current industry */
  currentIndustry: string;

  /** Accessible industries */
  accessibleIndustries: AccessibleIndustry[];

  /** Industry transfer barriers */
  barriers: IndustryBarrier[];
}

/**
 * An accessible industry.
 */
export interface AccessibleIndustry {
  /** Industry name */
  industry: string;

  /** Accessibility score (0-100) */
  accessibility: number;

  /** Common transition path */
  transitionPath: string;

  /** Difficulty of transition (0-100) */
  difficulty: number;
}

/**
 * Barrier to industry transfer.
 */
export interface IndustryBarrier {
  /** Barrier type */
  type: string;

  /** Description */
  description: string;

  /** Severity (0-100) */
  severity: number;
}

/**
 * Geographic mobility assessment.
 */
export interface GeographicMobility {
  /** Overall mobility score (0-100) */
  score: number;

  /** Remote work potential (0-100) */
  remotePotential: number;

  /** Global portability (0-100) */
  globalPortability: number;

  /** Location flexibility */
  locationFlexibility: LocationFlexibility;

  /** Geographic constraints */
  constraints: GeographicConstraint[];
}

/**
 * Location flexibility details.
 */
export interface LocationFlexibility {
  /** Can work fully remote */
  canWorkRemote: boolean;

  /** Can work hybrid */
  canWorkHybrid: boolean;

  /** Requires specific location */
  requiresSpecificLocation: boolean;

  /** Requires specific region */
  requiresSpecificRegion: boolean;

  /** Global opportunities available */
  globalOpportunities: boolean;
}

/**
 * Geographic constraint.
 */
export interface GeographicConstraint {
  /** Constraint type */
  type: string;

  /** Description */
  description: string;

  /** Impact on mobility (0-100) */
  impact: number;
}

/**
 * Entrepreneurial potential assessment.
 */
export interface EntrepreneurialPotential {
  /** Overall potential score (0-100) */
  score: number;

  /** Founder fit (0-100) */
  founderFit: number;

  /** Consulting potential (0-100) */
  consultingPotential: number;

  /** Freelance potential (0-100) */
  freelancePotential: number;

  /** Startup opportunities */
  startupOpportunities: StartupOpportunity[];

  /** Entrepreneurial barriers */
  barriers: EntrepreneurialBarrier[];
}

/**
 * Startup opportunity.
 */
export interface StartupOpportunity {
  /** Opportunity type */
  type: string;

  /** Description */
  description: string;

  /** Viability (0-100) */
  viability: number;

  /** Required resources */
  requiredResources: string[];
}

/**
 * Barrier to entrepreneurship.
 */
export interface EntrepreneurialBarrier {
  /** Barrier type */
  type: string;

  /** Description */
  description: string;

  /** Severity (0-100) */
  severity: number;
}

/**
 * Explanation of optionality assessment.
 */
export interface OptionalityExplanation {
  /** Summary of optionality */
  summary: string;

  /** What options remain open */
  optionsOpen: string[];

  /** What options become harder */
  optionsHarder: string[];

  /** What options become easier */
  optionsEasier: string[];

  /** Key insights */
  insights: string[];

  /** Strategic recommendations */
  recommendations: string[];
}

/**
 * Input for optionality analysis.
 */
export interface OptionalityAnalysisInput {
  /** Analysis identifier */
  analysisId: OptionalityAnalysisId;

  /** Student profile identifier */
  profileId: string;

  /** Career identifier */
  careerId: CareerId;

  /** Analysis context */
  context?: OptionalityContext;
}

/**
 * Context for optionality analysis.
 */
export interface OptionalityContext {
  /** Time horizon for evaluation (years) */
  timeHorizon: number;

  /** Priority on flexibility vs specialization (0-100) */
  flexibilityPreference: number;

  /** Geographic constraints */
  geographicConstraints?: string[];

  /** Industry preferences */
  industryPreferences?: string[];

  /** Minimum optionality threshold */
  minOptionalityThreshold?: number;
}

/**
 * Configuration for optionality intelligence engine.
 */
export interface OptionalityIntelligenceConfig {
  /** Minimum confidence threshold (0-100) */
  minConfidenceThreshold: number;

  /** Default time horizon (years) */
  defaultTimeHorizon: number;

  /** Dimension weights */
  dimensionWeights: OptionalityDimensionWeights;

  /** Whether to include detailed path analysis */
  enablePathAnalysis: boolean;

  /** Maximum paths to analyze per category */
  maxPathsPerCategory: number;
}

/**
 * Weights for optionality dimensions.
 */
export interface OptionalityDimensionWeights {
  /** Career flexibility weight */
  careerFlexibility: number;

  /** Pivot potential weight */
  pivotPotential: number;

  /** Transferable skills weight */
  transferableSkills: number;

  /** Industry mobility weight */
  industryMobility: number;

  /** Geographic mobility weight */
  geographicMobility: number;

  /** Entrepreneurial potential weight */
  entrepreneurialPotential: number;
}

/**
 * Default dimension weights.
 */
export const DEFAULT_DIMENSION_WEIGHTS: OptionalityDimensionWeights = {
  careerFlexibility: 0.25,
  pivotPotential: 0.2,
  transferableSkills: 0.2,
  industryMobility: 0.15,
  geographicMobility: 0.1,
  entrepreneurialPotential: 0.1,
};

/**
 * Default optionality intelligence configuration.
 */
export const DEFAULT_OPTIONALITY_INTELLIGENCE_CONFIG: OptionalityIntelligenceConfig = {
  minConfidenceThreshold: 50,
  defaultTimeHorizon: 10,
  dimensionWeights: DEFAULT_DIMENSION_WEIGHTS,
  enablePathAnalysis: true,
  maxPathsPerCategory: 5,
};

/**
 * Result of optionality calculation.
 */
export interface OptionalityCalculationResult {
  /** Overall optionality score */
  overallOptionality: number;

  /** Dimension scores */
  dimensions: Record<string, number>;

  /** Calculation confidence */
  confidence: number;

  /** Calculation timestamp */
  calculatedAt: Date;
}

/**
 * Error types for optionality intelligence operations.
 */
export type OptionalityIntelligenceError =
  | 'INVALID_INPUT'
  | 'PROFILE_NOT_FOUND'
  | 'CAREER_NOT_FOUND'
  | 'INSUFFICIENT_DATA'
  | 'CONFIDENCE_TOO_LOW';

/**
 * Result of optionality intelligence operation.
 */
export interface OptionalityIntelligenceResult<T> {
  /** Whether operation succeeded */
  success: boolean;

  /** Result data (if successful) */
  data?: T;

  /** Error type (if failed) */
  error?: OptionalityIntelligenceError;

  /** Error message (if failed) */
  errorMessage?: string;

  /** Operation timestamp */
  timestamp: Date;
}

/**
 * Comparison of optionality between careers.
 */
export interface OptionalityComparison {
  /** Comparison identifier */
  comparisonId: string;

  /** Careers compared */
  careerIds: CareerId[];

  /** Optionality analyses */
  analyses: Record<CareerId, OptionalityAnalysis>;

  /** Ranked by overall optionality (highest first) */
  rankings: OptionalityRanking[];

  /** Dimension-by-dimension comparison */
  dimensionComparison: DimensionComparison[];

  /** Best career for each dimension */
  bestByDimension: Record<string, CareerId>;

  /** Comparison timestamp */
  comparedAt: Date;
}

/**
 * Ranking of a career by optionality.
 */
export interface OptionalityRanking {
  /** Rank (1 = highest) */
  rank: number;

  /** Career ID */
  careerId: CareerId;

  /** Overall optionality score */
  optionalityScore: number;

  /** Strengths relative to others */
  relativeStrengths: string[];

  /** Weaknesses relative to others */
  relativeWeaknesses: string[];
}

/**
 * Comparison of a single dimension.
 */
export interface DimensionComparison {
  /** Dimension name */
  dimension: string;

  /** Scores by career */
  scores: Record<CareerId, number>;

  /** Best career for this dimension */
  bestCareer: CareerId;

  /** Variance across careers */
  variance: number;
}
