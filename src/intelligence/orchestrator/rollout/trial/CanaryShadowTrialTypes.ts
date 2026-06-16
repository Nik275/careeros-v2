/**
 * @fileoverview Controlled CANARY_SHADOW trial contracts.
 */

import type { AuthorityExecutionBindingResult } from '../../bindings/AuthorityExecutionBindingTypes';
import type { ObservePayloadSummary } from '../../observe/ObserveTelemetryTypes';
import type { CanaryShadowExecutionRecord, CanaryShadowFlowName } from '../CanaryShadowTypes';
import type { ManualApprovalRecord } from '../ManualApprovalRecord';

export type CanaryShadowTrialStatus =
  | 'PLANNED'
  | 'APPROVED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'ROLLED_BACK'
  | 'BLOCKED'
  | 'CANCELLED';

export type CanaryShadowTrialVerdict = 'PASS' | 'PASS_WITH_WARNINGS' | 'FAIL' | 'BLOCKED';

export type CanaryShadowTrialRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type CanaryShadowTrialSourceSuite = 'golden' | 'stress' | 'fuzz';

export interface CanaryShadowTrialApprovalEvidence {
  evidenceId: string;
  description: string;
  parityEvidenceReference: string;
  createdAt: string;
  metadata: Readonly<Record<string, unknown>>;
}

export interface CanaryShadowTrialConfig {
  trialId: string;
  enabled: boolean;
  allowedFlows: readonly CanaryShadowFlowName[];
  sampleRate: number;
  maxScenarios: number;
  maxExecutionsPerFlow: number;
  requireManualApproval: boolean;
  requireParityGate: boolean;
  requirePrivacyGate: boolean;
  requireTelemetryHealth: boolean;
  requireKillSwitchInactive: boolean;
  rollbackOnAnyCriticalDrift: boolean;
  rollbackOnAnyFailure: boolean;
  rollbackOnLatencyRegression: boolean;
  maxLatencyMs: number;
  capturePayloadSummaries: boolean;
  captureRawPayloads: boolean;
}

export interface CanaryShadowTrialScenario {
  scenarioId: string;
  flow: CanaryShadowFlowName;
  input: unknown;
  expectedAuthority: 'StudentUnderstandingAuthority' | 'OptionGeneratorAuthority';
  expectedCapability: 'UNDERSTAND' | 'GENERATE';
  riskLevel: CanaryShadowTrialRiskLevel;
  sourceSuite: CanaryShadowTrialSourceSuite;
  purpose: string;
  productionOutputSnapshot: unknown;
  shadowOutput: unknown;
  synthetic: true;
  forcedFailure?: CanaryShadowTrialFailure;
}

export interface CanaryShadowTrialFailure {
  failureId: string;
  scenarioId?: string;
  flow?: CanaryShadowFlowName | string;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  occurredAt: string;
  metadata: Readonly<Record<string, unknown>>;
}

export interface CanaryShadowTrialFlowResult {
  scenarioId: string;
  flow: CanaryShadowFlowName;
  sourceSuite: CanaryShadowTrialSourceSuite;
  status: CanaryShadowTrialStatus;
  sampled: boolean;
  executed: boolean;
  comparisonStatus: CanaryShadowExecutionRecord['comparison']['status'];
  matched: boolean;
  drifted: boolean;
  failed: boolean;
  notComparable: boolean;
  selfMirrored: boolean;
  rollbackTriggered: boolean;
  criticalDrift: boolean;
  privacyViolation: boolean;
  telemetryFailure: boolean;
  latencyMs: number;
  gateResultsPassed: number;
  gateResultsTotal: number;
  productionOutputPreserved: true;
  bindingResult?: AuthorityExecutionBindingResult;
  auditRecord?: CanaryShadowExecutionRecord;
  payloadSummary?: ObservePayloadSummary;
  failure?: CanaryShadowTrialFailure;
  notes: readonly string[];
}

export interface CanaryShadowTrialMetrics {
  totalScenarios: number;
  sampledScenarios: number;
  executedScenarios: number;
  skippedScenarios: number;
  matchedCount: number;
  driftCount: number;
  failedCount: number;
  notComparableCount: number;
  selfMirroredCount: number;
  rollbackCount: number;
  criticalDriftCount: number;
  privacyViolationCount: number;
  telemetryFailureCount: number;
  averageLatencyMs: number;
  p95LatencyMs: number;
  failureRate: number;
  driftRate: number;
  matchRate: number;
  comparableCoverage: number;
  gatePassRate: number;
}

export interface CanaryShadowTrialRun {
  runId: string;
  trialId: string;
  status: CanaryShadowTrialStatus;
  startedAt: string;
  completedAt?: string;
  scenarioCount: number;
  approval?: ManualApprovalRecord;
  notes: readonly string[];
}

export interface CanaryShadowTrialResult {
  trial: CanaryShadowTrial;
  run: CanaryShadowTrialRun;
  status: CanaryShadowTrialStatus;
  verdict: CanaryShadowTrialVerdict;
  flowResults: readonly CanaryShadowTrialFlowResult[];
  metrics: CanaryShadowTrialMetrics;
  failures: readonly CanaryShadowTrialFailure[];
  warnings: readonly string[];
  productionOutputPreserved: true;
}

export interface CanaryShadowTrial {
  trialId: string;
  status: CanaryShadowTrialStatus;
  config: CanaryShadowTrialConfig;
  approval?: ManualApprovalRecord;
  scenarioCount: number;
  createdAt: string;
  approvalEvidence: readonly CanaryShadowTrialApprovalEvidence[];
}

export interface CanaryShadowTrialGateResult {
  verdict: CanaryShadowTrialVerdict;
  passed: boolean;
  failures: readonly string[];
  warnings: readonly string[];
  evaluatedAt: string;
  metrics: CanaryShadowTrialMetrics;
}
