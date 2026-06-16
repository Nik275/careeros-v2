# Security 3 - Clean Staging Security Pass

Date: 2026-06-16  
Repository: `C:\Users\a\Projects\careeros-v2`  
Phase: SECURITY-3  
Final verdict: STAGING SECURITY PASS

## 1. Final Verdict

STAGING SECURITY PASS.

The SECURITY-2 staging warning is resolved in local source. Internal constitutional-shadow routes now have a Clerk-backed Next proxy layer, an exact internal-access claim contract, route-level fail-closed authorization, staging env documentation, AI activation posture, synthetic-only data rule, and focused tests.

## 2. Security-2 Staging Warnings

All SECURITY-2 staging warnings are removed.

Resolved staging warning:

- Clerk middleware / internal-access claim model: resolved by `src/proxy.ts`, `src/security/internal-access-claims.ts`, `src/security/internal-route-protection.ts`, `src/security/staging-security-contract.ts`, and route-boundary tests.

Production-only deferred work remains below, but no unresolved staging-security warning remains for synthetic/internal-test staging.

## 3. Clerk Middleware Status

Status: implemented.

- Next 16 proxy file: `src/proxy.ts`
- Clerk integration: `clerkMiddleware`
- Protected matcher: `/api/internal/constitutional-shadow/:path*`
- Protected route family: `/api/internal/constitutional-shadow`
- Public pages are not matched by the proxy.
- Internal API route handlers still retain their own fail-closed authorization checks.

## 4. Internal-Access Claim Contract

Canonical claim path:

```text
sessionClaims.metadata.internalAccess === true
```

Only this exact shape grants internal constitutional-shadow access.

Rejected stale/broad shapes include:

- `sessionClaims.internalAccess`
- `sessionClaims.publicMetadata.internalAccess`
- role arrays
- permission arrays
- string access labels

Clerk staging configuration must assign `metadata.internalAccess: true` only to authorized internal test operators. Ordinary authenticated users must not receive this claim.

## 5. Local/Test Bypass Staging/Prod Safety

Status: passed.

The local/test header bypass remains limited to `NODE_ENV === "test"` or `NODE_ENV === "development"`.

In staging/prod-like mode:

- unauthenticated requests are rejected
- authenticated users without the exact claim are rejected
- authenticated users with `sessionClaims.metadata.internalAccess === true` are allowed
- the local/test bypass header is ignored and does not grant access

## 6. Staging Env Checklist

Variable names only; no real values are stored in source.

| Variable | Exposure | Secret | Required For Staging |
| --- | --- | --- | --- |
| `NODE_ENV` | server | no | yes |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | public | no | yes |
| `CLERK_SECRET_KEY` | server | yes | yes |
| `NEXT_PUBLIC_STAGING_URL` | public | no | yes |
| `DATABASE_URL` | server | yes | no, unless DB-backed staging flows are enabled |
| `SVIX_SECRET` | server | yes | no, unless webhooks are enabled |

Checklist validation confirms no secret variable is listed under `NEXT_PUBLIC_*`.

## 7. Logging/Privacy Cleanup Result

Status: cleaned for staging-sensitive direct console sites.

Sanitized direct logs that exposed raw errors or traceable identifiers in:

- `src/components/landing/ParticleConstellation.tsx`
- `src/career-intelligence/career-intelligence-engine.ts`
- `src/intelligence/confidence/*`
- `src/intelligence/counterfactual-engine/ComparisonFactories.ts`
- `src/intelligence/criticality-engine/CriticalityEngineV1.ts`
- `src/intelligence/decision/DecisionEvents.ts`
- `src/intelligence/market-aware-decision/MarketAwareDecisionEngine.ts`
- `src/intelligence/meta-decision-engine/MetaDecisionEngine.ts`
- `src/intelligence/outcome-learning/*`
- `src/intelligence/outcome-tracking/outcome-event-engine.ts`
- `src/intelligence/recommendation-stability/recommendation-stability-engine.ts`
- `src/intelligence/student-model/StudentBelief.ts`
- `src/intelligence/validation/*`

Remaining direct console calls are generic/deprecation style messages or non-sensitive operational warnings. A centralized redacting logger remains production-only work.

## 8. AI Activation Posture

Status: safe for staging.

- Real AI provider calls are not enabled.
- `package.json` does not include active OpenAI, Anthropic, Vercel AI SDK, or LangChain dependencies.
- Source scan found only a commented AI call placeholder in `src/assessment/questions/question-generator.ts`.
- Staging contract requires an approved AI gateway before real provider calls are enabled.
- Provider API keys, if ever added, must remain server-only and never use `NEXT_PUBLIC_*`.

## 9. Synthetic-Only Staging Data Rule

Staging is clean only for synthetic or internal test data.

Rule:

```text
Staging must use synthetic or internal test data only until export, deletion, retention, consent, and breach-response workflows are implemented.
```

If staging collects real student data before the privacy lifecycle is implemented, staging is no longer clean.

## 10. Commands Run

| Command | Result |
| --- | --- |
| `npm run typecheck:test -- --pretty false` | passed |
| `npm run typecheck:build -- --pretty false` | passed |
| `npm run build` | passed |
| `npm audit --json` | passed, 0 vulnerabilities |
| `npx vitest run src/app/api/internal/constitutional-shadow` | passed, 1 file / 14 tests |
| `npx vitest run src/app/__tests__/security-headers.test.ts src/app/__tests__/staging-security-contract.test.ts` | passed, 2 files / 6 tests |
| `npx vitest run src/intelligence/outcome-tracking` | passed, 2 files / 88 tests |
| `npx vitest run src/intelligence/orchestrator/rollout` | passed, 102 files / 299 tests |
| `npx vitest run src/intelligence/confidence src/intelligence/decision src/intelligence/outcome-learning` | passed, 39 files / 796 tests |
| `npx vitest run src/intelligence/recommendation-stability src/intelligence/market-aware-decision src/intelligence/validation` | passed, 3 files / 264 tests |
| `npx vitest run src/components/landing src/career-intelligence src/intelligence/counterfactual-engine src/intelligence/student-model` | passed, 3 files / 107 tests |

## 11. Tests Added/Updated

Updated:

- `src/app/api/internal/constitutional-shadow/__tests__/route-shadow-security.test.ts`

Added:

- `src/app/__tests__/staging-security-contract.test.ts`

New test coverage includes:

- unauthenticated staging/prod-like request rejected
- authenticated user without internal claim rejected
- authenticated user with exact internal claim allowed
- local/test bypass rejected in staging/prod-like mode
- broad legacy claim shapes rejected
- proxy matcher protects internal routes only
- staging env checklist has no public secrets
- AI provider dependencies are not active
- synthetic-only staging data rule exists

## 12. Remaining Production-Only Security Work

These are not staging blockers for synthetic/internal-test staging:

- Implement full privacy lifecycle: export, deletion, retention, consent, and breach-response workflows.
- Replace remaining direct console usage with a centralized redacting logger and production log-level controls.
- Build an approved AI gateway before enabling real AI provider calls.
- Perform deployed staging smoke/security checks after external staging configuration is supplied.
- Perform production penetration testing, vulnerability scanning, and operational incident-response validation before production launch.
