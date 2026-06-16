/**
 * @fileoverview Phase 5.8 staging rehearsal contracts.
 *
 * Rehearsal mode is shadow-only. Production output remains authoritative and
 * live routing remains blocked.
 */

import type { AssessmentObserveHookOptions } from '../../observe/AssessmentObserveHook';
import type { CareerFitObserveHookOptions } from '../../observe/CareerFitObserveHook';
import type { ObserveModeResult } from '../../observe/ObserveModeTypes';
import type {
  CanaryShadowExecutionRecord,
  CanaryShadowFlowName,
} from '../CanaryShadowTypes';
import type { ManualApprovalRecord, ManualApprovalStatus } from '../ManualApprovalRecord';
import type { StagingShadowEnvironmentDecision } from '../staging/StagingShadowRunTypes';

export type StagingRehearsalStatus =
  | 'PLANNED'
  | 'BLOCKED'
  | 'APPROVED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'ROLLED_BACK'
  | 'CANCELLED';

export type StagingRehearsalVerdict = 'PASS' | 'PASS_WITH_WARNINGS' | 'FAIL' | 'BLOCKED';

export type StagingRehearsalRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type StagingRehearsalEntrypointLevel = 'app' | 'service' | 'service-fallback';

export type StagingRehearsalFlowName = CanaryShadowFlowName;

export interface StagingRehearsalEntrypoint {
  entrypointId: string;
  filePath: string;
  exportName: string;
  flow: StagingRehearsalFlowName;
  level: StagingRehearsalEntrypointLevel;
  reachesObserveHook: boolean;
  safeForRehearsal: boolean;
  selected: boolean;
  riskLevel: StagingRehearsalRiskLevel;
  selectionReason: string;
}

export interface StagingRehearsalConfig {
  runId: string;
  enabled: boolean;
  environment: string;
  allowedEnvironments: readonly string[];
  allowedFlows: readonly StagingRehearsalFlowName[];
  allowedEntrypoints: readonly string[];
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

export interface StagingRehearsalApprovalEvidence {
  approvalId: string;
  approvedBy: string;
  approvedAt: string;
  expiresAt: string;
  environment: string;
  allowedFlows: readonly StagingRehearsalFlowName[];
  allowedEntrypoints: readonly string[];
  maxSampleRate: number;
  maxExecutions: number;
  reason: string;
  parityEvidenceReference: string;
  stagingShadowEvidenceReference: string;
  productionSafetyAcknowledgement: string;
  status: ManualApprovalStatus;
  manualApproval: ManualApprovalRecord;
}

export interface StagingRehearsalScenario {
  scenarioId: string;
  flow: StagingRehearsalFlowName;
  entrypoint: StagingRehearsalEntrypoint;
  input: unknown;
  expectedAuthority: 'StudentUnderstandingAuthority' | 'OptionGeneratorAuthority';
  expectedCapability: 'UNDERSTAND' | 'GENERATE';
  riskLevel: StagingRehearsalRiskLevel;
  privacyClassification: 'SYNTHETIC';
  expectedProductionShape: readonly string[];
  synthetic: true;
  forcedFailure?: StagingRehearsalFailure;
  forcedMode?: 'hook-not-reached' | 'entrypoint-failure' | 'drift' | 'binding-failure';
}

export interface StagingRehearsalFailure {
  failureId: string;
  scenarioId?: string;
  flow?: StagingRehearsalFlowName | string;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  occurredAt: string;
  metadata: Readonly<Record<string, unknown>>;
}

export interface StagingRehearsalGateInputs {
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

export interface HookReachabilityProof {
  proofId: string;
  generatedAt: string;
  assessmentHookReached: boolean;
  careerFitHookReached: boolean;
  hookInvocationCount: number;
  observeRouterInvocationCount: number;
  canaryShadowExecutionCount: number;
  byHook: Readonly<Record<string, number>>;
  byFlow: Readonly<Record<string, number>>;
  statuses: readonly string[];
  observeRequestIds: readonly string[];
}

export interface StagingRehearsalFlowResult {
  scenarioId: string;
  flow: StagingRehearsalFlowName;
  entrypointId: string;
  entrypointLevel: StagingRehearsalEntrypointLevel;
  status: StagingRehearsalStatus;
  sampled: boolean;
  executed: boolean;
  appLevel: boolean;
  serviceLevelFallback: boolean;
  hookReached: boolean;
  observeRouterReached: boolean;
  canaryShadowReached: boolean;
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
  productionOutput?: unknown;
  observeResult?: ObserveModeResult;
  auditRecord?: CanaryShadowExecutionRecord;
  failure?: StagingRehearsalFailure;
  notes: readonly string[];
}

export interface StagingRehearsalMetrics {
  totalScenarios: number;
  executedScenarios: number;
  blockedScenarios: number;
  skippedScenarios: number;
  appLevelScenarios: number;
  serviceLevelFallbackScenarios: number;
  matchedCount: number;
  driftCount: number;
  failedCount: number;
  rollbackCount: number;
  notComparableCount: number;
  selfMirroredCount: number;
  hookReachabilityRate: number;
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

export interface StagingRehearsal {
  runId: string;
  status: StagingRehearsalStatus;
  startedAt: string;
  completedAt?: string;
  environmentDecision?: StagingShadowEnvironmentDecision;
  approval?: StagingRehearsalApprovalEvidence;
  scenarioCount: number;
  notes: readonly string[];
}

export interface StagingRehearsalAuditBundle {
  bundleId: string;
  runId: string;
  generatedAt: string;
  environmentDecision: StagingShadowEnvironmentDecision;
  approval?: Omit<StagingRehearsalApprovalEvidence, 'manualApproval'>;
  entrypointDiscoverySummary: readonly Readonly<Record<string, unknown>>[];
  entrypointsExecuted: readonly Readonly<Record<string, unknown>>[];
  gateResults: Readonly<Record<string, unknown>>;
  samplingDecisions: readonly Readonly<Record<string, unknown>>[];
  hookReachabilityProof: HookReachabilityProof;
  flowResults: readonly Readonly<Record<string, unknown>>[];
  driftResults: readonly Readonly<Record<string, unknown>>[];
  failureResults: readonly Readonly<Record<string, unknown>>[];
  rollbackResults: readonly Readonly<Record<string, unknown>>[];
  latencyMetrics: Readonly<Record<string, unknown>>;
  privacySummary: Readonly<Record<string, unknown>>;
  telemetrySummary: Readonly<Record<string, unknown>>;
  finalVerdict: StagingRehearsalVerdict;
  productionOutputPreserved: true;
  liveRoutingEnabled: false;
}

export interface StagingRehearsalResult {
  rehearsal: StagingRehearsal;
  status: StagingRehearsalStatus;
  verdict: StagingRehearsalVerdict;
  environmentDecision: StagingShadowEnvironmentDecision;
  approval?: StagingRehearsalApprovalEvidence;
  entrypoints: readonly StagingRehearsalEntrypoint[];
  hookReachabilityProof: HookReachabilityProof;
  flowResults: readonly StagingRehearsalFlowResult[];
  metrics: StagingRehearsalMetrics;
  failures: readonly StagingRehearsalFailure[];
  warnings: readonly string[];
  auditBundle: StagingRehearsalAuditBundle;
  productionOutputPreserved: true;
  liveRoutingEnabled: false;
}

export interface StagingRehearsalEntrypointExecutionInput {
  scenario: StagingRehearsalScenario;
  assessmentObserveOptions?: AssessmentObserveHookOptions;
  careerFitObserveOptions?: CareerFitObserveHookOptions;
}

export interface StagingRehearsalEntrypointExecutionResult {
  productionOutput: unknown;
  entrypointId: string;
  entrypointLevel: StagingRehearsalEntrypointLevel;
  notes: readonly string[];
}

export type StagingRehearsalEntrypointExecutor = (
  input: StagingRehearsalEntrypointExecutionInput
) => Promise<StagingRehearsalEntrypointExecutionResult>;
