/**
 * Active Learning Engine
 *
 * Main orchestration engine for intelligent data collection.
 * Prioritizes learning from the most informative students and decisions.
 *
 * @module intelligence/active-learning
 * @version 1.0.0
 */

import type {
  StudentId,
} from '../outcome-tracking/outcome-types.js';
import type {
  ActiveLearningConfig,
  UncertaintyProfile,
  LearningValueScore,
  BoundaryProximity,
  OutcomePriority,
  EvidenceGap,
  ActiveLearningReport,
  LearningQuery,
  LearningQueryId,
  QueryType,
  QueryStatus,
  PriorityLevel,
  ActiveLearningMetrics,
  StudentLearningProfile,
} from './active-learning-types.js';

import { DEFAULT_ACTIVE_LEARNING_CONFIG } from './active-learning-types.js';

import { UncertaintyEngine } from './uncertainty-engine.js';
import { LearningValueEngine } from './learning-value-engine.js';
import { DecisionBoundaryEngine } from './decision-boundary-engine.js';
import { OutcomePriorityEngine } from './outcome-priority-engine.js';
import { EvidenceGapEngine } from './evidence-gap-engine.js';

/**
 * Generates unique query ID
 */
function generateQueryId(): LearningQueryId {
  return `q-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` as LearningQueryId;
}

/**
 * Active Learning Engine - Main orchestration
 */
export class ActiveLearningEngine {
  private config: ActiveLearningConfig;
  private uncertaintyEngine: UncertaintyEngine;
  private learningValueEngine: LearningValueEngine;
  private decisionBoundaryEngine: DecisionBoundaryEngine;
  private outcomePriorityEngine: OutcomePriorityEngine;
  private evidenceGapEngine: EvidenceGapEngine;

  private queries: Map<LearningQueryId, LearningQuery> = new Map();
  private studentQueries: Map<StudentId, LearningQueryId[]> = new Map();
  private studentProfiles: Map<StudentId, StudentLearningProfile> = new Map();

  private analytics: {
    totalQueriesGenerated: number;
    totalQueriesSent: number;
    totalResponses: number;
    totalLearningGains: number;
  } = {
    totalQueriesGenerated: 0,
    totalQueriesSent: 0,
    totalResponses: 0,
    totalLearningGains: 0,
  };

  constructor(config: Partial<ActiveLearningConfig> = {}) {
    this.config = { ...DEFAULT_ACTIVE_LEARNING_CONFIG, ...config };
    this.uncertaintyEngine = new UncertaintyEngine(this.config);
    this.learningValueEngine = new LearningValueEngine(this.config);
    this.decisionBoundaryEngine = new DecisionBoundaryEngine(this.config);
    this.outcomePriorityEngine = new OutcomePriorityEngine(this.config);
    this.evidenceGapEngine = new EvidenceGapEngine(this.config);
  }

  /**
   * Analyze a student comprehensively
   */
  analyzeStudent(studentId: StudentId, context?: {
    modelConfidence?: number;
    decisionConfidence?: number;
    studentProfile?: {
      technicalScore?: number;
      creativeScore?: number;
      corporatePreference?: number;
      startupPreference?: number;
      independenceScore?: number;
      collaborationScore?: number;
      riskTolerance?: number;
      creatorOrientation?: number;
    };
    isRare?: boolean;
    rarityScore?: number;
    isNovel?: boolean;
    noveltyScore?: number;
    fillsEvidenceGap?: boolean;
    hasMadeDecision?: boolean;
    daysSinceLastContact?: number;
  }): {
    uncertainty: UncertaintyProfile;
    learningValue: LearningValueScore;
    boundaries: BoundaryProximity[];
    priority: OutcomePriority;
  } {
    // Calculate uncertainty
    const uncertainty = this.uncertaintyEngine.calculateUncertainty(studentId, {
      modelConfidence: context?.modelConfidence,
      decisionConfidence: context?.decisionConfidence,
    });

    // Detect boundaries
    const boundaries = this.decisionBoundaryEngine.detectBoundaries(studentId, context?.studentProfile);
    const primaryBoundary = boundaries.length > 0
      ? boundaries.reduce((max, b) => b.learningValue > max.learningValue ? b : max)
      : undefined;

    // Get evidence gaps
    const gaps = context?.fillsEvidenceGap
      ? this.evidenceGapEngine.getStudentGaps(studentId)
      : [];
    const evidenceGapScore = gaps.length > 0
      ? Math.max(...gaps.map(g => 100 - g.coverage))
      : 0;

    // Calculate learning value
    const learningValue = this.learningValueEngine.calculateLearningValue(studentId, {
      uncertaintyProfile: uncertainty,
      isRare: context?.isRare,
      rarityScore: context?.rarityScore,
      isNovel: context?.isNovel,
      noveltyScore: context?.noveltyScore,
      boundaryProximity: primaryBoundary?.learningValue,
      evidenceGapScore,
    });

    // Calculate priority
    const priority = this.outcomePriorityEngine.calculatePriority(studentId, {
      learningValue,
      daysSinceLastContact: context?.daysSinceLastContact,
      hasMadeDecision: context?.hasMadeDecision,
      decisionConfidence: context?.decisionConfidence,
      isNearBoundary: boundaries.some(b => b.learningValue > 50),
      fillsEvidenceGap: context?.fillsEvidenceGap,
    });

    // Store student profile
    this.studentProfiles.set(studentId, {
      studentId,
      uncertaintyProfile: uncertainty,
      learningValue,
      boundaryProximities: boundaries,
      outcomePriority: priority,
      evidenceGaps: gaps.map(g => g.gapId),
      lastAnalyzed: Date.now(),
      queryHistory: this.studentQueries.get(studentId) || [],
    });

    return {
      uncertainty,
      learningValue,
      boundaries,
      priority,
    };
  }

  /**
   * Generate a learning query for a student
   */
  generateLearningQuery(studentId: StudentId, type: QueryType): LearningQuery | null {
    // Check max pending per student
    const pendingQueries = this.getPendingQueriesForStudent(studentId);
    if (pendingQueries.length >= this.config.queries.maxPendingPerStudent) {
      return null;
    }

    const profile = this.studentProfiles.get(studentId);
    if (!profile) {
      // Analyze first if not already done
      this.analyzeStudent(studentId);
    }

    const question = this.generateQueryQuestion(type, profile);
    const expectedValue = profile?.learningValue.expectedLearningGain || 0.5;

    const query: LearningQuery = {
      queryId: generateQueryId(),
      studentId,
      type,
      status: 'PENDING',
      priority: profile?.learningValue.priority || 'MEDIUM',
      createdAt: Date.now(),
      expiresAt: Date.now() + this.config.queries.defaultExpiryDays * 24 * 60 * 60 * 1000,
      question,
      context: {
        reason: this.generateQueryReason(type, profile),
        expectedValue,
      },
    };

    // Store query
    this.queries.set(query.queryId, query);
    
    const studentQueryList = this.studentQueries.get(studentId) || [];
    studentQueryList.push(query.queryId);
    this.studentQueries.set(studentId, studentQueryList);

    this.analytics.totalQueriesGenerated++;
    this.learningValueEngine.recordQuery(studentId);

    return query;
  }

  /**
   * Send a query
   */
  sendQuery(queryId: LearningQueryId): void {
    const query = this.queries.get(queryId);
    if (!query || query.status !== 'PENDING') return;

    query.status = 'SENT';
    query.sentAt = Date.now();

    this.analytics.totalQueriesSent++;
  }

  /**
   * Process a query response
   */
  processResponse(queryId: LearningQueryId, response: unknown): void {
    const query = this.queries.get(queryId);
    if (!query || query.status === 'RESPONDED') return;

    // Calculate response quality
    const quality = this.calculateResponseQuality(response);

    query.status = 'RESPONDED';
    query.response = {
      receivedAt: Date.now(),
      data: response,
      quality,
    };

    this.analytics.totalResponses++;
    this.learningValueEngine.recordResponseQuality(query.studentId, quality);

    // Update uncertainty based on response
    this.uncertaintyEngine.updateUncertainty(query.studentId, {
      predicted: 50,
      actual: 70, // Assuming positive learning
      confidence: quality / 100,
    });

    // Record learning gain
    const gain = (quality / 100) * (query.context.expectedValue || 0.5);
    this.learningValueEngine.recordLearningGain(query.studentId, gain);
    this.analytics.totalLearningGains += gain;
  }

  /**
   * Generate active learning report
   */
  generateReport(): ActiveLearningReport {
    const now = Date.now();
    const periodStart = now - 30 * 24 * 60 * 60 * 1000; // Last 30 days

    // High value students
    const highValueStudents = this.learningValueEngine.getHighValueStudents(20).map(score => ({
      studentId: score.studentId,
      learningValue: score.totalScore,
      primaryReason: score.components[0]?.explanation || 'High learning potential',
      recommendedAction: score.recommendedActions[0] || 'Schedule follow-up',
    }));

    // Active boundaries
    const activeBoundaries = this.decisionBoundaryEngine.findBoundaryZones().map(zone => ({
      boundaryId: zone.boundaries[0],
      studentCount: zone.students.length,
      learningIntensity: zone.learningIntensity,
    }));

    // Priority distribution
    const priorityStats = this.outcomePriorityEngine.getStats();
    const priorityDistribution: Record<PriorityLevel, number> = {
      HIGH: priorityStats.highCount,
      MEDIUM: priorityStats.mediumCount,
      LOW: priorityStats.lowCount,
      DEFERRED: priorityStats.deferredCount,
      CRITICAL: priorityStats.criticalCount,
    };

    // Urgent follow-ups
    const urgentFollowUps = this.outcomePriorityEngine.getHighPriorityOutcomes();

    // Evidence gaps
    const gapAnalysis = this.evidenceGapEngine.generateAnalysis();

    // Query stats
    let respondedCount = 0;
    let totalQuality = 0;
    let qualityCount = 0;

    for (const query of this.queries.values()) {
      if (query.status === 'RESPONDED') {
        respondedCount++;
        if (query.response) {
          totalQuality += query.response.quality;
          qualityCount++;
        }
      }
    }

    const queryStats = {
      total: this.queries.size,
      responded: respondedCount,
      responseRate: this.analytics.totalQueriesSent > 0
        ? (respondedCount / this.analytics.totalQueriesSent) * 100
        : 0,
      averageResponseQuality: qualityCount > 0 ? totalQuality / qualityCount : 0,
    };

    // Generate recommendations
    const recommendations = this.generateRecommendations();

    return {
      reportId: `report-${now}`,
      generatedAt: now,
      period: {
        start: periodStart,
        end: now,
      },
      highValueStudents,
      activeBoundaries,
      priorityDistribution,
      urgentFollowUps,
      criticalGaps: gapAnalysis.criticalGaps.length,
      gapProgress: gapAnalysis.gapProgress,
      queryStats,
      recommendations,
    };
  }

  /**
   * Get learning recommendations
   */
  getRecommendations(): string[] {
    return this.generateRecommendations().map(r => r.type);
  }

  /**
   * Process batch of students
   */
  processBatch(studentIds: StudentId[]): void {
    for (const studentId of studentIds) {
      this.analyzeStudent(studentId);
    }
  }

  /**
   * Get next batch of queries to send
   */
  getNextQueryBatch(count: number = this.config.queries.batchSize): LearningQuery[] {
    const pendingQueries: LearningQuery[] = [];

    for (const query of this.queries.values()) {
      if (query.status === 'PENDING') {
        pendingQueries.push(query);
      }
    }

    // Sort by priority and expected value
    return pendingQueries
      .sort((a, b) => {
        const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        const priorityDiff = priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
        if (priorityDiff !== 0) return priorityDiff;
        return (b.context.expectedValue || 0) - (a.context.expectedValue || 0);
      })
      .slice(0, count);
  }

  /**
   * Get pending queries for a student
   */
  getPendingQueriesForStudent(studentId: StudentId): LearningQuery[] {
    const queryIds = this.studentQueries.get(studentId) || [];
    return queryIds
      .map(id => this.queries.get(id))
      .filter((q): q is LearningQuery => q !== undefined && q.status === 'PENDING');
  }

  /**
   * Get all pending queries
   */
  getAllPendingQueries(): LearningQuery[] {
    return Array.from(this.queries.values()).filter(q => q.status === 'PENDING');
  }

  /**
   * Get sent queries awaiting response
   */
  getSentQueries(): LearningQuery[] {
    return Array.from(this.queries.values()).filter(q => q.status === 'SENT');
  }

  /**
   * Expire old queries
   */
  expireOldQueries(): number {
    const now = Date.now();
    let expiredCount = 0;

    for (const query of this.queries.values()) {
      if (query.status === 'PENDING' && query.expiresAt < now) {
        query.status = 'EXPIRED';
        expiredCount++;
      }
    }

    return expiredCount;
  }

  /**
   * Get active learning metrics
   */
  getMetrics(): ActiveLearningMetrics {
    const uncertaintyStats = this.uncertaintyEngine.getStats();
    const learningValueStats = this.learningValueEngine.getStats();
    const boundaryStats = this.decisionBoundaryEngine.getStats();
    const gapStats = this.evidenceGapEngine.getStats();

    return {
      totalStudentsAnalyzed: uncertaintyStats.totalStudents,
      highValueStudents: learningValueStats.criticalCount + learningValueStats.highCount,
      activeQueries: this.getAllPendingQueries().length + this.getSentQueries().length,
      responseRate: this.analytics.totalQueriesSent > 0
        ? (this.analytics.totalResponses / this.analytics.totalQueriesSent) * 100
        : 0,
      averageLearningGain: this.analytics.totalResponses > 0
        ? this.analytics.totalLearningGains / this.analytics.totalResponses
        : 0,
      evidenceGapCoverage: {
        RARE_CAREER: gapStats.averageCoverage,
        EMERGING_CAREER: gapStats.averageCoverage,
        CREATOR_ECONOMY: gapStats.averageCoverage,
        AI_CAREER: gapStats.averageCoverage,
        NEW_INDUSTRY: gapStats.averageCoverage,
        GEOGRAPHIC_REGION: gapStats.averageCoverage,
        DEMOGRAPHIC_SEGMENT: gapStats.averageCoverage,
        EDUCATION_PATHWAY: gapStats.averageCoverage,
        TRANSITION_TYPE: gapStats.averageCoverage,
        DECISION_PATTERN: gapStats.averageCoverage,
      },
    };
  }

  /**
   * Get student learning profile
   */
  getStudentProfile(studentId: StudentId): StudentLearningProfile | undefined {
    return this.studentProfiles.get(studentId);
  }

  /**
   * Get high priority students
   */
  getHighPriorityStudents(): StudentId[] {
    return this.learningValueEngine.getPrioritizedStudents();
  }

  /**
   * Register student with evidence gaps
   */
  registerStudentForGap(studentId: StudentId, gapId: string): void {
    this.evidenceGapEngine.addSampleToGap(gapId as import('./active-learning-types.js').EvidenceGapId, studentId);
  }

  /**
   * Check if student is high value
   */
  isHighValueStudent(studentId: StudentId): boolean {
    return this.learningValueEngine.isPriorityStudent(studentId);
  }

  /**
   * Schedule follow-up for student
   */
  scheduleFollowUp(studentId: StudentId, days?: number): void {
    const effectiveDays = days || this.config.outcomePriority.defaultTrackingDays;
    this.outcomePriorityEngine.scheduleFollowUp(studentId, effectiveDays);
  }

  // Accessor methods for sub-engines
  getUncertaintyEngine(): UncertaintyEngine {
    return this.uncertaintyEngine;
  }

  getLearningValueEngine(): LearningValueEngine {
    return this.learningValueEngine;
  }

  getDecisionBoundaryEngine(): DecisionBoundaryEngine {
    return this.decisionBoundaryEngine;
  }

  getOutcomePriorityEngine(): OutcomePriorityEngine {
    return this.outcomePriorityEngine;
  }

  getEvidenceGapEngine(): EvidenceGapEngine {
    return this.evidenceGapEngine;
  }

  getConfig(): ActiveLearningConfig {
    return this.config;
  }

  updateConfig(config: Partial<ActiveLearningConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.uncertaintyEngine.clear();
    this.learningValueEngine.clear();
    this.decisionBoundaryEngine.clear();
    this.outcomePriorityEngine.clear();
    this.evidenceGapEngine.clear();
    this.queries.clear();
    this.studentQueries.clear();
    this.studentProfiles.clear();
    this.analytics = {
      totalQueriesGenerated: 0,
      totalQueriesSent: 0,
      totalResponses: 0,
      totalLearningGains: 0,
    };
  }

  // Private helper methods
  private generateQueryQuestion(type: QueryType, profile?: StudentLearningProfile): string {
    const questions: Record<QueryType, string[]> = {
      UNCERTAINTY_PROBE: [
        'What factors are making your career decision difficult?',
        'Which career options are you most uncertain about?',
        'What information would help you feel more confident?',
      ],
      OUTCOME_FOLLOWUP: [
        'How has your career progressed since we last spoke?',
        'Are you satisfied with your current career path?',
        'What unexpected challenges have you faced?',
      ],
      DECISION_EXPLORATION: [
        'Walk us through how you made your career decision.',
        'What trade-offs did you consider?',
        'Who or what influenced your decision most?',
      ],
      CONTRADICTION_INVESTIGATION: [
        'Your profile shows both technical and creative strengths. How do you balance these?',
        'You seem interested in both stability and growth. Tell us more.',
        'Your preferences seem diverse. How do you prioritize?',
      ],
      BOUNDARY_CLARIFICATION: [
        'You\'re near a major career decision boundary. What\'s pulling you in each direction?',
        'Corporate or startup - what factors matter most to you?',
        'How do you see yourself: as a creator or an employee?',
      ],
      NOVELTY_DISCOVERY: [
        'Your career path is unique. Tell us about your journey.',
        'You\'re exploring an emerging field. What drew you to it?',
        'How did you discover this career opportunity?',
      ],
      VALIDATION_REQUEST: [
        'We recommended X for you. How accurate was that?',
        'Did our career prediction match your actual experience?',
        'What would have improved our recommendation?',
      ],
    };

    const typeQuestions = questions[type] || questions.UNCERTAINTY_PROBE;
    return typeQuestions[Math.floor(Math.random() * typeQuestions.length)];
  }

  private generateQueryReason(type: QueryType, profile?: StudentLearningProfile): string {
    const reasons: Record<QueryType, string> = {
      UNCERTAINTY_PROBE: 'High uncertainty detected in student profile',
      OUTCOME_FOLLOWUP: 'Scheduled outcome tracking',
      DECISION_EXPLORATION: 'Decision point approaching',
      CONTRADICTION_INVESTIGATION: 'Profile contains interesting contradictions',
      BOUNDARY_CLARIFICATION: 'Student near major decision boundary',
      NOVELTY_DISCOVERY: 'Novel career pathway detected',
      VALIDATION_REQUEST: 'Recommendation validation needed',
    };

    return reasons[type] || 'General learning inquiry';
  }

  private calculateResponseQuality(response: unknown): number {
    if (response === null || response === undefined) return 0;

    const responseStr = JSON.stringify(response);
    
    // Quality factors
    let quality = 50; // Base quality

    // Length factor (longer responses often more detailed)
    if (responseStr.length > 100) quality += 10;
    if (responseStr.length > 500) quality += 10;

    // Detail factor (check for multiple sentences)
    const sentenceCount = (responseStr.match(/[.!?]+/g) || []).length;
    quality += Math.min(20, sentenceCount * 5);

    // Specificity factor (check for numbers, percentages)
    if (/\d+%?/.test(responseStr)) quality += 10;

    return Math.min(100, quality);
  }

  private generateRecommendations(): { type: string; target: string; expectedImpact: number; effort: 'LOW' | 'MEDIUM' | 'HIGH' }[] {
    const recommendations: { type: string; target: string; expectedImpact: number; effort: 'LOW' | 'MEDIUM' | 'HIGH' }[] = [];

    const criticalGaps = this.evidenceGapEngine.getCriticalGaps();
    if (criticalGaps.length > 0) {
      recommendations.push({
        type: 'Fill Evidence Gaps',
        target: criticalGaps[0].name,
        expectedImpact: 15,
        effort: 'HIGH',
      });
    }

    const highUncertaintyStudents = this.uncertaintyEngine.getHighUncertaintyStudents();
    if (highUncertaintyStudents.length > 0) {
      recommendations.push({
        type: 'Reduce Model Uncertainty',
        target: `${highUncertaintyStudents.length} high-uncertainty students`,
        expectedImpact: 10,
        effort: 'MEDIUM',
      });
    }

    const boundaryZones = this.decisionBoundaryEngine.findBoundaryZones();
    if (boundaryZones.length > 0) {
      recommendations.push({
        type: 'Study Decision Boundaries',
        target: `${boundaryZones.length} active boundary zones`,
        expectedImpact: 12,
        effort: 'MEDIUM',
      });
    }

    const pendingQueries = this.getAllPendingQueries();
    if (pendingQueries.length > 10) {
      recommendations.push({
        type: 'Send Pending Queries',
        target: `${pendingQueries.length} pending queries`,
        expectedImpact: 8,
        effort: 'LOW',
      });
    }

    return recommendations;
  }
}

export default ActiveLearningEngine;
