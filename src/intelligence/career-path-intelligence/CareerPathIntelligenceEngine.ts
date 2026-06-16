/**
 * Career Path Intelligence Engine - Main Orchestrator
 *
 * Coordinates all Career Path Intelligence sub-engines:
 * - PathDiscoveryEngine: Generate multiple pathways
 * - PathValidationEngine: Check feasibility
 * - MilestoneEngine: Define and manage milestones
 * - AlternativePathEngine: Generate Plan B/C/D
 * - FailureRecoveryEngine: Model failure and recovery
 * - PathComparisonEngine: Compare paths
 * - PathExplanationEngine: Generate narratives
 *
 * Usage:
 * ```typescript
 * const engine = createCareerPathIntelligenceEngine();
 * const analysis = engine.analyze({
 *   studentProfile: {...},
 *   targetCareer: 'Product Manager',
 *   timestamp: Date.now()
 * });
 * ```
 *
 * @module intelligence/career-path-intelligence
 */

import {
  DEFAULT_CAREER_PATH_CONFIG,
} from './types';

import type {
  CareerPathIntelligenceInput,
  CareerPathIntelligenceAnalysis,
  CareerPath,
  CareerPathIntelligenceConfig,
  PathRecommendation,
  IntegratedRecommendation,
} from './types';

import {
  PathDiscoveryEngine,
  createPathDiscoveryEngine,
} from './engines/PathDiscoveryEngine';
import type { PathDiscoveryEngineConfig } from './engines/PathDiscoveryEngine';

import {
  PathValidationEngine,
  createPathValidationEngine,
} from './engines/PathValidationEngine';
import type { PathValidationEngineConfig } from './engines/PathValidationEngine';

import {
  MilestoneEngine,
  createMilestoneEngine,
} from './engines/MilestoneEngine';
import type { MilestoneEngineConfig } from './engines/MilestoneEngine';

import {
  AlternativePathEngine,
  createAlternativePathEngine,
} from './engines/AlternativePathEngine';
import type { AlternativePathEngineConfig } from './engines/AlternativePathEngine';

import {
  FailureRecoveryEngine,
  createFailureRecoveryEngine,
} from './engines/FailureRecoveryEngine';
import type { FailureRecoveryEngineConfig } from './engines/FailureRecoveryEngine';

import {
  PathComparisonEngine,
  createPathComparisonEngine,
} from './engines/PathComparisonEngine';
import type { PathComparisonEngineConfig } from './engines/PathComparisonEngine';

import {
  PathExplanationEngine,
  createPathExplanationEngine,
} from './engines/PathExplanationEngine';
import type { PathExplanationEngineConfig } from './engines/PathExplanationEngine';

/**
 * Configuration for Career Path Intelligence Engine
 */
export interface CareerPathIntelligenceEngineConfig {
  /** Main engine configuration */
  engine?: Partial<CareerPathIntelligenceConfig>;
  /** Path Discovery Engine configuration */
  discovery?: Partial<PathDiscoveryEngineConfig>;
  /** Path Validation Engine configuration */
  validation?: Partial<PathValidationEngineConfig>;
  /** Milestone Engine configuration */
  milestone?: Partial<MilestoneEngineConfig>;
  /** Alternative Path Engine configuration */
  alternative?: Partial<AlternativePathEngineConfig>;
  /** Failure Recovery Engine configuration */
  recovery?: Partial<FailureRecoveryEngineConfig>;
  /** Path Comparison Engine configuration */
  comparison?: Partial<PathComparisonEngineConfig>;
  /** Path Explanation Engine configuration */
  explanation?: Partial<PathExplanationEngineConfig>;
}

/**
 * Main Career Path Intelligence Engine
 */
export class CareerPathIntelligenceEngine {
  private config: CareerPathIntelligenceConfig;
  private discoveryEngine: PathDiscoveryEngine;
  private validationEngine: PathValidationEngine;
  private milestoneEngine: MilestoneEngine;
  private alternativePathEngine: AlternativePathEngine;
  private failureRecoveryEngine: FailureRecoveryEngine;
  private comparisonEngine: PathComparisonEngine;
  private explanationEngine: PathExplanationEngine;

  constructor(config: CareerPathIntelligenceEngineConfig = {}) {
    this.config = { ...DEFAULT_CAREER_PATH_CONFIG, ...config.engine };

    this.discoveryEngine = createPathDiscoveryEngine(config.discovery);
    this.validationEngine = createPathValidationEngine(config.validation);
    this.milestoneEngine = createMilestoneEngine(config.milestone);
    this.alternativePathEngine = createAlternativePathEngine(config.alternative);
    this.failureRecoveryEngine = createFailureRecoveryEngine(config.recovery);
    this.comparisonEngine = createPathComparisonEngine(config.comparison);
    this.explanationEngine = createPathExplanationEngine(config.explanation);
  }

  /**
   * Perform comprehensive career path intelligence analysis
   */
  analyze(input: CareerPathIntelligenceInput): CareerPathIntelligenceAnalysis {
    const startTime = Date.now();

    // 1. Discover paths
    const discoveryResult = this.discoveryEngine.discover(input);

    // 2. Validate paths
    const { validPaths, invalidPaths } = this.validationEngine.validateMultiple(
      discoveryResult.paths,
      input
    );

    // If no valid paths, return early with discovered paths for review
    if (validPaths.length === 0) {
      return this.createNoValidPathsAnalysis(input, discoveryResult.paths, invalidPaths);
    }

    // 3. Select primary path (highest confidence)
    const primaryPath = this.selectPrimaryPath(validPaths, input);

    // 4. Generate alternative paths (Plan B, C, D)
    const alternativePaths = this.alternativePathEngine.generateAlternatives(
      primaryPath,
      validPaths,
      input
    );

    // 5. Create milestone plan for primary path
    const milestonePlan = this.milestoneEngine.createMilestonePlan(primaryPath);

    // 6. Generate recovery plans for high-risk milestones
    const recoveryPlans = this.failureRecoveryEngine.generateAllRecoveryPlans(
      primaryPath,
      input
    );

    // 7. Compare all valid paths
    const pathComparison = this.comparisonEngine.compare(
      validPaths.slice(0, 5), // Compare top 5
      input.targetCareer,
      input
    );

    // 8. Generate explanations for each path
    const explanations: Record<string, CareerPathIntelligenceAnalysis['explanations']['string']> = {};
    for (const path of validPaths.slice(0, 5)) {
      explanations[path.pathId] = this.explanationEngine.generateExplanation(
        path,
        input,
        pathComparison
      );
    }

    // 9. Generate recommendations
    const recommendations = this.generateRecommendations(validPaths, input, pathComparison);

    // 10. Analyze optionality
    const optionalityAnalysis = this.analyzeOptionality(validPaths);

    return {
      id: this.generateAnalysisId(),
      timestamp: Date.now(),
      studentId: input.studentProfile.id,
      engineVersion: '2.0.0',
      targetCareer: input.targetCareer,
      discoveredPaths: discoveryResult,
      validatedPaths: validPaths,
      invalidPaths: invalidPaths.map(i => ({ pathId: i.path.pathId, reasons: i.results.flatMap(r => r.issues) })),
      primaryPath,
      alternativePaths,
      pathComparison,
      milestonePlan,
      recoveryPlans,
      explanations,
      recommendations,
      optionalityAnalysis,
    };
  }

  /**
   * Quick analysis for lightweight use cases
   */
  quickAnalyze(input: CareerPathIntelligenceInput): {
    targetCareer: string;
    pathCount: number;
    topPath: string;
    difficulty: string;
    duration: number;
    estimatedCost: number;
    alternativesAvailable: boolean;
  } {
    const discoveryResult = this.discoveryEngine.discover(input);
    const { validPaths } = this.validationEngine.validateMultiple(
      discoveryResult.paths,
      input
    );

    if (validPaths.length === 0) {
      return {
        targetCareer: input.targetCareer,
        pathCount: 0,
        topPath: 'No valid paths found',
        difficulty: 'N/A',
        duration: 0,
        estimatedCost: 0,
        alternativesAvailable: false,
      };
    }

    const topPath = validPaths.sort((a, b) => b.confidence - a.confidence)[0];

    return {
      targetCareer: input.targetCareer,
      pathCount: validPaths.length,
      topPath: topPath.name,
      difficulty: topPath.difficulty,
      duration: topPath.duration,
      estimatedCost: topPath.totalCost,
      alternativesAvailable: validPaths.length > 1,
    };
  }

  /**
   * Get path recommendations for a target career
   */
  getPathRecommendations(
    input: CareerPathIntelligenceInput
  ): PathRecommendation[] {
    const analysis = this.analyze(input);
    return analysis.recommendations;
  }

  /**
   * Get milestone plan for a specific path
   */
  getMilestonePlan(path: CareerPath) {
    return this.milestoneEngine.createMilestonePlan(path);
  }

  /**
   * Get recovery plan for a failed milestone
   */
  getRecoveryPlan(
    path: CareerPath,
    milestoneId: string,
    input: CareerPathIntelligenceInput
  ) {
    const milestone = path.milestones.find(m => m.id === milestoneId);
    if (!milestone) {
      throw new Error(`Milestone ${milestoneId} not found in path`);
    }
    return this.failureRecoveryEngine.generateRecoveryPlan(milestone, path, input);
  }

  /**
   * Compare specific paths
   */
  comparePaths(
    paths: CareerPath[],
    targetCareer: string,
    input: CareerPathIntelligenceInput
  ) {
    return this.comparisonEngine.compare(paths, targetCareer, input);
  }

  /**
   * Generate explanation for a path
   */
  explainPath(
    path: CareerPath,
    input: CareerPathIntelligenceInput,
    comparison?: CareerPathIntelligenceAnalysis['pathComparison']
  ) {
    return this.explanationEngine.generateExplanation(path, input, comparison);
  }

  /**
   * Select primary path based on confidence and fit
   */
  private selectPrimaryPath(
    paths: CareerPath[],
    input: CareerPathIntelligenceInput
  ): CareerPath {
    // Score each path
    const scoredPaths = paths.map(path => {
      let score = path.confidence;

      // Boost for budget fit
      if (path.totalCost <= input.studentProfile.financialConstraints.maxInvestment) {
        score += 0.1;
      }

      // Boost for timeline fit
      if (path.duration <= input.studentProfile.timeConstraints.maxDuration) {
        score += 0.1;
      }

      // Boost for preferred path type
      if (input.studentProfile.preferredPathTypes.includes(path.type)) {
        score += 0.05;
      }

      // Boost for low risk if risk-averse
      if (input.studentProfile.riskTolerance === 'LOW') {
        score += (1 - this.getRiskScore(path.riskLevel)) * 0.1;
      }

      return { path, score };
    });

    // Sort by score and return best
    scoredPaths.sort((a, b) => b.score - a.score);
    return scoredPaths[0].path;
  }

  /**
   * Generate ranked recommendations
   */
  private generateRecommendations(
    paths: CareerPath[],
    input: CareerPathIntelligenceInput,
    comparison: CareerPathIntelligenceAnalysis['pathComparison']
  ): PathRecommendation[] {
    const recommendations: PathRecommendation[] = [];

    // Sort paths by fit score
    const sortedPaths = paths
      .map(path => ({
        path,
        fitScore: comparison.fitScores[path.pathId] || 0,
      }))
      .sort((a, b) => b.fitScore - a.fitScore);

    for (let i = 0; i < Math.min(sortedPaths.length, 5); i++) {
      const { path, fitScore } = sortedPaths[i];

      let category: PathRecommendation['category'];
      if (i === 0) category = 'OPTIMAL';
      else if (i === 1) category = 'SAFE';
      else if (path.riskLevel === 'HIGH' || path.riskLevel === 'VERY_HIGH') category = 'AGGRESSIVE';
      else if (i >= 2) category = 'ALTERNATIVE';
      else category = 'BACKUP';

      const rationale: string[] = [];
      const warnings: string[] = [];

      // Generate rationale
      if (path.totalCost <= input.studentProfile.financialConstraints.maxInvestment) {
        rationale.push('Within budget');
      }

      if (path.duration <= input.studentProfile.timeConstraints.maxDuration) {
        rationale.push('Fits timeline');
      }

      if (path.optionalityScore > 0.7) {
        rationale.push('High flexibility');
      }

      // Generate warnings
      if (path.totalCost > input.studentProfile.financialConstraints.maxInvestment * 1.2) {
        warnings.push('Significantly exceeds budget');
      }

      if (this.getRiskScore(path.riskLevel) > 0.6) {
        warnings.push('High risk path');
      }

      const highRiskMilestones = path.milestones.filter(m => m.failureProbability > 0.5);
      if (highRiskMilestones.length > 0) {
        warnings.push(`${highRiskMilestones.length} challenging milestones ahead`);
      }

      recommendations.push({
        rank: i + 1,
        pathId: path.pathId,
        pathName: path.name,
        category,
        confidence: path.confidence,
        fitScore,
        rationale,
        warnings,
        nextSteps: this.generateNextSteps(path),
      });
    }

    return recommendations;
  }

  /**
   * Generate next steps for a path
   */
  private generateNextSteps(path: CareerPath): string[] {
    const steps: string[] = [];
    const firstMilestone = path.milestones[0];

    if (firstMilestone) {
      steps.push(`Begin ${firstMilestone.name}`);

      // Add prerequisite steps
      for (const prereq of firstMilestone.prerequisites) {
        if (prereq.required) {
          steps.push(`Ensure prerequisite: ${prereq.description}`);
        }
      }

      // Add resource steps
      for (const resource of firstMilestone.resources.slice(0, 2)) {
        steps.push(`Arrange ${resource.description.toLowerCase()}`);
      }
    }

    steps.push('Set up progress tracking');

    return steps.slice(0, 5);
  }

  /**
   * Analyze optionality across paths
   */
  private analyzeOptionality(
    paths: CareerPath[]
  ): CareerPathIntelligenceAnalysis['optionalityAnalysis'] {
    const overallOptionality = paths.reduce((sum, p) => sum + p.optionalityScore, 0) / paths.length;

    const byPath: Record<string, CareerPathIntelligenceAnalysis['optionalityAnalysis']['byPath']['string']> = {};

    for (const path of paths) {
      const strengths: string[] = [];
      const weaknesses: string[] = [];

      if (path.optionalityBreakdown.SKILL_TRANSFERABILITY > 0.7) {
        strengths.push('Highly transferable skills');
      } else {
        weaknesses.push('Limited skill transferability');
      }

      if (path.optionalityBreakdown.NETWORK_BREADTH > 0.7) {
        strengths.push('Broad professional network potential');
      }

      if (path.optionalityBreakdown.INDUSTRY_MOBILITY > 0.7) {
        strengths.push('Can pivot across industries');
      } else {
        weaknesses.push('Industry-specific path');
      }

      byPath[path.pathId] = {
        score: path.optionalityScore,
        components: path.optionalityBreakdown,
        strengths,
        weaknesses,
      };
    }

    return {
      overallOptionality,
      byPath,
      recommendations: [
        'Prioritize paths with optionality score > 0.6 for career flexibility',
        'Build transferable skills regardless of chosen path',
        'Maintain network across multiple domains',
      ],
    };
  }

  /**
   * Create analysis when no valid paths found
   */
  private createNoValidPathsAnalysis(
    input: CareerPathIntelligenceInput,
    discoveredPaths: CareerPath[],
    invalidPaths: { path: CareerPath; results: import('./types').PathValidationResult[] }[]
  ): CareerPathIntelligenceAnalysis {
    return {
      id: this.generateAnalysisId(),
      timestamp: Date.now(),
      studentId: input.studentProfile.id,
      engineVersion: '2.0.0',
      targetCareer: input.targetCareer,
      discoveredPaths: {
        targetCareer: input.targetCareer,
        paths: discoveredPaths,
        discoveryMethod: 'DATABASE',
        coverage: { direct: 0, indirect: 0, nonTraditional: 0 },
      },
      validatedPaths: [],
      invalidPaths: invalidPaths.map(i => ({
        pathId: i.path.pathId,
        reasons: i.results.flatMap(r => r.issues),
      })),
      primaryPath: discoveredPaths[0], // Use first discovered as placeholder
      alternativePaths: {
        primaryPathId: '',
        planA: discoveredPaths[0],
        planB: discoveredPaths[0],
        planC: discoveredPaths[0],
        switchingPoints: [],
      },
      pathComparison: {
        pathIds: discoveredPaths.map(p => p.pathId),
        targetCareer: input.targetCareer,
        difficulty: { dimension: 'DIFFICULTY', scores: {}, rankings: [], bestPathId: '', worstPathId: '', explanation: '' },
        risk: { dimension: 'RISK', scores: {}, rankings: [], bestPathId: '', worstPathId: '', explanation: '' },
        cost: { dimension: 'COST', scores: {}, rankings: [], bestPathId: '', worstPathId: '', explanation: '' },
        duration: { dimension: 'DURATION', scores: {}, rankings: [], bestPathId: '', worstPathId: '', explanation: '' },
        optionality: { dimension: 'OPTIONALITY', scores: {}, rankings: [], bestPathId: '', worstPathId: '', explanation: '' },
        utility: { dimension: 'UTILITY', scores: {}, rankings: [], bestPathId: '', worstPathId: '', explanation: '' },
        milestoneComparisons: [],
        outcomeComparisons: [],
        tradeoffs: [],
        recommendationRationale: ['No valid paths found - constraints may be too restrictive'],
        fitScores: {},
      },
      milestonePlan: {
        pathId: '',
        pathName: '',
        milestones: [],
        totalDuration: 0,
        criticalPath: [],
        parallelTracks: [],
        bufferTime: 0,
      },
      recoveryPlans: {},
      explanations: {},
      recommendations: [],
      optionalityAnalysis: {
        overallOptionality: 0,
        byPath: {},
        recommendations: ['Relax constraints to find viable paths'],
      },
    };
  }

  /**
   * Get risk score
   */
  private getRiskScore(risk: CareerPath['riskLevel']): number {
    const scores: Record<string, number> = {
      'VERY_LOW': 0.05,
      'LOW': 0.2,
      'MODERATE': 0.5,
      'HIGH': 0.8,
      'VERY_HIGH': 0.95,
    };
    return scores[risk] || 0.5;
  }

  /**
   * Generate unique analysis ID
   */
  private generateAnalysisId(): string {
    return `cp_analysis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Update engine configuration
   */
  updateConfig(config: Partial<CareerPathIntelligenceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): CareerPathIntelligenceConfig {
    return { ...this.config };
  }
}

/**
 * Factory function for Career Path Intelligence Engine
 */
export function createCareerPathIntelligenceEngine(
  config: CareerPathIntelligenceEngineConfig = {}
): CareerPathIntelligenceEngine {
  return new CareerPathIntelligenceEngine(config);
}

// Re-export all types and engines
export * from './types';
export { PathDiscoveryEngine, createPathDiscoveryEngine } from './engines/PathDiscoveryEngine';
export { PathValidationEngine, createPathValidationEngine } from './engines/PathValidationEngine';
export { MilestoneEngine, createMilestoneEngine } from './engines/MilestoneEngine';
export { AlternativePathEngine, createAlternativePathEngine } from './engines/AlternativePathEngine';
export { FailureRecoveryEngine, createFailureRecoveryEngine } from './engines/FailureRecoveryEngine';
export { PathComparisonEngine, createPathComparisonEngine } from './engines/PathComparisonEngine';
export { PathExplanationEngine, createPathExplanationEngine } from './engines/PathExplanationEngine';
