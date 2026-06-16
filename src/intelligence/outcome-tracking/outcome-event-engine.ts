/**
 * CareerOS Outcome Tracking System - Event Engine
 *
 * Phase 8.9: Outcome Tracking System
 *
 * Event-driven architecture for recording, processing, and distributing
 * outcome-related events throughout the CareerOS system.
 *
 * @module intelligence/outcome-tracking
 * @version 1.0.0
 */

import {
  type OutcomeEvent,
  type OutcomeEventType,
  type OutcomeEventHandler,
  type OutcomeEventId,
  type StudentId,
  type LearningSignal,
} from './outcome-types.js';

// ============================================================================
// EVENT ID GENERATION
// ============================================================================

/**
 * Generate unique event ID
 */
function generateEventId(): OutcomeEventId {
  return `evt-${Date.now()}-${Math.random().toString(36).substring(2, 11)}` as OutcomeEventId;
}

/**
 * Generate trace ID for event correlation
 */
function generateTraceId(): string {
  return `trace-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

// ============================================================================
// EVENT FACTORIES
// ============================================================================

/**
 * Create outcome recorded event
 */
export function createOutcomeRecordedEvent(
  studentId: StudentId,
  outcomeType: string,
  outcomeData: unknown
): OutcomeEvent {
  return {
    id: generateEventId(),
    type: 'OUTCOME_RECORDED',
    timestamp: Date.now(),
    studentId,
    payload: {
      outcomeType,
      outcomeData,
      recordedAt: Date.now(),
    },
    metadata: {
      source: 'outcome-tracker',
      version: '1.0.0',
      traceId: generateTraceId(),
    },
  };
}

/**
 * Create growth measured event
 */
export function createGrowthMeasuredEvent(
  studentId: StudentId,
  dimension: string,
  value: number,
  previousValue: number
): OutcomeEvent {
  return {
    id: generateEventId(),
    type: 'GROWTH_MEASURED',
    timestamp: Date.now(),
    studentId,
    payload: {
      dimension,
      value,
      previousValue,
      change: value - previousValue,
      changePercent: previousValue !== 0 ? ((value - previousValue) / previousValue) * 100 : 0,
    },
    metadata: {
      source: 'growth-engine',
      version: '1.0.0',
      traceId: generateTraceId(),
    },
  };
}

/**
 * Create prediction made event
 */
export function createPredictionMadeEvent(
  studentId: StudentId,
  predictionId: string,
  predictionType: string,
  predictedValue: number,
  confidence: number
): OutcomeEvent {
  return {
    id: generateEventId(),
    type: 'PREDICTION_MADE',
    timestamp: Date.now(),
    studentId,
    payload: {
      predictionId,
      predictionType,
      predictedValue,
      confidence,
      timeframe: '3_MONTHS',
    },
    metadata: {
      source: 'prediction-engine',
      version: '1.0.0',
      traceId: generateTraceId(),
    },
  };
}

/**
 * Create prediction validated event
 */
export function createPredictionValidatedEvent(
  studentId: StudentId,
  predictionId: string,
  predictedValue: number,
  actualValue: number,
  accuracy: number
): OutcomeEvent {
  return {
    id: generateEventId(),
    type: 'PREDICTION_VALIDATED',
    timestamp: Date.now(),
    studentId,
    payload: {
      predictionId,
      predictedValue,
      actualValue,
      absoluteError: Math.abs(actualValue - predictedValue),
      relativeError: predictedValue !== 0 ? Math.abs((actualValue - predictedValue) / predictedValue) : 0,
      accuracy,
      bias: actualValue > predictedValue ? 'PESSIMISTIC' : actualValue < predictedValue ? 'OPTIMISTIC' : 'CALIBRATED',
    },
    metadata: {
      source: 'comparison-engine',
      version: '1.0.0',
      traceId: generateTraceId(),
    },
  };
}

/**
 * Create comparison generated event
 */
export function createComparisonGeneratedEvent(
  studentId: StudentId,
  comparisonType: string,
  comparisons: unknown[]
): OutcomeEvent {
  return {
    id: generateEventId(),
    type: 'COMPARISON_GENERATED',
    timestamp: Date.now(),
    studentId,
    payload: {
      comparisonType,
      comparisons,
      generatedAt: Date.now(),
    },
    metadata: {
      source: 'comparison-engine',
      version: '1.0.0',
      traceId: generateTraceId(),
    },
  };
}

/**
 * Create quality assessed event
 */
export function createQualityAssessedEvent(
  studentId: StudentId,
  quality: string,
  score: number
): OutcomeEvent {
  return {
    id: generateEventId(),
    type: 'QUALITY_ASSESSED',
    timestamp: Date.now(),
    studentId,
    payload: {
      quality,
      score,
      assessedAt: Date.now(),
    },
    metadata: {
      source: 'quality-engine',
      version: '1.0.0',
      traceId: generateTraceId(),
    },
  };
}

/**
 * Create signal generated event
 */
export function createSignalGeneratedEvent(
  studentId: StudentId,
  signal: LearningSignal
): OutcomeEvent {
  return {
    id: generateEventId(),
    type: 'SIGNAL_GENERATED',
    timestamp: Date.now(),
    studentId,
    payload: {
      signal,
      generatedAt: Date.now(),
    },
    metadata: {
      source: 'learning-signal-engine',
      version: '1.0.0',
      traceId: generateTraceId(),
    },
  };
}

/**
 * Create timeline updated event
 */
export function createTimelineUpdatedEvent(
  studentId: StudentId,
  entryCount: number,
  latestEntry: unknown
): OutcomeEvent {
  return {
    id: generateEventId(),
    type: 'TIMELINE_UPDATED',
    timestamp: Date.now(),
    studentId,
    payload: {
      entryCount,
      latestEntry,
      updatedAt: Date.now(),
    },
    metadata: {
      source: 'timeline-engine',
      version: '1.0.0',
      traceId: generateTraceId(),
    },
  };
}

// ============================================================================
// EVENT ENGINE IMPLEMENTATION
// ============================================================================

/**
 * Outcome Event Engine
 *
 * Central event bus for outcome tracking system.
 * Handles event subscription, emission, and distribution.
 */
export class OutcomeEventEngine {
  private handlers: Map<OutcomeEventType, Set<OutcomeEventHandler>> = new Map();
  private eventHistory: OutcomeEvent[] = [];
  private maxHistorySize: number;
  private middleware: Array<(event: OutcomeEvent) => OutcomeEvent | null> = [];

  constructor(maxHistorySize = 1000) {
    this.maxHistorySize = maxHistorySize;
  }

  /**
   * Subscribe to event type
   */
  subscribe(eventType: OutcomeEventType, handler: OutcomeEventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
  }

  /**
   * Subscribe to multiple event types
   */
  subscribeToMany(eventTypes: OutcomeEventType[], handler: OutcomeEventHandler): void {
    for (const eventType of eventTypes) {
      this.subscribe(eventType, handler);
    }
  }

  /**
   * Unsubscribe from event type
   */
  unsubscribe(eventType: OutcomeEventType, handler: OutcomeEventHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Add middleware for event processing
   */
  use(middleware: (event: OutcomeEvent) => OutcomeEvent | null): void {
    this.middleware.push(middleware);
  }

  /**
   * Emit event to all subscribers
   */
  emit(event: OutcomeEvent): void {
    // Process through middleware
    let processedEvent = event;
    for (const mw of this.middleware) {
      const result = mw(processedEvent);
      if (result === null) {
        // Event was filtered out
        return;
      }
      processedEvent = result;
    }

    // Store in history
    this.addToHistory(processedEvent);

    // Notify subscribers
    const handlers = this.handlers.get(processedEvent.type);
    if (handlers) {
      for (const handler of handlers) {
        try {
          const result = handler(processedEvent);
          if (result instanceof Promise) {
            result.catch(() => {
              console.error('Outcome event async handler failed safely.');
            });
          }
        } catch {
          console.error('Outcome event handler failed safely.');
        }
      }
    }

    // Always notify wildcard subscribers
    const wildcardHandlers = this.handlers.get('*' as OutcomeEventType);
    if (wildcardHandlers) {
      for (const handler of wildcardHandlers) {
        try {
          const result = handler(processedEvent);
          if (result instanceof Promise) {
            result.catch(() => {
              console.error('Outcome wildcard async handler failed safely.');
            });
          }
        } catch {
          console.error('Outcome wildcard handler failed safely.');
        }
      }
    }
  }

  /**
   * Emit event asynchronously
   */
  async emitAsync(event: OutcomeEvent): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.emit(event);
        resolve();
      }, 0);
    });
  }

  /**
   * Add event to history with size limit
   */
  private addToHistory(event: OutcomeEvent): void {
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  /**
   * Get event history
   */
  getEventHistory(): OutcomeEvent[] {
    return [...this.eventHistory];
  }

  /**
   * Get events by type
   */
  getEventsByType(eventType: OutcomeEventType): OutcomeEvent[] {
    return this.eventHistory.filter(e => e.type === eventType);
  }

  /**
   * Get events by student
   */
  getEventsByStudent(studentId: StudentId): OutcomeEvent[] {
    return this.eventHistory.filter(e => e.studentId === studentId);
  }

  /**
   * Get events by time range
   */
  getEventsByTimeRange(start: number, end: number): OutcomeEvent[] {
    return this.eventHistory.filter(e => e.timestamp >= start && e.timestamp <= end);
  }

  /**
   * Get latest event of type
   */
  getLatestEvent(eventType: OutcomeEventType): OutcomeEvent | undefined {
    const events = this.getEventsByType(eventType);
    return events.length > 0 ? events[events.length - 1] : undefined;
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Get subscriber count for event type
   */
  getSubscriberCount(eventType: OutcomeEventType): number {
    return this.handlers.get(eventType)?.size ?? 0;
  }

  /**
   * Get all subscribed event types
   */
  getSubscribedEventTypes(): OutcomeEventType[] {
    return Array.from(this.handlers.keys()).filter(
      type => this.handlers.get(type)!.size > 0
    ) as OutcomeEventType[];
  }

  /**
   * Check if has subscribers
   */
  hasSubscribers(eventType: OutcomeEventType): boolean {
    return this.getSubscriberCount(eventType) > 0;
  }

  /**
   * Wait for specific event type
   */
  waitForEvent(eventType: OutcomeEventType, timeoutMs = 5000): Promise<OutcomeEvent> {
    return new Promise((resolve, reject) => {
      const handler: OutcomeEventHandler = (event) => {
        this.unsubscribe(eventType, handler);
        resolve(event);
      };

      this.subscribe(eventType, handler);

      setTimeout(() => {
        this.unsubscribe(eventType, handler);
        reject(new Error(`Timeout waiting for event type: ${eventType}`));
      }, timeoutMs);
    });
  }
}

// ============================================================================
// EVENT BATCHING
// ============================================================================

/**
 * Batched event emitter for high-frequency events
 */
export class BatchedEventEmitter {
  private engine: OutcomeEventEngine;
  private batch: OutcomeEvent[] = [];
  private batchSize: number;
  private flushInterval: number;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(engine: OutcomeEventEngine, batchSize = 10, flushIntervalMs = 1000) {
    this.engine = engine;
    this.batchSize = batchSize;
    this.flushInterval = flushIntervalMs;
    this.startTimer();
  }

  /**
   * Add event to batch
   */
  emit(event: OutcomeEvent): void {
    this.batch.push(event);
    if (this.batch.length >= this.batchSize) {
      this.flush();
    }
  }

  /**
   * Flush batched events
   */
  flush(): void {
    if (this.batch.length === 0) return;

    const events = [...this.batch];
    this.batch = [];

    // Emit batch event
    const batchEvent: OutcomeEvent = {
      id: generateEventId(),
      type: 'OUTCOME_RECORDED',
      timestamp: Date.now(),
      studentId: events[0].studentId,
      payload: {
        batched: true,
        count: events.length,
        events: events.map(e => ({ type: e.type, timestamp: e.timestamp })),
      },
      metadata: {
        source: 'batched-emitter',
        version: '1.0.0',
        traceId: generateTraceId(),
      },
    };

    this.engine.emit(batchEvent);

    // Also emit individual events
    for (const event of events) {
      this.engine.emit(event);
    }
  }

  /**
   * Start flush timer
   */
  private startTimer(): void {
    this.timer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * Stop flush timer
   */
  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.flush();
  }
}

// ============================================================================
// EVENT REPLAY
// ============================================================================

/**
 * Event replay utility for testing and recovery
 */
export class EventReplay {
  private engine: OutcomeEventEngine;

  constructor(engine: OutcomeEventEngine) {
    this.engine = engine;
  }

  /**
   * Replay events in order
   */
  replay(events: OutcomeEvent[], speed = 1): Promise<void> {
    return new Promise((resolve) => {
      let index = 0;

      const processNext = () => {
        if (index >= events.length) {
          resolve();
          return;
        }

        const event = events[index++];
        this.engine.emit(event);

        if (index < events.length && speed > 0) {
          const delay = (events[index].timestamp - event.timestamp) / speed;
          setTimeout(processNext, Math.max(delay, 0));
        } else {
          processNext();
        }
      };

      processNext();
    });
  }

  /**
   * Replay events for specific student
   */
  replayForStudent(events: OutcomeEvent[], studentId: StudentId, speed = 1): Promise<void> {
    const studentEvents = events.filter(e => e.studentId === studentId);
    return this.replay(studentEvents, speed);
  }

  /**
   * Replay events by type
   */
  replayByType(events: OutcomeEvent[], eventType: OutcomeEventType, speed = 1): Promise<void> {
    const typeEvents = events.filter(e => e.type === eventType);
    return this.replay(typeEvents, speed);
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create event engine
 */
export function createOutcomeEventEngine(maxHistorySize?: number): OutcomeEventEngine {
  return new OutcomeEventEngine(maxHistorySize);
}

/**
 * Create batched emitter
 */
export function createBatchedEmitter(
  engine: OutcomeEventEngine,
  batchSize?: number,
  flushIntervalMs?: number
): BatchedEventEmitter {
  return new BatchedEventEmitter(engine, batchSize, flushIntervalMs);
}

/**
 * Create event replay
 */
export function createEventReplay(engine: OutcomeEventEngine): EventReplay {
  return new EventReplay(engine);
}
