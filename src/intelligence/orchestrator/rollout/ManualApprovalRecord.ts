/**
 * @fileoverview Explicit manual approval model for controlled shadow rollout.
 */

import type { CanaryShadowFlowName } from './CanaryShadowTypes';

export type ManualApprovalStatus = 'PENDING' | 'APPROVED' | 'REVOKED' | 'EXPIRED';

export type ManualApprovalScope = 'CANARY_SHADOW' | 'CANARY_LIVE' | 'FULL_LIVE';

export interface ManualApprovalEvidence {
  evidenceId: string;
  description: string;
  createdAt: string;
  metadata: Readonly<Record<string, unknown>>;
}

export interface ManualApprovalRecord {
  approvalId: string;
  approvedBy: string;
  approvedAt: string;
  expiresAt: string;
  scope: ManualApprovalScope;
  flows: readonly CanaryShadowFlowName[];
  maxSampleRate: number;
  reason: string;
  evidence: readonly ManualApprovalEvidence[];
  status: ManualApprovalStatus;
}

export interface ManualApprovalValidationInput {
  flow: string;
  sampleRate: number;
  requestedScope?: ManualApprovalScope;
  now?: string;
}

export interface ManualApprovalValidationResult {
  valid: boolean;
  reason: string;
  evidence: readonly string[];
}

export function validateManualApproval(
  record: ManualApprovalRecord | undefined,
  input: ManualApprovalValidationInput
): ManualApprovalValidationResult {
  const requestedScope = input.requestedScope ?? 'CANARY_SHADOW';

  if (!record) {
    return invalid('No manual approval record was supplied.', ['approvalRecord=missing']);
  }

  if (requestedScope !== 'CANARY_SHADOW') {
    return invalid('Live rollout approvals are not accepted in this phase.', [
      `requestedScope=${requestedScope}`,
    ]);
  }

  if (record.scope !== 'CANARY_SHADOW') {
    return invalid('Manual approval scope is not CANARY_SHADOW.', [`scope=${record.scope}`]);
  }

  if (record.status !== 'APPROVED') {
    return invalid('Manual approval is not approved.', [`status=${record.status}`]);
  }

  const now = new Date(input.now ?? new Date().toISOString()).getTime();
  const expiresAt = new Date(record.expiresAt).getTime();
  if (!Number.isFinite(expiresAt) || expiresAt <= now) {
    return invalid('Manual approval is expired.', [`expiresAt=${record.expiresAt}`]);
  }

  if (!record.flows.includes(input.flow as CanaryShadowFlowName)) {
    return invalid('Manual approval does not include the requested flow.', [
      `flow=${input.flow}`,
      `approvedFlows=${record.flows.join(',')}`,
    ]);
  }

  if (input.sampleRate > record.maxSampleRate) {
    return invalid('Requested sample rate exceeds manual approval.', [
      `sampleRate=${input.sampleRate}`,
      `maxSampleRate=${record.maxSampleRate}`,
    ]);
  }

  return {
    valid: true,
    reason: 'Manual approval is valid for CANARY_SHADOW.',
    evidence: [
      `approvalId=${record.approvalId}`,
      `approvedBy=${record.approvedBy}`,
      `maxSampleRate=${record.maxSampleRate}`,
    ],
  };
}

export function isManualApprovalValid(
  record: ManualApprovalRecord | undefined,
  input: ManualApprovalValidationInput
): boolean {
  return validateManualApproval(record, input).valid;
}

function invalid(reason: string, evidence: readonly string[]): ManualApprovalValidationResult {
  return {
    valid: false,
    reason,
    evidence,
  };
}
