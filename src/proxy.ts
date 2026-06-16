import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { hasRouteShadowInternalAccessClaim } from './security/internal-access-claims';
import {
  isInternalConstitutionalShadowRoutePath,
  isInternalStagingSmokeRoutePath,
} from './security/internal-route-protection';
import { isStagingSmokeHarnessHost } from './security/staging-smoke-harness';

const constitutionalShadowProxy = clerkMiddleware(async (auth, request) => {
  const isConstitutionalShadowRoute = isInternalConstitutionalShadowRoutePath(request.nextUrl.pathname);
  const isStagingSmokeRoute = isInternalStagingSmokeRoutePath(request.nextUrl.pathname);

  if (!isConstitutionalShadowRoute && !isStagingSmokeRoute) {
    return NextResponse.next();
  }

  if (isStagingSmokeRoute && !isStagingSmokeHarnessHost(request.nextUrl.host)) {
    return new NextResponse(null, { status: 404 });
  }

  const authResult = await auth();

  if (!authResult.userId) {
    return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  }

  if (!hasRouteShadowInternalAccessClaim(authResult.sessionClaims)) {
    return NextResponse.json({ error: 'Internal access is required.' }, { status: 403 });
  }

  return NextResponse.next();
});

export const proxy = constitutionalShadowProxy;
export default constitutionalShadowProxy;

export const config = {
  matcher: ['/api/internal/constitutional-shadow/:path*', '/internal/staging-smoke', '/internal/staging-smoke/:path*'],
};
