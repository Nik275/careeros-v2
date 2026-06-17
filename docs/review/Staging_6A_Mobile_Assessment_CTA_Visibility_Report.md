# STAGING-6A Mobile Assessment CTA Visibility Report

## Scope

Fixed the assessment action area so the Continue CTA remains visible and tappable on mobile while avoiding the desktop overlap regression.

No assessment questions, scoring, result intelligence, backend intelligence, Clerk/auth, internal API/security logic, database/schema/migrations, deployment config, or AI provider behavior were changed.

## Root Cause

The assessment shell used `100vh`, which can be unreliable on real mobile browser chrome, and the bottom navigation had been extended below the padded container. The footer gradient could also intercept taps over the final option before the actual Continue button was reached.

## Files Changed

- `src/app/assessment/page.tsx`
- `src/components/assessment/PsychologyQuestions.tsx`
- `src/components/assessment/QuestionCard.tsx`

## Fix Summary

- Changed the assessment page shell to use mobile dynamic viewport height with `100dvh` and `100svh`.
- Kept the footer inside the visible flex layout instead of extending it below the container.
- Moved the `1 of 5` progress counter into the safe footer area so it remains visible with the CTA.
- Made the footer background ignore pointer events while preserving button tap behavior.
- Added scroll clearance / scroll margin so the last option can be brought above the CTA.
- Tightened option-card spacing without changing labels, questions, scoring, or result logic.

## Local Gates

- `npm run typecheck:test -- --pretty false`: PASS
- `npm run typecheck:build -- --pretty false`: PASS
- `npm run build`: PASS
- `npm audit --json`: PASS, 0 vulnerabilities
- `npx vitest run src/components/assessment src/app/assessment`: PASS, 5 tests

## Viewport QA

Local production build: `http://127.0.0.1:3017/assessment`

### Mobile

- `360x740`: CTA visible/tappable, progress visible, final option tappable after scroll, advances to question 2, full synthetic flow reaches result, no horizontal overflow.
- `390x844`: CTA visible/tappable, progress visible, final option visible/tappable, no horizontal overflow.
- `400x738`: CTA visible/tappable, progress visible, final option tappable after scroll, no horizontal overflow.
- `430x932`: CTA visible/tappable, progress visible, final option visible/tappable, no horizontal overflow.

### Desktop

- `1366x768`: CTA visible/tappable, final option does not overlap CTA after selection, advances to question 2, full synthetic flow reaches result, no horizontal overflow.
- `1440x900`: CTA visible/tappable, final option clear, no horizontal overflow.
- `1920x1080`: CTA visible/tappable, final option clear, no horizontal overflow.

## Console / Privacy Check

Browser console scan found no secret/token/cookie/password/raw-payload indicators during local production QA.

## Final Verdict

MOBILE CTA VISIBILITY PASS
