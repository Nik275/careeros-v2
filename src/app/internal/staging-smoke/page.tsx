import { auth } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { StagingSmokeHarnessClient } from './StagingSmokeHarnessClient';
import { hasRouteShadowInternalAccessClaim } from '../../../security/internal-access-claims';
import { isStagingSmokeHarnessHost } from '../../../security/staging-smoke-harness';

export const dynamic = 'force-dynamic';

export default async function InternalStagingSmokePage() {
  const headerStore = await headers();
  const host = headerStore.get('x-forwarded-host') ?? headerStore.get('host');
  if (!isStagingSmokeHarnessHost(host)) notFound();

  const authResult = await auth();
  const hasInternalAccess = Boolean(authResult.userId) && hasRouteShadowInternalAccessClaim(authResult.sessionClaims);

  return (
    <main className="min-h-screen bg-black text-white">
      {hasInternalAccess ? (
        <StagingSmokeHarnessClient />
      ) : (
        <section className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-200/70">Internal access required</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">Staging smoke harness blocked</h1>
          <p className="mt-4 text-sm leading-6 text-white/68">
            This page is available only to Clerk-authenticated internal operators with the canonical
            `sessionClaims.metadata.internalAccess === true` claim.
          </p>
        </section>
      )}
    </main>
  );
}
