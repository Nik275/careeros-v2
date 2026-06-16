/**
 * @fileoverview Phase 6.4 deployed staging approval builder.
 */

import { createDeployedRouteShadowApproval } from './DeployedRouteShadowApprovalFactory';
import {
  ASSESSMENT_DEPLOYED_ROUTE_SHADOW_PATH,
  CAREER_FIT_DEPLOYED_ROUTE_SHADOW_PATH,
} from './DeployedRouteShadowPayloadFactory';
import type { DeployedStagingEnvConfigResult } from './DeployedStagingEnvConfig';
import type { DeployedRouteShadowApproval } from './DeployedRouteShadowTypes';

export interface DeployedStagingApprovalBuildResult {
  valid: boolean;
  approval?: DeployedRouteShadowApproval;
  status:
    | 'APPROVAL_READY'
    | 'APPROVAL_MISSING'
    | 'APPROVAL_EXPIRED'
    | 'APPROVAL_HOST_MISMATCH'
    | 'APPROVAL_ENVIRONMENT_BLOCKED'
    | 'APPROVAL_CONFIG_UNSAFE';
  reason: string;
  evidence: readonly string[];
}

export function buildDeployedStagingApproval(
  envConfig: DeployedStagingEnvConfigResult,
  options: { now?: string; defaultTtlMs?: number } = {}
): DeployedStagingApprovalBuildResult {
  const now = new Date(options.now ?? new Date().toISOString());
  const defaultTtlMs = options.defaultTtlMs ?? 60 * 60 * 1000;
  const approvalInput = envConfig.approval;
  const host = envConfig.validation.host;

  if (!approvalInput) {
    return invalid('APPROVAL_MISSING', 'Explicit staging shadow approval fields are missing.', ['approval=missing']);
  }
  if (!envConfig.validation.valid || !host) {
    return invalid('APPROVAL_CONFIG_UNSAFE', 'Approval cannot be built for unsafe staging URL config.', [`urlStatus=${envConfig.validation.status}`]);
  }
  if (envConfig.config.environment === 'production' || envConfig.config.environment === 'prod' || envConfig.config.environment === 'live' || envConfig.config.environment === 'unknown') {
    return invalid('APPROVAL_ENVIRONMENT_BLOCKED', 'Approval cannot authorize production, live, prod, or unknown environments.', [`environment=${envConfig.config.environment}`]);
  }
  if (!envConfig.config.allowedHosts.includes(host)) {
    return invalid('APPROVAL_HOST_MISMATCH', 'Approval host does not match exact allowlisted staging host.', [`host=${host}`]);
  }
  if (envConfig.summary.allowLiveRouting) {
    return invalid('APPROVAL_CONFIG_UNSAFE', 'Approval cannot authorize live routing.', ['allowLiveRouting=true']);
  }
  if (envConfig.summary.allowOutputReplacement) {
    return invalid('APPROVAL_CONFIG_UNSAFE', 'Approval cannot authorize output replacement.', ['allowOutputReplacement=true']);
  }
  if (envConfig.summary.captureRawPayloads) {
    return invalid('APPROVAL_CONFIG_UNSAFE', 'Approval cannot authorize raw payload capture.', ['captureRawPayloads=true']);
  }

  const expiresAt = approvalInput.expiresAt || new Date(now.getTime() + defaultTtlMs).toISOString();
  const expiryTime = new Date(expiresAt).getTime();
  if (!Number.isFinite(expiryTime) || expiryTime <= now.getTime()) {
    return invalid('APPROVAL_EXPIRED', 'Explicit staging shadow approval is expired.', [`expiresAt=${expiresAt}`]);
  }

  try {
    const approval = createDeployedRouteShadowApproval({
      approvalId: approvalInput.approvalId,
      approvedBy: approvalInput.approvedBy,
      approvedAt: now.toISOString(),
      expiresAt,
      environment: envConfig.config.environment,
      baseUrl: envConfig.config.baseUrl,
      allowedHosts: [host],
      allowedRoutes: [ASSESSMENT_DEPLOYED_ROUTE_SHADOW_PATH, CAREER_FIT_DEPLOYED_ROUTE_SHADOW_PATH],
      allowedFlows: ['assessment', 'career-fit'],
      maxRequests: envConfig.summary.maxRequests,
      reason: approvalInput.reason,
      productionSafetyAcknowledgement: 'Production output remains authoritative; Phase 6.4 is shadow-only.',
      requestedScope: 'CANARY_SHADOW',
      allowOutputReplacement: false,
      allowRawPayloadCapture: false,
      allowRealStudentData: false,
      allowProductionHost: false,
      allowUnknownHost: false,
    });

    return Object.freeze({
      valid: true,
      approval,
      status: 'APPROVAL_READY',
      reason: 'Staging shadow approval is valid and bound to the exact deployed staging URL.',
      evidence: Object.freeze([
        `approvalId=${approval.approvalId}`,
        `host=${host}`,
        `expiresAt=${approval.expiresAt}`,
        `routes=${approval.allowedRoutes.join(',')}`,
      ]),
    });
  } catch (error) {
    return invalid('APPROVAL_CONFIG_UNSAFE', error instanceof Error ? error.message : 'Approval builder failed safely.', [`host=${host}`]);
  }
}

function invalid(status: DeployedStagingApprovalBuildResult['status'], reason: string, evidence: readonly string[]): DeployedStagingApprovalBuildResult {
  return Object.freeze({
    valid: false,
    status,
    reason,
    evidence: Object.freeze([...evidence]),
  });
}
