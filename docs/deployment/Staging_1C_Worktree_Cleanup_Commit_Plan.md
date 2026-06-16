# Staging 1C Worktree Cleanup Commit Plan

Date: 2026-06-16
Repository: `C:\Users\a\Projects\careeros-v2`
Mission: Clean obvious local junk and prepare a safe, reviewable staging checkpoint. No deployment, Vercel configuration, real env values, or automatic commit was performed.

## Cleanup Performed

Removed as confirmed junk after inspection:

- `capture.js` - one-off Puppeteer screenshot capture script targeting local development.
- `generateWorldPoints.js` - temporary local map-data generation script. The generated app asset remains present separately.
- `original.tsx` - empty scratch file.

No production source, security source, UI source, tests, package files, deployment reports, or certification reports were reverted or removed.

## Files Kept Intentionally

- Production source changes required for the certified build and staging security posture.
- Test changes required for green `typecheck:test`.
- `package.json` and `package-lock.json` changes required by the current dependency/audit state.
- `next.config.ts`, `src/proxy.ts`, internal route protection, and security-related source files.
- Final deployment/security/checklist reports under `docs/deployment/` and `docs/security/`.
- Constitutional and architecture reports under `docs/constitutional/`.
- Final UI reports and 24 proof screenshots under `docs/ui/screenshots/`.
- `src/components/landing/worldMapData.json`, because it is consumed by `src/components/landing/CareerGlobeBackground.tsx`.

## Files Needing Human Review

The remaining checkpoint is still broad and should be staged deliberately:

- UI/product changes in `src/app/`, `src/components/assessment/`, `src/components/landing/`, and `docs/ui/`.
- Build/typecheck config changes in `tsconfig.json`, `tsconfig.build.json`, `tsconfig.test.json`, and `vitest.config.ts`.
- Security/staging changes in `next.config.ts`, `src/proxy.ts`, `src/security/`, `src/app/api/internal/constitutional-shadow/`, and deployment/security docs.
- Large source and test migrations across `src/intelligence/`, `src/domains/`, `src/data/`, `src/ontology/`, and related test suites.
- Generated constitutional reports under `docs/constitutional/` before deciding whether they belong in the checkpoint.
- `MASTER_SYSTEM_BLUEPRINT.md` and `docs/MASTER_SYSTEM_BLUEPRINT.md`, if both remain intended.
- Scripts under `scripts/constitutional/`, to confirm they are durable repo tooling rather than one-off audit helpers.

## Worktree Counts

Measured after junk cleanup and gates:

- Tracked modified files: 339
- Untracked files before this report: 972
- Untracked files after adding this report: 973
- `git status --short` entries before this report: 938
- `git diff --shortstat`: `339 files changed, 11745 insertions(+), 4745 deletions(-)`

Untracked top-level distribution before this report:

- `docs`: 579
- `src`: 387
- `scripts`: 3
- `tsconfig.build.json`: 1
- `tsconfig.test.json`: 1
- `MASTER_SYSTEM_BLUEPRINT.md`: 1

Tracked modified distribution:

- `src`: 334
- `package.json`: 1
- `package-lock.json`: 1
- `next.config.ts`: 1
- `tsconfig.json`: 1
- `vitest.config.ts`: 1

## Secret And Env Safety

Git safety checks found no tracked or dirty secret/env/build-cache artifacts among:

- `.env`
- `.env.local`
- `.env.development`
- `.env.production`
- `.env.staging`
- `.vercel`
- `.next`
- `node_modules`
- `dist`
- `out`
- `coverage`
- `*.log`
- `*.pem`
- `*.key`

Local filesystem state:

- `.env` exists locally and is not tracked or dirty.
- `.vercel` is absent.
- `.next` exists locally and is not tracked or dirty.
- `node_modules` exists locally and is not tracked or dirty.
- No dirty private keys, logs, or credential files were detected by the targeted Git checks.

## Gate Results

- `npm run typecheck:test -- --pretty false`: PASS
- `npm run typecheck:build -- --pretty false`: PASS
- `npm run build`: PASS
- `npm audit --json`: PASS, 0 vulnerabilities

## Recommended Files To Stage

Stage in coherent review groups rather than as one undifferentiated blob:

- Security and staging readiness changes: `next.config.ts`, `src/proxy.ts`, internal route/security files, `docs/security/`, and `docs/deployment/`.
- TypeScript/build certification changes: `package.json`, `package-lock.json`, `tsconfig.json`, `tsconfig.build.json`, `tsconfig.test.json`, and `vitest.config.ts`.
- Source/test contract cleanup changes needed for green gates.
- Constitutional implementation and report files that are intended to become durable repository documentation.
- UI changes and final UI proof screenshots only after confirming they are part of the intended staging checkpoint.
- `src/components/landing/worldMapData.json` with the landing globe implementation, if that UI feature is intended for staging.

## Recommended Files Not To Stage

- `.env`, `.env.local`, any `.env.*` files with real values.
- `.vercel`.
- `.next`, `node_modules`, build/cache output, coverage output.
- Private keys, logs, real credentials, database URLs, or AI provider keys.
- Any future one-off scratch scripts like the removed `capture.js` and `generateWorldPoints.js`.
- Screenshot iterations beyond the final proof set.

## Recommended Commit Message

`chore(staging): checkpoint secure staging-ready CareerOS V2`

## Final Verdict

NEEDS HUMAN REVIEW

Reason: the obvious local junk was removed and all required gates are green, but the remaining checkpoint still contains 339 tracked modifications and 973 untracked files spanning production source, tests, UI, security, configuration, generated reports, and proof artifacts. It is safe to review and stage deliberately, but not safe for an automatic checkpoint commit.
