/**
 * @fileoverview IntelligenceOrchestrator skeleton for constitutional coordination.
 *
 * Authorities think. The orchestrator coordinates.
 */

import {
  ConstitutionalOwnershipRegistry,
  createConstitutionalEvent,
  type ConstitutionalEventEnvelope,
} from '../constitutional';
import { AuthorityRegistrationService } from '../authorities/AuthorityRegistrationService';
import { OptionGeneratorAuthorityFacade } from '../authorities/OptionGeneratorAuthorityFacade';
import { OutcomeTrackerAuthorityFacade } from '../authorities/OutcomeTrackerAuthorityFacade';
import { StudentUnderstandingAuthorityFacade } from '../authorities/StudentUnderstandingAuthorityFacade';
import { AuthorityExecutionCoordinator } from './AuthorityExecutionCoordinator';
import { AuthorityRouter } from './AuthorityRouter';
import { ConstitutionalRoutingPolicy } from './ConstitutionalRoutingPolicy';
import { ExecutionTracker } from './ExecutionTracker';
import { LifecycleAuditService } from './LifecycleAuditService';
import { createExecutionPlan } from './OrchestratorExecutionPlan';
import type { OrchestratorExecutionPlan } from './OrchestratorExecutionPlan';
import type { OrchestratorRequest } from './OrchestratorRequest';
import type { OrchestratorResponse, OrchestratorResponseStatus } from './OrchestratorResponse';
import { OrchestratorStateMachine } from './OrchestratorStateMachine';

export interface IntelligenceOrchestratorOptions {
  registry?: ConstitutionalOwnershipRegistry;
  registrationService?: AuthorityRegistrationService;
  studentUnderstandingAuthority?: StudentUnderstandingAuthorityFacade;
  optionGeneratorAuthority?: OptionGeneratorAuthorityFacade;
  outcomeTrackerAuthority?: OutcomeTrackerAuthorityFacade;
  routingPolicy?: ConstitutionalRoutingPolicy;
  authorityRouter?: AuthorityRouter;
  executionCoordinator?: AuthorityExecutionCoordinator;
  lifecycleAuditService?: LifecycleAuditService;
  now?: () => string;
}

const KNOWN_LIMITATIONS: readonly string[] = [
  'Phase 4.3 is a skeleton-only orchestrator with no production traffic redirection.',
  'Authority execution uses supplied stage bindings or no-op placeholders instead of direct engine routing.',
  'Audit and event records remain in-memory.',
  'Cross-authority learning propagation is represented as lifecycle coordination only.',
  'Routing policy validates facade availability and capability ownership, not source-derived import graphs.',
] as const;

export class IntelligenceOrchestrator {
  private readonly registry: ConstitutionalOwnershipRegistry;
  private readonly authorityRouter: AuthorityRouter;
  private readonly routingPolicy: ConstitutionalRoutingPolicy;
  private readonly executionCoordinator: AuthorityExecutionCoordinator;
  private readonly lifecycleAuditService: LifecycleAuditService;
  private readonly now: () => string;
  private readonly emittedEvents: ConstitutionalEventEnvelope<Record<string, unknown>>[] = [];

  constructor(options: IntelligenceOrchestratorOptions = {}) {
    this.registry = options.registry ?? ConstitutionalOwnershipRegistry.createDefault();
    this.now = options.now ?? (() => new Date().toISOString());
    const registrationService =
      options.registrationService ??
      new AuthorityRegistrationService({
        registry: this.registry,
        now: this.now,
        onEvent: (event) => this.recordEvent(event),
      });

    this.routingPolicy =
      options.routingPolicy ??
      new ConstitutionalRoutingPolicy({
        registry: this.registry,
        now: this.now,
        onEvent: (event) => this.recordEvent(event),
      });
    this.authorityRouter =
      options.authorityRouter ??
      new AuthorityRouter({
        registry: this.registry,
        registrationService,
        studentUnderstandingAuthority: options.studentUnderstandingAuthority,
        optionGeneratorAuthority: options.optionGeneratorAuthority,
        outcomeTrackerAuthority: options.outcomeTrackerAuthority,
        now: this.now,
        onEvent: (event) => this.recordEvent(event),
      });
    this.executionCoordinator =
      options.executionCoordinator ??
      new AuthorityExecutionCoordinator({
        now: this.now,
      });
    this.lifecycleAuditService =
      options.lifecycleAuditService ??
      new LifecycleAuditService({
        registry: this.registry,
        now: this.now,
      });
  }

  getAuthorityIntegrationStatus() {
    return this.authorityRouter.getIntegrationStatus();
  }

  getEmittedEvents(): readonly ConstitutionalEventEnvelope<Record<string, unknown>>[] {
    return [...this.emittedEvents];
  }

  createExecutionPlan(request: OrchestratorRequest): {
    routingDecision: ReturnType<ConstitutionalRoutingPolicy['evaluateRequest']>;
    plan: OrchestratorExecutionPlan;
  } {
    const routingDecision = this.routingPolicy.evaluateRequest(
      request,
      this.authorityRouter.getIntegrationStatus()
    );
    const source = this.routingPolicy.getRegistrySourceMetadata();
    const plan = createExecutionPlan({
      request,
      requiredAuthorities: routingDecision.requiredAuthorities,
      requiredCapabilities: routingDecision.requiredCapabilities,
      lifecycleStages: routingDecision.lifecycleStages,
      policyVersion: routingDecision.policyVersion,
      registrySourceDocument: source.sourceDocument,
      registrySourceWave: source.sourceWave,
      notes: routingDecision.notes,
      now: this.now,
    });

    return {
      routingDecision,
      plan,
    };
  }

  async execute(request: OrchestratorRequest): Promise<OrchestratorResponse> {
    const flowId = request.context.flowId ?? `orchestrator-flow-${request.requestId}`;
    const stateMachine = new OrchestratorStateMachine(request.requestId, {
      now: this.now,
    });
    this.recordEvent(
      createConstitutionalEvent(
        'validation.started',
        {
          requestId: request.requestId,
          flowId,
          requestType: request.requestType,
        },
        {
          authority: 'IntelligenceOrchestrator',
          occurredAt: this.now(),
        }
      ) as ConstitutionalEventEnvelope<Record<string, unknown>>
    );

    const validatingTransition = stateMachine.transitionTo(
      'VALIDATING',
      'IntelligenceOrchestrator started request validation.',
      {
        flowId,
      }
    );

    const { routingDecision, plan } = this.createExecutionPlan(request);
    const tracker = new ExecutionTracker(request.requestId, plan.planId, {
      now: this.now,
    });
    tracker.recordStateTransition(stateMachine.getHistory()[0]);
    tracker.recordStateTransition(validatingTransition);
    tracker.recordEvents(routingDecision.emittedEvents);

    let stageResults: Record<string, unknown> = {};
    let status: OrchestratorResponseStatus = 'completed';
    let errorMessage: string | undefined;

    if (!routingDecision.allowed) {
      tracker.recordPolicyViolation(routingDecision.reason, routingDecision.violations);
      const failedTransition = stateMachine.fail(
        'Routing policy denied request execution.',
        {
          flowId,
          violationCount: routingDecision.violations.length,
        }
      );
      tracker.recordStateTransition(failedTransition);
      status = 'rejected';
    } else if (plan.executability.status === 'NON_EXECUTABLE') {
      tracker.recordPolicyViolation(
        'Execution plan is non-executable because one or more stages do not have valid bindings.'
      );
      const failedTransition = stateMachine.fail(
        'Execution plan was marked NON_EXECUTABLE before authority coordination started.',
        {
          flowId,
          blockingStages: plan.executability.blockingStages,
          reasons: plan.executability.reasons,
        }
      );
      tracker.recordStateTransition(failedTransition);
      status = 'failed';
    } else {
      try {
        const coordinated = await this.executionCoordinator.executePlan(
          request,
          plan,
          this.authorityRouter,
          stateMachine,
          tracker
        );
        stageResults = { ...coordinated.stageResults };
        tracker.recordEvents(coordinated.emittedEvents);

        if (coordinated.cancelled) {
          status = 'cancelled';
        } else {
          const completedTransition = stateMachine.complete(
            'Execution plan completed without orchestrator-level failure.',
            {
              flowId,
              stageCount: plan.executionStages.length,
            }
          );
          tracker.recordStateTransition(completedTransition);
          status = 'completed';
        }
      } catch (error) {
        errorMessage = describeError(error);

        if (!stateMachine.isTerminal()) {
          const failedTransition = stateMachine.fail(
            'Authority execution failed within the orchestrator skeleton.',
            {
              flowId,
              errorMessage,
            }
          );
          tracker.recordStateTransition(failedTransition);
        }

        status = 'failed';
      }
    }

    const snapshot = tracker.getSnapshot(stateMachine.getCurrentState());
    const auditTrail = this.lifecycleAuditService.createLifecycleAudit(
      request,
      plan,
      snapshot,
      routingDecision
    );

    this.recordEvent(
      createConstitutionalEvent(
        'audit.report.created',
        {
          requestId: request.requestId,
          flowId,
          auditTrailId: auditTrail.auditTrailId,
          status,
        },
        {
          authority: 'IntelligenceOrchestrator',
          occurredAt: this.now(),
        }
      ) as ConstitutionalEventEnvelope<Record<string, unknown>>
    );
    this.recordEvent(
      createConstitutionalEvent(
        'validation.completed',
        {
          requestId: request.requestId,
          flowId,
          status,
          finalState: stateMachine.getCurrentState(),
        },
        {
          authority: 'IntelligenceOrchestrator',
          occurredAt: this.now(),
        }
      ) as ConstitutionalEventEnvelope<Record<string, unknown>>
    );

    return {
      requestId: request.requestId,
      studentId: request.studentId,
      flowId,
      status,
      currentState: stateMachine.getCurrentState(),
      plan,
      stageResults,
      lifecycle: snapshot,
      auditTrail,
      authorityIntegrationStatus: this.authorityRouter.getIntegrationStatus(),
      warnings:
        status === 'completed'
          ? []
          : [
              routingDecision.reason,
              ...plan.executability.reasons,
            ],
      knownLimitations: KNOWN_LIMITATIONS,
      errorMessage,
    };
  }

  private recordEvent(event: ConstitutionalEventEnvelope<Record<string, unknown>>): void {
    this.emittedEvents.push(event);
  }
}

function describeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
