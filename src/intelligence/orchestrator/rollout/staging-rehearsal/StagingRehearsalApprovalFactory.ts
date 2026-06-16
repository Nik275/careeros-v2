/**
 * @fileoverview Manual approval factory for Phase 5.8 staging rehearsals.
 */

import type { ManualApprovalScope, ManualApprovalRecord } from '../ManualApprovalRecord';
import type {
  StagingRehearsalApprovalEvidence,
  StagingRehearsalFlowName,
} from './StagingRehearsalTypes';

export interface StagingRehearsalApprovalFactoryInput {
  runId: string;
  approvedBy: string;
  environment: string;
  allowedFlows: readonly StagingRehearsalFlowName[];
  allowedEntrypoints: readonly string[];
  maxSampleRate: number;
  maxExecutions: number;
  reason: string;
  parityEvidenceReference?: string;
  stagingShadowEvidenceReference?: string;
  productionSafetyAcknowledgement: string;
  approvedAt?: string;
  expiresAt?: string;
  requestedScope?: ManualApprovalScope;
  allowOutputReplacement?: boolean;
  allowRawPayloadCapture?: boolean;
}

export interface StagingRehearsalApprovalValidationInput {
  environment: string;
  flows: readonly StagingRehearsalFlowName[];
  entrypoints: readonly string[];
  sampleRate: number;
  maxExecutions: number;
  requestedScope?: ManualApprovalScope;
  captureRawPayloads?: boolean;
  now?: string;
}

export interface StagingRehearsalApprovalValidationResult {
  valid: boolean;
  reason: string;
  evidence: readonly string[];
}

export function createStagingRehearsalApproval(
  input: StagingRehearsalApprovalFactoryInput
): StagingRehearsalApprovalEvidence {
  const approvedAt = input.approvedAt ?? new Date().toISOString();
  const expiresAt =
    input.expiresAt ?? new Date(new Date(approvedAt).getTime() + 12 * 60 * 60 * 1000).toISOString();
  const environment = normalizeEnvironment(input.environment);
  const flows = Object.freeze([...new Set(input.allowedFlows)]);
  const entrypoints = Object.freeze([...new Set(input.allowedEntrypoints)]);
  const requestedScope = input.requestedScope ?? 'CANARY_SHADOW';

  if (requestedScope !== 'CANARY_SHADOW') {
    throw new Error('Phase 5.8 approvals cannot authorize CANARY_LIVE or FULL_LIVE.');
  }
  if (environment === 'production' || environment === 'prod') {
    throw new Error('Phase 5.8 approvals cannot authorize production.');
  }
  if (input.allowOutputReplacement) {
    throw new Error('Phase 5.8 approvals cannot authorize output replacement.');
  }
  if (input.allowRawPayloadCapture) {
    throw new Error('Phase 5.8 approvals cannot authorize raw payload capture.');
  }
  if (flows.length === 0) {
    throw new Error('Phase 5.8 approval must list at least one flow.');
  }
  if (entrypoints.length === 0) {
    throw new Error('Phase 5.8 approval must list at least one entrypoint.');
  }

  const parityEvidenceReference =
    input.parityEvidenceReference ?? 'docs/constitutional/Phase5_4_CIGateReport.md';
  const stagingShadowEvidenceReference =
    input.stagingShadowEvidenceReference ?? 'docs/constitutional/Phase5_7_FinalVerdict.md';
  const evidence = Object.freeze([
    {
      evidenceId: `staging-rehearsal-evidence-${hashString(`${input.runId}|${parityEvidenceReference}`)}`,
      description: 'Phase 5.8 staging rehearsal approval evidence.',
      createdAt: approvedAt,
      metadata: {
        runId: input.runId,
        environment,
        parityEvidenceReference,
        stagingShadowEvidenceReference,
        outputReplacementApproved: false,
        rawPayloadCaptureApproved: false,
        liveModesApproved: false,
      },
    },
  ]);
  const manualApproval: ManualApprovalRecord = Object.freeze({
    approvalId: `staging-rehearsal-approval-${hashString(`${input.runId}|${environment}|${approvedAt}`)}`,
    approvedBy: input.approvedBy,
    approvedAt,
    expiresAt,
    scope: 'CANARY_SHADOW',
    flows,
    maxSampleRate: clamp(input.maxSampleRate, 0, 1),
    reason: input.reason,
    evidence,
    status: 'APPROVED',
  });

  return Object.freeze({
    approvalId: manualApproval.approvalId,
    approvedBy: input.approvedBy,
    approvedAt,
    expiresAt,
    environment,
    allowedFlows: flows,
    allowedEntrypoints: entrypoints,
    maxSampleRate: manualApproval.maxSampleRate,
    maxExecutions: Math.max(0, Math.floor(input.maxExecutions)),
    reason: input.reason,
    parityEvidenceReference,
    stagingShadowEvidenceReference,
    productionSafetyAcknowledgement: input.productionSafetyAcknowledgement,
    status: 'APPROVED',
    manualApproval,
  });
}

export function validateStagingRehearsalApproval(
  approval: StagingRehearsalApprovalEvidence | undefined,
  input: StagingRehearsalApprovalValidationInput
): StagingRehearsalApprovalValidationResult {
  if (!approval) return invalid('No staging rehearsal approval was supplied.', ['approval=missing']);

  const requestedScope = input.requestedScope ?? 'CANARY_SHADOW';
  if (requestedScope !== 'CANARY_SHADOW' || approval.manualApproval.scope !== 'CANARY_SHADOW') {
    return invalid('Approval cannot authorize CANARY_LIVE or FULL_LIVE in Phase 5.8.', [
      `requestedScope=${requestedScope}`,
      `approvalScope=${approval.manualApproval.scope}`,
    ]);
  }

  const environment = normalizeEnvironment(input.environment);
  if (environment === 'production' || environment === 'prod' || approval.environment === 'production' || approval.environment === 'prod') {
    return invalid('Approval cannot authorize production.', [
      `requestedEnvironment=${environment}`,
      `approvalEnvironment=${approval.environment}`,
    ]);
  }
  if (approval.environment !== environment) {
    return invalid('Approval environment does not match rehearsal environment.', [
      `requestedEnvironment=${environment}`,
      `approvalEnvironment=${approval.environment}`,
    ]);
  }
  if (input.captureRawPayloads) {
    return invalid('Approval cannot authorize raw payload capture.', ['captureRawPayloads=true']);
  }
  if (approval.status !== 'APPROVED') return invalid('Approval is not approved.', [`status=${approval.status}`]);

  const now = new Date(input.now ?? new Date().toISOString()).getTime();
  const expiresAt = new Date(approval.expiresAt).getTime();
  if (!Number.isFinite(expiresAt) || expiresAt <= now) {
    return invalid('Approval is expired.', [`expiresAt=${approval.expiresAt}`]);
  }

  for (const flow of input.flows) {
    if (!approval.allowedFlows.includes(flow)) {
      return invalid('Approval does not include every requested flow.', [`missingFlow=${flow}`]);
    }
  }
  for (const entrypoint of input.entrypoints) {
    if (!approval.allowedEntrypoints.includes(entrypoint)) {
      return invalid('Approval does not include every requested entrypoint.', [`missingEntrypoint=${entrypoint}`]);
    }
  }
  if (input.sampleRate > approval.maxSampleRate) {
    return invalid('Requested sample rate exceeds approval.', [
      `sampleRate=${input.sampleRate}`,
      `maxSampleRate=${approval.maxSampleRate}`,
    ]);
  }
  if (input.maxExecutions > approval.maxExecutions) {
    return invalid('Requested execution count exceeds approval.', [
      `maxExecutions=${input.maxExecutions}`,
      `approvedMaxExecutions=${approval.maxExecutions}`,
    ]);
  }
  if (!approval.productionSafetyAcknowledgement.trim()) {
    return invalid('Production safety acknowledgement is required.', [
      'productionSafetyAcknowledgement=missing',
    ]);
  }

  return {
    valid: true,
    reason: 'Staging rehearsal approval is valid for CANARY_SHADOW only.',
    evidence: [
      `approvalId=${approval.approvalId}`,
      `environment=${approval.environment}`,
      `entrypoints=${approval.allowedEntrypoints.join(',')}`,
      'liveModesApproved=false',
    ],
  };
}

function invalid(reason: string, evidence: readonly string[]): StagingRehearsalApprovalValidationResult {
  return { valid: false, reason, evidence };
}

function normalizeEnvironment(environment: string | undefined): string {
  const normalized = (environment ?? 'unknown').trim().toLowerCase();
  return normalized.length > 0 ? normalized : 'unknown';
}

function clamp(value: number, minimum: number, maximum: number): number {
  if (Number.isNaN(value)) return minimum;
  return Math.min(maximum, Math.max(minimum, value));
}

function hashString(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}
