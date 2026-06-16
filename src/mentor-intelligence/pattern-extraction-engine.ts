/**
 * Pattern Extraction Engine
 * 
 * Identifies repeated success patterns, failure patterns, regret patterns,
 * and growth patterns from career journeys.
 * 
 * @module PatternExtractionEngine
 */

import {
  CareerJourney,
  JourneyId,
  CareerSuccess,
  CareerFailure,
  CareerRegret,
  LessonLearned,
  CareerDecision,
  TurningPoint,
  ImpactLevel,
} from '../career-journeys/career-journey-types';

import {
  SuccessPattern,
  FailurePattern,
  PatternId,
  PatternFrequency,
  OutcomeImpact,
  SuccessCategory,
  FailureCategory,
  ConfidenceLevel,
  ExtractionConfig,
  DEFAULT_EXTRACTION_CONFIG,
} from './mentor-intelligence-types';

/**
 * Extracted pattern candidate before validation
 */
interface PatternCandidate {
  pattern: string;
  category: SuccessCategory | FailureCategory;
  behaviors: string[];
  sourceJourneys: JourneyId[];
  type: 'SUCCESS' | 'FAILURE';
}

/**
 * Pattern Extraction Engine
 * 
 * Extracts recurring patterns from career journeys that lead to
 * success, failure, or specific outcomes.
 */
export class PatternExtractionEngine {
  private config: ExtractionConfig;

  constructor(config: Partial<ExtractionConfig> = {}) {
    this.config = { ...DEFAULT_EXTRACTION_CONFIG, ...config };
  }

  /**
   * Extract all patterns from a set of journeys
   */
  extractPatterns(
    journeys: CareerJourney[],
    focusArea: 'SUCCESS' | 'FAILURE' | 'BOTH' = 'BOTH'
  ): {
    successPatterns: SuccessPattern[];
    failurePatterns: FailurePattern[];
    statistics: {
      totalSuccessPatterns: number;
      totalFailurePatterns: number;
      averageConfidence: number;
      mostCommonSuccessCategory: SuccessCategory;
      mostCommonFailureCategory: FailureCategory;
    };
  } {
    let successPatterns: SuccessPattern[] = [];
    let failurePatterns: FailurePattern[] = [];

    if (focusArea === 'SUCCESS' || focusArea === 'BOTH') {
      successPatterns = this.extractSuccessPatterns(journeys);
    }

    if (focusArea === 'FAILURE' || focusArea === 'BOTH') {
      failurePatterns = this.extractFailurePatterns(journeys);
    }

    // Calculate statistics
    const avgSuccessConfidence = successPatterns.length > 0
      ? successPatterns.reduce((sum, p) => sum + p.confidence, 0) / successPatterns.length
      : 0;
    const avgFailureConfidence = failurePatterns.length > 0
      ? failurePatterns.reduce((sum, p) => sum + p.confidence, 0) / failurePatterns.length
      : 0;

    const averageConfidence = (avgSuccessConfidence + avgFailureConfidence) / 2;

    return {
      successPatterns,
      failurePatterns,
      statistics: {
        totalSuccessPatterns: successPatterns.length,
        totalFailurePatterns: failurePatterns.length,
        averageConfidence,
        mostCommonSuccessCategory: this.findMostCommonCategory(successPatterns),
        mostCommonFailureCategory: this.findMostCommonFailureCategory(failurePatterns),
      },
    };
  }

  /**
   * Extract success patterns from journeys
   */
  extractSuccessPatterns(journeys: CareerJourney[]): SuccessPattern[] {
    const candidates: PatternCandidate[] = [];

    // Extract from successes
    for (const journey of journeys) {
      for (const success of journey.successes) {
        const candidate = this.extractSuccessCandidate(success, journey);
        if (candidate) candidates.push(candidate);
      }
    }

    // Extract from turning points with positive effects
    for (const journey of journeys) {
      for (const tp of journey.turningPoints) {
        if (tp.positiveEffects.length > tp.negativeEffects.length) {
          const candidate = this.extractTurningPointSuccessCandidate(tp, journey);
          if (candidate) candidates.push(candidate);
        }
      }
    }

    // Extract from good decisions
    for (const journey of journeys) {
      for (const decision of journey.majorDecisions) {
        if (decision.actualOutcome.positive) {
          const candidate = this.extractDecisionSuccessCandidate(decision, journey);
          if (candidate) candidates.push(candidate);
        }
      }
    }

    // Group and consolidate candidates
    const consolidated = this.consolidateCandidates(candidates);

    // Convert to validated patterns
    return consolidated
      .filter(c => this.meetsFrequencyThreshold(c))
      .map(c => this.createSuccessPattern(c, journeys));
  }

  /**
   * Extract failure patterns from journeys
   */
  extractFailurePatterns(journeys: CareerJourney[]): FailurePattern[] {
    const candidates: PatternCandidate[] = [];

    // Extract from failures
    for (const journey of journeys) {
      for (const failure of journey.failures) {
        const candidate = this.extractFailureCandidate(failure, journey);
        if (candidate) candidates.push(candidate);
      }
    }

    // Extract from regrets
    for (const journey of journeys) {
      for (const regret of journey.regrets) {
        const candidate = this.extractRegretCandidate(regret, journey);
        if (candidate) candidates.push(candidate);
      }
    }

    // Extract from bad decisions
    for (const journey of journeys) {
      for (const decision of journey.majorDecisions) {
        if (!decision.actualOutcome.positive) {
          const candidate = this.extractDecisionFailureCandidate(decision, journey);
          if (candidate) candidates.push(candidate);
        }
      }
    }

    // Group and consolidate
    const consolidated = this.consolidateCandidates(candidates);

    // Convert to validated patterns
    return consolidated
      .filter(c => this.meetsFrequencyThreshold(c))
      .map(c => this.createFailurePattern(c, journeys));
  }

  /**
   * Extract patterns specific to a category
   */
  extractPatternsByCategory(
    journeys: CareerJourney[],
    category: SuccessCategory | FailureCategory
  ): SuccessPattern[] | FailurePattern[] {
    const allPatterns = this.extractPatterns(journeys);

    if (this.isSuccessCategory(category)) {
      return allPatterns.successPatterns.filter(p => p.category === category);
    } else {
      return allPatterns.failurePatterns.filter(p => p.category === category);
    }
  }

  /**
   * Find patterns that appear together (co-occurring patterns)
   */
  findCooccurringPatterns(
    journeys: CareerJourney[],
    minCooccurrence: number = 2
  ): Array<{
    patterns: [PatternId, PatternId];
    cooccurrenceCount: number;
    confidence: ConfidenceLevel;
    journeys: JourneyId[];
  }> {
    const cooccurrences: Map<string, { count: number; journeys: Set<JourneyId> }> = new Map();

    // Extract all patterns per journey
    const journeyPatterns = new Map<JourneyId, PatternCandidate[]>();

    for (const journey of journeys) {
      const patterns = this.extractAllCandidatesFromJourney(journey);
      journeyPatterns.set(journey.id, patterns);
    }

    // Find co-occurrences
    for (const [journeyId, patterns] of journeyPatterns) {
      for (let i = 0; i < patterns.length; i++) {
        for (let j = i + 1; j < patterns.length; j++) {
          const key = this.patternPairKey(patterns[i], patterns[j]);
          
          if (!cooccurrences.has(key)) {
            cooccurrences.set(key, { count: 0, journeys: new Set() });
          }
          
          const entry = cooccurrences.get(key)!;
          entry.count++;
          entry.journeys.add(journeyId);
        }
      }
    }

    // Filter and format results
    return Array.from(cooccurrences.entries())
      .filter(([_, data]) => data.count >= minCooccurrence)
      .map(([key, data]) => ({
        patterns: key.split('|') as [PatternId, PatternId],
        cooccurrenceCount: data.count,
        confidence: Math.min(data.count / journeys.length, 1) as ConfidenceLevel,
        journeys: Array.from(data.journeys),
      }));
  }

  /**
   * Compare patterns across different groups of journeys
   */
  comparePatternPrevalence(
    groupA: CareerJourney[],
    groupB: CareerJourney[],
    groupAName: string = 'Group A',
    groupBName: string = 'Group B'
  ): Array<{
    pattern: string;
    groupAFrequency: number;
    groupBFrequency: number;
    difference: number;
    significance: 'HIGH' | 'MEDIUM' | 'LOW';
  }> {
    const patternsA = this.extractAllPatternStrings(groupA);
    const patternsB = this.extractAllPatternStrings(groupB);

    const allPatterns = new Set([...patternsA.keys(), ...patternsB.keys()]);

    return Array.from(allPatterns).map(pattern => {
      const freqA = (patternsA.get(pattern) || 0) / groupA.length;
      const freqB = (patternsB.get(pattern) || 0) / groupB.length;
      const difference = Math.abs(freqA - freqB);

      let significance: 'HIGH' | 'MEDIUM' | 'LOW';
      if (difference > 0.3) significance = 'HIGH';
      else if (difference > 0.15) significance = 'MEDIUM';
      else significance = 'LOW';

      return {
        pattern,
        groupAFrequency: freqA,
        groupBFrequency: freqB,
        difference,
        significance,
      };
    }).sort((a, b) => b.difference - a.difference);
  }

  /**
   * Validate a pattern against counter-examples
   */
  validatePattern(
    pattern: SuccessPattern | FailurePattern,
    allJourneys: CareerJourney[]
  ): {
    validated: boolean;
    confidence: ConfidenceLevel;
    counterExamples: JourneyId[];
    positiveDeviations: JourneyId[];
    analysis: string;
  } {
    const counterExamples: JourneyId[] = [];
    const positiveDeviations: JourneyId[] = [];

    if ('counterExamples' in pattern) {
      // Success pattern - look for journeys with pattern but no success
      for (const journey of allJourneys) {
        if (this.journeyShowsPattern(journey, pattern.pattern)) {
          if (journey.successes.length === 0 && journey.failures.length > 0) {
            counterExamples.push(journey.id);
          }
        }
      }
    } else {
      // Failure pattern - look for journeys with pattern but success
      for (const journey of allJourneys) {
        if (this.journeyShowsPattern(journey, pattern.pattern)) {
          if (journey.successes.length > 0 && journey.failures.length === 0) {
            positiveDeviations.push(journey.id);
          }
        }
      }
    }

    const totalWithPattern = pattern.sourceJourneys.length + counterExamples.length + positiveDeviations.length;
    const successRate = pattern.sourceJourneys.length / totalWithPattern;
    
    const confidence = successRate as ConfidenceLevel;
    const validated = confidence >= this.config.minConfidenceThreshold;

    return {
      validated,
      confidence,
      counterExamples,
      positiveDeviations,
      analysis: `Pattern appears in ${totalWithPattern} journeys. ${'counterExamples' in pattern ? 'Success rate' : 'Failure rate'}: ${(successRate * 100).toFixed(1)}%`,
    };
  }

  // ============================================================================
  // PRIVATE EXTRACTION METHODS
  // ============================================================================

  private extractSuccessCandidate(success: CareerSuccess, journey: CareerJourney): PatternCandidate | null {
    const category = this.categorizeSuccess(success);
    
    return {
      pattern: success.contributingFactors.join(', '),
      category,
      behaviors: success.contributingFactors,
      sourceJourneys: [journey.id],
      type: 'SUCCESS',
    };
  }

  private extractTurningPointSuccessCandidate(tp: TurningPoint, journey: CareerJourney): PatternCandidate | null {
    const category = this.categorizeTurningPoint(tp);
    
    return {
      pattern: `${tp.event} leading to ${tp.positiveEffects.map(effect => effect.description).join(', ')}`,
      category: category as SuccessCategory,
      behaviors: [tp.event, ...tp.positiveEffects.map(effect => effect.description)],
      sourceJourneys: [journey.id],
      type: 'SUCCESS',
    };
  }

  private extractDecisionSuccessCandidate(decision: CareerDecision, journey: CareerJourney): PatternCandidate | null {
    const category = this.categorizeDecision(decision);
    
    return {
      pattern: `${decision.decision} with ${decision.confidence} confidence`,
      category,
      behaviors: [decision.decision, decision.reasoning],
      sourceJourneys: [journey.id],
      type: 'SUCCESS',
    };
  }

  private extractFailureCandidate(failure: CareerFailure, journey: CareerJourney): PatternCandidate | null {
    const category = this.categorizeFailure(failure);
    
    return {
      pattern: failure.description,
      category,
      behaviors: [failure.description, ...failure.lessonsLearned],
      sourceJourneys: [journey.id],
      type: 'FAILURE',
    };
  }

  private extractRegretCandidate(regret: CareerRegret, journey: CareerJourney): PatternCandidate | null {
    const category = this.categorizeRegret(regret);
    
    return {
      pattern: `${regret.whatWasDone} instead of ${regret.whatShouldHaveBeenDone}`,
      category,
      behaviors: [regret.whatWasDone, regret.whatShouldHaveBeenDone],
      sourceJourneys: [journey.id],
      type: 'FAILURE',
    };
  }

  private extractDecisionFailureCandidate(decision: CareerDecision, journey: CareerJourney): PatternCandidate | null {
    const category: FailureCategory = 'STRATEGIC_ERROR';
    
    return {
      pattern: `${decision.decision} - ${decision.actualOutcome.description}`,
      category,
      behaviors: [decision.decision, decision.reasoning],
      sourceJourneys: [journey.id],
      type: 'FAILURE',
    };
  }

  private extractAllCandidatesFromJourney(journey: CareerJourney): PatternCandidate[] {
    const candidates: PatternCandidate[] = [];

    for (const success of journey.successes) {
      const candidate = this.extractSuccessCandidate(success, journey);
      if (candidate) candidates.push(candidate);
    }

    for (const failure of journey.failures) {
      const candidate = this.extractFailureCandidate(failure, journey);
      if (candidate) candidates.push(candidate);
    }

    return candidates;
  }

  // ============================================================================
  // PRIVATE CONSOLIDATION METHODS
  // ============================================================================

  private consolidateCandidates(candidates: PatternCandidate[]): PatternCandidate[] {
    const groups = new Map<string, PatternCandidate[]>();

    // Group by pattern similarity
    for (const candidate of candidates) {
      const key = this.normalizePattern(candidate.pattern);
      
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(candidate);
    }

    // Consolidate each group
    const consolidated: PatternCandidate[] = [];
    
    for (const [_, group] of groups) {
      const merged: PatternCandidate = {
        pattern: group[0].pattern,
        category: group[0].category,
        behaviors: [...new Set(group.flatMap(c => c.behaviors))],
        sourceJourneys: [...new Set(group.flatMap(c => c.sourceJourneys))],
        type: group[0].type,
      };
      consolidated.push(merged);
    }

    return consolidated;
  }

  private meetsFrequencyThreshold(candidate: PatternCandidate): boolean {
    return candidate.sourceJourneys.length >= this.config.minPatternFrequency;
  }

  private normalizePattern(pattern: string): string {
    return pattern.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 50);
  }

  private patternPairKey(a: PatternCandidate, b: PatternCandidate): string {
    const keys = [this.normalizePattern(a.pattern), this.normalizePattern(b.pattern)].sort();
    return `${keys[0]}|${keys[1]}`;
  }

  // ============================================================================
  // PRIVATE PATTERN CREATION
  // ============================================================================

  private createSuccessPattern(candidate: PatternCandidate, allJourneys: CareerJourney[]): SuccessPattern {
    const frequency = this.calculateFrequency(candidate.sourceJourneys.length, allJourneys.length);
    const confidence = this.calculatePatternConfidence(candidate, allJourneys, 'SUCCESS');

    return {
      id: this.generatePatternId(),
      pattern: candidate.pattern,
      category: candidate.category as SuccessCategory,
      frequency,
      confidence,
      outcomeImpact: this.inferOutcomeImpact(candidate, 'SUCCESS'),
      behaviors: candidate.behaviors,
      enablingConditions: this.inferEnablingConditions(candidate),
      blockingConditions: this.inferBlockingConditions(candidate),
      sourceJourneys: candidate.sourceJourneys,
      counterExamples: [], // Populated by validation
      relatedPatterns: [], // Populated by co-occurrence analysis
    };
  }

  private createFailurePattern(candidate: PatternCandidate, allJourneys: CareerJourney[]): FailurePattern {
    const frequency = this.calculateFrequency(candidate.sourceJourneys.length, allJourneys.length);
    const confidence = this.calculatePatternConfidence(candidate, allJourneys, 'FAILURE');

    return {
      id: this.generatePatternId(),
      pattern: candidate.pattern,
      category: candidate.category as FailureCategory,
      frequency,
      confidence,
      outcomeImpact: this.inferOutcomeImpact(candidate, 'FAILURE'),
      behaviors: candidate.behaviors,
      warningSigns: this.inferWarningSigns(candidate),
      mitigationStrategies: this.inferMitigationStrategies(candidate),
      sourceJourneys: candidate.sourceJourneys,
      positiveDeviations: [], // Populated by validation
      relatedPatterns: [],
    };
  }

  // ============================================================================
  // PRIVATE CATEGORIZATION
  // ============================================================================

  private categorizeSuccess(success: CareerSuccess): SuccessCategory {
    const description = success.description.toLowerCase();
    const factors = success.contributingFactors.map(f => f.toLowerCase());

    if (factors.some(f => f.includes('promotion') || f.includes('advance'))) return 'CAREER_ADVANCEMENT';
    if (factors.some(f => f.includes('skill') || f.includes('learn'))) return 'SKILL_MASTERY';
    if (factors.some(f => f.includes('startup') || f.includes('business') || f.includes('found'))) return 'ENTREPRENEURIAL_SUCCESS';
    if (factors.some(f => f.includes('network') || f.includes('connect'))) return 'NETWORK_BUILDING';
    if (factors.some(f => f.includes('balance') || f.includes('life'))) return 'WORK_LIFE_BALANCE';
    if (factors.some(f => f.includes('money') || f.includes('salary') || f.includes('income'))) return 'FINANCIAL_SUCCESS';
    if (factors.some(f => f.includes('impact') || f.includes('help') || f.includes('change'))) return 'IMPACT_ACHIEVEMENT';
    if (description.includes('recover') || description.includes('bounce')) return 'RESILIENCE';
    
    return 'LEARNING';
  }

  private categorizeTurningPoint(tp: TurningPoint): SuccessCategory {
    const event = tp.event.toLowerCase();
    
    if (event.includes('mentor') || event.includes('network')) return 'NETWORK_BUILDING';
    if (event.includes('learn') || event.includes('skill')) return 'SKILL_MASTERY';
    if (event.includes('promotion') || event.includes('role')) return 'CAREER_ADVANCEMENT';
    if (event.includes('startup') || event.includes('business')) return 'ENTREPRENEURIAL_SUCCESS';
    
    return 'LEARNING';
  }

  private categorizeDecision(decision: CareerDecision): SuccessCategory {
    const type = decision.type;
    
    const categoryMap: Record<string, SuccessCategory> = {
      'CAREER_CHANGE': 'CAREER_ADVANCEMENT',
      'EDUCATION_CHOICE': 'SKILL_MASTERY',
      'JOB_ACCEPTANCE': 'CAREER_ADVANCEMENT',
      'SKILL_INVESTMENT': 'SKILL_MASTERY',
      'RELOCATION': 'CAREER_ADVANCEMENT',
      'ENTREPRENEURIAL': 'ENTREPRENEURIAL_SUCCESS',
      'NETWORKING': 'NETWORK_BUILDING',
    };

    return categoryMap[type] || 'LEARNING';
  }

  private categorizeFailure(failure: CareerFailure): FailureCategory {
    const description = failure.description.toLowerCase();
    const type = failure.type.toLowerCase();

    if (type.includes('premature') || type.includes('early')) return 'PREMATURE_EXIT';
    if (type.includes('skill') || type.includes('knowledge')) return 'SKILL_GAP';
    if (type.includes('network') || type.includes('relationship')) return 'NETWORK_FAILURE';
    if (type.includes('timing') || type.includes('early') || type.includes('late')) return 'TIMING_MISTAKE';
    if (type.includes('validation') || type.includes('market')) return 'VALIDATION_FAILURE';
    if (type.includes('execution') || type.includes('delivery')) return 'EXECUTION_FAILURE';
    if (type.includes('strategy') || type.includes('plan')) return 'STRATEGIC_ERROR';
    if (type.includes('burnout') || type.includes('health')) return 'BURNOUT';
    
    return 'OPPORTUNITY_COST';
  }

  private categorizeRegret(regret: CareerRegret): FailureCategory {
    const type = regret.type;

    const categoryMap: Record<string, FailureCategory> = {
      'ACTION_NOT_TAKEN': 'DELAYED_DECISION',
      'ACTION_TAKEN': 'PREMATURE_DECISION',
      'TIMING': 'TIMING_MISTAKE',
      'SKILL_NOT_DEVELOPED': 'SKILL_GAP',
      'OPPORTUNITY_MISSED': 'OPPORTUNITY_COST',
    };

    return categoryMap[type] || 'STRATEGIC_ERROR';
  }

  // ============================================================================
  // PRIVATE UTILITY METHODS
  // ============================================================================

  private calculateFrequency(count: number, total: number): PatternFrequency {
    const percentage = count / total;
    
    let classification: PatternFrequency['classification'];
    if (percentage >= 0.5) classification = 'UNIVERSAL';
    else if (percentage >= 0.3) classification = 'VERY_COMMON';
    else if (percentage >= 0.15) classification = 'COMMON';
    else if (percentage >= 0.05) classification = 'UNCOMMON';
    else classification = 'RARE';

    return {
      count,
      total,
      percentage,
      classification,
    };
  }

  private calculatePatternConfidence(
    candidate: PatternCandidate,
    allJourneys: CareerJourney[],
    type: 'SUCCESS' | 'FAILURE'
  ): ConfidenceLevel {
    const baseConfidence = candidate.sourceJourneys.length / allJourneys.length;
    
    // Adjust based on evidence diversity
    const uniqueJourneys = new Set(candidate.sourceJourneys).size;
    const diversityFactor = Math.min(uniqueJourneys / 3, 1); // Max bonus at 3+ unique journeys
    
    return Math.min(baseConfidence * (0.8 + diversityFactor * 0.2), 1) as ConfidenceLevel;
  }

  private inferOutcomeImpact(
    candidate: PatternCandidate,
    type: 'SUCCESS' | 'FAILURE'
  ): OutcomeImpact {
    const magnitude: ImpactLevel = candidate.sourceJourneys.length >= 5 ? 'MAJOR' : 'MODERATE';
    const direction = type === 'SUCCESS' ? 'STRONGLY_POSITIVE' : 'STRONGLY_NEGATIVE';
    
    return {
      magnitude,
      direction,
      timeframe: 'MEDIUM_TERM',
      confidence: 0.7,
    };
  }

  private inferEnablingConditions(candidate: PatternCandidate): string[] {
    return [
      'Sufficient preparation',
      'Supportive environment',
      'Adequate resources',
    ];
  }

  private inferBlockingConditions(candidate: PatternCandidate): string[] {
    return [
      'Resource constraints',
      'Time pressure',
      'Lack of support',
    ];
  }

  private inferWarningSigns(candidate: PatternCandidate): string[] {
    return [
      'Rushing into decisions',
      'Ignoring feedback',
      'Overconfidence',
    ];
  }

  private inferMitigationStrategies(candidate: PatternCandidate): string[] {
    return [
      'Seek mentorship',
      'Validate assumptions',
      'Build gradually',
    ];
  }

  private journeyShowsPattern(journey: CareerJourney, pattern: string): boolean {
    const normalizedPattern = this.normalizePattern(pattern);
    
    // Check in various journey components
    const texts = [
      ...journey.successes.map(s => s.description),
      ...journey.failures.map(f => f.description),
      ...journey.lessons.map(l => l.lesson),
      ...journey.majorDecisions.map(d => d.decision),
    ];
    
    return texts.some(t => this.normalizePattern(t).includes(normalizedPattern));
  }

  private extractAllPatternStrings(journeys: CareerJourney[]): Map<string, number> {
    const patterns = new Map<string, number>();
    
    for (const journey of journeys) {
      for (const success of journey.successes) {
        for (const factor of success.contributingFactors) {
          const key = this.normalizePattern(factor);
          patterns.set(key, (patterns.get(key) || 0) + 1);
        }
      }
    }
    
    return patterns;
  }

  private findMostCommonCategory(patterns: SuccessPattern[]): SuccessCategory {
    if (patterns.length === 0) return 'LEARNING';
    
    const counts = new Map<SuccessCategory, number>();
    for (const pattern of patterns) {
      counts.set(pattern.category, (counts.get(pattern.category) || 0) + 1);
    }
    
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0][0];
  }

  private findMostCommonFailureCategory(patterns: FailurePattern[]): FailureCategory {
    if (patterns.length === 0) return 'STRATEGIC_ERROR';
    
    const counts = new Map<FailureCategory, number>();
    for (const pattern of patterns) {
      counts.set(pattern.category, (counts.get(pattern.category) || 0) + 1);
    }
    
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0][0];
  }

  private isSuccessCategory(category: string): category is SuccessCategory {
    const successCategories: SuccessCategory[] = [
      'CAREER_ADVANCEMENT', 'SKILL_MASTERY', 'ENTREPRENEURIAL_SUCCESS',
      'WORK_LIFE_BALANCE', 'FINANCIAL_SUCCESS', 'IMPACT_ACHIEVEMENT',
      'NETWORK_BUILDING', 'RESILIENCE', 'LEARNING', 'TRANSITION_SUCCESS',
    ];
    return successCategories.includes(category as SuccessCategory);
  }

  private generatePatternId(): PatternId {
    return `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as PatternId;
  }
}
