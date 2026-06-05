/**
 * Similar Student Engine
 * 
 * Identifies students with similar profiles for peer comparison,
 * outcome learning, and recommendation enhancement.
 * 
 * ## Overview
 * 
 * The Similar Student Engine calculates multi-dimensional similarity between
 * students based on their psychological profiles, economic backgrounds,
 * educational contexts, utility preferences, and lifestyle constraints.
 * 
 * ## Key Features
 * 
 * - **Five-Dimensional Analysis**: Psychological, Economic, Educational, Utility, Lifestyle
 * - **Configurable Weights**: Adjust similarity calculation for different use cases
 * - **Preset Configurations**: Balanced, psychologically similar, economically similar, etc.
 * - **Outcome Learning Ready**: Specialized mode for peer-based outcome prediction
 * - **Detailed Explanations**: Human-readable similarity breakdowns
 * 
 * ## Quick Start
 * 
 * ```typescript
 * import { 
 *   SimilarStudentEngine, 
 *   SimilarityPresets,
 *   findSimilarStudentsQuick 
 * } from '@/intelligence/similar-student-engine';
 * 
 * // Create engine with preset
 * const engine = new SimilarStudentEngine({
 *   defaultWeights: SimilarityPresets.balanced()
 * });
 * 
 * // Find similar students
 * const result = engine.findSimilarStudents({
 *   referenceStudent: currentStudent,
 *   candidatePool: allStudents,
 *   topK: 10,
 *   minThreshold: 0.6
 * });
 * 
 * console.log(result.similarStudents);
 * ```
 * 
 * ## Outcome Learning Integration
 * 
 * ```typescript
 * // Find peers for outcome learning
 * const peers = engine.findPeersForOutcomeLearning(
 *   referenceStudent,
 *   candidatePool,
 *   'career_choice',  // outcome type
 *   0.6               // min similarity
 * );
 * 
 * // Use peers to predict outcomes
 * const predictedOutcome = aggregatePeerOutcomes(peers);
 * ```
 * 
 * ## Similarity Dimensions
 * 
 * ### Psychological (weight: 0.30)
 * - Personality traits (Big Five)
 * - Motivations (money, impact, status, freedom, stability)
 * - Strengths and skills
 * - Core values
 * 
 * ### Economic (weight: 0.20)
 * - Family income bracket
 * - Socioeconomic status
 * - Financial constraints
 * - Support systems
 * 
 * ### Educational (weight: 0.20)
 * - Current education level
 * - Academic performance
 * - Institution tier
 * - Learning profile
 * 
 * ### Utility (weight: 0.20)
 * - Career preferences
 * - Desired outcomes
 * - Decision priorities
 * - Timeline constraints
 * 
 * ### Lifestyle (weight: 0.10)
 * - Work-life balance preferences
 * - Location constraints
 * - Family obligations
 * - Personal constraints
 * 
 * @module similar-student-engine
 */

// ============================================================================
// TYPES
// ============================================================================

export type {
  SimilarityScore,
  DimensionSimilarity,
  SimilarityDetail,
  SimilarityAnalysis,
  SimilarityExplanation,
  SimilarStudentMatch,
  SimilarityFactor,
  DifferenceFactor,
  FindSimilarStudentsInput,
  FindSimilarStudentsOutput,
  SimilarityDimension,
  DimensionWeights,
  SimilarityStatistics,
  SimilarStudentEngineConfig,
} from './types.js';

// ============================================================================
// CONSTANTS & PRESETS
// ============================================================================

export { DEFAULT_CONFIG, SimilarityPresets } from './types.js';

// ============================================================================
// MAIN ENGINE
// ============================================================================

export { 
  SimilarStudentEngine,
  createSimilarStudentEngine,
  quickSimilarity,
  findSimilarStudentsQuick,
} from './SimilarStudentEngine.js';

// ============================================================================
// CALCULATORS
// ============================================================================

export {
  calculatePsychologicalSimilarity,
  calculateEconomicSimilarity,
  calculateEducationalSimilarity,
  calculateUtilitySimilarity,
  calculateLifestyleSimilarity,
  calculateOverallSimilarity,
} from './calculators.js';

// ============================================================================
// EXPLANATIONS
// ============================================================================

export {
  generateExplanation,
  generateSimpleExplanation,
  generateDimensionExplanation,
} from './explanations.js';
