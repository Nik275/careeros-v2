/**
 * Outcome Priority Engine
 *
 * Determines which outcomes should be tracked aggressively based on
 * learning value, decision criticality, and evidence gaps.
 *
 * @module intelligence/active-learning
 * @version 1.0.0
 */

import type {
  StudentId,
  RecommendationId,
  CareerId,
} from '../outcome-tracking/outcome-types.js';
import type {
  OutcomePriority,
  PriorityLevel,
  PriorityAdjustment,
  OutcomeUrgency,
  LearningValueScore,
  ActiveLearningConfig,
} from './active-learning-types.js';

interface PriorityRecord {
  priorityId: string;
  priority: OutcomePriority;
  history: PriorityAdjustment[];
  createdAt: number;
  updatedAt: number;
}

interface StudentPriorityContext {
  learningValue?: LearningValueScore;
  daysSinceLastContact?: number;
  hasMadeDecision?: boolean;
  decisionConfidence?: number;
  isNearBoundary?: boolean;
  fillsEvidenceGap?: boolean;
  outcomeMilestone?: 'DECISION' | 'TRANSITION' | 'MILESTONE_6MO' | 'MILESTONE_1YR' | 'MILESTONE_2YR';
}

/**
 * Generates unique priority ID
 */
function generatePriorityId(): string {
  return `pri-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Outcome Priority Engine - Manages outcome tracking priorities
 */
export class OutcomePriorityEngine {
  private priorityRecords: Map<string, PriorityRecord> = new Map();
  private studentPriorities: Map<StudentId, string[]> = new Map();
  private config: ActiveLearningConfig;
  private scheduledFollowUps: Map<StudentId, number> = new Map();

  constructor(config: ActiveLearningConfig) {
    this.config = config;
  }

  /**
   * Calculate priority for a student
   */
  calculatePriority(
    studentId: StudentId,
    context: StudentPriorityContext = {},
    recommendationId?: RecommendationId,
    careerId?: CareerId
  ): OutcomePriority {
    const reasons: string[] = [];
    let priorityScore = 0;

    // Learning value factor
    if (context.learningValue) {
      const learningWeight = context.learningValue.totalScore;
      priorityScore += learningWeight * 0.3;
      
      if (context.learningValue.priority === 'CRITICAL') {
        reasons.push('Critical learning value');
      } else if (context.learningValue.priority === 'HIGH') {
        reasons.push('High learning value');
      }
    }

    // Time since contact
    if (context.daysSinceLastContact !== undefined) {
      const daysOverdue = Math.max(0, context.daysSinceLastContact - this.config.outcomePriority.defaultTrackingDays);
      if (daysOverdue > 0) {
        priorityScore += Math.min(30, daysOverdue * 2);
        reasons.push(`Overdue by ${daysOverdue} days`);
      }
    }

    // Decision status
    if (context.hasMadeDecision === false) {
      priorityScore += 20;
      reasons.push('Decision pending');
    }

    // Decision confidence
    if (context.decisionConfidence !== undefined && context.decisionConfidence < 50) {
      priorityScore += (50 - context.decisionConfidence) * 0.5;
      reasons.push('Low decision confidence');
    }

    // Boundary proximity
    if (context.isNearBoundary) {
      priorityScore += 15;
      reasons.push('Near decision boundary');
    }

    // Evidence gap
    if (context.fillsEvidenceGap) {
      priorityScore += 20;
      reasons.push('Fills evidence gap');
    }

    // Milestone urgency
    if (context.outcomeMilestone) {
      switch (context.outcomeMilestone) {
        case 'DECISION':
          priorityScore += 25;
          reasons.push('Critical decision point');
          break;
        case 'TRANSITION':
          priorityScore += 20;
          reasons.push('Career transition in progress');
          break;
        case 'MILESTONE_6MO':
          priorityScore += 15;
          reasons.push('6-month milestone');
          break;
        case 'MILESTONE_1YR':
          priorityScore += 10;
          reasons.push('1-year milestone');
          break;
        case 'MILESTONE_2YR':
          priorityScore += 5;
          reasons.push('2-year milestone');
          break;
      }
    }

    // Determine priority level
    let level: PriorityLevel;
    if (priorityScore >= 70) {
      level = 'HIGH';
    } else if (priorityScore >= 40) {
      level = 'MEDIUM';
    } else if (priorityScore >= 20) {
      level = 'LOW';
    } else {
      level = 'DEFERRED';
    }

    // Determine urgency
    const urgency = this.calculateUrgency(priorityScore, context);

    // Calculate tracking frequency
    const trackingFrequency = this.calculateTrackingFrequency(level, urgency);

    // Calculate next scheduled follow-up
    const nextScheduled = this.calculateNextScheduled(level, context.daysSinceLastContact);

    const priority: OutcomePriority = {
      priorityId: generatePriorityId(),
      studentId,
      recommendationId,
      careerId,
      level,
      urgency,
      reasons,
      trackingFrequency,
      autoFollowUp: level === 'HIGH' || level === 'MEDIUM',
      lastTracked: context.daysSinceLastContact !== undefined 
        ? Date.now() - context.daysSinceLastContact * 24 * 60 * 60 * 1000 
        : undefined,
      nextScheduled,
    };

    // Store priority
    this.storePriority(priority);

    return priority;
  }

  /**
   * Update priority with adjustment
   */
  updatePriority(studentId: StudentId, adjustment: PriorityAdjustment): void {
    const record = this.findRecordByStudentId(studentId);
    if (!record) return;

    record.priority.level = adjustment.newPriority;
    record.history.push(adjustment);
    record.updatedAt = Date.now();

    // Update next scheduled if priority changed
    if (adjustment.newPriority === 'HIGH') {
      record.priority.nextScheduled = Date.now() + this.config.outcomePriority.highPriorityDays * 24 * 60 * 60 * 1000;
      record.priority.trackingFrequency = this.config.outcomePriority.highPriorityDays;
    }
  }

  /**
   * Get high priority outcomes
   */
  getHighPriorityOutcomes(): OutcomePriority[] {
    const priorities: OutcomePriority[] = [];

    for (const record of this.priorityRecords.values()) {
      if (record.priority.level === 'HIGH') {
        priorities.push(record.priority);
      }
    }

    return priorities.sort((a, b) => {
      // Sort by urgency and next scheduled
      if (a.urgency === 'IMMEDIATE' && b.urgency !== 'IMMEDIATE') return -1;
      if (b.urgency === 'IMMEDIATE' && a.urgency !== 'IMMEDIATE') return 1;
      return a.nextScheduled - b.nextScheduled;
    });
  }

  /**
   * Get pending follow-ups
   */
  getPendingFollowUps(): OutcomePriority[] {
    const now = Date.now();
    const pending: OutcomePriority[] = [];

    for (const record of this.priorityRecords.values()) {
      if (record.priority.nextScheduled <= now && record.priority.autoFollowUp) {
        pending.push(record.priority);
      }
    }

    return pending.sort((a, b) => a.nextScheduled - b.nextScheduled);
  }

  /**
   * Schedule a follow-up
   */
  scheduleFollowUp(studentId: StudentId, days: number): void {
    const nextScheduled = Date.now() + days * 24 * 60 * 60 * 1000;
    this.scheduledFollowUps.set(studentId, nextScheduled);

    const record = this.findRecordByStudentId(studentId);
    if (record) {
      record.priority.nextScheduled = nextScheduled;
      record.priority.trackingFrequency = days;
    }
  }

  /**
   * Get priority by ID
   */
  getPriority(priorityId: string): OutcomePriority | undefined {
    return this.priorityRecords.get(priorityId)?.priority;
  }

  /**
   * Get priorities for a student
   */
  getStudentPriorities(studentId: StudentId): OutcomePriority[] {
    const priorityIds = this.studentPriorities.get(studentId) || [];
    return priorityIds
      .map(id => this.priorityRecords.get(id)?.priority)
      .filter((p): p is OutcomePriority => p !== undefined);
  }

  /**
   * Get current priority for a student
   */
  getCurrentPriority(studentId: StudentId): OutcomePriority | undefined {
    const priorities = this.getStudentPriorities(studentId);
    return priorities.length > 0 
      ? priorities.sort((a, b) => b.nextScheduled - a.nextScheduled)[0]
      : undefined;
  }

  /**
   * Escalate priority
   */
  escalatePriority(studentId: StudentId, reason: string): void {
    const record = this.findRecordByStudentId(studentId);
    if (!record) return;

    const oldPriority = record.priority.level;
    let newPriority: PriorityLevel;

    switch (oldPriority) {
      case 'DEFERRED': newPriority = 'LOW'; break;
      case 'LOW': newPriority = 'MEDIUM'; break;
      case 'MEDIUM': newPriority = 'HIGH'; break;
      case 'HIGH': newPriority = 'HIGH'; break;
      default: newPriority = oldPriority;
    }

    this.updatePriority(studentId, {
      studentId,
      oldPriority,
      newPriority,
      reason,
      confidence: 0.8,
    });
  }

  /**
   * De-escalate priority
   */
  deescalatePriority(studentId: StudentId, reason: string): void {
    const record = this.findRecordByStudentId(studentId);
    if (!record) return;

    const oldPriority = record.priority.level;
    let newPriority: PriorityLevel;

    switch (oldPriority) {
      case 'HIGH': newPriority = 'MEDIUM'; break;
      case 'MEDIUM': newPriority = 'LOW'; break;
      case 'LOW': newPriority = 'DEFERRED'; break;
      case 'DEFERRED': newPriority = 'DEFERRED'; break;
      default: newPriority = oldPriority;
    }

    this.updatePriority(studentId, {
      studentId,
      oldPriority,
      newPriority,
      reason,
      confidence: 0.8,
    });
  }

  /**
   * Get outcome priority statistics
   */
  getStats(): {
    totalPriorities: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    deferredCount: number;
    pendingFollowUps: number;
    averageTrackingFrequency: number;
  } {
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;
    let deferredCount = 0;
    let pendingFollowUps = 0;
    let totalFrequency = 0;

    const now = Date.now();

    for (const record of this.priorityRecords.values()) {
      switch (record.priority.level) {
        case 'HIGH': highCount++; break;
        case 'MEDIUM': mediumCount++; break;
        case 'LOW': lowCount++; break;
        case 'DEFERRED': deferredCount++; break;
      }

      if (record.priority.nextScheduled <= now && record.priority.autoFollowUp) {
        pendingFollowUps++;
      }

      totalFrequency += record.priority.trackingFrequency;
    }

    const total = this.priorityRecords.size;

    return {
      totalPriorities: total,
      highCount,
      mediumCount,
      lowCount,
      deferredCount,
      pendingFollowUps,
      averageTrackingFrequency: total > 0 ? totalFrequency / total : this.config.outcomePriority.defaultTrackingDays,
    };
  }

  /**
   * Check if student needs follow-up
   */
  needsFollowUp(studentId: StudentId): boolean {
    const priority = this.getCurrentPriority(studentId);
    if (!priority) return false;

    return priority.nextScheduled <= Date.now() && priority.autoFollowUp;
  }

  /**
   * Record follow-up completion
   */
  recordFollowUp(studentId: StudentId): void {
    const record = this.findRecordByStudentId(studentId);
    if (!record) return;

    record.priority.lastTracked = Date.now();
    
    // Schedule next follow-up
    record.priority.nextScheduled = Date.now() + record.priority.trackingFrequency * 24 * 60 * 60 * 1000;
    record.updatedAt = Date.now();
  }

  /**
   * Get overdue follow-ups
   */
  getOverdueFollowUps(): OutcomePriority[] {
    const now = Date.now();
    const overdue: OutcomePriority[] = [];

    for (const record of this.priorityRecords.values()) {
      const daysOverdue = (now - record.priority.nextScheduled) / (24 * 60 * 60 * 1000);
      if (daysOverdue > this.config.outcomePriority.autoEscalateThreshold) {
        overdue.push(record.priority);
      }
    }

    return overdue;
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.priorityRecords.clear();
    this.studentPriorities.clear();
    this.scheduledFollowUps.clear();
  }

  /**
   * Calculate urgency from priority score and context
   */
  private calculateUrgency(priorityScore: number, context: StudentPriorityContext): OutcomeUrgency {
    if (context.outcomeMilestone === 'DECISION' && context.hasMadeDecision === false) {
      return 'IMMEDIATE';
    }

    if (priorityScore >= 80) return 'IMMEDIATE';
    if (priorityScore >= 60) return 'SHORT_TERM';
    if (priorityScore >= 40) return 'MEDIUM_TERM';
    if (priorityScore >= 20) return 'LONG_TERM';
    return 'FUTURE';
  }

  /**
   * Calculate tracking frequency in days
   */
  private calculateTrackingFrequency(level: PriorityLevel, urgency: OutcomeUrgency): number {
    const baseFrequency = {
      HIGH: this.config.outcomePriority.highPriorityDays,
      MEDIUM: this.config.outcomePriority.defaultTrackingDays,
      LOW: this.config.outcomePriority.defaultTrackingDays * 2,
      DEFERRED: this.config.outcomePriority.defaultTrackingDays * 4,
    };

    let frequency = baseFrequency[level];

    // Adjust for urgency
    switch (urgency) {
      case 'IMMEDIATE': frequency = Math.min(frequency, 3); break;
      case 'SHORT_TERM': frequency = Math.min(frequency, 7); break;
      case 'MEDIUM_TERM': frequency = Math.min(frequency, 14); break;
      case 'LONG_TERM': break; // Use base
      case 'FUTURE': frequency *= 2; break;
    }

    return frequency;
  }

  /**
   * Calculate next scheduled follow-up
   */
  private calculateNextScheduled(level: PriorityLevel, daysSinceLastContact?: number): number {
    const now = Date.now();
    
    if (daysSinceLastContact === undefined) {
      // Never contacted - schedule based on priority
      const days = level === 'HIGH' 
        ? this.config.outcomePriority.highPriorityDays 
        : this.config.outcomePriority.defaultTrackingDays;
      return now + days * 24 * 60 * 60 * 1000;
    }

    // Already contacted - schedule from last contact
    const baseDays = level === 'HIGH' 
      ? this.config.outcomePriority.highPriorityDays 
      : this.config.outcomePriority.defaultTrackingDays;
    
    const nextContact = now - daysSinceLastContact * 24 * 60 * 60 * 1000 + baseDays * 24 * 60 * 60 * 1000;
    
    // If overdue, schedule soon
    if (nextContact < now) {
      return now + 24 * 60 * 60 * 1000; // Tomorrow
    }

    return nextContact;
  }

  /**
   * Store priority record
   */
  private storePriority(priority: OutcomePriority): void {
    const existingRecord = this.findRecordByStudentId(priority.studentId);
    
    if (existingRecord) {
      // Update existing
      existingRecord.priority = priority;
      existingRecord.updatedAt = Date.now();
    } else {
      // Create new
      const record: PriorityRecord = {
        priorityId: priority.priorityId,
        priority,
        history: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      this.priorityRecords.set(priority.priorityId, record);

      // Track by student
      const studentPriorities = this.studentPriorities.get(priority.studentId) || [];
      studentPriorities.push(priority.priorityId);
      this.studentPriorities.set(priority.studentId, studentPriorities);
    }
  }

  /**
   * Find record by student ID
   */
  private findRecordByStudentId(studentId: StudentId): PriorityRecord | undefined {
    for (const record of this.priorityRecords.values()) {
      if (record.priority.studentId === studentId) {
        return record;
      }
    }
    return undefined;
  }
}

export default OutcomePriorityEngine;
