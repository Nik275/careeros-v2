/**
 * Career Path Intelligence - Path Comparison Engine
 *
 * Compares multiple career paths across dimensions:
 * - Difficulty
 * - Risk
 * - Cost
 * - Duration
 * - Optionality (flexibility)
 * - Utility (value/ROI)
 *
 * Provides rankings, tradeoff analysis, and recommendations.
 *
 * @module intelligence/career-path-intelligence
 */

import {
  CareerPath,
  PathComparison,
  PathDimensionComparison,
  MilestoneComparison,
  OutcomeComparison,
  PathTradeoff,
  CareerPathIntelligenceInput,
  PathType,
  PathDifficulty,
  PathRisk,
  getDifficultyScore,
  getRiskScore,
} from '../types';

/**
 * Path Comparison Engine Configuration
 */
export interface PathComparisonEngineConfig {
  /** Weights for different comparison dimensions */
  weights: {
    difficulty: number;
    risk: number;
    cost: number;
    duration: number;
    optionality: number;
    utility: number;
  };
  /** Include detailed milestone comparisons */
  detailedMilestoneComparison: boolean;
  /** Include tradeoff analysis */
  includeTradeoffs: boolean;
}

/**
 * Default configuration
 */
export const DEFAULT_PATH_COMPARISON_CONFIG: PathComparisonEngineConfig = {
  weights: {
    difficulty: 0.15,
    risk: 0.2,
    cost: 0.2,
    duration: 0.15,
    optionality: 0.15,
    utility: 0.15,
  },
  detailedMilestoneComparison: true,
  includeTradeoffs: true,
};

/**
 * Path Comparison Engine
 */
export class PathComparisonEngine {
  private config: PathComparisonEngineConfig;

  constructor(config: Partial<PathComparisonEngineConfig> = {}) {
    this.config = { ...DEFAULT_PATH_COMPARISON_CONFIG, ...config };
  }

  /**
   * Compare multiple paths
   */
  compare(
    paths: CareerPath[],
    targetCareer: string,
    input: CareerPathIntelligenceInput
  ): PathComparison {
    // Handle single path scenario gracefully
    if (paths.length === 0) {
      throw new Error('At least 1 path required for comparison');
    }

    if (paths.length === 1) {
      const singlePath = paths[0];
      return {
        pathIds: [singlePath.pathId],
        targetCareer,
        difficulty: {
          dimension: 'DIFFICULTY',
          scores: { [singlePath.pathId]: 1 },
          rankings: [singlePath.pathId],
          bestPathId: singlePath.pathId,
          worstPathId: singlePath.pathId,
          explanation: `${singlePath.name} is the only available path (${singlePath.difficulty})`,
        },
        risk: {
          dimension: 'RISK',
          scores: { [singlePath.pathId]: 1 },
          rankings: [singlePath.pathId],
          bestPathId: singlePath.pathId,
          worstPathId: singlePath.pathId,
          explanation: `${singlePath.name} has risk level ${singlePath.riskLevel} (only path)`,
        },
        cost: {
          dimension: 'COST',
          scores: { [singlePath.pathId]: 1 },
          rankings: [singlePath.pathId],
          bestPathId: singlePath.pathId,
          worstPathId: singlePath.pathId,
          explanation: `${singlePath.name} costs ${this.formatCost(singlePath.totalCost)} (only path)`,
        },
        duration: {
          dimension: 'DURATION',
          scores: { [singlePath.pathId]: 1 },
          rankings: [singlePath.pathId],
          bestPathId: singlePath.pathId,
          worstPathId: singlePath.pathId,
          explanation: `${singlePath.name} takes ${singlePath.duration} months (only path)`,
        },
        optionality: {
          dimension: 'OPTIONALITY',
          scores: { [singlePath.pathId]: singlePath.optionalityScore },
          rankings: [singlePath.pathId],
          bestPathId: singlePath.pathId,
          worstPathId: singlePath.pathId,
          explanation: `${singlePath.name} has optionality score ${(singlePath.optionalityScore).toFixed(2)}`,
        },
        utility: {
          dimension: 'UTILITY',
          scores: { [singlePath.pathId]: singlePath.roi * 5 },
          rankings: [singlePath.pathId],
          bestPathId: singlePath.pathId,
          worstPathId: singlePath.pathId,
          explanation: `${singlePath.name} has ROI of ${(singlePath.roi * 100).toFixed(0)}%`,
        },
        milestoneComparisons: [],
        outcomeComparisons: [],
        tradeoffs: [],
        recommendedPathId: singlePath.pathId,
        recommendationRationale: ['This is the only available path'],
        fitScores: { [singlePath.pathId]: 0.5 },
      };
    }

    const pathIds = paths.map(p => p.pathId);

    // Compare each dimension
    const difficulty = this.compareDifficulty(paths);
    const risk = this.compareRisk(paths);
    const cost = this.compareCost(paths);
    const duration = this.compareDuration(paths);
    const optionality = this.compareOptionality(paths);
    const utility = this.compareUtility(paths);

    // Detailed comparisons
    const milestoneComparisons = this.config.detailedMilestoneComparison
      ? this.compareMilestones(paths)
      : [];

    const outcomeComparisons = this.compareOutcomes(paths);

    // Tradeoff analysis
    const tradeoffs = this.config.includeTradeoffs
      ? this.analyzeTradeoffs(paths, input)
      : [];

    // Calculate fit scores
    const fitScores = this.calculateFitScores(paths, input);

    // Determine recommended path
    const { recommendedPathId, recommendationRationale } = this.determineRecommendation(
      paths,
      fitScores,
      { difficulty, risk, cost, duration, optionality, utility }
    );

    return {
      pathIds,
      targetCareer,
      difficulty,
      risk,
      cost,
      duration,
      optionality,
      utility,
      milestoneComparisons,
      outcomeComparisons,
      tradeoffs,
      recommendedPathId,
      recommendationRationale,
      fitScores,
    };
  }

  /**
   * Compare path difficulty
   */
  private compareDifficulty(paths: CareerPath[]): PathDimensionComparison {
    const scores: Record<string, number> = {};

    for (const path of paths) {
      scores[path.pathId] = 1 - getDifficultyScore(path.difficulty); // Higher score = easier
    }

    const rankings = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id);

    const bestPathId = rankings[0];
    const worstPathId = rankings[rankings.length - 1];

    const bestPath = paths.find(p => p.pathId === bestPathId);
    const worstPath = paths.find(p => p.pathId === worstPathId);

    return {
      dimension: 'DIFFICULTY',
      scores,
      rankings,
      bestPathId,
      worstPathId,
      explanation: `${bestPath?.name} is the easiest path (${bestPath?.difficulty}), ` +
                   `while ${worstPath?.name} is the hardest (${worstPath?.difficulty})`,
    };
  }

  /**
   * Compare path risk
   */
  private compareRisk(paths: CareerPath[]): PathDimensionComparison {
    const scores: Record<string, number> = {};

    for (const path of paths) {
      scores[path.pathId] = 1 - getRiskScore(path.riskLevel); // Higher score = lower risk
    }

    const rankings = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id);

    const bestPathId = rankings[0];
    const worstPathId = rankings[rankings.length - 1];

    const bestPath = paths.find(p => p.pathId === bestPathId);
    const worstPath = paths.find(p => p.pathId === worstPathId);

    return {
      dimension: 'RISK',
      scores,
      rankings,
      bestPathId,
      worstPathId,
      explanation: `${bestPath?.name} has the lowest risk (${bestPath?.riskLevel}), ` +
                   `while ${worstPath?.name} carries the most risk (${worstPath?.riskLevel})`,
    };
  }

  /**
   * Compare path cost
   */
  private compareCost(paths: CareerPath[]): PathDimensionComparison {
    const scores: Record<string, number> = {};
    const maxCost = Math.max(...paths.map(p => p.totalCost));

    for (const path of paths) {
      scores[path.pathId] = 1 - (path.totalCost / maxCost); // Higher score = lower cost
    }

    const rankings = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id);

    const bestPathId = rankings[0];
    const worstPathId = rankings[rankings.length - 1];

    const bestPath = paths.find(p => p.pathId === bestPathId);
    const worstPath = paths.find(p => p.pathId === worstPathId);

    return {
      dimension: 'COST',
      scores,
      rankings,
      bestPathId,
      worstPathId,
      explanation: `${bestPath?.name} is the most affordable at ${this.formatCost(bestPath?.totalCost || 0)}, ` +
                   `while ${worstPath?.name} costs ${this.formatCost(worstPath?.totalCost || 0)}`,
    };
  }

  /**
   * Compare path duration
   */
  private compareDuration(paths: CareerPath[]): PathDimensionComparison {
    const scores: Record<string, number> = {};
    const maxDuration = Math.max(...paths.map(p => p.duration));

    for (const path of paths) {
      scores[path.pathId] = 1 - (path.duration / maxDuration); // Higher score = shorter
    }

    const rankings = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id);

    const bestPathId = rankings[0];
    const worstPathId = rankings[rankings.length - 1];

    const bestPath = paths.find(p => p.pathId === bestPathId);
    const worstPath = paths.find(p => p.pathId === worstPathId);

    return {
      dimension: 'DURATION',
      scores,
      rankings,
      bestPathId,
      worstPathId,
      explanation: `${bestPath?.name} is fastest at ${bestPath?.duration} months, ` +
                   `while ${worstPath?.name} takes ${worstPath?.duration} months`,
    };
  }

  /**
   * Compare path optionality
   */
  private compareOptionality(paths: CareerPath[]): PathDimensionComparison {
    const scores: Record<string, number> = {};

    for (const path of paths) {
      scores[path.pathId] = path.optionalityScore;
    }

    const rankings = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id);

    const bestPathId = rankings[0];
    const worstPathId = rankings[rankings.length - 1];

    const bestPath = paths.find(p => p.pathId === bestPathId);
    const worstPath = paths.find(p => p.pathId === worstPathId);

    return {
      dimension: 'OPTIONALITY',
      scores,
      rankings,
      bestPathId,
      worstPathId,
      explanation: `${bestPath?.name} offers the most flexibility with optionality score ${(bestPath?.optionalityScore || 0).toFixed(2)}, ` +
                   `while ${worstPath?.name} is more rigid (${(worstPath?.optionalityScore || 0).toFixed(2)})`,
    };
  }

  /**
   * Compare path utility (ROI, salary, etc.)
   */
  private compareUtility(paths: CareerPath[]): PathDimensionComparison {
    const scores: Record<string, number> = {};

    for (const path of paths) {
      // Calculate utility score based on ROI and salary
      const roiScore = Math.min(path.roi * 5, 1); // Normalize ROI
      const salaryScore = path.expectedSalaryAt5Years / 5000000; // Normalize to 50L
      scores[path.pathId] = (roiScore + salaryScore) / 2;
    }

    const rankings = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id);

    const bestPathId = rankings[0];
    const worstPathId = rankings[rankings.length - 1];

    const bestPath = paths.find(p => p.pathId === bestPathId);
    const worstPath = paths.find(p => p.pathId === worstPathId);

    return {
      dimension: 'UTILITY',
      scores,
      rankings,
      bestPathId,
      worstPathId,
      explanation: `${bestPath?.name} offers best value with 5-year salary of ${this.formatCost(bestPath?.expectedSalaryAt5Years || 0)} ` +
                   `and ROI of ${((bestPath?.roi || 0) * 100).toFixed(0)}%, ` +
                   `while ${worstPath?.name} yields ${this.formatCost(worstPath?.expectedSalaryAt5Years || 0)}`,
    };
  }

  /**
   * Compare milestones across paths
   */
  private compareMilestones(paths: CareerPath[]): MilestoneComparison[] {
    const comparisons: MilestoneComparison[] = [];

    // Find common milestone positions
    const maxMilestones = Math.max(...paths.map(p => p.milestones.length));

    for (let i = 0; i < maxMilestones; i++) {
      const milestoneAtPosition = paths
        .map(p => p.milestones[i])
        .filter(Boolean);

      if (milestoneAtPosition.length === 0) continue;

      const pathDurations: Record<string, number> = {};
      const pathDifficulties: Record<string, PathDifficulty> = {};
      const pathCosts: Record<string, number> = {};

      for (const path of paths) {
        const milestone = path.milestones[i];
        if (milestone) {
          pathDurations[path.pathId] = milestone.expectedDuration;
          pathDifficulties[path.pathId] = path.difficulty; // Use path difficulty as proxy
          pathCosts[path.pathId] = this.estimateMilestoneCost(milestone);
        }
      }

      comparisons.push({
        milestoneIndex: i,
        milestoneName: milestoneAtPosition[0].name,
        pathDurations,
        pathDifficulties,
        pathCosts,
      });
    }

    return comparisons;
  }

  /**
   * Compare outcomes across paths
   */
  private compareOutcomes(paths: CareerPath[]): OutcomeComparison[] {
    const comparisons: OutcomeComparison[] = [];

    // Salary comparison
    comparisons.push({
      outcomeType: 'STARTING_SALARY',
      pathOutcomes: Object.fromEntries(
        paths.map(p => [p.pathId, {
          type: 'INCOME' as const,
          description: `Starting salary: ${this.formatCost(p.expectedStartingSalary)}`,
          value: p.expectedStartingSalary,
          confidence: 0.8,
        }])
      ),
      comparison: `Starting salaries range from ${this.formatCost(Math.min(...paths.map(p => p.expectedStartingSalary)))} ` +
                  `to ${this.formatCost(Math.max(...paths.map(p => p.expectedStartingSalary)))}`,
    });

    // 5-year salary comparison
    comparisons.push({
      outcomeType: 'SALARY_5_YEARS',
      pathOutcomes: Object.fromEntries(
        paths.map(p => [p.pathId, {
          type: 'INCOME' as const,
          description: `5-year salary: ${this.formatCost(p.expectedSalaryAt5Years)}`,
          value: p.expectedSalaryAt5Years,
          confidence: 0.7,
        }])
      ),
      comparison: `After 5 years, salaries range from ${this.formatCost(Math.min(...paths.map(p => p.expectedSalaryAt5Years)))} ` +
                  `to ${this.formatCost(Math.max(...paths.map(p => p.expectedSalaryAt5Years)))}`,
    });

    return comparisons;
  }

  /**
   * Analyze tradeoffs between paths
   */
  private analyzeTradeoffs(
    paths: CareerPath[],
    input: CareerPathIntelligenceInput
  ): PathTradeoff[] {
    const tradeoffs: PathTradeoff[] = [];

    // Compare each pair of paths
    for (let i = 0; i < paths.length; i++) {
      for (let j = i + 1; j < paths.length; j++) {
        const pathA = paths[i];
        const pathB = paths[j];

        // Difficulty tradeoff
        if (pathA.difficulty !== pathB.difficulty) {
          const easierPath = getDifficultyScore(pathA.difficulty) < getDifficultyScore(pathB.difficulty)
            ? pathA : pathB;
          const harderPath = easierPath === pathA ? pathB : pathA;

          tradeoffs.push({
            between: [pathA.pathId, pathB.pathId],
            dimension: 'DIFFICULTY',
            tradeoffDescription: `${harderPath.name} is more difficult but may offer better outcomes, ` +
                                 `while ${easierPath.name} is more accessible`,
          });
        }

        // Cost vs Utility tradeoff
        if (pathA.totalCost !== pathB.totalCost && pathA.roi !== pathB.roi) {
          const expensivePath = pathA.totalCost > pathB.totalCost ? pathA : pathB;
          const cheaperPath = expensivePath === pathA ? pathB : pathA;
          const betterRoiPath = pathA.roi > pathB.roi ? pathA : pathB;

          tradeoffs.push({
            between: [pathA.pathId, pathB.pathId],
            dimension: 'COST_VS_UTILITY',
            tradeoffDescription: expensivePath === betterRoiPath
              ? `${expensivePath.name} costs more but offers better ROI (${(expensivePath.roi * 100).toFixed(0)}%)`
              : `${cheaperPath.name} costs less but may have lower long-term returns`,
          });
        }

        // Risk vs Reward tradeoff
        if (pathA.riskLevel !== pathB.riskLevel) {
          const riskierPath = getRiskScore(pathA.riskLevel) > getRiskScore(pathB.riskLevel)
            ? pathA : pathB;
          const saferPath = riskierPath === pathA ? pathB : pathA;

          tradeoffs.push({
            between: [pathA.pathId, pathB.pathId],
            dimension: 'RISK_VS_REWARD',
            tradeoffDescription: `${riskierPath.name} carries more risk but offers higher potential, ` +
                                 `while ${saferPath.name} provides more certainty`,
          });
        }
      }
    }

    return tradeoffs;
  }

  /**
   * Calculate fit scores for each path
   */
  private calculateFitScores(
    paths: CareerPath[],
    input: CareerPathIntelligenceInput
  ): Record<string, number> {
    const scores: Record<string, number> = {};

    for (const path of paths) {
      let score = 0;

      // Risk tolerance match
      if (input.studentProfile.riskTolerance === 'LOW' &&
          getRiskScore(path.riskLevel) < 0.4) {
        score += 0.2;
      }

      // Path type preference
      if (input.studentProfile.preferredPathTypes.includes(path.type)) {
        score += 0.15;
      }

      // Budget fit
      if (path.totalCost <= input.studentProfile.financialConstraints.maxInvestment) {
        score += 0.15;
      } else if (path.totalCost <= input.studentProfile.financialConstraints.maxInvestment * 1.2) {
        score += 0.05;
      }

      // Timeline fit
      if (path.duration <= input.studentProfile.timeConstraints.maxDuration) {
        score += 0.15;
      }

      // Confidence boost
      score += path.confidence * 0.2;

      // Optionality preference
      if (input.preferences?.prioritizeOptionality) {
        score += path.optionalityScore * 0.15;
      }

      scores[path.pathId] = Math.min(score, 1);
    }

    return scores;
  }

  /**
   * Determine recommended path
   */
  private determineRecommendation(
    paths: CareerPath[],
    fitScores: Record<string, number>,
    comparisons: {
      difficulty: PathDimensionComparison;
      risk: PathDimensionComparison;
      cost: PathDimensionComparison;
      duration: PathDimensionComparison;
      optionality: PathDimensionComparison;
      utility: PathDimensionComparison;
    }
  ): { recommendedPathId: string; recommendationRationale: string[] } {
    // Calculate composite scores
    const compositeScores: Record<string, number> = {};

    for (const path of paths) {
      const w = this.config.weights;
      compositeScores[path.pathId] =
        comparisons.difficulty.scores[path.pathId] * w.difficulty +
        comparisons.risk.scores[path.pathId] * w.risk +
        comparisons.cost.scores[path.pathId] * w.cost +
        comparisons.duration.scores[path.pathId] * w.duration +
        comparisons.optionality.scores[path.pathId] * w.optionality +
        comparisons.utility.scores[path.pathId] * w.utility +
        fitScores[path.pathId] * 0.2; // Bonus for student fit
    }

    // Find best path
    const bestPathId = Object.entries(compositeScores)
      .sort((a, b) => b[1] - a[1])[0][0];

    const bestPath = paths.find(p => p.pathId === bestPathId)!;

    // Generate rationale
    const rationale: string[] = [];

    rationale.push(`Highest composite score based on weighted dimensions`);

    if (comparisons.risk.rankings[0] === bestPathId) {
      rationale.push(`Lowest risk among alternatives`);
    }

    if (comparisons.cost.rankings[0] === bestPathId) {
      rationale.push(`Most cost-effective option`);
    }

    if (fitScores[bestPathId] > 0.7) {
      rationale.push(`Strong alignment with your profile and preferences`);
    }

    if (bestPath.optionalityScore > 0.7) {
      rationale.push(`High optionality provides future flexibility`);
    }

    return { recommendedPathId: bestPathId, recommendationRationale: rationale };
  }

  /**
   * Estimate milestone cost
   */
  private estimateMilestoneCost(milestone: CareerPath['milestones'][0]): number {
    return milestone.resources
      .filter(r => r.type === 'MONEY')
      .reduce((sum, r) => sum + (r.amount || 0), 0);
  }

  /**
   * Format cost
   */
  private formatCost(amount: number): string {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}K`;
    }
    return `₹${amount}`;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<PathComparisonEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Factory function
 */
export function createPathComparisonEngine(
  config?: Partial<PathComparisonEngineConfig>
): PathComparisonEngine {
  return new PathComparisonEngine(config);
}
