/**
 * @fileoverview Controlled CANARY_SHADOW rollout contracts.
 *
 * These contracts describe internal shadow execution only. Production output
 * remains authoritative and must never be replaced by canary shadow output.
 */

import type { AuthorityExecutionBindingResult } from '../bindings/AuthorityExecutionBindingTypes';
import type { ObservePayloadSummary } from '../observe/ObserveTelemetryTypes';
import type { RolloutDecision, RolloutGateResult } from './RolloutControlTypes';

export type CanaryShadowMode = 'DISABLED' | 'CANARY_SHADOW';

export type CanaryShadowStatus =
  | 'DISABLED'
  | 'ELIGIBLE'
  | 'RUNNING'
  | 'SKIPPED'
  | 'BLOCKED'
  | 'FAILED'
  | 'COMPLETED'
  | 'ROLLED_BACK';

export type CanaryShadowComparisonStatus =
  | 'MATCHED'
  | 'DRIFT_DETECTED'
  | 'FAILED'
  | 'NOT_COMPARABLE'
  | 'SELF_MIRRORED'
  | 'SKIPPED';

export type CanaryShadowFlowName = 'assessment' | 'career-fit';

export type CanaryShadowRiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type CanaryShadowRollbackReason =
  | 'critical_drift'
  | 'failure_rate_breach'
  | 'latency_breach'
  | 'telemetry_failure'
  | 'privacy_violation'
  | 'manual_kill_switch'
  | 'expired_approval'
  | 'policy_block';

export type CanaryShadowGateStatus = 'PASS' | 'BLOCKED' | 'SKIPPED' | 'NOT_APPLICABLE';

export interface CanaryShadowFlowConfig {
  flow: CanaryShadowFlowName;
  bindingId: 'assessment.processResponses' | 'career-fit.calculateFit';
  sourceOperation: 'AssessmentEngine.processResponses' | 'CareerFitEngine.calculateFit';
  authority: 'StudentUnderstandingAuthority' | 'OptionGeneratorAuthority';
  capability: 'UNDERSTAND' | 'GENERATE';
}

export interface CanaryShadowGateResult {
  gateName: string;
  status: CanaryShadowGateStatus;
  passed: boolean;
  blocking: boolean;
  reason: string;
  evidence: readonly string[];
}

export interface CanaryShadowSampleDecision {
  selected: boolean;
  sampleKey: string;
  sampleRate: number;
  hashValue?: number;
  rateLimitRemaining: number;
  reason: string;
}

export interface CanaryShadowDecision {
  decisionId: string;
  requestId: string;
  flow: CanaryShadowFlowName | string;
  mode: CanaryShadowMode;
  status: CanaryShadowStatus;
  approved: boolean;
  sampleDecision?: CanaryShadowSampleDecision;
  gateResults: readonly CanaryShadowGateResult[];
  rolloutDecision?: RolloutDecision;
  goldenParityGateResult?: RolloutGateResult;
  riskLevel: CanaryShadowRiskLevel;
  reasons: readonly string[];
  decidedAt: string;
  metadata: Readonly<Record<string, unknown>>;
}

export interface CanaryShadowComparisonResult {
  status: CanaryShadowComparisonStatus;
  comparable: boolean;
  productionOutputCaptured: boolean;
  shadowOutputCaptured: boolean;
  differences: readonly string[];
  notes: readonly string[];
}

export interface CanaryShadowExecutionRecord {
  recordId: string;
  decision: CanaryShadowDecision;
  requestId: string;
  productionCallId: string;
  flow: CanaryShadowFlowName | string;
  status: CanaryShadowStatus;
  bindingResult?: AuthorityExecutionBindingResult;
  comparison: CanaryShadowComparisonResult;
  startedAt: string;
  completedAt: string;
  latencyMs: number;
  rollbackTriggered: boolean;
  rollbackReason?: CanaryShadowRollbackReason;
  payloadSummary?: ObservePayloadSummary;
  privacySafe: boolean;
  telemetryHealthy: boolean;
  productionOutputPreserved: true;
  notes: readonly string[];
}

export interface CanaryShadowHealthSnapshot {
  enabled: boolean;
  activeFlows: readonly string[];
  totalRecords: number;
  byStatus: Readonly<Record<CanaryShadowStatus, number>>;
  driftCount: number;
  failureCount: number;
  rollbackCount: number;
  lastStatus?: CanaryShadowStatus;
}

export const CANARY_SHADOW_VALIDATED_FLOWS: readonly CanaryShadowFlowConfig[] = Object.freeze([
  Object.freeze({
    flow: 'assessment',
    bindingId: 'assessment.processResponses',
    sourceOperation: 'AssessmentEngine.processResponses',
    authority: 'StudentUnderstandingAuthority',
    capability: 'UNDERSTAND',
  }),
  Object.freeze({
    flow: 'career-fit',
    bindingId: 'career-fit.calculateFit',
    sourceOperation: 'CareerFitEngine.calculateFit',
    authority: 'OptionGeneratorAuthority',
    capability: 'GENERATE',
  }),
]);

export function resolveCanaryShadowFlowConfig(flow: string): CanaryShadowFlowConfig | undefined {
  return CANARY_SHADOW_VALIDATED_FLOWS.find((entry) => entry.flow === flow);
}
