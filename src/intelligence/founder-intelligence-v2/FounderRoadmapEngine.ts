/**
 * Founder Intelligence V2 - Roadmap Engine
 * 
 * Generates development roadmaps for founder potential including:
 * - Milestones with timelines
 * - Skill development priorities
 * - Experience building goals
 * - Network development
 * - Decision points
 * 
 * @module intelligence/founder-intelligence-v2
 */

import {
  FounderRoadmapV2,
  RoadmapMilestoneV2,
  SkillPriorityV2,
  ExperienceGoalV2,
  NetworkGoalV2,
  DecisionPointV2,
  FounderReadinessV2,
  FounderDimensionV2,
  DimensionScoreV2,
  FounderTypeV2,
  FounderRiskProfileV2,
  getDimensionLabelV2,
  getReadinessLabelV2,
  READINESS_THRESHOLDS,
} from './types';

/**
 * Configuration for roadmap engine.
 */
export interface RoadmapConfigV2 {
  /** Months per readiness level advancement */
  monthsPerLevel: number;
  
  /** Minimum months for any milestone */
  minMilestoneMonths: number;
  
  /** Maximum roadmap duration in months */
  maxRoadmapMonths: number;
  
  /** Confidence adjustment for timeline */
  timelineConfidenceFactor: number;
}

/**
 * Default roadmap configuration.
 */
export const DEFAULT_ROADMAP_CONFIG: RoadmapConfigV2 = {
  monthsPerLevel: 6,
  minMilestoneMonths: 3,
  maxRoadmapMonths: 36,
  timelineConfidenceFactor: 0.7,
};

/**
 * Development paths for each dimension.
 */
const DIMENSION_DEVELOPMENT_PATHS: Record<FounderDimensionV2, {
  path: string;
  resources: string[];
  practiceOpportunities: string[];
  estimatedMonths: number;
}> = {
  [FounderDimensionV2.OPPORTUNITY_RECOGNITION]: {
    path: 'Practice identifying problems and market gaps through active observation and customer interviews',
    resources: [
      'Read "The Mom Test" by Rob Fitzpatrick',
      'Study Y Combinator startup case studies',
      'Follow industry trends through TechCrunch, Hacker News',
    ],
    practiceOpportunities: [
      'Conduct 10 customer discovery interviews',
      'Document 5 market opportunities you notice',
      'Analyze 3 failed startups and identify why',
    ],
    estimatedMonths: 3,
  },
  [FounderDimensionV2.OBSESSION_CAPACITY]: {
    path: 'Commit to a long-term project and see it through despite challenges',
    resources: [
      'Read "Grit" by Angela Duckworth',
      'Study stories of persistent founders',
      'Practice mindfulness for focus',
    ],
    practiceOpportunities: [
      'Commit to a 6-month learning project',
      'Stick with a hobby for 1 year',
      'Set a challenging goal and track progress weekly',
    ],
    estimatedMonths: 6,
  },
  [FounderDimensionV2.RESOURCEFULNESS]: {
    path: 'Build something valuable with severe constraints (no budget, limited time)',
    resources: [
      'Learn no-code tools (Bubble, Webflow)',
      'Study bootstrapped startup stories',
      'Practice rapid prototyping methods',
    ],
    practiceOpportunities: [
      'Build an MVP in 48 hours',
      'Solve a problem with zero budget',
      'Learn a new skill using only free resources',
    ],
    estimatedMonths: 4,
  },
  [FounderDimensionV2.AMBIGUITY_TOLERANCE]: {
    path: 'Embrace uncertainty through small experiments and rapid iteration',
    resources: [
      'Read "The Lean Startup" by Eric Ries',
      'Study decision-making under uncertainty',
      'Practice improvisation techniques',
    ],
    practiceOpportunities: [
      'Make decisions with 70% information',
      'Run 5 small experiments with unknown outcomes',
      'Change plans mid-project based on learnings',
    ],
    estimatedMonths: 3,
  },
  [FounderDimensionV2.RESILIENCE]: {
    path: 'Build mental toughness through challenging experiences and failure recovery',
    resources: [
      'Read "Option B" by Sheryl Sandberg',
      'Study post-traumatic growth research',
      'Practice cognitive reframing techniques',
    ],
    practiceOpportunities: [
      'Apply after a rejection and ask for feedback',
      'Share a failure publicly and lessons learned',
      'Attempt something difficult with high failure chance',
    ],
    estimatedMonths: 6,
  },
  [FounderDimensionV2.TALENT_MAGNETISM]: {
    path: 'Develop leadership and inspirational communication skills',
    resources: [
      'Read "Leaders Eat Last" by Simon Sinek',
      'Study charismatic leadership research',
      'Practice storytelling and public speaking',
    ],
    practiceOpportunities: [
      'Lead a volunteer project',
      'Recruit 3 people to collaborate on something',
      'Give a presentation that inspires action',
    ],
    estimatedMonths: 4,
  },
  [FounderDimensionV2.SALES_CAPABILITY]: {
    path: 'Practice persuasion through real selling experiences',
    resources: [
      'Read "SPIN Selling" by Neil Rackham',
      'Study consultative sales techniques',
      'Practice negotiation skills',
    ],
    practiceOpportunities: [
      'Sell something (product, service, idea)',
      'Fundraise for a cause',
      'Convince someone to change their mind',
    ],
    estimatedMonths: 4,
  },
  [FounderDimensionV2.OWNERSHIP_ORIENTATION]: {
    path: 'Take full responsibility for outcomes, both successes and failures',
    resources: [
      'Read "Extreme Ownership" by Jocko Willink',
      'Study equity mindset vs employee mindset',
      'Practice accountability frameworks',
    ],
    practiceOpportunities: [
      'Lead a project end-to-end',
      'Take responsibility for a team failure',
      'Make a decision without asking permission',
    ],
    estimatedMonths: 3,
  },
};

/**
 * Roadmap Engine V2
 */
export class FounderRoadmapEngineV2 {
  private config: RoadmapConfigV2;
  
  constructor(config: Partial<RoadmapConfigV2> = {}) {
    this.config = { ...DEFAULT_ROADMAP_CONFIG, ...config };
  }
  
  /**
   * Generate development roadmap.
   */
  generateRoadmap(
    currentReadiness: FounderReadinessV2,
    dimensionScores: DimensionScoreV2[],
    founderType: FounderTypeV2 | null,
    riskProfile: FounderRiskProfileV2
  ): FounderRoadmapV2 {
    // Determine target readiness
    const targetReadiness = this.determineTargetReadiness(currentReadiness);
    
    // Calculate timeline
    const estimatedMonths = this.calculateTimeline(
      currentReadiness,
      targetReadiness,
      dimensionScores,
      riskProfile
    );
    
    // Generate milestones
    const milestones = this.generateMilestones(
      currentReadiness,
      targetReadiness,
      estimatedMonths,
      dimensionScores
    );
    
    // Generate immediate actions
    const immediateActions = this.generateImmediateActions(dimensionScores, riskProfile);
    
    // Generate skill priorities
    const skillPriorities = this.generateSkillPriorities(dimensionScores);
    
    // Generate experience goals
    const experienceGoals = this.generateExperienceGoals(dimensionScores, founderType);
    
    // Generate network goals
    const networkGoals = this.generateNetworkGoals(founderType);
    
    // Generate decision points
    const decisionPoints = this.generateDecisionPoints(currentReadiness);
    
    return {
      currentReadiness,
      targetReadiness,
      estimatedMonths,
      timelineConfidence: this.calculateTimelineConfidence(dimensionScores, riskProfile),
      milestones,
      immediateActions,
      skillPriorities,
      experienceGoals,
      networkGoals,
      decisionPoints,
    };
  }
  
  /**
   * Determine target readiness level.
   */
  private determineTargetReadiness(current: FounderReadinessV2): FounderReadinessV2 {
    const progression: FounderReadinessV2[] = [
      FounderReadinessV2.EARLY,
      FounderReadinessV2.EMERGING,
      FounderReadinessV2.READY,
      FounderReadinessV2.HIGH_POTENTIAL,
    ];
    
    const currentIndex = progression.indexOf(current);
    const targetIndex = Math.min(currentIndex + 2, progression.length - 1);
    
    return progression[targetIndex];
  }
  
  /**
   * Calculate development timeline.
   */
  private calculateTimeline(
    current: FounderReadinessV2,
    target: FounderReadinessV2,
    dimensionScores: DimensionScoreV2[],
    riskProfile: FounderRiskProfileV2
  ): number {
    const readinessLevels = [
      FounderReadinessV2.EARLY,
      FounderReadinessV2.EMERGING,
      FounderReadinessV2.READY,
      FounderReadinessV2.HIGH_POTENTIAL,
    ];
    
    const levelDiff = readinessLevels.indexOf(target) - readinessLevels.indexOf(current);
    let baseMonths = levelDiff * this.config.monthsPerLevel;
    
    // Adjust based on dimension gaps
    const criticalGaps = dimensionScores.filter(d => d.score < 0.3).length;
    baseMonths += criticalGaps * 2;
    
    // Adjust for risk factors
    if (riskProfile.overallRiskLevel === 'HIGH') {
      baseMonths *= 1.3;
    } else if (riskProfile.overallRiskLevel === 'CRITICAL') {
      baseMonths *= 1.5;
    }
    
    // Cap at max
    return Math.min(Math.max(baseMonths, this.config.minMilestoneMonths), this.config.maxRoadmapMonths);
  }
  
  /**
   * Generate development milestones.
   */
  private generateMilestones(
    current: FounderReadinessV2,
    target: FounderReadinessV2,
    totalMonths: number,
    dimensionScores: DimensionScoreV2[]
  ): RoadmapMilestoneV2[] {
    const milestones: RoadmapMilestoneV2[] = [];
    const readinessLevels = [
      FounderReadinessV2.EARLY,
      FounderReadinessV2.EMERGING,
      FounderReadinessV2.READY,
      FounderReadinessV2.HIGH_POTENTIAL,
    ];
    
    const currentIndex = readinessLevels.indexOf(current);
    const targetIndex = readinessLevels.indexOf(target);
    
    const monthsPerLevel = totalMonths / (targetIndex - currentIndex);
    
    for (let i = currentIndex + 1; i <= targetIndex; i++) {
      const level = readinessLevels[i];
      const months = Math.round((i - currentIndex) * monthsPerLevel);
      
      milestones.push({
        name: `${getReadinessLabelV2(level)} Status`,
        description: this.getMilestoneDescription(level),
        targetReadiness: level,
        estimatedMonths: months,
        achievements: this.getMilestoneAchievements(level, dimensionScores),
        skillsToDevelop: this.getMilestoneSkills(level, dimensionScores),
        isDecisionPoint: level === FounderReadinessV2.READY,
        successCriteria: this.getMilestoneSuccessCriteria(level),
      });
    }
    
    return milestones;
  }
  
  /**
   * Get milestone description.
   */
  private getMilestoneDescription(level: FounderReadinessV2): string {
    const descriptions: Record<FounderReadinessV2, string> = {
      [FounderReadinessV2.EARLY]: 'Foundation building phase',
      [FounderReadinessV2.EMERGING]: 'Core capability development',
      [FounderReadinessV2.READY]: 'Founder readiness achievement',
      [FounderReadinessV2.HIGH_POTENTIAL]: 'High-potential founder status',
    };
    return descriptions[level];
  }
  
  /**
   * Get milestone achievements.
   */
  private getMilestoneAchievements(
    level: FounderReadinessV2,
    dimensionScores: DimensionScoreV2[]
  ): string[] {
    const baseAchievements: Record<FounderReadinessV2, string[]> = {
      [FounderReadinessV2.EARLY]: [
        'Complete founder skill assessment',
        'Identify top 3 development priorities',
        'Join a founder community',
      ],
      [FounderReadinessV2.EMERGING]: [
        'Build and launch a side project',
        'Develop 2 core founder dimensions',
        'Network with 10+ founders',
      ],
      [FounderReadinessV2.READY]: [
        'Validate a market opportunity',
        'Build a product with users',
        'Form founding team or find co-founder',
      ],
      [FounderReadinessV2.HIGH_POTENTIAL]: [
        'Achieve product-market fit',
        'Demonstrate revenue or user growth',
        'Build scalable team and processes',
      ],
    };
    
    const achievements = [...baseAchievements[level]];
    
    // Add dimension-specific achievements
    const developmentAreas = dimensionScores
      .filter(d => d.score < 0.6)
      .slice(0, 2)
      .map(d => `Improve ${getDimensionLabelV2(d.dimension).toLowerCase()}`);
    
    achievements.push(...developmentAreas);
    
    return achievements;
  }
  
  /**
   * Get milestone skills to develop.
   */
  private getMilestoneSkills(
    level: FounderReadinessV2,
    dimensionScores: DimensionScoreV2[]
  ): FounderDimensionV2[] {
    // Prioritize weakest dimensions
    return dimensionScores
      .filter(d => d.score < 0.6)
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .map(d => d.dimension);
  }
  
  /**
   * Get milestone success criteria.
   */
  private getMilestoneSuccessCriteria(level: FounderReadinessV2): string[] {
    const threshold = READINESS_THRESHOLDS[level];
    
    return [
      `Overall potential score of ${(threshold.minPotential * 100).toFixed(0)}%+`,
      `${threshold.minDimensions}+ dimensions above ${(threshold.dimensionThreshold * 100).toFixed(0)}%`,
      'Demonstrated evidence of capability application',
    ];
  }
  
  /**
   * Generate immediate actions.
   */
  private generateImmediateActions(
    dimensionScores: DimensionScoreV2[],
    riskProfile: FounderRiskProfileV2
  ): string[] {
    const actions: string[] = [];
    
    // Add top priority skill development
    const topGap = dimensionScores
      .filter(d => d.score < 0.5)
      .sort((a, b) => a.score - b.score)[0];
    
    if (topGap) {
      actions.push(`Start developing ${getDimensionLabelV2(topGap.dimension).toLowerCase()}: ${DIMENSION_DEVELOPMENT_PATHS[topGap.dimension].practiceOpportunities[0]}`);
    }
    
    // Add risk mitigation actions
    for (const risk of riskProfile.topRisks.slice(0, 2)) {
      if (risk.mitigations.length > 0) {
        actions.push(`Address ${risk.factor.toLowerCase().replace(/_/g, ' ')}: ${risk.mitigations[0]}`);
      }
    }
    
    // Add generic founder actions
    actions.push('Read one founder biography this month');
    actions.push('Join a startup community or attend one founder event');
    
    return actions.slice(0, 5);
  }
  
  /**
   * Generate skill priorities.
   */
  private generateSkillPriorities(dimensionScores: DimensionScoreV2[]): SkillPriorityV2[] {
    const developmentAreas = dimensionScores
      .filter(d => d.score < 0.7)
      .sort((a, b) => a.score - b.score);
    
    return developmentAreas.map(d => {
      const path = DIMENSION_DEVELOPMENT_PATHS[d.dimension];
      const gap = 0.7 - d.score;
      
      return {
        dimension: d.dimension,
        priority: d.score < 0.3 ? 'critical' : d.score < 0.5 ? 'high' : 'medium',
        currentScore: d.score,
        targetScore: 0.7,
        gap,
        developmentPath: path.path,
        resources: path.resources,
        estimatedMonths: Math.ceil(path.estimatedMonths * (gap / 0.5)),
        practiceOpportunities: path.practiceOpportunities,
      };
    });
  }
  
  /**
   * Generate experience goals.
   */
  private generateExperienceGoals(
    dimensionScores: DimensionScoreV2[],
    founderType: FounderTypeV2 | null
  ): ExperienceGoalV2[] {
    const goals: ExperienceGoalV2[] = [];
    
    // Universal founder experiences
    goals.push({
      type: 'project',
      description: 'Build and launch a product with real users',
      developsDimensions: [
        FounderDimensionV2.OWNERSHIP_ORIENTATION,
        FounderDimensionV2.RESOURCEFULNESS,
        FounderDimensionV2.OBSESSION_CAPACITY,
      ],
      priority: 'critical',
      pursuitPath: 'Start with a problem you personally experience, build an MVP, get 10 users',
      successIndicators: ['10+ active users', 'Product iterated based on feedback', 'Project completed or pivoted'],
      timeline: '3-6 months',
    });
    
    goals.push({
      type: 'failure',
      description: 'Experience and recover from a significant setback',
      developsDimensions: [FounderDimensionV2.RESILIENCE, FounderDimensionV2.AMBIGUITY_TOLERANCE],
      priority: 'high',
      pursuitPath: 'Apply for something competitive, launch something that might fail, ask for something you might be rejected from',
      successIndicators: ['Experienced rejection or failure', 'Extracted lessons', 'Tried again or pivoted'],
      timeline: 'Ongoing',
    });
    
    // Type-specific experiences
    if (founderType === FounderTypeV2.TECHNICAL_FOUNDER) {
      goals.push({
        type: 'role',
        description: 'Work in an early-stage startup environment',
        developsDimensions: [FounderDimensionV2.RESOURCEFULNESS, FounderDimensionV2.AMBIGUITY_TOLERANCE],
        priority: 'high',
        pursuitPath: 'Join a seed-stage startup as an early employee',
        successIndicators: ['Experience startup chaos', 'Build under constraints', 'See product-market fit pursuit'],
        timeline: '6-12 months',
      });
    }
    
    if (founderType === FounderTypeV2.BUSINESS_FOUNDER) {
      goals.push({
        type: 'role',
        description: 'Sell something (product, service, or idea)',
        developsDimensions: [FounderDimensionV2.SALES_CAPABILITY, FounderDimensionV2.OWNERSHIP_ORIENTATION],
        priority: 'critical',
        pursuitPath: 'Take a sales role, sell a service freelance, or fundraise for a cause',
        successIndicators: ['Closed deals', 'Handled rejection', 'Learned customer needs'],
        timeline: '3-6 months',
      });
    }
    
    // Dimension-specific experiences for weak areas
    const weakSales = dimensionScores.find(d => d.dimension === FounderDimensionV2.SALES_CAPABILITY && d.score < 0.5);
    if (weakSales && founderType !== FounderTypeV2.BUSINESS_FOUNDER) {
      goals.push({
        type: 'challenge',
        description: 'Practice persuasion and sales',
        developsDimensions: [FounderDimensionV2.SALES_CAPABILITY],
        priority: 'high',
        pursuitPath: 'Join a fundraising campaign, practice consultative selling, pitch ideas regularly',
        successIndicators: ['Successfully persuaded someone', 'Handled objections', 'Closed a commitment'],
        timeline: '2-4 months',
      });
    }
    
    return goals;
  }
  
  /**
   * Generate network goals.
   */
  private generateNetworkGoals(founderType: FounderTypeV2 | null): NetworkGoalV2[] {
    const goals: NetworkGoalV2[] = [
      {
        networkType: 'founders',
        description: 'Build relationships with other founders at similar or slightly advanced stages',
        importance: 'Founders provide peer support, advice, and potential partnerships',
        buildingStrategy: [
          'Join founder communities (Indie Hackers, Slack groups)',
          'Attend startup meetups and events',
          'Cold email founders you admire',
          'Participate in startup programs or accelerators',
        ],
        priority: 'critical',
      },
      {
        networkType: 'mentors',
        description: 'Connect with experienced founders who can guide your journey',
        importance: 'Mentors provide wisdom, prevent mistakes, and open doors',
        buildingStrategy: [
          'Identify 5 potential mentors in your target sector',
          'Offer value before asking for help',
          'Build genuine relationships over time',
          'Join formal mentorship programs',
        ],
        priority: 'high',
      },
    ];
    
    if (founderType === FounderTypeV2.BUSINESS_FOUNDER || founderType === FounderTypeV2.VISIONARY_FOUNDER) {
      goals.push({
        networkType: 'investors',
        description: 'Build relationships with angel investors and VCs',
        importance: 'Early investor relationships help with future fundraising',
        buildingStrategy: [
          'Attend investor pitch events',
          'Connect on LinkedIn with relevant investors',
          'Get warm introductions through founder network',
          'Share thought leadership content',
        ],
        priority: 'medium',
      });
    }
    
    goals.push({
      networkType: 'customers',
      description: 'Develop relationships with potential customers in your target market',
      importance: 'Customer relationships validate ideas and provide early traction',
      buildingStrategy: [
        'Identify 50 potential customers in your target market',
        'Conduct customer discovery interviews',
        'Join communities where customers gather',
        'Provide value before selling',
      ],
      priority: 'high',
    });
    
    return goals;
  }
  
  /**
   * Generate decision points.
   */
  private generateDecisionPoints(currentReadiness: FounderReadinessV2): DecisionPointV2[] {
    const decisions: DecisionPointV2[] = [];
    
    if (currentReadiness === FounderReadinessV2.EARLY || currentReadiness === FounderReadinessV2.EMERGING) {
      decisions.push({
        decision: 'Should you quit your job to pursue entrepreneurship?',
        timing: 'When you reach READY status or have significant validation',
        options: [
          'Stay employed, build as side project',
          'Go part-time to increase focus',
          'Quit and go all-in',
        ],
        decisionFactors: [
          'Financial runway available',
          'Level of validation achieved',
          'Co-founder commitment',
          'Risk tolerance',
        ],
        recommendationCriteria: '6+ months runway + validated problem + prototype with users',
      });
    }
    
    decisions.push({
      decision: 'Do you need a co-founder?',
      timing: 'When planning to commit full-time or seeking funding',
      options: [
        'Solo founder',
        'Find technical co-founder',
        'Find business/sales co-founder',
        'Build team of early employees instead',
      ],
      decisionFactors: [
        'Your skill gaps',
        'Network size and quality',
        'Ability to attract talent',
        'Capital requirements',
      ],
      recommendationCriteria: '2+ critical skill gaps = find co-founder',
    });
    
    decisions.push({
      decision: 'When should you seek funding?',
      timing: 'When you need capital to scale or extend runway',
      options: [
        'Bootstrap as long as possible',
        'Raise pre-seed from angels',
        'Apply to accelerators',
        'Raise seed round from VCs',
      ],
      decisionFactors: [
        'Capital needs for business model',
        'Current traction and metrics',
        'Network access to investors',
        'Dilution tolerance',
      ],
      recommendationCriteria: 'Product-market fit signals + clear use of funds = raise seed',
    });
    
    return decisions;
  }
  
  /**
   * Calculate confidence in timeline estimate.
   */
  private calculateTimelineConfidence(
    dimensionScores: DimensionScoreV2[],
    riskProfile: FounderRiskProfileV2
  ): number {
    let confidence = this.config.timelineConfidenceFactor;
    
    // Reduce confidence for high-risk profiles
    if (riskProfile.overallRiskLevel === 'HIGH') {
      confidence *= 0.7;
    } else if (riskProfile.overallRiskLevel === 'CRITICAL') {
      confidence *= 0.5;
    }
    
    // Reduce confidence for many development areas
    const developmentAreas = dimensionScores.filter(d => d.score < 0.5).length;
    if (developmentAreas > 4) {
      confidence *= 0.8;
    }
    
    return Math.max(confidence, 0.3);
  }
  
  /**
   * Update configuration.
   */
  updateConfig(config: Partial<RoadmapConfigV2>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Factory function for creating roadmap engine.
 */
export function createFounderRoadmapEngineV2(
  config?: Partial<RoadmapConfigV2>
): FounderRoadmapEngineV2 {
  return new FounderRoadmapEngineV2(config);
}
