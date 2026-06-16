/**
 * @fileoverview Decision controller for Phase 6.0 route-shadow requests.
 */

import { StagingShadowEnvironmentGuard } from '../staging/StagingShadowEnvironmentGuard';
import { createRouteShadowConfig } from './RouteShadowConfig';
import { validateRouteShadowApproval } from './RouteShadowApprovalFactory';
import type {
  RouteShadowConfig,
  RouteShadowDecision,
  RouteShadowFailure,
  RouteShadowRequest,
} from './RouteShadowTypes';

export class RouteShadowController {
  private readonly environmentGuard: StagingShadowEnvironmentGuard;
  private readonly now: () => string;

  constructor(options: { environmentGuard?: StagingShadowEnvironmentGuard; now?: () => string } = {}) {
    this.now = options.now ?? (() => new Date().toISOString());
    this.environmentGuard = options.environmentGuard ?? new StagingShadowEnvironmentGuard({ now: this.now });
  }

  evaluate(request: RouteShadowRequest, configInput: Partial<RouteShadowConfig> = {}): RouteShadowDecision {
    const now = this.now();
    const config = createRouteShadowConfig({
      ...request.config,
      ...configInput,
      environment: configInput.environment ?? request.config?.environment ?? request.environment,
    });
    const environmentDecision = this.environmentGuard.evaluate({
      environment: config.environment,
      allowedEnvironments: config.allowedEnvironments,
      now,
    });
    const failures: RouteShadowFailure[] = [];
    const gateResults = createGateResults(request, config);
    const payloadSafety = validatePayloadSafety(request, config);
    const approvalValidation = validateRouteShadowApproval(request.approval, {
      environment: config.environment,
      flow: request.flow,
      routePath: request.routePath,
      now,
    });

    if (!config.enabled) failures.push(failure('config', 'Route shadow is disabled.', 'critical', now));
    if (!config.allowedFlows.includes(request.flow)) failures.push(failure('flow', 'Route shadow flow is not allowed.', 'critical', now));
    if (!environmentDecision.allowed) failures.push(failure('environment', environmentDecision.reason, 'critical', now));
    if (config.environment === 'production' || config.environment === 'prod') {
      failures.push(failure('environment', 'Production environment is blocked in Phase 6.0.', 'critical', now));
    }
    if (config.allowProductionEnvironment) failures.push(failure('environment', 'allowProductionEnvironment cannot be enabled in Phase 6.0.', 'critical', now));
    if (config.allowLiveRouting) failures.push(failure('routing', 'allowLiveRouting cannot be enabled in Phase 6.0.', 'critical', now));
    if (config.allowOutputReplacement) failures.push(failure('routing', 'allowOutputReplacement cannot be enabled in Phase 6.0.', 'critical', now));
    if (config.captureRawPayloads) failures.push(failure('privacy', 'Raw payload capture is blocked in Phase 6.0.', 'critical', now));
    if (!payloadSafety.safe) failures.push(...payloadSafety.failures.map((entry) => failure('payload', entry, 'critical', now)));
    if (config.requireManualApproval && !approvalValidation.valid) failures.push(failure('approval', approvalValidation.reason, 'critical', now));
    for (const gate of gateResults) {
      if (gate.blocking && !gate.passed) failures.push(failure(String(gate.gateName), String(gate.reason), 'critical', now));
    }

    const allowed = failures.length === 0;
    return Object.freeze({
      decisionId: `route-shadow-decision-${hashString(`${request.requestId}|${allowed}|${now}`)}`,
      status: allowed ? 'APPROVED' : config.enabled ? 'BLOCKED' : 'DISABLED',
      verdict: allowed ? 'PASS' : 'BLOCKED',
      allowed,
      flow: request.flow,
      routePath: request.routePath,
      environmentDecision,
      approvalValid: approvalValidation.valid,
      payloadSafe: payloadSafety.safe,
      gateResults,
      failures,
      reasons: allowed ? ['Route shadow request approved for shadow-only execution.'] : failures.map((entry) => entry.reason),
      decidedAt: now,
      liveRoutingEnabled: false,
      outputReplacementEnabled: false,
    });
  }
}

function createGateResults(request: RouteShadowRequest, config: RouteShadowConfig): readonly Readonly<Record<string, unknown>>[] {
  const gates = request.gateInputs ?? {};
  return Object.freeze([
    gate('rolloutGateApproved', true, gates.rolloutGateApproved === true, 'Explicit rollout gate approval is required.'),
    gate('expandedParityCIGatePassed', config.requireParityGate, gates.expandedParityCIGatePassed === true, 'Expanded parity gate did not pass.'),
    gate('privacySafe', config.requirePrivacyGate, gates.privacySafe === true, 'Privacy gate did not pass.'),
    gate('telemetryHealthy', config.requireTelemetryHealth, gates.telemetryHealthy === true, 'Telemetry health gate did not pass.'),
    gate('killSwitchInactive', config.requireKillSwitchInactive, gates.killSwitchActive === false, 'Kill switch is active or unknown.'),
  ]);
}

function gate(gateName: string, blocking: boolean, passed: boolean, reason: string): Readonly<Record<string, unknown>> {
  return Object.freeze({
    gateName,
    blocking,
    passed: !blocking || passed,
    reason: !blocking || passed ? 'Gate passed.' : reason,
  });
}

export function validatePayloadSafety(request: RouteShadowRequest, config: RouteShadowConfig): {
  safe: boolean;
  payloadBytes: number;
  failures: readonly string[];
} {
  const failures: string[] = [];
  const serialized = safeStringify(request.payload);
  const payloadBytes = Buffer.byteLength(serialized, 'utf8');
  const payloadRecord = isRecord(request.payload) ? request.payload : {};
  const metadata = isRecord(request.metadata) ? request.metadata : {};

  if (request.synthetic !== true || payloadRecord.synthetic !== true) failures.push('Synthetic marker is required.');
  if (payloadBytes > config.maxPayloadBytes) failures.push('Route shadow payload exceeds maxPayloadBytes.');
  if (payloadRecord.rawStudentData === true || payloadRecord.realStudentData === true || metadata.realStudentData === true) {
    failures.push('Raw or real student data is blocked.');
  }
  if (payloadRecord.dataClassification !== 'SYNTHETIC') failures.push('Payload dataClassification must be SYNTHETIC.');
  if (/email|phone|address|ssn|real[-_\s]?student|@/i.test(serialized)) failures.push('Payload contains a potential real student data marker.');

  return { safe: failures.length === 0, payloadBytes, failures };
}

function failure(reasonKey: string, reason: string, severity: RouteShadowFailure['severity'], occurredAt: string): RouteShadowFailure {
  return Object.freeze({
    failureId: `route-shadow-failure-${hashString(`${reasonKey}|${reason}|${occurredAt}`)}`,
    reason,
    severity,
    occurredAt,
    metadata: { reasonKey },
  });
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value) ?? '';
  } catch {
    return '[unserializable]';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function hashString(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}
