/**
 * CareerOS Future Simulation Engine - Types
 *
 * Phase D.5: Future Simulation Engine
 *
 * Type definitions for simulating plausible future career outcomes.
 *
 * @module future-simulation-types
 * @version 1.0.0
 */

import type { CareerId } from '@/career-intelligence/career-types';

/**
 * Unique identifier for a future simulation.
 */
export type FutureSimulationId = string;

/**
 * Time horizons for simulation.
 */
export type TimeHorizon = 1 | 3 | 5 | 10 | 20;

/**
 * Scenario types.
 */
export type ScenarioType = 'OPTIMISTIC' | 'EXPECTED' | 'PESSIMISTIC';

/**
 * Configuration for the Future Simulation Engine.
 */
export interface FutureSimulationConfig {
  /** Default time horizons to simulate */
  readonly defaultTimeHorizons: TimeHorizon[];

  /** Confidence threshold for simulations (0-100) */
  readonly minConfidenceThreshold: number;

  /** Enable uncertainty modeling */
  readonly enableUncertaintyModeling: boolean;

  /** Maximum number of trajectories per scenario */
  readonly maxTrajectoriesPerScenario: number;

  /** Maximum number of key drivers to identify */
  readonly maxKeyDrivers: number;

  /** Maximum number of uncertainties to model */
  readonly maxUncertainties: number;
}

/**
 * Complete future simulation output.
 */
export interface FutureSimulation {
  /** Unique simulation identifier */
  readonly id: FutureSimulationId;

  /** Profile identifier */
  readonly profileId: string;

  /** Career identifier */
  readonly careerId: CareerId;

  /** Overall confidence in simulation (0-100) */
  readonly confidence: number;

  /** Time horizons included in simulation */
  readonly timeHorizons: TimeHorizon[];

  /** Scenarios for each time horizon */
  readonly scenarios: Record<TimeHorizon, ScenarioSet>;

  /** Key drivers of outcomes */
  readonly keyDrivers: KeyDriver[];

  /** Uncertainties and assumptions */
  readonly uncertainties: UncertaintyModel;

  /** Simulation timestamp */
  readonly simulatedAt: Date;
}

/**
 * Set of scenarios for a time horizon.
 */
export interface ScenarioSet {
  /** Time horizon in years */
  readonly timeHorizon: TimeHorizon;

  /** Optimistic scenario */
  readonly optimistic: CareerScenario;

  /** Expected/baseline scenario */
  readonly expected: CareerScenario;

  /** Pessimistic scenario */
  readonly pessimistic: CareerScenario;

  /** Scenario comparison summary */
  readonly comparison: ScenarioComparison;
}

/**
 * Single career scenario.
 */
export interface CareerScenario {
  /** Scenario type */
  readonly type: ScenarioType;

  /** Scenario description */
  readonly description: string;

  /** Time horizon */
  readonly timeHorizon: TimeHorizon;

  /** Career dimensions at this horizon */
  readonly dimensions: ScenarioDimensions;

  /** Likely career trajectory */
  readonly trajectory: CareerTrajectory;

  /** Potential outcomes */
  readonly outcomes: ScenarioOutcomes;

  /** Key assumptions for this scenario */
  readonly assumptions: string[];

  /** Probability estimate (qualitative) */
  readonly likelihood: LikelihoodEstimate;
}

/**
 * Scenario dimensions across career aspects.
 */
export interface ScenarioDimensions {
  /** Career growth level (0-100) */
  readonly careerGrowth: DimensionEstimate;

  /** Income growth trajectory (0-100) */
  readonly incomeGrowth: DimensionEstimate;

  /** Lifestyle evolution (0-100) */
  readonly lifestyleEvolution: DimensionEstimate;

  /** Skill development (0-100) */
  readonly skillDevelopment: DimensionEstimate;

  /** Career mobility (0-100) */
  readonly careerMobility: DimensionEstimate;

  /** Leadership potential realized (0-100) */
  readonly leadershipPotential: DimensionEstimate;

  /** Entrepreneurship potential (0-100) */
  readonly entrepreneurshipPotential: DimensionEstimate;

  /** Work-life balance (0-100) */
  readonly workLifeBalance: DimensionEstimate;
}

/**
 * Estimate for a single dimension.
 */
export interface DimensionEstimate {
  /** Estimated value (0-100) */
  readonly value: number;

  /** Confidence in estimate (0-100) */
  readonly confidence: number;

  /** Range of possible values */
  readonly range: ValueRange;

  /** Key factors influencing this dimension */
  readonly factors: string[];
}

/**
 * Range of possible values.
 */
export interface ValueRange {
  /** Lower bound */
  readonly min: number;

  /** Upper bound */
  readonly max: number;

  /** Most likely value within range */
  readonly likely: number;
}

/**
 * Likelihood estimate (qualitative).
 */
export type LikelihoodEstimate =
  | 'VERY_UNLIKELY'
  | 'UNLIKELY'
  | 'POSSIBLE'
  | 'LIKELY'
  | 'VERY_LIKELY';

/**
 * Career trajectory through roles.
 */
export interface CareerTrajectory {
  /** Starting role */
  readonly startingRole: string;

  /** Progression path */
  readonly path: TrajectoryStep[];

  /** Alternative paths branching off */
  readonly alternativePaths: AlternativePath[];

  /** End state at time horizon */
  readonly endState: TrajectoryEndState;

  /** Key transitions required */
  readonly keyTransitions: TransitionRequirement[];
}

/**
 * Single step in career trajectory.
 */
export interface TrajectoryStep {
  /** Step order */
  readonly order: number;

  /** Role title */
  readonly role: string;

  /** Level/seniority */
  readonly level: string;

  /** Estimated timeframe to reach */
  readonly estimatedYears: number;

  /** Requirements to reach this step */
  readonly requirements: string[];

  /** Probability of reaching this step */
  readonly probability: LikelihoodEstimate;
}

/**
 * Alternative career path.
 */
export interface AlternativePath {
  /** Path name */
  readonly name: string;

  /** Description */
  readonly description: string;

  /** Branch point (step number) */
  readonly branchPoint: number;

  /** Target roles */
  readonly targetRoles: string[];

  /** Likelihood of taking this path */
  readonly likelihood: LikelihoodEstimate;
}

/**
 * End state of trajectory.
 */
export interface TrajectoryEndState {
  /** Likely role at horizon */
  readonly role: string;

  /** Level achieved */
  readonly level: string;

  /** Scope of responsibility */
  readonly scope: string;

  /** Income band (qualitative) */
  readonly incomeBand: IncomeBand;

  /** Satisfaction estimate (0-100) */
  readonly estimatedSatisfaction: number;
}

/**
 * Income band (qualitative).
 */
export type IncomeBand =
  | 'ENTRY'
  | 'MID'
  | 'SENIOR'
  | 'EXECUTIVE'
  | 'TOP';

/**
 * Transition requirement between roles.
 */
export interface TransitionRequirement {
  /** From role */
  readonly fromRole: string;

  /** To role */
  readonly toRole: string;

  /** Skills needed */
  readonly requiredSkills: string[];

  /** Experience needed */
  readonly requiredExperience: string;

  /** Difficulty of transition (0-100) */
  readonly difficulty: number;
}

/**
 * Potential outcomes for a scenario.
 */
export interface ScenarioOutcomes {
  /** Potential advantages */
  readonly advantages: PotentialOutcome[];

  /** Potential risks */
  readonly risks: PotentialOutcome[];

  /** Potential opportunities */
  readonly opportunities: PotentialOutcome[];

  /** Potential constraints */
  readonly constraints: PotentialOutcome[];
}

/**
 * Single potential outcome.
 */
export interface PotentialOutcome {
  /** Outcome name */
  readonly name: string;

  /** Detailed description */
  readonly description: string;

  /** Likelihood */
  readonly likelihood: LikelihoodEstimate;

  /** Impact if realized (0-100) */
  readonly impact: number;

  /** Timeframe when this might occur */
  readonly timeframe: string;
}

/**
 * Comparison between scenarios.
 */
export interface ScenarioComparison {
  /** Key differences summary */
  readonly keyDifferences: string[];

  /** What changes between scenarios */
  readonly changingFactors: string[];

  /** What stays consistent */
  readonly consistentFactors: string[];

  /** Most sensitive assumptions */
  readonly sensitiveAssumptions: string[];
}

/**
 * Key driver of outcomes.
 */
export interface KeyDriver {
  /** Driver identifier */
  readonly id: string;

  /** Driver name */
  readonly name: string;

  /** Description */
  readonly description: string;

  /** Category */
  readonly category: DriverCategory;

  /** Importance (0-100) */
  readonly importance: number;

  /** How this driver influences outcomes */
  readonly influence: string;

  /** Student controllable or external */
  readonly controllability: 'CONTROLLABLE' | 'PARTIAL' | 'EXTERNAL';
}

/**
 * Driver category.
 */
export type DriverCategory =
  | 'PERSONAL'
  | 'SKILL'
  | 'BEHAVIOR'
  | 'MARKET'
  | 'ORGANIZATION'
  | 'NETWORK';

/**
 * Uncertainty model for simulation.
 */
export interface UncertaintyModel {
  /** Known unknowns */
  readonly knownUnknowns: KnownUnknown[];

  /** Key assumptions made */
  readonly assumptions: SimulationAssumption[];

  /** Confidence limits */
  readonly confidenceLimits: ConfidenceLimits;

  /** Sensitivity of outcomes to changes */
  readonly sensitivity: SensitivityAnalysis;
}

/**
 * Known unknown factor.
 */
export interface KnownUnknown {
  /** Unknown identifier */
  readonly id: string;

  /** Description of what is unknown */
  readonly description: string;

  /** Why it matters */
  readonly impact: string;

  /** Confidence we have about this (0-100) */
  readonly confidence: number;
}

/**
 * Simulation assumption.
 */
export interface SimulationAssumption {
  /** Assumption identifier */
  readonly id: string;

  /** What is assumed */
  readonly statement: string;

  /** Basis for assumption */
  readonly basis: string;

  /** Risk if assumption is wrong */
  readonly riskIfWrong: string;
}

/**
 * Confidence limits for estimates.
 */
export interface ConfidenceLimits {
  /** Overall confidence in simulation (0-100) */
  readonly overall: number;

  /** Confidence by time horizon */
  readonly byHorizon: Record<TimeHorizon, number>;

  /** Confidence by dimension */
  readonly byDimension: Record<string, number>;
}

/**
 * Sensitivity analysis.
 */
export interface SensitivityAnalysis {
  /** Factors with high impact on outcomes */
  readonly highImpactFactors: string[];

  /** Factors with moderate impact */
  readonly moderateImpactFactors: string[];

  /** Factors with low impact */
  readonly lowImpactFactors: string[];

  /** Scenario boundaries */
  readonly scenarioBoundaries: ScenarioBoundaries;
}

/**
 * Scenario boundary conditions.
 */
export interface ScenarioBoundaries {
  /** What must be true for optimistic scenario */
  readonly optimisticConditions: string[];

  /** What must be true for expected scenario */
  readonly expectedConditions: string[];

  /** What must be true for pessimistic scenario */
  readonly pessimisticConditions: string[];
}

/**
 * Simulation explanation.
 */
export interface SimulationExplanation {
  /** Overall summary */
  readonly summary: string;

  /** Why scenarios differ */
  readonly whyScenariosDiffer: string[];

  /** What assumptions change */
  readonly changingAssumptions: string[];

  /** What factors matter most */
  readonly keyFactorsMatterMost: string[];

  /** What to monitor */
  readonly monitoringGuidance: string[];
}

/**
 * Input for future simulation.
 */
export interface FutureSimulationInput {
  /** Unique simulation identifier */
  readonly simulationId: FutureSimulationId;

  /** Profile identifier */
  readonly profileId: string;

  /** Career identifier */
  readonly careerId: CareerId;

  /** Time horizons to simulate (optional, uses defaults if not provided) */
  readonly timeHorizons?: TimeHorizon[];
}

/**
 * Trajectory analysis output.
 */
export interface TrajectoryAnalysis {
  /** Career identifier */
  readonly careerId: CareerId;

  /** Primary trajectory */
  readonly primaryTrajectory: CareerTrajectory;

  /** Alternative trajectories */
  readonly alternativeTrajectories: CareerTrajectory[];

  /** Key decision points */
  readonly decisionPoints: DecisionPoint[];

  /** Trajectory confidence (0-100) */
  readonly confidence: number;
}

/**
 * Decision point in trajectory.
 */
export interface DecisionPoint {
  /** Point identifier */
  readonly id: string;

  /** Description */
  readonly description: string;

  /** When this decision occurs */
  readonly timeframe: string;

  /** Options available */
  readonly options: string[];

  /** Implications of each option */
  readonly implications: Record<string, string>;
}

/**
 * Result wrapper for future simulation operations.
 */
export interface FutureSimulationResult<T> {
  /** Whether the operation succeeded */
  readonly success: boolean;

  /** Result data (if successful) */
  readonly data?: T;

  /** Error code (if failed) */
  readonly error?: SimulationErrorCode;

  /** Error message (if failed) */
  readonly errorMessage?: string;

  /** Operation timestamp */
  readonly timestamp: Date;
}

/**
 * Error codes for future simulation operations.
 */
export type SimulationErrorCode =
  | 'INVALID_INPUT'
  | 'CAREER_NOT_FOUND'
  | 'PROFILE_NOT_FOUND'
  | 'INSUFFICIENT_DATA'
  | 'CONFIDENCE_TOO_LOW'
  | 'SIMULATION_ERROR';

/**
 * Default configuration for the Future Simulation Engine.
 */
export const DEFAULT_FUTURE_SIMULATION_CONFIG: FutureSimulationConfig = {
  defaultTimeHorizons: [1, 3, 5, 10, 20],
  minConfidenceThreshold: 40,
  enableUncertaintyModeling: true,
  maxTrajectoriesPerScenario: 3,
  maxKeyDrivers: 8,
  maxUncertainties: 6,
};

/**
 * Maps likelihood estimate to numeric probability range.
 *
 * @param likelihood - Qualitative likelihood
 * @returns Probability range
 */
export function likelihoodToRange(likelihood: LikelihoodEstimate): { min: number; max: number } {
  const ranges: Record<LikelihoodEstimate, { min: number; max: number }> = {
    'VERY_UNLIKELY': { min: 0, max: 15 },
    'UNLIKELY': { min: 15, max: 35 },
    'POSSIBLE': { min: 35, max: 65 },
    'LIKELY': { min: 65, max: 85 },
    'VERY_LIKELY': { min: 85, max: 100 },
  };

  return ranges[likelihood];
}

/**
 * Gets scenario type color (for potential UI use).
 *
 * @param type - Scenario type
 * @returns Color identifier
 */
export function getScenarioTypeColor(type: ScenarioType): string {
  const colors: Record<ScenarioType, string> = {
    'OPTIMISTIC': 'green',
    'EXPECTED': 'blue',
    'PESSIMISTIC': 'orange',
  };

  return colors[type];
}
