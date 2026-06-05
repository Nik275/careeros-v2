/**
 * CareerOS Archetype Explanation Engine - Narrative Engine
 *
 * Phase 1.4: Archetype Explanation Engine
 *
 * Generates human-readable narratives for archetype results.
 *
 * @module archetype-narrative-engine
 * @version 1.0.0
 */

import type { ArchetypeType } from '@/types/archetype-profile';
import type {
  NarrativeTemplate,
  SingleArchetypeExplanation,
  MixedArchetypeExplanation,
} from './archetype-explanation-types';

/**
 * Narrative templates for all archetypes.
 */
const NARRATIVE_TEMPLATES: Record<ArchetypeType, NarrativeTemplate> = {
  BUILDER: {
    archetype: 'BUILDER',
    coreMotivation:
      'You are driven by the desire to create tangible systems and products. You find deep satisfaction in building things that work and solving technical problems through implementation.',
    behavioralPattern:
      'You tend to approach challenges systematically, preferring to understand the underlying structure before acting. You are methodical in your work and take pride in craftsmanship and quality execution.',
    decisionMaking:
      'You make decisions based on evidence and feasibility. You evaluate options by their technical merit and practical implementation potential. You prefer proven solutions over experimental approaches.',
    learningApproach:
      'You learn best through hands-on experimentation and building. You prefer to understand concepts by implementing them and value technical depth over broad surface knowledge.',
    workStyle:
      'You prefer structured environments where you can focus deeply on technical challenges. You work best with clear specifications and autonomy in implementation decisions.',
    stressResponse:
      'Under stress, you may retreat into technical details or over-engineer solutions. You cope by seeking control through system understanding and process improvement.',
  },
  RESEARCHER: {
    archetype: 'RESEARCHER',
    coreMotivation:
      'You are driven by a need to understand how things work at a fundamental level. You seek truth through evidence and find satisfaction in discovering patterns and insights others miss.',
    behavioralPattern:
      'You tend to investigate thoroughly before forming conclusions. You ask probing questions and challenge assumptions. You prefer depth over breadth and value intellectual rigor.',
    decisionMaking:
      'You make decisions based on data and analysis. You gather evidence systematically and are comfortable with uncertainty while investigating. You rarely commit without sufficient information.',
    learningApproach:
      'You learn best through deep study and investigation. You prefer to master fundamentals before moving to applications and value understanding over memorization.',
    workStyle:
      'You prefer environments that allow for deep focus and intellectual exploration. You work best with access to information resources and time for thorough analysis.',
    stressResponse:
      'Under stress, you may over-collect data or delay decisions seeking more information. You cope through analysis and seeking patterns in complexity.',
  },
  CREATOR: {
    archetype: 'CREATOR',
    coreMotivation:
      'You are driven by the need for self-expression and originality. You find energy in generating novel ideas and bringing unique visions into reality.',
    behavioralPattern:
      'You tend to approach problems from unexpected angles. You value aesthetics and originality over convention. You often see possibilities where others see constraints.',
    decisionMaking:
      'You make decisions based on vision and intuition as much as logic. You evaluate options by their creative potential and alignment with your artistic or innovative goals.',
    learningApproach:
      'You learn best through experimentation and inspiration. You prefer to develop your own approach rather than follow established methods and value exploration over structure.',
    workStyle:
      'You prefer flexible environments that allow creative freedom. You work best with autonomy in how you approach tasks and value inspiration and creative flow.',
    stressResponse:
      'Under stress, you may struggle with creative blocks or abandon projects. You cope by seeking new inspiration and removing constraints that limit your expression.',
  },
  OPERATOR: {
    archetype: 'OPERATOR',
    coreMotivation:
      'You are driven by the satisfaction of execution and completion. You find fulfillment in reliable delivery and the smooth functioning of systems and processes.',
    behavioralPattern:
      'You tend to be methodical and consistent in your approach. You value reliability and follow-through. You are often the person others count on to get things done properly.',
    decisionMaking:
      'You make decisions based on practical considerations and proven methods. You evaluate options by their feasibility and alignment with established procedures.',
    learningApproach:
      'You learn best through structured training and repetition. You prefer clear procedures and documented methods and value practical application over theory.',
    workStyle:
      'You prefer organized environments with clear processes and expectations. You work best with defined procedures and consistent routines.',
    stressResponse:
      'Under stress, you may become more rigid in following procedures or anxious about deviations. You cope by focusing on controllable processes and task completion.',
  },
  LEADER: {
    archetype: 'LEADER',
    coreMotivation:
      'You are driven by the opportunity to influence and guide others. You find satisfaction in setting direction and developing people to achieve collective goals.',
    behavioralPattern:
      'You tend to naturally take charge in group situations. You focus on people and relationships, seeking to inspire and align others toward common objectives.',
    decisionMaking:
      'You make decisions considering stakeholder impact and team dynamics. You balance data with people considerations and are willing to make tough calls when necessary.',
    learningApproach:
      'You learn best through social interaction and leadership experiences. You prefer to develop skills through practice and feedback and value learning from others.',
    workStyle:
      'You prefer dynamic environments with opportunities for influence and impact. You work best with access to people and authority to make decisions.',
    stressResponse:
      'Under stress, you may become more directive or seek control through leadership. You cope by rallying others and taking charge of difficult situations.',
  },
  EXPLORER: {
    archetype: 'EXPLORER',
    coreMotivation:
      'You are driven by curiosity and the desire for novelty. You find energy in new experiences and become restless with routine and repetition.',
    behavioralPattern:
      'You tend to seek variety and change. You adapt quickly to new situations and enjoy learning about unfamiliar domains. You often challenge the status quo.',
    decisionMaking:
      'You make decisions based on growth potential and new opportunities. You are willing to take risks for novel experiences and value learning over security.',
    learningApproach:
      'You learn best through diverse experiences and rapid experimentation. You prefer to sample broadly rather than specialize deeply and value adaptability.',
    workStyle:
      'You prefer dynamic environments with variety and change. You work best with flexibility and opportunities to explore new challenges.',
    stressResponse:
      'Under stress, you may seek escape through change or new experiences. You cope by exploring alternatives and considering radical shifts.',
  },
  TEACHER: {
    archetype: 'TEACHER',
    coreMotivation:
      'You are driven by the desire to help others grow and learn. You find fulfillment in explaining concepts and seeing others develop understanding and capability.',
    behavioralPattern:
      'You tend to focus on others development and take a mentorship approach. You are patient and encouraging, seeking to draw out potential in those around you.',
    decisionMaking:
      'You make decisions considering their impact on others learning and growth. You prioritize development opportunities and long-term growth over short-term efficiency.',
    learningApproach:
      'You learn best through the process of teaching others. You deepen your understanding by explaining concepts and value the synthesis that comes from instruction.',
    workStyle:
      'You prefer collaborative environments with opportunities for mentorship. You work best when you can support others and contribute to their development.',
    stressResponse:
      'Under stress, you may overextend yourself helping others or struggle with saying no. You cope by seeking to support others through difficulties.',
  },
  PROTECTOR: {
    archetype: 'PROTECTOR',
    coreMotivation:
      'You are driven by a sense of responsibility and the desire to provide security. You find satisfaction in safeguarding others and maintaining stability.',
    behavioralPattern:
      'You tend to be cautious and protective in your approach. You value safety and reliability, often anticipating risks and preparing for contingencies.',
    decisionMaking:
      'You make decisions prioritizing security and risk minimization. You evaluate options by their potential downsides and prefer conservative, proven approaches.',
    learningApproach:
      'You learn best through careful study and risk assessment. You prefer to understand potential pitfalls before proceeding and value security knowledge.',
    workStyle:
      'You prefer stable environments with clear expectations and minimal surprises. You work best with established procedures and safety nets.',
    stressResponse:
      'Under stress, you may become more risk-averse or controlling. You cope by seeking to increase security and reduce uncertainty.',
  },
  STRATEGIST: {
    archetype: 'STRATEGIST',
    coreMotivation:
      'You are driven by the challenge of optimizing systems and planning for the future. You find satisfaction in understanding complex patterns and designing long-term approaches.',
    behavioralPattern:
      'You tend to think systematically about problems and their interconnections. You focus on the big picture and long-term implications rather than immediate concerns.',
    decisionMaking:
      'You make decisions based on long-term optimization and systemic impact. You evaluate options by their alignment with strategic goals and potential second-order effects.',
    learningApproach:
      'You learn best through understanding systems and frameworks. You prefer to see how pieces connect and value strategic models over tactical details.',
    workStyle:
      'You prefer environments that allow for strategic thinking and planning. You work best with access to information and authority to shape direction.',
    stressResponse:
      'Under stress, you may retreat into analysis or become rigid in plans. You cope by seeking to understand the larger context and systemic solutions.',
  },
  FOUNDER: {
    archetype: 'FOUNDER',
    coreMotivation:
      'You are driven by the desire for autonomy and the opportunity to create something new. You find energy in identifying opportunities and building organizations.',
    behavioralPattern:
      'You tend to see opportunities where others see obstacles. You are comfortable with ambiguity and take initiative to create your own path forward.',
    decisionMaking:
      'You make decisions based on opportunity assessment and risk tolerance. You are willing to act with incomplete information and value speed and initiative.',
    learningApproach:
      'You learn best through doing and rapid iteration. You prefer to learn by building and value practical knowledge over formal credentials.',
    workStyle:
      'You prefer autonomous environments with high ownership and impact potential. You work best with freedom to pursue opportunities and make independent decisions.',
    stressResponse:
      'Under stress, you may become more driven or take on excessive risk. You cope by seeking new opportunities and taking action to regain control.',
  },
  CRAFTSMAN: {
    archetype: 'CRAFTSMAN',
    coreMotivation:
      'You are driven by the pursuit of mastery and excellence. You find deep satisfaction in perfecting skills and producing work of exceptional quality.',
    behavioralPattern:
      'You tend to approach your work with dedication and attention to detail. You take pride in your craft and maintain high standards even when others might accept less.',
    decisionMaking:
      'You make decisions prioritizing quality and long-term value over speed or convenience. You are willing to invest time to achieve excellence.',
    learningApproach:
      'You learn best through deliberate practice and mentorship from masters. You prefer to develop deep expertise and value refinement over breadth.',
    workStyle:
      'You prefer environments that value quality and provide time for craft. You work best with standards to meet and recognition for excellence.',
    stressResponse:
      'Under stress, you may become perfectionistic or self-critical. You cope by focusing on quality standards and skill improvement.',
  },
};

/**
 * Combination narratives for common archetype pairs.
 */
const COMBINATION_NARRATIVES: Record<string, {
  combinedNarrative: string;
  complementaryAspects: string[];
  potentialTensions: string[];
}> = {
  'FOUNDER-BUILDER': {
    combinedNarrative:
      'You combine the Founders entrepreneurial drive with the Builders technical capability. You do not just identify opportunities—you have the skills to execute on them. You are equally comfortable defining the vision and writing the code.',
    complementaryAspects: [
      'Vision and execution in one person',
      'Technical credibility with entrepreneurial drive',
      'Ability to prototype and validate ideas',
      'Understanding of both business and technical constraints',
    ],
    potentialTensions: [
      'May over-build before validating market need',
      'Can get lost in technical perfection versus business speed',
      'Risk of taking on too much personally',
    ],
  },
  'RESEARCHER-TEACHER': {
    combinedNarrative:
      'You combine the Researchers deep investigation with the Teachers desire to share knowledge. You do not just discover insights—you excel at helping others understand them. You bridge the gap between complex research and practical application.',
    complementaryAspects: [
      'Deep expertise with communication ability',
      'Research that serves educational goals',
      'Patience for both investigation and explanation',
      'Academic credibility with teaching impact',
    ],
    potentialTensions: [
      'May prefer explaining over doing',
      'Can get stuck in research without application',
      'Might struggle with commercial pressure',
    ],
  },
  'CREATOR-BUILDER': {
    combinedNarrative:
      'You combine the Creators vision with the Builders implementation skill. You can conceive of novel solutions and then bring them into reality. You bridge creative ideation and technical execution.',
    complementaryAspects: [
      'Vision with execution capability',
      'Creative problem-solving with technical skills',
      'Aesthetic sense with functional implementation',
      'Innovation that can be built',
    ],
    potentialTensions: [
      'May struggle to balance creative vision with technical constraints',
      'Can get perfectionistic about both design and code',
      'Risk of creative scope creep',
    ],
  },
  'OPERATOR-LEADER': {
    combinedNarrative:
      'You combine the Operators execution excellence with the Leaders ability to guide others. You deliver reliably while building and developing teams. You model operational excellence while scaling it through others.',
    complementaryAspects: [
      'Execution credibility with leadership influence',
      'Process discipline with people development',
      'Reliability that inspires team confidence',
      'Operational excellence at scale',
    ],
    potentialTensions: [
      'May be overly focused on execution over strategy',
      'Can struggle to delegate when standards are high',
      'Risk of burnout from operational demands plus leadership',
    ],
  },
  'LEADER-STRATEGIST': {
    combinedNarrative:
      'You combine the Leaders influence with the Strategists systems thinking. You do not just set direction—you design the systems that make it achievable. You inspire while architecting the path forward.',
    complementaryAspects: [
      'Vision with strategic planning',
      'Inspiration with systemic thinking',
      'People leadership with organizational design',
      'Direction setting with roadmap clarity',
    ],
    potentialTensions: [
      'May over-plan before acting',
      'Can become detached from execution details',
      'Risk of analysis paralysis in leadership decisions',
    ],
  },
  'EXPLORER-FOUNDER': {
    combinedNarrative:
      'You combine the Explorers adaptability with the Founders opportunity drive. You thrive in creating new ventures and are comfortable with the ambiguity of early-stage building. You are a serial entrepreneur at heart.',
    complementaryAspects: [
      'Comfort with extreme uncertainty',
      'Rapid adaptation to market changes',
      'Willingness to pivot and explore',
      'Energy for starting over',
    ],
    potentialTensions: [
      'May struggle with commitment and follow-through',
      'Can abandon ventures too quickly',
      'Risk of never building lasting value',
    ],
  },
  'TEACHER-CREATOR': {
    combinedNarrative:
      'You combine the Teachers mentorship with the Creators innovation. You develop novel approaches to education and help others discover their creative potential. You are an innovative educator.',
    complementaryAspects: [
      'Creative teaching methods',
      'Helping others find their expression',
      'Innovation in educational content',
      'Inspiring creativity in others',
    ],
    potentialTensions: [
      'May prioritize creative expression over structured learning',
      'Can struggle with standardization requirements',
      'Risk of inconsistent teaching approaches',
    ],
  },
  'STRATEGIST-RESEARCHER': {
    combinedNarrative:
      'You combine the Strategists planning with the Researchers investigation. You build strategies grounded in deep understanding and evidence. Your plans are informed by thorough analysis.',
    complementaryAspects: [
      'Evidence-based strategic planning',
      'Research that drives strategy',
      'Systematic approach to complex problems',
      'Intellectual rigor in planning',
    ],
    potentialTensions: [
      'May over-research before deciding',
      'Can become disconnected from execution reality',
      'Risk of analysis paralysis',
    ],
  },
  'FOUNDER-BUILDER-ALT': {
    combinedNarrative:
      'You are a technical founder who can both envision and build. You have the rare combination of entrepreneurial vision and hands-on implementation skill.',
    complementaryAspects: [
      'End-to-end capability',
      'Technical and business credibility',
      'Rapid prototyping ability',
    ],
    potentialTensions: [
      'Difficulty letting go of technical work',
      'Tendency to build before validating',
    ],
  },
  'CRAFTSMAN-RESEARCHER': {
    combinedNarrative:
      'You combine the Craftsmans mastery with the Researchers investigation. You advance your field through deep study and exceptional execution. You are a master practitioner who contributes to knowledge.',
    complementaryAspects: [
      'Deep expertise with innovation',
      'Practice informed by research',
      'Quality with advancement',
      'Skill mastery with field contribution',
    ],
    potentialTensions: [
      'May move slowly due to high standards',
      'Can struggle with speed-to-market pressure',
      'Risk of perfectionism blocking publication',
    ],
  },
};

/**
 * Narrative Engine for generating archetype explanations.
 */
export class NarrativeEngine {
  /**
   * Generates single archetype explanation.
   *
   * @param archetype - The archetype
   * @param score - Archetype score
   * @returns Single archetype explanation
   */
  generateSingleArchetypeExplanation(
    archetype: ArchetypeType,
    score: number
  ): SingleArchetypeExplanation {
    const template = NARRATIVE_TEMPLATES[archetype];

    return {
      archetype,
      score,
      motivationNarrative: template.coreMotivation,
      behavioralDescription: template.behavioralPattern,
      decisionStyle: template.decisionMaking,
      learningStyle: template.learningApproach,
    };
  }

  /**
   * Generates mixed archetype explanation.
   *
   * @param primary - Primary archetype
   * @param secondary - Secondary archetype
   * @returns Mixed archetype explanation
   */
  generateMixedArchetypeExplanation(
    primary: ArchetypeType,
    secondary: ArchetypeType
  ): MixedArchetypeExplanation {
    // Look up combination narrative
    const key1 = `${primary}-${secondary}`;
    const key2 = `${secondary}-${primary}`;
    const combination = COMBINATION_NARRATIVES[key1] ?? COMBINATION_NARRATIVES[key2];

    if (combination) {
      return {
        primary,
        secondary,
        combinedNarrative: combination.combinedNarrative,
        complementaryAspects: [...combination.complementaryAspects],
        potentialTensions: [...combination.potentialTensions],
        integratedDescription: this.generateIntegratedDescription(
          primary,
          secondary,
          combination.combinedNarrative
        ),
      };
    }

    // Generate generic combination
    return this.generateGenericCombination(primary, secondary);
  }

  /**
   * Generates integrated description.
   *
   * @param primary - Primary archetype
   * @param secondary - Secondary archetype
   * @param combinedNarrative - Combined narrative
   * @returns Integrated description
   */
  private generateIntegratedDescription(
    primary: ArchetypeType,
    secondary: ArchetypeType,
    combinedNarrative: string
  ): string {
    const primaryTemplate = NARRATIVE_TEMPLATES[primary];
    const secondaryTemplate = NARRATIVE_TEMPLATES[secondary];

    return `${combinedNarrative} Your primary ${primary} drive means ${primaryTemplate.coreMotivation.toLowerCase()} Meanwhile, your secondary ${secondary} influence adds ${secondaryTemplate.coreMotivation.toLowerCase()}`;
  }

  /**
   * Generates generic combination.
   *
   * @param primary - Primary archetype
   * @param secondary - Secondary archetype
   * @returns Mixed archetype explanation
   */
  private generateGenericCombination(
    primary: ArchetypeType,
    secondary: ArchetypeType
  ): MixedArchetypeExplanation {
    const primaryTemplate = NARRATIVE_TEMPLATES[primary];
    const secondaryTemplate = NARRATIVE_TEMPLATES[secondary];

    return {
      primary,
      secondary,
      combinedNarrative: `You have a combination of ${primary} and ${secondary} traits. While primarily driven by ${primary.toLowerCase()} motivations, you also exhibit strong ${secondary.toLowerCase()} characteristics.`,
      complementaryAspects: [
        `Primary ${primary} strengths with ${secondary} augmentation`,
        `Balanced approach combining both archetypes`,
      ],
      potentialTensions: [
        `Potential conflict between ${primary} and ${secondary} priorities`,
        `May struggle to balance both drives`,
      ],
      integratedDescription: `${primaryTemplate.coreMotivation} At the same time, ${secondaryTemplate.coreMotivation.toLowerCase()}`,
    };
  }

  /**
   * Generates summary narrative.
   *
   * @param primary - Primary archetype
   * @param secondary - Secondary archetype (optional)
   * @param primaryScore - Primary score
   * @returns Summary narrative
   */
  generateSummary(
    primary: ArchetypeType,
    secondary: ArchetypeType | undefined,
    primaryScore: number
  ): string {
    const primaryTemplate = NARRATIVE_TEMPLATES[primary];

    if (secondary) {
      const mixed = this.generateMixedArchetypeExplanation(primary, secondary);
      return mixed.integratedDescription;
    }

    return `${primaryTemplate.coreMotivation} ${primaryTemplate.behavioralPattern}`;
  }

  /**
   * Gets narrative template for archetype.
   *
   * @param archetype - The archetype
   * @returns Narrative template
   */
  getTemplate(archetype: ArchetypeType): NarrativeTemplate {
    return NARRATIVE_TEMPLATES[archetype];
  }

  /**
   * Compares narratives between two archetypes.
   *
   * @param archetype1 - First archetype
   * @param archetype2 - Second archetype
   * @returns Comparison result
   */
  compareNarratives(
    archetype1: ArchetypeType,
    archetype2: ArchetypeType
  ): {
    keyDifferences: string[];
    similarElements: string[];
    complementaryPotential: string;
  } {
    const template1 = NARRATIVE_TEMPLATES[archetype1];
    const template2 = NARRATIVE_TEMPLATES[archetype2];

    const keyDifferences: string[] = [];
    const similarElements: string[] = [];

    // Compare core motivations
    if (template1.coreMotivation !== template2.coreMotivation) {
      keyDifferences.push(`Motivation: ${archetype1} is driven by creation while ${archetype2} is driven by different factors`);
    } else {
      similarElements.push('Core motivation alignment');
    }

    // Compare decision styles
    if (template1.decisionMaking !== template2.decisionMaking) {
      keyDifferences.push(`Decision style differs between the two archetypes`);
    }

    // Generic complementary potential
    const complementaryPotential = `Combining ${archetype1} and ${archetype2} could provide both ${archetype1.toLowerCase()} strengths and ${archetype2.toLowerCase()} perspectives.`;

    return { keyDifferences, similarElements, complementaryPotential };
  }
}

/**
 * Creates default narrative engine.
 *
 * @returns New NarrativeEngine instance
 */
export function createNarrativeEngine(): NarrativeEngine {
  return new NarrativeEngine();
}
