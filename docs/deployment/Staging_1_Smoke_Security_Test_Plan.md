# Staging 1 - Smoke Security Test Plan

Date: 2026-06-16  
Repository: `C:\Users\a\Projects\careeros-v2`  
Phase: STAGING-1  
Scope: deployed staging smoke/security validation only

## Test Rules

- Use synthetic/internal test accounts only.
- Do not use real student data.
- Do not invite real users.
- Do not trigger real AI provider calls.
- Do not connect production databases.
- Do not store secrets or test outputs in public docs.

## Required Test Accounts

Create in the Clerk staging app:

| Account Type | Claim State | Expected Internal API Result |
| --- | --- | --- |
| Unauthenticated visitor | no session | rejected |
| Authenticated regular test user | no `metadata.internalAccess` claim | rejected |
| Authenticated internal test operator | `metadata.internalAccess === true` | allowed for valid synthetic internal requests |

## Page Smoke Tests

### Homepage Loads

Steps:

1. Open the staging URL.
2. Confirm the homepage responds successfully.
3. Confirm no real-user sign-up funnel is advertised as public production access.
4. Confirm no browser console output exposes secrets, tokens, raw payloads, student IDs, assessment answers, mentor data, or outcome records.

Expected result: pass.

### Assessment Page Loads

Steps:

1. Open the staging assessment page.
2. Confirm the page responds successfully.
3. Use only synthetic/test inputs if interaction is required.
4. Confirm no real student data is entered or persisted.

Expected result: pass.

## Security Header Tests

Check the staging HTTP response headers for:

- `Content-Security-Policy`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security`

Expected result: all present.

## Internal API Auth Tests

Routes:

- `/api/internal/constitutional-shadow/assessment`
- `/api/internal/constitutional-shadow/career-fit`

Payload rule:

- Use synthetic route-shadow payloads only.
- Include `synthetic: true`.
- Include payload classification `dataClassification: "SYNTHETIC"`.

### Unauthenticated Request

Steps:

1. Send a POST request without a Clerk session.
2. Use valid JSON and a synthetic payload.

Expected result:

- `401` or fail-closed `403`
- no route execution with live user data
- no raw payload echoed

### Authenticated Non-Internal User

Steps:

1. Sign in as a staging test user without `metadata.internalAccess`.
2. Send a valid synthetic POST request.

Expected result:

- `403`
- no route execution
- no raw payload echoed

### Internal-Access User

Steps:

1. Sign in as a staging internal test operator.
2. Confirm Clerk session claim has:

```text
metadata.internalAccess === true
```

3. Send a valid synthetic POST request.

Expected result:

- request succeeds only for the exact claim
- response preserves production output isolation
- `liveRoutingEnabled` remains false
- no real student data is used

### Local/Test Bypass Rejection

Steps:

1. Send the local/test bypass header used by local tests.
2. Do not include the exact Clerk internal-access claim.

Expected result:

- request rejected in staging
- local/test header does not grant access

## Internal API Boundary Tests

### Invalid Content-Type

Steps:

1. Send a POST with `content-type: text/plain`.
2. Include a synthetic body.

Expected result:

- `415`

### Malformed JSON

Steps:

1. Send a POST with `content-type: application/json`.
2. Send malformed JSON.

Expected result:

- `400`
- no raw parse error leaked

### Oversized Body

Steps:

1. Send a body larger than the configured internal route-shadow body limit.

Expected result:

- request blocked
- expected status: `413`

### Cross-Origin POST

Steps:

1. Send a POST with an `Origin` header that does not match the staging host.

Expected result:

- `403`

### Repeated Abuse / Rate Limit

Steps:

1. Send repeated synthetic requests above the allowed per-client/per-flow limit.

Expected result:

- repeated abuse is blocked
- expected status: `429`

## Browser Storage And Data Tests

### Outcome LocalStorage Persistence

Steps:

1. Use staging in normal production-like mode.
2. Exercise any outcome-related smoke flow only with synthetic data.
3. Inspect browser storage.

Expected result:

- outcome localStorage persistence is not active for production-like staging
- no real student outcomes are stored

### Real Student Data Check

Steps:

1. Confirm test operators use synthetic personas only.
2. Confirm no production import, real assessment data, real mentor messages, or real outcome records are connected.

Expected result:

- staging contains only synthetic/internal test data

## AI Activation Tests

### No Real AI Call

Steps:

1. Exercise assessment and recommendation-adjacent smoke paths.
2. Monitor server logs and provider dashboards if available.
3. Confirm no real provider credentials are configured.

Expected result:

- no OpenAI, Anthropic, Vercel AI SDK, LangChain, or other provider call occurs
- no model output is generated from staging

## Console And Log Privacy Tests

### Browser Console

Steps:

1. Open homepage.
2. Open assessment page.
3. Interact only with synthetic data.
4. Review browser console.

Expected result:

- no secrets
- no tokens
- no raw payloads
- no student IDs
- no assessment answers
- no mentor data
- no outcome data

### Server Logs

Steps:

1. Review Vercel function/proxy logs after smoke tests.

Expected result:

- no secrets
- no tokens
- no raw request bodies
- no student IDs
- no assessment answers
- no mentor data
- no outcome data
- no raw exception objects containing sensitive data

## Rollback Triggers

Immediately roll back or disable the staging deployment if:

- internal routes become accessible to unauthenticated users
- regular authenticated users can access internal routes
- local/test bypass works in staging
- production data is connected
- real student data is submitted
- real AI provider calls occur
- secrets appear in browser/server logs
- security headers are missing

## Pass Criteria

STAGING-1 smoke/security validation passes only if:

- homepage loads
- assessment page loads
- security headers are present
- unauthenticated internal API requests are rejected
- authenticated non-internal requests are rejected
- exact internal-access claim is required
- invalid content-type returns `415`
- malformed JSON returns `400`
- oversized body is blocked
- cross-origin POST is blocked
- repeated abuse is rate limited
- outcome localStorage persistence is not active
- no real AI call occurs
- no real student data is stored
- no console or server log leaks secrets or sensitive data

## Fail Criteria

Any violation above blocks staging sharing and requires rollback/remediation before continuing.
