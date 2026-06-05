/**
 * CareerOS Outcome Tracking System - Tracker
 *
 * Phase 8.9: Outcome Tracking System
 *
 * Main tracking interface for recording and retrieving student outcomes.
 * Provides high-level API for outcome tracking operations.
 *
 * @module intelligence/outcome-tracking
 * @version 1.0.0
 */

import {
  type StudentOutcomeRecord,
  type OutcomeRecordId,
  type StudentId,
  type GrowthSnapshot,
  type TimelineEntry,
  type TimelineEntryId,
  type GrowthSnapshotId,
  type OutcomeTimepoint,
  type IOutcomeTracker,
  type IOutcomeStore,
  type IOutcomeEventEngine,
  type CareerDecisionOutcome,
  type EducationOutcome,
  type SkillOutcome,
  type InternshipOutcome,
  type JobOutcome,
  type ExplorationOutcome,
  type OutcomeEvent,
  type StudentGrowthProfile,
  type GrowthDimension,
} from './outcome-types.js';

import {
  type StudentBeliefV3,
} from '../types/index.js';

import {
  type DimensionScoreMap,
} from '../../assessment/assessment-types.js';

import {
  type CareerRecommendation,
} from '../../recommendation/recommendation-types.js';

import {
  createOutcomeRecordedEvent,
  createGrowthMeasuredEvent,
  createTimelineUpdatedEvent,
} from './outcome-event-engine.js';

// ============================================================================
// ID GENERATION
// ============================================================================

function generateRecordId(): OutcomeRecordId {
  return `rec-${Date.now()}-${Math.random().toString(36).substring(2, 11)}` as OutcomeRecordId;
}

function generateTimelineEntryId(): TimelineEntryId {
  return `tle-${Date.now()}-${Math.random().toString(36).substring(2, 11)}` as TimelineEntryId;
}

function generateGrowthSnapshotId(): GrowthSnapshotId {
  return `gs-${Date.now()}-${Math.random().toString(36).substring(2, 11)}` as GrowthSnapshotId;
}

// ============================================================================
// OUTCOME TRACKER IMPLEMENTATION
// ============================================================================

/**
 * Outcome Tracker
 *
 * Main interface for tracking student outcomes throughout their career journey.
 */
export class OutcomeTracker implements IOutcomeTracker {
  private store: IOutcomeStore;
  private eventEngine: IOutcomeEventEngine;

  constructor(store: IOutcomeStore, eventEngine: IOutcomeEventEngine) {
    this.store = store;
    this.eventEngine = eventEngine;
  }

  /**
   * Start tracking a new student
   */
  async startTracking(
    studentId: StudentId,
    baseline: {
      timestamp: number;
      belief: StudentBeliefV3;
      dimensions: DimensionScoreMap;
      recommendations: CareerRecommendation[];
      confidence: number;
      clarity: number;
      wellbeing: number;
    }
  ): Promise<StudentOutcomeRecord> {
    const now = Date.now();

    const record: StudentOutcomeRecord = {
      id: generateRecordId(),
      studentId,
      createdAt: now,
      updatedAt: now,
      status: 'ACTIVE',
      baseline,
      outcomes: {
        careerDecisions: [],
        education: [],
        colleges: [],
        skills: [],
        internships: [],
        jobs: [],
        explorations: [],
      },
      psychological: {
        confidence: {
          baseline: baseline.confidence,
          measurements: [{
            timestamp: now,
            timepoint: 'BASELINE',
            value: baseline.confidence,
            source: 'SELF_REPORTED',
            dimensions: {},
          }],
          trend: 'STABLE',
          growthRate: 0,
          keyDrivers: [],
          inhibitors: [],
        },
        clarity: {
          baseline: baseline.clarity,
          measurements: [{
            timestamp: now,
            timepoint: 'BASELINE',
            value: baseline.clarity,
            source: 'SELF_REPORTED',
            aspects: {
              careerDirection: baseline.clarity,
              nextSteps: baseline.clarity,
              valuesAlignment: baseline.clarity,
              skillsPath: baseline.clarity,
            },
          }],
          trend: 'STABLE',
          growthRate: 0,
          decisionClarity: baseline.clarity,
          pathClarity: baseline.clarity,
        },
        wellbeing: {
          baseline: baseline.wellbeing,
          measurements: [{
            timestamp: now,
            timepoint: 'BASELINE',
            value: baseline.wellbeing,
            source: 'SELF_REPORTED',
            dimensions: {
              stress: 50,
              anxiety: 50,
              sleep: 50,
              energy: 50,
              motivation: 50,
              hopefulness: 50,
            },
          }],
          trend: 'STABLE',
          stressEvents: [],
          supportSystemEffectiveness: 50,
        },
      },
      growth: {
        profile: this.createInitialGrowthProfile(studentId, baseline),
        snapshots: [],
      },
      timeline: [{
        id: generateTimelineEntryId(),
        timestamp: now,
        timepoint: 'BASELINE',
        eventType: 'RECOMMENDATION_GIVEN',
        title: 'Tracking Started',
        description: 'Outcome tracking initiated with baseline assessment',
        data: { recommendations: baseline.recommendations.map(r => r.careerId) },
        metadata: {
          source: 'SYSTEM',
          confidence: 100,
          verified: true,
        },
      }],
      predictions: [],
      comparisons: [],
      recommendationAccuracy: [],
      qualityAssessments: [],
      metadata: {
        dataQuality: 100,
        completeness: 100,
        lastMeasurement: now,
        version: 1,
      },
    };

    await this.store.save(record);

    // Emit event
    this.eventEngine.emit(createOutcomeRecordedEvent(studentId, 'TRACKING_STARTED', {
      recordId: record.id,
      baseline,
    }));

    return record;
  }

  /**
   * Record a career decision outcome
   */
  async recordCareerDecisionOutcome(
    recordId: OutcomeRecordId,
    outcome: CareerDecisionOutcome
  ): Promise<void> {
    const record = await this.store.load(recordId);
    if (!record) throw new Error(`Record not found: ${recordId}`);

    record.outcomes.careerDecisions.push(outcome);
    record.updatedAt = Date.now();
    record.metadata.version++;

    await this.store.save(record);

    // Add timeline entry
    await this.addTimelineEntry(recordId, {
      id: generateTimelineEntryId(),
      timestamp: outcome.timeline.decisionDate,
      timepoint: this.inferTimepoint(outcome.timeline.decisionDate, record.createdAt),
      eventType: 'DECISION_MADE',
      title: 'Career Decision Made',
      description: `Selected ${outcome.optionSelected}`,
      data: { outcome },
      metadata: {
        source: 'STUDENT',
        confidence: 90,
        verified: false,
      },
    });

    this.eventEngine.emit(createOutcomeRecordedEvent(record.studentId, 'CAREER_DECISION', outcome));
  }

  /**
   * Record an education outcome
   */
  async recordEducationOutcome(
    recordId: OutcomeRecordId,
    outcome: EducationOutcome
  ): Promise<void> {
    const record = await this.store.load(recordId);
    if (!record) throw new Error(`Record not found: ${recordId}`);

    record.outcomes.education.push(outcome);
    record.updatedAt = Date.now();
    record.metadata.version++;

    await this.store.save(record);

    const eventType = outcome.completionStatus === 'COMPLETED' ? 'EDUCATION_COMPLETED' : 'EDUCATION_STARTED';

    await this.addTimelineEntry(recordId, {
      id: generateTimelineEntryId(),
      timestamp: Date.now(),
      timepoint: 'IMMEDIATE',
      eventType,
      title: outcome.completionStatus === 'COMPLETED' ? 'Education Completed' : 'Education Started',
      description: `${outcome.degreeType} in ${outcome.fieldOfStudy}`,
      data: { outcome },
      metadata: {
        source: 'SYSTEM',
        confidence: 95,
        verified: true,
      },
    });

    this.eventEngine.emit(createOutcomeRecordedEvent(record.studentId, 'EDUCATION', outcome));
  }

  /**
   * Record a skill outcome
   */
  async recordSkillOutcome(
    recordId: OutcomeRecordId,
    outcome: SkillOutcome
  ): Promise<void> {
    const record = await this.store.load(recordId);
    if (!record) throw new Error(`Record not found: ${recordId}`);

    record.outcomes.skills.push(outcome);
    record.updatedAt = Date.now();
    record.metadata.version++;

    await this.store.save(record);

    await this.addTimelineEntry(recordId, {
      id: generateTimelineEntryId(),
      timestamp: Date.now(),
      timepoint: 'IMMEDIATE',
      eventType: 'SKILL_ACQUIRED',
      title: 'Skill Acquired',
      description: `${outcome.skillName} - ${outcome.outcomeQuality}`,
      data: { outcome },
      metadata: {
        source: 'STUDENT',
        confidence: 80,
        verified: false,
      },
    });

    this.eventEngine.emit(createOutcomeRecordedEvent(record.studentId, 'SKILL', outcome));
  }

  /**
   * Record an internship outcome
   */
  async recordInternshipOutcome(
    recordId: OutcomeRecordId,
    outcome: InternshipOutcome
  ): Promise<void> {
    const record = await this.store.load(recordId);
    if (!record) throw new Error(`Record not found: ${recordId}`);

    record.outcomes.internships.push(outcome);
    record.updatedAt = Date.now();
    record.metadata.version++;

    await this.store.save(record);

    await this.addTimelineEntry(recordId, {
      id: generateTimelineEntryId(),
      timestamp: Date.now(),
      timepoint: 'IMMEDIATE',
      eventType: 'INTERNSHIP_COMPLETED',
      title: 'Internship Completed',
      description: `${outcome.role} at ${outcome.company}`,
      data: { outcome },
      metadata: {
        source: 'STUDENT',
        confidence: 90,
        verified: false,
      },
    });

    this.eventEngine.emit(createOutcomeRecordedEvent(record.studentId, 'INTERNSHIP', outcome));
  }

  /**
   * Record a job outcome
   */
  async recordJobOutcome(
    recordId: OutcomeRecordId,
    outcome: JobOutcome
  ): Promise<void> {
    const record = await this.store.load(recordId);
    if (!record) throw new Error(`Record not found: ${recordId}`);

    record.outcomes.jobs.push(outcome);
    record.updatedAt = Date.now();
    record.metadata.version++;

    await this.store.save(record);

    await this.addTimelineEntry(recordId, {
      id: generateTimelineEntryId(),
      timestamp: Date.now(),
      timepoint: 'IMMEDIATE',
      eventType: 'JOB_STARTED',
      title: 'Job Started',
      description: `${outcome.role} at ${outcome.company}`,
      data: { outcome },
      metadata: {
        source: 'STUDENT',
        confidence: 95,
        verified: false,
      },
    });

    this.eventEngine.emit(createOutcomeRecordedEvent(record.studentId, 'JOB', outcome));
  }

  /**
   * Record an exploration outcome
   */
  async recordExplorationOutcome(
    recordId: OutcomeRecordId,
    outcome: ExplorationOutcome
  ): Promise<void> {
    const record = await this.store.load(recordId);
    if (!record) throw new Error(`Record not found: ${recordId}`);

    record.outcomes.explorations.push(outcome);
    record.updatedAt = Date.now();
    record.metadata.version++;

    await this.store.save(record);

    await this.addTimelineEntry(recordId, {
      id: generateTimelineEntryId(),
      timestamp: Date.now(),
      timepoint: 'IMMEDIATE',
      eventType: 'EXPLORATION_COMPLETED',
      title: 'Exploration Completed',
      description: `Explored ${outcome.target} via ${outcome.method}`,
      data: { outcome },
      metadata: {
        source: 'STUDENT',
        confidence: 85,
        verified: false,
      },
    });

    // Update clarity and confidence based on exploration
    if (outcome.clarityChange !== 0) {
      this.updateClarity(record, outcome.clarityChange);
    }
    if (outcome.confidenceChange !== 0) {
      this.updateConfidence(record, outcome.confidenceChange);
    }

    await this.store.save(record);

    this.eventEngine.emit(createOutcomeRecordedEvent(record.studentId, 'EXPLORATION', outcome));
  }

  /**
   * Measure and record growth
   */
  async measureGrowth(
    recordId: OutcomeRecordId,
    snapshot: GrowthSnapshot
  ): Promise<void> {
    const record = await this.store.load(recordId);
    if (!record) throw new Error(`Record not found: ${recordId}`);

    record.growth.snapshots.push(snapshot);
    record.updatedAt = Date.now();
    record.metadata.lastMeasurement = Date.now();
    record.metadata.version++;

    // Update growth profile
    this.updateGrowthProfile(record.growth.profile, snapshot);

    await this.store.save(record);

    // Emit events for significant changes
    for (const [dimension, value] of Object.entries(snapshot.scores)) {
      const prevSnapshot = record.growth.snapshots[record.growth.snapshots.length - 2];
      const prevValue = prevSnapshot?.scores[dimension as GrowthDimension] ?? record.growth.profile.measurements.get(dimension as GrowthDimension)?.baseline ?? value;

      if (Math.abs(value - prevValue) > 5) {
        this.eventEngine.emit(createGrowthMeasuredEvent(
          record.studentId,
          dimension,
          value,
          prevValue
        ));
      }
    }

    this.eventEngine.emit(createOutcomeRecordedEvent(record.studentId, 'GROWTH_MEASURED', snapshot));
  }

  /**
   * Add timeline entry
   */
  async addTimelineEntry(recordId: OutcomeRecordId, entry: TimelineEntry): Promise<void> {
    const record = await this.store.load(recordId);
    if (!record) throw new Error(`Record not found: ${recordId}`);

    record.timeline.push(entry);
    record.updatedAt = Date.now();

    await this.store.save(record);

    this.eventEngine.emit(createTimelineUpdatedEvent(
      record.studentId,
      record.timeline.length,
      entry
    ));
  }

  /**
   * Get outcome record
   */
  async getRecord(recordId: OutcomeRecordId): Promise<StudentOutcomeRecord | null> {
    return this.store.load(recordId);
  }

  /**
   * Get record by student ID
   */
  async getRecordByStudent(studentId: StudentId): Promise<StudentOutcomeRecord | null> {
    return this.store.loadByStudent(studentId);
  }

  /**
   * Update psychological measurements
   */
  async updatePsychologicalMeasurements(
    recordId: OutcomeRecordId,
    type: 'confidence' | 'clarity' | 'wellbeing',
    value: number,
    details?: Record<string, unknown>
  ): Promise<void> {
    const record = await this.store.load(recordId);
    if (!record) throw new Error(`Record not found: ${recordId}`);

    const measurement = {
      timestamp: Date.now(),
      timepoint: this.inferTimepoint(Date.now(), record.createdAt),
      value,
      source: 'SELF_REPORTED' as const,
      ...details,
    };

    switch (type) {
      case 'confidence':
        record.psychological.confidence.measurements.push(measurement as typeof record.psychological.confidence.measurements[0]);
        this.updateConfidenceTrend(record.psychological.confidence);
        break;
      case 'clarity':
        record.psychological.clarity.measurements.push(measurement as typeof record.psychological.clarity.measurements[0]);
        this.updateClarityTrend(record.psychological.clarity);
        break;
      case 'wellbeing':
        record.psychological.wellbeing.measurements.push(measurement as typeof record.psychological.wellbeing.measurements[0]);
        this.updateWellbeingTrend(record.psychological.wellbeing);
        break;
    }

    record.updatedAt = Date.now();
    await this.store.save(record);

    this.eventEngine.emit(createOutcomeRecordedEvent(record.studentId, `PSYCHOLOGICAL_${type.toUpperCase()}`, {
      value,
      ...details,
    }));
  }

  /**
   * Mark record as completed
   */
  async completeTracking(recordId: OutcomeRecordId, finalAssessment: {
    overallSuccess: boolean;
    satisfaction: number;
    keyLearnings: string[];
  }): Promise<void> {
    const record = await this.store.load(recordId);
    if (!record) throw new Error(`Record not found: ${recordId}`);

    record.status = 'COMPLETED';
    record.updatedAt = Date.now();
    record.metadata.version++;

    await this.addTimelineEntry(recordId, {
      id: generateTimelineEntryId(),
      timestamp: Date.now(),
      timepoint: 'IMMEDIATE',
      eventType: 'MILESTONE_REACHED',
      title: 'Tracking Completed',
      description: `Final assessment: ${finalAssessment.overallSuccess ? 'Successful' : 'Mixed'} outcome`,
      data: finalAssessment,
      metadata: {
        source: 'SYSTEM',
        confidence: 100,
        verified: true,
      },
    });

    await this.store.save(record);

    this.eventEngine.emit(createOutcomeRecordedEvent(record.studentId, 'TRACKING_COMPLETED', finalAssessment));
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private createInitialGrowthProfile(
    studentId: StudentId,
    baseline: StudentOutcomeRecord['baseline']
  ): StudentGrowthProfile {
    const dimensions: GrowthDimension[] = [
      'CONFIDENCE', 'CLARITY', 'DECISION_QUALITY', 'SELF_AWARENESS',
      'CAREER_READINESS', 'EMOTIONAL_STABILITY', 'EXPLORATION_BREADTH',
      'RESILIENCE', 'MOTIVATION', 'SKILL_DEPTH', 'NETWORK_STRENGTH', 'EXECUTION_CAPABILITY'
    ];

    const measurements = new Map<GrowthDimension, typeof profile.measurements extends Map<infer K, infer V> ? V : never>();

    for (const dimension of dimensions) {
      measurements.set(dimension, {
        dimension,
        baseline: 50,
        current: 50,
        change: 0,
        changePercent: 0,
        trend: 'STABLE',
        trajectory: 'STEADY',
        milestones: [],
      });
    }

    const profile: StudentGrowthProfile = {
      studentId,
      baselineDate: baseline.timestamp,
      lastUpdated: baseline.timestamp,
      measurements,
      overallGrowth: 0,
      growthVelocity: 0,
      strongestDimensions: [],
      weakestDimensions: [],
      improvementAreas: [],
      successFactors: [],
    };

    return profile;
  }

  private updateGrowthProfile(profile: StudentGrowthProfile, snapshot: GrowthSnapshot): void {
    profile.lastUpdated = snapshot.timestamp;

    for (const [dimension, value] of Object.entries(snapshot.scores)) {
      const measurement = profile.measurements.get(dimension as GrowthDimension);
      if (measurement) {
        const oldValue = measurement.current;
        measurement.current = value;
        measurement.change = value - measurement.baseline;
        measurement.changePercent = measurement.baseline !== 0
          ? (measurement.change / measurement.baseline) * 100
          : 0;

        // Update trend
        if (value > oldValue + 2) {
          measurement.trend = 'IMPROVING';
        } else if (value < oldValue - 2) {
          measurement.trend = 'DECLINING';
        } else {
          measurement.trend = 'STABLE';
        }

        // Add milestone if significant change
        if (Math.abs(value - oldValue) > 10) {
          measurement.milestones.push({
            timestamp: snapshot.timestamp,
            value,
            trigger: 'significant_change',
          });
        }
      }
    }

    // Recalculate overall metrics
    const values = Array.from(profile.measurements.values());
    profile.overallGrowth = values.reduce((sum, m) => sum + m.changePercent, 0) / values.length;

    // Find strongest/weakest dimensions
    const sorted = [...values].sort((a, b) => b.current - a.current);
    profile.strongestDimensions = sorted.slice(0, 3).map(m => m.dimension);
    profile.weakestDimensions = sorted.slice(-3).map(m => m.dimension);
  }

  private updateConfidence(record: StudentOutcomeRecord, change: number): void {
    const current = record.psychological.confidence.measurements[record.psychological.confidence.measurements.length - 1]?.value ?? record.psychological.confidence.baseline;
    record.psychological.confidence.measurements.push({
      timestamp: Date.now(),
      timepoint: 'IMMEDIATE',
      value: Math.max(0, Math.min(100, current + change)),
      source: 'INFERRED',
      dimensions: {},
    });
    this.updateConfidenceTrend(record.psychological.confidence);
  }

  private updateClarity(record: StudentOutcomeRecord, change: number): void {
    const current = record.psychological.clarity.measurements[record.psychological.clarity.measurements.length - 1]?.value ?? record.psychological.clarity.baseline;
    record.psychological.clarity.measurements.push({
      timestamp: Date.now(),
      timepoint: 'IMMEDIATE',
      value: Math.max(0, Math.min(100, current + change)),
      source: 'INFERRED',
      aspects: {
        careerDirection: Math.max(0, Math.min(100, current + change)),
        nextSteps: Math.max(0, Math.min(100, current + change)),
        valuesAlignment: Math.max(0, Math.min(100, current + change)),
        skillsPath: Math.max(0, Math.min(100, current + change)),
      },
    });
    this.updateClarityTrend(record.psychological.clarity);
  }

  private updateConfidenceTrend(confidence: StudentOutcomeRecord['psychological']['confidence']): void {
    const measurements = confidence.measurements;
    if (measurements.length < 2) return;

    const recent = measurements.slice(-3);
    const values = recent.map(m => m.value);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;

    if (avg > confidence.baseline + 5) {
      confidence.trend = 'IMPROVING';
    } else if (avg < confidence.baseline - 5) {
      confidence.trend = 'DECLINING';
    } else {
      confidence.trend = 'STABLE';
    }

    confidence.growthRate = ((avg - confidence.baseline) / confidence.baseline) * 100;
  }

  private updateClarityTrend(clarity: StudentOutcomeRecord['psychological']['clarity']): void {
    const measurements = clarity.measurements;
    if (measurements.length < 2) return;

    const recent = measurements.slice(-3);
    const values = recent.map(m => m.value);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;

    if (avg > clarity.baseline + 5) {
      clarity.trend = 'IMPROVING';
    } else if (avg < clarity.baseline - 5) {
      clarity.trend = 'DECLINING';
    } else {
      clarity.trend = 'STABLE';
    }

    clarity.growthRate = ((avg - clarity.baseline) / clarity.baseline) * 100;
    clarity.decisionClarity = avg;
    clarity.pathClarity = avg;
  }

  private updateWellbeingTrend(wellbeing: StudentOutcomeRecord['psychological']['wellbeing']): void {
    const measurements = wellbeing.measurements;
    if (measurements.length < 2) return;

    const recent = measurements.slice(-3);
    const values = recent.map(m => m.value);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;

    if (avg > wellbeing.baseline + 5) {
      wellbeing.trend = 'IMPROVING';
    } else if (avg < wellbeing.baseline - 5) {
      wellbeing.trend = 'DECLINING';
    } else {
      wellbeing.trend = 'STABLE';
    }
  }

  private inferTimepoint(timestamp: number, baselineTimestamp: number): OutcomeTimepoint {
    const daysSince = Math.floor((timestamp - baselineTimestamp) / (1000 * 60 * 60 * 24));

    if (daysSince < 1) return 'IMMEDIATE';
    if (daysSince < 7) return '1_WEEK';
    if (daysSince < 30) return '1_MONTH';
    if (daysSince < 90) return '3_MONTHS';
    if (daysSince < 180) return '6_MONTHS';
    if (daysSince < 270) return '9_MONTHS';
    if (daysSince < 365) return '12_MONTHS';
    if (daysSince < 545) return '18_MONTHS';
    if (daysSince < 730) return '24_MONTHS';
    if (daysSince < 1095) return '36_MONTHS';
    if (daysSince < 1460) return '48_MONTHS';
    return '60_MONTHS';
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create outcome tracker
 */
export function createOutcomeTracker(
  store: IOutcomeStore,
  eventEngine: IOutcomeEventEngine
): OutcomeTracker {
  return new OutcomeTracker(store, eventEngine);
}
