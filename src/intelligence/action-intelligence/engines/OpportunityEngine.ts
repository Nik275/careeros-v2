/**
 * Action Intelligence - Opportunity Engine
 *
 * Identifies and recommends opportunities for career development:
 * - Courses and certifications
 * - Projects and competitions
 * - Internships and jobs
 * - Networking and mentorship
 * - Communities and events
 *
 * @module intelligence/action-intelligence
 */

import type {
  EntityId,
  BeliefTimestamp,
} from '../../types';

import type {
  Opportunity,
  OpportunityBundle,
  OpportunityType,
  ActionPriority,
  ActionIntelligenceInput,
  ResourceRequirement,
} from '../types';

/**
 * Opportunity Engine Configuration
 */
export interface OpportunityEngineConfig {
  /** Maximum opportunities per category */
  maxOpportunitiesPerCategory: number;

  /** Minimum fit score to recommend */
  minimumFitScore: number;

  /** Include paid opportunities */
  includePaidOpportunities: boolean;

  /** Include location-restricted opportunities */
  includeLocationRestricted: boolean;

  /** Default opportunity duration */
  defaultDuration: string;

  /** Whether to suggest Indian-specific opportunities */
  prioritizeIndianOpportunities: boolean;
}

/**
 * Default configuration
 */
export const DEFAULT_OPPORTUNITY_CONFIG: OpportunityEngineConfig = {
  maxOpportunitiesPerCategory: 5,
  minimumFitScore: 0.6,
  includePaidOpportunities: true,
  includeLocationRestricted: true,
  defaultDuration: '3 months',
  prioritizeIndianOpportunities: true,
};

/**
 * Opportunity Engine
 *
 * Generates relevant opportunities based on target career and constraints.
 */
export class OpportunityEngine {
  private config: OpportunityEngineConfig;

  constructor(config: Partial<OpportunityEngineConfig> = {}) {
    this.config = { ...DEFAULT_OPPORTUNITY_CONFIG, ...config };
  }

  /**
   * Generate opportunities for a student
   */
  generate(
    input: ActionIntelligenceInput,
    targetCareer?: string
  ): OpportunityBundle[] {
    const target = targetCareer || input.targetCareer || 'Target Career';

    const bundles: OpportunityBundle[] = [
      this.generateCourses(input, target),
      this.generateProjects(input, target),
      this.generateCompetitions(input, target),
      this.generateInternships(input, target),
      this.generateMentorships(input, target),
      this.generateCommunities(input, target),
      this.generateEvents(input, target),
      this.generateCertifications(input, target),
    ];

    return bundles.filter(b => b.opportunities.length > 0);
  }

  /**
   * Generate course recommendations
   */
  private generateCourses(
    input: ActionIntelligenceInput,
    targetCareer: string
  ): OpportunityBundle {
    const opportunities: Opportunity[] = [];
    const timestamp = Date.now();

    // Coursera courses
    opportunities.push({
      id: this.generateOpportunityId(),
      name: `${targetCareer} Specialization`,
      type: 'COURSE' as OpportunityType,
      description: `Comprehensive Coursera specialization covering all aspects of ${targetCareer}. Self-paced with hands-on projects.`,
      provider: 'Coursera (Top Universities)',
      cost: { amount: 3500, currency: 'INR', breakdown: 'Monthly subscription or individual courses' },
      timeCommitment: { duration: '3-6 months', hoursPerWeek: 10 },
      location: { type: 'ONLINE' },
      skillsDeveloped: ['Core technical skills', 'Industry best practices'],
      prerequisites: ['Basic computer skills'],
      applicationProcess: 'Enroll directly on Coursera',
      benefits: ['University-branded certificate', 'Portfolio projects', 'Industry recognition'],
      fitScore: 0.85,
      recommendationRationale: 'Comprehensive curriculum from top universities with recognized credentials',
      relatedCareerPaths: [],
      priority: 'HIGH' as ActionPriority,
      source: 'OpportunityEngine',
    });

    // Indian platforms
    if (this.config.prioritizeIndianOpportunities) {
      opportunities.push({
        id: this.generateOpportunityId(),
        name: `${targetCareer} Certification Program`,
        type: 'COURSE' as OpportunityType,
        description: `Industry-aligned program with Indian market focus and job placement support.`,
        provider: 'upGrad / Scalar / Pesto',
        cost: { amount: 50000, currency: 'INR', breakdown: 'Program fee with EMI options' },
        timeCommitment: { duration: '6-9 months', hoursPerWeek: 15 },
        location: { type: 'ONLINE' },
        skillsDeveloped: ['Job-ready skills', 'Interview preparation'],
        prerequisites: ['Graduation or final year students'],
        applicationProcess: 'Apply online, entrance assessment',
        benefits: ['Job placement support', 'Mentorship', 'Industry projects', 'Alumni network'],
        fitScore: 0.8,
        recommendationRationale: 'Indian context with strong placement record and payment plans',
        relatedCareerPaths: [],
        priority: 'HIGH' as ActionPriority,
        source: 'OpportunityEngine',
      });
    }

    // Free resources
    opportunities.push({
      id: this.generateOpportunityId(),
      name: 'FreeCodeCamp / The Odin Project',
      type: 'COURSE' as OpportunityType,
      description: 'Completely free, self-paced curriculum with project-based learning.',
      provider: 'FreeCodeCamp / Open Source',
      cost: { amount: 0, currency: 'INR', breakdown: 'Free' },
      timeCommitment: { duration: '6-12 months', hoursPerWeek: 10 },
      location: { type: 'ONLINE' },
      skillsDeveloped: ['Practical coding skills', 'Project building'],
      prerequisites: ['Self-motivation'],
      applicationProcess: 'Sign up for free',
      benefits: ['Free certification', 'Portfolio projects', 'Community support'],
      fitScore: 0.75,
      recommendationRationale: 'Zero cost option with strong community and practical focus',
      relatedCareerPaths: [],
      priority: 'MEDIUM' as ActionPriority,
      source: 'OpportunityEngine',
    });

    return {
      category: 'Courses',
      description: 'Structured learning programs to build foundational and advanced skills',
      opportunities: this.filterAndRankOpportunities(opportunities),
      recommendedOpportunityIds: [],
    };
  }

  /**
   * Generate project recommendations
   */
  private generateProjects(
    input: ActionIntelligenceInput,
    targetCareer: string
  ): OpportunityBundle {
    const opportunities: Opportunity[] = [];

    const projectIdeas: Record<string, string[]> = {
      'Software Engineer': [
        'Build a full-stack web application',
        'Create a mobile app',
        'Develop an API service',
        'Contribute to open source',
      ],
      'Product Manager': [
        'Redesign a popular app feature',
        'Conduct user research study',
        'Create product strategy document',
        'Build a product from scratch',
      ],
      'Data Scientist': [
        'Kaggle competition project',
        'Public dataset analysis',
        'Predictive model deployment',
        'Data visualization dashboard',
      ],
      'UX Designer': [
        'App redesign case study',
        'Design system creation',
        'User research project',
        'Interactive prototype',
      ],
    };

    const ideas = projectIdeas[targetCareer] || ['Build a portfolio project demonstrating key skills'];

    ideas.forEach((idea, index) => {
      opportunities.push({
        id: this.generateOpportunityId(),
        name: idea,
        type: 'PROJECT' as OpportunityType,
        description: `Self-directed project to demonstrate ${targetCareer} capabilities and build portfolio.`,
        provider: 'Self-directed',
        timeCommitment: { duration: '4-8 weeks', hoursPerWeek: 15 },
        location: { type: 'ONLINE' },
        skillsDeveloped: ['Practical application', 'Portfolio building'],
        prerequisites: ['Basic skills in domain'],
        applicationProcess: 'Start anytime',
        benefits: ['Portfolio piece', 'Practical experience', 'Demonstrated capability'],
        fitScore: 0.9,
        recommendationRationale: 'Essential for demonstrating skills to employers',
        relatedCareerPaths: [],
        priority: 'CRITICAL' as ActionPriority,
        source: 'OpportunityEngine',
      });
    });

    return {
      category: 'Projects',
      description: 'Hands-on projects to build portfolio and demonstrate capabilities',
      opportunities: this.filterAndRankOpportunities(opportunities),
      recommendedOpportunityIds: [],
    };
  }

  /**
   * Generate competition recommendations
   */
  private generateCompetitions(
    input: ActionIntelligenceInput,
    targetCareer: string
  ): OpportunityBundle {
    const opportunities: Opportunity[] = [];

    // Common competitions
    opportunities.push({
      id: this.generateOpportunityId(),
      name: 'Smart India Hackathon',
      type: 'COMPETITION' as OpportunityType,
      description: 'India\'s largest hackathon solving real government and industry problems.',
      provider: 'Government of India',
      timeCommitment: { duration: '48 hours + preparation', hoursPerWeek: 5 },
      location: { type: 'HYBRID' },
      skillsDeveloped: ['Rapid prototyping', 'Teamwork', 'Problem solving'],
      prerequisites: ['College student status', 'Team of 6'],
      applicationProcess: 'Register through college SIH coordinator',
      benefits: ['Cash prizes', 'Job opportunities', 'Government recognition', 'Networking'],
      fitScore: 0.8,
      recommendationRationale: 'Prestigious national competition with career benefits',
      relatedCareerPaths: [],
      priority: 'MEDIUM' as ActionPriority,
      source: 'OpportunityEngine',
    });

    if (targetCareer.includes('Data') || targetCareer.includes('Machine Learning')) {
      opportunities.push({
        id: this.generateOpportunityId(),
        name: 'Kaggle Competitions',
        type: 'COMPETITION' as OpportunityType,
        description: 'Data science competitions with real-world datasets and prizes.',
        provider: 'Kaggle (Google)',
        timeCommitment: { duration: '2-3 months', hoursPerWeek: 10 },
        location: { type: 'ONLINE' },
        skillsDeveloped: ['Data analysis', 'Machine learning', 'Model optimization'],
        prerequisites: ['Programming knowledge', 'Statistics basics'],
        applicationProcess: 'Join competitions on Kaggle.com',
        benefits: ['Cash prizes', 'Medals for profile', 'Learning from solutions', 'Job offers'],
        fitScore: 0.85,
        recommendationRationale: 'Industry-recognized platform for data science skills',
        relatedCareerPaths: [],
        priority: 'HIGH' as ActionPriority,
        source: 'OpportunityEngine',
      });
    }

    return {
      category: 'Competitions',
      description: 'Competitive events to test skills and gain recognition',
      opportunities: this.filterAndRankOpportunities(opportunities),
      recommendedOpportunityIds: [],
    };
  }

  /**
   * Generate internship recommendations
   */
  private generateInternships(
    input: ActionIntelligenceInput,
    targetCareer: string
  ): OpportunityBundle {
    const opportunities: Opportunity[] = [];

    opportunities.push({
      id: this.generateOpportunityId(),
      name: `Summer Internship - ${targetCareer}`,
      type: 'INTERNSHIP' as OpportunityType,
      description: `2-3 month internship to gain real-world ${targetCareer} experience.`,
      provider: 'Various Companies',
      timeCommitment: { duration: '2-3 months', hoursPerWeek: 40 },
      location: { type: 'HYBRID' },
      skillsDeveloped: ['Professional experience', 'Industry practices', 'Workplace skills'],
      prerequisites: ['Relevant skills', 'Resume', 'Interview preparation'],
      applicationProcess: 'Apply through company portals or LinkedIn',
      applicationDeadline: Date.now() + 90 * 24 * 60 * 60 * 1000, // 90 days
      benefits: ['Work experience', 'Stipend', 'Job offer potential', 'References'],
      fitScore: 0.9,
      recommendationRationale: 'Critical for gaining real-world experience and references',
      relatedCareerPaths: [],
      priority: 'CRITICAL' as ActionPriority,
      source: 'OpportunityEngine',
    });

    opportunities.push({
      id: this.generateOpportunityId(),
      name: 'Freelance Projects',
      type: 'INTERNSHIP' as OpportunityType,
      description: 'Short-term freelance work on platforms like Upwork, Freelancer, or Fiverr.',
      provider: 'Freelance Platforms',
      timeCommitment: { duration: 'Flexible', hoursPerWeek: 10 },
      location: { type: 'ONLINE' },
      skillsDeveloped: ['Client communication', 'Project management', 'Deliverables'],
      prerequisites: ['Portfolio', 'Platform profile'],
      applicationProcess: 'Create profile on freelance platforms',
      benefits: ['Income', 'Real projects', 'Client references', 'Portfolio building'],
      fitScore: 0.75,
      recommendationRationale: 'Flexible way to gain experience while studying',
      relatedCareerPaths: [],
      priority: 'MEDIUM' as ActionPriority,
      source: 'OpportunityEngine',
    });

    return {
      category: 'Internships',
      description: 'Work experience opportunities to build professional credentials',
      opportunities: this.filterAndRankOpportunities(opportunities),
      recommendedOpportunityIds: [],
    };
  }

  /**
   * Generate mentorship recommendations
   */
  private generateMentorships(
    input: ActionIntelligenceInput,
    targetCareer: string
  ): OpportunityBundle {
    const opportunities: Opportunity[] = [];

    opportunities.push({
      id: this.generateOpportunityId(),
      name: 'ADPList Mentorship',
      type: 'MENTORSHIP' as OpportunityType,
      description: 'Free mentorship from experienced professionals worldwide.',
      provider: 'ADPList',
      cost: { amount: 0, currency: 'INR', breakdown: 'Free' },
      timeCommitment: { duration: 'Ongoing', hoursPerWeek: 1 },
      location: { type: 'ONLINE' },
      skillsDeveloped: ['Career guidance', 'Industry insights', 'Networking'],
      prerequisites: ['Clear goals', 'Commitment to engagement'],
      applicationProcess: 'Sign up on ADPList.org and book sessions',
      benefits: ['Free mentorship', 'Global network', 'Diverse perspectives'],
      fitScore: 0.85,
      recommendationRationale: 'Free access to experienced professionals globally',
      relatedCareerPaths: [],
      priority: 'HIGH' as ActionPriority,
      source: 'OpportunityEngine',
    });

    opportunities.push({
      id: this.generateOpportunityId(),
      name: 'LinkedIn Informational Interviews',
      type: 'MENTORSHIP' as OpportunityType,
      description: 'Connect with professionals for one-time advice sessions.',
      provider: 'LinkedIn Network',
      cost: { amount: 0, currency: 'INR', breakdown: 'Free' },
      timeCommitment: { duration: '30 minutes each', hoursPerWeek: 2 },
      location: { type: 'ONLINE' },
      skillsDeveloped: ['Networking', 'Communication', 'Industry knowledge'],
      prerequisites: ['LinkedIn profile', 'Outreach skills'],
      applicationProcess: 'Reach out to professionals on LinkedIn',
      benefits: ['Insider knowledge', 'Network expansion', 'Career advice'],
      fitScore: 0.8,
      recommendationRationale: 'Direct access to industry professionals',
      relatedCareerPaths: [],
      priority: 'MEDIUM' as ActionPriority,
      source: 'OpportunityEngine',
    });

    return {
      category: 'Mentorship',
      description: 'Guidance from experienced professionals in your target field',
      opportunities: this.filterAndRankOpportunities(opportunities),
      recommendedOpportunityIds: [],
    };
  }

  /**
   * Generate community recommendations
   */
  private generateCommunities(
    input: ActionIntelligenceInput,
    targetCareer: string
  ): OpportunityBundle {
    const opportunities: Opportunity[] = [];

    opportunities.push({
      id: this.generateOpportunityId(),
      name: `${targetCareer} Discord/Slack Communities`,
      type: 'COMMUNITY' as OpportunityType,
      description: 'Join active online communities for networking and learning.',
      provider: 'Various (Discord, Slack, Telegram)',
      cost: { amount: 0, currency: 'INR', breakdown: 'Free' },
      timeCommitment: { duration: 'Ongoing', hoursPerWeek: 3 },
      location: { type: 'ONLINE' },
      skillsDeveloped: ['Networking', 'Community engagement', 'Learning'],
      prerequisites: ['Interest in field'],
      applicationProcess: 'Join community links',
      benefits: ['Peer support', 'Job postings', 'Learning resources', 'Networking'],
      fitScore: 0.75,
      recommendationRationale: 'Peer support and networking with like-minded individuals',
      relatedCareerPaths: [],
      priority: 'MEDIUM' as ActionPriority,
      source: 'OpportunityEngine',
    });

    return {
      category: 'Communities',
      description: 'Professional communities for peer support and networking',
      opportunities: this.filterAndRankOpportunities(opportunities),
      recommendedOpportunityIds: [],
    };
  }

  /**
   * Generate event recommendations
   */
  private generateEvents(
    input: ActionIntelligenceInput,
    targetCareer: string
  ): OpportunityBundle {
    const opportunities: Opportunity[] = [];

    opportunities.push({
      id: this.generateOpportunityId(),
      name: 'Local Meetups and Tech Events',
      type: 'EVENT' as OpportunityType,
      description: 'In-person networking and learning events in your city.',
      provider: 'Meetup.com / Local Organizers',
      cost: { amount: 500, currency: 'INR', breakdown: 'Free to ₹500 per event' },
      timeCommitment: { duration: '2-4 hours per event', hoursPerWeek: 4 },
      location: { type: 'ONSITE' },
      skillsDeveloped: ['Networking', 'Industry knowledge'],
      prerequisites: ['Interest in field'],
      applicationProcess: 'Register on Meetup or event platforms',
      benefits: ['Local network', 'Learning', 'Job opportunities'],
      fitScore: 0.7,
      recommendationRationale: 'Local networking and learning opportunities',
      relatedCareerPaths: [],
      priority: 'LOW' as ActionPriority,
      source: 'OpportunityEngine',
    });

    opportunities.push({
      id: this.generateOpportunityId(),
      name: 'Virtual Conferences and Webinars',
      type: 'EVENT' as OpportunityType,
      description: 'Online events with industry leaders and experts.',
      provider: 'Various (free and paid)',
      cost: { amount: 0, currency: 'INR', breakdown: 'Often free' },
      timeCommitment: { duration: '1-2 days', hoursPerWeek: 4 },
      location: { type: 'ONLINE' },
      skillsDeveloped: ['Industry trends', 'Learning', 'Networking'],
      prerequisites: ['Interest in field'],
      applicationProcess: 'Register online',
      benefits: ['Learn from experts', 'Global network', 'Free or low cost'],
      fitScore: 0.75,
      recommendationRationale: 'Access to industry knowledge without travel costs',
      relatedCareerPaths: [],
      priority: 'MEDIUM' as ActionPriority,
      source: 'OpportunityEngine',
    });

    return {
      category: 'Events',
      description: 'Conferences, meetups, and webinars for learning and networking',
      opportunities: this.filterAndRankOpportunities(opportunities),
      recommendedOpportunityIds: [],
    };
  }

  /**
   * Generate certification recommendations
   */
  private generateCertifications(
    input: ActionIntelligenceInput,
    targetCareer: string
  ): OpportunityBundle {
    const opportunities: Opportunity[] = [];

    // Industry certifications by career
    const certs: Record<string, Array<{name: string, provider: string, cost: number}>> = {
      'Software Engineer': [
        { name: 'AWS Cloud Practitioner', provider: 'Amazon', cost: 10000 },
        { name: 'Google Cloud Associate', provider: 'Google', cost: 10000 },
      ],
      'Data Scientist': [
        { name: 'Google Data Analytics', provider: 'Google/Coursera', cost: 10000 },
        { name: 'IBM Data Science', provider: 'IBM/Coursera', cost: 12000 },
      ],
      'Product Manager': [
        { name: 'Product Management Certificate', provider: 'Product School', cost: 50000 },
        { name: 'PMI-ACP', provider: 'PMI', cost: 25000 },
      ],
    };

    const careerCerts = certs[targetCareer] || [];

    careerCerts.forEach(cert => {
      opportunities.push({
        id: this.generateOpportunityId(),
        name: cert.name,
        type: 'CERTIFICATION' as OpportunityType,
        description: `Industry-recognized certification for ${targetCareer}.`,
        provider: cert.provider,
        cost: { amount: cert.cost, currency: 'INR', breakdown: 'Exam and preparation' },
        timeCommitment: { duration: '2-3 months', hoursPerWeek: 10 },
        location: { type: 'ONLINE' },
        skillsDeveloped: ['Certified knowledge', 'Industry credibility'],
        prerequisites: ['Relevant background knowledge'],
        applicationProcess: 'Register and schedule exam',
        benefits: ['Industry credential', 'Resume boost', 'Knowledge validation'],
        fitScore: 0.75,
        recommendationRationale: 'Industry-recognized credential for career credibility',
        relatedCareerPaths: [],
        priority: 'MEDIUM' as ActionPriority,
        source: 'OpportunityEngine',
      });
    });

    return {
      category: 'Certifications',
      description: 'Industry-recognized credentials to validate skills',
      opportunities: this.filterAndRankOpportunities(opportunities),
      recommendedOpportunityIds: [],
    };
  }

  /**
   * Filter and rank opportunities
   */
  private filterAndRankOpportunities(opportunities: Opportunity[]): Opportunity[] {
    // Filter by fit score
    let filtered = opportunities.filter(
      o => o.fitScore >= this.config.minimumFitScore
    );

    // Sort by fit score
    filtered = filtered.sort((a, b) => b.fitScore - a.fitScore);

    // Limit per category
    return filtered.slice(0, this.config.maxOpportunitiesPerCategory);
  }

  /**
   * Generate unique opportunity ID
   */
  private generateOpportunityId(): EntityId {
    return `opp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<OpportunityEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): OpportunityEngineConfig {
    return { ...this.config };
  }
}

/**
 * Factory function to create OpportunityEngine
 */
export function createOpportunityEngine(
  config?: Partial<OpportunityEngineConfig>
): OpportunityEngine {
  return new OpportunityEngine(config);
}
