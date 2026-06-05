/**
 * CareerOS Career Fit Engine - Fit Breakdown Engine
 *
 * Phase C.3: Career Fit Engine
 *
 * Analyzes fit breakdown and identifies strengths and concerns.
 *
 * @module fit-breakdown-engine
 * @version 1.0.0
 */

import type { CareerFitResult, FitStrength, FitConcern, FitBreakdown } from './career-fit-types';

/**
 * Analyzes fit breakdown to identify strengths and concerns.
 *
 * Provides detailed analysis of why a fit is strong or weak.
 */
export class FitBreakdownEngine {
  /**
   * Analyze a fit result and populate strengths and concerns.
   */
  analyzeFitResult(fitResult: CareerFitResult): CareerFitResult {
    const strengths = this.identifyStrengths(fitResult.breakdown);
    const concerns = this.identifyConcerns(fitResult.breakdown);

    return {
      ...fitResult,
      strengths,
      concerns,
    };
  }

  /**
   * Identify fit strengths from breakdown.
   */
  private identifyStrengths(breakdown: FitBreakdown): FitStrength[] {
    const strengths: FitStrength[] = [];

    // Cognitive strengths
    if (breakdown.cognitive.analyticalFit.score >= 80) {
      strengths.push({
        category: 'COGNITIVE',
        dimension: 'analytical',
        description: 'Strong analytical thinking alignment with career demands',
        score: breakdown.cognitive.analyticalFit.score,
        impact: 'MAJOR',
      });
    }
    if (breakdown.cognitive.creativeFit.score >= 80) {
      strengths.push({
        category: 'COGNITIVE',
        dimension: 'creative',
        description: 'Creative abilities well-matched to career requirements',
        score: breakdown.cognitive.creativeFit.score,
        impact: 'MAJOR',
      });
    }
    if (breakdown.cognitive.score >= 75) {
      strengths.push({
        category: 'COGNITIVE',
        dimension: 'overall',
        description: 'Overall cognitive profile strongly matches career cognitive demands',
        score: breakdown.cognitive.score,
        impact: 'MAJOR',
      });
    }

    // Motivation strengths
    if (breakdown.motivation.achievementFit.score >= 80) {
      strengths.push({
        category: 'MOTIVATION',
        dimension: 'achievement',
        description: 'Achievement drive aligns well with career demands',
        score: breakdown.motivation.achievementFit.score,
        impact: 'MAJOR',
      });
    }
    if (breakdown.motivation.impactFit.score >= 80) {
      strengths.push({
        category: 'MOTIVATION',
        dimension: 'impact',
        description: 'Desire for meaningful work matches career opportunities',
        score: breakdown.motivation.impactFit.score,
        impact: 'MODERATE',
      });
    }
    if (breakdown.motivation.score >= 75) {
      strengths.push({
        category: 'MOTIVATION',
        dimension: 'overall',
        description: 'Motivational profile strongly aligned with career',
        score: breakdown.motivation.score,
        impact: 'MAJOR',
      });
    }

    // Lifestyle strengths
    if (breakdown.lifestyle.workLifeBalanceFit.score >= 80) {
      strengths.push({
        category: 'LIFESTYLE',
        dimension: 'workLifeBalance',
        description: 'Work-life balance preferences align with career reality',
        score: breakdown.lifestyle.workLifeBalanceFit.score,
        impact: 'MAJOR',
      });
    }
    if (breakdown.lifestyle.incomeFit.score >= 80) {
      strengths.push({
        category: 'LIFESTYLE',
        dimension: 'income',
        description: 'Income aspirations match career earning potential',
        score: breakdown.lifestyle.incomeFit.score,
        impact: 'MODERATE',
      });
    }

    // Risk strengths
    if (breakdown.risk.score >= 80) {
      strengths.push({
        category: 'RISK',
        dimension: 'overall',
        description: 'Risk tolerance well-aligned with career risk profile',
        score: breakdown.risk.score,
        impact: 'MODERATE',
      });
    }

    // Environment strengths
    if (breakdown.workEnvironment.peopleFit.score >= 80) {
      strengths.push({
        category: 'ENVIRONMENT',
        dimension: 'peopleOrientation',
        description: 'Social preferences match work environment',
        score: breakdown.workEnvironment.peopleFit.score,
        impact: 'MODERATE',
      });
    }
    if (breakdown.workEnvironment.independenceFit.score >= 80) {
      strengths.push({
        category: 'ENVIRONMENT',
        dimension: 'independence',
        description: 'Autonomy needs align with career independence levels',
        score: breakdown.workEnvironment.independenceFit.score,
        impact: 'MODERATE',
      });
    }

    // Values strengths
    if (breakdown.values.impactFit.score >= 80) {
      strengths.push({
        category: 'VALUES',
        dimension: 'impact',
        description: 'Values around making a difference align with career',
        score: breakdown.values.impactFit.score,
        impact: 'MAJOR',
      });
    }
    if (breakdown.values.learningFit.score >= 80) {
      strengths.push({
        category: 'VALUES',
        dimension: 'learning',
        description: 'Learning values match career development opportunities',
        score: breakdown.values.learningFit.score,
        impact: 'MODERATE',
      });
    }

    // Sort by impact then score
    return strengths.sort((a, b) => {
      const impactOrder = { MAJOR: 3, MODERATE: 2, MINOR: 1 };
      if (impactOrder[a.impact] !== impactOrder[b.impact]) {
        return impactOrder[b.impact] - impactOrder[a.impact];
      }
      return b.score - a.score;
    });
  }

  /**
   * Identify fit concerns from breakdown.
   */
  private identifyConcerns(breakdown: FitBreakdown): FitConcern[] {
    const concerns: FitConcern[] = [];

    // Cognitive concerns
    if (breakdown.cognitive.analyticalFit.score <= 40) {
      concerns.push({
        category: 'COGNITIVE',
        dimension: 'analytical',
        description: 'Analytical thinking demand exceeds student capability',
        severity: 'HIGH',
        isAddressable: true,
        suggestion: 'Develop analytical skills through coursework and practice',
      });
    }
    if (breakdown.cognitive.creativeFit.score <= 40) {
      concerns.push({
        category: 'COGNITIVE',
        dimension: 'creative',
        description: 'Creative demands may be challenging',
        severity: 'MEDIUM',
        isAddressable: true,
        suggestion: 'Engage in creative problem-solving activities',
      });
    }
    if (breakdown.cognitive.gaps.length > 0) {
      const highImpactGaps = breakdown.cognitive.gaps.filter((g) => g.impact === 'HIGH');
      if (highImpactGaps.length > 0) {
        concerns.push({
          category: 'COGNITIVE',
          dimension: 'gaps',
          description: `Significant cognitive gaps: ${highImpactGaps.map((g) => g.dimension).join(', ')}`,
          severity: 'HIGH',
          isAddressable: true,
          suggestion: 'Focus on developing key cognitive skills before pursuing this career',
        });
      }
    }

    // Motivation concerns
    if (breakdown.motivation.conflicts.length > 0) {
      const highSeverityConflicts = breakdown.motivation.conflicts.filter(
        (c) => c.severity === 'HIGH'
      );
      for (const conflict of highSeverityConflicts.slice(0, 2)) {
        concerns.push({
          category: 'MOTIVATION',
          dimension: conflict.dimension,
          description: conflict.description,
          severity: 'HIGH',
          isAddressable: false,
          suggestion: 'Consider whether this motivation mismatch is acceptable',
        });
      }
    }
    if (breakdown.motivation.score <= 40) {
      concerns.push({
        category: 'MOTIVATION',
        dimension: 'overall',
        description: 'Overall motivational profile poorly aligned with career demands',
        severity: 'HIGH',
        isAddressable: false,
      });
    }

    // Lifestyle concerns
    if (breakdown.lifestyle.dealbreakers.length > 0) {
      for (const dealbreaker of breakdown.lifestyle.dealbreakers) {
        concerns.push({
          category: 'LIFESTYLE',
          dimension: dealbreaker.dimension,
          description: `${dealbreaker.studentPreference} vs ${dealbreaker.careerReality}`,
          severity: dealbreaker.severity === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
          isAddressable: dealbreaker.severity !== 'CRITICAL',
          suggestion: dealbreaker.severity === 'CRITICAL' ? 'Consider alternative careers' : 'May require lifestyle adjustment',
        });
      }
    }
    if (breakdown.lifestyle.workLifeBalanceFit.score <= 35) {
      concerns.push({
        category: 'LIFESTYLE',
        dimension: 'workLifeBalance',
        description: 'Work-life balance preferences significantly misaligned',
        severity: 'HIGH',
        isAddressable: false,
        suggestion: 'Evaluate if career demands are acceptable',
      });
    }

    // Risk concerns
    if (breakdown.risk.concerns.length > 0) {
      for (const risk of breakdown.risk.concerns.slice(0, 2)) {
        concerns.push({
          category: 'RISK',
          dimension: risk.riskType,
          description: risk.description,
          severity: risk.level,
          isAddressable: risk.level !== 'HIGH',
          suggestion: risk.level === 'HIGH' ? 'Consider risk mitigation strategies' : 'Monitor risk factors',
        });
      }
    }

    // Environment concerns
    if (breakdown.workEnvironment.peopleFit.score <= 40) {
      concerns.push({
        category: 'ENVIRONMENT',
        dimension: 'peopleOrientation',
        description: 'Social interaction demands may be draining',
        severity: 'MEDIUM',
        isAddressable: true,
        suggestion: 'Develop strategies for managing social demands',
      });
    }
    if (breakdown.workEnvironment.independenceFit.score <= 40) {
      concerns.push({
        category: 'ENVIRONMENT',
        dimension: 'independence',
        description: 'Independence levels may not match preferences',
        severity: 'MEDIUM',
        isAddressable: false,
      });
    }

    // Values concerns
    if (breakdown.values.alignment.misaligned.length >= 3) {
      concerns.push({
        category: 'VALUES',
        dimension: 'alignment',
        description: `Multiple values misaligned: ${breakdown.values.alignment.misaligned.join(', ')}`,
        severity: 'HIGH',
        isAddressable: false,
        suggestion: 'Evaluate core values alignment carefully',
      });
    }
    if (breakdown.values.alignment.satisfactionPotential === 'LOW') {
      concerns.push({
        category: 'VALUES',
        dimension: 'satisfaction',
        description: 'Low potential for values satisfaction in this career',
        severity: 'HIGH',
        isAddressable: false,
      });
    }

    // Sort by severity
    const severityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    return concerns.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);
  }

  /**
   * Get the strongest dimension.
   */
  getStrongestDimension(breakdown: FitBreakdown): { name: string; score: number } {
    const dimensions = [
      { name: 'Cognitive', score: breakdown.cognitive.score },
      { name: 'Motivation', score: breakdown.motivation.score },
      { name: 'Lifestyle', score: breakdown.lifestyle.score },
      { name: 'Risk', score: breakdown.risk.score },
      { name: 'Work Environment', score: breakdown.workEnvironment.score },
      { name: 'Values', score: breakdown.values.score },
    ];

    return dimensions.reduce((best, current) =>
      current.score > best.score ? current : best
    );
  }

  /**
   * Get the weakest dimension.
   */
  getWeakestDimension(breakdown: FitBreakdown): { name: string; score: number } {
    const dimensions = [
      { name: 'Cognitive', score: breakdown.cognitive.score },
      { name: 'Motivation', score: breakdown.motivation.score },
      { name: 'Lifestyle', score: breakdown.lifestyle.score },
      { name: 'Risk', score: breakdown.risk.score },
      { name: 'Work Environment', score: breakdown.workEnvironment.score },
      { name: 'Values', score: breakdown.values.score },
    ];

    return dimensions.reduce((worst, current) =>
      current.score < worst.score ? current : worst
    );
  }

  /**
   * Count critical concerns.
   */
  countCriticalConcerns(concerns: FitConcern[]): number {
    return concerns.filter((c) => c.severity === 'HIGH').length;
  }

  /**
   * Count major strengths.
   */
  countMajorStrengths(strengths: FitStrength[]): number {
    return strengths.filter((s) => s.impact === 'MAJOR').length;
  }
}

/**
 * Factory function for FitBreakdownEngine.
 */
export function createFitBreakdownEngine(): FitBreakdownEngine {
  return new FitBreakdownEngine();
}
