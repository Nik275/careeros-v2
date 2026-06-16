/**
 * Journey Insights Engine
 * 
 * Generates comprehensive insights from career journeys.
 * Extracts lessons, identifies patterns, and produces actionable intelligence.
 */

import {
  CareerJourney,
  JourneyInsights,
  ValuableDecision,
  MajorMistake,
  UnexpectedOutcome,
  RegretAnalysis,
  JourneyPattern,
  ImportanceLevel,
  ImpactLevel,
  CareerDecision,
  CareerFailure,
  CareerSuccess,
  LessonLearned,
  CareerRegret,
} from './career-journey-types';

import { JourneyAnalyzer } from './journey-analyzer';

/**
 * Insight category
 */
export interface InsightCategory {
  category: string;
  insights: string[];
  confidence: number;
  evidence: string[];
}

/**
 * Comparative insight
 */
export interface ComparativeInsight {
  insight: string;
  basis: 'SINGLE_JOURNEY' | 'MULTI_JOURNEY' | 'COHORT_ANALYSIS';
  comparisonGroup?: string;
  statisticalSignificance?: number;
}

/**
 * Actionable recommendation
 */
export interface ActionableRecommendation {
  recommendation: string;
  rationale: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  timeframe: 'IMMEDIATE' | 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM';
  expectedImpact: string;
  effortRequired: 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * Journey Insights Engine
 * 
 * Generates deep insights from career journey data,
 * including lessons learned, patterns, and actionable recommendations.
 */
export class JourneyInsightsEngine {
  private journeyAnalyzer: JourneyAnalyzer;

  constructor() {
    this.journeyAnalyzer = new JourneyAnalyzer();
  }

  /**
   * Generate comprehensive insights for a career journey
   */
  async generateInsights(
    journey: CareerJourney,
    depth: 'BASIC' | 'STANDARD' | 'DEEP' = 'STANDARD'
  ): Promise<JourneyInsights> {
    // Parallel insight generation
    const [
      biggestLesson,
      mostValuableDecision,
      largestMistake,
      unexpectedOutcome,
      regretAnalysis,
      patterns,
      adviceForOthers,
      wouldDoDifferently,
      keySuccessFactors,
    ] = await Promise.all([
      this.identifyBiggestLesson(journey),
      this.identifyMostValuableDecision(journey),
      this.identifyLargestMistake(journey),
      this.identifyUnexpectedOutcome(journey),
      this.analyzeRegrets(journey),
      this.identifyPatterns(journey, depth),
      this.generateAdvice(journey),
      this.identifyWhatWouldDoDifferently(journey),
      this.identifyKeySuccessFactors(journey),
    ]);

    return {
      journeyId: journey.id,
      biggestLesson,
      mostValuableDecision,
      largestMistake,
      unexpectedOutcome,
      regretAnalysis,
      patterns,
      adviceForOthers,
      wouldDoDifferently,
      keySuccessFactors,
      generatedAt: new Date(),
    };
  }

  /**
   * Generate insights across multiple journeys
   */
  generateComparativeInsights(journeys: CareerJourney[]): {
    commonPatterns: string[];
    differentiatingFactors: string[];
    successCorrelations: Array<{
      factor: string;
      correlation: number;
      significance: 'HIGH' | 'MEDIUM' | 'LOW';
    }>;
    archetypes: Array<{
      name: string;
      characteristics: string[];
      typicalOutcomes: string[];
      exampleJourneys: string[];
    }>;
    recommendations: ActionableRecommendation[];
  } {
    return {
      commonPatterns: this.findCommonPatterns(journeys),
      differentiatingFactors: this.findDifferentiatingFactors(journeys),
      successCorrelations: this.analyzeSuccessCorrelations(journeys),
      archetypes: this.identifyArchetypes(journeys),
      recommendations: this.generateMultiJourneyRecommendations(journeys),
    };
  }

  /**
   * Generate insights for a specific context
   */
  generateContextualInsights(
    journey: CareerJourney,
    context: {
      currentChallenge?: string;
      upcomingDecision?: string;
      careerGoal?: string;
    }
  ): {
    relevantLessons: string[];
    applicablePatterns: string[];
    warnings: string[];
    recommendations: ActionableRecommendation[];
    similarSituations: string[];
  } {
    const relevantLessons: string[] = [];
    const applicablePatterns: string[] = [];
    const warnings: string[] = [];

    // Match lessons to context
    for (const lesson of journey.lessons) {
      if (this.isRelevantToContext(lesson, context)) {
        relevantLessons.push(lesson.lesson);
      }
    }

    // Match decisions to context
    for (const decision of journey.majorDecisions) {
      if (context.upcomingDecision && this.isSimilarDecision(decision, context.upcomingDecision)) {
        applicablePatterns.push(`Previous decision: ${decision.decision} - Outcome: ${decision.actualOutcome.positive ? 'Positive' : 'Negative'}`);
        
        if (!decision.actualOutcome.positive) {
          warnings.push(`Similar decision had negative outcome. Consider: ${decision.alternativesConsidered.join(', ')}`);
        }
      }
    }

    // Generate recommendations
    const recommendations = this.generateContextualRecommendations(journey, context);

    // Find similar situations
    const similarSituations = this.findSimilarSituations(journey, context);

    return {
      relevantLessons,
      applicablePatterns,
      warnings,
      recommendations,
      similarSituations,
    };
  }

  /**
   * Categorize insights by theme
   */
  categorizeInsights(journey: CareerJourney): InsightCategory[] {
    const categories: InsightCategory[] = [];

    // Decision-making insights
    categories.push({
      category: 'Decision Making',
      insights: this.extractDecisionInsights(journey),
      confidence: 0.8,
      evidence: journey.majorDecisions.map(d => d.decision),
    });

    // Skill development insights
    categories.push({
      category: 'Skill Development',
      insights: this.extractSkillInsights(journey),
      confidence: 0.75,
      evidence: journey.careerHistory.flatMap(p => 
        p.skills.filter(s => s.gainedOrUsed === 'GAINED').map(s => s.skill)
      ),
    });

    // Network insights
    categories.push({
      category: 'Networking',
      insights: this.extractNetworkInsights(journey),
      confidence: 0.7,
      evidence: journey.majorDecisions.flatMap(d => 
        d.influences.map(i => i.source)
      ),
    });

    // Resilience insights
    categories.push({
      category: 'Resilience',
      insights: this.extractResilienceInsights(journey),
      confidence: 0.85,
      evidence: journey.failures.map(f => f.description),
    });

    return categories;
  }

  /**
   * Validate insights against outcomes
   */
  validateInsights(
    insights: JourneyInsights,
    outcome: {
      satisfaction: number;
      achievement: number;
      wouldRecommend: boolean;
    }
  ): {
    validatedInsights: string[];
    questionableInsights: string[];
    accuracy: number;
    suggestions: string[];
  } {
    const validatedInsights: string[] = [];
    const questionableInsights: string[] = [];

    // Validate based on outcome satisfaction
    if (outcome.satisfaction >= 4) {
      validatedInsights.push(insights.biggestLesson);
      validatedInsights.push(...insights.keySuccessFactors);
    } else {
      questionableInsights.push(insights.biggestLesson);
      questionableInsights.push(...insights.keySuccessFactors);
    }

    // Validate regrets
    if (outcome.wouldRecommend && insights.regretAnalysis.totalRegrets > 3) {
      questionableInsights.push('High regret count despite recommendation');
    }

    const accuracy = validatedInsights.length / 
      (validatedInsights.length + questionableInsights.length);

    return {
      validatedInsights,
      questionableInsights,
      accuracy,
      suggestions: this.generateValidationSuggestions(outcome),
    };
  }

  // ============================================================================
  // PRIVATE INSIGHT GENERATION
  // ============================================================================

  private async identifyBiggestLesson(journey: CareerJourney): Promise<string> {
    // Prioritize lessons from failures and critical turning points
    const criticalLessons = journey.lessons.filter(l => l.importance === 'CRITICAL');
    
    if (criticalLessons.length > 0) {
      return criticalLessons[0].lesson;
    }

    // Look for lessons mentioned multiple times
    const lessonCounts: Record<string, number> = {};
    for (const lesson of journey.lessons) {
      lessonCounts[lesson.lesson] = (lessonCounts[lesson.lesson] || 0) + 1;
    }

    const repeatedLessons = Object.entries(lessonCounts)
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1]);

    if (repeatedLessons.length > 0) {
      return repeatedLessons[0][0];
    }

    // Fall back to most recent high-importance lesson
    const importantLessons = journey.lessons
      .filter(l => l.importance === 'HIGH')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (importantLessons.length > 0) {
      return importantLessons[0].lesson;
    }

    // Final fallback
    return journey.lessons.length > 0 
      ? journey.lessons[journey.lessons.length - 1].lesson
      : 'No major lessons documented';
  }

  private async identifyMostValuableDecision(journey: CareerJourney): Promise<ValuableDecision> {
    // Score each decision
    const scoredDecisions = journey.majorDecisions.map(d => ({
      decision: d,
      score: this.scoreDecisionValue(d),
    }));

    // Sort by score
    scoredDecisions.sort((a, b) => b.score - a.score);

    const best = scoredDecisions[0]?.decision;

    if (!best) {
      return {
        decision: 'No major decisions recorded',
        value: 'Unknown',
        whyValuable: 'Insufficient data',
        when: new Date(),
      };
    }

    return {
      decision: best.decision,
      value: best.actualOutcome.description,
      whyValuable: this.explainDecisionValue(best),
      when: best.timestamp,
    };
  }

  private async identifyLargestMistake(journey: CareerJourney): Promise<MajorMistake> {
    // Consider both explicit failures and decisions with negative outcomes
    const failures = journey.failures.map(f => ({
      type: 'failure' as const,
      item: f,
      impact: f.impact,
    }));

    const badDecisions = journey.majorDecisions
      .filter(d => !d.actualOutcome.positive && d.actualOutcome.impact === 'MAJOR')
      .map(d => ({
        type: 'decision' as const,
        item: d,
        impact: d.actualOutcome.impact,
      }));

    const allMistakes = [...failures, ...badDecisions];

    if (allMistakes.length === 0) {
      return {
        mistake: 'No major mistakes recorded',
        impact: 'None',
        lesson: 'Maintain current approach',
        when: new Date(),
      };
    }

    // Sort by impact
    const impactOrder: ImpactLevel[] = ['TRANSFORMATIONAL', 'MAJOR', 'MODERATE', 'MINOR', 'NEGLIGIBLE'];
    allMistakes.sort((a, b) => 
      impactOrder.indexOf(a.impact) - impactOrder.indexOf(b.impact)
    );

    const worst = allMistakes[0];

    if (worst.type === 'failure') {
      const failure = worst.item as CareerFailure;
      return {
        mistake: failure.description,
        impact: failure.longTermImpact,
        lesson: failure.lessonsLearned[0] || 'No specific lesson recorded',
        when: failure.timestamp,
      };
    } else {
      const decision = worst.item as CareerDecision;
      return {
        mistake: decision.decision,
        impact: decision.actualOutcome.description,
        lesson: `Consider alternatives: ${decision.alternativesConsidered.join(', ')}`,
        when: decision.timestamp,
      };
    }
  }

  private async identifyUnexpectedOutcome(journey: CareerJourney): Promise<UnexpectedOutcome> {
    // Find outcomes that exceeded or fell short of expectations
    const unexpectedDecisions = journey.majorDecisions.filter(d => 
      !d.actualOutcome.matchedExpectations && 
      (d.actualOutcome.impact === 'MAJOR' || d.actualOutcome.impact === 'TRANSFORMATIONAL')
    );

    if (unexpectedDecisions.length === 0) {
      return {
        whatHappened: 'No major unexpected outcomes',
        whatWasExpected: 'N/A',
        impact: 'Minimal',
      };
    }

    // Prioritize positive unexpected outcomes
    const positiveUnexpected = unexpectedDecisions.find(d => d.actualOutcome.positive);
    const selected = positiveUnexpected || unexpectedDecisions[0];

    return {
      whatHappened: selected.actualOutcome.description,
      whatWasExpected: selected.expectedOutcome,
      impact: `Career ${selected.actualOutcome.positive ? 'advanced' : 'set back'} significantly`,
    };
  }

  private async analyzeRegrets(journey: CareerJourney): Promise<RegretAnalysis> {
    const regrets = journey.regrets;
    
    const addressable = regrets.filter(r => r.addressable).length;
    
    // Find biggest regret by intensity
    const intensityOrder = ['SEVERE', 'MODERATE', 'MILD'];
    const sortedRegrets = [...regrets].sort((a, b) => 
      intensityOrder.indexOf(a.intensity) - intensityOrder.indexOf(b.intensity)
    );

    // Identify pattern
    const pattern = this.identifyRegretPattern(regrets);

    return {
      totalRegrets: regrets.length,
      addressableRegrets: addressable,
      biggestRegret: sortedRegrets[0]?.regret,
      regretPattern: pattern,
      advice: this.generateRegretAdvice(regrets),
    };
  }

  private async identifyPatterns(
    journey: CareerJourney,
    depth: 'BASIC' | 'STANDARD' | 'DEEP'
  ): Promise<JourneyPattern[]> {
    const result = this.journeyAnalyzer.detectPatterns(journey, depth);
    return result.patterns;
  }

  private async generateAdvice(journey: CareerJourney): Promise<string[]> {
    const advice: string[] = [];

    // Based on failures
    for (const failure of journey.failures.slice(0, 2)) {
      for (const lesson of failure.lessonsLearned) {
        advice.push(`Avoid: ${lesson}`);
      }
    }

    // Based on successes
    for (const success of journey.successes.slice(0, 2)) {
      advice.push(`Do more: ${success.contributingFactors.join(', ')}`);
    }

    // Based on regrets
    for (const regret of journey.regrets.filter(r => r.addressable).slice(0, 2)) {
      if (regret.howToAddress) {
        advice.push(`Address regret: ${regret.howToAddress}`);
      }
    }

    // Generic advice based on journey characteristics
    if (journey.networkQuality() === 'LIMITED' || journey.networkQuality() === 'NONE') {
      advice.push('Build professional network proactively');
    }

    if (journey.lessons.length < 3) {
      advice.push('Document learnings more systematically');
    }

    return [...new Set(advice)]; // Deduplicate
  }

  private async identifyWhatWouldDoDifferently(journey: CareerJourney): Promise<string[]> {
    const differently: string[] = [];

    // From regrets
    for (const regret of journey.regrets) {
      differently.push(`${regret.whatShouldHaveBeenDone} (instead of: ${regret.whatWasDone})`);
    }

    // From failures
    for (const failure of journey.failures) {
      if (failure.lessonsLearned.length > 0) {
        differently.push(`Prevent: ${failure.description} by ${failure.lessonsLearned[0]}`);
      }
    }

    // From bad decisions
    const badDecisions = journey.majorDecisions.filter(d => !d.actualOutcome.positive);
    for (const decision of badDecisions) {
      if (decision.alternativesConsidered.length > 0) {
        differently.push(`Choose: ${decision.alternativesConsidered[0]} (instead of: ${decision.decision})`);
      }
    }

    return [...new Set(differently)].slice(0, 5);
  }

  private async identifyKeySuccessFactors(journey: CareerJourney): Promise<string[]> {
    const factors: string[] = [];

    // Analyze successes
    for (const success of journey.successes) {
      factors.push(...success.contributingFactors);
    }

    // Analyze good decisions
    const goodDecisions = journey.majorDecisions.filter(d => d.actualOutcome.positive);
    for (const decision of goodDecisions) {
      factors.push(...decision.influences.map(i => i.source));
    }

    // Count frequency
    const factorCounts: Record<string, number> = {};
    for (const factor of factors) {
      factorCounts[factor] = (factorCounts[factor] || 0) + 1;
    }

    // Return most common
    return Object.entries(factorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([factor]) => factor);
  }

  // ============================================================================
  // PRIVATE COMPARATIVE ANALYSIS
  // ============================================================================

  private findCommonPatterns(journeys: CareerJourney[]): string[] {
    const allPatterns = journeys.flatMap(j => 
      this.journeyAnalyzer.detectPatterns(j, 'STANDARD').patterns
    );

    const patternCounts: Record<string, number> = {};
    for (const pattern of allPatterns) {
      patternCounts[pattern.pattern] = (patternCounts[pattern.pattern] || 0) + 1;
    }

    return Object.entries(patternCounts)
      .filter(([_, count]) => count >= journeys.length * 0.3)
      .map(([pattern]) => pattern);
  }

  private findDifferentiatingFactors(journeys: CareerJourney[]): string[] {
    const factors: string[] = [];

    // Compare starting points
    const startingTiers = [...new Set(journeys.map(j => j.startingPoint.location.tier))];
    if (startingTiers.length > 1) {
      factors.push(`Starting location tier varies: ${startingTiers.join(', ')}`);
    }

    // Compare decision counts
    const decisionCounts = journeys.map(j => j.majorDecisions.length);
    if (Math.max(...decisionCounts) - Math.min(...decisionCounts) > 3) {
      factors.push('Significant variation in decision-making frequency');
    }

    // Compare outcomes
    const successCounts = journeys.map(j => j.successes.length);
    if (Math.max(...successCounts) > Math.min(...successCounts) * 2) {
      factors.push('Wide variation in documented success frequency');
    }

    return factors;
  }

  private analyzeSuccessCorrelations(journeys: CareerJourney[]): Array<{
    factor: string;
    correlation: number;
    significance: 'HIGH' | 'MEDIUM' | 'LOW';
  }> {
    const correlations: Array<{
      factor: string;
      correlation: number;
      significance: 'HIGH' | 'MEDIUM' | 'LOW';
    }> = [];

    // Correlation: Education tier
    const tier1Education = journeys.filter(j => 
      j.educationHistory.some(e => e.institutionTier === 'TIER_1')
    ).length;
    correlations.push({
      factor: 'Tier-1 Education',
      correlation: tier1Education / journeys.length,
      significance: tier1Education > journeys.length * 0.5 ? 'HIGH' : 'MEDIUM',
    });

    // Correlation: Network quality
    const strongNetwork = journeys.filter(j => 
      j.startingPoint.familyBackground.networkQuality === 'EXTENSIVE'
    ).length;
    correlations.push({
      factor: 'Strong Initial Network',
      correlation: strongNetwork / journeys.length,
      significance: strongNetwork > journeys.length * 0.4 ? 'HIGH' : 'MEDIUM',
    });

    // Correlation: Decision count
    const highDecisionMakers = journeys.filter(j => j.majorDecisions.length >= 5).length;
    correlations.push({
      factor: 'Active Decision Making',
      correlation: highDecisionMakers / journeys.length,
      significance: 'MEDIUM',
    });

    return correlations;
  }

  private identifyArchetypes(journeys: CareerJourney[]): Array<{
    name: string;
    characteristics: string[];
    typicalOutcomes: string[];
    exampleJourneys: string[];
  }> {
    const archetypes: Array<{
      name: string;
      characteristics: string[];
      typicalOutcomes: string[];
      exampleJourneys: string[];
    }> = [];

    // Archetype: Steady Climber
    const steadyClimbers = journeys.filter(j => {
      const trajectory = this.journeyAnalyzer.analyzeTrajectory(j);
      return trajectory.direction === 'UPWARD' && trajectory.consistency > 0.6;
    });

    if (steadyClimbers.length > 0) {
      archetypes.push({
        name: 'Steady Climber',
        characteristics: ['Consistent progression', 'Low volatility', 'Strategic moves'],
        typicalOutcomes: ['Senior roles', 'Industry expertise', 'Stable growth'],
        exampleJourneys: steadyClimbers.slice(0, 3).map(j => j.id),
      });
    }

    // Archetype: Explorer
    const explorers = journeys.filter(j => {
      const industries = [...new Set(j.careerHistory.map(p => p.industry))];
      return industries.length >= 3;
    });

    if (explorers.length > 0) {
      archetypes.push({
        name: 'Explorer',
        characteristics: ['Industry variety', 'Diverse experience', 'Adaptability'],
        typicalOutcomes: ['Broad skills', 'Cross-industry network', 'Versatility'],
        exampleJourneys: explorers.slice(0, 3).map(j => j.id),
      });
    }

    // Archetype: Resilient Recoverer
    const resilient = journeys.filter(j => 
      j.failures.length >= 2 && j.failures.every(f => f.recovered)
    );

    if (resilient.length > 0) {
      archetypes.push({
        name: 'Resilient Recoverer',
        characteristics: ['Bounces back from setbacks', 'Learns from failure', 'Persistence'],
        typicalOutcomes: [' eventual success', 'Strong character', 'Valuable lessons'],
        exampleJourneys: resilient.slice(0, 3).map(j => j.id),
      });
    }

    return archetypes;
  }

  private generateMultiJourneyRecommendations(journeys: CareerJourney[]): ActionableRecommendation[] {
    const recommendations: ActionableRecommendation[] = [];

    // Common recommendation based on patterns
    const commonRegrets = this.findCommonRegrets(journeys);
    if (commonRegrets.includes('ACTION_NOT_TAKEN')) {
      recommendations.push({
        recommendation: 'Act on opportunities sooner rather than later',
        rationale: 'Common regret across journeys is inaction',
        priority: 'HIGH',
        timeframe: 'IMMEDIATE',
        expectedImpact: 'Reduced future regret',
        effortRequired: 'LOW',
      });
    }

    // Network recommendation
    const weakNetworks = journeys.filter(j => 
      j.startingPoint.familyBackground.networkQuality !== 'EXTENSIVE'
    ).length;
    if (weakNetworks > journeys.length * 0.5) {
      recommendations.push({
        recommendation: 'Invest heavily in professional network building',
        rationale: 'Many journeys started with limited networks',
        priority: 'HIGH',
        timeframe: 'SHORT_TERM',
        expectedImpact: 'More opportunities, better decisions',
        effortRequired: 'MEDIUM',
      });
    }

    return recommendations;
  }

  // ============================================================================
  // PRIVATE UTILITY HELPERS
  // ============================================================================

  private scoreDecisionValue(decision: CareerDecision): number {
    let score = 0;

    // Outcome quality
    if (decision.actualOutcome.positive) score += 3;
    if (decision.actualOutcome.matchedExpectations) score += 1;

    // Impact magnitude
    const impactScores: Record<ImpactLevel, number> = {
      'TRANSFORMATIONAL': 4,
      'MAJOR': 3,
      'MODERATE': 2,
      'MINOR': 1,
      'NEGLIGIBLE': 0,
    };
    score += impactScores[decision.actualOutcome.impact];

    // Confidence calibration
    if (decision.confidence >= 0.7 && decision.actualOutcome.positive) score += 1;

    return score;
  }

  private explainDecisionValue(decision: CareerDecision): string {
    const parts: string[] = [];

    if (decision.actualOutcome.positive) {
      parts.push('Positive outcome');
    }

    parts.push(`${decision.actualOutcome.impact.toLowerCase()} impact`);

    if (decision.actualOutcome.matchedExpectations) {
      parts.push('met expectations');
    }

    return parts.join(', ');
  }

  private identifyRegretPattern(regrets: CareerRegret[]): string {
    if (regrets.length === 0) return 'No regrets documented';

    const typeCounts: Record<string, number> = {};
    for (const regret of regrets) {
      typeCounts[regret.type] = (typeCounts[regret.type] || 0) + 1;
    }

    const dominantType = Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])[0][0];

    const patterns: Record<string, string> = {
      'ACTION_NOT_TAKEN': 'Pattern of missed opportunities',
      'ACTION_TAKEN': 'Pattern of regretful actions',
      'TIMING': 'Pattern of timing regrets',
      'SKILL_NOT_DEVELOPED': 'Pattern of skill neglect',
      'OPPORTUNITY_MISSED': 'Pattern of missed opportunities',
    };

    return patterns[dominantType] || 'Mixed regret pattern';
  }

  private generateRegretAdvice(regrets: CareerRegret[]): string {
    if (regrets.length === 0) {
      return 'No regrets - maintain current approach';
    }

    const addressable = regrets.filter(r => r.addressable);
    if (addressable.length > 0) {
      return `${addressable.length} regrets can still be addressed. Start with the most severe.`;
    }

    return 'Learn from these regrets to avoid similar situations in future';
  }

  private isRelevantToContext(
    lesson: LessonLearned,
    context: { currentChallenge?: string; upcomingDecision?: string; careerGoal?: string }
  ): boolean {
    const lessonText = lesson.lesson.toLowerCase();
    
    if (context.currentChallenge && lessonText.includes(context.currentChallenge.toLowerCase())) {
      return true;
    }

    if (context.careerGoal && lessonText.includes(context.careerGoal.toLowerCase())) {
      return true;
    }

    return false;
  }

  private isSimilarDecision(decision: CareerDecision, upcomingDecision: string): boolean {
    const decisionText = decision.decision.toLowerCase();
    const upcomingText = upcomingDecision.toLowerCase();
    
    // Simple keyword matching
    const keywords = upcomingText.split(' ');
    const matches = keywords.filter(k => decisionText.includes(k)).length;
    
    return matches >= keywords.length * 0.5;
  }

  private generateContextualRecommendations(
    journey: CareerJourney,
    context: { currentChallenge?: string; upcomingDecision?: string; careerGoal?: string }
  ): ActionableRecommendation[] {
    const recommendations: ActionableRecommendation[] = [];

    if (context.upcomingDecision) {
      // Find similar past decisions
      const similarDecisions = journey.majorDecisions.filter(d => 
        this.isSimilarDecision(d, context.upcomingDecision!)
      );

      if (similarDecisions.length > 0) {
        const successful = similarDecisions.filter(d => d.actualOutcome.positive);
        if (successful.length > 0) {
          recommendations.push({
            recommendation: 'Follow similar approach to past successful decision',
            rationale: `Similar decision worked before: ${successful[0].decision}`,
            priority: 'HIGH',
            timeframe: 'IMMEDIATE',
            expectedImpact: 'Higher probability of success',
            effortRequired: 'LOW',
          });
        }
      }
    }

    return recommendations;
  }

  private findSimilarSituations(
    journey: CareerJourney,
    context: { currentChallenge?: string; upcomingDecision?: string; careerGoal?: string }
  ): string[] {
    const situations: string[] = [];

    for (const turningPoint of journey.turningPoints) {
      if (context.currentChallenge && turningPoint.event.toLowerCase().includes(context.currentChallenge.toLowerCase())) {
        situations.push(`Turning point: ${turningPoint.event}`);
      }
    }

    return situations;
  }

  private extractDecisionInsights(journey: CareerJourney): string[] {
    const insights: string[] = [];
    const analysis = this.journeyAnalyzer.analyzeDecisionPatterns(journey);

    insights.push(`Made ${analysis.totalDecisions} major decisions with ${(analysis.accuracy * 100).toFixed(0)}% success rate`);
    insights.push(`Risk profile: ${analysis.riskProfile.toLowerCase().replace('_', ' ')}`);
    insights.push(`Primary influences: ${analysis.influenceSources.slice(0, 3).join(', ')}`);

    return insights;
  }

  private extractSkillInsights(journey: CareerJourney): string[] {
    const insights: string[] = [];
    
    const skillsGained = journey.careerHistory.reduce((acc, p) => 
      acc + p.skills.filter(s => s.gainedOrUsed === 'GAINED').length, 0
    );

    insights.push(`Acquired ${skillsGained} new skills through career`);

    const skillAnalysis = this.journeyAnalyzer.analyzeSkillAcquisition(journey);
    insights.push(`Primary learning mode: ${skillAnalysis.primaryLearningModes[0]}`);

    return insights;
  }

  private extractNetworkInsights(journey: CareerJourney): string[] {
    const insights: string[] = [];

    const influenceSources = [...new Set(journey.majorDecisions.flatMap(d => 
      d.influences.map(i => i.source)
    ))];

    insights.push(`Key influences: ${influenceSources.join(', ')}`);

    return insights;
  }

  private extractResilienceInsights(journey: CareerJourney): string[] {
    const insights: string[] = [];

    const recoveredFailures = journey.failures.filter(f => f.recovered);
    
    insights.push(`Experienced ${journey.failures.length} setbacks, recovered from ${recoveredFailures.length}`);

    if (recoveredFailures.length === journey.failures.length && journey.failures.length > 0) {
      insights.push('Perfect recovery rate - strong resilience');
    }

    return insights;
  }

  private findCommonRegrets(journeys: CareerJourney[]): string[] {
    const allRegrets = journeys.flatMap(j => j.regrets);
    const typeCounts: Record<string, number> = {};
    
    for (const regret of allRegrets) {
      typeCounts[regret.type] = (typeCounts[regret.type] || 0) + 1;
    }

    return Object.entries(typeCounts)
      .filter(([_, count]) => count >= journeys.length * 0.2)
      .map(([type]) => type);
  }

  private generateValidationSuggestions(outcome: {
    satisfaction: number;
    achievement: number;
    wouldRecommend: boolean;
  }): string[] {
    const suggestions: string[] = [];

    if (outcome.satisfaction < 4) {
      suggestions.push('Review insights with lower satisfaction scores');
    }

    if (!outcome.wouldRecommend) {
      suggestions.push('Investigate why journey would not be recommended');
    }

    return suggestions;
  }
}

// Extend CareerJourney for internal methods
declare module './career-journey-types' {
  interface CareerJourney {
    networkQuality(): import('./career-journey-types').NetworkQuality;
  }
}
