/**
 * Identity Development Engine
 *
 * Model identity formation and evolution.
 *
 * ## Purpose
 *
 * - Track interests, strengths, beliefs, values, aspirations
 * - Identify emerging, stable, and conflicted identities
 * - Generate IdentityProfile, IdentityConfidence, IdentityEvolution
 *
 * ## Identity Archetypes
 *
 * - **Builder** - Creates things, entrepreneurial, hands-on
 * - **Researcher** - Investigates, analyzes, seeks truth
 * - **Helper** - Supports others, service-oriented, empathetic
 * - **Artist** - Creates beauty, expressive, original
 * - **Organizer** - Structures, plans, coordinates
 * - **Leader** - Directs, influences, takes responsibility
 * - **Technician** - Masters tools, precise, skilled
 * - **Strategist** - Plans, sees patterns, big-picture
 * - **Performer** - Presenter, entertainer, communicator
 * - **Protector** - Defends, secures, ensures safety
 * - **Educator** - Teaches, explains, develops others
 * - **Innovator** - Disrupts, experiments, challenges norms
 * - **Craftsperson** - Masters craft, quality-focused, detail-oriented
 * - **Explorer** - Discovers, travels, seeks novelty
 * - **Healer** - Restores, cares for, nurtures
 *
 * ## Example Usage
 *
 * ```typescript
 * import {
 *   IdentityDevelopmentEngine,
 *   createIdentityDevelopmentEngine,
 * } from '@/intelligence/identity-development-engine';
 *
 * // Create engine
 * const engine = createIdentityDevelopmentEngine();
 *
 * // Analyze identity
 * const result = engine.analyze({
 *   studentId: 'student-123',
 *   belief: currentBeliefSnapshot,
 *   beliefHistory: previousBeliefs,
 * });
 *
 * console.log(result.profile.primaryIdentity);  // 'builder'
 * console.log(result.profile.status);           // 'emerging'
 * console.log(result.profile.identityConfidence.builder.score);
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
 * ```
 *
 * ## Identity Status
 *
 * - `emerging` - Identity forming, signals building
 * - `developing` - Identity becoming clearer
 * - `stable` - Identity well-established
 * - `conflicted` - Multiple competing identities
 * - `transitioning` - Identity is changing
 * - `unclear` - Insufficient data to determine
 * - `complex` - Multiple blended identities
 *
 * ## Design Principles
 *
 * - **Deterministic**: Same inputs always produce same outputs
 * - **Explainable**: All identity assessments have clear reasoning
 * - **Strong Typing**: Full TypeScript type safety
 * - **Compatible**: Works with StudentBeliefV3
 *
 * @module identity-development-engine
 */

// ============================================================================
// TYPES
// ============================================================================

export type {
  // Core types
  IdentityArchetypeId,
  ArchetypeDefinition,
  IdentitySignal,
  SignalType,
  SignalSource,

  // Identity profile
  IdentityProfile,
  IdentityConfidence,
  IdentityConflict,
  ConflictType,
  IdentityStatus,

  // Evolution
  IdentityEvolution,
  IdentitySnapshot,
  IdentityTransition,
  TransitionType,
  EvolutionPattern,
  PrimaryIdentityRecord,

  // Analysis
  IdentityAnalysisInput,
  IdentityAnalysisOptions,
  IdentityAnalysisOutput,
  IdentityInsight,
  InsightType,
  IdentityRecommendation,
  IdentityDevelopmentConfig,
} from './types.js';

// ============================================================================
// CONSTANTS
// ============================================================================

export {
  IDENTITY_ARCHETYPES,
  ARCHETYPE_DISPLAY_NAMES,
  ARCHETYPE_DEFINITIONS,
  DEFAULT_IDENTITY_CONFIG,
} from './types.js';

// ============================================================================
// MAIN ENGINE
// ============================================================================

export {
  IdentityDevelopmentEngine,
  createIdentityDevelopmentEngine,
  quickIdentityAnalysis,
  getArchetypeDefinition,
  getArchetypeDisplayName,
} from './IdentityDevelopmentEngine.js';

// ============================================================================
// DETECTION ALGORITHMS
// ============================================================================

export {
  extractSignalsFromBelief,
  calculateArchetypeScores,
  calculateIdentityConfidence,
  determineIdentityStatus,
  detectConflicts,
  detectTransitions,
  determineEvolutionPattern,
  generateInsights,
} from './detection.js';
