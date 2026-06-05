/**
 * CareerOS Archetype Explanation Engine - Risk Engine
 *
 * Phase 1.4: Archetype Explanation Engine
 *
 * Identifies risks, weaknesses, and blind spots for each archetype.
 *
 * @module archetype-risk-engine
 * @version 1.0.0
 */

import type { ArchetypeType } from '@/types/archetype-profile';
import type { RisksAnalysis, RiskTemplate } from './archetype-explanation-types';

/**
 * Risk templates for all archetypes.
 */
const RISK_TEMPLATES: Record<ArchetypeType, RiskTemplate> = {
  BUILDER: {
    archetype: 'BUILDER',
    commonWeaknesses: [
      'Perfectionism in implementation',
      'Over-engineering solutions',
      'Difficulty delegating technical work',
      'Impatience with non-technical stakeholders',
      'Tendency to rebuild rather than iterate',
    ],
    blindSpots: [
      'User needs vs. technical elegance',
      'Business constraints',
      'Maintenance burden of complex systems',
      'Team capacity limitations',
      'Market timing considerations',
    ],
    failureModes: [
      'Building without validation',
      'Technical debt accumulation',
      'Isolation from business context',
      'Burnout from overwork',
      'Scope creep in personal projects',
    ],
    careerRisks: [
      'Limited advancement beyond senior technical roles',
      'Vulnerability to technology obsolescence',
      'Difficulty transitioning to management',
      'Competition from younger developers',
      'Physical strain from long coding hours',
    ],
  },
  RESEARCHER: {
    archetype: 'RESEARCHER',
    commonWeaknesses: [
      'Analysis paralysis',
      'Difficulty with deadlines',
      'Over-complication of simple problems',
      'Perfectionism in data collection',
      'Reluctance to commit to conclusions',
    ],
    blindSpots: [
      'Practical application urgency',
      'Resource constraints',
      'Stakeholder patience limits',
      'Market timing windows',
      'Implementation complexity',
    ],
    failureModes: [
      'Research without application',
      'Missing market windows',
      'Academic career path dependency',
      'Isolation from industry needs',
      'Publication pressure burnout',
    ],
    careerRisks: [
      'Limited industry role options',
      'Academic job market scarcity',
      'Funding dependency',
      'Specialization obsolescence',
      'Slow career progression',
    ],
  },
  CREATOR: {
    archetype: 'CREATOR',
    commonWeaknesses: [
      'Inconsistency in output',
      'Difficulty with routine tasks',
      'Perfectionism blocking completion',
      'Sensitivity to criticism',
      'Idea abandonment',
    ],
    blindSpots: [
      'Market demand for work',
      'Commercial viability',
      'Technical implementation constraints',
      'Timeline realities',
      'Collaboration requirements',
    ],
    failureModes: [
      'Creating without audience',
      'Financial instability',
      'Burnout from creative pressure',
      'Style obsolescence',
      'Isolation from feedback',
    ],
    careerRisks: [
      'Income unpredictability',
      'Market saturation',
      'Style trend dependency',
      'AI/automation displacement',
      'Portfolio dependency',
    ],
  },
  OPERATOR: {
    archetype: 'OPERATOR',
    commonWeaknesses: [
      'Resistance to change',
      'Over-reliance on procedures',
      'Difficulty with ambiguity',
      'Risk aversion',
      'Limited strategic thinking',
    ],
    blindSpots: [
      'Innovation opportunities',
      'Strategic direction changes',
      'Market disruptions',
      'Automation threats',
      'Career growth limitations',
    ],
    failureModes: [
      'Process rigidity in crisis',
      'Missed improvement opportunities',
      'Obsolescence from automation',
      'Career plateau',
      'Resistance to necessary change',
    ],
    careerRisks: [
      'Automation displacement',
      'Limited advancement ceiling',
      'Commoditization of skills',
      'Outsourcing vulnerability',
      'Industry decline exposure',
    ],
  },
  LEADER: {
    archetype: 'LEADER',
    commonWeaknesses: [
      'Over-reliance on charisma',
      'Difficulty with detail work',
      'Impatience with slow processes',
      'Tendency to overcommit',
      'Conflict avoidance',
    ],
    blindSpots: [
      'Individual contributor needs',
      'Implementation complexity',
      'Technical limitations',
      'Burnout in team members',
      'Personal skill atrophy',
    ],
    failureModes: [
      'Vision without execution',
      'Team burnout from pace',
      'Strategy without grounding',
      'Leadership style mismatch',
      'Isolation from reality',
    ],
    careerRisks: [
      'Leadership role dependency',
      'Limited individual contributor options',
      'Reputation vulnerability',
      'Political exposure',
      'High-stakes failure impact',
    ],
  },
  EXPLORER: {
    archetype: 'EXPLORER',
    commonWeaknesses: [
      'Difficulty with commitment',
      'Shallow expertise',
      'Restlessness in stable roles',
      'Impulsiveness',
      'Completion challenges',
    ],
    blindSpots: [
      'Depth requirements for advancement',
      'Relationship building needs',
      'Financial stability requirements',
      'Expertise credibility',
      'Long-term career building',
    ],
    failureModes: [
      'Perpetual job hopping',
      'No deep expertise development',
      'Financial instability',
      'Network fragmentation',
      'Career directionlessness',
    ],
    careerRisks: [
      'No clear career trajectory',
      'Limited senior role eligibility',
      'Income instability',
      'Expertise credibility gaps',
      'Retirement planning challenges',
    ],
  },
  TEACHER: {
    archetype: 'TEACHER',
    commonWeaknesses: [
      'Over-giving to others',
      'Neglect of personal growth',
      'Difficulty saying no',
      'Emotional labor exhaustion',
      'Boundary challenges',
    ],
    blindSpots: [
      'Compensation undervaluation',
      'Career advancement needs',
      'Personal skill development',
      'Market rate awareness',
      'Self-promotion requirements',
    ],
    failureModes: [
      'Burnout from over-giving',
      'Income limitation',
      'Career stagnation',
      'Resentment buildup',
      'Identity over-attachment',
    ],
    careerRisks: [
      'Compensation ceiling',
      'Limited advancement',
      'Industry undervaluation',
      'Emotional labor burden',
      'Skill obsolescence',
    ],
  },
  PROTECTOR: {
    archetype: 'PROTECTOR',
    commonWeaknesses: [
      'Excessive risk aversion',
      'Difficulty with change',
      'Over-cautiousness',
      'Missed opportunities',
      'Resistance to innovation',
    ],
    blindSpots: [
      'Opportunity costs',
      'Growth requirements',
      'Competitive pressures',
      'Market evolution',
      'Personal potential',
    ],
    failureModes: [
      'Career stagnation',
      'Missed advancement',
      'Industry obsolescence',
      'Regret from inaction',
      'Over-protection failure',
    ],
    careerRisks: [
      'Limited growth trajectory',
      'Industry decline exposure',
      'Automation vulnerability',
      'Compensation limitation',
      'Opportunity cost accumulation',
    ],
  },
  STRATEGIST: {
    archetype: 'STRATEGIST',
    commonWeaknesses: [
      'Over-analysis',
      'Implementation distance',
      'Perfectionism in planning',
      'Difficulty with uncertainty',
      'Analysis without action',
    ],
    blindSpots: [
      'Execution complexity',
      'Tactical realities',
      'Team capacity limits',
      'Market timing urgency',
      'Implementation messiness',
    ],
    failureModes: [
      'Strategy without execution',
      'Missed windows',
      'Over-complexity',
      'Team alienation',
      'Academic detachment',
    ],
    careerRisks: [
      'Limited execution credibility',
      'Consulting dependency',
      'Academic career path',
      'Implementation team needs',
      'Strategy commoditization',
    ],
  },
  FOUNDER: {
    archetype: 'FOUNDER',
    commonWeaknesses: [
      'Overconfidence',
      'Impulsiveness',
      'Difficulty with authority',
      'Work-life imbalance',
      'Premature scaling',
    ],
    blindSpots: [
      'Market validation needs',
      'Cash flow realities',
      'Team building requirements',
      'Personal limitations',
      'Risk exposure',
    ],
    failureModes: [
      'Startup failure',
      'Financial loss',
      'Burnout',
      'Relationship strain',
      'Reputation damage',
    ],
    careerRisks: [
      'High failure rate',
      'Financial instability',
      'Career gap challenges',
      'Skill atrophy',
      'Re-entry difficulty',
    ],
  },
  CRAFTSMAN: {
    archetype: 'CRAFTSMAN',
    commonWeaknesses: [
      'Perfectionism',
      'Slow delivery',
      'Difficulty with scale',
      'Reluctance to delegate',
      'Resistance to shortcuts',
    ],
    blindSpots: [
      'Market speed requirements',
      'Cost pressures',
      'Automation threats',
      'Scalability limits',
      'Business model constraints',
    ],
    failureModes: [
      'Quality without market fit',
      'Slow career progression',
      'Income limitation',
      'Market irrelevance',
      'Burnout from standards',
    ],
    careerRisks: [
      'Market speed mismatch',
      'Automation displacement',
      'Limited scalability',
      'Niche market dependency',
      'Physical strain',
    ],
  },
};

/**
 * Risk Engine for analyzing archetype risks.
 */
export class RiskEngine {
  /**
   * Generates risks analysis for archetype.
   *
   * @param archetype - The archetype
   * @returns Risks analysis
   */
  generateRisks(archetype: ArchetypeType): RisksAnalysis {
    const template = RISK_TEMPLATES[archetype];

    return {
      commonWeaknesses: [...template.commonWeaknesses],
      blindSpots: [...template.blindSpots],
      failureModes: [...template.failureModes],
      careerRisks: [...template.careerRisks],
    };
  }

  /**
   * Generates combined risks for mixed archetypes.
   *
   * @param primary - Primary archetype
   * @param secondary - Secondary archetype
   * @returns Combined risks analysis
   */
  generateCombinedRisks(
    primary: ArchetypeType,
    secondary: ArchetypeType
  ): RisksAnalysis {
    const primaryRisks = this.generateRisks(primary);
    const secondaryRisks = this.generateRisks(secondary);

    // Some risks may be mitigated by the combination
    const mitigatedRisks = this.identifyMitigatedRisks(primary, secondary);

    return {
      commonWeaknesses: this.mergeAndFilter(
        primaryRisks.commonWeaknesses,
        secondaryRisks.commonWeaknesses,
        mitigatedRisks
      ),
      blindSpots: this.mergeAndFilter(
        primaryRisks.blindSpots,
        secondaryRisks.blindSpots,
        mitigatedRisks
      ),
      failureModes: this.mergeAndFilter(
        primaryRisks.failureModes,
        secondaryRisks.failureModes,
        mitigatedRisks
      ),
      careerRisks: this.mergeAndFilter(
        primaryRisks.careerRisks,
        secondaryRisks.careerRisks,
        mitigatedRisks
      ),
    };
  }

  /**
   * Identifies risks that may be mitigated by archetype combination.
   *
   * @param primary - Primary archetype
   * @param secondary - Secondary archetype
   * @returns Mitigated risk keywords
   */
  private identifyMitigatedRisks(
    primary: ArchetypeType,
    secondary: ArchetypeType
  ): string[] {
    const mitigated: string[] = [];

    // Founder + Builder: Less implementation risk
    if (primary === 'FOUNDER' && secondary === 'BUILDER') {
      mitigated.push('execution', 'implementation');
    }

    // Researcher + Teacher: Less isolation risk
    if (primary === 'RESEARCHER' && secondary === 'TEACHER') {
      mitigated.push('isolation', 'application');
    }

    // Creator + Builder: Less market fit risk
    if (primary === 'CREATOR' && secondary === 'BUILDER') {
      mitigated.push('market', 'implementation');
    }

    // Operator + Leader: Less rigidity risk
    if (primary === 'OPERATOR' && secondary === 'LEADER') {
      mitigated.push('change', 'innovation');
    }

    // Explorer + Strategist: Less directionlessness
    if (primary === 'EXPLORER' && secondary === 'STRATEGIST') {
      mitigated.push('direction', 'trajectory');
    }

    return mitigated;
  }

  /**
   * Merges arrays and filters mitigated items.
   *
   * @param arr1 - First array
   * @param arr2 - Second array
   * @param mitigated - Keywords to filter out
   * @returns Filtered merged array
   */
  private mergeAndFilter(
    arr1: string[],
    arr2: string[],
    mitigated: string[]
  ): string[] {
    const merged = [...new Set([...arr1, ...arr2])];
    return merged.filter(
      (item) => !mitigated.some((m) => item.toLowerCase().includes(m))
    );
  }

  /**
   * Gets top risks to watch.
   *
   * @param analysis - Risks analysis
   * @param count - Number to return
   * @returns Top risks
   */
  getTopRisks(analysis: RisksAnalysis, count: number = 5): string[] {
    const allRisks = [
      ...analysis.careerRisks,
      ...analysis.failureModes,
      ...analysis.commonWeaknesses.slice(0, 2),
    ];

    return [...new Set(allRisks)].slice(0, count);
  }

  /**
   * Compares risks between two archetypes.
   *
   * @param archetype1 - First archetype
   * @param archetype2 - Second archetype
   * @returns Comparison result
   */
  compareRisks(
    archetype1: ArchetypeType,
    archetype2: ArchetypeType
  ): {
    uniqueToFirst: string[];
    uniqueToSecond: string[];
    shared: string[];
    higherRisk: ArchetypeType | 'SIMILAR';
  } {
    const risks1 = this.generateRisks(archetype1);
    const risks2 = this.generateRisks(archetype2);

    const all1 = [
      ...risks1.careerRisks,
      ...risks1.failureModes,
      ...risks1.commonWeaknesses,
    ];

    const all2 = [
      ...risks2.careerRisks,
      ...risks2.failureModes,
      ...risks2.commonWeaknesses,
    ];

    const set1 = new Set(all1);
    const set2 = new Set(all2);

    const shared = [...set1].filter((r) => set2.has(r));
    const uniqueToFirst = [...set1].filter((r) => !set2.has(r));
    const uniqueToSecond = [...set2].filter((r) => !set1.has(r));

    // Simple risk comparison based on count
    const riskScore1 = all1.length;
    const riskScore2 = all2.length;

    const higherRisk =
      riskScore1 > riskScore2 + 2
        ? archetype1
        : riskScore2 > riskScore1 + 2
        ? archetype2
        : 'SIMILAR';

    return { uniqueToFirst, uniqueToSecond, shared, higherRisk };
  }
}

/**
 * Creates default risk engine.
 *
 * @returns New RiskEngine instance
 */
export function createRiskEngine(): RiskEngine {
  return new RiskEngine();
}
