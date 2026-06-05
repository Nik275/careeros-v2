/**
 * CareerOS Intelligence Consistency Engine
 *
 * Validates consistency across all intelligence layers.
 *
 * Purpose:
 *   - Detect contradictions between engine outputs
 *   - Identify agreement and consensus
 *   - Find weak reasoning chains
 *   - Detect overriding influences
 *   - Resolve engine conflicts
 *
 * Usage:
 *   ```typescript
 *   import { ConsistencyEngine, validateConsistency } from './consistency-engine';
 *
 *   // Method 1: Use the engine class
 *   const engine = new ConsistencyEngine();
 *   const report = engine.validate(intelligenceResults);
 *
 *   // Method 2: Use the convenience function
 *   const report = validateConsistency(intelligenceResults);
 *
 *   // Check if consistent
 *   if (report.consistencyScore >= 70) {
 *     console.log('Results are consistent');
 *   }
 *   ```
 */

// ============================================================================
// CORE ENGINE
// ============================================================================

export {
  ConsistencyEngine,
  createConsistencyEngine,
  validateConsistency,
  isConsistent,
} from './ConsistencyEngine';

// ============================================================================
// TYPES
// ============================================================================

export type {
  // Core types
  ConsistencyId,
  ViolationSeverity,
  ConsistencyType,
  EngineSource,

  // Input types
  IntelligenceResults,
  UtilityResults,
  UtilityComponent,

  // Violation types
  ConsistencyViolation,
  ConflictingValue,
  ResolutionRecommendation,

  // Agreement types
  EngineAgreement,

  // Reasoning graph types
  ReasoningGraph,
  ReasoningNode,
  ReasoningEdge,

  // Weak chain types
  WeakReasoningChain,
  ReasoningStep,

  // Override and conflict types
  OverrideDetection,
  EngineConflict,

  // Report types
  ConsistencyReport,
  ConsistencyInterpretation,
  TopRecommendation,
  ConsistencyStatistics,

  // Rule types
  ConsistencyRule,
  RuleConfiguration,

  // Configuration types
  ConsistencyEngineConfig,
  ConsistencyAnalysisOptions,
} from './types';

// ============================================================================
// CONSTANTS
// ============================================================================

export { DEFAULT_CONSISTENCY_CONFIG } from './types';

// ============================================================================
// UTILITIES
// ============================================================================

export {
  validateInput,
  calculateValueDistance,
  detectDirectionalConflict,
  normalizeScore,
  weightedAverage,
  calculateStdDev,
  inRange,
  clamp,
  formatConfidence,
  approximatelyEqual,
  getSeverityColor,
  getConsistencyColor,
  deepMerge,
} from './utils';
