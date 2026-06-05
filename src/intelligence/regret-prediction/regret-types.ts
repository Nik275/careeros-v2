/**
 * Regret Prediction Engine Types
 *
 * Phase 8.7: CareerOS Regret Prediction Engine
 *
 * Helps CareerOS understand:
 * - Likely future regrets
 * - Regret sources
 * - Regret severity
 * - Regret probability
 * - Preventable regret
 * - Irreversible regret
 * - Identity regret
 * - Exploration regret
 * - Opportunity regret
 *
 * @module regret-types
 * @version 1.0.0
 */

// ============================================================================
// CORE REGRET TYPES
// ============================================================================

/**
 * Regret category types
 */
export type RegretCategory =
  | 'EXPLORATION'
  | 'IDENTITY'
  | 'OPPORTUNITY'
  | 'FINANCIAL'
  | 'LIFESTYLE'
  | 'PURPOSE'
  | 'FEAR_BASED'
  | 'APPROVAL_BASED'
  | 'RELATIONSHIP'
  | 'GROWTH';

/**
 * Regret severity levels
 */
export type RegretSeverity = 'MILD' | 'MODERATE' | 'SIGNIFICANT' | 'SEVERE' | 'PROFOUND';

/**
 * Regret probability levels
 */
export type RegretProbability = 'VERY_LOW' | 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';

/**
 * Regret risk level
 */
export type RegretRisk = 'MINIMAL' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

/**
 * Time horizon for regret forecasting
 */
export type TimeHorizon = 5 | 10 | 20 | 40;

/**
 * Decision motivation type
 */
export type DecisionMotivation =
  | 'INTRINSIC'
  | 'EXTRINSIC'
  | 'FEAR_DRIVEN'
  | 'APPROVAL_SEEKING'
  | 'OBLIGATION'
  | 'UNCERTAIN';

// ============================================================================
// INPUT TYPES
// ============================================================================

/**
 * Student profile for regret analysis
 */
export interface RegretStudentProfile {
  age?: number;
  currentEducation: string;
  interests: string[];
  strengths: string[];
  values: string[];
  personalityTraits?: string[];
  previousChoices: string[];
  familyExpectations?: string[];
  socialPressures?: string[];
  fearFactors?: string[];
}

/**
 * Decision context for regret analysis
 */
export interface RegretDecisionContext {
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  reversibility: 'EASY' | 'MODERATE' | 'DIFFICULT' | 'IMPOSSIBLE';
  timePressure: boolean;
  informationLevel: 'LIMITED' | 'ADEQUATE' | 'COMPREHENSIVE';
  emotionalState?: string;
  externalPressures: string[];
}

/**
 * Decision option for regret analysis
 */
export interface RegretDecisionOption {
  id: string;
  name: string;
  description: string;
  type: 'EDUCATION' | 'CAREER' | 'LIFESTYLE' | 'LOCATION' | 'OTHER';
  motivations: DecisionMotivation[];
  alignmentWithInterests: number; // 0-1
  alignmentWithValues: number; // 0-1
  alignmentWithStrengths: number; // 0-1
  fearFactors?: string[];
  approvalFactors?: string[];
  explorationValue: number; // 0-1
  identityExpression: number; // 0-1
  opportunityCost: number; // 0-1
}

/**
 * Input for regret prediction
 */
export interface RegretPredictionInput {
  decisionType: string;
  description: string;
  options: RegretDecisionOption[];
  selectedOption?: RegretDecisionOption;
  studentProfile: RegretStudentProfile;
  context: RegretDecisionContext;
}

// ============================================================================
// EXPLORATION REGRET
// ============================================================================

/**
 * Unexplored path identification
 */
export interface UnexploredPath {
  pathName: string;
  pathType: string;
  interestAlignment: number;
  explorationBarrier: string;
  recoverability: 'EASY' | 'MODERATE' | 'DIFFICULT';
}

/**
 * Exploration regret analysis
 */
export interface ExplorationRegretAnalysis {
  hasExplorationRisk: boolean;
  unexploredPaths: UnexploredPath[];
  strongestInterestSuppressed: string | null;
  explorationGap: number; // 0-1
  severity: RegretSeverity;
  evidence: string[];
  explanation: string;
  preventionPossible: boolean;
  preventionStrategies: string[];
}

// ============================================================================
// IDENTITY REGRET
// ============================================================================

/**
 * Identity expression assessment
 */
export interface IdentityExpression {
  identityAspect: string;
  currentExpression: number; // 0-1
  requiredExpression: number; // 0-1
  gap: number; // 0-1
  importance: number; // 0-1
}

/**
 * Identity regret analysis
 */
export interface IdentityRegretAnalysis {
  hasIdentityRisk: boolean;
  suppressedIdentities: string[];
  identityExpressions: IdentityExpression[];
  identityAlignment: number; // 0-1
  severity: RegretSeverity;
  evidence: string[];
  explanation: string;
  preventionPossible: boolean;
  identityRecoveryPath: string[];
}

// ============================================================================
// OPPORTUNITY REGRET
// ============================================================================

/**
 * Opportunity cost assessment
 */
export interface OpportunityCost {
  opportunityName: string;
  opportunityType: string;
  value: number; // 0-1
  recoverability: 'EASY' | 'MODERATE' | 'DIFFICULT' | 'IMPOSSIBLE';
  timeWindow: string;
}

/**
 * Opportunity regret analysis
 */
export interface OpportunityRegretAnalysis {
  hasOpportunityRisk: boolean;
  opportunitiesForegone: OpportunityCost[];
  opportunityCostScore: number; // 0-1
  severity: RegretSeverity;
  evidence: string[];
  explanation: string;
  preventionPossible: boolean;
  alternativePaths: string[];
}

// ============================================================================
// FEAR-DRIVEN REGRET
// ============================================================================

/**
 * Fear factor assessment
 */
export interface FearFactor {
  fearType: string;
  intensity: number; // 0-1
  impactOnDecision: number; // 0-1
  rationality: 'RATIONAL' | 'MIXED' | 'IRRATIONAL';
}

/**
 * Fear-driven regret analysis
 */
export interface FearDrivenRegretAnalysis {
  hasFearRisk: boolean;
  dominantFears: FearFactor[];
  fearInfluenceScore: number; // 0-1
  severity: RegretSeverity;
  evidence: string[];
  explanation: string;
  preventionPossible: boolean;
  fearMitigationStrategies: string[];
}

// ============================================================================
// APPROVAL-DRIVEN REGRET
// ============================================================================

/**
 * Approval source assessment
 */
export interface ApprovalSource {
  sourceType: string;
  sourceName: string;
  influenceLevel: number; // 0-1
  alignmentWithSelf: number; // 0-1
}

/**
 * Approval-driven regret analysis
 */
export interface ApprovalDrivenRegretAnalysis {
  hasApprovalRisk: boolean;
  approvalSources: ApprovalSource[];
  externalInfluenceScore: number; // 0-1
  authenticityGap: number; // 0-1
  severity: RegretSeverity;
  evidence: string[];
  explanation: string;
  preventionPossible: boolean;
  authenticityRecoverySteps: string[];
}

// ============================================================================
// REGRET FORECAST
// ============================================================================

/**
 * Regret forecast for specific time horizon
 */
export interface RegretForecast {
  timeHorizon: TimeHorizon;
  regretProbability: RegretProbability;
  regretSeverity: RegretSeverity;
  dominantRegretCategory: RegretCategory;
  keyFactors: string[];
  description: string;
}

/**
 * Complete regret forecast set
 */
export interface RegretForecastSet {
  fiveYear: RegretForecast;
  tenYear: RegretForecast;
  twentyYear: RegretForecast;
  fortyYear: RegretForecast;
  trajectory: 'IMPROVING' | 'STABLE' | 'WORSENING';
}

// ============================================================================
// MASTER REGRET PROFILE
// ============================================================================

/**
 * Individual regret assessment
 */
export interface RegretAssessment {
  category: RegretCategory;
  risk: RegretRisk;
  probability: RegretProbability;
  severity: RegretSeverity;
  preventable: boolean;
  reversible: boolean;
  timeToManifest: string;
  description: string;
}

/**
 * Regret profile output
 */
export interface RegretProfile {
  id: string;
  overallRegretRisk: RegretRisk;
  overallRegretProbability: RegretProbability;
  highestRiskRegret: RegretCategory | null;
  preventableRegrets: RegretAssessment[];
  irreversibleRegrets: RegretAssessment[];
  allRegrets: RegretAssessment[];
  explorationAnalysis: ExplorationRegretAnalysis;
  identityAnalysis: IdentityRegretAnalysis;
  opportunityAnalysis: OpportunityRegretAnalysis;
  fearAnalysis: FearDrivenRegretAnalysis;
  approvalAnalysis: ApprovalDrivenRegretAnalysis;
  forecast: RegretForecastSet;
  confidence: number; // 0-1
  explanation: string;
  timestamp: Date;
}

// ============================================================================
// REGRET REPORT
// ============================================================================

/**
 * Regret insight for reports
 */
export interface RegretInsight {
  category: RegretCategory;
  insight: string;
  reflection: string;
  actionItem: string;
}

/**
 * Mentor framing for regret discussion
 */
export interface MentorFraming {
  opening: string;
  exploration: string;
  reflection: string;
  guidance: string;
  closing: string;
}

/**
 * Regret report output
 */
export interface RegretReport {
  id: string;
  profile: RegretProfile;
  summary: string;
  insights: RegretInsight[];
  studentReflection: string;
  mentorFraming: MentorFraming;
  preventionStrategies: string[];
  explorationOpportunities: string[];
  authenticityRecommendations: string[];
  generatedAt: Date;
}

// ============================================================================
// ENGINE CONFIGURATION
// ============================================================================

/**
 * Configuration for regret prediction engine
 */
export interface RegretEngineConfig {
  explorationWeight: number;
  identityWeight: number;
  opportunityWeight: number;
  fearWeight: number;
  approvalWeight: number;
  severityThresholds: {
    mild: number;
    moderate: number;
    significant: number;
    severe: number;
  };
  probabilityThresholds: {
    veryLow: number;
    low: number;
    moderate: number;
    high: number;
  };
  includeExplanations: boolean;
  includePreventionStrategies: boolean;
}

// ============================================================================
// COMPARISON TYPES
// ============================================================================

/**
 * Regret comparison between options
 */
export interface RegretOptionComparison {
  optionId: string;
  optionName: string;
  overallRegretRisk: RegretRisk;
  dominantRegretCategory: RegretCategory;
  explorationRegret: RegretSeverity;
  identityRegret: RegretSeverity;
  keyInsight: string;
}

/**
 * Regret comparison result
 */
export interface RegretComparison {
  options: RegretOptionComparison[];
  lowestRegretOption: string;
  highestRegretOption: string;
  recommendation: string;
  keyInsight: string;
}
