/**
 * CareerOS Archetype Explanation Engine - Strength Engine
 *
 * Phase 1.4: Archetype Explanation Engine
 *
 * Identifies strengths for each archetype.
 *
 * @module archetype-strength-engine
 * @version 1.0.0
 */

import type { ArchetypeType } from '@/types/archetype-profile';
import type { StrengthsAnalysis, StrengthTemplate } from './archetype-explanation-types';

/**
 * Strength templates for all archetypes.
 */
const STRENGTH_TEMPLATES: Record<ArchetypeType, StrengthTemplate> = {
  BUILDER: {
    archetype: 'BUILDER',
    naturalAdvantages: [
      'System thinking',
      'Technical problem-solving',
      'Implementation skills',
      'Architecture vision',
      'Creation momentum',
    ],
    behavioralStrengths: [
      'Reliable execution',
      'Attention to detail',
      'Methodical approach',
      'Persistent debugging',
      'Structured thinking',
    ],
    learningStrengths: [
      'Technical depth',
      'Pattern recognition',
      'Tactical experimentation',
      'Documentation absorption',
      'Tool mastery',
    ],
    decisionStrengths: [
      'Evidence-based decisions',
      'Risk assessment',
      'Technical evaluation',
      'Feasibility judgment',
      'Long-term thinking',
    ],
    careerStrengths: [
      'Technical credibility',
      'Deliverable consistency',
      'System architecture',
      'Code/quality excellence',
      'Cross-functional collaboration',
    ],
  },
  RESEARCHER: {
    archetype: 'RESEARCHER',
    naturalAdvantages: [
      'Deep analysis',
      'Pattern discovery',
      'Evidence synthesis',
      'Intellectual rigor',
      'Question formulation',
    ],
    behavioralStrengths: [
      'Intellectual curiosity',
      'Systematic investigation',
      'Open-mindedness',
      'Patience with complexity',
      'Truth-seeking',
    ],
    learningStrengths: [
      'Deep learning',
      'Interdisciplinary thinking',
      'Research methodology',
      'Critical evaluation',
      'Knowledge synthesis',
    ],
    decisionStrengths: [
      'Data-driven decisions',
      'Hypothesis testing',
      'Uncertainty tolerance',
      'Evidence weighing',
      'Long-term validation',
    ],
    careerStrengths: [
      'Expert credibility',
      'Innovation contribution',
      'Problem diagnosis',
      'Intellectual leadership',
      'Knowledge transfer',
    ],
  },
  CREATOR: {
    archetype: 'CREATOR',
    naturalAdvantages: [
      'Original thinking',
      'Aesthetic sensibility',
      'Conceptual vision',
      'Expressive ability',
      'Novelty generation',
    ],
    behavioralStrengths: [
      'Idea fluency',
      'Artistic expression',
      'Vision communication',
      'Openness to inspiration',
      'Iterative refinement',
    ],
    learningStrengths: [
      'Visual learning',
      'Inspiration synthesis',
      'Technique experimentation',
      'Style development',
      'Cross-medium adaptation',
    ],
    decisionStrengths: [
      'Intuitive judgment',
      'Aesthetic evaluation',
      'Vision alignment',
      'Creative risk-taking',
      'Direction setting',
    ],
    careerStrengths: [
      'Portfolio strength',
      'Creative differentiation',
      'Brand development',
      'Influence through work',
      'Style recognition',
    ],
  },
  OPERATOR: {
    archetype: 'OPERATOR',
    naturalAdvantages: [
      'Execution excellence',
      'Process optimization',
      'Reliability',
      'Efficiency focus',
      'Operational discipline',
    ],
    behavioralStrengths: [
      'Consistency',
      'Attention to detail',
      'Deadline management',
      'Quality control',
      'Systematic approach',
    ],
    learningStrengths: [
      'Procedural learning',
      'Best practice adoption',
      'Process improvement',
      'Operational knowledge',
      'Compliance mastery',
    ],
    decisionStrengths: [
      'Practical judgment',
      'Risk minimization',
      'Resource optimization',
      'Timeline management',
      'Priority execution',
    ],
    careerStrengths: [
      'Deliverable reliability',
      'Operational excellence',
      'Process improvement',
      'Team dependability',
      'Quality assurance',
    ],
  },
  LEADER: {
    archetype: 'LEADER',
    naturalAdvantages: [
      'Influence',
      'Vision setting',
      'Team motivation',
      'Direction clarity',
      'People development',
    ],
    behavioralStrengths: [
      'Communication',
      'Empathy',
      'Decisiveness',
      'Conflict resolution',
      'Inspiration',
    ],
    learningStrengths: [
      'Social learning',
      'Leadership development',
      'Strategy absorption',
      'Pattern recognition in people',
      'Organizational dynamics',
    ],
    decisionStrengths: [
      'Stakeholder consideration',
      'Values-based decisions',
      'Team input integration',
      'Courageous choices',
      'Long-term vision',
    ],
    careerStrengths: [
      'Team building',
      'Organizational impact',
      'Executive presence',
      'Strategic influence',
      'Talent development',
    ],
  },
  EXPLORER: {
    archetype: 'EXPLORER',
    naturalAdvantages: [
      'Adaptability',
      'Curiosity',
      'Discovery ability',
      'Change comfort',
      'Broad exposure',
    ],
    behavioralStrengths: [
      'Flexibility',
      'Openness',
      'Learning agility',
      'Risk tolerance',
      'Initiative',
    ],
    learningStrengths: [
      'Rapid skill acquisition',
      'Cross-domain learning',
      'Experiential learning',
      'Pattern transfer',
      'Novelty seeking',
    ],
    decisionStrengths: [
      'Exploratory choices',
      'Uncertainty navigation',
      'Pivot decisions',
      'Experiment design',
      'Opportunity recognition',
    ],
    careerStrengths: [
      'Role flexibility',
      'Industry adaptability',
      'Cross-functional value',
      'Innovation contribution',
      'Growth trajectory',
    ],
  },
  TEACHER: {
    archetype: 'TEACHER',
    naturalAdvantages: [
      'Explanation clarity',
      'Patience',
      'Mentorship',
      'Knowledge organization',
      'Growth facilitation',
    ],
    behavioralStrengths: [
      'Empathy',
      'Listening',
      'Encouragement',
      'Feedback delivery',
      'Progress tracking',
    ],
    learningStrengths: [
      'Pedagogical learning',
      'Knowledge structuring',
      'Explanation refinement',
      'Learning science',
      'Adaptive teaching',
    ],
    decisionStrengths: [
      'Student-centered choices',
      'Development priority',
      'Long-term growth focus',
      'Inclusive decisions',
      'Feedback integration',
    ],
    careerStrengths: [
      'Team development',
      'Knowledge transfer',
      'Culture building',
      'Retention impact',
      'Leadership pipeline',
    ],
  },
  PROTECTOR: {
    archetype: 'PROTECTOR',
    naturalAdvantages: [
      'Responsibility',
      'Security focus',
      'Service orientation',
      'Risk awareness',
      'Stability creation',
    ],
    behavioralStrengths: [
      'Reliability',
      'Caregiving',
      'Diligence',
      'Loyalty',
      'Preparation',
    ],
    learningStrengths: [
      'Defensive learning',
      'Risk study',
      'Protocol mastery',
      'Compliance knowledge',
      'Safety expertise',
    ],
    decisionStrengths: [
      'Risk-averse choices',
      'Protection priority',
      'Long-term security',
      'Stakeholder safety',
      'Conservative judgment',
    ],
    careerStrengths: [
      'Trust building',
      'Risk management',
      'Operational continuity',
      'Team security',
      'Ethical foundation',
    ],
  },
  STRATEGIST: {
    archetype: 'STRATEGIST',
    naturalAdvantages: [
      'Systems thinking',
      'Pattern recognition',
      'Long-term vision',
      'Optimization',
      'Competitive analysis',
    ],
    behavioralStrengths: [
      'Planning',
      'Analysis',
      'Pattern synthesis',
      'Scenario thinking',
      'Resource allocation',
    ],
    learningStrengths: [
      'Strategic frameworks',
      'Industry dynamics',
      'Competitive intelligence',
      'Trend analysis',
      'Decision models',
    ],
    decisionStrengths: [
      'Long-term optimization',
      'Trade-off analysis',
      'Scenario evaluation',
      'Resource allocation',
      'Strategic bets',
    ],
    careerStrengths: [
      'Strategic planning',
      'Business development',
      'Organizational design',
      'Competitive positioning',
      'Executive advisory',
    ],
  },
  FOUNDER: {
    archetype: 'FOUNDER',
    naturalAdvantages: [
      'Opportunity recognition',
      'Initiative',
      'Risk tolerance',
      'Autonomy',
      'Creation drive',
    ],
    behavioralStrengths: [
      'Proactivity',
      'Resilience',
      'Resourcefulness',
      'Vision persistence',
      'Deal-making',
    ],
    learningStrengths: [
      'Rapid learning',
      'Cross-functional knowledge',
      'Market understanding',
      'Failure learning',
      'Adaptive strategy',
    ],
    decisionStrengths: [
      'High-stakes decisions',
      'Uncertainty navigation',
      'Speed vs. quality',
      'Resource constraint choices',
      'Pivot decisions',
    ],
    careerStrengths: [
      'Company building',
      'Value creation',
      'Network development',
      'Innovation leadership',
      'Wealth generation',
    ],
  },
  CRAFTSMAN: {
    archetype: 'CRAFTSMAN',
    naturalAdvantages: [
      'Mastery drive',
      'Quality obsession',
      'Skill perfection',
      'Detail orientation',
      'Excellence standards',
    ],
    behavioralStrengths: [
      'Discipline',
      'Patience',
      'Practice commitment',
      'Refinement',
      'Standards maintenance',
    ],
    learningStrengths: [
      'Deep skill learning',
      'Technique refinement',
      'Mentorship absorption',
      'Deliberate practice',
      'Quality study',
    ],
    decisionStrengths: [
      'Quality priority',
      'Long-term investment',
      'Excellence over speed',
      'Standard adherence',
      'Craft preservation',
    ],
    careerStrengths: [
      'Expert reputation',
      'Quality deliverables',
      'Skill premium',
      'Client trust',
      'Professional respect',
    ],
  },
};

/**
 * Strength Engine for analyzing archetype strengths.
 */
export class StrengthEngine {
  /**
   * Generates strengths analysis for archetype.
   *
   * @param archetype - The archetype
   * @returns Strengths analysis
   */
  generateStrengths(archetype: ArchetypeType): StrengthsAnalysis {
    const template = STRENGTH_TEMPLATES[archetype];

    return {
      naturalAdvantages: [...template.naturalAdvantages],
      behavioralStrengths: [...template.behavioralStrengths],
      learningStrengths: [...template.learningStrengths],
      decisionStrengths: [...template.decisionStrengths],
      careerStrengths: [...template.careerStrengths],
    };
  }

  /**
   * Generates combined strengths for mixed archetypes.
   *
   * @param primary - Primary archetype
   * @param secondary - Secondary archetype
   * @returns Combined strengths analysis
   */
  generateCombinedStrengths(
    primary: ArchetypeType,
    secondary: ArchetypeType
  ): StrengthsAnalysis {
    const primaryStrengths = this.generateStrengths(primary);
    const secondaryStrengths = this.generateStrengths(secondary);

    return {
      naturalAdvantages: this.mergeAndDeduplicate(
        primaryStrengths.naturalAdvantages,
        secondaryStrengths.naturalAdvantages
      ),
      behavioralStrengths: this.mergeAndDeduplicate(
        primaryStrengths.behavioralStrengths,
        secondaryStrengths.behavioralStrengths
      ),
      learningStrengths: this.mergeAndDeduplicate(
        primaryStrengths.learningStrengths,
        secondaryStrengths.learningStrengths
      ),
      decisionStrengths: this.mergeAndDeduplicate(
        primaryStrengths.decisionStrengths,
        secondaryStrengths.decisionStrengths
      ),
      careerStrengths: this.mergeAndDeduplicate(
        primaryStrengths.careerStrengths,
        secondaryStrengths.careerStrengths
      ),
    };
  }

  /**
   * Merges two arrays and removes duplicates.
   *
   * @param arr1 - First array
   * @param arr2 - Second array
   * @returns Merged array
   */
  private mergeAndDeduplicate<T>(arr1: T[], arr2: T[]): T[] {
    return [...new Set([...arr1, ...arr2])];
  }

  /**
   * Gets top strengths across all categories.
   *
   * @param analysis - Strengths analysis
   * @param count - Number to return
   * @returns Top strengths
   */
  getTopStrengths(analysis: StrengthsAnalysis, count: number = 5): string[] {
    const allStrengths = [
      ...analysis.naturalAdvantages,
      ...analysis.behavioralStrengths,
      ...analysis.careerStrengths,
    ];

    return [...new Set(allStrengths)].slice(0, count);
  }

  /**
   * Compares strengths between two archetypes.
   *
   * @param archetype1 - First archetype
   * @param archetype2 - Second archetype
   * @returns Comparison result
   */
  compareStrengths(
    archetype1: ArchetypeType,
    archetype2: ArchetypeType
  ): {
    uniqueToFirst: string[];
    uniqueToSecond: string[];
    shared: string[];
  } {
    const strengths1 = this.generateStrengths(archetype1);
    const strengths2 = this.generateStrengths(archetype2);

    const all1 = [
      ...strengths1.naturalAdvantages,
      ...strengths1.behavioralStrengths,
      ...strengths1.careerStrengths,
    ];

    const all2 = [
      ...strengths2.naturalAdvantages,
      ...strengths2.behavioralStrengths,
      ...strengths2.careerStrengths,
    ];

    const set1 = new Set(all1);
    const set2 = new Set(all2);

    const shared = [...set1].filter((s) => set2.has(s));
    const uniqueToFirst = [...set1].filter((s) => !set2.has(s));
    const uniqueToSecond = [...set2].filter((s) => !set1.has(s));

    return { uniqueToFirst, uniqueToSecond, shared };
  }
}

/**
 * Creates default strength engine.
 *
 * @returns New StrengthEngine instance
 */
export function createStrengthEngine(): StrengthEngine {
  return new StrengthEngine();
}
