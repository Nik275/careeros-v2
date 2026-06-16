export const ROUTE_SHADOW_INTERNAL_ACCESS_CLAIM_PATH = 'sessionClaims.metadata.internalAccess';

export function hasRouteShadowInternalAccessClaim(sessionClaims: unknown): boolean {
  if (!isRecord(sessionClaims)) return false;
  const metadata = sessionClaims.metadata;
  return isRecord(metadata) && metadata.internalAccess === true;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
