/**
 * @fileoverview Failure rehearsal harness for Phase 5.7 staging shadow runs.
 */

import { createStagingShadowApproval } from './StagingShadowApprovalFactory';
import { getStagingShadowRunDataset } from './StagingShadowRunDataset';
import { createStagingShadowRunConfig } from './StagingShadowRunConfig';
import { StagingShadowRunRunner } from './StagingShadowRunRunner';
import type {
  StagingShadowFailure,
  StagingShadowRunConfig,
  StagingShadowRunResult,
  StagingShadowScenario,
} from './StagingShadowRunTypes';

export type StagingShadowFailureRehearsalCase =
  | 'environment-blocked'
  | 'missing-approval'
  | 'expired-approval'
  | 'kill-switch-active'
  | 'privacy-gate-failure'
  | 'telemetry-failure'
  | 'drift-detected'
  | 'binding-failure'
  | 'latency-breach'
  | 'production-function-failure';

export interface StagingShadowFailureRehearsalResult {
  caseName: StagingShadowFailureRehearsalCase;
  handledSafely: boolean;
  productionOutputPreserved: true;
  liveRoutingEnabled: false;
  result: StagingShadowRunResult;
  notes: readonly string[];
}

export class StagingShadowFailureRehearsal {
  private readonly now: () => string;

  constructor(options: { now?: () => string } = {}) {
    this.now = options.now ?? (() => '2026-06-06T00:00:00.000Z');
  }

  async runAll(): Promise<readonly StagingShadowFailureRehearsalResult[]> {
    const cases: StagingShadowFailureRehearsalCase[] = [
      'environment-blocked',
      'missing-approval',
      'expired-approval',
      'kill-switch-active',
      'privacy-gate-failure',
      'telemetry-failure',
      'drift-detected',
      'binding-failure',
      'latency-breach',
      'production-function-failure',
    ];
    const results: StagingShadowFailureRehearsalResult[] = [];
    for (const caseName of cases) {
      results.push(await this.runCase(caseName));
    }
    return results;
  }

  async runCase(caseName: StagingShadowFailureRehearsalCase): Promise<StagingShadowFailureRehearsalResult> {
    const baseConfig = healthyConfig();
    const baseApproval = healthyApproval();
    const baseGates = healthyGates();
    const dataset = getStagingShadowRunDataset();
    const assessment = dataset.find((scenario) => scenario.flow === 'assessment') ?? dataset[0];
    const careerFit = dataset.find((scenario) => scenario.flow === 'career-fit') ?? dataset[0];
    const scenarios = [assessment, careerFit];
    let runner = new StagingShadowRunRunner({ now: this.now, scenarios });
    let result: StagingShadowRunResult;

    switch (caseName) {
      case 'environment-blocked':
        result = await runner.run({
          config: { ...baseConfig, environment: 'production', allowedEnvironments: ['production'] },
          approval: createStagingShadowApproval({ ...approvalInput(), environment: 'staging' }),
          gateInputs: baseGates,
          scenarios: [assessment],
        });
        break;
      case 'missing-approval':
        result = await runner.run({ config: baseConfig, gateInputs: baseGates, scenarios: [assessment] });
        break;
      case 'expired-approval':
        result = await runner.run({
          config: baseConfig,
          approval: createStagingShadowApproval({
            ...approvalInput(),
            expiresAt: '2026-06-05T00:00:00.000Z',
          }),
          gateInputs: baseGates,
          scenarios: [assessment],
        });
        break;
      case 'kill-switch-active':
        result = await runner.run({
          config: baseConfig,
          approval: baseApproval,
          gateInputs: { ...baseGates, killSwitchActive: true },
          scenarios: [assessment],
        });
        break;
      case 'privacy-gate-failure':
        result = await runner.run({
          config: baseConfig,
          approval: baseApproval,
          gateInputs: { ...baseGates, privacySafe: false },
          scenarios: [assessment],
        });
        break;
      case 'telemetry-failure':
        result = await runner.run({
          config: baseConfig,
          approval: baseApproval,
          gateInputs: { ...baseGates, telemetryHealthy: false },
          scenarios: [assessment],
        });
        break;
      case 'drift-detected':
        result = await runner.run({
          config: { ...baseConfig, allowedFlows: [assessment.flow], maxTotalExecutions: 1, maxExecutionsPerFlow: 1 },
          approval: createStagingShadowApproval({ ...approvalInput(), maxExecutions: 1, allowedFlows: [assessment.flow] }),
          gateInputs: baseGates,
          scenarios: [createDriftScenario(assessment)],
        });
        break;
      case 'binding-failure':
        result = await runner.run({
          config: { ...baseConfig, allowedFlows: [assessment.flow], maxTotalExecutions: 1, maxExecutionsPerFlow: 1 },
          approval: createStagingShadowApproval({ ...approvalInput(), maxExecutions: 1, allowedFlows: [assessment.flow] }),
          gateInputs: baseGates,
          scenarios: [createBindingFailureScenario(assessment, this.now())],
        });
        break;
      case 'latency-breach':
        runner = new StagingShadowRunRunner({ now: incrementingNow(), scenarios: [careerFit] });
        result = await runner.run({
          config: { ...baseConfig, allowedFlows: [careerFit.flow], maxLatencyMs: 1, maxTotalExecutions: 1, maxExecutionsPerFlow: 1 },
          approval: createStagingShadowApproval({ ...approvalInput(), maxExecutions: 1, allowedFlows: [careerFit.flow] }),
          gateInputs: baseGates,
          scenarios: [careerFit],
        });
        break;
      case 'production-function-failure':
        result = await runner.run({
          config: { ...baseConfig, allowedFlows: [assessment.flow], maxTotalExecutions: 1, maxExecutionsPerFlow: 1 },
          approval: createStagingShadowApproval({ ...approvalInput(), maxExecutions: 1, allowedFlows: [assessment.flow] }),
          gateInputs: baseGates,
          scenarios: [createProductionFailureScenario(assessment, this.now())],
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

function healthyConfig(): StagingShadowRunConfig {
  return createStagingShadowRunConfig({
    runId: 'phase-5-7-failure-rehearsal',
    enabled: true,
    environment: 'staging',
    allowedEnvironments: ['staging'],
    allowedFlows: ['assessment', 'career-fit'],
    sampleRate: 1,
    maxExecutionsPerFlow: 2,
    maxTotalExecutions: 2,
    maxLatencyMs: 1000,
  });
}

function healthyApproval() {
  return createStagingShadowApproval(approvalInput());
}

function approvalInput() {
  return {
    runId: 'phase-5-7-failure-rehearsal',
    approvedBy: 'phase-5-7-rehearsal',
    environment: 'staging',
    allowedFlows: ['assessment', 'career-fit'] as const,
    maxSampleRate: 1,
    maxExecutions: 2,
    reason: 'Phase 5.7 failure rehearsal approval for synthetic staging shadow run.',
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

function createDriftScenario(scenario: StagingShadowScenario): StagingShadowScenario {
  return {
    ...scenario,
    shadowOutput:
      scenario.flow === 'assessment'
        ? {
            ...(scenario.shadowOutput as Record<string, unknown>),
            confidence: {
              profileConfidence: 1,
              assessmentCompleteness: 1,
            },
          }
        : {
            ...(scenario.shadowOutput as Record<string, unknown>),
            overallFitScore: 1,
          },
  };
}

function createBindingFailureScenario(
  scenario: StagingShadowScenario,
  occurredAt: string
): StagingShadowScenario {
  return {
    ...scenario,
    forcedFailure: createFailure('binding-failure', scenario, 'forced binding failure', occurredAt),
  };
}

function createProductionFailureScenario(
  scenario: StagingShadowScenario,
  occurredAt: string
): StagingShadowScenario {
  return {
    ...scenario,
    productionFailure: createFailure('production-function-failure', scenario, 'forced production function failure', occurredAt),
  };
}

function createFailure(
  failureId: string,
  scenario: StagingShadowScenario,
  reason: string,
  occurredAt: string
): StagingShadowFailure {
  return {
    failureId,
    scenarioId: scenario.scenarioId,
    flow: scenario.flow,
    reason,
    severity: 'critical',
    occurredAt,
    metadata: {},
  };
}

function isHandledSafely(result: StagingShadowRunResult): boolean {
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
