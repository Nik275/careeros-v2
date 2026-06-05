/**
 * CareerOS Student Profile Generator - Profile Insights Engine
 *
 * Phase B.3: Profile Generation Layer
 *
 * Generates actionable career insights from profile data.
 *
 * @module profile-insights-engine
 * @version 1.0.0
 */

import type { StudentLifeProfile } from '../types/student-life-profile';

import type {
  AssessmentResult,
  ProfileInsights,
  ComponentConfidence,
} from './profile-types';

/**
 * Generates actionable career insights from profile data.
 *
 * Uses deterministic rules to identify advantages, growth areas,
 * ideal conditions, risks, and personal styles.
 */
export class ProfileInsightsEngine {
  /**
   * Generate complete profile insights.
   */
  generateInsights(
    profile: StudentLifeProfile,
    result: AssessmentResult
  ): ProfileInsights {
    return {
      keyAdvantages: this.identifyKeyAdvantages(profile, result),
      growthAreas: this.identifyGrowthAreas(profile, result),
      idealWorkConditions: this.identifyIdealConditions(profile, result),
      careerRiskFactors: this.identifyRiskFactors(profile, result),
      decisionMakingStyle: this.identifyDecisionStyle(profile, result),
      learningStyle: this.identifyLearningStyle(profile, result),
    };
  }

  /**
   * Identify key career advantages.
   */
  private identifyKeyAdvantages(
    profile: StudentLifeProfile,
    result: AssessmentResult
  ): ProfileInsights['keyAdvantages'] {
    const advantages: ProfileInsights['keyAdvantages'] = [];

    // Analytical advantage
    if (profile.cognitive.analytical > 70) {
      advantages.push({
        advantage: 'Analytical Problem Solving',
        explanation: 'Can break down complex problems into manageable components',
        applicableContexts: ['Strategy', 'Engineering', 'Finance', 'Research'],
        confidence: profile.cognitive.analytical,
      });
    }

    // Creative advantage
    if (profile.cognitive.creative > 70) {
      advantages.push({
        advantage: 'Creative Innovation',
        explanation: 'Generates novel solutions and fresh perspectives',
        applicableContexts: ['Product Development', 'Marketing', 'Design', 'Entrepreneurship'],
        confidence: profile.cognitive.creative,
      });
    }

    // Achievement advantage
    if (profile.motivation.achievement > 70) {
      advantages.push({
        advantage: 'Results Orientation',
        explanation: 'Sets ambitious goals and drives to completion',
        applicableContexts: ['Sales', 'Project Management', 'Leadership', 'Operations'],
        confidence: profile.motivation.achievement,
      });
    }

    // Independence advantage
    if (profile.motivation.autonomy > 70 && profile.workEnvironment.independentWork > 70) {
      advantages.push({
        advantage: 'Independent Execution',
        explanation: 'Thrives with minimal supervision and self-directed work',
        applicableContexts: ['Consulting', 'Remote Work', 'Specialist Roles', 'Entrepreneurship'],
        confidence: Math.round((profile.motivation.autonomy + profile.workEnvironment.independentWork) / 2),
      });
    }

    // Social advantage
    if (profile.workEnvironment.peopleOriented > 70) {
      advantages.push({
        advantage: 'Relationship Building',
        explanation: 'Naturally connects with others and builds rapport',
        applicableContexts: ['Sales', 'HR', 'Customer Success', 'Management'],
        confidence: profile.workEnvironment.peopleOriented,
      });
    }

    // Learning advantage
    if (profile.values.learning > 70) {
      advantages.push({
        advantage: 'Continuous Learning',
        explanation: 'Rapidly acquires new knowledge and skills',
        applicableContexts: ['Technology', 'Research', 'Consulting', 'Startups'],
        confidence: profile.values.learning,
      });
    }

    // Resilience advantage
    if (profile.risk.uncertaintyComfort > 70) {
      advantages.push({
        advantage: 'Adaptability',
        explanation: 'Comfortable with change and ambiguity',
        applicableContexts: ['Startups', 'Consulting', 'Crisis Management', 'Transformation'],
        confidence: profile.risk.uncertaintyComfort,
      });
    }

    return advantages;
  }

  /**
   * Identify growth areas for development.
   */
  private identifyGrowthAreas(
    profile: StudentLifeProfile,
    result: AssessmentResult
  ): ProfileInsights['growthAreas'] {
    const growthAreas: ProfileInsights['growthAreas'] = [];

    // Social development
    if (profile.workEnvironment.peopleOriented < 40) {
      growthAreas.push({
        area: 'Professional Networking',
        importance: 'HIGH',
        developmentPath: 'Practice structured networking and small group interactions',
        timeframe: '3-6 months',
        confidence: 100 - profile.workEnvironment.peopleOriented,
      });
    }

    // Risk tolerance development
    if (profile.risk.careerRiskTolerance < 40) {
      growthAreas.push({
        area: 'Comfort with Uncertainty',
        importance: 'MEDIUM',
        developmentPath: 'Start with small calculated risks and build confidence',
        timeframe: '6-12 months',
        confidence: 100 - profile.risk.careerRiskTolerance,
      });
    }

    // Structure development
    if (profile.cognitive.systematic < 40) {
      growthAreas.push({
        area: 'Structured Planning',
        importance: 'MEDIUM',
        developmentPath: 'Learn project management frameworks and planning techniques',
        timeframe: '3-6 months',
        confidence: 100 - profile.cognitive.systematic,
      });
    }

    // Flexibility development
    if (profile.lifestyle.stabilityPreference > 80) {
      growthAreas.push({
        area: 'Adaptability to Change',
        importance: 'MEDIUM',
        developmentPath: 'Practice adapting to small changes and building flexibility',
        timeframe: '6-12 months',
        confidence: profile.lifestyle.stabilityPreference,
      });
    }

    // Delegation development
    if (
      profile.motivation.autonomy > 70 &&
      profile.workEnvironment.leadershipPreference < 50
    ) {
      growthAreas.push({
        area: 'Leadership and Delegation',
        importance: profile.motivation.achievement > 70 ? 'HIGH' : 'MEDIUM',
        developmentPath: 'Develop skills in guiding others and sharing responsibility',
        timeframe: '6-12 months',
        confidence: Math.round((profile.motivation.autonomy + 100 - profile.workEnvironment.leadershipPreference) / 2),
      });
    }

    return growthAreas;
  }

  /**
   * Identify ideal work conditions.
   */
  private identifyIdealConditions(
    profile: StudentLifeProfile,
    result: AssessmentResult
  ): ProfileInsights['idealWorkConditions'] {
    // Determine environment
    let environment = 'Balanced environment';
    if (profile.workEnvironment.independentWork > 70) {
      environment = 'Private, quiet space with minimal interruptions';
    } else if (profile.workEnvironment.peopleOriented > 70) {
      environment = 'Collaborative, social environment with team interaction';
    } else if (profile.workEnvironment.independentWork > 60 && profile.workEnvironment.peopleOriented > 60) {
      environment = 'Flexible environment allowing both solo and collaborative work';
    }

    // Determine pace
    let pace = 'Steady, sustainable pace';
    const achievementScore = profile.motivation.achievement;
    const stabilityScore = profile.lifestyle.stabilityPreference;

    if (achievementScore > 75 && stabilityScore < 50) {
      pace = 'Fast-paced with ambitious deadlines';
    } else if (stabilityScore > 70) {
      pace = 'Predictable, steady pace with clear expectations';
    } else if (achievementScore > 70 && stabilityScore > 60) {
      pace = 'Moderate pace with periodic intensity';
    }

    // Determine structure
    let structure = 'Moderate structure';
    if (profile.cognitive.systematic > 70) {
      structure = 'Clear processes, defined expectations, regular feedback';
    } else if (profile.motivation.autonomy > 70) {
      structure = 'Autonomy with outcome-based goals rather than process mandates';
    }

    // Determine social dynamic
    let socialDynamic = 'Balanced team interaction';
    if (profile.workEnvironment.peopleOriented > 70) {
      socialDynamic = 'High collaboration, frequent team interaction';
    } else if (profile.workEnvironment.independentWork > 70) {
      socialDynamic = 'Independent work with occasional collaboration';
    }

    // Determine autonomy level
    let autonomy = 'Moderate autonomy';
    if (profile.motivation.autonomy > 75) {
      autonomy = 'High autonomy with freedom to approach work independently';
    } else if (profile.motivation.security > 70) {
      autonomy = 'Guided autonomy with clear boundaries and support';
    }

    // Calculate overall confidence
    const confidence = Math.round(
      (result.confidence.score +
        profile.workEnvironment.independentWork +
        profile.workEnvironment.peopleOriented +
        profile.motivation.autonomy) /
        4
    );

    return {
      environment,
      pace,
      structure,
      socialDynamic,
      autonomy,
      confidence,
    };
  }

  /**
   * Identify career risk factors.
   */
  private identifyRiskFactors(
    profile: StudentLifeProfile,
    result: AssessmentResult
  ): ProfileInsights['careerRiskFactors'] {
    const risks: ProfileInsights['careerRiskFactors'] = [];

    // Burnout risk from high achievement + low balance
    if (profile.motivation.achievement > 75 && profile.lifestyle.workLifeBalance < 50) {
      risks.push({
        risk: 'Burnout from overwork',
        likelihood: 'HIGH',
        mitigation: 'Set boundaries, practice sustainable pace, schedule recovery time',
        confidence: Math.round((profile.motivation.achievement + 100 - profile.lifestyle.workLifeBalance) / 2),
      });
    }

    // Isolation risk
    if (profile.workEnvironment.independentWork > 80 && profile.workEnvironment.peopleOriented < 40) {
      risks.push({
        risk: 'Professional isolation and missed opportunities',
        likelihood: 'MEDIUM',
        mitigation: 'Schedule regular networking, join professional communities, find collaboration outlets',
        confidence: Math.round((profile.workEnvironment.independentWork + 100 - profile.workEnvironment.peopleOriented) / 2),
      });
    }

    // Risk aversion limiting growth
    if (profile.risk.careerRiskTolerance < 35 && profile.motivation.achievement > 70) {
      risks.push({
        risk: 'Missed advancement opportunities due to risk aversion',
        likelihood: 'MEDIUM',
        mitigation: 'Practice calculated risk-taking, seek mentorship, build confidence gradually',
        confidence: Math.round((100 - profile.risk.careerRiskTolerance + profile.motivation.achievement) / 2),
      });
    }

    // Conflict avoidance
    if (profile.values.familyTime > 80 && profile.motivation.achievement > 70) {
      risks.push({
        risk: 'Work-family conflict',
        likelihood: 'MEDIUM',
        mitigation: 'Negotiate flexible arrangements, set clear boundaries, prioritize intentionally',
        confidence: Math.round((profile.values.familyTime + profile.motivation.achievement) / 2),
      });
    }

    // Over-specialization
    if (profile.motivation.mastery > 75 && profile.values.learning < 50) {
      risks.push({
        risk: 'Over-specialization limiting career flexibility',
        likelihood: 'LOW',
        mitigation: 'Maintain awareness of adjacent fields, develop transferable skills',
        confidence: Math.round((profile.motivation.mastery + 100 - profile.values.learning) / 2),
      });
    }

    return risks;
  }

  /**
   * Identify decision making style.
   */
  private identifyDecisionStyle(
    profile: StudentLifeProfile,
    result: AssessmentResult
  ): ProfileInsights['decisionMakingStyle'] {
    // Determine approach
    let approach = 'Balanced decision maker';
    if (profile.cognitive.analytical > 70 && profile.cognitive.creative < 50) {
      approach = 'Analytical and methodical';
    } else if (profile.cognitive.creative > 70 && profile.cognitive.analytical < 50) {
      approach = 'Intuitive and creative';
    } else if (profile.cognitive.analytical > 65 && profile.cognitive.creative > 65) {
      approach = 'Integrative - combines analysis with intuition';
    }

    // Determine speed
    let speed = 'Moderate pace';
    if (profile.risk.uncertaintyComfort > 70) {
      speed = 'Decisive - comfortable making calls with limited information';
    } else if (profile.cognitive.systematic > 70) {
      speed = 'Deliberate - prefers thorough analysis before deciding';
    }

    // Determine information preference
    let informationPreference = 'Moderate information needs';
    if (profile.cognitive.analytical > 75) {
      informationPreference = 'High information needs - wants comprehensive data';
    } else if (profile.risk.uncertaintyComfort > 70) {
      informationPreference = 'Comfortable with limited information';
    }

    // Determine risk tolerance
    let riskTolerance: string;
    const avgRisk = Math.round(
      (profile.risk.careerRiskTolerance +
        profile.risk.financialRiskTolerance +
        profile.risk.uncertaintyComfort) /
        3
    );

    if (avgRisk > 65) {
      riskTolerance = 'Risk-tolerant - willing to take calculated risks';
    } else if (avgRisk > 45) {
      riskTolerance = 'Risk-aware - considers risks carefully';
    } else {
      riskTolerance = 'Risk-cautious - prioritizes safety and predictability';
    }

    // Calculate confidence
    const confidence = Math.round(
      (profile.cognitive.analytical +
        profile.cognitive.creative +
        profile.risk.uncertaintyComfort +
        result.confidence.score) /
        4
    );

    return {
      approach,
      speed,
      informationPreference,
      riskTolerance,
      confidence,
    };
  }

  /**
   * Identify learning style.
   */
  private identifyLearningStyle(
    profile: StudentLifeProfile,
    result: AssessmentResult
  ): ProfileInsights['learningStyle'] {
    // Determine primary learning style
    let primary = 'Balanced learner';

    const analytical = profile.cognitive.analytical;
    const creative = profile.cognitive.creative;
    const systematic = profile.cognitive.systematic;
    const abstract = profile.cognitive.abstractThinking;

    if (analytical > 70 && systematic > 60) {
      primary = 'Analytical learner - prefers structured, logical learning';
    } else if (creative > 70) {
      primary = 'Experiential learner - learns through doing and experimenting';
    } else if (abstract > 70) {
      primary = 'Conceptual learner - grasps theories and principles first';
    } else if (profile.workEnvironment.peopleOriented > 70) {
      primary = 'Social learner - learns best through discussion and collaboration';
    } else if (profile.workEnvironment.independentWork > 70) {
      primary = 'Independent learner - prefers self-directed study';
    }

    // Determine secondary style
    let secondary = 'Adapts to context';
    if (primary.includes('Analytical') && creative > 50) {
      secondary = 'Supplements with hands-on experimentation';
    } else if (primary.includes('Experiential') && analytical > 50) {
      secondary = 'Reinforces with structured analysis';
    } else if (profile.values.learning > 70) {
      secondary = 'Versatile - adapts style to subject matter';
    }

    // Determine optimal environment
    let optimalEnvironment = 'Mixed learning environment';
    if (profile.workEnvironment.independentWork > 70) {
      optimalEnvironment = 'Quiet, self-paced environment with resources available';
    } else if (profile.workEnvironment.peopleOriented > 70) {
      optimalEnvironment = 'Interactive environment with peer discussion';
    } else if (profile.cognitive.systematic > 70) {
      optimalEnvironment = 'Structured curriculum with clear progression';
    } else if (profile.risk.uncertaintyComfort > 70) {
      optimalEnvironment = 'Exploratory environment with freedom to experiment';
    }

    // Determine pace
    let pace = 'Moderate, steady pace';
    if (profile.motivation.achievement > 75) {
      pace = 'Fast-paced with challenging goals';
    } else if (profile.motivation.mastery > 75) {
      pace = 'Deep, thorough pace prioritizing understanding';
    } else if (profile.lifestyle.stabilityPreference > 70) {
      pace = 'Predictable, consistent pace';
    }

    // Calculate confidence
    const confidence = Math.round(
      (profile.cognitive.analytical +
        profile.cognitive.creative +
        profile.values.learning +
        result.confidence.score) /
        4
    );

    return {
      primary,
      secondary,
      optimalEnvironment,
      pace,
      confidence,
    };
  }

  /**
   * Build confidence component.
   */
  private buildConfidence(
    score: number,
    evidenceCount: number,
    explanation: string
  ): ComponentConfidence {
    const level: 'LOW' | 'MEDIUM' | 'HIGH' =
      score >= 70 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW';

    return {
      score,
      level,
      evidenceCount,
      explanation,
    };
  }
}

/**
 * Factory function for ProfileInsightsEngine.
 */
export function createProfileInsightsEngine(): ProfileInsightsEngine {
  return new ProfileInsightsEngine();
}
