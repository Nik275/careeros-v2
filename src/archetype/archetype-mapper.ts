/**
 * CareerOS Archetype Detection Engine - Mapper
 *
 * Phase 1.2: Archetype Detection Engine
 *
 * Maps student profile data and assessments to archetype signals.
 *
 * @module archetype-mapper
 * @version 1.0.0
 */

import type { ArchetypeType, ArchetypeTraitIndicators } from '@/types/archetype-profile';
import type {
  ArchetypeSignal,
  ArchetypeSignalCollection,
  ArchetypeDetectionInput,
  SignalSource,
  SignalModifier,
} from './archetype-types';

/**
 * Mapper for extracting archetype signals from profile data.
 */
export class ArchetypeMapper {
  /**
   * Maps all available data to archetype signals.
   *
   * @param input - Detection input
   * @returns Array of signal collections (one per archetype)
   */
  mapToSignals(input: ArchetypeDetectionInput): ArchetypeSignalCollection[] {
    const allSignals: ArchetypeSignal[] = [];

    // Map cognitive assessment
    if (input.assessments?.cognitive) {
      allSignals.push(...this.mapCognitiveAssessment(input.assessments.cognitive));
    }

    // Map interest assessment
    if (input.assessments?.interest) {
      allSignals.push(...this.mapInterestAssessment(input.assessments.interest));
    }

    // Map values assessment
    if (input.assessments?.values) {
      allSignals.push(...this.mapValuesAssessment(input.assessments.values));
    }

    // Map behavioral assessment
    if (input.assessments?.behavioral) {
      allSignals.push(...this.mapBehavioralAssessment(input.assessments.behavioral));
    }

    // Map profile insights
    if (input.profileInsights) {
      allSignals.push(...this.mapProfileInsights(input.profileInsights));
    }

    // Map explicit preferences
    if (input.explicitPreferences) {
      allSignals.push(...this.mapExplicitPreferences(input.explicitPreferences));
    }

    // Map student profile
    allSignals.push(...this.mapStudentProfile(input.studentProfile));

    // Group signals by archetype
    return this.groupSignalsByArchetype(allSignals);
  }

  /**
   * Maps cognitive assessment to signals.
   *
   * @param cognitive - Cognitive assessment result
   * @returns Array of archetype signals
   */
  private mapCognitiveAssessment(
    cognitive: import('@/assessment-intelligence/assessment-types').CognitiveAssessmentResult
  ): ArchetypeSignal[] {
    const signals: ArchetypeSignal[] = [];

    // BUILDER: High analytical + systematic
    if (cognitive.analyticalReasoning?.score ?? 0 > 70) {
      signals.push({
        archetype: 'BUILDER',
        strength: cognitive.analyticalReasoning.score,
        source: 'COGNITIVE_ASSESSMENT',
        description: 'Strong analytical reasoning indicates builder potential',
        weight: 1.0,
      });
    }

    // RESEARCHER: High analytical + problem solving
    if ((cognitive.analyticalReasoning?.score ?? 0) > 65 &&
        (cognitive.problemSolving?.score ?? 0) > 65) {
      signals.push({
        archetype: 'RESEARCHER',
        strength: Math.round((cognitive.analyticalReasoning.score! + cognitive.problemSolving.score!) / 2),
        source: 'COGNITIVE_ASSESSMENT',
        description: 'Strong analytical and problem-solving abilities indicate research orientation',
        weight: 1.0,
      });
    }

    // STRATEGIST: High pattern recognition + abstract reasoning
    if ((cognitive.abstractReasoning?.score ?? 0) > 70) {
      signals.push({
        archetype: 'STRATEGIST',
        strength: cognitive.abstractReasoning.score,
        source: 'COGNITIVE_ASSESSMENT',
        description: 'Strong abstract reasoning indicates strategic thinking',
        weight: 0.9,
      });
    }

    // CREATOR: High creative thinking
    if (cognitive.creativeThinking?.score ?? 0 > 70) {
      signals.push({
        archetype: 'CREATOR',
        strength: cognitive.creativeThinking.score,
        source: 'COGNITIVE_ASSESSMENT',
        description: 'Strong creative thinking indicates creator archetype',
        weight: 1.0,
      });
    }

    // OPERATOR: High detail orientation + processing speed
    if ((cognitive.attentionToDetail?.score ?? 0) > 70) {
      signals.push({
        archetype: 'OPERATOR',
        strength: cognitive.attentionToDetail.score,
        source: 'COGNITIVE_ASSESSMENT',
        description: 'Strong attention to detail indicates operator orientation',
        weight: 0.9,
      });
    }

    // CRAFTSMAN: High detail + analytical
    if ((cognitive.attentionToDetail?.score ?? 0) > 65 &&
        (cognitive.analyticalReasoning?.score ?? 0) > 65) {
      signals.push({
        archetype: 'CRAFTSMAN',
        strength: Math.round((cognitive.attentionToDetail.score! + cognitive.analyticalReasoning.score!) / 2),
        source: 'COGNITIVE_ASSESSMENT',
        description: 'Precision + analysis indicates craftsman orientation',
        weight: 0.9,
      });
    }

    return signals;
  }

  /**
   * Maps interest assessment to signals.
   *
   * @param interest - Interest assessment result
   * @returns Array of archetype signals
   */
  private mapInterestAssessment(
    interest: import('@/assessment-intelligence/assessment-types').InterestAssessmentResult
  ): ArchetypeSignal[] {
    const signals: ArchetypeSignal[] = [];

    // BUILDER: Interest in things + technical
    if ((interest.interestInThings?.score ?? 0) > 70 &&
        (interest.interestInTechnical ?? 0) > 60) {
      signals.push({
        archetype: 'BUILDER',
        strength: Math.round((interest.interestInThings.score! + interest.interestInTechnical) / 2),
        source: 'INTEREST_ASSESSMENT',
        description: 'Interest in technical/thing-oriented work',
        weight: 0.9,
      });
    }

    // RESEARCHER: Interest in investigation + data
    if ((interest.interestInInvestigation?.score ?? 0) > 70) {
      signals.push({
        archetype: 'RESEARCHER',
        strength: interest.interestInInvestigation.score,
        source: 'INTEREST_ASSESSMENT',
        description: 'Strong investigative interest',
        weight: 0.9,
      });
    }

    // CREATOR: Interest in artistic + creative
    if ((interest.interestInArtistic?.score ?? 0) > 70) {
      signals.push({
        archetype: 'CREATOR',
        strength: interest.interestInArtistic.score,
        source: 'INTEREST_ASSESSMENT',
        description: 'Strong artistic/creative interest',
        weight: 1.0,
      });
    }

    // LEADER: Interest in enterprising + social
    if ((interest.interestInEnterprising?.score ?? 0) > 70) {
      signals.push({
        archetype: 'LEADER',
        strength: interest.interestInEnterprising.score,
        source: 'INTEREST_ASSESSMENT',
        description: 'Enterprising interest indicates leadership orientation',
        weight: 0.9,
      });
    }

    // EXPLORER: Interest in realistic + investigative (broad)
    if ((interest.interestInRealistic?.score ?? 0) > 60 &&
        (interest.interestInInvestigation?.score ?? 0) > 60) {
      signals.push({
        archetype: 'EXPLORER',
        strength: Math.round((interest.interestInRealistic.score! + interest.interestInInvestigation.score!) / 2),
        source: 'INTEREST_ASSESSMENT',
        description: 'Broad exploratory interests',
        weight: 0.8,
      });
    }

    // TEACHER: Interest in social + conventional (knowledge sharing)
    if ((interest.interestInSocial?.score ?? 0) > 70) {
      signals.push({
        archetype: 'TEACHER',
        strength: interest.interestInSocial.score,
        source: 'INTEREST_ASSESSMENT',
        description: 'Social interest with educational orientation',
        weight: 0.85,
      });
    }

    // PROTECTOR: Interest in conventional + social (service)
    if ((interest.interestInConventional?.score ?? 0) > 60 &&
        (interest.interestInSocial?.score ?? 0) > 60) {
      signals.push({
        archetype: 'PROTECTOR',
        strength: Math.round((interest.interestInConventional.score! + interest.interestInSocial.score!) / 2),
        source: 'INTEREST_ASSESSMENT',
        description: 'Service-oriented conventional interests',
        weight: 0.8,
      });
    }

    return signals;
  }

  /**
   * Maps values assessment to signals.
   *
   * @param values - Values assessment result
   * @returns Array of archetype signals
   */
  private mapValuesAssessment(
    values: import('@/assessment-intelligence/assessment-types').ValuesAssessmentResult
  ): ArchetypeSignal[] {
    const signals: ArchetypeSignal[] = [];

    // FOUNDER: High autonomy + achievement
    if ((values.autonomy?.score ?? 0) > 75) {
      signals.push({
        archetype: 'FOUNDER',
        strength: values.autonomy.score,
        source: 'VALUE_ASSESSMENT',
        description: 'High value on autonomy indicates founder orientation',
        weight: 1.0,
      });
    }

    // BUILDER: High achievement + recognition
    if ((values.achievement?.score ?? 0) > 70) {
      signals.push({
        archetype: 'BUILDER',
        strength: values.achievement.score,
        source: 'VALUE_ASSESSMENT',
        description: 'Achievement-oriented values',
        weight: 0.85,
      });
    }

    // RESEARCHER: High knowledge + intrinsic
    if ((values.knowledge?.score ?? 0) > 70) {
      signals.push({
        archetype: 'RESEARCHER',
        strength: values.knowledge.score,
        source: 'VALUE_ASSESSMENT',
        description: 'Knowledge-seeking values',
        weight: 0.95,
      });
    }

    // PROTECTOR: High security + helping
    if ((values.security?.score ?? 0) > 70) {
      signals.push({
        archetype: 'PROTECTOR',
        strength: values.security.score,
        source: 'VALUE_ASSESSMENT',
        description: 'Security-focused values',
        weight: 0.9,
      });
    }

    // LEADER: High influence + status
    if ((values.influence?.score ?? 0) > 70 || (values.recognition?.score ?? 0) > 70) {
      signals.push({
        archetype: 'LEADER',
        strength: Math.max(values.influence?.score ?? 0, values.recognition?.score ?? 0),
        source: 'VALUE_ASSESSMENT',
        description: 'Influence and recognition values',
        weight: 0.9,
      });
    }

    // TEACHER: High helping + altruism
    if ((values.altruism?.score ?? 0) > 70) {
      signals.push({
        archetype: 'TEACHER',
        strength: values.altruism.score,
        source: 'VALUE_ASSESSMENT',
        description: 'Altruistic/helping values',
        weight: 0.9,
      });
    }

    // STRATEGIST: High challenge + problem solving
    if ((values.challenge?.score ?? 0) > 70) {
      signals.push({
        archetype: 'STRATEGIST',
        strength: values.challenge.score,
        source: 'VALUE_ASSESSMENT',
        description: 'Challenge-seeking values',
        weight: 0.85,
      });
    }

    // EXPLORER: High variety + adventure
    if ((values.variety?.score ?? 0) > 70) {
      signals.push({
        archetype: 'EXPLORER',
        strength: values.variety.score,
        source: 'VALUE_ASSESSMENT',
        description: 'Variety-seeking values',
        weight: 0.9,
      });
    }

    // CRAFTSMAN: High mastery + excellence
    if ((values.mastery?.score ?? 0) > 70) {
      signals.push({
        archetype: 'CRAFTSMAN',
        strength: values.mastery.score,
        source: 'VALUE_ASSESSMENT',
        description: 'Mastery-oriented values',
        weight: 1.0,
      });
    }

    return signals;
  }

  /**
   * Maps behavioral assessment to signals.
   *
   * @param behavioral - Behavioral assessment result
   * @returns Array of archetype signals
   */
  private mapBehavioralAssessment(
    behavioral: import('@/assessment-intelligence/assessment-types').BehavioralAssessmentResult
  ): ArchetypeSignal[] {
    const signals: ArchetypeSignal[] = [];

    // FOUNDER: High risk tolerance + proactivity
    if ((behavioral.riskTolerance?.score ?? 0) > 70) {
      signals.push({
        archetype: 'FOUNDER',
        strength: behavioral.riskTolerance.score,
        source: 'BEHAVIORAL_ASSESSMENT',
        description: 'High risk tolerance indicates founder potential',
        weight: 0.95,
      });
    }

    // OPERATOR: High conscientiousness + reliability
    if ((behavioral.conscientiousness?.score ?? 0) > 70) {
      signals.push({
        archetype: 'OPERATOR',
        strength: behavioral.conscientiousness.score,
        source: 'BEHAVIORAL_ASSESSMENT',
        description: 'High conscientiousness indicates operational excellence',
        weight: 0.9,
      });
    }

    // LEADER: High extraversion + assertiveness
    if ((behavioral.extraversion?.score ?? 0) > 70) {
      signals.push({
        archetype: 'LEADER',
        strength: behavioral.extraversion.score,
        source: 'BEHAVIORAL_ASSESSMENT',
        description: 'Social orientation indicates leadership potential',
        weight: 0.85,
      });
    }

    // EXPLORER: High openness + adaptability
    if ((behavioral.openness?.score ?? 0) > 70) {
      signals.push({
        archetype: 'EXPLORER',
        strength: behavioral.openness.score,
        source: 'BEHAVIORAL_ASSESSMENT',
        description: 'Openness to experience indicates exploratory nature',
        weight: 0.9,
      });
    }

    // PROTECTOR: High agreeableness + stability
    if ((behavioral.agreeableness?.score ?? 0) > 70) {
      signals.push({
        archetype: 'PROTECTOR',
        strength: behavioral.agreeableness.score,
        source: 'BEHAVIORAL_ASSESSMENT',
        description: 'Cooperative nature indicates protective/service orientation',
        weight: 0.8,
      });
    }

    // STRATEGIST: High openness + conscientiousness
    if ((behavioral.openness?.score ?? 0) > 65 &&
        (behavioral.conscientiousness?.score ?? 0) > 65) {
      signals.push({
        archetype: 'STRATEGIST',
        strength: Math.round((behavioral.openness.score! + behavioral.conscientiousness.score!) / 2),
        source: 'BEHAVIORAL_ASSESSMENT',
        description: 'Strategic combination of openness and conscientiousness',
        weight: 0.85,
      });
    }

    return signals;
  }

  /**
   * Maps profile insights to signals.
   *
   * @param insights - Profile insights
   * @returns Array of archetype signals
   */
  private mapProfileInsights(
    insights: import('@/profile-generator/profile-types').ProfileInsights
  ): ArchetypeSignal[] {
    const signals: ArchetypeSignal[] = [];

    // Map key insights to archetypes based on themes
    if (insights.keyInsights) {
      for (const insight of insights.keyInsights) {
        const archetype = this.inferArchetypeFromText(insight);
        if (archetype) {
          signals.push({
            archetype,
            strength: 60,
            source: 'PROFILE_INSIGHT',
            description: insight.substring(0, 100),
            weight: 0.7,
          });
        }
      }
    }

    return signals;
  }

  /**
   * Maps explicit preferences to signals.
   *
   * @param preferences - Explicit preferences
   * @returns Array of archetype signals
   */
  private mapExplicitPreferences(
    preferences: {
      readonly preferredArchetypes?: ArchetypeType[];
      readonly rejectedArchetypes?: ArchetypeType[];
    }
  ): ArchetypeSignal[] {
    const signals: ArchetypeSignal[] = [];

    // Positive signals for preferred archetypes
    if (preferences.preferredArchetypes) {
      for (const archetype of preferences.preferredArchetypes) {
        signals.push({
          archetype,
          strength: 75,
          source: 'PREFERENCE_ASSESSMENT',
          description: 'Explicitly preferred by student',
          weight: 0.8,
        });
      }
    }

    // Negative signals for rejected archetypes
    if (preferences.rejectedArchetypes) {
      for (const archetype of preferences.rejectedArchetypes) {
        signals.push({
          archetype,
          strength: 20,
          source: 'PREFERENCE_ASSESSMENT',
          description: 'Explicitly rejected by student',
          weight: 0.8,
        });
      }
    }

    return signals;
  }

  /**
   * Maps student profile to signals.
   *
   * @param profile - Student life profile
   * @returns Array of archetype signals
   */
  private mapStudentProfile(
    profile: import('@/types/student-profile').StudentLifeProfile
  ): ArchetypeSignal[] {
    const signals: ArchetypeSignal[] = [];

    // Work style preferences
    if (profile.workStyle) {
      // FOUNDER: High autonomy preference
      if (profile.workStyle.preferenceForAutonomy > 70) {
        signals.push({
          archetype: 'FOUNDER',
          strength: profile.workStyle.preferenceForAutonomy,
          source: 'DEMOGRAPHIC',
          description: 'Strong preference for autonomy',
          weight: 0.7,
        });
      }

      // EXPLORER: High flexibility preference
      if (profile.workStyle.preferenceForFlexibility > 70) {
        signals.push({
          archetype: 'EXPLORER',
          strength: profile.workStyle.preferenceForFlexibility,
          source: 'DEMOGRAPHIC',
          description: 'Preference for flexibility indicates exploratory nature',
          weight: 0.6,
        });
      }

      // CREATOR: High creative preference
      if (profile.workStyle.preferenceForCreative > 70) {
        signals.push({
          archetype: 'CREATOR',
          strength: profile.workStyle.preferenceForCreative,
          source: 'DEMOGRAPHIC',
          description: 'Strong creative preference',
          weight: 0.75,
        });
      }

      // STRATEGIST: High analytical preference
      if (profile.workStyle.preferenceForAnalytical > 70) {
        signals.push({
          archetype: 'STRATEGIST',
          strength: profile.workStyle.preferenceForAnalytical,
          source: 'DEMOGRAPHIC',
          description: 'Strong analytical preference',
          weight: 0.7,
        });
      }
    }

    // Social profile
    if (profile.socialProfile) {
      // LEADER: High social preference + leadership
      if (profile.socialProfile.socialPreference > 70) {
        signals.push({
          archetype: 'LEADER',
          strength: profile.socialProfile.socialPreference,
          source: 'DEMOGRAPHIC',
          description: 'Social orientation indicates leadership potential',
          weight: 0.65,
        });
      }
    }

    // Personal preferences
    if (profile.personalPreferences) {
      // PROTECTOR: High financial stability priority
      if (profile.personalPreferences.financialStabilityPriority > 75) {
        signals.push({
          archetype: 'PROTECTOR',
          strength: profile.personalPreferences.financialStabilityPriority,
          source: 'DEMOGRAPHIC',
          description: 'High priority on stability',
          weight: 0.6,
        });
      }

      // FOUNDER: High impact priority (entrepreneurial)
      if (profile.personalPreferences.impactPriority > 75) {
        signals.push({
          archetype: 'FOUNDER',
          strength: profile.personalPreferences.impactPriority,
          source: 'DEMOGRAPHIC',
          description: 'High impact drive indicates founder potential',
          weight: 0.65,
        });
      }

      // RESEARCHER/TEACHER: High growth priority
      if (profile.personalPreferences.growthPriority > 75) {
        signals.push({
          archetype: 'RESEARCHER',
          strength: profile.personalPreferences.growthPriority,
          source: 'DEMOGRAPHIC',
          description: 'Growth orientation indicates research/teaching interest',
          weight: 0.6,
        });
      }
    }

    return signals;
  }

  /**
   * Infers archetype from text insight.
   *
   * @param text - Insight text
   * @returns Detected archetype or undefined
   */
  private inferArchetypeFromText(text: string): ArchetypeType | undefined {
    const lowerText = text.toLowerCase();

    const indicators: Record<ArchetypeType, string[]> = {
      BUILDER: ['build', 'create', 'system', 'product', 'technical'],
      RESEARCHER: ['research', 'understand', 'analyze', 'investigate', 'study'],
      CREATOR: ['creative', 'artistic', 'design', 'express', 'innovate'],
      OPERATOR: ['execute', 'process', 'reliable', 'organize', 'efficient'],
      LEADER: ['lead', 'influence', 'team', 'direct', 'guide'],
      EXPLORER: ['explore', 'discover', 'novel', 'adventure', 'variety'],
      TEACHER: ['teach', 'mentor', 'explain', 'educate', 'guide'],
      PROTECTOR: ['protect', 'secure', 'help', 'care', 'service'],
      STRATEGIST: ['strategy', 'plan', 'optimize', 'system', 'long-term'],
      FOUNDER: ['founder', 'entrepreneur', 'start', 'independent', 'autonomy'],
      CRAFTSMAN: ['craft', 'master', 'skill', 'quality', 'excellence'],
    };

    let bestMatch: ArchetypeType | undefined;
    let bestScore = 0;

    for (const [archetype, keywords] of Object.entries(indicators)) {
      const score = keywords.filter((keyword) => lowerText.includes(keyword)).length;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = archetype as ArchetypeType;
      }
    }

    return bestScore >= 2 ? bestMatch : undefined;
  }

  /**
   * Groups signals by archetype.
   *
   * @param signals - All signals
   * @returns Signal collections grouped by archetype
   */
  private groupSignalsByArchetype(
    signals: ArchetypeSignal[]
  ): ArchetypeSignalCollection[] {
    const grouped = new Map<ArchetypeType, ArchetypeSignal[]>();

    for (const signal of signals) {
      const existing = grouped.get(signal.archetype) ?? [];
      existing.push(signal);
      grouped.set(signal.archetype, existing);
    }

    return Array.from(grouped.entries()).map(([archetype, archetypeSignals]) =>
      this.createSignalCollection(archetype, archetypeSignals)
    );
  }

  /**
   * Creates a signal collection.
   *
   * @param archetype - The archetype
   * @param signals - Signals for this archetype
   * @returns Signal collection
   */
  private createSignalCollection(
    archetype: ArchetypeType,
    signals: ArchetypeSignal[]
  ): ArchetypeSignalCollection {
    const weightedSum = signals.reduce(
      (sum, signal) => sum + signal.strength * signal.weight,
      0
    );

    const totalWeight = signals.reduce(
      (sum, signal) => sum + signal.weight,
      0
    );

    const signalCountBySource = signals.reduce((acc, signal) => {
      acc[signal.source] = (acc[signal.source] ?? 0) + 1;
      return acc;
    }, {} as Record<SignalSource, number>);

    return {
      archetype,
      signals,
      weightedSum,
      totalWeight,
      signalCountBySource,
    };
  }

  /**
   * Applies signal modifiers.
   *
   * @param collections - Signal collections
   * @param modifiers - Modifiers to apply
   * @param input - Detection input (for conditions)
   * @returns Modified collections
   */
  applyModifiers(
    collections: ArchetypeSignalCollection[],
    modifiers: SignalModifier[],
    input: ArchetypeDetectionInput
  ): ArchetypeSignalCollection[] {
    return collections.map((collection) => {
      let modifiedSum = collection.weightedSum;

      for (const modifier of modifiers) {
        if (
          modifier.archetypes.includes(collection.archetype) &&
          modifier.condition(input)
        ) {
          modifiedSum *= modifier.multiplier;
        }
      }

      return {
        ...collection,
        weightedSum: modifiedSum,
      };
    });
  }
}

/**
 * Creates default archetype mapper.
 *
 * @returns New ArchetypeMapper instance
 */
export function createArchetypeMapper(): ArchetypeMapper {
  return new ArchetypeMapper();
}
