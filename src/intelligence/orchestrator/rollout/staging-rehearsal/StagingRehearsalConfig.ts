/**
 * @fileoverview Safe defaults for Phase 5.8 staging rehearsals.
 */

import type { StagingRehearsalConfig } from './StagingRehearsalTypes';

export const DEFAULT_STAGING_REHEARSAL_CONFIG: StagingRehearsalConfig = Object.freeze({
  runId: 'staging-rehearsal-disabled',
  enabled: false,
  environment: 'unknown',
  allowedEnvironments: Object.freeze([]),
  allowedFlows: Object.freeze([]),
  allowedEntrypoints: Object.freeze([]),
  sampleRate: 0,
  maxExecutionsPerFlow: 0,
  maxTotalExecutions: 0,
  requireManualApproval: true,
  requireParityGate: true,
  requirePrivacyGate: true,
  requireTelemetryHealth: true,
  requireKillSwitchInactive: true,
  requireEnvironmentGuard: true,
  rollbackOnAnyDrift: true,
  rollbackOnAnyFailure: true,
  rollbackOnLatencyRegression: true,
  maxLatencyMs: 250,
  capturePayloadSummaries: false,
  captureRawPayloads: false,
});

export function createStagingRehearsalConfig(
  overrides: Partial<StagingRehearsalConfig> = {}
): StagingRehearsalConfig {
  const config = {
    ...DEFAULT_STAGING_REHEARSAL_CONFIG,
    ...overrides,
    allowedEnvironments:
      overrides.allowedEnvironments ?? DEFAULT_STAGING_REHEARSAL_CONFIG.allowedEnvironments,
    allowedFlows: overrides.allowedFlows ?? DEFAULT_STAGING_REHEARSAL_CONFIG.allowedFlows,
    allowedEntrypoints:
      overrides.allowedEntrypoints ?? DEFAULT_STAGING_REHEARSAL_CONFIG.allowedEntrypoints,
  };

  return Object.freeze({
    ...config,
    environment: normalizeEnvironment(config.environment),
    allowedEnvironments: Object.freeze(
      [...new Set(config.allowedEnvironments.map(normalizeEnvironment))].filter(Boolean)
    ),
    allowedFlows: Object.freeze([...new Set(config.allowedFlows)]),
    allowedEntrypoints: Object.freeze([...new Set(config.allowedEntrypoints)]),
    sampleRate: clamp(config.sampleRate, 0, 1),
    maxExecutionsPerFlow: Math.max(0, Math.floor(config.maxExecutionsPerFlow)),
    maxTotalExecutions: Math.max(0, Math.floor(config.maxTotalExecutions)),
    maxLatencyMs: Math.max(0, Math.floor(config.maxLatencyMs)),
    captureRawPayloads: false,
  });
}

function normalizeEnvironment(environment: string | undefined): string {
  const normalized = (environment ?? 'unknown').trim().toLowerCase();
  return normalized.length > 0 ? normalized : 'unknown';
}

function clamp(value: number, minimum: number, maximum: number): number {
  if (Number.isNaN(value)) return minimum;
  return Math.min(maximum, Math.max(minimum, value));
}
