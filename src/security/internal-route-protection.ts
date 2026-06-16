export const INTERNAL_CONSTITUTIONAL_SHADOW_ROUTE_PREFIX = '/api/internal/constitutional-shadow';
export const INTERNAL_CONSTITUTIONAL_SHADOW_MIDDLEWARE_MATCHER = '/api/internal/constitutional-shadow/:path*';

export function isInternalConstitutionalShadowRoutePath(pathname: string): boolean {
  return (
    pathname === INTERNAL_CONSTITUTIONAL_SHADOW_ROUTE_PREFIX ||
    pathname.startsWith(`${INTERNAL_CONSTITUTIONAL_SHADOW_ROUTE_PREFIX}/`)
  );
}
