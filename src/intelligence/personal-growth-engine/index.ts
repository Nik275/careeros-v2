/**
 * Personal Growth Engine
 *
 * Track development potential across five core dimensions.
 *
 * ## Purpose
 *
 * - Model Skill Growth
 * - Model Confidence Growth
 * - Model Leadership Growth
 * - Model Communication Growth
 * - Model Decision Quality Growth
 *
 * ## Generates
 *
 * - **GrowthTrajectory** - Projected growth paths over time
 * - **Current State** - Current growth levels across dimensions
 * - **Potential State** - Achievable growth levels
 * - **Growth Gap** - Analysis of gaps between current and potential
 *
 * ## Five Growth Dimensions
 *
 * | Dimension | Description |
 * |-----------|-------------|
 * | **Skill** | Technical and professional skill acquisition |
 * | **Confidence** | Self-efficacy and comfort with challenges |
 * | **Leadership** | Ability to influence and guide others |
 * | **Communication** | Effectiveness in expressing ideas |
 * | **Decision Quality** | Sound judgment under uncertainty |
 *
 * ## Example Usage
 *
 * ```typescript
 * import {
 *   PersonalGrowthEngine,
 *   createPersonalGrowthEngine,
 * } from '@/intelligence/personal-growth-engine';
 *
 * // Create engine
 * const engine = createPersonalGrowthEngine();
 *
 * // Analyze growth
 * const result = engine.analyze({
 *   studentId: 'student-123',
 *   belief: currentBeliefSnapshot,
 *   beliefHistory: previousBeliefs,
 * });
 *
 * console.log(result.currentState.overallLevel);          // 0.65
 * console.log(result.potential.overallAchievable);        // 0.85
 * console.log(result.gapAnalysis.largestGap);             // 'leadership'
 * console.log(result.trajectory.overallShape);            // 'accelerating'
 *
 * // View insights
 * for (const insight of result.insights) {
 *   console.log(`${insight.type}: ${insight.description}`);
 * }
 *
 * // View recommendations
 * for (const rec of result.recommendations) {
 *   console.log(`[${rec.priority}] ${rec.recommendation}`);
 * }
 *
 * // Generate report
 * console.log(engine.generateReport(result));
 * ```
 *
 * ## Growth Gap Significance
 *
 * - **Critical** - Gap >= 50% of target (requires immediate attention)
 * - **Significant** - Gap >= 30% of target (high priority)
 * - **Moderate** - Gap >= 20% of target (address when possible)
 * - **Minor** - Gap >= 10% of target (nice to address)
 * - **Negligible** - Gap < 10% (minimal concern)
 *
 * ## Trajectory Shapes
 *
 * - **Linear** - Steady, consistent growth
 * - **Exponential** - Accelerating growth
 * - **Logarithmic** - Slowing growth (approaching limit)
 * - **S-Curve** - Slow start, rapid middle, plateau
 * - **Plateau** - Growth slowing significantly
 *
 * ## Design Principles
 *
 * - **Deterministic**: Same inputs always produce same outputs
 * - **Explainable**: All assessments have clear reasoning
 * - **Strong Typing**: Full TypeScript type safety
 * - **Compatible**: Works with StudentBeliefV3
 *
 * @module personal-growth-engine
 */

// ============================================================================
// TYPES
// ============================================================================

export type {
  // Growth dimensions
  GrowthDimension,
  GrowthState,
  GrowthIndicator,
  CurrentGrowthState,

  // Potential
  PotentialState,
  GrowthPotential,

  // Gap analysis
  GrowthGap,
  GrowthGapAnalysis,

  // Trajectory
  TrajectoryPoint,
  DimensionTrajectory,
  GrowthTrajectory,

  // Analysis output
  PersonalGrowthAnalysis,
  GrowthInsight,
  GrowthInsightType,
  GrowthRecommendation,

  // Input/output
  PersonalGrowthInput,
  PersonalGrowthOptions,
  PersonalGrowthConfig,
} from './types.js';

// ============================================================================
// CONSTANTS
// ============================================================================

export {
  GROWTH_DIMENSIONS,
  DIMENSION_DISPLAY_NAMES,
  DIMENSION_DESCRIPTIONS,
  DEFAULT_PERSONAL_GROWTH_CONFIG,
} from './types.js';

// ============================================================================
// MAIN ENGINE
// ============================================================================

export {
  PersonalGrowthEngine,
  createPersonalGrowthEngine,
  quickGrowthAnalysis,
  getDimensionDisplayName,
  getGrowthDimensions,
} from './PersonalGrowthEngine.js';

// ============================================================================
// ANALYSIS ALGORITHMS
// ============================================================================

export {
  assessCurrentState,
  assessPotential,
  analyzeGaps,
  generateTrajectory,
  generateInsights,
  generateRecommendations,
} from './analysis.js';
