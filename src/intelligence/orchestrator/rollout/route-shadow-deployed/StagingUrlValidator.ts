/**
 * @fileoverview Phase 6.4 deployed staging URL validation.
 */

import { isProductionLookingHost, looksLikeStagingHost } from './DeployedStagingHostGuard';

export type StagingUrlValidationStatus =
  | 'VALID_STAGING_URL'
  | 'MISSING_URL'
  | 'INVALID_URL'
  | 'UNSAFE_PRODUCTION_HOST'
  | 'UNSAFE_UNKNOWN_HOST'
  | 'HOST_NOT_ALLOWLISTED'
  | 'UNSUPPORTED_PROTOCOL'
  | 'LOCAL_URL_NOT_DEPLOYED';

export interface StagingUrlValidationInput {
  baseUrl?: string;
  allowedHosts?: readonly string[];
  allowedProtocols?: readonly string[];
  requireHttpsForRemote?: boolean;
}

export interface StagingUrlValidationDecision {
  valid: boolean;
  status: StagingUrlValidationStatus;
  baseUrlSummary: string;
  protocol?: string;
  host?: string;
  hostAllowlisted: boolean;
  productionLooking: boolean;
  localOnly: boolean;
  stagingOrPreviewLooking: boolean;
  reason: string;
  evidence: readonly string[];
}

export function validateStagingUrl(input: StagingUrlValidationInput): StagingUrlValidationDecision {
  const baseUrl = (input.baseUrl ?? '').trim();
  const allowedProtocols = input.allowedProtocols ?? ['https:', 'http:'];
  const allowedHosts = normalizeHosts(input.allowedHosts ?? []);
  const requireHttpsForRemote = input.requireHttpsForRemote ?? true;

  if (!baseUrl) {
    return decision(false, 'MISSING_URL', '', undefined, undefined, false, false, false, false, 'Staging shadow base URL is missing.');
  }

  let url: URL;
  try {
    url = new URL(baseUrl);
  } catch {
    return decision(false, 'INVALID_URL', '<invalid-url>', undefined, undefined, false, false, false, false, 'Staging shadow base URL is invalid.');
  }

  const protocol = url.protocol;
  const host = url.hostname.toLowerCase();
  const baseUrlSummary = `${protocol}//${host}`;
  const hostAllowlisted = allowedHosts.includes(host);
  const localOnly = host === 'localhost' || host === '127.0.0.1';
  const productionLooking = isProductionLookingHost(host);
  const stagingOrPreviewLooking = looksLikeStagingHost(host);

  if (!allowedProtocols.includes(protocol) || (protocol !== 'https:' && protocol !== 'http:')) {
    return decision(false, 'UNSUPPORTED_PROTOCOL', baseUrlSummary, protocol, host, hostAllowlisted, productionLooking, localOnly, stagingOrPreviewLooking, 'Only HTTP(S) protocols are supported for staging shadow smoke tests.');
  }

  if (requireHttpsForRemote && !localOnly && protocol !== 'https:') {
    return decision(false, 'UNSUPPORTED_PROTOCOL', baseUrlSummary, protocol, host, hostAllowlisted, productionLooking, localOnly, stagingOrPreviewLooking, 'Remote deployed staging URLs must use HTTPS.');
  }

  if (localOnly) {
    return decision(false, 'LOCAL_URL_NOT_DEPLOYED', baseUrlSummary, protocol, host, hostAllowlisted, productionLooking, localOnly, stagingOrPreviewLooking, 'Local URLs are valid only for local proof, not deployed staging proof.');
  }

  if (productionLooking) {
    return decision(false, 'UNSAFE_PRODUCTION_HOST', baseUrlSummary, protocol, host, hostAllowlisted, productionLooking, localOnly, stagingOrPreviewLooking, 'Production-looking host is blocked.');
  }

  if (!hostAllowlisted) {
    return decision(false, 'HOST_NOT_ALLOWLISTED', baseUrlSummary, protocol, host, hostAllowlisted, productionLooking, localOnly, stagingOrPreviewLooking, 'Staging shadow host is not explicitly allowlisted.');
  }

  if (!stagingOrPreviewLooking) {
    return decision(false, 'UNSAFE_UNKNOWN_HOST', baseUrlSummary, protocol, host, hostAllowlisted, productionLooking, localOnly, stagingOrPreviewLooking, 'Allowlisted host does not look like staging or preview.');
  }

  return decision(true, 'VALID_STAGING_URL', baseUrlSummary, protocol, host, hostAllowlisted, productionLooking, localOnly, stagingOrPreviewLooking, 'Staging shadow URL is valid and explicitly allowlisted.');
}

export function normalizeHosts(hosts: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(hosts.map((host) => host.trim().toLowerCase()).filter(Boolean))]);
}

function decision(
  valid: boolean,
  status: StagingUrlValidationStatus,
  baseUrlSummary: string,
  protocol: string | undefined,
  host: string | undefined,
  hostAllowlisted: boolean,
  productionLooking: boolean,
  localOnly: boolean,
  stagingOrPreviewLooking: boolean,
  reason: string
): StagingUrlValidationDecision {
  return Object.freeze({
    valid,
    status,
    baseUrlSummary,
    protocol,
    host,
    hostAllowlisted,
    productionLooking,
    localOnly,
    stagingOrPreviewLooking,
    reason,
    evidence: Object.freeze([
      `baseUrlSummary=${baseUrlSummary || '<missing>'}`,
      `host=${host ?? '<missing>'}`,
      `hostAllowlisted=${hostAllowlisted}`,
      `productionLooking=${productionLooking}`,
      `localOnly=${localOnly}`,
      `stagingOrPreviewLooking=${stagingOrPreviewLooking}`,
    ]),
  });
}
