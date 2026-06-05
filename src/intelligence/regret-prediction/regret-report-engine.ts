/**
 * Regret Report Engine
 *
 * Phase 8.7: CareerOS Regret Prediction Engine - Part 9
 *
 * Generates comprehensive regret reports with human-readable explanations.
 * Creates student-friendly content and mentor-appropriate framing.
 *
 * Core philosophy: Present regret analysis thoughtfully, avoiding
 * deterministic predictions while encouraging deeper reflection.
 *
 * @module regret-report-engine
 * @version 1.0.0
 */

import {
  RegretProfile,
  RegretPredictionInput,
  RegretReport,
  RegretInsight,
  MentorFraming,
  RegretCategory,
  RegretRisk,
} from './regret-types';

import {
  RegretPredictionEngine,
  createRegretPredictionEngine,
} from './regret-prediction-engine';

// ============================================================================
// REFLECTION TEMPLATES
// ============================================================================

const RISK_REFLECTIONS: Record<RegretRisk, string> = {
  'MINIMAL': `This decision appears to align well with your authentic interests and values. The risk of future regret seems low, which suggests you're on a path that genuinely reflects who you are.`,
  'LOW': `While no decision is without some uncertainty, this path shows good alignment with your interests. Any regrets that emerge are likely to be minor and manageable.`,
  'MODERATE': `This decision carries some risk of future regret, which is worth considering. It doesn't mean you're making the wrong choice, but rather that there are aspects worth examining more closely.`,
  'HIGH': `This decision shows elevated risk of future regret. This isn't a prediction—it simply means there's a significant gap between your choice and your authentic interests or values that may cause tension over time.`,
  'CRITICAL': `This decision shows substantial risk of future regret. This suggests a significant misalignment between your choice and your authentic self. While not irreversible, it may be worth careful reconsideration.`,
};

const CATEGORY_INSIGHTS: Record<RegretCategory, { insight: string; reflection: string; action: string }> = {
  'EXPLORATION': {
    insight: 'You may wonder about paths you never tried.',
    reflection: 'Think about interests you have set aside. What would you explore if you knew you could not fail?',
    action: 'Identify one small way to explore a suppressed interest before fully committing to your current path.',
  },
  'IDENTITY': {
    insight: 'You may feel you never fully expressed who you are.',
    reflection: 'Consider which parts of yourself feel unseen in this choice. What identity are you suppressing?',
    action: 'Find ways to honor your authentic identity, even within your chosen path.',
  },
  'OPPORTUNITY': {
    insight: 'You may think about doors that closed.',
    reflection: 'Consider what you are giving up. Are the opportunities you are forgoing recoverable later?',
    action: 'Identify which foregone opportunities might be pursued in parallel or as a future pivot.',
  },
  'FINANCIAL': {
    insight: 'Financial considerations may become a source of reflection.',
    reflection: 'Are you prioritizing financial security over other values? Is this balance right for you?',
    action: 'Create a financial plan that supports your values, not just your bank account.',
  },
  'LIFESTYLE': {
    insight: 'The day-to-day reality of this path may not match your needs.',
    reflection: 'Imagine your typical day on this path. Does it energize or drain you?',
    action: 'Speak with people living this lifestyle to understand the reality behind the idea.',
  },
  'PURPOSE': {
    insight: 'Questions of meaning may become more pressing over time.',
    reflection: 'Does this path connect to something larger than yourself? What gives your life meaning?',
    action: 'Identify how your current path might serve a purpose you care about.',
  },
  'FEAR_BASED': {
    insight: 'You may reflect on how fear shaped your choices.',
    reflection: 'Ask honestly: what would you choose if you were not afraid? What fear is driving this?',
    action: 'Distinguish between rational caution and irrational fear. Consider small experiments to test your fears.',
  },
  'APPROVAL_BASED': {
    insight: 'You may realize you lived for others expectations.',
    reflection: 'Whose approval are you seeking? Will their opinion matter in 10 or 20 years?',
    action: 'Practice making one small decision based entirely on what you want, not what others expect.',
  },
  'RELATIONSHIP': {
    insight: 'Relationship impacts of your choices may become apparent.',
    reflection: 'How will this path affect your relationships? Who will you spend time with?',
    action: 'Consider the social ecosystem of your chosen path and whether it nourishes you.',
  },
  'GROWTH': {
    insight: 'You may feel limited in your growth and development.',
    reflection: 'Does this path challenge you to grow? Or does it keep you comfortable but stagnant?',
    action: 'Identify growth opportunities within or alongside your chosen path.',
  },
};

// ============================================================================
// MENTOR FRAMING TEMPLATES
// ============================================================================

const MENTOR_OPENINGS: string[] = [
  "I've been thinking about your decision, and I wonder if we might explore something together.",
  "As I listen to your plans, a question keeps coming to mind that I'd love to explore with you.",
  "I've been reflecting on our conversations, and there's something I'd like to gently bring up.",
];

const MENTOR_REFLECTIONS: Record<RegretCategory, string> = {
  'EXPLORATION': "I'm curious about the paths you considered but didn't pursue. Sometimes the biggest risk isn't failure—it's never finding out what might have been.",
  'IDENTITY': "I wonder whether this choice gives you room to be fully yourself. Sometimes the most costly decision is one that requires us to shrink who we are.",
  'OPPORTUNITY': "I'm thinking about what you might be leaving behind. Not every door stays open forever, and I'm curious whether you've made peace with the ones that may close.",
  'FINANCIAL': "Financial security matters, of course. But I wonder if there's a balance point where the pursuit of security might cost something equally valuable.",
  'LIFESTYLE': "The day-to-day reality of a path matters so much. Are you choosing a life you'll actually enjoy living, or just an outcome that sounds impressive?",
  'PURPOSE': "I'm curious about meaning for you. Does this path connect to something that gives you a sense of purpose, or is it simply a sensible next step?",
  'FEAR_BASED': "Sometimes the decisions that feel safest in the moment become the ones we question later. What might you do if fear weren't a factor?",
  'APPROVAL_BASED': "I wonder whose voice is loudest in this decision. If no one else's opinion mattered, would you still choose this path?",
  'RELATIONSHIP': "The people we surround ourselves with shape us profoundly. Who will you become in the community this choice creates?",
  'GROWTH': "Growth often requires discomfort. Does this path challenge you to become more, or does it prioritize comfort over transformation?",
};

const MENTOR_GUIDANCE: Record<RegretRisk, string> = {
  'MINIMAL': "This seems like a solid choice that aligns well with who you are. Trust yourself as you move forward.",
  'LOW': "There's always some uncertainty, but you're on a thoughtful path. Stay open to learning as you go.",
  'MODERATE': "This choice has some tension worth exploring. Not to change your mind necessarily, but to ensure you're going in with eyes open.",
  'HIGH': "I'd encourage you to sit with this decision a bit longer. The misalignment I see isn't a guarantee of regret, but it's worth taking seriously.",
  'CRITICAL': "I think this decision deserves deeper examination. The gap between your choice and your authentic self is significant enough that I'd want to understand it better before moving forward.",
};

const MENTOR_CLOSINGS: string[] = [
  "Whatever you choose, I'm here to support you. The goal isn't to predict the future—it's to make this decision with as much awareness as possible.",
  "Remember, regret analysis isn't about avoiding all mistakes. It's about ensuring your mistakes are your own, not the result of unexplored fears or borrowed expectations.",
  "I'm not here to tell you what to do. I'm here to help you see your decision clearly, so whatever you choose, you choose with your eyes open.",
];

// ============================================================================
// REGRET REPORT ENGINE
// ============================================================================

export class RegretReportEngine {
  private predictionEngine: RegretPredictionEngine;

  constructor() {
    this.predictionEngine = createRegretPredictionEngine();
  }

  /**
   * Generate comprehensive regret report
   */
  generateReport(input: RegretPredictionInput): RegretReport {
    const profile = this.predictionEngine.predictRegret(input);

    return {
      id: `report-${Date.now()}`,
      profile,
      summary: this.generateSummary(profile, input),
      insights: this.generateInsights(profile),
      studentReflection: this.generateStudentReflection(profile),
      mentorFraming: this.generateMentorFraming(profile),
      preventionStrategies: this.generatePreventionStrategies(profile),
      explorationOpportunities: this.generateExplorationOpportunities(profile),
      authenticityRecommendations: this.generateAuthenticityRecommendations(profile),
      generatedAt: new Date(),
    };
  }

  /**
   * Generate report summary
   */
  private generateSummary(profile: RegretProfile, input: RegretPredictionInput): string {
    const selectedOption = input.selectedOption || input.options[0];
    
    let summary = `Regret Analysis: ${selectedOption.name}\n\n`;
    summary += `Overall Regret Risk: ${profile.overallRegretRisk.replace('_', ' ')}\n`;
    summary += `Regret Probability: ${profile.overallRegretProbability.replace('_', ' ')}\n`;
    
    if (profile.highestRiskRegret) {
      summary += `Primary Concern: ${profile.highestRiskRegret.replace('_', ' ')}\n`;
    }

    summary += `\n${profile.explanation}\n\n`;

    // Add forecast summary
    summary += `Regret Trajectory: ${profile.forecast.trajectory}\n`;
    summary += `5-Year Outlook: ${profile.forecast.fiveYear.regretProbability.replace('_', ' ')} probability, ${profile.forecast.fiveYear.regretSeverity.toLowerCase()} severity\n`;
    summary += `20-Year Outlook: ${profile.forecast.twentyYear.regretProbability.replace('_', ' ')} probability, ${profile.forecast.twentyYear.regretSeverity.toLowerCase()} severity\n`;

    return summary;
  }

  /**
   * Generate insights for each regret category
   */
  private generateInsights(profile: RegretProfile): RegretInsight[] {
    const insights: RegretInsight[] = [];

    for (const assessment of profile.allRegrets.slice(0, 3)) {
      const categoryInsight = CATEGORY_INSIGHTS[assessment.category];
      
      insights.push({
        category: assessment.category,
        insight: categoryInsight.insight,
        reflection: categoryInsight.reflection,
        actionItem: categoryInsight.action,
      });
    }

    return insights;
  }

  /**
   * Generate student reflection content
   */
  private generateStudentReflection(profile: RegretProfile): string {
    let reflection = RISK_REFLECTIONS[profile.overallRegretRisk];
    reflection += '\n\n';

    if (profile.allRegrets.length > 0) {
      reflection += 'Key areas to reflect on:\n\n';
      
      for (const regret of profile.allRegrets.slice(0, 3)) {
        reflection += `• ${regret.category.replace('_', ' ')}: ${regret.description}\n`;
      }
    }

    reflection += '\n';
    reflection += 'Questions to consider:\n\n';

    if (profile.explorationAnalysis.hasExplorationRisk) {
      reflection += '• What paths have I not explored that I might wonder about later?\n';
    }

    if (profile.identityAnalysis.hasIdentityRisk) {
      reflection += '• Am I being true to who I am, or am I hiding parts of myself?\n';
    }

    if (profile.fearAnalysis.hasFearRisk) {
      reflection += '• What would I choose if I were not afraid?\n';
    }

    if (profile.approvalAnalysis.hasApprovalRisk) {
      reflection += '• Am I living for myself or for others approval?\n';
    }

    reflection += '\nRemember: This analysis is not a prediction of failure. ';
    reflection += 'It is an invitation to make your decision with greater awareness. ';
    reflection += 'The wisest choices come from understanding both what we gain and what we give up.';

    return reflection;
  }

  /**
   * Generate mentor framing for the discussion
   */
  private generateMentorFraming(profile: RegretProfile): MentorFraming {
    const dominantCategory = profile.highestRiskRegret || 'EXPLORATION';

    return {
      opening: this.selectRandom(MENTOR_OPENINGS),
      exploration: MENTOR_REFLECTIONS[dominantCategory],
      reflection: this.generateMentorReflection(profile),
      guidance: MENTOR_GUIDANCE[profile.overallRegretRisk],
      closing: this.selectRandom(MENTOR_CLOSINGS),
    };
  }

  /**
   * Generate mentor-specific reflection
   */
  private generateMentorReflection(profile: RegretProfile): string {
    let reflection = '';

    if (profile.preventableRegrets.length > 0) {
      reflection += `${profile.preventableRegrets.length} of these concerns may be addressable with some adjustments. `;
    }

    if (profile.irreversibleRegrets.length > 0) {
      reflection += `There are ${profile.irreversibleRegrets.length} aspects that may be difficult to change later. `;
    }

    if (profile.forecast.trajectory === 'WORSENING') {
      reflection += 'The regret risk appears to increase over time, suggesting early intervention could be valuable. ';
    } else if (profile.forecast.trajectory === 'IMPROVING') {
      reflection += 'The regret risk appears to decrease over time, suggesting any initial discomfort may resolve. ';
    }

    reflection += `My role isn't to tell them what to do, but to help them see their decision with clarity and compassion.`;

    return reflection;
  }

  /**
   * Generate prevention strategies
   */
  private generatePreventionStrategies(profile: RegretProfile): string[] {
    const strategies: string[] = [];

    // Add strategies from each analysis
    if (profile.explorationAnalysis.preventionPossible) {
      strategies.push(...profile.explorationAnalysis.preventionStrategies.slice(0, 2));
    }

    if (profile.identityAnalysis.preventionPossible) {
      strategies.push(...profile.identityAnalysis.identityRecoveryPath.slice(0, 2));
    }

    if (profile.fearAnalysis.preventionPossible) {
      strategies.push(...profile.fearAnalysis.fearMitigationStrategies.slice(0, 2));
    }

    if (profile.approvalAnalysis.preventionPossible) {
      strategies.push(...profile.approvalAnalysis.authenticityRecoverySteps.slice(0, 2));
    }

    // Add general strategies
    strategies.push('Keep a journal of your decision-making process for future reference');
    strategies.push('Schedule regular check-ins with yourself to assess how you feel about your choice');
    strategies.push('Stay open to course corrections - few decisions are truly irreversible');

    return strategies;
  }

  /**
   * Generate exploration opportunities
   */
  private generateExplorationOpportunities(profile: RegretProfile): string[] {
    const opportunities: string[] = [];

    for (const path of profile.explorationAnalysis.unexploredPaths.slice(0, 3)) {
      if (path.recoverability === 'EASY') {
        opportunities.push(`Consider exploring ${path.pathName.toLowerCase()} as a side project`);
      } else if (path.recoverability === 'MODERATE') {
        opportunities.push(`${path.pathName} - could be pursued after gaining some experience`);
      } else {
        opportunities.push(`${path.pathName} - would require significant effort to pursue later`);
      }
    }

    if (opportunities.length === 0) {
      opportunities.push('Your current path appears to cover your primary interests');
      opportunities.push('Stay open to discovering new interests as you progress');
    }

    return opportunities;
  }

  /**
   * Generate authenticity recommendations
   */
  private generateAuthenticityRecommendations(profile: RegretProfile): string[] {
    const recommendations: string[] = [];

    if (profile.identityAnalysis.hasIdentityRisk) {
      for (const identity of profile.identityAnalysis.suppressedIdentities.slice(0, 2)) {
        recommendations.push(`Find ways to express your ${identity.toLowerCase()} identity within or alongside your chosen path`);
      }
    }

    if (profile.approvalAnalysis.hasApprovalRisk) {
      recommendations.push('Practice making small decisions based on your own desires');
      recommendations.push('Identify whose approval you are seeking and question whether it serves you');
    }

    recommendations.push('Regularly ask yourself: "Does this choice still feel like me?"');
    recommendations.push('Build a support network that values your authentic self');

    return recommendations;
  }

  /**
   * Select random element from array
   */
  private selectRandom<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Generate quick report
   */
  generateQuickReport(
    optionName: string,
    interests: string[],
    motivations: string[]
  ): {
    regretRisk: RegretRisk;
    summary: string;
    keyQuestion: string;
  } {
    const check = this.predictionEngine.quickRegretCheck(optionName, interests, motivations);
    const profile = this.predictionEngine.predictRegret({
      decisionType: 'QUICK_CHECK',
      description: 'Quick check',
      options: [{
        id: 'quick',
        name: optionName,
        description: optionName,
        type: 'OTHER',
        motivations: motivations as any[],
        alignmentWithInterests: 0.5,
        alignmentWithValues: 0.5,
        alignmentWithStrengths: 0.5,
        explorationValue: 0.5,
        identityExpression: 0.5,
        opportunityCost: 0.5,
      }],
      studentProfile: {
        currentEducation: 'Unknown',
        interests,
        strengths: [],
        values: [],
        previousChoices: [],
      },
      context: {
        urgency: 'MEDIUM',
        reversibility: 'MODERATE',
        timePressure: false,
        informationLevel: 'ADEQUATE',
        externalPressures: [],
      },
    });

    return {
      regretRisk: check.regretRisk,
      summary: RISK_REFLECTIONS[check.regretRisk],
      keyQuestion: profile.allRegrets[0]?.category ? 
        CATEGORY_INSIGHTS[profile.allRegrets[0].category].reflection : 
        'Does this path feel authentic to who you are?',
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export function createRegretReportEngine(): RegretReportEngine {
  return new RegretReportEngine();
}

export function generateRegretReport(input: RegretPredictionInput): RegretReport {
  const engine = createRegretReportEngine();
  return engine.generateReport(input);
}

export function generateQuickRegretReport(
  optionName: string,
  interests: string[],
  motivations: string[]
): {
  regretRisk: RegretRisk;
  summary: string;
  keyQuestion: string;
} {
  const engine = createRegretReportEngine();
  return engine.generateQuickReport(optionName, interests, motivations);
}
