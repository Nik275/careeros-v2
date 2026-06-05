/**
 * CareerOS - Culture Engine
 *
 * Models culture characteristics and personality fit.
 *
 * Models who thrives and who struggles in this career.
 *
 * Example: Software Engineer
 * Thrives: Builder, Researcher
 * Struggles: High social stimulation seekers
 *
 * @module culture-engine
 * @version 1.0.0
 */

import type {
  CultureProfile,
  CulturalDimensions,
  ValuesAlignment,
  SocialDynamics,
  CareerPersonalityFit,
  PersonalityType,
  CognitiveFit,
  BehavioralFit,
  MotivationalFit,
  WorkStyleFit,
  CulturalArchetype,
  CareerId,
  CompanyStage,
  WorkEnvironmentProfile,
} from '../types/career-reality-types';

/** Input for culture modeling */
export interface CultureInput {
  careerId: CareerId;
  careerTitle: string;
  companyStage?: CompanyStage;
  workEnvironment?: WorkEnvironmentProfile;
  industry?: string;
}

/** Personality archetype definitions */
interface PersonalityArchetype {
  name: string;
  description: string;
  traits: string[];
  thrivingCareers: string[];
  strugglingCareers: string[];
  cognitivePreferences: {
    analytical: number;
    creative: number;
    practical: number;
    social: number;
    strategic: number;
    detailOriented: number;
  };
  behavioralPreferences: {
    extroversion: number;
    conscientiousness: number;
    openness: number;
    agreeableness: number;
    emotionalStability: number;
  };
  motivationalPreferences: {
    achievement: number;
    affiliation: number;
    power: number;
    autonomy: number;
    purpose: number;
    security: number;
  };
  workStylePreferences: {
    independence: number;
    structure: number;
    variety: number;
    pace: number;
    collaboration: number;
  };
}

/** Personality archetypes */
const PERSONALITY_ARCHETYPES: Record<string, PersonalityArchetype> = {
  builder: {
    name: 'Builder',
    description: 'Loves creating things, solving technical problems, and seeing tangible results',
    traits: ['Hands-on', 'Problem-solver', 'Detail-oriented', 'Pragmatic', 'Technical'],
    thrivingCareers: ['software-engineer', 'product-manager', 'designer', 'data-scientist', 'engineer'],
    strugglingCareers: ['investment-banker', 'consultant', 'sales-representative', 'lawyer'],
    cognitivePreferences: { analytical: 85, creative: 70, practical: 90, social: 40, strategic: 60, detailOriented: 85 },
    behavioralPreferences: { extroversion: 40, conscientiousness: 85, openness: 70, agreeableness: 60, emotionalStability: 75 },
    motivationalPreferences: { achievement: 80, affiliation: 40, power: 40, autonomy: 75, purpose: 70, security: 60 },
    workStylePreferences: { independence: 80, structure: 50, variety: 60, pace: 50, collaboration: 50 },
  },
  researcher: {
    name: 'Researcher',
    description: 'Loves deep investigation, understanding complex systems, and discovering new knowledge',
    traits: ['Curious', 'Analytical', 'Patient', 'Intellectual', 'Systematic'],
    thrivingCareers: ['data-scientist', 'researcher', 'scientist', 'academic', 'analyst'],
    strugglingCareers: ['sales-representative', 'consultant', 'investment-banker', 'teacher'],
    cognitivePreferences: { analytical: 95, creative: 60, practical: 50, social: 30, strategic: 70, detailOriented: 90 },
    behavioralPreferences: { extroversion: 30, conscientiousness: 90, openness: 90, agreeableness: 60, emotionalStability: 80 },
    motivationalPreferences: { achievement: 70, affiliation: 30, power: 30, autonomy: 85, purpose: 80, security: 70 },
    workStylePreferences: { independence: 90, structure: 60, variety: 50, pace: 40, collaboration: 30 },
  },
  socializer: {
    name: 'Socializer',
    description: 'Thrives on human interaction, building relationships, and collaborative environments',
    traits: ['Outgoing', 'Empathetic', 'Communicative', 'Team-oriented', 'Energetic'],
    thrivingCareers: ['sales-representative', 'teacher', 'consultant', 'product-manager', 'hr-specialist'],
    strugglingCareers: ['software-engineer', 'data-scientist', 'researcher', 'actuary'],
    cognitivePreferences: { analytical: 50, creative: 70, practical: 60, social: 95, strategic: 50, detailOriented: 40 },
    behavioralPreferences: { extroversion: 90, conscientiousness: 60, openness: 75, agreeableness: 85, emotionalStability: 70 },
    motivationalPreferences: { achievement: 60, affiliation: 90, power: 50, autonomy: 40, purpose: 75, security: 60 },
    workStylePreferences: { independence: 30, structure: 50, variety: 80, pace: 70, collaboration: 95 },
  },
  leader: {
    name: 'Leader',
    description: 'Natural at directing others, making decisions, and driving toward goals',
    traits: ['Decisive', 'Assertive', 'Visionary', 'Responsible', 'Influential'],
    thrivingCareers: ['product-manager', 'consultant', 'investment-banker', 'executive', 'entrepreneur'],
    strugglingCareers: ['software-engineer', 'data-scientist', 'researcher', 'accountant'],
    cognitivePreferences: { analytical: 70, creative: 70, practical: 75, social: 80, strategic: 90, detailOriented: 50 },
    behavioralPreferences: { extroversion: 85, conscientiousness: 80, openness: 70, agreeableness: 60, emotionalStability: 80 },
    motivationalPreferences: { achievement: 90, affiliation: 60, power: 85, autonomy: 70, purpose: 70, security: 50 },
    workStylePreferences: { independence: 70, structure: 60, variety: 80, pace: 80, collaboration: 80 },
  },
  artist: {
    name: 'Artist',
    description: 'Values creative expression, aesthetic beauty, and innovative thinking',
    traits: ['Creative', 'Expressive', 'Intuitive', 'Non-conformist', 'Sensitive'],
    thrivingCareers: ['designer', 'artist', 'writer', 'product-manager', 'architect'],
    strugglingCareers: ['accountant', 'software-engineer-enterprise', 'banker', 'actuary'],
    cognitivePreferences: { analytical: 50, creative: 95, practical: 50, social: 60, strategic: 60, detailOriented: 60 },
    behavioralPreferences: { extroversion: 60, conscientiousness: 50, openness: 95, agreeableness: 70, emotionalStability: 60 },
    motivationalPreferences: { achievement: 60, affiliation: 50, power: 40, autonomy: 90, purpose: 85, security: 40 },
    workStylePreferences: { independence: 85, structure: 30, variety: 90, pace: 50, collaboration: 60 },
  },
  organizer: {
    name: 'Organizer',
    description: 'Excels at structure, planning, and bringing order to chaos',
    traits: ['Systematic', 'Reliable', 'Detail-oriented', 'Methodical', 'Responsible'],
    thrivingCareers: ['project-manager', 'accountant', 'operations-manager', 'administrator', 'analyst'],
    strugglingCareers: ['startup-founder', 'artist', 'consultant', 'sales-representative'],
    cognitivePreferences: { analytical: 80, creative: 30, practical: 85, social: 50, strategic: 60, detailOriented: 95 },
    behavioralPreferences: { extroversion: 50, conscientiousness: 95, openness: 40, agreeableness: 75, emotionalStability: 80 },
    motivationalPreferences: { achievement: 70, affiliation: 60, power: 40, autonomy: 50, purpose: 60, security: 85 },
    workStylePreferences: { independence: 50, structure: 90, variety: 30, pace: 50, collaboration: 60 },
  },
  helper: {
    name: 'Helper',
    description: 'Driven by making a difference in others lives and contributing to society',
    traits: ['Compassionate', 'Supportive', 'Patient', 'Altruistic', 'Nurturing'],
    thrivingCareers: ['doctor', 'teacher', 'nurse', 'social-worker', 'therapist'],
    strugglingCareers: ['investment-banker', 'sales-representative', 'consultant', 'trader'],
    cognitivePreferences: { analytical: 60, creative: 60, practical: 70, social: 90, strategic: 40, detailOriented: 60 },
    behavioralPreferences: { extroversion: 70, conscientiousness: 80, openness: 60, agreeableness: 90, emotionalStability: 70 },
    motivationalPreferences: { achievement: 50, affiliation: 80, power: 30, autonomy: 40, purpose: 95, security: 60 },
    workStylePreferences: { independence: 40, structure: 60, variety: 50, pace: 50, collaboration: 85 },
  },
  entrepreneur: {
    name: 'Entrepreneur',
    description: 'Thrives on risk, innovation, and building something from nothing',
    traits: ['Risk-tolerant', 'Innovative', 'Ambitious', 'Resilient', 'Opportunistic'],
    thrivingCareers: ['startup-founder', 'product-manager', 'sales-representative', 'consultant', 'investor'],
    strugglingCareers: ['government-worker', 'teacher', 'administrator', 'bureaucrat'],
    cognitivePreferences: { analytical: 70, creative: 85, practical: 80, social: 70, strategic: 90, detailOriented: 50 },
    behavioralPreferences: { extroversion: 80, conscientiousness: 70, openness: 95, agreeableness: 55, emotionalStability: 75 },
    motivationalPreferences: { achievement: 95, affiliation: 50, power: 70, autonomy: 95, purpose: 75, security: 30 },
    workStylePreferences: { independence: 95, structure: 20, variety: 95, pace: 90, collaboration: 70 },
  },
};

/** Career culture templates */
interface CultureTemplate {
  culturalDimensions: {
    collaboration: number;
    innovation: number;
    resultsFocus: number;
    speedFocus: number;
    transparency: number;
    psychologicalSafety: number;
    feedbackCulture: number;
    learningCulture: number;
  };
  coreValues: string[];
  alignedValues: string[];
  conflictingValues: string[];
  ethicalConsiderations: string[];
  socialDynamics: {
    teamOrientation: number;
    socialRequirements: number;
    networkingImportance: number;
    mentorshipAvailability: number;
    communityStrength: number;
    socialEventsImportance: number;
  };
  culturalArchetypes: string[];
}

const CAREER_CULTURE_TEMPLATES: Record<string, CultureTemplate> = {
  'software-engineer': {
    culturalDimensions: {
      collaboration: 70,
      innovation: 85,
      resultsFocus: 75,
      speedFocus: 70,
      transparency: 80,
      psychologicalSafety: 75,
      feedbackCulture: 80,
      learningCulture: 90,
    },
    coreValues: ['Innovation', 'Technical excellence', 'Problem-solving', 'Continuous learning'],
    alignedValues: ['Autonomy', 'Meritocracy', 'Intellectual curiosity', 'Craftsmanship'],
    conflictingValues: ['Hierarchical control', 'Rigid processes', 'Political maneuvering', 'Status quo'],
    ethicalConsiderations: ['User privacy', 'Algorithmic bias', 'Intellectual property'],
    socialDynamics: {
      teamOrientation: 75,
      socialRequirements: 50,
      networkingImportance: 60,
      mentorshipAvailability: 75,
      communityStrength: 85,
      socialEventsImportance: 50,
    },
    culturalArchetypes: ['Innovation-driven', 'Meritocratic', 'Learning-focused'],
  },
  'product-manager': {
    culturalDimensions: {
      collaboration: 90,
      innovation: 80,
      resultsFocus: 85,
      speedFocus: 75,
      transparency: 75,
      psychologicalSafety: 70,
      feedbackCulture: 75,
      learningCulture: 80,
    },
    coreValues: ['Customer focus', 'Results', 'Collaboration', 'Data-driven decisions'],
    alignedValues: ['Empathy', 'Strategic thinking', 'Communication', 'Leadership'],
    conflictingValues: ['Solo work', 'Rigid hierarchy', 'Analysis paralysis', 'Silos'],
    ethicalConsiderations: ['User manipulation', 'Data privacy', 'Feature addiction'],
    socialDynamics: {
      teamOrientation: 90,
      socialRequirements: 85,
      networkingImportance: 85,
      mentorshipAvailability: 70,
      communityStrength: 80,
      socialEventsImportance: 70,
    },
    culturalArchetypes: ['Collaborative', 'Results-driven', 'Customer-obsessed'],
  },
  'investment-banker': {
    culturalDimensions: {
      collaboration: 60,
      innovation: 50,
      resultsFocus: 95,
      speedFocus: 90,
      transparency: 40,
      psychologicalSafety: 45,
      feedbackCulture: 60,
      learningCulture: 70,
    },
    coreValues: ['Results', 'Excellence', 'Client service', 'Competition'],
    alignedValues: ['Ambition', 'Resilience', 'Attention to detail', 'Drive'],
    conflictingValues: ['Work-life balance', 'Collaboration over competition', 'Transparency', 'Humility'],
    ethicalConsiderations: ['Confidentiality', 'Conflicts of interest', 'Market manipulation'],
    socialDynamics: {
      teamOrientation: 60,
      socialRequirements: 70,
      networkingImportance: 90,
      mentorshipAvailability: 60,
      communityStrength: 50,
      socialEventsImportance: 80,
    },
    culturalArchetypes: ['Competitive', 'Elite', 'High-performance'],
  },
  'doctor': {
    culturalDimensions: {
      collaboration: 75,
      innovation: 60,
      resultsFocus: 90,
      speedFocus: 50,
      transparency: 70,
      psychologicalSafety: 60,
      feedbackCulture: 50,
      learningCulture: 85,
    },
    coreValues: ['Patient care', 'Medical excellence', 'Ethics', 'Continuous learning'],
    alignedValues: ['Compassion', 'Precision', 'Responsibility', 'Service'],
    conflictingValues: ['Profit over patients', 'Rushing', 'Individual glory', 'Cutting corners'],
    ethicalConsiderations: ['Patient autonomy', 'Resource allocation', 'End-of-life care', 'Confidentiality'],
    socialDynamics: {
      teamOrientation: 80,
      socialRequirements: 85,
      networkingImportance: 60,
      mentorshipAvailability: 70,
      communityStrength: 75,
      socialEventsImportance: 40,
    },
    culturalArchetypes: ['Service-oriented', 'Hierarchical', 'Evidence-based'],
  },
  'consultant': {
    culturalDimensions: {
      collaboration: 80,
      innovation: 75,
      resultsFocus: 90,
      speedFocus: 85,
      transparency: 60,
      psychologicalSafety: 55,
      feedbackCulture: 70,
      learningCulture: 85,
    },
    coreValues: ['Client impact', 'Excellence', 'Problem-solving', 'Professional development'],
    alignedValues: ['Adaptability', 'Intellectual curiosity', 'Communication', 'Drive'],
    conflictingValues: ['Stability', 'Deep specialization', 'Work-life balance', 'Transparency'],
    ethicalConsiderations: ['Client confidentiality', 'Conflict of interest', 'Recommendations integrity'],
    socialDynamics: {
      teamOrientation: 85,
      socialRequirements: 90,
      networkingImportance: 95,
      mentorshipAvailability: 75,
      communityStrength: 70,
      socialEventsImportance: 85,
    },
    culturalArchetypes: ['Client-focused', 'Up-or-out', 'Network-driven'],
  },
  'teacher': {
    culturalDimensions: {
      collaboration: 80,
      innovation: 65,
      resultsFocus: 75,
      speedFocus: 40,
      transparency: 75,
      psychologicalSafety: 70,
      feedbackCulture: 60,
      learningCulture: 90,
    },
    coreValues: ['Student success', 'Education', 'Equity', 'Growth'],
    alignedValues: ['Patience', 'Dedication', 'Creativity', 'Empathy'],
    conflictingValues: ['Profit motive', 'Competition', 'Speed over depth', 'Individualism'],
    ethicalConsiderations: ['Student privacy', 'Equity in education', 'Assessment fairness'],
    socialDynamics: {
      teamOrientation: 85,
      socialRequirements: 95,
      networkingImportance: 50,
      mentorshipAvailability: 65,
      communityStrength: 80,
      socialEventsImportance: 60,
    },
    culturalArchetypes: ['Mission-driven', 'Collaborative', 'Service-oriented'],
  },
  'default': {
    culturalDimensions: {
      collaboration: 70,
      innovation: 65,
      resultsFocus: 75,
      speedFocus: 60,
      transparency: 65,
      psychologicalSafety: 65,
      feedbackCulture: 65,
      learningCulture: 70,
    },
    coreValues: ['Excellence', 'Integrity', 'Collaboration', 'Growth'],
    alignedValues: ['Professionalism', 'Accountability', 'Respect', 'Innovation'],
    conflictingValues: ['Dishonesty', 'Laziness', 'Toxicity', 'Stagnation'],
    ethicalConsiderations: ['Professional ethics', 'Fairness', 'Responsibility'],
    socialDynamics: {
      teamOrientation: 75,
      socialRequirements: 65,
      networkingImportance: 70,
      mentorshipAvailability: 65,
      communityStrength: 70,
      socialEventsImportance: 60,
    },
    culturalArchetypes: ['Professional', 'Collaborative', 'Results-oriented'],
  },
};

/**
 * Culture Engine - Models culture characteristics and personality fit.
 */
export class CultureEngine {
  /**
   * Generate a culture profile for a career.
   */
  generateProfile(input: CultureInput): CultureProfile {
    const template = this.getTemplate(input.careerId, input.careerTitle);

    return {
      dimensions: this.generateCulturalDimensions(template, input),
      valuesAlignment: this.generateValuesAlignment(template),
      socialDynamics: this.generateSocialDynamics(template, input),
      personalityFit: this.generatePersonalityFit(input),
      culturalArchetypes: this.generateCulturalArchetypes(template),
    };
  }

  /**
   * Get the culture template for a career.
   */
  private getTemplate(careerId: CareerId, careerTitle: string): CultureTemplate {
    for (const [key, template] of Object.entries(CAREER_CULTURE_TEMPLATES)) {
      if (careerId.toLowerCase().includes(key)) {
        return template;
      }
    }

    for (const [key, template] of Object.entries(CAREER_CULTURE_TEMPLATES)) {
      if (careerTitle.toLowerCase().includes(key.replace('-', ' '))) {
        return template;
      }
    }

    return CAREER_CULTURE_TEMPLATES.default;
  }

  /**
   * Generate cultural dimensions.
   */
  private generateCulturalDimensions(
    template: CultureTemplate,
    input: CultureInput
  ): CulturalDimensions {
    const dims = { ...template.culturalDimensions };

    // Adjust for company stage
    if (input.companyStage) {
      const stageModifiers: Record<CompanyStage, Partial<CulturalDimensions>> = {
        STARTUP: { innovation: 15, speedFocus: 15, collaboration: 10, psychologicalSafety: -10 },
        GROWTH: { innovation: 10, speedFocus: 10, collaboration: 5 },
        MID_SIZED: { },
        ENTERPRISE: { collaboration: -5, innovation: -10, speedFocus: -15, transparency: -10 },
        GOVERNMENT: { innovation: -20, speedFocus: -25, transparency: -5, psychologicalSafety: 5 },
        FAMILY_BUSINESS: { collaboration: 10, psychologicalSafety: 5, innovation: -5 },
      };

      const mod = stageModifiers[input.companyStage];
      if (mod) {
        Object.entries(mod).forEach(([key, value]) => {
          if (value !== undefined && key in dims) {
            (dims as Record<string, number>)[key] = Math.max(0, Math.min(100, (dims as Record<string, number>)[key] + value));
          }
        });
      }
    }

    // Adjust for work environment if available
    if (input.workEnvironment) {
      dims.collaboration = Math.round(
        (dims.collaboration + input.workEnvironment.autonomy.overallScore) / 2
      );
      dims.transparency = Math.round(
        (dims.transparency + (100 - input.workEnvironment.politics.overallScore)) / 2
      );
    }

    return dims;
  }

  /**
   * Generate values alignment.
   */
  private generateValuesAlignment(template: CultureTemplate): ValuesAlignment {
    return {
      coreValues: template.coreValues,
      alignedValues: template.alignedValues,
      conflictingValues: template.conflictingValues,
      ethicalConsiderations: template.ethicalConsiderations,
    };
  }

  /**
   * Generate social dynamics.
   */
  private generateSocialDynamics(
    template: CultureTemplate,
    input: CultureInput
  ): SocialDynamics {
    const dynamics = { ...template.socialDynamics };

    // Adjust for company stage
    if (input.companyStage) {
      const stageModifiers: Record<CompanyStage, Partial<typeof dynamics>> = {
        STARTUP: { teamOrientation: 10, socialEventsImportance: 10, mentorshipAvailability: -10 },
        GROWTH: { teamOrientation: 5, networkingImportance: 5 },
        MID_SIZED: {},
        ENTERPRISE: { networkingImportance: 10, socialEventsImportance: 5 },
        GOVERNMENT: { networkingImportance: -10, socialEventsImportance: -10 },
        FAMILY_BUSINESS: { teamOrientation: 15, communityStrength: 10 },
      };

      const mod = stageModifiers[input.companyStage];
      if (mod) {
        Object.entries(mod).forEach(([key, value]) => {
          if (value !== undefined && key in dynamics) {
            (dynamics as Record<string, number>)[key] = Math.max(0, Math.min(100, (dynamics as Record<string, number>)[key] + value));
          }
        });
      }
    }

    return dynamics;
  }

  /**
   * Generate personality fit analysis.
   */
  private generatePersonalityFit(input: CultureInput): CareerPersonalityFit {
    const thrives: PersonalityType[] = [];
    const struggles: PersonalityType[] = [];

    // Calculate fit scores for each archetype
    for (const [key, archetype] of Object.entries(PERSONALITY_ARCHETYPES)) {
      const fitScore = this.calculateArchetypeFit(archetype, input);

      const personalityType: PersonalityType = {
        type: key,
        name: archetype.name,
        reason: this.generateFitReason(archetype, fitScore, input),
        fitScore,
        successFactors: this.generateSuccessFactors(archetype, fitScore),
        challenges: this.generateChallenges(archetype, fitScore),
      };

      if (fitScore >= 70) {
        thrives.push(personalityType);
      } else if (fitScore <= 40) {
        struggles.push(personalityType);
      }
    }

    // Sort by fit score
    thrives.sort((a, b) => b.fitScore - a.fitScore);
    struggles.sort((a, b) => a.fitScore - b.fitScore);

    return {
      thrives: thrives.slice(0, 4),
      struggles: struggles.slice(0, 4),
      cognitiveFit: this.calculateCognitiveFit(input),
      behavioralFit: this.calculateBehavioralFit(input),
      motivationalFit: this.calculateMotivationalFit(input),
      workStyleFit: this.calculateWorkStyleFit(input),
    };
  }

  /**
   * Calculate fit score for an archetype.
   */
  private calculateArchetypeFit(archetype: PersonalityArchetype, input: CultureInput): number {
    let score = 50;

    // Check if career is in thriving list
    if (archetype.thrivingCareers.some((c) => input.careerId.toLowerCase().includes(c))) {
      score += 25;
    }

    // Check if career is in struggling list
    if (archetype.strugglingCareers.some((c) => input.careerId.toLowerCase().includes(c))) {
      score -= 25;
    }

    // Adjust based on work environment if available
    if (input.workEnvironment) {
      // Autonomy alignment
      const autonomyDiff = Math.abs(
        input.workEnvironment.autonomy.overallScore - archetype.motivationalPreferences.autonomy
      );
      score -= autonomyDiff * 0.2;

      // Social requirements alignment
      const socialDiff = Math.abs(
        100 - input.workEnvironment.autonomy.overallScore - archetype.behavioralPreferences.extroversion
      );
      score -= socialDiff * 0.15;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate fit reason.
   */
  private generateFitReason(
    archetype: PersonalityArchetype,
    fitScore: number,
    input: CultureInput
  ): string {
    if (fitScore >= 80) {
      return `${archetype.name}s naturally excel in ${input.careerTitle} due to their ${archetype.traits.slice(0, 2).join(' and ')} characteristics`;
    } else if (fitScore >= 60) {
      return `${archetype.name}s can succeed in ${input.careerTitle} with awareness of their natural tendencies`;
    } else if (fitScore >= 40) {
      return `${archetype.name}s may find ${input.careerTitle} challenging and should consider whether the trade-offs align with their values`;
    } else {
      return `${archetype.name}s typically struggle in ${input.careerTitle} due to misalignment with their core ${archetype.traits.slice(0, 2).join(' and ')} traits`;
    }
  }

  /**
   * Generate success factors.
   */
  private generateSuccessFactors(archetype: PersonalityArchetype, fitScore: number): string[] {
    if (fitScore >= 70) {
      return [
        `Leverage your natural ${archetype.traits[0].toLowerCase()} abilities`,
        `Use your ${archetype.traits[1].toLowerCase()} approach to stand out`,
        'Find roles that maximize your strengths',
      ];
    } else {
      return [
        'Develop complementary skills to offset natural tendencies',
        'Find mentors who thrive in this environment',
        'Create systems to manage challenging aspects',
      ];
    }
  }

  /**
   * Generate challenges.
   */
  private generateChallenges(archetype: PersonalityArchetype, fitScore: number): string[] {
    if (fitScore <= 40) {
      return [
        `Your ${archetype.traits[0].toLowerCase()} nature may clash with typical expectations`,
        `The ${archetype.traits[1].toLowerCase()} approach may not be valued here`,
        'Consider whether the environment aligns with your core values',
      ];
    } else {
      return [
        'Stay aware of potential blind spots',
        'Balance your natural style with environment needs',
        'Continue developing flexibility',
      ];
    }
  }

  /**
   * Calculate cognitive fit.
   */
  private calculateCognitiveFit(input: CultureInput): CognitiveFit {
    const template = this.getTemplate(input.careerId, input.careerTitle);

    return {
      analytical: template.culturalDimensions.resultsFocus * 0.8 + template.culturalDimensions.learningCulture * 0.2,
      creative: template.culturalDimensions.innovation,
      practical: template.culturalDimensions.resultsFocus * 0.7 + 30,
      social: template.socialDynamics.socialRequirements,
      strategic: template.culturalDimensions.resultsFocus * 0.6 + template.culturalDimensions.innovation * 0.4,
      detailOriented: template.culturalDimensions.resultsFocus * 0.7 + 20,
    };
  }

  /**
   * Calculate behavioral fit.
   */
  private calculateBehavioralFit(input: CultureInput): BehavioralFit {
    const template = this.getTemplate(input.careerId, input.careerTitle);

    return {
      extroversion: template.socialDynamics.socialRequirements,
      conscientiousness: template.culturalDimensions.resultsFocus,
      openness: template.culturalDimensions.innovation,
      agreeableness: template.culturalDimensions.collaboration,
      emotionalStability: template.culturalDimensions.psychologicalSafety,
    };
  }

  /**
   * Calculate motivational fit.
   */
  private calculateMotivationalFit(input: CultureInput): MotivationalFit {
    const template = this.getTemplate(input.careerId, input.careerTitle);

    return {
      achievement: template.culturalDimensions.resultsFocus,
      affiliation: template.culturalDimensions.collaboration,
      power: template.socialDynamics.networkingImportance,
      autonomy: 100 - template.culturalDimensions.collaboration * 0.3,
      purpose: template.culturalDimensions.learningCulture,
      security: 100 - template.culturalDimensions.innovation * 0.3,
    };
  }

  /**
   * Calculate work style fit.
   */
  private calculateWorkStyleFit(input: CultureInput): WorkStyleFit {
    const template = this.getTemplate(input.careerId, input.careerTitle);

    return {
      independence: 100 - template.culturalDimensions.collaboration * 0.5,
      structure: 100 - template.culturalDimensions.innovation * 0.4,
      variety: template.culturalDimensions.innovation,
      pace: template.culturalDimensions.speedFocus,
      collaboration: template.culturalDimensions.collaboration,
    };
  }

  /**
   * Generate cultural archetypes.
   */
  private generateCulturalArchetypes(template: CultureTemplate): CulturalArchetype[] {
    return template.culturalArchetypes.map((name, index) => ({
      name,
      description: this.getArchetypeDescription(name),
      prevalence: 80 - index * 15,
      characteristics: this.getArchetypeCharacteristics(name),
    }));
  }

  /**
   * Get archetype description.
   */
  private getArchetypeDescription(name: string): string {
    const descriptions: Record<string, string> = {
      'Innovation-driven': 'Culture prioritizes new ideas, experimentation, and creative problem-solving',
      'Meritocratic': 'Success is based on ability and achievement rather than tenure or connections',
      'Learning-focused': 'Continuous development and knowledge sharing are core values',
      'Collaborative': 'Teamwork and collective success are emphasized over individual achievement',
      'Results-driven': 'Outcomes and impact matter more than processes or hours worked',
      'Customer-obsessed': 'Decisions are driven by customer needs and feedback',
      'Competitive': 'High-performance culture with emphasis on winning and excellence',
      'Elite': 'Selective environment with high standards and prestige',
      'High-performance': 'Intense focus on achieving exceptional results',
      'Service-oriented': 'Mission-driven culture focused on helping others',
      'Hierarchical': 'Clear authority structures and respect for position',
      'Evidence-based': 'Decisions are driven by data and research',
      'Mission-driven': 'Strong sense of purpose beyond profit or personal gain',
      'Professional': 'Formal, respectful environment with clear standards',
      'Network-driven': 'Success depends heavily on relationships and connections',
      'Up-or-out': 'Performance-based progression with clear expectations',
      'Client-focused': 'Everything revolves around delivering client value',
    };

    return descriptions[name] || `Culture characterized by ${name.toLowerCase()}`;
  }

  /**
   * Get archetype characteristics.
   */
  private getArchetypeCharacteristics(name: string): string[] {
    const characteristics: Record<string, string[]> = {
      'Innovation-driven': ['Experimentation encouraged', 'Failure accepted', 'Creative freedom', 'Cutting-edge focus'],
      'Meritocratic': ['Ideas over hierarchy', 'Performance-based rewards', 'Transparent evaluation', 'Skill recognition'],
      'Learning-focused': ['Training opportunities', 'Knowledge sharing', 'Mentorship programs', 'Conference attendance'],
      'Collaborative': ['Team celebrations', 'Cross-functional work', 'Shared goals', 'Open communication'],
      'Results-driven': ['Clear metrics', 'Outcome focus', 'Efficiency valued', 'Impact measurement'],
      'Customer-obsessed': ['User research', 'Feedback loops', 'Customer visits', 'Empathy training'],
      'Competitive': ['Performance rankings', 'High standards', 'Rewards for winners', 'Pressure to perform'],
      'Elite': ['Selective hiring', 'Prestige focus', 'High credentials', 'Exclusive network'],
      'High-performance': ['Long hours expected', 'Intensity valued', 'Excellence standard', 'Relentless drive'],
      'Service-oriented': ['Helping others', 'Mission focus', 'Community impact', 'Altruistic values'],
      'Hierarchical': ['Clear reporting lines', 'Respect for authority', 'Formal processes', 'Position matters'],
      'Evidence-based': ['Data-driven decisions', 'Research culture', 'Scientific method', 'Proof required'],
      'Mission-driven': ['Purpose beyond profit', 'Social impact', 'Values alignment', 'Cause commitment'],
      'Professional': ['Formal communication', 'Respectful interactions', 'Clear boundaries', 'Ethical standards'],
      'Network-driven': ['Relationship building', 'Social events', 'Connections valued', 'Who you know matters'],
      'Up-or-out': ['Performance reviews', 'Clear timelines', 'Promotion pressure', 'Exit if not advancing'],
      'Client-focused': ['Client first', 'Service mentality', 'Responsive to needs', 'Relationship management'],
    };

    return characteristics[name] || ['Characteristic environment', 'Distinctive culture', 'Clear norms'];
  }

  /**
   * Compare culture profiles between two careers.
   */
  compareProfiles(
    profileA: CultureProfile,
    profileB: CultureProfile
  ): {
    similarity: number;
    keyDifferences: string[];
    recommendation: string;
  } {
    const differences: string[] = [];

    // Compare cultural dimensions
    const dimsA = profileA.dimensions;
    const dimsB = profileB.dimensions;

    const dimDiffs = [
      { name: 'Collaboration', diff: Math.abs(dimsA.collaboration - dimsB.collaboration) },
      { name: 'Innovation', diff: Math.abs(dimsA.innovation - dimsB.innovation) },
      { name: 'Results Focus', diff: Math.abs(dimsA.resultsFocus - dimsB.resultsFocus) },
      { name: 'Speed Focus', diff: Math.abs(dimsA.speedFocus - dimsB.speedFocus) },
    ];

    dimDiffs.forEach((d) => {
      if (d.diff > 20) {
        differences.push(`${d.name} differs by ${d.diff} points`);
      }
    });

    // Compare social dynamics
    const socialDiff = Math.abs(
      profileA.socialDynamics.socialRequirements - profileB.socialDynamics.socialRequirements
    );
    if (socialDiff > 20) {
      differences.push(`Social requirements differ significantly`);
    }

    // Calculate similarity
    const avgDiff = dimDiffs.reduce((sum, d) => sum + d.diff, 0) / dimDiffs.length;
    const similarity = Math.max(0, 100 - avgDiff);

    // Generate recommendation
    let recommendation = '';
    if (profileA.dimensions.innovation > profileB.dimensions.innovation + 20) {
      recommendation = 'Choose Career A if you value innovation and creative freedom';
    } else if (profileB.dimensions.innovation > profileA.dimensions.innovation + 20) {
      recommendation = 'Choose Career B if you value innovation and creative freedom';
    } else if (profileA.dimensions.collaboration > profileB.dimensions.collaboration + 20) {
      recommendation = 'Choose Career A if you prefer collaborative environments';
    } else if (profileB.dimensions.collaboration > profileA.dimensions.collaboration + 20) {
      recommendation = 'Choose Career B if you prefer collaborative environments';
    } else {
      recommendation = 'Both careers have similar cultural characteristics';
    }

    return { similarity, keyDifferences: differences, recommendation };
  }

  /**
   * Get personality fit score for a specific archetype.
   */
  getPersonalityFitScore(careerId: CareerId, archetypeKey: string): number {
    const archetype = PERSONALITY_ARCHETYPES[archetypeKey];
    if (!archetype) return 50;

    const input: CultureInput = { careerId, careerTitle: '' };
    return this.calculateArchetypeFit(archetype, input);
  }

  /**
   * Get all personality archetypes.
   */
  getAllArchetypes(): PersonalityArchetype[] {
    return Object.values(PERSONALITY_ARCHETYPES);
  }
}

/**
 * Factory function for CultureEngine.
 */
export function createCultureEngine(): CultureEngine {
  return new CultureEngine();
}
