/**
 * Lesson Engine
 *
 * Extracts and generates the most valuable lessons from career journeys.
 * Identifies common advice, surprising insights, and actionable wisdom.
 *
 * @module LessonEngine
 */

import {
  CareerJourney,
  JourneyId,
  LessonLearned,
  CareerSuccess,
  CareerFailure,
  CareerRegret,
  CareerDecision,
  ImportanceLevel,
} from '../career-journeys/career-journey-types';

import {
  ExtractedLesson,
  LessonId,
  LessonCategory,
  LessonType,
  LessonEvidence,
  LessonApplicability,
  ConfidenceLevel,
  CareerStage,
  ExtractionConfig,
  DEFAULT_EXTRACTION_CONFIG,
} from './mentor-intelligence-types';

/**
 * Lesson Engine
 *
 * Extracts lessons from career journeys and generates
 * actionable advice for students.
 */
export class LessonEngine {
  private config: ExtractionConfig;

  constructor(config: Partial<ExtractionConfig> = {}) {
    this.config = { ...DEFAULT_EXTRACTION_CONFIG, ...config };
  }

  /**
   * Extract all lessons from a set of journeys
   */
  extractLessons(
    journeys: CareerJourney[],
    options: {
      minFrequency?: number;
      maxLessons?: number;
      categories?: LessonCategory[];
    } = {}
  ): {
    lessons: ExtractedLesson[];
    mostValuable: ExtractedLesson[];
    mostCommon: ExtractedLesson[];
    mostSurprising: ExtractedLesson[];
    byCategory: Record<LessonCategory, ExtractedLesson[]>;
    statistics: {
      totalExtracted: number;
      uniqueLessons: number;
      averageConfidence: number;
      topCategory: LessonCategory;
    };
  } {
    const allLessons: ExtractedLesson[] = [];

    // Extract from explicit lessons
    for (const journey of journeys) {
      for (const lesson of journey.lessons) {
        const extracted = this.extractFromLesson(lesson, journey);
        if (extracted) allLessons.push(extracted);
      }
    }

    // Extract from successes
    for (const journey of journeys) {
      for (const success of journey.successes) {
        const extracted = this.extractFromSuccess(success, journey);
        if (extracted) allLessons.push(extracted);
      }
    }

    // Extract from failures
    for (const journey of journeys) {
      for (const failure of journey.failures) {
        const extracted = this.extractFromFailure(failure, journey);
        if (extracted) allLessons.push(extracted);
      }
    }

    // Extract from regrets
    for (const journey of journeys) {
      for (const regret of journey.regrets) {
        const extracted = this.extractFromRegret(regret, journey);
        if (extracted) allLessons.push(extracted);
      }
    }

    // Consolidate similar lessons
    const consolidated = this.consolidateLessons(allLessons);

    // Filter by frequency
    const minFreq = options.minFrequency || this.config.minPatternFrequency;
    const filtered = consolidated.filter(l => l.frequency.count >= minFreq);

    // Sort by importance and confidence
    const sorted = this.sortLessonsByValue(filtered);

    // Limit results
    const maxResults = options.maxLessons || this.config.maxInsights;
    const limited = sorted.slice(0, maxResults);

    // Categorize
    const byCategory = this.categorizeLessons(limited);

    // Identify special categories
    const mostValuable = this.identifyMostValuable(limited);
    const mostCommon = this.identifyMostCommon(limited);
    const mostSurprising = this.identifyMostSurprising(limited);

    // Calculate statistics
    const statistics = this.calculateStatistics(limited, allLessons);

    return {
      lessons: limited,
      mostValuable,
      mostCommon,
      mostSurprising,
      byCategory,
      statistics,
    };
  }

  /**
   * Generate lessons for a specific student context
   */
  generateContextualLessons(
    journeys: CareerJourney[],
    context: {
      careerStage: CareerStage;
      archetype?: string;
      currentChallenge?: string;
      upcomingDecision?: string;
    }
  ): {
    relevantLessons: ExtractedLesson[];
    prioritizedLessons: ExtractedLesson[];
    immediateActions: string[];
    warnings: string[];
  } {
    const allLessons = this.extractLessons(journeys, { maxLessons: 100 });

    // Score relevance to context
    const scoredLessons = allLessons.lessons.map(lesson => ({
      lesson,
      relevanceScore: this.calculateContextualRelevance(lesson, context),
    }));

    // Sort by relevance
    scoredLessons.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Get relevant lessons
    const relevantLessons = scoredLessons
      .filter(s => s.relevanceScore > 0.5)
      .map(s => s.lesson);

    // Prioritize based on importance and relevance
    const prioritizedLessons = scoredLessons
      .slice(0, 10)
      .map(s => s.lesson);

    // Generate immediate actions
    const immediateActions = this.generateImmediateActions(prioritizedLessons, context);

    // Generate warnings
    const warnings = this.generateWarnings(prioritizedLessons, context);

    return {
      relevantLessons,
      prioritizedLessons,
      immediateActions,
      warnings,
    };
  }

  /**
   * Find lessons that contradict common wisdom
   */
  findContrarianLessons(
    journeys: CareerJourney[],
    commonBeliefs: string[]
  ): ExtractedLesson[] {
    const allLessons = this.extractLessons(journeys, { maxLessons: 200 });

    return allLessons.lessons.filter(lesson => {
      // Check if lesson contradicts common beliefs
      return commonBeliefs.some(belief =>
        this.lessonContradictsBelief(lesson.lesson, belief)
      );
    });
  }

  /**
   * Compare lessons across different journey groups
   */
  compareLessonsAcrossGroups(
    groupA: CareerJourney[],
    groupB: CareerJourney[],
    groupAName: string = 'Group A',
    groupBName: string = 'Group B'
  ): {
    uniqueToA: ExtractedLesson[];
    uniqueToB: ExtractedLesson[];
    common: ExtractedLesson[];
    emphasizedByA: ExtractedLesson[];
    emphasizedByB: ExtractedLesson[];
    analysis: string;
  } {
    const lessonsA = this.extractLessons(groupA, { maxLessons: 100 });
    const lessonsB = this.extractLessons(groupB, { maxLessons: 100 });

    // Find unique and common lessons
    const uniqueToA = lessonsA.lessons.filter(la =>
      !lessonsB.lessons.some(lb => this.lessonsAreSimilar(la, lb))
    );

    const uniqueToB = lessonsB.lessons.filter(lb =>
      !lessonsA.lessons.some(la => this.lessonsAreSimilar(la, lb))
    );

    const common = lessonsA.lessons.filter(la =>
      lessonsB.lessons.some(lb => this.lessonsAreSimilar(la, lb))
    );

    // Find emphasized lessons (higher frequency in one group)
    const emphasizedByA: ExtractedLesson[] = [];
    const emphasizedByB: ExtractedLesson[] = [];

    for (const lesson of common) {
      const freqA = lesson.frequency.percentage;
      const matchingB = lessonsB.lessons.find(lb => this.lessonsAreSimilar(lesson, lb));
      const freqB = matchingB?.frequency.percentage || 0;

      if (freqA > freqB * 1.5) {
        emphasizedByA.push(lesson);
      } else if (freqB > freqA * 1.5) {
        emphasizedByB.push(lesson);
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
      emphasizedByA,
      emphasizedByB,
      analysis,
    };
  }

  /**
   * Validate a lesson against evidence
   */
  validateLesson(
    lesson: ExtractedLesson,
    journeys: CareerJourney[]
  ): {
    validated: boolean;
    supportingEvidence: number;
    contradictingEvidence: number;
    confidence: ConfidenceLevel;
    analysis: string;
  } {
    let supporting = 0;
    let contradicting = 0;

    for (const journey of journeys) {
      const applies = this.lessonAppliesToJourney(lesson, journey);
      const outcome = this.getJourneyOutcome(journey);

      if (applies) {
        if (outcome === 'SUCCESS' && lesson.type === 'ACTION_TO_TAKE') {
          supporting++;
        } else if (outcome === 'FAILURE' && lesson.type === 'ACTION_TO_AVOID') {
          supporting++;
        } else if (outcome === 'FAILURE' && lesson.type === 'ACTION_TO_TAKE') {
          contradicting++;
        } else if (outcome === 'SUCCESS' && lesson.type === 'ACTION_TO_AVOID') {
          contradicting++;
        }
      }
    }

    const total = supporting + contradicting;
    const confidence = total > 0 ? supporting / total : 0.5;
    const validated = confidence >= this.config.minConfidenceThreshold;

    return {
      validated,
      supportingEvidence: supporting,
      contradictingEvidence: contradicting,
      confidence: confidence as ConfidenceLevel,
      analysis: `Lesson supported by ${supporting} journeys, contradicted by ${contradicting}. Validation: ${validated ? 'PASSED' : 'FAILED'}.`,
    };
  }

  // ============================================================================
  // PRIVATE EXTRACTION METHODS
  // ============================================================================

  private extractFromLesson(
    lesson: LessonLearned,
    journey: CareerJourney
  ): ExtractedLesson | null {
    const category = this.categorizeLesson(lesson);
    const type = this.classifyLessonType(lesson);

    return {
      id: this.generateLessonId(),
      lesson: lesson.lesson,
      category,
      type,
      frequency: {
        count: 1,
        total: 1,
        percentage: 1,
        classification: 'RARE',
      },
      confidence: this.calculateLessonConfidence(lesson),
      importance: lesson.importance,
      evidence: [{
        journeyId: journey.id,
        situation: lesson.learnedFrom,
        action: lesson.lesson,
        outcome: 'Documented lesson',
        relevance: 1,
      }],
      applicability: {
        careerStages: [this.inferCareerStage(journey)],
        situations: [lesson.learnedFrom],
        prerequisites: [],
        minSimilarityScore: 0.5,
      },
      relatedLessons: [],
      sourceJourneys: [journey.id],
      extractedAt: new Date(),
    };
  }

  private extractFromSuccess(
    success: CareerSuccess,
    journey: CareerJourney
  ): ExtractedLesson | null {
    const lesson = this.inferLessonFromSuccess(success);
    if (!lesson) return null;

    return {
      id: this.generateLessonId(),
      lesson,
      category: 'EARLY_CAREER',
      type: 'ACTION_TO_TAKE',
      frequency: {
        count: 1,
        total: 1,
        percentage: 1,
        classification: 'RARE',
      },
      confidence: 0.8,
      importance: 'HIGH',
      evidence: [{
        journeyId: journey.id,
        situation: success.description,
        action: success.contributingFactors.join(', '),
        outcome: 'Success',
        relevance: 0.9,
      }],
      applicability: {
        careerStages: [this.inferCareerStage(journey)],
        situations: [success.description],
        prerequisites: success.contributingFactors,
        minSimilarityScore: 0.6,
      },
      relatedLessons: [],
      sourceJourneys: [journey.id],
      extractedAt: new Date(),
    };
  }

  private extractFromFailure(
    failure: CareerFailure,
    journey: CareerJourney
  ): ExtractedLesson | null {
    const lesson = this.inferLessonFromFailure(failure);
    if (!lesson) return null;

    return {
      id: this.generateLessonId(),
      lesson,
      category: 'RISK_MANAGEMENT',
      type: 'ACTION_TO_AVOID',
      frequency: {
        count: 1,
        total: 1,
        percentage: 1,
        classification: 'RARE',
      },
      confidence: 0.85,
      importance: failure.impact === 'MAJOR' || failure.impact === 'TRANSFORMATIONAL' ? 'CRITICAL' : 'HIGH',
      evidence: [{
        journeyId: journey.id,
        situation: failure.description,
        action: 'Avoidance',
        outcome: `Failure: ${failure.longTermImpact}`,
        relevance: 0.95,
      }],
      applicability: {
        careerStages: [this.inferCareerStage(journey)],
        situations: [failure.description],
        prerequisites: [],
        minSimilarityScore: 0.5,
      },
      relatedLessons: [],
      sourceJourneys: [journey.id],
      extractedAt: new Date(),
    };
  }

  private extractFromRegret(
    regret: CareerRegret,
    journey: CareerJourney
  ): ExtractedLesson | null {
    const lesson = this.inferLessonFromRegret(regret);
    if (!lesson) return null;

    return {
      id: this.generateLessonId(),
      lesson,
      category: 'DECISION_MAKING',
      type: 'ACTION_TO_TAKE',
      frequency: {
        count: 1,
        total: 1,
        percentage: 1,
        classification: 'RARE',
      },
      confidence: 0.75,
      importance: regret.intensity === 'SEVERE' ? 'CRITICAL' : 'HIGH',
      evidence: [{
        journeyId: journey.id,
        situation: regret.whatWasDone,
        action: regret.whatShouldHaveBeenDone,
        outcome: 'Regret',
        relevance: 0.9,
      }],
      applicability: {
        careerStages: [this.inferCareerStage(journey)],
        situations: [regret.whatWasDone],
        prerequisites: [],
        minSimilarityScore: 0.5,
      },
      relatedLessons: [],
      sourceJourneys: [journey.id],
      extractedAt: new Date(),
    };
  }

  // ============================================================================
  // PRIVATE CONSOLIDATION METHODS
  // ============================================================================

  private consolidateLessons(lessons: ExtractedLesson[]): ExtractedLesson[] {
    const groups = new Map<string, ExtractedLesson[]>();

    // Group similar lessons
    for (const lesson of lessons) {
      const key = this.normalizeLesson(lesson.lesson);

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(lesson);
    }

    // Merge groups
    const consolidated: ExtractedLesson[] = [];

    for (const [_, group] of groups) {
      if (group.length === 1) {
        consolidated.push(group[0]);
      } else {
        consolidated.push(this.mergeLessonGroup(group));
      }
    }

    return consolidated;
  }

  private mergeLessonGroup(group: ExtractedLesson[]): ExtractedLesson {
    const representative = group[0];

    // Merge evidence
    const allEvidence = group.flatMap(l => l.evidence);

    // Merge source journeys
    const allJourneys = [...new Set(group.flatMap(l => l.sourceJourneys))];

    // Calculate combined frequency
    const frequency = {
      count: allJourneys.length,
      total: group[0].frequency.total,
      percentage: allJourneys.length / group[0].frequency.total,
      classification: this.classifyFrequency(allJourneys.length, group[0].frequency.total),
    };

    // Calculate average confidence
    const avgConfidence = group.reduce((sum, l) => sum + l.confidence, 0) / group.length;

    return {
      ...representative,
      frequency,
      confidence: avgConfidence as ConfidenceLevel,
      evidence: allEvidence,
      sourceJourneys: allJourneys,
    };
  }

  private sortLessonsByValue(lessons: ExtractedLesson[]): ExtractedLesson[] {
    return [...lessons].sort((a, b) => {
      // Score based on importance, confidence, and frequency
      const scoreA = this.calculateLessonValueScore(a);
      const scoreB = this.calculateLessonValueScore(b);
      return scoreB - scoreA;
    });
  }

  private categorizeLessons(
    lessons: ExtractedLesson[]
  ): Record<LessonCategory, ExtractedLesson[]> {
    const byCategory: Partial<Record<LessonCategory, ExtractedLesson[]>> = {};

    for (const lesson of lessons) {
      if (!byCategory[lesson.category]) {
        byCategory[lesson.category] = [];
      }
      byCategory[lesson.category]!.push(lesson);
    }

    return byCategory as Record<LessonCategory, ExtractedLesson[]>;
  }

  // ============================================================================
  // PRIVATE IDENTIFICATION METHODS
  // ============================================================================

  private identifyMostValuable(lessons: ExtractedLesson[]): ExtractedLesson[] {
    return lessons
      .filter(l => l.importance === 'CRITICAL' || l.importance === 'HIGH')
      .filter(l => l.confidence >= 0.7)
      .slice(0, 5);
  }

  private identifyMostCommon(lessons: ExtractedLesson[]): ExtractedLesson[] {
    return lessons
      .filter(l => l.frequency.classification === 'COMMON' || l.frequency.classification === 'VERY_COMMON')
      .slice(0, 5);
  }

  private identifyMostSurprising(lessons: ExtractedLesson[]): ExtractedLesson[] {
    // Lessons with high importance but lower frequency (unexpected insights)
    return lessons
      .filter(l => l.importance === 'HIGH' || l.importance === 'CRITICAL')
      .filter(l => l.frequency.classification === 'UNCOMMON' || l.frequency.classification === 'RARE')
      .slice(0, 5);
  }

  // ============================================================================
  // PRIVATE UTILITY METHODS
  // ============================================================================

  private categorizeLesson(lesson: LessonLearned): LessonCategory {
    const text = lesson.lesson.toLowerCase();
    const context = lesson.learnedFrom.toLowerCase();

    if (text.includes('skill') || text.includes('learn') || text.includes('study')) {
      return 'SKILL_DEVELOPMENT';
    }
    if (text.includes('network') || text.includes('connect') || text.includes('people')) {
      return 'NETWORKING';
    }
    if (text.includes('decision') || text.includes('choose') || text.includes('choice')) {
      return 'DECISION_MAKING';
    }
    if (text.includes('risk') || text.includes('safe') || text.includes('caution')) {
      return 'RISK_MANAGEMENT';
    }
    if (text.includes('time') || text.includes('when') || text.includes('wait')) {
      return 'TIMING';
    }
    if (text.includes('mindset') || text.includes('attitude') || text.includes('think')) {
      return 'MINDSET';
    }
    if (text.includes('startup') || text.includes('business') || text.includes('found')) {
      return 'ENTREPRENEURSHIP';
    }
    if (text.includes('change') || text.includes('transition') || text.includes('move')) {
      return 'TRANSITION';
    }

    return 'EARLY_CAREER';
  }

  private classifyLessonType(lesson: LessonLearned): LessonType {
    const text = lesson.lesson.toLowerCase();

    if (text.includes('avoid') || text.includes('don\'t') || text.includes('never')) {
      return 'ACTION_TO_AVOID';
    }
    if (text.includes('should') || text.includes('must') || text.includes('always')) {
      return 'ACTION_TO_TAKE';
    }
    if (text.includes('think') || text.includes('believe') || text.includes('mindset')) {
      return 'MINDSET_SHIFT';
    }
    if (text.includes('strategy') || text.includes('approach') || text.includes('plan')) {
      return 'STRATEGY_INSIGHT';
    }

    return 'ACTION_TO_TAKE';
  }

  private calculateLessonConfidence(lesson: LessonLearned): ConfidenceLevel {
    let confidence = 0.7;

    // Higher confidence for critical lessons
    if (lesson.importance === 'CRITICAL') confidence += 0.1;

    // Higher confidence for lessons with context
    if (lesson.learnedFrom && lesson.learnedFrom.length > 10) confidence += 0.1;

    return Math.min(confidence, 1) as ConfidenceLevel;
  }

  private inferLessonFromSuccess(success: CareerSuccess): string | null {
    if (success.contributingFactors.length > 0) {
      return `Success comes from: ${success.contributingFactors.join(', ')}`;
    }
    return null;
  }

  private inferLessonFromFailure(failure: CareerFailure): string | null {
    if (failure.lessonsLearned.length > 0) {
      return failure.lessonsLearned[0];
    }
    return `Avoid: ${failure.description}`;
  }

  private inferLessonFromRegret(regret: CareerRegret): string | null {
    return `Instead of "${regret.whatWasDone}", consider "${regret.whatShouldHaveBeenDone}"`;
  }

  private inferCareerStage(journey: CareerJourney): CareerStage {
    const years = journey.careerHistory.reduce((sum, p) => sum + p.durationMonths, 0) / 12;

    if (years < 2) return 'EARLY_CAREER';
    if (years < 5) return 'MID_CAREER';
    return 'SENIOR';
  }

  private normalizeLesson(lesson: string): string {
    return lesson.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 100);
  }

  private classifyFrequency(count: number, total: number): 'RARE' | 'UNCOMMON' | 'COMMON' | 'VERY_COMMON' | 'UNIVERSAL' {
    const percentage = count / total;

    if (percentage >= 0.5) return 'UNIVERSAL';
    if (percentage >= 0.3) return 'VERY_COMMON';
    if (percentage >= 0.15) return 'COMMON';
    if (percentage >= 0.05) return 'UNCOMMON';
    return 'RARE';
  }

  private calculateLessonValueScore(lesson: ExtractedLesson): number {
    const importanceScores: Record<ImportanceLevel, number> = {
      'CRITICAL': 4,
      'HIGH': 3,
      'MODERATE': 2,
      'LOW': 1,
    };

    const frequencyScores: Record<string, number> = {
      'UNIVERSAL': 4,
      'VERY_COMMON': 3,
      'COMMON': 2,
      'UNCOMMON': 1,
      'RARE': 0.5,
    };

    return (
      importanceScores[lesson.importance] * 0.4 +
      lesson.confidence * 0.3 +
      frequencyScores[lesson.frequency.classification] * 0.3
    );
  }

  private calculateContextualRelevance(
    lesson: ExtractedLesson,
    context: {
      careerStage: CareerStage;
      archetype?: string;
      currentChallenge?: string;
      upcomingDecision?: string;
    }
  ): number {
    let score = 0;

    // Career stage match
    if (lesson.applicability.careerStages.includes(context.careerStage)) {
      score += 0.3;
    }

    // Challenge match
    if (context.currentChallenge) {
      const challengeLower = context.currentChallenge.toLowerCase();
      if (lesson.applicability.situations.some(s =>
        s.toLowerCase().includes(challengeLower) ||
        challengeLower.includes(s.toLowerCase())
      )) {
        score += 0.4;
      }
    }

    // Decision match
    if (context.upcomingDecision) {
      const decisionLower = context.upcomingDecision.toLowerCase();
      if (lesson.lesson.toLowerCase().includes(decisionLower)) {
        score += 0.3;
      }
    }

    return score;
  }

  private generateImmediateActions(
    lessons: ExtractedLesson[],
    context: { careerStage: CareerStage; currentChallenge?: string }
  ): string[] {
    return lessons
      .filter(l => l.type === 'ACTION_TO_TAKE')
      .slice(0, 3)
      .map(l => l.lesson);
  }

  private generateWarnings(
    lessons: ExtractedLesson[],
    context: { careerStage: CareerStage; currentChallenge?: string }
  ): string[] {
    return lessons
      .filter(l => l.type === 'ACTION_TO_AVOID')
      .slice(0, 3)
      .map(l => l.lesson);
  }

  private lessonsAreSimilar(a: ExtractedLesson, b: ExtractedLesson): boolean {
    const normalizedA = this.normalizeLesson(a.lesson);
    const normalizedB = this.normalizeLesson(b.lesson);

    // Simple similarity check
    return normalizedA === normalizedB ||
           normalizedA.includes(normalizedB.substring(0, 50)) ||
           normalizedB.includes(normalizedA.substring(0, 50));
  }

  private lessonContradictsBelief(lesson: string, belief: string): boolean {
    const lessonLower = lesson.toLowerCase();
    const beliefLower = belief.toLowerCase();

    // Check for direct contradiction
    return (
      (lessonLower.includes('do') && beliefLower.includes('don\'t')) ||
      (lessonLower.includes('avoid') && beliefLower.includes('should'))
    ) && (
      lessonLower.includes(beliefLower.substring(0, 20)) ||
      beliefLower.includes(lessonLower.substring(0, 20))
    );
  }

  private lessonAppliesToJourney(lesson: ExtractedLesson, journey: CareerJourney): boolean {
    // Check if journey context matches lesson applicability
    return lesson.sourceJourneys.includes(journey.id) ||
           lesson.applicability.careerStages.includes(this.inferCareerStage(journey));
  }

  private getJourneyOutcome(journey: CareerJourney): 'SUCCESS' | 'FAILURE' | 'MIXED' {
    const successCount = journey.successes.length;
    const failureCount = journey.failures.length;

    if (successCount > failureCount * 2) return 'SUCCESS';
    if (failureCount > successCount * 2) return 'FAILURE';
    return 'MIXED';
  }

  private generateComparisonAnalysis(
    uniqueToA: ExtractedLesson[],
    uniqueToB: ExtractedLesson[],
    common: ExtractedLesson[],
    groupAName: string,
    groupBName: string
  ): string {
    return `${groupAName} has ${uniqueToA.length} unique lessons, ${groupBName} has ${uniqueToB.length} unique lessons, and ${common.length} lessons are shared between both groups.`;
  }

  private calculateStatistics(
    consolidated: ExtractedLesson[],
    allLessons: ExtractedLesson[]
  ): {
    totalExtracted: number;
    uniqueLessons: number;
    averageConfidence: number;
    topCategory: LessonCategory;
  } {
    const avgConfidence = consolidated.length > 0
      ? consolidated.reduce((sum, l) => sum + l.confidence, 0) / consolidated.length
      : 0;

    // Find top category
    const categoryCounts = new Map<LessonCategory, number>();
    for (const lesson of consolidated) {
      categoryCounts.set(lesson.category, (categoryCounts.get(lesson.category) || 0) + 1);
    }

    const topCategory = Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'EARLY_CAREER';

    return {
      totalExtracted: allLessons.length,
      uniqueLessons: consolidated.length,
      averageConfidence: avgConfidence,
      topCategory,
    };
  }

  private generateLessonId(): LessonId {
    return `lesson_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as LessonId;
  }
}
