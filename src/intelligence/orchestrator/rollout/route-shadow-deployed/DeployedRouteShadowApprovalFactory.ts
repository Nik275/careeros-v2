/**
 * @fileoverview Manual approval factory for Phase 6.3 deployed staging route shadow.
 */

import { createRouteShadowApproval } from '../route-shadow/RouteShadowApprovalFactory';
import type { ManualApprovalScope } from '../ManualApprovalRecord';
import type { RouteShadowFlow } from '../route-shadow/RouteShadowTypes';
import { DeployedStagingHostGuard } from './DeployedStagingHostGuard';
import { createDeployedRouteShadowConfig } from './DeployedRouteShadowConfig';
import type { DeployedRouteShadowApproval } from './DeployedRouteShadowTypes';

export interface DeployedRouteShadowApprovalInput {
  approvalId?: string;
  approvedBy: string;
  approvedAt?: string;
  expiresAt?: string;
  environment: string;
  baseUrl: string;
  allowedHosts: readonly string[];
  allowedRoutes: readonly string[];
  allowedFlows: readonly RouteShadowFlow[];
  maxRequests: number;
  reason: string;
  localHttpEvidenceReference?: string;
  routeSimulationEvidenceReference?: string;
  parityEvidenceReference?: string;
  productionSafetyAcknowledgement: string;
  requestedScope?: ManualApprovalScope;
  allowOutputReplacement?: boolean;
  allowRawPayloadCapture?: boolean;
  allowRealStudentData?: boolean;
  allowProductionHost?: boolean;
  allowUnknownHost?: boolean;
}

export function createDeployedRouteShadowApproval(input: DeployedRouteShadowApprovalInput): DeployedRouteShadowApproval {
  const config = createDeployedRouteShadowConfig({
    enabled: true,
    environment: input.environment,
    baseUrl: input.baseUrl,
    allowedHosts: input.allowedHosts,
    allowedRoutes: input.allowedRoutes,
    allowedFlows: input.allowedFlows,
  });
  const hostDecision = new DeployedStagingHostGuard().evaluate(config);
  if (!hostDecision.allowed) throw new Error(`Phase 6.3 approval cannot authorize unsafe deployed host: ${hostDecision.reason}`);
  if (input.allowProductionHost) throw new Error('Phase 6.3 approval cannot authorize production hosts.');
  if (input.allowUnknownHost) throw new Error('Phase 6.3 approval cannot authorize unknown hosts.');

  const baseApproval = createRouteShadowApproval({
    approvalId: input.approvalId,
    approvedBy: input.approvedBy,
    approvedAt: input.approvedAt,
    expiresAt: input.expiresAt,
    environment: input.environment,
    allowedFlows: input.allowedFlows,
    allowedRoutes: input.allowedRoutes,
    maxExecutions: input.maxRequests,
    reason: input.reason,
    parityEvidenceReference: input.parityEvidenceReference,
    appRehearsalEvidenceReference: input.routeSimulationEvidenceReference,
    productionSafetyAcknowledgement: input.productionSafetyAcknowledgement,
    requestedScope: input.requestedScope,
    allowOutputReplacement: input.allowOutputReplacement,
    allowRawPayloadCapture: input.allowRawPayloadCapture,
    allowRealStudentData: input.allowRealStudentData,
  });

  return Object.freeze({
    ...baseApproval,
    baseUrl: config.baseUrl,
    allowedHosts: config.allowedHosts,
    allowedRoutes: config.allowedRoutes,
    allowedFlows: config.allowedFlows,
    maxRequests: Math.max(0, Math.floor(input.maxRequests)),
    localHttpEvidenceReference: input.localHttpEvidenceReference ?? 'docs/constitutional/Phase6_2_FinalVerdict.md',
    routeSimulationEvidenceReference: input.routeSimulationEvidenceReference ?? 'docs/constitutional/Phase6_1_FinalVerdict.md',
    parityEvidenceReference: input.parityEvidenceReference ?? baseApproval.parityEvidenceReference,
  });
}

export function validateDeployedRouteShadowApproval(
  approval: DeployedRouteShadowApproval | undefined,
  input: {
    environment: string;
    baseUrl: string;
    host?: string;
    flow: RouteShadowFlow;
    routePath: string;
    now?: string;
  }
): { valid: boolean; reason: string; evidence: readonly string[] } {
  if (!approval) return invalid('No deployed staging approval was supplied.', ['approval=missing']);
  const now = new Date(input.now ?? new Date().toISOString()).getTime();
  const expiresAt = new Date(approval.expiresAt).getTime();
  if (!Number.isFinite(expiresAt) || expiresAt <= now) return invalid('Deployed staging approval is expired.', [`expiresAt=${approval.expiresAt}`]);
  if (approval.environment !== input.environment) return invalid('Deployed staging approval environment does not match request.', [`environment=${input.environment}`]);
  if (approval.baseUrl !== input.baseUrl) return invalid('Deployed staging approval baseUrl does not match request.', ['baseUrl=mismatch']);
  if (input.host && !approval.allowedHosts.includes(input.host)) return invalid('Deployed staging approval does not include requested host.', [`host=${input.host}`]);
  if (!approval.allowedFlows.includes(input.flow)) return invalid('Deployed staging approval does not include requested flow.', [`flow=${input.flow}`]);
  if (!approval.allowedRoutes.includes(input.routePath)) return invalid('Deployed staging approval does not include requested route.', [`routePath=${input.routePath}`]);
  if (approval.manualApproval.scope !== 'CANARY_SHADOW') return invalid('Deployed staging approval scope is not CANARY_SHADOW.', [`scope=${approval.manualApproval.scope}`]);
  return { valid: true, reason: 'Deployed staging approval is valid for shadow-only execution.', evidence: [`approvalId=${approval.approvalId}`] };
}

function invalid(reason: string, evidence: readonly string[]) {
  return { valid: false, reason, evidence };
}

