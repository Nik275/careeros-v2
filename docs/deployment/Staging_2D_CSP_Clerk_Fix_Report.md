# STAGING-2D CSP Clerk Fix Report

Date: 2026-06-16

## Final Verdict

CLERK CSP FIX READY

## Root Cause

The staging `/sign-in` route existed, but Clerk's browser script was blocked by the deployed Content Security Policy. The previous CSP only allowed scripts from `'self'`, `'unsafe-inline'`, and `'unsafe-eval'`, so the Clerk staging frontend API script at `https://teaching-swine-10.clerk.accounts.dev` could not load.

## CSP Directives Changed

Updated `next.config.ts` to add narrow, exact allowlists:

- `script-src`
  - preserved `'self'`, `'unsafe-inline'`, and `'unsafe-eval'`
  - added `https://teaching-swine-10.clerk.accounts.dev`
  - added `https://challenges.cloudflare.com`
- `script-src-elem`
  - added `'self'`
  - added `'unsafe-inline'`
  - added `https://teaching-swine-10.clerk.accounts.dev`
  - added `https://challenges.cloudflare.com`
- `connect-src`
  - preserved `'self'`
  - added `https://teaching-swine-10.clerk.accounts.dev`
- `img-src`
  - preserved `'self'`, `data:`, and `blob:`
  - added `https://img.clerk.com`
- `worker-src`
  - added `'self'`
  - added `blob:`
- `frame-src`
  - added `'self'`
  - added `https://challenges.cloudflare.com`
- `style-src`
  - preserved `'self'`
  - preserved `'unsafe-inline'`

No wildcard source was added. No broad `https:` source was added.

## Preserved Security Headers

- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`

## Files Modified

- `next.config.ts`
- `src/app/__tests__/security-headers.test.ts`
- `docs/deployment/Staging_2D_CSP_Clerk_Fix_Report.md`

## Test Updates

Updated the security header test to assert:

- Clerk staging frontend API is allowed in `script-src`, `script-src-elem`, and `connect-src`.
- Cloudflare challenges are allowed in `script-src`, `script-src-elem`, and `frame-src`.
- Clerk images are allowed in `img-src`.
- Worker sources include only `'self'` and `blob:`.
- No wildcard source is present.
- No broad `https:` script source is present.

## Gate Results

| Command | Result |
| --- | --- |
| `npx vitest run src/app/__tests__/security-headers.test.ts` | PASS, 1 test |
| `npx vitest run src/app/api/internal/constitutional-shadow` | PASS, 14 tests |
| `npm run typecheck:test -- --pretty false` | PASS |
| `npm run typecheck:build -- --pretty false` | PASS |
| `npm run build` | PASS |
| `npm audit --json` | PASS, 0 vulnerabilities |

## Commit

- Commit message: `fix(staging): allow Clerk staging CSP sources`
- Commit hash: assigned after this report is committed and pushed.

## Expected Staging Result

After Vercel deploys the pushed `origin/staging` commit, `/sign-in` should be able to load Clerk JS from the exact staging frontend API host:

- `https://teaching-swine-10.clerk.accounts.dev`

This does not change internal API authorization behavior and does not enable production data, real student data, real AI calls, or broader script execution sources.
