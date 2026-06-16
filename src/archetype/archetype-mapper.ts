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

import type { ArchetypeType } from '@/types/archetype-profile';
import type {
  ArchetypeSignal,
  ArchetypeSignalCollection,
  ArchetypeDetectionInput,
  SignalSource,
  SignalModifier,
  CognitiveAssessmentResult,
  InterestAssessmentResult,
  ValuesAssessmentResult,
  BehavioralAssessmentResult,
  ArchetypeAssessmentScore,
  ArchetypeProfileInsights,
  ArchetypeStudentLifeProfile,
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
    cognitive: CognitiveAssessmentResult
  ): ArchetypeSignal[] {
    const signals: ArchetypeSignal[] = [];
    const analyticalReasoning = scoreOf(cognitive.analyticalReasoning);
    const problemSolving = scoreOf(cognitive.problemSolving);
    const abstractReasoning = scoreOf(cognitive.abstractReasoning);
    const creativeThinking = scoreOf(cognitive.creativeThinking);
    const attentionToDetail = scoreOf(cognitive.attentionToDetail);

    // BUILDER: High analytical + systematic
    if (analyticalReasoning > 70) {
      signals.push({
        archetype: 'BUILDER',
        strength: analyticalReasoning,
        source: 'COGNITIVE_ASSESSMENT',
        description: 'Strong analytical reasoning indicates builder potential',
        weight: 1.0,
      });
    }

    // RESEARCHER: High analytical + problem solving
    if (analyticalReasoning > 65 && problemSolving > 65) {
      signals.push({
        archetype: 'RESEARCHER',
        strength: Math.round((analyticalReasoning + problemSolving) / 2),
        source: 'COGNITIVE_ASSESSMENT',
        description: 'Strong analytical and problem-solving abilities indicate research orientation',
        weight: 1.0,
      });
    }

    // STRATEGIST: High pattern recognition + abstract reasoning
    if (abstractReasoning > 70) {
      signals.push({
        archetype: 'STRATEGIST',
        strength: abstractReasoning,
        source: 'COGNITIVE_ASSESSMENT',
        description: 'Strong abstract reasoning indicates strategic thinking',
        weight: 0.9,
      });
    }

    // CREATOR: High creative thinking
    if (creativeThinking > 70) {
      signals.push({
        archetype: 'CREATOR',
        strength: creativeThinking,
        source: 'COGNITIVE_ASSESSMENT',
        description: 'Strong creative thinking indicates creator archetype',
        weight: 1.0,
      });
    }

    // OPERATOR: High detail orientation + processing speed
    if (attentionToDetail > 70) {
      signals.push({
        archetype: 'OPERATOR',
        strength: attentionToDetail,
        source: 'COGNITIVE_ASSESSMENT',
        description: 'Strong attention to detail indicates operator orientation',
        weight: 0.9,
      });
    }

    // CRAFTSMAN: High detail + analytical
    if (attentionToDetail > 65 && analyticalReasoning > 65) {
      signals.push({
        archetype: 'CRAFTSMAN',
        strength: Math.round((attentionToDetail + analyticalReasoning) / 2),
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
    interest: InterestAssessmentResult
  ): ArchetypeSignal[] {
    const signals: ArchetypeSignal[] = [];
    const interestInThings = scoreOf(interest.interestInThings);
    const interestInTechnical = interest.interestInTechnical ?? 0;
    const interestInInvestigation = scoreOf(interest.interestInInvestigation);
    const interestInArtistic = scoreOf(interest.interestInArtistic);
    const interestInEnterprising = scoreOf(interest.interestInEnterprising);
    const interestInRealistic = scoreOf(interest.interestInRealistic);
    const interestInSocial = scoreOf(interest.interestInSocial);
    const interestInConventional = scoreOf(interest.interestInConventional);

    // BUILDER: Interest in things + technical
    if (interestInThings > 70 && interestInTechnical > 60) {
      signals.push({
        archetype: 'BUILDER',
        strength: Math.round((interestInThings + interestInTechnical) / 2),
        source: 'INTEREST_ASSESSMENT',
        description: 'Interest in technical/thing-oriented work',
        weight: 0.9,
      });
    }

    // RESEARCHER: Interest in investigation + data
    if (interestInInvestigation > 70) {
      signals.push({
        archetype: 'RESEARCHER',
        strength: interestInInvestigation,
        source: 'INTEREST_ASSESSMENT',
        description: 'Strong investigative interest',
        weight: 0.9,
      });
    }

    // CREATOR: Interest in artistic + creative
    if (interestInArtistic > 70) {
      signals.push({
        archetype: 'CREATOR',
        strength: interestInArtistic,
        source: 'INTEREST_ASSESSMENT',
        description: 'Strong artistic/creative interest',
        weight: 1.0,
      });
    }

    // LEADER: Interest in enterprising + social
    if (interestInEnterprising > 70) {
      signals.push({
        archetype: 'LEADER',
        strength: interestInEnterprising,
        source: 'INTEREST_ASSESSMENT',
        description: 'Enterprising interest indicates leadership orientation',
        weight: 0.9,
      });
    }

    // EXPLORER: Interest in realistic + investigative (broad)
    if (interestInRealistic > 60 && interestInInvestigation > 60) {
      signals.push({
        archetype: 'EXPLORER',
        strength: Math.round((interestInRealistic + interestInInvestigation) / 2),
        source: 'INTEREST_ASSESSMENT',
        description: 'Broad exploratory interests',
        weight: 0.8,
      });
    }

    // TEACHER: Interest in social + conventional (knowledge sharing)
    if (interestInSocial > 70) {
      signals.push({
        archetype: 'TEACHER',
        strength: interestInSocial,
        source: 'INTEREST_ASSESSMENT',
        description: 'Social interest with educational orientation',
        weight: 0.85,
      });
    }

    // PROTECTOR: Interest in conventional + social (service)
    if (interestInConventional > 60 && interestInSocial > 60) {
      signals.push({
        archetype: 'PROTECTOR',
        strength: Math.round((interestInConventional + interestInSocial) / 2),
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
    values: ValuesAssessmentResult
  ): ArchetypeSignal[] {
    const signals: ArchetypeSignal[] = [];
    const autonomy = scoreOf(values.autonomy);
    const achievement = scoreOf(values.achievement);
    const knowledge = scoreOf(values.knowledge);
    const security = scoreOf(values.security);
    const influence = scoreOf(values.influence);
    const recognition = scoreOf(values.recognition);
    const altruism = scoreOf(values.altruism);
    const challenge = scoreOf(values.challenge);
    const variety = scoreOf(values.variety);
    const mastery = scoreOf(values.mastery);

    // FOUNDER: High autonomy + achievement
    if (autonomy > 75) {
      signals.push({
        archetype: 'FOUNDER',
        strength: autonomy,
        source: 'VALUE_ASSESSMENT',
        description: 'High value on autonomy indicates founder orientation',
        weight: 1.0,
      });
    }

    // BUILDER: High achievement + recognition
    if (achievement > 70) {
      signals.push({
        archetype: 'BUILDER',
        strength: achievement,
        source: 'VALUE_ASSESSMENT',
        description: 'Achievement-oriented values',
        weight: 0.85,
      });
    }

    // RESEARCHER: High knowledge + intrinsic
    if (knowledge > 70) {
      signals.push({
        archetype: 'RESEARCHER',
        strength: knowledge,
        source: 'VALUE_ASSESSMENT',
        description: 'Knowledge-seeking values',
        weight: 0.95,
      });
    }

    // PROTECTOR: High security + helping
    if (security > 70) {
      signals.push({
        archetype: 'PROTECTOR',
        strength: security,
        source: 'VALUE_ASSESSMENT',
        description: 'Security-focused values',
        weight: 0.9,
      });
    }

    // LEADER: High influence + status
    if (influence > 70 || recognition > 70) {
      signals.push({
        archetype: 'LEADER',
        strength: Math.max(influence, recognition),
        source: 'VALUE_ASSESSMENT',
        description: 'Influence and recognition values',
        weight: 0.9,
      });
    }

    // TEACHER: High helping + altruism
    if (altruism > 70) {
      signals.push({
        archetype: 'TEACHER',
        strength: altruism,
        source: 'VALUE_ASSESSMENT',
        description: 'Altruistic/helping values',
        weight: 0.9,
      });
    }

    // STRATEGIST: High challenge + problem solving
    if (challenge > 70) {
      signals.push({
        archetype: 'STRATEGIST',
        strength: challenge,
        source: 'VALUE_ASSESSMENT',
        description: 'Challenge-seeking values',
        weight: 0.85,
      });
    }

    // EXPLORER: High variety + adventure
    if (variety > 70) {
      signals.push({
        archetype: 'EXPLORER',
        strength: variety,
        source: 'VALUE_ASSESSMENT',
        description: 'Variety-seeking values',
        weight: 0.9,
      });
    }

    // CRAFTSMAN: High mastery + excellence
    if (mastery > 70) {
      signals.push({
        archetype: 'CRAFTSMAN',
        strength: mastery,
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
    behavioral: BehavioralAssessmentResult
  ): ArchetypeSignal[] {
    const signals: ArchetypeSignal[] = [];
    const riskTolerance = scoreOf(behavioral.riskTolerance);
    const conscientiousness = scoreOf(behavioral.conscientiousness);
    const extraversion = scoreOf(behavioral.extraversion);
    const openness = scoreOf(behavioral.openness);
    const agreeableness = scoreOf(behavioral.agreeableness);

    // FOUNDER: High risk tolerance + proactivity
    if (riskTolerance > 70) {
      signals.push({
        archetype: 'FOUNDER',
        strength: riskTolerance,
        source: 'BEHAVIORAL_ASSESSMENT',
        description: 'High risk tolerance indicates founder potential',
        weight: 0.95,
      });
    }

    // OPERATOR: High conscientiousness + reliability
    if (conscientiousness > 70) {
      signals.push({
        archetype: 'OPERATOR',
        strength: conscientiousness,
        source: 'BEHAVIORAL_ASSESSMENT',
        description: 'High conscientiousness indicates operational excellence',
        weight: 0.9,
      });
    }

    // LEADER: High extraversion + assertiveness
    if (extraversion > 70) {
      signals.push({
        archetype: 'LEADER',
        strength: extraversion,
        source: 'BEHAVIORAL_ASSESSMENT',
        description: 'Social orientation indicates leadership potential',
        weight: 0.85,
      });
    }

    // EXPLORER: High openness + adaptability
    if (openness > 70) {
      signals.push({
        archetype: 'EXPLORER',
        strength: openness,
        source: 'BEHAVIORAL_ASSESSMENT',
        description: 'Openness to experience indicates exploratory nature',
        weight: 0.9,
      });
    }

    // PROTECTOR: High agreeableness + stability
    if (agreeableness > 70) {
      signals.push({
        archetype: 'PROTECTOR',
        strength: agreeableness,
        source: 'BEHAVIORAL_ASSESSMENT',
        description: 'Cooperative nature indicates protective/service orientation',
        weight: 0.8,
      });
    }

    // STRATEGIST: High openness + conscientiousness
    if (openness > 65 && conscientiousness > 65) {
      signals.push({
        archetype: 'STRATEGIST',
        strength: Math.round((openness + conscientiousness) / 2),
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
    insights: ArchetypeProfileInsights
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
    profile: ArchetypeStudentLifeProfile
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

function scoreOf(score: ArchetypeAssessmentScore | undefined): number {
  return score?.score ?? 0;
}
