/**
 * CareerOS Student Profile Generator - Profile Interpreter
 *
 * Phase B.3: Profile Generation Layer
 *
 * Generates narrative interpretations and archetype classifications
 * from profile data using deterministic rules.
 *
 * @module profile-interpreter
 * @version 1.0.0
 */

import type { StudentLifeProfile } from '../types/student-life-profile';

import type {
  AssessmentResult,
  ProfileInterpretation,
  IdentifiedStrength,
  IdentifiedWeakness,
  StudentArchetype,
  ProfileGenerationConfig,
  ArchetypeDefinition,
} from './profile-types';

/**
 * Generates narrative interpretations and archetypes.
 *
 * Uses deterministic rule-based generation to create human-readable
 * summaries and classify profiles into archetypes.
 */
export class ProfileInterpreter {
  /**
   * Generate narrative interpretation of profile.
   */
  generateInterpretation(profile: StudentLifeProfile): ProfileInterpretation {
    return {
      cognitiveStyle: this.interpretCognitiveStyle(profile.cognitive),
      motivationalProfile: this.interpretMotivation(profile.motivation),
      workStyle: this.interpretWorkStyle(profile.workEnvironment),
      riskProfile: this.interpretRiskProfile(profile.risk),
      valuesSummary: this.interpretValues(profile.values),
    };
  }

  /**
   * Interpret cognitive style from scores.
   */
  private interpretCognitiveStyle(cognitive: StudentLifeProfile['cognitive']): string {
    const parts: string[] = [];

    // Determine primary cognitive mode
    if (cognitive.analytical > 70 && cognitive.creative < 50) {
      parts.push('analytical problem solver');
    } else if (cognitive.creative > 70 && cognitive.analytical < 50) {
      parts.push('creative innovator');
    } else if (cognitive.analytical > 70 && cognitive.creative > 70) {
      parts.push('strategic thinker who combines analysis with creativity');
    } else {
      parts.push('balanced thinker');
    }

    // Add systematic vs. abstract dimension
    if (cognitive.systematic > 70) {
      parts.push('who prefers structured approaches');
    } else if (cognitive.abstractThinking > 70) {
      parts.push('who enjoys abstract conceptualization');
    }

    return parts.join(' ');
  }

  /**
   * Interpret motivation profile.
   */
  private interpretMotivation(motivation: StudentLifeProfile['motivation']): string {
    const drivers: string[] = [];

    if (motivation.achievement > 70) drivers.push('achievement');
    if (motivation.mastery > 70) drivers.push('mastery');
    if (motivation.autonomy > 70) drivers.push('autonomy');
    if (motivation.impact > 70) drivers.push('impact');
    if (motivation.recognition > 70) drivers.push('recognition');
    if (motivation.security > 70) drivers.push('security');

    if (drivers.length === 0) {
      return 'Balanced motivational profile with multiple drivers';
    }

    if (drivers.length === 1) {
      return `Primarily driven by ${drivers[0]}`;
    }

    const last = drivers.pop();
    return `Driven by ${drivers.join(', ')} and ${last}`;
  }

  /**
   * Interpret work style preferences.
   */
  private interpretWorkStyle(workEnv: StudentLifeProfile['workEnvironment']): string {
    const parts: string[] = [];

    if (workEnv.peopleOriented > 70 && workEnv.independentWork < 50) {
      parts.push('highly collaborative');
    } else if (workEnv.independentWork > 70 && workEnv.peopleOriented < 50) {
      parts.push('independent worker');
    } else if (workEnv.peopleOriented > 60 && workEnv.independentWork > 60) {
      parts.push('flexible - works well both independently and collaboratively');
    }

    if (workEnv.leadershipPreference > 70) {
      parts.push('with natural leadership tendencies');
    }

    if (workEnv.researchPreference > 70) {
      parts.push('who enjoys research and exploration');
    } else if (workEnv.executionPreference > 70) {
      parts.push('focused on execution and delivery');
    }

    return parts.join(' ') || 'Adaptable work style';
  }

  /**
   * Interpret risk tolerance.
   */
  private interpretRiskProfile(risk: StudentLifeProfile['risk']): string {
    const avgRisk = Math.round(
      (risk.careerRiskTolerance + risk.financialRiskTolerance + risk.uncertaintyComfort) / 3
    );

    if (avgRisk > 70) {
      return 'High risk tolerance - comfortable with uncertainty and volatility';
    } else if (avgRisk > 50) {
      return 'Moderate risk tolerance - balances stability with growth';
    } else if (avgRisk > 30) {
      return 'Conservative risk profile - prefers predictability';
    } else {
      return 'Very conservative - prioritizes security and stability';
    }
  }

  /**
   * Interpret values profile.
   */
  private interpretValues(values: StudentLifeProfile['values']): string {
    const priorities: Array<[string, number]> = [
      ['financial success', values.money],
      ['prestige', values.prestige],
      ['family', values.familyTime],
      ['freedom', values.freedom],
      ['impact', values.impact],
      ['learning', values.learning],
    ];

    priorities.sort((a, b) => b[1] - a[1]);

    const top = priorities.slice(0, 2).map((p) => p[0]);

    return `Values ${top.join(' and ')} most highly`;
  }

  /**
   * Identify detailed strengths with evidence.
   */
  identifyDetailedStrengths(
    result: AssessmentResult,
    config: ProfileGenerationConfig
  ): IdentifiedStrength[] {
    const scores = Array.from(result.dimensionScores.entries());
    scores.sort((a, b) => b[1].score - a[1].score);

    const strengthDefinitions: Record<
      string,
      { name: string; manifestation: string; evidence: string[] }
    > = {
      analyticalThinking: {
        name: 'Analytical Thinking',
        manifestation: 'Naturally breaks down complex problems into manageable components',
        evidence: ['High systematic processing score', 'Strong critical evaluation'],
      },
      creativeProblemSolving: {
        name: 'Creative Problem Solving',
        manifestation: 'Generates novel solutions and approaches challenges from unique angles',
        evidence: ['High creativity score', 'Strong pattern recognition'],
      },
      achievementDrive: {
        name: 'Achievement Drive',
        manifestation: 'Sets ambitious goals and persists until accomplished',
        evidence: ['High achievement motivation', 'Strong execution preference'],
      },
      autonomyNeed: {
        name: 'Independence',
        manifestation: 'Thrives when given freedom to approach work in own way',
        evidence: ['High autonomy need', 'Strong independence preference'],
      },
      masteryOrientation: {
        name: 'Mastery Focus',
        manifestation: 'Continuously seeks to deepen expertise and understanding',
        evidence: ['High mastery orientation', 'Strong learning values'],
      },
      influenceOrientation: {
        name: 'Leadership Potential',
        manifestation: 'Naturally influences others and takes initiative in groups',
        evidence: ['High influence orientation', 'Strong decision comfort'],
      },
      purposeAlignment: {
        name: 'Purpose-Driven',
        manifestation: 'Seeks work that contributes to meaningful outcomes',
        evidence: ['High purpose alignment', 'Strong impact values'],
      },
      resilience: {
        name: 'Resilience',
        manifestation: 'Recovers quickly from setbacks and maintains momentum',
        evidence: ['High failure recovery score', 'Strong uncertainty comfort'],
      },
    };

    return scores
      .filter(([, score]) => score.score >= config.minStrengthConfidence)
      .slice(0, config.primaryStrengthCount + config.secondaryStrengthCount)
      .map(([dimension, score]) => {
        const definition = strengthDefinitions[dimension] ?? {
          name: dimension,
          manifestation: 'Demonstrates strength in this dimension',
          evidence: [`Score of ${score.score}`],
        };

        return {
          name: definition.name,
          dimension,
          score: score.score,
          evidence: definition.evidence,
          manifestation: definition.manifestation,
          confidence: {
            score: score.confidence,
            level: this.confidenceToLevel(score.confidence),
          },
        };
      });
  }

  /**
   * Identify detailed weaknesses with risks.
   */
  identifyDetailedWeaknesses(
    result: AssessmentResult,
    config: ProfileGenerationConfig
  ): IdentifiedWeakness[] {
    const scores = Array.from(result.dimensionScores.entries());
    scores.sort((a, b) => a[1].score - b[1].score);

    const weaknessDefinitions: Record<
      string,
      { name: string; risk: string; developmentFocus: string; careerImpact: string }
    > = {
      socialOrientation: {
        name: 'Social Engagement',
        risk: 'May avoid networking opportunities and collaborative situations',
        developmentFocus: 'Practice structured networking and team participation',
        careerImpact: 'Could limit opportunities in people-facing roles',
      },
      riskTolerance: {
        name: 'Comfort with Uncertainty',
        risk: 'May miss growth opportunities by avoiding risk',
        developmentFocus: 'Start with small calculated risks',
        careerImpact: 'Could limit career advancement in dynamic fields',
      },
      structureNeed: {
        name: 'Structure Preference',
        risk: 'May struggle in ambiguous or rapidly changing environments',
        developmentFocus: 'Develop frameworks for handling uncertainty',
        careerImpact: 'Could limit fit in startups or creative roles',
      },
      recognitionDrive: {
        name: 'External Validation',
        risk: 'May become demotivated without external feedback',
        developmentFocus: 'Build internal motivation and self-assessment',
        careerImpact: 'Could impact satisfaction in behind-the-scenes roles',
      },
      achievementDrive: {
        name: 'Achievement Balance',
        risk: 'May experience burnout from relentless drive',
        developmentFocus: 'Practice sustainable pace and celebrate progress',
        careerImpact: 'Could lead to unsustainable work patterns',
      },
      flexibilityNeed: {
        name: 'Flexibility Preference',
        risk: 'May resist necessary structure and routine',
        developmentFocus: 'Develop systems that allow flexibility within structure',
        careerImpact: 'Could create challenges in highly regulated environments',
      },
    };

    return scores
      .filter(([, score]) => score.score <= 100 - config.minWeaknessConfidence)
      .slice(0, config.growthAreaCount)
      .map(([dimension, score]) => {
        const definition = weaknessDefinitions[dimension] ?? {
          name: `${dimension} Development`,
          risk: `May face challenges in situations requiring ${dimension}`,
          developmentFocus: `Build skills and comfort in ${dimension}`,
          careerImpact: `Could limit opportunities in ${dimension}-critical roles`,
        };

        return {
          name: definition.name,
          dimension,
          score: score.score,
          risk: definition.risk,
          developmentFocus: definition.developmentFocus,
          careerImpact: definition.careerImpact,
          confidence: {
            score: score.confidence,
            level: this.confidenceToLevel(score.confidence),
          },
        };
      });
  }

  /**
   * Determine archetype from dimension scores.
   */
  determineArchetype(result: AssessmentResult): StudentArchetype {
    const getScore = (d: string) => result.dimensionScores.get(d)?.score ?? 50;

    // Define archetypes with matching patterns
    const archetypes: ArchetypeDefinition[] = [
      {
        id: 'strategic-builder',
        name: 'Strategic Builder',
        description:
          'Combines analytical thinking with achievement drive to create structured solutions',
        dimensionPatterns: [
          { dimension: 'analyticalThinking', minScore: 65, maxScore: 100, weight: 30 },
          { dimension: 'achievementDrive', minScore: 65, maxScore: 100, weight: 30 },
          { dimension: 'systematicProcessing', minScore: 60, maxScore: 100, weight: 20 },
          { dimension: 'creativeProblemSolving', minScore: 50, maxScore: 100, weight: 20 },
        ],
        characteristics: [
          'Builds systematic solutions to complex problems',
          'Driven by tangible results and progress',
          'Balances creativity with practicality',
          'Thrives in goal-oriented environments',
        ],
        typicalStrengths: ['Analytical Thinking', 'Execution', 'Strategic Planning'],
        potentialChallenges: ['May over-engineer solutions', 'Can be impatient with ambiguity'],
      },
      {
        id: 'analytical-investigator',
        name: 'Analytical Investigator',
        description: 'Deep thinker who seeks to understand complex systems and phenomena',
        dimensionPatterns: [
          { dimension: 'analyticalThinking', minScore: 70, maxScore: 100, weight: 35 },
          { dimension: 'abstractReasoning', minScore: 65, maxScore: 100, weight: 25 },
          { dimension: 'masteryOrientation', minScore: 65, maxScore: 100, weight: 25 },
          { dimension: 'socialOrientation', minScore: 0, maxScore: 60, weight: 15 },
        ],
        characteristics: [
          'Dives deep into subjects of interest',
          'Values precision and accuracy',
          'Prefers independent deep work',
          'Seeks fundamental understanding',
        ],
        typicalStrengths: ['Deep Analysis', 'Research', 'Critical Thinking'],
        potentialChallenges: ['May overlook practical constraints', 'Can be perfectionistic'],
      },
      {
        id: 'mission-driven-leader',
        name: 'Mission-Driven Leader',
        description: 'Purpose-oriented individual who inspires others toward meaningful goals',
        dimensionPatterns: [
          { dimension: 'purposeAlignment', minScore: 70, maxScore: 100, weight: 30 },
          { dimension: 'influenceOrientation', minScore: 65, maxScore: 100, weight: 25 },
          { dimension: 'impactValues', minScore: 70, maxScore: 100, weight: 25 },
          { dimension: 'achievementDrive', minScore: 60, maxScore: 100, weight: 20 },
        ],
        characteristics: [
          'Driven by impact and contribution',
          'Naturally influences and motivates others',
          'Aligns actions with core values',
          'Sees the bigger picture',
        ],
        typicalStrengths: ['Vision', 'Influence', 'Purpose-Driven Action'],
        potentialChallenges: ['May prioritize mission over pragmatism', 'Can be demanding'],
      },
      {
        id: 'independent-creator',
        name: 'Independent Creator',
        description: 'Creative innovator who thrives on autonomy and original thinking',
        dimensionPatterns: [
          { dimension: 'creativeProblemSolving', minScore: 70, maxScore: 100, weight: 30 },
          { dimension: 'autonomyNeed', minScore: 70, maxScore: 100, weight: 30 },
          { dimension: 'independencePreference', minScore: 70, maxScore: 100, weight: 25 },
          { dimension: 'patternRecognition', minScore: 60, maxScore: 100, weight: 15 },
        ],
        characteristics: [
          'Generates original ideas and approaches',
          'Needs freedom to experiment',
          'Thrives with minimal oversight',
          'Connects disparate concepts',
        ],
        typicalStrengths: ['Creativity', 'Innovation', 'Independent Thinking'],
        potentialChallenges: ['May resist necessary structure', 'Can overlook implementation details'],
      },
      {
        id: 'systems-thinker',
        name: 'Systems Thinker',
        description: 'Holistic problem solver who sees connections and interdependencies',
        dimensionPatterns: [
          { dimension: 'patternRecognition', minScore: 70, maxScore: 100, weight: 30 },
          { dimension: 'analyticalThinking', minScore: 65, maxScore: 100, weight: 25 },
          { dimension: 'abstractReasoning', minScore: 65, maxScore: 100, weight: 25 },
          { dimension: 'criticalEvaluation', minScore: 60, maxScore: 100, weight: 20 },
        ],
        characteristics: [
          'Sees patterns and connections others miss',
          'Understands complex interdependencies',
          'Thinks at multiple levels simultaneously',
          'Questions underlying assumptions',
        ],
        typicalStrengths: ['Systems Analysis', 'Pattern Recognition', 'Strategic Thinking'],
        potentialChallenges: ['May get lost in complexity', 'Can overthink decisions'],
      },
      {
        id: 'adaptive-explorer',
        name: 'Adaptive Explorer',
        description: 'Versatile learner who embraces change and new experiences',
        dimensionPatterns: [
          { dimension: 'varietyNeed', minScore: 70, maxScore: 100, weight: 25 },
          { dimension: 'explorationOpenness', minScore: 70, maxScore: 100, weight: 25 },
          { dimension: 'ambiguityTolerance', minScore: 65, maxScore: 100, weight: 25 },
          { dimension: 'learning', minScore: 65, maxScore: 100, weight: 25 },
        ],
        characteristics: [
          'Embraces new challenges and experiences',
          'Adapts quickly to changing circumstances',
          'Learns continuously from diverse sources',
          'Comfortable with uncertainty',
        ],
        typicalStrengths: ['Adaptability', 'Learning Agility', 'Versatility'],
        potentialChallenges: ['May lack depth in specific areas', 'Can struggle with commitment'],
      },
      {
        id: 'collaborative-harmonizer',
        name: 'Collaborative Harmonizer',
        description: 'People-oriented individual who builds bridges and fosters teamwork',
        dimensionPatterns: [
          { dimension: 'socialOrientation', minScore: 70, maxScore: 100, weight: 30 },
          { dimension: 'collaborationPreference', minScore: 70, maxScore: 100, weight: 25 },
          { dimension: 'empathyLevel', minScore: 65, maxScore: 100, weight: 25 },
          { dimension: 'teamOrientation', minScore: 65, maxScore: 100, weight: 20 },
        ],
        characteristics: [
          'Builds strong relationships naturally',
          'Facilitates collaboration and consensus',
          'Attuned to group dynamics',
          'Values harmony and inclusion',
        ],
        typicalStrengths: ['Relationship Building', 'Collaboration', 'Empathy'],
        potentialChallenges: ['May avoid necessary conflict', 'Can be influenced by others'],
      },
      {
        id: 'steady-achiever',
        name: 'Steady Achiever',
        description: 'Reliable performer who delivers consistent results through discipline',
        dimensionPatterns: [
          { dimension: 'stabilityPreference', minScore: 65, maxScore: 100, weight: 25 },
          { dimension: 'achievementDrive', minScore: 60, maxScore: 100, weight: 25 },
          { dimension: 'systematicProcessing', minScore: 65, maxScore: 100, weight: 25 },
          { dimension: 'securityNeed', minScore: 60, maxScore: 100, weight: 25 },
        ],
        characteristics: [
          'Delivers consistent, reliable results',
          'Thrives with clear expectations',
          'Builds expertise methodically',
          'Values stability and predictability',
        ],
        typicalStrengths: ['Reliability', 'Consistency', 'Methodical Approach'],
        potentialChallenges: ['May resist change', 'Can be risk-averse'],
      },
    ];

    // Calculate match scores
    const scoredArchetypes = archetypes.map((archetype) => ({
      archetype,
      score: this.calculateArchetypeMatch(archetype, getScore),
    }));

    scoredArchetypes.sort((a, b) => b.score - a.score);

    const bestMatch = scoredArchetypes[0]!;

    return {
      id: bestMatch.archetype.id,
      name: bestMatch.archetype.name,
      description: bestMatch.archetype.description,
      characteristics: bestMatch.archetype.characteristics,
      typicalStrengths: bestMatch.archetype.typicalStrengths,
      potentialChallenges: bestMatch.archetype.potentialChallenges,
      matchScore: Math.round(bestMatch.score),
      confidence: {
        score: Math.round(bestMatch.score),
        level: this.confidenceToLevel(bestMatch.score),
      },
    };
  }

  /**
   * Calculate match score for an archetype.
   */
  private calculateArchetypeMatch(
    archetype: ArchetypeDefinition,
    getScore: (dimension: string) => number
  ): number {
    let totalScore = 0;
    let totalWeight = 0;

    for (const pattern of archetype.dimensionPatterns) {
      const score = getScore(pattern.dimension);
      let matchScore = 0;

      if (score >= pattern.minScore && score <= pattern.maxScore) {
        // Full match within range
        const range = pattern.maxScore - pattern.minScore;
        const distanceFromCenter = Math.abs(score - (pattern.minScore + pattern.maxScore) / 2);
        matchScore = 100 - (distanceFromCenter / (range / 2)) * 20;
      } else if (score < pattern.minScore) {
        // Below range
        matchScore = Math.max(0, 100 - (pattern.minScore - score) * 2);
      } else {
        // Above range (still good, just not distinguishing)
        matchScore = 90;
      }

      totalScore += matchScore * pattern.weight;
      totalWeight += pattern.weight;
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Convert numeric confidence to level.
   */
  private confidenceToLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (score >= 70) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
  }
}

/**
 * Factory function for ProfileInterpreter.
 */
export function createProfileInterpreter(): ProfileInterpreter {
  return new ProfileInterpreter();
}
