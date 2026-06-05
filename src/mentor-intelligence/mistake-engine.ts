/**
 * Mistake Engine
 *
 * Analyzes mistakes, failures, and regrets from career journeys.
 * Identifies most common mistakes, most costly mistakes, and most regretted decisions.
 *
 * @module MistakeEngine
 */

import {
  CareerJourney,
  JourneyId,
  CareerFailure,
  CareerRegret,
  CareerDecision,
  ImpactLevel,
  ImportanceLevel,
} from '../career-journeys/career-journey-types';

import {
  MistakeAnalysis,
  MistakeId,
  MistakeCategory,
  MistakeCost,
  PatternFrequency,
  ConfidenceLevel,
  ExtractionConfig,
  DEFAULT_EXTRACTION_CONFIG,
} from './mentor-intelligence-types';

/**
 * Mistake Engine
 *
 * Extracts and analyzes mistakes from career journeys to identify
 * patterns of costly errors and regretted decisions.
 */
export class MistakeEngine {
  private config: ExtractionConfig;

  constructor(config: Partial<ExtractionConfig> = {}) {
    this.config = { ...DEFAULT_EXTRACTION_CONFIG, ...config };
  }

  /**
   * Analyze all mistakes from a set of journeys
   */
  analyzeMistakes(
    journeys: CareerJourney[],
    options: {
      minFrequency?: number;
      maxMistakes?: number;
      categories?: MistakeCategory[];
    } = {}
  ): {
    allMistakes: MistakeAnalysis[];
    mostCommon: MistakeAnalysis[];
    mostCostly: MistakeAnalysis[];
    mostRegretted: MistakeAnalysis[];
    byCategory: Record<MistakeCategory, MistakeAnalysis[]>;
    statistics: {
      totalAnalyzed: number;
      uniqueMistakes: number;
      averageCost: number;
      topCategory: MistakeCategory;
      recoverableRate: number;
    };
  } {
    const allMistakes: MistakeAnalysis[] = [];

    // Extract from failures
    for (const journey of journeys) {
      for (const failure of journey.failures) {
        const analysis = this.analyzeFailure(failure, journey);
        if (analysis) allMistakes.push(analysis);
      }
    }

    // Extract from regrets
    for (const journey of journeys) {
      for (const regret of journey.regrets) {
        const analysis = this.analyzeRegret(regret, journey);
        if (analysis) allMistakes.push(analysis);
      }
    }

    // Extract from bad decisions
    for (const journey of journeys) {
      for (const decision of journey.majorDecisions) {
        if (!decision.actualOutcome.positive) {
          const analysis = this.analyzeBadDecision(decision, journey);
          if (analysis) allMistakes.push(analysis);
        }
      }
    }

    // Consolidate similar mistakes
    const consolidated = this.consolidateMistakes(allMistakes);

    // Filter by frequency
    const minFreq = options.minFrequency || this.config.minPatternFrequency;
    const filtered = consolidated.filter(m => m.frequency.count >= minFreq);

    // Sort by different criteria
    const mostCommon = this.identifyMostCommon(filtered);
    const mostCostly = this.identifyMostCostly(filtered);
    const mostRegretted = this.identifyMostRegretted(filtered);

    // Categorize
    const byCategory = this.categorizeMistakes(filtered);

    // Calculate statistics
    const statistics = this.calculateStatistics(filtered, allMistakes, journeys);

    return {
      allMistakes: filtered.slice(0, options.maxMistakes || this.config.maxInsights),
      mostCommon,
      mostCostly,
      mostRegretted,
      byCategory,
      statistics,
    };
  }

  /**
   * Identify mistakes relevant to a specific context
   */
  identifyRelevantMistakes(
    journeys: CareerJourney[],
    context: {
      careerStage?: string;
      situation?: string;
      decisionType?: string;
      constraints?: string[];
    }
  ): {
    highlyRelevant: MistakeAnalysis[];
    moderatelyRelevant: MistakeAnalysis[];
    warnings: string[];
    preventionStrategies: string[];
  } {
    const allMistakes = this.analyzeMistakes(journeys, { maxMistakes: 100 });

    // Score relevance
    const scoredMistakes = allMistakes.allMistakes.map(mistake => ({
      mistake,
      relevanceScore: this.calculateRelevanceScore(mistake, context),
    }));

    // Sort by relevance
    scoredMistakes.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Categorize by relevance
    const highlyRelevant = scoredMistakes
      .filter(s => s.relevanceScore >= 0.7)
      .map(s => s.mistake);

    const moderatelyRelevant = scoredMistakes
      .filter(s => s.relevanceScore >= 0.4 && s.relevanceScore < 0.7)
      .map(s => s.mistake);

    // Generate warnings
    const warnings = this.generateWarnings(highlyRelevant, context);

    // Generate prevention strategies
    const preventionStrategies = this.generatePreventionStrategies(highlyRelevant);

    return {
      highlyRelevant,
      moderatelyRelevant,
      warnings,
      preventionStrategies,
    };
  }

  /**
   * Compare mistakes across different journey groups
   */
  compareMistakesAcrossGroups(
    groupA: CareerJourney[],
    groupB: CareerJourney[],
    groupAName: string = 'Group A',
    groupBName: string = 'Group B'
  ): {
    uniqueToA: MistakeAnalysis[];
    uniqueToB: MistakeAnalysis[];
    common: MistakeAnalysis[];
    morePrevalentInA: MistakeAnalysis[];
    morePrevalentInB: MistakeAnalysis[];
    analysis: string;
  } {
    const mistakesA = this.analyzeMistakes(groupA, { maxMistakes: 100 });
    const mistakesB = this.analyzeMistakes(groupB, { maxMistakes: 100 });

    // Find unique and common mistakes
    const uniqueToA = mistakesA.allMistakes.filter(ma =>
      !mistakesB.allMistakes.some(mb => this.mistakesAreSimilar(ma, mb))
    );

    const uniqueToB = mistakesB.allMistakes.filter(mb =>
      !mistakesA.allMistakes.some(ma => this.mistakesAreSimilar(ma, mb))
    );

    const common = mistakesA.allMistakes.filter(ma =>
      mistakesB.allMistakes.some(mb => this.mistakesAreSimilar(ma, mb))
    );

    // Find more prevalent mistakes
    const morePrevalentInA: MistakeAnalysis[] = [];
    const morePrevalentInB: MistakeAnalysis[] = [];

    for (const mistake of common) {
      const matchB = mistakesB.allMistakes.find(mb => this.mistakesAreSimilar(mistake, mb));
      if (matchB) {
        const freqA = mistake.frequency.percentage;
        const freqB = matchB.frequency.percentage;

        if (freqA > freqB * 1.5) {
          morePrevalentInA.push(mistake);
        } else if (freqB > freqA * 1.5) {
          morePrevalentInB.push(matchB);
        }
      }
    }

    const analysis = this.generateComparisonAnalysis(
      uniqueToA, uniqueToB, common,
      groupAName, groupBName
    );

    return {
      uniqueToA,
      uniqueToB,
      common,
      morePrevalentInA,
      morePrevalentInB,
      analysis,
    };
  }

  /**
   * Calculate recoverability of mistakes
   */
  calculateRecoverability(
    mistake: MistakeAnalysis,
    journeys: CareerJourney[]
  ): {
    recoverable: boolean;
    recoveryRate: number;
    averageRecoveryTime: string;
    recoveryStrategies: string[];
    factors: {
      helpsRecovery: string[];
      hindersRecovery: string[];
    };
  } {
    // Find journeys where this mistake occurred
    const affectedJourneys = journeys.filter(j =>
      mistake.sourceJourneys.includes(j.id)
    );

    // Check recovery status
    const recovered = affectedJourneys.filter(j =>
      j.failures.some(f => f.recovered)
    );

    const recoveryRate = affectedJourneys.length > 0
      ? recovered.length / affectedJourneys.length
      : 0;

    const recoverable = recoveryRate >= 0.3;

    // Estimate recovery time
    const averageRecoveryTime = this.estimateRecoveryTime(mistake);

    // Extract recovery strategies
    const recoveryStrategies = this.extractRecoveryStrategies(recovered);

    // Identify factors
    const factors = this.identifyRecoveryFactors(affectedJourneys, recovered);

    return {
      recoverable,
      recoveryRate,
      averageRecoveryTime,
      recoveryStrategies,
      factors,
    };
  }

  /**
   * Generate early warning system for a student
   */
  generateEarlyWarningSystem(
    journeys: CareerJourney[],
    studentContext: {
      careerStage: string;
      recentDecisions: string[];
      currentSituation: string;
    }
  ): {
    activeWarnings: Array<{
      mistake: MistakeAnalysis;
      warningSigns: string[];
      probability: number;
      severity: 'HIGH' | 'MEDIUM' | 'LOW';
    }>;
    preventionPlan: string[];
    monitoringCheckpoints: string[];
  } {
    const allMistakes = this.analyzeMistakes(journeys);

    // Identify relevant mistakes
    const relevantMistakes = this.identifyRelevantMistakes(journeys, {
      careerStage: studentContext.careerStage,
      situation: studentContext.currentSituation,
    });

    // Generate active warnings
    const activeWarnings = relevantMistakes.highlyRelevant.map(mistake => ({
      mistake,
      warningSigns: mistake.warningSigns,
      probability: this.calculateWarningProbability(mistake, studentContext),
      severity: this.calculateWarningSeverity(mistake),
    }));

    // Sort by severity and probability
    activeWarnings.sort((a, b) => {
      const scoreA = (a.severity === 'HIGH' ? 3 : a.severity === 'MEDIUM' ? 2 : 1) * a.probability;
      const scoreB = (b.severity === 'HIGH' ? 3 : b.severity === 'MEDIUM' ? 2 : 1) * b.probability;
      return scoreB - scoreA;
    });

    // Generate prevention plan
    const preventionPlan = this.generatePreventionPlan(activeWarnings);

    // Generate monitoring checkpoints
    const monitoringCheckpoints = this.generateMonitoringCheckpoints(activeWarnings);

    return {
      activeWarnings,
      preventionPlan,
      monitoringCheckpoints,
    };
  }

  // ============================================================================
  // PRIVATE ANALYSIS METHODS
  // ============================================================================

  private analyzeFailure(failure: CareerFailure, journey: CareerJourney): MistakeAnalysis | null {
    const category = this.categorizeFailure(failure);
    const cost = this.calculateFailureCost(failure);

    return {
      id: this.generateMistakeId(),
      mistake: failure.description,
      category,
      frequency: {
        count: 1,
        total: 1,
        percentage: 1,
        classification: 'RARE',
      },
      cost,
      confidence: 0.85,
      warningSigns: this.inferWarningSigns(failure),
      avoidanceStrategies: failure.lessonsLearned,
      recoveryStrategies: failure.recovered
        ? ['Recovery was achieved through persistence and adaptation']
        : ['Seek mentorship', 'Reassess approach', 'Consider alternative paths'],
      sourceJourneys: [journey.id],
      positiveDeviations: [],
      relatedMistakes: [],
      extractedAt: new Date(),
    };
  }

  private analyzeRegret(regret: CareerRegret, journey: CareerJourney): MistakeAnalysis | null {
    const category = this.categorizeRegret(regret);
    const cost = this.calculateRegretCost(regret);

    return {
      id: this.generateMistakeId(),
      mistake: `${regret.whatWasDone} instead of ${regret.whatShouldHaveBeenDone}`,
      category,
      frequency: {
        count: 1,
        total: 1,
        percentage: 1,
        classification: 'RARE',
      },
      cost,
      confidence: 0.8,
      warningSigns: [
        'Hesitation in decision-making',
        'External pressure overriding intuition',
        'Lack of thorough consideration',
      ],
      avoidanceStrategies: [
        `Consider: ${regret.whatShouldHaveBeenDone}`,
        'Take time for thorough decision analysis',
        'Seek multiple perspectives',
      ],
      recoveryStrategies: regret.addressable && regret.howToAddress
        ? [regret.howToAddress]
        : ['Focus on future opportunities', 'Apply lesson to current decisions'],
      sourceJourneys: [journey.id],
      positiveDeviations: [],
      relatedMistakes: [],
      extractedAt: new Date(),
    };
  }

  private analyzeBadDecision(decision: CareerDecision, journey: CareerJourney): MistakeAnalysis | null {
    const category: MistakeCategory = 'STRATEGIC_ERROR';
    const cost = this.calculateDecisionCost(decision);

    return {
      id: this.generateMistakeId(),
      mistake: decision.decision,
      category,
      frequency: {
        count: 1,
        total: 1,
        percentage: 1,
        classification: 'RARE',
      },
      cost,
      confidence: 0.75,
      warningSigns: [
        'Decision made under pressure',
        'Limited information gathering',
        'Ignoring alternatives',
      ],
      avoidanceStrategies: [
        'Consider alternatives: ' + decision.alternativesConsidered.join(', '),
        'Gather more information before deciding',
        'Consult mentors or advisors',
      ],
      recoveryStrategies: [
        'Acknowledge the mistake',
        'Pivot if possible',
        'Extract lessons for future decisions',
      ],
      sourceJourneys: [journey.id],
      positiveDeviations: [],
      relatedMistakes: [],
      extractedAt: new Date(),
    };
  }

  // ============================================================================
  // PRIVATE CONSOLIDATION METHODS
  // ============================================================================

  private consolidateMistakes(mistakes: MistakeAnalysis[]): MistakeAnalysis[] {
    const groups = new Map<string, MistakeAnalysis[]>();

    // Group similar mistakes
    for (const mistake of mistakes) {
      const key = this.normalizeMistake(mistake.mistake);

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(mistake);
    }

    // Merge groups
    const consolidated: MistakeAnalysis[] = [];

    for (const [_, group] of groups) {
      if (group.length === 1) {
        consolidated.push(group[0]);
      } else {
        consolidated.push(this.mergeMistakeGroup(group));
      }
    }

    return consolidated;
  }

  private mergeMistakeGroup(group: MistakeAnalysis[]): MistakeAnalysis {
    const representative = group[0];

    // Merge source journeys
    const allJourneys = [...new Set(group.flatMap(m => m.sourceJourneys))];

    // Calculate combined frequency
    const frequency = {
      count: allJourneys.length,
      total: group[0].frequency.total,
      percentage: allJourneys.length / group[0].frequency.total,
      classification: this.classifyFrequency(allJourneys.length, group[0].frequency.total),
    };

    // Merge warning signs
    const allWarningSigns = [...new Set(group.flatMap(m => m.warningSigns))];

    // Merge strategies
    const allAvoidance = [...new Set(group.flatMap(m => m.avoidanceStrategies))];
    const allRecovery = [...new Set(group.flatMap(m => m.recoveryStrategies))];

    // Calculate average confidence
    const avgConfidence = group.reduce((sum, m) => sum + m.confidence, 0) / group.length;

    return {
      ...representative,
      frequency,
      confidence: avgConfidence as ConfidenceLevel,
      warningSigns: allWarningSigns,
      avoidanceStrategies: allAvoidance,
      recoveryStrategies: allRecovery,
      sourceJourneys: allJourneys,
    };
  }

  // ============================================================================
  // PRIVATE IDENTIFICATION METHODS
  // ============================================================================

  private identifyMostCommon(mistakes: MistakeAnalysis[]): MistakeAnalysis[] {
    return mistakes
      .filter(m => m.frequency.classification === 'COMMON' || m.frequency.classification === 'VERY_COMMON')
      .slice(0, 5);
  }

  private identifyMostCostly(mistakes: MistakeAnalysis[]): MistakeAnalysis[] {
    return [...mistakes]
      .sort((a, b) => {
        const costOrder = { 'SEVERE': 4, 'SIGNIFICANT': 3, 'MODERATE': 2, 'MINOR': 1, 'NEGLIGIBLE': 0 };
        return costOrder[b.cost.careerCost] - costOrder[a.cost.careerCost];
      })
      .slice(0, 5);
  }

  private identifyMostRegretted(mistakes: MistakeAnalysis[]): MistakeAnalysis[] {
    return mistakes
      .filter(m => m.mistake.toLowerCase().includes('instead') || m.mistake.toLowerCase().includes('regret'))
      .slice(0, 5);
  }

  private categorizeMistakes(
    mistakes: MistakeAnalysis[]
  ): Record<MistakeCategory, MistakeAnalysis[]> {
    const byCategory: Partial<Record<MistakeCategory, MistakeAnalysis[]>> = {};

    for (const mistake of mistakes) {
      if (!byCategory[mistake.category]) {
        byCategory[mistake.category] = [];
      }
      byCategory[mistake.category]!.push(mistake);
    }

    return byCategory as Record<MistakeCategory, MistakeAnalysis[]>;
  }

  // ============================================================================
  // PRIVATE UTILITY METHODS
  // ============================================================================

  private categorizeFailure(failure: CareerFailure): MistakeCategory {
    const description = failure.description.toLowerCase();
    const type = failure.type.toLowerCase();

    if (type.includes('premature') || type.includes('early')) return 'PREMATURE_DECISION';
    if (type.includes('skill') || type.includes('knowledge')) return 'WRONG_SKILL_FOCUS';
    if (type.includes('network') || type.includes('relationship')) return 'NEGLECTED_NETWORKING';
    if (type.includes('timing') || type.includes('early') || type.includes('late')) return 'POOR_TIMING';
    if (type.includes('validation') || type.includes('market')) return 'INADEQUATE_VALIDATION';
    if (type.includes('execution') || type.includes('delivery')) return 'OVERCONFIDENCE';
    if (type.includes('strategy') || type.includes('plan')) return 'STRATEGIC_ERROR';
    if (type.includes('burnout') || type.includes('health')) return 'BURNOUT_NEGLECT';

    return 'STRATEGIC_ERROR';
  }

  private categorizeRegret(regret: CareerRegret): MistakeCategory {
    const type = regret.type;

    const categoryMap: Record<string, MistakeCategory> = {
      'ACTION_NOT_TAKEN': 'DELAYED_DECISION',
      'ACTION_TAKEN': 'PREMATURE_DECISION',
      'TIMING': 'POOR_TIMING',
      'SKILL_NOT_DEVELOPED': 'WRONG_SKILL_FOCUS',
      'OPPORTUNITY_MISSED': 'STRATEGIC_ERROR',
    };

    return categoryMap[type] || 'STRATEGIC_ERROR';
  }

  private calculateFailureCost(failure: CareerFailure): MistakeCost {
    const impact = failure.impact;

    const careerCost: MistakeCost['careerCost'] =
      impact === 'TRANSFORMATIONAL' ? 'SEVERE' :
      impact === 'MAJOR' ? 'SIGNIFICANT' :
      impact === 'MODERATE' ? 'MODERATE' :
      impact === 'MINOR' ? 'MINOR' : 'NEGLIGIBLE';

    return {
      timeCost: '6-12 months',
      financialCost: careerCost,
      careerCost,
      opportunityCost: 'Missed opportunities during recovery period',
      emotionalCost: impact === 'TRANSFORMATIONAL' || impact === 'MAJOR' ? 'SIGNIFICANT' : 'MODERATE',
    };
  }

  private calculateRegretCost(regret: CareerRegret): MistakeCost {
    const intensity = regret.intensity;

    const careerCost: MistakeCost['careerCost'] =
      intensity === 'SEVERE' ? 'SIGNIFICANT' :
      intensity === 'MODERATE' ? 'MODERATE' : 'MINOR';

    return {
      timeCost: 'Ongoing',
      financialCost: careerCost,
      careerCost,
      opportunityCost: `Missed: ${regret.whatShouldHaveBeenDone}`,
      emotionalCost: intensity === 'SEVERE' ? 'SIGNIFICANT' : 'MODERATE',
    };
  }

  private calculateDecisionCost(decision: CareerDecision): MistakeCost {
    const impact = decision.actualOutcome.impact;

    const careerCost: MistakeCost['careerCost'] =
      impact === 'TRANSFORMATIONAL' ? 'SIGNIFICANT' :
      impact === 'MAJOR' ? 'MODERATE' :
      impact === 'MODERATE' ? 'MODERATE' : 'MINOR';

    return {
      timeCost: '3-6 months',
      financialCost: careerCost,
      careerCost,
      opportunityCost: 'Alternative paths not taken',
      emotionalCost: 'MODERATE',
    };
  }

  private inferWarningSigns(failure: CareerFailure): string[] {
    return [
      'Overconfidence in abilities',
      'Insufficient preparation',
      'Ignoring warning signals',
      'Lack of contingency planning',
    ];
  }

  private normalizeMistake(mistake: string): string {
    return mistake.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 80);
  }

  private classifyFrequency(count: number, total: number): PatternFrequency['classification'] {
    const percentage = count / total;

    if (percentage >= 0.5) return 'UNIVERSAL';
    if (percentage >= 0.3) return 'VERY_COMMON';
    if (percentage >= 0.15) return 'COMMON';
    if (percentage >= 0.05) return 'UNCOMMON';
    return 'RARE';
  }

  private mistakesAreSimilar(a: MistakeAnalysis, b: MistakeAnalysis): boolean {
    const normalizedA = this.normalizeMistake(a.mistake);
    const normalizedB = this.normalizeMistake(b.mistake);

    return normalizedA === normalizedB ||
           normalizedA.includes(normalizedB.substring(0, 40)) ||
           normalizedB.includes(normalizedA.substring(0, 40));
  }

  private calculateRelevanceScore(
    mistake: MistakeAnalysis,
    context: {
      careerStage?: string;
      situation?: string;
      decisionType?: string;
      constraints?: string[];
    }
  ): number {
    let score = 0;

    // Career stage relevance
    if (context.careerStage) {
      // Most mistakes are relevant across stages, but some are stage-specific
      score += 0.3;
    }

    // Situation relevance
    if (context.situation) {
      const situationLower = context.situation.toLowerCase();
      if (mistake.mistake.toLowerCase().includes(situationLower)) {
        score += 0.4;
      }
    }

    // Decision type relevance
    if (context.decisionType) {
      const decisionLower = context.decisionType.toLowerCase();
      if (mistake.mistake.toLowerCase().includes(decisionLower)) {
        score += 0.3;
      }
    }

    return score;
  }

  private generateWarnings(mistakes: MistakeAnalysis[], context: Record<string, unknown>): string[] {
    return mistakes.slice(0, 3).map(m =>
      `Warning: ${m.mistake.substring(0, 50)}...`
    );
  }

  private generatePreventionStrategies(mistakes: MistakeAnalysis[]): string[] {
    const strategies = new Set<string>();

    for (const mistake of mistakes.slice(0, 5)) {
      for (const strategy of mistake.avoidanceStrategies.slice(0, 2)) {
        strategies.add(strategy);
      }
    }

    return Array.from(strategies);
  }

  private estimateRecoveryTime(mistake: MistakeAnalysis): string {
    switch (mistake.cost.careerCost) {
      case 'SEVERE': return '2-3 years';
      case 'SIGNIFICANT': return '1-2 years';
      case 'MODERATE': return '6-12 months';
      case 'MINOR': return '3-6 months';
      default: return '1-3 months';
    }
  }

  private extractRecoveryStrategies(recoveredJourneys: CareerJourney[]): string[] {
    const strategies = new Set<string>();

    for (const journey of recoveredJourneys) {
      for (const success of journey.successes) {
        for (const factor of success.contributingFactors) {
          strategies.add(factor);
        }
      }
    }

    return Array.from(strategies).slice(0, 5);
  }

  private identifyRecoveryFactors(
    affectedJourneys: CareerJourney[],
    recoveredJourneys: CareerJourney[]
  ): { helpsRecovery: string[]; hindersRecovery: string[] } {
    const helpsRecovery = [
      'Strong support network',
      'Willingness to adapt',
      'Learning from failure',
      'Persistence',
    ];

    const hindersRecovery = [
      'Blaming external factors',
      'Repeating same mistakes',
      'Lack of support',
      'Giving up too soon',
    ];

    return { helpsRecovery, hindersRecovery };
  }

  private calculateWarningProbability(
    mistake: MistakeAnalysis,
    context: { recentDecisions: string[]; currentSituation: string }
  ): number {
    let probability = mistake.frequency.percentage;

    // Increase probability if context matches warning signs
    for (const sign of mistake.warningSigns) {
      if (context.currentSituation.toLowerCase().includes(sign.toLowerCase())) {
        probability += 0.2;
      }
    }

    return Math.min(probability, 1);
  }

  private calculateWarningSeverity(mistake: MistakeAnalysis): 'HIGH' | 'MEDIUM' | 'LOW' {
    const costScore = { 'SEVERE': 3, 'SIGNIFICANT': 2, 'MODERATE': 1, 'MINOR': 0, 'NEGLIGIBLE': 0 };
    const score = costScore[mistake.cost.careerCost];

    if (score >= 2) return 'HIGH';
    if (score >= 1) return 'MEDIUM';
    return 'LOW';
  }

  private generatePreventionPlan(warnings: Array<{ mistake: MistakeAnalysis }>): string[] {
    const plan: string[] = [];

    for (const warning of warnings.slice(0, 3)) {
      plan.push(...warning.mistake.avoidanceStrategies.slice(0, 2));
    }

    return [...new Set(plan)];
  }

  private generateMonitoringCheckpoints(warnings: Array<{ mistake: MistakeAnalysis }>): string[] {
    return [
      'Weekly self-assessment',
      'Monthly progress review',
      'Quarterly goal alignment check',
      'Seek feedback from mentors',
    ];
  }

  private generateComparisonAnalysis(
    uniqueToA: MistakeAnalysis[],
    uniqueToB: MistakeAnalysis[],
    common: MistakeAnalysis[],
    groupAName: string,
    groupBName: string
  ): string {
    return `${groupAName} has ${uniqueToA.length} unique mistake patterns, ${groupBName} has ${uniqueToB.length} unique patterns, and ${common.length} mistake patterns are shared between both groups.`;
  }

  private calculateStatistics(
    consolidated: MistakeAnalysis[],
    allMistakes: MistakeAnalysis[],
    journeys: CareerJourney[]
  ): {
    totalAnalyzed: number;
    uniqueMistakes: number;
    averageCost: number;
    topCategory: MistakeCategory;
    recoverableRate: number;
  } {
    // Calculate average cost
    const costScores = { 'SEVERE': 4, 'SIGNIFICANT': 3, 'MODERATE': 2, 'MINOR': 1, 'NEGLIGIBLE': 0 };
    const avgCost = consolidated.length > 0
      ? consolidated.reduce((sum, m) => sum + costScores[m.cost.careerCost], 0) / consolidated.length
      : 0;

    // Find top category
    const categoryCounts = new Map<MistakeCategory, number>();
    for (const mistake of consolidated) {
      categoryCounts.set(mistake.category, (categoryCounts.get(mistake.category) || 0) + 1);
    }

    const topCategory = Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'STRATEGIC_ERROR';

    // Calculate recoverable rate
    const recoverableMistakes = consolidated.filter(m =>
      m.recoveryStrategies.length > 0 && m.cost.careerCost !== 'SEVERE'
    ).length;
    const recoverableRate = consolidated.length > 0
      ? recoverableMistakes / consolidated.length
      : 0;

    return {
      totalAnalyzed: allMistakes.length,
      uniqueMistakes: consolidated.length,
      averageCost: avgCost,
      topCategory,
      recoverableRate,
    };
  }

  private generateMistakeId(): MistakeId {
    return `mistake_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as MistakeId;
  }
}
