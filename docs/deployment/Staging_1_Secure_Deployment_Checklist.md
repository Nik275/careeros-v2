# Staging 1 - Secure Deployment Checklist

Date: 2026-06-16  
Repository: `C:\Users\a\Projects\careeros-v2`  
Phase: STAGING-1  
Status: ready for manual Vercel setup after human review

## Deployment Rule

Do not deploy production from this checklist.

Staging is allowed only for synthetic/internal testing. Real users, real student data, production data, and real AI provider calls are not allowed.

## Local Gate Verification

| Gate | Result |
| --- | --- |
| `npm run typecheck:test -- --pretty false` | passed |
| `npm run typecheck:build -- --pretty false` | passed |
| `npm run build` | passed |
| `npm audit --json` | passed, 0 vulnerabilities |
| `npx vitest run src/app/api/internal/constitutional-shadow` | passed, 1 file / 14 tests |
| `npx vitest run src/app/__tests__/security-headers.test.ts src/app/__tests__/staging-security-contract.test.ts` | passed, 2 files / 6 tests |
| `npx vitest run src/intelligence/outcome-tracking` | passed, 2 files / 88 tests |
| `npx vitest run src/intelligence/orchestrator/rollout` | passed, 102 files / 299 tests |

## Code Readiness Checks

| Check | Status | Evidence |
| --- | --- | --- |
| Security headers present | pass | `next.config.ts` defines CSP, frame, referrer, permissions, nosniff, and HSTS headers |
| Internal API proxy protection present | pass | `src/proxy.ts` uses Clerk middleware and matches `/api/internal/constitutional-shadow/:path*` |
| Internal route fail-closed auth present | pass | `src/app/api/internal/constitutional-shadow/route-shadow-security.ts` rejects missing auth/claim |
| Exact internal-access claim contract present | pass | `sessionClaims.metadata.internalAccess === true` |
| Local/test bypass blocked in staging/prod-like mode | pass | route-shadow security tests cover production-like bypass rejection |
| Outcome browser persistence blocked outside local/test | pass | outcome storage security tests cover production-like blocking |
| Real AI provider calls disabled | pass | no active AI provider dependency or provider call is present |

## Vercel Project Setup Steps

Manual steps only:

1. Create or select a dedicated Vercel staging project for CareerOS V2.
2. Connect the Git repository to the staging project.
3. Set the project framework to Next.js.
4. Keep production deployment disabled until a separate production readiness phase.
5. Restrict project/team access to authorized internal operators.
6. Configure environment variables using the checklist below.
7. Deploy only from the approved staging branch or preview strategy below.
8. Run the smoke/security test plan before sharing any staging URL.

## Staging Branch Or Preview Strategy

Approved options:

- Dedicated branch: `staging`
- Preview deployment from a protected pull request branch

Rules:

- Do not deploy from unreviewed local-only changes.
- Do not promote staging to production.
- Do not enable public indexing.
- Do not share staging URL with real users.
- Do not connect production data sources.

## Required Environment Variable Names

Variable names only. Do not store real values in repository docs.

| Variable | Exposure | Secret | Required | Purpose |
| --- | --- | --- | --- | --- |
| `NODE_ENV` | server | no | yes | Must be production-like on Vercel so local/test bypasses do not apply |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | public | no | yes | Public Clerk staging application key |
| `CLERK_SECRET_KEY` | server | yes | yes | Server-only Clerk staging application secret |
| `NEXT_PUBLIC_STAGING_URL` | public | no | yes | Public staging origin for smoke/security verification |
| `DATABASE_URL` | server | yes | conditional | Synthetic staging database only; never production data |
| `SVIX_SECRET` | server | yes | conditional | Server-only webhook verification secret if webhooks are enabled |

Forbidden:

- Do not place secrets under `NEXT_PUBLIC_*`.
- Do not add provider API keys for real AI calls.
- Do not add production database credentials.
- Do not add real user data import credentials.

## Clerk Staging App Setup

Manual Clerk setup:

1. Create a dedicated Clerk staging application.
2. Use only staging Clerk keys in Vercel staging env vars.
3. Configure allowed origins and redirect URLs for the staging URL only.
4. Create internal test users only.
5. Assign internal access only to approved operators.
6. Do not reuse production Clerk users, sessions, keys, or metadata.

## Clerk Callback And Redirect URL Checklist

Add only staging URLs:

- Staging application URL
- Staging sign-in callback URL
- Staging sign-up callback URL, if sign-up is enabled for internal testers
- Staging after-sign-in redirect URL
- Staging after-sign-up redirect URL, if sign-up is enabled
- Staging sign-out redirect URL

Rules:

- Do not add production callback URLs to the staging Clerk app.
- Do not add localhost callback URLs to the deployed staging app unless explicitly needed for internal operator testing.
- Do not enable public sign-up for real users.

## Internal-Access Claim Setup

Exact required claim:

```text
sessionClaims.metadata.internalAccess === true
```

Rules:

- Grant only to authorized internal staging operators.
- Ordinary authenticated users must not have this claim.
- Role arrays, permission arrays, `publicMetadata`, or loose `internalAccess` fields do not grant access.
- Internal constitutional-shadow requests must fail closed without this exact claim.

## Allowed Staging URL / Host Checklist

Before smoke testing:

- Confirm the final staging URL is assigned.
- Confirm `NEXT_PUBLIC_STAGING_URL` contains the staging origin only.
- Confirm Clerk allowed origins include the staging origin only.
- Confirm cross-origin POSTs to internal constitutional-shadow routes are blocked.
- Confirm no production host is configured in the staging app.

## Database Decision

Decision: synthetic DB only.

Allowed:

- Synthetic seed data
- Internal test data created for staging
- Ephemeral or resettable staging database

Forbidden:

- Production database connection
- Production data dump
- Real student data
- Real assessment responses
- Real mentor messages
- Real outcome records

If a database is not required for the current smoke pass, leave `DATABASE_URL` unset.

## AI Provider Decision

Decision: disabled.

Real AI provider calls remain disabled unless an approved AI gateway exists.

Forbidden for STAGING-1:

- OpenAI provider activation
- Anthropic provider activation
- Vercel AI SDK activation
- LangChain activation
- Real provider API keys
- Model calls from staging smoke tests

## Smoke Test Checklist

Run the smoke/security test plan in:

- `docs/deployment/Staging_1_Smoke_Security_Test_Plan.md`

Minimum pass requirements:

- Homepage loads.
- Assessment page loads.
- Security headers are present.
- Internal API auth and authorization behavior matches the claim contract.
- Invalid, malformed, oversized, cross-origin, and abusive requests are blocked.
- No real AI call occurs.
- No real student data is stored.

## Rollback Checklist

If staging smoke/security checks fail:

1. Stop sharing the staging URL.
2. Disable or roll back the failed Vercel deployment.
3. Remove any staging env variable that caused unsafe behavior.
4. Confirm no real data was submitted.
5. Re-run local gates before any redeploy.
6. Re-run the smoke/security plan after redeploy.
7. Document the failure and resolution before continuing.

## No Real Users Rule

No real users are allowed in STAGING-1.

Allowed users:

- Internal operators
- Test accounts
- Synthetic personas

Forbidden users/data:

- Real students
- Parents/guardians using real data
- Mentors using real messages
- Production customer data
- Imported production records

## Manual Steps Remaining

Deployment is ready for manual Vercel setup after human review.

Remaining manual steps:

1. Create/select Vercel staging project.
2. Connect approved staging branch or preview strategy.
3. Create Clerk staging app.
4. Configure staging env vars by name only from this checklist.
5. Assign exact internal-access claim to internal test operators.
6. Confirm synthetic database decision.
7. Deploy staging only after explicit user approval.
8. Run the smoke/security test plan.
