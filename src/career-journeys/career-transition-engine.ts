/**
 * Career Transition Engine
 * 
 * Analyzes career transitions between roles, companies, and industries.
 * Understands the mechanics, difficulties, and success factors of career changes.
 */

import {
  CareerJourney,
  CareerTransition,
  TransitionMap,
  TransitionPattern,
  TransitionType,
  DifficultyLevel,
  CareerPosition,
  SupportType,
  ImpactLevel,
} from './career-journey-types';

/**
 * Bridge analysis for transitions
 */
export interface BridgeAnalysis {
  transferableSkills: string[];
  gapsToAddress: string[];
  bridgeStrategies: string[];
  estimatedTime: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

/**
 * Transition success factors
 */
export interface SuccessFactors {
  criticalFactors: string[];
  contributingFactors: string[];
  hinderingFactors: string[];
  controllableFactors: string[];
  externalFactors: string[];
}

/**
 * Alternative path analysis
 */
export interface AlternativePath {
  path: string;
  description: string;
  estimatedDifficulty: DifficultyLevel;
  estimatedTime: string;
  pros: string[];
  cons: string[];
}

/**
 * Career Transition Engine
 * 
 * Specialized analysis for understanding career transitions,
 * their difficulty, success factors, and optimization strategies.
 */
export class CareerTransitionEngine {

  /**
   * Analyze all transitions in a career journey
   */
  analyzeTransitions(journey: CareerJourney): TransitionMap {
    const transitions = this.extractTransitions(journey);

    if (transitions.length === 0) {
      return {
        transitions: [],
        patterns: [],
        mostCommonType: 'INDUSTRY_CHANGE', // Default
        averageDifficulty: 'MODERATE',
        successRate: 0,
      };
    }

    // Detect patterns
    const patterns = this.detectTransitionPatterns(transitions);

    // Find most common type
    const typeCounts = this.countTransitionTypes(transitions);
    const mostCommonType = Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])[0][0] as TransitionType;

    // Calculate average difficulty
    const avgDifficulty = this.calculateAverageDifficulty(transitions);

    // Calculate success rate
    const successRate = transitions.filter(t => t.successful).length / transitions.length;

    return {
      transitions,
      patterns,
      mostCommonType,
      averageDifficulty: avgDifficulty,
      successRate,
    };
  }

  /**
   * Analyze a specific transition in detail
   */
  analyzeTransition(transition: CareerTransition): {
    bridgeAnalysis: BridgeAnalysis;
    successFactors: SuccessFactors;
    timingAnalysis: {
      timingQuality: 'OPTIMAL' | 'GOOD' | 'NEUTRAL' | 'SUBOPTIMAL';
      marketConditions: string;
      personalReadiness: string;
    };
    alternativePaths: AlternativePath[];
    lessons: string[];
  } {
    return {
      bridgeAnalysis: this.analyzeBridge(transition),
      successFactors: this.identifySuccessFactors(transition),
      timingAnalysis: this.analyzeTransitionEventTiming(transition),
      alternativePaths: this.identifyAlternativePaths(transition),
      lessons: this.extractTransitionLessons(transition),
    };
  }

  /**
   * Compare transitions across multiple journeys
   */
  compareTransitions(journeys: CareerJourney[]): {
    byType: Record<TransitionType, {
      count: number;
      avgDifficulty: DifficultyLevel;
      successRate: number;
      commonFrom: string[];
      commonTo: string[];
    }>;
    mostDifficult: CareerTransition[];
    mostSuccessful: CareerTransition[];
    commonPatterns: string[];
    insights: string[];
  } {
    const allTransitions = journeys.flatMap(j => this.extractTransitions(j));

    if (allTransitions.length === 0) {
      return {
        byType: {} as Record<TransitionType, any>,
        mostDifficult: [],
        mostSuccessful: [],
        commonPatterns: [],
        insights: ['No transitions found'],
      };
    }

    // Group by type
    const byType: Record<TransitionType, {
      count: number;
      avgDifficulty: DifficultyLevel;
      successRate: number;
      commonFrom: string[];
      commonTo: string[];
    }> = {} as any;

    const typeGroups = this.groupByType(allTransitions);
    
    for (const [type, transitions] of Object.entries(typeGroups)) {
      byType[type as TransitionType] = {
        count: transitions.length,
        avgDifficulty: this.calculateAverageDifficulty(transitions),
        successRate: transitions.filter(t => t.successful).length / transitions.length,
        commonFrom: this.findCommonElements(transitions.map(t => t.fromCareer)),
        commonTo: this.findCommonElements(transitions.map(t => t.toCareer)),
      };
    }

    // Most difficult transitions
    const mostDifficult = [...allTransitions]
      .filter(t => t.difficulty === 'VERY_DIFFICULT' || t.difficulty === 'DIFFICULT')
      .slice(0, 5);

    // Most successful transitions
    const mostSuccessful = [...allTransitions]
      .filter(t => t.successful)
      .sort((a, b) => this.difficultyScore(b.difficulty) - this.difficultyScore(a.difficulty))
      .slice(0, 5);

    // Common patterns
    const commonPatterns = this.identifyCommonPatterns(allTransitions);

    // Insights
    const insights = this.generateTransitionInsights(allTransitions, byType);

    return {
      byType,
      mostDifficult,
      mostSuccessful,
      commonPatterns,
      insights,
    };
  }

  /**
   * Predict difficulty of a potential transition
   */
  predictDifficulty(
    fromCareer: string,
    toCareer: string,
    journeyContext?: CareerJourney
  ): {
    predictedDifficulty: DifficultyLevel;
    confidence: number;
    factors: Array<{
      factor: string;
      impact: 'INCREASES_DIFFICULTY' | 'DECREASES_DIFFICULTY' | 'NEUTRAL';
      weight: number;
    }>;
    estimatedTime: string;
    successProbability: number;
  } {
    const factors: Array<{
      factor: string;
      impact: 'INCREASES_DIFFICULTY' | 'DECREASES_DIFFICULTY' | 'NEUTRAL';
      weight: number;
    }> = [];

    // Industry change factor
    const isIndustryChange = this.isIndustryChange(fromCareer, toCareer);
    if (isIndustryChange) {
      factors.push({
        factor: 'Industry change required',
        impact: 'INCREASES_DIFFICULTY',
        weight: 0.3,
      });
    }

    // Level change factor
    const levelChange = this.estimateLevelChange(fromCareer, toCareer);
    if (levelChange > 0) {
      factors.push({
        factor: 'Upward level change',
        impact: 'INCREASES_DIFFICULTY',
        weight: 0.2 * levelChange,
      });
    }

    // Context factors from journey
    if (journeyContext) {
      if (journeyContext.educationHistory.length >= 2) {
        factors.push({
          factor: 'Strong educational background',
          impact: 'DECREASES_DIFFICULTY',
          weight: 0.15,
        });
      }

      if (journeyContext.careerHistory.length >= 3) {
        factors.push({
          factor: 'Diverse experience',
          impact: 'DECREASES_DIFFICULTY',
          weight: 0.1,
        });
      }
    }

    // Calculate difficulty score
    const difficultyScore = factors.reduce((acc, f) => {
      return acc + (f.impact === 'INCREASES_DIFFICULTY' ? f.weight : -f.weight);
    }, 0.5);

    // Map to difficulty level
    let predictedDifficulty: DifficultyLevel;
    if (difficultyScore >= 0.8) predictedDifficulty = 'VERY_DIFFICULT';
    else if (difficultyScore >= 0.6) predictedDifficulty = 'DIFFICULT';
    else if (difficultyScore >= 0.4) predictedDifficulty = 'MODERATE';
    else if (difficultyScore >= 0.2) predictedDifficulty = 'EASY';
    else predictedDifficulty = 'VERY_EASY';

    // Estimate time
    const estimatedTime = this.estimateTransitionTime(predictedDifficulty);

    // Success probability
    const successProbability = Math.max(0.1, 1 - difficultyScore);

    return {
      predictedDifficulty,
      confidence: 0.6, // Would improve with historical data
      factors,
      estimatedTime,
      successProbability,
    };
  }

  /**
   * Recommend optimal transition strategy
   */
  recommendStrategy(
    fromCareer: string,
    toCareer: string,
    journey: CareerJourney
  ): {
    recommendedApproach: string;
    steps: string[];
    timeline: string;
    resources: string[];
    support: string[];
    risks: string[];
    mitigationStrategies: string[];
  } {
    const prediction = this.predictDifficulty(fromCareer, toCareer, journey);
    
    // Determine approach based on difficulty
    let recommendedApproach: string;
    let steps: string[];

    switch (prediction.predictedDifficulty) {
      case 'VERY_EASY':
      case 'EASY':
        recommendedApproach = 'Direct Transition';
        steps = [
          'Update resume highlighting transferable skills',
          'Apply directly to target roles',
          'Leverage existing network for referrals',
        ];
        break;

      case 'MODERATE':
        recommendedApproach = 'Skill-First Transition';
        steps = [
          'Identify and close skill gaps',
          'Take relevant courses/certifications',
          'Build portfolio in target area',
          'Network in target industry',
          'Apply to bridge roles',
        ];
        break;

      case 'DIFFICULT':
      case 'VERY_DIFFICULT':
        recommendedApproach = 'Gradual Bridge Strategy';
        steps = [
          'Find intermediate role that bridges both careers',
          'Build relevant experience gradually',
          'Develop network in target field',
          'Consider additional education',
          'Plan for longer transition timeline',
        ];
        break;
    }

    // Timeline
    const timeline = prediction.estimatedTime;

    // Resources
    const resources = this.identifyResources(fromCareer, toCareer);

    // Support
    const support = this.identifySupportOptions(journey);

    // Risks
    const risks = this.identifyRisks(prediction);

    // Mitigation
    const mitigationStrategies = risks.map(r => `Plan for: ${r}`);

    return {
      recommendedApproach,
      steps,
      timeline,
      resources,
      support,
      risks,
      mitigationStrategies,
    };
  }

  /**
   * Identify transferable skills between careers
   */
  identifyTransferableSkills(fromCareer: string, toCareer: string): {
    highlyTransferable: string[];
    moderatelyTransferable: string[];
    needsDevelopment: string[];
    notApplicable: string[];
  } {
    // This would ideally use a skills taxonomy
    // For now, using heuristics

    const commonTransferableSkills = [
      'Communication',
      'Problem Solving',
      'Project Management',
      'Leadership',
      'Analytical Thinking',
      'Teamwork',
    ];

    return {
      highlyTransferable: commonTransferableSkills.slice(0, 3),
      moderatelyTransferable: commonTransferableSkills.slice(3, 5),
      needsDevelopment: ['Industry-specific knowledge', 'Technical tools'],
      notApplicable: ['Very specialized skills'],
    };
  }

  /**
   * Analyze transition timing
   */
  analyzeTransitionTiming(journey: CareerJourney): {
    optimalTiming: string;
    currentReadiness: 'READY' | 'NEARLY_READY' | 'NOT_READY';
    preparationNeeded: string[];
    windowsOfOpportunity: string[];
  } {
    const readinessFactors: string[] = [];

    // Check experience level
    const totalYears = journey.careerHistory.reduce((acc, p) => acc + p.durationMonths, 0) / 12;
    
    if (totalYears >= 2) {
      readinessFactors.push('Sufficient experience base');
    } else {
      readinessFactors.push('Limited experience - consider waiting');
    }

    // Check recent achievements
    const recentSuccesses = journey.successes.filter(s => {
      const yearsAgo = (new Date().getTime() - s.timestamp.getTime()) / (1000 * 60 * 60 * 24 * 365);
      return yearsAgo < 1;
    });

    if (recentSuccesses.length > 0) {
      readinessFactors.push('Recent achievements to leverage');
    }

    // Check skill development
    const skillsGained = journey.careerHistory.reduce((acc, p) => 
      acc + p.skills.filter(s => s.gainedOrUsed === 'GAINED').length, 0
    );

    if (skillsGained >= 5) {
      readinessFactors.push('Good skill development trajectory');
    }

    // Determine readiness
    let currentReadiness: 'READY' | 'NEARLY_READY' | 'NOT_READY';
    if (readinessFactors.length >= 3) {
      currentReadiness = 'READY';
    } else if (readinessFactors.length >= 2) {
      currentReadiness = 'NEARLY_READY';
    } else {
      currentReadiness = 'NOT_READY';
    }

    return {
      optimalTiming: totalYears >= 2 ? 'Current window is favorable' : 'Wait 6-12 months',
      currentReadiness,
      preparationNeeded: readinessFactors.filter(f => f.includes('Limited') || f.includes('waiting')),
      windowsOfOpportunity: ['After project completion', 'During annual review cycle'],
    };
  }

  /**
   * Find similar successful transitions
   */
  findSimilarTransitions(
    fromCareer: string,
    toCareer: string,
    journeys: CareerJourney[],
    limit: number = 5
  ): CareerTransition[] {
    const allTransitions = journeys.flatMap(j => this.extractTransitions(j));

    return allTransitions
      .filter(t => 
        this.careerSimilarity(t.fromCareer, fromCareer) > 0.5 &&
        this.careerSimilarity(t.toCareer, toCareer) > 0.5
      )
      .sort((a, b) => {
        // Prioritize successful transitions
        if (a.successful && !b.successful) return -1;
        if (!a.successful && b.successful) return 1;
        return 0;
      })
      .slice(0, limit);
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private extractTransitions(journey: CareerJourney): CareerTransition[] {
    const transitions: CareerTransition[] = [];

    for (let i = 1; i < journey.careerHistory.length; i++) {
      const from = journey.careerHistory[i - 1];
      const to = journey.careerHistory[i];

      // Determine transition type
      const type = this.classifyTransition(from, to);

      // Determine difficulty
      const difficulty = this.assessDifficulty(from, to);

      // Identify skills
      const skillsRequired = this.inferRequiredSkills(to);
      const skillsPossessed = from.skills.map(s => s.skill);
      const skillsGap = skillsRequired.filter(s => !skillsPossessed.includes(s));

      // Determine success
      const successful = this.assessSuccess(from, to);

      transitions.push({
        id: `trans_${from.id}_${to.id}`,
        fromCareer: `${from.title} at ${from.organization}`,
        toCareer: `${to.title} at ${to.organization}`,
        reason: to.reasonForJoining || 'Career progression',
        type,
        difficulty,
        skillsRequired,
        skillsPossessed,
        skillsGap,
        transitionTime: `${Math.round((to.startDate.getTime() - (from.endDate?.getTime() || to.startDate.getTime())) / (1000 * 60 * 60 * 24 * 30))} months`,
        successful,
        supportReceived: [], // Would need additional data
      });
    }

    return transitions;
  }

  private classifyTransition(from: CareerPosition, to: CareerPosition): TransitionType {
    if (from.industry !== to.industry) return 'INDUSTRY_CHANGE';
    if (this.inferLevel(from.title) !== this.inferLevel(to.title)) return 'LEVEL_CHANGE';
    if (from.companyStage !== to.companyStage) return 'STAGE_CHANGE';
    return 'ROLE_CHANGE';
  }

  private inferLevel(title: string): string {
    const lower = title.toLowerCase();
    if (/senior|sr|lead/i.test(lower)) return 'senior';
    if (/manager|head/i.test(lower)) return 'manager';
    if (/director|vp/i.test(lower)) return 'director';
    if (/junior|jr|associate/i.test(lower)) return 'junior';
    return 'mid';
  }

  private assessDifficulty(from: CareerPosition, to: CareerPosition): DifficultyLevel {
    let difficultyScore = 0;

    // Industry change
    if (from.industry !== to.industry) difficultyScore += 2;

    // Company stage change
    if (from.companyStage !== to.companyStage) difficultyScore += 1;

    // Level change
    const levelMap: Record<string, number> = { 'junior': 1, 'mid': 2, 'senior': 3, 'manager': 4, 'director': 5 };
    const fromLevel = levelMap[this.inferLevel(from.title)] || 2;
    const toLevel = levelMap[this.inferLevel(to.title)] || 2;
    const levelDiff = toLevel - fromLevel;
    difficultyScore += Math.max(0, levelDiff);

    // Map to difficulty
    if (difficultyScore >= 4) return 'VERY_DIFFICULT';
    if (difficultyScore >= 3) return 'DIFFICULT';
    if (difficultyScore >= 2) return 'MODERATE';
    if (difficultyScore >= 1) return 'EASY';
    return 'VERY_EASY';
  }

  private inferRequiredSkills(position: CareerPosition): string[] {
    return position.skills.map(s => s.skill);
  }

  private assessSuccess(from: CareerPosition, to: CareerPosition): boolean {
    // Heuristic: Success if stayed at least 12 months
    return to.durationMonths >= 12;
  }

  private detectTransitionPatterns(transitions: CareerTransition[]): TransitionPattern[] {
    const patterns: TransitionPattern[] = [];

    // Pattern: Progressive advancement
    const levelChanges = transitions.filter(t => t.type === 'LEVEL_CHANGE');
    if (levelChanges.length >= 2) {
      patterns.push({
        fromCategory: 'Lower Level',
        toCategory: 'Higher Level',
        frequency: levelChanges.length,
        avgDifficulty: this.calculateAverageDifficulty(levelChanges),
        successRate: levelChanges.filter(t => t.successful).length / levelChanges.length,
        commonReasons: ['Career growth', 'More responsibility'],
      });
    }

    // Pattern: Industry exploration
    const industryChanges = transitions.filter(t => t.type === 'INDUSTRY_CHANGE');
    if (industryChanges.length >= 2) {
      patterns.push({
        fromCategory: 'Various Industries',
        toCategory: 'New Industries',
        frequency: industryChanges.length,
        avgDifficulty: this.calculateAverageDifficulty(industryChanges),
        successRate: industryChanges.filter(t => t.successful).length / industryChanges.length,
        commonReasons: ['Better opportunities', 'Interest change'],
      });
    }

    return patterns;
  }

  private countTransitionTypes(transitions: CareerTransition[]): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const t of transitions) {
      counts[t.type] = (counts[t.type] || 0) + 1;
    }
    return counts;
  }

  private calculateAverageDifficulty(transitions: CareerTransition[]): DifficultyLevel {
    const scores: Record<DifficultyLevel, number> = {
      'VERY_EASY': 1,
      'EASY': 2,
      'MODERATE': 3,
      'DIFFICULT': 4,
      'VERY_DIFFICULT': 5,
    };

    const avg = transitions.reduce((acc, t) => acc + scores[t.difficulty], 0) / transitions.length;

    if (avg <= 1.5) return 'VERY_EASY';
    if (avg <= 2.5) return 'EASY';
    if (avg <= 3.5) return 'MODERATE';
    if (avg <= 4.5) return 'DIFFICULT';
    return 'VERY_DIFFICULT';
  }

  private difficultyScore(difficulty: DifficultyLevel): number {
    const scores: Record<DifficultyLevel, number> = {
      'VERY_EASY': 1,
      'EASY': 2,
      'MODERATE': 3,
      'DIFFICULT': 4,
      'VERY_DIFFICULT': 5,
    };
    return scores[difficulty];
  }

  private analyzeBridge(transition: CareerTransition): BridgeAnalysis {
    const transferableSkills = transition.skillsPossessed.filter(s => 
      transition.skillsRequired.includes(s)
    );

    const gapsToAddress = transition.skillsGap;

    const bridgeStrategies = gapsToAddress.map(gap => 
      `Develop ${gap} through coursework or projects`
    );

    const riskLevel: BridgeAnalysis['riskLevel'] = 
      gapsToAddress.length > 3 ? 'HIGH' :
      gapsToAddress.length > 1 ? 'MEDIUM' : 'LOW';

    return {
      transferableSkills,
      gapsToAddress,
      bridgeStrategies,
      estimatedTime: transition.transitionTime,
      riskLevel,
    };
  }

  private identifySuccessFactors(transition: CareerTransition): SuccessFactors {
    return {
      criticalFactors: [
        'Skill match',
        'Timing',
        'Preparation',
      ],
      contributingFactors: [
        'Network support',
        'Market conditions',
      ],
      hinderingFactors: transition.skillsGap.length > 0 ? ['Skills gap'] : [],
      controllableFactors: ['Preparation', 'Skill development', 'Networking'],
      externalFactors: ['Market conditions', 'Economic environment'],
    };
  }

  private analyzeTransitionEventTiming(transition: CareerTransition): {
    timingQuality: 'OPTIMAL' | 'GOOD' | 'NEUTRAL' | 'SUBOPTIMAL';
    marketConditions: string;
    personalReadiness: string;
  } {
    return {
      timingQuality: transition.successful ? 'OPTIMAL' : 'NEUTRAL',
      marketConditions: 'Favorable',
      personalReadiness: transition.skillsGap.length < 2 ? 'High' : 'Moderate',
    };
  }

  private identifyAlternativePaths(transition: CareerTransition): AlternativePath[] {
    return [
      {
        path: 'Direct Transition',
        description: 'Apply directly with current skills',
        estimatedDifficulty: transition.difficulty,
        estimatedTime: transition.transitionTime,
        pros: ['Fastest path', 'Immediate results'],
        cons: ['Higher risk', 'May not succeed'],
      },
      {
        path: 'Bridge Role',
        description: 'Find intermediate role that builds required skills',
        estimatedDifficulty: 'MODERATE',
        estimatedTime: '12-18 months',
        pros: ['Lower risk', 'Skill building'],
        cons: ['Takes longer', 'Intermediate step'],
      },
    ];
  }

  private extractTransitionLessons(transition: CareerTransition): string[] {
    const lessons: string[] = [];

    if (transition.successful) {
      lessons.push('Preparation and skill alignment lead to successful transitions');
    } else {
      lessons.push('Address skill gaps before attempting similar transitions');
    }

    if (transition.skillsGap.length > 2) {
      lessons.push('Large skill gaps make transitions significantly harder');
    }

    return lessons;
  }

  private isIndustryChange(from: string, to: string): boolean {
    // Simplified - would use proper industry classification
    return from !== to;
  }

  private estimateLevelChange(from: string, to: string): number {
    const fromLevel = this.inferLevel(from);
    const toLevel = this.inferLevel(to);
    
    const levels = ['junior', 'mid', 'senior', 'manager', 'director'];
    return levels.indexOf(toLevel) - levels.indexOf(fromLevel);
  }

  private estimateTransitionTime(difficulty: DifficultyLevel): string {
    const times: Record<DifficultyLevel, string> = {
      'VERY_EASY': '1-2 months',
      'EASY': '2-4 months',
      'MODERATE': '4-8 months',
      'DIFFICULT': '6-12 months',
      'VERY_DIFFICULT': '12-24 months',
    };
    return times[difficulty];
  }

  private identifyResources(from: string, to: string): string[] {
    return [
      'Online courses (Coursera, Udemy)',
      'Industry certifications',
      'Professional associations',
      'LinkedIn Learning',
      'Books and publications',
    ];
  }

  private identifySupportOptions(journey: CareerJourney): string[] {
    const support: string[] = [];

    if (journey.startingPoint.familyBackground.supportLevel !== 'NONE') {
      support.push('Family support');
    }

    support.push('Professional network');
    support.push('Career mentors');
    support.push('Online communities');

    return support;
  }

  private identifyRisks(prediction: {
    predictedDifficulty: DifficultyLevel;
    successProbability: number;
  }): string[] {
    const risks: string[] = [];

    if (prediction.predictedDifficulty === 'DIFFICULT' || prediction.predictedDifficulty === 'VERY_DIFFICULT') {
      risks.push('Extended unemployment period');
      risks.push('Potential salary reduction');
    }

    if (prediction.successProbability < 0.5) {
      risks.push('High failure probability');
    }

    risks.push('Skill gap challenges');

    return risks;
  }

  private groupByType(transitions: CareerTransition[]): Record<string, CareerTransition[]> {
    const groups: Record<string, CareerTransition[]> = {};
    for (const t of transitions) {
      if (!groups[t.type]) groups[t.type] = [];
      groups[t.type].push(t);
    }
    return groups;
  }

  private findCommonElements(arr: string[]): string[] {
    const counts: Record<string, number> = {};
    for (const item of arr) {
      counts[item] = (counts[item] || 0) + 1;
    }
    return Object.entries(counts)
      .filter(([_, count]) => count > 1)
      .map(([item]) => item);
  }

  private identifyCommonPatterns(transitions: CareerTransition[]): string[] {
    const patterns: string[] = [];

    const industryChanges = transitions.filter(t => t.type === 'INDUSTRY_CHANGE').length;
    if (industryChanges > transitions.length * 0.3) {
      patterns.push('High rate of industry changes');
    }

    const successfulDifficult = transitions.filter(t => 
      t.successful && (t.difficulty === 'DIFFICULT' || t.difficulty === 'VERY_DIFFICULT')
    ).length;
    if (successfulDifficult > 0) {
      patterns.push('Successful navigation of difficult transitions');
    }

    return patterns;
  }

  private generateTransitionInsights(
    transitions: CareerTransition[],
    byType: Record<TransitionType, any>
  ): string[] {
    const insights: string[] = [];

    const total = transitions.length;
    const successful = transitions.filter(t => t.successful).length;
    
    insights.push(`Overall success rate: ${(successful / total * 100).toFixed(1)}% (${successful}/${total})`);

    // Find hardest type
    const hardestType = Object.entries(byType)
      .sort((a, b) => {
        const diffA = this.difficultyScore(a[1].avgDifficulty);
        const diffB = this.difficultyScore(b[1].avgDifficulty);
        return diffB - diffA;
      })[0];

    if (hardestType) {
      insights.push(`${hardestType[0]} transitions are most challenging with ${hardestType[1].avgDifficulty} average difficulty`);
    }

    return insights;
  }

  private careerSimilarity(a: string, b: string): number {
    // Simplified similarity - would use proper career taxonomy
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    
    if (aLower === bLower) return 1;
    if (aLower.includes(bLower) || bLower.includes(aLower)) return 0.7;
    return 0.3;
  }
}
