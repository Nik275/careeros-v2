/**
 * CareerOS - Feedback Engine
 *
 * Phase: Outcome Tracking Engine - Sub-Engine
 *
 * Analyzes feedback from decision and outcome events.
 *
 * @module feedback-engine
 * @version 1.0.0
 */

import type {
  DecisionEvent,
  OutcomeEvent,
} from '../types/outcome-tracking-types';

/**
 * Feedback analysis result.
 */
export interface FeedbackAnalysis {
  /** Analysis identifier */
  analysisId: string;

  /** Event analyzed */
  eventId: string;

  /** Analysis timestamp */
  analyzedAt: Date;

  /** Feedback type */
  feedbackType: 'DECISION' | 'OUTCOME';

  /** Key findings */
  findings: FeedbackFinding[];

  /** Recommendations based on feedback */
  recommendations: FeedbackRecommendation[];

  /** Sentiment analysis */
  sentiment: FeedbackSentiment;
}

/**
 * Individual feedback finding.
 */
export interface FeedbackFinding {
  /** Finding category */
  category: 'ALIGNMENT' | 'DIVERGENCE' | 'CONCERN' | 'OPPORTUNITY' | 'RISK';

  /** Finding description */
  description: string;

  /** Severity/importance */
  severity: 'HIGH' | 'MEDIUM' | 'LOW';

  /** Supporting evidence */
  evidence: string[];

  /** Related metrics */
  metrics: Record<string, number>;
}

/**
 * Recommendation based on feedback.
 */
export interface FeedbackRecommendation {
  /** Recommendation type */
  type: 'SYSTEM_IMPROVEMENT' | 'STUDENT_GUIDANCE' | 'DATA_COLLECTION' | 'ALERT';

  /** Recommendation text */
  recommendation: string;

  /** Priority */
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

  /** Expected impact */
  expectedImpact: string;

  /** Implementation approach */
  implementationApproach: string;
}

/**
 * Sentiment analysis of feedback.
 */
export interface FeedbackSentiment {
  /** Overall sentiment score (-100 to 100) */
  overallScore: number;

  /** Sentiment classification */
  classification: 'VERY_POSITIVE' | 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'VERY_NEGATIVE';

  /** Confidence in sentiment analysis */
  confidence: number;

  /** Aspect-based sentiment */
  aspectSentiment: Record<string, {
    score: number;
    classification: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  }>;
}

/**
 * Feedback Engine - Analyzes decision and outcome feedback.
 *
 * Processes feedback from student decisions and outcomes to identify
 * patterns, concerns, and improvement opportunities.
 */
export class FeedbackEngine {
  private analyses: Map<string, FeedbackAnalysis> = new Map();

  /**
   * Analyze a decision event for feedback.
   */
  async analyzeDecision(event: DecisionEvent): Promise<FeedbackAnalysis> {
    const analysisId = `feedback_dec_${event.eventId}_${Date.now()}`;

    const findings = this.extractDecisionFindings(event);
    const recommendations = this.generateDecisionRecommendations(event, findings);
    const sentiment = this.analyzeDecisionSentiment(event);

    const analysis: FeedbackAnalysis = {
      analysisId,
      eventId: event.eventId,
      analyzedAt: new Date(),
      feedbackType: 'DECISION',
      findings,
      recommendations,
      sentiment,
    };

    this.analyses.set(analysisId, analysis);

    return analysis;
  }

  /**
   * Analyze an outcome event for feedback.
   */
  async analyzeOutcome(event: OutcomeEvent): Promise<FeedbackAnalysis> {
    const analysisId = `feedback_out_${event.eventId}_${Date.now()}`;

    const findings = this.extractOutcomeFindings(event);
    const recommendations = this.generateOutcomeRecommendations(event, findings);
    const sentiment = this.analyzeOutcomeSentiment(event);

    const analysis: FeedbackAnalysis = {
      analysisId,
      eventId: event.eventId,
      analyzedAt: new Date(),
      feedbackType: 'OUTCOME',
      findings,
      recommendations,
      sentiment,
    };

    this.analyses.set(analysisId, analysis);

    return analysis;
  }

  /**
   * Get analysis by ID.
   */
  async getAnalysis(analysisId: string): Promise<FeedbackAnalysis | null> {
    return this.analyses.get(analysisId) || null;
  }

  /**
   * Get all analyses for an event.
   */
  async getAnalysesForEvent(eventId: string): Promise<FeedbackAnalysis[]> {
    return Array.from(this.analyses.values()).filter(
      analysis => analysis.eventId === eventId
    );
  }

  /**
   * Get feedback statistics.
   */
  async getStatistics(): Promise<{
    totalAnalyses: number;
    decisionAnalyses: number;
    outcomeAnalyses: number;
    averageSentimentScore: number;
    sentimentDistribution: Record<string, number>;
    topFindingCategories: Array<{ category: string; count: number }>;
    criticalRecommendations: number;
  }> {
    const analyses = Array.from(this.analyses.values());

    const decisionAnalyses = analyses.filter(a => a.feedbackType === 'DECISION').length;
    const outcomeAnalyses = analyses.filter(a => a.feedbackType === 'OUTCOME').length;

    const avgSentiment = analyses.length > 0
      ? analyses.reduce((sum, a) => sum + a.sentiment.overallScore, 0) / analyses.length
      : 0;

    const sentimentDistribution: Record<string, number> = {};
    for (const analysis of analyses) {
      const classification = analysis.sentiment.classification;
      sentimentDistribution[classification] = (sentimentDistribution[classification] || 0) + 1;
    }

    const findingCategories = new Map<string, number>();
    for (const analysis of analyses) {
      for (const finding of analysis.findings) {
        const count = findingCategories.get(finding.category) || 0;
        findingCategories.set(finding.category, count + 1);
      }
    }

    const topFindingCategories = Array.from(findingCategories.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const criticalRecommendations = analyses.reduce(
      (sum, a) => sum + a.recommendations.filter(r => r.priority === 'CRITICAL').length,
      0
    );

    return {
      totalAnalyses: analyses.length,
      decisionAnalyses,
      outcomeAnalyses,
      averageSentimentScore: avgSentiment,
      sentimentDistribution,
      topFindingCategories,
      criticalRecommendations,
    };
  }

  // ============================================================================
  // PRIVATE ANALYSIS METHODS
  // ============================================================================

  private extractDecisionFindings(event: DecisionEvent): FeedbackFinding[] {
    const findings: FeedbackFinding[] = [];

    // Check for low confidence decisions
    if (event.confidence < 40) {
      findings.push({
        category: 'CONCERN',
        description: 'Low confidence decision detected',
        severity: 'HIGH',
        evidence: [`Decision confidence: ${event.confidence}/100`],
        metrics: { confidence: event.confidence },
      });
    }

    // Check for recommendation rejection
    if (!event.selectedOption.matchesRecommendation) {
      findings.push({
        category: 'DIVERGENCE',
        description: 'Student rejected the recommendation',
        severity: 'MEDIUM',
        evidence: [
          `Selected: ${event.selectedOption.careerTitle}`,
          `Relationship: ${event.selectedOption.relationshipToRecommendation}`,
        ],
        metrics: { rejectedOptions: event.rejectedOptions.length },
      });
    }

    // Check for multiple rejections
    if (event.rejectedOptions.length > 3) {
      findings.push({
        category: 'CONCERN',
        description: 'Student rejected multiple options',
        severity: 'MEDIUM',
        evidence: [`Rejected ${event.rejectedOptions.length} options`],
        metrics: { rejectedCount: event.rejectedOptions.length },
      });
    }

    // Check for deliberate decision timeframe
    if (event.rationale.decisionTimeframe === 'MONTHS') {
      findings.push({
        category: 'OPPORTUNITY',
        description: 'Student took extended time to decide',
        severity: 'LOW',
        evidence: ['Decision timeframe: MONTHS'],
        metrics: { timeframeWeight: 1 },
      });
    }

    // Check for external influences
    if (event.rationale.externalInfluences.length > 0) {
      findings.push({
        category: 'ALIGNMENT',
        description: 'External influences affected decision',
        severity: 'LOW',
        evidence: event.rationale.externalInfluences,
        metrics: { externalInfluenceCount: event.rationale.externalInfluences.length },
      });
    }

    return findings;
  }

  private extractOutcomeFindings(event: OutcomeEvent): FeedbackFinding[] {
    const findings: FeedbackFinding[] = [];

    // Check for achievement
    if (event.achievedOutcome) {
      findings.push({
        category: 'ALIGNMENT',
        description: 'Student achieved desired outcome',
        severity: 'HIGH',
        evidence: ['Outcome achieved successfully'],
        metrics: { satisfaction: event.satisfaction.overallSatisfaction },
      });
    } else {
      findings.push({
        category: 'CONCERN',
        description: 'Student did not achieve desired outcome',
        severity: 'HIGH',
        evidence: ['Outcome not achieved'],
        metrics: { satisfaction: event.satisfaction.overallSatisfaction },
      });
    }

    // Check for high satisfaction
    if (event.satisfaction.overallSatisfaction >= 80) {
      findings.push({
        category: 'OPPORTUNITY',
        description: 'High satisfaction outcome - success pattern',
        severity: 'MEDIUM',
        evidence: [`Satisfaction: ${event.satisfaction.overallSatisfaction}/100`],
        metrics: { satisfaction: event.satisfaction.overallSatisfaction },
      });
    }

    // Check for high regret
    if (event.regret.regretLevel > 60) {
      findings.push({
        category: 'RISK',
        description: 'High regret detected',
        severity: 'HIGH',
        evidence: [
          `Regret level: ${event.regret.regretLevel}/100`,
          `Would choose again: ${event.regret.wouldChooseAgain}`,
        ],
        metrics: { regret: event.regret.regretLevel },
      });
    }

    // Check for timeline variance
    if (Math.abs(event.timeline.varianceFromExpectedDays) > 90) {
      findings.push({
        category: 'DIVERGENCE',
        description: 'Significant timeline variance from expected',
        severity: 'MEDIUM',
        evidence: [
          `Variance: ${event.timeline.varianceFromExpectedDays} days`,
          `Expected vs actual timeline mismatch`,
        ],
        metrics: { timelineVariance: event.timeline.varianceFromExpectedDays },
      });
    }

    // Check for utility accuracy
    if (event.utility.utilityAccuracy < 50) {
      findings.push({
        category: 'CONCERN',
        description: 'Low utility prediction accuracy',
        severity: 'MEDIUM',
        evidence: [`Utility accuracy: ${event.utility.utilityAccuracy}/100`],
        metrics: { utilityAccuracy: event.utility.utilityAccuracy },
      });
    }

    // Check for dimension scores
    const lowDimensions = Object.entries(event.dimensions)
      .filter(([, dim]) => dim.score < 40);

    for (const [name, dim] of lowDimensions) {
      findings.push({
        category: 'RISK',
        description: `Low score in ${name} dimension`,
        severity: 'MEDIUM',
        evidence: [`${name} score below threshold`],
        metrics: { score: dim.score },
      });
    }

    return findings;
  }

  private generateDecisionRecommendations(
    event: DecisionEvent,
    findings: FeedbackFinding[]
  ): FeedbackRecommendation[] {
    const recommendations: FeedbackRecommendation[] = [];

    // Low confidence recommendation
    if (event.confidence < 40) {
      recommendations.push({
        type: 'STUDENT_GUIDANCE',
        recommendation: 'Provide additional guidance for low-confidence decisions',
        priority: 'HIGH',
        expectedImpact: 'Improve decision confidence and reduce regret',
        implementationApproach: 'Offer decision support tools and additional information',
      });
    }

    // Recommendation rejection
    if (!event.selectedOption.matchesRecommendation) {
      recommendations.push({
        type: 'SYSTEM_IMPROVEMENT',
        recommendation: 'Analyze why recommendation was rejected',
        priority: 'MEDIUM',
        expectedImpact: 'Improve recommendation relevance',
        implementationApproach: 'Review recommendation algorithm and student profile matching',
      });
    }

    // Multiple rejections
    const rejectionFinding = findings.find(f => f.description.includes('rejected multiple'));
    if (rejectionFinding) {
      recommendations.push({
        type: 'DATA_COLLECTION',
        recommendation: 'Collect detailed feedback on rejected options',
        priority: 'MEDIUM',
        expectedImpact: 'Understand student preferences better',
        implementationApproach: 'Add post-decision feedback survey',
      });
    }

    return recommendations;
  }

  private generateOutcomeRecommendations(
    event: OutcomeEvent,
    findings: FeedbackFinding[]
  ): FeedbackRecommendation[] {
    const recommendations: FeedbackRecommendation[] = [];

    // High regret
    if (event.regret.regretLevel > 60) {
      recommendations.push({
        type: 'ALERT',
        recommendation: 'Flag high-regret outcome for review',
        priority: 'CRITICAL',
        expectedImpact: 'Identify systemic issues causing regret',
        implementationApproach: 'Manual review of case and pattern analysis',
      });
    }

    // Low utility accuracy
    if (event.utility.utilityAccuracy < 50) {
      recommendations.push({
        type: 'SYSTEM_IMPROVEMENT',
        recommendation: 'Review utility prediction model',
        priority: 'HIGH',
        expectedImpact: 'Improve utility prediction accuracy',
        implementationApproach: 'Retrain model with new outcome data',
      });
    }

    // Timeline variance
    if (Math.abs(event.timeline.varianceFromExpectedDays) > 90) {
      recommendations.push({
        type: 'SYSTEM_IMPROVEMENT',
        recommendation: 'Adjust timeline prediction models',
        priority: 'MEDIUM',
        expectedImpact: 'More accurate timeline predictions',
        implementationApproach: 'Update timeline estimation algorithms',
      });
    }

    // Low satisfaction despite achievement
    if (event.achievedOutcome && event.satisfaction.overallSatisfaction < 50) {
      recommendations.push({
        type: 'ALERT',
        recommendation: 'Investigate achievement without satisfaction',
        priority: 'HIGH',
        expectedImpact: 'Understand expectation gaps',
        implementationApproach: 'Follow-up survey on satisfaction drivers',
      });
    }

    return recommendations;
  }

  private analyzeDecisionSentiment(event: DecisionEvent): FeedbackSentiment {
    // Calculate sentiment based on decision characteristics
    let score = 0;

    // Confidence contributes positively
    score += (event.confidence - 50) * 0.5;

    // Matching recommendation is positive
    if (event.selectedOption.matchesRecommendation) {
      score += 20;
    } else {
      score -= 10;
    }

    // Multiple rejections is negative
    score -= event.rejectedOptions.length * 5;

    // Deliberate timeframe is slightly positive
    if (event.rationale.decisionTimeframe === 'MONTHS') {
      score += 5;
    }

    // Clamp to -100 to 100
    score = Math.max(-100, Math.min(100, score));

    let classification: FeedbackSentiment['classification'];
    if (score >= 60) classification = 'VERY_POSITIVE';
    else if (score >= 20) classification = 'POSITIVE';
    else if (score >= -20) classification = 'NEUTRAL';
    else if (score >= -60) classification = 'NEGATIVE';
    else classification = 'VERY_NEGATIVE';

    return {
      overallScore: score,
      classification,
      confidence: 0.7,
      aspectSentiment: {
        confidence: {
          score: (event.confidence - 50) * 2,
          classification: event.confidence > 60 ? 'POSITIVE' : event.confidence < 40 ? 'NEGATIVE' : 'NEUTRAL',
        },
        alignment: {
          score: event.selectedOption.matchesRecommendation ? 50 : -25,
          classification: event.selectedOption.matchesRecommendation ? 'POSITIVE' : 'NEGATIVE',
        },
      },
    };
  }

  private analyzeOutcomeSentiment(event: OutcomeEvent): FeedbackSentiment {
    // Calculate sentiment based on outcome characteristics
    let score = 0;

    // Achievement is positive
    if (event.achievedOutcome) {
      score += 30;
    } else {
      score -= 30;
    }

    // Satisfaction contributes significantly
    score += (event.satisfaction.overallSatisfaction - 50) * 0.8;

    // Regret reduces sentiment
    score -= event.regret.regretLevel * 0.5;

    // Utility accuracy contributes
    score += (event.utility.utilityAccuracy - 50) * 0.3;

    // On-time achievement is positive
    if (event.timeline.onTime) {
      score += 10;
    } else {
      score -= 5;
    }

    // Clamp to -100 to 100
    score = Math.max(-100, Math.min(100, score));

    let classification: FeedbackSentiment['classification'];
    if (score >= 60) classification = 'VERY_POSITIVE';
    else if (score >= 20) classification = 'POSITIVE';
    else if (score >= -20) classification = 'NEUTRAL';
    else if (score >= -60) classification = 'NEGATIVE';
    else classification = 'VERY_NEGATIVE';

    return {
      overallScore: score,
      classification,
      confidence: 0.75,
      aspectSentiment: {
        achievement: {
          score: event.achievedOutcome ? 50 : -50,
          classification: event.achievedOutcome ? 'POSITIVE' : 'NEGATIVE',
        },
        satisfaction: {
          score: (event.satisfaction.overallSatisfaction - 50) * 2,
          classification: event.satisfaction.overallSatisfaction > 60 ? 'POSITIVE' :
            event.satisfaction.overallSatisfaction < 40 ? 'NEGATIVE' : 'NEUTRAL',
        },
        regret: {
          score: -event.regret.regretLevel,
          classification: event.regret.regretLevel > 50 ? 'NEGATIVE' :
            event.regret.regretLevel < 30 ? 'POSITIVE' : 'NEUTRAL',
        },
      },
    };
  }
}
