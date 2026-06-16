/**
 * @fileoverview Failure rehearsal harness for Phase 5.9.
 */

import type { AuthorityExecutionBindingResult } from '../../bindings/AuthorityExecutionBindingTypes';
import { createBindingFailure } from '../../bindings/AuthorityExecutionBindingTypes';
import { createAppRehearsalApproval } from './AppRehearsalApprovalFactory';
import { createAppRehearsalConfig } from './AppRehearsalConfig';
import { getAppRehearsalDataset } from './AppRehearsalDataset';
import {
  ASSESSMENT_APP_ADAPTER_ENTRYPOINT_ID,
  ASSESSMENT_SERVICE_FALLBACK_ENTRYPOINT_ID,
  CAREER_FIT_APP_ADAPTER_ENTRYPOINT_ID,
  getAppEntrypointAlignments,
  getAppEntrypointCandidates,
} from './AppRehearsalEntrypointAdapter';
import { AppRehearsalRunner } from './AppRehearsalRunner';
import type {
  AppEntrypointAlignment,
  AppEntrypointCandidate,
  AppRehearsalConfig,
  AppRehearsalResult,
  AppRehearsalScenario,
} from './AppRehearsalTypes';

export type AppRehearsalFailureCase =
  | 'production-environment'
  | 'unknown-environment'
  | 'missing-approval'
  | 'expired-approval'
  | 'kill-switch-active'
  | 'privacy-gate-failure'
  | 'telemetry-failure'
  | 'parity-gate-failure'
  | 'app-entrypoint-missing'
  | 'hook-not-reached'
  | 'service-fallback-disallowed'
  | 'drift-detected'
  | 'binding-failure'
  | 'latency-breach'
  | 'app-entrypoint-execution-failure';

export interface AppRehearsalFailureRehearsalResult {
  caseName: AppRehearsalFailureCase;
  handledSafely: boolean;
  productionOutputPreserved: true;
  liveRoutingEnabled: false;
  result: AppRehearsalResult;
  notes: readonly string[];
}

export class AppRehearsalFailureRehearsal {
  private readonly now: () => string;

  constructor(options: { now?: () => string } = {}) {
    this.now = options.now ?? (() => '2026-06-06T00:00:00.000Z');
  }

  async runAll(): Promise<readonly AppRehearsalFailureRehearsalResult[]> {
    const cases: AppRehearsalFailureCase[] = [
      'production-environment',
      'unknown-environment',
      'missing-approval',
      'expired-approval',
      'kill-switch-active',
      'privacy-gate-failure',
      'telemetry-failure',
      'parity-gate-failure',
      'app-entrypoint-missing',
      'hook-not-reached',
      'service-fallback-disallowed',
      'drift-detected',
      'binding-failure',
      'latency-breach',
      'app-entrypoint-execution-failure',
    ];
    const results: AppRehearsalFailureRehearsalResult[] = [];
    for (const caseName of cases) results.push(await this.runCase(caseName));
    return results;
  }

  async runCase(caseName: AppRehearsalFailureCase): Promise<AppRehearsalFailureRehearsalResult> {
    const assessment = getAppRehearsalDataset().find((scenario) => scenario.flow === 'assessment')!;
    const careerFit = getAppRehearsalDataset().find((scenario) => scenario.flow === 'career-fit')!;
    const config = healthyConfig();
    const approval = healthyApproval();
    const gates = healthyGates();
    let result: AppRehearsalResult;

    switch (caseName) {
      case 'production-environment':
        result = await new AppRehearsalRunner({ now: this.now }).run({ config: { ...config, environment: 'production', allowedEnvironments: ['production'] }, approval, gateInputs: gates, scenarios: [assessment] });
        break;
      case 'unknown-environment':
        result = await new AppRehearsalRunner({ now: this.now }).run({ config: { ...config, environment: 'unknown', allowedEnvironments: ['unknown'] }, approval, gateInputs: gates, scenarios: [assessment] });
        break;
      case 'missing-approval':
        result = await new AppRehearsalRunner({ now: this.now }).run({ config, gateInputs: gates, scenarios: [assessment] });
        break;
      case 'expired-approval':
        result = await new AppRehearsalRunner({ now: this.now }).run({ config, approval: createAppRehearsalApproval({ ...approvalInput(), expiresAt: '2026-06-05T00:00:00.000Z' }), gateInputs: gates, scenarios: [assessment] });
        break;
      case 'kill-switch-active':
        result = await new AppRehearsalRunner({ now: this.now }).run({ config, approval, gateInputs: { ...gates, killSwitchActive: true }, scenarios: [assessment] });
        break;
      case 'privacy-gate-failure':
        result = await new AppRehearsalRunner({ now: this.now }).run({ config, approval, gateInputs: { ...gates, privacySafe: false }, scenarios: [assessment] });
        break;
      case 'telemetry-failure':
        result = await new AppRehearsalRunner({ now: this.now }).run({ config, approval, gateInputs: { ...gates, telemetryHealthy: false }, scenarios: [assessment] });
        break;
      case 'parity-gate-failure':
        result = await new AppRehearsalRunner({ now: this.now }).run({ config, approval, gateInputs: { ...gates, expandedParityCIGatePassed: false }, scenarios: [assessment] });
        break;
      case 'app-entrypoint-missing':
        result = await new AppRehearsalRunner({ now: this.now }).run({ config: oneScenarioConfig(assessment), approval: oneScenarioApproval(assessment), gateInputs: gates, scenarios: [{ ...assessment, forcedMode: 'missing-app-entrypoint' }] });
        break;
      case 'hook-not-reached':
        result = await new AppRehearsalRunner({ now: this.now }).run({ config: oneScenarioConfig(assessment), approval: oneScenarioApproval(assessment), gateInputs: gates, scenarios: [{ ...assessment, forcedMode: 'hook-not-reached' }] });
        break;
      case 'service-fallback-disallowed':
        result = await new AppRehearsalRunner({ now: this.now }).run({
          config: { ...oneScenarioConfig(serviceFallbackScenario(assessment)), allowServiceFallback: false, requireAppLevelCoverage: false },
          approval: oneScenarioApproval(serviceFallbackScenario(assessment)),
          gateInputs: gates,
          scenarios: [serviceFallbackScenario(assessment)],
        });
        break;
      case 'drift-detected':
        result = await new AppRehearsalRunner({ now: this.now, bindingCoordinator: driftCoordinator(this.now) }).run({ config: oneScenarioConfig(assessment), approval: oneScenarioApproval(assessment), gateInputs: gates, scenarios: [assessment] });
        break;
      case 'binding-failure':
        result = await new AppRehearsalRunner({ now: this.now, bindingCoordinator: failureCoordinator(this.now) }).run({ config: oneScenarioConfig(assessment), approval: oneScenarioApproval(assessment), gateInputs: gates, scenarios: [assessment] });
        break;
      case 'latency-breach':
        result = await new AppRehearsalRunner({ now: incrementingNow() }).run({ config: { ...oneScenarioConfig(careerFit), maxLatencyMs: 1 }, approval: oneScenarioApproval(careerFit), gateInputs: gates, scenarios: [careerFit] });
        break;
      case 'app-entrypoint-execution-failure':
        result = await new AppRehearsalRunner({ now: this.now }).run({ config: oneScenarioConfig(assessment), approval: oneScenarioApproval(assessment), gateInputs: gates, scenarios: [{ ...assessment, forcedMode: 'entrypoint-failure' }] });
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

function healthyConfig(): AppRehearsalConfig {
  return createAppRehearsalConfig({
    runId: 'phase-5-9-failure-rehearsal',
    enabled: true,
    environment: 'staging',
    allowedEnvironments: ['staging'],
    allowedFlows: ['assessment', 'career-fit'],
    allowedEntrypoints: [ASSESSMENT_APP_ADAPTER_ENTRYPOINT_ID, CAREER_FIT_APP_ADAPTER_ENTRYPOINT_ID],
    allowServiceFallback: false,
    requireAppLevelCoverage: true,
    sampleRate: 1,
    maxExecutionsPerFlow: 1,
    maxTotalExecutions: 1,
    maxLatencyMs: 1000,
  });
}

function oneScenarioConfig(scenario: AppRehearsalScenario): AppRehearsalConfig {
  return createAppRehearsalConfig({ ...healthyConfig(), allowedFlows: [scenario.flow], allowedEntrypoints: [scenario.entrypoint.entrypointId], maxExecutionsPerFlow: 1, maxTotalExecutions: 1 });
}

function healthyApproval() {
  return createAppRehearsalApproval(approvalInput());
}

function oneScenarioApproval(scenario: AppRehearsalScenario) {
  return createAppRehearsalApproval({ ...approvalInput(), allowedFlows: [scenario.flow], allowedEntrypoints: [scenario.entrypoint.entrypointId], maxExecutions: 1 });
}

function approvalInput() {
  return {
    runId: 'phase-5-9-failure-rehearsal',
    approvedBy: 'phase-5-9-rehearsal',
    environment: 'staging',
    allowedFlows: ['assessment', 'career-fit'] as const,
    allowedEntrypoints: [ASSESSMENT_APP_ADAPTER_ENTRYPOINT_ID, CAREER_FIT_APP_ADAPTER_ENTRYPOINT_ID],
    allowServiceFallback: false,
    maxSampleRate: 1,
    maxExecutions: 1,
    reason: 'Phase 5.9 failure rehearsal approval for synthetic staging data.',
    productionSafetyAcknowledgement: 'Production output remains authoritative; live modes are not approved.',
    approvedAt: '2026-06-06T00:00:00.000Z',
    expiresAt: '2026-06-07T00:00:00.000Z',
  };
}

function healthyGates() {
  return { rolloutGateApproved: true, expandedParityCIGatePassed: true, privacySafe: true, telemetryHealthy: true, killSwitchActive: false, flowKillSwitchActive: false };
}

function serviceFallbackScenario(scenario: AppRehearsalScenario): AppRehearsalScenario {
  const fallback = getAppEntrypointCandidates().find((entrypoint) => entrypoint.entrypointId === ASSESSMENT_SERVICE_FALLBACK_ENTRYPOINT_ID) as AppEntrypointCandidate;
  const alignment = {
    ...getAppEntrypointAlignments().find((entry) => entry.flow === 'assessment')!,
    selectedEntrypointId: ASSESSMENT_SERVICE_FALLBACK_ENTRYPOINT_ID,
    level: 'service-fallback',
    testOnlyAdapter: false,
    serviceFallback: true,
  } as AppEntrypointAlignment;
  return { ...scenario, entrypoint: fallback, alignment };
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
        notes: ['Forced drift for Phase 5.9 failure rehearsal.'],
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
        failure: createBindingFailure({ bindingId: 'assessment.processResponses', message: 'Forced binding failure for Phase 5.9 rehearsal.', occurredAt: timestamp }),
        startedAt: timestamp,
        completedAt: timestamp,
        latencyMs: 0,
        notes: ['Forced binding failure for Phase 5.9 failure rehearsal.'],
        metadata: {},
      };
    },
  };
}

function isHandledSafely(result: AppRehearsalResult): boolean {
  return result.productionOutputPreserved && !result.liveRoutingEnabled && (result.status === 'BLOCKED' || result.status === 'FAILED' || result.status === 'ROLLED_BACK');
}

function incrementingNow(): () => string {
  let tick = 0;
  const start = Date.parse('2026-06-06T00:00:00.000Z');
  return () => {
    tick += 1;
    return new Date(start + tick * 10).toISOString();
  };
}
