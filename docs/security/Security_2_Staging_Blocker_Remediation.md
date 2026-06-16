# Security 2 - Staging Blocker Remediation

Date: 2026-06-16  
Repository: `C:\Users\a\Projects\careeros-v2`  
Phase: SECURITY-2  
Verdict: STAGING SECURITY PASS WITH WARNINGS

Security-3 update: the SECURITY-2 staging warning for Clerk middleware and explicit internal-access claim configuration is resolved by `src/proxy.ts`, `src/security/internal-access-claims.ts`, and the SECURITY-3 test coverage/report. This SECURITY-2 file remains a historical record; current staging status is recorded in `docs/security/Security_3_Clean_Staging_Security_Pass.md`.

## Summary

SECURITY-1 high staging blockers were remediated with minimal, fail-closed changes.

- H-01 fixed: internal constitutional-shadow API routes now require server-side authorization.
- H-02 fixed: API route boundary now validates auth, origin, content type, body size, JSON parsing, payload shape, and rate limits.
- H-03 fixed: outcome localStorage persistence and demo XOR encryption are disabled outside explicit local/test modes.
- H-04 fixed: `npm audit` now reports 0 vulnerabilities after safe overrides.

Staging is allowed from this local security gate with warnings. The internal route-shadow endpoints are fail-closed outside local/test mode unless Clerk auth plus explicit internal-access claims are configured.

## High Findings Fixed

### H-01 - Internal API route auth and authorization

Files:

- `src/app/api/internal/constitutional-shadow/route-shadow-security.ts`
- `src/app/api/internal/constitutional-shadow/assessment/route.ts`
- `src/app/api/internal/constitutional-shadow/career-fit/route.ts`

Fix:

- Added shared secured route-shadow handler.
- Added Clerk server-side `auth()` check for non-local/non-test requests.
- Added explicit internal-access authorization via Clerk session claims.
- Added fail-closed behavior: if Clerk context, user identity, or explicit internal-access claims are missing, the route returns safe `401` or `403`.
- Added local/test-only internal access header for deterministic tests:
  - `x-careeros-internal-access: route-shadow-local-test`

Warning:

- No Clerk middleware or deployed Clerk claim model existed in the repo before this phase. The route is therefore safe by denial in staging until those operational settings are configured.

### H-02 - API boundary validation, size protection, origin posture, and rate limiting

Files:

- `src/app/api/internal/constitutional-shadow/route-shadow-security.ts`
- `src/app/api/internal/constitutional-shadow/__tests__/route-shadow-security.test.ts`
- `src/intelligence/orchestrator/rollout/route-shadow/__tests__/route-shadow-route-handlers.test.ts`
- `src/intelligence/orchestrator/rollout/route-shadow-http/RouteShadowHttpPayloadFactory.ts`

Fix:

- Rejects unsupported content types with `415`.
- Reads request text safely instead of directly calling `request.json()`.
- Enforces `64 KiB` request body limit before JSON parsing completes.
- Rejects malformed JSON with safe `400`.
- Rejects invalid top-level shape, mismatched flow/path, non-synthetic requests, and non-synthetic payloads with safe `422`.
- Adds same-origin check when an `Origin` header is present.
- Adds in-memory route-level limiter: 20 requests per minute per client/flow.
- Keeps response payloads generic and does not echo raw input.

### H-03 - Outcome localStorage and demo XOR encryption gate

Files:

- `src/intelligence/outcome-tracking/outcome-store.ts`
- `src/intelligence/outcome-tracking/index.ts`
- `src/intelligence/outcome-tracking/__tests__/outcome-storage-security.test.ts`

Fix:

- `LocalStorageOutcomeStore.save()` now throws outside explicit local/test persistence mode when running in a browser.
- `createLocalStorageStore()` accepts a narrow explicit test/local override.
- `EncryptedOutcomeStore` and `createEncryptedStore()` now throw outside explicit local/test demo-encryption mode.
- Added exported guards:
  - `isLocalOutcomeBrowserPersistenceAllowed()`
  - `isDemoOutcomeEncryptionAllowed()`
- Sanitized one outcome migration log to avoid logging record IDs.

### H-04 - Dependency audit vulnerabilities

Files:

- `package.json`
- `package-lock.json`

Fix:

- Added safe npm overrides:
  - `vite: 8.0.16`
  - `postcss: 8.5.15`
  - `js-yaml: 4.2.0`
- Ran `npm install` to update local `node_modules`.

Before:

- `npm audit --json`: 4 vulnerabilities
- Critical: 0
- High: 1
- Moderate: 3

After:

- `npm audit --json`: 0 vulnerabilities

Installed tree confirmation:

- `vite@8.0.16` overridden
- `postcss@8.5.15` overridden/deduped, including under Next
- `js-yaml@4.2.0` overridden

## Medium Findings Fixed

### M-01 - Security headers

File:

- `next.config.ts`

Fix:

- Added global headers:
  - `Content-Security-Policy`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy`
  - `X-Content-Type-Options: nosniff`
  - `Strict-Transport-Security`

Test:

- `src/app/__tests__/security-headers.test.ts`

### M-02 - Origin posture for POST routes

File:

- `src/app/api/internal/constitutional-shadow/route-shadow-security.ts`

Fix:

- Requests with an `Origin` header must match the request protocol and host.
- Cross-origin browser POSTs are rejected with safe `403`.

### M-03 - Privacy logging partial cleanup

Files:

- `src/intelligence/confidence/ConfidenceAuthority.ts`
- `src/intelligence/outcome-tracking/outcome-store.ts`

Fix:

- Removed direct logging of `sourceId` and outcome payload from `ConfidenceAuthority.updateSourceTrust()`.
- Removed record ID from outcome migration failure logging.

Deferred:

- A full logging framework/policy was not implemented in SECURITY-2 to avoid broad architecture changes.

### M-07 - Abuse protection for current exposed routes

File:

- `src/app/api/internal/constitutional-shadow/route-shadow-security.ts`

Fix:

- Added per-client, per-flow in-memory rate limiter for the two current exposed API routes.

## Findings Deferred

### Clerk operational authorization model

Reason:

- The repository contains `@clerk/nextjs`, but no existing Clerk middleware, role model, organization permission model, or internal-access claim contract was present.

Security posture:

- Routes fail closed outside local/test mode unless Clerk auth succeeds and explicit internal-access claims are present.

Required before production:

- Configure Clerk middleware and define the canonical internal-access claim or permission.

### Full privacy lifecycle controls

Reason:

- SECURITY-2 scope was staging blockers only; database/schema/privacy workflow changes were explicitly out of scope.

Required before production:

- User data export, deletion, retention, consent, and breach-response workflows.

### Full centralized privacy-safe logger

Reason:

- A broad logging refactor was out of scope.

Required before production:

- Replace direct production `console.*` usage with a redacting logger and production log-level controls.

### AI/prompt security gateway

Reason:

- SECURITY-1 found prompt construction but no active model provider integration. AI gateway work was not a staging blocker for the current app routes.

Required before production AI activation:

- Central model gateway, prompt sanitization, output validation, memory isolation, and model-output retention policy.

## Files Modified

Production/security files:

- `next.config.ts`
- `package.json`
- `package-lock.json`
- `src/app/api/internal/constitutional-shadow/assessment/route.ts`
- `src/app/api/internal/constitutional-shadow/career-fit/route.ts`
- `src/app/api/internal/constitutional-shadow/route-shadow-security.ts`
- `src/intelligence/confidence/ConfidenceAuthority.ts`
- `src/intelligence/outcome-tracking/index.ts`
- `src/intelligence/outcome-tracking/outcome-store.ts`
- `src/intelligence/orchestrator/rollout/route-shadow-http/RouteShadowHttpPayloadFactory.ts`
- `vitest.config.ts`

Tests added/updated:

- `src/app/api/internal/constitutional-shadow/__tests__/route-shadow-security.test.ts`
- `src/app/__tests__/security-headers.test.ts`
- `src/intelligence/outcome-tracking/__tests__/outcome-storage-security.test.ts`
- `src/intelligence/orchestrator/rollout/route-shadow/__tests__/route-shadow-route-handlers.test.ts`

Report:

- `docs/security/Security_2_Staging_Blocker_Remediation.md`

## Tests Added Or Updated

Added coverage for:

- unauthenticated internal API request rejection
- unauthorized internal-access rejection
- valid synthetic/internal request handling when explicitly allowed
- invalid content-type rejection
- invalid payload shape rejection
- oversized payload rejection
- repeated request rate limiting
- cross-origin POST rejection
- outcome localStorage persistence blocked outside local/test mode
- demo XOR encryption blocked outside local/test mode
- security headers present in Next config

Updated coverage:

- route-shadow route-handler test now uses the local/test internal-access header.
- route-shadow HTTP synthetic payload factory now includes local/test internal-access header for route-handler simulation.

## Commands Run

```powershell
npm audit --json
npm install --package-lock-only
npm install
npm audit --json
npm run typecheck:test -- --pretty false
npm run typecheck:build -- --pretty false
npm run build
npx vitest run src/app/api/internal/constitutional-shadow
npx vitest run src/intelligence/orchestrator/rollout
npx vitest run src/intelligence/outcome-tracking
npx vitest run src/app/__tests__/security-headers.test.ts
npm ls vite next postcss js-yaml
```

## Command Results

| Command | Result |
| --- | --- |
| `npm run typecheck:test -- --pretty false` | passed |
| `npm run typecheck:build -- --pretty false` | passed |
| `npm run build` | passed |
| `npm audit --json` before | failed, 4 vulnerabilities |
| `npm audit --json` after | passed, 0 vulnerabilities |
| `npx vitest run src/app/api/internal/constitutional-shadow` | passed, 1 file / 9 tests |
| `npx vitest run src/intelligence/orchestrator/rollout` | passed, 102 files / 299 tests |
| `npx vitest run src/intelligence/outcome-tracking` | passed, 2 files / 88 tests |
| `npx vitest run src/app/__tests__/security-headers.test.ts` | passed, 1 file / 1 test |

## Staging Decision

Staging is now allowed with warnings.

Reason:

- All SECURITY-1 high findings were fixed or fail-closed.
- Dependency audit is clean.
- Local typecheck/build gates are green.
- Focused security/runtime tests are green.
- The remaining warnings are operational or production-readiness items, not exposed staging blockers in the current local code.

Warning:

- Internal constitutional-shadow routes will deny staging/prod requests unless Clerk middleware and explicit internal-access claims are configured. That is intentional fail-closed behavior.

## Final Verdict

STAGING SECURITY PASS WITH WARNINGS
