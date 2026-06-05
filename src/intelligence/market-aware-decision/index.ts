/**
 * CareerOS Market-Aware Decision Engine V1
 *
 * Integrate market intelligence into recommendations without allowing
 * market trends to dominate decision quality.
 *
 * ## CareerOS Philosophy
 *
 * Market intelligence should REFINE decisions, not DOMINATE them.
 *
 * **Primary Factors** (NEVER overridden):
 *   - Psychological Fit
 *   - Utility Alignment
 *   - Identity Congruence
 *   - Satisfaction Potential
 *   - Optionality Preservation
 *
 * **Market Factors** (adjusting influence only):
 *   - Market Opportunity
 *   - Trend Momentum
 *   - Risk Exposure
 *
 * ## Rule
 *
 * "A high-demand career with low fit must NEVER become the top recommendation."
 *
 * ## Inputs
 *
 * - Decision Intelligence Results
 * - Utility Analysis
 * - Pareto Frontier Results
 * - Market Intelligence Report
 * - Outcome Learning Signals
 *
 * ## Outputs
 *
 * - MarketAwareRecommendation
 * - MarketAdjustmentAnalysis
 * - MarketInfluencePolicy compliance report
 * - Market-aware decision narrative
 *
 * ## Example Usage
 *
 * ```typescript
 * import {
 *   MarketAwareDecisionEngine,
 *   createMarketAwareDecisionEngine,
 * } from '@/intelligence/market-aware-decision';
 *
 * import type {
 *   DecisionIntelligenceResult,
 *   MarketIntelligenceReport,
 * } from '@/intelligence/market-aware-decision';
 *
 * // Create engine
 * const engine = createMarketAwareDecisionEngine();
 *
 * // Prepare decision intelligence results
 * const decisions: DecisionIntelligenceResult[] = [
 *   {
 *     decisionId: 'dec-001',
 *     recommendationId: 'rec-sw-eng',
 *     fit: {
 *       psychological: 82,
 *       skills: 78,
 *       values: 75,
 *       overall: 78,
 *     },
 *     utility: {
 *       shortTerm: 70,
 *       longTerm: 85,
 *       aligned: 77,
 *     },
 *     optionality: 80,
 *     regretRisk: 25,
 *     satisfactionPotential: 82,
 *     identityCongruence: 75,
 *     originalScore: 78,
 *     isParetoOptimal: true,
 *   },
 *   // ... more decisions
 * ];
 *
 * // Prepare market intelligence
 * const marketIntel = new Map<string, MarketIntelligenceReport>();
 * marketIntel.set('rec-sw-eng', {
 *   id: 'report-sw-eng',
 *   entityId: 'career:software-engineer',
 *   entityType: 'career',
 *   entityName: 'Software Engineer',
 *   // ... market intelligence data
 * } as MarketIntelligenceReport);
 *
 * // Process with market awareness
 * const result = engine.processRecommendations('dec-001', {
 *   decisions,
 *   marketIntelligence: marketIntel,
 * });
 *
 * // Review results
 * console.log('Top recommendation:', result.topRecommendations[0].entityName);
 * console.log('Final score:', result.topRecommendations[0].scores.final);
 * console.log('Narrative:', result.topRecommendations[0].narrative.summary);
 * console.log('Decision quality preserved:', result.decisionQualityPreserved);
 * ```
 *
 * ## Example Narrative Output
 *
 * ```
 * "Software Engineering is strongly recommended based on strong psychological fit
 * with favorable market support.
 *
 * Primary reasons:
 *  - Strong psychological fit (82/100) - aligns with your personality
 *  - Excellent overall fit (78/100) across all dimensions
 *  - High optionality (80/100) - preserves future career flexibility
 *  - Low regret risk (25/100) - unlikely to second-guess this choice
 *
 * Market context:
 *  - Growing market with 75% trend strength
 *  - Strong market opportunity score (82/100)
 *  - No significant market risks identified
 *  - Favorable market conditions increased confidence by 8.5 points
 *
 * Confidence: We have very high confidence in this recommendation based on
 * strong fit and favorable conditions.
 *
 * Note: Market conditions enhance confidence but are not the primary reason
 * for this recommendation."
 * ```
 *
 * ## Market Adjustment Examples
 *
 * | Scenario | Original Score | Market Condition | Adjustment | Final Score |
 * |----------|---------------|------------------|------------|-------------|
 * | Strong fit, strong market | 78 | Growing demand | +10 | 88 |
 * | Strong fit, weak market | 82 | Declining demand | -8 | 74 |
 * | Weak fit, strong market | 45 | Hot market | 0 (blocked) | 45 |
 * | High fit, high risk | 80 | Automation risk | -12 | 68 |
 *
 * ## Engines
 *
 * | Engine | Purpose |
 * |--------|---------|
 * | MarketAdjustmentCalculator | Calculate score adjustments from market factors |
 * | MarketOverrideProtection | Prevent market from overriding fit/utility |
 * | MarketRiskAdjustment | Reduce confidence for market risks |
 * | MarketOpportunityBoost | Increase confidence when fit + market align |
 * | RecommendationStabilityEngine | Prevent short-term volatility |
 * | DecisionNarrativeGenerator | Generate explanations with proper emphasis |
 * | MarketAwareDecisionEngine | Main orchestrator |
 *
 * ## Protection Mechanisms
 *
 * 1. **Minimum Fit Threshold** - Scores below 60 cannot receive market boosts
 * 2. **Maximum Market Influence** - Market can adjust by max ±15 points
 * 3. **Trend Chasing Detection** - Blocks low-fit/high-market combinations
 * 4. **High Fit Protection** - Strong fit careers resist market penalties
 * 5. **Stability Windows** - 7-day minimum between changes
 *
 * ## Requirements Met
 *
 * - ✅ Strong TypeScript typing
 * - ✅ Deterministic calculations
 * - ✅ Explainable adjustments
 * - ✅ Compatible with Knowledge Graph
 * - ✅ Compatible with Decision Intelligence Engine
 * - ✅ Compatible with Future Simulation Engine
 * - ✅ Compatible with Outcome Learning Architecture
 * - ✅ No AI integration
 * - ✅ No scraping
 * - ✅ No external integrations
 * - ✅ Production-ready architecture
 *
 * @module market-aware-decision
 */

// ============================================================================
// TYPES
// ============================================================================

export type {
  // Core identifiers
  DecisionId,
  RecommendationId,
  Timestamp,
  ImportanceLevel,

  // Policy
  MarketInfluencePolicy,

  // Inputs
  DecisionIntelligenceResult,
  OutcomeLearningSignal,

  // Adjustments
  MarketAdjustmentAnalysis,
  MarketAdjustmentFactors,
  OverrideProtectionDecision,
  TrendChasingDetection,
  MarketRiskAdjustment,
  MarketOpportunityBoost,

  // Stability
  StabilityRecord,
  StabilityAssessment,

  // Narratives
  MarketAwareDecisionNarrative,

  // Outputs
  MarketAwareRecommendation,
  MarketAwareDecisionResult,

  // Configurations
  MarketAdjustmentCalculatorConfig,
  OverrideProtectionConfig,
  StabilityEngineConfig,
  NarrativeGeneratorConfig,
  MarketAwareDecisionEngineConfig,
} from './types.js';

// ============================================================================
// CONSTANTS
// ============================================================================

export {
  IMPORTANCE_WEIGHTS,
  DEFAULT_MARKET_INFLUENCE_POLICY,
  DEFAULT_MARKET_ADJUSTMENT_CALCULATOR_CONFIG,
  DEFAULT_OVERRIDE_PROTECTION_CONFIG,
  DEFAULT_STABILITY_ENGINE_CONFIG,
  DEFAULT_NARRATIVE_GENERATOR_CONFIG,
  DEFAULT_MARKET_AWARE_DECISION_ENGINE_CONFIG,
} from './types.js';

// ============================================================================
// MAIN ENGINE
// ============================================================================

export {
  MarketAwareDecisionEngine,
  createMarketAwareDecisionEngine,
  quickProcess,
} from './MarketAwareDecisionEngine.js';

// ============================================================================
// SUB-ENGINES
// ============================================================================

export {
  MarketAdjustmentCalculator,
  createMarketAdjustmentCalculator,
  quickCalculateAdjustment,
} from './MarketAdjustmentCalculator.js';

export {
  MarketOverrideProtection,
  createMarketOverrideProtection,
  quickEvaluateProtection,
  quickDetectTrendChasing,
} from './MarketOverrideProtection.js';

export {
  MarketRiskAdjustmentEngine,
  createMarketRiskAdjustmentEngine,
  quickCalculateRiskAdjustment,
} from './MarketRiskAdjustment.js';

export {
  MarketOpportunityBoostEngine,
  createMarketOpportunityBoostEngine,
  quickCalculateBoost,
} from './MarketOpportunityBoost.js';

export {
  RecommendationStabilityEngine,
  createRecommendationStabilityEngine,
} from './RecommendationStabilityEngine.js';

export {
  DecisionNarrativeGenerator,
  createDecisionNarrativeGenerator,
  quickGenerateDecisionNarrative,
} from './DecisionNarrativeGenerator.js';
