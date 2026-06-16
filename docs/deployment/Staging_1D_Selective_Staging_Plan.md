# Staging 1D Selective Staging Plan

Date: 2026-06-16
Repository: `C:\Users\a\Projects\careeros-v2`
Purpose: prepare a dry-run selective staging plan for the staging checkpoint commit. No files were staged, committed, deployed, or configured in Vercel.

## Current Worktree Snapshot

Commands executed:

- `git status --short`
- `git diff --stat`

Measured before this report was added:

- Tracked modified files: 339
- Untracked files: 973
- `git diff --shortstat`: `339 files changed, 11745 insertions(+), 4745 deletions(-)`

This report adds one additional untracked deployment document.

## Must Commit Paths

These paths are required to reproduce the currently green build, test, security, and UI-frozen local state.

Package and config:

- `package.json`
- `package-lock.json`
- `next.config.ts`
- `tsconfig.json`
- `tsconfig.build.json`
- `tsconfig.test.json`
- `vitest.config.ts`

Security and internal API boundary:

- `src/proxy.ts`
- `src/security/`
- `src/app/api/internal/constitutional-shadow/`
- `src/app/__tests__/security-headers.test.ts`
- `src/app/__tests__/staging-security-contract.test.ts`

Frozen UI and assessment surface:

- `src/app/page.tsx`
- `src/app/assessment/page.tsx`
- `src/app/globals.css`
- `src/components/assessment/`
- `src/components/landing/`

Certified source and test-contract cleanup:

- `src/archetype/`
- `src/assessment/`
- `src/authoring/`
- `src/career-fit/`
- `src/career-intelligence/`
- `src/career-journeys/`
- `src/career-taxonomy/`
- `src/data/`
- `src/decision-intelligence/`
- `src/domains/`
- `src/future-simulation/`
- `src/intelligence/action-intelligence/`
- `src/intelligence/active-learning/`
- `src/intelligence/authorities/`
- `src/intelligence/bayesian-belief-engine/`
- `src/intelligence/calibration/`
- `src/intelligence/career-criticality/`
- `src/intelligence/career-graph/`
- `src/intelligence/career-path-intelligence/`
- `src/intelligence/career-transition-graph/`
- `src/intelligence/confidence/`
- `src/intelligence/consistency-engine/`
- `src/intelligence/constitutional/`
- `src/intelligence/counterfactual-engine/`
- `src/intelligence/criticality-engine/`
- `src/intelligence/decision/`
- `src/intelligence/decision-coalition/`
- `src/intelligence/decision-coalition-v3/`
- `src/intelligence/decision-context/`
- `src/intelligence/decision-intelligence/`
- `src/intelligence/decision-tree-engine/`
- `src/intelligence/explainability-engine/`
- `src/intelligence/founder-intelligence/`
- `src/intelligence/founder-intelligence-v2/`
- `src/intelligence/future-scenario/`
- `src/intelligence/index.ts`
- `src/intelligence/india-intelligence/`
- `src/intelligence/learning-loop/`
- `src/intelligence/market/`
- `src/intelligence/market-aware-decision/`
- `src/intelligence/market-learning/`
- `src/intelligence/market-signal-intelligence/`
- `src/intelligence/matching-engine/`
- `src/intelligence/meta-decision-engine/`
- `src/intelligence/opportunity-graph/`
- `src/intelligence/optionality-engine/`
- `src/intelligence/orchestrator/`
- `src/intelligence/outcome-learning/`
- `src/intelligence/outcome-modeling/`
- `src/intelligence/outcome-tracking/`
- `src/intelligence/path-cascade/`
- `src/intelligence/path-explorer/`
- `src/intelligence/prospect-theory-engine/`
- `src/intelligence/real-options-engine/`
- `src/intelligence/recommendation-fusion/`
- `src/intelligence/recommendation-stability/`
- `src/intelligence/regret-functional/`
- `src/intelligence/regret-prediction/`
- `src/intelligence/similarity-engine/`
- `src/intelligence/student-model/`
- `src/intelligence/validation/`
- `src/intelligence/value-of-information-engine/`
- `src/knowledge-graph/`
- `src/market-data-ingestion/`
- `src/mentor-intelligence/`
- `src/ontology/`
- `src/optionality-intelligence/`
- `src/outcome-tracking/`
- `src/profile/`
- `src/recommendation/`
- `src/regret-intelligence/`
- `src/utility-intelligence/`

## Should Commit Paths

These are useful for project history and staging handoff, but can be staged after the must-commit source/config set is reviewed.

- `docs/deployment/Staging_1_Secure_Deployment_Checklist.md`
- `docs/deployment/Staging_1_Smoke_Security_Test_Plan.md`
- `docs/deployment/Staging_1B_Worktree_Checkpoint_Report.md`
- `docs/deployment/Staging_1C_Worktree_Cleanup_Commit_Plan.md`
- `docs/deployment/Staging_1D_Selective_Staging_Plan.md`
- `docs/security/Security_1_Chief_Cybersecurity_Audit.md`
- `docs/security/Security_2_Staging_Blocker_Remediation.md`
- `docs/security/Security_3_Clean_Staging_Security_Pass.md`
- `docs/ui/UI_11_Final_UI_Freeze_Certification_Report.md`

## Do Not Commit Paths

Do not stage these in the checkpoint:

- `.env`
- `.env.local`
- `.env.*` files with real values
- `.vercel`
- `.next`
- `node_modules`
- `dist`
- `out`
- `coverage`
- `*.log`
- `*.pem`
- `*.key`
- Real credentials, production database URLs, production data, or AI provider keys
- Removed scratch files: `capture.js`, `generateWorldPoints.js`, `original.tsx`
- Future one-off screenshot capture scripts or local scratch files
- Screenshot iterations beyond the approved final proof set
- Old intermediate generated reports if redundant for repository history

## Needs Human Review Paths

Review before staging:

- `docs/constitutional/` - 530 untracked generated constitutional/build-cert reports. Default plan excludes this directory because it is large and likely contains intermediate report history.
- `docs/ui/screenshots/` - 24 untracked UI proof screenshots. Keep only if the final visual proof set belongs in Git history.
- `docs/ui/UI_1_*` through `docs/ui/UI_9_*` - intermediate UI iteration reports. Default plan commits only the final UI freeze report.
- `docs/CAREEROS_CURRENT_UPDATE_PHASE_6_6_AY.md` - useful status report, but not required for staging runtime.
- `docs/MASTER_SYSTEM_BLUEPRINT.md` and `MASTER_SYSTEM_BLUEPRINT.md` - duplicate blueprint locations need owner confirmation.
- `scripts/constitutional/check-staging-deployment-readiness.ts`
- `scripts/constitutional/run-deployed-staging-shadow-smoke.ts`
- `scripts/constitutional/verify-staging-shadow-url.ts`
- `src/intelligence/orchestrator/rollout/` - included in the must-commit source plan because current certification references rollout readiness, but it contains 199 untracked files and should receive special review before approval.

## Exact Proposed Git Add Commands

Dry-run only. These commands were not executed.

Default checkpoint source/config/security/UI staging:

```powershell
git add -- package.json package-lock.json next.config.ts tsconfig.json tsconfig.build.json tsconfig.test.json vitest.config.ts
git add -- src/proxy.ts src/security/ src/app/api/internal/constitutional-shadow/ src/app/__tests__/security-headers.test.ts src/app/__tests__/staging-security-contract.test.ts
git add -- src/app/page.tsx src/app/assessment/page.tsx src/app/globals.css src/components/assessment/ src/components/landing/
git add -- src/archetype/ src/assessment/ src/authoring/ src/career-fit/ src/career-intelligence/ src/career-journeys/ src/career-taxonomy/ src/data/ src/decision-intelligence/ src/domains/ src/future-simulation/
git add -- src/intelligence/action-intelligence/ src/intelligence/active-learning/ src/intelligence/authorities/ src/intelligence/bayesian-belief-engine/ src/intelligence/calibration/ src/intelligence/career-criticality/ src/intelligence/career-graph/ src/intelligence/career-path-intelligence/ src/intelligence/career-transition-graph/ src/intelligence/confidence/ src/intelligence/consistency-engine/ src/intelligence/constitutional/ src/intelligence/counterfactual-engine/ src/intelligence/criticality-engine/
git add -- src/intelligence/decision/ src/intelligence/decision-coalition/ src/intelligence/decision-coalition-v3/ src/intelligence/decision-context/ src/intelligence/decision-intelligence/ src/intelligence/decision-tree-engine/ src/intelligence/explainability-engine/ src/intelligence/founder-intelligence/ src/intelligence/founder-intelligence-v2/ src/intelligence/future-scenario/ src/intelligence/index.ts src/intelligence/india-intelligence/ src/intelligence/learning-loop/
git add -- src/intelligence/market/ src/intelligence/market-aware-decision/ src/intelligence/market-learning/ src/intelligence/market-signal-intelligence/ src/intelligence/matching-engine/ src/intelligence/meta-decision-engine/ src/intelligence/opportunity-graph/ src/intelligence/optionality-engine/ src/intelligence/orchestrator/
git add -- src/intelligence/outcome-learning/ src/intelligence/outcome-modeling/ src/intelligence/outcome-tracking/ src/intelligence/path-cascade/ src/intelligence/path-explorer/ src/intelligence/prospect-theory-engine/ src/intelligence/real-options-engine/ src/intelligence/recommendation-fusion/ src/intelligence/recommendation-stability/ src/intelligence/regret-functional/ src/intelligence/regret-prediction/ src/intelligence/similarity-engine/ src/intelligence/student-model/ src/intelligence/validation/ src/intelligence/value-of-information-engine/
git add -- src/knowledge-graph/ src/market-data-ingestion/ src/mentor-intelligence/ src/ontology/ src/optionality-intelligence/ src/outcome-tracking/ src/profile/ src/recommendation/ src/regret-intelligence/ src/utility-intelligence/
```

Recommended documentation staging:

```powershell
git add -- docs/deployment/Staging_1_Secure_Deployment_Checklist.md docs/deployment/Staging_1_Smoke_Security_Test_Plan.md docs/deployment/Staging_1B_Worktree_Checkpoint_Report.md docs/deployment/Staging_1C_Worktree_Cleanup_Commit_Plan.md docs/deployment/Staging_1D_Selective_Staging_Plan.md
git add -- docs/security/Security_1_Chief_Cybersecurity_Audit.md docs/security/Security_2_Staging_Blocker_Remediation.md docs/security/Security_3_Clean_Staging_Security_Pass.md
git add -- docs/ui/UI_11_Final_UI_Freeze_Certification_Report.md
```

Optional final UI proof screenshots, only if approved:

```powershell
git add -- docs/ui/screenshots/desktop-1366-assessment-progress.png docs/ui/screenshots/desktop-1366-assessment-question.png docs/ui/screenshots/desktop-1366-assessment-start.png docs/ui/screenshots/desktop-1366-landing.png
git add -- docs/ui/screenshots/desktop-1440-assessment-progress.png docs/ui/screenshots/desktop-1440-assessment-question.png docs/ui/screenshots/desktop-1440-assessment-start.png docs/ui/screenshots/desktop-1440-landing.png
git add -- docs/ui/screenshots/desktop-1920-assessment-progress.png docs/ui/screenshots/desktop-1920-assessment-question.png docs/ui/screenshots/desktop-1920-assessment-start.png docs/ui/screenshots/desktop-1920-landing.png
git add -- docs/ui/screenshots/mobile-360-assessment-progress.png docs/ui/screenshots/mobile-360-assessment-question.png docs/ui/screenshots/mobile-360-assessment-start.png docs/ui/screenshots/mobile-360-landing.png
git add -- docs/ui/screenshots/mobile-390-assessment-progress.png docs/ui/screenshots/mobile-390-assessment-question.png docs/ui/screenshots/mobile-390-assessment-start.png docs/ui/screenshots/mobile-390-landing.png
git add -- docs/ui/screenshots/mobile-430-assessment-progress.png docs/ui/screenshots/mobile-430-assessment-question.png docs/ui/screenshots/mobile-430-assessment-start.png docs/ui/screenshots/mobile-430-landing.png
```

Optional staging smoke helper scripts, only if approved as durable repo tooling:

```powershell
git add -- scripts/constitutional/check-staging-deployment-readiness.ts scripts/constitutional/run-deployed-staging-shadow-smoke.ts scripts/constitutional/verify-staging-shadow-url.ts
```

Explicitly excluded from the default plan:

```powershell
# Do not run for the default checkpoint:
# git add -- docs/constitutional/
# git add -- docs/ui/
# git add -- MASTER_SYSTEM_BLUEPRINT.md docs/MASTER_SYSTEM_BLUEPRINT.md
# git add -A
# git add .
```

## Proposed Commit Message

`chore(staging): checkpoint secure staging-ready CareerOS V2`

## Gate Results

- `npm run typecheck:test -- --pretty false`: PASS
- `npm run typecheck:build -- --pretty false`: PASS
- `npm run build`: PASS
- `npm audit --json`: PASS, 0 vulnerabilities

## Secret And Env Safety

Targeted Git checks found no tracked or dirty risky files for:

- `.env`
- `.env.local`
- `.vercel`
- `.next`
- `node_modules`
- `*.log`
- `*.pem`
- `*.key`

Known local state:

- `.env` exists locally but is not tracked or dirty.
- `.vercel` is absent.
- `.next` and `node_modules` exist locally but are not tracked or dirty.
- No real env values, credentials, production data, database URLs, or AI provider keys are included in the proposed staging commands.

## Final Verdict

READY FOR USER APPROVAL TO STAGE FILES

The default staging plan is explicit and excludes known risky files, cache/build artifacts, generated constitutional report bulk, scripts, screenshots, and duplicate blueprint files unless separately approved. No staging or commit has been performed.
