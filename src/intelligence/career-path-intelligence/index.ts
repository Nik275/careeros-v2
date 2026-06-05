/**
 * Career Path Intelligence Layer
 *
 * A comprehensive engine for modeling career pathways including:
 * - Path discovery (direct, indirect, non-traditional routes)
 * - Milestone planning and tracking
 * - Alternative paths (Plan B, C, D)
 * - Failure recovery and pivot options
 * - Path comparison across multiple dimensions
 * - Context-aware explanations
 *
 * ## Quick Start
 *
 * ```typescript
 * import { createCareerPathIntelligenceEngine } from '@/intelligence/career-path-intelligence';
 *
 * const engine = createCareerPathIntelligenceEngine();
 *
 * const analysis = engine.analyze({
 *   studentProfile: {
 *     id: 'student-123',
 *     currentEducationLevel: 'SCHOOL_12',
 *     yearsOfExperience: 0,
 *     skills: ['Programming', 'Problem Solving'],
 *     credentials: ['Class 12 - Science'],
 *     certifications: [],
 *     financialConstraints: {
 *       maxInvestment: 2000000,
 *       monthlyBudget: 50000,
 *       canTakeLoan: true,
 *     },
 *     timeConstraints: {
 *       maxDuration: 60,
 *       hoursPerWeek: 40,
 *       canRelocate: true,
 *     },
 *     locationConstraints: {
 *       preferredLocations: ['Bangalore', 'Hyderabad'],
 *       forbiddenLocations: [],
 *       remotePreference: 'OPEN',
 *     },
 *     riskTolerance: 'MODERATE',
 *     preferredPathTypes: ['DIRECT', 'CORPORATE'],
 *     careerGoals: ['Product Manager', 'Tech Lead'],
 *   },
 *   targetCareer: 'Product Manager',
 *   timestamp: Date.now(),
 * });
 *
 * // Access results
 * console.log(analysis.primaryPath.name);
 * console.log(analysis.alternativePaths.planB.name);
 * console.log(analysis.recommendations[0].rationale);
 * console.log(analysis.pathComparison.recommendedPathId);
 * console.log(analysis.explanations[analysis.primaryPath.pathId].overview);
 * ```
 *
 * ## Architecture
 *
 * The Career Path Intelligence Layer consists of coordinated engines:
 *
 * ### Path Discovery
 * - **PathDiscoveryEngine**: Generates multiple pathways to same target
 *   - Direct paths (traditional routes)
 *   - Indirect paths (alternative routes)
 *   - Non-traditional paths (startup, bootcamp, etc.)
 *   - India-specific paths (IIT, NIT, etc.)
 *
 * ### Path Validation
 * - **PathValidationEngine**: Validates path feasibility
 *   - Prerequisite checking
 *   - Financial constraint validation
 *   - Time constraint validation
 *   - Location constraint validation
 *   - Context compatibility
 *
 * ### Milestone Management
 * - **MilestoneEngine**: Manages path milestones
 *   - Milestone planning and sequencing
 *   - Critical path identification
 *   - Parallel track management
 *   - Timeline optimization
 *   - Progress tracking
 *
 * ### Alternative Paths
 * - **AlternativePathEngine**: Generates Plan B, C, D
 *   - Safety alternatives
 *   - Different approaches
 *   - Switching points identification
 *   - Fallback recommendations
 *
 * ### Failure Recovery
 * - **FailureRecoveryEngine**: Models failure and recovery
 *   - Retry strategies
 *   - Pivot options
 *   - Branch paths
 *   - Bypass options
 *   - Parallel approaches
 *
 * ### Path Comparison
 * - **PathComparisonEngine**: Compares paths across dimensions
 *   - Difficulty comparison
 *   - Risk comparison
 *   - Cost comparison
 *   - Duration comparison
 *   - Optionality comparison
 *   - Utility comparison
 *
 * ### Explanations
 * - **PathExplanationEngine**: Generates narratives
 *   - Path overview
 *   - Journey descriptions
 *   - Milestone narratives
 *   - Risk explanations
 *   - Comparison narratives
 *   - Fit explanations
 *
 * ### Main Orchestrator
 * - **CareerPathIntelligenceEngine**: Coordinates all sub-engines
 *
 * ## Key Concepts
 *
 * ### Path Types
 * - **DIRECT**: Traditional, straightforward route
 * - **INDIRECT**: Alternative route to same destination
 * - **NON_TRADITIONAL**: Unconventional approach (bootcamp, startup)
 * - **ENTREPRENEURIAL**: Starting own business/venture
 * - **ACADEMIC**: Research/education-focused path
 * - **CORPORATE**: Company-employment focused path
 * - **GOVERNMENT**: Public sector path
 * - **HYBRID**: Combination approach
 *
 * ### Path Dimensions
 * - **Difficulty**: How hard is the path? (VERY_EASY to EXTREME)
 * - **Risk**: Probability of failure (VERY_LOW to VERY_HIGH)
 * - **Cost**: Financial investment required
 * - **Duration**: Time to complete
 * - **Optionality**: Future flexibility and pivot options
 * - **Utility**: ROI and career value
 *
 * ### Recovery Strategies
 * - **RETRY**: Attempt same milestone again
 * - **PIVOT**: Switch to different path
 * - **BRANCH**: Take side path and return
 * - **BYPASS**: Skip milestone if possible
 * - **ABANDON**: Give up on current path
 * - **PARALLEL**: Work on multiple options
 *
 * ## Integration with India Intelligence
 *
 * The Career Path Intelligence layer integrates with the India Intelligence layer:
 * - JEE/NEET/UPSC/CA pathways
 * - Family business dynamics
 * - Regional constraints
 * - Economic constraints
 * - India-specific motivations
 *
 * @module intelligence/career-path-intelligence
 */

// Main engine
export {
  CareerPathIntelligenceEngine,
  createCareerPathIntelligenceEngine,
  CareerPathIntelligenceEngineConfig,
} from './CareerPathIntelligenceEngine';

// Sub-engines
export {
  PathDiscoveryEngine,
  createPathDiscoveryEngine,
  PathDiscoveryEngineConfig,
} from './engines/PathDiscoveryEngine';

export {
  PathValidationEngine,
  createPathValidationEngine,
  PathValidationEngineConfig,
} from './engines/PathValidationEngine';

export {
  MilestoneEngine,
  createMilestoneEngine,
  MilestoneEngineConfig,
} from './engines/MilestoneEngine';

export {
  AlternativePathEngine,
  createAlternativePathEngine,
  AlternativePathEngineConfig,
} from './engines/AlternativePathEngine';

export {
  FailureRecoveryEngine,
  createFailureRecoveryEngine,
  FailureRecoveryEngineConfig,
} from './engines/FailureRecoveryEngine';

export {
  PathComparisonEngine,
  createPathComparisonEngine,
  PathComparisonEngineConfig,
} from './engines/PathComparisonEngine';

export {
  PathExplanationEngine,
  createPathExplanationEngine,
  PathExplanationEngineConfig,
} from './engines/PathExplanationEngine';

// All types
export * from './types';
