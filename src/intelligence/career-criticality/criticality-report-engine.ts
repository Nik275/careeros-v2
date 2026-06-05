/**
 * Criticality Report Engine
 *
 * Phase 8.6: Career Criticality Engine - Part 5
 *
 * Generates comprehensive criticality reports with human-readable explanations.
 * Creates student-friendly and mentor-appropriate content.
 *
 * @module criticality-report-engine
 * @version 1.0.0
 */

import {
  CriticalityAnalysis,
  CriticalityInput,
  CriticalityReport,
  CriticalityRecommendation,
  CriticalityBand,
} from './criticality-types';

import {
  CriticalityEngine,
  createCriticalityEngine,
} from './criticality-engine';

// ============================================================================
// REPORT TEMPLATES
// ============================================================================

/**
 * Templates for human-readable explanations
 */
const BAND_EXPLANATIONS: Record<CriticalityBand, {
  summary: string;
  studentExplanation: string;
  mentorTalkingPoints: string[];
}> = {
  'VERY_LOW': {
    summary: 'This decision has minimal long-term impact on your career trajectory.',
    studentExplanation: `This is a relatively low-stakes decision. While it's worth making a thoughtful choice, you have plenty of flexibility to adjust course later. Don't let this decision cause excessive stress - your future options remain wide open.`,
    mentorTalkingPoints: [
      'Emphasize the exploratory nature of this decision',
      'Encourage experimentation and learning',
      'Reassure that course corrections are easy',
    ],
  },
  'LOW': {
    summary: 'This decision has limited constraints on your future options.',
    studentExplanation: `This decision matters, but it won't lock you into a single path. You'll maintain good flexibility to change direction if you discover new interests. Focus on what feels right now, knowing you can adapt later.`,
    mentorTalkingPoints: [
      'Acknowledge the decision while maintaining perspective',
      'Discuss transferable skills that will be gained',
      'Emphasize the value of the learning experience',
    ],
  },
  'MODERATE': {
    summary: 'This decision moderately constrains future pathways.',
    studentExplanation: `This decision will shape your options in meaningful ways. It's not irreversible, but changing course later will require some effort. Take time to understand what you're gaining and what paths you're moving away from.`,
    mentorTalkingPoints: [
      'Help them understand the tradeoffs clearly',
      'Discuss both the opportunities gained and lost',
      'Explore strategies to maintain flexibility',
    ],
  },
  'HIGH': {
    summary: 'This decision significantly impacts future career pathways.',
    studentExplanation: `This is a significant decision that will meaningfully shape your future. The path you choose will influence your opportunities for years to come. While not impossible to change later, it would require considerable effort. Give this careful thought.`,
    mentorTalkingPoints: [
      'Take time to thoroughly explore all options',
      'Discuss the long-term implications honestly',
      'Help them understand their risk tolerance',
      'Consider a trial period or pilot if possible',
    ],
  },
  'VERY_HIGH': {
    summary: 'This decision has profound implications for future flexibility.',
    studentExplanation: `This is a major life decision with deep and lasting implications. The choice you make will significantly shape your career trajectory and future options. This doesn't mean there's a single "right" answer, but it does mean you should understand what you're committing to. Take your time with this.`,
    mentorTalkingPoints: [
      'This decision deserves deep reflection and research',
      'Encourage conversations with people who made similar choices',
      'Discuss what would make the decision reversible if needed',
      'Explore their true motivations and concerns',
    ],
  },
  'CRITICAL': {
    summary: 'This is a life-defining decision with near-irreversible consequences.',
    studentExplanation: `This is one of the most consequential decisions you'll make. The path you choose will profoundly shape your life and career. This is not meant to scare you, but to help you understand the weight of this moment. Take all the time you need, seek advice from those who've walked these paths, and listen to your deepest instincts.`,
    mentorTalkingPoints: [
      'This is a decision that requires extensive deliberation',
      'Encourage seeking multiple perspectives from trusted advisors',
      'Discuss how to build in flexibility even within commitment',
      'Help them connect with their core values and long-term vision',
      'Consider professional guidance if appropriate',
    ],
  },
};

// ============================================================================
// CRITICALITY REPORT ENGINE
// ============================================================================

/**
 * Engine for generating criticality reports
 */
export class CriticalityReportEngine {
  private criticalityEngine: CriticalityEngine;

  constructor() {
    this.criticalityEngine = createCriticalityEngine();
  }

  /**
   * Generate a comprehensive criticality report
   */
  generateReport(input: CriticalityInput): CriticalityReport {
    const analysis = this.criticalityEngine.analyzeCriticality(input);
    const templates = BAND_EXPLANATIONS[analysis.criticalityBand];

    return {
      id: `report-${Date.now()}`,
      analysis,
      summary: this.generateSummary(analysis, input),
      studentExplanation: this.generateStudentExplanation(analysis, templates.studentExplanation),
      mentorTalkingPoints: this.generateMentorTalkingPoints(analysis, templates.mentorTalkingPoints),
      recommendations: this.generateRecommendations(analysis, input),
      riskFactors: this.identifyRiskFactors(analysis),
      mitigationStrategies: this.generateMitigationStrategies(analysis),
      generatedAt: new Date(),
    };
  }

  /**
   * Generate summary text
   */
  private generateSummary(analysis: CriticalityAnalysis, input: CriticalityInput): string {
    const option = input.options[0];
    const templates = BAND_EXPLANATIONS[analysis.criticalityBand];

    let summary = `Decision Analysis: ${option.name}\n\n`;
    summary += `Criticality Level: ${analysis.criticalityBand.replace('_', ' ')}\n`;
    summary += `Criticality Score: ${analysis.criticalityScore}/100\n\n`;
    summary += `${templates.summary}\n\n`;

    summary += `Path Dependency: ${Math.round(analysis.pathDependency.dependencyScore * 100)}% - `;
    summary += `${analysis.pathDependency.futureConstraintLevel} constraint level\n`;

    summary += `Option Closure: ${analysis.optionClosure.doorsOpened} paths opened, `;
    summary += `${analysis.optionClosure.doorsClosed} paths closed\n`;

    summary += `Future Flexibility: ${analysis.futureFlexibility.futureFlexibilityScore}%\n`;
    summary += `Decision Weight: ${analysis.decisionWeight.replace('_', ' ')}\n`;

    return summary;
  }

  /**
   * Generate student-friendly explanation
   */
  private generateStudentExplanation(
    analysis: CriticalityAnalysis,
    baseExplanation: string
  ): string {
    let explanation = baseExplanation + '\n\n';

    // Add specific context
    if (analysis.optionClosure.doorsClosed > analysis.optionClosure.doorsOpened) {
      explanation += `This path will close more doors than it opens `;
      explanation += `(${analysis.optionClosure.doorsClosed} vs ${analysis.optionClosure.doorsOpened}). `;
      explanation += `Make sure the remaining path aligns deeply with your interests.\n\n`;
    } else if (analysis.optionClosure.doorsOpened > analysis.optionClosure.doorsClosed) {
      explanation += `This path opens more opportunities than it closes `;
      explanation += `(${analysis.optionClosure.doorsOpened} vs ${analysis.optionClosure.doorsClosed}). `;
      explanation += `This suggests a net positive for future options.\n\n`;
    }

    // Add flexibility context
    if (analysis.futureFlexibility.futureFlexibilityScore < 40) {
      explanation += `Your ability to change direction later will be limited. `;
      explanation += `Think carefully about whether you're ready to commit to this path.\n\n`;
    } else if (analysis.futureFlexibility.futureFlexibilityScore > 70) {
      explanation += `You'll maintain good flexibility to adapt your path later. `;
      explanation += `This gives you room to evolve and grow.\n\n`;
    }

    // Add next steps guidance
    explanation += `What to do next:\n`;
    if (analysis.criticalityScore > 70) {
      explanation += `- Take time to research thoroughly\n`;
      explanation += `- Talk to people who've made similar choices\n`;
      explanation += `- Reflect on your core values\n`;
    } else {
      explanation += `- Make a choice that feels right now\n`;
      explanation += `- Stay open to learning and adjusting\n`;
      explanation += `- Focus on what you can control\n`;
    }

    return explanation;
  }

  /**
   * Generate mentor talking points
   */
  private generateMentorTalkingPoints(
    analysis: CriticalityAnalysis,
    basePoints: string[]
  ): string[] {
    const points = [...basePoints];

    // Add specific talking points based on analysis
    if (analysis.pathDependency.dependencyScore > 0.7) {
      points.push('High path dependency - emphasize the commitment involved');
    }

    if (analysis.optionClosure.pivotDifficulty === 'VERY_HARD') {
      points.push('Pivoting will be very difficult - help them think through contingencies');
    }

    if (analysis.futureFlexibility.futureFlexibilityScore < 30) {
      points.push('Very low future flexibility - explore why they want this path');
    }

    if (analysis.optionClosure.opportunitiesLost.length > 5) {
      points.push(`Many opportunities will be foregone - ensure they understand what they're leaving behind`);
    }

    return points;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    analysis: CriticalityAnalysis,
    input: CriticalityInput
  ): CriticalityRecommendation[] {
    const recommendations: CriticalityRecommendation[] = [];

    // Always include information gathering
    if (analysis.criticalityScore > 40) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Research thoroughly before deciding',
        rationale: 'This decision has significant implications that deserve deep investigation',
        timeframe: '1-2 weeks',
      });
    }

    // Include conversations with others
    if (analysis.criticalityScore > 60) {
      recommendations.push({
        priority: 'HIGH',
        action: `Speak with at least 3 people who've chosen similar paths`,
        rationale: 'Firsthand experience will provide invaluable perspective',
        timeframe: '1-2 weeks',
      });
    }

    // Flexibility preservation
    if (analysis.futureFlexibility.futureFlexibilityScore < 50) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Identify strategies to maintain future flexibility',
        rationale: 'This path limits future options - think about how to preserve adaptability',
        timeframe: 'Before committing',
      });
    }

    // Trial period
    if (analysis.criticalityScore > 70 && ['CAREER_SWITCHING', 'ENTREPRENEURSHIP_DECISION'].includes(analysis.decisionType)) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Consider a trial period or pilot if possible',
        rationale: 'Testing the waters can provide clarity before full commitment',
        timeframe: '3-6 months if feasible',
      });
    }

    // Documentation
    recommendations.push({
      priority: 'LOW',
      action: 'Document your reasoning for this decision',
      rationale: 'Future you will appreciate understanding your present thinking',
      timeframe: 'When you decide',
    });

    return recommendations;
  }

  /**
   * Identify risk factors
   */
  private identifyRiskFactors(analysis: CriticalityAnalysis): string[] {
    const risks: string[] = [];

    if (analysis.pathDependency.dependencyScore > 0.8) {
      risks.push('High path dependency makes future pivots very difficult');
    }

    if (analysis.optionClosure.doorsClosed > analysis.optionClosure.doorsOpened * 2) {
      risks.push('Significant opportunity cost - many paths will be foreclosed');
    }

    if (analysis.optionClosure.pivotDifficulty === 'VERY_HARD') {
      risks.push('Very difficult to pivot away from this path once chosen');
    }

    if (analysis.futureFlexibility.futureFlexibilityScore < 30) {
      risks.push('Extremely limited future flexibility');
    }

    if (analysis.pathDependency.constraintDuration > 7) {
      risks.push(`Long constraint period (${analysis.pathDependency.constraintDuration} years)`);
    }

    if (analysis.optionClosure.recoveryTimeEstimate > 5) {
      risks.push(`Long recovery time (${analysis.optionClosure.recoveryTimeEstimate} years) to regain closed options`);
    }

    if (risks.length === 0) {
      risks.push('No major risk factors identified');
    }

    return risks;
  }

  /**
   * Generate mitigation strategies
   */
  private generateMitigationStrategies(analysis: CriticalityAnalysis): string[] {
    const strategies: string[] = [];

    // Path dependency mitigation
    if (analysis.pathDependency.dependencyScore > 0.6) {
      strategies.push('Build transferable skills alongside specialized ones');
      strategies.push('Maintain connections in adjacent fields');
    }

    // Option closure mitigation
    if (analysis.optionClosure.doorsClosed > 5) {
      strategies.push('Identify which closed options might be partially recoverable');
      strategies.push('Consider hybrid paths that combine multiple interests');
    }

    // Flexibility preservation
    if (analysis.futureFlexibility.futureFlexibilityScore < 50) {
      strategies.push(...analysis.futureFlexibility.preservationStrategies.slice(0, 3));
    }

    // General strategies
    strategies.push('Regularly reassess your path and satisfaction');
    strategies.push('Keep learning about adjacent fields and opportunities');
    strategies.push('Build a financial buffer for future transitions');

    return strategies;
  }

  /**
   * Generate quick report
   */
  generateQuickReport(
    optionName: string,
    decisionType: CriticalityAnalysis['decisionType']
  ): {
    criticalityBand: CriticalityBand;
    summary: string;
    keyRecommendation: string;
  } {
    const check = this.criticalityEngine.quickCriticalityCheck(optionName, decisionType);
    const templates = BAND_EXPLANATIONS[check.criticalityBand];

    return {
      criticalityBand: check.criticalityBand,
      summary: templates.summary,
      keyRecommendation: check.criticalityScore > 60
        ? 'Take time to thoroughly research and consider this decision'
        : 'Make a thoughtful choice knowing you have flexibility to adjust',
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a criticality report engine
 */
export function createCriticalityReportEngine(): CriticalityReportEngine {
  return new CriticalityReportEngine();
}

/**
 * Generate a criticality report
 */
export function generateCriticalityReport(input: CriticalityInput): CriticalityReport {
  const engine = createCriticalityReportEngine();
  return engine.generateReport(input);
}

/**
 * Generate a quick criticality report
 */
export function generateQuickReport(
  optionName: string,
  decisionType: CriticalityAnalysis['decisionType']
): {
  criticalityBand: CriticalityBand;
  summary: string;
  keyRecommendation: string;
} {
  const engine = createCriticalityReportEngine();
  return engine.generateQuickReport(optionName, decisionType);
}
