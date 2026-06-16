export const INTERNAL_CONSTITUTIONAL_SHADOW_ROUTE_PREFIX = '/api/internal/constitutional-shadow';
export const INTERNAL_CONSTITUTIONAL_SHADOW_MIDDLEWARE_MATCHER = '/api/internal/constitutional-shadow/:path*';
export const INTERNAL_STAGING_SMOKE_ROUTE_PREFIX = '/internal/staging-smoke';
export const INTERNAL_STAGING_SMOKE_MIDDLEWARE_MATCHER = '/internal/staging-smoke/:path*';

export function isInternalConstitutionalShadowRoutePath(pathname: string): boolean {
  return (
    pathname === INTERNAL_CONSTITUTIONAL_SHADOW_ROUTE_PREFIX ||
    pathname.startsWith(`${INTERNAL_CONSTITUTIONAL_SHADOW_ROUTE_PREFIX}/`)
  );
}

export function isInternalStagingSmokeRoutePath(pathname: string): boolean {
  return pathname === INTERNAL_STAGING_SMOKE_ROUTE_PREFIX || pathname.startsWith(`${INTERNAL_STAGING_SMOKE_ROUTE_PREFIX}/`);
}
