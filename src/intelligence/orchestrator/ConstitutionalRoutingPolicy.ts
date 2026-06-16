/**
 * @fileoverview Observe-mode routing policy for the orchestrator skeleton.
 *
 * The policy validates capability-to-authority routing without introducing
 * production traffic redirection or business intelligence behavior.
 */

import {
  ConstitutionalOwnershipRegistry,
  createConstitutionalEvent,
  type ConstitutionalEventEnvelope,
  type ViolationRecord,
} from '../constitutional';
import { AuthorityCapabilityRegistry } from '../authorities/AuthorityCapabilityRegistry';
import type { AuthorityRegistryStatus } from '../authorities/AuthorityRegistrationService';
import type {
  DomainAuthorityCapability,
  DomainAuthorityType,
} from '../authorities/AuthorityFacadeBase';
import type { OrchestratorRequest } from './OrchestratorRequest';
import {
  getDefaultCapabilitiesForRequestType,
  getLifecycleStagesForRequestType,
  type LifecycleStageDescriptor,
} from './RequestLifecycle';

export interface ConstitutionalRoutingPolicyOptions {
  registry?: ConstitutionalOwnershipRegistry;
  capabilityRegistry?: AuthorityCapabilityRegistry;
  policyVersion?: string;
  now?: () => string;
  onEvent?: (event: ConstitutionalEventEnvelope<Record<string, unknown>>) => void;
}

export interface RoutingPolicyDecision {
  policyId: string;
  requestId: string;
  allowed: boolean;
  reason: string;
  policyVersion: string;
  requiredAuthorities: readonly DomainAuthorityType[];
  requiredCapabilities: readonly DomainAuthorityCapability[];
  lifecycleStages: readonly LifecycleStageDescriptor[];
  violations: readonly ViolationRecord[];
  emittedEvents: readonly ConstitutionalEventEnvelope<Record<string, unknown>>[];
  registryHealthy: boolean;
  notes: readonly string[];
}

export class ConstitutionalRoutingPolicy {
  private readonly registry: ConstitutionalOwnershipRegistry;
  private readonly capabilityRegistry: AuthorityCapabilityRegistry;
  private readonly policyVersion: string;
  private readonly now: () => string;
  private readonly onEvent?: (event: ConstitutionalEventEnvelope<Record<string, unknown>>) => void;

  constructor(options: ConstitutionalRoutingPolicyOptions = {}) {
    this.registry = options.registry ?? ConstitutionalOwnershipRegistry.createDefault();
    this.capabilityRegistry =
      options.capabilityRegistry ?? AuthorityCapabilityRegistry.createDefault();
    this.policyVersion = options.policyVersion ?? '4.3.0';
    this.now = options.now ?? (() => new Date().toISOString());
    this.onEvent = options.onEvent;
  }

  evaluateRequest(
    request: OrchestratorRequest,
    registryStatus: AuthorityRegistryStatus
  ): RoutingPolicyDecision {
    const emittedEvents: ConstitutionalEventEnvelope<Record<string, unknown>>[] = [];
    emitPolicyEvent(
      emittedEvents,
      this.onEvent,
      'validation.started',
      {
        requestId: request.requestId,
        requestType: request.requestType,
        requestedCapabilities: request.requestedCapabilities,
      },
      this.now
    );

    const violations: ViolationRecord[] = [];
    const notes: string[] = [];

    if (!registryStatus.registryHealthy) {
      violations.push(
        createRoutingViolation({
          requestId: request.requestId,
          type: 'REGISTRY_VIOLATION',
          description: 'Authority registry is not healthy for orchestrator routing.',
          impact: 'The orchestrator cannot safely assume authority ownership coverage.',
          resolutionStrategy:
            'Restore registry health before promoting orchestrator routing beyond skeleton mode.',
          evidence: ['AuthorityRegistrationService reported registryHealthy=false.'],
          now: this.now,
        })
      );
    }

    if (registryStatus.missingRequiredAuthorities.length > 0) {
      violations.push(
        createRoutingViolation({
          requestId: request.requestId,
          type: 'AUTHORITY_VIOLATION',
          description: 'Required authority facades are not registered.',
          impact: 'The orchestrator cannot coordinate the requested constitutional lifecycle.',
          resolutionStrategy: 'Register all required authority facades before execution.',
          evidence: registryStatus.missingRequiredAuthorities,
          now: this.now,
        })
      );
    }

    const defaults = getDefaultCapabilitiesForRequestType(request.requestType);
    let requiredCapabilities = defaults;
    const defaultCapabilityValidation =
      this.capabilityRegistry.validateRequestedCapabilities(defaults);
    notes.push(...defaultCapabilityValidation.notes);

    if (request.requestedCapabilities.length > 0) {
      const requestedCapabilityValidation = this.capabilityRegistry.validateRequestedCapabilities(
        request.requestedCapabilities
      );
      const normalizedRequested = requestedCapabilityValidation.requestedCapabilities;
      notes.push(...requestedCapabilityValidation.notes);

      if (!requestedCapabilityValidation.valid) {
        violations.push(
          createRoutingViolation({
            requestId: request.requestId,
            type: 'AUTHORITY_VIOLATION',
            description: 'Requested capabilities contained duplicate registrations.',
            impact:
              'Duplicate capability requests can produce ambiguous lifecycle planning and misleading audits.',
            resolutionStrategy:
              'Send each requested capability once per orchestrator request.',
            evidence: requestedCapabilityValidation.duplicateCapabilities,
            now: this.now,
          })
        );
      }

      if (request.requestType === 'FULL_LIFECYCLE') {
        if (!sameCapabilities(normalizedRequested, defaults)) {
          violations.push(
            createRoutingViolation({
              requestId: request.requestId,
              type: 'AUTHORITY_VIOLATION',
              description:
                'FULL_LIFECYCLE requests must resolve to UNDERSTAND -> GENERATE -> LEARN.',
              impact:
                'Partial lifecycle routing would break constitutional flow ownership boundaries.',
              resolutionStrategy:
                'Submit the full lifecycle or use a narrower request type that matches the requested capabilities.',
              evidence: normalizedRequested,
              now: this.now,
            })
          );
        }
        requiredCapabilities = defaults;
      } else if (!sameCapabilities(normalizedRequested, defaults)) {
        violations.push(
          createRoutingViolation({
            requestId: request.requestId,
            type: 'AUTHORITY_VIOLATION',
            description: `${request.requestType} request capabilities do not match its constitutional route.`,
            impact:
              'The orchestrator would route capabilities to authorities that do not match the request type.',
            resolutionStrategy:
              'Use a request type whose default capability route matches the requested capabilities.',
            evidence: normalizedRequested,
            now: this.now,
          })
        );
      } else {
        requiredCapabilities = normalizedRequested;
      }
    }

    const requiredAuthorities = uniqueAuthorities(
      requiredCapabilities.map((capability) =>
        this.capabilityRegistry.requireAuthorityForCapability(capability)
      )
    );
    const lifecycleStages = getLifecycleStagesForRequestType(
      request.requestType,
      this.capabilityRegistry
    );
    notes.push(`Resolved ${requiredCapabilities.length} capabilities for ${request.requestType}.`);

    for (const violation of violations) {
      emitPolicyEvent(
        emittedEvents,
        this.onEvent,
        'violation.observed',
        {
          requestId: request.requestId,
          violation,
        },
        this.now
      );
    }

    const allowed = violations.length === 0;
    emitPolicyEvent(
      emittedEvents,
      this.onEvent,
      'validation.completed',
      {
        requestId: request.requestId,
        allowed,
        requiredAuthorities,
        requiredCapabilities,
        violationCount: violations.length,
      },
      this.now
    );

    return {
      policyId: `routing-policy-${request.requestId}`,
      requestId: request.requestId,
      allowed,
      reason: allowed
        ? 'Routing policy accepted the request.'
        : 'Routing policy denied the request because constitutional prerequisites were not met.',
      policyVersion: this.policyVersion,
      requiredAuthorities,
      requiredCapabilities,
      lifecycleStages,
      violations,
      emittedEvents,
      registryHealthy: registryStatus.registryHealthy,
      notes,
    };
  }

  getCapabilityAuthorityMap(): Readonly<Record<DomainAuthorityCapability, DomainAuthorityType>> {
    return this.capabilityRegistry.getOwnerMap();
  }

  getPolicyVersion(): string {
    return this.policyVersion;
  }

  getRegistrySourceMetadata(): { sourceDocument: string; sourceWave: string } {
    const source = this.registry.getSourceMetadata();
    return {
      sourceDocument: source.sourceDocument,
      sourceWave: source.sourceWave,
    };
  }
}

function emitPolicyEvent(
  sink: ConstitutionalEventEnvelope<Record<string, unknown>>[],
  observer: ((event: ConstitutionalEventEnvelope<Record<string, unknown>>) => void) | undefined,
  eventType: 'validation.started' | 'validation.completed' | 'violation.observed',
  payload: Record<string, unknown>,
  now: () => string
): void {
  const event = createConstitutionalEvent(eventType, payload, {
    authority: 'IntelligenceOrchestrator',
    occurredAt: now(),
  }) as ConstitutionalEventEnvelope<Record<string, unknown>>;
  sink.push(event);

  try {
    observer?.(event);
  } catch {
    // Observers are best-effort in skeleton mode.
  }
}

function createRoutingViolation(input: {
  requestId: string;
  type: 'AUTHORITY_VIOLATION' | 'REGISTRY_VIOLATION';
  description: string;
  impact: string;
  resolutionStrategy: string;
  evidence: readonly string[];
  now: () => string;
}): ViolationRecord {
  const observedAt = input.now();
  return {
    violationId: `routing-violation-${input.requestId}-${hashString(
      `${input.type}|${input.description}|${input.evidence.join('|')}`
    )}`,
    type: input.type,
    severity: 'high',
    observedAt,
    enforcementMode: 'observe',
    status: 'observed',
    description: input.description,
    impact: input.impact,
    resolutionStrategy: input.resolutionStrategy,
    evidence: input.evidence,
  };
}

function uniqueCapabilities(
  capabilities: readonly DomainAuthorityCapability[]
): readonly DomainAuthorityCapability[] {
  return Array.from(new Set(capabilities));
}

function uniqueAuthorities(
  authorities: readonly DomainAuthorityType[]
): readonly DomainAuthorityType[] {
  return Array.from(new Set(authorities));
}

function sameCapabilities(
  left: readonly DomainAuthorityCapability[],
  right: readonly DomainAuthorityCapability[]
): boolean {
  return left.length === right.length && left.every((capability, index) => capability === right[index]);
}

function hashString(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}
