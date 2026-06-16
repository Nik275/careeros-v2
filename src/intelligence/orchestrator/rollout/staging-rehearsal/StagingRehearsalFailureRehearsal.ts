/**
 * @fileoverview Failure rehearsal harness for Phase 5.8.
 */

import type { AuthorityExecutionBindingResult } from '../../bindings/AuthorityExecutionBindingTypes';
import { createBindingFailure } from '../../bindings/AuthorityExecutionBindingTypes';
import { createStagingRehearsalApproval } from './StagingRehearsalApprovalFactory';
import { getStagingRehearsalDataset } from './StagingRehearsalDataset';
import {
  ASSESSMENT_SERVICE_ENTRYPOINT_ID,
  CAREER_FIT_SERVICE_ENTRYPOINT_ID,
} from './StagingRehearsalEntrypoints';
import { createStagingRehearsalConfig } from './StagingRehearsalConfig';
import { StagingRehearsalRunner } from './StagingRehearsalRunner';
import type {
  StagingRehearsalConfig,
  StagingRehearsalResult,
  StagingRehearsalScenario,
} from './StagingRehearsalTypes';

export type StagingRehearsalFailureCase =
  | 'production-environment'
  | 'unknown-environment'
  | 'missing-approval'
  | 'expired-approval'
  | 'kill-switch-active'
  | 'privacy-gate-failure'
  | 'telemetry-failure'
  | 'parity-gate-failure'
  | 'hook-not-reached'
  | 'drift-detected'
  | 'binding-failure'
  | 'latency-breach'
  | 'entrypoint-execution-failure';

export interface StagingRehearsalFailureRehearsalResult {
  caseName: StagingRehearsalFailureCase;
  handledSafely: boolean;
  productionOutputPreserved: true;
  liveRoutingEnabled: false;
  result: StagingRehearsalResult;
  notes: readonly string[];
}

export class StagingRehearsalFailureRehearsal {
  private readonly now: () => string;

  constructor(options: { now?: () => string } = {}) {
    this.now = options.now ?? (() => '2026-06-06T00:00:00.000Z');
  }

  async runAll(): Promise<readonly StagingRehearsalFailureRehearsalResult[]> {
    const cases: StagingRehearsalFailureCase[] = [
      'production-environment',
      'unknown-environment',
      'missing-approval',
      'expired-approval',
      'kill-switch-active',
      'privacy-gate-failure',
      'telemetry-failure',
      'parity-gate-failure',
      'hook-not-reached',
      'drift-detected',
      'binding-failure',
      'latency-breach',
      'entrypoint-execution-failure',
    ];
    const results: StagingRehearsalFailureRehearsalResult[] = [];
    for (const caseName of cases) {
      results.push(await this.runCase(caseName));
    }
    return results;
  }

  async runCase(caseName: StagingRehearsalFailureCase): Promise<StagingRehearsalFailureRehearsalResult> {
    const assessment = getStagingRehearsalDataset().find((scenario) => scenario.flow === 'assessment')!;
    const careerFit = getStagingRehearsalDataset().find((scenario) => scenario.flow === 'career-fit')!;
    const config = healthyConfig();
    const approval = healthyApproval();
    const gates = healthyGates();
    let result: StagingRehearsalResult;

    switch (caseName) {
      case 'production-environment':
        result = await new StagingRehearsalRunner({ now: this.now }).run({
          config: { ...config, environment: 'production', allowedEnvironments: ['production'] },
          approval,
          gateInputs: gates,
          scenarios: [assessment],
        });
        break;
      case 'unknown-environment':
        result = await new StagingRehearsalRunner({ now: this.now }).run({
          config: { ...config, environment: 'unknown', allowedEnvironments: ['unknown'] },
          approval,
          gateInputs: gates,
          scenarios: [assessment],
        });
        break;
      case 'missing-approval':
        result = await new StagingRehearsalRunner({ now: this.now }).run({
          config,
          gateInputs: gates,
          scenarios: [assessment],
        });
        break;
      case 'expired-approval':
        result = await new StagingRehearsalRunner({ now: this.now }).run({
          config,
          approval: createStagingRehearsalApproval({
            ...approvalInput(),
            expiresAt: '2026-06-05T00:00:00.000Z',
          }),
          gateInputs: gates,
          scenarios: [assessment],
        });
        break;
      case 'kill-switch-active':
        result = await new StagingRehearsalRunner({ now: this.now }).run({
          config,
          approval,
          gateInputs: { ...gates, killSwitchActive: true },
          scenarios: [assessment],
        });
        break;
      case 'privacy-gate-failure':
        result = await new StagingRehearsalRunner({ now: this.now }).run({
          config,
          approval,
          gateInputs: { ...gates, privacySafe: false },
          scenarios: [assessment],
        });
        break;
      case 'telemetry-failure':
        result = await new StagingRehearsalRunner({ now: this.now }).run({
          config,
          approval,
          gateInputs: { ...gates, telemetryHealthy: false },
          scenarios: [assessment],
        });
        break;
      case 'parity-gate-failure':
        result = await new StagingRehearsalRunner({ now: this.now }).run({
          config,
          approval,
          gateInputs: { ...gates, expandedParityCIGatePassed: false },
          scenarios: [assessment],
        });
        break;
      case 'hook-not-reached':
        result = await new StagingRehearsalRunner({ now: this.now }).run({
          config: oneScenarioConfig(assessment),
          approval: oneScenarioApproval(assessment),
          gateInputs: gates,
          scenarios: [{ ...assessment, forcedMode: 'hook-not-reached' }],
        });
        break;
      case 'drift-detected':
        result = await new StagingRehearsalRunner({
          now: this.now,
          bindingCoordinator: driftCoordinator(this.now),
        }).run({
          config: oneScenarioConfig(assessment),
          approval: oneScenarioApproval(assessment),
          gateInputs: gates,
          scenarios: [assessment],
        });
        break;
      case 'binding-failure':
        result = await new StagingRehearsalRunner({
          now: this.now,
          bindingCoordinator: failureCoordinator(this.now),
        }).run({
          config: oneScenarioConfig(assessment),
          approval: oneScenarioApproval(assessment),
          gateInputs: gates,
          scenarios: [assessment],
        });
        break;
      case 'latency-breach':
        result = await new StagingRehearsalRunner({ now: incrementingNow() }).run({
          config: { ...oneScenarioConfig(careerFit), maxLatencyMs: 1 },
          approval: oneScenarioApproval(careerFit),
          gateInputs: gates,
          scenarios: [careerFit],
        });
        break;
      case 'entrypoint-execution-failure':
        result = await new StagingRehearsalRunner({ now: this.now }).run({
          config: oneScenarioConfig(assessment),
          approval: oneScenarioApproval(assessment),
          gateInputs: gates,
          scenarios: [{ ...assessment, forcedMode: 'entrypoint-failure' }],
        });
        break;
    }

    return Object.freeze({
      caseName,
      handledSafely: isHandledSafely(result),
      productionOutputPreserved: true,
      liveRoutingEnabled: false,
      result,
      notes: [`${caseName} produced ${result.status}/${result.verdict} without live routing.`],
    });
  }
}

function healthyConfig(): StagingRehearsalConfig {
  return createStagingRehearsalConfig({
    runId: 'phase-5-8-failure-rehearsal',
    enabled: true,
    environment: 'staging',
    allowedEnvironments: ['staging'],
    allowedFlows: ['assessment', 'career-fit'],
    allowedEntrypoints: [ASSESSMENT_SERVICE_ENTRYPOINT_ID, CAREER_FIT_SERVICE_ENTRYPOINT_ID],
    sampleRate: 1,
    maxExecutionsPerFlow: 1,
    maxTotalExecutions: 1,
    maxLatencyMs: 1000,
  });
}

function oneScenarioConfig(scenario: StagingRehearsalScenario): StagingRehearsalConfig {
  return createStagingRehearsalConfig({
    ...healthyConfig(),
    allowedFlows: [scenario.flow],
    allowedEntrypoints: [scenario.entrypoint.entrypointId],
    maxExecutionsPerFlow: 1,
    maxTotalExecutions: 1,
  });
}

function healthyApproval() {
  return createStagingRehearsalApproval(approvalInput());
}

function oneScenarioApproval(scenario: StagingRehearsalScenario) {
  return createStagingRehearsalApproval({
    ...approvalInput(),
    allowedFlows: [scenario.flow],
    allowedEntrypoints: [scenario.entrypoint.entrypointId],
    maxExecutions: 1,
  });
}

function approvalInput() {
  return {
    runId: 'phase-5-8-failure-rehearsal',
    approvedBy: 'phase-5-8-rehearsal',
    environment: 'staging',
    allowedFlows: ['assessment', 'career-fit'] as const,
    allowedEntrypoints: [ASSESSMENT_SERVICE_ENTRYPOINT_ID, CAREER_FIT_SERVICE_ENTRYPOINT_ID],
    maxSampleRate: 1,
    maxExecutions: 1,
    reason: 'Phase 5.8 failure rehearsal approval for synthetic staging data.',
    productionSafetyAcknowledgement: 'Production output remains authoritative; live modes are not approved.',
    approvedAt: '2026-06-06T00:00:00.000Z',
    expiresAt: '2026-06-07T00:00:00.000Z',
  };
}

function healthyGates() {
  return {
    rolloutGateApproved: true,
    expandedParityCIGatePassed: true,
    privacySafe: true,
    telemetryHealthy: true,
    killSwitchActive: false,
    flowKillSwitchActive: false,
  };
}

function driftCoordinator(now: () => string) {
  return {
    execute: async (): Promise<AuthorityExecutionBindingResult> => {
      const timestamp = now();
      return {
        bindingId: 'assessment.processResponses',
        flowType: 'assessment',
        authority: 'StudentUnderstandingAuthority',
        capability: 'UNDERSTAND',
        executionMode: 'DRY_RUN',
        comparisonStatus: 'INDEPENDENT_COMPARISON',
        comparable: true,
        independent: true,
        outputSnapshot: { forcedDrift: true },
        startedAt: timestamp,
        completedAt: timestamp,
        latencyMs: 0,
        notes: ['Forced drift for Phase 5.8 failure rehearsal.'],
        metadata: {},
      };
    },
  };
}

function failureCoordinator(now: () => string) {
  return {
    execute: async (): Promise<AuthorityExecutionBindingResult> => {
      const timestamp = now();
      return {
        bindingId: 'assessment.processResponses',
        flowType: 'assessment',
        authority: 'StudentUnderstandingAuthority',
        capability: 'UNDERSTAND',
        executionMode: 'DRY_RUN',
        comparisonStatus: 'BINDING_FAILED',
        comparable: false,
        independent: false,
        failure: createBindingFailure({
          bindingId: 'assessment.processResponses',
          message: 'Forced binding failure for Phase 5.8 rehearsal.',
          occurredAt: timestamp,
        }),
        startedAt: timestamp,
        completedAt: timestamp,
        latencyMs: 0,
        notes: ['Forced binding failure for Phase 5.8 failure rehearsal.'],
        metadata: {},
      };
    },
  };
}

function isHandledSafely(result: StagingRehearsalResult): boolean {
  return (
    result.productionOutputPreserved &&
    !result.liveRoutingEnabled &&
    (result.status === 'BLOCKED' || result.status === 'FAILED' || result.status === 'ROLLED_BACK')
  );
}

function incrementingNow(): () => string {
  let tick = 0;
  const start = Date.parse('2026-06-06T00:00:00.000Z');
  return () => {
    tick += 1;
    return new Date(start + tick * 10).toISOString();
  };
}
