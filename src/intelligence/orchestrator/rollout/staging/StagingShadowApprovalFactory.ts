/**
 * @fileoverview Manual approval factory for staging-only CANARY_SHADOW runs.
 */

import type { CanaryShadowFlowName } from '../CanaryShadowTypes';
import type { ManualApprovalRecord, ManualApprovalScope } from '../ManualApprovalRecord';
import type { StagingShadowApprovalEvidence } from './StagingShadowRunTypes';

export interface StagingShadowApprovalFactoryInput {
  runId: string;
  approvedBy: string;
  environment: string;
  allowedFlows: readonly CanaryShadowFlowName[];
  maxSampleRate: number;
  maxExecutions: number;
  reason: string;
  evidence?: readonly Readonly<Record<string, unknown>>[];
  parityEvidenceReference?: string;
  productionSafetyAcknowledgement: string;
  approvedAt?: string;
  expiresAt?: string;
  requestedScope?: ManualApprovalScope;
}

export interface StagingShadowApprovalValidationInput {
  environment: string;
  flows: readonly CanaryShadowFlowName[];
  sampleRate: number;
  maxExecutions: number;
  requestedScope?: ManualApprovalScope;
  now?: string;
}

export interface StagingShadowApprovalValidationResult {
  valid: boolean;
  reason: string;
  evidence: readonly string[];
}

export function createStagingShadowApproval(
  input: StagingShadowApprovalFactoryInput
): StagingShadowApprovalEvidence {
  const approvedAt = input.approvedAt ?? new Date().toISOString();
  const expiresAt =
    input.expiresAt ?? new Date(new Date(approvedAt).getTime() + 12 * 60 * 60 * 1000).toISOString();
  const environment = normalizeEnvironment(input.environment);
  const flows = Object.freeze([...new Set(input.allowedFlows)]);
  const requestedScope = input.requestedScope ?? 'CANARY_SHADOW';

  if (requestedScope !== 'CANARY_SHADOW') {
    throw new Error('Phase 5.7 approvals cannot authorize CANARY_LIVE or FULL_LIVE.');
  }
  if (environment === 'production' || environment === 'prod') {
    throw new Error('Phase 5.7 approvals cannot authorize production.');
  }
  if (flows.length === 0) {
    throw new Error('Phase 5.7 approval must list at least one validated flow.');
  }

  const parityEvidenceReference =
    input.parityEvidenceReference ?? 'docs/constitutional/Phase5_4_CIGateReport.md';
  const evidence = Object.freeze([
    {
      evidenceId: `staging-shadow-evidence-${hashString(`${input.runId}|${parityEvidenceReference}`)}`,
      description: 'Expanded parity and controlled trial evidence for Phase 5.7 staging CANARY_SHADOW.',
      createdAt: approvedAt,
      metadata: {
        runId: input.runId,
        environment,
        parityEvidenceReference,
        liveModesApproved: false,
        ...(input.evidence?.[0] ?? {}),
      },
    },
  ]);
  const manualApproval: ManualApprovalRecord = Object.freeze({
    approvalId: `staging-shadow-approval-${hashString(`${input.runId}|${environment}|${approvedAt}`)}`,
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
    maxSampleRate: manualApproval.maxSampleRate,
    maxExecutions: Math.max(0, Math.floor(input.maxExecutions)),
    reason: input.reason,
    evidence,
    parityEvidenceReference,
    productionSafetyAcknowledgement: input.productionSafetyAcknowledgement,
    status: 'APPROVED',
    manualApproval,
  });
}

export function validateStagingShadowApproval(
  approval: StagingShadowApprovalEvidence | undefined,
  input: StagingShadowApprovalValidationInput
): StagingShadowApprovalValidationResult {
  if (!approval) {
    return invalid('No staging shadow approval was supplied.', ['approval=missing']);
  }

  const requestedScope = input.requestedScope ?? 'CANARY_SHADOW';
  if (requestedScope !== 'CANARY_SHADOW' || approval.manualApproval.scope !== 'CANARY_SHADOW') {
    return invalid('Approval cannot authorize CANARY_LIVE or FULL_LIVE in Phase 5.7.', [
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
    return invalid('Approval environment does not match run environment.', [
      `requestedEnvironment=${environment}`,
      `approvalEnvironment=${approval.environment}`,
    ]);
  }

  if (approval.status !== 'APPROVED') {
    return invalid('Approval is not approved.', [`status=${approval.status}`]);
  }

  const now = new Date(input.now ?? new Date().toISOString()).getTime();
  const expiresAt = new Date(approval.expiresAt).getTime();
  if (!Number.isFinite(expiresAt) || expiresAt <= now) {
    return invalid('Approval is expired.', [`expiresAt=${approval.expiresAt}`]);
  }

  for (const flow of input.flows) {
    if (!approval.allowedFlows.includes(flow)) {
      return invalid('Approval does not include every requested flow.', [
        `missingFlow=${flow}`,
        `approvedFlows=${approval.allowedFlows.join(',')}`,
      ]);
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
    reason: 'Staging shadow approval is valid for CANARY_SHADOW only.',
    evidence: [
      `approvalId=${approval.approvalId}`,
      `environment=${approval.environment}`,
      `maxExecutions=${approval.maxExecutions}`,
      'liveModesApproved=false',
    ],
  };
}

function invalid(reason: string, evidence: readonly string[]): StagingShadowApprovalValidationResult {
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
