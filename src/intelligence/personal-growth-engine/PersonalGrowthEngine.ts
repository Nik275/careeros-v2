/**
 * Personal Growth Engine
 *
 * Tracks development potential across five core dimensions.
 *
 * Purpose:
 *   - Model Skill Growth
 *   - Model Confidence Growth
 *   - Model Leadership Growth
 *   - Model Communication Growth
 *   - Model Decision Quality Growth
 *
 * Generates:
 *   - GrowthTrajectory
 *   - Current State
 *   - Potential State
 *   - Growth Gap
 *
 * Design Principles:
 *   - Deterministic analysis
 *   - Explainable outputs
 *   - Strong typing
 *   - Compatible with StudentBeliefV3
 *
 * Example Usage:
 *   const engine = new PersonalGrowthEngine();
 *
 *   const result = engine.analyze({
 *     studentId: 'student-123',
 *     belief: currentBeliefSnapshot,
 *     beliefHistory: previousBeliefs,
 *   });
 *
 *   console.log(result.currentState.overallLevel);
 *   console.log(result.potential.overallAchievable);
 *   console.log(result.gapAnalysis.largestGap);
 *   console.log(result.trajectory.overallShape);
 *
 *   // View insights
 *   for (const insight of result.insights) {
 *     console.log(`${insight.type}: ${insight.description}`);
 *   }
 */

import type {
  EntityId,
  StudentBeliefV3,
} from '../types/index.js';

import type {
  GrowthDimension,
  GrowthState,
  CurrentGrowthState,
  PotentialState,
  GrowthPotential,
  GrowthGap,
  GrowthGapAnalysis,
  GrowthTrajectory,
  GrowthInsight,
  GrowthRecommendation,
  PersonalGrowthInput,
  PersonalGrowthOptions,
  PersonalGrowthAnalysis,
  PersonalGrowthConfig,
} from './types.js';

import {
  GROWTH_DIMENSIONS,
  DIMENSION_DISPLAY_NAMES,
  DEFAULT_PERSONAL_GROWTH_CONFIG,
} from './types.js';

import {
  assessCurrentState,
  assessPotential,
  analyzeGaps,
  generateTrajectory,
  generateInsights,
  generateRecommendations,
} from './analysis.js';

// ============================================================================
// PERSONAL GROWTH ENGINE
// ============================================================================

/**
 * Engine for tracking personal development potential.
 */
export class PersonalGrowthEngine {
  private config: PersonalGrowthConfig;
  private analyses: Map<EntityId, PersonalGrowthAnalysis> = new Map();

  constructor(config: Partial<PersonalGrowthConfig> = {}) {
    this.config = { ...DEFAULT_PERSONAL_GROWTH_CONFIG, ...config };
  }

  /**
   * Get current configuration.
   */
  getConfig(): PersonalGrowthConfig {
    return { ...this.config };
  }

  /**
   * Update configuration.
   */
  updateConfig(config: Partial<PersonalGrowthConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // ========================================================================
  // MAIN API: ANALYZE
  // ========================================================================

  /**
   * Perform comprehensive growth analysis.
   *
   * This is the primary API for the engine.
   */
  analyze(input: PersonalGrowthInput): PersonalGrowthAnalysis {
    const startedAt = Date.now();
    const options = { ...this.config, ...input.options };

    // Assess current state
    const currentState = assessCurrentState(
      input.studentId,
      input.belief,
      this.config
    );

    // Assess potential
    const potential = assessPotential(
      input.studentId,
      currentState,
      input.belief,
      this.config
    );

    // Analyze gaps
    const gapAnalysis = analyzeGaps(
      input.studentId,
      currentState,
      potential,
      this.config
    );

    // Generate trajectory
    const trajectory = options.generateTrajectory !== false
      ? generateTrajectory(
          input.studentId,
          currentState,
          potential,
          input.beliefHistory ?? [],
          this.config
        )
      : this.createEmptyTrajectory(input.studentId);

    // Generate insights
    const insights = generateInsights(currentState, potential, gapAnalysis, trajectory);

    // Generate recommendations
    const recommendations = options.generateRecommendations !== false
      ? generateRecommendations(gapAnalysis, potential, currentState, insights)
      : [];

    const analysis: PersonalGrowthAnalysis = {
      id: `analysis_${input.studentId}_${startedAt}`,
      studentId: input.studentId,
      generatedAt: startedAt,
      currentState,
      potential,
      gapAnalysis,
      trajectory,
      insights,
      recommendations,
    };

    // Store analysis
    this.analyses.set(input.studentId, analysis);

    return analysis;
  }

  /**
   * Quick growth analysis with defaults.
   */
  quickAnalyze(studentId: EntityId, belief: StudentBeliefV3): PersonalGrowthAnalysis {
    return this.analyze({ studentId, belief });
  }

  // ========================================================================
  // STATE QUERIES
  // ========================================================================

  /**
   * Get current state for a student.
   */
  getCurrentState(studentId: EntityId): CurrentGrowthState | undefined {
    return this.analyses.get(studentId)?.currentState;
  }

  /**
   * Get potential for a student.
   */
  getPotential(studentId: EntityId): GrowthPotential | undefined {
    return this.analyses.get(studentId)?.potential;
  }

  /**
   * Get gap analysis for a student.
   */
  getGapAnalysis(studentId: EntityId): GrowthGapAnalysis | undefined {
    return this.analyses.get(studentId)?.gapAnalysis;
  }

  /**
   * Get trajectory for a student.
   */
  getTrajectory(studentId: EntityId): GrowthTrajectory | undefined {
    return this.analyses.get(studentId)?.trajectory;
  }

  /**
   * Get dimension state.
   */
  getDimensionState(studentId: EntityId, dimension: GrowthDimension): GrowthState | undefined {
    return this.analyses.get(studentId)?.currentState.dimensions[dimension];
  }

  /**
   * Get dimension potential.
   */
  getDimensionPotential(studentId: EntityId, dimension: GrowthDimension): PotentialState | undefined {
    return this.analyses.get(studentId)?.potential.dimensions[dimension];
  }

  /**
   * Get dimension gap.
   */
  getDimensionGap(studentId: EntityId, dimension: GrowthDimension): GrowthGap | undefined {
    return this.analyses.get(studentId)?.gapAnalysis.dimensions[dimension];
  }

  // ========================================================================
  // COMPARISON METHODS
  // ========================================================================

  /**
   * Compare growth states between two time points.
   */
  compareStates(
    studentId: EntityId,
    earlier: number,
    later: number
  ): {
    dimension: GrowthDimension;
    change: number;
    growthRate: number;
    improved: boolean;
  }[] {
    const analysis = this.analyses.get(studentId);
    if (!analysis) return [];

    // This would need historical data - simplified implementation
    return GROWTH_DIMENSIONS.map(dim => {
      const state = analysis.currentState.dimensions[dim];
      const potential = analysis.potential.dimensions[dim];
      const change = potential.achievableLevel - state.currentLevel;

      return {
        dimension: dim,
        change,
        growthRate: state.growthRate,
        improved: change > 0,
      };
    });
  }

  /**
   * Get growth velocity (rate of improvement).
   */
  getGrowthVelocity(studentId: EntityId): {
    dimension: GrowthDimension;
    velocity: number;
    rank: number;
  }[] {
    const analysis = this.analyses.get(studentId);
    if (!analysis) return [];

    const velocities = GROWTH_DIMENSIONS.map(dim => ({
      dimension: dim,
      velocity: analysis.currentState.dimensions[dim].growthRate,
    }));

    // Sort by velocity descending
    velocities.sort((a, b) => b.velocity - a.velocity);

    // Add ranks
    return velocities.map((v, i) => ({
      ...v,
      rank: i + 1,
    }));
  }

  // ========================================================================
  // REPORTING
  // ========================================================================

  /**
   * Generate human-readable report.
   */
  generateReport(analysis: PersonalGrowthAnalysis): string {
    const { currentState, potential, gapAnalysis, trajectory, insights, recommendations } = analysis;
    const lines: string[] = [];

    lines.push('=== Personal Growth Report ===');
    lines.push('');

    lines.push(`Student: ${analysis.studentId}`);
    lines.push(`Generated: ${new Date(analysis.generatedAt).toISOString()}`);
    lines.push('');

    // Current State
    lines.push('Current Growth State:');
    lines.push(`  Overall Level: ${(currentState.overallLevel * 100).toFixed(0)}%`);
    lines.push(`  Strongest: ${DIMENSION_DISPLAY_NAMES[currentState.strongestDimension]}`);
    lines.push(`  Priority: ${DIMENSION_DISPLAY_NAMES[currentState.priorityDimension]}`);
    lines.push('');

    lines.push('Dimension Breakdown:');
    for (const [dim, state] of Object.entries(currentState.dimensions)) {
      const dimKey = dim as GrowthDimension;
      lines.push(`  ${DIMENSION_DISPLAY_NAMES[dimKey]}: ${(state.currentLevel * 100).toFixed(0)}% (growth: ${(state.growthRate * 100).toFixed(1)}%/mo)`);
    }
    lines.push('');

    // Potential
    lines.push('Growth Potential:');
    lines.push(`  Overall Achievable: ${(potential.overallAchievable * 100).toFixed(0)}%`);
    lines.push(`  Highest Potential: ${DIMENSION_DISPLAY_NAMES[potential.highestPotentialDimension]}`);
    lines.push(`  Easiest Improvement: ${DIMENSION_DISPLAY_NAMES[potential.easiestImprovement]}`);
    lines.push('');

    lines.push('Potential by Dimension:');
    for (const [dim, pot] of Object.entries(potential.dimensions)) {
      const dimKey = dim as GrowthDimension;
      const current = currentState.dimensions[dimKey].currentLevel;
      lines.push(`  ${DIMENSION_DISPLAY_NAMES[dimKey]}: ${(current * 100).toFixed(0)}% -> ${(pot.achievableLevel * 100).toFixed(0)}% (${pot.timeToAchievable} months)`);
    }
    lines.push('');

    // Gaps
    lines.push('Growth Gaps:');
    lines.push(`  Overall Gap: ${(gapAnalysis.overallGap * 100).toFixed(0)}%`);
    lines.push(`  Largest Gap: ${DIMENSION_DISPLAY_NAMES[gapAnalysis.largestGap]}`);
    lines.push(`  Most Urgent: ${DIMENSION_DISPLAY_NAMES[gapAnalysis.mostUrgent]}`);
    lines.push('');

    lines.push('Gap Details:');
    for (const [dim, gap] of Object.entries(gapAnalysis.dimensions)) {
      const dimKey = dim as GrowthDimension;
      const urgencyIcon = gap.significance === 'critical' ? '!!!' : gap.significance === 'significant' ? '!!' : '';
      lines.push(`  ${urgencyIcon} ${DIMENSION_DISPLAY_NAMES[dimKey]}: ${(gap.relativeGap * 100).toFixed(0)}% gap (${gap.significance})`);
    }
    lines.push('');

    // Trajectory
    lines.push(`Growth Trajectory: ${trajectory.overallShape}`);
    lines.push(`  Forecast Horizon: ${trajectory.horizonMonths} months`);
    lines.push(`  Confidence: ${(trajectory.confidence * 100).toFixed(0)}%`);
    lines.push('');

    // Insights
    if (insights.length > 0) {
      lines.push(`Insights (${insights.length}):`);
      for (const insight of insights) {
        const urgencyIcon = insight.urgency === 'immediate' ? '[!]' : insight.urgency === 'near-term' ? '[~]' : '[-]';
        lines.push(`  ${urgencyIcon} ${insight.description}`);
      }
      lines.push('');
    }

    // Recommendations
    if (recommendations.length > 0) {
      lines.push(`Recommendations (${recommendations.length}):`);
      for (const rec of recommendations) {
        const priorityIcon = rec.priority === 'critical' ? '[CRITICAL]' : rec.priority === 'high' ? '[HIGH]' : '[MED]';
        lines.push(`  ${priorityIcon} ${rec.recommendation}`);
        lines.push(`      Expected impact: ${(rec.expectedImpact * 100).toFixed(0)}% in ${rec.timeToResults} weeks`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Export analysis as JSON.
   */
  exportJSON(analysis: PersonalGrowthAnalysis): string {
    return JSON.stringify(analysis, null, 2);
  }

  // ========================================================================
  // STORAGE
  // ========================================================================

  /**
   * Store analysis for a student.
   */
  storeAnalysis(analysis: PersonalGrowthAnalysis): void {
    this.analyses.set(analysis.studentId, analysis);
  }

  /**
   * Get stored analysis.
   */
  getAnalysis(studentId: EntityId): PersonalGrowthAnalysis | undefined {
    return this.analyses.get(studentId);
  }

  /**
   * Get all stored analyses.
   */
  getAllAnalyses(): PersonalGrowthAnalysis[] {
    return Array.from(this.analyses.values());
  }

  /**
   * Clear stored analysis.
   */
  clearAnalysis(studentId: EntityId): void {
    this.analyses.delete(studentId);
  }

  // ========================================================================
  // HELPERS
  // ========================================================================

  /**
   * Create empty trajectory placeholder.
   */
  private createEmptyTrajectory(studentId: EntityId): GrowthTrajectory {
    const generatedAt = Date.now();

    return {
      id: `trajectory_${studentId}_${generatedAt}`,
      studentId,
      generatedAt,
      horizonMonths: 0,
      dimensions: {} as Record<GrowthDimension, import('./types.js').DimensionTrajectory>,
      overallShape: 'steady',
      confidence: 0,
      assumptions: ['Trajectory generation disabled'],
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a new PersonalGrowthEngine instance.
 */
export function createPersonalGrowthEngine(
  config?: Partial<PersonalGrowthConfig>
): PersonalGrowthEngine {
  return new PersonalGrowthEngine(config);
}

/**
 * Quick growth analysis with default settings.
 */
export function quickGrowthAnalysis(
  studentId: EntityId,
  belief: StudentBeliefV3
): PersonalGrowthAnalysis {
  const engine = new PersonalGrowthEngine();
  return engine.quickAnalyze(studentId, belief);
}

/**
 * Get display name for growth dimension.
 */
export function getDimensionDisplayName(dimension: GrowthDimension): string {
  return DIMENSION_DISPLAY_NAMES[dimension] || dimension;
}

/**
 * Get all growth dimensions.
 */
export function getGrowthDimensions(): GrowthDimension[] {
  return [...GROWTH_DIMENSIONS];
}
