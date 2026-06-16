/**
 * @fileoverview Phase 5.9 app-route rehearsal contracts.
 *
 * App-route rehearsal is shadow-only. It never replaces production output or
 * enables live routing.
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

export type AppRehearsalStatus =
  | 'PLANNED'
  | 'BLOCKED'
  | 'APPROVED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'ROLLED_BACK'
  | 'CANCELLED';

export type AppRehearsalVerdict = 'PASS' | 'PASS_WITH_WARNINGS' | 'FAIL' | 'BLOCKED';
export type AppRehearsalRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AppRehearsalFlowName = CanaryShadowFlowName;
export type AppEntrypointLevel =
  | 'app-route'
  | 'app-component'
  | 'test-only-adapter'
  | 'service'
  | 'service-fallback';
export type AppEntrypointAlignmentDecision =
  | 'IMPLEMENT_TEST_ONLY_REHEARSAL_ADAPTER'
  | 'IMPLEMENT_STAGING_ONLY_SHADOW_BRIDGE'
  | 'IMPLEMENT_SERVICE_LAYER_ALIGNMENT'
  | 'DOCUMENT_ONLY_BLOCKER';

export interface AppEntrypointCandidate {
  entrypointId: string;
  filePath: string;
  functionName: string;
  flow: AppRehearsalFlowName | 'marketing' | 'none';
  flowType: string;
  level: AppEntrypointLevel;
  currentBehavior: string;
  callsAssessmentProcessResponses: boolean;
  callsCareerFitCalculateFit: boolean;
  reachesObserveHook: boolean;
  inputShape: readonly string[];
  outputShape: readonly string[];
  sideEffects: readonly string[];
  riskLevel: AppRehearsalRiskLevel;
  safeForStagingShadowAlignment: boolean;
  selected: boolean;
  selectionReason: string;
}

export interface AppEntrypointAlignment {
  alignmentId: string;
  decision: AppEntrypointAlignmentDecision;
  flow: AppRehearsalFlowName;
  selectedEntrypointId: string;
  level: AppEntrypointLevel;
  actualAppRouteCovered: boolean;
  testOnlyAdapter: boolean;
  serviceFallback: boolean;
  usesValidatedServiceBoundary: boolean;
  productionOutputAffected: false;
  liveRoutingEnabled: false;
  evidence: readonly string[];
}

export interface AppRehearsalConfig {
  runId: string;
  enabled: boolean;
  environment: string;
  allowedEnvironments: readonly string[];
  allowedFlows: readonly AppRehearsalFlowName[];
  allowedEntrypoints: readonly string[];
  allowServiceFallback: boolean;
  requireAppLevelCoverage: boolean;
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

export interface AppRehearsalApprovalEvidence {
  approvalId: string;
  approvedBy: string;
  approvedAt: string;
  expiresAt: string;
  environment: string;
  allowedFlows: readonly AppRehearsalFlowName[];
  allowedEntrypoints: readonly string[];
  allowServiceFallback: boolean;
  maxSampleRate: number;
  maxExecutions: number;
  reason: string;
  parityEvidenceReference: string;
  stagingShadowEvidenceReference: string;
  stagingRehearsalEvidenceReference: string;
  productionSafetyAcknowledgement: string;
  status: ManualApprovalStatus;
  manualApproval: ManualApprovalRecord;
}

export interface AppRehearsalScenario {
  scenarioId: string;
  flow: AppRehearsalFlowName;
  entrypoint: AppEntrypointCandidate;
  alignment: AppEntrypointAlignment;
  input: unknown;
  expectedAuthority: 'StudentUnderstandingAuthority' | 'OptionGeneratorAuthority';
  expectedCapability: 'UNDERSTAND' | 'GENERATE';
  riskLevel: AppRehearsalRiskLevel;
  privacyClassification: 'SYNTHETIC';
  expectedProductionShape: readonly string[];
  expectedHookName: 'AssessmentEngine.processResponses' | 'CareerFitEngine.calculateFit';
  synthetic: true;
  forcedMode?:
    | 'missing-app-entrypoint'
    | 'hook-not-reached'
    | 'entrypoint-failure';
}

export interface AppRehearsalFailure {
  failureId: string;
  scenarioId?: string;
  flow?: string;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  occurredAt: string;
  metadata: Readonly<Record<string, unknown>>;
}

export interface AppRehearsalGateInputs {
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

export interface AppRehearsalHookProof {
  proofId: string;
  generatedAt: string;
  assessmentHookReached: boolean;
  careerFitHookReached: boolean;
  observeRouterReached: boolean;
  canaryShadowReached: boolean;
  dryRunBindingReached: boolean;
  hookInvocationCount: number;
  observeRouterInvocationCount: number;
  canaryShadowExecutionCount: number;
  dryRunBindingInvocationCount: number;
  appLevelPathCount: number;
  serviceFallbackPathCount: number;
  hookReachabilityRate: number;
  byHook: Readonly<Record<string, number>>;
  byFlow: Readonly<Record<string, number>>;
  byEntrypointLevel: Readonly<Record<string, number>>;
  statuses: readonly string[];
  observeRequestIds: readonly string[];
}

export interface AppRehearsalFlowResult {
  scenarioId: string;
  flow: AppRehearsalFlowName;
  entrypointId: string;
  entrypointLevel: AppEntrypointLevel;
  alignmentDecision: AppEntrypointAlignmentDecision;
  status: AppRehearsalStatus;
  sampled: boolean;
  executed: boolean;
  appLevel: boolean;
  serviceLevelFallback: boolean;
  hookReached: boolean;
  observeRouterReached: boolean;
  canaryShadowReached: boolean;
  dryRunBindingReached: boolean;
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
  failure?: AppRehearsalFailure;
  notes: readonly string[];
}

export interface AppRehearsalMetrics {
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
  appLevelCoverageRate: number;
  serviceFallbackRate: number;
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

export interface AppRehearsalRun {
  runId: string;
  status: AppRehearsalStatus;
  startedAt: string;
  completedAt?: string;
  environmentDecision?: StagingShadowEnvironmentDecision;
  approval?: AppRehearsalApprovalEvidence;
  scenarioCount: number;
  notes: readonly string[];
}

export interface AppRehearsalAuditBundle {
  bundleId: string;
  runId: string;
  generatedAt: string;
  environmentDecision: StagingShadowEnvironmentDecision;
  approval?: Omit<AppRehearsalApprovalEvidence, 'manualApproval'>;
  entrypointDiscoverySummary: readonly Readonly<Record<string, unknown>>[];
  selectedAlignmentStrategy: AppEntrypointAlignmentDecision;
  entrypointsExecuted: readonly Readonly<Record<string, unknown>>[];
  serviceFallbacksUsed: readonly Readonly<Record<string, unknown>>[];
  gateResults: Readonly<Record<string, unknown>>;
  samplingDecisions: readonly Readonly<Record<string, unknown>>[];
  hookReachabilityProof: AppRehearsalHookProof;
  flowResults: readonly Readonly<Record<string, unknown>>[];
  driftResults: readonly Readonly<Record<string, unknown>>[];
  failureResults: readonly Readonly<Record<string, unknown>>[];
  rollbackResults: readonly Readonly<Record<string, unknown>>[];
  latencyMetrics: Readonly<Record<string, unknown>>;
  privacySummary: Readonly<Record<string, unknown>>;
  telemetrySummary: Readonly<Record<string, unknown>>;
  finalVerdict: AppRehearsalVerdict;
  productionOutputPreserved: true;
  liveRoutingEnabled: false;
}

export interface AppRehearsalResult {
  rehearsal: AppRehearsalRun;
  status: AppRehearsalStatus;
  verdict: AppRehearsalVerdict;
  environmentDecision: StagingShadowEnvironmentDecision;
  approval?: AppRehearsalApprovalEvidence;
  entrypoints: readonly AppEntrypointCandidate[];
  alignments: readonly AppEntrypointAlignment[];
  hookReachabilityProof: AppRehearsalHookProof;
  flowResults: readonly AppRehearsalFlowResult[];
  metrics: AppRehearsalMetrics;
  failures: readonly AppRehearsalFailure[];
  warnings: readonly string[];
  auditBundle: AppRehearsalAuditBundle;
  productionOutputPreserved: true;
  liveRoutingEnabled: false;
}

export interface AppRehearsalEntrypointExecutionInput {
  scenario: AppRehearsalScenario;
  assessmentObserveOptions?: AssessmentObserveHookOptions;
  careerFitObserveOptions?: CareerFitObserveHookOptions;
}

export interface AppRehearsalEntrypointExecutionResult {
  productionOutput: unknown;
  entrypointId: string;
  entrypointLevel: AppEntrypointLevel;
  notes: readonly string[];
}

export type AppRehearsalEntrypointExecutor = (
  input: AppRehearsalEntrypointExecutionInput
) => Promise<AppRehearsalEntrypointExecutionResult>;
