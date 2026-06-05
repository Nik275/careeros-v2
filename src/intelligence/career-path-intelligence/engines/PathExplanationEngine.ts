/**
 * Career Path Intelligence - Path Explanation Engine
 *
 * Generates human-readable explanations for career paths:
 * - Overview and journey descriptions
 * - Context-aware narratives
 * - Comparison explanations
 * - Constraint explanations
 * - Personalized recommendations
 *
 * @module intelligence/career-path-intelligence
 */

import {
  CareerPath,
  PathExplanation,
  PathComparison,
  CareerPathIntelligenceInput,
  PathIntelligenceStudentProfile,
  Milestone,
  PathType,
  PathDifficulty,
  PathRisk,
  formatDuration,
  formatCost,
  getDifficultyScore,
} from '../types';

/**
 * Path Explanation Engine Configuration
 */
export interface PathExplanationEngineConfig {
  /** Verbosity level */
  verbosity: 'minimal' | 'standard' | 'detailed';
  /** Include milestone details */
  includeMilestoneDetails: boolean;
  /** Include financial breakdown */
  includeFinancialDetails: boolean;
  /** Include risk warnings */
  includeRiskWarnings: boolean;
  /** Tone of explanations */
  tone: 'professional' | 'conversational' | 'motivational';
}

/**
 * Default configuration
 */
export const DEFAULT_PATH_EXPLANATION_CONFIG: PathExplanationEngineConfig = {
  verbosity: 'detailed',
  includeMilestoneDetails: true,
  includeFinancialDetails: true,
  includeRiskWarnings: true,
  tone: 'professional',
};

/**
 * Path Explanation Engine
 */
export class PathExplanationEngine {
  private config: PathExplanationEngineConfig;

  constructor(config: Partial<PathExplanationEngineConfig> = {}) {
    this.config = { ...DEFAULT_PATH_EXPLANATION_CONFIG, ...config };
  }

  /**
   * Generate explanation for a single path
   */
  generateExplanation(
    path: CareerPath,
    input: CareerPathIntelligenceInput,
    comparison?: PathComparison
  ): PathExplanation {
    return {
      pathId: path.pathId,
      pathName: path.name,
      overview: this.generateOverview(path),
      journeyDescription: this.generateJourneyDescription(path),
      milestoneNarrative: this.generateMilestoneNarrative(path),
      alternativeNarrative: this.generateAlternativeNarrative(path),
      riskNarrative: this.generateRiskNarrative(path),
      comparisonToDirectPath: comparison
        ? this.generateComparisonToDirect(path, comparison)
        : undefined,
      comparisonToEasiestPath: comparison
        ? this.generateComparisonToEasiest(path, comparison)
        : undefined,
      comparisonToFastestPath: comparison
        ? this.generateComparisonToFastest(path, comparison)
        : undefined,
      fitExplanation: this.generateFitExplanation(path, input.studentProfile),
      constraintExplanation: this.generateConstraintExplanation(path, input.studentProfile),
      recommendationRationale: this.generateRecommendationRationale(path, input),
    };
  }

  /**
   * Generate path overview
   */
  private generateOverview(path: CareerPath): string {
    let overview = '';

    // Opening
    overview += `The ${path.name} is a `;
    overview += `${this.formatPathType(path.type).toLowerCase()} `;
    overview += `route to becoming a ${path.targetCareer}. `;

    // Duration and cost
    overview += `This path takes approximately ${formatDuration(path.duration)} `;
    if (this.config.includeFinancialDetails) {
      overview += `and requires an investment of ${formatCost(path.totalCost)}. `;
    } else {
      overview += 'to complete. ';
    }

    // Difficulty
    overview += `It is rated as ${path.difficulty.toLowerCase().replace('_', ' ')} `;
    overview += `with ${path.riskLevel.toLowerCase().replace('_', ' ')} risk. `;

    // Key characteristics
    if (path.optionalityScore > 0.7) {
      overview += 'This path offers excellent flexibility for future pivots. ';
    } else if (path.optionalityScore < 0.4) {
      overview += 'This path requires strong commitment to this specific career direction. ';
    }

    return overview;
  }

  /**
   * Generate journey description
   */
  private generateJourneyDescription(path: CareerPath): string {
    let description = '';

    description += `Your journey begins with `;

    // Describe first milestone
    const firstMilestone = path.milestones[0];
    if (firstMilestone) {
      description += `${firstMilestone.name.toLowerCase()}, `;
      description += `where you will ${firstMilestone.description.toLowerCase()}. `;
    }

    // Describe progression
    if (path.milestones.length > 2) {
      description += `Over the next ${formatDuration(path.duration)}, `;
      description += `you will progress through ${path.milestones.length} key stages: `;
      description += path.milestones.slice(1).map(m => m.name).join(', ');
      description += '. ';
    }

    // Describe outcome
    description += `Upon completion, you will be positioned to work as a ${path.targetCareer} `;
    description += `with an expected starting salary of ${formatCost(path.expectedStartingSalary)}. `;

    // Growth trajectory
    description += `Within 5 years, your earning potential could reach ${formatCost(path.expectedSalaryAt5Years)} `;
    description += `as you advance in your career.`;

    return description;
  }

  /**
   * Generate milestone narrative
   */
  private generateMilestoneNarrative(path: CareerPath): string {
    if (!this.config.includeMilestoneDetails) {
      return `This path contains ${path.milestones.length} milestones.`;
    }

    let narrative = '';

    narrative += 'Key milestones along this path:\n\n';

    for (let i = 0; i < path.milestones.length; i++) {
      const milestone = path.milestones[i];
      const number = i + 1;

      narrative += `${number}. ${milestone.name} (${formatDuration(milestone.expectedDuration)})\n`;
      narrative += `   ${milestone.description}\n`;

      if (milestone.skillsAcquired.length > 0) {
        narrative += `   Skills gained: ${milestone.skillsAcquired.slice(0, 3).join(', ')}`;
        if (milestone.skillsAcquired.length > 3) {
          narrative += ` and ${milestone.skillsAcquired.length - 3} more`;
        }
        narrative += '\n';
      }

      if (milestone.failureProbability > 0.4 && this.config.includeRiskWarnings) {
        narrative += `   ⚠️ ${Math.round(milestone.failureProbability * 100)}% of students face challenges here\n`;
      }

      narrative += '\n';
    }

    return narrative.trim();
  }

  /**
   * Generate alternative narrative
   */
  private generateAlternativeNarrative(path: CareerPath): string {
    let narrative = '';

    if (path.alternativePathIds.length === 0) {
      narrative += 'This is the primary path identified for this career goal.';
      return narrative;
    }

    narrative += `This is one of ${path.alternativePathIds.length + 1} possible paths `;
    narrative += `to become a ${path.targetCareer}. `;

    // Position this path
    if (path.type === PathType.DIRECT) {
      narrative += 'This is the most direct route, ';
    } else if (path.type === PathType.INDIRECT) {
      narrative += 'This is an alternative route that may offer unique advantages, ';
    } else if (path.type === PathType.NON_TRADITIONAL) {
      narrative += 'This non-traditional route offers a different approach, ';
    }

    // Risk profile
    if (getRiskScore(path.riskLevel) < 0.3) {
      narrative += 'and represents a lower-risk option compared to alternatives. ';
    } else if (getRiskScore(path.riskLevel) > 0.7) {
      narrative += 'but carries higher risk than other available paths. ';
    }

    narrative += `Alternative paths are available if this one doesn't work out. `;
    narrative += 'Switching between paths is possible at several points.';

    return narrative;
  }

  /**
   * Generate risk narrative
   */
  private generateRiskNarrative(path: CareerPath): string {
    if (!this.config.includeRiskWarnings) {
      return '';
    }

    let narrative = '';

    const riskLevel = getRiskScore(path.riskLevel);

    if (riskLevel < 0.3) {
      narrative += 'This path has relatively low risk. ';
      narrative += 'The main milestones are achievable with consistent effort, ';
      narrative += 'and there are multiple fallback options if any stage proves challenging. ';
    } else if (riskLevel < 0.6) {
      narrative += 'This path carries moderate risk. ';
      narrative += 'Some milestones have significant failure rates, ';
      narrative += 'but recovery paths are available. ';
      narrative += 'Success requires dedication and preparation. ';
    } else {
      narrative += 'This path carries substantial risk. ';
      narrative += 'Multiple milestones have high failure rates, ';
      narrative += 'and success is not guaranteed even with strong effort. ';
      narrative += 'It is essential to have backup plans in place. ';
    }

    // Specific high-risk milestones
    const highRiskMilestones = path.milestones.filter(m => m.failureProbability > 0.5);
    if (highRiskMilestones.length > 0) {
      narrative += `\n\nParticular attention should be paid to: `;
      narrative += highRiskMilestones.map(m => m.name).join(', ');
      narrative += '. These stages have historically challenging outcomes.';
    }

    return narrative;
  }

  /**
   * Generate comparison to direct path
   */
  private generateComparisonToDirect(
    path: CareerPath,
    comparison: PathComparison
  ): string {
    const directPathId = comparison.difficulty.rankings[0];
    const directPath = comparison.pathIds.includes(directPathId);

    if (!directPath || path.pathId === directPathId) {
      return 'This is the most direct path available.';
    }

    let comparison_text = '';

    comparison_text += `Compared to the most direct path, this route `;

    const durationDiff = comparison.duration.scores[path.pathId] -
                         comparison.duration.scores[directPathId];

    if (durationDiff < -0.2) {
      comparison_text += `takes significantly longer `;
    } else if (durationDiff < 0) {
      comparison_text += `takes somewhat longer `;
    } else if (durationDiff > 0.2) {
      comparison_text += `is actually faster `;
    }

    const riskDiff = comparison.risk.scores[path.pathId] -
                     comparison.risk.scores[directPathId];

    if (riskDiff > 0.1) {
      comparison_text += `but offers lower risk. `;
    } else if (riskDiff < -0.1) {
      comparison_text += `but carries higher risk. `;
    } else {
      comparison_text += `with similar risk profile. `;
    }

    comparison_text += `This path may be preferable if `;

    if (path.optionalityScore > 0.6) {
      comparison_text += `you value flexibility and optionality.`;
    } else if (path.totalCost < comparison.cost.scores[directPathId] * 1000000) {
      comparison_text += `cost is a primary concern.`;
    } else {
      comparison_text += `your circumstances favor this approach.`;
    }

    return comparison_text;
  }

  /**
   * Generate comparison to easiest path
   */
  private generateComparisonToEasiest(
    path: CareerPath,
    comparison: PathComparison
  ): string {
    const easiestPathId = comparison.difficulty.bestPathId;

    if (path.pathId === easiestPathId) {
      return 'This is the easiest path available.';
    }

    let comparison_text = '';

    comparison_text += `This path is more challenging than the easiest option. `;

    const difficultyScore = getDifficultyScore(path.difficulty);
    const easiestScore = 1 - comparison.difficulty.scores[easiestPathId];

    if (difficultyScore - easiestScore > 0.3) {
      comparison_text += `It requires significantly more effort and preparation. `;
    } else {
      comparison_text += `The difficulty difference is moderate. `;
    }

    comparison_text += `However, `;

    const utilityDiff = comparison.utility.scores[path.pathId] -
                        comparison.utility.scores[easiestPathId];

    if (utilityDiff > 0.1) {
      comparison_text += `the additional challenge may be justified by better outcomes `;
      comparison_text += `(higher salary potential and career growth).`;
    } else if (path.optionalityScore > 0.6) {
      comparison_text += `it offers more flexibility for future career changes.`;
    } else {
      comparison_text += `it may align better with your specific goals.`;
    }

    return comparison_text;
  }

  /**
   * Generate comparison to fastest path
   */
  private generateComparisonToFastest(
    path: CareerPath,
    comparison: PathComparison
  ): string {
    const fastestPathId = comparison.duration.bestPathId;

    if (path.pathId === fastestPathId) {
      return 'This is the fastest path available.';
    }

    let comparison_text = '';

    const durationDiff = comparison.duration.scores[fastestPathId] -
                         comparison.duration.scores[path.pathId];
    const monthsDiff = Math.round(durationDiff *
      Math.max(...comparison.pathIds.map(id => comparison.duration.scores[id])) * 120);

    comparison_text += `This path takes approximately ${formatDuration(monthsDiff)} `;
    comparison_text += `longer than the fastest route. `;

    comparison_text += `The additional time may be worthwhile if `;

    if (path.optionalityScore > 0.6) {
      comparison_text += `you value having multiple options at each stage.`;
    } else if (getRiskScore(path.riskLevel) < 0.4) {
      comparison_text += `you prefer a more secure path with lower risk.`;
    } else if (comparison.cost.scores[path.pathId] > comparison.cost.scores[fastestPathId]) {
      comparison_text += `the lower cost justifies the longer timeline.`;
    } else {
      comparison_text += `this approach better fits your circumstances.`;
    }

    return comparison_text;
  }

  /**
   * Generate fit explanation
   */
  private generateFitExplanation(
    path: CareerPath,
    profile: PathIntelligenceStudentProfile
  ): string {
    let explanation = '';

    // Budget fit
    if (path.totalCost <= profile.financialConstraints.maxInvestment) {
      explanation += 'This path fits comfortably within your stated budget. ';
    } else if (path.totalCost <= profile.financialConstraints.maxInvestment * 1.2) {
      explanation += 'This path slightly exceeds your budget but may be manageable with loans. ';
    } else {
      explanation += 'This path significantly exceeds your budget and will require substantial funding. ';
    }

    // Timeline fit
    if (path.duration <= profile.timeConstraints.maxDuration) {
      explanation += 'The timeline aligns well with your constraints. ';
    } else {
      explanation += `The ${formatDuration(path.duration)} timeline exceeds your preferred duration. `;
    }

    // Risk fit
    if (profile.riskTolerance === 'LOW' && getRiskScore(path.riskLevel) < 0.4) {
      explanation += 'The low risk profile matches your risk tolerance. ';
    } else if (profile.riskTolerance === 'HIGH' && getRiskScore(path.riskLevel) > 0.6) {
      explanation += 'The higher risk may be acceptable given your risk tolerance. ';
    } else if (profile.riskTolerance === 'LOW' && getRiskScore(path.riskLevel) > 0.6) {
      explanation += '⚠️ The risk level may exceed your comfort zone. ';
    }

    // Skills alignment
    const matchingSkills = path.milestones.flatMap(m => m.skillsAcquired)
      .filter(skill => profile.skills.some(s =>
        s.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(s.toLowerCase())
      ));

    if (matchingSkills.length > 0) {
      explanation += `You already have relevant skills: ${matchingSkills.slice(0, 3).join(', ')}. `;
    }

    return explanation;
  }

  /**
   * Generate constraint explanation
   */
  private generateConstraintExplanation(
    path: CareerPath,
    profile: PathIntelligenceStudentProfile
  ): string {
    let explanation = '';
    const constraints: string[] = [];

    // Financial constraints
    if (path.totalCost > profile.financialConstraints.maxInvestment) {
      const gap = path.totalCost - profile.financialConstraints.maxInvestment;
      constraints.push(`requires ${formatCost(gap)} beyond your stated budget`);
    }

    // Time constraints
    if (path.duration > profile.timeConstraints.maxDuration) {
      constraints.push(`exceeds your preferred timeline by ${formatDuration(path.duration - profile.timeConstraints.maxDuration)}`);
    }

    // Location constraints
    if (!profile.timeConstraints.canRelocate) {
      const requiresRelocation = path.milestones.some(m =>
        m.name.toLowerCase().includes('relocation') ||
        m.name.toLowerCase().includes('move')
      );
      if (requiresRelocation) {
        constraints.push('requires relocation which you indicated is not possible');
      }
    }

    if (constraints.length === 0) {
      explanation += 'This path does not conflict with your stated constraints.';
    } else {
      explanation += `Note: This path ${constraints.join(' and ')}. `;

      if (profile.financialConstraints.canTakeLoan &&
          path.totalCost > profile.financialConstraints.maxInvestment) {
        explanation += 'Education loans may help bridge the financial gap. ';
      }
    }

    return explanation;
  }

  /**
   * Generate recommendation rationale
   */
  private generateRecommendationRationale(
    path: CareerPath,
    input: CareerPathIntelligenceInput
  ): string {
    let rationale = '';

    const reasons: string[] = [];

    // Path type preference
    if (input.studentProfile.preferredPathTypes.includes(path.type)) {
      reasons.push(`matches your preference for ${path.type.toLowerCase().replace('_', ' ')} paths`);
    }

    // Budget fit
    if (path.totalCost <= input.studentProfile.financialConstraints.maxInvestment) {
      reasons.push('fits within your budget');
    }

    // Timeline fit
    if (path.duration <= input.studentProfile.timeConstraints.maxDuration) {
      reasons.push('completes within your timeline');
    }

    // Risk alignment
    if (input.studentProfile.riskTolerance === 'LOW' && getRiskScore(path.riskLevel) < 0.4) {
      reasons.push('aligns with your risk-averse approach');
    }

    // Confidence
    if (path.confidence > 0.7) {
      reasons.push('high confidence based on your profile');
    }

    // Optionality
    if (path.optionalityScore > 0.7) {
      reasons.push('offers excellent future flexibility');
    }

    if (reasons.length === 0) {
      rationale += 'This path is available given your profile, though it may require tradeoffs.';
    } else {
      rationale += 'This path is recommended because it ';
      rationale += reasons.join(', ');
      rationale += '.';
    }

    return rationale;
  }

  /**
   * Format path type for display
   */
  private formatPathType(type: PathType): string {
    return type.replace(/_/g, ' ');
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<PathExplanationEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Helper function to get risk score
 */
function getRiskScore(risk: PathRisk): number {
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
 * Factory function
 */
export function createPathExplanationEngine(
  config?: Partial<PathExplanationEngineConfig>
): PathExplanationEngine {
  return new PathExplanationEngine(config);
}
