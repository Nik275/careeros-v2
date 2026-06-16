# STAGING-2D Auth Route Fix Report

Date: 2026-06-16

## Final Verdict

AUTH ROUTES READY

## Mission

Added minimal Clerk App Router sign-in and sign-up routes so staging test users can authenticate for Clerk-backed smoke/security validation.

## Files Changed

- `src/app/layout.tsx`
- `src/app/sign-in/[[...sign-in]]/page.tsx`
- `src/app/sign-up/[[...sign-up]]/page.tsx`
- `docs/deployment/Staging_2D_Auth_Route_Fix_Report.md`

## Implementation Summary

- Wrapped the App Router root layout in `ClerkProvider`.
- Added minimal `/sign-in` route using Clerk `<SignIn />`.
- Added minimal `/sign-up` route using Clerk `<SignUp />`.
- Used existing dark app styling with a centered auth component.
- Did not change internal API authorization behavior.
- Did not modify backend intelligence logic.
- Did not add env values, production data, database changes, or AI provider configuration.

## Required Vercel Staging Environment Names

Configure these manually in the Vercel staging project. Do not commit values.

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
- `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/`
- `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/`

Staging Clerk configuration must use a dedicated Clerk staging app only.

## Gate Results

| Command | Result |
| --- | --- |
| `npm run typecheck:test -- --pretty false` | PASS |
| `npm run typecheck:build -- --pretty false` | PASS |
| `npm run build` | PASS |
| `npm audit --json` | PASS, 0 vulnerabilities |

Build route output included:

- `/sign-in/[[...sign-in]]`
- `/sign-up/[[...sign-up]]`

## Commit

- Commit message: `fix(staging): add Clerk sign-in routes for smoke testing`
- Commit hash: pending at report creation time

## Staging Follow-Up

After the commit is pushed and Vercel deploys `origin/staging`, verify:

- `https://careeros-v2-inky.vercel.app/sign-in` loads Clerk sign-in.
- `https://careeros-v2-inky.vercel.app/sign-up` loads Clerk sign-up.
- A normal authenticated staging user without `sessionClaims.metadata.internalAccess === true` is rejected from internal routes.
- An internal staging test user with `sessionClaims.metadata.internalAccess === true` can run synthetic internal smoke checks.
