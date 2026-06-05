/**
 * Value Evolution Engine
 *
 * Track how student values evolve over time.
 *
 * ## Tracked Values
 *
 * - **Money** (`income`) - Financial rewards
 * - **Status** (`status`) - Social standing and recognition
 * - **Impact** (`socialImpact`) - Making a difference
 * - **Freedom** (`freedom`) - Autonomy and control
 * - **Stability** (`stability`) - Security and predictability
 * - **Learning** (`growth`) - Growth and development
 * - **Family Approval** (`familyApproval`) - Alignment with family expectations
 * - **Optionality** (`optionality`) - Future options and flexibility
 *
 * ## Example Usage
 *
 * ```typescript
 * import {
 *   ValueEvolutionEngine,
 *   createValueEvolutionEngine,
 * } from '@/intelligence/value-evolution-engine';
 *
 * // Create engine
 * const engine = createValueEvolutionEngine();
 *
 * // Add value snapshots over time
 * engine.addSnapshot({
 *   studentId: 'student-123',
 *   timestamp: Date.now(),
 *   values: {
 *     income: 0.8,
 *     status: 0.6,
 *     socialImpact: 0.4,
 *     freedom: 0.5,
 *     stability: 0.3,
 *     growth: 0.7,
 *     familyApproval: 0.9,
 *     optionality: 0.4,
 *   },
 *   confidences: { ... },
 *   source: 'explicit-assessment',
 *   context: { lifeStage: 'early-career' },
 * });
 *
 * // Analyze evolution
 * const analysis = engine.analyze({ studentId: 'student-123' });
 *
 * // Check current dominant value
 * console.log(analysis.dominantValue.current); // 'familyApproval'
 *
 * // Check how freedom is evolving
 * console.log(analysis.evolutions['freedom'].pattern); // 'emerge', 'decline', 'stable', etc.
 *
 * // See predicted future
 * console.log(analysis.forecast?.predictedDominantValue);
 *
 * // Detected shifts
 * for (const shift of analysis.shifts) {
 *   console.log(`${shift.valueId} ${shift.direction}ed: ${shift.magnitude}`);
 * }
 * ```
 *
 * ## Evolution Patterns
 *
 * - `stable` - Value remains consistent
 * - `drift` - Gradual change over time
 * - `shift` - Sudden significant change
 * - `oscillate` - Back and forth movement
 * - `emerge` - New value becoming important
 * - `decline` - Value becoming less important
 * - `volatile` - Unstable, unpredictable changes
 * - `converge` - Moving toward balance
 *
 * ## Design Principles
 *
 * - **Deterministic**: Same inputs always produce same outputs
 * - **Explainable**: All patterns have clear reasoning
 * - **Strong Typing**: Full TypeScript type safety
 * - **Utility Engine Compatible**: Uses same value IDs
 *
 * @module value-evolution-engine
 */

// ============================================================================
// TYPES
// ============================================================================

export type {
  // Core types
  TrackedValueId,
  ValueSnapshot,
  SnapshotSource,
  SnapshotContext,
  SnapshotTrigger,

  // History
  ValueHistory,
  ValueHistorySummary,

  // Evolution
  EvolutionPattern,
  ValueEvolution,
  ValueShift,
  ValueDrift,
  ValueStability,
  DominantValueAnalysis,
  DominantValueSnapshot,

  // Forecasting
  ValueTrajectoryForecast,
  ForecastMethod,

  // Analysis
  ValueEvolutionAnalysis,
  ValueInsight,
  InsightType,
  ValueEvolutionRecommendation,
  ValueEvolutionInput,
  ValueEvolutionOptions,
  ValueEvolutionConfig,
} from './types.js';

// ============================================================================
// CONSTANTS
// ============================================================================

export {
  TRACKED_VALUES,
  VALUE_DISPLAY_NAMES,
  VALUE_TO_UTILITY_ATTRIBUTE,
  DEFAULT_VALUE_EVOLUTION_CONFIG,
} from './types.js';

// ============================================================================
// MAIN ENGINE
// ============================================================================

export {
  ValueEvolutionEngine,
  createValueEvolutionEngine,
  quickValueAnalysis,
  createValueSnapshot,
} from './ValueEvolutionEngine.js';

// ============================================================================
// DETECTION ALGORITHMS
// ============================================================================

export {
  detectEvolutionPattern,
  detectValueShifts,
  detectValueDrift,
  analyzeValueStability,
  analyzeDominantValues,
  forecastTrajectory,
} from './detection.js';
