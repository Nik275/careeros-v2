/**
 * @fileoverview Rollout control-plane contracts for constitutional orchestration.
 */

export type RolloutMode =
  | 'DISABLED'
  | 'OBSERVE_ONLY'
  | 'DRY_RUN_COMPARE'
  | 'CANARY_SHADOW'
  | 'CANARY_LIVE'
  | 'FULL_LIVE';

export type RolloutStatus = 'allowed' | 'blocked' | 'disabled' | 'rolled_back';

export type RolloutGateStatus = 'PASS' | 'WARN' | 'FAIL' | 'BLOCKED' | 'NOT_APPLICABLE';

export type RolloutRiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type RolloutRollbackReason =
  | 'kill_switch'
  | 'drift_threshold'
  | 'failure_rate'
  | 'latency_regression'
  | 'telemetry_failure'
  | 'manual_rollback'
  | 'policy_block';

export type RolloutFlow = 'assessment' | 'career-fit' | string;

export interface RolloutGateResult {
  gateName: string;
  status: RolloutGateStatus;
  reason: string;
  evidence: readonly string[];
  blocking: boolean;
  recommendedAction: string;
}

export interface RolloutDecision {
  decisionId: string;
  flow: RolloutFlow;
  requestedMode: RolloutMode;
  approvedMode: RolloutMode;
  status: RolloutStatus;
  allowed: boolean;
  riskLevel: RolloutRiskLevel;
  gateResults: readonly RolloutGateResult[];
  reasons: readonly string[];
  rollbackReason?: RolloutRollbackReason;
  decidedAt: string;
  metadata: Readonly<Record<string, unknown>>;
}

export interface RolloutHealthSnapshot {
  healthy: boolean;
  mode: RolloutMode;
  flowCount: number;
  killSwitchActive: boolean;
  recentDecisionCount: number;
  lastDecisionStatus?: RolloutStatus;
}

export interface RolloutAuditRecord {
  auditId: string;
  decision: RolloutDecision;
  createdAt: string;
  notes: readonly string[];
}

export interface RolloutFlowPolicy {
  enabled: boolean;
  allowedModes: readonly RolloutMode[];
  observeModeEnabled: boolean;
  bindingAvailable: boolean;
  parityPassed: boolean;
  unresolvedCriticalDrift: boolean;
  failureRate: number;
  latencyRegressionMs: number;
  telemetryHealthy: boolean;
  privacySafe: boolean;
  expandedParityCIGatePassed: boolean;
  manualApprovalGranted: boolean;
  scopedTypeCheckPassed: boolean;
  testCoveragePassed: boolean;
  canaryPercent: number;
}

export interface RolloutPolicy {
  globalEnabled: boolean;
  allowedModes: readonly RolloutMode[];
  perFlowConfig: Readonly<Record<string, Partial<RolloutFlowPolicy>>>;
  maxCanaryPercent: number;
  requireParityBeforeLive: boolean;
  requireManualApproval: boolean;
  killSwitchEnabled: boolean;
  rollbackOnDrift: boolean;
  rollbackOnFailureRate: boolean;
  rollbackOnLatencyRegression: boolean;
  rollbackOnTelemetryFailure: boolean;
  explicitlyAllowCanaryLive: boolean;
}

export interface RolloutEvaluationInput {
  flow: RolloutFlow;
  requestedMode: RolloutMode;
  flowPolicy?: Partial<RolloutFlowPolicy>;
  metadata?: Readonly<Record<string, unknown>>;
}
