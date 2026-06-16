/**
 * @fileoverview Canonical lifecycle model for the IntelligenceOrchestrator.
 *
 * The orchestrator coordinates authority execution order. It does not own
 * business intelligence and therefore models only lifecycle progression.
 */

import { AuthorityCapabilityRegistry } from '../authorities/AuthorityCapabilityRegistry';
import type {
  DomainAuthorityCapability,
  DomainAuthorityType,
} from '../authorities/AuthorityFacadeBase';

export type OrchestratorRequestType =
  | 'UNDERSTAND'
  | 'GENERATE'
  | 'TRACK'
  | 'LEARN'
  | 'FULL_LIFECYCLE';

export type RequestLifecycleState =
  | 'RECEIVED'
  | 'VALIDATING'
  | 'UNDERSTANDING'
  | 'GENERATING'
  | 'TRACKING'
  | 'LEARNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type AuthorityLifecycleState =
  | 'UNDERSTANDING'
  | 'GENERATING'
  | 'TRACKING'
  | 'LEARNING';

export interface LifecycleStageDescriptor {
  lifecycleState: AuthorityLifecycleState;
  authority: DomainAuthorityType;
  capability: DomainAuthorityCapability;
  defaultOperationName: string;
  description: string;
}

interface LifecycleStageTemplate {
  lifecycleState: AuthorityLifecycleState;
  capability: DomainAuthorityCapability;
  defaultOperationName: string;
  description: string;
}

const DEFAULT_CAPABILITY_REGISTRY = AuthorityCapabilityRegistry.createDefault();

const REQUEST_TYPE_STAGE_TEMPLATES: Readonly<
  Record<OrchestratorRequestType, readonly LifecycleStageTemplate[]>
> = {
  UNDERSTAND: [
    {
      lifecycleState: 'UNDERSTANDING',
      capability: 'UNDERSTAND',
      defaultOperationName: 'understand',
      description: 'Build or update student understanding through the student authority facade.',
    },
  ],
  GENERATE: [
    {
      lifecycleState: 'GENERATING',
      capability: 'GENERATE',
      defaultOperationName: 'generate',
      description: 'Generate options through the option authority facade.',
    },
  ],
  TRACK: [
    {
      lifecycleState: 'TRACKING',
      capability: 'LEARN',
      defaultOperationName: 'trackOutcome',
      description: 'Register tracking activity through the outcome authority facade.',
    },
  ],
  LEARN: [
    {
      lifecycleState: 'LEARNING',
      capability: 'LEARN',
      defaultOperationName: 'generateLearningSignals',
      description: 'Generate learning signals through the outcome authority facade.',
    },
  ],
  FULL_LIFECYCLE: [
    {
      lifecycleState: 'UNDERSTANDING',
      capability: 'UNDERSTAND',
      defaultOperationName: 'understand',
      description: 'Build or update student understanding through the student authority facade.',
    },
    {
      lifecycleState: 'GENERATING',
      capability: 'GENERATE',
      defaultOperationName: 'generate',
      description: 'Generate options through the option authority facade.',
    },
    {
      lifecycleState: 'TRACKING',
      capability: 'LEARN',
      defaultOperationName: 'trackOutcome',
      description: 'Register tracking activity through the outcome authority facade.',
    },
    {
      lifecycleState: 'LEARNING',
      capability: 'LEARN',
      defaultOperationName: 'generateLearningSignals',
      description: 'Generate learning signals through the outcome authority facade.',
    },
  ],
} as const;

const TRANSITIONS: Readonly<Record<RequestLifecycleState, readonly RequestLifecycleState[]>> = {
  RECEIVED: ['VALIDATING', 'FAILED', 'CANCELLED'],
  VALIDATING: [
    'UNDERSTANDING',
    'GENERATING',
    'TRACKING',
    'LEARNING',
    'COMPLETED',
    'FAILED',
    'CANCELLED',
  ],
  UNDERSTANDING: ['GENERATING', 'TRACKING', 'LEARNING', 'COMPLETED', 'FAILED', 'CANCELLED'],
  GENERATING: ['TRACKING', 'LEARNING', 'COMPLETED', 'FAILED', 'CANCELLED'],
  TRACKING: ['LEARNING', 'COMPLETED', 'FAILED', 'CANCELLED'],
  LEARNING: ['COMPLETED', 'FAILED', 'CANCELLED'],
  COMPLETED: [],
  FAILED: [],
  CANCELLED: [],
} as const;

export const REQUEST_LIFECYCLE_SEQUENCE: readonly RequestLifecycleState[] = [
  'RECEIVED',
  'VALIDATING',
  'UNDERSTANDING',
  'GENERATING',
  'TRACKING',
  'LEARNING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
] as const;

export function getLifecycleStagesForRequestType(
  requestType: OrchestratorRequestType,
  capabilityRegistry: AuthorityCapabilityRegistry = DEFAULT_CAPABILITY_REGISTRY
): readonly LifecycleStageDescriptor[] {
  return REQUEST_TYPE_STAGE_TEMPLATES[requestType].map((stage) => ({
    ...stage,
    authority: capabilityRegistry.requireAuthorityForCapability(stage.capability),
  }));
}

export function getDefaultCapabilitiesForRequestType(
  requestType: OrchestratorRequestType
): readonly DomainAuthorityCapability[] {
  return Array.from(
    new Set(REQUEST_TYPE_STAGE_TEMPLATES[requestType].map((stage) => stage.capability))
  );
}

export function canTransition(
  fromState: RequestLifecycleState,
  toState: RequestLifecycleState
): boolean {
  return TRANSITIONS[fromState].includes(toState);
}

export function isAuthorityLifecycleState(
  state: RequestLifecycleState
): state is AuthorityLifecycleState {
  return (
    state === 'UNDERSTANDING' ||
    state === 'GENERATING' ||
    state === 'TRACKING' ||
    state === 'LEARNING'
  );
}

export function getLifecycleStatesForStages(
  stages: readonly LifecycleStageDescriptor[]
): readonly RequestLifecycleState[] {
  return stages.map((stage) => stage.lifecycleState);
}
