'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import Link from 'next/link';

export function AuthNavState() {
  const { isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();

  return (
    <div className="flex h-9 min-w-[74px] items-center justify-center">
      {!isLoaded ? null : isSignedIn ? (
        <button
          type="button"
          onClick={() => void signOut({ redirectUrl: '/' })}
          className="rounded-full border border-white/10 px-3 py-2 text-[12px] font-medium tracking-[0.04em] text-white/70 transition-colors hover:border-white/20 hover:text-white sm:px-4"
          aria-label="Sign out of CareerOS"
        >
          Sign out
        </button>
      ) : (
        <Link
          href="/sign-in"
          className="rounded-full border border-white/10 px-3 py-2 text-[12px] font-medium tracking-[0.04em] text-white/70 transition-colors hover:border-white/20 hover:text-white sm:px-4"
        >
          Sign in
        </Link>
      )}
    </div>
  );
}
