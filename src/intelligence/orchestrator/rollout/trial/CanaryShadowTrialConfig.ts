/**
 * @fileoverview Safe defaults for controlled CANARY_SHADOW trials.
 */

import type { CanaryShadowTrialConfig } from './CanaryShadowTrialTypes';

export const DEFAULT_CANARY_SHADOW_TRIAL_CONFIG: CanaryShadowTrialConfig = Object.freeze({
  trialId: 'canary-shadow-trial-disabled',
  enabled: false,
  allowedFlows: Object.freeze([]),
  sampleRate: 0,
  maxScenarios: 0,
  maxExecutionsPerFlow: 0,
  requireManualApproval: true,
  requireParityGate: true,
  requirePrivacyGate: true,
  requireTelemetryHealth: true,
  requireKillSwitchInactive: true,
  rollbackOnAnyCriticalDrift: true,
  rollbackOnAnyFailure: true,
  rollbackOnLatencyRegression: true,
  maxLatencyMs: 250,
  capturePayloadSummaries: false,
  captureRawPayloads: false,
});

export function createCanaryShadowTrialConfig(
  overrides: Partial<CanaryShadowTrialConfig> = {}
): CanaryShadowTrialConfig {
  const config = {
    ...DEFAULT_CANARY_SHADOW_TRIAL_CONFIG,
    ...overrides,
    allowedFlows: overrides.allowedFlows ?? DEFAULT_CANARY_SHADOW_TRIAL_CONFIG.allowedFlows,
  };

  return Object.freeze({
    ...config,
    allowedFlows: Object.freeze([...new Set(config.allowedFlows)]),
    sampleRate: clamp(config.sampleRate, 0, 1),
    maxScenarios: Math.max(0, Math.floor(config.maxScenarios)),
    maxExecutionsPerFlow: Math.max(0, Math.floor(config.maxExecutionsPerFlow)),
    maxLatencyMs: Math.max(0, Math.floor(config.maxLatencyMs)),
    captureRawPayloads: false,
  });
}

function clamp(value: number, minimum: number, maximum: number): number {
  if (Number.isNaN(value)) return minimum;
  return Math.min(maximum, Math.max(minimum, value));
}
