/**
 * Career Path Intelligence - Alternative Path Engine
 *
 * Generates Plan B, Plan C, Plan D for every career path.
 * Ensures students always have multiple options.
 *
 * Strategies:
 * - Plan B: Slightly easier/safer alternative
 * - Plan C: Significantly different approach
 * - Plan D: Backup with minimal risk
 *
 * @module intelligence/career-path-intelligence
 */

import {
  CareerPath,
  CareerPathIntelligenceInput,
  AlternativePathsResult,
  SwitchingPoint,
  PathType,
  PathDifficulty,
  PathRisk,
} from '../types';

/**
 * Alternative Path Engine Configuration
 */
export interface AlternativePathEngineConfig {
  /** Generate Plan B */
  generatePlanB: boolean;
  /** Generate Plan C */
  generatePlanC: boolean;
  /** Generate Plan D */
  generatePlanD: boolean;
  /** Maximum alternative paths */
  maxAlternatives: number;
  /** Difficulty tolerance for alternatives */
  difficultyTolerance: number;
}

/**
 * Default configuration
 */
export const DEFAULT_ALTERNATIVE_PATH_CONFIG: AlternativePathEngineConfig = {
  generatePlanB: true,
  generatePlanC: true,
  generatePlanD: false,
  maxAlternatives: 3,
  difficultyTolerance: 0.3,
};

/**
 * Alternative Path Engine
 */
export class AlternativePathEngine {
  private config: AlternativePathEngineConfig;

  constructor(config: Partial<AlternativePathEngineConfig> = {}) {
    this.config = { ...DEFAULT_ALTERNATIVE_PATH_CONFIG, ...config };
  }

  /**
   * Generate alternative paths for a primary path
   */
  generateAlternatives(
    primaryPath: CareerPath,
    allDiscoveredPaths: CareerPath[],
    input: CareerPathIntelligenceInput
  ): AlternativePathsResult {
    const alternatives: CareerPath[] = [];

    // Filter paths to the same target
    const sameTargetPaths = allDiscoveredPaths.filter(
      p => p.targetCareer === primaryPath.targetCareer && p.pathId !== primaryPath.pathId
    );

    // Generate Plan B: Easier/safer alternative
    if (this.config.generatePlanB) {
      const planB = this.findPlanB(primaryPath, sameTargetPaths, input);
      if (planB) alternatives.push(planB);
    }

    // Generate Plan C: Different approach
    if (this.config.generatePlanC) {
      const planC = this.findPlanC(primaryPath, sameTargetPaths, alternatives, input);
      if (planC) alternatives.push(planC);
    }

    // Generate Plan D: Safety net
    if (this.config.generatePlanD) {
      const planD = this.findPlanD(primaryPath, sameTargetPaths, alternatives, input);
      if (planD) alternatives.push(planD);
    }

    // If we don't have enough alternatives, generate synthetic ones
    while (alternatives.length < this.config.maxAlternatives &&
           alternatives.length < sameTargetPaths.length) {
      const remaining = sameTargetPaths.filter(
        p => !alternatives.some(a => a.pathId === p.pathId) && p.pathId !== primaryPath.pathId
      );
      if (remaining.length === 0) break;
      alternatives.push(remaining[0]);
    }

    // Identify switching points
    const switchingPoints = this.identifySwitchingPoints(primaryPath, alternatives);

    return {
      primaryPathId: primaryPath.pathId,
      planA: primaryPath,
      planB: alternatives[0] || primaryPath,
      planC: alternatives[1] || alternatives[0] || primaryPath,
      planD: alternatives[2],
      switchingPoints,
    };
  }

  /**
   * Find Plan B: Easier/safer alternative
   */
  private findPlanB(
    primaryPath: CareerPath,
    alternatives: CareerPath[],
    input: CareerPathIntelligenceInput
  ): CareerPath | null {
    // Sort by lower difficulty and risk
    const sorted = [...alternatives].sort((a, b) => {
      const aScore = this.getDifficultyScore(a.difficulty) + this.getRiskScore(a.riskLevel);
      const bScore = this.getDifficultyScore(b.difficulty) + this.getRiskScore(b.riskLevel);
      return aScore - bScore;
    });

    // Find one that's easier but still viable
    for (const path of sorted) {
      if (this.isEasierThan(path, primaryPath) &&
          this.isViableAlternative(path, input)) {
        return path;
      }
    }

    // If no easier path, return lowest risk
    return sorted[0] || null;
  }

  /**
   * Find Plan C: Different approach
   */
  private findPlanC(
    primaryPath: CareerPath,
    alternatives: CareerPath[],
    alreadySelected: CareerPath[],
    input: CareerPathIntelligenceInput
  ): CareerPath | null {
    // Filter out already selected
    const remaining = alternatives.filter(
      p => !alreadySelected.some(a => a.pathId === p.pathId)
    );

    // Sort by type difference (prefer different path types)
    const sorted = [...remaining].sort((a, b) => {
      const aDiff = a.type === primaryPath.type ? 0 : 1;
      const bDiff = b.type === primaryPath.type ? 0 : 1;
      return bDiff - aDiff;
    });

    // Find one with different approach
    for (const path of sorted) {
      if (path.type !== primaryPath.type &&
          this.isViableAlternative(path, input)) {
        return path;
      }
    }

    return sorted[0] || null;
  }

  /**
   * Find Plan D: Safety net (lowest risk)
   */
  private findPlanD(
    primaryPath: CareerPath,
    alternatives: CareerPath[],
    alreadySelected: CareerPath[],
    input: CareerPathIntelligenceInput
  ): CareerPath | null {
    // Filter out already selected
    const remaining = alternatives.filter(
      p => !alreadySelected.some(a => a.pathId === p.pathId)
    );

    // Sort by lowest risk
    const sorted = [...remaining].sort((a, b) =>
      this.getRiskScore(a.riskLevel) - this.getRiskScore(b.riskLevel)
    );

    // Find one with very low risk
    for (const path of sorted) {
      if (this.getRiskScore(path.riskLevel) <= 0.3 &&
          this.isViableAlternative(path, input)) {
        return path;
      }
    }

    return sorted[0] || null;
  }

  /**
   * Identify switching points between paths
   */
  private identifySwitchingPoints(
    primaryPath: CareerPath,
    alternatives: CareerPath[]
  ): SwitchingPoint[] {
    const switchingPoints: SwitchingPoint[] = [];

    // Find common milestones across paths
    const allPaths = [primaryPath, ...alternatives];

    for (const milestone of primaryPath.milestones) {
      const commonAcrossPaths = allPaths.filter(path =>
        path.milestones.some(m =>
          m.name.toLowerCase().includes(milestone.name.toLowerCase().split(' ')[0]) ||
          milestone.name.toLowerCase().includes(m.name.toLowerCase().split(' ')[0])
        )
      );

      if (commonAcrossPaths.length >= 2) {
        const availablePaths = commonAcrossPaths.map(p => p.pathId);

        switchingPoints.push({
          milestoneId: milestone.id,
          milestoneName: milestone.name,
          availablePaths,
          criteria: this.determineSwitchingCriteria(milestone, allPaths),
          recommendation: this.generateSwitchingRecommendation(milestone, allPaths),
        });
      }
    }

    return switchingPoints;
  }

  /**
   * Determine criteria for switching at a milestone
   */
  private determineSwitchingCriteria(
    milestone: CareerPath['milestones'][0],
    allPaths: CareerPath[]
  ): string {
    // Based on milestone type
    if (milestone.name.toLowerCase().includes('exam')) {
      return 'Exam results and rank obtained';
    }
    if (milestone.name.toLowerCase().includes('college') ||
        milestone.name.toLowerCase().includes('degree')) {
      return 'Academic performance and specialization choice';
    }
    if (milestone.name.toLowerCase().includes('job') ||
        milestone.name.toLowerCase().includes('role')) {
      return 'Work experience and skill development';
    }

    return 'Milestone completion and readiness assessment';
  }

  /**
   * Generate switching recommendation
   */
  private generateSwitchingRecommendation(
    milestone: CareerPath['milestones'][0],
    allPaths: CareerPath[]
  ): string {
    const pathDifficulties = allPaths.map(p => p.difficulty);
    const easiest = pathDifficulties.includes(PathDifficulty.EASY) ||
                    pathDifficulties.includes(PathDifficulty.VERY_EASY);

    if (milestone.failureProbability > 0.5) {
      return `Have backup plan ready as this milestone has ${Math.round(milestone.failureProbability * 100)}% failure rate`;
    }

    if (easiest) {
      return 'Choose path based on performance at this stage';
    }

    return 'Evaluate all options before proceeding';
  }

  /**
   * Check if path is easier than another
   */
  private isEasierThan(path: CareerPath, reference: CareerPath): boolean {
    const pathScore = this.getDifficultyScore(path.difficulty);
    const refScore = this.getDifficultyScore(reference.difficulty);
    return pathScore < refScore - this.config.difficultyTolerance;
  }

  /**
   * Check if path is viable alternative
   */
  private isViableAlternative(
    path: CareerPath,
    input: CareerPathIntelligenceInput
  ): boolean {
    // Check if within budget
    if (path.totalCost > input.studentProfile.financialConstraints.maxInvestment * 1.2) {
      return false;
    }

    // Check if within time
    if (path.duration > input.studentProfile.timeConstraints.maxDuration * 1.2) {
      return false;
    }

    // Check if path type is acceptable
    if (!input.studentProfile.preferredPathTypes.includes(path.type)) {
      // Allow if it's a backup
      return this.getRiskScore(path.riskLevel) <= 0.5;
    }

    return true;
  }

  /**
   * Get difficulty score
   */
  private getDifficultyScore(difficulty: PathDifficulty): number {
    const scores: Record<PathDifficulty, number> = {
      [PathDifficulty.VERY_EASY]: 0.1,
      [PathDifficulty.EASY]: 0.25,
      [PathDifficulty.MODERATE]: 0.5,
      [PathDifficulty.HARD]: 0.75,
      [PathDifficulty.VERY_HARD]: 0.9,
      [PathDifficulty.EXTREME]: 1.0,
    };
    return scores[difficulty] || 0.5;
  }

  /**
   * Get risk score
   */
  private getRiskScore(risk: PathRisk): number {
    const scores: Record<PathRisk, number> = {
      [PathRisk.VERY_LOW]: 0.05,
      [PathRisk.LOW]: 0.2,
      [PathRisk.MODERATE]: 0.5,
      [PathRisk.HIGH]: 0.8,
      [PathRisk.VERY_HIGH]: 0.95,
    };
    return scores[risk] || 0.5;
  }

  /**
   * Get fallback recommendations when all paths fail
   */
  getFallbackRecommendations(
    primaryPath: CareerPath,
    input: CareerPathIntelligenceInput
  ): string[] {
    const recommendations: string[] = [];

    recommendations.push(
      `Consider related roles in ${primaryPath.industry} that don't require the full path`
    );

    recommendations.push(
      'Explore adjacent career fields that leverage similar skills'
    );

    if (input.studentProfile.skills.length > 0) {
      recommendations.push(
        `Leverage existing skills: ${input.studentProfile.skills.slice(0, 3).join(', ')}`
      );
    }

    recommendations.push(
      'Consider upskilling through short-term certifications'
    );

    recommendations.push(
      'Explore freelance or contract work to build experience'
    );

    return recommendations;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AlternativePathEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Factory function
 */
export function createAlternativePathEngine(
  config?: Partial<AlternativePathEngineConfig>
): AlternativePathEngine {
  return new AlternativePathEngine(config);
}
