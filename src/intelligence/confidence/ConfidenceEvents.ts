/**
 * CareerOS Confidence Authority Events
 * 
 * Event definitions for confidence operations.
 * 
 * @module confidence/events
 * @version 1.0.0
 */

import type { 
  Confidence, 
  ConfidenceValue, 
  CalibrationProfile,
  ReliabilityBand 
} from './ConfidenceTypes';

// ============================================================================
// EVENT TYPES
// ============================================================================

export type ConfidenceEventType =
  | 'confidence.calculated'
  | 'confidence.calibrated'
  | 'confidence.aggregated'
  | 'confidence.drift.detected'
  | 'confidence.validation.failed'
  | 'source.trust.updated'
  | 'calibration.observation.added'
  | 'calibration.profile.updated'
  | 'reliability.changed';

// ============================================================================
// EVENT PAYLOADS
// ============================================================================

export interface ConfidenceCalculatedEvent {
  readonly type: 'confidence.calculated';
  readonly timestamp: number;
  readonly lineageId: string;
  readonly requestId: string;
  readonly systemId: string;
  readonly predictionType: string;
  readonly confidence: Confidence;
  readonly duration: number;
  readonly factors: string[];
}

export interface ConfidenceCalibratedEvent {
  readonly type: 'confidence.calibrated';
  readonly timestamp: number;
  readonly lineageId: string;
  readonly systemId: string;
  readonly originalConfidence: Confidence;
  readonly calibratedConfidence: Confidence;
  readonly adjustmentFactor: number;
  readonly profileId: string;
}

export interface ConfidenceAggregatedEvent {
  readonly type: 'confidence.aggregated';
  readonly timestamp: number;
  readonly lineageId: string;
  readonly systemId: string;
  readonly method: string;
  readonly inputCount: number;
  readonly result: Confidence;
}

export interface ConfidenceDriftDetectedEvent {
  readonly type: 'confidence.drift.detected';
  readonly timestamp: number;
  readonly systemId: string;
  readonly severity: 'mild' | 'moderate' | 'severe';
  readonly direction: 'overconfidence' | 'underconfidence' | 'mixed';
  readonly affectedBins: string[];
  readonly recommendation: string;
}

export interface ConfidenceValidationFailedEvent {
  readonly type: 'confidence.validation.failed';
  readonly timestamp: number;
  readonly lineageId: string;
  readonly systemId: string;
  readonly error: string;
  readonly invalidValue: unknown;
}

export interface SourceTrustUpdatedEvent {
  readonly type: 'source.trust.updated';
  readonly timestamp: number;
  readonly sourceId: string;
  readonly oldTrust: number;
  readonly newTrust: number;
  readonly reason: string;
}

export interface CalibrationObservationAddedEvent {
  readonly type: 'calibration.observation.added';
  readonly timestamp: number;
  readonly observationId: string;
  readonly systemId: string;
  readonly predictedConfidence: Confidence;
  readonly actualOutcome: boolean;
}

export interface CalibrationProfileUpdatedEvent {
  readonly type: 'calibration.profile.updated';
  readonly timestamp: number;
  readonly systemId: string;
  readonly profile: CalibrationProfile;
  readonly previousReliability: ReliabilityBand;
  readonly newReliability: ReliabilityBand;
}

export interface ReliabilityChangedEvent {
  readonly type: 'reliability.changed';
  readonly timestamp: number;
  readonly systemId: string;
  readonly oldReliability: number;
  readonly newReliability: number;
  readonly reason: string;
}

// ============================================================================
// EVENT UNION
// ============================================================================

export type ConfidenceEvent =
  | ConfidenceCalculatedEvent
  | ConfidenceCalibratedEvent
  | ConfidenceAggregatedEvent
  | ConfidenceDriftDetectedEvent
  | ConfidenceValidationFailedEvent
  | SourceTrustUpdatedEvent
  | CalibrationObservationAddedEvent
  | CalibrationProfileUpdatedEvent
  | ReliabilityChangedEvent;

// ============================================================================
// EVENT EMITTER INTERFACE
// ============================================================================

export interface IConfidenceEventEmitter {
  emit(event: ConfidenceEvent): void;
  on<T extends ConfidenceEvent>(
    type: T['type'], 
    handler: (event: T) => void
  ): void;
  off<T extends ConfidenceEvent>(
    type: T['type'], 
    handler: (event: T) => void
  ): void;
}

// ============================================================================
// SIMPLE EVENT EMITTER IMPLEMENTATION
// ============================================================================

export class ConfidenceEventEmitter implements IConfidenceEventEmitter {
  private handlers: Map<string, Set<(event: ConfidenceEvent) => void>> = new Map();

  emit(event: ConfidenceEvent): void {
    const handlers = this.handlers.get(event.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch {
          console.error('Confidence event handler failed safely.');
        }
      });
    }
  }

  on<T extends ConfidenceEvent>(
    type: T['type'],
    handler: (event: T) => void
  ): void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler as (event: ConfidenceEvent) => void);
  }

  off<T extends ConfidenceEvent>(
    type: T['type'],
    handler: (event: T) => void
  ): void {
    const handlers = this.handlers.get(type);
    if (handlers) {
      handlers.delete(handler as (event: ConfidenceEvent) => void);
    }
  }
}

// ============================================================================
// EVENT FACTORIES
// ============================================================================

export function createCalculatedEvent(
  lineageId: string,
  requestId: string,
  systemId: string,
  predictionType: string,
  confidence: Confidence,
  duration: number,
  factors: string[]
): ConfidenceCalculatedEvent {
  return {
    type: 'confidence.calculated',
    timestamp: Date.now(),
    lineageId,
    requestId,
    systemId,
    predictionType,
    confidence,
    duration,
    factors,
  };
}

export function createDriftDetectedEvent(
  systemId: string,
  severity: 'mild' | 'moderate' | 'severe',
  direction: 'overconfidence' | 'underconfidence' | 'mixed',
  affectedBins: string[],
  recommendation: string
): ConfidenceDriftDetectedEvent {
  return {
    type: 'confidence.drift.detected',
    timestamp: Date.now(),
    systemId,
    severity,
    direction,
    affectedBins,
    recommendation,
  };
}

export function createSourceTrustUpdatedEvent(
  sourceId: string,
  oldTrust: number,
  newTrust: number,
  reason: string
): SourceTrustUpdatedEvent {
  return {
    type: 'source.trust.updated',
    timestamp: Date.now(),
    sourceId,
    oldTrust,
    newTrust,
    reason,
  };
}
