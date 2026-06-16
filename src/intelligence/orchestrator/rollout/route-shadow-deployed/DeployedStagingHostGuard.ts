/**
 * @fileoverview Host safety guard for Phase 6.3 deployed staging shadow.
 */

import type { DeployedRouteShadowConfig, DeployedStagingHostDecision } from './DeployedRouteShadowTypes';

export class DeployedStagingHostGuard {
  evaluate(config: DeployedRouteShadowConfig): DeployedStagingHostDecision {
    const baseUrl = config.baseUrl.trim();
    if (!baseUrl) return decision(false, 'DEPLOYED_STAGING_URL_MISSING', '', undefined, undefined, false, false, false, 'Deployed staging baseUrl is missing.');

    let url: URL;
    try {
      url = new URL(baseUrl);
    } catch {
      return decision(false, 'DEPLOYED_STAGING_BLOCKED_BY_CONFIG', '<invalid-url>', undefined, undefined, false, false, false, 'Deployed staging baseUrl is invalid.');
    }

    const protocol = url.protocol;
    const host = url.hostname.toLowerCase();
    const baseUrlSummary = `${protocol}//${host}`;
    const localHost = host === 'localhost' || host === '127.0.0.1';
    const productionLooking = isProductionLookingHost(host);
    const hostAllowlisted = config.allowedHosts.includes(host);

    if (!config.allowedProtocols.includes(protocol)) {
      return decision(false, 'DEPLOYED_STAGING_BLOCKED_BY_CONFIG', baseUrlSummary, protocol, host, hostAllowlisted, productionLooking, localHost, 'Deployed staging protocol is not allowed.');
    }
    if (protocol !== 'http:' && protocol !== 'https:') {
      return decision(false, 'DEPLOYED_STAGING_BLOCKED_BY_CONFIG', baseUrlSummary, protocol, host, hostAllowlisted, productionLooking, localHost, 'Non-HTTP protocol is blocked.');
    }
    if (config.requireHttpsForRemote && !localHost && protocol !== 'https:') {
      return decision(false, 'DEPLOYED_STAGING_BLOCKED_BY_CONFIG', baseUrlSummary, protocol, host, hostAllowlisted, productionLooking, localHost, 'Remote deployed staging host must use HTTPS.');
    }
    if (localHost) {
      return decision(false, 'DEPLOYED_STAGING_BLOCKED_BY_CONFIG', baseUrlSummary, protocol, host, hostAllowlisted, productionLooking, localHost, 'Localhost is local proof, not deployed staging proof.');
    }
    if (productionLooking) {
      return decision(false, 'DEPLOYED_STAGING_UNSAFE_HOST', baseUrlSummary, protocol, host, hostAllowlisted, productionLooking, localHost, 'Production-looking host is blocked.');
    }
    if (!hostAllowlisted) {
      return decision(false, 'DEPLOYED_STAGING_UNSAFE_HOST', baseUrlSummary, protocol, host, hostAllowlisted, productionLooking, localHost, 'Deployed staging host is not explicitly allowlisted.');
    }
    if (!looksLikeStagingHost(host)) {
      return decision(false, 'DEPLOYED_STAGING_UNSAFE_HOST', baseUrlSummary, protocol, host, hostAllowlisted, productionLooking, localHost, 'Allowlisted host does not look like staging or preview.');
    }

    return decision(true, 'DEPLOYED_STAGING_SUPPORTED', baseUrlSummary, protocol, host, hostAllowlisted, productionLooking, localHost, 'Deployed staging host passed safety guard.');
  }
}

export function isProductionLookingHost(host: string): boolean {
  const normalized = host.toLowerCase();
  if (normalized.endsWith('.vercel.app') && looksLikeStagingHost(normalized)) {
    return /(^|[.-])(production|prod|live|www)([.-]|$)/i.test(normalized);
  }
  if (normalized === 'careeros.com' || normalized.endsWith('.careeros.com')) return !normalized.includes('staging') && !normalized.includes('preview');
  return /(^|[.-])(production|prod|live|www|app)([.-]|$)/i.test(normalized);
}

export function looksLikeStagingHost(host: string): boolean {
  const normalized = host.toLowerCase();
  return normalized.startsWith('staging.') || normalized.includes('.staging.') || normalized.startsWith('preview.') || normalized.includes('.preview.') || normalized.endsWith('.vercel.app');
}

function decision(
  allowed: boolean,
  status: DeployedStagingHostDecision['status'],
  baseUrlSummary: string,
  protocol: string | undefined,
  host: string | undefined,
  hostAllowlisted: boolean,
  productionLooking: boolean,
  localHost: boolean,
  reason: string
): DeployedStagingHostDecision {
  return Object.freeze({
    allowed,
    status,
    baseUrlSummary,
    protocol,
    host,
    hostAllowlisted,
    productionLooking,
    localHost,
    reason,
    evidence: Object.freeze([
      `baseUrlSummary=${baseUrlSummary || '<missing>'}`,
      `host=${host ?? '<missing>'}`,
      `hostAllowlisted=${hostAllowlisted}`,
      `productionLooking=${productionLooking}`,
      `localHost=${localHost}`,
    ]),
  });
}
