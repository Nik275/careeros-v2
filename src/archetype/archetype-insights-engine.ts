/**
 * CareerOS Archetype Explanation Engine - Insights Engine
 *
 * Phase 1.4: Archetype Explanation Engine
 *
 * Generates career insights for archetype results.
 *
 * @module archetype-insights-engine
 * @version 1.0.0
 */

import type { ArchetypeType } from '@/types/archetype-profile';
import type {
  CareerImplications,
  WorkEnvironmentAnalysis,
  EnvironmentTemplate,
  EnvironmentFactor,
} from './archetype-explanation-types';

/**
 * Environment templates for all archetypes.
 */
const ENVIRONMENT_TEMPLATES: Record<ArchetypeType, EnvironmentTemplate> = {
  BUILDER: {
    archetype: 'BUILDER',
    thrivesIn: [
      { factor: 'Technical challenges', why: 'You excel when solving complex implementation problems' },
      { factor: 'Clear specifications', why: 'You perform best with well-defined requirements' },
      { factor: 'Autonomy in implementation', why: 'You need freedom in how you build solutions' },
      { factor: 'Quality-focused culture', why: 'You align with environments that value craftsmanship' },
    ],
    strugglesIn: [
      { factor: 'Heavy bureaucracy', why: 'Process overhead slows your implementation' },
      { factor: 'Constant context switching', why: 'You need focus for deep technical work' },
      { factor: 'Political environments', why: 'Technical merit matters more than politics to you' },
      { factor: 'Maintenance-only roles', why: 'You need to build, not just maintain' },
    ],
    idealTeam: 'Technical teams with clear leadership and minimal politics. You work well with other builders and operators who value execution.',
    challengingTeam: 'Highly political teams with unclear direction or teams that prioritize process over results.',
  },
  RESEARCHER: {
    archetype: 'RESEARCHER',
    thrivesIn: [
      { factor: 'Intellectual freedom', why: 'You need space to explore questions deeply' },
      { factor: 'Access to resources', why: 'Research requires information and tools' },
      { factor: 'Long-term projects', why: 'Deep investigation takes time' },
      { factor: 'Knowledge-oriented culture', why: 'You value truth over expedience' },
    ],
    strugglesIn: [
      { factor: 'Rapid deadlines', why: 'Quality research cannot be rushed' },
      { factor: 'Shallow work expectations', why: 'You need depth, not surface coverage' },
      { factor: 'Political pressure on findings', why: 'You seek truth, not convenient answers' },
      { factor: 'Constant interruptions', why: 'Deep work requires focus' },
    ],
    idealTeam: 'Intellectually curious teams that value evidence and rigor. You work well with other researchers and strategists.',
    challengingTeam: 'Action-oriented teams that prioritize speed over understanding.',
  },
  CREATOR: {
    archetype: 'CREATOR',
    thrivesIn: [
      { factor: 'Creative freedom', why: 'You need autonomy in your creative process' },
      { factor: 'Inspiring environments', why: 'Your work is fueled by inspiration' },
      { factor: 'Feedback culture', why: 'You improve through iterative feedback' },
      { factor: 'Novelty and variety', why: 'Repetition drains your creative energy' },
    ],
    strugglesIn: [
      { factor: 'Rigid constraints', why: 'Over-constraint kills creativity' },
      { factor: 'Bureaucratic approval', why: 'Creative work needs agility' },
      { factor: 'Repetitive tasks', why: 'You need variety to stay engaged' },
      { factor: 'Purely commercial pressure', why: 'Commerce can conflict with artistic vision' },
    ],
    idealTeam: 'Diverse teams with creative freedom and mutual inspiration. You work well with other creators and builders.',
    challengingTeam: 'Rigid, process-heavy teams that prioritize compliance over creativity.',
  },
  OPERATOR: {
    archetype: 'OPERATOR',
    thrivesIn: [
      { factor: 'Clear processes', why: 'You excel with defined procedures' },
      { factor: 'Stable environment', why: 'Consistency allows you to optimize' },
      { factor: 'Measurable outcomes', why: 'You value clear success metrics' },
      { factor: 'Team reliability', why: 'You depend on others following through' },
    ],
    strugglesIn: [
      { factor: 'Constant change', why: 'You need stability to perform' },
      { factor: 'Ambiguity', why: 'Unclear expectations make execution difficult' },
      { factor: 'Chaos', why: 'Disorder prevents reliable delivery' },
      { factor: 'Unrealistic deadlines', why: 'Quality execution takes time' },
    ],
    idealTeam: 'Structured teams with clear roles and reliable members. You work well with builders and protectors.',
    challengingTeam: 'Chaotic, unpredictable teams with unclear expectations.',
  },
  LEADER: {
    archetype: 'LEADER',
    thrivesIn: [
      { factor: 'Influence opportunities', why: 'You need to guide and direct' },
      { factor: 'People-focused culture', why: 'You excel in human-centered environments' },
      { factor: 'Strategic decision-making', why: 'You need authority to set direction' },
      { factor: 'Growth-oriented teams', why: 'You enjoy developing others' },
    ],
    strugglesIn: [
      { factor: 'Individual contributor isolation', why: 'You need people interaction' },
      { factor: 'Micromanagement', why: 'You need autonomy to lead' },
      { factor: 'Toxic politics', why: 'You prefer healthy team dynamics' },
      { factor: 'Detail-heavy work', why: 'You focus on big picture and people' },
    ],
    idealTeam: 'Collaborative teams open to direction and development. You work well with operators and strategists.',
    challengingTeam: 'Resistant, disengaged teams or highly political environments.',
  },
  EXPLORER: {
    archetype: 'EXPLORER',
    thrivesIn: [
      { factor: 'Variety and change', why: 'Novelty keeps you engaged' },
      { factor: 'Learning opportunities', why: 'Growth is your primary drive' },
      { factor: 'Autonomy', why: 'You need freedom to explore' },
      { factor: 'Fast-paced environments', why: 'You adapt quickly to change' },
    ],
    strugglesIn: [
      { factor: 'Routine and repetition', why: 'Boredom is your kryptonite' },
      { factor: 'Rigid structures', why: 'You need flexibility' },
      { factor: 'Slow-moving organizations', why: 'You need momentum' },
      { factor: 'Deep specialization', why: 'You prefer breadth over depth' },
    ],
    idealTeam: 'Dynamic, adaptable teams with diverse challenges. You work well with founders and strategists.',
    challengingTeam: 'Static, unchanging teams with rigid processes.',
  },
  TEACHER: {
    archetype: 'TEACHER',
    thrivesIn: [
      { factor: 'Mentorship opportunities', why: 'Helping others grow is your purpose' },
      { factor: 'Collaborative culture', why: 'You excel in supportive environments' },
      { factor: 'Learning organizations', why: 'Continuous development aligns with your values' },
      { factor: 'Recognition of development', why: 'Your impact is in others growth' },
    ],
    strugglesIn: [
      { factor: 'Competitive cutthroat cultures', why: 'You prefer cooperation over competition' },
      { factor: 'Isolated work', why: 'You need interaction to teach' },
      { factor: 'Results-only focus', why: 'Development takes time' },
      { factor: 'High-pressure environments', why: 'Stress inhibits learning' },
    ],
    idealTeam: 'Supportive teams that value growth and development. You work well with researchers and protectors.',
    challengingTeam: 'Individualistic, competitive teams without mentorship culture.',
  },
  PROTECTOR: {
    archetype: 'PROTECTOR',
    thrivesIn: [
      { factor: 'Stability and security', why: 'You need predictability' },
      { factor: 'Clear expectations', why: 'Defined boundaries help you protect' },
      { factor: 'Service-oriented culture', why: 'Helping others aligns with your values' },
      { factor: 'Risk-aware environment', why: 'You excel at anticipating problems' },
    ],
    strugglesIn: [
      { factor: 'Constant uncertainty', why: 'You need stability' },
      { factor: 'High-risk environments', why: 'You prefer safety' },
      { factor: 'Rapid change', why: 'You need time to adapt' },
      { factor: 'Pressure to take risks', why: 'Your caution is a strength' },
    ],
    idealTeam: 'Stable, supportive teams that value responsibility. You work well with operators and teachers.',
    challengingTeam: 'Volatile, risk-taking teams that undervalue stability.',
  },
  STRATEGIST: {
    archetype: 'STRATEGIST',
    thrivesIn: [
      { factor: 'Strategic planning opportunities', why: 'You need to think long-term' },
      { factor: 'Complex problem spaces', why: 'You excel at systems thinking' },
      { factor: 'Information access', why: 'Strategy requires data' },
      { factor: 'Decision-making authority', why: 'You need to influence direction' },
    ],
    strugglesIn: [
      { factor: 'Tactical-only roles', why: 'You need strategic scope' },
      { factor: 'Rushed decisions', why: 'Strategy takes time' },
      { factor: 'Limited information', why: 'You need data for planning' },
      { factor: 'Implementation detail', why: 'You focus on big picture' },
    ],
    idealTeam: 'Forward-thinking teams open to strategic direction. You work well with researchers and leaders.',
    challengingTeam: 'Reactive teams focused only on immediate concerns.',
  },
  FOUNDER: {
    archetype: 'FOUNDER',
    thrivesIn: [
      { factor: 'High autonomy', why: 'You need to make your own decisions' },
      { factor: 'Creation opportunities', why: 'Building is your drive' },
      { factor: 'Fast-moving environments', why: 'You need momentum' },
      { factor: 'Ownership and impact', why: 'You need skin in the game' },
    ],
    strugglesIn: [
      { factor: 'Bureaucratic organizations', why: 'You need agility' },
      { factor: 'Limited authority', why: 'You need control' },
      { factor: 'Maintenance work', why: 'You need to create' },
      { factor: 'Slow decision-making', why: 'You need speed' },
    ],
    idealTeam: 'Ambitious, driven teams with entrepreneurial spirit. You work well with builders and explorers.',
    challengingTeam: 'Bureaucratic, slow-moving organizations with limited autonomy.',
  },
  CRAFTSMAN: {
    archetype: 'CRAFTSMAN',
    thrivesIn: [
      { factor: 'Quality-focused culture', why: 'Excellence is your standard' },
      { factor: 'Time for mastery', why: 'Craft takes time' },
      { factor: 'Recognition of expertise', why: 'Your skill deserves respect' },
      { factor: 'Apprenticeship opportunities', why: 'You value mastery transmission' },
    ],
    strugglesIn: [
      { factor: 'Speed-over-quality pressure', why: 'You refuse to compromise' },
      { factor: 'Mass production environments', why: 'You need craft, not volume' },
      { factor: 'Low standards', why: 'Mediocrity is unacceptable' },
      { factor: 'Constant interruption', why: 'Mastery requires focus' },
    ],
    idealTeam: 'Excellence-oriented teams that value skill and quality. You work well with researchers and builders.',
    challengingTeam: 'Quantity-over-quality teams with low standards.',
  },
};

/**
 * Career templates for all archetypes.
 */
const CAREER_TEMPLATES: Record<ArchetypeType, {
  careerStrengths: string[];
  careerRisks: string[];
  opportunities: string[];
  cautions: string[];
  recommendedPaths: string[];
  cautionPaths: string[];
}> = {
  BUILDER: {
    careerStrengths: [
      'Technical excellence and credibility',
      'System architecture capabilities',
      'Reliable delivery track record',
      'Cross-functional technical collaboration',
    ],
    careerRisks: [
      'Limited advancement beyond senior technical roles',
      'Technology obsolescence vulnerability',
      'Management transition difficulty',
    ],
    opportunities: [
      'Staff/Principal engineer tracks',
      'Technical architect roles',
      'Founding engineer positions',
      'Technical consulting',
    ],
    cautions: [
      'Avoid roles with only maintenance work',
      'Be wary of technology stagnation',
      'Do not ignore business context',
    ],
    recommendedPaths: [
      'Software Engineer → Senior → Staff → Principal',
      'Engineering Manager (if interested)',
      'Technical Founder',
      'Consulting Architect',
    ],
    cautionPaths: [
      'Pure management without technical work',
      'Maintenance-only roles',
      'Technologies far from your expertise',
    ],
  },
  RESEARCHER: {
    careerStrengths: [
      'Deep expertise and credibility',
      'Problem diagnosis abilities',
      'Innovation contribution',
      'Intellectual leadership',
    ],
    careerRisks: [
      'Limited industry role options',
      'Academic job market scarcity',
      'Specialization obsolescence',
    ],
    opportunities: [
      'Research scientist roles',
      'R&D positions',
      'Data science leadership',
      'Thought leadership paths',
    ],
    cautions: [
      'Avoid pure research without application',
      'Do not ignore market needs',
      'Be careful of over-specialization',
    ],
    recommendedPaths: [
      'Researcher → Senior Researcher → Principal Scientist',
      'PhD → Academia → Industry Research',
      'Data Scientist → Research Lead',
    ],
    cautionPaths: [
      'Roles without research time',
      'Purely applied roles',
      'Declining research fields',
    ],
  },
  CREATOR: {
    careerStrengths: [
      'Creative differentiation',
      'Portfolio strength',
      'Brand development',
      'Innovation contribution',
    ],
    careerRisks: [
      'Income unpredictability',
      'Market saturation',
      'Style trend dependency',
    ],
    opportunities: [
      'Creative director roles',
      'Independent practice',
      'Product design leadership',
      'Content creation careers',
    ],
    cautions: [
      'Avoid overly commercial compromises',
      'Do not ignore market demand',
      'Be careful of creative burnout',
    ],
    recommendedPaths: [
      'Designer → Senior → Lead → Creative Director',
      'Artist → Gallery representation',
      'Writer → Published author',
    ],
    cautionPaths: [
      'Roles with no creative freedom',
      'Commoditized creative work',
      'AI-displacable creative roles',
    ],
  },
  OPERATOR: {
    careerStrengths: [
      'Operational excellence',
      'Reliability and consistency',
      'Process improvement',
      'Quality assurance',
    ],
    careerRisks: [
      'Automation displacement',
      'Limited advancement ceiling',
      'Commoditization of skills',
    ],
    opportunities: [
      'Operations management',
      'Process improvement roles',
      'Quality leadership',
      'Supply chain management',
    ],
    cautions: [
      'Avoid roles likely to be automated',
      'Do not get stuck in rigid processes',
      'Be careful of industry decline',
    ],
    recommendedPaths: [
      'Operations Analyst → Manager → Director → VP',
      'Process Engineer → Lean Expert',
      'Quality Analyst → QA Manager',
    ],
    cautionPaths: [
      'Highly automatable operations',
      'Declining industries',
      'Roles with no advancement',
    ],
  },
  LEADER: {
    careerStrengths: [
      'Team building and development',
      'Organizational impact',
      'Executive presence',
      'Strategic influence',
    ],
    careerRisks: [
      'Leadership role dependency',
      'Limited individual contributor options',
      'High-stakes failure impact',
    ],
    opportunities: [
      'Management tracks',
      'Executive positions',
      'Leadership consulting',
      'Board opportunities',
    ],
    cautions: [
      'Avoid leadership without support',
      'Do not ignore skill development',
      'Be careful of toxic environments',
    ],
    recommendedPaths: [
      'Manager → Director → VP → C-suite',
      'Team Lead → Engineering Manager',
      'Project Manager → Program Director',
    ],
    cautionPaths: [
      'Individual contributor roles',
      'Management without authority',
      'Highly political organizations',
    ],
  },
  EXPLORER: {
    careerStrengths: [
      'Adaptability and flexibility',
      'Cross-functional value',
      'Innovation contribution',
      'Growth trajectory',
    ],
    careerRisks: [
      'No clear career trajectory',
      'Limited senior role eligibility',
      'Expertise credibility gaps',
    ],
    opportunities: [
      'Consulting roles',
      'Product management',
      'Entrepreneurship',
      'Cross-functional leadership',
    ],
    cautions: [
      'Avoid constant job hopping',
      'Do not neglect depth entirely',
      'Be careful of directionlessness',
    ],
    recommendedPaths: [
      'Various roles → Generalist Leader',
      'Consultant → Partner',
      'Product Manager → CPO',
    ],
    cautionPaths: [
      'Deep specialization roles',
      'Static, unchanging positions',
      'Roles requiring decade-long commitment',
    ],
  },
  TEACHER: {
    careerStrengths: [
      'Team development impact',
      'Knowledge transfer',
      'Culture building',
      'Retention improvement',
    ],
    careerRisks: [
      'Compensation ceiling',
      'Limited advancement',
      'Emotional labor burden',
    ],
    opportunities: [
      'Learning and development',
      'Management roles',
      'Training leadership',
      'Coaching careers',
    ],
    cautions: [
      'Avoid over-giving to detriment',
      'Do not neglect own growth',
      'Be careful of burnout',
    ],
    recommendedPaths: [
      'Individual Contributor → Tech Lead → Engineering Manager',
      'Trainer → L&D Manager',
      'Coach → Executive Coach',
    ],
    cautionPaths: [
      'Roles with no mentorship opportunity',
      'Highly competitive environments',
      'Isolated individual contributor roles',
    ],
  },
  PROTECTOR: {
    careerStrengths: [
      'Trust building',
      'Risk management',
      'Operational continuity',
      'Ethical foundation',
    ],
    careerRisks: [
      'Limited growth trajectory',
      'Industry decline exposure',
      'Opportunity cost accumulation',
    ],
    opportunities: [
      'Risk management',
      'Compliance leadership',
      'Security roles',
      'Healthcare and social work',
    ],
    cautions: [
      'Avoid excessive risk aversion',
      'Do not miss growth opportunities',
      'Be careful of stagnation',
    ],
    recommendedPaths: [
      'Risk Analyst → Risk Manager → CRO',
      'Security Engineer → Security Lead',
      'Social Worker → Program Director',
    ],
    cautionPaths: [
      'High-risk startups',
      'Volatile industries',
      'Roles with no stability',
    ],
  },
  STRATEGIST: {
    careerStrengths: [
      'Strategic planning',
      'Business development',
      'Organizational design',
      'Competitive positioning',
    ],
    careerRisks: [
      'Limited execution credibility',
      'Consulting dependency',
      'Strategy commoditization',
    ],
    opportunities: [
      'Strategy consulting',
      'Corporate strategy',
      'Product strategy',
      'Chief of Staff roles',
    ],
    cautions: [
      'Avoid strategy without implementation',
      'Do not over-analyze',
      'Be careful of detachment',
    ],
    recommendedPaths: [
      'Analyst → Consultant → Manager → Partner',
      'Strategy Associate → Director → VP Strategy',
      'Product Manager → Product Strategist',
    ],
    cautionPaths: [
      'Purely tactical roles',
      'Organizations without strategy function',
      'Roles with no decision influence',
    ],
  },
  FOUNDER: {
    careerStrengths: [
      'Company building',
      'Value creation',
      'Network development',
      'Innovation leadership',
    ],
    careerRisks: [
      'High failure rate',
      'Financial instability',
      'Career gap challenges',
    ],
    opportunities: [
      'Entrepreneurship',
      'Venture capital',
      'Startup advising',
      'Intrapreneurship',
    ],
    cautions: [
      'Avoid premature scaling',
      'Do not ignore market validation',
      'Be careful of burnout',
    ],
    recommendedPaths: [
      'Founder → Serial Founder',
      'Founder → VC',
      'Early Employee → Founder',
    ],
    cautionPaths: [
      'Bureaucratic corporations',
      'Maintenance-heavy roles',
      'Low-autonomy positions',
    ],
  },
  CRAFTSMAN: {
    careerStrengths: [
      'Expert reputation',
      'Quality deliverables',
      'Skill premium',
      'Client trust',
    ],
    careerRisks: [
      'Market speed mismatch',
      'Automation displacement',
      'Limited scalability',
    ],
    opportunities: [
      'Expert consulting',
      'Master craftsman roles',
      'Quality leadership',
      'Artisan entrepreneurship',
    ],
    cautions: [
      'Avoid speed-over-quality environments',
      'Do not ignore market realities',
      'Be careful of physical strain',
    ],
    recommendedPaths: [
      'Apprentice → Journeyman → Master',
      'Specialist → Expert Consultant',
      'Craftsperson → Studio Owner',
    ],
    cautionPaths: [
      'Mass production environments',
      'Speed-over-quality cultures',
      'Commoditized skill roles',
    ],
  },
};

/**
 * Insights Engine for generating career insights.
 */
export class InsightsEngine {
  /**
   * Generates work environment analysis.
   *
   * @param archetype - The archetype
   * @returns Work environment analysis
   */
  generateEnvironmentAnalysis(archetype: ArchetypeType): WorkEnvironmentAnalysis {
    const template = ENVIRONMENT_TEMPLATES[archetype];

    return {
      thrivesIn: template.thrivesIn.map((t) => ({
        factor: t.factor,
        whyItMatters: t.why,
      })),
      strugglesIn: template.strugglesIn.map((t) => ({
        factor: t.factor,
        whyItMatters: t.why,
      })),
      idealTeam: template.idealTeam,
      challengingTeam: template.challengingTeam,
    };
  }

  /**
   * Generates combined environment analysis.
   *
   * @param primary - Primary archetype
   * @param secondary - Secondary archetype
   * @returns Combined environment analysis
   */
  generateCombinedEnvironmentAnalysis(
    primary: ArchetypeType,
    secondary: ArchetypeType
  ): WorkEnvironmentAnalysis {
    const primaryEnv = this.generateEnvironmentAnalysis(primary);
    const secondaryEnv = this.generateEnvironmentAnalysis(secondary);

    // Combine thriving environments
    const thrivesIn = [
      ...primaryEnv.thrivesIn.slice(0, 3),
      ...secondaryEnv.thrivesIn.slice(0, 1),
    ];

    // Combine struggling environments
    const strugglesIn = [
      ...primaryEnv.strugglesIn.slice(0, 2),
      ...secondaryEnv.strugglesIn.slice(0, 2),
    ];

    return {
      thrivesIn,
      strugglesIn,
      idealTeam: `You work best with teams that combine ${primary} strengths with ${secondary.toLowerCase()} perspectives. ${primaryEnv.idealTeam}`,
      challengingTeam: `You may struggle with teams that are both ${primaryEnv.challengingTeam.toLowerCase()} and ${secondaryEnv.challengingTeam.toLowerCase()}.`,
    };
  }

  /**
   * Generates career implications.
   *
   * @param archetype - The archetype
   * @returns Career implications
   */
  generateCareerImplications(archetype: ArchetypeType): CareerImplications {
    const template = CAREER_TEMPLATES[archetype];

    return {
      careerStrengths: [...template.careerStrengths],
      careerRisks: [...template.careerRisks],
      opportunities: [...template.opportunities],
      cautions: [...template.cautions],
      recommendedPaths: [...template.recommendedPaths],
      cautionPaths: [...template.cautionPaths],
    };
  }

  /**
   * Generates combined career implications.
   *
   * @param primary - Primary archetype
   * @param secondary - Secondary archetype
   * @returns Combined career implications
   */
  generateCombinedCareerImplications(
    primary: ArchetypeType,
    secondary: ArchetypeType
  ): CareerImplications {
    const primaryCareer = this.generateCareerImplications(primary);
    const secondaryCareer = this.generateCareerImplications(secondary);

    return {
      careerStrengths: this.mergeUnique(
        primaryCareer.careerStrengths,
        secondaryCareer.careerStrengths
      ),
      careerRisks: this.mergeUnique(
        primaryCareer.careerRisks,
        secondaryCareer.careerRisks
      ),
      opportunities: this.mergeUnique(
        primaryCareer.opportunities,
        secondaryCareer.opportunities
      ),
      cautions: this.mergeUnique(
        primaryCareer.cautions,
        secondaryCareer.cautions
      ),
      recommendedPaths: this.mergeUnique(
        primaryCareer.recommendedPaths,
        secondaryCareer.recommendedPaths
      ),
      cautionPaths: this.mergeUnique(
        primaryCareer.cautionPaths,
        secondaryCareer.cautionPaths
      ),
    };
  }

  /**
   * Merges arrays keeping unique values.
   *
   * @param arr1 - First array
   * @param arr2 - Second array
   * @returns Merged unique array
   */
  private mergeUnique<T>(arr1: T[], arr2: T[]): T[] {
    return [...new Set([...arr1, ...arr2])];
  }

  /**
   * Generates actionable insights.
   *
   * @param archetype - The archetype
   * @returns Actionable insights
   */
  generateActionableInsights(archetype: ArchetypeType): string[] {
    const environment = this.generateEnvironmentAnalysis(archetype);
    const career = this.generateCareerImplications(archetype);

    return [
      `Seek environments with: ${environment.thrivesIn.map((e) => e.factor).join(', ')}`,
      `Consider career paths: ${career.recommendedPaths[0]}`,
      `Watch for: ${career.cautions[0]}`,
      `Leverage your: ${career.careerStrengths[0]}`,
    ];
  }
}

/**
 * Creates default insights engine.
 *
 * @returns New InsightsEngine instance
 */
export function createInsightsEngine(): InsightsEngine {
  return new InsightsEngine();
}
