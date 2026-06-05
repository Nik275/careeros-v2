/**
 * Value Evolution Engine - Types
 *
 * Type definitions for tracking how student values evolve over time.
 *
 * Design Principles:
 * - Strong typing for all value measurements
 * - Deterministic evolution tracking
 * - Compatible with Utility Engine (UtilityAttributeId)
 * - Explainable value changes
 */

import type { UtilityAttributeId } from '../maut-foundation/MAUTFoundationV1.js';
import type { EntityId, ConfidenceScore } from '../types/index.js';

// ============================================================================
// CORE VALUE DEFINITIONS
// ============================================================================

/**
 * The 8 core values tracked by the evolution engine.
 * Maps to UtilityAttributeId for compatibility with Utility Engine.
 */
export const TRACKED_VALUES = [
  'income',           // Money
  'status',           // Status
  'socialImpact',     // Impact
  'freedom',          // Freedom
  'stability',        // Stability
  'growth',           // Learning
  'familyApproval',   // Family Approval
  'optionality',      // Optionality
] as const;

/** Type for tracked value IDs */
export type TrackedValueId = (typeof TRACKED_VALUES)[number];

/**
 * Map tracked values to their display names.
 */
export const VALUE_DISPLAY_NAMES: Record<TrackedValueId, string> = {
  income: 'Money',
  status: 'Status',
  socialImpact: 'Impact',
  freedom: 'Freedom',
  stability: 'Stability',
  growth: 'Learning',
  familyApproval: 'Family Approval',
  optionality: 'Optionality',
};

/**
 * Map tracked values to their UtilityAttributeId.
 * These are the same in this case, but explicit mapping allows flexibility.
 */
export const VALUE_TO_UTILITY_ATTRIBUTE: Record<TrackedValueId, UtilityAttributeId> = {
  income: 'income',
  status: 'status',
  socialImpact: 'socialImpact',
  freedom: 'freedom',
  stability: 'stability',
  growth: 'growth',
  familyApproval: 'familyApproval',
  optionality: 'optionality',
};

// ============================================================================
// VALUE SNAPSHOTS
// ============================================================================

/**
 * A single measurement of all tracked values at a point in time.
 */
export interface ValueSnapshot {
  /** Unique identifier for this snapshot */
  id: string;

  /** When this snapshot was taken */
  timestamp: number;

  /** Student identifier */
  studentId: EntityId;

  /** Value measurements (0.0 - 1.0 scale) */
  values: Record<TrackedValueId, number>;

  /** Confidence in each value measurement */
  confidences: Record<TrackedValueId, ConfidenceScore>;

  /** Source of this snapshot (e.g., 'explicit-assessment', 'behavioral-inference') */
  source: SnapshotSource;

  /** Context for this snapshot */
  context: SnapshotContext;

  /** Triggering event, if any */
  trigger?: SnapshotTrigger;
}

/** Source types for snapshots */
export type SnapshotSource =
  | 'explicit-assessment'      // Student explicitly stated values
  | 'behavioral-inference'     // Inferred from behavior
  | 'tradeoff-response'        // Derived from tradeoff choices
  | 'decision-signal'          // Derived from actual decisions
  | 'periodic-checkin'         // Regular check-in assessment
  | 'event-driven'             // Triggered by life event
  | 'engine-derived';          // Derived from other engines

/** Context for a snapshot */
export interface SnapshotContext {
  /** Life stage at time of snapshot */
  lifeStage?: string;

  /** External factors influencing values */
  externalFactors?: string[];

  /** Recent experiences or events */
  recentExperiences?: string[];

  /** Additional context data */
  metadata?: Record<string, unknown>;
}

/** Trigger for taking a snapshot */
export interface SnapshotTrigger {
  /** Type of trigger */
  type: 'scheduled' | 'event' | 'milestone' | 'manual' | 'anomaly';

  /** Description of what triggered the snapshot */
  description: string;

  /** ID of triggering event, if applicable */
  eventId?: string;
}

// ============================================================================
// VALUE HISTORY
// ============================================================================

/**
 * Complete history of value snapshots for a student.
 */
export interface ValueHistory {
  /** Student identifier */
  studentId: EntityId;

  /** Chronological list of snapshots */
  snapshots: ValueSnapshot[];

  /** When history tracking started */
  startedAt: number;

  /** Last update timestamp */
  lastUpdatedAt: number;

  /** Summary statistics */
  summary: ValueHistorySummary;
}

/**
 * Summary statistics for value history.
 */
export interface ValueHistorySummary {
  /** Total number of snapshots */
  snapshotCount: number;

  /** Time span of history (ms) */
  timeSpanMs: number;

  /** Average value for each tracked value */
  averages: Record<TrackedValueId, number>;

  /** Value with highest average importance */
  dominantValue: TrackedValueId;

  /** Most recent dominant value */
  currentDominantValue: TrackedValueId;

  /** Whether any major shifts have occurred */
  hasMajorShifts: boolean;

  /** Number of detected shifts */
  shiftCount: number;
}

// ============================================================================
// EVOLUTION DETECTION
// ============================================================================

/**
 * Types of value evolution patterns.
 */
export type EvolutionPattern =
  | 'stable'           // Value remains consistent
  | 'drift'            // Gradual change over time
  | 'shift'            // Sudden significant change
  | 'oscillate'        // Back and forth movement
  | 'emerge'           // New value becoming important
  | 'decline'          // Value becoming less important
  | 'volatile'         // Unstable, unpredictable changes
  | 'converge';        // Moving toward balance across values

/**
 * Detected evolution for a specific value.
 */
export interface ValueEvolution {
  /** The value being tracked */
  valueId: TrackedValueId;

  /** Detected evolution pattern */
  pattern: EvolutionPattern;

  /** Starting importance (first snapshot) */
  startValue: number;

  /** Current importance (latest snapshot) */
  currentValue: number;

  /** Total change (current - start) */
  totalChange: number;

  /** Rate of change per month */
  changeRatePerMonth: number;

  /** Confidence in evolution detection */
  confidence: ConfidenceScore;

  /** Explanation of detected pattern */
  explanation: string;
}

/**
 * A detected value shift (major change).
 */
export interface ValueShift {
  /** Unique identifier for this shift */
  id: string;

  /** Value that shifted */
  valueId: TrackedValueId;

  /** When the shift occurred */
  timestamp: number;

  /** Importance before shift */
  beforeValue: number;

  /** Importance after shift */
  afterValue: number;

  /** Magnitude of shift */
  magnitude: number;

  /** Whether this was an increase or decrease */
  direction: 'increase' | 'decrease';

  /** Significance of the shift */
  significance: 'minor' | 'moderate' | 'major' | 'transformative';

  /** Potential causes or triggers */
  potentialCauses: string[];

  /** Explanation of the shift */
  explanation: string;
}

/**
 * Value drift detection result.
 */
export interface ValueDrift {
  /** Whether drift was detected */
  hasDrift: boolean;

  /** Values that have drifted */
  driftedValues: TrackedValueId[];

  /** Drift magnitude for each value */
  driftMagnitudes: Record<TrackedValueId, number>;

  /** Overall drift score (0-1) */
  overallDriftScore: number;

  /** Explanation of drift */
  explanation: string;
}

/**
 * Value stability analysis.
 */
export interface ValueStability {
  /** Overall stability score (0-1, higher = more stable) */
  overallStability: number;

  /** Stability for each value */
  valueStability: Record<TrackedValueId, number>;

  /** Most stable value */
  mostStableValue: TrackedValueId;

  /** Least stable value */
  leastStableValue: TrackedValueId;

  /** Whether values are generally stable */
  isGenerallyStable: boolean;

  /** Explanation of stability analysis */
  explanation: string;
}

// ============================================================================
// DOMINANT VALUE ANALYSIS
// ============================================================================

/**
 * Analysis of which values are dominant.
 */
export interface DominantValueAnalysis {
  /** Currently dominant value */
  current: TrackedValueId;

  /** Previously dominant value (if changed) */
  previous?: TrackedValueId;

  /** When the dominant value changed */
  changedAt?: number;

  /** All values ranked by importance */
  ranking: TrackedValueId[];

  /** Top value importance score */
  topScore: number;

  /** Gap between top and second */
  dominanceGap: number;

  /** Whether dominance is clear or contested */
  isClearDominance: boolean;

  /** Explanation of dominance */
  explanation: string;
}

// ============================================================================
// FORECASTING
// ============================================================================

/**
 * Forecast of future value trajectory.
 */
export interface ValueTrajectoryForecast {
  /** Forecast identifier */
  id: string;

  /** When forecast was generated */
  generatedAt: number;

  /** Forecast horizon (months) */
  horizonMonths: number;

  /** Predicted values at horizon */
  predictedValues: Record<TrackedValueId, number>;

  /** Confidence intervals for predictions */
  confidenceIntervals: Record<TrackedValueId, { lower: number; upper: number }>;

  /** Predicted dominant value */
  predictedDominantValue: TrackedValueId;

  /** Confidence in forecast */
  forecastConfidence: ConfidenceScore;

  /** Forecast method used */
  method: ForecastMethod;

  /** Assumptions underlying forecast */
  assumptions: string[];

  /** Explanation of forecast */
  explanation: string;
}

/** Forecast method used */
export type ForecastMethod =
  | 'linear-trend'           // Simple linear projection
  | 'moving-average'         // Moving average extrapolation
  | 'momentum-based'         // Continue recent direction
  | 'reversion-mean'         // Trend toward historical average
  | 'stable-assumption';     // Assume no change

// ============================================================================
// EVOLUTION ANALYSIS OUTPUT
// ============================================================================

/**
 * Complete value evolution analysis output.
 */
export interface ValueEvolutionAnalysis {
  /** Analysis identifier */
  id: string;

  /** Student identifier */
  studentId: EntityId;

  /** When analysis was performed */
  generatedAt: number;

  /** Value history used for analysis */
  history: ValueHistory;

  /** Evolution for each tracked value */
  evolutions: Record<TrackedValueId, ValueEvolution>;

  /** Detected value shifts */
  shifts: ValueShift[];

  /** Drift analysis */
  drift: ValueDrift;

  /** Stability analysis */
  stability: ValueStability;

  /** Dominant value analysis */
  dominantValue: DominantValueAnalysis;

  /** Past dominant values (timeline) */
  dominantValueTimeline: DominantValueSnapshot[];

  /** Future forecast */
  forecast?: ValueTrajectoryForecast;

  /** Key insights */
  insights: ValueInsight[];

  /** Recommendations based on evolution */
  recommendations: ValueEvolutionRecommendation[];
}

/**
 * Snapshot of dominant value at a point in time.
 */
export interface DominantValueSnapshot {
  timestamp: number;
  dominantValue: TrackedValueId;
  score: number;
}

/**
 * Insight from value evolution analysis.
 */
export interface ValueInsight {
  /** Insight identifier */
  id: string;

  /** Type of insight */
  type: InsightType;

  /** Insight description */
  description: string;

  /** Supporting evidence */
  evidence: string[];

  /** Confidence in insight */
  confidence: ConfidenceScore;
}

/** Types of insights */
export type InsightType =
  | 'value-shift'          // Major value shift detected
  | 'emerging-value'       // New value becoming important
  | 'declining-value'      // Value losing importance
  | 'stable-priority'      // Consistent value over time
  | 'conflict-pattern'     // Pattern of value conflict
  | 'decision-driver'      // What drives decisions
  | 'maturity-indicator'   // Sign of growing maturity
  | 'external-influence';  // Values changing due to external factors

/**
 * Recommendation based on value evolution.
 */
export interface ValueEvolutionRecommendation {
  /** Recommendation identifier */
  id: string;

  /** What this recommendation addresses */
  area: 'assessment' | 'recommendation' | 'communication' | 'exploration';

  /** Recommendation text */
  recommendation: string;

  /** Rationale based on evolution analysis */
  rationale: string;

  /** Priority */
  priority: 'low' | 'medium' | 'high' | 'critical';
}

// ============================================================================
// ENGINE INPUT/OUTPUT
// ============================================================================

/**
 * Input for value evolution analysis.
 */
export interface ValueEvolutionInput {
  /** Student identifier */
  studentId: EntityId;

  /** Value history (or snapshots to build history from) */
  history?: ValueHistory;

  /** Snapshots to add to history (id will be auto-generated) */
  newSnapshots?: Omit<ValueSnapshot, 'id'>[];

  /** Analysis options */
  options?: ValueEvolutionOptions;
}

/**
 * Options for value evolution analysis.
 */
export interface ValueEvolutionOptions {
  /** Whether to detect shifts */
  detectShifts?: boolean;

  /** Threshold for considering a change a shift (0-1) */
  shiftThreshold?: number;

  /** Whether to forecast future trajectory */
  generateForecast?: boolean;

  /** Forecast horizon in months */
  forecastHorizonMonths?: number;

  /** Minimum snapshots required for analysis */
  minSnapshots?: number;

  /** Whether to include insights */
  generateInsights?: boolean;

  /** Whether to include recommendations */
  generateRecommendations?: boolean;
}

/**
 * Configuration for ValueEvolutionEngine.
 */
export interface ValueEvolutionConfig {
  /** Maximum snapshots to retain per student */
  maxSnapshots: number;

  /** Default shift detection threshold */
  shiftThreshold: number;

  /** Default forecast horizon (months) */
  defaultForecastHorizon: number;

  /** Minimum snapshots for reliable analysis */
  minSnapshotsForAnalysis: number;

  /** Drift detection sensitivity (0-1) */
  driftSensitivity: number;

  /** Stability threshold (values above this considered stable) */
  stabilityThreshold: number;
}

/** Default configuration */
export const DEFAULT_VALUE_EVOLUTION_CONFIG: ValueEvolutionConfig = {
  maxSnapshots: 50,
  shiftThreshold: 0.25,
  defaultForecastHorizon: 12,
  minSnapshotsForAnalysis: 3,
  driftSensitivity: 0.15,
  stabilityThreshold: 0.7,
};
