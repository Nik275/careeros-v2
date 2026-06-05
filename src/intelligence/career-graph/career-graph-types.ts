/**
 * CareerOS Career Graph Intelligence - Type Definitions
 *
 * Models career decisions as interconnected graphs showing how choices
 * create future opportunities, restrictions, and trajectories.
 */

// ============================================================================
// CORE GRAPH TYPES
// ============================================================================

export type NodeId = string;
export type EdgeId = string;
export type PathId = string;
export type Timestamp = number;
export type Probability = number; // 0-1
export type Score = number; // 0-100

/**
 * Types of nodes in the career graph
 */
export type CareerNodeType =
  | 'subject-choice'
  | 'degree-choice'
  | 'certification'
  | 'skill'
  | 'career'
  | 'industry'
  | 'leadership-track'
  | 'entrepreneurship-path'
  | 'role'
  | 'company-type'
  | 'location'
  | 'specialization';

/**
 * Types of edges representing relationships between career nodes
 */
export type EdgeType =
  | 'opens'        // Creates new opportunities
  | 'restricts'    // Limits future options
  | 'accelerates'  // Speeds up progress
  | 'delays'       // Slows down progress
  | 'blocks'       // Prevents certain paths
  | 'strengthens'  // Enhances capability
  | 'requires'     // Prerequisite relationship
  | 'enables';     // Makes possible

// ============================================================================
// CAREER NODE
// ============================================================================

export interface CareerNode {
  id: NodeId;
  type: CareerNodeType;
  name: string;
  description: string;
  category: string;
  tags: string[];
  
  // Temporal properties
  typicalDuration: number; // in months
  entryAge: { min: number; max: number; typical: number };
  
  // Requirements
  prerequisites: NodeId[];
  requiredSkills: string[];
  recommendedSkills: string[];
  
  // Economic properties
  costRange: { min: number; max: number; currency: string };
  earningPotential: {
    entry: number;
    mid: number;
    senior: number;
    currency: string;
  };
  
  // Market properties
  demandLevel: 'very-high' | 'high' | 'medium' | 'low' | 'very-low';
  growthOutlook: 'strong-growth' | 'growth' | 'stable' | 'declining' | 'strong-decline';
  
  // Graph properties
  metadata: Record<string, unknown>;
}

// ============================================================================
// CAREER EDGE
// ============================================================================

export interface CareerEdge {
  id: EdgeId;
  from: NodeId;
  to: NodeId;
  type: EdgeType;
  
  // Transition properties
  probability: Probability;
  effortScore: Score; // 0-100, effort required
  timeToTransition: number; // in months
  
  // Optionality impact
  optionalityImpact: number; // -1 to 1, negative = reduces options
  
  // Reversibility
  reversibilityScore: Score; // 0-100, higher = easier to reverse
  
  // Conditions
  conditions: string[]; // Requirements to traverse this edge
  
  metadata: Record<string, unknown>;
}

// ============================================================================
// CAREER GRAPH
// ============================================================================

export interface CareerGraph {
  id: string;
  version: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  nodes: Map<NodeId, CareerNode>;
  edges: Map<EdgeId, CareerEdge>;
  
  // Index for quick lookups
  edgesFrom: Map<NodeId, EdgeId[]>;
  edgesTo: Map<NodeId, EdgeId[]>;
}

// ============================================================================
// OPTIONALITY
// ============================================================================

export interface OptionalityScore {
  score: Score; // 0-100
  
  // Breakdown
  careerOptions: number;
  industryOptions: number;
  roleOptions: number;
  pivotOptions: number;
  
  // Time-based optionality
  nearTermOptionality: Score;  // 0-2 years
  mediumTermOptionality: Score; // 2-5 years
  longTermOptionality: Score;   // 5+ years
  
  // Factors affecting optionality
  contributingFactors: string[];
  limitingFactors: string[];
  
  // Comparison
  percentileRank: number; // 0-100, relative to all nodes
}

// ============================================================================
// IRREVERSIBILITY
// ============================================================================

export interface IrreversibilityScore {
  score: Score; // 0-100, higher = harder to reverse
  
  // Components
  financialCost: Score; // Cost to reverse
  timeInvestment: Score; // Years invested
  credentialLockIn: Score; // How specialized the credentials are
  entranceBarriers: Score; // Difficulty to re-enter previous path
  skillAtrophy: Score; // How much previous skills decay
  
  // Breakdown
  reversibleWithin: {
    oneYear: Probability;
    threeYears: Probability;
    fiveYears: Probability;
  };
  
  // Factors
  irreversibilityFactors: string[];
  mitigationStrategies: string[];
}

// ============================================================================
// OPPORTUNITY
// ============================================================================

export type OpportunityTimeframe = 'near-term' | 'medium-term' | 'long-term';

export interface Opportunity {
  id: string;
  nodeId: NodeId;
  name: string;
  description: string;
  timeframe: OpportunityTimeframe;
  
  // Probability and quality
  likelihood: Probability;
  qualityScore: Score; // 0-100
  
  // Requirements
  requirements: string[];
  prerequisites: NodeId[];
  
  // Value
  earningPotential: number;
  growthPotential: Score;
  satisfactionPotential: Score;
  
  // Access
  accessibility: Score; // 0-100, how easy to access
  competitionLevel: 'low' | 'medium' | 'high' | 'very-high';
}

export interface OpportunityMap {
  nodeId: NodeId;
  generatedAt: Timestamp;
  
  nearTerm: Opportunity[];   // 0-2 years
  mediumTerm: Opportunity[]; // 2-5 years
  longTerm: Opportunity[];   // 5+ years
  
  // Summary
  totalOpportunities: number;
  highQualityOpportunities: number;
  accessibleOpportunities: number;
}

// ============================================================================
// PATH SIMULATION
// ============================================================================

export type SimulationHorizon = 3 | 5 | 10; // years

export interface PathSimulation {
  id: PathId;
  startNodeId: NodeId;
  horizon: SimulationHorizon;
  generatedAt: Timestamp;
  
  // Likely paths
  likelyPaths: SimulatedPath[];
  
  // Risks
  likelyRisks: Risk[];
  
  // Pivots
  pivotPossibilities: PivotOption[];
  
  // Optionality changes
  optionalityTrajectory: {
    year1: OptionalityScore;
    year3: OptionalityScore;
    year5: OptionalityScore;
    year10: OptionalityScore;
  };
}

export interface SimulatedPath {
  id: string;
  nodes: NodeId[];
  probability: Probability;
  
  // Timeline
  timeline: Array<{
    nodeId: NodeId;
    startMonth: number;
    duration: number;
  }>;
  
  // Outcomes
  finalOptionality: OptionalityScore;
  earningTrajectory: number[]; // Year by year
  cumulativeEarnings: number;
  
  // Risk assessment
  riskLevel: 'low' | 'medium' | 'high';
  keyRisks: string[];
}

export interface Risk {
  id: string;
  name: string;
  description: string;
  likelihood: Probability;
  impact: 'low' | 'medium' | 'high' | 'severe';
  timeframe: string;
  mitigation: string[];
}

export interface PivotOption {
  id: string;
  fromNodeId: NodeId;
  toNodeId: NodeId;
  
  // Feasibility
  feasibility: Score; // 0-100
  effortRequired: Score;
  timeRequired: number; // months
  
  // Consequences
  optionalityChange: number; // -1 to 1
  earningImpact: number; // percentage change
  
  // Conditions
  prerequisites: string[];
}

// ============================================================================
// CAREER CASCADE
// ============================================================================

export interface CareerCascade {
  id: string;
  startNodeId: NodeId;
  generatedAt: Timestamp;
  
  // Decision chain
  stages: CascadeStage[];
  
  // Summary
  totalStages: number;
  typicalTimeline: number; // months
  finalOutcomes: CascadeOutcome[];
}

export interface CascadeStage {
  order: number;
  nodeId: NodeId;
  name: string;
  
  // What this stage enables
  opens: NodeId[];
  restricts: NodeId[];
  
  // Decision point
  isDecisionPoint: boolean;
  decisions: CascadeDecision[];
  
  // Timing
  typicalAge: number;
  duration: number; // months
}

export interface CascadeDecision {
  id: string;
  name: string;
  description: string;
  leadsTo: NodeId[];
  probability: Probability;
}

export interface CascadeOutcome {
  nodeId: NodeId;
  path: NodeId[];
  probability: Probability;
  
  // Characteristics
  optionality: OptionalityScore;
  earningPotential: number;
  workLifeBalance: Score;
  growthPotential: Score;
}

// ============================================================================
// CAREER GRAPH REPORT
// ============================================================================

export interface CareerGraphReport {
  id: string;
  generatedAt: Timestamp;
  studentId: string;
  
  // Rankings
  optionalityRanking: RankedNode[];
  riskRanking: RankedNode[];
  reversibilityRanking: RankedNode[];
  futureOpportunityRanking: RankedNode[];
  
  // Paths
  recommendedPaths: RecommendedPath[];
  
  // Simulations
  simulations: PathSimulation[];
  
  // Cascades
  cascades: CareerCascade[];
  
  // Insights
  keyInsights: string[];
  warnings: string[];
  recommendations: string[];
}

export interface RankedNode {
  nodeId: NodeId;
  name: string;
  score: Score;
  percentile: number;
  rationale: string;
}

export interface RecommendedPath {
  id: string;
  name: string;
  nodes: NodeId[];
  
  // Scores
  optionalityScore: Score;
  riskScore: Score;
  opportunityScore: Score;
  alignmentScore: Score; // With student profile
  
  // Details
  rationale: string;
  keyMilestones: string[];
  estimatedTimeline: number; // months
}

// ============================================================================
// STUDENT CONTEXT
// ============================================================================

export interface StudentCareerContext {
  studentId: string;
  currentNodeId?: NodeId;
  completedNodes: NodeId[];
  age?: number;
  
  // Academic background
  academicProfile: {
    currentSubjects: string[];
    performance: Record<string, number>;
    interests: string[];
  };
  
  // Constraints
  constraints: {
    financialBudget: number;
    geographicPreference: string[];
    timeConstraints: string[];
  };
  
  // Goals
  goals: {
    shortTerm: string[];
    mediumTerm: string[];
    longTerm: string[];
  };
  
  // Preferences
  preferences: {
    riskTolerance: 'low' | 'medium' | 'high';
    optionalityPreference: 'low' | 'medium' | 'high';
    workLifeBalancePriority: Score;
  };
}

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface CareerGraphConfig {
  // Simulation settings
  defaultHorizon: SimulationHorizon;
  maxPathsToSimulate: number;
  probabilityThreshold: number;
  
  // Scoring weights
  optionalityWeights: {
    careerOptions: number;
    industryOptions: number;
    pivotOptions: number;
  };
  
  // Risk settings
  riskToleranceLevels: {
    low: number;
    medium: number;
    high: number;
  };
  
  // Cache settings
  cacheResults: boolean;
  cacheDuration: number; // milliseconds
}

export const DEFAULT_CAREER_GRAPH_CONFIG: CareerGraphConfig = {
  defaultHorizon: 10,
  maxPathsToSimulate: 100,
  probabilityThreshold: 0.1,
  
  optionalityWeights: {
    careerOptions: 0.4,
    industryOptions: 0.3,
    pivotOptions: 0.3,
  },
  
  riskToleranceLevels: {
    low: 0.3,
    medium: 0.5,
    high: 0.7,
  },
  
  cacheResults: true,
  cacheDuration: 3600000, // 1 hour
};

// ============================================================================
// EVENTS
// ============================================================================

export type CareerGraphEventType =
  | 'node-added'
  | 'edge-added'
  | 'path-simulated'
  | 'optionality-calculated'
  | 'opportunity-mapped'
  | 'cascade-generated';

export interface CareerGraphEvent {
  type: CareerGraphEventType;
  timestamp: Timestamp;
  data: unknown;
}
