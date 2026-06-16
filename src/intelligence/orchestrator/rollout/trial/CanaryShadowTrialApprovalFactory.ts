/**
 * @fileoverview Test-only manual approval factory for controlled shadow trials.
 */

import type { CanaryShadowFlowName } from '../CanaryShadowTypes';
import type { ManualApprovalRecord } from '../ManualApprovalRecord';
import type { CanaryShadowTrialApprovalEvidence } from './CanaryShadowTrialTypes';

export interface CanaryShadowTrialApprovalFactoryInput {
  trialId: string;
  approvedBy: string;
  flows: readonly CanaryShadowFlowName[];
  maxSampleRate: number;
  reason: string;
  parityEvidenceReference?: string;
  approvedAt?: string;
  expiresAt?: string;
}

export function createCanaryShadowTrialApproval(
  input: CanaryShadowTrialApprovalFactoryInput
): ManualApprovalRecord {
  const approvedAt = input.approvedAt ?? new Date().toISOString();
  const expiresAt =
    input.expiresAt ??
    new Date(new Date(approvedAt).getTime() + 24 * 60 * 60 * 1000).toISOString();
  const evidence = createCanaryShadowTrialApprovalEvidence({
    trialId: input.trialId,
    parityEvidenceReference:
      input.parityEvidenceReference ?? 'docs/constitutional/Phase5_4_CIGateReport.md',
    createdAt: approvedAt,
  });

  return Object.freeze({
    approvalId: `canary-shadow-trial-approval-${hashString(`${input.trialId}|${approvedAt}`)}`,
    approvedBy: input.approvedBy,
    approvedAt,
    expiresAt,
    scope: 'CANARY_SHADOW',
    flows: Object.freeze([...input.flows]),
    maxSampleRate: clamp(input.maxSampleRate, 0, 1),
    reason: input.reason,
    evidence: Object.freeze([
      {
        evidenceId: evidence.evidenceId,
        description: evidence.description,
        createdAt: evidence.createdAt,
        metadata: {
          parityEvidenceReference: evidence.parityEvidenceReference,
          trialId: input.trialId,
        },
      },
    ]),
    status: 'APPROVED',
  });
}

export function createCanaryShadowTrialApprovalEvidence(input: {
  trialId: string;
  parityEvidenceReference: string;
  createdAt?: string;
}): CanaryShadowTrialApprovalEvidence {
  const createdAt = input.createdAt ?? new Date().toISOString();
  return Object.freeze({
    evidenceId: `canary-shadow-trial-evidence-${hashString(`${input.trialId}|${input.parityEvidenceReference}`)}`,
    description: 'Expanded parity CI evidence for controlled CANARY_SHADOW trial.',
    parityEvidenceReference: input.parityEvidenceReference,
    createdAt,
    metadata: {
      trialId: input.trialId,
      liveModesApproved: false,
    },
  });
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
