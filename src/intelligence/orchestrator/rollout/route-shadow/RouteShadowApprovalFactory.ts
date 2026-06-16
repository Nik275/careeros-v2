/**
 * @fileoverview Manual approval factory for Phase 6.0 route-shadow endpoint pilot.
 */

import type { ManualApprovalScope, ManualApprovalRecord } from '../ManualApprovalRecord';
import type { RouteShadowApproval, RouteShadowFlow } from './RouteShadowTypes';
import { normalizeRouteShadowEnvironment } from './RouteShadowConfig';

export interface RouteShadowApprovalInput {
  approvalId?: string;
  approvedBy: string;
  approvedAt?: string;
  expiresAt?: string;
  environment: string;
  allowedFlows: readonly RouteShadowFlow[];
  allowedRoutes: readonly string[];
  maxExecutions: number;
  reason: string;
  parityEvidenceReference?: string;
  appRehearsalEvidenceReference?: string;
  productionSafetyAcknowledgement: string;
  requestedScope?: ManualApprovalScope;
  allowOutputReplacement?: boolean;
  allowRawPayloadCapture?: boolean;
  allowRealStudentData?: boolean;
}

export function createRouteShadowApproval(input: RouteShadowApprovalInput): RouteShadowApproval {
  const approvedAt = input.approvedAt ?? new Date().toISOString();
  const expiresAt =
    input.expiresAt ?? new Date(new Date(approvedAt).getTime() + 12 * 60 * 60 * 1000).toISOString();
  const environment = normalizeRouteShadowEnvironment(input.environment);
  const requestedScope = input.requestedScope ?? 'CANARY_SHADOW';
  const allowedFlows = Object.freeze([...new Set(input.allowedFlows)]);
  const allowedRoutes = Object.freeze([...new Set(input.allowedRoutes)]);

  if (requestedScope !== 'CANARY_SHADOW') throw new Error('Phase 6.0 approval cannot authorize CANARY_LIVE or FULL_LIVE.');
  if (environment === 'production' || environment === 'prod') throw new Error('Phase 6.0 approval cannot authorize production.');
  if (input.allowOutputReplacement) throw new Error('Phase 6.0 approval cannot authorize output replacement.');
  if (input.allowRawPayloadCapture) throw new Error('Phase 6.0 approval cannot authorize raw payload capture.');
  if (input.allowRealStudentData) throw new Error('Phase 6.0 approval cannot authorize real student data.');
  if (allowedFlows.length === 0) throw new Error('Phase 6.0 approval must include at least one flow.');
  if (allowedRoutes.length === 0) throw new Error('Phase 6.0 approval must include at least one route.');

  const parityEvidenceReference = input.parityEvidenceReference ?? 'docs/constitutional/Phase5_4_CIGateReport.md';
  const appRehearsalEvidenceReference = input.appRehearsalEvidenceReference ?? 'docs/constitutional/Phase5_9_FinalVerdict.md';
  const approvalId = input.approvalId ?? `route-shadow-approval-${hashString(`${environment}|${approvedAt}|${allowedRoutes.join(',')}`)}`;
  const manualApproval: ManualApprovalRecord = Object.freeze({
    approvalId,
    approvedBy: input.approvedBy,
    approvedAt,
    expiresAt,
    scope: 'CANARY_SHADOW',
    flows: allowedFlows,
    maxSampleRate: 1,
    reason: input.reason,
    evidence: Object.freeze([
      Object.freeze({
        evidenceId: `route-shadow-evidence-${hashString(`${approvalId}|${appRehearsalEvidenceReference}`)}`,
        description: 'Phase 6.0 route-shadow approval evidence.',
        createdAt: approvedAt,
        metadata: {
          parityEvidenceReference,
          appRehearsalEvidenceReference,
          liveModesApproved: false,
          outputReplacementApproved: false,
          rawPayloadCaptureApproved: false,
          realStudentDataApproved: false,
        },
      }),
    ]),
    status: 'APPROVED',
  });

  return Object.freeze({
    approvalId,
    approvedBy: input.approvedBy,
    approvedAt,
    expiresAt,
    environment,
    allowedFlows,
    allowedRoutes,
    maxExecutions: Math.max(0, Math.floor(input.maxExecutions)),
    reason: input.reason,
    parityEvidenceReference,
    appRehearsalEvidenceReference,
    productionSafetyAcknowledgement: input.productionSafetyAcknowledgement,
    status: 'APPROVED',
    manualApproval,
  });
}

export function validateRouteShadowApproval(
  approval: RouteShadowApproval | undefined,
  input: {
    environment: string;
    flow: RouteShadowFlow;
    routePath: string;
    now?: string;
  }
): { valid: boolean; reason: string; evidence: readonly string[] } {
  if (!approval) return invalid('No route shadow approval was supplied.', ['approval=missing']);
  const environment = normalizeRouteShadowEnvironment(input.environment);
  if (environment === 'production' || environment === 'prod' || approval.environment === 'production' || approval.environment === 'prod') {
    return invalid('Route shadow approval cannot authorize production.', [`environment=${environment}`, `approvalEnvironment=${approval.environment}`]);
  }
  if (approval.environment !== environment) {
    return invalid('Route shadow approval environment does not match request environment.', [`environment=${environment}`, `approvalEnvironment=${approval.environment}`]);
  }
  if (approval.status !== 'APPROVED' || approval.manualApproval.status !== 'APPROVED') {
    return invalid('Route shadow approval is not approved.', [`status=${approval.status}`]);
  }
  if (approval.manualApproval.scope !== 'CANARY_SHADOW') {
    return invalid('Route shadow approval scope is not CANARY_SHADOW.', [`scope=${approval.manualApproval.scope}`]);
  }
  const now = new Date(input.now ?? new Date().toISOString()).getTime();
  const expiresAt = new Date(approval.expiresAt).getTime();
  if (!Number.isFinite(expiresAt) || expiresAt <= now) return invalid('Route shadow approval is expired.', [`expiresAt=${approval.expiresAt}`]);
  if (!approval.allowedFlows.includes(input.flow)) return invalid('Route shadow approval does not include requested flow.', [`flow=${input.flow}`]);
  if (!approval.allowedRoutes.includes(input.routePath)) return invalid('Route shadow approval does not include requested route.', [`routePath=${input.routePath}`]);
  if (!approval.productionSafetyAcknowledgement.trim()) return invalid('Production safety acknowledgement is required.', ['productionSafetyAcknowledgement=missing']);
  return {
    valid: true,
    reason: 'Route shadow approval is valid for CANARY_SHADOW only.',
    evidence: [`approvalId=${approval.approvalId}`, `environment=${approval.environment}`, 'liveModesApproved=false'],
  };
}

function invalid(reason: string, evidence: readonly string[]) {
  return { valid: false, reason, evidence };
}

function hashString(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}
