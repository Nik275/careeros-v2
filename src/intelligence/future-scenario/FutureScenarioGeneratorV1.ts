/**
 * CareerOS Future Scenario Generator V1
 *
 * Generates plausible future career scenarios based on:
 * - StudentBelief (motivations, strengths, values, constraints)
 * - CareerPath (nodes, edges, metrics)
 * - KnowledgeGraph (career relationships)
 * - OptionalityAnalysis (future flexibility)
 * - CriticalityAnalysis (path constraints)
 * - DecisionCoalition (family/stakeholder dynamics)
 *
 * Generates 4 deterministic scenarios:
 * 1. Best Case - Optimal outcomes, favorable conditions
 * 2. Expected - Most likely trajectory
 * 3. Conservative - Safe, lower-risk path
 * 4. High-Risk - Ambitious with higher uncertainty
 *
 * @module intelligence/future-scenario
 * @version 1.0.0
 */

import type {
  StudentBeliefV3,
} from '../types/index.js';

type PathType = any;
type PathMetrics = any;
interface CareerNode {
  id: string;
  name: string;
  type?: string;
  typicalDuration?: number;
  typicalExperienceYears?: number;
  skillsGained?: string[];
  financialCost?: {
    typical?: number;
  };
  outcomes?: {
    averageSalary?: number;
  };
}

interface CareerEdge {
  fromNodeId: string;
  toNodeId: string;
  probability?: number;
  probabilityOfSuccess?: number;
  difficulty?: number;
  transitionDifficulty?: number;
  transitionType: string;
  description: string;
  prerequisites: Array<string | { name?: string; description?: string; requirement?: string; type?: string }>;
}

import type {
  OptionalityAnalysis,
} from '../optionality-engine/OptionalityEngineV1.js';

import type {
  CriticalityAnalysis,
} from '../criticality-engine/CriticalityEngineV1.js';

import type {
  DecisionCoalitionAnalysis,
  PathCoalitionAnalysis,
} from '../decision-coalition-v3/DecisionCoalitionEngineV3.js';

import type {
  KnowledgeGraph,
} from '../../knowledge-graph/KnowledgeGraphCore.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Scenario type - determines the trajectory calculation approach
 */
export type ScenarioType = 'best-case' | 'expected' | 'conservative' | 'high-risk';

/**
 * Career state at a point in the scenario timeline
 */
export interface CareerState {
  /** Career/node identifier */
  nodeId: string;
  /** Human-readable name */
  name: string;
  /** Type of career node */
  type: 'exam' | 'degree' | 'job' | 'career' | 'pivot';
  /** Year in the scenario timeline */
  year: number;
  /** Duration in this state (years) */
  duration: number;
  /** Current role/seniority level */
  seniority: 'entry' | 'junior' | 'mid' | 'senior' | 'leadership';
  /** Skills acquired in this state */
  skillsAcquired: string[];
  /** Performance level (scenario-adjusted) */
  performanceLevel: 'below-average' | 'average' | 'above-average' | 'exceptional';
}

/**
 * Education state at a point in the scenario timeline
 */
export interface EducationState {
  /** Education identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Type of education */
  type: 'degree' | 'certification' | 'exam' | 'training';
  /** Year started */
  startYear: number;
  /** Year completed */
  endYear: number;
  /** Status */
  status: 'in-progress' | 'completed' | 'planned';
  /** Performance/outcome */
  outcome: 'below-average' | 'average' | 'above-average' | 'exceptional';
  /** Cost incurred */
  cost: number;
}

/**
 * Milestone in the career scenario
 */
export interface ScenarioMilestone {
  /** Milestone identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Description of the milestone */
  description: string;
  /** Year when milestone occurs */
  year: number;
  /** Type of milestone */
  type: 'education' | 'promotion' | 'transition' | 'achievement' | 'skill' | 'financial';
  /** Whether milestone is achieved in this scenario */
  isAchieved: boolean;
  /** Conditions required for achievement */
  conditions: string[];
  /** Impact on trajectory */
  impact: 'minor' | 'moderate' | 'major' | 'critical';
}

/**
 * Income trajectory point
 */
export interface IncomePoint {
  /** Year in scenario */
  year: number;
  /** Annual income (INR) */
  annualIncome: number;
  /** Monthly income (INR) */
  monthlyIncome: number;
  /** Income growth from previous year */
  growthRate: number;
  /** Income source breakdown */
  sources: {
    primary: number;
    secondary?: number;
    passive?: number;
  };
}

/**
 * Flexibility trajectory point
 */
export interface FlexibilityPoint {
  /** Year in scenario */
  year: number;
  /** Optionality score (0-100) */
  optionalityScore: number;
  /** Number of reachable career options */
  reachableOptions: number;
  /** Pivot potential (0-100) */
  pivotPotential: number;
  /** Skill transferability (0-100) */
  skillTransferability: number;
  /** Geographic flexibility (0-100) */
  geographicFlexibility: number;
}

/**
 * Complete future scenario
 */
export interface FutureScenario {
  /** Scenario identifier */
  id: string;
  /** Scenario type */
  type: ScenarioType;
  /** Human-readable name */
  name: string;
  /** Description of this scenario */
  description: string;
  /** Base career path this scenario extends */
  basePathId: string;
  /** Total timeline duration (years) */
  timelineYears: number;
  /** Career states over time */
  careerStates: CareerState[];
  /** Education states over time */
  educationStates: EducationState[];
  /** Key milestones */
  milestones: ScenarioMilestone[];
  /** Income trajectory */
  incomeTrajectory: IncomePoint[];
  /** Flexibility trajectory */
  flexibilityTrajectory: FlexibilityPoint[];
  /** Scenario metrics */
  metrics: ScenarioMetrics;
  /** Scenario assumptions */
  assumptions: ScenarioAssumptions;
  /** Risk factors */
  riskFactors: RiskFactor[];
  /** Generated timestamp */
  generatedAt: number;
}

/**
 * Scenario metrics
 */
export interface ScenarioMetrics {
  /** Total income over scenario duration */
  totalIncome: number;
  /** Peak annual income */
  peakIncome: number;
  /** Average annual income */
  averageIncome: number;
  /** Final optionality score */
  finalOptionality: number;
  /** Average flexibility score */
  averageFlexibility: number;
  /** Number of transitions */
  transitionCount: number;
  /** Education completion rate */
  educationCompletionRate: number;
  /** Overall scenario probability (0-100) */
  probability: number;
}

/**
 * Scenario assumptions
 */
export interface ScenarioAssumptions {
  /** Performance level assumption */
  performanceLevel: 'below-average' | 'average' | 'above-average' | 'exceptional';
  /** Market conditions */
  marketConditions: 'recession' | 'slow' | 'stable' | 'growth' | 'boom';
  /** Family support level */
  familySupport: 'minimal' | 'moderate' | 'strong' | 'full';
  /** Financial constraints */
  financialConstraint: 'severe' | 'moderate' | 'minimal' | 'none';
  /** Risk tolerance applied */
  riskTolerance: 'very-low' | 'low' | 'moderate' | 'high' | 'very-high';
  /** External opportunity level */
  externalOpportunities: 'scarce' | 'limited' | 'moderate' | 'abundant';
}

/**
 * Risk factor for a scenario
 */
export interface RiskFactor {
  /** Risk identifier */
  id: string;
  /** Risk name */
  name: string;
  /** Risk description */
  description: string;
  /** Risk category */
  category: 'financial' | 'market' | 'skill' | 'transition' | 'personal' | 'external';
  /** Probability of occurrence (0-100) */
  probability: number;
  /** Impact if occurs (0-100) */
  impact: number;
  /** Risk score (probability * impact) */
  riskScore: number;
  /** Whether risk is mitigated in this scenario */
  isMitigated: boolean;
  /** Mitigation strategies */
  mitigations: string[];
}

/**
 * Input parameters for scenario generation
 */
export interface ScenarioGenerationInput {
  /** Student belief snapshot */
  studentBelief: StudentBeliefV3;
  /** Base career path to extend */
  basePath: ExploredCareerPath;
  /** Knowledge graph for relationship lookups */
  knowledgeGraph: KnowledgeGraph;
  /** Optionality analysis for the base path */
  optionalityAnalysis: OptionalityAnalysis;
  /** Criticality analysis for the base path */
  criticalityAnalysis: CriticalityAnalysis;
  /** Coalition analysis (optional) */
  coalitionAnalysis?: DecisionCoalitionAnalysis;
  /** Starting year (default: current) */
  startYear?: number;
  /** Scenario duration in years (default: 10) */
  duration?: number;
  /** Student's current age (optional) */
  currentAge?: number;
  /** Current income (optional) */
  currentIncome?: number;
}

/**
 * Output from scenario generation
 */
export interface ScenarioGenerationResult {
  /** Generated scenarios */
  scenarios: FutureScenario[];
  /** Base path reference */
  basePathId: string;
  /** Student reference */
  studentId: string;
  /** Generation parameters used */
  parameters: {
    startYear: number;
    duration: number;
    currentAge?: number;
  };
  /** Comparison across scenarios */
  comparison: ScenarioComparison;
  /** Generated timestamp */
  generatedAt: number;
}

/**
 * Comparison of multiple scenarios
 */
export interface ScenarioComparison {
  /** Income comparison */
  income: {
    highest: string;
    lowest: string;
    mostStable: string;
  };
  /** Flexibility comparison */
  flexibility: {
    highest: string;
    lowest: string;
  };
  /** Risk comparison */
  risk: {
    highest: string;
    lowest: string;
  };
  /** Probability comparison */
  probability: {
    highest: string;
    lowest: string;
  };
  /** Recommended scenario based on student profile */
  recommended: ScenarioType;
  /** Reasoning for recommendation */
  recommendationReason: string;
}

/**
 * Configuration for scenario generation
 */
export interface ScenarioGeneratorConfig {
  /** Income growth rates by scenario type */
  incomeGrowthRates: Record<ScenarioType, number>;
  /** Performance multipliers by scenario type */
  performanceMultipliers: Record<ScenarioType, number>;
  /** Market condition adjustments */
  marketAdjustments: Record<ScenarioType, number>;
  /** Risk probability adjustments */
  riskAdjustments: Record<ScenarioType, number>;
  /** Flexibility decay rates */
  flexibilityDecayRates: Record<ScenarioType, number>;
  /** Milestone achievement probabilities */
  milestoneProbabilities: Record<ScenarioType, number>;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_SCENARIO_CONFIG: ScenarioGeneratorConfig = {
  incomeGrowthRates: {
    'best-case': 0.15,      // 15% annual growth
    'expected': 0.08,       // 8% annual growth
    'conservative': 0.05,   // 5% annual growth
    'high-risk': 0.12,      // 12% annual growth (volatile)
  },
  performanceMultipliers: {
    'best-case': 1.3,       // 30% above base
    'expected': 1.0,      // Base performance
    'conservative': 0.85,   // 15% below base
    'high-risk': 1.2,       // 20% above base (if successful)
  },
  marketAdjustments: {
    'best-case': 1.2,       // Boom conditions
    'expected': 1.0,        // Stable
    'conservative': 0.9,    // Slow growth
    'high-risk': 0.85,      // Recession possible
  },
  riskAdjustments: {
    'best-case': 0.3,       // Low risk
    'expected': 0.5,        // Moderate risk
    'conservative': 0.2,    // Very low risk
    'high-risk': 0.8,       // High risk
  },
  flexibilityDecayRates: {
    'best-case': 0.02,    // Slow decay
    'expected': 0.05,     // Normal decay
    'conservative': 0.03, // Slower decay (safe choices)
    'high-risk': 0.08,    // Fast decay (specialization)
  },
  milestoneProbabilities: {
    'best-case': 0.9,     // 90% achievement
    'expected': 0.7,      // 70% achievement
    'conservative': 0.85, // 85% achievement
    'high-risk': 0.5,     // 50% achievement
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate unique ID for scenario elements
 */
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate seniority level based on years in role
 */
function calculateSeniority(yearsInRole: number): CareerState['seniority'] {
  if (yearsInRole < 2) return 'entry';
  if (yearsInRole < 4) return 'junior';
  if (yearsInRole < 7) return 'mid';
  if (yearsInRole < 12) return 'senior';
  return 'leadership';
}

function getEdgeProbability(edge: CareerEdge): number {
  return edge.probability ?? edge.probabilityOfSuccess ?? 0.5;
}

function getEdgeDifficulty(edge: CareerEdge): number {
  if (edge.difficulty !== undefined) {
    return edge.difficulty;
  }

  if (edge.transitionDifficulty !== undefined) {
    return edge.transitionDifficulty > 1 ? edge.transitionDifficulty / 100 : edge.transitionDifficulty;
  }

  return 0.5;
}

function getEdgePrerequisites(edge: CareerEdge): string[] {
  return edge.prerequisites.map((prerequisite) => {
    if (typeof prerequisite === 'string') {
      return prerequisite;
    }

    return prerequisite.description ?? prerequisite.name ?? prerequisite.requirement ?? prerequisite.type ?? 'Prerequisite';
  });
}

/**
 * Calculate income based on node type, seniority, and scenario adjustments
 */
function calculateIncome(
  node: CareerNode,
  seniority: CareerState['seniority'],
  scenarioType: ScenarioType,
  year: number,
  config: ScenarioGeneratorConfig,
  baseIncome: number
): number {
  // Base income from node outcomes
  const nodeIncome = node.outcomes?.averageSalary || baseIncome || 300000;

  // Seniority multiplier
  const seniorityMultipliers: Record<CareerState['seniority'], number> = {
    'entry': 0.6,
    'junior': 0.8,
    'mid': 1.0,
    'senior': 1.4,
    'leadership': 2.0,
  };

  // Apply multipliers
  let adjustedIncome = nodeIncome * seniorityMultipliers[seniority];

  // Apply scenario performance multiplier
  adjustedIncome *= config.performanceMultipliers[scenarioType];

  // Apply market adjustment
  adjustedIncome *= config.marketAdjustments[scenarioType];

  // Apply year-over-year growth
  const growthRate = config.incomeGrowthRates[scenarioType];
  adjustedIncome *= Math.pow(1 + growthRate, year);

  return Math.round(adjustedIncome);
}

/**
 * Calculate flexibility score for a given year
 */
function calculateFlexibility(
  baseOptionality: number,
  year: number,
  scenarioType: ScenarioType,
  config: ScenarioGeneratorConfig,
  criticalityScore: number
): number {
  // Start with base optionality
  let flexibility = baseOptionality;

  // Apply decay based on scenario type
  const decayRate = config.flexibilityDecayRates[scenarioType];
  flexibility *= Math.pow(1 - decayRate, year);

  // Adjust for criticality (higher criticality = lower flexibility)
  const criticalityImpact = (criticalityScore / 100) * 0.3;
  flexibility *= (1 - criticalityImpact);

  // Ensure bounds
  return Math.max(0, Math.min(100, Math.round(flexibility)));
}

/**
 * Determine scenario assumptions based on type and inputs
 */
function determineAssumptions(
  scenarioType: ScenarioType,
  studentBelief: StudentBeliefV3,
  coalitionAnalysis?: DecisionCoalitionAnalysis
): ScenarioAssumptions {
  const assumptions: Record<ScenarioType, ScenarioAssumptions> = {
    'best-case': {
      performanceLevel: 'exceptional',
      marketConditions: 'boom',
      familySupport: 'full',
      financialConstraint: 'none',
      riskTolerance: 'high',
      externalOpportunities: 'abundant',
    },
    'expected': {
      performanceLevel: 'average',
      marketConditions: 'stable',
      familySupport: 'moderate',
      financialConstraint: 'minimal',
      riskTolerance: 'moderate',
      externalOpportunities: 'moderate',
    },
    'conservative': {
      performanceLevel: 'average',
      marketConditions: 'slow',
      familySupport: 'strong',
      financialConstraint: 'moderate',
      riskTolerance: 'low',
      externalOpportunities: 'limited',
    },
    'high-risk': {
      performanceLevel: 'above-average',
      marketConditions: 'growth',
      familySupport: 'minimal',
      financialConstraint: 'severe',
      riskTolerance: 'very-high',
      externalOpportunities: 'scarce',
    },
  };

  // Adjust based on coalition analysis if available
  if (coalitionAnalysis) {
    const health = coalitionAnalysis.coalitionHealth;
    const base = assumptions[scenarioType];

    // Adjust family support based on coalition cohesion
    if (health.cohesion > 80) {
      base.familySupport = 'full';
    } else if (health.cohesion < 40) {
      base.familySupport = 'minimal';
    }

    // Adjust risk tolerance based on coalition conflict
    if (health.conflictLevel > 60) {
      base.riskTolerance = 'very-low';
    }
  }

  return assumptions[scenarioType];
}

/**
 * Generate risk factors for a scenario
 */
function generateRiskFactors(
  scenarioType: ScenarioType,
  basePath: ExploredCareerPath,
  criticalityAnalysis: CriticalityAnalysis,
  config: ScenarioGeneratorConfig
): RiskFactor[] {
  const risks: RiskFactor[] = [];
  const baseProbability = config.riskAdjustments[scenarioType];

  // Transition risks
  basePath.edges?.forEach((edge, index) => {
    const risk: RiskFactor = {
      id: generateId('risk-transition'),
      name: `Transition Risk: ${edge.fromNodeId} → ${edge.toNodeId}`,
      description: `Risk of unsuccessful transition between career stages`,
      category: 'transition',
      probability: Math.round(baseProbability * (1 - getEdgeProbability(edge)) * 100),
      impact: Math.round(getEdgeDifficulty(edge) * 100),
      riskScore: 0,
      isMitigated: scenarioType === 'conservative',
      mitigations: [
        'Build transferable skills',
        'Network with professionals',
        'Gain relevant experience',
      ],
    };
    risk.riskScore = Math.round((risk.probability * risk.impact) / 100);
    risks.push(risk);
  });

  // Market risks
  risks.push({
    id: generateId('risk-market'),
    name: 'Market Demand Risk',
    description: 'Risk of decreased demand in chosen career field',
    category: 'market',
    probability: Math.round(baseProbability * 40),
    impact: 70,
    riskScore: 0,
    isMitigated: scenarioType === 'conservative' || scenarioType === 'best-case',
    mitigations: [
      'Diversify skill set',
      'Stay updated with industry trends',
      'Build professional network',
    ],
  });

  // Skill obsolescence risk
  risks.push({
    id: generateId('risk-skill'),
    name: 'Skill Obsolescence Risk',
    description: 'Risk of skills becoming outdated',
    category: 'skill',
    probability: Math.round(baseProbability * 30),
    impact: 60,
    riskScore: 0,
    isMitigated: scenarioType === 'best-case',
    mitigations: [
      'Continuous learning',
      'Pursue advanced certifications',
      'Develop adjacent skills',
    ],
  });

  // Financial risk
  risks.push({
    id: generateId('risk-financial'),
    name: 'Financial Constraint Risk',
    description: 'Risk of financial limitations affecting career progression',
    category: 'financial',
    probability: Math.round(baseProbability * 35),
    impact: 50,
    riskScore: 0,
    isMitigated: scenarioType === 'conservative',
    mitigations: [
      'Build emergency fund',
      'Seek scholarships/financial aid',
      'Consider part-time work',
    ],
  });

  // Calculate risk scores
  risks.forEach((risk) => {
    risk.riskScore = Math.round((risk.probability * risk.impact) / 100);
  });

  return risks;
}

/**
 * Generate milestones for a scenario
 */
function generateMilestones(
  basePath: ExploredCareerPath,
  scenarioType: ScenarioType,
  config: ScenarioGeneratorConfig,
  startYear: number
): ScenarioMilestone[] {
  const milestones: ScenarioMilestone[] = [];
  const achievementProbability = config.milestoneProbabilities[scenarioType];

  // Education milestones
  basePath.nodes?.forEach((node, index) => {
    if (node.type === 'exam' || node.type === 'degree') {
      const milestone: ScenarioMilestone = {
        id: generateId('milestone'),
        name: `Complete ${node.name}`,
        description: `Successfully complete ${node.name} requirement`,
        year: startYear + index,
        type: 'education',
        isAchieved: Math.random() < achievementProbability, // Note: In deterministic version, use hash-based
        conditions: [
          'Meet academic requirements',
          'Pass qualifying examinations',
          'Complete coursework',
        ],
        impact: 'major',
      };
      milestones.push(milestone);
    }
  });

  // Career transition milestones
  basePath.edges?.forEach((edge, index) => {
    const milestone: ScenarioMilestone = {
      id: generateId('milestone'),
      name: `Transition: ${edge.transitionType}`,
      description: edge.description,
      year: startYear + index + 1,
      type: 'transition',
      isAchieved: Math.random() < achievementProbability,
      conditions: getEdgePrerequisites(edge),
      impact: getEdgeDifficulty(edge) > 0.7 ? 'critical' : getEdgeDifficulty(edge) > 0.4 ? 'major' : 'moderate',
    };
    milestones.push(milestone);
  });

  // Promotion milestones (every 2-3 years)
  const promotionYears = scenarioType === 'best-case' ? 2 : scenarioType === 'high-risk' ? 4 : 3;
  for (let year = startYear + 2; year < startYear + 10; year += promotionYears) {
    milestones.push({
      id: generateId('milestone'),
      name: `Career Advancement Year ${year - startYear}`,
      description: 'Achieve next level of seniority',
      year,
      type: 'promotion',
      isAchieved: Math.random() < achievementProbability,
      conditions: [
        'Demonstrate competency',
        'Meet performance targets',
        'Gain required experience',
      ],
      impact: 'major',
    });
  }

  return milestones.sort((a, b) => a.year - b.year);
}

// ============================================================================
// MAIN GENERATOR CLASS
// ============================================================================

interface ExploredCareerPath {
  id: string;
  nodes: CareerNode[];
  edges: CareerEdge[];
}

export class FutureScenarioGeneratorV1 {
  private config: ScenarioGeneratorConfig;

  constructor(config: Partial<ScenarioGeneratorConfig> = {}) {
    this.config = {
      ...DEFAULT_SCENARIO_CONFIG,
      ...config,
    };
  }

  /**
   * Generate all 4 scenarios for a given input
   */
  generateScenarios(input: ScenarioGenerationInput): ScenarioGenerationResult {
    const {
      studentBelief,
      basePath,
      optionalityAnalysis,
      criticalityAnalysis,
      coalitionAnalysis,
      startYear = new Date().getFullYear(),
      duration = 10,
    } = input;

    const scenarioTypes: ScenarioType[] = ['best-case', 'expected', 'conservative', 'high-risk'];

    const scenarios = scenarioTypes.map(type =>
      this.generateSingleScenario(
        type,
        basePath,
        studentBelief,
        optionalityAnalysis,
        criticalityAnalysis,
        coalitionAnalysis,
        startYear,
        duration
      )
    );

    const comparison = this.generateComparison(scenarios);

    return {
      scenarios,
      basePathId: basePath.id,
      studentId: studentBelief.studentId,
      parameters: {
        startYear,
        duration,
        currentAge: input.currentAge,
      },
      comparison,
      generatedAt: Date.now(),
    };
  }

  /**
   * Generate a single scenario
   */
  private generateSingleScenario(
    scenarioType: ScenarioType,
    basePath: ExploredCareerPath,
    studentBelief: StudentBeliefV3,
    optionalityAnalysis: OptionalityAnalysis,
    criticalityAnalysis: CriticalityAnalysis,
    coalitionAnalysis: DecisionCoalitionAnalysis | undefined,
    startYear: number,
    duration: number
  ): FutureScenario {
    const id = generateId('scenario');

    // Generate career states from path nodes
    const careerStates = this.generateCareerStates(
      basePath,
      scenarioType,
      startYear
    );

    // Generate education states
    const educationStates = this.generateEducationStates(
      basePath,
      scenarioType,
      startYear
    );

    // Generate milestones
    const milestones = generateMilestones(
      basePath,
      scenarioType,
      this.config,
      startYear
    );

    // Generate income trajectory
    const incomeTrajectory = this.generateIncomeTrajectory(
      careerStates,
      scenarioType,
      startYear,
      duration
    );

    // Generate flexibility trajectory
    const flexibilityTrajectory = this.generateFlexibilityTrajectory(
      optionalityAnalysis,
      criticalityAnalysis,
      scenarioType,
      startYear,
      duration
    );

    // Generate metrics
    const metrics = this.calculateMetrics(
      incomeTrajectory,
      flexibilityTrajectory,
      careerStates,
      educationStates,
      scenarioType
    );

    // Generate assumptions
    const assumptions = determineAssumptions(scenarioType, studentBelief, coalitionAnalysis);

    // Generate risk factors
    const riskFactors = generateRiskFactors(
      scenarioType,
      basePath,
      criticalityAnalysis,
      this.config
    );

    return {
      id,
      type: scenarioType,
      name: this.getScenarioName(scenarioType),
      description: this.getScenarioDescription(scenarioType),
      basePathId: basePath.id,
      timelineYears: duration,
      careerStates,
      educationStates,
      milestones,
      incomeTrajectory,
      flexibilityTrajectory,
      metrics,
      assumptions,
      riskFactors,
      generatedAt: Date.now(),
    };
  }

  /**
   * Generate career states from path nodes
   */
  private generateCareerStates(
    basePath: ExploredCareerPath,
    scenarioType: ScenarioType,
    startYear: number
  ): CareerState[] {
    const states: CareerState[] = [];
    let currentYear = startYear;

    basePath.nodes?.forEach((node, index) => {
      const duration = node.typicalDuration || 1;

      const state: CareerState = {
        nodeId: node.id,
        name: node.name,
        type: this.mapNodeType(node.type ?? 'career'),
        year: currentYear,
        duration,
        seniority: calculateSeniority(currentYear - startYear),
        skillsAcquired: node.skillsGained || [],
        performanceLevel: this.getPerformanceLevel(scenarioType),
      };

      states.push(state);
      currentYear += duration;
    });

    return states;
  }

  /**
   * Map career node type to scenario state type
   */
  private mapNodeType(type: string): CareerState['type'] {
    switch (type) {
      case 'exam': return 'exam';
      case 'degree': return 'degree';
      case 'job': return 'career';
      case 'career': return 'career';
      case 'pivot': return 'pivot';
      default: return 'career';
    }
  }

  /**
   * Get performance level for scenario type
   */
  private getPerformanceLevel(scenarioType: ScenarioType): CareerState['performanceLevel'] {
    switch (scenarioType) {
      case 'best-case': return 'exceptional';
      case 'expected': return 'average';
      case 'conservative': return 'average';
      case 'high-risk': return 'above-average';
      default: return 'average';
    }
  }

  /**
   * Generate education states
   */
  private generateEducationStates(
    basePath: ExploredCareerPath,
    scenarioType: ScenarioType,
    startYear: number
  ): EducationState[] {
    const states: EducationState[] = [];
    let currentYear = startYear;

    basePath.nodes?.forEach((node) => {
      if (node.type === 'exam' || node.type === 'degree') {
        const duration = node.typicalDuration || 1;
        const cost = node.financialCost?.typical || 0;

        const outcomeProbabilities: Record<ScenarioType, EducationState['outcome']> = {
          'best-case': 'exceptional',
          'expected': 'average',
          'conservative': 'above-average',
          'high-risk': 'average',
        };

        const state: EducationState = {
          id: node.id,
          name: node.name,
          type: node.type === 'exam' ? 'exam' : 'degree',
          startYear: currentYear,
          endYear: currentYear + duration,
          status: 'completed',
          outcome: outcomeProbabilities[scenarioType],
          cost,
        };

        states.push(state);
        currentYear += duration;
      }
    });

    return states;
  }

  /**
   * Generate income trajectory
   */
  private generateIncomeTrajectory(
    careerStates: CareerState[],
    scenarioType: ScenarioType,
    startYear: number,
    duration: number
  ): IncomePoint[] {
    const trajectory: IncomePoint[] = [];

    // Base income by scenario type (INR)
    const baseIncomes: Record<ScenarioType, number> = {
      'best-case': 800000,
      'expected': 500000,
      'conservative': 400000,
      'high-risk': 600000,
    };

    let currentIncome = baseIncomes[scenarioType];

    for (let year = 0; year < duration; year++) {
      const actualYear = startYear + year;

      // Find current career state
      const currentState = careerStates.find(
        s => actualYear >= s.year && actualYear < s.year + s.duration
      );

      // Apply growth rate
      const growthRate = this.config.incomeGrowthRates[scenarioType];
      currentIncome = Math.round(currentIncome * (1 + growthRate));

      // Apply seniority multiplier if in a career state
      if (currentState && currentState.type === 'career') {
        const seniorityMultipliers: Record<CareerState['seniority'], number> = {
          'entry': 0.7,
          'junior': 0.85,
          'mid': 1.0,
          'senior': 1.3,
          'leadership': 1.8,
        };
        currentIncome = Math.round(currentIncome * seniorityMultipliers[currentState.seniority]);
      }

      trajectory.push({
        year: actualYear,
        annualIncome: currentIncome,
        monthlyIncome: Math.round(currentIncome / 12),
        growthRate,
        sources: {
          primary: currentIncome,
        },
      });
    }

    return trajectory;
  }

  /**
   * Generate flexibility trajectory
   */
  private generateFlexibilityTrajectory(
    optionalityAnalysis: OptionalityAnalysis,
    criticalityAnalysis: CriticalityAnalysis,
    scenarioType: ScenarioType,
    startYear: number,
    duration: number
  ): FlexibilityPoint[] {
    const trajectory: FlexibilityPoint[] = [];
    const baseOptionality = optionalityAnalysis.overallScore;
    const criticalityScore = criticalityAnalysis.criticalityScore;

    for (let year = 0; year < duration; year++) {
      const actualYear = startYear + year;

      const optionalityScore = calculateFlexibility(
        baseOptionality,
        year,
        scenarioType,
        this.config,
        criticalityScore
      );

      trajectory.push({
        year: actualYear,
        optionalityScore,
        reachableOptions: Math.round(optionalityScore * 2), // Approximate
        pivotPotential: Math.round(optionalityScore * 0.8),
        skillTransferability: Math.round(optionalityAnalysis.dimensions.transferableSkills.score * 100),
        geographicFlexibility: Math.round(optionalityAnalysis.dimensions.careerFlexibility.score * 100),
      });
    }

    return trajectory;
  }

  /**
   * Calculate scenario metrics
   */
  private calculateMetrics(
    incomeTrajectory: IncomePoint[],
    flexibilityTrajectory: FlexibilityPoint[],
    careerStates: CareerState[],
    educationStates: EducationState[],
    scenarioType: ScenarioType
  ): ScenarioMetrics {
    const totalIncome = incomeTrajectory.reduce((sum, point) => sum + point.annualIncome, 0);
    const peakIncome = Math.max(...incomeTrajectory.map(p => p.annualIncome));
    const averageIncome = Math.round(totalIncome / incomeTrajectory.length);
    const finalOptionality = flexibilityTrajectory[flexibilityTrajectory.length - 1]?.optionalityScore || 0;
    const averageFlexibility = Math.round(
      flexibilityTrajectory.reduce((sum, p) => sum + p.optionalityScore, 0) / flexibilityTrajectory.length
    );

    const transitionCount = careerStates.filter(s => s.type === 'pivot').length;
    const educationCompletionRate = educationStates.filter(s => s.status === 'completed').length /
      (educationStates.length || 1);

    // Probability based on scenario type
    const probabilities: Record<ScenarioType, number> = {
      'best-case': 15,
      'expected': 60,
      'conservative': 80,
      'high-risk': 35,
    };

    return {
      totalIncome,
      peakIncome,
      averageIncome,
      finalOptionality,
      averageFlexibility,
      transitionCount,
      educationCompletionRate,
      probability: probabilities[scenarioType],
    };
  }

  /**
   * Generate comparison across scenarios
   */
  private generateComparison(scenarios: FutureScenario[]): ScenarioComparison {
    // Find highest/lowest by various metrics
    const byIncome = [...scenarios].sort((a, b) => b.metrics.totalIncome - a.metrics.totalIncome);
    const byFlexibility = [...scenarios].sort((a, b) => b.metrics.averageFlexibility - a.metrics.averageFlexibility);
    const byRisk = [...scenarios].sort((a, b) => {
      const riskA = a.riskFactors.reduce((sum, r) => sum + r.riskScore, 0);
      const riskB = b.riskFactors.reduce((sum, r) => sum + r.riskScore, 0);
      return riskB - riskA;
    });
    const byProbability = [...scenarios].sort((a, b) => b.metrics.probability - a.metrics.probability);

    // Determine recommendation (prefer expected, then conservative)
    let recommended: ScenarioType = 'expected';
    let recommendationReason = 'The expected scenario represents the most likely trajectory based on current information.';

    const conservative = scenarios.find(s => s.type === 'conservative');
    const expected = scenarios.find(s => s.type === 'expected');

    if (conservative && conservative.metrics.probability > 75) {
      recommended = 'conservative';
      recommendationReason = 'The conservative scenario offers high probability of success with manageable risk.';
    } else if (expected && expected.metrics.probability > 50) {
      recommended = 'expected';
      recommendationReason = 'The expected scenario balances opportunity with realistic outcomes.';
    }

    return {
      income: {
        highest: byIncome[0]?.type || 'best-case',
        lowest: byIncome[byIncome.length - 1]?.type || 'conservative',
        mostStable: 'conservative',
      },
      flexibility: {
        highest: byFlexibility[0]?.type || 'best-case',
        lowest: byFlexibility[byFlexibility.length - 1]?.type || 'high-risk',
      },
      risk: {
        highest: byRisk[0]?.type || 'high-risk',
        lowest: byRisk[byRisk.length - 1]?.type || 'conservative',
      },
      probability: {
        highest: byProbability[0]?.type || 'conservative',
        lowest: byProbability[byProbability.length - 1]?.type || 'high-risk',
      },
      recommended,
      recommendationReason,
    };
  }

  /**
   * Get human-readable scenario name
   */
  private getScenarioName(type: ScenarioType): string {
    const names: Record<ScenarioType, string> = {
      'best-case': 'Best Case Scenario',
      'expected': 'Expected Scenario',
      'conservative': 'Conservative Scenario',
      'high-risk': 'High-Risk Scenario',
    };
    return names[type];
  }

  /**
   * Get scenario description
   */
  private getScenarioDescription(type: ScenarioType): string {
    const descriptions: Record<ScenarioType, string> = {
      'best-case': 'Optimal outcomes with favorable market conditions, exceptional performance, and strong support systems. Represents the upper bound of plausible outcomes.',
      'expected': 'Most likely trajectory based on average performance, stable market conditions, and moderate support. Represents the statistically expected outcome.',
      'conservative': 'Lower-risk path with steady progress, slower growth, and higher probability of success. Prioritizes stability over maximum upside.',
      'high-risk': 'Ambitious trajectory with higher uncertainty, requiring exceptional effort and favorable conditions. Offers higher potential rewards with increased risk.',
    };
    return descriptions[type];
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a new Future Scenario Generator instance
 */
export function createFutureScenarioGenerator(
  config?: Partial<ScenarioGeneratorConfig>
): FutureScenarioGeneratorV1 {
  return new FutureScenarioGeneratorV1(config);
}

/**
 * Generate scenarios with default configuration
 */
export function generateFutureScenarios(
  input: ScenarioGenerationInput
): ScenarioGenerationResult {
  const generator = new FutureScenarioGeneratorV1();
  return generator.generateScenarios(input);
}

// ============================================================================
// EXPORTS
// ============================================================================
