/**
 * @fileoverview Observe-mode configuration.
 *
 * Observe mode is disabled by default and must be explicitly opted in.
 */

export interface ObserveModeConfig {
  enabled: boolean;
  sampleRate: number;
  captureInputs: boolean;
  captureOutputs: boolean;
  compareOutputs: boolean;
  emitEvents: boolean;
  maxPayloadSize: number;
  telemetryEnabled: boolean;
  storageMode: ObserveTelemetryStorageMode;
  maxStoredEvents: number;
  maxPayloadBytes: number;
  privacyMode: ObservePrivacyMode;
  retentionDays: number;
  captureRawPayloads: boolean;
  hashStudentIdentifiers: boolean;
  allowJsonlStorage: boolean;
  jsonlPath?: string;
  dryRunBindingsEnabled: boolean;
  enabledBindings: readonly string[];
  allowIndependentDryRun: boolean;
  allowSuppliedResultFallback: boolean;
  maxBindingExecutionMs: number;
  failClosedForBindingErrors: boolean;
  enableIndependentPilotBinding: boolean;
  pilotBindingName?: string;
  allowPilotDryRunExecution: boolean;
  enableAssessmentIndependentDryRun: boolean;
  assessmentDryRunMode: AssessmentDryRunMode;
  assessmentParityComparisonEnabled: boolean;
}

export type ObserveTelemetryStorageMode = 'noop' | 'memory' | 'jsonl';

export type ObservePrivacyMode = 'strict' | 'balanced' | 'permissive';

export type AssessmentDryRunMode = 'SUPPLIED_RESULT_ONLY' | 'INDEPENDENT_DRY_RUN' | 'DISABLED';

export const DEFAULT_OBSERVE_MODE_CONFIG: ObserveModeConfig = Object.freeze({
  enabled: false,
  sampleRate: 1,
  captureInputs: false,
  captureOutputs: false,
  compareOutputs: true,
  emitEvents: true,
  maxPayloadSize: 32_768,
  telemetryEnabled: false,
  storageMode: 'noop',
  maxStoredEvents: 10_000,
  maxPayloadBytes: 16_384,
  privacyMode: 'strict',
  retentionDays: 30,
  captureRawPayloads: false,
  hashStudentIdentifiers: true,
  allowJsonlStorage: false,
  jsonlPath: undefined,
  dryRunBindingsEnabled: false,
  enabledBindings: [],
  allowIndependentDryRun: false,
  allowSuppliedResultFallback: true,
  maxBindingExecutionMs: 250,
  failClosedForBindingErrors: false,
  enableIndependentPilotBinding: false,
  pilotBindingName: undefined,
  allowPilotDryRunExecution: false,
  enableAssessmentIndependentDryRun: false,
  assessmentDryRunMode: 'DISABLED',
  assessmentParityComparisonEnabled: false,
});

export function createObserveModeConfig(
  overrides: Partial<ObserveModeConfig> = {}
): ObserveModeConfig {
  const config = {
    ...DEFAULT_OBSERVE_MODE_CONFIG,
    ...overrides,
  };

  return Object.freeze({
    ...config,
    sampleRate: clamp(config.sampleRate, 0, 1),
    maxPayloadSize: Math.max(0, Math.floor(config.maxPayloadSize)),
    maxStoredEvents: Math.max(0, Math.floor(config.maxStoredEvents)),
    maxPayloadBytes: Math.max(0, Math.floor(config.maxPayloadBytes)),
    retentionDays: Math.max(0, Math.floor(config.retentionDays)),
    enabledBindings: Object.freeze([...config.enabledBindings]),
    maxBindingExecutionMs: Math.max(0, Math.floor(config.maxBindingExecutionMs)),
    storageMode:
      config.storageMode === 'jsonl' && !config.allowJsonlStorage
        ? 'noop'
        : config.storageMode,
  });
}

export function shouldSampleObserveMode(
  config: ObserveModeConfig,
  randomValue: number = Math.random()
): boolean {
  if (!config.enabled) return false;
  if (config.sampleRate <= 0) return false;
  if (config.sampleRate >= 1) return true;
  return randomValue < config.sampleRate;
}

export function isPayloadWithinLimit(payload: unknown, maxPayloadSize: number): boolean {
  return estimatePayloadSize(payload) <= maxPayloadSize;
}

export function createPayloadSnapshot(
  payload: unknown,
  input: {
    capture: boolean;
    maxPayloadSize: number;
  }
): unknown {
  if (!input.capture) {
    return undefined;
  }

  if (!isPayloadWithinLimit(payload, input.maxPayloadSize)) {
    return {
      omitted: true,
      reason: 'Payload exceeded observe-mode maxPayloadSize.',
      estimatedSize: estimatePayloadSize(payload),
      maxPayloadSize: input.maxPayloadSize,
    };
  }

  return payload;
}

function estimatePayloadSize(payload: unknown): number {
  try {
    return JSON.stringify(payload)?.length ?? 0;
  } catch {
    return Number.MAX_SAFE_INTEGER;
  }
}

function clamp(value: number, minimum: number, maximum: number): number {
  if (Number.isNaN(value)) return minimum;
  return Math.min(maximum, Math.max(minimum, value));
}
