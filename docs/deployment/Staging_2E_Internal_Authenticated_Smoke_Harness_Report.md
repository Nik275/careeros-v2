# Staging 2E Internal Authenticated Smoke Harness Report

Date: 2026-06-16

Verdict: AUTHENTICATED SMOKE HARNESS READY

## Summary

Implemented a hidden staging-only authenticated smoke harness at:

- `/internal/staging-smoke`
- `/internal/staging-smoke/run`

The harness is protected by Clerk proxy middleware and the canonical internal-access claim:

- `sessionClaims.metadata.internalAccess === true`

It is not linked from navigation.

## Security Model

- Host gated to the approved staging host: `careeros-v2-inky.vercel.app`
- Optional configured host support from `NEXT_PUBLIC_STAGING_URL`
- Returns `404` through proxy outside approved staging host
- Returns `401` for signed-out users
- Returns `403` for signed-in users without the internal-access claim
- Requires exact `sessionClaims.metadata.internalAccess === true`
- Does not read, print, return, or store tokens, cookies, passwords, Clerk secret keys, or raw payloads
- Sends synthetic-only request bodies
- Does not enable live routing
- Does not enable output replacement
- Does not enable raw payload capture
- Does not add production database or AI-provider behavior

## Harness Checks

The internal operator harness runs redacted synthetic checks against:

- `/api/internal/constitutional-shadow/assessment`
- `/api/internal/constitutional-shadow/career-fit`

Covered checks:

- valid synthetic assessment shadow response
- valid synthetic career-fit shadow response
- invalid content-type returns `415`
- malformed JSON returns `400`
- oversized body returns `413`
- repeated abuse returns `429`
- cross-origin POST returns `403`
- raw payload echo detection
- `liveRoutingEnabled === false`
- `allowOutputReplacement === false`
- `captureRawPayloads === false`

Regular-user validation remains an external smoke step:

- sign in as regular staging user
- open `/internal/staging-smoke`
- expected result: `403`
- direct internal route calls are still protected by the existing Clerk proxy and exact claim contract

## Files Changed

- `src/proxy.ts`
- `src/security/internal-route-protection.ts`
- `src/security/staging-smoke-harness.ts`
- `src/app/internal/staging-smoke/page.tsx`
- `src/app/internal/staging-smoke/StagingSmokeHarnessClient.tsx`
- `src/app/internal/staging-smoke/run/route.ts`
- `src/app/internal/staging-smoke/__tests__/staging-smoke-harness.test.ts`
- `src/app/__tests__/staging-security-contract.test.ts`
- `docs/deployment/Staging_2E_Internal_Authenticated_Smoke_Harness_Report.md`

## Validation

Commands run:

- `npx vitest run src/app/internal/staging-smoke src/app/__tests__/staging-security-contract.test.ts src/app/api/internal/constitutional-shadow`
- `npm run typecheck:test -- --pretty false`
- `npm run typecheck:build -- --pretty false`
- `npm run build`
- `npm audit --json`

Results:

- Focused tests: PASS, 3 files, 23 tests
- Test typecheck: PASS
- Production typecheck: PASS
- Production build: PASS
- Audit: PASS, 0 vulnerabilities

## Deployment Notes

After deployment from `origin/staging`, the internal operator should:

1. Sign in to staging with the internal-access Clerk claim.
2. Open `https://careeros-v2-inky.vercel.app/internal/staging-smoke`.
3. Run the synthetic smoke checks.
4. Confirm the page reports overall `PASS`.

The regular staging user should separately verify:

1. Sign in without `metadata.internalAccess`.
2. Open `https://careeros-v2-inky.vercel.app/internal/staging-smoke`.
3. Confirm access is blocked with `403`.

Final verdict: AUTHENTICATED SMOKE HARNESS READY
