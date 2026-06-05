/**
 * CareerOS Outcome Tracking System - Quality Engine
 *
 * Phase 8.9: Outcome Tracking System
 *
 * Evaluates outcome quality, classifies outcomes, and assesses
 * holistic success across multiple dimensions.
 *
 * @module intelligence/outcome-tracking
 * @version 1.0.0
 */

import {
  type StudentOutcomeRecord,
  type OutcomeQualityAssessment,
  type OutcomeClassification,
  type OutcomeQuality,
  type IQualityEngine,
  type GrowthDimension,
} from './outcome-types.js';

// ============================================================================
// QUALITY TYPES
// ============================================================================

/** Quality factors breakdown */
export interface QualityFactors {
  careerSuccess: number;
  educationSuccess: number;
  psychologicalWellbeing: number;
  personalGrowth: number;
  sustainability: number;
  alignment: number;
}

/** Outcome pattern detection */
export interface OutcomePattern {
  pattern: 'STEADY_SUCCESS' | 'DELAYED_SUCCESS' | 'INITIAL_STRUGGLE' | 'DECLINE' | 'RECOVERY' | 'MIXED';
  confidence: number;
  evidence: string[];
  trajectory: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
}

/** Long-term outcome projection */
export interface LongTermProjection {
  currentQuality: OutcomeQuality;
  projectedQuality: OutcomeQuality;
  confidence: number;
  trajectory: 'IMPROVING' | 'STABLE' | 'DECLINING';
  keyFactors: string[];
  riskFactors: string[];
  opportunities: string[];
}

/** Holistic assessment breakdown */
export interface HolisticAssessment {
  career: {
    score: number;
    status: 'THRIVING' | 'SUCCESSFUL' | 'ADEQUATE' | 'STRUGGLING' | 'CRITICAL';
    indicators: string[];
  };
  education: {
    score: number;
    status: 'EXCELLENT' | 'GOOD' | 'ADEQUATE' | 'CHALLENGED' | 'AT_RISK';
    indicators: string[];
  };
  psychological: {
    score: number;
    status: 'FLOURISHING' | 'HEALTHY' | 'STABLE' | 'STRESSED' | 'DISTRESSED';
    indicators: string[];
  };
  social: {
    score: number;
    status: 'STRONG' | 'GOOD' | 'ADEQUATE' | 'LIMITED' | 'ISOLATED';
    indicators: string[];
  };
  financial: {
    score: number;
    status: 'SECURE' | 'STABLE' | 'ADEQUATE' | 'PRECARIOUS' | 'CRITICAL';
    indicators: string[];
  };
}

// ============================================================================
// QUALITY ENGINE IMPLEMENTATION
// ============================================================================

/**
 * Quality Engine
 *
 * Evaluates and classifies outcome quality across multiple dimensions.
 */
export class QualityEngine implements IQualityEngine {
  /**
   * Assess overall outcome quality
   */
  assessOutcomeQuality(record: StudentOutcomeRecord): OutcomeQualityAssessment {
    const factors = this.assessQualityFactors(record);

    // Calculate weighted scores
    const careerOutcome = factors.careerSuccess;
    const educationOutcome = factors.educationSuccess;
    const psychologicalOutcome = factors.psychologicalWellbeing;
    const growthOutcome = factors.personalGrowth;

    // Calculate holistic score (weighted average)
    const holisticScore =
      careerOutcome * 0.25 +
      educationOutcome * 0.20 +
      psychologicalOutcome * 0.25 +
      growthOutcome * 0.20 +
      factors.sustainability * 0.10;

    // Calculate sustainability score
    const sustainabilityScore = factors.sustainability;

    // Determine overall quality
    const overallQuality = this.determineOverallQuality(holisticScore, factors);

    // Generate explanation
    const explanation = this.generateQualityExplanation(factors, overallQuality);

    return {
      overallQuality,
      careerOutcome,
      educationOutcome,
      psychologicalOutcome,
      growthOutcome,
      holisticScore,
      sustainabilityScore,
      explanation,
    };
  }

  /**
   * Classify specific outcome
   */
  classifyOutcome(outcome: unknown): OutcomeClassification {
    const quality = this.assessSingleOutcomeQuality(outcome);
    const type = this.classifyOutcomeType(outcome, quality);
    const timeframe = this.determineTimeframe(outcome);
    const unexpectedness = this.calculateUnexpectedness(outcome, quality);
    const factors = this.identifyOutcomeFactors(outcome);
    const lessons = this.extractLessons(outcome, quality);

    return {
      quality,
      type,
      timeframe,
      unexpectedness,
      factors,
      lessons,
    };
  }

  /**
   * Calculate holistic score
   */
  calculateHolisticScore(record: StudentOutcomeRecord): number {
    const factors = this.assessQualityFactors(record);

    return (
      factors.careerSuccess * 0.25 +
      factors.educationSuccess * 0.20 +
      factors.psychologicalWellbeing * 0.25 +
      factors.personalGrowth * 0.20 +
      factors.sustainability * 0.10
    );
  }

  /**
   * Assess quality factors in detail
   */
  assessQualityFactors(record: StudentOutcomeRecord): QualityFactors {
    return {
      careerSuccess: this.assessCareerSuccess(record),
      educationSuccess: this.assessEducationSuccess(record),
      psychologicalWellbeing: this.assessPsychologicalWellbeing(record),
      personalGrowth: this.assessPersonalGrowth(record),
      sustainability: this.assessSustainability(record),
      alignment: this.assessAlignment(record),
    };
  }

  /**
   * Detect outcome patterns
   */
  detectPatterns(record: StudentOutcomeRecord): OutcomePattern {
    const patterns: OutcomePattern['pattern'][] = [];
    const evidence: string[] = [];

    // Check for steady success
    const hasConsistentGrowth = record.growth.snapshots.length >= 3 &&
      record.growth.snapshots.every((s, i, arr) =>
        i === 0 || s.overallScore >= arr[i - 1].overallScore - 5
      );

    if (hasConsistentGrowth) {
      patterns.push('STEADY_SUCCESS');
      evidence.push('Consistent growth across all measurements');
    }

    // Check for delayed success
    const hasDelayedSuccess = record.growth.snapshots.length >= 3 &&
      record.growth.snapshots[0].overallScore < 50 &&
      record.growth.snapshots[record.growth.snapshots.length - 1].overallScore > 70;

    if (hasDelayedSuccess) {
      patterns.push('DELAYED_SUCCESS');
      evidence.push('Strong improvement from low baseline');
    }

    // Check for initial struggle
    const hasInitialStruggle = record.timeline.some((e, i) =>
      i < 3 && ['SETBACK_EXPERIENCED', 'PIVOT_CONSIDERED'].includes(e.eventType)
    );

    if (hasInitialStruggle) {
      patterns.push('INITIAL_STRUGGLE');
      evidence.push('Early setbacks followed by adaptation');
    }

    // Check for decline
    const hasDecline = record.growth.snapshots.length >= 3 &&
      record.growth.snapshots[0].overallScore > 70 &&
      record.growth.snapshots[record.growth.snapshots.length - 1].overallScore < 50;

    if (hasDecline) {
      patterns.push('DECLINE');
      evidence.push('Overall decline in growth metrics');
    }

    // Check for recovery
    const hasRecovery = record.timeline.some(e => e.eventType === 'RECOVERY_ACHIEVED');

    if (hasRecovery) {
      patterns.push('RECOVERY');
      evidence.push('Documented recovery from setback');
    }

    // Default to mixed if no clear pattern
    if (patterns.length === 0) {
      patterns.push('MIXED');
      evidence.push('Mixed results without clear pattern');
    }

    // Determine primary pattern (most recent or most significant)
    const primaryPattern = patterns[patterns.length - 1];

    // Calculate trajectory
    let trajectory: OutcomePattern['trajectory'] = 'NEUTRAL';
    if (record.growth.snapshots.length >= 2) {
      const first = record.growth.snapshots[0].overallScore;
      const last = record.growth.snapshots[record.growth.snapshots.length - 1].overallScore;
      if (last > first + 10) trajectory = 'POSITIVE';
      else if (last < first - 10) trajectory = 'NEGATIVE';
    }

    return {
      pattern: primaryPattern,
      confidence: patterns.length > 1 ? 0.7 : 0.9,
      evidence,
      trajectory,
    };
  }

  /**
   * Generate long-term projection
   */
  generateLongTermProjection(record: StudentOutcomeRecord): LongTermProjection {
    const currentAssessment = this.assessOutcomeQuality(record);
    const pattern = this.detectPatterns(record);

    // Project future quality based on current trajectory
    let projectedQuality: OutcomeQuality = currentAssessment.overallQuality;
    let trajectory: LongTermProjection['trajectory'] = 'STABLE';

    switch (pattern.trajectory) {
      case 'POSITIVE':
        projectedQuality = this.improveQuality(currentAssessment.overallQuality);
        trajectory = 'IMPROVING';
        break;
      case 'NEGATIVE':
        projectedQuality = this.degradeQuality(currentAssessment.overallQuality);
        trajectory = 'DECLINING';
        break;
      default:
        trajectory = 'STABLE';
    }

    // Identify key factors
    const keyFactors = this.identifyKeySuccessFactors(record);
    const riskFactors = this.identifyRiskFactors(record);
    const opportunities = this.identifyOpportunities(record);

    return {
      currentQuality: currentAssessment.overallQuality,
      projectedQuality,
      confidence: pattern.confidence * 0.8, // Reduce confidence for future predictions
      trajectory,
      keyFactors,
      riskFactors,
      opportunities,
    };
  }

  /**
   * Generate holistic assessment
   */
  generateHolisticAssessment(record: StudentOutcomeRecord): HolisticAssessment {
    return {
      career: this.assessCareerHolistically(record),
      education: this.assessEducationHolistically(record),
      psychological: this.assessPsychologicalHolistically(record),
      social: this.assessSocialHolistically(record),
      financial: this.assessFinancialHolistically(record),
    };
  }

  // ============================================================================
  // PRIVATE ASSESSMENT METHODS
  // ============================================================================

  private assessCareerSuccess(record: StudentOutcomeRecord): number {
    let score = 50; // Neutral baseline

    // Job outcomes
    if (record.outcomes.jobs.length > 0) {
      const jobScores = record.outcomes.jobs.map(j => {
        let s = j.satisfaction.overall;
        if (j.retention.currentStatus === 'ACTIVE') s += 10;
        if (j.growth.promotions > 0) s += 10;
        return Math.min(100, s);
      });
      score = jobScores.reduce((a, b) => a + b, 0) / jobScores.length;
    }

    // Internship outcomes
    if (record.outcomes.internships.length > 0) {
      const internshipScore = record.outcomes.internships.reduce((sum, i) =>
        sum + i.satisfaction + (i.conversionToFullTime ? 20 : 0), 0
      ) / record.outcomes.internships.length;
      score = (score + internshipScore) / 2;
    }

    // Exploration outcomes
    if (record.outcomes.explorations.length > 0) {
      const explorationScore = record.outcomes.explorations.reduce((sum, e) =>
        sum + (e.decisionImpact === 'CONFIRMED' ? 80 : 60), 0
      ) / record.outcomes.explorations.length;
      score = (score + explorationScore) / 2;
    }

    return Math.min(100, Math.max(0, score));
  }

  private assessEducationSuccess(record: StudentOutcomeRecord): number {
    if (record.outcomes.education.length === 0) return 50;

    const scores = record.outcomes.education.map(e => {
      let s = 50;

      // Performance
      if (e.performance.actual === 'EXCELLENT') s = 95;
      else if (e.performance.actual === 'GOOD') s = 80;
      else if (e.performance.actual === 'AVERAGE') s = 60;
      else if (e.performance.actual === 'BELOW_AVERAGE') s = 40;

      // Completion
      if (e.completionStatus === 'COMPLETED') s += 10;
      else if (e.completionStatus === 'DROPPED_OUT') s -= 20;

      // Skills acquired
      s += Math.min(15, e.skillOutcomes.length * 3);

      return Math.min(100, s);
    });

    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  private assessPsychologicalWellbeing(record: StudentOutcomeRecord): number {
    const confidence = record.psychological.confidence;
    const clarity = record.psychological.clarity;
    const wellbeing = record.psychological.wellbeing;

    // Get latest measurements
    const confidenceScore = confidence.measurements[confidence.measurements.length - 1]?.value ?? confidence.baseline;
    const clarityScore = clarity.measurements[clarity.measurements.length - 1]?.value ?? clarity.baseline;
    const wellbeingScore = wellbeing.measurements[wellbeing.measurements.length - 1]?.value ?? wellbeing.baseline;

    // Weight by trend
    const confidenceWeight = confidence.trend === 'IMPROVING' ? 1.1 : confidence.trend === 'DECLINING' ? 0.9 : 1;
    const clarityWeight = clarity.trend === 'IMPROVING' ? 1.1 : clarity.trend === 'DECLINING' ? 0.9 : 1;
    const wellbeingWeight = wellbeing.trend === 'IMPROVING' ? 1.1 : wellbeing.trend === 'DECLINING' ? 0.9 : 1;

    const weightedScore =
      (confidenceScore * confidenceWeight * 0.3) +
      (clarityScore * clarityWeight * 0.35) +
      (wellbeingScore * wellbeingWeight * 0.35);

    return Math.min(100, Math.max(0, weightedScore));
  }

  private assessPersonalGrowth(record: StudentOutcomeRecord): number {
    const profile = record.growth.profile;

    // Calculate average growth across dimensions
    const growthScores = Array.from(profile.measurements.values()).map(m => {
      const changePercent = Math.abs(m.changePercent);
      return Math.min(100, 50 + changePercent); // Base 50 + growth
    });

    if (growthScores.length === 0) return 50;

    const avgGrowth = growthScores.reduce((a, b) => a + b, 0) / growthScores.length;

    // Factor in growth velocity
    const velocityBonus = Math.min(20, profile.growthVelocity * 2);

    return Math.min(100, avgGrowth + velocityBonus);
  }

  private assessSustainability(record: StudentOutcomeRecord): number {
    let score = 70; // Default reasonable sustainability

    // Check for stress events
    const stressEvents = record.psychological.wellbeing.stressEvents;
    if (stressEvents.length > 3) {
      score -= (stressEvents.length - 3) * 5;
    }

    // Check for consistency in growth
    if (record.growth.snapshots.length >= 3) {
      const scores = record.growth.snapshots.map(s => s.overallScore);
      const variance = this.calculateVariance(scores);
      if (variance > 100) score -= 10; // High volatility reduces sustainability
    }

    // Check support system
    if (record.psychological.wellbeing.supportSystemEffectiveness > 70) {
      score += 10;
    }

    // Check timeline stability
    const setbacks = record.timeline.filter(e => e.eventType === 'SETBACK_EXPERIENCED').length;
    score -= setbacks * 5;

    return Math.min(100, Math.max(0, score));
  }

  private assessAlignment(record: StudentOutcomeRecord): number {
    // Assess alignment between initial goals and outcomes
    let score = 60; // Moderate baseline

    const decisions = record.outcomes.careerDecisions;
    if (decisions.length > 0) {
      const alignedDecisions = decisions.filter(d => d.wasRecommended).length;
      score = (alignedDecisions / decisions.length) * 100;
    }

    // Check if satisfaction matches expectations
    if (record.outcomes.jobs.length > 0) {
      const satisfactionAligned = record.outcomes.jobs.filter(j =>
        j.satisfaction.overall > 70
      ).length;
      score = (score + (satisfactionAligned / record.outcomes.jobs.length) * 100) / 2;
    }

    return Math.min(100, score);
  }

  // ============================================================================
  // CLASSIFICATION METHODS
  // ============================================================================

  private assessSingleOutcomeQuality(outcome: unknown): OutcomeQuality {
    if (!outcome || typeof outcome !== 'object') return 'SATISFACTORY';

    const obj = outcome as Record<string, unknown>;

    // Extract quality indicators
    let score = 50;

    if (typeof obj.satisfaction === 'number') {
      score = obj.satisfaction;
    } else if (typeof obj.success === 'boolean') {
      score = obj.success ? 80 : 30;
    } else if (typeof obj.outcomeQuality === 'string') {
      const qualityMap: Record<string, number> = {
        'EXCEEDED': 95,
        'MET': 75,
        'PARTIAL': 50,
        'BELOW': 25,
      };
      score = qualityMap[obj.outcomeQuality] ?? 50;
    }

    return this.scoreToQuality(score);
  }

  private classifyOutcomeType(outcome: unknown, quality: OutcomeQuality): OutcomeClassification['type'] {
    if (!outcome || typeof outcome !== 'object') return 'MIXED';

    const obj = outcome as Record<string, unknown>;

    // Check for explicit classification
    if (obj.outcome === 'SUCCESSFUL') return 'POSITIVE';
    if (obj.outcome === 'UNSUCCESSFUL') return 'NEGATIVE';
    if (obj.outcome === 'PARTIAL') return 'MIXED';

    // Infer from quality
    if (['EXCEPTIONAL', 'EXCELLENT', 'GOOD'].includes(quality)) return 'POSITIVE';
    if (['BELOW_EXPECTATIONS', 'POOR', 'NEGATIVE'].includes(quality)) return 'NEGATIVE';

    // Check for unexpectedness
    if (obj.wasRecommended === false && ['EXCELLENT', 'EXCEPTIONAL', 'GOOD'].includes(quality)) return 'UNEXPECTED';
    if (obj.wasRecommended === true && ['BELOW_EXPECTATIONS', 'POOR', 'NEGATIVE'].includes(quality)) return 'UNEXPECTED';

    return 'MIXED';
  }

  private determineTimeframe(outcome: unknown): OutcomeClassification['timeframe'] {
    if (!outcome || typeof outcome !== 'object') return 'MEDIUM_TERM';

    const obj = outcome as Record<string, unknown>;

    if (typeof obj.duration === 'number') {
      const days = obj.duration;
      if (days < 30) return 'SHORT_TERM';
      if (days < 365) return 'MEDIUM_TERM';
      return 'LONG_TERM';
    }

    if (typeof obj.timeline === 'object' && obj.timeline !== null) {
      const timeline = obj.timeline as Record<string, number>;
      if (timeline.decisionDate && timeline.firstOutcomeDate) {
        const diff = timeline.firstOutcomeDate - timeline.decisionDate;
        const days = diff / (1000 * 60 * 60 * 24);
        if (days < 30) return 'SHORT_TERM';
        if (days < 365) return 'MEDIUM_TERM';
      }
    }

    return 'MEDIUM_TERM';
  }

  private calculateUnexpectedness(outcome: unknown, quality: OutcomeQuality): number {
    if (!outcome || typeof outcome !== 'object') return 50;

    const obj = outcome as Record<string, unknown>;
    let unexpectedness = 0;

    // High quality when not recommended is unexpected
    if (obj.wasRecommended === false && ['EXCELLENT', 'GOOD'].includes(quality)) {
      unexpectedness += 40;
    }

    // Poor quality when recommended is unexpected
    if (obj.wasRecommended === true && ['POOR', 'NEGATIVE'].includes(quality)) {
      unexpectedness += 40;
    }

    // Very fast success is unexpected
    if (typeof obj.applicationToOfferTimeline === 'number' &&
        obj.applicationToOfferTimeline < 7) {
      unexpectedness += 20;
    }

    return Math.min(100, unexpectedness);
  }

  private identifyOutcomeFactors(outcome: unknown): OutcomeClassification['factors'] {
    const contributing: string[] = [];
    const hindering: string[] = [];
    const unexpected: string[] = [];

    if (!outcome || typeof outcome !== 'object') {
      return { contributing, hindering, unexpected };
    }

    const obj = outcome as Record<string, unknown>;

    // Identify contributing factors
    if (obj.wasRecommended === true) contributing.push('Followed system recommendation');
    if (obj.learningOutcomes && Array.isArray(obj.learningOutcomes) && obj.learningOutcomes.length > 0) {
      contributing.push('Strong learning outcomes');
    }
    if (obj.skillDevelopment && Array.isArray(obj.skillDevelopment) && obj.skillDevelopment.length > 0) {
      contributing.push('Skill development');
    }

    // Identify hindering factors
    if (obj.completionStatus === 'DROPPED_OUT') hindering.push('Did not complete');
    if (obj.wouldRecommend === false) hindering.push('Would not recommend');

    // Identify unexpected factors
    if (obj.wasRecommended === false && obj.satisfaction && typeof obj.satisfaction === 'number' && obj.satisfaction > 80) {
      unexpected.push('High satisfaction despite not following recommendation');
    }

    return { contributing, hindering, unexpected };
  }

  private extractLessons(outcome: unknown, quality: OutcomeQuality): string[] {
    const lessons: string[] = [];

    if (['EXCELLENT', 'GOOD'].includes(quality)) {
      lessons.push('The chosen path led to positive outcomes');
    } else if (['POOR', 'NEGATIVE'].includes(quality)) {
      lessons.push('The chosen path did not meet expectations');
    }

    if (!outcome || typeof outcome !== 'object') return lessons;

    const obj = outcome as Record<string, unknown>;

    if (obj.wasRecommended === false) {
      lessons.push('Student chose a different path than recommended');
    }

    if (obj.wouldChooseAgain === false) {
      lessons.push('Student would make a different choice in hindsight');
    }

    return lessons;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private determineOverallQuality(holisticScore: number, factors: QualityFactors): OutcomeQuality {
    // Consider both holistic score and factor balance
    const factorScores = [
      factors.careerSuccess,
      factors.educationSuccess,
      factors.psychologicalWellbeing,
      factors.personalGrowth,
    ];

    const minFactor = Math.min(...factorScores);
    const maxFactor = Math.max(...factorScores);
    const factorSpread = maxFactor - minFactor;

    // If large spread, might be mixed
    if (factorSpread > 40 && holisticScore > 70) {
      return 'MIXED';
    }

    return this.scoreToQuality(holisticScore);
  }

  private scoreToQuality(score: number): OutcomeQuality {
    if (score >= 95) return 'EXCEPTIONAL';
    if (score >= 85) return 'EXCELLENT';
    if (score >= 70) return 'GOOD';
    if (score >= 55) return 'SATISFACTORY';
    if (score >= 40) return 'MIXED';
    if (score >= 25) return 'BELOW_EXPECTATIONS';
    if (score >= 10) return 'POOR';
    return 'NEGATIVE';
  }

  private improveQuality(quality: OutcomeQuality): OutcomeQuality {
    const order: OutcomeQuality[] = [
      'NEGATIVE', 'POOR', 'BELOW_EXPECTATIONS', 'MIXED',
      'SATISFACTORY', 'GOOD', 'EXCELLENT', 'EXCEPTIONAL'
    ];
    const index = order.indexOf(quality);
    return index < order.length - 1 ? order[index + 1] : quality;
  }

  private degradeQuality(quality: OutcomeQuality): OutcomeQuality {
    const order: OutcomeQuality[] = [
      'NEGATIVE', 'POOR', 'BELOW_EXPECTATIONS', 'MIXED',
      'SATISFACTORY', 'GOOD', 'EXCELLENT', 'EXCEPTIONAL'
    ];
    const index = order.indexOf(quality);
    return index > 0 ? order[index - 1] : quality;
  }

  private generateQualityExplanation(factors: QualityFactors, quality: OutcomeQuality): string {
    const parts: string[] = [];

    parts.push(`Overall outcome quality: ${quality.replace('_', ' ').toLowerCase()}.`);

    // Strongest area
    const entries = Object.entries(factors);
    entries.sort((a, b) => b[1] - a[1]);
    parts.push(`Strongest area: ${entries[0][0].replace(/([A-Z])/g, ' $1').toLowerCase().trim()}.`);

    // Weakest area
    parts.push(`Area for improvement: ${entries[entries.length - 1][0].replace(/([A-Z])/g, ' $1').toLowerCase().trim()}.`);

    return parts.join(' ');
  }

  private identifyKeySuccessFactors(record: StudentOutcomeRecord): string[] {
    const factors: string[] = [];

    if (record.outcomes.explorations.length > 2) {
      factors.push('Thorough exploration before decisions');
    }

    if (record.psychological.wellbeing.supportSystemEffectiveness > 70) {
      factors.push('Strong support system');
    }

    if (record.growth.profile.measurements.get('RESILIENCE' as GrowthDimension)?.current ?? 0 > 70) {
      factors.push('High resilience');
    }

    return factors;
  }

  private identifyRiskFactors(record: StudentOutcomeRecord): string[] {
    const risks: string[] = [];

    if (record.psychological.wellbeing.stressEvents.length > 3) {
      risks.push('Multiple stress events');
    }

    if (record.psychological.wellbeing.supportSystemEffectiveness < 40) {
      risks.push('Limited support system');
    }

    if (record.outcomes.careerDecisions.some(d => d.wouldChooseAgain === false)) {
      risks.push('Previous decision regret');
    }

    return risks;
  }

  private identifyOpportunities(record: StudentOutcomeRecord): string[] {
    const opportunities: string[] = [];

    const unexploredDimensions = Array.from(record.growth.profile.measurements.entries())
      .filter(([, m]) => m.current < 60)
      .map(([d]) => d);

    if (unexploredDimensions.length > 0) {
      opportunities.push(`Growth potential in: ${unexploredDimensions.slice(0, 3).join(', ')}`);
    }

    if (record.outcomes.skills.length < 3) {
      opportunities.push('Additional skill development');
    }

    return opportunities;
  }

  private calculateVariance(values: number[]): number {
    if (values.length < 2) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  }

  // ============================================================================
  // HOLISTIC ASSESSMENT HELPERS
  // ============================================================================

  private assessCareerHolistically(record: StudentOutcomeRecord): HolisticAssessment['career'] {
    const score = this.assessCareerSuccess(record);
    const indicators: string[] = [];

    let status: HolisticAssessment['career']['status'] = 'ADEQUATE';
    if (score >= 90) status = 'THRIVING';
    else if (score >= 75) status = 'SUCCESSFUL';
    else if (score >= 50) status = 'ADEQUATE';
    else if (score >= 30) status = 'STRUGGLING';
    else status = 'CRITICAL';

    if (record.outcomes.jobs.some(j => j.retention.currentStatus === 'ACTIVE')) {
      indicators.push('Currently employed');
    }
    if (record.outcomes.jobs.some(j => j.growth.promotions > 0)) {
      indicators.push('Career progression');
    }

    return { score, status, indicators };
  }

  private assessEducationHolistically(record: StudentOutcomeRecord): HolisticAssessment['education'] {
    const score = this.assessEducationSuccess(record);
    const indicators: string[] = [];

    let status: HolisticAssessment['education']['status'] = 'ADEQUATE';
    if (score >= 90) status = 'EXCELLENT';
    else if (score >= 75) status = 'GOOD';
    else if (score >= 50) status = 'ADEQUATE';
    else if (score >= 30) status = 'CHALLENGED';
    else status = 'AT_RISK';

    const completed = record.outcomes.education.filter(e => e.completionStatus === 'COMPLETED').length;
    if (completed > 0) indicators.push(`${completed} education completed`);

    return { score, status, indicators };
  }

  private assessPsychologicalHolistically(record: StudentOutcomeRecord): HolisticAssessment['psychological'] {
    const score = this.assessPsychologicalWellbeing(record);
    const indicators: string[] = [];

    let status: HolisticAssessment['psychological']['status'] = 'STABLE';
    if (score >= 90) status = 'FLOURISHING';
    else if (score >= 75) status = 'HEALTHY';
    else if (score >= 50) status = 'STABLE';
    else if (score >= 30) status = 'STRESSED';
    else status = 'DISTRESSED';

    if (record.psychological.confidence.trend === 'IMPROVING') {
      indicators.push('Growing confidence');
    }
    if (record.psychological.clarity.trend === 'IMPROVING') {
      indicators.push('Increasing clarity');
    }

    return { score, status, indicators };
  }

  private assessSocialHolistically(record: StudentOutcomeRecord): HolisticAssessment['social'] {
    // Infer from exploration and mentorship outcomes
    let score = 50;
    const indicators: string[] = [];

    if (record.outcomes.explorations.length > 0) {
      score += Math.min(20, record.outcomes.explorations.length * 5);
      indicators.push('Active network building');
    }

    let status: HolisticAssessment['social']['status'] = 'ADEQUATE';
    if (score >= 90) status = 'STRONG';
    else if (score >= 75) status = 'GOOD';
    else if (score >= 50) status = 'ADEQUATE';
    else if (score >= 30) status = 'LIMITED';
    else status = 'ISOLATED';

    return { score, status, indicators };
  }

  private assessFinancialHolistically(record: StudentOutcomeRecord): HolisticAssessment['financial'] {
    // Infer from job outcomes
    let score = 50;
    const indicators: string[] = [];

    if (record.outcomes.jobs.length > 0) {
      const avgSatisfaction = record.outcomes.jobs.reduce((sum, j) =>
        sum + j.satisfaction.compensation, 0
      ) / record.outcomes.jobs.length;
      score = avgSatisfaction;

      if (record.outcomes.jobs.some(j => j.package.ctc > 10)) {
        indicators.push('Above-average compensation');
      }
    }

    let status: HolisticAssessment['financial']['status'] = 'ADEQUATE';
    if (score >= 90) status = 'SECURE';
    else if (score >= 75) status = 'STABLE';
    else if (score >= 50) status = 'ADEQUATE';
    else if (score >= 30) status = 'PRECARIOUS';
    else status = 'CRITICAL';

    return { score, status, indicators };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create quality engine
 */
export function createQualityEngine(): QualityEngine {
  return new QualityEngine();
}

/**
 * Assess outcome quality (convenience function)
 */
export function assessQuality(record: StudentOutcomeRecord): OutcomeQualityAssessment {
  const engine = createQualityEngine();
  return engine.assessOutcomeQuality(record);
}

/**
 * Classify outcome (convenience function)
 */
export function classify(outcome: unknown): OutcomeClassification {
  const engine = createQualityEngine();
  return engine.classifyOutcome(outcome);
}
