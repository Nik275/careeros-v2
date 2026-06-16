/**
 * Action Intelligence - Action Generator Engine
 *
 * Generates actionable steps across multiple time horizons.
 * Transforms career intelligence into concrete "what to do next" items.
 *
 * @module intelligence/action-intelligence
 */

import type {
  EntityId,
  BeliefTimestamp,
  StudentBelief,
  CareerRecommendation,
  CareerPath,
} from '../../types';

import type {
  Action,
  ActionIntelligenceInput,
  ResourceRequirement,
} from '../types';
import { ActionPriority, ActionStatus, ActionType, TimeHorizon } from '../types';

/**
 * Action Generator Engine Configuration
 */
export interface ActionGeneratorConfig {
  /** Maximum actions per time horizon */
  maxActionsPerHorizon: number;

  /** Whether to include optional actions */
  includeOptionalActions: boolean;

  /** Whether to generate recovery actions */
  includeRecoveryActions: boolean;

  /** Whether to consider family constraints */
  respectFamilyConstraints: boolean;

  /** Minimum confidence threshold for actions */
  minActionConfidence: number;

  /** Default action duration in hours */
  defaultActionDuration: number;
}

/**
 * Default configuration
 */
export const DEFAULT_ACTION_GENERATOR_CONFIG: ActionGeneratorConfig = {
  maxActionsPerHorizon: 10,
  includeOptionalActions: true,
  includeRecoveryActions: true,
  respectFamilyConstraints: true,
  minActionConfidence: 0.6,
  defaultActionDuration: 10,
};

/**
 * Action Generator Engine
 *
 * Generates specific, actionable items across time horizons.
 */
export class ActionGenerator {
  private config: ActionGeneratorConfig;

  constructor(config: Partial<ActionGeneratorConfig> = {}) {
    this.config = { ...DEFAULT_ACTION_GENERATOR_CONFIG, ...config };
  }

  /**
   * Generate all actions for a student based on their intelligence
   */
  generate(input: ActionIntelligenceInput): Record<TimeHorizon, Action[]> {
    const actions: Record<TimeHorizon, Action[]> = {
      [TimeHorizon.NEXT_7_DAYS]: [],
      [TimeHorizon.NEXT_30_DAYS]: [],
      [TimeHorizon.NEXT_90_DAYS]: [],
      [TimeHorizon.NEXT_1_YEAR]: [],
      [TimeHorizon.NEXT_3_YEARS]: [],
    };

    // Generate immediate actions (7 days)
    actions[TimeHorizon.NEXT_7_DAYS] = this.generateImmediateActions(input);

    // Generate short-term actions (30 days)
    actions[TimeHorizon.NEXT_30_DAYS] = this.generateShortTermActions(input);

    // Generate medium-term actions (90 days)
    actions[TimeHorizon.NEXT_90_DAYS] = this.generateMediumTermActions(input);

    // Generate long-term actions (1 year)
    actions[TimeHorizon.NEXT_1_YEAR] = this.generateLongTermActions(input);

    // Generate extended actions (3 years)
    actions[TimeHorizon.NEXT_3_YEARS] = this.generateExtendedActions(input);

    return actions;
  }

  /**
   * Generate immediate actions (next 7 days)
   */
  private generateImmediateActions(input: ActionIntelligenceInput): Action[] {
    const actions: Action[] = [];
    const timestamp = Date.now();
    const targetCareer = input.targetCareer || 'Target Career';

    // Action 1: Research target career
    actions.push({
      id: this.generateActionId(),
      title: `Research ${targetCareer} role and requirements`,
      description: `Spend 2-3 hours understanding what ${targetCareer} actually does day-to-day. Read job descriptions, watch day-in-the-life videos, and understand the skills required.`,
      type: ActionType.RESEARCH,
      priority: ActionPriority.HIGH,
      status: ActionStatus.NOT_STARTED,
      timeHorizon: TimeHorizon.NEXT_7_DAYS,
      estimatedDuration: 3,
      resourcesRequired: [
        { type: 'TIME', amount: 3, unit: 'hours', isNegotiable: false },
        { type: 'EQUIPMENT', amount: 1, unit: 'internet access', isNegotiable: false },
      ],
      skillsDeveloped: ['Research Skills', 'Industry Knowledge'],
      prerequisites: [],
      tags: ['research', 'career-exploration', 'immediate'],
      source: 'ActionGenerator',
      expectedOutcome: `Clear understanding of ${targetCareer} responsibilities, requirements, and expectations`,
      successCriteria: [
        'Read at least 5 job descriptions',
        'Watch 2+ day-in-the-life videos',
        'Document key skills required',
      ],
      strategicContribution: 'Foundation for all subsequent career planning decisions',
      confidence: 0.95,
      generatedAt: timestamp,
    });

    // Action 2: Assess current skills
    actions.push({
      id: this.generateActionId(),
      title: 'Assess your current skills against requirements',
      description: 'Create a honest inventory of your current skills. Compare them against what your target career requires. Identify 3-5 skill gaps to focus on.',
      type: ActionType.REFLECT,
      priority: ActionPriority.CRITICAL,
      status: ActionStatus.NOT_STARTED,
      timeHorizon: TimeHorizon.NEXT_7_DAYS,
      estimatedDuration: 2,
      resourcesRequired: [
        { type: 'TIME', amount: 2, unit: 'hours', isNegotiable: false },
      ],
      skillsDeveloped: ['Self-Awareness', 'Gap Analysis'],
      prerequisites: [actions[actions.length - 1].id],
      tags: ['assessment', 'skill-gap', 'critical'],
      source: 'ActionGenerator',
      expectedOutcome: 'Clear list of skill gaps to address',
      successCriteria: [
        'List all current relevant skills',
        'Identify top 5 required skills for target',
        'Document skill gaps with priority',
      ],
      strategicContribution: 'Identifies what needs to be learned for career transition',
      confidence: 0.9,
      generatedAt: timestamp,
    });

    // Action 3: Set up learning environment
    actions.push({
      id: this.generateActionId(),
      title: 'Set up your learning environment',
      description: 'Create a dedicated study space, organize your schedule, and set up tools/accounts needed for learning (GitHub, LinkedIn, online course platforms).',
      type: ActionType.EXECUTE,
      priority: ActionPriority.HIGH,
      status: ActionStatus.NOT_STARTED,
      timeHorizon: TimeHorizon.NEXT_7_DAYS,
      estimatedDuration: 4,
      resourcesRequired: [
        { type: 'TIME', amount: 4, unit: 'hours', isNegotiable: true },
      ],
      skillsDeveloped: ['Organization', 'Time Management'],
      prerequisites: [],
      tags: ['setup', 'infrastructure', 'planning'],
      source: 'ActionGenerator',
      expectedOutcome: 'Ready-to-use learning environment with all necessary tools',
      successCriteria: [
        'Dedicated study space created',
        'Weekly schedule blocked for learning',
        'All necessary accounts created',
        'Learning resources bookmarked',
      ],
      strategicContribution: 'Removes friction from daily learning habits',
      confidence: 0.95,
      generatedAt: timestamp,
    });

    // Action 4: Find one person in target field
    actions.push({
      id: this.generateActionId(),
      title: `Find one person working as ${targetCareer}`,
      description: 'Use LinkedIn, your network, or alumni database to find someone currently working in your target role. This person will be your first informational interview.',
      type: ActionType.NETWORK,
      priority: ActionPriority.MEDIUM,
      status: ActionStatus.NOT_STARTED,
      timeHorizon: TimeHorizon.NEXT_7_DAYS,
      estimatedDuration: 2,
      resourcesRequired: [
        { type: 'TIME', amount: 2, unit: 'hours', isNegotiable: true },
        { type: 'EQUIPMENT', amount: 1, unit: 'LinkedIn account', isNegotiable: false },
      ],
      skillsDeveloped: ['Networking', 'Research'],
      prerequisites: [],
      tags: ['networking', 'informational-interview', 'outreach'],
      source: 'ActionGenerator',
      expectedOutcome: 'Identified at least one person to reach out to for advice',
      successCriteria: [
        'Found 3+ potential contacts',
        'Researched their background',
        'Drafted initial outreach message',
      ],
      strategicContribution: 'Builds network and provides insider perspective',
      confidence: 0.85,
      generatedAt: timestamp,
    });

    // Action 5: Create learning schedule
    actions.push({
      id: this.generateActionId(),
      title: 'Create weekly learning schedule',
      description: 'Based on your available hours, create a realistic weekly schedule for skill development. Include specific times for learning, practice, and networking.',
      type: ActionType.PREPARE,
      priority: ActionPriority.HIGH,
      status: ActionStatus.NOT_STARTED,
      timeHorizon: TimeHorizon.NEXT_7_DAYS,
      estimatedDuration: 2,
      resourcesRequired: [
        { type: 'TIME', amount: 2, unit: 'hours', isNegotiable: false },
      ],
      skillsDeveloped: ['Planning', 'Time Management'],
      prerequisites: [actions[1].id], // Depends on skill assessment
      tags: ['planning', 'schedule', 'time-management'],
      source: 'ActionGenerator',
      expectedOutcome: 'Realistic weekly schedule that fits your constraints',
      successCriteria: [
        'Schedule includes 10+ learning hours per week',
        'Specific time slots blocked',
        'Family/commitments considered',
        'Buffer time included',
      ],
      strategicContribution: 'Ensures consistent progress through structured time allocation',
      confidence: 0.9,
      generatedAt: timestamp,
    });

    // Add family consultation if family constraints exist
    if (input.constraints?.family?.requiresApproval) {
      actions.push({
        id: this.generateActionId(),
        title: 'Discuss career plan with family',
        description: `Schedule a conversation with your family to discuss your interest in ${targetCareer}. Share your research and ask for their input and support.`,
        type: ActionType.DECIDE,
        priority: ActionPriority.CRITICAL,
        status: ActionStatus.NOT_STARTED,
        timeHorizon: TimeHorizon.NEXT_7_DAYS,
        estimatedDuration: 2,
        resourcesRequired: [
          { type: 'TIME', amount: 2, unit: 'hours', isNegotiable: false },
          { type: 'SUPPORT', amount: 1, unit: 'family discussion', isNegotiable: false },
        ],
        skillsDeveloped: ['Communication', 'Negotiation'],
        prerequisites: [actions[0].id],
        tags: ['family', 'communication', 'decision', 'critical'],
        source: 'ActionGenerator',
        expectedOutcome: 'Family understanding and buy-in for career plan',
        successCriteria: [
          'Family meeting scheduled and completed',
          'Career plan explained clearly',
          'Concerns addressed',
          'Support secured or concerns documented',
        ],
        strategicContribution: 'Critical for family-supported career transitions in Indian context',
        confidence: 0.85,
        generatedAt: timestamp,
      });
    }

    return this.limitActions(actions, this.config.maxActionsPerHorizon);
  }

  /**
   * Generate short-term actions (next 30 days)
   */
  private generateShortTermActions(input: ActionIntelligenceInput): Action[] {
    const actions: Action[] = [];
    const timestamp = Date.now();
    const targetCareer = input.targetCareer || 'Target Career';

    // Action 1: Start first skill-building course
    actions.push({
      id: this.generateActionId(),
      title: 'Enroll in foundational skill course',
      description: 'Identify and enroll in an online course that teaches the most critical missing skill for your target career. Commit to completing it within 30 days.',
      type: ActionType.LEARN,
      priority: ActionPriority.CRITICAL,
      status: ActionStatus.NOT_STARTED,
      timeHorizon: TimeHorizon.NEXT_30_DAYS,
      estimatedDuration: 30,
      resourcesRequired: [
        { type: 'TIME', amount: 30, unit: 'hours', isNegotiable: false },
        { type: 'MONEY', amount: 5000, unit: 'INR', isNegotiable: true },
      ],
      skillsDeveloped: ['Technical Skills', 'Self-Learning'],
      prerequisites: [],
      tags: ['learning', 'course', 'skill-building', 'critical'],
      source: 'ActionGenerator',
      expectedOutcome: 'Completed foundational course with certificate/portfolio piece',
      successCriteria: [
        'Course selected and enrolled',
        '30+ hours spent learning',
        'Course completed or 50% done',
        'Key concepts documented',
      ],
      strategicContribution: 'Builds foundational competency for target role',
      confidence: 0.9,
      generatedAt: timestamp,
    });

    // Action 2: Conduct 2 informational interviews
    actions.push({
      id: this.generateActionId(),
      title: 'Complete 2 informational interviews',
      description: `Reach out to and speak with 2 professionals working as ${targetCareer}. Ask about their journey, daily work, and advice for someone starting out.`,
      type: ActionType.NETWORK,
      priority: ActionPriority.HIGH,
      status: ActionStatus.NOT_STARTED,
      timeHorizon: TimeHorizon.NEXT_30_DAYS,
      estimatedDuration: 6,
      resourcesRequired: [
        { type: 'TIME', amount: 6, unit: 'hours', isNegotiable: false },
      ],
      skillsDeveloped: ['Networking', 'Communication', 'Industry Knowledge'],
      prerequisites: [],
      tags: ['networking', 'informational-interview', 'research'],
      source: 'ActionGenerator',
      expectedOutcome: 'Two conversations with industry professionals and documented insights',
      successCriteria: [
        '2+ people contacted',
        '2 conversations completed',
        'Notes taken from each conversation',
        'Follow-up thank you messages sent',
      ],
      strategicContribution: 'Provides insider knowledge and expands professional network',
      confidence: 0.8,
      generatedAt: timestamp,
    });

    // Action 3: Build first portfolio project
    actions.push({
      id: this.generateActionId(),
      title: 'Complete first portfolio project',
      description: 'Apply what you learn by building a small but complete project that demonstrates your target skills. This will be the first item in your portfolio.',
      type: ActionType.PRACTICE,
      priority: ActionPriority.HIGH,
      status: ActionStatus.NOT_STARTED,
      timeHorizon: TimeHorizon.NEXT_30_DAYS,
      estimatedDuration: 20,
      resourcesRequired: [
        { type: 'TIME', amount: 20, unit: 'hours', isNegotiable: false },
      ],
      skillsDeveloped: ['Practical Skills', 'Portfolio Building'],
      prerequisites: [],
      tags: ['project', 'portfolio', 'practice', 'hands-on'],
      source: 'ActionGenerator',
      expectedOutcome: 'One completed project ready to showcase',
      successCriteria: [
        'Project scope defined',
        'Project completed',
        'Documented on GitHub/portfolio',
        'Can explain project to others',
      ],
      strategicContribution: 'Demonstrates capability to employers',
      confidence: 0.85,
      generatedAt: timestamp,
    });

    // Action 4: Join relevant online community
    actions.push({
      id: this.generateActionId(),
      title: 'Join and engage in professional community',
      description: 'Find and join an online community (Discord, Slack, forum) related to your target field. Participate in discussions and start building relationships.',
      type: ActionType.NETWORK,
      priority: ActionPriority.MEDIUM,
      status: ActionStatus.NOT_STARTED,
      timeHorizon: TimeHorizon.NEXT_30_DAYS,
      estimatedDuration: 8,
      resourcesRequired: [
        { type: 'TIME', amount: 8, unit: 'hours', isNegotiable: true },
      ],
      skillsDeveloped: ['Community Engagement', 'Professional Networking'],
      prerequisites: [],
      tags: ['community', 'networking', 'engagement'],
      source: 'ActionGenerator',
      expectedOutcome: 'Active member of at least one professional community',
      successCriteria: [
        'Community identified and joined',
        'Introduction post made',
        '5+ meaningful contributions',
        'Connected with 2+ members',
      ],
      strategicContribution: 'Builds network and keeps up with industry trends',
      confidence: 0.8,
      generatedAt: timestamp,
    });

    // Action 5: Create LinkedIn profile optimization plan
    actions.push({
      id: this.generateActionId(),
      title: 'Optimize LinkedIn profile for target career',
      description: 'Update your LinkedIn headline, summary, and experience sections to reflect your career pivot. Add relevant skills and start sharing content related to your target field.',
      type: ActionType.EXECUTE,
      priority: ActionPriority.MEDIUM,
      status: ActionStatus.NOT_STARTED,
      timeHorizon: TimeHorizon.NEXT_30_DAYS,
      estimatedDuration: 6,
      resourcesRequired: [
        { type: 'TIME', amount: 6, unit: 'hours', isNegotiable: true },
      ],
      skillsDeveloped: ['Personal Branding', 'Professional Communication'],
      prerequisites: [],
      tags: ['linkedin', 'branding', 'profile', 'visibility'],
      source: 'ActionGenerator',
      expectedOutcome: 'LinkedIn profile optimized for target career visibility',
      successCriteria: [
        'Headline updated with target role',
        'Summary rewritten for pivot',
        'Relevant skills added',
        'First post published',
      ],
      strategicContribution: 'Increases visibility to recruiters and hiring managers',
      confidence: 0.85,
      generatedAt: timestamp,
    });

    // Action 6: Research certification options
    actions.push({
      id: this.generateActionId(),
      title: 'Research relevant certifications',
      description: `Identify 2-3 industry-recognized certifications that would boost your credibility as a ${targetCareer}. Understand requirements, costs, and preparation time.`,
      type: ActionType.RESEARCH,
      priority: ActionPriority.MEDIUM,
      status: ActionStatus.NOT_STARTED,
      timeHorizon: TimeHorizon.NEXT_30_DAYS,
      estimatedDuration: 4,
      resourcesRequired: [
        { type: 'TIME', amount: 4, unit: 'hours', isNegotiable: true },
      ],
      skillsDeveloped: ['Research', 'Career Planning'],
      prerequisites: [],
      tags: ['certification', 'research', 'credentials'],
      source: 'ActionGenerator',
      expectedOutcome: 'Clear understanding of certification options and roadmap',
      successCriteria: [
        '3+ certifications researched',
        'Requirements documented',
        'Costs and timeline noted',
        'Priority order determined',
      ],
      strategicContribution: 'Identifies credentials that accelerate career entry',
      confidence: 0.85,
      generatedAt: timestamp,
    });

    return this.limitActions(actions, this.config.maxActionsPerHorizon);
  }

  /**
   * Generate medium-term actions (next 90 days)
   */
  private generateMediumTermActions(input: ActionIntelligenceInput): Action[] {
    const actions: Action[] = [];
    const timestamp = Date.now();
    const targetCareer = input.targetCareer || 'Target Career';

    // Action 1: Complete 2-3 advanced courses
    actions.push({
      id: this.generateActionId(),
      title: 'Complete advanced skill courses',
      description: 'Build on your foundation by completing 2-3 more advanced courses in your target field. Focus on practical, job-relevant skills.',
      type: ActionType.LEARN,
      priority: ActionPriority.CRITICAL,
      status: ActionStatus.NOT_STARTED,
      timeHorizon: TimeHorizon.NEXT_90_DAYS,
      estimatedDuration: 80,
      resourcesRequired: [
        { type: 'TIME', amount: 80, unit: 'hours', isNegotiable: false },
        { type: 'MONEY', amount: 15000, unit: 'INR', isNegotiable: true },
      ],
      skillsDeveloped: ['Advanced Technical Skills'],
      prerequisites: [],
      tags: ['learning', 'advanced', 'courses', 'skill-building'],
      source: 'ActionGenerator',
      expectedOutcome: 'Advanced competency in 2-3 key skill areas',
      successCriteria: [
        '2-3 courses completed',
        'Projects built for each course',
        'Skills applied in practice',
        'Certificates earned',
      ],
      strategicContribution: 'Builds depth of expertise required for employment',
      confidence: 0.85,
      generatedAt: timestamp,
    });

    // Action 2: Build comprehensive portfolio
    actions.push({
      id: this.generateActionId(),
      title: 'Build comprehensive project portfolio',
      description: 'Create 3-4 substantial projects that demonstrate your capabilities. Host them online with clear documentation and case studies.',
      type: ActionType.PRACTICE,
      priority: ActionPriority.CRITICAL,
      status: ActionStatus.NOT_STARTED,
      timeHorizon: TimeHorizon.NEXT_90_DAYS,
      estimatedDuration: 60,
      resourcesRequired: [
        { type: 'TIME', amount: 60, unit: 'hours', isNegotiable: false },
      ],
      skillsDeveloped: ['Project Management', 'Portfolio Development'],
      prerequisites: [],
      tags: ['portfolio', 'projects', 'showcase'],
      source: 'ActionGenerator',
      expectedOutcome: 'Portfolio website with 3-4 quality projects',
      successCriteria: [
        'Portfolio website created',
        '3+ projects completed',
        'Each project has case study',
        'Projects demonstrate range of skills',
      ],
      strategicContribution: 'Primary evidence of capability for job applications',
      confidence: 0.85,
      generatedAt: timestamp,
    });

    // Action 3: Attend industry events
    actions.push({
      id: this.generateActionId(),
      title: 'Attend 2 industry events or webinars',
      description: 'Participate in conferences, meetups, or webinars related to your target field. Network with attendees and learn about industry trends.',
      type: ActionType.NETWORK,
      priority: ActionPriority.MEDIUM,
      status: ActionStatus.NOT_STARTED,
      timeHorizon: TimeHorizon.NEXT_90_DAYS,
      estimatedDuration: 16,
      resourcesRequired: [
        { type: 'TIME', amount: 16, unit: 'hours', isNegotiable: true },
        { type: 'MONEY', amount: 5000, unit: 'INR', isNegotiable: true },
      ],
      skillsDeveloped: ['Networking', 'Industry Knowledge'],
      prerequisites: [],
      tags: ['events', 'networking', 'industry', 'conferences'],
      source: 'ActionGenerator',
      expectedOutcome: 'Attended 2 events and made 5+ new connections',
      successCriteria: [
        '2 events attended',
        'Notes taken on key learnings',
        '5+ new contacts made',
        'Follow-up messages sent',
      ],
      strategicContribution: 'Expands network and demonstrates professional engagement',
      confidence: 0.75,
      generatedAt: timestamp,
    });

    // Action 4: Find mentorship opportunity
    actions.push({
      id: this.generateActionId(),
      title: 'Secure mentorship relationship',
      description: 'Find a mentor working in your target field who can provide guidance, feedback, and accountability. This could be formal or informal.',
      type: ActionType.NETWORK,
      priority: ActionPriority.HIGH,
      status: ActionStatus.NOT_STARTED,
      timeHorizon: TimeHorizon.NEXT_90_DAYS,
      estimatedDuration: 12,
      resourcesRequired: [
        { type: 'TIME', amount: 12, unit: 'hours', isNegotiable: false },
      ],
      skillsDeveloped: ['Mentorship', 'Professional Relationship Building'],
      prerequisites: [],
      tags: ['mentorship', 'guidance', 'networking'],
      source: 'ActionGenerator',
      expectedOutcome: 'Established mentorship relationship with regular check-ins',
      successCriteria: [
        '3+ potential mentors identified',
        'Outreach completed',
        'Mentor relationship established',
        'First meeting completed',
        'Check-in schedule agreed',
      ],
      strategicContribution: 'Provides guidance and accelerates learning curve',
      confidence: 0.7,
      generatedAt: timestamp,
    });

    // Action 5: Complete certification (if applicable)
    actions.push({
      id: this.generateActionId(),
      title: 'Earn first industry certification',
      description: 'Complete and pass at least one recognized certification exam in your field. This adds credibility to your profile.',
      type: ActionType.LEARN,
      priority: ActionPriority.HIGH,
      status: ActionStatus.NOT_STARTED,
      timeHorizon: TimeHorizon.NEXT_90_DAYS,
      estimatedDuration: 40,
      resourcesRequired: [
        { type: 'TIME', amount: 40, unit: 'hours', isNegotiable: false },
        { type: 'MONEY', amount: 15000, unit: 'INR', isNegotiable: false },
      ],
      skillsDeveloped: ['Test Preparation', 'Certified Knowledge'],
      prerequisites: [],
      tags: ['certification', 'credential', 'exam'],
      source: 'ActionGenerator',
      expectedOutcome: 'Industry certification earned and added to profile',
      successCriteria: [
        'Certification selected',
        'Study materials obtained',
        'Exam preparation completed',
        'Certification earned',
      ],
      strategicContribution: 'Validates skills and improves job prospects',
      confidence: 0.75,
      generatedAt: timestamp,
    });

    // Action 6: Apply for internships/part-time roles
    actions.push({
      id: this.generateActionId(),
      title: 'Apply for internships or part-time roles',
      description: `Start applying for entry-level positions, internships, or freelance projects in ${targetCareer}. Aim for 10+ applications.`,
      type: ActionType.APPLY,
      priority: ActionPriority.HIGH,
      status: ActionStatus.NOT_STARTED,
      timeHorizon: TimeHorizon.NEXT_90_DAYS,
      estimatedDuration: 20,
      resourcesRequired: [
        { type: 'TIME', amount: 20, unit: 'hours', isNegotiable: false },
      ],
      skillsDeveloped: ['Job Search', 'Application Skills'],
      prerequisites: [],
      tags: ['applications', 'internship', 'job-search'],
      source: 'ActionGenerator',
      expectedOutcome: '10+ applications submitted and interview experience gained',
      successCriteria: [
        'Resume tailored for target role',
        '10+ applications submitted',
        'Application tracker maintained',
        'Interview practice completed',
      ],
      strategicContribution: 'Moves from learning to earning experience',
      confidence: 0.7,
      generatedAt: timestamp,
    });

    return this.limitActions(actions, this.config.maxActionsPerHorizon);
  }

  /**
   * Generate long-term actions (1 year)
   */
  private generateLongTermActions(input: ActionIntelligenceInput): Action[] {
    const actions: Action[] = [];
    const timestamp = Date.now();
    const targetCareer = input.targetCareer || 'Target Career';

    // Action 1: Secure first role in target field
    actions.push({
      id: this.generateActionId(),
      title: `Secure first ${targetCareer} role`,
      description: `Land your first job, internship, or significant freelance project as a ${targetCareer}. This validates your transition and provides real-world experience.`,
      type: ActionType.APPLY,
      priority: ActionPriority.CRITICAL,
      status: ActionStatus.NOT_STARTED,
      timeHorizon: TimeHorizon.NEXT_1_YEAR,
      estimatedDuration: 100,
      resourcesRequired: [
        { type: 'TIME', amount: 100, unit: 'hours', isNegotiable: false },
      ],
      skillsDeveloped: ['Job Search', 'Interview Skills', 'Professional Experience'],
      prerequisites: [],
      tags: ['job-search', 'career-transition', 'employment'],
      source: 'ActionGenerator',
      expectedOutcome: 'Accepted job offer or secured significant project',
      successCriteria: [
        'Resume optimized',
        '50+ applications submitted',
        'Portfolio presented in interviews',
        'Offer received and accepted',
      ],
      strategicContribution: 'Primary goal: transition into target career',
      confidence: 0.7,
      generatedAt: timestamp,
    });

    // Action 2: Build professional network
    actions.push({
      id: this.generateActionId(),
      title: 'Build network of 50+ industry professionals',
      description: 'Grow your professional network to 50+ relevant connections. Maintain regular engagement and provide value to your network.',
      type: ActionType.NETWORK,
      priority: ActionPriority.HIGH,
      status: ActionStatus.NOT_STARTED,
      timeHorizon: TimeHorizon.NEXT_1_YEAR,
      estimatedDuration: 80,
      resourcesRequired: [
        { type: 'TIME', amount: 80, unit: 'hours', isNegotiable: true },
      ],
      skillsDeveloped: ['Networking', 'Relationship Management'],
      prerequisites: [],
      tags: ['networking', 'professional-network', 'connections'],
      source: 'ActionGenerator',
      expectedOutcome: '50+ meaningful professional connections',
      successCriteria: [
        '50+ LinkedIn connections in field',
        'Regular engagement with network',
        '5+ deep relationships established',
        'Network providing opportunities',
      ],
      strategicContribution: 'Network enables future opportunities and career growth',
      confidence: 0.75,
      generatedAt: timestamp,
    });

    // Action 3: Establish thought leadership
    actions.push({
      id: this.generateActionId(),
      title: 'Establish thought leadership presence',
      description: 'Share your learning journey through blog posts, LinkedIn articles, or talks. Position yourself as a growing expert in your field.',
      type: ActionType.EXECUTE,
      priority: ActionPriority.MEDIUM,
      status: ActionStatus.NOT_STARTED,
      timeHorizon: TimeHorizon.NEXT_1_YEAR,
      estimatedDuration: 60,
      resourcesRequired: [
        { type: 'TIME', amount: 60, unit: 'hours', isNegotiable: true },
      ],
      skillsDeveloped: ['Content Creation', 'Thought Leadership'],
      prerequisites: [],
      tags: ['content', 'thought-leadership', 'branding'],
      source: 'ActionGenerator',
      expectedOutcome: 'Visible presence in field with regular content',
      successCriteria: [
        '6+ blog posts/articles published',
        'Regular LinkedIn updates',
        'Speaking opportunity or webinar',
        'Growing follower base',
      ],
      strategicContribution: 'Builds reputation and attracts opportunities',
      confidence: 0.65,
      generatedAt: timestamp,
    });

    // Action 4: Complete advanced specialization
    actions.push({
      id: this.generateActionId(),
      title: 'Complete advanced specialization',
      description: 'Deepen expertise by completing an advanced course, bootcamp, or specialization in a niche area of your field.',
      type: ActionType.LEARN,
      priority: ActionPriority.MEDIUM,
      status: ActionStatus.NOT_STARTED,
      timeHorizon: TimeHorizon.NEXT_1_YEAR,
      estimatedDuration: 120,
      resourcesRequired: [
        { type: 'TIME', amount: 120, unit: 'hours', isNegotiable: false },
        { type: 'MONEY', amount: 50000, unit: 'INR', isNegotiable: true },
      ],
      skillsDeveloped: ['Specialized Expertise'],
      prerequisites: [],
      tags: ['specialization', 'advanced-learning', 'expertise'],
      source: 'ActionGenerator',
      expectedOutcome: 'Advanced specialization completed and applied',
      successCriteria: [
        'Specialization area identified',
        'Advanced course completed',
        'Specialized project built',
        'Expertise demonstrated',
      ],
      strategicContribution: 'Differentiates from generalists and increases value',
      confidence: 0.7,
      generatedAt: timestamp,
    });

    return this.limitActions(actions, this.config.maxActionsPerHorizon);
  }

  /**
   * Generate extended actions (3 years)
   */
  private generateExtendedActions(input: ActionIntelligenceInput): Action[] {
    const actions: Action[] = [];
    const timestamp = Date.now();
    const targetCareer = input.targetCareer || 'Target Career';

    // Action 1: Achieve senior-level competency
    actions.push({
      id: this.generateActionId(),
      title: `Achieve senior-level ${targetCareer} competency`,
      description: `Develop expertise and experience to operate at senior level as ${targetCareer}. Lead projects, mentor juniors, and drive impact.`,
      type: ActionType.EXECUTE,
      priority: ActionPriority.CRITICAL,
      status: ActionStatus.NOT_STARTED,
      timeHorizon: TimeHorizon.NEXT_3_YEARS,
      estimatedDuration: 300,
      resourcesRequired: [
        { type: 'TIME', amount: 300, unit: 'hours', isNegotiable: false },
      ],
      skillsDeveloped: ['Leadership', 'Advanced Expertise'],
      prerequisites: [],
      tags: ['career-growth', 'senior-level', 'expertise'],
      source: 'ActionGenerator',
      expectedOutcome: 'Operating at senior level with proven track record',
      successCriteria: [
        'Led significant projects',
        'Mentored junior professionals',
        'Recognized expertise in field',
        'Advanced role or promotion achieved',
      ],
      strategicContribution: 'Long-term career advancement goal',
      confidence: 0.6,
      generatedAt: timestamp,
    });

    // Action 2: Build multiple income streams
    actions.push({
      id: this.generateActionId(),
      title: 'Develop multiple income streams',
      description: 'Diversify income through consulting, teaching, content creation, or side projects related to your expertise.',
      type: ActionType.EXECUTE,
      priority: ActionPriority.MEDIUM,
      status: ActionStatus.NOT_STARTED,
      timeHorizon: TimeHorizon.NEXT_3_YEARS,
      estimatedDuration: 150,
      resourcesRequired: [
        { type: 'TIME', amount: 150, unit: 'hours', isNegotiable: true },
      ],
      skillsDeveloped: ['Entrepreneurship', 'Business Development'],
      prerequisites: [],
      tags: ['income-diversification', 'side-income', 'entrepreneurship'],
      source: 'ActionGenerator',
      expectedOutcome: 'Multiple income streams generating revenue',
      successCriteria: [
        'Secondary income source established',
        '20%+ income from secondary sources',
        'Scalable income stream growing',
        'Financial security improved',
      ],
      strategicContribution: 'Financial security and career optionality',
      confidence: 0.55,
      generatedAt: timestamp,
    });

    // Action 3: Contribute to industry
    actions.push({
      id: this.generateActionId(),
      title: 'Make meaningful industry contributions',
      description: 'Give back to your field through open source contributions, teaching, conference speaking, or community leadership.',
      type: ActionType.EXECUTE,
      priority: ActionPriority.MEDIUM,
      status: ActionStatus.NOT_STARTED,
      timeHorizon: TimeHorizon.NEXT_3_YEARS,
      estimatedDuration: 100,
      resourcesRequired: [
        { type: 'TIME', amount: 100, unit: 'hours', isNegotiable: true },
      ],
      skillsDeveloped: ['Leadership', 'Community Building'],
      prerequisites: [],
      tags: ['contribution', 'giving-back', 'leadership'],
      source: 'ActionGenerator',
      expectedOutcome: 'Recognized contributor to industry/community',
      successCriteria: [
        'Open source contributions made',
        'Conference talk delivered',
        'Students mentored or taught',
        'Community initiative led',
      ],
      strategicContribution: 'Builds legacy and professional reputation',
      confidence: 0.55,
      generatedAt: timestamp,
    });

    return this.limitActions(actions, this.config.maxActionsPerHorizon);
  }

  /**
   * Generate unique action ID
   */
  private generateActionId(): EntityId {
    return `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Limit actions to maximum per horizon
   */
  private limitActions(actions: Action[], limit: number): Action[] {
    // Sort by priority first
    const priorityOrder = {
      [ActionPriority.CRITICAL]: 0,
      [ActionPriority.HIGH]: 1,
      [ActionPriority.MEDIUM]: 2,
      [ActionPriority.LOW]: 3,
      [ActionPriority.OPTIONAL]: 4,
    };

    const sorted = actions.sort((a, b) => {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Take top actions up to limit
    const limited = sorted.slice(0, limit);

    // If we're filtering out optional actions, respect config
    if (!this.config.includeOptionalActions) {
      return limited.filter(a => a.priority !== ActionPriority.OPTIONAL);
    }

    return limited;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ActionGeneratorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): ActionGeneratorConfig {
    return { ...this.config };
  }
}

/**
 * Factory function to create ActionGenerator
 */
export function createActionGenerator(
  config?: Partial<ActionGeneratorConfig>
): ActionGenerator {
  return new ActionGenerator(config);
}
