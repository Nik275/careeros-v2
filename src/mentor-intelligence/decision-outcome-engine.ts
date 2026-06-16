/**
 * Decision Outcome Engine
 *
 * Analyzes decisions and their outcomes over time.
 * Tracks short-term, medium-term, and long-term impacts.
 * Identifies unexpected consequences and counterfactuals.
 *
 * @module DecisionOutcomeEngine
 */

import {
  CareerJourney,
  JourneyId,
  CareerDecision,
  CareerPosition,
  ImpactLevel,
  ImportanceLevel,
} from '../career-journeys/career-journey-types';

import {
  DecisionOutcome,
  DecisionOutcomeId,
  DecisionType,
  DecisionContext,
  OutcomeSnapshot,
  ProgressionOutcome,
  FinancialOutcome,
  SatisfactionOutcome,
  SkillOutcome,
  NetworkOutcome,
  UnexpectedConsequence,
  AlternativeAnalysis,
  CounterfactualAnalysis,
  ConfidenceLevel,
  ExtractionConfig,
  DEFAULT_EXTRACTION_CONFIG,
} from './mentor-intelligence-types';

/**
 * Decision Outcome Engine
 *
 * Analyzes career decisions and their outcomes across different timeframes,
 * identifying patterns in decision-making and unexpected consequences.
 */
export class DecisionOutcomeEngine {
  private config: ExtractionConfig;

  constructor(config: Partial<ExtractionConfig> = {}) {
    this.config = { ...DEFAULT_EXTRACTION_CONFIG, ...config };
  }

  /**
   * Analyze all decisions from a set of journeys
   */
  analyzeDecisions(
    journeys: CareerJourney[],
    options: {
      decisionTypes?: DecisionType[];
      minConfidence?: number;
      includeCounterfactuals?: boolean;
    } = {}
  ): {
    outcomes: DecisionOutcome[];
    byType: Record<DecisionType, DecisionOutcome[]>;
    mostSuccessful: DecisionOutcome[];
    mostRegretted: DecisionOutcome[];
    mostUnexpected: DecisionOutcome[];
    commonConsequences: Array<{
      consequence: string;
      frequency: number;
      impact: 'POSITIVE' | 'NEGATIVE' | 'MIXED';
    }>;
    statistics: {
      totalAnalyzed: number;
      withShortTermData: number;
      withLongTermData: number;
      averageConfidence: number;
      successRate: number;
    };
  } {
    const outcomes: DecisionOutcome[] = [];

    for (const journey of journeys) {
      for (const decision of journey.majorDecisions) {
        const outcome = this.analyzeDecision(decision, journey, options.includeCounterfactuals);
        if (outcome) outcomes.push(outcome);
      }
    }

    // Filter by type if specified
    let filtered = outcomes;
    if (options.decisionTypes && options.decisionTypes.length > 0) {
      filtered = outcomes.filter(o => options.decisionTypes!.includes(o.decisionType));
    }

    // Filter by confidence
    const minConf = options.minConfidence || this.config.minConfidenceThreshold;
    filtered = filtered.filter(o => o.confidence >= minConf);

    // Group by type
    const byType = this.groupByType(filtered);

    // Identify special categories
    const mostSuccessful = this.identifyMostSuccessful(filtered);
    const mostRegretted = this.identifyMostRegretted(filtered);
    const mostUnexpected = this.identifyMostUnexpected(filtered);

    // Find common consequences
    const commonConsequences = this.identifyCommonConsequences(filtered);

    // Calculate statistics
    const statistics = this.calculateStatistics(filtered, journeys);

    return {
      outcomes: filtered,
      byType,
      mostSuccessful,
      mostRegretted,
      mostUnexpected,
      commonConsequences,
      statistics,
    };
  }

  /**
   * Analyze a specific decision type across all journeys
   */
  analyzeDecisionType(
    journeys: CareerJourney[],
    decisionType: DecisionType
  ): {
    type: DecisionType;
    count: number;
    successRate: number;
    averageConfidence: number;
    commonOutcomes: string[];
    commonUnexpectedConsequences: string[];
    bestPractices: string[];
    warningSigns: string[];
    recommendations: string[];
  } {
    const analysis = this.analyzeDecisions(journeys, { decisionTypes: [decisionType] });

    const outcomes = analysis.byType[decisionType] || [];

    const successRate = outcomes.length > 0
      ? outcomes.filter(o => o.shortTermOutcome.assessment === 'EXCELLENT' || o.shortTermOutcome.assessment === 'GOOD').length / outcomes.length
      : 0;

    const avgConfidence = outcomes.length > 0
      ? outcomes.reduce((sum, o) => sum + o.confidence, 0) / outcomes.length
      : 0;

    // Extract common outcomes
    const outcomeDescriptions = outcomes.flatMap(o => [
      o.shortTermOutcome.careerProgression.details,
      o.shortTermOutcome.satisfactionOutcome.details,
    ]);
    const commonOutcomes = this.findMostCommon(outcomeDescriptions, 5);

    // Extract unexpected consequences
    const allConsequences = outcomes.flatMap(o =>
      o.unexpectedConsequences.map(c => c.consequence)
    );
    const commonUnexpectedConsequences = this.findMostCommon(allConsequences, 5);

    // Generate best practices
    const bestPractices = this.extractBestPractices(outcomes);

    // Generate warning signs
    const warningSigns = this.extractWarningSigns(outcomes);

    // Generate recommendations
    const recommendations = this.generateRecommendations(outcomes);

    return {
      type: decisionType,
      count: outcomes.length,
      successRate,
      averageConfidence: avgConfidence,
      commonOutcomes,
      commonUnexpectedConsequences,
      bestPractices,
      warningSigns,
      recommendations,
    };
  }

  /**
   * Compare outcomes of similar decisions
   */
  compareDecisionOutcomes(
    decisionA: DecisionOutcome,
    decisionB: DecisionOutcome
): {
    comparison: string;
    keyDifferences: string[];
    betterChoice: 'A' | 'B' | 'DEPENDS';
    reasoning: string;
    transferableInsights: string[];
  } {
    const differences: string[] = [];

    // Compare short-term outcomes
    if (decisionA.shortTermOutcome.assessment !== decisionB.shortTermOutcome.assessment) {
      differences.push(`Short-term: ${decisionA.shortTermOutcome.assessment} vs ${decisionB.shortTermOutcome.assessment}`);
    }

    // Compare career progression
    if (decisionA.shortTermOutcome.careerProgression.level !== decisionB.shortTermOutcome.careerProgression.level) {
      differences.push(`Career impact: ${decisionA.shortTermOutcome.careerProgression.level} vs ${decisionB.shortTermOutcome.careerProgression.level}`);
    }

    // Compare unexpected consequences
    const aConsequences = decisionA.unexpectedConsequences.length;
    const bConsequences = decisionB.unexpectedConsequences.length;
    if (aConsequences !== bConsequences) {
      differences.push(`Unexpected events: ${aConsequences} vs ${bConsequences}`);
    }

    // Determine better choice
    let betterChoice: 'A' | 'B' | 'DEPENDS';
    const scoreA = this.scoreOutcome(decisionA);
    const scoreB = this.scoreOutcome(decisionB);

    if (scoreA > scoreB + 0.3) {
      betterChoice = 'A';
    } else if (scoreB > scoreA + 0.3) {
      betterChoice = 'B';
    } else {
      betterChoice = 'DEPENDS';
    }

    const reasoning = betterChoice === 'DEPENDS'
      ? 'Both decisions have comparable outcomes with different trade-offs.'
      : `Decision ${betterChoice} shows superior outcomes across key dimensions.`;

    const transferableInsights = this.extractTransferableInsights(decisionA, decisionB);

    return {
      comparison: `Comparing ${decisionA.decision} vs ${decisionB.decision}`,
      keyDifferences: differences,
      betterChoice,
      reasoning,
      transferableInsights,
    };
  }

  /**
   * Generate counterfactual analysis for a decision
   */
  generateCounterfactual(
    decision: CareerDecision,
    journey: CareerJourney,
    alternative: string
  ): CounterfactualAnalysis {
    // Analyze what likely would have happened
    const likelyScenario = this.inferCounterfactualScenario(decision, alternative, journey);

    // Identify key differences
    const keyDifferences = this.identifyCounterfactualDifferences(decision, alternative, journey);

    // Determine if actual decision was better
    const actualWasBetter = this.assessActualDecisionQuality(decision, journey);

    return {
      likelyScenario,
      keyDifferences,
      actualWasBetter,
      confidence: 0.6 as ConfidenceLevel, // Counterfactuals are inherently uncertain
    };
  }

  /**
   * Identify decision patterns that lead to success
   */
  identifySuccessfulDecisionPatterns(
    journeys: CareerJourney[]
  ): Array<{
    pattern: string;
    description: string;
    successRate: number;
    sampleSize: number;
    confidence: ConfidenceLevel;
    supportingDecisions: DecisionOutcome[];
  }> {
    const allOutcomes = this.analyzeDecisions(journeys).outcomes;
    const successfulOutcomes = allOutcomes.filter(o =>
      o.shortTermOutcome.assessment === 'EXCELLENT' || o.shortTermOutcome.assessment === 'GOOD'
    );

    const patterns = new Map<string, DecisionOutcome[]>();

    // Group by decision characteristics
    for (const outcome of successfulOutcomes) {
      const pattern = this.extractDecisionPattern(outcome);
      if (!patterns.has(pattern)) {
        patterns.set(pattern, []);
      }
      patterns.get(pattern)!.push(outcome);
    }

    // Convert to results
    return Array.from(patterns.entries())
      .filter(([_, outcomes]) => outcomes.length >= 3) // Minimum sample size
      .map(([pattern, outcomes]) => ({
        pattern,
        description: this.describePattern(pattern, outcomes[0]),
        successRate: outcomes.length / allOutcomes.filter(o => this.extractDecisionPattern(o) === pattern).length,
        sampleSize: outcomes.length,
        confidence: Math.min(outcomes.length / 10, 0.9) as ConfidenceLevel,
        supportingDecisions: outcomes.slice(0, 5),
      }))
      .sort((a, b) => b.successRate - a.successRate);
  }

  /**
   * Predict outcomes for a pending decision
   */
  predictOutcomes(
    decision: {
      type: DecisionType;
      description: string;
      context: Partial<DecisionContext>;
    },
    similarDecisions: DecisionOutcome[]
  ): {
    shortTermPrediction: OutcomeSnapshot;
    confidence: ConfidenceLevel;
    similarCases: DecisionOutcome[];
    riskFactors: string[];
    successFactors: string[];
    recommendation: string;
  } {
    // Find similar historical decisions
    const similarCases = this.findSimilarDecisions(decision, similarDecisions);

    // Calculate base rates
    const successRate = similarCases.length > 0
      ? similarCases.filter(c =>
          c.shortTermOutcome.assessment === 'EXCELLENT' || c.shortTermOutcome.assessment === 'GOOD'
        ).length / similarCases.length
      : 0.5;

    // Generate prediction
    const shortTermPrediction = this.generatePredictionSnapshot(similarCases, successRate);

    // Calculate confidence based on sample size
    const confidence = Math.min(similarCases.length / 20, 0.9) as ConfidenceLevel;

    // Identify risk and success factors
    const riskFactors = this.extractRiskFactors(similarCases);
    const successFactors = this.extractSuccessFactors(similarCases);

    // Generate recommendation
    const recommendation = this.generateDecisionRecommendation(successRate, riskFactors, successFactors);

    return {
      shortTermPrediction,
      confidence,
      similarCases: similarCases.slice(0, 5),
      riskFactors,
      successFactors,
      recommendation,
    };
  }

  // ============================================================================
  // PRIVATE ANALYSIS METHODS
  // ============================================================================

  private analyzeDecision(
    decision: CareerDecision,
    journey: CareerJourney,
    includeCounterfactuals?: boolean
  ): DecisionOutcome | null {
    // Determine decision type
    const decisionType = this.classifyDecisionType(decision);

    // Build context
    const context = this.buildDecisionContext(decision, journey);

    // Analyze short-term outcome
    const shortTermOutcome = this.analyzeShortTermOutcome(decision, journey);

    // Analyze medium-term outcome if data available
    const mediumTermOutcome = this.analyzeMediumTermOutcome(decision, journey);

    // Analyze long-term outcome if data available
    const longTermOutcome = this.analyzeLongTermOutcome(decision, journey);

    // Identify unexpected consequences
    const unexpectedConsequences = this.identifyUnexpectedConsequences(decision, journey);

    // Analyze alternatives
    const alternativesConsidered = this.analyzeAlternatives(decision, journey);

    // Generate counterfactual if requested
    let counterfactualAnalysis: CounterfactualAnalysis | undefined;
    if (includeCounterfactuals && decision.alternativesConsidered.length > 0) {
      counterfactualAnalysis = this.generateCounterfactual(decision, journey, decision.alternativesConsidered[0]);
    }

    // Calculate confidence
    const confidence = this.calculateDecisionConfidence(decision, journey);

    return {
      id: this.generateOutcomeId(),
      decision: decision.decision,
      decisionType,
      context,
      shortTermOutcome,
      mediumTermOutcome,
      longTermOutcome,
      unexpectedConsequences,
      alternativesConsidered,
      counterfactualAnalysis,
      sourceJourneys: [journey.id],
      confidence,
    };
  }

  private classifyDecisionType(decision: CareerDecision): DecisionType {
    const decisionText = decision.decision.toLowerCase();
    const reasoning = decision.reasoning.toLowerCase();

    if (decisionText.includes('job') || decisionText.includes('role') || decisionText.includes('position')) {
      if (decisionText.includes('leave') || decisionText.includes('quit') || decisionText.includes('resign')) {
        return 'JOB_DEPARTURE';
      }
      return 'JOB_ACCEPTANCE';
    }

    if (decisionText.includes('career') || decisionText.includes('industry') || decisionText.includes('field')) {
      return 'CAREER_CHANGE';
    }

    if (decisionText.includes('degree') || decisionText.includes('course') || decisionText.includes('study') || decisionText.includes('education')) {
      return 'EDUCATION_CHOICE';
    }

    if (decisionText.includes('skill') || decisionText.includes('learn') || decisionText.includes('certification')) {
      return 'SKILL_INVESTMENT';
    }

    if (decisionText.includes('move') || decisionText.includes('relocate') || decisionText.includes('city')) {
      return 'RELOCATION';
    }

    if (decisionText.includes('startup') || decisionText.includes('business') || decisionText.includes('found') || decisionText.includes('company')) {
      return 'ENTREPRENEURIAL';
    }

    if (decisionText.includes('network') || decisionText.includes('connect') || decisionText.includes('relationship')) {
      return 'NETWORKING';
    }

    if (decisionText.includes('wait') || decisionText.includes('now') || decisionText.includes('later') || decisionText.includes('timing')) {
      return 'TIMING';
    }

    if (reasoning.includes('risk') || decisionText.includes('risk')) {
      return 'RISK_TAKING';
    }

    return 'CAREER_CHANGE';
  }

  private buildDecisionContext(decision: CareerDecision, journey: CareerJourney): DecisionContext {
    // Infer career stage from journey
    const careerStage = this.inferCareerStage(journey);

    // Extract constraints
    const constraints = journey.startingPoint.initialConstraints.map(c => c.description);

    // Infer information availability
    const informationAvailability: DecisionContext['informationAvailability'] =
      decision.alternativesConsidered.length >= 3 ? 'SUBSTANTIAL' :
      decision.alternativesConsidered.length >= 1 ? 'PARTIAL' : 'LIMITED';

    // Infer time pressure
    const timePressure: DecisionContext['timePressure'] =
      decision.confidence < 0.4 ? 'URGENT' :
      decision.confidence < 0.7 ? 'MODERATE' : 'RELAXED';

    // Infer stakes
    const stakes: DecisionContext['stakes'] =
      decision.actualOutcome.impact === 'TRANSFORMATIONAL' ? 'LIFE_CHANGING' :
      decision.actualOutcome.impact === 'MAJOR' ? 'HIGH' :
      decision.actualOutcome.impact === 'MODERATE' ? 'MODERATE' : 'LOW';

    return {
      careerStage,
      constraints,
      informationAvailability,
      timePressure,
      stakes,
    };
  }

  private analyzeShortTermOutcome(decision: CareerDecision, journey: CareerJourney): OutcomeSnapshot {
    const actualOutcome = decision.actualOutcome;

    return {
      timeframe: '0-2 years',
      assessment: this.mapOutcomeAssessment(actualOutcome.positive, actualOutcome.impact),
      careerProgression: this.inferCareerProgression(decision, journey),
      financialOutcome: this.inferFinancialOutcome(decision, journey),
      satisfactionOutcome: this.inferSatisfactionOutcome(decision, journey),
      skillOutcome: this.inferSkillOutcome(decision, journey),
      networkOutcome: this.inferNetworkOutcome(decision, journey),
      matchedExpectations: actualOutcome.matchedExpectations,
      surprises: actualOutcome.matchedExpectations ? [] : ['Outcome differed from expectations'],
    };
  }

  private analyzeMediumTermOutcome(decision: CareerDecision, journey: CareerJourney): OutcomeSnapshot | undefined {
    // Check if we have enough timeline data
    const decisionTime = decision.timestamp.getTime();
    const now = new Date().getTime();
    const yearsSinceDecision = (now - decisionTime) / (1000 * 60 * 60 * 24 * 365);

    if (yearsSinceDecision < 2) return undefined;

    // Infer medium-term outcomes from subsequent career positions
    const subsequentPositions = journey.careerHistory.filter(p =>
      p.startDate.getTime() > decisionTime
    );

    if (subsequentPositions.length === 0) return undefined;

    return {
      timeframe: '2-5 years',
      assessment: this.inferMediumTermAssessment(subsequentPositions, decision),
      careerProgression: this.inferMediumTermCareerProgression(subsequentPositions),
      financialOutcome: { level: 'MAINTAINED', details: 'Inferred from career progression' },
      satisfactionOutcome: { level: 'NEUTRAL', details: 'Insufficient data' },
      skillOutcome: this.inferMediumTermSkillOutcome(subsequentPositions),
      networkOutcome: { level: 'MAINTAINED', details: 'Inferred from career progression' },
      matchedExpectations: true, // Assume expectations adjusted
      surprises: [],
    };
  }

  private analyzeLongTermOutcome(decision: CareerDecision, journey: CareerJourney): OutcomeSnapshot | undefined {
    // Check if we have enough timeline data
    const decisionTime = decision.timestamp.getTime();
    const now = new Date().getTime();
    const yearsSinceDecision = (now - decisionTime) / (1000 * 60 * 60 * 24 * 365);

    if (yearsSinceDecision < 5) return undefined;

    // Infer long-term trajectory
    const currentPosition = journey.careerHistory[journey.careerHistory.length - 1];
    const successCount = journey.successes.length;
    const failureCount = journey.failures.length;

    const overallSuccess = successCount > failureCount * 2;

    return {
      timeframe: '5+ years',
      assessment: overallSuccess ? 'GOOD' : 'NEUTRAL',
      careerProgression: {
        level: currentPosition ? 'ADVANCED' : 'MAINTAINED',
        details: currentPosition ? `Reached ${currentPosition.title}` : 'Career maintained',
      },
      financialOutcome: { level: overallSuccess ? 'IMPROVED' : 'MAINTAINED', details: 'Inferred from overall trajectory' },
      satisfactionOutcome: { level: 'NEUTRAL', details: 'Long-term satisfaction data unavailable' },
      skillOutcome: { level: 'GAINED', details: 'Skills accumulated over career' },
      networkOutcome: { level: 'EXPANDED', details: 'Network grew over time' },
      matchedExpectations: true,
      surprises: [],
    };
  }

  private identifyUnexpectedConsequences(decision: CareerDecision, journey: CareerJourney): UnexpectedConsequence[] {
    const consequences: UnexpectedConsequence[] = [];

    // Check if outcome matched expectations
    if (!decision.actualOutcome.matchedExpectations) {
      consequences.push({
        consequence: decision.actualOutcome.description,
        timeframe: 'IMMEDIATE',
        impact: decision.actualOutcome.positive ? 'POSITIVE' : 'NEGATIVE',
        magnitude: decision.actualOutcome.impact,
        foreseeable: false,
      });
    }

    // Look for turning points that may have been triggered
    const subsequentTurningPoints = journey.turningPoints.filter(tp =>
      tp.timestamp.getTime() > decision.timestamp.getTime()
    );

    for (const tp of subsequentTurningPoints.slice(0, 2)) {
      consequences.push({
        consequence: tp.event,
        timeframe: this.inferTimeframe(tp.timestamp, decision.timestamp),
        impact: tp.positiveEffects.length > tp.negativeEffects.length ? 'POSITIVE' : 'NEGATIVE',
        magnitude: tp.importance === 'CRITICAL'
          ? 'TRANSFORMATIONAL'
          : tp.importance === 'HIGH'
          ? 'MAJOR'
          : tp.importance === 'MODERATE'
          ? 'MODERATE'
          : 'MINOR',
        foreseeable: false,
      });
    }

    return consequences;
  }

  private analyzeAlternatives(decision: CareerDecision, journey: CareerJourney): AlternativeAnalysis[] {
    return decision.alternativesConsidered.map(alt => ({
      alternative: alt,
      whyNotChosen: decision.reasoning,
      likelyOutcome: 'Unknown - alternative not pursued',
      confidence: 0.3 as ConfidenceLevel,
    }));
  }

  // ============================================================================
  // PRIVATE UTILITY METHODS
  // ============================================================================

  private mapOutcomeAssessment(positive: boolean, impact: ImpactLevel): OutcomeSnapshot['assessment'] {
    if (positive) {
      if (impact === 'TRANSFORMATIONAL' || impact === 'MAJOR') return 'EXCELLENT';
      if (impact === 'MODERATE') return 'GOOD';
      return 'NEUTRAL';
    } else {
      if (impact === 'TRANSFORMATIONAL' || impact === 'MAJOR') return 'POOR';
      if (impact === 'MODERATE') return 'NEUTRAL';
      return 'NEUTRAL';
    }
  }

  private inferCareerStage(journey: CareerJourney): DecisionContext['careerStage'] {
    const years = journey.careerHistory.reduce((sum, p) => sum + p.durationMonths, 0) / 12;

    if (years < 2) return 'EARLY_CAREER';
    if (years < 5) return 'MID_CAREER';
    if (journey.careerHistory.some(p => p.title.toLowerCase().includes('senior') || p.title.toLowerCase().includes('lead'))) {
      return 'SENIOR';
    }
    return 'MID_CAREER';
  }

  private inferCareerProgression(decision: CareerDecision, journey: CareerJourney): ProgressionOutcome {
    const positive = decision.actualOutcome.positive;
    const impact = decision.actualOutcome.impact;

    const level: ProgressionOutcome['level'] = positive
      ? (impact === 'TRANSFORMATIONAL' || impact === 'MAJOR' ? 'ADVANCED' : 'PROGRESSED')
      : (impact === 'TRANSFORMATIONAL' || impact === 'MAJOR' ? 'DECLINED' : 'MAINTAINED');

    return {
      level,
      details: decision.actualOutcome.description,
    };
  }

  private inferFinancialOutcome(decision: CareerDecision, journey: CareerJourney): FinancialOutcome {
    // Infer from decision context
    const positive = decision.actualOutcome.positive;

    return {
      level: positive ? 'IMPROVED' : 'MAINTAINED',
      details: 'Inferred from decision outcome',
    };
  }

  private inferSatisfactionOutcome(decision: CareerDecision, journey: CareerJourney): SatisfactionOutcome {
    const positive = decision.actualOutcome.positive;

    return {
      level: positive ? 'SATISFIED' : 'NEUTRAL',
      details: 'Inferred from decision outcome',
    };
  }

  private inferSkillOutcome(decision: CareerDecision, journey: CareerJourney): SkillOutcome {
    return {
      level: 'GAINED',
      details: 'New skills acquired through decision implementation',
    };
  }

  private inferNetworkOutcome(decision: CareerDecision, journey: CareerJourney): NetworkOutcome {
    return {
      level: 'EXPANDED',
      details: 'Network expanded through new role/position',
    };
  }

  private inferMediumTermAssessment(positions: CareerPosition[], decision: CareerDecision): OutcomeSnapshot['assessment'] {
    // Check if career progressed after decision
    const progression = positions.length > 0 &&
      positions.some(p => p.title !== decision.decision); // Simplified check

    return progression ? 'GOOD' : 'NEUTRAL';
  }

  private inferMediumTermCareerProgression(positions: CareerPosition[]): ProgressionOutcome {
    if (positions.length === 0) {
      return { level: 'MAINTAINED', details: 'No subsequent positions' };
    }

    const latest = positions[positions.length - 1];
    return {
      level: 'PROGRESSED',
      details: `Advanced to ${latest.title}`,
    };
  }

  private inferMediumTermSkillOutcome(positions: CareerPosition[]): SkillOutcome {
    const allSkills = positions.flatMap(p => p.skills);
    const gainedSkills = allSkills.filter(s => s.gainedOrUsed === 'GAINED');

    return {
      level: gainedSkills.length > 3 ? 'SIGNIFICANTLY_GAINED' : 'GAINED',
      details: `${gainedSkills.length} new skills acquired`,
    };
  }

  private inferTimeframe(eventDate: Date, decisionDate: Date): UnexpectedConsequence['timeframe'] {
    const diffMs = eventDate.getTime() - decisionDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays < 30) return 'IMMEDIATE';
    if (diffDays < 365) return 'SHORT_TERM';
    if (diffDays < 365 * 3) return 'MEDIUM_TERM';
    return 'LONG_TERM';
  }

  private calculateDecisionConfidence(decision: CareerDecision, journey: CareerJourney): ConfidenceLevel {
    let confidence = 0.7;

    // Higher confidence if we have outcome data
    if (decision.actualOutcome.description.length > 20) confidence += 0.1;

    // Higher confidence if expectations were documented
    if (decision.expectedOutcome.length > 10) confidence += 0.1;

    // Higher confidence if alternatives were considered
    if (decision.alternativesConsidered.length > 0) confidence += 0.1;

    return Math.min(confidence, 1) as ConfidenceLevel;
  }

  private groupByType(outcomes: DecisionOutcome[]): Record<DecisionType, DecisionOutcome[]> {
    const byType: Partial<Record<DecisionType, DecisionOutcome[]>> = {};

    for (const outcome of outcomes) {
      if (!byType[outcome.decisionType]) {
        byType[outcome.decisionType] = [];
      }
      byType[outcome.decisionType]!.push(outcome);
    }

    return byType as Record<DecisionType, DecisionOutcome[]>;
  }

  private identifyMostSuccessful(outcomes: DecisionOutcome[]): DecisionOutcome[] {
    return outcomes
      .filter(o => o.shortTermOutcome.assessment === 'EXCELLENT' || o.shortTermOutcome.assessment === 'GOOD')
      .slice(0, 5);
  }

  private identifyMostRegretted(outcomes: DecisionOutcome[]): DecisionOutcome[] {
    return outcomes
      .filter(o => !o.shortTermOutcome.matchedExpectations && !o.shortTermOutcome.careerProgression.level.includes('ADVANCED'))
      .slice(0, 5);
  }

  private identifyMostUnexpected(outcomes: DecisionOutcome[]): DecisionOutcome[] {
    return outcomes
      .filter(o => o.unexpectedConsequences.length > 0)
      .sort((a, b) => b.unexpectedConsequences.length - a.unexpectedConsequences.length)
      .slice(0, 5);
  }

  private identifyCommonConsequences(outcomes: DecisionOutcome[]): Array<{
    consequence: string;
    frequency: number;
    impact: 'POSITIVE' | 'NEGATIVE' | 'MIXED';
  }> {
    const consequenceCounts = new Map<string, { count: number; impact: UnexpectedConsequence['impact'] }>();

    for (const outcome of outcomes) {
      for (const consequence of outcome.unexpectedConsequences) {
        const key = consequence.consequence.substring(0, 50);
        const existing = consequenceCounts.get(key);
        if (existing) {
          existing.count++;
        } else {
          consequenceCounts.set(key, { count: 1, impact: consequence.impact });
        }
      }
    }

    return Array.from(consequenceCounts.entries())
      .filter(([_, data]) => data.count >= 2)
      .map(([consequence, data]) => ({
        consequence,
        frequency: data.count,
        impact: data.impact,
      }))
      .sort((a, b) => b.frequency - a.frequency);
  }

  private calculateStatistics(outcomes: DecisionOutcome[], journeys: CareerJourney[]): {
    totalAnalyzed: number;
    withShortTermData: number;
    withLongTermData: number;
    averageConfidence: number;
    successRate: number;
  } {
    const withShortTerm = outcomes.filter(o => o.shortTermOutcome).length;
    const withLongTerm = outcomes.filter(o => o.longTermOutcome).length;
    const avgConfidence = outcomes.length > 0
      ? outcomes.reduce((sum, o) => sum + o.confidence, 0) / outcomes.length
      : 0;
    const successRate = outcomes.length > 0
      ? outcomes.filter(o => o.shortTermOutcome.assessment === 'EXCELLENT' || o.shortTermOutcome.assessment === 'GOOD').length / outcomes.length
      : 0;

    return {
      totalAnalyzed: outcomes.length,
      withShortTermData: withShortTerm,
      withLongTermData: withLongTerm,
      averageConfidence: avgConfidence,
      successRate,
    };
  }

  private findMostCommon(items: string[], limit: number): string[] {
    const counts = new Map<string, number>();
    for (const item of items) {
      counts.set(item, (counts.get(item) || 0) + 1);
    }

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([item]) => item);
  }

  private extractBestPractices(outcomes: DecisionOutcome[]): string[] {
    const successful = outcomes.filter(o =>
      o.shortTermOutcome.assessment === 'EXCELLENT' || o.shortTermOutcome.assessment === 'GOOD'
    );

    const practices = new Set<string>();

    for (const outcome of successful) {
      if (outcome.context.informationAvailability === 'SUBSTANTIAL') {
        practices.add('Gather substantial information before deciding');
      }
      if (outcome.alternativesConsidered.length > 0) {
        practices.add('Consider multiple alternatives');
      }
      if (outcome.context.timePressure === 'RELAXED') {
        practices.add('Avoid rushed decisions when possible');
      }
    }

    return Array.from(practices);
  }

  private extractWarningSigns(outcomes: DecisionOutcome[]): string[] {
    const unsuccessful = outcomes.filter(o =>
      o.shortTermOutcome.assessment === 'POOR' || o.shortTermOutcome.assessment === 'NEUTRAL'
    );

    const warnings = new Set<string>();

    for (const outcome of unsuccessful) {
      if (outcome.context.informationAvailability === 'LIMITED') {
        warnings.add('Deciding with limited information');
      }
      if (outcome.context.timePressure === 'URGENT') {
        warnings.add('Decisions made under time pressure');
      }
      if (outcome.alternativesConsidered.length === 0) {
        warnings.add('Not considering alternatives');
      }
    }

    return Array.from(warnings);
  }

  private generateRecommendations(outcomes: DecisionOutcome[]): string[] {
    const successRate = outcomes.length > 0
      ? outcomes.filter(o => o.shortTermOutcome.assessment === 'EXCELLENT' || o.shortTermOutcome.assessment === 'GOOD').length / outcomes.length
      : 0;

    const recommendations: string[] = [];

    if (successRate < 0.5) {
      recommendations.push('Improve information gathering before decisions');
      recommendations.push('Consider more alternatives systematically');
    }

    if (outcomes.some(o => o.unexpectedConsequences.length > 2)) {
      recommendations.push('Build flexibility to handle unexpected outcomes');
    }

    recommendations.push('Document expectations to enable learning');

    return recommendations;
  }

  private scoreOutcome(outcome: DecisionOutcome): number {
    const assessmentScores: Record<OutcomeSnapshot['assessment'], number> = {
      'EXCELLENT': 4,
      'GOOD': 3,
      'NEUTRAL': 2,
      'POOR': 1,
      'DISASTROUS': 0,
    };

    let score = assessmentScores[outcome.shortTermOutcome.assessment];

    // Bonus for positive unexpected consequences
    score += outcome.unexpectedConsequences.filter(c => c.impact === 'POSITIVE').length * 0.5;

    // Penalty for negative unexpected consequences
    score -= outcome.unexpectedConsequences.filter(c => c.impact === 'NEGATIVE').length * 0.3;

    return score;
  }

  private extractDecisionPattern(outcome: DecisionOutcome): string {
    const parts: string[] = [];

    parts.push(outcome.decisionType);
    parts.push(outcome.context.informationAvailability);
    parts.push(outcome.context.timePressure);
    parts.push(outcome.context.stakes);

    return parts.join('_');
  }

  private describePattern(pattern: string, example: DecisionOutcome): string {
    const parts = pattern.split('_');
    return `${parts[0]} decision with ${parts[1].toLowerCase()} information, ${parts[2].toLowerCase()} time pressure, ${parts[3].toLowerCase()} stakes`;
  }

  private inferCounterfactualScenario(decision: CareerDecision, alternative: string, journey: CareerJourney): string {
    // Simple heuristic-based counterfactual
    const actualPositive = decision.actualOutcome.positive;

    if (actualPositive) {
      return `Alternative "${alternative}" likely would have resulted in slower progress or missed opportunity`;
    } else {
      return `Alternative "${alternative}" might have avoided the negative outcome, but certainty is low`;
    }
  }

  private identifyCounterfactualDifferences(decision: CareerDecision, alternative: string, journey: CareerJourney): string[] {
    return [
      'Different immediate outcomes',
      'Altered subsequent decision points',
      'Changed network connections',
      'Different skill development path',
    ];
  }

  private assessActualDecisionQuality(decision: CareerDecision, journey: CareerJourney): boolean {
    // Check if subsequent career was successful
    const subsequentSuccess = journey.successes.some(s =>
      s.timestamp.getTime() > decision.timestamp.getTime()
    );

    return decision.actualOutcome.positive || subsequentSuccess;
  }

  private findSimilarDecisions(
    decision: { type: DecisionType; description: string; context: Partial<DecisionContext> },
    historicalDecisions: DecisionOutcome[]
  ): DecisionOutcome[] {
    return historicalDecisions.filter(h => {
      // Type match
      if (h.decisionType !== decision.type) return false;

      // Description similarity (simple keyword check)
      const descWords = decision.description.toLowerCase().split(' ');
      const historicalWords = h.decision.toLowerCase().split(' ');
      const commonWords = descWords.filter(w => historicalWords.includes(w));

      return commonWords.length >= 2;
    });
  }

  private generatePredictionSnapshot(similarCases: DecisionOutcome[], successRate: number): OutcomeSnapshot {
    const assessment: OutcomeSnapshot['assessment'] =
      successRate >= 0.7 ? 'GOOD' :
      successRate >= 0.5 ? 'NEUTRAL' : 'POOR';

    return {
      timeframe: '0-2 years (predicted)',
      assessment,
      careerProgression: { level: successRate >= 0.5 ? 'PROGRESSED' : 'MAINTAINED', details: 'Predicted based on similar cases' },
      financialOutcome: { level: successRate >= 0.6 ? 'IMPROVED' : 'MAINTAINED', details: 'Predicted' },
      satisfactionOutcome: { level: 'NEUTRAL', details: 'Uncertain' },
      skillOutcome: { level: 'GAINED', details: 'New skills likely acquired' },
      networkOutcome: { level: 'EXPANDED', details: 'Network likely expanded' },
      matchedExpectations: false,
      surprises: ['Prediction based on historical patterns'],
    };
  }

  private extractRiskFactors(similarCases: DecisionOutcome[]): string[] {
    const risks = new Set<string>();

    for (const case_ of similarCases.filter(c => c.shortTermOutcome.assessment === 'POOR')) {
      if (case_.context.informationAvailability === 'LIMITED') {
        risks.add('Limited information');
      }
      if (case_.context.timePressure === 'URGENT') {
        risks.add('Time pressure');
      }
    }

    return Array.from(risks);
  }

  private extractSuccessFactors(similarCases: DecisionOutcome[]): string[] {
    const factors = new Set<string>();

    for (const case_ of similarCases.filter(c => c.shortTermOutcome.assessment === 'EXCELLENT' || c.shortTermOutcome.assessment === 'GOOD')) {
      if (case_.context.informationAvailability === 'SUBSTANTIAL') {
        factors.add('Thorough research');
      }
      if (case_.alternativesConsidered.length > 0) {
        factors.add('Considered alternatives');
      }
    }

    return Array.from(factors);
  }

  private generateDecisionRecommendation(successRate: number, risks: string[], factors: string[]): string {
    if (successRate >= 0.7) {
      return 'Historical data strongly supports this decision. Proceed with confidence.';
    } else if (successRate >= 0.5) {
      return 'Mixed historical outcomes. Mitigate identified risks and leverage success factors.';
    } else {
      return 'Historical data suggests caution. Consider alternatives or gather more information.';
    }
  }

  private extractTransferableInsights(a: DecisionOutcome, b: DecisionOutcome): string[] {
    const insights: string[] = [];

    if (a.context.informationAvailability === b.context.informationAvailability) {
      insights.push(`Information availability (${a.context.informationAvailability}) affects outcomes consistently`);
    }

    if (a.unexpectedConsequences.length > 0 || b.unexpectedConsequences.length > 0) {
      insights.push('Unexpected consequences are common - build flexibility');
    }

    return insights;
  }

  private generateOutcomeId(): DecisionOutcomeId {
    return `outcome_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as DecisionOutcomeId;
  }
}
