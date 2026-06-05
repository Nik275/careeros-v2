/**
 * Career Path Intelligence - Types
 * 
 * Comprehensive type system for modeling career pathways including:
 * - Path discovery and generation
 * - Milestone tracking
 * - Alternative paths (Plan B/C/D)
 * - Failure recovery mechanisms
 * - Path comparison metrics
 * - Optionality and flexibility scoring
 * 
 * @module intelligence/career-path-intelligence
 */

// =============================================================================
// CORE ENUMS
// =============================================================================

/**
 * Types of career paths
 */
export enum PathType {
  DIRECT = 'DIRECT',
  INDIRECT = 'INDIRECT',
  NON_TRADITIONAL = 'NON_TRADITIONAL',
  ENTREPRENEURIAL = 'ENTREPRENEURIAL',
  ACADEMIC = 'ACADEMIC',
  CORPORATE = 'CORPORATE',
  GOVERNMENT = 'GOVERNMENT',
  HYBRID = 'HYBRID',
}

/**
 * Path difficulty levels
 */
export enum PathDifficulty {
  VERY_EASY = 'VERY_EASY',
  EASY = 'EASY',
  MODERATE = 'MODERATE',
  HARD = 'HARD',
  VERY_HARD = 'VERY_HARD',
  EXTREME = 'EXTREME',
}

/**
 * Path risk levels
 */
export enum PathRisk {
  VERY_LOW = 'VERY_LOW',
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
  VERY_HIGH = 'VERY_HIGH',
}

/**
 * Milestone status
 */
export enum MilestoneStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
  DEFERRED = 'DEFERRED',
}

/**
 * Recovery strategy types
 */
export enum RecoveryStrategy {
  RETRY = 'RETRY',
  PIVOT = 'PIVOT',
  BRANCH = 'BRANCH',
  BYPASS = 'BYPASS',
  ABANDON = 'ABANDON',
  PARALLEL = 'PARALLEL',
}

/**
 * Path optionality components
 */
export enum OptionalityComponent {
  SKILL_TRANSFERABILITY = 'SKILL_TRANSFERABILITY',
  NETWORK_BREADTH = 'NETWORK_BREADTH',
  CREDENTIAL_VERSATILITY = 'CREDENTIAL_VERSATILITY',
  INDUSTRY_MOBILITY = 'INDUSTRY_MOBILITY',
  ROLE_FLEXIBILITY = 'ROLE_FLEXIBILITY',
  GEOGRAPHIC_MOBILITY = 'GEOGRAPHIC_MOBILITY',
}

// =============================================================================
// CORE PATH TYPES
// =============================================================================

/**
 * Unique identifier for paths
 */
export type PathId = string;

/**
 * Career milestone definition
 */
export interface Milestone {
  /** Unique milestone ID */
  id: string;
  /** Milestone name */
  name: string;
  /** Description of what needs to be achieved */
  description: string;
  /** Order in the path (1, 2, 3...) */
  order: number;
  
  // Timing
  /** Expected duration in months */
  expectedDuration: number;
  /** Minimum duration in months */
  minDuration: number;
  /** Maximum duration in months */
  maxDuration: number;
  
  // Requirements
  /** Prerequisites needed before this milestone */
  prerequisites: Prerequisite[];
  /** Resources required (money, time, support) */
  resources: ResourceRequirement[];
  
  // Outcomes
  /** Expected outcomes upon completion */
  expectedOutcomes: ExpectedOutcome[];
  /** Skills gained at this milestone */
  skillsAcquired: string[];
  /** Credentials/certifications earned */
  credentialsEarned: string[];
  
  // Validation
  /** How to validate completion */
  validationCriteria: ValidationCriterion[];
  /** Success metrics */
  successMetrics: SuccessMetric[];
  
  // Failure handling
  /** Probability of failure (0-1) */
  failureProbability: number;
  /** Recovery paths if this milestone fails */
  recoveryPaths: RecoveryPath[];
  
  // Status tracking
  status: MilestoneStatus;
  startedAt?: number;
  completedAt?: number;
  actualDuration?: number;
}

/**
 * Prerequisite for a milestone
 */
export interface Prerequisite {
  type: 'SKILL' | 'CREDENTIAL' | 'EXPERIENCE' | 'RESOURCE' | 'MILESTONE';
  description: string;
  required: boolean;
  alternativeSatisfiers?: string[];
}

/**
 * Resource requirement
 */
export interface ResourceRequirement {
  type: 'MONEY' | 'TIME' | 'MENTOR' | 'NETWORK' | 'TOOL' | 'ACCESS';
  description: string;
  amount?: number;
  unit?: string;
  flexible: boolean;
}

/**
 * Expected outcome of a milestone
 */
export interface ExpectedOutcome {
  type: 'SKILL' | 'ROLE' | 'INCOME' | 'NETWORK' | 'CREDENTIAL' | 'EXPERIENCE';
  description: string;
  value?: string | number;
  confidence: number;
}

/**
 * Validation criterion
 */
export interface ValidationCriterion {
  type: 'EXAM' | 'PROJECT' | 'REVIEW' | 'CERTIFICATION' | 'TIME' | 'DEMONSTRATION';
  description: string;
  passingThreshold: string;
}

/**
 * Success metric
 */
export interface SuccessMetric {
  name: string;
  target: number | string;
  measurement: string;
}

/**
 * Recovery path from a failed milestone
 */
export interface RecoveryPath {
  id: string;
  name: string;
  description: string;
  strategy: RecoveryStrategy;
  targetPathId?: PathId;
  targetMilestoneId?: string;
  additionalCost: number;
  additionalTime: number;
  successProbability: number;
  tradeoffs: string[];
}

// =============================================================================
// CAREER PATH TYPE
// =============================================================================

/**
 * Complete career path definition
 */
export interface CareerPath {
  /** Unique path identifier */
  pathId: PathId;
  /** Human-readable path name */
  name: string;
  /** Path description */
  description: string;
  /** Path categorization */
  type: PathType;
  
  // Target
  /** Target career/role */
  targetCareer: string;
  /** Alternative titles for the same role */
  alternativeTitles: string[];
  /** Industry/domain */
  industry: string;
  
  // Path characteristics
  /** Overall difficulty */
  difficulty: PathDifficulty;
  /** Estimated total duration in months */
  duration: number;
  /** Confidence in this path (0-1) */
  confidence: number;
  /** Overall risk level */
  riskLevel: PathRisk;
  
  // Financials
  /** Total estimated cost */
  totalCost: number;
  /** Opportunity cost (income foregone) */
  opportunityCost: number;
  /** Expected starting salary */
  expectedStartingSalary: number;
  /** Expected salary at 5 years */
  expectedSalaryAt5Years: number;
  /** ROI calculation */
  roi: number;
  
  // Milestones
  /** Ordered list of milestones */
  milestones: Milestone[];
  /** Current active milestone index */
  currentMilestoneIndex: number;
  
  // Path relationships
  /** IDs of alternative paths (Plan B, C, D) */
  alternativePathIds: PathId[];
  /** IDs of recovery paths if this path fails */
  recoveryPathIds: PathId[];
  /** IDs of paths this can transition to */
  transitionPathIds: PathId[];
  
  // Optionality
  /** Optionality score (0-1) */
  optionalityScore: number;
  /** Optionality breakdown by component */
  optionalityBreakdown: Record<OptionalityComponent, number>;
  
  // Validation
  /** Whether this path is validated for the student */
  isValidated: boolean;
  /** Validation results */
  validationResults: PathValidationResult[];
  
  // Metadata
  /** Source of this path (algorithm, expert, database) */
  source: string;
  /** Version of path data */
  version: string;
  /** Last updated timestamp */
  updatedAt: number;
  
  // Progress tracking
  progress: PathProgress;
}

/**
 * Path progress tracking
 */
export interface PathProgress {
  status: 'PLANNED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ABANDONED' | 'FAILED';
  startedAt?: number;
  completedAt?: number;
  milestonesCompleted: number;
  milestonesFailed: number;
  currentMilestoneId?: string;
  completionPercentage: number;
}

/**
 * Path validation result
 */
export interface PathValidationResult {
  validator: 'FEASIBILITY' | 'CONSTRAINT' | 'CONTEXT' | 'PREREQUISITE' | 'RESOURCE';
  passed: boolean;
  score: number;
  issues: string[];
  recommendations: string[];
}

// =============================================================================
// PATH COMPARISON TYPES
// =============================================================================

/**
 * Path comparison result
 */
export interface PathComparison {
  /** Paths being compared */
  pathIds: PathId[];
  /** Target career */
  targetCareer: string;
  
  // Comparison dimensions
  difficulty: PathDimensionComparison;
  risk: PathDimensionComparison;
  cost: PathDimensionComparison;
  duration: PathDimensionComparison;
  optionality: PathDimensionComparison;
  utility: PathDimensionComparison;
  
  // Detailed comparisons
  milestoneComparisons: MilestoneComparison[];
  outcomeComparisons: OutcomeComparison[];
  
  // Tradeoff analysis
  tradeoffs: PathTradeoff[];
  
  // Recommendation
  recommendedPathId?: PathId;
  recommendationRationale: string[];
  
  // Student-specific fit
  fitScores: Record<PathId, number>;
}

/**
 * Single dimension comparison
 */
export interface PathDimensionComparison {
  dimension: string;
  scores: Record<PathId, number>;
  rankings: PathId[];
  bestPathId: PathId;
  worstPathId: PathId;
  explanation: string;
}

/**
 * Milestone comparison
 */
export interface MilestoneComparison {
  milestoneIndex: number;
  milestoneName: string;
  pathDurations: Record<PathId, number>;
  pathDifficulties: Record<PathId, PathDifficulty>;
  pathCosts: Record<PathId, number>;
}

/**
 * Outcome comparison
 */
export interface OutcomeComparison {
  outcomeType: string;
  pathOutcomes: Record<PathId, ExpectedOutcome>;
  comparison: string;
}

/**
 * Path tradeoff
 */
export interface PathTradeoff {
  between: [PathId, PathId];
  dimension: string;
  tradeoffDescription: string;
  studentPreference?: 'FIRST' | 'SECOND' | 'NEUTRAL';
}

// =============================================================================
// INPUT TYPES
// =============================================================================

/**
 * Student profile for path intelligence
 */
export interface PathIntelligenceStudentProfile {
  id: string;
  
  // Current state
  currentEducationLevel: string;
  currentRole?: string;
  currentIndustry?: string;
  yearsOfExperience: number;
  
  // Skills and credentials
  skills: string[];
  credentials: string[];
  certifications: string[];
  
  // Constraints
  financialConstraints: {
    maxInvestment: number;
    monthlyBudget: number;
    canTakeLoan: boolean;
  };
  timeConstraints: {
    maxDuration: number;
    hoursPerWeek: number;
    canRelocate: boolean;
  };
  locationConstraints: {
    preferredLocations: string[];
    forbiddenLocations: string[];
    remotePreference: 'ONLY' | 'PREFERRED' | 'OPEN' | 'NO';
  };
  
  // Preferences
  riskTolerance: 'VERY_LOW' | 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
  preferredPathTypes: PathType[];
  careerGoals: string[];
  
  // Context
  familyContext?: {
    dependents: number;
    pressureSources: string[];
  };
}

/**
 * Path intelligence input
 */
export interface CareerPathIntelligenceInput {
  studentProfile: PathIntelligenceStudentProfile;
  targetCareer: string;
  targetIndustry?: string;
  currentPaths?: CareerPath[]; // Existing paths being tracked
  constraints?: {
    maxPaths?: number;
    maxDuration?: number;
    maxCost?: number;
    excludedPathTypes?: PathType[];
  };
  preferences?: {
    prioritizeSpeed?: boolean;
    prioritizeOptionality?: boolean;
    prioritizeSecurity?: boolean;
    prioritizeCost?: boolean;
  };
  timestamp: number;
}

// =============================================================================
// ANALYSIS OUTPUT TYPES
// =============================================================================

/**
 * Path discovery result
 */
export interface PathDiscoveryResult {
  targetCareer: string;
  paths: CareerPath[];
  discoveryMethod: string;
  coverage: {
    direct: number;
    indirect: number;
    nonTraditional: number;
  };
}

/**
 * Milestone plan
 */
export interface MilestonePlan {
  pathId: PathId;
  pathName: string;
  milestones: Milestone[];
  totalDuration: number;
  criticalPath: string[]; // IDs of critical milestones
  parallelTracks: ParallelTrack[];
  bufferTime: number;
}

/**
 * Parallel track within a path
 */
export interface ParallelTrack {
  name: string;
  milestones: string[]; // Milestone IDs
  canRunParallel: boolean;
  dependencies: string[];
}

/**
 * Recovery plan
 */
export interface RecoveryPlan {
  failedMilestoneId: string;
  failedMilestoneName: string;
  failureReason: string;
  recoveryOptions: RecoveryOption[];
  recommendedOption: RecoveryOption;
  impactOnPath: {
    additionalCost: number;
    additionalTime: number;
    confidenceImpact: number;
  };
}

/**
 * Recovery option
 */
export interface RecoveryOption {
  id: string;
  name: string;
  strategy: RecoveryStrategy;
  description: string;
  targetPathId?: PathId;
  steps: string[];
  cost: number;
  time: number;
  successProbability: number;
  longTermImpact: string;
}

/**
 * Alternative paths result
 */
export interface AlternativePathsResult {
  primaryPathId: PathId;
  planA: CareerPath;
  planB: CareerPath;
  planC: CareerPath;
  planD?: CareerPath;
  switchingPoints: SwitchingPoint[];
}

/**
 * Point where paths can diverge
 */
export interface SwitchingPoint {
  milestoneId: string;
  milestoneName: string;
  availablePaths: PathId[];
  criteria: string;
  recommendation: string;
}

/**
 * Path explanation
 */
export interface PathExplanation {
  pathId: PathId;
  pathName: string;
  
  // Narratives
  overview: string;
  journeyDescription: string;
  milestoneNarrative: string;
  alternativeNarrative: string;
  riskNarrative: string;
  
  // Comparisons
  comparisonToDirectPath?: string;
  comparisonToEasiestPath?: string;
  comparisonToFastestPath?: string;
  
  // Personalization
  fitExplanation: string;
  constraintExplanation: string;
  recommendationRationale: string;
}

/**
 * Complete path intelligence analysis
 */
export interface CareerPathIntelligenceAnalysis {
  id: string;
  timestamp: number;
  studentId: string;
  engineVersion: string;
  
  // Inputs
  targetCareer: string;
  
  // Discovered paths
  discoveredPaths: PathDiscoveryResult;
  
  // Validated paths
  validatedPaths: CareerPath[];
  invalidPaths: { pathId: PathId; reasons: string[] }[];
  
  // Primary and alternatives
  primaryPath: CareerPath;
  alternativePaths: AlternativePathsResult;
  
  // Comparison
  pathComparison: PathComparison;
  
  // Milestones
  milestonePlan: MilestonePlan;
  
  // Recovery
  recoveryPlans: Record<string, RecoveryPlan>;
  
  // Explanations
  explanations: Record<PathId, PathExplanation>;
  
  // Recommendations
  recommendations: PathRecommendation[];
  
  // Optionality analysis
  optionalityAnalysis: OptionalityAnalysis;
}

/**
 * Path recommendation
 */
export interface PathRecommendation {
  rank: number;
  pathId: PathId;
  pathName: string;
  category: 'OPTIMAL' | 'SAFE' | 'AGGRESSIVE' | 'ALTERNATIVE' | 'BACKUP';
  confidence: number;
  fitScore: number;
  rationale: string[];
  warnings: string[];
  nextSteps: string[];
}

/**
 * Optionality analysis
 */
export interface OptionalityAnalysis {
  overallOptionality: number;
  byPath: Record<PathId, {
    score: number;
    components: Record<OptionalityComponent, number>;
    strengths: string[];
    weaknesses: string[];
  }>;
  recommendations: string[];
}

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Career Path Intelligence Engine configuration
 */
export interface CareerPathIntelligenceConfig {
  // Discovery settings
  maxPathsToDiscover: number;
  minPathConfidence: number;
  includeNonTraditionalPaths: boolean;
  includeEntrepreneurialPaths: boolean;
  
  // Validation settings
  strictValidation: boolean;
  validateAllPrerequisites: boolean;
  validateResources: boolean;
  
  // Milestone settings
  defaultMilestoneDuration: number;
  maxMilestoneDuration: number;
  includeBufferTime: boolean;
  
  // Alternative settings
  generatePlanB: boolean;
  generatePlanC: boolean;
  generatePlanD: boolean;
  
  // Recovery settings
  generateRecoveryPlans: boolean;
  maxRecoveryDepth: number;
  
  // Comparison settings
  comparePaths: boolean;
  comparisonDimensions: string[];
  
  // India-specific settings
  considerIndianExams: boolean;
  considerFamilyBusiness: boolean;
}

/**
 * Default configuration
 */
export const DEFAULT_CAREER_PATH_CONFIG: CareerPathIntelligenceConfig = {
  maxPathsToDiscover: 10,
  minPathConfidence: 0.3,
  includeNonTraditionalPaths: true,
  includeEntrepreneurialPaths: true,
  
  strictValidation: true,
  validateAllPrerequisites: true,
  validateResources: true,
  
  defaultMilestoneDuration: 6,
  maxMilestoneDuration: 60,
  includeBufferTime: true,
  
  generatePlanB: true,
  generatePlanC: true,
  generatePlanD: false,
  
  generateRecoveryPlans: true,
  maxRecoveryDepth: 2,
  
  comparePaths: true,
  comparisonDimensions: ['DIFFICULTY', 'RISK', 'COST', 'DURATION', 'OPTIONALITY'],
  
  considerIndianExams: true,
  considerFamilyBusiness: true,
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get difficulty score (0-1, higher = harder)
 */
export function getDifficultyScore(difficulty: PathDifficulty): number {
  const scores: Record<PathDifficulty, number> = {
    [PathDifficulty.VERY_EASY]: 0.1,
    [PathDifficulty.EASY]: 0.25,
    [PathDifficulty.MODERATE]: 0.5,
    [PathDifficulty.HARD]: 0.75,
    [PathDifficulty.VERY_HARD]: 0.9,
    [PathDifficulty.EXTREME]: 1.0,
  };
  return scores[difficulty] || 0.5;
}

/**
 * Get risk score (0-1, higher = riskier)
 */
export function getRiskScore(risk: PathRisk): number {
  const scores: Record<PathRisk, number> = {
    [PathRisk.VERY_LOW]: 0.05,
    [PathRisk.LOW]: 0.2,
    [PathRisk.MODERATE]: 0.5,
    [PathRisk.HIGH]: 0.8,
    [PathRisk.VERY_HIGH]: 0.95,
  };
  return scores[risk] || 0.5;
}

/**
 * Calculate path score based on multiple factors
 */
export function calculatePathScore(
  path: CareerPath,
  weights: {
    confidence: number;
    optionality: number;
    speed: number;
    cost: number;
    risk: number;
  }
): number {
  const confidenceScore = path.confidence * weights.confidence;
  const optionalityScore = path.optionalityScore * weights.optionality;
  const speedScore = (1 - Math.min(path.duration / 120, 1)) * weights.speed;
  const costScore = (1 - Math.min(path.totalCost / 5000000, 1)) * weights.cost;
  const riskScore = (1 - getRiskScore(path.riskLevel)) * weights.risk;
  
  return confidenceScore + optionalityScore + speedScore + costScore + riskScore;
}

/**
 * Format duration in months to readable string
 */
export function formatDuration(months: number): string {
  if (months < 12) return `${months} months`;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) return `${years} year${years > 1 ? 's' : ''}`;
  return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} months`;
}

/**
 * Format cost to readable string
 */
export function formatCost(cost: number): string {
  if (cost >= 100000) {
    return `₹${(cost / 100000).toFixed(1)}L`;
  }
  if (cost >= 1000) {
    return `₹${(cost / 1000).toFixed(0)}K`;
  }
  return `₹${cost}`;
}
