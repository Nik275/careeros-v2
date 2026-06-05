/**
 * CareerOS Outcome Learning Engine - Decision Learning Engine
 *
 * Phase 9.0: Outcome Learning Engine
 *
 * Learns from decision outcomes to improve decision quality.
 *
 * @module intelligence/outcome-learning
 * @version 1.0.0
 */

import {
  type DecisionLearningEntry,
  type DecisionLearningReport,
  type DecisionQuality,
  type RegretSignal,
  type OpportunitySignal,
  type LearningInsight,
  type IDecisionLearningEngine,
  type OutcomeLearningConfig,
  DEFAULT_OUTCOME_LEARNING_CONFIG,
} from './learning-types.js';

import {
  type StudentId,
} from '../outcome-tracking/outcome-types.js';

// ============================================================================
// DECISION QUALITY ASSESSOR
// ============================================================================

/**
 * Assesses the quality of decisions
 */
class DecisionQualityAssessor {
  /**
   * Assess decision quality
   */
  assess(entry: DecisionLearningEntry): DecisionQuality {
    const { outcome, studentChoice, recommendation } = entry;

    // Perfect alignment and outcome
    if (studentChoice.alignedWithRecommendation && 
        outcome.success && 
        outcome.satisfaction >= 80 &&
        outcome.wouldChooseAgain) {
      return 'EXCELLENT';
    }

    // Good outcome with minor issues
    if (outcome.success && outcome.satisfaction >= 70) {
      return 'GOOD';
    }

    // Adequate outcome
    if (outcome.success && outcome.satisfaction >= 50) {
      return 'ADEQUATE';
    }

    // Poor outcome
    if (!outcome.success || outcome.satisfaction < 50) {
      return 'POOR';
    }

    // Very bad outcome
    if (!outcome.success && outcome.satisfaction < 30 && outcome.regret > 70) {
      return 'BAD';
    }

    return 'ADEQUATE';
  }

  /**
   * Calculate quality score (0-100)
   */
  calculateScore(entry: DecisionLearningEntry): number {
    let score = 50;

    // Alignment bonus
    if (entry.studentChoice.alignedWithRecommendation) {
      score += 15;
    }

    // Success bonus
    if (entry.outcome.success) {
      score += 20;
    }

    // Satisfaction adjustment
    score += (entry.outcome.satisfaction - 50) * 0.3;

    // Regret penalty
    score -= entry.outcome.regret * 0.4;

    // Would choose again bonus
    if (entry.outcome.wouldChooseAgain) {
      score += 10;
    }

    return Math.max(0, Math.min(100, score));
  }
}

// ============================================================================
// REGRET ANALYZER
// ============================================================================

/**
 * Analyzes regret signals from decisions
 */
class RegretAnalyzer {
  /**
   * Analyze regret for a decision
   */
  analyze(entry: DecisionLearningEntry): RegretSignal {
    const regret = entry.outcome.regret;

    if (regret < 20) {
      return {
        present: false,
        intensity: regret,
        causes: [],
        preventable: false,
      };
    }

    const causes = this.identifyRegretCauses(entry);
    const preventable = this.isPreventable(entry, causes);

    return {
      present: true,
      intensity: regret,
      causes,
      preventable,
    };
  }

  private identifyRegretCauses(entry: DecisionLearningEntry): string[] {
    const causes: string[] = [];

    if (!entry.studentChoice.alignedWithRecommendation && !entry.outcome.success) {
      causes.push('DIVERGED_FROM_RECOMMENDATION');
    }

    if (entry.outcome.satisfaction < 50) {
      causes.push('LOW_SATISFACTION');
    }

    if (entry.studentChoice.confidenceAtDecision < 50) {
      causes.push('LOW_CONFIDENCE_AT_DECISION');
    }

    if (!entry.outcome.wouldChooseAgain) {
      causes.push('WOULD_NOT_REPEAT');
    }

    return causes;
  }

  private isPreventable(entry: DecisionLearningEntry, causes: string[]): boolean {
    // Regret is preventable if it was caused by diverging from recommendation
    // and the recommendation would have led to success
    return causes.includes('DIVERGED_FROM_RECOMMENDATION');
  }

  /**
   * Calculate regret rate
   */
  calculateRegretRate(entries: DecisionLearningEntry[]): number {
    if (entries.length === 0) return 0;
    const withRegret = entries.filter(e => e.outcome.regret > 30).length;
    return (withRegret / entries.length) * 100;
  }

  /**
   * Calculate average regret intensity
   */
  calculateAverageIntensity(entries: DecisionLearningEntry[]): number {
    if (entries.length === 0) return 0;
    return entries.reduce((sum, e) => sum + e.outcome.regret, 0) / entries.length;
  }

  /**
   * Calculate preventable regret rate
   */
  calculatePreventableRate(entries: DecisionLearningEntry[]): number {
    const regrets = entries.map(e => this.analyze(e)).filter(r => r.present);
    if (regrets.length === 0) return 0;
    const preventable = regrets.filter(r => r.preventable).length;
    return (preventable / regrets.length) * 100;
  }

  /**
   * Identify top regret causes
   */
  identifyTopCauses(entries: DecisionLearningEntry[]): string[] {
    const causeCounts = new Map<string, number>();

    for (const entry of entries) {
      const signal = this.analyze(entry);
      if (signal.present) {
        for (const cause of signal.causes) {
          causeCounts.set(cause, (causeCounts.get(cause) || 0) + 1);
        }
      }
    }

    return [...causeCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cause]) => cause);
  }
}

// ============================================================================
// OPPORTUNITY ANALYZER
// ============================================================================

/**
 * Analyzes missed opportunities
 */
class OpportunityAnalyzer {
  /**
   * Analyze opportunities for a decision
   */
  analyze(entry: DecisionLearningEntry): OpportunitySignal {
    const missedOpportunities: string[] = [];
    let potentialValue = 0;

    // Check if student diverged from recommendation and regretted it
    if (!entry.studentChoice.alignedWithRecommendation && entry.outcome.regret > 50) {
      missedOpportunities.push('RECOMMENDED_PATH');
      potentialValue += entry.outcome.regret;
    }

    // Check for high regret indicating missed opportunities
    if (entry.outcome.regret > 70) {
      missedOpportunities.push('ALTERNATIVE_OPTIONS');
      potentialValue += entry.outcome.regret * 0.5;
    }

    return {
      present: missedOpportunities.length > 0,
      missedOpportunities,
      potentialValue,
    };
  }

  /**
   * Calculate missed opportunity rate
   */
  calculateMissedRate(entries: DecisionLearningEntry[]): number {
    if (entries.length === 0) return 0;
    const missed = entries.filter(e => {
      const signal = this.analyze(e);
      return signal.present;
    }).length;
    return (missed / entries.length) * 100;
  }

  /**
   * Calculate average missed value
   */
  calculateAverageMissedValue(entries: DecisionLearningEntry[]): number {
    const signals = entries.map(e => this.analyze(e)).filter(s => s.present);
    if (signals.length === 0) return 0;
    return signals.reduce((sum, s) => sum + s.potentialValue, 0) / signals.length;
  }

  /**
   * Identify most commonly missed opportunities
   */
  identifyTopMissed(entries: DecisionLearningEntry[]): string[] {
    const missedCounts = new Map<string, number>();

    for (const entry of entries) {
      const signal = this.analyze(entry);
      for (const opportunity of signal.missedOpportunities) {
        missedCounts.set(opportunity, (missedCounts.get(opportunity) || 0) + 1);
      }
    }

    return [...missedCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([opp]) => opp);
  }
}

// ============================================================================
// PATTERN ANALYZER
// ============================================================================

/**
 * Analyzes decision patterns
 */
class PatternAnalyzer {
  /**
   * Identify best decision types
   */
  identifyBestTypes(entries: DecisionLearningEntry[]): string[] {
    const typeScores = new Map<string, { sum: number; count: number }>();

    for (const entry of entries) {
      const decisionType = entry.context.decisionType || 'UNKNOWN';
      const current = typeScores.get(decisionType) || { sum: 0, count: 0 };
      
      // Calculate quality score
      const qualityScore = entry.outcome.success ? entry.outcome.satisfaction : 0;
      current.sum += qualityScore;
      current.count++;
      
      typeScores.set(decisionType, current);
    }

    return [...typeScores.entries()]
      .map(([type, data]) => ({ type, avg: data.sum / data.count }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 3)
      .map(d => d.type);
  }

  /**
   * Identify worst decision types
   */
  identifyWorstTypes(entries: DecisionLearningEntry[]): string[] {
    const typeScores = new Map<string, { sum: number; count: number }>();

    for (const entry of entries) {
      const decisionType = entry.context.decisionType || 'UNKNOWN';
      const current = typeScores.get(decisionType) || { sum: 0, count: 0 };
      
      const qualityScore = entry.outcome.success ? entry.outcome.satisfaction : 0;
      current.sum += qualityScore;
      current.count++;
      
      typeScores.set(decisionType, current);
    }

    return [...typeScores.entries()]
      .map(([type, data]) => ({ type, avg: data.sum / data.count }))
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 3)
      .map(d => d.type);
  }

  /**
   * Calculate success rate for high confidence decisions
   */
  calculateHighConfidenceSuccessRate(entries: DecisionLearningEntry[]): number {
    const highConfidence = entries.filter(e => e.studentChoice.confidenceAtDecision >= 70);
    if (highConfidence.length === 0) return 0;
    const successful = highConfidence.filter(e => e.outcome.success).length;
    return (successful / highConfidence.length) * 100;
  }

  /**
   * Calculate success rate for low confidence decisions
   */
  calculateLowConfidenceSuccessRate(entries: DecisionLearningEntry[]): number {
    const lowConfidence = entries.filter(e => e.studentChoice.confidenceAtDecision < 50);
    if (lowConfidence.length === 0) return 0;
    const successful = lowConfidence.filter(e => e.outcome.success).length;
    return (successful / lowConfidence.length) * 100;
  }
}

// ============================================================================
// DECISION LEARNING ENGINE
// ============================================================================

/**
 * Decision Learning Engine
 *
 * Tracks and learns from decision outcomes.
 */
class DecisionLearningEngine implements IDecisionLearningEngine {
  private config: OutcomeLearningConfig;
  private qualityAssessor: DecisionQualityAssessor;
  private regretAnalyzer: RegretAnalyzer;
  private opportunityAnalyzer: OpportunityAnalyzer;
  private patternAnalyzer: PatternAnalyzer;
  
  private entries: DecisionLearningEntry[] = [];
  private entriesByDecision: Map<string, DecisionLearningEntry[]> = new Map();
  private entriesByStudent: Map<string, DecisionLearningEntry[]> = new Map();

  constructor(config?: Partial<OutcomeLearningConfig>) {
    this.config = { ...DEFAULT_OUTCOME_LEARNING_CONFIG, ...config };
    this.qualityAssessor = new DecisionQualityAssessor();
    this.regretAnalyzer = new RegretAnalyzer();
    this.opportunityAnalyzer = new OpportunityAnalyzer();
    this.patternAnalyzer = new PatternAnalyzer();
  }

  /**
   * Record a decision learning entry
   */
  recordEntry(entry: DecisionLearningEntry): void {
    // Assess quality
    entry.quality = this.qualityAssessor.assess(entry);
    entry.regretSignal = this.regretAnalyzer.analyze(entry);
    entry.opportunitySignal = this.opportunityAnalyzer.analyze(entry);

    this.entries.push(entry);

    // Index by decision
    const byDecision = this.entriesByDecision.get(entry.decisionId) || [];
    byDecision.push(entry);
    this.entriesByDecision.set(entry.decisionId, byDecision);

    // Index by student
    const byStudent = this.entriesByStudent.get(entry.studentId) || [];
    byStudent.push(entry);
    this.entriesByStudent.set(entry.studentId, byStudent);
  }

  /**
   * Generate decision learning report
   */
  generateReport(period: { start: number; end: number }): DecisionLearningReport {
    const periodEntries = this.entries.filter(
      e => e.timestamp >= period.start && e.timestamp <= period.end
    );

    // Calculate metrics
    const totalDecisions = periodEntries.length;
    const followedRecommendations = periodEntries.filter(e => e.studentChoice.alignedWithRecommendation).length;
    const recommendationFollowRate = totalDecisions > 0 ? (followedRecommendations / totalDecisions) * 100 : 0;

    // Quality metrics
    const qualityCounts = new Map<DecisionQuality, number>();
    for (const entry of periodEntries) {
      qualityCounts.set(entry.quality, (qualityCounts.get(entry.quality) || 0) + 1);
    }

    const qualityScores = periodEntries.map(e => this.qualityAssessor.calculateScore(e));
    const averageQuality = qualityScores.length > 0 
      ? qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length 
      : 0;

    // Regret analysis
    const regretRate = this.regretAnalyzer.calculateRegretRate(periodEntries);
    const averageIntensity = this.regretAnalyzer.calculateAverageIntensity(periodEntries);
    const preventableRate = this.regretAnalyzer.calculatePreventableRate(periodEntries);
    const topCauses = this.regretAnalyzer.identifyTopCauses(periodEntries);

    // Opportunity analysis
    const missedRate = this.opportunityAnalyzer.calculateMissedRate(periodEntries);
    const averageMissedValue = this.opportunityAnalyzer.calculateAverageMissedValue(periodEntries);
    const topMissed = this.opportunityAnalyzer.identifyTopMissed(periodEntries);

    // Patterns
    const patterns = {
      bestDecisionTypes: this.patternAnalyzer.identifyBestTypes(periodEntries),
      worstDecisionTypes: this.patternAnalyzer.identifyWorstTypes(periodEntries),
      highConfidenceSuccessRate: this.patternAnalyzer.calculateHighConfidenceSuccessRate(periodEntries),
      lowConfidenceSuccessRate: this.patternAnalyzer.calculateLowConfidenceSuccessRate(periodEntries),
    };

    return {
      reportId: `rep-${Date.now()}`,
      generatedAt: Date.now(),
      period,
      totalDecisions,
      recommendationFollowRate,
      quality: {
        excellentRate: ((qualityCounts.get('EXCELLENT') || 0) / totalDecisions) * 100,
        goodRate: ((qualityCounts.get('GOOD') || 0) / totalDecisions) * 100,
        poorRate: ((qualityCounts.get('POOR') || 0) + (qualityCounts.get('BAD') || 0)) / totalDecisions * 100,
        averageQuality,
      },
      regret: {
        regretRate,
        averageIntensity,
        preventableRate,
        topCauses,
      },
      opportunities: {
        missedRate,
        averageMissedValue,
        topMissed,
      },
      patterns,
    };
  }

  /**
   * Get decision quality
   */
  getDecisionQuality(decisionId: string): DecisionQuality {
    const entries = this.entriesByDecision.get(decisionId) || [];
    if (entries.length === 0) return 'ADEQUATE';
    return entries[entries.length - 1].quality;
  }

  /**
   * Get regret patterns
   */
  getRegretPatterns(): RegretSignal[] {
    return this.entries
      .map(e => e.regretSignal)
      .filter(r => r.present);
  }

  /**
   * Get entries by decision
   */
  getEntriesByDecision(decisionId: string): DecisionLearningEntry[] {
    return this.entriesByDecision.get(decisionId) || [];
  }

  /**
   * Get entries by student
   */
  getEntriesByStudent(studentId: StudentId): DecisionLearningEntry[] {
    return this.entriesByStudent.get(studentId) || [];
  }

  /**
   * Get all entries
   */
  getAllEntries(): DecisionLearningEntry[] {
    return [...this.entries];
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.entries = [];
    this.entriesByDecision.clear();
    this.entriesByStudent.clear();
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalEntries: number;
    uniqueDecisions: number;
    averageQuality: number;
    regretRate: number;
  } {
    const regretRate = this.regretAnalyzer.calculateRegretRate(this.entries);
    const qualityScores = this.entries.map(e => this.qualityAssessor.calculateScore(e));
    const averageQuality = qualityScores.length > 0 
      ? qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length 
      : 0;

    return {
      totalEntries: this.entries.length,
      uniqueDecisions: this.entriesByDecision.size,
      averageQuality,
      regretRate,
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create decision learning engine
 */
export function createDecisionLearningEngine(
  config?: Partial<OutcomeLearningConfig>
): DecisionLearningEngine {
  return new DecisionLearningEngine(config);
}

/**
 * Create decision learning entry
 */
export function createDecisionLearningEntry(
  decisionId: string,
  studentId: StudentId,
  context: DecisionLearningEntry['context'],
  recommendation: DecisionLearningEntry['recommendation'],
  studentChoice: DecisionLearningEntry['studentChoice'],
  outcome: DecisionLearningEntry['outcome'],
  overrides: Partial<DecisionLearningEntry> = {}
): DecisionLearningEntry {
  return {
    entryId: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    timestamp: Date.now(),
    decisionId,
    studentId,
    context,
    recommendation,
    studentChoice,
    outcome,
    quality: 'ADEQUATE',
    regretSignal: {
      present: false,
      intensity: 0,
      causes: [],
      preventable: false,
    },
    opportunitySignal: {
      present: false,
      missedOpportunities: [],
      potentialValue: 0,
    },
    ...overrides,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  DecisionLearningEngine,
  DecisionQualityAssessor,
  RegretAnalyzer,
  OpportunityAnalyzer,
  PatternAnalyzer,
};
