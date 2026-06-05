/**
 * CareerOS Career Intelligence Engine - Career Insights Engine
 *
 * Phase C.1: Career Intelligence Engine
 *
 * Generates insights about careers based on intelligence data.
 *
 * @module career-insights-engine
 * @version 1.0.0
 */

import type {
  CareerIntelligence,
  CareerInsights,
  InsightStatement,
  Misconception,
  Tradeoff,
  Opportunity,
} from './career-types';

/**
 * Generates insights about careers using deterministic rules.
 *
 * Creates profiles of who thrives, who struggles, misconceptions,
 * tradeoffs, and opportunities without AI calls.
 */
export class CareerInsightsEngine {
  /**
   * Generate complete insights for a career.
   */
  generateInsights(career: CareerIntelligence): CareerInsights {
    return {
      whoThrives: this.generateWhoThrives(career),
      whoStruggles: this.generateWhoStruggles(career),
      misconceptions: this.identifyMisconceptions(career),
      tradeoffs: this.identifyTradeoffs(career),
      longTermOpportunities: this.identifyOpportunities(career),
      successFactors: this.identifySuccessFactors(career),
      warningSigns: this.identifyWarningSigns(career),
    };
  }

  /**
   * Generate "Who Thrives" insight.
   */
  private generateWhoThrives(career: CareerIntelligence): InsightStatement {
    const cognitive = career.cognitiveDemands;
    const motivational = career.motivationalDemands;
    const workEnv = career.workEnvironment;
    const lifestyle = career.lifestyleCharacteristics;

    const thrivingTraits: string[] = [];
    const keyDimensions: string[] = [];

    // Cognitive traits
    if (cognitive.analyticalDemand.score >= 70) {
      thrivingTraits.push('analytical thinkers');
      keyDimensions.push('analytical');
    }
    if (cognitive.creativeDemand.score >= 70) {
      thrivingTraits.push('creative problem-solvers');
      keyDimensions.push('creative');
    }
    if (cognitive.systematicDemand.score >= 70) {
      thrivingTraits.push('organized individuals');
      keyDimensions.push('systematic');
    }
    if (cognitive.verbalDemand.score >= 70) {
      thrivingTraits.push('strong communicators');
      keyDimensions.push('verbal');
    }

    // Motivational traits
    if (motivational.achievementDemand.score >= 70) {
      thrivingTraits.push('achievement-driven professionals');
      keyDimensions.push('achievement');
    }
    if (motivational.impactDemand.score >= 70) {
      thrivingTraits.push('purpose-driven individuals');
      keyDimensions.push('impact');
    }
    if (motivational.autonomyDemand.score >= 70) {
      thrivingTraits.push('self-directed workers');
      keyDimensions.push('autonomy');
    }
    if (motivational.masteryDemand.score >= 70) {
      thrivingTraits.push('continuous learners');
      keyDimensions.push('mastery');
    }

    // Work environment fit
    if (workEnv.peopleIntensity.score >= 70) {
      thrivingTraits.push('people-oriented individuals');
      keyDimensions.push('peopleIntensity');
    }
    if (workEnv.independenceLevel.score >= 70) {
      thrivingTraits.push('independent workers');
      keyDimensions.push('independence');
    }
    if (workEnv.leadershipOpportunity.score >= 70) {
      thrivingTraits.push('natural leaders');
      keyDimensions.push('leadership');
    }

    // Lifestyle fit
    if (lifestyle.incomePotential.score >= 70 && motivational.achievementDemand.score >= 60) {
      thrivingTraits.push('ambitious professionals');
      keyDimensions.push('incomeAmbition');
    }

    const summary = thrivingTraits.length > 0
      ? `People who thrive in this career: ${this.formatList(thrivingTraits.slice(0, 3))}.`
      : 'This career accommodates diverse personality types.';

    const explanation = this.generateThrivesExplanation(career, thrivingTraits);

    const confidence = this.calculateConfidence(career, keyDimensions);

    return {
      summary,
      explanation,
      keyDimensions,
      confidence,
    };
  }

  /**
   * Generate explanation for who thrives.
   */
  private generateThrivesExplanation(
    career: CareerIntelligence,
    traits: string[]
  ): string {
    const parts: string[] = [];

    // Core work explanation
    const cognitive = career.cognitiveDemands;
    const dominantCognitive = this.getDominantCognitive(cognitive);
    parts.push(`This role requires strong ${dominantCognitive} abilities.`);

    // Motivation explanation
    const motivational = career.motivationalDemands;
    if (motivational.achievementDemand.score >= 70) {
      parts.push('Success requires high achievement drive and goal orientation.');
    }
    if (motivational.impactDemand.score >= 70) {
      parts.push('Those motivated by making a difference excel here.');
    }
    if (motivational.autonomyDemand.score >= 70) {
      parts.push('Self-direction and independent decision-making are valued.');
    }

    // Environment explanation
    const workEnv = career.workEnvironment;
    if (workEnv.peopleIntensity.score >= 70) {
      parts.push('The work environment is highly collaborative and social.');
    } else if (workEnv.independenceLevel.score >= 70) {
      parts.push('Much of the work is done independently with minimal supervision.');
    }

    // Traits summary
    if (traits.length > 0) {
      parts.push(`Specifically, ${traits.join(', ')} tend to excel.`);
    }

    return parts.join(' ');
  }

  /**
   * Generate "Who Struggles" insight.
   */
  private generateWhoStruggles(career: CareerIntelligence): InsightStatement {
    const cognitive = career.cognitiveDemands;
    const motivational = career.motivationalDemands;
    const workEnv = career.workEnvironment;
    const risks = career.careerRisks;

    const strugglingTraits: string[] = [];
    const keyDimensions: string[] = [];

    // Low tolerance for dominant demands
    if (cognitive.analyticalDemand.score >= 70) {
      strugglingTraits.push('those who dislike analytical work');
      keyDimensions.push('analytical');
    }
    if (cognitive.creativeDemand.score >= 70) {
      strugglingTraits.push('people who prefer structured routines');
      keyDimensions.push('creative');
    }
    if (cognitive.systematicDemand.score >= 70) {
      strugglingTraits.push('those who prefer flexibility over process');
      keyDimensions.push('systematic');
    }

    // Motivational mismatches
    if (motivational.achievementDemand.score >= 70) {
      strugglingTraits.push('those content with status quo');
      keyDimensions.push('achievement');
    }
    if (motivational.autonomyDemand.score >= 70) {
      strugglingTraits.push('people who need clear direction');
      keyDimensions.push('autonomy');
    }
    if (motivational.impactDemand.score >= 70) {
      strugglingTraits.push('those motivated primarily by compensation');
      keyDimensions.push('impact');
    }

    // Environment mismatches
    if (workEnv.peopleIntensity.score >= 70) {
      strugglingTraits.push('introverts or those who prefer solitary work');
      keyDimensions.push('peopleIntensity');
    }
    if (workEnv.independenceLevel.score >= 70) {
      strugglingTraits.push('those who thrive in collaborative environments');
      keyDimensions.push('independence');
    }
    if (workEnv.leadershipOpportunity.score >= 70 && workEnv.leadershipOpportunity.score >= 70) {
      strugglingTraits.push('those uncomfortable with responsibility');
      keyDimensions.push('leadership');
    }

    // Risk factors
    if (risks.burnoutRisk.score >= 70) {
      strugglingTraits.push('people prone to burnout');
      keyDimensions.push('burnoutRisk');
    }
    if (risks.automationRisk.score >= 70) {
      strugglingTraits.push('those seeking long-term stability');
      keyDimensions.push('automationRisk');
    }

    const summary = strugglingTraits.length > 0
      ? `Those who may struggle: ${this.formatList(strugglingTraits.slice(0, 3))}.`
      : 'Most people can adapt to this career with proper preparation.';

    const explanation = this.generateStrugglesExplanation(career, strugglingTraits);
    const confidence = this.calculateConfidence(career, keyDimensions);

    return {
      summary,
      explanation,
      keyDimensions,
      confidence,
    };
  }

  /**
   * Generate explanation for who struggles.
   */
  private generateStrugglesExplanation(
    career: CareerIntelligence,
    traits: string[]
  ): string {
    const parts: string[] = [];
    const cognitive = career.cognitiveDemands;
    const workEnv = career.workEnvironment;
    const risks = career.careerRisks;

    // Core challenges
    const dominantCognitive = this.getDominantCognitive(cognitive);
    parts.push(`Those lacking ${dominantCognitive} skills may find the work challenging.`);

    // Environment challenges
    if (workEnv.peopleIntensity.score >= 70) {
      parts.push('The social intensity can exhaust those who prefer quiet, independent work.');
    }
    if (workEnv.independenceLevel.score >= 70) {
      parts.push('The autonomy can feel overwhelming for those needing structure.');
    }

    // Risk challenges
    if (risks.burnoutRisk.score >= 70) {
      parts.push('High pressure and demands make this unsuitable for work-life balance seekers.');
    }
    if (risks.automationRisk.score >= 70) {
      parts.push('Those seeking long-term security may be concerned by automation risks.');
    }

    // Summary
    if (traits.length > 0) {
      parts.push(`Specifically, ${traits.join(', ')} may face difficulties.`);
    }

    return parts.join(' ');
  }

  /**
   * Identify common misconceptions about the career.
   */
  private identifyMisconceptions(career: CareerIntelligence): Misconception[] {
    const misconceptions: Misconception[] = [];
    const cognitive = career.cognitiveDemands;
    const motivational = career.motivationalDemands;
    const lifestyle = career.lifestyleCharacteristics;
    const risks = career.careerRisks;
    const workEnv = career.workEnvironment;

    // Creative vs analytical misconception
    if (cognitive.creativeDemand.score >= 70 && cognitive.analyticalDemand.score >= 70) {
      misconceptions.push({
        misconception: 'This career is purely analytical with no room for creativity',
        reality: `This role requires both analytical thinking (${cognitive.analyticalDemand.score}%) and creative problem-solving (${cognitive.creativeDemand.score}%).`,
        origin: 'Traditional views focusing on technical requirements',
        impact: 'May deter creative individuals who would excel',
      });
    }

    // Income misconception
    if (lifestyle.incomePotential.score >= 70 && motivational.impactDemand.score >= 70) {
      misconceptions.push({
        misconception: 'People in this career are only motivated by money',
        reality: `While income potential is high (${lifestyle.incomePotential.score}%), impact motivation (${motivational.impactDemand.score}%) is equally important.`,
        origin: 'Focus on visible compensation over intrinsic motivation',
        impact: 'Misunderstands the true motivations of professionals',
      });
    }

    // Independence misconception
    if (workEnv.peopleIntensity.score >= 70 && workEnv.independenceLevel.score >= 70) {
      misconceptions.push({
        misconception: 'This is a solitary, independent role',
        reality: `This career involves significant collaboration (${workEnv.peopleIntensity.score}%) alongside independent work (${workEnv.independenceLevel.score}%).`,
        origin: 'Oversimplified view of work structure',
        impact: 'Introverts may be surprised by collaboration demands',
      });
    }

    // Stability misconception
    if (risks.automationRisk.score >= 70 && career.careerAdvantages.futureRelevance.score >= 70) {
      misconceptions.push({
        misconception: 'This career is future-proof and stable',
        reality: `While future-relevant (${career.careerAdvantages.futureRelevance.score}%), automation risk is significant (${risks.automationRisk.score}%).`,
        origin: 'Optimistic projections without risk assessment',
        impact: 'May lead to complacency about skill development',
      });
    }

    // Work-life balance misconception
    if (lifestyle.workLifeBalance.score <= 40 && lifestyle.incomePotential.score >= 70) {
      misconceptions.push({
        misconception: 'High income comes with reasonable hours',
        reality: `High income potential (${lifestyle.incomePotential.score}%) often requires sacrificing work-life balance (${lifestyle.workLifeBalance.score}%).`,
        origin: 'Wishful thinking about high-paying careers',
        impact: 'Unrealistic expectations about lifestyle tradeoffs',
      });
    }

    // Education misconception
    if (risks.educationBarrier.score >= 70) {
      misconceptions.push({
        misconception: 'Anyone can enter this field with enough effort',
        reality: `Significant education barriers exist (${risks.educationBarrier.score}%), requiring substantial formal training.`,
        origin: 'Bootstrap narratives in career advice',
        impact: 'May discourage those without resources or overencourage others',
      });
    }

    return misconceptions;
  }

  /**
   * Identify major career tradeoffs.
   */
  private identifyTradeoffs(career: CareerIntelligence): Tradeoff[] {
    const tradeoffs: Tradeoff[] = [];
    const lifestyle = career.lifestyleCharacteristics;
    const motivational = career.motivationalDemands;
    const workEnv = career.workEnvironment;
    const risks = career.careerRisks;

    // Income vs Work-life balance
    if (lifestyle.incomePotential.score >= 70 && lifestyle.workLifeBalance.score <= 40) {
      tradeoffs.push({
        name: 'Income vs Work-Life Balance',
        description: 'High earnings require significant time and energy investment',
        gain: `Substantial income potential (${lifestyle.incomePotential.score}%) and career advancement`,
        sacrifice: `Limited work-life balance (${lifestyle.workLifeBalance.score}%) and personal time`,
        forWhom: 'Achievement-driven individuals prioritizing financial success',
        avoidIf: 'You value time flexibility and personal life outside work',
      });
    }

    // Autonomy vs Security
    if (motivational.autonomyDemand.score >= 70 && risks.automationRisk.score >= 60) {
      tradeoffs.push({
        name: 'Autonomy vs Security',
        description: 'Independent roles often come with higher risk',
        gain: `High autonomy (${motivational.autonomyDemand.score}%) and decision-making freedom`,
        sacrifice: `Increased career risk (${risks.automationRisk.score}%) and uncertainty`,
        forWhom: 'Self-directed individuals comfortable with uncertainty',
        avoidIf: 'You prioritize stability and predictable outcomes',
      });
    }

    // Impact vs Income
    if (motivational.impactDemand.score >= 70 && lifestyle.incomePotential.score <= 50) {
      tradeoffs.push({
        name: 'Purpose vs Compensation',
        description: 'Meaningful work may not maximize earnings',
        gain: `Strong sense of impact (${motivational.impactDemand.score}%) and purpose`,
        sacrifice: `Limited income potential (${lifestyle.incomePotential.score}%) compared to alternatives`,
        forWhom: 'Purpose-driven individuals who value meaning over money',
        avoidIf: 'Financial security and high earnings are priorities',
      });
    }

    // Independence vs Collaboration
    if (workEnv.independenceLevel.score >= 70 && workEnv.peopleIntensity.score >= 60) {
      tradeoffs.push({
        name: 'Independence vs Team Integration',
        description: 'Autonomy requires managing complex collaboration demands',
        gain: `Substantial independence (${workEnv.independenceLevel.score}%) in work approach`,
        sacrifice: `Must balance with collaboration requirements (${workEnv.peopleIntensity.score}%)`,
        forWhom: 'Self-starters who can work both independently and with others',
        avoidIf: 'You prefer purely independent or purely collaborative work',
      });
    }

    // Security vs Growth
    if (lifestyle.stabilityLevel.score >= 70 && career.careerAdvantages.careerMobility.score <= 50) {
      tradeoffs.push({
        name: 'Stability vs Mobility',
        description: 'Stable roles may limit future options',
        gain: `Job security and stability (${lifestyle.stabilityLevel.score}%)`,
        sacrifice: `Limited career mobility (${career.careerAdvantages.careerMobility.score}%) and optionality`,
        forWhom: 'Risk-averse individuals who value predictability',
        avoidIf: 'You want flexibility to change directions later',
      });
    }

    return tradeoffs;
  }

  /**
   * Identify long-term opportunities.
   */
  private identifyOpportunities(career: CareerIntelligence): Opportunity[] {
    const opportunities: Opportunity[] = [];
    const advantages = career.careerAdvantages;
    const workEnv = career.workEnvironment;
    const motivational = career.motivationalDemands;

    // Leadership opportunities
    if (workEnv.leadershipOpportunity.score >= 60) {
      opportunities.push({
        name: 'Leadership Advancement',
        description: 'Progress into management and executive roles',
        timeline: '5-10 years',
        requirements: [
          'Demonstrated performance and results',
          'Leadership skills development',
          'Strategic thinking capabilities',
        ],
        probability: Math.min(90, workEnv.leadershipOpportunity.score + 10),
      });
    }

    // Specialization opportunities
    if (motivational.masteryDemand.score >= 60) {
      opportunities.push({
        name: 'Deep Specialization',
        description: 'Become an expert in a niche area',
        timeline: '3-7 years',
        requirements: [
          'Continuous learning and skill development',
          'Deep domain expertise',
          'Professional network building',
        ],
        probability: Math.min(85, motivational.masteryDemand.score + 15),
      });
    }

    // Entrepreneurship opportunities
    if (motivational.autonomyDemand.score >= 70 && advantages.optionality.score >= 60) {
      opportunities.push({
        name: 'Independent Practice',
        description: 'Start own business or consultancy',
        timeline: '7-15 years',
        requirements: [
          'Strong professional reputation',
          'Business development skills',
          'Financial reserves',
          'Network of potential clients',
        ],
        probability: Math.min(70, advantages.optionality.score),
      });
    }

    // Career transition opportunities
    if (advantages.transferability.score >= 70) {
      opportunities.push({
        name: 'Career Pivot',
        description: 'Transfer skills to adjacent fields',
        timeline: '2-5 years',
        requirements: [
          'Transferable skill development',
          'Cross-domain learning',
          'Network expansion',
        ],
        probability: Math.min(85, advantages.transferability.score + 5),
      });
    }

    // Future growth opportunities
    if (advantages.futureRelevance.score >= 70) {
      opportunities.push({
        name: 'Emerging Specializations',
        description: 'Enter high-growth specializations as field evolves',
        timeline: '3-8 years',
        requirements: [
          'Stay current with industry trends',
          'Continuous skill development',
          'Adaptability to change',
        ],
        probability: Math.min(80, advantages.futureRelevance.score),
      });
    }

    return opportunities;
  }

  /**
   * Identify success factors.
   */
  private identifySuccessFactors(career: CareerIntelligence): string[] {
    const factors: string[] = [];
    const cognitive = career.cognitiveDemands;
    const motivational = career.motivationalDemands;
    const workEnv = career.workEnvironment;

    // Cognitive success factors
    if (cognitive.analyticalDemand.score >= 60) {
      factors.push('Strong analytical and critical thinking abilities');
    }
    if (cognitive.creativeDemand.score >= 60) {
      factors.push('Creative problem-solving and innovation skills');
    }
    if (cognitive.systematicDemand.score >= 60) {
      factors.push('Attention to detail and process orientation');
    }

    // Motivational success factors
    if (motivational.achievementDemand.score >= 60) {
      factors.push('Drive to achieve goals and exceed expectations');
    }
    if (motivational.masteryDemand.score >= 60) {
      factors.push('Commitment to continuous learning and improvement');
    }
    if (motivational.impactDemand.score >= 60) {
      factors.push('Desire to make meaningful contributions');
    }

    // Work environment success factors
    if (workEnv.peopleIntensity.score >= 60) {
      factors.push('Strong interpersonal and communication skills');
    }
    if (workEnv.independenceLevel.score >= 60) {
      factors.push('Self-direction and initiative');
    }
    if (workEnv.leadershipOpportunity.score >= 60) {
      factors.push('Leadership potential and team management skills');
    }

    // General factors
    factors.push('Resilience and adaptability to challenges');
    factors.push('Professional network and relationship building');

    return factors.slice(0, 6);
  }

  /**
   * Identify warning signs.
   */
  private identifyWarningSigns(career: CareerIntelligence): string[] {
    const warnings: string[] = [];
    const risks = career.careerRisks;
    const lifestyle = career.lifestyleCharacteristics;
    const motivational = career.motivationalDemands;

    // Risk warnings
    if (risks.automationRisk.score >= 60) {
      warnings.push('High automation risk may reduce opportunities over time');
    }
    if (risks.burnoutRisk.score >= 60) {
      warnings.push('High burnout risk requires proactive stress management');
    }
    if (risks.competitionRisk.score >= 70) {
      warnings.push('Intense competition for positions and advancement');
    }
    if (risks.educationBarrier.score >= 70) {
      warnings.push('Significant educational investment required for entry');
    }

    // Lifestyle warnings
    if (lifestyle.workLifeBalance.score <= 40) {
      warnings.push('Work-life balance challenges are common');
    }
    if (lifestyle.locationFlexibility.score <= 40) {
      warnings.push('Limited location flexibility may require relocation');
    }

    // Motivational warnings
    if (motivational.achievementDemand.score >= 70 && lifestyle.workLifeBalance.score <= 40) {
      warnings.push('Achievement demands may compromise personal wellbeing');
    }

    return warnings;
  }

  // Helper methods

  private getDominantCognitive(cognitive: CareerIntelligence['cognitiveDemands']): string {
    const demands = [
      { name: 'analytical', score: cognitive.analyticalDemand.score },
      { name: 'creative', score: cognitive.creativeDemand.score },
      { name: 'systematic', score: cognitive.systematicDemand.score },
      { name: 'verbal', score: cognitive.verbalDemand.score },
    ];

    return demands.reduce((max, current) =>
      current.score > max.score ? current : max
    ).name;
  }

  private formatList(items: string[]): string {
    if (items.length === 0) return '';
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
  }

  private calculateConfidence(career: CareerIntelligence, dimensions: string[]): number {
    if (dimensions.length === 0) return 70;

    // Calculate average confidence across relevant dimensions
    let totalConfidence = 0;
    let count = 0;

    const allDimensions = [
      ...Object.values(career.cognitiveDemands),
      ...Object.values(career.motivationalDemands),
      ...Object.values(career.workEnvironment),
      ...Object.values(career.lifestyleCharacteristics),
    ];

    for (const dim of allDimensions) {
      totalConfidence += dim.confidence;
      count++;
    }

    return count > 0 ? Math.round(totalConfidence / count) : 70;
  }
}

/**
 * Factory function for CareerInsightsEngine.
 */
export function createCareerInsightsEngine(): CareerInsightsEngine {
  return new CareerInsightsEngine();
}
