/**
 * Outcome Evidence Engine
 *
 * Converts outcome records into evidence for recommendations.
 *
 * ## Purpose
 *
 * Analyze historical outcome data to generate evidence about
 * which career paths work best for which student profiles.
 *
 * ## Example Use Case
 *
 * ```typescript
 * Students with:
 * - high curiosity
 * - high autonomy preference
 *
 * who chose Product Management
 *
 * reported:
 * - higher satisfaction
 *
 * than peers who chose Consulting.
 * ```
 *
 * ## Output Format
 *
 * - **OutcomeEvidence**: Structured evidence record
 * - **Confidence**: Statistical confidence (0.0 - 1.0)
 * - **Sample Size**: Number of students in analysis
 * - **Evidence Quality**: high/medium/low/insufficient
 *
 * ## Key Features
 *
 * - **Explainable**: Every piece of evidence has clear reasoning
 * - **Evidence-based**: Based on actual outcome records
 * - **No black-box**: Transparent statistical methods only
 * - **Conservative**: Understates confidence rather than overstate
 *
 * ## Quick Start
 *
 * ```typescript
 * import {
 *   OutcomeEvidenceEngine,
 *   OutcomeEvidenceType,
 *   createOutcomeEvidenceEngine,
 * } from '@/intelligence/outcome-evidence-engine';
 *
 * // Create engine
 * const engine = createOutcomeEvidenceEngine();
 *
 * // Generate path comparison evidence
 * const evidence = engine.generatePathComparison(
 *   outcomeRecords,
 *   'product_management',
 *   'consulting',
 *   [
 *     { category: 'personality', trait: 'curiosity', level: 'high' },
 *     { category: 'motivation', trait: 'autonomy', level: 'high' },
 *   ]
 * );
 *
 * console.log(evidence.description);
 * // "Students with curiosity and autonomy who chose product_management
 * //  outperform those who chose consulting by 0.8 satisfaction points"
 *
 * console.log(evidence.statistics.confidence);  // 0.85
 * console.log(evidence.statistics.sampleSize);  // 45
 * console.log(evidence.quality);                // 'high'
 * ```
 *
 * ## Evidence Types
 *
 * ### Path Comparison
 * Compare outcomes between two career paths for a specific student profile.
 *
 * ### Trait Predictor
 * Identify which traits predict success on a given path.
 *
 * ### Satisfaction Driver
 * Find factors that correlate with career satisfaction.
 *
 * ### Regret Pattern
 * Identify patterns in decision regret.
 *
 * ### Success Factor
 * Discover factors present in successful outcomes.
 *
 * ## Statistical Methods
 *
 * All analysis uses transparent, explainable statistics:
 * - Welch's t-test (handles unequal variances)
 * - Cohen's d (effect size)
 * - Confidence intervals
 * - Conservative confidence scoring
 *
 * @module outcome-evidence-engine
 */

// ============================================================================
// TYPES
// ============================================================================

export type {
  OutcomeEvidenceId,
  OutcomeEvidence,
  TraitFilter,
  GenerateEvidenceInput,
  GenerateEvidenceOutput,
  OutcomeGroupComparison,
  MetricComparison,
  EvidenceQuery,
  EvidenceQueryResult,
  EvidenceDerivationExplanation,
  DerivationStep,
  OutcomeEvidenceEngineConfig,
} from './types.js';

// ============================================================================
// ENUMS
// ============================================================================

export {
  OutcomeEvidenceType,
  EvidenceQuality,
  EffectDirection,
  StatisticalSignificance,
} from './types.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

export { DEFAULT_CONFIG as DEFAULT_OUTCOME_EVIDENCE_CONFIG } from './types.js';

// ============================================================================
// MAIN ENGINE
// ============================================================================

export {
  OutcomeEvidenceEngine,
  createOutcomeEvidenceEngine,
  generateQuickEvidence,
  batchComparePaths,
} from './OutcomeEvidenceEngine.js';

// ============================================================================
// ANALYSIS FUNCTIONS
// ============================================================================

export {
  // Statistics
  calculateMean,
  calculateStdDev,
  calculateMedian,
  calculateCohensD,
  welchTTest,
  determineSignificance,
  determineDirection,
  calculateConfidenceInterval,
  // Outcome extraction
  extractOutcomeValues,
  getSatisfactionScore,
  getSuccessIndicator,
  // Trait matching
  matchesTraitFilters,
  // Group comparison
  compareOutcomeGroups,
  // Quality
  calculateEvidenceQuality,
  calculateConsistencyScore,
  calculateConfidenceFromStats,
  calculateDataQuality,
} from './analysis.js';

// ============================================================================
// EXPLANATION FUNCTIONS
// ============================================================================

export {
  generateEvidenceExplanation,
  generateDerivationExplanation,
  generateOneSentenceSummary,
  generateAudienceExplanation,
  formatEffectDirection,
} from './explanations.js';
