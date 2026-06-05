/**
 * Founder Intelligence V2
 *
 * A comprehensive engine for evaluating founder potential across 8 core dimensions
 * with false-positive protection and detailed classification systems.
 *
 * ## Quick Start
 *
 * ```typescript
 * import { createFounderIntelligenceEngineV2 } from '@/intelligence/founder-intelligence-v2';
 *
 * const engine = createFounderIntelligenceEngineV2();
 *
 * const analysis = engine.analyze({
 *   profile: studentProfile,
 *   explicitStatements: ['I want to build a company that solves X problem'],
 *   projectPortfolio: [{
 *     name: 'My App',
 *     isProduct: true,
 *     hadUsers: true,
 *     hadRevenue: false,
 *     teamSize: 1,
 *     durationMonths: 6,
 *     outcome: 'ongoing',
 *     demonstratedSkills: ['development', 'product management']
 *   }],
 *   timestamp: Date.now(),
 * });
 *
 * console.log(analysis.overallPotential); // 0-1 score
 * console.log(analysis.primaryFounderType); // e.g., 'TECHNICAL_FOUNDER'
 * console.log(analysis.readiness); // e.g., 'EMERGING'
 * console.log(analysis.narrative.summary); // Human-readable summary
 * ```
 *
 * ## Architecture
 *
 * The engine consists of coordinated sub-systems:
 *
 * 1. **DimensionScoringEngine** - Scores 8 founder dimensions from evidence
 * 2. **FalsePositiveProtectionEngine** - Detects non-founder profiles
 * 3. **FounderClassificationEngine** - Classifies into founder types
 * 4. **FounderMarketFitEngine** - Assesses market/sector alignment
 * 5. **FounderRiskProfileEngine** - Identifies risk factors
 * 6. **FounderExplanationEngine** - Generates human-readable narratives
 * 7. **FounderRoadmapEngine** - Creates development roadmaps
 *
 * ## Key Concepts
 *
 * ### 8 Founder Dimensions
 * - Opportunity Recognition: Identifying problems worth solving
 * - Obsession Capacity: Sustained commitment over years
 * - Resourcefulness: Creating progress without resources
 * - Ambiguity Tolerance: Comfort without structure
 * - Resilience: Recovery from failure
 * - Talent Magnetism: Attracting talented people
 * - Sales Capability: Persuasion and relationship building
 * - Ownership Orientation: Acting like an owner
 *
 * ### False Positive Protection
 * Detects and separates true founders from:
 * - Freelancers (sell services, not build products)
 * - Consultants (sell advice, not build solutions)
 * - Researchers (pursue knowledge, not commercial application)
 * - Artists (creative expression, not necessarily commercial)
 * - Wantrepreneurs (talk but don't execute)
 *
 * ### Founder Types
 * - Technical Founder: Builds technical products
 * - Product Founder: UX and product-market fit obsessed
 * - Business Founder: Partnerships and growth
 * - Visionary Founder: Bold category creation
 * - Social Entrepreneur: Mission-driven impact
 * - Community Builder: Network effects and platforms
 * - Creator Founder: Content and media businesses
 *
 * @module intelligence/founder-intelligence-v2
 */

// Main engine
export {
  FounderIntelligenceEngineV2,
  createFounderIntelligenceEngineV2,
  FounderIntelligenceEngineConfigV2,
} from './FounderIntelligenceEngineV2';

// Sub-engines
export {
  DimensionScoringEngineV2,
  createDimensionScoringEngineV2,
  DimensionScoringConfigV2,
} from './DimensionScoringEngine';

export {
  FalsePositiveProtectionEngineV2,
  createFalsePositiveProtectionEngineV2,
  FalsePositiveProtectionConfigV2,
} from './FalsePositiveProtectionEngine';

export {
  FounderClassificationEngineV2,
  createFounderClassificationEngineV2,
  FounderClassificationConfigV2,
} from './FounderClassificationEngine';

export {
  FounderMarketFitEngineV2,
  createFounderMarketFitEngineV2,
  MarketFitConfigV2,
} from './FounderMarketFitEngine';

export {
  FounderRiskProfileEngineV2,
  createFounderRiskProfileEngineV2,
  RiskProfileConfigV2,
} from './FounderRiskProfileEngine';

export {
  FounderExplanationEngineV2,
  createFounderExplanationEngineV2,
  ExplanationConfigV2,
} from './FounderExplanationEngine';

export {
  FounderRoadmapEngineV2,
  createFounderRoadmapEngineV2,
  RoadmapConfigV2,
} from './FounderRoadmapEngine';

// Types
export * from './types';

// Signal patterns
export * from './signals';
