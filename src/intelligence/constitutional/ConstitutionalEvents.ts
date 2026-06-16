/**
 * @fileoverview CareerOS constitutional event definitions.
 *
 * Phase 4.0 only defines event shapes. It does not dispatch events, redirect
 * traffic, or enforce behavior.
 */

import type {
  AuthorityType,
  EnforcementMode,
  ViolationRecord,
} from './ConstitutionalTypes';

export type ConstitutionalEventType =
  | 'ownership.registry.loaded'
  | 'ownership.record.observed'
  | 'validation.started'
  | 'validation.completed'
  | 'violation.observed'
  | 'authority.usage.observed'
  | 'dependency.relationship.observed'
  | 'audit.report.created';

export interface ConstitutionalEventEnvelope<TPayload extends Record<string, unknown> = Record<string, unknown>> {
  eventId: string;
  eventType: ConstitutionalEventType;
  schemaVersion: '1.0.0';
  occurredAt: string;
  authority: AuthorityType;
  enforcementMode: EnforcementMode;
  payload: TPayload;
}

export interface ConstitutionalEventDefinition {
  eventType: ConstitutionalEventType;
  owner: AuthorityType;
  schemaVersion: '1.0.0';
  description: string;
}

export const CONSTITUTIONAL_EVENT_DEFINITIONS: readonly ConstitutionalEventDefinition[] = [
  {
    eventType: 'ownership.registry.loaded',
    owner: 'IntelligenceOrchestrator',
    schemaVersion: '1.0.0',
    description: 'Read-only constitutional ownership registry was loaded.',
  },
  {
    eventType: 'ownership.record.observed',
    owner: 'IntelligenceOrchestrator',
    schemaVersion: '1.0.0',
    description: 'An ownership record was observed during registry or audit processing.',
  },
  {
    eventType: 'validation.started',
    owner: 'IntelligenceOrchestrator',
    schemaVersion: '1.0.0',
    description: 'Observe-mode constitutional validation started.',
  },
  {
    eventType: 'validation.completed',
    owner: 'IntelligenceOrchestrator',
    schemaVersion: '1.0.0',
    description: 'Observe-mode constitutional validation completed.',
  },
  {
    eventType: 'violation.observed',
    owner: 'IntelligenceOrchestrator',
    schemaVersion: '1.0.0',
    description: 'A constitutional violation was observed. No enforcement is applied in Phase 4.0.',
  },
  {
    eventType: 'authority.usage.observed',
    owner: 'IntelligenceOrchestrator',
    schemaVersion: '1.0.0',
    description: 'Authority usage was observed for audit reporting.',
  },
  {
    eventType: 'dependency.relationship.observed',
    owner: 'IntelligenceOrchestrator',
    schemaVersion: '1.0.0',
    description: 'Dependency relationship was observed for audit reporting.',
  },
  {
    eventType: 'audit.report.created',
    owner: 'IntelligenceOrchestrator',
    schemaVersion: '1.0.0',
    description: 'Constitutional audit report was created.',
  },
] as const;

export function createConstitutionalEvent<TPayload extends Record<string, unknown>>(
  eventType: ConstitutionalEventType,
  payload: TPayload,
  options: {
    eventId?: string;
    authority?: AuthorityType;
    occurredAt?: string;
  } = {}
): ConstitutionalEventEnvelope<TPayload> {
  return {
    eventId: options.eventId ?? createEventId(eventType),
    eventType,
    schemaVersion: '1.0.0',
    occurredAt: options.occurredAt ?? new Date().toISOString(),
    authority: options.authority ?? 'IntelligenceOrchestrator',
    enforcementMode: 'observe',
    payload,
  };
}

export function violationToEvent(
  violation: ViolationRecord
): ConstitutionalEventEnvelope<{ violation: ViolationRecord }> {
  return createConstitutionalEvent('violation.observed', { violation });
}

function createEventId(eventType: ConstitutionalEventType): string {
  const suffix = Math.random().toString(36).slice(2, 10);
  return `constitutional-${eventType}-${Date.now()}-${suffix}`;
}
