/**
 * @fileoverview Safe CANARY_SHADOW configuration.
 */

import type { CanaryShadowFlowName } from './CanaryShadowTypes';

export interface CanaryShadowConfig {
  globalShadowEnabled: boolean;
  allowedFlows: readonly CanaryShadowFlowName[];
  sampleRate: number;
  maxExecutionsPerMinute: number;
  maxLatencyMs: number;
  requireParityGate: boolean;
  requirePrivacyGate: boolean;
  requireTelemetryHealth: boolean;
  requireManualApproval: boolean;
  killSwitchRequired: boolean;
  rollbackOnDrift: boolean;
  rollbackOnFailure: boolean;
  rollbackOnLatencyRegression: boolean;
  captureComparisonDetails: boolean;
  capturePayloadSummaries: boolean;
}

export const DEFAULT_CANARY_SHADOW_CONFIG: CanaryShadowConfig = Object.freeze({
  globalShadowEnabled: false,
  allowedFlows: Object.freeze([]),
  sampleRate: 0,
  maxExecutionsPerMinute: 0,
  maxLatencyMs: 250,
  requireParityGate: true,
  requirePrivacyGate: true,
  requireTelemetryHealth: true,
  requireManualApproval: true,
  killSwitchRequired: true,
  rollbackOnDrift: true,
  rollbackOnFailure: true,
  rollbackOnLatencyRegression: true,
  captureComparisonDetails: false,
  capturePayloadSummaries: false,
});

export function createCanaryShadowConfig(
  overrides: Partial<CanaryShadowConfig> = {}
): CanaryShadowConfig {
  const config = {
    ...DEFAULT_CANARY_SHADOW_CONFIG,
    ...overrides,
    allowedFlows: overrides.allowedFlows ?? DEFAULT_CANARY_SHADOW_CONFIG.allowedFlows,
  };

  return Object.freeze({
    ...config,
    allowedFlows: Object.freeze([...new Set(config.allowedFlows)]),
    sampleRate: clamp(config.sampleRate, 0, 1),
    maxExecutionsPerMinute: Math.max(0, Math.floor(config.maxExecutionsPerMinute)),
    maxLatencyMs: Math.max(0, Math.floor(config.maxLatencyMs)),
  });
}

function clamp(value: number, minimum: number, maximum: number): number {
  if (Number.isNaN(value)) return minimum;
  return Math.min(maximum, Math.max(minimum, value));
}
