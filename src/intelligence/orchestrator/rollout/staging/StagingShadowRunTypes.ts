/**
 * @fileoverview Phase 5.7 staging CANARY_SHADOW operational run contracts.
 *
 * These contracts model staging-only shadow execution. Production output
 * remains authoritative and live routing remains blocked.
 */

import type { AuthorityExecutionBindingResult } from '../../bindings/AuthorityExecutionBindingTypes';
import type { ObserveModeResult } from '../../observe/ObserveModeTypes';
import type { ObservePayloadSummary } from '../../observe/ObserveTelemetryTypes';
import type {
  CanaryShadowExecutionRecord,
  CanaryShadowFlowName,
} from '../CanaryShadowTypes';
import type { ManualApprovalRecord, ManualApprovalStatus } from '../ManualApprovalRecord';

export type StagingShadowRunStatus =
  | 'PLANNED'
  | 'BLOCKED'
  | 'APPROVED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'ROLLED_BACK'
  | 'CANCELLED';

export type StagingShadowOperationalVerdict = 'PASS' | 'PASS_WITH_WARNINGS' | 'FAIL' | 'BLOCKED';

export type StagingShadowRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type StagingShadowSourceSuite = 'golden' | 'stress' | 'fuzz';

export type StagingShadowFlowName = CanaryShadowFlowName;

export interface StagingShadowEnvironmentDecision {
  environment: string;
  normalizedEnvironment: string;
  allowed: boolean;
  reason: string;
  evidence: readonly string[];
  decidedAt: string;
}

export interface StagingShadowRunConfig {
  runId: string;
  enabled: boolean;
  environment: string;
  allowedEnvironments: readonly string[];
  allowedFlows: readonly StagingShadowFlowName[];
  sampleRate: number;
  maxExecutionsPerFlow: number;
  maxTotalExecutions: number;
  requireManualApproval: boolean;
  requireParityGate: boolean;
  requirePrivacyGate: boolean;
  requireTelemetryHealth: boolean;
  requireKillSwitchInactive: boolean;
  requireEnvironmentGuard: boolean;
  rollbackOnAnyDrift: boolean;
  rollbackOnAnyFailure: boolean;
  rollbackOnLatencyRegression: boolean;
  maxLatencyMs: number;
  capturePayloadSummaries: boolean;
  captureRawPayloads: boolean;
}

export interface StagingShadowApprovalEvidence {
  approvalId: string;
  approvedBy: string;
  approvedAt: string;
  expiresAt: string;
  environment: string;
  allowedFlows: readonly StagingShadowFlowName[];
  maxSampleRate: number;
  maxExecutions: number;
  reason: string;
  evidence: readonly {
    evidenceId: string;
    description: string;
    createdAt: string;
    metadata: Readonly<Record<string, unknown>>;
  }[];
  parityEvidenceReference: string;
  productionSafetyAcknowledgement: string;
  status: ManualApprovalStatus;
  manualApproval: ManualApprovalRecord;
}

export interface StagingShadowScenario {
  scenarioId: string;
  flow: StagingShadowFlowName;
  sourceSuite: StagingShadowSourceSuite;
  riskLevel: StagingShadowRiskLevel;
  purpose: string;
  input: unknown;
  hookInput: unknown;
  expectedAuthority: 'StudentUnderstandingAuthority' | 'OptionGeneratorAuthority';
  expectedCapability: 'UNDERSTAND' | 'GENERATE';
  privacyClassification: 'SYNTHETIC' | 'SUMMARY_ONLY';
  productionOutputSnapshot: unknown;
  shadowOutput: unknown;
  synthetic: true;
  forcedFailure?: StagingShadowFailure;
  productionFailure?: StagingShadowFailure;
}

export interface StagingShadowFailure {
  failureId: string;
  scenarioId?: string;
  flow?: StagingShadowFlowName | string;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  occurredAt: string;
  metadata: Readonly<Record<string, unknown>>;
}

export interface StagingShadowGateInputs {
  rolloutGateApproved?: boolean;
  expandedParityCIGatePassed?: boolean;
  privacySafe?: boolean;
  telemetryHealthy?: boolean;
  killSwitchActive?: boolean;
  flowKillSwitchActive?: boolean;
  unresolvedCriticalDrift?: boolean;
  failureRate?: number;
  latencyRegressionMs?: number;
}

export interface StagingShadowFlowResult {
  scenarioId: string;
  flow: StagingShadowFlowName;
  sourceSuite: StagingShadowSourceSuite;
  status: StagingShadowRunStatus;
  sampled: boolean;
  executed: boolean;
  hookPathObserved: boolean;
  observeResultStatus?: ObserveModeResult['status'];
  comparisonStatus: CanaryShadowExecutionRecord['comparison']['status'];
  matched: boolean;
  drifted: boolean;
  failed: boolean;
  notComparable: boolean;
  selfMirrored: boolean;
  rollbackTriggered: boolean;
  privacyViolation: boolean;
  telemetryFailure: boolean;
  latencyMs: number;
  gateResultsPassed: number;
  gateResultsTotal: number;
  productionOutputPreserved: true;
  bindingResult?: AuthorityExecutionBindingResult;
  observeResult?: ObserveModeResult;
  auditRecord?: CanaryShadowExecutionRecord;
  payloadSummary?: ObservePayloadSummary;
  failure?: StagingShadowFailure;
  notes: readonly string[];
}

export interface StagingShadowMetrics {
  totalScenarios: number;
  executedScenarios: number;
  blockedScenarios: number;
  skippedScenarios: number;
  matchedCount: number;
  driftCount: number;
  failedCount: number;
  rollbackCount: number;
  notComparableCount: number;
  selfMirroredCount: number;
  matchRate: number;
  driftRate: number;
  failureRate: number;
  comparableCoverage: number;
  averageLatencyMs: number;
  p95LatencyMs: number;
  gatePassRate: number;
  privacyViolationCount: number;
  telemetryFailureCount: number;
}

export interface StagingShadowRun {
  runId: string;
  status: StagingShadowRunStatus;
  startedAt: string;
  completedAt?: string;
  environmentDecision?: StagingShadowEnvironmentDecision;
  approval?: StagingShadowApprovalEvidence;
  scenarioCount: number;
  notes: readonly string[];
}

export interface StagingShadowRunResult {
  run: StagingShadowRun;
  status: StagingShadowRunStatus;
  verdict: StagingShadowOperationalVerdict;
  environmentDecision: StagingShadowEnvironmentDecision;
  approval?: StagingShadowApprovalEvidence;
  flowResults: readonly StagingShadowFlowResult[];
  metrics: StagingShadowMetrics;
  failures: readonly StagingShadowFailure[];
  warnings: readonly string[];
  auditBundle: StagingShadowAuditBundle;
  productionOutputPreserved: true;
  liveRoutingEnabled: false;
}

export interface StagingShadowAuditBundle {
  bundleId: string;
  runId: string;
  generatedAt: string;
  environmentDecision: StagingShadowEnvironmentDecision;
  approval?: Omit<StagingShadowApprovalEvidence, 'manualApproval'>;
  gateResults: Readonly<Record<string, unknown>>;
  samplingDecisions: readonly Readonly<Record<string, unknown>>[];
  flowResults: readonly Readonly<Record<string, unknown>>[];
  driftResults: readonly Readonly<Record<string, unknown>>[];
  failureResults: readonly Readonly<Record<string, unknown>>[];
  rollbackResults: readonly Readonly<Record<string, unknown>>[];
  latencyMetrics: Readonly<Record<string, unknown>>;
  privacySummary: Readonly<Record<string, unknown>>;
  telemetrySummary: Readonly<Record<string, unknown>>;
  finalVerdict: StagingShadowOperationalVerdict;
  productionOutputPreserved: true;
  liveRoutingEnabled: false;
}
