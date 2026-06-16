/**
 * @fileoverview Rollout control-plane configuration.
 */

import type { RolloutMode, RolloutPolicy } from './RolloutControlTypes';

export interface RolloutConfig extends RolloutPolicy {}

export const DEFAULT_ALLOWED_ROLLOUT_MODES: readonly RolloutMode[] = [
  'DISABLED',
  'OBSERVE_ONLY',
  'DRY_RUN_COMPARE',
] as const;

export const DEFAULT_ROLLOUT_CONFIG: RolloutConfig = Object.freeze({
  globalEnabled: false,
  allowedModes: DEFAULT_ALLOWED_ROLLOUT_MODES,
  perFlowConfig: {},
  maxCanaryPercent: 0,
  requireParityBeforeLive: true,
  requireManualApproval: true,
  killSwitchEnabled: true,
  rollbackOnDrift: true,
  rollbackOnFailureRate: true,
  rollbackOnLatencyRegression: true,
  rollbackOnTelemetryFailure: true,
  explicitlyAllowCanaryLive: false,
});

export function createRolloutConfig(overrides: Partial<RolloutConfig> = {}): RolloutConfig {
  const config = {
    ...DEFAULT_ROLLOUT_CONFIG,
    ...overrides,
    allowedModes: overrides.allowedModes ?? DEFAULT_ROLLOUT_CONFIG.allowedModes,
    perFlowConfig: overrides.perFlowConfig ?? DEFAULT_ROLLOUT_CONFIG.perFlowConfig,
  };

  return Object.freeze({
    ...config,
    allowedModes: Object.freeze([...config.allowedModes]),
    perFlowConfig: Object.freeze({ ...config.perFlowConfig }),
    maxCanaryPercent: Math.max(0, Math.min(100, Math.floor(config.maxCanaryPercent))),
  });
}
