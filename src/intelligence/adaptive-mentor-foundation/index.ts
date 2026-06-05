/**
 * Adaptive Mentor Foundation
 *
 * Provide guidance using longitudinal intelligence.
 *
 * ## Purpose
 *
 * Process inputs:
 *   - StudentBelief
 *   - Identity Development
 *   - Value Evolution
 *   - Outcome History
 *   - Decision History
 *
 * Generates:
 *   - **MentorContext** - Complete context for mentor guidance
 *   - **MentorInsights** - Pattern-based insights
 *   - **GrowthObservations** - Growth-related observations
 *   - **DecisionWarnings** - Warnings about decision issues
 *
 * ## Example Guidance
 *
 * ```
 * You are optimizing for status today.
 * Historically, your strongest satisfaction came from autonomy and creation.
 * Consider whether your current preference is temporary.
 * ```
 *
 * ## Contrast Types
 *
 * | Type | Description |
 * |------|-------------|
 * | `value_shift` | Value priority has changed |
 * | `identity_drift` | Identity has shifted |
 * | `confidence_change` | Confidence level changed |
 * | `satisfaction_gap` | Current priorities don't align with historical satisfaction |
 * | `goal_misalignment` | Current goals misaligned with values |
 * | `pattern_break` | Established pattern broken |
 *
 * ## Usage Example
 *
 * ```typescript
 * import {
 *   AdaptiveMentorFoundation,
 *   createAdaptiveMentorFoundation,
 * } from '@/intelligence/adaptive-mentor-foundation';
 *
 * // Create foundation
 * const foundation = createAdaptiveMentorFoundation();
 *
 * // Analyze student
 * const output = foundation.analyze({
 *   studentId: 'student-123',
 *   belief: currentBelief,
 *   longitudinalAnalysis: longitudinalResult,
 *   valueEvolution: valueResult,
 *   identityProfile: identityResult.profile,
 *   growthAnalysis: growthResult,
 * });
 *
 * // Access contrasts
 * console.log(output.context.contrasts[0].reflectionPrompt);
 * // "You are optimizing for status today.
 * //  Historically, your strongest satisfaction came from autonomy and creation.
 * //  Consider whether your current preference is temporary."
 *
 * // View insights
 * for (const insight of output.insights) {
 *   console.log(`${insight.title}: ${insight.description}`);
 * }
 *
 * // Check warnings
 * for (const warning of output.decisionWarnings) {
 *   console.log(`[${warning.severity}] ${warning.concern}`);
 * }
 *
 * // Generate guidance
 * console.log(foundation.generateGuidance(output));
 * ```
 *
 * ## Architecture
 *
 * - **Foundation Layer**: No LLM integration - deterministic logic only
 * - **Pattern-Based**: Insights derived from longitudinal patterns
 * - **Explainable**: Every insight has clear evidence
 * - **Compatible**: Works with all intelligence engines
 *
 * ## Integration Points
 *
 * - **Longitudinal Intelligence Engine** - Provides timeline and patterns
 * - **Value Evolution Engine** - Tracks value shifts
 * - **Identity Development Engine** - Tracks identity changes
 * - **Personal Growth Engine** - Provides growth data
 *
 * @module adaptive-mentor-foundation
 */

// ============================================================================
// TYPES
// ============================================================================

export type {
  // Context
  MentorContext,
  StudentStateSnapshot,
  HistoricalPatterns,
  StateContrast,
  ContrastType,
  ActiveConsideration,
  ConsiderationCategory,
  GuidancePriority,

  // Insights
  MentorInsight,
  MentorInsightType,

  // Observations
  GrowthObservation,
  GrowthObservationType,

  // Warnings
  DecisionWarning,
  DecisionWarningType,

  // Output
  MentorFoundationOutput,
  MentorFoundationInput,
  MentorFoundationOptions,
  MentorFoundationConfig,
} from './types.js';

// ============================================================================
// CONSTANTS
// ============================================================================

export {
  DEFAULT_MENTOR_FOUNDATION_CONFIG,
} from './types.js';

// ============================================================================
// MAIN FOUNDATION
// ============================================================================

export {
  AdaptiveMentorFoundation,
  createAdaptiveMentorFoundation,
  quickMentorAnalysis,
  generateSatisfactionGapWarning,
} from './AdaptiveMentorFoundation.js';

// ============================================================================
// ANALYSIS ALGORITHMS
// ============================================================================

export {
  buildMentorContext,
  generateInsights,
  generateGrowthObservations,
  generateDecisionWarnings,
} from './analysis.js';
