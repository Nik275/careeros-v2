/**
 * @fileoverview Decision Events - Event System
 * @module @/intelligence/decision/DecisionEvents
 * 
 * Event system for decision lifecycle management.
 * 
 * @version 1.0.0
 * @author CareerOS Constitutional Architecture Team
 * @since Wave 2.1 - Decision Authority Infrastructure
 */

import type { DecisionId, DecisionEvent, DecisionEventType, DecisionOutput } from './DecisionTypes';

/**
 * Event handler type.
 */
export type DecisionEventHandler = (event: DecisionEvent) => void | Promise<void>;

/**
 * Interface for Decision Events.
 */
export interface IDecisionEvents {
  /**
   * Subscribe to events.
   */
  on(eventType: DecisionEventType | 'all', handler: DecisionEventHandler): () => void;

  /**
   * Emit an event.
   */
  emit(event: DecisionEvent): void;

  /**
   * Create and emit a decision event.
   */
  emitDecisionEvent(
    type: DecisionEventType,
    decisionId: DecisionId,
    payload: unknown
  ): void;

  /**
   * Get event history for a decision.
   */
  getHistory(decisionId: DecisionId): ReadonlyArray<DecisionEvent>;

  /**
   * Clear all handlers.
   */
  clear(): void;
}

/**
 * Decision Events implementation.
 */
export class DecisionEvents implements IDecisionEvents {
  private handlers: Map<DecisionEventType | 'all', Set<DecisionEventHandler>> = new Map();
  private history: Map<DecisionId, DecisionEvent[]> = new Map();

  on(eventType: DecisionEventType | 'all', handler: DecisionEventHandler): () => void {
    const handlers = this.handlers.get(eventType) ?? new Set();
    handlers.add(handler);
    this.handlers.set(eventType, handlers);

    // Return unsubscribe function
    return () => {
      handlers.delete(handler);
    };
  }

  emit(event: DecisionEvent): void {
    // Store in history
    const decisionHistory = this.history.get(event.decisionId) ?? [];
    decisionHistory.push(event);
    this.history.set(event.decisionId, decisionHistory);

    // Call specific handlers
    const specificHandlers = this.handlers.get(event.type);
    if (specificHandlers) {
      for (const handler of specificHandlers) {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in event handler for ${event.type}:`, error);
        }
      }
    }

    // Call 'all' handlers
    const allHandlers = this.handlers.get('all');
    if (allHandlers) {
      for (const handler of allHandlers) {
        try {
          handler(event);
        } catch (error) {
          console.error('Error in "all" event handler:', error);
        }
      }
    }
  }

  emitDecisionEvent(
    type: DecisionEventType,
    decisionId: DecisionId,
    payload: unknown
  ): void {
    const event: DecisionEvent = {
      type,
      decisionId,
      timestamp: new Date(),
      payload,
      traceId: this.generateTraceId(),
    };

    this.emit(event);
  }

  getHistory(decisionId: DecisionId): ReadonlyArray<DecisionEvent> {
    return this.history.get(decisionId) ?? [];
  }

  clear(): void {
    this.handlers.clear();
    this.history.clear();
  }

  /**
   * Generate trace ID.
   */
  private generateTraceId(): string {
    return `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Factory function for creating Decision Events.
 */
export function createDecisionEvents(): IDecisionEvents {
  return new DecisionEvents();
}

// Default instance
export const defaultDecisionEvents = createDecisionEvents();

/**
 * Helper to emit standard decision lifecycle events.
 */
export function emitDecisionLifecycleEvents(
  events: IDecisionEvents,
  decisionId: DecisionId,
  output: DecisionOutput
): void {
  // Emit completed event
  events.emitDecisionEvent('decision-completed', decisionId, {
    winner: output.winner?.id,
    confidence: output.confidence,
    duration: output.audit.steps.reduce((sum, step) => sum + step.duration, 0),
  });
}
