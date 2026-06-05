/**
 * CareerOS - Reality Explanation Engine
 *
 * Generates career reality explanations:
 * - What people love
 * - What people hate
 * - What surprises people
 * - What nobody tells you
 *
 * Calculates Expectation vs Reality gaps
 *
 * @module reality-explanation-engine
 * @version 1.0.0
 */

import type {
  RealityExplanations,
  RealityGapAnalysis,
  Expectation,
  RealityFactor,
  SpecificGap,
  Surprise,
  DayInTheLife,
  HourlyActivity,
  DayVariation,
  CareerStory,
  CareerId,
  CompanyStage,
  DailyLifeProfile,
  WorkEnvironmentProfile,
  BurnoutProfile,
  SatisfactionProfile,
} from '../types/career-reality-types';

/** Input for reality explanation generation */
export interface RealityExplanationInput {
  careerId: CareerId;
  careerTitle: string;
  companyStage?: CompanyStage;
  dailyLife?: DailyLifeProfile;
  workEnvironment?: WorkEnvironmentProfile;
  burnoutProfile?: BurnoutProfile;
  satisfactionProfile?: SatisfactionProfile;
}

/** Career reality templates */
interface RealityTemplate {
  whatPeopleLove: string[];
  whatPeopleHate: string[];
  whatSurprises: Array<{
    surprise: string;
    whySurprising: string;
    sentiment: 'POSITIVE' | 'NEGATIVE' | 'MIXED';
    preparation: string;
  }>;
  whatNobodyTellsYou: string[];
  commonExpectations: Array<{
    expectation: string;
    isAccurate: boolean;
    reality?: string;
    source: string;
  }>;
  realityFactors: Array<{
    name: string;
    description: string;
    surpriseFactor: number;
    impact: number;
  }>;
  dayInTheLife: {
    narrative: string;
    variations: Array<{
      name: string;
      when: string;
      differences: string;
    }>;
  };
  stories: Array<{
    title: string;
    content: string;
    context: string;
    takeaway: string;
  }>;
}

const CAREER_REALITY_TEMPLATES: Record<string, RealityTemplate> = {
  'software-engineer': {
    whatPeopleLove: [
      'Solving complex problems and seeing immediate results',
      'High compensation and job security',
      'Remote work flexibility and autonomy',
      'Continuous learning and new technologies',
      'Building products that millions of people use',
      'The logical nature of the work - computers do what you tell them',
      'Strong community and open-source culture',
    ],
    whatPeopleHate: [
      'Legacy code maintenance and technical debt',
      'Unrealistic deadlines and scope creep',
      'Meeting overload that breaks flow state',
      'On-call rotations and production incidents',
      'Constant need to learn new frameworks',
      'Imposter syndrome in a rapidly changing field',
      'Being asked to estimate work you have never done before',
    ],
    whatSurprises: [
      {
        surprise: 'How much time is spent in meetings vs coding',
        whySurprising: 'People imagine heads-down coding all day',
        sentiment: 'NEGATIVE',
        preparation: 'Expect 20-40% of time in meetings',
      },
      {
        surprise: 'The emotional toll of code reviews',
        whySurprising: 'Seems like technical feedback but feels personal',
        sentiment: 'MIXED',
        preparation: 'Develop thick skin and see feedback as growth',
      },
      {
        surprise: 'How much business context matters',
        whySurprising: 'Thought it was just about writing good code',
        sentiment: 'POSITIVE',
        preparation: 'Learn about business, not just technology',
      },
    ],
    whatNobodyTellsYou: [
      'Your code will outlive your tenure - write for the next person',
      'The best engineers are often the best communicators',
      'Politics exist even in technical roles',
      'Most "urgent" bugs are not actually urgent',
      'You will spend more time reading code than writing it',
      'Soft skills become more important as you advance',
      'The tech you learn now will be obsolete in 5-10 years',
    ],
    commonExpectations: [
      { expectation: 'Creative problem-solving all day', isAccurate: false, reality: 'Significant time on maintenance, meetings, and coordination', source: 'Media portrayal' },
      { expectation: 'High salary immediately', isAccurate: true, source: 'Industry reports' },
      { expectation: 'Remote work freedom', isAccurate: true, source: 'Post-COVID reality' },
      { expectation: 'Writing new code constantly', isAccurate: false, reality: '70% reading/debugging existing code', source: 'Education' },
      { expectation: 'Working with latest technologies', isAccurate: false, reality: 'Most companies use older, stable tech', source: 'Hype' },
    ],
    realityFactors: [
      { name: 'Code as Liability', description: 'Code is a liability, not an asset - less is more', surpriseFactor: 70, impact: 75 },
      { name: 'Business Context', description: 'Technical decisions are often business decisions', surpriseFactor: 60, impact: 70 },
      { name: 'User Perspective', description: 'The user does not care about your tech stack', surpriseFactor: 50, impact: 60 },
      { name: 'Documentation Rarity', description: 'Good documentation is rare but invaluable', surpriseFactor: 40, impact: 65 },
      { name: 'Bug Hindsight', description: 'Most bugs are obvious in hindsight', surpriseFactor: 30, impact: 50 },
    ],
    dayInTheLife: {
      narrative: 'Your day starts with checking Slack for any production issues from overnight. After standup, you try to find 2-3 hours of focus time for your main project. This is constantly interrupted by questions, meetings about requirements, and code review requests. By afternoon, you are context-switching between debugging an urgent bug, reviewing a teammate PR, and trying to remember where you were on your own work.',
      variations: [
        { name: 'Deploy Day', when: 'Release days', differences: 'High tension, last-minute fixes, monitoring dashboards' },
        { name: 'Planning Day', when: 'Sprint planning', differences: 'More meetings, less coding, lots of estimation' },
        { name: 'On-Call', when: 'Your rotation week', differences: 'Interrupt-driven, unpredictable, high alert' },
      ],
    },
    stories: [
      {
        title: 'The Feature That Took 6 Months',
        content: 'I thought building a new search feature would take 2 weeks. Six months later, after edge cases, performance optimization, accessibility requirements, and design iterations, it finally shipped. The actual coding was maybe 3 weeks. Everything else was the real work.',
        context: 'Senior Engineer, 5 years experience',
        takeaway: 'Estimates are hard because the unknown unknowns dominate',
      },
    ],
  },
  'product-manager': {
    whatPeopleLove: [
      'Ship products that solve real customer problems',
      'Cross-functional leadership without direct authority',
      'Strategic thinking combined with tactical execution',
      'High visibility and impact on business outcomes',
      'Variety - no two days are the same',
      'Being the voice of the customer',
      'Connecting business goals with user needs',
    ],
    whatPeopleHate: [
      'Death by a thousand stakeholder meetings',
      'Being blamed for decisions you did not make',
      'The pressure to ship without proper validation',
      'Juggling conflicting priorities from different teams',
      'Feature factories that ignore user research',
      'Having responsibility without authority',
      'The endless politics and alignment meetings',
    ],
    whatSurprises: [
      {
        surprise: 'How little of the job is "product strategy"',
        whySurprising: 'Thought it was mainly roadmapping and vision',
        sentiment: 'NEGATIVE',
        preparation: 'Expect 70% coordination, 30% strategy',
      },
      {
        surprise: 'The emotional labor required',
        whySurprising: 'Managing emotions and egos across teams',
        sentiment: 'MIXED',
        preparation: 'Develop emotional intelligence and diplomacy',
      },
      {
        surprise: 'How much data is ambiguous or missing',
        whySurprising: 'Expected clear metrics to drive decisions',
        sentiment: 'MIXED',
        preparation: 'Get comfortable with uncertainty and imperfect data',
      },
    ],
    whatNobodyTellsYou: [
      'You are judged by what ships, not what you planned',
      'The best PMs are former engineers or designers',
      'Your calendar will be back-to-back meetings',
      'Saying "no" is 80% of the job',
      'You will write more emails than you ever imagined',
      'The roadmap is always wrong but necessary',
      'Your job is to create clarity from chaos',
    ],
    commonExpectations: [
      { expectation: 'Creating product strategy and vision', isAccurate: false, reality: 'Mostly coordination and execution', source: 'Job descriptions' },
      { expectation: 'Being the "mini-CEO" of the product', isAccurate: false, reality: 'You influence but do not control', source: 'Tech blogs' },
      { expectation: 'Talking to customers constantly', isAccurate: false, reality: 'Limited by time and access', source: 'Product books' },
      { expectation: 'High impact and visibility', isAccurate: true, source: 'Career sites' },
      { expectation: 'Creative problem-solving', isAccurate: true, source: 'Education' },
    ],
    realityFactors: [
      { name: 'Political Decisions', description: 'Most product decisions are political, not rational', surpriseFactor: 75, impact: 80 },
      { name: 'Relationship Success', description: 'Your success depends on relationships, not frameworks', surpriseFactor: 65, impact: 75 },
      { name: 'Technical Credibility', description: 'Engineers respect PMs who understand technical constraints', surpriseFactor: 50, impact: 70 },
      { name: 'Feature Minimalism', description: 'The best feature is often the one you do not build', surpriseFactor: 60, impact: 65 },
      { name: 'Data Limitations', description: 'Data tells you what happened, not why', surpriseFactor: 55, impact: 60 },
    ],
    dayInTheLife: {
      narrative: 'Your day is a blur of context-switching. Morning standup with engineering, followed by a roadmap review with leadership. Then a user interview, followed by triaging bug reports. Afternoon is spent in a heated debate about feature prioritization, writing requirements for next quarter, and trying to find time to actually think strategically.',
      variations: [
        { name: 'Launch Day', when: 'Feature releases', differences: 'High energy, monitoring metrics, putting out fires' },
        { name: 'Planning Week', when: 'Quarterly planning', differences: 'Intense meetings, negotiation, roadmap creation' },
        { name: 'Research Day', when: 'User research focus', differences: 'Customer calls, synthesis, fewer internal meetings' },
      ],
    },
    stories: [
      {
        title: 'The Feature Nobody Wanted',
        content: 'We spent 3 months building a feature the CEO wanted. Launched with fanfare. Usage was 2% of expectations. Meanwhile, a 2-day hackathon project from engineers became our most-used feature. The lesson: customer proximity beats hierarchy.',
        context: 'Product Manager, 4 years experience',
        takeaway: 'Validation beats authority every time',
      },
    ],
  },
  'investment-banker': {
    whatPeopleLove: [
      'Extraordinary compensation that accelerates wealth building',
      'Working on high-profile deals everyone reads about',
      'Intellectual challenge of complex financial modeling',
      'Prestige and exit opportunities',
      'Incredibly smart and driven colleagues',
      'Learning how businesses actually work',
      'The adrenaline of deal closings',
    ],
    whatPeopleHate: [
      '80-100 hour weeks as a baseline',
      'Sleep deprivation as a lifestyle',
      'Repetitive, grunt work for years',
      'Client demands at all hours',
      'The up-or-out pressure cooker',
      'Missing major life events',
      'The toll on physical and mental health',
    ],
    whatSurprises: [
      {
        surprise: 'How much is administrative work',
        whySurprising: 'Expected sophisticated financial analysis',
        sentiment: 'NEGATIVE',
        preparation: 'Expect significant time on formatting and process',
      },
      {
        surprise: 'The physical toll of the hours',
        whySurprising: 'Thought it was just mentally demanding',
        sentiment: 'NEGATIVE',
        preparation: 'Prioritize health management from day one',
      },
      {
        surprise: 'How transactional relationships are',
        whySurprising: 'Expected deep client relationships',
        sentiment: 'MIXED',
        preparation: 'Understand the business model drives this',
      },
    ],
    whatNobodyTellsYou: [
      'The first 2 years are mostly PowerPoint and Excel formatting',
      'Your social life will evaporate - accept it or quit',
      'The money does not feel worth it after a point',
      'Most people exit by year 3 - plan accordingly',
      'Your health will deteriorate if you do not actively protect it',
      'The prestige matters less as you get older',
      'It is a means to an end, not a career for most',
    ],
    commonExpectations: [
      { expectation: 'Sophisticated financial analysis', isAccurate: false, reality: 'Mostly process work and presentations', source: 'Movies and media' },
      { expectation: 'High-powered deal-making', isAccurate: false, reality: 'Analysts do not make deals', source: 'Industry reputation' },
      { expectation: 'Extremely high compensation', isAccurate: true, source: 'Compensation reports' },
      { expectation: 'Prestigious career', isAccurate: true, source: 'General perception' },
      { expectation: 'Reasonable hours after training', isAccurate: false, reality: 'Hours remain intense', source: 'Recruiting' },
    ],
    realityFactors: [
      { name: 'Hazing Hours', description: 'The hours are a hazing ritual, not business necessity', surpriseFactor: 70, impact: 75 },
      { name: 'Detail Focus', description: 'Attention to detail matters more than intelligence', surpriseFactor: 60, impact: 70 },
      { name: 'Grunt Work Purpose', description: 'Your MDs career depends on your grunt work', surpriseFactor: 55, impact: 60 },
      { name: 'Client Availability', description: 'Client service means being available 24/7', surpriseFactor: 50, impact: 65 },
      { name: 'Exit Justification', description: 'The exit opportunities justify the sacrifice for most', surpriseFactor: 45, impact: 70 },
    ],
    dayInTheLife: {
      narrative: 'You arrive at 9am after 5 hours of sleep. The morning is spent updating pitch books based on last nights comments. Afternoon brings a new fire drill from a managing director. Evening is more revisions. You leave at midnight, knowing you will check emails until 2am. This is a normal Tuesday.',
      variations: [
        { name: 'Live Deal', when: 'Active transactions', differences: 'Intensity doubles, weekend work mandatory, sleep optional' },
        { name: 'Pitch Day', when: 'Client presentations', differences: 'All-nighters, extreme attention to detail, high stakes' },
        { name: 'Slow Day', when: 'Between deals', differences: 'Only 60 hours, catch up on sleep, still on call' },
      ],
    },
    stories: [
      {
        title: 'The Deal That Never Closed',
        content: 'I worked 100-hour weeks for 6 months on a merger. Canceled at the last minute due to regulatory issues. All that work, gone. The MD shrugged and said "on to the next one." That is when I realized I needed an exit plan.',
        context: 'Associate, 2 years experience',
        takeaway: 'Do not get attached - this is a transactional business',
      },
    ],
  },
  'default': {
    whatPeopleLove: [
      'Making a meaningful impact through your work',
      'Professional growth and skill development',
      'Building relationships with colleagues',
      'Achieving challenging goals',
      'Stability and security',
    ],
    whatPeopleHate: [
      'Bureaucracy and inefficient processes',
      'Office politics and unnecessary conflict',
      'Work-life balance challenges',
      'Limited growth opportunities',
      'Unrealistic expectations',
    ],
    whatSurprises: [
      {
        surprise: 'How much depends on relationships',
        whySurprising: 'Expected merit to matter more',
        sentiment: 'MIXED',
        preparation: 'Invest in building genuine relationships',
      },
      {
        surprise: 'The gap between expectation and reality',
        whySurprising: 'Job descriptions rarely match reality',
        sentiment: 'NEGATIVE',
        preparation: 'Talk to people actually doing the job',
      },
    ],
    whatNobodyTellsYou: [
      'Your first job is mostly about learning how to work',
      'The people matter more than the role',
      'Most skills are learned on the job, not in school',
      'Career paths are rarely linear',
      'Luck plays a bigger role than anyone admits',
    ],
    commonExpectations: [
      { expectation: 'Meaningful work immediately', isAccurate: false, reality: 'Entry-level work is often mundane', source: 'Education' },
      { expectation: 'Clear career progression', isAccurate: false, reality: 'Paths are messy and non-linear', source: 'Career planning' },
      { expectation: 'Work-life balance', isAccurate: false, reality: 'Varies greatly by role and company', source: 'Recruiting materials' },
    ],
    realityFactors: [
      { name: 'Culture Over Title', description: 'Company culture matters more than job title', surpriseFactor: 50, impact: 70 },
      { name: 'Manager Impact', description: 'Your manager determines 70% of your experience', surpriseFactor: 60, impact: 80 },
      { name: 'Skill Transfer', description: 'Skills transfer more than you think', surpriseFactor: 40, impact: 60 },
      { name: 'Career Changes', description: 'Most people change careers multiple times', surpriseFactor: 30, impact: 50 },
    ],
    dayInTheLife: {
      narrative: 'A typical day involves a mix of focused work, collaboration with colleagues, meetings, and administrative tasks. The specific balance varies by role and seniority.',
      variations: [
        { name: 'Crunch Time', when: 'Deadlines approaching', differences: 'Longer hours, higher stress, intense focus' },
        { name: 'Planning Period', when: 'Strategic planning', differences: 'More meetings, forward-looking discussions' },
      ],
    },
    stories: [
      {
        title: 'The Reality Check',
        content: 'I spent years preparing for this career. The reality was different from what I imagined, but not worse - just different. Learning to appreciate the actual work rather than the idea of it took time.',
        context: 'Mid-career professional',
        takeaway: 'Separate the idea of a career from its reality',
      },
    ],
  },
};

/**
 * Reality Explanation Engine - Generates career reality explanations.
 */
export class RealityExplanationEngine {
  /**
   * Generate reality explanations for a career.
   */
  generateExplanations(input: RealityExplanationInput): RealityExplanations {
    const template = this.getTemplate(input.careerId, input.careerTitle);

    return {
      whatPeopleLove: template.whatPeopleLove,
      whatPeopleHate: template.whatPeopleHate,
      whatSurprises: template.whatSurprises,
      whatNobodyTellsYou: template.whatNobodyTellsYou,
      theRealDeal: this.generateTheRealDeal(input, template),
      dayInTheLife: this.generateDayInTheLife(input, template),
      stories: template.stories,
    };
  }

  /**
   * Generate reality gap analysis.
   */
  generateRealityGapAnalysis(input: RealityExplanationInput): RealityGapAnalysis {
    const template = this.getTemplate(input.careerId, input.careerTitle);

    return {
      overallGap: this.calculateOverallGap(template),
      commonExpectations: this.generateExpectations(template),
      realityFactors: this.generateRealityFactors(template),
      gaps: this.generateSpecificGaps(template),
      surprises: template.whatSurprises,
      bridgingAdvice: this.generateBridgingAdvice(template),
    };
  }

  /**
   * Generate reality factors.
   */
  private generateRealityFactors(template: RealityTemplate): Array<{ name: string; description: string; surpriseFactor: number; impact: number }> {
    return template.realityFactors;
  }

  /**
   * Get the reality template for a career.
   */
  private getTemplate(careerId: CareerId, careerTitle: string): RealityTemplate {
    for (const [key, template] of Object.entries(CAREER_REALITY_TEMPLATES)) {
      if (careerId.toLowerCase().includes(key)) {
        return template;
      }
    }

    for (const [key, template] of Object.entries(CAREER_REALITY_TEMPLATES)) {
      if (careerTitle.toLowerCase().includes(key.replace('-', ' '))) {
        return template;
      }
    }

    return CAREER_REALITY_TEMPLATES.default;
  }

  /**
   * Calculate overall gap score.
   */
  private calculateOverallGap(template: RealityTemplate): number {
    const inaccurateExpectations = template.commonExpectations.filter((e) => !e.isAccurate).length;
    const totalExpectations = template.commonExpectations.length;
    return Math.round((inaccurateExpectations / totalExpectations) * 100);
  }

  /**
   * Generate expectations.
   */
  private generateExpectations(template: RealityTemplate): Expectation[] {
    return template.commonExpectations.map((exp) => ({
      expectation: exp.expectation,
      commonality: 80,
      source: exp.source,
      isAccurate: exp.isAccurate,
      reality: exp.reality,
    }));
  }

  /**
   * Generate specific gaps.
   */
  private generateSpecificGaps(template: RealityTemplate): SpecificGap[] {
    const gaps: SpecificGap[] = [];

    template.commonExpectations.forEach((exp) => {
      if (!exp.isAccurate && exp.reality) {
        gaps.push({
          aspect: exp.expectation,
          expectation: exp.expectation,
          reality: exp.reality,
          gapMagnitude: 70,
          satisfactionImpact: 60,
        });
      }
    });

    return gaps;
  }

  /**
   * Generate bridging advice.
   */
  private generateBridgingAdvice(template: RealityTemplate): string[] {
    return [
      'Talk to 5+ people actually doing this job before committing',
      'Shadow someone for a day if possible',
      'Start with an internship or contract role',
      'Join communities where professionals discuss their work',
      'Read between the lines of job descriptions',
      'Ask about the worst parts of the job in interviews',
    ];
  }

  /**
   * Generate "the real deal" summary.
   */
  private generateTheRealDeal(input: RealityExplanationInput, template: RealityTemplate): string {
    const loveCount = template.whatPeopleLove.length;
    const hateCount = template.whatPeopleHate.length;
    const gap = this.calculateOverallGap(template);

    let tone: string;
    if (gap > 60) {
      tone = 'The reality of this career differs significantly from common perceptions.';
    } else if (gap > 40) {
      tone = 'This career has some surprises, but the core expectations are mostly accurate.';
    } else {
      tone = 'This career is largely what people expect, with typical workplace variations.';
    }

    const tradeoff = loveCount > hateCount
      ? 'The positives generally outweigh the negatives for those who fit the profile.'
      : 'The challenges are significant and should not be underestimated.';

    return `${tone} ${tradeoff} Success requires ${template.whatNobodyTellsYou[0].toLowerCase()}.`;
  }

  /**
   * Generate day in the life narrative.
   */
  private generateDayInTheLife(
    input: RealityExplanationInput,
    template: RealityTemplate
  ): DayInTheLife {
    return {
      narrative: template.dayInTheLife.narrative,
      hourlyBreakdown: this.generateHourlyBreakdown(input),
      variations: template.dayInTheLife.variations,
    };
  }

  /**
   * Generate hourly breakdown.
   */
  private generateHourlyBreakdown(input: RealityExplanationInput): HourlyActivity[] {
    const breakdown: HourlyActivity[] = [];

    if (input.careerId.includes('software')) {
      breakdown.push(
        { hour: 9, activity: 'Check Slack/email, review overnight alerts', type: 'REACTIVE', energyLevel: 60, stressLevel: 40 },
        { hour: 10, activity: 'Daily standup meeting', type: 'MEETING', energyLevel: 70, stressLevel: 30 },
        { hour: 11, activity: 'Deep work - coding', type: 'DEEP_WORK', energyLevel: 90, stressLevel: 30 },
        { hour: 12, activity: 'Lunch', type: 'BREAK', energyLevel: 50, stressLevel: 10 },
        { hour: 13, activity: 'Code reviews', type: 'ADMIN', energyLevel: 60, stressLevel: 40 },
        { hour: 14, activity: 'Requirements clarification meeting', type: 'MEETING', energyLevel: 70, stressLevel: 40 },
        { hour: 15, activity: 'Debugging production issue', type: 'REACTIVE', energyLevel: 80, stressLevel: 70 },
        { hour: 16, activity: 'Try to resume coding', type: 'DEEP_WORK', energyLevel: 50, stressLevel: 50 },
        { hour: 17, activity: 'Update tickets, document progress', type: 'ADMIN', energyLevel: 40, stressLevel: 30 },
        { hour: 18, activity: 'Plan tomorrow, check emails', type: 'ADMIN', energyLevel: 30, stressLevel: 20 },
      );
    } else if (input.careerId.includes('product')) {
      breakdown.push(
        { hour: 9, activity: 'Check metrics and emails', type: 'ADMIN', energyLevel: 60, stressLevel: 40 },
        { hour: 10, activity: 'Standup with engineering', type: 'MEETING', energyLevel: 70, stressLevel: 30 },
        { hour: 11, activity: 'User interview', type: 'MEETING', energyLevel: 80, stressLevel: 30 },
        { hour: 12, activity: 'Lunch', type: 'BREAK', energyLevel: 50, stressLevel: 10 },
        { hour: 13, activity: 'Stakeholder alignment meeting', type: 'MEETING', energyLevel: 75, stressLevel: 50 },
        { hour: 14, activity: 'Review designs with designer', type: 'MEETING', energyLevel: 70, stressLevel: 40 },
        { hour: 15, activity: 'Data analysis', type: 'DEEP_WORK', energyLevel: 75, stressLevel: 40 },
        { hour: 16, activity: 'Prioritization discussion', type: 'MEETING', energyLevel: 80, stressLevel: 60 },
        { hour: 17, activity: 'Update roadmap', type: 'ADMIN', energyLevel: 50, stressLevel: 40 },
        { hour: 18, activity: 'Answer Slack messages', type: 'REACTIVE', energyLevel: 40, stressLevel: 30 },
      );
    } else {
      breakdown.push(
        { hour: 9, activity: 'Start day, review priorities', type: 'ADMIN', energyLevel: 60, stressLevel: 30 },
        { hour: 10, activity: 'Morning meetings', type: 'MEETING', energyLevel: 70, stressLevel: 40 },
        { hour: 11, activity: 'Focused work', type: 'DEEP_WORK', energyLevel: 80, stressLevel: 40 },
        { hour: 12, activity: 'Lunch', type: 'BREAK', energyLevel: 50, stressLevel: 10 },
        { hour: 13, activity: 'Afternoon meetings', type: 'MEETING', energyLevel: 70, stressLevel: 40 },
        { hour: 14, activity: 'Collaboration', type: 'SOCIAL', energyLevel: 75, stressLevel: 30 },
        { hour: 15, activity: 'Project work', type: 'DEEP_WORK', energyLevel: 70, stressLevel: 40 },
        { hour: 16, activity: 'Administrative tasks', type: 'ADMIN', energyLevel: 50, stressLevel: 30 },
        { hour: 17, activity: 'Wrap up and plan', type: 'ADMIN', energyLevel: 40, stressLevel: 20 },
      );
    }

    return breakdown;
  }

  /**
   * Generate comparison between expectation and reality.
   */
  generateExpectationVsReality(
    expectation: string,
    input: RealityExplanationInput
  ): { expectation: string; reality: string; gap: number } {
    const template = this.getTemplate(input.careerId, input.careerTitle);

    const matchedExp = template.commonExpectations.find(
      (e) => e.expectation.toLowerCase() === expectation.toLowerCase()
    );

    if (matchedExp) {
      return {
        expectation: matchedExp.expectation,
        reality: matchedExp.reality || matchedExp.expectation,
        gap: matchedExp.isAccurate ? 10 : 70,
      };
    }

    return {
      expectation,
      reality: 'Reality varies widely depending on company and team',
      gap: 50,
    };
  }

  /**
   * Get top misconceptions for a career.
   */
  getTopMisconceptions(careerId: CareerId, limit: number = 3): string[] {
    const template = this.getTemplate(careerId, '');
    return template.commonExpectations
      .filter((e) => !e.isAccurate)
      .slice(0, limit)
      .map((e) => e.expectation);
  }

  /**
   * Get key reality checks for a career.
   */
  getRealityChecks(careerId: CareerId, limit: number = 5): string[] {
    const template = this.getTemplate(careerId, '');
    return template.whatNobodyTellsYou.slice(0, limit);
  }
}

/**
 * Factory function for RealityExplanationEngine.
 */
export function createRealityExplanationEngine(): RealityExplanationEngine {
  return new RealityExplanationEngine();
}
