# Security 1 - Chief Cybersecurity And Data Privacy Audit

Audit date: 2026-06-16  
Repository: `C:\Users\a\Projects\careeros-v2`  
Audit mode: source-code and local-command audit only  
Scope: CareerOS V2 before staging or deployment  

## 1. Executive Verdict

Verdict: BLOCKED

Production build health is green, but security and privacy readiness is not green. The repository exposes internal API routes without verified authentication, authorization, request schema validation, pre-parse body limits, or route-level rate limiting. `npm audit` also reports unresolved dependency vulnerabilities, including one high-severity Vite advisory.

No hardcoded production secrets were found in tracked source during the searches performed, and the route-shadow internals have strong safety defaults. Those strengths do not offset the exposed unauthenticated API boundary.

## 2. Deployment Recommendation

Deployment recommendation: not safe for staging

Staging should wait until the required staging fixes are completed and re-audited:

- Protect or remove public access to `src/app/api/internal/constitutional-shadow/**`.
- Add route-boundary request validation, content-type handling, payload-size limits before JSON parsing, and rate limiting.
- Resolve or formally risk-accept `npm audit` findings.
- Add web security headers and staging host/origin controls.
- Gate or remove browser-local sensitive outcome persistence from any staging user path.

## Finding Counts

| Severity | Count |
| --- | ---: |
| Critical | 0 |
| High | 4 |
| Medium | 7 |
| Low | 4 |

Critical count is zero because no confirmed tracked secret, confirmed cross-user data exposure, or confirmed raw sensitive data disclosure was found from source alone. The high findings are still staging blockers.

## 3. Critical Findings

No critical findings confirmed from local source-code audit.

## 4. High Findings

### H-01 - Public internal API routes have no verified authentication or authorization

Impact: unauthenticated callers can invoke internal route-shadow endpoints in staging unless protected externally. Route-shadow internals block live routing and raw payload capture by default, but the HTTP boundary itself is public.

Evidence:

- `src/app/api/internal/constitutional-shadow/assessment/route.ts:8` exports `POST(request: Request)`.
- `src/app/api/internal/constitutional-shadow/career-fit/route.ts:8` exports `POST(request: Request)`.
- Both routes import only `NextResponse`, route-shadow services, and route-shadow types; no Clerk/server auth import or session validation appears in either route.
- `package.json:17` includes `@clerk/nextjs`, but source searches found no `auth()`, `currentUser()`, `getAuth()`, Clerk middleware, or role/ownership checks protecting these routes.
- `middleware.ts` / `src/middleware.ts` was not found.
- `npm run build` exposes both dynamic routes:
  - `/api/internal/constitutional-shadow/assessment`
  - `/api/internal/constitutional-shadow/career-fit`

Required before staging: add server-side authentication, role/internal-access checks, and explicit authorization for these routes, or remove/disable the routes from staging.

### H-02 - API request boundary lacks schema validation, content-type checks, pre-parse size limits, and route-level rate limiting

Impact: malformed or large requests can reach JSON parsing and route-shadow service construction. Repeated calls can abuse internal execution paths even when safety gates later block output.

Evidence:

- `src/app/api/internal/constitutional-shadow/assessment/route.ts:18` casts parsed JSON to `Partial<RouteShadowRequest>`.
- `src/app/api/internal/constitutional-shadow/career-fit/route.ts:10` casts parsed JSON to `Partial<RouteShadowRequest>`.
- Both routes pass `body.payload`, `body.config`, `body.approval`, `body.gateInputs`, and `body.metadata` directly into `RouteShadowExecutionService`.
- Searches found no Zod/equivalent route schema in `src/app/api/internal/constitutional-shadow/**`.
- Searches found no route-level CORS, CSRF, request-size, or rate-limit implementation for these API routes.
- `RouteShadowController.ts:115` enforces `maxPayloadBytes`, but this happens after `request.json()` has already parsed the body.

Required before staging: validate request bodies at the HTTP boundary, reject unsupported content types, enforce request-size limits before JSON parsing where the platform allows it, and add rate limiting.

### H-03 - Sensitive outcome data can be persisted in browser localStorage, with demo-grade XOR "encryption"

Impact: localStorage is readable by any successful XSS, browser extension, shared machine session, or local browser compromise. Outcome records may contain student/career/longitudinal learning data. The XOR wrapper is explicitly not production-grade encryption.

Evidence:

- `src/intelligence/outcome-tracking/outcome-store.ts:227` writes `JSON.stringify(record)` to `localStorage`.
- `src/intelligence/outcome-tracking/outcome-store.ts:231` writes student-to-record index values to `localStorage`.
- `src/intelligence/outcome-tracking/outcome-store.ts:248` and `src/intelligence/outcome-tracking/outcome-store.ts:259` read records and student indexes from `localStorage`.
- `src/intelligence/outcome-tracking/outcome-store.ts:591` states: `Simple XOR encryption (for demonstration - use proper encryption in production)`.
- `src/intelligence/outcome-tracking/outcome-store.ts:600` and `src/intelligence/outcome-tracking/outcome-store.ts:607` use `btoa` / `atob`.
- `src/intelligence/outcome-tracking/outcome-store.ts:785` and `src/intelligence/outcome-tracking/outcome-store.ts:793` expose export/import helpers for outcome records.

Scope note: this audit did not find current app routes using this store directly, but it is production source and exported code. It must be gated before any user-facing staging flow can rely on outcome tracking.

Required before staging: ensure sensitive outcome storage is not reachable in browser staging flows, or replace it with server-side, authenticated, access-controlled storage and real encryption where required.

### H-04 - Dependency audit reports unresolved high and moderate vulnerabilities

Impact: unresolved supply-chain vulnerabilities remain in the local dependency graph. The high Vite issue is especially relevant on Windows development or test surfaces; Next/PostCSS and js-yaml findings also require resolution or formal risk acceptance.

Evidence from `npm audit --json`:

| Package | Severity | Evidence |
| --- | --- | --- |
| `vite` | high | `vite: server.fs.deny bypass on Windows alternate paths`, range `8.0.0 - 8.0.15`; also NTLMv2 hash disclosure advisory via `launch-editor` UNC handling |
| `next` | moderate | affected through nested `postcss`; local version is `next@16.2.6` |
| `postcss` | moderate | XSS via unescaped `</style>` in CSS stringify output, nested under `next/node_modules/postcss@8.4.31` |
| `js-yaml` | moderate | quadratic-complexity DoS in merge key handling, `js-yaml@4.1.1` via ESLint tooling |

`npm audit` metadata: 4 total vulnerabilities, 1 high, 3 moderate, 0 critical.

Required before staging: upgrade, patch, or formally risk-accept each advisory with staging-specific exploitability notes.

## 5. Medium Findings

### M-01 - No global web security headers or CSP configured

Impact: the app lacks repository-level evidence for CSP, clickjacking protection, HSTS, referrer policy, and permissions policy. This increases XSS blast radius and weakens browser hardening.

Evidence:

- `next.config.ts` contains only an empty `NextConfig` object.
- Searches found no `Content-Security-Policy`, `X-Frame-Options`, `Strict-Transport-Security`, `Referrer-Policy`, `Permissions-Policy`, or app-level `headers()` configuration.
- No middleware file was found to apply headers globally.

Required before production; recommended before staging: add a staging-safe CSP and standard security headers.

### M-02 - No explicit CORS, CSRF, or allowed-origin policy for exposed POST API routes

Impact: the internal routes are currently unauthenticated. Even after auth is added, POST endpoints should define origin and CSRF expectations instead of relying on defaults.

Evidence:

- Searches found no CORS or CSRF handling in `src/app/api/internal/constitutional-shadow/**`.
- The two API routes accept POST JSON and return `NextResponse.json(...)`.

Required before staging: define allowed origin/host behavior and CSRF posture for browser-reachable POST routes.

### M-03 - Production logging is not centrally privacy-governed

Impact: console logging of identifiers, outcomes, or errors can leak private or pseudonymous student data to hosting logs. The codebase contains multiple production-source `console.*` calls.

Evidence examples:

- `src/intelligence/confidence/ConfidenceAuthority.ts:425` logs `sourceId` and `outcome`.
- `src/intelligence/outcome-tracking/outcome-store.ts:771` logs failed migration record IDs.
- `src/intelligence/outcome-learning/outcome-learning-engine.ts:389` and `src/intelligence/outcome-learning/outcome-learning-engine.ts:394` debug-log learning signal IDs.
- `src/components/landing/ParticleConstellation.tsx:990` logs canvas render errors to the browser console.

Required before production; recommended before staging: introduce a privacy-safe logger policy, sanitize IDs and payloads, and disable debug logs in production.

### M-04 - Sensitive data lifecycle controls are not verified at the app/API level

Impact: the schema models sensitive student, psychological, mentor-memory, decision, and outcome data, but this audit did not find app/API endpoints for user data export, deletion, retention, or access review.

Evidence:

- `prisma/schema.prisma:60` model `User`.
- `prisma/schema.prisma:140` model `AssessmentSession`.
- `prisma/schema.prisma:161` model `AssessmentResponse`.
- `prisma/schema.prisma:183` model `PsychologicalProfile`.
- `prisma/schema.prisma:243` model `CareerMatch`.
- `prisma/schema.prisma:277` model `MentorMemoryCore`.
- `prisma/schema.prisma:317` model `DecisionHistory`.
- `prisma/schema.prisma:354` model `GrowthSnapshot`.
- `prisma/schema.prisma:392` model `EmotionalPatternProfile`.
- `prisma/schema.prisma:423` model `SessionMemory`.
- `prisma/schema.prisma:468` model `MentorMemory`.
- Current `src/app/api/**` contains only the two constitutional-shadow routes, not privacy lifecycle endpoints.

Required before production: define and implement export, deletion, retention, and consent workflows for sensitive student data.

### M-05 - Prisma schema exists, but database ownership enforcement was not verifiable from active app paths

Impact: the schema is user-scoped, but no active app API path was found exercising Prisma reads/writes with user ownership checks. This is not a direct exploit today, but staging cannot claim DB authorization is implemented from current evidence.

Evidence:

- `prisma/schema.prisma` uses `DATABASE_URL`.
- Search did not find `$queryRaw` or `$executeRaw` in source, which is positive.
- Search did not find production `PrismaClient` usage in `src/app/api/**`.
- No user-scoped DB access layer was verified for current app API paths.

Required before any DB-backed staging feature: every read/write must bind to authenticated user identity and enforce ownership on the server.

### M-06 - AI/prompt security controls are incomplete for future AI activation

Impact: current code includes prompt construction patterns, but no active OpenAI/Anthropic/LangChain provider dependency or call path was found. If AI calls are enabled later, prompt injection, prompt leakage, and untrusted user-text handling need a formal gateway.

Evidence:

- `src/assessment/questions/question-generator.ts` builds generation prompts from templates and request input.
- `src/assessment/questions/question-generator.ts:309` shows the AI call is commented out.
- Searches found no active `openai`, `anthropic`, `langchain`, `chat.completions`, `generateText`, or `generateObject` integration in source/package metadata.
- Positive control: `src/intelligence/orchestrator/observe/ObservePayloadSanitizer.ts` redacts keys matching `prompt`, `response`, `raw`, email, phone, address, and other sensitive patterns.

Required before production AI activation: centralize AI calls, sanitize untrusted text, block prompt leakage, separate user memory by authenticated identity, and audit stored model outputs.

### M-07 - Abuse protection is incomplete outside route-shadow internal gates

Impact: route-shadow internals have execution gates, but the public API surface has no repository-level rate limiter. Future assessment, mentor, and AI routes would be vulnerable to spam and cost abuse if exposed similarly.

Evidence:

- Search found provider metadata such as `rateLimitPerHour` under `src/intelligence/market/providers/**`, but no app-level request limiter.
- `src/intelligence/orchestrator/rollout/CanaryShadowSampler.ts` contains internal rollout sampling/rate concepts, not HTTP route abuse protection.
- Current API routes expose POST handlers without rate-limit checks.

Required before staging: add per-route rate limits and request budgets for public or semi-public endpoints.

## 6. Low Findings

### L-01 - Local `.env` exists and production build loads it; tracked secret scan did not find committed secrets

Impact: local environment hygiene appears acceptable from tracked-source perspective, but actual secret values were not read and staging secret configuration is not verified.

Evidence:

- `npm run build` output includes `Environments: .env`.
- `.gitignore` includes `.env*`.
- `git status --short -- .env .env.local .env.development .env.production .vercel vercel.json` returned no tracked changes for those paths.
- Secret-pattern searches found env variable identifiers such as `DATABASE_URL`, but no committed secret values in tracked source from the scanned patterns.

Required before staging: verify staging secrets are configured outside source control and are not exposed as `NEXT_PUBLIC_*` unless intended.

### L-02 - Public environment usage appears limited, but staging URL exposure needs review

Impact: `NEXT_PUBLIC_*` values are client-visible by design. The current public env search found a staging URL variable, not a secret, but allowed-host and preview URL policy remain unverified.

Evidence:

- `src/intelligence/orchestrator/rollout/route-shadow-deployed/DeployedRouteShadowConfig.ts` references `NEXT_PUBLIC_STAGING_URL`.

Required before staging: confirm public env values contain only non-secret hostnames/URLs.

### L-03 - No dangerous HTML/eval sink found in searched source, but this should remain a regression check

Impact: no immediate XSS sink was found from `dangerouslySetInnerHTML`, `innerHTML`, `eval`, or `new Function` searches. This is a positive result, not a permanent guarantee.

Evidence:

- Search for `dangerouslySetInnerHTML`, `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `eval(`, `new Function(`, and `document.cookie` returned no production source matches.
- The same search found `localStorage` usage only in `src/intelligence/outcome-tracking/outcome-store.ts`.

Required before production: keep these searches in security regression checks.

### L-04 - Frontend assessment page did not show direct persistence or API submission in inspected code

Impact: current assessment UI appears to keep assessment state in React state only. This reduces immediate browser persistence risk for that page, but no consent/privacy UX was verified.

Evidence:

- `src/app/assessment/page.tsx` is a client component using React state for assessment data.
- Searches in app/components did not find assessment-page `localStorage`, `sessionStorage`, or `fetch` submission usage.

Required before staging with real users: add clear privacy/consent handling before collecting sensitive answers.

## 7. Privacy/Data-Handling Findings

- High: browser-local persistence of outcome records exists in `src/intelligence/outcome-tracking/outcome-store.ts`.
- Medium: sensitive Prisma models exist for assessment responses, psychological profiles, recommendations, mentor memory, emotional patterns, and session memory, but app-level export/deletion/retention workflows were not verified.
- Medium: production-source console logging can include identifiers and result objects.
- Positive: route-shadow internals reject non-synthetic payloads and force `captureRawPayloads: false`.
- Unknown: actual `.env` contents, hosting logs, database backups, vendor retention, and breach response process were not verified.

## 8. AI/Prompt-Injection Findings

- No active OpenAI/Anthropic/LangChain dependency or direct model-call integration was found.
- Prompt construction exists in `src/assessment/questions/question-generator.ts`, with the model call currently commented.
- `ObservePayloadSanitizer` redacts prompt-like and raw-response keys, which is a useful control.
- Mentor memory and AI-adjacent models exist in Prisma, so future AI activation must include prompt-injection controls, cross-user memory isolation, and model-output storage review.

## 9. Auth/API/Database Findings

- Clerk is installed but not wired into route protection from current source evidence.
- No middleware was found.
- The only app API routes found are internal constitutional-shadow endpoints, and both lack route-level auth.
- No raw Prisma queries were found.
- No active app/API Prisma ownership checks were verified.
- Internal route-shadow safety controls are strong:
  - `RouteShadowConfig.ts:8` defaults `enabled` to `false`.
  - `RouteShadowConfig.ts:20` forces `captureRawPayloads: false`.
  - `RouteShadowConfig.ts:21` forces `allowProductionEnvironment: false`.
  - `RouteShadowConfig.ts:22` forces `allowLiveRouting: false`.
  - `RouteShadowConfig.ts:23` forces `allowOutputReplacement: false`.
  - `RouteShadowController.ts:116` blocks `rawStudentData` and `realStudentData`.
  - `RouteShadowController.ts:119` requires `dataClassification` to be `SYNTHETIC`.

## 10. Dependency Findings

`npm audit --json` failed with 4 vulnerabilities:

- Critical: 0
- High: 1
- Moderate: 3
- Low: 0

Dependency tree evidence from `npm ls vite next postcss js-yaml`:

- `next@16.2.6` is direct.
- `next@16.2.6` carries nested `postcss@8.4.31`.
- `vitest@4.1.7` and `@vitejs/plugin-react@6.0.2` use `vite@8.0.14`.
- `eslint@9.39.4` uses `js-yaml@4.1.1`.

## 11. Logging/Secrets Findings

- No committed production secrets were confirmed by the scanned patterns.
- `.env` exists locally and is ignored; contents were not read.
- `prisma.config.ts:12` and `prisma/schema.prisma:7` reference `DATABASE_URL` as an environment variable, not a committed value.
- Logging risk remains due direct `console.*` calls in production source.
- Positive: `src/intelligence/orchestrator/rollout/route-shadow-deployed/DeployedRouteShadowResponseValidator.ts` checks deployed route-shadow responses for secret-like leakage patterns including `SECRET`, `TOKEN`, `API_KEY`, `DATABASE_URL`, `CLERK_`, and `SVIX_`.

## 12. Staging-Readiness Findings

Staging is blocked.

Reasons:

- Public internal API routes are unauthenticated.
- Request validation/rate limiting is incomplete.
- Dependency audit is not clean.
- Security headers are missing.
- Sensitive localStorage outcome persistence exists in production source.
- Staging host, allowed-origin, Clerk callback, and environment separation were not verified.

Positive staging signals:

- `npm run typecheck:test -- --pretty false` passed.
- `npm run typecheck:build -- --pretty false` passed.
- `npm run build` passed.
- No tracked secret values were found in source-pattern searches.
- Route-shadow internals default to observe/synthetic-safe behavior.

## 13. Exact Files Inspected

Manually inspected or directly searched:

- `package.json`
- `package-lock.json`
- `next.config.ts`
- `.gitignore`
- `prisma.config.ts`
- `prisma/schema.prisma`
- `src/app/api/internal/constitutional-shadow/assessment/route.ts`
- `src/app/api/internal/constitutional-shadow/career-fit/route.ts`
- `src/app/assessment/page.tsx`
- `src/components/landing/ParticleConstellation.tsx`
- `src/assessment/questions/question-generator.ts`
- `src/intelligence/orchestrator/rollout/route-shadow/RouteShadowConfig.ts`
- `src/intelligence/orchestrator/rollout/route-shadow/RouteShadowController.ts`
- `src/intelligence/orchestrator/rollout/route-shadow/RouteShadowExecutionService.ts`
- `src/intelligence/orchestrator/rollout/route-shadow/RouteShadowApprovalFactory.ts`
- `src/intelligence/orchestrator/rollout/route-shadow/RouteShadowAuditBundle.ts`
- `src/intelligence/orchestrator/rollout/route-shadow/RouteShadowTypes.ts`
- `src/intelligence/orchestrator/rollout/route-shadow-deployed/DeployedRouteShadowConfig.ts`
- `src/intelligence/orchestrator/rollout/route-shadow-deployed/DeployedRouteShadowResponseValidator.ts`
- `src/intelligence/orchestrator/observe/ObservePayloadSanitizer.ts`
- `src/intelligence/outcome-tracking/outcome-store.ts`
- `src/intelligence/outcome-tracking/outcome-event-engine.ts`
- `src/intelligence/outcome-learning/outcome-learning-engine.ts`
- `src/intelligence/confidence/ConfidenceAuthority.ts`
- `src/intelligence/confidence/ConfidenceCalculator.ts`

Repository-wide searches were run over `src`, `prisma`, `package.json`, `next.config.ts`, and selected config files for auth, API, secrets, raw queries, console logging, browser storage, dangerous HTML/eval, public env usage, headers, CORS, and rate-limit patterns.

## 14. Exact Commands Run

Build/security gates:

```powershell
npm run typecheck:test -- --pretty false
npm run typecheck:build -- --pretty false
npm run build
npm audit --json
npm ls vite next postcss js-yaml
```

Route/API and auth discovery:

```powershell
rg --files src/app/api
rg -n "export async function POST|request\.json|body\.payload|body\.config|body\.approval|body\.gateInputs|body\.metadata|NextResponse\.json" src/app/api/internal/constitutional-shadow -g "route.ts"
rg -n "(@clerk|clerkClient|auth\(|currentUser\(|getAuth\(|withAuth|requireAuth|middleware\(|sessionClaims|organizationId|userId)" src package.json -g "*.ts" -g "*.tsx" -g "package.json"
```

Security headers, CORS, and rate-limit discovery:

```powershell
rg -n "Content-Security-Policy|X-Frame-Options|Strict-Transport-Security|Referrer-Policy|Permissions-Policy|Access-Control-Allow|cors|rateLimit|rate limit|csrf|sameSite|cookies\(|NextResponse" src next.config.ts middleware.ts -g "*.ts" -g "*.tsx"
Get-Content -LiteralPath next.config.ts
```

Secret/env discovery:

```powershell
git status --short -- .env .env.local .env.development .env.production .vercel vercel.json
Test-Path -LiteralPath .env
rg -n "DATABASE_URL|OPENAI_API_KEY|CLERK_SECRET|SECRET_KEY|PASSWORD|TOKEN|AKIA|AIza|sk-|BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY" . -g "!node_modules/**" -g "!.next/**" -g "!package-lock.json" -g "!docs/**"
```

Database discovery:

```powershell
rg -n "model User|model AssessmentSession|model AssessmentResponse|model PsychologicalProfile|model CareerMatch|model MentorMemoryCore|model DecisionHistory|model GrowthSnapshot|model EmotionalPatternProfile|model SessionMemory|model MentorMemory" prisma/schema.prisma
rg -n "\$queryRaw|\$executeRaw|PrismaClient|findMany\(|findUnique\(|create\(|update\(|delete\(" src prisma -g "*.ts" -g "*.prisma"
```

Frontend and unsafe browser sink discovery:

```powershell
rg -n "dangerouslySetInnerHTML|innerHTML|outerHTML|insertAdjacentHTML|eval\(|new Function\(|document\.cookie|localStorage|sessionStorage" src -g "*.ts" -g "*.tsx"
```

AI/prompt discovery:

```powershell
rg -n "openai|anthropic|langchain|chat\.completions|generateText|generateObject|systemPrompt|prompt injection|prompt" src package.json -g "*.ts" -g "*.tsx" -g "package.json"
```

Logging discovery:

```powershell
rg -n "console\.(log|debug|info|warn|error)" src -g "*.ts" -g "*.tsx"
```

Route-shadow safety evidence:

```powershell
rg -n "enabled: false|captureRawPayloads: false|allowProductionEnvironment: false|allowLiveRouting: false|allowOutputReplacement: false|maxPayloadBytes|validatePayloadSafety|dataClassification|rawStudentData|realStudentData" src/intelligence/orchestrator/rollout/route-shadow -g "*.ts"
```

Worktree awareness:

```powershell
git status --short
git diff --stat
```

## 15. Evidence For Each Finding

| Finding | Evidence |
| --- | --- |
| H-01 | API route `POST` handlers at `assessment/route.ts:8` and `career-fit/route.ts:8`; no auth imports/calls; Clerk dependency present but no Clerk usage/middleware found; build exposes both routes |
| H-02 | `request.json()` casts at `assessment/route.ts:18` and `career-fit/route.ts:10`; direct pass-through of payload/config/approval/gates/metadata; no schema/rate-limit matches |
| H-03 | `localStorage.setItem` for outcome records at `outcome-store.ts:227`; demo XOR encryption comment at `outcome-store.ts:591`; export/import helpers at `outcome-store.ts:785` and `outcome-store.ts:793` |
| H-04 | `npm audit --json` reports 1 high and 3 moderate vulnerabilities |
| M-01 | Empty `next.config.ts`; no security header search results |
| M-02 | No CORS/CSRF search results for current API routes |
| M-03 | Direct production-source `console.*` evidence in confidence, outcome, and client rendering code |
| M-04 | Sensitive Prisma models at `schema.prisma:60`, `140`, `161`, `183`, `243`, `277`, `317`, `354`, `392`, `423`, `468`; no app-level privacy lifecycle APIs found |
| M-05 | Prisma schema exists; no `$queryRaw` / `$executeRaw`; no verified app/API Prisma ownership checks |
| M-06 | Prompt builder exists; active AI call is commented; no AI provider dependency found |
| M-07 | Internal provider/rollout rate concepts found, but no HTTP route limiter for API handlers |
| L-01 | `.env` exists and build loads it; `.env*` ignored; no tracked secret values confirmed |
| L-02 | `NEXT_PUBLIC_STAGING_URL` is present; no public secret found |
| L-03 | Dangerous HTML/eval search found no source matches |
| L-04 | Assessment page inspection found React state use, no direct persistence/API submission in inspected page |

## 16. Required Fixes Before Staging

1. Add authentication and authorization to `src/app/api/internal/constitutional-shadow/**`, or remove/disable those routes from staging.
2. Add request schema validation at the API boundary for route-shadow requests.
3. Add content-type validation, safe JSON parsing, request-size limits before parse where possible, and route-level rate limiting.
4. Resolve or formally risk-accept `npm audit` vulnerabilities, including Vite high severity.
5. Add staging-safe security headers: CSP, HSTS policy for HTTPS environments, frame protection, referrer policy, and permissions policy.
6. Ensure no sensitive outcome data can be stored in browser localStorage in staging user flows.
7. Add privacy-safe logging controls for identifiers, outcomes, assessment answers, and mentor/AI data.
8. Verify staging environment separation, allowed hosts, Clerk callback URLs, and public env values.
9. Re-run this audit after fixes.

## 17. Required Fixes Before Production

1. Complete all staging fixes.
2. Implement server-side user ownership checks for every future DB-backed read/write path.
3. Implement data export, deletion, retention, and consent workflows for student data.
4. Add centralized security logging with redaction and production log-level controls.
5. Add AI gateway controls before enabling real model calls: prompt sanitization, prompt injection resistance, output validation, memory isolation, and model-output storage policy.
6. Add dependency update policy, lockfile review, and CI audit gates.
7. Add deployed smoke/security checks for auth, headers, internal route protection, and secret leakage.
8. Document privacy classification and breach-impact handling for assessment, psychological, family/financial, mentor, recommendation, and outcome data.

## 18. Unknowns / Not Verified

- Actual `.env` contents were not read.
- No deployed staging URL was available for live HTTP/security-header testing.
- No Clerk dashboard configuration, callback URLs, or hosted auth settings were verified.
- No Vercel project settings, allowed-host settings, deployment protection, or preview access settings were verified.
- No database instance, row-level data, backups, or live Prisma behavior were tested.
- No runtime penetration test, fuzzing run, or load/DoS test was performed.
- No third-party vendor data processing agreements, privacy policy, consent copy, or breach process were reviewed.
- No full manual source review of every transitive dependency was performed.
- Current worktree contains many pre-existing tracked and untracked changes from earlier phases; this audit did not attempt to attribute or revert them.
