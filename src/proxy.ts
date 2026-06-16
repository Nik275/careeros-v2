import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { hasRouteShadowInternalAccessClaim } from './security/internal-access-claims';
import { isInternalConstitutionalShadowRoutePath } from './security/internal-route-protection';

const constitutionalShadowProxy = clerkMiddleware(async (auth, request) => {
  if (!isInternalConstitutionalShadowRoutePath(request.nextUrl.pathname)) {
    return NextResponse.next();
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
  matcher: ['/api/internal/constitutional-shadow/:path*'],
};
