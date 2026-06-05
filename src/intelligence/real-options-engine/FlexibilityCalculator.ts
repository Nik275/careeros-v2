/**
 * CareerOS Real Options Theory Engine - Flexibility Calculator
 *
 * Evaluates:
 * - Ease of pivoting
 * - Transferable skills
 * - Career mobility
 */

import type {
  CareerId,
  FlexibilityCalculation,
  RealOptionsEngineConfig,
} from './types';

import type {
  OptionalityAnalysis,
} from '../optionality-engine';

import type {
  CareerTransitionEdge,
} from '../career-graph-v2';

/**
 * Calculates flexibility of a career.
 */
export class FlexibilityCalculator {
  private config: RealOptionsEngineConfig;

  constructor(config: RealOptionsEngineConfig) {
    this.config = config;
  }

  /**
   * Main entry point: calculate flexibility.
   */
  calculate(
    careerId: CareerId,
    optionalityAnalysis: OptionalityAnalysis,
    transitionEdges: CareerTransitionEdge[]
  ): FlexibilityCalculation {
    // Calculate pivoting ease
    const pivotingEase = this.calculatePivotingEase(
      careerId,
      transitionEdges
    );

    // Calculate transferable skills
    const transferableSkills = this.calculateTransferableSkills(
      optionalityAnalysis
    );

    // Calculate career mobility
    const careerMobility = this.calculateCareerMobility(
      optionalityAnalysis,
      transitionEdges
    );

    // Calculate time to flexibility
    const timeToFlexibility = this.calculateTimeToFlexibility(
      transitionEdges
    );

    // Calculate total flexibility score
    const flexibilityScore = this.calculateTotalFlexibility(
      pivotingEase,
      transferableSkills,
      careerMobility
    );

    // Generate explanation
    const explanation = this.generateExplanation(
      pivotingEase,
      transferableSkills,
      careerMobility,
      timeToFlexibility
    );

    return {
      careerId,
      flexibilityScore,
      pivotingEase,
      transferableSkills,
      careerMobility,
      timeToFlexibility,
      explanation,
    };
  }

  /**
   * Calculate ease of pivoting to other careers.
   */
  private calculatePivotingEase(
    careerId: CareerId,
    transitionEdges: CareerTransitionEdge[]
  ): FlexibilityCalculation['pivotingEase'] {
    // Find transitions from this career
    const outgoingEdges = transitionEdges.filter(
      (e) => e.sourceCareerId === careerId || e.sourceId === careerId
    );

    if (outgoingEdges.length === 0) {
      return {
        score: 20,
        factors: ['Limited transition data available'],
        barriers: ['No documented transition paths'],
      };
    }

    // Calculate average transition difficulty
    const avgDifficulty =
      outgoingEdges.reduce((sum, e) => sum + e.transitionDifficulty, 0) /
      outgoingEdges.length;

    // Score is inverse of difficulty
    const score = Math.max(0, 100 - avgDifficulty);

    // Identify factors
    const factors: string[] = [];
    const barriers: string[] = [];

    if (score > 70) {
      factors.push('Low average transition difficulty');
    }

    if (outgoingEdges.some((e) => e.transitionTimeMonths < 6)) {
      factors.push('Some quick transition options available');
    }

    if (outgoingEdges.some((e) => e.skillOverlap > 0.6)) {
      factors.push('High skill overlap with adjacent careers');
    }

    if (avgDifficulty > 60) {
      barriers.push('High transition difficulty on average');
    }

    if (outgoingEdges.every((e) => e.transitionTimeMonths > 12)) {
      barriers.push('All transitions require significant time investment');
    }

    return {
      score,
      factors,
      barriers,
    };
  }

  /**
   * Calculate transferable skills.
   */
  private calculateTransferableSkills(
    optionalityAnalysis: OptionalityAnalysis
  ): FlexibilityCalculation['transferableSkills'] {
    // Use optionality engine's transferable skills score
    const transferableSkillsDimension = optionalityAnalysis.dimensions?.find(
      (d) => d.name === 'Transferable Skills'
    );

    const score = transferableSkillsDimension
      ? transferableSkillsDimension.score * 100
      : 50;

    // Extract skill categories
    const skillCategories: FlexibilityCalculation['transferableSkills']['skillCategories'] =
      optionalityAnalysis.skillCategories?.map((cat) => ({
        category: cat.category,
        skills: cat.skills,
        transferability: cat.transferability,
      })) || [];

    // Calculate cross-industry applicability
    const applicableIndustries = new Set<string>();
    optionalityAnalysis.skillCategories?.forEach((cat) => {
      cat.applicableIndustries?.forEach((ind) => applicableIndustries.add(ind));
    });
    const crossIndustryApplicability = Math.min(
      applicableIndustries.size * 10,
      100
    );

    return {
      score,
      skillCategories,
      crossIndustryApplicability,
    };
  }

  /**
   * Calculate career mobility.
   */
  private calculateCareerMobility(
    optionalityAnalysis: OptionalityAnalysis,
    transitionEdges: CareerTransitionEdge[]
  ): FlexibilityCalculation['careerMobility'] {
    // Count adjacent careers
    const adjacentCareers = optionalityAnalysis.adjacentCareers || [];

    // Calculate lateral moves (similar level)
    const lateralMoves = adjacentCareers.filter(
      (c) => c.transitionEase === 'high' || c.transitionEase === 'very-high'
    ).length;

    // Calculate upward mobility
    const upwardMobility = Math.min(
      adjacentCareers.filter((c) => c.skillOverlap > 0.5).length * 10,
      100
    );

    // Calculate cross-domain moves
    const uniqueDomains = new Set(
      adjacentCareers.map((c) => this.inferDomain(c.careerId))
    );
    const crossDomainMoves = uniqueDomains.size;

    // Overall score
    const score = Math.min(
      (lateralMoves * 10 + upwardMobility + crossDomainMoves * 5) / 3,
      100
    );

    return {
      score,
      lateralMoves,
      upwardMobility,
      crossDomainMoves,
    };
  }

  /**
   * Calculate time to flexibility.
   */
  private calculateTimeToFlexibility(
    transitionEdges: CareerTransitionEdge[]
  ): FlexibilityCalculation['timeToFlexibility'] {
    if (transitionEdges.length === 0) {
      return {
        months: 24,
        years: 2,
        phase: 'mid-career',
      };
    }

    // Average transition time
    const avgTimeMonths =
      transitionEdges.reduce((sum, e) => sum + (e.transitionTimeMonths || 12), 0) /
      transitionEdges.length;

    // Determine phase
    let phase: FlexibilityCalculation['timeToFlexibility']['phase'] =
      'mid-career';
    if (avgTimeMonths < 3) {
      phase = 'immediate';
    } else if (avgTimeMonths < 12) {
      phase = 'early-career';
    } else if (avgTimeMonths > 36) {
      phase = 'late-career';
    }

    return {
      months: Math.round(avgTimeMonths),
      years: Math.round(avgTimeMonths / 12 * 10) / 10,
      phase,
    };
  }

  /**
   * Calculate total flexibility score.
   */
  private calculateTotalFlexibility(
    pivotingEase: FlexibilityCalculation['pivotingEase'],
    transferableSkills: FlexibilityCalculation['transferableSkills'],
    careerMobility: FlexibilityCalculation['careerMobility']
  ): number {
    return Math.round(
      pivotingEase.score * this.config.pivotingEaseWeight +
        transferableSkills.score * this.config.transferableSkillsWeight +
        careerMobility.score * this.config.careerMobilityWeight
    );
  }

  /**
   * Generate explanation.
   */
  private generateExplanation(
    pivotingEase: FlexibilityCalculation['pivotingEase'],
    transferableSkills: FlexibilityCalculation['transferableSkills'],
    careerMobility: FlexibilityCalculation['careerMobility'],
    timeToFlexibility: FlexibilityCalculation['timeToFlexibility']
  ): string[] {
    const explanation: string[] = [];

    explanation.push(
      `Pivoting ease: ${pivotingEase.score}% - ${pivotingEase.factors[0] || 'Moderate transition difficulty'}`
    );

    explanation.push(
      `Transferable skills score: ${Math.round(transferableSkills.score)}%`
    );

    if (transferableSkills.crossIndustryApplicability > 70) {
      explanation.push(
        `Skills applicable across ${Math.round(
          transferableSkills.crossIndustryApplicability / 10
        )} industries`
      );
    }

    explanation.push(
      `Career mobility: ${careerMobility.lateralMoves} lateral moves, ${careerMobility.crossDomainMoves} cross-domain options`
    );

    explanation.push(
      `Time to flexibility: ${timeToFlexibility.years} years (${timeToFlexibility.phase})`
    );

    return explanation;
  }

  /**
   * Infer domain from career ID.
   */
  private inferDomain(careerId: string): string {
    if (careerId.includes('software') || careerId.includes('data')) {
      return 'technology';
    }
    if (careerId.includes('medicine') || careerId.includes('health')) {
      return 'healthcare';
    }
    if (careerId.includes('finance') || careerId.includes('bank')) {
      return 'finance';
    }
    if (careerId.includes('design') || careerId.includes('art')) {
      return 'creative';
    }
    return 'general';
  }
}

/**
 * Factory function for FlexibilityCalculator.
 */
export function createFlexibilityCalculator(
  config: RealOptionsEngineConfig
): FlexibilityCalculator {
  return new FlexibilityCalculator(config);
}
