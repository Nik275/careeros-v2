/**
 * Mentor Intelligence Engine
 *
 * Main orchestration engine for Phase 8.3 Mentor Intelligence.
 * Coordinates pattern extraction, lesson generation, mistake analysis,
 * and decision outcome tracking to extract wisdom from career journeys.
 *
 * Core Question: "What works, what fails, and what can I learn?"
 *
 * @module MentorIntelligenceEngine
 */

import {
  CareerJourney,
  JourneyId,
} from '../career-journeys/career-journey-types';

import {
  JourneySimilarityResult,
  StudentProfileSnapshot,
} from '../career-journeys/similarity/journey-similarity-types';

import {
  MentorInsight,
  MentorInsightId,
  SuccessPattern,
  FailurePattern,
  PatternId,
  DecisionOutcome,
  DecisionOutcomeId,
  ExtractedLesson,
  LessonId,
  MistakeAnalysis,
  MistakeId,
  MentorIntelligenceReport,
  MentorIntelligenceStatistics,
  PersonalizedRecommendation,
  ExtractIntelligenceInput,
  GenerateAdviceInput,
  InsightExplanation,
  ContextualExplanation,
  ExtractionConfig,
  DEFAULT_EXTRACTION_CONFIG,
  InsightType,
  SuccessCategory,
  FailureCategory,
  LessonCategory,
  MistakeCategory,
  DecisionType,
  CareerStage,
  ConfidenceLevel,
} from './mentor-intelligence-types';

import { PatternExtractionEngine } from './pattern-extraction-engine';
import { LessonEngine } from './lesson-engine';
import { MistakeEngine } from './mistake-engine';
import { DecisionOutcomeEngine } from './decision-outcome-engine';

/**
 * Configuration for Mentor Intelligence Engine
 */
export interface MentorIntelligenceEngineConfig {
  extraction: ExtractionConfig;
  enablePatternExtraction: boolean;
  enableLessonExtraction: boolean;
  enableMistakeAnalysis: boolean;
  enableDecisionAnalysis: boolean;
  enablePersonalization: boolean;
  maxInsightsPerCategory: number;
  minConfidenceForInclusion: number;
}

/**
 * Default configuration
 */
export const DEFAULT_MENTOR_INTELLIGENCE_CONFIG: MentorIntelligenceEngineConfig = {
  extraction: DEFAULT_EXTRACTION_CONFIG,
  enablePatternExtraction: true,
  enableLessonExtraction: true,
  enableMistakeAnalysis: true,
  enableDecisionAnalysis: true,
  enablePersonalization: true,
  maxInsightsPerCategory: 10,
  minConfidenceForInclusion: 0.6,
};

/**
 * Validation result for input
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Query for extracting intelligence
 */
export interface IntelligenceQuery {
  journeys: CareerJourney[];
  similarJourneys?: JourneySimilarityResult[];
  studentProfile?: StudentProfileSnapshot;
  focusAreas?: Array<
    | 'SUCCESS_PATTERNS'
    | 'FAILURE_PATTERNS'
    | 'LESSONS'
    | 'MISTAKES'
    | 'DECISIONS'
    | 'TIMING'
    | 'SKILLS'
    | 'NETWORKING'
    | 'MINDSET'
    | 'ALL'
  >;
  specificQuestions?: string[];
  maxInsights?: number;
  minConfidence?: number;
}

/**
 * Mentor Intelligence Engine
 *
 * The main entry point for extracting wisdom from career journeys.
 * Analyzes what works, what fails, common mistakes, and decision outcomes.
 */
export class MentorIntelligenceEngine {
  private patternEngine: PatternExtractionEngine;
  private lessonEngine: LessonEngine;
  private mistakeEngine: MistakeEngine;
  private decisionEngine: DecisionOutcomeEngine;
  private config: MentorIntelligenceEngineConfig;

  constructor(config: Partial<MentorIntelligenceEngineConfig> = {}) {
    this.config = { ...DEFAULT_MENTOR_INTELLIGENCE_CONFIG, ...config };
    this.patternEngine = new PatternExtractionEngine(this.config.extraction);
    this.lessonEngine = new LessonEngine(this.config.extraction);
    this.mistakeEngine = new MistakeEngine(this.config.extraction);
    this.decisionEngine = new DecisionOutcomeEngine(this.config.extraction);
  }

  // ============================================================================
  // CORE API
  // ============================================================================

  /**
   * Extract comprehensive intelligence from career journeys
   *
   * Primary entry point. Given a set of journeys (optionally filtered by
   * similarity), extracts all forms of mentor intelligence.
   *
   * @param query - Query specifying journeys and focus areas
   * @returns Complete mentor intelligence report
   */
  async extractIntelligence(query: IntelligenceQuery): Promise<MentorIntelligenceReport> {
    // Validate input
    const validation = this.validateQuery(query);
    if (!validation.valid) {
      throw new Error(`Invalid query: ${validation.errors.join(', ')}`);
    }

    const journeys = query.similarJourneys
      ? query.similarJourneys.map(r => r.journey)
      : query.journeys;

    const focusAreas = query.focusAreas || ['ALL'];
    const maxInsights = query.maxInsights || this.config.maxInsightsPerCategory;
    const minConfidence = query.minConfidence || this.config.minConfidenceForInclusion;

    // Parallel extraction of all intelligence types
    const [
      patternResults,
      lessonResults,
      mistakeResults,
      decisionResults,
    ] = await Promise.all([
      this.extractPatterns(journeys, focusAreas, maxInsights, minConfidence),
      this.extractLessons(journeys, focusAreas, maxInsights, minConfidence),
      this.analyzeMistakes(journeys, focusAreas, maxInsights, minConfidence),
      this.analyzeDecisions(journeys, focusAreas, maxInsights, minConfidence),
    ]);

    // Generate key insights from all sources
    const keyInsights = this.synthesizeKeyInsights(
      patternResults,
      lessonResults,
      mistakeResults,
      decisionResults
    );

    // Generate personalized recommendations if student profile provided
    const personalizedRecommendations = query.studentProfile && this.config.enablePersonalization
      ? this.generatePersonalizedRecommendations(
          query.studentProfile,
          patternResults,
          lessonResults,
          mistakeResults,
          decisionResults
        )
      : undefined;

    // Calculate statistics
    const statistics = this.calculateStatistics(
      patternResults,
      lessonResults,
      mistakeResults,
      decisionResults,
      journeys
    );

    return {
      id: this.generateReportId(),
      generatedAt: new Date(),
      version: '1.0.0',
      journeysAnalyzed: journeys.length,
      similarJourneys: query.similarJourneys?.map(r => r.journeyId),
      keyInsights,
      successPatterns: patternResults.successPatterns,
      failurePatterns: patternResults.failurePatterns,
      lessons: lessonResults.lessons,
      mistakes: mistakeResults.allMistakes,
      decisionOutcomes: decisionResults.outcomes,
      statistics,
      personalizedRecommendations,
    };
  }

  /**
   * Extract intelligence focused on a specific career stage
   */
  async extractStageSpecificIntelligence(
    journeys: CareerJourney[],
    stage: CareerStage,
    studentProfile?: StudentProfileSnapshot
  ): Promise<{
    stage: CareerStage;
    keyInsights: MentorInsight[];
    criticalLessons: ExtractedLesson[];
    commonMistakes: MistakeAnalysis[];
    recommendedDecisions: DecisionOutcome[];
    warnings: string[];
    opportunities: string[];
  }> {
    // Filter journeys to those relevant to this stage
    const stageRelevantJourneys = this.filterJourneysByStage(journeys, stage);

    // Extract intelligence
    const report = await this.extractIntelligence({
      journeys: stageRelevantJourneys,
      studentProfile,
      focusAreas: ['ALL'],
    });

    // Filter to stage-specific insights
    const stageInsights = report.keyInsights.filter(i =>
      i.applicability.careerStages.includes(stage)
    );

    const stageLessons = report.lessons.filter(l =>
      l.applicability.careerStages.includes(stage)
    );

    const stageMistakes = report.mistakes.filter(m =>
      this.isMistakeRelevantToStage(m, stage)
    );

    const stageDecisions = report.decisionOutcomes.filter(d =>
      d.context.careerStage === stage
    );

    // Generate warnings and opportunities
    const warnings = this.generateStageWarnings(stageMistakes, stage);
    const opportunities = this.generateStageOpportunities(stageInsights, stage);

    return {
      stage,
      keyInsights: stageInsights,
      criticalLessons: stageLessons.slice(0, 5),
      commonMistakes: stageMistakes.slice(0, 5),
      recommendedDecisions: stageDecisions
        .filter(d => d.shortTermOutcome.assessment === 'EXCELLENT' || d.shortTermOutcome.assessment === 'GOOD')
        .slice(0, 5),
      warnings,
      opportunities,
    };
  }

  /**
   * Answer specific questions using extracted intelligence
   */
  async answerQuestions(
    query: IntelligenceQuery,
    questions: string[]
  ): Promise<Array<{
    question: string;
    answer: string;
    confidence: ConfidenceLevel;
    supportingEvidence: Array<{
      type: 'PATTERN' | 'LESSON' | 'MISTAKE' | 'DECISION';
      id: PatternId | LessonId | MistakeId | DecisionOutcomeId;
      description: string;
      relevance: number;
    }>;
    caveats: string[];
  }>> {
    // Extract intelligence
    const report = await this.extractIntelligence(query);

    // Answer each question
    const answers = questions.map(question => {
      const answer = this.generateAnswer(question, report);
      return {
        question,
        ...answer,
      };
    });

    return answers;
  }

  /**
   * Generate actionable advice for a student
   */
  generateAdvice(
    input: {
      studentProfile: {
        archetype: string;
        careerStage: CareerStage;
        currentSituation: string;
        goals: string[];
        constraints: string[];
        upcomingDecisions?: string[];
      };
      similarJourneys: JourneySimilarityResult[];
      specificQuestions?: string[];
    }
  ): {
    immediateActions: string[];
    shortTermRecommendations: string[];
    longTermStrategies: string[];
    warnings: string[];
    decisionGuidance: Array<{
      decision: string;
      recommendation: string;
      confidence: ConfidenceLevel;
      rationale: string;
    }>;
    resourceRecommendations: string[];
  } {
    // Extract intelligence from similar journeys
    const journeys = input.similarJourneys.map(r => r.journey);

    // Get patterns
    const patterns = this.patternEngine.extractPatterns(journeys, 'BOTH');

    // Get lessons
    const lessons = this.lessonEngine.extractLessons(journeys, {
      maxLessons: 50,
    });

    // Get mistakes relevant to context
    const mistakes = this.mistakeEngine.identifyRelevantMistakes(journeys, {
      careerStage: input.studentProfile.careerStage,
      situation: input.studentProfile.currentSituation,
    });

    // Get decision guidance
    const decisionGuidance: Array<{
      decision: string;
      recommendation: string;
      confidence: ConfidenceLevel;
      rationale: string;
    }> = [];

    if (input.studentProfile.upcomingDecisions) {
      for (const decision of input.studentProfile.upcomingDecisions) {
        const guidance = this.generateDecisionGuidance(
          decision,
          input.studentProfile,
          journeys
        );
        decisionGuidance.push(guidance);
      }
    }

    // Generate recommendations by timeframe
    const immediateActions = this.generateImmediateActions(
      patterns,
      lessons,
      mistakes,
      input.studentProfile
    );

    const shortTermRecommendations = this.generateShortTermRecommendations(
      patterns,
      lessons,
      input.studentProfile
    );

    const longTermStrategies = this.generateLongTermStrategies(
      patterns,
      lessons,
      input.studentProfile
    );

    const warnings = mistakes.warnings.slice(0, 5);

    const resourceRecommendations = this.generateResourceRecommendations(
      lessons,
      input.studentProfile
    );

    return {
      immediateActions,
      shortTermRecommendations,
      longTermStrategies,
      warnings,
      decisionGuidance,
      resourceRecommendations,
    };
  }

  /**
   * Compare intelligence across different journey groups
   */
  compareGroups(
    groupA: { journeys: CareerJourney[]; name: string },
    groupB: { journeys: CareerJourney[]; name: string }
  ): {
    comparisonId: string;
    groupAName: string;
    groupBName: string;
    uniqueToA: {
      patterns: SuccessPattern[];
      lessons: ExtractedLesson[];
      mistakes: MistakeAnalysis[];
    };
    uniqueToB: {
      patterns: SuccessPattern[];
      lessons: ExtractedLesson[];
      mistakes: MistakeAnalysis[];
    };
    common: {
      patterns: SuccessPattern[];
      lessons: ExtractedLesson[];
    };
    keyDifferences: string[];
    recommendations: {
      forGroupA: string[];
      forGroupB: string[];
    };
  } {
    // Extract intelligence for both groups
    const patternsA = this.patternEngine.extractPatterns(groupA.journeys, 'BOTH');
    const patternsB = this.patternEngine.extractPatterns(groupB.journeys, 'BOTH');

    const lessonsA = this.lessonEngine.extractLessons(groupA.journeys);
    const lessonsB = this.lessonEngine.extractLessons(groupB.journeys);

    const mistakesA = this.mistakeEngine.analyzeMistakes(groupA.journeys);
    const mistakesB = this.mistakeEngine.analyzeMistakes(groupB.journeys);

    // Find unique and common elements
    const uniquePatternsA = patternsA.successPatterns.filter(pa =>
      !patternsB.successPatterns.some(pb => this.patternsAreSimilar(pa, pb))
    );

    const uniquePatternsB = patternsB.successPatterns.filter(pb =>
      !patternsA.successPatterns.some(pa => this.patternsAreSimilar(pa, pb))
    );

    const uniqueLessonsA = lessonsA.lessons.filter(la =>
      !lessonsB.lessons.some(lb => this.lessonsAreSimilar(la, lb))
    );

    const uniqueLessonsB = lessonsB.lessons.filter(lb =>
      !lessonsA.lessons.some(la => this.lessonsAreSimilar(la, lb))
    );

    const commonLessons = lessonsA.lessons.filter(la =>
      lessonsB.lessons.some(lb => this.lessonsAreSimilar(la, lb))
    );

    // Generate key differences
    const keyDifferences = this.identifyKeyDifferences(
      patternsA,
      patternsB,
      lessonsA,
      lessonsB,
      groupA.name,
      groupB.name
    );

    // Generate recommendations
    const recommendations = {
      forGroupA: this.generateComparativeRecommendations(
        uniquePatternsA,
        uniqueLessonsA,
        mistakesA,
        groupA.name
      ),
      forGroupB: this.generateComparativeRecommendations(
        uniquePatternsB,
        uniqueLessonsB,
        mistakesB,
        groupB.name
      ),
    };

    return {
      comparisonId: this.generateComparisonId(),
      groupAName: groupA.name,
      groupBName: groupB.name,
      uniqueToA: {
        patterns: uniquePatternsA,
        lessons: uniqueLessonsA,
        mistakes: mistakesA.allMistakes.filter(ma =>
          !mistakesB.allMistakes.some(mb => this.mistakesAreSimilar(ma, mb))
        ),
      },
      uniqueToB: {
        patterns: uniquePatternsB,
        lessons: uniqueLessonsB,
        mistakes: mistakesB.allMistakes.filter(mb =>
          !mistakesA.allMistakes.some(ma => this.mistakesAreSimilar(ma, mb))
        ),
      },
      common: {
        patterns: [], // Would need to identify common patterns
        lessons: commonLessons,
      },
      keyDifferences,
      recommendations,
    };
  }

  /**
   * Generate explanations for insights
   */
  explainInsight(
    insight: MentorInsight | SuccessPattern | FailurePattern | ExtractedLesson | MistakeAnalysis | DecisionOutcome,
    studentContext?: StudentProfileSnapshot
  ): InsightExplanation {
    const explanation = this.generateInsightExplanation(insight, studentContext);

    return {
      insightId: 'id' in insight ? insight.id : this.generateInsightId(),
      explanation: explanation.mainExplanation,
      relevance: explanation.relevance,
      application: explanation.application,
      evidenceSummary: explanation.evidence,
      confidenceExplanation: explanation.confidenceExplanation,
      generatedAt: new Date(),
    };
  }

  // ============================================================================
  // PRIVATE EXTRACTION METHODS
  // ============================================================================

  private async extractPatterns(
    journeys: CareerJourney[],
    focusAreas: string[],
    maxInsights: number,
    minConfidence: number
  ): Promise<{
    successPatterns: SuccessPattern[];
    failurePatterns: FailurePattern[];
    statistics: {
      totalSuccessPatterns: number;
      totalFailurePatterns: number;
      averageConfidence: number;
    };
  }> {
    if (!this.config.enablePatternExtraction) {
      return { successPatterns: [], failurePatterns: [], statistics: { totalSuccessPatterns: 0, totalFailurePatterns: 0, averageConfidence: 0 } };
    }

    const focus = focusAreas.includes('ALL') || focusAreas.includes('SUCCESS_PATTERNS')
      ? 'BOTH'
      : focusAreas.includes('FAILURE_PATTERNS')
      ? 'FAILURE'
      : 'SUCCESS';

    const results = this.patternEngine.extractPatterns(journeys, focus);

    // Filter by confidence
    const filteredSuccess = results.successPatterns
      .filter(p => p.confidence >= minConfidence)
      .slice(0, maxInsights);

    const filteredFailure = results.failurePatterns
      .filter(p => p.confidence >= minConfidence)
      .slice(0, maxInsights);

    return {
      successPatterns: filteredSuccess,
      failurePatterns: filteredFailure,
      statistics: results.statistics,
    };
  }

  private async extractLessons(
    journeys: CareerJourney[],
    focusAreas: string[],
    maxInsights: number,
    minConfidence: number
  ): Promise<{
    lessons: ExtractedLesson[];
    mostValuable: ExtractedLesson[];
    mostCommon: ExtractedLesson[];
    mostSurprising: ExtractedLesson[];
    statistics: {
      totalExtracted: number;
      uniqueLessons: number;
      averageConfidence: number;
    };
  }> {
    if (!this.config.enableLessonExtraction) {
      return {
        lessons: [],
        mostValuable: [],
        mostCommon: [],
        mostSurprising: [],
        statistics: { totalExtracted: 0, uniqueLessons: 0, averageConfidence: 0 },
      };
    }

    const results = this.lessonEngine.extractLessons(journeys, {
      maxLessons: maxInsights * 2,
    });

    // Filter by confidence
    const filtered = results.lessons.filter(l => l.confidence >= minConfidence);

    return {
      lessons: filtered,
      mostValuable: results.mostValuable.filter(l => l.confidence >= minConfidence),
      mostCommon: results.mostCommon.filter(l => l.confidence >= minConfidence),
      mostSurprising: results.mostSurprising.filter(l => l.confidence >= minConfidence),
      statistics: results.statistics,
    };
  }

  private async analyzeMistakes(
    journeys: CareerJourney[],
    focusAreas: string[],
    maxInsights: number,
    minConfidence: number
  ): Promise<{
    allMistakes: MistakeAnalysis[];
    mostCommon: MistakeAnalysis[];
    mostCostly: MistakeAnalysis[];
    mostRegretted: MistakeAnalysis[];
    statistics: {
      totalAnalyzed: number;
      uniqueMistakes: number;
      averageCost: number;
    };
  }> {
    if (!this.config.enableMistakeAnalysis) {
      return {
        allMistakes: [],
        mostCommon: [],
        mostCostly: [],
        mostRegretted: [],
        statistics: { totalAnalyzed: 0, uniqueMistakes: 0, averageCost: 0 },
      };
    }

    const results = this.mistakeEngine.analyzeMistakes(journeys, {
      maxMistakes: maxInsights * 2,
    });

    // Filter by confidence
    const filtered = results.allMistakes.filter(m => m.confidence >= minConfidence);

    return {
      allMistakes: filtered,
      mostCommon: results.mostCommon.filter(m => m.confidence >= minConfidence),
      mostCostly: results.mostCostly.filter(m => m.confidence >= minConfidence),
      mostRegretted: results.mostRegretted.filter(m => m.confidence >= minConfidence),
      statistics: results.statistics,
    };
  }

  private async analyzeDecisions(
    journeys: CareerJourney[],
    focusAreas: string[],
    maxInsights: number,
    minConfidence: number
  ): Promise<{
    outcomes: DecisionOutcome[];
    mostSuccessful: DecisionOutcome[];
    mostRegretted: DecisionOutcome[];
    statistics: {
      totalAnalyzed: number;
      successRate: number;
    };
  }> {
    if (!this.config.enableDecisionAnalysis) {
      return {
        outcomes: [],
        mostSuccessful: [],
        mostRegretted: [],
        statistics: { totalAnalyzed: 0, successRate: 0 },
      };
    }

    const results = this.decisionEngine.analyzeDecisions(journeys, {
      includeCounterfactuals: true,
    });

    // Filter by confidence
    const filtered = results.outcomes.filter(o => o.confidence >= minConfidence);

    return {
      outcomes: filtered.slice(0, maxInsights),
      mostSuccessful: results.mostSuccessful.filter(o => o.confidence >= minConfidence),
      mostRegretted: results.mostRegretted.filter(o => o.confidence >= minConfidence),
      statistics: results.statistics,
    };
  }

  // ============================================================================
  // PRIVATE SYNTHESIS METHODS
  // ============================================================================

  private synthesizeKeyInsights(
    patterns: { successPatterns: SuccessPattern[]; failurePatterns: FailurePattern[] },
    lessons: { lessons: ExtractedLesson[] },
    mistakes: { allMistakes: MistakeAnalysis[] },
    decisions: { outcomes: DecisionOutcome[] }
  ): MentorInsight[] {
    const insights: MentorInsight[] = [];

    // Convert top success patterns to insights
    for (const pattern of patterns.successPatterns.slice(0, 5)) {
      insights.push(this.patternToInsight(pattern, 'SUCCESS_PATTERN'));
    }

    // Convert top failure patterns to insights
    for (const pattern of patterns.failurePatterns.slice(0, 5)) {
      insights.push(this.patternToInsight(pattern, 'FAILURE_PATTERN'));
    }

    // Convert top lessons to insights
    for (const lesson of lessons.lessons.slice(0, 5)) {
      insights.push(this.lessonToInsight(lesson));
    }

    // Convert top mistakes to insights
    for (const mistake of mistakes.allMistakes.slice(0, 5)) {
      insights.push(this.mistakeToInsight(mistake));
    }

    // Sort by importance and confidence
    return insights
      .sort((a, b) => {
        const importanceOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MODERATE': 2, 'LOW': 1 };
        const scoreA = importanceOrder[a.importance] * a.confidence;
        const scoreB = importanceOrder[b.importance] * b.confidence;
        return scoreB - scoreA;
      })
      .slice(0, this.config.maxInsightsPerCategory);
  }

  private patternToInsight(
    pattern: SuccessPattern | FailurePattern,
    type: InsightType
  ): MentorInsight {
    const isSuccess = 'enablingConditions' in pattern;

    return {
      id: this.generateInsightId(),
      lesson: pattern.pattern,
      type,
      confidence: pattern.confidence,
      evidence: pattern.sourceJourneys.slice(0, 3).map(jid => ({
        journeyId: jid,
        event: pattern.pattern,
        outcome: isSuccess ? 'Success' : 'Failure',
        strength: pattern.confidence,
        type: isSuccess ? 'DIRECT_OUTCOME' : 'CAUSAL_INFERENCE',
      })),
      importance: pattern.outcomeImpact.magnitude === 'TRANSFORMATIONAL' || pattern.outcomeImpact.magnitude === 'MAJOR'
        ? 'HIGH'
        : 'MODERATE',
      applicability: {
        archetypes: [],
        careerStages: ['EARLY_CAREER', 'MID_CAREER'], // Default, would be refined
        industries: [],
        relevantConstraints: [],
        minSimilarityScore: 0.5,
      },
      sourceJourneys: pattern.sourceJourneys,
      extractedAt: new Date(),
      extractionVersion: '1.0.0',
    };
  }

  private lessonToInsight(lesson: ExtractedLesson): MentorInsight {
    return {
      id: this.generateInsightId(),
      lesson: lesson.lesson,
      type: 'LESSON_LEARNED',
      confidence: lesson.confidence,
      evidence: lesson.evidence.slice(0, 3).map(evidence => ({
        journeyId: evidence.journeyId,
        event: evidence.action,
        outcome: evidence.outcome,
        strength: evidence.relevance,
        type: 'DIRECT_OUTCOME',
      })),
      importance: lesson.importance,
      applicability: {
        archetypes: [],
        careerStages: lesson.applicability.careerStages,
        industries: [],
        relevantConstraints: [],
        minSimilarityScore: lesson.applicability.minSimilarityScore,
      },
      sourceJourneys: lesson.sourceJourneys,
      extractedAt: lesson.extractedAt,
      extractionVersion: '1.0.0',
    };
  }

  private mistakeToInsight(mistake: MistakeAnalysis): MentorInsight {
    return {
      id: this.generateInsightId(),
      lesson: `Avoid: ${mistake.mistake}`,
      type: 'MISTAKE_AVOIDANCE',
      confidence: mistake.confidence,
      evidence: mistake.sourceJourneys.slice(0, 3).map(jid => ({
        journeyId: jid,
        event: mistake.mistake,
        outcome: 'Negative outcome',
        strength: mistake.confidence,
        type: 'DIRECT_OUTCOME',
      })),
      importance: mistake.cost.careerCost === 'SEVERE' || mistake.cost.careerCost === 'SIGNIFICANT'
        ? 'HIGH'
        : 'MODERATE',
      applicability: {
        archetypes: [],
        careerStages: ['EARLY_CAREER', 'MID_CAREER'],
        industries: [],
        relevantConstraints: [],
        minSimilarityScore: 0.5,
      },
      sourceJourneys: mistake.sourceJourneys,
      extractedAt: new Date(),
      extractionVersion: '1.0.0',
    };
  }

  // ============================================================================
  // PRIVATE RECOMMENDATION METHODS
  // ============================================================================

  private generatePersonalizedRecommendations(
    studentProfile: StudentProfileSnapshot,
    patterns: { successPatterns: SuccessPattern[] },
    lessons: { lessons: ExtractedLesson[] },
    mistakes: { allMistakes: MistakeAnalysis[] },
    decisions: { outcomes: DecisionOutcome[] }
  ): PersonalizedRecommendation[] {
    const recommendations: PersonalizedRecommendation[] = [];

    // Generate from success patterns
    for (const pattern of patterns.successPatterns.slice(0, 3)) {
      recommendations.push({
        recommendation: `Apply pattern: ${pattern.pattern}`,
        rationale: `This pattern has ${(pattern.frequency.percentage * 100).toFixed(0)}% success rate`,
        priority: pattern.outcomeImpact.magnitude === 'TRANSFORMATIONAL' ? 'CRITICAL' : 'HIGH',
        basedOn: {
          patterns: [pattern.id],
          lessons: [],
          mistakes: [],
        },
        expectedImpact: pattern.outcomeImpact.direction,
        timeframe: pattern.outcomeImpact.timeframe,
      });
    }

    // Generate from lessons
    for (const lesson of lessons.lessons.filter(l => l.importance === 'CRITICAL' || l.importance === 'HIGH').slice(0, 3)) {
      recommendations.push({
        recommendation: lesson.lesson,
        rationale: `Critical lesson from ${lesson.frequency.count} journeys`,
        priority: lesson.importance === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
        basedOn: {
          patterns: [],
          lessons: [lesson.id],
          mistakes: [],
        },
        expectedImpact: 'Positive career outcomes',
        timeframe: 'MEDIUM_TERM',
      });
    }

    // Generate from mistakes (avoidance)
    for (const mistake of mistakes.allMistakes.filter(m => m.cost.careerCost === 'SEVERE' || m.cost.careerCost === 'SIGNIFICANT').slice(0, 3)) {
      recommendations.push({
        recommendation: `Avoid: ${mistake.mistake}`,
        rationale: `Common mistake with ${mistake.cost.careerCost.toLowerCase()} career cost`,
        priority: mistake.cost.careerCost === 'SEVERE' ? 'CRITICAL' : 'HIGH',
        basedOn: {
          patterns: [],
          lessons: [],
          mistakes: [mistake.id],
        },
        expectedImpact: 'Avoid negative outcomes',
        timeframe: 'IMMEDIATE',
      });
    }

    return recommendations;
  }

  private generateImmediateActions(
    patterns: { successPatterns: SuccessPattern[]; failurePatterns: FailurePattern[] },
    lessons: { lessons: ExtractedLesson[] },
    mistakes: { warnings: string[] },
    profile: { careerStage: CareerStage; currentSituation: string }
  ): string[] {
    const actions: string[] = [];

    // From success patterns
    for (const pattern of patterns.successPatterns.slice(0, 2)) {
      actions.push(`Start: ${pattern.behaviors[0]}`);
    }

    // From lessons
    for (const lesson of lessons.lessons.filter(l => l.type === 'ACTION_TO_TAKE').slice(0, 2)) {
      actions.push(lesson.lesson);
    }

    // From warnings
    for (const warning of mistakes.warnings.slice(0, 2)) {
      actions.push(`Watch for: ${warning}`);
    }

    return [...new Set(actions)];
  }

  private generateShortTermRecommendations(
    patterns: { successPatterns: SuccessPattern[] },
    lessons: { lessons: ExtractedLesson[] },
    profile: { careerStage: CareerStage; goals: string[] }
  ): string[] {
    return [
      'Build skills identified as critical by similar successful journeys',
      'Expand network in target industry',
      'Validate assumptions before major commitments',
    ];
  }

  private generateLongTermStrategies(
    patterns: { successPatterns: SuccessPattern[] },
    lessons: { lessons: ExtractedLesson[] },
    profile: { careerStage: CareerStage; goals: string[] }
  ): string[] {
    return [
      'Develop multiple skill areas for flexibility',
      'Build strong professional relationships',
      'Maintain learning mindset throughout career',
    ];
  }

  private generateResourceRecommendations(
    lessons: { lessons: ExtractedLesson[] },
    profile: { careerStage: CareerStage; goals: string[] }
  ): string[] {
    return [
      'Mentorship from professionals in target field',
      'Online courses for skill development',
      'Professional communities and networks',
    ];
  }

  private generateDecisionGuidance(
    decision: string,
    profile: { careerStage: CareerStage; constraints: string[] },
    journeys: CareerJourney[]
  ): {
    decision: string;
    recommendation: string;
    confidence: ConfidenceLevel;
    rationale: string;
  } {
    // Analyze similar decisions
    const similarDecisions = journeys.flatMap(j =>
      j.majorDecisions.filter(d =>
        d.decision.toLowerCase().includes(decision.toLowerCase()) ||
        decision.toLowerCase().includes(d.decision.toLowerCase())
      )
    );

    const successfulDecisions = similarDecisions.filter(d => d.actualOutcome.positive);
    const successRate = similarDecisions.length > 0
      ? successfulDecisions.length / similarDecisions.length
      : 0.5;

    let recommendation: string;
    let confidence: ConfidenceLevel;

    if (successRate >= 0.7) {
      recommendation = 'Historical data supports this decision';
      confidence = 0.8;
    } else if (successRate >= 0.5) {
      recommendation = 'Mixed outcomes - proceed with caution and mitigation strategies';
      confidence = 0.6;
    } else {
      recommendation = 'Historical data suggests reconsidering or gathering more information';
      confidence = 0.7;
    }

    return {
      decision,
      recommendation,
      confidence,
      rationale: `Based on ${similarDecisions.length} similar decisions with ${(successRate * 100).toFixed(0)}% success rate`,
    };
  }

  // ============================================================================
  // PRIVATE UTILITY METHODS
  // ============================================================================

  private validateQuery(query: IntelligenceQuery): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!query.journeys || query.journeys.length === 0) {
      if (!query.similarJourneys || query.similarJourneys.length === 0) {
        errors.push('At least one journey or similar journey result is required');
      }
    }

    if (query.journeys && query.journeys.length < 3) {
      warnings.push('Small sample size may limit insight quality');
    }

    if (query.maxInsights && (query.maxInsights < 1 || query.maxInsights > 100)) {
      errors.push('maxInsights must be between 1 and 100');
    }

    if (query.minConfidence && (query.minConfidence < 0 || query.minConfidence > 1)) {
      errors.push('minConfidence must be between 0 and 1');
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  private calculateStatistics(
    patterns: { successPatterns: SuccessPattern[]; failurePatterns: FailurePattern[]; statistics: any },
    lessons: { lessons: ExtractedLesson[]; statistics: any },
    mistakes: { allMistakes: MistakeAnalysis[]; statistics: any },
    decisions: { outcomes: DecisionOutcome[]; statistics: any },
    journeys: CareerJourney[]
  ): MentorIntelligenceStatistics {
    const allPatterns = [...patterns.successPatterns, ...patterns.failurePatterns];
    const allLessons = lessons.lessons;
    const allMistakes = mistakes.allMistakes;
    const allDecisions = decisions.outcomes;

    // Calculate pattern confidence distribution
    const highConfPatterns = allPatterns.filter(p => p.confidence >= 0.8).length;
    const medConfPatterns = allPatterns.filter(p => p.confidence >= 0.6 && p.confidence < 0.8).length;
    const lowConfPatterns = allPatterns.filter(p => p.confidence < 0.6).length;

    // Find most common categories
    const successCategories = new Map<SuccessCategory, number>();
    for (const p of patterns.successPatterns) {
      successCategories.set(p.category, (successCategories.get(p.category) || 0) + 1);
    }
    const mostCommonSuccessCategory = Array.from(successCategories.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'LEARNING';

    const failureCategories = new Map<FailureCategory, number>();
    for (const p of patterns.failurePatterns) {
      failureCategories.set(p.category, (failureCategories.get(p.category) || 0) + 1);
    }
    const mostCommonFailureCategory = Array.from(failureCategories.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'STRATEGIC_ERROR';

    const lessonCategories = new Map<LessonCategory, number>();
    for (const l of lessons.lessons) {
      lessonCategories.set(l.category, (lessonCategories.get(l.category) || 0) + 1);
    }
    const mostCommonLessonCategory = Array.from(lessonCategories.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'EARLY_CAREER';

    const mistakeCategories = new Map<MistakeCategory, number>();
    for (const m of mistakes.allMistakes) {
      mistakeCategories.set(m.category, (mistakeCategories.get(m.category) || 0) + 1);
    }
    const mostCommonMistakeCategory = Array.from(mistakeCategories.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'STRATEGIC_ERROR';

    return {
      totalPatternsExtracted: allPatterns.length,
      totalLessonsExtracted: allLessons.length,
      totalMistakesIdentified: allMistakes.length,
      totalDecisionsAnalyzed: allDecisions.length,
      patternConfidence: {
        high: highConfPatterns,
        medium: medConfPatterns,
        low: lowConfPatterns,
      },
      mostCommonSuccessCategory,
      mostCommonFailureCategory,
      mostCommonLessonCategory,
      mostCommonMistakeCategory,
      averageEvidenceCount: allPatterns.length > 0
        ? allPatterns.reduce((sum, p) => sum + p.sourceJourneys.length, 0) / allPatterns.length
        : 0,
      averageSourceJourneyCount: allLessons.length > 0
        ? allLessons.reduce((sum, l) => sum + l.sourceJourneys.length, 0) / allLessons.length
        : 0,
    };
  }

  private filterJourneysByStage(journeys: CareerJourney[], stage: CareerStage): CareerJourney[] {
    // Simple heuristic: filter based on career history length
    return journeys.filter(j => {
      const years = j.careerHistory.reduce((sum, p) => sum + p.durationMonths, 0) / 12;

      switch (stage) {
        case 'STUDENT':
          return j.educationHistory.length > 0 && years < 1;
        case 'EARLY_CAREER':
          return years >= 1 && years < 5;
        case 'MID_CAREER':
          return years >= 5 && years < 10;
        case 'SENIOR':
          return years >= 10;
        default:
          return true;
      }
    });
  }

  private isMistakeRelevantToStage(mistake: MistakeAnalysis, stage: CareerStage): boolean {
    // Most mistakes are relevant across stages, but some are stage-specific
    return true; // Simplified - would have stage-specific logic
  }

  private generateStageWarnings(mistakes: MistakeAnalysis[], stage: CareerStage): string[] {
    return mistakes.slice(0, 3).map(m => `Watch for: ${m.mistake.substring(0, 50)}...`);
  }

  private generateStageOpportunities(insights: MentorInsight[], stage: CareerStage): string[] {
    return insights
      .filter(i => i.type === 'SUCCESS_PATTERN')
      .slice(0, 3)
      .map(i => `Opportunity: ${i.lesson.substring(0, 50)}...`);
  }

  private generateAnswer(
    question: string,
    report: MentorIntelligenceReport
  ): {
    answer: string;
    confidence: ConfidenceLevel;
    supportingEvidence: Array<{
      type: 'PATTERN' | 'LESSON' | 'MISTAKE' | 'DECISION';
      id: PatternId | LessonId | MistakeId | DecisionOutcomeId;
      description: string;
      relevance: number;
    }>;
    caveats: string[];
  } {
    const questionLower = question.toLowerCase();

    // Simple keyword-based matching
    let answer = 'Based on the analyzed career journeys: ';
    let confidence: ConfidenceLevel = 0.7;
    const evidence: Array<{
      type: 'PATTERN' | 'LESSON' | 'MISTAKE' | 'DECISION';
      id: PatternId | LessonId | MistakeId | DecisionOutcomeId;
      description: string;
      relevance: number;
    }> = [];

    if (questionLower.includes('success') || questionLower.includes('work')) {
      answer += report.successPatterns.slice(0, 3).map(p => p.pattern).join('; ');
      for (const p of report.successPatterns.slice(0, 2)) {
        evidence.push({ type: 'PATTERN', id: p.id, description: p.pattern, relevance: p.confidence });
      }
    } else if (questionLower.includes('mistake') || questionLower.includes('avoid') || questionLower.includes('fail')) {
      answer += report.mistakes.slice(0, 3).map(m => m.mistake).join('; ');
      for (const m of report.mistakes.slice(0, 2)) {
        evidence.push({ type: 'MISTAKE', id: m.id, description: m.mistake, relevance: m.confidence });
      }
    } else if (questionLower.includes('lesson') || questionLower.includes('learn')) {
      answer += report.lessons.slice(0, 3).map(l => l.lesson).join('; ');
      for (const l of report.lessons.slice(0, 2)) {
        evidence.push({ type: 'LESSON', id: l.id, description: l.lesson, relevance: l.confidence });
      }
    } else {
      answer += 'Here are the key insights: ' + report.keyInsights.slice(0, 3).map(i => i.lesson).join('; ');
    }

    return {
      answer,
      confidence,
      supportingEvidence: evidence,
      caveats: ['Based on limited sample size', 'Individual results may vary'],
    };
  }

  private patternsAreSimilar(a: SuccessPattern | FailurePattern, b: SuccessPattern | FailurePattern): boolean {
    return a.pattern.toLowerCase().substring(0, 30) === b.pattern.toLowerCase().substring(0, 30);
  }

  private lessonsAreSimilar(a: ExtractedLesson, b: ExtractedLesson): boolean {
    return a.lesson.toLowerCase().substring(0, 50) === b.lesson.toLowerCase().substring(0, 50);
  }

  private mistakesAreSimilar(a: MistakeAnalysis, b: MistakeAnalysis): boolean {
    return a.mistake.toLowerCase().substring(0, 50) === b.mistake.toLowerCase().substring(0, 50);
  }

  private identifyKeyDifferences(
    patternsA: { successPatterns: SuccessPattern[] },
    patternsB: { successPatterns: SuccessPattern[] },
    lessonsA: { lessons: ExtractedLesson[] },
    lessonsB: { lessons: ExtractedLesson[] },
    nameA: string,
    nameB: string
  ): string[] {
    const differences: string[] = [];

    if (patternsA.successPatterns.length !== patternsB.successPatterns.length) {
      differences.push(`${nameA} has ${patternsA.successPatterns.length} success patterns vs ${patternsB.successPatterns.length} for ${nameB}`);
    }

    if (lessonsA.lessons.length !== lessonsB.lessons.length) {
      differences.push(`${nameA} generated ${lessonsA.lessons.length} lessons vs ${lessonsB.lessons.length} for ${nameB}`);
    }

    return differences;
  }

  private generateComparativeRecommendations(
    uniquePatterns: SuccessPattern[],
    uniqueLessons: ExtractedLesson[],
    mistakes: { allMistakes: MistakeAnalysis[] },
    groupName: string
  ): string[] {
    const recommendations: string[] = [];

    if (uniquePatterns.length > 0) {
      recommendations.push(`Leverage unique success patterns: ${uniquePatterns[0].pattern}`);
    }

    if (uniqueLessons.length > 0) {
      recommendations.push(`Apply unique insight: ${uniqueLessons[0].lesson}`);
    }

    if (mistakes.allMistakes.length > 0) {
      recommendations.push(`Watch for common mistake: ${mistakes.allMistakes[0].mistake.substring(0, 40)}...`);
    }

    return recommendations;
  }

  private generateInsightExplanation(
    insight: MentorInsight | SuccessPattern | FailurePattern | ExtractedLesson | MistakeAnalysis | DecisionOutcome,
    studentContext?: StudentProfileSnapshot
  ): {
    mainExplanation: string;
    relevance: string;
    application: string;
    evidence: string;
    confidenceExplanation: string;
  } {
    let mainExplanation = 'This insight comes from analyzing multiple career journeys.';
    let relevance = 'Relevant to professionals in similar situations.';
    let application = 'Consider applying this in your career decisions.';
    let evidence = 'Supported by multiple career examples.';
    let confidenceExplanation = 'Confidence based on frequency and consistency of evidence.';

    if ('pattern' in insight) {
      mainExplanation = `Pattern: ${insight.pattern}`;
      evidence = `Found in ${insight.sourceJourneys.length} journeys`;
    } else if ('lesson' in insight) {
      mainExplanation = `Lesson: ${insight.lesson}`;
      evidence = `Extracted from ${insight.sourceJourneys.length} journeys`;
    } else if ('mistake' in insight) {
      mainExplanation = `Mistake to avoid: ${insight.mistake}`;
      evidence = `Occurred in ${insight.sourceJourneys.length} journeys`;
    }

    return {
      mainExplanation,
      relevance,
      application,
      evidence,
      confidenceExplanation,
    };
  }

  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateInsightId(): MentorInsightId {
    return `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as MentorInsightId;
  }

  private generateComparisonId(): string {
    return `comparison_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Factory function to create a configured engine
 */
export function createMentorIntelligenceEngine(
  config?: Partial<MentorIntelligenceEngineConfig>
): MentorIntelligenceEngine {
  return new MentorIntelligenceEngine(config);
}
