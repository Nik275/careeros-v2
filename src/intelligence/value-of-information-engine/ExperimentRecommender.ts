/**
 * CareerOS Value of Information Engine - Experiment Recommender
 *
 * Recommends hands-on experiments for information gathering:
 * - Coding projects
 * - Product projects
 * - Research projects
 * - Shadowing
 * - Internships
 * - Volunteering
 * - Freelance work
 * - Startup challenges
 */

import type {
  InformationGap,
  ExperimentRecommendation,
  ExperimentType,
  InformationGapCategory,
  ExperimentRecommendationResult,
  ValueOfInformationEngineConfig,
} from './types';

/**
 * Recommends experiments for information gathering.
 */
export class ExperimentRecommender {
  private config: ValueOfInformationEngineConfig;

  constructor(config: ValueOfInformationEngineConfig) {
    this.config = config;
  }

  /**
   * Main entry point: recommend experiments based on gaps.
   */
  recommend(gaps: InformationGap[]): ExperimentRecommendationResult {
    const experiments: ExperimentRecommendation[] = [];

    // Analyze gaps to determine which experiments are most valuable
    const gapCategories = new Set(gaps.map((g) => g.category));

    // Recommend experiments based on gap categories
    if (this.shouldRecommendCodingProject(gaps)) {
      experiments.push(this.createCodingProjectRecommendation(gaps));
    }

    if (this.shouldRecommendProductProject(gaps)) {
      experiments.push(this.createProductProjectRecommendation(gaps));
    }

    if (this.shouldRecommendResearchProject(gaps)) {
      experiments.push(this.createResearchProjectRecommendation(gaps));
    }

    if (this.shouldRecommendShadowing(gaps)) {
      experiments.push(this.createShadowingRecommendation(gaps));
    }

    if (this.shouldRecommendInternship(gaps)) {
      experiments.push(this.createInternshipRecommendation(gaps));
    }

    if (this.shouldRecommendVolunteering(gaps)) {
      experiments.push(this.createVolunteeringRecommendation(gaps));
    }

    if (this.shouldRecommendFreelance(gaps)) {
      experiments.push(this.createFreelanceRecommendation(gaps));
    }

    if (this.shouldRecommendStartupChallenge(gaps)) {
      experiments.push(this.createStartupChallengeRecommendation(gaps));
    }

    // Sort by value
    experiments.sort((a, b) => b.valueOfInformation - a.valueOfInformation);

    // Limit results
    const limitedExperiments = experiments.slice(0, this.config.maxExperiments);

    // Group by type
    const byType = this.groupByType(limitedExperiments);

    // Group by category
    const byCategory = this.groupByCategory(limitedExperiments);

    // Top recommendation
    const topRecommendation = limitedExperiments[0] || null;

    return {
      experiments: limitedExperiments,
      byType,
      byCategory,
      topRecommendation,
    };
  }

  /**
   * Determine if coding project should be recommended.
   */
  private shouldRecommendCodingProject(gaps: InformationGap[]): boolean {
    return gaps.some(
      (g) =>
        g.category === 'skills' ||
        (g.category === 'interest' && g.aspect.toLowerCase().includes('technical'))
    );
  }

  /**
   * Determine if product project should be recommended.
   */
  private shouldRecommendProductProject(gaps: InformationGap[]): boolean {
    return gaps.some(
      (g) =>
        g.category === 'aptitude' ||
        g.category === 'values' ||
        (g.category === 'skills' && g.aspect.toLowerCase().includes('product'))
    );
  }

  /**
   * Determine if research project should be recommended.
   */
  private shouldRecommendResearchProject(gaps: InformationGap[]): boolean {
    return gaps.some(
      (g) =>
        g.category === 'identity' ||
        (g.category === 'interest' && g.aspect.toLowerCase().includes('research'))
    );
  }

  /**
   * Determine if shadowing should be recommended.
   */
  private shouldRecommendShadowing(gaps: InformationGap[]): boolean {
    return gaps.some(
      (g) =>
        g.category === 'market' ||
        (g.category === 'interest' && g.currentUncertainty > 0.6)
    );
  }

  /**
   * Determine if internship should be recommended.
   */
  private shouldRecommendInternship(gaps: InformationGap[]): boolean {
    return gaps.some(
      (g) =>
        g.category === 'identity' ||
        g.category === 'skills' ||
        g.priority === 'critical'
    );
  }

  /**
   * Determine if volunteering should be recommended.
   */
  private shouldRecommendVolunteering(gaps: InformationGap[]): boolean {
    return gaps.some(
      (g) =>
        g.category === 'values' ||
        (g.category === 'interest' && g.aspect.toLowerCase().includes('social'))
    );
  }

  /**
   * Determine if freelance work should be recommended.
   */
  private shouldRecommendFreelance(gaps: InformationGap[]): boolean {
    return gaps.some(
      (g) =>
        g.category === 'aptitude' ||
        g.category === 'skills' ||
        (g.category === 'constraints' && g.aspect.toLowerCase().includes('economic'))
    );
  }

  /**
   * Determine if startup challenge should be recommended.
   */
  private shouldRecommendStartupChallenge(gaps: InformationGap[]): boolean {
    return gaps.some(
      (g) =>
        g.category === 'aptitude' ||
        (g.category === 'values' && g.aspect.toLowerCase().includes('entrepreneurship'))
    );
  }

  /**
   * Create coding project recommendation.
   */
  private createCodingProjectRecommendation(gaps: InformationGap[]): ExperimentRecommendation {
    const relevantGaps = gaps.filter(
      (g) => g.category === 'skills' || g.category === 'interest'
    );
    const priority = this.calculatePriority(relevantGaps);

    return {
      id: 'exp-coding-project',
      type: 'coding-project',
      name: 'Build a Portfolio Coding Project',
      description:
        'Develop a complete software project that demonstrates technical skills. This could be a web application, mobile app, data analysis project, or automation tool. The project should solve a real problem you care about.',
      reveals: ['skills', 'aptitude', 'interest'],
      assesses: [
        'Technical problem-solving',
        'Learning velocity',
        'Attention to detail',
        'Self-directed learning',
        'Persistence',
        'Technical communication',
      ],
      howTo: {
        steps: [
          'Identify a problem you want to solve',
          'Choose appropriate technology stack',
          'Design the solution architecture',
          'Implement core features',
          'Test and refine',
          'Document your work',
          'Deploy and share',
        ],
        resources: [
          'Online tutorials and documentation',
          'Open source project examples',
          'Developer communities (Stack Overflow, GitHub)',
          'Mentor or code review partner',
        ],
        timeline: '2-4 weeks part-time',
        successCriteria: [
          'Working solution deployed',
          'Code is documented and readable',
          'Can explain technical decisions',
          'Would enjoy doing similar work professionally',
        ],
      },
      expectedOutcomes: {
        informationValue: 0.75,
        confidenceGain: 0.4,
        skillDevelopment: ['Programming', 'Problem-solving', 'Self-directed learning'],
      },
      comparisonToAlternatives: {
        vsAssessment:
          'More authentic than aptitude tests - shows actual work product and real problem-solving',
        vsInterview:
          'Demonstrates sustained effort and learning capacity, not just verbal skills',
        vsCourse:
          'Self-directed learning reveals intrinsic motivation and independent work style',
      },
      valueOfInformation: this.calculateVOI(relevantGaps),
      priority,
    };
  }

  /**
   * Create product project recommendation.
   */
  private createProductProjectRecommendation(gaps: InformationGap[]): ExperimentRecommendation {
    const relevantGaps = gaps.filter(
      (g) => g.category === 'aptitude' || g.category === 'values'
    );
    const priority = this.calculatePriority(relevantGaps);

    return {
      id: 'exp-product-project',
      type: 'product-project',
      name: 'Design and Validate a Product Concept',
      description:
        'Take a product idea from concept to validated prototype. Conduct user research, create wireframes, build a simple prototype, and test with potential users. No coding required.',
      reveals: ['aptitude', 'values', 'interest'],
      assesses: [
        'User empathy',
        'Design thinking',
        'Communication skills',
        'Analytical thinking',
        'Project management',
        'Comfort with ambiguity',
      ],
      howTo: {
        steps: [
          'Identify a user problem to solve',
          'Conduct 5-10 user interviews',
          'Synthesize findings into insights',
          'Create user personas and journey maps',
          'Design solution concept and wireframes',
          'Build paper or digital prototype',
          'Test prototype with 5+ users',
          'Iterate based on feedback',
        ],
        resources: [
          'Product management blogs and books',
          'Design thinking frameworks',
          'Prototype tools (Figma, Balsamiq)',
          'User research templates',
        ],
        timeline: '3-6 weeks part-time',
        successCriteria: [
          'Identified real user pain points',
          'Created tested prototype',
          'Received actionable feedback',
          'Enjoyed the product development process',
        ],
      },
      expectedOutcomes: {
        informationValue: 0.8,
        confidenceGain: 0.45,
        skillDevelopment: [
          'User research',
          'Product thinking',
          'Design communication',
        ],
      },
      comparisonToAlternatives: {
        vsAssessment:
          'Reveals actual product intuition and user empathy, not just theoretical knowledge',
        vsInterview:
          'Demonstrates tangible skills and real user validation, not just claims',
        vsCourse:
          'Applied learning with real stakeholders tests true interest and aptitude',
      },
      valueOfInformation: this.calculateVOI(relevantGaps),
      priority,
    };
  }

  /**
   * Create research project recommendation.
   */
  private createResearchProjectRecommendation(gaps: InformationGap[]): ExperimentRecommendation {
    const relevantGaps = gaps.filter(
      (g) => g.category === 'identity' || g.category === 'interest'
    );
    const priority = this.calculatePriority(relevantGaps);

    return {
      id: 'exp-research-project',
      type: 'research-project',
      name: 'Conduct Independent Research',
      description:
        'Design and execute a small research project on a topic of interest. This could be academic research, market research, or investigative journalism. Produce a written report or presentation of findings.',
      reveals: ['identity', 'interest', 'aptitude'],
      assesses: [
        'Curiosity and inquiry',
        'Analytical thinking',
        'Written communication',
        'Information synthesis',
        'Intellectual persistence',
        'Critical thinking',
      ],
      howTo: {
        steps: [
          'Choose a research question',
          'Conduct literature review',
          'Design research methodology',
          'Collect and analyze data',
          'Draw conclusions',
          'Present findings',
        ],
        resources: [
          'Academic databases',
          'Research methodology guides',
          'Mentor or advisor',
          'Writing resources',
        ],
        timeline: '4-8 weeks',
        successCriteria: [
          'Original research question',
          'Rigorous methodology',
          'Clear findings',
          'Would enjoy research career',
        ],
      },
      expectedOutcomes: {
        informationValue: 0.7,
        confidenceGain: 0.35,
        skillDevelopment: ['Research methods', 'Critical thinking', 'Academic writing'],
      },
      comparisonToAlternatives: {
        vsAssessment:
          'Shows sustained intellectual engagement, not just test performance',
        vsInterview:
          'Produces tangible evidence of analytical capabilities',
        vsCourse:
          'Self-directed research reveals intrinsic motivation and independence',
      },
      valueOfInformation: this.calculateVOI(relevantGaps),
      priority,
    };
  }

  /**
   * Create shadowing recommendation.
   */
  private createShadowingRecommendation(gaps: InformationGap[]): ExperimentRecommendation {
    const relevantGaps = gaps.filter((g) => g.category === 'market' || g.category === 'interest');
    const priority = this.calculatePriority(relevantGaps);

    return {
      id: 'exp-shadowing',
      type: 'shadowing',
      name: 'Job Shadowing Experience',
      description:
        'Spend 1-3 days observing a professional in a target career. Observe daily tasks, work environment, and professional interactions. Ask questions about career realities, challenges, and satisfaction.',
      reveals: ['market', 'interest', 'values'],
      assesses: [
        'Interest in daily work',
        'Work environment fit',
        'Professional culture fit',
        'Realistic career expectations',
      ],
      howTo: {
        steps: [
          'Identify target career and professional',
          'Request shadowing opportunity',
          'Prepare observation questions',
          'Shadow for 1-3 days',
          'Document observations',
          'Reflect on fit and interest',
        ],
        resources: [
          'Professional networks',
          'LinkedIn for outreach',
          'Career services connections',
          'Alumni networks',
        ],
        timeline: '1-3 days',
        successCriteria: [
          'Observed daily tasks',
          'Understood work environment',
          'Can articulate fit assessment',
          'Confirmed or disconfirmed interest',
        ],
      },
      expectedOutcomes: {
        informationValue: 0.65,
        confidenceGain: 0.3,
        skillDevelopment: ['Professional observation', 'Informational interviewing'],
      },
      comparisonToAlternatives: {
        vsAssessment:
          'Real-world observation vs. theoretical knowledge - much more authentic',
        vsInterview:
          'Direct experience vs. second-hand information',
        vsCourse:
          'Actual workplace exposure vs. classroom learning',
      },
      valueOfInformation: this.calculateVOI(relevantGaps),
      priority,
    };
  }

  /**
   * Create internship recommendation.
   */
  private createInternshipRecommendation(gaps: InformationGap[]): ExperimentRecommendation {
    const relevantGaps = gaps.filter(
      (g) => g.category === 'identity' || g.category === 'skills'
    );
    const priority = this.calculatePriority(relevantGaps);

    return {
      id: 'exp-internship',
      type: 'internship',
      name: 'Targeted Internship Experience',
      description:
        'Complete a 2-3 month internship in a target career field. This provides deep immersion in professional context, skill development, and career identity formation.',
      reveals: ['identity', 'skills', 'values', 'aptitude'],
      assesses: [
        'Professional identity fit',
        'Skill application and development',
        'Work environment preferences',
        'Professional growth trajectory',
        'Organizational culture fit',
      ],
      howTo: {
        steps: [
          'Identify target field and role',
          'Apply to internship positions',
          'Complete internship commitment',
          'Document learning and growth',
          'Reflect on career fit',
          'Update career narrative',
        ],
        resources: [
          'Career services office',
          'Job boards',
          'Professional networks',
          'Company websites',
        ],
        timeline: '2-3 months full-time',
        successCriteria: [
          'Completed internship successfully',
          'Developed relevant skills',
          'Formed professional identity',
          'Can articulate career direction',
        ],
      },
      expectedOutcomes: {
        informationValue: 0.9,
        confidenceGain: 0.6,
        skillDevelopment: [
          'Professional skills',
          'Workplace navigation',
          'Career identity',
        ],
      },
      comparisonToAlternatives: {
        vsAssessment:
          'Months of real performance data vs. single test snapshot',
        vsInterview:
          'Sustained professional experience vs. brief conversation',
        vsCourse:
          'Applied workplace learning vs. theoretical classroom study',
      },
      valueOfInformation: this.calculateVOI(relevantGaps),
      priority,
    };
  }

  /**
   * Create volunteering recommendation.
   */
  private createVolunteeringRecommendation(gaps: InformationGap[]): ExperimentRecommendation {
    const relevantGaps = gaps.filter((g) => g.category === 'values' || g.category === 'interest');
    const priority = this.calculatePriority(relevantGaps);

    return {
      id: 'exp-volunteering',
      type: 'volunteering',
      name: 'Impact Volunteering Project',
      description:
        'Volunteer in a role aligned with target career or values. Choose a position with meaningful responsibility that allows skill application and values expression.',
      reveals: ['values', 'interest', 'skills'],
      assesses: [
        'Values in action',
        'Commitment to mission',
        'Skill application',
        'Social impact orientation',
      ],
      howTo: {
        steps: [
          'Identify cause area of interest',
          'Find volunteer role with responsibility',
          'Commit to sustained engagement',
          'Take on challenging tasks',
          'Reflect on values alignment',
        ],
        resources: [
          'Volunteer match websites',
          'Nonprofit organizations',
          'Community service offices',
          'Professional associations',
        ],
        timeline: 'Ongoing, 5-10 hours/week',
        successCriteria: [
          'Sustained commitment demonstrated',
          'Values expressed through action',
          'Skills applied effectively',
          'Impact created',
        ],
      },
      expectedOutcomes: {
        informationValue: 0.6,
        confidenceGain: 0.25,
        skillDevelopment: ['Social impact', 'Values clarification', 'Commitment'],
      },
      comparisonToAlternatives: {
        vsAssessment:
          'Values in action vs. values on paper',
        vsInterview:
          'Demonstrated commitment vs. stated intentions',
        vsCourse:
          'Real-world impact vs. academic learning',
      },
      valueOfInformation: this.calculateVOI(relevantGaps),
      priority,
    };
  }

  /**
   * Create freelance recommendation.
   */
  private createFreelanceRecommendation(gaps: InformationGap[]): ExperimentRecommendation {
    const relevantGaps = gaps.filter(
      (g) => g.category === 'aptitude' || g.category === 'skills' || g.category === 'constraints'
    );
    const priority = this.calculatePriority(relevantGaps);

    return {
      id: 'exp-freelance',
      type: 'freelance',
      name: 'Freelance Project Experience',
      description:
        'Take on a paid freelance project in your target skill area. This tests commercial viability, client interaction, and independent work capabilities.',
      reveals: ['aptitude', 'skills', 'constraints'],
      assesses: [
        'Marketable skills',
        'Client management',
        'Business acumen',
        'Self-employment fit',
        'Income potential',
      ],
      howTo: {
        steps: [
          'Identify marketable skill',
          'Create portfolio or profile',
          'Find first client/project',
          'Deliver quality work',
          'Reflect on experience',
        ],
        resources: [
          'Freelance platforms',
          'Personal network',
          'Portfolio website',
          'Mentor or coach',
        ],
        timeline: '1-4 weeks per project',
        successCriteria: [
          'Completed paid project',
          'Client satisfaction',
          'Income earned',
          'Enjoyed independent work',
        ],
      },
      expectedOutcomes: {
        informationValue: 0.85,
        confidenceGain: 0.5,
        skillDevelopment: ['Client work', 'Business skills', 'Self-employment'],
      },
      comparisonToAlternatives: {
        vsAssessment:
          'Commercial validation vs. theoretical capability',
        vsInterview:
          'Real market feedback vs. simulated scenarios',
        vsCourse:
          'Paid work experience vs. educational training',
      },
      valueOfInformation: this.calculateVOI(relevantGaps),
      priority,
    };
  }

  /**
   * Create startup challenge recommendation.
   */
  private createStartupChallengeRecommendation(gaps: InformationGap[]): ExperimentRecommendation {
    const relevantGaps = gaps.filter(
      (g) => g.category === 'aptitude' || g.category === 'values'
    );
    const priority = this.calculatePriority(relevantGaps);

    return {
      id: 'exp-startup-challenge',
      type: 'startup-challenge',
      name: 'Entrepreneurship Challenge',
      description:
        'Participate in a startup weekend, hackathon, or entrepreneurship challenge. Develop a business concept, validate with customers, and pitch to judges.',
      reveals: ['aptitude', 'values', 'interest'],
      assesses: [
        'Entrepreneurial mindset',
        'Risk tolerance',
        'Rapid learning',
        'Team collaboration',
        'Presentation skills',
        'Resilience',
      ],
      howTo: {
        steps: [
          'Find upcoming startup challenge',
          'Form or join a team',
          'Develop business concept',
          'Validate with customers',
          'Build prototype or MVP',
          'Pitch to judges',
        ],
        resources: [
          'Startup weekend events',
          'University entrepreneurship programs',
          'Online startup communities',
          'Mentor networks',
        ],
        timeline: 'Weekend to 1 week intensive',
        successCriteria: [
          'Completed challenge',
          'Validated business concept',
          'Enjoyed startup environment',
          'Built entrepreneurial confidence',
        ],
      },
      expectedOutcomes: {
        informationValue: 0.75,
        confidenceGain: 0.4,
        skillDevelopment: ['Entrepreneurship', 'Rapid prototyping', 'Pitching'],
      },
      comparisonToAlternatives: {
        vsAssessment:
          'Intensive real-world test vs. static personality measures',
        vsInterview:
          'Proven execution under pressure vs. verbal claims',
        vsCourse:
          'Applied entrepreneurship vs. classroom theory',
      },
      valueOfInformation: this.calculateVOI(relevantGaps),
      priority,
    };
  }

  /**
   * Calculate priority based on gap severities.
   */
  private calculatePriority(gaps: InformationGap[]): 'critical' | 'high' | 'medium' | 'low' {
    if (gaps.some((g) => g.priority === 'critical')) return 'critical';
    if (gaps.some((g) => g.priority === 'high')) return 'high';
    if (gaps.some((g) => g.priority === 'medium')) return 'medium';
    return 'low';
  }

  /**
   * Calculate value of information for gaps.
   */
  private calculateVOI(gaps: InformationGap[]): number {
    if (gaps.length === 0) return 0;

    const avgVOI =
      gaps.reduce((sum, g) => sum + g.informationValue, 0) / gaps.length;

    // Scale based on priority
    const hasCritical = gaps.some((g) => g.priority === 'critical');
    const hasHigh = gaps.some((g) => g.priority === 'high');

    if (hasCritical) return Math.min(avgVOI * 1.5, 1);
    if (hasHigh) return Math.min(avgVOI * 1.2, 1);

    return avgVOI;
  }

  /**
   * Group experiments by type.
   */
  private groupByType(
    experiments: ExperimentRecommendation[]
  ): Record<ExperimentType, ExperimentRecommendation[]> {
    const grouped: Partial<Record<ExperimentType, ExperimentRecommendation[]>> = {};

    const types: ExperimentType[] = [
      'coding-project',
      'product-project',
      'research-project',
      'shadowing',
      'internship',
      'volunteering',
      'freelance',
      'startup-challenge',
      'case-competition',
      'portfolio-project',
    ];

    for (const type of types) {
      grouped[type] = experiments.filter((e) => e.type === type);
    }

    return grouped as Record<ExperimentType, ExperimentRecommendation[]>;
  }

  /**
   * Group experiments by information category.
   */
  private groupByCategory(
    experiments: ExperimentRecommendation[]
  ): Record<InformationGapCategory, ExperimentRecommendation[]> {
    const grouped: Partial<Record<InformationGapCategory, ExperimentRecommendation[]>> = {};

    const categories: InformationGapCategory[] = [
      'interest',
      'aptitude',
      'values',
      'skills',
      'market',
      'identity',
      'constraints',
      'outcomes',
    ];

    for (const category of categories) {
      grouped[category] = experiments.filter((e) => e.reveals.includes(category));
    }

    return grouped as Record<InformationGapCategory, ExperimentRecommendation[]>;
  }
}

/**
 * Factory function for ExperimentRecommender.
 */
export function createExperimentRecommender(
  config: ValueOfInformationEngineConfig
): ExperimentRecommender {
  return new ExperimentRecommender(config);
}
